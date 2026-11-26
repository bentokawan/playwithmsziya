import { m } from 'motion/react';
import { usePreferences } from '@/app/providers/usePreferences';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { SPRING } from '@/design/motion';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const STEP_S = 0.3;

export function Letters({ spec, calm }: TemplateProps) {
  const { prefs } = usePreferences();
  const locale = prefs.locale ?? 'id';
  const word = spec.word?.[locale] ?? spec.word?.id ?? '';
  const letters = Array.from(word);
  const doneAt = letters.length * STEP_S + 0.2;

  return (
    <div className={styles.lettersWrap}>
      <m.div
        data-preview-item
        initial={calm ? false : { opacity: 0, scale: 0.6, y: 8 }}
        animate={
          calm
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 1, scale: [0.6, 1.08, 1], y: [8, -14, 0] }
        }
        transition={calm ? { duration: 0 } : { duration: 0.7, delay: doneAt, ease: 'easeOut' }}
      >
        <ObjectImage objectId={spec.objectId} size={88} decorative />
      </m.div>
      <div className={styles.tiles}>
        {letters.map((ch, i) => (
          <m.span
            key={i}
            data-preview-item
            className={styles.tile}
            initial={calm ? false : { opacity: 0, y: -34, rotate: i % 2 ? 10 : -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={calm ? { duration: 0 } : { ...SPRING.bouncy, delay: i * STEP_S }}
          >
            {ch}
          </m.span>
        ))}
      </div>
    </div>
  );
}
