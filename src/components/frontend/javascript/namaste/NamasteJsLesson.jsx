import { namasteJsLessons } from "../../../../data/namasteJs/lessons.js";
import { namasteJsArticles } from "../../../../data/namasteJs/outline.js";
import outputs from "../../../../data/namasteJs/outputs.json";
import ReactMotion from "../../react/ReactMotion";
import JsSnapshot from "./JsSnapshot";
import JsPlayground from "./JsPlayground";
import "../../react/css/ReactLesson.css";
import "../../react/css/ReactPractice.css";
import "./NamasteJs.css";

// Inline `code` spans inside prose.
function Rich({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={index}>{part.slice(1, -1)}</code>
    ) : (
      part
    ),
  );
}

// Reading order: idea → runtime image → animation → runnable example → sub-topics →
// mistakes → interview questions → practice.
export default function NamasteJsLesson({ slug }) {
  const content = namasteJsLessons[slug];
  const article = namasteJsArticles.find((item) => item.slug === slug);
  const output = content.mode === "browser" ? content.sample : outputs[slug];
  return (
    <div className="dedicatedStructuredArticle reactLesson njsLesson">
      <section id="overview">
        <p className="lead">
          <Rich text={content.intro} />
        </p>
        <p className="reactLessonEyebrow">NAMASTE JAVASCRIPT · {article.episode.toUpperCase()}</p>
      </section>

      <section id="concepts">
        <h2>1. Core concepts</h2>
        {content.concepts.map((concept, index) => (
          <div className="reactConcept" key={concept}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p>
              <Rich text={concept} />
            </p>
          </div>
        ))}
      </section>

      <section id="visuals">
        <h2>2. See it happen</h2>
        <JsSnapshot snapshot={content.snapshot} />
        <ReactMotion key={slug} animation={content.animation} />
      </section>

      <section id="example">
        <h2>3. Worked example</h2>
        <pre tabIndex={0} aria-label="Lesson code example">
          <code>{content.code}</code>
        </pre>
        <div className="njsOutput">
          <small>
            {content.mode === "browser" ? "OUTPUT IN A BROWSER CONSOLE" : "RECORDED OUTPUT (NODE.JS)"}
          </small>
          <pre>
            <code>{output || "(nothing is printed)"}</code>
          </pre>
        </div>
        <h3>Walk through the result</h3>
        <p>
          <Rich text={content.walkthrough} />
        </p>
        {content.mode === "browser" ? (
          <p className="njsNote">
            This example needs the browser&apos;s global object or DOM, so paste it into the DevTools
            console of any page (as a classic script, not a module) to try it.
          </p>
        ) : (
          <JsPlayground key={`play-${slug}`} code={content.code} expected={output} />
        )}
      </section>

      <section id="deep-dive">
        <h2>4. Sub-topics in depth</h2>
        {content.deepDive.map((part) => (
          <div className="reactDeepDive" key={part.heading}>
            <h3>{part.heading}</h3>
            {part.paragraphs?.map((text) => (
              <p key={text}>
                <Rich text={text} />
              </p>
            ))}
            {part.points && (
              <ul>
                {part.points.map((point) => (
                  <li key={point}>
                    <Rich text={point} />
                  </li>
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
        <h2>5. Common mistakes</h2>
        <div className="reactTakeaway">
          <strong>Watch for these</strong>
          <ul>
            {content.mistakes.map((mistake) => (
              <li key={mistake}>
                <Rich text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="interview">
        <h2>6. Interview questions</h2>
        {content.interview.map((item) => (
          <details className="njsQa" key={item.question}>
            <summary>
              <Rich text={item.question} />
            </summary>
            <p>
              <Rich text={item.answer} />
            </p>
          </details>
        ))}
      </section>

      <section id="check">
        <h2>7. Practice and knowledge check</h2>
        <div className="quiz">
          <small>TRY IT YOURSELF</small>
          <p>
            <Rich text={content.exercise} />
          </p>
          <details key={slug}>
            <summary>Reveal explanation</summary>
            <p>
              <Rich text={content.answer} />
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
