import {
  FOOTBALL_TERMS,
  COMPETITIONS,
  FOOTBALL_TEAMS,
} from './football-entities.ts';

export interface FootballAnalysis {
  score: number;
  footballRelated: boolean;
}

export interface FootballAnalysis {
  score: number;
  footballRelated: boolean;
}

export function analyzeFootballContext(
  input: string,
): FootballAnalysis {

  const text = input.toLowerCase();

  let score = 0;

  for (const term of FOOTBALL_TERMS) {
    if (text.includes(term)) {
      score += 10;
    }
  }

  for (const competition of COMPETITIONS) {
    if (text.includes(competition)) {
      score += 20;
    }
  }

  for (const team of FOOTBALL_TEAMS) {
    if (text.includes(team)) {
      score += 20;
    }
  }

  return {
    score,
    footballRelated: score >= 20,
  };
}


