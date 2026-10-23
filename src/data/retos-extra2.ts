/**
 * Segundo lote de retos extra (2 módulos nuevos por grado). Se añaden al final de cada grado,
 * así el progreso guardado no cambia. `npm run test:retos` verifica cada solución, en español e inglés.
 */
import { call, chg, fd, ifp, left, move, pen, prog, repeat, right, rotL, rotR, setv, until, vr, color } from '../play/ast';
import type { Module, Tool } from '../types';
import { BASIC, DRAW, FUN, LOOPS, NEST, VARS, cuadrado, maze, triangulo, turtle } from './retos';

// ───────────────────────── Laberintos generados (árboles sin ciclos: la regla de la mano siempre llega) ─────────────────────────
const M4_A = ['S....', '    .', 'G ...', '. .', '.....'];
const M4_B = ['S.... .', '    . .', '..G ...', '.     .', '.......'];
const M4_C = ['S.... *', '    . .', 'G.. ...', '  .   .', '....* .', '.     .', '.......'];
const M4_D = ['S...... .', '      . .', '. ... ...', '. . .   .', '. . .....', '. .', '........G'];
const M4_E = ['S.... G..', '    .   .', '*.. ... .', '  .   . .', '... ... .', '. . .   .', '. * . ...', '.   . . .', '....... *'];
const M6_A = ['S.... G..', '    .   .', '... ... .', '  .   . .', '... ... .', '. . .   .', '. . . ...', '.   . . .', '....... .'];
const M6_B = ['S.... *...G', '    .   .', '*.. ... ...', '  .   .   .', '... ... ...', '. . .   . .', '. * . ... .', '.   . .   .', '....... *..'];
const M6_C = ['S.... ....G', '    .   .', '... ... ...', '. .   .   .', '. . ... ...', '  . .   . .', '... . ... .', '.   .   . .', '..... ... .', '.     .   .', '....... ...'];
const M6_D = ['S.... *...G', '    .   .', '... ... ...', '. .   .   .', '* . ... ...', '  . .   . .', '... . *.. .', '.   .   . .', '..... ... .', '.     .   .', '....... *..'];
const M6_E = ['S...... ... *', '      . . . .', '..... ... ...', '.   .       .', '. *.. ... ...', '.     . . .', '. ..... . . G', '. .     . . .', '... *.. ... .', '.     .     .', '.............'];

const manoDerecha = () => prog([until(ifp('right', [right(), move()], [ifp('ahead', [move()], [left()])]))]);
const manoIzquierda = () => prog([until(ifp('left', [left(), move()], [ifp('ahead', [move()], [right()])]))]);
const DECIDE: Tool[] = ['move', 'turnL', 'turnR', 'until', 'ifelse'];
const LUP: Tool[] = [...LOOPS, 'until'];

// ───────────────────────── 1.° · Arregla al robot ─────────────────────────
export const g1Arregla: Module = {
  title: 'Arregla al robot',
  intro: 'El programa del robot tiene un fallo. ¡Encuentra qué bloque cambiar!',
  levels: [
    maze({
      debug: true, title: 'Falta un paso', prompt: 'El robot se queda corto. ¿Qué le falta?',
      concept: 'Contar los pasos', tools: BASIC, maze: { rows: ['S...G'] },
      start: prog([move(), move(), move()]), sol: prog([move(), move(), move(), move()]),
      hint: ['Cuenta las casillas hasta la meta.', 'El robot da tres pasos, pero hacen falta más.', 'Añade un bloque «avanzar».'],
    }),
    maze({
      debug: true, title: 'Giro al otro lado', prompt: 'El camino sube, pero el robot se choca. ¿Qué giro está mal?',
      concept: 'Izquierda o derecha', tools: BASIC, maze: { rows: ['  G', '  .', 'S..'] },
      start: prog([move(), move(), right(), move(), move()]), sol: prog([move(), move(), left(), move(), move()]),
      hint: ['Pulsa ▶ y mira dónde se choca.', 'El camino sube y el robot gira hacia abajo.', 'Cambia el giro a la derecha por uno a la izquierda.'],
    }),
    maze({
      debug: true, title: 'Sobra un giro', prompt: 'Hay un giro de más. Quítalo.',
      concept: 'Quitar lo que sobra', tools: BASIC, maze: { rows: ['S.', ' .', ' G'] },
      start: prog([move(), right(), right(), move(), move()]), sol: prog([move(), right(), move(), move()]),
      hint: ['Mira cuántos giros hay seguidos.', 'Dos giros seguidos hacen que el robot mire hacia atrás.', 'Quita uno de los giros.'],
    }),
    maze({
      debug: true, title: 'Orden equivocado', prompt: 'El robot gira antes de tiempo. Cambia el orden de los bloques.',
      concept: 'El orden importa', tools: BASIC, maze: { rows: ['S..', '  .', '  .', '  G'] },
      start: prog([right(), move(), move(), move(), move(), move()]), sol: prog([move(), move(), right(), move(), move(), move()]),
      hint: ['Antes de girar, el robot debe llegar a la esquina.', 'Ahora gira hacia una pared que no existe.', 'Pon dos «avanzar» antes del giro.'],
    }),
    maze({
      debug: true, title: 'Falta una estrella', prompt: 'El robot llega a la meta, pero se deja una estrella.',
      concept: 'Revisar todo el objetivo', tools: BASIC, maze: { rows: ['S.G', ' *.'] },
      start: prog([move(), move()]), sol: prog([move(), right(), move(), left(), move(), left(), move()]),
      hint: ['Pulsa ▶ y mira qué casilla se salta el robot.', 'La estrella está debajo del camino directo.', 'Baja a recoger la estrella y vuelve a subir hasta la meta.'],
    }),
  ],
};

