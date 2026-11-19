import ReactMotion from "../../../frontend/react/ReactMotion";
import "../../../frontend/react/css/ReactLesson.css";
import "../../../frontend/react/css/ReactPractice.css";
import "../css/CoreJavaLesson.css";

// Renders `code spans` written with backticks inside lesson prose.
function Prose({ text }) {
  return text.split("\n\n").map((paragraph, index) => (
    <p key={index}>
      {paragraph
        .split(/(`[^`]+`)/)
        .map((part, partIndex) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <code key={partIndex}>{part.slice(1, -1)}</code>
          ) : (
            part
          ),
        )}
    </p>
  ));
}

const anchor = (index) => `topic-${index + 1}`;

const modeNote = {
  compile:
    "This program compiles with the JDK alone but needs an external resource (such as a running database) to execute, so the output shown is from a sample run.",
  show: "This program needs a third-party library on the classpath, so the output shown is from a sample run.",
};

// Reading order: overview → every subtopic → animation → full program and output →
// mistakes → interview questions → practice. Content: src/data/coreJava/sections/*.js
export default function CoreJavaLesson({ section, slug, output }) {
  const lesson = section.lessons.find((item) => item.slug === slug);
  const [animTitle, nodes, steps] = lesson.anim;
  const animation = {
    title: animTitle,
    nodes: nodes.map(([id, label, sub]) => ({ id, label, sub })),
    steps: steps.map(([from, to, label, note]) => ({ from, to, label, note })),
  };
  const shownOutput = lesson.mode && lesson.mode !== "run" ? lesson.sample : output;

  return (
    <div className="dedicatedStructuredArticle reactLesson coreJavaLesson">
      <section id="overview">
        <Prose text={lesson.intro} />
        <p className="reactLessonEyebrow">
          CORE JAVA · {section.title.toUpperCase()} · EXPLANATION → ANIMATION → PROGRAM
        </p>
        <nav className="coreJavaTopics" aria-label="Topics in this lesson">
          <small>COVERED IN THIS LESSON</small>
          <ol>
            {lesson.topics.map(([title], index) => (
              <li key={title}>
                <a href={`#${anchor(index)}`}>{title}</a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section id="concepts">
        <h2>1. Every topic explained</h2>
        {lesson.topics.map(([title, text, snippet], index) => (
          <div className="coreJavaTopic" id={anchor(index)} key={title}>
            <h3>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> {title}
            </h3>
            <Prose text={text} />
            {snippet && (
              <pre tabIndex={0} aria-label={`${title} snippet`}>
                <code>{snippet}</code>
              </pre>
            )}
          </div>
        ))}
        <ReactMotion key={slug} animation={animation} />
      </section>

      <section id="example">
        <h2>2. Complete Java program</h2>
        <p>
          Save this as <code>Main.java</code>, then run <code>javac Main.java</code> and{" "}
          <code>java Main</code>
          {lesson.jvm ? (
            <>
              {" "}
              (with <code>{lesson.jvm.join(" ")}</code>)
            </>
          ) : null}
          .
        </p>
        <pre tabIndex={0} aria-label="Complete Java program">
          <code>{lesson.code}</code>
        </pre>
        <h3>Output</h3>
        {modeNote[lesson.mode] && <p className="coreJavaNote">{modeNote[lesson.mode]}</p>}
        {lesson.varies && (
          <p className="coreJavaNote">
            Threads run concurrently, so the order of some lines can differ from run to run.
          </p>
        )}
        <pre className="coreJavaOutput" tabIndex={0} aria-label="Program output">
          <code>{shownOutput || "(no output)"}</code>
        </pre>
        <h3>How the program works</h3>
        <Prose text={lesson.walk} />
      </section>

      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="reactTakeaway">
          <strong>Watch for these</strong>
          <ul>
            {lesson.mistakes.map((item) => (
              <li key={item}>
                <Prose text={item} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="interview">
        <h2>4. Interview questions</h2>
        {lesson.qa.map(([question, answer]) => (
          <details className="coreJavaQa" key={question}>
            <summary>{question}</summary>
            <Prose text={answer} />
          </details>
        ))}
      </section>

      <section id="check">
        <h2>5. Practice</h2>
        <div className="quiz">
          <small>TRY IT YOURSELF</small>
          <Prose text={lesson.ex[0]} />
          <details key={slug}>
            <summary>Reveal explanation</summary>
            <Prose text={lesson.ex[1]} />
          </details>
        </div>
      </section>
    </div>
  );
}
