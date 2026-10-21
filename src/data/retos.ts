/**
 * Retos con bloques de IscoLab: laberinto del robot y dibujo con la tortuga.
 *
 * Cada reto trae su solución de referencia (`sol`) escrita con el árbol de programa.
 * Las pruebas automáticas (`npm run test:retos`) comprueban que TODOS los retos se
 * pueden resolver y que los de depuración empiezan con un programa que falla.
 */
import { call, chg, fd, ifp, left, move, pen, prog, repeat, right, rotL, rotR, setv, until, vr } from '../play/ast';
import type { Level, Module, Tool } from '../types';

export const BASIC: Tool[] = ['move', 'turnL', 'turnR'];
export const LOOPS: Tool[] = [...BASIC, 'repeat'];
export const DRAW: Tool[] = ['fd', 'rotL', 'rotR', 'repeat'];

export const maze = (o: Omit<Level, 'mechanic'>): Level => ({ mechanic: 'maze', ...o });
export const turtle = (o: Omit<Level, 'mechanic'>): Level => ({ mechanic: 'turtle', ...o });

// ───────────────────────── 1.° · Robot de paseo ─────────────────────────
export const g1Robot: Module = {
  title: 'Robot de paseo',
  intro: 'Dale órdenes al robot con bloques para llevarlo hasta la meta.',
  levels: [
    maze({
      title: 'Un paso adelante', prompt: 'Arrastra el bloque «avanzar» y pulsa ▶ para llevar al robot hasta la meta.',
      concept: 'Una instrucción a la vez', tools: BASIC, maze: { rows: ['SG'] }, sol: prog([move()]),
      hint: ['La meta está justo delante del robot.', 'Arrastra un bloque «avanzar» debajo de «al empezar».', 'Solo necesitas un bloque: avanzar.'],
    }),
    maze({
      title: 'Camino recto', prompt: 'El robot debe caminar hasta la meta. ¿Cuántos pasos hay?',
      concept: 'Secuencia de pasos', tools: BASIC, maze: { rows: ['S..G'] }, sol: prog([move(), move(), move()]),
      hint: ['Cuenta las casillas entre el robot y la meta.', 'Cada bloque «avanzar» mueve al robot una casilla.', 'Necesitas tres bloques «avanzar».'],
    }),
    maze({
      title: 'Primera esquina', prompt: 'El camino dobla. Usa un giro para seguirlo.',
      concept: 'Girar a la derecha', tools: BASIC, maze: { rows: ['S..', '  .', '  G'] },
      sol: prog([move(), move(), right(), move(), move()]),
      hint: ['Primero avanza hasta la esquina.', 'En la esquina el camino baja: gira a la derecha.', 'Avanzar, avanzar, girar a la derecha, avanzar, avanzar.'],
    }),
    maze({
      title: 'Zigzag', prompt: 'Sube y baja por el camino sin salirte.',
      concept: 'Girar a un lado y al otro', tools: BASIC, maze: { rows: ['S.', ' .', ' ..G'] },
      sol: prog([move(), right(), move(), move(), left(), move(), move()]),
      hint: ['El camino baja y después vuelve a ir hacia la derecha.', 'Un giro a la derecha para bajar y uno a la izquierda para volver.', 'Avanzar, derecha, avanzar ×2, izquierda, avanzar ×2.'],
    }),
    maze({
      title: 'La estrella', prompt: 'Recoge la estrella y llega a la meta.',
      concept: 'Planear el recorrido', tools: BASIC, maze: { rows: ['S.*.', '   .', '   G'] },
      sol: prog([move(), move(), move(), right(), move(), move()]),
      hint: ['Para recoger la estrella el robot debe pasar por encima.', 'Después de la estrella sigue hasta la esquina y baja.', 'Avanzar ×3, girar a la derecha, avanzar ×2.'],
    }),
  ],
};

