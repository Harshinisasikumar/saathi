import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminAuth } from '../middleware/auth.js';
import { adminStats } from '../services/counsellingService.js';
import { getStore } from '../db/index.js';

export const adminRouter = Router();

adminRouter.get(
  '/dashboard',
  adminAuth,
  asyncHandler(async (_req, res) => {
    const stats = await adminStats();
    res.json({ stats, demoNote: 'Aggregated demo data. No personal information is exposed.' });
  }),
);

adminRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const store = await getStore();
    res.json({
      demoMode: true,
      demoNotice: {
        en: 'Demo data — for prototype demonstration only.',
        ta: 'டெமோ தரவு — முன்னோட்ட ஆர்ப்பாட்டத்திற்கு மட்டும்.',
      },
      trades: store.getTrades().map((t) => ({ id: t.id, name: t.name, category: t.category })),
    });
  }),
);

adminRouter.get(
  '/dashboard/*',
  adminAuth,
  (_req, res) => {
    res.status(404).json({ error: 'Not found.' });
  },
);