# Tecnologías Avanzadas — Guía de Estudio y Código Explicado "Para Tontos" 🚀

Repositorio de la asignatura **Tecnologías Avanzadas** (Universidad San Jorge). Recopilación de ejercicios iniciales y su destipamiento para poder entenderlos paso a paso. Leete todo si no quieres perderte nada Vag@.
---

## 📋 Requisitos para ejecutar los ejemplos

- **Node.js 22.5 o superior** (recomendado Node 24 LTS).
- Comprueba tu versión en la terminal con:
  ```bash
  node -v
  ```

---

## 🧠 ¿Qué es Node.js y por qué cambia el chip respecto al navegador?

Probablemente conoces JavaScript para poder cambiar colores, botones y cosas interactivas dentro de la web. 

**Node.js es simplemente el motor de JavaScript (V8, el mismo de Chrome) sacado del navegador y metido en tu ordenador o servidor:**
- **En el navegador:** tienes pantalla, ventanas, pestañas y botones (`window`, `document`, DOM).
- **En Node.js:** NO hay pantalla ni botones. A cambio, tienes **superpoderes en el sistema operativo**: puedes leer y crear archivos en el disco duro, acceder a la red, gestionar bases de datos y ejecutar procesos.

---

# 📁 Carpeta `fundamentals/` — Fundamentos de Node.js

Esta carpeta contiene los conceptos clave de arquitectura de Node.js: entorno global, paso de argumentos, el famoso **Event Loop** (bucle de eventos), bloqueos de CPU y sistemas de módulos.

---

### 1. `00-hello.js` — El "Hola Mundo" y diferencias con el navegador

