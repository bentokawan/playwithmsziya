import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { usePreferences } from '@/app/providers/usePreferences';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { ConfirmExit } from '@/components/ConfirmExit/ConfirmExit';
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
import { activeProfiles, loadProfiles, type Profile } from '@/lib/profiles/profiles';
import { createRng } from '@/lib/random/rng';
import { clearStoredRoom, getActiveRoomController } from '@/lib/room/roomSession';
import { appendRecord } from '@/lib/scores/records';
import { scoreSession, starsFor } from '@/lib/scores/scoring';
import { parseSessionConfig, type PlayerNumber } from '@/lib/session/session';
import { awardSticker, loadStickers, saveStickers } from '@/lib/stickers/stickers';
import { writeJSON } from '@/lib/storage/storage';
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
  const finalizedRef = useRef(false);

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

  const { roundsP1, roundsP2, turns } = useMemo(() => {
    if (!mod || !config) {
      return { roundsP1: [] as readonly unknown[], roundsP2: [] as readonly unknown[], turns: [] };
    }
    const p1 = mod.createRounds(config, content);
    const p2 =
      config.players === 2 && mod.turnMode === 'per-round' && config.mode === 'giliran'
        ? createRng(config.seed + 1).shuffle(p1)
        : p1;
    const q = buildTurnQueue(config.players, p1.length, mod.turnMode);
    return { roundsP1: p1, roundsP2: p2, turns: q };
  }, [mod, config, content]);

  useEffect(() => {
    if (!mod?.speechFor || !config || roundsP1.length === 0) return;
    const clips = roundsP1.flatMap((r) => mod.speechFor?.(r, config) ?? []);
    if (clips.length > 0) {
      audio.preloadSpeech(clips);
    }
  }, [audio, mod, config, roundsP1]);

  useEffect(() => {
    if (state.status !== 'turn-banner') return;
    audio.sfx('turn');
    const timer = window.setTimeout(() => {
      dispatch({ type: 'BANNER_DONE' });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [audio, state.status]);

  const finalizeSession = useCallback(
    (
      resultsByPlayer: Record<PlayerNumber, readonly RoundResult[]>,
      winner?: 1 | 2 | 'seri' | null,
      onlineFinal?: SessionOutcome['onlineFinal'],
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

        const scored = memoryRes
          ? scoreSession([], memoryRes[p] ?? 0, totalPairs ?? 0)
          : scoreSession(pResults);
        const stars = starsFor(scored.score, scored.maxScore);
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
            score: scored.score,
            maxScore: scored.maxScore,
            firstTryCount: pResults.filter((r) => r.firstTry).length,
            rounds: pResults.length || 1,
            finishedAt,
            ...(won !== undefined ? { won } : {}),
          });
          isPersonalBest = rec.isPersonalBest;
          improvement = rec.improvement;
        }

        playersOutcome.push({
          player: p,
          ...(profileId ? { profileId } : {}),
          roundsCompleted: pResults.length || 1,
          firstTryCount: pResults.filter((r) => r.firstTry).length,
          score: scored.score,
          maxScore: scored.maxScore,
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
    [config, entry, navigate],
  );

  useEffect(() => {
    if (state.status !== 'finished') return;
    finalizeSession(state.results);
  }, [state.status, state.results, finalizeSession]);

  const handleRoundComplete = useCallback(
    (result: RoundResult) => {
      if (!config) return;
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
    [audio, config, mod?.turnMode, state.turnIndex, turns],
  );

  useEffect(() => {
    if (config?.mode === 'layar' || config?.mode === 'online') return;
    if (state.status !== 'playing') return;
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
  }, [config?.mode, state.status, handleRoundComplete]);

  if (!validId || !entry || !config) {
    return (
      <main className={styles.arena}>
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

  const isSplit = config.mode === 'layar';
  const isOnline = config.mode === 'online';
  const isRace = isSplit || isOnline;
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
    finalizeSession(info.results, info.winner);
  };

  const currentTurn = turns[state.turnIndex];
  const currentRound = currentTurn
    ? currentTurn.player === 1
      ? roundsP1[currentTurn.roundIndex]
      : roundsP2[currentTurn.roundIndex]
    : null;

  const RoundView = mod?.Round;
  const doneForCurrent = currentTurn ? state.results[currentTurn.player].length : 0;

  return (
    <Scene worldId={entry.worldId}>
      <TopNav
        onBack={() => setConfirmExitOpen(true)}
        center={
          !isRace && roundsP1.length > 0 ? (
            <RoundDots
              total={roundsP1.length}
              done={doneForCurrent}
              player={currentTurn?.player ?? 1}
            />
          ) : null
        }
      />

      <main className={styles.arena}>
        {state.status === 'loading' && (
          <div className={styles.statusCard}>
            <p className="t-body">{t('splash.loading')}</p>
          </div>
        )}

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
            rounds={roundsP1}
            config={config}
            p1={p1Profile}
            p2={p2Profile}
            calmMotion={calm}
            thickLines={prefs.thickLines}
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
              finalizeSession({ 1: info.results, 2: [] }, wonNum, of);
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
        <TurnBanner player={currentTurn?.player ?? 1} visible={state.status === 'turn-banner'} />
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
