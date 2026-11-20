// Original teaching material. Official documentation links are reading references,
// not a claim that this course reproduces every future revision of react.dev.
import { lesson } from './reactLessonSchema.js';

const entries = [];
function add(id, title, source, intro, concepts, code, walkthrough, flow, mistake, exercise, answer, topics) {
  const slug = `react-learn-workshop--${id}`;
  const content = lesson(intro, concepts, code, walkthrough, flow, mistake, exercise, answer);
  content.language = id === 'typescript-components' ? 'tsx' : 'jsx';
  content.sources = [{ title: `React documentation: ${title}`, url: `https://react.dev/learn/${source}` }];
  content.deepDive = topics.map(([heading, text]) => ({ heading, paragraphs: [text] }));
  content.animation = {
    title,
    nodes: flow.map((label, index) => ({ id: String(index), label })),
    steps: concepts.map((note, index) => ({ from: String(Math.max(0, index - 1)), to: String(index), note })),
  };
  entries.push({ slug, title, time: '18 min', sectionSlug: 'react-learn-workshop', content });
}

add('thinking-in-react', 'Thinking in React: From Mockup to State', 'thinking-in-react',
  'Turn a design into a small data model before adding interactions. This workshop builds a searchable course catalog and makes the ownership of every value explicit.',
  [
    'Draw boundaries around the catalog, search controls, and result rows. Give each component one responsibility, then build a static version using only props. This separates layout mistakes from state bugs.',
    'Store only the text entered by the learner and the completed-only checkbox. The filtered rows and visible count are calculations from those inputs and the course data, so they should not become additional state.',
    'Put the filter state in the nearest parent shared by the controls and the results. Pass the current values down and callbacks down; the callbacks let a child request a parent update without owning a second copy.',
  ],
  `import { useState } from 'react';
const courses = [{id: 'r', title: 'React', done: true}, {id: 'c', title: 'CSS', done: false}];
export default function Catalog() {
  const [query, setQuery] = useState('');
  const [doneOnly, setDoneOnly] = useState(false);
  const visible = courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) && (!doneOnly || c.done));
  return <section>
    <label>Search <input value={query} onChange={e => setQuery(e.target.value)} /></label>
    <label><input type="checkbox" checked={doneOnly} onChange={e => setDoneOnly(e.target.checked)} />Completed only</label>
    <p>{visible.length} results</p>
    <ul>{visible.map(c => <li key={c.id}>{c.title}</li>)}</ul>
  </section>;
}`,
  'Initially both rows appear. Type re: only React remains. Check Completed only: React stays because both predicates pass. Clear the query: CSS remains excluded. There is no synchronization Effect because visible is recalculated for each render.',
  ['Design boundaries', 'Minimal state', 'Data and callbacks'],
  'Storing visible in state creates two truths. A new filter or refreshed course list can then leave the stored results stale.',
  'Add a result count and explain whether it needs useState.',
  'Render visible.length. It is fully determined by the existing inputs; adding state would require maintaining the same fact twice.',
  [['Build top-down or bottom-up', 'Top-down construction helps when the design already defines large regions; bottom-up helps when reusable controls are established. Both should produce a static UI before complex interactions.'], ['Identify state ownership', 'List every component that reads a value and find their closest common ancestor. If no suitable ancestor exists, add a small coordinator component. Avoid moving unrelated local input state to the application root.']]);

add('tic-tac-toe-history', 'Tic-Tac-Toe: Immutable Moves and Time Travel', 'tutorial-tic-tac-toe',
  'Build a complete small game to connect components, props, events, immutable arrays, derived state, and history. The board is a snapshot, and time travel selects a previous snapshot rather than trying to reverse DOM changes.',
  [
    'Model nine squares as an array. A move copies the current array and writes to one empty square. Reject moves after a winner or when a square is already occupied; these are game rules, not merely disabled-button styling.',
    'Store an array of board snapshots and a selected move index. Derive the current board and next player from that index. The parent owns the history; individual square buttons receive only a value and a callback.',
    'Jumping backward changes the selected index. Playing after a jump slices away the abandoned future before appending the new board. Stable move positions are acceptable keys here because each surviving prefix has fixed historical meaning.',
  ],
  `import { useState } from 'react';
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(board) {
  for (const [a,b,c] of lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  return null;
}
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [move, setMove] = useState(0);
  const board = history[move];
  const won = winner(board);
  const player = move % 2 === 0 ? 'X' : 'O';
  function play(index) {
    if (won || board[index]) return;
    const next = board.map((value, i) => i === index ? player : value);
    setHistory([...history.slice(0, move + 1), next]);
    setMove(move + 1);
  }
  return <section>
    <p role="status">{won ? won + ' wins' : board.every(Boolean) ? 'Draw' : player + ' to play'}</p>
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 3rem)'}}>
      {board.map((value, i) => <button key={i} aria-label={'Square ' + (i+1) + ': ' + (value || 'empty')} onClick={() => play(i)}>{value || '·'}</button>)}
    </div>
    <ol>{history.map((_, i) => <li key={i}><button onClick={() => setMove(i)}>Move {i}</button></li>)}</ol>
  </section>;
}`,
  'Play squares 1, 4, 2, 5, 3: X wins on the top row. Select Move 2 to restore the first two moves. Choose another empty square: the old future disappears and a new branch is created. Earlier arrays still contain their original values.',
  ['Current board', 'Copy legal move', 'Append history'],
  'Mutating history[move][index] destroys the old snapshot and makes time travel unreliable. Deriving the player from history.length is also wrong after jumping backward.',
  'Explain why a ninth move with no winner is a draw and how the example detects it.',
  'A full board has no null cells, so board.every(Boolean) is true. The winner check takes precedence because the final move can also complete a winning line.',
  [['Setup, components, and passing data', 'Use a JSX-capable React practice application. Start with a static button, pass its value through props, and then lift all nine values to the board. Extract a Square component if styling or keyboard behavior becomes more complex.'], ['Keys, history, and further improvements', 'Add coordinates to the move labels, highlight the winning line, and reverse history display while retaining original move indexes as keys. Keep the winner as a calculation, not another state variable.']]);

