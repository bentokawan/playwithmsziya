import type { WorldId } from '@/games/ids';
import { Background as AngkaBg, type BackgroundProps } from './angka/Background';
import { Background as HijaiyyahBg } from './hijaiyyah/Background';
import { Background as HurufBg } from './huruf/Background';
import { Background as MemoriBg } from './memori/Background';

export function WorldBackground({
  worldId,
  variant,
  className,
}: BackgroundProps & { readonly worldId: WorldId }) {
  switch (worldId) {
    case 'angka':
      return <AngkaBg variant={variant} className={className} />;
    case 'huruf':
      return <HurufBg variant={variant} className={className} />;
    case 'hijaiyyah':
      return <HijaiyyahBg variant={variant} className={className} />;
    case 'memori':
      return <MemoriBg variant={variant} className={className} />;
  }
}
