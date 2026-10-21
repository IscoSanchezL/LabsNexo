import { useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRight, Check, GripVertical, Lightbulb, CircleHelp, Eye } from 'lucide-react';
import type { Grade, Level } from '../types';
import { sfx } from './audio';
import { Robot } from './Robot';

export type ClassicProps = {
  grade: Grade; level: Level; levelKey: string; label: string;
  dots: { total: number; current: number; done: boolean[] };
  teacher: boolean; hasNext: boolean; onNext: () => void; onBack: () => void; onComplete: (stars: number) => void;
};

const EMOJI: [RegExp, string][] = [
  [/jab[oó]n/, '🧼'], [/comer/, '🍽️'], [/tost|pan/, '🍞'], [/mermelada|untar/, '🍓'], [/semilla/, '🌱'], [/regad|regar|agua|mojar|enjuag/, '💧'],
  [/plant|maceta|tierra/, '🪴'], [/crezca|esper/, '☀️'], [/cepill|dientes|pasta/, '🪥'], [/horario|revisar|cuader|libro/, '📚'], [/mochila/, '🎒'],
];
const emojiFor = (t: string) => EMOJI.find(([r]) => r.test(t.toLowerCase()))?.[1] ?? '✨';

const COLORS: Record<string, string> = { R: '#ff6b6b', A: '#4dabf7', V: '#51cf66', rojo: '#ff6b6b', azul: '#4dabf7', verde: '#51cf66', amarillo: '#ffd43b', Rojo: '#ff6b6b', Azul: '#4dabf7', Verde: '#51cf66', Amarillo: '#ffd43b' };
const Token = ({ v }: { v: string }) => COLORS[v] ? <i className="cl-orb" style={{ background: COLORS[v] }} aria-label={v} /> : <>{v}</>;

