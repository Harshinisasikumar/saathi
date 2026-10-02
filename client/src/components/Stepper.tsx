import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { STEP_LABELS } from '../i18n';
import type { UserType } from '../types';

export type StepId = 'profile' | 'assessment' | 'concern' | 'counsellor' | 'compare' | 'scorecard' | 'pathway';

const STEP_IDS: StepId[] = ['profile', 'assessment', 'concern', 'counsellor', 'compare', 'scorecard', 'pathway'];

const USER_STEPS: Record<UserType, StepId[]> = {
  learner: ['profile', 'assessment', 'counsellor', 'compare', 'scorecard', 'pathway'],
  parent: ['profile', 'concern', 'counsellor', 'compare', 'scorecard', 'pathway'],
  joint: STEP_IDS,
};

export function Stepper({ step }: { step: StepId }) {
  const { lang } = useLanguage();
  const { userType } = useFlow();
  const steps = USER_STEPS[userType ?? 'joint'];
  const current = steps.indexOf(step);

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
      {steps.map((id, i) => (
        <div key={id} className={`step-chip ${i === current ? 'active' : i < current ? 'done' : ''}`}>
          {i < current ? <i className="bi bi-check2" /> : <span>{i + 1}</span>}
          <span className="ms-1 d-none d-sm-inline">{STEP_LABELS[STEP_IDS.indexOf(id)][lang]}</span>
        </div>
      ))}
    </div>
  );
}