// ───────────────────────── 1.° · Primeros dibujos ─────────────────────────
const D1: Tool[] = ['fd', 'rotL', 'rotR'];
export const g1Dibujos: Module = {
  title: 'Primeros dibujos',
  intro: 'La tortuga dibuja por donde pasa. Copia el dibujo fantasma, un trazo a la vez.',
  levels: [
    turtle({
      title: 'Línea larga', prompt: 'Haz que la tortuga dibuje la línea larga.',
      concept: 'Avanzar dibuja', tools: D1, sol: prog([fd(150)]),
      hint: ['La tortuga empieza mirando hacia arriba.', 'Usa un bloque «avanzar» con un número grande.', 'Avanzar 150.'],
    }),
    turtle({
      title: 'La letra L', prompt: 'Dibuja una L: sube y luego gira.',
      concept: 'Avanzar, girar y avanzar', tools: D1, sol: prog([fd(100), rotR(90), fd(60)]),
      hint: ['Primero sube 100.', 'Después gira a la derecha 90 grados.', 'Avanzar 100, derecha 90, avanzar 60.'],
    }),
    turtle({
      title: 'La letra T', prompt: 'Dibuja una T. Tendrás que volver sobre tus pasos.',
      concept: 'Girar a los dos lados', tools: D1, sol: prog([fd(100), rotL(90), fd(50), rotR(180), fd(100)]),
      hint: ['Sube 100 y gira a la izquierda para dibujar la mitad del palo de arriba.', 'Da media vuelta (180 grados) para dibujar la otra mitad.', 'Avanzar 100, izquierda 90, avanzar 50, derecha 180, avanzar 100.'],
    }),
    turtle({
      title: 'Escalera', prompt: 'Dibuja dos escalones iguales.',
      concept: 'Un patrón de pasos', tools: D1,
      sol: prog([fd(40), rotR(90), fd(40), rotL(90), fd(40), rotR(90), fd(40), rotL(90)]),
      hint: ['Cada escalón: sube, gira a la derecha, avanza y vuelve a mirar arriba.', 'Hay dos escalones iguales.', 'Avanzar 40, derecha 90, avanzar 40, izquierda 90, y otra vez.'],
    }),
    turtle({
      title: 'Mi cuadrado', prompt: 'Dibuja un cuadrado sin usar bucles: lado por lado.',
      concept: 'Cuatro lados iguales', tools: D1,
      sol: prog([fd(80), rotR(90), fd(80), rotR(90), fd(80), rotR(90), fd(80), rotR(90)]),
      hint: ['Un cuadrado tiene cuatro lados iguales.', 'Entre lado y lado la tortuga gira 90 grados.', 'Avanzar 80 y derecha 90, cuatro veces.'],
    }),
  ],
};

// ───────────────────────── 2.° · Más bucles ─────────────────────────
export const g2MasBucles: Module = {
  title: 'Más bucles',
  intro: 'Los caminos son más largos. ¡Un bucle te ahorra muchísimos bloques!',
  levels: [
    maze({
      title: 'Once pasos', prompt: 'Un camino larguísimo. ¿Cuántas veces repites «avanzar»?',
      concept: 'Repetir muchas veces', tools: LOOPS, maze: { rows: ['S..........G'] }, sol: prog([repeat(11, move())]), max: 3,
      hint: ['Cuenta las casillas entre el robot y la meta.', 'Pon «avanzar» dentro de «repetir».', 'Repetir 11 veces: avanzar.'],
    }),
    maze({
      title: 'U ancha', prompt: 'Da la vuelta en forma de U con tres tramos.',
      concept: 'Bucles y giros', tools: LOOPS, maze: { rows: ['S....', '    .', 'G....'] },
      sol: prog([repeat(4, move()), right(), repeat(2, move()), right(), repeat(4, move())]), max: 9,
      hint: ['El camino tiene tres tramos y dos giros a la derecha.', 'Usa un bucle para cada tramo.', 'Repetir 4 avanzar, derecha, repetir 2 avanzar, derecha, repetir 4 avanzar.'],
    }),
    maze({
      title: 'Escalera de cuatro', prompt: 'Cuatro escalones iguales: descubre el grupo que se repite.',
      concept: 'Repetir un grupo', tools: LOOPS, maze: { rows: ['S..', '  ...', '    ...', '      ...', '        G'] },
      sol: prog([repeat(4, move(), move(), right(), move(), left())]), max: 7,
      hint: ['Mira un escalón: dos pasos, bajar, un paso, volver.', 'Ese grupo de cinco bloques se repite cuatro veces.', 'Repetir 4: avanzar, avanzar, derecha, avanzar, izquierda.'],
    }),
    maze({
      title: 'Estrellas y esquina', prompt: 'Recoge todas las estrellas con dos bucles.',
      concept: 'Recoger y girar', tools: LOOPS, maze: { rows: ['S****', '    *', '    *', '    G'] },
      sol: prog([repeat(4, move()), right(), repeat(3, move())]), max: 6,
      hint: ['Cuatro pasos hacia la derecha, una esquina y tres hacia abajo.', 'Un bucle para cada tramo recto.', 'Repetir 4 avanzar, derecha, repetir 3 avanzar.'],
    }),
    maze({
      title: 'Alrededor del cuadrado', prompt: 'Rodea el cuadrado recogiendo todas las estrellas y termina en la meta.',
      concept: 'Planear con bucles', tools: LOOPS, maze: { rows: ['S***', 'G  *', '*  *', '****'] },
      sol: prog([repeat(3, move()), right(), repeat(3, move()), right(), repeat(3, move()), right(), repeat(2, move())]), max: 12,
      hint: ['Hay que dar la vuelta completa al cuadrado: la meta está debajo de la salida.', 'Tres lados de tres pasos y uno de dos, con tres giros.', 'Repetir 3 avanzar, derecha, ×3, y al final repetir 2 avanzar.'],
    }),
  ],
};

