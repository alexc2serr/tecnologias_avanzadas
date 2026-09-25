/**
 * restore.js — copy a checkpoint over src/import.js.
 *
 *   node restore.js 2      puts the step-2 code in src/import.js
 *   node restore.js 0      puts back the empty starting point
 *
 * This is the escape hatch for the classroom: if something breaks halfway
 * through a block, or the clock runs out, restore the next step and carry on
 * without losing the thread.
 *
 * Your current src/import.js is saved as src/import.backup.js first.
 */
const fs = require('node:fs');
const path = require('node:path');

const STEPS = {
  0: 'start/import.js',
  1: 'checkpoints/step-01-callbacks.js',
  2: 'checkpoints/step-02-promises.js',
  3: 'checkpoints/step-03-async-await.js',
  4: 'checkpoints/step-04-concurrent.js',
};

const step = process.argv[2];
if (!(step in STEPS)) {
  console.error(`usage: node restore.js <${Object.keys(STEPS).join('|')}>`);
  process.exit(1);
}

const source = path.join(__dirname, STEPS[step]);
const target = path.join(__dirname, 'src', 'import.js');

if (fs.existsSync(target)) {
  fs.copyFileSync(target, path.join(__dirname, 'src', 'import.backup.js'));
}

// checkpoints/ and src/ are both one level under the project root, so the
// `require('../lib/...')` paths work unchanged. Straight copy.
fs.copyFileSync(source, target);

console.log(`src/import.js is now step ${step} (previous version kept as src/import.backup.js)`);
