import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { stickerData } from '@/content/loaders';
import { Backdrop } from '@/art/Backdrops';
import { Prop } from '@/art/props';
import { CharacterHost } from '@/components/CharacterHost';
import { AudioManager } from '@/services/AudioManager';
import { speak } from '@/services/speech';
import { strings } from '@/strings';
import { useProgress } from './progressStore';

/** Sticker book: pick an album, then drag (or tap, then tap the scene) to place stickers. */
export function StickerBook() {
  const owned = useProgress((s) => s.stickers);
  const stars = useProgress((s) => s.stars);
  const placements = useProgress((s) => s.placements);
  const place = useProgress((s) => s.placeSticker);
  const [album, setAlbum] = useState(stickerData.albums[0]!.id);
  const [selected, setSelected] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const current = stickerData.albums.find((a) => a.id === album)!;
  const albumStickers = stickerData.stickers.filter((s) => s.album === album);
  const placed = placements[album] ?? [];

  const toScenePercent = (clientX: number, clientY: number) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return null;
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return null;
    return { x, y };
  };
  const drop = (id: string, clientX: number, clientY: number) => {
    const p = toScenePercent(clientX, clientY);
    if (!p) return;
    place(album, { id, ...p });
    AudioManager.sfx('pop');
    setSelected(null);
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-4 pb-6">
      <h1 className="sr-only">{strings.stickers.album}</h1>
      <div className="flex items-center gap-3 font-ui text-3xl font-bold" aria-label={strings.stickers.stars(stars)}>
        <div className="h-12 w-12"><Prop id="star" /></div>
        {stars}
      </div>
      <div className="flex flex-wrap justify-center gap-3" role="tablist">
        {stickerData.albums.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={a.id === album}
            aria-label={a.label}
            onClick={() => { setAlbum(a.id); speak(a.label); }}
            className={`relative h-20 w-28 overflow-hidden rounded-2xl border-[5px] border-outline ${a.id === album ? 'ring-4 ring-accent' : ''}`}
          >
            <Backdrop name={a.backdrop} />
          </button>
        ))}
      </div>

      <div
        ref={sceneRef}
        className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-blob border-[5px] border-outline"
        aria-label={current.label}
        role="img"
        onClick={(e) => selected && drop(selected, e.clientX, e.clientY)}
      >
        <Backdrop name={current.backdrop} />
        {placed.filter((p) => owned.includes(p.id)).map((p) => {
          const st = stickerData.stickers.find((s) => s.id === p.id)!;
          return (
            <motion.div
              key={p.id}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => drop(p.id, info.point.x - window.scrollX, info.point.y - window.scrollY)}
              className="absolute h-[16%] w-[10%] min-w-[56px] cursor-grab touch-none"
              style={{ left: `${p.x}%`, top: `${p.y}%`, translateX: '-50%', translateY: '-50%' }}
            >
              <Prop id={st.prop} title={st.label} />
            </motion.div>
          );
        })}
      </div>

      {owned.length === 0 ? (
        <div className="flex flex-col items-center gap-2">
          <CharacterHost expression="happy" size={120} />
          <p className="max-w-lg text-center font-ui text-2xl">{strings.stickers.empty}</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {albumStickers.map((s) => {
            const have = owned.includes(s.id);
            return (
              <motion.button
                key={s.id}
                type="button"
                disabled={!have}
                aria-label={have ? s.label : `${s.label} (locked)`}
                drag={have}
                dragSnapToOrigin
                whileDrag={{ scale: 1.2, zIndex: 50 }}
                onDragEnd={(_, info) => drop(s.id, info.point.x - window.scrollX, info.point.y - window.scrollY)}
                onClick={() => { if (have) { setSelected(s.id); speak(s.label); } }}
                className={`h-24 w-24 touch-none rounded-full border-[5px] border-outline bg-surface p-2 ${selected === s.id ? 'ring-4 ring-accent' : ''} ${have ? '' : 'opacity-30 grayscale'}`}
              >
                <Prop id={s.prop} />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
