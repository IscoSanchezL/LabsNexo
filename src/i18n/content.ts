import type { Expr, Program, Stmt } from '../play/ast';
import type { Grade, Level, Module, QuizQuestion } from '../types';
import { LANG, type Lang } from './index';
import { en1 } from './en/g1'; import { en2 } from './en/g2'; import { en3 } from './en/g3';
import { en4 } from './en/g4'; import { en5 } from './en/g5'; import { en6 } from './en/g6';
import { enWorkshop } from './en/workshop';

/** Textos de un reto en otro idioma. Los campos opcionales solo se indican si cambian (opciones, respuesta…). */
export type LevelText = {
  title: string; prompt: string; concept: string; hint: string[];
  options?: string[]; answer?: string; sequence?: string[]; code?: string[]; solution?: string;
};
export type ModuleText = { title: string; intro: string; levels: LevelText[] };
export type GradeText = {
  title: string; world: string;
  /** Módulos, por el título en español. */
  modules: Record<string, ModuleText>;
  exam: QuizQuestion[];
  advanced?: { title: string; intro: string; questions: QuizQuestion[] };
};

export const EN: Record<number, GradeText> = { 1: en1, 2: en2, 3: en3, 4: en4, 5: en5, 6: en6 };

/** Nombres de variables y funciones que ve el estudiante en los bloques. */
const NAMES: Record<string, string> = {
  lado: 'side', angulo: 'angle', ancho: 'width', alto: 'height', paso: 'step',
  cuadrado: 'square', triangulo: 'triangle', linea: 'line', hexagono: 'hexagon', molino: 'windmill',
};
const rn = (n: string) => NAMES[n] ?? n;
const rExpr = (e: Expr): Expr => e.k === 'var' ? { ...e, name: rn(e.name) } : e.k === 'bin' ? { ...e, a: rExpr(e.a), b: rExpr(e.b) } : e;
function rStmt(s: Stmt): Stmt {
  switch (s.t) {
    case 'repeat': return { ...s, n: rExpr(s.n), body: s.body.map(rStmt) };
    case 'until': return { ...s, body: s.body.map(rStmt) };
    case 'if': return { ...s, then: s.then.map(rStmt), else: s.else?.map(rStmt) };
    case 'call': return { ...s, name: rn(s.name) };
    case 'fd': return { ...s, n: rExpr(s.n) };
    case 'rot': return { ...s, n: rExpr(s.n) };
    case 'set': case 'chg': return { ...s, name: rn(s.name), e: rExpr(s.e) };
    default: return s;
  }
}
export const renameProgram = (p: Program): Program => ({
  main: p.main.map(rStmt),
  defs: Object.fromEntries(Object.entries(p.defs).map(([k, v]) => [rn(k), v.map(rStmt)])),
});

export function localizeLevel(l: Level, moduleTitle: string, index = 0, lang: Lang = LANG): Level {
  if (lang === 'es') return l;
  const text = moduleTitle === 'Taller libre' ? enWorkshop : EN_BY_MODULE[moduleTitle]?.levels[index];
  const out: Level = { ...l };
  if (text) {
    out.title = text.title; out.prompt = text.prompt; out.concept = text.concept; out.hint = text.hint;
    for (const k of ['options', 'answer', 'sequence', 'code', 'solution'] as const) if (text[k] !== undefined) (out as Record<string, unknown>)[k] = text[k];
  }
  if (l.vars) out.vars = l.vars.map(rn);
  if (l.sol) out.sol = renameProgram(l.sol);
  if (l.start) out.start = renameProgram(l.start);
  return out;
}

const EN_BY_MODULE: Record<string, ModuleText> = Object.fromEntries(Object.values(EN).flatMap(g => Object.entries(g.modules)));

export function localizeGrade(g: Grade, lang: Lang = LANG): Grade {
  if (lang === 'es') return g;
  const text = EN[g.id];
  if (!text) return g;
  const modules: Module[] = g.modules.map(m => {
    const mt = text.modules[m.title];
    if (!mt) return m;
    return { ...m, title: mt.title, intro: mt.intro, levels: m.levels.map((l, i) => localizeLevel(l, m.title, i, lang)) };
  });
  return {
    ...g, title: text.title, world: text.world, modules, exam: text.exam,
    advanced: g.advanced && text.advanced ? { ...g.advanced, ...text.advanced } : g.advanced,
  };
}
