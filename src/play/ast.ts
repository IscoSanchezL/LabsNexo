/**
 * Árbol de programa (AST) de IscoLab.
 *
 * Es la "fuente de verdad" de los retos con bloques:
 *  - Los bloques de Blockly se convierten a este árbol para ejecutarse.
 *  - Las soluciones y los programas con error de cada nivel se escriben con este árbol
 *    y se convierten a bloques para mostrarlos en el editor.
 *  - El mismo árbol se traduce a Python para la vista "Ver código".
 */

export type Expr =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'bin'; op: '+' | '-' | '*' | '/'; a: Expr; b: Expr };

export type Cond = 'ahead' | 'left' | 'right';

export type Stmt =
  | { t: 'move'; id?: string }
  | { t: 'turn'; dir: 'L' | 'R'; id?: string }
  | { t: 'repeat'; n: Expr; body: Stmt[]; id?: string }
  | { t: 'until'; body: Stmt[]; id?: string }
  | { t: 'if'; cond: Cond; then: Stmt[]; else?: Stmt[]; id?: string }
  | { t: 'call'; name: string; id?: string }
  | { t: 'fd'; n: Expr; id?: string }
  | { t: 'rot'; dir: 'L' | 'R'; n: Expr; id?: string }
  | { t: 'pen'; down: boolean; id?: string }
  | { t: 'color'; c: string; id?: string }
  | { t: 'set'; name: string; e: Expr; id?: string }
  | { t: 'chg'; name: string; e: Expr; id?: string };

export type Program = { main: Stmt[]; defs: Record<string, Stmt[]> };

/** Acción primitiva que el mundo (laberinto o tortuga) sabe ejecutar. */
export type Action =
  | { kind: 'move' }
  | { kind: 'turn'; dir: 'L' | 'R' }
  | { kind: 'fd'; n: number }
  | { kind: 'rot'; dir: 'L' | 'R'; n: number }
  | { kind: 'pen'; down: boolean }
  | { kind: 'color'; c: string };

// ---- Atajos para escribir soluciones de forma compacta ----
export const num = (v: number): Expr => ({ k: 'num', v });
export const vr = (name: string): Expr => ({ k: 'var', name });
export const bin = (op: '+' | '-' | '*' | '/', a: Expr, b: Expr): Expr => ({ k: 'bin', op, a, b });
const E = (x: number | Expr): Expr => (typeof x === 'number' ? num(x) : x);

export const move = (): Stmt => ({ t: 'move' });
export const left = (): Stmt => ({ t: 'turn', dir: 'L' });
export const right = (): Stmt => ({ t: 'turn', dir: 'R' });
export const repeat = (n: number | Expr, ...body: Stmt[]): Stmt => ({ t: 'repeat', n: E(n), body });
export const until = (...body: Stmt[]): Stmt => ({ t: 'until', body });
export const ifp = (cond: Cond, then: Stmt[], els?: Stmt[]): Stmt => ({ t: 'if', cond, then, else: els });
export const call = (name: string): Stmt => ({ t: 'call', name });
export const fd = (n: number | Expr): Stmt => ({ t: 'fd', n: E(n) });
export const rotR = (n: number | Expr): Stmt => ({ t: 'rot', dir: 'R', n: E(n) });
export const rotL = (n: number | Expr): Stmt => ({ t: 'rot', dir: 'L', n: E(n) });
export const pen = (down: boolean): Stmt => ({ t: 'pen', down });
export const color = (c: string): Stmt => ({ t: 'color', c });
export const setv = (name: string, e: number | Expr): Stmt => ({ t: 'set', name, e: E(e) });
export const chg = (name: string, e: number | Expr): Stmt => ({ t: 'chg', name, e: E(e) });
export const prog = (main: Stmt[], defs: Record<string, Stmt[]> = {}): Program => ({ main, defs });

/** Cuenta los bloques de un programa (sin contar el bloque "al empezar"). */
export function countBlocks(p: Program): number {
  const stmts = (list: Stmt[]): number => list.reduce((n, s) => n + one(s), 0);
  const expr = (e: Expr): number => (e.k === 'bin' ? 1 + expr(e.a) + expr(e.b) : e.k === 'var' ? 1 : 0);
  const one = (s: Stmt): number => {
    switch (s.t) {
      case 'repeat': return 1 + expr(s.n) + stmts(s.body);
      case 'until': return 1 + stmts(s.body);
      case 'if': return 1 + stmts(s.then) + (s.else ? stmts(s.else) : 0);
      case 'fd': case 'rot': case 'set': case 'chg': return 1 + expr(s.t === 'set' || s.t === 'chg' ? s.e : s.n);
      default: return 1;
    }
  };
  return stmts(p.main) + Object.values(p.defs).reduce((n, b) => n + 1 + stmts(b), 0);
}
