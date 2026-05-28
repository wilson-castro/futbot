function validRequired(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),

  googleApiKey: validRequired('GOOGLE_API_KEY'),

  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',

  classifierModel: process.env.GEMINI_CLASSIFIER_MODEL ?? 'gemini-2.5-flash-lite',

  temperature: Number(process.env.GEMINI_TEMPERATURE ?? 0.3),

  footballOnlyMode: process.env.FOOTBALL_ONLY_MODE === 'true',

  enableGoogleSearch: process.env.ENABLE_GOOGLE_SEARCH !== 'false',

  enablePromptSanitizer: process.env.ENABLE_PROMPT_SANITIZER !== 'false',

  enableQueryClassifier: process.env.ENABLE_QUERY_CLASSIFIER !== 'false',

  enableChatHistory: process.env.ENABLE_CHAT_HISTORY !== 'false',

  maxPromptLength: Number(process.env.MAX_PROMPT_LENGTH ?? 1000),
};
