import { lesson } from "./reactLessonSchema.js";

export const applicationLessons = {
  "forms--building-react-forms": lesson(
    "A React form still relies on HTML semantics: labels identify controls, names identify submitted values, and a submit button triggers the form. Choose controlled state only where the interface needs it.",
    [
      "Use a form with onSubmit so keyboard and pointer submission follow the same path. A label and matching input ID provide an accessible name and a larger click target.",
      "FormData reads successful named controls at submission time. Disabled controls and unchecked checkboxes are not included; convert numbers and booleans deliberately.",
      "Controlled inputs are useful for live previews and dependent fields. Uncontrolled inputs with defaultValue can be simpler for forms that only need values at submission.",
    ],
    `import { useState } from 'react';
export default function StudyForm() {
  const [message, setMessage] = useState('');
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMessage('Planned ' + data.get('hours') + ' hours for ' + data.get('topic'));
  }
  return <form onSubmit={submit}>
    <label htmlFor="topic">Topic</label><input id="topic" name="topic" required />
    <label htmlFor="hours">Hours</label>
    <input id="hours" name="hours" type="number" min="1" max="20" defaultValue="3" required />
    <button type="submit">Create plan</button><p role="status">{message}</p>
  </form>;
}`,
    "Native validation runs before submission. The handler reads the named fields and updates a confirmation message. This local example does not save to a server; submission handling is introduced later.",
    ["Labeled controls", "Form submission", "Read named values"],
    "A placeholder is not a replacement for a label. An input without a name also will not appear under the expected key in FormData.",
    'Why is Number(data.get("hours")) needed before numeric arithmetic?',
    "Form field values are strings (or files). Explicit conversion avoids string concatenation and should be followed by range and validity checks.",
  ),
  "forms--form-validation": lesson(
    "Validation explains how to correct a value and prevents invalid data from moving forward. Combine browser constraints with domain rules, and always repeat authoritative validation on the server.",
    [
      "Use required, min, max, and appropriate input types for simple constraints. Domain rules, such as a meaningful plan title, need explicit application logic.",
      "Show errors near the field and connect them with aria-describedby. Set aria-invalid when a known error exists; do not mark untouched fields invalid immediately.",
      "Validation has timing: submission is a reliable checkpoint, while blur or subsequent edits can improve feedback. Preserve entered data after an error.",
    ],
    `import { useState } from 'react';
export default function PlanTitle() {
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const error = title.trim().length < 3 ? 'Use at least three characters.' : '';
  return <form onSubmit={event => { event.preventDefault(); setSubmitted(true); }}>
    <label htmlFor="plan-title">Plan title</label>
    <input id="plan-title" value={title} onChange={e => setTitle(e.target.value)}
      aria-invalid={submitted && Boolean(error)}
      aria-describedby={submitted && error ? 'title-error' : undefined} />
    {submitted && error && <p id="title-error" role="alert">{error}</p>}
    {submitted && !error && <p role="status">Title is valid.</p>}
    <button>Validate title</button>
  </form>;
}`,
    "Submit a two-character title to reveal the linked error, then type a longer title. The displayed result derives from the current value and submission state. No error string needs a separate synchronization Effect.",
    ["Read input", "Apply domain rule", "Explain correction"],
    "Client checks can be bypassed. The API must validate submitted data and enforce authorization independently of anything shown by React.",
    "Why trim before checking the title length?",
    "Whitespace alone should not satisfy the rule. Normalize deliberately and apply the same rule on the server so the accepted data is consistent.",
  ),
  "forms--dynamic-form-fields": lesson(
    "Dynamic forms let users add or remove repeated groups. Stable row IDs keep each input associated with the correct item as the array changes.",
    [
      "Store each row as an object with an ID and its field values. Generate the ID when adding the row; rendering must not assign a fresh identity.",
      "Use map to update a row and filter to remove it. A stable key protects focus and local state when earlier rows disappear.",
      'Give each control a label that distinguishes its row. Add and remove buttons inside the form need type="button" so they do not submit accidentally.',
    ],
    `import { useState } from 'react';
export default function Topics() {
  const [rows, setRows] = useState([{ id: 'first', topic: '' }]);
  return <form onSubmit={e => e.preventDefault()}>
    {rows.map((row, index) => <div key={row.id}>
      <label>Topic {index + 1}<input value={row.topic} onChange={e => {
        const topic = e.target.value;
        setRows(all => all.map(item => item.id === row.id ? { ...item, topic } : item));
      }} /></label>
      <button type="button" onClick={() => setRows(all => all.filter(item => item.id !== row.id))}>
        Remove topic {index + 1}
      </button>
    </div>)}
    <button type="button" onClick={() => setRows(all => [...all,
      { id: window.crypto.randomUUID(), topic: '' }])}>Add topic</button>
  </form>;
}`,
    "Add two topics, edit both, then remove the first. The remaining value stays attached to its ID. In a production form, also manage focus after removal and announce row changes when needed.",
    ["Create stable row ID", "Edit matching row", "Remove without shifting identity"],
    "Using the array index as the key can move component state to a different row after deletion. Labels can use display indexes; identity should not.",
    "Where should validation errors for repeated rows be stored?",
    "Associate errors with stable row IDs or derive them from each row’s current values. Position-based error arrays can become mismatched after reordering.",
  ),
  "forms--form-submission": lesson(
    "Submission is a small state machine: idle, pending, success, or failure. Preserve the user’s work on failure, prevent accidental repeats, and only announce success after the server confirms it.",
    [
      "Capture form values before awaiting a request. Async handlers should use try/catch and check response.ok because fetch does not reject for ordinary HTTP error statuses.",
      "A pending state provides visible feedback and disables the submit control. The backend should use appropriate idempotency rules for operations where duplicate requests matter.",
      "An injectable save function separates UI behavior from transport. The following component expects savePlan(data) to return a promise and reject on failure.",
    ],
    `import { useState } from 'react';
export default function SavePlan({ savePlan }) {
  const [status, setStatus] = useState('idle');
  async function submit(event) {
    event.preventDefault();
    if (status === 'pending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setStatus('pending');
    try { await savePlan(data); setStatus('success'); }
    catch { setStatus('error'); }
  }
  return <form onSubmit={submit}>
    <label>Title <input name="title" required /></label>
    <button disabled={status === 'pending'}>{status === 'pending' ? 'Saving…' : 'Save'}</button>
    <p role="status">{status === 'success' ? 'Saved.' : status === 'error' ? 'Could not save. Try again.' : ''}</p>
  </form>;
}`,
    "Pass a real API function or a local async stub as savePlan. While it is pending, the button reflects the work. A rejected promise shows a retryable error while leaving the input intact.",
    ["Submit values", "Pending request", "Success or recoverable error"],
    "Do not clear the form optimistically before you know whether saving succeeded. A failure should not destroy the draft.",
    "Where should field-specific server validation errors appear?",
    "Map them to the corresponding fields with linked descriptions, and keep a general status area for request failures that do not belong to one field.",
  ),
  "routing-and-data--client-side-routing": lesson(
    "Client-side routing maps the browser URL to a screen without requesting a full document on every internal navigation. This lesson uses React Router’s declarative mode, an additional package beyond React.",
    [
      "Install react-router in the practice app. BrowserRouter coordinates location and history; Routes chooses a matching Route, and Link performs internal navigation.",
      "URLs make screens shareable and support Back and Forward. Use links for navigation and buttons for actions; a clickable div loses useful browser behavior.",
      "The production host must serve the application entry for valid client routes. Otherwise a direct request to /courses can fail even when clicking there works.",
    ],
    `// Terminal: npm install react-router
import { BrowserRouter, Routes, Route, Link } from 'react-router';
export default function App() {
  return <BrowserRouter>
    <nav><Link to="/">Home</Link> <Link to="/courses">Courses</Link></nav>
    <Routes>
      <Route path="/" element={<h1>Study planner</h1>} />
      <Route path="/courses" element={<h1>Your courses</h1>} />
      <Route path="*" element={<h1>Page not found</h1>} />
    </Routes>
  </BrowserRouter>;
}`,
    "Click Courses, then use Back. Both the URL and rendered heading change. Reload /courses to verify the hosting fallback as a separate deployment concern.",
    ["URL /courses", "Route matching", "Courses screen"],
    "Do not add a second BrowserRouter inside an existing router. Place one routing owner around the application tree.",
    "Why test a pasted deep link as well as in-app navigation?",
    "A pasted link reaches the server first. Its rewrite rules must serve the app for valid client routes, while preserving API and asset requests.",
    "https://reactrouter.com/start/declarative/routing",
  ),
  "routing-and-data--nested-routes": lesson(
    "Nested routes express screens that share a layout. The parent renders persistent navigation and an Outlet where the matched child appears.",
    [
      "Child route paths are relative to their parent. An index route supplies the default content when the parent URL matches without a further segment.",
      "Dynamic segments such as :courseId expose values through useParams. Validate those values and handle an unknown resource instead of assuming every URL is valid.",
      "Layouts can preserve their own state while child pages change. Keep shared navigation in the parent and resource-specific content in the child.",
    ],
    `import { BrowserRouter, Routes, Route, Outlet, Link, useParams } from 'react-router';
function Layout() {
  return <main><h1>Courses</h1><Link to="react">React</Link><Outlet /></main>;
}
function Detail() {
  const { courseId } = useParams();
  return <h2>Course: {courseId}</h2>;
}
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="courses" element={<Layout />}>
      <Route index element={<p>Select a course.</p>} />
      <Route path=":courseId" element={<Detail />} />
    </Route>
  </Routes></BrowserRouter>;
}`,
    "At /courses, the Outlet shows the index message. At /courses/react, it shows Detail with courseId equal to react. The Courses heading remains in the parent layout.",
    ["Parent route layout", "Outlet placement", "Matched child route"],
    "A matched child does not appear if the parent forgets Outlet. Do not duplicate the shared layout inside every child to work around that omission.",
    "Where would a course-specific notes tab live?",
    "It can be a child route below :courseId, with another Outlet in the course detail layout if multiple detail tabs share a common header.",
    "https://reactrouter.com/start/declarative/routing",
  ),
  "routing-and-data--fetching-data": lesson(
    "Remote data introduces asynchronous timing and failures. A basic Effect can demonstrate request lifecycle, while production applications often use a router or data library for caching, deduplication, and server rendering.",
    [
      "Represent loading, success, and error explicitly. Check response.ok before reading a successful payload; HTTP 404 and 500 responses do not automatically reject fetch.",
      "When a query changes or a component unmounts, an older request may finish later. Abort supported requests and guard against obsolete responses updating the current view.",
      "The example expects GET /api/courses?q=... to return an array of objects with id and title. Supply that endpoint or mock it in the practice app.",
    ],
    `import { useEffect, useState } from 'react';
export default function Courses({ query = '' }) {
  const [result, setResult] = useState({ status: 'loading', data: [] });
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setResult({ status: 'loading', data: [] });
    async function load() {
      try {
        const response = await fetch('/api/courses?q=' + encodeURIComponent(query),
          { signal: controller.signal });
        if (!response.ok) throw new Error('Request failed');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid course list');
        if (active) setResult({ status: 'success', data });
      } catch (error) {
        if (active && error.name !== 'AbortError') setResult({ status: 'error', data: [] });
      }
    }
    load();
    return () => { active = false; controller.abort(); };
  }, [query]);
  if (result.status === 'loading') return <p role="status">Loading…</p>;
  if (result.status === 'error') return <p role="alert">Could not load courses.</p>;
  return <ul>{result.data.map(course => <li key={course.id}>{course.title}</li>)}</ul>;
}`,
    "A new query starts a new synchronization cycle. Cleanup marks the old cycle inactive and aborts its fetch. A late result from that cycle cannot overwrite the new query’s data. Validate item fields too at a real API boundary.",
    ["Query changes", "Request + cancellation", "Current result only"],
    "Do not make the Effect callback itself async; React expects a cleanup function or no return value, not a promise. Define an async function inside it.",
    "Why keep an active flag as well as aborting?",
    "It directly guards the state update if asynchronous work has already progressed or does not respond to cancellation. Aborting also avoids unnecessary request work when supported.",
    "https://react.dev/reference/react/useEffect#fetching-data-with-effects",
  ),
  "routing-and-data--loading-and-error-states": lesson(
    "A data-driven screen needs more than a successful list. Design the pending, empty, failed, and successful states so users know what is happening and what they can do next.",
    [
      "Loading means the answer is unknown; empty means a successful response contains no items. Render distinct messages so an empty collection is not mistaken for an unfinished request.",
      "An error message should explain the consequence and offer a useful recovery, such as retry. Avoid exposing raw stack traces or internal server details.",
      "Use a status region for progress and an alert for an actionable failure. Keep already useful content visible during background refresh when that fits the product.",
    ],
    `export default function Results({ status, courses, onRetry }) {
  if (status === 'loading') return <p role="status">Loading your courses…</p>;
  if (status === 'error') return <section>
    <p role="alert">Courses could not be loaded.</p>
    <button onClick={onRetry}>Try again</button>
  </section>;
  if (courses.length === 0) return <p>No courses yet. Add your first course.</p>;
  return <ul>{courses.map(course => <li key={course.id}>{course.title}</li>)}</ul>;
}`,
    "The component accepts request state from its owner. Render it with each status while developing, then wire onRetry to start a new request. Successful empty data gets its own next-step message.",
    ["Pending", "Success: empty or populated", "Failure: explain + retry"],
    "A spinner that never resolves on failure traps users. Ensure both success and error paths leave the pending state.",
    "What should happen to existing results during a refresh failure?",
    "Often retain the last successful results and show a refresh warning with retry. Model initial loading and background refresh separately when the distinction matters.",
  ),
  "routing-and-data--mutations-and-optimistic-updates": lesson(
    "A mutation changes server data. An optimistic update shows the intended result before confirmation, then reconciles with the server or restores the previous value when the request fails.",
    [
      "Optimism improves perceived responsiveness for predictable, reversible operations. Expensive or irreversible operations may need explicit pending confirmation instead.",
      "Record the prior value before applying the optimistic one. Handle failure visibly and avoid rolling back unrelated newer edits.",
      "This example serializes one toggle while saving. saveComplete(next) must return the confirmed boolean or reject; concurrent mutation support needs stronger ordering or version rules.",
    ],
    `import { useState } from 'react';
export default function OptimisticCompletion({ saveComplete }) {
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function toggle() {
    if (pending) return;
    const previous = complete;
    setComplete(!previous); setPending(true); setError('');
    try { setComplete(await saveComplete(!previous)); }
    catch { setComplete(previous); setError('Could not save. Change restored.'); }
    finally { setPending(false); }
  }
  return <section>
    <button onClick={toggle} disabled={pending}>{complete ? 'Complete' : 'Incomplete'}</button>
    <p role="status">{pending ? 'Saving…' : error}</p>
  </section>;
}`,
    "The label changes immediately while the button is disabled. Success uses the confirmed server value; rejection restores the prior value and explains the rollback. Try both resolving and rejecting save functions.",
    ["Immediate local change", "Server mutation", "Confirm or roll back"],
    "A rollback of the entire list can erase later successful edits. Isolate the changed entity and define a concurrency policy before allowing overlapping requests.",
    "Why disable the control during this example’s request?",
    "It limits the component to one in-flight toggle, making its captured previous value meaningful for rollback. More advanced interfaces can allow overlap with explicit reconciliation.",
  ),
  "performance--react-rendering-model": lesson(
    "Rendering calculates UI; committing applies the selected result to the DOM. Understanding that distinction prevents unnecessary optimizations and explains why pure components matter.",
    [
      "A state update schedules work for the component, and React normally renders its descendants as part of that work. A context change can also update consumers.",
      "A render is not a DOM replacement. Reconciliation reuses matching elements and preserves state according to component identity and position.",
      "Rendering may be repeated or abandoned. External mutations during render are unsafe because not every calculation becomes a committed screen.",
    ],
    `import { useState } from 'react';
function Heading() { return <h2>Weekly planner</h2>; }
export default function Planner() {
  const [hours, setHours] = useState(0);
  return <section><Heading /><p>{hours} hours</p>
    <button onClick={() => setHours(h => h + 1)}>Add hour</button>
  </section>;
}`,
    "Clicking schedules a Planner render. Heading may be called again even though its output is unchanged. React can retain the existing heading DOM while updating the hours text.",
    ["Schedule render", "Calculate subtree", "Commit necessary DOM changes"],
    "Counting render logs alone does not measure user-visible slowness. Measure the expensive interaction and distinguish component computation from layout and paint.",
    "Why is pushing into a global array during render unsafe?",
    "React may repeat or abandon rendering. The external array could be changed multiple times even though the user sees only one committed screen.",
    "https://react.dev/learn/render-and-commit",
  ),
  "performance--memoizing-components": lesson(
    "memo can let React skip a component render when its props remain equal. Apply it at measured expensive boundaries, and keep the component correct even if React renders it again.",
    [
      "The default comparison checks each prop with Object.is. A freshly allocated object or function is different even if its contents or body look identical.",
      "memo does not block updates from the component’s own state or from context it consumes. It primarily concerns parent-driven renders with unchanged props.",
      "A custom comparison must account for every prop, including callbacks. Skipping a changed function can leave the child invoking a stale closure.",
    ],
    `import { memo, useState } from 'react';
const CourseSummary = memo(function CourseSummary({ title }) {
  return <article><h2>{title}</h2><p>Learn through focused practice.</p></article>;
});
export default function Page() {
  const [notes, setNotes] = useState('');
  return <><label>Notes <input value={notes} onChange={e => setNotes(e.target.value)} /></label>
    <CourseSummary title="React" /></>;
}`,
    "Typing changes Page state while the summary receives the same title string. memo makes that unchanged boundary eligible to skip work. The example is intentionally small; profile real components before adopting the pattern broadly.",
    ["Parent renders", "Compare props", "Reuse eligible child result"],
    "Do not use a comparison that always returns true. It can freeze meaningful prop changes and create incorrect UI.",
    'Would passing course={{ title: "React" }} preserve prop equality?',
    "No. That expression creates a new object each parent render. Prefer the minimal primitive prop here or stabilize objects when there is a measured reason.",
    "https://react.dev/reference/react/memo",
  ),
  "performance--code-splitting": lesson(
    "Code splitting separates JavaScript into chunks that can be loaded when needed. It reduces initial work when substantial features are not required for the first screen.",
    [
      "A dynamic import returns a promise for a module and gives the bundler an asynchronous boundary. Static imports generally belong to the initial dependency graph.",
      "Choose meaningful boundaries, such as a reports screen or a large editor. Splitting every small component can add overhead and loading waterfalls.",
      "Loading can fail because of connectivity or stale deployed chunks. Provide a recovery path and deploy asset versions consistently.",
    ],
    `// report.js
export function makeReport(courses) {
  return courses.map(course => course.title).join('\\n');
}

// Inside a component event handler; courses is the current list
async function downloadReport() {
  try {
    const { makeReport } = await import('./report.js');
    window.alert(makeReport(courses));
  } catch {
    window.alert('Report could not be loaded. Please retry.');
  }
}`,
    "The handler imports report.js only when requested. This illustrative excerpt displays the generated report rather than downloading a file. Inspect the production build’s network requests to verify the chunk boundary.",
    ["Initial application", "Feature requested", "Load feature chunk"],
    "Moving the same module into a static import elsewhere can defeat the intended loading boundary. Verify the bundle rather than assuming the source layout guarantees a split.",
    "What trade-off comes with deferring a large feature?",
    "The initial screen can load less code, but the first use of the deferred feature may wait for a network request. Prefetch strategically when user intent makes it worthwhile.",
    "https://vite.dev/guide/features.html#dynamic-import",
  ),
  "performance--lazy-loading": lesson(
    "React lazy turns a dynamic module import into a component that can suspend while its code loads. Suspense supplies a nearby loading fallback for that waiting period.",
    [
      "Declare lazy components at module scope. Creating the lazy component inside another component can recreate its identity and reset state.",
      "The imported module must supply the expected component as its default export for this pattern. Suspense handles waiting, while an Error Boundary handles a rejected import.",
      "Load the component conditionally to defer it until needed. A lazy component rendered immediately still requests its chunk immediately.",
    ],
    `// Report.jsx
export default function Report() { return <h2>Your study report</h2>; }

// App.jsx
import { lazy, Suspense, useState } from 'react';
const Report = lazy(() => import('./Report.jsx'));
export default function App() {
  const [show, setShow] = useState(false);
  return <><button onClick={() => setShow(true)}>Open report</button>
    {show && <Suspense fallback={<p role="status">Loading report…</p>}>
      <Report />
    </Suspense>}</>;
}`,
    "Clicking first renders Report, which starts loading its module. Suspense displays the loading message until the component is ready, then swaps in the report heading.",
    ["Render lazy component", "Show Suspense fallback", "Reveal loaded component"],
    "Suspense is not an error handler. Put an Error Boundary around a boundary that must recover from chunk loading failure.",
    "Why might the fallback be difficult to see locally?",
    "The local chunk can load almost instantly or already be cached. Throttle the network when checking the loading experience.",
    "https://react.dev/reference/react/lazy",
  ),
  "performance--profiling-react-applications": lesson(
    "Optimize a reproducible slow interaction using evidence. React profiling explains component rendering cost; browser performance tools explain network, JavaScript, layout, and paint.",
    [
      "Record a short interaction with React DevTools Profiler, identify expensive commits, and inspect which props or state changed. Long recordings add noise.",
      "Compare before and after using the same data and device conditions. Development mode and StrictMode affect timing, so validate perceived improvement in representative builds.",
      "Profiler’s actualDuration measures render work for an update, not total page latency. Pair it with browser measurements when the bottleneck lies outside React.",
    ],
    `import { Profiler } from 'react';
function recordRender(id, phase, actualDuration) {
  console.log({ id, phase, renderMs: actualDuration });
}
export default function ProfiledList({ courses }) {
  return <Profiler id="course-list" onRender={recordRender}>
    <ul>{courses.map(course => <li key={course.id}>{course.title}</li>)}</ul>
  </Profiler>;
}`,
    "Use this instrumentation temporarily around a suspected subtree. Trigger the same filter with a realistic dataset and compare render durations. Production profiling requires a profiling-enabled build; ordinary production builds disable it by default.",
    ["Reproduce slow action", "Measure bottleneck", "Change and compare"],
    "Do not optimize a component because it renders often if each render is trivial. A large synchronous calculation or browser layout may dominate the interaction instead.",
    "A memo change lowers render time but scrolling remains slow. What next?",
    "Use browser performance tools to inspect layout, paint, event handlers, and DOM size. React rendering is only one part of the total work.",
    "https://react.dev/reference/react/Profiler",
  ),
  "testing--testing-fundamentals": lesson(
    "Tests turn intended behavior into repeatable checks. Choose the smallest scope that can detect a meaningful regression and use broader tests for interactions that cross component or system boundaries.",
    [
      "Unit tests cover pure calculations and reducer transitions. Component tests exercise rendered behavior. End-to-end tests verify a real browser workflow against a running application.",
      "A useful test arranges a known state, performs an action, and asserts an observable result. Avoid assertions about internal variable names or Hook call counts.",
      "The testing lessons use Vitest and Testing Library in a separate practice app. Install the tools and configure a DOM environment before running JSX component tests.",
    ],
    `# Practice app terminal
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

// vite.config.js: import defineConfig from 'vitest/config'
// Keep the existing React plugin and add:
test: { environment: 'jsdom', setupFiles: './src/test/setup.js' }

// src/test/setup.js
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(cleanup);

# Run tests
npx vitest run`,
    "The configuration line is an excerpt inside defineConfig, not an independent file. The setup imports DOM matchers and explicitly cleans up rendered trees between tests. The following lessons show the actual test modules.",
    ["Arrange condition", "Act like a user", "Assert observable behavior"],
    "A large snapshot can change without explaining which behavior broke. Prefer focused assertions about names, states, messages, and outcomes.",
    "Which test should verify an immutable reducer update?",
    "A pure unit test can call the reducer directly and assert both the new result and the unchanged input. A browser is unnecessary for that transition.",
    "https://vitest.dev/guide/",
  ),
  "testing--react-testing-library": lesson(
    "Testing Library encourages queries that match how people find controls: role, accessible name, and visible text. This makes tests more resistant to harmless implementation changes.",
    [
      'render mounts a component into the test DOM. screen searches that DOM with semantic queries such as getByRole("button", { name: "Complete" }).',
      "getBy queries fail immediately if nothing matches. queryBy is useful for asserting absence, while findBy waits for an asynchronously appearing element.",
      "A role query with a name also checks an important accessibility contract. Test IDs are useful when no meaningful user-facing query is available, not as the first choice.",
    ],
    `// CourseCard.test.jsx; use the test setup from Testing Fundamentals
import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
function CourseCard({ title }) {
  return <article><h2>{title}</h2><button>Start learning</button></article>;
}
test('shows the course and its action', () => {
  render(<CourseCard title="React" />);
  expect(screen.getByRole('heading', { name: 'React' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start learning' })).toBeEnabled();
});`,
    "The test verifies the visible title and available action without depending on a CSS class or element nesting. Changing article styling will not break it; removing the accessible action will.",
    ["Render component", "Query by role/name", "Assert user-visible contract"],
    "Do not use getBy for an element you expect to be absent: it throws before the assertion. Use queryBy and an absence matcher.",
    "Which query waits for a success message after a request?",
    "Use await screen.findByText(...) or findByRole with the appropriate accessible name. It retries until the element appears or times out.",
    "https://testing-library.com/docs/react-testing-library/intro/",
  ),
  "testing--testing-user-interactions": lesson(
    "Test a sequence of actions and the resulting interface rather than calling component internals. user-event models realistic typing, focus, and clicks more closely than dispatching a single event manually.",
    [
      "Create a user session with userEvent.setup(). Await interactions so the test does not assert before the simulated action and resulting updates finish.",
      "Query the input by its label and the control by its role and name. These queries remain useful when the markup layout changes.",
      "Test both the initial state and a meaningful transition. An assertion that a button merely exists cannot catch a broken click handler.",
    ],
    `import { useState } from 'react';
import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
function Greeting() {
  const [name, setName] = useState('');
  return <><label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
    <p>Hello, {name || 'learner'}</p></>;
}
test('updates the greeting as the learner types', async () => {
  const user = userEvent.setup();
  render(<Greeting />);
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Mira');
  expect(screen.getByText('Hello, Mira')).toBeInTheDocument();
});`,
    "Typing exercises the real onChange-to-state-to-render path. If that wiring breaks, the greeting assertion fails even though the input and paragraph still exist.",
    ["Find accessible control", "Await interaction", "Check resulting UI"],
    "Do not omit await from user-event calls. Tests that race the interaction can pass or fail unpredictably.",
    "What additional test would protect an empty-name fallback?",
    "Type a name, clear the input with await user.clear(...), and assert that Hello, learner is shown again.",
    "https://testing-library.com/docs/user-event/intro/",
  ),
  "testing--mocking-api-requests": lesson(
    "Control network responses in tests so success, latency, and failure are reproducible. Mock at the network boundary when you want to exercise the real request and response handling logic.",
    [
      "Mock Service Worker can intercept requests while leaving application fetch calls intact. Add msw to the practice app’s development dependencies for this example.",
      "Start the mock server before tests, reset per-test handlers afterward, and close it when the suite finishes. Reject unhandled requests to reveal accidental network access.",
      "Test successful data, empty data, HTTP errors, and delayed responses. A successful mock alone does not verify loading or recovery behavior.",
    ],
    `// courses.test.jsx; Courses is the Fetching Data lesson component
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Courses from './Courses.jsx';
const server = setupServer(http.get('/api/courses', () =>
  HttpResponse.json([{ id: 'react', title: 'React' }])
));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
test('shows a request failure', async () => {
  server.use(http.get('/api/courses', () => new HttpResponse(null, { status: 503 })));
  render(<Courses />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load courses');
});`,
    "The test overrides the default successful handler with a 503 response. Courses runs its actual response.ok check and renders an alert. Resetting handlers prevents this failure override from leaking into other tests.",
    ["Real component request", "Controlled network response", "Assert recovery UI"],
    "Mocking the entire component or its state bypasses the behavior you intended to verify. Keep transport outcomes controlled while exercising the request code.",
    "How would you test a successful empty list?",
    "Return HttpResponse.json([]), render the screen, and assert the intended empty-state message after loading resolves. Add that message to the data owner if needed.",
    "https://mswjs.io/docs/integrations/node",
  ),
  "testing--end-to-end-testing": lesson(
    "End-to-end tests drive a real browser through a complete workflow. Keep a focused set around critical paths such as opening a course, submitting a valid plan, and recovering from a failed request.",
    [
      "Playwright can run against a locally served build or a test environment. Install @playwright/test and its browsers in the practice project; configure baseURL for the running application.",
      "Use role-based locators and web-first assertions that wait for expected conditions. Fixed sleep delays are slower and less reliable than checking the actual outcome.",
      "Use isolated test data and avoid dependencies on earlier tests. Exercise direct URLs and refresh behavior as well as clicks inside the app.",
    ],
    `// playwright.config.js (practice app serves on port 5173)
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { baseURL: 'http://localhost:5173' },
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', port: 5173 },
});

// tests/navigation.spec.js; uses the Client-Side Routing example
import { test, expect } from '@playwright/test';
test('courses remain reachable after refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/\\/courses$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your courses' })).toBeVisible();
});`,
    "After installing the package, run npx playwright install, then npx playwright test. This test uses the earlier routing example’s exact labels and checks that reloading a deep link still reaches the screen.",
    ["Open real browser", "Complete workflow", "Verify URL and screen"],
    "A test against a development server does not verify production hosting rewrites. Run an equivalent smoke check against the deployed test environment.",
    "Why not cover every reducer branch with browser tests?",
    "Browser tests cost more time and have more failure sources. Pure transitions are faster to cover with unit tests, leaving browser tests for integration risks.",
    "https://playwright.dev/docs/intro",
  ),
};
