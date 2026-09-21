import { useEffect, useId, useState } from "react";
import { reactLessons } from "../../../data/reactLessons";
import "./css/ReactLesson.css";

function SnapshotDemo() {
  const [count, setCount] = useState(0);
  const [trace, setTrace] = useState("Choose an update to inspect its queue.");
  function replace() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    setTrace(`Snapshot ${count}: replace with ${count + 1} three times → ${count + 1}.`);
  }
  function update() {
    setCount((value) => value + 1);
    setCount((value) => value + 1);
    setCount((value) => value + 1);
    setTrace(`Snapshot ${count}: ${count} → ${count + 1} → ${count + 2} → ${count + 3}.`);
  }
  return (
    <div className="reactLab">
      <h3>State queue playground</h3>
      <p>Both buttons queue three updates. Predict the result before clicking.</p>
      <output className="reactLabNumber" aria-label="Current count">
        {count}
      </output>
      <div className="reactLabActions">
        <button onClick={replace}>Three replacement updates</button>
        <button onClick={update}>Three functional updates</button>
        <button
          onClick={() => {
            setCount(0);
            setTrace("Reset to zero.");
          }}
        >
          Reset
        </button>
      </div>
      <p role="status">{trace}</p>
    </div>
  );
}

const initialCourses = [
  { id: "react", title: "React", complete: false },
  { id: "css", title: "CSS", complete: false },
  { id: "javascript", title: "JavaScript", complete: false },
];

function ListDemo() {
  const [courses, setCourses] = useState(initialCourses);
  const [query, setQuery] = useState("");
  const visible = courses.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="reactLab">
      <h3>Explore a list with stable identity</h3>
      <p>
        Complete a course, reverse the list, then filter. Its completion stays attached to its ID.
      </p>
      <label>
        Filter courses
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="reactLabActions">
        <button onClick={() => setCourses((items) => [...items].reverse())}>Reverse order</button>
        <button
          onClick={() => {
            setCourses(initialCourses);
            setQuery("");
          }}
        >
          Reset list
        </button>
      </div>
      <ul className="reactLabList">
        {visible.map((course) => (
          <li key={course.id}>
            <label>
              <input
                type="checkbox"
                checked={course.complete}
                onChange={(event) => {
                  const complete = event.target.checked;
                  setCourses((items) =>
                    items.map((item) => (item.id === course.id ? { ...item, complete } : item)),
                  );
                }}
              />
              {course.title}
            </label>
            <code>key: {course.id}</code>
          </li>
        ))}
      </ul>
      <p role="status">
        {visible.length === 0
          ? "No matching courses."
          : `${visible.length} shown · ${courses.filter((course) => course.complete).length} complete`}
      </p>
    </div>
  );
}

function PropsDemo() {
  const [title, setTitle] = useState("React");
  const [level, setLevel] = useState("Beginner");
  return (
    <div className="reactLab">
      <h3>Change the props, inspect the output</h3>
      <div className="reactLabFields">
        <label>
          title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          level
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
      </div>
      <pre tabIndex={0} aria-label="Current props">
        <code>{`<CourseCard title=${JSON.stringify(title)} level=${JSON.stringify(level)} />`}</code>
      </pre>
      <div className="reactPreview">
        <small>RENDERED CARD</small>
        <h3>{title || "Untitled course"}</h3>
        <p>{level}</p>
      </div>
      <p>
        The parent owns these values. The card derives its heading and level from the supplied
        props.
      </p>
    </div>
  );
}

function TickingClock() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p>
      Mounted timer: <strong>{seconds}s</strong>. One active interval.
    </p>
  );
}

function EffectDemo() {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="reactLab">
      <h3>Mount → setup → cleanup</h3>
      <p>
        Mount the timer to create an interval. Unmount it to run cleanup. A new mount starts fresh
        state.
      </p>
      <button onClick={() => setMounted((value) => !value)}>
        {mounted ? "Unmount timer" : "Mount timer"}
      </button>
      {mounted ? <TickingClock /> : <p>Timer unmounted. No active interval.</p>}
      <p role="status">
        {mounted
          ? "Effect setup creates the interval."
          : "Any previous timer interval has been cleared."}
      </p>
    </div>
  );
}

function FormDemo() {
  const id = useId();
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState("");
  const error = title.trim().length < 3 ? "Use at least three characters for your plan." : "";
  return (
    <div className="reactLab">
      <h3>Validate a study plan</h3>
      <p>
        Try an empty or short title, then correct it. This demo only keeps the result in memory.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (!error) setSaved(title.trim());
        }}
      >
        <label htmlFor={id}>Plan title</label>
        <input
          id={id}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setSaved("");
          }}
          aria-invalid={submitted && Boolean(error)}
          aria-describedby={submitted && error ? `${id}-error` : undefined}
        />
        {submitted && error && (
          <p id={`${id}-error`} role="alert">
            {error}
          </p>
        )}
        <div className="reactLabActions">
          <button type="submit">Validate plan</button>
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setSubmitted(false);
              setSaved("");
            }}
          >
            Reset form
          </button>
        </div>
        <p role="status">{saved ? `Valid plan: ${saved}` : "No plan submitted."}</p>
      </form>
    </div>
  );
}

function LessonDemo({ slug }) {
  if (
    [
      "state-and-events--state-as-a-snapshot",
      "state-and-events--component-state",
      "react-hooks--usestate",
    ].includes(slug)
  )
    return <SnapshotDemo />;
  if (
    [
      "jsx-and-components--rendering-lists-and-keys",
      "state-and-events--updating-arrays-in-state",
      "state-and-events--lifting-state-up",
      "react-hooks--usememo",
    ].includes(slug)
  )
    return <ListDemo />;
  if (
    ["react-hooks--useeffect", "react-hooks--effect-cleanup", "react-hooks--custom-hooks"].includes(
      slug,
    )
  )
    return <EffectDemo />;
  if (
    [
      "forms--building-react-forms",
      "forms--form-validation",
      "state-and-events--controlled-components",
      "production-react--accessibility",
    ].includes(slug)
  )
    return <FormDemo />;
  if (
    [
      "jsx-and-components--props",
      "jsx-and-components--functional-components",
      "jsx-and-components--component-composition",
      "react-foundations--what-is-react",
      "react-foundations--declarative-ui",
    ].includes(slug)
  )
    return <PropsDemo />;
  return null;
}

export default function ReactLesson({ slug }) {
  const content = reactLessons[slug];
  return (
    <div className="dedicatedStructuredArticle reactLesson">
      <section id="overview">
        <p className="lead">{content.intro}</p>
        <p className="reactLessonEyebrow">REACT JS · CONCEPT → EXAMPLE → PRACTICE</p>
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
      </section>
      <section id="example">
        <h2>2. Worked example</h2>
        <p>
          Code examples are for your practice application. Comments identify file boundaries,
          prerequisites, and partial excerpts.
        </p>
        <pre tabIndex={0} aria-label="Lesson code example">
          <code>{content.code}</code>
        </pre>
        <h3>Walk through the result</h3>
        <p>{content.walkthrough}</p>
        <LessonDemo key={slug} slug={slug} />
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
