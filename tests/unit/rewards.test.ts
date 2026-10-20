import { albumStickers, chooseSticker, cleanSaved, dayKey, nextSticker, STARS_PER_GIFT, useProgress, ALBUM_ROTATION } from '@/features/rewards/progressStore';
import { finishActivity, useReward } from '@/features/rewards/reward';
import { albumForBackdrops } from '@/content/albums';
import { stickerData } from '@/content/loaders';
import { adaptDuration } from '@/features/letters/FallingLetters';

const P = () => useProgress.getState();

describe('star path', () => {
  beforeEach(() => P().reset());

  it('fills up and turns into a gift, then starts again', () => {
    P().addStars(STARS_PER_GIFT - 1);
    expect(P().giftsReady).toBe(0);
    expect(P().starPath).toBe(STARS_PER_GIFT - 1);
    P().addStars(3);
    expect(P().giftsReady).toBe(1);
    expect(P().starPath).toBe(2);
    expect(P().stars).toBe(STARS_PER_GIFT + 2);
  });

  it('gives no sticker without a full star path', () => {
    expect(P().takeGift()).toBeNull();
    expect(P().stickers).toEqual([]);
  });
});

describe('which sticker you get', () => {
  beforeEach(() => P().reset());

  it('rotates through the albums when the activity has no album', () => {
    const albums: string[] = [];
    for (let i = 0; i < ALBUM_ROTATION.length; i++) {
      P().addStars(STARS_PER_GIFT);
      albums.push(P().takeGift()!.album);
    }
    expect(albums).toEqual(ALBUM_ROTATION);
  });

  it('matches the album of what the child just did (sea story, sea sticker)', () => {
    P().addStars(STARS_PER_GIFT);
    expect(P().takeGift('ocean')!.album).toBe('ocean');
  });

  it('never gives duplicates, then gives shiny copies once everything is collected', () => {
    const total = stickerData.stickers.length;
    for (let i = 0; i < total; i++) {
      P().addStars(STARS_PER_GIFT);
      expect(P().takeGift()!.shiny).toBe(false);
    }
    expect(new Set(P().stickers).size).toBe(total);
    P().addStars(STARS_PER_GIFT);
    const extra = P().takeGift()!;
    expect(extra.shiny).toBe(true);
    expect(P().stickers.length).toBe(total);
  });

  it('moves to the next album with empty slots when the chosen album is full', () => {
    const ocean = albumStickers('ocean');
    expect(chooseSticker(ocean, 'ocean', 0)!.album).not.toBe('ocean');
  });

  it('awards a golden badge when an album is completed', () => {
    for (let i = 0; i < albumStickers('sky').length; i++) {
      P().addStars(STARS_PER_GIFT);
      P().takeGift('sky');
    }
    expect(P().badges).toContain('sky');
  });

  it('replaying a story earns stars but never a duplicate or a false sticker', () => {
    P().addStars(3);
    finishActivity({ album: 'animals' });
    expect(useReward.getState().moment?.kind).toBe('stars');
    useReward.getState().close();
    expect(P().stickers).toEqual([]);
  });
});

describe('sticker book', () => {
  beforeEach(() => P().reset());

  it('gives the first-visit present once only', () => {
    expect(P().giveIntroGift()).not.toBeNull();
    expect(P().giveIntroGift()).toBeNull();
    expect(P().stickers).toHaveLength(1);
    expect(P().newSticker).toBe(P().stickers[0]);
  });

  it('places a sticker exactly where it was dropped, and moving it replaces the old spot', () => {
    P().placeSticker('animals', { id: 's-cat', x: 10, y: 10 });
    P().placeSticker('animals', { id: 's-cat', x: 50, y: 60 });
    expect(P().placements.animals).toEqual([{ id: 's-cat', x: 50, y: 60 }]);
    P().removePlacement('animals', 's-cat');
    expect(P().placements.animals).toEqual([]);
  });

  it('ignores saved stickers that are no longer in the catalogue', () => {
    const cleaned = cleanSaved({ stickers: ['s-cat', 's-unicorn'], placements: { animals: [{ id: 's-unicorn', x: 1, y: 1 }, { id: 's-cat', x: 2, y: 2 }] }, newSticker: 's-unicorn' });
    expect(cleaned.stickers).toEqual(['s-cat']);
    expect(cleaned.placements!.animals).toEqual([{ id: 's-cat', x: 2, y: 2 }]);
    expect(cleaned.newSticker).toBeNull();
  });

  it('keeps the older first-not-owned helper working', () => {
    expect(nextSticker(['x', 'y'], ['x', 'y'])).toBeNull();
  });
});

describe('story albums', () => {
  it('derives the album from where the story takes place', () => {
    expect(albumForBackdrops(['sea', 'sea', 'beach'])).toBe('ocean');
    expect(albumForBackdrops(['night-sky', 'forest-night', 'bedroom'])).toBe('sky');
    expect(albumForBackdrops(['farm', 'meadow-day'])).toBe('animals');
  });
});

describe('progress', () => {
  beforeEach(() => P().reset());
  it('records time per day and practice', () => {
    const d = new Date(2026, 9, 14, 10);
    P().tick(30, d);
    P().practiseLetter('B');
    expect(P().secondsByDay[dayKey(d)]).toBe(30);
    expect(P().letters.B).toBe(1);
  });
});

describe('falling letters difficulty', () => {
  it('slows down (never speeds up) when the child struggles', () => {
    expect(adaptDuration(16, 0)).toBe(16);
    expect(adaptDuration(16, 2)).toBe(19);
  });
});
