import { useEffect, useState } from "react";

const WIDTH = 640;
const HEIGHT = 250;
const NODE_W = 116;
const NODE_H = 46;

// Default layout: one row, or two rows when the diagram has more than four nodes.
function layout(nodes) {
  if (nodes.every((node) => node.x !== undefined && node.y !== undefined)) {
    return nodes.map((node) => ({
      ...node,
      cx: (node.x / 100) * WIDTH,
      cy: (node.y / 100) * HEIGHT,
    }));
  }
  const perRow = nodes.length > 4 ? Math.ceil(nodes.length / 2) : nodes.length;
  const rows = Math.ceil(nodes.length / perRow);
  return nodes.map((node, index) => {
    const row = Math.floor(index / perRow);
    const column = index % perRow;
    const inRow = Math.min(perRow, nodes.length - row * perRow);
    // Second row runs right-to-left so the path reads as one continuous loop.
    const slot = row % 2 === 0 ? column : inRow - 1 - column;
    return {
      ...node,
      cx: ((slot + 0.5) * WIDTH) / inRow,
      cy: rows === 1 ? HEIGHT / 2 : row === 0 ? HEIGHT * 0.28 : HEIGHT * 0.74,
    };
  });
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Data-driven animated diagram. Each step moves a token from one node to another,
 * highlights the destination, and explains what happened at that moment.
 */
export default function ReactMotion({ animation }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const nodes = layout(animation.nodes);
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const current = animation.steps[step];
  const from = byId[current.from];
  const to = byId[current.to];
  const last = animation.steps.length - 1;

  useEffect(() => {
    // Start automatically only for people who have not asked for reduced motion.
    if (!prefersReducedMotion()) setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setTimeout(() => {
      setStep((value) => (value >= last ? 0 : value + 1));
    }, current.duration || 2600);
    return () => window.clearTimeout(id);
  }, [playing, step, last, current.duration]);

  const edges = [];
  const seen = new Set();
  for (const item of animation.steps) {
    const key = [item.from, item.to].sort().join("|");
    if (item.from !== item.to && !seen.has(key)) {
      seen.add(key);
      edges.push(item);
    }
  }

  return (
    <figure className="reactMotion" aria-label={`Animation: ${animation.title}`}>
      <header>
        <div>
          <small>ANIMATED WALKTHROUGH</small>
          <strong>{animation.title}</strong>
        </div>
        <div className="reactMotionControls">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep((value) => Math.max(0, value - 1));
            }}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            aria-pressed={playing}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep((value) => Math.min(last, value + 1));
            }}
            disabled={step === last}
          >
            Next
          </button>
        </div>
      </header>
      <div className="reactMotionStage">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={current.note}>
          {edges.map((edge) => {
            const a = byId[edge.from];
            const b = byId[edge.to];
            const active =
              [current.from, current.to].sort().join("|") === [edge.from, edge.to].sort().join("|");
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                className={active ? "reactMotionEdge isActive" : "reactMotionEdge"}
              />
            );
          })}
          {nodes.map((node) => {
            const state =
              node.id === current.to ? " isTarget" : node.id === current.from ? " isSource" : "";
            return (
              <g
                key={node.id}
                className={`reactMotionNode${state}`}
                transform={`translate(${node.cx - NODE_W / 2} ${node.cy - NODE_H / 2})`}
              >
                <rect width={NODE_W} height={NODE_H} rx="8" />
                <text x={NODE_W / 2} y={node.sub ? 20 : 28}>
                  {node.label}
                </text>
                {node.sub && (
                  <text className="reactMotionSub" x={NODE_W / 2} y={35}>
                    {node.sub}
                  </text>
                )}
              </g>
            );
          })}
          <g
            key={step}
            className="reactMotionToken"
            style={{
              "--from-x": `${from.cx}px`,
              "--from-y": `${from.cy - NODE_H / 2}px`,
              "--to-x": `${to.cx}px`,
              "--to-y": `${to.cy - NODE_H / 2}px`,
            }}
          >
            <circle r="9" />
            {current.label && <text y="-14">{current.label}</text>}
          </g>
        </svg>
      </div>
      <ol className="reactMotionSteps">
        {animation.steps.map((item, index) => (
          <li key={item.note}>
            <button
              type="button"
              aria-current={index === step ? "step" : undefined}
              onClick={() => {
                setPlaying(false);
                setStep(index);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.note}
            </button>
          </li>
        ))}
      </ol>
      <p className="reactMotionCaption" role="status">
        Step {step + 1} of {animation.steps.length}: {current.note}
      </p>
    </figure>
  );
}
