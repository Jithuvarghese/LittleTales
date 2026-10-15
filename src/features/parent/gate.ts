import { create } from 'zustand';

/** How long the button must be held before the question appears. */
export const HOLD_MS = 3000;

export type Challenge = { a: number; b: number };

/** Two-digit-sum questions (e.g. 7 + 6) that pre-readers cannot solve alone. */
export function makeChallenge(rand: () => number = Math.random): Challenge {
  const a = 5 + Math.floor(rand() * 5); // 5–9
  const b = 4 + Math.floor(rand() * 6); // 4–9
  return { a, b };
}

export function checkAnswer(c: Challenge, answer: string): boolean {
  const n = Number(answer.trim());
  return Number.isInteger(n) && n === c.a + c.b;
}

/** Unlock lasts only for the current visit to the grown-ups area (never persisted). */
export const useGate = create<{ unlocked: boolean; unlock: () => void; lock: () => void }>((set) => ({
  unlocked: false,
  unlock: () => set({ unlocked: true }),
  lock: () => set({ unlocked: false }),
}));
