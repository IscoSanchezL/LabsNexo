/** Idioma de la plataforma. Se elige una vez al cargar; cambiarlo recarga la página para que todo (bloques incluidos) quede en un solo idioma. */
export type Lang = 'es' | 'en';
const KEY = 'iscolab.lang';

function detect(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') { try { localStorage.setItem(KEY, q); } catch { /* sin almacenamiento */ } return q; }
    const s = localStorage.getItem(KEY);
    if (s === 'es' || s === 'en') return s;
  } catch { /* sin almacenamiento */ }
  return (typeof navigator !== 'undefined' ? navigator.language : 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
}

export const LANG: Lang = typeof window === 'undefined' ? 'es' : detect();
if (typeof document !== 'undefined') document.documentElement.lang = LANG;

export function setLang(l: Lang) {
  try { localStorage.setItem(KEY, l); } catch { /* sin almacenamiento */ }
  const u = new URL(location.href);
  u.searchParams.delete('lang');
  location.replace(u.toString());
  location.reload();
}

export const pick = <T,>(es: T, en: T): T => (LANG === 'en' ? en : es);
