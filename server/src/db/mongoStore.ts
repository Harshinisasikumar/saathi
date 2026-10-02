import mongoose from 'mongoose';
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
import {
  AssessmentSchema,
  ChatMessageSchema,
  ConcernSchema,
  EscalationSchema,
  LearnerProfileSchema,
  ParentProfileSchema,
  UserSchema,
} from './schemas.js';
import { OUTCOMES, PROVIDERS, SOURCES, TRADES } from '../data/seedData.js';
import { DISTRICTS } from '../data/districts.js';
import { buildDemoSessions } from '../data/demoSessions.js';

/**
 * MongoDB-backed persistence. Reference data (trades/providers/outcomes/
 * sources) is loaded from the code seed so figures always carry the
 * mandatory citation metadata; runtime counselling records are persisted
 * to MongoDB when `MONGODB_URI` is configured.
 */
export class MongoStore implements StoreBackend {
  private User = mongoose.model('users', UserSchema);
  private Learner = mongoose.model('learner_profiles', LearnerProfileSchema);
  private Parent = mongoose.model('parent_profiles', ParentProfileSchema);
  private Assessment = mongoose.model('assessments', AssessmentSchema);
  private Concern = mongoose.model('concerns', ConcernSchema);
  private Chat = mongoose.model('chat_messages', ChatMessageSchema);
  private Escalation = mongoose.model('escalations', EscalationSchema);

  backendName() {
    return 'mongodb';
  }

