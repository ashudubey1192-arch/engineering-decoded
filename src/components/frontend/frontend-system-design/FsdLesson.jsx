import { frontendSystemDesignLessons } from "../../../data/fsdLessons";
import ReactMotion from "../react/ReactMotion";
import FsdPracticeLab from "./FsdPracticeLabs";
import "../react/css/ReactLesson.css";
import "../react/css/ReactPractice.css";

// Same reading order as the React course: concept → animated model → worked example →
// mistakes → knowledge check. Content comes from src/data/fsdLessons*.js.
export default function FsdLesson({ slug }) {
  const content = frontendSystemDesignLessons[slug];
  return (
    <div className="dedicatedStructuredArticle reactLesson">
      <section id="overview">
        <p className="lead">{content.intro}</p>
        <p className="reactLessonEyebrow">FRONTEND SYSTEM DESIGN · CONCEPT → EXAMPLE → PRACTICE</p>
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
        {content.animation && <ReactMotion key={slug} animation={content.animation} />}
      </section>
      <section id="example">
        <h2>2. Worked example</h2>
        <p>
          Examples are original, trimmed to the parts that matter for the design. Comments mark
          file boundaries and the pieces you would wire into your own app.
        </p>
        <pre tabIndex={0} aria-label="Lesson code example">
          <code>{content.code}</code>
        </pre>
        <h3>Walk through the result</h3>
        <p>{content.walkthrough}</p>
        <FsdPracticeLab key={`lab-${slug}`} slug={slug} />
        {content.deepDive.map((part) => (
          <div className="reactDeepDive" key={part.heading}>
            <h3>{part.heading}</h3>
            {part.paragraphs?.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {part.points && (
              <ul>
                {part.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
            {part.code && (
              <pre tabIndex={0} aria-label={`${part.heading} code`}>
                <code>{part.code}</code>
              </pre>
            )}
          </div>
        ))}
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
      </section>
    </div>
  );
}
