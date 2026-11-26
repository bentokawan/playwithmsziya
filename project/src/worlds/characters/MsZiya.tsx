import type { CharacterProps } from './types';

export function MsZiya({ mood, size, className }: CharacterProps) {
  const eyeY = mood === 'thinking' ? 128 : 134;

  return (
    <svg
      width={size}
      height={Math.round((size * 300) / 240)}
      viewBox="0 0 240 300"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Waving hand */}
      <circle cx="204" cy="170" r="20" fill="#FFD9B8" />
      <rect x="178" y="176" width="32" height="58" rx="16" transform="rotate(18 178 176)" fill="#0A8FD6" />
      {/* Torso (blue dress) */}
      <path d="M44 296 C44 226 76 200 120 200 C164 200 196 226 196 296 Z" fill="#0A8FD6" />
      <path d="M88 202 L120 232 L152 202 Z" fill="#7FD3FF" />
      {/* Hijab outer (pink) */}
      <path
        d="M44 134 C44 68 78 36 120 36 C162 36 196 68 196 134 C196 194 176 232 120 232 C64 232 44 194 44 134 Z"
        fill="#E8458B"
      />
      <path d="M56 172 C56 210 82 232 120 232 C158 232 184 210 184 172" fill="#B8306C" />
      {/* Inner hijab band */}
      <ellipse cx="120" cy="134" rx="58" ry="62" fill="#FFC2DC" />
      {/* Face */}
      <ellipse cx="120" cy="138" rx="50" ry="54" fill="#FFD9B8" />
      {/* Cheeks */}
      <circle cx="88" cy="152" r="10" fill="#FFC2DC" />
      <circle cx="152" cy="152" r="10" fill="#FFC2DC" />
      {/* Eyes */}
      <circle cx="100" cy={eyeY} r="7" fill="#1B2559" />
      <circle cx="140" cy={eyeY} r="7" fill="#1B2559" />
      {mood === 'wow' && (
        <>
          <path d="M90 116 Q100 108 110 116" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M130 116 Q140 108 150 116" stroke="#1B2559" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M104 160 Q120 176 136 160" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'thinking' && (
        <path d="M110 164 H130" stroke="#1B2559" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'wow' && (
        <circle cx="120" cy="166" r="10" fill="#1B2559" />
      )}
    </svg>
  );
}
