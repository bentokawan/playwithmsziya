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
      {/* Layer 1: Sky */}
      <rect width="1600" height="1000" fill="#FFF0F6" />
      {/* 3 blue clouds (outside safe zone) */}
      <g fill="#7FD3FF">
        <circle cx="110" cy="72" r="28" />
        <circle cx="145" cy="64" r="36" />
        <circle cx="180" cy="74" r="26" />
        <circle cx="780" cy="62" r="24" />
        <circle cx="812" cy="56" r="30" />
        <circle cx="844" cy="64" r="22" />
        <circle cx="1420" cy="76" r="28" />
        <circle cx="1456" cy="68" r="36" />
        <circle cx="1490" cy="78" r="26" />
      </g>
      {/* Layer 2: Far hill */}
      <path d="M0 675 Q380 585 800 645 T1600 620 L1600 1000 L0 1000 Z" fill="#FFC2DC" />
      {/* Layer 3: Ground */}
      <path d="M0 800 Q440 735 920 795 T1600 765 L1600 1000 L0 1000 Z" fill="#F48FB8" />
      <path d="M0 905 Q520 870 1060 910 T1600 885 L1600 1000 L0 1000 Z" fill="#E8769F" />
      {/* Layer 4: 2 lollipops at edges */}
      <g transform="translate(105, 760)">
        <rect x="-7" y="0" width="14" height="115" rx="7" fill="#FFFFFF" />
        <circle cx="0" cy="-16" r="46" fill="#E8458B" />
        <circle cx="0" cy="-16" r="30" fill="#FFC2DC" />
        <circle cx="0" cy="-16" r="14" fill="#FFFFFF" />
      </g>
      <g transform="translate(1485, 755)">
        <rect x="-7" y="0" width="14" height="115" rx="7" fill="#FFFFFF" />
        <circle cx="0" cy="-16" r="46" fill="#0A8FD6" />
        <circle cx="0" cy="-16" r="30" fill="#7FD3FF" />
        <circle cx="0" cy="-16" r="14" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