// ───────────────────────── 2.° · Robot entre rocas ─────────────────────────
export const g2Rocas: Module = {
  title: 'Robot entre rocas',
  intro: 'Las rocas cierran el paso. Busca la ruta y aprende a no repetir órdenes.',
  levels: [
    maze({
      title: 'Rodea las rocas', prompt: 'Sigue el sendero de piedra con cuidado.',
      concept: 'Seguir un camino', tools: BASIC, maze: { rows: ['S.', ' ..', '  G'] },
      sol: prog([move(), right(), move(), left(), move(), right(), move()]),
      hint: ['El sendero baja y avanza como una escalera.', 'Alterna: avanzar, girar a la derecha, avanzar, girar a la izquierda…', 'Avanzar, derecha, avanzar, izquierda, avanzar, derecha, avanzar.'],
    }),
    maze({
      title: 'Camino en U', prompt: 'Da la vuelta por el sendero hasta la meta.',
      concept: 'Dos giros iguales', tools: BASIC, maze: { rows: ['S..', '  .', 'G..'] },
      sol: prog([move(), move(), right(), move(), move(), right(), move(), move()]),
      hint: ['El camino hace una «U».', 'Gira a la derecha dos veces: una al bajar y otra al volver.', 'Avanzar ×2, derecha, avanzar ×2, derecha, avanzar ×2.'],
    }),
    maze({
      title: 'Repite pasos', prompt: 'Son muchos pasos iguales. Usa «repetir» para escribir menos.',
      concept: 'Repetir en vez de copiar', tools: LOOPS, maze: { rows: ['S.....G'] }, sol: prog([repeat(6, move())]), max: 3,
      hint: ['Cuenta las casillas: son seis.', 'Pon el bloque «avanzar» dentro de «repetir».', 'Repetir 6 veces: avanzar.'],
    }),
    maze({
      title: 'Escalera de piedra', prompt: 'La escalera repite el mismo patrón. ¡Descubre cuál!',
      concept: 'Encontrar el patrón', tools: LOOPS, maze: { rows: ['S.', ' ..', '  ..', '   G'] },
      sol: prog([repeat(3, move(), right(), move(), left())]), max: 6,
      hint: ['Mira un escalón: avanzar, bajar, avanzar, volver.', 'Ese grupo de cuatro bloques se repite tres veces.', 'Repetir 3: avanzar, derecha, avanzar, izquierda.'],
    }),
    maze({
      title: 'Rectángulo de estrellas', prompt: 'Recoge todas las estrellas y termina en la meta.',
      concept: 'Repetir partes del camino', tools: LOOPS, maze: { rows: ['S***', 'G***'] },
      sol: prog([repeat(3, move()), right(), move(), right(), repeat(3, move())]), max: 8,
      hint: ['El camino da una vuelta en forma de rectángulo.', 'Hay dos tramos largos de tres pasos: usa «repetir».', 'Repetir 3 avanzar, derecha, avanzar, derecha, repetir 3 avanzar.'],
    }),
  ],
};

// ───────────────────────── 2.° · Detectives de errores ─────────────────────────
export const g2Detectives: Module = {
  title: 'Detectives de errores',
  intro: 'El programa ya está armado, pero tiene un fallo. ¡Encuéntralo y arréglalo!',
  levels: [
    maze({
      debug: true, title: 'Giro equivocado', prompt: 'El robot se choca. ¿Qué bloque está mal?',
      concept: 'Un giro en el lado equivocado', tools: LOOPS, maze: { rows: ['S..', '  .', '  G'] },
      start: prog([move(), move(), left(), move(), move()]), sol: prog([move(), move(), right(), move(), move()]),
      hint: ['Pulsa ▶ y mira dónde se choca el robot.', 'El camino baja, pero el robot gira hacia arriba.', 'Cambia el giro a la izquierda por un giro a la derecha.'],
    }),
    maze({
      debug: true, title: 'Falta un paso', prompt: 'El robot se queda corto. ¿Qué le falta?',
      concept: 'Contar bien los pasos', tools: LOOPS, maze: { rows: ['S...G'] },
      start: prog([move(), move(), move()]), sol: prog([move(), move(), move(), move()]),
      hint: ['Cuenta las casillas hasta la meta.', 'El robot da tres pasos, pero hacen falta más.', 'Añade un bloque «avanzar» al final.'],
    }),
    maze({
      debug: true, title: 'Giro de más', prompt: 'Hay un giro que sobra. Quítalo.',
      concept: 'Quitar lo que sobra', tools: LOOPS, maze: { rows: ['S..', '  .', '  G'] },
      start: prog([move(), move(), right(), right(), move(), move()]), sol: prog([move(), move(), right(), move(), move()]),
      hint: ['Fíjate en cuántos giros hay seguidos.', 'Dos giros seguidos hacen que el robot mire hacia atrás.', 'Quita uno de los giros a la derecha.'],
    }),
    maze({
      debug: true, title: 'Orden equivocado', prompt: 'Los bloques están desordenados. ¿Cuál va primero?',
      concept: 'El orden importa', tools: LOOPS, maze: { rows: ['S.', ' .', ' .', ' G'] },
      start: prog([right(), move(), move(), move(), move()]), sol: prog([move(), right(), move(), move(), move()]),
      hint: ['Antes de girar, el robot tiene que llegar a la esquina.', 'Ahora gira hacia una pared que no existe.', 'Mueve el bloque «avanzar» antes del giro.'],
    }),
    maze({
      debug: true, title: 'Contador mal puesto', prompt: 'La escalera tiene un escalón menos de lo necesario.',
      concept: 'Arreglar un número', tools: LOOPS, maze: { rows: ['S.', ' ..', '  ..', '   G'] },
      start: prog([repeat(2, move(), right(), move(), left())]), sol: prog([repeat(3, move(), right(), move(), left())]),
      hint: ['Cuenta cuántos escalones tiene la escalera.', 'El bloque «repetir» tiene un número: ¿es el correcto?', 'Cambia el 2 por un 3.'],
    }),
  ],
};

