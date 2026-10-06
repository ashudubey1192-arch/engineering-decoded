import { useEffect, useState, useRef } from "react";
import { dsaJavaPractice } from "../../data/dsaJavaPractice.js";
import { api, getSession } from "../../services/api.js";
import { useDsaProgress, updateDsaProgress } from "../../services/dsaProgress.js";
function JavaEditor({ problem }) {
  const progress = useDsaProgress();
  const [code, setCode] = useState(progress.drafts[problem.id] || problem.starter);
  const [status, setStatus] = useState("Checking Java runner…");
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(null);
  const savedCode = progress.drafts[problem.id];
  useEffect(() => {
    if (typeof savedCode === "string" && !busy) setCode(savedCode);
  }, [savedCode, busy]);
  useEffect(() => {
    setAvailable(false);
    if (progress.owner === "guest") {
      setStatus(
        "Sign in to compile and run Java. You can edit and study solutions without signing in.",
      );
      return;
    }
    const controller = new window.AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10000);
    api("/dsa/java/status", { signal: controller.signal })
      .then((data) => {
        setAvailable(data.available);
        setStatus(data.message);
      })
      .catch(() =>
        setStatus(
          "Java runner is unavailable. Your draft is saved; retry when the service is connected.",
        ),
      )
      .finally(() => window.clearTimeout(timer));
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [progress.owner, retry]);
  useEffect(() => {
    return () => {
      request.current?.abort();
    };
  }, []);
  async function run() {
    setBusy(true);
    setError("");
    setResults(null);
    const controller = new window.AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 70000);
    try {
      const data = await api("/dsa/java/run", {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ code, tests: problem.tests }),
      });
      if (controller.signal.aborted || getSession()?.user?.id !== progress.owner) return;
      setResults(data.results);
      if (data.results?.length === problem.tests.length && data.results.every((r) => r.passed))
        updateDsaProgress("solved", problem.id, true);
    } catch (e) {
      setError(
        controller.signal.aborted
          ? "Run cancelled or timed out. Try again when the runner is available."
          : e.message,
      );
    } finally {
      window.clearTimeout(timeout);
      request.current = null;
      setBusy(false);
    }
  }
  return (
    <div className="dsaChallenge">
      <h3>{problem.title}</h3>
      <p>{problem.prompt}</p>
      <p role="status">{status}</p>
      <div className="dsaControls">
        <button
          type="button"
          disabled={busy || progress.owner === "guest"}
          onClick={() => setRetry(retry + 1)}
        >
          Check runner availability
        </button>
      </div>
      <label className="dsaField">
        Your Java program
        <textarea
          rows={16}
          maxLength={20000}
          spellCheck={false}
          value={code}
          disabled={busy}
          onChange={(e) => {
            setCode(e.target.value);
            setResults(null);
            updateDsaProgress("drafts", problem.id, e.target.value);
          }}
        />
      </label>
      <div className="dsaControls">
        <button type="button" disabled={!available || busy} onClick={run}>
          {busy ? "Compiling and testing…" : "Compile and run Java tests"}
        </button>
        {busy && (
          <button type="button" onClick={() => request.current?.abort()}>
            Cancel run
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {results && (
        <div role="status">
          <p>
            {results.filter((r) => r.passed).length}/{results.length} tests passed
          </p>
          <ul>
            {results.map((r) => (
              <li key={r.label}>
                {r.passed ? "✓" : "✗"} {r.label}
                <pre>{r.error || `Expected: ${r.expected}\nOutput: ${r.actual}`}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
      <details>
        <summary>Input and expected output</summary>
        {problem.tests.map((t) => (
          <pre key={t.label}>{`${t.label}\nInput:\n${t.input}\nExpected: ${t.expected}`}</pre>
        ))}
      </details>
      <details>
        <summary>Java reference solution</summary>
        <pre>
          <code>{problem.solution}</code>
        </pre>
      </details>
      <p>
        Programs use Java 21 in disposable containers. Compilation and each run have resource and
        time limits. To work locally, save as Main.java, run <code>javac Main.java</code>, then{" "}
        <code>java Main</code> and enter a sample input.
      </p>
    </div>
  );
}
export default function DsaJavaLab() {
  const progress = useDsaProgress();
  const [id, setId] = useState(dsaJavaPractice[0].id);
  return (
    <section id="java-practice">
      <h2>Java coding practice</h2>
      <label className="dsaField">
        Java exercise
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {dsaJavaPractice.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <JavaEditor
        key={`${progress.owner}/${id}`}
        problem={dsaJavaPractice.find((p) => p.id === id)}
      />
    </section>
  );
}
