import type { PlayMode } from '@/lib/scores/scoring'
import type { DifficultyId } from '@/lib/session/session'
import type { GameId, WorldId } from './ids'
import type { GameModule } from './types'

export type GameCode =
  'G01' | 'G02' | 'G03' | 'G04' | 'G05' | 'G06' | 'G07' | 'G08' | 'G09'

export interface CatalogEntry {
  readonly id: GameId
  readonly code: GameCode
  readonly worldId: WorldId
  readonly status: 'ready' | 'soon'
  readonly icon: string
  readonly rounds: Record<DifficultyId, number>
  readonly mechanic: 'choice' | 'tracing' | 'memory' | 'maze'
  readonly modes: readonly PlayMode[]
  readonly timed: boolean
  readonly splitMinWidth?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogenous game round modules
  readonly load: () => Promise<{ default: GameModule<any> }>
}

const DEFAULT_ROUNDS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
}

const ALL_MODES: readonly PlayMode[] = ['solo', 'giliran', 'layar', 'online']
const NO_SPLIT_MODES: readonly PlayMode[] = ['solo', 'giliran', 'online']
const SHARED_BOARD_MODES: readonly PlayMode[] = ['solo', 'giliran']

export const CATALOG: Record<GameId, CatalogEntry> = {
  'ayo-berhitung': {
    id: 'ayo-berhitung',
    code: 'G01',
    worldId: 'angka',
    status: 'ready',
    icon: 'apple',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'choice',
    modes: ALL_MODES,
    timed: true,
    load: () => import('./ayo-berhitung'),
  },
  'menulis-angka': {
    id: 'menulis-angka',
    code: 'G02',
    worldId: 'angka',
    status: 'ready',
    icon: 'star',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'tracing',
    modes: ALL_MODES,
    timed: true,
    load: () => import('./menulis-angka'),
  },
  'susun-kata': {
    id: 'susun-kata',
    code: 'G03',
    worldId: 'huruf',
    status: 'ready',
    icon: 'book',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'choice',
    modes: ALL_MODES,
    timed: true,
    load: () => import('./susun-kata'),
  },
  'bunyi-awal': {
    id: 'bunyi-awal',
    code: 'G04',
    worldId: 'huruf',
    status: 'ready',
    icon: 'ball',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'choice',
    modes: NO_SPLIT_MODES,
    timed: true,
    load: () => import('./bunyi-awal'),
  },
  'menulis-huruf': {
    id: 'menulis-huruf',
    code: 'G05',
    worldId: 'huruf',
    status: 'ready',
    icon: 'pencil',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'tracing',
    modes: ALL_MODES,
    timed: true,
    load: () => import('./menulis-huruf'),
  },
  'dengar-temukan': {
    id: 'dengar-temukan',
    code: 'G06',
    worldId: 'hijaiyyah',
    status: 'ready',
    icon: 'lantern',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'choice',
    modes: NO_SPLIT_MODES,
    timed: true,
    load: () => import('./dengar-temukan'),
  },
  'tebalkan-hijaiyyah': {
    id: 'tebalkan-hijaiyyah',
    code: 'G07',
    worldId: 'hijaiyyah',
    status: 'soon',
    icon: 'moon',
    rounds: DEFAULT_ROUNDS,
    mechanic: 'tracing',
    modes: ALL_MODES,
    timed: true,
    load: () => import('./tebalkan-hijaiyyah'),
  },
  'kartu-kembar': {
    id: 'kartu-kembar',
    code: 'G08',
    worldId: 'memori',
    status: 'ready',
    icon: 'cat',
    rounds: { mudah: 1, sedang: 1, tantang: 1 },
    mechanic: 'memory',
    modes: SHARED_BOARD_MODES,
    timed: false,
    load: () => import('./kartu-kembar'),
  },
  'petualangan-labirin': {
    id: 'petualangan-labirin',
    code: 'G09',
    worldId: 'memori',
    status: 'ready',
    icon: 'carrot',
    rounds: { mudah: 2, sedang: 2, tantang: 3 },
    mechanic: 'maze',
    modes: ALL_MODES,
    timed: false,
    load: () => import('./petualangan-labirin'),
  },
}

export const CATALOG_LIST: readonly CatalogEntry[] = Object.values(
  CATALOG
).sort((a, b) => a.code.localeCompare(b.code))

export interface Viewport {
  readonly w: number
  readonly h: number
}

/**
 * Split-screen panes (arena + answer tray) measure roughly 600px tall, so a
 * landscape phone (height 360-430) cannot show them without page scrolling.
 */
export const SPLIT_MIN_HEIGHT = 600

export function splitFits(entry: CatalogEntry, vp: Viewport): boolean {
  return vp.h >= SPLIT_MIN_HEIGHT && vp.w >= (entry.splitMinWidth ?? 900)
}

export function availableModes(
  entry: CatalogEntry,
  vp: Viewport,
  onlineConfigured: boolean
): PlayMode[] {
  return entry.modes.filter((m) => {
    if (m === 'layar' && !splitFits(entry, vp)) return false
    if (m === 'online' && !onlineConfigured) return false
    return true
  })
}

export function resolveLocalMode(
  entry: CatalogEntry,
  players: 1 | 2,
  vp: Viewport
): {
  readonly mode: 'solo' | 'layar' | 'giliran'
  readonly fallback: boolean
  readonly needsRotate: boolean
} {
  if (players === 1) {
    return { mode: 'solo', fallback: false, needsRotate: false }
  }
  const supportsSplit = entry.modes.includes('layar')
  const fits = splitFits(entry, vp)
  const needsRotate =
    supportsSplit && !fits && splitFits(entry, { w: vp.h, h: vp.w })
  return supportsSplit && (fits || needsRotate)
    ? { mode: 'layar', fallback: false, needsRotate }
    : { mode: 'giliran', fallback: true, needsRotate: false }
}

export function canPlayOnline(
  entry: CatalogEntry,
  onlineConfigured: boolean
): boolean {
  return onlineConfigured && entry.modes.includes('online')
}

export interface HomeGameItem {
  readonly entry: CatalogEntry
  readonly playable: boolean
}

export function homeGameList(
  isPlayable: (entry: CatalogEntry) => boolean
): readonly HomeGameItem[] {
  const items = CATALOG_LIST.map((entry) => ({
    entry,
    playable: isPlayable(entry),
  }))
  return items.sort((a, b) => {
    if (a.playable !== b.playable) return a.playable ? -1 : 1
    return a.entry.code.localeCompare(b.entry.code)
  })
}
