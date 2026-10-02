import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang } from '../i18n';
import { Stepper } from '../components/Stepper';
import { api } from '../api';
import type { PathwayView } from '../types';

export default function Pathway() {
  const { lang } = useLanguage();
  const { snapshot, demoNotice } = useFlow();
  const navigate = useNavigate();
  const [view, setView] = useState<PathwayView | null>(null);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.pathway(selected || undefined);
        if (mounted) setView(res);
      } catch {
        if (mounted) setView(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selected]);

  const topTrade = snapshot?.tradeScores[0]?.tradeId;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Stepper step="pathway" />
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h4 mb-0">{pickLang(lang, { en: 'Career Pathway', ta: 'தொழில் பாதை' })}</h2>
        </div>
        <p className="text-muted small mt-2">
          {pickLang(lang, {
            en: 'A typical route after school. Paths differ by trade, provider and area.',
            ta: 'பள்ளிக்குப் பிறகு வழக்கமான பாதை. தொழில், வழங்குநர் மற்றும் பகுதிக்கு ஏற்ப பாதைகள் வேறுபடும்.',
          })}
        </p>

        <div className="mb-3">
          <label className="form-label">
            {pickLang(lang, { en: 'Show details for a trade', ta: 'தொழிலின் விவரங்களை காட்டு' })}
          </label>
          <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">
              {pickLang(lang, { en: 'General pathway (recommended for parent view)', ta: 'பொது பாதை (பெற்றோர் பார்வைக்கு பரிந்துரை)' })}
            </option>
            {snapshot?.tradeScores?.map((s) => (
              <option key={s.tradeId} value={s.tradeId}>
                {s.tradeId}
                {s.tradeId === topTrade ? ' ★' : ''}
              </option>
            ))}
          </select>
        </div>

        {view && (
          <div className="pathway">
            {view.steps.map((s, i) => (
              <div key={i}>
                <div className="pathway-node">
                  <div className="pathway-dot">{i + 1}</div>
                  <div className="card flex-fill">
                    <div className="card-body py-2">
                      <div className="fw-bold">{pickLang(lang, s.label)}</div>
                      <div className="small text-muted">{pickLang(lang, s.detail)}</div>
                      {s.myNote && (
                        <div className="src-mini mt-1">
                          <i className="bi bi-flask me-1" />
                          {pickLang(lang, s.myNote)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {i < view.steps.length - 1 && <div className="pathway-arrow">↓</div>}
              </div>
            ))}
          </div>
        )}

        <div className="alert alert-warning py-2 small mt-3">
          <i className="bi bi-exclamation-triangle me-1" />
          {view ? pickLang(lang, view.caveat) : ''}
        </div>
        {demoNotice && <div className="alert alert-info py-2 small">{demoNotice.en}</div>}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/scorecard')}>
            <i className="bi bi-arrow-left me-1" />
            {pickLang(lang, { en: 'Scorecard', ta: 'மதிப்பீட்டு அட்டை' })}
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/escalate')}>
            {pickLang(lang, { en: 'Continue — next steps', ta: 'தொடரவும் — அடுத்த படிகள்' })}
            <i className="bi bi-arrow-right ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}