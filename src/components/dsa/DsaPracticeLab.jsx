/* global URL, Worker */
import { useEffect, useRef, useState } from "react";
import { dsaPractice, dsaPracticeTopics, practiceTopic } from "../../data/dsaPractice.js";
import { getSession } from "../../services/api.js";
import { updateDsaProgress, useDsaProgress, recordDsaQuiz } from "../../services/dsaProgress.js";

export function Challenge({
  problem,
  interview = false,
  locked = false,
  onResult,
  draftKey = problem.id,
}) {
  const progress = useDsaProgress();
  const [code, setCode] = useState(() =>
    typeof progress.drafts[draftKey] === "string" ? progress.drafts[draftKey] : problem.starter,
  );
  const [choice, setChoice] = useState(-1);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const savedCode = progress.drafts[draftKey];
  useEffect(() => {
    if (typeof savedCode === "string" && !busy) setCode(savedCode);
  }, [savedCode, busy]);
  const task = useRef(null);
  const stop = () => {
    if (task.current) {
      task.current.worker.terminate();
      window.clearTimeout(task.current.timer);
      task.current = null;
    }
  };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (locked) {
      stop();
      setBusy(false);
    }
  }, [locked]);
  const run = () => {
    stop();
    setBusy(true);
    setError("");
    setResults(null);
    try {
      const worker = new Worker(new URL("./dsaPractice.worker.js", import.meta.url), {
        type: "module",
      });
      const fail = (message) => {
        stop();
        setBusy(false);
        setError(message);
      };
      const timer = window.setTimeout(
        () =>
          fail("Run stopped after 2 seconds. Check for an infinite loop or a missing base case."),
        2000,
      );
      task.current = { worker, timer };
      worker.onerror = () =>
        fail(
          "The program could not run. Check the code and whether your browser permits Web Workers.",
        );
      worker.onmessage = ({ data }) => {
        stop();
        setBusy(false);
        if ((getSession()?.user?.id || "guest") !== progress.owner) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        setResults(data.results);
        onResult?.(data.results);
        if (
          data.results.length === problem.tests.length &&
          data.results.every((item) => item.passed)
        ) {
          updateDsaProgress("solved", problem.id, true);
        }
      };
      worker.postMessage({ code, tests: problem.tests });
    } catch (e) {
      stop();
      setBusy(false);
      setError(`Unable to start the runner: ${e.message}`);
    }
  };
  return (
    <div className="dsaChallenge">
      <p className="dsaEyebrow">
        {problem.difficulty} · {problem.topic.replaceAll("-", " ")}
        {progress.solved[problem.id] === true ? " · Tests passed previously ✓" : ""}
      </p>
      <h3>{problem.title}</h3>
      <p>{problem.prompt}</p>
      {(!interview || locked) && (
        <details>
          <summary>Show a hint</summary>
          <p>{problem.hint}</p>
        </details>
      )}
      <details>
        <summary>View sample and boundary tests</summary>
        {problem.tests.map((item) => (
          <div key={item.label}>
            <h4>{item.label}</h4>
            <pre>
              <code>{`Input: ${JSON.stringify(item.input)}\nExpected: ${JSON.stringify(item.expected)}`}</code>
            </pre>
          </div>
        ))}
      </details>
      <label className="dsaField">
        Your JavaScript solution
        <textarea
          value={code}
          maxLength={20000}
          spellCheck={false}
          rows={12}
          disabled={busy || locked}
          onChange={(event) => {
            setCode(event.target.value);
            setResults(null);
            setError("");
            updateDsaProgress("drafts", draftKey, event.target.value);
          }}
        />
      </label>
      <p>
        Implement <code>solve(input)</code> and return the answer. Tests run in a separate browser
        worker with a two-second limit. These small checks validate outputs; review the required
        algorithm and complexity yourself.
      </p>
      <div className="dsaControls">
        <button type="button" disabled={busy || locked} onClick={run}>
          {busy ? "Running…" : "Run tests"}
        </button>
        {busy && (
          <button
            type="button"
            onClick={() => {
              stop();
              setBusy(false);
              setError("Run cancelled.");
            }}
          >
            Stop run
          </button>
        )}
      </div>
      <div role="status" aria-live="polite">
        {error && <p className="dsaLabError">{error}</p>}
        {results && (
          <>
            <p>
              <strong>
                {results.filter((item) => item.passed).length} / {results.length} tests passed
              </strong>
            </p>
            <ul>
              {results.map((item) => (
                <li key={item.label}>
                  {item.passed ? "✓ Passed" : "✗ Failed"}: {item.label}
                  {!item.passed && (
                    <pre>
                      {item.error || `Expected: ${item.expected}\nReceived: ${item.actual}`}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {(!interview || locked) && (
        <details>
          <summary>Study the reference solution</summary>
          <pre>
            <code>{problem.solution}</code>
          </pre>
          <p>
            Compare the invariant and complexity with your own solution. Try implementing it again
            without looking.
          </p>
        </details>
      )}
      {!interview && (
        <>
          <fieldset className="dsaQuizOptions">
            <legend>{problem.quiz.question}</legend>
            {problem.quiz.choices.map((answer, index) => (
              <label key={answer}>
                <input
                  type="radio"
                  name={`quiz-${problem.id}`}
                  checked={choice === index}
                  onChange={() => {
                    setChoice(index);
                    setFeedback(null);
                  }}
                />
                {answer}
              </label>
            ))}
          </fieldset>
          <div className="dsaControls">
            <button
              type="button"
              disabled={choice < 0 || feedback !== null}
              onClick={() => {
                const correct = choice === problem.quiz.correct;
                setFeedback(correct);
                recordDsaQuiz(problem.id, correct);
              }}
            >
              Check answer
            </button>
          </div>
          {feedback !== null && (
            <p role="status">
              <strong>{feedback ? "Correct. " : "Review this idea. "}</strong>
              {problem.quiz.explanation}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function DsaPracticeLab({ courseSlug, lessonSlug }) {
  const progress = useDsaProgress();
  const topic = practiceTopic(courseSlug, lessonSlug);
  const initial = dsaPractice.find((item) => item.topic === topic) || dsaPractice[0];
  const [id, setId] = useState(() => {
    const requested =
      typeof window === "undefined" || !window.location
        ? null
        : new window.URLSearchParams(window.location.search).get("practice");
    return dsaPractice.some((item) => item.id === requested) ? requested : initial.id;
  });
  const problem = dsaPractice.find((item) => item.id === id);
  return (
    <section id="coding-practice" className="dsaPracticeLab">
      <h2>Practice it yourself</h2>
      <p>
        Build fluency with {dsaPractice.length} problems across {dsaPracticeTopics.length} topics,
        from arrays to graphs and dynamic programming. Drafts save locally and sync when signed in.
      </p>
      <label className="dsaField">
        Choose a practice problem
        <select value={id} onChange={(event) => setId(event.target.value)}>
          {dsaPracticeTopics.map((group) => (
            <optgroup key={group} label={group.replaceAll("-", " ")}>
              {dsaPractice
                .filter((item) => item.topic === group)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.difficulty} · {item.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <Challenge key={`${progress.owner}/${id}`} problem={problem} />
    </section>
  );
}
