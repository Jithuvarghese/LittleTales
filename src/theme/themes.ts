/** Theme tokens. Adding a theme = adding one entry here. */
export type ThemeTokens = {
  bg: string;
  surface: string;
  primary: string;
  onPrimary: string;
  accent: string;
  text: string;
  success: string;
  hint: string;
  outline: string;
};

export const themes = {
  'sunny-meadow': {
    bg: '#bfe6ff',
    surface: '#fffaf0',
    primary: '#2f7d32',
    onPrimary: '#ffffff',
    accent: '#ffcb47',
    text: '#2b1d16',
    success: '#3c8f3f',
    hint: '#e98a2b',
    outline: '#4a2f27',
  },
  'under-the-sea': {
    bg: '#9fe3e0',
    surface: '#fff8ea',
    primary: '#0b6e74',
    onPrimary: '#ffffff',
    accent: '#ff8a6b',
    text: '#13302f',
    success: '#2e8a55',
    hint: '#2f7fd1',
    outline: '#1f3a3d',
  },
  'starry-night': {
    bg: '#1d1b3a',
    surface: '#2c2a52',
    primary: '#c9b8ff',
    onPrimary: '#1d1b3a',
    accent: '#f5d77a',
    text: '#f2eefc',
    success: '#9bd8a5',
    hint: '#8fb8ff',
    outline: '#0f0e22',
  },
  'candy-land': {
    bg: '#ffe0ec',
    surface: '#fffdf5',
    primary: '#a3367a',
    onPrimary: '#ffffff',
    accent: '#a8ecd2',
    text: '#3a1830',
    success: '#2f8a5d',
    hint: '#e58a1f',
    outline: '#5a2846',
  },
} satisfies Record<string, ThemeTokens>;

export type ThemeId = keyof typeof themes;
export const themeIds = Object.keys(themes) as ThemeId[];
export const defaultTheme: ThemeId = 'sunny-meadow';

const cssVar: Record<keyof ThemeTokens, string> = {
  bg: '--bg',
  surface: '--surface',
  primary: '--primary',
  onPrimary: '--on-primary',
  accent: '--accent',
  text: '--text',
  success: '--success',
  hint: '--hint',
  outline: '--outline',
};

export function applyTheme(id: ThemeId, root: HTMLElement = document.documentElement) {
  const tokens = themes[id];
  for (const key of Object.keys(cssVar) as (keyof ThemeTokens)[]) {
    root.style.setProperty(cssVar[key], tokens[key]);
  }
  root.dataset.theme = id;
}
