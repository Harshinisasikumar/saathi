import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { uid } from '../db/store.js';
import { clean, cleanArr, requireFields } from '../utils/validate.js';
import { normalizeCategory } from '../ai/concernClassifier.js';
import type { SessionRecord, Lang, UserType } from '../domain/types.js';

export const usersRouter = Router();

usersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const err = requireFields(req.body, ['userType']);
    if (err) {
      res.status(400).json({ error: err });
      return;
    }
    const userType: UserType = ['learner', 'parent', 'joint'].includes(req.body.userType)
      ? req.body.userType
      : 'joint';
    const lang: Lang = req.body.lang === 'ta' ? 'ta' : 'en';
    const store = await getStore();
    const session: SessionRecord = {
      id: uid('sess'),
      userType,
      lang,
      createdAt: new Date().toISOString(),
    };
    await store.createSession(session);
    res.status(201).json({ sessionId: session.id, userType: session.userType, lang: session.lang });
  }),
);

usersRouter.put(
  '/:sessionId/learner-profile',
  asyncHandler(async (req, res) => {
    const sessionId = clean(req.params.sessionId);
    const store = await getStore();
    if (!(await store.getSession(sessionId))) {
      res.status(404).json({ error: 'Session not found. Please restart counselling.' });
      return;
    }
    const b = req.body;
    await store.saveLearnerProfile({
      sessionId,
      age: typeof b.age === 'number' ? Math.max(0, Math.min(100, Math.round(b.age))) : null,
      gender: clean(b.gender, 30) || null,
      education: clean(b.education, 60) || null,
      academicBackground: clean(b.academicBackground, 60) || null,
      interests: cleanArr(b.interests),
      preferredWorkType: cleanArr(b.preferredWorkType),
      learningPreference: clean(b.learningPreference, 30) || null,
      preferredLocation: clean(b.preferredLocation, 60) || null,
      state: clean(b.state, 60) || 'Tamil Nadu',
      district: clean(b.district, 40) || 'salem',
      urbanity: ['urban', 'semiurban', 'rural', 'unspecified'].includes(b.urbanity)
        ? b.urbanity
        : 'unspecified',
      careerGoals: clean(b.careerGoals, 200) || null,
    });
    res.json({ ok: true, sessionId });
  }),
);

usersRouter.put(
  '/:sessionId/parent-profile',
  asyncHandler(async (req, res) => {
    const sessionId = clean(req.params.sessionId);
    const store = await getStore();
    if (!(await store.getSession(sessionId))) {
      res.status(404).json({ error: 'Session not found. Please restart counselling.' });
      return;
    }
    const b = req.body;
    await store.saveParentProfile({
      sessionId,
      state: clean(b.state, 60) || 'Tamil Nadu',
      district: clean(b.district, 40) || 'salem',
      incomeBracket: clean(b.incomeBracket, 40) || null,
      primaryConcern: clean(b.primaryConcern, 40) ? normalizeCategory(clean(b.primaryConcern, 40)) : null,
      maxDistanceKm: typeof b.maxDistanceKm === 'number' ? Math.max(0, Math.min(200, b.maxDistanceKm)) : null,
      preference: ['job_immediate', 'further_study', 'undecided'].includes(b.preference)
        ? b.preference
        : null,
    });
    res.json({ ok: true, sessionId });
  }),
);