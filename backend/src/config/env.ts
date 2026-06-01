function validRequired(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8081),

  googleApiKey: validRequired('GOOGLE_API_KEY'),

  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',

  classifierModel: process.env.GEMINI_CLASSIFIER_MODEL ?? 'gemini-2.5-flash-lite',

  temperature: Number(process.env.GEMINI_TEMPERATURE ?? 0.3),

  enableGoogleSearch: process.env.ENABLE_GOOGLE_SEARCH !== 'false',

  maxPromptLength: Number(process.env.MAX_PROMPT_LENGTH ?? 1000),
};
