export function bstOperations({ operations }, emit = () => {}) {
  let root = null;
  function insert(node, value) {
    if (!node) return { value, left: null, right: null };
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    return node;
  }
  function remove(node, value) {
    if (!node) return null;
    if (value < node.value) node.left = remove(node.left, value);
    else if (value > node.value) node.right = remove(node.right, value);
    else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.value = successor.value;
      node.right = remove(node.right, successor.value);
    }
    return node;
  }
  function draw(node) {
    const values = [],
      edges = [];
    function visit(n, parent = null) {
      if (!n) return;
      const id = values.length;
      values.push(n.value);
      if (parent !== null) edges.push([parent, id]);
      visit(n.left, id);
      visit(n.right, id);
    }
    visit(node);
    return { kind: "hierarchy", values, edges };
  }
  for (const [op, value] of operations) {
    root = op === "insert" ? insert(root, value) : remove(root, value);
    emit({
      ...draw(root),
      note: `${op} ${value}; all left descendants remain smaller and all right descendants larger. Duplicate inserts are ignored.`,
    });
  }
  const result = [];
  function inorder(n) {
    if (n) {
      inorder(n.left);
      result.push(n.value);
      inorder(n.right);
    }
  }
  inorder(root);
  return result;
}

export function avlInsert({ values }, emit = () => {}) {
  const height = (n) => (n ? n.height : 0);
  const update = (n) => {
    n.height = 1 + Math.max(height(n.left), height(n.right));
    return n;
  };
  function right(y) {
    const x = y.left;
    y.left = x.right;
    x.right = y;
    update(y);
    return update(x);
  }
  function left(x) {
    const y = x.right;
    x.right = y.left;
    y.left = x;
    update(x);
    return update(y);
  }
  function insert(n, value) {
    if (!n) return { value, height: 1, left: null, right: null };
    if (value < n.value) n.left = insert(n.left, value);
    else if (value > n.value) n.right = insert(n.right, value);
    else return n;
    update(n);
    const balance = height(n.left) - height(n.right);
    if (balance > 1) {
      if (value > n.left.value) n.left = left(n.left);
      return right(n);
    }
    if (balance < -1) {
      if (value < n.right.value) n.right = right(n.right);
      return left(n);
    }
    return n;
  }
  let root = null;
  for (const value of values) {
    root = insert(root, value);
    const labels = [],
      edges = [];
    function draw(n, parent = null) {
      if (!n) return;
      const id = labels.length;
      labels.push(`${n.value} h${n.height}`);
      if (parent !== null) edges.push([parent, id]);
      draw(n.left, id);
      draw(n.right, id);
    }
    draw(root);
    emit({
      kind: "hierarchy",
      values: labels,
      edges,
      note: `Insert ${value}, update heights bottom-up, and rotate wherever the balance magnitude exceeds 1.`,
    });
  }
  const order = [];
  function walk(n) {
    if (n) {
      walk(n.left);
      order.push(n.value);
      walk(n.right);
    }
  }
  walk(root);
  return { root: root?.value ?? null, height: height(root), inorder: order };
}

export function matrixTranspose({ matrix }, emit = () => {}) {
  if (!matrix.length) return [];
  const result = Array.from({ length: matrix[0].length }, () => Array(matrix.length).fill(null));
  for (let r = 0; r < matrix.length; r++)
    for (let c = 0; c < matrix[0].length; c++) {
      result[c][r] = matrix[r][c];
      emit({
        kind: "matrix",
        matrix: result,
        activeCell: [c, r],
        note: `Copy input[${r}][${c}]=${matrix[r][c]} to output[${c}][${r}].`,
      });
    }
  return result;
}

export function radixSort({ values }, emit = () => {}) {
  let a = [...values];
  const maximum = Math.max(0, ...a);
  for (let place = 1; Math.floor(maximum / place) > 0; place *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const value of a) buckets[Math.floor(value / place) % 10].push(value);
    emit({
      kind: "buckets",
      values: buckets.map((b) => b.join(", ") || "∅"),
      note: `Stable buckets for digit place ${place}; preserve incoming order within each bucket.`,
    });
    a = buckets.flat();
    emit({
      values: a,
      note: `Gather digit ${place}; lower processed digits remain correctly ordered within ties.`,
    });
  }
  return a;
}