// ───────────────────────── 3.° · Bucles y repeticiones ─────────────────────────
export const g3Bucles: Module = {
  title: 'Bucles y repeticiones',
  intro: 'Un bucle repite instrucciones: haz más con menos bloques.',
  levels: [
    maze({
      title: 'Repite cuatro', prompt: 'Llega a la meta usando un solo bucle.',
      concept: 'Repetición contada', tools: LOOPS, maze: { rows: ['S...G'] }, sol: prog([repeat(4, move())]), max: 3,
      hint: ['Cuenta cuántos pasos da el robot.', 'Pon «avanzar» dentro de «repetir».', 'Repetir 4 veces: avanzar.'],
    }),
    maze({
      title: 'Esquinas iguales', prompt: 'El robot hace «dos pasos y gira» varias veces.',
      concept: 'Un patrón que se repite', tools: LOOPS, maze: { rows: ['S..', '  .', 'G..'] },
      sol: prog([repeat(2, move(), move(), right()), move(), move()]), max: 7,
      hint: ['Busca el grupo que se repite al principio del camino.', 'Dos pasos y un giro a la derecha, dos veces.', 'Repetir 2: avanzar, avanzar, derecha. Luego avanzar ×2.'],
    }),
    maze({
      title: 'Zigzag largo', prompt: 'Cuatro escalones iguales te llevan a la meta.',
      concept: 'Bucle con varios bloques', tools: LOOPS, maze: { rows: ['S.', ' ..', '  ..', '   ..', '    G'] },
      sol: prog([repeat(4, move(), right(), move(), left())]), max: 6,
      hint: ['Cada escalón es: avanzar, derecha, avanzar, izquierda.', 'Ese grupo se repite cuatro veces.', 'Repetir 4: avanzar, derecha, avanzar, izquierda.'],
    }),
    maze({
      title: 'Dos bucles', prompt: 'Dos tramos largos y una esquina: ¡dos bucles!',
      concept: 'Varios bucles en un programa', tools: LOOPS, maze: { rows: ['S...', '   .', '   .', '   G'] },
      sol: prog([repeat(3, move()), right(), repeat(3, move())]), max: 6,
      hint: ['Hay tres pasos, una esquina y otros tres pasos.', 'Usa un bucle para cada tramo recto.', 'Repetir 3 avanzar, derecha, repetir 3 avanzar.'],
    }),
    maze({
      title: 'Hasta la meta', prompt: 'No sabes cuántas veces repetir: ¡repite hasta llegar!',
      concept: 'Repetir hasta una condición', tools: [...LOOPS, 'until'], maze: { rows: ['S...', '   .', 'G  .', '....'] },
      sol: prog([until(move(), move(), move(), right())]), max: 6,
      hint: ['El camino da la vuelta a un cuadrado grande.', 'Usa «repetir hasta la meta» con «avanzar» tres veces y un giro.', 'Repetir hasta la meta: avanzar ×3, derecha.'],
    }),
  ],
};

