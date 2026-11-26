type Point = readonly [number, number];

/**
 * SVG path through `points` with rounded corners: every inner point becomes the
 * control point of a quadratic curve that ends at the midpoint to the next point.
 */
export function smoothPath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const [first] = points;
  if (points.length === 1) return `M ${first[0]} ${first[1]}`;
  if (points.length === 2) {
    return `M ${first[0]} ${first[1]} L ${points[1][0]} ${points[1][1]}`;
  }
  const parts = [`M ${first[0]} ${first[1]}`];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const next = points[i + 1];
    parts.push(`Q ${p[0]} ${p[1]} ${(p[0] + next[0]) / 2} ${(p[1] + next[1]) / 2}`);
  }
  const last = points[points.length - 1];
  parts.push(`L ${last[0]} ${last[1]}`);
  return parts.join(' ');
}
