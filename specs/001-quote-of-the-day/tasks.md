---

description: "Task list for the Quote of the Day page"
---

# Tasks: Quote of the Day Page

**Input**: Design documents from `/specs/001-quote-of-the-day/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included. Constitution Principle II (Test-First) is non-negotiable. Per the plan,
automated tests cover only `src/js/quote-picker.js` and `src/js/favorites-store.js`, using
Node's built-in test runner. The page UI is checked manually with the quickstart scenarios
(plan deviation D3).

**Organization**: Tasks are grouped by user story so each story can be built and checked on
its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)
- Every task names the exact file path it touches

## Conventions for every task

- **Zero npm dependencies.** Use only Node built-ins (`node:test`, `node:assert/strict`,
  `node:http`, `node:fs`, `node:path`, `node:url`) and browser APIs. Never run `npm install <pkg>`.
- **Style** (plan deviation D1, applied by hand): 2-space indent, semicolons, single quotes,
  `const` by default, named exports only, no default exports.
- **Docs**: Every exported function gets a JSDoc block with `@param`, `@returns`, and
  `@throws` (Principle V).
- **Test-first**: A test task must leave `npm test` **failing** for the new cases before its
  implementation task starts. The implementation task is done when `npm test` passes.
- **Layering**: `quotes.js`, `quote-picker.js`, and `favorites-store.js` MUST NOT reference
  `document`, `window`, or `localStorage`. Only `app.js` touches the DOM, and only `main.js`
  touches `window`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project skeleton, scripts, and dev server

- [X] T001 Create the directories `src/js/`, `tests/helpers/`, and `scripts/` at the repository root (plan → Source Code)
- [X] T002 Create `package.json` at the repository root with `"name": "quote-of-the-day"`, `"private": true`, `"type": "module"`, `"engines": { "node": ">=22" }`, **no** `dependencies` or `devDependencies`, and these scripts: `"start": "node scripts/serve.mjs"`, `"test": "node --test"`, and `"test:coverage": "node --test --experimental-test-coverage --test-coverage-include=src/js/quote-picker.js --test-coverage-include=src/js/favorites-store.js --test-coverage-lines=80 && node --test --experimental-test-coverage --test-coverage-include=src/js/favorites-store.js --test-coverage-branches=100"`
- [X] T003 [P] Create the static dev server in `scripts/serve.mjs` using only `node:http`, `node:fs/promises`, `node:path`, and `node:url`. Serve files from `src/` on port `process.env.PORT || 8080`. Map `/` to `index.html`. Send the right `Content-Type` for `.html`, `.css`, and `.js` (`text/javascript`, which ES modules need), plus `.svg` and `.ico`. Reject path traversal by resolving the path and checking it stays inside `src/` (return 403). Return 404 for missing files. Log `Serving src/ at http://localhost:<port>` on start.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Test helpers, quote data, and the base page that every story builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create `tests/helpers/fake-storage.js` exporting `createFakeStorage({ initial = {}, failOn = [] } = {})`. It returns an object with `getItem`, `setItem`, `removeItem` (Web Storage semantics: values are stored as strings, and `getItem` returns `null` for a missing key) and a `snapshot()` method returning a plain copy of its contents. `failOn` is a list of method names (`'getItem'`, `'setItem'`, `'removeItem'`) or `'all'`; calling a listed method throws `new Error('storage unavailable')`. Also export `createThrowingStorage()` = `createFakeStorage({ failOn: 'all' })`.
- [X] T005 [P] Create `tests/helpers/seeded-random.js` exporting `sequenceRandom(values)`. It returns a function that yields each number from `values` in turn, in `[0, 1)`, cycling back to the start, so tests have exact control over random choices.
- [X] T006 [P] Create the built-in collection in `src/js/quotes.js`: `export const QUOTES`, a frozen array of **at least 12** frozen objects `{ id, text, author }` (data-model.md → Quote). IDs run in sequence from `q-001` with no gaps. Use well-known, correctly attributed quotes. Include **at least one** quote with `author: 'Unknown'` (US1 scenario 3) and **at least one** quote longer than 250 characters, to test the 320 px wrapping edge case. Add a JSDoc `@typedef {{id: string, text: string, author: string}} Quote` and export it for other modules to reference.
- [X] T007 [P] Create the base page `src/index.html`: `<!doctype html>`, `lang="en"`, charset and `width=device-width` viewport meta tags, `<title>Quote of the Day</title>`, `<link rel="stylesheet" href="styles.css">`, `<script type="module" src="js/main.js"></script>`, and a `<main>` with `<h1>Quote of the Day</h1>`. Leave `<main>` otherwise empty; each story adds its own elements.
- [X] T008 [P] Create the base stylesheet `src/styles.css`: a system font stack, a centered single column (`max-width: 40rem`, `padding: 1rem`), text and background colors with at least 4.5:1 contrast, `overflow-wrap: anywhere` on body text so long quotes never cause horizontal scrolling at 320 px, and a clearly visible `:focus-visible` outline on `button`.

