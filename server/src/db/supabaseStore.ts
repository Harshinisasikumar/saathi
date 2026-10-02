import type { SupabaseClient } from '@supabase/supabase-js';
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
import type { StoreBackend } from './store.js';
import { computeAdminStats, uid } from './store.js';
import { OUTCOMES, PROVIDERS, SOURCES, TRADES } from '../data/seedData.js';
import { DISTRICTS } from '../data/districts.js';
import { buildDemoSessions } from '../data/demoSessions.js';

/**
 * Supabase (Postgres + PostgREST, via @supabase/supabase-js) persistence.
 *
 * Reference data (trades / providers / outcomes / sources) is always loaded
 * from the code seed so figures carry the mandatory citation metadata;
 * runtime counselling records are persisted to Postgres when SUPABASE_URL and
 * SUPABASE_SERVICE_KEY are configured. The service-role key is used here so
 * the server can write rows the same way it writes to the in-memory store.
 */
export class SupabaseStore implements StoreBackend {
  constructor(private readonly db: SupabaseClient) {}

  backendName() {
    return 'supabase';
  }

  async init() {
    const { count, error } = await this.db.from('sessions').select('session_id', { count: 'exact', head: true });
    if (error) throw error;
    if (count === 0) {
      for (const row of buildDemoSessions()) {
        await this.db.from('sessions').insert(row.session);
        if (row.learner) await this.db.from('learner_profiles').insert(toLearnerRow(row.learner));
        if (row.parent) await this.db.from('parent_profiles').insert(toParentRow(row.parent));
        await this.db.from('concerns').insert(toConcernRow(row.concern));
      }
    }
  }

  getTrades(): Trade[] {
    return TRADES;
  }

  getTradeById(id: string): Trade | undefined {
    return TRADES.find((t) => t.id === id);
  }

  getProviders(): Provider[] {
    return PROVIDERS;
  }

  getOutcomes(tradeId?: string, districtId?: string | null): OutcomeRecord[] {
    return OUTCOMES.filter(
      (o) => (!tradeId || o.tradeId === tradeId) && (districtId === undefined || o.districtId === districtId),
    );
  }

  getSources(): SourceRecord[] {
    return SOURCES;
  }

  getDistricts(): District[] {
    return DISTRICTS;
  }

  async createSession(s: SessionRecord): Promise<SessionRecord> {
    const { error } = await this.db.from('sessions').insert({
      session_id: s.id,
      user_type: s.userType,
      lang: s.lang,
      created_at: s.createdAt,
    });
    if (error) throw error;
    return s;
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const { data, error } = await this.db
      .from('sessions')
      .select('session_id,user_type,lang,created_at')
      .eq('session_id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return {
      id: String(data.session_id),
      userType: data.user_type as SessionRecord['userType'],
      lang: data.lang as SessionRecord['lang'],
      createdAt: new Date(data.created_at as string).toISOString(),
    };
  }

  async saveLearnerProfile(p: LearnerProfileRecord): Promise<LearnerProfileRecord> {
    const { error } = await this.db
      .from('learner_profiles')
      .upsert(toLearnerRow(p), { onConflict: 'session_id' });
    if (error) throw error;
    return p;
  }

  async getLearnerProfile(sessionId: string): Promise<LearnerProfileRecord | undefined> {
    const { data, error } = await this.db
      .from('learner_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromLearnerRow(data) : undefined;
  }

  async saveParentProfile(p: ParentProfileRecord): Promise<ParentProfileRecord> {
    const { error } = await this.db
      .from('parent_profiles')
      .upsert(toParentRow(p), { onConflict: 'session_id' });
    if (error) throw error;
    return p;
  }

  async getParentProfile(sessionId: string): Promise<ParentProfileRecord | undefined> {
    const { data, error } = await this.db
      .from('parent_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromParentRow(data) : undefined;
  }

  async saveAssessment(a: AssessmentRecord): Promise<AssessmentRecord> {
    const { error } = await this.db
      .from('assessments')
      .upsert(
        { session_id: a.sessionId, answers: a.answers, snapshot: a.snapshot },
        { onConflict: 'session_id' },
      );
    if (error) throw error;
    return a;
  }

  async getAssessment(sessionId: string): Promise<AssessmentRecord | undefined> {
    const { data, error } = await this.db
      .from('assessments')
      .select('answers,snapshot')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return {
      sessionId,
      answers: (data.answers as AssessmentRecord['answers']) ?? [],
      snapshot: (data.snapshot as AssessmentRecord['snapshot']) ?? undefined,
    };
  }

  async saveConcern(c: ConcernRecord): Promise<ConcernRecord> {
    const { error } = await this.db.from('concerns').insert(toConcernRow(c));
    if (error) throw error;
    return c;
  }

  async getConcerns(sessionId?: string): Promise<ConcernRecord[]> {
    let q = this.db.from('concerns').select('*').order('created_at', { ascending: true });
    if (sessionId) q = q.eq('session_id', sessionId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(fromConcernRow);
  }

  async saveChatMessage(m: ChatMessage): Promise<ChatMessage> {
    const { error } = await this.db.from('chat_messages').insert({
      id: uid('msg'),
      session_id: m.sessionId,
      role: m.role,
      text: m.text,
      lang: m.lang,
      structured: m.structured ?? null,
      created_at: m.createdAt,
    });
    if (error) throw error;
    return m;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.db
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: String(r.id),
      sessionId: String(r.session_id),
      role: r.role as ChatMessage['role'],
      text: String(r.text),
      lang: (r.lang as ChatMessage['lang']) ?? 'en',
      structured: (r.structured as ChatMessage['structured']) ?? undefined,
      createdAt: new Date(r.created_at as string).toISOString(),
    }));
  }

