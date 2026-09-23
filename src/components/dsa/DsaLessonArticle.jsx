import { runDsaAlgorithm } from "../../data/dsaAlgorithms.js";
import { dsaAlgorithmSources } from "../../data/dsaAlgorithmSources.js";
import { dsaLessons, getDsaLesson } from "../../data/dsaLessons.js";
import { dsaReference } from "../../data/dsaLessonSchema.js";
import DsaVisualizer from "./DsaVisualizer.jsx";
import "./DsaLessonArticle.css";

export default function DsaLessonArticle({ courseSlug, lessonSlug }) {
  const lesson = getDsaLesson(courseSlug, lessonSlug);
  if (!lesson) throw new Error(`Unknown DSA lesson: ${courseSlug}/${lessonSlug}`);
  const course = dsaLessons[courseSlug];
  const result = runDsaAlgorithm(lesson.algorithm, lesson.input).result;
  const source = `${dsaAlgorithmSources[lesson.algorithm]}\n\n// Run the worked example. No visualization callback is required.\nconst input = ${JSON.stringify(lesson.input, null, 2)};\nconsole.log(${lesson.algorithm}(input));`;
  return (
    <div className="dedicatedStructuredArticle dsaLesson">
      <section id="overview">
        <p className="dsaEyebrow">
          {course.name} / {lesson.title}
        </p>
        <p className="lead">{lesson.intro}</p>
        <p className="dsaPrerequisites">
          <strong>Before you start:</strong> {course.prerequisites}
        </p>
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
        <h3>Implementation · JavaScript</h3>
        <p>
          This implementation powers the visual lab. The optional <code>emit</code> callback records
          snapshots; its default does nothing. Copy the complete example into a modern JavaScript
          runtime to run it independently. This page does not execute code typed by readers.
        </p>
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
      <section id="mistakes">
        <h2>Common mistake and boundary checks</h2>
        <p>{lesson.mistake}</p>
        <p>
          Before adapting the implementation, make its input contract explicit. Check the smallest
          permitted input, boundary positions, duplicate handling, and any ordering or numeric
          assumptions used by its proof.
        </p>
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
        <p className="dsaReference">
          Curriculum reference:{" "}
          <a href={dsaReference} target="_blank" rel="noreferrer">
            TutorialsPoint — Data Structures and Algorithms
          </a>
          . Explanations, implementations, and visual traces on this page are original teaching
          material.
        </p>
      </section>
    </div>
  );
}
