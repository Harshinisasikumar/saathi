import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { uid } from '../db/store.js';
import { clean, requireFields } from '../utils/validate.js';
import { normalizeCategory } from '../ai/concernClassifier.js';
import type { EscalationRecord, Lang } from '../domain/types.js';

export const escalationRouter = Router();

escalationRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const missing = requireFields(req.body, ['sessionId']);
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

    const lang: Lang = req.body.language === 'ta' ? 'ta' : 'en';
    const record: EscalationRecord = {
      id: uid('esc'),
      sessionId,
      language: lang,
      concernCategory: normalizeCategory(String(req.body.concernCategory ?? 'other')),
      contactMethod: clean(req.body.contactMethod, 60) || 'phone',
      preferredTime: clean(req.body.preferredTime, 60) || 'anytime',
      description: clean(req.body.description, 400) || '',
      createdAt: new Date().toISOString(),
    };
    await store.saveEscalation(record);

    res.status(201).json({
      ok: true,
      escalationId: record.id,
      message: 'Counsellor request submitted.',
      note: 'A counsellor will contact you. For the hackathon, this created a record instead of calling a counsellor.',
    });
  }),
);