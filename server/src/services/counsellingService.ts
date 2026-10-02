import type {
  AdminStats,
  ComparisonView,
  ConcernCategory,
  InterestSnapshot,
  Lang,
  PathwayView,
  ScorecardResult,
} from '../domain/types.js';
import { getStore } from '../db/index.js';
import { CONCERN_LABELS } from '../data/concerns.js';
import { demoCitation } from '../ai/rag.js';
import type { StoreBackend } from '../db/store.js';

/* ------------------------------------------------------------------ */
/* Career Interest Snapshot (prototype heuristic — not a validated     */
/* psychological test).                                                */
/* ------------------------------------------------------------------ */

const TAG_SCORES: Record<string, Record<string, number>> = {
  electronics: { electronics: 1, electrician: 0.5 },
  mechanical: { 'cnc-operator': 0.9, automotive: 0.6, electronics: 0.3 },
  computers: { electronics: 0.6, 'cnc-operator': 0.3 },
  construction: { electrician: 0.7, 'solar-pv': 0.3 },
  automotive: { automotive: 1, 'cnc-operator': 0.3 },
  electrical: { electrician: 1, 'solar-pv': 0.6, electronics: 0.4 },
  healthcare: {},
  agriculture: { 'solar-pv': 0.4 },
  design: { electronics: 0.3, 'solar-pv': 0.2 },
  renewable_energy: { 'solar-pv': 1, electrician: 0.4 },
};

const WORK_PREFS: Record<string, Record<string, number>> = {
  hands_on: { electrician: 0.06, 'cnc-operator': 0.06, automotive: 0.06, electronics: 0.06, 'solar-pv': 0.06 },
  computer_based: { 'cnc-operator': 0.12, electronics: 0.1 },
  field_work: { 'solar-pv': 0.14, electrician: 0.06 },
  workshop: { electrician: 0.1, 'cnc-operator': 0.1, automotive: 0.14 },
  office: {},
  customer_facing: { automotive: 0.1, 'solar-pv': 0.06 },
};

const LEARNING_PREFS: Record<string, Record<string, number>> = {
  practical: { electrician: 0.04, automotive: 0.04, electronics: 0.04, 'solar-pv': 0.04, 'cnc-operator': 0.04 },
  theory: { 'cnc-operator': 0.08 },
  mixed: {},
};

export function computeSnapshot(
  answers: Array<{ questionId: string; value: string }>,
): Omit<InterestSnapshot, 'tradeScores'> & { rawAnswers: Record<string, string[]> } {
  const byQ: Record<string, string[]> = {};
  for (const a of answers) {
    byQ[a.questionId] = a.value.split(',').map((v) => v.trim()).filter(Boolean);
  }

  const selected = (q: string) => byQ[q] ?? [];
  const scores: Record<string, number> = {};
  const addAll = (list: string[], map: Record<string, Record<string, number>>) => {
    for (const tag of list) {
      const row = map[tag];
      for (const trade of Object.keys(row ?? {})) {
        scores[trade] = (scores[trade] ?? 0) + row[trade];
      }
    }
  };

  addAll(selected('interests'), TAG_SCORES);
  addAll(selected('workpref'), WORK_PREFS);
  addAll(selected('learning'), LEARNING_PREFS);

  const q5 = selected('toolsmanship')[0];
  if (q5 === 'yes' || q5 === 'somewhat') {
    for (const [t, row] of Object.entries(WORK_PREFS.hands_on)) scores[t] = (scores[t] ?? 0) + row;
  }
  const q6 = selected('outdoors')[0];
  if (q6 === 'comfortable' || q6 === 'okay') scores['solar-pv'] = (scores['solar-pv'] ?? 0) + 0.06;
  if (q6 === 'avoid') scores['solar-pv'] = (scores['solar-pv'] ?? 0) - 0.08;
  const q7 = selected('priority')[0];
  if (q7 === 'learning_skills') {
    for (const t of ['electrician', 'electronics', 'solar-pv']) scores[t] = (scores[t] ?? 0) + 0.04;
  }

  return {
    interestWeights: Object.fromEntries(
      Object.keys(TAG_SCORES)
        .filter((t) => (byQ.interests ?? []).includes(t))
        .map((t) => [t, 1]),
    ),
    workPrefs: selected('workpref'),
    learningPref: selected('learning')[0] ?? null,
    rawAnswers: byQ,
  };
}

export function tradeScoresFor(
  store: StoreBackend,
  base: ReturnType<typeof computeSnapshot>,
): Array<{ tradeId: string; score: number; reasons: string[] }> {
  const trades = store.getTrades();
  const maxPossible = 1.05;
  return trades.map((t) => {
    const raw = base.rawAnswers ? computeScoreRaw(base, t.id) : 0;
    const score = Math.min(1, raw / maxPossible);
    const reasons = buildReasons(base, t.id);
    return { tradeId: t.id, score, reasons };
  });
}

