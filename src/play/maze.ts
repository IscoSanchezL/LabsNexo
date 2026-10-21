import type { Action, Cond } from './ast';
import type { ActResult, World } from './exec';

export type Heading = 0 | 1 | 2 | 3; // 0 norte, 1 este, 2 sur, 3 oeste
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];
const HEADINGS: Record<string, Heading> = { N: 0, E: 1, S: 2, W: 3 };

/**
 * Mapa del laberinto en texto:
 *  ' ' vacío (no se puede pisar)   '.' camino
 *  'S' salida del robot            'G' meta
 *  '*' estrella (camino con estrella)
 */
export type MazeSpec = { rows: string[]; dir?: 'N' | 'E' | 'S' | 'W' };

export type MazeInfo = {
  w: number; h: number;
  floor: boolean[][];
  stars: { x: number; y: number }[];
  start: { x: number; y: number; dir: Heading };
  goal: { x: number; y: number };
};

export function parseMaze(spec: MazeSpec): MazeInfo {
  const h = spec.rows.length;
  const w = Math.max(...spec.rows.map(r => r.length));
  const floor = Array.from({ length: h }, () => Array<boolean>(w).fill(false));
  const stars: { x: number; y: number }[] = [];
  let start = { x: 0, y: 0, dir: HEADINGS[spec.dir ?? 'E'] };
  let goal = { x: 0, y: 0 };
  spec.rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const c = row[x] ?? ' ';
      if (c === ' ') continue;
      floor[y][x] = true;
      if (c === 'S') start = { x, y, dir: HEADINGS[spec.dir ?? 'E'] };
      if (c === 'G') goal = { x, y };
      if (c === '*') stars.push({ x, y });
    }
  });
  return { w, h, floor, stars, start, goal };
}

export class MazeWorld implements World {
  info: MazeInfo;
  x: number; y: number; dir: Heading;
  taken = new Set<string>();

  constructor(spec: MazeSpec | MazeInfo) {
    this.info = 'rows' in spec ? parseMaze(spec) : spec;
    this.x = this.info.start.x; this.y = this.info.start.y; this.dir = this.info.start.dir;
  }

  private isFloor(x: number, y: number) {
    return y >= 0 && y < this.info.h && x >= 0 && x < this.info.w && this.info.floor[y][x];
  }

  private rel(c: Cond): Heading {
    return (c === 'ahead' ? this.dir : c === 'left' ? (this.dir + 3) % 4 : (this.dir + 1) % 4) as Heading;
  }

  test(c: Cond): boolean {
    const d = this.rel(c);
    return this.isFloor(this.x + DX[d], this.y + DY[d]);
  }

  act(a: Action): ActResult {
    if (a.kind === 'turn') {
      this.dir = ((this.dir + (a.dir === 'R' ? 1 : 3)) % 4) as Heading;
      return { ok: true };
    }
    if (a.kind === 'move') {
      const nx = this.x + DX[this.dir], ny = this.y + DY[this.dir];
      if (!this.isFloor(nx, ny)) return { ok: false, reason: 'wall', info: { x: nx, y: ny } };
      this.x = nx; this.y = ny;
      const key = `${nx},${ny}`;
      const star = this.info.stars.some(s => s.x === nx && s.y === ny) && !this.taken.has(key);
      if (star) this.taken.add(key);
      return { ok: true, info: { star } };
    }
    return { ok: false, reason: 'unsupported' };
  }

  atGoal() { return this.x === this.info.goal.x && this.y === this.info.goal.y; }
  allStars() { return this.taken.size === this.info.stars.length; }
  finished() { return this.atGoal() && this.allStars(); }
}