function SortCard({ id, text, index, pic }: { id: string; text: string; index: number; pic: boolean }) {
  const s = useSortable({ id });
  return (
    <button ref={s.setNodeRef} className="cl-sort" style={{ transform: CSS.Transform.toString(s.transform), transition: s.transition, opacity: s.isDragging ? 0.6 : 1, touchAction: 'none' }} {...s.attributes} {...s.listeners}>
      <span className="cl-num">{index + 1}</span>{pic && <span className="cl-emoji">{emojiFor(text)}</span>}<b>{text}</b><GripVertical size={18} className="cl-grip" />
    </button>
  );
}

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export default function ClassicGame(p: ClassicProps) {
  const { grade, level } = p;
  const isSeq = level.mechanic === 'sequence' && !!level.sequence;
  const young = grade.id <= 2;
  const [tries, setTries] = useState(0);
  const [pick, setPick] = useState('');
  const [fb, setFb] = useState<'' | 'right' | 'wrong'>('');
  const [hint, setHint] = useState(-1);
  const [items, setItems] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [bits, setBits] = useState([false, false, false, false]);
  const [done, setDone] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 90, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    setTries(0); setPick(''); setFb(''); setHint(-1); setStep(0); setBits([false, false, false, false]); setDone(false);
    setItems(level.sequence ? (isSeq ? shuffle(level.sequence) : [...level.sequence]) : []);
  }, [p.levelKey]); // eslint-disable-line

  const value = bits.reduce((a, v, i) => a + (v ? 8 >> i : 0), 0);
  const stars = tries === 0 ? 3 : tries < 3 ? 2 : 1;

  const check = (v: string) => {
    setPick(v);
    const resolved = level.mechanic === 'binary' && /^[01]{2,}$/.test(level.answer ?? '') && /^\d+$/.test(v) && !level.options?.includes(v) ? Number(v).toString(2) : v;
    const right = isSeq ? items.join('|') === level.sequence!.join('|') : resolved === level.answer;
    if (right) { sfx('win'); setFb('right'); setDone(true); p.onComplete(stars); }
    else { sfx('fail'); setFb('wrong'); setTries(t => t + 1); }
  };
  const dragEnd = (e: DragEndEvent) => { if (e.over && e.active.id !== e.over.id) setItems(x => arrayMove(x, x.indexOf(String(e.active.id)), x.indexOf(String(e.over!.id)))); };
  const sortNext = () => {
    if (items.length < 2) return; sfx('click');
    const n = step + 1, i = (n - 1) % (items.length - 1), c = [...items];
    if (Number(c[i]) > Number(c[i + 1])) [c[i], c[i + 1]] = [c[i + 1], c[i]];
    setItems(c); setStep(n);
  };
  const showHint = () => { sfx('click'); setHint(h => Math.min(h + 1, level.hint.length - 1)); };

  const showOptions = !isSeq && level.mechanic !== 'binary' && !!level.options;
  const options = useMemo(() => level.options ? [...new Set([...level.options, ...(level.answer ? [level.answer] : [])])] : [], [level]);

  return (
    <section className="bg cl">
      <header className="bg-head">
        <div className="bg-title"><span className="eyebrow">{p.label}</span><h1>{level.title}</h1><p>{level.prompt}</p></div>
        <ol className="bg-dots">{Array.from({ length: p.dots.total }, (_, i) => <li key={i} className={i === p.dots.current ? 'is-current' : p.dots.done[i] ? 'is-done' : ''}>{p.dots.done[i] && i !== p.dots.current ? <Check size={14} /> : i + 1}</li>)}</ol>
      </header>

      <div className="cl-grid">
        <div className="cl-board bg-stage">
          {isSeq ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="cl-sort-list">{items.map((s, i) => <SortCard key={s} id={s} text={s} index={i} pic={young} />)}</div>
              </SortableContext>
            </DndContext>
          ) : level.mechanic === 'binary' ? (
            <div className="cl-binary">
              <span className="eyebrow">Activa los interruptores</span>
              <div className="cl-switches">{bits.map((on, i) => (
                <button key={i} className={`cl-switch ${on ? 'on' : ''}`} aria-pressed={on} aria-label={`Valor ${8 >> i}`} onClick={() => { sfx('click'); setBits(b => b.map((v, j) => j === i ? !v : v)); }}><span /><small>{8 >> i}</small></button>))}</div>
              <div className="cl-out"><small>Salida decimal</small><b>{value}</b></div>
              {level.options && <div className="cl-options cl-options-mini">{options.map((o, i) => <button key={i} className={`cl-opt ${pick === o ? (fb === 'right' ? 'good' : 'bad') : ''}`} onClick={() => check(o)}><span>{String.fromCharCode(65 + i)}</span>{o}</button>)}</div>}
              {!level.options && <button className="btn btn-primary" onClick={() => check(String(value))}>Leer salida <ArrowRight size={16} /></button>}
            </div>
          ) : level.mechanic === 'pattern' && level.sequence ? (
            <div className="cl-pattern"><span className="eyebrow">Observa la secuencia</span>
              <div className="cl-chips">{level.sequence.map((s, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }}><Token v={s} /></span>)}<span className="cl-missing">?</span></div></div>
          ) : level.mechanic === 'sort' ? (
            <div className="cl-sortdemo"><span className="eyebrow">Burbuja · paso {step}</span>
              <div className="cl-bars">{items.map((n, i) => <span key={`${i}-${n}`} style={{ height: `${28 + Number(n) * 9}px` }}>{n}</span>)}</div>
              <button className="btn btn-ghost" onClick={sortNext}>Comparar vecinos <ArrowRight size={14} /></button></div>
          ) : (
            <div className="cl-concept">
              <Robot variant={(grade.id + 2) % 8} mood={fb === 'right' ? 'happy' : 'think'} size={110} />
              {level.code && <pre className="bg-code">{level.code.map((l, i) => <code key={i}><i>{String(i + 1).padStart(2, '0')}</i>{l}{'\n'}</code>)}</pre>}
              <span className="cl-chip">{level.concept}</span>
            </div>
          )}

          <div className="bg-bar">
            <button className="btn btn-ghost" onClick={showHint} disabled={hint >= level.hint.length - 1}><CircleHelp size={16} /> Pista {hint + 1}/{level.hint.length}</button>
            <span className="bg-flex" />
            {isSeq && <button className="btn btn-primary" onClick={() => check('seq')}>{young ? '¡Revisar orden!' : 'Comprobar orden'} <ArrowRight size={16} /></button>}
            {p.teacher && level.solution && <button className="btn btn-ghost btn-icon" title="Ver solución" onClick={() => setHint(level.hint.length - 1)}><Eye size={16} /></button>}
          </div>
          {hint >= 0 && <div className="bg-hint"><Lightbulb size={16} /><span>{level.hint[hint]}</span></div>}
          {p.teacher && p.teacher && level.solution && <div className="bg-msg is-info">Solución: {level.solution}</div>}
          {fb === 'wrong' && <div className="bg-msg is-bad">{young ? 'Casi. Mira la pista y prueba otra vez.' : 'Buen intento. Observa la pista y prueba otra vez.'}</div>}
        </div>

        <aside className="cl-aside">
          {showOptions && (
            <div className="cl-options">{options.map((o, i) => (
              <button key={i} className={`cl-opt ${pick === o ? (fb === 'right' ? 'good' : 'bad') : ''}`} disabled={done} onClick={() => check(o)}>
                <span>{String.fromCharCode(65 + i)}</span>{level.mechanic === 'pattern' && young ? <Token v={o} /> : o}<ArrowRight size={15} />
              </button>))}
            </div>
          )}
          {!showOptions && <div className="cl-idea"><span className="eyebrow">Idea clave</span><b>{level.concept}</b><p>{young ? 'Mira las pistas y prueba una idea.' : 'Explora, construye una respuesta y comprueba qué ocurre.'}</p></div>}
        </aside>
      </div>

      {done && (
        <div className="cl-done">
          <div className="bg-win-stars">{[1, 2, 3].map(n => <span key={n} className={n <= stars ? 'on' : ''} style={{ animationDelay: `${n * 140}ms` }}>★</span>)}</div>
          <strong>{young ? '¡Lo lograste!' : '¡Exacto! Buena estrategia.'}</strong>
          <p className="bg-reflect"><Lightbulb size={16} />{young ? '¿Qué te ayudó? ¿Qué probarías ahora?' : '¿Qué estrategia usaste? ¿Qué cambiarías si lo intentaras de nuevo?'}</p>
          <div className="bg-win-actions">
            <button className="btn btn-ghost" onClick={p.onBack}>Volver al mapa</button>
            {p.hasNext && <button className="btn btn-primary" onClick={p.onNext}>Siguiente reto <ArrowRight size={16} /></button>}
          </div>
        </div>
      )}
    </section>
  );
}
