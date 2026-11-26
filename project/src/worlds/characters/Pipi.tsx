import type { CharacterProps } from './types';

export function Pipi({ mood, size, className }: CharacterProps) {
  const eyeY = mood === 'thinking' ? 112 : 118;

  return (
    <svg
      width={size}
      height={Math.round((size * 220) / 360)}
      viewBox="0 0 360 220"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Cloud bottom shadow */}
      <rect x="46" y="132" width="268" height="62" rx="31" fill="#F48FB8" />
      {/* Fluffy pink cloud body */}
      <circle cx="96" cy="130" r="54" fill="#FFC2DC" />
      <circle cx="152" cy="92" r="64" fill="#FFC2DC" />
      <circle cx="222" cy="96" r="60" fill="#FFC2DC" />
      <circle cx="268" cy="132" r="50" fill="#FFC2DC" />
      <rect x="86" y="124" width="188" height="60" rx="30" fill="#FFC2DC" />
      {/* Cheeks */}
      <circle cx="128" cy="140" r="12" fill="#F48FB8" />
      <circle cx="232" cy="140" r="12" fill="#F48FB8" />
      {/* Eyes */}
      <circle cx="152" cy={eyeY} r="9" fill="#1B2559" />
      <circle cx="208" cy={eyeY} r="9" fill="#1B2559" />
      {mood === 'wow' && (
        <>
          <path d="M138 98 Q152 88 166 98" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
          <path d="M194 98 Q208 88 222 98" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {mood === 'happy' && (
        <path d="M164 142 Q180 158 196 142" stroke="#1B2559" strokeWidth="5.5" strokeLinecap="round" />
      )}
      {mood === 'thinking' && (
        <path d="M168 146 H192" stroke="#1B2559" strokeWidth="5.5" strokeLinecap="round" />
      )}
      {mood === 'wow' && <circle cx="180" cy="148" r="11" fill="#1B2559" />}
    </svg>
  );
}
