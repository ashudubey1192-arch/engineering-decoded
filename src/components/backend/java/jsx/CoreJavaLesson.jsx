import ReactMotion from "../../../frontend/react/ReactMotion";
import "../../../frontend/react/css/ReactLesson.css";
import "../../../frontend/react/css/ReactPractice.css";
import "../css/CoreJavaLesson.css";

// Inline markup used in lesson prose: `code spans` and **bold**.
function Inline({ text }) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

// Paragraphs are separated by a blank line; a block whose lines all start with "- " or "1. "
// becomes a bulleted or numbered list ("  - " lines nest one level under the previous item).
function Prose({ text }) {
  return text.split("\n\n").map((block, index) => {
    const lines = block.split("\n");
    if (lines[0]?.startsWith("- ") && lines.every((line) => /^( {2})?- /.test(line))) {
      const items = [];
      for (const line of lines) {
        if (line.startsWith("  - ")) items[items.length - 1].children.push(line.slice(4));
        else items.push({ text: line.slice(2), children: [] });
      }
      return (
        <ul key={index}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <Inline text={item.text} />
              {item.children.length > 0 && (
                <ul>
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      <Inline text={child} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (lines.length > 1 && lines.every((line) => /^\d+\. /.test(line)))
      return (
        <ol key={index}>
          {lines.map((line, item) => (
            <li key={item}>
              <Inline text={line.replace(/^\d+\. /, "")} />
            </li>
          ))}
        </ol>
      );
    return (
      <p key={index}>
        <Inline text={block} />
      </p>
    );
  });
}

const anchor = (index) => `topic-${index + 1}`;

// Static picture of the same walkthrough the animation plays: one lifeline per participant
// and one numbered arrow per step, with the numbered notes as a legend underneath.
function StepDiagram({ title, nodes, steps }) {
  const column = 150;
  const width = Math.max(nodes.length * column, 460);
  const gap = (width - nodes.length * column) / 2;
  const x = Object.fromEntries(nodes.map(([id], index) => [id, gap + column * index + column / 2]));
  const rowTop = 78;
  const row = 44;
  const height = rowTop + steps.length * row + 12;
  return (
    <figure className="coreJavaDiagram">
      <figcaption>
        <small>DIAGRAM</small> {title}
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Diagram: ${title}`}>
        <defs>
          <marker id="cjArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="cjArrowHead" />
          </marker>
        </defs>
        {nodes.map(([id, label, sub]) => (
          <g key={id}>
            <line className="cjLife" x1={x[id]} x2={x[id]} y1={52} y2={height - 6} />
            <rect className="cjNode" x={x[id] - 66} y={6} width={132} height={46} rx={6} />
            <text className="cjLabel" x={x[id]} y={sub ? 26 : 34} textAnchor="middle">
              {label}
            </text>
            {sub && (
              <text className="cjSub" x={x[id]} y={42} textAnchor="middle">
                {sub}
              </text>
            )}
          </g>
        ))}
        {steps.map(([from, to, token], index) => {
          const y = rowTop + index * row;
          const x1 = x[from];
          const x2 = x[to];
          const self = from === to;
          const mid = self ? x1 + 40 : (x1 + x2) / 2;
          return (
            <g key={index}>
              {self ? (
                <path className="cjEdge" d={`M${x1} ${y - 6} h34 v14 h-30`} markerEnd="url(#cjArrow)" fill="none" />
              ) : (
                <line className="cjEdge" x1={x1} x2={x2 + (x2 > x1 ? -4 : 4)} y1={y} y2={y} markerEnd="url(#cjArrow)" />
              )}
              <circle className="cjBadge" cx={x1} cy={y} r={9} />
              <text className="cjBadgeText" x={x1} y={y + 4} textAnchor="middle">
                {index + 1}
              </text>
              <text className="cjToken" x={mid} y={y - 9} textAnchor={self ? "start" : "middle"}>
                {token}
              </text>
            </g>
          );
        })}
      </svg>
      <ol className="cjLegend">
        {steps.map(([, , token, note], index) => (
          <li key={index}>
            <strong>{token}</strong> — {note}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function runCommands(lesson) {
  const release = lesson.release && lesson.release !== 21 ? `--release ${lesson.release} ` : "";
  const preview = lesson.preview ? "--enable-preview " : "";
  const jvm = lesson.jvm ? `${lesson.jvm.join(" ")} ` : "";
  return [`javac ${release}${preview}Main.java`, `java ${preview}${jvm}Main`];
}

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
        <StepDiagram title={animTitle} nodes={nodes} steps={steps} />
        <ReactMotion key={slug} animation={animation} />
      </section>

      <section id="example">
        <h2>2. Complete Java program</h2>
        <p>
          Save this as <code>Main.java</code>, then run <code>{runCommands(lesson)[0]}</code> and{" "}
          <code>{runCommands(lesson)[1]}</code>
          {lesson.preview
            ? ` (uses preview features, so it needs exactly JDK ${lesson.release}; on a newer JDK change --release to that version)`
            : lesson.release > 21
              ? ` (needs JDK ${lesson.release} or newer)`
              : ""}
          .
        </p>
        <pre tabIndex={0} aria-label="Complete Java program">
          <code>{lesson.code}</code>
        </pre>
        <h3>Output</h3>
        {(lesson.note || modeNote[lesson.mode]) && (
          <p className="coreJavaNote">{lesson.note || modeNote[lesson.mode]}</p>
        )}
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
