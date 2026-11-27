import { describe, expect, it } from 'vitest';
import ayoBerhitung from '@/games/ayo-berhitung';
import { createBundledContent } from '@/lib/content/defaults';
import type { SessionConfig } from '@/lib/session/session';
import { createPlayerRounds, roundSeed } from './roundSeeds';

function makeConfig(seed: number): SessionConfig {
  return {
    gameId: 'ayo-berhitung',
    difficulty: 'mudah',
    locale: 'id',
    players: 2,
    mode: 'layar',
    profileIds: [undefined, undefined],
    seed,
  };
}

describe('roundSeeds', () => {
  it('keeps baseSeed for player 1 and derives a deterministic distinct seed for player 2', () => {
    expect(roundSeed(42, 1)).toBe(42);
    expect(roundSeed(42, 2)).not.toBe(42);
    expect(roundSeed(42, 2)).toBe(roundSeed(42, 2));
    expect(roundSeed(42, 2)).toBe((42 ^ 0x9e3779b9) >>> 0);
  });

  it('produces equal-length distinct rounds for P1 and P2 across seeds 1..200 with >= 95% zero-collision', () => {
    const content = createBundledContent();
    let zeroCollisionSeeds = 0;

    for (let seed = 1; seed <= 200; seed++) {
      const pair = createPlayerRounds(ayoBerhitung, makeConfig(seed), content);
      expect(pair[1].length).toBe(pair[2].length);
      expect(pair[1].length).toBeGreaterThan(0);

      let collisions = 0;
      for (let i = 0; i < pair[1].length; i++) {
        const r1 = pair[1][i];
        const r2 = pair[2][i];
        if (
          JSON.stringify(r1) === JSON.stringify(r2) ||
          (r1.objectId === r2.objectId && r1.count === r2.count)
        ) {
          collisions += 1;
        }
      }
      if (collisions === 0) zeroCollisionSeeds += 1;
    }

    expect(zeroCollisionSeeds / 200).toBeGreaterThanOrEqual(0.95);
  });
});