// ───────────────────────── 3.° · Depuración paso a paso ─────────────────────────
export const g3Depuracion: Module = {
  title: 'Depuración paso a paso',
  intro: 'Depurar es buscar y arreglar errores. ¡Un buen programador prueba, mira y corrige!',
  levels: [
    maze({
      debug: true, title: 'Un paso perdido', prompt: 'El robot no llega. Revisa el número del bucle.',
      concept: 'Depurar un contador', tools: LOOPS, maze: { rows: ['S.....G'] },
      start: prog([repeat(4, move())]), sol: prog([repeat(6, move())]),
      hint: ['Cuenta cuántas casillas hay hasta la meta.', 'El bucle repite menos veces de las necesarias.', 'Cambia el número a 6.'],
    }),
    maze({
      debug: true, title: 'Falta el giro', prompt: 'El escalón está incompleto. ¿Qué bloque falta dentro del bucle?',
      concept: 'Completar un bucle', tools: LOOPS, maze: { rows: ['S.', ' ..', '  ..', '   G'] },
      start: prog([repeat(3, move(), right(), move())]), sol: prog([repeat(3, move(), right(), move(), left())]),
      hint: ['Prueba un solo escalón: ¿hacia dónde mira el robot al terminar?', 'Después de bajar tiene que volver a mirar a la derecha.', 'Añade un giro a la izquierda al final del bucle.'],
    }),
    maze({
      debug: true, title: 'Giro al revés', prompt: 'El robot da la vuelta al lado contrario.',
      concept: 'Depurar una dirección', tools: [...LOOPS, 'until'], maze: { rows: ['S G', '. .', '...'], dir: 'S' },
      start: prog([until(move(), move(), right())]), sol: prog([until(move(), move(), left())]),
      hint: ['El robot empieza mirando hacia abajo.', 'Observa hacia qué lado dobla el camino.', 'Cambia el giro a la derecha por uno a la izquierda.'],
    }),
    maze({
      debug: true, title: 'Bloques desordenados', prompt: 'Los bloques dentro del bucle están en mal orden.',
      concept: 'Ordenar las instrucciones', tools: [...LOOPS, 'until'], maze: { rows: ['S...', '   .', 'G  .', '....'] },
      start: prog([until(right(), move(), move(), move())]), sol: prog([until(move(), move(), move(), right())]),
      hint: ['Pulsa ▶ y mira qué hace el robot al principio.', 'Primero debe caminar y después girar.', 'Pon los tres «avanzar» antes del giro.'],
    }),
    maze({
      debug: true, title: 'Giro equivocado', prompt: 'Uno de los dos giros va al lado contrario.',
      concept: 'Pruebas y correcciones', tools: [...LOOPS, 'until'], maze: { rows: ['S.', ' ..', '  ..', '   ..', '    G'] },
      start: prog([until(move(), right(), move(), right())]), sol: prog([until(move(), right(), move(), left())]),
      hint: ['La escalera baja y vuelve a ir a la derecha.', 'Uno de los giros debería volver a mirar a la derecha.', 'Cambia el último giro a la izquierda.'],
    }),
  ],
};

