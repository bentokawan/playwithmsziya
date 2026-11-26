import { m } from 'motion/react';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const FLIP_S = 0.55;

export function Memory({ spec, calm }: TemplateProps) {
  return (
    <div className={styles.cards}>
      {[0, 1].map((i) => (
        <m.div
          key={i}
          data-preview-item
          className={styles.card}
          initial={calm ? false : { rotateY: 0, rotate: 0 }}
          animate={calm ? { rotateY: 180, rotate: 0 } : { rotateY: 180, rotate: [0, 0, -6, 6, 0] }}
          transition={
            calm
              ? { duration: 0 }
              : {
                  rotateY: { duration: FLIP_S, delay: 0.3 + i * 0.5, ease: 'easeInOut' },
                  rotate: { duration: 0.7, delay: 1.5, ease: 'easeInOut' },
                }
          }
        >
          <span className={`${styles.face} ${styles.back}`} aria-hidden="true">
            ?
          </span>
          <span className={`${styles.face} ${styles.front}`} aria-hidden="true">
            <ObjectImage objectId={spec.objectId} size={80} decorative />
          </span>
        </m.div>
      ))}
    </div>
  );
}
