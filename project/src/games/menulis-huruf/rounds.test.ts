import { describe, expect, it } from 'vitest';
import { createMenulisHurufRounds } from './rounds';

describe('G05 Menulis Huruf rounds', () => {
  it('generates distinct letters per difficulty matching content §4.1', () => {
    const easy = createMenulisHurufRounds({
      gameId: 'menulis-huruf',
      difficulty: 'mudah',
      mode: 'solo',
      players: 1,
      profileIds: [undefined, undefined],
      locale: 'id',
      seed: 10,
    });
    expect(easy).toHaveLength(3);
    expect(new Set(easy.map((r) => r.letter)).size).toBe(3);

    const hard = createMenulisHurufRounds({
      gameId: 'menulis-huruf',
      difficulty: 'tantang',
      mode: 'solo',
      players: 1,
      profileIds: [undefined, undefined],
      locale: 'en',
      seed: 10,
    });
    expect(hard).toHaveLength(5);
    expect(hard.every((r) => r.letter === r.letter.toLowerCase())).toBe(true);
  });

  it('is deterministic for identical seeds', () => {
    const cfg = {
      gameId: 'menulis-huruf' as const,
      difficulty: 'sedang' as const,
      mode: 'solo' as const,
      players: 1 as const,
      profileIds: [undefined, undefined] as const,
      locale: 'id' as const,
      seed: 777,
    };
    expect(createMenulisHurufRounds(cfg)).toEqual(createMenulisHurufRounds(cfg));
  });
});
