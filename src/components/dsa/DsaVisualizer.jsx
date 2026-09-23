import { useEffect, useId, useMemo, useRef, useState } from "react";
import { runDsaAlgorithm } from "../../data/dsaAlgorithms.js";

function Cells({
  values = [],
  active = [],
  range,
  label = "Values",
  linked = false,
  stack = false,
}) {
  return (
    <div className={`dsaCells ${stack ? "dsaStack" : ""}`} role="list" aria-label={label}>
      {values.length === 0 && <span className="dsaEmpty">Empty</span>}
      {values.map((value, index) => (
        <div
          className="dsaCellUnit"
          key={index}
          role="listitem"
          aria-label={`Index ${index}: ${value ?? "empty"}${active.includes(index) ? ", active" : ""}`}
        >
          <div
            className={`dsaCell ${active.includes(index) ? "dsaActive" : ""} ${range && (index < range[0] || index >= range[1]) ? "dsaExcluded" : ""}`}
          >
            <small>{index}</small>
            <strong>{value ?? "∅"}</strong>
          </div>
          {linked && (
            <span className="dsaLink" aria-hidden="true">
              {index === values.length - 1 ? "→ ∅" : "→"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Network({ frame }) {
  const marker = useId().replaceAll(":", "");
  const container = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(660);
  useEffect(() => {
    const measure = () => setAvailableWidth(Math.max(260, container.current?.clientWidth || 660));
    measure();
    const observer = new window.ResizeObserver(measure);
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const values = frame.values || [];
  const isTree = frame.kind === "tree",
    hierarchy = isTree || frame.kind === "hierarchy";
  const edges = isTree
    ? values.flatMap((value, i) =>
        i && value !== null && values[Math.floor((i - 1) / 2)] !== null
          ? [[Math.floor((i - 1) / 2), i]]
          : [],
      )
    : frame.edges || [];
  const levels = Array(values.length).fill(0);
  if (isTree)
    values.forEach((_, i) => {
      levels[i] = Math.floor(Math.log2(i + 1));
    });
  else if (hierarchy) {
    // Authored hierarchy snapshots list parents before their children.
    for (const [parent, child] of edges) levels[child] = levels[parent] + 1;
  }
  const depth = Math.max(0, ...levels),
    height = hierarchy ? Math.max(180, 85 + depth * 90) : 360;
  const widestLevel = Math.max(
    1,
    ...Array.from(
      { length: depth + 1 },
      (_, level) => levels.filter((v, i) => v === level && values[i] !== null).length,
    ),
  );
  const width = hierarchy ? Math.max(availableWidth, (widestLevel + 1) * 72) : availableWidth;
  const positions = values.map((_, i) => {
    if (hierarchy) {
      const sameLevel = levels.flatMap((level, id) =>
        level === levels[i] && values[id] !== null ? [id] : [],
      );
      return {
        x: (width * (sameLevel.indexOf(i) + 1)) / (sameLevel.length + 1),
        y: 45 + levels[i] * 90,
      };
    }
    const angle = (2 * Math.PI * i) / Math.max(1, values.length) - Math.PI / 2;
    return {
      x: width / 2 + Math.cos(angle) * (width / 2 - 42),
      y: height / 2 + Math.sin(angle) * 125,
    };
  });
  return (
    <div
      className="dsaNetworkScroll"
      ref={container}
      tabIndex={0}
      role="region"
      aria-label="Scrollable node and edge diagram"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="dsaNetwork"
        style={{ minWidth: width }}
        role="img"
        aria-label={`${hierarchy ? "Tree" : "Graph"} state. ${frame.note}`}
      >
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {edges.map(([from, to, weight], i) => {
          const a = positions[from],
            b = positions[to];
          if (!a || !b) return null;
          const dx = b.x - a.x,
            dy = b.y - a.y,
            distance = Math.hypot(dx, dy) || 1;
          return (
            <g key={i} className="dsaEdge">
              <line
                x1={a.x + (dx / distance) * 26}
                y1={a.y + (dy / distance) * 26}
                x2={b.x - (dx / distance) * 28}
                y2={b.y - (dy / distance) * 28}
                markerEnd={!hierarchy && !frame.undirected ? `url(#${marker})` : undefined}
              />
              {weight !== undefined && (
                <text x={(a.x + b.x) / 2 + 8} y={(a.y + b.y) / 2 - 8}>
                  {weight}
                </text>
              )}
            </g>
          );
        })}
        {values.map((value, i) =>
          value === null ? null : (
            <g
              key={i}
              className={`dsaNode ${frame.active?.includes(i) ? "dsaNodeActive" : ""} ${frame.visited?.includes(i) ? "dsaNodeVisited" : ""}`}
            >
              <circle cx={positions[i].x} cy={positions[i].y} r={26} />
              <text x={positions[i].x} y={positions[i].y + 5}>
                {value}
              </text>
            </g>
          ),
        )}
      </svg>
      <details className="dsaDiagramText">
        <summary>Read the diagram as text</summary>
        <p>
          Nodes:{" "}
          {values
            .map((v, i) => (v === null ? null : `${i} = ${v}`))
            .filter(Boolean)
            .join("; ") || "empty"}
          .
        </p>
        <p>
          Edges:{" "}
          {edges
            .map(
              ([a, b, w]) =>
                `${a} ${frame.undirected ? "—" : "→"} ${b}${w === undefined ? "" : ` (weight ${w})`}`,
            )
            .join("; ") || "none"}
          .
        </p>
      </details>
    </div>
  );
}

function Matrix({ frame }) {
  return (
    <div className="dsaMatrixScroll" tabIndex={0} role="region" aria-label="Scrollable matrix">
      <table className="dsaMatrix">
        <caption>Rows and columns use zero-based indices</caption>
        <thead>
          <tr>
            <th scope="col">r / c</th>
            {frame.matrix[0]?.map((_, c) => (
              <th scope="col" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {frame.matrix.map((row, r) => (
            <tr key={r}>
              <th scope="row">{r}</th>
              {row.map((value, c) => (
                <td
                  key={c}
                  className={
                    frame.activeCell?.[0] === r && frame.activeCell?.[1] === c ? "dsaActive" : ""
                  }
                >
                  {value ?? "∅"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DsaVisualizer({ lesson }) {
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState(false);
  const canReverse = [
    "linearSearch",
    "insertionSort",
    "selectionSort",
    "bubbleSort",
    "mergeSort",
    "quickSort",
    "heapSort",
    "heapInsert",
    "radixSort",
    "countingSort",
    "reverseList",
  ].includes(lesson.algorithm);
  const input = useMemo(
    () =>
      variant && canReverse
        ? { ...lesson.input, values: [...lesson.input.values].reverse() }
        : lesson.input,
    [lesson.input, variant, canReverse],
  );
  const run = useMemo(() => runDsaAlgorithm(lesson.algorithm, input), [lesson.algorithm, input]);
  const frames = run.frames.length
    ? run.frames
    : [{ values: [], note: "The base case returns without an iteration." }];
  const currentStep = Math.min(step, frames.length - 1),
    frame = frames[currentStep];
  return (
    <div className="dsaVisualizer">
      <div className="dsaVisualizerHeading">
        <h3>Step-by-step visual lab</h3>
        <span>{frames.length} recorded steps</span>
      </div>
      <p className="dsaLabHint">
        Each step is a state emitted by the implementation below. Highlighted cells or nodes are
        active; faded array cells are outside the current search interval.
      </p>
      {canReverse && (
        <label className="dsaVariant">
          <input
            type="checkbox"
            checked={variant}
            onChange={(event) => {
              setVariant(event.target.checked);
              setStep(0);
            }}
          />{" "}
          Try the same values in reverse order
        </label>
      )}
      <div className="dsaControls" role="group" aria-label="Algorithm step controls">
        <button type="button" onClick={() => setStep(0)} disabled={currentStep === 0}>
          Reset
        </button>
        <button type="button" onClick={() => setStep(currentStep - 1)} disabled={currentStep === 0}>
          Previous step
        </button>
        <button
          type="button"
          onClick={() => setStep(currentStep + 1)}
          disabled={currentStep === frames.length - 1}
        >
          Next step
        </button>
        <button
          type="button"
          onClick={() => setStep(frames.length - 1)}
          disabled={currentStep === frames.length - 1}
        >
          Last step
        </button>
      </div>
      <label className="dsaScrubber">
        Step {currentStep + 1} of {frames.length}
        <input
          type="range"
          aria-label="Algorithm step"
          min="0"
          max={frames.length - 1}
          value={currentStep}
          onChange={(event) => setStep(Number(event.target.value))}
        />
      </label>
      <div className="dsaStage">
        {frame.kind === "matrix" ? (
          <Matrix frame={frame} />
        ) : ["tree", "graph", "hierarchy"].includes(frame.kind) ? (
          <Network frame={frame} />
        ) : (
          <Cells
            values={frame.values}
            active={frame.active}
            range={frame.range}
            linked={frame.kind === "linked"}
            stack={frame.kind === "stack"}
          />
        )}
        {frame.auxiliary && (
          <div className="dsaAuxiliary">
            <small>Working state / output so far</small>
            <Cells values={frame.auxiliary} label="Auxiliary state" />
          </div>
        )}
      </div>
      <p className="dsaStepNote" aria-live="polite" aria-atomic="true">
        <strong>Step {currentStep + 1}.</strong> {frame.note}
      </p>
      <details className="dsaResult">
        <summary>Check the complete result</summary>
        <pre>
          <code>{JSON.stringify(run.result, null, 2)}</code>
        </pre>
      </details>
    </div>
  );
}
