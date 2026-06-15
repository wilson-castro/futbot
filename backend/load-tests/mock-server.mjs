/**
 * Servidor de mock para teste de carga ISOLADO (sem Google Gemini).
 *
 * Replica o protocolo do canal WebSocket /v1/chat (mesmos tipos de frame:
 * "token" -> ... -> "done", "message" para fora de escopo, "error" para
 * prompt injection / limite de caracteres), porém com o classificador e a
 * geração de resposta substituídos por stubs instantâneos. Assim, o teste
 * mede o overhead real do Fastify + WebSocket, eliminando a latência variável
 * e o cache do provedor do modelo de linguagem.
 *
 * Uso (a partir de backend/load-tests):
 *   node mock-server.mjs                 # porta 8081, sem delay entre tokens
 *   MOCK_TOKEN_DELAY_MS=5 node mock-server.mjs   # simula streaming com 5ms/token
 */
import websocket from '@fastify/websocket';
import Fastify from 'fastify';

const PORT = Number(process.env.PORT ?? 8081);
const MAX_PROMPT_LENGTH = Number(process.env.MAX_PROMPT_LENGTH ?? 1000);
const TOKEN_DELAY_MS = Number(process.env.MOCK_TOKEN_DELAY_MS ?? 0);

const TOKEN_COUNT = Number(process.env.MOCK_TOKENS ?? 5);
const ALL_TOKENS = ['Resposta ', 'simulada ', 'sobre ', 'futebol ', 'do FutBot.'];
const ANSWER_TOKENS = Array.from({ length: TOKEN_COUNT }, (_, i) => ALL_TOKENS[i % ALL_TOKENS.length]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const app = Fastify({ logger: false });
await app.register(websocket);

app.get('/v1/chat', { websocket: true }, (socket) => {
  socket.on('message', async (raw) => {
    try {
      const message = raw.toString();

      if (message.length > MAX_PROMPT_LENGTH) {
        socket.send(
          JSON.stringify({
            type: 'error',
            message: `A mensagem excede o limite de ${MAX_PROMPT_LENGTH} caracteres.`,
          })
        );
        return;
      }

      // Classificador stub (determinístico, sem rede)
      const lower = message.toLowerCase();
      if (lower.includes('ignore') || lower.includes('instruç')) {
        socket.send(
          JSON.stringify({ type: 'error', message: 'Tentativa de prompt injection detectada.' })
        );
        return;
      }

      // Geração stub: faz streaming de tokens fixos e finaliza com "done"
      for (const token of ANSWER_TOKENS) {
        socket.send(JSON.stringify({ type: 'token', content: token }));
        if (TOKEN_DELAY_MS > 0) await sleep(TOKEN_DELAY_MS);
      }
      socket.send(JSON.stringify({ type: 'done' }));
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'Erro interno.' }));
    }
  });
});

await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`[mock] FutBot mock server (sem Gemini) ouvindo em ws://localhost:${PORT}/v1/chat`);
