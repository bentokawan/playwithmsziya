import { describe, expect, it } from 'vitest';
import { parseManifest } from '@/lib/content/manifest';
import { buildManifest, validatePrePublish, type CmsSnapshotRows } from './buildManifest';

const SAMPLE_ROWS: CmsSnapshotRows = {
  media: [
    {
      id: 'm1',
      kind: 'image',
      storage_path: 'images/objects/apple-12345678.svg',
      mime: 'image/svg+xml',
      bytes: 800,
      sha256: '12345678abcdef',
      duration_ms: null,
      width: null,
      height: null,
      license: 'project',
      author: 'AI v0',
      source_url: null,
      created_by: null,
      created_at: '2026-11-25T00:00:00Z',
    },
  ],
  objects: [
    {
      id: 'apple',
      name_id: 'apel',
      name_en: 'apple',
      image_id: 'm1',
      countable: true,
      card_face: false,
      maze_goal: true,
      active: true,
      updated_at: '2026-11-25T00:00:00Z',
    },
    {
      id: 'inactive-obj',
      name_id: 'nonaktif',
      name_en: 'inactive',
      image_id: null,
      countable: false,
      card_face: false,
      maze_goal: false,
      active: false,
      updated_at: '2026-11-25T00:00:00Z',
    },
  ],
  words: [
    {
      id: 'w1',
      locale: 'id',
      word: 'APEL',
      object_id: 'apple',
      use_initial: true,
      use_spell: false,
      audio_id: null,
      active: true,
      updated_at: '2026-11-25T00:00:00Z',
    },
  ],
  hijaiyyah: [
    {
      id: 'alif',
      char: 'ا',
      name_id: 'Alif',
      family: 'alif',
      trace_group: 'mudah',
      audio_id: null,
      audio_reviewed: false,
      trace_reviewed: false,
      reviewer: null,
      reviewed_at: null,
      active: true,
      updated_at: '2026-11-25T00:00:00Z',
    },
  ],
  speechClips: [
    { kind: 'num', locale: 'id', key: '1', audio_id: null, updated_at: '2026-11-25T00:00:00Z' },
  ],
  sceneAudio: [{ id: 'music:home', layer: 'music', audio_id: null, updated_at: '2026-11-25T00:00:00Z' }],
};

describe('buildManifest', () => {
  it('builds a ManifestV1 that roundtrips cleanly with parseManifest and omits inactive items', () => {
    expect(validatePrePublish(SAMPLE_ROWS)).toEqual([]);
    const manifest = buildManifest(
      SAMPLE_ROWS,
      3,
      'https://cdn.example.com/media',
      '2026-11-25T12:00:00.000Z',
    );
    expect(manifest.objects).toHaveLength(1);
    expect(manifest.credits).toHaveLength(1);
    expect(parseManifest(manifest)).toEqual(manifest);
  });

  it('catches active words pointing to inactive objects', () => {
    const bad: CmsSnapshotRows = {
      ...SAMPLE_ROWS,
      words: [
        {
          ...SAMPLE_ROWS.words[0],
          object_id: 'inactive-obj',
        },
      ],
    };
    expect(validatePrePublish(bad).length).toBeGreaterThan(0);
  });
});
