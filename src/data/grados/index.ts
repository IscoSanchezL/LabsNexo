import { countBlocks } from '../../play/ast';
import type { Grade, Module } from '../../types';
import {
  g1Robot, g2Rocas, g2Detectives, g3Bucles, g3Depuracion, g3Tortuga,
  g4Condiciones, g4Variables, g5Funciones, g6Anidados,
} from '../retos';
import { g1 } from './g1'; import { g2 } from './g2'; import { g3 } from './g3';
import { g4 } from './g4'; import { g5 } from './g5'; import { g6 } from './g6';

/** Cambia algunos módulos clásicos de cada grado por retos reales con bloques. */
function upgrade(g: Grade, replace: Record<number, Module>): Grade {
  const modules = g.modules.map((m, i) => {
    const mod = replace[i];
    if (!mod) return m;
    return { ...mod, levels: mod.levels.map(l => (l.sol ? { ...l, par: countBlocks(l.sol) } : l)) };
  });
  return { ...g, modules };
}

export const grades: Grade[] = [
  upgrade(g1, { 2: g1Robot }),
  upgrade(g2, { 1: g2Rocas, 2: g2Detectives }),
  upgrade(g3, { 0: g3Bucles, 1: g3Depuracion, 2: g3Tortuga }),
  upgrade(g4, { 0: g4Condiciones, 1: g4Variables }),
  upgrade(g5, { 0: g5Funciones }),
  upgrade(g6, { 0: g6Anidados }),
];
