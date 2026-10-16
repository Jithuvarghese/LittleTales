import voicesConfig from '../../config/voices.json';

/**
 * Voicing rules shared by the app (speech fallback), the story converter and the
 * narration generator, so every line is performed the same way everywhere.
 */

export const deliveries = ['narrator', 'excited', 'whisper', 'sleepy', 'sad', 'surprised', 'silly', 'proud', 'gentle'] as const;
export type Delivery = (typeof deliveries)[number];

export const roles = ['narrator', 'pip', 'bumble', 'luna', 'zig', 'coco', 'quizHost', 'teacher', 'songHost'] as const;
export type Role = (typeof roles)[number];

export type Part = { text: string; role: Role; delivery: Delivery };

type RoleCfg = { rate: number; pitch: number };
type DeliveryCfg = { rate: number; pitch: number; volume: number; pauseMs: number };
export const voices = voicesConfig as unknown as {
  ageRate: number;
  leadInMs: number;
  roles: Record<Role, RoleCfg & Record<string, unknown>>;
  deliveries: Record<Delivery, DeliveryCfg & { chain?: string }>;
  chains: Record<string, string>;
};

const CHARACTERS = ['pip', 'bumble', 'luna', 'zig', 'coco'] as const;
const QUOTE = /["“”]/;

/** Who says the quoted words: "…," said Luna / Luna said, "…" / asked Pip. */
export function inferSpeaker(text: string, cast: readonly string[] = CHARACTERS): Role | undefined {
  const names = cast.filter((c) => (CHARACTERS as readonly string[]).includes(c));
  const verbs = '(?:said|asked|called|cried|shouted|whispered|laughed|smiled|sang|replied|giggled|yawned)';
  for (const n of names) {
    const cap = n[0]!.toUpperCase() + n.slice(1);
    if (new RegExp(`${verbs}\\s+${cap}\\b|\\b${cap}\\s+${verbs}`).test(text)) return n as Role;
  }
  return undefined;
}

/** Picks a delivery from the words on the page when the author has not set one. */
export function inferDelivery(text: string): Delivery {
  const t = text.toLowerCase();
  if (/whisper|softly|\bshh\b/.test(t)) return 'whisper';
  if (/yawn|sleep|snor|good night|zzz|cosy|calm|quiet/.test(t)) return 'sleepy';
  if (/oh no|oh!|ouch|suddenly|whoosh|giant/.test(t)) return 'surprised';
  if (/not much fun|\bsad\b|alone|lost|thirsty|help!/.test(t)) return 'sad';
  if (/hooray|best .* ever|did it|ta-da|well done/.test(t)) return 'proud';
  if (/\b(boing|squawk|oink|quack|moo|beep|buzz|splish|plop|wheee)\b/.test(t)) return 'silly';
  if ((t.match(/!/g) ?? []).length >= 1) return 'excited';
  return 'narrator';
}

/**
 * Splits a line into narrator and dialogue parts. Quoted speech is performed by
 * the speaking character; the rest by the narrator. Delivery applies to both.
 */
export function splitParts(text: string, opts: { speaker?: Role; delivery?: Delivery; role?: Role } = {}): Part[] {
  const base: Role = opts.role ?? 'narrator';
  const delivery = opts.delivery ?? inferDelivery(text);
  if (!QUOTE.test(text) || base !== 'narrator') return [{ text, role: base, delivery }];
  const speaker = opts.speaker ?? inferSpeaker(text) ?? 'narrator';
  const parts: Part[] = [];
  for (const seg of text.split(/(["“][^"”]*["”])/)) {
    const t = seg.trim();
    if (!/\w/.test(t)) continue;
    const quoted = QUOTE.test(t[0]!);
    const own = inferDelivery(t);
    parts.push({
      text: t,
      role: quoted ? speaker : 'narrator',
      delivery: quoted && own !== 'narrator' ? own : delivery,
    });
  }
  return parts.length ? parts : [{ text, role: base, delivery }];
}

/** Final speaking rate and pitch for a part (age-adjusted). */
export function performance(role: Role, delivery: Delivery) {
  const r = voices.roles[role] ?? voices.roles.narrator;
  const d = voices.deliveries[delivery] ?? voices.deliveries.narrator;
  return {
    rate: r.rate * d.rate * voices.ageRate,
    pitch: r.pitch * d.pitch,
    volume: d.volume,
    pauseMs: d.pauseMs,
  };
}

/** Stable file slug for fixed UI lines such as praise ("Great job!"). */
export const lineSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

export const uiLineSrc = (text: string) => `audio/ui/en/${lineSlug(text)}.mp3`;
