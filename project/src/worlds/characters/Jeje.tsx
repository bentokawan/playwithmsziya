import type { CharacterProps } from './types';

export function Jeje({ mood, size, className }: CharacterProps) {
  const eyeY = mood === 'thinking' ? 68 : 74;

  return (
    <svg
      width={size}
      height={Math.round((size * 420) / 220)}
      viewBox="0 0 220 420"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Horns (ossicones) */}
      <rect x="82" y="18" width="12" height="32" rx="6" fill="#0670AE" />
      <circle cx="88" cy="18" r="10" fill="#FFB020" />
      <rect x="126" y="18" width="12" height="32" rx="6" fill="#0670AE" />
      <circle cx="132" cy="18" r="10" fill="#FFB020" />
      {/* Ears */}
      <ellipse cx="52" cy="64" rx="22" ry="12" transform="rotate(-18 52 64)" fill="#0A8FD6" />
      <ellipse cx="168" cy="64" rx="22" ry="12" transform="rotate(18 168 64)" fill="#0A8FD6" />
      {/* Tall upright neck */}
      <rect x="76" y="110" width="68" height="230" rx="34" fill="#0A8FD6" />
      {/* Spots on neck */}
      <circle cx="96" cy="165" r="12" fill="#7FD3FF" />
      <circle cx="124" cy="215" r="14" fill="#7FD3FF" />
      <circle cx="96" cy="268" r="11" fill="#7FD3FF" />
      {/* Body base */}
      <ellipse cx="110" cy="366" rx="72" ry="48" fill="#0A8FD6" />
      <ellipse cx="110" cy="378" rx="48" ry="30" fill="#7FD3FF" />
      {/* Small hands */}
      <ellipse cx="52" cy="340" rx="18" ry="12" fill="#0670AE" />
      <ellipse cx="168" cy="340" rx="18" ry="12" fill="#0670AE" />
      {/* Head */}
      <ellipse cx="110" cy="82" rx="52" ry="44" fill="#0A8FD6" />
      <ellipse cx="110" cy="98" rx="36" ry="22" fill="#CDEFFF" />
      {/* Cheeks */}
      <circle cx="74" cy="92" r="9" fill="#FFC2DC" />
      <circle cx="146" cy="92" r="9" fill="#FFC2DC" />
      {/* Eyes */}
      <circle cx="90" cy={eyeY} r="7" fill="#1B2559" />
      <circle cx="130" cy={eyeY} r="7" fill="#1B2559" />
      {mood === 'wow' && (
        <>
          <path d="M80 58 Q90 50 100 58" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M120 58 Q130 50 140 58" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
      {mood === 'happy' && (
        <path d="M96 98 Q110 112 124 98" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'thinking' && (
        <path d="M100 102 H120" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'wow' && <circle cx="110" cy="102" r="9" fill="#1B2559" />}
    </svg>
  );
}
