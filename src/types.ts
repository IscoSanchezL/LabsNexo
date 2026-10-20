export type GameKind = 'sequence'|'pattern'|'robot'|'obstacle'|'debug'|'loop'|'logic'|'conditional'|'variable'|'function'|'sort'|'binary'|'nested'|'gate'|'python'|'cyber';
export type Level = { title:string; prompt:string; mechanic:GameKind; concept:string; options?:string[]; answer:string; sequence?:string[]; code?:string[]; hint:string[]; solution:string };
export type Module = { title:string; intro:string; levels:Level[] };
export type QuizQuestion = {question:string;options:string[];answer:string};
export type Grade = { id:number; title:string; world:string; accent:string; modules:Module[]; exam:QuizQuestion[]; advanced?:{title:string;intro:string;questions:QuizQuestion[]} };
