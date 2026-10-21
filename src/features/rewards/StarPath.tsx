import { motion, useReducedMotion } from 'framer-motion';
import { useProgress, STARS_PER_GIFT } from './progressStore';
import { openReadyGift } from './reward';

/** A wrapped present drawn in the shared style. */
export function GiftIcon({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden stroke="#4a2f27" strokeWidth={3.5} strokeLinejoin="round">
      <rect x="8" y="28" width="48" height="30" rx="4" fill="#ff8fb8" />
      <rect x="28" y="28" width="8" height="30" fill="#ffd23f" />
      <motion.g animate={open ? { y: -18, rotate: -14 } : { y: 0, rotate: 0 }} style={{ transformBox: 'fill-box', originX: 0, originY: 1 }}>
        <rect x="4" y="18" width="56" height="12" rx="4" fill="#ff6f91" />
        <rect x="28" y="18" width="8" height="12" fill="#ffd23f" />
        <path d="M32 18q-14-14-16-4q0 6 16 4zM32 18q14-14 16-4q0 6-16 4z" fill="#ffd23f" />
      </motion.g>
    </svg>
  );
}

function StarSlot({ filled, i }: { filled: boolean; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      aria-hidden
      initial={false}
      animate={filled && !reduce ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, delay: i * 0.02 }}
    >
      <path
        d="M12 2.5l2.9 6 6.6.8-4.8 4.6 1.2 6.6L12 17.3l-5.9 3.2 1.2-6.6L2.5 9.3l6.6-.8z"
        fill={filled ? '#ffd23f' : 'rgba(255,255,255,0.55)'}
        stroke="#4a2f27"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeDasharray={filled ? undefined : '2.5 2'}
      />
    </motion.svg>
  );
}

/**
 * Stars toward the next surprise: a row of star outlines that fill up; a full row
 * becomes a gift. Understood without reading. Tapping a ready gift opens it.
 */
export function StarPath({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const reduce = useReducedMotion();
  const path = useProgress((s) => s.starPath);
  const gifts = useProgress((s) => s.giftsReady);
  const star = size === 'lg' ? 'h-9 w-9 sm:h-11 sm:w-11' : size === 'sm' ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-7 w-7 sm:h-8 sm:w-8';
  const gift = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  return (
    <div className="flex items-center gap-2 rounded-full border-4 border-outline bg-surface/90 px-3 py-1.5 shadow-[0_4px_0_var(--outline)]" role="img" aria-label={`${path} of ${STARS_PER_GIFT} stars to the next present${gifts ? ', a present is ready' : ''}`}>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: STARS_PER_GIFT }, (_, i) => (
          <span key={i} className={star}>
            <StarSlot filled={gifts > 0 || i < path} i={i} />
          </span>
        ))}
      </div>
      {gifts > 0 ? (
        <motion.button
          type="button"
          aria-label="Open your present"
          onClick={openReadyGift}
          className={`${gift} shrink-0`}
          animate={reduce ? undefined : { rotate: [-8, 8, -8], y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <GiftIcon />
        </motion.button>
      ) : (
        <span className={`${gift} shrink-0 opacity-40 grayscale`} aria-hidden>
          <GiftIcon />
        </span>
      )}
    </div>
  );
}
