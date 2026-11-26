import { useEffect, useState } from 'react';
import { useCalmMotion } from '@/design/useCalmMotion';
import { countUpValue } from './countUp';

/** Counts up to `target`; with calm motion it is `target` straight away. */
export function useCountUp(target: number, durationMs: number): number {
  const calm = useCalmMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (calm) return;
    const start = performance.now();
    let id = 0;
    const tick = (now: number) => {
      setValue(countUpValue(now - start, target, durationMs));
      if (now - start < durationMs) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [calm, target, durationMs]);

  return calm ? target : value;
}
