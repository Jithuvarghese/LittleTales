/**
 * Visual check: screenshots of every main screen at phone, tablet and desktop
 * sizes, plus an automatic check that no element overflows the page or overlaps
 * another tappable element. Run: npx tsx tests/e2e/screens.shot.ts [baseUrl]
 */
import { chromium, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const sizes = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 1180, height: 820 },
  { name: 'laptop', width: 1366, height: 650 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'desktop', width: 1600, height: 900 },
];
const stories = ['pip-and-the-moon', 'bumble-counts-mangoes', 'coco-visits-the-farm', 'zig-and-the-colour-garden', 'the-little-seed', 'luna-and-the-sleepy-forest', 'pip-makes-a-friend', 'rainy-day-puddles', 'the-ant-and-the-dove', 'anus-kite-day', 'the-big-blue-sea'];
const screens = ['/', '/colours', '/colours/meet', '/colours/find', '/colours/paint', '/games', '/games/catch', '/games/match', '/letters/name', '/stories', '/stories/pip-and-the-moon', '/letters', '/letters/find', '/letters/meet', '/letters/bubbles', '/numbers', '/numbers/meet', '/numbers/count', '/songs', '/songs/twinkle-twinkle', '/stickers', '/grown-ups'];

async function problems(page: Page) {
  return page.evaluate(() => {
    const issues: string[] = [];
    const W = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > W + 1) issues.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${W})`);
    const tappables = [...document.querySelectorAll('button, a, [role=button]')].filter((e) => {
      const r = e.getBoundingClientRect();
      const st = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.opacity !== '0';
    });
    // Visible part of each element: clipped by any scrolling or overflow-hidden ancestor.
    const visibleRect = (e: Element) => {
      let r = e.getBoundingClientRect();
      let { left, top, right, bottom } = r;
      for (let p = e.parentElement; p; p = p.parentElement) {
        const st = getComputedStyle(p);
        if (st.overflowX !== 'visible' || st.overflowY !== 'visible') {
          r = p.getBoundingClientRect();
          left = Math.max(left, r.left);
          top = Math.max(top, r.top);
          right = Math.min(right, r.right);
          bottom = Math.min(bottom, r.bottom);
        }
      }
      return { left, top, right, bottom };
    };
    const rects = tappables
      .map((e) => ({ e, r: visibleRect(e) }))
      .filter(({ r }) => r.right - r.left > 2 && r.bottom - r.top > 2);
    for (let i = 0; i < rects.length; i++) {
      const a = rects[i]!;
      if (a.r.right > W + 1 || a.r.left < -1) issues.push(`off-screen: ${a.e.getAttribute('aria-label') ?? a.e.textContent?.trim().slice(0, 20)}`);
      for (let j = i + 1; j < rects.length; j++) {
        const b = rects[j]!;
        if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
        // Hotspots sit on purpose over the picture; skip pairs inside a scene.
        if (a.e.closest('[data-scene]') && b.e.closest('[data-scene]')) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ox > 4 && oy > 4) issues.push(`overlap: "${a.e.getAttribute('aria-label') ?? a.e.textContent?.trim().slice(0, 16)}" / "${b.e.getAttribute('aria-label') ?? b.e.textContent?.trim().slice(0, 16)}"`);
      }
    }
    // Text: must stay on screen, not overflow its box, and never sit under a picture.
    const scenes = [...document.querySelectorAll('[data-scene]')].map((e) => e.getBoundingClientRect());
    for (const t of document.querySelectorAll('p, h1, h2, h3, .story-text')) {
      const r = t.getBoundingClientRect();
      if (!r.width || getComputedStyle(t).visibility === 'hidden' || t.closest('.sr-only')) continue;
      const label = (t.textContent ?? '').trim().slice(0, 24);
      if (r.right > W + 1 || r.left < -1) issues.push(`text off-screen: "${label}"`);
      if (t.scrollWidth > t.clientWidth + 2) issues.push(`text overflows its box: "${label}"`);
      for (const sr of scenes) {
        if (t.closest('[data-scene]')) continue;
        const ox = Math.min(r.right, sr.right) - Math.max(r.left, sr.left);
        const oy = Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top);
        if (ox > 4 && oy > 4) issues.push(`text overlaps picture: "${label}"`);
      }
    }
    return [...new Set(issues)].slice(0, 12);
  });
}

async function main() {
  mkdirSync('tools/shots', { recursive: true });
  const browser = await chromium.launch();
  let total = 0;
  const only = process.env.SIZES?.split(',');
  for (const size of sizes.filter((x) => !only || only.includes(x.name))) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
    page.setDefaultTimeout(180000);
    // tsx adds a __name helper to functions sent into the page; provide it there.
    await page.addInitScript('globalThis.__name = (f) => f');
    await page.goto(base);
    await page.getByRole('button', { name: 'Tap to start!' }).click();
    for (const path of screens) {
      await page.goto(base + path);
      const start = page.getByRole('button', { name: 'Tap to start!' });
      if (await start.isVisible().catch(() => false)) await start.click();
      await page.waitForTimeout(1500);
      const name = `${size.name}${path.replace(/\//g, '_') || '_home'}`;
      await page.screenshot({ path: `tools/shots/${name}.png`, fullPage: true });
      const p = await problems(page);
      total += p.length;
      if (p.length) console.log(`${name}:\n  ${p.join('\n  ')}`);
    }
    // Walk every page of every story in "Grown-up reads" mode (no narration timing needed).
    for (const story of process.env.NO_STORIES ? [] : stories) {
      await page.goto(`${base}/stories/${story}`);
      const startBtn = page.getByRole('button', { name: 'Tap to start!' });
      if (await startBtn.isVisible().catch(() => false)) await startBtn.click();
      await page.getByRole('button', { name: 'Grown-up reads' }).click();
      for (let i = 0; i < 25; i++) {
        await page.waitForTimeout(700);
        const p = await problems(page);
        const next = page.getByRole('button', { name: 'Next' });
        const skip = page.getByRole('button', { name: 'Skip' });
        if (await next.isVisible().catch(() => false)) {
          const box = await next.boundingBox();
          if (box && box.y + box.height > size.height + 1) p.push('Next button is below the bottom of the screen');
        }
        if (process.env.ALL_SHOTS) await page.screenshot({ path: `tools/shots/${size.name}_${story}_p${i + 1}.png` });
        if (p.length) {
          total += p.length;
          const name = `${size.name}_${story}_page${i + 1}`;
          await page.screenshot({ path: `tools/shots/${name}.png` });
          console.log(`${name}:\n  ${p.join('\n  ')}`);
        }
        if (await page.getByText('Well done! You earned a sticker!').isVisible().catch(() => false)) break;
        if (await next.isVisible().catch(() => false)) await next.click();
        else if (await skip.isVisible().catch(() => false)) await skip.click();
        else break;
      }
    }
    await page.close();
  }
  await browser.close();
  console.log(total ? `${total} issue(s) found` : 'No layout issues found');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
