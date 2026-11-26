import type { SessionOutcome } from '@/games/types'

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export function parseOutcome(raw: unknown): SessionOutcome | null {
  if (!record(raw) || (raw.schemaVersion !== 1 && raw.schemaVersion !== 2))
    return null
  if (
    !record(raw.config) ||
    !Array.isArray(raw.config.profileIds) ||
    !raw.config.profileIds.every((id) => id == null || typeof id === 'string')
  )
    return null
  if (
    !Array.isArray(raw.players) ||
    raw.players.length === 0 ||
    !raw.players.every(record)
  )
    return null
  if (
    raw.players.some(
      (player: Record<string, unknown>) =>
        player.stars !== undefined &&
        (typeof player.stars !== 'number' || !Number.isFinite(player.stars))
    )
  )
    return null
  if (raw.onlineFinal !== undefined) {
    const final = raw.onlineFinal
    if (
      !record(final) ||
      !record(final.scores) ||
      ![final.scores.host, final.scores.guest].every(
        (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0
      ) ||
      !['host', 'guest', 'seri', null].includes(
        final.winner as string | null
      ) ||
      !['host', 'guest'].includes(final.role as string) ||
      !record(final.localPlayer) ||
      !record(final.peerPlayer)
    )
      return null
  }
  const players = raw.players.map((player: Record<string, unknown>) => {
    if (typeof player.stars !== 'number' || !Number.isFinite(player.stars))
      return player
    return {
      ...player,
      stars: Math.max(0, Math.min(3, Math.trunc(player.stars))),
    }
  })
  return { ...raw, players } as unknown as SessionOutcome
}
