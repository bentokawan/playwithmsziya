import { describe, expect, it } from 'vitest';
import { OBJECT_IDS } from '@/content/objects';
import { OBJECT_IMAGES } from './index';

const rawSvgs = import.meta.glob<string>('./*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

describe('bundled object illustrations', () => {
  it('provides an SVG URL for every ObjectId in content', () => {
    for (const id of OBJECT_IDS) {
      expect(typeof OBJECT_IMAGES[id]).toBe('string');
      expect(OBJECT_IMAGES[id].length).toBeGreaterThan(0);
    }
  });

  it('keeps every object SVG under 4 kB', () => {
    for (const id of OBJECT_IDS) {
      const raw = rawSvgs[`./${id}.svg`];
      expect(typeof raw).toBe('string');
      expect(raw.includes('<svg')).toBe(true);
      expect(new TextEncoder().encode(raw).length).toBeLessThanOrEqual(4096);
    }
  });
});
