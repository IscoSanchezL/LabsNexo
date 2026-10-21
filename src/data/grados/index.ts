import { countBlocks } from '../../play/ast';
import type { Grade, Module } from '../../types';
import {
  g1Robot, g2Rocas, g2Detectives, g3Bucles, g3Depuracion, g3Tortuga,
  g4Condiciones, g4Variables, g5Funciones, g6Anidados,
} from '../retos';
import { g1Estrellas, g1Giros, g2Bucles, g3Figuras, g4VariablesAccion, g5MasFunciones, g6Patrones } from '../retos-extra';
import { g1 } from './g1'; import { g2 } from './g2'; import { g3 } from './g3';
import { g4 } from './g4'; import { g5 } from './g5'; import { g6 } from './g6';

/** Cambia algunos módulos clásicos de cada grado por retos reales con bloques. */
function upgrade(g: Grade, replace: Record<number, Module>, extra: Module[] = []): Grade {
  const withPar = (mod: Module): Module => ({ ...mod, levels: mod.levels.map(l => (l.sol ? { ...l, par: countBlocks(l.sol) } : l)) });
  const modules = g.modules.map((m, i) => {
    const mod = replace[i];
    if (!mod) return m;
    return withPar(mod);
  });
  // Los módulos extra van al final: así no cambian las claves del progreso ya guardado.
  return { ...g, modules: [...modules, ...extra.map(withPar)] };
}

export const grades: Grade[] = [
  upgrade(g1, { 2: g1Robot }, [g1Estrellas, g1Giros]),
  upgrade(g2, { 1: g2Rocas, 2: g2Detectives }, [g2Bucles]),
  upgrade(g3, { 0: g3Bucles, 1: g3Depuracion, 2: g3Tortuga }, [g3Figuras]),
  upgrade(g4, { 0: g4Condiciones, 1: g4Variables }, [g4VariablesAccion]),
  upgrade(g5, { 0: g5Funciones }, [g5MasFunciones]),
  upgrade(g6, { 0: g6Anidados }, [g6Patrones]),
];
