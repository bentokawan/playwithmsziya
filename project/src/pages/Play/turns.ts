import type { PlayerCount, PlayerNumber } from '@/lib/session/session';

export interface Turn {
  readonly player: PlayerNumber;
  readonly roundIndex: number;
}

export function buildTurnQueue(
  players: PlayerCount,
  roundsPerPlayer: number,
  turnMode: 'per-round' | 'in-game',
): Turn[] {
  if (turnMode === 'in-game') {
    return [{ player: 1, roundIndex: 0 }];
  }

  const turns: Turn[] = [];
  for (let roundIndex = 0; roundIndex < roundsPerPlayer; roundIndex++) {
    turns.push({ player: 1, roundIndex });
    if (players === 2) {
      turns.push({ player: 2, roundIndex });
    }
  }
  return turns;
}
