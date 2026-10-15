import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { loadRhyme, rhymeIndex } from '@/content/loaders';
import type { Rhyme } from '@/content/schema';
import { Scene, type Pulse } from '@/art/Scene';
import { Prop } from '@/art/props';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { strings } from '@/strings';

const PlayIcon = ({ playing }: { playing?: boolean }) => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <circle cx="32" cy="32" r="26" fill="#8fd18a" />
    {playing ? <path d="M24 20v24M40 20v24" /> : <path d="M26 18l20 14-20 14z" fill="#fff" />}
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round">
    <rect x="22" y="8" width="20" height="32" rx="10" fill="#ff9fc4" />
    <path d="M14 30q0 18 18 18t18-18M32 48v8M22 56h20" />
  </svg>
);
const NoteIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4">
    <path d="M24 46V14l26-6v32" />
    <circle cx="18" cy="46" r="7" fill="#c9a0ff" />
    <circle cx="44" cy="40" r="7" fill="#c9a0ff" />
  </svg>
);
const EarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" aria-hidden>
    <path d="M10 24h10l14-12v40L20 40H10z" fill="#ffcb47" />
    <path d="M42 22q8 10 0 20M48 16q14 16 0 32" />
  </svg>
);

export function SongsList() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-4">
      <h1 className="sr-only">{strings.nav.songs}</h1>
      <div className="flex items-center gap-6">
        <CharacterHost character="coco" expression="happy" size={130} />
        <BigButton size="big" showLabel label={strings.songs.playAll} icon={<PlayIcon />} onClick={() => navigate(`/songs/${rhymeIndex[0]!.id}?all=1`)} className="!w-40" />
      </div>
      <div className="flex max-w-5xl flex-wrap justify-center gap-5">
        {rhymeIndex.map((r) => (
          <motion.button
            type="button"
            key={r.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/songs/${r.id}`)}
            className="flex w-56 flex-col items-center gap-2 rounded-blob border-[5px] border-outline bg-surface p-4 shadow-[0_6px_0_var(--outline)]"
          >
            <div className="h-20 w-20"><Prop id={r.counting ? 'star' : 'bell'} /></div>
            <span className="text-center font-ui text-xl font-bold leading-tight">{r.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

type Mode = 'listen' | 'sing' | 'instrumental';

export function RhymePlayer() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const playAll = params.get('all') === '1';
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const bedtime = useSettings((s) => s.bedtime);
  const sleepMinutes = useSettings((s) => s.sleepTimerMinutes);
  const [rhyme, setRhyme] = useState<Rhyme | null>(null);
  const [line, setLine] = useState(-1);
  const [word, setWord] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<Mode>('listen');
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelled = useRef(false);

  useEffect(() => {
    void loadRhyme(id).then(setRhyme);
  }, [id]);

  const stop = useCallback(() => {
    cancelled.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    AudioManager.stopAll();
    setPlaying(false);
    setLine(-1);
    setWord(-1);
  }, []);

  const finished = useCallback(() => {
    setPlaying(false);
    setLine(-1);
    setWord(-1);
    AudioManager.stopMusic();
    useProgress.getState().addStars(1);
    if (playAll) {
      const i = rhymeIndex.findIndex((r) => r.id === id);
      const next = rhymeIndex[i + 1];
      if (next) timers.current.push(setTimeout(() => navigate(`/songs/${next.id}?all=1`, { replace: true }), 1500));
    }
  }, [playAll, id, navigate]);

  const start = useCallback(
    (m: Mode) => {
      if (!rhyme) return;
      stop();
      cancelled.current = false;
      setMode(m);
      setPlaying(true);
      AudioManager.music(m === 'instrumental' && rhyme.instrumental ? rhyme.instrumental : `audio/music/${rhyme.melody ?? 'play'}.mp3`);
      if (m === 'listen') {
        // Chanted verse over the music bed, one line at a time with word highlighting.
        const speakLine = (i: number) => {
          if (cancelled.current) return;
          if (i >= rhyme.lines.length) return finished();
          setLine(i);
          const l = rhyme.lines[i]!;
          AudioManager.say(l.text, {
            src: l.narration?.src,
            wordTimings: l.narration?.wordTimings,
            rate: 0.9,
            onWord: setWord,
            onEnd: () => timers.current.push(setTimeout(() => speakLine(i + 1), 250)),
          });
        };
        timers.current.push(setTimeout(() => speakLine(0), 800));
      } else {
        // Sing along / music only: bouncing highlight in time with the tempo.
        const beat = 60000 / rhyme.tempo;
        let t = 800;
        rhyme.lines.forEach((l, i) => {
          const words = l.text.split(/\s+/);
          const per = (beat * 8) / words.length;
          words.forEach((_, w) => {
            timers.current.push(setTimeout(() => { setLine(i); setWord(w); }, t + w * per));
          });
          t += beat * 8;
        });
        timers.current.push(setTimeout(finished, t + 500));
      }
    },
    [rhyme, stop, finished],
  );

  // Auto-play when coming from "Play all".
  useEffect(() => {
    if (rhyme && playAll) start('listen');
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rhyme]);

  // Bedtime sleep timer.
  useEffect(() => {
    if (!bedtime || !playing) return;
    const t = setTimeout(stop, sleepMinutes * 60000);
    return () => clearTimeout(t);
  }, [bedtime, playing, sleepMinutes, stop]);

  if (!rhyme) return <div className="flex flex-1 items-center justify-center"><CharacterHost character="coco" expression="thinking" size={160} /></div>;

  const stars = rhyme.counting ? Math.max(0, rhyme.counting.from - Math.max(0, Math.floor((line + 1) / 3))) : 0;

  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-4 pb-6 lg:flex-row lg:items-start">
      <div className="w-full max-w-3xl lg:w-3/5">
        <h1 className="mb-2 text-center font-ui text-4xl font-extrabold">{rhyme.title}</h1>
        <Scene scene={rhyme.scene} pulse={pulse}>
          {rhyme.counting &&
            Array.from({ length: stars }, (_, i) => (
              <motion.div key={i} className="absolute h-[14%] w-[9%]" style={{ left: `${15 + i * 14}%`, top: '18%' }} animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}>
                <Prop id={rhyme.counting!.prop} />
              </motion.div>
            ))}
          {rhyme.hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              aria-label={h.label ?? h.id}
              className="absolute rounded-full"
              style={{ left: `${h.shape.x}%`, top: `${h.shape.y}%`, width: `${h.shape.w}%`, height: `${h.shape.h}%`, minWidth: 72, minHeight: 72 }}
              onClick={() => {
                if (h.onTap.sfx) AudioManager.sfx(h.onTap.sfx);
                if (h.onTap.say && !playing) AudioManager.say(h.onTap.say);
                setPulse((p) => ({ id: h.id, anim: h.onTap.animate ?? 'wiggle', n: (p?.n ?? 0) + 1 }));
              }}
            />
          ))}
        </Scene>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {playing ? (
            <BigButton label={strings.pause} icon={<PlayIcon playing />} onClick={stop} />
          ) : (
            <>
              <BigButton size="big" showLabel label={strings.songs.listen} icon={<EarIcon />} onClick={() => start('listen')} className="!h-32 !w-32" />
              <BigButton size="big" showLabel label={strings.songs.singAlong} icon={<MicIcon />} onClick={() => start('sing')} className="!h-32 !w-32" />
              {rhyme.instrumental && <BigButton size="big" showLabel label={strings.songs.instrumental} icon={<NoteIcon />} onClick={() => start('instrumental')} className="!h-32 !w-32" />}
            </>
          )}
        </div>
      </div>
      <div className="w-full space-y-2 rounded-blob bg-surface p-4 lg:w-2/5" aria-live="off">
        {rhyme.lines.map((l, i) => (
          <p key={i} className={`story-text transition-opacity ${line === i ? 'opacity-100' : 'opacity-50'}`} style={{ fontSize: 'calc(var(--story-size) * 0.6)' }}>
            {l.text.split(/\s+/).map((w, wi) => (
              <span key={wi} className="relative mx-1 inline-block">
                {line === i && wi === word && mode !== 'listen' && (
                  <motion.span layoutId="ball" className="absolute -top-4 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-hint" aria-hidden />
                )}
                <span className={`rounded-lg px-1 ${line === i && wi === word ? 'bg-accent' : ''}`}>{w}</span>
              </span>
            ))}
          </p>
        ))}
        <p className="pt-2 text-sm opacity-60">{rhyme.source}</p>
      </div>
    </div>
  );
}
