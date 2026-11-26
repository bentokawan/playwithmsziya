import type { WorldId } from '@/games/ids';
import type { AmbientId, MusicId } from '@/lib/audio/types';

export interface WorldDef {
  readonly id: WorldId;
  readonly music: MusicId;
  readonly ambient: AmbientId;
  readonly character: 'Jeje' | 'Pipi' | 'Lulu' | 'Kuku';
  readonly palette: {
    readonly sky: string;
    readonly hillFar: string;
    readonly ground: string;
    readonly groundDark: string;
    readonly accent: string;
  };
}

export const WORLDS: Record<WorldId, WorldDef> = {
  angka: {
    id: 'angka',
    music: 'world-angka',
    ambient: 'meadow',
    character: 'Jeje',
    palette: {
      sky: '#CDEFFF',
      hillFar: '#9FE0C4',
      ground: '#3DBE7A',
      groundDark: '#2FA866',
      accent: '#0A8FD6',
    },
  },
  huruf: {
    id: 'huruf',
    music: 'world-huruf',
    ambient: 'breeze',
    character: 'Pipi',
    palette: {
      sky: '#FFF0F6',
      hillFar: '#FFC2DC',
      ground: '#F48FB8',
      groundDark: '#E8769F',
      accent: '#E8458B',
    },
  },
  hijaiyyah: {
    id: 'hijaiyyah',
    music: 'world-hijaiyyah',
    ambient: 'night',
    character: 'Lulu',
    palette: {
      sky: '#DCE6FF',
      hillFar: '#A9B8F5',
      ground: '#6C7FD8',
      groundDark: '#5A6CC4',
      accent: '#FFE29A',
    },
  },
  memori: {
    id: 'memori',
    music: 'world-memori',
    ambient: 'waves',
    character: 'Kuku',
    palette: {
      sky: '#FFF3DD',
      hillFar: '#7FD3FF',
      ground: '#F2B36F',
      groundDark: '#E3A15A',
      accent: '#3DBE7A',
    },
  },
} as const;
