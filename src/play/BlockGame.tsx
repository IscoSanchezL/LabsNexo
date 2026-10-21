import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, CircleHelp, Code2, Eye, FastForward, Lightbulb, Play, RotateCcw, Square, Turtle } from 'lucide-react';
import type { Grade, Level } from '../types';
import { prog } from './ast';
import { execute, type ExecEnd, type World } from './exec';
import { MazeWorld } from './maze';
import { SIZE, TurtleWorld, type Segment } from './turtle';
import { MazeStage, TurtleStage, themeFor } from './stages';
import { Blockly, buildToolbox, countWorkspaceBlocks, defineBlocks, labTheme, programToXml, workspaceToProgram } from './blocks';
import { programToPython } from './pycode';
import { runAll } from './exec';
import { sfx } from '../app/audio';

type Msg = { kind: 'ok' | 'bad' | 'info'; text: string } | null;

export type BlockGameProps = {
  grade: Grade;
  level: Level;
  /** Clave única del reto (reinicia el juego al cambiar). */
  levelKey: string;
  label: string;
  dots: { total: number; current: number; done: boolean[] };
  teacher: boolean;
  free?: boolean;
  hasNext: boolean;
  onNext: () => void;
  onBack: () => void;
  onComplete: (stars: number) => void;
};

const REFLECT: Record<string, string> = {
  debug: '¿Cómo descubriste dónde estaba el error? ¿Qué probaste primero?',
  repeat: '¿Qué parte de tu programa se repite? ¿Cómo lo harías con menos bloques?',
  cond: '¿Qué decide el robot en cada paso? ¿Funcionaría en otro laberinto?',
  vars: '¿Qué pasa si cambias el número de la caja? ¿Por qué es útil una variable?',
  func: '¿Qué ventaja tiene crear tu propio bloque? ¿Dónde más lo usarías?',
  default: '¿Qué estrategia usaste? ¿Qué cambiarías si lo intentaras de nuevo?',
};
function reflectionFor(l: Level) {
  if (l.debug) return REFLECT.debug;
  if (l.tools?.includes('proc')) return REFLECT.func;
  if (l.tools?.includes('vars')) return REFLECT.vars;
  if (l.tools?.includes('ifelse')) return REFLECT.cond;
  if (l.tools?.includes('repeat') || l.tools?.includes('until')) return REFLECT.repeat;
  return REFLECT.default;
}

