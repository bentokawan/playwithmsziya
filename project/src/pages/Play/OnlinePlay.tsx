import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudio } from '@/app/providers/useAudio'
import { BlockButton } from '@/components/BlockButton/BlockButton'
import { RaceBar } from '@/components/RaceBar/RaceBar'
import type { GameModule, OnlineFinalOutcome, RoundResult } from '@/games/types'
import { useT } from '@/i18n/useT'
import { useWakeLock } from '@/lib/device/wakeLock'
import { useContent } from '@/lib/content/useContent'
import {
  contentFingerprint,
  LAST_CALL_MS,
  RECONNECT_GRACE_MS,
  type RoomPlayerInfo,
} from '@/lib/room/protocol'
import {
  clearStoredRoom,
  getActiveRoomController,
  loadStoredRoom,
  type StoredLocalProgress,
} from '@/lib/room/roomSession'
import { useRoomSession } from '@/lib/room/useRoomSession'
import { scoreSession } from '@/lib/scores/scoring'
import type { SessionConfig } from '@/lib/session/session'
import { MsZiya } from '@/worlds/characters/MsZiya'
import styles from './OnlinePlay.module.css'

export interface OnlinePlayFinish {
  readonly results: readonly RoundResult[]
  readonly onlineFinal: OnlineFinalOutcome
}

export interface OnlinePlayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogenous game round module
  readonly mod: GameModule<any>
  readonly rounds: readonly unknown[]
  readonly config: SessionConfig
  readonly calmMotion: boolean
  readonly thickLines: boolean
  readonly onFinish: (info: OnlinePlayFinish) => void
}

function ActiveOnlinePlay({
  mod,
  rounds,
  config,
  calmMotion,
  thickLines,
  code,
  role,
  localPlayer,
  profileId,
  restore,
  initialProgress,
  onFinish,
}: OnlinePlayProps & {
  readonly code: string
  readonly role: 'host' | 'guest'
  readonly localPlayer: RoomPlayerInfo
  readonly profileId?: string
  readonly restore: ReturnType<typeof loadStoredRoom>
  readonly initialProgress: StoredLocalProgress
}) {
  const audio = useAudio()
  const { content } = useContent()
  const t = useT()

  const fingerprint = useMemo(() => contentFingerprint(content), [content])
  const session = useRoomSession({
    code,
    role,
    me: localPlayer,
    content: fingerprint,
    profileId,
    restore,
  })
  const { state, connStatus, reportLocal } = session
  useWakeLock(state.phase === 'playing' || state.phase === 'countdown')

  const [localProg, setLocalProg] =
    useState<StoredLocalProgress>(initialProgress)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const startedAtRef = useRef<number | null>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now() - initialProgress.elapsedMs
    }
  }, [initialProgress.elapsedMs])

  useEffect(() => {
    const needsTimer =
      state.firstFinishedAt !== null ||
      (state.peer !== null && !state.peer.connected)
    if (!needsTimer) return
    const id = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [state.firstFinishedAt, state.peer])

  const fallbackPeer: RoomPlayerInfo = useMemo(
    () => ({
      name: role === 'host' ? t('play.player2') : t('play.player1'),
      avatar: role === 'host' ? 'kucing' : 'kelinci',
      color: role === 'host' ? 'merah-muda' : 'biru',
    }),
    [role, t]
  )
  const peerPlayer = state.peer?.player ?? fallbackPeer

  useEffect(() => {
    if (state.phase !== 'final' || !state.final || finishedRef.current) return
    finishedRef.current = true
    audio.sfx('kids-yay')
    onFinish({
      results: localProg.results,
      onlineFinal: {
        scores: state.final.scores,
        winner: state.final.winner,
        reason: state.final.reason,
        role: state.role,
        roomCode: state.code,
        localPlayer,
        peerPlayer,
      },
    })
  }, [audio, localPlayer, localProg.results, onFinish, peerPlayer, state])

  const handleLocalRoundComplete = useCallback(
    (result: RoundResult) => {
      const nextResults = [...localProg.results, result]
      const nextRoundIndex = nextResults.length
      const nextScore = scoreSession(nextResults).score
      const elapsedMs =
        startedAtRef.current !== null
          ? Math.max(0, Date.now() - startedAtRef.current)
          : 0
      const nextProg: StoredLocalProgress = {
        roundIndex: nextRoundIndex,
        results: nextResults,
        elapsedMs,
      }
      setLocalProg(nextProg)

      const matchId = state.match?.matchId ?? config.seed.toString(36)
      reportLocal(
        {
          matchId,
          roundsDone: nextRoundIndex,
          score: nextScore,
          finished: nextRoundIndex >= rounds.length,
          elapsedMs,
        },
        nextProg
      )
    },
    [
      config.seed,
      localProg.results,
      reportLocal,
      rounds.length,
      state.match?.matchId,
    ]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.__MSZ_TEST__) return
    if (typeof window.__MSZ_TEST__ !== 'object') {
      window.__MSZ_TEST__ = {}
    }
    window.__MSZ_TEST__.solveRound = (
      _player?: 1 | 2,
      result?: { firstTry?: boolean; attempts?: number }
    ) => {
      handleLocalRoundComplete({
        firstTry: result?.firstTry ?? true,
        attempts: result?.attempts ?? 1,
      })
    }
    return () => {
      if (typeof window.__MSZ_TEST__ === 'object' && window.__MSZ_TEST__) {
        delete window.__MSZ_TEST__.solveRound
      }
    }
  }, [handleLocalRoundComplete])

  const RoundView = mod.Round
  const localDone = localProg.roundIndex >= rounds.length
  const currentRound = rounds[localProg.roundIndex]
  const peerSnap = state.peer?.snap ?? null

  const graceRemainingSec =
    state.peer && !state.peer.connected && state.peer.lostAt !== null
      ? Math.max(
          0,
          Math.ceil((state.peer.lostAt + RECONNECT_GRACE_MS - nowMs) / 1000)
        )
      : undefined

  const lastCallRemainingSec =
    state.firstFinishedAt !== null
      ? Math.max(
          0,
          Math.ceil((state.firstFinishedAt + LAST_CALL_MS - nowMs) / 1000)
        )
      : null

  return (
    <div className={styles.root}>
      {connStatus === 'reconnecting' && (
        <div
          className={styles.toast}
          role="status"
          data-self-reconnecting="true"
        >
          {t('room.reconnectingSelf')}
        </div>
      )}

      <div className={styles.topBar}>
        <RaceBar
          orientation="horizontal"
          total={rounds.length}
          p1={{ ...localPlayer, progress: localProg.roundIndex }}
          p2={{ ...peerPlayer, progress: peerSnap?.roundsDone ?? 0 }}
          peerStatus={
            state.peer
              ? { connected: state.peer.connected, graceRemainingSec }
              : { connected: false }
          }
        />
      </div>

      {lastCallRemainingSec !== null && (
        <div className={styles.lastCall} role="status">
          <span>{t('race.lastCall')}</span>
          <span>{lastCallRemainingSec}s</span>
        </div>
      )}

      <div className={styles.body}>
        {localDone ? (
          <div className={styles.waitCard}>
            <MsZiya mood="wow" size={110} />
            <p className="t-title">{t('race.waitFriend')}</p>
            <p className="t-body">
              {peerPlayer.name}:{' '}
              {t('score.points', { score: peerSnap?.score ?? 0 })}
            </p>
          </div>
        ) : currentRound !== undefined ? (
          <RoundView
            key={`online-${localProg.roundIndex}`}
            round={currentRound}
            config={config}
            player={1}
            roundIndex={localProg.roundIndex}
            calmMotion={calmMotion}
            thickLines={thickLines}
            onComplete={handleLocalRoundComplete}
          />
        ) : null}
      </div>
    </div>
  )
}

