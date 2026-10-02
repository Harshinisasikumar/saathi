import type { District, Metric } from '../domain/types.js';

const SRC_NSS = {
  sourceLabel: {
    en: 'Reference wage: PLFS / TN construction labour rate card (skilled helper)',
    ta: 'ஒப்பீட்டு wage: PLFS / TN கட்டுமான தொழிலாளி வீத அட்டவணை',
  },
  sourceUrl: 'https://www.mospi.gov.in/',
  lastVerified: '2024-11-01',
} satisfies Partial<Metric>;

function wage(value: number, window: string): Metric {
  return {
    value,
    unit: 'inr_per_month',
    sampleSize: 420,
    window,
    provenance: 'ncvt_public_aggregate',
    ...SRC_NSS,
  };
}

/**
 * Wage benchmarks are the anchor for every income conversation.
 * A parent does not respond to "this trade pays 18,000". They respond to
 * "this trade pays 18,000, and the carpenter you already know earns 12,500".
 */
export const DISTRICTS: District[] = [
  {
    id: 'chennai',
    name: { en: 'Chennai', ta: 'சென்னை' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(13500, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Auto ancillaries (Ambattur, Guindy)', ta: 'ஆட்டோ துணைத் தொழிற்சாலை (அம்பத்தூர், குந்தி)' },
      { en: 'IT services & facilities', ta: 'ஐடி சேவைகள் & பயன்பாட்டு' },
      { en: 'Construction & metro projects', ta: 'கட்டுமானம் & மெட்ரோ பணிகள்' },
    ],
    hasIndustryPartner: true,
  },
  {
    id: 'coimbatore',
    name: { en: 'Coimbatore', ta: 'கோயம்புத்தூர்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(12000, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Engineering goods & pump manufacturers', ta: 'அறிவியல் பொருட்கள் & பம்பு உற்பத்தியாளர்' },
      { en: 'Export textiles & apparel', ta: 'ஏற்றுமதி ஜவுளி & ஆபாரல்' },
      { en: 'CNC job shops', ta: 'CNC சிறு தொழிற்சாலைகள்' },
    ],
    hasIndustryPartner: true,
  },
  {
    id: 'madurai',
    name: { en: 'Madurai', ta: 'மதுரை' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(10000, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Hospitals & diagnostics', ta: 'மருத்துவமனைகள் & டயக்னஸ்டிக்ஸ்' },
      { en: 'Tourism & hospitality', ta: 'சுற்றுலா & விடுமனைத்துறை' },
      { en: 'Agriculture value chain', ta: 'விவசாய சங்கிலி' },
    ],
    hasIndustryPartner: true,
  },
  {
    id: 'trichy',
    name: { en: 'Tiruchirappalli', ta: 'திருச்சிராப்பள்ளி' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(10500, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Textile mills & spinning', ta: 'ஜவுளி ஆலைகள்' },
      { en: 'Rolling mills & engineering', ta: 'ரோலிங் மில்ல்கள் & அறிவியல்' },
      { en: 'Gold jewellery workshops', ta: 'தங்க நகைத்தயாரிப்பு' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'salem',
    name: { en: 'Salem', ta: 'சேலம்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(9500, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Speciality steel & forging', ta: 'சிறப்பு எஃகு & பட்டி' },
      { en: 'Egg processing & agro', ta: 'முட்டை செயலாக்கம் & விவசாயம்' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'tirunelveli',
    name: { en: 'Tirunelveli', ta: 'திருநெல்வேலி' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(9000, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Agro-processing (palmyra, rice)', ta: 'விவசாய செயலாக்கம்' },
      { en: 'Border & district administration', ta: 'காவல் & மாவட்ட நிர்வாகம்' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'erode',
    name: { en: 'Erode', ta: 'ஈரோடு' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(10000, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Turmeric & agro mills', ta: 'மஞ்சள் & கூழ் ஆலைகள்' },
      { en: 'Knitwear export cluster', ta: 'நைட்வேர் ஏற்றுமதி தொகுதி' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'vellore',
    name: { en: 'Vellore', ta: 'வேலூர்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(10500, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Leather & footwear units', ta: 'தோல் & காலணி ஆலைகள்' },
      { en: 'Engineering services', ta: 'அறிவியல் சேவைகள்' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'thanjavur',
    name: { en: 'Thanjavur', ta: 'தஞ்சாவூர்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(9500, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Rice mills', ta: 'நெல் ஆலைகள்' },
      { en: 'Temple town services & tourism', ta: 'கோயில் நகர சேவைகள் & சுற்றுலா' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'dindigul',
    name: { en: 'Dindigul', ta: 'திண்டுக்கல்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(9000, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Cement & block works', ta: 'சிமென்ட் & துளைக்கல்' },
      { en: 'Cardamom & spice processing', ta: 'மிளகு & மசாலா செயலாக்கம்' },
    ],
    hasIndustryPartner: false,
  },
  {
    id: 'tiruppur',
    name: { en: 'Tiruppur', ta: 'திருப்பூர்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(11500, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Knitwear export (largest cluster)', ta: 'நைட்வேர் ஏற்றுமதி (மிகப்பெரிய தொகுதி)' },
      { en: 'Dyeing & processing units', ta: 'நிறமூட்டல் & செயலாக்க ஆலைகள்' },
    ],
    hasIndustryPartner: true,
  },
  {
    id: 'kancheepuram',
    name: { en: 'Kancheepuram', ta: 'காஞ்சிபுரம்' },
    state: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
    wageBenchmark: wage(11000, 'typical month, 2024'),
    hiringClusters: [
      { en: 'Silk weaving & saree units', ta: 'பட்டு நெசவு & சேலை ஆலைகள்' },
      { en: 'IT corridor (Sholinganallur belt)', ta: 'ஐடி பரம்பலை' },
    ],
    hasIndustryPartner: true,
  },
];

export const DISTRICT_BY_ID = new Map(DISTRICTS.map((d) => [d.id, d]));