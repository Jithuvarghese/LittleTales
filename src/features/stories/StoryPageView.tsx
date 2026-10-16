import { Fragment, useEffect, useState } from 'react';
import type { StoryPage } from '@/content/schema';
import { Scene, type Pulse } from '@/art/Scene';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { ambienceFor } from '@/services/synth';
import type { Role } from '@/content/voicing';

export type ReadingMode = 'read-to-me' | 'parent-reads' | 'i-try';

type Props = {
  page: StoryPage;
  mode: ReadingMode;
  onNarrationEnd: () => void;
  storyAmbience?: string;
};

/** One story page: illustration with hotspots plus large, highlightable text. */
export function StoryPageView({ page, mode, onNarrationEnd, storyAmbience }: Props) {
  const [word, setWord] = useState(-1);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const letterCase = useSettings((s) => s.letterCase);
  const words = page.text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    setWord(-1);
    AudioManager.ambience(
      (page.ambience ?? storyAmbience ?? ambienceFor(page.scene?.backdrop)) as Parameters<
        typeof AudioManager.ambience
      >[0],
    );
    page.sfx.filter((s) => s.trigger === 'onEnter').forEach((s) => AudioManager.sfx(s.src));
    if (mode !== 'read-to-me') return;
    const wordSfx = new Map(
      page.sfx
        .filter((s) => s.trigger.startsWith('onWord:'))
        .map((s) => [Number(s.trigger.split(':')[1]), s.src]),
    );
    const t = setTimeout(() => {
      AudioManager.say(page.text, {
        src: page.narration?.src,
        wordTimings: page.narration?.wordTimings,
        delivery: page.delivery,
        speaker: page.speaker as Role | undefined,
        onWord: (i) => {
          setWord(i);
          const sfx = wordSfx.get(i);
          if (sfx) AudioManager.sfx(sfx);
        },
        onEnd: () => {
          setWord(-1);
          onNarrationEnd();
        },
      });
    }, 500);
    return () => {
      clearTimeout(t);
      AudioManager.stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, mode]);

  const display = (w: string) => (letterCase === 'upper' ? w.toUpperCase() : w);

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 lg:flex-row lg:gap-6">
      {/* Picture is limited by screen height too, so text and buttons always fit. */}
      <div
        className="mx-auto w-full min-w-0 lg:mx-0 lg:w-[55%]"
        style={{ maxWidth: 'min(48rem, max(16rem, calc((100dvh - 20rem) * 1.6)))' }}
      >
        {page.scene && (
          <Scene
            scene={page.scene}
            pulse={pulse}
            label={page.hotspots.map((h) => h.label ?? h.id).join(', ')}
          >
            {page.hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-label={h.label ?? h.id}
                className="absolute rounded-full"
                style={{
                  left: `${h.shape.x}%`,
                  top: `${h.shape.y}%`,
                  width: `${h.shape.w}%`,
                  height: `${h.shape.h}%`,
                  minWidth: 72,
                  minHeight: 72,
                }}
                onClick={() => {
                  if (h.onTap.sfx) AudioManager.sfx(h.onTap.sfx);
                  if (h.onTap.say) {
                    const isCharacter = page.scene?.characters.some((c) => c.id === h.id);
                    AudioManager.say(h.onTap.say, {
                      channel: 'narration',
                      src: h.onTap.sayAudio,
                      role: isCharacter ? (h.id as Role) : 'narrator',
                      delivery: 'silly',
                    });
                  }
                  setPulse((p) => ({
                    id: h.id,
                    anim: h.onTap.animate ?? 'wiggle',
                    n: (p?.n ?? 0) + 1,
                  }));
                }}
              />
            ))}
          </Scene>
        )}
      </div>
      <div className="flex w-full min-w-0 flex-col items-center gap-3 lg:w-[45%]">
        <p
          className="story-text story-page-text w-full max-w-full rounded-blob bg-surface px-4 py-3 text-center text-text sm:px-5 sm:py-4"
          lang="en"
        >
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
                <span
                  className={`inline-block rounded-xl px-1 transition-colors ${word === i ? 'bg-accent' : ''}`}
                >
                  {display(w)}
                </span>
              )}
            </Fragment>
          ))}
        </p>
        {mode === 'parent-reads' && page.parentPrompt && (
          <p className="max-w-md text-center font-ui text-lg italic opacity-75">
            {page.parentPrompt}
          </p>
        )}
      </div>
    </div>
  );
}
