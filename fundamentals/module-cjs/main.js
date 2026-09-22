/**
 * main.js — consuming a CommonJS module.
 *
 * Run it with:  node modules-cjs/main.js
 */

const { greet, farewell } = require('./greeter');
const path = require('node:path'); // always prefix built-ins with node:

console.log(greet('Advanced Technologies'));
console.log(farewell('callback hell'));
console.log('this folder:', path.basename(__dirname));