add('installation-and-tooling', 'Installation, Existing Projects, and Editor Tooling', 'installation',
  'Choose an application setup according to deployment and data needs. A small client-only exercise and a production application with server rendering need different infrastructure, even though both use React components.',
  [
    'For a new production application, evaluate a supported framework with routing, data loading, and deployment conventions. For learning or a client-only tool, a build tool such as Vite can provide JSX transformation and local development.',
    'For an existing site, mount React into a dedicated DOM container. React owns the contents of that container; existing page scripts should not independently replace those same nodes. Multiple independent roots can coexist.',
    'Configure formatting, JSX syntax support, and the React Hooks linter in the editor. Use React DevTools to inspect props, state, and render behavior. A production build is a separate check from a working development server.',
  ],
  `// main.jsx, after a JSX-capable build has been configured.
// Existing HTML contains: <div id="course-widget"></div>
import { createRoot } from 'react-dom/client';
function CourseWidget() { return <button onClick={() => alert('Ready')}>Start practice</button>; }
const host = document.getElementById('course-widget');
if (host) createRoot(host).render(<CourseWidget />);`,
  'The browser loads the built module, finds the designated container, and React inserts one interactive button. Surrounding non-React content is unaffected. If the server already rendered matching React HTML, use the framework hydration path rather than createRoot to replace it.',
  ['Choose runtime', 'Configure tools', 'Mount and inspect'],
  'Create React App is deprecated. Do not recommend it for a new setup or assume that a build tool automatically supplies routing, data caching, server rendering, or secure server endpoints.',
  'A static marketing page needs one interactive calculator. Must the entire page be rewritten?',
  'No. Add a dedicated container and a React root for the calculator. Decide which system owns each part of the DOM and avoid competing updates.',
  [['Building from scratch', 'Plan routing, data fetching, styles, accessibility, tests, and deployment explicitly when choosing a build tool. Install a Node version supported by the selected tool and commit its lockfile. Never expose server secrets in client build variables.'], ['Editor setup and DevTools', 'Use formatting to reduce syntax distractions, linting to catch Hook dependency problems, and DevTools to inspect the actual component tree. Browser Network and Performance panels answer different questions from the React component profiler.'], ['Adding React to an existing subroute', 'A whole subroute can be handled by a React application while legacy routes remain in place. Configure the host to serve the application entry for client-side routes so direct navigation does not return a server 404.']]);

add('typescript-components', 'TypeScript Components, Events, and Hooks', 'typescript',
  'TypeScript checks the shape of component inputs before runtime. Use it to express valid states and callback contracts; it does not validate an untrusted network response merely because you wrote a type annotation.',
  [
    'Use .tsx for files containing JSX. Describe props with an object type and specify callback argument types so a parent cannot accidentally pass an incompatible handler.',
    'Let TypeScript infer simple Hook state from its initializer. Supply a union for values that start as null or represent several possible statuses. A discriminated union can prevent success data from being read while loading.',
    'Type extracted event handlers with React event types and read currentTarget for the element on which the handler is registered. Model children with ReactNode when accepting any renderable content.',
  ],
  `// CoursePicker.tsx — requires TypeScript and React type packages.
import { useState, type ChangeEvent } from 'react';
type Props = { onChoose: (id: string) => void };
export default function CoursePicker({ onChoose }: Props) {
  const [id, setId] = useState<string>('react');
  function change(event: ChangeEvent<HTMLSelectElement>) {
    setId(event.currentTarget.value);
  }
  return <><select aria-label="Course" value={id} onChange={change}>
    <option value="react">React</option><option value="css">CSS</option>
  </select><button onClick={() => onChoose(id)}>Choose</button></>;
}`,
  'Selecting CSS updates a string state value; clicking Choose passes that string to the parent. A callback expecting a number is rejected during type checking. The compiler removes types from emitted JavaScript, so runtime validation remains necessary at API boundaries.',
  ['Typed props', 'Checked updates', 'JavaScript output'],
  'Using any or casting fetched JSON to Course[] hides uncertainty rather than checking it. Validate unknown data before rendering or storing it.',
  'How would you represent a selected course that may not exist yet?',
  'Use a suitable union such as useState<string | null>(null), then handle null explicitly before calling code that requires a string.',
  [['Typing useReducer and context', 'Give reducer actions a union with distinct type fields and narrow in switch branches. For context without a safe default, use a nullable context and a custom Hook that throws a clear error outside the provider.'], ['Typing styles and children', 'React.CSSProperties checks inline style objects; React.ReactNode accepts strings, elements, arrays, and other renderable values. React.ReactElement is narrower when the contract specifically requires an element.']]);

add('jsx-curly-braces', 'JavaScript in JSX: Curly Braces and Objects', 'javascript-in-jsx-with-curly-braces',
  'JSX mixes markup structure with JavaScript expressions. Learn the boundary between literal text, attributes, expressions, and objects so dynamic UI remains predictable.',
  [
    'Quotes in an attribute produce a literal string. Curly braces evaluate an expression: src={photoUrl} reads a variable, whereas src="photoUrl" requests a resource literally named photoUrl.',
    'Use braces inside child content or immediately after an attribute equals sign. Statements such as if and for belong outside JSX; expressions such as a ternary, map, or a function call can produce renderable values.',
    'Double braces are two separate constructs: the outer pair enters JavaScript, and the inner pair creates an object. Inline CSS uses camelCase property names and numeric values where React supports them.',
  ],
  `export default function ProgressCard() {
  const progress = { title: 'Hooks', done: 3, total: 8 };
  const percent = Math.round(progress.done / progress.total * 100);
  return <article style={{ borderLeft: '4px solid teal', padding: 16 }}>
    <h2>{progress.title}</h2>
    <p>{progress.done} of {progress.total} lessons ({percent}%)</p>
    <progress value={progress.done} max={progress.total} aria-label="Course progress" />
  </article>;
}`,
  'The title is read from the object, the percentage is calculated before returning JSX, and the style prop receives a JavaScript object. The progress element receives numbers rather than the strings "progress.done" and "progress.total".',
  ['JavaScript data', 'JSX expressions', 'Rendered values'],
  'An ordinary object cannot be rendered as a text child. Render specific fields, map an array of objects to elements, or stringify only for a deliberate debug display.',
  'What is the difference between title="progress.title" and title={progress.title}?',
  'The first sets the literal tooltip progress.title; the second evaluates the object property and produces Hooks.',
  [['Strings and expressions', 'Text outside braces remains text. An expression can return a number, string, React element, or array of renderable children. Booleans, null, and undefined render no visible child content.'], ['Style objects', 'An object can be passed as a prop even though it cannot be rendered directly as a child. Keep reusable styling in CSS classes and use style for values calculated from runtime data.']]);

