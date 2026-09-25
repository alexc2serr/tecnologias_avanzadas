/**
 * Step 3 — exactly the same program again, with async/await.
 *
 *   node checkpoints/step-03-async-await.js
 *
 * The producing half is untouched: the wrappers from step 2 are still the
 * wrappers. Nothing new happens at runtime — this compiles down to the same
 * promises. What changes is what you are allowed to write:
 *
 *   - `db` is an ordinary local variable again. No more `let db` above the
 *     chain, no more nesting to keep two values alive.
 *   - the asynchronous loop is a `for` loop. An actual one.
 *   - try / catch / finally work, because a rejection is an exception again.
 */

const fsp = require('node:fs/promises');
const fs = require('node:fs');
const path = require('node:path');
const { open } = require('../lib/db');
const { formatReport } = require('../lib/report');

const DATA = path.join(__dirname, '..', 'data');
const OUT = path.join(__dirname, '..', 'out');

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

/* ===================== PRODUCING (unchanged from step 2) ================ */

const openDb = (filename) =>
  new Promise((resolve, reject) => {
    open(filename, (err, db) => (err ? reject(err) : resolve(db)));
  });

const exec = (db, sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });

const run = (db, sql, params) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, (err, info) => (err ? reject(err) : resolve(info)));
  });

const all = (db, sql, params) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const close = (db) =>
  new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });

/* ===================== CONSUMING ======================================= */

function validate(reading) {
  if (!reading || typeof reading !== 'object') return 'reading is not an object';
  if (!reading.id) return 'reading has no id';
  if (!reading.deviceId) return `reading ${reading.id} has no deviceId`;
  if (typeof reading.battery !== 'number') return `reading ${reading.id} has no battery`;
  if (reading.battery < 0 || reading.battery > 100) {
    return `reading ${reading.id} has an impossible battery level: ${reading.battery}`;
  }
  return null;
}

/** The recursive function, then the reduce, and now simply: a loop. */
async function insertAll(db, readings) {
  let inserted = 0;

  for (const reading of readings) {
    const problem = validate(reading);
    if (problem) throw new Error(problem);

    await run(
      db,
      INSERT,
      paramsFor(reading),
    );
    inserted++;
  }

  return inserted;
}

async function importFile(fileName) {
  const db = await openDb(path.join(OUT, 'readings.db'));

  try {
    await exec(db, SCHEMA);

    const raw = await fsp.readFile(path.join(DATA, fileName), 'utf8');
    const readings = JSON.parse(raw);

    const inserted = await insertAll(db, readings);

    // Both values are just... here. In scope. Nothing to thread through.
    const rows = await all(db, SUMMARY, []);
    await fsp.writeFile(path.join(OUT, 'report.txt'), formatReport(rows));

    return { inserted, regions: rows.length };
  } finally {
    // Runs whether we returned or threw. The connection always closes.
    await close(db);
  }
}

/* --------------------------------------------------------------------- */

async function main() {
  const fileName = process.argv[2] ?? 'readings-north.json';

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  try {
    const result = await importFile(fileName);
    console.log(`imported ${result.inserted} readings from ${fileName}`);
    console.log(`report written for ${result.regions} region(s) -> out/report.txt`);
  } catch (err) {
    console.error('import failed:', err.message);
    process.exitCode = 1;
  }
}

main();
