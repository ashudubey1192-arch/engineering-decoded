import { runDsaAlgorithm } from "../../data/dsaAlgorithms.js";
import { dsaAlgorithmSources } from "../../data/dsaAlgorithmSources.js";
import { dsaLessons, getDsaLesson } from "../../data/dsaLessons.js";
import { dsaReference } from "../../data/dsaLessonSchema.js";
import { javaArrayTraces } from "../../data/javaArrayTraces.js";
import DsaVisualizer from "./DsaVisualizer.jsx";
import JavaAlgorithmGuide from "./JavaAlgorithmGuide.jsx";
import DsaDeepDive from "./DsaDeepDive.jsx";
import "./DsaLessonArticle.css";

export default function DsaLessonArticle({ courseSlug, lessonSlug }) {
  const lesson = getDsaLesson(courseSlug, lessonSlug);
  if (!lesson) throw new Error(`Unknown DSA lesson: ${courseSlug}/${lessonSlug}`);
  const course = dsaLessons[courseSlug];
  const result = lesson.java
    ? javaArrayTraces[lesson.java.id].result
    : runDsaAlgorithm(lesson.algorithm, lesson.input).result;
  const source =
    lesson.java?.source ||
    `${dsaAlgorithmSources[lesson.algorithm]}\n\n// Run the worked example. No visualization callback is required.\nconst input = ${JSON.stringify(lesson.input, null, 2)};\nconsole.log(${lesson.algorithm}(input));`;
  return (
    <div className="dedicatedStructuredArticle dsaLesson">
      <section id="overview">
        <p className="dsaEyebrow">
          {course.name} / {lesson.title}
        </p>
        <p className="lead">{lesson.intro}</p>
        <p className="dsaPrerequisites">
          <strong>Before you start:</strong> {lesson.prerequisites || course.prerequisites}
        </p>
        {course.group === "Algorithm techniques" && (
          <p>
            <a href="#java-algorithm-techniques">
              Study this topic in Java: examples, visual steps, interviews, and projects ↓
            </a>
          </p>
        )}
      </section>
      <section id="concepts">
        <h2>Understand the mechanism</h2>
        <p>{lesson.reasoning}</p>
        <aside className="dsaInvariant">
          <h3>The invariant to track</h3>
          <p>{lesson.invariant}</p>
        </aside>
        <div className="dsaComplexity">
          <div>
            <h3>Time complexity</h3>
            <p>{lesson.complexityTime}</p>
          </div>
          <div>
            <h3>Space complexity</h3>
            <p>{lesson.space}</p>
          </div>
        </div>
      </section>
      <DsaDeepDive
        key={`companion/${courseSlug}/${lessonSlug}`}
        courseSlug={courseSlug}
        lessonSlug={lessonSlug}
      />
      <section id="example">
        <h2>Work through an example</h2>
        <p>
          Read the input, predict the next change, then advance one step. Check that the invariant
          still holds before continuing.
        </p>
        <details className="dsaInput" open>
          <summary>Worked-example input</summary>
          <pre>
            <code>{JSON.stringify(lesson.input, null, 2)}</code>
          </pre>
        </details>
        <DsaVisualizer key={`${courseSlug}/${lessonSlug}`} lesson={lesson} />
        {lesson.steps && (
          <div className="dsaWalkthrough">
            <h3>Walk through the example</h3>
            <ol>
              {lesson.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        <h3>Implementation · {lesson.java ? "Java" : "JavaScript"}</h3>
        {lesson.java ? (
          <>
            <p>
              Save this complete program as <code>ArrayLesson.java</code> and run it with a JDK 17
              or later. The visual steps above were recorded by executing this Java program. The
              browser replays those steps; it does not compile edited Java code.
            </p>
            <pre>
              <code>
                {
                  "javac ArrayLesson.java\njava ArrayLesson\n# Optional: print the recorded steps as well\njava ArrayLesson --trace"
                }
              </code>
            </pre>
            <p>
              The <code>emit</code> method and JSON helper support the lesson visuals. They are not
              required in an interview solution; omit their calls when measuring algorithm
              performance.
            </p>
          </>
        ) : (
          <p>
            This implementation powers the visual lab. The optional <code>emit</code> callback
            records snapshots; its default does nothing. Copy the complete example into a modern
            JavaScript runtime to run it independently. This page does not execute code typed by
            readers.
          </p>
        )}
        <pre className="dsaSource">
          <code>{source}</code>
        </pre>
        <h3>Expected result for the original input</h3>
        <pre>
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
        <p className="dsaTraceCost">
          Complexity describes the algorithm as explained above. Recording and displaying snapshots
          adds teaching overhead; these small traces are not performance benchmarks.
        </p>
      </section>
      {course.group === "Algorithm techniques" && (
        <JavaAlgorithmGuide key={courseSlug} courseSlug={courseSlug} />
      )}
      <section id="mistakes">
        <h2>Common mistake and boundary checks</h2>
        <p>{lesson.mistake}</p>
        <p>
          Before adapting the implementation, make its input contract explicit. Check the smallest
          permitted input, boundary positions, duplicate handling, and any ordering or numeric
          assumptions used by its proof.
        </p>
        {lesson.boundaries && (
          <div className="dsaCaseTable">
            <table>
              <caption>Runnable boundary checks</caption>
              <thead>
                <tr>
                  <th scope="col">Invocation (replace the one in main)</th>
                  <th scope="col">Expected result</th>
                </tr>
              </thead>
              <tbody>
                {lesson.boundaries.map(({ invocation, expected }) => (
                  <tr key={invocation}>
                    <td>
                      <code>{invocation}</code>
                    </td>
                    <td>
                      <code>{JSON.stringify(expected)}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section id="check">
        <h2>Practice and explain</h2>
        <div className="quiz">
          <p>{lesson.exercise}</p>
          <details>
            <summary>Reveal the worked answer</summary>
            <p>{lesson.answer}</p>
          </details>
        </div>
        <p>
          After answering, explain which invariant justifies the result and identify one input that
          would expose the common mistake.
        </p>
        {lesson.project && (
          <aside className="dsaProject">
            <h3>Apply it in a project</h3>
            <p>{lesson.project}</p>
          </aside>
        )}
        {lesson.references ? (
          <div className="dsaReference">
            <h3>Official Java references</h3>
            <ul>
              {lesson.references.map((reference) => (
                <li key={reference.url}>
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    {reference.title}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              Explanations, examples, and practice material are original. Java behavior is
              referenced against Java SE 21 documentation.
            </p>
          </div>
        ) : (
          <p className="dsaReference">
            Curriculum reference:{" "}
            <a href={dsaReference} target="_blank" rel="noreferrer">
              TutorialsPoint — Data Structures and Algorithms
            </a>
            . Explanations, implementations, and visual traces on this page are original teaching
            material.
          </p>
        )}
      </section>
    </div>
  );
}