add('pure-rendering', 'Pure Components and Strict Mode', 'keeping-components-pure',
  'Rendering describes a screen from inputs. It should not change the world outside the calculation. This makes repeated, interrupted, or abandoned rendering safe.',
  [
    'Treat props, state, and context as read-only inputs. Do not increment module variables, mutate a parent array, send a purchase request, or edit the DOM while calculating JSX.',
    'Local mutation is allowed when the object was created during the current calculation and is not shared with previous renders. Building a new list with push is different from pushing into a props array.',
    'Strict Mode performs additional development checks, including extra render and Effect setup/cleanup work in applicable configurations. Fix the impure operation or missing cleanup instead of relying on a component rendering only once.',
  ],
  `function Summary({ courses }) {
  const rows = [];
  for (const course of courses) rows.push(<li key={course.id}>{course.title}</li>);
  return <ul>{rows}</ul>;
}
export default function App() {
  const courses = [{id: 'r', title: 'React'}];
  return <Summary courses={courses} />;
}`,
  'Each Summary call creates its own rows array, fills it, and returns the same description for the same courses. Repeating the call does not add another item to courses. Moving rows outside the component would create shared mutable output and break this property.',
  ['Read inputs', 'Calculate locally', 'Return UI'],
  'Do not generate random keys or issue network mutations during render. User-triggered operations belong in event handlers; synchronization belongs in an Effect when an external system requires it.',
  'Is courses.sort() safe inside Summary?',
  'No, because it mutates the incoming array. Sort a copy such as [...courses].sort(compare) so the caller’s data remains unchanged.',
  [['Where side effects belong', 'A save button handler can initiate saving because the user chose that operation. An Effect can keep a browser subscription aligned with current props. Neither should be hidden inside a calculation used to create JSX.'], ['Why purity enables optimization', 'React may repeat or discard rendering work. If rendering changes external state, discarded work still leaves an observable change. Pure calculation allows scheduling and caching without changing application behavior.']]);

add('ui-trees', 'Render Trees and Module Dependency Trees', 'understanding-your-ui-as-a-tree',
  'Two different trees explain two different questions: which components are currently rendering, and which source modules the application loads. Keep these models separate when debugging state or bundle size.',
  [
    'The render tree follows component parent-child relationships for a particular render. Conditional branches can replace subtrees. A shared parent is where coordinated state may live.',
    'The module dependency graph follows import relationships between files. A file can export several components, and a component imported once can appear at many positions in the render tree.',
    'Use the render tree to investigate state ownership and re-render paths. Use the dependency graph and bundle analysis to investigate large downloads or opportunities for dynamic import boundaries.',
  ],
  `function Badge({ label }) { return <span>{label}</span>; }
function Course({ title }) { return <article><h2>{title}</h2><Badge label="New" /></article>; }
export default function Catalog() {
  return <main><Course title="React" /><Course title="CSS" /></main>;
}`,
  'One file contains three component definitions. The render tree contains one Catalog, two Course instances, and two Badge instances. The two Course positions would hold independent state even though they execute the same function.',
  ['Source imports', 'Component instances', 'DOM structure'],
  'A module-level variable is shared by all instances that import that module. It is not equivalent to per-instance component state.',
  'Does importing Course once mean React creates only one Course instance?',
  'No. The returned JSX places Course twice in the tree, producing distinct instances with independent state identities.',
  [['Root, parents, leaves', 'A root begins a render tree. Parents coordinate children, and leaves produce UI without rendering further application components. A DOM tree also contains host elements such as div and button, so it is not identical to the component tree.'], ['Conditional trees and bundle size', 'Not rendering a component does not necessarily prevent its module from downloading. A static import can still include it in the initial bundle; a dynamic import creates an opportunity to defer loading.']]);

add('render-and-commit', 'Render, Commit, and Browser Paint', 'render-and-commit',
  'A state update requests work; it does not immediately rewrite the visible page inside the current event handler. Follow the stages to understand why a component can render without every DOM node changing.',
  [
    'Initial root rendering or a state update triggers work. React calls components to calculate their next descriptions. Descendants may be called as part of this work even when their own state did not change.',
    'Rendering must remain pure because it can be restarted or abandoned. A calculated result is not proof that the user has seen it, and logging from render is not a reliable count of committed screen updates.',
    'During commit React applies the necessary DOM changes and updates refs. The browser then paints. Layout Effects can run before paint; ordinary Effects synchronize after commit, with paint timing affected by the interaction.',
  ],
  `import { useState } from 'react';
export default function RenderTrace() {
  const [count, setCount] = useState(0);
  return <section>
    <input aria-label="Uncontrolled note" defaultValue="Keep typing here" />
    <p>Count: {count}</p>
    <button onClick={() => setCount(c => c + 1)}>Increment</button>
  </section>;
}`,
  'Edit the input, then increment the counter. React calculates the section again, but the unchanged input node can remain in the DOM with its current user-entered text. Only the count text needs updating.',
  ['Trigger', 'Pure render', 'Commit and paint'],
  'Re-rendering is not the same as replacing the entire DOM subtree. Do not judge performance solely by the number of console logs from a component.',
  'Why can a render happen without a DOM text change?',
  'The new description may match the existing committed output. React can complete the calculation and find no host change to apply.',
  [['Initial and subsequent renders', 'The first commit creates the initial host nodes. Later commits compare the new output with prior output and preserve matching nodes when possible. Matching depends on element type, position, and keys.'], ['Measure user-visible work', 'Profile representative interactions with realistic data. Examine commit duration, browser layout, and network work before introducing memoization. A fast render can be cheaper than the complexity of a cache.']]);

add('state-update-queue', 'Batching and the State Update Queue', 'queueing-a-series-of-state-updates',
  'State setters enqueue instructions. React combines updates before rendering when appropriate, and each handler still reads the snapshot from the render that created it.',
  [
    'Calling setCount(count + 1) calculates a replacement using the current snapshot. Repeating that line three times queues the same replacement value three times, so it does not mean add three.',
    'A functional updater receives the result of the previous queued update. Three calls to setCount(n => n + 1) compose into an increase of three. Keep updater functions pure because React may call them again in development checks.',
    'A replacement can overwrite earlier queued results. Mixing replacement and updater calls is predictable when evaluated from left to right: replace with 5, then add 1, then replace with 42 yields 42.',
  ],
  `import { useState } from 'react';
export default function Queue() {
  const [count, setCount] = useState(0);
  function replace() { setCount(count + 1); setCount(count + 1); setCount(count + 1); }
  function add() { setCount(n => n + 1); setCount(n => n + 1); setCount(n => n + 1); }
  return <><p>{count}</p><button onClick={replace}>Replace three times</button><button onClick={add}>Add three times</button></>;
}`,
  'From zero, Replace three times shows one because all replacements equal one. Add three times then starts from one and produces four. React does not update count inside the already-running handler; the next render receives the completed queue result.',
  ['Render snapshot', 'Ordered queue', 'Next state'],
  'Do not send requests, change other state, or mutate data inside a functional updater. It should calculate and return the next value only.',
  'Starting at zero, what do setCount(5), setCount(n => n + 1), and setCount(2) produce?',
  'The queue becomes 5, then 6, then 2. The last replacement wins, so the next render sees 2.',
  [['Batching boundaries', 'React batches updates to avoid unnecessary intermediate screens. Distinct intentional user events are handled separately so, for example, a submit control can be disabled before the next click. Do not depend on a guessed number of render calls.'], ['Asynchronous closures', 'A timeout callback retains values from the render in which it was created. A functional updater is useful when an eventual update must use the latest queued state instead of that captured value.']]);