// ───────────────────────── 2.° · Dibujos que se repiten ─────────────────────────
const D2: Tool[] = [...DRAW, 'pen', 'color'];
export const g2Dibujos: Module = {
  title: 'Dibujos que se repiten',
  intro: 'Si el dibujo se repite, ¡un bucle lo dibuja por ti!',
  levels: [
    turtle({
      title: 'Línea punteada', prompt: 'Dibuja una línea de rayitas: dibuja, salta, dibuja, salta…',
      concept: 'Lápiz arriba y abajo', tools: D2, max: 6,
      sol: prog([repeat(4, fd(20), pen(false), fd(20), pen(true))]),
      hint: ['Cada rayita: avanzar con el lápiz abajo y luego avanzar con el lápiz arriba.', 'No olvides volver a bajar el lápiz.', 'Repetir 4: avanzar 20, lápiz arriba, avanzar 20, lápiz abajo.'],
    }),
    turtle({
      title: 'La cruz', prompt: 'Dibuja una cruz: cuatro brazos que salen del centro.',
      concept: 'Ir y volver', tools: D2, max: 6,
      sol: prog([repeat(4, fd(60), rotR(180), fd(60), rotR(90))]),
      hint: ['Cada brazo: avanzar, dar media vuelta y volver al centro.', 'Después gira un cuarto de vuelta para el siguiente brazo.', 'Repetir 4: avanzar 60, derecha 180, avanzar 60, derecha 90.'],
    }),
    turtle({
      title: 'El rombo', prompt: 'Un rombo tiene lados iguales, pero esquinas distintas.',
      concept: 'Dos giros que se alternan', tools: D2, max: 6,
      sol: prog([repeat(2, fd(70), rotR(60), fd(70), rotR(120))]),
      hint: ['Las esquinas del rombo son de dos tamaños: 60 y 120 grados.', 'El grupo «lado, giro, lado, giro» se repite dos veces.', 'Repetir 2: avanzar 70, derecha 60, avanzar 70, derecha 120.'],
    }),
    turtle({
      title: 'Franjas de colores', prompt: 'Una línea que cambia de color a cada tramo.',
      concept: 'Cambiar de color', tools: D2, max: 6,
      sol: prog([repeat(3, color('rojo'), fd(30), color('azul'), fd(30))]),
      hint: ['Cada vuelta usa dos colores.', 'Cambia el color antes de cada tramo.', 'Repetir 3: color rojo, avanzar 30, color azul, avanzar 30.'],
    }),
    turtle({
      title: 'Cuadrado girado', prompt: 'Un cuadrado inclinado, como un diamante.',
      concept: 'Girar antes de dibujar', tools: D2, max: 5,
      sol: prog([rotR(45), repeat(4, fd(60), rotR(90))]),
      hint: ['Es un cuadrado normal, pero la tortuga empieza girada.', 'Gira 45 grados antes del bucle.', 'Derecha 45, repetir 4: avanzar 60, derecha 90.'],
    }),
  ],
};

