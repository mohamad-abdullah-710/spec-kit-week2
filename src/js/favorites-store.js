// Favorites state plus its persistence. Storage format: contracts/storage-schema.md.

/** The localStorage key that holds the favorites. */
export const FAVORITES_KEY = 'quote-of-the-day:favorites';

/** A key written and removed straight away on startup to test that storage works. */
export const PROBE_KEY = 'quote-of-the-day:probe';

const FORMAT_VERSION = 1;

/**
 * Checks that storage can be written to and cleaned up.
 * @param {Storage | null} storage
 * @returns {boolean} True if storage is usable.
 */
function probe(storage) {
  if (storage === null) {
    return false;
  }
  try {
    storage.setItem(PROBE_KEY, '1');
    storage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false; // Blocked or full storage: the caller falls back to memory-only mode.
  }
}

/**
 * Parses a stored value into a clean list of favorite ids. Tolerant by design:
 * anything that doesn't match the version-1 schema yields an empty list.
 * @param {string | null} raw - The stored value, or null if the key is missing.
 * @param {Set<string>} validIds - Ids of quotes in the current collection.
 * @returns {string[]} Known ids, without duplicates, in stored order.
 */
function parseStoredIds(raw, validIds) {
  let value;
  try {
    value = JSON.parse(raw ?? 'null');
  } catch {
    return []; // Corrupted data is ignored, per the storage contract.
  }
  const isVersion1 =
    value !== null && typeof value === 'object' && value.version === FORMAT_VERSION;
  if (!isVersion1 || !Array.isArray(value.ids)) {
    return [];
  }
  const known = value.ids.filter((id) => typeof id === 'string' && validIds.has(id));
  return [...new Set(known)];
}

/**
 * Creates the favorites store. It saves after every change while storage works, and
 * switches permanently to memory-only mode the first time storage fails.
 * @param {{ storage: Storage | null, validIds: ReadonlyArray<string> }} deps
 *   `storage` is null when the browser blocks localStorage.
 * @returns {{
 *   has(id: string): boolean,
 *   toggle(id: string): boolean,
 *   remove(id: string): void,
 *   list(): string[],
 *   readonly mode: 'persistent' | 'memory-only',
 * }}
 */
export function createFavoritesStore({ storage, validIds }) {
  const validIdSet = new Set(validIds);
  let mode = probe(storage) ? 'persistent' : 'memory-only';
  let ids = [];

  if (mode === 'persistent') {
    try {
      ids = parseStoredIds(storage.getItem(FAVORITES_KEY), validIdSet);
    } catch {
      mode = 'memory-only'; // Reads are blocked, so writes can't be trusted either.
    }
  }

  const assertValid = (id) => {
    if (!validIdSet.has(id)) {
      throw new RangeError(`unknown quote id: ${id}`);
    }
  };

  const save = () => {
    if (mode === 'memory-only') {
      return;
    }
    try {
      storage.setItem(FAVORITES_KEY, JSON.stringify({ version: FORMAT_VERSION, ids }));
    } catch {
      mode = 'memory-only'; // Keep working in memory; the page shows the notice.
    }
  };

  return {
    has: (id) => ids.includes(id),
    toggle(id) {
      assertValid(id);
      const isFavorite = ids.includes(id);
      ids = isFavorite ? ids.filter((other) => other !== id) : [...ids, id];
      save();
      return !isFavorite;
    },
    remove(id) {
      assertValid(id);
      if (ids.includes(id)) {
        ids = ids.filter((other) => other !== id);
        save();
      }
    },
    list: () => [...ids],
    get mode() {
      return mode;
    },
  };
}