add('state-machines', 'Reacting to Input with Explicit UI States', 'reacting-to-input-with-state',
  'Describe a form as a few valid states rather than issuing separate commands to show, hide, enable, and disable elements. This keeps the interface consistent during asynchronous work.',
  [
    'List the visual states: editing, submitting, success, and error. Identify which user or network event moves the interface between them, then sketch those transitions before writing handlers.',
    'Choose one status value instead of contradictory booleans such as isSending and isSuccess. Derive button disabling and status text from it. Keep only the editable fields and information that cannot be calculated.',
    'Let a submit handler validate and trigger the asynchronous operation. Handle both success and failure and allow recovery. A network response may arrive later, so state transitions should be explicit and guarded where overlapping requests are possible.',
  ],
  `import { useState } from 'react';
export default function PracticeForm() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('editing');
  async function submit(e) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // simulated save
      if (!name.trim()) throw new Error('Name required');
      setStatus('success');
    } catch { setStatus('error'); }
  }
  return <form onSubmit={submit}>
    <label>Name <input value={name} disabled={status === 'submitting'} onChange={e => {setName(e.target.value); setStatus('editing');}} /></label>
    <button disabled={status === 'submitting' || !name.trim()}>Save</button>
    <p role="status">{status}</p>
  </form>;
}`,
  'Typing updates the editable value. Submit sets one status to submitting, which disables both controls. The simulated operation then changes the status to success; an exception uses error. No code directly sets a DOM disabled property.',
  ['Editing', 'Submitting', 'Success or error'],
  'Separate booleans can accidentally represent a form that is both successful and still submitting. Prefer a status union and derive each visible branch from it.',
  'Where should a retry button send the form after a failed request?',
  'It should trigger another submission from the error state, clear or replace the old error, and enter submitting. The user must still see a recoverable error if that attempt fails.',
  [['Identify human and computer inputs', 'A keystroke, submit action, successful response, and failed response are different events. Writing them down exposes missing loading or retry paths before implementation.'], ['Remove nonessential state', 'Values such as isEmpty, canSubmit, and displayed status text can usually be calculated. Fewer independently stored facts mean fewer combinations that must be kept consistent.']]);

add('state-structure', 'Choosing State Structure and Normalizing Data', 'choosing-the-state-structure',
  'A good state model makes invalid combinations difficult to represent. Group values that change together, store facts once, and calculate the rest during rendering.',
  [
    'Group related values when they always change as a unit, but keep independent concerns separate. An x/y position often belongs in one object; unrelated dialog visibility and search text need not share an object.',
    'Avoid contradictions, redundant values, and duplicate objects. Store selectedId rather than a separate selected object copied from an array. Look up the current object from the current collection.',
    'Flatten deeply nested structures when updates become error-prone. A map indexed by IDs plus arrays of IDs lets one record change without copying an entire nested hierarchy or synchronizing duplicates.',
  ],
  `import { useState } from 'react';
export default function Selection() {
  const [courses, setCourses] = useState([{id:'r', title:'React'}, {id:'c', title:'CSS'}]);
  const [selectedId, setSelectedId] = useState('r');
  const selected = courses.find(c => c.id === selectedId);
  return <section>
    {courses.map(c => <button key={c.id} onClick={() => setSelectedId(c.id)}>{c.title}</button>)}
    <p>Selected: {selected?.title || 'None'}</p>
    <button onClick={() => setCourses(items => items.map(c => c.id === selectedId ? {...c, title:c.title + '!'} : c))}>Rename selected</button>
  </section>;
}`,
  'Select React and rename it. Both its button and the selected label immediately show the new title because both read the same updated record. A duplicated selected object would have retained the old title unless separately synchronized.',
  ['Store facts once', 'Update by identity', 'Derive the view'],
  'Initializing local state from a prop only uses that prop for the initial render. It does not automatically keep the local copy synchronized when the parent changes.',
  'If the selected course is deleted, how should the UI respond?',
  'The lookup returns undefined, so show a deliberate empty state or choose a replacement selection as part of the deletion action. Do not retain a stale copied object.',
  [['Avoid deeply nested state', 'A normalized record map might contain coursesById and orderedIds. Updating one title replaces the map entry and the map itself. The order array can remain unchanged because it contains references by ID rather than copied records.'], ['Derived state and prop mirroring', 'Calculate totals, filtered lists, and selected records from existing inputs. Copy a prop into state only when deliberately creating an independent draft, and clearly decide when that draft should reset.']]);

add('preserve-reset-state', 'Preserving and Resetting State with Identity', 'preserving-and-resetting-state',
  'React associates state with a component identity in the rendered tree. The same component function can have several independent memories, and a key can intentionally start a new one.',
  [
    'The same type at the same tree position generally preserves state across renders. Switching a prop does not automatically create a new component, even when separate JSX branches appear in the source.',
    'Removing a subtree, changing its component type, or changing its key resets its local state. Keys distinguish siblings by identity and can also express that an editor now belongs to a different record.',
    'Define component functions at module scope. Defining a new child function inside a parent render creates a new function identity, which can cause unexpected resets on every parent update.',
  ],
  `import { useState } from 'react';
function Draft({ course }) {
  const [note, setNote] = useState('');
  return <label>Note for {course}<input value={note} onChange={e => setNote(e.target.value)} /></label>;
}
export default function Notebook() {
  const [course, setCourse] = useState('React');
  return <><button onClick={() => setCourse(c => c === 'React' ? 'CSS' : 'React')}>Switch course</button>
    <Draft key={course} course={course} />
  </>;
}`,
  'Type a React note, then switch to CSS. The changed key creates a fresh Draft with an empty note. Switching back also creates an empty draft; keys do not maintain a hidden cache of removed components.',
  ['Tree identity', 'Compare type and key', 'Preserve or reset'],
  'A key is not a prop readable by the component, and it does not persist drafts after unmount. Pass an ID separately and lift drafts to a surviving parent if they must be restored.',
  'How would you preserve one note per course while switching?',
  'Store a draftsByCourse object in Notebook or another surviving owner. Pass the selected draft and an update callback to Draft rather than keeping the only copy in the unmounted child.',
  [['Resetting a form with a key', 'Use a record ID as the key when changing the record should discard all local form state, including child fields. Confirm that losing unsaved edits is the desired product behavior.'], ['Preserving removed content', 'A hidden but mounted subtree can preserve local state, but many mounted views may be expensive. Lifting selected data or persisting it externally is often clearer than keeping every view alive.']]);

