import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { makeDeck } from '@/features/games/MatchGame';
import { nextSpeed, GOAL } from '@/features/games/CatchGame';
import { WordBuilder } from '@/features/letters/WordBuilder';
import { useSettings } from '@/app/settingsStore';
import { strings } from '@/strings';

describe('matching pairs', () => {
  it('deals every picture exactly twice', () => {
    for (const pairs of [3, 4, 6]) {
      const deck = makeDeck(pairs);
      expect(deck).toHaveLength(pairs * 2);
      const counts = new Map<string, number>();
      deck.forEach((c) => counts.set(c.prop, (counts.get(c.prop) ?? 0) + 1));
      expect([...counts.values()].every((n) => n === 2)).toBe(true);
      expect(new Set(deck.map((c) => c.id)).size).toBe(pairs * 2);
    }
  });
});

describe('catch game', () => {
  it('slows down after misses and never speeds up', () => {
    expect(nextSpeed(12, 0)).toBe(12);
    expect(nextSpeed(12, 2)).toBe(10);
    expect(nextSpeed(6, 5)).toBe(6);
    expect(GOAL).toBeGreaterThan(0);
  });
});

describe('word builder', () => {
  beforeEach(() => useSettings.setState({ childName: 'Mia', customWords: [] }));

  it("offers the child's name, picture words and free typing", () => {
    render(<MemoryRouter><WordBuilder /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'mia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.letters.freeTyping })).toBeInTheDocument();
  });

  it('lets a grown-up add any word, which becomes the word to build', () => {
    render(<MemoryRouter><WordBuilder /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(strings.letters.grownUpWord), { target: { value: 'Rocket' } });
    fireEvent.click(screen.getByRole('button', { name: strings.letters.addWord }));
    expect(useSettings.getState().customWords).toContain('rocket');
    expect(screen.getByRole('button', { name: 'rocket' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('builds the word from key presses (any case)', () => {
    render(<MemoryRouter><WordBuilder /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'cat' }));
    for (const k of ['c', 'A', 't']) fireEvent.keyDown(window, { key: k, code: `Key${k.toUpperCase()}` });
    expect(screen.getByRole('button', { name: strings.letters.sayWord })).toBeInTheDocument();
  });
});