function computeScoreRaw(base: ReturnType<typeof computeSnapshot>, tradeId: string): number {
  let s = 0;
  for (const tag of base.rawAnswers.interests ?? []) {
    s += TAG_SCORES[tag]?.[tradeId] ?? 0;
  }
  for (const wp of base.workPrefs ?? []) s += WORK_PREFS[wp]?.[tradeId] ?? 0;
  if (base.learningPref) s += LEARNING_PREFS[base.learningPref]?.[tradeId] ?? 0;
  return s;
}

function buildReasons(base: ReturnType<typeof computeSnapshot>, tradeId: string): string[] {
  const reasons: string[] = [];
  const tags = base.rawAnswers?.interests ?? [];
  const direct = tags.filter((t) => (TAG_SCORES[t]?.[tradeId] ?? 0) >= 0.5);
  if (direct.length > 0) reasons.push(`stated interest in ${direct.join(', ')}`);
  const work = base.workPrefs ?? [];
  const workHit = work.filter((w) => (WORK_PREFS[w]?.[tradeId] ?? 0) > 0);
  if (workHit.length > 0) reasons.push(`preference for ${workHit.join(', ')} work`);
  if (reasons.length === 0) reasons.push('no strong direct interest signals');
  return reasons;
}

/* ------------------------------------------------------------------ */
/* Scorecard                                                           */
/* ------------------------------------------------------------------ */

export async function buildScorecard(
  snapshot: InterestSnapshot,
  concernCategory: ConcernCategory,
  districtId: string | null,
): Promise<ScorecardResult> {
  const store = await getStore();
  const top = snapshot.tradeScores[0];
  const providersLocal = store.getProviders().filter((p) => !districtId || p.districtId === districtId);
  const localOutcome = top ? store.getOutcomes(top.tradeId, districtId)[0] : undefined;

  const interestLevel = top.score > 0.6 ? 'HIGH' : top.score > 0.4 ? 'MEDIUM' : 'LOW';
  const concernLbl = CONCERN_LABELS[concernCategory] ?? CONCERN_LABELS.other;
  const trainLevel = providersLocal.length > 0 ? 'MEDIUM' : 'LOW';
  const localLevel = localOutcome ? 'LIMITED' : 'UNAVAILABLE';

  return {
    learnerInterest: {
      level: interestLevel,
      label: { en: 'Learner Interest', ta: 'கற்பவர் விருப்பம்' },
      explanation: top
        ? [
            {
              en: `Highest match is ${store.getTradeById(top.tradeId)?.name.en ?? top.tradeId} at ${Math.round(top.score * 100)}% (${top.reasons.join('; ')}).`,
              ta: `மிக உயர்ந்த பொருத்தம் ${store.getTradeById(top.tradeId)?.name.ta ?? top.tradeId} — ${Math.round(top.score * 100)}% (${top.reasons.join('; ')}).`,
            },
          ]
        : [
            {
              en: 'No assessment provided yet.',
              ta: 'இன்னும் மதிப்பீடு அளிக்கப்படவில்லை.',
            },
          ],
    },
    familyConcerns: {
      level: 'MEDIUM',
      label: { en: 'Family Concerns', ta: 'குடும்ப கவலைகள்' },
      explanation: [
        {
          en: `Primary concern identified: ${concernLbl.en}. The counsellor discussed this concern with evidence from the knowledge base.`,
          ta: `முதன்மை கவலை: ${concernLbl.ta}. ஆலோசகர் இந்த கவலையை அறிவுத் தளத்தின் ஆதாரங்களுடன் விவாதித்தார்.`,
        },
      ],
    },
    trainingAccessibility: {
      level: trainLevel,
      label: { en: 'Training Accessibility', ta: 'பயிற்சி அணுகல்' },
      explanation: [
        {
          en:
            providersLocal.length > 0
              ? `${providersLocal.length} known provider${providersLocal.length > 1 ? 's' : ''} in${districtId ? ' your district area' : ' the dataset'}. Visit and verify before deciding.`
              : 'No provider records for your area in this prototype.',
          ta:
            providersLocal.length > 0
              ? `உங்கள் பகுதியில் ${providersLocal.length} வழங்குநர் பதிவுகள் உள்ளன. முடிவெடுப்பதற்கு முன் பார்வையிட்டு சரிபார்க்கவும்.`
              : 'இந்த முன்னோட்டத்தில் உங்கள் பகுதிக்கான வழங்குநர் பதிவுகள் இல்லை.',
        },
      ],
    },
    careerPathwayEvidence: {
      level: 'MEDIUM',
      label: { en: 'Career Pathway Evidence', ta: 'தொழில் பாதை ஆதாரம்' },
      explanation: [
        {
          en: 'Prototype includes demo qualification pathways. NSQF levels shown are prototype data — verify with the training provider.',
          ta: 'முன்னோட்டத்தில் டெமோ தகுதி பாதைகள் உள்ளன. காட்டப்படும் NSQF நிலைகள் முன்னோட்ட தரவு — வழங்குநருடன் சரிபார்க்கவும்.',
        },
      ],
    },
    localOpportunityEvidence: {
      level: localLevel,
      label: { en: 'Local Opportunity Evidence', ta: 'உள்ளூர் வாய்ப்பு ஆதாரம்' },
      explanation: [
        localOutcome
          ? {
              en: 'Local demo cohort exists for this trade in your district; treat as a small, non-official sample.',
              ta: 'உங்கள் மாவட்டத்தில் இந்த தொழிலுக்கான உள்ளூர் டெமோ குழு உள்ளது; சிறிய, அதிகாரப்பூர்வமற்ற மாதிரியாக கருதவும்.',
            }
          : {
              en: 'Local verified outcome data is unavailable for your district in this prototype.',
              ta: 'இந்த முன்னோட்டத்தில் உங்கள் மாவட்டத்திற்கான உள்ளூர் சரிபார்க்கப்பட்ட முடிவு தரவு இல்லை.',
            },
      ],
    },
    dataConfidence: {
      level: 'LOW',
      label: { en: 'Data Confidence', ta: 'தரவு நம்பகத்தன்மை' },
      explanation: [
        {
          en: 'All outcome figures in this prototype are demo data, not official statistics.',
          ta: 'இந்த முன்னோட்டத்தில் உள்ள அனைத்து முடிவு எண்களும் டெமோ தரவு; அதிகாரப்பூர்வ புள்ளிவிவரங்கள் அல்ல.',
        },
      ],
    },
    parentConcern: { category: concernCategory, label: concernLbl },
  };
}

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

