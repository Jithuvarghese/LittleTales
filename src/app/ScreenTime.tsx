import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterHost } from '@/components/CharacterHost';
import { AudioManager } from '@/services/AudioManager';
import { useProgress, dayKey } from '@/features/rewards/progressStore';
import { strings } from '@/strings';
import { useSettings } from './settingsStore';

const TICK_S = 15;

/** Counts time on the site and shows friendly stretch breaks and the daily limit. */
export function ScreenTime() {
  const sessionMinutes = useSettings((s) => s.sessionMinutes);
  const dailyLimit = useSettings((s) => s.dailyLimitMinutes);
  const [overlay, setOverlay] = useState<'stretch' | 'daily' | null>(null);
  const sessionSeconds = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden) return;
      useProgress.getState().tick(TICK_S);
      sessionSeconds.current += TICK_S;
      const today = useProgress.getState().secondsByDay[dayKey()] ?? 0;
      if (dailyLimit > 0 && today >= dailyLimit * 60) {
        setOverlay('daily');
        AudioManager.stopAll();
        AudioManager.say(strings.screenTime.dailyDone);
      } else if (sessionMinutes > 0 && sessionSeconds.current >= sessionMinutes * 60) {
        sessionSeconds.current = 0;
        setOverlay('stretch');
        AudioManager.say(strings.screenTime.stretch);
      }
    }, TICK_S * 1000);
    return () => clearInterval(t);
  }, [sessionMinutes, dailyLimit]);

  if (!overlay) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg/95 p-6 text-center" role="dialog" aria-modal="true">
      <CharacterHost character={overlay === 'daily' ? 'luna' : 'pip'} expression={overlay === 'daily' ? 'sleepy' : 'celebrate'} size={220} />
      <p className="max-w-xl font-ui text-4xl font-bold">{overlay === 'daily' ? strings.screenTime.dailyDone : strings.screenTime.stretch}</p>
      {overlay === 'stretch' ? (
        <button type="button" onClick={() => setOverlay(null)} className="min-h-big rounded-blob border-[5px] border-outline bg-accent px-10 font-ui text-3xl font-bold text-[#2b1d16]">
          {strings.screenTime.keepGoing}
        </button>
      ) : (
        <button type="button" onClick={() => { setOverlay(null); navigate('/grown-ups'); }} className="font-ui text-lg underline">
          {strings.nav.grownUps}
        </button>
      )}
    </div>
  );
}
