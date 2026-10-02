import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang, UI } from '../i18n';
import { ErrorBox } from '../components/Shell';
import { CONCERN_OPTIONS } from '../i18n';
import { api } from '../api';
import type { Lang } from '../types';

interface EscalationForm {
  language: Lang;
  concernCategory: string;
  contactMethod: string;
  preferredTime: string;
  description: string;
}

export default function Escalation() {
  const { lang } = useLanguage();
  const { sessionId, concern, busy } = useFlow();
  const navigate = useNavigate();
  const [form, setForm] = useState<EscalationForm>({
    language: lang,
    concernCategory: concern?.category ?? 'other',
    contactMethod: 'phone',
    preferredTime: 'morning',
    description: '',
  });
  const [submitted, setSubmitted] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!sessionId) return;
    setError(null);
    try {
      const res = await api.escalation(sessionId, form);
      setSubmitted(res.message ?? 'Counsellor request submitted.');
    } catch (e) {
      setError('Could not submit the request. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="row justify-content-center">
        <div className="col-lg-6 text-center">
          <div className="card saathi-card p-5">
            <i className="bi bi-check-circle-fill text-success fs-1" />
            <h3 className="h4 mt-3">Counsellor request submitted.</h3>
            <p className="text-muted">
              {pickLang(lang, {
                en: 'For the hackathon, this created a record instead of calling a counsellor.',
                ta: 'Hackathonக்காக, இது ஆலோசகரை அழைக்காமல் பதிவை உருவாக்கியது.',
              })}
            </p>
            <div className="d-flex gap-2 justify-content-center mt-2">
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                {pickLang(lang, { en: 'Back to home', ta: 'முகப்புக்கு' })}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/trades')}>
                {UI.btnExplore[lang]}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <ErrorBox message={error} />
        <div className="card saathi-card">
          <div className="card-body p-4 p-md-5">
            <h2 className="h4 mb-1">{UI.talkHuman[lang]}</h2>
            <p className="text-muted small mb-4">
              {pickLang(lang, {
                en: 'A human counsellor can help with questions the AI cannot verify, or for provider-specific decisions.',
                ta: 'AI சரிபார்க்க முடியாத கேள்விகள் அல்லது வழங்குநர் சார்ந்த முடிவுகளுக்கு மனித ஆலோசகர் உதவலாம்.',
              })}
            </p>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  {pickLang(lang, { en: 'Preferred language', ta: 'விருப்ப மொழி' })}
                </label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value as Lang })}
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  {pickLang(lang, { en: 'Concern category', ta: 'கவலை வகை' })}
                </label>
                <select
                  className="form-select"
                  value={form.concernCategory}
                  onChange={(e) => setForm({ ...form, concernCategory: e.target.value })}
                >
                  {CONCERN_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {lang === 'ta' ? o.ta : o.en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  {pickLang(lang, { en: 'Contact method', ta: 'தொடர்பு முறை' })}
                </label>
                <select
                  className="form-select"
                  value={form.contactMethod}
                  onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
                >
                  <option value="phone">Phone call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="inperson">In person at a centre</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  {pickLang(lang, { en: 'Preferred time', ta: 'விருப்ப நேரம்' })}
                </label>
                <select
                  className="form-select"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                >
                  <option value="morning">Morning (9–12)</option>
                  <option value="afternoon">Afternoon (12–5)</option>
                  <option value="evening">Evening (5–8)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">
                  {pickLang(lang, { en: 'Short description', ta: 'சிறு விளக்கம்' })}
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={pickLang(lang, {
                    en: 'Tell us what you want to discuss (no personal identity needed).',
                    ta: 'என்ன விவாதிக்க விரும்புகிறீர்கள் (அடையாளம் தேவையில்லை).',
                  })}
                />
              </div>
            </div>

            <div className="alert alert-light border small mt-3">
              <i className="bi bi-shield-lock me-1" />
              {pickLang(lang, {
                en: 'We do not ask for your name or address here. A counsellor will connect with you directly.',
                ta: 'உங்கள் பெயரையோ முகவரியையோ இங்கு கேட்கவில்லை. ஆலோசகர் உங்களை நேரடியாக தொடர்பு கொள்வார்.',
              })}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1" />
                {pickLang(lang, { en: 'Back', ta: 'பின்' })}
              </button>
              <button className="btn btn-primary btn-lg" onClick={submit} disabled={busy}>
                {busy && <span className="spinner-border spinner-border-sm me-2" />}
                {pickLang(lang, { en: 'Submit request', ta: 'கோரிக்கை சமர்ப்பிக்க' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}