export async function buildComparison(
  snapshot: InterestSnapshot,
  districtId: string | null,
): Promise<ComparisonView> {
  const store = await getStore();
  const ids = snapshot.tradeScores.map((s) => s.tradeId).slice(0, 4);

  const cell = (tradeId: string, text: { en: string; ta: string }, demo = false) => ({
    tradeId,
    text,
    source: demo ? demoCitation() : undefined,
    demo,
  });

  const rows = [
    {
      label: { en: 'Learner interest match', ta: 'கற்பவர் விருப்ப பொருத்தம்' },
      values: ids.map((id) => {
        const s = snapshot.tradeScores.find((x) => x.tradeId === id)!;
        return cell(id, { en: `${Math.round(s.score * 100)}%`, ta: `${Math.round(s.score * 100)}%` });
      }),
    },
    {
      label: { en: 'Training duration', ta: 'பயிற்சி காலம்' },
      values: ids.map((id) => {
        const t = store.getTradeById(id)!;
        return cell(id, { en: `${t.typicalDurationMonths} months`, ta: `${t.typicalDurationMonths} மாதங்கள்` }, true);
      }),
    },
    {
      label: { en: 'Qualification / NSQF level', ta: 'தகுதி / NSQF நிலை' },
      values: ids.map((id) => {
        const t = store.getTradeById(id)!;
        return cell(id, { en: `${t.roles[0]?.title.en} (NSQF ${t.nsqfEntry})`, ta: `${t.roles[0]?.title.ta} (NSQF ${t.nsqfEntry})` }, true);
      }),
    },
    {
      label: { en: 'Placement data', ta: 'வேலை வாய்ப்பு தரவு' },
      values: ids.map((id) => {
        const o = store.getOutcomes(id, null)[0];
        return cell(
          id,
          o
            ? { en: `Demo ${o.placementWithin90Days.value}% within 90 days`, ta: `டெமோ 90 நாட்களில் ${o.placementWithin90Days.value}%` }
            : { en: 'Unavailable', ta: 'கிடைக்கவில்லை' },
          true,
        );
      }),
    },
    {
      label: { en: 'Earnings data (demo)', ta: 'வருமான தரவு (டெமோ)' },
      values: ids.map((id) => {
        const o = store.getOutcomes(id, null)[0];
        return cell(
          id,
          o
            ? { en: `${o.earnings.p25.value.toLocaleString('en-IN')}–${o.earnings.p75.value.toLocaleString('en-IN')} ₹/month`, ta: `₹${o.earnings.p25.value}–${o.earnings.p75.value}/மாதம்` }
            : { en: 'Unavailable', ta: 'கிடைக்கவில்லை' },
          true,
        );
      }),
    },
    {
      label: { en: 'Career progression', ta: 'தொழில் முன்னேற்றம்' },
      values: ids.map((id) => {
        const t = store.getTradeById(id)!;
        return cell(id, { en: `${t.ladder.length} demo pathway rung(s)`, ta: `${t.ladder.length} டெமோ பாதை படிகள்` }, true);
      }),
    },
    {
      label: { en: 'Local availability (providers)', ta: 'உள்ளூர் கிடைக்கும் தன்மை' },
      values: ids.map((id) => {
        const p = store.getProviders().filter((x) => x.tradeIds.includes(id) && (!districtId || x.districtId === districtId));
        return cell(id, { en: p.length > 0 ? `${p.length} in dataset/local` : 'None in local data', ta: p.length > 0 ? `${p.length} உள்ளது` : 'உள்ளூர் தரவில் இல்லை' }, true);
      }),
    },
  ];

  return {
    header: ids.map((id) => ({ tradeId: id, name: store.getTradeById(id)!.name })),
    rows,
  };
}

