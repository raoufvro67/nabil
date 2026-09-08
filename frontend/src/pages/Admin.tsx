import React, { useState, useEffect, useCallback } from 'react';

interface Course {
  id: string;
  title: string;
  level: string;
  type: string;
  trimestre: string;
}

const LEVEL_LABEL: Record<string, string> = {
  '1as': '1ère année', '2as': '2ème année', 'term': 'Terminale',
};

export default function Admin() {
  const [token, setToken]       = useState<string | null>(null);
  const [username, setUsername] = useState('nabil');
  const [password, setPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');

  const [title,     setTitle]     = useState('');
  const [level,     setLevel]     = useState('1as');
  const [type,      setType]      = useState('free');
  const [trimestre, setTrimestre] = useState('T1');
  const [videoUrl,  setVideoUrl]  = useState('');
  const [pdfUrl,    setPdfUrl]    = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile,   setPdfFile]   = useState<File | null>(null);
  const [message,   setMessage]   = useState('');

  const [courses,  setCourses]  = useState<Course[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const authHeader: Record<string, string> = token ? { Authorization: 'Bearer ' + token } : {};

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/courses');
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch {}
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  /* ── Login ── */
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginMsg('Connexion...');
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Identifiants incorrects');
      const js = await res.json();
      setToken(js.access_token);
      setLoginMsg('');
      setPassword('');
    } catch (err: any) {
      setLoginMsg(err.message);
    }
  }

  /* ── Upload ── */
  async function uploadFile(file: File, endpoint: string): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`http://localhost:3000/courses/upload/${endpoint}`, {
      method: 'POST', headers: authHeader, body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Upload échoué' }));
      throw new Error(err.message);
    }
    return (await res.json()).url;
  }

  /* ── Ajouter cours ── */
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Enregistrement...');
    try {
      let finalVideo = videoUrl;
      let finalPdf   = pdfUrl;
      if (videoFile) { setMessage('Upload vidéo...'); finalVideo = await uploadFile(videoFile, 'video'); }
      if (pdfFile)   { setMessage('Upload PDF...');   finalPdf   = await uploadFile(pdfFile,   'pdf');   }

      const res = await fetch('http://localhost:3000/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          title, teacher: 'Nabil', subject: 'math',
          level, type, trimestre,
          videoUrl: finalVideo, pdfUrl: finalPdf,
        }),
      });
      if (!res.ok) throw new Error('Non autorisé ou erreur serveur');
      const json = await res.json();
      setMessage('✓ Cours ajouté');
      setTitle(''); setVideoUrl(''); setPdfUrl(''); setVideoFile(null); setPdfFile(null);
      setCourses(prev => [json, ...prev]);
    } catch (err: any) {
      setMessage('Erreur : ' + err.message);
    }
  }

  /* ── Supprimer ── */
  async function deleteCourse(id: string, courseTitle: string) {
    if (!window.confirm(`Supprimer "${courseTitle}" ?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`http://localhost:3000/courses/${id}`, {
        method: 'DELETE', headers: authHeader,
      });
      if (!res.ok) throw new Error('Suppression échouée');
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Connexion */}
      {!token ? (
        <div className="cfcard">
          <h3 style={{ marginBottom: 4 }}>Connexion admin</h3>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '.86rem', marginBottom: 24 }}>
            Identifiez-vous pour gérer les cours.
          </p>
          <form onSubmit={login}>
            <div className="frow">
              <div className="field">
                <label>Nom d'utilisateur</label>
                <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
              </div>
              <div className="field">
                <label>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
            </div>
            <div className="fsub">
              <button className="btn-p" type="submit">Se connecter</button>
              {loginMsg && <span style={{ fontSize: '.85rem', color: 'var(--coral)' }}>{loginMsg}</span>}
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Statut */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(61,191,160,.08)', border: '1px solid rgba(61,191,160,.2)',
            borderRadius: 12, padding: '12px 18px',
          }}>
            <span style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '.9rem' }}>✓ Connecté en tant qu'admin</span>
            <button className="btn" onClick={() => { setToken(null); setMessage(''); }} style={{ padding: '6px 14px', fontSize: '.8rem' }}>
              Déconnexion
            </button>
          </div>

          {/* Formulaire */}
          <div className="cfcard">
            <h3>Ajouter un cours</h3>
            <form onSubmit={submit} style={{ marginTop: 20 }}>
              <div className="frow">
                <div className="field">
                  <label>Titre</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex. Les fonctions — notions de base" />
                </div>
                <div className="field">
                  <label>Professeur</label>
                  <input value="Nabil" readOnly />
                </div>
              </div>
              <div className="frow">
                <div className="field">
                  <label>Niveau</label>
                  <select value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="1as">1ère année</option>
                    <option value="2as">2ème année</option>
                    <option value="term">Terminale</option>
                  </select>
                </div>
                <div className="field">
                  <label>Trimestre</label>
                  <select value={trimestre} onChange={e => setTrimestre(e.target.value)}>
                    <option value="T1">1er Trimestre</option>
                    <option value="T2">2ème Trimestre</option>
                    <option value="T3">3ème Trimestre</option>
                  </select>
                </div>
                <div className="field">
                  <label>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="free">Gratuit</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>URL vidéo (optionnel)</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="field">
                <label>Ou uploader une vidéo (max 500 Mo)</label>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                {videoFile && <small>{videoFile.name} — {(videoFile.size / 1024 / 1024).toFixed(1)} Mo</small>}
              </div>
              <div className="field">
                <label>URL PDF (optionnel)</label>
                <input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="field">
                <label>Ou uploader un PDF (max 50 Mo)</label>
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                {pdfFile && <small>{pdfFile.name} — {(pdfFile.size / 1024 / 1024).toFixed(1)} Mo</small>}
              </div>
              <div className="fsub">
                <button className="btn-p" type="submit">Enregistrer</button>
                {message && (
                  <span style={{ fontSize: '.85rem', color: message.startsWith('✓') ? 'var(--teal)' : 'var(--chalk-dim)' }}>
                    {message}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Liste */}
          <div className="cfcard">
            <h3 style={{ marginBottom: 16 }}>Cours existants ({courses.length})</h3>
            {courses.length === 0 ? (
              <p style={{ color: 'var(--chalk-dim)', fontSize: '.88rem' }}>Aucun cours dans la base.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courses.map(c => (
                  <li key={c.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, background: 'var(--bg-3)', borderRadius: 10,
                    padding: '12px 16px', border: '1px solid var(--line)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '.9rem', display: 'block', marginBottom: 2 }}>{c.title}</span>
                      <span style={{ fontSize: '.76rem', color: 'var(--chalk-dim)' }}>
                        {LEVEL_LABEL[c.level] ?? c.level} · {c.trimestre ?? 'T1'} · {c.type === 'premium' ? 'Premium' : 'Gratuit'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCourse(c.id, c.title)}
                      disabled={deleting === c.id}
                      style={{
                        background: 'rgba(226,96,79,.08)', color: 'var(--coral)',
                        border: '1px solid rgba(226,96,79,.25)', borderRadius: 8,
                        padding: '6px 14px', fontSize: '.8rem', fontWeight: 700,
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {deleting === c.id ? '...' : 'Supprimer'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
