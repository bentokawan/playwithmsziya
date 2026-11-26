import { describe, expect, it } from 'vitest';
import { encodeWavPcm16 } from './wav';

describe('encodeWavPcm16', () => {
  it('writes valid RIFF/WAVE PCM 16-bit header and sample payload length', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const buf = encodeWavPcm16(samples, 22050);
    expect(buf.byteLength).toBe(44 + samples.length * 2);

    const view = new DataView(buf);
    const riff = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3),
    );
    const wave = String.fromCharCode(
      view.getUint8(8),
      view.getUint8(9),
      view.getUint8(10),
      view.getUint8(11),
    );
    expect(riff).toBe('RIFF');
    expect(wave).toBe('WAVE');
    expect(view.getUint32(4, true)).toBe(36 + samples.length * 2);
    expect(view.getUint32(24, true)).toBe(22050);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(samples.length * 2);
  });
});
