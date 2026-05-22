import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import Fastify from 'fastify';

import { registerChatSocket } from './websocket/chat.socket';
import { warmupModel } from './services/ollama.service';

dotenv.config();

const app = Fastify({
  logger: true,
});

async function bootstrap() {

  await warmupModel();

  await app.register(cors, {
    origin: true,
  });

  await app.register(websocket);

  registerChatSocket(app);

  await app.listen({
    host: '0.0.0.0',
    port: 8001,
  });
}

bootstrap();