> 📍 **Ruta:** [`fundamentals/00-hello.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/fundamentals/00-hello.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node fundamentals/00-hello.js
> # O usando el atajo de npm:
> npm run hello
> ```

#### ¿De qué va este archivo?
Es el programa más pequeño posible para ver qué cosas existen en Node.js que en una página web no existen, y qué cosas del navegador provocan un error si intentas usarlas en Node.

#### Explicación del código paso a paso:

```javascript
console.log('Hello from Node.js', process.version);
```
- `process`: Es un objeto global que Node te da siempre (no hace falta importarlo). Te da información y control sobre el programa que se está ejecutando.
- `process.version`: Imprime la versión exacta de Node que está corriendo (por ejemplo `v22.20.0`).

```javascript
console.log('platform :', process.platform);
console.log('cwd      :', process.cwd());
console.log('this file:', __filename);
```
- `process.platform`: Te dice en qué sistema operativo estás (`win32` para Windows, `linux` para Linux, `darwin` para Mac).
- `process.cwd()`: Significa *Current Working Directory*. Te dice desde qué carpeta has abierto la terminal y lanzado el comando.
- `__filename`: Es la ruta completa y absoluta del archivo que se está ejecutando en ese momento. *(Nota: esto existe en CommonJS; en los módulos modernos ESM se usa `import.meta.filename`)*.

```javascript
// console.log(window);    // ReferenceError: window is not defined
// console.log(document);  // ReferenceError: document is not defined
```
- Si descomentas estas líneas, el programa **explota con un error**.
- **¿Por qué?** Porque en Node no hay ventanas de navegador (`window`) ni árbol HTML (`document`). En el servidor solo hay código procesando datos.

---

### 2. `01-process.js` — Argumentos de terminal, variables de entorno y códigos de salida

> 📍 **Ruta:** [`fundamentals/01-process.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/fundamentals/01-process.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> # Uso manual (pasa el nombre y repeticiones que quieras):
> node fundamentals/01-process.js Alejandro 3
>
> # O usando el atajo de npm (ejecuta "Alice 2" preconfigurado):
> npm run process
>
> # En PowerShell pasando una variable de entorno:
> $env:GREETING="Hola"; node fundamentals/01-process.js Alejandro 3
> ```

#### ❓ La gran duda: ¿Por qué sale "Alice" si NO está en el código?

Si buscas en el código de `01-process.js`, la palabra `"Alice"` no está asignada a ninguna variable. Entonces, ¿de dónde sale?

Hay dos respuestas:
1. **Si ejecutaste `npm run process`:**  
   El profesor dejó preparado este atajo en [`package.json`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/package.json) (línea 11):
   ```json
   "process": "node fundamentals/01-process.js Alice 2"
   ```
   Al pulsar `npm run process`, npm escribe por ti en la terminal los argumentos `"Alice"` y `"2"`.
2. **Si lo ejecutas tú a mano:**  
   El script está hecho precisamente para recibir lo que tú quieras. Si ejecutas:
   ```bash
   node fundamentals/01-process.js MiNombre 5
   ```
   El programa saludará a `MiNombre` 5 veces. "Alice" solo era el ejemplo del profesor.

---

#### ¿De qué va este archivo?
Aprende a comunicarte con tu script: cómo pasarle parámetros al llamarlo por la consola, cómo leer variables de configuración del sistema (`process.env`) y cómo avisar al ordenador si el programa terminó con éxito o con error.

#### Explicación del código paso a paso:

```javascript
const [name, times = '1'] = process.argv.slice(2);
```
- **¿Qué es `process.argv`?** Es una lista (array) con todo lo que has tecleado en la terminal, separado por espacios.
  Si escribes en la consola:
  ```bash
  node fundamentals/01-process.js Alejandro 3
  ```
  Node construye internamente este array:
  - `process.argv[0]` = `"C:\...\node.exe"` *(Ruta al ejecutable de Node)*
  - `process.argv[1]` = `"C:\...\01-process.js"` *(Ruta al archivo script)*
  - `process.argv[2]` = `"Alejandro"` *(Primer argumento del usuario)*
  - `process.argv[3]` = `"3"` *(Segundo argumento del usuario)*

- **¿Por qué `.slice(2)`?**
  Las posiciones `[0]` y `[1]` son rutas internas del sistema. Con `.slice(2)` le decimos: *"Tira las 2 primeras posiciones y quédate con lo que viene a partir de la posición 2"* (`["Alejandro", "3"]`).

- **Desestructuración `[name, times = '1']`:**
  - El primer elemento se guarda en la variable `name` (`"Alejandro"`).
  - El segundo se guarda en la variable `times` (`"3"`). Si no pones segundo número, toma por defecto `'1'`.

```javascript
if (!name) {
  console.error('usage: node 01-process.js <name> [times]');
  process.exit(1);
}
```
- Si el usuario no escribió ningún nombre, mostramos un error de uso con `console.error`.
- `process.exit(1)`: **Códigos de salida (Exit Codes)**.
  - `0`: Significa "todo ha salido perfecto".
  - `1` (o cualquier número distinto de 0): Significa "algo ha fallado, abortamos misión". Esto permite que otros programas o scripts de CI/CD sepan que tu script petó.

```javascript
const greeting = process.env.GREETING ?? 'Hello';
const repeat = Number.parseInt(times, 10);
```
- `process.env`: Es un diccionario con las variables de entorno del sistema (o de un archivo `.env`).
- `??` (Nullish Coalescing): Si `process.env.GREETING` no existe (es `null` o `undefined`), usa por defecto `'Hello'`.
- `Number.parseInt(times, 10)`: Lo que entra por consola siempre entra como texto (`string`). Hay que convertirlo a número entero en base 10.

```javascript
if (Number.isNaN(repeat) || repeat < 1) {
  console.error(`"${times}" is not a positive integer`);
  process.exit(1);
}

for (let i = 0; i < repeat; i++) {
  console.log(`${greeting}, ${name}!`);
}
```
- Si el usuario puso letras en vez de un número para las repeticiones, o puso un número menor que 1, detenemos con error.
- Si todo es correcto, imprime el saludo el número de veces solicitado en un bucle `for`. Al llegar al final del archivo, Node finaliza automáticamente con código `0` (éxito).

---

### 3. `02-eventloop-order.js` — El Event Loop y el orden de ejecución

> 📍 **Ruta:** [`fundamentals/02-eventloop-order.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/fundamentals/02-eventloop-order.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node fundamentals/02-eventloop-order.js
> # O usando el atajo de npm:
> npm run eventloop
> ```

#### ¿De qué va este archivo? (La analogía del camarero)
Node.js es **monohilo** (*single-threaded*): imagínate un camarero con **una sola mano**. No puede hacer dos platos a la vez. Cuando le mandas varias tareas (temporizadores, promesas, lecturas de archivos), tiene una **agenda de prioridades estricta** para decidir qué atiende primero.

#### Las 4 Reglas de Oro del Event Loop:
1. **El código síncrono va primero y sin frenos:** Las líneas normales de JavaScript se ejecutan de arriba a abajo hasta terminar. Nadie las interrumpe.
2. **Microtareas (Microtasks) — Los clientes VIP:** En cuanto termina el código síncrono, Node atiende inmediatamente su cola de microtareas:
   - Primero: `process.nextTick` (el VIP absoluto, se cuela el primero).
   - Segundo: Las Promesas resueltas (`Promise.resolve().then(...)`).
3. **Macrotareas (Fases del Event Loop en libuv):**
   - **Fase de Timers:** `setTimeout` y `setInterval`.
   - **Fase de Poll (I/O):** Operaciones de entrada/salida (leer archivos del disco, peticiones de red).
   - **Fase de Check:** `setImmediate`.
4. **Las microtareas se vacían después de CADA callback**, no una vez por vuelta.

#### Desglose del código:

```javascript
console.log('1 — synchronous start');

setTimeout(() => console.log('timers  — setTimeout 0'), 0);
setImmediate(() => console.log('check   — setImmediate'));

Promise.resolve().then(() => console.log('4 — promise callback (microtask)'));
process.nextTick(() => console.log('3 — process.nextTick (microtask, first)'));

console.log('2 — synchronous end');
```

**¿Cuál es la salida de esta primera parte?**
1. `1 — synchronous start` *(Síncrono)*
2. `2 — synchronous end` *(Síncrono)*
3. `3 — process.nextTick (microtask, first)` *(Microtarea VIP 1)*
4. `4 — promise callback (microtask)` *(Microtarea VIP 2)*
5. Y ahora viene la sorpresa: entre `setTimeout 0` y `setImmediate`, **el orden en la raíz puede variar** según los milisegundos que tarde el procesador en arrancar el proceso.

#### La parte determinista dentro de I/O:

```javascript
const fs = require('node:fs');

fs.readFile(__filename, () => {
  console.log('--- now inside an I/O callback (poll phase) ---');
  setTimeout(() => console.log('timers  — setTimeout 0  (second)'), 0);
  setImmediate(() => console.log('check   — setImmediate  (first, always)'));
});
```
- Cuando estamos dentro de `fs.readFile`, el bucle de eventos se encuentra actualmente en la fase **Poll** (I/O).
- La siguiente fase inmediata en la rueda del Event Loop es **Check** (`setImmediate`).
- Por tanto, aquí **`setImmediate` SIEMPRE gana a `setTimeout 0`**, porque para llegar a `setTimeout` tendría que dar toda la vuelta completa al bucle.

---

### 4. `03-blocking.js` — ¿Qué significa "bloquear el Event Loop"?

> 📍 **Ruta:** [`fundamentals/03-blocking.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/fundamentals/03-blocking.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node fundamentals/03-blocking.js
> # O usando el atajo de npm:
> npm run blocking
> ```

#### ¿De qué va este archivo? (La analogía de la ventanilla del banco)
Imagina que en un banco solo hay una ventanilla abierta (un solo hilo). Si un cliente se pone a contar 2.000 millones de monedas a mano, **toda la cola de personas detrás se queda congelada**. Nadie avanza hasta que termine.

Eso es exactamente **bloquear el Event Loop**.

#### Desglose del código:

```javascript
const start = Date.now();

// Pedimos que este temporizador suene a los 100 ms
setTimeout(() => {
  console.log(`timer asked for 100 ms, fired after ${Date.now() - start} ms`);
}, 100);

// Trabajo intensivo de CPU que secuestra el hilo principal:
let total = 0;
for (let i = 0; i < 2_000_000_000; i++) total += i;

console.log(`blocking loop finished after ${Date.now() - start} ms (sum ${total})`);
```

#### ¿Qué ocurre cuando lo ejecutas?
- Le dijiste al `setTimeout` que saltara a los **100 ms**.
- Pero el bucle `for` tardó unos **1300 ms** en contar hasta 2.000 millones.
- Como Node solo tiene un hilo, el temporizador estuvo listo a los 100 ms pero **no pudo ejecutarse** hasta que el bucle `for` liberó el procesador.
- **Resultado:** El temporizador saltó con más de 1 segundo de retraso (`fired after 1360 ms`).

> [!WARNING]
> En un servidor web real, si bloqueas el Event Loop con cálculos pesados o bucles gigantes, **ningún otro usuario podrá cargar la página ni hacer peticiones**. Para cálculos pesados en Node se utilizan:
> - `worker_threads` (hilos secundarios de trabajo).
> - `child_process` (procesos separados).
> - Dividir el cálculo en trozos pequeños y ceder el turno con `setImmediate`.

---

### 5. `module-cjs/` — Módulos con CommonJS (El estilo clásico de Node)

> 📍 **Carpeta:** [`fundamentals/module-cjs/`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/fundamentals/module-cjs)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node fundamentals/module-cjs/main.js
> # O usando el atajo de npm:
> npm run modules:cjs
> ```

#### ¿Qué es un módulo?
Separar el código en diferentes archivos para tenerlo ordenado y no crear un archivo monstruoso de 5.000 líneas.

**CommonJS (CJS)** es el sistema con el que nació Node.js originalmente:
- Utiliza `require()` para importar.
- Utiliza `module.exports` para exportar.
- Es **síncrono**: cuando haces `require()`, Node se detiene, lee el archivo del disco, lo ejecuta y te devuelve el resultado en ese mismo instante.

#### Archivo 1: `greeter.js` (El que exporta)
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

function farewell(name) {
  return `Goodbye, ${name}.`;
}

// Ponemos en una "caja" todo lo que queremos hacer público hacia fuera:
module.exports = { greet, farewell };
```

#### Archivo 2: `main.js` (El que consume)
```javascript
// Importamos nuestras funciones locales de greeter.js:
const { greet, farewell } = require('./greeter');

// Importamos un módulo interno de Node (siempre con el prefijo node:):
const path = require('node:path');

console.log(greet('Advanced Technologies'));
console.log(farewell('callback hell'));
console.log('this folder:', path.basename(__dirname));
```
- `__dirname`: En CommonJS es una variable global que contiene la ruta de la carpeta donde vive este archivo.

---

### 6. `module-esm/` — Módulos con ES Modules (El estándar moderno)

> 📍 **Carpeta:** [`fundamentals/module-esm/`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/fundamentals/module-esm)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node fundamentals/module-esm/main.mjs
> # O usando el atajo de npm:
> npm run modules:esm
> ```

#### ¿Qué es ES Modules (ESM)?
Es el estándar moderno y oficial de JavaScript (el mismo que se utiliza en React, Vue, Angular y en el navegador moderno):
- Utiliza `import` y `export`.
- Se analiza estáticamente antes de ejecutarse (lo que permite herramientas de optimización como *tree-shaking*).
- La extensión `.mjs` le indica a Node que es un módulo ESM incluso si el proyecto no tiene `"type": "module"` en su `package.json`.

#### Archivo 1: `greeter.mjs` (El que exporta)
```javascript
// Exportaciones nombradas individuales:
export function greet(name) {
  return `Hello, ${name}!`;
}

export function farewell(name) {
  return `Goodbye, ${name}.`;
}

// También se puede tener una exportación por defecto (default export):
export default { greet, farewell };
```

#### Archivo 2: `main.mjs` (El que consume)
```javascript
// Importación nombrada (¡OJO! en ESM la extensión .mjs es obligatoria):
import { greet, farewell } from './greeter.mjs';
import path from 'node:path';

console.log(greet('Advanced Technologies'));
console.log(farewell('callback hell'));

// En ESM NO existen __dirname ni __filename; se usa import.meta:
console.log('this folder:', path.basename(import.meta.dirname));

// Top-level await: puedes hacer await en la raíz sin meterlo dentro de una función async
const { version } = await import('node:process');
console.log('running on Node.js', version);
```

---

## 🥊 Resumen rápido: CommonJS vs ES Modules

| Característica | CommonJS (`.js` clásico) | ES Modules (`.mjs` / `"type": "module"`) |
|---|---|---|
| **Sintaxis de importación** | `const x = require('./x');` | `import x from './x.mjs';` |
| **Sintaxis de exportación** | `module.exports = { ... };` | `export const ...` o `export default ...` |
| **¿Ruta del archivo/carpeta?** | `__dirname` y `__filename` | `import.meta.dirname` y `import.meta.filename` |
| **Top-level `await`** | ❌ No disponible (da error) | ✅ Disponible directamente en la raíz |
| **Poner extensión al importar** | Opcional (`require('./greeter')`) | Obligatorio (`import './greeter.mjs'`) |
| **Estándar** | Específico de Node.js tradicional | Estándar oficial de JavaScript en cualquier entorno |

---

# 📁 Carpeta `async/` — Programación Asíncrona en Node.js ⏱️

### 🧭 La gran historia de la asincronía (explicada para tontos)

En JavaScript y Node.js solo hay **un camarero** (es monohilo / *single-threaded*). 

Si a ese camarero le pides un plato que tarda 15 minutos en el horno (como leer un archivo pesado del disco duro, consultar una base de datos o pedir datos a una API en internet):
- **Si fuera síncrono:** El camarero se quedaría parado delante del horno mirando fijamente durante 15 minutos. Nadie más en el restaurante podría pedir comida ni pagar la cuenta. ¡El restaurante se colapsa!
- **Como es asíncrono:** El camarero mete el plato al horno, se apunta una nota y **sigue atendiendo a otros clientes**. Cuando el horno pita, vuelve, recoge el plato y te lo sirve.

Para gestionar ese *"avísame cuando el horno pite"*, JavaScript ha evolucionado a lo largo de los años pasando por 3 etapas:
1. **Callbacks** (El método antiguo): Le pasas una función al horno para que la ejecute al pitar.
2. **Promesas (`Promise`)** (La gran mejora): Un objeto ticket que representa el plato futuro.
3. **`async` / `await`** (La forma moderna): Se escribe igual de fácil que el código de siempre, pero sin bloquear al camarero.

Vamos a destripar cada archivo de la carpeta `async/` uno a uno:

---

### 1. `00-callback.js` — ¿Por qué existen los Callbacks?

> 📍 **Ruta:** [`async/00-callback.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/00-callback.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/00-callback.js
> # O con npm:
> npm run callback
> ```

#### ¿De qué va este archivo?
Demuestra que una función asíncrona **no puede hacer `return` de su resultado**, porque cuando se ejecuta, el resultado aún no existe en el tiempo. Por eso, en vez de devolver el valor, te pide que le pases una función (el *callback*) para llamarla cuando termine.

#### Desglose del código paso a paso:

```javascript
function performAsyncOperation(callback) {
  console.log('1 — starting the operation');

  // setTimeout simula cualquier espera real: leer del disco, una consulta SQL, etc.
  setTimeout(() => {
    console.log('3 — the operation finished');
    callback('the result'); // ¡Aquí llama a tu función con el resultado!
  }, 2000);
}
```
- La función recibe como argumento una función llamada `callback`.
- `setTimeout(..., 2000)` le dice a Node: *"espera 2 segundos (2000 ms) sin molestar al hilo principal"*.
- Cuando pasan los 2 segundos, se ejecuta el callback entregando `'the result'`.

```javascript
performAsyncOperation((result) => {
  console.log('4 — callback received ->', result);
});

console.log('2 — this line runs while we wait');
```
- Pasamos una función flecha `(result) => { ... }`.
- **Fíjate en el orden de salida en la terminal:**
  ```text
  1 — starting the operation
  2 — this line runs while we wait
  (pasan 2 segundos de silencio...)
  3 — the operation finished
  4 — callback received -> the result
  ```
- **La lección:** La línea `2` se ejecuta **mientras estamos esperando**. El programa no se congeló, siguió hacia adelante.

---

### 2. `01-callback.js` — El patrón "Error-First" en Node.js

> 📍 **Ruta:** [`async/01-callback.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/01-callback.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> # Caso que funciona bien:
> node async/01-callback.js 200
> # O con npm:
> npm run callback:errors
>
> # Caso que falla a propósito (id negativo):
> node async/01-callback.js -5
> ```

#### ¿De qué va este archivo?
En el Node.js clásico, los callbacks tienen una ley sagrada llamada **Error-First Callback**:
- El **primer parámetro** siempre está reservado para el error (`err`).
- El **segundo parámetro** es para los datos reales (`data`).
- Si todo fue bien: `callback(null, datos)` (el error es `null`).
- Si algo falló: `callback(new Error('algo salió mal'))`.

#### Desglose del código paso a paso:

```javascript
function fetchTemperature(sensorId, callback) {
  setTimeout(() => {
    if (!Number.isInteger(sensorId) || sensorId <= 0) {
      // Si el id es malo, llamamos al callback pasando un Error en el primer parámetro:
      return callback(new Error(`invalid sensor id: ${sensorId}`));
    }
    // Si es bueno, el primer parámetro es null (sin error) y el segundo son los datos:
    callback(null, { sensorId, celsius: 21.4 });
  }, 500);
}
```

```javascript
const id = Number.parseInt(process.argv[2] ?? '200', 10);

fetchTemperature(id, (err, reading) => {
  if (err) {
    console.error('could not read the sensor:', err.message);
    process.exitCode = 1;
    return; // ¡OJO! Pon siempre return después de manejar el error para no seguir ejecutando
  }
  console.log(`sensor ${reading.sensorId} reports ${reading.celsius} °C`);
});
```
- **¿Por qué no usamos `try / catch` aquí?** Porque la función asíncrona corre más tarde en el Event Loop; el `try / catch` original ya murió cuando el callback se ejecuta. Por eso en callbacks el error te lo dan en mano en el primer argumento `err`.

---

### 3. `02-callbackhell.js` — El temido "Callback Hell" (La pirámide de la muerte)

> 📍 **Ruta:** [`async/02-callbackhell.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/02-callbackhell.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/02-callbackhell.js
> # O con npm:
> npm run callback:hell
> ```

#### ¿De qué va este archivo?
Muestra el gran problema que hizo sufrir a los programadores de JavaScript durante años. 

Imagina un proceso con 4 pasos donde **cada paso necesita el resultado del anterior**:
1. Buscar un usuario (`findUser`).
2. Con ese usuario, buscar sus pedidos (`findOrdersOf`).
3. Con el primer pedido, buscar su factura (`findInvoiceOf`).
4. Con esa factura, marcarla como pagada (`markAsPaid`).

#### El código y por qué es un dolor de muelas:

```javascript
findUser('Alice', (err, user) => {
  if (err) return console.error(err);

  findOrdersOf(user, (err, orders) => {
    if (err) return console.error(err);

    findInvoiceOf(orders[0], (err, invoice) => {
      if (err) return console.error(err);

      markAsPaid(invoice, (err, paidInvoice) => {
        if (err) return console.error(err);

        console.log('done:', paidInvoice);
      });
    });
  });
});
```
- **El problema:**
  1. El código se desplaza hacia la derecha formando una pirámide horizontal (`>`).
  2. Tienes que escribir `if (err) return console.error(err);` una y otra vez en cada piso de la pirámide.
  3. Si tienes 10 pasos, el código se vuelve completamente inleíble e inaguantable de mantener.

---

### 4. `03-promises.js` — ¿Qué es una Promesa? Estados y funcionamiento

> 📍 **Ruta:** [`async/03-promises.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/03-promises.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/03-promises.js
> # O con npm:
> npm run promises
> ```

#### La metáfora de la hamburguesería 🍔
Vas al mostrador de una hamburguesería, pides tu menú y te dan un **ticket con un número**:
1. **`pending` (Pendiente):** Tienes el ticket en la mano. La hamburguesa se está cocinando. Aún no sabes si saldrá bien o si se quemará.
2. **`fulfilled` (Cumplida / Resuelta):** Suena tu número y te dan la bandeja con la hamburguesa (`resolve(valor)`).
3. **`rejected` (Rechazada / Fallida):** Te dicen que se ha acabado la carne o se ha roto la freidora (`reject(error)`).

> [!IMPORTANT]
> Una Promesa es **inmutable**: una vez que pasa de `pending` a `fulfilled` o a `rejected`, **su estado jamás vuelve a cambiar**.

#### Desglose del código:

```javascript
function fetchTemperature(sensorId) {
  // Creamos y devolvemos una Promesa:
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isInteger(sensorId) || sensorId <= 0) {
        reject(new Error(`invalid sensor id: ${sensorId}`)); // Si falla
        return;
      }
      resolve({ sensorId, celsius: 21.4 }); // Si tiene éxito
    }, 500);
  });
}
```

```javascript
const pending = fetchTemperature(200);
console.log('2 — what we have right now:', pending); // Imprime: Promise { <pending> }

