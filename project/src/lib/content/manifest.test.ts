import { describe, expect, it } from 'vitest';
import { parseManifest, type ManifestV1 } from './manifest';

export const SAMPLE_MANIFEST: ManifestV1 = {
  schemaVersion: 1,
  version: 2,
  publishedAt: '2026-11-25T10:00:00.000Z',
  mediaBase: 'https://example.supabase.co/storage/v1/object/public/media/',
  objects: [
    {
      id: 'apple',
      name: { id: 'apel', en: 'apple' },
      image: 'images/objects/apple-12345678.svg',
      countable: true,
      cardFace: false,
      mazeGoal: true,
    },
    {
      id: 'mango',
      name: { id: 'mangga', en: 'mango' },
      image: 'images/objects/mango-abcdef12.png',
      countable: true,
      cardFace: false,
      mazeGoal: false,
    },
  ],
  words: [
    {
      locale: 'id',
      word: 'MANGGA',
      objectId: 'mango',
      initial: true,
      spell: false,
      audio: 'audio/speech/id/word-mangga-11112222.wav',
    },
  ],
  hijaiyyah: [
    {
      id: 'alif',
      audio: 'audio/speech/ar/hija-alif-aaaa1111.wav',
      audioReviewed: true,
      traceReviewed: true,
    },
  ],
  speech: [
    {
      kind: 'num',
      locale: 'id',
      key: '1',
      audio: 'audio/speech/id/num-1-bbbb2222.wav',
    },
  ],
  sceneAudio: [{ id: 'music:home', audio: 'audio/music/home-cccc3333.mp3' }],
  credits: [
    {
      path: 'audio/music/home-cccc3333.mp3',
      license: 'cc0',
      author: 'Studio',
      sourceUrl: 'https://freesound.org/1',
    },
  ],
};

describe('parseManifest', () => {
  it('parses a valid v1 manifest', () => {
    expect(parseManifest(SAMPLE_MANIFEST)).toEqual(SAMPLE_MANIFEST);
  });

  it('rejects wrong schemaVersion or missing required fields', () => {
    expect(parseManifest({ ...SAMPLE_MANIFEST, schemaVersion: 2 })).toBeNull();
    expect(parseManifest({ ...SAMPLE_MANIFEST, version: 0 })).toBeNull();
    expect(parseManifest({ ...SAMPLE_MANIFEST, objects: 'bad' })).toBeNull();
    expect(
      parseManifest({
        ...SAMPLE_MANIFEST,
        hijaiyyah: [{ id: 'not-a-letter', audio: null, audioReviewed: false, traceReviewed: false }],
      }),
    ).toBeNull();
  });
});
