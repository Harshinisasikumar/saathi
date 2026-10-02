import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import api from './api';
import { LanguageProvider } from './context/LanguageContext';
import { FlowProvider } from './context/FlowContext';
import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import type { AdminStats } from './types';

const ChooseUser = lazy(() => import('./pages/ChooseUser'));
const Profile = lazy(() => import('./pages/Profile'));
const LearnerAssessment = lazy(() => import('./pages/LearnerAssessment'));
const ParentConcern = lazy(() => import('./pages/ParentConcern'));
const Counsellor = lazy(() => import('./pages/Counsellor'));
const Compare = lazy(() => import('./pages/Compare'));
const ScorecardPage = lazy(() => import('./pages/ScorecardPage'));
const Pathway = lazy(() => import('./pages/Pathway'));
const Escalation = lazy(() => import('./pages/Escalation'));
const Trades = lazy(() => import('./pages/Trades').then((m) => ({ default: m.Trades })));
const TradeDetail = lazy(() => import('./pages/Trades').then((m) => ({ default: m.TradeDetail })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));

function RouteFallback() {
  return (
    <div className="text-center py-5 text-muted">
      <span className="spinner-border spinner-border-sm me-2" />
      Loading…
    </div>
  );
}

function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('saathi_admin');
    if (!token) {
      setLoading(false);
      return;
    }
    const [user, pass] = atob(token).split(':');
    api.adminDashboard(user, pass)
      .then((r) => setStats(r.stats))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading…</div>;
  }
  if (!stats) {
    return (
      <AdminLogin
        onLogin={(s) => {
          setStats(s);
        }}
      />
    );
  }
  return (
    <AdminDashboard
      stats={stats}
      onLogout={() => {
        localStorage.removeItem('saathi_admin');
        setStats(null);
      }}
    />
  );
}

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  return (
    <LanguageProvider>
      <FlowProvider>
        <BrowserRouter basename={base}>
          <Layout>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/start" element={<ChooseUser />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/assessment" element={<LearnerAssessment />} />
                <Route path="/concern" element={<ParentConcern />} />
                <Route path="/counsellor" element={<Counsellor />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/scorecard" element={<ScorecardPage />} />
                <Route path="/pathway" element={<Pathway />} />
                <Route path="/escalate" element={<Escalation />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/trades/:id" element={<TradeDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Landing />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </FlowProvider>
    </LanguageProvider>
  );
}