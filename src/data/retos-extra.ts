/**
 * Retos extra con bloques (se añaden al final de cada grado, así el progreso guardado no cambia).
 * Cada reto lleva su solución de referencia: `npm run test:retos` comprueba que todos se pueden resolver.
 */
import { call, chg, fd, left, move, pen, prog, repeat, right, rotL, rotR, setv, vr } from '../play/ast';
import type { Module } from '../types';
import { BASIC, DRAW, FUN, LOOPS, NEST, VARS, cuadrado, maze, turtle } from './retos';

// ───────────────────────── 1.° · Estrellas en el camino ─────────────────────────
export const g1Estrellas: Module = {
  title: 'Estrellas en el camino',
  intro: 'Las estrellas están en el camino: si pasas por encima, ¡las recoges!',
  levels: [
    maze({
      title: 'Una estrella', prompt: 'Pasa por la estrella y llega a la meta.',
      concept: 'Recoger al pasar', tools: BASIC, maze: { rows: ['S*G'] }, sol: prog([move(), move()]),
      hint: ['La estrella está justo delante del robot.', 'Cada «avanzar» mueve una casilla.', 'Dos bloques: avanzar, avanzar.'],
    }),
    maze({
      title: 'Dos estrellas', prompt: 'Hay dos estrellas en el camino. ¡Recoge las dos!',
      concept: 'Contar casillas', tools: BASIC, maze: { rows: ['S*.*G'] }, sol: prog([move(), move(), move(), move()]),
      hint: ['Cuenta todas las casillas hasta la meta.', 'Las estrellas están en el camino, no hace falta girar.', 'Avanzar cuatro veces.'],
    }),
    maze({
      title: 'Estrella en la esquina', prompt: 'La estrella está justo donde el camino dobla.',
      concept: 'Avanzar y girar', tools: BASIC, maze: { rows: ['S.*', '  .', '  G'] },
      sol: prog([move(), move(), right(), move(), move()]),
      hint: ['Llega primero a la esquina, ahí está la estrella.', 'Después el camino baja: gira a la derecha.', 'Avanzar ×2, derecha, avanzar ×2.'],
    }),
    maze({
      title: 'Subir por la izquierda', prompt: 'Esta vez el camino sube. ¿Hacia qué lado giras?',
      concept: 'Girar a la izquierda', tools: BASIC, maze: { rows: ['  G', '  .', 'S*.'] },
      sol: prog([move(), move(), left(), move(), move()]),
      hint: ['El robot recorre la fila de abajo y luego sube.', 'Mirando a la derecha, subir es girar a la izquierda.', 'Avanzar ×2, izquierda, avanzar ×2.'],
    }),
    maze({
      title: 'Cuatro estrellas', prompt: 'Recoge las cuatro estrellas antes de llegar.',
      concept: 'Planear el recorrido', tools: BASIC, maze: { rows: ['S**', '  .', 'G**'] },
      sol: prog([move(), move(), right(), move(), move(), right(), move(), move()]),
      hint: ['El camino da una vuelta en forma de «C».', 'Hay dos giros, los dos a la derecha.', 'Avanzar ×2, derecha, avanzar ×2, derecha, avanzar ×2.'],
    }),
  ],
};

