import { useState } from "react";

function HtmlStructureLab() {
  const [selected, setSelected] = useState("h1");
  const descriptions = {
    main: "main identifies the page's primary content region. It contains both the heading and paragraph.",
    h1: "h1 names the page topic. It is a child of main and a sibling of p.",
    p: "p contains the explanatory text. It follows h1 in document order.",
  };
  return (
    <div className="webLab">
      <h3>Explore the document tree</h3>
      <p>Select a node to connect markup, ancestry, and rendered content.</p>
      <div className="webStepControls" aria-label="Document nodes">
        {["main", "h1", "p"].map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selected === tag}
            onClick={() => setSelected(tag)}
          >{`<${tag}>`}</button>
        ))}
      </div>
      <div className="webDomTree" aria-label="Document tree">
        <code>body</code>
        <div data-selected={selected === "main"}>
          <code>└ main</code>
          <div data-selected={selected === "h1"}>
            <code>├ h1</code>
            <span>Study notes</span>
          </div>
          <div data-selected={selected === "p"}>
            <code>└ p</code>
            <span>Learn one concept each day.</span>
          </div>
        </div>
      </div>
      <div className="webLabPreview" aria-label="Rendered document model">
        <div className="webDomRegion" data-selected={selected === "main"}>
          <h4 data-selected={selected === "h1"}>Study notes</h4>
          <p data-selected={selected === "p"}>Learn one concept each day.</p>
        </div>
      </div>
      <output aria-live="polite">{descriptions[selected]}</output>
    </div>
  );
}

function BoxModelLab() {
  const [padding, setPadding] = useState(20);
  const [borderBox, setBorderBox] = useState(false);
  const border = 4;
  const margin = 16;
  const outer = borderBox ? 200 : 200 + padding * 2 + border * 2;
  const content = borderBox ? 200 - padding * 2 - border * 2 : 200;
  return (
    <div className="webLab">
      <h3>Adjust the box model</h3>
      <label>
        Padding on each side: {padding}px
        <input
          type="range"
          min="0"
          max="40"
          value={padding}
          onChange={(event) => setPadding(Number(event.target.value))}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={borderBox}
          onChange={(event) => setBorderBox(event.target.checked)}
        />{" "}
        Use border-box sizing
      </label>
      <div className="webLabPreview">
        <div className="webBoxMargin">
          Margin: 16px
          <div className="webBoxBorder" style={{ padding }}>
            <small>Border: 4px · Padding: {padding}px</small>
            <div className="webBoxContent">Content: {content}px</div>
          </div>
        </div>
      </div>
      <p className="webExampleNote">
        Schematic diagram: labels show exact calculated widths; the drawing scales to fit this
        lesson.
      </p>
      <output aria-live="polite">{`Declared width: 200px\nSizing: ${borderBox ? "border-box" : "content-box"}\nContent width: ${content}px\nBorder-box width: ${outer}px\nHorizontal footprint with margins: ${outer + margin * 2}px`}</output>
    </div>
  );
}

