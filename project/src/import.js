/**
 * src/import.js — the starting point for today's session.
 *
 *   node src/import.js                       imports readings-north.json
 *   node src/import.js readings-west.json    imports another file
 *
 * What this program has to do, in order:
 *
 *   1. open the database and create the table if it is not there
 *   2. read a JSON file of readings
 *   3. parse it
 *   4. validate every reading and insert it
 *   5. ask the database for a summary per region
 *   6. write that summary to out/report.txt
 *   7. close the database
 *
 * Every one of those steps is asynchronous. None of them can start before the
 * previous one has finished. We are going to write this program three times
 * today — the same seven steps, three different styles — and then use it for
 * something more realistic.
 *
 * The scaffolding below is done. `importFile` is not.
 */

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

/** Returns a string describing the problem, or null when the reading is fine. */
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

/** The parameters the INSERT above expects, in order. */
const paramsFor = (r) => [r.id, r.deviceId, r.region, r.battery, r.celsius, r.at];

/* ======================================================================
 * Everything below here is what we build in class.
 * ====================================================================== */



function importFile(fileName, callback) {
  // We start here.
  open(path.join(OUT, 'readings.db'), (err, db) => {
    if (err) {
      callback(err);
      return;
    }

    db.exec(SCHEMA, (err) => {
      if (err) {
        callback(err);
        return;
      }

      fs.readFile(path.join(DATA, fileName), 'utf8', (err, raw) => {
        if (err) {
          callback(err);
          return;
        }

        let readings;
        try {
          readings = JSON.parse(raw);
        } catch (err) {
          callback(err);
          return;
        }

        insertAll(db, readings, (err, inserted) => {
          if (err) {
            callback(err);
            return;
          }

          db.all(SUMMARY, [], (err, rows) => {
            if (err) {
              callback(err);
              return;
            }

            fs.writeFile(path.join(OUT, 'report.txt'), formatReport(rows), (err) => {
              if (err) {
                callback(err);
                return;
              }

              db.close(() => {
                callback(null, { inserted, regions: rows.length });
              });
            });
          });
        });
      });
    });
  });
}

/* --------------------------------------------------------------------- */

const fileName = process.argv[2] ?? 'readings-north.json';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

importFile(fileName, (err, result) => {
  if (err) {
    console.error('import failed:', err.message);
    process.exitCode = 1;
    return;
  }
  console.log(`imported ${result.inserted} readings from ${fileName}`);
  console.log(`report written for ${result.regions} region(s) -> out/report.txt`);
});

function insertAll(db, readings, callback) {
  let index = 0;
  let inserted = 0;

  function next() {
    if (index >= readings.length) {
      callback(null, inserted);
      return;
    }

    const reading = readings[index++];

    const problem = validate(reading);
    if (problem) {
      callback(new Error(problem));
      return;
    }

    db.run(INSERT, paramsFor(reading), (err) => {
      if (err) {
        callback(err);
        return;
      }
      inserted++;
      next();
    });
  }

  next();
}

