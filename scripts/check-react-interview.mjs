import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer, transformWithOxc } from 'vite';
import { reactInterviewQuestions, interviewSection } from '../src/data/reactInterview.js';
import { interviewVisual } from '../src/data/reactInterviewVisuals.js';

assert.deepEqual(reactInterviewQuestions.map(q => q.id), Array.from({ length: 200 }, (_, i) => i + 1));
// These PDF examples intentionally illustrate alternatives, CSS, shell commands,
// file layouts, incomplete JSX attributes, or class method excerpts.
const excerpts = new Set([25, 29, 32, 45, 46, 47, 115, 124, 128, 155, 161, 164, 182, 183]);
const server = await createServer({ optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { InterviewQuestion } = await server.ssrLoadModule('/src/components/frontend/react/ReactInterview.jsx');
  for (const q of reactInterviewQuestions) {
    assert.ok(q.title.length > 10 && q.page >= 9 && q.page <= 83);
    assert.ok(q.blocks.some(b => b.type === 'text' && b.text.length > 50), `Q${q.id}: answer`);
    assert.ok(q.blocks.some(b => b.type === 'code' && b.text.length > 15), `Q${q.id}: example`);
    const visual = interviewVisual(q);
    assert.ok(visual.nodes.length >= 3 && visual.steps.length >= 3, `Q${q.id}: diagram`);
    const ids = new Set(visual.nodes.map(n => n.id));
    for (const step of visual.steps) assert.ok(ids.has(step.from) && ids.has(step.to) && step.note.length > 20);
    const html = renderToStaticMarkup(createElement(InterviewQuestion, { question: q, defaultRevealed: true }));
    assert.ok(html.includes(`id="answer-${q.id}"`) && html.includes('<svg') && html.includes('<pre'), `Q${q.id}: rendered answer`);
    if (!excerpts.has(q.id)) await transformWithOxc(q.blocks.filter(b => b.type === 'code').map(b => b.text).join('\n'), `q${q.id}.tsx`, { lang: 'tsx' });
  }
  for (const route of interviewSection.lessons) {
    const { default: Article } = await server.ssrLoadModule(`/src/components/frontend/react/interview-200/articles/${route.slug}/jsx/Article.jsx`);
    const html = renderToStaticMarkup(createElement(Article));
    assert.ok(html.includes('Question filters') && html.includes('Study answer and example'), route.slug);
  }
  console.log('PASS: all 200 numbered answers, examples and animated diagrams render; 186 JSX/TSX examples parse; 10 interview routes render.');
} finally { await server.close(); }
