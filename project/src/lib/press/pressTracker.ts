export interface PressTracker {
  down(pointerId: number, targetKey: string): void;
  up(pointerId: number, targetKey: string): boolean;
  cancel(pointerId: number): void;
}

export function createPressTracker(): PressTracker {
  const active = new Map<number, string>();

  return {
    down(pointerId: number, targetKey: string) {
      active.set(pointerId, targetKey);
    },
    up(pointerId: number, targetKey: string): boolean {
      const started = active.get(pointerId);
      active.delete(pointerId);
      return started === targetKey;
    },
    cancel(pointerId: number) {
      active.delete(pointerId);
    },
  };
}
