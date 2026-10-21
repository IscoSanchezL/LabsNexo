import type { Action } from './ast';
import type { ActResult } from './exec';
import { DX, DY, MazeWorld, parseMaze, type MazeInfo, type MazeSpec } from './maze';
import { SIZE, TurtleWorld, type Segment } from './turtle';
import { sfx } from '../app/audio';

// ───────────────────────── Temas visuales por mundo ─────────────────────────
export type StageTheme = {
  name: string; bg: [string, string]; top: [string, string]; side: string;
  accent: string; rock: [string, string]; deco: 'sparkle' | 'leaf' | 'circuit' | 'rivet' | 'dot' | 'crystal';
};
export const STAGE_THEMES: Record<number, StageTheme> = {
  1: { name: 'Cristal', bg: ['#3a1c33', '#150a1f'], top: ['#ffe3c0', '#f9b987'], side: '#b9693f', accent: '#ff7a59', rock: ['#8a4560', '#4f2339'], deco: 'sparkle' },
  2: { name: 'Bosque de luz', bg: ['#10321f', '#07150d'], top: ['#dff7b0', '#a3df76'], side: '#4f9a50', accent: '#ffe066', rock: ['#2f7a52', '#194632'], deco: 'leaf' },
  3: { name: 'Aurora', bg: ['#1e1f58', '#0b0b26'], top: ['#e0d4ff', '#ab8ff6'], side: '#6a4cc0', accent: '#5ef0d2', rock: ['#5352b5', '#2f2e78'], deco: 'dot' },
  4: { name: 'Circuito', bg: ['#0b2b4c', '#06121f'], top: ['#c4e9ff', '#80c7f6'], side: '#3b86c4', accent: '#7bffd3', rock: ['#2a669a', '#163a5c'], deco: 'circuit' },
  5: { name: 'Cobre', bg: ['#35200f', '#160b05'], top: ['#f8cd9c', '#dc9560'], side: '#9a5a32', accent: '#ffd166', rock: ['#76472a', '#442811'], deco: 'rivet' },
  6: { name: 'Nébula', bg: ['#34104a', '#10051b'], top: ['#ffcae6', '#f08fbf'], side: '#b04a86', accent: '#ffd86b', rock: ['#85327f', '#4a184d'], deco: 'crystal' },
};
export const themeFor = (grade: number) => STAGE_THEMES[grade] ?? STAGE_THEMES[3];

// ───────────────────────── Utilidades de dibujo ─────────────────────────
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rad, y);
  c.arcTo(x + w, y, x + w, y + h, rad); c.arcTo(x + w, y + h, x, y + h, rad);
  c.arcTo(x, y + h, x, y, rad); c.arcTo(x, y, x + w, y, rad);
  c.closePath();
}
const hash = (x: number, y: number, s = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; shape: 'dot' | 'rect' | 'star' };

abstract class BaseStage {
  protected ctx: CanvasRenderingContext2D;
  protected raf = 0;
  protected token = 0;
  protected particles: Particle[] = [];
  protected last = 0;
  speed = 1;
  protected W = 0; protected H = 0; protected dpr = 1;
  protected obs: ResizeObserver;