**Checkpoint**: `npm start` serves a page showing the heading at http://localhost:8080. `npm test` runs and finds no tests yet.

---

## Phase 3: User Story 1 - See a Random Quote (Priority: P1) 🎯 MVP

**Goal**: On load, the page shows one random quote from the collection, with its author.

**Independent Test**: Quickstart scenarios 1 and 2. Open the page and reload about 10 times:
one quote with its author shows each time, and several different quotes appear.

### Tests for User Story 1 ⚠️ Write first, confirm they fail

- [X] T009 [US1] Write `tests/quote-picker.test.js` (part 1) using `node:test` and `node:assert/strict`. Cases for `pickRandomQuote(quotes, { random })` **without** `excludeId`:
  - (a) With `sequenceRandom([0])` it returns `quotes[0]`. With `[0.999]` it returns the last quote. With `[0.5]` on a 4-quote list it returns `quotes[2]` (index = `Math.floor(random() * n)`).
  - (b) Over a sequence that covers every bucket `i/n`, every quote is returned at least once.
  - (c) Calling it with an empty array throws a `RangeError`.
  - (d) A **collection rules** block that imports the real `QUOTES` from `src/js/quotes.js`: at least 10 entries; IDs unique and matching `/^q-\d{3}$/`; `text` and `author` are non-empty after trimming; the array and every item are frozen (`Object.isFrozen`).

  Run `npm test` and confirm cases (a)–(c) fail because the module doesn't exist yet.

### Implementation for User Story 1

- [X] T010 [US1] Create `src/js/quote-picker.js` exporting `pickRandomQuote(quotes, { excludeId, random = Math.random } = {})`. For now it ignores `excludeId`: throw `RangeError('quotes must not be empty')` on an empty array, otherwise return `quotes[Math.floor(random() * quotes.length)]`. Add JSDoc. `npm test` passes T009.
- [X] T011 [US1] Add the quote markup to `src/index.html` inside `<main>`, after the `<h1>`, following contracts/ui-contract.md: `<figure data-testid="quote" aria-live="polite">` holding `<blockquote data-testid="quote-text"></blockquote>` and `<figcaption data-testid="quote-author"></figcaption>`.
- [X] T012 [US1] Create `src/js/app.js` exporting `initApp({ document, storage, random = Math.random, quotes = QUOTES })`. Look up elements only by `[data-testid="…"]`. Keep a module-level `currentQuote`. Add a small `renderQuote(quote)` that sets the blockquote's `textContent` to `quote.text` and the figcaption's to `` `— ${quote.author}` `` (never use `innerHTML`). On init, call `pickRandomQuote(quotes, { random })` and render it. `storage` isn't used yet; it's accepted now so later stories don't change the signature. Add JSDoc.
- [X] T013 [US1] Create `src/js/main.js`, the only module that touches `window`: `import { initApp } from './app.js'` and call `initApp({ document, storage: getStorage(), random: Math.random })`, where `getStorage()` returns `window.localStorage` inside `try`/`catch` and returns `null` if accessing it throws (some browsers throw a `SecurityError` when site data is blocked).
- [X] T014 [US1] Style the quote in `src/styles.css`: a large blockquote with comfortable line height, a muted figcaption that still meets 4.5:1 contrast, and the default `<blockquote>` and `<figure>` margins reset so nothing overflows at 320 px.

