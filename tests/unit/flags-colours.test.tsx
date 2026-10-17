import { render, screen } from '@testing-library/react';
import { flagArt, Flag } from '@/art/flags';
import { flags, colours } from '@/content/loaders';
import { taskFor, breakTasks, allBreakLines } from '@/app/breakTasks';
import { makeRound } from '@/features/colours/Colours';

describe('flags', () => {
  it('has a drawing for every flag in the content', () => {
    for (const f of flags) expect(flagArt[f.id]).toBeDefined();
    expect(flags.length).toBeGreaterThanOrEqual(20);
  });
  it('renders a named flag', () => {
    render(<Flag id="india" title="India" />);
    expect(screen.getByRole('img', { name: 'India' })).toBeInTheDocument();
  });
});

describe('colours', () => {
  it('pop-the-colour rounds offer three different colours including the target', () => {
    for (let i = 0; i < 20; i++) {
      const { options, target } = makeRound(3);
      expect(new Set(options.map((c) => c.name)).size).toBe(3);
      expect(options).toContain(target);
    }
    expect(colours.length).toBeGreaterThanOrEqual(8);
  });
});

describe('stretch-break tasks', () => {
  it('match the section the child is in', () => {
    expect(breakTasks.colours).toContainEqual(taskFor('/colours/find', () => 0));
    expect(breakTasks.numbers).toContainEqual(taskFor('/numbers/count', () => 0));
    expect(taskFor('/numbers/count', () => 0).text).toMatch(/count/i);
    expect(breakTasks.default).toContainEqual(taskFor('/grown-ups', () => 0));
  });
  it('includes counting fans and finding a colour', () => {
    expect(allBreakLines.some((t) => /fans/.test(t))).toBe(true);
    expect(allBreakLines.some((t) => /Find something blue/.test(t))).toBe(true);
  });
});
