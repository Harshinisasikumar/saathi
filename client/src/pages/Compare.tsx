import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang } from '../i18n';
import { Stepper } from '../components/Stepper';
import { api } from '../api';
import type { ComparisonView } from '../types';

export default function Compare() {
  const { lang } = useLanguage();
  const { snapshot, districtId, demoNotice } = useFlow();
  const navigate = useNavigate();
  const [view, setView] = useState<ComparisonView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.compare(
          snapshot ?? { interestWeights: {}, workPrefs: [], learningPref: null, tradeScores: [] },
          districtId ?? undefined,
        );
        if (mounted) setView(res);
      } catch {
        if (mounted) setView(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [snapshot, districtId]);

  if (loading) {
    return <div className="text-center py-5">{pickLang(lang, { en: 'Building comparison…', ta: 'ஒப்பீடு உருவாகிறது…' })}</div>;
  }
  if (!view || view.header.length === 0) {
    return <div className="text-center py-5">{pickLang(lang, { en: 'No trades to compare yet. Complete the assessment first.', ta: 'இன்னும் ஒப்பிட தொழில்கள் இல்லை. முதலில் மதிப்பீட்டை முடிக்கவும்.' })}</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <Stepper step="compare" />
        <h2 className="h4 mb-1">{pickLang(lang, { en: 'Trade Comparison', ta: 'தொழில் ஒப்பீடு' })}</h2>
        <p className="text-muted small mb-3">
          {pickLang(lang, {
            en: 'We do not rank trades into a "best career". Compare the factors that matter to your family, each with its source.',
            ta: '"சிறந்த தொழில்" என தரவரிசைப்படுத்துவதில்லை. உங்கள் குடும்பத்திற்கு முக்கியமான அளவுகோல்களை ஒப்பிடவும்.',
          })}
        </p>
        {demoNotice && <div className="alert alert-info py-2 small">{demoNotice.en}</div>}

        <div className="table-responsive">
          <table className="table table-bordered align-middle saathi-table">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 180 }}>
                  {pickLang(lang, { en: 'Factor', ta: 'அளவுகோல்' })}
                </th>
                {view.header.map((h) => (
                  <th key={h.tradeId} style={{ minWidth: 160 }}>
                    {pickLang(lang, h.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row, ri) => (
                <tr key={ri}>
                  <td className="fw-semibold">{pickLang(lang, row.label)}</td>
                  {row.values.map((v) => (
                    <td key={v.tradeId}>
                      {pickLang(lang, v.text)}
                      {v.demo && (
                        <>
                          <div className="chip chip-mini ms-1">Demo</div>
                          <div className="src-mini">
                            {pickLang(lang, { en: 'Source: Demo dataset', ta: 'மூலம்: டெமோ தரவு' })}
                          </div>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {snapshot && snapshot.tradeScores.length > 0 && (
          <div className="mt-4">
            <h3 className="h6 text-uppercase text-muted">
              {pickLang(lang, { en: 'Match explanation', ta: 'பொருத்த விளக்கம்' })}
            </h3>
            <div className="row g-3">
              {view.header.map((h) => {
                const s = snapshot.tradeScores.find((x) => x.tradeId === h.tradeId);
                if (!s || s.score === 0) return null;
                return (
                  <div className="col-md-6" key={h.tradeId}>
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="fw-bold">{pickLang(lang, h.name)}</div>
                          <span className={`match-pct ${s.score > 0.6 ? 'high' : s.score > 0.4 ? 'mid' : 'low'}`}>
                            {Math.round(s.score * 100)}%
                          </span>
                        </div>
                        <div className="small text-muted mt-1">
                          {pickLang(lang, {
                            en: `Based on the learner's stated interests, this trade matches the learner's preference (${s.reasons.join('; ')}).`,
                            ta: `கற்பவரின் கூறப்பட்ட ஆர்வங்களின் அடிப்படையில், இந்த தொழில் கற்பவரின் விருப்பத்துடன் பொருந்துகிறது (${s.reasons.join('; ')}).`,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/counsellor')}>
            <i className="bi bi-arrow-left me-1" />
            {pickLang(lang, { en: 'Back to counsellor', ta: 'ஆலோசகரிடம் பின்' })}
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/scorecard')}>
            {pickLang(lang, { en: 'Family Decision Scorecard', ta: 'குடும்ப முடிவு மதிப்பீட்டு அட்டை' })}
            <i className="bi bi-arrow-right ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}