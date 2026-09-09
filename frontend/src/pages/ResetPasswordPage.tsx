import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '../LanguageContext';

export default function ResetPasswordPage() {
  const { t } = useLang();
  const a = t.auth;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [status,    setStatus]    = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg,    setErrMsg]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrMsg(a.passwordMismatch); return; }
    if (!token) { setErrMsg(a.resetError); return; }

    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
    } catch {
      setErrMsg(a.resetError);
      setStatus('err');
    }
  }

  return (
    <div className="auth-card-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-card-logo">
          <Link to="/" className="logo" style={{ justifyContent: 'center' }}>
            <span className="logo-mark">م</span>
            <span>Madrasti</span>
          </Link>
        </div>

        {status === 'ok' ? (
          /* ── Success ── */
          <div style={{ textAlign: 'center' }}>
            <div className="auth-success-circle">✓</div>
            <h2 className="auth-card-title" style={{ textAlign: 'center' }}>{a.resetSuccess.split('!')[0]} !</h2>
            <p className="auth-card-sub" style={{ textAlign: 'center' }}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <button className="btn-p auth-submit" onClick={() => navigate('/login')}>
              {a.tabLogin}
            </button>
          </div>
        ) : !token ? (
          /* ── No token ── */
          <div style={{ textAlign: 'center' }}>
            <div className="auth-success-circle" style={{ background: 'rgba(226,96,79,.12)', color: 'var(--coral)' }}>✕</div>
            <h2 className="auth-card-title" style={{ textAlign: 'center' }}>Lien invalide</h2>
            <p className="auth-card-sub" style={{ textAlign: 'center' }}>{a.resetError}</p>
            <button className="auth-back" onClick={() => navigate('/forgot-password')}>
              {a.forgotTitle} →
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <h2 className="auth-card-title">{a.resetTitle}</h2>
            <p className="auth-card-sub">{a.resetSub}</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field field-pw">
                <label>{a.resetTitle === 'Nouveau mot de passe' ? 'Nouveau mot de passe' : a.password}</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? a.hidePassword : a.showPassword}
                </button>
              </div>

              <div className="field field-pw">
                <label>{a.confirmPassword}</label>
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowConf(v => !v)}>
                  {showConf ? a.hidePassword : a.showPassword}
                </button>
              </div>

              {errMsg && <p className="auth-error">{errMsg}</p>}

              <button
                className="btn-p auth-submit"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? a.resetLoading : a.resetBtn}
              </button>
            </form>

            <button className="auth-back" onClick={() => navigate('/login')}>
              {a.forgotBack}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