add('reducer-context', 'Scaling State with Reducer and Context', 'scaling-up-with-reducer-and-context',
  'Reducers organize how state changes; context distributes access to that state and its dispatch function. Combining them is useful for a complex screen, without automatically requiring a global application store.',
  [
    'Move scattered update logic into a pure reducer that accepts current state and an action. Actions describe what happened, such as completed, rather than exposing arbitrary mutations to every component.',
    'Provide state and dispatch through separate contexts when their consumers differ. A deeply nested button can dispatch without each intermediate layout component forwarding the function.',
    'Keep the provider, reducer, and access Hooks together in a feature module. Make missing providers fail clearly. Context supplies a value to descendants; it is not a data-fetching cache or a substitute for thoughtful state ownership.',
  ],
  `import { createContext, useContext, useReducer } from 'react';
const Progress = createContext(null);
const Dispatch = createContext(null);
function reducer(state, action) {
  if (action.type === 'completed') return {...state, [action.id]: true};
  if (action.type === 'reset') return {};
  throw new Error('Unknown action: ' + action.type);
}
function CompleteButton() {
  const dispatch = useContext(Dispatch);
  return <button onClick={() => dispatch({type:'completed', id:'hooks'})}>Complete Hooks</button>;
}
function Summary() {
  const progress = useContext(Progress);
  return <p>{Object.keys(progress).length} complete</p>;
}
export default function Workshop() {
  const [progress, dispatch] = useReducer(reducer, {});
  return <Progress.Provider value={progress}><Dispatch.Provider value={dispatch}>
    <Summary /><CompleteButton />
  </Dispatch.Provider></Progress.Provider>;
}`,
  'Click Complete Hooks. The reducer returns a new object with hooks:true, the state provider receives it, and Summary displays one. Clicking again still shows one because a record keyed by lesson ID represents completion rather than a click count.',
  ['Dispatch event', 'Pure reducer', 'Context consumers'],
  'Do not perform requests inside a reducer. Start asynchronous work in an event handler or data layer and dispatch the meaningful outcomes.',
  'Why split state and dispatch into two contexts?',
  'Their consumers often need different values. Dispatch has a stable identity, so separating it avoids making a dispatch-only consumer subscribe to every state-value change through that context.',
  [['Extracting state logic', 'First write handlers that dispatch clear action objects; next move the update calculations into a reducer; finally wire useReducer. Unit-test reducer transitions with ordinary objects without rendering UI.'], ['Scope and performance', 'Put the provider near the feature that needs it. All consumers of a changed context value may update, so split unrelated contexts and avoid constructing unnecessarily changing values. Measure before adding memoization.']]);

add('dom-refs', 'DOM Refs: Focus, Scroll, Measurement, and Cleanup', 'manipulating-the-dom-with-refs',
  'Refs provide access to browser nodes for operations that cannot be described as JSX, such as moving keyboard focus. Use this escape hatch without taking ownership of the DOM structure away from React.',
  [
    'Create a ref, attach it to a host element, and use ref.current from an event or Effect after commit. During rendering a newly mounted node does not yet exist, and after unmount the ref is cleared.',
    'Use focus, scrollIntoView, or measurement APIs for imperative browser behavior. Avoid deleting or rearranging children that React manages, because its next commit expects those nodes to match its own tree.',
    'For collections, callback refs can maintain a map from IDs to nodes and remove entries during cleanup. In React 19, callback refs may return a cleanup function; custom components can receive ref as a prop.',
  ],
  `import { useRef } from 'react';
export default function SearchFocus() {
  const input = useRef(null);
  return <section>
    <label>Find a lesson <input ref={input} /></label>
    <button onClick={() => input.current?.focus()}>Focus search</button>
  </section>;
}`,
  'React commits the input and assigns its DOM node to input.current. Clicking Focus search invokes the browser focus method. No state update is needed because the browser manages focus; React still owns the input’s structure.',
  ['Commit node', 'Assign ref', 'Browser operation'],
  'Calling focus during render can encounter null or perform a side effect in work that is later abandoned. Focus after the element has been committed.',
  'Why might setShow(true) followed immediately by newInput.current.focus() fail?',
  'The event handler has requested a render but the new input may not yet be committed. Focus in an appropriate post-commit Effect or callback ref instead of assuming synchronous DOM availability.',
  [['Accessing another component’s node', 'A component can expose a ref intentionally, but doing so couples the parent to an imperative capability. Expose only the operations required; useImperativeHandle can provide a limited handle instead of the entire node.'], ['Flushing updates', 'flushSync can force a synchronous commit for rare browser integration needs, but it may hurt performance and flush other work. Prefer designing the focus or scroll action around committed refs.']]);

add('unnecessary-effects', 'Removing Unnecessary Effects', 'you-might-not-need-an-effect',
  'Before writing an Effect, name the external system being synchronized. If the task is calculating a value or responding to a click, another part of the component usually expresses the intent more directly.',
  [
    'Calculate filtered lists, totals, and combined names during render. An Effect that stores those calculations creates an initial stale render followed by another update and introduces extra synchronization rules.',
    'Place user-specific work in the event that caused it. A checkout request belongs in the submit handler, not an Effect that guesses a purchase happened from changes in several state values.',
    'Reset an entire form with identity when appropriate, share update logic through ordinary functions, and notify parents in the same event as a local change. Use a subscription abstraction such as useSyncExternalStore for external stores.',
  ],
  `import { useState } from 'react';
export default function NamePreview() {
  const [first, setFirst] = useState('Ada');
  const [last, setLast] = useState('Lovelace');
  const full = first.trim() + ' ' + last.trim();
  return <><label>First <input value={first} onChange={e => setFirst(e.target.value)} /></label>
    <label>Last <input value={last} onChange={e => setLast(e.target.value)} /></label><p>{full}</p></>;
}`,
  'Each keystroke schedules one new calculation with current first and last values. The displayed full name cannot lag behind a separate fullName state update because that extra state does not exist.',
  ['Identify intent', 'Calculate or handle', 'Effect if external'],
  'Avoid chains of Effects where one sets state to trigger the next. Calculate the next state together in the original event or express transitions in a reducer.',
  'An expensive filtered list is slow. Should an Effect store it?',
  'First measure the calculation. If caching helps, memoize the pure calculation with the correct dependencies or use the configured React Compiler. An Effect adds synchronization rather than solving the calculation cost.',
  [['Adjusting state on prop changes', 'Prefer deriving selection from an ID and current items. If identity changes should reset all local state, use a key. A guarded render-time adjustment is an advanced option, but it must converge and should not replace a simpler model.'], ['Initialization and fetching', 'One-time application initialization differs from a component Effect and must account for server execution. Fetching needs loading, error, cache, cancellation or stale-result handling; a framework or data library can coordinate these concerns.']]);

