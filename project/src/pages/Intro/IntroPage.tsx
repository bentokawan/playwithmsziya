import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAudio } from '@/app/providers/useAudio'
import { usePreferences } from '@/app/providers/usePreferences'
import { BlockButton } from '@/components/BlockButton/BlockButton'
import { Dialog } from '@/components/Dialog/Dialog'
import { LevelPicker } from '@/components/LevelPicker/LevelPicker'
import { ObjectImage } from '@/components/ObjectImage/ObjectImage'
import { PlaceChooser, type PlayPlace } from '@/components/Roster/PlaceChooser'
import { PlayerSlots } from '@/components/Roster/PlayerSlots'
import { Scene } from '@/components/Scene/Scene'
import { TopNav } from '@/components/TopNav/TopNav'
import { DUR, EASE_OUT_SOFT } from '@/design/motion'
import { useCalmMotion } from '@/design/useCalmMotion'
import { canPlayOnline, CATALOG, resolveLocalMode } from '@/games/catalog'
import { isGameId } from '@/games/ids'
import { useT } from '@/i18n/useT'
import { useContent } from '@/lib/content/useContent'
import {
  activeProfiles,
  addProfile,
  loadProfiles,
  saveProfiles,
  type Profile,
  type ProfileInput,
} from '@/lib/profiles/profiles'
import { isOnlineConfigured } from '@/lib/room/online'
import { useViewport } from '@/lib/device/viewport'
import {
  buildSessionSearch,
  newSeed,
  parseSessionConfig,
  type DifficultyId,
} from '@/lib/session/session'
import { readJSON, writeJSON } from '@/lib/storage/storage'
import { WORLDS } from '@/worlds/worlds'
import styles from './IntroPage.module.css'

const INTRO_LAST_KEY = 'msz:intro:last'

const GamePreview = lazy(() => import('@/components/GamePreview/GamePreview'))

interface IntroLastV2 {
  readonly schemaVersion: 2
  readonly place: PlayPlace
  readonly count: 1 | 2
  readonly ids: readonly (string | null)[]
}

function parseIntroLast(raw: unknown): IntroLastV2 | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>

  if (obj.schemaVersion === 2) {
    const place = obj.place === 'dua' ? 'dua' : 'satu'
    const count: 1 | 2 = obj.count === 2 ? 2 : 1
    const rawIds = Array.isArray(obj.ids) ? obj.ids : []
    const ids: [string | null, string | null] = [
      typeof rawIds[0] === 'string' ? rawIds[0] : null,
      typeof rawIds[1] === 'string' ? rawIds[1] : null,
    ]
    return { schemaVersion: 2, place, count, ids }
  }

  // Upgrade v1 intro state gracefully to v2 with place: 'satu'
  if (obj.schemaVersion === 1 && Array.isArray(obj.selectedIds)) {
    const filtered = obj.selectedIds.filter(
      (x): x is string => typeof x === 'string'
    )
    return {
      schemaVersion: 2,
      place: 'satu',
      count: filtered.length >= 2 ? 2 : 1,
      ids: [filtered[0] ?? null, filtered[1] ?? null],
    }
  }

  return null
}

