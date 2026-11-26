import {
  AMBIENT_IDS,
  MUSIC_IDS,
  SFX_IDS,
  type AmbientId,
  type MusicId,
  type SfxId,
  type SpeechClip,
} from './types';

export { AMBIENT_IDS, MUSIC_IDS, SFX_IDS };
export type {
  AmbientId,
  AudioApi,
  MusicId,
  SceneAudioRequest,
  SfxId,
  SpeechClip,
} from './types';

export const BASE_GAINS = {
  music: 0.35,
  ambient: 0.25,
  sfx: 0.7,
  speech: 1.0,
} as const;

export const CORE_SFX: readonly SfxId[] = ['tap', 'select', 'correct', 'retry', 'whoosh'] as const;

export function musicPath(id: MusicId): string {
  return `/audio/music/${id}.mp3`;
}

export function ambientPath(id: AmbientId): string {
  return `/audio/ambient/${id}.mp3`;
}

export function sfxPath(id: SfxId): string {
  return `/audio/sfx/${id}.mp3`;
}

export function speechPath(clip: SpeechClip): string {
  switch (clip.kind) {
    case 'num':
      return `/audio/speech/${clip.locale}/num-${clip.key}.mp3`;
    case 'letter':
      return `/audio/speech/${clip.locale}/letter-${clip.key.toLowerCase()}.mp3`;
    case 'word':
      return `/audio/speech/${clip.locale}/word-${clip.key.toLowerCase()}.mp3`;
    case 'hija':
      return `/audio/speech/ar/hija-${clip.key}.mp3`;
  }
}