pending
  .then((reading) => console.log('3 — fulfilled with', reading)) // Se ejecuta si hubo éxito
  .catch((err) => console.error('3 — rejected with', err.message)) // Se ejecuta si hubo error
  .finally(() => console.log('4 — finally always runs')); // Se ejecuta SIEMPRE al final
```
- `.then()`: Recibe el dato cuando la promesa se resuelve con éxito.
- `.catch()`: Atrapa el error si la promesa fue rechazada.
- `.finally()`: Se ejecuta siempre (haya ido bien o mal). Es ideal para cosas como apagar la luz, cerrar la conexión a la base de datos o quitar el circulito de carga en una web.

---

### 5. `04-promisechaining.js` — Encadenamiento de Promesas (Derrotando a la pirámide)

> 📍 **Ruta:** [`async/04-promisechaining.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/04-promisechaining.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/04-promisechaining.js
> # O con npm:
> npm run promises:chain
> ```

#### ¿De qué va este archivo?
Hacemos exactamente la misma tarea de los 4 pasos dependientes de `02-callbackhell.js` (usuario -> pedidos -> factura -> pagar), pero usando Promesas.

#### Desglose del código:

```javascript
findUser('Alice')
  .then((user) => findOrdersOf(user))
  .then((orders) => findInvoiceOf(orders[0]))
  .then((invoice) => markAsPaid(invoice))
  .then((paidInvoice) => console.log('done:', paidInvoice))
  .catch((err) => {
    console.error('the sequence failed:', err.message);
    process.exitCode = 1;
  });
