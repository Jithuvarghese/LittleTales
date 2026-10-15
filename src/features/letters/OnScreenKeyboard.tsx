import { motion, useReducedMotion } from 'framer-motion';
import { NUMBER_ROW, QWERTY } from './keys';

type Props = {
  target?: string | null;
  hint?: boolean;
  pressed?: { key: string; n: number } | null;
  onKey: (key: string) => void;
  numbers?: boolean;
  letters?: boolean;
  letterCase?: 'upper' | 'lower' | 'both';
};

/** Large QWERTY keyboard; tappable on touch devices, animates physical presses. */
export function OnScreenKeyboard({ target, hint, pressed, onKey, numbers = false, letters = true, letterCase = 'upper' }: Props) {
  const reduce = useReducedMotion();
  const rows = [...(numbers ? [NUMBER_ROW] : []), ...(letters ? QWERTY : [])];
  return (
    <div className="flex w-full max-w-5xl select-none flex-col items-center gap-2" role="group" aria-label="Keyboard">
      {rows.map((row) => (
        <div key={row} className="flex justify-center gap-1 sm:gap-2">
          {row.split('').map((k) => {
            const isTarget = target === k;
            const isPressed = pressed?.key === k;
            return (
              <motion.button
                key={isPressed ? `${k}-${pressed?.n}` : k}
                type="button"
                aria-label={k}
                onClick={() => onKey(k)}
                animate={
                  reduce
                    ? undefined
                    : isPressed
                      ? { y: [0, 6, 0], transition: { duration: 0.2 } }
                      : isTarget && hint
                        ? { scale: [1, 1.15, 1], transition: { duration: 0.9, repeat: Infinity } }
                        : undefined
                }
                className={`flex h-12 w-8 items-center justify-center rounded-xl border-4 border-outline font-story text-xl font-bold shadow-[0_4px_0_var(--outline)] sm:h-16 sm:w-14 sm:text-3xl lg:h-[72px] lg:w-[72px] ${
                  isTarget && hint ? 'bg-accent text-[#2b1d16]' : isPressed ? 'bg-hint text-white' : 'bg-surface text-text'
                }`}
              >
                {letterCase === 'lower' ? k.toLowerCase() : k}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
