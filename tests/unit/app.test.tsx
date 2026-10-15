import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { useSettings } from '@/app/settingsStore';
import { strings } from '@/strings';

describe('App shell', () => {
  beforeEach(() => {
    useSettings.setState({ theme: 'sunny-meadow' });
    window.history.pushState({}, '', '/');
  });

  it('shows the start splash, then the home screen with big nav buttons', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: strings.tapToStart }));
    for (const label of Object.values(strings.nav)) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('switches theme by tapping a picture', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: strings.tapToStart }));
    await user.click(screen.getByRole('button', { name: strings.themes['starry-night'] }));
    expect(useSettings.getState().theme).toBe('starry-night');
    expect(document.documentElement.dataset.theme).toBe('starry-night');
  });

  it('navigates to a section and back home', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: strings.tapToStart }));
    await user.click(screen.getByRole('button', { name: strings.nav.stories }));
    expect(screen.getByRole('heading', { name: strings.nav.stories })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.home }));
    expect(screen.getByRole('button', { name: strings.nav.letters })).toBeInTheDocument();
  });
});
