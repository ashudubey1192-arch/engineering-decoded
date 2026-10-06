import { dsaPractice } from "../../data/dsaPractice.js";
import { dsaCourses } from "../../data/dsaCourses.js";
import { dsaJavaPractice } from "../../data/dsaJavaPractice.js";
import {
  useDsaProgress,
  syncDsaProgress,
  importGuestProgress,
} from "../../services/dsaProgress.js";
import "./DsaLearningTools.css";

export default function DsaProgressPanel() {
  const progress = useDsaProgress();
  const solved = dsaPractice.filter((item) => progress.solved[item.id] === true).length;
  const attempted = dsaPractice.filter(
    (item) => typeof progress.quizzes[item.id]?.correct === "boolean",
  );
  const correct = attempted.filter((item) => progress.quizzes[item.id].correct).length;
  const review = attempted.filter((item) => !progress.quizzes[item.id].correct);
  const completed = Object.entries(dsaCourses).reduce(
    (sum, [slug, course]) =>
      sum +
      course.articles.filter((article) => progress.lessons[`${slug}/${article.slug}`] === true)
        .length,
    0,
  );
  return (
    <section className="dsaProgressPanel" aria-labelledby="dsa-progress-heading">
      <h2 id="dsa-progress-heading">Your DSA progress</h2>
      <div className="dsaProgressStats">
        <p>
          <strong>{completed}</strong> lessons marked complete
        </p>
        <p>
          <strong>
            {solved} / {dsaPractice.length}
          </strong>{" "}
          practice problems passed
        </p>
        <p>
          <strong>
            {correct} / {attempted.length}
          </strong>{" "}
          latest quiz answers correct
        </p>
      </div>
      <progress value={solved} max={dsaPractice.length} aria-label="Practice problems passed" />
      <p>
        Java exercises passed:{" "}
        {dsaJavaPractice.filter((item) => progress.solved[item.id] === true).length} /{" "}
        {dsaJavaPractice.length}.
      </p>
      <p role="status">
        {progress.owner === "guest"
          ? "Guest progress stays on this device. Sign in to sync across devices."
          : progress.syncStatus}
      </p>
      {progress.owner === "guest" ? (
        <a href="/login">Sign in for account sync</a>
      ) : (
        <div className="dsaControls">
          <button type="button" onClick={syncDsaProgress}>
            Sync now
          </button>
          <button type="button" disabled={progress.syncStatus !== "Synced to your account"} onClick={importGuestProgress} title="Sync first; guest progress fills only missing account entries.">
            Copy guest progress into this account
          </button>
        </div>
      )}
      <p>
        {progress.storageAvailable
          ? "Saved in this browser on this device. Quiz scores use your latest answer; passing a problem records a completed milestone."
          : "Browser storage is unavailable. Progress works for this session but may be lost when you leave."}
      </p>
      {review.length > 0 ? (
        <>
          <h3>Topics to revisit</h3>
          <ul>
            {review.map((item) => (
              <li key={item.id}>
                <a
                  href={`/learn/dsa/${item.topic}/${dsaCourses[item.topic].articles[0].slug}?practice=${item.id}#coding-practice`}
                >
                  {item.title}
                </a>{" "}
                — review the explanation and try the quiz again.
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          {attempted.length
            ? "Your latest quiz answers are all correct. Try the next difficulty level."
            : "Answer a practice quiz to discover which ideas need revision."}
        </p>
      )}
    </section>
  );
}
