export type MediaKind = 'image' | 'audio';
export type MediaLicense = 'project' | 'pixabay' | 'cc0' | 'cc-by-4.0' | 'recorded-consent';
export type TraceGroup = 'mudah' | 'sedang' | 'tantang';
export type AudioLayer = 'music' | 'ambient' | 'sfx';

export interface AdminRow {
  readonly user_id: string;
  readonly username: string;
  readonly created_at: string;
}

export interface MediaRow {
  readonly id: string;
  readonly kind: MediaKind;
  readonly storage_path: string;
  readonly mime: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly duration_ms: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly license: MediaLicense;
  readonly author: string | null;
  readonly source_url: string | null;
  readonly created_by: string | null;
  readonly created_at: string;
}

export interface MediaInsert {
  readonly kind: MediaKind;
  readonly storage_path: string;
  readonly mime: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly duration_ms?: number | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly license: MediaLicense;
  readonly author?: string | null;
  readonly source_url?: string | null;
}

export interface ObjectRow {
  readonly id: string;
  readonly name_id: string;
  readonly name_en: string;
  readonly image_id: string | null;
  readonly countable: boolean;
  readonly card_face: boolean;
  readonly maze_goal: boolean;
  readonly active: boolean;
  readonly updated_at: string;
}

export interface ObjectUpsert {
  readonly id: string;
  readonly name_id: string;
  readonly name_en: string;
  readonly image_id?: string | null;
  readonly countable: boolean;
  readonly card_face: boolean;
  readonly maze_goal: boolean;
  readonly active: boolean;
}

export interface WordRow {
  readonly id: string;
  readonly locale: 'id' | 'en';
  readonly word: string;
  readonly object_id: string;
  readonly use_initial: boolean;
  readonly use_spell: boolean;
  readonly audio_id: string | null;
  readonly active: boolean;
  readonly updated_at: string;
}

export interface WordUpsert {
  readonly id?: string;
  readonly locale: 'id' | 'en';
  readonly word: string;
  readonly object_id: string;
  readonly use_initial: boolean;
  readonly use_spell: boolean;
  readonly audio_id?: string | null;
  readonly active: boolean;
}

export interface HijaiyyahRow {
  readonly id: string;
  readonly char: string;
  readonly name_id: string;
  readonly family: string;
  readonly trace_group: TraceGroup;
  readonly audio_id: string | null;
  readonly audio_reviewed: boolean;
  readonly trace_reviewed: boolean;
  readonly reviewer: string | null;
  readonly reviewed_at: string | null;
  readonly active: boolean;
  readonly updated_at: string;
}

export interface HijaiyyahUpdate {
  readonly audio_id?: string | null;
  readonly audio_reviewed?: boolean;
  readonly trace_reviewed?: boolean;
  readonly reviewer?: string | null;
  readonly reviewed_at?: string | null;
  readonly active?: boolean;
}

export interface SpeechClipRow {
  readonly kind: 'num' | 'letter';
  readonly locale: 'id' | 'en';
  readonly key: string;
  readonly audio_id: string | null;
  readonly updated_at: string;
}

export interface SceneAudioRow {
  readonly id: string;
  readonly layer: AudioLayer;
  readonly audio_id: string | null;
  readonly updated_at: string;
}

export interface PublicationRow {
  readonly version: number;
  readonly manifest_path: string;
  readonly counts: Record<string, number>;
  readonly note: string | null;
  readonly published_by: string | null;
  readonly published_at: string;
}
