/**
 * Step 4 — the same building blocks, used the way real code uses them.
 *
 *   node checkpoints/step-04-concurrent.js
 *
 * Up to now every await was on the previous line's result, so everything
 * happened one after another. That was correct — each step really did need
 * the one before it.
 *
 * Now we have work that does NOT depend on itself: three files to read, six
 * devices to look up. Deciding what waits for what is a design decision, and
 * it is the difference between 1.6 seconds and 0.3.
 */

const fsp = require('node:fs/promises');
const fs = require('node:fs');
const path = require('node:path');
const { open } = require('../lib/db');
const { fetchDeviceProfile } = require('../lib/api');
const { formatReport } = require('../lib/report');

const DATA = path.join(__dirname, '..', 'data');
const OUT = path.join(__dirname, '..', 'out');

const FILES = ['readings-north.json', 'readings-south.json', 'readings-west.json'];

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS readings (
    id       TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL,
    region   TEXT NOT NULL,
    battery  INTEGER NOT NULL,
    celsius  REAL NOT NULL,
    at       TEXT NOT NULL
  );
`;

const SUMMARY = `
  SELECT region,
         COUNT(*)      AS readings,
         AVG(battery)  AS avg_battery,
         MIN(battery)  AS min_battery
  FROM readings
  GROUP BY region
  ORDER BY region
`;

const INSERT =
  'INSERT INTO readings (id, deviceId, region, battery, celsius, at) VALUES (?, ?, ?, ?, ?, ?)';

/** The parameters the INSERT above expects, in order. */
const paramsFor = (r) => [r.id, r.deviceId, r.region, r.battery, r.celsius, r.at];

/* ===================== the wrappers, still unchanged =================== */

const openDb = (filename) =>
  new Promise((resolve, reject) => open(filename, (err, db) => (err ? reject(err) : resolve(db))));
const exec = (db, sql) =>
  new Promise((resolve, reject) => db.exec(sql, (err) => (err ? reject(err) : resolve())));
const run = (db, sql, params) =>
  new Promise((resolve, reject) => db.run(sql, params, (err, info) => (err ? reject(err) : resolve(info))));
const all = (db, sql, params) =>
  new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
const close = (db) =>
  new Promise((resolve, reject) => db.close((err) => (err ? reject(err) : resolve())));

/* ===================== pieces =========================================== */

function validate(reading) {
  if (!reading?.id) return 'reading has no id';
  if (!reading.deviceId) return `reading ${reading.id} has no deviceId`;
  if (typeof reading.battery !== 'number') return `reading ${reading.id} has no battery`;
  if (reading.battery < 0 || reading.battery > 100) {
    return `reading ${reading.id} has an impossible battery level: ${reading.battery}`;
  }
  return null;
}

/** Read one file and give back only the readings that survive validation. */
async function loadFile(fileName) {
  const raw = await fsp.readFile(path.join(DATA, fileName), 'utf8');
  const readings = JSON.parse(raw);

  const accepted = [];
  const rejected = [];
  for (const reading of readings) {
    const problem = validate(reading);
    if (problem) rejected.push(problem);
    else accepted.push(reading);
  }

  return { fileName, accepted, rejected };
}

const timed = async (label, fn) => {
  const start = Date.now();
  const value = await fn();
  console.log(`  ${label.padEnd(34)} ${String(Date.now() - start).padStart(5)} ms`);
  return value;
};

/* ===================== the program ====================================== */

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // --- 1. three files, one after another -------------------------------
  // Nothing here needs anything from the file before it. We are waiting for
  // no reason at all.
  console.log('\nreading the three files');
  await timed('one after another', async () => {
    const loaded = [];
    for (const fileName of FILES) loaded.push(await loadFile(fileName));
    return loaded;
  });

  // --- 2. the same three files, together --------------------------------
  // Both numbers will be tiny, and almost the same. That is the point:
  // reading a local file is barely a wait at all, so there was nothing to
  // overlap. Promise.all is not a speed-up you sprinkle on things — it pays
  // where the waiting is real. Keep watching; step 5 is where it shows.
  const loaded = await timed('all at once (Promise.all)', () =>
    Promise.all(FILES.map((fileName) => loadFile(fileName))));

  // --- 3. one bad file must not cost us the good ones -------------------
  // Promise.all would throw away two perfectly good results because of one
  // malformed file. allSettled reports each outcome instead.
  console.log('\nadding a malformed file to the batch');
  const settled = await Promise.allSettled(
    [...FILES, 'readings-broken.json'].map((fileName) => loadFile(fileName)));

  const usable = settled.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const broken = settled.filter((r) => r.status === 'rejected');
  console.log(`  usable files: ${usable.length}, unreadable: ${broken.length}`);
  for (const failure of broken) console.log(`  skipped: ${failure.reason.message}`);

  // --- 4. writing is a different problem --------------------------------
  // Reads can happen at the same time. These writes go to one SQLite file
  // through one connection, so they stay in order, on purpose. Concurrency
  // is for waiting, not for everything.
  console.log('\nwriting to the database');
  const db = await openDb(path.join(OUT, 'readings.db'));
  let inserted = 0;
  let rows;
  try {
    await exec(db, SCHEMA);

    for (const file of loaded) {
      for (const reading of file.accepted) {
        await run(
          db,
          INSERT,
          paramsFor(reading),
        );
        inserted++;
      }
      for (const problem of file.rejected) console.log(`  dropped: ${problem}`);
    }

    rows = await all(db, SUMMARY, []);
  } finally {
    await close(db);
  }
  console.log(`  inserted ${inserted} readings across ${rows.length} regions`);

  // --- 5. enrichment: six independent lookups ---------------------------
  const deviceIds = [...new Set(loaded.flatMap((f) => f.accepted.map((r) => r.deviceId)))].sort();
  console.log(`\nlooking up ${deviceIds.length} device profiles`);

  await timed('one after another', async () => {
    const out = [];
    for (const id of deviceIds) {
      try { out.push(await fetchDeviceProfile(id)); } catch { /* ignore here */ }
    }
    return out;
  });

  const profiles = await timed('all at once (allSettled)', async () => {
    const results = await Promise.allSettled(deviceIds.map((id) => fetchDeviceProfile(id)));
    return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  });
  console.log(`  ${profiles.length} of ${deviceIds.length} devices have a profile`);

  // --- 6. and one that never answers ------------------------------------
  // A request with no deadline is not slow, it is broken. The signal does not
  // just stop us waiting: it cancels the work.
  console.log('\none device that never answers');
  try {
    await fetchDeviceProfile('dev-slow', { signal: AbortSignal.timeout(500) });
  } catch (err) {
    console.log(`  gave up: ${err.name === 'TimeoutError' ? 'timed out after 500 ms' : err.message}`);
  }

  // --- 7. the report ----------------------------------------------------
  const lines = [formatReport(rows, { title: 'Readings report — all regions' })];
  lines.push('device profiles', '---------------');
  for (const p of profiles) lines.push(`${p.deviceId}  ${p.model.padEnd(12)} firmware ${p.firmware}`);
  lines.push('');
  await fsp.writeFile(path.join(OUT, 'report.txt'), lines.join('\n'));
  console.log('\nreport written -> out/report.txt');
}

main().catch((err) => {
  console.error('failed:', err.message);
  process.exitCode = 1;
});