export function fastPower({ base, exponent }, emit = () => {}) {
  let result = 1,
    power = base,
    remaining = exponent;
  while (remaining > 0) {
    if (remaining % 2 === 1) result *= power;
    remaining = Math.floor(remaining / 2);
    power *= power;
    emit({
      values: [result, power, remaining],
      note: "State: accumulated result, current squared power, remaining exponent. Consume one binary digit per iteration.",
    });
  }
  return result;
}

export function bellmanFord({ size, edges, start }, emit = () => {}) {
  const distance = Array(size).fill(Infinity);
  distance[start] = 0;
  for (let pass = 1; pass < size; pass++) {
    let changed = false;
    for (const [u, v, w] of edges)
      if (distance[u] !== Infinity && distance[u] + w < distance[v]) {
        distance[v] = distance[u] + w;
        changed = true;
        emit({
          kind: "graph",
          values: distance.map((d, i) => `${i}:${d === Infinity ? "∞" : d}`),
          edges,
          active: [u, v],
          note: `Pass ${pass}: relax ${u}→${v}, weight ${w}.`,
        });
      }
    if (!changed) break;
  }
  const negativeCycle = edges.some(
    ([u, v, w]) => distance[u] !== Infinity && distance[u] + w < distance[v],
  );
  return { distance: distance.map((d) => (d === Infinity ? null : d)), negativeCycle };
}

