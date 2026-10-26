import { StatusPill } from './components/StatusPill';
import { MascotBubble } from './components/MascotBubble';
import { LoadingBar } from './components/LoadingBar';
import { usePreloadProgress } from './usePreloadProgress';
import styles from './PreloadPage.module.css';
import mascotImg from '../../assets/mascot-ziya.png';

// TODO(i18n): pindahkan teks ke src/i18n/{id,en}.json saat modul bahasa dibuat (Fase 1.7)
const TEXT = {
  assetStatus: 'Audio & Font Siap',
  musicStatus: 'Musik Lembut Aktif',
  greeting: 'Halo!',
  title: 'Play with Ms Ziya',
  subtitle: 'Ruang Belajar Ceria Usia 4–6 Tahun',
  footerLeft: 'Lingkungan Ramah Anak & Aman',
  footerRight: '100% Bebas Iklan',
} as const;

export function PreloadPage() {
  const { progress, message } = usePreloadProgress();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <StatusPill label={TEXT.assetStatus} showDot />
        <StatusPill label={TEXT.musicStatus} showSoundIcon />
      </header>

      <section className={styles.center} aria-label="Memuat aplikasi">
        <MascotBubble greeting={TEXT.greeting} imageSrc={mascotImg} />

        <h1 className={styles.title}>{TEXT.title}</h1>
        <p className={styles.subtitle}>{TEXT.subtitle}</p>

        <div className={styles.progressRow}>
          <LoadingBar value={progress} />
          <div className={styles.statusRow}>
            <span className={styles.statusMessage}>{message}</span>
            <span className={styles.percent}>{Math.round(progress)}%</span>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        {TEXT.footerLeft}
        <span className={styles.footerDot} aria-hidden="true">
          •
        </span>
        {TEXT.footerRight}
      </footer>
    </main>
  );
}
