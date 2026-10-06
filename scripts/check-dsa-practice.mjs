import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { dsaPractice } from "../src/data/dsaPractice.js";
import { compareSearch, compareSort, parseLabValues } from "../src/data/dsaPlayground.js";
import {
  freshProgress,
  mergeProgress,
  nextReview,
  remainingSeconds,
} from "../src/services/dsaLearningState.js";

const workerSource = await readFile(
  new URL("../src/components/dsa/dsaPractice.worker.js", import.meta.url),
  "utf8",
);
function run(code, tests, timeout = 1000) {
  let output;
  runInNewContext(
    `${workerSource}\nself.onmessage({data: {code, tests}});`,
    {
      self: {
        postMessage: (data) => {
          output = data;
        },
      },
      code,
      tests: JSON.parse(JSON.stringify(tests)),
    },
    { timeout },
  );
  return output;
}
for (const problem of dsaPractice) {
  const result = run(problem.solution, problem.tests);
  assert.ok(
    result.results?.every((item) => item.passed),
    `${problem.id}: ${JSON.stringify(result)}`,
  );
  assert.ok(!run(problem.starter, problem.tests).results.every((item) => item.passed));
  assert.ok(problem.quiz.correct >= 0 && problem.quiz.correct < problem.quiz.choices.length);
}
assert.match(run("function solve( {", []).error, /./);
assert.match(run("const x = 1;", []).error, /solve/);
assert.equal(
  run("function solve() { throw new Error('Try again'); }", [
    { label: "error", input: [], expected: 0 },
  ]).results[0].error,
  "Try again",
);
assert.throws(
  () => run("function solve() { while(true) {} }", [{ label: "loop", input: [], expected: 0 }], 30),
  /timed out/,
);
assert.ok(
  run("function solve() { return {b:2,a:1}; }", [
    { label: "keys", input: null, expected: { a: 1, b: 2 } },
  ]).results[0].passed,
);
assert.deepEqual(parseLabValues(""), []);
assert.deepEqual(parseLabValues("1, -2, 0"), [1, -2, 0]);
for (const invalid of ["1,", "1.5", "NaN", "10000", "1,,2", Array(17).fill(1).join(",")])
  assert.throws(() => parseLabValues(invalid));
for (let length = 0; length <= 16; length++) {
  const values = Array.from({ length }, (_, i) => ((i * 17 + length * 3) % 11) - 5);
  const sorted = [...values].sort((a, b) => a - b);
  for (const result of compareSort(values)) assert.deepEqual(result.result, sorted);
  for (let target = -6; target <= 6; target++) {
    for (const result of compareSearch(sorted, target))
      assert.equal(result.result, sorted.indexOf(target));
  }
}
assert.deepEqual(
  compareSearch([1, 3, 5, 7, 9], 7).map((item) => item.comparisons),
  [4, 4],
);
assert.deepEqual(
  compareSort([1, 2, 3, 4]).map((item) => item.comparisons),
  [3, 3],
);
assert.deepEqual(
  compareSort([4, 3, 2, 1]).map((item) => item.comparisons),
  [6, 6],
);

const saved = new Map();
const local = { ...freshProgress(), drafts: { a: "new local" }, stamps: { "drafts:a": 20 } };
assert.equal(
  mergeProgress(local, [
    { category: "drafts", entryKey: "a", value: '"old remote"', updatedAt: 10 },
  ]).drafts.a,
  "new local",
);
assert.equal(
  mergeProgress(local, [
    { category: "drafts", entryKey: "a", value: '"new remote"', updatedAt: 30 },
  ]).drafts.a,
  "new remote",
);
assert.equal(
  mergeProgress(local, [
    { category: "drafts", entryKey: "a", value: "invalid json", updatedAt: 40 },
  ]).drafts.a,
  "new local",
);
assert.equal(nextReview(null, false, 0).dueAt, 86400000);
assert.equal(nextReview({ streak: 1 }, true, 0).dueAt, 3 * 86400000);
assert.equal(nextReview({ streak: 5 }, false, 0).streak, 0);
assert.equal(remainingSeconds({ deadline: 10000 }, 9001), 1);
assert.equal(remainingSeconds({ deadline: 10000 }, 11000), 0);
globalThis.window = {
  localStorage: {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
  },
};
const { updateDsaProgress } = await import("../src/services/dsaProgress.js");
updateDsaProgress("drafts", "array-min", "function solve() {}");
updateDsaProgress("solved", "array-min", true);
updateDsaProgress("quizzes", "array-min", { correct: false, attempts: 1 });
let data = JSON.parse([...saved.values()][0]);
assert.equal(data.drafts["array-min"], "function solve() {}");
assert.equal(data.solved["array-min"], true);
assert.equal(data.quizzes["array-min"].correct, false);
window.localStorage.setItem = () => {
  throw new Error("Storage blocked");
};
assert.doesNotThrow(() => updateDsaProgress("solved", "search-exact", true));
delete globalThis.window;
console.log(
  `Validated ${dsaPractice.length} practice solutions, worker errors, bounded execution, input validation, comparison results/counts, and progress storage.`,
);
