// Garante variáveis de ambiente obrigatórias ANTES de qualquer módulo ser
// carregado (config/env.ts lança erro se GOOGLE_API_KEY estiver ausente).
process.env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ?? 'test-api-key';
process.env.MAX_PROMPT_LENGTH = process.env.MAX_PROMPT_LENGTH ?? '1000';
process.env.GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-test';
process.env.GEMINI_CLASSIFIER_MODEL = process.env.GEMINI_CLASSIFIER_MODEL ?? 'gemini-classifier-test';
process.env.GEMINI_TEMPERATURE = process.env.GEMINI_TEMPERATURE ?? '0.3';