// ───────────────────────── 3.° · Dibuja con la tortuga ─────────────────────────
export const g3Tortuga: Module = {
  title: 'Dibuja con la tortuga',
  intro: 'La tortuga deja una línea por donde pasa. Programa figuras y copia el dibujo fantasma.',
  levels: [
    turtle({
      title: 'Una línea', prompt: 'Haz que la tortuga dibuje la línea del dibujo fantasma.',
      concept: 'Avanzar dibuja', tools: DRAW, sol: prog([fd(120)]),
      hint: ['La tortuga empieza mirando hacia arriba.', 'Usa el bloque «avanzar» con el número 120.', 'Un solo bloque: avanzar 120.'],
    }),
    turtle({
      title: 'Una esquina', prompt: 'Dibuja una línea, gira y dibuja otra.',
      concept: 'Girar cambia la dirección', tools: DRAW, sol: prog([fd(100), rotR(90), fd(100)]),
      hint: ['Primero sube 100 pasos.', 'Después gira a la derecha 90 grados.', 'Avanzar 100, girar derecha 90, avanzar 100.'],
    }),
    turtle({
      title: 'El cuadrado', prompt: 'Un cuadrado tiene 4 lados iguales. ¡Usa un bucle!',
      concept: 'Repetir para dibujar', tools: DRAW, sol: prog([repeat(4, fd(100), rotR(90))]), max: 3,
      hint: ['Un cuadrado son 4 veces «avanzar y girar».', 'Cada giro es de 90 grados.', 'Repetir 4: avanzar 100, girar derecha 90.'],
    }),
    turtle({
      title: 'El triángulo', prompt: 'Dibuja un triángulo con tres lados iguales.',
      concept: 'El ángulo depende de la figura', tools: DRAW, sol: prog([repeat(3, fd(100), rotR(120))]), max: 3,
      hint: ['Un triángulo se repite 3 veces.', 'Para cerrarlo la tortuga gira 120 grados, no 90.', 'Repetir 3: avanzar 100, girar derecha 120.'],
    }),
    turtle({
      title: 'La casita', prompt: 'Un cuadrado con un techo triangular encima.',
      concept: 'Unir figuras', tools: DRAW, max: 8,
      sol: prog([repeat(4, fd(100), rotR(90)), fd(100), rotR(30), repeat(3, fd(100), rotR(120))]),
      hint: ['Dibuja primero el cuadrado.', 'Sube hasta la esquina de arriba, gira 30 grados y dibuja un triángulo.', 'Cuadrado, avanzar 100, derecha 30, triángulo.'],
    }),
  ],
};

// ───────────────────────── 4.° · Condiciones del camino ─────────────────────────
const sigue = (b: ReturnType<typeof ifp>) => prog([until(b)]);
export const g4Condiciones: Module = {
  title: 'Condiciones del camino',
  intro: 'Con «si… entonces… si no…» el robot decide mirando el camino.',
  levels: [
    maze({
      title: 'Si no puedes avanzar', prompt: 'Haz que el robot avance mientras pueda y gire cuando se encuentre una pared.',
      concept: 'Decidir con si / si no', tools: ['move', 'turnL', 'turnR', 'until', 'ifelse'], maze: { rows: ['S...', '   .', '   .', '   G'] },
      sol: sigue(ifp('ahead', [move()], [right()])), max: 5,
      hint: ['Repite hasta llegar a la meta.', 'Si hay camino adelante: avanza. Si no: gira a la derecha.', 'Repetir hasta la meta: si hay camino adelante → avanzar, si no → derecha.'],
    }),
    maze({
      title: 'Giros a los dos lados', prompt: 'Ahora el camino dobla a la derecha y también a la izquierda.',
      concept: 'Decisiones anidadas', tools: ['move', 'turnL', 'turnR', 'until', 'ifelse'], maze: { rows: ['S..', '  .', '  ...G'] },
      sol: sigue(ifp('ahead', [move()], [ifp('left', [left()], [right()])])), max: 7,
      hint: ['Primero pregunta si hay camino adelante.', 'Si no lo hay, pregunta si hay camino a la izquierda.', 'Adelante → avanzar; si no, izquierda → girar izquierda; si no, derecha.'],
    }),
    maze({
      title: 'El camino largo', prompt: 'El mismo programa sirve para caminos más largos. ¡Pruébalo!',
      concept: 'Una regla para cualquier camino', tools: ['move', 'turnL', 'turnR', 'until', 'ifelse'], maze: { rows: ['S..', '  .', '  ...', '    .', '    ..G'] },
      sol: sigue(ifp('ahead', [move()], [ifp('left', [left()], [right()])])), max: 7,
      hint: ['Piensa en la regla del reto anterior.', 'Un buen programa no depende de cuántos pasos haya.', 'Repetir hasta la meta con las mismas decisiones.'],
    }),
    maze({
      title: 'Mano izquierda', prompt: 'Un laberinto con callejones sin salida. Truco: ¡sigue siempre la pared con tu mano izquierda!',
      concept: 'Un algoritmo para laberintos', tools: ['move', 'turnL', 'turnR', 'until', 'ifelse'],
      maze: { rows: ['S.. ...', '  . . .', '. ... .', '.     .', '. .....', '. .    ', '......G'] },
      sol: sigue(ifp('left', [left(), move()], [ifp('ahead', [move()], [right()])])), max: 8,
      hint: ['Si hay camino a la izquierda, siempre es mejor tomarlo.', 'Si no lo hay, avanza; si tampoco puedes, gira a la derecha.', 'Si izquierda: girar izquierda y avanzar; si no, si adelante: avanzar; si no, derecha.'],
    }),
    maze({
      title: 'Laberinto final', prompt: 'El laberinto grande. Tu regla de la mano izquierda lo resuelve.',
      concept: 'Reutilizar una buena idea', tools: ['move', 'turnL', 'turnR', 'until', 'ifelse'],
      maze: { rows: ['S.... ...', '    .   .', '... ... .', '. .   . .', '. ..... .', '.       .', '. .......', '.     . .', '....... G'] },
      sol: sigue(ifp('left', [left(), move()], [ifp('ahead', [move()], [right()])])), max: 8,
      hint: ['Es el mismo truco del reto anterior.', 'Solo cambia el tamaño del laberinto.', 'Si izquierda: girar izquierda y avanzar; si no, si adelante: avanzar; si no, derecha.'],
    }),
  ],
};

