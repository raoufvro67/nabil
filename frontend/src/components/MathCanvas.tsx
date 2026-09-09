import { useEffect, useRef } from 'react';

const SYMBOLS = ['∫', 'Σ', '√', 'π', '∂', '∞', 'Δ', 'α', 'β', 'θ', 'λ', '±', '∇', 'φ', 'ψ', 'ω', '∈', '∀', '≡', 'ℝ', 'γ', 'μ', 'σ', 'ε'];
const EQUATIONS = [
  'y = ax² + bx + c',
  'f(x) = sin(x)',
  'a² + b² = c²',
  'lim x→∞',
  '∫₀^π sin(x)dx = 2',
  'P(A∩B)',
  "f'(x) = lim Δx→0",
  'E = mc²',
  '∑ᵢ₌₁ⁿ i = n(n+1)/2',
  'cos²θ + sin²θ = 1',
];

export default function MathCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let t = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    // Floating symbols
    const syms = Array.from({ length: 26 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.07 - Math.random() * 0.13,
      sym: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      opacity: 0.12 + Math.random() * 0.18,
      size: 20 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.004,
      yellow: Math.random() > 0.68,
    }));

    // Floating mini-equations
    const eqs = Array.from({ length: 10 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      eq: EQUATIONS[Math.floor(Math.random() * EQUATIONS.length)],
      opacity: 0.06 + Math.random() * 0.08,
      vy: -0.04 - Math.random() * 0.06,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function drawCoordPlane(cx: number, cy: number, unit: number) {
      const axLen = unit * 3.2;
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const alpha = isDark ? 0.16 : 0.28;

      // Minor grid
      ctx.strokeStyle = `rgba(61,191,160,${alpha * 0.35})`;
      ctx.lineWidth = 0.5;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * unit, cy - axLen);
        ctx.lineTo(cx + i * unit, cy + axLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - axLen, cy + i * unit);
        ctx.lineTo(cx + axLen, cy + i * unit);
        ctx.stroke();
      }

      // Tick marks
      ctx.fillStyle = `rgba(61,191,160,${alpha})`;
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        ctx.fillRect(cx + i * unit - 0.5, cy - 4, 1, 8);
        ctx.fillRect(cx - 4, cy + i * unit - 0.5, 8, 1);
      }

      // Axes
      ctx.strokeStyle = `rgba(61,191,160,${alpha * 1.8})`;
      ctx.lineWidth = 1.5;
      // X
      ctx.beginPath();
      ctx.moveTo(cx - axLen - 6, cy);
      ctx.lineTo(cx + axLen + 6, cy);
      ctx.stroke();
      // Y
      ctx.beginPath();
      ctx.moveTo(cx, cy + axLen + 6);
      ctx.lineTo(cx, cy - axLen - 6);
      ctx.stroke();

      // Arrows
      ctx.fillStyle = `rgba(61,191,160,${alpha * 1.8})`;
      // X arrow
      ctx.beginPath();
      ctx.moveTo(cx + axLen + 12, cy);
      ctx.lineTo(cx + axLen + 4, cy - 5);
      ctx.lineTo(cx + axLen + 4, cy + 5);
      ctx.fill();
      // Y arrow
      ctx.beginPath();
      ctx.moveTo(cx, cy - axLen - 12);
      ctx.lineTo(cx - 5, cy - axLen - 4);
      ctx.lineTo(cx + 5, cy - axLen - 4);
      ctx.fill();

      // Labels
      ctx.font = `italic ${unit * 0.28}px Georgia, serif`;
      ctx.fillStyle = `rgba(61,191,160,${alpha * 1.5})`;
      ctx.fillText('x', cx + axLen + 16, cy + 5);
      ctx.fillText('y', cx + 8, cy - axLen - 14);

      // Parabola y = x² (animated)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(61,191,160,${alpha * 2.2})`;
      ctx.lineWidth = 1.8;
      for (let i = 0; i <= 80; i++) {
        const xv = -2.8 + (i / 80) * 5.6;
        const yv = xv * xv * 0.65 + Math.sin(t * 0.4) * 0.08;
        const px = cx + xv * unit;
        const py = cy - yv * unit;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Parabola label
      ctx.font = `italic ${unit * 0.22}px Georgia, serif`;
      ctx.fillStyle = `rgba(61,191,160,${alpha * 1.6})`;
      ctx.fillText('y = x²', cx + unit * 1.1, cy - unit * 1.9);

      // Origin label
      ctx.font = `${unit * 0.18}px Georgia, serif`;
      ctx.fillStyle = `rgba(61,191,160,${alpha})`;
      ctx.fillText('O', cx + 5, cy + unit * 0.24);
    }

    function getF() {
      return document.documentElement.getAttribute('data-theme') !== 'light' ? 1 : 2;
    }

    function drawSineSection(x0: number, y0: number, len: number) {
      const f = getF();
      ctx.strokeStyle = `rgba(232,197,71,${0.12 * f})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + len, y0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y0 - 50); ctx.lineTo(x0, y0 + 50); ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(232,197,71,${0.20 * f})`;
      ctx.lineWidth = 1.8;
      for (let i = 0; i <= 100; i++) {
        const xv = x0 + (i / 100) * len;
        const yv = y0 - Math.sin((i / 100) * 4 * Math.PI + t) * 36;
        i === 0 ? ctx.moveTo(xv, yv) : ctx.lineTo(xv, yv);
      }
      ctx.stroke();

      ctx.font = 'italic 13px Georgia, serif';
      ctx.fillStyle = `rgba(232,197,71,${0.14 * f})`;
      ctx.fillText('f(x) = sin(x)', x0 + 4, y0 - 56);
    }

    function drawPythagoras(x0: number, y0: number, size: number) {
      const f = getF();
      const a = size, b = size * 0.75;
      ctx.strokeStyle = `rgba(232,197,71,${0.14 * f})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x0,      y0);
      ctx.lineTo(x0 + a,  y0);
      ctx.lineTo(x0,      y0 - b);
      ctx.closePath();
      ctx.stroke();

      const rm = 13;
      ctx.strokeStyle = `rgba(232,197,71,${0.10 * f})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x0, y0 - rm, rm, rm);

      ctx.font = 'italic 13px Georgia, serif';
      ctx.fillStyle = `rgba(232,197,71,${0.14 * f})`;
      ctx.fillText('a', x0 + a / 2 - 4, y0 + 16);
      ctx.fillText('b', x0 - 16, y0 - b / 2);
      ctx.fillText('c', x0 + a / 2 + 8, y0 - b / 2);
      ctx.fillStyle = `rgba(232,197,71,${0.12 * f})`;
      ctx.font = '12px Georgia, serif';
      ctx.fillText('a² + b² = c²', x0 - 10, y0 + 32);
    }

    function drawCircleFormulas(cx: number, cy: number, r: number) {
      const f = getF();
      ctx.strokeStyle = `rgba(61,191,160,${0.10 * f})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Radius line (animated angle)
      const ang = t * 0.5;
      ctx.strokeStyle = 'rgba(232,197,71,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
      ctx.stroke();
      ctx.setLineDash([]);

      const fc = getF();
      ctx.fillStyle = `rgba(61,191,160,${0.18 * fc})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '12px Georgia, serif';
      ctx.fillStyle = `rgba(61,191,160,${0.13 * fc})`;
      ctx.fillText('C = 2πr', cx - r * 0.5, cy + r + 18);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.007;

      const w = canvas.width, h = canvas.height;
      const unit = Math.min(w, h) * 0.055;

      // Parallax from mouse
      const px = (mx / w - 0.5) * 16;
      const py = (my / h - 0.5) * 10;

      // === Coordinate plane — right side ===
      ctx.save();
      ctx.translate(px * 0.4, py * 0.4);
      drawCoordPlane(w * 0.76, h * 0.4, unit);
      ctx.restore();

      // === Sine curve — bottom left ===
      ctx.save();
      ctx.translate(px * 0.25, py * 0.25);
      drawSineSection(w * 0.04, h * 0.75, w * 0.25);
      ctx.restore();

      // === Pythagoras triangle — left center ===
      ctx.save();
      ctx.translate(px * 0.2, py * 0.3);
      drawPythagoras(w * 0.05, h * 0.48, unit * 2.2);
      ctx.restore();

      // === Circle — center-right ===
      ctx.save();
      ctx.translate(px * 0.3, py * 0.2);
      drawCircleFormulas(w * 0.88, h * 0.72, unit * 1.4);
      ctx.restore();

      // === Floating equations ===
      const themeFactor = getF();
      eqs.forEach(eq => {
        eq.y += eq.vy;
        if (eq.y < -30) { eq.y = h + 30; eq.x = Math.random() * w; }
        ctx.font = '13px "Courier New", monospace';
        ctx.fillStyle = `rgba(61,191,160,${eq.opacity * themeFactor})`;
        ctx.fillText(eq.eq, eq.x + px * 0.5, eq.y + py * 0.5);
      });

      // === Floating math symbols ===
      syms.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.rot += s.rotV;
        if (s.y < -80) { s.y = h + 80; s.x = Math.random() * w; }
        if (s.x < -80) s.x = w + 80;
        if (s.x > w + 80) s.x = -80;

        ctx.save();
        ctx.translate(s.x + px * 0.6, s.y + py * 0.6);
        ctx.rotate(s.rot);
        ctx.globalAlpha = Math.min(s.opacity * themeFactor, 0.55);
        ctx.font = `${s.size}px Georgia, 'Times New Roman', serif`;
        ctx.fillStyle = s.yellow ? (themeFactor > 1 ? '#8a6200' : '#E8C547') : (themeFactor > 1 ? '#0a7060' : '#3DBFA0');
        ctx.fillText(s.sym, 0, 0);
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}
