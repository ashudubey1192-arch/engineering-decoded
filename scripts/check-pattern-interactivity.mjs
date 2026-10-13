import fs from 'node:fs';
import assert from 'node:assert/strict';
import { patternCourses } from '../src/data/patternCourses.js';
import { patternCurriculum } from '../src/data/patternCurriculum.js';
const quizzes = JSON.parse(fs.readFileSync('src/data/patternQuizzes.json', 'utf8'));
let articles = 0;
let courses = 0;
for (const [slug, course] of Object.entries(patternCourses)) {
  const canonical = course.componentPath === `coding-patterns/${slug}`;
  if (canonical) courses++;
  const guide = patternCurriculum.find(item => item.number === course.number);
  for (const article of course.articles) {
    const isGuide = article.sectionSlug === 'guide';
    const key = isGuide ? `guide-${course.number}` : article.slug.replace(/^problems--/, '');
    const questions = quizzes[key];
    assert.equal(questions?.length, 5, `${slug}/${article.slug}: five questions required`);
    assert.equal(new Set(questions.map(item => item.prompt)).size, 5);
    for (const question of questions) {
      assert.equal(new Set(question.options).size, 4, key);
      assert.ok(question.options.every(option => typeof option === 'string' && option.trim()), key);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, key);
      assert.ok(question.explanation?.trim(), key);
    }
    const problem = isGuide ? guide.problems[0] : key;
    const lesson = JSON.parse(fs.readFileSync(`src/data/patterns/generated/${problem}.json`, 'utf8'));
    for (const mode of ['brute', 'optimal']) {
      assert.equal(lesson.runs[mode].length, lesson.tests.length, problem);
      for (const run of lesson.runs[mode]) {
        assert.ok(run.frames.length > 0, problem);
        assert.ok(run.frames.every(frame => typeof frame.note === 'string' && frame.state && typeof frame.state === 'object'), problem);
      }
    }
    if (canonical) articles++;
  }
}
console.log(`Verified animations and five-question quizzes on ${articles} articles across ${courses} Coding Patterns courses, plus legacy aliases (${articles * 5} question placements).`);
