import { useEffect, useState } from "react";
import { dsaPractice } from "../../data/dsaPractice.js";
import { Challenge } from "./DsaPracticeLab.jsx";
import { useDsaProgress, updateDsaProgress } from "../../services/dsaProgress.js";
import { remainingSeconds } from "../../services/dsaLearningState.js";

export default function DsaInterview() {
  const progress = useDsaProgress();
  const [problemId, setProblemId] = useState("search-lower");
  const [minutes, setMinutes] = useState(20);
  const [now, setNow] = useState(Date.now);
  const session = progress.interviews.active;
  const problem = session && dsaPractice.find((item) => item.id === session.problemId);
  const remaining = session ? remainingSeconds(session, now) : 0;
  const ended = session && (Boolean(session.endedAt) || remaining === 0);
  useEffect(() => {
    if (!session || session.endedAt || !problem) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= session.deadline)
        updateDsaProgress("interviews", "active", {
          ...session,
          endedAt: session.deadline,
          reason: "Time expired",
        });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [session, problem]);
  return (
    <section id="interview-mode">
      <h2>Timed interview practice</h2>
      <p>
        Choose a problem and work against a deadline. Hints, reference code, and the concept quiz
        stay hidden during the session. This is self-guided practice, not a proctored assessment.
      </p>
      {(!session || ended || !problem) && (
        <div className="dsaLabForm">
          <label className="dsaField">
            Interview problem
            <select value={problemId} onChange={(e) => setProblemId(e.target.value)}>
              {dsaPractice.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.difficulty} · {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="dsaField">
            Time limit
            <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {[10, 20, 30, 45].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <div className="dsaControls">
            <button
              type="button"
              onClick={() => {
                const startedAt = Date.now();
                setNow(startedAt);
                if (session?.endedAt)
                  updateDsaProgress("interviews", `history-${session.startedAt}`, session);
                updateDsaProgress("interviews", "active", {
                  problemId,
                  startedAt,
                  deadline: startedAt + minutes * 60000,
                  passed: 0,
                  total: dsaPractice.find((p) => p.id === problemId).tests.length,
                });
              }}
            >
              Start timed session
            </button>
          </div>
        </div>
      )}
      {problem && (
        <>
          <p className="dsaTimer" role="timer" aria-label="Time remaining">
            {ended
              ? "Session finished"
              : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining`}
          </p>
          {!ended && (
            <div className="dsaControls">
              <button
                type="button"
                onClick={() =>
                  updateDsaProgress("interviews", "active", {
                    ...session,
                    endedAt: Date.now(),
                    reason: "Finished early",
                  })
                }
              >
                Finish and review
              </button>
            </div>
          )}
          {ended && (
            <div className="dsaInvariant">
              <h3>Interview review</h3>
              <p>
                {session.reason || "Time expired"}. Last recorded run: {session.passed} /{" "}
                {session.total} tests passed. A passing sample suite does not prove correctness for
                every input.
              </p>
              <ol>
                <li>Explain your invariant and why the algorithm terminates.</li>
                <li>State worst-case time and auxiliary space.</li>
                <li>Walk through an empty input and a boundary case.</li>
                <li>Compare with the now-available reference solution below.</li>
              </ol>
            </div>
          )}
          <Challenge
            key={`${progress.owner}/${session.startedAt}`}
            problem={problem}
            draftKey={`interview-${session.startedAt}`}
            interview
            locked={ended}
            onResult={(results) => {
              if (!session.endedAt && Date.now() < session.deadline)
                updateDsaProgress("interviews", "active", {
                  ...session,
                  passed: results.filter((r) => r.passed).length,
                  total: results.length,
                });
            }}
          />
        </>
      )}
      {Object.entries(progress.interviews).some(([key]) => key.startsWith("history-")) && (
        <details>
          <summary>Earlier sessions</summary>
          <ul>
            {Object.entries(progress.interviews)
              .filter(([key]) => key.startsWith("history-"))
              .sort((a, b) => b[1].startedAt - a[1].startedAt)
              .slice(0, 10)
              .map(([key, item]) => (
                <li key={key}>
                  {dsaPractice.find((p) => p.id === item.problemId)?.title || item.problemId}:{" "}
                  {item.passed}/{item.total} tests · {new Date(item.startedAt).toLocaleDateString()}
                </li>
              ))}
          </ul>
        </details>
      )}
    </section>
  );
}