function LayoutLab() {
  const [mode, setMode] = useState("grid");
  const [columns, setColumns] = useState(3);
  return (
    <div className="webLab">
      <h3>Compare layout behavior</h3>
      <label>
        Layout mode
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="grid">Grid: shared columns</option>
          <option value="flex">Flexbox: independent rows</option>
        </select>
      </label>
      <label>
        Desired columns per row
        <select value={columns} onChange={(event) => setColumns(Number(event.target.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </label>
      <div
        className="webLayoutPreview"
        style={{
          display: mode,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {["HTML", "CSS", "JavaScript", "TypeScript", "Practice"].map((title) => (
          <div
            key={title}
            style={{ flex: `1 1 calc((100% - ${(columns - 1) * 12}px) / ${columns})`, minWidth: 0 }}
          >
            {title}
          </div>
        ))}
      </div>
      <output aria-live="polite">
        {mode === "grid"
          ? "Grid keeps shared column tracks. Empty cells on the last row remain empty."
          : "Each flex line distributes its own free space. Last-row items grow to fill that line."}
      </output>
    </div>
  );
}

const eventFrames = [
  {
    title: "Before execution",
    stack: "Script ready",
    tasks: "Empty",
    microtasks: "Empty",
    output: "(no output)",
  },
  {
    title: "Synchronous script finishes",
    stack: "Empty",
    tasks: "Timer callback D",
    microtasks: "Promise callback C",
    output: "A, B",
  },
  {
    title: "Promise reaction runs",
    stack: "Microtask checkpoint",
    tasks: "Timer callback D",
    microtasks: "Drained",
    output: "A, B, C",
  },
  {
    title: "Timer task runs",
    stack: "Timer callback completes",
    tasks: "Drained",
    microtasks: "Empty",
    output: "A, B, C, D",
  },
];

function EventLoopLab() {
  const [frame, setFrame] = useState(0);
  const state = eventFrames[frame];
  return (
    <div className="webLab">
      <h3>Trace the event loop</h3>
      <pre tabIndex={0}>
        <code>
          {
            "console.log('A');\nsetTimeout(() => console.log('D'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('B');"
          }
        </code>
      </pre>
      <p>
        This deterministic model illustrates queue order; it does not evaluate editable JavaScript.
      </p>
      <div className="webStepControls">
        <button type="button" disabled={frame === 0} onClick={() => setFrame(frame - 1)}>
          Back
        </button>
        <button
          type="button"
          disabled={frame === eventFrames.length - 1}
          onClick={() => setFrame(frame + 1)}
        >
          Advance execution
        </button>
        <button type="button" onClick={() => setFrame(0)}>
          Reset execution
        </button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <h4>{state.title}</h4>
        <dl className="webQueueGrid">
          <div>
            <dt>Call stack</dt>
            <dd>{state.stack}</dd>
          </div>
          <div>
            <dt>Microtasks</dt>
            <dd>{state.microtasks}</dd>
          </div>
          <div>
            <dt>Timer tasks</dt>
            <dd>{state.tasks}</dd>
          </div>
        </dl>
        <output>Console: {state.output}</output>
      </div>
    </div>
  );
}

function TypeNarrowingLab() {
  const [status, setStatus] = useState("loading");
  const states = {
    loading: {
      shape: "{ status: 'loading' }",
      available: "Only status is available. There is no data or error payload.",
      result: "Loading lessons…",
    },
    success: {
      shape: "{ status: 'success', titles: ['HTML', 'CSS'] }",
      available: "The success branch guarantees titles: string[].",
      result: "HTML, CSS",
    },
    error: {
      shape: "{ status: 'error', message: 'Request failed' }",
      available: "The error branch guarantees message: string.",
      result: "Request failed",
    },
  };
  return (
    <div className="webLab">
      <h3>Explore a narrowed state</h3>
      <p>
        This model shows which fields a discriminant check makes available. It is an illustration,
        not a TypeScript compiler.
      </p>
      <label>
        Runtime state
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="loading">Loading</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </label>
      <div className="webTypeBranches" aria-label="Possible union branches">
        {Object.keys(states).map((key) => (
          <span key={key} data-active={status === key}>
            {key}
            {status === key ? " ✓ selected" : " — excluded"}
          </span>
        ))}
      </div>
      <output aria-live="polite">{`${states[status].shape}\n\n${states[status].available}\n\nRendered message: ${states[status].result}`}</output>
    </div>
  );
}

export default function WebLessonLab({ course, slug }) {
  if (
    course === "HTML" &&
    [
      "getting-started--document-structure",
      "getting-started--how-the-web-uses-html",
      "content--semantic-html",
    ].includes(slug)
  )
    return <HtmlStructureLab />;
  if (
    course === "CSS" &&
    ["box-model--content-padding-border-margin", "box-model--sizing-strategies"].includes(slug)
  )
    return <BoxModelLab />;
  if (
    course === "CSS" &&
    ["layout--flexbox", "layout--css-grid", "box-model--display-modes"].includes(slug)
  )
    return <LayoutLab />;
  if (
    course === "JavaScript" &&
    ["async--event-loop", "async--promises", "async--async-and-await"].includes(slug)
  )
    return <EventLoopLab />;
  if (
    course === "TypeScript" &&
    [
      "narrowing--discriminated-unions",
      "narrowing--exhaustiveness",
      "production--error-design",
    ].includes(slug)
  )
    return <TypeNarrowingLab />;
  return null;
}