```

#### Las 2 Reglas de Oro del Encadenamiento:
1. **Lo que retornes (`return`) dentro de un `.then()` se convierte en la entrada del siguiente `.then()`**. Si devuelves una nueva promesa, el siguiente `.then()` espera automáticamente a que esa promesa termine antes de ejecutarse.
   *(⚠️ Si te olvidas de hacer `return`, el siguiente paso recibirá `undefined`)*.
2. **Un solo `.catch()` al final de la fila:** Ya no tienes que comprobar errores en cada paso. Si cualquiera de las 4 funciones falla, JavaScript se salta el resto de pasos y cae directamente en el `.catch()` final.

El código ahora crece **hacia abajo**, limpio y ordenado, en vez de hacia la derecha.

---

### 6. `05-promisehandleerror.js` — Cómo viajan los errores en las Promesas

> 📍 **Ruta:** [`async/05-promisehandleerror.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/05-promisehandleerror.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/05-promisehandleerror.js
> # O con npm:
> npm run promises:errors
> ```

#### Los 3 comportamientos clave que debes conocer:

#### 1. El error se salta los pasos intermedios
```javascript
fail('database unreachable')
  .then(() => console.log('never printed'))
  .then(() => console.log('never printed either'))
  .catch((err) => console.log('1 — caught:', err.message));
