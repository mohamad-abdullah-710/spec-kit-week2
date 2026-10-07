# Quickstart: Quote of the Day Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

How to run the page and check that the feature works from start to finish. For element names
and storage format, see [contracts/ui-contract.md](./contracts/ui-contract.md) and
[contracts/storage-schema.md](./contracts/storage-schema.md).

## Prerequisites

- Node.js 20 or newer (24 recommended), with npm
- A current desktop browser (Chrome, Edge, Firefox, or Safari)

## Setup

```powershell
cd ~\spec-kit-week2
npm ci          # use `npm install` the first time, before package-lock.json exists
```

## Automated checks

| Command                 | What it does                                                   | Expected result |
|-------------------------|----------------------------------------------------------------|-----------------|
| `npm run format:check`  | Prettier check                                                 | No differences  |
| `npm run lint`          | ESLint                                                         | 0 errors        |
| `npm run typecheck`     | `tsc --noEmit` on JSDoc-typed JavaScript                       | 0 errors        |
| `npm test`              | Unit, contract, and integration tests                          | All pass        |
| `npm run test:coverage` | Tests with coverage gates: at least 80% lines overall, 100% branches for `favorites-store.js` | All pass, gates met |
| `npm run check`         | All of the above, in that order (this is what CI runs)         | Exit code 0     |

## Run the page

```powershell
npm start       # serves src/ at http://localhost:8080
```

Open <http://localhost:8080>. Opening `src/index.html` directly from disk (`file://`) won't work,
because browsers block module scripts loaded that way.

## Manual validation scenarios

Do these in a normal browser window, unless the step says otherwise.

| #  | Covers         | Steps                                                                    | Expected |
|----|----------------|--------------------------------------------------------------------------|----------|
| 1  | US1, FR-001    | Open the page                                                            | One quote and its author appear within about 1 second |
| 2  | US1, SC-003    | Reload about 10 times                                                    | Several different quotes appear |
| 3  | US2, FR-004    | Click "New quote" 20 times                                               | The quote changes every time and never repeats the previous one. The URL doesn't change and the page doesn't reload. |
| 4  | US2, SC-006    | Press Tab until "New quote" is focused, then press Enter, then Space     | A new quote appears each time. A focus ring is visible. |
| 5  | US3, FR-006/7  | Click "Add to favorites"                                                 | The button reads "Remove from favorites" and looks pressed. The quote appears in "Your favorites". |
| 6  | US3, FR-008    | Favorite 2 more quotes using "New quote", then reload. Then close and reopen the browser. | All 3 favorites are still listed in the order they were added. The toggle shows pressed when one of them is displayed. |
| 7  | US3, FR-010    | Click "Remove" on the middle favorite, then reload                       | It's gone from the list, and the other two stay in order |
| 8  | US3, FR-009    | Remove every favorite                                                    | The "No favorites yet…" message appears |
| 9  | FR-012         | In DevTools → Application → Local Storage, set `quote-of-the-day:favorites` to `not json`, then reload | The page loads normally with no favorites and no errors in the console |
| 10 | FR-012         | Open the page with site data blocked (for example, Firefox with cookies blocked for the site) | The storage notice is visible. Quotes, "New quote", and favoriting still work for that visit. |
| 11 | Edge case      | In DevTools, set the viewport to 320 px wide and click "New quote" until the longest quote appears | No horizontal scrolling. The whole quote is readable. |
| 12 | FR-015         | Load the page, then turn on offline mode in DevTools and click "New quote" | It still works |
