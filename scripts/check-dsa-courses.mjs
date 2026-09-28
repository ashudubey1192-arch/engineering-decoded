import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { dsaLessons } from "../src/data/dsaLessons.js";
import { dsaCourses } from "../src/data/dsaCourses.js";
import { dsaAlgorithms, runDsaAlgorithm } from "../src/data/dsaAlgorithms.js";
import { dsaAlgorithmSources } from "../src/data/dsaAlgorithmSources.js";
import { javaArrayTraces } from "../src/data/javaArrayTraces.js";

const plain = (value) => JSON.parse(JSON.stringify(value));
const foundation = dsaLessons["dsa-foundations"];
const foundationLessons = foundation.sections.flatMap((section) => section.lessons);
assert.equal(
  new Set(foundation.sections.map((section) => section.slug)).size,
  foundation.sections.length,
);
for (const [slug, course] of Object.entries(dsaLessons)) {
  if (slug === "dsa-foundations") continue;
  for (const lesson of course.sections.flatMap((section) => section.lessons)) {
    assert.ok(
      foundationLessons.some((item) => item.slug === `${slug}-${lesson.slug}`),
      `Complete foundation course omits ${slug}/${lesson.slug}`,
    );
  }
}
assert.ok(foundationLessons[0].title.includes("environment setup"));
assert.ok(foundationLessons.at(-1).title.includes("route-planning"));
let examples = 0,
  frames = 0,
  aliases = 0;
for (const [courseSlug, course] of Object.entries(dsaLessons)) {
  const articles = course.sections.flatMap((section) => section.lessons);
  assert.deepEqual(
    dsaCourses[courseSlug].articles.map((a) => a.slug),
    articles.map((a) => a.slug),
  );
  assert.equal(new Set(articles.map((a) => a.slug)).size, articles.length);
  for (const lesson of articles) {
    const id = `${courseSlug}/${lesson.slug}`;
    for (const field of [
      "intro",
      "reasoning",
      "invariant",
      "complexityTime",
      "space",
      "mistake",
      "exercise",
      "answer",
    ]) {
      assert.ok(
        typeof lesson[field] === "string" && lesson[field].length > 0,
        `${id}: missing ${field}`,
      );
    }
    assert.ok(
      lesson.intro.length > 180 && lesson.reasoning.length > 180,
      `${id}: explanation too brief`,
    );
    assert.notEqual(lesson.complexityTime, lesson.time, `${id}: reading time replaced complexity`);
    const inputBefore = JSON.stringify(lesson.input);
    const run = lesson.java
      ? javaArrayTraces[lesson.java.id]
      : runDsaAlgorithm(lesson.algorithm, lesson.input);
    assert.equal(JSON.stringify(lesson.input), inputBefore, `${id}: mutated input`);
    assert.ok(run.frames.length > 0, `${id}: no visual trace`);
    for (const frame of run.frames) {
      assert.ok(frame.note.length > 15, `${id}: missing step explanation`);
      if (frame.edges)
        for (const [from, to] of frame.edges) {
          assert.ok(
            from >= 0 && to >= 0 && from < frame.values.length && to < frame.values.length,
            `${id}: broken edge`,
          );
        }
    }
    // The exact implementation displayed to learners must run independently.
    if (lesson.java) {
      assert.equal(run.source, lesson.java.source, `${id}: stale Java trace`);
      assert.deepEqual(run.result, lesson.java.expected, `${id}: Java output mismatch`);
      assert.ok(lesson.steps.length >= 3 && lesson.project && lesson.boundaries.length);
      examples++;
      frames += run.frames.length;
      continue;
    }
    assert.equal(
      dsaAlgorithmSources[lesson.algorithm],
      dsaAlgorithms[lesson.algorithm].toString(),
      `${id}: regenerate readable source after changing implementation`,
    );
    const standalone = runInNewContext(
      `(${dsaAlgorithmSources[lesson.algorithm]})(${JSON.stringify(lesson.input)})`,
      {},
      { timeout: 2000 },
    );
    assert.deepEqual(
      plain(standalone),
      plain(run.result),
      `${id}: displayed code differs from visual result`,
    );
    examples++;
    frames += run.frames.length;
  }
  for (const [oldSlug, target] of Object.entries(dsaCourses[courseSlug].aliases)) {
    assert.ok(
      articles.some((a) => a.slug === target),
      `${courseSlug}/${oldSlug}: broken legacy alias`,
    );
    aliases++;
  }
}