```
- Si la promesa falla al principio, ningún `.then()` intermedio se ejecuta; vuela directo al `.catch()`.

#### 2. Recuperarse de un fallo con un valor de respaldo (*Fallback*)
```javascript
fail('cache miss')
  .catch((err) => {
    console.log('2 — recovering from:', err.message);
    return { source: 'fallback', value: 0 }; // Devolvemos un valor seguro
  })
  .then((data) => console.log('2 — carried on with', data));
```
- Si dentro de un `.catch()` haces un `return` con un dato, **la cadena se recupera**. El `.then()` que venga después se ejecutará con normalidad recibiendo ese dato.

#### 3. Relanzar el error añadiendo contexto (`cause`)
```javascript
fail('ECONNREFUSED')
  .catch((err) => {
    // Relanzamos con un mensaje más claro, pero guardamos el error original como causa:
    throw new Error('could not load the report', { cause: err });
  })
  .catch((err) => console.log('3 — caught:', err.message, '| cause:', err.cause.message));
```
- `{ cause: err }` es una característica moderna de JavaScript para no perder el rastro de la avería original.

> [!CAUTION]
> **Unhandled Rejection (Promesa sin atrapar):** Si una promesa se rechaza y no tiene ningún `.catch()`, Node.js moderno **mata el proceso entero** con error. No dejes promesas sueltas sin capturar.

---

### 7. `06-asyncawait.js` — `async` y `await` (La forma definitiva de escribir código)

> 📍 **Ruta:** [`async/06-asyncawait.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/06-asyncawait.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/06-asyncawait.js
> # O con npm:
> npm run asyncawait
> # O con reinicio automático al guardar cambios:
> npm run watch:asyncawait
> ```

#### ¿De qué va este archivo?
`async/await` es simplemente una forma más cómoda y elegante de escribir Promesas (lo que en programación se llama *"azúcar sintáctico"*).

#### Desglose del código:

```javascript
async function settleInvoiceOf(name) {
  const user = await findUser(name);
  const orders = await findOrdersOf(user);
  const invoice = await findInvoiceOf(orders[0]);
  return markAsPaid(invoice);
}
```
- Poner `async` delante de una función hace que **siempre devuelva una Promesa**.
- Poner `await` hace que JavaScript espere a que esa promesa se cumpla para darte el valor en esa misma línea.
- **¿Bloquea el hilo?** ¡NO! `await` pausa **solo esa función**, dejando al hilo de Node libre para hacer otras cosas.
- **El manejo de errores:** Ahora puedes usar el `try / catch` tradicional de toda la vida:

```javascript
async function main() {
  try {
    const paidInvoice = await settleInvoiceOf('Alice');
    console.log('done:', paidInvoice);
  } catch (err) {
    console.error('the sequence failed:', err.message);
    process.exitCode = 1;
  }
}

