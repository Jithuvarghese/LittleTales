import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import type { ReactNode } from 'react';
import { CheckBadge } from '@/art/Icons';

type Props = {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  state?: 'idle' | 'hint' | 'right' | 'wrong' | 'dim';
  className?: string;
  disabled?: boolean;
};

const ring: Record<NonNullable<Props['state']>, string> = {
  idle: '',
  hint: 'ring-8 ring-hint',
  right: 'ring-8 ring-success',
  wrong: '',
  dim: 'opacity-50',
};

/** Big answer tile used by quizzes. Never red; hints glow and wiggle, right answers bounce. */
export function Tile({ label, children, onClick, state = 'idle', className = '', disabled }: Props) {
  const reduce = useReducedMotion();
  const anim: TargetAndTransition | undefined = reduce
    ? undefined
    : state === 'hint'
      ? { rotate: [0, -6, 6, -4, 0], transition: { duration: 0.6, repeat: 2 } }
      : state === 'right'
        ? { scale: [1, 1.15, 1], transition: { duration: 0.5 } }
        : state === 'wrong'
          ? { x: [0, -6, 6, 0], transition: { duration: 0.3 } }
          : undefined;
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      animate={anim}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      className={`relative flex min-h-[120px] min-w-[120px] items-center justify-center rounded-blob border-[5px] border-outline bg-surface p-3 shadow-[0_6px_0_var(--outline)] ${ring[state]} ${className}`}
    >
      {children}
      {state === 'right' && (
        <span className="absolute -right-3 -top-3 h-11 w-11" aria-hidden>
          <CheckBadge />
        </span>
      )}
    </motion.button>
  );
}
