import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
// Match Vite's extension resolution without starting a development server.
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); }
  catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.js`, context); throw error; }
} });
const { modules } = await import('../src/data/catalog.js');
const { getStructuredCourse } = await import('../src/data/structuredCourses.js');
const { getTutorialLesson } = await import('../src/data/tutorialLessons.js');
const { getAiConceptQuestions } = await import('../src/data/aiConceptExercises.js');
const { getAiTrace } = await import('../src/data/aiConceptTraces.js');
const { aiEngineeringLessons } = await import('../src/data/aiEngineeringLessons.js');
const { questionsFor } = await import('../src/data/aiEngineering/helpers.js');
const module = modules.find(item => item.id === 'ai');
let lessons = 0;
const tracks = module.groups.flatMap(group => group.tracks);
for (const track of tracks) {
  const course = getStructuredCourse(module.id, track.slug);
  for (const article of course.articles) {
    const key = `${track.slug}/${article.slug}`;
    const engineering = track.slug === 'ai-engineering' ? aiEngineeringLessons[article.slug] : null;
    const { mechanism } = getTutorialLesson(module, track, article);
    const questions = engineering ? questionsFor(engineering) : getAiConceptQuestions(mechanism, article);
    assert.equal(questions.length, 5, key);
    assert.equal(new Set(questions.map(item => item.prompt)).size, 5, key);
    for (const question of questions) {
      assert.equal(new Set(question.options.map(option => option.toLowerCase())).size, 4, key);
      assert.ok(question.options.every(option => typeof option === 'string' && option.trim()), key);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, key);
      assert.ok(question.explanation.includes(question.options[question.answer]), `${key}: answer not explained`);
      assert.ok(!/[{}]/.test(question.prompt + question.explanation), `${key}: unresolved template`);
    }
    const frames = engineering ? engineering.steps.map(step => ({ title: step.title, text: step.state })) : getAiTrace(mechanism);
    assert.ok(frames.length >= 3, `${key}: incomplete walkthrough`);
    if (!engineering) assert.deepEqual(frames.map(frame => frame.text), mechanism.example.split('\n').filter(Boolean), `${key}: trace diverges from lesson`);
    assert.ok(frames.every(frame => frame.title && frame.text), key);
    assert.deepEqual(engineering ? questionsFor(engineering) : getAiConceptQuestions(mechanism, article), questions, `${key}: unstable choices`);
    lessons++;
  }
  for (const canonical of Object.values(course.aliases || {})) assert.ok(course.articles.some(article => article.slug === canonical));
}
assert.equal(tracks.length, 10);
console.log(`Verified ${lessons} AI articles across ${tracks.length} courses: ${lessons * 5} questions, answer explanations, and lesson-aligned animated traces.`);
