import assert from 'node:assert/strict';
import fs from 'node:fs';
import { systemDesignFundamentalsArticles } from '../src/data/systemDesignFundamentals.js';
import { highLevelDesignArticles } from '../src/data/highLevelDesign.js';
import { lowLevelDesignArticles } from '../src/data/lowLevelDesign.js';
import { scalabilityQuiz } from '../src/data/systemDesignQuizOverrides.js';

const bank = JSON.parse(fs.readFileSync('src/data/systemDesignQuizzes.json', 'utf8'));
const tracks = { 'system-design-fundamentals': systemDesignFundamentalsArticles, 'high-level-design': highLevelDesignArticles, 'low-level-design': lowLevelDesignArticles };
for (const [track, articles] of Object.entries(tracks)) {
  for (const article of articles) assert.ok(bank[`${track}/${article.slug}`]?.length, `Missing quiz: ${track}/${article.slug}`);
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
console.log(`Verified ${Object.keys(bank).length} lesson quizzes and the 10-question scalability assessment.`);