  constructor(protected canvas: HTMLCanvasElement, protected theme: StageTheme) {
    this.ctx = canvas.getContext('2d')!;
    this.obs = new ResizeObserver(() => this.resize());
    this.obs.observe(canvas);
    this.resize();
    const loop = (t: number) => { this.frame(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(10, Math.round(r.width * this.dpr));
    this.H = Math.max(10, Math.round(r.height * this.dpr));
    if (this.canvas.width !== this.W) this.canvas.width = this.W;
    if (this.canvas.height !== this.H) this.canvas.height = this.H;
  }

  protected frame(t: number) {
    const dt = Math.min(50, t - (this.last || t)); this.last = t;
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.0006 * dt; }
    this.particles = this.particles.filter(p => p.life > 0);
    this.draw(t);
    this.drawParticles();
  }
  protected abstract draw(t: number): void;

  protected drawParticles() {
    const c = this.ctx;
    for (const p of this.particles) {
      const a = Math.max(0, Math.min(1, p.life / p.max));
      c.globalAlpha = a; c.fillStyle = p.color;
      if (p.shape === 'rect') { c.save(); c.translate(p.x, p.y); c.rotate(p.life * 0.01); c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6); c.restore(); }
      else if (p.shape === 'star') { this.star(p.x, p.y, p.size, 5); c.fill(); }
      else { c.beginPath(); c.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); c.fill(); }
    }
    c.globalAlpha = 1;
  }

  protected star(cx: number, cy: number, r: number, n: number) {
    const c = this.ctx; c.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45, a = -Math.PI / 2 + (i * Math.PI) / n;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath();
  }

  burst(x: number, y: number, n: number, colors: string[], power = 0.35, shape: Particle['shape'] = 'rect') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = power * (0.3 + Math.random());
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.9, life: 900 + Math.random() * 700, max: 1500, color: colors[i % colors.length], size: (6 + Math.random() * 8) * this.dpr, shape });
    }
  }

  /** Detiene las animaciones en curso. */
  cancel() { this.token++; }

  protected tween(ms: number, fn: (t: number) => void): Promise<void> {
    const my = this.token; const dur = Math.max(1, ms / this.speed);
    return new Promise(res => {
      const t0 = performance.now();
      const tick = (now: number) => {
        if (my !== this.token) { res(); return; }
        const k = Math.min(1, (now - t0) / dur);
        fn(k);
        if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
  }
  protected cancelled(my: number) { return my !== this.token; }

  destroy() { cancelAnimationFrame(this.raf); this.obs.disconnect(); }
}

// ───────────────────────── Escenario del laberinto ─────────────────────────
export class MazeStage extends BaseStage {
  info: MazeInfo;
  // estado visible
  rx = 0; ry = 0; ang = 0; lift = 0; squash = 1; shake = 0; flash: { x: number; y: number; a: number } | null = null;
  taken = new Set<string>();
  won = false; spin = 0;

  constructor(canvas: HTMLCanvasElement, spec: MazeSpec, theme: StageTheme) {
    super(canvas, theme);
    this.info = parseMaze(spec);
    this.reset();
  }

  reset() {
    this.cancel();
    const s = this.info.start;
    this.rx = s.x; this.ry = s.y; this.ang = (s.dir * Math.PI) / 2; this.lift = 0; this.squash = 1; this.shake = 0;
    this.flash = null; this.taken.clear(); this.won = false; this.spin = 0;
  }

  private layout() {
    const { w, h } = this.info;
    const ts = Math.min(this.W / (w + 1.4), this.H / (h + 1.5));
    return { ts, ox: (this.W - w * ts) / 2, oy: (this.H - h * ts) / 2 - ts * 0.04, lift: ts * 0.16 };
  }
  private px(x: number, y: number) { const L = this.layout(); return { x: L.ox + (x + 0.5) * L.ts, y: L.oy + (y + 0.5) * L.ts }; }

  /** Anima una acción ya aplicada al mundo. */
  async step(a: Action, res: ActResult, world: MazeWorld) {
    const my = this.token;
    if (a.kind === 'turn') {
      sfx('turn');
      const from = this.ang, to = from + (a.dir === 'R' ? 1 : -1) * (Math.PI / 2);
      await this.tween(260, k => { this.ang = from + (to - from) * ease(k); });
      this.ang = to;
      return;
    }
    if (a.kind !== 'move') return;
    if (!res.ok) { await this.bump(world); return; }
    sfx('move', world.x + world.y);
    const fx = this.rx, fy = this.ry;
    // la casilla destino es la posición actual del mundo
    await this.tween(380, k => {
      const e = ease(k);
      this.rx = fx + (world.x - fx) * e; this.ry = fy + (world.y - fy) * e;
      this.lift = Math.sin(k * Math.PI) * this.layout().ts * 0.09;
    });
    if (this.cancelled(my)) return;
    this.rx = world.x; this.ry = world.y; this.lift = 0;
    this.squash = 0.86; void this.tween(160, k => { this.squash = 0.86 + 0.14 * easeOut(k); });
    if (res.info?.star) {
      const p = this.px(world.x, world.y);
      this.taken.add(`${world.x},${world.y}`);
      sfx('star');
      this.burst(p.x, p.y, 16, [this.theme.accent, '#ffe066', '#ffffff'], 0.28, 'star');
    }
  }

  private async bump(world: MazeWorld) {
    sfx('bump');
    const my = this.token;
    const dx = DX[world.dir], dy = DY[world.dir];
    const fx = this.rx, fy = this.ry;
    await this.tween(150, k => { this.rx = fx + dx * 0.32 * easeOut(k); this.ry = fy + dy * 0.32 * easeOut(k); });
    if (this.cancelled(my)) return;
    this.flash = { x: fx + dx * 0.5, y: fy + dy * 0.5, a: 1 };
    const L = this.layout();
    this.burst(L.ox + (fx + 0.5 + dx * 0.5) * L.ts, L.oy + (fy + 0.5 + dy * 0.5) * L.ts, 9, ['#ff7a8a', '#ffd166'], 0.18, 'dot');
    await this.tween(260, k => {
      this.rx = fx + dx * 0.32 * (1 - easeOut(k)); this.ry = fy + dy * 0.32 * (1 - easeOut(k));
      this.shake = Math.sin(k * 26) * (1 - k) * 6 * this.dpr;
      if (this.flash) this.flash.a = 1 - k;
    });
    this.rx = fx; this.ry = fy; this.shake = 0; this.flash = null;
  }

  celebrate() {
    this.won = true; this.spin = 0;
    const p = this.px(this.rx, this.ry);
    this.burst(p.x, p.y, 70, [this.theme.accent, '#ffffff', '#ffd166', '#7bffd3', '#ff7ac6', '#4cc9f0'], 0.45, 'rect');
    void this.tween(1100, k => { this.spin = k; this.lift = Math.abs(Math.sin(k * Math.PI * 3)) * this.layout().ts * 0.18; });
    setTimeout(() => { this.lift = 0; }, 1200);
  }

  // ---- Dibujo ----
  protected draw(t: number) {
    const c = this.ctx, { W, H } = this, th = this.theme;
    const L = this.layout(), { ts, ox, oy, lift } = L;
    const bg = c.createRadialGradient(W * 0.5, H * 0.35, ts, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    bg.addColorStop(0, th.bg[0]); bg.addColorStop(1, th.bg[1]);
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // puntos de fondo
    c.fillStyle = 'rgba(255,255,255,.05)';
    for (let i = 0; i < 46; i++) { const x = hash(i, 1) * W, y = hash(i, 2) * H, r = (0.6 + hash(i, 3) * 1.6) * this.dpr; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }

    c.save();
    c.translate(this.shake, 0);
    const { w, h, floor } = this.info;
    const isFloor = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < w && floor[y][x];
    const nearFloor = (x: number, y: number) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (isFloor(x + i, y + j)) return true; return false; };

    for (let y = -1; y <= h; y++) {
      for (let x = -1; x <= w; x++) {
        const X = ox + x * ts, Y = oy + y * ts;
        if (isFloor(x, y)) this.tile(x, y, X, Y, ts, lift, t, isFloor(x, y + 1));
        else if (nearFloor(x, y) && hash(x, y, 9) > 0.38) this.rock(X, Y, ts, hash(x, y, 4), hash(x, y, 5));
      }
    }
    // meta y estrellas
    const g = this.info.goal, gp = this.px(g.x, g.y);
    this.goal(gp.x, gp.y - lift * 0.5, ts, t);
    for (const s of this.info.stars) {
      if (this.taken.has(`${s.x},${s.y}`)) continue;
      const p = this.px(s.x, s.y);
      this.starItem(p.x, p.y - lift * 0.5, ts, t, s.x + s.y);
    }
    // choque
    if (this.flash) {
      const p = this.px(this.flash.x - 0.5, this.flash.y - 0.5);
      c.globalAlpha = this.flash.a * 0.8;
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, ts * 0.6);
      rg.addColorStop(0, '#ff6b81'); rg.addColorStop(1, 'rgba(255,107,129,0)');
      c.fillStyle = rg; c.fillRect(p.x - ts, p.y - ts, ts * 2, ts * 2); c.globalAlpha = 1;
    }
    // robot
    const rp = this.px(this.rx, this.ry);
    this.robot(rp.x, rp.y - lift * 0.5, ts, t);
    c.restore();
  }

  private tile(x: number, y: number, X: number, Y: number, ts: number, lift: number, t: number, below: boolean) {
    const c = this.ctx, th = this.theme, g = ts * 0.035, r = ts * 0.2;
    // sombra
    c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, X + g, Y + g + lift + ts * 0.05, ts - 2 * g, ts - 2 * g, r); c.fill();
    // cara lateral
    c.fillStyle = th.side; rr(c, X + g, Y + g + lift * 0.9, ts - 2 * g, ts - 2 * g, r); c.fill();
    // cara superior
    const grad = c.createLinearGradient(X, Y, X, Y + ts);
    grad.addColorStop(0, th.top[0]); grad.addColorStop(1, th.top[1]);
    c.fillStyle = grad; rr(c, X + g, Y + g, ts - 2 * g, ts - 2 * g, r); c.fill();
    // brillo superior
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = Math.max(1, ts * 0.018);
    c.beginPath(); c.moveTo(X + g + r, Y + g + 1); c.lineTo(X + ts - g - r, Y + g + 1); c.stroke();
    // decoración
    this.deco(x, y, X, Y, ts, t);
    void below;
  }

  private deco(x: number, y: number, X: number, Y: number, ts: number, t: number) {
    const c = this.ctx, th = this.theme, h = hash(x, y, 1);
    c.save(); c.globalAlpha = 0.35; c.fillStyle = th.side; c.strokeStyle = th.side; c.lineWidth = ts * 0.025;
    const cx = X + ts / 2, cy = Y + ts / 2;
    switch (th.deco) {
      case 'sparkle': for (let i = 0; i < 2; i++) { const px = X + ts * (0.2 + hash(x, y, i + 3) * 0.6), py = Y + ts * (0.2 + hash(x, y, i + 7) * 0.6); c.beginPath(); c.arc(px, py, ts * 0.025, 0, 7); c.fill(); } break;
      case 'leaf': if (h > 0.45) { c.beginPath(); c.ellipse(X + ts * (0.25 + h * 0.5), Y + ts * 0.7, ts * 0.08, ts * 0.04, h * 3, 0, 7); c.fill(); } break;
      case 'circuit': c.beginPath(); c.moveTo(X + ts * 0.2, cy); c.lineTo(cx - ts * 0.08, cy); c.lineTo(cx + ts * 0.05, cy + ts * 0.16); c.lineTo(X + ts * 0.8, cy + ts * 0.16); c.stroke(); c.beginPath(); c.arc(X + ts * 0.2, cy, ts * 0.03, 0, 7); c.fill(); break;
      case 'rivet': for (const [a, b] of [[0.17, 0.17], [0.83, 0.17], [0.17, 0.83], [0.83, 0.83]]) { c.beginPath(); c.arc(X + ts * a, Y + ts * b, ts * 0.03, 0, 7); c.fill(); } break;
      case 'dot': c.globalAlpha = 0.25 + 0.15 * Math.sin(t * 0.002 + x + y); c.beginPath(); c.arc(cx + (h - 0.5) * ts * 0.4, cy + (hash(x, y, 2) - 0.5) * ts * 0.4, ts * 0.05, 0, 7); c.fill(); break;
      case 'crystal': if (h > 0.5) { c.beginPath(); c.moveTo(X + ts * 0.7, Y + ts * 0.78); c.lineTo(X + ts * 0.76, Y + ts * 0.62); c.lineTo(X + ts * 0.82, Y + ts * 0.78); c.closePath(); c.fill(); } break;
    }
    c.restore();
  }

  private rock(X: number, Y: number, ts: number, a: number, b: number) {
    const c = this.ctx, th = this.theme;
    const cx = X + ts * (0.3 + a * 0.4), cy = Y + ts * (0.45 + b * 0.25), r = ts * (0.18 + a * 0.12);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(cx + r * 0.2, cy + r * 0.7, r * 1.1, r * 0.4, 0, 0, 7); c.fill();
    const g = c.createLinearGradient(cx, cy - r, cx, cy + r);
    g.addColorStop(0, th.rock[0]); g.addColorStop(1, th.rock[1]);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(cx - r, cy + r * 0.5); c.lineTo(cx - r * 0.7, cy - r * 0.3); c.lineTo(cx - r * 0.1, cy - r * 0.95); c.lineTo(cx + r * 0.6, cy - r * 0.45); c.lineTo(cx + r, cy + r * 0.5);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.14)';
    c.beginPath(); c.moveTo(cx - r * 0.1, cy - r * 0.95); c.lineTo(cx + r * 0.6, cy - r * 0.45); c.lineTo(cx + r * 0.1, cy - r * 0.15); c.closePath(); c.fill();
  }

  private goal(x: number, y: number, ts: number, t: number) {
    const c = this.ctx, th = this.theme, pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
    const g = c.createRadialGradient(x, y, 0, x, y, ts * 0.62);
    g.addColorStop(0, th.accent + 'cc'); g.addColorStop(1, th.accent + '00');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, ts * (0.6 + pulse * 0.05), 0, 7); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = ts * 0.05; c.beginPath(); c.arc(x, y, ts * 0.3, 0, 7); c.stroke();
    c.save(); c.translate(x, y); c.rotate(t * 0.0012); c.setLineDash([ts * 0.08, ts * 0.07]);
    c.strokeStyle = th.accent; c.lineWidth = ts * 0.05; c.beginPath(); c.arc(0, 0, ts * 0.4, 0, 7); c.stroke(); c.restore();
    // bandera
    c.strokeStyle = '#1b2350'; c.lineWidth = ts * 0.04; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - ts * 0.07, y + ts * 0.15); c.lineTo(x - ts * 0.07, y - ts * 0.17); c.stroke();
    c.fillStyle = th.accent; c.beginPath(); c.moveTo(x - ts * 0.07, y - ts * 0.17); c.lineTo(x + ts * 0.16, y - ts * 0.09); c.lineTo(x - ts * 0.07, y - ts * 0.01); c.closePath(); c.fill();
  }

  private starItem(x: number, y: number, ts: number, t: number, seed: number) {
    const c = this.ctx, bob = Math.sin(t * 0.004 + seed) * ts * 0.03;
    const g = c.createRadialGradient(x, y + bob, 0, x, y + bob, ts * 0.4);
    g.addColorStop(0, 'rgba(255,224,102,.55)'); g.addColorStop(1, 'rgba(255,224,102,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y + bob, ts * 0.4, 0, 7); c.fill();
    this.star(x, y + bob, ts * 0.22, 5);
    const fill = c.createLinearGradient(x, y - ts * 0.2, x, y + ts * 0.2);
    fill.addColorStop(0, '#fff2a8'); fill.addColorStop(1, '#ffb703');
    c.fillStyle = fill; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = ts * 0.025; c.stroke();
  }

  private robot(x: number, y: number, ts: number, t: number) {
    const c = this.ctx, th = this.theme, r = ts * 0.3;
    // sombra
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, y + r * 0.9 + this.lift * 0.5, r * (1 - this.lift / ts), r * 0.5, 0, 0, 7); c.fill();
    c.save();
    c.translate(x, y - this.lift);
    c.rotate(this.ang + this.spin * Math.PI * 2);
    c.scale(1 / this.squash, this.squash);
    // orugas
    c.fillStyle = '#0d1230';
    rr(c, -r * 1.12, -r * 0.82, r * 0.38, r * 1.64, r * 0.18); c.fill();
    rr(c, r * 0.74, -r * 0.82, r * 0.38, r * 1.64, r * 0.18); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 4; i++) { c.fillRect(-r * 1.1, -r * 0.7 + i * r * 0.42, r * 0.34, r * 0.06); c.fillRect(r * 0.76, -r * 0.7 + i * r * 0.42, r * 0.34, r * 0.06); }
    // cuerpo
    const body = c.createLinearGradient(0, -r, 0, r);
    body.addColorStop(0, '#3a4a8c'); body.addColorStop(1, '#1a2252');
    c.fillStyle = body; rr(c, -r * 0.86, -r * 0.95, r * 1.72, r * 1.9, r * 0.5); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = r * 0.06; c.stroke();
    // visor
    c.fillStyle = '#080c24'; rr(c, -r * 0.62, -r * 0.82, r * 1.24, r * 0.62, r * 0.3); c.fill();
    const blink = (Math.floor(t / 2600) % 3 === 0 && (t % 2600) < 110) ? 0.2 : 1;
    c.fillStyle = th.accent;
    c.shadowColor = th.accent; c.shadowBlur = r * 0.5;
    c.beginPath(); c.ellipse(-r * 0.27, -r * 0.51, r * 0.14, r * 0.17 * blink, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(r * 0.27, -r * 0.51, r * 0.14, r * 0.17 * blink, 0, 0, 7); c.fill();
    c.shadowBlur = 0;
    // tapa trasera con antena
    c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, -r * 0.5, r * 0.05, r * 1.0, r * 0.62, r * 0.22); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, r * 0.38, r * 0.14, 0, 7); c.fill();
    c.fillStyle = th.accent; c.beginPath(); c.arc(0, r * 0.38, r * 0.07, 0, 7); c.fill();
    c.restore();
  }
}

