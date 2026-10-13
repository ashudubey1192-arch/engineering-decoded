import assert from 'node:assert/strict';
import fs from 'node:fs';
import { aiEngineeringLessons, aiEngineeringSections } from '../src/data/aiEngineeringLessons.js';
import { clean, questionsFor } from '../src/data/aiEngineering/helpers.js';
import { referenceSections } from './ai-engineering-reference.mjs';

const outline = JSON.parse(fs.readFileSync('src/data/aiEngineeringOutline.json', 'utf8'));
assert.equal(referenceSections.length, 16);
assert.equal(Object.keys(aiEngineeringLessons).length, 87);
assert.deepEqual(aiEngineeringSections.map(section => ({ title: section.title, topics: section.chapters.map(chapter => chapter.title) })), referenceSections, 'Reference topic coverage/order differs');
assert.deepEqual(outline.map(section => ({ title: section.title, topics: section.lessons.map(article => article.title) })), referenceSections, 'Generated outline is stale');
const uniqueExplanations = new Set();
const uniqueQuestions = new Set();
let words = 0;
for (const [slug, lesson] of Object.entries(aiEngineeringLessons)) {
  assert.equal(lesson.steps.length, 4, slug);
  assert.ok(lesson.steps.every(step => step.title && step.detail.length > 60 && step.state), `${slug}: incomplete animation`);
  assert.equal(new Set(lesson.steps.map(step => step.state)).size, 4, `${slug}: repeated state`);
  const prose = clean([lesson.intro, lesson.explanation, lesson.reasoning, ...lesson.steps.map(step => step.detail), lesson.pitfall, lesson.exercise].join(' '));
  assert.ok(lesson.reasoning?.length >= 300, `${slug}: missing worked reasoning`);
  assert.ok(prose.split(/\s+/).length >= 200, `${slug}: insufficient chapter-specific detail`);
  assert.ok(lesson.context.length > 250 && lesson.code.includes('\n') && (lesson.reference?.startsWith('https://') || (lesson.sectionSlug === 'welcome' && lesson.reference === null)), `${slug}: incomplete content`);
  assert.ok(!uniqueExplanations.has(lesson.explanation), `${slug}: recycled explanation`);
  uniqueExplanations.add(lesson.explanation);
  words += prose.split(/\s+/).length;
  const questions = questionsFor(lesson);
  assert.equal(questions.length, 5, slug);
  for (const question of questions) {
    assert.equal(new Set(question.options.map(option => option.toLowerCase())).size, 4, `${slug}: repeated choices`);
    assert.ok(question.answer >= 0 && question.answer < 4, slug);
    assert.ok(question.explanation.includes(question.options[question.answer]), `${slug}: unexplained answer`);
    assert.ok(!question.prompt.includes('{') && !question.explanation.includes('{'), `${slug}: template marker leaked`);
    assert.ok(!uniqueQuestions.has(question.prompt), `${slug}: repeated quiz question`);
    uniqueQuestions.add(question.prompt);
  }
  const file = `src/components/ai/ai-engineering/${lesson.sectionSlug}/articles/${slug}/jsx/Article.jsx`;
  assert.ok(fs.existsSync(file), `${slug}: missing article entry point`);
}
assert.equal(outline.flatMap(section => section.lessons).length, 87);
console.log(`AI Engineering: all 87 reference topics in 16 sections; 435 distinct questions; 348 animation states; ${words.toLocaleString()} words of chapter-specific teaching content. Entry points and outline verified.`);
