import { useState } from "react";
import { Controls, Frame, Rich, useStepper } from "./Stepper";

/* ---------------- Binary tree traversals and BST search / insert ---------------- */

const TREE = {
  50: [300, 40, 30, 70],
  30: [170, 110, 20, 40],
  70: [430, 110, 60, 80],
  20: [100, 185],
  40: [240, 185],
  60: [360, 185],
  80: [500, 185],
};
const kids = (value) => [TREE[value][2], TREE[value][3]].filter(Boolean);

function traversal(kind) {
  const order = [];
  const pre = (n) => n && (order.push(n), pre(TREE[n][2]), pre(TREE[n][3]));
  const ino = (n) => n && (ino(TREE[n][2]), order.push(n), ino(TREE[n][3]));
  const post = (n) => n && (post(TREE[n][2]), post(TREE[n][3]), order.push(n));
  if (kind === "pre") pre(50);
  if (kind === "in") ino(50);
  if (kind === "post") post(50);
  if (kind === "level") {
    const queue = [50];
    while (queue.length) {
      const n = queue.shift();
      order.push(n);
      queue.push(...kids(n));
    }
  }
  return order;
}

const TREE_MODES = {
  pre: ["Preorder", "root → left → right", "Visit the node BEFORE its subtrees. Used to copy or serialize a tree."],
  in: ["Inorder", "left → root → right", "Visit the node BETWEEN its subtrees. On a BST this yields sorted order."],
  post: ["Postorder", "left → right → root", "Visit the node AFTER its subtrees. Used to delete a tree or compute heights and sizes."],
  level: ["Level order", "breadth-first with a queue", "Visit level by level with a queue (BFS)."],
  search: ["BST search 60", "compare and go left or right", "Each comparison discards half of the remaining tree: O(log n) when balanced, O(n) when degenerate."],
  insert: ["BST insert 65", "search, then attach a leaf", "Insertion follows the search path and attaches the new key as a leaf where the search fell off."],
};

function treeFrames(mode) {
  if (mode === "search" || mode === "insert") {
    const target = mode === "search" ? 60 : 65;
    const frames = [{ cur: null, path: [], out: [], note: `Start at the root looking for ${target}. Rule: smaller keys go left, larger go right.` }];
    let node = 50;
    const path = [];
    while (node) {
      path.push(node);
      const go = target === node ? null : target < node ? TREE[node][2] : TREE[node][3];
      frames.push({
        cur: node,
        path: [...path],
        out: [...path],
        note: target === node ? `${target} == ${node}: found after ${path.length} comparisons.` : `${target} ${target < node ? "<" : ">"} ${node}: go ${target < node ? "left" : "right"}${go ? ` to ${go}` : " — the child is null"}.`,
      });
      if (target === node) break;
      if (!go) {
        frames.push({ cur: target, path: [...path, target], out: [...path, target], added: { parent: node, value: target }, note: `Attach ${target} as the ${target < node ? "left" : "right"} child of ${node}. The tree is still a valid BST.` });
        break;
      }
      node = go;
    }
    return frames;
  }
  const order = traversal(mode);
  return [
    { cur: null, path: [], out: [], note: `${TREE_MODES[mode][0]} (${TREE_MODES[mode][1]}). ${TREE_MODES[mode][2]}` },
    ...order.map((value, i) => ({ cur: value, path: order.slice(0, i + 1), out: order.slice(0, i + 1), note: i === order.length - 1 ? `Done: ${order.join(", ")}. Every node is visited once: O(n) time, O(height) stack space.` : `Visit ${value}.` })),
  ];
}

