# Contract: Favorites Storage Schema

**Version**: 1 | **Applies to**: `src/js/favorites-store.js`
**Verified by**: `tests/favorites-store.test.js` (unit tests run against an in-memory fake
storage; there is a test case for every row in the reading and writing rules below)

This is the only data that lasts between visits. Changing its shape is a breaking change. Any
change MUST bump `version` and add a migration, or keep reading the old format.

## Location

| Item     | Value                              |
|----------|------------------------------------|
| Storage  | `window.localStorage`              |
| Key      | `quote-of-the-day:favorites`       |
| Probe key | `quote-of-the-day:probe` (written and removed straight away on startup; never left behind) |

## Value

The value is a JSON string:

```json
{
  "version": 1,
  "ids": ["q-003", "q-011", "q-001"]
}
```

| Field     | Type       | Rules                                                         |
|-----------|------------|---------------------------------------------------------------|
| `version` | integer    | MUST be `1`.                                                  |
| `ids`     | `string[]` | Quote IDs in the order they were favorited, oldest first. No duplicates. |

## Writing rules

1. The page writes the full value after **every** favorite change (add or remove).
2. What the page writes always matches the schema above exactly. It never writes duplicates,
   IDs that don't exist, or extra fields.
3. When the favorites list becomes empty, the page writes `{"version":1,"ids":[]}`. It does not
   delete the key.

## Reading rules (tolerant)

| Stored value                                   | Result                                            |
|------------------------------------------------|---------------------------------------------------|
| Key missing                                    | No favorites. Persistent mode.                    |
| Valid version-1 value                          | Load `ids` in order.                              |
| Contains IDs not in the current collection     | Drop those IDs and keep the rest in order.        |
| Contains duplicate IDs                         | Keep the first occurrence of each.                |
| `ids` contains entries that aren't strings     | Drop those entries.                               |
| Invalid JSON, wrong `version`, or wrong shape  | No favorites, and leave the stored value untouched until the next write. The page must not crash. |
| `localStorage` access throws                   | No favorites. Memory-only mode, and the notice is shown. |

Dropped entries are removed from storage the next time the page writes.