// Compare algorithm results against independent reference operations on small,
// deterministic inputs, including empty arrays, duplicates, and negative values.
let seed = 12345;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
for (let trial = 0; trial < 50; trial++) {
  const values = Array.from({ length: trial % 11 }, () => Math.floor(random() * 21) - 10);
  const sorted = [...values].sort((a, b) => a - b);
  for (const algorithm of [
    "bubbleSort",
    "selectionSort",
    "insertionSort",
    "mergeSort",
    "quickSort",
    "heapSort",
    "shellSort",
  ]) {
    assert.deepEqual(dsaAlgorithms[algorithm]({ values }), sorted, algorithm);
  }
  const positive = values.map(Math.abs);
  for (let target = -11; target <= 11; target++) {
    assert.equal(dsaAlgorithms.jumpSearch({ values: sorted, target }), sorted.indexOf(target));
  }
  const shuffled = dsaAlgorithms.fisherYates({ values, seed: trial });
  assert.deepEqual(
    [...shuffled].sort((a, b) => a - b),
    sorted,
  );
  assert.deepEqual(dsaAlgorithms.fisherYates({ values, seed: trial }), shuffled);
  for (const algorithm of ["countingSort", "radixSort"])
    assert.deepEqual(
      dsaAlgorithms[algorithm]({ values: positive }),
      [...positive].sort((a, b) => a - b),
    );
  for (let target = -11; target <= 11; target++) {
    assert.equal(dsaAlgorithms.linearSearch({ values, target }), values.indexOf(target));
    assert.equal(dsaAlgorithms.binarySearch({ values: sorted, target }), sorted.indexOf(target));
    const boundary = sorted.findIndex((v) => v >= target);
    assert.equal(
      dsaAlgorithms.binarySearch({ values: sorted, target, lowerBound: true }),
      boundary < 0 ? sorted.length : boundary,
    );
  }
  assert.deepEqual(dsaAlgorithms.reverseList({ values }), [...values].reverse());
  const index = Math.floor(random() * (values.length + 1)),
    value = 42;
  const inserted = [...values];
  inserted.splice(index, 0, value);
  assert.deepEqual(dsaAlgorithms.insertArray({ values, index, value }), inserted);
  assert.deepEqual(dsaAlgorithms.listInsert({ values, index, value }), inserted);
  const unique = [...new Set(values)].sort((a, b) => a - b);
  assert.deepEqual(
    dsaAlgorithms.bstOperations({ operations: values.map((v) => ["insert", v]) }),
    unique,
  );
  assert.deepEqual(dsaAlgorithms.avlInsert({ values }).inorder, unique);
  assert.deepEqual(dsaAlgorithms.redBlackInsert({ values }), unique);
  const heap = dsaAlgorithms.heapInsert({ values });
  heap.forEach((v, i) => {
    if (i) assert.ok(heap[Math.floor((i - 1) / 2)] <= v);
  });
  if (values.length) {
    const left = Math.floor(values.length / 3),
      right = values.length;
    const expected = values.slice(left, right).reduce((a, b) => a + b, 0);
    assert.equal(dsaAlgorithms.segmentTree({ values, left, right }), expected);
    assert.equal(dsaAlgorithms.prefixSum({ values, left, right }), expected);
    assert.equal(
      dsaAlgorithms.fenwick({ values, end: right }),
      values.reduce((a, b) => a + b, 0),
    );
    const updated = values.map((v, i) => (i >= left && i < right ? v + 3 : v));
    assert.deepEqual(
      dsaAlgorithms.lazyRangeAdd({
        values,
        left,
        right,
        delta: 3,
        queryLeft: 0,
        queryRight: values.length,
      }),
      { sum: updated.reduce((a, b) => a + b, 0), total: updated.reduce((a, b) => a + b, 0) },
    );
  }
}

