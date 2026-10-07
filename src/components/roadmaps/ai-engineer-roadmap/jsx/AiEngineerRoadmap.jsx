import { useRef, useState } from "react";
import { aiEngineerStages, ragWalkthrough } from "../../../../data/aiEngineerRoadmap";
import "../css/Course.css";

const progressKey = "engineering-decoded:ai-engineer-roadmap:v1";
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
  const [selected, setSelected] = useState(aiEngineerStages[0].id);
  const [completed, setCompleted] = useState(readProgress);
  const [storageError, setStorageError] = useState(false);
  const [hours, setHours] = useState(8);
  const [ragStep, setRagStep] = useState(0);
  const selectStage = (id) => {
    setSelected(id);
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      detailRef.current?.focus({ preventScroll: true });
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
          <span>12 stages</span>
          <span>{totalHours} suggested practice hours</span>
          <span>One evolving capstone</span>
        </div>
        <p className="aiRoadmapAttribution">
          Topic reference:{" "}
          <a href="https://roadmap.sh/ai-engineer" target="_blank" rel="noreferrer">
            roadmap.sh / AI Engineer ↗
          </a>
          . Original explanations, examples, and study sequence added for Engineering Decoded.
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
      <section className="aiRoadmapWorkspace" aria-label="Interactive learning roadmap">
        <aside className="aiRoadmapMap">
          <div className="aiRoadmapMapHeading">
            <h2>Your learning path</h2>
            <span aria-live="polite">{completed.length} / 12 complete</span>
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
            <p className="aiRoadmapEyebrow">
              {stage.category} · {stage.hours} PRACTICE HOURS
            </p>
            <h2 id="ai-stage-title">{stage.title}</h2>
            <p>{stage.summary}</p>
          </header>
          <Flow nodes={stage.flow} label={`${stage.title}: concept flow`} />
          <div className="aiRoadmapConcepts">
            {stage.concepts.map(([title, description], index) => (
              <section key={title}>
                <span aria-hidden="true">0{index + 1}</span>
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
            {selected !== aiEngineerStages.at(-1).id && (
              <button
                onClick={() =>
                  selectStage(
                    aiEngineerStages[aiEngineerStages.findIndex((item) => item.id === selected) + 1]
                      .id,
                  )
                }
              >
                Next stage →
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
