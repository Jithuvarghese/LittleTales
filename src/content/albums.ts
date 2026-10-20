/**
 * Which sticker album a story rewards from, derived from where it takes place:
 * sea and beach scenes give ocean stickers, night and bedtime scenes give sky
 * stickers, kitchen scenes give treats, and everything else gives animals.
 */
type Pageish = { type: string; scene?: { backdrop: string } };

export function albumForBackdrops(backdrops: string[]): 'animals' | 'ocean' | 'sky' | 'treats' {
  const count = (re: RegExp) => backdrops.filter((b) => re.test(b)).length;
  const scores = {
    ocean: count(/^(sea|beach)$/),
    sky: count(/^(night|night-sky|forest-night)$/),
    treats: count(/^kitchen$/),
  };
  const best = (Object.entries(scores) as [keyof typeof scores, number][]).sort((a, b) => b[1] - a[1])[0]!;
  return best[1] > 0 && best[1] >= backdrops.length / 3 ? best[0] : 'animals';
}

export function albumForStory(story: { pages: Pageish[] }) {
  return albumForBackdrops(story.pages.flatMap((p) => (p.type === 'story' && p.scene ? [p.scene.backdrop] : [])));
}