// Structural checks catch balance bugs that a sorted inorder result would miss.
for (const name of ["avlInsert", "redBlackInsert"]) {
  for (const values of [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [9, 8, 7, 6, 5, 4, 3, 2, 1],
    [5, 2, 8, 1, 4, 7, 9, 3, 6],
  ]) {
    const run = runDsaAlgorithm(name, { values });
    for (const frame of run.frames) {
      const children = frame.values.map(() => []);
      for (const [a, b] of frame.edges) children[a].push(b);
      function walk(i, low = -Infinity, high = Infinity) {
        const key = parseInt(frame.values[i]);
        assert.ok(key > low && key < high);
        const left = children[i].find((c) => parseInt(frame.values[c]) < key);
        const right = children[i].find((c) => parseInt(frame.values[c]) > key);
        const a = left === undefined ? (name === "avlInsert" ? 0 : 1) : walk(left, low, key);
        const b = right === undefined ? (name === "avlInsert" ? 0 : 1) : walk(right, key, high);
        if (name === "avlInsert") {
          assert.ok(Math.abs(a - b) <= 1);
          assert.equal(Number(frame.values[i].split("h")[1]), 1 + Math.max(a, b));
          return 1 + Math.max(a, b);
        }
        assert.equal(a, b, "unequal black heights");
        if (frame.values[i].endsWith("R"))
          for (const child of children[i]) assert.ok(frame.values[child].endsWith("B"));
        return a + (frame.values[i].endsWith("B") ? 1 : 0);
      }
      walk(0);
      if (name === "redBlackInsert") assert.ok(frame.values[0].endsWith("B"));
    }
  }
}
const btree = dsaAlgorithms.btreeInsert({ values: [10, 20, 5, 6, 12, 30, 7, 17], degree: 2 });
const depths = new Set(),
  allKeys = [];
