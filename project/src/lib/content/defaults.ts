import { OBJECT_IMAGES } from '@/assets/illustrations/objects';
import { BUNDLED_HIJAIYYAH, type HijaiyyahId } from '@/content/hijaiyyah';
import { BUNDLED_OBJECTS } from '@/content/objects';
import { BUNDLED_WORDS } from '@/content/words';
import {
  ambientPath,
  musicPath,
  sfxPath,
  speechPath,
  type AmbientId,
  type MusicId,
  type SfxId,
  type SpeechClip,
} from '@/lib/audio/manifest';
import type {
  ResolvedContent,
  ResolvedHijaiyyah,
  ResolvedObject,
  ResolvedWord,
  SceneAudioKey,
} from './types';

function resolveBundledScenePath(id: SceneAudioKey): string | null {
  const [layer, key] = id.split(':');
  if (layer === 'music') return musicPath(key as MusicId);
  if (layer === 'ambient') return ambientPath(key as AmbientId);
  if (layer === 'sfx') return sfxPath(key as SfxId);
  return null;
}

export interface BundledMediaOptions {
  readonly objectImages?: Readonly<Record<string, string>>;
  readonly audioFiles?: ReadonlySet<string>;
}

export function createBundledContent(opts: BundledMediaOptions = {}): ResolvedContent {
  const objectImages = opts.objectImages ?? OBJECT_IMAGES;
  const audioFiles = opts.audioFiles ?? new Set<string>();

  const hasAudio = (path: string): string | null => (audioFiles.has(path) ? path : null);

  const objects = new Map<string, ResolvedObject>();
  for (const obj of BUNDLED_OBJECTS) {
    objects.set(obj.id, {
      id: obj.id,
      name: obj.name,
      imageUrl: objectImages[obj.id] ?? null,
      countable: obj.countable,
      cardFace: obj.cardFace,
      mazeGoal: obj.mazeGoal,
    });
  }

  const words: ResolvedWord[] = BUNDLED_WORDS.map((w) => {
    const clipPath = speechPath({ kind: 'word', locale: w.locale, key: w.word.toLowerCase() });
    return {
      locale: w.locale,
      word: w.word,
      objectId: w.objectId,
      initial: w.initial,
      spell: w.spell,
      audioUrl: hasAudio(clipPath),
    };
  });

  const hijaiyyah = new Map<HijaiyyahId, ResolvedHijaiyyah>();
  for (const h of BUNDLED_HIJAIYYAH) {
    const clipPath = speechPath({ kind: 'hija', key: h.id });
    const audioUrl = hasAudio(clipPath);
    hijaiyyah.set(h.id, {
      id: h.id,
      char: h.char,
      family: h.family,
      traceGroup: h.traceGroup,
      audioUrl,
      // Bundled clips are build-time TTS checked before commit (scripts/tts), so they count as reviewed.
      audioReviewed: audioUrl !== null,
      // Bundled glyphs (content/glyphs/hijaiyyah.ts) are checked before commit; user decision 2026-11-27.
      traceReviewed: true,
    });
  }

  return {
    version: null,
    source: 'bundled',
    objects,
    words,
    hijaiyyah,
    speechUrl(clip: SpeechClip): string | null {
      return hasAudio(speechPath(clip));
    },
    sceneAudioUrl(id: SceneAudioKey): string | null {
      const p = resolveBundledScenePath(id);
      return p ? hasAudio(p) : null;
    },
    credits: [],
  };
}