function TreeStage({ frame }) {
  const nodes = { ...TREE };
  if (frame.added) nodes[frame.added.value] = [nodes[frame.added.parent][0] + 40, 255];
  const edges = Object.entries(TREE).flatMap(([value, [, , l, r]]) => [l, r].filter(Boolean).map((child) => [Number(value), child]));
  if (frame.added) edges.push([frame.added.parent, frame.added.value]);
  return (
    <svg viewBox="0 0 600 290" className="jvSvg" role="img" aria-label={`Binary search tree; visited so far: ${frame.out.join(", ") || "none"}`}>
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className={`jvTreeEdge ${frame.path.includes(a) && frame.path.includes(b) ? "on" : ""}`} />
      ))}
      {Object.entries(nodes).map(([value, [x, y]]) => {
        const v = Number(value);
        const state = frame.cur === v ? "cur" : frame.path.includes(v) ? "seen" : "";
        return (
          <g key={value} className={`jvTreeNode ${state} ${frame.added?.value === v ? "jvPopIn" : ""}`}>
            <circle cx={x} cy={y} r={22} />
            <text x={x} y={y + 5} textAnchor="middle">
              {value}
            </text>
            {frame.path.includes(v) && frame.out.indexOf(v) >= 0 && (
              <text x={x + 24} y={y - 18} className="jvTiny">
                {frame.out.indexOf(v) + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function TreeVisual({ modes = ["pre", "in", "post", "level"] }) {
  const [mode, setMode] = useState(modes[0]);
  const frames = treeFrames(mode);
  return <TreePlayer key={mode} mode={mode} setMode={setMode} modes={modes} frames={frames} />;
}

function TreePlayer({ mode, setMode, modes, frames }) {
  const stepper = useStepper(frames.length, 1200);
  const frame = frames[stepper.index];
  return (
    <Frame
      kicker="ANIMATION"
      title="Binary tree: traversals and BST operations"
      tabs={modes.map((id) => ({ id, label: TREE_MODES[id][0] }))}
      tab={mode}
      onTab={setMode}
      controls={<Controls stepper={stepper} />}
      note={<Rich text={frame.note} />}
    >
      <TreeStage frame={frame} />
      <div className="jvStrip" aria-label="Output so far">
        <small>{mode === "search" || mode === "insert" ? "path" : "output"}</small>
        {frame.out.map((value, i) => (
          <b key={`${value}-${i}`} className="jvPopIn">
            {value}
          </b>
        ))}
      </div>
    </Frame>
  );
}

/* ---------------- Graph BFS and DFS ---------------- */

const GRAPH = {
  A: [70, 120],
  B: [200, 50],
  C: [200, 190],
  D: [340, 50],
  E: [340, 190],
  F: [470, 120],
  G: [590, 120],
};
const LINKS = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "E"],
  ["D", "F"],
  ["E", "F"],
  ["F", "G"],
];
const ADJ = Object.fromEntries(Object.keys(GRAPH).map((key) => [key, LINKS.flatMap(([a, b]) => (a === key ? [b] : b === key ? [a] : [])).sort()]));

function bfsFrames() {
  const seen = new Set(["A"]);
  const queue = ["A"];
  const order = [];
  const tree = [];
  const frames = [{ cur: null, seen: ["A"], order: [], box: ["A"], tree: [], note: "BFS from A: mark A as seen and put it in the queue. A queue makes BFS explore in rings of increasing distance." }];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    const added = [];
    for (const next of ADJ[node])
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
        tree.push([node, next]);
        added.push(next);
      }
    frames.push({ cur: node, seen: [...seen], order: [...order], box: [...queue], tree: [...tree], note: `poll ${node}; ${added.length ? `enqueue unseen neighbours ${added.join(", ")}` : "every neighbour is already seen"}.` });
  }
  frames.push({ cur: null, seen: [...seen], order, box: [], tree, note: `BFS order: ${order.join(" → ")}. The highlighted edges form the BFS tree: shortest paths in an unweighted graph. O(V + E).` });
  return frames;
}

function dfsFrames() {
  const seen = new Set();
  const order = [];
  const tree = [];
  const stack = [];
  const frames = [{ cur: null, seen: [], order: [], box: [], tree: [], note: "DFS from A: go as deep as possible along one path, then backtrack. The call stack (or an explicit stack) remembers the way back." }];
  const visit = (node, parent) => {
    seen.add(node);
    order.push(node);
    stack.push(node);
    if (parent) tree.push([parent, node]);
    frames.push({ cur: node, seen: [...seen], order: [...order], box: [...stack], tree: [...tree], note: `dfs(${node}): visit ${node}${parent ? ` (reached from ${parent})` : ""}.` });
    for (const next of ADJ[node]) if (!seen.has(next)) visit(next, node);
    stack.pop();
    frames.push({ cur: stack.at(-1) ?? null, seen: [...seen], order: [...order], box: [...stack], tree: [...tree], note: `All neighbours of ${node} are seen: return (backtrack)${stack.length ? ` to ${stack.at(-1)}` : ""}.` });
  };
  visit("A");
  frames.push({ cur: null, seen: [...seen], order, box: [], tree, note: `DFS order: ${order.join(" → ")}. Used for cycle detection, topological sort and connected components. O(V + E).` });
  return frames;
}

export function GraphVisual({ modes = ["bfs", "dfs"] }) {
  const [mode, setMode] = useState(modes[0]);
  return <GraphPlayer key={mode} mode={mode} setMode={setMode} modes={modes} />;
}

function GraphPlayer({ mode, setMode, modes }) {
  const frames = mode === "bfs" ? bfsFrames() : dfsFrames();
  const stepper = useStepper(frames.length, 1300);
  const frame = frames[stepper.index];
  const isTree = (a, b) => frame.tree.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return (
    <Frame
      kicker="ANIMATION"
      title="Graph traversal on an adjacency list"
      tabs={modes.map((id) => ({ id, label: id === "bfs" ? "BFS (queue)" : "DFS (stack)" }))}
      tab={mode}
      onTab={setMode}
      controls={<Controls stepper={stepper} />}
      note={<Rich text={frame.note} />}
    >
      <svg viewBox="0 0 660 240" className="jvSvg" role="img" aria-label={`Undirected graph with edges ${LINKS.map((l) => l.join("-")).join(", ")}; visited ${frame.order.join(", ") || "none"}`}>
        {LINKS.map(([a, b]) => (
          <line key={a + b} x1={GRAPH[a][0]} y1={GRAPH[a][1]} x2={GRAPH[b][0]} y2={GRAPH[b][1]} className={`jvTreeEdge ${isTree(a, b) ? "on" : ""}`} />
        ))}
        {Object.entries(GRAPH).map(([key, [x, y]]) => (
          <g key={key} className={`jvTreeNode ${frame.cur === key ? "cur" : frame.order.includes(key) ? "seen" : frame.seen.includes(key) ? "queued" : ""}`}>
            <circle cx={x} cy={y} r={22} />
            <text x={x} y={y + 5} textAnchor="middle">
              {key}
            </text>
          </g>
        ))}
      </svg>
      <div className="jvStrip">
        <small>{mode === "bfs" ? "queue" : "call stack"}</small>
        {frame.box.map((key) => (
          <b key={key} className="jvPopIn">
            {key}
          </b>
        ))}
        {frame.box.length === 0 && <em>empty</em>}
      </div>
      <div className="jvStrip">
        <small>visited</small>
        {frame.order.map((key) => (
          <b key={key} className="jvPopIn done">
            {key}
          </b>
        ))}
      </div>
      <p className="jvAdj">
        Adjacency list:{" "}
        {Object.entries(ADJ).map(([key, list]) => (
          <code key={key}>
            {key}: [{list.join(", ")}]
          </code>
        ))}
      </p>
    </Frame>
  );
}
