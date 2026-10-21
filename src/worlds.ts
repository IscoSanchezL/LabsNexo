import { pick } from './i18n';

export type WorldVisual = {
  name: string;
  palette: [string, string];
  atmosphere: string;
  material: string;
};

/** Decorative art direction only. Curriculum and grade data stay in data/grados. */
export const worldVisuals: Record<number, WorldVisual> = {
  1: { name: pick('Cristal', 'Crystal'), palette: ['#f3b879', '#f27b63'], atmosphere: '#17100e', material: 'vidrio cálido' },
  2: { name: pick('Bosque de luz', 'Light Forest'), palette: ['#b9df86', '#68c49d'], atmosphere: '#0d1913', material: 'luz viva' },
  3: { name: pick('Aurora', 'Aurora'), palette: ['#b9a0ed', '#72d7c6'], atmosphere: '#15121d', material: 'ondas de aurora' },
  4: { name: pick('Circuito', 'Circuit'), palette: ['#8dc4e8', '#91dfc6'], atmosphere: '#0d1720', material: 'cerámica conductora' },
  5: { name: pick('Cobre', 'Copper'), palette: ['#df9867', '#e1bd78'], atmosphere: '#1b1410', material: 'metal satinado' },
  6: { name: pick('Nébula', 'Nebula'), palette: ['#e493af', '#e5c87f'], atmosphere: '#1a1119', material: 'polvo celeste' },
};
