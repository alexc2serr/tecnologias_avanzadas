/**
 * 01-callback.js — the error-first convention.
 *
 * Run it with:
 *   node 01-callback.js 200      → succeeds
 *   node 01-callback.js -5       → fails
 *
 * Node.js callbacks take the error as their FIRST argument, and the value
 * as the second. There is no try/catch here: an asynchronous error is not
 * thrown, it is handed to you. Forgetting to check `err` is the single most
 * common bug in callback-style code.
 */

function fetchTemperature(sensorId, callback) {
  setTimeout(() => {
    if (!Number.isInteger(sensorId) || sensorId <= 0) {
      // Convention: pass an Error, never a string.
      return callback(new Error(`invalid sensor id: ${sensorId}`));
    }
    callback(null, { sensorId, celsius: 21.4 });
  }, 500);
}

const id = Number.parseInt(process.argv[2] ?? '200', 10);

fetchTemperature(id, (err, reading) => {
  if (err) {
    console.error('could not read the sensor:', err.message);
    process.exitCode = 1;
    return; // always return after handling the error
  }
  console.log(`sensor ${reading.sensorId} reports ${reading.celsius} °C`);
});
