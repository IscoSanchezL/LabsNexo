import type { Grade, Level } from '../../types';
const L=(title:string,prompt:string,mechanic:Level['mechanic'],concept:string,answer:string,options:string[],hint:string,code?:string[]):Level=>({title,prompt,mechanic,concept,answer,options,code,hint:[hint,'Revisa qué dato cambia y qué condición se cumple.',`La respuesta correcta es ${answer}.`],solution:answer});
export const g4:Grade={id:4,title:'Arquitectos de decisiones',world:'Taller de sistemas',accent:'#72ba8d',modules:[
{title:'Condiciones del camino',intro:'Programa decisiones: si se cumple una condición, ocurre una acción.',levels:[
L('Puerta automática','Si la tarjeta es válida, abre la puerta. La tarjeta es válida. ¿Qué ocurre?','conditional','Condicional si-entonces','La puerta se abre',['La puerta se abre','La puerta se cierra','No cambia'],'La condición sí se cumple.'),
L('Desvío por lluvia','Si llueve, el robot usa el techo. No llueve. ¿Qué camino usa?','conditional','Rama alternativa','Camino descubierto',['Camino cubierto','Camino descubierto','Se detiene'],'La condición es falsa, así que usa la otra ruta.'),
L('Batería baja','Si batería < 20%, recargar. La batería marca 15%. ¿Qué instrucción sigue?','conditional','Comparación en condición','Recargar',['Avanzar','Recargar','Apagar pantalla'],'Compara 15 con el límite de 20.'),
L('Sensor de borde','Si el sensor detecta el borde, girar. ¿Qué pasa cuando no lo detecta?','conditional','Condición falsa','Continuar la ruta',['Girar','Continuar la ruta','Volver al inicio'],'La acción del si no se ejecuta.'),
L('Dos posibles rutas','Si hay llave, abrir cofre; si no, buscarla. No hay llave.','conditional','Si / si no','Buscar la llave',['Abrir cofre','Buscar la llave','Cerrar el cofre'],'Sigue la rama si no.') ]},
{title:'Variables en cajas',intro:'Guarda información con etiquetas para usarla más tarde.',levels:[
L('Caja de puntos','La caja puntos guarda 7. ¿Qué valor muestra puntos + 2?','variable','Lectura y actualización','9',['7','9','72'],'Suma dos al valor guardado.'),
L('Etiqueta correcta','¿Qué nombre describe mejor una caja que guarda la temperatura?','variable','Nombrado de variable','temperatura',['caja1','temperatura','azul'],'El nombre indica qué información contiene.'),
L('Cambiar el valor','contador empieza en 3 y recibe +1. ¿Cuánto vale ahora?','variable','Actualización de estado','4',['3','4','31'],'Aumenta el valor en uno.'),
L('Dos cajas','x=4 y y=6. ¿Qué valor tiene x+y?','variable','Operaciones con variables','10',['2','10','46'],'Usa los valores, no las letras.'),
L('Variable de velocidad','velocidad=2. Luego velocidad=5. ¿Cuál es el valor actual?','variable','Asignación reemplaza valor','5',['2','5','7'],'La nueva asignación reemplaza la anterior.') ]},
{title:'Lógica aplicada',intro:'Combina reglas y condiciones para resolver situaciones.',levels:[
L('Acceso al laboratorio','Se permite entrar si estudiante=true Y gafas=true. Ambas son verdaderas.','logic','Conjunción Y','Acceso permitido',['Acceso permitido','Acceso denegado','Falta una condición'],'Con Y, las dos condiciones deben ser ciertas.'),
L('Alarma de seguridad','La alarma suena si puerta abierta O ventana abierta. Solo la ventana está abierta.','logic','Disyunción O','La alarma suena',['La alarma suena','No suena','La puerta se cierra'],'Con O basta que una condición sea verdadera.'),
L('No es de noche','noche=false. ¿Qué resultado tiene NO noche?','logic','Negación lógica','Verdadero',['Verdadero','Falso','No se puede saber'],'NO invierte verdadero y falso.'),
L('Comparar edades','¿Qué expresión es verdadera si edad=10?','logic','Operadores relacionales','edad >= 10',['edad < 8','edad = 9','edad >= 10'],'Diez es igual o mayor que diez.'),
L('Regla de entrega','Entrega si listo=true Y pago=true. Pago es falso. ¿Se entrega?','logic','Evaluación de condición compuesta','No',['Sí','No','Solo si está listo'],'En una regla Y, una condición falsa impide el resultado.') ]}],exam:[
{question:'Si la tarjeta es válida, abre la puerta. Es válida. ¿Qué ocurre?',options:['La puerta se abre','La puerta se cierra','No cambia'],answer:'La puerta se abre'},
{question:'puntos=7; puntos+2 da…',options:['7','9','72'],answer:'9'},
{question:'Batería=15. Si batería<20, ¿qué acción sigue?',options:['Recargar','Avanzar','Apagar el sensor'],answer:'Recargar'},
{question:'x=4 e y=6. ¿Cuánto vale x+y?',options:['2','10','46'],answer:'10'},
{question:'A Y B. A es verdadero y B es falso. La salida es…',options:['Verdadero','Falso','Depende del color'],answer:'Falso'},
{question:'En A O B, ¿qué basta para que la salida sea verdadera?',options:['Que una entrada sea verdadera','Que ambas sean falsas','Que no haya entradas'],answer:'Que una entrada sea verdadera'},
{question:'NO falso es…',options:['Verdadero','Falso','Igual a cero'],answer:'Verdadero'},
{question:'No hay llave; la regla dice buscarla. ¿Qué rama sigues?',options:['Buscar la llave','Abrir el cofre','Cerrar la puerta'],answer:'Buscar la llave'},
{question:'velocidad=2 y luego velocidad=5. ¿Cuál es el valor actual?',options:['2','5','7'],answer:'5'},
{question:'Si edad=10, ¿edad >= 10 es verdadero?',options:['Sí','No','No se puede comparar'],answer:'Sí'}],advanced:{title:'Sala de lógica avanzada',intro:'Combina varias condiciones y justifica cada paso.',questions:[
{question:'A=true, B=false. Evalúa NO B Y A.',options:['Verdadero','Falso','Indeterminado'],answer:'Verdadero'},
{question:'La alarma suena si (puerta O ventana) Y sistema activo. Solo ventana y sistema están activos.',options:['Suena','No suena','Falta la puerta'],answer:'Suena'},
{question:'Acceso requiere estudiante Y gafas. Solo estudiante es verdadero.',options:['Acceso permitido','Acceso denegado','Se permite a veces'],answer:'Acceso denegado'},
{question:'Si x cambia de 3 a 3+2 antes de evaluar x>4, ¿qué resultado?',options:['Verdadero','Falso','No definido'],answer:'Verdadero'},
{question:'Una condición doble tiene una rama Y y otra O. ¿Qué ayuda a leerla?',options:['Resolver cada grupo entre paréntesis','Cambiar el nombre de las variables','Leerla de derecha a izquierda siempre'],answer:'Resolver cada grupo entre paréntesis'}]}};
