export const clean = text => text.replace(/[{}]/g, '');
export const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
// Braces mark the five concepts assessed by the quiz. They never reach the UI.
export const chapter = (title, intro, explanation, steps, code, pitfall, exercise) => ({ title, intro, explanation, steps: steps.map(([title, detail, state]) => ({ title, detail, state })), code, pitfall, exercise });
export const section = (title, context, reference, chapters) => ({ title, slug: slugify(title), context, reference, chapters });
export function questionsFor(lesson) {
  const facts = [lesson.explanation, ...lesson.steps.map(step => step.detail)];
  const terms = facts.map(fact => fact.match(/\{([^}]+)\}/)?.[1]);
  if (terms.length !== 5 || new Set(terms).size !== 5 || terms.some(term => !term)) throw new Error(`Invalid quiz concepts in ${lesson.title}`);
  return facts.map((fact, index) => {
    const sentence = fact.split(/(?<=[.!?])\s+/).find(text => text.includes('{'));
    const answer = (index + lesson.title.length) % 4;
    const options = terms.filter((_, other) => other !== index).slice(0, 3);
    options.splice(answer, 0, terms[index]);
    return { prompt: `Complete the explanation.\n\n${sentence.replace(/\{[^}]+\}/, '____')}`, options, answer, explanation: clean(fact) };
  });
}
