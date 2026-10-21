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
console.log(bad ? `\n${bad} problema(s) en ${total} retos.` : `\n✓ ${total} retos con bloques: todas las soluciones funcionan.`);
process.exit(bad ? 1 : 0);
