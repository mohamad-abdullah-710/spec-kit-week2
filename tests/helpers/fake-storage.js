// In-memory stand-in for window.localStorage, with controllable failures.

const ALL_METHODS = ['getItem', 'setItem', 'removeItem'];

/**
 * @param {string[] | 'all'} failOn
 * @returns {Set<string>}
 */
function toFailSet(failOn) {
  return new Set(failOn === 'all' ? ALL_METHODS : failOn);
}

/**
 * Creates a fake Web Storage object.
 * @param {{ initial?: Record<string, string>, failOn?: string[] | 'all' }} [options]
 *   `initial` seeds stored values; `failOn` lists methods that throw when called.
 * @returns {{
 *   getItem(key: string): string | null,
 *   setItem(key: string, value: string): void,
 *   removeItem(key: string): void,
 *   snapshot(): Record<string, string>,
 *   setFailOn(failOn: string[] | 'all'): void,
 * }}
 */
export function createFakeStorage({ initial = {}, failOn = [] } = {}) {
  const data = new Map(Object.entries(initial));
  let failing = toFailSet(failOn);

  const guard = (method) => {
    if (failing.has(method)) {
      throw new Error('storage unavailable');
    }
  };

  return {
    getItem(key) {
      guard('getItem');
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      guard('setItem');
      data.set(key, String(value));
    },
    removeItem(key) {
      guard('removeItem');
      data.delete(key);
    },
    snapshot() {
      return Object.fromEntries(data);
    },
    setFailOn(next) {
      failing = toFailSet(next);
    },
  };
}

/**
 * Creates a fake storage where every method throws.
 * @returns {ReturnType<typeof createFakeStorage>}
 */
export function createThrowingStorage() {
  return createFakeStorage({ failOn: 'all' });
}
