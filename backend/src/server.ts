import websocket from '@fastify/websocket';
import 'dotenv/config'; // Loads variables immediately
import Fastify from 'fastify';

import { registerChatSocket } from './sockets/chat.socket.ts';

const app = Fastify({
  logger: true,
});

await app.register(websocket);

app.get(
  '/v1/chat',
  { websocket: true },

  (socket) => {
    registerChatSocket(socket);
  }
);

app.listen({
  port: 8081,
  host: '0.0.0.0',
});
