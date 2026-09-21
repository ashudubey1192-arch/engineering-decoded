export function lesson(
  intro,
  concepts,
  code,
  walkthrough,
  flow,
  mistake,
  exercise,
  answer,
  reference = "https://angular.dev/overview",
) {
  return { intro, concepts, code, walkthrough, flow, mistake, exercise, answer, reference };
}
