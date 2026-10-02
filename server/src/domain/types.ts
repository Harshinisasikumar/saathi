/**
 * Core domain types.
 *
 * Design rule for this codebase: nothing a counsellor or the platform says about
 * earnings / placement may exist without a `Metric` that carries provenance.
 * The UI is not allowed to print a number that is not traceable to a `Metric`
 * row, which is what makes "verified outcome data" a structural property
 * rather than a slogan.
 */

export type Lang = 'en' | 'ta';

export type Bilingual = Record<Lang, string>;

/**
 * How much we trust a number, and who says so.
 * - ncvt_public_aggregate  aggregated from NCVT / NCB official notification data
 * - scheme_tracker          collected from scheme MIS / SDMS partner reporting
 * - partner_assured         figure a named training partner commits to publicly
 * - synthetic_baseline      modelled estimate, clearly labelled as such in the UI
 */
export type Provenance =
  | 'ncvt_public_aggregate'
  | 'scheme_tracker'
  | 'partner_assured'
  | 'synthetic_baseline';

export type MetricUnit =
  | 'inr_per_month'
  | 'inr_total'
  | 'percent'
  | 'count'
  | 'months'
  | 'nsqf_level';

export interface Metric {
  value: number;
  unit: MetricUnit;
  /** How many people/records the figure is based on. */
  sampleSize: number;
  /** Period the figure covers, e.g. "2023-24" or "6 months post-training". */
  window: string;
  provenance: Provenance;
  /** Human-readable attribution shown in the UI citation strip. */
  sourceLabel: Bilingual;
  sourceUrl?: string;
  /** ISO date the figure was last checked against the source. */
  lastVerified: string;
}

export interface Rung {
  nsqfLevel: number;
  title: Bilingual;
  /** Typical time from entry training to this rung. */
  yearsFromEntry: number;
  role: Bilingual;
  earnings: Metric;
}

export interface JobRole {
  title: Bilingual;
  nsqfLevel: number;
  /** Who normally employs for this role. */
  employers: Bilingual;
}

export interface Trade {
  id: string;
  /** NSQF-aligned trade code where one exists. */
  code: string;
  name: Bilingual;
  category: TradeCategory;
  /** Plain description of the work, written to be read aloud to a parent. */
  oneLine: Bilingual;
  /** "A day in the life" - concrete, jargon free. */
  dayInLife: Bilingual;
  nsqfEntry: number;
  nsqfCeiling: number;
  roles: JobRole[];
  ladder: Rung[];
  /** Academic background that makes the trade easiest to enter. */
  eligibility: {
    minEducation: Bilingual;
    preferredStream: Bilingual;
  };
  /** Time and money required - used against the "fees are a waste" objection. */
  typicalDurationMonths: number;
  fee: Metric;
  safety: Bilingual;
  /** Direct, honest counter to the social-status objection. */
  perceptionNote: Bilingual;
  /** Common household objections specific to this trade. */
  sensitiveTo: string[];
}

export type TradeCategory =
  | 'electrical'
  | 'mechanical'
  | 'automotive'
  | 'construction'
  | 'digital'
  | 'apparel'
  | 'beauty_wellness'
  | 'health'
  | 'agriculture'
  | 'tourism_hospitality'
  | 'logistics'
  | 'energy_green';

export interface Provider {
  id: string;
  name: string;
  districtId: string;
  type: 'govt_iti' | 'private_iti' | 'scheme_centre' | 'industry_partner';
  scheme: 'pmkvy' | 'nsqf' | 'state_skill_centre' | 'cpsf' | 'none';
  nsqfAffiliated: boolean;
  accreditation: Bilingual;
  tradeIds: string[];
  /** Single point of contact families can actually verify. */
  verifiedOn: string;
  publicPhone: string;
  centreCode: string;
}

export interface District {
  id: string;
  name: Bilingual;
  state: Bilingual;
  /** Reference point the family already understands: a local unskilled wage. */
  wageBenchmark: Metric;
  /** Industries that hire this district's skillers - used to counter "no jobs here". */
  hiringClusters: Bilingual[];
  hasIndustryPartner: boolean;
}

export interface EarningsProfile {
  /** 25th percentile monthly, 6-12 months after completion. */
  p25: Metric;
  median: Metric;
  p75: Metric;
}

/** The full evidence bundle for one trade, optionally narrowed to a district. */
export interface OutcomeRecord {
  tradeId: string;
  districtId: string | null; // null = all-India aggregate
  earnings: EarningsProfile;
  placementWithin90Days: Metric;
  overallPlacement: Metric;
  wageEmployed: Metric;
  selfEmployed: Metric;
  governmentSector: Metric;
  /** Completion / dropout. Directly answers "will he drop out midway". */
  completionRate: Metric;
  medianTimeToFirstJobMonths: Metric;
  /** Sample of districts with providers for this trade - lets us be honest about coverage. */
  availableIn: number;
}

/* ------------------------------------------------------------------ */
/* Runtime / counselling flow records                                  */
/* ------------------------------------------------------------------ */

export type UserType = 'learner' | 'parent' | 'joint';

