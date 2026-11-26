import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './client';
import type {
  HijaiyyahRow,
  HijaiyyahUpdate,
  MediaInsert,
  MediaRow,
  ObjectRow,
  ObjectUpsert,
  PublicationRow,
  SceneAudioRow,
  SpeechClipRow,
  WordRow,
  WordUpsert,
} from './types';

export type DbResult<T> = { readonly data: T } | { readonly error: string };

function friendlyError(err: { code?: string; message?: string } | null): string {
  if (!err) return 'Terjadi kesalahan saat menghubungi server.';
  if (err.code === '23505') return 'Data sudah ada (duplikat).';
  if (err.code === '23503') return 'Data referensi tidak ditemukan.';
  if (err.code === '23514') return 'Data tidak memenuhi aturan validasi.';
  if (err.code === '42501') return 'Anda tidak memiliki izin untuk aksi ini.';
  return 'Gagal menyimpan atau memuat data. Coba lagi.';
}

function requireClient(): { readonly error: string } | { readonly client: SupabaseClient } {
  const client = getSupabase();
  if (!client) {
    return { error: 'CMS belum dikonfigurasi.' };
  }
  return { client };
}

export async function listObjects(): Promise<DbResult<ObjectRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client.from('objects').select('*').order('id');
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as ObjectRow[] };
}

export async function upsertObject(row: ObjectUpsert): Promise<DbResult<ObjectRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('objects')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) return { error: friendlyError(error) };
  return { data: data as ObjectRow };
}

export async function listWords(locale?: 'id' | 'en'): Promise<DbResult<WordRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  let query = res.client.from('words').select('*').order('word');
  if (locale) query = query.eq('locale', locale);
  const { data, error } = await query;
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as WordRow[] };
}

export async function upsertWord(row: WordUpsert): Promise<DbResult<WordRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('words')
    .upsert(row, { onConflict: 'locale,word' })
    .select('*')
    .single();
  if (error) return { error: friendlyError(error) };
  return { data: data as WordRow };
}

export async function listHijaiyyah(): Promise<DbResult<HijaiyyahRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client.from('hijaiyyah').select('*');
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as HijaiyyahRow[] };
}

export async function updateHijaiyyah(
  id: string,
  patch: HijaiyyahUpdate,
): Promise<DbResult<HijaiyyahRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('hijaiyyah')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { error: friendlyError(error) };
  return { data: data as HijaiyyahRow };
}

export async function listSpeechClips(): Promise<DbResult<SpeechClipRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('speech_clips')
    .select('*')
    .order('kind')
    .order('locale')
    .order('key');
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as SpeechClipRow[] };
}

export async function updateSpeechClip(
  kind: 'num' | 'letter',
  locale: 'id' | 'en',
  key: string,
  audioId: string | null,
): Promise<DbResult<SpeechClipRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('speech_clips')
    .update({ audio_id: audioId })
    .eq('kind', kind)
    .eq('locale', locale)
    .eq('key', key)
    .select('*')
    .single();
  if (error) return { error: friendlyError(error) };
  return { data: data as SpeechClipRow };
}

export async function listSceneAudio(): Promise<DbResult<SceneAudioRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client.from('scene_audio').select('*').order('id');
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as SceneAudioRow[] };
}

export async function updateSceneAudio(
  id: string,
  audioId: string | null,
): Promise<DbResult<SceneAudioRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('scene_audio')
    .update({ audio_id: audioId })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { error: friendlyError(error) };
  return { data: data as SceneAudioRow };
}

export async function listMedia(): Promise<DbResult<MediaRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as MediaRow[] };
}

export async function findMediaBySha256(sha256: string): Promise<DbResult<MediaRow | null>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('media')
    .select('*')
    .eq('sha256', sha256)
    .limit(1)
    .maybeSingle();
  if (error) return { error: friendlyError(error) };
  return { data: (data as MediaRow | null) ?? null };
}

export async function insertMedia(row: MediaInsert): Promise<DbResult<MediaRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client.from('media').insert(row).select('*').single();
  if (error) return { error: friendlyError(error) };
  return { data: data as MediaRow };
}

export async function listPublications(): Promise<DbResult<PublicationRow[]>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('publications')
    .select('*')
    .order('version', { ascending: false });
  if (error) return { error: friendlyError(error) };
  return { data: (data ?? []) as PublicationRow[] };
}

export async function insertPublication(
  manifestPath: string,
  counts: Record<string, number>,
  note: string | null,
): Promise<DbResult<PublicationRow>> {
  const res = requireClient();
  if ('error' in res) return res;
  const { data, error } = await res.client
    .from('publications')
    .insert({ manifest_path: manifestPath, counts, note })
    .select('*')
    .single();
  if (error) return { error: friendlyError(error) };
  return { data: data as PublicationRow };
}
