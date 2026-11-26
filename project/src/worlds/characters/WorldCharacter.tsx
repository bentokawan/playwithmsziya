import type { WorldId } from '@/games/ids';
import { Jeje } from './Jeje';
import { Kuku } from './Kuku';
import { Lulu } from './Lulu';
import { Pipi } from './Pipi';
import type { CharacterProps } from './types';

export function WorldCharacter({
  worldId,
  ...props
}: CharacterProps & { readonly worldId: WorldId }) {
  switch (worldId) {
    case 'angka':
      return <Jeje {...props} />;
    case 'huruf':
      return <Pipi {...props} />;
    case 'hijaiyyah':
      return <Lulu {...props} />;
    case 'memori':
      return <Kuku {...props} />;
  }
}
