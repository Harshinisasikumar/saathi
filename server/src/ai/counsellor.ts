import type {
  ChatStructuredReply,
  InterestSnapshot,
  Lang,
  SourceCitation,
} from '../domain/types.js';
import {
  demoCitation,
  inr,
  range,
  retrieveTrades,
  topMatchTrades,
  type RetrievedTrade,
} from './rag.js';
import { getStore } from '../db/index.js';
import { DEMO_NOTICE } from '../data/seedData.js';
import { detectLang } from './language.js';

/**
 * Deterministic, evidence-grounded counselling engine. All facts come from
 * the knowledge base; the engine only composes explanations. Nothing is
 * invented at query time.
 */

function l(lang: Lang, en: string, ta: string): string {
  return lang === 'ta' ? ta : en;
}

export type Intent =
  | 'greeting'
  | 'recommend'
  | 'trade_info'
  | 'income'
  | 'placement'
  | 'progression'
  | 'further_education'
  | 'safety'
  | 'social_perception'
  | 'local'
  | 'cost'
  | 'eligibility'
  | 'guidance'
  | 'thanks'
  | 'help'
  | 'unknown';

const INTENT_RULES: Array<{ intent: Intent; tokens: string[] }> = [
  { intent: 'greeting', tokens: ['hi', 'hello', 'hey', 'vanakkam', 'வணக்கம்', 'good morning', 'good evening', 'நல்வணக்கம்'] },
  { intent: 'thanks', tokens: ['thanks', 'thank you', 'nandri', 'நன்றி', 'super', 'நல்ல', 'great'] },
  { intent: 'recommend', tokens: ['recommend', 'best course', 'which trade', 'which course', 'suggest', 'choose', 'which one', 'எந்த கோர்ஸ்', 'எந்த தொழில்', 'பரிந்துரை', 'தேர்வு'] },
  { intent: 'income', tokens: ['salary', 'earn', 'income', 'pay', 'money', 'wage', 'sambalam', 'சம்பளம்', 'வருமானம்', 'பணம்', 'சம்பாதிக்க', 'ஊதியம்'] },
  { intent: 'placement', tokens: ['placement', 'placed', 'job after', 'get a job', 'will i get', 'hiring', 'kidaikkuma', 'கிடைக்குமா', 'வேலை வாய்ப்பு', 'பிளேஸ்மெண்ட்'] },
  { intent: 'progression', tokens: ['growth', 'future', 'progress', 'promotion', 'career growth', 'futurel', 'வளர்ச்சி', 'முன்னேற்றம்', 'எதிர்காலம்', 'மேம்பட'] },
  { intent: 'further_education', tokens: ['degree', 'higher studies', 'further study', 'college', 'study', 'diploma', 'டிகிரி', 'மேற்படிப்பு', 'மேல்படிப்பு', 'படிக்க'] },
  { intent: 'safety', tokens: ['safe', 'safety', 'danger', 'risk', 'hazard', 'பாதுகாப்பு', 'ஆபத்து'] },
  { intent: 'social_perception', tokens: ['social', 'society', 'status', 'respect', 'prestige', 'சமூக', 'மரியாதை', 'மதிப்பு'] },
  { intent: 'local', tokens: ['near', 'close', 'distance', 'nearby', 'iti', 'centre', 'centre?', 'which iti', 'thooram', 'தொலைவு', 'தூரம்', 'அருகில்', 'ஐடிஐ', 'மையம்', 'பக்கத்துல'] },
  { intent: 'cost', tokens: ['fee', 'fees', 'cost', 'expense', 'money for course', 'charges', 'கட்டணம்', 'செலவு', 'கட்டண'] },
  { intent: 'eligibility', tokens: ['eligible', 'eligibility', 'qualification', 'pass', 'education needed', 'class', 'தகுதி', 'தேர்ச்சி', 'வகுப்பு'] },
  { intent: 'guidance', tokens: ['what is vocational', 'vocational education', 'how does it work', 'about vocational', 'what are options', 'tell me more', 'என்ன', 'எப்படி', 'விவரம்', 'தொழிற்கல்வி'] },
  { intent: 'help', tokens: ['help', 'support', 'what can you do', 'உதவி'] },
  { intent: 'trade_info', tokens: ['electrician', 'cnc', 'solar', 'electronics', 'automotive', 'wiring', 'machine', 'panel', 'repair', 'vehicle', 'மின்சார', 'எலக்ட்ரீஷியன்', 'சோலார்', 'இயந்திர', 'வாகன', 'பழுது'] },
];

