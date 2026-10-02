/** Sanitise a user-supplied string: trim, strip control characters, cap length. */
export function clean(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

export function cleanArr(value: unknown, maxItems = 10, maxLen = 60): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((v) => clean(v, maxLen))
    .filter(Boolean);
}

export function requireFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const f of fields) {
    const v = body[f];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      return `Missing required field: ${f}`;
    }
  }
  return null;
}