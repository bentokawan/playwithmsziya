import { useEffect, useRef, useState } from 'react';
import {
  createClock,
  pauseClock,
  remainingAt,
  startClock,
  type Clock,
} from './countdown';

export interface UseCountdownOptions {
  readonly durationMs: number;
  readonly running: boolean;
  readonly onExpire?: () => void;
}

export function useCountdown({
  durationMs,
  running,
  onExpire,
}: UseCountdownOptions): { readonly remainingMs: number } {
  const [snapshot, setSnapshot] = useState(() => ({
    durationMs,
    remainingMs: durationMs,
  }));
  const [tabHidden, setTabHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  );
  const clockRef = useRef<Clock>(createClock(durationMs));
  const lastDurationRef = useRef(durationMs);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (lastDurationRef.current !== durationMs) {
      lastDurationRef.current = durationMs;
      clockRef.current = createClock(durationMs);
      expiredRef.current = false;
    }
  }, [durationMs]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const active = running && !tabHidden;

  useEffect(() => {
    if (!active) {
      clockRef.current = pauseClock(clockRef.current, Date.now());
      return;
    }

    if (expiredRef.current) return;

    clockRef.current = startClock(clockRef.current, Date.now());

    const id = window.setInterval(() => {
      const now = Date.now();
      const rem = remainingAt(clockRef.current, now);
      setSnapshot({ durationMs, remainingMs: rem });
      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clockRef.current = pauseClock(clockRef.current, now);
        onExpireRef.current?.();
      }
    }, 250);

    return () => {
      window.clearInterval(id);
      clockRef.current = pauseClock(clockRef.current, Date.now());
    };
  }, [active, durationMs]);

  const remainingMs = snapshot.durationMs === durationMs ? snapshot.remainingMs : durationMs;
  return { remainingMs };
}
