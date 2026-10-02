import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clean, requireFields } from '../utils/validate.js';
import {
  buildComparison,
  buildPathway,
  buildScorecard,
  computeSnapshot,
  tradeScoresFor,
} from '../services/counsellingService.js';
import { getStore } from '../db/index.js';
import type { InterestSnapshot } from '../domain/types.js';

async function parseSnapshot(body: Record<string, unknown>): Promise<InterestSnapshot> {
  const s = body.snapshot as InterestSnapshot | undefined;
  if (s && Array.isArray(s.tradeScores)) {
    return s;
  }
  const store = await getStore();
  const base = computeSnapshot([]);
  return { ...base, tradeScores: tradeScoresFor(store, base) };
}

export const computationRouter = Router();

computationRouter.post(
  '/compare',
  asyncHandler(async (req, res) => {
    const district = clean(req.body.district ?? null, 40) || null;
    const snapshot = await parseSnapshot(req.body as Record<string, unknown>);
    res.json(await buildComparison(snapshot, district));
  }),
);

computationRouter.post(
  '/scorecard',
  asyncHandler(async (req, res) => {
    const missing = requireFields(req.body, ['concernCategory']);
    if (missing) {
      res.status(400).json({ error: missing });
      return;
    }
    const district = clean(req.body.district ?? null, 40) || null;
    const snapshot = await parseSnapshot(req.body as Record<string, unknown>);
    const category = clean(req.body.concernCategory, 40);
    res.json(await buildScorecard(snapshot, (category || 'other') as never, district));
  }),
);

computationRouter.get(
  '/pathway',
  asyncHandler(async (req, res) => {
    const tradeId = clean((req.query.tradeId as string) ?? null, 40) || null;
    res.json(await buildPathway(tradeId));
  }),
);