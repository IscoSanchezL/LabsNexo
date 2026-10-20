import type { Grade, Level } from '../../types';
const L=(title:string,prompt:string,mechanic:Level['mechanic'],concept:string,answer:string,options:string[],hint:string,code?:string[]):Level=>({title,prompt,mechanic,concept,answer,options,code,hint:[hint,'Traza cada instrucción una por una.',`Respuesta: ${answer}.`],solution:answer});
export const g6:Grade={id:6,title:'Laboratorio de sistemas',world:'Observatorio lógico',accent:'#77a8d3',modules:[
{title:'Bucles anidados',intro:'Un bucle dentro de otro permite construir patrones repetidos en dos dimensiones.',levels:[
L('Cuadrícula de bloques','El bucle exterior se repite 3 veces y el interior 2. ¿Cuántas marcas se dibujan?','nested','Producto de repeticiones','6',['5','6','8'],'Multiplica las repeticiones de ambos bucles.',['repetir 3','  repetir 2','    marcar']),
L('Filas de luces','4 filas tienen 5 luces cada una. ¿Cuántas luces en total?','nested','Anidamiento filas y columnas','20',['9','20','45'],'Cada fila repite cinco encendidos.'),
L('Doble patrón','Dentro de cada una de 2 rondas se repite avanzar 3 veces. ¿Cuántos avances?','nested','Traza de bucles anidados','6',['5','6','9'],'El bloque interno corre completo en cada ronda.'),
L('Orden de ejecución','¿Qué bloque termina primero: el bucle interior o el exterior?','nested','Alcance de bucles','El interior',['El interior','El exterior','Ambos a la vez'],'El interior termina en cada ronda exterior.'),
L('Tabla de coordenadas','Un bucle recorre 3 filas y otro 4 columnas. ¿Cuántas casillas visita?','nested','Recorrido bidimensional','12',['7','12','34'],'Multiplica filas por columnas.') ]},
{title:'Compuertas booleanas',intro:'Combina señales con Y, O y NO para obtener una salida.',levels:[
L('Compuerta Y','A=true y B=false pasan por Y. ¿Cuál es la salida?','gate','Compuerta AND','Falso',['Verdadero','Falso','1'],'Y solo es verdadera si ambas entradas lo son.'),
L('Compuerta O','A=false y B=true pasan por O. ¿Cuál es la salida?','gate','Compuerta OR','Verdadero',['Verdadero','Falso','0'],'O es verdadera si una entrada es verdadera.'),
L('Inversor NO','La entrada es verdadera. ¿Qué entrega la compuerta NO?','gate','Compuerta NOT','Falso',['Verdadero','Falso','Igual'],'NO invierte el valor.'),
L('Composición lógica','A=true, B=false. Evalúa NO B Y A.','gate','Prioridad y composición booleana','Verdadero',['Verdadero','Falso','Indeterminado'],'Primero invierte B; después aplica Y.'),
L('Alarma compuesta','La alarma se activa con (puerta abierta O ventana abierta) Y sistema activo. Solo ventana y sistema están activos.','gate','Agrupación de expresiones','Verdadero',['Verdadero','Falso','No hay datos'],'La disyunción y la condición final son verdaderas.') ]},
{title:'Python y seguridad',intro:'Completa pseudocódigo y toma decisiones seguras en línea.',levels:[
L('Completa el contador','¿Qué número imprime el código? for n in range(3): print(n)','python','Rango final excluido','0, 1, 2',['1, 2, 3','0, 1, 2','0, 1, 2, 3'],'range(3) empieza en cero y llega hasta antes de tres.',['for n in range(3):','    print(n)']),
L('Condición de Python','Si edad = 12, ¿qué muestra: if edad >= 10: print("pasa")?','python','Condicional Python','pasa',['pasa','no pasa','error'],'Doce es mayor o igual que diez.',['if edad >= 10:','    print("pasa")']),
L('Completa la suma','x=4; x=x+3; print(x). ¿Qué imprime?','python','Asignación incremental','7',['4','7','43'],'Suma tres al valor que ya tenía x.',['x = 4','x = x + 3','print(x)']),
L('Contraseña robusta','¿Cuál contraseña es más difícil de adivinar?','cyber','Contraseñas largas y únicas','Rio!Mapa_82Luna',['12345678','Rio!Mapa_82Luna','password'],'Combina longitud, variedad y evita datos obvios.'),
L('Mensaje sospechoso','Un mensaje pide tu contraseña para “ganar un premio”. ¿Qué haces?','cyber','Reconocer phishing','No abrir el enlace y avisar a un adulto',['Compartir la contraseña','No abrir el enlace y avisar a un adulto','Responder con tus datos'],'Los premios inesperados pueden ser engañosos.') ]}],exam:[
{question:'3 rondas con 2 marcas en cada una producen…',options:['5 marcas','6 marcas','8 marcas'],answer:'6 marcas'},
{question:'4 filas con 5 luces cada una son…',options:['9 luces','20 luces','45 luces'],answer:'20 luces'},
{question:'A Y falso produce…',options:['Verdadero','Falso','Una tercera opción'],answer:'Falso'},
{question:'falso O verdadero produce…',options:['Verdadero','Falso','No se puede saber'],answer:'Verdadero'},
{question:'NO verdadero es…',options:['Verdadero','Falso','Igual'],answer:'Falso'},
{question:'¿Qué termina primero dentro de bucles anidados?',options:['El bucle interior','El exterior','Ambos al mismo tiempo'],answer:'El bucle interior'},
{question:'Un bloque dentro de otro bloque está…',options:['Anidado','Borrado','Desordenado'],answer:'Anidado'},
{question:'¿Qué operador es verdadero si las dos entradas son verdaderas?',options:['Y','O','NO'],answer:'Y'},
{question:'Si un mensaje desconocido pide tu contraseña, debes…',options:['No compartirla y avisar a un adulto','Enviarla para revisar','Publicarla en el chat'],answer:'No compartirla y avisar a un adulto'},
{question:'¿Qué ayuda a reconocer un enlace sospechoso?',options:['Promete un premio y pide datos','Lo envía una persona conocida','No pide ninguna información'],answer:'Promete un premio y pide datos'}],advanced:{title:'Zona avanzada · código y sistemas',intro:'Explora trazas de Python y lógica compuesta. Estos retos son opcionales.',questions:[
{question:'¿Qué valores imprime for n in range(3): print(n)?',options:['1, 2, 3','0, 1, 2','0, 1, 2, 3'],answer:'0, 1, 2'},
{question:'edad=12. ¿Qué muestra if edad >= 10?',options:['pasa','no pasa','error'],answer:'pasa'},
{question:'x=4; x=x+3. ¿Qué valor tiene x al final?',options:['4','7','43'],answer:'7'},
{question:'A=true, B=false. Evalúa NO B Y A.',options:['Verdadero','Falso','Indeterminado'],answer:'Verdadero'},
{question:'¿Cuál contraseña de ejemplo es más difícil de adivinar?',options:['12345678','Río!Mapa_82Luna','password'],answer:'Río!Mapa_82Luna'}]}};
