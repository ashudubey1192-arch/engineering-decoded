import { useState } from "react";
import DsaVisualizer from "./DsaVisualizer.jsx";
import { parseLabValues, compareSearch, compareSort } from "../../data/dsaPlayground.js";

export default function DsaPlayground() {
  const [mode, setMode] = useState("search");
  const [values, setValues] = useState("1, 3, 5, 7, 9");
  const [target, setTarget] = useState("7");
  const [error, setError] = useState("");
  const [run, setRun] = useState(null);
  function apply(event) {
    event.preventDefault();
    try {
      const parsed = parseLabValues(values);
      const targetValues = mode === "search" ? parseLabValues(target) : [0];
      if (targetValues.length !== 1) throw new Error("Enter exactly one target integer.");
      if (mode === "search" && parsed.some((value, i) => i > 0 && value < parsed[i - 1]))
        throw new Error(
          "Search comparison requires values sorted from smallest to largest. Sort your input or switch to sorting.",
        );
      setRun({ mode, values: parsed, target: targetValues[0], version: (run?.version || 0) + 1 });
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  const results =
    run &&
    (run.mode === "search"
      ? compareSearch(run.values, run.target)
      : run.mode === "sort"
        ? compareSort(run.values)
        : null);
  const algorithms =
    run?.mode === "search"
      ? [
          ["linearSearch", "Linear search"],
          ["binarySearch", "Binary search"],
        ]
      : run?.mode === "sort"
        ? [
            ["bubbleSort", "Bubble sort"],
            ["insertionSort", "Insertion sort"],
          ]
        : [["reverseList", "Linked-list reversal"]];
  return (
    <section id="interactive-playground">
      <h2>Experiment and compare</h2>
      <p>
        Try duplicates, missing targets, reversed values, or an empty sequence. Run your input, then
        step through each algorithm independently.
      </p>
      <form onSubmit={apply} className="dsaLabForm">
        <label className="dsaField">
          Experiment
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              setError("");
            }}
          >
            <option value="search">Linear vs binary search</option>
            <option value="sort">Bubble vs insertion sort</option>
            <option value="linked">Reverse linked-list pointers</option>
          </select>
        </label>
        <label className="dsaField">
          Values (comma-separated; leave blank for empty)
          <input
            value={values}
            maxLength={150}
            onChange={(event) => setValues(event.target.value)}
          />
        </label>
        {mode === "search" && (
          <label className="dsaField">
            Target
            <input
              value={target}
              maxLength={6}
              onChange={(event) => setTarget(event.target.value)}
            />
          </label>
        )}
        <div className="dsaControls">
          <button type="submit">Run visual experiment</button>
        </div>
      </form>
      {error && (
        <p role="alert" className="dsaLabError">
          {error}
        </p>
      )}
      {run && (
        <div>
          <p role="status">
            Showing the last submitted {run.mode === "linked" ? "linked-list" : run.mode}{" "}
            experiment: [{run.values.join(", ")}]
            {run.mode === "search" ? `; target ${run.target}` : ""}.
          </p>
          {results && (
            <>
              <div className="dsaCaseTable">
                <table>
                  <caption>Value comparisons on the same input</caption>
                  <thead>
                    <tr>
                      <th scope="col">Algorithm</th>
                      <th scope="col">Comparisons</th>
                      <th scope="col">Result</th>
                      <th scope="col">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item.name}>
                        <th scope="row">{item.name}</th>
                        <td>{item.comparisons}</td>
                        <td>{JSON.stringify(item.result)}</td>
                        <td>{item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Counts include comparisons between values
                {run.mode === "search" ? ", including binary search’s final equality check" : ""}.
                They exclude index checks, assignments, rendering, and preprocessing. These are
                operation counts, not timing benchmarks. A smaller count on one input does not
                establish a better worst-case bound.
              </p>
            </>
          )}
          {algorithms.map(([algorithm, title]) => (
            <div key={algorithm}>
              <h3>{title}</h3>
              <DsaVisualizer
                key={`${run.version}/${algorithm}`}
                lesson={{ algorithm, input: { values: run.values, target: run.target } }}
                allowReverse={false}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
