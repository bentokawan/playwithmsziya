export interface BackgroundProps {
  readonly variant: 'home-door' | 'scene';
  readonly className?: string;
}

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
      {/* Layer 1: Sky */}
      <rect width="1600" height="1000" fill="#CDEFFF" />
      {/* Top clouds (outside safe zone y < 115) */}
      <g fill="#FFFFFF">
        <circle cx="130" cy="74" r="32" />
        <circle cx="165" cy="68" r="38" />
        <circle cx="202" cy="76" r="28" />
        <circle cx="1410" cy="72" r="30" />
        <circle cx="1448" cy="64" r="38" />
        <circle cx="1486" cy="74" r="28" />
      </g>
      {/* Layer 2: Far hill */}
      <path d="M0 680 Q360 580 780 640 T1600 620 L1600 1000 L0 1000 Z" fill="#9FE0C4" />
      {/* Layer 3: Ground */}
      <path d="M0 800 Q420 730 900 790 T1600 760 L1600 1000 L0 1000 Z" fill="#3DBE7A" />
      <path d="M0 900 Q520 865 1040 905 T1600 885 L1600 1000 L0 1000 Z" fill="#2FA866" />
      {/* Layer 4: Decor (left/right edges & bottom ground) */}
      {/* Round tree on left edge */}
      <rect x="82" y="750" width="28" height="110" rx="14" fill="#9A6338" />
      <circle cx="96" cy="715" r="64" fill="#2FA866" />
      <circle cx="96" cy="705" r="52" fill="#3DBE7A" />
      {/* 3 white-yellow flowers on ground */}
      {[
        { x: 260, y: 880 },
        { x: 1320, y: 870 },
        { x: 1470, y: 840 },
      ].map((f, i) => (
        <g key={i} transform={`translate(${f.x}, ${f.y})`}>
          <circle cx="0" cy="-12" r="9" fill="#FFFFFF" />
          <circle cx="12" cy="0" r="9" fill="#FFFFFF" />
          <circle cx="0" cy="12" r="9" fill="#FFFFFF" />
          <circle cx="-12" cy="0" r="9" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="8" fill="#FFB020" />
        </g>
      ))}
    </svg>
  );
}
