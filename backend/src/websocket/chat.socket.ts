import { FastifyInstance } from 'fastify';
import { streamChat } from '../services/ollama.service';

export function registerChatSocket(app: FastifyInstance) {
  app.register(async function (fastify) {
    fastify.get('/v1/ws/chat', { websocket: true }, socket => {
      console.log('[WebSocket] Nova conexão estabelecida');

      socket.on('message', async message => {
        const text = message.toString();
        console.log(`[WebSocket] Mensagem recebida: "${text.substring(0, 50)}..."`);

        if (socket.busy) {
          console.log('[WebSocket] Socket ocupado, rejeitando mensagem');
          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Aguarde a resposta atual',
            })
          );

          return;
        }

        socket.busy = true;

        try {
          console.log('[WebSocket] Iniciando streamChat...');
          await streamChat(text, token => {
            console.log(`[WebSocket] Enviando token: "${token.substring(0, 30)}..."`);
            socket.send(
              JSON.stringify({
                type: 'token',
                content: token,
              })
            );
          });

          console.log('[WebSocket] streamChat concluído, enviando done');
          socket.send(
            JSON.stringify({
              type: 'done',
            })
          );
        } catch (error) {
          console.error('[WebSocket] Erro durante streaming:', error);

          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Erro no streaming',
            })
          );
        } finally {
          socket.busy = false;
        }
      });

      socket.on('close', () => {
        console.log('[WebSocket] Conexão fechada');
      });

      socket.on('error', error => {
        console.error('[WebSocket] Erro na conexão:', error);
      });
    });
  });
}
