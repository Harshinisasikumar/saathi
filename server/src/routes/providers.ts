import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStore } from '../db/index.js';
import { clean } from '../utils/validate.js';

export const providersRouter = Router();

providersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const store = await getStore();
    const district = clean(req.query.district ?? null);
    const providers = store
      .getProviders()
      .filter((p) => !district || p.districtId === district)
      .map((p) => {
        const districtName = store.getDistricts().find((d) => d.id === p.districtId)?.name ?? null;
        const tradeNames = p.tradeIds.map((id) => store.getTradeById(id)?.name.en ?? id);
        return { ...p, districtName, tradeNames };
      });
    res.json({
      demoNotice:
        'Provider records in this prototype are demonstration records — contact the centre to verify accreditation.',
      providers,
    });
  }),
);