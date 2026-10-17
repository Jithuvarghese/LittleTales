import { useSyncExternalStore } from 'react';

/**
 * Who is speaking right now and how loud the voice is (0–1), so a character's
 * mouth follows the real narration instead of a fixed loop. Fed by the
 * AudioManager (audio loudness) and by word timings (speech fallback).
 */
type TalkState = { talker: string | null; level: number };

let state: TalkState = { talker: null, level: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const talk = {
  get: () => state,
  setTalker(talker: string | null) {
    if (state.talker === talker) return;
    state = { ...state, talker, level: talker ? state.level : 0 };
    emit();
  },
  setLevel(level: number) {
    const l = Math.max(0, Math.min(1, level));
    if (Math.abs(l - state.level) < 0.04) return;
    state = { ...state, level: l };
    emit();
  },
  /** A short burst (one word) for voices that give no loudness data. */
  pulse() {
    talk.setLevel(0.9);
    setTimeout(() => talk.setLevel(0.25), 120);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/** Mouth openness for one character: the live level while it is the talker, else 0. */
export function useMouthOpen(id: string, forceSpeaking = false) {
  return useSyncExternalStore(talk.subscribe, () => {
    const s = talk.get();
    return s.talker === id || (forceSpeaking && s.talker !== null) ? s.level : 0;
  });
}
