import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useUser } from '../UserContext';

const PLAN_COLOR: Record<string, string> = {
  free:      'var(--chalk-dim)',
  quarterly: 'var(--yellow)',
  annual:    'var(--teal)',
};

export default function ProfilePage() {
  const { t } = useLang();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const p = t.profile;

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-box">
          <p style={{ color: 'var(--chalk-dim)', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--teal)' }}>{t.nav.login}</Link>
          </p>
        </div>
      </div>
    );
  }

  const initials = user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-box">

        {/* Avatar + name */}
        <div className="profile-avatar-row">
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="profile-hello">{p.hello}, <strong>{user.name}</strong></p>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <hr className="pdiv" style={{ margin: '24px 0' }} />

        {/* Subscription card */}
        <h2 className="profile-section-title">{p.subscription}</h2>

        <div className="profile-plan-card">
          <div className="profile-plan-badge" style={{ background: PLAN_COLOR[user.plan] + '22', color: PLAN_COLOR[user.plan], borderColor: PLAN_COLOR[user.plan] + '55' }}>
            {p.plans[user.plan]}
          </div>

          <div className="profile-plan-rows">
            <div className="profile-plan-row">
              <span className="profile-plan-label">{p.planLabel}</span>
              <span className="profile-plan-value">{p.plans[user.plan]}</span>
            </div>

            {user.plan === 'quarterly' && user.trimestre && (
              <div className="profile-plan-row">
                <span className="profile-plan-label">{p.trimestreLabel}</span>
                <span className="profile-plan-value">{p.trimesters[user.trimestre] ?? user.trimestre}</span>
              </div>
            )}

            <div className="profile-plan-row">
              <span className="profile-plan-label">{p.accessLabel}</span>
              <span className="profile-plan-value">{p.access[user.plan]}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <Link to="/#tarifs">
            <button className="btn-o profile-btn">{p.upgrade}</button>
          </Link>
          <button
            className="btn-ghost profile-btn"
            onClick={() => { logout(); navigate('/'); }}
          >
            {p.logout}
          </button>
        </div>

      </div>
    </div>
  );
}