export function detectIntent(text: string): Intent {
  const lower = text.toLowerCase();
  for (const rule of INTENT_RULES) {
    if (rule.tokens.some((t) => lower.includes(t))) return rule.intent;
  }
  return 'unknown';
}

export interface CounsellingContext {
  lang: Lang;
  district: string | null;
  snapshot?: InterestSnapshot;
  concernCategory?: string;
}

export interface CounsellorResult {
  message: string;
  structured: ChatStructuredReply;
  intent: Intent;
  detectedLang: Lang;
  escalate: boolean;
  escalateReason?: string;
}

export async function counsel(message: string, ctx: CounsellingContext): Promise<CounsellorResult> {
  const lang = detectLang(message);
  const intent = detectIntent(message);
  const store = await getStore();
  const districtName = ctx.district ? store.getDistricts().find((d) => d.id === ctx.district) : undefined;
  const districtId = ctx.district;

  const escalate = (reason: string): CounsellorResult => ({
    message: l(
      lang,
      'I cannot verify this from the information available to me. A human counsellor can help you better.',
      'என்னிடம் உள்ள தகவல்களில் இதை என்னால் சரிபார்க்க முடியவில்லை. மனித ஆலோசகர் உங்களுக்கு சிறப்பாக உதவ முடியும்.',
    ),
    structured: {
      answer: l(
        lang,
        'We could not find verified information for this question in our knowledge base.',
        'எங்கள் அறிவுத் தளத்தில் இந்தக் கேள்விக்கான சரிபார்க்கப்பட்ட தகவலை கண்டறிய முடியவில்லை.',
      ),
      evidence: [
        l(lang, 'Verified data is currently unavailable for this criterion.', 'இந்த அளவுகோலுக்கு சரிபார்க்கப்பட்ட தரவு தற்போது கிடைக்கவில்லை.'),
      ],
      forFamily: l(
        lang,
        'Rather than guess, we recommend speaking with a human counsellor or the training centre directly.',
        'யூகிக்காமல், மனித ஆலோசகரிடம் அல்லது பயிற்சி மையத்துடன் நேரடியாக பேச பரிந்துரைக்கிறோம்.',
      ),
      notKnown: [l(lang, 'This is outside the verified knowledge base of the prototype.', 'இது முன்னோட்ட அறிவுத் தளத்திற்கு வெளியே உள்ளது.')],
      sources: [],
    },
    intent,
    detectedLang: lang,
    escalate: true,
    escalateReason: reason,
  });

  const replyForTrade = (rt: RetrievedTrade): ChatStructuredReply => {
    const { trade, outcome, localOutcome, providers } = rt;
    const sources: SourceCitation[] = [];
    const evidence: string[] = [];

    evidence.push(l(lang, `What the trade involves: ${trade.oneLine[lang]}`, `தொழில் பற்றி: ${trade.oneLine[lang]}`));
    evidence.push(l(lang, `Entry eligibility: ${trade.eligibility.minEducation[lang]}`, `சேர்க்கை தகுதி: ${trade.eligibility.minEducation[lang]}`));
    evidence.push(
      l(
        lang,
        `Typical training duration: ${trade.typicalDurationMonths} months. NSQF level at entry: ${trade.nsqfEntry} (prototype data — verify with provider).`,
        `வழக்கமான பயிற்சி காலம்: ${trade.typicalDurationMonths} மாதங்கள். NSQF நிலை: ${trade.nsqfEntry} (முன்னோட்ட தரவு — வழங்குநருடன் சரிபார்க்கவும்).`,
      ),
    );
    evidence.push(
      l(
        lang,
        `Common job roles: ${trade.roles.map((r) => r.title[lang]).join(', ')}.`,
        `பொதுவான வேலை பாத்திரங்கள்: ${trade.roles.map((r) => r.title[lang]).join(', ')}.`,
      ),
    );

    if (outcome) {
      sources.push(demoCitation());
      evidence.push(
        l(
          lang,
          `Demo earnings range 6–12 months after training: ${range(outcome.earnings.p25.value, outcome.earnings.p75.value)} per month (median ${inr(outcome.earnings.median.value)}).`,
          `பயிற்சிக்குப் பின் 6–12 மாதங்களில் டெமோ வருமான வரம்பு: மாதத்திற்கு ${range(outcome.earnings.p25.value, outcome.earnings.p75.value)} (median ${inr(outcome.earnings.median.value)}).`,
        ),
      );
      evidence.push(
        l(
          lang,
          `Demo demo-cohort placement within 90 days: ${outcome.placementWithin90Days.value}% (sample: ${outcome.placementWithin90Days.sampleSize}).`,
          `90 நாட்களில் டெமோ வாய்ப்பு: ${outcome.placementWithin90Days.value}% (மாதிரி: ${outcome.placementWithin90Days.sampleSize}).`,
        ),
      );
    }

    if (localOutcome) {
      sources.push(demoCitation());
      evidence.push(
        l(
          lang,
          `Local (${districtName?.name[lang] ?? districtId}) earnings range: ${range(localOutcome.earnings.p25.value, localOutcome.earnings.p75.value)} (small demo cohort, n=${localOutcome.earnings.median.sampleSize}).`,
          `உள்ளூர் (${districtName?.name[lang] ?? districtId}) வருமான வரம்பு: ${range(localOutcome.earnings.p25.value, localOutcome.earnings.p75.value)} (சிறிய டெமோ குழு, n=${localOutcome.earnings.median.sampleSize}).`,
        ),
      );
    } else {
      evidence.push(
        l(
          lang,
          'Local verified outcome data for your district is unavailable for this trade.',
          'இந்த தொழிலுக்கு உங்கள் மாவட்டத்திற்கான உள்ளூர் சரிபார்க்கப்பட்ட முடிவு தரவு கிடைக்கவில்லை.',
        ),
      );
    }

    if (providers.length > 0) {
      evidence.push(
        l(
          lang,
          `Training providers in/near ${districtName?.name[lang] ?? districtId}: ${providers.map((p) => p.name).join(', ')}.`,
          `${districtName?.name[lang] ?? districtId} அருகில் பயிற்சி வழங்குநர்கள்: ${providers.map((p) => p.name).join(', ')}.`,
        ),
      );
    }

    const forFamily = ctx.snapshot
      ? l(
          lang,
          'Based on the learner profile, this trade can be weighed against the learner\u2019s stated interests before making a family decision.',
          'கற்பவரின் விருப்பங்களுடன் இந்த தொழிலை ஒப்பிட்டு குடும்ப முடிவு எடுப்பது நல்லது.',
        )
      : l(
          lang,
          'Discuss this trade with the learner and check the local training centre before deciding.',
          'இந்த தொழில் குறித்து கற்பவருடன் பேசி, உள்ளூர் பயிற்சி மையத்தை சரிபார்த்து முடிவு எடுக்கவும்.',
        );

    const notKnown = [
      l(
        lang,
        'Historical placement demo data does not guarantee future employment.',
        'கடந்தகால வாய்ப்பு டெமோ தரவு எதிர்கால வேலைவாய்ப்புக்கு உத்தரவாதம் அல்ல.',
      ),
      localOutcome
        ? l(lang, 'Local demo samples are small and not official statistics.', 'உள்ளூர் டெமோ மாதிரிகள் சிறியவை; அதிகாரப்பூர்வ புள்ளிவிவரங்கள் அல்ல.')
        : l(lang, 'Local verified outcome data is unavailable.', 'உள்ளூர் சரிபார்க்கப்பட்ட முடிவு தரவு கிடைக்கவில்லை.'),
    ];

    return {
      answer: l(
        lang,
        `${trade.name[lang]} is one of the vocational trade options in our prototype dataset. Here is what is known about it.`,
        `${trade.name[lang]} எங்கள் முன்னோட்ட தரவுத்தொகுப்பில் உள்ள தொழிற்பயிற்சி விருப்பங்களில் ஒன்றாகும். அதை பற்றி தெரிந்தவை இங்கே.`,
      ),
      evidence,
      forFamily,
      notKnown,
      sources: sources.length ? sources : [demoCitation()],
      demoNotice: DEMO_NOTICE[lang],
    };
  };

  switch (intent) {
    case 'greeting': {
      return {
        message: l(
          lang,
          'Vanakkam. I am the family career counsellor. I can help explain vocational trades using evidence we actually have.',
          'வணக்கம். நான் குடும்ப தொழில் ஆலோசகர். உண்மையான ஆதாரங்களுடன் தொழிற்பயிற்சி விருப்பங்களை விளக்க உதவுகிறேன்.',
        ),
        structured: {
          answer: l(
            lang,
            'Ask me about a trade (electrician, CNC operator, solar, electronics, automotive), earnings, placement, career progression, safety, or training centres near you.',
            'ஒரு தொழில் (எலக்ட்ரீஷியன், CNC, சோலார், எலக்ட்ரானிக்ஸ், ஆட்டோமோட்டிவ்), வருமானம், வேலை வாய்ப்பு, முன்னேற்றம், பாதுகாப்பு அல்லது உங்கள் அருகில் உள்ள பயிற்சி மையங்கள் பற்றி கேளுங்கள்.',
          ),
          evidence: [l(lang, 'Our prototype knowledge base currently covers 5 trades with clearly-labelled demo data.', 'எங்கள் முன்னோட்ட அறிவுத் தளம் தற்போது 5 தொழில்களை உள்ளடக்குகிறது — அனைத்து தரவுகளும் டெமோ.')],
          forFamily: l(lang, 'We help families make an informed decision — we do not push any single career.', 'ஒரே தொழிலை திணிக்காமல், தகவலுடன் முடிவெடுக்க குடும்பங்களுக்கு உதவுகிறோம்.'),
          notKnown: [],
          sources: [],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'recommend': {
      const all = await topMatchTrades(districtId);
      return {
        message: l(
          lang,
          'I do not rank trades into a "best career". Instead, I can show how each trade fits what you told us.',
          'நான் தொழில்களை "சிறந்த தொழில்" என தரவரிசைப்படுத்த மாட்டேன். ஒவ்வொரு தொழிலும் உங்கள் விருப்பங்களுடன் எப்படி பொருந்துகிறது என்பதைக் காட்ட முடியும்.',
        ),
        structured: {
          answer: l(
            lang,
            'Use the "Compare trades" step after your assessment. It compares trades on interest match, duration, qualification, placement data, earnings data and local availability — with sources for each fact.',
            'மதிப்பீட்டிற்குப் பிறகு "தொழில் ஒப்பீடு" படியில், விருப்ப பொருத்தம், காலம், தகுதி, வேலை வாய்ப்பு, வருமானம் மற்றும் உள்ளூர் கிடைக்கும் தன்மை ஆகியவற்றில் தொழில்கள் ஒப்பிடப்படும்.',
          ),
          evidence: all.map(
            (r) => l(lang, `${r.trade.name[lang]} — ${r.trade.oneLine[lang]}`, `${r.trade.name[lang]} — ${r.trade.oneLine[lang]}`),
          ),
          forFamily: l(lang, 'A family decision considers the learner, the family concern, distance, and evidence together.', 'குடும்ப முடிவில் கற்பவர், குடும்ப கவலை, தொலைவு மற்றும் ஆதாரங்கள் அனைத்தும் சேர்த்து பார்க்கப்படுகின்றன.'),
          notKnown: [],
          sources: [demoCitation()],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'trade_info': {
      const matches = await retrieveTrades(message, districtId);
      if (matches.length === 0) {
        return escalate('trade not covered by knowledge base');
      }
      const top = matches[0];
      return {
        message: top.trade.oneLine[lang],
        structured: replyForTrade(top),
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'income': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) return escalate('earnings question without matching trade');
      return {
        message: l(lang, 'Earnings are shown as a range, never as a promise.', 'வருமானம் ஒரு வரம்பாகக் காட்டப்படுகிறது; உறுதிமொழி அல்ல.'),
        structured: {
          answer: l(
            lang,
            `For ${trade.name[lang]}, available (demo) earnings range 6–12 months after training is shown below.`,
            `${trade.name[lang]}வுக்கு, பயிற்சிக்குப் பிறகு 6–12 மாதங்களில் டெமோ வருமான வரம்பு கீழே.`,
          ),
          evidence: (() => {
            const out = matches[0].outcome;
            const row = matches[0].localOutcome ?? out;
            if (!row) return [l(lang, 'No outcome record found in the knowledge base.', 'அறிவுத் தளத்தில் முடிவு பதிவு இல்லை.')];
            return [
              l(
                lang,
                `Earnings range: ${range(row.earnings.p25.value, row.earnings.p75.value)} per month. Median: ${inr(row.earnings.median.value)}. (Demo cohort, n=${row.earnings.median.sampleSize})`,
                `வருமான வரம்பு: ${range(row.earnings.p25.value, row.earnings.p75.value)} மாதம். Median: ${inr(row.earnings.median.value)}. (டெமோ குழு, n=${row.earnings.median.sampleSize})`,
              ),
              l(lang, 'Actual earnings depend on employer, city, experience and skill level.', 'உண்மையான வருமானம் முதலாளி, நகரம், அனுபவம் மற்றும் திறன் அளவை பொறுத்தது.'),
            ];
          })(),
          forFamily: l(
            lang,
            'Compare this range with income the household earns today, and with the cost of training, when deciding.',
            'முடிவெடுக்கும்போது இந்த வரம்பை வீட்டின் தற்போதைய வருமானம் மற்றும் பயிற்சி செலவுடன் ஒப்பிடவும்.',
          ),
          notKnown: [
            matches[0].localOutcome
              ? l(lang, 'Local demo samples are small and not official statistics.', 'உள்ளூர் டெமோ மாதிரிகள் சிறியவை; அதிகாரப்பூர்வமல்ல.')
              : l(lang, 'Verified local earnings data for your district is unavailable.', 'உங்கள் மாவட்டத்திற்கான உள்ளூர் சரிபார்க்கப்பட்ட வருமான தரவு கிடைக்கவில்லை.'),
          ],
          sources: [demoCitation()],
          demoNotice: DEMO_NOTICE[lang],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'placement': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) return escalate('placement question without matching trade');
      return {
        message: l(lang, 'Historical placement data does not guarantee future employment.', 'கடந்தகால வேலை வாய்ப்பு தரவு எதிர்கால வேலைக்கு உத்தரவாதம் அல்ல.'),
        structured: {
          answer: l(
            lang,
            `For ${trade.name[lang]}, the prototype has only demo placement figures.`,
            `${trade.name[lang]}வுக்கு, முன்னோட்டத்தில் டெமோ வாய்ப்பு புள்ளிவிவரங்கள் மட்டுமே உள்ளன.`,
          ),
          evidence: (() => {
            const out = matches[0].outcome;
            const row = matches[0].localOutcome ?? out;
            if (!row) return [l(lang, 'No outcome record found.', 'முடிவு பதிவு இல்லை.')];
            return [
              l(
                lang,
                `Demo: placed within 90 days ${row.placementWithin90Days.value}% of a sample of ${row.placementWithin90Days.sampleSize}. Demo overall placement ${row.overallPlacement.value}%.`,
                `டெமோ: 90 நாட்களில் ${row.placementWithin90Days.sampleSize} பேரில் ${row.placementWithin90Days.value}% பேருக்கு வேலை கிடைத்தது. ஒட்டுமொத்தம் ${row.overallPlacement.value}%.`,
              ),
              l(lang, 'These are synthetic figures for the prototype, not official government statistics.', 'இவை முன்னோட்டத்திற்கான செயற்கை எண்கள்; அதிகாரப்பூர்வ அரசு புள்ளிவிவரங்கள் அல்ல.'),
            ];
          })(),
          forFamily: l(
            lang,
            'Ask the training centre directly for their recent batch placements and visit them before deciding.',
            'முடிவெடுப்பதற்கு முன், பயிற்சி மையத்திடம் சமீபத்திய வேலை வாய்ப்பு விவரங்களை நேரடியாக கேட்டு பார்வையிடவும்.',
          ),
          notKnown: [l(lang, 'We cannot verify real placement performance for any provider in this prototype.', 'இந்த முன்னோட்டத்தில் எந்த வழங்குநரின் உண்மையான வாய்ப்பு செயல்திறனையும் எங்களால் சரிபார்க்க முடியாது.')],
          sources: [demoCitation()],
          demoNotice: DEMO_NOTICE[lang],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'progression':
    case 'further_education': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) return escalate('progression question without matching trade');
      const steps = trade.ladder
        .map(
          (r) =>
            l(
              lang,
              `NSQF level ${r.nsqfLevel}: ${r.title[lang]} — typical ${r.yearsFromEntry} years after entry.`,
              `NSQF நிலை ${r.nsqfLevel}: ${r.title[lang]} — தொடக்கத்தில் இருந்து ${r.yearsFromEntry} ஆண்டுகள்.`,
            ),
        )
        .join('\n');
      return {
        message: l(
          lang,
          'Career progression in skilled trades usually follows: training → entry job → experience → advanced training → higher responsibility or further study.',
          'திறன் தொழில்களில் முன்னேற்றம்: பயிற்சி → ஆரம்ப வேலை → அனுபவம் → மேம்பட்ட பயிற்சி → அதிக பொறுப்பு அல்லது மேற்படிப்பு.',
        ),
        structured: {
          answer: l(
            lang,
            `For ${trade.name[lang]}, the prototype notes this possible progression:`,
            `${trade.name[lang]}வுக்கு, இந்த சாத்தியமான முன்னேற்றத்தை முன்னோட்டம் காட்டுகிறது:`,
          ),
          evidence: [
            steps,
            l(lang, 'Qualification pathways exist (certificate → higher certificate/diploma) but must be verified with the provider.', 'தகுதி வழிகள் உள்ளன (சான்றிதழ் → மேல் சான்றிதழ்/டிப்ளமோ) ஆனால் வழங்குநருடன் சரிபார்க்க வேண்டும்.'),
          ],
          forFamily: l(
            lang,
            'With a trade certificate, further study bridges like diploma or degree-level skill courses are possible, but this is not guaranteed and depends on entrance rules.',
            'தொழில் சான்றிதழுடன், டிப்ளமோ அல்லது டிகிரி மட்ட படிப்புகள் சாத்தியம், ஆனால் அது உறுதியல்ல; சேர்க்கை விதிகளை பொறுத்தது.',
          ),
          notKnown: [l(lang, 'Verified NSQF progression beyond the listed levels is unavailable in this prototype.', 'பட்டியலிடப்பட்ட நிலைகளுக்கு அப்பால் சரிபார்க்கப்பட்ட NSQF முன்னேற்றம் முன்னோட்டத்தில் இல்லை.')],
          sources: [demoCitation()],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'safety': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) return escalate('safety question without matching trade');
      return {
        message: trade.safety[lang],
        structured: {
          answer: l(lang, `Safety notes for ${trade.name[lang]}`, `${trade.name[lang]}வுக்கான பாதுகாப்பு குறிப்புகள்`),
          evidence: [trade.safety[lang]],
          forFamily: l(lang, 'Safe work depends on proper training, supervision and protective gear (PPE).', 'பாதுகாப்பான வேலை சரியான பயிற்சி, மேற்பார்வை மற்றும் பாதுகாப்பு உபகரணங்களை சார்ந்தது.'),
          notKnown: [l(lang, 'We have no verified accident or injury statistics in this prototype.', 'இந்த முன்னோட்டத்தில் விபத்து/காயம் புள்ளிவிவரங்கள் எதுவும் இல்லை.')],
          sources: [],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'social_perception': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) return escalate('social perception question without matching trade');
      return {
        message: trade.perceptionNote[lang],
        structured: {
          answer: l(lang, 'On social perception', 'சமூக மதிப்பீடு குறித்து'),
          evidence: [trade.perceptionNote[lang]],
          forFamily: l(lang, 'Social perception differs between families and communities; a neutral discussion can help.', 'சமூக மதிப்பீடு குடும்பம்/சமூகத்திற்கு ஏற்ப வேறுபடும்; நடுநிலை கலந்துரையாடல் உதவலாம்.'),
          notKnown: [l(lang, 'We do not have survey data measuring social perception in this prototype.', 'சமூக மதிப்பீட்டை அளவிடும் கருத்துக்கணிப்பு தரவு இந்த முன்னோட்டத்தில் இல்லை.')],
          sources: [],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'local': {
      const store2 = await getStore();
      const providers = store2
        .getProviders()
        .filter((p) => !districtId || p.districtId === districtId)
        .slice(0, 5);
      return {
        message: l(
          lang,
          providers.length > 0
            ? `Here are training providers ${districtName ? `in/near ${districtName.name[lang]}` : 'known in the dataset'}.`
            : 'We have no provider records for your area in this prototype.',
          providers.length > 0
            ? `${districtName ? `\`${districtName.name[lang]}` : 'தரவுத்தொகுப்பில் உள்ள'} அருகில் உள்ள பயிற்சி வழங்குநர்கள் இதோ.`
            : 'உங்கள் பகுதிக்கான வழங்குநர் பதிவுகள் இந்த முன்னோட்டத்தில் இல்லை.',
        ),
        structured: {
          answer: l(lang, 'Training provider information (prototype):', 'பயிற்சி வழங்குநர் தகவல் (முன்னோட்டம்):'),
          evidence:
            providers.length > 0
              ? providers.map(
                  (p) =>
                    l(
                      lang,
                      `${p.name} — ${p.type.replace(/_/g, ' ')}. Trades: ${p.tradeIds.join(', ')}. Accreditation: ${p.accreditation[lang]}.`,
                      `${p.name} — ${p.type.replace(/_/g, ' ')}. தொழில்கள்: ${p.tradeIds.join(', ')}. அங்கீகாரம்: ${p.accreditation[lang]}.`,
                    ),
                )
              : [l(lang, 'Local verified outcome data is unavailable for this area.', 'இந்த பகுதிக்கான உள்ளூர் சரிபார்க்கப்பட்ட தரவு கிடைக்கவில்லை.')],
          forFamily: l(lang, 'Verify the centre\u2019s current accreditation and batch placement record directly before deciding.', 'முடிவெடுப்பதற்கு முன், மையத்தின் தற்போதைய அங்கீகாரம் மற்றும் வாய்ப்பு பதிவை நேரடியாக சரிபார்க்கவும்.'),
          notKnown: [l(lang, 'Provider records here are demonstration records, not a verified directory.', 'இங்கு உள்ள வழங்குநர் பதிவுகள் செயல் விளக்க பதிவுகள்; சரிபார்க்கப்பட்ட பட்டியல் அல்ல.')],
          sources: [],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'cost': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) return escalate('cost question without matching trade');
      return {
        message: l(lang, 'Fees vary by centre; only a prototype figure is available.', 'கட்டணம் மையத்திற்கு ஏற்ப மாறுபடும்; முன்னோட்ட எண் மட்டுமே உள்ளது.'),
        structured: {
          answer: l(
            lang,
            `${trade.name[lang]}: typical prototype fee ${inr(trade.fee.value)} for approximately ${trade.typicalDurationMonths} months.`,
            `${trade.name[lang]}: சுமார் ${trade.typicalDurationMonths} மாதங்களுக்கு முன்னோட்ட கட்டணம் ${inr(trade.fee.value)}.`,
          ),
          evidence: [l(lang, 'Many government ITI and scheme courses charge low or zero tuition fees — check the centre directly.', 'பல அரசு ITI மற்றும் திட்ட படிப்புகளுக்கு குறைந்த அல்லது இலவச கட்டணம் உண்டு — மையத்தை நேரடியாக கேளுங்கள்.')],
          forFamily: l(lang, 'Compare the fee with the earnings range and your family budget.', 'கட்டணத்தை வருமான வரம்பு மற்றும் குடும்ப பட்ஜெட்டுடன் ஒப்பிடவும்.'),
          notKnown: [l(lang, 'Verified fee schedules for specific centres are unavailable in this prototype.', 'குறிப்பிட்ட மையங்களின் சரிபார்க்கப்பட்ட கட்டண விவரம் இந்த முன்னோட்டத்தில் இல்லை.')],
          sources: [demoCitation()],
          demoNotice: DEMO_NOTICE[lang],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'eligibility': {
      const matches = await retrieveTrades(message, districtId);
      const trade = matches[0]?.trade;
      if (!trade) {
        return {
          message: l(lang, 'Eligibility varies by trade and centre.', 'தகுதி தொழில் மற்றும் மையத்திற்கு ஏற்ப மாறுபடும்.'),
          structured: {
            answer: l(lang, 'Generally, vocational trades are open after Class 8/10/12. Each trade lists a minimum education.', 'பொதுவாக, 8/10/12ஆம் வகுப்புக்குப் பிறகு தொழிற்பயிற்சிகள் உள்ளன. ஒவ்வொரு தொழிலுக்கும் குறைந்தபட்ச கல்வி உள்ளது.'),
            evidence: [l(lang, 'See the trade facts below in the comparison step for exact minimum education per trade (prototype data).', 'ஒவ்வொரு தொழிலுக்கான குறைந்தபட்ச கல்வி ஒப்பீட்டு படியில் காட்டப்படும் (முன்னோட்ட தரவு).')],
            forFamily: l(lang, 'Confirm with the specific centre whether entrance requires any written test.', 'நுழைவுக்கு எழுதப்பட்ட தேர்வு தேவையா என மையத்துடன் உறுதிப்படுத்தவும்.'),
            notKnown: [],
            sources: [],
          },
          intent,
          detectedLang: lang,
          escalate: false,
        };
      }
      return {
        message: trade.eligibility.minEducation[lang],
        structured: {
          answer: l(lang, `Eligibility for ${trade.name[lang]}`, `${trade.name[lang]}வுக்கான தகுதி`),
          evidence: [
            `Min education: ${trade.eligibility.minEducation[lang]}`,
            `Preferred stream: ${trade.eligibility.preferredStream[lang]}`,
          ],
          forFamily: l(lang, 'Eligibility is per-centre; always verify with the training provider.', 'தகுதி ஒவ்வொரு மையத்திற்கும் மாறும்; எப்போதும் பயிற்சி வழங்குநருடன் சரிபார்க்கவும்.'),
          notKnown: [l(lang, 'Verified per-centre seat availability is unavailable in this prototype.', 'மையம் வாரியான இடங்கள் பற்றிய சரிபார்க்கப்பட்ட தரவு முன்னோட்டத்தில் இல்லை.')],
          sources: [demoCitation()],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'thanks':
    case 'help': {
      return {
        message: l(lang, 'Happy to help. Ask about any of the five trades or use the steps to compare and decide as a family.', 'உதவுவதில் மகிழ்ச்சி. ஐந்து தொழில்கள் பற்றி கேளுங்கள் அல்லது ஒப்பிட்டு குடும்பமாக முடிவெடுக்க படிகளைப் பயன்படுத்தவும்.'),
        structured: {
          answer: l(lang, 'You can continue asking questions at any time, or move on to compare trades.', 'எப்போது வேண்டுமானாலும் கேள்விகள் கேட்கலாம், அல்லது தொழில்களை ஒப்பிட தொடரலாம்.'),
          evidence: [l(lang, 'We answer only from the prototype knowledge base and label demo data clearly.', 'முன்னோட்ட அறிவுத் தளத்தில் இருந்து மட்டுமே பதிலளிக்கிறோம்; டெமோ தரவு தெளிவாக குறிக்கப்படுகிறது.')],
          forFamily: l(lang, 'If your concern remains unresolved, you can request a human counsellor.', 'உங்கள் கவலை தீரவில்லை என்றால், மனித ஆலோசகரை கேட்கலாம்.'),
          notKnown: [],
          sources: [],
        },
        intent,
        detectedLang: lang,
        escalate: false,
      };
    }

    case 'guidance':
    default:
    case 'unknown': {
      const matches = await retrieveTrades(message, districtId);
      if (matches.length > 0) {
        const top = matches[0];
        return {
          message: top.trade.oneLine[lang],
          structured: replyForTrade(top),
          intent,
          detectedLang: lang,
          escalate: false,
        };
      }
      return escalate('question outside the verified knowledge base');
    }
  }
}