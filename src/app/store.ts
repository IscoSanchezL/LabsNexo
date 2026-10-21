import { CONFIG } from '../config';

/** uid: cuenta de Google (solo desde 3°); sin uid el progreso vive solo en este dispositivo. */
export type Profile = { nickname: string; grade: number; avatar: number; uid?: string };
export type Progress = {
  levels: Record<string, { stars: number }>;
  badges: string[];
  exam: Record<number, { score: number; medal: string }>;
};
const empty = (): Progress => ({ levels: {}, badges: [], exam: {} });

function read(): { profile: Profile | null; progress: Progress } {
  try {
    const cur = localStorage.getItem(CONFIG.storageKey);
    if (cur) {
      const j = JSON.parse(cur);
      return { profile: j.profile ?? null, progress: { ...empty(), ...(j.progress ?? {}) } };
    }
    // Migración desde la versión 1
    const old = JSON.parse(localStorage.getItem(CONFIG.legacyKey) || '{}');
    const profile = old.perfil ? { nickname: old.perfil.nombre, grade: old.perfil.grado, avatar: old.perfil.avatar || 0 } : null;
    const levels: Progress['levels'] = {};
    Object.keys(old.progreso?.niveles || {}).forEach(k => (levels[k.split('-').join('.')] = old.progreso.niveles[k]));
    const badges = Object.keys(old.progreso?.insignias || {}).map(k => k.replace('-', '.'));
    const exam: Progress['exam'] = {};
    Object.keys(old.progreso?.prueba || {}).forEach(k => (exam[+k] = old.progreso.prueba[k]));
    return { profile, progress: { levels, badges, exam } };
  } catch {
    return { profile: null, progress: empty() };
  }
}

export const obtenerPerfil = () => read().profile;
export const cargarProgreso = () => read().progress;
export function guardarProgreso(progress: Progress, profile: Profile | null = obtenerPerfil()) {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify({ profile, progress })); return true; } catch { return false; }
}
export const levelKey = (g: number, m: number, l: number) => `${g}.${m}.${l}`;
export { empty as emptyProgress };

/** Une dos progresos de la misma persona: mejor puntuación de cada reto, insignias y pruebas. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const levels = { ...a.levels };
  Object.entries(b.levels).forEach(([k, v]) => { levels[k] = { stars: Math.max(levels[k]?.stars ?? 0, v.stars) }; });
  const exam = { ...a.exam };
  Object.entries(b.exam).forEach(([k, v]) => { if (!exam[+k] || v.score > exam[+k].score) exam[+k] = v; });
  return { levels, badges: [...new Set([...a.badges, ...b.badges])], exam };
}
