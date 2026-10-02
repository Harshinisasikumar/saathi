import axios from 'axios';
import type {
  AdminStats,
  ChatReply,
  ComparisonView,
  InterestSnapshot,
  MetaResponse,
  PathwayView,
  ProviderSummary,
  ScorecardResult,
  TradeRecord,
  TradeSummary,
  UserType,
  Lang,
} from './types';

// Runtime API base resolution, in priority order:
//   1. window.SAATHI_API_URL (injected via index.html <script> — works on static hosts)
//   2. import.meta.env.VITE_API_URL (baked at build time)
//   3. '' — same origin (/api), used in dev via the Vite proxy and when the API serves the app.
const apiBase =
  (typeof window !== 'undefined' &&
    (window as { SAATHI_API_URL?: string }).SAATHI_API_URL?.trim()) ||
  ((import.meta.env.VITE_API_URL as string | undefined) ?? '').trim() ||
  '';

const http = axios.create({
  baseURL: `${apiBase}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const api = {
  health: () => http.get('/health').then((r) => r.data),
  meta: (): Promise<MetaResponse> => http.get('/meta').then((r) => r.data),

  createSession: (userType: UserType, lang: Lang) =>
    http.post('/users', { userType, lang }).then((r) => r.data),

  saveLearnerProfile: (sessionId: string, data: Record<string, unknown>) =>
    http.put(`/users/${sessionId}/learner-profile`, data).then((r) => r.data),

  saveParentProfile: (sessionId: string, data: Record<string, unknown>) =>
    http.put(`/users/${sessionId}/parent-profile`, data).then((r) => r.data),

  submitAssessment: (sessionId: string, answers: Array<{ questionId: string; value: string }>) =>
    http
      .post('/assessment', { sessionId, answers })
      .then((r) => r.data as { ok: boolean; snapshot: InterestSnapshot }),

  submitConcern: (sessionId: string, text: string) =>
    http.post('/parent-concerns', { sessionId, text }).then((r) => r.data),

  chat: (sessionId: string, message: string) =>
    http.post('/chat', { sessionId, message }).then((r) => r.data as ChatReply),

  getChat: (sessionId: string) => http.get(`/chat/${sessionId}`).then((r) => r.data.messages),

  trades: (district?: string) =>
    http.get('/trades', { params: district ? { district } : {} }).then((r) => r.data as { trades: TradeSummary[] }),

  trade: (id: string) =>
    http.get(`/trades/${id}`).then(
      (r) => r.data as { trade: TradeRecord; outcomes: unknown[]; providers: ProviderSummary[] },
    ),

  providers: (district?: string) =>
    http
      .get('/providers', { params: district ? { district } : {} })
      .then((r) => r.data as { providers: ProviderSummary[] }),

  escalation: (
    sessionId: string,
    data: {
      language: Lang;
      concernCategory: string;
      contactMethod: string;
      preferredTime: string;
      description?: string;
    },
  ) => http.post('/escalation', { sessionId, ...data }).then((r) => r.data),

  compare: (snapshot: InterestSnapshot, district?: string): Promise<ComparisonView> =>
    http.post('/compare', { snapshot, district }).then((r) => r.data),

  scorecard: (
    snapshot: InterestSnapshot,
    concernCategory: string,
    district?: string,
  ): Promise<ScorecardResult> =>
    http.post('/scorecard', { snapshot, concernCategory, district }).then((r) => r.data),

  pathway: (tradeId?: string): Promise<PathwayView> =>
    http.get('/pathway', { params: tradeId ? { tradeId } : {} }).then((r) => r.data),

  adminOverview: () => http.get('/admin/overview').then((r) => r.data),

  adminDashboard: (user: string, pass: string) => {
    const token = btoa(`${user}:${pass}`);
    return http
      .get('/admin/dashboard', { headers: { Authorization: `Basic ${token}` } })
      .then((r) => r.data as { stats: AdminStats });
  },
};

export default api;