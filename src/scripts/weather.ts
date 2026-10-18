type Kind = 'close' | 'far' | 'glow';
type Point = [number, number];

interface Drop {
  x: number;
  y: number;
  len: number;
  vy: number;
  vx: number;
}

const SVGNS = 'http://www.w3.org/2000/svg';

function byId(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} fehlt`);
  return el;
}

export function bootWeather(mode: 'always' | 'toggle') {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wetter = createWeather(reduced);

  window.addEventListener('resize', () => wetter.fit());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) wetter.pauseRain();
    else if (wetter.isRunning()) wetter.resumeRain();
  });
  wetter.fit();

  if (mode === 'always') {
    wetter.start();
    return;
  }

  const button = document.querySelector<HTMLButtonElement>('#wetter-schalter');
  if (!button) return;

  const apply = (on: boolean) => {
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.textContent = on ? 'Wetter: an' : 'Wetter: aus';
    if (on) wetter.start();
    else wetter.stop();
    try {
      localStorage.setItem('rumsbums-wetter', on ? 'an' : 'aus');
    } catch {
      /* privater Modus */
    }
  };

  let saved = false;
  try {
    saved = localStorage.getItem('rumsbums-wetter') === 'an';
  } catch {
    saved = false;
  }
  apply(saved);
  button.addEventListener('click', () => {
    apply(button.getAttribute('aria-pressed') !== 'true');
  });
}

function createWeather(reduced: boolean) {
  let running = false;
  let rainOn = false;
  let rainRaf = 0;
  let nextTimer = 0;
  let rainCtx: CanvasRenderingContext2D | null = null;
  let viewW = 0;
  let viewH = 0;
  const drops: Drop[] = [];
  const pending: number[] = [];

  function later(fn: () => void, ms: number) {
    pending.push(window.setTimeout(fn, ms));
  }

  function clearPending() {
    for (const id of pending) window.clearTimeout(id);
    pending.length = 0;
  }

  function clearBolts() {
    byId('bolts').querySelectorAll('path').forEach((path) => path.remove());
  }

  function resetFx() {
    clearPending();
    const flash = byId('flash');
    const glow = byId('glow');
    flash.style.transition = 'none';
    glow.style.transition = 'none';
    flash.style.opacity = '0';
    glow.style.opacity = '0';
    const bolts = byId('bolts');
    bolts.style.opacity = '0';
    clearBolts();
  }

  function addPath(pts: Point[], width: number, color: string, opacity: number, glow: boolean) {
    const d = pts
      .map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(1)} ${point[1].toFixed(1)}`)
      .join(' ');
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', String(width));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('opacity', String(opacity));
    if (glow) path.setAttribute('filter', 'url(#boltglow)');
    byId('bolts').appendChild(path);
  }

  function jagged(x: number, yMax: number) {
    const pts: Point[] = [[x, 0]];
    let cx = x;
    let cy = 0;
    let n = 0;
    while (cy < yMax && n < 40) {
      n += 1;
      cx += (Math.random() - 0.5) * 70;
      cy += 18 + Math.random() * 32;
      cx = Math.max(10, Math.min(viewW - 10, cx));
      if (cy > yMax) cy = yMax;
      pts.push([cx, cy]);
    }
    return pts;
  }

  function paint(pts: Point[], width: number) {
    addPath(pts, width * 4, '#b9dcff', 0.5, true);
    addPath(pts, width, '#fff', 1, false);
  }

  function drawBolt(reach: number, width: number) {
    const main = jagged(viewW * (0.12 + Math.random() * 0.76), viewH * reach);
    paint(main, width);
    for (let i = 2; i < main.length - 1; i++) {
      if (Math.random() >= 0.25) continue;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const branch: Point[] = [main[i]];
      let bx = main[i][0];
      let by = main[i][1];
      const steps = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < steps; s++) {
        bx += dir * (14 + Math.random() * 26);
        by += 12 + Math.random() * 20;
        branch.push([bx, by]);
      }
      paint(branch, width * 0.5);
    }
  }

  function flash(peak: number) {
    if (reduced) return;
    const el = byId('flash');
    el.style.transition = 'none';
    el.style.opacity = String(peak);
    later(() => {
      el.style.transition = 'opacity 40ms linear';
      el.style.opacity = String(peak * 0.12);
    }, 50);
    later(() => {
      el.style.transition = 'none';
      el.style.opacity = String(peak * 0.45);
    }, 100);
    later(() => {
      el.style.transition = 'opacity 220ms ease-out';
      el.style.opacity = '0';
    }, 150);
  }

  function pulseGlow(level: number) {
    if (reduced) return;
    const el = byId('glow');
    el.style.transition = 'none';
    el.style.opacity = String(level);
    later(() => {
      el.style.transition = 'opacity 480ms ease-out';
      el.style.opacity = '0';
    }, 80);
  }

  function strike(kind: Kind) {
    resetFx();
    const svg = byId('bolts');
    svg.style.opacity = '1';
    if (kind === 'close') {
      drawBolt(0.78 + Math.random() * 0.18, 2.3);
      if (Math.random() < 0.4) drawBolt(0.7 + Math.random() * 0.2, 1.6);
      flash(0.36);
      pulseGlow(0.75);
    } else if (kind === 'far') {
      drawBolt(0.32 + Math.random() * 0.16, 1.3);
      flash(0.12);
      pulseGlow(0.4);
    } else {
      pulseGlow(0.85);
    }
    if (reduced) {
      later(() => {
        svg.style.opacity = '0';
        clearBolts();
      }, 400);
      return;
    }
    later(() => {
      svg.style.opacity = '0.15';
    }, 55);
    later(() => {
      svg.style.opacity = '1';
    }, 100);
    later(() => {
      svg.style.opacity = '0';
    }, 250);
    later(clearBolts, 480);
  }

  function schedule(delay: number) {
    window.clearTimeout(nextTimer);
    nextTimer = window.setTimeout(() => {
      const roll = Math.random();
      strike(roll < 0.5 ? 'close' : roll < 0.82 ? 'far' : 'glow');
      schedule(8000 + Math.random() * 9000);
    }, delay);
  }

  function fit() {
    const canvas = byId('rain') as HTMLCanvasElement;
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;
    rainCtx = canvas.getContext('2d');
    rainCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (drops.length === 0) {
      const count = Math.max(40, Math.min(110, Math.floor(viewW / 12)));
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * viewW,
          y: Math.random() * viewH,
          len: 12 + Math.random() * 16,
          vy: 8 + Math.random() * 10,
          vx: -0.6 - Math.random() * 0.8,
        });
      }
    }
  }

  function drawRain() {
    if (!rainOn || !rainCtx) return;
    rainCtx.clearRect(0, 0, viewW, viewH);
    rainCtx.strokeStyle = 'rgba(190, 210, 235, 0.45)';
    rainCtx.lineWidth = 1;
    rainCtx.beginPath();
    for (const drop of drops) {
      rainCtx.moveTo(drop.x, drop.y);
      rainCtx.lineTo(drop.x + drop.vx * 2, drop.y + drop.len);
      drop.x += drop.vx;
      drop.y += drop.vy;
      if (drop.y > viewH || drop.x < -30) {
        drop.x = Math.random() * viewW;
        drop.y = -20;
      }
    }
    rainCtx.stroke();
    rainRaf = requestAnimationFrame(drawRain);
  }

  function resumeRain() {
    if (reduced || rainOn || !running) return;
    rainOn = true;
    drawRain();
  }

  return {
    fit,
    isRunning: () => running,
    pauseRain() {
      rainOn = false;
      cancelAnimationFrame(rainRaf);
    },
    resumeRain,
    start() {
      if (running) return;
      running = true;
      resumeRain();
      schedule(1800);
    },
    stop() {
      running = false;
      window.clearTimeout(nextTimer);
      rainOn = false;
      cancelAnimationFrame(rainRaf);
      if (rainCtx) rainCtx.clearRect(0, 0, viewW, viewH);
      resetFx();
    },
  };
}