// ───────────────────────── 4.° · Variables en cajas ─────────────────────────
export const VARS: Tool[] = ['fd', 'rotL', 'rotR', 'repeat', 'vars'];
export const g4Variables: Module = {
  title: 'Variables en cajas',
  intro: 'Una variable es una caja con nombre que guarda un número. Cámbialo y todo el dibujo cambia.',
  levels: [
    turtle({
      title: 'Mi primera caja', prompt: 'Guarda el tamaño del lado en la caja «lado» y úsala para dibujar un cuadrado.',
      concept: 'Guardar un valor', tools: VARS, vars: ['lado'],
      sol: prog([setv('lado', 80), repeat(4, fd(vr('lado')), rotR(90))]),
      hint: ['Primero: «fijar lado a 80».', 'Dentro del bucle, en «avanzar», pon la caja «lado».', 'Fijar lado a 80; repetir 4: avanzar (lado), derecha 90.'],
    }),
    turtle({
      title: 'Cambia la caja', prompt: 'El cuadrado fantasma es más pequeño. Cambia solo el número de la caja.',
      concept: 'Un cambio, muchos efectos', tools: VARS, vars: ['lado'],
      start: prog([setv('lado', 120), repeat(4, fd(vr('lado')), rotR(90))]),
      sol: prog([setv('lado', 60), repeat(4, fd(vr('lado')), rotR(90))]),
      hint: ['El programa ya está armado.', 'Mira el número que guarda la caja «lado».', 'Cámbialo por 60.'],
    }),
    turtle({
      title: 'Espiral cuadrada', prompt: 'Haz que la caja crezca en cada vuelta para dibujar una espiral.',
      concept: 'Cambiar una variable', tools: VARS, vars: ['lado'],
      sol: prog([setv('lado', 20), repeat(8, fd(vr('lado')), rotR(90), chg('lado', 12))]), max: 7,
      hint: ['Empieza con un lado pequeño: 20.', 'En cada vuelta, además de avanzar y girar, suma 12 al lado.', 'Fijar lado 20; repetir 8: avanzar lado, derecha 90, cambiar lado en 12.'],
    }),
    turtle({
      title: 'La estrella', prompt: 'Una estrella de cinco puntas: el ángulo de giro está en una caja.',
      concept: 'Variables para ángulos', tools: [...VARS], vars: ['angulo'],
      sol: prog([setv('angulo', 144), repeat(5, fd(100), rotR(vr('angulo')))]), max: 6,
      hint: ['Crea una caja llamada «angulo» con el valor 144.', 'Repite 5 veces: avanzar 100 y girar según la caja «angulo».', 'Fijar angulo 144; repetir 5: avanzar 100, derecha (angulo).'],
    }),
    turtle({
      title: 'Escalera creciente', prompt: 'Sube una escalera cuyos escalones crecen.',
      concept: 'Patrones que crecen', tools: VARS, vars: ['lado'],
      sol: prog([setv('lado', 10), repeat(6, fd(vr('lado')), rotR(90), fd(vr('lado')), rotL(90), chg('lado', 8))]), max: 9,
      hint: ['Cada escalón sube «lado», gira a la derecha, avanza «lado» y vuelve a mirar arriba.', 'Al final de cada escalón suma 8 a la caja.', 'Fijar lado 10; repetir 6: avanzar lado, derecha 90, avanzar lado, izquierda 90, cambiar lado en 8.'],
    }),
  ],
};

