import { useId } from 'react';
import { createPressTracker } from './pressTracker';

const sharedTracker = createPressTracker();

export interface UsePressOptions {
  readonly disabled?: boolean;
  readonly isSubmit?: boolean;
}

export interface PressHandlers {
  readonly onPointerDown: (e: React.PointerEvent) => void;
  readonly onPointerUp: (e: React.PointerEvent) => void;
  readonly onPointerCancel: (e: React.PointerEvent) => void;
  readonly onKeyDown: (e: React.KeyboardEvent) => void;
  readonly onClick: (e: React.MouseEvent) => void;
}

export function usePress(
  onPress: (() => void) | undefined,
  opts: UsePressOptions = {},
): PressHandlers {
  const targetKey = useId();
  const disabled = Boolean(opts.disabled) || !onPress;

  return {
    onPointerDown(e) {
      if (disabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      sharedTracker.down(e.pointerId, targetKey);
    },
    onPointerUp(e) {
      if (disabled) {
        sharedTracker.cancel(e.pointerId);
        return;
      }
      if (sharedTracker.up(e.pointerId, targetKey)) {
        onPress();
      }
    },
    onPointerCancel(e) {
      sharedTracker.cancel(e.pointerId);
    },
    onKeyDown(e) {
      if (disabled) return;
      if (opts.isSubmit && e.key === 'Enter') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPress();
      }
    },
    onClick(e) {
      if (disabled) return;
      // Screen readers and programmatic element.click() fire click with detail === 0
      if (e.detail === 0 && !opts.isSubmit) {
        onPress();
      }
    },
  };
}