// ───────────────────────── Escenario de la tortuga ─────────────────────────
export class TurtleStage extends BaseStage {
  drawn: Segment[] = [];
  partial: Segment | null = null;
  tx = SIZE / 2; ty = SIZE / 2; ta = 0; penDown = true; penColor = '#f4f6ff';
  target: Segment[] | null;
  hop = 0; spin = 0;

  constructor(canvas: HTMLCanvasElement, target: Segment[] | null, theme: StageTheme) {
    super(canvas, theme);
    this.target = target;
  }

  setTarget(t: Segment[] | null) { this.target = t; }

  reset() {
    this.cancel();
    this.drawn = []; this.partial = null; this.tx = SIZE / 2; this.ty = SIZE / 2; this.ta = 0; this.penDown = true; this.penColor = '#f4f6ff'; this.spin = 0; this.hop = 0;
  }

  async step(a: Action, _res: ActResult, world: TurtleWorld) {
    const my = this.token;
    if (a.kind === 'rot') {
      sfx('turn');
      const from = this.ta, to = world.angle;
      await this.tween(Math.min(420, 160 + Math.abs(to - from) * 2), k => { this.ta = from + (to - from) * ease(k); });
      this.ta = to; return;
    }
    if (a.kind === 'pen') { this.penDown = a.down; sfx('click'); await this.tween(120, () => {}); return; }
    if (a.kind === 'color') { this.penColor = world.color; sfx('click'); await this.tween(120, () => {}); return; }
    if (a.kind !== 'fd') return;
    const seg = world.down ? world.segments[world.segments.length - 1] : null;
    const fx = this.tx, fy = this.ty;
    sfx('move', Math.round(a.n));
    await this.tween(Math.min(700, 150 + Math.abs(a.n) * 3.4), k => {
      const e = easeOut(k);
      this.tx = fx + (world.x - fx) * e; this.ty = fy + (world.y - fy) * e;
      if (seg) this.partial = { ...seg, x1: fx, y1: fy, x2: this.tx, y2: this.ty };
    });
    if (this.cancelled(my)) return;
    this.tx = world.x; this.ty = world.y; this.partial = null;
    if (seg) this.drawn.push(seg);
  }

