import type { AnimalId } from '@/lib/profiles/profiles';

export interface AnimalAvatarProps {
  readonly animal: AnimalId;
  readonly size?: number;
  readonly className?: string;
}

export function AnimalAvatar({ animal, size = 44, className }: AnimalAvatarProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    'aria-hidden': true as const,
    className,
  };

  switch (animal) {
    case 'kelinci':
      return (
        <svg {...common}>
          <ellipse cx="17" cy="13" rx="4.5" ry="10" fill="#FFFFFF" />
          <ellipse cx="31" cy="13" rx="4.5" ry="10" fill="#FFFFFF" />
          <ellipse cx="17" cy="14" rx="2.2" ry="6" fill="#FFC2DC" />
          <ellipse cx="31" cy="14" rx="2.2" ry="6" fill="#FFC2DC" />
          <circle cx="24" cy="29" r="13" fill="#FFFFFF" />
          <circle cx="19" cy="27" r="2.2" fill="#1B2559" />
          <circle cx="29" cy="27" r="2.2" fill="#1B2559" />
          <ellipse cx="24" cy="31" rx="2.4" ry="1.6" fill="#E8458B" />
          <path d="M20.5 34.5c1.5 1.5 5.5 1.5 7 0" stroke="#1B2559" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'kucing':
      return (
        <svg {...common}>
          <path d="M12 22L14 10L22 17H26L34 10L36 22A13 13 0 1112 22Z" fill="#FFF3DD" />
          <path d="M15 19L16 13L20 17Z" fill="#FFC2DC" />
          <path d="M33 19L32 13L28 17Z" fill="#FFC2DC" />
          <circle cx="19" cy="27" r="2.2" fill="#1B2559" />
          <circle cx="29" cy="27" r="2.2" fill="#1B2559" />
          <path d="M22.5 30.5h3L24 32.5Z" fill="#E8458B" />
          <path d="M20 34.5c1.5 1.5 6.5 1.5 8 0" stroke="#1B2559" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'beruang':
      return (
        <svg {...common}>
          <circle cx="13" cy="16" r="6" fill="#C48A5A" />
          <circle cx="35" cy="16" r="6" fill="#C48A5A" />
          <circle cx="13" cy="16" r="3" fill="#F0C8A0" />
          <circle cx="35" cy="16" r="3" fill="#F0C8A0" />
          <circle cx="24" cy="27" r="14" fill="#C48A5A" />
          <ellipse cx="24" cy="31" rx="6" ry="5" fill="#F0C8A0" />
          <circle cx="19" cy="25" r="2.2" fill="#1B2559" />
          <circle cx="29" cy="25" r="2.2" fill="#1B2559" />
          <ellipse cx="24" cy="29.5" rx="2.6" ry="1.8" fill="#1B2559" />
        </svg>
      );
    case 'panda':
      return (
        <svg {...common}>
          <circle cx="13" cy="15" r="5.5" fill="#1B2559" />
          <circle cx="35" cy="15" r="5.5" fill="#1B2559" />
          <circle cx="24" cy="27" r="14" fill="#FFFFFF" />
          <ellipse cx="18.5" cy="26" rx="4" ry="4.8" fill="#1B2559" />
          <ellipse cx="29.5" cy="26" rx="4" ry="4.8" fill="#1B2559" />
          <circle cx="19" cy="25.5" r="1.5" fill="#FFFFFF" />
          <circle cx="29" cy="25.5" r="1.5" fill="#FFFFFF" />
          <ellipse cx="24" cy="31" rx="2.4" ry="1.6" fill="#1B2559" />
        </svg>
      );
    case 'rubah':
      return (
        <svg {...common}>
          <path d="M11 23L13 9L22 17H26L35 9L37 23A13 13 0 1111 23Z" fill="#FF8A3D" />
          <path d="M14 29c3 6 7 9 10 9s7-3 10-9c-4-2-7-1-10 1-3-2-6-3-10-1Z" fill="#FFFFFF" />
          <circle cx="19" cy="26" r="2.2" fill="#1B2559" />
          <circle cx="29" cy="26" r="2.2" fill="#1B2559" />
          <circle cx="24" cy="32" r="2.2" fill="#1B2559" />
        </svg>
      );
    case 'katak':
      return (
        <svg {...common}>
          <circle cx="15" cy="17" r="6" fill="#3DBE7A" />
          <circle cx="33" cy="17" r="6" fill="#3DBE7A" />
          <circle cx="15" cy="17" r="3.2" fill="#FFFFFF" />
          <circle cx="33" cy="17" r="3.2" fill="#FFFFFF" />
          <circle cx="15.5" cy="17" r="1.8" fill="#1B2559" />
          <circle cx="33.5" cy="17" r="1.8" fill="#1B2559" />
          <ellipse cx="24" cy="29" rx="15" ry="12" fill="#3DBE7A" />
          <circle cx="14" cy="30" r="2.5" fill="#FFC2DC" />
          <circle cx="34" cy="30" r="2.5" fill="#FFC2DC" />
          <path d="M18 32c2.5 3 9.5 3 12 0" stroke="#1B2559" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'ayam':
      return (
        <svg {...common}>
          <path d="M20 13c0-3 2-5 4-5s4 2 4 5" fill="#FF6B6B" />
          <circle cx="24" cy="27" r="14" fill="#FFE29A" />
          <circle cx="19" cy="25" r="2.2" fill="#1B2559" />
          <circle cx="29" cy="25" r="2.2" fill="#1B2559" />
          <path d="M21 29h6l-3 4.5Z" fill="#FF8A3D" />
          <circle cx="15" cy="29" r="2.2" fill="#FFC2DC" />
          <circle cx="33" cy="29" r="2.2" fill="#FFC2DC" />
        </svg>
      );
    case 'gajah':
      return (
        <svg {...common}>
          <ellipse cx="10" cy="26" rx="7" ry="10" fill="#A9B8F5" />
          <ellipse cx="38" cy="26" rx="7" ry="10" fill="#A9B8F5" />
          <ellipse cx="10" cy="26" rx="4" ry="6.5" fill="#FFC2DC" />
          <ellipse cx="38" cy="26" rx="4" ry="6.5" fill="#FFC2DC" />
          <circle cx="24" cy="25" r="13" fill="#A9B8F5" />
          <path d="M22 28v8c0 2.5 2 4 4.5 4" stroke="#7E92E6" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="19" cy="23" r="2.2" fill="#1B2559" />
          <circle cx="29" cy="23" r="2.2" fill="#1B2559" />
        </svg>
      );
    case 'singa':
      return (
        <svg {...common}>
          <circle cx="24" cy="25" r="17" fill="#E67E22" />
          <circle cx="13" cy="14" r="5" fill="#F5B041" />
          <circle cx="35" cy="14" r="5" fill="#F5B041" />
          <circle cx="13" cy="14" r="2.6" fill="#FFE29A" />
          <circle cx="35" cy="14" r="2.6" fill="#FFE29A" />
          <circle cx="24" cy="26" r="12.5" fill="#FFD166" />
          <circle cx="19.5" cy="24.5" r="2.1" fill="#1B2559" />
          <circle cx="28.5" cy="24.5" r="2.1" fill="#1B2559" />
          <path d="M21.8 28.5h4.4L24 31Z" fill="#B85314" />
          <path d="M20.5 33c1.5 1.4 5.5 1.4 7 0" stroke="#1B2559" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'penguin':
      return (
        <svg {...common}>
          <circle cx="24" cy="26" r="15" fill="#2C3E6B" />
          <ellipse cx="19.5" cy="28" rx="6.5" ry="9" fill="#FFFFFF" />
          <ellipse cx="28.5" cy="28" rx="6.5" ry="9" fill="#FFFFFF" />
          <circle cx="18.5" cy="24" r="2.2" fill="#1B2559" />
          <circle cx="29.5" cy="24" r="2.2" fill="#1B2559" />
          <path d="M20.5 27.5h7L24 32Z" fill="#FF8A3D" />
          <circle cx="14.5" cy="28.5" r="2.2" fill="#FFC2DC" />
          <circle cx="33.5" cy="28.5" r="2.2" fill="#FFC2DC" />
        </svg>
      );
  }
}