function checkBtree(node, depth = 0, low = -Infinity, high = Infinity) {
  assert.ok(node.keys.length >= 1 && node.keys.length <= 3);
  assert.deepEqual(
    node.keys,
    [...node.keys].sort((a, b) => a - b),
  );
  node.keys.forEach((key) => {
    assert.ok(key > low && key < high);
    allKeys.push(key);
  });
  if (!node.children.length) depths.add(depth);
  else {
    assert.equal(node.children.length, node.keys.length + 1);
    node.children.forEach((child, i) =>
      checkBtree(
        child,
        depth + 1,
        i ? node.keys[i - 1] : low,
        i < node.keys.length ? node.keys[i] : high,
      ),
    );
  }
}
checkBtree(btree);
assert.equal(depths.size, 1);
assert.deepEqual(
  allKeys.sort((a, b) => a - b),
  [5, 6, 7, 10, 12, 17, 20, 30],
);
assert.deepEqual(
  dsaAlgorithms.queueOps({
    capacity: 3,
    operations: [
      ["enqueue", 1],
      ["enqueue", 2],
      ["enqueue", 3],
      ["dequeue"],
      ["enqueue", 4],
      ["enqueue", 5],
    ],
  }),
  { values: [2, 3, 4], removed: [1] },
);
assert.equal(dsaAlgorithms.brackets({ text: "([)]" }), false);
assert.equal(dsaAlgorithms.brackets({ text: "{[()]}" }), true);
assert.equal(dsaAlgorithms.postfix({ tokens: ["8", "3", "-", "2", "*"] }), 10);
assert.deepEqual(dsaAlgorithms.nextGreater({ values: [2, 1, 5, 3, 4] }), [5, 5, -1, 4, -1]);
assert.deepEqual(
  dsaAlgorithms.dequeWindow({ values: [1, 3, -1, -3, 5, 3, 6, 7], size: 3 }),
  [3, 3, 5, 5, 6, 7],
);
assert.equal(dsaAlgorithms.topological({ adjacency: [[1], [0]] }), null);
assert.equal(dsaAlgorithms.cycleDetect({ next: [1, 2, 3, 1] }), true);
assert.equal(dsaAlgorithms.cycleDetect({ next: [1, 2, null] }), false);
assert.equal(dsaAlgorithms.cycleDetect({ next: [] }), false);
assert.deepEqual(
  dsaAlgorithms.dijkstra({
    weights: [
      [null, 4, 1, null],
      [null, null, null, 1],
      [null, 2, null, 5],
      [null, null, null, null],
    ],
    start: 0,
  }),
  [0, 3, 1, 4],
);
assert.equal(
  dsaAlgorithms.bellmanFord({
    size: 3,
    edges: [
      [0, 1, 1],
      [1, 2, -2],
      [2, 1, -1],
    ],
    start: 0,
  }).negativeCycle,
  true,
);
assert.equal(dsaAlgorithms.coinChange({ coins: [1, 3, 4], amount: 6 }), 2);
assert.equal(dsaAlgorithms.coinChange({ coins: [2], amount: 3 }), -1);
assert.equal(dsaAlgorithms.knapsack({ weights: [2, 3, 4], profits: [4, 5, 7], capacity: 5 }), 9);
assert.equal(dsaAlgorithms.lcs({ left: "ABC", right: "AC" }), 2);
assert.deepEqual(dsaAlgorithms.queens({ n: 4 }), [
  [1, 3, 0, 2],
  [2, 0, 3, 1],
]);
assert.equal(dsaAlgorithms.subsets({ values: [1, 2, 3] }).length, 8);
assert.equal(dsaAlgorithms.permutations({ values: [1, 2, 3] }).length, 6);
assert.deepEqual(dsaAlgorithms.trieDelete({ words: ["a", "an", "ant"], remove: ["an", "ant"] }), [
  "a",
]);
assert.deepEqual(dsaAlgorithms.bloom({ values: [1, 4], queries: [1, 2, 9], size: 8 }), [
  true,
  false,
  true,
]);