  celebrate() {
    const k = this.W / SIZE;
    this.burst(this.tx * k, this.ty * k, 60, [this.theme.accent, '#ffffff', '#ffd166', '#7bffd3', '#ff7ac6'], 0.45, 'rect');
    void this.tween(900, t => { this.hop = Math.abs(Math.sin(t * Math.PI * 3)) * 12; });
  }

  private path(segs: Segment[]) {
    const c = this.ctx;
    for (const s of segs) { c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); }
  }

  protected draw(t: number) {
    const c = this.ctx, th = this.theme, { W, H } = this;
    const bg = c.createRadialGradient(W * 0.5, H * 0.4, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    bg.addColorStop(0, th.bg[0]); bg.addColorStop(1, th.bg[1]);
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const k = Math.min(W, H) / SIZE, ox = (W - SIZE * k) / 2, oy = (H - SIZE * k) / 2;
    c.save(); c.translate(ox, oy); c.scale(k, k);
    // cuadrícula
    c.fillStyle = 'rgba(255,255,255,.10)';
    for (let x = 0; x <= SIZE; x += 25) for (let y = 0; y <= SIZE; y += 25) { c.beginPath(); c.arc(x, y, x % 100 === 0 && y % 100 === 0 ? 2.2 : 1.1, 0, 7); c.fill(); }
    // marco
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.5; rr(c, 0, 0, SIZE, SIZE, 18); c.stroke();
    c.lineCap = 'round'; c.lineJoin = 'round';
    // fantasma
    if (this.target) {
      c.save(); c.setLineDash([2, 10]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 6; this.path(this.target); c.restore();
    }
    // dibujo del niño (con brillo)
    const all = this.partial ? [...this.drawn, this.partial] : this.drawn;
    c.save(); c.globalAlpha = 0.28; c.lineWidth = 12;
    for (const s of all) { c.strokeStyle = s.color; c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); }
    c.restore();
    c.lineWidth = 5;
    for (const s of all) { c.strokeStyle = s.color; c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); }
    // tortuga (robot visto desde arriba)
    c.save(); c.translate(this.tx, this.ty - this.hop); c.rotate((this.ta * Math.PI) / 180);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(2, 5 + this.hop, 13, 9, 0, 0, 7); c.fill();
    const body = c.createLinearGradient(0, -14, 0, 14); body.addColorStop(0, '#3a4a8c'); body.addColorStop(1, '#1a2252');
    c.fillStyle = body; rr(c, -12, -14, 24, 28, 9); c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#080c24'; rr(c, -8, -12, 16, 10, 5); c.fill();
    c.fillStyle = th.accent; c.shadowColor = th.accent; c.shadowBlur = 8;
    c.beginPath(); c.arc(-3.4, -7.5, 2.2, 0, 7); c.fill(); c.beginPath(); c.arc(3.4, -7.5, 2.2, 0, 7); c.fill(); c.shadowBlur = 0;
    c.fillStyle = this.penDown ? this.penColor : 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(0, 8, 3.2, 0, 7); c.fill();
    c.restore();
    c.restore();
    void t;
  }
}
