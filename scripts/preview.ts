/** npm run content:preview -- <story-slug>: opens the story preview on the dev server. */
import { spawn } from 'node:child_process';

const slug = process.argv[2] ?? '';
const url = `http://localhost:5173/preview/${slug}`;
console.log(`Story preview: ${url}\n(Edit content/stories-src/${slug || '<slug>'}.md, run npm run content:convert, and the page reloads.)`);
const opener = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
spawn(opener[0] as string, opener[1] as string[], { stdio: 'ignore', detached: true }).unref();
spawn('npx', ['vite', '--port', '5173'], { stdio: 'inherit', shell: true });
