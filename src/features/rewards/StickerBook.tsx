import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { stickerData } from '@/content/loaders';
import { Background } from '@/art/scene/Backgrounds';
import { Prop } from '@/art/props';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { BookIcon, KeyboardIcon } from '@/art/Icons';
import { AudioManager } from '@/services/AudioManager';
import { uiLineSrc } from '@/content/voicing';
import { strings } from '@/strings';
import { useProgress, isAlbumComplete } from './progressStore';
import { useReward } from './reward';
import { StarPath } from './StarPath';

/** Home spots for stickers in each album scene (in % of the scene). */
export const SLOTS: [number, number][] = [
  [16, 66],
  [37, 72],
  [59, 66],
  [81, 72],
  [24, 34],
  [50, 28],
  [74, 36],
  [50, 86],
];

const article = (label: string) => (/^[aeiou]/i.test(label) ? 'An' : 'A');
const nameLine = (label: string) => `${article(label)} ${label.toLowerCase()}!`;

/** Progress ring for album tabs: filled share of the album. */
function Ring({ done, total, complete }: { done: number; total: number; complete: boolean }) {
  const c = 2 * Math.PI * 20;
  return (
    <svg viewBox="0 0 48 48" className="absolute -right-2 -top-2 h-10 w-10" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="#fffaf0" stroke="#4a2f27" strokeWidth="4" />
      <circle cx="24" cy="24" r="20" fill="none" stroke={complete ? '#e0a800' : '#3c8f3f'} strokeWidth="6" strokeDasharray={`${(done / total) * c} ${c}`} transform="rotate(-90 24 24)" strokeLinecap="round" />
      {complete ? (
        <path d="M14 30l-2-12 7 5 5-9 5 9 7-5-2 12z" fill="#ffd23f" stroke="#4a2f27" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#4a2f27" fontFamily="Baloo 2, sans-serif">{done}</text>
      )}
    </svg>
  );
}

/** Picture hint of how stickers are earned: a book opening, a key lighting, a ball caught. */
function EarnHint() {
  const reduce = useReducedMotion();
  const icons = [<BookIcon key="b" />, <KeyboardIcon key="k" />, <Prop key="p" id="ball" />];
  return (
    <motion.div className="pointer-events-none absolute left-1/2 top-2 z-30 flex -translate-x-1/2 gap-2 rounded-full border-4 border-outline bg-white px-3 py-2 shadow-[0_4px_0_var(--outline)]" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
      {icons.map((icon, i) => (
        <motion.span key={i} className="block h-10 w-10" animate={reduce ? undefined : { scale: [1, 1.3, 1], y: [0, -6, 0] }} transition={{ duration: 0.6, delay: i * 0.55 }}>
          {icon}
        </motion.span>
      ))}
    </motion.div>
  );
}

/** A hand showing how to drag a sticker from the tray into the scene. */
function DragHint() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.svg viewBox="0 0 64 64" className="pointer-events-none absolute z-30 h-16 w-16" aria-hidden initial={{ left: '50%', top: '110%', opacity: 0 }} animate={{ top: ['110%', '60%', '60%'], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: 2, repeatDelay: 0.6 }}>
      <path d="M26 34V12a5 5 0 0 1 10 0v18l12 3q6 2 5 8l-3 13H28L16 40q-2-6 4-7z" fill="#ffd98a" stroke="#4a2f27" strokeWidth="3.5" strokeLinejoin="round" />
    </motion.svg>
  );
}

const BinIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="#4a2f27" strokeWidth="4" strokeLinejoin="round">
    <path d="M14 18h36l-4 38H18z" fill="#cfe6ff" />
    <path d="M10 18h44M26 18v-6h12v6" />
    <path d="M26 28v20M38 28v20" />
  </svg>
);
const MagicIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="#4a2f27" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 52l28-28" />
    <path d="M44 8l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#ffd23f" />
    <circle cx="16" cy="18" r="3" fill="#ff8fb8" />
    <circle cx="52" cy="40" r="3" fill="#6bc1ff" />
  </svg>
);

/**
 * Sticker book: every album shows silhouette slots, so it is never empty and the
 * goal is visible. Collected stickers wait in the tray; drag one into the scene or
 * let Pip put it in its spot. Placed stickers come alive when tapped.
 */
