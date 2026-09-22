/**
 * 00-hello.js — the smallest possible Node.js program.
 *
 * Run it with:   node 00-hello.js
 *
 * Notice what is available here that does NOT exist in a browser,
 * and what is missing that a browser would give you.
 */

console.log('Hello from Node.js', process.version);

// Globals that exist in Node.js but not in the browser:
console.log('platform :', process.platform);
console.log('cwd      :', process.cwd());
console.log('this file:', __filename); // CommonJS global; in ESM use import.meta.filename

// Globals that exist in the browser but NOT here — uncomment to see the error:
// console.log(window);    // ReferenceError: window is not defined
// console.log(document);  // ReferenceError: document is not defined