add('effect-lifecycle', 'The Lifecycle of Reactive Effects', 'lifecycle-of-reactive-effects',
  'Think of an Effect as starting and stopping one synchronization process. A mounted component may restart that process many times as its inputs change.',
  [
    'Setup connects the current inputs to an external system. Cleanup disconnects that exact setup using the values it captured. A prop update can require cleanup and setup even while the component itself remains mounted.',
    'All reactive values read by the Effect belong in its dependencies unless the code is restructured so they are no longer reactive reads. React compares dependencies with Object.is to decide whether resynchronization is needed.',
    'Separate independent synchronization processes into separate Effects. Development checks may exercise a setup-cleanup-setup sequence, so a correct subscription must not accumulate duplicate listeners or timers.',
  ],
  `import { useEffect, useState } from 'react';
function Ticker({ delay }) {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTicks(n => n + 1), delay);
    return () => clearInterval(timer);
  }, [delay]);
  return <p>{ticks} ticks at {delay}ms</p>;
}
export default function App() {
  const [fast, setFast] = useState(false);
  return <><button onClick={() => setFast(f => !f)}>Change speed</button><Ticker delay={fast ? 250 : 1000} /></>;
}`,
  'The initial Effect starts a one-second timer. Change speed: React cleans up that timer and starts a quarter-second timer. ticks is preserved because Ticker stays at the same position; only its synchronization process restarts.',
  ['Start process', 'Inputs change', 'Stop and restart'],
  'An empty dependency list does not mean run whenever you personally consider the component mounted. If setup reads a changing prop, omitting it leaves the process using an old value.',
  'What would happen if cleanup were removed from this example?',
  'Each speed change would leave the previous interval running. Ticks would accelerate unexpectedly, and development remount checks would reveal additional leaked intervals.',
  [['Reactive and stable values', 'Props and local values calculated during render are reactive. State setters have stable identities. A ref object is stable, but ref.current mutations do not trigger renders and are not a subscription mechanism.'], ['One process per Effect', 'An analytics connection and a chat subscription may have different reasons to restart. Combining them can reconnect one unnecessarily when only the other input changes. Split by synchronization responsibility.']]);

add('effect-events', 'Separating Events from Effects with Effect Events', 'separating-events-from-effects',
  'Some code inside synchronization should read current information without making that information a reason to restart the synchronization. Effect Events express that distinction in React 19.2 and later.',
  [
    'A normal event handler responds to an interaction such as clicking Send. An Effect responds to a synchronization need, such as keeping a connection aligned with roomId. Their triggers are different even when both read state.',
    'useEffectEvent creates logic callable from Effects that can read the latest committed props and state. It is useful for incidental logging or notifications that should reflect current settings without reconnecting a resource.',
    'Keep genuinely reactive setup inputs in the dependency array. Do not use Effect Events to hide missing dependencies, call them from render, or pass them as general-purpose callbacks to children.',
  ],
  `import { useEffect, useEffectEvent, useState } from 'react';
function ClockNotice({ label }) {
  const notify = useEffectEvent(() => console.log('Current label:', label));
  useEffect(() => {
    const timer = setInterval(() => notify(), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p>Open the console to inspect the current label.</p>;
}
export default function App() {
  const [label, setLabel] = useState('Practice');
  return <><input aria-label="Label" value={label} onChange={e => setLabel(e.target.value)} /><ClockNotice label={label} /></>;
}`,
  'The interval starts once for this mounted process. Editing label does not recreate the interval, yet its next callback reads the latest committed label through notify. If the interval delay were a prop, that delay would still be a reactive setup dependency.',
  ['Reactive setup', 'Effect callback', 'Latest read'],
  'Effect Events are not a universal replacement for useCallback or an escape from the Hooks linter. Use them only for non-reactive logic called from Effects.',
  'Should roomId be moved into an Effect Event when changing rooms must reconnect?',
  'No. roomId defines the synchronization target and must remain a dependency of the connection Effect. Only incidental information such as notification theme belongs in non-reactive logic.',
  [['Read latest without reconnecting', 'A connection callback can show a notification with the newest theme while the connection depends on roomId. The room still controls setup and cleanup; the theme only controls the notification presentation.'], ['Version and tooling', 'The project uses React 19.2, which includes useEffectEvent. Keep the Hooks linter current enough to understand its dependency semantics. Earlier React versions need a different design or an upgrade.']]);

add('effect-dependencies', 'Removing Effect Dependencies Without Hiding Bugs', 'removing-effect-dependencies',
  'Change the code’s reactive reads before changing its dependency list. Dependencies describe the synchronization your Effect actually performs; they are not a manual schedule to tune until a warning disappears.',
  [
    'Move static values outside the component when they truly do not change. Construct objects and helper functions inside the Effect if they are only needed there, so their changing render-time identities do not trigger restarts.',
    'Use a functional state updater when an Effect needs to update based on previous state but does not need to subscribe to that value. Split independent processes that react to different input sets.',
    'Move user-event work back into handlers and use Effect Events only for intentionally non-reactive reads. Never suppress the dependency linter as the default fix for a loop or stale closure.',
  ],
  `import { useEffect, useState } from 'react';
export default function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount(c => c + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p>{count} seconds</p>;
}`,
  'The Effect does not read count; its updater receives the current queued value when React applies the update. Therefore count is not a dependency and the timer does not restart on each tick. The empty array now follows the code rather than contradicting it.',
  ['Inspect reads', 'Restructure logic', 'Match dependencies'],
  'Changing [options] to [] while still using a changing options object freezes the setup at an old value. Construct options inside the Effect from explicit primitive dependencies instead.',
  'An Effect reconnects whenever a parent re-renders because options is a new object. What is a safe fix?',
  'Read the primitive fields the connection actually uses and create the options object inside the Effect, listing those fields as dependencies. Preserve reactivity for values that really change the connection.',
  [['Objects and functions', 'Two object literals with the same fields are distinct identities. Dependency comparison does not deeply compare their contents. Prefer primitive dependencies when they capture the true synchronization contract.'], ['Breaking an infinite loop', 'Find the state update inside the Effect, then determine which dependency it changes. Remove redundant derived state, split unrelated synchronization, or update only when a real external change requires it. A missing dependency merely hides the cycle.']]);

