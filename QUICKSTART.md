# ⚡ Quick Start - FutBot

## 🚀 Docker (30 segundos)

```bash
cd futbot
docker-compose up --build
# Abrir: http://localhost:3000
```

Pronto! 🎉

## 🖥️  Desenvolvimento Local

### 1. Instalar Ollama

Baixe em https://ollama.ai

```bash
# Baixar modelo
ollama pull qwen2.5:1.5b

# Iniciar servidor
ollama serve
```

### 2. Backend (novo terminal)

```bash
cd backend
npm install
npm run dev  # Port: 8001
```

### 3. Frontend (novo terminal)

```bash
cd frontend
npm install
npm run dev  # Port: 3000
```

Acesse: http://localhost:3000

## 📁 Estrutura Docker

A partir de agora, **todos os docker-compose estão centralizados em `docker/`**:

```
docker/
├── docker-compose.yml ........ Desenvolvimento
├── docker-compose.prod.yml ... Produção
├── .env.example ............ Variáveis
├── .dockerignore.* ......... Arquivos ignore
├── compose.sh .............. Script auxiliar
└── README.md ............... Documentação
```

**Comandos antigos funcionam da raiz:**
```bash
docker-compose up --build  # Usa docker/docker-compose.yml automaticamente
```

**Ou use o script auxiliar:**
```bash
./docker/compose.sh up dev      # Desenvolvimento
./docker/compose.sh up prod     # Produção
./docker/compose.sh down dev    # Parar
```

## 📊 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| [docker/docker-compose.yml](docker/docker-compose.yml) | Config desenvolvimento |
| [docker/docker-compose.prod.yml](docker/docker-compose.prod.yml) | Config produção |
| [docker/.env.example](docker/.env.example) | Variáveis de exemplo |
| [docker/README.md](docker/README.md) | Guia Docker completo |

## 🔧 Configuração

```bash
# Copiar arquivo de exemplo
cp docker/.env.example docker/.env

# Editar conforme necessário
nano docker/.env
```

Variáveis principais:
- `PROJECT_NAME` - Nome do projeto
- `NODE_ENV` - Ambiente (development/production)
- `FRONTEND_PORT` - Porta frontend (3000)
- `BACKEND_PORT` - Porta backend (8001)
- `MODEL_NAME` - Modelo Ollama (qwen2.5:1.5b)

## 📚 Documentação

- 📖 [README.md](README.md) - Documentação Completa
- ⚡ [QUICKSTART.md](QUICKSTART.md) - Este arquivo
- 🔌 [API.md](API.md) - WebSocket API
- 🐳 [docker/README.md](docker/README.md) - Docker Detalhado
- ✅ [VALIDATION.md](VALIDATION.md) - Checklist

## 🚨 Troubleshooting

**WebSocket não conecta:**
- Backend rodando? `ps aux | grep node`
- Ollama rodando? `curl http://localhost:11434`

**Porta em uso:**
```bash
lsof -i :8001 | grep LISTEN
kill -9 <PID>
```

**Reconstruir:**
```bash
docker-compose down -v
docker-compose up --build
```

---

Veja [docker/README.md](docker/README.md) para mais detalhes sobre Docker.

