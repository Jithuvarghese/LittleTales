import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Character, poses, toPose } from '@/art/cast/Character';
import { castIds, mainCast, species } from '@/art/cast/species';
import { talk } from '@/art/cast/talk';
import { Scene } from '@/art/Scene';
import { resolveBackground, backgrounds } from '@/art/scene/Backgrounds';

describe('character cast', () => {
  it('has the five main characters and at least 25 supporting ones', () => {
    for (const id of mainCast) expect(species[id]).toBeDefined();
    expect(castIds.length - mainCast.length).toBeGreaterThanOrEqual(25);
  });

  it('renders every character in every pose without crashing', () => {
    for (const id of castIds) {
      for (const pose of poses) {
        const { unmount } = render(<Character id={id} pose={pose} size={50} />);
        unmount();
      }
    }
  });

  it('maps older expression names onto poses', () => {
    expect(toPose('celebrate')).toBe('cheer');
    expect(toPose('thinking')).toBe('think');
    expect(toPose('wave')).toBe('wave');
    expect(toPose(undefined)).toBe('idle');
  });

  it('opens the mouth only for the character that is talking', () => {
    const { container } = render(
      <>
        <Character id="pip" pose="idle" size={50} />
        <Character id="bumble" pose="idle" size={50} />
      </>,
    );
    act(() => {
      talk.setTalker('pip');
      talk.setLevel(0.8);
    });
    // An open mouth is drawn as an ellipse filled with the mouth colour.
    const svgs = container.querySelectorAll('svg');
    const mouthOpen = (svg: Element) => [...svg.querySelectorAll('ellipse')].some((e) => e.getAttribute('fill') === '#e0675a');
    expect(mouthOpen(svgs[0]!)).toBe(true);
    expect(mouthOpen(svgs[1]!)).toBe(false);
    act(() => talk.setTalker(null));
  });
});

describe('scene composer', () => {
  it('maps older backdrop names onto the new presets', () => {
    expect(resolveBackground('meadow')).toBe('meadow-day');
    expect(resolveBackground('night')).toBe('night-sky');
    expect(resolveBackground('kitchen')).toBe('kitchen');
    expect(backgrounds.length).toBeGreaterThanOrEqual(12);
  });

  it('draws characters as acting cast members, not icons', () => {
    render(<Scene scene={{ backdrop: 'farm', props: [], characters: [{ id: 'cow', x: 50, y: 60, size: 30, pose: 'happy' }] }} />);
    expect(screen.getByRole('img', { name: 'cow' })).toBeInTheDocument();
  });
});
