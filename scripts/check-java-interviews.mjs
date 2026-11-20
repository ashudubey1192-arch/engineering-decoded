import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { javaSections, javaArticles } from '../src/data/java.js';

const chapters = JSON.parse(readFileSync('src/data/javaInterviewContent.json', 'utf8'));
const section = javaSections.filter(item => item.slug === 'java-interview');
assert.equal(section.length, 1);
// The one interview section holds all 27 guide chapters plus every other interview lesson.
for (const chapter of chapters) assert.ok(section[0].lessons.some(l => l.slug === chapter.slug), `${chapter.slug} missing from Interview`);
assert.ok(!javaSections.some(item => item.slug !== 'java-interview' && /interview/i.test(item.title)), 'interview content outside the Interview section');
assert.ok(!javaSections.some(item => item.slug !== 'java-interview' && item.lessons.some(l => /interview-questions/.test(l.slug))), 'interview lesson left in a topic section');
assert.equal(new Set(javaArticles.map(a => a.slug)).size, javaArticles.length);
for (const [guide, prefix, count] of [['corejava', 'Q', 200], ['java8', 'Q', 100], ['java8', 'P', 34], ['collections', 'Q', 43], ['collections', 'Problem ', 10]]) {
  const numbers = chapters.filter(c => c.guide === guide).flatMap(c => c.blocks).map(b => b.text.match(new RegExp(`^${prefix}(\\d+)[.:]`))).filter(Boolean).map(m => Number(m[1]));
  assert.deepEqual(numbers, Array.from({ length: count }, (_, i) => i + 1));
}
assert.ok(chapters.flatMap(c => c.blocks).filter(b => b.type === 'table').length >= 4);
const diagrams = chapters.flatMap(c => c.blocks).filter(b => b.type === 'image');
assert.equal(diagrams.length, 47);
for (const diagram of diagrams) assert.ok(existsSync(`public${diagram.src}`));
for (const file of ['java8-top100.pdf', 'java-collections-equality.pdf', 'core-java-top200.pdf']) assert.ok(existsSync(`public/java-interview/${file}`));
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, esbuild: { jsx: 'automatic' }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  for (const chapter of chapters) {
    // The source's quick-fire conceptual chapter intentionally contains prose only.
    if (chapter.slug !== 'java-interview--collections-9') assert.ok(chapter.blocks.some(b => b.type === 'code'), chapter.slug);
    const path = `/src/components/backend/java/java-interview/articles/${chapter.slug}/jsx/Article.jsx`;
    const { default: Article } = await server.ssrLoadModule(path);
    const html = renderToStaticMarkup(createElement(Article));
    assert.ok(html.includes('Search this interview chapter') && html.includes('Open the attached guide'));
    for (const image of chapter.blocks.filter(b => b.type === 'image')) assert.ok(html.includes(image.src), `${chapter.slug}: missing diagram`);
    for (const table of chapter.blocks.filter(b => b.type === 'table')) assert.ok(table.rows.every(row => row.length === table.rows[0].length), `${chapter.slug}: uneven table columns`);
    for (const block of chapter.blocks.filter(b => b.type === 'heading' && /^(Q\d+\.|P\d+\.|Problem \d+:)/.test(b.text))) {
      assert.ok(html.includes(block.text.split(/[<&]/)[0].replaceAll('"', '&quot;').replaceAll("'", '&#x27;')), block.text);
    }
  }
  console.log('PASS: Java-only Interview section; 27 routes rendered; 343 questions, 44 coding problems, 47 diagrams and all three PDFs verified.');
} finally { await server.close(); }
