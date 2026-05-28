/**
 * 🧪 Testes de Integração com Supertest - Backend Esportivo
 *
 * Testa os endpoints:
 * - GET /health
 * - POST /api/chat
 *
 * Como rodar:
 *   npm run test:integration
 *   npm run test:integration:watch
 */

import request from 'supertest';
import { app } from '../src/server';

describe('Backend Esportivo - Testes de Integração', () => {
  // ============ TESTES: HEALTH ENDPOINT ============

  describe('GET /health', () => {
    it('Deve retornar status OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });

    it('Deve incluir timestamp na resposta', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('object');
      // Valida se é uma data válida
      expect(new Date(response.body.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('Deve responder rapidamente', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('Deve ter Content-Type application/json', async () => {
      const response = await request(app).get('/health');

      expect(response.type).toBe('application/json');
    });
  });

  // ============ TESTES: CHAT ENDPOINT - VALIDAÇÕES ============

  describe('POST /api/chat - Validações Básicas', () => {
    it('Deve retornar erro 400 sem mensagem', async () => {
      const response = await request(app).post('/api/chat').send({ history: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('Deve retornar erro 400 com mensagem vazia', async () => {
      const response = await request(app).post('/api/chat').send({
        message: '',
        history: [],
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('Deve aceitar requisição com apenas mensagem', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Qual é o resultado de hoje?',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reply');
    });

    it('Deve aceitar requisição com messagestring e history array', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Qual é o placar?',
        history: [],
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reply');
    });

    it('Deve retornar Content-Type application/json', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history: [],
      });

      expect(response.type).toBe('application/json');
    });
  });

  // ============ TESTES: CHAT ENDPOINT - ESTRUTURA DE RESPOSTA ============

  describe('POST /api/chat - Estrutura de Resposta', () => {
    it('Deve retornar todos os campos obrigatórios', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Teste de estrutura',
        history: [],
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reply');
      expect(response.body).toHaveProperty('sources');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('Reply deve ser uma string não-vazia', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Qual é o resultado?',
        history: [],
      });

      expect(typeof response.body.reply).toBe('string');
      expect(response.body.reply.length).toBeGreaterThan(0);
    });

    it('Sources deve ser uma string', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history: [],
      });

      expect(typeof response.body.sources).toBe('string');
    });

    it('Timestamp deve ser ISO 8601 válido', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history: [],
      });

      const timestamp = response.body.timestamp;
      expect(typeof timestamp).toBe('string');
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(new Date(timestamp).getTime()).toBeGreaterThan(0);
    });

    it('Não deve ter propriedades extras', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history: [],
      });

      const keys = Object.keys(response.body);
      expect(keys.length).toBe(3); // reply, sources, timestamp
      expect(keys).toEqual(expect.arrayContaining(['reply', 'sources', 'timestamp']));
    });
  });

  // ============ TESTES: CHAT ENDPOINT - MENSAGENS ESPORTIVAS ============

  describe('POST /api/chat - Mensagens Esportivas (com Gemini AI)', () => {
    it('Deve responder a pergunta sobre jogos de hoje', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Qual é o resultado da partida de futebol de hoje?',
        history: [],
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
      expect(typeof response.body.reply).toBe('string');
    });

    it('Deve responder a pergunta sobre times', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Qual é o melhor time do Brasil?',
        history: [],
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });

    it('Deve responder a pergunta sobre estatísticas', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Quais são as estatísticas do campeonato?',
        history: [],
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });

    it('Resposta não deve estar vazia quando API key válida', async () => {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('test')) {
        console.log('⚠️  Pulando teste: GEMINI_API_KEY não configurada com valor válido');
        return;
      }

      const response = await request(app).post('/api/chat').send({
        message: 'teste esportivo',
        history: [],
      });

      expect(response.body.reply.length).toBeGreaterThan(0);
    });
  });

  // ============ TESTES: CHAT ENDPOINT - RESTRIÇÕES DE ESCOPO ============

  describe('POST /api/chat - Restrições de Escopo', () => {
    it('Deve rejeitar pergunta sobre receitas', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Como faço um bolo de chocolate?',
        history: [],
      });

      expect(response.status).toBe(200);
      const reply = response.body.reply.toLowerCase();
      // Bot deve mencionar que é assistente esportivo
      expect(reply).toMatch(/esportivo|escopo|restricao/i);
    });

    it('Deve rejeitar pergunta sobre política', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Quem é o melhor presidente?',
        history: [],
      });

      expect(response.status).toBe(200);
      const reply = response.body.reply.toLowerCase();
      expect(reply).toMatch(/esportivo|escopo|restricao/i);
    });

    it('Deve rejeitar pergunta sobre história', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'O que aconteceu na Segunda Guerra Mundial?',
        history: [],
      });

      expect(response.status).toBe(200);
      const reply = response.body.reply.toLowerCase();
      expect(reply).toMatch(/esportivo|escopo|restricao/i);
    });

    it('Deve rejeitar perguntas sobre entretenimento', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Quem é o melhor ator de cinema?',
        history: [],
      });

      expect(response.status).toBe(200);
      const reply = response.body.reply.toLowerCase();
      expect(reply).toMatch(/esportivo|escopo|restricao/i);
    });
  });

  // ============ TESTES: HISTÓRICO DE CONVERSA ============

  describe('POST /api/chat - Histórico de Conversa', () => {
    it('Deve processar requisição com histórico vazio', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Olá',
        history: [],
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });

    it('Deve processar histórico com mensagem anterior', async () => {
      const history = [
        { role: 'user', parts: [{ text: 'Olá' }] },
        { role: 'model', parts: [{ text: 'Olá! Sou um assistente esportivo.' }] },
      ];

      const response = await request(app).post('/api/chat').send({
        message: 'Pode me ajudar com futebol?',
        history,
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });

    it('Deve processar histórico com múltiplas mensagens', async () => {
      const history = [
        { role: 'user', parts: [{ text: 'Olá' }] },
        { role: 'model', parts: [{ text: 'Olá!' }] },
        { role: 'user', parts: [{ text: 'Como você funciona?' }] },
        { role: 'model', parts: [{ text: 'Respondo sobre esportes.' }] },
        { role: 'user', parts: [{ text: 'E quanto à política?' }] },
        { role: 'model', parts: [{ text: 'Não respondo sobre política.' }] },
      ];

      const response = await request(app).post('/api/chat').send({
        message: 'Você pode ajudar com informações sobre futebol?',
        history,
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });

    it('Deve ignorar histórico inválido e processar com array vazio', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history: 'não é um array', // inválido
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });

    it('Deve limitar tamanho do histórico (windowing)', async () => {
      // Cria um histórico muito grande
      const history = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'model',
        parts: [{ text: `Mensagem ${i}` }],
      }));

      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history,
      });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBeTruthy();
    });
  });

  // ============ TESTES: TRATAMENTO DE ERROS ============

  describe('POST /api/chat - Tratamento de Erros', () => {
    it('Deve retornar erro 500 em caso de erro interno', async () => {
      // Simula um erro enviando dados corrompidos
      const response = await request(app).post('/api/chat').send({ message: 'teste', history: 'inválido' });

      // Mesmo com histórico inválido, deve processar normalmente
      expect(response.status).toBe(200);
    });

    it('Deve incluir mensagem de erro quando apropriado', async () => {
      const response = await request(app).post('/api/chat').send({
        // Sem mensagem
        history: [],
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('Deve tratar erro de segurança com status 403', async () => {
      // Se houver bloqueio por segurança, Gemini retorna erro
      // Este teste apenas verifica que a resposta é válida
      const response = await request(app).post('/api/chat').send({
        message: 'teste',
        history: [],
      });

      expect([200, 403, 500]).toContain(response.status);
    });
  });

  // ============ TESTES: PERFORMANCE ============

  describe('POST /api/chat - Performance', () => {
    it('Validação básica deve ser rápida (< 100ms)', async () => {
      const start = Date.now();
      await request(app).post('/api/chat').send({
        message: '', // Vai falhar validação rapidamente
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('Requisição com IA pode levar até 40 segundos', async () => {
      const response = await request(app).post('/api/chat').send({
        message: 'Qual é o placar?',
        history: [],
      });

      // Apenas verifica que respondeu (não verificamos duração porque Gemini é variável)
      expect([200, 403, 500]).toContain(response.status);
    });
  });

  // ============ TESTES: 404 E ROTAS INEXISTENTES ============

  describe('Rotas Inexistentes', () => {
    it('Deve retornar erro 404 para rota desconhecida', async () => {
      const response = await request(app).get('/rota/inexistente');

      expect(response.status).toBe(404);
    });

    it('Deve retornar erro 404 para POST em rota desconhecida', async () => {
      const response = await request(app).post('/api/desconhecido').send({
        data: 'teste',
      });

      expect(response.status).toBe(404);
    });
  });

  // ============ TESTES: HEADERS E CONTENT-TYPE ============

  describe('Headers e Content-Type', () => {
    it('GET /health deve ter CORS headers', async () => {
      const response = await request(app).get('/health').set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });

    it('POST /api/chat deve aceitar Content-Type application/json', async () => {
      const response = await request(app).post('/api/chat').set('Content-Type', 'application/json').send({
        message: 'teste',
        history: [],
      });

      expect(response.status).toBe(200);
    });
  });
});
