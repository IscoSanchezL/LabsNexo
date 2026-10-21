import type { Program } from './play/ast';
import type { MazeSpec } from './play/maze';

export type GameKind =
  | 'sequence' | 'pattern' | 'robot' | 'obstacle' | 'debug' | 'loop' | 'logic' | 'conditional'
  | 'variable' | 'function' | 'sort' | 'binary' | 'nested' | 'gate' | 'python' | 'cyber'
  | 'maze' | 'turtle';

/** Bloques disponibles en la caja de herramientas de un reto. */
export type Tool =
  | 'move' | 'turnL' | 'turnR' | 'repeat' | 'until' | 'if' | 'ifelse'
  | 'fd' | 'rotL' | 'rotR' | 'pen' | 'color' | 'vars' | 'proc';

export type Level = {
  title: string;
  prompt: string;
  mechanic: GameKind;
  concept: string;
  hint: string[];
  /** Respuesta correcta en retos de opción múltiple / ordenar. */
  answer?: string;
  options?: string[];
  sequence?: string[];
  code?: string[];
  /** Texto de la solución en los retos clásicos. */
  solution?: string;

  // ---- Retos con bloques (maze / turtle) ----
  tools?: Tool[];
  maze?: MazeSpec;
  vars?: string[];
  /** Solución de referencia. */
  sol?: Program;
  /** Programa inicial (retos de depuración o de funciones ya definidas). */
  start?: Program;
  /** Bloques de la solución más corta (se calcula al cargar los datos). */
  par?: number;
  /** Máximo de bloques permitido (para obligar a usar bucles). */
  max?: number;
  /** El reto es de depuración: el programa inicial tiene un error. */
  debug?: boolean;
};

export type Module = { title: string; intro: string; levels: Level[] };
export type QuizQuestion = { question: string; options: string[]; answer: string };
export type Grade = {
  id: number; title: string; world: string; accent: string;
  modules: Module[]; exam: QuizQuestion[];
  advanced?: { title: string; intro: string; questions: QuizQuestion[] };
};
