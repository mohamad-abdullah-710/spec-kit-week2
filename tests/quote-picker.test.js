import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { pickRandomQuote } from '../src/js/quote-picker.js';
import { QUOTES } from '../src/js/quotes.js';
import { sequenceRandom } from './helpers/seeded-random.js';

/** @param {number} n */
const makeQuotes = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: `t-${i}`, text: `Quote ${i}`, author: 'Tester' }));

describe('pickRandomQuote without excludeId', () => {
  it('maps the random value to an index with Math.floor(random * n)', () => {
    const quotes = makeQuotes(4);
    assert.equal(pickRandomQuote(quotes, { random: sequenceRandom([0]) }), quotes[0]);
    assert.equal(pickRandomQuote(quotes, { random: sequenceRandom([0.999]) }), quotes[3]);
    assert.equal(pickRandomQuote(quotes, { random: sequenceRandom([0.5]) }), quotes[2]);
  });

  it('can return every quote in the collection', () => {
    const quotes = makeQuotes(5);
    const random = sequenceRandom(quotes.map((_, i) => i / quotes.length));
    const seen = new Set(quotes.map(() => pickRandomQuote(quotes, { random }).id));
    assert.equal(seen.size, quotes.length);
  });

  it('throws a RangeError for an empty collection', () => {
    assert.throws(() => pickRandomQuote([], { random: sequenceRandom([0]) }), RangeError);
  });
});

describe('pickRandomQuote with excludeId', () => {
  const SWEEP = 1000;
  const sweepRandom = () => sequenceRandom(Array.from({ length: SWEEP }, (_, i) => i / SWEEP));

  it('never returns the excluded quote', () => {
    const quotes = makeQuotes(5);
    for (const excluded of quotes) {
      const random = sweepRandom();
      for (let i = 0; i < SWEEP; i += 1) {
        assert.notEqual(pickRandomQuote(quotes, { excludeId: excluded.id, random }), excluded);
      }
    }
  });

  it('returns every other quote evenly', () => {
    const quotes = makeQuotes(5);
    for (const excluded of quotes) {
      const random = sweepRandom();
      const counts = new Map();
      for (let i = 0; i < SWEEP; i += 1) {
        const { id } = pickRandomQuote(quotes, { excludeId: excluded.id, random });
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      assert.equal(counts.size, quotes.length - 1);
      const values = [...counts.values()];
      assert.ok(Math.max(...values) - Math.min(...values) <= 1, `uneven counts: ${values}`);
    }
  });

  it('skips over the excluded index', () => {
    const [a, b, c] = makeQuotes(3);
    const quotes = [a, b, c];
    assert.equal(pickRandomQuote(quotes, { excludeId: b.id, random: sequenceRandom([0]) }), a);
    assert.equal(pickRandomQuote(quotes, { excludeId: b.id, random: sequenceRandom([0.6]) }), c);
  });

  it('returns the only quote when the collection has one quote', () => {
    const quotes = makeQuotes(1);
    const random = sequenceRandom([0.5]);
    assert.equal(pickRandomQuote(quotes, { excludeId: quotes[0].id, random }), quotes[0]);
  });

  it('ignores an excludeId that is not in the collection', () => {
    const quotes = makeQuotes(4);
    const random = sequenceRandom([0.5]);
    assert.equal(pickRandomQuote(quotes, { excludeId: 'missing', random }), quotes[2]);
  });
});

describe('built-in QUOTES collection', () => {
  it('has at least 10 quotes', () => {
    assert.ok(QUOTES.length >= 10, `only ${QUOTES.length} quotes`);
  });

  it('has unique ids in the q-NNN format', () => {
    const ids = QUOTES.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.match(id, /^q-\d{3}$/);
    }
  });

  it('has non-empty text and author on every quote', () => {
    for (const quote of QUOTES) {
      assert.ok(quote.text.trim().length > 0, `${quote.id} has empty text`);
      assert.ok(quote.author.trim().length > 0, `${quote.id} has empty author`);
    }
  });

  it('is frozen, along with every quote', () => {
    assert.ok(Object.isFrozen(QUOTES));
    for (const quote of QUOTES) {
      assert.ok(Object.isFrozen(quote), `${quote.id} is not frozen`);
    }
  });
});
