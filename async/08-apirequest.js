/**
 * 08-apirequest.js — calling an HTTP API from Node.js.
 *
 * Run it with:  node 08-apirequest.js
 *
 * fetch is built into Node.js — no axios, no node-fetch, no
 * request-promise-native (that one has been deprecated for years).
 *
 * Two things people get wrong:
 *   1. fetch does NOT reject on 404 or 500. Only a network-level failure
 *      rejects. You must check response.ok yourself.
 *   2. A request with no timeout can hang forever. Give it a signal.
 */

const BASE = 'https://jsonplaceholder.typicode.com';

async function getJson(url, { timeoutMs = 5000 } = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    // 4xx and 5xx arrive here, not in the catch block.
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

async function main() {
  const post = await getJson(`${BASE}/posts/1`);
  console.log('post 1 :', post.title);

  // Independent requests -> fire them together.
  const [user, comments] = await Promise.all([
    getJson(`${BASE}/users/${post.userId}`),
    getJson(`${BASE}/posts/1/comments`),
  ]);
  console.log('author :', user.name, `<${user.email}>`);
  console.log('comments:', comments.length);

  // A POST with a JSON body. Note the two things fetch needs: the method
  // and a Content-Type header, because the body is a string.
  const response = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ title: 'Advanced Technologies', userId: 1 }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  console.log('created :', await response.json());

  // The error path: this id does not exist.
  try {
    await getJson(`${BASE}/posts/999999`);
  } catch (err) {
    console.log('expected failure:', err.message);
  }
}

main().catch((err) => {
  if (err.name === 'TimeoutError') console.error('the request took too long');
  else console.error('request failed:', err.message);
  process.exitCode = 1;
});
