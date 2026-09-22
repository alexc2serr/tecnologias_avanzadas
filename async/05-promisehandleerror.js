/**
 * 05-promisehandleerror.js — how errors travel through a chain.
 *
 * Run it with:  node 05-promisehandleerror.js
 *
 * Three things to notice:
 *   1. A rejection skips every .then() until it finds a .catch().
 *   2. A .catch() that returns a value RECOVERS the chain — the following
 *      .then() runs normally. Return nothing and the value is undefined.
 *   3. A .catch() that rethrows propagates the failure onwards.
 */

const fail = (msg) => Promise.reject(new Error(msg));

// --- 1. the rejection skips the middle steps -------------------------------
fail('database unreachable')
  .then(() => console.log('never printed'))
  .then(() => console.log('never printed either'))
  .catch((err) => console.log('1 — caught:', err.message));

// --- 2. recovering with a fallback value -----------------------------------
fail('cache miss')
  .catch((err) => {
    console.log('2 — recovering from:', err.message);
    return { source: 'fallback', value: 0 }; // the chain continues
  })
  .then((data) => console.log('2 — carried on with', data));

// --- 3. wrapping and rethrowing --------------------------------------------
fail('ECONNREFUSED')
  .catch((err) => {
    // Keep the original as `cause` so the stack trace is not lost.
    throw new Error('could not load the report', { cause: err });
  })
  .catch((err) => console.log('3 — caught:', err.message, '| cause:', err.cause.message));

// --- 4. the one you must not forget ----------------------------------------
// A rejected promise with no .catch() anywhere terminates the process in
// modern Node.js. Uncomment to see it:
// fail('nobody is listening');

// A last-resort safety net for reporting, never for control flow:
process.on('unhandledRejection', (reason) => {
  console.error('unhandled rejection:', reason);
  process.exitCode = 1;
});
