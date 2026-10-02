import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { pickLang } from '../i18n';
import type { AdminStats } from '../types';

const COLORS = ['#4e6ef2', '#22a06b', '#f29b38', '#d64550', '#7b61c3', '#2ba4b0', '#9aa5b1', '#c9a227', '#5f7d95', '#8a9a5b'];

export function AdminDashboard({ stats, onLogout }: { stats: AdminStats; onLogout: () => void }) {
  const { lang } = useLanguage();
  const pieData = Object.entries(stats.concernDistribution)
    .map(([name, value]) => ({ name: label(name), value }))
    .filter((d) => d.value > 0);

  const barData = stats.byDistrict.map((d) => ({
    name: d.district,
    sessions: d.count,
    concern: label(d.topConcern),
  }));

  function label(id: string): string {
    return lang === 'ta' ? tamilFor(id) : englishFor(id);
  }

  function englishFor(id: string): string {
    const map: Record<string, string> = {
      income: 'Income',
      job_security: 'Job security',
      social_perception: 'Social perception',
      safety: 'Safety',
      career_growth: 'Career growth',
      further_education: 'Further education',
      distance: 'Distance',
      training_quality: 'Training quality',
      placement: 'Placement',
      other: 'Other',
    };
    return map[id] ?? id;
  }

  function tamilFor(id: string): string {
    const map: Record<string, string> = {
      income: 'வருமானம்',
      job_security: 'வேலை பாதுகாப்பு',
      social_perception: 'சமூக மதிப்பீடு',
      safety: 'பாதுகாப்பு',
      career_growth: 'முன்னேற்றம்',
      further_education: 'மேற்படிப்பு',
      distance: 'தொலைவு',
      training_quality: 'பயிற்சி தரம்',
      placement: 'வேலை வாய்ப்பு',
      other: 'மற்றவை',
    };
    return map[id] ?? id;
  }

  const cards = [
    { label: 'Total counselling sessions', value: stats.totalSessions, icon: 'people-fill' },
    { label: 'Parent participation', value: stats.parentSessions, icon: 'person-arms-up' },
    { label: 'Learner participation', value: stats.learnerSessions, icon: 'person-badge' },
    { label: 'Escalations', value: stats.escalations, icon: 'person-lines-fill' },
    { label: 'Unresolved concerns', value: stats.unresolvedConcerns, icon: 'exclamation-triangle' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h4 mb-0">
          <i className="bi bi-speedometer2 me-2" />
          {pickLang(lang, { en: 'Scheme Administrator Dashboard', ta: 'திட்ட நிர்வாகி பலகை' })}
        </h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
          {pickLang(lang, { en: 'Logout', ta: 'வெளியேறு' })}
        </button>
      </div>
      <div className="alert alert-warning py-2 small">
        <i className="bi bi-eye-slash me-1" />
        {pickLang(lang, {
          en: 'Aggregated demo data only. Private conversations are never exposed here.',
          ta: 'திரட்டப்பட்ட டெமோ தரவு மட்டுமே. தனிப்பட்ட உரையாடல்கள் இங்கு ஒருபோதும் காட்டப்படாது.',
        })}
      </div>

      <div className="row g-3 mb-4">
        {cards.map((c, i) => (
          <div className="col-6 col-md-2" key={i}>
            <div className="card stat-card h-100">
              <div className="card-body text-center">
                <i className={`bi bi-${c.icon} stat-icon`} />
                <div className="stat-value">{c.value}</div>
                <div className="stat-label small">{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="h6">
                {pickLang(lang, { en: 'Concern distribution', ta: 'கவலை விநியோகம்' })}
              </h5>
              {pieData.length === 0 ? (
                <p className="text-muted small">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="h6">
                {pickLang(lang, { en: 'Location-wise concern concentration', ta: 'இடம் வாரியாக கவலை செறிவு' })}
              </h5>
              {barData.length === 0 ? (
                <p className="text-muted small">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" name="Sessions" fill="#4e6ef2" />
                    <Bar dataKey="concern" name="Main concern" fill="#f29b38" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h5 className="h6">
            {pickLang(lang, { en: 'Conversation-based concern indicator (prototype analytics)', ta: 'உரையாடல் சார்ந்த கவலை காட்டி (முன்னோட்ட பகுப்பாய்வு)' })}
          </h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>{pickLang(lang, { en: 'Before', ta: 'முன்பு' })}</th>
                  <th>{pickLang(lang, { en: 'After', ta: 'பிறகு' })}</th>
                  <th>{pickLang(lang, { en: 'Note', ta: 'குறிப்பு' })}</th>
                </tr>
              </thead>
              <tbody>
                {stats.concernShift.map((s, i) => (
                  <tr key={i}>
                    <td>{lang === 'ta' ? s.label.ta : s.label.en}</td>
                    <td>
                      <i className="bi bi-arrow-up-circle text-danger me-1" />
                      {s.before}
                    </td>
                    <td>
                      <i className="bi bi-arrow-down-circle text-success me-1" />
                      {s.after}
                    </td>
                    <td className="small text-muted">{lang === 'ta' ? s.note.ta : s.note.en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="src-mini">
            {pickLang(lang, {
              en: 'This is a conversation-based concern indicator for prototype analytics — it does not prove a change in real-world attitudes.',
              ta: 'இது முன்னோட்ட பகுப்பாய்விற்கான உரையாடல் சார்ந்த கவலை காட்டி — நிஜ உலக மனநிலை மாற்றத்தை நிரூபிப்பதில்லை.',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}