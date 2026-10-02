import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { CONCERN_LABELS, USER_TYPE_LABELS } from '../data/concerns.js';
import { ASSESSMENT_QUESTIONS } from '../data/assessment.js';
import { DEMO_NOTICE } from '../data/seedData.js';
import { env } from '../config/env.js';

export const metaRouter = Router();

metaRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const store = await getStore();
    res.json({
      demoMode: env.demoMode,
      demoNotice: DEMO_NOTICE,
      districts: store.getDistricts().map((d) => ({
        id: d.id,
        name: d.name,
        state: d.state,
      })),
      states: [{ id: 'tamil_nadu', name: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' } }],
      concernLabels: CONCERN_LABELS,
      userTypeLabels: USER_TYPE_LABELS,
      assessmentQuestions: ASSESSMENT_QUESTIONS,
      incomeBrackets: [
        { id: 'below_10000', label: { en: 'Below ₹10,000 / month', ta: '₹10,000க்கும் குறைவு' } },
        { id: '10000_25000', label: { en: '₹10,000 – ₹25,000', ta: '₹10,000 – ₹25,000' } },
        { id: '25000_50000', label: { en: '₹25,000 – ₹50,000', ta: '₹25,000 – ₹50,000' } },
        { id: 'above_50000', label: { en: 'Above ₹50,000', ta: '₹50,000க்கு மேல்' } },
      ],
      educationLevels: [
        { id: 'below_10', label: { en: 'Below Class 10', ta: '10ஆம் வகுப்புக்கு கீழ்' } },
        { id: 'class_10', label: { en: 'Class 10', ta: '10ஆம் வகுப்பு' } },
        { id: 'class_12', label: { en: 'Class 12', ta: '12ஆம் வகுப்பு' } },
        { id: 'diploma', label: { en: 'Diploma', ta: 'டிப்ளமோ' } },
        { id: 'graduate', label: { en: 'Graduate', ta: 'பட்டதாரி' } },
      ],
    });
  }),
);