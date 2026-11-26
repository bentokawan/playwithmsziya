import { useEffect, useMemo } from 'react';
import { m } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { usePreferences } from '@/app/providers/usePreferences';
import { Sticker } from '@/components/Sticker/Sticker';
import { TopNav } from '@/components/TopNav/TopNav';
import { STICKERS, type StickerDef } from '@/content/stickers';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { WORLD_IDS } from '@/games/ids';
import { useT } from '@/i18n/useT';
import { useContent } from '@/lib/content/useContent';
import { loadStickers } from '@/lib/stickers/stickers';
import styles from './StickersPage.module.css';

export function StickersPage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const { prefs } = usePreferences();
  const { content } = useContent();
  const calm = useCalmMotion();
  const t = useT();
  const locale = prefs.locale ?? 'id';

  const ownedSet = useMemo(() => new Set(loadStickers()), []);

  useEffect(() => {
    audio.setScene({ music: 'home', ambient: null });
  }, [audio]);

  const handleStickerTap = (def: StickerDef, owned: boolean) => {
    if (!owned) return;
    if (def.kind === 'object') {
      const obj = content.objects.get(def.subject);
      const wordKey = obj ? obj.name[locale].toLowerCase() : def.subject;
      const clip = { kind: 'word' as const, locale, key: wordKey };
      if (content.speechUrl(clip)) {
        void audio.speak(clip);
        return;
      }
    }
    audio.sfx('select');
  };

  return (
    <div className={styles.page}>
      <TopNav
        onBack={() => navigate('/home')}
        center={<h1 className="t-title">{t('stickers.title')}</h1>}
      />

      <main className={styles.main}>
        {WORLD_IDS.map((worldId) => {
          const list = STICKERS[worldId];
          const ownedCount = list.filter((s) => ownedSet.has(s.id)).length;

          return (
            <section key={worldId} className={styles.worldCard}>
              <div className={styles.worldHeader}>
                <h2 className={`t-title ${styles.worldTitle}`}>{t(`world.${worldId}`)}</h2>
                <span className="t-body">
                  {t('stickers.count', { n: ownedCount, total: list.length })}
                </span>
              </div>

              <div className={styles.grid}>
                {list.map((def) => {
                  const owned = ownedSet.has(def.id);
                  const objLabel =
                    def.kind === 'object'
                      ? content.objects.get(def.subject)?.name[locale] ?? def.subject
                      : t(`world.${worldId}`);

                  return (
                    <m.button
                      key={def.id}
                      type="button"
                      className={styles.stickerBtn}
                      disabled={!owned}
                      aria-label={objLabel}
                      onClick={() => handleStickerTap(def, owned)}
                      {...(owned ? pressProps(calm) : {})}
                    >
                      <Sticker stickerId={def.id} owned={owned} size={104} />
                    </m.button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
