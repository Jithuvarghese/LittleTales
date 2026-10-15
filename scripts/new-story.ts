/**
 * Scaffolds a new story source file: npm run content:new-story -- my-story-slug
 * Edit content/stories-src/<slug>.md, then run npm run content:convert.
 */
import { existsSync, writeFileSync } from 'node:fs';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Usage: npm run content:new-story -- my-story-slug  (lowercase letters, numbers, dashes)');
  process.exit(1);
}
const path = `content/stories-src/${slug}.md`;
if (existsSync(path)) {
  console.error(`${path} already exists`);
  process.exit(1);
}
const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const page = (n: number) => `## Page
scene: meadow | tree 75 50 36 | pip 35 64 40 happy
text: Page ${n} text goes here.
tap: pip "Hello!" bounce
`;

writeFileSync(
  path,
  `---
id: ${slug}
title: ${title}
category: animals
ageBand: 3-5
duration: short
theme: sunny-meadow
music: play-01
characters: pip
cover: meadow | pip 50 62 44 happy
---

${[1, 2, 3, 4].map(page).join('\n')}
> quiz picture-choice: Which one is the tree?
- tree *
- car

${[5, 6, 7, 8].map(page).join('\n')}`,
);
console.log(`Created ${path}. Edit it, then run: npm run content:convert -- ${slug}`);