assert.equal(dsaAlgorithms.matrixChain({ dimensions: [10, 30, 5, 60] }), 4500);
assert.equal(dsaAlgorithms.matrixChain({ dimensions: [3, 7] }), 0);
assert.throws(() => dsaAlgorithms.matrixChain({ dimensions: [3, 0] }), RangeError);
const chainReference = (d, i = 0, j = d.length - 2) => {
  if (i === j) return 0;
  return Math.min(
    ...Array.from({ length: j - i }, (_, offset) => {
      const k = i + offset;
      return chainReference(d, i, k) + chainReference(d, k + 1, j) + d[i] * d[k + 1] * d[j + 1];
    }),
  );
};
for (let trial = 0; trial < 30; trial++) {
  const dimensions = Array.from({ length: 2 + (trial % 5) }, () => 1 + Math.floor(random() * 10));
  assert.equal(dsaAlgorithms.matrixChain({ dimensions }), chainReference(dimensions));
  const n = 2 + (trial % 5);
  const capacity = Array.from({ length: n }, (_, u) =>
    Array.from({ length: n }, (_, v) => (u === v ? 0 : Math.floor(random() * 4))),
  );
  const result = dsaAlgorithms.maxFlow({ capacity, source: 0, sink: n - 1 });
  // Independently enumerate every source/sink cut on these small graphs.
  let minCut = Infinity;
  for (let mask = 0; mask < 2 ** n; mask++) {
    if (!(mask & 1) || mask & (1 << (n - 1))) continue;
    let cost = 0;
    for (let u = 0; u < n; u++)
      for (let v = 0; v < n; v++) if (mask & (1 << u) && !(mask & (1 << v))) cost += capacity[u][v];
    minCut = Math.min(minCut, cost);
  }
  assert.equal(result.flow, minCut);
  let certificate = 0;
  for (const u of result.reachable)
    for (let v = 0; v < n; v++) if (!result.reachable.includes(v)) certificate += capacity[u][v];
  assert.equal(certificate, result.flow);
  const adjacency = capacity.map((row) => row.flatMap((c, v) => (c ? [v] : [])));
  const components = dsaAlgorithms.stronglyConnected({ adjacency });
  assert.deepEqual(
    components.flat().sort((a, b) => a - b),
    Array.from({ length: n }, (_, i) => i),
  );
  const reach = capacity.map((row, u) => row.map((c, v) => u === v || c > 0));
  for (let k = 0; k < n; k++)
    for (let u = 0; u < n; u++)
      for (let v = 0; v < n; v++) reach[u][v] ||= reach[u][k] && reach[k][v];
  for (let u = 0; u < n; u++)
    for (let v = 0; v < n; v++)
      assert.equal(
        components.some((c) => c.includes(u) && c.includes(v)),
        reach[u][v] && reach[v][u],
      );
  const edges = adjacency.flatMap((neighbors, u) =>
    neighbors.filter((v) => v > u).map((v) => [u, v]),
  );
  const cover = dsaAlgorithms.vertexCover({ edges });
  assert.ok(edges.every(([u, v]) => cover.includes(u) || cover.includes(v)));
  let optimum = n;
  for (let mask = 0; mask < 2 ** n; mask++) {
    if (edges.every(([u, v]) => mask & (1 << u) || mask & (1 << v)))
      optimum = Math.min(optimum, mask.toString(2).replaceAll("0", "").length);
  }
  assert.ok(cover.length <= 2 * optimum);
}
assert.deepEqual(dsaAlgorithms.stronglyConnected({ adjacency: [] }), []);
assert.deepEqual(dsaAlgorithms.vertexCover({ edges: [] }), []);
assert.deepEqual(
  dsaAlgorithms.maxFlow({
    capacity: [
      [0, 0],
      [0, 0],
    ],
    source: 0,
    sink: 1,
  }),
  { flow: 0, reachable: [0] },
);
assert.throws(() => dsaAlgorithms.maxFlow({ capacity: [[0]], source: 0, sink: 0 }), RangeError);

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const { getModule } = await server.ssrLoadModule("/src/data/catalog.js");
  const { getStructuredCourse } = await server.ssrLoadModule("/src/data/structuredCourses.js");
  assert.deepEqual(
    getModule("dsa").groups.flatMap((g) => g.tracks.map((t) => t.slug)),
    Object.keys(dsaCourses),
  );
  for (const [courseSlug, course] of Object.entries(dsaCourses)) {
    assert.equal(getStructuredCourse("dsa", courseSlug).articles.length, course.articles.length);
    await server.ssrLoadModule(`/src/components/dsa/${courseSlug}/jsx/Course.jsx`);
    for (const article of course.articles) {
      const path = `/src/components/dsa/${courseSlug}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
      const { default: Article } = await server.ssrLoadModule(path);
      const markup = renderToStaticMarkup(createElement(Article));
      for (const id of ["overview", "concepts", "example", "mistakes", "check"])
        assert.ok(markup.includes(`id="${id}"`));
      for (const text of [
        "Step-by-step visual lab",
        "Next step",
        "Previous step",
        "Reveal the worked answer",
        "Time complexity",
        "Implementation",
      ])
        assert.ok(markup.includes(text), `${path}: ${text}`);
      assert.ok(markup.includes('aria-live="polite"'));
      assert.ok(!/Replace this|Add a focused implementation|Explain the terminology/.test(markup));
      const source = await readFile(new URL(`..${path}`, import.meta.url), "utf8");
      assert.ok(source.includes(`lessonSlug="${article.slug}"`));
    }
  }
} finally {
  await server.close();
}
console.log(
  `Validated ${Object.keys(dsaCourses).length} DSA courses, ${examples} independently executable examples, ${frames} visual frames, ${aliases} legacy aliases, rendering, randomized comparisons, and tree invariants.`,
);
