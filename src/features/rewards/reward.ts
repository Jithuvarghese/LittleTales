import { create } from 'zustand';
import { useProgress } from './progressStore';

/**
 * The reward moment shown at the end of an activity:
 *  - 'gift'  when the star path is full (a wrapped present with a sticker inside),
 *  - 'stars' otherwise (the star path filling up, "Great job, you got more stars!").
 */
export type RewardMoment = { kind: 'gift' | 'stars'; album?: string; intro?: boolean; after?: () => void };

type RewardState = {
  moment: RewardMoment | null;
  show: (m: RewardMoment) => void;
  close: () => void;
};

export const useReward = create<RewardState>((set) => ({
  moment: null,
  show: (moment) => set({ moment }),
  close: () => set((s) => {
    s.moment?.after?.();
    return { moment: null };
  }),
}));

/**
 * Call when an activity ends (story finished, game won, typing session done).
 * Shows the gift if one is ready, otherwise the star path.
 */
export function finishActivity(opts: { album?: string; after?: () => void } = {}) {
  const ready = useProgress.getState().giftsReady > 0;
  useReward.getState().show({ kind: ready ? 'gift' : 'stars', album: opts.album, after: opts.after });
}

/** Opens a ready gift on demand (e.g. tapping the gift at the end of the star path). */
export function openReadyGift() {
  if (useProgress.getState().giftsReady > 0) useReward.getState().show({ kind: 'gift' });
}