// ───────────────────────── 1.° · Giros y caminos ─────────────────────────
export const g1Giros: Module = {
  title: 'Giros y caminos',
  intro: 'El robot gira a los dos lados. ¡Practica izquierda y derecha!',
  levels: [
    maze({
      title: 'Sube a la meta', prompt: 'La meta está arriba. Avanza y gira.',
      concept: 'Girar a la izquierda', tools: BASIC, maze: { rows: [' G', 'S.'] }, sol: prog([move(), left(), move()]),
      hint: ['Primero avanza hasta quedar debajo de la meta.', 'El robot mira a la derecha: para subir gira a la izquierda.', 'Avanzar, izquierda, avanzar.'],
    }),
    maze({
      title: 'Mirando hacia arriba', prompt: 'Este robot empieza mirando hacia arriba.',
      concept: 'Dirección inicial', tools: BASIC, maze: { rows: ['G..', '  .', '  S'], dir: 'N' },
      sol: prog([move(), move(), left(), move(), move()]),
      hint: ['Fíjate hacia dónde mira el robot al empezar.', 'Sube dos casillas y luego el camino va a la izquierda.', 'Avanzar ×2, izquierda, avanzar ×2.'],
    }),
    maze({
      title: 'Zigzag largo', prompt: 'Baja por el camino con curvas a los dos lados.',
      concept: 'Alternar giros', tools: BASIC, maze: { rows: ['S.', ' .', ' ..', '  .', '  G'] },
      sol: prog([move(), right(), move(), move(), left(), move(), right(), move(), move()]),
      hint: ['El robot baja, avanza y vuelve a bajar.', 'Alterna: derecha para bajar, izquierda para ir a la derecha.', 'Avanzar, derecha, avanzar ×2, izquierda, avanzar, derecha, avanzar ×2.'],
    }),
    maze({
      title: 'Marcha atrás', prompt: 'La meta está detrás del robot. ¡Mira para el otro lado!',
      concept: 'Dar media vuelta', tools: BASIC, maze: { rows: ['G..S'], dir: 'W' }, sol: prog([move(), move(), move()]),
      hint: ['Mira hacia dónde apunta el robot.', 'Ya mira hacia la meta: no hace falta girar.', 'Avanzar tres veces.'],
    }),
    maze({
      title: 'El gran recorrido', prompt: 'Recoge las dos estrellas y llega a la meta.',
      concept: 'Un programa largo', tools: BASIC, maze: { rows: ['S.*.', '   .', 'G*..'] },
      sol: prog([move(), move(), move(), right(), move(), move(), right(), move(), move(), move()]),
      hint: ['Primero hacia la derecha, luego abajo y después hacia la izquierda.', 'Dos giros a la derecha en total.', 'Avanzar ×3, derecha, avanzar ×2, derecha, avanzar ×3.'],
    }),
  ],
};

// ───────────────────────── 2.° · Bucles con estrellas ─────────────────────────
export const g2Bucles: Module = {
  title: 'Bucles con estrellas',
  intro: 'Cuando algo se repite, un bucle te ahorra bloques.',
  levels: [
    maze({
      title: 'Ocho pasos', prompt: 'Son muchos pasos iguales: usa un bucle.',
      concept: 'Repetir una acción', tools: LOOPS, maze: { rows: ['S.......G'] }, sol: prog([repeat(8, move())]), max: 3,
      hint: ['Cuenta las casillas hasta la meta.', 'Pon «avanzar» dentro de «repetir».', 'Repetir 8 veces: avanzar.'],
    }),
    maze({
      title: 'Pasillo de estrellas', prompt: 'Recoge todas las estrellas del pasillo con un bucle.',
      concept: 'Repetir y recoger', tools: LOOPS, maze: { rows: ['S********G'] }, sol: prog([repeat(9, move())]), max: 3,
      hint: ['El pasillo es largo y recto.', 'No hace falta girar: solo repetir.', 'Repetir 9 veces: avanzar.'],
    }),
    maze({
      title: 'Escaleras', prompt: 'Cada escalón son los mismos bloques. ¡Repítelos!',
      concept: 'Repetir un grupo', tools: LOOPS, maze: { rows: ['S..', '  ...', '    ...', '      G'] },
      sol: prog([repeat(3, move(), move(), right(), move(), left())]), max: 7,
      hint: ['Mira un escalón: dos pasos, bajar, un paso, volver.', 'Ese grupo se repite tres veces.', 'Repetir 3: avanzar, avanzar, derecha, avanzar, izquierda.'],
    }),
    maze({
      title: 'Dos tramos', prompt: 'Dos tramos largos con una esquina en medio.',
      concept: 'Bucles y giros', tools: LOOPS, maze: { rows: ['S***', '   *', '   *', '   G'] },
      sol: prog([repeat(3, move()), right(), repeat(3, move())]), max: 6,
      hint: ['Hay tres pasos, una esquina y otros tres pasos.', 'Usa un bucle para cada tramo.', 'Repetir 3 avanzar, derecha, repetir 3 avanzar.'],
    }),
    maze({
      title: 'Rodea el lago', prompt: 'Baja por la orilla y camina hasta la meta.',
      concept: 'Planear con bucles', tools: LOOPS, maze: { rows: ['S   ', '.   ', '.   ', '...G'] },
      sol: prog([right(), repeat(3, move()), left(), repeat(3, move())]), max: 7,
      hint: ['El robot empieza mirando a la derecha, pero el camino baja.', 'Gira a la derecha, baja con un bucle, gira a la izquierda y avanza con otro.', 'Derecha, repetir 3 avanzar, izquierda, repetir 3 avanzar.'],
    }),
  ],
};

