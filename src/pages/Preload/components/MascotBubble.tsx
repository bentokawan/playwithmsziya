import styles from './MascotBubble.module.css';

interface MascotBubbleProps {
  /** Teks balon ucapan, mengikuti bahasa terpilih */
  greeting: string;
  /** Sumber gambar maskot Ms Ziya */
  imageSrc: string;
}

export function MascotBubble({ greeting, imageSrc }: MascotBubbleProps) {
  return (
    <div className={styles.avatar}>
      <img className={styles.illustration} src={imageSrc} alt="Maskot Ms Ziya" draggable={false} />
      <span className={styles.bubble}>{greeting}</span>
    </div>
  );
}
