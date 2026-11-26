import { m } from 'motion/react';
import { previewGlyph } from '../previews';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const TOTAL_S = 1.9;

function dist(a: readonly [number, number], b: readonly [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function Trace({ spec, calm }: TemplateProps) {
  const glyph = spec.glyph ? previewGlyph(spec.glyph) : null;
  if (!glyph) return null;

  const lines = glyph.strokes.filter((s) => !s.dot && s.points.length > 1);
  const lengths = lines.map((s) =>
    s.points.slice(1).reduce((sum, p, i) => sum + dist(s.points[i], p), 0),
  );
  const totalLen = lengths.reduce((a, b) => a + b, 0) || 1;

  // Each stroke draws in its own time slice, proportional to its length.
  const slices = lengths.map((len, i) => {
    const start = lengths.slice(0, i).reduce((a, b) => a + b, 0) / totalLen;
    return { start, end: start + len / totalLen };
  });

  const first = glyph.strokes[0]?.points[0] ?? [50, 50];

  // The "finger" follows every stroke point in write order.
  const path = lines.flatMap((s) => s.points);
  const cumulative = path.reduce<number[]>((out, p, i) => {
    out.push(i === 0 ? 0 : out[i - 1] + dist(path[i - 1], p));
    return out;
  }, []);
  const fingerTimes = cumulative.map((v) => v / (cumulative[cumulative.length - 1] || 1));

  return (
    <svg viewBox="0 0 100 100" className={styles.traceSvg} focusable="false">
      <g className={styles.guide}>
        {glyph.strokes.map((s, i) =>
          s.dot || s.points.length < 2 ? (
            <circle key={i} cx={s.points[0][0]} cy={s.points[0][1]} r={5} />
          ) : (
            <polyline key={i} points={s.points.map((p) => p.join(',')).join(' ')} />
          ),
        )}
      </g>
      <g className={styles.ink}>
        {lines.map((s, i) => (
          <m.polyline
            key={i}
            data-preview-item
            points={s.points.map((p) => p.join(',')).join(' ')}
            initial={calm ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={
              calm
                ? { duration: 0 }
                : {
                    pathLength: {
                      duration: (slices[i].end - slices[i].start) * TOTAL_S,
                      delay: 0.3 + slices[i].start * TOTAL_S,
                      ease: 'linear',
                    },
                    opacity: { duration: 0.01, delay: 0.3 + slices[i].start * TOTAL_S },
                  }
            }
          />
        ))}
      </g>
      {!calm && path.length > 1 && (
        <m.g
          initial={{ x: path[0][0], y: path[0][1], opacity: 1 }}
          animate={{ x: path.map((p) => p[0]), y: path.map((p) => p[1]), opacity: 0 }}
          transition={{
            x: { duration: TOTAL_S, delay: 0.3, times: fingerTimes, ease: 'linear' },
            y: { duration: TOTAL_S, delay: 0.3, times: fingerTimes, ease: 'linear' },
            opacity: { duration: 0.25, delay: 0.3 + TOTAL_S },
          }}
        >
          <circle r={6} className={styles.finger} />
        </m.g>
      )}
      {!calm && (
        <m.circle
          className={styles.startDot}
          cx={first[0]}
          cy={first[1]}
          r={7}
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 0.9, repeat: 2, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      )}
    </svg>
  );
}