export function IntroPage() {
  const { gameId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const audio = useAudio()
  const { prefs } = usePreferences()
  const { readiness } = useContent()
  const calm = useCalmMotion()
  const t = useT()

  const validId = isGameId(gameId) ? gameId : null
  const entry = validId ? CATALOG[validId] : null
  const playable = Boolean(
    validId && entry && entry.status === 'ready' && readiness(validId).ready
  )

  const [allProfiles, setAllProfiles] = useState<Profile[]>(() =>
    loadProfiles()
  )
  const profiles = useMemo(() => activeProfiles(allProfiles), [allProfiles])
  const knownIds = useMemo(() => new Set(profiles.map((p) => p.id)), [profiles])

  const parsed = useMemo(
    () =>
      validId ? parseSessionConfig(validId, searchParams, knownIds) : null,
    [validId, searchParams, knownIds]
  )

  const viewport = useViewport()
  const compactHero = viewport.w < 700 || viewport.h < 480

  const onlineConfigured = isOnlineConfigured()
  const onlineSupported = Boolean(
    entry && canPlayOnline(entry, onlineConfigured)
  )

  const savedLast = useMemo(
    () => readJSON('local', INTRO_LAST_KEY, parseIntroLast),
    []
  )
  const [place, setPlace] = useState<PlayPlace>(() =>
    savedLast?.place === 'dua' && onlineSupported ? 'dua' : 'satu'
  )
  const [count, setCount] = useState<1 | 2>(savedLast?.count ?? 1)
  const [slotIds, setSlotIds] = useState<[string | null, string | null]>(() => {
    const s0 =
      savedLast?.ids[0] && knownIds.has(savedLast.ids[0])
        ? savedLast.ids[0]
        : null
    const s1 =
      savedLast?.ids[1] && knownIds.has(savedLast.ids[1])
        ? savedLast.ids[1]
        : null
    return [s0, s1]
  })
  const [level, setLevel] = useState<DifficultyId>(
    parsed?.difficulty ?? 'mudah'
  )
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const activePlace: PlayPlace = onlineSupported ? place : 'satu'

  useEffect(() => {
    writeJSON('local', INTRO_LAST_KEY, {
      schemaVersion: 2,
      place: activePlace,
      count,
      ids: slotIds,
    })
  }, [activePlace, count, slotIds])

  useEffect(() => {
    if (!entry) return
    const w = WORLDS[entry.worldId]
    audio.setScene({ music: w.music, ambient: w.ambient })
  }, [audio, entry])

  if (!validId || !entry || !playable) {
    return (
      <main className={styles.notFound}>
        <h1 className="t-title">{t('notFound.title')}</h1>
        <BlockButton
          variant="primary"
          size="choice"
          icon="home"
          label={t('nav.home')}
          onPress={() => navigate('/home')}
        />
      </main>
    )
  }

  const localResolution = resolveLocalMode(entry, count, viewport)

  const handlePickSlot = (slot: 0 | 1, id: string | null) => {
    setSlotIds((prev) => {
      const next: [string | null, string | null] = [...prev] as [
        string | null,
        string | null,
      ]
      next[slot] = id
      const other = slot === 0 ? 1 : 0
      if (id && next[other] === id) {
        next[other] = null
      }
      return next
    })
  }

  const handleAddProfile = (input: ProfileInput): Profile | null => {
    const res = addProfile(allProfiles, input)
    if ('list' in res) {
      saveProfiles(res.list)
      setAllProfiles(res.list)
      return res.profile
    }
    return null
  }

  const handleStartLocal = () => {
    if (localResolution.needsRotate) {
      try {
        void screen.orientation?.lock?.('landscape').catch(() => {})
      } catch {
        /* orientation lock is optional */
      }
    }
    const search = buildSessionSearch({
      gameId: validId,
      difficulty: level,
      mode: localResolution.mode,
      players: count,
      profileIds: [
        slotIds[0] ?? undefined,
        count === 2 ? (slotIds[1] ?? undefined) : undefined,
      ],
      locale: prefs.locale ?? 'id',
      seed: newSeed(),
    })
    navigate(`/game/${validId}/play?${search}`)
  }

  const handleCreateRoom = () => {
    const qs = new URLSearchParams({ level })
    if (slotIds[0]) qs.set('p1', slotIds[0])
    navigate(`/game/${validId}/ruang?${qs.toString()}`)
  }

  return (
    <Scene worldId={entry.worldId}>
      <TopNav onBack={() => navigate('/home')} />

      <main className={styles.main}>
        <section
          className={styles.layout}
          aria-label={t(`game.${validId}.title`)}
        >
          <m.div
            className={styles.hero}
            initial={calm ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              calm ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT_SOFT }
            }
          >
            {compactHero ? (
              <div className={styles.heroIcon} data-preview="static">
                <ObjectImage objectId={entry.icon} size={56} decorative />
              </div>
            ) : (
              <div className={styles.heroStage}>
                <Suspense
                  fallback={
                    <div className={styles.heroIcon} data-preview="static">
                      <ObjectImage objectId={entry.icon} size={96} decorative />
                    </div>
                  }
                >
                  <GamePreview gameId={validId} level={level} />
                </Suspense>
              </div>
            )}

            <div className={styles.heroCopy}>
              <div className={styles.titleRow}>
                <h1 className={`t-title ${styles.title}`}>
                  {t(`game.${validId}.title`)}
                </h1>
                <button
                  type="button"
                  className={styles.helpBtn}
                  aria-label={t('intro.forGrownUps')}
                  onClick={() => setInfoOpen(true)}
                >
                  ?
                </button>
              </div>
              <p className={styles.tagline}>{t(`game.${validId}.tagline`)}</p>
            </div>
          </m.div>

          <m.div
            className={styles.setup}
            initial={calm ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              calm
                ? { duration: 0 }
                : { duration: DUR.base, delay: 0.08, ease: EASE_OUT_SOFT }
            }
          >
            {onlineSupported && (
              <div className={styles.group}>
                <h2 className={styles.groupHeading}>
                  <span>{t('intro.whereToPlay')}</span>
                </h2>
                <PlaceChooser
                  value={activePlace}
                  onChange={(nextPlace) => {
                    setPlace(nextPlace)
                    setCreatingRoom(false)
                  }}
                  online={onlineSupported}
                />
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {activePlace === 'satu' ? (
                <m.div
                  key="place-satu"
                  className={styles.setupGroup}
                  initial={calm ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={calm ? undefined : { opacity: 0, y: -6 }}
                  transition={
                    calm
                      ? { duration: 0 }
                      : { duration: DUR.fast, ease: EASE_OUT_SOFT }
                  }
                >
                  <div className={styles.group}>
                    <h2 className={styles.groupHeading}>
                      <span>{t('intro.whoPlays')}</span>
                    </h2>
                    <PlayerSlots
                      count={count}
                      onCount={setCount}
                      ids={slotIds}
                      onPick={handlePickSlot}
                      profiles={profiles}
                      allProfiles={allProfiles}
                      onAddProfile={handleAddProfile}
                    />
                    {localResolution.fallback && (
                      <p
                        className={styles.fallbackNote}
                        data-fallback-note="true"
                      >
                        {t('intro.turnsFallback')}
                      </p>
                    )}
                    {localResolution.needsRotate && (
                      <p className={styles.fallbackNote}>
                        {t('intro.rotateHint')}
                      </p>
                    )}
                  </div>

                  <div className={styles.group}>
                    <h2 className={styles.groupHeading}>
                      <span>{t('intro.level')}</span>
                    </h2>
                    <LevelPicker
                      value={level}
                      onChange={setLevel}
                      size="compact"
                    />
                  </div>

                  <m.div
                    className={styles.startWrap}
                    animate={calm ? undefined : { scale: [1, 1.02, 1] }}
                    transition={
                      calm
                        ? undefined
                        : { duration: 1.2, delay: 1.5, repeat: 2, ease: 'easeInOut' }
                    }
                  >
                    <BlockButton
                      variant="primary"
                      size="primary"
                      icon="play"
                      label={
                        count === 2 ? t('intro.startBoth') : t('intro.start')
                      }
                      onPress={handleStartLocal}
                      className={styles.start}
                    />
                  </m.div>
                </m.div>
              ) : (
                <m.div
                  key="place-dua"
                  className={styles.setupGroup}
                  initial={calm ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={calm ? undefined : { opacity: 0, y: -6 }}
                  transition={
                    calm
                      ? { duration: 0 }
                      : { duration: DUR.fast, ease: EASE_OUT_SOFT }
                  }
                >
                  <div className={styles.group}>
                    <h2 className={styles.groupHeading}>
                      <span>{t('intro.myProfile')}</span>
                    </h2>
                    <PlayerSlots
                      count={1}
                      onCount={() => {}}
                      ids={[slotIds[0]]}
                      onPick={(_, id) => handlePickSlot(0, id)}
                      profiles={profiles}
                      allProfiles={allProfiles}
                      onAddProfile={handleAddProfile}
                      singleProfileOnly
                    />
                    <div className={styles.onlineActions}>
                      <BlockButton
                        variant={creatingRoom ? 'primary' : 'white'}
                        size="choice"
                        icon="play"
                        label={t('intro.createRoom')}
                        onPress={() => setCreatingRoom(true)}
                      />
                      <BlockButton
                        variant="white"
                        size="choice"
                        icon="link"
                        label={t('intro.joinRoom')}
                        onPress={() => navigate('/gabung')}
                      />
                    </div>
                  </div>

                  {creatingRoom && (
                    <>
                      <div className={styles.group}>
                        <h2 className={styles.groupHeading}>
                          <span>{t('intro.level')}</span>
                        </h2>
                        <LevelPicker value={level} onChange={setLevel} />
                      </div>
                      <div className={styles.startWrap}>
                        <BlockButton
                          variant="primary"
                          size="primary"
                          icon="play"
                          label={t('intro.createRoom')}
                          onPress={handleCreateRoom}
                          className={styles.start}
                        />
                      </div>
                    </>
                  )}
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </section>

        <Dialog
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          labelledBy="intro-grownups-title"
        >
          <div className={styles.dialogBody}>
            <h2
              id="intro-grownups-title"
              className={`t-title ${styles.dialogTitle}`}
            >
              {t('intro.forGrownUps')}
            </h2>
            <p className="t-body">{t(`game.${validId}.howTo`)}</p>
            <p className="t-body">
              <strong>{`${t('intro.skills')}: `}</strong>
              {t(`game.${validId}.skills`)}
            </p>
            {entry.mechanic === 'tracing' && (
              <p className="t-body">{t('game.tracing.a11yNote')}</p>
            )}
            <div className={styles.dialogActions}>
              <BlockButton
                variant="primary"
                size="choice"
                label={t('parents.close')}
                onPress={() => setInfoOpen(false)}
              />
            </div>
          </div>
        </Dialog>
      </main>
    </Scene>
  )
}
