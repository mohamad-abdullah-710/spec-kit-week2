/**
 * Returns a random-like function that yields the given values in order, cycling.
 * @param {number[]} values - Numbers in [0, 1).
 * @returns {() => number}
 * @throws {RangeError} If `values` is empty or contains a number outside [0, 1).
 */
export function sequenceRandom(values) {
  if (values.length === 0 || values.some((v) => v < 0 || v >= 1)) {
    throw new RangeError('values must be a non-empty list of numbers in [0, 1)');
  }
  let i = 0;
  return () => {
    const value = values[i];
    i = (i + 1) % values.length;
    return value;
  };
}
