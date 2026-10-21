# IscoLab · laboratorio de pensamiento computacional

Plataforma por grados (1° a 6°) con retos de pensamiento computacional. Incluye un editor de bloques
(estilo Blockly Games, con laberinto del robot y tortuga que dibuja), retos clásicos de orden, patrones,
binario y lógica, prueba final por grado, zona avanzada, taller libre y modo docente (clave en `src/config.ts`).

## Desarrollo
```
npm install
npm run dev          # servidor local
npm run test:retos   # comprueba que los 50 retos con bloques se pueden resolver
npm run build        # genera docs/
```

## Estructura
- `src/play/`: motor (AST, ejecutor, laberinto, tortuga), bloques Blockly, escenarios canvas y pantalla `BlockGame`.
- `src/data/retos.ts`: retos con bloques (cada uno con solución, pistas y bloques mínimos).
- `src/data/grados/`: módulos clásicos, pruebas finales y zonas avanzadas.
- `src/app/`: aplicación (entrada, inicio, mapa, pruebas, modo docente), retos clásicos, audio y almacenamiento.

## Dominio propio
Añade un archivo `public/CNAME` con el subdominio (por ejemplo `labsnexo.iscosanchez.com`), crea en el DNS un
registro CNAME de `labsnexo` hacia `iscosanchezl.github.io` y activa «Enforce HTTPS» en Settings → Pages.
