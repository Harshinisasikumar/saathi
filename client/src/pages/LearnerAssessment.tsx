import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang } from '../i18n';
import { ErrorBox, StepShell, FooterNav } from '../components/Shell';
import { Stepper } from '../components/Stepper';

export default function LearnerAssessment() {
  const { lang } = useLanguage();
  const { meta, busy, error, submitAssessment, userType } = useFlow();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = meta?.assessmentQuestions ?? [];

  const setAns = (id: string, value: string) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const toggle = (id: string, type: string, value: string) => {
    const current = (answers[id] ?? '').split(',').filter(Boolean);
    if (type === 'single') {
      setAns(id, current.includes(value) ? '' : value);
    } else {
      const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
      setAns(id, next.slice(0, 3).join(','));
    }
  };

  const submit = async () => {
    const payload = Object.entries(answers)
      .filter(([, v]) => v)
      .map(([q, v]) => ({ questionId: q, value: v }));
    const ok = await submitAssessment(payload);
    if (ok) {
      if (userType === 'joint') navigate('/concern');
      else navigate('/counsellor');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Stepper step="assessment" />
        <ErrorBox message={error} />
        <StepShell
          title={pickLang(lang, {
            en: 'Career Interest Snapshot',
            ta: 'தொழில் ஆர்வ சுருக்கம்',
          })}
        >
          <div className="alert alert-light border small">
            <i className="bi bi-info-circle me-1" />
            {pickLang(lang, {
              en: 'This short snapshot is for counselling only. It is not a scientifically validated psychological test.',
              ta: 'இந்த சிறிய சுருக்கம் ஆலோசனைக்கு மட்டுமே. இது அறிவியல் சான்றுடைய உளவியல் சோதனை அல்ல.',
            })}
          </div>

          {questions.map((q, idx) => (
            <div className="mb-4" key={q.id}>
              <label className="form-label fw-semibold">
                {idx + 1}. {pickLang(lang, q.prompt)}
              </label>
              <div className="d-flex flex-wrap gap-2">
                {q.options.map((o) => {
                  const selected = (answers[q.id] ?? '').split(',').includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={`chip ${selected ? 'selected' : ''}`}
                      onClick={() => toggle(q.id, q.type, o.value)}
                    >
                      {pickLang(lang, o.label)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <FooterNav
            backTo="/profile"
            onNext={submit}
            busy={busy}
            nextLabel={pickLang(lang, { en: 'See my match', ta: 'என் பொருத்தம் பார்க்க' })}
          />
        </StepShell>
      </div>
    </div>
  );
}