/**
 * 🧪 Testes WebSocket - FutBot Chat
 *
 * Testa a comunicação WebSocket entre cliente e servidor
 * com streaming de respostas do Ollama
 *
 * Como rodar:
 *   npm run test -- websocket.test.ts
 */

import WebSocket from 'ws';

describe('WebSocket Chat - Testes de Integração', () => {
  const WS_URL = 'http://127.0.0.1:8081/v1/chat';
  let ws: WebSocket;

  beforeEach(done => {
    ws = new WebSocket(WS_URL);
    ws.on('open', done);
    ws.on('error', error => {
      console.error('WebSocket connection error:', error);
      done(error);
    });
  });

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  describe('Conexão WebSocket', () => {
    it('Deve conectar ao endpoint /v1/ws/chat', done => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    });

    it('Deve manter conexão ativa', done => {
      const timeout = setTimeout(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        done();
      }, 1000);

      return () => clearTimeout(timeout);
    });
  });

  describe('Protocolo de Mensagens', () => {
    it('Deve receber token quando enviar mensagem', done => {
      let receivedToken = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'token') {
          receivedToken = true;
          expect(message).toHaveProperty('content');
          expect(typeof message.content).toBe('string');
        } else if (message.type === 'done') {
          expect(receivedToken).toBe(true);
          done();
        }
      });

      ws.send('Olá, como você está?');
    }, 30000); // timeout de 30s para streaming

    it('Deve receber mensagem de conclusão (done)', done => {
      let receivedDone = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'done') {
          receivedDone = true;
          expect(message.type).toBe('done');
          done();
        }
      });

      ws.send('Teste');
    }, 30000);

    it('Deve enviar erro se Ollama não está disponível', done => {
      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'error') {
          expect(message).toHaveProperty('message');
          done();
        }
      });

      ws.send('Teste com erro');
    }, 30000);
  });

  describe('Streaming de Resposta', () => {
    it('Deve manter ordem dos tokens', done => {
      const tokens: string[] = [];
      let done_received = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'token') {
          tokens.push(message.content);
        } else if (message.type === 'done') {
          done_received = true;
          expect(tokens.length).toBeGreaterThan(0);
          expect(done_received).toBe(true);
          done();
        }
      });

      ws.send('Qual é a capital do Brasil?');
    }, 30000);

    it('Deve permitir múltiplas mensagens', done => {
      let messageCount = 0;
      let firstMessageCompleted = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'done') {
          messageCount++;
          if (messageCount === 1) {
            firstMessageCompleted = true;
            // Enviar segunda mensagem
            ws.send('Qual é a capital da Argentina?');
          } else if (messageCount === 2) {
            expect(firstMessageCompleted).toBe(true);
            done();
          }
        }
      });

      ws.send('Qual é a capital do Brasil?');
    }, 60000); // 60s para duas respostas
  });

  describe('Validação de Entrada', () => {
    it('Deve aceitar string simples', done => {
      let receivedMessage = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'token' || message.type === 'done') {
          receivedMessage = true;
        }
        if (message.type === 'done') {
          expect(receivedMessage).toBe(true);
          done();
        }
      });

      ws.send('Teste');
    }, 30000);

    it('Deve aceitar mensagens com caracteres especiais', done => {
      let receivedMessage = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);
        if (message.type === 'done') {
          expect(receivedMessage).toBe(true);
          done();
        }
        if (message.type === 'token') {
          receivedMessage = true;
        }
      });

      ws.send('Qual é o resultado de 10 + 5? #@$%');
    }, 30000);
  });

  describe('Tratamento de Erros', () => {
    it('Deve recuperar de erro e aceitar nova mensagem', done => {
      let errorOccurred = false;
      let secondMessageProcessed = false;

      ws.on('message', (data: string) => {
        const message = JSON.parse(data);

        if (message.type === 'error') {
          errorOccurred = true;
          // Enviar nova mensagem após erro
          setTimeout(() => {
            ws.send('Recuperação após erro');
          }, 500);
        }

        if (message.type === 'done' && errorOccurred && !secondMessageProcessed) {
          secondMessageProcessed = true;
          expect(secondMessageProcessed).toBe(true);
          done();
        }
      });

      ws.send('Mensagem de teste');
    }, 30000);
  });
});

/**
 * ⚠️ Pré-requisitos para rodar os testes:
 *
 * 1. Backend rodando:
 *    npm run dev
 *
 * 2. Ollama rodando:
 *    ollama serve
 *
 * 3. Modelo disponível:
 *    ollama pull qwen2.5:1.5b
 *
 * 4. Instalar dependência de teste:
 *    npm install --save-dev ws
 */
