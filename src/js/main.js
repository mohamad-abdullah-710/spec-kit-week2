import { initApp } from './app.js';

/**
 * Returns window.localStorage, or null if the browser blocks it. Some browsers throw a
 * SecurityError just from reading the property when site data is blocked.
 * @returns {Storage | null}
 */
function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null; // Treated as "storage unavailable"; the favorites store falls back to memory.
  }
}

initApp({ document, storage: getStorage(), random: Math.random });
