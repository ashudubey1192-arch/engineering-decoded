import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { javaSections, javaArticles } from '../src/data/java.js';

const chapters = JSON.parse(readFileSync('src/data/javaInterviewContent.json', 'utf8'));
const section = javaSections.filter(item => item.slug === 'java-interview');
assert.equal(section.length, 1);
assert.equal(section[0].lessons.length, 19);
assert.equal(new Set(javaArticles.map(a => a.slug)).size, javaArticles.length);
for (const [guide, prefix, count] of [['java8', 'Q', 100], ['java8', 'P', 34], ['collections', 'Q', 43], ['collections', 'Problem ', 10]]) {
  const numbers = chapters.filter(c => c.guide === guide).flatMap(c => c.blocks).map(b => b.text.match(new RegExp(`^${prefix}(\\d+)[.:]`))).filter(Boolean).map(m => Number(m[1]));
  assert.deepEqual(numbers, Array.from({ length: count }, (_, i) => i + 1));
}
assert.equal(chapters.flatMap(c => c.blocks).filter(b => b.type === 'table').length, 4);
for (const file of ['java8-top100.pdf', 'java-collections-equality.pdf']) assert.ok(existsSync(`public/java-interview/${file}`));
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, esbuild: { jsx: 'automatic' }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  for (const chapter of chapters) {
    // The source's quick-fire conceptual chapter intentionally contains prose only.
    if (chapter.slug !== 'java-interview--collections-9') assert.ok(chapter.blocks.some(b => b.type === 'code'), chapter.slug);
    const path = `/src/components/backend/java/java-interview/articles/${chapter.slug}/jsx/Article.jsx`;
    const { default: Article } = await server.ssrLoadModule(path);
    const html = renderToStaticMarkup(createElement(Article));
    assert.ok(html.includes('Search this interview chapter') && html.includes('Open the attached guide'));
    for (const block of chapter.blocks.filter(b => b.type === 'heading' && /^(Q\d+\.|P\d+\.|Problem \d+:)/.test(b.text))) {
      assert.ok(html.includes(block.text.split(/[<&]/)[0].replaceAll('"', '&quot;').replaceAll("'", '&#x27;')), block.text);
    }
  }
  console.log('PASS: Java-only Interview section; 19 routes rendered; 143 questions, 44 coding problems, four tables and both PDFs verified.');
} finally { await server.close(); }
