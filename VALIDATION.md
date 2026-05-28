# ✅ Checklist de Validação - FutBot Chat

Use este checklist para validar que tudo está funcionando corretamente.

## 🚀 Execução com Docker (Recomendado)

### 1. Iniciar Stack Completa

```bash
cd /path/to/futbot
docker-compose up --build
```

**Verificar saída do terminal:**
- [ ] `ollama` container iniciado e saudável
- [ ] `futbot-backend` container iniciado e rodando na porta 8001
- [ ] `futbot-frontend` container iniciado e rodando na porta 3000

### 2. Validações Iniciais

**Terminal 1: Ollama**
```bash
docker-compose logs ollama
```
Procure por: `Listening on ...`

**Terminal 2: Backend**
```bash
docker-compose logs backend
```
Procure por: `Server listening on ...` ou similar

**Terminal 3: Frontend**
```bash
docker-compose logs frontend
```
Procure por: `ready started server on ...`

## 🌐 Testes no Navegador

### 1. Acessar Frontend
```
http://localhost:3000
```

**Validar:**
- [ ] Página carrega corretamente
- [ ] Vê o título "FutBot"
- [ ] Indicador de conexão está **verde** (conectado)
- [ ] Input de mensagem está habilitado
- [ ] Botão "Enviar" está ativo

### 2. Enviar Mensagem de Teste

**Digitar:**
```
Olá, quem é você?
```

**Verificar:**
- [ ] Mensagem aparece na bolha azul (lado direito)
- [ ] Botão "Enviar" muda para "Enviando..."
- [ ] Indicador de loading (3 pontos) aparece
- [ ] Resposta começa a aparecer na bolha cinza (lado esquerdo)
- [ ] Texto é renderizado gradualmente (efeito de digitação)
- [ ] Após resposta completa, "Enviando..." volta a "Enviar"

### 3. Validar WebSocket

**Abrir Console do Navegador (F12)**

**Verificar mensagens de log:**
- [ ] `WebSocket conectado` (onOpen)
- [ ] Mensagens de `Token recebido` (onMessage)
- [ ] `Resposta completa` após `done`

**Ou use a aba Network:**
- [ ] Procure por conexão WebSocket em `/v1/ws/chat`
- [ ] Status `101 Switching Protocols`
- [ ] Messages mostrando o tráfico WebSocket

## 🔧 Testes de Desenvolvimento Local

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev
```

**Verificar:**
- [ ] Sem erros de compilação TypeScript
- [ ] Servidor iniciado em `localhost:8001`
- [ ] Mensagens de log não mostram erros

### Frontend

```bash
cd frontend

# Instalar dependências  
npm install

# Iniciar desenvolvimento
npm run dev
```

**Verificar:**
- [ ] Sem erros de compilação
- [ ] Aplicação iniciada em `localhost:3000`
- [ ] Hot reload funcionando (alterar arquivo = recarrega automaticamente)

### Ollama

```bash
# Terminal separado
ollama serve
```

**Em outro terminal:**
```bash
# Testar conexão
curl http://localhost:11434/api/tags

# Baixar modelo se necessário
ollama pull qwen2.5:1.5b

# Testar modelo
curl http://localhost:11434/api/generate -X POST -d '{"model":"qwen2.5:1.5b","prompt":"Olá"}'
```

## 📊 Testes da API WebSocket

### Usando WebSocket Client (Node.js)

```bash
cd backend

# Instalar cliente WebSocket (se não estiver)
npm install ws

# Criar teste_ws.js
cat > teste_ws.js << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8001/v1/ws/chat');

ws.on('open', () => {
  console.log('✅ Conectado');
  ws.send('Qual é a capital do Brasil?');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'token') {
    process.stdout.write(msg.content);
  } else if (msg.type === 'done') {
    console.log('\n✅ Concluído');
    ws.close();
  } else if (msg.type === 'error') {
    console.error('❌ Erro:', msg.message);
  }
});

