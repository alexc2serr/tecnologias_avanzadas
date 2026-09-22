/**
 * 00-callback.js — the shape of an asynchronous function.
 *
 * Run it with:  node 00-callback.js
 *
 * performAsyncOperation does not return its result. It cannot: the result
 * does not exist yet. Instead it accepts a function and calls it later.
 * That function is the callback.
 */

function performAsyncOperation(callback) {
  console.log('1 — starting the operation');

  // setTimeout stands in for any real wait: a disk read, a query, a request.
  setTimeout(() => {
    console.log('3 — the operation finished');
    callback('the result');
  }, 2000);
}

performAsyncOperation((result) => {
  console.log('4 — callback received ->', result);
});

console.log('2 — this line runs while we wait');

/* Expected output:
 * 1 — starting the operation
 * 2 — this line runs while we wait
 * (two seconds later)
 * 3 — the operation finished
 * 4 — callback received -> the result
 */
