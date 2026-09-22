/**
 * 10-combinators.js — running independent work at the same time.
 *
 * Run it with:  node 10-combinators.js
 *
 *   Promise.all         → all must succeed; rejects on the first failure
 *   Promise.allSettled  → never rejects; tells you the outcome of each one
 *   Promise.race        → the first to settle wins, success or failure
 *   Promise.any         → the first to SUCCEED wins; rejects only if all fail
 */

const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const failAfter = (ms, msg) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));

async function main() {
  // Sequential: 600 ms, for no reason.
  let t = Date.now();
  await delay(300, 'a');
  await delay(300, 'b');
  console.log(`sequential : ${Date.now() - t} ms`);

  // Concurrent: 300 ms. Start both, then wait for both.
  t = Date.now();
  const [a, b] = await Promise.all([delay(300, 'a'), delay(300, 'b')]);
  console.log(`Promise.all: ${Date.now() - t} ms ->`, a, b);

  // allSettled: partial failure is data, not an exception.
  const results = await Promise.allSettled([
    delay(100, 'sensor-1 ok'),
    failAfter(150, 'sensor-2 offline'),
  ]);
  console.log('allSettled:', results.map((r) => r.status).join(', '));
  for (const r of results) {
    console.log('  ', r.status === 'fulfilled' ? r.value : r.reason.message);
  }

  // race: useful as a timeout guard.
  try {
    await Promise.race([delay(500, 'slow answer'), failAfter(200, 'timed out')]);
  } catch (err) {
    console.log('race:', err.message);
  }

  // any: the first mirror that answers.
  const winner = await Promise.any([failAfter(100, 'mirror A down'), delay(200, 'mirror B')]);
  console.log('any:', winner);
}

main();
