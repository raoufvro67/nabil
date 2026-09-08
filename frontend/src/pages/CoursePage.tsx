import { useEffect, useState, Component, type ReactNode } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLang } from '../LanguageContext';
import { useUser } from '../UserContext';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Course {
  id: string;
  title: string;
  level: string;
  type: string;
  trimestre?: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
}

function canAccessCourse(course: Course, user: ReturnType<typeof useUser>['user']): boolean {
  if (course.type === 'free') return true;
  if (!user) return false;
  if (user.plan === 'annual') return true;
  if (user.plan === 'quarterly') return user.trimestre === (course.trimestre ?? 'T1');
  return false;
}

function blockSave(e: React.MouseEvent | React.DragEvent) {
  e.preventDefault();
}

class PdfErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    return this.state.crashed ? this.props.fallback : this.props.children;
  }
}

function PdfViewer({ url }: { url: string }) {
  const { t } = useLang();
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    setLoadError(false);
    setPdfData(null);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
      .then(buf => { setPdfData(buf); setFetching(false); })
      .catch(() => { setLoadError(true); setFetching(false); });
  }, [url]);

  if (fetching) {
    return (
      <div className="empty-media">
        <span className="empty-icon">📄</span>
        <p style={{ fontSize: '.9rem' }}>{t.course.pdfLoading}</p>
      </div>
    );
  }

  if (loadError || !pdfData) {
    return (
      <div className="empty-media">
        <span className="empty-icon">⚠️</span>
        <p>{t.course.pdfError}</p>
      </div>
    );
  }

  return (
    <div className="pdf-wrapper" onContextMenu={blockSave}>
      <Document
        file={{ data: pdfData }}
        onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPage(1); }}
        onLoadError={() => setLoadError(true)}
        className="pdf-document"
      >
        <Page
          pageNumber={page}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="pdf-page"
          width={Math.min(window.innerWidth - 64, 860)}
        />
      </Document>
      {numPages > 1 && (
        <div className="pdf-nav">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>←</button>
          <span>{page} / {numPages}</span>
          <button onClick={() => setPage(p => Math.min(numPages, p + 1))} disabled={page >= numPages}>→</button>
        </div>
      )}
    </div>
  );
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useUser();

  const [course, setCourse] = useState<Course | null>(
    (location.state as { course?: Course })?.course ?? null
  );
  const [loading, setLoading] = useState(!course);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!course && id) {
      fetch(`http://localhost:3000/courses/detail/${id}`)
        .then(r => r.json())
        .then(data => { setCourse(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [id, course]);

  useEffect(() => {
    if (course && !canAccessCourse(course, user)) setShowPremiumModal(true);
  }, [course]);

  if (loading) {
    return <div className="course-page"><p style={{ color: 'var(--chalk-dim)' }}>{t.course.loading}</p></div>;
  }

  if (!course) {
    return (
      <div className="course-page">
        <button className="back-btn" onClick={() => navigate(-1)}>{t.course.back}</button>
        <p style={{ color: 'var(--chalk-dim)' }}>{t.course.notFound}</p>
      </div>
    );
  }

  const pdfFallback = (
    <div className="empty-media">
      <span className="empty-icon">⚠️</span>
      <p>{t.course.pdfError}</p>
    </div>
  );

  return (
    <div className="course-page">
      <button className="back-btn" onClick={() => navigate(-1)}>{t.course.back}</button>

      <div className="course-header">
        <span className={`badge-type ${course.type}`}>
          {course.type === 'free' ? t.course.badgeFree : t.course.badgePremium}
        </span>
        <h1>{course.title}</h1>
        <p className="course-meta">{t.course.level} {course.level}</p>
      </div>

      {canAccessCourse(course, user) && (
        <div className="course-content">

          {/* ── Vidéo ── */}
          {course.videoUrl ? (
            <div className="video-section">
              <h2>{t.course.videoTitle}</h2>
              <video
                className="video-player"
                src={course.videoUrl}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={blockSave}
                onDragStart={blockSave}
              />
            </div>
          ) : (
            <div className="empty-media">
              <span className="empty-icon">🎬</span>
              <p>{t.course.noVideo}</p>
            </div>
          )}

          {/* ── PDF ── */}
          {course.pdfUrl ? (
            <div className="pdf-section">
              <h2>{t.course.pdfTitle}</h2>
              <PdfErrorBoundary fallback={pdfFallback}>
                <PdfViewer url={course.pdfUrl} />
              </PdfErrorBoundary>
            </div>
          ) : (
            <div className="empty-media">
              <span className="empty-icon">📄</span>
              <p>{t.course.noPdf}</p>
            </div>
          )}

        </div>
      )}

      {/* ── Modal premium ── */}
      {showPremiumModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⭐</div>
            <h2>{t.course.modal.title}</h2>
            <p>
              {t.course.modal.body1}<br />
              {t.course.modal.body2}
            </p>
            <div className="modal-actions">
              <button className="btn-premium" onClick={() => navigate('/login', { state: { plan: 'quarterly' } })}>
                {t.course.modal.cta}
              </button>
              <button className="btn-ghost" onClick={() => { setShowPremiumModal(false); navigate(-1); }}>
                {t.course.modal.back}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
