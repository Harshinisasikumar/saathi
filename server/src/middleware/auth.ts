import type { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../config/env.js';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  if (!requireAdmin(req.headers.authorization)) {
    res.status(401).json({ error: 'Unauthorized. Provide valid admin credentials.' });
    return;
  }
  next();
}