import { AudioManager } from './AudioManager';

/** Speaks a short UI label (recorded clip when available, otherwise the speech fallback). */
export function speak(text: string) {
  try {
    AudioManager.say(text, { channel: 'ui' });
  } catch {
    /* audio unavailable: stay silent */
  }
}
