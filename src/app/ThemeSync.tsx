import { useEffect } from 'react';
import { applyTheme } from '@/theme/themes';
import { useSettings } from './settingsStore';

/** Keeps document-level CSS variables and data attributes in sync with settings. */
export function ThemeSync() {
  const theme = useSettings((s) => s.theme);
  const bedtime = useSettings((s) => s.bedtime);
  const textSize = useSettings((s) => s.textSize);
  const dyslexicFont = useSettings((s) => s.dyslexicFont);

  // Bedtime mode always uses the dim Starry Night theme.
  useEffect(() => applyTheme(bedtime ? 'starry-night' : theme), [theme, bedtime]);
  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
  }, [textSize]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-story',
      dyslexicFont ? "'OpenDyslexic', 'Atkinson Hyperlegible'" : "'Andika'",
    );
  }, [dyslexicFont]);

  return null;
}
