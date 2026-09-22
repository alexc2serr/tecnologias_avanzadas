/**
 * 02-eventloop-order.js — in what order does this print?
 *
 * Predict the output BEFORE running it, then run:
 *   node 02-eventloop-order.js
 *
 * The rules:
 *   1. Synchronous code runs first, to completion.
 *   2. Then the microtask queues: process.nextTick before promises.
 *   3. Then the event loop phases, in order:
 *         timers → pending callbacks → idle/prepare → poll → check → close
 *      setTimeout belongs to "timers", setImmediate to "check".
 *   4. Microtasks are drained after EVERY callback, not once per turn.
 */

console.log('1 — synchronous start');

setTimeout(() => console.log('timers  — setTimeout 0'), 0);
setImmediate(() => console.log('check   — setImmediate'));

Promise.resolve().then(() => console.log('4 — promise callback (microtask)'));
process.nextTick(() => console.log('3 — process.nextTick (microtask, first)'));

console.log('2 — synchronous end');

/* The first four lines are always:
 *     1 — synchronous start
 *     2 — synchronous end
 *     3 — process.nextTick (microtask, first)
 *     4 — promise callback (microtask)
 *
 * The last two can come in EITHER order, and that surprises everybody.
 * From the main module, whether the 0 ms timer has already expired by the
 * time the loop reaches the timers phase depends on how long the process
 * took to start. Run this file a few times and you may see both orders.
 *
 * Inside an I/O callback the answer IS deterministic: the loop is already
 * past "timers" and about to reach "check", so setImmediate always wins.
 */

const fs = require('node:fs');

fs.readFile(__filename, () => {
  console.log('--- now inside an I/O callback (poll phase) ---');
  setTimeout(() => console.log('timers  — setTimeout 0  (second)'), 0);
  setImmediate(() => console.log('check   — setImmediate  (first, always)'));
});
