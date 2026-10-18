import { makeBag, shuffle } from '@/lib/random';

describe('random order', () => {
  it('shuffle keeps every item exactly once', () => {
    const items = [...'0123456789'];
    const out = shuffle(items);
    expect([...out].sort()).toEqual(items);
  });

  it('is not in series: 0–9 rarely comes out in order', () => {
    let inOrder = 0;
    for (let i = 0; i < 200; i++) if (shuffle([...'0123456789']).join('') === '0123456789') inOrder++;
    expect(inOrder).toBe(0);
  });

  it('the bag gives every item once per round and never the same twice in a row', () => {
    const bag = makeBag([...'0123456789']);
    let prev = '';
    for (let round = 0; round < 20; round++) {
      const seen = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const n = bag.next();
        expect(n).not.toBe(prev);
        seen.add(n);
        prev = n;
      }
      expect(seen.size).toBe(10);
    }
  });
});
