import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useUser } from '../UserContext';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const { t } = useLang();
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedPlan = (location.state as any)?.plan ?? 'free';

  const [tab, setTab] = useState<Tab>(preselectedPlan !== 'free' ? 'register' : 'login');

  /* Login form */
  const [lemail,    setLemail]    = useState('');
  const [lpassword, setLpassword] = useState('');
  const [lmsg,      setLmsg]      = useState('');
  const [lloading,  setLloading]  = useState(false);

  /* Register form */
  const [rname,      setRname]      = useState('');
  const [remail,     setRemail]     = useState('');
  const [rpassword,  setRpassword]  = useState('');
  const [rconfirm,   setRconfirm]   = useState('');
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
    if (rpassword !== rconfirm) { setRmsg(t.auth.passwordMismatch); return; }
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

  return (
    <div className="login-page">
      <div className="login-box">
        <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <span className="logo-mark">م</span>
          <span>Madrasti</span>
        </Link>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' on' : ''}`} onClick={() => setTab('login')}>
            {t.auth.tabLogin}
          </button>
          <button className={`auth-tab${tab === 'register' ? ' on' : ''}`} onClick={() => setTab('register')}>
            {t.auth.tabRegister}
          </button>
        </div>

        {/* ── Login form ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="field">
              <label>{t.auth.email}</label>
              <input type="email" value={lemail} onChange={e => setLemail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="field">
              <label>{t.auth.password}</label>
              <input type="password" value={lpassword} onChange={e => setLpassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {lmsg && <p className="auth-error">{lmsg}</p>}
            <button className="btn-p auth-submit" type="submit" disabled={lloading}>
              {lloading ? t.auth.loginLoading : t.auth.loginBtn}
            </button>
            <p className="auth-switch">
              {t.auth.noAccount}{' '}
              <button type="button" className="auth-link" onClick={() => setTab('register')}>
                {t.auth.tabRegister}
              </button>
            </p>
          </form>
        )}

        {/* ── Register form ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="field">
              <label>{t.auth.name}</label>
              <input value={rname} onChange={e => setRname(e.target.value)} required />
            </div>
            <div className="field">
              <label>{t.auth.email}</label>
              <input type="email" value={remail} onChange={e => setRemail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="field">
              <label>{t.auth.password}</label>
              <input type="password" value={rpassword} onChange={e => setRpassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="field">
              <label>{t.auth.confirmPassword}</label>
              <input type="password" value={rconfirm} onChange={e => setRconfirm(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="field">
              <label>{t.auth.plan}</label>
              <select value={rplan} onChange={e => setRplan(e.target.value)}>
                <option value="free">{t.auth.planFree}</option>
                <option value="quarterly">{t.auth.planQuarterly}</option>
                <option value="annual">{t.auth.planAnnual}</option>
              </select>
            </div>
            {rplan === 'quarterly' && (
              <div className="field">
                <label>{t.auth.trimestre}</label>
                <select value={rtrimestre} onChange={e => setRtrimestre(e.target.value)}>
                  {t.catalog.trimesters.map(tr => (
                    <option key={tr.id} value={tr.id}>{tr.label}</option>
                  ))}
                </select>
              </div>
            )}
            {rmsg && <p className="auth-error">{rmsg}</p>}
            <button className="btn-p auth-submit" type="submit" disabled={rloading}>
              {rloading ? t.auth.registerLoading : t.auth.registerBtn}
            </button>
            <p className="auth-switch">
              {t.auth.hasAccount}{' '}
              <button type="button" className="auth-link" onClick={() => setTab('login')}>
                {t.auth.tabLogin}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
