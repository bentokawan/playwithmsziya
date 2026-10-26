import styles from './BottomDock.module.css';

interface BottomDockProps {
  readonly childName: string;
  readonly streakDays: number;
  readonly totalStars: number;
  readonly onOpenParentGate: () => void;
}

export function BottomDock({
  childName,
  streakDays,
  totalStars,
  onOpenParentGate,
}: BottomDockProps) {
  return (
    <footer className={styles.dockWrapper}>
      <aside className={styles.dock} aria-label="Status Pemain dan Pengaturan">
        {/* Modul 1: Profil Anak */}
        <div className={styles.profileModule}>
          <div className={styles.childAvatar} aria-hidden="true">
            🧒
          </div>
          <div className={styles.profileText}>
            <span className={styles.childName}>{childName}</span>
            <span className={styles.streakText}>🔥 {streakDays} hari berturut</span>
          </div>
        </div>

        {/* Modul 2: Total Bintang */}
        <div className={styles.starModule} aria-label={`Total ${totalStars} bintang terkumpul`}>
          <span className={styles.starIcon} aria-hidden="true">
            ⭐
          </span>
          <span className={styles.starCount}>{totalStars} Bintang</span>
        </div>

        <div className={styles.spacer} aria-hidden="true" />

        {/* Modul 3: Tombol Area Orang Tua */}
        <button
          type="button"
          className={styles.parentButton}
          onClick={onOpenParentGate}
          title="Tahan 3 detik untuk akses Pengaturan Orang Tua"
          aria-label="Area Orang Tua, tahan 3 detik"
        >
          <span className={styles.lockIcon} aria-hidden="true">
            🔒
          </span>
          <span className={styles.parentLabel}>Orang Tua</span>
        </button>
      </aside>
    </footer>
  );
}
