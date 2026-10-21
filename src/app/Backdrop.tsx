import { useEffect, useRef } from 'react';

/** Fondo vivo: red de nodos que se conectan. Ligero, sin librerías 3D. */
export default function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, x = c.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, dpr = 1;
    const N = 46;
    const pts = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00006, vy: (Math.random() - 0.5) * 0.00006, r: 0.8 + Math.random() * 1.6 }));
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = () => {
      const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ffb02e';
      x.clearRect(0, 0, w, h);
      for (const p of pts) { if (!reduce) { p.x = (p.x + p.vx * 16 + 1) % 1; p.y = (p.y + p.vy * 16 + 1) % 1; } }
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = pts[i], b = pts[j], dx = (a.x - b.x) * w, dy = (a.y - b.y) * h, d = Math.hypot(dx, dy);
        if (d < 150) { x.globalAlpha = (1 - d / 150) * 0.16; x.strokeStyle = '#9db0ff'; x.lineWidth = 1; x.beginPath(); x.moveTo(a.x * w, a.y * h); x.lineTo(b.x * w, b.y * h); x.stroke(); }
      }
      for (let i = 0; i < N; i++) { const p = pts[i]; x.globalAlpha = i % 7 === 0 ? 0.85 : 0.4; x.fillStyle = i % 7 === 0 ? acc : '#b9c6ff'; x.beginPath(); x.arc(p.x * w, p.y * h, p.r, 0, 7); x.fill(); }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(); }); ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="backdrop" aria-hidden="true" />;
}
