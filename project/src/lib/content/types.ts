import type { HijaiyyahId } from '@/content/hijaiyyah';
import type { SpeechClip } from '@/lib/audio/types';
import type { DifficultyId, Locale } from '@/lib/session/session';

export interface ContentCredit {
  readonly path: string;
  readonly license: string;
  readonly author: string | null;
  readonly sourceUrl: string | null;
}

export interface ResolvedObject {
  readonly id: string;
  readonly name: { readonly id: string; readonly en: string };
  readonly imageUrl: string | null;
  readonly countable: boolean;
  readonly cardFace: boolean;
  readonly mazeGoal: boolean;
}

export interface ResolvedWord {
  readonly locale: Locale;
  readonly word: string;
  readonly objectId: string;
  readonly initial: boolean;
  readonly spell: boolean;
  readonly audioUrl: string | null;
}

export interface ResolvedHijaiyyah {
  readonly id: HijaiyyahId;
  readonly char: string;
  readonly family: string;
  readonly traceGroup: DifficultyId;
  readonly audioUrl: string | null;
  readonly audioReviewed: boolean;
  readonly traceReviewed: boolean;
}

export type SceneAudioKey = `${'music' | 'ambient' | 'sfx'}:${string}`;

export interface ResolvedContent {
  readonly version: number | null;
  readonly source: 'cms' | 'cache' | 'bundled';
  readonly objects: Map<string, ResolvedObject>;
  readonly words: readonly ResolvedWord[];
  readonly hijaiyyah: Map<HijaiyyahId, ResolvedHijaiyyah>;
  speechUrl(clip: SpeechClip): string | null;
  sceneAudioUrl(id: SceneAudioKey): string | null;
  readonly credits: readonly ContentCredit[];
}
