import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useAudio } from '@/app/providers/useAudio'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RotatePrompt } from '@/components/RotatePrompt/RotatePrompt'
import { CATALOG, splitFits } from '@/games/catalog'
import { useViewport } from '@/lib/device/viewport'
import { useWakeLock } from '@/lib/device/wakeLock'
import { PlayerChip } from '@/components/Avatar/PlayerChip'
import { RaceBar } from '@/components/RaceBar/RaceBar'
import type { GameModule, RoundResult } from '@/games/types'
import { useT } from '@/i18n/useT'
import type { Profile } from '@/lib/profiles/profiles'
import {
  createInitialRaceState,
  raceReducer,
  raceWinner,
} from '@/lib/race/raceReducer'
import type { PlayerNumber, SessionConfig } from '@/lib/session/session'
import { MsZiya } from '@/worlds/characters/MsZiya'
import styles from './SplitPlay.module.css'

export interface SplitPlayFinish {
  readonly results: Record<PlayerNumber, readonly RoundResult[]>
  readonly scores: Record<PlayerNumber, number>
  readonly winner: 1 | 2 | 'seri' | null
}

export interface SplitPlayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogenous game round module
  readonly mod: GameModule<any>
  readonly roundsByPlayer: Record<PlayerNumber, readonly unknown[]>
  readonly config: SessionConfig
  readonly p1: Pick<Profile, 'name' | 'avatar' | 'color'>
  readonly p2: Pick<Profile, 'name' | 'avatar' | 'color'>
  readonly calmMotion: boolean
  readonly thickLines: boolean
  readonly onFinish: (info: SplitPlayFinish) => void
}

export function SplitPlay({
  mod,
  roundsByPlayer,
  config,
  p1,
  p2,
  calmMotion,
  thickLines,
  onFinish,
}: SplitPlayProps) {
  const audio = useAudio()
  useWakeLock(true)
  const vp = useViewport()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const t = useT()
  const [state, dispatch] = useReducer(
    raceReducer,
    calmMotion,
    createInitialRaceState
  )
  const [countNum, setCountNum] = useState(3)
  const [remainingSec, setRemainingSec] = useState(45)
  const finishedRef = useRef(false)
  const promptOpen = !splitFits(CATALOG[config.gameId], vp)
  const pausedAtRef = useRef<number | null>(null)

  // Turning the screen the wrong way pauses the race clock; the paused time is given back.
  useEffect(() => {
    if (promptOpen) {
      pausedAtRef.current = Date.now()
      return
    }
    if (pausedAtRef.current !== null) {
      dispatch({ type: 'EXTEND_LAST_CALL', ms: Date.now() - pausedAtRef.current })
      pausedAtRef.current = null
    }
  }, [promptOpen])

  useEffect(() => {
    if (state.status !== 'countdown' || promptOpen) return
    const id = window.setTimeout(() => {
      if (countNum > 1) setCountNum(countNum - 1)
      else dispatch({ type: 'GO' })
    }, 650)
    return () => window.clearTimeout(id)
  }, [state.status, countNum, promptOpen])

  useEffect(() => {
    if (state.status !== 'last-call' || state.lastCallEndsAt === null || promptOpen) return
    const deadline = state.lastCallEndsAt
    const interval = window.setInterval(() => {
      const now = Date.now()
      setRemainingSec(Math.max(0, Math.ceil((deadline - now) / 1000)))
      dispatch({ type: 'TICK', now })
    }, 250)
    return () => window.clearInterval(interval)
  }, [state.status, state.lastCallEndsAt, promptOpen])

  useEffect(() => {
    if (state.status !== 'finished' || finishedRef.current) return
    finishedRef.current = true
    audio.sfx('kids-yay')
    onFinish({
      results: { 1: state.players[1].results, 2: state.players[2].results },
      scores: { 1: state.players[1].score, 2: state.players[2].score },
      winner: raceWinner(state),
    })
  }, [audio, onFinish, state])

  const handleComplete = useCallback(
    (player: PlayerNumber, result: RoundResult) => {
      dispatch({
        type: 'ROUND_DONE',
        player,
        result,
        totalRounds: roundsByPlayer[player].length,
        now: Date.now(),
      })
    },
    [roundsByPlayer]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.__MSZ_TEST__) return
    if (typeof window.__MSZ_TEST__ !== 'object') {
      window.__MSZ_TEST__ = {}
    }
    window.__MSZ_TEST__.solveRound = (
      player?: 1 | 2,
      result?: Partial<RoundResult>
    ) => {
      const target: 1 | 2 = player ?? 1
      handleComplete(target, {
        firstTry: result?.firstTry ?? true,
        attempts: result?.attempts ?? 1,
      })
    }
    return () => {
      if (typeof window.__MSZ_TEST__ === 'object' && window.__MSZ_TEST__) {
        delete window.__MSZ_TEST__.solveRound
      }
    }
  }, [handleComplete])

  const RoundView = mod.Round

  const renderPane = (
    playerNum: PlayerNumber,
    profile: Pick<Profile, 'name' | 'avatar' | 'color'>
  ) => {
    const rp = state.players[playerNum]
    const done = rp.finishedAt !== null
    const round = roundsByPlayer[playerNum][rp.roundIndex]

    return (
      <section
        className={styles.pane}
        style={{ borderColor: `var(--player-${profile.color})` }}
        data-pane={playerNum}
        inert={promptOpen}
        aria-label={profile.name}
      >
        <div className={styles.paneHeader}>
          <PlayerChip profile={profile} selected compact />
          <span className={styles.scoreBadge}>
            {t('score.points', { score: rp.score })}
          </span>
        </div>

        <div className={styles.paneBody}>
          {done ? (
            <div className={styles.waitCard}>
              <MsZiya mood="wow" size={100} />
              <p className="t-title">{t('race.waitFriend')}</p>
            </div>
          ) : round !== undefined ? (
            <RoundView
              key={`${playerNum}-${rp.roundIndex}`}
              round={round}
              config={config}
              player={playerNum}
              roundIndex={rp.roundIndex}
              calmMotion={calmMotion}
              thickLines={thickLines}
              pane={{ side: playerNum === 1 ? 'left' : 'right', quiet: true }}
              onComplete={(res) => handleComplete(playerNum, res)}
            />
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <div className={styles.splitRoot}>
      {promptOpen && (
        <RotatePrompt
          canRotate={splitFits(CATALOG[config.gameId], { w: vp.h, h: vp.w })}
          onTurns={() => {
            const next = new URLSearchParams(searchParams)
            next.set('mode', 'giliran')
            navigate(`?${next.toString()}`, { replace: true })
          }}
        />
      )}
      {state.status === 'last-call' && (
        <div
          className={styles.lastCallBanner}
          role="status"
          data-last-call="true"
        >
          <span>{t('race.lastCall')}</span>
          <span className={styles.timer}>{remainingSec}s</span>
        </div>
      )}

      <div className={styles.splitGrid}>
        {renderPane(1, p1)}

        <div className={styles.divider}>
          <RaceBar
            orientation="vertical"
            total={roundsByPlayer[1].length}
            p1={{ ...p1, progress: state.players[1].roundIndex }}
            p2={{ ...p2, progress: state.players[2].roundIndex }}
          />
        </div>

        {renderPane(2, p2)}
      </div>

      {state.status === 'countdown' && (
        <div className={styles.countdown} role="status">
          <span className={styles.countdownNum}>{countNum}</span>
        </div>
      )}
    </div>
  )
}
