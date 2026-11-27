import { describe, expect, it } from 'vitest';
import type { Profile } from '@/lib/profiles/profiles';
import { leaderboard } from './leaderboard';
import type { SessionRecord } from './records';

const PROFILES: Profile[] = [
  { id: 'p1', name: 'Ana', avatar: 'kelinci', color: 'biru', createdAt: '2026-11-20T00:00:00Z', archived: false },
  { id: 'p2', name: 'Budi', avatar: 'kucing', color: 'merah', createdAt: '2026-11-20T00:01:00Z', archived: false },
  { id: 'p3', name: 'Cici', avatar: 'panda', color: 'hijau', createdAt: '2026-11-20T00:02:00Z', archived: false },
  { id: 'p4', name: 'Dodi', avatar: 'rubah', color: 'oranye', createdAt: '2026-11-20T00:03:00Z', archived: true },
  { id: 'p5', name: 'Eka', avatar: 'ayam', color: 'ungu', createdAt: '2026-11-20T00:04:00Z', archived: false },
];

describe('leaderboard', () => {
  it('ranks tied scores equally (1, 1, 3, 4), excludes archived, and includes unplayed active profiles with 0', () => {
    const records: SessionRecord[] = [
      { id: '1', profileId: 'p1', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T10:00:00Z' },
      { id: '2', profileId: 'p2', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T11:00:00Z' },
      { id: '3', profileId: 'p3', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 6, maxScore: 9, firstTryCount: 1, rounds: 3, finishedAt: '2026-11-25T12:00:00Z' },
      { id: '4', profileId: 'p4', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T12:00:00Z' },
    ];

    const rows = leaderboard(
      records,
      PROFILES,
      { gameId: 'ayo-berhitung', difficulty: 'mudah' },
      new Date('2026-11-26T12:00:00Z'),
    );
    expect(rows.map((r) => [r.profile.id, r.rank, r.best])).toEqual([
      ['p1', 1, 9],
      ['p2', 1, 9],
      ['p3', 3, 6],
      ['p5', 4, 0],
    ]);
    expect(rows[3]).toMatchObject({
      best: 0,
      plays: 0,
      bestStars: 1,
      isNewRecord: false,
      lastImprovement: 0,
      mostImproved: false,
    });
  });

  it('lists all active profiles when only one has a record, tying 0-score profiles ordered by createdAt', () => {
    const subset: Profile[] = [
      { id: 'a', name: 'Ana', avatar: 'kelinci', color: 'biru', createdAt: '2026-11-20T00:02:00Z', archived: false },
      { id: 'c', name: 'Cici', avatar: 'panda', color: 'hijau', createdAt: '2026-11-20T00:03:00Z', archived: false },
      { id: 'b', name: 'Budi', avatar: 'kucing', color: 'merah', createdAt: '2026-11-20T00:01:00Z', archived: false },
      { id: 'd', name: 'Dodi', avatar: 'rubah', color: 'oranye', createdAt: '2026-11-20T00:00:00Z', archived: true },
    ];
    const records: SessionRecord[] = [
      { id: '1', profileId: 'a', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T10:00:00Z' },
      { id: '2', profileId: 'deleted-user', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T10:00:00Z' },
    ];

    const rows = leaderboard(records, subset, 'all', new Date('2026-11-26T12:00:00Z'));
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => [r.profile.id, r.rank, r.best])).toEqual([
      ['a', 1, 9],
      ['b', 2, 0],
      ['c', 2, 0],
    ]);
  });

  it('marks mostImproved on a single row with largest positive 7-day gain', () => {
    const records: SessionRecord[] = [
      { id: '1', profileId: 'p1', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 4, maxScore: 9, firstTryCount: 0, rounds: 3, finishedAt: '2026-11-22T10:00:00Z' },
      { id: '2', profileId: 'p1', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 8, maxScore: 9, firstTryCount: 2, rounds: 3, finishedAt: '2026-11-25T10:00:00Z' },
      { id: '3', profileId: 'p2', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 6, maxScore: 9, firstTryCount: 1, rounds: 3, finishedAt: '2026-11-22T10:00:00Z' },
      { id: '4', profileId: 'p2', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 7, maxScore: 9, firstTryCount: 2, rounds: 3, finishedAt: '2026-11-25T10:00:00Z' },
    ];

    const rows = leaderboard(
      records,
      PROFILES,
      { gameId: 'ayo-berhitung', difficulty: 'mudah' },
      new Date('2026-11-26T12:00:00Z'),
    );
    expect(rows.filter((r) => r.mostImproved).map((r) => r.profile.id)).toEqual(['p1']);
  });

  it('sums total earned points across all games and sessions in all mode and keeps unplayed active profiles at 0', () => {
    const records: SessionRecord[] = [
      { id: '1', profileId: 'p1', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T10:00:00Z' },
      { id: '2', profileId: 'p1', gameId: 'menulis-angka', difficulty: 'mudah', mode: 'solo', score: 6, maxScore: 9, firstTryCount: 1, rounds: 3, finishedAt: '2026-11-25T11:00:00Z' },
      { id: '3', profileId: 'p1', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 8, maxScore: 9, firstTryCount: 2, rounds: 3, finishedAt: '2026-11-25T11:30:00Z' },
      { id: '4', profileId: 'p2', gameId: 'ayo-berhitung', difficulty: 'mudah', mode: 'solo', score: 9, maxScore: 9, firstTryCount: 3, rounds: 3, finishedAt: '2026-11-25T12:00:00Z' },
    ];

    const rows = leaderboard(records, PROFILES, 'all', new Date('2026-11-26T12:00:00Z'));
    expect(rows.map((r) => [r.profile.id, r.best, r.rank])).toEqual([
      ['p1', 23, 1],
      ['p2', 9, 2],
      ['p3', 0, 3],
      ['p5', 0, 3],
    ]);
  });

  it('returns empty array when there are no active profiles', () => {
    const archivedOnly = PROFILES.filter((p) => p.archived);
    expect(leaderboard([], archivedOnly, 'all')).toEqual([]);
  });
});
