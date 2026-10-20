# IscoLab

Plataforma estática de pensamiento computacional para primaria. Construida con React 18, TypeScript, Vite, Tailwind CSS, GSAP, Lenis, Three.js, dnd-kit y Lucide. Las fuentes se sirven desde el propio proyecto; la aplicación no necesita un servicio externo para funcionar.

## Abrir y desarrollar

1. Instala Node.js LTS desde [nodejs.org](https://nodejs.org/) y termina la instalación.
2. Abre una terminal en la carpeta `iscolab` (la carpeta que contiene `package.json`).
3. Instala las dependencias:

   ```sh
   npm install
   ```

4. Inicia la aplicación en tu equipo:

   ```sh
   npm run dev
   ```

5. Abre en el navegador la dirección que muestre Vite (normalmente `http://localhost:5173`). Para detenerlo, vuelve a la terminal y pulsa `Ctrl+C`.
6. Genera una versión lista para publicar:

   ```sh
   npm run build
   ```

El comando comprueba los tipos de TypeScript y genera el sitio estático dentro de `docs/`. Puedes abrir la aplicación de desarrollo con Vite; el sitio compilado está preparado para alojarse en una ruta relativa, como un proyecto de GitHub Pages.

## Publicar con GitHub Pages

1. Crea un repositorio en GitHub y sube el proyecto completo, incluidos `package.json` y `package-lock.json`.
2. Usa `main` como rama de publicación (o cambia `branches: [main]` en `.github/workflows/deploy.yml` si tu rama principal tiene otro nombre).
3. En GitHub, entra en **Settings → Pages** y selecciona **GitHub Actions** como origen.
4. Sube el proyecto a la rama `main`. La acción compilará el proyecto y publicará `docs/` automáticamente. También puedes ejecutarla desde **Actions → Build and publish IscoLab → Run workflow**.
5. Cuando termine el workflow, GitHub mostrará el enlace del sitio en **Settings → Pages**.

Para publicar manualmente, ejecuta `npm run build` y publica el contenido generado en `docs/`.

## Contenido editable

Cada grado está aislado en `src/data/grados/g1.ts` a `g6.ts`. El esquema compartido está en `src/types.ts`; la clave del modo docente y las claves de almacenamiento están en `src/config.ts`. El módulo de perfil expone `obtenerPerfil`, `guardarProgreso` y `cargarProgreso` en `src/main.tsx`; también migra los perfiles y resultados guardados por la entrega anterior.

Clave docente inicial: `1234` (cámbiala en `src/config.ts` antes de compartir la aplicación).

## Matriz de retos

| Grado | Módulo | Nivel | Mecánica | Concepto |
|---|---|---|---|---|
| 1° | Rutinas en orden | 1–5 | ordenar tarjetas de rutinas | secuenciación cotidiana, orden temporal, pasos con propósito, rutina personal, planificación |
| 1° | Formas que se repiten | 1–5 | patrón visual de formas | alternancia, unidad repetida, tamaño, repetición asimétrica, regla de ciclo |
| 1° | Robot de paseo | 1–5 | comandos de avanzar y girar | avance, orientación izquierda, orientación derecha, secuencia de dos pasos, vuelta completa |
| 2° | Patrones largos | 1–5 | completar series extensas | ciclo de tres colores, grupo 2:1, incremento constante, patrón de tres figuras, agrupación periódica |
| 2° | Robot entre rocas | 1–5 | elegir rutas en cuadrícula con obstáculos | rodear, pasillo estrecho, desvío/retorno, ruta alternativa, navegación segura |
| 2° | Detectives de errores | 1–5 | localizar o corregir una instrucción | dirección errónea, contador incompleto, giro sobrante, orden equivocado, repetición extra |
| 3° | Bucles y repeticiones | 1–5 | bloques `repetir N` | contador, traza cíclica, suma repetida, condición de parada, compresión de código |
| 3° | Depuración paso a paso | 1–5 | inspeccionar y reparar pseudocódigo | contador, inicialización, flujo, condición imposible, giro duplicado |
| 3° | Lógica inicial | 1–5 | deducción de reglas | paridad, implicación, comparación, transitividad, causa y efecto |
| 4° | Condiciones del camino | 1–5 | bifurcaciones si / si no | decisión verdadera, rama alternativa, límite numérico, condición falsa, rutas excluyentes |
| 4° | Variables en cajas | 1–5 | actualizar y leer valores etiquetados | suma, nombres descriptivos, incremento, operaciones, reasignación |
| 4° | Lógica aplicada | 1–5 | evaluar expresiones booleanas | conjunción, disyunción, negación, relación, evaluación compuesta |
| 5° | Funciones propias | 1–5 | crear y reutilizar bloques | llamada, abstracción, parámetro, reutilización, retorno |
| 5° | Ordenamiento visual | 1–5 | trazar comparaciones de burbuja | primer intercambio, comparación siguiente, vecino desordenado, pasada, orden ascendente |
| 5° | Código binario | 1–5 | interruptores y lectura decimal | 101, representar seis, valor posicional, suma de bits, codificar nueve |
| 6° | Bucles anidados | 1–5 | bucle interno dentro de externo | producto de repeticiones, filas/columnas, traza, alcance, recorrido bidimensional |
| 6° | Compuertas booleanas | 1–5 | entradas booleanas en compuertas | AND, OR, NOT, composición, agrupación |
| 6° | Python y seguridad | 1–5 | completar pseudocódigo y tomar decisiones | `range`, condición Python, asignación incremental, contraseña robusta, phishing |

Cada grado tiene además una prueba de 10 preguntas en su archivo de datos. La mecánica se especializa dentro del mismo motor de retos; los textos, respuestas, pistas y soluciones son datos separados por nivel.

## Fase 2 pendiente

- Google Sign-In únicamente desde 3°.
- Firebase para identidad y sincronización del progreso.
- Panel docente con progreso individual de estudiantes del aula.

La matriz completa, con una fila por cada uno de los 90 niveles, está en [MATRIZ.md](./MATRIZ.md).
