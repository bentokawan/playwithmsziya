import { describe, expect, it } from 'vitest'
import { GAME_IDS, isWorldId } from './ids'
import {
  availableModes,
  canPlayOnline,
  CATALOG,
  CATALOG_LIST,
  homeGameList,
  resolveLocalMode,
  splitFits,
} from './catalog'

describe('CATALOG', () => {
  it('contains an entry for every GameId with modes starting with solo', () => {
    for (const id of GAME_IDS) {
      expect(CATALOG[id]).toBeDefined()
      expect(CATALOG[id].id).toBe(id)
      expect(isWorldId(CATALOG[id].worldId)).toBe(true)
      expect(CATALOG[id].modes[0]).toBe('solo')
    }
  })

  it('availableModes respects viewport width, onlineConfigured, and game capabilities', () => {
    expect(
      availableModes(CATALOG['ayo-berhitung'], { w: 800, h: 800 }, true)
    ).not.toContain('layar')
    expect(
      availableModes(CATALOG['ayo-berhitung'], { w: 1366, h: 768 }, true)
    ).toEqual(['solo', 'giliran', 'layar', 'online'])
    expect(
      availableModes(CATALOG['ayo-berhitung'], { w: 1366, h: 768 }, false)
    ).toEqual(['solo', 'giliran', 'layar'])
    expect(
      availableModes(CATALOG['kartu-kembar'], { w: 1366, h: 768 }, true)
    ).toEqual(['solo', 'giliran'])
    expect(
      availableModes(CATALOG['bunyi-awal'], { w: 1366, h: 768 }, true)
    ).toEqual(['solo', 'giliran', 'online'])
  })

  it('resolveLocalMode picks layar when supported or falls back to giliran, and canPlayOnline checks capability', () => {
    expect(
      resolveLocalMode(CATALOG['ayo-berhitung'], 2, { w: 1366, h: 768 })
    ).toEqual({
      mode: 'layar',
      fallback: false,
      needsRotate: false,
    })
    expect(
      resolveLocalMode(CATALOG['ayo-berhitung'], 2, { w: 800, h: 800 })
    ).toEqual({
      mode: 'giliran',
      fallback: true,
      needsRotate: false,
    })
    expect(
      resolveLocalMode(CATALOG['kartu-kembar'], 2, { w: 1366, h: 768 })
    ).toEqual({
      mode: 'giliran',
      fallback: true,
      needsRotate: false,
    })
    expect(
      resolveLocalMode(CATALOG['ayo-berhitung'], 1, { w: 1366, h: 768 })
    ).toEqual({
      mode: 'solo',
      fallback: false,
      needsRotate: false,
    })
    expect(canPlayOnline(CATALOG['ayo-berhitung'], true)).toBe(true)
    expect(canPlayOnline(CATALOG['ayo-berhitung'], false)).toBe(false)
    expect(canPlayOnline(CATALOG['kartu-kembar'], true)).toBe(false)
  })

  it('splits only on tall-and-wide screens; phones take turns, portrait tablets rotate', () => {
    const entry = CATALOG['ayo-berhitung']
    const turns = { mode: 'giliran', fallback: true, needsRotate: false }
    expect(splitFits(entry, { w: 740, h: 360 })).toBe(false)
    expect(splitFits(entry, { w: 932, h: 430 })).toBe(false)
    expect(splitFits(entry, { w: 1024, h: 560 })).toBe(false)
    expect(splitFits(entry, { w: 1024, h: 768 })).toBe(true)
    expect(splitFits(entry, { w: 1366, h: 640 })).toBe(true)
    expect(resolveLocalMode(entry, 2, { w: 390, h: 844 })).toEqual(turns)
    expect(resolveLocalMode(entry, 2, { w: 740, h: 360 })).toEqual(turns)
    expect(resolveLocalMode(entry, 2, { w: 768, h: 1024 })).toEqual({
      mode: 'layar',
      fallback: false,
      needsRotate: true,
    })
    expect(
      resolveLocalMode(CATALOG['bunyi-awal'], 2, { w: 740, h: 360 })
    ).toEqual(turns)
  })

  it('homeGameList puts playable games first in code order', () => {
    const list = homeGameList((e) => e.id !== 'dengar-temukan')
    expect(list).toHaveLength(9)
    expect(list.at(-1)?.entry.id).toBe('dengar-temukan')
    expect(list.at(-1)?.playable).toBe(false)
    expect(list.slice(0, 8).map((i) => i.entry.code)).toEqual([
      'G01',
      'G02',
      'G03',
      'G04',
      'G05',
      'G07',
      'G08',
      'G09',
    ])
  })

  it('ships every game as ready (G07 unlocked 2026-11-27)', () => {
    expect(CATALOG_LIST.filter((e) => e.status !== 'ready').map((e) => e.id)).toEqual([])
  })
})
