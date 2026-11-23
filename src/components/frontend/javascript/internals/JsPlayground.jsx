import { useRef, useState } from "react";
import { formatArgs } from "./formatValue.js";

// Editable copy of the lesson example. Runs in this tab with a captured console and keeps
// collecting output for a few seconds so timers and promises can finish.
export default function JsPlayground({ code, expected }) {
  const [source, setSource] = useState(code);
  const [lines, setLines] = useState(null);
  const runId = useRef(0);

  function run() {
    const id = ++runId.current;
    const collected = [];
    const push = (...args) => {
      if (runId.current !== id) return;
      collected.push(formatArgs(args));
      setLines([...collected]);
    };
    const captured = { log: push, info: push, warn: push, error: push };
    setLines([]);
    try {
      new Function("console", source)(captured);
    } catch (error) {
      push(`Uncaught ${error?.name ?? "Error"}: ${error?.message ?? error}`);
    }
  }

  const changed = source !== code;
  const matches = lines && !changed && lines.join("\n") === expected;

  return (
    <div className="njsPlayground">
      <header>
        <div>
          <small>PLAYGROUND</small>
          <strong>Edit the example and run it in this tab</strong>
        </div>
        <div className="reactMotionControls">
          <button type="button" onClick={run}>
            Run
          </button>
          <button
            type="button"
            onClick={() => {
              runId.current += 1;
              setSource(code);
              setLines(null);
            }}
            disabled={!changed && !lines}
          >
            Reset
          </button>
        </div>
      </header>
      <textarea
        aria-label="Editable example code"
        spellCheck="false"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        rows={Math.min(22, source.split("\n").length + 1)}
      />
      <div className="njsConsole" role="log" aria-live="polite">
        <small>
          CONSOLE
          {matches && " · matches the recorded output"}
        </small>
        {lines === null ? (
          <p>Press Run. Timers and promises keep logging here as they settle.</p>
        ) : lines.length ? (
          <pre>
            <code>{lines.join("\n")}</code>
          </pre>
        ) : (
          <p>Waiting for output…</p>
        )}
      </div>
    </div>
  );
}
