import { useState } from "react";
import WebLessonLab from "./WebLessonLab";
import "./WebLesson.css";

function StepVisual({ steps }) {
  const [selected, setSelected] = useState(0);
  const step = steps[selected];
  return (
    <div className="webSteps">
      <p className="webStepsHint">
        Select a step to trace the example. Diagrams model the behavior; they do not execute the
        code.
      </p>
      <ol className="webStepTabs" aria-label="Walkthrough steps">
        {steps.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span>0{index + 1}</span>
              {item.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="webStepPanel" aria-live="polite" aria-atomic="true">
        <p className="webStepCount">
          STEP {selected + 1} OF {steps.length}
        </p>
        <h4>{step.title}</h4>
        <ol className="webStateDiagram" aria-label={`${step.title}: state diagram`}>
          {step.nodes.map((node, index) => (
            <li key={`${index}-${node}`}>
              <span>{index + 1}</span>
              <code>{node}</code>
            </li>
          ))}
        </ol>
        <p>{step.explanation}</p>
      </div>
      <div className="webStepControls">
        <button type="button" disabled={selected === 0} onClick={() => setSelected(selected - 1)}>
          ← Previous step
        </button>
        <button
          type="button"
          disabled={selected === steps.length - 1}
          onClick={() => setSelected(selected + 1)}
        >
          Next step →
        </button>
        <button type="button" disabled={selected === 0} onClick={() => setSelected(0)}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default function WebLesson({ course, slug, content }) {
  return (
    <div className="dedicatedStructuredArticle webLesson">
      <section id="overview">
        <p className="lead">{content.intro}</p>
        <p className="webEyebrow">{course} · LEARN → TRACE → PRACTICE</p>
      </section>
      <section id="concepts">
        <h2>1. Understand the concept</h2>
        {content.concepts.map((concept, index) => (
          <div className="webConcept" key={concept}>
            <span aria-hidden="true">0{index + 1}</span>
            <p>{concept}</p>
          </div>
        ))}
      </section>
      <section id="example">
        <h2>2. Worked example</h2>
        <p className="webExampleNote">
          Use the example in a practice file. Comments identify required markup, files, or tooling.
          Expected errors are marked explicitly.
        </p>
        <pre tabIndex={0} aria-label={`${course} code example`}>
          <code>{content.code}</code>
        </pre>
        <h3>Step-by-step visual walkthrough</h3>
        <StepVisual key={slug} steps={content.steps} />
        <WebLessonLab key={`lab-${slug}`} course={course} slug={slug} />
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes and trade-offs</h2>
        <div className="webTakeaway">
          <p>{content.mistake}</p>
        </div>
      </section>
      <section id="check">
        <h2>4. Practice and check your understanding</h2>
        <div className="quiz">
          <p>{content.exercise}</p>
          <details key={slug}>
            <summary>Reveal explanation and expected result</summary>
            <p>{content.answer}</p>
          </details>
        </div>
        <p className="webReference">
          Continue learning:{" "}
          <a href={content.reference} target="_blank" rel="noopener noreferrer">
            Reference documentation ↗
          </a>
        </p>
      </section>
    </div>
  );
}
