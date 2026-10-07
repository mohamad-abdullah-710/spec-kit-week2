# Research: Quote of the Day Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-07

The user fixed the core stack: plain HTML/CSS/JavaScript, no backend, favorites in
`localStorage`. The research below resolves the remaining unknowns and reconciles that stack
with the constitution, which requires linting, type checking, test-first work, coverage
floors, and contract tests.

## R1. Module format and how the page is served

- **Decision**: Native ES modules (`<script type="module">`), no bundler and no build step.
  The page is served over HTTP during development by a small Node script with no dependencies
  (`scripts/serve.mjs`, using only `node:http`), started with `npm start`. Any static host can
  serve it in production.
- **Rationale**: ES modules let the same source files run in the browser and be imported
  directly by Node tests, so no code is duplicated and nothing needs compiling. Browsers block
  module scripts loaded from `file://`, so an HTTP server is required.
- **Alternatives considered**:
  - Classic `<script>` tags with globals: the page opens with a double-click, but the code is
    hard to import in tests and leaks globals. Rejected.
  - A bundler such as Vite or esbuild: adds a build step and dependencies the user asked to
    avoid. Rejected.
  - `python -m http.server` or `npx http-server`: an extra runtime, or an unpinned dependency.
    A 30-line Node script avoids both.

## R2. Test runner

- **Decision**: Node's built-in test runner (`node --test`) with `node:assert/strict`.
  Node 24 is installed locally (v24.21.0).
- **Rationale**: It adds no dependencies, runs ES modules natively, and has built-in coverage
  with thresholds (`--experimental-test-coverage`, `--test-coverage-lines`,
  `--test-coverage-branches`, `--test-coverage-include`).
- **Alternatives considered**: Jest needs ESM configuration and adds dependencies. Vitest is a
  good fit but brings in the Vite toolchain. Neither gives more than this small project needs.

## R3. Testing the DOM (integration and UI contract tests)

- **Decision**: `jsdom`, as a dev-only dependency. Integration tests load the real
  `src/index.html` into jsdom, call `initApp` with a fake storage and a seeded random function,
  then simulate clicks and key presses.
- **Rationale**: This tests the actual markup and wiring quickly and with deterministic
  results, which Principle III requires (no real clock, network, or randomness).
- **Alternatives considered**: Playwright tests in a real browser give higher fidelity but
  need a browser download, are slower, and are not required for this scope. Manual checks in
  real browsers are covered by [quickstart.md](./quickstart.md) instead.

## R4. Static quality tooling (Principle I)

- **Decision**:
  - **Lint**: ESLint 9 with flat config (`eslint.config.js`), using `@eslint/js` recommended
    rules plus `globals` for browser and Node environments.
  - **Format**: Prettier, checked with `prettier --check`.
  - **Types**: TypeScript in check-only mode (`tsc --noEmit`) with `allowJs` and `checkJs`,
    with types written as JSDoc comments. The shipped files stay plain `.js`.
- **Rationale**: The constitution requires a linter, a formatter, and type checking "where the
  language supports it". JSDoc with `checkJs` adds type safety without changing the language
  or adding a build step, so the user's plain-JavaScript choice is kept.
- **Alternatives considered**: Writing the code in TypeScript would need compiling, which
  conflicts with "plain JavaScript". Having no type checking would violate Principle I.

## R5. Dev dependency justification (Principle IV)

All dependencies are dev-only. The shipped page has **zero** runtime dependencies.

| Package      | Purpose                         | Why it's acceptable                          |
|--------------|---------------------------------|----------------------------------------------|
| `eslint`     | Linting (Principle I)           | Industry standard, actively maintained, MIT  |
| `@eslint/js` | Recommended ESLint rule set     | Official ESLint package, MIT                 |
| `globals`    | Browser/Node global definitions | Required by ESLint flat config, MIT          |
| `prettier`   | Formatting (Principle I)        | Industry standard, actively maintained, MIT  |
| `typescript` | JSDoc type checking only        | Official, actively maintained, Apache-2.0    |
| `jsdom`      | DOM for integration tests       | Most widely used DOM emulator, MIT           |

Versions are pinned through `package-lock.json` (Quality Standards: dependency hygiene).

## R6. Choosing a random quote different from the current one

- **Decision**: To exclude the current quote, pick a random index from `0..n-2` and add 1 if
  it is at or after the current quote's index. With only one quote, return that quote. The
  random source is passed in (defaulting to `Math.random`) so tests can control it.
- **Rationale**: It takes one step, is uniform over the other quotes, can never loop forever
  (spec edge case), and satisfies FR-004 and SC-002 by construction.
- **Alternatives considered**: Re-rolling until the quote differs works, but it is
  unpredictable and could loop with a broken random source. Shuffling the whole list adds state
  that isn't needed.

## R7. Favorites persistence format and failure handling

- **Decision**: Use one `localStorage` key, `quote-of-the-day:favorites`, holding versioned
  JSON: `{"version": 1, "ids": ["q-003", "q-011"]}`. The order of `ids` is the order the
  quotes were favorited. Full contract: [contracts/storage-schema.md](./contracts/storage-schema.md).
  - On start, test whether storage works by writing and removing a probe key. If any storage
    call throws, switch to **memory-only mode** and show a notice (FR-012).
  - On load, discard corrupted JSON, a wrong version, or a wrong shape, and start empty. Drop
    unknown or duplicate IDs (spec edge cases, FR-011).
  - Save the whole list after every change. If a save throws, switch to memory-only mode and
    show the notice.
- **Rationale**: Keeping a version field lets the format change later without guessing. Saving
  only IDs keeps the stored data small and stays correct if a quote's wording is fixed. Saving
  after every change means a reload never loses a favorite (SC-004).
- **Alternatives considered**: Storing the full quote objects duplicates data and goes stale if
  the collection changes. IndexedDB would be far more complex than this data needs.

## R8. Favorites list UI and accessibility

- **Decision**: An always-visible "Your favorites" section below the quote, using a list where
  each item has a "Remove" button. The favorite toggle is a `<button>` with `aria-pressed`. The
  quote area uses `aria-live="polite"` so screen readers announce new quotes. The storage notice
  uses `role="status"`. Full contract: [contracts/ui-contract.md](./contracts/ui-contract.md).
- **Rationale**: Native buttons are keyboard-operable by default (FR-014, SC-006). An
  always-visible list is the simplest design and helps SC-005 (finding a favorite within 30
  seconds).
- **Alternatives considered**: A modal or separate favorites view needs focus management and
  more states. Not needed for v1.

## R9. Continuous integration

- **Decision**: A GitHub Actions workflow (`.github/workflows/ci.yml`) runs
  `npm ci && npm run check` on every pull request. `npm run check` runs format check, lint,
  type check, and tests with coverage thresholds.
- **Rationale**: Quality Standards require automated gates that block merge.
- **Note**: The project folder is not a git repository yet. The workflow file will be written,
  but it only takes effect once the project is pushed to a GitHub repository.
