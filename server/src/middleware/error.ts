import type { Request, Response, NextFunction } from 'express';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found.' });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[saathi] server error:', err);
  const message =
    process.env.NODE_ENV === 'production'
      ? 'We couldn\u2019t process that request right now. Please try again.'
      : err.message ?? 'Unexpected server error.';
  res.status(500).json({
    error: message,
    fallback:
      'We couldn\'t retrieve a response right now. Please try again or connect with a counsellor.',
  });
}