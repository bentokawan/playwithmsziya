import { useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  getOrCreateRoomController,
  type RoomControllerOptions,
  type RoomViewSnapshot,
} from './roomSession';

export function useRoomSession(opts: RoomControllerOptions): {
  readonly state: RoomViewSnapshot['state'];
  readonly connStatus: RoomViewSnapshot['connStatus'];
  readonly localProgress: RoomViewSnapshot['localProgress'];
  readonly setReady: (ready: boolean) => void;
  readonly confirmCountdownDone: () => void;
  readonly reportLocal: ReturnType<typeof getOrCreateRoomController>['reportLocal'];
  readonly rematch: () => void;
  readonly leave: () => void;
} {
  const controller = useMemo(
    () => getOrCreateRoomController(opts),
    // Recreate controller only if code or role changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opts.code, opts.role],
  );

  useEffect(() => {
    controller.setOpts(opts);
  }, [controller, opts]);

  const snap = useSyncExternalStore(
    (cb) => {
      controller.listeners.add(cb);
      return () => {
        controller.listeners.delete(cb);
      };
    },
    () => controller.snapshotCache,
  );

  return {
    state: snap.state,
    connStatus: snap.connStatus,
    localProgress: snap.localProgress,
    setReady: controller.setReady,
    confirmCountdownDone: controller.confirmCountdownDone,
    reportLocal: controller.reportLocal,
    rematch: controller.rematch,
    leave: controller.leave,
  };
}
