import { detectPromptInjection } from './prompt-sanitizer.ts';
import { analyzeFootballContext } from './football-filter.ts';

export interface SecurityAnalysis {
  allowed: boolean;
  reason?: string;
}

export function analyzeRequest(
  userInput: string,
): SecurityAnalysis {

  const injection =
    detectPromptInjection(userInput);

  if (injection.blocked) {
    return {
      allowed: false,
      reason: 'prompt-injection',
    };
  }

  const football =
    analyzeFootballContext(userInput);

  if (!football.footballRelated) {
    return {
      allowed: false,
      reason: 'outside-domain',
    };
  }

  return {
    allowed: true,
  };
}
