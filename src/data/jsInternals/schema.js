// Shape of one JavaScript Internals lesson. scripts/build-js-internals.mjs --check enforces it.
//   snapshot:  a static "image" of the runtime at one moment (memory, call stack, queues...)
//              { title, panes: [[heading, [row, ...]], ...], caption }
//   animation: same compact format as the Frontend System Design course
//              nodes [[id, label, sub?]], steps [[from, to, token, note]]
//   mode:      "node" (default) runs the example and records its real console output;
//              "browser" needs window/DOM, so `sample` holds the expected output instead.
export function njs({
  intro,
  concepts,
  snapshot,
  animation,
  code,
  mode = "node",
  sample = null,
  walkthrough,
  deepDive,
  mistakes,
  interview,
  exercise,
  answer,
}) {
  return {
    intro,
    concepts,
    snapshot: {
      title: snapshot.title,
      caption: snapshot.caption,
      panes: snapshot.panes.map(([heading, rows]) => ({ heading, rows })),
    },
    animation: {
      title: animation.title,
      nodes: animation.nodes.map(([id, label, sub]) => ({ id, label, sub })),
      steps: animation.steps.map(([from, to, label, note]) => ({ from, to, label, note })),
    },
    code,
    mode,
    sample,
    walkthrough,
    deepDive,
    mistakes,
    interview: interview.map(([question, reply]) => ({ question, answer: reply })),
    exercise,
    answer,
  };
}
