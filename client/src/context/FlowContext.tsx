import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../api';
import type {
  ChatTurn,
  InterestSnapshot,
  Lang,
  MetaResponse,
  TradeSummary,
  UserType,
} from '../types';

export interface LearnerProfileState {
  age: string;
  gender: string;
  education: string;
  academicBackground: string;
  interests: string[];
  preferredWorkType: string[];
  learningPreference: string;
  preferredLocation: string;
  state: string;
  district: string;
  urbanity: string;
  careerGoals: string;
}

export interface ParentProfileState {
  state: string;
  district: string;
  incomeBracket: string;
  primaryConcern: string;
  maxDistanceKm: string;
  preference: string;
}

interface FlowContextValue {
  meta: MetaResponse | null;
  demoNotice: { en: string; ta: string } | null;
  sessionId: string | null;
  userType: UserType | null;
  lang: Lang;
  setLang: (l: Lang) => void;
  learner: LearnerProfileState;
  setLearner: (p: Partial<LearnerProfileState>) => void;
  parent: ParentProfileState;
  setParent: (p: Partial<ParentProfileState>) => void;
  snapshot: InterestSnapshot | null;
  concern: { category: string; label: string; severity: string; rawText: string; confidence: number } | null;
  trades: TradeSummary[] | null;
  chat: ChatTurn[];
  busy: boolean;
  error: string | null;
  startSession: (userType: UserType, lang: Lang) => Promise<string | null>;
  submitLearner: () => Promise<boolean>;
  submitParent: () => Promise<boolean>;
  submitAssessment: (answers: Array<{ questionId: string; value: string }>) => Promise<boolean>;
  submitConcern: (text: string) => Promise<boolean>;
  sendChat: (message: string) => Promise<boolean>;
  loadTrades: () => Promise<void>;
  districtId: string | null;
  reset: () => void;
}

const emptyLearner: LearnerProfileState = {
  age: '',
  gender: '',
  education: '',
  academicBackground: '',
  interests: [],
  preferredWorkType: [],
  learningPreference: '',
  preferredLocation: '',
  state: 'Tamil Nadu',
  district: 'salem',
  urbanity: 'semiurban',
  careerGoals: '',
};

const emptyParent: ParentProfileState = {
  state: 'Tamil Nadu',
  district: 'salem',
  incomeBracket: '',
  primaryConcern: '',
  maxDistanceKm: '',
  preference: '',
};

