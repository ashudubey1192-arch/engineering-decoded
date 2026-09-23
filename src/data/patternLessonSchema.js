export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Java snippets are compiled and executed by build-pattern-lessons.mjs. The browser
// plays those recorded executions; it never pretends to execute Java in JavaScript.
export function problem(id, title, contract, signature, brute, optimal, reasoning, complexity, tests) {
  return { id, title, contract, signature, brute, optimal, reasoning,
    complexity, tests, slug: `problems--${id}`, sectionSlug: "problems", time: "25 min" };
}
export function example(label, args, expected) { return { label, args, expected }; }
