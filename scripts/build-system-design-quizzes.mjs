
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { tracks, plain, sectionHtml, blocks, articlePath } from './system-design-content.mjs';
import { vocabulary } from './system-design-vocabulary.mjs';
import { conceptQuizOverrides } from '../src/data/systemDesignQuizOverrides.js';
import { visualFallbacks } from './system-design-visual-fallbacks.mjs';

// Blank a technical term in an authored fact; its complete sentence is the explanation.
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRegex = term => new RegExp(`(?<![\\w])${escape(term)}(?![\\w])`, 'gi');
const shortTerms = html => [...html.matchAll(/<(?:b|strong|code)\b[^>]*>([\s\S]*?)<\/(?:b|strong|code)>/g)].map(match => plain(match[1])).filter(term => /^[\w][\w +()-]{1,45}$/.test(term) && term.split(' ').length <= 5);
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const bank = {};
const visuals = {};
const missing = [];
try {
  for (const [track, articles] of Object.entries(tracks)) {
    for (const [lessonIndex, article] of articles.entries()) {
      const { default: Article } = await server.ssrLoadModule(articlePath(track, article));
      const html = renderToStaticMarkup(createElement(Article));
      const key = `${track}/${article.slug}`;
      const sections = ['overview', 'concepts', 'example', 'mistakes'].map(id => blocks(sectionHtml(html, id)));
      const takeaway = [...html.matchAll(/<(?:p|div) class="takeaway"[^>]*>([\s\S]*?)<\/(?:p|div)>/g)].map(match => ({ html: match[1], text: plain(match[1]) }));
      const pool = [...sections.flat(), ...takeaway].filter(item => !/\?/.test(item.text) && !/coming|being added|checkmarks|badge|in progress/i.test(item.text));
      const localTerms = [...new Set([...shortTerms(html), ...vocabulary])];
      const usedTexts = new Set();
      const usedAnswers = new Set();
      const questions = [];
      for (let index = 0; index < 5 && !conceptQuizOverrides[key]; index++) {
        const preferred = index === 4 ? takeaway : sections[index];
        const candidates = [...(preferred || []), ...pool];
        let chosen;
        for (const block of candidates) {
          if (!pool.includes(block)) continue;
          const terms = localTerms.filter(term => !usedAnswers.has(term.toLowerCase()) && termRegex(term).test(block.text)).sort((a, b) => b.length - a.length);
          for (const term of terms) {
            if (term === 'signature' && block.text.includes('visual signature')) continue;
            const sentence = block.text.split(/(?<=[.!])\s+(?=[A-Z])/).find(text => !usedTexts.has(text) && text.length >= 45 && text.length <= 650 && termRegex(term).test(text));
            if (!sentence || sentence.includes('____')) continue;
            chosen = { block, term, sentence };
            break;
          }
          if (chosen) break;
        }
        if (!chosen) { missing.push(`${track}/${article.slug}: ${index} questions`); break; }
        const { block, term, sentence } = chosen;
        usedTexts.add(sentence);
        usedAnswers.add(term.toLowerCase());
        const alternatives = vocabulary.filter(other => other.toLowerCase() !== term.toLowerCase() && !other.toLowerCase().includes(term.toLowerCase()) && !term.toLowerCase().includes(other.toLowerCase()) && !termRegex(other).test(sentence));
        const related = alternatives.filter(other => termRegex(other).test(plain(html)));
        const nearby = alternatives.filter(other => Math.abs(vocabulary.indexOf(other) - vocabulary.indexOf(term)) < 12);
        const distractors = [...new Set([...related, ...nearby, ...alternatives])];
        const seed = (lessonIndex + index) % Math.max(1, Math.min(8, distractors.length - 3));
        const wrong = distractors.slice(seed, seed + 3);
        const answer = (lessonIndex + index) % 4;
        const options = [...wrong];
        options.splice(answer, 0, sentence.match(termRegex(term))[0]);
        questions.push({ prompt: `Which term completes this statement from ${article.title}?\n\n“${sentence.replace(termRegex(term), '____')}”`, options, answer, explanation: sentence });
      }
      bank[key] = conceptQuizOverrides[key] || questions;
      const figures = [...html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(match => match[0]);
      const captions = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)].map(match => plain(match[1]));
      const exampleSteps = [...sectionHtml(html, 'example').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(match => ({ title: plain(match[1].match(/<b[^>]*>([\s\S]*?)<\/b>/)?.[1] || ''), text: plain(match[1]) }));
      const frames = exampleSteps.length >= 3 ? exampleSteps.filter(item => !/checkmarks|badge|coming|being added/i.test(item.text)).slice(0, 6) : [sections[0][0], sections[1][0], sections[2][0], takeaway[0] || sections[3][0]].filter(Boolean).map((item, i) => ({ title: ['The idea', 'The mechanism', 'In practice', 'Remember'][i], text: item.text }));
      visuals[key] = { title: article.title, diagrams: figures.map((svg, i) => ({ svg, caption: captions[i] || `${article.title}: components and relationships.` })), frames: frames.map((frame, i) => ({ ...frame, title: frame.title && frame.title.length < 80 ? frame.title : `Step ${i + 1}` })) };
      if (!figures.length && visualFallbacks[key]) visuals[key].diagrams.push(visualFallbacks[key]);
    }
  }
  if (missing.length) throw new Error(`Need additional source terms:\n${missing.join('\n')}`);
  fs.writeFileSync('src/data/systemDesignQuizzes.json', `${JSON.stringify(bank, null, 2)}\n`);
  fs.writeFileSync('src/data/systemDesignVisuals.json', `${JSON.stringify(visuals, null, 2)}\n`);
  console.log(`Built five questions and visual walkthroughs for ${Object.keys(bank).length} lessons.`);
} finally {
  await server.close();
}