**Checkpoint**: `npm test` passes. Quickstart scenarios 1, 2, 11 (wrapping), and 12 (offline
reload of the shown quote) pass. **This is the MVP.**

---

## Phase 4: User Story 2 - Get a New Quote (Priority: P2)

**Goal**: A "New quote" button replaces the quote with a different one, without reloading.

**Independent Test**: Quickstart scenarios 3 and 4. Clicking or keyboard-activating
"New quote" 20 times changes the quote every time and never repeats the previous one.

### Tests for User Story 2 ⚠️ Write first, confirm they fail

- [X] T015 [US2] Extend `tests/quote-picker.test.js` (part 2) with cases for `excludeId` (research.md R5):
  - (a) For a 5-quote list and every possible `excludeId`, a sweep of 1,000 evenly spaced random values in `[0, 1)` never returns the excluded quote.
  - (b) For the same sweep, every **other** quote is returned at least once, and the counts are within ±1 of each other (uniform).
  - (c) Exact mapping: with quotes `[A, B, C]`, `excludeId = B.id`, and `sequenceRandom([0])`, the result is A. With `[0.6]`, the result is C.
  - (d) A single-quote list with `excludeId` set to that quote's ID returns that quote, without throwing or looping.
  - (e) An `excludeId` that isn't in the list behaves like no exclusion.

  Run `npm test` and confirm (a), (b), and (c) fail.

### Implementation for User Story 2

- [X] T016 [US2] Implement exclusion in `src/js/quote-picker.js` with the one-step algorithm from research.md R5. Find `idx = quotes.findIndex(q => q.id === excludeId)`. If `idx === -1` or `quotes.length === 1`, use the plain pick. Otherwise `r = Math.floor(random() * (quotes.length - 1))` and return `quotes[r >= idx ? r + 1 : r]`. No loops, no retries. `npm test` passes all picker tests.
- [X] T017 [US2] Add `<button type="button" data-testid="new-quote">New quote</button>` to `src/index.html`, inside a `<div class="actions">` directly after the `<figure>`.
- [X] T018 [US2] In `src/js/app.js`, wire a `click` listener on `[data-testid="new-quote"]` that calls `pickRandomQuote(quotes, { excludeId: currentQuote.id, random })` and renders the result. Don't move focus (focus stays on the button, per ui-contract). Native `<button>` handles Enter and Space, so add no key handlers.
- [X] T019 [US2] Style `.actions` and buttons in `src/styles.css`: a flex row that wraps, a gap, touch targets at least 44 px tall, and hover and active states. Keep the `:focus-visible` outline from T008.

**Checkpoint**: `npm test` passes. Quickstart scenarios 3 and 4 pass, and US1 scenarios still
pass.

---

## Phase 5: User Story 3 - Favorite Quotes That Persist (Priority: P3)

**Goal**: Favorite or unfavorite the shown quote, see favorites in a list oldest first, remove
from the list, keep them across reloads, and handle storage failures without breaking.

**Independent Test**: Quickstart scenarios 5–10 and 13. Favorite 3 quotes, reload and restart
the browser, and they're all still listed in order. Remove one, and it's gone after a reload.
Corrupted or blocked storage never breaks the page.

### Tests for User Story 3 ⚠️ Write first, confirm they fail

