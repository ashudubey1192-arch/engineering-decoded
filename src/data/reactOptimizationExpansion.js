import { lesson } from './reactLessonSchema.js';

const scope = 'Original companion lessons on optimizing a React app, cross-checked against the React documentation linked below.';
const rows = [];
function add(id, title, intro, concepts, code, walkthrough, flow, mistake, exercise, answer, details, urls) {
  const slug = `episode-09--${id}`;
  const content = lesson(intro, concepts, code, walkthrough, flow, mistake, exercise, answer);
  content.sources = [...urls.map(url => ({ title: `React documentation: ${url.split('/').at(-1)}`, url }))];
  content.sourceNote = scope;
  content.deepDive = details;
  content.animation = {
    title,
    nodes: flow.map((label, i) => ({ id: `n${i}`, label })),
    steps: flow.map((label, i) => ({ from: `n${Math.max(0, i - 1)}`, to: `n${i}`, label: String(i + 1), note: concepts[i] })),
  };
  rows.push({ slug, title, time: '18 min', sectionSlug: 'episode-09', content });
}

add('responsibility-and-custom-hooks', 'Separate Responsibilities with Custom Hooks',
  'A restaurant screen has two jobs: obtain a menu and present it. A custom Hook gives the data lifecycle a name so the component can focus on loading, failure, and success views. Extraction improves organization; it does not automatically make an application faster.',
  ['Identify the external process first: a menu request depends on restaurantId and must stop belonging to the screen when that ID changes. Model that process with one Effect and explicit status, data, and error values.',
   'Extract the process into useMenu(restaurantId). Call it unconditionally at the top of the screen. Return a small public contract rather than exposing internal setters that allow callers to create impossible status combinations.',
   'Keep pure transformations as ordinary functions. A formatPrice function needs no Hook. Two calls to useMenu have independent Hook state; sharing implementation does not provide a shared cache or deduplicate requests.'],
  `import { useEffect, useState } from 'react';

function useMenu(restaurantId) {
  const [result, setResult] = useState({ id: null, status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setResult({ id: restaurantId, status: 'loading' });
    async function load() {
      try {
        const response = await fetch('/api/menus/' + encodeURIComponent(restaurantId), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Menu unavailable: ' + response.status);
        const data = await response.json();
        if (active) setResult({ id: restaurantId, status: 'ready', data });
      } catch (error) {
        if (active && error.name !== 'AbortError')
          setResult({ id: restaurantId, status: 'error', error: error.message });
      }
    }
    load();
    return () => { active = false; controller.abort(); };
  }, [restaurantId]);
  return result.id === restaurantId ? result : { status: 'loading' };
}

export default function Menu({ restaurantId }) {
  const result = useMenu(restaurantId);
  if (result.status === 'loading') return <p role="status">Loading menu…</p>;
  if (result.status === 'error') return <p role="alert">{result.error}</p>;
  return <ul>{result.data.items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}`,
  'Provide an endpoint returning {items: [{id, name}]}. Initially the screen displays loading. A successful response stores data for the current ID. Change the ID while a request is delayed: cleanup marks the old result inactive and aborts the request. The returned ID guard prevents even a transitional render from showing the previous restaurant under the new selection.',
  ['Screen input', 'Hook lifecycle', 'Screen output'],
  'Do not call useMenu only after an if statement or call it inside a click handler. Do not assume fetch rejects on HTTP 404. Validate the API payload at a real application boundary instead of trusting arbitrary JSON.',
  'Mount two Menu screens with the same ID. How many requests can this implementation make, and how would you share their data?',
  'Each instance owns its own Effect and can request independently. Lift the result to a shared owner or use a query cache or framework data loader for deduplication, stale-data policy, retries, and server rendering. Development Strict Mode can also exercise setup and cleanup again.',
  [{ heading: 'Step by step: decide what to extract', paragraphs: ['Write the screen once before introducing an abstraction. Underline code that synchronizes with the same outside system. Move that code with its cleanup, dependencies, and tests as one unit. Leave JSX, presentation formatting, and click-specific behavior in their appropriate places.', 'A useful Hook name describes its result or responsibility, such as useMenu or useOnlineStatus. Names such as useMount hide dependency behavior and encourage stale closures. Prefer explicit inputs over reading unrelated application globals.'] }],
  ['https://react.dev/learn/reusing-logic-with-custom-hooks']);

