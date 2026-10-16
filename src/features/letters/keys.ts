import { useEffect, useRef } from 'react';

type KeyLike = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey'>;

/**
 * Maps a key event to an uppercase letter A–Z or a digit 0–9, or null.
 * Case-insensitive (Shift and Caps Lock never matter). Falls back to
 * event.code so non-Latin layouts still map physical keys.
 */
export function normalizeKey(e: KeyLike): string | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (e.key && e.key.length === 1) {
    const k = e.key.toUpperCase();
    if (/^[A-Z0-9]$/.test(k)) return k;
  }
  const m = e.code?.match(/^(?:Key([A-Z])|Digit([0-9])|Numpad([0-9]))$/);
  if (m) return m[1] ?? m[2] ?? m[3] ?? null;
  return null;
}

/** Keys that would navigate away or trigger browser shortcuts during typing games. */
export function shouldBlock(e: KeyLike): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  if (/^F\d{1,2}$/.test(e.key)) return true;
  return [' ', 'Spacebar', 'Backspace', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', "'", '/', 'ContextMenu'].includes(e.key) || normalizeKey(e) !== null;
}

/** Captures key presses for a typing game and swallows browser side effects. Escape is left alone. */
export function useTypingKeys(onKey: (key: string) => void, enabled = true, opts: { backspace?: boolean } = {}) {
  const ref = useRef(onKey);
  ref.current = onKey;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return;
      // Grown-ups typing into a text box are left alone.
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (shouldBlock(e)) e.preventDefault();
      if (e.repeat) return;
      if (e.key === 'Backspace' && optsRef.current.backspace) return ref.current('BACKSPACE');
      const k = normalizeKey(e);
      if (k) ref.current(k);
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [enabled]);
}

export const QWERTY = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
export const NUMBER_ROW = '1234567890';
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const HOME_ROW_FIRST = 'ASDFGHJKLQWERTYUIOPZXCVBNM'.split('');

/** Approximate phonics for the speech fallback (recorded clips replace these). */
export const fallbackSound: Record<string, string> = {
  A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fff', G: 'guh', H: 'hhh', I: 'ih', J: 'juh',
  K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'oh', P: 'puh', Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh',
  U: 'uh', V: 'vvv', W: 'wuh', X: 'ks', Y: 'yuh', Z: 'zzz',
};