// ───────────────────────── 3.° · Laberintos con bucles ─────────────────────────
export const g3Laberintos: Module = {
  title: 'Laberintos con bucles',
  intro: 'Caminos más largos y complicados. Combina bucles y «repetir hasta la meta».',
  levels: [
    maze({
      title: 'La L larga', prompt: 'Un tramo larguísimo y otro más corto.',
      concept: 'Dos bucles', tools: LUP, maze: { rows: ['S......', '      .', '      .', '      G'] },
      sol: prog([repeat(6, move()), right(), repeat(3, move())]), max: 6,
      hint: ['Seis pasos hacia la derecha y tres hacia abajo.', 'Un bucle para cada tramo.', 'Repetir 6 avanzar, derecha, repetir 3 avanzar.'],
    }),
    maze({
      title: 'Escalera hasta la meta', prompt: 'No cuentes los escalones: ¡repite hasta llegar!',
      concept: 'Repetir hasta una condición', tools: LUP, maze: { rows: ['S..', '  ...', '    ...', '      ...', '        ...', '          G'] },
      sol: prog([until(move(), move(), right(), move(), left())]), max: 7,
      hint: ['Cada escalón es el mismo grupo de bloques.', 'Usa «repetir hasta la meta» con el escalón dentro.', 'Repetir hasta la meta: avanzar, avanzar, derecha, avanzar, izquierda.'],
    }),
    maze({
      title: 'U gigante', prompt: 'Tres tramos de cuatro pasos.',
      concept: 'Bucles y giros', tools: LUP, maze: { rows: ['S....', '    .', '    .', '    .', 'G....'] },
      sol: prog([repeat(4, move()), right(), repeat(4, move()), right(), repeat(4, move())]), max: 8,
      hint: ['Son tres tramos iguales con dos giros a la derecha.', 'Un bucle por cada tramo.', 'Repetir 4 avanzar, derecha, repetir 4 avanzar, derecha, repetir 4 avanzar.'],
    }),
    maze({
      title: 'Esquinas alternas', prompt: 'Dos pasos, derecha, dos pasos, izquierda… ¿hasta cuándo?',
      concept: 'Un patrón con dos giros', tools: LUP, maze: { rows: ['S..', '  .', '  ...', '    .', '    ...', '      .', '      G'] },
      sol: prog([until(move(), move(), right(), move(), move(), left())]), max: 8,
      hint: ['Mira el patrón: dos pasos, giro, dos pasos, giro contrario.', 'Se repite hasta llegar a la meta.', 'Repetir hasta la meta: avanzar ×2, derecha, avanzar ×2, izquierda.'],
    }),
    maze({
      title: 'Serpiente de estrellas', prompt: 'Recorre la serpiente recogiendo todas las estrellas.',
      concept: 'Planear un recorrido largo', tools: LUP, maze: { rows: ['S****', '    *', '*****', '*    ', '****G'] },
      sol: prog([repeat(4, move()), right(), repeat(2, move()), right(), repeat(4, move()), left(), repeat(2, move()), left(), repeat(4, move())]), max: 15,
      hint: ['El camino va a la derecha, baja, va a la izquierda, baja y va a la derecha.', 'Dos giros a la derecha y dos a la izquierda.', 'Repetir 4 avanzar, derecha, repetir 2, derecha, repetir 4, izquierda, repetir 2, izquierda, repetir 4.'],
    }),
  ],
};

// ───────────────────────── 3.° · Caza de errores ─────────────────────────
const L1 = { rows: ['S...', '   .', '   .', '   G'] };
const L2 = { rows: ['S..', '  .', 'G..'] };
const solL1 = () => prog([repeat(3, move()), right(), repeat(3, move())]);
const solL2 = () => prog([repeat(2, move()), right(), repeat(2, move()), right(), repeat(2, move())]);
export const g3Errores: Module = {
  title: 'Caza de errores',
  intro: 'Cada programa tiene un error escondido. Pruébalo, observa y arréglalo.',
  levels: [
    maze({
      debug: true, title: 'Giro del lado equivocado', prompt: 'El robot se choca en la esquina. ¿Qué cambia?',
      concept: 'Depurar una dirección', tools: LUP, maze: L1,
      start: prog([repeat(3, move()), left(), repeat(3, move())]), sol: solL1(),
      hint: ['Pulsa ▶ y mira dónde se choca.', 'El camino baja, pero el robot gira hacia arriba.', 'Cambia el giro a la izquierda por uno a la derecha.'],
    }),
    maze({
      debug: true, title: 'Bucles seguidos', prompt: 'Los dos bucles están pegados y el giro quedó al final.',
      concept: 'El orden importa', tools: LUP, maze: L1,
      start: prog([repeat(3, move()), repeat(3, move()), right()]), sol: solL1(),
      hint: ['Pulsa ▶ y mira qué hace el robot.', 'El giro debe ir entre los dos tramos.', 'Mueve el giro entre los dos bucles.'],
    }),
    maze({
      debug: true, title: 'Un paso corto', prompt: 'El robot se queda a un paso de la meta.',
      concept: 'Contar los pasos', tools: LUP, maze: L1,
      start: prog([repeat(3, move()), right(), repeat(2, move())]), sol: solL1(),
      hint: ['Cuenta las casillas del tramo que baja.', 'El segundo bucle repite menos veces de las necesarias.', 'Cambia el 2 por un 3.'],
    }),
    maze({
      debug: true, title: 'La segunda esquina', prompt: 'La primera esquina está bien, la segunda no.',
      concept: 'Depurar paso a paso', tools: LUP, maze: L2,
      start: prog([repeat(2, move()), right(), repeat(2, move()), left(), repeat(2, move())]), sol: solL2(),
      hint: ['Prueba el programa y mira en qué esquina se choca.', 'El camino da dos giros iguales.', 'Cambia el giro a la izquierda por uno a la derecha.'],
    }),
    maze({
      debug: true, title: 'Bucle con giro dentro', prompt: 'Alguien metió el giro dentro del bucle.',
      concept: 'Qué va dentro del bucle', tools: LUP, maze: L1,
      start: prog([repeat(3, move(), right())]), sol: solL1(),
      hint: ['Dentro del bucle, el robot gira después de cada paso.', 'El giro solo se necesita una vez.', 'Saca el giro del bucle y añade el segundo tramo.'],
    }),
  ],
};

