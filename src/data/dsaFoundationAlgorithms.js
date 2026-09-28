// Standalone implementations: each function can be copied directly from a lesson.
function jumpSearch({ values, target }, emit = () => {}) {
  const step = Math.max(1, Math.floor(Math.sqrt(values.length)));
  let start = 0;
  while (start < values.length) {
    const end = Math.min(start + step, values.length);
    emit({
      values,
      active: [end - 1],
      note: `Inspect block [${start}, ${end}) before scanning it.`,
    });
    if (values[end - 1] >= target) {
      for (let i = start; i < end; i++) {
        emit({ values, active: [i], note: `Scan candidate position ${i} for the requested key.` });
        if (values[i] === target) return i;
      }
      return -1;
    }
    start = end;
  }
  return -1;
}

function shellSort({ values }, emit = () => {}) {
  const a = [...values];
  for (let gap = Math.floor(a.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < a.length; i++) {
      const key = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > key) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = key;
      emit({
        values: a,
        active: [j],
        note: `Insert ${key} into its gap-${gap} sorted subsequence.`,
      });
    }
  }
  return a;
}

function stronglyConnected({ adjacency }, emit = () => {}) {
  const n = adjacency.length,
    seen = new Set(),
    order = [],
    reverse = Array.from({ length: n }, () => []);
  adjacency.forEach((neighbors, u) => neighbors.forEach((v) => reverse[v].push(u)));
  function visit(u) {
    if (seen.has(u)) return;
    seen.add(u);
    adjacency[u].forEach(visit);
    order.push(u);
    emit({
      values: [...order],
      note: `Finish vertex ${u}; append it after all reachable descendants.`,
    });
  }
  for (let u = 0; u < n; u++) visit(u);
  seen.clear();
  const components = [];
  function collect(u, component) {
    if (seen.has(u)) return;
    seen.add(u);
    component.push(u);
    reverse[u].forEach((v) => collect(v, component));
  }
  for (const u of order.reverse()) {
    if (seen.has(u)) continue;
    const component = [];
    collect(u, component);
    components.push(component);
    emit({
      values: component,
      note: `Reverse-graph traversal isolates component ${components.length}.`,
    });
  }
  return components;
}

function maxFlow({ capacity, source, sink }, emit = () => {}) {
  const n = capacity.length;
  if (
    source === sink ||
    source < 0 ||
    sink < 0 ||
    source >= n ||
    sink >= n ||
    capacity.some((row) => row.length !== n || row.some((v) => !Number.isFinite(v) || v < 0))
  )
    throw new RangeError("Use a square nonnegative capacity matrix and distinct valid terminals");
  const residual = capacity.map((row) => [...row]);
  let flow = 0;
  while (true) {
    const parent = Array(n).fill(-1),
      queue = [source];
    parent[source] = source;
    for (let head = 0; head < queue.length && parent[sink] === -1; head++) {
      const u = queue[head];
      for (let v = 0; v < n; v++)
        if (parent[v] === -1 && residual[u][v] > 0) {
          parent[v] = u;
          queue.push(v);
        }
    }
    if (parent[sink] === -1) {
      const reachable = parent.flatMap((p, i) => (p === -1 ? [] : [i]));
      emit({ values: reachable, note: `No augmenting path remains; maximum flow is ${flow}.` });
      return { flow, reachable };
    }
    let amount = Infinity;
    const path = [sink];
    for (let v = sink; v !== source; v = parent[v]) {
      amount = Math.min(amount, residual[parent[v]][v]);
      path.push(parent[v]);
    }
    for (let v = sink; v !== source; v = parent[v]) {
      residual[parent[v]][v] -= amount;
      residual[v][parent[v]] += amount;
    }
    flow += amount;
    emit({
      values: path.reverse(),
      note: `Augment this path by ${amount}; total flow becomes ${flow}.`,
    });
  }
}

function matrixChain({ dimensions }, emit = () => {}) {
  if (dimensions.length < 2 || dimensions.some((d) => !Number.isInteger(d) || d <= 0))
    throw new RangeError("Supply positive integer matrix dimensions");
  const n = dimensions.length - 1,
    dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let length = 2; length <= n; length++)
    for (let i = 0; i + length <= n; i++) {
      const j = i + length - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++)
        dp[i][j] = Math.min(
          dp[i][j],
          dp[i][k] + dp[k + 1][j] + dimensions[i] * dimensions[k + 1] * dimensions[j + 1],
        );
      emit({
        values: dp[i].slice(i, j + 1),
        note: `Optimal scalar multiplication count for matrices ${i} through ${j} is ${dp[i][j]}.`,
      });
    }
  return dp[0][n - 1];
}

function vertexCover({ edges }, emit = () => {}) {
  const cover = new Set();
  for (const [u, v] of edges) {
    if (cover.has(u) || cover.has(v)) continue;
    cover.add(u);
    cover.add(v);
    emit({ values: [...cover], note: `Select both endpoints of uncovered edge (${u}, ${v}).` });
  }
  return [...cover];
}

function fisherYates({ values, seed = 42 }, emit = () => {}) {
  const a = [...values];
  let state = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((state / 2 ** 32) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
    emit({
      values: a,
      active: [i, j],
      note: `Choose position ${j} from 0 through ${i}, then fix position ${i}.`,
    });
  }
  return a;
}

export const dsaFoundationAlgorithms = {
  jumpSearch,
  shellSort,
  stronglyConnected,
  maxFlow,
  matrixChain,
  vertexCover,
  fisherYates,
};