add('online-status-and-cleanup', 'Online Status, Subscriptions, and Cleanup',
  'An online indicator connects a browser signal to React rendering. Treat it as a subscription: read the current snapshot, listen for changes, and remove listeners when there are no longer consumers. Browser connectivity is a hint; only an actual request can establish whether your API is reachable.',
  ['The browser owns navigator.onLine. React should observe that value rather than invent a competing state machine. useSyncExternalStore connects a snapshot reader and subscription function to rendering.',
   'Register the same callback for online and offline notifications, and return a cleanup that removes both registrations. Define subscribe outside rendering so its identity remains stable across updates.',
   'Choose a deterministic server snapshot when rendering HTML on the server. In this example true is a temporary presentation default, not a connectivity guarantee. The browser snapshot becomes authoritative after hydration.'],
  `import { useSyncExternalStore } from 'react';

function subscribe(notify) {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
}
const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;
function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export default function ConnectionNotice() {
  const online = useOnlineStatus();
  return <p role="status">{online
    ? 'Connection detected. Saving still requires a successful request.'
    : 'You appear offline. Keep your draft and retry when connected.'}</p>;
}`,
  'Render the notice, then switch connectivity in browser developer tools or the operating system. An event asks React to read the latest boolean. The notice changes when the snapshot changes. Unmount the component and verify that its registered listeners are removed; there is no timer to keep running.',
  ['Browser signal', 'Read snapshot', 'Update notice'],
  'Do not discard an unsaved draft merely because the browser reports offline, and do not show Saved merely because it reports online. A Wi-Fi connection can exist while a particular service is unavailable.',
  'Why not return {online: navigator.onLine} as a new object on every getSnapshot call?',
  'A fresh object has a new identity even when connectivity did not change. External-store snapshots must be stable until data changes. Return the primitive boolean, or cache an immutable object and replace it only on a real change.',
  [{ heading: 'From useEffect to an external-store Hook', paragraphs: ['For learning, useState plus an Effect can read navigator.onLine and register online/offline listeners. Initialize carefully in server environments, refresh the value after subscribing, and clean up both listeners. The external-store API provides a dedicated contract for coordinating reads with React.', 'Test mount, update, and unmount separately. Emit a change, check the visible message, unmount, and confirm that further notifications do not leave active subscriptions. These are lifecycle tests rather than a test of network reachability.'] }],
  ['https://react.dev/reference/react/useSyncExternalStore']);

add('dynamic-import-and-bundle-boundaries', 'Dynamic Imports and Sensible Bundle Boundaries',
  'A large optional feature should not necessarily delay the first useful screen. Code splitting lets the build create separately loadable pieces. Choose boundaries around features that users can reach independently, then check the production network trace to confirm what actually loads.',
  ['A static import participates in the initial dependency graph of its importer. A dynamic import returns a Promise for a module and gives the bundler an opportunity to create an asynchronous boundary. Exact output depends on the bundler and shared dependencies.',
   'Select a meaningful boundary such as a restaurant analytics panel. Keep the main menu and navigation readily available. Splitting every tiny button adds loading overhead and makes coordination harder without necessarily reducing useful startup work.',
   'Inspect transferred bytes, parsing time, and user-visible latency before and after. A feature can be slower on its first opening even while initial load improves. Warm-cache visits and cold-cache visits answer different questions.'],
  `// analytics.js: optional calculation module, not a React component
export function summarize(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Inside a browser event handler in a DIFFERENT module:
async function calculateTotal(items) {
  const { summarize } = await import('./analytics.js');
  return summarize(items);
}

// Caller must handle rejection and show pending/error feedback.
// A dynamic import loads a module; React.lazy is for component modules.`,
  'Build a practice app with analytics.js as a separate file. Trigger calculateTotal only from an explicit action. In the production Network panel, check whether a new JavaScript request appears on that action. The exact filename is build-generated. Open the feature again to observe module caching rather than assuming every call downloads it again.',
  ['Initial screen', 'Feature request', 'Loaded module'],
  'Do not judge chunk behavior solely from a development server. Do not use arbitrary user-provided strings as import paths; use a finite module map understood by the bundler.',
  'A split chart imports a heavy library already imported by the home page. Why might the initial payload barely shrink?',
  'The library is still needed by the initial dependency graph. Inspect the shared graph, remove unnecessary eager imports, or accept that this dependency cannot be deferred without redesigning the first screen.',
  [{ heading: 'Chunking vocabulary', paragraphs: ['Code splitting is the build strategy. A chunk is one of its output files. Dynamic importing is the JavaScript operation used to request a module asynchronously. Lazy loading describes waiting until a resource is needed. These terms overlap in a React app but are not interchangeable APIs.', 'A modular codebase can still ship as one large bundle, and a split bundle can still download too much before it becomes useful. Measure the delivered result rather than counting source files.'] }, { heading: 'Prefetch only with a reason', paragraphs: ['If most users open the panel next, a framework prefetch mechanism can begin loading while they read the current screen. This trades earlier bandwidth for shorter later waits. Consider mobile data, cache lifetime, and navigation likelihood; do not prefetch every feature immediately and call it deferred loading.'] }],
  ['https://react.dev/reference/react/lazy']);

