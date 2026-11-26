import { describe, expect, it } from 'vitest';
import { createBundledContent } from './defaults';
import { SAMPLE_MANIFEST } from './manifest.test';
import { resolveManifest } from './resolve';

describe('resolveManifest', () => {
  it('resolves CMS media URLs, new CMS objects, and falls back to bundled media when null', () => {
    const bundled = createBundledContent({
      objectImages: { apple: '/bundled/apple.svg' },
      audioFiles: new Set(['/audio/sfx/tap.mp3']),
    });

    const manifestWithNullApple = {
      ...SAMPLE_MANIFEST,
      objects: [
        { ...SAMPLE_MANIFEST.objects[0], image: null },
        SAMPLE_MANIFEST.objects[1],
      ],
    };

    const resolved = resolveManifest(manifestWithNullApple, bundled, 'cms');
    expect(resolved.source).toBe('cms');
    expect(resolved.version).toBe(2);

    // Fallback to bundled image for apple when CMS image is null
    expect(resolved.objects.get('apple')?.imageUrl).toBe('/bundled/apple.svg');
    // New CMS object not in bundle
    expect(resolved.objects.get('mango')?.imageUrl).toBe(
      'https://example.supabase.co/storage/v1/object/public/media/images/objects/mango-abcdef12.png',
    );
    // CMS audio overrides
    expect(resolved.sceneAudioUrl('music:home')).toBe(
      'https://example.supabase.co/storage/v1/object/public/media/audio/music/home-cccc3333.mp3',
    );
    // Fallback to bundled audio for sfx:tap not in manifest
    expect(resolved.sceneAudioUrl('sfx:tap')).toBe('/audio/sfx/tap.mp3');
    // Speech clips
    expect(resolved.speechUrl({ kind: 'num', locale: 'id', key: 1 })).toBe(
      'https://example.supabase.co/storage/v1/object/public/media/audio/speech/id/num-1-bbbb2222.wav',
    );
    expect(resolved.speechUrl({ kind: 'hija', key: 'alif' })).toBe(
      'https://example.supabase.co/storage/v1/object/public/media/audio/speech/ar/hija-alif-aaaa1111.wav',
    );
  });
});
