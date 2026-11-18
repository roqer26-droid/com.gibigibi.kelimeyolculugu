import React, { useEffect, useRef, useState } from 'react';
import gibiBodyUrl from '../assets/gibi_body.png';

// gibigibi Games şirket introsu (Son Kule ile aynı): noktasız yazı görseli + üzerine kodla çizilen
// noktalar, "Games" altındaki çizgi ve parıltısı. Her şey 512 x 512 referans hücrede, tek dönüşümle çizilir.
const GIBI = {
  dots: {
    up: { x: 176.6, y: 153.4, r: 9 },
    bi: { x: 392.6, y: 188.05, r: 15.3 },
    low: { x: 174.8, y: 274, r: 9 },
  },
  fallFrom: 63.4,
  hopBi: 48,
  hopLow: 24,
  fall: [0, 0.8] as const,
  bi1: [0.8, 1.6] as const,
  low: [1.6, 2.4] as const,
  bi2: [2.4, 3.2] as const,
  sweep: [3.2, 3.7] as const,
  glowEnd: 4.5,
  line: { x0: 181, x1: 432, y: 447, w: 1.5 },
};
const INTRO_DURATION = 5.0; // sn; ardından 0.5 sn'lik geçişle menüye
const FADE_MS = 500;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const hop = (t: number, w: readonly [number, number], h: number) => {
  const u = (t - w[0] - 0.03) / (w[1] - w[0] - 0.06);
  return u > 0 && u < 1 ? h * 4 * u * (1 - u) : 0;
};

function drawSplash(cv: HTMLCanvasElement, img: HTMLImageElement | null, t: number) {
  const css = cv.clientWidth;
  if (!css) return;
  const px = Math.round(css * Math.min(3, window.devicePixelRatio || 1));
  if (cv.width !== px) {
    cv.width = px;
    cv.height = px;
  }
  const c = cv.getContext('2d');
  if (!c) return;
  const k = px / 512;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, px, px);
  c.setTransform(k, 0, 0, k, 0, 0);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  if (img) c.drawImage(img, 0, 0, 512, 512);
  c.fillStyle = '#fff';
  const d = GIBI.dots;
  const dot = (o: { x: number; y: number; r: number }, dy: number) => {
    c.beginPath();
    c.arc(o.x, o.y + dy, o.r, 0, Math.PI * 2);
    c.fill();
  };
  const uf = clamp(t / GIBI.fall[1], 0, 1);
  dot(d.up, -(1 - uf * uf) * (d.up.y - GIBI.fallFrom)); // yukarıdan düşüp yerine oturur
  dot(d.bi, -(hop(t, GIBI.bi1, GIBI.hopBi) + hop(t, GIBI.bi2, GIBI.hopBi)));
  dot(d.low, -hop(t, GIBI.low, GIBI.hopLow));
  const L = GIBI.line;
  const us = clamp((t - GIBI.sweep[0]) / (GIBI.sweep[1] - GIBI.sweep[0]), 0, 1);
  if (us > 0) {
    const hx = L.x0 + (L.x1 - L.x0) * us;
    c.fillRect(L.x0, L.y - L.w / 2, hx - L.x0, L.w); // "Games" altındaki ince çizgi, soldan sağa
    const g =
      t >= GIBI.sweep[1]
        ? 1 - clamp((t - GIBI.sweep[1]) / (GIBI.glowEnd - GIBI.sweep[1]), 0, 1)
        : 1;
    const ge = g * g * (3 - 2 * g);
    if (ge > 0.003) {
      const gr = c.createRadialGradient(hx, L.y, 0, hx, L.y, 9);
      gr.addColorStop(0, `rgba(255,255,255,${(0.95 * ge).toFixed(3)})`);
      gr.addColorStop(0.35, `rgba(255,255,255,${(0.4 * ge).toFixed(3)})`);
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr;
      c.fillRect(hx - 10, L.y - 10, 20, 20);
    }
  }
}

interface IntroSplashProps {
  onDone: () => void;
}

export function IntroSplash({ onDone }: IntroSplashProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let img: HTMLImageElement | null = null;
    let ready = false;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let finished = false;
    let fadeTimer = 0;

    const im = new Image();
    im.onload = () => {
      img = im;
      ready = true;
      if (t < 0.5) t = 0; // saat yazıyla başlar
    };
    im.onerror = () => {
      ready = true;
    };
    im.src = gibiBodyUrl;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (document.hidden || !ready) return;
      t += dt;
      drawSplash(cv, img, reduce ? 9 : Math.min(t, INTRO_DURATION));
      if (t >= INTRO_DURATION && !finished) {
        finished = true;
        setFading(true);
        fadeTimer = window.setTimeout(() => doneRef.current(), FADE_MS);
      }
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => drawSplash(cv, img, reduce ? 9 : Math.min(t, INTRO_DURATION));
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      aria-label="gibigibi Games"
      className="fixed inset-0 z-[100] grid place-items-center bg-black transition-opacity duration-500 ease-out"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'auto' }}
    >
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="pointer-events-none block select-none"
        style={{ width: 'min(94vw, 94dvh, 560px)', aspectRatio: '1 / 1', height: 'auto' }}
      />
    </div>
  );
}
