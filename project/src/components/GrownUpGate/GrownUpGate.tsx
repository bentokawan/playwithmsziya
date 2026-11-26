import { useCallback, useEffect, useRef, useState } from 'react';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { Dialog } from '@/components/Dialog/Dialog';
import { Icon, type IconName } from '@/components/icons/Icon';
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

function createProblem(): GateProblem {
  // Approved exception in plan T2.4: grown-up gate uses current timestamp as seed.
  const rng = createRng(Date.now());
  const a = rng.int(2, 9);
  const b = rng.int(2, 9);
  const answer = a + b;
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const candidate = Math.max(4, Math.min(18, answer + rng.int(-4, 4)));
    set.add(candidate);
  }
  return { a, b, answer, options: rng.shuffle(Array.from(set)) };
}

export function GrownUpGate({ onPass, icon = 'settings', label, visibleLabel }: GrownUpGateProps) {
  const t = useT();
  const [progress, setProgress] = useState(0);
  const [problem, setProblem] = useState<GateProblem | null>(null);
  const holdingRef = useRef(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

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
        setProblem(createProblem());
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopHold]);

  useEffect(() => () => stopHold(), [stopHold]);

  const handleAnswer = (val: number) => {
    if (!problem) return;
    const ok = val === problem.answer;
    setProblem(null);
    if (ok) onPass();
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

      <Dialog open={problem !== null} onClose={() => setProblem(null)} labelledBy="gate-title">
        {problem && (
          <div className={styles.dialogBody}>
            <h2 id="gate-title" className={styles.question}>
              {t('gate.question', { a: problem.a, b: problem.b })}
            </h2>
            <div className={styles.options}>
              {problem.options.map((opt) => (
                <BlockButton
                  key={opt}
                  variant="white"
                  size="choice"
                  label={String(opt)}
                  onPress={() => handleAnswer(opt)}
                />
              ))}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
