import { useEffect, useState, type ReactNode } from 'react';
import { usePreferences } from '@/app/providers/usePreferences';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { useT } from '@/i18n/useT';
import {
  isFullscreenActive,
  isFullscreenSupported,
  toggleFullscreen,
} from '@/lib/fullscreen/fullscreen';
import styles from './TopNav.module.css';

export interface TopNavProps {
  readonly onBack?: () => void;
  readonly backIcon?: 'back' | 'home';
  readonly leftSlot?: ReactNode;
  readonly center?: ReactNode;
  readonly rightExtra?: ReactNode;
}

export function TopNav({
  onBack,
  backIcon = 'back',
  leftSlot,
  center,
  rightExtra,
}: TopNavProps) {
  const t = useT();
  const { prefs, update } = usePreferences();
  const [fullscreen, setFullscreen] = useState(() => isFullscreenActive());
  const canFullscreen = isFullscreenSupported();

  useEffect(() => {
    const sync = () => setFullscreen(isFullscreenActive());
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const handleToggleFullscreen = () => {
    void toggleFullscreen().then(setFullscreen);
  };

  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        {leftSlot ??
          (onBack ? (
            <BlockButton
              variant="icon"
              size="nav"
              icon={backIcon}
              label={backIcon === 'home' ? t('nav.home') : t('nav.back')}
              onPress={onBack}
            />
          ) : null)}
      </div>

      <div className={styles.center}>{center}</div>

      <div className={styles.right}>
        <BlockButton
          variant="icon"
          size="nav"
          icon={prefs.muted ? 'sound-off' : 'sound-on'}
          label={prefs.muted ? t('nav.soundOn') : t('nav.soundOff')}
          ariaPressed={prefs.muted}
          onPress={() => update({ muted: !prefs.muted })}
        />
        {canFullscreen && (
          <BlockButton
            variant="icon"
            size="nav"
            icon={fullscreen ? 'fullscreen-exit' : 'fullscreen-enter'}
            label={fullscreen ? t('nav.fullscreenExit') : t('nav.fullscreenEnter')}
            ariaPressed={fullscreen}
            onPress={handleToggleFullscreen}
          />
        )}
        {rightExtra}
      </div>
    </header>
  );
}
