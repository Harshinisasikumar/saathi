import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { clean } from '../utils/validate.js';
import { demoCitation, inr } from '../ai/rag.js';

export const tradesRouter = Router();

tradesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const store = await getStore();
    const district = clean(_req.query.district ?? null);
    const trades = store.getTrades().map((t) => {
      const outcome = store.getOutcomes(t.id, null)[0];
      const localOutcome = district ? store.getOutcomes(t.id, district)[0] : undefined;
      const providers = store.getProviders().filter((p) => p.tradeIds.includes(t.id));
      return {
        id: t.id,
        code: t.code,
        name: t.name,
        category: t.category,
        oneLine: t.oneLine,
        durationMonths: t.typicalDurationMonths,
        nsqfEntry: t.nsqfEntry,
        eligibility: t.eligibility,
        roles: t.roles.map((r) => r.title),
        earningsDemo: outcome ? `${inr(outcome.earnings.p25.value)}–${inr(outcome.earnings.p75.value)}/month` : 'Unavailable',
        localOutcome: localOutcome ? 'yes' : 'no',
        providerCountLocal: providers.filter((p) => !district || p.districtId === district).length,
      };
    });
    res.json({
      demoNotice: {
        en: 'Demo data — for prototype demonstration only. All outcome figures shown here are synthetic, not official statistics.',
        ta: 'டெமோ தரவு — முன்னோட்ட ஆர்ப்பாட்டத்திற்கு மட்டும். இங்குள்ள அனைத்து முடிவு எண்களும் செயற்கையானவை.',
      },
      trades,
    });
  }),
);

tradesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore();
    const id = clean(req.params.id);
    const trade = store.getTradeById(id);
    if (!trade) {
      res.status(404).json({ error: 'Trade not found.' });
      return;
    }
    const outcomes = store.getOutcomes(id);
    const providers = store.getProviders().filter((p) => p.tradeIds.includes(id));
    res.json({
      trade,
      outcomes,
      providers,
      source: demoCitation(),
    });
  }),
);