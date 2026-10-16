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

/** Round green tick badge (stories read, right answers). */
export const CheckBadge = (p: IconProps) => (
  <svg {...base} viewBox="0 0 48 48" strokeWidth={4} {...p}>
    <circle cx="24" cy="24" r="20" fill="var(--success)" />
    <path d="M14 25l7 7 13-15" stroke="#fff" strokeWidth={5} />
  </svg>
);

export const SkipIcon = (p: IconProps) => (
  <svg {...base} viewBox="0 0 48 48" {...p}>
    <path d="M10 12l14 12-14 12z" fill="#cfd6e0" />
    <path d="M24 12l14 12-14 12z" fill="#cfd6e0" />
    <path d="M40 12v24" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base} viewBox="0 0 48 48" {...p}>
    <path d="M8 24h28M26 12l12 12-12 12" />
  </svg>
);

export const KeyboardIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="14" width="56" height="36" rx="8" fill="#8fd18a" />
    {[12, 22, 32, 42, 52].map((x) => <rect key={`a${x}`} x={x - 3} y="21" width="6" height="6" rx="1.5" fill="#fff" strokeWidth={2} />)}
    {[17, 27, 37, 47].map((x) => <rect key={`b${x}`} x={x - 3} y="31" width="6" height="6" rx="1.5" fill="#fff" strokeWidth={2} />)}
    <rect x="20" y="41" width="24" height="5" rx="2" fill="#fff" strokeWidth={2} />
  </svg>
);

export const QuestionIcon = (p: IconProps) => (
  <svg {...base} viewBox="0 0 48 48" {...p}>
    <path d="M17 18a7 7 0 1 1 10 6q-3 2-3 6" />
    <circle cx="24" cy="37" r="2.5" fill="var(--outline)" />
  </svg>
);

/** Game controller for the Games section. */
export const GamesIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 22h36q10 0 10 14v6q0 10-8 10-6 0-10-8H22q-4 8-10 8-8 0-8-10v-6q0-14 10-14z" fill="#6bc1ff" />
    <path d="M18 31v10M13 36h10" />
    <circle cx="44" cy="33" r="3" fill="#ffcb47" />
    <circle cx="50" cy="39" r="3" fill="#ff8a6b" />
  </svg>
);
