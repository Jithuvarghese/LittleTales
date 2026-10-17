import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { taskFor, type BreakTask } from './breakTasks';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CharacterHost } from '@/components/CharacterHost';
import { AudioManager } from '@/services/AudioManager';
import { useProgress, dayKey } from '@/features/rewards/progressStore';
import { uiLineSrc } from '@/content/voicing';
import { strings } from '@/strings';
import { useSettings } from './settingsStore';

const TICK_S = 15;

/** Counts time on the site and shows friendly stretch breaks and the daily limit. */
export function ScreenTime() {
  const sessionMinutes = useSettings((s) => s.sessionMinutes);
  const dailyLimit = useSettings((s) => s.dailyLimitMinutes);
  const [overlay, setOverlay] = useState<'stretch' | 'daily' | null>(() =>
    // Development preview: add ?preview=stretch or ?preview=daily to the address.
    import.meta.env.DEV ? ((new URLSearchParams(location.search).get('preview') as 'stretch' | 'daily' | null) ?? null) : null,
  );
  const sessionSeconds = useRef(0);
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const [task, setTask] = useState<BreakTask>(() => taskFor(pathname));

  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden || overlay) return;
      useProgress.getState().tick(TICK_S);
      sessionSeconds.current += TICK_S;
      const today = useProgress.getState().secondsByDay[dayKey()] ?? 0;
      if (dailyLimit > 0 && today >= dailyLimit * 60) {
        setOverlay('daily');
        AudioManager.stopAll();
        AudioManager.say(strings.screenTime.dailyDone, { role: 'quizHost', delivery: 'gentle', src: uiLineSrc(strings.screenTime.dailyDone) });
      } else if (sessionMinutes > 0 && sessionSeconds.current >= sessionMinutes * 60) {
        sessionSeconds.current = 0;
        // A small task linked to what the child was doing (count, find a colour, hop like a bunny).
        const t = taskFor(location.pathname);
        setTask(t);
        setOverlay('stretch');
        AudioManager.stopVoice();
        AudioManager.say(strings.screenTime.stretch, { role: 'quizHost', delivery: 'excited', src: uiLineSrc(strings.screenTime.stretch), talker: t.host });
        AudioManager.say(t.text, { role: 'quizHost', delivery: 'excited', src: uiLineSrc(t.text), talker: t.host, queue: true });
      }
    }, TICK_S * 1000);
    return () => clearInterval(t);
  }, [sessionMinutes, dailyLimit, overlay]);

  const daily = overlay === 'daily';

  return (
    <AnimatePresence>
      {overlay && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2b1d16]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="break-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-[2.5rem] border-[5px] border-outline bg-surface px-6 pb-7 pt-8 text-center text-text shadow-[0_10px_0_var(--outline)]"
            initial={reduce ? false : { scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <motion.div animate={!reduce && !daily ? { y: [0, -14, 0] } : undefined} transition={{ repeat: Infinity, duration: 1.2 }}>
              <CharacterHost character={daily ? 'luna' : task.host} pose={daily ? 'sleepy' : task.pose} size={150} />
            </motion.div>
            <h2 id="break-title" className="font-ui text-3xl font-extrabold leading-tight sm:text-4xl">
              {daily ? strings.screenTime.dailyTitle : strings.screenTime.stretchTitle}
            </h2>
            <p className="font-ui text-xl leading-snug sm:text-2xl">{daily ? strings.screenTime.dailyDone : task.text}</p>
            {daily ? (
              <button type="button" onClick={() => { setOverlay(null); navigate('/grown-ups'); }} className="min-h-[56px] rounded-full px-6 font-ui text-lg underline">
                {strings.nav.grownUps}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  AudioManager.sfx('tada', 'ui');
                  AudioManager.react(task.host, 'yay');
                  useProgress.getState().addStars(1);
                  setOverlay(null);
                }}
                className="min-h-[72px] w-full max-w-xs rounded-blob border-[5px] border-outline bg-accent px-8 font-ui text-2xl font-extrabold text-[#2b1d16] shadow-[0_6px_0_var(--outline)]"
              >
                {strings.screenTime.keepGoing}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
