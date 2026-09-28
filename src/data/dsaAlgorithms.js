import { dsaAdvancedAlgorithms } from "./dsaAdvancedAlgorithms.js";
import { dsaFoundationAlgorithms } from "./dsaFoundationAlgorithms.js";
// Pure teaching implementations. The optional emit callback records real algorithm
// states; examples remain executable without the visualizer.
function linearSearch({ values, target }, emit = () => {}) {
  for (let i = 0; i < values.length; i++) {
    emit({ values, active: [i], note: `Compare index ${i}: ${values[i]} with ${target}.` });
    if (values[i] === target) return i;
  }
  return -1;
}

function insertArray({ values, index, value }, emit = () => {}) {
  if (index < 0 || index > values.length) throw new RangeError("Invalid insertion index");
  const a = [...values];
  a.push(null);
  emit({ values: a, active: [index], note: "Reserve one new slot before shifting." });
  for (let i = a.length - 1; i > index; i--) {
    a[i] = a[i - 1];
    emit({
      values: a,
      active: [i - 1, i],
      note: `Copy slot ${i - 1} to ${i}; move right to left.`,
    });
  }
  a[index] = value;
  emit({ values: a, active: [index], note: `Place ${value} in the opening.` });
  return a;
}

function prefixSum({ values, left, right }, emit = () => {}) {
  const prefix = [0];
  for (let i = 0; i < values.length; i++) {
    prefix.push(prefix[i] + values[i]);
    emit({
      values,
      active: [i],
      auxiliary: prefix,
      note: `prefix[${i + 1}] = ${prefix[i]} + ${values[i]}.`,
    });
  }
  const result = prefix[right] - prefix[left];
  emit({
    values: prefix,
    active: [left, right],
    note: `Sum of [${left}, ${right}) = ${prefix[right]} − ${prefix[left]} = ${result}.`,
  });
  return result;
}

function twoPointers({ values, target }, emit = () => {}) {
  let left = 0,
    right = values.length - 1;
  while (left < right) {
    const sum = values[left] + values[right];
    emit({ values, active: [left, right], note: `left=${left}, right=${right}; sum=${sum}.` });
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}

function windowSum({ values, size }, emit = () => {}) {
  if (size < 1 || size > values.length) return null;
  let sum = 0,
    best = -Infinity;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= size) sum -= values[i - size];
    if (i >= size - 1) best = Math.max(best, sum);
    emit({
      values,
      active: Array.from(
        { length: Math.min(i + 1, size) },
        (_, j) => Math.max(0, i - size + 1) + j,
      ),
      note: `Window ends at ${i}; running sum=${sum}; best complete window=${best === -Infinity ? "not ready" : best}.`,
    });
  }
  return best;
}

function reverseList({ values }, emit = () => {}) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) head = { value: values[i], next: head };
  const list = (node) => {
    const a = [];
    while (node) {
      a.push(node.value);
      node = node.next;
    }
    return a;
  };
  let previous = null,
    current = head;
  while (current) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
    emit({
      kind: "linked",
      values: list(previous),
      auxiliary: list(current),
      note: "Save next, redirect current.next, then advance previous and current. Top: reversed prefix; bottom: untouched suffix.",
    });
  }
  return list(previous);
}

function listInsert({ values, index, value }, emit = () => {}) {
  if (index < 0 || index > values.length) throw new RangeError("Invalid insertion index");
  const dummy = { next: null };
  let tail = dummy;
  for (const value of values) {
    tail.next = { value, next: null };
    tail = tail.next;
  }
  let previous = dummy;
  for (let i = 0; i < index; i++) {
    previous = previous.next;
    emit({
      kind: "linked",
      values,
      active: [i],
      note: `Traverse to predecessor: ${i + 1} link(s) followed.`,
    });
  }
  previous.next = { value, next: previous.next };
  const result = [];
  for (let n = dummy.next; n; n = n.next) result.push(n.value);
  emit({
    kind: "linked",
    values: result,
    active: [index],
    note: "new.next receives the old successor; predecessor.next receives new.",
  });
  return result;
}

