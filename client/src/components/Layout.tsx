import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { DemoBanner, LangPill } from './Bits';
import { UI } from '../i18n';

export function Layout({ children }: { children: ReactNode }) {
  const { lang, toggle } = useLanguage();
  const { demoNotice, meta } = useFlow();

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand navbar-dark saathi-navbar px-3">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">
            <i className="bi bi-mortarboard-fill me-2" />
            {UI.appName[lang]}
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/admin" className="btn btn-sm btn-outline-light">
              <i className="bi bi-shield-lock me-1" />
              Admin
            </Link>
            <LangPill lang={lang} onToggle={toggle} />
          </div>
        </div>
      </nav>
      <DemoBanner demoNotice={demoNotice} demoMode={meta?.demoMode} />
      <main className="container my-4 flex-grow-1">{children}</main>
      <footer className="text-center text-muted small pb-3">
        <Link to="/" className="text-muted">
          {UI.govHeading[lang]}
        </Link>{" "}
        · privacy: {UI.privacyNote[lang].slice(0, 60)}…
      </footer>
    </div>
  );
}