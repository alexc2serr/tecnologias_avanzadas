/**
 * Step 2 — exactly the same program, with promises.
 *
 *   node checkpoints/step-02-promises.js
 *
 * Two halves that people keep confusing:
 *
 *   PRODUCING a promise   `new Promise((resolve, reject) => ...)`
 *                         You write this when you are wrapping an old
 *                         callback API. Once. Ever.
 *
 *   CONSUMING a promise   `.then()`, `.catch()`, `.finally()`
 *                         This is what you actually write every day.
 *
 * Everything above the line below is the producing half. Everything under it
 * is the consuming half. Notice how small the first half is.
 */

const fsp = require('node:fs/promises');
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

/* ===================== PRODUCING: wrap the callback API ==================
 * This is the only place in the whole session where `new Promise` appears.
 * We are not inventing asynchrony — it was already there. We are changing
 * how the result is delivered: instead of "call me back", "here is an object
 * that will hold the answer".
 *
 * Note there is no wrapper for the file system: node:fs/promises already
 * exists. You never wrap what the platform has already wrapped.
 * ======================================================================= */

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

/* ===================== CONSUMING: the program itself ==================== */

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

/**
 * The asynchronous loop again. With callbacks it was a recursive function;
 * with promises it is a reduce that builds one long chain.
 *
 * Neither reads like a loop. That is the argument for step 3.
 */
function insertAll(db, readings) {
  return readings.reduce(
    (previous, reading) => previous.then((count) => {
      const problem = validate(reading);
      if (problem) return Promise.reject(new Error(problem));

      return run(
        db,
        INSERT,
        paramsFor(reading),
      ).then(() => count + 1);
    }),
    Promise.resolve(0),
  );
}

function importFile(fileName) {
  // Look at this variable. It exists only because every .then() is its own
  // function, so `db` from the first step is not in scope in the last one.
  // Remember it — it is the whole reason step 3 exists.
  let db;

  return openDb(path.join(OUT, 'readings.db'))
    .then((opened) => {
      db = opened;
      return exec(db, SCHEMA);
    })
    .then(() => fsp.readFile(path.join(DATA, fileName), 'utf8'))
    .then((raw) => JSON.parse(raw)) // a throw in here becomes a rejection
    .then((readings) => insertAll(db, readings))
    .then((inserted) =>
      // ...and here we nest again, because we need BOTH values below.
      all(db, SUMMARY, []).then((rows) => ({ inserted, rows })))
    .then(({ inserted, rows }) =>
      fsp.writeFile(path.join(OUT, 'report.txt'), formatReport(rows))
        .then(() => ({ inserted, regions: rows.length })))
    .finally(() => (db ? close(db) : undefined));
}

/* --------------------------------------------------------------------- */

const fileName = process.argv[2] ?? 'readings-north.json';

require('node:fs').rmSync(OUT, { recursive: true, force: true });
require('node:fs').mkdirSync(OUT, { recursive: true });

importFile(fileName)
  .then((result) => {
    console.log(`imported ${result.inserted} readings from ${fileName}`);
    console.log(`report written for ${result.regions} region(s) -> out/report.txt`);
  })
  .catch((err) => {
    // One catch for the entire sequence, instead of six.
    console.error('import failed:', err.message);
    process.exitCode = 1;
  });
