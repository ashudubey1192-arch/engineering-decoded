import assert from 'node:assert/strict';
import { dsaLessons } from '../src/data/dsaLessons.js';
import { getDsaConceptQuiz } from '../src/data/dsaConceptQuizzes.js';
import { runDsaAlgorithm } from '../src/data/dsaAlgorithms.js';
import { javaArrayTraces } from '../src/data/javaArrayTraces.js';
let lessons = 0;
for (const [courseSlug, course] of Object.entries(dsaLessons)) {
  for (const lesson of course.sections.flatMap(section => section.lessons)) {
    const key = `${courseSlug}/${lesson.slug}`;
    const questions = getDsaConceptQuiz(courseSlug, lesson.slug);
    assert.equal(questions.length, 5, key);
    assert.equal(new Set(questions.map(question => question.prompt)).size, 5, key);
    for (const question of questions) {
      assert.equal(new Set(question.options).size, 4, key);
      assert.ok(question.options.every(option => typeof option === 'string' && option.trim()), key);
      assert.ok(question.answer >= 0 && question.answer < 4 && question.explanation, key);
    }
    const trace = lesson.java ? javaArrayTraces[lesson.java.id] : runDsaAlgorithm(lesson.algorithm, lesson.input);
    assert.ok(trace.frames.length > 0, `${key}: no animation frames`);
    lessons++;
  }
}
assert.deepEqual(getDsaConceptQuiz('missing', 'missing'), []);
console.log(`Verified ${lessons} DSA lessons: ${lessons * 5} quiz questions and executable animation traces.`);
