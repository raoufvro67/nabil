import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const a = t.auth;
  const navigate = useNavigate();

  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
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
          /* ── Success state ── */
          <div style={{ textAlign: 'center' }}>
            <div className="auth-success-circle">✓</div>
            <h2 className="auth-card-title" style={{ textAlign: 'center' }}>Email envoyé !</h2>
            <p className="auth-card-sub" style={{ textAlign: 'center' }}>{a.forgotSuccess}</p>
            <button className="auth-back" onClick={() => navigate('/login')}>
              {a.forgotBack}
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <h2 className="auth-card-title">{a.forgotTitle}</h2>
            <p className="auth-card-sub">{a.forgotSub}</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field">
                <label>{a.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ahmed@email.com"
                />
              </div>

              {errMsg && <p className="auth-error">{errMsg}</p>}

              <button
                className="btn-p auth-submit"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? a.forgotLoading : a.forgotBtn}
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