export function OnlinePlay(props: OnlinePlayProps) {
  const navigate = useNavigate()
  const t = useT()

  const [boot] = useState(() => {
    const active = getActiveRoomController()
    if (active && active.state.phase !== 'closed') {
      return {
        valid: true as const,
        code: active.state.code,
        role: active.state.role,
        localPlayer: active.opts.me,
        profileId: active.opts.profileId,
        restore: null,
        initialProgress: active.localProgress ?? {
          roundIndex: 0,
          results: [],
          elapsedMs: 0,
        },
      }
    }

    const stored = loadStoredRoom()
    if (stored && stored.match && stored.match.seed === props.config.seed) {
      return {
        valid: true as const,
        code: stored.code,
        role: stored.role,
        localPlayer: stored.localPlayer,
        profileId: stored.profileId,
        restore: stored,
        initialProgress: stored.local ?? {
          roundIndex: 0,
          results: [],
          elapsedMs: 0,
        },
      }
    }

    return { valid: false as const }
  })

  if (!boot.valid) {
    return (
      <div className={styles.body}>
        <div className={styles.waitCard}>
          <MsZiya mood="thinking" size={96} />
          <p className="t-title">{t('room.sessionEnded')}</p>
          <BlockButton
            variant="primary"
            size="choice"
            icon="home"
            label={t('nav.home')}
            onPress={() => {
              clearStoredRoom()
              navigate('/home')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <ActiveOnlinePlay
      {...props}
      code={boot.code}
      role={boot.role}
      localPlayer={boot.localPlayer}
      profileId={boot.profileId}
      restore={boot.restore}
      initialProgress={boot.initialProgress}
    />
  )
}
