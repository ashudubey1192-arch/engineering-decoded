export function lesson(
  intro,
  concepts,
  code,
  walkthrough,
  flow,
  mistake,
  exercise,
  answer,
  reference = "https://react.dev/learn",
) {
  return { intro, concepts, code, walkthrough, flow, mistake, exercise, answer, reference };
}
