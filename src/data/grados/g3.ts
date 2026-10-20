import type { Grade, Level } from '../../types';
const level=(title:string,prompt:string,mechanic:Level['mechanic'],concept:string,answer:string,options:string[],hint:string,code?:string[]):Level=>({title,prompt,mechanic,concept,answer,options,hint:[hint,'Prueba la regla con un ejemplo pequeño.',`La solución es: ${answer}.`],solution:answer,code});
export const g3:Grade={id:3,title:'Detectives de código',world:'Estación de algoritmos',accent:'#bc91d9',modules:[
{title:'Bucles y repeticiones',intro:'Un bucle permite repetir instrucciones con menos pasos.',levels:[
level('Repite tres','El robot avanza 3 casillas. Completa el programa más corto.','loop','Repetición contada','repetir 3 veces: avanzar',['repetir 2 veces: avanzar','repetir 3 veces: avanzar','avanzar 3 veces'],'Cuenta cuántas casillas recorre.',['repetir 2','avanzar']),
level('Vuelta al jardín','Una secuencia “avanzar, girar” se repite cuatro veces. ¿Cuántos avances ocurren?','loop','Trazado por ciclo','4 avances',['2 avances','3 avances','4 avances'],'Cada repetición incluye un avance.',['repetir 4','avanzar','girar']),
level('Contador de saltos','Un personaje salta 2 unidades, 5 veces. ¿Qué distancia recorre?','loop','Multiplicación como repetición','10',['7','10','12'],'Suma 2 cinco veces.',['repetir 5','saltar 2']),
level('Repetir hasta el puente','La ruta tiene cuatro casillas vacías antes del puente. ¿Cuándo detener el bucle?','loop','Condición de parada','Al llegar al puente',['Después de 2 pasos','Al llegar al puente','Nunca'],'El bucle debe comprobar el destino.',['repetir hasta puente','avanzar']),
level('Ahorra instrucciones','¿Qué bloque reemplaza seis “avanzar” seguidos?','loop','Compresión de programa','repetir 6: avanzar',['repetir 3: avanzar','repetir 6: avanzar','girar 6 veces'],'El número de repeticiones debe coincidir.',['avanzar','avanzar','avanzar','avanzar','avanzar','avanzar'])]},
{title:'Depuración paso a paso',intro:'Lee el programa, compara con el objetivo y repara el bloque dañado.',levels:[
level('Un paso perdido','Objetivo: avanzar 4 veces. ¿Qué valor del bucle está mal?','debug','Depurar contador','repetir 4',['repetir 2','repetir 3','repetir 4'],'El número de repeticiones debe ser cuatro.',['repetir 3','avanzar']),
level('La variable al revés','Objetivo: contar de 1 a 5. ¿Qué línea daña el programa?','debug','Inicialización de variable','inicio = 0',['inicio = 1','inicio = 0','sumar 1'],'El contador comienza en uno.',['inicio = 0','repetir 5','mostrar inicio']),
level('Bloque desconectado','El objetivo es girar y avanzar. Encuentra el bloque que no se ejecuta.','debug','Orden de ejecución','avanzar aislado',['girar','avanzar aislado','inicio'],'Sigue el flujo desde el bloque inicial.',['inicio → girar','avanzar']),
level('Condición imposible','El bucle debe continuar mientras contador < 4. ¿Cuál comparación falla?','debug','Depuración de condición','contador > 4',['contador < 4','contador = 4','contador > 4'],'El valor inicia en cero y debe seguir aumentando.',['mientras contador > 4']),
level('Giro duplicado','El camino requiere un giro a la derecha, pero el robot vuelve a su dirección. ¿Qué línea sobra?','debug','Pruebas y corrección','segundo giro',['girar derecha','segundo giro','avanzar'],'Dos giros de 90° cambian demasiado la orientación.',['girar derecha','girar derecha','avanzar'])]},
{title:'Lógica inicial',intro:'Usa reglas sencillas para deducir qué debe hacer el programa.',levels:[
level('Par o impar','¿Cuál número es par?','logic','Paridad','8',['7','8','9'],'Los números pares se pueden agrupar de dos en dos.[]'.replace('[]','')), 
level('Si ocurre esto','Si llueve, llevo paraguas. Está lloviendo. ¿Qué conclusión sigue?','logic','Implicación lógica','Llevo paraguas',['No llevo paraguas','Llevo paraguas','Deja de llover'],'Aplica la regla al dato presente.'),
level('Mayor que','¿Qué valor hace verdadera la regla x > 5?','logic','Comparación','8',['3','5','8'],'Debe ser mayor, no igual, a cinco.'),
level('Orden de pistas','Ana llegó antes que Beto. Beto antes que Cata. ¿Quién llegó primero?','logic','Transitividad','Ana',['Ana','Beto','Cata'],'Une las dos pistas en una sola fila.'),
level('Regla verdadera','Si una luz se enciende solo cuando pulsas el botón, ¿qué debes hacer para encenderla?','logic','Causa y efecto','Pulsar el botón',['Esperar','Pulsar el botón','Apagar el interruptor'],'Busca la acción conectada con el resultado.')]}],exam:[
{question:'¿Qué programa repite un paso tres veces?',options:['repetir 2: avanzar','repetir 3: avanzar','avanzar una vez'],answer:'repetir 3: avanzar'},
{question:'2 unidades × 5 saltos = …',options:['7','10','12'],answer:'10'},
{question:'¿Qué significa depurar un programa?',options:['Buscar y corregir errores','Cambiar el color','Borrar todos los datos'],answer:'Buscar y corregir errores'},
{question:'¿Cuál número es par?',options:['7','8','9'],answer:'8'},
{question:'Si llueve, llevo paraguas. Está lloviendo. ¿Qué hago?',options:['Llevo paraguas','Lo guardo','No se puede saber'],answer:'Llevo paraguas'},
{question:'x > 5 significa que x es…',options:['Menor que 5','Igual a 5','Mayor que 5'],answer:'Mayor que 5'},
{question:'Ana llegó antes que Beto. ¿Quién llegó primero?',options:['Ana','Beto','No se sabe'],answer:'Ana'},
{question:'Un bloque se repite 4 veces y contiene un avance. ¿Cuántos avances?',options:['3','4','5'],answer:'4'},
{question:'¿Para qué sirve un contador?',options:['Llevar la cuenta','Girar el robot','Cambiar la pantalla'],answer:'Llevar la cuenta'},
{question:'Después de reparar un programa, conviene…',options:['Probarlo de nuevo','Olvidar el objetivo','Añadir errores'],answer:'Probarlo de nuevo'}],advanced:{title:'Desafíos de laboratorio',intro:'Retos opcionales para quienes quieren ir un paso más allá.',questions:[
{question:'Un bucle se repite 3 veces y dentro hay otro que marca 2 veces. ¿Cuántas marcas?',options:['5','6','8'],answer:'6'},
{question:'Empiezas en 1 y sumas 2 cinco veces. ¿Dónde terminas?',options:['9','10','11'],answer:'11'},
{question:'El contador inicia en 0. ¿Qué condición permite llegar hasta 5?',options:['contador > 5','contador < 5','contador = 8'],answer:'contador < 5'},
{question:'Hay 3 filas con 4 casillas. ¿Cuántas parejas de fila y columna visitas?',options:['7','12','34'],answer:'12'},
{question:'Para comprobar un error que solo aparece al llegar al puente, ¿qué conviene revisar?',options:['La condición de parada','El color del robot','El nombre del mapa'],answer:'La condición de parada'}]}};
