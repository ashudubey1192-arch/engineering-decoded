import { useState } from "react";
import { javaNetworkLessons, javaNetworkReferences } from "../../../../data/javaNetworkLessons";
import { javaNetworkPrograms } from "../../../../data/javaNetworkPrograms";
import "../css/JavaNetworkLesson.css";

function NodeDiagram({ id, step }) {
  const treeIds = ["model", "dfs", "levels", "paths", "lca", "codec"];
  const isTree = treeIds.includes(id);
  if (!isTree && !["bfs", "topo", "dijkstra"].includes(id)) return null;
  const nodes = isTree
    ? [
        [4, 260, 35],
        [2, 150, 115],
        [7, 370, 115],
        [1, 85, 195],
        [3, 215, 195],
      ]
    : id === "dijkstra"
      ? [
          [0, 90, 110],
          [1, 420, 45],
          [2, 280, 185],
        ]
      : [
          [0, 80, 110],
          [1, 260, 40],
          [2, 260, 180],
          [3, 440, 110],
        ];
  const edges = isTree
    ? [
        [4, 2],
        [4, 7],
        [2, 1],
        [2, 3],
      ]
    : id === "dijkstra"
      ? [
          [0, 1, 4],
          [0, 2, 1],
          [2, 1, 2],
        ]
      : [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
        ];
  const active =
    id === "levels"
      ? [[4], [2, 7], [1, 3]][step]
      : id === "model"
        ? [[4], [1, 3, 7], [2, 4]][step]
        : id === "dfs"
          ? [
              [4, 2, 1],
              [1, 2],
              [3, 4, 7],
            ][step]
          : id === "lca"
            ? [[1, 3], [2], [2]][step]
            : id === "paths"
              ? [[1, 3, 7], [2], [4]][step]
              : id === "codec"
                ? [[4, 2, 1, 3, 7], [2], [7]][step]
                : id === "dijkstra"
                  ? [[0], [1, 2], [1]][step]
                  : [[0], [1, 2], [3]][step];
  return (
    <figure className="jnFigure">
      <svg
        viewBox="0 0 520 235"
        role="img"
        aria-label={`${isTree ? "Binary tree" : "Directed graph"}; highlighted nodes ${active.join(", ")}. Connections are described in the example state below.`}
      >
        <defs>
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {edges.map(([from, to, weight]) => {
          const a = nodes.find(([value]) => value === from),
            b = nodes.find(([value]) => value === to);
          const dx = b[1] - a[1],
            dy = b[2] - a[2],
            distance = Math.hypot(dx, dy);
          return (
            <g key={`${from}-${to}`}>
              <line
                x1={a[1] + (dx * 23) / distance}
                y1={a[2] + (dy * 23) / distance}
                x2={b[1] - (dx * 26) / distance}
                y2={b[2] - (dy * 26) / distance}
                stroke="currentColor"
                strokeWidth="2"
                markerEnd={isTree ? undefined : `url(#arrow-${id})`}
              />
              {weight !== undefined && (
                <text
                  x={(a[1] + b[1]) / 2}
                  y={(a[2] + b[2]) / 2 - 10}
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {weight}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map(([value, x, y]) => (
          <g key={value}>
            <circle
              cx={x}
              cy={y}
              r="22"
              className={active.includes(value) ? "jnNodeActive" : "jnNode"}
              strokeWidth="2"
            />
            <text
              x={x}
              y={y + 6}
              textAnchor="middle"
              fill={active.includes(value) ? "#08110a" : "currentColor"}
              fontSize="18"
              fontWeight="700"
            >
              {value}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Highlighted nodes: {active.join(", ")}.{" "}
        {isTree ? "Lines connect parents to children." : "Arrows show edge direction."}
      </figcaption>
    </figure>
  );
}

function Walkthrough({ lesson }) {
  const [step, setStep] = useState(0);
  const current = lesson.steps[step];
  return (
    <div className="jnWalkthrough">
      <div className="jnStepHeading">
        <strong>Worked example</strong>
        <span>
          Step {step + 1} of {lesson.steps.length}
        </span>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <NodeDiagram id={lesson.id} step={step} />
        <pre className="jnDiagram" aria-label="Current example state">
          {current.state}
        </pre>
        <p>{current.explanation}</p>
      </div>
      <div className="jnControls">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Previous
        </button>
        <button onClick={() => setStep(0)} disabled={step === 0}>
          Reset
        </button>
        <button disabled={step === lesson.steps.length - 1} onClick={() => setStep(step + 1)}>
          Next step →
        </button>
      </div>
      <details>
        <summary>Read every step</summary>
        <ol>
          {lesson.steps.map((item, index) => (
            <li key={index}>
              <pre>{item.state}</pre>
              <p>{item.explanation}</p>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

export default function JavaNetworkLesson({ lessonId }) {
  const lesson = javaNetworkLessons.find((item) => item.id === lessonId);
  if (!lesson) return <p>Lesson unavailable.</p>;
  return (
    <div className="dedicatedStructuredArticle jnLesson">
      <section id="overview">
        <p className="jnEyebrow">JAVA 21+ · LEARN → TRACE → CODE → APPLY</p>
        <p className="lead">{lesson.title}</p>
        <p>{lesson.concept}</p>
        <p className="jnPrerequisites">
          Prerequisites: methods, references, arrays, collections and basic recursion. Budget about
          25 minutes plus practice. Examples are displayed here; run Java locally.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Reason about correctness</h2>
        <div className="jnInvariant">
          <strong>Invariant</strong>
          <p>{lesson.invariant}</p>
        </div>
        <h3>Time and space</h3>
        <p>{lesson.complexity}</p>
      </section>
      <section id="example">
        <h2>2. Walk through the example</h2>
        <Walkthrough key={lesson.id} lesson={lesson} />
        <h2>3. Run the Java implementation</h2>
        <p>
          Save the complete program below as <code>Main.java</code>. In that folder, compile and run
          with a JDK 21 or newer:
        </p>
        <pre>
          <code>javac --release 21 Main.java{"\n"}java Main</code>
        </pre>
        <details className="jnSource" open>
          <summary>Complete Java source</summary>
          <pre>
            <code>{javaNetworkPrograms[lesson.id]}</code>
          </pre>
        </details>
        <h3>Expected output</h3>
        <pre>
          <code>{lesson.expected}</code>
        </pre>
        <p>
          Trace the variables by hand, run the example, then change one input and predict the result
          before rerunning.
        </p>
      </section>
      <section id="mistakes">
        <h2>4. Edge cases and common mistakes</h2>
        <p>{lesson.pitfalls}</p>
      </section>
      <section id="check">
        <h2>5. Interview practice</h2>
        <p>{lesson.exercise}</p>
        <details className="jnAnswer" key={lesson.id}>
          <summary>Reveal reasoning</summary>
          <p>{lesson.answer}</p>
        </details>
        <h2>6. Apply it in a project</h2>
        <p>{lesson.project}</p>
        <h3>Before moving on</h3>
        <ul>
          <li>Explain the invariant without reading the code.</li>
          <li>Trace a boundary case and state what the API should return.</li>
          <li>Describe the implementation’s time, memory and input assumptions.</li>
        </ul>
        <h3>Official Java references</h3>
        <ul>
          {javaNetworkReferences.map(([title, url]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                {title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
