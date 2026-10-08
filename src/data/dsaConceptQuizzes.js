import { dsaLessons, getDsaLesson } from './dsaLessons.js';

const allLessons = Object.values(dsaLessons).flatMap(course => course.sections.flatMap(section => section.lessons));
const specs = [
  ['intro', 'Which description matches this concept?', 'reasoning'],
  ['invariant', 'Which invariant should remain true during this algorithm?', 'reasoning'],
  ['complexityTime', 'Which time-complexity analysis matches the implementation in this lesson?', 'complexityTime'],
  ['mistake', 'Which mistake does this lesson specifically warn against?', 'mistake'],
  ['answer', '', 'answer'],
];

export function getDsaConceptQuiz(courseSlug, lessonSlug) {
  const lesson = getDsaLesson(courseSlug, lessonSlug);
  if (!lesson) return [];
  const peers = dsaLessons[courseSlug].sections.flatMap(section => section.lessons);
  const seed = [...lessonSlug].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return specs.map(([field, prompt, explanationField], index) => {
    const correct = lesson[field];
    const uniqueChoices = lessons => [...new Set(lessons.map(item => item[field]))].filter(value => typeof value === 'string' && value && value !== correct);
    const related = uniqueChoices(peers);
    const alternatives = related.length >= 3 ? related : uniqueChoices([...peers, ...allLessons]);
    const offset = (seed + index) % Math.max(1, Math.min(peers.length, alternatives.length - 2));
    const options = alternatives.slice(offset, offset + 3);
    const answer = (seed + index) % 4;
    options.splice(answer, 0, correct);
    return {
      prompt: field === 'answer' ? `Apply the concept: ${lesson.exercise}` : `${lesson.title}\n\n${prompt}`,
      options,
      answer,
      explanation: lesson[explanationField],
    };
  });
}
