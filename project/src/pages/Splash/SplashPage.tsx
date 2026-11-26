import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { usePreferences } from '@/app/providers/usePreferences';
import logoUrl from '@/assets/logo.svg';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { LanguageDialog } from '@/components/LanguageDialog/LanguageDialog';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import { useContent } from '@/lib/content/useContent';
import type { Locale } from '@/lib/session/session';
import { Background as AngkaBg } from '@/worlds/angka/Background';
import { MsZiya } from '@/worlds/characters/MsZiya';
import styles from './SplashPage.module.css';

export function SplashPage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const { prefs, update } = usePreferences();
  const { loading: contentLoading } = useContent();
  const calm = useCalmMotion();
  const t = useT();

  const [fontsReady, setFontsReady] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setShowLoading(true);
    }, 300);
    const maxTimer = window.setTimeout(() => {
      if (active) setFontsReady(true);
    }, 3000);

    const fonts = document.fonts?.ready ?? Promise.resolve();
    void fonts.finally(() => {
      if (active) setFontsReady(true);
    });

    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
      window.clearTimeout(maxTimer);
    };
  }, []);

  const ready = fontsReady && !contentLoading;

  const handleStart = async () => {
    await audio.unlock();
    audio.setScene({ music: 'home', ambient: null });
    if (prefs.locale === null) {
      setLangOpen(true);
      return;
    }
    navigate('/home');
  };

  const handleSelectLocale = (locale: Locale) => {
    update({ locale });
    setLangOpen(false);
    navigate('/home');
  };

  return (
    <main className={styles.page}>
      <AngkaBg variant="scene" className={styles.bg} />
      <div className={styles.content}>
        <img src={logoUrl} alt={t('app.name')} className={styles.logo} />
        <MsZiya mood="happy" size={160} />

        {ready ? (
          <BlockButton
            variant="primary"
            size="primary"
            icon="play"
            label={t('splash.start')}
            onPress={() => void handleStart()}
          />
        ) : showLoading ? (
          <div className={styles.loadingRow} role="status" aria-live="polite">
            <div className={styles.dots} aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <m.span
                  key={i}
                  className={styles.dot}
                  animate={calm ? undefined : { y: [0, -10, 0] }}
                  transition={
                    calm ? { duration: 0 } : { duration: 0.6, delay: i * 0.12, repeat: Infinity }
                  }
                />
              ))}
            </div>
            <span className="t-body">{t('splash.loading')}</span>
          </div>
        ) : (
          <div className={styles.loadingRow} />
        )}
      </div>

      <LanguageDialog
        open={langOpen}
        currentLocale={prefs.locale}
        onSelect={handleSelectLocale}
        onClose={() => handleSelectLocale('id')}
      />
    </main>
  );
}
