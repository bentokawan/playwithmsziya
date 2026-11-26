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
      {/* Layer 1: Warm sky */}
      <rect width="1600" height="1000" fill="#FFF3DD" />
      {/* Layer 2: Sea */}
      <path d="M0 660 Q400 620 800 660 T1600 650 L1600 1000 L0 1000 Z" fill="#7FD3FF" />
      {/* White waves */}
      <path
        d="M80 710 Q130 695 180 710 M1390 705 Q1445 690 1500 705"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Layer 3: Sand */}
      <path d="M0 800 Q440 740 920 795 T1600 765 L1600 1000 L0 1000 Z" fill="#F2B36F" />
      <path d="M0 905 Q520 870 1050 910 T1600 885 L1600 1000 L0 1000 Z" fill="#E3A15A" />
      {/* Layer 4: Palm tree on right edge */}
      <g transform="translate(1490, 790)">
        <path d="M0 90 Q-18 10 -6 -95" stroke="#9A6338" strokeWidth="26" strokeLinecap="round" fill="none" />
        <ellipse cx="-52" cy="-98" rx="48" ry="18" transform="rotate(-18 -52 -98)" fill="#3DBE7A" />
        <ellipse cx="42" cy="-96" rx="48" ry="18" transform="rotate(20 42 -96)" fill="#3DBE7A" />
        <ellipse cx="-24" cy="-126" rx="44" ry="16" transform="rotate(-40 -24 -126)" fill="#2FA866" />
        <ellipse cx="26" cy="-124" rx="44" ry="16" transform="rotate(38 26 -124)" fill="#2FA866" />
      </g>
      {/* 2 shells on sand */}
      {[
        { x: 145, y: 885 },
        { x: 1320, y: 900 },
      ].map((s, i) => (
        <g key={i} transform={`translate(${s.x}, ${s.y})`}>
          <path d="M-24 8 A24 24 0 0 1 24 8 Z" fill="#FFF0F6" />
          <rect x="-14" y="6" width="28" height="8" rx="4" fill="#FFC2DC" />
        </g>
      ))}
    </svg>
  );
}
