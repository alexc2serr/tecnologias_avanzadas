/**
 * 07-files.js — asynchronous file I/O with node:fs/promises.
 *
 * Run it with:  node 07-files.js
 *
 * node:fs offers three flavours of the same operations:
 *   fs.readFile(path, cb)          callback style  — the original
 *   fs.readFileSync(path)          synchronous     — blocks the thread
 *   fsp.readFile(path)             promise style   — use this one
 *
 * The synchronous versions are fine in a CLI script that does one thing and
 * exits. In a server they are a bug: while the thread reads, nobody is served.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const dataDir = path.join(__dirname, 'tmp');
const file = path.join(dataDir, 'readings.json');

async function main() {
  await fs.mkdir(dataDir, { recursive: true });

  const readings = [
    { sensorId: 200, celsius: 21.4, at: new Date().toISOString() },
    { sensorId: 201, celsius: 19.8, at: new Date().toISOString() },
  ];

  // Write, then read back. Note the encoding: without it you get a Buffer.
  await fs.writeFile(file, JSON.stringify(readings, null, 2), 'utf8');
  const raw = await fs.readFile(file, 'utf8');
  const parsed = JSON.parse(raw);

  console.log(`read ${parsed.length} readings from ${path.basename(file)}`);
  const average = parsed.reduce((sum, r) => sum + r.celsius, 0) / parsed.length;
  console.log('average temperature:', average.toFixed(2), '°C');

  // Appending and listing
  await fs.appendFile(path.join(dataDir, 'audit.log'), `read at ${new Date().toISOString()}\n`);
  console.log('files in tmp/:', (await fs.readdir(dataDir)).join(', '));

  // Handling the error you will actually hit
  try {
    await fs.readFile(path.join(dataDir, 'does-not-exist.txt'), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') console.log('expected failure: file not found (ENOENT)');
    else throw err; // never swallow what you did not expect
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
