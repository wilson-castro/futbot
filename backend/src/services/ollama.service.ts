import { Agent, request } from 'undici';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://ollama:11434';

const MODEL = process.env.MODEL_NAME ?? 'qwen2.5:1.5b';

const agent = new Agent({
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 60_000,
  connections: 100,
  pipelining: 0,
});

export async function streamChat(prompt: string, onToken: (token: string) => void) {
  console.log(`[streamChat] Iniciando stream com prompt: "${prompt.substring(0, 50)}..."`);
  console.log(`[streamChat] URL: ${OLLAMA_URL}/api/chat`);
  console.log(`[streamChat] Model: ${MODEL}`);

  const response = await request(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',

    dispatcher: agent,

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      model: MODEL,

      stream: true,

      keep_alive: '30m',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],

      options: {
        temperature: 0.7,
        num_ctx: 2048,
        num_predict: 256,
      },
    }),

    headersTimeout: 0,
    bodyTimeout: 0,
  });

  console.log(`[streamChat] Response status: ${response.statusCode}`);

  if (response.statusCode !== 200) {
    const bodyText = await response.body.text?.();
    console.error(`[streamChat] HTTP Error ${response.statusCode}: ${bodyText}`);
    throw new Error(`Ollama error ${response.statusCode}: ${bodyText}`);
  }

  const decoder = new TextDecoder();

  let buffer = '';
  let tokenCount = 0;

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, {
      stream: true,
    });

    const lines = buffer.split('\n');

    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const json = JSON.parse(line);

        const token = json.message?.content;

        if (token) {
          onToken(token);
          tokenCount++;
        }
      } catch (err) {
        console.error('[streamChat] Erro parse stream:', err);
      }
    }
  }

  console.log(`[streamChat] Stream completo. Total de tokens: ${tokenCount}`);
}

export async function warmupModel() {
  console.log(`[warmupModel] Aquecendo modelo ${MODEL}...`);
  try {
    const response = await fetch('http://ollama:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:1.5b',
        prompt: '',
        keep_alive: '30m',
      }),
    });
    console.log(`[warmupModel] Resposta: ${response.status}`);
  } catch (error) {
    console.error(`[warmupModel] Erro ao aquecer modelo:`, error);
  }
}
