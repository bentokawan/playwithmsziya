import type { CharacterProps } from './types';

export function Kuku({ mood, size, className }: CharacterProps) {
  const eyeY = mood === 'thinking' ? 116 : 122;

  return (
    <svg
      width={size}
      height={Math.round((size * 220) / 300)}
      viewBox="0 0 300 220"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Feet */}
      <ellipse cx="96" cy="186" rx="24" ry="16" fill="#2FA866" />
      <ellipse cx="196" cy="186" rx="24" ry="16" fill="#2FA866" />
      {/* Tail */}
      <path d="M54 156 L28 164 L54 172 Z" fill="#3DBE7A" />
      {/* Blue checkered shell */}
      <path d="M52 160 C52 76 100 44 152 44 C204 44 242 78 242 160 Z" fill="#0A8FD6" />
      <rect x="96" y="76" width="44" height="36" rx="10" fill="#7FD3FF" />
      <rect x="152" y="76" width="44" height="36" rx="10" fill="#0670AE" />
      <rect x="122" y="118" width="52" height="34" rx="10" fill="#7FD3FF" />
      <rect x="46" y="152" width="202" height="22" rx="11" fill="#0670AE" />
      {/* Green head */}
      <circle cx="246" cy="128" r="42" fill="#3DBE7A" />
      {/* Cheeks */}
      <circle cx="228" cy="144" r="9" fill="#FFC2DC" />
      <circle cx="272" cy="144" r="9" fill="#FFC2DC" />
      {/* Eyes */}
      <circle cx="236" cy={eyeY} r="7" fill="#1B2559" />
      <circle cx="264" cy={eyeY} r="7" fill="#1B2559" />
      {mood === 'wow' && (
        <>
          <path d="M226 106 Q236 98 246 106" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M254 106 Q264 98 274 106" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
      {mood === 'happy' && (
        <path d="M238 148 Q250 160 262 148" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'thinking' && (
        <path d="M242 152 H258" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'wow' && <circle cx="250" cy="152" r="8" fill="#1B2559" />}
    </svg>
  );
}
