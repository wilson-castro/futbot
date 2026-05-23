# 🐳 Docker - FutBot Chat

Arquivos Docker centralizados e otimizados para evitar repetição.

## 📁 Estrutura

```
docker/
├── docker-compose.yml ............. Desenvolvimento (dev)
├── docker-compose.prod.yml ........ Produção (prod)
├── .env.example ................... Variáveis de ambiente
├── .dockerignore.frontend ......... Build otimizado frontend
├── .dockerignore.backend ......... Build otimizado backend
├── .dockerignore.ollama .......... Build otimizado ollama
├── compose.sh .................... Script auxiliar
└── README.md ..................... Este arquivo
```

## 🚀 Uso Rápido

### Desenvolvimento (Recomendado)

```bash
# Da raiz do projeto
docker-compose up --build

# Ou especificamente desenvolvimento
cd docker
docker-compose up --build
```

### Produção

```bash
cd docker
docker-compose -f docker-compose.prod.yml up --build
```

### Com Script Auxiliar

```bash
# Desenvolvimento
./docker/compose.sh up dev

# Produção
./docker/compose.sh up prod

# Parar
./docker/compose.sh down dev

# Ver logs
./docker/compose.sh logs dev
```

## 🔧 Configuração

### Arquivo `.env`

Copiar `.env.example` para `.env` e editar:

```bash
cp docker/.env.example docker/.env
```

Variáveis disponíveis:

| Variável | Default | Descrição |
|----------|---------|-----------|
| `PROJECT_NAME` | `futbot` | Nome do projeto |
| `VERSION` | `1.0.0` | Versão |
| `NODE_ENV` | `development` | Ambiente |
| `FRONTEND_PORT` | `3000` | Porta frontend |
| `BACKEND_PORT` | `8001` | Porta backend |
| `OLLAMA_PORT` | `11434` | Porta ollama |
| `MODEL_NAME` | `qwen2.5:1.5b` | Modelo Ollama |
| `OLLAMA_VERSION` | `latest` | Versão Ollama |

## 📊 Desenvolvimento vs Produção

### Desenvolvimento

```yaml
# docker-compose.yml
- Sem resource limits
- Healthcheck menos rigoroso
- Logging ao console
- Otimizado para desenvolvimento
```

**Comando:** `docker-compose up --build`

### Produção

```yaml
# docker-compose.prod.yml
- Resource limits definidos
- Healthcheck mais rigoroso
- JSON-file logging com rotação
- Build multi-stage otimizado
- Registry support (Docker Hub, etc)
```

**Comando:** `docker-compose -f docker-compose.prod.yml up --build`

## 🐳 Containers

### Ollama

```yaml
Container: futbot-ollama
Port: 11434
Volumes: ollama_data (persistente)
Healthcheck: /api/tags
```

**Modelo:** `qwen2.5:1.5b` (configurável)

### Backend

```yaml
Container: futbot-backend
Port: 8001
Build: ./backend/Dockerfile
Healthcheck: http://localhost:8001
```

**Dependências:** Ollama

### Frontend

```yaml
Container: futbot-frontend
Port: 3000
Build: ./frontend/Dockerfile
Healthcheck: http://localhost:3000
```

**Dependências:** Backend

## 🔗 Network

Todos os containers rodam na mesma rede Docker:

```
futbot-network (bridge)
├── ollama:11434
├── backend:8001
└── frontend:3000
```

Comunicação interna (container para container):
- Frontend → Backend: `http://futbot-backend:8001`
- Backend → Ollama: `http://ollama:11434`

Comunicação externa (localhost):
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8001`
- Ollama: `http://localhost:11434`

## 📦 Build Otimizado

### Frontend

```dockerfile
FROM node:22-alpine as builder
# Build com devDependencies

FROM node:22-alpine
# Runtime sem devDependencies
```

**Tamanho final:** ~250MB

### Backend

```dockerfile
FROM node:20-alpine as builder
# Build com TypeScript

FROM node:20-alpine
# Runtime sem src/
```

**Tamanho final:** ~150MB

## 🧹 Limpeza

### Remover Containers

```bash
# Desenvolvimento
docker-compose down

# Produção
docker-compose -f docker-compose.prod.yml down

# Com volumes (cuidado!)
docker-compose down -v
```

### Remover Images

```bash
# Específica
docker rmi futbot-frontend futbot-backend

# Todas as futbot
docker rmi $(docker images | grep futbot | awk '{print $3}')
```

### Limpeza Completa

```bash
# Parar e remover tudo
docker-compose down -v
docker system prune -a

# Reconstruir
docker-compose up --build
```

## 📊 Monitoring

### Logs

```bash
# Todos os containers
docker-compose logs -f

# Específico
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ollama

# Com timestamp
docker-compose logs -f --timestamps
```

### Métricas

```bash
# CPU/Memória em tempo real
docker stats

# Específico
docker stats futbot-frontend
```

### Inspecionar Container

```bash
# Entrar no container
docker exec -it futbot-backend sh

# Ver variáveis de ambiente
docker exec futbot-backend env

# Ver health status
docker inspect futbot-backend | grep -A 10 Health
```

## 🆘 Troubleshooting

### Porta em Uso

```bash
# Encontrar processo
lsof -i :3000

# Matar
kill -9 <PID>
```

### Build Falha

```bash
# Reconstruir sem cache
docker-compose up --build --no-cache

# Ver logs detalhados
docker-compose build --no-cache --progress=plain
```

### Ollama Não Inicia

```bash
# Verificar logs
docker-compose logs ollama

# Baixar modelo
docker exec futbot-ollama ollama pull qwen2.5:1.5b

# Testar
docker exec futbot-ollama ollama list
```

### WebSocket Não Conecta

```bash
# Verificar backend
curl http://localhost:8001

# Verificar logs
docker-compose logs backend

# Verificar rede
docker network inspect futbot-network
```

## 📚 Referências

- [Docker Compose Spec](https://github.com/compose-spec/compose-spec)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Alpine Linux](https://alpinelinux.org/)
- [Node.js Docker Image](https://hub.docker.com/_/node)

## 🚀 Deploy

### Docker Hub

```bash
# Build com tag
docker build -t username/futbot-backend:1.0.0 ./backend

# Push
docker push username/futbot-backend:1.0.0

# Pull e rodar
docker run -p 8001:8001 username/futbot-backend:1.0.0
```

### Docker Compose em Produção

```bash
# Usar arquivo .env.prod
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verificar
docker-compose ps

# Logs
docker-compose logs -f
```

---

Para mais informações, veja [../README.md](../README.md)