- [X] T020 [US3] Write `tests/favorites-store.test.js` (part 1: behavior) for `createFavoritesStore({ storage, validIds })` from `src/js/favorites-store.js`, using `createFakeStorage` and `validIds = ['q-001', …, 'q-005']`. Cases:
  - (a) A new store with empty storage: `list()` is `[]`, `has('q-001')` is `false`, `mode` is `'persistent'`.
  - (b) `toggle('q-002')` returns `true`, then `has` is `true` and `list()` is `['q-002']`. Toggling again returns `false` and empties the list.
  - (c) Toggling `q-003`, `q-001`, `q-002` makes `list()` exactly `['q-003','q-001','q-002']` (order favorited, FR-009).
  - (d) Unfavoriting then re-favoriting `q-003` moves it to the **end**.
  - (e) `remove('q-001')` removes only that ID. `remove` on an ID that isn't a favorite changes nothing and doesn't throw.
  - (f) `toggle` or `remove` with an ID not in `validIds` throws a `RangeError`.
  - (g) `list()` returns a copy: changing it doesn't affect the store.
  - (h) "Reload": a second store created on the **same** fake storage sees the same `list()` (FR-008, SC-004).

  Run `npm test` and confirm the cases fail.
- [X] T021 [US3] Extend `tests/favorites-store.test.js` (part 2: storage contract). Write one test for **every row** of the reading and writing rules in contracts/storage-schema.md:
  - (a) After a change, `storage.getItem('quote-of-the-day:favorites')` is exactly `JSON.stringify({ version: 1, ids: [...] })`.
  - (b) Emptying the list writes `{"version":1,"ids":[]}` and doesn't remove the key.
  - (c) The probe key `quote-of-the-day:probe` is absent from `snapshot()` after creating the store.
  - (d) Stored IDs not in `validIds` are dropped from `list()`, and the next write leaves them out.
  - (e) Duplicate IDs: the first occurrence is kept.
  - (f) Entries in `ids` that aren't strings are dropped.
  - (g) Invalid JSON (`'not json'`), `version: 2`, `ids` not an array, or a top-level array: `list()` is `[]`, there's no throw, and the stored value is **unchanged** until the next write.
  - (h) `storage = null` gives `mode === 'memory-only'`, and toggling still works in memory.
  - (i) `createThrowingStorage()` gives `mode === 'memory-only'` at creation, and nothing throws.
  - (j) A storage that fails only on `setItem` after creation (use `failOn: ['setItem']`, but let the probe pass by creating the store first and then switching the fake to fail; add a `setFailOn()` helper to `tests/helpers/fake-storage.js` if needed): the next `toggle` still updates `list()` in memory, `mode` becomes `'memory-only'`, and later changes don't touch storage.
  - (k) A storage whose `getItem` throws but `setItem` works: `mode === 'memory-only'` and `list()` is `[]`.

  Run `npm test` and confirm the cases fail.

### Implementation for User Story 3

- [X] T022 [US3] Create `src/js/favorites-store.js` exporting `FAVORITES_KEY = 'quote-of-the-day:favorites'`, `PROBE_KEY = 'quote-of-the-day:probe'`, and `createFavoritesStore({ storage, validIds })`, which returns `{ has(id), toggle(id), remove(id), list(), get mode() }`. Implement it per research.md R6, data-model.md (Favorite, store modes), and contracts/storage-schema.md:
  - Probe with `setItem` then `removeItem` of `PROBE_KEY` inside `try`. A `null` storage or any exception means `'memory-only'`.
  - Load with a tolerant parse in its own small function (`parseStoredIds(raw, validIdSet)`), wrapped in `try`. Any read exception means `'memory-only'` with an empty list.
  - Keep state in an array, using a `Set` of valid IDs for checks.
  - Save the full value after every change. Any exception switches permanently to `'memory-only'`, and memory-only mode never writes again.

  Keep each function under ~30 lines, with no empty `catch` (comment why each one falls back). Add JSDoc on every export. `npm test` passes T020 and T021.