export function floydWarshall({ matrix }, emit = () => {}) {
  const d = matrix.map((row) => row.map((x) => (x === null ? Infinity : x)));
  for (let k = 0; k < d.length; k++) {
    for (let i = 0; i < d.length; i++)
      for (let j = 0; j < d.length; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
    emit({
      kind: "matrix",
      matrix: d.map((row) => row.map((x) => (x === Infinity ? "∞" : x))),
      note: `Allow vertex ${k} as an intermediate; compare direct distance with distance through ${k}.`,
    });
  }
  return d.map((row) => row.map((x) => (x === Infinity ? null : x)));
}

export function lru({ requests, capacity }, emit = () => {}) {
  const cache = new Map();
  let hits = 0;
  for (const key of requests) {
    const hit = cache.has(key);
    if (hit) {
      hits++;
      cache.delete(key);
    }
    cache.set(key, true);
    if (cache.size > capacity) cache.delete(cache.keys().next().value);
    emit({
      kind: "linked",
      values: [...cache.keys()],
      active: [cache.size - 1],
      note: `${key}: ${hit ? "hit; move to newest" : "miss; insert and evict oldest if full"}. Left is least recent, right most recent.`,
    });
  }
  return { keys: [...cache.keys()], hits };
}

export function mergeLists({ left, right }, emit = () => {}) {
  const result = [];
  let i = 0,
    j = 0;
  while (i < left.length || j < right.length) {
    if (j === right.length || (i < left.length && left[i] <= right[j])) result.push(left[i++]);
    else result.push(right[j++]);
    emit({
      kind: "linked",
      values: result,
      auxiliary: [...left.slice(i), ...right.slice(j)],
      note: "Take the smaller current head and advance only that input. Top: merged prefix; bottom: remaining inputs concatenated for display.",
    });
  }
  return result;
}

export function skipSearch({ levels, target }, emit = () => {}) {
  let predecessor = -Infinity;
  for (let level = levels.length - 1; level >= 0; level--) {
    for (const value of levels[level])
      if (value >= predecessor && value < target) predecessor = value;
    emit({
      kind: "buckets",
      values: levels.map((row) => row.join(" → ")),
      active: [level],
      auxiliary: [predecessor === -Infinity ? "head" : predecessor],
      note: `Level ${level}: move right while below ${target}, then descend. This array-backed teaching scan illustrates routing, not skip-list pointer complexity.`,
    });
  }
  return levels[0].includes(target);
}

export const dsaAdvancedAlgorithms = {
  bstOperations,
  avlInsert,
  matrixTranspose,
  radixSort,
  fastPower,
  bellmanFord,
  floydWarshall,
  lru,
  mergeLists,
  skipSearch,
};

export function redBlackInsert({ values }, emit = () => {}) {
  const red = (n) => Boolean(n?.red);
  function left(h) {
    const x = h.right;
    h.right = x.left;
    x.left = h;
    x.red = h.red;
    h.red = true;
    return x;
  }
  function right(h) {
    const x = h.left;
    h.left = x.right;
    x.right = h;
    x.red = h.red;
    h.red = true;
    return x;
  }
  function insert(h, value) {
    if (!h) return { value, red: true, left: null, right: null };
    if (value < h.value) h.left = insert(h.left, value);
    else if (value > h.value) h.right = insert(h.right, value);
    if (red(h.right) && !red(h.left)) h = left(h);
    if (red(h.left) && red(h.left.left)) h = right(h);
    if (red(h.left) && red(h.right)) {
      h.red = !h.red;
      h.left.red = !h.left.red;
      h.right.red = !h.right.red;
    }
    return h;
  }
  let root = null;
  for (const value of values) {
    root = insert(root, value);
    root.red = false;
    const labels = [],
      edges = [];
    function draw(n, parent = null) {
      if (!n) return;
      const id = labels.length;
      labels.push(`${n.value} ${n.red ? "R" : "B"}`);
      if (parent !== null) edges.push([parent, id]);
      draw(n.left, id);
      draw(n.right, id);
    }
    draw(root);
    emit({
      kind: "hierarchy",
      values: labels,
      edges,
      note: `Insert ${value}; repair right-leaning red links, consecutive left reds, and temporary 4-nodes. Force the root black.`,
    });
  }
  const order = [];
  function walk(n) {
    if (n) {
      walk(n.left);
      order.push(n.value);
      walk(n.right);
    }
  }
  walk(root);
  return order;
}

export function btreeInsert({ values, degree = 2 }, emit = () => {}) {
  let root = { keys: [], children: [] };
  function split(parent, i) {
    const child = parent.children[i];
    const right = {
      keys: child.keys.splice(degree),
      children: child.children.length ? child.children.splice(degree) : [],
    };
    const middle = child.keys.pop();
    parent.keys.splice(i, 0, middle);
    parent.children.splice(i + 1, 0, right);
  }
  function insert(node, value) {
    let i = 0;
    while (i < node.keys.length && value > node.keys[i]) i++;
    if (node.keys[i] === value) return;
    if (!node.children.length) {
      node.keys.splice(i, 0, value);
      return;
    }
    if (node.children[i].keys.length === 2 * degree - 1) {
      split(node, i);
      if (value === node.keys[i]) return;
      if (value > node.keys[i]) i++;
    }
    insert(node.children[i], value);
  }
  for (const value of values) {
    if (root.keys.length === 2 * degree - 1) {
      root = { keys: [], children: [root] };
      split(root, 0);
    }
    insert(root, value);
    const labels = [],
      edges = [];
    function draw(n, parent = null) {
      const id = labels.length;
      labels.push(n.keys.join("|"));
      if (parent !== null) edges.push([parent, id]);
      n.children.forEach((c) => draw(c, id));
    }
    draw(root);
    emit({
      kind: "hierarchy",
      values: labels,
      edges,
      note: `Insert ${value}; split full children before descending. All leaves stay at the same depth.`,
    });
  }
  return root;
}

export function treapInsert({ entries }, emit = () => {}) {
  function rotateRight(y) {
    const x = y.left;
    y.left = x.right;
    x.right = y;
    return x;
  }
  function rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    y.left = x;
    return y;
  }
  function insert(n, key, priority) {
    if (!n) return { key, priority, left: null, right: null };
    if (key < n.key) {
      n.left = insert(n.left, key, priority);
      if (n.left.priority < n.priority) n = rotateRight(n);
    } else if (key > n.key) {
      n.right = insert(n.right, key, priority);
      if (n.right.priority < n.priority) n = rotateLeft(n);
    }
    return n;
  }
  let root = null;
  for (const [key, priority] of entries) {
    root = insert(root, key, priority);
    const labels = [],
      edges = [];
    function draw(n, parent = null) {
      if (!n) return;
      const id = labels.length;
      labels.push(`${n.key}/p${n.priority}`);
      if (parent !== null) edges.push([parent, id]);
      draw(n.left, id);
      draw(n.right, id);
    }
    draw(root);
    emit({
      kind: "hierarchy",
      values: labels,
      edges,
      note: `Insert key ${key} with priority ${priority}; rotate to satisfy BST key order and min-heap priority order.`,
    });
  }
  const order = [];
  function walk(n) {
    if (n) {
      walk(n.left);
      order.push(n.key);
      walk(n.right);
    }
  }
  walk(root);
  return order;
}

