import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFlow } from '../context/FlowContext';
import { pickLang, UI } from '../i18n';
import { ErrorBox, StepShell, FooterNav } from '../components/Shell';

function ChipGroup({
  options,
  selected,
  onChange,
  multiple,
}: {
  options: Array<{ value: string; label: { en: string; ta: string } }>;
  selected: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
}) {
  const { lang } = useLanguage();
  const toggle = (v: string) => {
    if (multiple === false) {
      onChange(selected.includes(v) ? [] : [v]);
      return;
    }
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };
  return (
    <div className="d-flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip ${selected.includes(o.value) ? 'selected' : ''}`}
          onClick={() => toggle(o.value)}
        >
          {pickLang(lang, o.label)}
        </button>
      ))}
    </div>
  );
}

export default function Profile() {
  const { lang } = useLanguage();
  const { meta, userType, learner, setLearner, parent, setParent, submitLearner, submitParent, busy, error } = useFlow();
  const navigate = useNavigate();
  const [savedAs, setSavedAs] = useState<null | 'learner' | 'parent'>(null);

  const interestOptions = meta?.assessmentQuestions?.find((q) => q.id === 'interests')?.options ?? [];
  const workprefOptions = meta?.assessmentQuestions?.find((q) => q.id === 'workpref')?.options ?? [];
  const learningOptions = meta?.assessmentQuestions?.find((q) => q.id === 'learning')?.options ?? [];

  const showLearner = userType === 'learner' || userType === 'joint';
  const showParent = userType === 'parent' || userType === 'joint';

  const goNext = async () => {
    const okLearner = !showLearner || (await submitLearner());
    setSavedAs('learner');
    const okParent = !showParent || (await submitParent());
    if (okLearner && okParent) {
      if (userType === 'parent') navigate('/concern');
      else navigate('/assessment');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <ErrorBox message={error} />
        <StepShell title={pickLang(lang, { en: 'Family Profile', ta: 'குடும்ப விவரம்' })}>
          <div className="alert alert-light border small">
            <i className="bi bi-shield-check me-1" />
            {UI.privacyNote[lang]}
          </div>

          {showLearner && (
            <>
              <h3 className="h6 text-uppercase text-muted mt-3">{UI.learnerSection[lang]}</h3>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Age</label>
                  <input
                    className="form-control"
                    type="number"
                    min="10"
                    max="40"
                    value={learner.age}
                    onChange={(e) => setLearner({ age: e.target.value })}
                    placeholder="18"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Gender (optional)', ta: 'பாலினம் (விருப்பம்)' })}
                  </label>
                  <select
                    className="form-select"
                    value={learner.gender}
                    onChange={(e) => setLearner({ gender: e.target.value })}
                  >
                    <option value="">Choose not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Highest education', ta: 'உயர் கல்வி நிலை' })}
                  </label>
                  <select
                    className="form-select"
                    value={learner.education}
                    onChange={(e) => setLearner({ education: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {(meta?.educationLevels ?? []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {pickLang(lang, o.label)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Academic stream', ta: 'கல்வி பிரிவு' })}
                  </label>
                  <select
                    className="form-select"
                    value={learner.academicBackground}
                    onChange={(e) => setLearner({ academicBackground: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts / Humanities</option>
                    <option value="none">No particular stream</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Interests', ta: 'ஆர்வங்கள்' })}
                  </label>
                  <ChipGroup
                    options={interestOptions}
                    selected={learner.interests}
                    onChange={(v) => setLearner({ interests: v.slice(0, 3) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Preferred work type', ta: 'விருப்ப வேலை வகை' })}
                  </label>
                  <ChipGroup
                    options={workprefOptions}
                    selected={learner.preferredWorkType}
                    onChange={(v) => setLearner({ preferredWorkType: v })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Learning style', ta: 'கற்றல் பாணி' })}
                  </label>
                  <ChipGroup
                    multiple={false}
                    options={learningOptions}
                    selected={learner.learningPreference ? [learner.learningPreference] : []}
                    onChange={(v) => setLearner({ learningPreference: v[0] ?? '' })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Preferred location', ta: 'விருப்ப இடம்' })}
                  </label>
                  <select
                    className="form-select"
                    value={learner.district}
                    onChange={(e) => setLearner({ district: e.target.value })}
                  >
                    {(meta?.districts ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {pickLang(lang, d.name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Area type', ta: 'பகுதி வகை' })}
                  </label>
                  <select
                    className="form-select"
                    value={learner.urbanity}
                    onChange={(e) => setLearner({ urbanity: e.target.value })}
                  >
                    <option value="urban">Urban</option>
                    <option value="semiurban">Semi-urban</option>
                    <option value="rural">Rural</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Career goal', ta: 'தொழில் இலக்கு' })}
                  </label>
                  <input
                    className="form-control"
                    value={learner.careerGoals}
                    onChange={(e) => setLearner({ careerGoals: e.target.value })}
                    placeholder={pickLang(lang, { en: 'e.g. a stable job in 1 year', ta: 'எ.கா. 1 ஆண்டில் நிலையான வேலை' })}
                  />
                </div>
              </div>
              {savedAs === 'learner' && (
                <div className="text-success small mt-2">
                  <i className="bi bi-check-circle me-1" /> {pickLang(lang, { en: 'Learner profile saved.', ta: 'கற்பவர் விவரம் சேமிக்கப்பட்டது.' })}
                </div>
              )}
            </>
          )}

          {showParent && (
            <>
              <h3 className="h6 text-uppercase text-muted mt-4">{UI.familySection[lang]}</h3>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    {pickLang(lang, { en: 'District', ta: 'மாவட்டம்' })}
                  </label>
                  <select
                    className="form-select"
                    value={parent.district}
                    onChange={(e) => setParent({ district: e.target.value })}
                  >
                    {(meta?.districts ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {pickLang(lang, d.name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Household income', ta: 'குடும்ப வருமானம்' })}
                  </label>
                  <select
                    className="form-select"
                    value={parent.incomeBracket}
                    onChange={(e) => setParent({ incomeBracket: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {(meta?.incomeBrackets ?? []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {pickLang(lang, o.label)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Max distance from home', ta: 'வீட்டிலிருந்து அதிகபட்ச தூரம்' })}
                  </label>
                  <select
                    className="form-select"
                    value={parent.maxDistanceKm}
                    onChange={(e) => setParent({ maxDistanceKm: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="10">{pickLang(lang, { en: 'Within 10 km', ta: '10 கிமீக்குள்' })}</option>
                    <option value="25">{pickLang(lang, { en: 'Within 25 km', ta: '25 கிமீக்குள்' })}</option>
                    <option value="50">{pickLang(lang, { en: 'Within 50 km', ta: '50 கிமீக்குள்' })}</option>
                    <option value="100">{pickLang(lang, { en: 'Anywhere in district', ta: 'மாவட்டத்தில் எங்கும்' })}</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    {pickLang(lang, { en: 'Goal for the learner', ta: 'கற்பவருக்கான இலக்கு' })}
                  </label>
                  <select
                    className="form-select"
                    value={parent.preference}
                    onChange={(e) => setParent({ preference: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="job_immediate">{pickLang(lang, { en: 'Immediate employment', ta: 'உடனடி வேலை' })}</option>
                    <option value="further_study">{pickLang(lang, { en: 'Further education first', ta: 'முதலில் மேற்படிப்பு' })}</option>
                    <option value="undecided">{pickLang(lang, { en: 'Not decided yet', ta: 'இன்னும் முடிவாகவில்லை' })}</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    {pickLang(lang, { en: "Parent's main concern", ta: 'பெற்றோரின் முக்கிய கவலை' })}
                  </label>
                  <select
                    className="form-select"
                    value={parent.primaryConcern}
                    onChange={(e) => setParent({ primaryConcern: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {Object.values(meta?.concernLabels ?? {}).map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ta' ? c.ta : c.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {savedAs === 'parent' && (
                <div className="text-success small mt-2">
                  <i className="bi bi-check-circle me-1" /> {pickLang(lang, { en: 'Family profile saved.', ta: 'குடும்ப விவரம் சேமிக்கப்பட்டது.' })}
                </div>
              )}
            </>
          )}

          <FooterNav backTo="/start" onNext={goNext} busy={busy} />
        </StepShell>
      </div>
    </div>
  );
}