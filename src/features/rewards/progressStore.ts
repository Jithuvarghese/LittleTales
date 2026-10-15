import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appStorage } from '@/services/storage';
import { stickerData } from '@/content/loaders';

export type PlacedSticker = { id: string; x: number; y: number };

type ProgressData = {
  stars: number;
  stickers: string[];
  /** Sticker placements per album, in % of the album scene. */
  placements: Record<string, PlacedSticker[]>;
  storiesCompleted: Record<string, number>;
  /** Times each letter / number was found. */
  letters: Record<string, number>;
  numbers: Record<string, number>;
  /** Seconds of use per day, keyed YYYY-MM-DD. */
  secondsByDay: Record<string, number>;
  /** Story ids kept for offline use. */
  offline: string[];
};

type ProgressState = ProgressData & {
  addStars: (n?: number) => void;
  awardSticker: () => string | null;
  placeSticker: (album: string, p: PlacedSticker) => void;
  completeStory: (id: string) => void;
  practiseLetter: (l: string) => void;
  practiseNumber: (n: number) => void;
  tick: (seconds: number, now?: Date) => void;
  toggleOffline: (id: string) => void;
  reset: () => void;
};

const empty: ProgressData = {
  stars: 0,
  stickers: [],
  placements: {},
  storiesCompleted: {},
  letters: {},
  numbers: {},
  secondsByDay: {},
  offline: [],
};

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Picks the next sticker not yet owned (in album order); null when all collected. */
export function nextSticker(owned: string[], all = stickerData.stickers.map((s) => s.id)) {
  return all.find((id) => !owned.includes(id)) ?? null;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...empty,
      addStars: (n = 1) => set((s) => ({ stars: s.stars + n })),
      awardSticker: () => {
        const id = nextSticker(get().stickers);
        if (id) set((s) => ({ stickers: [...s.stickers, id] }));
        return id;
      },
      placeSticker: (album, p) =>
        set((s) => {
          const list = (s.placements[album] ?? []).filter((x) => x.id !== p.id);
          return { placements: { ...s.placements, [album]: [...list, p] } };
        }),
      completeStory: (id) =>
        set((s) => ({ storiesCompleted: { ...s.storiesCompleted, [id]: (s.storiesCompleted[id] ?? 0) + 1 } })),
      practiseLetter: (l) =>
        set((s) => ({ letters: { ...s.letters, [l]: (s.letters[l] ?? 0) + 1 } })),
      practiseNumber: (n) =>
        set((s) => ({ numbers: { ...s.numbers, [n]: (s.numbers[n] ?? 0) + 1 } })),
      tick: (seconds, now = new Date()) =>
        set((s) => {
          const k = dayKey(now);
          return { secondsByDay: { ...s.secondsByDay, [k]: (s.secondsByDay[k] ?? 0) + seconds } };
        }),
      toggleOffline: (id) =>
        set((s) => ({
          offline: s.offline.includes(id) ? s.offline.filter((x) => x !== id) : [...s.offline, id],
        })),
      reset: () => set({ ...empty }),
    }),
    { name: 'littletales-progress', storage: appStorage, version: 1 },
  ),
);
