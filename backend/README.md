# FutBot Backend

Backend para Chatbot Especializado em Futebol com Gemini AI e WebSocket.

## 🎯 Sobre

FutBot é um chatbot especializado em futebol que utiliza a API do Google Gemini para fornecer respostas inteligentes sobre futebol, com suporte a busca na web e proteção contra prompt injection.

## 📋 Pré-requisitos

- Node.js 20+ 
- npm ou yarn
- Google API Key (com acesso ao Gemini)
- Docker (opcional)

## 🚀 Instalação

### Local

1. **Clone o repositório**
```bash
git clone git@github.com:wilson-castro/futbot.git
cd futbot/backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=8081
GOOGLE_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
GEMINI_CLASSIFIER_MODEL=gemini-2.5-flash-lite
GEMINI_TEMPERATURE=0.3
ENABLE_GOOGLE_SEARCH=true
MAX_PROMPT_LENGTH=1000
LOG_LEVEL=debug
NODE_ENV=development
```

4. **Execute o servidor**

```bash
# Desenvolvimento (com reload automático)
npm run dev

# Produção
npm run build
npm start
```

### Docker

```bash
docker-compose up --build
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── server.ts              # Entrada principal
│   ├── config/
│   │   └── env.ts             # Validação de variáveis de ambiente
│   ├── services/
│   │   ├── gemini.service.ts  # Integração com Gemini
│   │   └── classifier.service.ts # Classificador de mensagens
│   ├── security/
│   │   ├── football-entities.ts    # Dados de times e competições
│   │   ├── football-filter.ts      # Análise de contexto futebol
│   │   ├── prompt-sanitizer.ts     # Detecção de prompt injection
│   │   └── security-analyzer.ts    # Orquestrador de segurança
│   ├── sockets/
│   │   └── chat.socket.ts     # Handler do WebSocket
│   └── data/
│       ├── competitions.json   # Lista de competições
│       └── football_terms.json # Termos de futebol
├── tests/
│   ├── api.test.ts            # Testes da API
│   └── websocket.test.ts      # Testes do WebSocket
├── package.json
├── tsconfig.json
├── jest.config.ts
└── Dockerfile
```

## 📜 Scripts Disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento
npm run build            # Compila TypeScript para JavaScript
npm start                # Inicia servidor compilado
npm run lint             # Executa ESLint
npm run lint:fix         # Fixa problemas de linting automaticamente
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação
npm run check            # Executa lint e format:check
npm test                 # Executa testes com Jest
npm run prepare          # Setup de husky (git hooks)
```

## 🔌 WebSocket API

### Conectar
```javascript
const ws = new WebSocket('ws://localhost:8081/chat');
```

### Enviar Mensagem
```javascript
ws.send(message); // string com a mensagem
```

### Receber Respostas

O servidor envia diferentes tipos de mensagens JSON:

```javascript
// Token de resposta (streaming)
{
  type: 'token',
  content: 'texto do token'
}

// Erro
{
  type: 'error',
  message: 'descrição do erro'
}

// Conclusão
{
  type: 'done'
}

// Mensagem de redirecionamento
{
  type: 'message',
  message: 'Posso responder apenas perguntas relacionadas ao futebol.'
}
```

## 🛡️ Segurança

### Fluxo de Validação

1. **Classificação**: A mensagem é classificada usando Gemini
   - `FOOTBALL`: Mensagem relacionada a futebol
   - `PROMPT_INJECTION`: Tentativa de manipulação
   - `OTHER`: Fora do escopo

2. **Análise de Prompt Injection**: Detecção de padrões comuns de ataque

3. **Filtro de Contexto**: Análise de termos de futebol, times e competições

## 🔧 Configuração Avançada

### Modelos Gemini

```env
# Modelo principal para respostas
GEMINI_MODEL=gemini-2.5-flash

# Modelo otimizado para classificação (mais rápido)
GEMINI_CLASSIFIER_MODEL=gemini-2.5-flash-lite

# Temperatura (criatividade)
# 0.0 = determinístico, 1.0 = criativo
GEMINI_TEMPERATURE=0.3
```

### Recursos

```env
ENABLE_GOOGLE_SEARCH=true      # Busca na web integrada
ENABLE_CHAT_HISTORY=true       # Histórico de conversa
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch
npm test -- --watch

# Com cobertura
npm test -- --coverage
```

## 📦 Build e Deploy

### Build Local

```bash
npm run build
# Gera a saída em: dist/
```

### Build com Docker

```bash
docker build -f backend/Dockerfile -t futbot-backend:latest .
```

### Executar com Docker

```bash
docker run -p 8081:8081 \
  -e GOOGLE_API_KEY=sua_chave \
  -e NODE_ENV=production \
  futbot-backend:latest
```

## 🔍 Troubleshooting

### "Missing environment variable: GOOGLE_API_KEY"
- Certifique-se de que `.env` está configurado
- Verifique se a chave da API é válida

### Conexão WebSocket falha
- Verifique se o servidor está rodando em `localhost:8081`
- Confira se a porta não está bloqueada por firewall
- Em produção, use `wss://` (WebSocket Secure)

### Respostas lentas do Gemini
- Aumente o timeout em `jest.config.ts` se necessário
- Verifique a cota de uso da API do Google
- Reduza a frequência de requisições se estiver em rate-limit

## 📝 Variáveis de Ambiente Completas

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | 3000 | Porta do servidor |
| `GOOGLE_API_KEY` | - | **Requerido** - Chave da API Google |
| `GEMINI_MODEL` | gemini-2.5-flash | Modelo para respostas |
| `GEMINI_CLASSIFIER_MODEL` | gemini-2.5-flash-lite | Modelo para classificação |
| `GEMINI_TEMPERATURE` | 0.3 | Temperatura do modelo (0-1) |
| `ENABLE_GOOGLE_SEARCH` | true | Ativar busca na web |
| `MAX_PROMPT_LENGTH` | 1000 | Comprimento máximo da mensagem |
| `LOG_LEVEL` | debug | Nível de logging |
| `NODE_ENV` | development | Ambiente (development/production) |

## 🏗️ Arquitetura

### Camadas

```
WebSocket Layer (chat.socket.ts)
    ↓
Classification Layer (classifier.service.ts)
    ↓
Security Analysis (security-analyzer.ts)
    ↓
Gemini Service (gemini.service.ts)
    ↓
Response Streaming
```

## 📄 Licença

ISC

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para amantes de futebol**