main();
```

---

### 8. `07-files.js` — Manejo de archivos en disco con `node:fs/promises`

> 📍 **Ruta:** [`async/07-files.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/07-files.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/07-files.js
> # O con npm:
> npm run files
> ```

#### Las 3 formas de trabajar con archivos en Node:
1. `fs.readFile(path, cb)`: Con callbacks (la antigua).
2. `fs.readFileSync(path)`: Síncrona bloqueante (congela todo mientras lee; evítala en servidores).
3. `fs/promises` con `await`: La moderna y recomendada.

#### Desglose del código:

```javascript
const fs = require('node:fs/promises');
const path = require('node:path');

const dataDir = path.join(__dirname, 'tmp');
const file = path.join(dataDir, 'readings.json');

// 1. Crear carpeta (recursive: true evita error si ya existe)
await fs.mkdir(dataDir, { recursive: true });

// 2. Escribir archivo (JSON en texto)
await fs.writeFile(file, JSON.stringify(readings, null, 2), 'utf8');

// 3. Leer archivo
const raw = await fs.readFile(file, 'utf8');
const parsed = JSON.parse(raw);
```

> [!WARNING]
> **¡Cuidado con la codificación `'utf8'`!** Si haces `await fs.readFile(file)` sin poner `'utf8'`, Node no te devolverá texto, sino un objeto `Buffer` con bytes en hexadecimal (`<Buffer 5b 0a 20 ...>`).

```javascript
// 4. Añadir texto al final de un log sin borrar lo anterior
await fs.appendFile(path.join(dataDir, 'audit.log'), `read at ${new Date().toISOString()}\n`);

