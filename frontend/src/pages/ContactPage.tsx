import { useState } from 'react';
import { useLang } from '../LanguageContext';

export default function ContactPage() {
  const { t } = useLang();
  const c = t.contact;

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status,  setStatus]  = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('http://localhost:3000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch {
      setStatus('err');
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="wrap">
          <span className="badge-tag">{c.title}</span>
          <h1 className="contact-title">{c.title}</h1>
          <p className="contact-sub">{c.sub}</p>
        </div>
      </div>

      <div className="wrap contact-body">

        {/* ── Info cards ── */}
        <div className="contact-info">
          <div className="contact-info-card">
            <span className="contact-info-icon">✉️</span>
            <div>
              <p className="contact-info-label">{c.info.emailLabel}</p>
              <a href="mailto:contact@madrasti.dz" className="contact-info-value">contact@madrasti.dz</a>
            </div>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">📞</span>
            <div>
              <p className="contact-info-label">{c.info.phoneLabel}</p>
              <a href="tel:+213555123456" className="contact-info-value">+213 555 123 456</a>
            </div>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">📍</span>
            <div>
              <p className="contact-info-label">{c.info.addressLabel}</p>
              <p className="contact-info-value">{c.info.address}</p>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="contact-form-wrap">
          {status === 'ok' ? (
            <div className="contact-success">
              <div className="contact-success-icon">✓</div>
              <p>{c.success}</p>
              <button className="btn-o" onClick={() => setStatus('idle')} style={{ marginTop: 16 }}>
                {t.nav.home === 'Accueil' ? 'Nouveau message' : 'رسالة جديدة'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="frow">
                <div className="field">
                  <label>{c.name}</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Ahmed Benali"
                  />
                </div>
                <div className="field">
                  <label>{c.email}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="ahmed@email.com"
                  />
                </div>
              </div>

              <div className="field">
                <label>{c.subject}</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="">—</option>
                  {c.subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>{c.message}</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="..."
                  className="contact-textarea"
                />
              </div>

              {status === 'err' && (
                <p className="auth-error">{c.error}</p>
              )}

              <button
                className="btn-p contact-submit"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? c.sending : c.send}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
