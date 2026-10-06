import { useState } from "react";
import { getDsaDeepDive } from "../../data/dsaDeepDives.js";

export default function DsaDeepDive({ courseSlug, lessonSlug }) {
  const [activeStep, setActiveStep] = useState(0);
  const guide = getDsaDeepDive(courseSlug, lessonSlug);
  if (!guide) return null;
  const frame = guide.frames[activeStep];

  return (
    <section className="dsaDeepDive" id="topic-deep-dive" aria-labelledby="dsa-deep-dive-title">
      <p className="dsaEyebrow">Topic companion · a second worked example</p>
      <h2 id="dsa-deep-dive-title">{guide.title}</h2>
      <p>{guide.explanation}</p>
      <div className="dsaConceptPlayer">
        <h3>Follow the decisions</h3>
        <p>Select a step to see what changes and why.</p>
        <div className="dsaStepPicker" role="group" aria-label="Worked example steps">
          {guide.frames.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-pressed={index === activeStep}
              onClick={() => setActiveStep(index)}
            >
              <span>{index + 1}</span>
              {item.title}
            </button>
          ))}
        </div>
        <figure className="dsaConceptFrame" aria-live="polite" aria-atomic="true">
          <figcaption>
            Step {activeStep + 1} of {guide.frames.length}: {frame.title}
          </figcaption>
          <ul className="dsaConceptCells" aria-label="Example state">
            {frame.cells.map((cell, index) => (
              <li key={index}>{cell}</li>
            ))}
          </ul>
          <p>{frame.detail}</p>
        </figure>
        <div className="dsaControls">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
          >
            Previous step
          </button>
          <button
            type="button"
            disabled={activeStep === guide.frames.length - 1}
            onClick={() => setActiveStep(activeStep + 1)}
          >
            Next step
          </button>
          <button type="button" disabled={activeStep === 0} onClick={() => setActiveStep(0)}>
            Restart example
          </button>
        </div>
        <details className="dsaFullWalkthrough">
          <summary>Read all steps together</summary>
          <ol>
            {guide.frames.map((item) => (
              <li key={item.title}>
                <strong>{item.title}.</strong> {item.detail}
              </li>
            ))}
          </ol>
        </details>
      </div>
      <div className="dsaDeepDiveNotes">
        <aside>
          <h3>Where you would use it</h3>
          <p>{guide.application}</p>
        </aside>
        <aside>
          <h3>Cost and trade-offs</h3>
          <p>{guide.tradeoff}</p>
        </aside>
      </div>
      <div className="quiz">
        <h3>Check your understanding</h3>
        <p>{guide.question}</p>
        <details>
          <summary>Reveal the explanation</summary>
          <p>{guide.answer}</p>
        </details>
      </div>
    </section>
  );
}
