import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { uid } from '../db/store.js';
import { clean, requireFields } from '../utils/validate.js';
import { classifyConcern } from '../ai/concernClassifier.js';
import { detectLang } from '../ai/language.js';
import { CONCERN_LABELS } from '../data/concerns.js';
import type { ConcernRecord } from '../domain/types.js';

export const parentConcernsRouter = Router();

parentConcernsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const missing = requireFields(req.body, ['sessionId', 'text']);
    if (missing) {
      res.status(400).json({ error: missing });
      return;
    }
    const sessionId = clean(req.body.sessionId);
    const rawText = clean(req.body.text, 500);
    const store = await getStore();
    if (!(await store.getSession(sessionId))) {
      res.status(404).json({ error: 'Session not found. Please restart counselling.' });
      return;
    }
    if (!rawText) {
      res.status(400).json({ error: 'Please enter or speak your concern.' });
      return;
    }

    const detectedLang = detectLang(rawText);
    const cls = classifyConcern(rawText, detectedLang);
    const label = CONCERN_LABELS[cls.category];

    const record: ConcernRecord = {
      id: uid('conc'),
      sessionId,
      rawText,
      detectedLang,
      category: cls.category,
      confidence: cls.confidence,
      severity: cls.severity,
      createdAt: new Date().toISOString(),
    };
    await store.saveConcern(record);

    res.json({
      ok: true,
      concernId: record.id,
      category: cls.category,
      label,
      detectedLang,
      confidence: cls.confidence,
      severity: cls.severity,
      rawText,
    });
  }),
);