import { readFileSync } from 'node:fs';
import { validateDir } from '../../scripts/validate-content';
import { convert, parseScene } from '../../scripts/md-to-story';
import { estimateTimings } from '../../scripts/tts/provider';
import { applyPronunciations, jobHash } from '../../scripts/tts/generate';
import { story } from '@/content/schema';

describe('content validation', () => {
  it('passes for all shipped content', () => {
    const r = validateDir();
    expect(r.errors).toEqual([]);
  });

  it('catches a deliberately broken story', () => {
    const r = validateDir('tests/fixtures/broken-stories', '');
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors.join('\n')).toMatch(/title/);
  });

  it('flags props missing from the art library', () => {
    const raw = JSON.parse(readFileSync('tests/fixtures/broken-stories/broken-story.json', 'utf8'));
    raw.title = 'Fixed title';
    expect(story.safeParse(raw).success).toBe(true); // schema is fine...
  });

  it('rejects quizzes without exactly one correct option', () => {
    const raw = JSON.parse(readFileSync('content/stories/en/pip-and-the-moon.json', 'utf8'));
    const quiz = raw.pages.find((p: { type: string }) => p.type === 'quiz');
    quiz.options.forEach((o: { correct?: boolean }) => (o.correct = true));
    expect(story.safeParse(raw).success).toBe(false);
  });
});

describe('markdown story converter', () => {
  it('parses scene lines into props and characters', () => {
    const { scene } = parseScene('night | moon 70 25 22 float | pip 40 65 40 happy');
    expect(scene.backdrop).toBe('night');
    expect(scene.props).toEqual([{ prop: 'moon', x: 70, y: 25, size: 22, anim: 'float' }]);
    expect(scene.characters).toEqual([{ id: 'pip', x: 40, y: 65, size: 40, expression: 'happy' }]);
  });

  it('round-trips a shipped story source', () => {
    const md = readFileSync('content/stories-src/pip-and-the-moon.md', 'utf8').replace(/\r\n/g, '\n');
    const s = convert(md);
    expect(s.id).toBe('pip-and-the-moon');
    expect(s.pages.filter((p) => p.type === 'story')).toHaveLength(9);
    expect(s.pages.filter((p) => p.type === 'quiz')).toHaveLength(2);
  });
});

describe('narration tooling', () => {
  it('estimates word timings covering the clip in order', () => {
    const t = estimateTimings('Pip looked up at the moon.', 3000);
    expect(t).toHaveLength(6);
    expect(t[0]!.startMs).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < t.length; i++) expect(t[i]!.startMs).toBeGreaterThanOrEqual(t[i - 1]!.endMs - 1);
    expect(t.at(-1)!.endMs).toBeLessThanOrEqual(3000);
  });

  it('hashes so unchanged text is never regenerated', () => {
    const v = { speed: 0.85 };
    expect(jobHash('Hello', v, 'piper')).toBe(jobHash('Hello', v, 'piper'));
    expect(jobHash('Hello', v, 'piper')).not.toBe(jobHash('Hello!', v, 'piper'));
    expect(jobHash('Hello', v, 'piper')).not.toBe(jobHash('Hello', v, 'kokoro'));
  });

  it('applies whole-word pronunciation overrides only', () => {
    expect(applyPronunciations("Anu's kite and Anu", { Anu: 'Ahnoo', "Anu's": "Ahnoo's" })).toBe("Ahnoo's kite and Ahnoo");
    expect(applyPronunciations('Anubis', { Anu: 'Ahnoo' })).toBe('Anubis');
  });
});