export async function buildComparisonForTrades(
  tradeIds: string[],
  districtId: string | null,
): Promise<ComparisonView> {
  const store = await getStore();
  const snapshot: InterestSnapshot = {
    interestWeights: {},
    workPrefs: [],
    learningPref: null,
    tradeScores: tradeIds.map((id, i) => ({ tradeId: id, score: 0, reasons: [] })),
  };
  return buildComparison(snapshot, districtId);
}

/* ------------------------------------------------------------------ */
/* Pathway                                                             */
/* ------------------------------------------------------------------ */

interface Step {
  label: { en: string; ta: string };
  detail: { en: string; ta: string };
}

const GENERIC_STEPS: Step[] = [
  { label: { en: 'School', ta: 'பள்ளி' }, detail: { en: 'Complete Class 8 / 10 / 12', ta: '8 / 10 / 12ஆம் வகுப்பு முடித்தல்' } },
  { label: { en: 'Vocational training', ta: 'தொழிற்பயிற்சி' }, detail: { en: 'Enrol in an ITI / scheme course for a trade', ta: 'ஒரு தொழிலுக்கு ITI / திட்ட படிப்பில் சேருதல்' } },
  { label: { en: 'Entry-level job', ta: 'ஆரம்ப நிலை வேலை' }, detail: { en: 'Work as a trainee or entry technician', ta: 'பயிற்சியாளர் அல்லது தொழில்நுட்பராக வேலை' } },
  { label: { en: 'Experience', ta: 'அனுபவம்' }, detail: { en: '1–3 years of hands-on work and learning', ta: '1–3 ஆண்டுகள் நடைமுறை அனுபவம்' } },
  { label: { en: 'Advanced training', ta: 'மேம்பட்ட பயிற்சி' }, detail: { en: 'Higher certificates or supervisor skill courses', ta: 'மேல் சான்றிதழ்கள் அல்லது மேற்பார்வை படிப்புகள்' } },
  { label: { en: 'Higher responsibility / further education', ta: 'அதிக பொறுப்பு / மேற்படிப்பு' }, detail: { en: 'Supervisor, self-employment or diploma/degree routes', ta: 'மேற்பார்வையாளர், சுய தொழில் அல்லது டிப்ளமோ/டிகிரி' } },
];

export async function buildPathway(tradeId: string | null): Promise<PathwayView> {
  const store = await getStore();
  const trade = tradeId ? store.getTradeById(tradeId) : undefined;
  const steps: PathwayView['steps'] = GENERIC_STEPS.map((s) => ({ ...s, myNote: undefined }));
  if (trade) {
    steps[1].detail = {
      en: `${trade.name.en}: about ${trade.typicalDurationMonths} months, ${trade.eligibility.minEducation.en}`,
      ta: `${trade.name.ta}: சுமார் ${trade.typicalDurationMonths} மாதங்கள், ${trade.eligibility.minEducation.ta}`,
    };
    const first = trade.ladder[0];
    if (first) {
      steps[2].detail = { en: first.role.en, ta: first.role.ta };
      steps[2].myNote = { en: `Demo reference: ${first.title.en}`, ta: `டெமோ குறிப்பு: ${first.title.ta}` };
    }
    const last = trade.ladder[trade.ladder.length - 1];
    if (last) {
      steps[5].detail = { en: last.role.en, ta: last.role.ta };
      steps[5].myNote = { en: `Demo reference: ${last.title.en}`, ta: `டெமோ குறிப்பு: ${last.title.ta}` };
    }
  }
  return {
    steps,
    nsqfVerified: false,
    caveat: {
      en: 'Possible pathway — verify with counsellor/provider. NSQF levels shown are prototype data.',
      ta: 'சாத்தியமான பாதை — ஆலோசகர்/வழங்குநருடன் சரிபார்க்கவும். NSQF நிலைகள் முன்னோட்ட தரவு.',
    },
  };
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export async function adminStats(): Promise<AdminStats> {
  const store = await getStore();
  return store.stats();
}

export function getConcernLabel() {
  return CONCERN_LABELS;
}

export type { Lang };