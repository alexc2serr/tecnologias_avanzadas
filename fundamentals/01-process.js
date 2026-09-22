/**
 * 01-process.js — command-line arguments, environment and exit codes.
 *
 * Run it with:
 *   node 01-process.js Alice 42
 *   GREETING=Hola node 01-process.js Alice
 *   node --env-file=.env 01-process.js Alice
 *
 * process.argv[0] is the node binary, [1] is this script,
 * so the arguments the user typed start at index 2.
 */

const [name, times = '1'] = process.argv.slice(2);

if (!name) {
  console.error('usage: node 01-process.js <name> [times]');
  process.exit(1); // any non-zero code means "this run failed"
}

const greeting = process.env.GREETING ?? 'Hello';
const repeat = Number.parseInt(times, 10);

if (Number.isNaN(repeat) || repeat < 1) {
  console.error(`"${times}" is not a positive integer`);
  process.exit(1);
}

for (let i = 0; i < repeat; i++) {
  console.log(`${greeting}, ${name}!`);
}

// Reaching the end of the script exits with code 0 (success).
