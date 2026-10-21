import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appStorage } from '@/services/storage';
import { stickerData } from '@/content/loaders';
import rewardsConfig from '../../../config/rewards.json';

export type PlacedSticker = { id: string; x: number; y: number };

/** Stars needed to fill the star path and earn a gift (tunable in config/rewards.json). */
export const STARS_PER_GIFT: number = rewardsConfig.starsPerGift;
export const ALBUM_ROTATION: string[] = rewardsConfig.albumRotation;

export type Award = { id: string; album: string; shiny: boolean; albumComplete: boolean };

type ProgressData = {
  stars: number;
  /** Stars collected toward the next gift (0 … STARS_PER_GIFT-1). */
  starPath: number;
  /** Gifts earned but not opened yet. */
  giftsReady: number;
  stickers: string[];
  /** Repeat ("shiny") copies earned after everything is collected. */
  shinies: Record<string, number>;
  /** Albums completed (golden badge). */
  badges: string[];
  /** Newest sticker, shown with a bouncing dot until the book is opened. */
  newSticker: string | null;
  lastSticker: string | null;
  /** Where the next rotating gift comes from. */
  rotation: number;
  /** First-visit gift in the sticker book has been given. */
  seenIntro: boolean;
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
  /** Opens one ready gift; the sticker matches the album when given. */
  takeGift: (album?: string) => Award | null;
  /** The first-visit present in the sticker book (once). */
  giveIntroGift: () => Award | null;
  placeSticker: (album: string, p: PlacedSticker) => void;
  removePlacement: (album: string, id: string) => void;
  clearNew: () => void;
  completeStory: (id: string) => void;
  practiseLetter: (l: string) => void;
  practiseNumber: (n: number) => void;
  tick: (seconds: number, now?: Date) => void;
  toggleOffline: (id: string) => void;
  reset: () => void;
};

const empty: ProgressData = {
  stars: 0,
  starPath: 0,
  giftsReady: 0,
  stickers: [],
  shinies: {},
  badges: [],
  newSticker: null,
  lastSticker: null,
  rotation: 0,
  seenIntro: false,
  placements: {},
  storiesCompleted: {},
  letters: {},
  numbers: {},
  secondsByDay: {},
  offline: [],
};

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const catalogue = () => stickerData.stickers;
export const albumOf = (id: string) => catalogue().find((s) => s.id === id)?.album;
export const albumStickers = (album: string) => catalogue().filter((s) => s.album === album).map((s) => s.id);
export const isAlbumComplete = (album: string, owned: string[]) => {
  const ids = albumStickers(album);
  return ids.length > 0 && ids.every((id) => owned.includes(id));
};

/**
 * Chooses the next sticker: the first not-owned one from the preferred album,
 * otherwise from the next albums in rotation that still have empty slots.
 * Returns null when everything is collected.
 */
export function chooseSticker(owned: string[], preferred: string | undefined, rotation: number, order = ALBUM_ROTATION): { id: string; album: string } | null {
  const start = preferred && order.includes(preferred) ? order.indexOf(preferred) : rotation % order.length;
  for (let k = 0; k < order.length; k++) {
    const album = order[(start + k) % order.length]!;
    const id = albumStickers(album).find((s) => !owned.includes(s));
    if (id) return { id, album };
  }
  return null;
}

/** Older picker kept for compatibility: the first sticker not yet owned. */
export function nextSticker(owned: string[], all = catalogue().map((s) => s.id)) {
  return all.find((id) => !owned.includes(id)) ?? null;
}