add('lazy-suspense-and-recovery', 'Lazy Components, Suspense, and Loading Failures',
  'A deferred component creates three distinct user experiences: the application shell stays usable, pending code shows a local loading message, and a failed import shows a recovery choice. Suspense handles waiting; an Error Boundary handles a rejected lazy import.',
  ['Declare lazy at module scope so the component identity is stable. The loader resolves to a module with a default component export. For a named export, explicitly map the result to {default: module.NamedComponent}.',
   'Place Suspense around the smallest coherent region that should reveal together. Keep navigation outside that region. Its fallback should communicate what is loading and reserve space where practical.',
   'Place an Error Boundary around the deferred region as well. A rejected import reaches that boundary. React caches the lazy loader result, so resetting only the boundary does not necessarily retry a failed module download.'],
  `import { Component, lazy, Suspense, useState } from 'react';
// Create ./Analytics.jsx with a default-exported React component.
const Analytics = lazy(() => import('./Analytics.jsx'));
class FeatureBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div role="alert">
      <p>The analytics feature could not load. Your menu is still available.</p>
      <button onClick={() => window.location.reload()}>Reload application</button>
    </div>;
    return this.props.children;
  }
}
export default function Dashboard() {
  const [show, setShow] = useState(false);
  return <main>
    <h1>Restaurant dashboard</h1>
    <button onClick={() => setShow(true)}>Open analytics</button>
    {show && <FeatureBoundary>
      <Suspense fallback={<p role="status">Loading analytics code…</p>}>
        <Analytics />
      </Suspense>
    </FeatureBoundary>}
  </main>;
}`,
  'First render leaves analytics unmounted. Clicking starts its module request and displays the loading fallback while it is pending. On success, React replaces the fallback with Analytics. On rejection, the boundary renders the recovery view. Reload is explicit because it may discard local work; a production app should persist drafts and handle obsolete deployment chunks through its hosting strategy.',
  ['Request feature', 'Show fallback', 'Reveal or recover'],
  'Suspense does not watch an ordinary fetch inside useEffect. Such a request still needs explicit loading/error state, or a framework or cache with a supported Suspense integration. Suspense also is not an Error Boundary.',
  'Move lazy(() => import(...)) into Dashboard. What risk does that introduce?',
  'Each Dashboard render creates a new lazy component identity. React can treat it as a different component and reset its state. Keep the declaration at module scope and use props to vary its data.',
  [{ heading: 'Nested loading boundaries', paragraphs: ['If summary and chart must make sense together, use one boundary. If the summary is useful immediately and the chart is secondary, use nested or sibling boundaries. Decide from the intended reveal sequence before drawing a boundary around every component.', 'To investigate a loading flash, reproduce slow network and CPU conditions. Transitions can preserve already revealed content during certain updates; they do not eliminate the need for an initial loading state or guarantee that every boundary stays visible.'] }],
  ['https://react.dev/reference/react/lazy', 'https://react.dev/reference/react/Suspense']);

add('memoization-tradeoffs', 'Choose memo, useMemo, and useCallback Deliberately',
  'Memoization reuses previous work when its inputs remain equivalent. It is useful when the avoided work costs more than comparison and bookkeeping. Start with correct rendering and state ownership; then identify a repeated expensive calculation or avoidable child render.',
  ['useMemo caches a calculated value for unchanged dependencies. In a menu search, it can reuse the filtered array while an unrelated theme changes. It cannot avoid filtering when the query actually changes.',
   'memo gives a component an opportunity to skip a parent-triggered render when its props compare equal. New object, array, or function props can defeat this opportunity; its own state and consumed context still update normally.',
   'useCallback preserves a function identity when dependencies match. Use a functional state updater when it genuinely removes a state read. Include all remaining reactive dependencies; a stale callback is a correctness bug, not an optimization.'],
  `import { memo, useCallback, useMemo, useState } from 'react';
const MenuRows = memo(function MenuRows({ items, onChoose }) {
  return <ul>{items.map(item => <li key={item.id}>
    <button onClick={() => onChoose(item.id)}>{item.name}</button>
  </li>)}</ul>;
});
export default function SearchMenu({ items }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [dark, setDark] = useState(false);
  const visible = useMemo(() => items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const choose = useCallback(id => setSelected(ids =>
    ids.includes(id) ? ids : [...ids, id]), []);
  return <section className={dark ? 'dark' : 'light'}>
    <input aria-label="Search menu" value={query} onChange={e => setQuery(e.target.value)} />
    <button onClick={() => setDark(value => !value)}>Toggle theme</button>
    <p>{selected.length} selections</p>
    <MenuRows items={visible} onChoose={choose} />
  </section>;
}`,
  'Pass a stable items array. Typing changes query, so filtering runs again and MenuRows receives new items. Toggling theme changes neither filter input, and choose keeps its identity, so the memoized child can skip that parent-triggered render. Selecting a row updates the count without changing the two child props. Compare this behavior in a profiler; tiny lists may not benefit.',
  ['Measure work', 'Compare inputs', 'Reuse if equal'],
  'Do not depend on useMemo to preserve application state. Its cache is an optimization. Do not mutate items in place: unchanged identity can conceal changed contents and make reuse incorrect.',
  'Would useCallback(() => doWork(), []) stop doWork from running whenever the callback is invoked?',
  'No. It caches the function identity, not the result of calling it. Every invocation executes the body. useMemo caches a calculation result, and memo concerns component rendering; none replaces a data cache for arbitrary requests.',
  [{ heading: 'Before adding a cache', paragraphs: ['Move temporary input state closer to the input when the rest of the page does not need it. Avoid Effects that immediately set derived state and cause another render. Reduce unnecessary work first; caching waste can hide a poor ownership model.', 'React Compiler can automate many memoization opportunities when configured in the build. It is not enabled merely by using React 19. Inspect your configuration, then profile the application actually shipped to users. Manual memoization should serve observed needs rather than a blanket style rule.'] }],
  ['https://react.dev/reference/react/useMemo']);

