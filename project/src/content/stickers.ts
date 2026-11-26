import type { WorldId } from '@/games/ids';
import type { ObjectId } from './objects';

export type StickerNumber = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
export type StickerId = `${WorldId}-${StickerNumber}`;

export type CharacterStickerKey = 'jeje' | 'pipi' | 'lulu' | 'kuku';

export interface StickerDef {
  readonly id: StickerId;
  readonly worldId: WorldId;
  readonly kind: 'character' | 'object';
  readonly subject: CharacterStickerKey | ObjectId;
}

export const STICKERS: Record<WorldId, readonly StickerDef[]> = {
  angka: [
    { id: 'angka-01', worldId: 'angka', kind: 'character', subject: 'jeje' },
    { id: 'angka-02', worldId: 'angka', kind: 'object', subject: 'star' },
    { id: 'angka-03', worldId: 'angka', kind: 'object', subject: 'apple' },
    { id: 'angka-04', worldId: 'angka', kind: 'object', subject: 'orange' },
    { id: 'angka-05', worldId: 'angka', kind: 'object', subject: 'ball' },
    { id: 'angka-06', worldId: 'angka', kind: 'object', subject: 'flower' },
    { id: 'angka-07', worldId: 'angka', kind: 'object', subject: 'carrot' },
    { id: 'angka-08', worldId: 'angka', kind: 'object', subject: 'fish' },
    { id: 'angka-09', worldId: 'angka', kind: 'object', subject: 'duck' },
  ],
  huruf: [
    { id: 'huruf-01', worldId: 'huruf', kind: 'character', subject: 'pipi' },
    { id: 'huruf-02', worldId: 'huruf', kind: 'object', subject: 'house' },
    { id: 'huruf-03', worldId: 'huruf', kind: 'object', subject: 'kite' },
    { id: 'huruf-04', worldId: 'huruf', kind: 'object', subject: 'umbrella' },
    { id: 'huruf-05', worldId: 'huruf', kind: 'object', subject: 'cake' },
    { id: 'huruf-06', worldId: 'huruf', kind: 'object', subject: 'book' },
    { id: 'huruf-07', worldId: 'huruf', kind: 'object', subject: 'rabbit' },
    { id: 'huruf-08', worldId: 'huruf', kind: 'object', subject: 'sun' },
    { id: 'huruf-09', worldId: 'huruf', kind: 'object', subject: 'train' },
  ],
  hijaiyyah: [
    { id: 'hijaiyyah-01', worldId: 'hijaiyyah', kind: 'character', subject: 'lulu' },
    { id: 'hijaiyyah-02', worldId: 'hijaiyyah', kind: 'object', subject: 'moon' },
    { id: 'hijaiyyah-03', worldId: 'hijaiyyah', kind: 'object', subject: 'lantern' },
    { id: 'hijaiyyah-04', worldId: 'hijaiyyah', kind: 'object', subject: 'mosque' },
    { id: 'hijaiyyah-05', worldId: 'hijaiyyah', kind: 'object', subject: 'camel' },
    { id: 'hijaiyyah-06', worldId: 'hijaiyyah', kind: 'object', subject: 'dates' },
    { id: 'hijaiyyah-07', worldId: 'hijaiyyah', kind: 'object', subject: 'owl' },
    { id: 'hijaiyyah-08', worldId: 'hijaiyyah', kind: 'object', subject: 'firefly' },
    { id: 'hijaiyyah-09', worldId: 'hijaiyyah', kind: 'object', subject: 'palm-tree' },
  ],
  memori: [
    { id: 'memori-01', worldId: 'memori', kind: 'character', subject: 'kuku' },
    { id: 'memori-02', worldId: 'memori', kind: 'object', subject: 'whale' },
    { id: 'memori-03', worldId: 'memori', kind: 'object', subject: 'octopus' },
    { id: 'memori-04', worldId: 'memori', kind: 'object', subject: 'shell' },
    { id: 'memori-05', worldId: 'memori', kind: 'object', subject: 'starfish' },
    { id: 'memori-06', worldId: 'memori', kind: 'object', subject: 'crab' },
    { id: 'memori-07', worldId: 'memori', kind: 'object', subject: 'sandcastle' },
    { id: 'memori-08', worldId: 'memori', kind: 'object', subject: 'boat' },
    { id: 'memori-09', worldId: 'memori', kind: 'object', subject: 'coconut' },
  ],
} as const;

export const ALL_STICKER_IDS: readonly StickerId[] = [
  ...STICKERS.angka,
  ...STICKERS.huruf,
  ...STICKERS.hijaiyyah,
  ...STICKERS.memori,
].map((s) => s.id);

export const isStickerId = (v: string): v is StickerId =>
  (ALL_STICKER_IDS as readonly string[]).includes(v);
