import { m } from 'motion/react';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { SPRING } from '@/design/motion';
import { previewCount } from '../previews';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const STEP_S = 0.35;

export function Count({ spec, level, calm }: TemplateProps) {
  const n = previewCount(level);
  const size = n > 5 ? 56 : 72;
  return (
    <div className={styles.countRow} style={{ maxWidth: n > 5 ? 300 : 280 }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className={styles.countCell}>
          <m.div
            data-preview-item
            initial={calm ? false : { opacity: 0, scale: 0.4, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={calm ? { duration: 0 } : { ...SPRING.bouncy, delay: i * STEP_S }}
          >
            <ObjectImage objectId={spec.objectId} size={size} decorative />
          </m.div>
          <m.span
            className={styles.countBadge}
            initial={calm ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={calm ? { duration: 0 } : { ...SPRING.bouncy, delay: i * STEP_S + 0.12 }}
          >
            {i + 1}
          </m.span>
        </div>
      ))}
    </div>
  );
}
