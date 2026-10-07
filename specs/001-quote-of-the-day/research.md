# Research: Quote of the Day Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-07
**Revised**: 2026-10-07. Simplified for a small single-page assignment: zero npm dependencies,
no lint, format, or type tooling, no DOM tests, and no CI.

The user fixed the stack: plain HTML/CSS/JavaScript, no backend, favorites in `localStorage`,
and **zero npm dependencies**. The research below resolves the remaining unknowns. Where the
constitution asks for more than this scope allows, the gap is recorded in
[plan.md → Complexity Tracking](./plan.md#complexity-tracking).

## R1. Module format and how the page is served

- **Decision**: Native ES modules (`<script type="module">`), no bundler and no build step.
  During development, the page is served by a small Node script with no dependencies
  (`scripts/serve.mjs`, using only `node:http`), started with `npm start`. Any static host can
  serve it in production.
- **Rationale**: ES modules let the same source files run in the browser and be imported
  directly by Node's test runner. Browsers block module scripts loaded from `file://`, so an
  HTTP server is needed. A built-in Node module covers this with no dependency.
- **Alternatives considered**:
  - Classic `<script>` tags with globals: opens with a double-click, but the logic can't be
    imported by Node tests. Rejected, because the unit tests need it.
  - `npx http-server`: an unpinned npm dependency, which breaks "zero dependencies".
  - `python -m http.server`: works, but needs a second runtime. Mentioned in the quickstart as
    a fallback.

## R2. Test runner and scope

- **Decision**: Node's built-in test runner (`node --test`) with `node:assert/strict`. Node 24
  is installed locally (v24.21.0). Automated tests cover **only the logic modules**:
  `quote-picker.js` and `favorites-store.js`. The DOM layer (`app.js`) is checked manually
  through the [quickstart](./quickstart.md) scenarios.
- **Rationale**: It needs nothing installed, runs ES modules natively, and has built-in
  coverage with thresholds (`--experimental-test-coverage`, `--test-coverage-lines`,
  `--test-coverage-branches`, `--test-coverage-include`). Keeping all decisions in the two
  logic modules, and keeping `app.js` as thin wiring, puts the risky logic under test.
- **Alternatives considered**: jsdom or Playwright for DOM tests were removed at the user's
  request (they are npm dependencies). Jest and Vitest are also dependencies.

## R3. Quality tooling

- **Decision**: No linter, formatter, or type checker. JSDoc comments stay on every exported
  function, as documentation (Principle V), but nothing checks them.
- **Rationale**: The user asked to remove ESLint, Prettier, and TypeScript to keep this small
  assignment simple and dependency-free.
- **Mitigation**: Use a consistent hand-written style (2-space indent, semicolons, single
  quotes), `'use strict'` behavior from ES modules, and review before submitting. This
  deviation is recorded in Complexity Tracking.

## R4. Dependencies

- **Decision**: **Zero** npm dependencies, both runtime and dev. `package.json` exists only to
  set `"type": "module"` and define the `start`, `test`, and `test:coverage` scripts. There is no lockfile,
  because there is nothing to lock.

## R5. Choosing a random quote different from the current one

- **Decision**: To exclude the current quote, pick a random index from `0..n-2` and add 1 if
  it is at or after the current quote's index. With only one quote, return that quote. The
  random source is passed in (defaulting to `Math.random`) so tests can control it.
- **Rationale**: It takes one step, is uniform over the other quotes, can never loop forever
  (spec edge case), and satisfies FR-004 and SC-002 by construction.
- **Alternatives considered**: Re-rolling until the quote differs is unpredictable and could
  loop with a broken random source. Shuffling the whole list adds state that isn't needed.

## R6. Favorites persistence format and failure handling

- **Decision**: Use one `localStorage` key, `quote-of-the-day:favorites`, holding versioned
  JSON: `{"version": 1, "ids": ["q-003", "q-011"]}`. The order of `ids` is the order the
  quotes were favorited. Full contract: [contracts/storage-schema.md](./contracts/storage-schema.md).
  - The favorites store receives the storage object as a parameter, so unit tests pass an
    in-memory fake, including one that throws on every call.
  - On start, test whether storage works by writing and removing a probe key. If any storage
    call throws, switch to **memory-only mode** (FR-012).
  - On load, discard corrupted JSON, a wrong version, or a wrong shape, and start empty. Drop
    unknown or duplicate IDs.
  - Save the whole list after every change. If a save throws, switch to memory-only mode.
- **Rationale**: Keeping a version field lets the format change later safely. Saving only IDs
  stays correct if a quote's wording is fixed. Saving after every change means a reload never
  loses a favorite (SC-004). Because storage is passed in, the whole storage contract can be
  tested with unit tests, without a browser.
- **Alternatives considered**: Storing full quote objects goes stale. IndexedDB is far more
  complex than this data needs.

## R7. Favorites list UI and accessibility

- **Decision**: An always-visible "Your favorites" section below the quote, using a list where
  each item has a "Remove" button. The favorite toggle is a `<button>` with `aria-pressed`. The
  quote area uses `aria-live="polite"`. The storage notice uses `role="status"`. Full contract:
  [contracts/ui-contract.md](./contracts/ui-contract.md).
- **Rationale**: Native buttons are keyboard-operable by default (FR-014, SC-006). An
  always-visible list is the simplest design.

## R8. Continuous integration

- **Decision**: No CI workflow. Run `npm run test:coverage` locally before submitting. It runs
  the same tests as `npm test` and also enforces the coverage thresholds, so the coverage gate
  still applies.
- **Rationale**: The user removed the GitHub Actions workflow, and the project is a git
  repository but isn't pushed to GitHub. Recorded in Complexity Tracking.
