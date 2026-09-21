import { lesson } from "./reactLessonSchema.js";

export const advancedLessons = {
  "advanced-react--context-api": lesson(
    "Context passes a value through a component subtree without forwarding it through every intermediate component. Use it for shared concerns such as theme or a feature’s coordinated state.",
    [
      "createContext defines a channel and a fallback value. The closest matching provider above a consumer supplies its value; a provider returned below that consumer cannot affect it.",
      "useContext subscribes a component to the context value. Consumers update when the provided value changes, even if their own component is memoized.",
      "Context transports state but does not define how to update or persist it. Keep rapidly changing unrelated values in separate contexts when that improves boundaries.",
    ],
    `import { createContext, useContext, useState } from 'react';
const ThemeContext = createContext('light');
function Preview() {
  const theme = useContext(ThemeContext);
  return <p>Current theme: {theme}</p>;
}
export default function App() {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={theme}>
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>Toggle theme</button>
    <Preview />
  </ThemeContext.Provider>;
}`,
    "Preview receives theme without an explicit prop. The button changes the provider’s value, and its consumer updates. Provider syntax is shown for familiarity; React 19 also supports rendering the context object directly as a provider.",
    ["Provider value", "Intermediate components", "Subscribed consumer"],
    "A newly created value object can trigger every consumer even when relevant fields did not change. Prefer focused context values and measure before introducing memoization.",
    "Does context persist a theme after a reload?",
    "No. Persistence is separate. Read and write an appropriate storage mechanism or server preference and use that value to initialize the provider.",
    "https://react.dev/reference/react/useContext",
  ),
  "advanced-react--error-boundaries": lesson(
    "An Error Boundary contains rendering failures in a subtree and displays a fallback instead of letting the failure remove the entire interface. Place boundaries around independently recoverable regions.",
    [
      "A class component can implement getDerivedStateFromError to select a fallback and componentDidCatch to report details. Function components can use a boundary supplied by a library.",
      "Boundaries catch descendant render and lifecycle failures. They do not catch ordinary event-handler errors, arbitrary async callbacks, server-rendering errors, or errors in the boundary itself.",
      "Reset only when retrying can change the outcome, such as after loading corrected data. Re-rendering the same deterministic crash immediately will fail again.",
    ],
    `import { Component } from 'react';
class ReportBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) {
    console.error('Report failed', error, info.componentStack);
  }
  render() {
    if (this.state.failed) return <p role="alert">Report unavailable. Other tools still work.</p>;
    return this.props.children;
  }
}
function Report() { throw new Error('Example rendering failure'); }
export default function App() {
  return <main><h1>Study planner</h1><ReportBoundary><Report /></ReportBoundary></main>;
}`,
    "The intentional Report error activates the boundary fallback while preserving the planner heading. Replace console reporting with an approved monitoring client in production and avoid logging sensitive data.",
    ["Descendant render fails", "Boundary captures failure", "Local fallback remains"],
    "A rejected fetch in an event handler needs its own try/catch. An Error Boundary does not automatically turn every asynchronous failure into fallback UI.",
    "Why use a boundary around the report instead of only at the app root?",
    "A local boundary can preserve unrelated navigation and tools when the report fails. A root boundary can still provide a final fallback for uncaught rendering failures.",
    "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
  ),
  "advanced-react--portals": lesson(
    "A portal renders a component’s DOM into another container while retaining its position in the React tree. It can help overlays escape clipping and stacking constraints in their visual ancestors.",
    [
      "createPortal takes renderable children and an existing DOM node. React context and event propagation still follow the React parent tree, not only the resulting DOM placement.",
      "A portal changes placement, not accessibility. A modal still needs a name, keyboard dismissal, appropriate focus movement, focus containment, and focus restoration.",
      "Use a tested dialog primitive or the native dialog element where appropriate. The following non-modal notice demonstrates placement without claiming to implement a complete modal.",
    ],
    `import { createPortal } from 'react-dom';
import { useState } from 'react';
export default function Notice() {
  const [visible, setVisible] = useState(false);
  return <section>
    <button onClick={() => setVisible(true)}>Show notice</button>
    {visible && createPortal(
      <aside aria-label="Study notice" style={{ position: 'fixed', bottom: 24, right: 24,
        background: '#172019', color: '#fff', padding: 20, zIndex: 100 }}>
        <p role="status">Your study session is ready.</p>
        <button onClick={() => setVisible(false)}>Dismiss notice</button>
      </aside>, document.body
    )}
  </section>;
}`,
    "The notice appears at the body level in the DOM, but its state remains owned by Notice. This browser-only example accesses document when opened; server-rendered applications must only create the portal once its target exists.",
    ["React parent owns notice", "Portal chooses DOM target", "Events retain React ancestry"],
    "Do not assume a portal prevents event bubbling to React ancestors. Handle propagation deliberately if an ancestor click action conflicts with the overlay.",
    'Does adding role="dialog" make this notice a fully accessible modal?',
    "No. A role alone does not manage focus, block background interaction, handle Escape, or restore focus. Those behaviors need a complete dialog implementation.",
    "https://react.dev/reference/react-dom/createPortal",
  ),
  "advanced-react--suspense": lesson(
    "Suspense coordinates a loading fallback for children that suspend through a supported integration. It is a rendering boundary, not a general detector of any network request in a component.",
    [
      "lazy-loaded components can suspend while their code loads. Suspense-enabled frameworks and data sources can also coordinate data; an ordinary fetch inside useEffect does not activate Suspense.",
      "Place boundaries according to the loading experience. One boundary reveals its content together, while nested boundaries can reveal independently ready regions.",
      "Rejected work needs an Error Boundary. Loading and failure are separate states with separate UI responsibilities.",
    ],
    `import { lazy, Suspense } from 'react';
const ProgressChart = lazy(() => import('./ProgressChart.jsx'));
const Recommendations = lazy(() => import('./Recommendations.jsx'));
export default function Dashboard() {
  return <main>
    <h1>Study dashboard</h1>
    <Suspense fallback={<p role="status">Loading progress…</p>}><ProgressChart /></Suspense>
    <Suspense fallback={<p role="status">Loading suggestions…</p>}><Recommendations /></Suspense>
  </main>;
}
// Each imported file must default-export its corresponding component.`,
    "The heading is always available. The chart and recommendations have independent boundaries, so one can appear while the other still loads. Create those two component files before running the example.",
    ["Shell stays visible", "Independent waiting boundaries", "Reveal ready regions"],
    "Wrapping an Effect-based fetch in Suspense will not display its fallback. Model that fetch’s loading state yourself or use a supported data integration.",
    "When would one shared boundary be preferable?",
    "When the regions form one coherent unit and showing only half would be confusing. Boundary placement should match the intended user experience.",
    "https://react.dev/reference/react/Suspense",
  ),
  "advanced-react--transitions": lesson(
    "Transitions mark updates as non-urgent so urgent interactions can remain responsive while React prepares another screen state. They do not make expensive JavaScript calculations run on a separate thread.",
    [
      "useTransition returns a pending indicator and startTransition. Update the immediate input value urgently, then mark the slower results update as a transition.",
      "Transition rendering can be interrupted by a newer urgent update. Components must remain pure because unfinished render work can be restarted.",
      "Do not use a transition to control the text input itself. Also avoid doing a long synchronous calculation inside the event handler and assuming the transition will move it off the main thread.",
    ],
    `import { useState, useTransition } from 'react';
export default function CourseSearch({ courses }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();
  const visible = courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
  return <section>
    <label>Search <input value={input} onChange={e => {
      const next = e.target.value;
      setInput(next);
      startTransition(() => setQuery(next));
    }} /></label>
    <p role="status">{pending ? 'Updating results…' : visible.length + ' matches'}</p>
    <ul aria-busy={pending}>{visible.map(c => <li key={c.id}>{c.title}</li>)}</ul>
  </section>;
}`,
    "The input follows each keystroke immediately. Results use the transitioned query and may briefly show the previous result while an update is pending. Small lists may finish too quickly to show that difference.",
    ["Urgent input update", "Interruptible result render", "Commit latest results"],
    "Transitions are not debouncing and do not reduce network requests automatically. A costly filter loop can still block JavaScript; consider indexing, workers, or virtualization as appropriate.",
    "Why keep input and query separate here?",
    "The controlled input needs an urgent update, while query represents the potentially deferred results. One transitioned value should not control typing.",
    "https://react.dev/reference/react/useTransition",
  ),
  "advanced-react--server-and-client-components": lesson(
    "Server Components run in a server-capable React environment and can keep certain data access and dependencies off the client. Client Components provide browser interactivity. This requires framework support beyond a plain Vite client app.",
    [
      "A Server Component can read server-side resources and pass renderable or supported serializable data across the client boundary. It cannot use browser-only APIs or ordinary client state Hooks.",
      "A use client directive establishes a client module boundary in a supporting framework. It does not mean that every parent component must become a Client Component.",
      "Keep secrets on the server and pass only necessary public fields to clients. Server Components are related to, but distinct from, server-side HTML rendering and hydration.",
    ],
    `// Framework example: app/page.jsx (Server Component)
import CourseToggle from './CourseToggle.jsx';
export default async function Page() {
  const course = { id: 'react', title: 'React' }; // Could come from a server data layer
  return <main><h1>{course.title}</h1><CourseToggle courseId={course.id} /></main>;
}

// app/CourseToggle.jsx (Client Component)
'use client';
import { useState } from 'react';
export default function CourseToggle({ courseId }) {
  const [saved, setSaved] = useState(false);
  return <button onClick={() => setSaved(value => !value)}>
    {saved ? 'Saved ' : 'Save '}{courseId}
  </button>;
}`,
    "The server describes the course header, and the small client island owns interactive saved state. This local toggle does not persist to a database. Run these files in a framework that supports React Server Components, not the earlier standalone Vite setup.",
    ["Server data and rendering", "Serializable boundary", "Client interaction"],
    "Do not pass database clients, secrets, or arbitrary functions to a Client Component. A frontend bundle is inspectable by users.",
    "Can adding use client to a file enable Server Components in Vite?",
    "No. The directive only has meaning in an environment implementing those boundaries. The bundler and server integration must support the component model.",
    "https://react.dev/reference/rsc/server-components",
  ),
  "production-react--application-architecture": lesson(
    "An application architecture defines ownership and dependency direction. A maintainable React feature separates domain decisions, network boundaries, and reusable UI without burying simple behavior in unnecessary abstraction.",
    [
      "Group related files by feature when the app grows. A course feature can own its screens, model, API functions, and tests, while shared primitives remain independent of course-specific rules.",
      "Normalize external data at the boundary. Components should receive useful, validated values instead of repeatedly interpreting transport details and error codes.",
      "Use dependency direction deliberately: a generic button should not import course APIs, while a course screen may assemble that button and call a feature service.",
    ],
    `// features/courses/api.js
export async function loadCourses(signal) {
  const response = await fetch('/api/courses', { signal });
  if (!response.ok) throw new Error('Courses unavailable');
  const data = await response.json();
  if (!Array.isArray(data) || !data.every(item => item &&
    typeof item.id === 'string' && typeof item.title === 'string')) {
    throw new Error('Invalid course response');
  }
  return data.map(({ id, title }) => ({ id, title }));
}
// A course Hook or route loader calls loadCourses.
// CourseList receives the resulting course objects as props.`,
    "The service owns HTTP and basic schema validation. A caller owns loading and recovery, while CourseList only renders a collection. Tests can exercise these responsibilities at their natural boundaries.",
    ["Transport boundary", "Feature state and rules", "Presentational components"],
    "Avoid putting every state value into a global store or every function into a shared utilities folder. Shared code should have actual independent consumers.",
    "Where should a server field named course_title become title?",
    "At the API adapter or domain boundary. Mapping once keeps transport naming from leaking through every component.",
  ),
  "production-react--state-management-strategy": lesson(
    "Choose state storage according to ownership and lifetime. Local interaction state, shareable URL state, remote cached data, and cross-feature client state have different requirements.",
    [
      "Keep transient UI state near the component that owns it. Lift it when siblings need coordination, and use context when passing through many layers obscures the relationship.",
      "Use the URL for navigation-relevant filters that should survive sharing or Back/Forward. Remote data often benefits from a dedicated cache with invalidation and refetch policies.",
      "A global store can help complex cross-feature workflows, but it introduces coordination costs. Avoid maintaining two independent authoritative copies of the same data.",
    ],
    `// Example ownership map for a planner
const ownership = {
  expandedHelp: 'Local component state',
  selectedCourseId: 'Route parameter',
  searchQuery: 'URL search parameter when shareable',
  courseCatalog: 'Server-data cache',
  unsavedNote: 'Form state in the editing feature',
  theme: 'Context, optionally persisted',
};

// Derive, do not duplicate:
const completedCount = courses.filter(course => course.complete).length;`,
    "This is a design excerpt rather than a standalone component. For each real state value, name one owner and the events that change it. Derived completedCount needs no separate store entry if courses is authoritative.",
    ["Identify owner/lifetime", "Choose local, URL, cache, or store", "Derive secondary values"],
    "Copying cached server data into another global store creates stale duplicates unless synchronization is explicitly managed. Prefer one authoritative source.",
    "Should an open tooltip live in a global store?",
    "Usually no. Its lifetime and consumers are local. Keep it near the triggering control unless a concrete cross-component requirement changes that decision.",
  ),
  "production-react--accessibility": lesson(
    "Accessible React interfaces preserve semantic HTML and manage the effects of dynamic updates. Keyboard access, visible focus, meaningful labels, and understandable status messages are part of the component contract.",
    [
      "Use native buttons, links, labels, and headings before reaching for ARIA. Native controls provide keyboard behavior that a clickable div would need to reimplement.",
      "Use unique IDs to link descriptions to fields. useId helps repeated component instances avoid duplicate IDs, but it is not a source of list keys.",
      "Check dynamic behavior: move focus intentionally after navigation or dialogs, announce important results, and respect reduced-motion preferences. Automated checks cannot replace keyboard and screen-reader review.",
    ],
    `import { useId, useState } from 'react';
export default function AccessibleNotes() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  return <form onSubmit={e => { e.preventDefault(); setSaved(true); }}>
    <label htmlFor={id}>Study notes</label>
    <textarea id={id} aria-describedby={id + '-hint'} />
    <p id={id + '-hint'}>Write a short summary in your own words.</p>
    <button type="submit">Save notes locally in this demo</button>
    <p role="status">{saved ? 'Demo submitted; no server storage is configured.' : ''}</p>
  </form>;
}`,
    "The label names the textarea, the description adds guidance, and the persistent status region receives the result. Tab through the controls and submit using the keyboard; then check the accessible names in browser tools.",
    ["Semantic controls", "Keyboard interaction", "Announced result"],
    "Do not remove focus outlines without a visible replacement or communicate errors by color alone. The message must remain understandable without seeing the color.",
    "Why not use useId for course list keys?",
    "Keys represent the identity of your data across renders. Use the course’s stable ID; useId serves accessibility relationships inside components.",
    "https://react.dev/reference/react/useId",
  ),
  "production-react--security-practices": lesson(
    "React escapes ordinary text content, but an application still needs safe handling of URLs, rich HTML, credentials, and server authorization. Client-side visibility is not a security boundary.",
    [
      "Prefer text interpolation for untrusted strings. dangerouslySetInnerHTML bypasses normal escaping and needs a carefully maintained sanitization policy for genuinely required rich HTML.",
      "Validate untrusted URL destinations and limit allowed protocols or origins according to product requirements. Escaping text does not decide whether a destination is trusted.",
      "Keep secrets and authorization checks on the server. Hiding an admin button does not prevent a user from calling an endpoint directly; the endpoint must enforce permissions.",
    ],
    `function safeExternalUrl(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}
export default function ResourceLink({ title, url }) {
  const href = safeExternalUrl(url);
  if (!href) return <p>Resource link unavailable.</p>;
  return <a href={href} target="_blank" rel="noopener noreferrer">{title}</a>;
}`,
    "The title is rendered as text, and malformed or non-HTTPS URLs are rejected. This is a protocol policy, not a guarantee that an HTTPS destination is trustworthy; add an origin allowlist when the feature requires one.",
    ["Untrusted input", "Validate for its context", "Render minimum allowed output"],
    "Never place private API keys in frontend environment variables. Bundled values and browser requests can be inspected by the user.",
    "Can the backend trust a role sent from React state?",
    "No. The server derives identity and permissions from its authenticated security context and validates every protected operation independently.",
    "https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html",
  ),
  "production-react--deployment": lesson(
    "Deploy the production artifact with the correct routing, asset, and configuration behavior. A successful local build is necessary, but a real release also needs smoke checks and a rollback path.",
    [
      "For a Vite client application, build produces static files in dist. Serve them over HTTPS from a static host or web server; framework server features require the framework’s appropriate runtime.",
      "Configure client-route fallback without swallowing API paths or missing asset requests. Verify direct navigation, refresh, and unknown routes on the target host.",
      "Cache hashed assets aggressively while ensuring the entry document can discover new versions. Keep deployment artifacts consistent so older pages do not request chunks that have already disappeared.",
    ],
    `# Build from the committed lockfile in CI
npm ci
npm run build

# Local inspection of the production artifact
npm run preview

# Release smoke-check checklist
# 1. Open the home URL and a direct /courses URL.
# 2. Refresh a nested course URL.
# 3. Exercise a save and a failed request.
# 4. Confirm asset URLs and browser console are clean.
# 5. Confirm the previous release can be restored.`,
    "Publish dist using the selected host’s deployment mechanism. preview is only a local verification server. If the app lives below a path prefix, configure the bundler base and router basename consistently.",
    ["Reproducible build", "Publish consistent assets", "Smoke check and observe"],
    "Do not serve the development server as the release architecture. Also remember that Vite client environment values are generally embedded at build time.",
    "A route works when clicked but returns 404 after refresh. What should you inspect?",
    "Check host rewrites for client routes. The server must return the app entry for valid navigation URLs so the client router can choose the screen.",
    "https://vite.dev/guide/static-deploy",
  ),
  "production-react--monitoring-and-maintenance": lesson(
    "After release, observe whether users can complete the workflows the application promises. Combine errors, performance signals, and release metadata to detect regressions and prioritize maintenance.",
    [
      "Record unexpected failures with a release identifier and enough context to reproduce them. Avoid personal notes, credentials, tokens, and other sensitive payloads in telemetry.",
      "Measure meaningful user outcomes, such as successful plan saves, alongside rendering and network timings. A low crash rate does not prove a workflow succeeds.",
      "Maintain dependencies, test important journeys, and review accessibility over time. Use source maps under an appropriate access policy to connect production failures to source locations.",
    ],
    `// Telemetry adapter excerpt: inject a configured reporting client.
export async function measuredSave(savePlan, plan, report) {
  const started = performance.now();
  try {
    const result = await savePlan(plan);
    report({ event: 'plan_save', outcome: 'success',
      durationMs: performance.now() - started });
    return result;
  } catch (error) {
    report({ event: 'plan_save', outcome: 'failure',
      durationMs: performance.now() - started });
    throw error;
  }
}
// The reporting adapter must be non-throwing and omit plan contents.`,
    "The wrapper reports duration and outcome without transmitting the plan. It rethrows save failures so the UI still handles them. Attach a release ID in the reporting adapter and ensure telemetry failures cannot break saving.",
    ["Observe workflow outcomes", "Correlate with release", "Fix and verify regression"],
    "Do not swallow a failed save merely because it was logged. Logging supports diagnosis; the user still needs a recoverable failure state.",
    "Save failures spike immediately after a release. What should you compare?",
    "Compare release IDs, endpoint responses, affected routes, and request timing. Reproduce with safe test data, roll back if warranted, and add a regression check for the verified cause.",
  ),
};
