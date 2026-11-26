import type { DifficultyId } from '@/lib/session/session';
import type { PreviewSpec } from '../previews';

export interface TemplateProps {
  readonly spec: PreviewSpec;
  readonly level: DifficultyId;
  /** true = render the final frame immediately, no motion. */
  readonly calm: boolean;
}