// ───────────────────────── 4.° · Decisiones en laberintos ─────────────────────────
export const g4Decisiones: Module = {
  title: 'Decisiones en laberintos',
  intro: 'Un buen algoritmo resuelve cualquier laberinto. Prueba la regla de la mano.',
  levels: [
    maze({
      title: 'Pared a la derecha', prompt: 'Esta vez usa la mano derecha: sigue siempre la pared de la derecha.',
      concept: 'Regla de la mano derecha', tools: DECIDE, maze: { rows: M4_A },
      sol: manoDerecha(), max: 8,
      hint: ['Es como la regla de la izquierda, pero al revés.', 'Si hay camino a la derecha: gira a la derecha y avanza. Si no, avanza; si no puedes, gira a la izquierda.', 'Repetir hasta la meta: si derecha → derecha y avanzar; si no, si adelante → avanzar; si no, izquierda.'],
    }),
    maze({
      title: 'Callejón sin salida', prompt: 'El camino tiene callejones. La mano izquierda no se pierde.',
      concept: 'Un algoritmo para cualquier camino', tools: DECIDE, maze: { rows: M4_B },
      sol: manoIzquierda(), max: 8,
      hint: ['Si el robot llega a un callejón, da la vuelta solo.', 'Si hay camino a la izquierda, tómalo siempre.', 'Repetir hasta la meta: si izquierda → izquierda y avanzar; si no, si adelante → avanzar; si no, derecha.'],
    }),
    maze({
      title: 'Recoge las estrellas', prompt: 'Las estrellas están en los callejones. ¡Recógelas todas!',
      concept: 'Explorar todo el laberinto', tools: DECIDE, maze: { rows: M4_C },
      sol: manoDerecha(), max: 8,
      hint: ['La regla de la mano recorre todos los callejones.', 'El robot solo termina si llega a la meta con todas las estrellas.', 'Repetir hasta la meta: si derecha → derecha y avanzar; si no, si adelante → avanzar; si no, izquierda.'],
    }),
    maze({
      title: 'Laberinto largo', prompt: 'Un laberinto más grande. El mismo programa lo resuelve.',
      concept: 'Un programa, muchos laberintos', tools: DECIDE, maze: { rows: M4_D },
      sol: manoIzquierda(), max: 8,
      hint: ['No cambies la idea: cambia solo el laberinto.', 'Un buen programa no depende del tamaño.', 'Repetir hasta la meta: si izquierda → izquierda y avanzar; si no, si adelante → avanzar; si no, derecha.'],
    }),
    maze({
      title: 'Laberinto con tesoros', prompt: 'El laberinto más grande de este módulo, con estrellas escondidas.',
      concept: 'Reutilizar una buena idea', tools: DECIDE, maze: { rows: M4_E },
      sol: manoDerecha(), max: 8,
      hint: ['Es el mismo truco de la mano derecha.', 'Se recogen todas las estrellas sin cambiar nada.', 'Repetir hasta la meta: si derecha → derecha y avanzar; si no, si adelante → avanzar; si no, izquierda.'],
    }),
  ],
};

