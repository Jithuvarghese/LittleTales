import { motion, useReducedMotion } from 'framer-motion';
import { Prop } from '@/art/props';

/** Gentle confetti of stars and hearts. Purely decorative. */
export function Celebration({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 37) % 100;
        return (
          <motion.div
            key={i}
            className="absolute h-12 w-12"
            style={{ left: `${left}%`, top: '-10%' }}
            animate={{ y: ['0vh', '115vh'], rotate: [0, 360] }}
            transition={{ duration: 2.4 + (i % 4) * 0.4, delay: (i % 7) * 0.12, ease: 'easeIn' }}
          >
            <Prop id={i % 3 === 0 ? 'heart' : 'star'} />
          </motion.div>
        );
      })}
    </div>
  );
}
