import { useEffect, useMemo, useRef, useState } from "react";
import RichText from "./RichText";
import { edgePath, layoutMotion, listEdges, NODE_H, WIDTH } from "./motionLayout";
import "./SystemDesignMotion.css";

const reducedMotion = () =>
  typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const plain = (text) => text.replace(/[`*]/g, "");

/**
 * Step-by-step simulation. Each step moves a token between nodes, updates the
 * state written inside the nodes, and explains what just happened.
 */
export default function SystemDesignMotion({ animation, id }) {
  const { title, columns, steps } = animation;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const container = useRef(null);
  const { nodes, height, nodeWidth } = useMemo(() => layoutMotion(columns), [columns]);
  const edges = useMemo(() => listEdges(steps), [steps]);
  const current = steps[step];
  const last = steps.length - 1;

  // Node state is the sum of every change up to the current step.
  const state = useMemo(
    () => Object.assign({}, ...steps.slice(0, step + 1).map((item) => item.changes)),
    [steps, step],
  );

  useEffect(() => {
    setPlaying(!reducedMotion());
    const observer = new window.IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return undefined;
    // Leave enough time to read the note before moving on.
    const duration = Math.max(4200, current.note.split(" ").length * 270);
    const timer = window.setTimeout(() => {
      if (step === last) setPlaying(false);
      else setStep(step + 1);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [playing, visible, step, last, current]);

  const go = (index) => {
    setPlaying(false);
    setStep(Math.min(last, Math.max(0, index)));
  };
  const toggle = () => {
    if (!playing && step === last) setStep(0);
    setPlaying(!playing);
  };

  return (
    <figure id={id} className="sdMotion" ref={container} aria-label={`Simulation: ${title}`}>
      <header>
        <div>
          <small>STEP-BY-STEP SIMULATION</small>
          <strong>{title}</strong>
        </div>
        <div className="sdMotionControls">
          <button type="button" onClick={() => go(step - 1)} disabled={step === 0}>
            ‹ Back
          </button>
          <button type="button" className="sdMotionPlay" onClick={toggle} aria-pressed={playing}>
            {playing ? "Pause" : step === last ? "Replay" : "Play"}
          </button>
          <button type="button" onClick={() => go(step + 1)} disabled={step === last}>
            Next ›
          </button>
        </div>
      </header>
      <div className="sdMotionStage">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={plain(current.note)}>
          {edges.map((edge) => {
            const active =
              (edge.from === current.from && current.to.includes(edge.to)) ||
              (edge.to === current.from && current.to.includes(edge.from));
            return (
              <path
                key={edge.key}
                d={edgePath(nodes[edge.from], nodes[edge.to], nodes, nodeWidth)}
                className={active ? "sdMotionEdge isActive" : "sdMotionEdge"}
              />
            );
          })}
          {Object.values(nodes).map((node) => {
            const now = state[node.id];
            const sub = now ? now.sub : node.sub;
            let role = "";
            if (current.to.includes(node.id)) role = " isTarget";
            else if (node.id === current.from) role = " isSource";
            return (
              <g
                key={node.id}
                className={`sdMotionNode${role}${now?.mood ? ` is-${now.mood}` : ""}`}
                transform={`translate(${node.cx - nodeWidth / 2} ${node.cy - NODE_H / 2})`}
              >
                <rect width={nodeWidth} height={NODE_H} rx="9" />
                <text x={nodeWidth / 2} y={sub ? 21 : 30}>
                  {node.label}
                </text>
                {sub && (
                  <text className="sdMotionSub" x={nodeWidth / 2} y={38}>
                    {sub}
                  </text>
                )}
              </g>
            );
          })}
          {current.to.map((to) => {
            const a = nodes[current.from];
            // On a vertical move the label sits beside the token instead of over a node.
            const sideways = to !== current.from && a.column === nodes[to].column;
            const path =
              to === current.from
                ? `M ${a.cx} ${a.cy - NODE_H / 2 + 8} L ${a.cx} ${a.cy - NODE_H / 2 - 9}`
                : edgePath(a, nodes[to], nodes, nodeWidth);
            return (
              <g
                key={`${step}-${to}`}
                className="sdMotionToken"
                style={{ offsetPath: `path("${path}")` }}
              >
                <circle r="8" />
                {current.token && (
                  <g transform={sideways ? `translate(${current.token.length * 3.2 + 22} 0)` : "translate(0 -21)"}>
                    <rect
                      x={-(current.token.length * 3.2 + 8)}
                      y="-9"
                      width={current.token.length * 6.4 + 16}
                      height="18"
                      rx="9"
                    />
                    <text y="4">{current.token}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="sdMotionNow" role="status" aria-live={playing ? "off" : "polite"}>
        <small>
          STEP {step + 1} / {steps.length}
        </small>
        <p>
          <RichText text={current.note} />
        </p>
      </div>
      <ol className="sdMotionSteps">
        {steps.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              aria-current={index === step ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${plain(item.note)}`}
              onClick={() => go(index)}
            >
              <span>{index + 1}</span>
              {item.token || nodes[item.from].label}
            </button>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** The same diagram as a still picture with numbered connections. */
export function SystemDesignFigure({ animation, caption }) {
  const { nodes, height, nodeWidth } = layoutMotion(animation.columns);
  return (
    <figure className="fig">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption}>
        {listEdges(animation.steps).map((edge) => {
          const a = nodes[edge.from];
          const b = nodes[edge.to];
          const d = edgePath(a, b, nodes, nodeWidth);
          const bend = d.match(/Q ([\d.-]+) ([\d.-]+)/)?.slice(1).map(Number);
          const x = bend ? (a.cx + 2 * bend[0] + b.cx) / 4 : (a.cx + b.cx) / 2;
          const y = bend ? (a.cy + 2 * bend[1] + b.cy) / 4 : (a.cy + b.cy) / 2;
          return (
            <g key={edge.key}>
              <path className="flow" d={d} fill="none" style={{ markerEnd: "none" }} />
              <circle className="ringNode" cx={x} cy={y} r="10" />
              <text className="figStepNo" x={x} y={y + 4} textAnchor="middle">
                {edge.first}
              </text>
            </g>
          );
        })}
        {Object.values(nodes).map((node) => (
          <g key={node.id}>
            <rect
              className="box"
              x={node.cx - nodeWidth / 2}
              y={node.cy - NODE_H / 2}
              width={nodeWidth}
              height={NODE_H}
              rx="9"
            />
            <text className="boxText" x={node.cx} y={node.cy + (node.sub ? -2 : 4)} textAnchor="middle">
              {node.label}
            </text>
            {node.sub && (
              <text className="figHint" x={node.cx} y={node.cy + 15} textAnchor="middle">
                {node.sub}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
