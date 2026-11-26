import type { HijaiyyahId } from '@/content/hijaiyyah';
import type { Glyph } from './types';

// Right-to-left isolated forms; dots (nuqthah) are dot: true strokes last, right-to-left.
export const HIJAIYYAH_GLYPHS: Record<HijaiyyahId, Glyph> = {
  alif: { id: 'alif', strokes: [{ points: [[52, 16], [52, 84]] }] },
  ba: {
    id: 'ba',
    strokes: [
      { points: [[86, 46], [84, 58], [76, 64], [50, 66], [24, 64], [16, 58], [14, 48]] },
      { points: [[50, 80]], dot: true },
    ],
  },
  ta: {
    id: 'ta',
    strokes: [
      { points: [[86, 48], [82, 62], [50, 66], [18, 62], [14, 48]] },
      { points: [[58, 34]], dot: true },
      { points: [[42, 34]], dot: true },
    ],
  },
  tsa: {
    id: 'tsa',
    strokes: [
      { points: [[86, 50], [82, 64], [50, 68], [18, 64], [14, 50]] },
      { points: [[60, 36]], dot: true },
      { points: [[40, 36]], dot: true },
      { points: [[50, 22]], dot: true },
    ],
  },
  jim: {
    id: 'jim',
    strokes: [
      { points: [[32, 30], [56, 26], [76, 30], [52, 48], [36, 64], [44, 80], [66, 84], [80, 74]] },
      { points: [[56, 62]], dot: true },
    ],
  },
  hha: {
    id: 'hha',
    strokes: [
      { points: [[32, 30], [56, 26], [76, 30], [52, 48], [36, 64], [44, 80], [66, 84], [80, 74]] },
    ],
  },
  kha: {
    id: 'kha',
    strokes: [
      { points: [[32, 34], [56, 30], [76, 34], [52, 52], [36, 66], [44, 82], [66, 86], [80, 76]] },
      { points: [[56, 18]], dot: true },
    ],
  },
  dal: {
    id: 'dal',
    strokes: [{ points: [[44, 30], [66, 46], [68, 64], [48, 72], [28, 70]] }],
  },
  dzal: {
    id: 'dzal',
    strokes: [
      { points: [[44, 34], [66, 50], [68, 68], [48, 76], [28, 74]] },
      { points: [[56, 20]], dot: true },
    ],
  },
  ra: {
    id: 'ra',
    strokes: [{ points: [[64, 30], [68, 52], [58, 72], [38, 82], [22, 82]] }],
  },
  zai: {
    id: 'zai',
    strokes: [
      { points: [[64, 34], [68, 56], [58, 74], [38, 84], [22, 84]] },
      { points: [[62, 18]], dot: true },
    ],
  },
  sin: {
    id: 'sin',
    strokes: [
      { points: [[86, 40], [82, 56], [70, 56], [68, 42], [64, 56], [52, 56], [50, 42], [46, 66], [34, 80], [18, 74], [14, 56]] },
    ],
  },
  syin: {
    id: 'syin',
    strokes: [
      { points: [[86, 44], [82, 60], [70, 60], [68, 46], [64, 60], [52, 60], [50, 46], [46, 70], [34, 82], [18, 76], [14, 58]] },
      { points: [[74, 30]], dot: true },
      { points: [[58, 30]], dot: true },
      { points: [[66, 18]], dot: true },
    ],
  },
  shad: {
    id: 'shad',
    strokes: [
      { points: [[52, 56], [68, 38], [84, 42], [86, 56], [66, 60], [48, 56], [44, 72], [30, 82], [16, 72], [16, 54]] },
    ],
  },
  dhad: {
    id: 'dhad',
    strokes: [
      { points: [[52, 58], [68, 40], [84, 44], [86, 58], [66, 62], [48, 58], [44, 74], [30, 84], [16, 74], [16, 56]] },
      { points: [[70, 24]], dot: true },
    ],
  },
  tha: {
    id: 'tha',
    strokes: [
      { points: [[28, 66], [56, 46], [78, 50], [80, 66], [54, 70], [20, 70]] },
      { points: [[44, 18], [44, 66]] },
    ],
  },
  zha: {
    id: 'zha',
    strokes: [
      { points: [[28, 66], [56, 46], [78, 50], [80, 66], [54, 70], [20, 70]] },
      { points: [[44, 18], [44, 66]] },
      { points: [[66, 30]], dot: true },
    ],
  },
  ain: {
    id: 'ain',
    strokes: [
      { points: [[68, 26], [50, 22], [40, 34], [52, 46], [70, 44], [44, 56], [34, 72], [48, 86], [74, 82]] },
    ],
  },
  ghain: {
    id: 'ghain',
    strokes: [
      { points: [[68, 30], [50, 26], [40, 38], [52, 50], [70, 48], [44, 60], [34, 74], [48, 86], [74, 82]] },
      { points: [[54, 14]], dot: true },
    ],
  },
  fa: {
    id: 'fa',
    strokes: [
      { points: [[74, 44], [64, 34], [58, 46], [72, 52], [78, 62], [54, 68], [24, 66], [16, 56]] },
      { points: [[68, 22]], dot: true },
    ],
  },
  qaf: {
    id: 'qaf',
    strokes: [
      { points: [[72, 44], [60, 34], [54, 46], [70, 52], [72, 70], [54, 84], [30, 82], [22, 64]] },
      { points: [[70, 20]], dot: true },
      { points: [[54, 20]], dot: true },
    ],
  },
  kaf: {
    id: 'kaf',
    strokes: [
      { points: [[74, 18], [74, 66], [52, 74], [24, 72], [18, 62]] },
      { points: [[56, 36], [44, 44], [54, 50], [42, 56]] },
    ],
  },
  lam: {
    id: 'lam',
    strokes: [{ points: [[68, 16], [68, 66], [56, 82], [36, 82], [26, 68], [26, 56]] }],
  },
  mim: {
    id: 'mim',
    strokes: [
      { points: [[68, 36], [54, 28], [46, 40], [64, 46], [34, 48], [30, 68], [30, 86]] },
    ],
  },
  nun: {
    id: 'nun',
    strokes: [
      { points: [[76, 44], [74, 68], [52, 82], [28, 76], [22, 54]] },
      { points: [[50, 40]], dot: true },
    ],
  },
  waw: {
    id: 'waw',
    strokes: [
      { points: [[66, 34], [52, 26], [44, 40], [64, 48], [64, 66], [48, 82], [28, 84]] },
    ],
  },
  haa: {
    id: 'haa',
    strokes: [
      { points: [[50, 26], [68, 42], [68, 68], [50, 78], [32, 68], [32, 42], [50, 26]] },
    ],
  },
  ya: {
    id: 'ya',
    strokes: [
      { points: [[70, 32], [54, 28], [48, 42], [68, 52], [64, 72], [42, 82], [22, 74], [20, 56]] },
      { points: [[56, 88]], dot: true },
      { points: [[40, 88]], dot: true },
    ],
  },
};
