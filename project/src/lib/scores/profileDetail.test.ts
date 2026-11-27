import { describe, expect, it } from 'vitest';
import type { Profile } from '@/lib/profiles/profiles';
import type { SessionRecord } from './records';
import { buildProfileScoreDetail, formatSessionDate } from './profileDetail';

const GAVIN: Profile = {
  id: 'gavin',
  name: 'Gavin',
  avatar: 'kelinci',
  color: 'merah',
  createdAt: '2026-11-26T00:00:00Z',
  archived: false,
};

const RECORDS: SessionRecord[] = [
  {
    id: 'r1',
    profileId: 'gavin',
    gameId: 'ayo-berhitung',
    difficulty: 'mudah',
    mode: 'solo',
    score: 6,
    maxScore: 9,
    firstTryCount: 1,
    rounds: 3,
    finishedAt: '2026-11-26T09:00:00Z',
  },
  {
    id: 'r2',
    profileId: 'gavin',
    gameId: 'ayo-berhitung',
    difficulty: 'mudah',
    mode: 'solo',
    score: 9,
    maxScore: 9,
    firstTryCount: 3,
    rounds: 3,
    finishedAt: '2026-11-27T08:30:00Z',
  },
  {
    id: 'r3',
    profileId: 'gavin',
    gameId: 'menulis-angka',
    difficulty: 'sedang',
    mode: 'layar',
    score: 9,
    maxScore: 12,
    firstTryCount: 2,
    rounds: 4,
    finishedAt: '2026-11-27T09:15:00Z',
    won: true,
  },
  {
    id: 'r4',
    profileId: 'zia',
    gameId: 'ayo-berhitung',
    difficulty: 'mudah',
    mode: 'solo',
    score: 10,
    maxScore: 12,
    firstTryCount: 3,
    rounds: 4,
    finishedAt: '2026-11-27T10:00:00Z',
  },
];

describe('buildProfileScoreDetail', () => {
  it('aggregates total points, modes, games, mode+difficulty buckets, and newest-first sessions for a profile', () => {
    const detail = buildProfileScoreDetail(GAVIN, RECORDS);

    expect(detail.profile.id).toBe('gavin');
    expect(detail.totalPoints).toBe(24);
    expect(detail.totalPlays).toBe(3);
    expect(detail.gamesPlayed).toBe(2);
    expect(detail.totalRounds).toBe(10);
    expect(detail.totalFirstTry).toBe(6);
    expect(detail.totalWins).toBe(1);

    // Points by mode sorted descending
    expect(detail.byMode).toEqual([
      { mode: 'solo', points: 15, plays: 2, wins: 0 },
      { mode: 'layar', points: 9, plays: 1, wins: 1 },
    ]);

    // Points by game sorted descending, exact sum equals totalPoints
    expect(detail.byGame.map((g) => [g.gameId, g.totalPoints, g.plays, g.bestScore])).toEqual([
      ['ayo-berhitung', 15, 2, 9],
      ['menulis-angka', 9, 1, 9],
    ]);
    expect(detail.byGame.reduce((sum, g) => sum + g.totalPoints, 0)).toBe(detail.totalPoints);

    // Buckets inside ayo-berhitung
    expect(detail.byGame[0].buckets).toEqual([
      {
        difficulty: 'mudah',
        mode: 'solo',
        points: 15,
        bestScore: 9,
        plays: 2,
        wins: 0,
      },
    ]);

    // Sessions sorted newest first with star calculation
    expect(detail.byGame[0].sessions.map((s) => [s.record.id, s.stars])).toEqual([
      ['r2', 3],
      ['r1', 2],
    ]);
  });

  it('hoists focusGameId to the top when requested', () => {
    const detail = buildProfileScoreDetail(GAVIN, RECORDS, 'menulis-angka');
    expect(detail.byGame[0].gameId).toBe('menulis-angka');
    expect(detail.byGame[1].gameId).toBe('ayo-berhitung');
  });

  it('returns clean zero summary when profile has no records', () => {
    const detail = buildProfileScoreDetail(GAVIN, []);
    expect(detail.totalPoints).toBe(0);
    expect(detail.totalPlays).toBe(0);
    expect(detail.gamesPlayed).toBe(0);
    expect(detail.byMode).toEqual([]);
    expect(detail.byGame).toEqual([]);
  });

  it('formats valid ISO timestamps and falls back safely for invalid strings', () => {
    expect(formatSessionDate('2026-11-27T08:30:00Z', 'id')).toBeTruthy();
    expect(formatSessionDate('not-a-date', 'en')).toBe('');
  });
});
