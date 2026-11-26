import { getSupabase } from '@/lib/supabase/client';
import { findMediaBySha256, insertMedia } from '@/lib/supabase/db';
import type { MediaLicense, MediaRow } from '@/lib/supabase/types';
import { validateMediaFile, type MediaUploadType } from './validate';

function extFromMime(mime: string, fallbackName: string): string {
  if (mime === 'image/svg+xml') return 'svg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'audio/mpeg' || mime === 'audio/mp3') return 'mp3';
  if (mime === 'audio/wav' || mime === 'audio/x-wav') return 'wav';
  if (mime === 'audio/mp4' || mime === 'audio/x-m4a') return 'm4a';
  const dot = fallbackName.lastIndexOf('.');
  return dot >= 0 ? fallbackName.slice(dot + 1).toLowerCase() : 'bin';
}

export function buildStoragePath(
  prefixPath: string,
  sha256: string,
  ext: string,
): string {
  const cleanPrefix = prefixPath.replace(/^\/+/, '').replace(/\/+$/, '');
  return `${cleanPrefix}-${sha256.slice(0, 8)}.${ext}`;
}

export interface UploadMediaParams {
  readonly file: File;
  readonly type: MediaUploadType;
  /** Prefix without hash/ext, e.g. 'images/objects/apple' or 'audio/speech/ar/hija-alif' */
  readonly storagePrefix: string;
  readonly license: MediaLicense;
  readonly author?: string | null;
  readonly sourceUrl?: string | null;
}

export type UploadMediaResult =
  | { readonly ok: true; readonly media: MediaRow; readonly warnings: readonly string[] }
  | { readonly ok: false; readonly errors: readonly string[] };

export async function uploadMedia(params: UploadMediaParams): Promise<UploadMediaResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, errors: ['CMS belum dikonfigurasi.'] };
  }

  const validation = await validateMediaFile(params.file, params.type);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors };
  }

  // Dedup by sha256
  const existing = await findMediaBySha256(validation.meta.sha256);
  if ('data' in existing && existing.data) {
    return { ok: true, media: existing.data, warnings: validation.warnings };
  }

  const ext = extFromMime(validation.meta.mime, params.file.name);
  const storagePath = buildStoragePath(params.storagePrefix, validation.meta.sha256, ext);

  const { error: uploadErr } = await supabase.storage
    .from('media')
    .upload(storagePath, params.file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: validation.meta.mime,
    });

  if (uploadErr) {
    return { ok: false, errors: ['Gagal mengunggah file ke storage.'] };
  }

  const inserted = await insertMedia({
    kind: params.type === 'object-image' ? 'image' : 'audio',
    storage_path: storagePath,
    mime: validation.meta.mime,
    bytes: validation.meta.bytes,
    sha256: validation.meta.sha256,
    duration_ms: validation.meta.durationMs ?? null,
    width: validation.meta.width ?? null,
    height: validation.meta.height ?? null,
    license: params.license,
    author: params.author ?? null,
    source_url: params.sourceUrl ?? null,
  });

  if ('error' in inserted) {
    // Best-effort rollback of storage upload
    await supabase.storage.from('media').remove([storagePath]);
    return { ok: false, errors: [inserted.error] };
  }

  return { ok: true, media: inserted.data, warnings: validation.warnings };
}
