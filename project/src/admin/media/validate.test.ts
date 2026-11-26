import { describe, expect, it } from 'vitest';
import { validateFileMeta, validateSvgContent } from './validate';

describe('CMS media validator', () => {
  it('rejects dangerous SVG constructs and accepts clean SVG', () => {
    expect(validateSvgContent('<svg><circle cx="10" cy="10" r="5"/></svg>')).toEqual([]);
    expect(validateSvgContent('<svg><script>alert(1)</script></svg>').length).toBeGreaterThan(0);
    expect(validateSvgContent('<svg onclick="x()"></svg>').length).toBeGreaterThan(0);
    expect(validateSvgContent('<svg><foreignObject></foreignObject></svg>').length).toBeGreaterThan(0);
    expect(validateSvgContent('<svg><image href="https://evil.test/x.png"/></svg>').length).toBeGreaterThan(0);
    expect(validateSvgContent('<svg><use href="#icon"/></svg>')).toEqual([]);
  });

  it('validates image size, resolution, and aspect ratio', () => {
    const ok = validateFileMeta('object-image', {
      mime: 'image/png',
      bytes: 50_000,
      sha256: 'abc',
      width: 300,
      height: 300,
    });
    expect(ok.ok).toBe(true);

    const tooSmall = validateFileMeta('object-image', {
      mime: 'image/png',
      bytes: 50_000,
      sha256: 'abc',
      width: 120,
      height: 120,
    });
    expect(tooSmall.ok).toBe(false);

    const badRatio = validateFileMeta('object-image', {
      mime: 'image/webp',
      bytes: 50_000,
      sha256: 'abc',
      width: 400,
      height: 250,
    });
    expect(badRatio.ok).toBe(false);
  });

  it('validates audio duration bounds and warns on clipping peak', () => {
    const okSpeech = validateFileMeta('speech', {
      mime: 'audio/wav',
      bytes: 44_000,
      sha256: 'abc',
      durationMs: 1200,
      peakLinear: 0.995,
    });
    expect(okSpeech.ok).toBe(true);
    expect(okSpeech.warnings.length).toBe(1);

    const tooLongSpeech = validateFileMeta('speech', {
      mime: 'audio/wav',
      bytes: 44_000,
      sha256: 'abc',
      durationMs: 6000,
    });
    expect(tooLongSpeech.ok).toBe(false);

    const tooShortMusic = validateFileMeta('music', {
      mime: 'audio/mpeg',
      bytes: 500_000,
      sha256: 'abc',
      durationMs: 10_000,
    });
    expect(tooShortMusic.ok).toBe(false);
  });
});
