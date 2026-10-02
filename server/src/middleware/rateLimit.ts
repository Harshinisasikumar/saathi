import type { Request, Response, NextFunction } from 'express';

const hits = new Map<string, number[]>();

export function rateLimit(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length >= max) {
      res.status(429).json({ error: 'Too many requests. Please slow down and try again.' });
      return;
    }
    list.push(now);
    hits.set(key, list);
    next();
  };
}