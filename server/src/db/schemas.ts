import { Schema } from 'mongoose';

/**
 * Mongoose schema definitions for the Saathi prototype.
 *
 * Design note: outcome records carry `source_name`, `source_url`,
 * `data_period` and `verification_status` on every row, making the
 * "no number without provenance" rule structural.
 */

export const UserSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userType: { type: String, enum: ['learner', 'parent', 'joint'], required: true },
    lang: { type: String, enum: ['en', 'ta'], required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const LearnerProfileSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    age: { type: Number, default: null },
    gender: { type: String, default: null },
    education: { type: String, default: null },
    academicBackground: { type: String, default: null },
    interests: { type: [String], default: [] },
    preferredWorkType: { type: [String], default: [] },
    learningPreference: { type: String, default: null },
    preferredLocation: { type: String, default: null },
    state: { type: String, default: 'Tamil Nadu' },
    district: { type: String, default: 'salem' },
    urbanity: {
      type: String,
      enum: ['urban', 'semiurban', 'rural', 'unspecified'],
      default: 'unspecified',
    },
    careerGoals: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const ParentProfileSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    state: { type: String, default: 'Tamil Nadu' },
    district: { type: String, default: 'salem' },
    incomeBracket: { type: String, default: null },
    primaryConcern: { type: String, default: null },
    maxDistanceKm: { type: Number, default: null },
    preference: {
      type: String,
      enum: ['job_immediate', 'further_study', 'undecided', null],
      default: null,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const AssessmentSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    answers: { type: [Schema.Types.Mixed], default: [] },
    snapshot: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const ConcernSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    rawText: { type: String, required: true },
    detectedLang: { type: String, enum: ['en', 'ta'], required: true },
    category: { type: String, required: true },
    confidence: { type: Number, default: 0.5 },
    severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const ChatMessageSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    lang: { type: String, enum: ['en', 'ta'], default: 'en' },
    structured: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const EscalationSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    language: { type: String, enum: ['en', 'ta'], required: true },
    concernCategory: { type: String, required: true },
    contactMethod: { type: String, default: null },
    preferredTime: { type: String, default: null },
    description: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

/* Static reference data */

export const TradeSchema = new Schema({ _id: false }, { collection: 'trades', strict: false });

export const TrainingProviderSchema = new Schema(
  { _id: false },
  { collection: 'training_providers', strict: false },
);

export const OutcomeSchema = new Schema(
  {
    tradeId: { type: String, required: true, index: true },
    districtId: { type: String, default: null },
    source_name: { type: String, required: true },
    source_url: { type: String, default: null },
    data_period: { type: String, required: true },
    verification_status: { type: String, default: 'DEMO' },
    earnings: { type: Schema.Types.Mixed, default: null },
    placementWithin90Days: { type: Schema.Types.Mixed, default: null },
    overallPlacement: { type: Schema.Types.Mixed, default: null },
    completionRate: { type: Schema.Types.Mixed, default: null },
  },
  { collection: 'outcomes' },
);

export const SourceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    url: { type: String, default: null },
    dataPeriod: { type: String, required: true },
    nature: { type: String, enum: ['verified', 'demo'], default: 'demo' },
    note: { type: String, default: null },
  },
  { collection: 'sources' },
);

export const MODELS = {
  users: 'users',
  learner_profiles: 'learner_profiles',
  parent_profiles: 'parent_profiles',
  assessments: 'assessments',
  concerns: 'concerns',
  chat_messages: 'chat_messages',
  escalations: 'escalations',
  trades: 'trades',
  training_providers: 'training_providers',
  outcomes: 'outcomes',
  sources: 'sources',
} as const;