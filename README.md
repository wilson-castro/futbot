# FutBot ⚽🤖

Chatbot especializado em futebol com respostas geradas pelo Google Gemini, streaming via WebSocket e proteção contra prompt injection.

O projeto é um **monorepo** com dois serviços:

| Serviço    | Stack                     | Porta (local) | Pasta       |
|------------|---------------------------|---------------|-------------|
| `backend`  | Fastify + WebSocket + Gemini | `8081`     | `backend/`  |
| `frontend` | Next.js 15 + React 19     | `3000`        | `frontend/` |

O frontend conecta ao backend por WebSocket no caminho **`/v1/chat`**.

---

## 📋 Pré-requisitos

- **Node.js 20+** (imagens Docker usam Node 22/24)
- **npm**
- **Google API Key** com acesso ao Gemini — obtenha em https://aistudio.google.com/apikey
- **Docker** e **Docker Compose** (apenas para o ambiente conteinerizado)

---

## 🌎 Ambientes de execução

Há dois modos de rodar o FutBot. Escolha conforme o objetivo:

| Ambiente                     | Quando usar                          | Como subir                  |
|------------------------------|--------------------------------------|-----------------------------|
| **Desenvolvimento (local)**  | Codar com reload automático          | `npm run dev` em cada serviço |
| **Produção (Docker Compose)**| Rodar a stack completa, igual ao deploy | `docker compose up --build` |

---

## 🛠️ Ambiente de Desenvolvimento (local)

Rode o backend e o frontend em **terminais separados**, sem Docker. Ideal para desenvolvimento com hot-reload.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # edite e preencha GOOGLE_API_KEY
npm run dev                 # nodemon + ts-node, reload automático
```

O backend sobe em `ws://localhost:8081/v1/chat`.

> ℹ️ A porta do backend em modo local é **fixa em 8081** (definida em `src/server.ts`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # Next.js dev server
```

Abra http://localhost:3000.

Garanta que o `.env` do frontend aponte para o backend local:

```env
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8081/v1/chat
```

---

## 🐳 Ambiente de Produção (Docker Compose)

Sobe backend + frontend já compilados, em rede isolada e com healthchecks. Executado a partir da **raiz do projeto**.

### 1. Configure o ambiente

```bash
cp .env.example .env
```

Edite o `.env` da raiz:

```env
# Obrigatório
GOOGLE_API_KEY=sua-api-key-do-google

# Opcional (valores padrão mostrados)
NODE_ENV=production
GEMINI_MODEL=gemini-2.0-flash-lite
ENABLE_GOOGLE_SEARCH=false

# Portas expostas no host
BACKEND_PORT=8001      # mapeada para 8081 dentro do container
FRONTEND_PORT=3000

# URL do WebSocket usada pelo navegador.
# Deve apontar para a porta EXTERNA do backend (BACKEND_PORT).
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8001/v1/chat
```

> ⚠️ **Atenção às portas no Docker:** o backend escuta em `8081` *dentro* do container, mas é publicado no host em `BACKEND_PORT` (padrão `8001`). Como o `NEXT_PUBLIC_WS_URL` é resolvido pelo **navegador**, ele precisa usar a porta externa (`8001`), e não `8081`.

### 2. Suba a stack

```bash
docker compose up --build
```

- Frontend: http://localhost:3000 (ou `FRONTEND_PORT`)
- Backend (WebSocket): `ws://localhost:8001/v1/chat` (ou `BACKEND_PORT`)

O frontend só inicia depois que o healthcheck do backend passa.

### 3. Parar / remover

```bash
docker compose down
```

---

## ⚙️ Variáveis de ambiente

### Backend (`backend/.env`)

| Variável                  | Padrão                  | Descrição                                  |
|---------------------------|-------------------------|--------------------------------------------|
| `GOOGLE_API_KEY`          | —                       | **Obrigatório** – chave da API Google      |
| `GEMINI_MODEL`            | `gemini-2.5-flash`      | Modelo usado nas respostas                 |
| `GEMINI_CLASSIFIER_MODEL` | `gemini-2.5-flash-lite` | Modelo usado na classificação              |
| `GEMINI_TEMPERATURE`      | `0.3`                   | Criatividade do modelo (0–1)               |
| `ENABLE_GOOGLE_SEARCH`    | `true`                  | Ativa a busca web do Gemini                |
| `MAX_PROMPT_LENGTH`       | `1000`                  | Tamanho máximo da mensagem                 |
| `NODE_ENV`                | `development`           | `development` ou `production`              |

### Frontend (`frontend/.env`)

| Variável                | Padrão            | Descrição                                                |
|-------------------------|-------------------|----------------------------------------------------------|
| `NEXT_PUBLIC_WS_URL`    | —                 | URL completa do WebSocket (tem prioridade sobre as demais) |
| `NEXT_PUBLIC_WS_HOST`   | host da página    | Host do backend (modo granular)                          |
| `NEXT_PUBLIC_WS_PORT`   | `8001`            | Porta do backend (modo granular)                         |
| `NEXT_PUBLIC_WS_PATH`   | `/v1/ws/chat`     | Caminho do WebSocket (modo granular)                     |

> Com Docker Compose, as variáveis de porta e a `GOOGLE_API_KEY` são lidas do `.env` da **raiz**, não dos `.env` de cada serviço.

---

## 🧪 Testes

Cada serviço tem sua própria suíte. Todos os testes rodam **offline** — a API do
Gemini e o WebSocket são mockados, então não é preciso `GOOGLE_API_KEY` real nem
serviços no ar.

```bash
# Backend (Jest + ts-jest): unitários + integração do WebSocket
cd backend && npm test

# Frontend (Jest + Testing Library): libs, hook e componentes
cd frontend && npm test
```

Cobertura: `npm run test:coverage` em cada serviço.

| Serviço    | Stack de teste                       | O que cobre                                             |
|------------|--------------------------------------|--------------------------------------------------------|
| `backend`  | Jest, ts-jest, @fastify/websocket    | Segurança/sanitização, serviços Gemini (mock), socket  |
| `frontend` | Jest, Testing Library, jsdom         | Resolução de URL/reconexão, handlers, hook e UI        |

---

## 📚 Documentação adicional

- [`backend/README.md`](backend/README.md) — API WebSocket, fluxo de segurança, arquitetura e scripts do backend.

---

**Desenvolvido com ❤️ para amantes de futebol**