function cycleDetect({ next }, emit = () => {}) {
  let slow = next.length ? 0 : null,
    fast = slow;
  while (fast !== null && next[fast] !== null) {
    slow = next[slow];
    fast = next[next[fast]];
    emit({
      kind: "graph",
      values: next.map((_, i) => i),
      edges: next.flatMap((to, from) => (to === null ? [] : [[from, to]])),
      active: [slow, fast],
      note: `Slow at ${slow}, fast at ${fast}. Equality after moving detects a cycle.`,
    });
    if (slow === fast) return true;
  }
  return false;
}

function stackOps({ operations }, emit = () => {}) {
  const stack = [],
    removed = [];
  for (const [op, value] of operations) {
    if (op === "push") stack.push(value);
    else removed.push(stack.length ? stack.pop() : null);
    emit({
      kind: "stack",
      values: stack,
      active: [stack.length - 1],
      auxiliary: removed,
      note: `${op}${op === "push" ? ` ${value}` : ""}; top is the last element. null means an empty pop.`,
    });
  }
  return { stack, removed };
}

function brackets({ text }, emit = () => {}) {
  const stack = [],
    pairs = { ")": "(", "]": "[", "}": "{" };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ("([{ ".trim().includes(c)) stack.push(c);
    else if (Object.hasOwn(pairs, c) && stack.pop() !== pairs[c]) {
      emit({
        values: [...text],
        active: [i],
        auxiliary: stack,
        note: "Closing bracket does not match the most recent opener.",
      });
      return false;
    }
    emit({
      values: [...text],
      active: [i],
      auxiliary: stack,
      note: `Process ${c}; stack contains unmatched opening brackets.`,
    });
  }
  return stack.length === 0;
}

function postfix({ tokens }, emit = () => {}) {
  const stack = [];
  for (const token of tokens) {
    if (!["+", "-", "*", "/"].includes(token)) stack.push(Number(token));
    else {
      if (stack.length < 2) throw new Error("Missing operand");
      const right = stack.pop(),
        left = stack.pop();
      stack.push(
        token === "+"
          ? left + right
          : token === "-"
            ? left - right
            : token === "*"
              ? left * right
              : left / right,
      );
    }
    emit({
      kind: "stack",
      values: stack,
      note: `Process token ${token}; pop right operand before left operand.`,
    });
  }
  if (stack.length !== 1) throw new Error("Malformed postfix expression");
  return stack[0];
}

function nextGreater({ values }, emit = () => {}) {
  const stack = [],
    result = Array(values.length).fill(-1);
  for (let i = 0; i < values.length; i++) {
    while (stack.length && values[stack.at(-1)] < values[i]) result[stack.pop()] = values[i];
    stack.push(i);
    emit({
      values,
      active: [...stack],
      auxiliary: result,
      note: `At ${i}: stack holds unresolved indices with nonincreasing values.`,
    });
  }
  return result;
}

function queueOps({ operations, capacity }, emit = () => {}) {
  const slots = Array(capacity).fill(null),
    removed = [];
  let head = 0,
    size = 0;
  for (const [op, value] of operations) {
    let note;
    if (op === "enqueue") {
      if (size === capacity) note = "Full: insertion rejected; unread data is preserved.";
      else {
        const tail = (head + size) % capacity;
        slots[tail] = value;
        size++;
        note = `Write ${value} at slot ${tail}.`;
      }
    } else if (size === 0) {
      removed.push(null);
      note = "Empty: return null.";
    } else {
      removed.push(slots[head]);
      slots[head] = null;
      head = (head + 1) % capacity;
      size--;
      note = "Remove oldest item and advance head modulo capacity.";
    }
    emit({
      values: slots,
      active: [head],
      auxiliary: removed,
      note: `${note} head=${head}, size=${size}, next write=${(head + size) % capacity}.`,
    });
  }
  return { values: Array.from({ length: size }, (_, i) => slots[(head + i) % capacity]), removed };
}