// 5. Listar los archivos de una carpeta
const files = await fs.readdir(dataDir);
```

#### El error típico `ENOENT`:
```javascript
try {
  await fs.readFile(path.join(dataDir, 'does-not-exist.txt'), 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('expected failure: file not found (ENOENT)');
  } else {
    throw err; // Si es otro error inesperado, relánzalo
  }
}
```
- `ENOENT` significa **Error NO ENTry** (el archivo o la carpeta no existe). Es el error más típico al trabajar con rutas.

---

### 9. `08-apirequest.js` — Peticiones HTTP a APIs externas con `fetch` nativo

> 📍 **Ruta:** [`async/08-apirequest.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/08-apirequest.js)  
> ▶️ **Cómo ejecutarlo:** *(Requiere conexión a internet)*
> ```bash
> node async/08-apirequest.js
> # O con npm:
> npm run api
> ```

#### ¿De qué va este archivo?
Desde Node.js 18, `fetch` viene **integrado de fábrica**. Ya no necesitas instalar paquetes de terceros como `axios` o `node-fetch`.

#### Las 2 trampas mortales de `fetch` que debes vigilar:
1. **`fetch` NO falla ni salta al `catch` cuando el servidor te devuelve un 404 (No encontrado) o un 500 (Error de servidor).** Para `fetch`, mientras el servidor responda algo, la conexión fue un éxito. Tienes que comprobar tú mismo `if (!response.ok)`:
   ```javascript
   if (!response.ok) {
     throw new Error(`${response.status} ${response.statusText}`);
   }
   ```
2. **Si el servidor se queda congelado, tu petición puede quedarse colgada para siempre.** Se soluciona poniendo un tiempo límite con `signal: AbortSignal.timeout(5000)`.

#### Petición GET y Petición POST en el código:

```javascript
// GET: Descargar datos
const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
  signal: AbortSignal.timeout(5000), // Cancelar si tarda más de 5 segundos
});
const post = await response.json();

// POST: Enviar nuevos datos al servidor
const resPost = await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // Le avisa al servidor que mandamos JSON
    'Accept': 'application/json',
  },
  body: JSON.stringify({ title: 'Advanced Technologies', userId: 1 }), // El cuerpo debe ser un string
  signal: AbortSignal.timeout(5000),
});
```

