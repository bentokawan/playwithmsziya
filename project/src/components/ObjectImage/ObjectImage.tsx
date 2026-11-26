import { usePreferences } from '@/app/providers/usePreferences';
import { useContent } from '@/lib/content/useContent';
import styles from './ObjectImage.module.css';

export interface ObjectImageProps {
  readonly objectId: string;
  readonly size?: number;
  readonly className?: string;
  readonly decorative?: boolean;
}

export function ObjectImage({
  objectId,
  size = 96,
  className,
  decorative = false,
}: ObjectImageProps) {
  const { content } = useContent();
  const { prefs } = usePreferences();
  const locale = prefs.locale ?? 'id';
  const obj = content.objects.get(objectId);
  const label = obj ? obj.name[locale] : objectId;

  if (!obj?.imageUrl) {
    return (
      <span
        className={className ? `${styles.placeholder} ${className}` : styles.placeholder}
        style={{ width: size, height: size }}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative ? true : undefined}
      />
    );
  }

  return (
    <img
      src={obj.imageUrl}
      alt={decorative ? '' : label}
      aria-hidden={decorative ? true : undefined}
      width={size}
      height={size}
      loading="eager"
      className={className ? `${styles.image} ${className}` : styles.image}
    />
  );
}
