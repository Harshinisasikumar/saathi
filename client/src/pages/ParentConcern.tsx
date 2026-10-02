import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang } from '../i18n';
import { ErrorBox, StepShell, FooterNav } from '../components/Shell';
import { Stepper } from '../components/Stepper';
import { CONCERN_OPTIONS } from '../i18n';

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: unknown) => void;
  start: () => void;
}

export default function ParentConcern() {
  const { lang } = useLanguage();
  const { busy, error, submitConcern, concern } = useFlow();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    const ok = await submitConcern(text.trim());
    if (ok) navigate('/counsellor');
  };

  const quickPick = (v: string) => {
    setText(v);
  };

  const speak = () => {
    const SR = window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser. Please type your concern.');
      return;
    }
    const rec = new SR();
    rec.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      if (t) setText(t);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const example =
    lang === 'ta'
      ? 'இந்த course படித்த பிறகு வேலை கிடைக்குமா?'
      : 'Will this course provide a good career?';

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Stepper step="concern" />
        <ErrorBox message={error} />
        <StepShell
          title={pickLang(lang, {
            en: 'What is your main concern about vocational education?',
            ta: 'தொழிற்கல்வி குறித்த உங்கள் முக்கிய கவலை என்ன?',
          })}
        >
          <div className="d-flex flex-wrap gap-2 mb-3">
            {CONCERN_OPTIONS.map((o) => (
              <button
                key={o.id}
                className={`chip ${text.toLowerCase().includes(o.en.toLowerCase()) ? 'selected' : ''}`}
                onClick={() => quickPick(lang === 'ta' ? o.ta : o.en)}
              >
                {lang === 'ta' ? o.ta : o.en}
              </button>
            ))}
          </div>

          <div className="mb-2">
            <label className="form-label">
              {pickLang(lang, {
                en: 'Type or speak your concern in your own words',
                ta: 'உங்கள் கவலையை உங்கள் சொற்களில் எழுதுங்கள் அல்லது பேசுங்கள்',
              })}
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`${example}\n\n${lang === 'ta' ? 'அல்லது நீங்கள் விரும்பிய வகையில் கேளுங்கள்…' : 'or ask in your own words…'}`}
            />
          </div>

          <div className="d-flex align-items-center gap-3 mb-3">
            <button className="btn btn-outline-secondary" onClick={speak} disabled={listening}>
              {listening ? (
                <> <span className="spinner-border spinner-border-sm me-1" /> Listening…</>
              ) : (
                <>
                  <i className="bi bi-mic me-1" />
                  {pickLang(lang, { en: 'Speak', ta: 'பேசுங்கள்' })}
                </>
              )}
            </button>
            <span className="text-muted small">
              {pickLang(lang, { en: 'E.g.', ta: 'எ.கா.' })}: {example}
            </span>
          </div>

          {concern && (
            <div className="alert alert-success d-flex align-items-center gap-2">
              <i className="bi bi-tag fs-4" />
              <div>
                <div className="fw-semibold">
                  {pickLang(lang, { en: 'Concern detected:', ta: 'கவலை கண்டறியப்பட்டது:' })}{' '}
                  {concern.label.toUpperCase()}
                </div>
                <div className="small opacity-75">
                  {pickLang(lang, {
                    en: 'We will discuss this concern with evidence in the counselling step.',
                    ta: 'ஆலோசனை படியில் இந்த கவலையை ஆதாரங்களுடன் விவாதிப்போம்.',
                  })}
                </div>
              </div>
            </div>
          )}

          <FooterNav backTo="/profile" onNext={submit} busy={busy} />
        </StepShell>
      </div>
    </div>
  );
}