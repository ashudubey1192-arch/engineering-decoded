import { useRef, useState } from "react";
import { ragWalkthrough } from "../../../../data/aiEngineerRoadmap";
import {
  aiEngineerReferenceStages as aiEngineerStages,
  supplementalPractice,
} from "../../../../data/aiEngineerReferenceRoadmap";
import "../css/Course.css";

// Separate reference-path progress from the previous custom curriculum; retain its saved data.
const progressKey = "engineering-decoded:ai-engineer-reference-roadmap:v2";
function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) || "[]");
    return Array.isArray(saved)
      ? [...new Set(saved.filter((id) => aiEngineerStages.some((stage) => stage.id === id)))]
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
export default function AiEngineerRoadmap({ navigate }) {
  const detailRef = useRef(null);
  const mapRef = useRef(null);
  const [view, setView] = useState("map");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selected, setSelected] = useState(aiEngineerStages[0].id);
  const [completed, setCompleted] = useState(readProgress);
  const [storageError, setStorageError] = useState(false);
  const [hours, setHours] = useState(8);
  const [ragStep, setRagStep] = useState(0);
  const selectStage = (id, branchIndex = null) => {
    setSelected(id);
    setSelectedBranch(branchIndex);
    setView("detail");
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      detailRef.current?.focus({ preventScroll: true });
    });
  };
  const showMap = () => {
    setView("map");
    requestAnimationFrame(() => {
      mapRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      mapRef.current?.focus({ preventScroll: true });
    });
  };
  const stage = aiEngineerStages.find((item) => item.id === selected);
  const totalHours = aiEngineerStages.reduce((sum, item) => sum + item.hours, 0);
  const doneHours = aiEngineerStages
    .filter((item) => completed.includes(item.id))
    .reduce((sum, item) => sum + item.hours, 0);
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
  return (
    <div className="aiRoadmap">
      <header className="aiRoadmapHero">
        {navigate && (
          <button className="aiRoadmapBack" onClick={() => navigate("/learn/roadmaps")}>
            ← Career roadmaps
          </button>
        )}
        <p className="aiRoadmapEyebrow">THE BUILDER’S PATH · BEGINNER TO PRODUCTION</p>
        <h1>
          AI Engineer <span>Roadmap</span>
        </h1>
        <p className="aiRoadmapIntro">
          Learn the concepts. Build the systems. Prove they work. A practical path from your first
          model call to a reliable AI application—with explanations, visual walkthroughs, and a
          project at every stage.
        </p>
        <div className="aiRoadmapMeta">
          <span>{aiEngineerStages.length} ordered steps</span>
          <span>{totalHours} suggested practice hours</span>
          <span>One evolving capstone</span>
        </div>
        <p className="aiRoadmapAttribution">
          Step order and topic branches follow the live{" "}
          <a href="https://roadmap.sh/ai-engineer" target="_blank" rel="noreferrer">
            roadmap.sh / AI Engineer ↗
          </a>{" "}
          roadmap, checked October 7, 2026. Explanations, examples, and time estimates are original
          additions. Tool lists are alternatives to explore, not requirements to learn every tool.
        </p>
      </header>
      <section className="aiRoadmapOrientation" aria-labelledby="ai-start-heading">
        <div>
          <p className="aiRoadmapEyebrow">BEFORE YOU START</p>
          <h2 id="ai-start-heading">Build applications with AI.</h2>
          <p>
            This path focuses on integrating pretrained models, retrieval, and tools into useful
            software. Model research and training from scratch are deeper specializations. If you
            already build web services, use stage 1 as a checklist and start with model
            fundamentals.
          </p>
        </div>
        <div className="aiRoadmapPlan">
          <label htmlFor="ai-study-hours">Your weekly study budget</label>
          <select
            id="ai-study-hours"
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
          >
            <option value={4}>4 hours / week</option>
            <option value={8}>8 hours / week</option>
            <option value={12}>12 hours / week</option>
          </select>
          <strong aria-live="polite">About {Math.ceil(totalHours / hours)} weeks</strong>
          <p>
            An adjustable planning estimate, not a job-readiness guarantee. Stage week labels assume
            8 hours/week. Spend longer wherever the checkpoint is difficult.
          </p>
        </div>
      </section>
      <section
        className="aiReferenceOverview"
        aria-labelledby="ai-map-heading"
        ref={mapRef}
        tabIndex={-1}
      >
        <p className="aiRoadmapEyebrow">FOLLOW THE REFERENCE · STEP BY STEP</p>
        <h2 id="ai-map-heading">The AI engineering learning map</h2>
        <p>
          Follow the numbered center path from top to bottom. The connected branches show what to
          study at each step. Select a step or branch for explanations, a visual example, and a
          practical checkpoint.
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
          <span>Numbered nodes = learning order</span>
          <span>Side branches = topics / alternatives</span>
          <span aria-live="polite">
            {completed.length} / {aiEngineerStages.length} steps complete
          </span>
        </div>
        <ol className="aiReferenceMap" hidden={view !== "map"} aria-label="Reference roadmap steps">
          {aiEngineerStages.map((item, index) => (
            <li className="aiReferenceRow" key={item.id}>
              <div className="aiReferenceBranches aiReferenceLeft">
                {item.branches
                  .filter((_, branchIndex) => branchIndex % 2 === 0)
                  .map((branch) => (
                    <button
                      key={branch.title}
                      onClick={() => selectStage(item.id, item.branches.indexOf(branch))}
                      className="aiReferenceBranch"
                    >
                      <strong>{branch.title}</strong>
                      <span>
                        {branch.topics.map((topic) => (
                          <span key={topic}>{topic}</span>
                        ))}
                      </span>
                    </button>
                  ))}
              </div>
              <button
                className="aiReferenceNode"
                onClick={() => selectStage(item.id)}
                aria-label={`Step ${index + 1}: ${item.title}${completed.includes(item.id) ? ", completed" : ""}`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <small>{completed.includes(item.id) ? "✓ Completed" : "Explore this step →"}</small>
              </button>
              <div className="aiReferenceBranches aiReferenceRight">
                {item.branches
                  .filter((_, branchIndex) => branchIndex % 2 === 1)
                  .map((branch) => (
                    <button
                      key={branch.title}
                      onClick={() => selectStage(item.id, item.branches.indexOf(branch))}
                      className="aiReferenceBranch"
                    >
                      <strong>{branch.title}</strong>
                      <span>
                        {branch.topics.map((topic) => (
                          <span key={topic}>{topic}</span>
                        ))}
                      </span>
                    </button>
                  ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section
        className="aiRoadmapWorkspace"
        aria-label="Interactive learning roadmap"
        hidden={view !== "detail"}
      >
        <aside className="aiRoadmapMap">
          <div className="aiRoadmapMapHeading">
            <h2>Your learning path</h2>
            <span aria-live="polite">
              {completed.length} / {aiEngineerStages.length} complete
            </span>
          </div>
          <progress
            value={doneHours}
            max={totalHours}
            aria-label="Completed suggested practice hours"
          />
          <p className="aiRoadmapHint">Select a stage to explore its lessons.</p>
          <ol>
            {aiEngineerStages.map((item, index) => (
              <li key={item.id} className={completed.includes(item.id) ? "isComplete" : ""}>
                <button
                  onClick={() => selectStage(item.id)}
                  aria-pressed={selected === item.id}
                  aria-controls="ai-stage-detail"
                >
                  <span className="aiRoadmapNumber">
                    {completed.includes(item.id) ? "✓" : String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <small>
                      {item.category} · Weeks {item.weeks}
                    </small>
                    <strong>{item.title}</strong>
                    {completed.includes(item.id) && <small>Completed</small>}
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="aiRoadmapHint">
            Progress is saved in this browser only. Evaluation and security apply throughout the
            path.
          </p>
        </aside>
        <section
          className="aiRoadmapDetail"
          id="ai-stage-detail"
          aria-labelledby="ai-stage-title"
          ref={detailRef}
          tabIndex={-1}
        >
          <header>
            <button className="aiRoadmapBack" onClick={showMap}>
              ← Back to the full roadmap
            </button>
            <p className="aiRoadmapEyebrow">
              {stage.category} · {stage.hours} PRACTICE HOURS
            </p>
            <h2 id="ai-stage-title">{stage.title}</h2>
            <p>{stage.summary}</p>
          </header>
          <Flow nodes={stage.flow} label={`${stage.title}: concept flow`} />
          <section className="aiReferenceTopics" aria-label="Topics in this step">
            <h3>Study these topics in order</h3>
            {stage.branches.map((branch, index) => (
              <section key={branch.title} className={selectedBranch === index ? "isSelected" : ""}>
                <h4>
                  {index + 1}. {branch.title}
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
          <div className="aiRoadmapConcepts">
            {stage.concepts.map(([title, description], index) => (
              <section key={title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </section>
            ))}
          </div>
          <section className="aiRoadmapExample">
            <p className="aiRoadmapEyebrow">IN PRACTICE · SUPPORT COPILOT</p>
            <h3>A concrete example</h3>
            <p>{stage.example}</p>
            <figure>
              <figcaption>{stage.codeLabel}</figcaption>
              <pre>
                <code>{stage.code}</code>
              </pre>
            </figure>
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
                : "Mark stage complete"}
            </button>
            {selected !== aiEngineerStages[0].id && (
              <button
                onClick={() =>
                  selectStage(
                    aiEngineerStages[aiEngineerStages.findIndex((item) => item.id === selected) - 1]
                      .id,
                  )
                }
              >
                ← Previous step
              </button>
            )}
            {selected !== aiEngineerStages.at(-1).id && (
              <button
                onClick={() =>
                  selectStage(
                    aiEngineerStages[aiEngineerStages.findIndex((item) => item.id === selected) + 1]
                      .id,
                  )
                }
              >
                Next step →
              </button>
            )}
          </footer>
          {storageError && (
            <p role="status">
              Progress is updated for this visit, but browser storage is unavailable.
            </p>
          )}
        </section>
      </section>
      <section className="aiReferenceExtras" aria-label="Additional practice">
        <h2>Additional practice after the roadmap</h2>
        <p>
          These Engineering Decoded projects extend the reference path with deployment and portfolio
          work.
        </p>
        {supplementalPractice.map((item) => (
          <details key={item.id}>
            <summary>{item.title}</summary>
            <p>{item.summary}</p>
            <Flow nodes={item.flow} label={item.title} />
            <p>
              <strong>Build:</strong> {item.project}
            </p>
            <p>
              <strong>Checkpoint:</strong> {item.checkpoint}
            </p>
          </details>
        ))}
      </section>
      <section className="aiRoadmapWalkthrough" aria-labelledby="ai-rag-title">
        <p className="aiRoadmapEyebrow">FOLLOW THE DATA</p>
        <h2 id="ai-rag-title">An answer is only as good as its evidence.</h2>
        <p>
          Step through a fictional RAG request. This is an educational walkthrough, not a live model
          call.
        </p>
        <div className="aiRoadmapSteps" aria-label="RAG walkthrough steps">
          {ragWalkthrough.map((step, index) => (
            <button
              key={step.title}
              aria-pressed={ragStep === index}
              onClick={() => setRagStep(index)}
              aria-controls="ai-rag-result"
            >
              {step.title}
            </button>
          ))}
        </div>
        <div id="ai-rag-result" aria-live="polite">
          <Flow nodes={ragWalkthrough[ragStep].nodes} label="Current RAG step" />
          <p>{ragWalkthrough[ragStep].detail}</p>
        </div>
      </section>
      <section className="aiRoadmapCapstone" aria-labelledby="ai-capstone-title">
        <div>
          <p className="aiRoadmapEyebrow">YOUR FINISH LINE</p>
          <h2 id="ai-capstone-title">One project. Real engineering depth.</h2>
          <p>
            Build a support copilot that classifies tickets, answers from approved policies, and
            looks up orders with permission checks. Add a receipt or voice workflow only after the
            text path works reliably.
          </p>
        </div>
        <ul>
          <li>
            <strong>Demo:</strong> supported answer, missing evidence, and blocked access.
          </li>
          <li>
            <strong>Evidence:</strong> evaluation dataset, error analysis, latency, and cost.
          </li>
          <li>
            <strong>Operations:</strong> deployment guide, traces, budget, and rollback.
          </li>
          <li>
            <strong>Judgment:</strong> explain why you used RAG, where you avoided an agent, and
            what you would improve.
          </li>
        </ul>
      </section>
      <section className="aiRoadmapResources" aria-labelledby="ai-resources-title">
        <h2 id="ai-resources-title">Go deeper, one resource at a time</h2>
        <p>
          Use the roadmap for direction and primary documentation for implementation. Check current
          model availability, API syntax, and pricing before building.
        </p>
        <div>
          <a href="https://roadmap.sh/ai-engineer" target="_blank" rel="noreferrer">
            <strong>roadmap.sh ↗</strong>
            <span>Reference topic map</span>
          </a>
          <a
            href="https://huggingface.co/learn/llm-course/chapter1/1"
            target="_blank"
            rel="noreferrer"
          >
            <strong>Hugging Face LLM Course ↗</strong>
            <span>Models, tokenizers, datasets, and adaptation</span>
          </a>
          <a
            href="https://docs.pytorch.org/tutorials/beginner/basics/intro.html"
            target="_blank"
            rel="noreferrer"
          >
            <strong>PyTorch basics ↗</strong>
            <span>Optional deeper learning and training foundations</span>
          </a>
          <a
            href="https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"
            target="_blank"
            rel="noreferrer"
          >
            <strong>Tool-use documentation ↗</strong>
            <span>A concrete provider example of tool execution</span>
          </a>
        </div>
      </section>
    </div>
  );
}
