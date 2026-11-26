import { m } from 'motion/react';
import { Icon } from '@/components/icons/Icon';
import { DUR, pressProps, SPRING } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { usePress } from '@/lib/press/usePress';
import styles from './Tile.module.css';

export type TileColor = 'blue' | 'pink' | 'white' | 'success' | 'lantern';
export type TileState = 'idle' | 'selected' | 'correct' | 'retry' | 'locked';

export interface TileProps {
  readonly char: string;
  readonly color: TileColor;
  readonly state: TileState;
  readonly layoutId?: string;
  readonly onPress?: () => void;
  readonly lang?: string;
  readonly ariaLabel?: string;
}

export function Tile({ char, color, state, layoutId, onPress, lang, ariaLabel }: TileProps) {
  const calm = useCalmMotion();
  const isLocked = state === 'locked';
  const isArabic = lang === 'ar';

  const animate = calm
    ? undefined
    : state === 'retry'
      ? { rotate: [0, -4, 4, -4, 4, 0] }
      : state === 'correct'
        ? { scale: [1, 1.12, 1] }
        : { rotate: 0, scale: 1 };

  const transition = calm
    ? { duration: 0 }
    : state === 'retry'
      ? { duration: DUR.base }
      : state === 'correct'
        ? { duration: DUR.base }
        : SPRING.gentle;

  const pressHandlers = usePress(onPress, { disabled: isLocked || !onPress });

  return (
    <m.button
      type="button"
      layoutId={layoutId}
      className={[
        styles.tile,
        styles[`color-${color}`],
        styles[`state-${state}`],
        isArabic ? styles.arabic : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isLocked || !onPress}
      lang={lang}
      dir={isArabic ? 'rtl' : undefined}
      aria-label={ariaLabel ?? char}
      data-choice={onPress ? 'true' : undefined}
      data-state={state}
      animate={animate}
      transition={transition}
      {...pressHandlers}
      {...(isLocked || !onPress ? {} : pressProps(calm))}
    >
      <span>{char}</span>
      {state === 'correct' && (
        <span className={styles.badge} aria-hidden="true">
          <Icon name="check" size={20} />
        </span>
      )}
      {isLocked && (
        <span className={styles.badge} aria-hidden="true">
          <Icon name="lock" size={20} />
        </span>
      )}
    </m.button>
  );
}
