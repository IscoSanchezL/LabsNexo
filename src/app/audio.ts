/** Sonidos sintetizados con Web Audio (no se descarga ningún archivo). */
let ctx: AudioContext | null = null;
let muted = false;
try { muted = localStorage.getItem('iscolab.muted') === '1'; } catch { /* sin almacenamiento */ }

export const isMuted = () => muted;
export function setMuted(v: boolean) {
  muted = v;
  try { localStorage.setItem('iscolab.muted', v ? '1' : '0'); } catch { /* sin almacenamiento */ }
}

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new C();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.06, slideTo?: number) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

export type Sfx = 'click' | 'move' | 'turn' | 'star' | 'win' | 'fail' | 'bump' | 'drop' | 'ok';
export function sfx(kind: Sfx, n = 0) {
  switch (kind) {
    case 'click': tone(520, 0, 0.07, 'triangle', 0.04); break;
    case 'drop': tone(300, 0, 0.09, 'triangle', 0.05, 220); break;
    case 'move': tone(240 + (n % 6) * 22, 0, 0.1, 'triangle', 0.045); break;
    case 'turn': tone(420, 0, 0.09, 'sine', 0.04, 560); break;
    case 'star': [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.16, 'sine', 0.05)); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.06)); tone(1319, 0.5, 0.5, 'sine', 0.05); break;
    case 'fail': tone(220, 0, 0.28, 'sawtooth', 0.035, 130); break;
    case 'bump': tone(150, 0, 0.14, 'square', 0.03, 90); break;
    case 'ok': tone(660, 0, 0.12, 'sine', 0.05); tone(880, 0.09, 0.16, 'sine', 0.05); break;
  }
}
