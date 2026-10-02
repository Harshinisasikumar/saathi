import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang } from '../i18n';
import { Stepper } from '../components/Stepper';
import { api } from '../api';
import type { ScorecardResult, ScoreLevel } from '../types';

const LEVEL_STYLE: Record<ScoreLevel, { cls: string; label: { en: string; ta: string } }> = {
  HIGH: { cls: 'level-high', label: { en: 'High', ta: 'அதிகம்' } },
  MEDIUM: { cls: 'level-medium', label: { en: 'Medium', ta: 'நடுத்தரம்' } },
  LOW: { cls: 'level-low', label: { en: 'Low', ta: 'குறைவு' } },
  LIMITED: { cls: 'level-low', label: { en: 'Limited', ta: 'குறைவு' } },
  UNAVAILABLE: { cls: 'level-none', label: { en: 'Unavailable', ta: 'கிடைக்கவில்லை' } },
};

export default function ScorecardPage() {
  const { lang } = useLanguage();
  const { snapshot, concern, districtId } = useFlow();
  const navigate = useNavigate();
  const [card, setCard] = useState<ScorecardResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.scorecard(
          snapshot ?? { interestWeights: {}, workPrefs: [], learningPref: null, tradeScores: [] },
          concern?.category ?? 'other',
          districtId ?? undefined,
        );
        if (mounted) setCard(res);
      } catch {
        if (mounted) setCard(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [snapshot, concern, districtId]);

  if (loading) {
    return <div className="text-center py-5">{pickLang(lang, { en: 'Preparing scorecard…', ta: 'மதிப்பீட்டு அட்டை தயாராகிறது…' })}</div>;
  }

  const cells = card
    ? [
        card.learnerInterest,
        card.familyConcerns,
        card.trainingAccessibility,
        card.careerPathwayEvidence,
        card.localOpportunityEvidence,
        card.dataConfidence,
      ]
    : [];

  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <Stepper step="scorecard" />
        <div className="d-flex align-items-center justify-content-between">
          <h2 className="h4 mb-0">{pickLang(lang, { en: 'Family Decision Scorecard', ta: 'குடும்ப முடிவு மதிப்பீட்டு அட்டை' })}</h2>
          <span className="badge saathi-soft">{pickLang(lang, { en: 'Not a single "success score"', ta: 'ஒற்றை வெற்றி மதிப்பெண் இல்லை' })}</span>
        </div>
        <p className="text-muted small mt-2">
          {pickLang(lang, {
            en: 'Each factor is shown separately so your family can weigh what matters most to you.',
            ta: 'ஒவ்வொரு காரணியும் தனித்தனியாக காட்டப்படுகிறது, உங்கள் குடும்பம் முக்கியமானவற்றை எடைபோடலாம்.',
          })}
        </p>

        <div className="row g-3 mt-1">
          {cells.map((cell, i) => {
            const style = LEVEL_STYLE[cell.level] ?? LEVEL_STYLE.UNAVAILABLE;
            return (
              <div className="col-md-6" key={i}>
                <div className="card scorecard-row h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold">{pickLang(lang, cell.label)}</div>
                      <span className={`score-level ${style.cls}`}>{pickLang(lang, style.label)}</span>
                    </div>
                    {cell.explanation.slice(0, 3).map((e, j) => (
                      <div key={j} className="small text-muted mt-1">
                        <i className="bi bi-info-circle me-1" />
                        {pickLang(lang, e)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {card && (
          <div className="alert alert-secondary d-flex align-items-center gap-3 mt-3">
            <i className="bi bi-tag fs-4" />
            <div>
              <strong>Parent concern:</strong>{' '}
              {lang === 'ta' ? card.parentConcern.label.ta.toUpperCase() : card.parentConcern.label.en.toUpperCase()}
              <div className="small text-muted">
                {pickLang(lang, {
                  en: 'Discussed in the counselling step with evidence from the knowledge base.',
                  ta: 'ஆலோசனை படியில் அறிவுத் தளத்தின் ஆதாரங்களுடன் விவாதிக்கப்பட்டது.',
                })}
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/compare')}>
            <i className="bi bi-arrow-left me-1" />
            {pickLang(lang, { en: 'Comparison', ta: 'ஒப்பீடு' })}
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/pathway')}>
            {pickLang(lang, { en: 'Career Pathway', ta: 'தொழில் பாதை' })}
            <i className="bi bi-arrow-right ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}