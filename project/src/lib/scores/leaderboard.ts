import type { GameId } from '@/games/ids';
import type { Profile } from '@/lib/profiles/profiles';
import type { DifficultyId } from '@/lib/session/session';
import type { SessionRecord } from './records';
import { starsFor } from './scoring';

export interface LeaderRow {
  readonly profile: Profile;
  readonly rank: number;
  readonly best: number;
  readonly bestStars: 1 | 2 | 3;
  readonly lastImprovement: number;
  readonly isNewRecord: boolean;
  readonly mostImproved: boolean;
  readonly plays: number;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function computeGainInWindow(
  sortedRecords: readonly SessionRecord[],
  cutoffMs: number,
  metric: (r: SessionRecord) => number,
): number {
  const before: SessionRecord[] = [];
  const inWindow: SessionRecord[] = [];
  for (const r of sortedRecords) {
    const ts = Date.parse(r.finishedAt);
    if (Number.isNaN(ts) || ts < cutoffMs) {
      before.push(r);
    } else {
      inWindow.push(r);
    }
  }
  if (inWindow.length === 0) return 0;

  const bestInWindow = Math.max(...inWindow.map(metric));
  if (before.length > 0) {
    const prevBest = Math.max(...before.map(metric));
    return Math.max(0, bestInWindow - prevBest);
  }
  if (inWindow.length >= 2) {
    const firstVal = metric(inWindow[0]);
    return Math.max(0, bestInWindow - firstVal);
  }
  return 0;
}

export function leaderboard(
  records: readonly SessionRecord[],
  profiles: readonly Profile[],
  filter: { readonly gameId: GameId; readonly difficulty: DifficultyId } | 'all',
  now: Date = new Date(),
): LeaderRow[] {
  const activeById = new Map<string, Profile>();
  for (const p of profiles) {
    if (!p.archived) activeById.set(p.id, p);
  }

  const filtered =
    filter === 'all'
      ? records
      : records.filter((r) => r.gameId === filter.gameId && r.difficulty === filter.difficulty);

  const byProfile = new Map<string, SessionRecord[]>();
  for (const id of activeById.keys()) {
    byProfile.set(id, []);
  }
  for (const rec of filtered) {
    const list = byProfile.get(rec.profileId);
    if (!list) continue;
    list.push(rec);
  }

  const cutoffMs = now.getTime() - SEVEN_DAYS_MS;

  interface DraftRow {
    readonly profile: Profile;
    readonly best: number;
    readonly bestStars: 1 | 2 | 3;
    readonly lastImprovement: number;
    readonly isNewRecord: boolean;
    readonly plays: number;
    readonly gain7d: number;
  }

  const drafts: DraftRow[] = [];

  for (const [profileId, list] of byProfile) {
    const profile = activeById.get(profileId)!;
    const sorted = list.slice().sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));

    if (sorted.length === 0) {
      drafts.push({
        profile,
        best: 0,
        bestStars: 1,
        lastImprovement: 0,
        isNewRecord: false,
        plays: 0,
        gain7d: 0,
      });
      continue;
    }

    if (filter === 'all') {
      let totalPoints = 0;
      const bucketBestStars = new Map<string, 1 | 2 | 3>();
      const bucketRecords = new Map<string, SessionRecord[]>();
      for (const r of sorted) {
        totalPoints += r.score;
        const key = `${r.gameId}:${r.difficulty}`;
        const stars = starsFor(r.score, r.maxScore);
        const prev = bucketBestStars.get(key) ?? 1;
        if (!bucketBestStars.has(key) || stars > prev) {
          bucketBestStars.set(key, stars);
        }
        const bList = bucketRecords.get(key) ?? [];
        bList.push(r);
        bucketRecords.set(key, bList);
      }

      let totalStars = 0;
      for (const s of bucketBestStars.values()) totalStars += s;

      let gain7d = 0;
      for (const bList of bucketRecords.values()) {
        gain7d += computeGainInWindow(bList, cutoffMs, (r) => r.score);
      }

      const latest = sorted[sorted.length - 1];
      const latestBucket = bucketRecords.get(`${latest.gameId}:${latest.difficulty}`) ?? [];
      const prevInBucket = latestBucket.slice(0, -1);
      const prevMaxScore =
        prevInBucket.length > 0 ? Math.max(...prevInBucket.map((r) => r.score)) : 0;
      const isNewRecord = prevInBucket.length === 0 || latest.score > prevMaxScore;
      const lastImprovement =
        prevInBucket.length > 0 && latest.score > prevMaxScore ? latest.score - prevMaxScore : 0;

      drafts.push({
        profile,
        best: totalPoints,
        bestStars: starsFor(totalStars, bucketBestStars.size * 3),
        lastImprovement,
        isNewRecord,
        plays: sorted.length,
        gain7d,
      });
    } else {
      const best = Math.max(...sorted.map((r) => r.score));
      const bestStars = Math.max(...sorted.map((r) => starsFor(r.score, r.maxScore))) as 1 | 2 | 3;
      const latest = sorted[sorted.length - 1];
      const prev = sorted.slice(0, -1);
      const prevBest = prev.length > 0 ? Math.max(...prev.map((r) => r.score)) : 0;
      const isNewRecord = prev.length === 0 || latest.score > prevBest;
      const lastImprovement = prev.length > 0 && latest.score > prevBest ? latest.score - prevBest : 0;
      const gain7d = computeGainInWindow(sorted, cutoffMs, (r) => r.score);

      drafts.push({
        profile,
        best,
        bestStars,
        lastImprovement,
        isNewRecord,
        plays: sorted.length,
        gain7d,
      });
    }
  }

  drafts.sort((a, b) => {
    if (b.best !== a.best) return b.best - a.best;
    if (b.plays !== a.plays) return b.plays - a.plays;
    return a.profile.createdAt.localeCompare(b.profile.createdAt);
  });

  let topGain = 0;
  let mostImprovedId: string | null = null;
  for (const d of drafts) {
    if (d.gain7d > topGain) {
      topGain = d.gain7d;
      mostImprovedId = d.profile.id;
    }
  }

  const rows: LeaderRow[] = [];
  for (let i = 0; i < drafts.length; i++) {
    const d = drafts[i];
    const rank = i > 0 && d.best === drafts[i - 1].best ? rows[i - 1].rank : i + 1;
    rows.push({
      profile: d.profile,
      rank,
      best: d.best,
      bestStars: d.bestStars,
      lastImprovement: d.lastImprovement,
      isNewRecord: d.isNewRecord,
      mostImproved: mostImprovedId === d.profile.id,
      plays: d.plays,
    });
  }

  return rows;
}
