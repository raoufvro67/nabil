import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useUser } from '../UserContext';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const { t, lang } = useLang();
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedPlan = (location.state as any)?.plan ?? 'free';

  const [tab, setTab] = useState<Tab>(preselectedPlan !== 'free' ? 'register' : 'login');
  const a = t.auth;

  /* Login form */
  const [lemail,    setLemail]    = useState('');
  const [lpassword, setLpassword] = useState('');
  const [showLpw,   setShowLpw]   = useState(false);
  const [lmsg,      setLmsg]      = useState('');
  const [lloading,  setLloading]  = useState(false);

  /* Register form */
  const [rname,      setRname]      = useState('');
  const [remail,     setRemail]     = useState('');
  const [rpassword,  setRpassword]  = useState('');
  const [rconfirm,   setRconfirm]   = useState('');
  const [showRpw,    setShowRpw]    = useState(false);
  const [rplan,      setRplan]      = useState(preselectedPlan);
  const [rtrimestre, setRtrimestre] = useState('T1');
  const [rmsg,       setRmsg]       = useState('');
  const [rloading,   setRloading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLloading(true); setLmsg('');
    try {
      const res = await fetch('http://localhost:3000/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lemail, password: lpassword }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur');
      const data = await res.json();
      login({ name: data.name, email: data.email, plan: data.plan, trimestre: data.trimestre, token: data.access_token });
      navigate('/');
    } catch (err: any) {
      setLmsg(err.message);
    } finally {
      setLloading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (rpassword !== rconfirm) { setRmsg(a.passwordMismatch); return; }
    setRloading(true); setRmsg('');
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rname, email: remail, password: rpassword,
          plan: rplan,
          trimestre: rplan === 'quarterly' ? rtrimestre : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur');
      const data = await res.json();
      login({ name: data.name, email: data.email, plan: data.plan, trimestre: data.trimestre, token: data.access_token });
      navigate('/');
    } catch (err: any) {
      setRmsg(err.message);
    } finally {
      setRloading(false);
    }
  }

  const features = lang === 'fr'
    ? ['+8 000 élèves actifs', '3 niveaux scolaires', 'Cours vidéo + PDF', 'Interface FR / عربي']
    : ['+8000 طالب نشط', '3 مستويات دراسية', 'فيديوهات + PDF', 'واجهة عربية وفرنسية'];

  return (
    <div className="auth-page">

      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <Link to="/" className="logo">
            <span className="logo-mark">م</span>
            <span>Madrasti</span>
          </Link>
        </div>
        <h2 className="auth-brand-title">
          {lang === 'fr'
            ? <>Votre succès au <span className="hl">Bac</span><br />commence ici</>
            : <>نجاحك في <span className="hl">الباك</span><br />يبدأ هنا</>
          }
        </h2>
        <p className="auth-brand-sub">
          {lang === 'fr'
            ? "Des cours filmés par de vrais enseignants, accessibles partout en Algérie."
            : "دروس مصورة من أساتذة متخصصين، في متناول كل طالب جزائري."
          }
        </p>
        <ul className="auth-brand-list">
          {features.map(f => (
            <li key={f}>
              <span className="auth-brand-check">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-box">
          {/* Mobile logo */}
          <div className="auth-box-logo">
            <Link to="/" className="logo" style={{ justifyContent: 'center' }}>
              <span className="logo-mark">م</span>
              <span>Madrasti</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' on' : ''}`} onClick={() => setTab('login')}>
              {a.tabLogin}
            </button>
            <button className={`auth-tab${tab === 'register' ? ' on' : ''}`} onClick={() => setTab('register')}>
              {a.tabRegister}
            </button>
          </div>

          {/* ── Login form ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="field">
                <label>{a.email}</label>
                <input
                  type="email"
                  value={lemail}
                  onChange={e => setLemail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ahmed@email.com"
                />
              </div>

              <div className="field field-pw">
                <label>{a.password}</label>
                <input
                  type={showLpw ? 'text' : 'password'}
                  value={lpassword}
                  onChange={e => setLpassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowLpw(v => !v)}>
                  {showLpw ? a.hidePassword : a.showPassword}
                </button>
              </div>

              <div className="auth-forgot">
                <button type="button" onClick={() => navigate('/forgot-password')}>
                  {a.forgotPassword}
                </button>
              </div>

              {lmsg && <p className="auth-error">{lmsg}</p>}

              <button className="btn-p auth-submit" type="submit" disabled={lloading}>
                {lloading ? a.loginLoading : a.loginBtn}
              </button>

              <p className="auth-switch">
                {a.noAccount}{' '}
                <button type="button" className="auth-link" onClick={() => setTab('register')}>
                  {a.tabRegister}
                </button>
              </p>
            </form>
          )}

          {/* ── Register form ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="field">
                <label>{a.name}</label>
                <input
                  value={rname}
                  onChange={e => setRname(e.target.value)}
                  required
                  placeholder="Ahmed Benali"
                />
              </div>
              <div className="field">
                <label>{a.email}</label>
                <input
                  type="email"
                  value={remail}
                  onChange={e => setRemail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ahmed@email.com"
                />
              </div>
              <div className="field field-pw">
                <label>{a.password}</label>
                <input
                  type={showRpw ? 'text' : 'password'}
                  value={rpassword}
                  onChange={e => setRpassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowRpw(v => !v)}>
                  {showRpw ? a.hidePassword : a.showPassword}
                </button>
              </div>
              <div className="field">
                <label>{a.confirmPassword}</label>
                <input
                  type="password"
                  value={rconfirm}
                  onChange={e => setRconfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="field">
                <label>{a.plan}</label>
                <select value={rplan} onChange={e => setRplan(e.target.value)}>
                  <option value="free">{a.planFree}</option>
                  <option value="quarterly">{a.planQuarterly}</option>
                  <option value="annual">{a.planAnnual}</option>
                </select>
              </div>
              {rplan === 'quarterly' && (
                <div className="field">
                  <label>{a.trimestre}</label>
                  <select value={rtrimestre} onChange={e => setRtrimestre(e.target.value)}>
                    {t.catalog.trimesters.map(tr => (
                      <option key={tr.id} value={tr.id}>{tr.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {rmsg && <p className="auth-error">{rmsg}</p>}
              <button className="btn-p auth-submit" type="submit" disabled={rloading}>
                {rloading ? a.registerLoading : a.registerBtn}
              </button>
              <p className="auth-switch">
                {a.hasAccount}{' '}
                <button type="button" className="auth-link" onClick={() => setTab('login')}>
                  {a.tabLogin}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
