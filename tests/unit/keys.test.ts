import { renderHook } from '@testing-library/react';
import { normalizeKey, shouldBlock, useTypingKeys } from '@/features/letters/keys';

const ev = (key: string, code = '', mods: Partial<KeyboardEvent> = {}) => ({
  key,
  code,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...mods,
});

describe('normalizeKey', () => {
  it('is case-insensitive (Shift and Caps Lock never matter)', () => {
    expect(normalizeKey(ev('a', 'KeyA'))).toBe('A');
    expect(normalizeKey(ev('A', 'KeyA'))).toBe('A');
  });
  it('maps digits from the number row and numpad', () => {
    expect(normalizeKey(ev('7', 'Digit7'))).toBe('7');
    expect(normalizeKey(ev('Unidentified', 'Numpad3'))).toBe('3');
  });
  it('falls back to the physical key on other layouts', () => {
    expect(normalizeKey(ev('ф', 'KeyA'))).toBe('A');
  });
  it('ignores modifier combos and non-letter keys', () => {
    expect(normalizeKey(ev('c', 'KeyC', { ctrlKey: true }))).toBeNull();
    expect(normalizeKey(ev('Shift', 'ShiftLeft'))).toBeNull();
    expect(normalizeKey(ev('Enter', 'Enter'))).toBeNull();
  });
});

describe('shouldBlock', () => {
  it.each([' ', 'Backspace', 'Tab', 'F5', 'F12', 'ArrowLeft', 'Enter'])('blocks %s', (key) => {
    expect(shouldBlock(ev(key))).toBe(true);
  });
  it('blocks Ctrl/Cmd shortcuts', () => {
    expect(shouldBlock(ev('w', 'KeyW', { ctrlKey: true }))).toBe(true);
    expect(shouldBlock(ev('r', 'KeyR', { metaKey: true }))).toBe(true);
  });
  it('leaves Escape alone', () => {
    expect(shouldBlock(ev('Escape'))).toBe(false);
  });
});

describe('useTypingKeys', () => {
  it('reports normalised keys and prevents browser side effects', () => {
    const seen: string[] = [];
    renderHook(() => useTypingKeys((k) => seen.push(k)));
    const press = (key: string, code: string, init: KeyboardEventInit = {}) => {
      const e = new KeyboardEvent('keydown', { key, code, cancelable: true, ...init });
      window.dispatchEvent(e);
      return e;
    };
    expect(press('b', 'KeyB').defaultPrevented).toBe(true);
    expect(press('B', 'KeyB', { shiftKey: true }).defaultPrevented).toBe(true);
    expect(press('Backspace', 'Backspace').defaultPrevented).toBe(true);
    expect(press('Tab', 'Tab').defaultPrevented).toBe(true);
    expect(press('w', 'KeyW', { ctrlKey: true }).defaultPrevented).toBe(true);
    expect(seen).toEqual(['B', 'B']);
  });
});
