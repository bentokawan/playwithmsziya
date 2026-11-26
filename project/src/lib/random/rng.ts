export interface Rng {
  next(): number;
  int(min: number, maxInclusive: number): number;
  pick<T>(arr: readonly T[]): T;
  shuffle<T>(arr: readonly T[]): T[];
  sample<T>(arr: readonly T[], n: number): T[];
}

/**
 * Deterministic PRNG based on mulberry32.
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, maxInclusive: number): number {
    if (maxInclusive < min) {
      throw new RangeError(`Invalid range: min (${min}) > maxInclusive (${maxInclusive})`);
    }
    return min + Math.floor(next() * (maxInclusive - min + 1));
  }

  function pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) {
      throw new RangeError('Cannot pick from an empty array');
    }
    return arr[int(0, arr.length - 1)];
  }

  function shuffle<T>(arr: readonly T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function sample<T>(arr: readonly T[], n: number): T[] {
    if (n < 0 || n > arr.length) {
      throw new RangeError(`Cannot sample ${n} items from array of length ${arr.length}`);
    }
    return shuffle(arr).slice(0, n);
  }

  return { next, int, pick, shuffle, sample };
}
