import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultTheme, type ThemeId } from '@/theme/themes';
import { appStorage } from '@/services/storage';

export type TextSize = 'M' | 'L' | 'XL';
export type LetterCase = 'upper' | 'lower' | 'both';

type SettingsState = {
  theme: ThemeId;
  textSize: TextSize;
  letterCase: LetterCase;
  dyslexicFont: boolean;
  setTheme: (theme: ThemeId) => void;
  setTextSize: (size: TextSize) => void;
  setLetterCase: (c: LetterCase) => void;
  setDyslexicFont: (on: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      textSize: 'L',
      letterCase: 'both',
      dyslexicFont: false,
      setTheme: (theme) => set({ theme }),
      setTextSize: (textSize) => set({ textSize }),
      setLetterCase: (letterCase) => set({ letterCase }),
      setDyslexicFont: (dyslexicFont) => set({ dyslexicFont }),
    }),
    { name: 'littletales-settings', storage: appStorage, version: 1 },
  ),
);
