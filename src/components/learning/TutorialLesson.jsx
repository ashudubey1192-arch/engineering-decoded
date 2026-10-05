import { getTutorialLesson } from "../../data/tutorialLessons";
import "./TutorialLesson.css";

export default function TutorialLesson({ module, track, article }) {
  const lesson = getTutorialLesson(module, track, article);
  const { mechanism } = lesson;
  return (
    <div className="tutorialLesson">
      <section id="overview">
        <p className="lead">{lesson.focus}</p>
        <p>{lesson.intro}</p>
        <div className="tutorialGoal">
          <strong>Learning goal</strong>
          <p>Apply {article.title.toLowerCase()} to a concrete {track.name} workflow. Explain the mechanism, trace an example, and verify the result before extending it.</p>
        </div>
      </section>
      <section id="concepts">
        <h2>1. {mechanism.title}</h2>
        <p>{mechanism.explanation}</p>
        <h3>Trace the behavior</h3>
        <p>Follow this worked example one step at a time. These traces describe behavior; they are not commands to run against a live service.</p>
        <pre><code>{mechanism.example}</code></pre>
      </section>
      <section id="example">
        <h2>2. Apply it in {track.name}</h2>
        <p>{lesson.project}</p>
        <ol>{lesson.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        {lesson.example !== mechanism.example && <pre><code>{lesson.example}</code></pre>}
        <div className="tutorialExpected"><strong>Expected result</strong><p>{lesson.expected}</p></div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistake and recovery</h2>
        <p>{mechanism.mistake}</p>
        <p>For this exercise, write down the starting conditions and the observed result. If the result differs from the expectation, identify the first step where the two diverge, correct that assumption, and repeat the same example.</p>
      </section>
      <section id="check">
        <h2>4. Practice and knowledge check</h2>
        <div className="quiz">
          <p><strong>{mechanism.question}</strong></p>
          <p>Write your answer before opening the explanation. Include a concrete example from the workflow above.</p>
          <details><summary>Reveal the explanation</summary><p>{mechanism.answer}</p></details>
        </div>
        <h3>Independent practice</h3>
        <p>Change one condition in the worked example. Predict the result, then trace the workflow again. Record the assumption that changed and how you would verify the new result.</p>
        <h3>Further reading</h3>
        <p><a href={lesson.reference} target="_blank" rel="noreferrer">Read the supporting documentation</a>. For product-specific implementation, check the documentation for the version you are using.</p>
        {module.id === "wellbeing" && <p>Additional evidence: <a href="https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety" target="_blank" rel="noreferrer">yoga</a> and <a href="https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety" target="_blank" rel="noreferrer">meditation and mindfulness</a>.</p>}
      </section>
    </div>
  );
}
