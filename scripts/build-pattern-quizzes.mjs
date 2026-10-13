import fs from 'node:fs';
import { patternCurriculum } from '../src/data/patternCurriculum.js';
const directory = 'src/data/patterns/generated';
const lessons = fs.readdirSync(directory).filter(file => file.endsWith('.json')).map(file => JSON.parse(fs.readFileSync(`${directory}/${file}`, 'utf8')));
const bank = {};
const output = value => value === '' ? '"" (empty string)' : String(value);
function question(prompt, correct, pool, explanation, seed) {
  const normalize = value => /bounds/.test(prompt) ? value.replace(/auxiliary|space|time|[\s,]+/gi, '').toLowerCase() : value;
  const seen = new Set([normalize(correct)]);
  const alternatives = pool.filter(value => {
    if (typeof value !== 'string' || seen.has(normalize(value))) return false;
    seen.add(normalize(value)); return true;
  });
  if (alternatives.length < 3) throw new Error(`Not enough choices: ${prompt}`);
  const offset = seed % Math.min(5, alternatives.length - 2);
  const options = alternatives.slice(offset, offset + 3);
  const answer = seed % 4;
  options.splice(answer, 0, correct);
  return { prompt, options, answer, explanation };
}
for (const [index, lesson] of lessons.entries()) {
  const peers = lessons.filter(other => patternCurriculum.some(course => course.problems.includes(lesson.id) && course.problems.includes(other.id)));
  const pool = [...peers, ...lessons];
  bank[lesson.id] = [
    question(`${lesson.title}: which output contract must the solution satisfy?`, lesson.contract, pool.map(item => item.contract), lesson.contract, index),
    question('Which reasoning explains the optimized approach in this problem?', lesson.reasoning[1], pool.map(item => item.reasoning[1]), lesson.reasoning[1], index + 1),
    question('What are the optimized time and auxiliary-space bounds under the stated contract?', lesson.complexity[1], pool.map(item => item.complexity[1]), `${lesson.complexity[1]}. ${lesson.reasoning[1]}`, index + 2),
    question('What are the time and auxiliary-space bounds of the baseline implementation?', lesson.complexity[0], pool.map(item => item.complexity[0]), `${lesson.complexity[0]}. ${lesson.reasoning[0]}`, index + 3),
    question(`Predict the output for ${lesson.title}.\n\nInput: ${lesson.tests[0].args}`, output(lesson.tests[0].expected), lessons.flatMap(item => item.tests.map(test => output(test.expected))), `The verified Java execution returns ${output(lesson.tests[0].expected)}. ${lesson.contract}`, index + 4),
  ];
}
for (const course of patternCurriculum) {
  const sample = lessons.find(lesson => lesson.id === course.problems[0]);
  bank[`guide-${course.number}`] = [
    question(`Which mental model matches ${course.name}?`, course.model, patternCurriculum.map(item => item.model), course.model, course.number),
    question(`Which invariant or constraint is central to ${course.name}?`, course.rule, patternCurriculum.map(item => item.rule), course.rule, course.number + 1),
    question('Which exercise directly tests this pattern’s assumptions?', course.practice, patternCurriculum.map(item => item.practice), course.practice, course.number + 2),
    { ...bank[sample.id][0], prompt: `This course uses ${sample.title} as a worked example. What is its output contract?` },
    bank[sample.id][4],
  ];
}
fs.writeFileSync('src/data/patternQuizzes.json', `${JSON.stringify(bank, null, 2)}\n`);
console.log(`Generated five questions for ${lessons.length} problem labs and ${patternCurriculum.length} study guides.`);
