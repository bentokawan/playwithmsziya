import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAudio } from '@/app/providers/useAudio'
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar'
import { BlockButton } from '@/components/BlockButton/BlockButton'
import { GameCard } from '@/components/GameCard/GameCard'
import { Icon } from '@/components/icons/Icon'
import { StickerReveal } from '@/components/StickerReveal/StickerReveal'
import { CATALOG, homeGameList } from '@/games/catalog'
import { isGameId } from '@/games/ids'
import { useT } from '@/i18n/useT'
import { useContent } from '@/lib/content/useContent'
import { loadProfiles, type Profile } from '@/lib/profiles/profiles'
import {
  clearStoredRoom,
  getActiveRoomController,
} from '@/lib/room/roomSession'
import { buildSessionSearch, newSeed } from '@/lib/session/session'
import { readJSON } from '@/lib/storage/storage'
import { OUTCOME_STORAGE_KEY } from '@/pages/Play/PlayPage'
import { MsZiya } from '@/worlds/characters/MsZiya'
import styles from './ResultPage.module.css'
import { parseOutcome } from './parseOutcome'

export function ResultPage() {
  const { gameId = '' } = useParams()
  const navigate = useNavigate()
  const audio = useAudio()
  const { readiness } = useContent()
  const t = useT()

  const outcome = useMemo(
    () => readJSON('session', OUTCOME_STORAGE_KEY, parseOutcome),
    []
  )
  const profilesById = useMemo(() => {
    const map = new Map<string, Profile>()
    for (const p of loadProfiles()) map.set(p.id, p)
    return map
  }, [])

  const roomCtrl = getActiveRoomController()
  const roomPhase = useSyncExternalStore(
    (cb) => {
      if (!roomCtrl) return () => {}
      roomCtrl.listeners.add(cb)
      return () => {
        roomCtrl.listeners.delete(cb)
      }
    },
    () => roomCtrl?.snapshotCache.state.phase ?? null
  )

  const validOutcome =
    outcome && isGameId(gameId) && outcome.config.gameId === gameId
      ? outcome
      : null
  const entry = validOutcome ? CATALOG[validOutcome.config.gameId] : null
  const onlineFinal = validOutcome?.onlineFinal

  useEffect(() => {
    if (!validOutcome) {
      audio.setScene({ music: 'home', ambient: null })
      return
    }
    audio.setScene({ music: 'result-jingle', ambient: null, loop: false })
    audio.sfx('kids-cheer')
  }, [audio, validOutcome])

  // Follow rematch back to unified RoomLobby when host triggers rematch
  useEffect(() => {
    if (!onlineFinal || !roomCtrl || !entry) return
    if (roomPhase !== 'ready-check' && roomPhase !== 'waiting') return
    if (onlineFinal.role === 'host') {
      const qs = new URLSearchParams({ level: validOutcome.config.difficulty })
      if (validOutcome.config.profileIds[0])
        qs.set('p1', validOutcome.config.profileIds[0])
      navigate(`/game/${entry.id}/ruang?${qs.toString()}`, { replace: true })
    } else {
      navigate(`/gabung/${onlineFinal.roomCode}`, { replace: true })
    }
  }, [
    entry,
    navigate,
    onlineFinal,
    roomCtrl,
    roomPhase,
    validOutcome?.config.difficulty,
    validOutcome?.config.profileIds,
  ])

  const suggestions = useMemo(() => {
    if (!entry) return []
    const playable = homeGameList(
      (g) => g.status === 'ready' && readiness(g.id).ready
    )
      .filter((item) => item.playable && item.entry.id !== entry.id)
      .map((item) => item.entry)
    const sameWorld = playable.filter((g) => g.worldId === entry.worldId)
    const others = playable.filter((g) => g.worldId !== entry.worldId)
    return [...sameWorld, ...others].slice(0, 2)
  }, [entry, readiness])

  if (!validOutcome || !entry) {
    return (
      <main className={styles.page}>
        <h1 className="t-title">{t('result.empty.title')}</h1>
        <BlockButton
          variant="primary"
          size="choice"
          icon="home"
          label={t('result.empty.cta')}
          onPress={() => navigate('/home')}
        />
      </main>
    )
  }

  const leaveRoomAndGo = (dest: string) => {
    if (onlineFinal) {
      roomCtrl?.leave()
      clearStoredRoom()
    }
    navigate(dest)
  }

  const handlePlayAgain = () => {
    if (onlineFinal) {
      if (onlineFinal.role === 'host' && roomCtrl) {
        roomCtrl.rematch()
      } else {
        leaveRoomAndGo(`/game/${entry.id}/intro`)
      }
      return
    }
    const search = buildSessionSearch({
      ...validOutcome.config,
      seed: newSeed(),
    })
    navigate(`/game/${entry.id}/play?${search}`)
  }

  const localOutcome = validOutcome.players[0]

  const hostPlayer = onlineFinal
    ? onlineFinal.role === 'host'
      ? onlineFinal.localPlayer
      : onlineFinal.peerPlayer
    : null
  const guestPlayer = onlineFinal
    ? onlineFinal.role === 'guest'
      ? onlineFinal.localPlayer
      : onlineFinal.peerPlayer
    : null

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <MsZiya mood="wow" size={140} />
        <h1 className="t-title">{t('result.great')}</h1>
      </div>

      {onlineFinal && hostPlayer && guestPlayer ? (
        <div className={styles.onlineFinalWrap} data-final="true">
          {onlineFinal.reason === 'peer-gone' && (
            <p className={`t-body ${styles.peerGoneNote}`}>
              {t('room.peerGoneResult')}
            </p>
          )}
          <div className={styles.stickers}>
            {(
              [
                {
                  side: 'host' as const,
                  player: hostPlayer,
                  score: onlineFinal.scores.host,
                },
                {
                  side: 'guest' as const,
                  player: guestPlayer,
                  score: onlineFinal.scores.guest,
                },
              ] as const
            ).map((entryRow) => {
              const isWinner =
                onlineFinal.reason !== 'peer-gone' &&
                onlineFinal.winner === entryRow.side
              return (
                <div key={entryRow.side} className={styles.podiumCard}>
                  {isWinner && (
                    <span
                      className={styles.crown}
                      aria-label={t('race.winner')}
                      data-crown="true"
                    >
                      <Icon name="crown" size={32} />
                    </span>
                  )}
                  <div className={styles.playerTag}>
                    <span
                      className={styles.playerAvatar}
                      style={{
                        background: `var(--player-${entryRow.player.color})`,
                      }}
                    >
                      <AnimalAvatar animal={entryRow.player.avatar} size={36} />
                    </span>
                    <span className={styles.playerName}>
                      {entryRow.player.name}
                    </span>
                  </div>
                  <div className={styles.scoreRow}>
                    <span className={styles.scoreText}>
                      {t('score.points', { score: entryRow.score })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {localOutcome && (
            <StickerReveal
              stickerId={localOutcome.stickerId}
              isNew={localOutcome.stickerIsNew}
            />
          )}
        </div>
      ) : (
        <div className={styles.stickers}>
          {validOutcome.players.map((p) => {
            const prof = p.profileId ? profilesById.get(p.profileId) : undefined
            const stars = p.stars ?? 3
            return (
              <div key={p.player} className={styles.podiumCard}>
                {p.won && (
                  <span
                    className={styles.crown}
                    aria-label={t('race.winner')}
                    data-crown="true"
                  >
                    <Icon name="crown" size={32} />
                  </span>
                )}

                {prof && (
                  <div className={styles.playerTag}>
                    <span
                      className={styles.playerAvatar}
                      style={{ background: `var(--player-${prof.color})` }}
                    >
                      <AnimalAvatar animal={prof.avatar} size={36} />
                    </span>
                    <span className={styles.playerName}>{prof.name}</span>
                  </div>
                )}

                {p.score !== undefined && (
                  <div className={styles.scoreRow}>
                    <span
                      className={styles.stars}
                      aria-label={t('leaderboard.stars', { n: stars })}
                    >
                      {Array.from({ length: stars }, (_, idx) => (
                        <Icon key={idx} name="star" size={24} />
                      ))}
                    </span>
                    <span className={styles.scoreText}>
                      {t('score.points', { score: p.score })}
                    </span>
                  </div>
                )}

                {p.profileId && (
                  <span className={styles.chip}>
                    {p.improvement && p.improvement > 0
                      ? t('score.gain', { n: p.improvement })
                      : p.isPersonalBest
                        ? t('score.newRecord')
                        : t('score.playAgainChip')}
                  </span>
                )}

                <StickerReveal stickerId={p.stickerId} isNew={p.stickerIsNew} />
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.actions}>
        {onlineFinal && onlineFinal.role === 'guest' && roomCtrl ? (
          <BlockButton
            variant="white"
            size="primary"
            icon="play"
            label={t('room.playAgainWaitHost')}
            disabled
            onPress={() => {}}
          />
        ) : (
          <BlockButton
            variant="primary"
            size="primary"
            icon="play"
            label={t('result.again')}
            onPress={handlePlayAgain}
          />
        )}
        <BlockButton
          variant="white"
          size="choice"
          icon="trophy"
          label={t('nav.leaderboard')}
          onPress={() =>
            leaveRoomAndGo(
              `/peringkat?game=${entry.id}&level=${validOutcome.config.difficulty}`
            )
          }
        />
        <BlockButton
          variant="white"
          size="choice"
          icon="home"
          label={t('nav.home')}
          onPress={() => leaveRoomAndGo('/home')}
        />
      </div>

      {suggestions.length > 0 && (
        <section className={styles.moreSection} aria-label={t('result.more')}>
          <h2 className="t-body">{t('result.more')}</h2>
          <div className={styles.moreRow}>
            {suggestions.map((g) => (
              <GameCard
                key={g.id}
                entry={g}
                isReady
                layout="compact"
                onOpen={(target) => leaveRoomAndGo(`/game/${target.id}/intro`)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
