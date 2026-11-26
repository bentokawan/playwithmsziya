import { describe, expect, it } from 'vitest';
import { en } from './en';
import { id } from './id';
import { translate } from './useT';

describe('i18n', () => {
  it('has identical key sets for id and en', () => {
    const idKeys = Object.keys(id).sort();
    const enKeys = Object.keys(en).sort();
    expect(enKeys).toEqual(idKeys);
  });

  it('interpolates variables literally in both locales', () => {
    expect(translate('id', 'play.round', { n: 2, total: 4 })).toBe('Ronde 2 dari 4');
    expect(translate('en', 'play.round', { n: 2, total: 4 })).toBe('Round 2 of 4');
    expect(translate('id', 'gate.question', { a: 3, b: 5 })).toBe('Untuk orang dewasa: 3 + 5 = ?');
    expect(translate('en', 'play.turn', { name: 'Bunny' })).toBe("Bunny's turn!");
  });
});
