import { useEffect, useState } from 'react';
import type { StoryPage } from '@/content/schema';
import { Scene, type Pulse } from '@/art/Scene';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { ambienceFor } from '@/services/synth';
import type { Role } from '@/content/voicing';

export type ReadingMode = 'read-to-me' | 'parent-reads' | 'i-try';

type Props = { page: StoryPage; mode: ReadingMode; onNarrationEnd: () => void; storyAmbience?: string };

/** One story page: illustration with hotspots plus large, highlightable text. */
export function StoryPageView({ page, mode, onNarrationEnd, storyAmbience }: Props) {
  const [word, setWord] = useState(-1);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const letterCase = useSettings((s) => s.letterCase);
  const words = page.text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    setWord(-1);
    AudioManager.ambience((page.ambience ?? storyAmbience ?? ambienceFor(page.scene?.backdrop)) as Parameters<typeof AudioManager.ambience>[0]);
    page.sfx.filter((s) => s.trigger === 'onEnter').forEach((s) => AudioManager.sfx(s.src));
    if (mode !== 'read-to-me') return;
    const wordSfx = new Map(
      page.sfx.filter((s) => s.trigger.startsWith('onWord:')).map((s) => [Number(s.trigger.split(':')[1]), s.src]),
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
    <div className="flex w-full flex-1 flex-col items-center gap-4 lg:flex-row lg:items-center">
      <div className="w-full max-w-3xl lg:w-3/5">
        {page.scene && (
          <Scene scene={page.scene} pulse={pulse} label={page.hotspots.map((h) => h.label ?? h.id).join(', ')}>
            {page.hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-label={h.label ?? h.id}
                className="absolute rounded-full"
                style={{ left: `${h.shape.x}%`, top: `${h.shape.y}%`, width: `${h.shape.w}%`, height: `${h.shape.h}%`, minWidth: 72, minHeight: 72 }}
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
                  setPulse((p) => ({ id: h.id, anim: h.onTap.animate ?? 'wiggle', n: (p?.n ?? 0) + 1 }));
                }}
              />
            ))}
          </Scene>
        )}
      </div>
      <div className="flex w-full flex-col items-center gap-3 lg:w-2/5">
        <p className="story-text rounded-blob bg-surface px-6 py-4 text-center text-text" lang="en">
          {words.map((w, i) =>
            mode === 'i-try' ? (
              <button
                key={i}
                type="button"
                className={`mx-1 rounded-xl px-1 underline decoration-dotted decoration-2 underline-offset-8 ${word === i ? 'bg-accent' : ''}`}
                onClick={() => {
                  setWord(i);
                  AudioManager.say(w.replace(/[^\w']/g, ''), { onEnd: () => setWord(-1) });
                }}
              >
                {display(w)}
              </button>
            ) : (
              <span key={i} className={`mx-1 rounded-xl px-1 transition-colors ${word === i ? 'bg-accent' : ''}`}>
                {display(w)}
              </span>
            ),
          )}
        </p>
        {mode === 'parent-reads' && page.parentPrompt && (
          <p className="max-w-md text-center font-ui text-lg italic opacity-75">{page.parentPrompt}</p>
        )}
      </div>
    </div>
  );
}
