import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createFavoritesStore,
  FAVORITES_KEY,
  PROBE_KEY,
} from '../src/js/favorites-store.js';
import { createFakeStorage, createThrowingStorage } from './helpers/fake-storage.js';

const VALID_IDS = ['q-001', 'q-002', 'q-003', 'q-004', 'q-005'];

/** @param {unknown} value */
const stored = (value) => ({ [FAVORITES_KEY]: JSON.stringify(value) });

/** @param {string[]} ids */
const savedValue = (ids) => JSON.stringify({ version: 1, ids });

/** @param {Record<string, string>} [initial] */
const newStore = (initial = {}) => {
  const storage = createFakeStorage({ initial });
  return { storage, store: createFavoritesStore({ storage, validIds: VALID_IDS }) };
};

describe('favorites store: behavior', () => {
  it('starts empty and persistent with empty storage', () => {
    const { store } = newStore();
    assert.deepEqual(store.list(), []);
    assert.equal(store.has('q-001'), false);
    assert.equal(store.mode, 'persistent');
  });

  it('toggles a quote on and off', () => {
    const { store } = newStore();
    assert.equal(store.toggle('q-002'), true);
    assert.equal(store.has('q-002'), true);
    assert.deepEqual(store.list(), ['q-002']);
    assert.equal(store.toggle('q-002'), false);
    assert.equal(store.has('q-002'), false);
    assert.deepEqual(store.list(), []);
  });

  it('lists favorites in the order they were favorited', () => {
    const { store } = newStore();
    store.toggle('q-003');
    store.toggle('q-001');
    store.toggle('q-002');
    assert.deepEqual(store.list(), ['q-003', 'q-001', 'q-002']);
  });

  it('moves a re-favorited quote to the end', () => {
    const { store } = newStore();
    store.toggle('q-003');
    store.toggle('q-001');
    store.toggle('q-003');
    store.toggle('q-003');
    assert.deepEqual(store.list(), ['q-001', 'q-003']);
  });

  it('removes only the given id, and ignores ids that are not favorites', () => {
    const { store } = newStore();
    store.toggle('q-001');
    store.toggle('q-002');
    store.remove('q-001');
    assert.deepEqual(store.list(), ['q-002']);
    store.remove('q-004');
    assert.deepEqual(store.list(), ['q-002']);
  });

  it('throws a RangeError for ids that are not in the collection', () => {
    const { store } = newStore();
    assert.throws(() => store.toggle('q-999'), RangeError);
    assert.throws(() => store.remove('q-999'), RangeError);
  });

  it('returns a copy from list()', () => {
    const { store } = newStore();
    store.toggle('q-001');
    store.list().push('q-002');
    assert.deepEqual(store.list(), ['q-001']);
  });

  it('keeps favorites across a reload on the same storage', () => {
    const { storage, store } = newStore();
    store.toggle('q-004');
    store.toggle('q-002');
    const reloaded = createFavoritesStore({ storage, validIds: VALID_IDS });
    assert.deepEqual(reloaded.list(), ['q-004', 'q-002']);
    assert.equal(reloaded.has('q-004'), true);
  });
});

describe('favorites store: storage contract', () => {
  it('writes the exact version-1 value after a change', () => {
    const { storage, store } = newStore();
    store.toggle('q-003');
    store.toggle('q-001');
    assert.equal(storage.getItem(FAVORITES_KEY), savedValue(['q-003', 'q-001']));
  });

  it('writes an empty list instead of removing the key', () => {
    const { storage, store } = newStore();
    store.toggle('q-003');
    store.remove('q-003');
    assert.equal(storage.getItem(FAVORITES_KEY), savedValue([]));
  });

  it('leaves no probe key behind', () => {
    const { storage } = newStore();
    assert.equal(PROBE_KEY in storage.snapshot(), false);
  });

  it('drops unknown ids on load and leaves them out of the next write', () => {
    const { storage, store } = newStore(stored({ version: 1, ids: ['q-002', 'q-999', 'q-001'] }));
    assert.deepEqual(store.list(), ['q-002', 'q-001']);
    store.toggle('q-005');
    assert.equal(storage.getItem(FAVORITES_KEY), savedValue(['q-002', 'q-001', 'q-005']));
  });

  it('keeps the first occurrence of duplicate ids', () => {
    const { store } = newStore(stored({ version: 1, ids: ['q-002', 'q-001', 'q-002'] }));
    assert.deepEqual(store.list(), ['q-002', 'q-001']);
  });

  it('drops entries that are not strings', () => {
    const { store } = newStore(stored({ version: 1, ids: ['q-001', 7, null, { id: 'q-002' }] }));
    assert.deepEqual(store.list(), ['q-001']);
  });

  for (const [label, raw] of [
    ['invalid JSON', 'not json'],
    ['a wrong version', JSON.stringify({ version: 2, ids: ['q-001'] })],
    ['ids that is not an array', JSON.stringify({ version: 1, ids: 'q-001' })],
    ['a top-level array', JSON.stringify(['q-001'])],
    ['JSON null', 'null'],
  ]) {
    it(`ignores ${label} without throwing or rewriting it`, () => {
      const { storage, store } = newStore({ [FAVORITES_KEY]: raw });
      assert.deepEqual(store.list(), []);
      assert.equal(store.mode, 'persistent');
      assert.equal(storage.getItem(FAVORITES_KEY), raw);
    });
  }

  it('uses memory-only mode when storage is null', () => {
    const store = createFavoritesStore({ storage: null, validIds: VALID_IDS });
    assert.equal(store.mode, 'memory-only');
    assert.equal(store.toggle('q-001'), true);
    assert.deepEqual(store.list(), ['q-001']);
  });

  it('uses memory-only mode when every storage call throws', () => {
    const store = createFavoritesStore({ storage: createThrowingStorage(), validIds: VALID_IDS });
    assert.equal(store.mode, 'memory-only');
    assert.equal(store.toggle('q-001'), true);
    assert.deepEqual(store.list(), ['q-001']);
  });

  it('switches to memory-only mode when a save fails, and stops writing', () => {
    const { storage, store } = newStore();
    store.toggle('q-001');
    storage.setFailOn(['setItem']);
    assert.equal(store.toggle('q-002'), true);
    assert.deepEqual(store.list(), ['q-001', 'q-002']);
    assert.equal(store.mode, 'memory-only');

    storage.setFailOn([]);
    store.toggle('q-003');
    assert.equal(storage.getItem(FAVORITES_KEY), savedValue(['q-001']));
  });

  it('uses memory-only mode with no favorites when reading throws', () => {
    const storage = createFakeStorage({
      initial: stored({ version: 1, ids: ['q-001'] }),
      failOn: ['getItem'],
    });
    const store = createFavoritesStore({ storage, validIds: VALID_IDS });
    assert.equal(store.mode, 'memory-only');
    assert.deepEqual(store.list(), []);
  });
});
