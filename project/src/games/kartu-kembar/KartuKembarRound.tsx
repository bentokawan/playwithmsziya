import { useEffect, useMemo, useRef, useState } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { Icon } from '@/components/icons/Icon';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { TurnBanner } from '@/components/TurnBanner/TurnBanner';
import { DUR, pressProps, SPRING } from '@/design/motion';
import arenaStyles from '@/games/Arena.module.css';
import {
  flip,
  INITIAL_MEMORY_STATE,
  isMemoryComplete,
  isOpenPairMatch,
  resolve,
  type MemoryState,
} from '@/games/engines/memory/memory';
import type { RoundProps } from '@/games/types';
import { useT } from '@/i18n/useT';
import { useViewport } from '@/lib/device/viewport';
import { activeProfiles, loadProfiles, type Profile } from '@/lib/profiles/profiles';
import { Kuku } from '@/worlds/characters/Kuku';
import styles from './KartuKembarRound.module.css';
import type { MemoryRound } from './rounds';

export function KartuKembarRound({ round, config, calmMotion, onComplete }: RoundProps<MemoryRound>) {
  const audio = useAudio();
  const t = useT();
  const vp = useViewport();
  const [state, setState] = useState<MemoryState>(INITIAL_MEMORY_STATE);
  const [bannerVisible, setBannerVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const playerProfiles = useMemo<Record<1 | 2, Pick<Profile, 'name' | 'avatar' | 'color'>>>(() => {
    const byId = new Map(activeProfiles(loadProfiles()).map((p) => [p.id, p]));
    const p1 = (config.profileIds[0] ? byId.get(config.profileIds[0]) : undefined) ?? {
      name: t('play.player1'),
      avatar: 'kelinci' as const,
      color: 'biru' as const,
    };
    const p2 = (config.profileIds[1] ? byId.get(config.profileIds[1]) : undefined) ?? {
      name: t('play.player2'),
      avatar: 'kucing' as const,
      color: 'merah-muda' as const,
    };
    return { 1: p1, 2: p2 };
  }, [config.profileIds, t]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (bannerTimerRef.current !== null) window.clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const dismissBanner = () => {
    if (bannerTimerRef.current !== null) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
    setBannerVisible(false);
  };

  const handleCardPress = (cardId: string) => {
    const next = flip(state, cardId, round.cards);
    if (next === state) return;
    audio.sfx('flip');
    setState(next);

    if (next.open.length === 2) {
      const matched = isOpenPairMatch(next, round.cards);
      if (matched) {
        audio.sfx('match');
        const resolved = resolve(next, round.cards, config.players);
        setState(resolved);
        if (isMemoryComplete(resolved, round.cards) && !completedRef.current) {
          completedRef.current = true;
          audio.sfx('kids-yay');
          const p1 = Object.values(resolved.matched).filter((p) => p === 1).length / 2;
          const p2 = Object.values(resolved.matched).filter((p) => p === 2).length / 2;
          timerRef.current = window.setTimeout(
            () =>
              onComplete({
                attempts: resolved.attempts,
                firstTry: false,
                perPlayer: config.players === 2 ? { 1: p1, 2: p2 } : { 1: p1 },
              }),
            calmMotion ? 0 : Math.round(DUR.celebrate * 1000),
          );
        }
      } else {
        timerRef.current = window.setTimeout(() => {
          const resolved = resolve(next, round.cards, config.players);
          setState(resolved);
          if (config.players === 2 && resolved.currentPlayer !== next.currentPlayer) {
            audio.sfx('turn');
            void audio.speak({ kind: 'phrase', locale: config.locale, key: 'your-turn' });
            setBannerVisible(true);
            if (vp.w >= 600) {
              if (bannerTimerRef.current !== null) window.clearTimeout(bannerTimerRef.current);
              bannerTimerRef.current = window.setTimeout(() => {
                bannerTimerRef.current = null;
                setBannerVisible(false);
              }, 4000);
            }
          }
        }, 900);
      }
    }
  };

  return (
    <div className={arenaStyles.arena}>
      <div className={arenaStyles.prompt}>
        <div
          className={styles.board}
          style={{ gridTemplateColumns: `repeat(${round.cols}, minmax(72px, 1fr))` }}
        >
          {round.cards.map((card) => {
            const matchedBy = state.matched[card.id];
            const isOpen = state.open.includes(card.id) || matchedBy !== undefined;
            const matchedCls = matchedBy
              ? matchedBy === 2
                ? styles.matchedP2
                : styles.matchedP1
              : '';

            return (
              <m.button
                key={card.id}
                type="button"
                className={styles.card}
                onClick={() => handleCardPress(card.id)}
                disabled={matchedBy !== undefined}
                data-choice="true"
                {...pressProps(calmMotion)}
              >
                <m.div
                  className={styles.inner}
                  animate={{ rotateY: isOpen ? 180 : 0 }}
                  transition={calmMotion ? { duration: 0 } : SPRING.gentle}
                >
                  <div className={`${styles.face} ${styles.back}`}>
                    <Icon name="star" size={32} />
                  </div>
                  <div className={`${styles.face} ${styles.front} ${matchedCls}`}>
                    <ObjectImage objectId={card.face} size={68} />
                    {matchedBy !== undefined && (
                      <span className={styles.check} aria-hidden="true">
                        <Icon name="check" size={20} />
                      </span>
                    )}
                  </div>
                </m.div>
              </m.button>
            );
          })}
        </div>
        <div className={arenaStyles.buddy} aria-hidden="true">
          <Kuku mood={isMemoryComplete(state, round.cards) ? 'wow' : 'happy'} size={96} />
        </div>
      </div>

      <TurnBanner
        profile={playerProfiles[state.currentPlayer]}
        visible={bannerVisible}
        variant="handoff"
        onReady={dismissBanner}
      />
    </div>
  );
}
