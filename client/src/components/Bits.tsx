export function DemoBanner({ demoNotice, demoMode }: { demoNotice?: { en: string; ta: string } | null; demoMode?: boolean }) {
  if (!demoMode && !demoNotice) return null;
  return (
    <div className="demo-banner">
      <i className="bi bi-flask me-2" />
      Hackathon Demo Mode — {demoNotice?.en ?? 'Some outcome values shown in this prototype are demonstration data and are not official statistics.'}
    </div>
  );
}

export function LangPill({ lang, onToggle }: { lang: 'en' | 'ta'; onToggle: () => void }) {
  return (
    <button className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-2" onClick={onToggle}>
      <i className="bi bi-translate" />
      <span>{lang === 'en' ? 'English' : 'தமிழ்'}</span>
      <span className="opacity-75">→ {lang === 'en' ? 'தமிழ்' : 'English'}</span>
    </button>
  );
}