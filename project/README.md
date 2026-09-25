# Advanced Technologies — Unit 1: live session

This is the project we build together in class. **Download it and check that
it runs before the session starts** — the first ten minutes are not for
fixing environments.

## Check it now

```bash
node -v          # must be v22.5 or newer; v24 is what the course uses
node src/import.js
```

You should see:

```
import failed: not implemented yet
```

That is correct. `src/import.js` is deliberately unfinished — it is what we
are going to write.

Nothing to install. No internet needed. The database is SQLite through
`node:sqlite`, which ships with Node.js.

## What the program does

Reads a JSON file of device readings, validates them, stores them in SQLite,
asks for a summary per region and writes `out/report.txt`.

Seven steps, every one of them asynchronous, each needing the one before it.
We write it three times — callbacks, promises, `async`/`await` — and then use
it for something more realistic.

## What is in here

| Path | What it is |
|---|---|
| `src/import.js` | the file we edit in class |
| `lib/db.js` | a callback-style database API (read it if you like, we do not edit it) |
| `lib/api.js` | a fake remote service, used at the end of the session |
| `lib/report.js` | formats the report — not the point of the session |
| `data/*.json` | the readings, including two files that are broken on purpose |
| `checkpoints/` | the finished code at the end of each block |
| `out/` | created when you run it |

## Running the finished versions

If you want to jump ahead, or you lost the thread:

```bash
npm run step:1     # the callback version
npm run step:2     # promises
npm run step:3     # async/await
npm run step:4     # concurrency
```

And to put one of them into `src/import.js`:

```bash
node restore.js 2  # your current file is kept as src/import.backup.js
node restore.js 0  # back to the empty starting point
```

## The broken files are broken on purpose

```bash
node src/import.js readings-broken.json      # malformed JSON
node src/import.js readings-west.json        # one impossible battery level
node src/import.js readings-duplicate.json   # two readings with the same id
node src/import.js does-not-exist.json       # no such file
```

Four different ways for this program to fail. How each style of asynchronous
code deals with them is most of what today is about.
