import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { loadStory, storyIndex } from '@/content/loaders';
import type { Story } from '@/content/schema';
import { AudioManager } from '@/services/AudioManager';
import { applyTheme, type ThemeId } from '@/theme/themes';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { ProgressTrail } from '@/components/ProgressTrail';
import { Celebration } from '@/components/Celebration';
import { BackIcon, BookIcon, HomeIcon } from '@/art/Icons';
import { Prop } from '@/art/props';
import { Scene } from '@/art/Scene';
import { stickerData } from '@/content/loaders';
import { strings } from '@/strings';
import { Quiz } from './quiz/Quiz';
import { StoryPageView, type ReadingMode } from './StoryPageView';

const ArrowIcon = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <circle cx="32" cy="32" r="26" fill="#8fd18a" />
    <path d="M28 18l14 14-14 14M41 32H21" />
  </svg>
);
const EarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" aria-hidden>
    <path d="M10 24h10l14-12v40L20 40H10z" fill="#ffcb47" />
    <path d="M42 22q8 10 0 20M48 16q14 16 0 32" />
  </svg>
);
const ParentIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" aria-hidden>
    <circle cx="24" cy="18" r="9" fill="#ffd98a" />
    <path d="M10 56q0-26 14-26t14 26z" fill="#6bc1ff" />
    <circle cx="46" cy="30" r="7" fill="#ffd98a" />
    <path d="M36 56q0-18 10-18t10 18z" fill="#ff8a6b" />
  </svg>
);
const FingerIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M26 34V12a5 5 0 0 1 10 0v18l12 3q6 2 5 8l-3 13H28L16 40q-2-6 4-7z" fill="#ffd98a" />
  </svg>
);
const AgainIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" aria-hidden>
    <circle cx="32" cy="32" r="26" fill="#c9a0ff" />
    <path d="M20 32a12 12 0 1 0 4-9M20 18v6h6" />
  </svg>
);

