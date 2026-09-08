import { Link, Routes, Route, useNavigate, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Admin from './pages/Admin';
import CoursePage from './pages/CoursePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import LevelPage from './pages/LevelPage';
import ContactPage from './pages/ContactPage';
import { useLang } from './LanguageContext';
import { useUser } from './UserContext';

interface Course {
  id: string;
  title: string;
  level: string;
  type: string;
  trimestre?: string;
  teacher?: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
}

const FALLBACK: Course[] = [
  { id:'c1', title:'Les fonctions — notions de base',       level:'1as',  type:'free',    trimestre:'T1', teacher:'Prof. Nabil' },
  { id:'c2', title:'Mécanique — forces et mouvement',        level:'1as',  type:'premium', trimestre:'T1', teacher:'Prof. Nabil' },
  { id:'c3', title:'Grammaire arabe — la phrase nominale',   level:'1as',  type:'free',    trimestre:'T2', teacher:'Prof. Nabil' },
  { id:'c4', title:'Suites numériques et limites',           level:'2as',  type:'premium', trimestre:'T2', teacher:'Prof. Nabil' },
  { id:'c5', title:'La cellule et son fonctionnement',       level:'2as',  type:'free',    trimestre:'T1', teacher:'Prof. Nabil' },
  { id:'c6', title:'Introduction à la philosophie',          level:'2as',  type:'premium', trimestre:'T3', teacher:'Prof. Nabil' },
  { id:'c7', title:'Révision Bac — analyse de fonctions',    level:'term', type:'premium', trimestre:'T3', teacher:'Prof. Nabil' },
  { id:'c8', title:'Électricité — révision intensive Bac',   level:'term', type:'premium', trimestre:'T2', teacher:'Prof. Nabil' },
  { id:'c9', title:'Méthodologie de la dissertation',        level:'term', type:'free',    trimestre:'T1', teacher:'Prof. Nabil' },
];

/* ── Header ── */
function Header() {
  const { lang, setLang, t } = useLang();
  const { user, logout } = useUser();
  return (
    <header className="topbar">
      <div className="wrap header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">م</span>
          <span>Madrasti</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>{t.nav.home}</NavLink>
          <NavLink to="/contact">{t.nav.contact}</NavLink>
          <NavLink to="/admin">{t.nav.admin}</NavLink>
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-lang" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}>
            {lang === 'fr' ? 'عربي' : 'FR'}
          </button>
          {user ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <button className="btn-login" style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}>
                  {user.name.split(' ')[0]}
                </button>
              </Link>
              <button className="btn-login" onClick={logout}>{lang === 'fr' ? 'Déco.' : 'خروج'}</button>
            </div>
          ) : (
            <Link to="/login"><button className="btn-login">{t.nav.login}</button></Link>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Hero ── */
function HeroSection() {
  const { t } = useLang();
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="wrap">
        <div className="eyebrow">{t.hero.eyebrow}</div>
        <h1 className="htitle">
          {t.hero.titlePre} <span className="hl">{t.hero.titleHL}</span><br />{t.hero.titlePost}
        </h1>
        <p className="hsub">{t.hero.sub}</p>
        <div className="hctas">
          <a href="#catalogue" className="btn-p">{t.hero.ctaFree}</a>
          <a href="#tarifs"    className="btn-g">{t.hero.ctaPremium}</a>
        </div>
        <div className="sbar">
          {t.hero.stats.map(s => (
            <div className="stat" key={s.label}>
              <span className="snum">{s.num}</span>
              <span className="slbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Promo video ── */
function PromoVideo() {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);
  const PROMO_SRC = '';
  return (
    <section className="promo-section">
      <div className="wrap">
        <p className="promo-label">{t.promo.label}</p>
        <h2 className="promo-title">{t.promo.title}</h2>
        <div className="video-wrap">
          {playing && PROMO_SRC ? (
            <video controls autoPlay><source src={PROMO_SRC} type="video/mp4" /></video>
          ) : (
            <div className="video-placeholder">
              <button className="play-btn" onClick={() => setPlaying(true)}>▶</button>
              <p>{t.promo.placeholder}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Catalogue (level cards on home) ── */
function CatalogSection({ courses }: { courses: Course[] }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const countFor = (id: string) => courses.filter(c => c.level === id).length;

  const LEVEL_COLORS = ['#3E6B57', '#2E6B8A', '#6B4A8A'];

  return (
    <section id="catalogue" className="lsec">
      <div className="wrap">
        <p className="slabel">{t.catalog.sectionLabel}</p>
        <div className="level-cards">
          {t.levels.map((l, i) => (
            <div
              key={l.id}
              className="level-card"
              style={{ '--lc': LEVEL_COLORS[i] } as React.CSSProperties}
              onClick={() => navigate(`/niveau/${l.id}`)}
            >
              <span className="level-card-num">{l.num}</span>
              <div className="level-card-body">
                <h3 className="level-card-title">{l.label}</h3>
                <p className="level-card-count">{countFor(l.id)} {t.catalog.coursesUnit}</p>
                <p className="level-card-sub">
                  {t.catalog.trimesters.map(tr => tr.label).join(' · ')}
                </p>
              </div>
              <span className="level-card-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
function PricingSection() {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <section id="tarifs" className="pricing">
      <div className="wrap">
        <div className="sh">
          <span className="badge-tag">{t.pricing.badge}</span>
          <h2>{t.pricing.title}</h2>
          <p>{t.pricing.sub}</p>
        </div>
        <div className="pgrid pgrid-3">
          {t.pricing.plans.map(plan => (
            <div key={plan.key} className={`plan${plan.highlight ? ' hi' : ''}`}>
              {plan.highlight && <div className="pbadge">{t.pricing.recommended}</div>}
              <p className="pname">{plan.name}</p>
              <p className="pprice"><span dir="ltr">{plan.price}</span> <small>{plan.period}</small></p>
              <p className="pdesc">{plan.desc}</p>
              <hr className="pdiv" />
              <ul>
                {plan.features.map(f => (
                  <li key={f}><span className="ck">✓</span><span>{f}</span></li>
                ))}
              </ul>
              <button
                className={plan.highlight ? 'btn-p' : 'btn-o'}
                style={{ width: '100%' }}
                onClick={() => navigate('/login', { state: { plan: plan.key } })}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div className="fbrand">
            <Link to="/" className="logo">
              <span className="logo-mark">م</span>
              <span>Madrasti</span>
            </Link>
            <p>{t.footer.tagline}</p>
          </div>
          <div className="fcol">
            <h4>{t.footer.platform}</h4>
            <ul>
              <li><Link to="/">{t.footer.links.home}</Link></li>
              <li><a href="#catalogue">{t.footer.links.courses}</a></li>
              <li><a href="#tarifs">{t.footer.links.pricing}</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h4>{t.footer.contact}</h4>
            <ul>
              <li><Link to="/contact">{t.nav.contact}</Link></li>
              <li><a href="mailto:contact@madrasti.dz">contact@madrasti.dz</a></li>
              <li><a href="tel:+213555123456">+213 555 123 456</a></li>
              <li><a href="#">Alger, Algérie</a></li>
            </ul>
          </div>
        </div>
        <div className="fbot">
          <span>{t.footer.copyright}</span>
          <span>{t.footer.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}

/* ── Home ── */
function Home() {
  const [courses, setCourses] = useState<Course[]>(FALLBACK);
  useEffect(() => {
    fetch('http://localhost:3000/courses')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setCourses(data); })
      .catch(() => {});
  }, []);
  return (
    <>
      <HeroSection />
      <PromoVideo />
      <CatalogSection courses={courses} />
      <PricingSection />
      <Footer />
    </>
  );
}

/* ── Admin wrapper ── */
function AdminShell() {
  return (
    <div className="wrap">
      <div className="admin-hero">
        <span className="badge-tag">Admin</span>
        <h1>Gestion des cours</h1>
        <p>Ajoutez des cours avec vidéos et PDFs associés.</p>
      </div>
      <div className="admin-shell">
        <Admin />
        <div className="cfcard">
          <h4 style={{ fontWeight: 800, marginBottom: 12 }}>Conseils</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Uploadez une vidéo (max 500 Mo) ou collez une URL directe.',
              'Les PDFs sont visibles uniquement dans la page du cours.',
              "Les cours premium déclenchent une modal d'abonnement.",
            ].map(tip => (
              <li key={tip} style={{ fontSize: '.82rem', color: 'var(--chalk-dim)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--teal)', flexShrink: 0 }}>✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── App root ── */
export default function App() {
  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route path="/admin"       element={<AdminShell />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/profile"     element={<ProfilePage />} />
          <Route path="/niveau/:level" element={<LevelPage />} />
          <Route path="/contact"       element={<ContactPage />} />
        </Routes>
      </main>
    </div>
  );
}
