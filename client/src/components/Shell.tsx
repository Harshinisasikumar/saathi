import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { UI } from '../i18n';

export function StepShell({
  stepIndex,
  title,
  children,
  footer,
}: {
  stepIndex?: number;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { userType } = useFlow();
  return (
    <div className="card saathi-card">
      <div className="card-body p-4 p-md-5">
        {typeof stepIndex === 'number' && (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
            <span className="badge saathi-step-badge">{stepIndex + 1}</span>
            <span>{userType === 'parent' ? 'Parent counselling' : 'Family counselling'}</span>
          </div>
        )}
        <h2 className="h4 mb-4">{title}</h2>
        {children}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
}

export function FooterNav({
  backTo,
  onNext,
  nextLabel,
  busy,
  nextDisabled,
}: {
  backTo?: string;
  onNext?: () => void;
  nextLabel?: string;
  busy?: boolean;
  nextDisabled?: boolean;
}) {
  const { lang } = useLanguage();
  return (
    <div className="d-flex justify-content-between align-items-center gap-3">
      {backTo ? (
        <Link to={backTo} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />
          {UI.back[lang]}
        </Link>
      ) : (
        <span />
      )}
      <button
        className="btn btn-primary btn-lg px-4"
        onClick={onNext}
        disabled={busy || nextDisabled}
      >
        {busy && <span className="spinner-border spinner-border-sm me-2" />}
        {nextLabel ?? UI.next[lang]}
      </button>
    </div>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-triangle me-2" />
      {message}
    </div>
  );
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));