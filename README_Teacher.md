# Advanced Technologies — Unit 1: code examples

Runnable companions to the Unit 1 slides. No dependencies to install: everything
here uses the Node.js standard library.

## Requirements

- **Node.js 24 LTS** (anything from 22.5 upwards will run these files).
  Check with `node -v`.
- Internet access for `async/08-apirequest.js` only.

## How to run

Either call the file directly or use the npm script:

```bash
node fundamentals/00-hello.js
npm run hello
```

## fundamentals/ — used in T1-2

| File | What it shows |
|---|---|
| `00-hello.js` | The smallest program; globals Node.js has and the browser does not |
| `01-process.js` | `process.argv`, `process.env`, exit codes. Try `node 01-process.js Alice 3` |
| `02-eventloop-order.js` | Execution order: sync → microtasks → timers/check. Predict it first |
| `03-blocking.js` | A CPU-bound loop delaying a 100 ms timer by ~2.5 s |
| `modules-cjs/` | CommonJS: `module.exports` + `require` |
| `modules-esm/` | ES modules: `export` + `import`, `import.meta`, top-level `await` |

## async/ — used in T1-3

| File | What it shows |
|---|---|
| `00-callback.js` | Why a callback exists at all |
| `01-callback.js` | The error-first convention. Try `node 01-callback.js -5` |
| `02-callbackhell.js` | Four dependent steps, nested — the problem |
| `03-promises.js` | Promise states, `then` / `catch` / `finally` |
| `04-promisechaining.js` | The same four steps, chained — growing downwards |
| `05-promisehandleerror.js` | How rejections travel, recovering, rethrowing with `cause` |
| `06-asyncawait.js` | The same four steps again, in the style you will use |
| `10-combinators.js` | `Promise.all` / `allSettled` / `race` / `any`, with timings |
| `07-files.js` | `node:fs/promises`, and handling `ENOENT` |
| `08-apirequest.js` | Built-in `fetch`, `response.ok`, timeouts, a POST with a JSON body |
| `09-dboperations.js` | `node:sqlite`: schema, placeholders, transactions, aggregates |

`07-files.js` and `09-dboperations.js` write into `async/tmp/`, which you can
delete at any time.

## Notes

- `node:sqlite` is the SQLite driver built into Node.js since v22.5. On Node 24
  it still prints an `ExperimentalWarning`; the API became a release candidate
  in v25.7. The classic alternative is `npm install sqlite sqlite3`.
- `fetch` is built in since Node.js 18 and stable since 21. You do not need
  axios, node-fetch or `request-promise-native` — the last one has been
  deprecated for years.
- `node --watch file.js` restarts on save, so nodemon is optional now.
- `node --env-file=.env file.js` loads environment variables without dotenv.
