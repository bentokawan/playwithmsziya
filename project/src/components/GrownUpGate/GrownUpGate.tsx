import { useCallback, useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { Dialog } from '@/components/Dialog/Dialog';
import { Icon, type IconName } from '@/components/icons/Icon';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import { createRng } from '@/lib/random/rng';
import styles from './GrownUpGate.module.css';

export interface GrownUpGateProps {
  readonly onPass: () => void;
  readonly icon?: IconName;
  readonly label?: string;
  /** Text shown next to the icon; the aria-label stays the full label. */
  readonly visibleLabel?: string;
}

interface GateProblem {
  readonly a: number;
  readonly b: number;
  readonly answer: number;
  readonly options: readonly number[];
}

const HOLD_MS = 2000;
const RING_R = 28;
const RING_C = 2 * Math.PI * RING_R;

function createProblem(avoid?: GateProblem | null): GateProblem {
  // Approved exception in plan T2.4: grown-up gate uses current timestamp as seed.
  const base = Date.now();
  let last: GateProblem | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const rng = createRng((base + attempt * 997) >>> 0);
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const answer = a + b;
    const set = new Set<number>([answer]);
    while (set.size < 4) {
      const candidate = Math.max(4, Math.min(18, answer + rng.int(-4, 4)));
      set.add(candidate);
    }
    const next: GateProblem = { a, b, answer, options: rng.shuffle(Array.from(set)) };
    last = next;
    if (!avoid || next.a !== avoid.a || next.b !== avoid.b) {
      return next;
    }
  }
  return last!;
}

export function GrownUpGate({ onPass, icon = 'settings', label, visibleLabel }: GrownUpGateProps) {
  const t = useT();
  const audio = useAudio();
  const calm = useCalmMotion();
  const [progress, setProgress] = useState(0);
  const [problem, setProblem] = useState<GateProblem | null>(null);
  const [wrong, setWrong] = useState<ReadonlySet<number>>(() => new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [showWrongAlert, setShowWrongAlert] = useState(false);
  const [shakingOpt, setShakingOpt] = useState<number | null>(null);
  const holdingRef = useRef(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  const resetFeedback = useCallback(() => {
    setWrong(new Set());
    setWrongCount(0);
    setShowWrongAlert(false);
    setShakingOpt(null);
    if (shakeTimerRef.current !== null) {
      window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
  }, []);

  const stopHold = useCallback(() => {
    holdingRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!holdingRef.current) return;
      const ratio = Math.min(1, (now - startRef.current) / HOLD_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        stopHold();
        resetFeedback();
        setProblem(createProblem());
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [resetFeedback, stopHold]);

  useEffect(
    () => () => {
      stopHold();
      if (shakeTimerRef.current !== null) {
        window.clearTimeout(shakeTimerRef.current);
      }
    },
    [stopHold],
  );

  const handleClose = () => {
    resetFeedback();
    setProblem(null);
  };

  const handleAnswer = (val: number) => {
    if (!problem || wrong.has(val)) return;
    if (val === problem.answer) {
      resetFeedback();
      setProblem(null);
      onPass();
      return;
    }

    audio.sfx('retry');
    setShowWrongAlert(true);
    const nextCount = wrongCount + 1;
    if (nextCount >= 2) {
      setProblem(createProblem(problem));
      setWrong(new Set());
      setWrongCount(0);
      setShakingOpt(null);
      return;
    }

    setWrong((prev) => {
      const next = new Set(prev);
      next.add(val);
      return next;
    });
    setWrongCount(nextCount);
    if (!calm) {
      setShakingOpt(val);
      if (shakeTimerRef.current !== null) {
        window.clearTimeout(shakeTimerRef.current);
      }
      shakeTimerRef.current = window.setTimeout(() => {
        shakeTimerRef.current = null;
        setShakingOpt(null);
      }, 300);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label ?? t('nav.settings')}
        title={t('gate.hold')}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') startHold();
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') stopHold();
        }}
      >
        <Icon name={icon} size={28} />
        {visibleLabel && <span className={styles.triggerLabel}>{visibleLabel}</span>}
        {progress > 0 && (
          <svg className={styles.ring} viewBox="0 0 64 64" aria-hidden="true">
            <circle
              cx="32"
              cy="32"
              r={RING_R}
              className={styles.ringProgress}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress)}
            />
          </svg>
        )}
      </button>

      <Dialog open={problem !== null} onClose={handleClose} labelledBy="gate-title">
        {problem && (
          <div className={styles.dialogBody}>
            <h2 id="gate-title" className={styles.question}>
              {t('gate.question', { a: problem.a, b: problem.b })}
            </h2>
            {showWrongAlert && (
              <p role="alert" className={styles.wrongAlert}>
                {t('gate.wrong')}
              </p>
            )}
            <div className={styles.options}>
              {problem.options.map((opt) => (
                <m.div
                  key={opt}
                  className={styles.optionWrap}
                  animate={
                    !calm && shakingOpt === opt
                      ? { x: [0, -8, 8, -4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <BlockButton
                    variant="white"
                    size="choice"
                    label={String(opt)}
                    disabled={wrong.has(opt)}
                    onPress={() => handleAnswer(opt)}
                  />
                </m.div>
              ))}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