function dequeWindow({ values, size }, emit = () => {}) {
  const deque = [],
    result = [];
  for (let i = 0; i < values.length; i++) {
    while (deque.length && deque[0] <= i - size) deque.shift();
    while (deque.length && values[deque.at(-1)] <= values[i]) deque.pop();
    deque.push(i);
    if (i >= size - 1) result.push(values[deque[0]]);
    emit({
      values,
      active: [...deque],
      auxiliary: result,
      note: `At ${i}: candidate indices in decreasing value order; front is the maximum.`,
    });
  }
  return result;
}

function hashChain({ values, capacity }, emit = () => {}) {
  const buckets = Array.from({ length: capacity }, () => []);
  for (const value of values) {
    const slot = ((value % capacity) + capacity) % capacity;
    if (!buckets[slot].includes(value)) buckets[slot].push(value);
    emit({
      kind: "buckets",
      values: buckets.map((b) => b.join(" → ") || "∅"),
      active: [slot],
      note: `${value} hashes to ${slot}; compare full keys within its chain.`,
    });
  }
  return buckets;
}

function hashProbe({ values, capacity }, emit = () => {}) {
  const table = Array(capacity).fill(null);
  for (const value of values) {
    let slot = ((value % capacity) + capacity) % capacity,
      probes = 0;
    while (table[slot] !== null && table[slot] !== value && probes < capacity) {
      emit({ values: table, active: [slot], note: `Collision for ${value}; try the next slot.` });
      slot = (slot + 1) % capacity;
      probes++;
    }
    if (probes === capacity) throw new Error("Hash table is full");
    table[slot] = value;
    emit({ values: table, active: [slot], note: `Store ${value} at slot ${slot}.` });
  }
  return table;
}

function frequencies({ values }, emit = () => {}) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
    emit({
      kind: "buckets",
      values: [...counts].map(([k, v]) => `${k}: ${v}`),
      note: `Count one occurrence of ${value}; preserve multiplicity rather than only membership.`,
    });
  }
  return [...counts];
}

function binarySearch({ values, target, lowerBound = false }, emit = () => {}) {
  let lo = 0,
    hi = values.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    emit({
      values,
      active: [mid],
      range: [lo, hi],
      note: `Candidate interval [${lo}, ${hi}); mid=${mid}, value=${values[mid]}.`,
    });
    if (values[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  emit({
    values,
    active: lo < values.length ? [lo] : [],
    range: [lo, lo],
    note: `Insertion boundary is ${lo}; verify equality for exact search.`,
  });
  return lowerBound ? lo : values[lo] === target ? lo : -1;
}

function bubbleSort({ values }, emit = () => {}) {
  const a = [...values];
  for (let end = a.length - 1; end > 0; end--) {
    let changed = false;
    for (let i = 0; i < end; i++) {
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        changed = true;
      }
      emit({
        values: a,
        active: [i, i + 1],
        note: `Compare adjacent positions; after the pass, position ${end} is final.`,
      });
    }
    if (!changed) break;
  }
  return a;
}

function insertionSort({ values }, emit = () => {}) {
  const a = [...values];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      emit({
        values: a,
        active: [j, j + 1],
        auxiliary: [key],
        note: `Keep key=${key} aside and shift the larger value right.`,
      });
      j--;
    }
    a[j + 1] = key;
    emit({ values: a, active: [j + 1], note: `Insert key; prefix [0, ${i + 1}) is sorted.` });
  }
  return a;
}

function selectionSort({ values }, emit = () => {}) {
  const a = [...values];
  for (let i = 0; i < a.length; i++) {
    let smallest = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[smallest]) smallest = j;
      emit({
        values: a,
        active: [j, smallest],
        note: `Find the smallest remaining value for position ${i}.`,
      });
    }
    [a[i], a[smallest]] = [a[smallest], a[i]];
    emit({ values: a, active: [i], note: `Position ${i} is now final.` });
  }
  return a;
}

