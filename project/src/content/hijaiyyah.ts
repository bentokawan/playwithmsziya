import type { DifficultyId } from '@/lib/session/session';

export const HIJAIYYAH_IDS = [
  'alif',
  'ba',
  'ta',
  'tsa',
  'jim',
  'hha',
  'kha',
  'dal',
  'dzal',
  'ra',
  'zai',
  'sin',
  'syin',
  'shad',
  'dhad',
  'tha',
  'zha',
  'ain',
  'ghain',
  'fa',
  'qaf',
  'kaf',
  'lam',
  'mim',
  'nun',
  'waw',
  'haa',
  'ya',
] as const;

export type HijaiyyahId = (typeof HIJAIYYAH_IDS)[number];

export const isHijaiyyahId = (v: string): v is HijaiyyahId =>
  (HIJAIYYAH_IDS as readonly string[]).includes(v);

export interface HijaiyyahDef {
  readonly id: HijaiyyahId;
  readonly char: string;
  readonly nameId: string;
  readonly family: string;
  readonly traceGroup: DifficultyId;
}

export const BUNDLED_HIJAIYYAH: readonly HijaiyyahDef[] = [
  { id: 'alif', char: 'ا', nameId: 'Alif', family: 'alif', traceGroup: 'mudah' },
  { id: 'ba', char: 'ب', nameId: 'Ba', family: 'ba', traceGroup: 'sedang' },
  { id: 'ta', char: 'ت', nameId: 'Ta', family: 'ba', traceGroup: 'sedang' },
  { id: 'tsa', char: 'ث', nameId: 'Tsa', family: 'ba', traceGroup: 'sedang' },
  { id: 'jim', char: 'ج', nameId: 'Jim', family: 'jim', traceGroup: 'tantang' },
  { id: 'hha', char: 'ح', nameId: 'Ḥa', family: 'jim', traceGroup: 'tantang' },
  { id: 'kha', char: 'خ', nameId: 'Kha', family: 'jim', traceGroup: 'tantang' },
  { id: 'dal', char: 'د', nameId: 'Dal', family: 'dal', traceGroup: 'mudah' },
  { id: 'dzal', char: 'ذ', nameId: 'Dzal', family: 'dal', traceGroup: 'sedang' },
  { id: 'ra', char: 'ر', nameId: 'Ra', family: 'ra', traceGroup: 'mudah' },
  { id: 'zai', char: 'ز', nameId: 'Zai', family: 'ra', traceGroup: 'sedang' },
  { id: 'sin', char: 'س', nameId: 'Sin', family: 'sin', traceGroup: 'tantang' },
  { id: 'syin', char: 'ش', nameId: 'Syin', family: 'sin', traceGroup: 'tantang' },
  { id: 'shad', char: 'ص', nameId: 'Shad', family: 'shad', traceGroup: 'tantang' },
  { id: 'dhad', char: 'ض', nameId: 'Dhad', family: 'shad', traceGroup: 'tantang' },
  { id: 'tha', char: 'ط', nameId: 'Tha', family: 'tha', traceGroup: 'tantang' },
  { id: 'zha', char: 'ظ', nameId: 'Zha', family: 'tha', traceGroup: 'tantang' },
  { id: 'ain', char: 'ع', nameId: "'Ain", family: 'ain', traceGroup: 'tantang' },
  { id: 'ghain', char: 'غ', nameId: 'Ghain', family: 'ain', traceGroup: 'tantang' },
  { id: 'fa', char: 'ف', nameId: 'Fa', family: 'fa', traceGroup: 'sedang' },
  { id: 'qaf', char: 'ق', nameId: 'Qaf', family: 'fa', traceGroup: 'sedang' },
  { id: 'kaf', char: 'ك', nameId: 'Kaf', family: 'kaf', traceGroup: 'tantang' },
  { id: 'lam', char: 'ل', nameId: 'Lam', family: 'lam', traceGroup: 'mudah' },
  { id: 'mim', char: 'م', nameId: 'Mim', family: 'mim', traceGroup: 'mudah' },
  { id: 'nun', char: 'ن', nameId: 'Nun', family: 'ba', traceGroup: 'sedang' },
  { id: 'waw', char: 'و', nameId: 'Waw', family: 'waw', traceGroup: 'mudah' },
  { id: 'haa', char: 'ه', nameId: 'Ha', family: 'haa', traceGroup: 'tantang' },
  { id: 'ya', char: 'ي', nameId: 'Ya', family: 'ba', traceGroup: 'sedang' },
] as const;

export const HIJAIYYAH_EASY_POOL: readonly HijaiyyahId[] = [
  'alif',
  'ba',
  'jim',
  'dal',
  'ra',
  'sin',
  'ain',
  'fa',
  'mim',
  'waw',
] as const;
