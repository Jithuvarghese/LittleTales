import { act, fireEvent, render, screen } from '@testing-library/react';
import { checkAnswer, HOLD_MS, makeChallenge, useGate } from '@/features/parent/gate';
import { ParentGate } from '@/features/parent/ParentGate';
import { strings } from '@/strings';

describe('parent gate logic', () => {
  it('creates sums of two numbers a pre-reader cannot solve alone', () => {
    for (let i = 0; i < 50; i++) {
      const c = makeChallenge();
      expect(c.a + c.b).toBeGreaterThanOrEqual(9);
      expect(c.a + c.b).toBeLessThanOrEqual(18);
    }
  });
  it('accepts only the exact answer', () => {
    const c = { a: 7, b: 6 };
    expect(checkAnswer(c, '13')).toBe(true);
    expect(checkAnswer(c, ' 13 ')).toBe(true);
    expect(checkAnswer(c, '12')).toBe(false);
    expect(checkAnswer(c, 'thirteen')).toBe(false);
    expect(checkAnswer(c, '')).toBe(false);
  });
});

describe('ParentGate', () => {
  beforeEach(() => {
    useGate.setState({ unlocked: false });
    vi.useFakeTimers();
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb((now += 100)), 16) as unknown as number);
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('a quick tap does not open the question', () => {
    render(<ParentGate />);
    const btn = screen.getByRole('button', { name: strings.parent.gateHold });
    fireEvent.pointerDown(btn);
    act(() => void vi.advanceTimersByTime(200));
    fireEvent.pointerUp(btn);
    act(() => void vi.advanceTimersByTime(HOLD_MS));
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('holding, then answering correctly unlocks; a wrong answer does not', () => {
    render(<ParentGate />);
    fireEvent.pointerDown(screen.getByRole('button', { name: strings.parent.gateHold }));
    act(() => void vi.advanceTimersByTime(HOLD_MS + 1000));
    const input = screen.getByRole('textbox');
    const [a, b] = screen.getByText(/What is/).textContent!.match(/\d+/g)!.map(Number) as [number, number];
    fireEvent.change(input, { target: { value: String(a + b + 1) } });
    fireEvent.submit(input.closest('form')!);
    expect(useGate.getState().unlocked).toBe(false);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    const [c, d] = screen.getByText(/What is/).textContent!.match(/\d+/g)!.map(Number) as [number, number];
    fireEvent.change(screen.getByRole('textbox'), { target: { value: String(c + d) } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(useGate.getState().unlocked).toBe(true);
  });
});
