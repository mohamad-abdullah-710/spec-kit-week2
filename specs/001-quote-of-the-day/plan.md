# Implementation Plan: Quote of the Day Page

**Branch**: `001-quote-of-the-day` | **Date**: 2026-10-07 (revised 2026-10-07) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-quote-of-the-day/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A single static page that shows a random quote from a built-in collection of at least 10
quotes. It has a "New quote" button that always picks a different quote, and a favorites list
saved in the browser's `localStorage` so it survives reloads and restarts.

The page is plain HTML, CSS, and ES-module JavaScript with no backend, no framework, no build
step, and **zero npm dependencies**. The logic lives in two small modules that don't touch the
page: `quote-picker.js` and `favorites-store.js`. They are unit-tested with Node's built-in test
runner. A thin DOM layer (`app.js`) connects them to the page and is checked manually through
the [quickstart](./quickstart.md) scenarios.

**Revision note**: This plan was simplified at the user's request for a small single-page
assignment. ESLint, Prettier, TypeScript, jsdom, and the GitHub Actions CI workflow were
removed. The resulting differences from the constitution are recorded in
[Complexity Tracking](#complexity-tracking).

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022, native ES modules). Exported functions
have JSDoc comments as documentation only; nothing checks the types.

**Primary Dependencies**: None, at runtime or for development. `package.json` only sets
`"type": "module"` and defines the scripts.

**Storage**: Browser `localStorage`, one versioned JSON key
([contracts/storage-schema.md](./contracts/storage-schema.md)). Falls back to memory-only for
the visit if storage isn't available.

**Testing**: Node built-in test runner (`node --test`, `node:assert/strict`) with built-in
coverage thresholds. Unit tests cover `quote-picker.js` and `favorites-store.js` only.

**Target Platform**: Current versions of Chrome, Edge, Firefox, and Safari on desktop and
mobile. Served as static files over HTTP. Node 22 or newer is needed only to run the tests and
the dev server (v24.21.0 is installed).

**Project Type**: Static single-page web app (front end only)

**Performance Goals**: Quote visible within 1 s of opening the page (SC-001). New quote shown
within 0.5 s of pressing the button (SC-002). Both are easily met, since everything runs
locally.

**Constraints**: No backend and no runtime network requests (FR-015). Works offline once
loaded. Keyboard accessible, WCAG AA contrast. No horizontal scrolling at 320 px. Zero npm
dependencies.