export function Reader() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [story, setStory] = useState<Story | null | undefined>(undefined);
  const [mode, setMode] = useState<ReadingMode | null>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [finished, setFinished] = useState(false);
  const [sticker, setSticker] = useState<string | null>(null);
  const theme = useSettings((s) => s.theme);
  const bedtime = useSettings((s) => s.bedtime);
  const autoAdvance = useSettings((s) => s.autoAdvance);
  const { addStars, completeStory, awardSticker } = useProgress.getState();
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>();
  const finishedRef = useRef(false);
  // Never leave an automatic page turn pending after leaving the reader.
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  useEffect(() => {
    setStory(undefined);
    setMode(null);
    setIndex(0);
    setFinished(false);
    setSticker(null);
    finishedRef.current = false;
    clearTimeout(advanceTimer.current);
    void loadStory(id).then(setStory);
  }, [id]);

  // Story theme and music while reading; restore on leave.
  useEffect(() => {
    if (!story) return;
    if (story.theme && !bedtime) applyTheme(story.theme as ThemeId);
    AudioManager.music(story.music?.src);
    return () => {
      AudioManager.stopAll();
      const s = useSettings.getState();
      applyTheme(s.bedtime ? 'starry-night' : s.theme);
    };
  }, [story, theme, bedtime]);

  const page = story?.pages[index];

  // Preload the next page's narration.
  useEffect(() => {
    const next = story?.pages[index + 1];
    if (next?.type === 'story') AudioManager.preload([next.narration?.src]);
  }, [story, index]);

  const go = useCallback(
    (delta: number) => {
      // Once the story has ended, nothing (taps or timers) can end it again.
      if (!story || finishedRef.current) return;
      clearTimeout(advanceTimer.current);
      AudioManager.stopVoice();
      const target = index + delta;
      if (target < 0) return;
      if (delta > 0 && story.pages[index]?.type === 'story') addStars(1);
      if (target >= story.pages.length) {
        finishedRef.current = true;
        completeStory(story.id);
        setSticker(awardSticker());
        setFinished(true);
        AudioManager.sfx('tada');
        AudioManager.say(strings.storyEnd.wellDone);
        return;
      }
      AudioManager.sfx('whoosh', 'ui');
      setDir(delta);
      setIndex(target);
    },
    [story, index, addStars, completeStory, awardSticker],
  );

  // Arrow keys turn pages.
  useEffect(() => {
    if (!mode || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, finished, go]);

  if (story === undefined) return <div className="flex flex-1 items-center justify-center"><CharacterHost expression="thinking" size={160} /></div>;
  if (story === null)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <CharacterHost expression="thinking" size={180} />
        <p className="font-ui text-3xl">{strings.notFound}</p>
      </div>
    );

  if (!mode) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <h1 className="font-ui text-5xl font-extrabold text-center">{story.title}</h1>
        {story.coverScene && <div className="w-full max-w-xl"><Scene scene={story.coverScene} /></div>}
        <div className="flex flex-wrap justify-center gap-6">
          <BigButton size="huge" showLabel label={strings.modes.readToMe} icon={<EarIcon />} onClick={() => setMode('read-to-me')} />
          <BigButton size="huge" showLabel label={strings.modes.parentReads} icon={<ParentIcon />} onClick={() => setMode('parent-reads')} />
          <BigButton size="huge" showLabel label={strings.modes.iTry} icon={<FingerIcon />} onClick={() => setMode('i-try')} />
        </div>
      </div>
    );
  }

  if (finished) {
    const st = stickerData.stickers.find((s) => s.id === sticker);
    const nextStory = storyIndex[(storyIndex.findIndex((s) => s.id === story.id) + 1) % storyIndex.length]!;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-4">
        <Celebration count={20} />
        <div className="flex items-center gap-4">
          <CharacterHost character={story.characters[0]} expression="celebrate" size={130} />
          {st && (
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} className="h-28 w-28 rounded-full border-[6px] border-outline bg-surface p-3" aria-label={st.label} role="img">
              <Prop id={st.prop} />
            </motion.div>
          )}
        </div>
        <p className="text-center font-ui text-3xl font-extrabold sm:text-4xl">{strings.storyEnd.wellDone}</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <BigButton size="huge" showLabel label={strings.storyEnd.again} icon={<AgainIcon />} onClick={() => { finishedRef.current = false; setFinished(false); setIndex(0); }} />
          <BigButton size="huge" showLabel label={strings.storyEnd.nextStory} icon={<BookIcon />} onClick={() => navigate(`/stories/${nextStory.id}`)} />
          <BigButton size="huge" showLabel label={strings.home} icon={<HomeIcon />} onClick={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-3 pb-4 pt-2 sm:px-4">
      <ProgressTrail total={story.pages.length} current={index} />
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={index}
          custom={dir}
          className="flex flex-1 flex-col"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 120 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -120 }}
          transition={{ duration: 0.35 }}
          drag={page?.type === 'story' ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(1);
            else if (info.offset.x > 80) go(-1);
          }}
        >
          {page?.type === 'story' ? (
            <StoryPageView
              page={page}
              storyAmbience={story.ambience}
              mode={mode}
              onNarrationEnd={() => {
                if (autoAdvance) advanceTimer.current = setTimeout(() => go(1), 1400);
              }}
            />
          ) : page ? (
            <Quiz page={page} onDone={(stars) => { addStars(stars); go(1); }} />
          ) : null}
        </motion.div>
      </AnimatePresence>
      {page?.type === 'story' && (
        <div className="flex justify-between">
          <BigButton label={strings.previous} icon={<BackIcon />} onClick={() => go(-1)} className={index === 0 ? 'invisible' : ''} />
          <BigButton label={strings.next} icon={<ArrowIcon />} onClick={() => go(1)} />
        </div>
      )}
    </div>
  );
}
