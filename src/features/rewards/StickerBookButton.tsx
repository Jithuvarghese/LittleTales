import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { stickerData } from '@/content/loaders';
import { Prop } from '@/art/props';
import { StarIcon } from '@/art/Icons';
import { AudioManager } from '@/services/AudioManager';
import { strings } from '@/strings';
import { useProgress } from './progressStore';

/** Progress ring around the book button (share of all stickers collected). */
function ProgressRing({ share }: { share: number }) {
  const c = 2 * Math.PI * 46;
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(74,47,39,0.15)" strokeWidth="6" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#3c8f3f" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${share * c} ${c}`} />
    </svg>
  );
}

/**
 * The sticker book as a picture button: the latest sticker inside, a progress
 * ring, and a bouncing dot while a new sticker is waiting. Rewards fly here.
 */
export function StickerBookButton({ size = 'tap', showLabel = false }: { size?: 'tap' | 'huge'; showLabel?: boolean }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const owned = useProgress((s) => s.stickers);
  const last = useProgress((s) => s.lastSticker);
  const hasNew = useProgress((s) => s.newSticker !== null);
  const latest = stickerData.stickers.find((s) => s.id === last);
  const share = owned.length / Math.max(1, stickerData.stickers.length);
  const box = size === 'huge' ? 'w-[9.5rem] h-[9.5rem] sm:w-44 sm:h-44 p-3' : 'w-[72px] h-[72px] p-2';

  return (
    <motion.button
      type="button"
      data-sticker-book=""
      aria-label={`${strings.nav.stickers}${hasNew ? ': a new sticker is waiting' : ''}`}
      onClick={() => {
        AudioManager.sfx('click', 'ui');
        navigate('/stickers');
      }}
      animate={hasNew && !reduce ? { rotate: [0, -8, 8, -4, 0] } : undefined}
      transition={hasNew ? { duration: 0.8, repeat: Infinity, repeatDelay: 1.2 } : undefined}
      whileTap={reduce ? undefined : { scale: 0.93 }}
      className={`relative flex shrink-0 flex-col items-center justify-center gap-1 rounded-blob border-[5px] border-outline bg-[#fff6c9] text-[#2b1d16] shadow-[0_6px_0_var(--outline)] ${box}`}
    >
      <span className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <ProgressRing share={share} />
        <span className="block h-[70%] w-[70%]">{latest ? <Prop id={latest.prop} /> : <StarIcon />}</span>
      </span>
      {showLabel && <span className="font-ui text-base font-extrabold leading-tight sm:text-lg">{strings.nav.stickers}</span>}
      {hasNew && (
        <motion.span
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-[3px] border-outline bg-[#e8553f]"
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          aria-hidden
        />
      )}
    </motion.button>
  );
}
