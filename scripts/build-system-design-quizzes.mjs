import fs from 'node:fs';
import path from 'node:path';
import { systemDesignFundamentalsArticles } from '../src/data/systemDesignFundamentals.js';
import { highLevelDesignArticles } from '../src/data/highLevelDesign.js';
import { lowLevelDesignArticles } from '../src/data/lowLevelDesign.js';

// Reuse the authored lesson facts, keeping quiz content aligned with the course.
const entities = { apos: "'", quot: '"', amp: '&', lt: '<', gt: '>', nbsp: ' ', mdash: '—', ndash: '–', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', rarr: '→', times: '×' };
const plain = (html) => html.replace(/\{["']\s*["']\}/g, ' ').replace(/<[^>]*>/g, '').replace(/&([a-z]+);/g, (all, key) => entities[key] ?? all).replace(/\s+/g, ' ').trim();
const tracks = { 'system-design-fundamentals': systemDesignFundamentalsArticles, 'high-level-design': highLevelDesignArticles, 'low-level-design': lowLevelDesignArticles };
const bank = {};
for (const [track, articles] of Object.entries(tracks)) {
  const lessons = articles.map(article => {
    const file = path.join('src/components/system-design', track, article.sectionSlug, 'articles', article.slug, 'jsx/Article.jsx');
    const source = fs.readFileSync(file, 'utf8');
    const overview = source.match(/<section id="overview">([\s\S]*?)<\/section>/)?.[1] || source;
    const paragraphs = [...overview.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)].map(match => plain(match[1]));
    const definition = paragraphs.find(text => text.length > 60 && !/[{}]/.test(text));
    if (!definition) throw new Error(`Missing quiz source: ${file}`);
    return { ...article, definition };
  });
  lessons.forEach((lesson, index) => {
    const distractors = lessons.filter(other => other.sectionSlug === lesson.sectionSlug && other.slug !== lesson.slug);
    const pool = [...distractors, ...lessons.filter(other => other.sectionSlug !== lesson.sectionSlug)];
    const choices = [lesson, ...pool.slice(0, 3)];
    const offset = index % 4;
    const ordered = [...choices.slice(offset), ...choices.slice(0, offset)];
    bank[`${track}/${lesson.slug}`] = [{
      prompt: `Which description best matches ${lesson.title}?`,
      options: ordered.map(item => item.definition),
      answer: ordered.findIndex(item => item.slug === lesson.slug),
      explanation: lesson.definition,
    }];
  });
}
fs.writeFileSync('src/data/systemDesignQuizzes.json', `${JSON.stringify(bank, null, 2)}\n`);
console.log(`Built quizzes for ${Object.keys(bank).length} system design lessons.`);