ws.on('error', (err) => {
  console.error('❌ Erro de conexão:', err.message);
});
EOF

node teste_ws.js
```

**Verificar:**
- [ ] ✅ Conectado
- [ ] Resposta aparece letra por letra
- [ ] ✅ Concluído

### Usando curl com WebSocket

```bash
# Instalar ferramenta WebSocket
npm install -g wscat

# Conectar
wscat -c ws://localhost:8001/v1/ws/chat

# Na prompt, digitar:
> Qual é o melhor time do Brasil?

# Verificar resposta em streaming
```

## 🔍 Troubleshooting

### ❌ "Cannot GET /1/ws/chat"

**Problema:** WebSocket está sendo tratado como HTTP  
**Solução:**
- [ ] Verificar que URL é `ws://` não `http://`
- [ ] Verificar endpoint exato: `/v1/ws/chat`
- [ ] Backend está rodando em porta 8001

### ❌ "WebSocket is closed"

**Problema:** Conexão foi fechada  
**Verificar:**
```bash
docker-compose logs backend
```
- [ ] Backend está rodando
- [ ] Sem erros nos logs
- [ ] Ollama está acessível: `curl http://localhost:11434`

### ❌ "Ollama não está acessível"

**Problema:** Backend não consegue conectar a Ollama  
**Solução:**
```bash
# Verificar se Ollama está rodando
curl http://localhost:11434

# Em Docker, verificar rede
docker network ls
docker inspect futbot_futbot-network

# Verificar variável de ambiente
docker-compose logs backend | grep OLLAMA_URL
```

### ❌ Nenhuma resposta ou timeout

**Problema:** Modelo muito lento ou não disponível  
**Solução:**
```bash
# Verificar modelo instalado
ollama list

# Verificar tamanho do modelo
ollama pull qwen2.5:1.5b

# Testar Ollama diretamente
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:1.5b","prompt":"Teste"}'
```

### ❌ "Port already in use"

```bash
# Encontrar processo usando porta
lsof -i :3000    # Frontend
lsof -i :8001    # Backend
lsof -i :11434   # Ollama

# Matar processo
kill -9 <PID>

# Ou mudar porta no docker-compose.yml
```

## 📈 Performance

### Esperar
- [ ] Primeira conexão: até 10 segundos (pulling do modelo)
- [ ] Primeira resposta: até 5-10 segundos (carregando modelo)
- [ ] Respostas subsequentes: 2-5 segundos

### Otimizar

**Aumentar timeout em desenvolvimento:**
```typescript
// FutbotChat.tsx
const ws = new WebSocket(wsUrl);
ws.onopen = () => setTimeout(() => setIsConnected(true), 100);
```

**Usar modelo menor:**
```env
MODEL_NAME=orca-mini:latest  # Mais rápido que qwen2.5:1.5b
```

## 🎯 Validação Completa

### Checklist Final

- [ ] Docker Compose inicia sem erros
- [ ] Frontend carrega em http://localhost:3000
- [ ] Indicador de conexão está verde
- [ ] Mensagem é enviada com sucesso
- [ ] Resposta aparece em tempo real (streaming)
- [ ] Console do navegador não mostra erros
- [ ] Ollama está respondendo
- [ ] Backend está respondendo na porta 8001
- [ ] Múltiplas mensagens funcionam em sequência
- [ ] Erro é tratado graciosamente

## 📝 Próximos Passos

Se tudo passou:

1. [ ] Testar em produção: `docker-compose up -d`
2. [ ] Configurar reverse proxy (nginx)
3. [ ] Adicionar autenticação
4. [ ] Salvar histórico de chat
5. [ ] Monitorar logs
6. [ ] Backup de dados Ollama

---

**Status:** ✅ Pronto para Produção

Se encontrar problemas, verifique:
1. [README.md](README.md) - Documentação completa
2. [QUICKSTART.md](QUICKSTART.md) - Início rápido
3. [API.md](API.md) - Documentação da API WebSocket
