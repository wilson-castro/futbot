# 🏗️ Arquitetura FutBot Chat

## Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet / Usuário                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP GET
                  ▼
         ┌────────────────┐
         │  Port: 3000    │
         │   FRONTEND     │
         │ (Next.js + React)
         └────────┬───────┘
                  │
                  │ WebSocket Upgrade
                  │ ws://localhost:8001/v1/ws/chat
                  ▼
         ┌────────────────────┐
         │   Port: 8001       │
         │ BACKEND (Fastify)  │
         │  + WebSocket       │
         │  + CORS enabled    │
         └────────┬───────────┘
                  │
                  │ HTTP POST
                  │ /api/generate
                  ▼
         ┌────────────────────┐
         │   Port: 11434      │
         │  OLLAMA SERVICE    │
         │ Model: qwen2.5:1.5b│
         └────────────────────┘
```

## Stack Completo com Docker

```
┌─────────────────────────────────────────────────────────┐
│              Docker Network: futbot-network             │
│                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐│
│  │   Frontend    │  │   Backend     │  │    Ollama     ││
│  │              │  │               │  │               ││
│  │ Next.js:3000 │◄─►Fastify:8001  │◄─►:11434        ││
│  │   React 19   │  │ WebSocket     │  │ qwen2.5:1.5b  ││
│  │ TypeScript   │  │ TypeScript    │  │               ││
│  │ Tailwind CSS │  │ undici        │  │               ││
│  └───────────────┘  └───────────────┘  └───────────────┘│
│                                                         │
│  Volumes:                                               │
│  └─ ollama_data (persistência do modelo)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Fluxo de Requisição WebSocket

```
1. CONEXÃO INICIAL
   Frontend                          Backend
   │                                  │
   ├─ new WebSocket(ws://...) ───────>│ register socket
   │                                  │
   │                                  ├─ socket.on('connection')
   │                                  │
   │<─────────── Connection OK ────────┤
   │
   └─ setIsConnected(true)

2. ENVIAR MENSAGEM
   Frontend                Backend              Ollama
   │                       │                     │
   ├─ ws.send("Olá") ─────>│ socket.on('message')│
   │                       │                     │
   │                       ├─ streamChat() ─────>│ /api/generate
   │                       │                     │
   │                       │<─ token stream ─────┤
   │                       │
   │<─ {type:'token'} ─────┤
   │   {content:'text'}    │
   │                       │
   │<─ {type:'token'} ─────┤ (múltiplos)
   │                       │
   │<─ {type:'done'} ──────┤
   │
   └─ renderizar resposta

3. TRATAMENTO DE ERRO
   Frontend                Backend
   │                       │
   ├─ ws.send("...") ─────>│
   │                       │
   │                       ├─ catch error
   │                       │
   │<─ {type:'error'} ─────┤
   │   {message:'...'}     │
   │
   └─ exibir erro
```

## Ciclo de Vida de uma Mensagem

```
USER INPUT
   │
   ▼
Input Component
   │ onChange
   ▼
setInput(value)
   │
   ▼ User clicks "Send"
handleSendMessage()
   │
   ├─ 1. Validar input (não vazio, conectado)
   │
   ├─ 2. Criar Message (user-side)
   │
   ├─ 3. Adicionar ao state (setMessages)
   │
   ├─ 4. Criar placeholder bot-side (empty text)
   │
   ├─ 5. Limpar input (setInput(''))
   │
   ├─ 6. setIsLoading(true)
   │
   ├─ 7. ws.send(message)
   │      │
   │      ▼ Network
   │      Backend receives
   │      │
   │      ├─ streamChat(prompt, onToken)
   │      │   │
   │      │   ├─ request to Ollama
   │      │   │
   │      │   ├─ for each chunk
   │      │   │   │
   │      │   │   ├─ parse JSON
   │      │   │   │
   │      │   │   ├─ if json.response
   │      │   │   │   │
   │      │   │   │   ├─ socket.send({
   │      │   │   │   │     type:'token',
   │      │   │   │   │     content:json.response
   │      │   │   │   │   })
   │      │   │   │   │
   │      │   │   │   ▼ Frontend receives token
   │      │   │   │   │
   │      │   │   │   ├─ Parse JSON
   │      │   │   │   │
   │      │   │   │   ├─ setMessages (update last bot message)
   │      │   │   │   │   text += token.content
   │      │   │   │   │
   │      │   │   │   └─ Render token (efeito de digitação)
   │      │   │   │
   │      │   │   └─ next chunk
   │      │   │
   │      │   └─ End of stream
   │      │       │
   │      │       └─ socket.send({type:'done'})
   │      │           │
   │      │           ▼ Frontend receives done
   │      │           │
   │      │           └─ setIsLoading(false)
   │      │               Enable input
   │      │               Button = "Enviar"
   │
   └─ scrollToBottom()
      Auto-scroll para última mensagem
```

## Estrutura de Diretórios

