/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * "Shuffle bag": every item comes up once, in random order, before any repeats,
 * and the same item never comes twice in a row (even across rounds).
 */
export function makeBag<T>(items: readonly T[], rand: () => number = Math.random) {
  let bag: T[] = [];
  let last: T | undefined;
  return {
    next(): T {
      if (bag.length === 0) {
        bag = shuffle(items, rand);
        if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1]!, bag[0]!];
      }
      last = bag.pop()!;
      return last;
    },
  };
}
