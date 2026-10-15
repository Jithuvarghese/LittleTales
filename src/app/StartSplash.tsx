import { CharacterHost } from '@/components/CharacterHost';
import { strings } from '@/strings';

/**
 * Browsers block audio until a user gesture. This splash collects that first
 * tap; the AudioManager hooks into onStart to unlock audio (Phase 1).
 */
export function StartSplash({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex h-full w-full flex-col items-center justify-center gap-6 bg-bg text-text"
      aria-label={strings.tapToStart}
    >
      <CharacterHost expression="happy" size={240} />
      <span className="rounded-blob border-[5px] border-outline bg-accent px-10 py-6 font-ui text-5xl font-extrabold text-[#2b1d16] shadow-[0_8px_0_var(--outline)]">
        {strings.tapToStart}
      </span>
    </button>
  );
}
