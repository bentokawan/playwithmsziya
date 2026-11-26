import { STICKERS, type StickerId } from '@/content/stickers';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import styles from './Sticker.module.css';

export interface StickerProps {
  readonly stickerId: StickerId;
  readonly owned: boolean;
  readonly size?: number;
}

const ALL_DEFS = new Map(
  Object.values(STICKERS)
    .flat()
    .map((s) => [s.id, s]),
);

export function Sticker({ stickerId, owned, size = 112 }: StickerProps) {
  const def = ALL_DEFS.get(stickerId);
  const worldClass = def ? styles[`world-${def.worldId}`] : '';

  return (
    <div
      className={[styles.sticker, owned ? worldClass : styles.unowned].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    >
      <div className={owned ? undefined : styles.silhouette}>
        {def?.kind === 'object' ? (
          <ObjectImage objectId={def.subject} size={Math.round(size * 0.62)} decorative={!owned} />
        ) : (
          <span className={styles.charBadge} aria-hidden="true">
            ★
          </span>
        )}
      </div>
    </div>
  );
}