// ───────────────────────── 4.° · Variables que cambian ─────────────────────────
export const g4Cambian: Module = {
  title: 'Variables que cambian',
  intro: 'Una variable puede crecer en cada vuelta. ¡Así se dibujan figuras que se agrandan!',
  levels: [
    turtle({
      title: 'Triángulos que crecen', prompt: 'Cinco triángulos que salen de la misma esquina, cada uno más grande.',
      concept: 'Variable que crece', tools: VARS, vars: ['lado'], max: 8,
      sol: prog([setv('lado', 12), repeat(5, repeat(3, fd(vr('lado')), rotR(120)), chg('lado', 12))]),
      hint: ['Dentro: un triángulo con la caja «lado».', 'Fuera: repetir 5 veces y sumar 12 al lado.', 'Fijar lado 12; repetir 5: [repetir 3: avanzar lado, derecha 120], cambiar lado en 12.'],
    }),
    turtle({
      title: 'Cuadrados anidados', prompt: 'Cinco cuadrados, uno dentro del otro.',
      concept: 'Bucle y variable juntos', tools: VARS, vars: ['lado'], max: 8,
      sol: prog([setv('lado', 20), repeat(5, repeat(4, fd(vr('lado')), rotR(90)), chg('lado', 20))]),
      hint: ['Dentro: un cuadrado con la caja «lado».', 'Fuera: repetir 5 veces y sumar 20 al lado.', 'Fijar lado 20; repetir 5: [repetir 4: avanzar lado, derecha 90], cambiar lado en 20.'],
    }),
    turtle({
      title: 'Rayos que crecen', prompt: 'Seis rayos desde el centro, cada uno más largo que el anterior.',
      concept: 'Cambiar una variable en cada vuelta', tools: VARS, vars: ['largo'], max: 10,
      sol: prog([setv('largo', 20), repeat(6, fd(vr('largo')), rotR(180), fd(vr('largo')), rotR(120), chg('largo', 10))]),
      hint: ['Cada rayo: avanzar, dar media vuelta y volver al centro.', 'Después gira 120 y suma 10 al largo.', 'Fijar largo 20; repetir 6: avanzar largo, derecha 180, avanzar largo, derecha 120, cambiar largo en 10.'],
    }),
    turtle({
      title: 'Pentágono ajustable', prompt: 'Guarda el lado y el ángulo en dos cajas para dibujar un pentágono.',
      concept: 'Varias variables', tools: VARS, vars: ['lado', 'angulo'], max: 8,
      sol: prog([setv('lado', 70), setv('angulo', 72), repeat(5, fd(vr('lado')), rotR(vr('angulo')))]),
      hint: ['Un pentágono tiene cinco lados: 360 ÷ 5 = 72 grados de giro.', 'Fija las dos cajas y usa las dos dentro del bucle.', 'Fijar lado 70; fijar angulo 72; repetir 5: avanzar lado, derecha angulo.'],
    }),
    turtle({
      debug: true, title: 'Ángulo equivocado', prompt: 'El cuadrado se queda abierto. ¿Qué número de la caja está mal?',
      concept: 'Depurar una variable', tools: VARS, vars: ['lado', 'angulo'],
      start: prog([setv('lado', 60), setv('angulo', 60), repeat(4, fd(vr('lado')), rotR(vr('angulo')))]),
      sol: prog([setv('lado', 60), setv('angulo', 90), repeat(4, fd(vr('lado')), rotR(vr('angulo')))]),
      hint: ['Un cuadrado tiene esquinas de 90 grados.', 'Mira el número que guarda la caja «angulo».', 'Cámbialo por 90.'],
    }),
  ],
};

// ───────────────────────── 5.° · Funciones en el laberinto ─────────────────────────
const FL: Tool[] = [...LOOPS, 'proc'];
const ESC = [move(), right(), move(), left()];
export const g5FuncLaberinto: Module = {
  title: 'Funciones en el laberinto',
  intro: 'Guarda en una función un grupo de órdenes del robot y úsalo cuando quieras.',
  levels: [
    maze({
      title: 'Escalón en una función', prompt: 'La función «escalon» ya está definida. Llámala tres veces.',
      concept: 'Llamar a una función', tools: FL, maze: { rows: ['S.', ' ..', '  ..', '   G'] },
      start: prog([], { escalon: ESC }), sol: prog([call('escalon'), call('escalon'), call('escalon')], { escalon: ESC }),
      hint: ['Busca «escalon» en el grupo Funciones.', 'Cada llamada sube un escalón.', 'Llamar a escalon tres veces.'],
    }),
    maze({
      title: 'Define el escalón', prompt: 'Escribe lo que hace «escalon» y repítela cuatro veces.',
      concept: 'Definir y repetir', tools: FL, maze: { rows: ['S.', ' ..', '  ..', '   ..', '    G'] },
      start: prog([], { escalon: [] }), sol: prog([repeat(4, call('escalon'))], { escalon: ESC }), max: 8,
      hint: ['Un escalón: avanzar, derecha, avanzar, izquierda.', 'Dentro de «definir escalon» van esos cuatro bloques.', 'Define escalon con avanzar, derecha, avanzar, izquierda y repite 4 veces su llamada.'],
    }),
    maze({
      title: 'Un lado, tres veces', prompt: 'Recorre el cuadrado y recoge todas las estrellas: define «lado» con dos pasos.',
      concept: 'Reutilizar una función', tools: FL, maze: { rows: ['S**', 'G *', '***'] },
      start: prog([], { lado: [] }),
      sol: prog([call('lado'), right(), call('lado'), right(), call('lado'), right(), move()], { lado: [move(), move()] }), max: 11,
      hint: ['Cada lado del cuadrado mide dos pasos.', 'Define «lado» con dos «avanzar» y gira a la derecha entre llamadas.', 'lado, derecha, lado, derecha, lado, derecha, avanzar.'],
    }),
    maze({
      title: 'Muchos escalones', prompt: 'Seis escalones: ¡una función y un bucle!',
      concept: 'Función dentro de un bucle', tools: FL, maze: { rows: ['S.', ' ..', '  ..', '   ..', '    ..', '     ..', '      G'] },
      start: prog([], { escalon: ESC }), sol: prog([repeat(6, call('escalon'))], { escalon: ESC }), max: 8,
      hint: ['La función ya está lista.', 'Llámala dentro de un «repetir».', 'Repetir 6: llamar a escalon.'],
    }),
    maze({
      title: 'Sube y baja', prompt: 'Define «baja» y combina las dos funciones para llegar a la meta.',
      concept: 'Dos funciones juntas', tools: FL, maze: { rows: [' ....', 'S...G'] },
      start: prog([], { sube: [move(), left(), move(), right()], baja: [] }),
      sol: prog([repeat(2, call('sube'), call('baja'))], { sube: [move(), left(), move(), right()], baja: [move(), right(), move(), left()] }), max: 14,
      hint: ['«baja» es el espejo de «sube»: los giros cambian de lado.', 'Avanzar, derecha, avanzar, izquierda.', 'Define baja con avanzar, derecha, avanzar, izquierda. Luego repetir 2: sube, baja.'],
    }),
  ],
};

