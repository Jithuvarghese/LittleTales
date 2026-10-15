import type { SVGProps } from 'react';

/** Simple picture-book style navigation icons (thick outline, flat fill). */
type IconProps = SVGProps<SVGSVGElement>;
const base = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'var(--outline)',
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const BookIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 14q12-6 24 2v36q-12-8-24-2z" fill="#ff8a6b" />
    <path d="M56 14q-12-6-24 2v36q12-8 24-2z" fill="#6bc1ff" />
  </svg>
);

export const AbcIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="6" y="10" width="52" height="44" rx="12" fill="#ffcb47" />
    <path d="M16 44l7-22 7 22M19 37h8M36 22v22h6a5 5 0 0 0 0-11h-6m0 0h5a5 5 0 0 0 0-11h-5" />
  </svg>
);

export const NumbersIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="6" y="10" width="52" height="44" rx="12" fill="#8fd18a" />
    <path d="M16 26l5-4v22M30 27a5 5 0 0 1 10 0c0 6-10 10-10 17h10M46 23h6l-4 8a6 6 0 1 1-4 10" />
  </svg>
);

export const MusicIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M24 46V14l26-6v32" />
    <circle cx="18" cy="46" r="7" fill="#c9a0ff" />
    <circle cx="44" cy="40" r="7" fill="#c9a0ff" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path
      d="M32 6l7.6 16.4 17.9 2-13.3 12.2 3.7 17.6L32 45.3l-15.9 8.9 3.7-17.6L6.5 24.4l17.9-2z"
      fill="#ffd23f"
    />
  </svg>
);

export const LockIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="14" y="28" width="36" height="28" rx="6" fill="#cfd6e0" />
    <path d="M22 28v-8a10 10 0 0 1 20 0v8" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 30L32 10l24 20" />
    <path d="M14 26v28h36V26" fill="#ffcb47" />
    <rect x="27" y="38" width="10" height="16" rx="3" fill="#ff8a6b" />
  </svg>
);

export const BackIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="32" cy="32" r="26" fill="#6bc1ff" />
    <path d="M36 18L22 32l14 14M23 32h20" />
  </svg>
);