export function StickerBook() {
  const reduce = useReducedMotion();
  const owned = useProgress((s) => s.stickers);
  const placements = useProgress((s) => s.placements);
  const badges = useProgress((s) => s.badges);
  const shinies = useProgress((s) => s.shinies);
  const seenIntro = useProgress((s) => s.seenIntro);
  const newSticker = useProgress((s) => s.newSticker);
  const { placeSticker, removePlacement, clearNew } = useProgress.getState();
  const showReward = useReward((s) => s.show);
  const momentOpen = useReward((s) => s.moment !== null);

  const startAlbum = (newSticker && stickerData.stickers.find((s) => s.id === newSticker)?.album) || stickerData.albums[0]!.id;
  const [album, setAlbum] = useState(startAlbum);
  const [selected, setSelected] = useState<string | null>(newSticker);
  const [glow, setGlow] = useState<string | null>(newSticker);
  const [pulse, setPulse] = useState<{ id: string; n: number } | null>(null);
  const [hintFor, setHintFor] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);

  const current = stickerData.albums.find((a) => a.id === album)!;
  const albumList = useMemo(() => stickerData.stickers.filter((s) => s.album === album), [album]);
  const placed = (placements[album] ?? []).filter((p) => owned.includes(p.id) && albumList.some((s) => s.id === p.id));
  const placedIds = new Set(placed.map((p) => p.id));
  const tray = albumList.filter((s) => owned.includes(s.id) && !placedIds.has(s.id));

  // First visit: a present from Pip (once).
  useEffect(() => {
    if (!seenIntro) showReward({ kind: 'gift', intro: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arriving with a new sticker: go to its album, make it glow, ask where it goes.
  useEffect(() => {
    if (!newSticker || momentOpen) return;
    const st = stickerData.stickers.find((s) => s.id === newSticker);
    if (!st) return clearNew();
    setAlbum(st.album);
    setSelected(st.id);
    setGlow(st.id);
    AudioManager.say(strings.rewards.whereShall, { role: 'quizHost', delivery: 'excited', src: uiLineSrc(strings.rewards.whereShall), talker: 'pip' });
    clearNew();
  }, [newSticker, momentOpen, clearNew]);

  const slotOf = (id: string) => SLOTS[albumList.findIndex((s) => s.id === id) % SLOTS.length]!;

  const put = (id: string, x: number, y: number) => {
    placeSticker(album, { id, x: Math.max(6, Math.min(94, x)), y: Math.max(8, Math.min(92, y)) });
    AudioManager.sfx('pop');
    setSelected(null);
    setGlow(null);
    const nowPlaced = placed.length + (placedIds.has(id) ? 0 : 1);
    if (nowPlaced === albumList.length && isAlbumComplete(album, owned)) {
      setCelebrate(true);
      AudioManager.say(strings.rewards.albumDone, { role: 'quizHost', delivery: 'excited', src: uiLineSrc(strings.rewards.albumDone), talker: 'pip' });
      setTimeout(() => setCelebrate(false), 3000);
    }
  };
  const putForMe = () => {
    const list = selected ? tray.filter((s) => s.id === selected) : tray;
    list.forEach((s) => {
      const [x, y] = slotOf(s.id);
      put(s.id, x, y);
    });
  };

  const scenePercent = (cx: number, cy: number) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r || cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 };
  };
  const overBin = (cx: number, cy: number) => {
    const r = binRef.current?.getBoundingClientRect();
    return !!r && cx >= r.left - 10 && cx <= r.right + 10 && cy >= r.top - 10 && cy <= r.bottom + 10;
  };
  const centerOf = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  };

  const done = albumList.filter((s) => owned.includes(s.id)).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-3 px-3 pb-6">
      {celebrate && <Celebration count={30} />}
      <h1 className="sr-only">{strings.stickers.album}</h1>
      <StarPath />

      {/* Album tabs: a picture of each album with its progress ring */}
      <div className="flex flex-wrap justify-center gap-4" role="tablist" aria-label={strings.stickers.album}>
        {stickerData.albums.map((a) => {
          const list = stickerData.stickers.filter((s) => s.album === a.id);
          const n = list.filter((s) => owned.includes(s.id)).length;
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={a.id === album}
              aria-label={`${a.label}: ${n} of ${list.length}`}
              onClick={() => { setAlbum(a.id); setSelected(null); AudioManager.sfx('click', 'ui'); }}
              className={`relative h-[72px] w-28 rounded-2xl border-[5px] border-outline ${a.id === album ? 'ring-4 ring-accent' : ''}`}
            >
              <span className="absolute inset-0 overflow-hidden rounded-xl"><Background name={a.backdrop} /></span>
              <Ring done={n} total={list.length} complete={badges.includes(a.id) || n === list.length} />
            </button>
          );
        })}
      </div>

      {/* The album scene with silhouette slots */}
      <div ref={sceneRef} className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-blob border-[5px] border-outline" aria-label={current.label}>
        <Background name={current.backdrop} />
        <AnimatePresence>{hintFor && <EarnHint key={hintFor} />}</AnimatePresence>

        {albumList.map((s) => {
          const p = placed.find((x) => x.id === s.id);
          if (p) {
            const shiny = (shinies[s.id] ?? 0) > 0;
            return (
              <motion.button
                // Re-mount at the new spot after a drop, so the drag offset never doubles.
                key={`${s.id}-${p.x.toFixed(1)}-${p.y.toFixed(1)}`}
                type="button"
                aria-label={`${s.label}, placed. Tap to hear it.`}
                drag
                dragMomentum={false}
                dragElastic={0}
                whileDrag={{ scale: 1.15, zIndex: 40 }}
                onDragEnd={(e) => {
                  const { cx, cy } = centerOf(e.target as HTMLElement);
                  if (overBin(cx, cy)) {
                    removePlacement(album, s.id);
                    AudioManager.sfx('whoosh', 'ui');
                    return;
                  }
                  const pos = scenePercent(cx, cy);
                  if (pos) put(s.id, pos.x, pos.y);
                  else removePlacement(album, s.id);
                }}
                onTap={() => {
                  setPulse((x) => ({ id: s.id, n: (x?.n ?? 0) + 1 }));
                  AudioManager.say(s.sound ?? nameLine(s.label), { role: 'narrator', delivery: 'silly' });
                }}
                className={`absolute z-10 h-[18%] w-[11%] min-w-[56px] cursor-grab touch-none rounded-full ${shiny ? 'ring-4 ring-[#ffd23f]' : ''} ${glow === s.id ? 'lt-hint-pulse' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, translateX: '-50%', translateY: '-50%' }}
                initial={reduce ? false : { scale: 0.4 }}
                animate={reduce ? { scale: 1 } : pulse?.id === s.id ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : { scale: 1, y: [0, -4, 0] }}
                transition={pulse?.id === s.id ? { duration: 0.6 } : { y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring', stiffness: 300, damping: 15 } }}
              >
                <Prop id={s.prop} />
              </motion.button>
            );
          }
          const [x, y] = slotOf(s.id);
          const have = owned.includes(s.id);
          return (
            <button
              key={`slot-${s.id}`}
              type="button"
              aria-label={have ? `${s.label}: put it here` : `${s.label}: not collected yet`}
              onClick={() => {
                if (selected && tray.some((t) => t.id === selected)) return put(selected, x, y);
                if (have) return put(s.id, x, y);
                // Not collected yet: Pip names it and shows how to earn stickers.
                AudioManager.say(nameLine(s.label), { role: 'quizHost', delivery: 'excited', src: uiLineSrc(nameLine(s.label)), talker: 'pip' });
                setHintFor(s.id);
                setTimeout(() => setHintFor((h) => (h === s.id ? null : h)), 2200);
              }}
              className={`absolute flex h-[18%] w-[11%] min-w-[56px] items-center justify-center rounded-full border-[3px] border-dashed p-1 ${have ? 'border-[#3c8f3f] bg-white/50' : 'border-white/90 bg-white/20'} ${have && selected === s.id ? 'lt-hint-pulse' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span className="block h-full w-full" style={{ filter: have ? 'grayscale(0.3) opacity(0.55)' : 'brightness(0) opacity(0.22)' }}>
                <Prop id={s.prop} />
              </span>
            </button>
          );
        })}

        {/* Drop a placed sticker here to take it back to the tray */}
        <div ref={binRef} className="absolute bottom-2 right-2 z-20 h-14 w-14 rounded-2xl border-4 border-outline bg-white/80 p-1.5" aria-hidden>
          <BinIcon />
        </div>
        {tray.length > 0 && placed.length === 0 && <DragHint />}
      </div>

      {/* Tray: collected stickers waiting to be placed */}
      <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3">
        {tray.length === 0 && done === 0 && (
          <div className="flex items-center gap-3">
            <CharacterHost character="pip" pose="wave" size={90} />
            <StarPath size="sm" />
          </div>
        )}
        {tray.map((s) => (
          <motion.button
            key={s.id}
            type="button"
            aria-label={`${s.label}: drag it into the picture`}
            aria-pressed={selected === s.id}
            drag
            dragSnapToOrigin
            dragMomentum={false}
            whileDrag={{ scale: 1.2, zIndex: 50 }}
            onDragEnd={(e) => {
              const { cx, cy } = centerOf(e.target as HTMLElement);
              const pos = scenePercent(cx, cy);
              if (pos) put(s.id, pos.x, pos.y);
            }}
            onTap={() => {
              setSelected(s.id);
              AudioManager.say(nameLine(s.label), { role: 'quizHost', src: uiLineSrc(nameLine(s.label)), talker: 'pip' });
            }}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(s.id)}
            className={`h-24 w-24 touch-none rounded-full border-[5px] border-outline bg-surface p-2 shadow-[0_6px_0_var(--outline)] ${selected === s.id || glow === s.id ? 'ring-4 ring-accent lt-hint-pulse' : ''} ${(shinies[s.id] ?? 0) > 0 ? 'border-[#e0a800]' : ''}`}
            animate={reduce ? undefined : glow === s.id ? { y: [0, -8, 0] } : undefined}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Prop id={s.prop} />
          </motion.button>
        ))}
        {tray.length > 0 && (
          <button type="button" onClick={putForMe} className="flex min-h-[72px] items-center gap-2 rounded-blob border-[5px] border-outline bg-accent px-4 font-ui text-lg font-bold text-[#2b1d16] shadow-[0_6px_0_var(--outline)]" aria-label={strings.rewards.putForMe}>
            <span className="block h-10 w-10"><MagicIcon /></span>
            <span className="hidden sm:inline">{strings.rewards.putForMe}</span>
          </button>
        )}
      </div>
    </div>
  );
}