// ───────────────────────── 5.° · Dibujos con funciones ─────────────────────────
const FD5: Tool[] = [...FUN, 'pen'];
export const g5Dibujos: Module = {
  title: 'Dibujos con funciones',
  intro: 'Inventa funciones y úsalas como piezas para dibujos cada vez más grandes.',
  levels: [
    turtle({
      title: 'Triángulos en estrella', prompt: 'Llama a «triangulo» seis veces, girando entre cada uno.',
      concept: 'Función dentro de un bucle', tools: FD5, max: 8,
      start: prog([], { triangulo: triangulo(50) }),
      sol: prog([repeat(6, call('triangulo'), rotR(60))], { triangulo: triangulo(50) }),
      hint: ['Dentro de un bucle llama a «triangulo».', 'Seis triángulos dan la vuelta: 360 ÷ 6 grados.', 'Repetir 6: llamar a triangulo, derecha 60.'],
    }),
    turtle({
      title: 'Fila de cuadrados', prompt: 'Cuatro cuadrados en fila. Levanta el lápiz para moverte entre ellos.',
      concept: 'Funciones y lápiz', tools: FD5, max: 11,
      start: prog([], { cuadrado: cuadrado(30) }),
      sol: prog([rotR(90), repeat(4, call('cuadrado'), pen(false), fd(50), pen(true))], { cuadrado: cuadrado(30) }),
      hint: ['Gira para mirar a la derecha antes de empezar.', 'Cada vuelta: dibuja el cuadrado, sube el lápiz, avanza y bájalo.', 'Derecha 90; repetir 4: cuadrado, lápiz arriba, avanzar 50, lápiz abajo.'],
    }),
    turtle({
      title: 'Define la punta', prompt: 'Una estrella de cinco puntas: define «punta» y repítela.',
      concept: 'Definir una función pequeña', tools: FD5, max: 6,
      start: prog([], { punta: [] }), sol: prog([repeat(5, call('punta'))], { punta: [fd(80), rotR(144)] }),
      hint: ['Cada punta es un lado largo y un giro grande.', 'Dentro de «punta»: avanzar 80 y derecha 144.', 'Define punta con avanzar 80, derecha 144; repetir 5: llamar a punta.'],
    }),
    turtle({
      title: 'Flor de estrellas', prompt: 'Usa la función «estrella» seis veces girada para formar una flor.',
      concept: 'Función y giro', tools: FD5, max: 8,
      start: prog([], { estrella: [repeat(5, fd(50), rotR(144))] }),
      sol: prog([repeat(6, call('estrella'), rotR(60))], { estrella: [repeat(5, fd(50), rotR(144))] }),
      hint: ['Llama a «estrella» dentro de un bucle.', 'Después de cada estrella gira 60 grados.', 'Repetir 6: llamar a estrella, derecha 60.'],
    }),
    turtle({
      title: 'Torre de cuadrados', prompt: 'Define «torre» con tres cuadrados apilados, usando la función «cuadrado».',
      concept: 'Funciones que usan funciones', tools: FD5, max: 10,
      start: prog([], { cuadrado: cuadrado(40), torre: [] }),
      sol: prog([call('torre')], { cuadrado: cuadrado(40), torre: [repeat(3, call('cuadrado'), fd(40))] }),
      hint: ['Dentro de «torre» puedes llamar a «cuadrado».', 'Dibuja un cuadrado, sube 40 y repite.', 'Define torre con repetir 3: cuadrado, avanzar 40. Luego llámala.'],
    }),
  ],
};

