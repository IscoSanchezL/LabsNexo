import type { Cond, Expr, Program, Stmt } from './ast';

/** Traduce un programa a Python (para la vista «Ver código»). */
const COND: Record<Cond, string> = { ahead: 'camino_adelante()', left: 'camino_izquierda()', right: 'camino_derecha()' };

function ex(e: Expr, top = true): string {
  if (e.k === 'num') return String(e.v);
  if (e.k === 'var') return e.name;
  const s = `${ex(e.a, false)} ${e.op} ${ex(e.b, false)}`;
  return top ? s : `(${s})`;
}

function block(list: Stmt[], ind: number, maze: boolean): string[] {
  if (!list.length) return [`${'    '.repeat(ind)}pass`];
  return list.flatMap(s => stmt(s, ind, maze));
}

function stmt(s: Stmt, ind: number, maze: boolean): string[] {
  const p = '    '.repeat(ind);
  switch (s.t) {
    case 'move': return [`${p}avanzar()`];
    case 'turn': return [`${p}${s.dir === 'L' ? 'girar_izquierda' : 'girar_derecha'}()`];
    case 'repeat': return [`${p}for _ in range(${ex(s.n)}):`, ...block(s.body, ind + 1, maze)];
    case 'until': return [`${p}while not en_la_meta():`, ...block(s.body, ind + 1, maze)];
    case 'if': return [
      `${p}if ${COND[s.cond]}:`, ...block(s.then, ind + 1, maze),
      ...(s.else ? [`${p}else:`, ...block(s.else, ind + 1, maze)] : []),
    ];
    case 'call': return [`${p}${s.name}()`];
    case 'fd': return [`${p}adelante(${ex(s.n)})`];
    case 'rot': return [`${p}${s.dir === 'L' ? 'izquierda' : 'derecha'}(${ex(s.n)})`];
    case 'pen': return [`${p}${s.down ? 'bajar_lapiz' : 'subir_lapiz'}()`];
    case 'color': return [`${p}color("${s.c}")`];
    case 'set': return [`${p}${s.name} = ${ex(s.e)}`];
    case 'chg': return [`${p}${s.name} += ${ex(s.e)}`];
  }
}

export function programToPython(p: Program, maze: boolean): string {
  const defs = Object.entries(p.defs).flatMap(([name, body]) => [`def ${name}():`, ...block(body, 1, maze), '']);
  const main = block(p.main, 0, maze);
  const lines = [...defs, ...(p.main.length ? main : ['# Arrastra bloques para ver aquí tu código'])];
  return lines.join('\n');
}
