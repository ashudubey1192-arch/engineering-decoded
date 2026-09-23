import { useState } from "react";
import { databaseLessons } from "../../data/databaseLessons.js";
import "./DatabaseLessonArticle.css";

function LessonContent({ lesson }) {
  const [stage, setStage] = useState(0);
  const stages = [
    { title: "Understand the decision", text: lesson.concept },
    { title: `Apply it to ${lesson.course}`, text: lesson.specific },
    { title: "Trace the behavior", text: lesson.trace },
  ];

  return (
    <div className="dedicatedStructuredArticle databaseLesson">
      <section id="overview">
        <p className="databaseLessonMeta">
          {lesson.course} · {lesson.section} · Lesson {lesson.position}
        </p>
        <p className="lead">{lesson.concept}</p>
        <aside className="databaseLessonContext" aria-label="Course environment">
          <strong>Course environment</strong>
          <p>{lesson.context}</p>
        </aside>
      </section>
      <section id="concepts">
        <h2>Key concepts</h2>
        <p>{lesson.detail}</p>
        <h3>{lesson.title} in practice</h3>
        <p>{lesson.specific}</p>
        <div className="databaseWalkthrough">
          <h3>Decision walkthrough</h3>
          <div className="databaseWalkthroughTabs" role="group" aria-label="Walkthrough steps">
            {stages.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-pressed={stage === index}
                onClick={() => setStage(index)}
              >
                {index + 1}. {item.title}
              </button>
            ))}
          </div>
          <div className="databaseWalkthroughPanel" aria-live="polite" aria-atomic="true">
            <strong>{stages[stage].title}</strong>
            <p>{stages[stage].text}</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>Practical example</h2>
        <p>
          The section lab below supplies a concrete setting for this lesson. Read its expected
          result, then use the knowledge check to test the decision discussed above.
        </p>
        {lesson.prerequisites.length > 0 && (
          <details className="databasePrerequisites">
            <summary>Earlier lab setup</summary>
            <p>
              Examples that refer to an earlier fixture use the same disposable environment.
              Complete the relevant setup before running them.
            </p>
            <ul>
              {lesson.prerequisites.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.title}</a>
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="databaseCodeLabel">{lesson.lab.label}</p>
        <pre>
          <code>{lesson.lab.code}</code>
        </pre>
        <h3>Expected result and interpretation</h3>
        <p>{lesson.lab.result}</p>
      </section>
      <section id="mistakes">
        <h2>Common mistake</h2>
        <p>{lesson.mistake}</p>
        <p>
          <strong>Check the boundary:</strong> {lesson.specific}
        </p>
      </section>
      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <p>{lesson.task}</p>
          <details>
            <summary>Reveal explanation and expected result</summary>
            <p>{lesson.answer}</p>
          </details>
        </div>
        <p className="databaseReference">
          <a href={lesson.reference} target="_blank" rel="noreferrer">
            Official reference for {lesson.course}
          </a>
          <span>
            {" "}
            — Check the selected product and version for exact syntax, deployment requirements, and
            guarantees.
          </span>
        </p>
      </section>
    </div>
  );
}

export default function DatabaseLessonArticle({ courseSlug, lessonSlug }) {
  const lesson = databaseLessons[courseSlug]?.[lessonSlug];
  if (!lesson) throw new Error(`Unknown database lesson: ${courseSlug}/${lessonSlug}`);
  return <LessonContent key={`${courseSlug}/${lessonSlug}`} lesson={lesson} />;
}
