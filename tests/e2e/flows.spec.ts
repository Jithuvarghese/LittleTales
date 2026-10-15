import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function start(page: Page, path = '/') {
  await page.goto(path);
  await page.getByRole('button', { name: 'Tap to start!' }).click();
}

test.describe('child flows', () => {
  test('no third-party network requests and no console errors', async ({ page, baseURL }) => {
    const external: string[] = [];
    const errors: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url());
    });
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await start(page);
    await page.getByRole('button', { name: 'Stories' }).click();
    await expect(page.getByRole('heading', { name: 'Stories' })).toBeAttached();
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('Home → story → finish a quiz → sticker, without reading', async ({ page }) => {
    await start(page, '/stories/pip-and-the-moon');
    await page.getByRole('button', { name: "Grown-up reads" }).click();
    // Turn pages until the first quiz.
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('What is Pip looking at?')).toBeVisible();
    // A wrong answer only hints; the right one celebrates.
    await page.getByRole('button', { name: 'sun' }).click();
    await page.getByRole('button', { name: 'moon' }).click();
    // Quiz advances by itself after the celebration.
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 10_000 });
    // Read on to the end (skipping the second quiz is allowed).
    for (let i = 0; i < 20; i++) {
      if (await page.getByText('Well done! You earned a sticker!').isVisible()) break;
      const done = page.getByText('Well done! You earned a sticker!');
      const action = page.getByRole('button', { name: 'Skip' }).or(page.getByRole('button', { name: 'Next' })).or(done);
      await action.first().waitFor();
      if (await done.isVisible()) break;
      await action.first().click();
    }
    await expect(page.getByText('Well done! You earned a sticker!')).toBeVisible();
    await page.getByRole('button', { name: 'Home' }).last().click();
    await page.getByRole('button', { name: 'My Stickers' }).click();
    await expect(page.getByRole('button', { name: 'Cat', exact: true })).toBeEnabled();
  });

  test('find the key: any case works, wrong keys are gentle, shortcuts do not leak', async ({ page, isMobile }) => {
    test.skip(isMobile, 'physical keyboard flow');
    await start(page, '/letters/find');
    await expect(page.getByRole('button', { name: 'Can you find A?' })).toBeVisible();
    // Wrong key: target key glows as a hint.
    await page.keyboard.press('q');
    await expect(page.getByRole('group', { name: 'Keyboard' }).getByRole('button', { name: 'A', exact: true })).toHaveClass(/bg-accent/);
    // Backspace / Tab must not navigate or move focus out.
    const url = page.url();
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Tab');
    expect(page.url()).toBe(url);
    // Uppercase works (Shift held).
    await page.keyboard.press('Shift+A');
    await expect(page.getByRole('button', { name: 'Can you find B?' })).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('b');
    await expect(page.getByRole('button', { name: 'Can you find C?' })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('parent gate', () => {
  test('settings are locked until the hold + sum challenge is solved', async ({ page }) => {
    await start(page);
    await page.getByRole('button', { name: 'Grown-ups' }).click();
    await expect(page.getByRole('tab', { name: 'Settings' })).toHaveCount(0);
    const hold = page.getByRole('button', { name: /Press and hold/ });
    await hold.hover();
    await page.mouse.down();
    await page.waitForTimeout(3400);
    await page.mouse.up();
    const q = await page.getByText(/What is \d+ \+ \d+\?/).textContent();
    const [a, b] = q!.match(/\d+/g)!.map(Number);
    await page.getByRole('textbox').fill(String(a! + b!));
    await page.getByRole('button', { name: 'Enter' }).click();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
  });
});

test.describe('accessibility', () => {
  for (const path of ['/', '/stories', '/letters', '/songs']) {
    test(`axe: no serious violations on ${path}`, async ({ page }) => {
      await start(page, path);
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }
});
