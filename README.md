# FutBot - Chatbot Esportivo

## Arquitetura

- **Frontend**: Next.js 15 + React 19 + TypeScript (Tailwind CSS)
- **Backend**: Fastify + WebSocket + TypeScript
- **LLM**: Ollama com modelo qwen2.5:1.5b
- **Containerização**: Docker + Docker Compose

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)

## Instalação e Execução

### Opção 1: Com Docker Compose (Recomendado)

```bash
# Navegar para a pasta raiz do projeto
cd /path/to/futbot

# Iniciar toda a stack (Frontend, Backend, Ollama)
docker-compose up --build

# Acessar a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
```

**Nota:** Docker Compose usa arquivos centralizados em `docker/`

Veja [docker/README.md](docker/README.md) para configurações avançadas.

### Opção 2: Desenvolvimento Local

#### Backend

```bash
cd backend

# Instalar dependências
npm install

# Desenvolvimento (com hot-reload)
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Desenvolvimento (com hot-reload)
npm run dev

# Build para produção
npm run build
npm start
```

#### Ollama

```bash
# Instalar Ollama em http://localhost:11434

# Em outro terminal, iniciar o Ollama
ollama serve

# Em outro terminal, fazer pull do modelo
ollama pull qwen2.5:1.5b
```

## Configuração

### Backend

**Arquivo**: `.env`

```env
NODE_ENV=development
OLLAMA_URL=http://ollama:11434
MODEL_NAME=qwen2.5:1.5b
```

Em produção com Docker, use:

```env
NODE_ENV=production
OLLAMA_URL=http://ollama:11434
MODEL_NAME=qwen2.5:1.5b
```

## Comunicação WebSocket

### Conexão

O frontend se conecta ao backend em:
- Desenvolvimento: `ws://localhost:8001/v1/ws/chat`
- Com Docker: `ws://localhost:8001/v1/ws/chat` (automático)

### Protocolo de Mensagens

#### Cliente → Servidor
Enviar texto simples como string:
```javascript
websocket.send("Qual é o placar de Brasil vs Argentina?");
```

#### Servidor → Cliente
O servidor envia mensagens JSON:

```json
// Token de resposta
{
  "type": "token",
  "content": "texto_do_token"
}

// Fim da resposta
{
  "type": "done"
}

// Erro
{
  "type": "error",
  "message": "Descrição do erro"
}
```

## Estrutura do Projeto

```
futbot/
├── docker/                    # 🐳 Docker centralizado (NOVO)
│   ├── docker-compose.yml     # Desenvolvimento
│   ├── docker-compose.prod.yml # Produção
│   ├── .env.example           # Variáveis de exemplo
│   ├── .dockerignore.*        # Otimizações
│   ├── compose.sh             # Script auxiliar
│   └── README.md              # Documentação Docker
│
├── frontend/                  # Next.js 15 + React 19
│   ├── src/
│   │   ├── app/              # Rotas e layout
│   │   └── components/       # Componentes React
│   ├── Dockerfile
│   ├── docker-compose.yml    # DEPRECATED
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                   # Fastify + WebSocket
│   ├── src/
│   │   ├── server.ts         # Configuração Fastify
│   │   ├── services/         # Serviços (Ollama)
│   │   └── websocket/        # Handlers WebSocket
│   ├── docker/
│   │   └── docker-compose.yml # DEPRECATED
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml         # Wrapper para raiz
├── README.md
├── DOCKER-ORGANIZATION.md     # Guia de organização Docker
└── [outros arquivos...]
```

## Fluxo de Funcionamento

1. **Usuário escreve mensagem** no chat frontend
2. **Frontend envia via WebSocket** para o backend em `/v1/ws/chat`
3. **Backend recebe** a mensagem e a envia ao Ollama
4. **Ollama processa** e retorna tokens de resposta em streaming
5. **Backend envia tokens** ao frontend via WebSocket em tempo real
6. **Frontend renderiza** cada token conforme chega (efeito de digitação)
7. **Servidor envia "done"** quando a resposta termina
