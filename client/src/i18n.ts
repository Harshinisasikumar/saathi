import type { Bilingual, Lang } from './types';

export const STEP_LABELS: Array<{ en: string; ta: string }> = [
  { en: 'Family profile', ta: 'குடும்ப விவரம்' },
  { en: 'Learner snapshot', ta: 'கற்பவர் மதிப்பீடு' },
  { en: 'Parent concern', ta: 'பெற்றோர் கவலை' },
  { en: 'Counsellor', ta: 'ஆலோசகர்' },
  { en: 'Compare trades', ta: 'தொழில் ஒப்பீடு' },
  { en: 'Scorecard', ta: 'மதிப்பீட்டு அட்டை' },
  { en: 'Career pathway', ta: 'தொழில் பாதை' },
];

export const UI = {
  appName: { en: 'Saathi — Family Career Counselling', ta: 'சாதி — குடும்ப தொழில் ஆலோசனை' },
  tagline: {
    en: 'Making Vocational Careers a Family Decision.',
    ta: 'தொழிற்கல்வி முடிவுகளை குடும்ப முடிவாக மாற்றுதல்.',
  },
  sub: {
    en: 'AI-powered career counselling that helps learners and families understand vocational opportunities using verified career and outcome data.',
    ta: 'சரிபார்க்கப்பட்ட தொழில் மற்றும் முடிவு தரவுகளுடன் கற்பவர்களுக்கும் குடும்பங்களுக்கும் தொழில்வாய்ப்புகளை புரிந்துகொள்ள உதவும் AI ஆலோசனை.',
  },
  howWorkTitle: {
    en: 'How it works',
    ta: 'எப்படி இயங்குகிறது',
  },
  howWork: {
    en: 'Understand the trade → See career opportunities → Check local information → Discuss concerns → Make an informed decision.',
    ta: 'தொழிலைப் புரிந்து கொள்ளுங்கள் → தொழில் வாய்ப்புகளைப் பார்க்கவும் → உள்ளூர் தகவலை சரிபார்க்கவும் → கவலைகளைப் பேசுங்கள் → தகவலுடன் முடிவெடுங்கள்.',
  },
  btnStart: { en: 'Start Counselling', ta: 'ஆலோசனை தொடங்கு' },
  btnExplore: { en: 'Explore Vocational Careers', ta: 'தொழிற்பயிற்சிகளை ஆராய்க' },
  btnParentMode: { en: 'Parent Mode', ta: 'பெற்றோர் பயன்முறை' },
  btnEnglish: { en: 'English', ta: 'ஆங்கிலம்' },
  btnTamil: { en: 'தமிழ்', ta: 'தமிழ்' },
  demoMode: {
    en: 'Hackathon Demo Mode',
    ta: 'Hackathon டெமோ பயன்முறை',
  },
  demoNoticeBody: {
    en: 'Some outcome values shown in this prototype are demonstration data and are not official statistics.',
    ta: 'இந்த முன்னோட்டத்தில் காட்டப்படும் சில முடிவு மதிப்புகள் செயல் விளக்க தரவுகள்; அதிகாரப்பூர்வ புள்ளிவிவரங்கள் அல்ல.',
  },
  chooseUser: {
    en: 'Who is using Saathi today?',
    ta: 'இன்று சாதியை யார் பயன்படுத்துகிறார்?',
  },
  back: { en: 'Back', ta: 'பின்' },
  next: { en: 'Continue', ta: 'தொடரவும்' },
  submit: { en: 'Submit', ta: 'சமர்ப்பிக்க' },
  privacyNote: {
    en: 'This information is used only for counselling. We do not ask for unnecessary personal details and we do not show private conversations on the admin dashboard.',
    ta: 'இந்த தகவல்கள் ஆலோசனைக்கு மட்டுமே பயன்படுத்தப்படுகின்றன. தேவையற்ற தனிப்பட்ட விவரங்களை கேட்கிறோம் இல்லை; நிர்வாக பலகையில் தனிப்பட்ட உரையாடல்களை காட்டுவதில்லை.',
  },
  learnerSection: {
    en: 'Learner information',
    ta: 'கற்பவர் தகவல்',
  },
  familySection: {
    en: 'Family information',
    ta: 'குடும்ப தகவல்',
  },
  govHeading: {
    en: 'Vocational Education Counselling Platform',
    ta: 'தொழிற்கல்வி ஆலோசனை மேடை',
  },
  loading: { en: 'Loading…', ta: 'ஏற்றுகிறது…' },
  talkHuman: { en: 'Talk to a Human Counsellor', ta: 'மனித ஆலோசகரிடம் பேச' },
  talkHumanShort: { en: 'Human counsellor', ta: 'மனித ஆலோசகர்' },
};

export type UIKey = keyof typeof UI;

export function pickLang(lang: Lang, value: Bilingual): string {
  return value[lang] ?? value.en;
}

export const LanguageNames: Record<Lang, string> = { en: 'English', ta: 'தமிழ்' };

export const CONCERN_OPTIONS = [
  { id: 'income', en: 'Income', ta: 'வருமானம்' },
  { id: 'job_security', en: 'Job security', ta: 'வேலை பாதுகாப்பு' },
  { id: 'social_perception', en: 'Social perception', ta: 'சமூக மதிப்பீடு' },
  { id: 'safety', en: 'Safety', ta: 'பாதுகாப்பு' },
  { id: 'career_growth', en: 'Career growth', ta: 'தொழில் முன்னேற்றம்' },
  { id: 'further_education', en: 'Further education', ta: 'மேற்படிப்பு' },
  { id: 'distance', en: 'Distance from home', ta: 'வீட்டிலிருந்து தொலைவு' },
  { id: 'training_quality', en: 'Training quality', ta: 'பயிற்சி தரம்' },
  { id: 'placement', en: 'Placement', ta: 'வேலை வாய்ப்பு' },
  { id: 'other', en: 'Other', ta: 'மற்றவை' },
];