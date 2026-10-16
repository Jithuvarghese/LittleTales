import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultTheme, type ThemeId } from '@/theme/themes';
import { appStorage } from '@/services/storage';

export type TextSize = 'M' | 'L' | 'XL';
export type LetterCase = 'upper' | 'lower' | 'both';
export type Channel = 'music' | 'narration' | 'sfx' | 'ui' | 'letters';
export type LearningPath = 'alphabetical' | 'home-row';

export const channels: Channel[] = ['music', 'narration', 'sfx', 'ui', 'letters'];

type SettingsData = {
  theme: ThemeId;
  textSize: TextSize;
  letterCase: LetterCase;
  dyslexicFont: boolean;
  volumes: Record<Channel, number>;
  muted: Record<Channel, boolean>;
  master: number;
  learningPath: LearningPath;
  childName: string;
  /** Words a grown-up added for the word builder (stay on this device). */
  customWords: string[];
  autoAdvance: boolean;
  /** Minutes before a friendly stretch break; 0 = off. */
  sessionMinutes: number;
  /** Daily limit in minutes; 0 = off. */
  dailyLimitMinutes: number;
  bedtime: boolean;
  sleepTimerMinutes: number;
};

type SettingsState = SettingsData & {
  set: (patch: Partial<SettingsData>) => void;
  setTheme: (theme: ThemeId) => void;
  setTextSize: (size: TextSize) => void;
  setLetterCase: (c: LetterCase) => void;
  setDyslexicFont: (on: boolean) => void;
  setVolume: (ch: Channel, v: number) => void;
  setMuted: (ch: Channel, m: boolean) => void;
};

export const defaultSettings: SettingsData = {
  theme: defaultTheme,
  textSize: 'L',
  letterCase: 'both',
  dyslexicFont: false,
  volumes: { music: 0.4, narration: 0.9, sfx: 0.7, ui: 0.6, letters: 0.9 },
  muted: { music: false, narration: false, sfx: false, ui: false, letters: false },
  master: 0.8,
  learningPath: 'alphabetical',
  childName: '',
  customWords: [],
  autoAdvance: true,
  sessionMinutes: 15,
  dailyLimitMinutes: 0,
  bedtime: false,
  sleepTimerMinutes: 15,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      set: (patch) => set(patch),
      setTheme: (theme) => set({ theme }),
      setTextSize: (textSize) => set({ textSize }),
      setLetterCase: (letterCase) => set({ letterCase }),
      setDyslexicFont: (dyslexicFont) => set({ dyslexicFont }),
      setVolume: (ch, v) => set((s) => ({ volumes: { ...s.volumes, [ch]: v } })),
      setMuted: (ch, m) => set((s) => ({ muted: { ...s.muted, [ch]: m } })),
    }),
    {
      name: 'littletales-settings',
      storage: appStorage,
      version: 2,
      migrate: (old) => ({ ...defaultSettings, ...(old as Partial<SettingsData>) }),
    },
  ),
);