- [X] T023 [US3] Run `npm run test:coverage` and confirm both gates pass: at least 80% lines across the two logic modules, and **100% branches** for `src/js/favorites-store.js`. If a branch is uncovered, add the missing case to `tests/favorites-store.test.js`; don't lower the threshold.
- [X] T024 [US3] Add the favorites markup to `src/index.html`, following contracts/ui-contract.md exactly:
  - In `.actions`, after "New quote": `<button type="button" data-testid="favorite-toggle" aria-pressed="false">Add to favorites</button>`.
  - After `.actions`: `<p role="status" data-testid="storage-notice" hidden>Your browser isn't letting this page save data, so favorites will be lost when you leave.</p>`.
  - Then `<section data-testid="favorites" aria-labelledby="favorites-heading">` containing `<h2 id="favorites-heading">Your favorites</h2>`, `<ol data-testid="favorites-list"></ol>`, and `<p data-testid="favorites-empty">No favorites yet. Use “Add to favorites” on a quote you like.</p>`.
- [X] T025 [US3] Wire favorites in `src/js/app.js`:
  - In `initApp`, create the store with `createFavoritesStore({ storage, validIds: quotes.map(q => q.id) })`.
  - Add `renderFavoriteToggle()`, which sets `aria-pressed` and the label ("Add to favorites" / "Remove from favorites") from `store.has(currentQuote.id)`. Call it after every quote render.
  - Add `renderFavorites()`, which rebuilds the `<ol>` from `store.list()`. Each `<li data-testid="favorite-item">` holds a `<blockquote>` with the text, a `<p>` with `— author`, and `<button type="button">Remove</button>` with `aria-label` "Remove from favorites: " followed by the first 40 characters of the text. Build with `createElement` and `textContent`, never `innerHTML`. Toggle `hidden` on the empty message.
  - Add `renderStorageNotice()`, which sets `hidden = store.mode !== 'memory-only'`.
  - On toggle click: `store.toggle(currentQuote.id)`, then re-render the toggle, list, and notice.
  - Handle Remove clicks with **one** delegated listener on the `<ol>`: `store.remove(id)`, re-render, then move focus per ui-contract (next item's Remove button, otherwise the previous one, otherwise the favorite toggle).
  - Call all three renders once at init.
- [X] T026 [US3] Style the favorites in `src/styles.css`: list items as cards with a divider, the Remove button aligned to the end of each item, a clear pressed state for `[aria-pressed="true"]` that doesn't rely on color alone (for example a filled ★ through `::before`, versus ☆), the `[role="status"]` notice as a bordered callout, and no horizontal overflow at 320 px.

**Checkpoint**: `npm run test:coverage` passes. Quickstart scenarios 5–10 and 13 pass, and
the US1 and US2 scenarios still pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, final checks, and the constitution self-review

- [X] T027 [P] Write `README.md` at the repository root (Principle V): a one-paragraph description; requirements (Node 22 or newer, no `npm install` needed); `npm start` and why `file://` doesn't work; `npm test` and `npm run test:coverage`; the project layout (mirroring plan.md → Source Code); the storage key name and format (link to `specs/001-quote-of-the-day/contracts/storage-schema.md`); and a short "Deliberate simplifications" note linking to plan.md → Complexity Tracking (D1–D4).
- [X] T028 Self-review every file in `src/`, `tests/`, and `scripts/` against the Conventions section above and constitution Principles I and IV (plan D1/D2 mitigation). Check for: consistent style, every export with JSDoc, no dead or commented-out code, no `console.log` left in `src/`, no `innerHTML`, no empty `catch`, functions within ~50 lines, and no DOM or `window` access outside `app.js` and `main.js`. Fix anything found in place.
- [X] T029 Run `npm run test:coverage` one last time and confirm exit code 0 with both coverage gates met.
- [X] T030 Run `npm start` and go through **all 13** manual scenarios in `specs/001-quote-of-the-day/quickstart.md` in a real browser, including the DevTools steps (9, 10, 11, 12). Fix any failure in the relevant `src/` file and repeat that scenario.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T002 and T003 depend on T001.
- **Foundational (Phase 2)**: Depends on Setup. T004–T008 touch different files and can all
  run in parallel. **Blocks all stories.**
- **US1 (Phase 3)**: Depends on Foundational.
- **US2 (Phase 4)**: Depends on US1. It extends `quote-picker.js`, `quote-picker.test.js`, and
  `app.js`, and needs a quote on screen to replace.
- **US3 (Phase 5)**: Depends on US1 for the displayed quote and `app.js`. It does **not**
  depend on US2. Its test and store tasks (T020–T023) can start right after Foundational, in
  parallel with US1 and US2, because they only touch new files.
- **Polish (Phase 6)**: Depends on every story you plan to ship.

### Within Each Story

- Test tasks → confirm they fail → implementation tasks → `npm test` passes (Principle II).
- Logic module before markup, markup before `app.js` wiring, wiring before styles.
- Most tasks in a story touch the same few files (`index.html`, `app.js`, `styles.css`), so they
  run **in order**. That's why few tasks inside a story are marked [P].

### Parallel Opportunities

- Phase 1: T003 runs alongside T002.
- Phase 2: T004, T005, T006, T007, and T008 are all separate files and can run together.
- Across stories: once Phase 2 is done, the US3 logic track (T020 → T021 → T022 → T023) can run
  alongside the US1 and US2 tasks, since only new files are involved. The US3 UI tasks
  (T024–T026) wait until US1's T011–T013 are done.
- Phase 6: T027 (README) can run alongside T028.

---

## Parallel Example: Foundational + User Story 3 logic

```text
# After T001–T003, start these together (all different files):
Task: "T004 Create tests/helpers/fake-storage.js"
Task: "T005 Create tests/helpers/seeded-random.js"
Task: "T006 Create src/js/quotes.js with at least 12 frozen quotes"
Task: "T007 Create base src/index.html"
Task: "T008 Create base src/styles.css"

# Once Phase 2 is done, two tracks can run at the same time:
Track A (US1 → US2): T009 → T010 → T011 → T012 → T013 → T014 → T015 → … → T019
Track B (US3 logic): T020 → T021 → T022 → T023
# Then T024 → T025 → T026, after Track A has finished T013.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001–T003)
2. Phase 2: Foundational (T004–T008)
3. Phase 3: US1 (T009–T014)
4. **STOP and VALIDATE**: `npm test` passes, and quickstart scenarios 1, 2, 11, and 12 pass.
   The page already delivers its core value.

### Incremental Delivery

1. Setup + Foundational → skeleton page served
2. \+ US1 → random quote on load (MVP)
3. \+ US2 → "New quote" browsing
4. \+ US3 → saved favorites
5. Polish → README, self-review, full quickstart pass

Each step leaves the page working and `npm test` passing.

---

## Notes

- [P] tasks = different files, no dependencies on unfinished tasks
- The [Story] label maps each task to a user story for traceability
- Confirm each test task leaves new tests **failing** before implementing (Principle II)
- The project is a git repository: commit after each task or checkpoint
- Don't add npm dependencies, a linter, a type checker, DOM tests, or CI. Those were
  deliberately removed (plan.md → Complexity Tracking, D1–D4)

---

## Phase 7: Convergence

- [X] T031 CRITICAL: Handle malformed percent-encoding in `scripts/serve.mjs`: wrap the `decodeURIComponent` call in `resolveFile()` (or the request handler) so a `URIError` returns `400 Bad Request` instead of crashing the dev server (repro: `GET /%E0%A4%A`), with a comment explaining the fallback per Constitution I (contradicts)
- [X] T032 Stop re-announcing the current quote in `src/js/app.js`: only set `quoteText`/`quoteAuthor` `textContent` when the displayed quote actually changed (on load and on "New quote"), so the `aria-live` region is not re-read on favorite toggle or Remove; keep updating the toggle's `aria-pressed` and label on every render per FR-007 (partial)
- [X] T033 Make `parseStoredIds` module-private in `src/js/favorites-store.js` (drop the `export`), keeping the public API to `FAVORITES_KEY`, `PROBE_KEY` and `createFavoritesStore` as planned, then confirm `npm run test:coverage` still passes per Constitution IV (unrequested)
