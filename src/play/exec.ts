import type { Action, Cond, Expr, Program, Stmt } from './ast';

/** Resultado de intentar una acción en el mundo. */
export type ActResult = { ok: boolean; reason?: string; info?: Record<string, unknown> };

/** Lo que el ejecutor necesita de un mundo (laberinto o tortuga). */
export interface World {
  act(a: Action): ActResult;
  test(c: Cond): boolean;
  /** true cuando el reto ya se cumplió y se puede detener el programa. */
  finished(): boolean;
}

export type Step = { id?: string; action: Action; result: ActResult };
export type ExecEnd = 'done' | 'failed' | 'goal' | 'limit';

export type ExecOptions = { maxSteps?: number; maxDepth?: number };

function evalExpr(e: Expr, vars: Record<string, number>): number {
  switch (e.k) {
    case 'num': return e.v;
    case 'var': return vars[e.name] ?? 0;
    case 'bin': {
      const a = evalExpr(e.a, vars), b = evalExpr(e.b, vars);
      return e.op === '+' ? a + b : e.op === '-' ? a - b : e.op === '*' ? a * b : (b === 0 ? 0 : a / b);
    }
  }
}

/**
 * Ejecuta un programa paso a paso. Cada acción primitiva se entrega con `yield`
 * para que la interfaz pueda animarla y resaltar el bloque correspondiente.
 */
export function* execute(p: Program, w: World, opts: ExecOptions = {}): Generator<Step, ExecEnd, void> {
  const maxSteps = opts.maxSteps ?? 4000;
  const maxDepth = opts.maxDepth ?? 40;
  const vars: Record<string, number> = {};
  let budget = 0;

  function* run(list: Stmt[], depth: number): Generator<Step, ExecEnd | null, void> {
    for (const s of list) {
      if (++budget > maxSteps) return 'limit';
      switch (s.t) {
        case 'move': case 'turn': case 'fd': case 'rot': case 'pen': case 'color': {
          const action: Action =
            s.t === 'move' ? { kind: 'move' }
            : s.t === 'turn' ? { kind: 'turn', dir: s.dir }
            : s.t === 'fd' ? { kind: 'fd', n: evalExpr(s.n, vars) }
            : s.t === 'rot' ? { kind: 'rot', dir: s.dir, n: evalExpr(s.n, vars) }
            : s.t === 'pen' ? { kind: 'pen', down: s.down }
            : { kind: 'color', c: s.c };
          const result = w.act(action);
          yield { id: s.id, action, result };
          if (!result.ok) return 'failed';
          if (w.finished()) return 'goal';
          break;
        }
        case 'repeat': {
          const times = Math.max(0, Math.min(Math.floor(evalExpr(s.n, vars)), 500));
          for (let i = 0; i < times; i++) {
            if (++budget > maxSteps) return 'limit';
            const r = yield* run(s.body, depth);
            if (r) return r;
          }
          break;
        }
        case 'until': {
          while (!w.finished()) {
            if (++budget > maxSteps) return 'limit';
            const r = yield* run(s.body, depth);
            if (r) return r;
          }
          return 'goal';
        }
        case 'if': {
          const branch = w.test(s.cond) ? s.then : (s.else ?? []);
          const r = yield* run(branch, depth);
          if (r) return r;
          break;
        }
        case 'call': {
          const body = p.defs[s.name];
          if (!body || depth >= maxDepth) return 'limit';
          const r = yield* run(body, depth + 1);
          if (r) return r;
          break;
        }
        case 'set': vars[s.name] = evalExpr(s.e, vars); break;
        case 'chg': vars[s.name] = (vars[s.name] ?? 0) + evalExpr(s.e, vars); break;
      }
    }
    return null;
  }

  const end = yield* run(p.main, 0);
  return end ?? 'done';
}

/** Ejecuta todo de una vez (útil para pruebas y para calcular el dibujo objetivo). */
export function runAll(p: Program, w: World, opts?: ExecOptions): { end: ExecEnd; steps: Step[] } {
  const it = execute(p, w, opts);
  const steps: Step[] = [];
  for (;;) {
    const r = it.next();
    if (r.done) return { end: r.value, steps };
    steps.push(r.value);
  }
}