const FlowCtx = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [demoNotice, setDemoNotice] = useState<{ en: string; ta: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [lang, setLangState] = useState<Lang>('en');
  const [learner, setLearnerState] = useState<LearnerProfileState>(emptyLearner);
  const [parent, setParentState] = useState<ParentProfileState>(emptyParent);
  const [snapshot, setSnapshot] = useState<InterestSnapshot | null>(null);
  const [concern, setConcern] = useState<FlowContextValue['concern']>(null);
  const [trades, setTrades] = useState<TradeSummary[] | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('saathi_lang', l);
  };

  useEffect(() => {
    const stored = localStorage.getItem('saathi_lang');
    if (stored === 'ta') setLangState('ta');
    api
      .meta()
      .then((m) => {
        setMeta(m);
        setDemoNotice(m.demoNotice);
      })
      .catch(() => setDemoNotice({ en: 'Demo data — for prototype demonstration only.', ta: 'டெமோ தரவு.' }));
  }, []);

  const startSession = async (t: UserType, l: Lang): Promise<string | null> => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.createSession(t, l);
      setSessionId(res.sessionId);
      setUserType(t);
      setLangState(l);
      localStorage.setItem('saathi_lang', l);
      setTimeout(loadTrades, 0);
      return res.sessionId;
    } catch (e) {
      setError('Could not start counselling. Please try again.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const loadTrades = async () => {
    try {
      const res = await api.trades(learner.district);
      setTrades(res.trades);
    } catch {
      /* trades are optional */
    }
  };

  const setLearner = (p: Partial<LearnerProfileState>) =>
    setLearnerState((prev) => ({ ...prev, ...p }));
  const setParent = (p: Partial<ParentProfileState>) =>
    setParentState((prev) => ({ ...prev, ...p }));

  const submitLearner = async (): Promise<boolean> => {
    if (!sessionId) return false;
    setBusy(true);
    setError(null);
    try {
      await api.saveLearnerProfile(sessionId, {
        age: learner.age ? Number(learner.age) : null,
        gender: learner.gender || null,
        education: learner.education || null,
        academicBackground: learner.academicBackground || null,
        interests: learner.interests,
        preferredWorkType: learner.preferredWorkType,
        learningPreference: learner.learningPreference || null,
        preferredLocation: learner.preferredLocation || null,
        state: learner.state,
        district: learner.district,
        urbanity: learner.urbanity,
        careerGoals: learner.careerGoals || null,
      });
      setParentState((prev) => ({ ...prev, district: learner.district, state: learner.state }));
      return true;
    } catch (e) {
      setError('Could not save your profile. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitParent = async (): Promise<boolean> => {
    if (!sessionId) return false;
    setBusy(true);
    setError(null);
    try {
      await api.saveParentProfile(sessionId, {
        state: parent.state,
        district: parent.district,
        incomeBracket: parent.incomeBracket || null,
        primaryConcern: parent.primaryConcern || null,
        maxDistanceKm: parent.maxDistanceKm ? Number(parent.maxDistanceKm) : null,
        preference: parent.preference || null,
      });
      setLearnerState((prev) => ({ ...prev, district: parent.district, state: parent.state }));
      return true;
    } catch (e) {
      setError('Could not save your profile. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitAssessment = async (answers: Array<{ questionId: string; value: string }>): Promise<boolean> => {
    if (!sessionId) return false;
    setBusy(true);
    setError(null);
    try {
      const res = await api.submitAssessment(sessionId, answers);
      setSnapshot(res.snapshot);
      return true;
    } catch (e) {
      setError('Could not save the assessment. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitConcern = async (text: string): Promise<boolean> => {
    if (!sessionId) return false;
    setBusy(true);
    setError(null);
    try {
      const res = await api.submitConcern(sessionId, text);
      setConcern({
        category: res.category,
        label: res.label?.en ?? res.category,
        severity: res.severity,
        rawText: res.rawText,
        confidence: res.confidence,
      });
      setParentState((prev) => ({ ...prev, primaryConcern: res.category }));
      return true;
    } catch (e) {
      setError('Could not record your concern. Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendChat = async (message: string): Promise<boolean> => {
    if (!sessionId) return false;
    setBusy(true);
    setError(null);
    setChat((c) => [...c, { role: 'user', text: message }]);
    try {
      const res = await api.chat(sessionId, message);
      setChat((c) => [
        ...c,
        {
          role: 'assistant',
          text: res.reply,
          structured: res.structured,
          escalate: res.escalate,
          escalateReason: res.escalateReason,
        },
      ]);
      return true;
    } catch (e) {
      setChat((c) => [
        ...c,
        {
          role: 'assistant',
          text: "We couldn't retrieve a response right now. Please try again or connect with a counsellor.",
        },
      ]);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const districtId = learner.district || parent.district || null;
  const reset = () => {
    setSessionId(null);
    setUserType(null);
    setLearnerState(emptyLearner);
    setParentState(emptyParent);
    setSnapshot(null);
    setConcern(null);
    setChat([]);
  };

  return (
    <FlowCtx.Provider
      value={{
        meta,
        demoNotice,
        sessionId,
        userType,
        lang,
        setLang,
        learner,
        setLearner,
        parent,
        setParent,
        snapshot,
        concern,
        trades,
        chat,
        busy,
        error,
        startSession,
        submitLearner,
        submitParent,
        submitAssessment,
        submitConcern,
        sendChat,
        loadTrades,
        districtId,
        reset,
      }}
    >
      {children}
    </FlowCtx.Provider>
  );
}

export function useFlow(): FlowContextValue {
  const ctx = useContext(FlowCtx);
  if (!ctx) throw new Error('useFlow must be used inside FlowProvider');
  return ctx;
}