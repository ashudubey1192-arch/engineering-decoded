import JavaCode from "../backend/java/jsx/JavaCode";
import JavaTopicVisual from "../backend/java/visuals/JavaTopicVisual";
import JavaVisuals from "../backend/java/visuals/JavaVisuals";
import { useState } from "react";
import { javaStructureLessons } from "../../data/javaStructureLessons.js";
import "./JavaStructureArticle.css";

function Walkthrough({ lesson }) {
  const [step, setStep] = useState(0);
  const frame = lesson.frames[step];
  return (
    <div className="javaStructureTrace">
      <div className="javaStructureControls">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Previous
        </button>
        <span>
          Step {step + 1} of {lesson.frames.length}
        </span>
        <button disabled={step === lesson.frames.length - 1} onClick={() => setStep(step + 1)}>
          Next →
        </button>
        <button onClick={() => setStep(0)}>Reset</button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <h3>{frame.label}</h3>
        <div className="javaStructureCells">
          {frame.cells.map((cell, i) => (
            <div key={i}>
              <small>State {i + 1}</small>
              <strong>{cell}</strong>
            </div>
          ))}
        </div>
        <p>{frame.explanation}</p>
      </div>
      <details>
        <summary>Read the complete walkthrough</summary>
        <ol>
          {lesson.frames.map((f, i) => (
            <li key={i}>
              <b>{f.label}:</b> {f.explanation} <code>{f.cells.join(" | ")}</code>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

export default function JavaStructureArticle({ lessonSlug }) {
  const lesson = javaStructureLessons[lessonSlug];
  return (
    <div className="javaStructureArticle">
      <section id="overview">
        <p className="lead">{lesson.concept}</p>
        <p>
          Java 21+ • Prerequisites: loops, methods, classes and generics. Read the invariant,
          predict the next state, then run the example locally.
        </p>
      </section>
      <section id="concepts">
        <JavaVisuals key={lessonSlug} slug={lessonSlug} />
        <h2>Reason about correctness</h2>
        <blockquote>{lesson.invariant}</blockquote>
        <h3>Time and space</h3>
        <p>{lesson.complexity}</p><JavaTopicVisual title={lesson.title} text={lesson.concept + "\n\n" + lesson.invariant + "\n\n" + lesson.complexity} />
      </section>
      <section id="example">
        <h2>Step-by-step visual walkthrough</h2>
        <p>
          These are worked-example snapshots. Read the labels inside each box; boxes can represent
          pointers, containers, or results.
        </p>
        <Walkthrough key={lessonSlug} lesson={lesson} />
        <h2>Runnable Java example</h2>
        <p>
          Save as Main.java, then run <code>javac --release 21 Main.java</code> and{" "}
          <code>java Main</code>. Examples run locally, not in this browser.
        </p>
        <pre>
          <JavaCode>{lesson.code}</JavaCode>
        </pre>
        <h3>Expected output</h3>
        <pre>
          <JavaCode output>{lesson.output}</JavaCode>
        </pre>
      </section>
      <section id="mistakes">
        <h2>Common mistakes and edge cases</h2>
        <p>{lesson.pitfalls}</p>
        <h2>Apply it in a project</h2>
        <p>{lesson.project}</p>
      </section>
      <section id="check">
        <h2>Interview practice</h2>
        <p>{lesson.challenge}</p>
        <details>
          <summary>Reveal explanation</summary>
          <p>{lesson.answer}</p>
        </details>
        <h3>Practice routine</h3>
        <ol>
          <li>Clarify inputs, ownership, ordering, nulls and failure behavior.</li>
          <li>Give a simple solution, then explain what work the data structure avoids.</li>
          <li>State the invariant and trace a normal case by hand.</li>
          <li>Code without looking; test empty, singleton, duplicate and boundary cases.</li>
          <li>Explain worst-case versus expected or amortized cost, and production trade-offs.</li>
        </ol>
      </section>
    </div>
  );
}