/** Drops saved ids that are no longer in the catalogue (renamed or removed stickers). */
export function cleanSaved(data: Partial<ProgressData>): Partial<ProgressData> {
  const known = new Set(catalogue().map((s) => s.id));
  const placements: Record<string, PlacedSticker[]> = {};
  for (const [album, list] of Object.entries(data.placements ?? {})) placements[album] = list.filter((p) => known.has(p.id));
  return {
    ...data,
    stickers: (data.stickers ?? []).filter((id) => known.has(id)),
    placements,
    newSticker: data.newSticker && known.has(data.newSticker) ? data.newSticker : null,
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      const award = (preferred?: string): Award | null => {
        const s = get();
        const pick = chooseSticker(s.stickers, preferred, s.rotation);
        if (pick) {
          const owned = [...s.stickers, pick.id];
          const albumComplete = isAlbumComplete(pick.album, owned);
          set({
            stickers: owned,
            newSticker: pick.id,
            lastSticker: pick.id,
            rotation: preferred ? s.rotation : s.rotation + 1,
            badges: albumComplete && !s.badges.includes(pick.album) ? [...s.badges, pick.album] : s.badges,
          });
          return { ...pick, shiny: false, albumComplete };
        }
        // Everything collected: a shiny copy, so the reward never becomes a wrong message.
        const album = preferred && ALBUM_ROTATION.includes(preferred) ? preferred : ALBUM_ROTATION[s.rotation % ALBUM_ROTATION.length]!;
        const ids = albumStickers(album);
        if (!ids.length) return null;
        const id = ids[Object.values(s.shinies).reduce((a, b) => a + b, 0) % ids.length]!;
        set({ shinies: { ...s.shinies, [id]: (s.shinies[id] ?? 0) + 1 }, newSticker: id, lastSticker: id, rotation: s.rotation + 1 });
        return { id, album, shiny: true, albumComplete: false };
      };

      return {
        ...empty,
        addStars: (n = 1) =>
          set((s) => {
            let path = s.starPath + n;
            let gifts = s.giftsReady;
            while (path >= STARS_PER_GIFT) {
              path -= STARS_PER_GIFT;
              gifts++;
            }
            return { stars: s.stars + n, starPath: path, giftsReady: gifts };
          }),
        takeGift: (album) => {
          if (get().giftsReady <= 0) return null;
          set((s) => ({ giftsReady: s.giftsReady - 1 }));
          return award(album);
        },
        giveIntroGift: () => {
          if (get().seenIntro) return null;
          set({ seenIntro: true });
          return award(ALBUM_ROTATION[0]);
        },
        placeSticker: (album, p) =>
          set((s) => {
            const list = (s.placements[album] ?? []).filter((x) => x.id !== p.id);
            return { placements: { ...s.placements, [album]: [...list, p] } };
          }),
        removePlacement: (album, id) =>
          set((s) => ({ placements: { ...s.placements, [album]: (s.placements[album] ?? []).filter((x) => x.id !== id) } })),
        clearNew: () => set({ newSticker: null }),
        completeStory: (id) => set((s) => ({ storiesCompleted: { ...s.storiesCompleted, [id]: (s.storiesCompleted[id] ?? 0) + 1 } })),
        practiseLetter: (l) => set((s) => ({ letters: { ...s.letters, [l]: (s.letters[l] ?? 0) + 1 } })),
        practiseNumber: (n) => set((s) => ({ numbers: { ...s.numbers, [n]: (s.numbers[n] ?? 0) + 1 } })),
        tick: (seconds, now = new Date()) =>
          set((s) => {
            const k = dayKey(now);
            return { secondsByDay: { ...s.secondsByDay, [k]: (s.secondsByDay[k] ?? 0) + seconds } };
          }),
        toggleOffline: (id) => set((s) => ({ offline: s.offline.includes(id) ? s.offline.filter((x) => x !== id) : [...s.offline, id] })),
        reset: () => set({ ...empty }),
      };
    },
    {
      name: 'littletales-progress',
      storage: appStorage,
      version: 2,
      migrate: (old) => ({ ...empty, ...cleanSaved(old as Partial<ProgressData>) }),
      // Also clean on every load, so a renamed sticker can never crash the book.
      merge: (persisted, current) => ({ ...current, ...cleanSaved((persisted ?? {}) as Partial<ProgressData>) }),
    },
  ),
);
