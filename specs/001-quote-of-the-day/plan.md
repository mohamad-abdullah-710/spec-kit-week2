# Implementation Plan: Quote of the Day Page

**Branch**: `001-quote-of-the-day` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-quote-of-the-day/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A single static page that shows a random quote from a built-in collection of at least 10
quotes. It has a "New quote" button that always picks a different quote, and a favorites list
saved in the browser's `localStorage` so it survives reloads and restarts.

The page is plain HTML, CSS, and ES-module JavaScript with no backend, no framework, and no
build step. The logic lives in small, separately testable modules: quote data, random picker,
and favorites store. A thin DOM layer (`app.js`) connects them to the page. Storage and
randomness are passed in as parameters, so tests can control them.

Dev-only tooling (ESLint, Prettier, `tsc` checking JSDoc types, Node's test runner, and jsdom)
meets the constitution's quality gates without adding anything to the shipped page. Details
are in [research.md](./research.md).

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022, native ES modules). Types are written
as JSDoc comments and checked by TypeScript in check-only mode.

**Primary Dependencies**: None at runtime. Dev only: `eslint`, `@eslint/js`, `globals`,
`prettier`, `typescript`, `jsdom` (justified in [research.md §R5](./research.md)).

**Storage**: Browser `localStorage`, one versioned JSON key
([contracts/storage-schema.md](./contracts/storage-schema.md)). Falls back to memory-only for
the visit if storage isn't available.

**Testing**: Node built-in test runner (`node --test`) with built-in coverage. jsdom for
integration tests and UI contract tests.

**Target Platform**: Current versions of Chrome, Edge, Firefox, and Safari on desktop and
mobile. Served as static files over HTTP. Node 20 or newer is needed only for development
(v24.21.0 is installed).

**Project Type**: Static single-page web app (front end only)

**Performance Goals**: Quote visible within 1 s of opening the page (SC-001). New quote shown
within 0.5 s of pressing the button (SC-002). Both are easily met, since everything runs
locally with no network calls.

**Constraints**: No backend and no runtime network requests (FR-015). Works offline once
loaded. Keyboard accessible, WCAG AA contrast. No horizontal scrolling at 320 px.

**Scale/Scope**: One page, about 10–20 quotes, one visitor per browser. Expected size is
around 300–400 lines of source plus tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Section | Requirement | How this plan meets it | Pre | Post |
|---------------------|-------------|------------------------|-----|------|
| **I. Code Quality** | Lint and format with zero errors; type checking; small functions; explicit error handling; no dead code | ESLint 9 and Prettier run as gates. `tsc --noEmit --checkJs` checks JSDoc types. Every `localStorage` call is wrapped and its failure handled (memory-only mode). Logic is split into single-purpose modules. | ✅ | ✅ |
| **II. Test-First** | Tests written and seen failing before the code | `/speckit-tasks` will put each test task before its implementation task. Pure modules with injected storage and randomness make test-first practical. | ✅ | ✅ |
| **III. Layered Testing** | Unit, integration, and contract tests; ≥80% line coverage; 100% branch coverage on critical paths; deterministic tests; CI gate | Unit tests for `quotes`, `quote-picker`, and `favorites-store`. Contract tests for the storage schema and the UI contract. jsdom integration tests per user story. Coverage gates: ≥80% lines overall, 100% branches for `favorites-store.js` (the data-integrity path). Seeded random source and fake storage, with no real clock or network. | ✅ | ✅ |
| **IV. Simplicity** | YAGNI; clear boundaries; dependencies point inward; new dependencies justified | No framework, bundler, or backend. Core modules don't use the DOM or `window`, and only `app.js` and `main.js` touch them. All 6 dev dependencies are justified in research §R5. There are no runtime dependencies. | ✅ | ✅ |
| **V. Docs & Readability** | Public interfaces documented; README covers setup, run, and test | Every exported function has JSDoc for its parameters, return value, and errors (this doubles as type checking). The README is created alongside the code. | ✅ | ✅ |
| **Quality Standards** | CI gates; coverage reporting; lockfile; tracked TODOs | `npm run check` runs all gates. `.github/workflows/ci.yml` runs it on every pull request. `package-lock.json` is committed. | ⚠️ | ⚠️ |
| **Workflow** | Spec → Plan → Tasks → Implement → Review | Followed. Test tasks come first in `/speckit-tasks`. | ✅ | ✅ |

**Gate result: PASS**, with one follow-up. ⚠️ The project folder is not a git repository yet,
so the CI workflow and pull-request review gates can't run until it's put under git and pushed
to GitHub. This is an environment gap, not a design violation, so nothing goes in Complexity
Tracking.

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
    ├── quote-picker.js       # pickRandomQuote(quotes, { excludeId, random })
    ├── favorites-store.js    # createFavoritesStore({ storage, validIds }) → toggle/remove/has/list/mode
    ├── app.js                # initApp({ document, storage, random, quotes }): DOM wiring only
    └── main.js               # Entry point: initApp with window.localStorage and Math.random

tests/
├── unit/
│   ├── quotes.test.js            # Collection rules (≥10, unique IDs, non-empty fields)
│   ├── quote-picker.test.js      # Randomness, exclusion, single-quote case
│   └── favorites-store.test.js   # Toggle, remove, order, dedupe, failure modes (100% branches)
├── contract/
│   ├── storage-schema.test.js    # Read and write rules from contracts/storage-schema.md
│   └── ui-contract.test.js       # Roles, names, test IDs from contracts/ui-contract.md
├── integration/
│   ├── us1-random-quote.test.js
│   ├── us2-new-quote.test.js
│   └── us3-favorites.test.js     # Includes "reload" by re-running initApp with shared storage
└── helpers/
    ├── fake-storage.js           # In-memory Storage, with an option to throw on any call
    ├── seeded-random.js          # Deterministic random source
    └── load-page.js              # Loads src/index.html into jsdom

scripts/
└── serve.mjs                 # Static dev server with no dependencies (node:http), used by npm start

.github/workflows/ci.yml      # npm ci && npm run check
eslint.config.js
.prettierrc.json
tsconfig.json                 # allowJs, checkJs, noEmit, strict
package.json                  # scripts: start, lint, format, format:check, typecheck, test, test:coverage, check
package-lock.json
README.md                     # Setup, run, test (Principle V)
```

**Structure Decision**: A single front-end project. `src/` is exactly what gets deployed: it
can go to any static host as-is. The core modules (`quotes`, `quote-picker`,
`favorites-store`) don't use the DOM and depend on nothing, so they can be tested on their own.
`app.js` is the only module that touches the DOM, and `main.js` is the only one that touches
browser globals. Tests are grouped by layer (unit, contract, integration), following
Principle III.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is intentionally empty.
