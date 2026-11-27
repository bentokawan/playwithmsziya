import type { GameId } from '@/games/ids';
import type { Profile } from '@/lib/profiles/profiles';
import type { DifficultyId, Locale } from '@/lib/session/session';
import type { SessionRecord } from './records';
import { starsFor, type PlayMode } from './scoring';

export interface ModeSummary {
  readonly mode: PlayMode;
  readonly points: number;
  readonly plays: number;
  readonly wins: number;
}

export interface BucketSummary {
  readonly difficulty: DifficultyId;
  readonly mode: PlayMode;
  readonly points: number;
  readonly bestScore: number;
  readonly plays: number;
  readonly wins: number;
}

export interface SessionDetailItem {
  readonly record: SessionRecord;
  readonly stars: 1 | 2 | 3;
}

export interface GamePointBreakdown {
  readonly gameId: GameId;
  readonly totalPoints: number;
  readonly bestScore: number;
  readonly plays: number;
  readonly totalRounds: number;
  readonly totalFirstTry: number;
  readonly wins: number;
  readonly buckets: readonly BucketSummary[];
  readonly sessions: readonly SessionDetailItem[];
}

export interface ProfileScoreDetail {
  readonly profile: Profile;
  readonly totalPoints: number;
  readonly totalPlays: number;
  readonly gamesPlayed: number;
  readonly totalRounds: number;
  readonly totalFirstTry: number;
  readonly totalWins: number;
  readonly byMode: readonly ModeSummary[];
  readonly byGame: readonly GamePointBreakdown[];
}

const DIFFICULTY_ORDER: Record<DifficultyId, number> = {
  mudah: 0,
  sedang: 1,
  tantang: 2,
};

const MODE_ORDER: Record<PlayMode, number> = {
  solo: 0,
  giliran: 1,
  layar: 2,
  online: 3,
};

export function buildProfileScoreDetail(
  profile: Profile,
  records: readonly SessionRecord[],
  focusGameId?: GameId,
): ProfileScoreDetail {
  const mine = records.filter((r) => r.profileId === profile.id);

  let totalPoints = 0;
  let totalRounds = 0;
  let totalFirstTry = 0;
  let totalWins = 0;

  const modeMap = new Map<PlayMode, { points: number; plays: number; wins: number }>();
  const gameMap = new Map<GameId, SessionRecord[]>();

  for (const rec of mine) {
    totalPoints += rec.score;
    totalRounds += rec.rounds;
    totalFirstTry += rec.firstTryCount;
    const isWin = rec.won === true ? 1 : 0;
    totalWins += isWin;

    const m = modeMap.get(rec.mode) ?? { points: 0, plays: 0, wins: 0 };
    m.points += rec.score;
    m.plays += 1;
    m.wins += isWin;
    modeMap.set(rec.mode, m);

    const gList = gameMap.get(rec.gameId) ?? [];
    gList.push(rec);
    gameMap.set(rec.gameId, gList);
  }

  const byMode: ModeSummary[] = [...modeMap.entries()]
    .map(([mode, stats]) => ({
      mode,
      points: stats.points,
      plays: stats.plays,
      wins: stats.wins,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.plays !== a.plays) return b.plays - a.plays;
      return MODE_ORDER[a.mode] - MODE_ORDER[b.mode];
    });

  const byGame: GamePointBreakdown[] = [...gameMap.entries()]
    .map(([gameId, list]) => {
      const sortedDesc = list.slice().sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));

      let gamePoints = 0;
      let gameBest = 0;
      let gameRounds = 0;
      let gameFirstTry = 0;
      let gameWins = 0;

      const bucketMap = new Map<
        string,
        {
          difficulty: DifficultyId;
          mode: PlayMode;
          points: number;
          bestScore: number;
          plays: number;
          wins: number;
        }
      >();

      for (const r of sortedDesc) {
        gamePoints += r.score;
        if (r.score > gameBest) gameBest = r.score;
        gameRounds += r.rounds;
        gameFirstTry += r.firstTryCount;
        const winInc = r.won === true ? 1 : 0;
        gameWins += winInc;

        const key = `${r.mode}:${r.difficulty}`;
        const existing = bucketMap.get(key) ?? {
          difficulty: r.difficulty,
          mode: r.mode,
          points: 0,
          bestScore: 0,
          plays: 0,
          wins: 0,
        };
        existing.points += r.score;
        if (r.score > existing.bestScore) existing.bestScore = r.score;
        existing.plays += 1;
        existing.wins += winInc;
        bucketMap.set(key, existing);
      }

      const buckets: BucketSummary[] = [...bucketMap.values()].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (MODE_ORDER[a.mode] !== MODE_ORDER[b.mode]) {
          return MODE_ORDER[a.mode] - MODE_ORDER[b.mode];
        }
        return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      });

      const sessions: SessionDetailItem[] = sortedDesc.map((record) => ({
        record,
        stars: starsFor(record.score, record.maxScore),
      }));

      return {
        gameId,
        totalPoints: gamePoints,
        bestScore: gameBest,
        plays: sortedDesc.length,
        totalRounds: gameRounds,
        totalFirstTry: gameFirstTry,
        wins: gameWins,
        buckets,
        sessions,
      };
    })
    .sort((a, b) => {
      if (focusGameId) {
        if (a.gameId === focusGameId && b.gameId !== focusGameId) return -1;
        if (b.gameId === focusGameId && a.gameId !== focusGameId) return 1;
      }
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.plays !== a.plays) return b.plays - a.plays;
      return a.gameId.localeCompare(b.gameId);
    });

  return {
    profile,
    totalPoints,
    totalPlays: mine.length,
    gamesPlayed: byGame.length,
    totalRounds,
    totalFirstTry,
    totalWins,
    byMode,
    byGame,
  };
}

export function formatSessionDate(iso: string, locale: Locale): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts));
  } catch {
    return iso.slice(0, 10);
  }
}
