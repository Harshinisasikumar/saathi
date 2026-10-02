import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang } from '../i18n';
import { ErrorBox } from '../components/Shell';
import { Stepper } from '../components/Stepper';
import { RichReply } from '../components/RichReply';
import { UI } from '../i18n';

const QUICK = [
  { en: 'What is an electrician\u2019s job actually like?', ta: 'எலக்ட்ரீஷியன் வேலை உண்மையில் எப்படி இருக்கும்?' },
  { en: 'What can someone earn after CNC training?', ta: 'CNC பயிற்சிக்குப் பிறகு என்ன சம்பாதிக்கலாம்?' },
  { en: 'Will I get a job after this course?', ta: 'இந்த படிப்புக்குப் பிறகு வேலை கிடைக்குமா?' },
  { en: 'Degree இல்லாமல் futureல growth இருக்குமா?', ta: 'Degree இல்லாமல் futureல growth இருக்குமா?' },
  { en: 'Is the training centre near Salem good for solar?', ta: 'சேலம் அருகே சோலார் பயிற்சி மையம் நல்லதா?' },
];

export default function Counsellor() {
  const { lang } = useLanguage();
  const { chat, busy, error, sendChat } = useFlow();
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const send = async (msg?: string) => {
    const m = (msg ?? input).trim();
    if (!m || busy) return;
    setInput('');
    await sendChat(m);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <Stepper step="counsellor" />
        <ErrorBox message={error} />
        <div className="card saathi-card">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="avatar-saathi">
                <i className="bi bi-robot" />
              </span>
              <div>
                <div className="fw-bold">
                  {pickLang(lang, { en: 'AI Family Counsellor', ta: 'AI குடும்ப ஆலோசகர்' })}
                </div>
                <div className="text-muted small">
                  {pickLang(lang, {
                    en: 'Neutral, evidence-based. We never push a career.',
                    ta: 'நடுநிலை, ஆதார அடிப்படையிலானது. ஒரு தொழிலையும் திணிக்க மாட்டோம்.',
                  })}
                </div>
              </div>
            </div>

            <div className="chat-window py-3">
              {chat.length === 0 && (
                <div className="text-center text-muted small py-4">
                  {pickLang(lang, {
                    en: 'Ask me anything about the five vocational trades, earnings, placement, career progression, safety, or training centres near you.',
                    ta: 'ஐந்து தொழில்கள், வருமானம், வேலை வாய்ப்பு, முன்னேற்றம், பாதுகாப்பு அல்லது உங்கள் அருகில் உள்ள பயிற்சி மையங்கள் பற்றி எதுவும் கேளுங்கள்.',
                  })}
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-end' : ''}`}>
                  {m.role === 'user' ? (
                    <div className="bubble-user d-inline-block text-start">{m.text}</div>
                  ) : (
                    <>
                      <div className="bubble-bot d-inline-block text-start">
                        <div>{m.text}</div>
                        <RichReply structured={m.structured} />
                      </div>
                      {m.escalate && (
                        <div className="alert alert-warning small mt-2 mb-0 text-start saathi-escalate-note">
                          <div className="fw-semibold">
                            <i className="bi bi-person-lines-fill me-1" />
                            {pickLang(lang, {
                              en: 'This question may benefit from a human counsellor.',
                              ta: 'இந்த கேள்விக்கு மனித ஆலோசகரின் உதவி பயனளிக்கலாம்.',
                            })}
                          </div>
                          {m.escalateReason && <div className="opacity-75">{m.escalateReason}</div>}
                          <button className="btn btn-sm btn-warning mt-2" onClick={() => navigate('/escalate')}>
                            {UI.talkHuman[lang]}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {busy && (
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <span className="spinner-border spinner-border-sm" />
                  {pickLang(lang, { en: 'Thinking…', ta: 'யோசிக்கிறேன்…' })}
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {QUICK.map((q, i) => (
                <button key={i} className="chip" onClick={() => send(lang === 'ta' ? q.ta : q.en)}>
                  {lang === 'ta' ? q.ta : q.en}
                </button>
              ))}
            </div>

            <div className="d-flex gap-2">
              <input
                className="form-control form-control-lg"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={pickLang(lang, { en: 'Type your question in English or Tamil…', ta: 'ஆங்கிலத்திலோ தமிழிலோ கேள்வியை தட்டச்சு செய்யவும்…' })}
              />
              <button className="btn btn-primary" onClick={() => send()} disabled={busy}>
                <i className="bi bi-send" />
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/compare')}>
            <i className="bi bi-bar-chart me-2" />
            {pickLang(lang, { en: 'Compare trades', ta: 'தொழில்களை ஒப்பிடு' })}
          </button>
          <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate('/escalate')}>
            <i className="bi bi-person-lines-fill me-2" />
            {UI.talkHuman[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}