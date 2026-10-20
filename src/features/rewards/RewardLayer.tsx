import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { Prop } from '@/art/props';
import { StarIcon } from '@/art/Icons';
import { stickerData } from '@/content/loaders';
import { AudioManager } from '@/services/AudioManager';
import { uiLineSrc } from '@/content/voicing';
import { strings } from '@/strings';
import { useProgress, type Award } from './progressStore';
import { useReward } from './reward';
import { GiftIcon, StarPath } from './StarPath';

const say = (text: string, queue = false) => AudioManager.say(text, { role: 'quizHost', delivery: 'excited', src: uiLineSrc(text), talker: 'pip', queue });

/** Where the sticker-book button is on screen (fly target). */
function bookTarget() {
  const el = document.querySelector('[data-sticker-book]');
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth - 50, y: 50 };
}

/** A sticker drawn as a round badge (shiny copies get a golden ring). */
export function StickerBadge({ id, shiny }: { id: string; shiny?: boolean }) {
  const st = stickerData.stickers.find((s) => s.id === id);
  if (!st) return null;
  return (
    <div className={`h-full w-full rounded-full border-[5px] bg-surface p-[12%] shadow-[0_6px_0_var(--outline)] ${shiny ? 'border-[#e0a800] ring-4 ring-[#ffd23f]' : 'border-outline'}`}>
      <Prop id={st.prop} title={st.label} />
    </div>
  );
}

function GiftMoment({ album, intro, onDone }: { album?: string; intro?: boolean; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'wrapped' | 'open' | 'fly'>('wrapped');
  const [award, setAward] = useState<Award | null>(null);
  const opened = useRef(false);

  const open = () => {
    if (opened.current) return;
    opened.current = true;
    const progress = useProgress.getState();
    const a = intro ? progress.giveIntroGift() : progress.takeGift(album);
    setAward(a);
    setPhase('open');
    AudioManager.sfx('tada');
    if (!a) return void setTimeout(onDone, 1200);
    say(a.shiny ? strings.rewards.shiny : strings.rewards.earned);
    say(strings.rewards.albumLine[a.album as keyof typeof strings.rewards.albumLine] ?? strings.rewards.earned, true);
    if (a.albumComplete) say(strings.rewards.albumDone, true);
    setTimeout(() => setPhase('fly'), 2600);
    setTimeout(onDone, 3600);
  };

  useEffect(() => {
    say(strings.rewards.present);
    // Opens by itself after 4 seconds if nobody taps.
    const t = setTimeout(open, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const holder = useRef<HTMLDivElement>(null);
  // Distance from where the sticker sits now to the sticker-book button.
  const fly = (() => {
    if (phase !== 'fly' || !holder.current) return null;
    const r = holder.current.getBoundingClientRect();
    const t = bookTarget();
    return { x: t.x - (r.left + r.width / 2), y: t.y - (r.top + r.height / 2) };
  })();
  return (
    <div className="flex flex-col items-center gap-4">
      {phase !== 'wrapped' && <Celebration count={award?.albumComplete ? 30 : 18} />}
      <CharacterHost character="pip" pose={phase === 'wrapped' ? 'talk' : 'cheer'} size={130} />
      <div className="relative h-44 w-44">
        <AnimatePresence>
          {phase === 'wrapped' && (
            <motion.button
              key="gift"
              type="button"
              aria-label={strings.rewards.openGift}
              onClick={open}
              className="absolute inset-0"
              animate={reduce ? undefined : { rotate: [-6, 6, -6], scale: [1, 1.05, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.25 } }}
            >
              <GiftIcon />
            </motion.button>
          )}
        </AnimatePresence>
        {award && phase !== 'wrapped' && (
          <motion.div
            ref={holder}
            className="absolute inset-0 z-[60]"
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            animate={
              fly && !reduce
                ? { scale: 0.3, x: fly.x, y: fly.y, rotate: 20, transition: { duration: 0.8, ease: 'easeIn' } }
                : { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 13 } }
            }
          >
            <StickerBadge id={award.id} shiny={award.shiny} />
          </motion.div>
        )}
      </div>
      {phase === 'wrapped' && (
        <p className="sr-only">{strings.rewards.present}</p>
      )}
    </div>
  );
}

/** Rendered once in the app: shows the gift or star moment requested by any activity. */
export function RewardLayer() {
  const moment = useReward((s) => s.moment);
  const close = useReward((s) => s.close);

  useEffect(() => {
    if (moment?.kind !== 'stars') return;
    say(strings.rewards.moreStars);
    const t = setTimeout(close, 3200);
    return () => clearTimeout(t);
  }, [moment, close]);

  return (
    <AnimatePresence>
      {moment && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b1d16]/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={moment.kind === 'gift' ? strings.rewards.present : strings.rewards.moreStars}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={moment.kind === 'stars' ? close : undefined}
        >
          <motion.div
            className="flex w-full max-w-lg flex-col items-center gap-4 rounded-[2.5rem] border-[5px] border-outline bg-surface px-5 pb-6 pt-6 shadow-[0_10px_0_var(--outline)]"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {moment.kind === 'gift' ? (
              <GiftMoment album={moment.album} intro={moment.intro} onDone={close} />
            ) : (
              <>
                <CharacterHost character="pip" pose="happy" size={120} />
                <StarPath />
                <button type="button" onClick={close} className="min-h-[72px] rounded-blob border-[5px] border-outline bg-accent px-8 font-ui text-2xl font-extrabold text-[#2b1d16] shadow-[0_6px_0_var(--outline)]" aria-label={strings.rewards.ok}>
                  <span className="block h-10 w-10" aria-hidden><StarIcon /></span>
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
