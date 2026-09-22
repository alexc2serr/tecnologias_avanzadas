/**
 * 03-blocking.js — what "never block the event loop" actually means.
 *
 * Run it with:  node 03-blocking.js
 *
 * The timer below is scheduled for 100 ms, but the synchronous loop keeps
 * the single thread busy for much longer. The timer cannot fire until the
 * thread is free, so it is late. In a web server this is the difference
 * between answering every request and answering none of them.
 */

const start = Date.now();

setTimeout(() => {
  console.log(`timer asked for 100 ms, fired after ${Date.now() - start} ms`);
}, 100);

// CPU-bound work: nothing is waiting, the thread is computing.
let total = 0;
for (let i = 0; i < 2_000_000_000; i++) total += i;

console.log(`blocking loop finished after ${Date.now() - start} ms (sum ${total})`);

/* Fixes for real CPU-bound work:
 *   - node:worker_threads    → run it on another thread
 *   - child_process          → run it in another process
 *   - split the work and yield with setImmediate between chunks
 */
