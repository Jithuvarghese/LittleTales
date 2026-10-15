import { useSettings } from '@/app/settingsStore';
import { themeIds, themes, type ThemeId } from '@/theme/themes';
import { strings } from '@/strings';
import { BigButton } from './BigButton';

function ThemeSwatch({ id }: { id: ThemeId }) {
  const t = themes[id];
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="28" fill={t.bg} stroke={t.outline} strokeWidth="4" />
      <path d="M8 42q24-14 48 0v4a28 28 0 0 1-48 0z" fill={t.primary} />
      <circle cx="42" cy="22" r="7" fill={t.accent} />
    </svg>
  );
}

/** Child-facing theme switcher: tap a picture, no text needed. */
export function ThemePicker() {
  const current = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  return (
    <div role="group" aria-label={strings.themes.label} className="flex gap-3">
      {themeIds.map((id) => (
        <BigButton
          key={id}
          size="tap"
          label={strings.themes[id]}
          pressed={current === id}
          icon={<ThemeSwatch id={id} />}
          onClick={() => setTheme(id)}
          className={current === id ? 'ring-4 ring-accent' : ''}
        />
      ))}
    </div>
  );
}
