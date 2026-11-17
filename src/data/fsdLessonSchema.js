// Shared shape for Frontend System Design lessons. It matches the React lesson schema
// (3 concepts, 3 flow steps, no reference section) and adds a compact animation format:
//   nodes: [[id, label, sub?], ...]
//   steps: [[from, to, tokenLabel, note], ...]
// scripts/check-frontend-system-design.mjs enforces the shape.
export function fsd({
  intro,
  concepts,
  code,
  walkthrough,
  flow,
  mistake,
  exercise,
  answer,
  deepDive = [],
  animation,
}) {
  return {
    intro,
    concepts,
    code,
    walkthrough,
    flow,
    mistake,
    exercise,
    answer,
    deepDive,
    reference: null,
    animation: animation && {
      title: animation.title,
      nodes: animation.nodes.map(([id, label, sub]) => ({ id, label, sub })),
      steps: animation.steps.map(([from, to, label, note]) => ({ from, to, label, note })),
    },
  };
}
