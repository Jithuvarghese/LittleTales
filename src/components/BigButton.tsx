import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { speak } from '@/services/speech';

type Props = {
  /** Spoken and used as the accessible name. */
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  size?: 'tap' | 'big' | 'huge';
  showLabel?: boolean;
  pressed?: boolean;
  className?: string;
};

const sizes = {
  tap: 'min-w-tap min-h-tap w-[72px] h-[72px] p-2',
  big: 'min-w-big min-h-big w-24 h-24 p-3',
  huge: 'w-36 h-36 sm:w-48 sm:h-48 p-4',
};

/** Large, forgiving icon button that speaks its label on hover and tap. */
export function BigButton({
  label,
  icon,
  onClick,
  size = 'big',
  showLabel,
  pressed,
  className = '',
}: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={() => {
        speak(label);
        onClick?.();
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && speak(label)}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      className={`flex flex-col items-center justify-center gap-1 rounded-blob border-[5px] border-outline bg-surface text-text shadow-[0_6px_0_var(--outline)] ${sizes[size]} ${className}`}
    >
      <span className="flex min-h-0 w-full flex-1 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
        {icon}
      </span>
      {showLabel && <span className="font-ui text-lg font-bold leading-tight">{label}</span>}
    </motion.button>
  );
}
