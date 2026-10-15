import { applyTheme, themeIds, themes } from '@/theme/themes';
import { contrastRatio } from '@/theme/contrast';

describe('themes', () => {
  it.each(themeIds)('%s meets AA contrast for text on bg and surface', (id) => {
    const t = themes[id];
    expect(contrastRatio(t.text, t.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.text, t.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.onPrimary, t.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('aims for AAA on story text against the surface', () => {
    for (const id of themeIds) {
      expect(contrastRatio(themes[id].text, themes[id].surface)).toBeGreaterThanOrEqual(7);
    }
  });

  it('applies CSS variables to the root element', () => {
    applyTheme('under-the-sea');
    const root = document.documentElement;
    expect(root.dataset.theme).toBe('under-the-sea');
    expect(root.style.getPropertyValue('--bg')).toBe(themes['under-the-sea'].bg);
    expect(root.style.getPropertyValue('--on-primary')).toBe(themes['under-the-sea'].onPrimary);
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });
});
