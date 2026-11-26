import type { CharacterProps } from './types';

export function Lulu({ mood, size, className }: CharacterProps) {
  const eyeY = mood === 'thinking' ? 142 : 148;

  return (
    <svg
      width={size}
      height={Math.round((size * 280) / 220)}
      viewBox="0 0 220 280"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Crescent hat */}
      <path d="M104 20 A34 34 0 1 0 146 66 A26 26 0 1 1 104 20 Z" fill="#FFB020" />
      {/* Lantern top cap */}
      <rect x="74" y="68" width="72" height="22" rx="11" fill="#5A6CC4" />
      {/* Round lantern body */}
      <ellipse cx="110" cy="160" rx="74" ry="76" fill="#FFE29A" />
      <ellipse cx="110" cy="160" rx="56" ry="66" fill="#FFF3DD" />
      {/* Lantern bottom cap */}
      <rect x="72" y="232" width="76" height="20" rx="10" fill="#5A6CC4" />
      {/* Cheeks */}
      <circle cx="74" cy="168" r="10" fill="#FFC2DC" />
      <circle cx="146" cy="168" r="10" fill="#FFC2DC" />
      {/* Eyes */}
      <circle cx="90" cy={eyeY} r="7.5" fill="#1B2559" />
      <circle cx="130" cy={eyeY} r="7.5" fill="#1B2559" />
      {mood === 'wow' && (
        <>
          <path d="M78 130 Q90 122 102 130" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M118 130 Q130 122 142 130" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
      {mood === 'happy' && (
        <path d="M96 174 Q110 188 124 174" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'thinking' && (
        <path d="M100 178 H120" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'wow' && <circle cx="110" cy="178" r="9" fill="#1B2559" />}
    </svg>
  );
}
