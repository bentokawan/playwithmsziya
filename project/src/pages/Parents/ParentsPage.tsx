import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { usePreferences } from '@/app/providers/usePreferences';
import assetsMdRaw from '@/assets/ASSETS.md?raw';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { Dialog } from '@/components/Dialog/Dialog';
import { useT } from '@/i18n/useT';
import { useContent } from '@/lib/content/useContent';
import { saveStickers } from '@/lib/stickers/stickers';
import styles from './ParentsPage.module.css';

function parseMarkdownRows(md: string): string[] {
  return md
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && !line.startsWith('| ---') && !line.startsWith('| file'))
    .map((line) =>
      line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(' · '),
    )
    .filter(Boolean);
}

interface SettingSwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onToggle: () => void;
}

function SettingSwitch({ label, checked, onToggle }: SettingSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles.switchRow}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className={`${styles.track} ${checked ? styles.trackOn : ''}`} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}

export function ParentsPage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const { prefs, update } = usePreferences();
  const { content } = useContent();
  const t = useT();
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    audio.setScene({ music: null, ambient: null });
  }, [audio]);

  const bundledCreditLines = useMemo(() => parseMarkdownRows(assetsMdRaw).slice(0, 15), []);

  const handleConfirmReset = () => {
    saveStickers([]);
    setResetOpen(false);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className="t-title">{t('parents.title')}</h1>
          <BlockButton
            variant="primary"
            size="nav"
            icon="check"
            label={t('parents.close')}
            onPress={() => navigate('/home')}
          />
        </header>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('parents.language')}</h2>
          <div className={styles.langRow}>
            <BlockButton
              variant={(prefs.locale ?? 'id') === 'id' ? 'pink' : 'white'}
              size="choice"
              label={t('lang.id')}
              ariaPressed={(prefs.locale ?? 'id') === 'id'}
              onPress={() => update({ locale: 'id' })}
            />
            <BlockButton
              variant={prefs.locale === 'en' ? 'pink' : 'white'}
              size="choice"
              label={t('lang.en')}
              ariaPressed={prefs.locale === 'en'}
              onPress={() => update({ locale: 'en' })}
            />
          </div>
        </section>

        <section className={styles.card}>
          <SettingSwitch
            label={t('parents.music')}
            checked={prefs.musicOn}
            onToggle={() => update({ musicOn: !prefs.musicOn })}
          />
          <SettingSwitch
            label={t('parents.hijaiyyahNature')}
            checked={prefs.hijaiyyahNatureOnly}
            onToggle={() => update({ hijaiyyahNatureOnly: !prefs.hijaiyyahNatureOnly })}
          />
          <SettingSwitch
            label={t('parents.calmMotion')}
            checked={prefs.calmMotion}
            onToggle={() => update({ calmMotion: !prefs.calmMotion })}
          />
          <SettingSwitch
            label={t('parents.thickLines')}
            checked={prefs.thickLines}
            onToggle={() => update({ thickLines: !prefs.thickLines })}
          />
          <SettingSwitch
            label={t('parents.timerOn')}
            checked={prefs.timerOn}
            onToggle={() => update({ timerOn: !prefs.timerOn })}
          />
        </section>

        <section className={styles.card}>
          <BlockButton
            variant="white"
            size="choice"
            label={t('parents.resetStickers')}
            onPress={() => setResetOpen(true)}
          />
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('parents.about')}</h2>
          <p className="t-body">{t('parents.aboutBody')}</p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('parents.credits')}</h2>
          <ul className={`t-body ${styles.creditsList}`}>
            {content.source !== 'bundled' && content.credits.length > 0
              ? content.credits.map((c) => (
                  <li key={c.path}>{`${c.path} · ${c.license}${c.author ? ` · ${c.author}` : ''}`}</li>
                ))
              : bundledCreditLines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>
      </div>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} labelledBy="reset-dialog-title">
        <div className={styles.confirmBody}>
          <h2 id="reset-dialog-title" className="t-body">
            {t('parents.resetConfirm')}
          </h2>
          <div className={styles.confirmActions}>
            <BlockButton
              variant="primary"
              size="choice"
              label={t('play.exit.no')}
              onPress={() => setResetOpen(false)}
            />
            <BlockButton
              variant="white"
              size="choice"
              label={t('parents.resetStickers')}
              onPress={handleConfirmReset}
            />
          </div>
        </div>
      </Dialog>
    </main>
  );
}