---

### 10. `09-dboperations.js` — Base de datos SQLite local con `node:sqlite`

> 📍 **Ruta:** [`async/09-dboperations.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/09-dboperations.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/09-dboperations.js
> # O con npm:
> npm run db
> ```

#### ¿De qué va este archivo?
Node.js 22.5+ incluye de forma nativa el módulo `node:sqlite` para trabajar con bases de datos SQLite locales en un fichero (sin instalar nada de npm).

#### ¿Por qué `DatabaseSync` es síncrono?
Porque un archivo SQLite en tu propio disco duro tarda microsegundos de CPU en responder, no viaja a través de internet. Por eso no necesita `await`.

#### Desglose del código:

```javascript
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./tmp/task-manager.db');

// 1. Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`);
```

#### ¡Regla de oro de seguridad: Usa siempre placeholders (`?`)!
```javascript
// BIEN: Sentencia preparada con placeholder '?' (Protege contra Inyección SQL):
const insertUser = db.prepare('INSERT INTO users (name) VALUES (?)');
insertUser.run('Alice');

// Consultar todas las filas:
const users = db.prepare('SELECT * FROM users').all();

// Consultar una sola fila:
const oneUser = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
```

#### Transacciones (`BEGIN`, `COMMIT`, `ROLLBACK`) — Todo o nada:
```javascript
db.exec('BEGIN'); // Empezamos la transacción
try {
  complete.run(1);
  complete.run(2);
  db.exec('COMMIT'); // Todo fue bien, guardamos cambios definitivamente
} catch (err) {
  db.exec('ROLLBACK'); // Algo falló: deshacemos todo para no dejar datos a medias
  throw err;
}
```

---

### 11. `10-combinators.js` — Combinadores de Promesas (Concurrencia vs Secuencial)

> 📍 **Ruta:** [`async/10-combinators.js`](file:///c:/Users/AlejandroSerranoCalv/OneDrive%20-%20Fundacion%20CIRCE/Personal/Universidad/Tecnologias_Avanzadas/async/10-combinators.js)  
> ▶️ **Cómo ejecutarlo:**
> ```bash
> node async/10-combinators.js
> # O con npm:
> npm run combinators
> ```

#### Secuencial vs Concurrente (El error de principiante):
Imagina dos tareas independientes que tardan 300 ms cada una:
```javascript
// MAL (Secuencial innecesario): Tarda 300 + 300 = 600 ms
await delay(300);
await delay(300);

// BIEN (Concurrente con Promise.all): Las lanzas a la vez -> Tarda solo 300 ms
await Promise.all([delay(300), delay(300)]);
```

#### Los 4 Combinadores explicados con ejemplos de la vida real:

| Combinador | ¿Cómo funciona? | ¿Cuándo usarlo? |
|---|---|---|
| **`Promise.all`** | **"O todos ganan o todo se cancela"**.<br>Espera a que todas salgan bien. En cuanto UNA sola falla, la promesa entera es rechazada inmediatamente. | Cuando necesitas que todos los datos estén presentes sí o sí (ej: cargar el perfil del usuario Y sus pedidos para pintar la pantalla). |
| **`Promise.allSettled`** | **"El informe completo"**.<br>Espera a que todas terminen, den error o salgan bien. **Nunca es rechazada**. Devuelve una lista con el resultado de cada una (`status: 'fulfilled'` o `'rejected'`). | Cuando el fallo parcial es aceptable (ej: consultar 10 sensores de temperatura y mostrar los que respondan, ignorando los apagados). |
| **`Promise.race`** | **"Carrera de velocidad pura"**.<br>La primera promesa que termine gana el trofeo, **le da igual si fue con éxito o con error**. | Para poner límites de tiempo (*timeouts*): enfrentas tu petición contra un temporizador que falla a los 3 segundos. |
| **`Promise.any`** | **"El primer éxito gana"**.<br>Ignora los fallos y se queda con la primera que responda bien. Solo falla si **absolutamente todas** fallan. | Para servidores espejo (*mirrors*): pides un archivo a 3 servidores réplica distintos y te quedas con el primero que te lo entregue. |

---

## 🎯 Chuleta final de comandos para probar la carpeta `async/`

```bash
npm run callback          # 00: Por qué existen los callbacks
npm run callback:errors   # 01: Convención Error-first
npm run callback:hell     # 02: El infierno de los callbacks
npm run promises          # 03: Promesas y sus 3 estados
npm run promises:chain    # 04: Encadenar .then() en vertical
npm run promises:errors   # 05: Cómo viajan los errores en promesas
npm run asyncawait        # 06: async / await con try-catch
npm run files             # 07: Archivos con fs/promises
npm run api               # 08: Peticiones HTTP con fetch
npm run db                # 09: SQLite local con DatabaseSync
npm run combinators       # 10: all, allSettled, race, any
```
