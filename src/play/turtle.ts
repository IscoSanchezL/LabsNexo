import type { Action, Cond } from './ast';
import type { ActResult, World } from './exec';

/** Lienzo lógico de la tortuga: 400 × 400, centro en (200, 200). */
export const SIZE = 400;

export type Segment = { x1: number; y1: number; x2: number; y2: number; color: string; width: number };

export const PALETTE: Record<string, string> = {
  rojo: '#ff5d6c', naranja: '#ff9a3c', amarillo: '#ffd23f', verde: '#3ddc97',
  celeste: '#4cc9f0', azul: '#4d7cff', morado: '#a66cff', rosa: '#ff7ac6', blanco: '#f4f6ff',
};

export class TurtleWorld implements World {
  x = SIZE / 2; y = SIZE / 2; angle = 0; // 0 = hacia arriba, positivo = a la derecha
  down = true; color = PALETTE.blanco; width = 5;
  segments: Segment[] = [];
  private target: Segment[] | null;

  constructor(target: Segment[] | null = null) { this.target = target; }

  test(_c: Cond) { return false; }

  act(a: Action): ActResult {
    switch (a.kind) {
      case 'fd': {
        const rad = (this.angle * Math.PI) / 180;
        const nx = this.x + Math.sin(rad) * a.n, ny = this.y - Math.cos(rad) * a.n;
        if (this.down) this.segments.push({ x1: this.x, y1: this.y, x2: nx, y2: ny, color: this.color, width: this.width });
        this.x = nx; this.y = ny;
        return { ok: true };
      }
      case 'rot': this.angle += a.dir === 'R' ? a.n : -a.n; return { ok: true };
      case 'pen': this.down = a.down; return { ok: true };
      case 'color': this.color = PALETTE[a.c] ?? a.c; return { ok: true };
      default: return { ok: false, reason: 'unsupported' };
    }
  }

  /** En la tortuga el reto se evalúa al terminar el programa, no antes. */
  finished() { return false; }

  matches(): { ok: boolean; recall: number; precision: number } {
    if (!this.target) return { ok: true, recall: 1, precision: 1 };
    return compareDrawings(this.segments, this.target);
  }
}

// ---------- Comparación del dibujo con el objetivo ----------
const G = 100; // resolución de la cuadrícula de comparación
const CELL = SIZE / G;

function rasterize(segs: Segment[]): Uint8Array {
  const grid = new Uint8Array(G * G);
  for (const s of segs) {
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
    const steps = Math.max(1, Math.ceil(len / (CELL / 2)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const gx = Math.floor((s.x1 + (s.x2 - s.x1) * t) / CELL);
      const gy = Math.floor((s.y1 + (s.y2 - s.y1) * t) / CELL);
      if (gx >= 0 && gx < G && gy >= 0 && gy < G) grid[gy * G + gx] = 1;
    }
  }
  return grid;
}

function near(grid: Uint8Array, x: number, y: number, r = 1): boolean {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && nx < G && ny >= 0 && ny < G && grid[ny * G + nx]) return true;
  }
  return false;
}

export function compareDrawings(user: Segment[], target: Segment[]): { ok: boolean; recall: number; precision: number } {
  const U = rasterize(user), T = rasterize(target);
  let tCount = 0, tHit = 0, uCount = 0, uHit = 0;
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    if (T[y * G + x]) { tCount++; if (near(U, x, y)) tHit++; }
    if (U[y * G + x]) { uCount++; if (near(T, x, y)) uHit++; }
  }
  const recall = tCount ? tHit / tCount : 1;
  const precision = uCount ? uHit / uCount : (tCount ? 0 : 1);
  return { ok: recall >= 0.93 && precision >= 0.93, recall, precision };
}
