import { useId, useState } from "react";
import {
  javaAlgorithmTechniques,
  javaTechniqueRoadmap,
  javaTechniqueSource,
} from "../../data/javaAlgorithmTechniques.js";
import "./JavaAlgorithmGuide.css";

const extensions = [
  [
    "String matching",
    "KMP tracks the longest matched prefix and falls back through a prefix-function table: O(n+m). Use it for repeated literal pattern search; rolling hashes need collision checks.",
  ],
  [
    "Range queries",
    "Prefix sums: O(n) build and O(1) static sum query. Fenwick tree: O(log n) point update/prefix query. Segment tree: O(log n) point update/range query for an associative combine operation.",
  ],
  [
    "Sequence DP",
    "LCS uses dp[i][j] from shorter prefixes in O(nm). LIS can use minimum tails and lower bounds in O(n log n); tails alone do not reconstruct the subsequence.",
  ],
  [
    "Sweep lines and intervals",
    "Sort start/end events and maintain an active count for overlap problems. Specify whether endpoints touch; process ends before starts for half-open bookings.",
  ],
  [
    "Shortest-path variants",
    "0–1 BFS uses a deque for weights 0/1. Bellman–Ford handles negative edges and detects reachable negative cycles in O(VE). Floyd–Warshall computes all-pairs distances in O(V³).",
  ],
  [
    "Counting and radix sorting",
    "Counting sort costs O(n+K) for a bounded key range K. Radix sort processes digits in stable passes; account for signed values, digit width, and extra storage.",
  ],
  [
    "Search-space reductions",
    "Meet-in-the-middle splits a small exponential search into two O(2^(n/2)) collections. Branch-and-bound needs an admissible bound; pruning with an unjustified estimate can remove the optimum.",
  ],
  [
    "Mathematical techniques",
    "Euclid uses gcd(a,b)=gcd(b,a%b) until b=0. Exponentiation by squaring halves the exponent each step. Modular multiplication can overflow long before applying the modulus; use a proven bound or BigInteger.",
  ],
];

function TechniqueDetail({ item }) {
  const [step, setStep] = useState(0);
  const frame = item.steps[step];
  return (
    <div className="javaTechniqueDetail">
      <h3>{item.title}</h3>
      <p>
        <strong>Recognition signal:</strong> {item.signal}
      </p>
      <aside className="dsaInvariant">
        <h4>Why it works</h4>
        <p>{item.invariant}</p>
      </aside>
      <p>
        <strong>Cost and assumptions:</strong> {item.complexity}
      </p>
      <div className="javaTrace" aria-label={`${item.title} walkthrough`}>
        <h4>Step-by-step visual walkthrough</h4>
        <p className="dsaTraceCost">
          Illustrated states for the example below. Java runs locally; these walkthroughs are
          authored teaching diagrams.
        </p>
        <div aria-live="polite" aria-atomic="true">
          <p>
            Step {step + 1} of {item.steps.length}
          </p>
          <pre aria-label="Algorithm state">{frame[0]}</pre>
          <p>{frame[1]}</p>
        </div>
        <div className="javaTraceControls">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Previous step
          </button>
          <button
            type="button"
            disabled={step === item.steps.length - 1}
            onClick={() => setStep(step + 1)}
          >
            Next step
          </button>
          <button type="button" disabled={step === 0} onClick={() => setStep(0)}>
            Reset
          </button>
        </div>
      </div>
      <h4>Complete Java example</h4>
      <p>
        Save as <code>Main.java</code>, then run <code>javac Main.java</code> and{" "}
        <code>java Main</code>. Requires Java 8 or newer. The browser does not compile Java.
      </p>
      <pre className="dsaSource">
        <code>{javaTechniqueSource(item)}</code>
      </pre>
      <p>
        <strong>Expected output</strong>
      </p>
      <pre>
        <code>{item.expected}</code>
      </pre>
      <h4>Use it in project development</h4>
      <p>{item.project}</p>
      <h4>Interview traps and Java details</h4>
      <p>{item.pitfall}</p>
      <h4>Practice progression</h4>
      <p>{item.practice}</p>
      <details>
        <summary>Boundary checks to run after the worked example</summary>
        <p>
          Each expression should evaluate to <code>true</code>. Put these inside <code>main</code>{" "}
          and throw <code>AssertionError</code> when a condition is false.
        </p>
        <pre>
          <code>{item.checks.join("\n")}</code>
        </pre>
      </details>
    </div>
  );
}