```
futbot/
│
├── 📄 README.md .......................... Documentação completa
├── 📄 QUICKSTART.md ...................... Início rápido
├── 📄 API.md ............................. Documentação WebSocket
├── 📄 VALIDATION.md ...................... Checklist validação
├── 📄 IMPLEMENTATION.md .................. Sumário implementação
├── 📄 ARCHITECTURE.md .................... Este arquivo
├── 📄 docker-compose.yml ................. Stack completo (raiz)
│
├── 📁 frontend/ .......................... Next.js + React
│   ├── 📄 Dockerfile
│   ├── 📄 docker-compose.yml ............ Stack local (frontend + backend)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.ts
│   ├── 📄 postcss.config.js
│   │
│   └── src/
│       ├── app/
│       │   ├── layout.tsx .............. Root layout + metadata
│       │   ├── page.tsx ............... Home page
│       │   └── globals.css ............ Estilos globais
│       │
│       └── components/
│           └── FutbotChat.tsx ......... ⭐ Chat com WebSocket
│               Features:
│               - Conexão WebSocket
│               - Gerenciamento de mensagens
│               - Streaming de resposta
│               - UI com Tailwind
│               - Indicador de status
│               - Loading state
│               - Tratamento de erros
│
├── 📁 backend/ .......................... Fastify + Node.js
│   ├── 📄 Dockerfile ................... Build e produção
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 jest.config.ts
│   ├── 📄 .env ......................... Configuração (atualizado)
│   ├── 📄 .env.example ................. Exemplo (atualizado)
│   │
│   ├── docker/
│   │   └── docker-compose.yml ......... Dados técnicos
│   │       (Obsoleto, usar raiz)
│   │
│   ├── src/
│   │   ├── server.ts .................. Configuração Fastify
│   │   │   ├── CORS habilitado
│   │   │   ├── WebSocket registrado
│   │   │   └── Port 8001
│   │   │
│   │   ├── services/
│   │   │   └── ollama.service.ts ...... Integração Ollama
│   │   │       ├── streamChat() function
│   │   │       ├── Streaming com undici
│   │   │       ├── JSON parsing
│   │   │       └── Token extraction
│   │   │
│   │   └── websocket/
│   │       └── chat.socket.ts ......... Handler WebSocket
│   │           ├── registerChatSocket() function
│   │           ├── socket.on('message')
│   │           ├── streamChat integration
│   │           ├── Token sending
│   │           ├── Done signal
│   │           └── Error handling
│   │
│   └── tests/
│       ├── api.test.ts ................ Testes antigos
│       └── websocket.test.ts .......... Testes WebSocket
│           ├── Conexão
│           ├── Protocolo
│           ├── Streaming
│           ├── Múltiplas mensagens
│           ├── Validação entrada
│           ├── Tratamento erros
│           └── Reconexão
```

## Comunicação Entre Componentes

```
FutbotChat Component
│
├─ useState
│  ├─ messages: Message[] ........... Array de mensagens do chat
│  ├─ input: string ................ Texto do input
│  ├─ isLoading: boolean ........... Aguardando resposta
│  └─ isConnected: boolean ......... Status WebSocket
│
├─ useRef
│  ├─ websocketRef: WebSocket ...... Referência ao socket
│  └─ messagesEndRef: HTMLDiv ...... Para auto-scroll
│
├─ useEffect (conexão)
│  ├─ new WebSocket()
│  ├─ onopen ...................... setIsConnected(true)
│  ├─ onmessage
│  │  ├─ if token: append to last message
│  │  ├─ if done: setIsLoading(false)
│  │  └─ if error: add error message
│  ├─ onerror
│  ├─ onclose ..................... setIsConnected(false)
│  └─ cleanup: ws.close()
│
├─ useEffect (scroll)
│  └─ scrollIntoView quando messages mudam
│
├─ handleSendMessage
│  ├─ Validações
│  ├─ addMessage(user message)
│  ├─ addMessage(bot placeholder)
│  ├─ setInput('')
│  ├─ setIsLoading(true)
│  ├─ ws.send(message)
│  └─ scrollToBottom()
│
└─ Render
   ├─ Header com status indicator
   ├─ Chat messages container
   │  ├─ User messages (blue, right)
   │  └─ Bot messages (gray, left)
   ├─ Loading animation
   └─ Input form
      ├─ Input text disabled={!connected or loading}
      └─ Send button disabled={!connected or loading}
```

## Fluxo de Estado

```
Initial State
│
├─ messages: []
├─ input: ""
├─ isLoading: false
├─ isConnected: false
│
▼

User opens app
│
├─ WebSocket connects
├─ isConnected = true
├─ Input enabled
│
▼

User types message
│
└─ input = "user text"
│
▼

User clicks "Send"
│
├─ addMessage(user message)
├─ addMessage(bot placeholder "")
├─ isLoading = true
├─ input = ""
├─ Button disabled
├─ Input disabled
├─ ws.send(text)
│
▼

Backend processes
│
├─ Ollama receives prompt
├─ Generates response
│
▼

Streaming response
│
├─ onmessage: token received
├─ Last bot message text += token
├─ Update state
├─ Auto-scroll
│
▼

Response complete
│
├─ onmessage: done received
├─ isLoading = false
├─ Button enabled
├─ Input enabled
│
▼

Ready for next message
```