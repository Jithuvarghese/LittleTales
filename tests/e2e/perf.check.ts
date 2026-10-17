/**
 * Smoothness check on a throttled mobile profile (4x slower processor), the way a
 * budget phone runs. Measures frames per second on busy screens.
 * Run: npx tsx tests/e2e/perf.check.ts [baseUrl]
 */
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const screens = [
  { name: 'home', path: '/' },
  { name: 'story page (scene, characters, effects)', path: '/stories/coco-visits-the-farm', mode: true },
  { name: 'night story (fireflies)', path: '/stories/pip-and-the-moon', mode: true },
  { name: 'songs (performer)', path: '/songs/twinkle-twinkle' },
  { name: 'cast gallery (35 characters)', path: '/cast' },
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.setDefaultTimeout(180000);
  await page.addInitScript('globalThis.__name = (f) => f');
  const cdp = await page.context().newCDPSession(page);
  await page.goto(base);
  await page.getByRole('button', { name: 'Tap to start!' }).click();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const results: string[] = [];
  for (const s of screens) {
    await page.goto(base + s.path);
    const start = page.getByRole('button', { name: 'Tap to start!' });
    if (await start.isVisible().catch(() => false)) await start.click();
    if (s.mode) await page.getByRole('button', { name: 'Grown-up reads' }).click();
    await page.waitForTimeout(2500);
    const fps = await page.evaluate(
      () =>
        new Promise<{ fps: number; worst: number }>((resolve) => {
          let frames = 0;
          let worst = 0;
          let last = performance.now();
          const t0 = last;
          const tick = (now: number) => {
            frames++;
            worst = Math.max(worst, now - last);
            last = now;
            if (now - t0 < 4000) requestAnimationFrame(tick);
            else resolve({ fps: Math.round((frames * 1000) / (now - t0)), worst: Math.round(worst) });
          };
          requestAnimationFrame(tick);
        }),
    );
    results.push(`${s.name.padEnd(42)} ${String(fps.fps).padStart(3)} fps   longest frame ${fps.worst} ms`);
  }
  await browser.close();
  console.log('Throttled mobile profile (4x CPU slowdown, 390x844):');
  results.forEach((r) => console.log('  ' + r));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
