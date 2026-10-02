import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import type { UserType } from '../types';
import { pickLang } from '../i18n';
import { ErrorBox } from '../components/Shell';

const MODES: Array<{
  id: UserType;
  icon: string;
  name: { en: string; ta: string };
  desc: { en: string; ta: string };
}> = [
  {
    id: 'learner',
    icon: 'person-badge',
    name: { en: 'Learner', ta: 'கற்பவர்' },
    desc: { en: 'I am a learner choosing a vocational trade.', ta: 'நான் தொழிற்பயிற்சி தேர்வு செய்யும் கற்பவர்.' },
  },
  {
    id: 'parent',
    icon: 'people',
    name: { en: 'Parent / Family', ta: 'பெற்றோர் / குடும்பம்' },
    desc: { en: 'I am a parent or family member learning about trades.', ta: 'நான் பெற்றோர்/குடும்ப உறுப்பினர்; தொழில்களைப் பற்றி தெரிந்துகொள்ள விரும்புகிறேன்.' },
  },
  {
    id: 'joint',
    icon: 'people-fill',
    name: { en: 'Joint counselling', ta: 'இணைந்த ஆலோசனை' },
    desc: { en: 'Learner and family together.', ta: 'கற்பவர் மற்றும் குடும்பம் ஒன்றாக.' },
  },
];

export default function ChooseUser() {
  const { lang } = useLanguage();
  const { startSession, busy, error } = useFlow();
  const navigate = useNavigate();

  const pick = async (mode: UserType) => {
    const sessionId = await startSession(mode, lang);
    if (sessionId) navigate('/profile');
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <h2 className="h4 mb-4 text-center">
          {pickLang(lang, { en: 'Who is using Saathi today?', ta: 'இன்று சாதியை யார் பயன்படுத்துகிறார்?' })}
        </h2>
        <ErrorBox message={error} />
        <div className="d-grid gap-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              className="btn saathi-mode-btn text-start p-4"
              disabled={busy}
              onClick={() => pick(m.id)}
            >
              <div className="d-flex align-items-center">
                <i className={`bi bi-${m.icon} saathi-mode-icon me-3`} />
                <div>
                  <div className="fw-bold h5 mb-0">{pickLang(lang, m.name)}</div>
                  <div className="text-muted small">{pickLang(lang, m.desc)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}