function mergeSort({ values }, emit = () => {}) {
  function sort(a) {
    if (a.length < 2) return a;
    const mid = Math.floor(a.length / 2);
    emit({ values: a, active: [mid], note: `Split into lengths ${mid} and ${a.length - mid}.` });
    const left = sort(a.slice(0, mid)),
      right = sort(a.slice(mid)),
      merged = [];
    let i = 0,
      j = 0;
    while (i < left.length || j < right.length) {
      if (j === right.length || (i < left.length && left[i] <= right[j])) merged.push(left[i++]);
      else merged.push(right[j++]);
      emit({
        values: merged,
        auxiliary: [...left.slice(i), ...right.slice(j)],
        note: "Take the smaller front value; ties come from the left, preserving stability.",
      });
    }
    return merged;
  }
  return sort([...values]);
}

function quickSort({ values }, emit = () => {}) {
  const a = [...values];
  function sort(lo, hi) {
    if (lo >= hi) return;
    const pivot = a[hi];
    let boundary = lo;
    for (let i = lo; i < hi; i++) {
      if (a[i] < pivot) {
        [a[i], a[boundary]] = [a[boundary], a[i]];
        boundary++;
      }
      emit({
        values: a,
        active: [i, hi],
        range: [lo, hi + 1],
        note: `Pivot=${pivot}; values before ${boundary} are smaller than it.`,
      });
    }
    [a[boundary], a[hi]] = [a[hi], a[boundary]];
    emit({
      values: a,
      active: [boundary],
      note: "Pivot reaches its final position; recurse on the two sides.",
    });
    sort(lo, boundary - 1);
    sort(boundary + 1, hi);
  }
  sort(0, a.length - 1);
  return a;
}

function countingSort({ values }, emit = () => {}) {
  if (!values.length) return [];
  const count = Array(Math.max(...values) + 1).fill(0);
  for (const value of values) {
    if (!Number.isInteger(value) || value < 0) throw new Error("Use nonnegative integers");
    count[value]++;
    emit({
      values: count,
      active: [value],
      note: `Increment frequency of key ${value}. Slot index is the key.`,
    });
  }
  const result = [];
  count.forEach((n, value) => {
    for (let i = 0; i < n; i++) result.push(value);
  });
  emit({ values: result, note: "Expand frequencies in increasing key order." });
  return result;
}

function heapSort({ values }, emit = () => {}) {
  const a = [...values];
  function sift(root, size) {
    while (2 * root + 1 < size) {
      let child = 2 * root + 1;
      if (child + 1 < size && a[child + 1] > a[child]) child++;
      if (a[root] >= a[child]) break;
      [a[root], a[child]] = [a[child], a[root]];
      emit({
        kind: "tree",
        values: a.slice(0, size),
        active: [root, child],
        auxiliary: a.slice(size),
        note: `Sift down within heap size ${size}; larger child moves up. Bottom row is the finalized sorted suffix.`,
      });
      root = child;
    }
  }
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);
  emit({ kind: "tree", values: a, note: "Bottom-up construction gives a max-heap." });
  for (let end = a.length - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    emit({ values: a, active: [end], note: `Maximum goes to sorted suffix at ${end}.` });
    sift(0, end);
  }
  return a;
}

function heapInsert({ values }, emit = () => {}) {
  const heap = [];
  for (const value of values) {
    heap.push(value);
    let i = heap.length - 1;
    emit({
      kind: "tree",
      values: heap,
      active: [i],
      note: `Append ${value} at the next complete-tree position.`,
    });
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
      emit({
        kind: "tree",
        values: heap,
        active: [i],
        note: "Swap upward until the min-heap order is restored.",
      });
    }
  }
  return heap;
}

function treeTraversal({ values, order = "inorder" }, emit = () => {}) {
  const result = [];
  function visit(i) {
    if (i >= values.length || values[i] === null) return;
    const take = () => {
      result.push(values[i]);
      emit({
        kind: "tree",
        values,
        active: [i],
        auxiliary: result,
        note: `${order}: visit ${values[i]}.`,
      });
    };
    if (order === "preorder") take();
    visit(2 * i + 1);
    if (order === "inorder") take();
    visit(2 * i + 2);
    if (order === "postorder") take();
  }
  visit(0);
  return result;
}

function bstSearch({ values, target }, emit = () => {}) {
  let i = 0;
  while (i < values.length && values[i] !== null) {
    emit({
      kind: "tree",
      values,
      active: [i],
      note: `Compare ${target} with node ${values[i]}; discard one entire subtree.`,
    });
    if (values[i] === target) return true;
    i = target < values[i] ? 2 * i + 1 : 2 * i + 2;
  }
  return false;
}

