export type IconName =
  | 'back'
  | 'home'
  | 'sound-on'
  | 'sound-off'
  | 'fullscreen-enter'
  | 'fullscreen-exit'
  | 'settings'
  | 'play'
  | 'replay'
  | 'star'
  | 'lock'
  | 'check'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'hand-point'
  | 'listen'
  | 'trophy'
  | 'users'
  | 'link'
  | 'plus'
  | 'crown'
  | 'chevron-right'
  | 'close';

export interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  readonly className?: string;
}

export function Icon({ name, size = 28, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    className,
  };

  switch (name) {
    case 'back':
      return (
        <svg {...common}>
          <path d="M19 12H6" />
          <path d="M12 6l-6 6 6 6" />
        </svg>
      );
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11.5L12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
        </svg>
      );
    case 'sound-on':
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16.5 8.5a5 5 0 010 7" />
          <path d="M19.5 6a8.5 8.5 0 010 12" />
        </svg>
      );
    case 'sound-off':
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16.5 9.5l5 5" />
          <path d="M21.5 9.5l-5 5" />
        </svg>
      );
    case 'fullscreen-enter':
      return (
        <svg {...common}>
          <path d="M4 9V4h5" />
          <path d="M20 9V4h-5" />
          <path d="M4 15v5h5" />
          <path d="M20 15v5h-5" />
        </svg>
      );
    case 'fullscreen-exit':
      return (
        <svg {...common}>
          <path d="M9 4v5H4" />
          <path d="M15 4v5h5" />
          <path d="M9 20v-5H4" />
          <path d="M15 20v-5h5" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M7.5 4.8a1.5 1.5 0 012.28-1.28l10.2 6.2a1.5 1.5 0 010 2.56l-10.2 6.2A1.5 1.5 0 017.5 17.2V4.8z" />
        </svg>
      );
    case 'replay':
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 102.3-5.6" />
          <path d="M4 4v5h5" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2.4l2.92 5.92 6.53.95-4.72 4.6 1.12 6.5L12 17.3l-5.85 3.07 1.12-6.5-4.72-4.6 6.53-.95L12 2.4z" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2.5" />
          <path d="M8 11V7.5a4 4 0 018 0V11" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case 'arrow-up':
      return (
        <svg {...common}>
          <path d="M12 19V6" />
          <path d="M6 12l6-6 6 6" />
        </svg>
      );
    case 'arrow-down':
      return (
        <svg {...common}>
          <path d="M12 5v13" />
          <path d="M6 12l6 6 6-6" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...common}>
          <path d="M19 12H6" />
          <path d="M12 6l-6 6 6 6" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="M12 6l6 6-6 6" />
        </svg>
      );
    case 'hand-point':
      return (
        <svg {...common}>
          <path d="M10 11V4.5a1.5 1.5 0 013 0V10" />
          <path d="M13 9.5a1.5 1.5 0 013 0V11" />
          <path d="M16 10.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-2a5 5 0 01-4.5-2.8L5 14a1.5 1.5 0 012.6-1.5L10 15" />
        </svg>
      );
    case 'listen':
      return (
        <svg {...common}>
          <path d="M6 10a6 6 0 0112 0c0 3.5-2 4.5-3 6.5a3 3 0 01-5.5-.5" />
          <path d="M10 10a2 2 0 014 0c0 1.2-1 2-1.5 3" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
          <path d="M7 6H4v2a3 3 0 003 3" />
          <path d="M17 6h3v2a3 3 0 01-3 3" />
          <path d="M12 14v4" />
          <path d="M8 20h8" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8.5" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0111 0" />
          <circle cx="16.5" cy="9.5" r="2.5" />
          <path d="M15.5 19h5a4.5 4.5 0 00-4-4.4" />
        </svg>
      );
    case 'link':
      return (
        <svg {...common}>
          <path d="M10 14a4 4 0 005.66 0l2.83-2.83a4 4 0 00-5.66-5.66L11.4 6.9" />
          <path d="M14 10a4 4 0 00-5.66 0l-2.83 2.83a4 4 0 005.66 5.66l1.42-1.42" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M3 18l1.5-10 4.5 4 3-6 3 6 4.5-4L21 18H3z" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      );
  }
}
