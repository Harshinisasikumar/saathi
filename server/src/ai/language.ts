import type { Lang } from '../domain/types.js';

const TAMIL_RE = /[\u0B80-\u0BFF]/;

export function detectLang(text: string): Lang {
  return TAMIL_RE.test(text) ? 'ta' : 'en';
}

export function hasTamil(text: string): boolean {
  return TAMIL_RE.test(text);
}