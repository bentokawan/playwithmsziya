import type { Locale } from '@/lib/session/session';
import type { ObjectId } from './objects';

export interface BundledWordDef {
  readonly locale: Locale;
  readonly word: string;
  readonly objectId: ObjectId;
  readonly initial: boolean;
  readonly spell: boolean;
}

export const CONFUSABLE_GROUPS: readonly (readonly string[])[] = [
  ['B', 'D', 'P'],
  ['M', 'N', 'W'],
  ['I', 'J', 'L'],
  ['C', 'G', 'O'],
  ['U', 'V'],
  ['E', 'F'],
] as const;

const RAW_WORDS_ID: readonly BundledWordDef[] = [
  // G04 Bunyi Awal (20) — words also in G03 have spell: true
  { locale: 'id', word: 'APEL', objectId: 'apple', initial: true, spell: false },
  { locale: 'id', word: 'BOLA', objectId: 'ball', initial: true, spell: true },
  { locale: 'id', word: 'CICAK', objectId: 'gecko', initial: true, spell: false },
  { locale: 'id', word: 'DOMBA', objectId: 'sheep', initial: true, spell: false },
  { locale: 'id', word: 'EMBER', objectId: 'bucket', initial: true, spell: false },
  { locale: 'id', word: 'GAJAH', objectId: 'elephant', initial: true, spell: false },
  { locale: 'id', word: 'HARIMAU', objectId: 'tiger', initial: true, spell: false },
  { locale: 'id', word: 'IKAN', objectId: 'fish', initial: true, spell: true },
  { locale: 'id', word: 'JERUK', objectId: 'orange', initial: true, spell: false },
  { locale: 'id', word: 'KUCING', objectId: 'cat', initial: true, spell: false },
  { locale: 'id', word: 'LAMPU', objectId: 'lamp', initial: true, spell: false },
  { locale: 'id', word: 'MOBIL', objectId: 'car', initial: true, spell: false },
  { locale: 'id', word: 'NANAS', objectId: 'pineapple', initial: true, spell: false },
  { locale: 'id', word: 'PAYUNG', objectId: 'umbrella', initial: true, spell: false },
  { locale: 'id', word: 'RUMAH', objectId: 'house', initial: true, spell: true },
  { locale: 'id', word: 'SAPI', objectId: 'cow', initial: true, spell: true },
  { locale: 'id', word: 'TOPI', objectId: 'hat', initial: true, spell: true },
  { locale: 'id', word: 'ULAR', objectId: 'snake', initial: true, spell: false },
  { locale: 'id', word: 'WORTEL', objectId: 'carrot', initial: true, spell: false },
  { locale: 'id', word: 'ZEBRA', objectId: 'zebra', initial: true, spell: false },
  // G03 Susun Kata only (ID)
  { locale: 'id', word: 'KUE', objectId: 'cake', initial: false, spell: true },
  { locale: 'id', word: 'BUS', objectId: 'bus', initial: false, spell: true },
  { locale: 'id', word: 'API', objectId: 'fire', initial: false, spell: true },
  { locale: 'id', word: 'TAS', objectId: 'bag', initial: false, spell: true },
  { locale: 'id', word: 'JUS', objectId: 'juice', initial: false, spell: true },
  { locale: 'id', word: 'BAN', objectId: 'tire', initial: false, spell: true },
  { locale: 'id', word: 'BUKU', objectId: 'book', initial: false, spell: true },
  { locale: 'id', word: 'SUSU', objectId: 'milk', initial: false, spell: true },
  { locale: 'id', word: 'KAKI', objectId: 'foot', initial: false, spell: true },
  { locale: 'id', word: 'MATA', objectId: 'eye', initial: false, spell: true },
  { locale: 'id', word: 'MEJA', objectId: 'table', initial: false, spell: true },
  { locale: 'id', word: 'BAJU', objectId: 'shirt', initial: false, spell: true },
  { locale: 'id', word: 'BEBEK', objectId: 'duck', initial: false, spell: true },
  { locale: 'id', word: 'BULAN', objectId: 'moon', initial: false, spell: true },
  { locale: 'id', word: 'SEMUT', objectId: 'ant', initial: false, spell: true },
  { locale: 'id', word: 'TELUR', objectId: 'egg', initial: false, spell: true },
  { locale: 'id', word: 'SINGA', objectId: 'lion', initial: false, spell: true },
  { locale: 'id', word: 'KATAK', objectId: 'frog', initial: false, spell: true },
];

