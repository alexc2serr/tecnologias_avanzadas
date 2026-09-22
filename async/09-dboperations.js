/**
 * 09-dboperations.js — talking to SQLite from Node.js.
 *
 * Run it with:  node 09-dboperations.js
 *
 * This uses node:sqlite, the SQLite driver built into Node.js since v22.5 —
 * no npm install, no native build step. It prints an ExperimentalWarning on
 * Node.js 24; the API has been a release candidate since v25.7.
 *
 * The API is deliberately SYNCHRONOUS (DatabaseSync). That is not a mistake:
 * a local SQLite query is microseconds of CPU, not a network wait, so there
 * is nothing to await. Compare with a remote database, where every query is
 * I/O and must be awaited — that is the case you will meet from Tema 2 on.
 *
 * If you prefer the promise-based style, the sqlite + sqlite3 packages from
 * npm are the classic alternative:  npm install sqlite sqlite3
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, 'tmp');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'task-manager.db'));

// --- schema ----------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    done        INTEGER NOT NULL DEFAULT 0,
    user_id     INTEGER NOT NULL REFERENCES users(id)
  );
`);
db.exec('DELETE FROM tasks; DELETE FROM users;'); // start from a clean slate

// --- writes ----------------------------------------------------------------
// Always use placeholders (?). Never build SQL by concatenating strings:
// that is how SQL injection happens.
const insertUser = db.prepare('INSERT INTO users (name) VALUES (?)');
const alice = insertUser.run('Alice');
const bob = insertUser.run('Bob');
console.log('inserted users with ids', alice.lastInsertRowid, 'and', bob.lastInsertRowid);

const insertTask = db.prepare('INSERT INTO tasks (description, user_id) VALUES (?, ?)');
insertTask.run('Finish homework', alice.lastInsertRowid);
insertTask.run('Clean the house', alice.lastInsertRowid);
insertTask.run('Buy groceries', bob.lastInsertRowid);

// --- reads -----------------------------------------------------------------
const allUsers = db.prepare('SELECT id, name FROM users ORDER BY name').all();
console.log('users:', allUsers);

const one = db.prepare('SELECT id, name FROM users WHERE id = ?').get(alice.lastInsertRowid);
console.log('one user:', one);

const tasksOf = db.prepare(`
  SELECT t.id, t.description, t.done
  FROM tasks t
  WHERE t.user_id = ?
  ORDER BY t.id
`);
console.log("Alice's tasks:", tasksOf.all(alice.lastInsertRowid));

// --- update, and a transaction --------------------------------------------
const complete = db.prepare('UPDATE tasks SET done = 1 WHERE id = ?');
db.exec('BEGIN');
try {
  complete.run(1);
  complete.run(2);
  db.exec('COMMIT');
} catch (err) {
  db.exec('ROLLBACK'); // all or nothing
  throw err;
}

const summary = db
  .prepare(
    `SELECT u.name, COUNT(t.id) AS total, SUM(t.done) AS done
     FROM users u LEFT JOIN tasks t ON t.user_id = u.id
     GROUP BY u.id ORDER BY u.name`,
  )
  .all();
console.log('summary:', summary);

db.close();
