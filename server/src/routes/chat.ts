import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { uid } from '../db/store.js';
import { clean, requireFields } from '../utils/validate.js';
import { counsel } from '../ai/counsellor.js';
import { computeSnapshot, tradeScoresFor } from '../services/counsellingService.js';
import type { ChatMessage } from '../domain/types.js';

export const chatRouter = Router();

chatRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const missing = requireFields(req.body, ['sessionId', 'message']);
    if (missing) {
      res.status(400).json({ error: missing });
      return;
    }
    const sessionId = clean(req.body.sessionId);
    const message = clean(req.body.message, 500);
    const store = await getStore();
    const session = await store.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found. Please restart counselling.' });
      return;
    }
    if (!message) {
      res.status(400).json({ error: 'Please type a message.' });
      return;
    }

    const assessment = await store.getAssessment(sessionId);
    const learner = await store.getLearnerProfile(sessionId);
    const parent = await store.getParentProfile(sessionId);
    const concerns = await store.getConcerns(sessionId);
    const lastConcern = concerns[concerns.length - 1];
    const district = learner?.district ?? parent?.district ?? null;

    let snapshot;
    if (assessment) snapshot = assessment.snapshot;
    else if (learner) {
      const base = computeSnapshot([]);
      snapshot = { ...base, tradeScores: tradeScoresFor(store, base) };
    }

    const result = await counsel(message, {
      lang: session.lang ?? 'en',
      district,
      snapshot,
      concernCategory: lastConcern?.category,
    });

    const now = new Date().toISOString();
    const userMsg: ChatMessage = { id: uid('msg'), sessionId, role: 'user', text: message, lang: result.detectedLang, createdAt: now };
    const botMsg: ChatMessage = {
      id: uid('msg'),
      sessionId,
      role: 'assistant',
      text: result.message,
      lang: result.detectedLang,
      structured: result.structured,
      createdAt: now,
    };
    await store.saveChatMessage(userMsg);
    await store.saveChatMessage(botMsg);

    res.json({
      ok: true,
      reply: result.message,
      structured: result.structured,
      intent: result.intent,
      detectedLang: result.detectedLang,
      escalate: result.escalate,
      escalateReason: result.escalateReason ?? null,
    });
  }),
);

chatRouter.get(
  '/:sessionId',
  asyncHandler(async (req, res) => {
    const sessionId = clean(req.params.sessionId);
    const store = await getStore();
    res.json({ messages: await store.getChatMessages(sessionId) });
  }),
);