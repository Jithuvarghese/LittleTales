import { dayKey, nextSticker, useProgress } from '@/features/rewards/progressStore';
import { adaptDuration } from '@/features/letters/FallingLetters';

describe('progress and rewards', () => {
  beforeEach(() => useProgress.getState().reset());

  it('awards stickers in order and never twice', () => {
    const a = useProgress.getState().awardSticker();
    const b = useProgress.getState().awardSticker();
    expect(a).not.toBe(b);
    expect(useProgress.getState().stickers).toEqual([a, b]);
  });

  it('returns null once every sticker is collected', () => {
    expect(nextSticker(['x', 'y'], ['x', 'y'])).toBeNull();
  });

  it('adds stars and counts practice', () => {
    const p = useProgress.getState();
    p.addStars(2);
    p.practiseLetter('B');
    p.practiseLetter('B');
    p.practiseNumber(3);
    const s = useProgress.getState();
    expect(s.stars).toBe(2);
    expect(s.letters.B).toBe(2);
    expect(s.numbers[3]).toBe(1);
  });

  it('records time per day', () => {
    const d = new Date(2026, 9, 14, 10);
    useProgress.getState().tick(30, d);
    useProgress.getState().tick(15, d);
    expect(useProgress.getState().secondsByDay[dayKey(d)]).toBe(45);
    expect(dayKey(d)).toBe('2026-10-14');
  });

  it('places stickers, replacing an earlier spot for the same sticker', () => {
    const p = useProgress.getState();
    p.placeSticker('animals', { id: 's-cat', x: 10, y: 10 });
    p.placeSticker('animals', { id: 's-cat', x: 50, y: 60 });
    expect(useProgress.getState().placements.animals).toEqual([{ id: 's-cat', x: 50, y: 60 }]);
  });
});

describe('falling letters difficulty', () => {
  it('slows down (never speeds up) when the child struggles', () => {
    expect(adaptDuration(16, 0)).toBe(16);
    expect(adaptDuration(16, 2)).toBe(19);
    expect(adaptDuration(29, 5)).toBe(30);
  });
});
