# Data Model: Quote of the Day Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-07

There are only two entities. Quotes are fixed data shipped with the page. Favorites are the
only state the visitor creates, and they are saved in the browser
(see [contracts/storage-schema.md](./contracts/storage-schema.md)).

## Quote

One entry in the built-in collection (`src/js/quotes.js`). The collection is read-only.

| Field    | Type     | Rules                                                                 |
|----------|----------|-----------------------------------------------------------------------|
| `id`     | `string` | Required. Unique. Format `q-NNN` (e.g. `q-007`). MUST never change or be reused once shipped, because saved favorites refer to it. |
| `text`   | `string` | Required. Non-empty after trimming. No length limit (long quotes must wrap, per the spec edge case). |
| `author` | `string` | Required. Non-empty after trimming. Use the literal `"Unknown"` when the author isn't known (US1, scenario 3). |

**Collection rules**

- At least 10 quotes (FR-013).
- All `id` values are unique.
- The collection and each quote are frozen at runtime, so code cannot change them.
- A unit test enforces every rule above, so a bad edit to the data fails CI.

## Favorite

A visitor's saved reference to a Quote. It exists only in the visitor's browser.

| Field     | Type     | Rules                                                              |
|-----------|----------|--------------------------------------------------------------------|
| `quoteId` | `string` | Must match the `id` of a Quote in the current collection.          |
| order     | implicit | Its position in the saved list. Earlier means favorited earlier (FR-009). |

**Rules**

- A `quoteId` appears at most once (FR-011). Favoriting a quote that is already a favorite
  changes nothing.
- When a quote is favorited again after being removed, it goes to the **end** of the list.
- IDs that don't match any current Quote are dropped silently when loading (spec edge case).

### Favorites state

```text
              toggle(id) / not in list           toggle(id) or remove(id) / in list
 ┌──────────────┐ ───────────────────────────▶ ┌────────────┐
 │ Not favorite │                              │  Favorite  │
 └──────────────┘ ◀─────────────────────────── └────────────┘
```

### Favorites store modes

The favorites store is in one of two modes for the whole visit. It never switches back.

| Mode          | When                                                     | Behavior                                    |
|---------------|----------------------------------------------------------|---------------------------------------------|
| `persistent`  | Storage probe succeeds on startup                        | Every change is saved to storage right away |
| `memory-only` | Storage probe fails, or any later read or write throws   | Changes are kept in memory for this visit only. The "favorites won't be saved" notice is shown (FR-012). |

```text
 startup ──probe ok──▶ persistent ──save throws──▶ memory-only
    └─────probe fails──────────────────────────────▲
```

## Displayed-quote state (runtime only, not saved)

| Field            | Type     | Rules                                                      |
|------------------|----------|------------------------------------------------------------|
| `currentQuoteId` | `string` | Always set after startup. Must match a Quote in the collection. |

- On startup, a random Quote from the collection is chosen (FR-001, FR-002).
- On "New quote", a random Quote **other than** the current one is chosen, unless the
  collection has exactly one quote (FR-004).
