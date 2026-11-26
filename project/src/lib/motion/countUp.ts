/** Integer that eases (out-cubic) from 0 to `target` over `durationMs`. */
export function countUpValue(elapsedMs: number, target: number, durationMs: number): number {
  if (target <= 0) return 0;
  if (durationMs <= 0 || elapsedMs >= durationMs) return target;
  if (elapsedMs <= 0) return 0;
  const p = elapsedMs / durationMs;
  const eased = 1 - Math.pow(1 - p, 3);
  return Math.min(target, Math.floor(eased * target));
}
