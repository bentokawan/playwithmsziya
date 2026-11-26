import type { BackgroundProps } from '@/worlds/angka/Background';

export function Background({ variant, className }: BackgroundProps) {
  const style =
    variant === 'scene'
      ? ({ position: 'absolute', inset: 0, width: '100%', height: '100%' } as const)
      : ({ position: 'absolute', inset: 0, width: '100%', height: '100%' } as const);

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Layer 1: Twilight sky */}
      <rect width="1600" height="1000" fill="#DCE6FF" />
      {/* Crescent moon (top-right edge) */}
      <path
        d="M1480 42 A46 46 0 1 0 1536 108 A36 36 0 1 1 1480 42 Z"
        fill="#FFE29A"
      />
      {/* 4 small stars (top edges) */}
      {[
        { x: 110, y: 68 },
        { x: 185, y: 102 },
        { x: 1380, y: 70 },
        { x: 1525, y: 150 },
      ].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r="7" fill="#FFE29A" />
      ))}
      {/* Layer 2: Far hill */}
      <path d="M0 670 Q400 590 820 650 T1600 625 L1600 1000 L0 1000 Z" fill="#A9B8F5" />
      {/* Layer 3: Ground */}
      <path d="M0 800 Q460 735 940 790 T1600 765 L1600 1000 L0 1000 Z" fill="#6C7FD8" />
      <path d="M0 905 Q500 870 1040 910 T1600 885 L1600 1000 L0 1000 Z" fill="#5A6CC4" />
      {/* Layer 4: 2 decorative lanterns at left/right edges */}
      {[100, 1495].map((x, i) => (
        <g key={i} transform={`translate(${x}, 790)`}>
          <rect x="-24" y="-36" width="48" height="62" rx="18" fill="#FFE29A" />
          <rect x="-14" y="-48" width="28" height="14" rx="6" fill="#5A6CC4" />
          <rect x="-18" y="24" width="36" height="10" rx="5" fill="#5A6CC4" />
        </g>
      ))}
    </svg>
  );
}
