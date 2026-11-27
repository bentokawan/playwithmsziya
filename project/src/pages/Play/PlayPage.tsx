import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { usePreferences } from '@/app/providers/usePreferences';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { ConfirmExit } from '@/components/ConfirmExit/ConfirmExit';
import { CountdownPill } from '@/components/CountdownPill/CountdownPill';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { RoundDots } from '@/components/RoundDots/RoundDots';
import { Scene } from '@/components/Scene/Scene';
import { TopNav } from '@/components/TopNav/TopNav';
import { TurnBanner } from '@/components/TurnBanner/TurnBanner';
import { DUR, EASE_OUT_SOFT } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { CATALOG } from '@/games/catalog';
import { isGameId } from '@/games/ids';
import type { GameModule, PlayerOutcome, RoundResult, SessionOutcome } from '@/games/types';
import { useT } from '@/i18n/useT';
import { useContent } from '@/lib/content/useContent';
import { useViewport } from '@/lib/device/viewport';
import { activeProfiles, loadProfiles, type Profile } from '@/lib/profiles/profiles';
import { createRng } from '@/lib/random/rng';
import { createPlayerRounds } from '@/lib/random/roundSeeds';
import { clearStoredRoom, getActiveRoomController } from '@/lib/room/roomSession';
import { appendRecord } from '@/lib/scores/records';
import { scoreSession, starsFor } from '@/lib/scores/scoring';
import { parseSessionConfig, type PlayerNumber } from '@/lib/session/session';
import { awardSticker, loadStickers, saveStickers } from '@/lib/stickers/stickers';
import { writeJSON } from '@/lib/storage/storage';
import { resolveSessionDurationMs, TIME_LIMIT_MS } from '@/lib/timer/countdown';
import { useCountdown } from '@/lib/timer/useCountdown';
import { WORLDS } from '@/worlds/worlds';
import styles from './PlayPage.module.css';
import { INITIAL_PLAY_STATE, playReducer } from './playReducer';
import { OnlinePlay } from './OnlinePlay';
import { SplitPlay, type SplitPlayFinish } from './SplitPlay';
import { buildTurnQueue } from './turns';

export const OUTCOME_STORAGE_KEY = 'msz:outcome';

