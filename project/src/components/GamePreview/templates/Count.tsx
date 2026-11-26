import { m } from 'motion/react';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { SPRING } from '@/design/motion';
import { previewCount } from '../previews';
import styles from '../GamePreview.module.css';
import type { TemplateProps } from './types';

const STEP_S = 0.35;

export function Count({ spec, level, calm }: TemplateProps) {
  const n = previewCount(level);
  const size = n > 5 ? 64 : 88;
  return (
    <div className={styles.countRow} style={{ maxWidth: n > 5 ? 420 : 340 }}>
      {Array.from({ length: n }, (_, i) => (
        <m.div
          key={i}
          data-preview-item
          className={styles.countCell}
          initial={calm ? false : { opacity: 0, scale: 0.4, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={calm ? { duration: 0 } : { ...SPRING.bouncy, delay: i * STEP_S }}
        >
          <ObjectImage objectId={spec.objectId} size={size} decorative />
          <span className={styles.countBadge}>{i + 1}</span>
        </m.div>
      ))}
    </div>
  );
}
