import { nextJsLessons } from "../../../data/nextJsLessons.js";
import NextJsDemos from "./NextJsDemos";
import "./css/NextJsLesson.css";

export default function NextJsLesson({ slug }) {
  const content = nextJsLessons[slug];
  return (
    <div className="dedicatedStructuredArticle reactLesson nextJsLesson">
      <section id="overview">
        <p className="lead">{content.intro}</p>
        <p className="reactLessonEyebrow">NEXT.JS · CONCEPT → EXAMPLE → PRACTICE</p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        {content.concepts.map((concept, index) => (
          <div className="reactConcept" key={concept}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p>{concept}</p>
          </div>
        ))}
        <figure className="reactFlow">
          <figcaption>Visual model</figcaption>
          <ol>
            {content.flow.map((step, index) => (
              <li key={step}>
                <small>STEP {index + 1}</small>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <p className="diagramCaption">{content.flow.join(" → ")}</p>
        </figure>
      </section>
      <section id="example">
        <h2>2. Worked example</h2>
        <p>
          Code examples are for your practice application. Comments identify file boundaries,
          prerequisites, and partial excerpts.
        </p>
        <pre tabIndex={0} aria-label="Lesson code example">
          <code>{content.code}</code>
        </pre>
        <h3>Walk through the result</h3>
        <p>{content.walkthrough}</p>
        <NextJsDemos key={slug} slug={slug} />
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="reactTakeaway">
          <strong>Watch for this</strong>
          <p>{content.mistake}</p>
        </div>
      </section>
      <section id="check">
        <h2>4. Practice and knowledge check</h2>
        <div className="quiz">
          <small>TRY IT YOURSELF</small>
          <p>{content.exercise}</p>
          <details key={slug}>
            <summary>Reveal explanation</summary>
            <p>{content.answer}</p>
          </details>
        </div>
        <p className="reactReference">
          Go deeper:{" "}
          <a href={content.reference} target="_blank" rel="noopener noreferrer">
            Official documentation ↗
          </a>
        </p>
      </section>
    </div>
  );
}