add('custom-hook-design', 'Custom Hooks: Reactive Inputs and Independent State', 'reusing-logic-with-custom-hooks',
  'A custom Hook packages a reusable synchronization or stateful behavior. It shares the logic, while every call still has its own state and Effect lifecycle.',
  [
    'Name a Hook with use followed by a capital letter when it calls Hooks. A pure formatting function should stay an ordinary function. A clear name describes the capability, such as useOnlineStatus, rather than a lifecycle trick.',
    'Accept reactive inputs as arguments and pass them to the underlying Hooks with correct dependencies. Return the smallest useful interface so callers can use the behavior without knowing its subscription details.',
    'Do not create a useMount wrapper to conceal dependencies or a generic useLifecycle abstraction. A well-designed Hook should make its synchronization purpose and cleanup understandable.',
  ],
  `import { useSyncExternalStore } from 'react';
function subscribe(notify) {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => { window.removeEventListener('online', notify); window.removeEventListener('offline', notify); };
}
function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
export default function ConnectionBadge() {
  const online = useOnlineStatus();
  return <p role="status">{online ? 'Browser reports online' : 'Browser reports offline'}</p>;
}`,
  'The Hook subscribes to browser connectivity events and returns a boolean snapshot. Cleanup removes both listeners. The server snapshot is a deliberate initial fallback. Browser online status is a hint about network availability, not proof that a particular API is reachable.',
  ['Reusable contract', 'Own subscription', 'Current snapshot'],
  'Two calls to a custom Hook do not automatically share a state variable. Use a common owner, context, or an external store when callers must coordinate one shared value.',
  'Should formatCourseTitle be renamed useFormatCourseTitle?',
  'Not if it is a pure function that calls no Hooks. The use prefix communicates Hook restrictions and should describe actual Hook behavior.',
  [['When to extract', 'Extract repeated behavior or a meaningful synchronization boundary. Tiny one-off logic can remain inline until naming it improves understanding. A Hook is not automatically more reusable just because it has many configuration flags.'], ['Passing event handlers', 'Decide whether changing a callback should restart synchronization. If it should, include it as a dependency. If an Effect callback needs current incidental behavior without restart, consider an Effect Event within the custom Hook.']]);

add('react-compiler', 'React Compiler: Adoption, Configuration, and Debugging', 'react-compiler',
  'React Compiler is a build-time optimization tool that can cache eligible component calculations and values. It complements correct React code; it does not turn mutation or broken dependencies into safe application logic.',
  [
    'Understand the baseline before enabling compilation. Identify slow interactions, record behavior, and make components follow the Rules of React. Automatic memoization reduces manual caching work in eligible code.',
    'Install and configure the compiler through the supported integration for the actual framework or bundler. Match the target React version, keep lint diagnostics visible, and adopt incrementally when a whole-codebase change is too risky.',
    'Debug compilation diagnostics separately from runtime correctness failures. Reproduce an issue with a small component, compare compiled and uncompiled behavior, and retain tests for user-visible results rather than guessed render counts.',
  ],
  `// A pure component eligible for compiler optimization when the build
// is configured. Without the compiler it remains ordinary valid React.
export default function CourseResults({ courses, query }) {
  const visible = courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
  return <ul>{visible.map(c => <li key={c.id}>{c.title}</li>)}</ul>;
}`,
  'The component always computes the same visible list for the same inputs and never changes courses. A configured compiler can reuse eligible work when inputs are unchanged. This code alone does not enable the compiler; build configuration is required.',
  ['Pure source', 'Compiler analysis', 'Cached eligible work'],
  'Do not claim every component will compile or every interaction will become faster. Network, layout, and very large initial downloads remain separate bottlenecks.',
  'Can useMemo and memo be deleted blindly after installing the compiler?',
  'No. Verify the integration, compilation coverage, correctness, and performance first. Some code may be excluded or require deliberate migration, and manual memoization may still document external identity contracts.',
  [['Installation and incremental adoption', 'Use the official integration instructions for the project’s build stack. Start with a bounded directory or opt-in compilation mode when needed, then expand after diagnostics and behavior are understood.'], ['Directives and configuration', 'Compiler directives such as "use memo" and "use no memo" control compilation under the configured mode. They are compiler instructions, not runtime Hooks. Consult the official configuration reference for target and gating options rather than copying settings from another framework.'], ['Compiling libraries', 'Library authors can ship precompiled code, but must document runtime compatibility and test the distributed build. Consumers should not need to infer compiler requirements from an untested source-only example.'], ['Troubleshooting', 'Check whether the compiler is actually active, inspect diagnostics, isolate mutation or rule violations, and compare user-visible behavior. Use an intentional opt-out for a diagnosed issue while fixing it, rather than silencing all warnings.']]);

export const expansionSections = [{
  slug: 'react-learn-workshop',
  title: 'React Learn: Guided Workshops and Deeper Models',
  lessons: entries.map(({ content, ...article }) => article),
}];
export const expansionLessons = Object.fromEntries(entries.map(({slug, content}) => [slug, content]));

expansionLessons['react-learn-workshop--state-structure'].deepDive.push(
  {
    heading: 'Immutable insertion, sorting, and nested records',
    paragraphs: [
      'To insert at index i, create [...items.slice(0, i), newItem, ...items.slice(i)]. To reorder, copy before mutating: const next = [...items]; next.sort(compare). Copying the array alone does not copy its objects: update an item with items.map(item => item.id === id ? {...item, title: nextTitle} : item). For a nested address, copy both the record and the address along the changed path.',
      'The unchanged records may keep their old identities. This structural sharing is safe because nobody mutates the previous snapshots. It also gives comparison-based optimizations useful evidence about which records changed.',
    ],
  },
  {
    heading: 'Immer as an optional immutable-update helper',
    paragraphs: [
      'Immer is an additional library, not a built-in React Hook. Its produce function gives a draft proxy and records writes so it can return a new immutable result. For example, after installing Immer, setProfile(previous => produce(previous, draft => { draft.address.city = nextCity; })) updates a nested city without manually spreading each level. Import produce from immer and declare nextCity in the handler before using this excerpt.',
      'The mutation-like syntax is safe only inside the managed draft callback. Mutating the original state object elsewhere remains incorrect. Flattening an unnecessarily complicated state model can still be a better first step than adding a helper.',
    ],
  },
);