// ───────────────────────── 5.° · Funciones propias ─────────────────────────
export const FUN: Tool[] = ['fd', 'rotL', 'rotR', 'repeat', 'proc', 'color'];
export const cuadrado = (lado: number) => [repeat(4, fd(lado), rotR(90))];
export const triangulo = (lado: number) => [repeat(3, fd(lado), rotR(120))];
export const g5Funciones: Module = {
  title: 'Funciones propias',
  intro: 'Una función es un bloque que tú inventas: lo defines una vez y lo usas cuando quieras.',
  levels: [
    turtle({
      title: 'Usa una función', prompt: 'La función «cuadrado» ya está definida. Llámala para dibujar.',
      concept: 'Llamar a una función', tools: FUN,
      start: prog([], { cuadrado: cuadrado(60) }), sol: prog([call('cuadrado')], { cuadrado: cuadrado(60) }),
      hint: ['Busca el grupo «Funciones» en la caja de bloques.', 'Arrastra «cuadrado» debajo de «al empezar».', 'Un solo bloque: llamar a cuadrado.'],
    }),
    turtle({
      title: 'Dos cuadrados', prompt: 'Dibuja dos cuadrados separados usando la misma función dos veces.',
      concept: 'Reutilizar', tools: FUN,
      start: prog([], { cuadrado: cuadrado(60) }),
      sol: prog([call('cuadrado'), rotR(90), fd(100), rotL(90), call('cuadrado')], { cuadrado: cuadrado(60) }),
      hint: ['Llama a «cuadrado», muévete a la derecha y vuelve a llamarla.', 'Para moverte: gira a la derecha 90, avanza 100 y gira a la izquierda 90.', 'cuadrado, derecha 90, avanzar 100, izquierda 90, cuadrado.'],
    }),
    turtle({
      title: 'Inventa una función', prompt: 'Escribe lo que hace «triangulo» dentro de su definición y luego llámala.',
      concept: 'Definir una función', tools: FUN,
      start: prog([], { triangulo: [] }), sol: prog([call('triangulo')], { triangulo: triangulo(80) }),
      hint: ['Dentro de «definir triangulo» va el dibujo del triángulo.', 'Un triángulo es repetir 3 veces: avanzar 80 y girar 120.', 'Define triangulo con repetir 3 (avanzar 80, derecha 120) y llámala.'],
    }),
    turtle({
      title: 'Flor de cuadrados', prompt: 'Gira un poco después de cada cuadrado y repítelo para formar una flor.',
      concept: 'Funciones y bucles juntos', tools: FUN,
      start: prog([], { cuadrado: cuadrado(60) }),
      sol: prog([repeat(8, call('cuadrado'), rotR(45))], { cuadrado: cuadrado(60) }),
      hint: ['Dentro de un bucle llama a «cuadrado».', 'Después de cada cuadrado gira 45 grados.', 'Repetir 8: llamar a cuadrado, derecha 45.'],
    }),
    turtle({
      title: 'Casa con funciones', prompt: 'Usa «cuadrado» y «triangulo» para dibujar una casa con techo.',
      concept: 'Componer funciones', tools: FUN,
      start: prog([], { cuadrado: cuadrado(60), triangulo: triangulo(60) }),
      sol: prog([call('cuadrado'), fd(60), rotR(30), call('triangulo')], { cuadrado: cuadrado(60), triangulo: triangulo(60) }),
      hint: ['Primero el cuadrado de la base.', 'Sube 60 hasta la esquina y gira 30 grados para el techo.', 'cuadrado, avanzar 60, derecha 30, triangulo.'],
    }),
  ],
};