// ───────────────────────── 6.° · Algoritmos de laberinto ─────────────────────────
export const g6Algoritmos: Module = {
  title: 'Algoritmos de laberinto',
  intro: 'Los laberintos grandes se resuelven con una regla corta y bien pensada.',
  levels: [
    maze({
      title: 'Mano derecha, laberinto grande', prompt: 'Resuelve este laberinto con la regla de la mano derecha.',
      concept: 'Algoritmo de seguir la pared', tools: DECIDE, maze: { rows: M6_A },
      sol: manoDerecha(), max: 8,
      hint: ['Prioridad: derecha, adelante, izquierda.', 'Si hay camino a la derecha, tómalo; si no, avanza; si no, gira a la izquierda.', 'Repetir hasta la meta: si derecha → derecha y avanzar; si no, si adelante → avanzar; si no, izquierda.'],
    }),
    maze({
      title: 'Estrellas en los callejones', prompt: 'Con la mano izquierda, recoge todas las estrellas y llega a la meta.',
      concept: 'Explorar sin perderse', tools: DECIDE, maze: { rows: M6_B },
      sol: manoIzquierda(), max: 8,
      hint: ['La regla de la mano recorre cada callejón.', 'Si hay camino a la izquierda: gira y avanza.', 'Repetir hasta la meta: si izquierda → izquierda y avanzar; si no, si adelante → avanzar; si no, derecha.'],
    }),
    maze({
      title: 'Sin bloques de sobra', prompt: 'Resuelve el laberinto con el programa más corto posible.',
      concept: 'Eficiencia', tools: DECIDE, maze: { rows: M6_C },
      sol: manoDerecha(), max: 7,
      hint: ['Solo necesitas un bucle y dos decisiones.', 'No repitas bloques que no hacen falta.', 'Repetir hasta la meta: si derecha → derecha y avanzar; si no, si adelante → avanzar; si no, izquierda (7 bloques).'],
    }),
    maze({
      title: 'El gran laberinto de estrellas', prompt: 'Un laberinto enorme con estrellas escondidas.',
      concept: 'Un algoritmo, cualquier tamaño', tools: DECIDE, maze: { rows: M6_D },
      sol: manoIzquierda(), max: 8,
      hint: ['La misma regla sirve aunque el laberinto sea enorme.', 'Recoge las estrellas sin cambiar el programa.', 'Repetir hasta la meta: si izquierda → izquierda y avanzar; si no, si adelante → avanzar; si no, derecha.'],
    }),
    maze({
      title: 'El laberinto final', prompt: 'El más grande de todos. Demuestra que tu algoritmo funciona.',
      concept: 'Probar un algoritmo', tools: DECIDE, maze: { rows: M6_E },
      sol: manoDerecha(), max: 8,
      hint: ['Confía en tu regla: ya sabes que funciona.', 'Prioridad: derecha, adelante, izquierda.', 'Repetir hasta la meta: si derecha → derecha y avanzar; si no, si adelante → avanzar; si no, izquierda.'],
    }),
  ],
};

// ───────────────────────── 6.° · Espirógrafos ─────────────────────────
const SP: Tool[] = [...NEST, 'vars'];
export const g6Espirografos: Module = {
  title: 'Espirógrafos',
  intro: 'Con bucles dentro de bucles y variables, la tortuga dibuja flores, círculos y estrellas.',
  levels: [
    turtle({
      title: 'Flor de pétalos', prompt: 'Cada pétalo son dos arcos. Seis pétalos forman una flor.',
      concept: 'Tres bucles anidados', tools: SP, max: 8,
      sol: prog([repeat(6, repeat(2, repeat(9, fd(8), rotR(10)), rotR(90)), rotR(60))]),
      hint: ['Un arco son muchos pasos cortos con un giro pequeño.', 'Un pétalo son dos arcos con un giro de 90 entre ellos; la flor son seis pétalos.', 'Repetir 6: [repetir 2: [repetir 9: avanzar 8, derecha 10], derecha 90], derecha 60.'],
    }),
    turtle({
      title: 'Círculo de círculos', prompt: 'Doce círculos girados forman una rueda.',
      concept: 'Un círculo es un polígono de muchos lados', tools: SP, max: 6,
      sol: prog([repeat(12, repeat(36, fd(5), rotR(10)), rotR(30))]),
      hint: ['Un círculo: 36 pasos cortos con un giro de 10 grados.', 'Repite el círculo 12 veces, girando 360 ÷ 12.', 'Repetir 12: [repetir 36: avanzar 5, derecha 10], derecha 30.'],
    }),
    turtle({
      title: 'Espiral que crece', prompt: 'Una espiral que se abre en cada giro.',
      concept: 'Variable en un bucle', tools: SP, vars: ['lado'], max: 7,
      sol: prog([setv('lado', 2), repeat(30, fd(vr('lado')), rotR(20), chg('lado', 1))]),
      hint: ['Empieza con un lado muy pequeño: 2.', 'En cada vuelta avanza, gira 20 grados y suma 1 al lado.', 'Fijar lado 2; repetir 30: avanzar lado, derecha 20, cambiar lado en 1.'],
    }),
    turtle({
      title: 'Estrella de ocho puntas', prompt: 'Una estrella que se cierra después de ocho lados largos.',
      concept: 'Ángulos de estrella', tools: SP, max: 4,
      sol: prog([repeat(8, fd(90), rotR(135))]),
      hint: ['Son ocho lados iguales.', 'Cada giro es de 135 grados.', 'Repetir 8: avanzar 90, derecha 135.'],
    }),
    turtle({
      title: 'Anillo de pentágonos', prompt: 'Diez pentágonos girados forman un anillo.',
      concept: 'Cambiar la figura de dentro', tools: SP, max: 6,
      sol: prog([repeat(10, repeat(5, fd(40), rotR(72)), rotR(36))]),
      hint: ['Un pentágono: 5 veces avanzar y girar 72.', 'Repítelo 10 veces girando 360 ÷ 10.', 'Repetir 10: [repetir 5: avanzar 40, derecha 72], derecha 36.'],
    }),
  ],
};
