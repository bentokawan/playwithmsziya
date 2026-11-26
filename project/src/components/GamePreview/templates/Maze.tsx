import { m } from 'motion/react';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const POINTS: readonly (readonly [number, number])[] = [
  [18, 96],
  [18, 30],
  [70, 30],
  [70, 80],
  [128, 80],
  [128, 34],
];
const TOTAL_S = 2.2;

const CUMULATIVE = POINTS.reduce<number[]>((out, p, i) => {
  const prev = out[i - 1] ?? 0;
  out.push(i === 0 ? 0 : prev + Math.hypot(p[0] - POINTS[i - 1][0], p[1] - POINTS[i - 1][1]));
  return out;
}, []);
const TIMES = CUMULATIVE.map((v) => v / CUMULATIVE[CUMULATIVE.length - 1]);

export function Maze({ spec, calm }: TemplateProps) {
  const pts = POINTS.map((p) => p.join(',')).join(' ');
  const end = POINTS[POINTS.length - 1];

  return (
    <div className={styles.mazeWrap}>
      <svg viewBox="0 0 160 120" className={styles.mazeSvg} focusable="false">
        <polyline className={styles.mazeGuide} points={pts} />
        <m.polyline
          className={styles.mazeTrail}
          points={pts}
          initial={calm ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={calm ? { duration: 0 } : { duration: TOTAL_S, delay: 0.3, ease: 'linear' }}
        />
        {!calm && (
          <m.g
            initial={{ x: POINTS[0][0], y: POINTS[0][1], opacity: 1 }}
            animate={{
              x: POINTS.map((p) => p[0]),
              y: POINTS.map((p) => p[1]),
              opacity: [1, 1, 1, 1, 1, 0],
            }}
            transition={{ duration: TOTAL_S, delay: 0.3, times: TIMES, ease: 'linear' }}
          >
            <circle r={7} className={styles.mazeDot} />
          </m.g>
        )}
      </svg>
      <div
        className={styles.mazeGoal}
        style={{ left: `${(end[0] / 160) * 100}%`, top: `${(end[1] / 120) * 100}%` }}
      >
        <m.div
          data-preview-item
          initial={calm ? false : { opacity: 0.9, scale: 1 }}
          animate={calm ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [1, 1, 1.3, 1] }}
          transition={
            calm ? { duration: 0 } : { duration: 0.8, delay: 0.3 + TOTAL_S - 0.2, ease: 'easeOut' }
          }
        >
          <ObjectImage objectId={spec.objectId} size={64} decorative />
        </m.div>
      </div>
    </div>
  );
}
