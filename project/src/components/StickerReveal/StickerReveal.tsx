import { useEffect } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { Sticker } from '@/components/Sticker/Sticker';
import type { StickerId } from '@/content/stickers';
import { SPRING } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import styles from './StickerReveal.module.css';

export interface StickerRevealProps {
  readonly stickerId: StickerId;
  readonly isNew: boolean;
  readonly onDone?: () => void;
}

const SPARKLES = Array.from({ length: 8 }, (_, idx) => {
  const angle = (idx / 8) * Math.PI * 2;
  return { x: Math.cos(angle) * 76, y: Math.sin(angle) * 76 };
});

export function StickerReveal({ stickerId, isNew, onDone }: StickerRevealProps) {
  const t = useT();
  const calm = useCalmMotion();
  const audio = useAudio();

  useEffect(() => {
    audio.sfx('sticker');
    if (!onDone) return;
    const timer = window.setTimeout(onDone, calm ? 0 : 1200);
    return () => window.clearTimeout(timer);
  }, [audio, calm, onDone]);

  return (
    <div className={styles.wrap}>
      {!calm && (
        <div className={styles.sparkles} aria-hidden="true">
          {SPARKLES.map((pos, i) => (
            <m.span
              key={i}
              className={styles.sparkle}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: pos.x, y: pos.y, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.9, delay: 0.15 }}
            />
          ))}
        </div>
      )}
      <m.div
        initial={calm ? false : { rotateY: 180, scale: 0.8 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={calm ? { duration: 0 } : SPRING.bouncy}
      >
        <Sticker stickerId={stickerId} owned size={128} />
      </m.div>
      <span className={styles.badge}>
        {isNew ? t('result.newSticker') : t('result.repeatSticker')}
      </span>
    </div>
  );
}
