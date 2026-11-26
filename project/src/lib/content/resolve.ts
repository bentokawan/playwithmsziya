import { BUNDLED_HIJAIYYAH, type HijaiyyahId } from '@/content/hijaiyyah';
import type { SpeechClip } from '@/lib/audio/types';
import type { ManifestV1 } from './manifest';
import type {
  ResolvedContent,
  ResolvedHijaiyyah,
  ResolvedObject,
  ResolvedWord,
  SceneAudioKey,
} from './types';

function joinMediaUrl(mediaBase: string, relPath: string | null): string | null {
  if (!relPath) return null;
  const base = mediaBase.endsWith('/') ? mediaBase : `${mediaBase}/`;
  return `${base}${relPath.replace(/^\/+/, '')}`;
}

export function resolveManifest(
  manifest: ManifestV1,
  bundled: ResolvedContent,
  source: 'cms' | 'cache' = 'cms',
): ResolvedContent {
  const objects = new Map<string, ResolvedObject>();
  for (const obj of manifest.objects) {
    const bundledObj = bundled.objects.get(obj.id);
    const imageUrl = joinMediaUrl(manifest.mediaBase, obj.image) ?? bundledObj?.imageUrl ?? null;
    objects.set(obj.id, {
      id: obj.id,
      name: obj.name,
      imageUrl,
      countable: obj.countable,
      cardFace: obj.cardFace,
      mazeGoal: obj.mazeGoal,
    });
  }

  const wordAudioMap = new Map<string, string>();
  const words: ResolvedWord[] = manifest.words.map((w) => {
    const clip: SpeechClip = { kind: 'word', locale: w.locale, key: w.word.toLowerCase() };
    const audioUrl = joinMediaUrl(manifest.mediaBase, w.audio) ?? bundled.speechUrl(clip);
    if (audioUrl) {
      wordAudioMap.set(`${w.locale}:${w.word.toLowerCase()}`, audioUrl);
    }
    return {
      locale: w.locale,
      word: w.word,
      objectId: w.objectId,
      initial: w.initial,
      spell: w.spell,
      audioUrl,
    };
  });

  const bundledHijaMap = new Map(BUNDLED_HIJAIYYAH.map((h) => [h.id, h]));
  const hijaiyyah = new Map<HijaiyyahId, ResolvedHijaiyyah>();
  for (const h of manifest.hijaiyyah) {
    const meta = bundledHijaMap.get(h.id);
    if (!meta) continue;
    const audioUrl =
      joinMediaUrl(manifest.mediaBase, h.audio) ??
      bundled.speechUrl({ kind: 'hija', key: h.id });
    hijaiyyah.set(h.id, {
      id: h.id,
      char: meta.char,
      family: meta.family,
      traceGroup: meta.traceGroup,
      audioUrl,
      audioReviewed: h.audioReviewed,
      traceReviewed: h.traceReviewed,
    });
  }

  const speechMap = new Map<string, string | null>();
  for (const s of manifest.speech) {
    speechMap.set(`${s.kind}:${s.locale}:${s.key.toLowerCase()}`, joinMediaUrl(manifest.mediaBase, s.audio));
  }

  const sceneMap = new Map<string, string | null>();
  for (const s of manifest.sceneAudio) {
    sceneMap.set(s.id, joinMediaUrl(manifest.mediaBase, s.audio));
  }

  return {
    version: manifest.version,
    source,
    objects,
    words,
    hijaiyyah,
    speechUrl(clip: SpeechClip): string | null {
      if (clip.kind === 'hija') {
        return hijaiyyah.get(clip.key)?.audioUrl ?? bundled.speechUrl(clip);
      }
      if (clip.kind === 'word') {
        return wordAudioMap.get(`${clip.locale}:${clip.key.toLowerCase()}`) ?? bundled.speechUrl(clip);
      }
      const key = `${clip.kind}:${clip.locale}:${String(clip.key).toLowerCase()}`;
      return speechMap.get(key) ?? bundled.speechUrl(clip);
    },
    sceneAudioUrl(id: SceneAudioKey): string | null {
      return sceneMap.get(id) ?? bundled.sceneAudioUrl(id);
    },
    credits: manifest.credits,
  };
}
