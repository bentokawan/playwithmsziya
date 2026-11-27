import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { Tile } from '@/components/Tile/Tile';
import { DUR, SPRING } from '@/design/motion';
import arenaStyles from '@/games/Arena.module.css';
import { evaluate } from '@/games/engines/choice/choice';
import { useRoundMachine } from '@/games/engines/choice/useRoundMachine';
import type { RoundProps } from '@/games/types';
import { Jeje } from '@/worlds/characters/Jeje';
import styles from './AyoBerhitungRound.module.css';
import { countLayout, type CountRound } from './rounds';

const AUTO_COUNT_STEP_MS = 450;

export function AyoBerhitungRound({
  round,
  config,
  calmMotion,
  pane,
  onComplete,
}: RoundProps<CountRound>) {
  const audio = useAudio();
  const [chosen, setChosen] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [activeHintIdx, setActiveHintIdx] = useState<number | null>(null);
  const [autoCounting, setAutoCounting] = useState(false);

  const timersRef = useRef<number[]>([]);
  const autoGenRef = useRef(0);
  const wrongTimerRef = useRef<number | null>(null);
  const idleHintedRef = useRef(false);

  const clearAutoTimers = useCallback(() => {
    autoGenRef.current += 1;
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
    audio.stopSpeech();
  }, [audio]);

  const clearWrongFlash = useCallback(() => {
    if (wrongTimerRef.current !== null) {
      window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
    setWrongFlash(null);
  }, []);

  useEffect(
    () => () => {
      clearAutoTimers();
      clearWrongFlash();
    },
    [clearAutoTimers, clearWrongFlash],
  );

  const startAutoCount = useCallback(
    (withIntroPhrase = false) => {
      clearAutoTimers();
      if (calmMotion) {
        setHintCount(round.count);
        setActiveHintIdx(null);
        setAutoCounting(false);
        return;
      }

      const gen = autoGenRef.current;
      setAutoCounting(true);
      setHintCount(0);
      setActiveHintIdx(null);

      const scheduleSteps = () => {
        if (autoGenRef.current !== gen) return;
        for (let i = 0; i < round.count; i++) {
          const id = window.setTimeout(() => {
            if (autoGenRef.current !== gen) return;
            setHintCount(i + 1);
            setActiveHintIdx(i);
            audio.sfx('count-pop');
            if (!pane?.quiet) {
              void audio.speak({ kind: 'num', locale: config.locale, key: i + 1 });
            }
          }, i * AUTO_COUNT_STEP_MS);
          timersRef.current.push(id);
        }

        const doneId = window.setTimeout(() => {
          if (autoGenRef.current !== gen) return;
          setActiveHintIdx(null);
          setAutoCounting(false);
        }, round.count * AUTO_COUNT_STEP_MS);
        timersRef.current.push(doneId);
      };

      if (withIntroPhrase && !pane?.quiet) {
        void audio
          .speak({ kind: 'phrase', locale: config.locale, key: 'count-together' })
          .then(scheduleSteps);
      } else {
        scheduleSteps();
      }
    },
    [audio, calmMotion, clearAutoTimers, config.locale, pane?.quiet, round.count],
  );

  const handleIdle = useCallback(
    (level: 1 | 2) => {
      if (level === 1 && !idleHintedRef.current) {
        idleHintedRef.current = true;
        startAutoCount(false);
      }
    },
    [startAutoCount],
  );

  const { phase, locked, submit, resetIdle } = useRoundMachine({
    calmMotion,
    onComplete,
    onIdle: handleIdle,
    retryLockMs: 0,
  });

  const trayLocked = locked;

  const handlePickOption = (val: number) => {
    if (trayLocked) return;
    clearAutoTimers();
    clearWrongFlash();
    setAutoCounting(false);
    setActiveHintIdx(null);
    setChosen(val);
    const ok = evaluate(round.count, val);
    submit(ok, {
      onCorrect: () => {
        setHintCount(round.count);
        audio.sfx('correct');
        if (!pane?.quiet) {
          void audio.speak({ kind: 'num', locale: config.locale, key: val });
        }
      },
      onWrong: () => {
        audio.sfx('retry');
        if (!calmMotion) {
          setWrongFlash(val);
          wrongTimerRef.current = window.setTimeout(() => {
            wrongTimerRef.current = null;
            setWrongFlash(null);
          }, Math.round(DUR.base * 1000));
        }
        startAutoCount(true);
      },
    });
  };

  const rows = useMemo(() => countLayout(round.count), [round.count]);
  const imgSize = round.count <= 5 ? 88 : round.count <= 10 ? 72 : 56;
  const mood = phase === 'celebrating' ? 'wow' : phase === 'retry' || autoCounting ? 'thinking' : 'happy';

  return (
    <div className={arenaStyles.arena} onPointerDown={resetIdle}>
      <div className={arenaStyles.prompt}>
        <div className={styles.field}>
          {rows.map((rowLen, rowIdx) => {
            const startIdx = rowIdx * 5;
            return (
              <div key={rowIdx} className={styles.row}>
                {Array.from({ length: rowLen }, (_, colIdx) => {
                  const idx = startIdx + colIdx;
                  const showBadge = phase === 'celebrating' || idx < hintCount;
                  const isPulsing = !calmMotion && activeHintIdx === idx;
                  return (
                    <m.div
                      key={idx}
                      className={styles.item}
                      animate={isPulsing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={calmMotion ? { duration: 0 } : SPRING.gentle}
                    >
                      <ObjectImage objectId={round.objectId} size={imgSize} />
                      {showBadge && <span className={styles.badge}>{idx + 1}</span>}
                    </m.div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className={arenaStyles.buddy} aria-hidden="true">
          <Jeje mood={mood} size={96} />
        </div>
      </div>

      <div className={`${arenaStyles.tray} ${trayLocked ? arenaStyles.locked : ''}`}>
        <div className={arenaStyles.options}>
          {round.options.map((opt) => {
            const isChosen = chosen === opt;
            const state =
              phase === 'celebrating' && isChosen
                ? 'correct'
                : (phase === 'retry' && isChosen) || wrongFlash === opt
                  ? 'retry'
                  : 'idle';
            return (
              <Tile
                key={opt}
                char={String(opt)}
                color="blue"
                state={state}
                onPress={() => handlePickOption(opt)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