// ───────────────────────── 3.° · Figuras con bucles ─────────────────────────
export const g3Figuras: Module = {
  title: 'Figuras con bucles',
  intro: 'Con un bucle, la tortuga dibuja figuras con pocos bloques.',
  levels: [
    turtle({
      title: 'El rectángulo', prompt: 'Dos lados largos y dos cortos. Repite lo que se repite.',
      concept: 'Repetir un par de lados', tools: DRAW, max: 6,
      sol: prog([repeat(2, fd(120), rotR(90), fd(60), rotR(90))]),
      hint: ['Un rectángulo tiene lados largos y cortos que se alternan.', 'El par «largo + corto» se repite dos veces.', 'Repetir 2: avanzar 120, derecha 90, avanzar 60, derecha 90.'],
    }),
    turtle({
      title: 'El hexágono', prompt: 'Seis lados iguales.',
      concept: 'Ángulo de un polígono', tools: DRAW, max: 4,
      sol: prog([repeat(6, fd(60), rotR(60))]),
      hint: ['Son seis lados: repite seis veces.', 'Para cerrar la figura el giro es de 60 grados.', 'Repetir 6: avanzar 60, derecha 60.'],
    }),
    turtle({
      title: 'El octágono', prompt: 'Ocho lados iguales, como una señal de «Pare».',
      concept: '360 ÷ lados = giro', tools: DRAW, max: 4,
      sol: prog([repeat(8, fd(50), rotR(45))]),
      hint: ['Son ocho lados.', 'Una vuelta completa son 360 grados: 360 ÷ 8.', 'Repetir 8: avanzar 50, derecha 45.'],
    }),
    turtle({
      title: 'La escalera', prompt: 'Sube escalones iguales.',
      concept: 'Un grupo que se repite', tools: DRAW, max: 7,
      sol: prog([repeat(4, fd(30), rotR(90), fd(30), rotL(90))]),
      hint: ['Cada escalón: sube, gira, avanza y vuelve a mirar arriba.', 'Ese grupo de cuatro bloques se repite cuatro veces.', 'Repetir 4: avanzar 30, derecha 90, avanzar 30, izquierda 90.'],
    }),
    turtle({
      title: 'Zigzag', prompt: 'Una línea que se quiebra hacia un lado y vuelve a subir.',
      concept: 'Girar a los dos lados', tools: DRAW, max: 7,
      sol: prog([repeat(3, fd(40), rotR(60), fd(40), rotL(60))]),
      hint: ['Cada tramo avanza, gira a la derecha, avanza y gira a la izquierda.', 'Los dos giros son del mismo tamaño.', 'Repetir 3: avanzar 40, derecha 60, avanzar 40, izquierda 60.'],
    }),
  ],
};

