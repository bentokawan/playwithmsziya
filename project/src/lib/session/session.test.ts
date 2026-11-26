import { describe, expect, it } from 'vitest';
import { buildSessionSearch, newSeed, parseSessionConfig } from './session';

describe('parseSessionConfig', () => {
  it('accepts supported values including seed and legacy players=2', () => {
    expect(
      parseSessionConfig('menulis-huruf', new URLSearchParams('level=sedang&players=2&lang=en&seed=98765')),
    ).toEqual({
      gameId: 'menulis-huruf',
      difficulty: 'sedang',
      mode: 'giliran',
      players: 2,
      profileIds: [undefined, undefined],
      locale: 'en',
      seed: 98765,
    });
  });

  it('parses mode=layar with known profileIds', () => {
    const known = new Set(['a', 'b']);
    const cfg = parseSessionConfig(
      'ayo-berhitung',
      new URLSearchParams('mode=layar&p1=a&p2=b&seed=7'),
      known,
    );
    expect(cfg.mode).toBe('layar');
    expect(cfg.players).toBe(2);
    expect(cfg.profileIds).toEqual(['a', 'b']);
  });

  it('downgrades unsupported mode=layar for bunyi-awal to giliran', () => {
    const cfg = parseSessionConfig('bunyi-awal', new URLSearchParams('mode=layar'));
    expect(cfg.mode).toBe('giliran');
    expect(cfg.players).toBe(2);
  });

  it('drops unknown profile ids so player runs as Guest', () => {
    const known = new Set(['b']);
    const cfg = parseSessionConfig(
      'ayo-berhitung',
      new URLSearchParams('mode=solo&p1=unknown&p2=b'),
      known,
    );
    expect(cfg.profileIds[0]).toBeUndefined();
    expect(cfg.profileIds[1]).toBe('b');
  });

  it('drops invalid room code and keeps valid 4-digit room code', () => {
    expect(
      parseSessionConfig('ayo-berhitung', new URLSearchParams('mode=online&room=12a4')).room,
    ).toBeUndefined();
    expect(
      parseSessionConfig('ayo-berhitung', new URLSearchParams('mode=online&room=0429')).room,
    ).toBe('0429');
  });

  it('falls back for invalid query values and missing/invalid seed', () => {
    expect(
      parseSessionConfig('menulis-huruf', new URLSearchParams('level=expert&players=99&lang=fr&seed=-5')),
    ).toEqual({
      gameId: 'menulis-huruf',
      difficulty: 'mudah',
      mode: 'solo',
      players: 1,
      profileIds: [undefined, undefined],
      locale: 'id',
      seed: 1,
    });

    expect(parseSessionConfig('menulis-huruf', new URLSearchParams('seed=abc')).seed).toBe(1);
  });

  it('roundtrips buildSessionSearch and parseSessionConfig', () => {
    const known = new Set(['p1', 'p2']);
    const config = {
      gameId: 'menulis-huruf' as const,
      difficulty: 'tantang' as const,
      mode: 'layar' as const,
      players: 2 as const,
      profileIds: ['p1', 'p2'] as const,
      locale: 'id' as const,
      seed: 4242,
    };
    const search = buildSessionSearch(config);
    expect(parseSessionConfig('menulis-huruf', new URLSearchParams(search), known)).toEqual(config);
  });

  it('generates valid uint32 seeds', () => {
    const s = newSeed();
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(0xffffffff);
  });
});
