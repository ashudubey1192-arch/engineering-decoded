export function lesson(
  intro,
  concepts,
  code,
  walkthrough,
  flow,
  mistake,
  exercise,
  answer,
  reference = null,
) {
  return { intro, concepts, code, walkthrough, flow, mistake, exercise, answer, reference };
}