export function PlayPage() {
  const { gameId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const audio = useAudio();
  const { prefs } = usePreferences();
  const { content } = useContent();
  const calm = useCalmMotion();
  const vp = useViewport();
  const t = useT();

  const validId = isGameId(gameId) ? gameId : null;
  const entry = validId ? CATALOG[validId] : null;
  const profilesById = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const p of activeProfiles(loadProfiles())) map.set(p.id, p);
    return map;
  }, []);

  const config = useMemo(() => {
    if (!validId) return null;
    return parseSessionConfig(validId, searchParams, new Set(profilesById.keys()));
  }, [validId, searchParams, profilesById]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogenous loaded GameModule
  const [mod, setMod] = useState<GameModule<any> | null>(null);
  const [state, dispatch] = useReducer(playReducer, INITIAL_PLAY_STATE);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [timeUpOverlay, setTimeUpOverlay] = useState(false);
  const finalizedRef = useRef(false);
  const timeUpTimerRef = useRef<number | null>(null);
  const lastTickSecRef = useRef<number | null>(null);

  useEffect(() => {
    if (!entry) return;
    const w = WORLDS[entry.worldId];
    audio.setScene({ music: w.music, ambient: w.ambient });
  }, [audio, entry]);

  useEffect(() => {
    if (!entry || entry.status !== 'ready') {
      dispatch({ type: 'LOAD_FAILED' });
      return;
    }
    let active = true;
    void entry
      .load()
      .then((loaded) => {
        if (!active) return;
        setMod(loaded.default);
        dispatch({ type: 'LOADED' });
      })
      .catch(() => {
        if (active) dispatch({ type: 'LOAD_FAILED' });
      });
    return () => {
      active = false;
    };
  }, [entry]);

  const { roundsByPlayer, turns } = useMemo(() => {
    if (!mod || !config) {
      const empty: Record<PlayerNumber, readonly unknown[]> = { 1: [], 2: [] };
      return { roundsByPlayer: empty, turns: [] };
    }
    const pair = createPlayerRounds(mod, config, content);
    const q = buildTurnQueue(config.players, pair[1].length, mod.turnMode);
    return { roundsByPlayer: pair, turns: q };
  }, [mod, config, content]);

  const roundsP1 = roundsByPlayer[1];
  const roundsP2 = roundsByPlayer[2];

  useEffect(() => {
    if (!mod?.speechFor || !config || roundsP1.length === 0) return;
    const allRounds = config.players === 2 ? [...roundsP1, ...roundsP2] : roundsP1;
    const clips = allRounds.flatMap((r) => mod.speechFor?.(r, config) ?? []);
    if (clips.length > 0) {
      audio.preloadSpeech(clips);
    }
  }, [audio, mod, config, roundsP1, roundsP2]);

  useEffect(() => {
    if (state.status !== 'turn-banner' || !config) return;
    audio.sfx('turn');
    void audio.speak({ kind: 'phrase', locale: config.locale, key: 'your-turn' });
    if (vp.w < 600) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'BANNER_DONE' });
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [audio, config, state.status, vp.w]);

  const finalizeSession = useCallback(
    (
      resultsByPlayer: Record<PlayerNumber, readonly RoundResult[]>,
      winner?: 1 | 2 | 'seri' | null,
      onlineFinal?: SessionOutcome['onlineFinal'],
      speedBonusByPlayer?: Partial<Record<PlayerNumber, number>>,
    ) => {
      if (!config || !entry || finalizedRef.current) return;
      finalizedRef.current = true;

      const rng = createRng(config.seed);
      const owned = loadStickers();
      const playerNums: readonly PlayerNumber[] = config.players === 2 ? [1, 2] : [1];
      const finishedAt = new Date().toISOString();
      const playersOutcome: PlayerOutcome[] = [];

      const memoryRes = resultsByPlayer[1][0]?.perPlayer;
      const totalPairs = memoryRes
        ? (memoryRes[1] ?? 0) + (memoryRes[2] ?? 0)
        : undefined;

      for (const p of playerNums) {
        const pResults = resultsByPlayer[p];
        const profileId = config.profileIds[p - 1];
        const awarded = awardSticker(owned, entry.worldId, rng);
        if (awarded.isNew) owned.push(awarded.stickerId);

        const plannedRounds = roundsByPlayer[p].length;
        const scored = memoryRes
          ? scoreSession([], memoryRes[p] ?? 0, totalPairs ?? 0)
          : scoreSession(pResults, undefined, undefined, plannedRounds);
        const speedBonus = Math.max(0, speedBonusByPlayer?.[p] ?? 0);
        const finalScore = scored.score + speedBonus;
        const finalMaxScore = scored.maxScore;
        const stars = starsFor(finalScore, scored.maxScore);
        const won =
          winner === 1 || winner === 2 ? winner === p : undefined;

        let isPersonalBest: boolean | undefined;
        let improvement: number | undefined;
        if (profileId) {
          const rec = appendRecord({
            profileId,
            gameId: config.gameId,
            difficulty: config.difficulty,
            mode: config.mode,
            score: finalScore,
            maxScore: finalMaxScore,
            firstTryCount: pResults.filter((r) => r.firstTry).length,
            rounds: pResults.length,
            finishedAt,
            ...(won !== undefined ? { won } : {}),
          });
          isPersonalBest = rec.isPersonalBest;
          improvement = rec.improvement;
        }

        playersOutcome.push({
          player: p,
          ...(profileId ? { profileId } : {}),
          roundsCompleted: pResults.length,
          firstTryCount: pResults.filter((r) => r.firstTry).length,
          score: finalScore,
          maxScore: finalMaxScore,
          ...(speedBonus > 0 ? { speedBonus } : {}),
          stars,
          ...(isPersonalBest !== undefined ? { isPersonalBest } : {}),
          ...(improvement !== undefined ? { improvement } : {}),
          ...(won !== undefined ? { won } : {}),
          stickerId: awarded.stickerId,
          stickerIsNew: awarded.isNew,
        });
      }

      saveStickers(owned);
      const outcome: SessionOutcome = {
        schemaVersion: 2,
        config,
        players: playersOutcome,
        finishedAt,
        ...(onlineFinal ? { onlineFinal } : {}),
      };
      writeJSON('session', OUTCOME_STORAGE_KEY, outcome);
      navigate(`/game/${config.gameId}/result`, { replace: true });
    },
    [config, entry, navigate, roundsByPlayer],
  );

  useEffect(() => {
    if (state.status !== 'finished') return;
    finalizeSession(state.results);
  }, [state.status, state.results, finalizeSession]);

  const handleRoundComplete = useCallback(
    (result: RoundResult) => {
      if (!config || timeUpOverlay || timeUpTimerRef.current !== null) return;
      const isLastTurn = state.turnIndex + 1 >= turns.length;
      if (isLastTurn && mod?.turnMode !== 'in-game') {
        audio.sfx('kids-yay');
      }
      dispatch({
        type: 'ROUND_COMPLETE',
        turnIndex: state.turnIndex,
        result,
        turns,
        players: config.players,
      });
    },
    [audio, config, mod?.turnMode, state.turnIndex, timeUpOverlay, turns],
  );

  useEffect(() => {
    if (config?.mode === 'layar' || config?.mode === 'online') return;
    if (state.status !== 'playing' || timeUpOverlay) return;
    if (typeof window === 'undefined' || !window.__MSZ_TEST__) return;
    if (typeof window.__MSZ_TEST__ !== 'object') {
      window.__MSZ_TEST__ = {};
    }
    window.__MSZ_TEST__.solveRound = (_player?: 1 | 2, result?: { firstTry?: boolean; attempts?: number }) => {
      handleRoundComplete({
        firstTry: result?.firstTry ?? true,
        attempts: result?.attempts ?? 1,
      });
    };
    return () => {
      if (typeof window.__MSZ_TEST__ === 'object' && window.__MSZ_TEST__) {
        delete window.__MSZ_TEST__.solveRound;
      }
    };
  }, [config?.mode, state.status, timeUpOverlay, handleRoundComplete]);

  useEffect(() => {
    return () => {
      if (timeUpTimerRef.current !== null) {
        window.clearTimeout(timeUpTimerRef.current);
      }
    };
  }, []);

  const isSplit = config?.mode === 'layar';
  const isOnline = config?.mode === 'online';
  const isRace = isSplit || isOnline;
  const timerEnabled = Boolean(prefs.timerOn && entry?.timed && config && !isOnline);
  const sessionDurationMs = config
    ? resolveSessionDurationMs(config.gameId, config.difficulty, prefs)
    : TIME_LIMIT_MS.mudah;
  const activeTurn = turns[state.turnIndex];

  const handlePlayerTimeUp = useCallback(
    (player: PlayerNumber) => {
      if (!config || timeUpTimerRef.current !== null) return;
      audio.sfx('time-up');
      void audio.speak({ kind: 'phrase', locale: config.locale, key: 'time-up' });
      setTimeUpOverlay(true);
      timeUpTimerRef.current = window.setTimeout(() => {
        timeUpTimerRef.current = null;
        setTimeUpOverlay(false);
        dispatch({ type: 'TIME_UP', player, turns });
      }, 1200);
    },
    [audio, config, turns],
  );

  const p1Clock = useCountdown({
    durationMs: sessionDurationMs,
    running:
      timerEnabled &&
      !isRace &&
      state.status === 'playing' &&
      activeTurn?.player === 1 &&
      !confirmExitOpen &&
      !timeUpOverlay,
    onExpire: () => handlePlayerTimeUp(1),
  });

  const p2Clock = useCountdown({
    durationMs: sessionDurationMs,
    running:
      timerEnabled &&
      !isRace &&
      config?.players === 2 &&
      state.status === 'playing' &&
      activeTurn?.player === 2 &&
      !confirmExitOpen &&
      !timeUpOverlay,
    onExpire: () => handlePlayerTimeUp(2),
  });

  const activeRemainingMs =
    activeTurn?.player === 2 ? p2Clock.remainingMs : p1Clock.remainingMs;

  useEffect(() => {
    lastTickSecRef.current = null;
  }, [activeTurn?.player]);

  useEffect(() => {
    if (!timerEnabled || isRace || state.status !== 'playing' || confirmExitOpen || timeUpOverlay) {
      return;
    }
    const sec = Math.ceil(activeRemainingMs / 1000);
    if (sec >= 1 && sec <= 5 && sec !== lastTickSecRef.current) {
      lastTickSecRef.current = sec;
      audio.sfx('tick');
    } else if (sec > 5) {
      lastTickSecRef.current = null;
    }
  }, [activeRemainingMs, audio, confirmExitOpen, isRace, state.status, timeUpOverlay, timerEnabled]);

  if (!validId || !entry || !config) {
    return (
      <main className={styles.arena} inert={timeUpOverlay || state.status === 'turn-banner'}>
        <div className={styles.statusCard}>
          <h1 className="t-title">{t('notFound.title')}</h1>
          <BlockButton
            variant="primary"
            size="choice"
            icon="home"
            label={t('nav.home')}
            onPress={() => navigate('/home')}
          />
        </div>
      </main>
    );
  }

  const p1Profile =
    (config.profileIds[0] ? profilesById.get(config.profileIds[0]) : undefined) ?? {
      name: t('play.player1'),
      avatar: 'kelinci' as const,
      color: 'biru' as const,
    };
  const p2Profile =
    (config.profileIds[1] ? profilesById.get(config.profileIds[1]) : undefined) ?? {
      name: t('play.player2'),
      avatar: 'kucing' as const,
      color: 'merah-muda' as const,
    };

  const handleSplitFinish = (info: SplitPlayFinish) => {
    finalizeSession(info.results, info.winner, undefined, info.speedBonus);
  };

  const currentTurn = turns[state.turnIndex];
  const currentRound = currentTurn
    ? currentTurn.player === 1
      ? roundsP1[currentTurn.roundIndex]
      : roundsP2[currentTurn.roundIndex]
    : null;

  const RoundView = mod?.Round;
  const doneForCurrent = currentTurn ? state.results[currentTurn.player].length : 0;
  const activeProfile = (currentTurn?.player ?? 1) === 2 ? p2Profile : p1Profile;

  return (
    <Scene worldId={entry.worldId}>
      <TopNav
        onBack={() => setConfirmExitOpen(true)}
        leftExtra={
          !isRace && config.players === 2 && state.status === 'playing' ? (
            <TurnBanner profile={activeProfile} visible variant="chip" />
          ) : null
        }
        center={
          !isRace && roundsP1.length > 0 ? (
            <div className={styles.centerGroup}>
              <RoundDots
                total={roundsP1.length}
                done={doneForCurrent}
                player={currentTurn?.player ?? 1}
              />
              {timerEnabled && <CountdownPill remainingMs={activeRemainingMs} />}
            </div>
          ) : null
        }
      />

      <main className={styles.arena} inert={timeUpOverlay || state.status === 'turn-banner'}>
        {state.status === 'loading' && <LoadingState variant="card" />}

        {state.status === 'error' && (
          <div className={styles.statusCard}>
            <h1 className="t-title">{t('error.title')}</h1>
            <BlockButton
              variant="primary"
              size="choice"
              icon="replay"
              label={t('error.retry')}
              onPress={() => window.location.reload()}
            />
          </div>
        )}

        {state.status === 'playing' && mod && isSplit && (
          <SplitPlay
            mod={mod}
            roundsByPlayer={roundsByPlayer}
            config={config}
            p1={p1Profile}
            p2={p2Profile}
            calmMotion={calm}
            thickLines={prefs.thickLines}
            sessionMs={timerEnabled ? sessionDurationMs : undefined}
            onFinish={handleSplitFinish}
          />
        )}

        {state.status === 'playing' && mod && isOnline && (
          <OnlinePlay
            mod={mod}
            rounds={roundsP1}
            config={config}
            calmMotion={calm}
            thickLines={prefs.thickLines}
            onFinish={(info) => {
              const of = info.onlineFinal;
              const wonNum =
                of.winner === 'host'
                  ? of.role === 'host'
                    ? 1
                    : 2
                  : of.winner === 'guest'
                    ? of.role === 'guest'
                      ? 1
                      : 2
                    : of.winner;
              const localBase = scoreSession(
                info.results,
                undefined,
                undefined,
                roundsP1.length,
              ).score;
              const localFinal = of.role === 'host' ? of.scores.host : of.scores.guest;
              const localBonus = Math.max(0, localFinal - localBase);
              finalizeSession({ 1: info.results, 2: [] }, wonNum, of, { 1: localBonus });
            }}
          />
        )}

        {!isRace && (
          <AnimatePresence mode="wait">
            {state.status === 'playing' && RoundView && currentTurn && currentRound !== null && (
              <m.div
                key={`${currentTurn.player}-${currentTurn.roundIndex}`}
                className={styles.roundWrap}
                initial={calm ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={calm ? undefined : { opacity: 0, x: -24 }}
                transition={calm ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT_SOFT }}
              >
                <RoundView
                  round={currentRound}
                  config={config}
                  player={currentTurn.player}
                  roundIndex={currentTurn.roundIndex}
                  calmMotion={calm}
                  thickLines={prefs.thickLines}
                  onComplete={handleRoundComplete}
                />
              </m.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {!isRace && (
        <TurnBanner
          profile={activeProfile}
          visible={state.status === 'turn-banner'}
          variant="handoff"
          onReady={() => dispatch({ type: 'BANNER_DONE' })}
        />
      )}

      {timeUpOverlay && (
        <div className={styles.timeUpOverlay} role="alert" data-time-up="true">
          <div className={styles.timeUpCard}>{t('timer.timeUp')}</div>
        </div>
      )}

      <ConfirmExit
        open={confirmExitOpen}
        onStay={() => setConfirmExitOpen(false)}
        onLeave={() => {
          if (isOnline) {
            getActiveRoomController()?.leave();
            clearStoredRoom();
          }
          navigate('/home');
        }}
      />
    </Scene>
  );
}
