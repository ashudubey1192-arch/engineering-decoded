import { dsaAdvancedPractice } from "./dsaAdvancedPractice.js";
const problem = (id, topic, difficulty, title, prompt, hint, solution, tests, quiz) => ({
  id,
  topic,
  difficulty,
  title,
  prompt,
  hint,
  solution,
  tests,
  quiz,
  starter: "function solve(input) {\n  // Return your answer. Do not print it.\n  \n}",
});
const test = (label, input, expected) => ({ label, input, expected });
const quiz = (question, choices, correct, explanation) => ({
  question,
  choices,
  correct,
  explanation,
});

export const dsaPractice = [
  problem(
    "array-min",
    "arrays",
    "Easy",
    "Find the smallest reading",
    "Given an array of integers, return its minimum, or null for an empty array. Do not sort the array. Target: O(n) time and O(1) extra space.",
    "Initialize from the first element, not zero. After each iteration, your candidate is the minimum of the processed prefix.",
    "function solve(input) {\n  if (!input.length) return null;\n  let best = input[0];\n  for (let i = 1; i < input.length; i++) best = Math.min(best, input[i]);\n  return best;\n}",
    [
      test("Ordinary readings", [8, 3, 6, 2], 2),
      test("Empty", [], null),
      test("Negative values", [-4, -9, -2], -9),
      test("One reading", [7], 7),
    ],
    quiz(
      "Why initialize from the first reading?",
      ["It handles positive and negative inputs", "It sorts the data", "It skips all comparisons"],
      0,
      "Zero is not necessarily an input value or a valid minimum. A real first value establishes the invariant.",
    ),
  ),
  problem(
    "array-ranges",
    "arrays",
    "Medium",
    "Answer repeated range sums",
    "Input is {values, queries}. Each query is a valid half-open interval [left, right). Return an array of sums. Build one prefix array; target O(n + q) time for q queries.",
    "Use n + 1 prefix entries, starting with zero. Subtract prefix[left] from prefix[right].",
    "function solve({values, queries}) {\n  const prefix = [0];\n  for (const value of values) prefix.push(prefix[prefix.length - 1] + value);\n  return queries.map(([left, right]) => prefix[right] - prefix[left]);\n}",
    [
      test(
        "Several ranges",
        {
          values: [2, 4, 1, 3],
          queries: [
            [1, 4],
            [0, 4],
            [2, 2],
          ],
        },
        [8, 10, 0],
      ),
      test("Empty sequence", { values: [], queries: [[0, 0]] }, [0]),
      test(
        "Signed values",
        {
          values: [-2, 5, -1],
          queries: [
            [0, 3],
            [1, 2],
          ],
        },
        [2, 5],
      ),
    ],
    quiz(
      "What is the cost of each query after preprocessing?",
      ["O(n)", "O(1)", "O(log n)"],
      1,
      "Two indexed reads and one subtraction answer each query, regardless of interval length.",
    ),
  ),
  problem(
    "array-subarrays",
    "arrays",
    "Hard",
    "Count subarrays with a target sum",
    "Input is {values, target}. Count nonempty contiguous subarrays with that sum. Values can be negative or zero. Target: expected O(n) time with a map.",
    "If the current prefix sum is s, each earlier prefix equal to s − target starts a matching subarray. Seed the frequency of prefix zero with one.",
    "function solve({values, target}) {\n  const counts = new Map([[0, 1]]);\n  let sum = 0, answer = 0;\n  for (const value of values) {\n    sum += value;\n    answer += counts.get(sum - target) || 0;\n    counts.set(sum, (counts.get(sum) || 0) + 1);\n  }\n  return answer;\n}",
    [
      test("Repeated ones", { values: [1, 1, 1], target: 2 }, 2),
      test("Negative values", { values: [1, -1, 1], target: 1 }, 3),
      test("Zeros", { values: [0, 0, 0], target: 0 }, 6),
      test("Empty", { values: [], target: 0 }, 0),
    ],
    quiz(
      "Why count matching prefixes before inserting the current prefix?",
      [
        "To make the map sorted",
        "To discard negative values",
        "To avoid counting an empty subarray",
      ],
      2,
      "If target is zero, inserting first would count the current prefix paired with itself, which describes an empty subarray.",
    ),
  ),
  problem(
    "list-reverse",
    "linked-lists",
    "Easy",
    "Reverse a linked chain",
    "Input is the head of a singly linked list, represented as {value, next}, or null. Return the new head after reversing its links. Target O(n) time and O(1) extra space.",
    "Keep previous and current pointers. Save current.next before redirecting it.",
    "function solve(input) {\n  let previous = null, current = input;\n  while (current) {\n    const next = current.next;\n    current.next = previous;\n    previous = current;\n    current = next;\n  }\n  return previous;\n}",
    [
      test(
        "Three nodes",
        { value: 1, next: { value: 2, next: { value: 3, next: null } } },
        { value: 3, next: { value: 2, next: { value: 1, next: null } } },
      ),
      test("Empty", null, null),
      test("Single node", { value: 5, next: null }, { value: 5, next: null }),
    ],
    quiz(
      "Which reference must be saved before changing current.next?",
      ["The old next node", "The original tail value", "The list length"],
      0,
      "Saving the old next node keeps the unprocessed suffix reachable after redirecting the current link.",
    ),
  ),
  problem(
    "list-middle",
    "linked-lists",
    "Medium",
    "Find the middle node",
    "Input is a linked-list head ({value, next}) or null. Return the middle node's value, or null when empty. For even length return the second middle. Target O(n) time, O(1) extra space, one pass.",
    "Move slow one step and fast two steps. Continue only while fast and fast.next exist.",
    "function solve(input) {\n  let slow = input, fast = input;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow ? slow.value : null;\n}",
    [
      test("Odd length", { value: 1, next: { value: 2, next: { value: 3, next: null } } }, 2),
      test("Even length", { value: 1, next: { value: 2, next: null } }, 2),
      test("Empty", null, null),
      test("Single", { value: 8, next: null }, 8),
    ],
    quiz(
      "After k loop iterations, how far has slow moved?",
      ["2k nodes", "k nodes", "k / 2 nodes"],
      1,
      "Slow advances once per iteration; fast advances twice, placing slow in the middle when fast reaches the end.",
    ),
  ),
  problem(
    "list-merge",
    "linked-lists",
    "Hard",
    "Merge two sorted linked lists",
    "Input is {left, right}, two disjoint, acyclic list heads sorted in nondecreasing order. Return a merged sorted list by relinking nodes. Prefer the left node on ties. Target O(n + m) time and O(1) auxiliary space.",
    "Use a dummy head and a tail. Append the smaller current node, then attach the remaining suffix when one list ends.",
    "function solve({left, right}) {\n  const dummy = {next: null};\n  let tail = dummy;\n  while (left && right) {\n    if (left.value <= right.value) { tail.next = left; left = left.next; }\n    else { tail.next = right; right = right.next; }\n    tail = tail.next;\n  }\n  tail.next = left || right;\n  return dummy.next;\n}",
    [
      test(
        "Interleaved",
        {
          left: { value: 1, next: { value: 4, next: null } },
          right: { value: 2, next: { value: 3, next: null } },
        },
        { value: 1, next: { value: 2, next: { value: 3, next: { value: 4, next: null } } } },
      ),
      test("Both empty", { left: null, right: null }, null),
      test(
        "Duplicates",
        { left: { value: 2, next: null }, right: { value: 2, next: null } },
        { value: 2, next: { value: 2, next: null } },
      ),
    ],
    quiz(
      "What should happen when one list becomes empty?",
      [
        "Sort the other list again",
        "Discard the remaining nodes",
        "Attach the remaining sorted suffix",
      ],
      2,
      "The remaining suffix is already sorted, and its head is no smaller than the last selected node.",
    ),
  ),
  problem(
    "search-exact",
    "binary-search",
    "Easy",
    "Find a target in sorted data",
    "Input is {values, target}, with values sorted in increasing order and no duplicates. Return the target index or -1. Target O(log n) time and O(1) extra space.",
    "Choose one interval convention. For inclusive endpoints, update low to mid + 1 or high to mid − 1.",
    "function solve({values, target}) {\n  let low = 0, high = values.length - 1;\n  while (low <= high) {\n    const mid = low + Math.floor((high - low) / 2);\n    if (values[mid] === target) return mid;\n    if (values[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}",
    [
      test("Present", { values: [1, 4, 8, 10], target: 8 }, 2),
      test("Missing", { values: [1, 4, 8], target: 5 }, -1),
      test("Empty", { values: [], target: 2 }, -1),
      test("First value", { values: [1, 4], target: 1 }, 0),
    ],
    quiz(
      "Which input property justifies discarding half the range?",
      ["Sorted order", "An even length", "Distinct memory addresses"],
      0,
      "Ordering lets a comparison rule out every value on one side of the midpoint.",
    ),
  ),
  problem(
    "search-lower",
    "binary-search",
    "Medium",
    "Locate the first qualifying index",
    "Input is {values, target}, with values sorted in nondecreasing order. Return the first index with value ≥ target, or values.length if none exists. Target O(log n) time.",
    "Use [low, high). A qualifying midpoint remains a candidate, so set high = mid rather than returning.",
    "function solve({values, target}) {\n  let low = 0, high = values.length;\n  while (low < high) {\n    const mid = low + Math.floor((high - low) / 2);\n    if (values[mid] < target) low = mid + 1;\n    else high = mid;\n  }\n  return low;\n}",
    [
      test("Duplicates", { values: [1, 4, 4, 4, 9], target: 4 }, 1),
      test("Insertion point", { values: [1, 4, 9], target: 5 }, 2),
      test("Beyond end", { values: [1, 4], target: 10 }, 2),
      test("Empty", { values: [], target: 0 }, 0),
    ],
    quiz(
      "What does a result equal to values.length mean?",
      ["The last element matches", "No value is at least the target", "The input was not sorted"],
      1,
      "The insertion position can be past the final element. Do not dereference it without a bounds check.",
    ),
  ),
  problem(
    "search-capacity",
    "binary-search",
    "Hard",
    "Find minimum shipping capacity",
    "Input is {weights, days}. Weights are positive integers in fixed shipping order, and days is a positive integer. Return the smallest capacity that ships all items in at most days days. Empty weights require capacity 0.",
    "Search from the largest item to the total weight. A greedy daily packing scan is feasible for capacity C; feasibility stays true for larger capacities.",
    "function solve({weights, days}) {\n  if (!weights.length) return 0;\n  let low = Math.max(...weights), high = weights.reduce((a,b) => a+b, 0);\n  while (low < high) {\n    const mid = low + Math.floor((high-low)/2);\n    let used = 1, load = 0;\n    for (const w of weights) {\n      if (load + w > mid) { used++; load = 0; }\n      load += w;\n    }\n    if (used <= days) high = mid; else low = mid + 1;\n  }\n  return low;\n}",
    [
      test("Two days", { weights: [1, 2, 3, 4, 5], days: 2 }, 9),
      test("One day", { weights: [3, 2, 4], days: 1 }, 9),
      test("Spare days", { weights: [3, 2, 4], days: 5 }, 4),
      test("Empty", { weights: [], days: 1 }, 0),
    ],
    quiz(
      "Why can capacity never be below the largest item?",
      [
        "The weights must be sorted",
        "Every day needs an item",
        "An item cannot be split across days",
      ],
      2,
      "Each item must fit into one day's capacity. The largest item is a necessary lower bound.",
    ),
  ),
  problem(
    "sort-insertion",
    "sorting-algorithms",
    "Easy",
    "Implement insertion sort",
    "Return a sorted copy of an integer array using insertion sort. Keep a sorted prefix and insert each new value into it. Target O(n²) worst-case time.",
    "Save the key before shifting strictly larger prefix values right. Write the key into the resulting gap.",
    "function solve(input) {\n  const a = [...input];\n  for (let i = 1; i < a.length; i++) {\n    const key = a[i];\n    let j = i - 1;\n    while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }\n    a[j + 1] = key;\n  }\n  return a;\n}",
    [
      test("Mixed", [4, 1, 3, 2], [1, 2, 3, 4]),
      test("Empty", [], []),
      test("Duplicates", [2, 1, 2], [1, 2, 2]),
      test("Negatives", [-1, -3, 0], [-3, -1, 0]),
    ],
    quiz(
      "Which region is sorted before iteration i?",
      ["Indices [0, i)", "The whole array", "Indices after i"],
      0,
      "Insertion extends the already sorted prefix by one value on every iteration.",
    ),
  ),
  problem(
    "sort-stable",
    "sorting-algorithms",
    "Medium",
    "Keep equal records in order",
    "Input is an array of {key, id} records. Return a stable sorted copy by numeric key. Implement merging or insertion yourself; retain the order of equal-key records.",
    "When merging equal keys, take the left record first. Single-record arrays are the base case.",
    "function solve(input) {\n  if (input.length < 2) return input.slice();\n  const mid = Math.floor(input.length / 2);\n  const left = solve(input.slice(0, mid)), right = solve(input.slice(mid));\n  const out = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    out.push(left[i].key <= right[j].key ? left[i++] : right[j++]);\n  }\n  return out.concat(left.slice(i), right.slice(j));\n}",
    [
      test(
        "Tagged ties",
        [
          { key: 3, id: "a" },
          { key: 1, id: "x" },
          { key: 3, id: "b" },
        ],
        [
          { key: 1, id: "x" },
          { key: 3, id: "a" },
          { key: 3, id: "b" },
        ],
      ),
      test("Empty", [], []),
      test(
        "All equal",
        [
          { key: 2, id: "a" },
          { key: 2, id: "b" },
        ],
        [
          { key: 2, id: "a" },
          { key: 2, id: "b" },
        ],
      ),
    ],
    quiz(
      "What does stability preserve?",
      [
        "Original order of all records",
        "Relative order of equal-key records",
        "Original array length only",
      ],
      1,
      "Sorted records may move, but equal-key records retain their relative input order.",
    ),
  ),
  problem(
    "sort-inversions",
    "sorting-algorithms",
    "Hard",
    "Count out-of-order pairs",
    "Return the number of pairs i < j for which input[i] > input[j]. Equal values are not inversions. Target O(n log n) using a merge-sort strategy.",
    "When a right-side value is smaller than the current left-side value, it forms an inversion with every remaining value in the sorted left half.",
    "function solve(input) {\n  let count = 0;\n  function sort(a) {\n    if (a.length < 2) return a;\n    const mid = Math.floor(a.length/2);\n    const l = sort(a.slice(0,mid)), r = sort(a.slice(mid));\n    const out = [];\n    let i = 0, j = 0;\n    while (i < l.length && j < r.length) {\n      if (l[i] <= r[j]) out.push(l[i++]);\n      else { count += l.length-i; out.push(r[j++]); }\n    }\n    return out.concat(l.slice(i),r.slice(j));\n  }\n  sort(input.slice());\n  return count;\n}",
    [
      test("Mixed order", [2, 4, 1, 3, 5], 3),
      test("Reverse sorted", [4, 3, 2, 1], 6),
      test("Equal values", [2, 2, 2], 0),
      test("Empty", [], 0),
    ],
    quiz(
      "Why add the number of remaining left elements during a cross inversion?",
      [
        "Every pair is an inversion",
        "The right half is always smaller",
        "The sorted left suffix is entirely larger than the chosen right value",
      ],
      2,
      "The current left value and every later left value exceed that right value, so all those pairs are inversions.",
    ),
  ),
];

export function practiceTopic(courseSlug, lessonSlug = "") {
  return courseSlug === "dsa-foundations"
    ? [...new Set(dsaPractice.map((item) => item.topic))].find((topic) =>
        lessonSlug.startsWith(`${topic}-`),
      ) || "arrays"
    : courseSlug;
}
dsaPractice.push(...dsaAdvancedPractice);
export const dsaPracticeTopics = [...new Set(dsaPractice.map((item) => item.topic))];
