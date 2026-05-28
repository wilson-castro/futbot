# API Documentação - FutBot WebSocket

## Conexão WebSocket

**Endpoint**: `/v1/ws/chat`
**Protocolo**: WebSocket
**Host**: `localhost:8001` (desenvolvimento) ou `localhost:8001` (Docker)
**URL Completa**: `ws://localhost:8001/v1/ws/chat`

## Fluxo de Comunicação

```
┌─────────────┐                    ┌──────────────┐
│   Frontend  │                    │    Backend   │
└─────────────┘                    └──────────────┘
      │                                   │
      │─── WebSocket Connect ───────────>│
      │<─── Connection Established ────── │
      │                                   │
      │─── String Message ──────────────>│ (e.g., "Qual é a data do jogo?")
      │                                   │
      │                            ┌─────▼──────────┐
      │                            │ Ollama Request │
      │                            └─────┬──────────┘
      │                                   │
      │<─── {"type": "token", ...} ───── │ (primeira parte)
      │<─── {"type": "token", ...} ───── │ (segunda parte)
      │<─── {"type": "token", ...} ───── │ (...)
      │<─── {"type": "done"} ──────────── │ (fim)
      │                                   │
```

## Mensagens do Servidor

### 1. Token (Streaming)

Enviado a cada token da resposta.

```json
{
  "type": "token",
  "content": "texto_aqui"
}
```

**Exemplo com múltiplos tokens (placeholder):**
```
{"type": "token", "content": "<token_1>"}
{"type": "token", "content": "<token_2>"}
{"type": "token", "content": "<token_3>"}
... (tokens entregues em sequência)
{"type": "done"}
```

### 2. Done (Conclusão)

Enviado quando a resposta está completa.

```json
{
  "type": "done"
}
```

### 3. Error (Erro)

Enviado quando ocorre um erro no servidor.

```json
{
  "type": "error",
  "message": "Descrição do erro"
}
```

**Exemplos de erro:**
```json
{
  "type": "error",
  "message": "Ollama não está acessível"
}
```

```json
{
  "type": "error",
  "message": "Erro no streaming"
}
```

## Implementação Cliente (TypeScript)

### Conexão e Listeners

```typescript
// Conectar
const ws = new WebSocket('ws://localhost:8001/v1/ws/chat');

// Abrir conexão
ws.onopen = () => {
  console.log('Conectado ao chat');
};

// Receber mensagens
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'token') {
    console.log('Token recebido:', data.content);
    // Adicionar à resposta do bot
  } else if (data.type === 'done') {
    console.log('Resposta completa');
  } else if (data.type === 'error') {
    console.error('Erro:', data.message);
  }
};

// Erros
ws.onerror = (error) => {
  console.error('Erro WebSocket:', error);
};

// Desconectar
ws.onclose = () => {
  console.log('Desconectado');
};
```

### Enviar Mensagem

```typescript
// Enviar texto simples
ws.send("Qual é o placar do último jogo?");

// Aguardar resposta (exemplo com streaming)
let fullResponse = '';

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'token') {
    fullResponse += data.content;
    console.log('Resposta parcial:', fullResponse);
  } else if (data.type === 'done') {
    console.log('Resposta final:', fullResponse);
  }
};
```

### Classe Auxiliar

```typescript
class FutBotClient {
  private ws: WebSocket;
  private url: string;
  
  constructor(url: string = 'ws://localhost:8001/v1/ws/chat') {
    this.url = url;
    this.ws = new WebSocket(url);
  }
  
  connect(onOpen?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        onOpen?.();
        resolve();
      };
      this.ws.onerror = (error) => reject(error);
    });
  }
  
  async sendMessage(
    message: string,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError?: (error: string) => void
  ): Promise<string> {
    let fullResponse = '';
    
    return new Promise((resolve) => {
      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'token') {
          fullResponse += data.content;
          onToken(data.content);
        } else if (data.type === 'done') {
          this.ws.removeEventListener('message', messageHandler);
          onComplete();
          resolve(fullResponse);
        } else if (data.type === 'error') {
          onError?.(data.message);
          this.ws.removeEventListener('message', messageHandler);
          resolve(fullResponse);
        }
      };
      
      this.ws.addEventListener('message', messageHandler);
      this.ws.send(message);
    });
  }
  
  disconnect(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
  
  isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }
}

// Uso
const client = new FutBotClient();
await client.connect();

const response = await client.sendMessage(
  "Qual é a próxima rodada?",
  (token) => console.log('Token:', token),
  () => console.log('Completo'),
  (error) => console.error('Erro:', error)
);

console.log('Resposta completa:', response);
client.disconnect();
```

## Configuração do Servidor

### Variáveis de Ambiente

```env
# Backend
NODE_ENV=development|production
OLLAMA_URL=http://localhost:11434 ou http://ollama:11434
MODEL_NAME=qwen2.5:1.5b (ou outro modelo)
```

### Modelos Ollama Disponíveis

- `qwen2.5:1.5b` - Rápido e leve (recomendado)
- `mistral:latest` - Modelo versátil
- `neural-chat:latest` - Otimizado para chat
- `orca-mini:latest` - Compacto
- `phi:latest` - Pequeno e rápido

### Comandos Ollama

```bash
# Listar modelos instalados
ollama list

# Baixar modelo
ollama pull qwen2.5:1.5b

# Remover modelo
ollama rm qwen2.5:1.5b

# Testar modelo
ollama generate qwen2.5:1.5b "Olá, como você está?"

# Ver informações do servidor
curl http://localhost:11434/api/tags
```

## Rate Limiting e Configuração

### Docker Compose (Tunning)

```yaml
environment:
  OLLAMA_KEEP_ALIVE: '24h'      # Manter modelo na memória
  OLLAMA_NUM_PARALLEL: '4'      # Requisições paralelas
  OLLAMA_MAX_LOADED_MODELS: '2' # Modelos simultâneos
```

## Tratamento de Erros

### Possíveis Erros

| Erro | Causa | Solução |
|------|-------|--------|
| `Connection refused` | Backend não está rodando | Iniciar backend: `npm run dev` |
| `Ollama não está acessível` | Ollama não está rodando | Iniciar Ollama: `ollama serve` |
| `Modelo não encontrado` | Modelo não foi baixado | `ollama pull qwen2.5:1.5b` |
| `Timeout` | Modelo muito grande ou lento | Usar modelo mais rápido |

### Reconexão Automática

```typescript
class ReconnectingWebSocket {
  private ws: WebSocket;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(url: string) {
    this.url = url;
    this.connect();
  }
  
  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onclose = () => this.handleDisconnect();
  }
  
  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }
}
```

## Exemplos de Uso

### 1. Chat Simples

```typescript
const ws = new WebSocket('ws://localhost:8001/v1/ws/chat');

ws.onopen = () => {
  ws.send("Qual é a data do próximo clássico?");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'token') {
    document.getElementById('response').innerText += data.content;
  }
};
```

### 2. Chat com React Hooks

```typescript
import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    wsRef.current = ws;
    return () => ws.close();
  }, [url]);
  
  const send = (message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  };
  
  return { isConnected, send, ws: wsRef.current };
}
```

---

Para mais informações, consulte [README.md](README.md) ou [QUICKSTART.md](QUICKSTART.md)
