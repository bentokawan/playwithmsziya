import { describe, expect, it } from 'vitest';
import { OBJECT_IDS } from '@/content/objects';
import { BUNDLED_AUDIO_FILES } from '@/lib/audio/bundledFiles';
import { createBundledContent } from './defaults';
import { computeReadiness } from './readiness';

function allObjectImages(): Record<string, string> {
  return Object.fromEntries(OBJECT_IDS.map((id) => [id, `/img/${id}.svg`]));
}

describe('computeReadiness', () => {
  it('evaluates G01, G08, G09 based on object flags and images', () => {
    const noImg = createBundledContent({ objectImages: {} });
    expect(computeReadiness(noImg, 'ayo-berhitung', { production: true }).ready).toBe(false);
    expect(computeReadiness(noImg, 'kartu-kembar', { production: true }).ready).toBe(false);
    expect(computeReadiness(noImg, 'petualangan-labirin', { production: true }).ready).toBe(false);

    const withImg = createBundledContent({ objectImages: allObjectImages() });
    expect(computeReadiness(withImg, 'ayo-berhitung', { production: true }).ready).toBe(true);
    expect(computeReadiness(withImg, 'kartu-kembar', { production: true }).ready).toBe(true);
    expect(computeReadiness(withImg, 'petualangan-labirin', { production: true }).ready).toBe(true);
  });

  it('evaluates G02, G03, G04, G05 with production audio requirement vs dev fallback', () => {
    const withImg = createBundledContent({ objectImages: allObjectImages() });
    expect(computeReadiness(withImg, 'menulis-angka', { production: false }).ready).toBe(true);
    expect(computeReadiness(withImg, 'menulis-angka', { production: true }).ready).toBe(false);

    expect(computeReadiness(withImg, 'menulis-huruf', { production: false }).ready).toBe(true);
    expect(computeReadiness(withImg, 'menulis-huruf', { production: true }).ready).toBe(false);

    expect(computeReadiness(withImg, 'susun-kata', { production: false, locale: 'id' }).ready).toBe(true);
    expect(computeReadiness(withImg, 'susun-kata', { production: true, locale: 'id' }).ready).toBe(false);

    expect(computeReadiness(withImg, 'bunyi-awal', { production: false, locale: 'en' }).ready).toBe(true);
    expect(computeReadiness(withImg, 'bunyi-awal', { production: true, locale: 'en' }).ready).toBe(false);
  });

  it('blocks G06 in production without hijaiyyah audio; G07 uses the bundled glyphs', () => {
    const content = createBundledContent();
    expect(computeReadiness(content, 'dengar-temukan', { production: false }).ready).toBe(true);
    expect(computeReadiness(content, 'dengar-temukan', { production: true }).ready).toBe(false);

    expect(computeReadiness(content, 'tebalkan-hijaiyyah', { production: false }).ready).toBe(true);
    const g07 = computeReadiness(content, 'tebalkan-hijaiyyah', { production: true });
    expect(g07.missing).toEqual([]);
    expect(g07.ready).toBe(true);
  });

  it('unlocks G06 in production with the shipped hijaiyyah TTS clips', () => {
    const shipped = createBundledContent({ audioFiles: BUNDLED_AUDIO_FILES });
    const r = computeReadiness(shipped, 'dengar-temukan', { production: true });
    expect(r.missing).toEqual([]);
    expect(r.ready).toBe(true);
  });
});
