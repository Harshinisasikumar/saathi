import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang, UI } from '../i18n';
import { api } from '../api';
import type { TradeRecord, TradeSummary } from '../types';

export function Trades() {
  const { lang } = useLanguage();
  const { districtId, meta } = useFlow();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeSummary[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.trades(districtId ?? undefined);
        setTrades(res.trades);
      } catch {
        setTrades([]);
      }
    })();
  }, [districtId]);

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <h2 className="h4">{UI.btnExplore[lang]}</h2>
        <p className="text-muted small">
          {pickLang(lang, {
            en: 'Prototype dataset: 5 trades. Every figure below is clearly-labelled demo data — not official statistics.',
            ta: 'முன்னோட்ட தரவு: 5 தொழில்கள். கீழே உள்ள ஒவ்வொரு எண்ணும் டெமோ தரவு — அதிகாரப்பூர்வ புள்ளிவிவரங்கள் அல்ல.',
          })}
        </p>
        {meta?.demoNotice && <div className="alert alert-info py-2 small">{meta.demoNotice.en}</div>}

        <div className="row g-3">
          {(trades ?? []).map((t) => (
            <div className="col-md-6" key={t.id}>
              <div className="card saathi-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-1">{t.name[lang]}</h5>
                    <span className="badge bg-light text-dark">{t.code}</span>
                  </div>
                  <div className="text-muted small mb-2">{t.oneLine[lang]}</div>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className="chip chip-mini">
                      {pickLang(lang, { en: `${t.durationMonths} months`, ta: `${t.durationMonths} மாதங்கள்` })}
                    </span>
                    <span className="chip chip-mini">NSQF {t.nsqfEntry}</span>
                    <span className="chip chip-mini demo-chip">Demo earnings</span>
                  </div>
                  <div className="small">
                    <div>
                      <strong>{pickLang(lang, { en: 'Demo earnings range:', ta: 'டெமோ வருமான வரம்பு:' })}</strong> {t.earningsDemo}
                    </div>
                    <div>
                      <strong>{pickLang(lang, { en: 'Local outcome data:', ta: 'உள்ளூர் முடிவு தரவு:' })}</strong>{' '}
                      {t.localOutcome === 'yes'
                        ? pickLang(lang, { en: 'available (demo)', ta: 'கிடைக்கிறது (டெமோ)' })
                        : pickLang(lang, { en: 'unavailable', ta: 'கிடைக்கவில்லை' })}
                    </div>
                  </div>
                  <button className="btn btn-outline-primary mt-3" onClick={() => navigate(`/trades/${t.id}`)}>
                    {pickLang(lang, { en: 'See full details', ta: 'முழு விவரம் பார்க்க' })}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TradeDetail() {
  const { lang } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<TradeRecord | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.trade(id);
        setTrade(res.trade);
      } catch {
        setTrade(null);
      }
    })();
  }, [id]);

  if (!trade) {
    return <div className="text-center py-5">{pickLang(lang, { en: 'Loading trade…', ta: 'தொழில் ஏற்றுகிறது…' })}</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate('/trades')}>
          <i className="bi bi-arrow-left me-1" />
          {UI.btnExplore[lang]}
        </button>
        <div className="card saathi-card">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-start">
              <h2 className="h3">{trade.name[lang]}</h2>
              <span className="badge bg-light text-dark">{trade.code}</span>
            </div>
            <p>{trade.oneLine[lang]}</p>
            <h4 className="h6 text-uppercase text-muted mt-3">
              {pickLang(lang, { en: 'A day in this trade', ta: 'இந்த தொழிலில் ஒரு நாள்' })}
            </h4>
            <p className="small">{trade.dayInLife[lang]}</p>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <div className="small fw-semibold text-uppercase">{pickLang(lang, { en: 'Duration', ta: 'காலம்' })}</div>
                <div>
                  {trade.typicalDurationMonths} {pickLang(lang, { en: 'months', ta: 'மாதங்கள்' })} (demo)
                </div>
              </div>
              <div className="col-md-4">
                <div className="small fw-semibold text-uppercase">NSQF</div>
                <div>
                  {pickLang(lang, { en: 'Entry at level', ta: 'நுழைவு நிலை' })} {trade.nsqfEntry} (demo)
                </div>
              </div>
              <div className="col-md-4">
                <div className="small fw-semibold text-uppercase">
                  {pickLang(lang, { en: 'Eligibility', ta: 'தகுதி' })}
                </div>
                <div className="small">{trade.eligibility.minEducation[lang]}</div>
              </div>
            </div>

            <h4 className="h6 text-uppercase text-muted mt-4">
              {pickLang(lang, { en: 'Job roles', ta: 'வேலை பாத்திரங்கள்' })}
            </h4>
            <ul>
              {trade.roles.map((r, i) => (
                <li key={i}>
                  {r.title[lang]} <span className="text-muted">(NSQF {r.nsqfLevel})</span>
                  <div className="small text-muted">
                    {pickLang(lang, { en: 'Employed by:', ta: 'முதலாளிகள்:' })} {r.employers[lang]}
                  </div>
                </li>
              ))}
            </ul>

            <h4 className="h6 text-uppercase text-muted mt-3">
              {pickLang(lang, { en: 'Possible progression (demo)', ta: 'சாத்தியமான முன்னேற்றம் (டெமோ)' })}      
            </h4>
            <ul>
              {trade.ladder.map((r, i) => (
                <li key={i}>
                  <strong>NSQF {r.nsqfLevel}:</strong> {r.title[lang]} —{' '}
                  {pickLang(lang, { en: `${r.yearsFromEntry} years after entry`, ta: `நுழைவுக்குப் பிறகு ${r.yearsFromEntry} ஆண்டுகள்` })}
                </li>
              ))}
            </ul>

            <h4 className="h6 text-uppercase text-muted mt-3">
              {pickLang(lang, { en: 'Safety', ta: 'பாதுகாப்பு' })}
            </h4>
            <p className="small">{trade.safety[lang]}</p>
            <h4 className="h6 text-uppercase text-muted mt-3">
              {pickLang(lang, { en: 'Social perception note', ta: 'சமூக மதிப்பீடு குறிப்பு' })}
            </h4>
            <p className="small">{trade.perceptionNote[lang]}</p>

            <div className="src-mini">
              <i className="bi bi-flask me-1" />
              {pickLang(lang, {
                en: 'Demo data — for prototype demonstration only. NSQF levels and durations must be verified with the training provider.',
                ta: 'டெமோ தரவு — முன்னோட்ட ஆர்ப்பாட்டத்திற்கு மட்டும். NSQF நிலைகள் மற்றும் காலங்கள் பயிற்சி வழங்குநருடன் சரிபார்க்கப்பட வேண்டும்.',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}