  async saveEscalation(e: EscalationRecord): Promise<EscalationRecord> {
    const { error } = await this.db.from('escalations').insert({
      id: uid('esc'),
      session_id: e.sessionId,
      language: e.language,
      concern_category: e.concernCategory,
      contact_method: e.contactMethod,
      preferred_time: e.preferredTime,
      description: e.description,
      created_at: e.createdAt,
    });
    if (error) throw error;
    return e;
  }

  async stats(): Promise<AdminStats> {
    const [sessions, learners, parents, concerns, escalations] = await Promise.all([
      this.db.from('sessions').select('*'),
      this.db.from('learner_profiles').select('*'),
      this.db.from('parent_profiles').select('*'),
      this.db.from('concerns').select('*'),
      this.db.from('escalations').select('*'),
    ]);
    for (const { error } of [sessions, learners, parents, concerns, escalations]) {
      if (error) throw error;
    }
    return computeAdminStats(
      (sessions.data ?? []).map((r) => ({
        id: String(r.session_id),
        userType: r.user_type as SessionRecord['userType'],
        lang: r.lang as SessionRecord['lang'],
        createdAt: new Date(r.created_at as string).toISOString(),
      })),
      (learners.data ?? []).map((r) => fromLearnerRow(r)),
      (parents.data ?? []).map((r) => fromParentRow(r)),
      (concerns.data ?? []).map((r) => fromConcernRow(r)),
      (escalations.data ?? []).map((r) => ({
        id: String(r.id),
        sessionId: String(r.session_id),
        language: (r.language as 'en' | 'ta') ?? 'en',
        concernCategory: r.concern_category as ConcernRecord['category'],
        contactMethod: (r.contact_method as string) ?? null,
        preferredTime: (r.preferred_time as string) ?? null,
        description: (r.description as string) ?? null,
        createdAt: new Date(r.created_at as string).toISOString(),
      })),
    );
  }
}

type SupabaseRow = Record<string, unknown>;

function toLearnerRow(p: LearnerProfileRecord): SupabaseRow {
  return {
    session_id: p.sessionId,
    age: p.age,
    gender: p.gender,
    education: p.education,
    academic_background: p.academicBackground,
    interests: p.interests,
    preferred_work_type: p.preferredWorkType,
    learning_preference: p.learningPreference,
    preferred_location: p.preferredLocation,
    state: p.state,
    district: p.district,
    urbanity: p.urbanity,
    career_goals: p.careerGoals,
  };
}

function fromLearnerRow(r: SupabaseRow): LearnerProfileRecord {
  return {
    sessionId: String(r.session_id),
    age: (r.age as number | null) ?? null,
    gender: (r.gender as string | null) ?? null,
    education: (r.education as string | null) ?? null,
    academicBackground: (r.academic_background as string | null) ?? null,
    interests: (r.interests as string[]) ?? [],
    preferredWorkType: (r.preferred_work_type as string[]) ?? [],
    learningPreference: (r.learning_preference as string | null) ?? null,
    preferredLocation: (r.preferred_location as string | null) ?? null,
    state: (r.state as string) ?? 'Tamil Nadu',
    district: (r.district as string) ?? 'salem',
    urbanity: (r.urbanity as LearnerProfileRecord['urbanity']) ?? 'unspecified',
    careerGoals: (r.career_goals as string | null) ?? null,
  };
}

function toParentRow(p: ParentProfileRecord): SupabaseRow {
  return {
    session_id: p.sessionId,
    state: p.state,
    district: p.district,
    income_bracket: p.incomeBracket,
    primary_concern: p.primaryConcern,
    max_distance_km: p.maxDistanceKm,
    preference: p.preference,
  };
}

function fromParentRow(r: SupabaseRow): ParentProfileRecord {
  return {
    sessionId: String(r.session_id),
    state: (r.state as string) ?? 'Tamil Nadu',
    district: (r.district as string) ?? 'salem',
    incomeBracket: (r.income_bracket as string | null) ?? null,
    primaryConcern: (r.primary_concern as ParentProfileRecord['primaryConcern']) ?? null,
    maxDistanceKm: (r.max_distance_km as number | null) ?? null,
    preference: (r.preference as ParentProfileRecord['preference']) ?? null,
  };
}

function toConcernRow(c: ConcernRecord): SupabaseRow {
  return {
    id: c.id,
    session_id: c.sessionId,
    raw_text: c.rawText,
    detected_lang: c.detectedLang,
    category: c.category,
    confidence: c.confidence,
    severity: c.severity,
    created_at: c.createdAt,
  };
}

function fromConcernRow(r: SupabaseRow): ConcernRecord {
  return {
    id: String(r.id),
    sessionId: String(r.session_id),
    rawText: String(r.raw_text),
    detectedLang: (r.detected_lang as ConcernRecord['detectedLang']) ?? 'en',
    category: r.category as ConcernRecord['category'],
    confidence: (r.confidence as number) ?? 0.5,
    severity: (r.severity as ConcernRecord['severity']) ?? 'medium',
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}