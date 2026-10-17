import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { StoryPage } from '@/content/schema';
import { Scene, type Pulse } from '@/art/Scene';
import type { Pose } from '@/art/cast/Character';
import { talk } from '@/art/cast/talk';
import { species } from '@/art/cast/species';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { ambienceFor } from '@/services/synth';
import { splitParts, type Delivery, type Role } from '@/content/voicing';

export type ReadingMode = 'read-to-me' | 'parent-reads' | 'i-try';

type Props = {
  page: StoryPage;
  mode: ReadingMode;
  onNarrationEnd: () => void;
  storyAmbience?: string;
};

/** How characters without a set pose react to the mood of the line. */
const moodPose: Partial<Record<Delivery, Pose>> = {
  excited: 'happy',
  surprised: 'surprised',
  sleepy: 'sleepy',
  sad: 'sad-soft',
  silly: 'dance',
  proud: 'cheer',
};

/** Seconds of no tapping before tappable things start to glow. */
const HINT_AFTER_MS = 4000;

/** One story page: an acting scene with tappable things, plus large highlightable text. */
export function StoryPageView({ page, mode, onNarrationEnd, storyAmbience }: Props) {
  const reduce = useReducedMotion();
  const [word, setWord] = useState(-1);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [talker, setTalker] = useState<string | null>(null);
  const [cuePoses, setCuePoses] = useState<Record<string, Pose>>({});
  const [hint, setHint] = useState(false);
  const tapped = useRef(new Set<string>());
  const letterCase = useSettings((s) => s.letterCase);
  const words = page.text.split(/\s+/).filter(Boolean);
  const sceneChars = useMemo(() => new Set(page.scene?.characters.map((c) => c.id) ?? []), [page]);

  // Which part (narrator or a character) owns each word, for mouths and bubbles.
  const parts = useMemo(() => {
    const split = splitParts(page.text, { delivery: page.delivery, speaker: page.speaker as Role | undefined });
    const counts = split.map((p) => p.text.split(/\s+/).filter(Boolean).length);
    return split.map((p, i) => {
      const from = counts.slice(0, i).reduce((a, b) => a + b, 0);
      return { ...p, from, to: from + counts[i]! - 1 };
    });
  }, [page]);
  const activePart = parts.find((p) => word >= p.from && word <= p.to);

  // Mood reaction for characters without an explicit pose on this page.
  const basePoses = useMemo(() => {
    const mood = moodPose[(page.delivery ?? 'narrator') as Delivery];
    const out: Record<string, Pose> = {};
    if (mood) for (const c of page.scene?.characters ?? []) if (!c.pose && (!c.expression || c.expression === 'idle')) out[c.id] = mood;
    return out;
  }, [page]);

  const onWordIndex = (i: number) => {
    setWord(i);
    // Timeline cues up to this word.
    const due = page.timeline.filter((t) => t.word <= i);
    if (due.length) setCuePoses(Object.fromEntries(due.map((t) => [t.id, t.pose as Pose])));
    // The speaking character's mouth follows the voice.
    const part = parts.find((p) => i >= p.from && i <= p.to);
    const who = part && part.role !== 'narrator' && sceneChars.has(part.role) ? part.role : null;
    setTalker(who);
    talk.setTalker(who ?? 'narrator');
  };

  useEffect(() => {
    setWord(-1);
    setCuePoses({});
    setTalker(null);
    setHint(false);
    tapped.current = new Set();
    AudioManager.ambience((page.ambience ?? storyAmbience ?? ambienceFor(page.scene?.backdrop)) as Parameters<typeof AudioManager.ambience>[0]);
    page.sfx.filter((s) => s.trigger === 'onEnter').forEach((s) => AudioManager.sfx(s.src));
    const hintTimer = setTimeout(() => setHint(true), HINT_AFTER_MS);
    if (mode !== 'read-to-me') return () => clearTimeout(hintTimer);
    const wordSfx = new Map(page.sfx.filter((s) => s.trigger.startsWith('onWord:')).map((s) => [Number(s.trigger.split(':')[1]), s.src]));
    const t = setTimeout(() => {
      AudioManager.say(page.text, {
        src: page.narration?.src,
        wordTimings: page.narration?.wordTimings,
        delivery: page.delivery,
        speaker: page.speaker as Role | undefined,
        onWord: (i) => {
          onWordIndex(i);
          const sfx = wordSfx.get(i);
          if (sfx) AudioManager.sfx(sfx);
        },
        onEnd: () => {
          setWord(-1);
          setTalker(null);
          talk.setTalker(null);
          onNarrationEnd();
        },
      });
    }, 500);
    return () => {
      clearTimeout(t);
      clearTimeout(hintTimer);
      AudioManager.stopVoice();
      talk.setTalker(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, mode]);

  const display = (w: string) => (letterCase === 'upper' ? w.toUpperCase() : w);
  const bubbleChar = talker && activePart && activePart.role === talker ? page.scene?.characters.find((c) => c.id === talker) : undefined;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 lg:flex-row lg:gap-6">
      {/* Picture is limited by screen height too, so text and buttons always fit. */}
      <div className="mx-auto w-full min-w-0 lg:mx-0 lg:w-[55%]" style={{ maxWidth: 'min(48rem, max(16rem, calc((100dvh - 20rem) * 1.6)))' }}>
        {page.scene && (
          <Scene scene={page.scene} pulse={pulse} poses={{ ...basePoses, ...cuePoses }} speaker={talker} label={page.hotspots.map((h) => h.label ?? h.id).join(', ')}>
            {/* Speech bubble over the character who is talking */}
            <AnimatePresence>
              {bubbleChar && (
                <motion.div
                  key={`${bubbleChar.id}-${activePart?.from}`}
                  className="pointer-events-none absolute z-10 max-w-[46%] rounded-[1.2rem] border-[3px] border-outline bg-white px-3 py-1.5 text-center font-story text-sm font-bold leading-snug text-[#2b1d16] shadow-[0_3px_0_var(--outline)] sm:text-lg"
                  style={{
                    left: `${Math.min(76, Math.max(24, bubbleChar.x))}%`,
                    top: `${Math.max(2, bubbleChar.y - bubbleChar.size * 0.95)}%`,
                    translateX: '-50%',
                  }}
                  initial={reduce ? false : { scale: 0.6, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  {activePart?.text.replace(/^["“]|["”]$/g, '')}
                </motion.div>
              )}
            </AnimatePresence>
            {page.hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-label={h.label ?? h.id}
                className={`absolute z-20 rounded-full ${hint && !tapped.current.has(h.id) ? 'lt-hint-pulse' : ''}`}
                style={{ left: `${h.shape.x}%`, top: `${h.shape.y}%`, width: `${h.shape.w}%`, height: `${h.shape.h}%`, minWidth: 72, minHeight: 72 }}
                onClick={() => {
                  if (h.onTap.sfx) AudioManager.sfx(h.onTap.sfx);
                  const isCharacter = sceneChars.has(h.id);
                  if (h.onTap.say) {
                    AudioManager.say(h.onTap.say, {
                      channel: 'narration',
                      src: h.onTap.sayAudio,
                      role: isCharacter && h.id in species ? (h.id as Role) : 'narrator',
                      delivery: 'silly',
                      talker: isCharacter ? h.id : undefined,
                    });
                  }
                  // Characters with no line of their own giggle or cheer.
                  if (!h.onTap.say && isCharacter) AudioManager.react(h.id, tapped.current.size % 2 ? 'whee' : 'giggle');
                  // First tap on each thing earns a star.
                  if (!tapped.current.has(h.id)) {
                    tapped.current.add(h.id);
                    useProgress.getState().addStars(1);
                    AudioManager.sfx('sparkle', 'ui');
                  }
                  setHint(false);
                  setPulse((p) => ({ id: h.id, anim: h.onTap.animate ?? 'wiggle', n: (p?.n ?? 0) + 1 }));
                }}
              />
            ))}
          </Scene>
        )}
      </div>
      <div className="flex w-full min-w-0 flex-col items-center gap-3 lg:w-[45%]">
        <p className="story-text story-page-text w-full max-w-full rounded-blob bg-surface px-4 py-3 text-center text-text sm:px-5 sm:py-4" lang="en">
          {/* Real spaces between words so lines only ever break between whole words. */}
          {words.map((w, i) => (
            <Fragment key={i}>
              {i > 0 ? ' ' : null}
              {mode === 'i-try' ? (
                <button
                  type="button"
                  className={`inline-block rounded-xl px-1 underline decoration-dotted decoration-2 underline-offset-8 ${word === i ? 'bg-accent' : ''}`}
                  onClick={() => {
                    setWord(i);
                    AudioManager.say(w.replace(/[^\w']/g, ''), { onEnd: () => setWord(-1) });
                  }}
                >
                  {display(w)}
                </button>
              ) : (
                <span className={`inline-block rounded-xl px-1 transition-colors ${word === i ? 'bg-accent' : ''}`}>{display(w)}</span>
              )}
            </Fragment>
          ))}
        </p>
        {mode === 'parent-reads' && page.parentPrompt && <p className="max-w-md text-center font-ui text-lg italic opacity-75">{page.parentPrompt}</p>}
      </div>
    </div>
  );
}
