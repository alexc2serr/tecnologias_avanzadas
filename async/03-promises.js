/**
 * 03-promises.js — a promise is an object that represents a future value.
 *
 * Run it with:  node 03-promises.js
 *
 * A promise is in one of three states:
 *   pending    → the work is still running
 *   fulfilled  → it produced a value  (resolve)
 *   rejected   → it produced an error (reject)
 *
 * Once it leaves pending it never changes again. That immutability is what
 * makes promises safe to pass around and to chain.
 */

function fetchTemperature(sensorId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isInteger(sensorId) || sensorId <= 0) {
        reject(new Error(`invalid sensor id: ${sensorId}`));
        return;
      }
      resolve({ sensorId, celsius: 21.4 });
    }, 500);
  });
}

console.log('1 — asking for the reading');

const pending = fetchTemperature(200);
console.log('2 — what we have right now:', pending); // Promise { <pending> }

pending
  .then((reading) => console.log('3 — fulfilled with', reading))
  .catch((err) => console.error('3 — rejected with', err.message))
  .finally(() => console.log('4 — finally always runs'));

// Wrapping a callback API by hand is rarely necessary — the standard library
// already offers promise versions, e.g. node:fs/promises. And util.promisify
// converts any error-first callback function into a promise-returning one.
