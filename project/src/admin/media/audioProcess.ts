import { encodeWavPcm16 } from './wav';

const SILENCE_THRESHOLD = Math.pow(10, -40 / 20); // -40 dBFS = 0.01
const NORMALIZE_TARGET = Math.pow(10, -1 / 20); // -1 dBFS ≈ 0.89125

export function trimSilence(samples: Float32Array, sampleRate: number): Float32Array {
  let first = -1;
  let last = -1;
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) >= SILENCE_THRESHOLD) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1 || last === -1) return samples.slice();

  const leadPad = Math.round(sampleRate * 0.03);
  const tailPad = Math.round(sampleRate * 0.12);
  const start = Math.max(0, first - leadPad);
  const end = Math.min(samples.length, last + tailPad + 1);
  return samples.slice(start, end);
}

export function normalizePeak(samples: Float32Array): Float32Array {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]);
    if (v > peak) peak = v;
  }
  if (peak === 0) return samples.slice();
  const gain = NORMALIZE_TARGET / peak;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = Math.max(-1, Math.min(1, samples[i] * gain));
  }
  return out;
}

export function resampleMono(
  samples: Float32Array,
  fromRate: number,
  toRate = 22050,
): Float32Array {
  if (fromRate === toRate) return samples.slice();
  const ratio = fromRate / toRate;
  const outLen = Math.max(1, Math.round(samples.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcIdx = i * ratio;
    const lo = Math.floor(srcIdx);
    const hi = Math.min(samples.length - 1, lo + 1);
    const frac = srcIdx - lo;
    out[i] = samples[lo] * (1 - frac) + samples[hi] * frac;
  }
  return out;
}

export async function processRecordedBlob(blob: Blob, filename = 'recording.wav'): Promise<File> {
  const Ctor =
    globalThis.AudioContext ??
    (globalThis as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctor();
  try {
    const arr = await blob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arr);
    const mono = decoded.getChannelData(0);
    const trimmed = trimSilence(mono, decoded.sampleRate);
    const normalized = normalizePeak(trimmed);
    const resampled = resampleMono(normalized, decoded.sampleRate, 22050);
    const wavBuf = encodeWavPcm16(resampled, 22050);
    return new File([wavBuf], filename, { type: 'audio/wav' });
  } finally {
    void ctx.close?.();
  }
}
