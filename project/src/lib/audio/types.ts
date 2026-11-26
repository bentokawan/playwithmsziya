import type { HijaiyyahId } from '@/content/hijaiyyah';

export const MUSIC_IDS = [
  'home',
  'world-angka',
  'world-huruf',
  'world-hijaiyyah',
  'world-memori',
  'result-jingle',
] as const;
export type MusicId = (typeof MUSIC_IDS)[number];

export const AMBIENT_IDS = ['meadow', 'breeze', 'night', 'waves'] as const;
export type AmbientId = (typeof AMBIENT_IDS)[number];

export const SFX_IDS = [
  'tap',
  'select',
  'whoosh',
  'correct',
  'retry',
  'kids-yay',
  'kids-giggle',
  'kids-cheer',
  'count-pop',
  'flip',
  'match',
  'step',
  'bump',
  'stroke-done',
  'turn',
  'door',
  'sticker',
] as const;
export type SfxId = (typeof SFX_IDS)[number];

export type SpeechClip =
  | { readonly kind: 'num'; readonly locale: 'id' | 'en'; readonly key: number }
  | { readonly kind: 'letter'; readonly locale: 'id' | 'en'; readonly key: string }
  | { readonly kind: 'word'; readonly locale: 'id' | 'en'; readonly key: string }
  | { readonly kind: 'hija'; readonly key: HijaiyyahId };

export interface SceneAudioRequest {
  readonly music: MusicId | null;
  readonly ambient: AmbientId | null;
  readonly loop?: boolean;
}

export interface AudioApi {
  unlock(): Promise<void>;
  setScene(scene: SceneAudioRequest): void;
  sfx(id: SfxId): void;
  speak(clip: SpeechClip): Promise<void>;
  stopSpeech(): void;
  readonly unlocked: boolean;
}
