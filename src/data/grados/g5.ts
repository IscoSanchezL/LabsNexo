import type { Grade, Level } from '../../types';
const L=(title:string,prompt:string,mechanic:Level['mechanic'],concept:string,answer:string,options:string[],hint:string,code?:string[],sequence?:string[]):Level=>({title,prompt,mechanic,concept,answer,options,code,sequence,hint:[hint,'Aplica la regla en orden y revisa el resultado.',`Solución: ${answer}.`],solution:answer});
export const g5:Grade={id:5,title:'Inventores de algoritmos',world:'Fábrica de ideas',accent:'#df8b68',modules:[
{title:'Funciones propias',intro:'Agrupa instrucciones con un nombre y reutiliza ese bloque.',levels:[
L('Bloque de saludo','Crea una función saludar que diga hola y luego se ejecute. ¿Qué ocurre al llamarla?','function','Definición y llamada','Muestra hola',['No ocurre nada','Muestra hola','Se repite sin parar'],'Llamar una función ejecuta su contenido.',['def saludar: mostrar hola','saludar()']),
L('Empaqueta la rutina','Tres estaciones requieren “avanzar, girar, avanzar”. ¿Qué función reutilizas?','function','Abstracción de secuencia','ruta_corta()',['ruta_corta()','borrar_todo()','inicio()'],'Ponle nombre al conjunto de pasos repetido.',['def ruta_corta','avanzar','girar','avanzar']),
L('Parámetro de distancia','Una función mover(pasos) recibe 4. ¿Cuántas casillas avanza?','function','Parámetros','4',['2','4','8'],'El parámetro guarda el valor que recibe.'),
L('Evita repetir código','¿Qué ventaja tiene guardar una secuencia como función?','function','Reutilización','Usarla en varios lugares',['Ocupa más bloques','Usarla en varios lugares','Elimina los datos'],'La misma función se puede llamar muchas veces.'),
L('Función con resultado','calcular_doble(6) devuelve el doble. ¿Qué valor devuelve?','function','Retorno de funciones','12',['6','10','12'],'Multiplica la entrada por dos.') ]},
{title:'Ordenamiento visual',intro:'Observa comparaciones sucesivas y sigue cómo cambia la lista.',levels:[
L('Primera burbuja','Lista [4, 2, 3]. En la primera comparación, ¿qué valores se intercambian?','sort','Burbuja compara vecinos','4 y 2',['4 y 2','2 y 3','4 y 3'],'Compara primero los dos primeros vecinos.',['[4,2,3] → compara 4 y 2'],['4','2','3']),
L('Siguiente comparación','Tras [2, 4, 3], ¿qué ocurre al comparar 4 y 3?','sort','Intercambio adyacente','Queda [2, 3, 4]',['Queda [4, 2, 3]','Queda [2, 3, 4]','Queda [3, 4, 2]'],'El mayor de los dos pasa a la derecha.',undefined,['2','4','3']),
L('Lista casi lista','[1, 3, 2] al comparar 3 y 2 se transforma en…','sort','Traza de ordenamiento','[1, 2, 3]',['[1, 2, 3]','[3, 1, 2]','[1, 3, 2]'],'Intercambia los vecinos si están desordenados.',undefined,['1','3','2']),
L('Cuenta comparaciones','¿Cuántas parejas vecinas compara una pasada para 4 valores?','sort','Pasada de burbuja','3',['2','3','4'],'Una lista de cuatro tiene tres parejas vecinas.',undefined,['6','2','5','1']),
L('Orden ascendente','Ordena 5, 1, 4 de menor a mayor.','sort','Orden ascendente','[1, 4, 5]',['[5, 4, 1]','[1, 4, 5]','[1, 5, 4]'],'El menor debe quedar al comienzo.',undefined,['5','1','4']) ]},
{title:'Código binario',intro:'Cada interruptor aporta un valor: encendido es 1 y apagado es 0.',levels:[
L('Bombillos 1 0 1','¿Qué número decimal representa el binario 101?','binary','Sistema binario posicional','5',['4','5','6'],'Las posiciones valen 4, 2 y 1.'),
L('Enciende el 6','¿Qué combinación de valores suma 6?','binary','Representar suma en binario','110',['101','110','111'],'Combina 4 y 2; deja apagado el 1.'),
L('Valor de la derecha','En 1001, ¿cuánto vale el interruptor de la derecha?','binary','Valor posicional binario','1',['1','2','8'],'La posición más a la derecha vale uno.'),
L('Suma de luces','Los interruptores 8, 4, 2, 1 están en 0,1,1,0. ¿Qué total?','binary','Conversión binaria','6',['5','6','7'],'Suma solo los valores encendidos.'),
L('Forma el nueve','¿Qué patrón binario representa 9?','binary','Codificación de números','1001',['1000','1001','1010'],'Nueve es ocho más uno.') ]}],exam:[
{question:'¿Qué ocurre al llamar una función?',options:['Se ejecutan sus instrucciones','Se borra el programa','Se apaga el equipo'],answer:'Se ejecutan sus instrucciones'},
{question:'mover(4) usa 4 como…',options:['Un parámetro','Un error','Una respuesta'],answer:'Un parámetro'},
{question:'Burbuja compara…',options:['Elementos vecinos','El primero con el último','Elementos al azar'],answer:'Elementos vecinos'},
{question:'[4,2] tras comparar e intercambiar queda…',options:['[2,4]','[4,2]','[4,4]'],answer:'[2,4]'},
{question:'Una pasada para 4 valores compara… parejas vecinas.',options:['2','3','4'],answer:'3'},
{question:'¿Qué número decimal representa 101 en binario?',options:['4','5','6'],answer:'5'},
{question:'¿Qué patrón binario suma 4+2?',options:['101','110','111'],answer:'110'},
{question:'¿Cuánto vale el interruptor de la derecha?',options:['1','2','8'],answer:'1'},
{question:'0110 usa valores 8,4,2,1. ¿Cuánto suma?',options:['5','6','7'],answer:'6'},
{question:'¿Qué patrón representa nueve?',options:['1000','1001','1010'],answer:'1001'}],advanced:{title:'Banco de algoritmos',intro:'Retos opcionales de eficiencia, trazado y representación.',questions:[
{question:'¿Cuántas comparaciones hace una pasada de burbuja con 8 elementos?',options:['7','8','16'],answer:'7'},
{question:'En [5,2,4], tras comparar 5 y 2, la lista queda…',options:['[2,5,4]','[5,2,4]','[2,4,5]'],answer:'[2,5,4]'},
{question:'¿Qué representación binaria corresponde a 13?',options:['1011','1101','1110'],answer:'1101'},
{question:'Una función recibe n y devuelve n×n. Para n=5 devuelve…',options:['10','20','25'],answer:'25'},
{question:'¿Qué mejora suele aportar una función reutilizable?',options:['Evita repetir las mismas instrucciones','Hace que el algoritmo no necesite datos','Siempre reduce el resultado a la mitad'],answer:'Evita repetir las mismas instrucciones'}]}};
