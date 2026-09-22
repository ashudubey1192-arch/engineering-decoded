export function lesson(intro, concepts, code, steps, mistake, exercise, answer, reference) {
  return {
    intro,
    concepts,
    code,
    steps: steps.map(([title, explanation, nodes]) => ({ title, explanation, nodes })),
    mistake,
    exercise,
    answer,
    reference,
  };
}

export const mdn = (path) => `https://developer.mozilla.org/en-US/docs/${path}`;
export const tsDoc = (path) => `https://www.typescriptlang.org/docs/${path}`;