const RAW_WORDS_EN: readonly BundledWordDef[] = [
  // G04 Bunyi Awal (22) — words also in G03 have spell: true
  { locale: 'en', word: 'APPLE', objectId: 'apple', initial: true, spell: true },
  { locale: 'en', word: 'BALL', objectId: 'ball', initial: true, spell: true },
  { locale: 'en', word: 'CAT', objectId: 'cat', initial: true, spell: true },
  { locale: 'en', word: 'DUCK', objectId: 'duck', initial: true, spell: true },
  { locale: 'en', word: 'EGG', objectId: 'egg', initial: true, spell: true },
  { locale: 'en', word: 'FISH', objectId: 'fish', initial: true, spell: true },
  { locale: 'en', word: 'GOAT', objectId: 'goat', initial: true, spell: false },
  { locale: 'en', word: 'HAT', objectId: 'hat', initial: true, spell: true },
  { locale: 'en', word: 'JUICE', objectId: 'juice', initial: true, spell: false },
  { locale: 'en', word: 'KITE', objectId: 'kite', initial: true, spell: false },
  { locale: 'en', word: 'LION', objectId: 'lion', initial: true, spell: false },
  { locale: 'en', word: 'MOON', objectId: 'moon', initial: true, spell: true },
  { locale: 'en', word: 'NEST', objectId: 'nest', initial: true, spell: false },
  { locale: 'en', word: 'OCTOPUS', objectId: 'octopus', initial: true, spell: false },
  { locale: 'en', word: 'PENCIL', objectId: 'pencil', initial: true, spell: false },
  { locale: 'en', word: 'RABBIT', objectId: 'rabbit', initial: true, spell: false },
  { locale: 'en', word: 'SUN', objectId: 'sun', initial: true, spell: true },
  { locale: 'en', word: 'TREE', objectId: 'tree', initial: true, spell: true },
  { locale: 'en', word: 'UMBRELLA', objectId: 'umbrella', initial: true, spell: false },
  { locale: 'en', word: 'VAN', objectId: 'van', initial: true, spell: false },
  { locale: 'en', word: 'WHALE', objectId: 'whale', initial: true, spell: false },
  { locale: 'en', word: 'ZEBRA', objectId: 'zebra', initial: true, spell: true },
  // G03 Susun Kata only (EN)
  { locale: 'en', word: 'BUS', objectId: 'bus', initial: false, spell: true },
  { locale: 'en', word: 'CUP', objectId: 'cup', initial: false, spell: true },
  { locale: 'en', word: 'CAKE', objectId: 'cake', initial: false, spell: true },
  { locale: 'en', word: 'BOOK', objectId: 'book', initial: false, spell: true },
  { locale: 'en', word: 'FROG', objectId: 'frog', initial: false, spell: true },
  { locale: 'en', word: 'STAR', objectId: 'star', initial: false, spell: true },
  { locale: 'en', word: 'SHOE', objectId: 'shoe', initial: false, spell: true },
  { locale: 'en', word: 'HOUSE', objectId: 'house', initial: false, spell: true },
  { locale: 'en', word: 'SNAKE', objectId: 'snake', initial: false, spell: true },
  { locale: 'en', word: 'HORSE', objectId: 'horse', initial: false, spell: true },
  { locale: 'en', word: 'CHAIR', objectId: 'chair', initial: false, spell: true },
  { locale: 'en', word: 'BREAD', objectId: 'bread', initial: false, spell: true },
  { locale: 'en', word: 'TRAIN', objectId: 'train', initial: false, spell: true },
  { locale: 'en', word: 'CLOCK', objectId: 'clock', initial: false, spell: true },
  { locale: 'en', word: 'TRUCK', objectId: 'truck', initial: false, spell: true },
];

export const BUNDLED_WORDS: readonly BundledWordDef[] = [...RAW_WORDS_ID, ...RAW_WORDS_EN];
