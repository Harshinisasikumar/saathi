import type {
  AdminStats,
  AssessmentRecord,
  ChatMessage,
  ConcernRecord,
  District,
  EscalationRecord,
  LearnerProfileRecord,
  OutcomeRecord,
  ParentProfileRecord,
  Provider,
  SessionRecord,
  SourceRecord,
  Trade,
} from '../domain/types.js';
import { OUTCOMES, PROVIDERS, SOURCES, TRADES } from '../data/seedData.js';
import { DISTRICTS } from '../data/districts.js';
import { buildDemoSessions } from '../data/demoSessions.js';

/** Unified persistence contract used by every route. */
export interface StoreBackend {
  backendName(): string;
  init(): Promise<void>;
  getTrades(): Trade[];
  getTradeById(id: string): Trade | undefined;
  getProviders(): Provider[];
  getOutcomes(tradeId?: string, districtId?: string | null): OutcomeRecord[];
  getSources(): SourceRecord[];
  getDistricts(): District[];
  createSession(s: SessionRecord): Promise<SessionRecord>;
  getSession(id: string): Promise<SessionRecord | undefined>;
  saveLearnerProfile(p: LearnerProfileRecord): Promise<LearnerProfileRecord>;
  getLearnerProfile(sessionId: string): Promise<LearnerProfileRecord | undefined>;
  saveParentProfile(p: ParentProfileRecord): Promise<ParentProfileRecord>;
  getParentProfile(sessionId: string): Promise<ParentProfileRecord | undefined>;
  saveAssessment(a: AssessmentRecord): Promise<AssessmentRecord>;
  getAssessment(sessionId: string): Promise<AssessmentRecord | undefined>;
  saveConcern(c: ConcernRecord): Promise<ConcernRecord>;
  getConcerns(sessionId?: string): Promise<ConcernRecord[]>;
  saveChatMessage(m: ChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  saveEscalation(e: EscalationRecord): Promise<EscalationRecord>;
  stats(): Promise<AdminStats>;
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** In-memory backend. Works with zero external setup — ideal for the demo. */
export class MemoryStore implements StoreBackend {
  sessions: SessionRecord[] = [];
  learners: LearnerProfileRecord[] = [];
  parents: ParentProfileRecord[] = [];
  assessments: AssessmentRecord[] = [];
  concerns: ConcernRecord[] = [];
  chats: ChatMessage[] = [];
  escalations: EscalationRecord[] = [];

  backendName() {
    return 'memory';
  }

  async init() {
    for (const row of buildDemoSessions()) {
      this.sessions.push(row.session);
      if (row.learner) this.learners.push(row.learner);
      if (row.parent) this.parents.push(row.parent);
      this.concerns.push(row.concern);
    }
  }

  getTrades() {
    return TRADES;
  }

  getTradeById(id: string) {
    return TRADES.find((t) => t.id === id);
  }

  getProviders() {
    return PROVIDERS;
  }

  getOutcomes(tradeId?: string, districtId?: string | null) {
    return OUTCOMES.filter(
      (o) => (!tradeId || o.tradeId === tradeId) && (districtId === undefined || o.districtId === districtId),
    );
  }

  getSources() {
    return SOURCES;
  }

  getDistricts() {
    return DISTRICTS;
  }

  async createSession(s: SessionRecord) {
    this.sessions.push(s);
    return s;
  }

  async getSession(id: string) {
    return this.sessions.find((s) => s.id === id);
  }

  async saveLearnerProfile(p: LearnerProfileRecord) {
    this.learners = this.learners.filter((x) => x.sessionId !== p.sessionId);
    this.learners.push(p);
    return p;
  }

  async getLearnerProfile(sessionId: string) {
    return this.learners.find((x) => x.sessionId === sessionId);
  }

  async saveParentProfile(p: ParentProfileRecord) {
    this.parents = this.parents.filter((x) => x.sessionId !== p.sessionId);
    this.parents.push(p);
    return p;
  }

  async getParentProfile(sessionId: string) {
    return this.parents.find((x) => x.sessionId === sessionId);
  }

  async saveAssessment(a: AssessmentRecord) {
    this.assessments = this.assessments.filter((x) => x.sessionId !== a.sessionId);
    this.assessments.push(a);
    return a;
  }

  async getAssessment(sessionId: string) {
    return this.assessments.find((x) => x.sessionId === sessionId);
  }

  async saveConcern(c: ConcernRecord) {
    this.concerns.push(c);
    return c;
  }

  async getConcerns(sessionId?: string) {
    return sessionId ? this.concerns.filter((c) => c.sessionId === sessionId) : this.concerns;
  }

  async saveChatMessage(m: ChatMessage) {
    this.chats.push(m);
    return m;
  }

  async getChatMessages(sessionId: string) {
    return this.chats.filter((c) => c.sessionId === sessionId);
  }

  async saveEscalation(e: EscalationRecord) {
    this.escalations.push(e);
    return e;
  }

  async stats(): Promise<AdminStats> {
    return computeAdminStats(this.sessions, this.learners, this.parents, this.concerns, this.escalations);
  }
}

/** Pure aggregation shared by every backend. */
export function computeAdminStats(
  sessions: SessionRecord[],
  learners: LearnerProfileRecord[],
  parents: ParentProfileRecord[],
  concerns: ConcernRecord[],
  escalations: EscalationRecord[],
): AdminStats {
  const distribution: AdminStats['concernDistribution'] = {
    income: 0,
    job_security: 0,
    social_perception: 0,
    safety: 0,
    career_growth: 0,
    further_education: 0,
    distance: 0,
    training_quality: 0,
    placement: 0,
    other: 0,
  };
  const sessionsByDistrict = new Map<string, { count: number; concerns: Map<string, number> }>();

  for (const c of concerns) {
    distribution[c.category] = (distribution[c.category] ?? 0) + 1;
    const session = sessions.find((x) => x.id === c.sessionId);
    const district = session ? districtOf(session, learners, parents) : 'Unknown';
    let cell = sessionsByDistrict.get(district);
    if (!cell) {
      cell = { count: 0, concerns: new Map() };
      sessionsByDistrict.set(district, cell);
    }
    cell.count += 1;
    cell.concerns.set(c.category, (cell.concerns.get(c.category) ?? 0) + 1);
  }

  const byDistrict = [...sessionsByDistrict.entries()]
    .map(([district, cell]) => {
      let top = 'other';
      let topN = -1;
      for (const [cat, n] of cell.concerns) {
        if (n > topN) {
          top = cat;
          topN = n;
        }
      }
      return { district, count: cell.count, topConcern: top };
    })
    .sort((a, b) => b.count - a.count);
  const sessionsCount = sessions.length;
  const learnerSet = new Set(learners.map((l) => l.sessionId)).size;
  const parentSet = new Set(parents.map((p) => p.sessionId)).size;

  return {
    totalSessions: sessionsCount,
    parentSessions: parentSet,
    learnerSessions: learnerSet,
    jointSessions: sessions.filter((x) => x.userType === 'joint').length,
    escalations: escalations.length,
    unresolvedConcerns: concerns.filter((c) => c.severity === 'high').length,
    concernDistribution: distribution,
    byDistrict,
    concernShift: [
      {
        category: 'job_security',
        label: { en: 'Job security', ta: 'வேலை பாதுகாப்பு' },
        before: 'High concern',
        after: 'Moderate concern',
        note: {
          en: 'Conversation-based concern indicator for prototype analytics — not a measurement of real attitudes.',
          ta: 'முன்னோட்ட பகுப்பாய்விற்கான உரையாடல் சார்ந்த கவலை காட்டி — உண்மையான மனநிலை அளவீடு அல்ல.',
        },
      },
      {
        category: 'career_growth',
        label: { en: 'Career progression', ta: 'தொழில் முன்னேற்றம்' },
        before: 'High concern',
        after: 'Moderate concern',
        note: {
          en: 'Conversation-based concern indicator for prototype analytics — not a measurement of real attitudes.',
          ta: 'முன்னோட்ட பகுப்பாய்விற்கான உரையாடல் சார்ந்த கவலை காட்டி — உண்மையான மனநிலை அளவீடு அல்ல.',
        },
      },
      {
        category: 'placement',
        label: { en: 'Placement', ta: 'வேலை வாய்ப்பு' },
        before: 'High concern',
        after: 'Reduced — evidence reviewed',
        note: {
          en: 'Conversation-based concern indicator for prototype analytics — not a measurement of real attitudes.',
          ta: 'முன்னோட்ட பகுப்பாய்விற்கான உரையாடல் சார்ந்த கவலை காட்டி — உண்மையான மனநிலை அளவீடு அல்ல.',
        },
      },
    ],
  };
}

function districtOf(
  session: SessionRecord,
  learners: LearnerProfileRecord[],
  parents: ParentProfileRecord[],
): string {
  const lp = learners.find((l) => l.sessionId === session.id);
  const pp = parents.find((p) => p.sessionId === session.id);
  const d = lp?.district ?? pp?.district;
  if (!d) return 'Unknown';
  const dist = DISTRICTS.find((x) => x.id === d);
  return dist ? dist.name.en : d;
}