// ───────────────────────── 6.° · Bucles anidados ─────────────────────────
export const NEST: Tool[] = ['fd', 'rotL', 'rotR', 'repeat', 'pen', 'color'];
export const g6Anidados: Module = {
  title: 'Bucles anidados',
  intro: 'Un bucle dentro de otro bucle: así se crean dibujos que parecen magia.',
  levels: [
    turtle({
      title: 'Dos figuras', prompt: 'Dibuja un triángulo y, sin borrar, un cuadrado, usando un bucle para cada uno.',
      concept: 'Bucles en secuencia', tools: NEST, max: 6,
      sol: prog([repeat(3, fd(80), rotR(120)), repeat(4, fd(60), rotR(90))]),
      hint: ['Son dos figuras, una detrás de la otra.', 'Triángulo: 3 veces avanzar y 120 grados. Cuadrado: 4 veces y 90 grados.', 'Repetir 3 (avanzar 80, derecha 120), repetir 4 (avanzar 60, derecha 90).'],
    }),
    turtle({
      title: 'Flor de cuadrados', prompt: 'Seis cuadrados girados forman una flor. ¡Un bucle dentro de otro!',
      concept: 'Bucle dentro de un bucle', tools: NEST, max: 7,
      sol: prog([repeat(6, repeat(4, fd(50), rotR(90)), rotR(60))]),
      hint: ['El bucle de fuera repite el cuadrado 6 veces.', 'El bucle de dentro dibuja el cuadrado: 4 veces avanzar y 90 grados.', 'Repetir 6: [repetir 4: avanzar 50, derecha 90], derecha 60.'],
    }),
    turtle({
      title: 'Rueda de triángulos', prompt: 'Ocho triángulos girados forman una rueda.',
      concept: 'Cambiar la figura de dentro', tools: NEST, max: 7,
      sol: prog([repeat(8, repeat(3, fd(60), rotR(120)), rotR(45))]),
      hint: ['Es como la flor, pero con triángulos.', 'Dentro: 3 veces avanzar y 120 grados. Fuera: 8 veces y giro de 45.', 'Repetir 8: [repetir 3: avanzar 60, derecha 120], derecha 45.'],
    }),
    turtle({
      title: 'Fila de cuadrados', prompt: 'Tres cuadrados en fila. Levanta el lápiz para moverte sin dibujar.',
      concept: 'Lápiz arriba y abajo', tools: NEST, max: 14,
      sol: prog([repeat(3, repeat(4, fd(40), rotR(90)), pen(false), rotR(90), fd(70), rotL(90), pen(true))]),
      hint: ['Cada vuelta dibuja un cuadrado y se mueve a la derecha.', 'Para moverte sin dibujar, sube el lápiz; después, bájalo.', 'Repetir 3: [cuadrado], lápiz arriba, derecha 90, avanzar 70, izquierda 90, lápiz abajo.'],
    }),
    turtle({
      title: 'La gran flor', prompt: 'Dieciocho cuadrados giran para formar una gran flor.',
      concept: 'Patrones con muchas repeticiones', tools: NEST, max: 7,
      sol: prog([repeat(18, repeat(4, fd(45), rotR(90)), rotR(20))]),
      hint: ['Es la flor de antes con más cuadrados.', '18 cuadrados dan la vuelta completa: 360 ÷ 18 = 20 grados.', 'Repetir 18: [repetir 4: avanzar 45, derecha 90], derecha 20.'],
    }),
  ],
};

/** Módulo extra para el «taller libre» de dibujo. */
export const tallerLibre = (grade: number): Level => turtle({
  title: 'Taller libre', prompt: 'Inventa tu propio dibujo. No hay una respuesta correcta: ¡crea!',
  concept: 'Crear con código',
  tools: grade <= 2 ? ['fd', 'rotL', 'rotR', 'color', 'pen']
    : grade <= 4 ? ['fd', 'rotL', 'rotR', 'repeat', 'pen', 'color']
    : ['fd', 'rotL', 'rotR', 'repeat', 'pen', 'color', 'vars', 'proc'],
  vars: ['lado'], hint: ['Prueba algo pequeño.', 'Combina giros y bucles.', 'Cambia los colores.'],
});

