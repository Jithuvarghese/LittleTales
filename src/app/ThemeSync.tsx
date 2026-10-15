import { useEffect } from 'react';
import { applyTheme } from '@/theme/themes';
import { useSettings } from './settingsStore';

/** Keeps document-level CSS variables and data attributes in sync with settings. */
export function ThemeSync() {
  const theme = useSettings((s) => s.theme);
  const textSize = useSettings((s) => s.textSize);
  const dyslexicFont = useSettings((s) => s.dyslexicFont);

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
  }, [textSize]);
  useEffect(() => {
    // OpenDyslexic is self-hosted in a later phase; Atkinson Hyperlegible stands in until then.
    document.documentElement.style.setProperty(
      '--font-story',
      dyslexicFont ? "'OpenDyslexic', 'Atkinson Hyperlegible'" : "'Andika'",
    );
  }, [dyslexicFont]);

  return null;
}
