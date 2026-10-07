# Quote of the Day

A single static page that shows a random quote from a built-in collection. Press
**New quote** to see a different one, and use **Add to favorites** to save quotes you like.
Favorites are kept in your browser, so they survive reloads and restarts.

Plain HTML, CSS, and JavaScript (ES modules). No backend, no build step, and zero npm
dependencies.

## Requirements

- Node.js 22 or newer, for the dev server and tests only. There's no `npm install` step.
- A current browser (Chrome, Edge, Firefox, or Safari).

## Run

```sh
npm start
```

Then open <http://localhost:8080>. Set `PORT` to use a different port.

Opening `src/index.html` straight from disk (`file://`) won't work, because browsers block
ES module scripts loaded that way. Any static host can serve the `src/` folder as-is.

## Test

```sh
npm test                # unit tests for the quote picker and favorites store
npm run test:coverage   # same tests, plus coverage gates
```

The coverage gates are at least 80% of lines across `quote-picker.js` and
`favorites-store.js`, and 100% of branches in `favorites-store.js`.

The page itself (`index.html`, `app.js`, `styles.css`) is checked by hand with the scenarios
in [quickstart.md](specs/001-quote-of-the-day/quickstart.md).

## Project layout

```text
src/                        Everything served to the browser
├── index.html
├── styles.css
└── js/
    ├── quotes.js           Built-in quote collection (frozen)
    ├── quote-picker.js     Random pick that never repeats the current quote
    ├── favorites-store.js  Favorites state and localStorage persistence
    ├── app.js              Connects the page to the logic (only module that uses the DOM)
    └── main.js             Entry point (only module that uses window)
tests/
├── quote-picker.test.js
├── favorites-store.test.js
└── helpers/                Fake storage and a controllable random source
scripts/serve.mjs           Dev server with no dependencies
specs/001-quote-of-the-day/ Spec, plan, contracts, and tasks
```

## Saved data

Favorites are stored under the `localStorage` key `quote-of-the-day:favorites` as
`{"version": 1, "ids": ["q-003", "q-011"]}`, oldest first. Full rules are in
[storage-schema.md](specs/001-quote-of-the-day/contracts/storage-schema.md).

If the browser blocks storage, the page still works and shows a notice that favorites won't
be saved.

## Deliberate simplifications

This is a small single-page assignment, so it has no linter, formatter, type checker, DOM
tests, or CI. These deviations from the project constitution are recorded and justified in
[plan.md → Complexity Tracking](specs/001-quote-of-the-day/plan.md#complexity-tracking)
(D1–D4).