**Scale/Scope**: One page, about 10–20 quotes, one visitor per browser. Expected size is
around 250–350 lines of source plus tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Legend: ✅ met · ⚠️ deviation, justified in [Complexity Tracking](#complexity-tracking)

| Principle / Section | Requirement | How this plan meets it | Pre | Post |
|---------------------|-------------|------------------------|-----|------|
| **I. Code Quality**: lint and format | Linter and formatter with zero errors | Not used. Code follows a consistent hand-written style and is reviewed before submitting. | ⚠️ D1 | ⚠️ D1 |
| **I. Code Quality**: types | Static type checking where supported | Not used. JSDoc comments document the types, but nothing checks them. | ⚠️ D2 | ⚠️ D2 |
| **I. Code Quality**: other rules | Small functions, explicit error handling, no dead code | Every `localStorage` call is wrapped and its failure handled (memory-only mode). Logic is split into single-purpose modules. | ✅ | ✅ |
| **II. Test-First** | Tests written and seen failing before the code | `/speckit-tasks` will put each picker and store test task before its implementation task. Storage and randomness are passed in, which makes test-first practical. | ✅ | ✅ |
| **III. Testing**: unit tests | All business logic unit-tested | All decisions (random choice, exclusion, toggle, order, dedupe, load and save rules, failure modes) live in the two tested modules. | ✅ | ✅ |
| **III. Testing**: integration and contract tests | Integration tests at module boundaries, contract tests for public interfaces | The storage contract is fully covered by store unit tests using fake storage. The DOM wiring and UI contract are checked **manually** only. | ⚠️ D3 | ⚠️ D3 |
| **III. Testing**: coverage | ≥80% lines, 100% branches on critical paths | `npm run test:coverage` enforces ≥80% lines on the logic modules and 100% branches on `favorites-store.js`. `app.js` and `main.js` aren't measured. | ⚠️ D3 | ⚠️ D3 |
| **III. Testing**: determinism | No real randomness, clock, or network | Seeded random source and in-memory fake storage. | ✅ | ✅ |
| **IV. Simplicity** | YAGNI, clear boundaries, justified dependencies | No framework, bundler, backend, or dependencies. Only `app.js` and `main.js` touch the DOM or `window`. | ✅ | ✅ |
| **V. Docs & Readability** | Documented public interfaces; README covers setup, run, and test | JSDoc on every export. The README is created alongside the code. | ✅ | ✅ |
| **Quality Standards** | CI gates on pull requests; coverage reports; lockfile | No CI. The gates (`npm run test:coverage`) run locally. There's no lockfile because there are no dependencies, so that rule doesn't apply. | ⚠️ D4 | ⚠️ D4 |
| **Workflow** | Spec → Plan → Tasks → Implement → Review | Followed. Review is a self-review against the quickstart before submitting. | ✅ | ✅ |

**Gate result: PASS.** All four deviations (D1–D4) are justified in Complexity Tracking, as
the constitution's governance section requires. None is left unjustified.

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-of-the-day/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── storage-schema.md
│   └── ui-contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/                          # Everything served to the browser; no build step
├── index.html                # Page markup (follows contracts/ui-contract.md)
├── styles.css                # Layout, focus styles, responsive down to 320 px
└── js/
    ├── quotes.js             # Frozen built-in collection: { id, text, author }[]
    ├── quote-picker.js       # pickRandomQuote(quotes, { excludeId, random })   [unit-tested]
    ├── favorites-store.js    # createFavoritesStore({ storage, validIds })      [unit-tested]
    ├── app.js                # initApp({ document, storage, random, quotes }): DOM wiring only
    └── main.js               # Entry point: initApp with window.localStorage and Math.random

tests/
├── quote-picker.test.js      # Random choice, exclusion, single-quote case, collection rules
├── favorites-store.test.js   # Toggle, remove, order, dedupe, every storage-schema rule, failure modes
└── helpers/
    ├── fake-storage.js       # In-memory Storage, with an option to throw on any call
    └── seeded-random.js      # Deterministic random source

scripts/
└── serve.mjs                 # Static dev server with no dependencies (node:http), used by npm start

package.json                  # "type": "module"; scripts: start, test, test:coverage; no dependencies
README.md                     # Setup, run, test (Principle V)
```

**Structure Decision**: A single front-end project with a flat `tests/` folder, since there is
only one test layer. `src/` is exactly what gets deployed. The two tested modules don't use the
DOM and depend on nothing. `app.js` is kept as thin wiring with no decisions of its own, so the
code that isn't tested automatically is as small as possible and covered by the manual
quickstart scenarios.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

These are deviations, all made at the user's request (2026-10-07) for a small single-page
assignment with zero npm dependencies.

| ID | Violation | Why Needed | Simpler Alternative Rejected Because |
|----|-----------|------------|--------------------------------------|
| D1 | **Principle I**: no linter or formatter (ESLint and Prettier removed) | Zero-dependency requirement. The codebase is a few hundred lines in five files, small enough to keep consistent by hand. | *(This deviation is itself the simpler option.)* Keeping ESLint and Prettier adds about 4 dev dependencies and config files, which is more setup than a single-page assignment needs. **Mitigation**: consistent style, plus a self-review before submitting. |
| D2 | **Principle I**: no static type checking (TypeScript `checkJs` removed) | Zero-dependency requirement. There are only a few function signatures, and JSDoc comments still document them. | Keeping `tsc` adds a dependency and a `tsconfig.json`. **Mitigation**: JSDoc on every export. Unit tests check the inputs and outputs of the logic modules. |
| D3 | **Principle III**: no integration or UI contract tests (jsdom removed). Coverage excludes `app.js` and `main.js`. | DOM testing in Node needs jsdom (a dependency) or a browser-automation tool (heavy). | Keeping jsdom breaks "zero dependencies". **Mitigation**: all decision-making logic is in the two unit-tested modules, and the storage contract is fully tested at unit level. `app.js` only wires things together. 13 manual quickstart scenarios cover every user story, FR-012, FR-014, and FR-015. |
| D4 | **Quality Standards**: no CI workflow (GitHub Actions removed) | The project is a git repository but isn't pushed to GitHub, and is submitted as an assignment, so there are no pull requests for CI to guard. | *(This deviation is itself the simpler option.)* **Mitigation**: run `npm run test:coverage` locally before submitting. It enforces the same coverage thresholds CI would. |

**Review trigger**: If the project grows beyond this assignment, for example with more pages,
several contributors, or a git remote, D1–D4 should be reconsidered and the removed tooling
brought back.
