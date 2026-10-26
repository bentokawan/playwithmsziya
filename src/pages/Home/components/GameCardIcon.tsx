import type { GameIconType } from '../types';
import styles from './GameCardIcon.module.css';

interface GameCardIconProps {
  readonly iconType: GameIconType;
}

export function GameCardIcon({ iconType }: GameCardIconProps) {
  switch (iconType) {
    case 'ayo-berhitung':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Apple */}
          <circle cx="20" cy="34" r="12" fill="#FF6B6B" />
          <path d="M20 22C21 19 24 18 25 18" stroke="#3CCB7F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Orange */}
          <circle cx="44" cy="34" r="12" fill="#FFA94D" />
          <circle cx="44" cy="27" r="2" fill="#3CCB7F" />
          {/* Banana / Pear in front */}
          <ellipse cx="32" cy="40" rx="9" ry="11" fill="#FFD200" />
          {/* Badge 123 */}
          <rect x="18" y="46" width="28" height="14" rx="7" fill="#1F2A5C" />
          <text x="32" y="56" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-display)">
            123
          </text>
        </svg>
      );

    case 'menulis-angka':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tracing path for number 5 */}
          <path
            d="M38 18H24V32C24 32 28 29 34 29C40 29 44 33 44 39C44 45 39 49 32 49C26 49 23 45 23 45"
            stroke="#4DB8FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 6"
          />
          {/* Pencil */}
          <path d="M46 14L52 20L36 36L30 36L30 30L46 14Z" fill="#FFA94D" />
          <path d="M30 36L28 40L32 38L30 36Z" fill="#1F2A5C" />
          <circle cx="24" cy="18" r="4" fill="#3CCB7F" />
        </svg>
      );

    case 'susun-kata':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Block A */}
          <rect x="8" y="24" width="16" height="18" rx="4" fill="#FF6B6B" />
          <text x="16" y="37" fill="#FFFFFF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-display)">
            A
          </text>
          {/* Block P */}
          <rect x="24" y="16" width="16" height="26" rx="4" fill="#FFA94D" />
          <text x="32" y="33" fill="#FFFFFF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-display)">
            P
          </text>
          {/* Block L */}
          <rect x="40" y="24" width="16" height="18" rx="4" fill="#4DB8FF" />
          <text x="48" y="37" fill="#FFFFFF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-display)">
            L
          </text>
        </svg>
      );

    case 'bunyi-awal':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ear outline */}
          <path
            d="M24 16C17 16 12 21 12 28C12 37 18 42 22 48C24 51 26 51 28 48C30 45 32 39 32 32C32 23 29 16 24 16Z"
            stroke="#FF6B6B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Sound waves */}
          <path d="M34 22C38 24 40 28 40 32C40 36 38 40 34 42" stroke="#FFA94D" strokeWidth="3" strokeLinecap="round" />
          <path d="M41 17C47 21 50 26 50 32C50 38 47 43 41 47" stroke="#FFD200" strokeWidth="3" strokeLinecap="round" />
          {/* Letter B Badge */}
          <circle cx="22" cy="32" r="7" fill="#1F2A5C" />
          <text x="22" y="36" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-display)">
            B
          </text>
        </svg>
      );

    case 'menulis-huruf':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tracing letter A */}
          <path
            d="M18 48L32 16L46 48"
            stroke="#FF6B6B"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 6"
          />
          <path d="M23 37H41" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 5" />
          {/* Start guide dot */}
          <circle cx="18" cy="48" r="4.5" fill="#3CCB7F" />
          {/* Mini pencil tip */}
          <circle cx="32" cy="16" r="3" fill="#FFA94D" />
        </svg>
      );

    case 'dengar-temukan':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Arabic Ba ب */}
          <path
            d="M48 28C48 38 42 42 32 42C22 42 16 38 16 28"
            stroke="#3DE6CF"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="50" r="3.5" fill="#3DE6CF" />
          {/* Mini speaker */}
          <path d="M42 16L46 13V25L42 22H38V16H42Z" fill="#1F2A5C" />
          <path d="M49 16C51 17.5 52 20.5 49 22" stroke="#1F2A5C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'tebalkan-hijaiyyah':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Arabic Jeem ج */}
          <path
            d="M20 20H44L34 32C42 35 44 42 40 48C36 53 26 53 20 46"
            stroke="#3DE6CF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 6"
          />
          {/* Dot in belly */}
          <circle cx="30" cy="42" r="3.5" fill="#FFA94D" />
          {/* Start dot */}
          <circle cx="20" cy="20" r="4.5" fill="#3CCB7F" />
        </svg>
      );

    case 'kartu-kembar':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Back card */}
          <rect x="14" y="16" width="22" height="32" rx="4" fill="#E8E4DF" stroke="#9B8CFF" strokeWidth="2" />
          <path d="M20 28L30 36M30 28L20 36" stroke="#9B8CFF" strokeWidth="2" strokeLinecap="round" />
          {/* Front card with star */}
          <rect x="28" y="20" width="22" height="32" rx="4" fill="#FFFFFF" stroke="#9B8CFF" strokeWidth="2.5" />
          <path
            d="M39 28L40.5 31.5L44 32L41.5 34.5L42 38L39 36.5L36 38L36.5 34.5L34 32L37.5 31.5L39 28Z"
            fill="#FFD200"
          />
        </svg>
      );

    case 'petualangan-labirin':
      return (
        <svg className={styles.iconSvg} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Maze lines */}
          <path
            d="M16 16H48V48H16V26H38V38H26"
            stroke="#9B8CFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Start point */}
          <circle cx="16" cy="16" r="3.5" fill="#3CCB7F" />
          {/* Finish flag */}
          <path d="M26 38V30L34 34L26 38Z" fill="#FF6B6B" />
          <line x1="26" y1="30" x2="26" y2="44" stroke="#1F2A5C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
