/**
 * Quiz attempt rules (no failure states):
 *  - correct answer → celebrate
 *  - first miss     → gentle "try again" + hint (correct option glows)
 *  - second miss    → reveal the answer and celebrate anyway
 */
export type QuizStatus = 'asking' | 'hint' | 'revealed' | 'correct';
export type QuizState = { misses: number; status: QuizStatus; lastWrong: number | null };
export type QuizEvent = { type: 'answer'; correct: boolean; index: number } | { type: 'reset' };

export const initialQuiz: QuizState = { misses: 0, status: 'asking', lastWrong: null };

export function quizReducer(state: QuizState, ev: QuizEvent): QuizState {
  if (ev.type === 'reset') return initialQuiz;
  if (state.status === 'correct' || state.status === 'revealed') return state;
  if (ev.correct) return { ...state, status: 'correct', lastWrong: null };
  const misses = state.misses + 1;
  return { misses, status: misses >= 2 ? 'revealed' : 'hint', lastWrong: ev.index };
}

export const isFinished = (s: QuizState) => s.status === 'correct' || s.status === 'revealed';
