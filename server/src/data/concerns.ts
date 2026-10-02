import type { ConcernCategory, ConcernLabel } from '../domain/types.js';

export const CONCERN_LABELS: Record<ConcernCategory, ConcernLabel> = {
  income: { id: 'income', en: 'Income', ta: 'வருமானம்' },
  job_security: { id: 'job_security', en: 'Job security', ta: 'வேலை பாதுகாப்பு' },
  social_perception: { id: 'social_perception', en: 'Social perception', ta: 'சமூக மதிப்பீடு' },
  safety: { id: 'safety', en: 'Safety', ta: 'பாதுகாப்பு' },
  career_growth: { id: 'career_growth', en: 'Career progression', ta: 'தொழில் முன்னேற்றம்' },
  further_education: { id: 'further_education', en: 'Further education', ta: 'மேற்படிப்பு' },
  distance: { id: 'distance', en: 'Distance from home', ta: 'வீட்டிலிருந்து தொலைவு' },
  training_quality: { id: 'training_quality', en: 'Training quality', ta: 'பயிற்சி தரம்' },
  placement: { id: 'placement', en: 'Placement', ta: 'வேலை வாய்ப்பு' },
  other: { id: 'other', en: 'Other', ta: 'மற்றவை' },
};

export const USER_TYPE_LABELS = {
  learner: { en: 'Learner', ta: 'கற்பவர்' },
  parent: { en: 'Parent / Family', ta: 'பெற்றோர் / குடும்பம்' },
  joint: { en: 'Joint counselling', ta: 'இணைந்த ஆலோசனை' },
} as const;