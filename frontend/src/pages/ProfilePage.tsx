import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useUser } from '../UserContext';

const PLAN_META: Record<string, { color: string; icon: string; gradient: string }> = {
  free:      { color: '#8899aa', icon: '◇', gradient: 'linear-gradient(135deg,#1a2a1a,#0c1a11)' },
  quarterly: { color: '#E8C547', icon: '◆', gradient: 'linear-gradient(135deg,#2a1f00,#1a1400)' },
  annual:    { color: '#3DBFA0', icon: '★', gradient: 'linear-gradient(135deg,#002a22,#001a15)' },
};

export default function ProfilePage() {
  const { t, lang } = useLang();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const p = t.profile;
  const isRtl = lang === 'ar';

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-box" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <p style={{ color: 'var(--chalk-dim)', marginBottom: 20 }}>
            {lang === 'fr' ? 'Connectez-vous pour voir votre profil.' : 'سجّل الدخول لعرض ملفك الشخصي.'}
          </p>
          <Link to="/login">
            <button className="btn-p">{t.nav.login}</button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const meta = PLAN_META[user.plan] ?? PLAN_META.free;

  return (
    <div className="profile-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="profile-wrap">

        {/* ── Left column: identity card ── */}
        <div className="profile-card profile-identity">

          {/* Avatar */}
          <div className="profile-avatar-ring">
            <div className="profile-avatar" style={{ background: meta.gradient, color: meta.color, borderColor: meta.color + '66' }}>
              {initials}
            </div>
            <div className="profile-avatar-badge" style={{ background: meta.color }}>
              {meta.icon}
            </div>
          </div>

          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email-tag">{user.email}</p>

          {/* Plan pill */}
          <div className="profile-plan-pill" style={{ background: meta.color + '18', color: meta.color, border: `1px solid ${meta.color}44` }}>
            {meta.icon} {p.plans[user.plan]}
          </div>

          <hr className="pdiv" style={{ margin: '24px 0' }} />

          {/* Quick info */}
          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-info-icon">📧</span>
              <div>
                <span className="profile-info-label">{lang === 'fr' ? 'Email' : 'البريد الإلكتروني'}</span>
                <span className="profile-info-val">{user.email}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-icon">🎓</span>
              <div>
                <span className="profile-info-label">{p.planLabel}</span>
                <span className="profile-info-val">{p.plans[user.plan]}</span>
              </div>
            </div>
            {user.plan === 'quarterly' && user.trimestre && (
              <div className="profile-info-row">
                <span className="profile-info-icon">📅</span>
                <div>
                  <span className="profile-info-label">{p.trimestreLabel}</span>
                  <span className="profile-info-val">{p.trimesters[user.trimestre] ?? user.trimestre}</span>
                </div>
              </div>
            )}
            <div className="profile-info-row">
              <span className="profile-info-icon">🔑</span>
              <div>
                <span className="profile-info-label">{p.accessLabel}</span>
                <span className="profile-info-val">{p.access[user.plan]}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              className="btn-ghost profile-btn"
              style={{ width: '100%', color: '#e05555', borderColor: '#e0555544' }}
              onClick={() => { logout(); navigate('/'); }}
            >
              {lang === 'fr' ? '⎋ Se déconnecter' : '⎋ تسجيل الخروج'}
            </button>
          </div>
        </div>

        {/* ── Right column: subscription detail ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* Subscription card */}
          <div className="profile-card">
            <h2 className="profile-section-title">{p.subscription}</h2>

            <div className="profile-sub-hero" style={{ background: meta.gradient, borderColor: meta.color + '33' }}>
              <div className="profile-sub-icon" style={{ color: meta.color }}>{meta.icon}</div>
              <div>
                <p className="profile-sub-plan" style={{ color: meta.color }}>{p.plans[user.plan]}</p>
                <p className="profile-sub-desc">{p.access[user.plan]}</p>
              </div>
            </div>

            <div className="profile-features">
              {user.plan === 'free' && [
                lang === 'fr' ? '✓ Cours gratuits accessibles' : '✓ الدروس المجانية متاحة',
                lang === 'fr' ? '✗ Cours premium verrouillés' : '✗ الدروس المدفوعة مقفلة',
                lang === 'fr' ? '✗ Accès à tous les trimestres' : '✗ الوصول لجميع الفصول',
              ].map(f => (
                <div key={f} className="profile-feature-row" style={{ color: f.startsWith('✗') ? 'var(--chalk-dim)' : 'var(--chalk)' }}>
                  {f}
                </div>
              ))}
              {user.plan === 'quarterly' && [
                lang === 'fr' ? '✓ Tous les cours du trimestre' : '✓ جميع دروس الفصل',
                lang === 'fr' ? '✓ Vidéos HD illimitées' : '✓ فيديوهات HD غير محدودة',
                lang === 'fr' ? '✓ PDFs téléchargeables' : '✓ ملفات PDF قابلة للتحميل',
                lang === 'fr' ? '✗ Accès à tous les trimestres' : '✗ الوصول لجميع الفصول',
              ].map(f => (
                <div key={f} className="profile-feature-row" style={{ color: f.startsWith('✗') ? 'var(--chalk-dim)' : 'var(--chalk)' }}>
                  {f}
                </div>
              ))}
              {user.plan === 'annual' && [
                lang === 'fr' ? '✓ Tous les cours, toute l\'année' : '✓ جميع الدروس طوال العام',
                lang === 'fr' ? '✓ Vidéos HD illimitées' : '✓ فيديوهات HD غير محدودة',
                lang === 'fr' ? '✓ PDFs téléchargeables' : '✓ ملفات PDF قابلة للتحميل',
                lang === 'fr' ? '✓ Accès prioritaire aux nouveautés' : '✓ وصول أولوي للمحتوى الجديد',
              ].map(f => (
                <div key={f} className="profile-feature-row">
                  {f}
                </div>
              ))}
            </div>

            {user.plan !== 'annual' && (
              <Link to="/#tarifs">
                <button className="btn-p" style={{ width: '100%', marginTop: 16 }}>
                  {p.upgrade} →
                </button>
              </Link>
            )}
          </div>

          {/* Stats card */}
          <div className="profile-card">
            <h2 className="profile-section-title">
              {lang === 'fr' ? 'Accès aux cours' : 'الوصول إلى الدروس'}
            </h2>
            <div className="profile-stats-grid">
              {[
                { icon: '📚', val: user.plan === 'free' ? lang === 'fr' ? 'Gratuits' : 'المجانية' : lang === 'fr' ? 'Tous' : 'الكل', label: lang === 'fr' ? 'Cours' : 'الدروس' },
                { icon: '🎬', val: user.plan === 'free' ? '—' : 'HD', label: lang === 'fr' ? 'Vidéos' : 'الفيديوهات' },
                { icon: '📄', val: user.plan === 'free' ? '—' : '✓', label: 'PDF' },
                { icon: '📆', val: user.plan === 'annual' ? lang === 'fr' ? '3/3' : '٣/٣' : user.plan === 'quarterly' ? '1/3' : '—', label: lang === 'fr' ? 'Trimestres' : 'الفصول' },
              ].map(s => (
                <div key={s.label} className="profile-stat-box">
                  <span className="profile-stat-icon">{s.icon}</span>
                  <span className="profile-stat-val">{s.val}</span>
                  <span className="profile-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
