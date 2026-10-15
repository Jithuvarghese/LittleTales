import { initialQuiz, isFinished, quizReducer } from '@/features/stories/quiz/quizLogic';

describe('quiz hint and reveal rules', () => {
  it('celebrates a correct first answer', () => {
    const s = quizReducer(initialQuiz, { type: 'answer', correct: true, index: 0 });
    expect(s.status).toBe('correct');
    expect(isFinished(s)).toBe(true);
  });

  it('gives a hint after the first miss, never a failure', () => {
    const s = quizReducer(initialQuiz, { type: 'answer', correct: false, index: 2 });
    expect(s).toEqual({ misses: 1, status: 'hint', lastWrong: 2 });
    expect(isFinished(s)).toBe(false);
  });

  it('reveals the answer after the second miss and counts as finished', () => {
    let s = quizReducer(initialQuiz, { type: 'answer', correct: false, index: 1 });
    s = quizReducer(s, { type: 'answer', correct: false, index: 2 });
    expect(s.status).toBe('revealed');
    expect(isFinished(s)).toBe(true);
  });

  it('can still be answered correctly after a hint', () => {
    let s = quizReducer(initialQuiz, { type: 'answer', correct: false, index: 1 });
    s = quizReducer(s, { type: 'answer', correct: true, index: 0 });
    expect(s.status).toBe('correct');
  });

  it('ignores answers once finished, and resets', () => {
    const done = quizReducer(initialQuiz, { type: 'answer', correct: true, index: 0 });
    expect(quizReducer(done, { type: 'answer', correct: false, index: 1 })).toBe(done);
    expect(quizReducer(done, { type: 'reset' })).toEqual(initialQuiz);
  });
});
