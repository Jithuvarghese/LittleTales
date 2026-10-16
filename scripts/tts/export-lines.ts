/**
 * npm run audio:export-lines
 * Writes tools/notebooks/lines.json (every line with role, delivery and target path)
 * and tools/notebooks/bakeoff-lines.json (the five comparison lines) for the free
 * GPU notebook in tools/notebooks/voice-bakeoff.ipynb.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { collectClipsForExport } from './generate';

const BAKEOFF = [
  { id: 'calm', text: 'Pip looked up at the big, round moon.', delivery: 'narrator' },
  { id: 'excited', text: 'Hooray! We found the treasure!', delivery: 'excited' },
  { id: 'whisper', text: 'Shh... the baby bird is sleeping.', delivery: 'whisper' },
  { id: 'sad', text: 'Oh no. The kite is stuck in the tree.', delivery: 'sad' },
  { id: 'letters', text: 'B says buh... one, two, three!', delivery: 'excited' },
];

mkdirSync('tools/notebooks', { recursive: true });
const lines = collectClipsForExport().map((c) => ({ out: c.out, text: c.text, parts: c.parts }));
writeFileSync('tools/notebooks/lines.json', JSON.stringify(lines, null, 1));
writeFileSync('tools/notebooks/bakeoff-lines.json', JSON.stringify(BAKEOFF, null, 1));
console.log(`Wrote ${lines.length} lines to tools/notebooks/lines.json and 5 test lines to bakeoff-lines.json.`);
console.log('Upload them to the notebook (tools/notebooks/voice-bakeoff.ipynb) on a free GPU service.');