function bfs({ adjacency, start }, emit = () => {}) {
  const queue = [start],
    seen = new Set([start]),
    result = [];
  const edges = adjacency.flatMap((neighbors, from) => neighbors.map((to) => [from, to]));
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    result.push(u);
    for (const v of adjacency[u])
      if (!seen.has(v)) {
        seen.add(v);
        queue.push(v);
      }
    emit({
      kind: "graph",
      values: adjacency.map((_, i) => i),
      edges,
      active: [u],
      visited: [...seen],
      auxiliary: queue.slice(head + 1),
      note: `Visit ${u}; enqueue previously unseen neighbors. Bottom row is the pending queue.`,
    });
  }
  return result;
}

function dfs({ adjacency, start }, emit = () => {}) {
  const seen = new Set(),
    result = [],
    stack = [];
  const edges = adjacency.flatMap((neighbors, from) => neighbors.map((to) => [from, to]));
  function visit(u) {
    seen.add(u);
    stack.push(u);
    result.push(u);
    emit({
      kind: "graph",
      values: adjacency.map((_, i) => i),
      edges,
      active: [u],
      visited: [...seen],
      auxiliary: stack,
      note: `Enter ${u}; follow one branch before returning. Bottom row is the call stack.`,
    });
    for (const v of adjacency[u]) if (!seen.has(v)) visit(v);
    stack.pop();
  }
  visit(start);
  return result;
}

function topological({ adjacency }, emit = () => {}) {
  const degree = Array(adjacency.length).fill(0),
    queue = [],
    result = [];
  for (const neighbors of adjacency) for (const v of neighbors) degree[v]++;
  degree.forEach((d, i) => {
    if (d === 0) queue.push(i);
  });
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    result.push(u);
    for (const v of adjacency[u]) if (--degree[v] === 0) queue.push(v);
    emit({
      kind: "graph",
      values: degree.map((d, i) => `${i}:${d}`),
      edges: adjacency.flatMap((ns, u) => ns.map((v) => [u, v])),
      active: [u],
      auxiliary: result,
      note: `Remove ${u}; decrement indegrees of its successors.`,
    });
  }
  return result.length === adjacency.length ? result : null;
}

function dijkstra({ weights, start }, emit = () => {}) {
  const n = weights.length,
    distance = Array(n).fill(Infinity),
    used = Array(n).fill(false);
  distance[start] = 0;
  for (let pass = 0; pass < n; pass++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!used[i] && (u === -1 || distance[i] < distance[u])) u = i;
    if (u === -1 || distance[u] === Infinity) break;
    used[u] = true;
    for (let v = 0; v < n; v++)
      if (weights[u][v] !== null) {
        if (weights[u][v] < 0) throw new Error("Dijkstra requires nonnegative weights");
        distance[v] = Math.min(distance[v], distance[u] + weights[u][v]);
      }
    emit({
      kind: "graph",
      values: distance.map((d, i) => `${i}:${d === Infinity ? "∞" : d}`),
      edges: weights.flatMap((row, from) =>
        row.flatMap((w, to) => (w === null ? [] : [[from, to, w]])),
      ),
      active: [u],
      visited: used.flatMap((v, i) => (v ? [i] : [])),
      note: `Settle ${u} with distance ${distance[u]}, then relax its outgoing edges.`,
    });
  }
  return distance.map((d) => (d === Infinity ? null : d));
}

function unionFind({ size, pairs }, emit = () => {}) {
  const parent = Array.from({ length: size }, (_, i) => i),
    rank = Array(size).fill(0);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  for (const [a, b] of pairs) {
    let ra = find(a),
      rb = find(b);
    if (ra !== rb) {
      if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
      parent[rb] = ra;
      if (rank[ra] === rank[rb]) rank[ra]++;
    }
    emit({
      kind: "graph",
      values: parent.map((_, i) => i),
      edges: parent.flatMap((p, i) => (p === i ? [] : [[i, p]])),
      active: [a, b],
      auxiliary: parent,
      note: `Union(${a}, ${b}); roots decide connectivity. Parent pointers form a forest.`,
    });
  }
  return parent.map((_, i) => find(i));
}

