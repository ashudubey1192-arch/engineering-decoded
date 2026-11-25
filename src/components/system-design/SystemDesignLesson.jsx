import RichText from "./RichText";
import SystemDesignMotion, { SystemDesignFigure } from "./SystemDesignMotion";
import { Answers, Choice } from "./SystemDesignDepth";
import "./system-design-fundamentals/conceptArticle.css";

// Reading order: scenario → subtopics → picture → simulation → worked example →
// trade-offs → mistakes → check → interview. Content: src/data/systemDesign/lessons.
export default function SystemDesignLesson({ content }) {
  const { intro, scene, parts, table, anim, example, code, use, avoid } = content;
  const { mistakes, qa, check, answer, take } = content;
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          <RichText text={intro} />
        </p>
        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            <RichText text={scene} />
          </p>
        </div>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        {parts.map(([heading, text, points]) => (
          <div key={heading}>
            <h3>{heading}</h3>
            <p>
              <RichText text={text} />
            </p>
            {points && (
              <ul>
                {points.map((point) => (
                  <li key={point}>
                    <RichText text={point} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {table && (
          <table className="miniTable">
            <caption>{table[0]}</caption>
            <thead>
              <tr>
                {table[1].map((cell) => (
                  <th key={cell}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table[2].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={index}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <SystemDesignFigure
          animation={anim}
          caption={`${anim.title}. Numbers show when each connection is first used.`}
        />
        <SystemDesignMotion id="concept-animation" animation={anim} />
      </section>
      <section id="example">
        <h2>2. Worked example, step by step</h2>
        <ol className="stepList">
          {example.map(([title, text]) => (
            <li key={title}>
              <b>{title}.</b> <RichText text={text} />
            </li>
          ))}
        </ol>
        {code && (
          <pre tabIndex={0} aria-label="Example code">
            <code>{code}</code>
          </pre>
        )}
        <h3>Choosing it</h3>
        <Choice use={use} avoid={avoid} />
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="mistakeGrid">
          {mistakes.map(([title, text], index) => (
            <div key={title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <h3>{title}</h3>
              <p>
                <RichText text={text} />
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            <RichText text={check} />
          </p>
          <details>
            <summary>Reveal the model answer</summary>
            <p>
              <RichText text={answer} />
            </p>
          </details>
        </div>
      </section>
      <section id="interview">
        <h2>5. Interview questions</h2>
        <Answers items={qa} />
      </section>
      <p className="takeaway">
        <RichText text={take} />
      </p>
    </div>
  );
}