export default function BlockGame(p: BlockGameProps) {
  const { level, grade, levelKey } = p;
  const isMaze = level.mechanic === 'maze';
  const theme = useMemo(() => themeFor(grade.id), [grade.id]);
  const wsHost = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ws = useRef<Blockly.WorkspaceSvg | null>(null);
  const stage = useRef<MazeStage | TurtleStage | null>(null);
  const runId = useRef(0);
  const target = useRef<Segment[] | null>(null);

  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [hint, setHint] = useState(0);
  const [count, setCount] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [speed, setSpeed] = useState(1);
  const [result, setResult] = useState<{ stars: number; used: number } | null>(null);
  const [tries, setTries] = useState(0);

  const max = level.max;
  const par = level.par ?? 0;

  // ---------- Dibujo objetivo (tortuga) ----------
  useEffect(() => {
    if (!isMaze && level.sol && !p.free) {
      const w = new TurtleWorld();
      runAll(level.sol, w);
      target.current = w.segments;
    } else target.current = null;
  }, [levelKey, isMaze, level.sol, p.free]);

  // ---------- Espacio de trabajo de Blockly ----------
  useEffect(() => {
    if (!wsHost.current) return;
    defineBlocks();
    const small = window.innerWidth < 760;
    const scale = (grade.id <= 2 ? 1.05 : 0.9) * (small ? 0.9 : 1);
    const w = Blockly.inject(wsHost.current, {
      toolbox: buildToolbox(level.tools ?? [], level.vars ?? []) as unknown as Blockly.utils.toolbox.ToolboxDefinition,
      renderer: 'zelos',
      theme: labTheme,
      sounds: false,
      trashcan: true, media: './blockly-media/',
      zoom: { controls: false, wheel: false, startScale: scale, maxScale: 1.5, minScale: 0.5, pinch: true },
      move: { scrollbars: true, drag: true, wheel: true },
      grid: { spacing: 28, length: 3, colour: '#2a3770', snap: true },
    });
    ws.current = w;
    (level.vars ?? []).forEach(v => { if (!w.getVariableMap().getVariable(v)) w.getVariableMap().createVariable(v); });
    const xml = programToXml(level.start ?? prog([]), level.vars ?? []);
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), w);
    w.scrollCenter();
    w.addChangeListener(Blockly.Events.disableOrphans);
    const refresh = (e: Blockly.Events.Abstract) => {
      if (e.isUiEvent) return;
      setCount(countWorkspaceBlocks(w));
      try { setCode(programToPython(workspaceToProgram(w), isMaze)); } catch { /* el árbol aún no está completo */ }
      setResult(null);
      if (e.type === Blockly.Events.BLOCK_CREATE) sfx('click');
      if (e.type === Blockly.Events.BLOCK_MOVE) sfx('drop');
    };
    w.addChangeListener(refresh);
    setCount(countWorkspaceBlocks(w));
    setCode(programToPython(workspaceToProgram(w), isMaze));
    const ro = new ResizeObserver(() => Blockly.svgResize(w));
    ro.observe(wsHost.current);
    return () => { ro.disconnect(); w.dispose(); ws.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelKey]);

  // ---------- Escenario ----------
  useEffect(() => {
    if (!canvas.current) return;
    const s = isMaze
      ? new MazeStage(canvas.current, level.maze!, theme)
      : new TurtleStage(canvas.current, target.current, theme);
    stage.current = s;
    setMsg(null); setHint(0); setResult(null); setTries(0); setRunning(false);
    return () => { s.destroy(); stage.current = null; runId.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelKey, theme]);
  useEffect(() => { if (stage.current) stage.current.speed = speed; }, [speed]);

  const highlight = (id: string | null) => { try { ws.current?.highlightBlock(id); } catch { /* sin resaltado */ } };

  const reset = useCallback(() => {
    runId.current++;
    stage.current?.reset();
    if (!isMaze && stage.current instanceof TurtleStage) stage.current.setTarget(target.current);
    highlight(null);
    setRunning(false); setMsg(null);
  }, [isMaze]);

  const evaluate = (end: ExecEnd, world: World) => {
    if (isMaze) {
      const w = world as MazeWorld;
      if (w.finished()) return { ok: true, text: '' };
      if (end === 'failed') return { ok: false, text: 'El robot chocó con una roca. Mira el camino y cambia el programa.' };
      if (end === 'limit') return { ok: false, text: 'El programa no termina nunca. ¿Cómo puede saber el robot cuándo parar?' };
      if (w.atGoal() && !w.allStars()) return { ok: false, text: '¡Llegaste a la meta, pero faltan estrellas! Recógelas todas.' };
      return { ok: false, text: 'El robot se detuvo antes de llegar a la meta. ¿Qué le falta?' };
    }
    const w = world as TurtleWorld;
    if (!target.current) return { ok: true, text: '' };
    const m = w.matches();
    if (m.ok) return { ok: true, text: '' };
    if (end === 'limit') return { ok: false, text: 'El programa nunca termina. Revisa tus bucles.' };
    if (m.recall < 0.55) return { ok: false, text: 'Todavía falta parte del dibujo. Compáralo con el dibujo fantasma.' };
    if (m.precision < 0.8) return { ok: false, text: 'Hay líneas de más. Mira dónde se separa tu dibujo del fantasma.' };
    return { ok: false, text: 'Casi lo tienes. Revisa los números: ¿son los mismos que pide el dibujo?' };
  };

  const run = async () => {
    if (running || !ws.current || !stage.current) return;
    reset();
    sfx('click');
    const program = workspaceToProgram(ws.current);
    if (!program.main.length) { setMsg({ kind: 'info', text: 'Arrastra bloques debajo de «al empezar» y vuelve a pulsar ▶.' }); return; }
    const used = countWorkspaceBlocks(ws.current);
    if (max !== undefined && used > max) {
      setMsg({ kind: 'info', text: `Para este reto puedes usar como máximo ${max} bloques (llevas ${used}). ¡Prueba con un bucle!` });
      return;
    }
    const world: World = isMaze ? new MazeWorld(level.maze!) : new TurtleWorld(target.current);
    const my = ++runId.current;
    setRunning(true);
    const it = execute(program, world, { maxSteps: isMaze ? 1500 : 3000 });
    let end: ExecEnd = 'done';
    for (;;) {
      const r = it.next();
      if (r.done) { end = r.value; break; }
      highlight(r.value.id ?? null);
      await (stage.current as { step: (a: unknown, b: unknown, c: unknown) => Promise<void> }).step(r.value.action, r.value.result, world);
      if (runId.current !== my) return;
    }
    highlight(null);
    setRunning(false);
    const out = evaluate(end, world);
    if (out.ok) {
      const stars = par && used <= par ? 3 : par && used <= par + Math.max(2, Math.ceil(par * 0.5)) ? 2 : 1;
      sfx('win'); stage.current?.celebrate();
      setResult({ stars, used });
      setMsg({ kind: 'ok', text: '' });
      p.onComplete(stars);
    } else {
      sfx('fail');
      setTries(t => t + 1);
      setMsg({ kind: 'bad', text: out.text });
    }
  };

  const showSolution = () => {
    if (!ws.current || !level.sol) return;
    ws.current.clear();
    (level.vars ?? []).forEach(v => { if (!ws.current!.getVariableMap().getVariable(v)) ws.current!.getVariableMap().createVariable(v); });
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(programToXml(level.sol, level.vars ?? [])), ws.current);
    ws.current.scrollCenter();
  };

  const nextHint = () => { setHint(h => Math.min(3, h + 1)); sfx('ok'); };
  const overMax = max !== undefined && count > max;

  return (
    <section className={`bg bg-g${grade.id}`}>
      <header className="bg-head">
        <div className="bg-title">
          <span className="eyebrow">{p.label}{level.debug ? ' · ARREGLA EL ERROR' : ''}</span>
          <h1>{level.title}</h1>
          <p>{level.prompt}</p>
        </div>
        <ol className="bg-dots" aria-label="Retos del módulo">
          {Array.from({ length: p.dots.total }, (_, i) => (
            <li key={i} className={`${i === p.dots.current ? 'is-current' : ''} ${p.dots.done[i] ? 'is-done' : ''}`}>{p.dots.done[i] ? <Check size={12} strokeWidth={3} /> : i + 1}</li>
          ))}
        </ol>
      </header>

      <div className="bg-grid">
        <div className="bg-stage">
          <div className="bg-canvas-wrap">
            <canvas ref={canvas} className="bg-canvas" aria-label={isMaze ? 'Laberinto del robot' : 'Lienzo de la tortuga'} />
            {!isMaze && !p.free && <span className="bg-ghost-tag"><Turtle size={13} /> Dibujo fantasma</span>}
            {result && (
              <div className="bg-win" role="status">
                <div className="bg-win-stars" aria-label={`${result.stars} de 3 estrellas`}>
                  {[1, 2, 3].map(i => <span key={i} className={i <= result.stars ? 'on' : ''} style={{ animationDelay: `${i * 140}ms` }}>★</span>)}
                </div>
                <strong>¡Lo lograste!</strong>
                <span className="bg-win-sub">{par ? `Usaste ${result.used} bloques · el camino más corto usa ${par}` : `Usaste ${result.used} bloques`}</span>
                <p className="bg-reflect"><Lightbulb size={15} /> {reflectionFor(level)}</p>
                <div className="bg-win-actions">
                  <button className="btn btn-ghost" onClick={() => { setResult(null); reset(); }}><RotateCcw size={15} /> Mejorar</button>
                  {p.hasNext
                    ? <button className="btn btn-primary" onClick={p.onNext}>Siguiente reto <ArrowRight size={16} /></button>
                    : <button className="btn btn-primary" onClick={p.onBack}>Volver al mapa <ArrowRight size={16} /></button>}
                </div>
              </div>
            )}
          </div>

          <div className="bg-bar">
            {running
              ? <button className="btn btn-stop" onClick={() => { reset(); sfx('click'); }}><Square size={16} fill="currentColor" /> Parar</button>
              : <button className="btn btn-run" onClick={run}><Play size={18} fill="currentColor" /> Ejecutar</button>}
            <button className="btn btn-ghost btn-icon" onClick={reset} aria-label="Reiniciar escenario" title="Reiniciar"><RotateCcw size={17} /></button>
            <button className={`btn btn-ghost btn-icon ${speed > 1 ? 'is-on' : ''}`} onClick={() => setSpeed(s => (s === 1 ? 2.2 : s === 2.2 ? 4 : 1))} aria-label="Cambiar velocidad" title="Velocidad">
              <FastForward size={17} /><sup>{speed === 1 ? '1×' : speed === 2.2 ? '2×' : '4×'}</sup>
            </button>
            <span className="bg-flex" />
            <button className="btn btn-ghost" onClick={nextHint} disabled={hint >= 3}><CircleHelp size={16} /> Pista {Math.min(hint, 3)}/3</button>
            <button className={`btn btn-ghost btn-icon ${showCode ? 'is-on' : ''}`} onClick={() => setShowCode(v => !v)} aria-label="Ver código" title="Ver código"><Code2 size={17} /></button>
            {p.teacher && level.sol && <button className="btn btn-ghost btn-icon" onClick={showSolution} aria-label="Mostrar solución" title="Mostrar solución"><Eye size={17} /></button>}
          </div>

          {msg?.kind !== 'ok' && msg && <div className={`bg-msg is-${msg.kind}`} role="status">{msg.text}</div>}
          {hint > 0 && <div className="bg-hint" role="note"><Lightbulb size={15} /><span>{level.hint[Math.min(hint, 3) - 1]}</span></div>}
          {showCode && <pre className="bg-code" aria-label="Código en Python"><code>{code}</code></pre>}
        </div>

        <div className="bg-editor">
          <div className="bg-editor-top">
            <span className="eyebrow">TUS BLOQUES</span>
            <span className={`bg-count ${overMax ? 'is-over' : ''}`}>{count}{max !== undefined ? ` / ${max}` : ''} <small>bloques</small></span>
          </div>
          <div ref={wsHost} className="bg-blockly" />
        </div>
      </div>
      <span className="bg-tries" hidden>{tries}</span>
    </section>
  );
}

export { SIZE };