function kruskal({ size, edges }, emit = () => {}) {
  const parent = Array.from({ length: size }, (_, i) => i),
    accepted = [];
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let total = 0;
  for (const [u, v, weight] of [...edges].sort((a, b) => a[2] - b[2])) {
    const a = find(u),
      b = find(v),
      take = a !== b;
    if (take) {
      parent[a] = b;
      accepted.push([u, v, weight]);
      total += weight;
    }
    emit({
      kind: "graph",
      undirected: true,
      values: parent.map((_, i) => i),
      edges: accepted,
      active: [u, v],
      note: `${take ? "Accept" : "Reject cycle edge"} ${u}—${v}, weight ${weight}; total=${total}.`,
    });
  }
  return { edges: accepted, total };
}

function trie({ words, prefix }, emit = () => {}) {
  const root = { children: {}, end: false };
  for (const word of words) {
    let node = root;
    for (const c of word) {
      node.children[c] ||= { children: {}, end: false };
      node = node.children[c];
    }
    node.end = true;
    const labels = ["root"],
      edges = [];
    function draw(n, id) {
      for (const [c, child] of Object.entries(n.children)) {
        const next = labels.length;
        labels.push(c + (child.end ? "*" : ""));
        edges.push([id, next]);
        draw(child, next);
      }
    }
    draw(root, 0);
    emit({
      kind: "hierarchy",
      values: labels,
      edges,
      note: `Insert ${word}; shared prefixes reuse nodes. * marks the end of a stored word.`,
    });
  }
  let node = root;
  for (const c of prefix) {
    node = node.children[c];
    if (!node) return [];
  }
  const result = [];
  function collect(n, word) {
    if (n.end) result.push(word);
    for (const [c, child] of Object.entries(n.children)) collect(child, word + c);
  }
  collect(node, prefix);
  return result;
}

function factorial({ n }, emit = () => {}) {
  const stack = [];
  function solve(k) {
    stack.push(k);
    emit({
      kind: "stack",
      values: stack,
      note: `Enter factorial(${k}); each call keeps its own pending multiplication.`,
    });
    const result = k <= 1 ? 1 : k * solve(k - 1);
    stack.pop();
    emit({
      kind: "stack",
      values: stack,
      auxiliary: [result],
      note: `Return ${result} from factorial(${k}).`,
    });
    return result;
  }
  return solve(n);
}

function hanoi({ n }, emit = () => {}) {
  const pegs = [Array.from({ length: n }, (_, i) => n - i), [], []],
    moves = [];
  function move(count, from, to, spare) {
    if (!count) return;
    move(count - 1, from, spare, to);
    const disk = pegs[from].pop();
    pegs[to].push(disk);
    moves.push([from, to]);
    emit({
      kind: "buckets",
      values: pegs.map((p) => p.join(" · ") || "∅"),
      active: [from, to],
      note: `Move disk ${disk} from peg ${from} to ${to}. Each peg is bottom → top.`,
    });
    move(count - 1, spare, to, from);
  }
  move(n, 0, 2, 1);
  return moves;
}