Object.assign(dsaAdvancedAlgorithms, { redBlackInsert, btreeInsert, treapInsert });

export function lazyRangeAdd(
  { values, left, right, delta, queryLeft, queryRight },
  emit = () => {},
) {
  function build(lo, hi) {
    if (hi - lo === 1) return { lo, hi, sum: values[lo], lazy: 0, a: null, b: null };
    const mid = Math.floor((lo + hi) / 2),
      a = build(lo, mid),
      b = build(mid, hi);
    return { lo, hi, sum: a.sum + b.sum, lazy: 0, a, b };
  }
  const root = build(0, values.length);
  function snapshot(note) {
    const labels = [],
      edges = [];
    function draw(n, parent = null) {
      const id = labels.length;
      labels.push(`${n.sum}/+${n.lazy}`);
      if (parent !== null) edges.push([parent, id]);
      if (n.a) {
        draw(n.a, id);
        draw(n.b, id);
      }
    }
    draw(root);
    emit({ kind: "hierarchy", values: labels, edges, note });
  }
  function apply(n, add) {
    n.sum += add * (n.hi - n.lo);
    n.lazy += add;
  }
  function push(n) {
    if (n.a && n.lazy) {
      apply(n.a, n.lazy);
      apply(n.b, n.lazy);
      n.lazy = 0;
    }
  }
  function update(n) {
    if (right <= n.lo || n.hi <= left) return;
    if (left <= n.lo && n.hi <= right) {
      apply(n, delta);
      snapshot(
        `Tag interval [${n.lo},${n.hi}) with +${delta}. Labels show sum / pending addition. Ancestors are recomputed on return.`,
      );
      return;
    }
    push(n);
    update(n.a);
    update(n.b);
    n.sum = n.a.sum + n.b.sum;
  }
  function query(n) {
    if (queryRight <= n.lo || n.hi <= queryLeft) return 0;
    if (queryLeft <= n.lo && n.hi <= queryRight) return n.sum;
    push(n);
    snapshot(`Push pending work before partially querying [${n.lo},${n.hi}).`);
    return query(n.a) + query(n.b);
  }
  snapshot("Initial tree: labels show sum / pending addition.");
  update(root);
  snapshot("Update complete: parent sums include the change even where child tags remain pending.");
  const sum = query(root);
  return { sum, total: root.sum };
}

export function trieDelete({ words, remove }, emit = () => {}) {
  const root = { children: {}, end: false };
  for (const word of words) {
    let n = root;
    for (const c of word) {
      n.children[c] ||= { children: {}, end: false };
      n = n.children[c];
    }
    n.end = true;
  }
  function snapshot(note) {
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
    emit({ kind: "hierarchy", values: labels, edges, note });
  }
  snapshot("Initial words share prefixes; * marks terminal nodes.");
  function erase(n, word, i) {
    if (i === word.length) n.end = false;
    else {
      const child = n.children[word[i]];
      if (!child) return false;
      if (erase(child, word, i + 1)) {
        delete n.children[word[i]];
        snapshot(`Prune child ${word[i]} only after it becomes childless and nonterminal.`);
      }
    }
    return !n.end && Object.keys(n.children).length === 0;
  }
  for (const word of remove) {
    erase(root, word, 0);
    snapshot(`Finished deleting ${word}; other terminal paths remain reachable.`);
  }
  const result = [];
  function collect(n, prefix) {
    if (n.end) result.push(prefix);
    for (const [c, child] of Object.entries(n.children)) collect(child, prefix + c);
  }
  collect(root, "");
  return result;
}

Object.assign(dsaAdvancedAlgorithms, { lazyRangeAdd, trieDelete });
