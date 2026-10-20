export type WorldVisual = {
  name: string;
  palette: [string, string];
  atmosphere: string;
  material: string;
};

/** Decorative art direction only. Curriculum and grade data stay in data/grados. */
export const worldVisuals: Record<number, WorldVisual> = {
  1: { name: 'Cristal', palette: ['#f3b879', '#f27b63'], atmosphere: '#17100e', material: 'vidrio cálido' },
  2: { name: 'Bosque de luz', palette: ['#b9df86', '#68c49d'], atmosphere: '#0d1913', material: 'luz viva' },
  3: { name: 'Aurora', palette: ['#b9a0ed', '#72d7c6'], atmosphere: '#15121d', material: 'ondas de aurora' },
  4: { name: 'Circuito', palette: ['#8dc4e8', '#91dfc6'], atmosphere: '#0d1720', material: 'cerámica conductora' },
  5: { name: 'Cobre', palette: ['#df9867', '#e1bd78'], atmosphere: '#1b1410', material: 'metal satinado' },
  6: { name: 'Nébula', palette: ['#e493af', '#e5c87f'], atmosphere: '#1a1119', material: 'polvo celeste' },
};
