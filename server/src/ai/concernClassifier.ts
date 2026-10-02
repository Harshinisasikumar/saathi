import type { ConcernCategory, ConcernRecord, Lang } from '../domain/types.js';
import { detectLang } from './language.js';

/**
 * Deterministic parent-concern classifier for English and Tamil text.
 * It returns a category, a confidence (0..1) and a severity hint. It is an
 * intent heuristic for the prototype — not a validated sentiment engine.
 */

interface Rule {
  category: ConcernCategory;
  weight: number;
  tokens: string[];
}

const RULES: Rule[] = [
  { category: 'income', weight: 2, tokens: ['salary', 'pay', 'earn', 'income', 'money', 'sambalam', 'சம்பளம்', 'வருமானம்', 'பணம்', 'சம்பாதிக்க'] },
  { category: 'job_security', weight: 2, tokens: ['job', 'employment', 'work', 'stable', 'guarantee', 'laid off', 'வேலை', 'வேலைவாய்ப்பு', 'கிடைக்குமா', 'நிலையான'] },
  { category: 'placement', weight: 1.5, tokens: ['placement', 'placed', 'recruit', 'interview', 'placement support', 'வேலை வாய்ப்பு', 'பிளேஸ்மெண்ட்', 'இன்டர்வியூ'] },
  { category: 'career_growth', weight: 2, tokens: ['growth', 'future', 'career', 'progress', 'promotion', 'grown', 'munnetham', 'முன்னேற்றம்', 'எதிர்காலம்', 'வளர்ச்சி', 'மேம்பாடு'] },
  { category: 'further_education', weight: 2, tokens: ['degree', 'higher studies', 'further study', 'college', 'study further', 'diploma', 'டிகிரி', 'மேற்படிப்பு', 'மேல்படிப்பு', 'படிக்க'] },
  { category: 'social_perception', weight: 2, tokens: ['social', 'society', 'status', 'respect', 'prestige', 'look down', 'சமூக', 'மரியாதை', 'மதிப்பு', 'தாழ்வா'] },
  { category: 'safety', weight: 2, tokens: ['safe', 'safety', 'danger', 'risk', 'hazard', 'பாதுகாப்பு', 'ஆபத்து', 'அபாயம்'] },
  { category: 'distance', weight: 2, tokens: ['distance', 'far', 'travel', 'near', 'commute', 'close to home', 'தொலைவு', 'தூரம்', 'தூரமா', 'பக்கத்துல'] },
  { category: 'training_quality', weight: 2, tokens: ['training', 'teach', 'quality', 'trainer', 'instructor', 'centre', 'பயிற்சி', 'கற்பிக்க', 'தரம்'] },
  { category: 'other', weight: 0.2, tokens: [] },
];

const ALIASES: Record<string, ConcernCategory> = {
  'job prospects': 'job_security',
  'career progression': 'career_growth',
  income: 'income',
  'job security': 'job_security',
  'social perception': 'social_perception',
  safety: 'safety',
  'career growth': 'career_growth',
  'further education': 'further_education',
  distance: 'distance',
  'training quality': 'training_quality',
  placement: 'placement',
  other: 'other',
};

export function normalizeCategory(raw: string): ConcernCategory {
  return ALIASES[raw.trim().toLowerCase()] ?? 'other';
}

export interface Classification {
  category: ConcernCategory;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
}

export function classifyConcern(text: string, lang: Lang = 'en'): Classification {
  const lower = text.toLowerCase();
  let best: { category: ConcernCategory; score: number } = { category: 'other', score: 0 };
  for (const rule of RULES) {
    let score = 0;
    for (const token of rule.tokens) {
      if (lower.includes(token)) score += rule.weight;
    }
    if (score > best.score) best = { category: rule.category, score };
  }

  const matched = text.length > 0;
  const confidence = matched ? Math.min(0.98, 0.45 + best.score * 0.12) : 0.2;
  const severity: Classification['severity'] =
    confidence > 0.8 ? 'high' : confidence > 0.55 ? 'medium' : 'low';

  return { category: best.category, confidence, severity };
}