function fibonacci({ n }, emit = () => {}) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    emit({
      values: dp,
      active: [i - 2, i - 1, i],
      note: `F(${i}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
    });
  }
  return dp[n];
}

function coinChange({ coins, amount }, emit = () => {}) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let value = 1; value <= amount; value++) {
    for (const coin of coins)
      if (coin <= value) dp[value] = Math.min(dp[value], 1 + dp[value - coin]);
    emit({
      values: dp.map((x) => (x === Infinity ? "∞" : x)),
      active: [value],
      note: `Minimum coins for ${value}: try every possible last coin.`,
    });
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

function knapsack({ weights, profits, capacity }, emit = () => {}) {
  const dp = Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let cap = capacity; cap >= weights[i]; cap--) {
      dp[cap] = Math.max(dp[cap], profits[i] + dp[cap - weights[i]]);
      emit({
        values: dp,
        active: [cap, cap - weights[i]],
        note: `Item ${i}, weight=${weights[i]}, profit=${profits[i]}; capacities decrease so each item is used at most once.`,
      });
    }
  }
  return dp[capacity];
}

function lcs({ left, right }, emit = () => {}) {
  const dp = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 1; i <= left.length; i++)
    for (let j = 1; j <= right.length; j++) {
      dp[i][j] =
        left[i - 1] === right[j - 1] ? 1 + dp[i - 1][j - 1] : Math.max(dp[i - 1][j], dp[i][j - 1]);
      emit({
        kind: "matrix",
        matrix: dp,
        activeCell: [i, j],
        note: `Compare ${left[i - 1]} and ${right[j - 1]}; dp[${i}][${j}] is the LCS length for these prefixes.`,
      });
    }
  return dp[left.length][right.length];
}

function intervals({ intervals }, emit = () => {}) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]),
    selected = [];
  let end = -Infinity;
  for (const item of sorted) {
    const take = item[0] >= end;
    if (take) {
      selected.push(item);
      end = item[1];
    }
    emit({
      values: sorted.map(([a, b]) => `[${a},${b})`),
      active: [sorted.indexOf(item)],
      auxiliary: selected.map(([a, b]) => `[${a},${b})`),
      note: `${take ? "Accept" : "Reject overlap"} [${item}); earliest finishing compatible interval preserves future room.`,
    });
  }
  return selected;
}

function fractional({ items, capacity }, emit = () => {}) {
  let remaining = capacity,
    total = 0;
  const sorted = [...items].sort((a, b) => b.value / b.weight - a.value / a.weight);
  for (const [i, item] of sorted.entries()) {
    const fraction = Math.min(1, remaining / item.weight);
    total += item.value * fraction;
    remaining -= item.weight * fraction;
    emit({
      values: sorted.map((x) => `${x.value}/${x.weight}`),
      active: [i],
      auxiliary: [total, remaining],
      note: `Take fraction ${fraction} at value/weight=${item.value / item.weight}. Bottom: total value, remaining capacity.`,
    });
    if (!remaining) break;
  }
  return total;
}

function subsets({ values }, emit = () => {}) {
  const path = [],
    result = [];
  function visit(i) {
    if (i === values.length) {
      result.push([...path]);
      emit({ values, active: [], auxiliary: path, note: `Leaf: save subset [${path}].` });
      return;
    }
    emit({ values, active: [i], auxiliary: path, note: `Exclude ${values[i]} first.` });
    visit(i + 1);
    path.push(values[i]);
    emit({
      values,
      active: [i],
      auxiliary: path,
      note: `Include ${values[i]}; restore the choice after returning.`,
    });
    visit(i + 1);
    path.pop();
  }
  visit(0);
  return result;
}

function permutations({ values }, emit = () => {}) {
  const path = [],
    used = Array(values.length).fill(false),
    result = [];
  function visit() {
    if (path.length === values.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < values.length; i++)
      if (!used[i]) {
        used[i] = true;
        path.push(values[i]);
        emit({
          values,
          active: [i],
          auxiliary: path,
          note: `Choose ${values[i]}; unavailable indices are not reused on this path.`,
        });
        visit();
        path.pop();
        used[i] = false;
        emit({
          values,
          auxiliary: path,
          note: `Undo ${values[i]} before trying the next sibling branch.`,
        });
      }
  }
  visit();
  return result;
}

function queens({ n }, emit = () => {}) {
  const columns = [],
    result = [];
  function place(row) {
    if (row === n) {
      result.push([...columns]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (columns.some((c, r) => c === col || Math.abs(c - col) === row - r)) continue;
      columns.push(col);
      emit({
        kind: "matrix",
        matrix: Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => (columns[r] === c ? "Q" : "·")),
        ),
        activeCell: [row, col],
        note: `Place queen at row ${row}, column ${col}; column and diagonal constraints hold.`,
      });
      place(row + 1);
      columns.pop();
    }
  }
  place(0);
  return result;
}

function fenwick({ values, end }, emit = () => {}) {
  const tree = Array(values.length + 1).fill(0);
  for (let i = 0; i < values.length; i++)
    for (let j = i + 1; j < tree.length; j += j & -j) {
      tree[j] += values[i];
      emit({
        values: tree,
        active: [j],
        note: `Add ${values[i]} to 1-based node ${j}; next ancestor is j + lowbit(j). Index 0 is unused.`,
      });
    }
  let sum = 0;
  for (let j = end; j > 0; j -= j & -j) {
    sum += tree[j];
    emit({
      values: tree,
      active: [j],
      auxiliary: [sum],
      note: `Collect node ${j}, then remove its lowbit. Query covers [0, ${end}).`,
    });
  }
  return sum;
}

function segmentTree({ values, left, right }, emit = () => {}) {
  const n = values.length,
    tree = Array(2 * n).fill(0);
  for (let i = 0; i < n; i++) tree[n + i] = values[i];
  for (let i = n - 1; i > 0; i--) {
    tree[i] = tree[2 * i] + tree[2 * i + 1];
    emit({
      values: tree,
      active: [i, 2 * i, 2 * i + 1],
      note: `Parent ${i} combines its two children. Slots ${n} onward are leaves; slot 0 is unused.`,
    });
  }
  let l = left + n,
    r = right + n,
    result = 0;
  while (l < r) {
    if (l % 2) result += tree[l++];
    if (r % 2) result += tree[--r];
    emit({
      values: tree,
      active: [l, r],
      auxiliary: [result],
      note: `Collect exposed boundary nodes, then move both boundaries upward.`,
    });
    l = Math.floor(l / 2);
    r = Math.floor(r / 2);
  }
  return result;
}

function bloom({ values, queries, size }, emit = () => {}) {
  const bits = Array(size).fill(0);
  const hashes = (value) => [value % size, (value * 3 + 1) % size];
  for (const value of values) {
    const indices = hashes(value);
    indices.forEach((i) => {
      bits[i] = 1;
    });
    emit({
      values: bits,
      active: indices,
      note: `Set two toy hash positions for ${value}. Collisions share bits.`,
    });
  }
  return queries.map((value) => {
    const indices = hashes(value),
      maybe = indices.every((i) => bits[i] === 1);
    emit({
      values: bits,
      active: indices,
      note: `Query ${value}: ${maybe ? "possibly present; verify elsewhere" : "definitely absent"}.`,
    });
    return maybe;
  });
}

function bitmask({ values }, emit = () => {}) {
  const result = [];
  for (let mask = 0; mask < 2 ** values.length; mask++) {
    const subset = values.filter((_, i) => (mask & (1 << i)) !== 0);
    result.push(subset);
    emit({
      values,
      active: values.flatMap((_, i) => (mask & (1 << i) ? [i] : [])),
      auxiliary: subset,
      note: `Mask ${mask.toString(2).padStart(values.length, "0")}; bit i selects input index i.`,
    });
  }
  return result;
}

export const dsaAlgorithms = {
  linearSearch,
  insertArray,
  prefixSum,
  twoPointers,
  windowSum,
  reverseList,
  listInsert,
  cycleDetect,
  stackOps,
  brackets,
  postfix,
  nextGreater,
  queueOps,
  dequeWindow,
  hashChain,
  hashProbe,
  frequencies,
  binarySearch,
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
  countingSort,
  heapSort,
  heapInsert,
  treeTraversal,
  bstSearch,
  bfs,
  dfs,
  topological,
  dijkstra,
  unionFind,
  kruskal,
  trie,
  factorial,
  hanoi,
  fibonacci,
  coinChange,
  knapsack,
  lcs,
  intervals,
  fractional,
  subsets,
  permutations,
  queens,
  fenwick,
  segmentTree,
  bloom,
  bitmask,
};

export function runDsaAlgorithm(name, input) {
  const frames = [];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const result = dsaAlgorithms[name](clone(input), (frame) => frames.push(clone(frame)));
  return { frames, result };
}

Object.assign(dsaAlgorithms, dsaAdvancedAlgorithms);
Object.assign(dsaAlgorithms, dsaFoundationAlgorithms);
