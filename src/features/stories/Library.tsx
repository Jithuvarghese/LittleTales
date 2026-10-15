import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storyIndex, type StorySummary } from '@/content/loaders';
import { Scene } from '@/art/Scene';
import { speak } from '@/services/speech';
import { useProgress } from '@/features/rewards/progressStore';
import { category as categorySchema } from '@/content/schema';
import { strings } from '@/strings';

function Cover({ s, done }: { s: StorySummary; done: boolean }) {
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && speak(s.title)}
      onClick={() => {
        speak(s.title);
        navigate(`/stories/${s.id}`);
      }}
      aria-label={done ? `${s.title} (read)` : s.title}
      className="relative w-64 shrink-0 snap-start rounded-blob bg-surface p-2 text-left shadow-[0_6px_0_var(--outline)] ring-[5px] ring-outline"
    >
      {s.coverScene && <Scene scene={s.coverScene} className="!border-0" />}
      <span className="mt-2 block px-2 font-ui text-xl font-bold leading-tight">{s.title}</span>
      {done && (
        <span className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-outline bg-success text-2xl text-white" aria-hidden>
          ✓
        </span>
      )}
    </motion.button>
  );
}

/** Story shelves grouped by category. Each story appears on its first category's shelf. */
export function Library() {
  const completed = useProgress((s) => s.storiesCompleted);
  const shelves = categorySchema.options
    .map((c) => ({ c, stories: storyIndex.filter((s) => s.category[0] === c) }))
    .filter((x) => x.stories.length > 0);

  return (
    <div className="flex flex-col gap-6 px-4 pb-10">
      <h1 className="sr-only">{strings.nav.stories}</h1>
      {shelves.map(({ c, stories }) => (
        <section key={c} aria-label={strings.categories[c]}>
          <button type="button" className="mb-2 font-ui text-3xl font-extrabold" onClick={() => speak(strings.categories[c])}>
            {strings.categories[c]}
          </button>
          <div className="flex snap-x gap-6 overflow-x-auto pb-4 pt-1 pl-1">
            {stories.map((s) => (
              <Cover key={s.id} s={s} done={Boolean(completed[s.id])} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
