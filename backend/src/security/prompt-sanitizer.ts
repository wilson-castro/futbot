export interface PromptRisk {
  score: number;
  blocked: boolean;
  reasons: string[];
}

export const INJECTION_PATTERNS: RegExp[] = [
  // =====================
  // IGNORE INSTRUCTIONS
  // =====================

  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?/i,
  /ignore\s+(all\s+)?rules?/i,
  /ignore\s+(all\s+)?system\s+messages?/i,
  /ignore\s+(all\s+)?developer\s+messages?/i,

  /ignorar\s+(todas?\s+as?\s+)?instru[cç][õo]es?/i,
  /ignorar\s+(todas?\s+as?\s+)?regras?/i,
  /ignorar\s+(todas?\s+as?\s+)?mensagens?\s+do\s+sistema/i,
  /ignorar\s+(todas?\s+as?\s+)?mensagens?\s+do\s+desenvolvedor/i,

  // =====================
  // FORGET
  // =====================

  /forget\s+(all\s+)?instructions?/i,
  /forget\s+everything/i,
  /forget\s+your\s+rules/i,

  /esque[cç]a\s+(todas?\s+as?\s+)?instru[cç][õo]es?/i,
  /esque[cç]a\s+tudo/i,
  /esque[cç]a\s+as?\s+regras?/i,

  // =====================
  // REVEAL
  // =====================

  /reveal\s+(your\s+)?prompt/i,
  /reveal\s+(your\s+)?system\s+prompt/i,
  /reveal\s+(your\s+)?developer\s+prompt/i,
  /show\s+(me\s+)?your\s+prompt/i,
  /show\s+(me\s+)?your\s+instructions/i,
  /print\s+the\s+prompt/i,

  /revele\s+(o\s+)?prompt/i,
  /revele\s+(o\s+)?prompt\s+do\s+sistema/i,
  /revele\s+(o\s+)?prompt\s+do\s+desenvolvedor/i,
  /mostre\s+(o\s+)?prompt/i,
  /mostre\s+(as\s+)?instru[cç][õo]es?/i,

  // =====================
  // SYSTEM / DEVELOPER
  // =====================

  /system\s+prompt/i,
  /developer\s+prompt/i,
  /hidden\s+prompt/i,
  /secret\s+prompt/i,
  /internal\s+prompt/i,

  /prompt\s+interno/i,
  /prompt\s+oculto/i,
  /prompt\s+secreto/i,
  /mensagem\s+do\s+sistema/i,
  /mensagem\s+do\s+desenvolvedor/i,

  // =====================
  // ROLE OVERRIDE
  // =====================

  /act\s+as/i,
  /roleplay\s+as/i,
  /pretend\s+to\s+be/i,
  /you\s+are\s+now/i,
  /from\s+now\s+on\s+you\s+are/i,

  /aja\s+como/i,
  /finja\s+ser/i,
  /interprete\s+o\s+papel\s+de/i,
  /a\s+partir\s+de\s+agora\s+voc[eê]\s+[ée]/i,

  // =====================
  // DAN / JAILBREAK
  // =====================

  /\bdan\b/i,
  /do\s+anything\s+now/i,
  /jailbreak/i,
  /unrestricted\s+mode/i,
  /god\s+mode/i,

  /modo\s+dan/i,
  /modo\s+livre/i,
  /modo\s+sem\s+restri[cç][õo]es/i,
  /modo\s+deus/i,

  // =====================
  // OVERRIDE
  // =====================

  /override/i,
  /bypass/i,
  /circumvent/i,
  /disable\s+safety/i,
  /disable\s+guardrails/i,
  /disable\s+filters?/i,

  /sobrescreva/i,
  /contorne/i,
  /ignore\s+os\s+filtros/i,
  /desative\s+as\s+restri[cç][õo]es/i,
  /desative\s+a\s+seguran[cç]a/i,

  // =====================
  // TOOLS
  // =====================

  /tool\s+call/i,
  /function\s+call/i,
  /invoke\s+tool/i,
  /execute\s+tool/i,

  /chamada\s+de\s+ferramenta/i,
  /executar\s+ferramenta/i,
  /usar\s+ferramenta/i,

  // =====================
  // CODE EXECUTION
  // =====================

  /execute\s+code/i,
  /run\s+code/i,
  /execute\s+javascript/i,
  /execute\s+python/i,

  /executar\s+c[oó]digo/i,
  /rodar\s+c[oó]digo/i,

  // =====================
  // PROMPT LEAKING
  // =====================

  /repeat\s+the\s+text\s+above/i,
  /repeat\s+your\s+instructions/i,
  /dump\s+the\s+prompt/i,

  /repita\s+o\s+texto\s+acima/i,
  /repita\s+as\s+instru[cç][õo]es/i,
  /mostre\s+todas?\s+as\s+instru[cç][õo]es/i,

  // =====================
  // XML / TAG INJECTION
  // =====================

  /<system>/i,
  /<\/system>/i,
  /<assistant>/i,
  /<\/assistant>/i,
  /<developer>/i,
  /<\/developer>/i,

  // =====================
  // RAG / MEMORY
  // =====================

  /ignore\s+retrieved\s+documents/i,
  /ignore\s+context/i,
  /forget\s+retrieved\s+data/i,

  /ignore\s+o\s+contexto/i,
  /ignore\s+os\s+documentos/i,
  /ignore\s+os\s+dados\s+recuperados/i,

  // =====================
  // FOOTBALL ESCAPE
  // =====================

  /ignore\s+football/i,
  /ignore\s+sports/i,
  /respond\s+about\s+anything/i,

  /ignore\s+futebol/i,
  /fale\s+sobre\s+qualquer\s+assunto/i,
  /responda\s+qualquer\s+coisa/i,
];

export function normalizeInput(text: string): string {
  return text
    .normalize('NFKD')
    .toLowerCase()

    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')

    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')

    .replace(/[_\-\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectPromptInjection(text: string): PromptRisk {
  const normalized = normalizeInput(text);

  let score = 0;

  const reasons: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      score += 20;
      reasons.push(pattern.source);
    }
  }

  if (normalized.length > 3000) {
    score += 15;
    reasons.push('oversized_prompt');
  }

  if (
    normalized.includes('```') ||
    normalized.includes('<system>') ||
    normalized.includes('</system>')
  ) {
    score += 25;
    reasons.push('prompt_structure');
  }

  return {
    score,
    blocked: score >= 40,
    reasons,
  };
}