// ───────────────────────── 4.° · Variables en acción ─────────────────────────
export const g4VariablesAccion: Module = {
  title: 'Variables en acción',
  intro: 'Cambia el número de una caja y toda la figura cambia de tamaño.',
  levels: [
    turtle({
      title: 'Triángulo ajustable', prompt: 'Guarda el lado en la caja «lado» y dibuja un triángulo.',
      concept: 'Variable para el tamaño', tools: VARS, vars: ['lado'],
      sol: prog([setv('lado', 70), repeat(3, fd(vr('lado')), rotR(120))]), max: 6,
      hint: ['Primero: «fijar lado a 70».', 'Repite 3 veces: avanzar (lado) y girar 120.', 'Fijar lado 70; repetir 3: avanzar lado, derecha 120.'],
    }),
    turtle({
      debug: true, title: 'Hexágono torcido', prompt: 'La figura se queda abierta. ¿Qué número está mal?',
      concept: 'Depurar un contador', tools: VARS, vars: ['lado'],
      start: prog([setv('lado', 40), repeat(5, fd(vr('lado')), rotR(60))]),
      sol: prog([setv('lado', 40), repeat(6, fd(vr('lado')), rotR(60))]),
      hint: ['Cuenta los lados que dibuja el programa.', 'Un hexágono tiene seis lados.', 'Cambia el 5 por un 6.'],
    }),
    turtle({
      title: 'Rectángulo con dos cajas', prompt: 'Usa una caja para el ancho y otra para el alto.',
      concept: 'Varias variables', tools: VARS, vars: ['ancho', 'alto'],
      sol: prog([setv('ancho', 100), setv('alto', 50), repeat(2, fd(vr('ancho')), rotR(90), fd(vr('alto')), rotR(90))]), max: 10,
      hint: ['Fija «ancho» en 100 y «alto» en 50.', 'Repite dos veces: avanzar ancho, girar, avanzar alto, girar.', 'Repetir 2: avanzar ancho, derecha 90, avanzar alto, derecha 90.'],
    }),
    turtle({
      title: 'Espiral triangular', prompt: 'Haz crecer el lado en cada vuelta.',
      concept: 'Cambiar una variable', tools: VARS, vars: ['lado'],
      sol: prog([setv('lado', 20), repeat(8, fd(vr('lado')), rotR(120), chg('lado', 10))]), max: 8,
      hint: ['Empieza con un lado pequeño: 20.', 'Avanza, gira 120 y suma 10 a «lado».', 'Fijar lado 20; repetir 8: avanzar lado, derecha 120, cambiar lado en 10.'],
    }),
    turtle({
      title: 'Escalones iguales', prompt: 'Una escalera donde todos los escalones miden lo mismo.',
      concept: 'Un valor, muchos usos', tools: VARS, vars: ['paso'],
      sol: prog([setv('paso', 30), repeat(4, fd(vr('paso')), rotR(90), fd(vr('paso')), rotL(90))]), max: 11,
      hint: ['Guarda el tamaño del escalón en «paso».', 'Cada escalón usa «paso» dos veces.', 'Fijar paso 30; repetir 4: avanzar paso, derecha 90, avanzar paso, izquierda 90.'],
    }),
  ],
};

// ───────────────────────── 5.° · Más funciones ─────────────────────────
export const g5MasFunciones: Module = {
  title: 'Más funciones',
  intro: 'Define tus propias funciones y combínalas para dibujar cosas más grandes.',
  levels: [
    turtle({
      title: 'Una función de línea', prompt: 'Usa la función «linea» dos veces para hacer una esquina.',
      concept: 'Llamar varias veces', tools: FUN,
      start: prog([], { linea: [fd(80)] }), sol: prog([call('linea'), rotR(90), call('linea')], { linea: [fd(80)] }),
      hint: ['Llama a «linea», gira y vuelve a llamarla.', 'El giro es de 90 grados a la derecha.', 'linea, derecha 90, linea.'],
    }),
    turtle({
      title: 'El hexágono', prompt: 'Escribe dentro de «hexagono» lo que dibuja y luego llámala.',
      concept: 'Definir una función', tools: FUN,
      start: prog([], { hexagono: [] }), sol: prog([call('hexagono')], { hexagono: [repeat(6, fd(50), rotR(60))] }),
      hint: ['Dentro de «definir hexagono» va un bucle.', 'Seis veces: avanzar 50 y girar 60.', 'Define hexagono con repetir 6 (avanzar 50, derecha 60) y llámala.'],
    }),
    turtle({
      debug: true, title: 'Función rota', prompt: 'El cuadrado se queda abierto. Arregla la función.',
      concept: 'Depurar una función', tools: FUN,
      start: prog([call('cuadrado')], { cuadrado: [repeat(3, fd(60), rotR(90))] }),
      sol: prog([call('cuadrado')], { cuadrado: cuadrado(60) }),
      hint: ['Mira dentro de la definición de «cuadrado».', 'Un cuadrado tiene cuatro lados.', 'Cambia el 3 por un 4.'],
    }),
    turtle({
      title: 'Tres cuadrados girados', prompt: 'Llama tres veces a «cuadrado» girando entre cada una.',
      concept: 'Funciones dentro de bucles', tools: FUN, max: 8,
      start: prog([], { cuadrado: cuadrado(50) }), sol: prog([repeat(3, call('cuadrado'), rotR(120))], { cuadrado: cuadrado(50) }),
      hint: ['Dentro de un bucle llama a «cuadrado».', 'Tres cuadrados dan la vuelta: 360 ÷ 3 grados.', 'Repetir 3: cuadrado, derecha 120.'],
    }),
    turtle({
      title: 'Molino', prompt: 'Define «molino» usando la función «cuadrado» cuatro veces.',
      concept: 'Funciones que usan funciones', tools: FUN,
      start: prog([], { cuadrado: cuadrado(40), molino: [] }),
      sol: prog([call('molino')], { cuadrado: cuadrado(40), molino: [repeat(4, call('cuadrado'), rotR(90))] }),
      hint: ['Dentro de «molino» puedes llamar a «cuadrado».', 'Cuatro cuadrados, girando 90 grados entre uno y otro.', 'Define molino con repetir 4 (cuadrado, derecha 90) y llámalo.'],
    }),
  ],
};

