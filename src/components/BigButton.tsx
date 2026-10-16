import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { AudioManager } from '@/services/AudioManager';

type Props = {
  /** Accessible name (read by screen readers, not spoken aloud). */
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  size?: 'tap' | 'big' | 'huge';
  showLabel?: boolean;
  pressed?: boolean;
  /** Background colour of the tile (defaults to the theme surface). */
  tint?: string;
  className?: string;
};

const sizes = {
  tap: 'w-[72px] h-[72px] p-2',
  big: 'w-24 h-24 p-3',
  huge: 'w-[9.5rem] h-[9.5rem] sm:w-44 sm:h-44 p-3',
};

/** Large, forgiving icon button with a soft click on tap. Labels never overflow the tile. */
export function BigButton({ label, icon, onClick, size = 'big', showLabel, pressed, tint, className = '' }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={() => {
        AudioManager.sfx('click', 'ui');
        onClick?.();
      }}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.93, y: 2 }}
      style={tint ? { background: tint, color: '#2b1d16' } : undefined}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-blob border-[5px] border-outline bg-surface text-text shadow-[0_6px_0_var(--outline)] transition-shadow hover:shadow-[0_10px_0_var(--outline)] ${sizes[size]} ${className}`}
    >
      <span className="flex min-h-0 w-full flex-1 items-center justify-center [&>svg]:h-full [&>svg]:max-h-full [&>svg]:w-full">
        {icon}
      </span>
      {showLabel && (
        <span className="line-clamp-2 w-full text-center font-ui text-base font-extrabold leading-tight sm:text-lg">{label}</span>
      )}
    </motion.button>
  );
}
