export const WIDTH = 720;
export const NODE_H = 50;
const ROW = 94;

// Columns run left to right; each column is centred vertically.
export function layoutMotion(columns) {
  const rows = Math.max(...columns.map((column) => column.length));
  const height = Math.max(190, rows * ROW + 40);
  const slot = WIDTH / columns.length;
  const nodeWidth = Math.min(138, slot - 26);
  const nodes = {};
  columns.forEach((column, x) =>
    column.forEach((node, y) => {
      nodes[node.id] = {
        ...node,
        column: x,
        cx: (x + 0.5) * slot,
        cy: height / 2 + (y - (column.length - 1) / 2) * ROW,
      };
    }),
  );
  return { nodes, height, nodeWidth };
}

// Point where the line from a node's centre towards (x, y) meets the node border.
function border(node, x, y, nodeWidth) {
  const dx = x - node.cx;
  const dy = y - node.cy;
  const reach = Math.min(
    dx ? (nodeWidth / 2 + 9) / Math.abs(dx) : Infinity,
    dy ? (NODE_H / 2 + 9) / Math.abs(dy) : Infinity,
  );
  return `${Math.round(node.cx + dx * reach)} ${Math.round(node.cy + dy * reach)}`;
}

// A straight line between neighbours; a curve when it would cross another node.
export function edgePath(a, b, nodes, nodeWidth) {
  const crosses = Object.values(nodes).some((node) => {
    if (node.id === a.id || node.id === b.id) return false;
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const t = ((node.cx - a.cx) * dx + (node.cy - a.cy) * dy) / (dx * dx + dy * dy || 1);
    if (t <= 0.05 || t >= 0.95) return false;
    return Math.hypot(a.cx + t * dx - node.cx, a.cy + t * dy - node.cy) < 30;
  });
  if (!crosses)
    return `M ${border(a, b.cx, b.cy, nodeWidth)} L ${border(b, a.cx, a.cy, nodeWidth)}`;
  const vertical = a.column === b.column;
  const mx = (a.cx + b.cx) / 2 + (vertical ? 120 * (a.cx < WIDTH / 2 ? 1 : -1) : 0);
  const my = Math.max(6, (a.cy + b.cy) / 2 - (vertical ? 0 : 92));
  return `M ${border(a, mx, my, nodeWidth)} Q ${mx} ${my} ${border(b, mx, my, nodeWidth)}`;
}

export function listEdges(steps) {
  const seen = new Map();
  steps.forEach((step, index) =>
    step.to.forEach((to) => {
      if (to === step.from) return;
      const key = [step.from, to].sort().join("|");
      if (!seen.has(key)) seen.set(key, { key, from: step.from, to, first: index + 1 });
    }),
  );
  return [...seen.values()];
}
