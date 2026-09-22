/**
 * main.mjs — consuming an ES module.
 *
 * Run it with:  node modules-esm/main.mjs
 *
 * Differences you can see here:
 *   - import must appear at the top level and the path needs its extension
 *   - there is no __dirname / __filename; use import.meta instead
 *   - top-level await is allowed
 */

import { greet, farewell } from './greeter.mjs';
import path from 'node:path';

console.log(greet('Advanced Technologies'));
console.log(farewell('callback hell'));
console.log('this folder:', path.basename(import.meta.dirname));

// Top-level await: impossible in CommonJS, ordinary here.
const { version } = await import('node:process');
console.log('running on Node.js', version);
