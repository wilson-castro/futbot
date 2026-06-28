import type { WebSocket } from '@fastify/websocket';

import { classifyInput } from '../services/classifier.service.ts';

import { env } from '../config/env.ts';
import { streamFootballResponse } from '../services/gemini.service.ts';

export function registerChatSocket(socket: WebSocket) {
  socket.on('message', async (rawMessage) => {
    try {
      const message = rawMessage.toString();

      if (message.length > env.maxPromptLength) {
        socket.send(
          JSON.stringify({
            type: 'error',
            message: `Opa, sua mensagem ficou um pouco longa! Tente encurtar para até ${env.maxPromptLength} caracteres. 🙂`,
          })
        );

        return;
      }
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
            message: 'Hmm, essa mensagem parece tentar mudar meu funcionamento. 😅 Bora falar de futebol?',
          })
        );

        return;
      }

      if (classification === 'OTHER') {
        socket.send(
          JSON.stringify({
            type: 'message',
            message: 'Opa! Eu só manjo de futebol. 😅 Me pergunta algo sobre o esporte!',
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
          message: 'Eita, deu um probleminha aqui. 😬 Tenta de novo daqui a pouco!',
        })
      );
    }
  });
}
