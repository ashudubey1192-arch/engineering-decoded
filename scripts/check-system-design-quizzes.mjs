import assert from 'node:assert/strict';
import fs from 'node:fs';
import { systemDesignFundamentalsArticles } from '../src/data/systemDesignFundamentals.js';
import { highLevelDesignArticles } from '../src/data/highLevelDesign.js';
import { lowLevelDesignArticles } from '../src/data/lowLevelDesign.js';
import { scalabilityQuiz } from '../src/data/systemDesignQuizOverrides.js';

const bank = JSON.parse(fs.readFileSync('src/data/systemDesignQuizzes.json', 'utf8'));
const visuals = JSON.parse(fs.readFileSync('src/data/systemDesignVisuals.json', 'utf8'));
const tracks = { 'system-design-fundamentals': systemDesignFundamentalsArticles, 'high-level-design': highLevelDesignArticles, 'low-level-design': lowLevelDesignArticles };
for (const [track, articles] of Object.entries(tracks)) {
  for (const article of articles) {
    const key = `${track}/${article.slug}`;
    assert.equal(bank[key]?.length, 5, `${key} must have five questions`);
    assert.equal(new Set(bank[key].map(question => question.prompt)).size, 5, `${key} repeats a question`);
    assert.equal(new Set(bank[key].map(question => question.explanation)).size, 5, `${key} repeats the same fact`);
    assert.ok(visuals[key]?.diagrams.length, `${key} has no visual`);
    assert.ok(visuals[key].frames.length >= 3, `${key} needs at least three walkthrough steps`);
    for (const { svg, caption } of visuals[key].diagrams) {
      assert.ok(svg.startsWith('<svg') && svg.includes('viewBox=') && caption, `${key} has an invalid diagram`);
      assert.ok(!/<script|<foreignObject|\son\w+=|(?:href|src)="(?!#)/i.test(svg), `${key} has unsafe SVG content`);
    }
    for (const frame of visuals[key].frames) assert.ok(frame.title && frame.text.length >= 20, `${key} has an empty frame`);
  }
}
for (const questions of [...Object.values(bank), scalabilityQuiz]) {
  for (const question of questions) {
    assert.equal(new Set(question.options).size, 4, 'Each question needs four distinct choices');
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4);
    assert.ok(question.prompt && question.explanation);
    assert.ok(question.options.every(option => option.length > 0 && !/[{}]|&[a-z]+;/.test(option)), 'Unprocessed JSX in quiz options');
  }
}
assert.equal(scalabilityQuiz.length, 10);
console.log(`Verified five distinct questions and animated visual walkthroughs for ${Object.keys(bank).length} lessons, plus the 10-question scalability assessment.`);