add('optimization-investigation', 'Run an Optimization Investigation Step by Step',
  'An optimization is a hypothesis with a measurable outcome. Separate slow initial delivery, slow React rendering, slow browser layout, and slow remote data: each needs different evidence. A smaller bundle does not prove faster typing, and fewer renders do not prove better perceived performance.',
  ['Write a reproducible task and baseline: cold-load the menu, type a five-letter query, then open analytics. Record device class, CPU/network conditions, cache state, data size, and repeated timings so before/after results are comparable.',
   'Use the Network and browser Performance panels for bytes, requests, long tasks, layout, and paint. Use React profiling for which component work was committed. A render duration is not the entire click-to-paint time.',
   'Change one cause, rerun the same scenario, and verify behavior. Retain an optimization only when the benefit justifies complexity and costs such as delayed feature loading, extra memory, or harder debugging.'],
  `import { Profiler, useState } from 'react';
function record(id, phase, actualDuration, baseDuration) {
  console.table({ id, phase, actualDuration, baseDuration });
}
function Results({ query, items }) {
  return <ul>{items.filter(item => item.includes(query))
    .map(item => <li key={item}>{item}</li>)}</ul>;
}
export default function Investigation({ items }) {
  const [query, setQuery] = useState('');
  return <>
    <input aria-label="Filter" value={query} onChange={e => setQuery(e.target.value)} />
    <Profiler id="results" onRender={record}>
      <Results query={query} items={items} />
    </Profiler>
  </>;
}`,
  'Supply unique item strings, record a few identical interactions, and compare results. actualDuration describes rendering for the committed update; baseDuration estimates rendering without skipping that subtree. Neither includes every network, layout, or paint cost. Profiling itself adds overhead, and normal production React builds disable this instrumentation unless a profiling build is selected.',
  ['Baseline trace', 'Focused change', 'Compare outcome'],
  'Do not infer production speed from a single development Strict Mode render count. Do not add artificial expensive loops to the shipped app merely to make an optimization appear useful.',
  'Typing stalls because filtering 100,000 rows runs synchronously. Will wrapping that exact expensive calculation in startTransition automatically move it to another thread?',
  'No. JavaScript inside the callback still runs on the main thread. Consider reducing or indexing the dataset, moving heavy computation to a worker, and windowing visible rows. Transitions can make React rendering interruptible; they do not turn arbitrary synchronous work into parallel work.',
  [{ heading: 'Investigation checklist', points: ['Delivery problem: inspect eager dependencies, compression, cache headers, and code-split feature boundaries.', 'Rendering problem: inspect state placement, props identity, expensive calculations, and how many rows are mounted.', 'Data problem: inspect request waterfalls, duplication, cancellation, and cache behavior.', 'Validation: repeat cold and warm runs, test failures and slow connections, and confirm accessibility and draft preservation.'] }, { heading: 'Explain your result in an interview', paragraphs: ['State the symptom, show the measurement, describe the cause, and compare the result using the same workload. For example: opening the optional report originally downloaded its chart library during initial load; moving the report behind a dynamic boundary reduced initial transfer, at the cost of a visible first-open wait. Explain both outcomes without inventing benchmark numbers.'] }],
  ['https://react.dev/reference/react/Profiler']);

export const optimizationSections = [{ slug: 'episode-09', title: 'Optimizing Our App', lessons: rows.map(({ content, ...article }) => article) }];
export const optimizationLessons = Object.fromEntries(rows.map(row => [row.slug, row.content]));
export const optimizationCoverage = { scope, topics: rows.map(row => ({ title: row.title, slug: row.slug, sources: row.content.sources })) };
