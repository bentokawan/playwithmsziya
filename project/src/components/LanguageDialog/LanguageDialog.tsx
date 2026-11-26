import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { Dialog } from '@/components/Dialog/Dialog';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import type { Locale } from '@/lib/session/session';
import styles from './LanguageDialog.module.css';

export interface LanguageDialogProps {
  readonly open: boolean;
  readonly currentLocale: Locale | null;
  readonly onSelect: (locale: Locale) => void;
  readonly onClose: () => void;
}

function FlagIdSvg() {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true">
      <rect width="56" height="20" rx="4" fill="#E8458B" />
      <rect y="18" width="56" height="22" rx="4" fill="#FFFFFF" />
      <rect x="1" y="1" width="54" height="38" rx="4" stroke="#C9D3E6" strokeWidth="2" fill="none" />
    </svg>
  );
}

function GlobeSvg() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 010 18" />
      <path d="M12 3a14 14 0 000 18" />
    </svg>
  );
}

export function LanguageDialog({
  open,
  currentLocale,
  onSelect,
  onClose,
}: LanguageDialogProps) {
  const t = useT();
  const calm = useCalmMotion();
  const audio = useAudio();

  const pick = (locale: Locale) => {
    audio.sfx('tap');
    onSelect(locale);
  };

  return (
    <Dialog open={open} onClose={onClose} labelledBy="lang-dialog-title">
      <div className={styles.body}>
        <h2 id="lang-dialog-title" className={styles.title}>
          {t('lang.title')}
        </h2>
        <div className={styles.grid}>
          <m.button
            type="button"
            className={`${styles.choice} ${currentLocale === 'id' ? styles.active : ''}`}
            aria-pressed={currentLocale === 'id'}
            onClick={() => pick('id')}
            {...pressProps(calm)}
          >
            <FlagIdSvg />
            <span>{t('lang.id')}</span>
          </m.button>
          <m.button
            type="button"
            className={`${styles.choice} ${currentLocale === 'en' ? styles.active : ''}`}
            aria-pressed={currentLocale === 'en'}
            onClick={() => pick('en')}
            {...pressProps(calm)}
          >
            <GlobeSvg />
            <span>{t('lang.en')}</span>
          </m.button>
        </div>
      </div>
    </Dialog>
  );
}
