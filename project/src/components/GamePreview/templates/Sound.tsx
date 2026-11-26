import { m } from 'motion/react';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { SPRING } from '@/design/motion';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const RINGS = [0, 1, 2] as const;

export function Sound({ spec, calm }: TemplateProps) {
  return (
    <div className={styles.soundWrap}>
      {!calm &&
        RINGS.map((i) => (
          <m.span
            key={i}
            className={styles.ring}
            initial={{ scale: 0.55, opacity: 0.8 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 1.5, delay: i * 0.4, repeat: 2, ease: 'easeOut' }}
          />
        ))}
      <m.div
        data-preview-item
        className={styles.soundObject}
        initial={calm ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={calm ? { duration: 0 } : SPRING.bouncy}
      >
        <ObjectImage objectId={spec.objectId} size={112} decorative />
      </m.div>
      {spec.letter && (
        <m.span
          data-preview-item
          className={styles.letterTile}
          initial={calm ? false : { opacity: 0, y: 10, rotate: 0 }}
          animate={calm ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, y: 0, rotate: [0, -8, 8, -4, 0] }}
          transition={calm ? { duration: 0 } : { duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
        >
          {spec.letter}
        </m.span>
      )}
    </div>
  );
}