export default function JavaAlgorithmGuide({ courseSlug }) {
  const recommended = javaAlgorithmTechniques.filter((item) => item.course === courseSlug);
  const [selected, setSelected] = useState((recommended[0] || javaAlgorithmTechniques[0]).id);
  const selectId = useId();
  const item = javaAlgorithmTechniques.find((entry) => entry.id === selected);
  return (
    <section id="java-algorithm-techniques" className="javaAlgorithmGuide">
      <p className="dsaEyebrow">Java · Interview preparation + project development</p>
      <h2>Algorithm techniques in Java</h2>
      <p>
        Work through {javaAlgorithmTechniques.length} core techniques with complete programs,
        proofs, visual steps, complexity analysis, and practical trade-offs. Start with the examples
        for this course, then use the full pattern selector to connect techniques across topics.
      </p>
      <details>
        <summary>A six-step problem-solving workflow</summary>
        <ol>
          {javaTechniqueRoadmap.map(([title, body]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </details>
      <div className="javaTechniquePicker">
        <label htmlFor={selectId}>Choose a technique</label>
        <select
          id={selectId}
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {recommended.length > 0 && (
            <optgroup label="Related to this course">
              {recommended.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="All other techniques">
            {javaAlgorithmTechniques
              .filter((entry) => !recommended.includes(entry))
              .map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title}
                </option>
              ))}
          </optgroup>
        </select>
      </div>
      <TechniqueDetail key={item.id} item={item} />
      <details>
        <summary>Interview study plan and practice checkpoints</summary>
        <ol>
          <li>
            <strong>Week 1:</strong> Arrays, hashing, prefix sums, two pointers, windows, and binary
            search. Derive each optimized solution from brute force.
          </li>
          <li>
            <strong>Week 2:</strong> Sorting, recursion, backtracking, stacks, and heaps. Trace
            state restoration and amortized costs.
          </li>
          <li>
            <strong>Week 3:</strong> BFS, DFS reasoning, dependency ordering, Dijkstra, union-find,
            and greedy proofs. Distinguish trees, DAGs, and general graphs.
          </li>
          <li>
            <strong>Week 4:</strong> DP states, transitions, initialization, dependency order, and
            reconstruction. Mix unfamiliar problems and revisit errors.
          </li>
        </ol>
        <p>
          For a 45-minute mock interview, budget roughly 5 minutes for clarification, 10 for
          examples and approach, 20 for implementation, and 10 for tests and trade-offs. Explain a
          correct brute-force solution before optimizing; adjust to the interviewer’s priorities.
        </p>
        <p>
          For each technique, solve one direct problem, one variation, and one mixed problem without
          looking at the implementation. Keep an error log of the failed assumption, the smallest
          counterexample, and the corrected invariant.
        </p>
      </details>
      <details>
        <summary>Project exercises with acceptance criteria</summary>
        <ul>
          <li>
            <strong>Booking planner:</strong> Implement half-open interval selection and a separate
            overlap counter. Verify touching bookings, invalid ranges, and time-zone normalization;
            compare maximum count with exhaustive subsets on small input.
          </li>
          <li>
            <strong>Dependency runner:</strong> Produce a topological plan, reject cycles, and
            report disconnected tasks. Keep execution separate from planning and release dependents
            only after prerequisites succeed.
          </li>
          <li>
            <strong>Route service:</strong> Validate vertices and nonnegative costs, run Dijkstra,
            reconstruct a route, and return an explicit unreachable result. Compare tiny graphs
            against an independent all-pairs solver.
          </li>
          <li>
            <strong>Analytics pipeline:</strong> Compare prefix-sum range queries and a bounded
            top-k heap with naive baselines. Measure build time, query latency, memory, and behavior
            as data grows.
          </li>
        </ul>
        <p>
          Keep algorithms pure where possible; make mutation explicit. Validate external input at
          the boundary, set memory and time limits, and benchmark with warmup. Thread safety and
          distributed consistency are separate from sequential algorithm correctness.
        </p>
      </details>
      <details>
        <summary>Further techniques and when to study them</summary>
        <p>
          The worked programs cover core reusable patterns. These extensions form the next layer;
          this is a study roadmap, not a claim to enumerate every algorithm.
        </p>
        <dl>
          {extensions.map(([title, body]) => (
            <div key={title}>
              <dt>
                <strong>{title}</strong>
              </dt>
              <dd>{body}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
