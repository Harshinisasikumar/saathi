import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { UI } from '../i18n';

export default function Landing() {
  const { lang } = useLanguage();
  const { demoNotice, meta } = useFlow();
  const navigate = useNavigate();

  const start = (mode: 'learner' | 'parent') => {
    navigate('/start');
    localStorage.setItem('saathi_mode', mode);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="text-center saathi-hero">
          <div className="badge saathi-soft mb-3 rounded-pill">
            <i className="bi bi-mortarboard me-1" />
            {UI.govHeading[lang]}
          </div>
          <h1 className="display-5 fw-bold saathi-headline">{UI.tagline[lang]}</h1>
          <p className="lead mx-auto saathi-lead">{UI.sub[lang]}</p>
          <div className="card saathi-card mt-4 p-4 text-start mx-auto saathi-howcard">
            <div className="fw-semibold mb-1">
              <i className="bi bi-compass me-2 saathi-accent" />
              {UI.howWorkTitle[lang]}
            </div>
            <div>{UI.howWork[lang]}</div>
          </div>
        </div>

        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <button className="btn btn-primary btn-lg w-100 py-3" onClick={() => start('learner')}>
              <i className="bi bi-person-badge me-2" />
              {UI.btnStart[lang]}
            </button>
          </div>
          <div className="col-md-6">
            <button className="btn btn-outline-primary btn-lg w-100 py-3" onClick={() => navigate('/trades')}>
              <i className="bi bi-grid-1x2 me-2" />
              {UI.btnExplore[lang]}
            </button>
          </div>
          <div className="col-12">
            <button className="btn btn-outline-secondary btn-lg w-100 py-3" onClick={() => start('parent')}>
              <i className="bi bi-people me-2" />
              {UI.btnParentMode[lang]}
            </button>
          </div>
        </div>

        {meta?.demoMode && demoNotice && (
          <div className="alert alert-info small mt-4 text-center">
            <i className="bi bi-info-circle me-1" />
            {demoNotice.en}
          </div>
        )}
      </div>
    </div>
  );
}