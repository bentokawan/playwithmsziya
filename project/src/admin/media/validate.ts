export type MediaUploadType = 'object-image' | 'speech' | 'music' | 'ambient' | 'sfx';

export interface MediaFileMeta {
  readonly mime: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly durationMs?: number;
  readonly width?: number;
  readonly height?: number;
  readonly peakLinear?: number;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly meta: MediaFileMeta;
}

const MAX_BYTES: Record<MediaUploadType, number> = {
  'object-image': 200 * 1024,
  speech: 1024 * 1024,
  music: 3 * 1024 * 1024,
  ambient: 1024 * 1024,
  sfx: 300 * 1024,
};

const ACCEPTED_MIMES: Record<MediaUploadType, readonly string[]> = {
  'object-image': ['image/svg+xml', 'image/png', 'image/webp'],
  speech: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a'],
  music: ['audio/mpeg', 'audio/mp3'],
  ambient: ['audio/mpeg', 'audio/mp3'],
  sfx: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'],
};

const PEAK_WARN_THRESHOLD = Math.pow(10, -0.1 / 20); // -0.1 dBFS

export function validateSvgContent(svgText: string): string[] {
  const errors: string[] = [];
  if (/<script\b/i.test(svgText)) errors.push('SVG tidak boleh mengandung <script>.');
  if (/\son[a-z]+\s*=/i.test(svgText)) errors.push('SVG tidak boleh mengandung atribut event on*=.');
  if (/<foreignObject\b/i.test(svgText)) errors.push('SVG tidak boleh mengandung <foreignObject>.');
  if (/<!ENTITY\b/i.test(svgText)) errors.push('SVG tidak boleh mengandung <!ENTITY>.');
  if (/(?:xlink:)?href\s*=\s*["'](?!#)/i.test(svgText)) {
    errors.push('SVG tidak boleh memuat href eksternal.');
  }
  return errors;
}

export function validateFileMeta(
  type: MediaUploadType,
  meta: MediaFileMeta,
  svgText?: string,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ACCEPTED_MIMES[type].includes(meta.mime)) {
    errors.push(`Format file tidak didukung (${meta.mime || 'tidak dikenal'}).`);
  }

  if (meta.bytes <= 0 || meta.bytes > MAX_BYTES[type]) {
    const maxKb = Math.round(MAX_BYTES[type] / 1024);
    errors.push(`Ukuran file melebihi batas maksimal ${maxKb} kB.`);
  }

  if (type === 'object-image') {
    if (meta.mime === 'image/svg+xml' && svgText !== undefined) {
      errors.push(...validateSvgContent(svgText));
    } else if (meta.width !== undefined && meta.height !== undefined) {
      if (meta.width < 240 || meta.height < 240) {
        errors.push('Resolusi gambar minimal 240×240 px.');
      }
      const ratio = meta.width / Math.max(1, meta.height);
      if (ratio < 0.9 || ratio > 1.1) {
        errors.push('Rasio gambar harus mendekati 1:1 (±10%).');
      }
    }
  } else {
    const dur = meta.durationMs;
    if (dur === undefined || dur <= 0) {
      errors.push('File audio gagal dibaca atau tidak valid.');
    } else {
      if (type === 'speech' && (dur < 200 || dur > 4000)) {
        errors.push('Durasi klip bicara harus 0.2–4 detik.');
      }
      if (type === 'music' && (dur < 30_000 || dur > 180_000)) {
        errors.push('Durasi musik harus 30–180 detik.');
      }
      if (type === 'sfx' && dur > 3000) {
        errors.push('Durasi SFX maksimal 3 detik.');
      }
    }
    if (meta.peakLinear !== undefined && meta.peakLinear > PEAK_WARN_THRESHOLD) {
      warnings.push('Audio mungkin pecah (peak > -0.1 dBFS).');
    }
  }

  return { ok: errors.length === 0, errors, warnings, meta };
}

export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decodeAudioMetrics(
  arrayBuffer: ArrayBuffer,
): Promise<{ durationMs: number; peakLinear: number } | null> {
  try {
    const Ctor =
      globalThis.AudioContext ??
      (globalThis as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    try {
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      let peak = 0;
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const data = decoded.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i]);
          if (v > peak) peak = v;
        }
      }
      return {
        durationMs: Math.round(decoded.duration * 1000),
        peakLinear: peak,
      };
    } finally {
      void ctx.close?.();
    }
  } catch {
    return null;
  }
}

export async function validateMediaFile(
  file: File,
  type: MediaUploadType,
): Promise<ValidationResult> {
  const buf = await file.arrayBuffer();
  const sha256 = await sha256Hex(buf);

  if (type === 'object-image') {
    if (file.type === 'image/svg+xml') {
      const svgText = await file.text();
      return validateFileMeta(
        type,
        { mime: file.type, bytes: file.size, sha256 },
        svgText,
      );
    }
    const dims = await readImageDimensions(file);
    return validateFileMeta(type, {
      mime: file.type,
      bytes: file.size,
      sha256,
      width: dims?.width,
      height: dims?.height,
    });
  }

  const metrics = await decodeAudioMetrics(buf);
  return validateFileMeta(type, {
    mime: file.type,
    bytes: file.size,
    sha256,
    durationMs: metrics?.durationMs,
    peakLinear: metrics?.peakLinear,
  });
}
