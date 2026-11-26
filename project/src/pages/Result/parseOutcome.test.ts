import { expect, it } from 'vitest'
import { parseOutcome } from './parseOutcome'

const base = {
  schemaVersion: 2,
  config: { gameId: 'ayo-berhitung', profileIds: [undefined, undefined] },
  players: [{ player: 1, stars: 2 }],
  finishedAt: 'now',
}

it('rejects missing profileIds and malformed online results', () => {
  expect(
    parseOutcome({ ...base, config: { gameId: 'ayo-berhitung' } })
  ).toBeNull()
  expect(parseOutcome({ ...base, onlineFinal: {} })).toBeNull()
})

it('clamps stars and preserves valid outcomes', () => {
  expect(
    parseOutcome({ ...base, players: [{ player: 1, stars: 1e9 }] })?.players[0]
      .stars
  ).toBe(3)
  expect(parseOutcome(base)).toEqual(base)
  expect(parseOutcome(JSON.parse(JSON.stringify(base)))).not.toBeNull()
})

it('rejects present stars with a nonnumeric type', () => {
  expect(
    parseOutcome({ ...base, players: [{ player: 1, stars: '10000000' }] })
  ).toBeNull()
})
