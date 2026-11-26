import { describe, expect, it } from 'vitest';
import { createBundledContent } from './defaults';

describe('createBundledContent', () => {
  it('loads all bundled objects, words, and hijaiyyah with expected counts and flags', () => {
    const content = createBundledContent();
    expect(content.source).toBe('bundled');
    expect(content.version).toBeNull();
    expect(content.objects.size).toBe(71);
    expect(content.hijaiyyah.size).toBe(28);
    expect(content.words).toHaveLength(75);

    const countable = [...content.objects.values()].filter((o) => o.countable);
    const cardFaces = [...content.objects.values()].filter((o) => o.cardFace);
    const mazeGoals = [...content.objects.values()].filter((o) => o.mazeGoal);
    expect(countable).toHaveLength(9);
    expect(cardFaces).toHaveLength(12);
    expect(mazeGoals).toHaveLength(5);

    for (const h of content.hijaiyyah.values()) {
      expect(h.audioReviewed).toBe(false);
      expect(h.traceReviewed).toBe(false);
    }
  });

  it('returns bundled audio URL only when registered in audioFiles set', () => {
    const empty = createBundledContent();
    expect(empty.sceneAudioUrl('music:home')).toBeNull();
    expect(empty.speechUrl({ kind: 'num', locale: 'id', key: 1 })).toBeNull();

    const withFiles = createBundledContent({
      audioFiles: new Set(['/audio/music/home.mp3', '/audio/speech/id/num-1.mp3']),
    });
    expect(withFiles.sceneAudioUrl('music:home')).toBe('/audio/music/home.mp3');
    expect(withFiles.speechUrl({ kind: 'num', locale: 'id', key: 1 })).toBe(
      '/audio/speech/id/num-1.mp3',
    );
  });
});
