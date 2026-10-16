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
  { name: 'desktop', width: 1600, height: 900 },
];
const screens = ['/', '/stories', '/stories/pip-and-the-moon', '/letters', '/letters/find', '/letters/meet', '/letters/bubbles', '/numbers', '/numbers/meet', '/numbers/count', '/songs', '/songs/twinkle-twinkle', '/stickers', '/grown-ups'];

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
    const rects = tappables.map((e) => ({ e, r: e.getBoundingClientRect() }));
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
    return [...new Set(issues)].slice(0, 12);
  });
}

async function main() {
  mkdirSync('tools/shots', { recursive: true });
  const browser = await chromium.launch();
  let total = 0;
  for (const size of sizes) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
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
    await page.close();
  }
  await browser.close();
  console.log(total ? `${total} issue(s) found` : 'No layout issues found');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
