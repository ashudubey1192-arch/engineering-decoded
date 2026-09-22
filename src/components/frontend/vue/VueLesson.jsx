import { vueLessons } from "../../../data/vueLessons.js";
import "../react/css/ReactLesson.css";

export default function VueLesson({ slug }) {
  const content = vueLessons[slug];
  return (
    <div className="dedicatedStructuredArticle reactLesson">
      <section id="overview">
        <p className="lead">{content.intro}</p>
        <p className="reactLessonEyebrow">VUE 3 · CONCEPT → EXAMPLE → PRACTICE</p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>{content.concepts}</p>
      </section>
      <section id="example">
        <h2>2. Worked example</h2>
        <p>
          Use a separate Vue 3 practice project. File comments identify excerpts and prerequisites;
          these examples are displayed here, not executed.
        </p>
        <pre tabIndex={0} aria-label="Vue lesson code example">
          <code>{content.code}</code>
        </pre>
        <h3>Walk through the result</h3>
        <p>{content.walkthrough}</p>
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
