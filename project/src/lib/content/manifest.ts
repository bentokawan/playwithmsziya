import { isHijaiyyahId, type HijaiyyahId } from '@/content/hijaiyyah';
import type { ContentCredit } from './types';

export interface ManifestObject {
  readonly id: string;
  readonly name: { readonly id: string; readonly en: string };
  readonly image: string | null;
  readonly countable: boolean;
  readonly cardFace: boolean;
  readonly mazeGoal: boolean;
}

export interface ManifestWord {
  readonly locale: 'id' | 'en';
  readonly word: string;
  readonly objectId: string;
  readonly initial: boolean;
  readonly spell: boolean;
  readonly audio: string | null;
}

export interface ManifestHijaiyyah {
  readonly id: HijaiyyahId;
  readonly audio: string | null;
  readonly audioReviewed: boolean;
  readonly traceReviewed: boolean;
}

export interface ManifestSpeech {
  readonly kind: 'num' | 'letter' | 'phrase';
  readonly locale: 'id' | 'en';
  readonly key: string;
  readonly audio: string | null;
}

export interface ManifestSceneAudio {
  readonly id: string;
  readonly audio: string | null;
}

export interface ManifestV1 {
  readonly schemaVersion: 1;
  readonly version: number;
  readonly publishedAt: string;
  readonly mediaBase: string;
  readonly objects: readonly ManifestObject[];
  readonly words: readonly ManifestWord[];
  readonly hijaiyyah: readonly ManifestHijaiyyah[];
  readonly speech: readonly ManifestSpeech[];
  readonly sceneAudio: readonly ManifestSceneAudio[];
  readonly credits: readonly ContentCredit[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === 'string';
}

function isLocale(v: unknown): v is 'id' | 'en' {
  return v === 'id' || v === 'en';
}

export function parseManifest(raw: unknown): ManifestV1 | null {
  if (!isRecord(raw)) return null;
  if (raw.schemaVersion !== 1) return null;
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version) || raw.version < 1) {
    return null;
  }
  if (typeof raw.publishedAt !== 'string' || typeof raw.mediaBase !== 'string') return null;
  if (
    !Array.isArray(raw.objects) ||
    !Array.isArray(raw.words) ||
    !Array.isArray(raw.hijaiyyah) ||
    !Array.isArray(raw.speech) ||
    !Array.isArray(raw.sceneAudio) ||
    !Array.isArray(raw.credits)
  ) {
    return null;
  }

  const objects: ManifestObject[] = [];
  for (const item of raw.objects) {
    if (!isRecord(item) || !isRecord(item.name)) return null;
    if (
      typeof item.id !== 'string' ||
      typeof item.name.id !== 'string' ||
      typeof item.name.en !== 'string' ||
      !isNullableString(item.image) ||
      typeof item.countable !== 'boolean' ||
      typeof item.cardFace !== 'boolean' ||
      typeof item.mazeGoal !== 'boolean'
    ) {
      return null;
    }
    objects.push({
      id: item.id,
      name: { id: item.name.id, en: item.name.en },
      image: item.image,
      countable: item.countable,
      cardFace: item.cardFace,
      mazeGoal: item.mazeGoal,
    });
  }

  const words: ManifestWord[] = [];
  for (const item of raw.words) {
    if (!isRecord(item)) return null;
    if (
      !isLocale(item.locale) ||
      typeof item.word !== 'string' ||
      typeof item.objectId !== 'string' ||
      typeof item.initial !== 'boolean' ||
      typeof item.spell !== 'boolean' ||
      !isNullableString(item.audio)
    ) {
      return null;
    }
    words.push({
      locale: item.locale,
      word: item.word,
      objectId: item.objectId,
      initial: item.initial,
      spell: item.spell,
      audio: item.audio,
    });
  }

  const hijaiyyah: ManifestHijaiyyah[] = [];
  for (const item of raw.hijaiyyah) {
    if (!isRecord(item)) return null;
    if (
      typeof item.id !== 'string' ||
      !isHijaiyyahId(item.id) ||
      !isNullableString(item.audio) ||
      typeof item.audioReviewed !== 'boolean' ||
      typeof item.traceReviewed !== 'boolean'
    ) {
      return null;
    }
    hijaiyyah.push({
      id: item.id,
      audio: item.audio,
      audioReviewed: item.audioReviewed,
      traceReviewed: item.traceReviewed,
    });
  }

  const speech: ManifestSpeech[] = [];
  for (const item of raw.speech) {
    if (!isRecord(item)) return null;
    if (
      (item.kind !== 'num' && item.kind !== 'letter' && item.kind !== 'phrase') ||
      !isLocale(item.locale) ||
      typeof item.key !== 'string' ||
      !isNullableString(item.audio)
    ) {
      return null;
    }
    speech.push({
      kind: item.kind,
      locale: item.locale,
      key: item.key,
      audio: item.audio,
    });
  }

  const sceneAudio: ManifestSceneAudio[] = [];
  for (const item of raw.sceneAudio) {
    if (!isRecord(item)) return null;
    if (typeof item.id !== 'string' || !isNullableString(item.audio)) return null;
    sceneAudio.push({ id: item.id, audio: item.audio });
  }

  const credits: ContentCredit[] = [];
  for (const item of raw.credits) {
    if (!isRecord(item)) return null;
    if (
      typeof item.path !== 'string' ||
      typeof item.license !== 'string' ||
      !isNullableString(item.author) ||
      !isNullableString(item.sourceUrl)
    ) {
      return null;
    }
    credits.push({
      path: item.path,
      license: item.license,
      author: item.author,
      sourceUrl: item.sourceUrl,
    });
  }

  return {
    schemaVersion: 1,
    version: raw.version,
    publishedAt: raw.publishedAt,
    mediaBase: raw.mediaBase,
    objects,
    words,
    hijaiyyah,
    speech,
    sceneAudio,
    credits,
  };
}
