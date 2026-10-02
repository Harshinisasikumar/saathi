import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { pickLang } from '../i18n';
import { ErrorBox } from '../components/Shell';
import { api } from '../api';
import type { AdminStats } from '../types';

export function AdminLogin({ onLogin }: { onLogin: (stats: AdminStats) => void }) {
  const { lang } = useLanguage();
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('saathi2024');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.adminDashboard(user, pass);
      localStorage.setItem('saathi_admin', btoa(`${user}:${pass}`));
      onLogin(res.stats);
    } catch (e) {
      setError('Invalid admin credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card saathi-card">
          <div className="card-body p-4">
            <h3 className="h5 mb-3">
              <i className="bi bi-shield-lock me-2" />
              {pickLang(lang, { en: 'Administrator login', ta: 'நிர்வாகி உள்நுழைவு' })}
            </h3>
            <p className="small text-muted">
              {pickLang(lang, {
                en: 'Demo credentials: admin / saathi2024',
                ta: 'டெமோ சான்றுகள்: admin / saathi2024',
              })}
            </p>
            <ErrorBox message={error} />
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" value={user} onChange={(e) => setUser(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            <button className="btn btn-primary w-100" onClick={submit} disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" />}
              {pickLang(lang, { en: 'Login', ta: 'உள்நுழைய' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}