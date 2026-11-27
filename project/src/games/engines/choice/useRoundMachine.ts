import { useCallback, useEffect, useRef, useState } from 'react';
import { DUR } from '@/design/motion';
import type { RoundResult } from '@/games/types';

export type RoundPhase = 'intro' | 'waiting' | 'evaluating' | 'celebrating' | 'retry';

export interface UseRoundMachineOptions {
  readonly calmMotion: boolean;
  readonly onComplete: (result: RoundResult) => void;
  readonly onIdle?: (level: 1 | 2) => void;
  readonly idleMs?: number;
  readonly retryLockMs?: number;
}

export function useRoundMachine({
  calmMotion,
  onComplete,
  onIdle,
  idleMs = 8000,
  retryLockMs = Math.round(DUR.base * 1000),
}: UseRoundMachineOptions) {
  const [phase, setPhase] = useState<RoundPhase>('waiting');
  const attemptsRef = useRef(0);
  const completedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const idleTimer1Ref = useRef<number | null>(null);
  const idleTimer2Ref = useRef<number | null>(null);

  const clearActionTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearIdleTimers = useCallback(() => {
    if (idleTimer1Ref.current !== null) {
      window.clearTimeout(idleTimer1Ref.current);
      idleTimer1Ref.current = null;
    }
    if (idleTimer2Ref.current !== null) {
      window.clearTimeout(idleTimer2Ref.current);
      idleTimer2Ref.current = null;
    }
  }, []);

  const resetIdle = useCallback(() => {
    clearIdleTimers();
    if (!onIdle || completedRef.current) return;
    idleTimer1Ref.current = window.setTimeout(() => {
      onIdle(1);
      idleTimer2Ref.current = window.setTimeout(() => {
        onIdle(2);
      }, idleMs);
    }, idleMs);
  }, [clearIdleTimers, idleMs, onIdle]);

  useEffect(() => {
    resetIdle();
    return () => {
      clearActionTimer();
      clearIdleTimers();
    };
  }, [resetIdle, clearActionTimer, clearIdleTimers]);

  const submit = useCallback(
    (isCorrect: boolean, extra?: { readonly onCorrect?: () => void; readonly onWrong?: () => void }) => {
      if (phase !== 'waiting' || completedRef.current) return;
      clearIdleTimers();
      attemptsRef.current += 1;

      if (isCorrect) {
        completedRef.current = true;
        setPhase('celebrating');
        extra?.onCorrect?.();
        const delay = calmMotion ? 0 : Math.round(DUR.celebrate * 1000);
        clearActionTimer();
        timerRef.current = window.setTimeout(() => {
          onComplete({
            attempts: attemptsRef.current,
            firstTry: attemptsRef.current === 1,
          });
        }, delay);
      } else {
        extra?.onWrong?.();
        const delay = calmMotion ? 0 : retryLockMs;
        clearActionTimer();
        if (delay <= 0) {
          setPhase('waiting');
          resetIdle();
        } else {
          setPhase('retry');
          timerRef.current = window.setTimeout(() => {
            setPhase('waiting');
            resetIdle();
          }, delay);
        }
      }
    },
    [phase, calmMotion, retryLockMs, onComplete, clearActionTimer, clearIdleTimers, resetIdle],
  );

  const locked = phase !== 'waiting';

  return { phase, locked, submit, resetIdle };
}
