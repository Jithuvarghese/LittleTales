import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { storyIndex, type StorySummary } from '@/content/loaders';
import { Scene } from '@/art/Scene';
import { Prop } from '@/art/props';
import { CheckBadge } from '@/art/Icons';
import { useProgress } from '@/features/rewards/progressStore';
import { category as categorySchema, type Category } from '@/content/schema';
import { AudioManager } from '@/services/AudioManager';
import { strings } from '@/strings';

/** A picture for each shelf so pre-readers can filter without reading. */
const categoryIcon: Record<Category, string> = {
  animals: 'cow',
  bedtime: 'moon',
  friendship: 'heart',
  adventures: 'kite',
  nature: 'flower',
  feelings: 'sun',
  everyday: 'house',
  'fairy-tales': 'crown',
  learning: 'book',
};

function Cover({ s, done, i }: { s: StorySummary; done: boolean; i: number }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      initial={reduce ? false : { y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: Math.min(i, 10) * 0.04 } }}
      whileHover={reduce ? undefined : { y: -6, rotate: -1 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      onClick={() => {
        AudioManager.sfx('click', 'ui');
        navigate(`/stories/${s.id}`);
      }}
      aria-label={done ? `${s.title} (read)` : s.title}
      className="relative flex w-full flex-col overflow-hidden rounded-blob border-[5px] border-outline bg-surface text-left shadow-[0_6px_0_var(--outline)]"
    >
      {s.coverScene && <Scene scene={s.coverScene} thumbnail className="!rounded-none !border-0 !border-b-[5px]" label={`${s.title} cover`} />}
      <span className="flex min-h-[3.5rem] items-center px-3 py-2 font-ui text-lg font-extrabold leading-tight text-text sm:text-xl">{s.title}</span>
      {done && (
        <span className="absolute right-2 top-2 h-11 w-11 drop-shadow" aria-hidden>
          <CheckBadge />
        </span>
      )}
    </motion.button>
  );
}

/** All stories in one grid, with picture chips to filter by shelf. */
export function Library() {
  const completed = useProgress((s) => s.storiesCompleted);
  const [shelf, setShelf] = useState<Category | 'all'>('all');
  const present = categorySchema.options.filter((c) => storyIndex.some((s) => s.category.includes(c)));
  const stories = shelf === 'all' ? storyIndex : storyIndex.filter((s) => s.category.includes(shelf));

  const chip = (id: Category | 'all', label: string, icon: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={shelf === id}
      aria-label={label}
      title={label}
      onClick={() => {
        AudioManager.sfx('pop', 'ui');
        setShelf(id);
      }}
      className={`flex h-[72px] shrink-0 items-center gap-2 rounded-full border-4 border-outline px-3 font-ui text-base font-bold shadow-[0_4px_0_var(--outline)] transition-colors sm:pr-5 ${
        shelf === id ? 'bg-accent text-[#2b1d16]' : 'bg-surface text-text'
      }`}
    >
      <span className="h-11 w-11" aria-hidden>
        <Prop id={icon} />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 pb-12 sm:px-4">
      <h1 className="sr-only">{strings.nav.stories}</h1>
      <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 pt-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Shelves">
        {chip('all', 'All stories', 'star')}
        {present.map((c) => chip(c, strings.categories[c], categoryIcon[c]))}
      </div>
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {stories.map((s, i) => (
          <Cover key={s.id} s={s} i={i} done={Boolean(completed[s.id])} />
        ))}
      </div>
    </div>
  );
}
