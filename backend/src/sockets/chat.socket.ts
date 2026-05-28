import type { WebSocket } from '@fastify/websocket';

import { classifyInput } from '../services/classifier.service.ts';

import { streamFootballResponse } from '../services/gemini.service.ts';

export function registerChatSocket(socket: WebSocket) {
  socket.on('message', async (rawMessage) => {
    try {
      const message = rawMessage.toString();
      // const security = analyzeRequest(message);

      // if (!security.allowed) {
      //   socket.send(
      //     JSON.stringify({
      //       type: 'error',
      //       message: 'Mensagem bloqueada por segurança.',
      //     })
      //   );

      //   return;
      // }

      const classification = await classifyInput(message);

      if (classification === 'PROMPT_INJECTION') {
        socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Tentativa de prompt injection detectada.',
          })
        );

        return;
      }

      if (classification === 'OTHER') {
        socket.send(
          JSON.stringify({
            type: 'message',
            message: 'Posso responder apenas perguntas relacionadas ao futebol.',
          })
        );

        return;
      }

      await streamFootballResponse(
        message,

        (token) => {
          socket.send(
            JSON.stringify({
              type: 'token',
              content: token,
            })
          );
        }
      );

      socket.send(
        JSON.stringify({
          type: 'done',
        })
      );
    } catch (error) {
      console.error(error);

      socket.send(
        JSON.stringify({
          type: 'error',
          message: 'Erro interno.',
        })
      );
    }
  });
}
