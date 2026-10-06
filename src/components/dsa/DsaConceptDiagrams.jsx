import { useState } from "react";

function NodeDiagram({ nodes, edges, description, active = [] }) {
  return (
    <svg className="dsaTeachingDiagram" viewBox="0 0 520 250" role="img" aria-label={description}>
      <title>{description}</title>
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a][1]}
          y1={nodes[a][2]}
          x2={nodes[b][1]}
          y2={nodes[b][2]}
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
      {nodes.map(([label, x, y], index) => (
        <g key={label}>
          <circle
            cx={x}
            cy={y}
            r="25"
            fill={active.includes(index) ? "var(--dsa-active, #22c55e)" : "var(--surface)"}
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill={active.includes(index) ? "#07140b" : "currentColor"}
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function DsaConceptDiagrams() {
  const [kind, setKind] = useState("memory");
  const [step, setStep] = useState(0);
  const limits = { memory: 3, rotation: 1, graph: 3, dp: 6 };
  const dp = [0, 1, 2, 1, 1, 2, 2];
  const graphNotes = [
    "Start with A discovered at distance 0. Queue: [A]. Edges are undirected and unweighted.",
    "Remove A and discover B then C, both at distance 1. Queue: [B, C]. Mark on enqueue, not on removal.",
    "Remove B and discover D at distance 2. Queue: [C, D]. Removing C next does not enqueue D again, because it is already discovered.",
    "Remove D. All reachable vertices are processed and the queue is empty. One shortest A-to-D route is A → B → D; A → C → D is equally short.",
  ];
  return (
    <section id="concept-diagrams">
      <h2>See the structure</h2>
      <label className="dsaField">
        Choose a diagram
        <select
          value={kind}
          onChange={(event) => {
            setKind(event.target.value);
            setStep(0);
          }}
        >
          <option value="memory">Array memory addresses</option>
          <option value="rotation">Binary search tree rotation</option>
          <option value="graph">Breadth-first traversal</option>
          <option value="dp">Dynamic-programming table</option>
        </select>
      </label>
      <div className="dsaDiagramPanel" aria-live="polite">
        {kind === "memory" && (
          <>
            <h3>Contiguous fixed-width storage</h3>
            <div className="dsaMemoryRow">
              {[12, 7, 19, 5].map((value, i) => (
                <div key={i} className={i === step ? "selected" : ""}>
                  <small>index {i}</small>
                  <strong>{value}</strong>
                  <code>address {1000 + i * 4}</code>
                  {i === step && <span>selected</span>}
                </div>
              ))}
            </div>
            <p>
              With base address 1000 and a four-byte element width, index {step} is at 1000 + {step}{" "}
              × 4 = <strong>{1000 + step * 4}</strong>. Adjacent slots have no gaps. This is a
              fixed-width array model, not a claim about JavaScript engine storage.
            </p>
          </>
        )}
        {kind === "rotation" && (
          <>
            <h3>{step === 0 ? "Before: a left-heavy chain" : "After: rotate right at 30"}</h3>
            <NodeDiagram
              nodes={
                step === 0
                  ? [
                      ["30", 350, 45],
                      ["20", 250, 125],
                      ["10", 150, 205],
                    ]
                  : [
                      ["20", 260, 45],
                      ["10", 150, 145],
                      ["30", 370, 145],
                    ]
              }
              edges={
                step === 0
                  ? [
                      [0, 1],
                      [1, 2],
                    ]
                  : [
                      [0, 1],
                      [0, 2],
                    ]
              }
              active={[0]}
              description={
                step === 0
                  ? "Tree root 30 has left child 20, whose left child is 10."
                  : "Rotated tree root 20 has left child 10 and right child 30."
              }
            />
            <p>
              {step === 0
                ? "Inserting 30, 20, 10 creates a chain in an ordinary BST. Searching for 10 visits three nodes. A balancing algorithm can repair this left-left case with a right rotation."
                : "Promote 20 and make 30 its right child. In-order traversal remains [10, 20, 30], so search ordering is preserved. If 20 originally had a right subtree, it would become 30's left subtree. AVL implementations also update heights after rotating."}
            </p>
          </>
        )}
        {kind === "graph" && (
          <>
            <h3>BFS discovery layers</h3>
            <NodeDiagram
              nodes={[
                ["A", 260, 40],
                ["B", 150, 125],
                ["C", 370, 125],
                ["D", 260, 210],
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [1, 3],
                [2, 3],
              ]}
              active={step === 0 ? [0] : step === 1 ? [0, 1, 2] : [0, 1, 2, 3]}
              description={`Graph A—B, A—C, B—D, C—D. ${graphNotes[step]}`}
            />
            <p>Filled nodes have been discovered. {graphNotes[step]}</p>
          </>
        )}
        {kind === "dp" && (
          <>
            <h3>Minimum coins: denominations 1, 3, and 4</h3>
            <div className="dsaCaseTable">
              <table>
                <caption>dp[a] = minimum coins to make exactly amount a</caption>
                <thead>
                  <tr>
                    <th scope="col">Amount</th>
                    {dp.map((_, i) => (
                      <th scope="col" key={i}>
                        {i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Minimum coins</th>
                    {dp.map((value, i) => (
                      <td key={i} className={i === step ? "dsaCurrentCell" : ""}>
                        {i <= step ? value : "?"}
                        {i === step && <span className="dsaCellLabel">current</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              {step === 0
                ? "The base case is dp[0] = 0: zero coins make zero. Other amounts have not been computed yet."
                : `For amount ${step}, compare ${[1, 3, 4]
                    .filter((c) => c <= step)
                    .map((c) => `coin ${c}: dp[${step - c}] + 1 = ${dp[step - c] + 1}`)
                    .join(
                      "; ",
                    )}. The minimum is ${dp[step]}. Each dependency is a smaller, already-computed amount.`}
            </p>
            <p>
              At amount 6, two 3-coins beat the greedy choice 4 + 1 + 1. The table stores reusable
              answers, not every possible combination.
            </p>
          </>
        )}
      </div>
      <div className="dsaControls">
        <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Previous diagram
        </button>
        <span>
          State {step + 1} of {limits[kind] + 1}
        </span>
        <button type="button" disabled={step === limits[kind]} onClick={() => setStep(step + 1)}>
          Next diagram
        </button>
      </div>
    </section>
  );
}
