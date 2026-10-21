import type { Cond, Expr, Program, Stmt } from './ast';
import { pick } from '../i18n';
import { t } from '../i18n/ui';

/** Traduce un programa a Python (para la vista «Ver código»). */
const COND: Record<Cond, string> = pick(
  { ahead: 'camino_adelante()', left: 'camino_izquierda()', right: 'camino_derecha()' },
  { ahead: 'path_ahead()', left: 'path_left()', right: 'path_right()' },
);
const N = pick(
  { move: 'avanzar', tl: 'girar_izquierda', tr: 'girar_derecha', goal: 'en_la_meta', fd: 'adelante', l: 'izquierda', r: 'derecha', down: 'bajar_lapiz', up: 'subir_lapiz', color: 'color' },
  { move: 'move_forward', tl: 'turn_left', tr: 'turn_right', goal: 'at_goal', fd: 'forward', l: 'left', r: 'right', down: 'pen_down', up: 'pen_up', color: 'color' },
);

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
    case 'move': return [`${p}${N.move}()`];
    case 'turn': return [`${p}${s.dir === 'L' ? N.tl : N.tr}()`];
    case 'repeat': return [`${p}for _ in range(${ex(s.n)}):`, ...block(s.body, ind + 1, maze)];
    case 'until': return [`${p}while not ${N.goal}():`, ...block(s.body, ind + 1, maze)];
    case 'if': return [
      `${p}if ${COND[s.cond]}:`, ...block(s.then, ind + 1, maze),
      ...(s.else ? [`${p}else:`, ...block(s.else, ind + 1, maze)] : []),
    ];
    case 'call': return [`${p}${s.name}()`];
    case 'fd': return [`${p}${N.fd}(${ex(s.n)})`];
    case 'rot': return [`${p}${s.dir === 'L' ? N.l : N.r}(${ex(s.n)})`];
    case 'pen': return [`${p}${s.down ? N.down : N.up}()`];
    case 'color': return [`${p}color("${s.c}")`];
    case 'set': return [`${p}${s.name} = ${ex(s.e)}`];
    case 'chg': return [`${p}${s.name} += ${ex(s.e)}`];
  }
}

export function programToPython(p: Program, maze: boolean): string {
  const defs = Object.entries(p.defs).flatMap(([name, body]) => [`def ${name}():`, ...block(body, 1, maze), '']);
  const main = block(p.main, 0, maze);
  const lines = [...defs, ...(p.main.length ? main : [t('py.hint')])];
  return lines.join('\n');
}
