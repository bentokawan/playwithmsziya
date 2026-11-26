import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { Icon, type IconName } from '@/components/icons/Icon';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { usePress } from '@/lib/press/usePress';
import styles from './BlockButton.module.css';

export interface BlockButtonProps {
  readonly variant: 'primary' | 'pink' | 'white' | 'icon';
  readonly size: 'nav' | 'choice' | 'primary';
  readonly label: string;
  readonly icon?: IconName;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly hideLabel?: boolean;
  readonly ariaPressed?: boolean;
  readonly className?: string;
  readonly type?: 'button' | 'submit';
  readonly dataChoice?: boolean;
}

export function BlockButton({
  variant,
  size,
  label,
  icon,
  onPress,
  disabled = false,
  loading = false,
  hideLabel = false,
  ariaPressed,
  className,
  type = 'button',
  dataChoice,
}: BlockButtonProps) {
  const calm = useCalmMotion();
  const audio = useAudio();
  const isDisabled = disabled || loading;
  const iconOnly = variant === 'icon' || hideLabel;

  const handlePress = () => {
    if (isDisabled) return;
    audio.sfx('tap');
    onPress();
  };

  const pressHandlers = usePress(handlePress, {
    disabled: isDisabled,
    isSubmit: type === 'submit',
  });

  return (
    <m.button
      type={type}
      className={[
        styles.btn,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      aria-label={iconOnly ? label : undefined}
      aria-busy={loading || undefined}
      aria-pressed={ariaPressed}
      data-choice={dataChoice ? 'true' : undefined}
      {...pressHandlers}
      {...(isDisabled ? {} : pressProps(calm))}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'primary' ? 34 : 28} />}
          {!iconOnly && <span>{label}</span>}
        </>
      )}
    </m.button>
  );
}
