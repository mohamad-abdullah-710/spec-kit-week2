/** @typedef {import('./quotes.js').Quote} Quote */

/**
 * Picks a random quote from a collection, never returning the quote with `excludeId`
 * unless it is the only one. Runs in one step: no retries, so it cannot loop.
 * @param {ReadonlyArray<Quote>} quotes - The collection to pick from.
 * @param {{ excludeId?: string, random?: () => number }} [options]
 *   `excludeId` is the quote to avoid; `random` returns a number in [0, 1).
 * @returns {Quote} The chosen quote.
 * @throws {RangeError} If `quotes` is empty.
 */
export function pickRandomQuote(quotes, { excludeId, random = Math.random } = {}) {
  if (quotes.length === 0) {
    throw new RangeError('quotes must not be empty');
  }
  const excludedIndex = quotes.findIndex((quote) => quote.id === excludeId);
  if (excludedIndex === -1 || quotes.length === 1) {
    return quotes[Math.floor(random() * quotes.length)];
  }
  // Pick among the other n-1 quotes, then shift past the excluded slot.
  const index = Math.floor(random() * (quotes.length - 1));
  return quotes[index >= excludedIndex ? index + 1 : index];
}
