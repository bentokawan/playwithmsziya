import { isHijaiyyahId } from '@/content/hijaiyyah';
import type { ManifestV1 } from '@/lib/content/manifest';
import type {
  HijaiyyahRow,
  MediaRow,
  ObjectRow,
  SceneAudioRow,
  SpeechClipRow,
  WordRow,
} from '@/lib/supabase/types';

export interface CmsSnapshotRows {
  readonly media: readonly MediaRow[];
  readonly objects: readonly ObjectRow[];
  readonly words: readonly WordRow[];
  readonly hijaiyyah: readonly HijaiyyahRow[];
  readonly speechClips: readonly SpeechClipRow[];
  readonly sceneAudio: readonly SceneAudioRow[];
}

export function validatePrePublish(rows: CmsSnapshotRows): string[] {
  const errors: string[] = [];
  const mediaIds = new Set(rows.media.map((m) => m.id));
  const activeObjIds = new Set(rows.objects.filter((o) => o.active).map((o) => o.id));

  for (const o of rows.objects) {
    if (o.active && o.image_id && !mediaIds.has(o.image_id)) {
      errors.push(`Objek ${o.id} menunjuk media yang tidak ditemukan.`);
    }
  }

  const seenWords = new Set<string>();
  for (const w of rows.words) {
    if (!w.active) continue;
    const key = `${w.locale}:${w.word}`;
    if (seenWords.has(key)) errors.push(`Duplikat kata aktif: ${key}.`);
    seenWords.add(key);
    if (!activeObjIds.has(w.object_id)) {
      errors.push(`Kata aktif ${w.word} (${w.locale}) menunjuk objek nonaktif (${w.object_id}).`);
    }
    if (w.audio_id && !mediaIds.has(w.audio_id)) {
      errors.push(`Kata ${w.word} menunjuk audio yang tidak ditemukan.`);
    }
  }

  for (const h of rows.hijaiyyah) {
    if (h.audio_reviewed && !h.reviewer) {
      errors.push(`Hijaiyyah ${h.id} ditandai direview tanpa nama peninjau.`);
    }
    if (h.audio_id && !mediaIds.has(h.audio_id)) {
      errors.push(`Hijaiyyah ${h.id} menunjuk audio yang tidak ditemukan.`);
    }
  }

  return errors;
}

export function buildManifest(
  rows: CmsSnapshotRows,
  version: number,
  mediaBase: string,
  publishedAt = new Date().toISOString(),
): ManifestV1 {
  const mediaById = new Map(rows.media.map((m) => [m.id, m]));
  const usedMedia = new Map<string, MediaRow>();

  const pathOf = (id: string | null): string | null => {
    if (!id) return null;
    const m = mediaById.get(id);
    if (!m) return null;
    usedMedia.set(m.id, m);
    return m.storage_path;
  };

  const cleanBase = mediaBase.endsWith('/') ? mediaBase : `${mediaBase}/`;

  const objects = rows.objects
    .filter((o) => o.active)
    .map((o) => ({
      id: o.id,
      name: { id: o.name_id, en: o.name_en },
      image: pathOf(o.image_id),
      countable: o.countable,
      cardFace: o.card_face,
      mazeGoal: o.maze_goal,
    }));

  const words = rows.words
    .filter((w) => w.active)
    .map((w) => ({
      locale: w.locale,
      word: w.word,
      objectId: w.object_id,
      initial: w.use_initial,
      spell: w.use_spell,
      audio: pathOf(w.audio_id),
    }));

  const hijaiyyah = rows.hijaiyyah
    .filter((h) => h.active && isHijaiyyahId(h.id))
    .map((h) => ({
      id: h.id as ManifestV1['hijaiyyah'][number]['id'],
      audio: pathOf(h.audio_id),
      audioReviewed: h.audio_reviewed,
      traceReviewed: h.trace_reviewed,
    }));

  const speech = rows.speechClips.map((s) => ({
    kind: s.kind,
    locale: s.locale,
    key: s.key,
    audio: pathOf(s.audio_id),
  }));

  const sceneAudio = rows.sceneAudio.map((s) => ({
    id: s.id,
    audio: pathOf(s.audio_id),
  }));

  const credits = [...usedMedia.values()].map((m) => ({
    path: m.storage_path,
    license: m.license,
    author: m.author,
    sourceUrl: m.source_url,
  }));

  return {
    schemaVersion: 1,
    version,
    publishedAt,
    mediaBase: cleanBase,
    objects,
    words,
    hijaiyyah,
    speech,
    sceneAudio,
    credits,
  };
}
