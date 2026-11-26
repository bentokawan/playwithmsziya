export interface FrameScheduler {
  schedule(): void;
  cancel(): void;
}

export function createFrameScheduler(
  paint: () => void,
  raf: (cb: FrameRequestCallback) => number,
  caf: (id: number) => void,
): FrameScheduler {
  let pendingId: number | null = null;

  return {
    schedule() {
      if (pendingId !== null) return;
      pendingId = raf(() => {
        pendingId = null;
        paint();
      });
    },
    cancel() {
      if (pendingId === null) return;
      const id = pendingId;
      pendingId = null;
      caf(id);
    },
  };
}
