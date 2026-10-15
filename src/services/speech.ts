/**
 * Fallback speech for UI labels while recorded audio is not yet available.
 * Recorded clips (via AudioManager) take precedence once they exist.
 */
export function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en';
    u.rate = 0.8;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech unavailable: stay silent */
  }
}
