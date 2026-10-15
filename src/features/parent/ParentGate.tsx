import { useEffect, useRef, useState, type FormEvent } from 'react';
import { strings } from '@/strings';
import { LockIcon } from '@/art/Icons';
import { HOLD_MS, checkAnswer, makeChallenge, useGate } from './gate';

/** Hold for 3 seconds, then answer a sum. Not based on reading ability alone. */
export function ParentGate() {
  const unlock = useGate((s) => s.unlock);
  const [stage, setStage] = useState<'hold' | 'ask'>('hold');
  const [progress, setProgress] = useState(0);
  const [challenge, setChallenge] = useState(makeChallenge);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);
  const holdStart = useRef<number | null>(null);
  const raf = useRef<number>();

  const tick = () => {
    if (holdStart.current === null) return;
    const p = Math.min(1, (performance.now() - holdStart.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      holdStart.current = null;
      setStage('ask');
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const begin = () => {
    holdStart.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  const cancel = () => {
    holdStart.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    setProgress(0);
  };
  useEffect(() => () => cancel(), []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (checkAnswer(challenge, answer)) unlock();
    else {
      setWrong(true);
      setAnswer('');
      setChallenge(makeChallenge());
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="font-ui text-4xl font-extrabold">{strings.parent.gateTitle}</h1>
      {stage === 'hold' ? (
        <>
          <p className="font-ui text-xl">{strings.parent.gateHold}</p>
          <button
            type="button"
            aria-label={strings.parent.gateHold}
            onPointerDown={begin}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && begin()}
            onKeyUp={cancel}
            className="relative h-36 w-36 touch-none rounded-full border-[6px] border-outline bg-surface"
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray={`${progress * 276} 276`} />
            </svg>
            <span className="absolute inset-8"><LockIcon /></span>
          </button>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col items-center gap-4">
          <label htmlFor="gate-answer" className="font-ui text-2xl">{strings.parent.gateQuestion(challenge.a, challenge.b)}</label>
          <input
            id="gate-answer"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-40 rounded-2xl border-4 border-outline bg-surface p-3 text-center font-ui text-3xl text-text"
          />
          {wrong && <p role="alert" className="font-ui text-lg">{strings.parent.gateWrong}</p>}
          <button type="submit" className="min-h-tap rounded-2xl border-4 border-outline bg-primary px-8 font-ui text-2xl font-bold text-on-primary">
            {strings.parent.gateEnter}
          </button>
        </form>
      )}
    </div>
  );
}
