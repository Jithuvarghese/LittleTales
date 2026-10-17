import { Character } from './cast/Character';
import { species } from './cast/species';
import type { ReactNode } from 'react';

/**
 * Prop library: simple picture-book objects drawn on a 100×100 grid with thick
 * outlines and flat fills (see docs/ART_STYLE.md). Each prop has an id, a name and
 * the letter it starts with, so it can serve quizzes, letters, counting and stickers.
 */
export type PropDef = { id: string; name: string; letter: string; draw: ReactNode };

const O = '#4a2f27';
const eye = (x: number, y: number) => <circle cx={x} cy={y} r={3.5} fill={O} stroke="none" />;
const smile = (x: number, y: number, w = 8) => (
  <path d={`M${x - w} ${y}q${w} ${w} ${w * 2} 0`} fill="none" />
);

const defs: PropDef[] = [
  { id: 'apple', name: 'apple', letter: 'A', draw: <><path d="M50 30c-25-14-42 6-38 30 4 22 22 34 38 26 16 8 34-4 38-26 4-24-13-44-38-30z" fill="#e8553f" /><path d="M50 30q2-14 10-20" fill="none" /><path d="M54 22q14-8 20 2q-12 6-20-2z" fill="#6cbf4b" /></> },
  { id: 'ant', name: 'ant', letter: 'A', draw: <><circle cx="28" cy="58" r="12" fill="#7a4b3a" /><circle cx="50" cy="58" r="10" fill="#7a4b3a" /><circle cx="72" cy="52" r="13" fill="#7a4b3a" />{eye(76, 48)}<path d="M40 66l-8 16M50 68v16M60 66l8 16M76 40l6-14M68 40l-4-14" fill="none" /></> },
  { id: 'ball', name: 'ball', letter: 'B', draw: <><circle cx="50" cy="52" r="34" fill="#4fa3e8" /><path d="M16 52h68M50 18q-22 34 0 68M50 18q22 34 0 68" fill="none" /></> },
  { id: 'banana', name: 'banana', letter: 'B', draw: <><path d="M20 30q4 50 62 46q6-6 0-8q-46 0-50-40z" fill="#f7d443" /><path d="M20 30l-4-8" fill="none" /></> },
  { id: 'bee', name: 'bee', letter: 'B', draw: <><ellipse cx="38" cy="30" rx="14" ry="10" fill="#dff3ff" /><ellipse cx="62" cy="30" rx="14" ry="10" fill="#dff3ff" /><ellipse cx="50" cy="56" rx="30" ry="22" fill="#f7c843" /><path d="M42 36v40M58 36v40" strokeWidth="7" fill="none" />{eye(72, 50)}</> },
  { id: 'bird', name: 'bird', letter: 'B', draw: <><ellipse cx="48" cy="56" rx="30" ry="24" fill="#5ab6e8" /><path d="M30 54q14 18 30 2" fill="#3f8fc0" /><path d="M76 48l14 4-14 6z" fill="#f2a33a" />{eye(66, 46)}<path d="M40 80v8M54 80v8" fill="none" /></> },
  { id: 'book', name: 'book', letter: 'B', draw: <><path d="M12 26q20-8 38 2v54q-18-10-38-2z" fill="#ff8a6b" /><path d="M88 26q-20-8-38 2v54q18-10 38-2z" fill="#6bc1ff" /></> },
  { id: 'balloon', name: 'balloon', letter: 'B', draw: <><ellipse cx="50" cy="40" rx="26" ry="30" fill="#ff7aa8" /><path d="M46 70h8l-4 6z" fill="#ff7aa8" /><path d="M50 76q-8 10 0 20" fill="none" /></> },
  { id: 'bell', name: 'bell', letter: 'B', draw: <><path d="M26 72q4-46 24-46t24 46z" fill="#f7c843" /><path d="M20 72h60" /><circle cx="50" cy="80" r="6" fill="#f2a33a" /><circle cx="50" cy="22" r="5" fill="#f7c843" /></> },
  { id: 'butterfly', name: 'butterfly', letter: 'B', draw: <><path d="M50 50q-30-40-40-10q0 24 40 10zM50 50q30-40 40-10q0 24-40 10z" fill="#c9a0ff" /><path d="M50 52q-26 30-30 10zM50 52q26 30 30 10z" fill="#ff9fc4" /><path d="M50 30v44M48 30l-6-10M52 30l6-10" fill="none" /></> },
  { id: 'cat', name: 'cat', letter: 'C', draw: <><path d="M24 40l2-24 16 14h16l16-14 2 24q6 38-26 40q-32-2-26-40z" fill="#f2a65a" />{eye(40, 50)}{eye(60, 50)}<path d="M47 60h6l-3 3z" fill="#e8553f" />{smile(50, 64, 6)}<path d="M20 58h12M68 58h12" fill="none" /></> },
  { id: 'car', name: 'car', letter: 'C', draw: <><path d="M10 64v-14q0-6 8-8l12-14h38l14 14q8 2 8 8v14z" fill="#e8553f" /><path d="M36 32h12v12H26zM56 32h10l10 12H56z" fill="#dff3ff" /><circle cx="30" cy="68" r="10" fill="#555" /><circle cx="72" cy="68" r="10" fill="#555" /></> },
  { id: 'cake', name: 'cake', letter: 'C', draw: <><rect x="18" y="46" width="64" height="38" rx="6" fill="#ffcfe0" /><path d="M18 58q8 8 16 0t16 0t16 0t16 0" fill="#fff" /><rect x="46" y="26" width="8" height="20" fill="#6bc1ff" /><path d="M50 14q6 6 0 12q-6-6 0-12z" fill="#f7c843" /></> },
  { id: 'carrot', name: 'carrot', letter: 'C', draw: <><path d="M38 30q12-6 24 0l-12 60z" fill="#f28a2e" /><path d="M50 30q-10-18-2-22M50 30q0-20 8-22M50 30q10-14 18-12" fill="none" stroke="#3f9a3a" /></> },
  { id: 'cloud', name: 'cloud', letter: 'C', draw: <path d="M24 70q-16 0-14-14q2-12 16-10q2-16 20-16q14 0 18 12q16-4 20 10q12 2 6 18z" fill="#fff" /> },
  { id: 'cow', name: 'cow', letter: 'C', draw: <><path d="M24 26l-10-8M76 26l10-8" fill="none" /><rect x="22" y="22" width="56" height="54" rx="24" fill="#fff" /><ellipse cx="34" cy="38" rx="8" ry="10" fill="#555" /><ellipse cx="50" cy="66" rx="20" ry="13" fill="#ffc2c8" /><circle cx="44" cy="66" r="3" fill={O} /><circle cx="56" cy="66" r="3" fill={O} />{eye(40, 46)}{eye(62, 46)}</> },
  { id: 'crown', name: 'crown', letter: 'C', draw: <><path d="M16 74l-4-44 20 18 18-26 18 26 20-18-4 44z" fill="#f7c843" /><circle cx="50" cy="56" r="6" fill="#e8553f" /></> },
  { id: 'cup', name: 'cup', letter: 'C', draw: <><path d="M22 30h48l-6 50H28z" fill="#6bc1ff" /><path d="M70 40q16 0 14 14t-18 10" fill="none" /><path d="M36 22q4-8 0-14M50 22q4-8 0-14" fill="none" /></> },
  { id: 'dog', name: 'dog', letter: 'D', draw: <><ellipse cx="50" cy="52" rx="28" ry="26" fill="#d9a066" /><path d="M24 34q-14 20 0 34zM76 34q14 20 0 34z" fill="#8b5a3c" />{eye(40, 48)}{eye(60, 48)}<ellipse cx="50" cy="60" rx="7" ry="5" fill={O} />{smile(50, 68, 6)}</> },
  { id: 'duck', name: 'duck', letter: 'D', draw: <><path d="M16 60q0 24 36 24q32 0 34-26q-14 6-30 2q6-6 6-16q0-16-16-16t-16 18q0 8 6 12q-14 2-20 2z" fill="#f7d443" /><path d="M24 36l-14 2 14 6z" fill="#f2a33a" />{eye(38, 36)}</> },
  { id: 'drum', name: 'drum', letter: 'D', draw: <><ellipse cx="50" cy="34" rx="34" ry="12" fill="#fff4e3" /><path d="M16 34v34q34 22 68 0V34q-34 22-68 0z" fill="#e8553f" /><path d="M16 46l20 20 14-20 14 20 20-20" fill="none" /><path d="M30 10l14 18M70 10l-14 18" fill="none" /></> },
  { id: 'egg', name: 'egg', letter: 'E', draw: <path d="M50 14q30 4 30 46q0 28-30 28t-30-28q0-42 30-46z" fill="#fff4e3" /> },
  { id: 'elephant', name: 'elephant', letter: 'E', draw: <><circle cx="50" cy="46" r="28" fill="#a9b6c6" /><ellipse cx="20" cy="46" rx="14" ry="18" fill="#c3cdd9" /><ellipse cx="80" cy="46" rx="14" ry="18" fill="#c3cdd9" /><path d="M44 62q-4 26 10 26q4-2 0-6q-6 0-4-20z" fill="#a9b6c6" />{eye(40, 42)}{eye(60, 42)}</> },
  { id: 'fish', name: 'fish', letter: 'F', draw: <><path d="M14 50q30-34 60 0q-30 34-60 0z" fill="#f28a2e" /><path d="M72 50l18-16v32z" fill="#f2a33a" />{eye(30, 46)}<path d="M44 38q6 12 0 24" fill="none" /></> },
  { id: 'flower', name: 'flower', letter: 'F', draw: <><path d="M50 56v36" stroke="#3f9a3a" fill="none" /><path d="M50 78q14-14 22-6q-10 10-22 6z" fill="#6cbf4b" />{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={50 + 16 * Math.cos((a * Math.PI) / 180)} cy={38 + 16 * Math.sin((a * Math.PI) / 180)} r="12" fill="#ff8fb8" />)}<circle cx="50" cy="38" r="10" fill="#f7d443" /></> },
  { id: 'frog', name: 'frog', letter: 'F', draw: <><ellipse cx="50" cy="60" rx="34" ry="24" fill="#6cbf4b" /><circle cx="34" cy="36" r="11" fill="#6cbf4b" /><circle cx="66" cy="36" r="11" fill="#6cbf4b" />{eye(34, 36)}{eye(66, 36)}{smile(50, 60, 14)}</> },
  { id: 'fox', name: 'fox', letter: 'F', draw: <><path d="M22 40q-6-26 6-32q14 6 20 20zM78 40q6-26-6-32q-14 6-20 20z" fill="#f2913d" /><path d="M24 22q0-10 4-14q6 2 10 8q-8 0-14 6zM76 22q0-10-4-14q-6 2-10 8q8 0 14 6z" fill={O} stroke="none" /><path d="M50 22q32 0 34 30q2 14-8 20l4 4q-16 9-30 8q-14 1-30-8l4-4q-10-6-8-20q2-30 34-30z" fill="#f2913d" /><path d="M26 58q10-4 24 3q14-7 24-3q-2 20-24 21q-22-1-24-21z" fill="#fff6e8" /><ellipse cx="38" cy="47" rx="5" ry="6" fill={O} stroke="none" /><ellipse cx="62" cy="47" rx="5" ry="6" fill={O} stroke="none" /><circle cx="40" cy="45" r="1.8" fill="#fff" stroke="none" /><circle cx="64" cy="45" r="1.8" fill="#fff" stroke="none" /><ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill={O} /><ellipse cx="31" cy="60" rx="5" ry="3.5" fill="#ff9e8f" stroke="none" /><ellipse cx="69" cy="60" rx="5" ry="3.5" fill="#ff9e8f" stroke="none" /></> },
  { id: 'goat', name: 'goat', letter: 'G', draw: <><path d="M34 22q-6-12-14-10M66 22q6-12 14-10" fill="none" /><rect x="28" y="20" width="44" height="56" rx="20" fill="#eee6da" />{eye(40, 42)}{eye(60, 42)}<path d="M44 76q6 14 12 0" fill="#eee6da" /></> },
  { id: 'grapes', name: 'grapes', letter: 'G', draw: <>{[[40, 34], [60, 34], [50, 50], [30, 50], [70, 50], [40, 66], [60, 66], [50, 82]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="11" fill="#9b6bd6" />)}<path d="M50 22v-12" fill="none" /></> },
  { id: 'hat', name: 'hat', letter: 'H', draw: <><ellipse cx="50" cy="72" rx="40" ry="10" fill="#6b5bd6" /><path d="M28 70V32q22-12 44 0v38z" fill="#6b5bd6" /><path d="M28 58h44" stroke="#f7c843" strokeWidth="8" /></> },
  { id: 'house', name: 'house', letter: 'H', draw: <><path d="M14 46L50 16l36 30" fill="#e8553f" /><rect x="22" y="44" width="56" height="42" fill="#fff4e3" /><rect x="42" y="60" width="16" height="26" fill="#8b5a3c" /><rect x="28" y="52" width="10" height="10" fill="#6bc1ff" /></> },
  { id: 'heart', name: 'heart', letter: 'H', draw: <path d="M50 84Q10 56 16 34q6-18 22-16q10 2 12 12q2-10 12-12q16-2 22 16q6 22-34 50z" fill="#ff6f91" /> },
  { id: 'igloo', name: 'igloo', letter: 'I', draw: <><path d="M10 80q0-56 40-56t40 56z" fill="#e8f6ff" /><path d="M38 80v-16q12-12 24 0v16z" fill="#6aa8d6" /><path d="M14 64h72M20 48h60M50 24v24M30 48v16M70 48v16" fill="none" strokeWidth="3" /></> },
  { id: 'jam', name: 'jam', letter: 'J', draw: <><rect x="24" y="30" width="52" height="56" rx="10" fill="#d6365c" /><rect x="20" y="20" width="60" height="12" rx="4" fill="#f2a33a" /><rect x="34" y="48" width="32" height="20" rx="4" fill="#fff" /></> },
  { id: 'kite', name: 'kite', letter: 'K', draw: <><path d="M50 8l28 32-28 36-28-36z" fill="#ff8a6b" /><path d="M50 8v68M22 40h56" fill="none" /><path d="M50 76q-10 8 0 14t0 10" fill="none" /></> },
  { id: 'lamp', name: 'lamp', letter: 'L', draw: <><path d="M30 18h40l12 32H18z" fill="#f7d443" /><path d="M50 50v30" fill="none" /><rect x="32" y="78" width="36" height="10" rx="4" fill="#8b5a3c" /></> },
  { id: 'leaf', name: 'leaf', letter: 'L', draw: <><path d="M16 84Q12 20 84 16q4 68-68 68z" fill="#6cbf4b" /><path d="M16 84L64 36" fill="none" /></> },
  { id: 'lion', name: 'lion', letter: 'L', draw: <><circle cx="50" cy="50" r="38" fill="#c9762e" /><circle cx="50" cy="52" r="26" fill="#f2b84b" />{eye(41, 46)}{eye(59, 46)}<path d="M45 58h10l-5 5z" fill={O} />{smile(50, 64, 6)}</> },
  { id: 'mango', name: 'mango', letter: 'M', draw: <><path d="M26 56q-6-36 30-38q30 2 26 34q-4 34-32 32q-22-2-24-28z" fill="#f7b633" /><path d="M56 18q8-10 18-6q-6 10-18 6z" fill="#6cbf4b" /></> },
  { id: 'moon', name: 'moon', letter: 'M', draw: <path d="M60 12a38 38 0 1 0 26 58a30 30 0 1 1-26-58z" fill="#f7e27a" /> },
  { id: 'mouse', name: 'mouse', letter: 'M', draw: <><circle cx="30" cy="34" r="14" fill="#c3cdd9" /><circle cx="70" cy="34" r="14" fill="#c3cdd9" /><ellipse cx="50" cy="58" rx="28" ry="24" fill="#c3cdd9" />{eye(40, 54)}{eye(60, 54)}<circle cx="50" cy="66" r="4" fill="#ff8fb8" /></> },
  { id: 'nest', name: 'nest', letter: 'N', draw: <><ellipse cx="40" cy="50" rx="10" ry="13" fill="#bfe6ff" /><ellipse cx="58" cy="48" rx="10" ry="13" fill="#fff4e3" /><path d="M10 52q40 14 80 0q-4 34-40 34t-40-34z" fill="#a8743f" /><path d="M18 62q32 10 64 0M24 72q26 8 52 0" fill="none" /></> },
  { id: 'octopus', name: 'octopus', letter: 'O', draw: <><path d="M20 50q0-36 30-36t30 36v14q-6 14-10 0q-4 14-10 0q-4 14-10 0q-4 14-10 0q-4 14-10 0q-6 14-10 0z" fill="#b57ad6" />{eye(40, 42)}{eye(60, 42)}{smile(50, 52, 6)}</> },
  { id: 'orange', name: 'orange', letter: 'O', draw: <><circle cx="50" cy="54" r="32" fill="#f7922e" /><path d="M50 22q10-10 20-4q-8 10-20 4z" fill="#6cbf4b" /></> },
  { id: 'owl', name: 'owl', letter: 'O', draw: <><path d="M22 28l8-14 12 10h16l12-10 8 14q8 54-28 58q-36-4-28-58z" fill="#9b7bd6" /><circle cx="38" cy="40" r="11" fill="#fff" /><circle cx="62" cy="40" r="11" fill="#fff" />{eye(38, 40)}{eye(62, 40)}<path d="M46 52h8l-4 8z" fill="#f2a33a" /></> },
  { id: 'pig', name: 'pig', letter: 'P', draw: <><path d="M26 26l-6-12 16 6M74 26l6-12-16 6" fill="#ffb3c4" /><circle cx="50" cy="52" r="32" fill="#ffb3c4" /><ellipse cx="50" cy="60" rx="14" ry="10" fill="#ff8fa8" /><circle cx="45" cy="60" r="3" fill={O} /><circle cx="55" cy="60" r="3" fill={O} />{eye(38, 44)}{eye(62, 44)}</> },
  { id: 'pencil', name: 'pencil', letter: 'P', draw: <><path d="M20 70L66 24l12 12-46 46-16 4z" fill="#f7d443" /><path d="M66 24l8-8q6 0 12 12l-8 8z" fill="#ff8fb8" /></> },
  { id: 'quilt', name: 'quilt', letter: 'Q', draw: <><rect x="14" y="18" width="72" height="64" rx="6" fill="#ffcfe0" /><path d="M14 40h72M14 60h72M38 18v64M62 18v64" fill="none" /><rect x="38" y="40" width="24" height="20" fill="#a8ecd2" /><rect x="14" y="18" width="24" height="22" fill="#bfe6ff" /><rect x="62" y="60" width="24" height="22" fill="#f7e27a" /></> },
  { id: 'rabbit', name: 'rabbit', letter: 'R', draw: <><ellipse cx="38" cy="26" rx="8" ry="20" fill="#fff" /><ellipse cx="62" cy="26" rx="8" ry="20" fill="#fff" /><circle cx="50" cy="60" r="26" fill="#fff" />{eye(41, 56)}{eye(59, 56)}<path d="M46 66h8l-4 4z" fill="#ff8fb8" /></> },
  { id: 'rainbow', name: 'rainbow', letter: 'R', draw: <><path d="M8 80a42 42 0 0 1 84 0" fill="none" stroke="#e8553f" strokeWidth="10" /><path d="M20 80a30 30 0 0 1 60 0" fill="none" stroke="#f7d443" strokeWidth="10" /><path d="M32 80a18 18 0 0 1 36 0" fill="none" stroke="#5ab6e8" strokeWidth="10" /></> },
  { id: 'shell', name: 'shell', letter: 'S', draw: <><path d="M50 84L14 44q36-44 72 0z" fill="#ffc2a8" /><path d="M50 84L30 30M50 84V22M50 84l20-54" fill="none" /></> },
  { id: 'sock', name: 'sock', letter: 'S', draw: <path d="M36 12h28v50q0 26-26 26q-22 0-22-16q0-12 20-14z" fill="#6bc1ff" /> },
  { id: 'star', name: 'star', letter: 'S', draw: <path d="M50 8l11.8 25.4 27.8 3.1-20.6 18.8 5.7 27.4L50 69l-24.7 13.7 5.7-27.4L10.4 36.5l27.8-3.1z" fill="#ffd23f" /> },
  { id: 'sun', name: 'sun', letter: 'S', draw: <><g fill="none">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d={`M${50 + 32 * Math.cos((a * Math.PI) / 180)} ${50 + 32 * Math.sin((a * Math.PI) / 180)}L${50 + 44 * Math.cos((a * Math.PI) / 180)} ${50 + 44 * Math.sin((a * Math.PI) / 180)}`} />)}</g><circle cx="50" cy="50" r="24" fill="#ffcb47" />{eye(42, 46)}{eye(58, 46)}{smile(50, 56, 7)}</> },
  { id: 'tree', name: 'tree', letter: 'T', draw: <><rect x="42" y="56" width="16" height="32" fill="#8b5a3c" /><circle cx="50" cy="38" r="28" fill="#5aae4b" /><circle cx="36" cy="46" r="16" fill="#5aae4b" /><circle cx="66" cy="46" r="16" fill="#5aae4b" /></> },
  { id: 'turtle', name: 'turtle', letter: 'T', draw: <><path d="M16 64q4-40 34-40t34 40z" fill="#5aae4b" /><path d="M36 30l-6 34M64 30l6 34M24 48h52" fill="none" /><circle cx="88" cy="58" r="9" fill="#a6d98a" /><path d="M24 64v10M70 64v10" fill="none" /></> },
  { id: 'umbrella', name: 'umbrella', letter: 'U', draw: <><path d="M10 50q0-36 40-36t40 36q-10-8-20 0q-10-8-20 0q-10-8-20 0q-10-8-20 0z" fill="#9b6bd6" /><path d="M50 50v30q0 8-8 8t-8-8" fill="none" /></> },
  { id: 'van', name: 'van', letter: 'V', draw: <><path d="M8 70V28h56l18 18 10 4v20z" fill="#5ab6e8" /><path d="M64 32l12 14H64z" fill="#dff3ff" /><rect x="16" y="34" width="16" height="12" fill="#dff3ff" /><rect x="38" y="34" width="16" height="12" fill="#dff3ff" /><circle cx="26" cy="72" r="9" fill="#555" /><circle cx="72" cy="72" r="9" fill="#555" /></> },
  { id: 'whale', name: 'whale', letter: 'W', draw: <><path d="M10 54q4-30 44-30q34 0 34 26q0 22-30 22H24q-14 0-14-18z" fill="#4f88c8" /><path d="M86 46l8-16-12 4zM50 24q-2-12 4-16M50 24q4-10 10-12" fill="#4f88c8" />{eye(30, 48)}{smile(28, 58, 6)}</> },
  { id: 'watermelon', name: 'watermelon', letter: 'W', draw: <><path d="M10 40h80q0 40-40 40T10 40z" fill="#6cbf4b" /><path d="M18 40h64q0 30-32 30T18 40z" fill="#ff6f7f" />{[30, 44, 58, 70].map((x) => <ellipse key={x} cx={x} cy={52} rx="2" ry="4" fill={O} stroke="none" />)}</> },
  { id: 'xylophone', name: 'xylophone', letter: 'X', draw: <>{['#e8553f', '#f28a2e', '#f7d443', '#6cbf4b', '#5ab6e8', '#9b6bd6'].map((c, i) => <rect key={c} x={10 + i * 14} y={20 + i * 4} width="11" height={60 - i * 8} rx="3" fill={c} />)}</> },
  { id: 'yoyo', name: 'yo-yo', letter: 'Y', draw: <><circle cx="50" cy="60" r="28" fill="#ff8a6b" /><circle cx="50" cy="60" r="8" fill="#fff4e3" /><path d="M50 52V8" fill="none" /></> },
  { id: 'zebra', name: 'zebra', letter: 'Z', draw: <><path d="M30 20l-4-12 12 8M70 20l4-12-12 8" fill="#fff" /><rect x="26" y="16" width="48" height="70" rx="22" fill="#fff" /><path d="M26 34h14M60 34h14M26 50h12M62 50h12" fill="none" strokeWidth="6" /><ellipse cx="50" cy="74" rx="18" ry="11" fill="#555" />{eye(40, 44)}{eye(60, 44)}</> },
  { id: 'boat', name: 'boat', letter: 'B', draw: <><path d="M10 60h80l-12 22H22z" fill="#e8553f" /><path d="M50 56V12l28 40z" fill="#fff" /><path d="M46 56V22L24 52z" fill="#f7d443" /></> },
  { id: 'circle', name: 'circle', letter: 'C', draw: <circle cx="50" cy="50" r="34" fill="currentColor" /> },
  { id: 'square', name: 'square', letter: 'S', draw: <rect x="18" y="18" width="64" height="64" rx="6" fill="currentColor" /> },
  { id: 'triangle', name: 'triangle', letter: 'T', draw: <path d="M50 14l38 68H12z" fill="currentColor" /> },
  { id: 'basket', name: 'basket', letter: 'B', draw: <><path d="M26 44q24-36 48 0" fill="none" /><path d="M12 44h76l-10 40H22z" fill="#c98c4a" /><path d="M20 58h60M24 72h52" fill="none" /></> },
  { id: 'chair', name: 'chair', letter: 'C', draw: <><rect x="28" y="12" width="44" height="40" rx="8" fill="#5ab6e8" /><rect x="22" y="50" width="56" height="12" rx="4" fill="#3f8fc0" /><path d="M28 62v26M72 62v26" fill="none" /></> },
  { id: 'bed', name: 'bed', letter: 'B', draw: <><rect x="10" y="48" width="80" height="22" rx="6" fill="#bfe6ff" /><rect x="14" y="36" width="24" height="14" rx="6" fill="#fff" /><path d="M10 30v52M90 46v36" fill="none" /><path d="M40 48h50" fill="none" /></> },
];

export const propIndex: Record<string, PropDef> = Object.fromEntries(defs.map((d) => [d.id, d]));
export const propIds = defs.map((d) => d.id);

type PropProps = { id: string; size?: number | string; title?: string; color?: string; className?: string };

/** Renders a prop by id; unknown ids fall back to a friendly star, never a crash. */
export function Prop({ id, size = '100%', title, color, className }: PropProps) {
  // Animals that are cast members are drawn as characters, so they look the same everywhere.
  if (species[id] && !color) return <Character id={id} pose="happy" size={size} label={title ?? species[id]!.name} className={className} />;
  const def = propIndex[id] ?? propIndex.star!;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      stroke={O}
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={color ? { color } : undefined}
    >
      {def.draw}
    </svg>
  );
}