// Source-to-lesson index. The topical checklist is intentionally visible data so
// future documentation changes can be reconciled rather than silently assumed.
const map = (page, lessons, subtopics) => ({
  url: `https://react.dev/learn/${page}`,
  lessons,
  subtopics,
  reviewed: '2026-11-21',
});
const workshop = id => `react-learn-workshop--${id}`;
export const reactLearnCoverage = [
  map('', ['jsx-and-components--functional-components','jsx-and-components--understanding-jsx','state-and-events--handling-events','state-and-events--lifting-state-up'], ['Creating and nesting components','Markup and styles','Displaying data','Conditions and lists','Events and screen updates','Hooks','Sharing data']),
  map('tutorial-tic-tac-toe', [workshop('tic-tac-toe-history')], ['Setup','Components and props','Interaction','Lifting state','Immutable updates','Taking turns','Winner and draw detection','History','Time travel','Keys','Branching history']),
  map('thinking-in-react', [workshop('thinking-in-react')], ['Component hierarchy','Static UI','Minimal state','State ownership','Inverse data flow']),
  map('installation', [workshop('installation-and-tooling')], ['Try React','Framework setup','Build from scratch','Incremental adoption','Create React App deprecation']),
  map('creating-a-react-app', [workshop('installation-and-tooling')], ['Framework choice','Routing','Data loading','Deployment']),
  map('build-a-react-app-from-scratch', [workshop('installation-and-tooling')], ['Build tools','Routing','Data fetching','Rendering strategies']),
  map('add-react-to-an-existing-project', [workshop('installation-and-tooling')], ['Existing subroutes','Independent widgets','DOM ownership','Multiple roots']),
  map('editor-setup', [workshop('installation-and-tooling')], ['Editor syntax','Formatting','Linting']),
  map('typescript', [workshop('typescript-components')], ['Component props','Hooks','Events','Children','Styles','Runtime validation boundaries']),
  map('react-developer-tools', ['react-foundations--react-developer-tools',workshop('installation-and-tooling')], ['Browser extension','Component inspection','Profiling']),
  map('your-first-component', ['jsx-and-components--functional-components'], ['Component definition','Export','JSX return','Nesting','Capitalized names']),
  map('importing-and-exporting-components', ['under-the-hood--import-and-export-patterns'], ['Root component','Named exports','Default exports','Import matching','File splitting']),
  map('writing-markup-with-jsx', ['jsx-and-components--understanding-jsx'], ['Single root','Fragments','Closed tags','camelCase','JSX and HTML differences']),
  map('javascript-in-jsx-with-curly-braces', [workshop('jsx-curly-braces')], ['Strings','Expressions','Attribute values','Objects','Inline styles']),
  map('passing-props-to-a-component', ['jsx-and-components--props','jsx-and-components--component-composition'], ['Reading props','Destructuring','Defaults','Spread','Children','Read-only snapshots']),
  map('conditional-rendering', ['jsx-and-components--conditional-rendering'], ['if','Returning null','Ternary','Logical AND','Conditional variables']),
  map('rendering-lists', ['jsx-and-components--rendering-lists-and-keys'], ['filter','map','Stable keys','Keyed Fragments','Key placement']),
  map('keeping-components-pure', [workshop('pure-rendering')], ['Pure calculation','Inputs','Strict Mode','Local mutation','Side effects']),
  map('understanding-your-ui-as-a-tree', [workshop('ui-trees')], ['Render tree','Roots and leaves','Conditional branches','Module dependency graph']),
  map('responding-to-events', ['state-and-events--handling-events'], ['Handlers','Arguments','Event props','Propagation','Default prevention']),
  map('state-a-components-memory', ['state-and-events--component-state','react-hooks--usestate'], ['Local variables','State Hook','Multiple variables','Isolated instances']),
  map('render-and-commit', [workshop('render-and-commit')], ['Trigger','Rendering','Commit','Paint','Pure rendering']),
  map('state-as-a-snapshot', ['state-and-events--state-as-a-snapshot'], ['Snapshot values','Event closures','Delayed callbacks']),
  map('queueing-a-series-of-state-updates', [workshop('state-update-queue')], ['Batching','Updater functions','Replacement updates','Mixed queue']),
  map('updating-objects-in-state', ['state-and-events--updating-objects-in-state',workshop('state-structure')], ['Read-only state','Shallow spread','Nested copying','Flattening','Immer alternative']),
  map('updating-arrays-in-state', ['state-and-events--updating-arrays-in-state',workshop('state-structure')], ['Adding','Removing','Transforming','Replacing','Inserting','Sorting copies','Nested objects']),
  map('reacting-to-input-with-state', [workshop('state-machines')], ['Visual states','Human and computer inputs','State model','Removing redundant state','Handlers']),
  map('choosing-the-state-structure', [workshop('state-structure')], ['Grouping','Contradictions','Redundancy','Duplication','Normalization','Prop mirroring']),
  map('sharing-state-between-components', ['state-and-events--lifting-state-up','class-components--controlled-vs-uncontrolled-components'], ['Common owner','Callbacks','Controlled and uncontrolled','Single source of truth']),
  map('preserving-and-resetting-state', [workshop('preserve-reset-state')], ['Position','Type','Keys','Nested definitions','Form reset','Removed drafts']),
  map('extracting-state-logic-into-a-reducer', ['react-hooks--usereducer',workshop('reducer-context')], ['Actions','Reducer extraction','useReducer','Purity','Testing']),
  map('passing-data-deeply-with-context', ['advanced-react--context-api',workshop('reducer-context')], ['Prop drilling','Create','Provide','Consume','Closest provider','Alternatives']),
  map('scaling-up-with-reducer-and-context', [workshop('reducer-context')], ['State and dispatch contexts','Provider','Feature module','Custom access Hooks']),
  map('referencing-values-with-refs', ['react-hooks--useref'], ['Mutable current','Refs versus state','When to use','Avoid render reads']),
  map('manipulating-the-dom-with-refs', [workshop('dom-refs')], ['Focus','Scroll','Callback refs','Other components','Commit timing','flushSync','DOM ownership']),
  map('synchronizing-with-effects', ['react-hooks--useeffect','react-hooks--effect-cleanup',workshop('effect-lifecycle')], ['Events versus Effects','Setup','Dependencies','Cleanup','Development checks','Fetching races']),
  map('you-might-not-need-an-effect', [workshop('unnecessary-effects')], ['Derived data','Caching','Reset','Adjust state','Shared handlers','Requests','Effect chains','Initialization','Parent notification','Subscriptions','Fetching']),
  map('lifecycle-of-reactive-effects', [workshop('effect-lifecycle')], ['Start and stop','Resynchronization','Dependencies','Independent processes','Reactive values','Stable values']),
  map('separating-events-from-effects', [workshop('effect-events')], ['Interaction triggers','Reactive synchronization','Effect Events','Latest values','Restrictions']),
  map('removing-effect-dependencies', [workshop('effect-dependencies')], ['Code-dependency agreement','Linter','Updater functions','Split processes','Nonreactive reads','Objects and functions']),
  map('reusing-logic-with-custom-hooks', [workshop('custom-hook-design'),'react-hooks--custom-hooks'], ['Naming','Independent state','Reactive arguments','Specific contracts','Effect cleanup','Extraction choices']),
  map('react-compiler', [workshop('react-compiler')], ['Introduction','Installation','Incremental adoption','Debugging','Configuration','Directives','Compiling libraries']),
];

export const reactLearnCoverageNote = 'Topic-level map of the React Learn curriculum reviewed on 21 November 2026. Original examples and explanations supplement the existing course. API reference pages, release notes, external framework documentation, and future changes are not represented as an exhaustive Learn curriculum. Some mapped subtopics are brief treatments within broader lessons; links allow deeper reading.';
