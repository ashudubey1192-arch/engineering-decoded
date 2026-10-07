import { useRef, useState } from "react";
import "./ai-engineer-roadmap/css/Course.css";

function readProgress(key, stages) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(stored)
      ? [...new Set(stored.filter((id) => stages.some((stage) => stage.id === id)))]
      : [];
  } catch {
    return [];
  }
}

function Flow({ nodes, label }) {
  return (
    <ol className="aiRoadmapFlow" aria-label={label}>
      {nodes.map((node, index) => (
        <li key={node}>
          <span>{node}</span>
          {index < nodes.length - 1 && <b aria-hidden="true">→</b>}
        </li>
      ))}
    </ol>
  );
}

// Key the inner view so navigation between courses never carries over UI or progress state.
export default function ReferenceRoadmap({ roadmap, navigate }) {
  return <RoadmapView key={roadmap.id} roadmap={roadmap} navigate={navigate} />;
}

function RoadmapView({ roadmap, navigate }) {
  const { stages } = roadmap;
  const progressKey = `engineering-decoded:${roadmap.id}-reference-roadmap:v1`;
  const [completed, setCompleted] = useState(() => readProgress(progressKey, stages));
  const [selected, setSelected] = useState(stages[0].id);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [view, setView] = useState("map");
  const [hours, setHours] = useState(8);
  const [storageError, setStorageError] = useState(false);
  const detailRef = useRef(null);
  const mapRef = useRef(null);
  const index = stages.findIndex((stage) => stage.id === selected);
  const stage = stages[index];
  const totalHours = stages.reduce((sum, item) => sum + item.hours, 0);
  const doneHours = stages
    .filter((item) => completed.includes(item.id))
    .reduce((sum, item) => sum + item.hours, 0);

  const focusPanel = (ref) =>
    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: "start", behavior: "instant" });
      ref.current?.focus({ preventScroll: true });
    });
  const selectStage = (id, branchIndex = null) => {
    setSelected(id);
    setSelectedBranch(branchIndex);
    setView("detail");
    focusPanel(detailRef);
  };
  const showMap = () => {
    setView("map");
    focusPanel(mapRef);
  };
  const toggleCompleted = () => {
    const next = completed.includes(selected)
      ? completed.filter((id) => id !== selected)
      : [...completed, selected];
    setCompleted(next);
    try {
      localStorage.setItem(progressKey, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };
  const renderBranches = (item, parity) =>
    item.branches.map(
      (branch, branchIndex) =>
        branchIndex % 2 === parity && (
          <button
            key={branch.title}
            className="aiReferenceBranch"
            onClick={() => selectStage(item.id, branchIndex)}
          >
            <strong>{branch.title}</strong>
            <span>
              {branch.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </span>
          </button>
        ),
    );

  return (
    <main className="aiRoadmap">
      <header className="aiRoadmapHero">
        <button className="aiRoadmapBack" onClick={() => navigate("/learn/roadmaps")}>
          ← Career roadmaps
        </button>
        <p className="aiRoadmapEyebrow">LEARN THE FOUNDATIONS · BUILD · VERIFY</p>
        <h1>
          {roadmap.title} <span>Roadmap</span>
        </h1>
        <p className="aiRoadmapIntro">{roadmap.intro}</p>
        <div className="aiRoadmapMeta">
          <span>{stages.length} ordered steps</span>
          <span>{totalHours} suggested practice hours</span>
          <span>One evolving capstone</span>
        </div>
        <p className="aiRoadmapAttribution">
          Main progression and topic branches adapted from the live{" "}
          <a href={roadmap.source} target="_blank" rel="noreferrer">
            roadmap.sh / {roadmap.id} ↗
          </a>{" "}
          roadmap, checked {roadmap.checked}. Related branches are grouped into study steps.
          Explanations, exercises, and time estimates are original additions. Tool alternatives are
          not a requirement to learn every tool.
        </p>
      </header>
      <section className="aiRoadmapOrientation" aria-labelledby="roadmap-start">
        <div>
          <p className="aiRoadmapEyebrow">BEFORE YOU START</p>
          <h2 id="roadmap-start">Build understanding through practice.</h2>
          <p>{roadmap.orientation}</p>
        </div>
        <div className="aiRoadmapPlan">
          <label htmlFor="roadmap-hours">Your weekly study budget</label>
          <select
            id="roadmap-hours"
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
          >
            <option value={4}>4 hours / week</option>
            <option value={8}>8 hours / week</option>
            <option value={12}>12 hours / week</option>
          </select>
          <strong aria-live="polite">About {Math.ceil(totalHours / hours)} weeks</strong>
          <p>
            A planning estimate, not a job-readiness guarantee. Week labels assume 8 hours/week.
            Spend longer when a checkpoint needs more practice.
          </p>
        </div>
      </section>
      <section
        className="aiReferenceOverview"
        ref={mapRef}
        tabIndex={-1}
        aria-labelledby="roadmap-map-title"
      >
        <p className="aiRoadmapEyebrow">FOLLOW THE REFERENCE · STEP BY STEP</p>
        <h2 id="roadmap-map-title">The {roadmap.title.toLowerCase()} learning map</h2>
        <p>
          Follow the numbered path. Select a step or connected branch to read its explanation, trace
          an example, and try a project. Some branches can be learned alongside the main path.
        </p>
        <div className="aiRoadmapSteps" aria-label="Roadmap view">
          <button aria-pressed={view === "map"} onClick={showMap}>
            Roadmap overview
          </button>
          <button aria-pressed={view === "detail"} onClick={() => selectStage(selected)}>
            Step explanations
          </button>
        </div>
        <div className="aiReferenceLegend">
          <span>Numbered nodes = suggested learning order</span>
          <span>Side branches = topics / alternatives</span>
          <span aria-live="polite">
            {completed.length} / {stages.length} steps complete
          </span>
        </div>
        <ol className="aiReferenceMap" hidden={view !== "map"} aria-label="Reference roadmap steps">
          {stages.map((item, stageIndex) => (
            <li className="aiReferenceRow" key={item.id}>
              <button
                className="aiReferenceNode"
                onClick={() => selectStage(item.id)}
                aria-label={`Step ${stageIndex + 1}: ${item.title}${completed.includes(item.id) ? ", completed" : ""}`}
              >
                <span>{String(stageIndex + 1).padStart(2, "0")}</span>
                <small>Weeks {item.weeks}</small>
                <strong>{item.title}</strong>
                <small>{completed.includes(item.id) ? "✓ Completed" : "Explore this step →"}</small>
              </button>
              <div className="aiReferenceBranches aiReferenceLeft">{renderBranches(item, 0)}</div>
              <div className="aiReferenceBranches aiReferenceRight">{renderBranches(item, 1)}</div>
            </li>
          ))}
        </ol>
      </section>
      <section
        className="aiRoadmapWorkspace"
        aria-label="Step explanations"
        hidden={view !== "detail"}
      >
        <aside className="aiRoadmapMap">
          <div className="aiRoadmapMapHeading">
            <h2>Your learning path</h2>
            <span aria-live="polite">
              {completed.length} / {stages.length} complete
            </span>
          </div>
          <progress
            value={doneHours}
            max={totalHours}
            aria-label="Completed suggested practice hours"
          />
          <p className="aiRoadmapHint">
            Progress is saved in this browser, separately for each roadmap.
          </p>
          <ol>
            {stages.map((item, stageIndex) => (
              <li key={item.id} className={completed.includes(item.id) ? "isComplete" : ""}>
                <button
                  onClick={() => selectStage(item.id)}
                  aria-pressed={selected === item.id}
                  aria-controls="roadmap-detail"
                >
                  <span className="aiRoadmapNumber">
                    {completed.includes(item.id) ? "✓" : String(stageIndex + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <small>
                      Weeks {item.weeks} · {item.hours} hours
                    </small>
                    <strong>{item.title}</strong>
                    {completed.includes(item.id) && <small>Completed</small>}
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
        <section
          className="aiRoadmapDetail"
          id="roadmap-detail"
          ref={detailRef}
          tabIndex={-1}
          aria-labelledby="roadmap-step-title"
        >
          <header>
            <button className="aiRoadmapBack" onClick={showMap}>
              ← Back to the full roadmap
            </button>
            <p className="aiRoadmapEyebrow">
              STEP {index + 1} · {stage.hours} PRACTICE HOURS
            </p>
            <h2 id="roadmap-step-title">{stage.title}</h2>
          </header>
          <Flow nodes={stage.flow} label={`${stage.title}: concept flow`} />
          <section className="aiReferenceTopics" aria-label="Topics in this step">
            <h3>What to learn and why it matters</h3>
            {stage.branches.map((branch, branchIndex) => (
              <section
                key={branch.title}
                className={selectedBranch === branchIndex ? "isSelected" : ""}
              >
                <h4>
                  {branchIndex + 1}. {branch.title}
                </h4>
                <ul>
                  {branch.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
                <p>{branch.explanation}</p>
              </section>
            ))}
          </section>
          <section className="aiRoadmapExample">
            <p className="aiRoadmapEyebrow">IN PRACTICE · {roadmap.projectName.toUpperCase()}</p>
            <h3>A concrete example</h3>
            <p>{stage.example}</p>
            {stage.code && (
              <figure>
                <figcaption>Illustrative snippet · integrate with your project</figcaption>
                <pre>
                  <code>{stage.code}</code>
                </pre>
              </figure>
            )}
          </section>
          <section className="aiRoadmapAssignment">
            <h3>Build it yourself</h3>
            <p>{stage.project}</p>
            <h3>Ready to move on when…</h3>
            <p>{stage.checkpoint}</p>
          </section>
          <p className="aiRoadmapMistake">
            <strong>Common trap:</strong> {stage.mistake}
          </p>
          <footer>
            <button
              className="aiRoadmapPrimary"
              onClick={toggleCompleted}
              aria-pressed={completed.includes(selected)}
            >
              {completed.includes(selected)
                ? "✓ Completed · mark incomplete"
                : "Mark step complete"}
            </button>
            {index > 0 && (
              <button onClick={() => selectStage(stages[index - 1].id)}>← Previous step</button>
            )}
            {index < stages.length - 1 && (
              <button onClick={() => selectStage(stages[index + 1].id)}>Next step →</button>
            )}
          </footer>
          {storageError && (
            <p role="status">
              Progress is updated for this visit, but browser storage is unavailable.
            </p>
          )}
        </section>
      </section>
      <section className="aiRoadmapCapstone" aria-labelledby="roadmap-capstone">
        <div>
          <p className="aiRoadmapEyebrow">YOUR FINISH LINE</p>
          <h2 id="roadmap-capstone">{roadmap.projectName}</h2>
          <p>{roadmap.capstone}</p>
        </div>
        <ul>
          {roadmap.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="aiRoadmapResources">
        <h2>Reference and related roadmaps</h2>
        <p>
          Use the source map for the broader ecosystem. Check current primary documentation for the
          tool you choose before implementing it.
        </p>
        <div>
          <a href={roadmap.source} target="_blank" rel="noreferrer">
            <strong>{roadmap.title} reference ↗</strong>
            <span>Original roadmap.sh topic map</span>
          </a>
          {["frontend", "backend", "devops", "ai-engineer"]
            .filter((id) => id !== roadmap.id)
            .map((id) => (
              <a
                key={id}
                href={`/learn/roadmaps/${id}-roadmap`}
                onClick={(event) => {
                  if (
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.shiftKey &&
                    !event.altKey &&
                    event.button === 0
                  ) {
                    event.preventDefault();
                    navigate(`/learn/roadmaps/${id}-roadmap`);
                  }
                }}
              >
                <strong>
                  {id === "ai-engineer"
                    ? "AI Engineer"
                    : id === "devops"
                      ? "DevOps"
                      : id === "frontend"
                        ? "Frontend"
                        : "Backend"}{" "}
                  roadmap →
                </strong>
                <span>Continue with another learning path</span>
              </a>
            ))}
        </div>
      </section>
    </main>
  );
}