export const CONCERN_CATEGORIES = [
  'income',
  'job_security',
  'social_perception',
  'safety',
  'career_growth',
  'further_education',
  'distance',
  'training_quality',
  'placement',
  'other',
] as const;

export type ConcernCategory = (typeof CONCERN_CATEGORIES)[number];

export interface ConcernLabel {
  id: ConcernCategory;
  en: string;
  ta: string;
}

export interface SessionRecord {
  id: string;
  userType: UserType;
  lang: Lang;
  createdAt: string;
}

export interface LearnerProfileRecord {
  sessionId: string;
  age: number | null;
  gender: string | null;
  education: string | null;
  academicBackground: string | null;
  interests: string[];
  preferredWorkType: string[];
  learningPreference: string | null;
  preferredLocation: string | null;
  state: string;
  district: string;
  urbanity: 'urban' | 'semiurban' | 'rural' | 'unspecified';
  careerGoals: string | null;
}

export interface ParentProfileRecord {
  sessionId: string;
  state: string;
  district: string;
  incomeBracket: string | null;
  primaryConcern: ConcernCategory | null;
  maxDistanceKm: number | null;
  preference: 'job_immediate' | 'further_study' | 'undecided' | null;
}

export interface InterestSnapshot {
  /** Normalised 0..1 weight per interest tag, e.g. { electronics: 0.9 } */
  interestWeights: Record<string, number>;
  workPrefs: string[];
  learningPref: string | null;
  /** Best-matching trades in score order. */
  tradeScores: Array<{ tradeId: string; score: number; reasons: string[] }>;
}

export interface AssessmentRecord {
  sessionId: string;
  answers: Array<{ questionId: string; value: string }>;
  snapshot: InterestSnapshot;
}

export interface ConcernRecord {
  id: string;
  sessionId: string;
  rawText: string;
  detectedLang: Lang;
  category: ConcernCategory;
  /** 0..1 confidence of the deterministic classifier. */
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  createdAt: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatStructuredReply {
  answer: string;
  evidence: string[];
  forFamily: string;
  notKnown: string[];
  sources: SourceCitation[];
  demoNotice?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  text: string;
  lang: Lang;
  structured?: ChatStructuredReply;
  createdAt: string;
}

export interface ChatSessionRecord {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
}

export interface EscalationRecord {
  id: string;
  sessionId: string;
  language: Lang;
  concernCategory: ConcernCategory;
  contactMethod: string;
  preferredTime: string;
  description: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Evidence / source citations                                         */
/* ------------------------------------------------------------------ */

export type SourceNature = 'verified' | 'demo';

export interface SourceRecord {
  id: string;
  name: string;
  url: string | null;
  dataPeriod: string;
  nature: SourceNature;
  note: string | null;
}

export interface SourceCitation {
  name: string;
  url: string | null;
  dataPeriod: string;
  verificationStatus: string;
  nature: SourceNature;
}

export function toCitation(src: SourceRecord): SourceCitation {
  return {
    name: src.name,
    url: src.url,
    dataPeriod: src.dataPeriod,
    verificationStatus: src.nature === 'verified' ? 'VERIFIED' : 'DEMO',
    nature: src.nature,
  };
}

/* ------------------------------------------------------------------ */
/* Scorecard / comparison / pathway (computed, not stored)             */
/* ------------------------------------------------------------------ */

export type ScoreLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'LIMITED' | 'UNAVAILABLE';

export interface ScorecardCell {
  level: ScoreLevel;
  label: { en: string; ta: string };
  explanation: { en: string; ta: string }[];
}

export interface ScorecardResult {
  learnerInterest: ScorecardCell;
  familyConcerns: ScorecardCell;
  trainingAccessibility: ScorecardCell;
  careerPathwayEvidence: ScorecardCell;
  localOpportunityEvidence: ScorecardCell;
  dataConfidence: ScorecardCell;
  parentConcern: { category: ConcernCategory; label: { en: string; ta: string } };
}

export interface ComparisonRow {
  label: { en: string; ta: string };
  values: Array<{
    tradeId: string;
    text: { en: string; ta: string };
    source?: SourceCitation;
    demo?: boolean;
  }>;
}

export interface ComparisonView {
  header: Array<{ tradeId: string; name: { en: string; ta: string } }>;
  rows: ComparisonRow[];
}

export interface PathwayStep {
  label: { en: string; ta: string };
  detail: { en: string; ta: string };
  myNote?: { en: string; ta: string };
}

export interface PathwayView {
  steps: PathwayStep[];
  nsqfVerified: boolean;
  caveat: { en: string; ta: string };
}

/** Aggregated analytics shown on the admin dashboard (no PII). */
export interface AdminStats {
  totalSessions: number;
  parentSessions: number;
  learnerSessions: number;
  jointSessions: number;
  escalations: number;
  unresolvedConcerns: number;
  concernDistribution: Record<ConcernCategory, number>;
  byDistrict: Array<{ district: string; count: number; topConcern: string }>;
  concernShift: AdminConcernShift[];
}

export interface AdminConcernShift {
  category: ConcernCategory;
  label: { en: string; ta: string };
  before: string;
  after: string;
  note: { en: string; ta: string };
}