import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useUser } from '../UserContext';

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

const PALETTE = ['#3E6B57','#8A5A44','#B08D2E','#2E6B8A','#6B4A8A','#B0472E'];
const ICONS   = ['Σ','φ','∫','δ','π','∞'];
function accent(id: string) {
  const i = id.charCodeAt(id.length - 1) % PALETTE.length;
  return { bg: PALETTE[i], icon: ICONS[i] };
}

function canAccess(course: Course, user: ReturnType<typeof useUser>['user']) {
  if (course.type === 'free') return true;
  if (!user) return false;
  if (user.plan === 'annual') return true;
  if (user.plan === 'quarterly') return user.trimestre === (course.trimestre ?? 'T1');
  return false;
}

function CourseCard({ course }: { course: Course }) {
  const { t } = useLang();
  const { user } = useUser();
  const navigate = useNavigate();
  const { bg, icon } = accent(course.id);
  const locked = !canAccess(course, user);

  return (
    <article
      className={`card${locked ? ' card-locked' : ''}`}
      onClick={() => navigate(`/courses/${course.id}`, { state: { course } })}
    >
      <div className="ctop">
        <div className={`ribbon ${course.type}`}>
          {course.type === 'free' ? t.catalog.badgeFree : t.catalog.badgePremium}
        </div>
        {locked && <div className="lock-badge">🔒</div>}
        <div className="sicon" style={{ background: bg }}>{icon}</div>
      </div>
      <div className="cbody">
        <h3 className="ctitle">{course.title}</h3>
        <p className="cteach">{course.teacher || t.catalog.defaultTeacher}</p>
        <hr className="cdiv" />
        <div className="cactions">
          <span className="clink">{locked ? t.catalog.badgePremium : t.catalog.viewCourse} <span>→</span></span>
        </div>
      </div>
    </article>
  );
}

function TrimesterSection({ label, courses, empty }: { label: string; courses: Course[]; empty: string }) {
  return (
    <section className="trim-section">
      <div className="trim-section-header">
        <span className="trim-section-title">{label}</span>
        <span className="trim-section-count">{courses.length}</span>
      </div>
      {courses.length === 0 ? (
        <p className="trim-empty">{empty}</p>
      ) : (
        <div className="grid">{courses.map(c => <CourseCard key={c.id} course={c} />)}</div>
      )}
    </section>
  );
}

const FALLBACK: Course[] = [
  { id:'c1', title:'Les fonctions — notions de base',      level:'1as',  type:'free',    trimestre:'T1', teacher:'Prof. Nabil' },
  { id:'c2', title:'Mécanique — forces et mouvement',       level:'1as',  type:'premium', trimestre:'T1', teacher:'Prof. Nabil' },
  { id:'c3', title:'Grammaire arabe — la phrase nominale',  level:'1as',  type:'free',    trimestre:'T2', teacher:'Prof. Nabil' },
  { id:'c4', title:'Suites numériques et limites',          level:'2as',  type:'premium', trimestre:'T2', teacher:'Prof. Nabil' },
  { id:'c5', title:'La cellule et son fonctionnement',      level:'2as',  type:'free',    trimestre:'T1', teacher:'Prof. Nabil' },
  { id:'c6', title:'Introduction à la philosophie',         level:'2as',  type:'premium', trimestre:'T3', teacher:'Prof. Nabil' },
  { id:'c7', title:'Révision Bac — analyse de fonctions',   level:'term', type:'premium', trimestre:'T3', teacher:'Prof. Nabil' },
  { id:'c8', title:'Électricité — révision intensive Bac',  level:'term', type:'premium', trimestre:'T2', teacher:'Prof. Nabil' },
  { id:'c9', title:'Méthodologie de la dissertation',       level:'term', type:'free',    trimestre:'T1', teacher:'Prof. Nabil' },
];

export default function LevelPage() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { t } = useLang();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/courses`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data.filter((c: Course) => c.level === level));
        } else {
          setCourses(FALLBACK.filter(c => c.level === level));
        }
      })
      .catch(() => setCourses(FALLBACK.filter(c => c.level === level)))
      .finally(() => setLoading(false));
  }, [level]);

  const levelInfo = t.levels.find(l => l.id === level);
  if (!levelInfo) return null;

  const byTrim = (tr: string) => courses.filter(c => (c.trimestre ?? 'T1') === tr);

  return (
    <div className="level-page">
      {/* Header */}
      <div className="level-page-hero">
        <div className="wrap">
          <button className="back-btn" onClick={() => navigate(-1)}>{t.course.back}</button>
          <div className="level-page-title-row">
            <span className="level-num-big">{levelInfo.num}</span>
            <div>
              <h1 className="level-page-title">{levelInfo.label}</h1>
              <p className="level-page-sub">
                {loading ? '...' : `${courses.length} ${t.catalog.coursesUnit}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trimester sections */}
      <div className="wrap level-page-body">
        {loading ? (
          <p style={{ color: 'var(--chalk-dim)', padding: '40px 0' }}>{t.course.loading}</p>
        ) : (
          t.catalog.trimesters.map(tr => (
            <TrimesterSection
              key={tr.id}
              label={tr.label}
              courses={byTrim(tr.id)}
              empty={t.catalog.noCourses}
            />
          ))
        )}
      </div>
    </div>
  );
}