// ───────────────────────── 6.° · Patrones anidados ─────────────────────────
export const g6Patrones: Module = {
  title: 'Patrones anidados',
  intro: 'Combina bucles dentro de bucles y levanta el lápiz para crear diseños complejos.',
  levels: [
    turtle({
      title: 'Pétalos de triángulos', prompt: 'Doce triángulos girados forman una flor.',
      concept: 'Bucle dentro de bucle', tools: NEST, max: 7,
      sol: prog([repeat(12, repeat(3, fd(50), rotR(120)), rotR(30))]),
      hint: ['Dentro: un triángulo (3 veces avanzar y 120).', 'Fuera: repetirlo 12 veces, girando 360 ÷ 12.', 'Repetir 12: [repetir 3: avanzar 50, derecha 120], derecha 30.'],
    }),
    turtle({
      title: 'Hexágonos en círculo', prompt: 'Diez hexágonos girados dibujan una rueda.',
      concept: 'Cambiar la figura de dentro', tools: NEST, max: 7,
      sol: prog([repeat(10, repeat(6, fd(35), rotR(60)), rotR(36))]),
      hint: ['Dentro: un hexágono (6 veces avanzar y 60).', 'Fuera: 10 veces, girando 360 ÷ 10.', 'Repetir 10: [repetir 6: avanzar 35, derecha 60], derecha 36.'],
    }),
    turtle({
      title: 'Fila de triángulos', prompt: 'Tres triángulos en fila. Levanta el lápiz para moverte.',
      concept: 'Lápiz arriba y abajo', tools: NEST, max: 14,
      sol: prog([repeat(3, repeat(3, fd(40), rotR(120)), pen(false), rotR(90), fd(60), rotL(90), pen(true))]),
      hint: ['Cada vuelta dibuja un triángulo y se mueve a la derecha.', 'Para moverte sin dibujar, sube el lápiz; luego bájalo.', 'Repetir 3: [triángulo], lápiz arriba, derecha 90, avanzar 60, izquierda 90, lápiz abajo.'],
    }),
    turtle({
      title: 'El sol', prompt: 'Doce rayos que salen del centro.',
      concept: 'Ir y volver', tools: NEST, max: 7,
      sol: prog([repeat(12, fd(60), rotR(180), fd(60), rotR(150))]),
      hint: ['Cada rayo: avanzar, dar media vuelta, volver al centro.', 'Después gira un poco para el siguiente rayo.', 'Repetir 12: avanzar 60, derecha 180, avanzar 60, derecha 150.'],
    }),
    turtle({
      title: 'Cuadrados girados', prompt: 'Dieciocho cuadrados girados 20 grados cada uno.',
      concept: 'Patrones con muchas repeticiones', tools: NEST, max: 7,
      sol: prog([repeat(18, repeat(4, fd(40), rotR(90)), rotR(20))]),
      hint: ['Dentro: un cuadrado. Fuera: repetirlo.', '360 ÷ 18 = 20 grados entre un cuadrado y el siguiente.', 'Repetir 18: [repetir 4: avanzar 40, derecha 90], derecha 20.'],
    }),
  ],
};
