export function lesson(
  intro,
  concepts,
  code,
  walkthrough,
  flow,
  mistake,
  exercise,
  answer,
  reference = "https://nextjs.org/docs/app",
) {
  return { intro, concepts, code, walkthrough, flow, mistake, exercise, answer, reference };
}
