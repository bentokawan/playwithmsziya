import { describe, expect, it } from 'vitest';
import { normalizePeak, resampleMono, trimSilence } from './audioProcess';

describe('audioProcess', () => {
  it('trims leading and trailing silence while preserving 30ms lead and 120ms tail', () => {
    const sr = 1000;
    const buf = new Float32Array(1000);
    for (let i = 300; i < 500; i++) buf[i] = 0.5;
    const trimmed = trimSilence(buf, sr);
    expect(trimmed.length).toBeLessThan(buf.length);
    // start = 300 - 30 = 270, end = 499 + 120 + 1 = 620 => 350 samples
    expect(trimmed.length).toBe(350);
  });

  it('normalizes peak to -1 dBFS', () => {
    const buf = new Float32Array([0, 0.25, -0.25, 0.1]);
    const norm = normalizePeak(buf);
    const peak = Math.max(...Array.from(norm, (v) => Math.abs(v)));
    expect(peak).toBeCloseTo(Math.pow(10, -1 / 20), 4);
  });

  it('resamples mono buffer to target sample rate', () => {
    const buf = new Float32Array(44100);
    const res = resampleMono(buf, 44100, 22050);
    expect(res.length).toBe(22050);
  });
});
