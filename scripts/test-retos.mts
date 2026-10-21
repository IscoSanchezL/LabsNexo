/**
 * Pruebas automáticas de los retos con bloques.
 * Comprueba que cada reto tiene solución, que los de depuración empiezan fallando
 * y que los límites de bloques son coherentes. Uso: npm run test:retos
 */
import { grades } from '../src/data/grados/index';
import { countBlocks } from '../src/play/ast';
import { runAll } from '../src/play/exec';
import { MazeWorld } from '../src/play/maze';
import { SIZE, TurtleWorld } from '../src/play/turtle';
import type { Level } from '../src/types';
import { localizeGrade } from '../src/i18n/content';
import { uiDictionaries } from '../src/i18n/ui';
import type { Program } from '../src/play/ast';

let bad = 0, total = 0;
const fail = (id: string, msg: string) => { bad++; console.log(`  ✗ ${id}: ${msg}`); };

function target(l: Level) {
  const t = new TurtleWorld();
  runAll(l.sol!, t);
  return t.segments;
}
function solves(l: Level, p: Program): boolean {
  if (l.mechanic === 'maze') {
    const w = new MazeWorld(l.maze!);
    runAll(p, w);
    return w.finished();
  }
  const w = new TurtleWorld(target(l));
  runAll(p, w);
  return w.matches().ok;
}

for (const g of grades) {
  g.modules.forEach((m, mi) => m.levels.forEach((l, li) => {
    if (!l.sol) return;
    total++;
    const id = `${g.id}.${mi + 1}.${li + 1} ${l.title}`;
    if (!solves(l, l.sol)) fail(id, 'la solución de referencia NO resuelve el reto');
    const par = countBlocks(l.sol);
    if (l.par !== par) fail(id, `par ${l.par} ≠ ${par}`);
    if (l.max !== undefined && l.max < par) fail(id, `máximo ${l.max} < par ${par}`);
    if ((l.debug || l.start) && l.start && solves(l, l.start)) fail(id, 'el programa inicial ya resuelve el reto');
    if (l.debug && !l.start) fail(id, 'reto de depuración sin programa inicial');
    if (l.mechanic === 'turtle') {
      const segs = target(l);
      const out = segs.some(s => [s.x1, s.y1, s.x2, s.y2].some(v => v < 4 || v > SIZE - 4));
      if (out) fail(id, 'el dibujo objetivo se sale del lienzo');
      if (!segs.length) fail(id, 'dibujo objetivo vacío');
    }
    if (l.hint.length !== 3) fail(id, 'debe tener 3 pistas');
  }));
}

// ───────── Inglés: traducciones completas y soluciones intactas ─────────
const SPANISH = /[áéíóúñ¿¡ÁÉÍÓÚÑ]|\b(el|la|los|las|de|del|que|con|para|una|un|hacer|avanzar|girar)\b/;
const textOf = (l: Level) => [l.title, l.prompt, l.concept, ...l.hint, ...(l.options ?? []), l.answer ?? '', l.solution ?? ''];
for (const g of grades) {
  const en = localizeGrade(g, 'en');
  if (en === g) { fail(`en ${g.id}°`, 'sin traducción al inglés'); continue; }
  if (SPANISH.test(en.title + en.world)) fail(`en ${g.id}°`, 'título o mundo sin traducir');
  if (en.exam.length !== g.exam.length) fail(`en ${g.id}° prueba`, 'distinto número de preguntas');
  en.exam.forEach((q, i) => { if (!q.options.includes(q.answer)) fail(`en ${g.id}° prueba ${i + 1}`, 'la respuesta no está entre las opciones'); if (SPANISH.test(q.question + q.options.join(' '))) fail(`en ${g.id}° prueba ${i + 1}`, 'texto en español'); });
  if (g.advanced) {
    if (!en.advanced || en.advanced.questions.length !== g.advanced.questions.length) fail(`en ${g.id}° avanzada`, 'falta o distinto número de preguntas');
    en.advanced?.questions.forEach((q, i) => { if (!q.options.includes(q.answer)) fail(`en ${g.id}° avanzada ${i + 1}`, 'la respuesta no está entre las opciones'); if (SPANISH.test(q.question + q.options.join(' '))) fail(`en ${g.id}° avanzada ${i + 1}`, 'texto en español'); });
  }
  g.modules.forEach((m, mi) => {
    const em = en.modules[mi];
    if (em.title === m.title && SPANISH.test(m.title)) fail(`en ${g.id}.${mi + 1} ${m.title}`, 'módulo sin traducir');
    if (SPANISH.test(em.title + em.intro)) fail(`en ${g.id}.${mi + 1}`, 'título o introducción en español');
    m.levels.forEach((l, li) => {
      const e = em.levels[li];
      const id = `en ${g.id}.${mi + 1}.${li + 1} ${e.title}`;
      if (e.title === l.title && SPANISH.test(l.title)) fail(id, 'reto sin traducir');
      if (e.hint.length !== l.hint.length) fail(id, 'distinto número de pistas');
      if (textOf(e).some(t => SPANISH.test(t))) fail(id, 'queda texto en español');
      if (e.options && e.answer && !e.options.includes(e.answer)) fail(id, 'la respuesta no está entre las opciones');
      if (l.mechanic === 'sequence' && (e.sequence?.length !== l.sequence?.length)) fail(id, 'secuencia distinta');
      if (l.sol) {
        total++;
        if (!solves(e, e.sol!)) fail(id, 'la solución renombrada NO resuelve el reto');
        if ((e.debug || e.start) && e.start && solves(e, e.start)) fail(id, 'el programa inicial ya resuelve el reto');
        if (countBlocks(e.sol!) !== l.par) fail(id, 'los bloques de la solución cambiaron al traducir');
      }
    });
  });
}
const ks = (o: Record<string, string>) => Object.keys(o).sort().join('|');
if (ks(uiDictionaries.es) !== ks(uiDictionaries.en)) fail('interfaz', 'es y en no tienen las mismas claves');
for (const k of Object.keys(uiDictionaries.es) as (keyof typeof uiDictionaries.es)[]) {
  const ph = (t: string) => (t.match(/\{\w+\}/g) ?? []).sort().join(',');
  if (ph(uiDictionaries.es[k]) !== ph(uiDictionaries.en[k])) fail(`interfaz ${k}`, 'los marcadores {…} no coinciden');
  if (SPANISH.test(uiDictionaries.en[k]) && !/^(blk|py)\./.test(k)) fail(`interfaz ${k}`, 'texto en español en la versión inglesa');
}
console.log(bad ? `\n${bad} problema(s) en ${total} comprobaciones.` : `\n✓ ${total / 2} retos con bloques, en español e inglés: todas las soluciones funcionan.`);
process.exit(bad ? 1 : 0);
