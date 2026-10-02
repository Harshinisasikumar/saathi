export type Lang = 'en' | 'ta';
export type Bilingual = Record<Lang, string>;

export type UserType = 'learner' | 'parent' | 'joint';

export interface ConcernLabel {
  id: string;
  en: string;
  ta: string;
}

export interface DistrictOption {
  id: string;
  name: Bilingual;
  state: Bilingual;
}

export interface AssessmentOption {
  value: string;
  label: Bilingual;
}

export interface AssessmentQuestion {
  id: string;
  type: 'single' | 'multi';
  prompt: Bilingual;
  options: AssessmentOption[];
}

export interface MetaResponse {
  demoMode: boolean;
  demoNotice: Bilingual;
  districts: DistrictOption[];
  concernLabels: Record<string, ConcernLabel>;
  userTypeLabels: Record<UserType, Bilingual>;
  assessmentQuestions: AssessmentQuestion[];
  incomeBrackets: Array<{ id: string; label: Bilingual }>;
  educationLevels: Array<{ id: string; label: Bilingual }>;
}

export interface TradeScore {
  tradeId: string;
  score: number;
  reasons: string[];
}

export interface InterestSnapshot {
  interestWeights: Record<string, number>;
  workPrefs: string[];
  learningPref: string | null;
  tradeScores: TradeScore[];
}

export interface SourceCitation {
  name: string;
  url: string | null;
  dataPeriod: string;
  verificationStatus: string;
  nature: 'verified' | 'demo';
}

export interface StructuredReply {
  answer: string;
  evidence: string[];
  forFamily: string;
  notKnown: string[];
  sources: SourceCitation[];
  demoNotice?: string;
}

export interface ChatReply {
  reply: string;
  structured: StructuredReply;
  intent: string;
  detectedLang: Lang;
  escalate: boolean;
  escalateReason: string | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
  structured?: StructuredReply;
  escalate?: boolean;
  escalateReason?: string | null;
}

export interface TradeSummary {
  id: string;
  code: string;
  name: Bilingual;
  category: string;
  oneLine: Bilingual;
  durationMonths: number;
  nsqfEntry: number;
  eligibility: { minEducation: Bilingual; preferredStream: Bilingual };
  roles: Bilingual[];
  earningsDemo: string;
  localOutcome: 'yes' | 'no';
  providerCountLocal: number;
}

export interface TradeRecord {
  id: string;
  code: string;
  name: Bilingual;
  category: string;
  oneLine: Bilingual;
  dayInLife: Bilingual;
  nsqfEntry: number;
  roles: Array<{ title: Bilingual; nsqfLevel: number; employers: Bilingual }>;
  ladder: Array<{ nsqfLevel: number; title: Bilingual; yearsFromEntry: number; role: Bilingual }>;
  eligibility: { minEducation: Bilingual; preferredStream: Bilingual };
  typicalDurationMonths: number;
  safety: Bilingual;
  perceptionNote: Bilingual;
}

export type ScoreLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'LIMITED' | 'UNAVAILABLE';

export interface ScorecardCell {
  level: ScoreLevel;
  label: Bilingual;
  explanation: Bilingual[];
}

export interface ScorecardResult {
  learnerInterest: ScorecardCell;
  familyConcerns: ScorecardCell;
  trainingAccessibility: ScorecardCell;
  careerPathwayEvidence: ScorecardCell;
  localOpportunityEvidence: ScorecardCell;
  dataConfidence: ScorecardCell;
  parentConcern: { category: string; label: ConcernLabel };
}

export interface ComparisonRow {
  label: Bilingual;
  values: Array<{ tradeId: string; text: Bilingual; source?: SourceCitation; demo?: boolean }>;
}

export interface ComparisonView {
  header: Array<{ tradeId: string; name: Bilingual }>;
  rows: ComparisonRow[];
}

export interface PathwayStep {
  label: Bilingual;
  detail: Bilingual;
  myNote?: Bilingual;
}

export interface PathwayView {
  steps: PathwayStep[];
  nsqfVerified: boolean;
  caveat: Bilingual;
}

export interface AdminStats {
  totalSessions: number;
  parentSessions: number;
  learnerSessions: number;
  jointSessions: number;
  escalations: number;
  unresolvedConcerns: number;
  concernDistribution: Record<string, number>;
  byDistrict: Array<{ district: string; count: number; topConcern: string }>;
  concernShift: Array<{
    category: string;
    label: Bilingual;
    before: string;
    after: string;
    note: Bilingual;
  }>;
}

export interface ProviderSummary {
  id: string;
  name: string;
  districtId: string;
  districtName?: Bilingual | null;
  type: string;
  scheme: string;
  nsqfAffiliated: boolean;
  accreditation: Bilingual;
  tradeIds: string[];
  tradeNames?: string[];
  centreCode: string;
  publicPhone: string;
}