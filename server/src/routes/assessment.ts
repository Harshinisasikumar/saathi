import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { clean, requireFields } from '../utils/validate.js';
import { computeSnapshot, tradeScoresFor } from '../services/counsellingService.js';

export const assessmentRouter = Router();

assessmentRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const missing = requireFields(req.body, ['sessionId', 'answers']);
    if (missing) {
      res.status(400).json({ error: missing });
      return;
    }
    const sessionId = clean(req.body.sessionId);
    const store = await getStore();
    if (!(await store.getSession(sessionId))) {
      res.status(404).json({ error: 'Session not found. Please restart counselling.' });
      return;
    }

    const answers = Array.isArray(req.body.answers)
      ? (req.body.answers as Array<{ questionId?: unknown; value?: unknown }>)
          .slice(0, 12)
          .map((a) => ({ questionId: clean(a?.questionId, 40), value: clean(a?.value, 200) }))
          .filter((a) => a.questionId && a.value)
      : [];

    const base = computeSnapshot(answers);
    const tradeScores = tradeScoresFor(store, base);
    const snapshot = { ...base, tradeScores };

    await store.saveAssessment({ sessionId, answers, snapshot });
    res.json({ ok: true, sessionId, snapshot });
  }),
);