import { describe, expect, it } from 'vitest';
import { createPressTracker } from './pressTracker';

describe('createPressTracker (Task 6)', () => {
  it('tracks two simultaneous pointers on different targets independently', () => {
    const tracker = createPressTracker();
    tracker.down(1, 'a');
    tracker.down(2, 'b');
    expect(tracker.up(2, 'b')).toBe(true);
    expect(tracker.up(1, 'a')).toBe(true);
  });

  it('rejects pointer up on a different target than pointer down', () => {
    const tracker = createPressTracker();
    tracker.down(1, 'a');
    expect(tracker.up(1, 'b')).toBe(false);
  });

  it('rejects pointer up after cancel', () => {
    const tracker = createPressTracker();
    tracker.down(1, 'a');
    tracker.cancel(1);
    expect(tracker.up(1, 'a')).toBe(false);
  });
});
