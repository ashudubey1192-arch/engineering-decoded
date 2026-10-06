import { useState } from "react";
import { dsaPractice } from "../../data/dsaPractice.js";
import { dsaCourses } from "../../data/dsaCourses.js";
import { useDsaProgress, updateDsaProgress } from "../../services/dsaProgress.js";

export const learningPaths = {
  beginner: {
    title: "Beginner foundations",
    prerequisites: "Variables, loops, functions, and basic JavaScript syntax.",
    ids: [
      "array-min",
      "array-ranges",
      "list-reverse",
      "search-exact",
      "sort-insertion",
      "recursion-digits",
      "tree-depth",
      "heap-valid",
      "graph-distance",
      "dp-stairs",
    ],
  },
  interview: {
    title: "Interview preparation",
    prerequisites:
      "Complete the beginner path or be comfortable with arrays, pointers, and complexity analysis.",
    ids: [
      "array-subarrays",
      "search-lower",
      "search-capacity",
      "list-middle",
      "list-merge",
      "tree-valid",
      "heap-kth",
      "graph-schedule",
      "recursion-subsets",
      "greedy-meetings",
      "greedy-jump",
      "dp-coins",
      "sort-inversions",
    ],
  },
  revision: {
    title: "Core revision",
    prerequisites:
      "Prior exposure to the topics. Attempt each task without notes, then explain the invariant.",
    ids: [
      "array-ranges",
      "list-reverse",
      "search-lower",
      "sort-stable",
      "tree-valid",
      "graph-distance",
      "heap-kth",
      "recursion-subsets",
      "greedy-meetings",
      "dp-coins",
    ],
  },
};
export function practiceUrl(item) {
  return `/learn/dsa/${item.topic}/${dsaCourses[item.topic].articles[0].slug}?practice=${item.id}#coding-practice`;
}
export default function DsaLearningPaths() {
  const state = useDsaProgress();
  const selected = learningPaths[state.preferences.path] ? state.preferences.path : "beginner";
  const path = learningPaths[selected];
  const next = path.ids.find((id) => state.solved[id] !== true);
  return (
    <section id="learning-paths" className="dsaPathPanel">
      <h2>Follow a learning path</h2>
      <label className="dsaField">
        Your path
        <select
          value={selected}
          onChange={(e) => updateDsaProgress("preferences", "path", e.target.value)}
        >
          {Object.entries(learningPaths).map(([key, p]) => (
            <option key={key} value={key}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <p>
        <strong>Prerequisites:</strong> {path.prerequisites}
      </p>
      <p>
        {path.ids.filter((id) => state.solved[id] === true).length} / {path.ids.length} checkpoints
        passed. Follow the order below; every earlier checkpoint prepares you for the next. You can
        revisit any topic.
      </p>
      {next ? (
        <p>
          <strong>Next checkpoint:</strong>{" "}
          <a href={practiceUrl(dsaPractice.find((p) => p.id === next))}>
            {dsaPractice.find((p) => p.id === next).title}
          </a>
        </p>
      ) : (
        <p>
          All checkpoints passed. Revisit any explanation you could not reproduce independently.
        </p>
      )}
      <ol className="dsaPathList">
        {path.ids.map((id) => {
          const p = dsaPractice.find((item) => item.id === id);
          return (
            <li key={id}>
              <a href={practiceUrl(p)}>{p.title}</a>{" "}
              <span>
                {state.solved[id] === true ? "✓ Passed" : id === next ? "Up next" : p.difficulty}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
export function DsaRevisionQueue() {
  const state = useDsaProgress();
  const [showAll, setShowAll] = useState(false);
  const now = Date.now();
  const scheduled = dsaPractice
    .map((p) => ({
      problem: p,
      review:
        state.reviews[p.id] ||
        (state.quizzes[p.id]?.correct === false ? { dueAt: 0, streak: 0 } : null),
    }))
    .filter((p) => p.review && Number.isFinite(p.review.dueAt))
    .sort((a, b) => a.review.dueAt - b.review.dueAt);
  const due = scheduled.filter((item) => item.review.dueAt <= now);
  return (
    <section id="spaced-revision" className="dsaPathPanel">
      <h2>Spaced revision</h2>
      <p>
        {due.length} questions due. A missed quiz returns tomorrow. Correct reviews are spaced 1, 3,
        7, 14, then 30 days apart. Answer the linked quiz again to update its schedule.
      </p>
      <label className="dsaVariant">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
        Include upcoming reviews
      </label>
      {(showAll ? scheduled : due).length ? (
        <ul>
          {(showAll ? scheduled : due).map(({ problem, review }) => (
            <li key={problem.id}>
              <a href={practiceUrl(problem)}>{problem.title}</a> —{" "}
              {review.dueAt <= now ? "Due now" : new Date(review.dueAt).toLocaleDateString()} ·{" "}
              {review.streak} consecutive correct reviews
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {scheduled.length
            ? "Nothing is due yet. Check upcoming reviews or practice a new topic."
            : "Answer a practice quiz to start your revision schedule."}
        </p>
      )}
    </section>
  );
}