  async init() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoStore requires an open Mongoose connection.');
    }
    const count = await this.User.countDocuments();
    if (count === 0) {
      for (const row of buildDemoSessions()) {
        await this.User.create(row.session);
        if (row.learner) await this.Learner.create(row.learner);
        if (row.parent) await this.Parent.create(row.parent);
        await this.Concern.create(row.concern);
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
    await this.User.create(s);
    return s;
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const d = await this.User.findOne({ sessionId: id }).lean().exec();
    if (!d) return undefined;
    return {
      id: d.sessionId,
      userType: d.userType,
      lang: d.lang,
      createdAt: new Date(d.created_at).toISOString(),
    };
  }

  async saveLearnerProfile(p: LearnerProfileRecord): Promise<LearnerProfileRecord> {
    await this.Learner.deleteOne({ sessionId: p.sessionId });
    await this.Learner.create(p);
    return p;
  }

  async getLearnerProfile(sessionId: string): Promise<LearnerProfileRecord | undefined> {
    const d = await this.Learner.findOne({ sessionId }).lean().exec();
    return d ? ({ ...d, sessionId } as unknown as LearnerProfileRecord) : undefined;
  }

  async saveParentProfile(p: ParentProfileRecord): Promise<ParentProfileRecord> {
    await this.Parent.deleteOne({ sessionId: p.sessionId });
    await this.Parent.create(p);
    return p;
  }

  async getParentProfile(sessionId: string): Promise<ParentProfileRecord | undefined> {
    const d = await this.Parent.findOne({ sessionId }).lean().exec();
    return d ? ({ ...d, sessionId } as unknown as ParentProfileRecord) : undefined;
  }

  async saveAssessment(a: AssessmentRecord): Promise<AssessmentRecord> {
    await this.Assessment.deleteOne({ sessionId: a.sessionId });
    await this.Assessment.create(a);
    return a;
  }

  async getAssessment(sessionId: string): Promise<AssessmentRecord | undefined> {
    const d = await this.Assessment.findOne({ sessionId }).lean().exec();
    return d ? ({ ...d, sessionId } as unknown as AssessmentRecord) : undefined;
  }

  async saveConcern(c: ConcernRecord): Promise<ConcernRecord> {
    await this.Concern.create(c);
    return c;
  }

  async getConcerns(sessionId?: string): Promise<ConcernRecord[]> {
    const rows = sessionId
      ? await this.Concern.find({ sessionId }).lean().exec()
      : await this.Concern.find().lean().exec();
    return rows.map((r) => ({
      id: String(r._id),
      sessionId: r.sessionId,
      rawText: r.rawText,
      detectedLang: r.detectedLang,
      category: r.category as ConcernRecord['category'],
      confidence: r.confidence ?? 0.5,
      severity: r.severity ?? 'medium',
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async saveChatMessage(m: ChatMessage): Promise<ChatMessage> {
    await this.Chat.create({ ...m, chatId: uid('msg') });
    return m;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const rows = await this.Chat.find({ sessionId }).lean().exec();
    return rows.map((r) => ({
      id: String(r._id),
      sessionId: r.sessionId,
      role: r.role,
      text: r.text,
      lang: r.lang ?? 'en',
      structured: r.structured ?? undefined,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async saveEscalation(e: EscalationRecord): Promise<EscalationRecord> {
    await this.Escalation.create(e);
    return e;
  }

  async stats(): Promise<AdminStats> {
    const [sessions, learners, parents, concerns, escalations] = await Promise.all([
      this.User.find().lean().exec(),
      this.Learner.find().lean().exec(),
      this.Parent.find().lean().exec(),
      this.Concern.find().lean().exec(),
      this.Escalation.find().lean().exec(),
    ]);
    const mapSession = (r: Record<string, unknown>): SessionRecord => ({
      id: String(r.sessionId),
      userType: r.userType as SessionRecord['userType'],
      lang: r.lang as SessionRecord['lang'],
      createdAt: new Date(r.created_at as string).toISOString(),
    });
    const mapLearner = (r: Record<string, unknown>): LearnerProfileRecord => ({
      sessionId: String(r.sessionId),
      age: (r.age as number) ?? null,
      gender: (r.gender as string) ?? null,
      education: (r.education as string) ?? null,
      academicBackground: (r.academicBackground as string) ?? null,
      interests: (r.interests as string[]) ?? [],
      preferredWorkType: (r.preferredWorkType as string[]) ?? [],
      learningPreference: (r.learningPreference as string) ?? null,
      preferredLocation: (r.preferredLocation as string) ?? null,
      state: (r.state as string) ?? 'Tamil Nadu',
      district: (r.district as string) ?? 'salem',
      urbanity: (r.urbanity as LearnerProfileRecord['urbanity']) ?? 'unspecified',
      careerGoals: (r.careerGoals as string) ?? null,
    });
    const mapParent = (r: Record<string, unknown>): ParentProfileRecord => ({
      sessionId: String(r.sessionId),
      state: (r.state as string) ?? 'Tamil Nadu',
      district: (r.district as string) ?? 'salem',
      incomeBracket: (r.incomeBracket as string) ?? null,
      primaryConcern: (r.primaryConcern as ParentProfileRecord['primaryConcern']) ?? null,
      maxDistanceKm: (r.maxDistanceKm as number) ?? null,
      preference: (r.preference as ParentProfileRecord['preference']) ?? null,
    });
    const mapConcern = (r: Record<string, unknown>): ConcernRecord => ({
      id: String(r._id),
      sessionId: String(r.sessionId),
      rawText: String(r.rawText),
      detectedLang: (r.detectedLang as ConcernRecord['detectedLang']) ?? 'en',
      category: r.category as ConcernRecord['category'],
      confidence: (r.confidence as number) ?? 0.5,
      severity: (r.severity as ConcernRecord['severity']) ?? 'medium',
      createdAt: new Date(r.created_at as string).toISOString(),
    });
    return computeAdminStats(
      sessions.map(mapSession),
      learners.map(mapLearner),
      parents.map(mapParent),
      concerns.map(mapConcern),
      escalations.map((r) => ({
        id: String(r._id),
        sessionId: String(r.sessionId),
        language: (r.language as 'en' | 'ta') ?? 'en',
        concernCategory: r.concernCategory as ConcernRecord['category'],
        contactMethod: (r.contactMethod as string) ?? null,
        preferredTime: (r.preferredTime as string) ?? null,
        description: (r.description as string) ?? null,
createdAt: new Date(r.created_at as unknown as string).toISOString(),
      })),
    );
  }
}