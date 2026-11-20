// Animated flow diagrams (rendered by ReactMotion) and "step by step" deep dives for the
// lessons that were written before animations existed. reactLessons.js merges these in
// only where a lesson has no animation / deepDive of its own.
const a = (title, nodes, steps) => ({
  title,
  nodes: nodes.map(([id, label, sub]) => ({ id, label, sub })),
  steps: steps.map(([from, to, label, note]) => ({ from, to, label, note })),
});
const d = (heading, points, code) => [{ heading, points, ...(code ? { code } : {}) }];

export const reactLessonVisuals = {
  /* ---------- Welcome ---------- */
  "welcome--course-introduction": {
    animation: a("How the course builds one app", [["static", "Static UI", "components"], ["state", "Interactive", "state, events"], ["data", "Remote data", "fetch, routing"], ["ship", "Production", "tests, deploy"]], [
      ["static", "state", "add state", "Start with static course cards, then make them respond to clicks and typing."],
      ["state", "data", "load", "Replace hard-coded arrays with data from an API and add routes."],
      ["data", "ship", "harden", "Add tests, performance checks and accessibility before deploying."],
      ["ship", "static", "iterate", "Each new feature repeats the loop: describe UI, add state, connect data, verify."],
    ]),
    deepDive: d("How to study each lesson step by step", ["Read the core concepts and watch the animation once without pausing.", "Replay the animation step by step and predict the next step before clicking.", "Type the worked example yourself in a practice project; don't copy-paste.", "Change one input, predict the new output, then check it.", "Answer the practice question before revealing the explanation."]),
  },
  "welcome--react-learning-roadmap": {
    animation: a("The React learning roadmap", [["js", "JavaScript", "ES modules, arrays"], ["ui", "Describe UI", "JSX, props"], ["inter", "Interactivity", "state, events"], ["manage", "Manage state", "lift, reducer"], ["escape", "Escape hatches", "refs, effects"], ["prod", "Production", "perf, tests"]], [
      ["js", "ui", "foundation", "Comfort with functions, destructuring, map/filter and modules makes JSX feel natural."],
      ["ui", "inter", "make it move", "Once you can render data, add state and event handlers."],
      ["inter", "manage", "scale", "As apps grow, decide where state lives and how it flows."],
      ["manage", "escape", "integrate", "Refs and effects connect React to timers, the DOM and network."],
      ["escape", "prod", "ship", "Finally optimise, test and deploy."],
    ]),
    deepDive: d("Milestones to check off", ["Build a static page from a mockup with reusable components.", "Add a form with validation and a filterable list.", "Fetch data with loading and error states and handle race conditions.", "Add routing with nested layouts and a protected page.", "Write tests for the main user flows and profile one slow interaction."]),
  },
  "welcome--project-setup": {
    animation: a("From empty folder to running app", [["create", "npm create vite", "scaffold"], ["install", "npm install", "dependencies"], ["dev", "npm run dev", "dev server"], ["browser", "Browser", "localhost:5173"]], [
      ["create", "install", "files", "The template creates index.html, src/main.jsx, src/App.jsx and package.json."],
      ["install", "dev", "start", "Dependencies land in node_modules; the dev script starts Vite."],
      ["dev", "browser", "serve", "Vite serves ES modules and transforms JSX on request."],
      ["browser", "dev", "HMR", "Saving a file sends a hot update; React Fast Refresh keeps component state."],
    ]),
    deepDive: d("Setup step by step", ["Install Node.js LTS and check `node -v` and `npm -v`.", "Run `npm create vite@latest my-app -- --template react` (or react-ts).", "`cd my-app`, `npm install`, then `npm run dev`.", "Open the printed URL, edit src/App.jsx and watch it update.", "Install the React DevTools browser extension and ESLint in your editor."], "npm create vite@latest my-app -- --template react\ncd my-app\nnpm install\nnpm run dev"),
  },

  /* ---------- React foundations ---------- */
  "react-foundations--what-is-react": {
    animation: a("Data in, UI out", [["data", "State & props", "your data"], ["comp", "Components", "functions"], ["tree", "Element tree", "description"], ["dom", "Browser DOM", "screen"]], [
      ["data", "comp", "inputs", "Components receive props and read state."],
      ["comp", "tree", "return JSX", "They return a description of the UI, not DOM commands."],
      ["tree", "dom", "commit", "React DOM updates the page to match the description."],
      ["dom", "data", "event", "A click changes state and the cycle repeats with new data."],
    ]),
    deepDive: d("React in one sentence, step by step", ["UI = f(state): the screen is a function of your data.", "You write components; React decides when to call them.", "React compares the new output with the previous one.", "Only changed parts of the DOM are touched.", "React is a library: routing, data and builds come from other tools."]),
  },
  "react-foundations--creating-a-react-application": {
    animation: a("Choosing how to start", [["need", "Your needs", "SSR? routing?"], ["fw", "Framework", "Next.js, RR v7"], ["vite", "Vite", "client-only SPA"], ["app", "Running app", "dev server"]], [
      ["need", "fw", "full-stack", "Need routing, SSR, data loading or SEO? Start with a framework."],
      ["need", "vite", "SPA", "A client-only app or learning project? Start with Vite."],
      ["fw", "app", "create", "`npx create-next-app` or `npx create-react-router` scaffolds everything."],
      ["vite", "app", "create", "`npm create vite@latest` gives a minimal React setup to grow yourself."],
    ]),
    deepDive: d("What a build-from-scratch setup needs", ["A bundler and dev server (Vite, Parcel, Rsbuild).", "Routing (React Router or TanStack Router).", "Data fetching and caching (TanStack Query, SWR or router loaders).", "Rendering strategy: CSR, SSR or SSG depending on SEO and speed needs.", "Code splitting, linting, testing and deployment configuration."]),
  },
  "react-foundations--react-project-structure": {
    animation: a("How the files connect", [["html", "index.html", "#root div"], ["main", "main.jsx", "createRoot"], ["app", "App.jsx", "root component"], ["feat", "features/", "components, hooks"]], [
      ["html", "main", "script", "index.html loads src/main.jsx as a module."],
      ["main", "app", "render", "main.jsx creates the root and renders <App />."],
      ["app", "feat", "imports", "App composes pages and feature components."],
      ["feat", "app", "exports", "Features export components and hooks that App and pages import."],
    ]),
    deepDive: d("A structure that scales", ["src/main.jsx: entry point, providers, root render.", "src/App.jsx: top-level layout and routes.", "src/features/<name>/: components, hooks, api and tests for one feature.", "src/components/ui/: shared buttons, inputs and modals.", "public/: static files served as-is (favicon, robots.txt)."]),
  },
  "react-foundations--rendering-elements": {
    animation: a("Rendering into the root", [["el", "<App />", "element"], ["root", "createRoot", "#root"], ["render", "root.render", "first render"], ["dom", "DOM", "nodes created"]], [
      ["el", "root", "target", "createRoot(document.getElementById('root')) takes over one DOM node."],
      ["root", "render", "render", "root.render(<App />) asks React to render the element tree."],
      ["render", "dom", "commit", "React creates DOM nodes for the whole tree on the first render."],
      ["dom", "render", "update", "Later state updates re-render and patch only what changed."],
    ]),
    deepDive: d("Elements are immutable snapshots", ["An element is a plain object: type, props, key.", "You never change an element; you render a new one.", "React compares the new element tree with the previous one.", "Unchanged DOM nodes are kept, even if the component re-ran.", "Call root.render once; let state drive later updates."], "import { createRoot } from 'react-dom/client';\nimport App from './App';\n\ncreateRoot(document.getElementById('root')).render(<App />);"),
  },
  "react-foundations--declarative-ui": {
    animation: a("Declarative vs imperative", [["state", "State", "isOpen = true"], ["describe", "Describe", "if open → menu"], ["react", "React", "diff & patch"], ["dom", "DOM", "menu visible"]], [
      ["state", "describe", "read", "Your component reads the current state."],
      ["describe", "react", "return JSX", "It returns what the UI should look like for that state."],
      ["react", "dom", "patch", "React computes and applies the DOM steps (add the menu)."],
      ["dom", "state", "click", "Closing sets isOpen = false; you describe again, React removes the menu."],
    ]),
    deepDive: d("Why declarative code has fewer bugs", ["Imperative: 'find the menu, add a class, update the count' for every possible transition.", "Declarative: one description per state; transitions are React's job.", "No forgotten update paths: the UI always matches the state.", "Easier to test: render a state, assert the output.", "Think in states (idle, loading, error, success), not in DOM steps."]),
  },
  "react-foundations--react-developer-tools": {
    animation: a("Inspecting with DevTools", [["tree", "Components tab", "tree"], ["select", "Select node", "props, state"], ["edit", "Edit values", "live"], ["prof", "Profiler", "render timing"]], [
      ["tree", "select", "click", "Pick a component in the tree or with the element picker."],
      ["select", "edit", "inspect", "See its props, state, hooks and which component rendered it."],
      ["edit", "tree", "re-render", "Change a state value and watch the UI update."],
      ["tree", "prof", "record", "Record an interaction in the Profiler to see what rendered and why."],
    ]),
    deepDive: d("DevTools workflow", ["Install the browser extension (Chrome, Firefox, Edge).", "Use 'Highlight updates when components render' to spot extra renders.", "Use the source link to jump to a component's code.", "Use the Profiler flame chart to find slow components.", "Enable 'Record why each component rendered' for render causes."]),
  },

  /* ---------- JSX and components ---------- */
  "jsx-and-components--understanding-jsx": {
    animation: a("What happens to JSX", [["jsx", "JSX source", "<h1>Hi</h1>"], ["compile", "Compiler", "Babel / SWC"], ["call", "jsx() call", "function call"], ["obj", "Element", "plain object"]], [
      ["jsx", "compile", "build", "The build tool reads your .jsx file."],
      ["compile", "call", "transform", "Each tag becomes `jsx('h1', { children: 'Hi' })`."],
      ["call", "obj", "run", "At runtime the call returns `{ type: 'h1', props: {...} }`."],
      ["obj", "jsx", "render", "React reads the objects to build the UI."],
    ]),
    deepDive: d("JSX rules step by step", ["Return one root element (or a Fragment).", "Close every tag, including `<img />` and `<br />`.", "Use camelCase attributes: className, htmlFor, onClick, tabIndex.", "Use `{}` for JavaScript expressions, `{{ }}` for an object such as style.", "Statements (if, for) can't go inside JSX; use ternaries, && or map."]),
  },
  "jsx-and-components--functional-components": {
    animation: a("A component's life in one render", [["props", "Props", "from parent"], ["fn", "Function", "Card(props)"], ["jsx", "JSX", "returned"], ["screen", "Screen", "shown"]], [
      ["props", "fn", "call", "React calls `Card` with the props object."],
      ["fn", "jsx", "return", "The function computes and returns JSX."],
      ["jsx", "screen", "commit", "React turns that JSX into DOM."],
      ["screen", "props", "new props", "When the parent re-renders, Card is called again with new props."],
    ]),
    deepDive: d("Writing your first component", ["Name it in PascalCase: `function ProfileCard()`.", "Return JSX describing the UI.", "Export it (`export default` or named) and import where needed.", "Render it as a tag: `<ProfileCard />`.", "Define it at module level, never inside another component."]),
  },
  "jsx-and-components--props": {
    animation: a("Props flow down", [["parent", "Parent", "owns data"], ["props", "Props object", "{ title }"], ["child", "Child", "reads props"], ["ui", "UI", "rendered"]], [
      ["parent", "props", "attributes", "`<Card title=\"React\" />` collects attributes into props."],
      ["props", "child", "argument", "The child receives `{ title }` as its argument."],
      ["child", "ui", "render", "It renders using the values but never changes them."],
      ["child", "parent", "callback", "To change data, the child calls a function prop like onSelect."],
    ]),
    deepDive: d("Props step by step", ["Destructure in the signature: `function Card({ title, level = 'beginner' })`.", "Defaults apply only when the prop is undefined.", "Pass any value: strings, numbers, objects, functions, JSX.", "`children` holds nested JSX between the tags.", "Treat props as read-only snapshots."]),
  },
  "jsx-and-components--component-composition": {
    animation: a("Composing with children", [["layout", "Layout", "frame"], ["slot", "children slot", "{children}"], ["content", "Page content", "passed in"], ["result", "Result", "combined UI"]], [
      ["layout", "slot", "places", "Layout renders a header, a footer and `{children}` in between."],
      ["content", "slot", "fills", "The caller puts any content between <Layout> tags."],
      ["slot", "result", "renders", "React renders the content inside the layout's frame."],
      ["result", "layout", "reuse", "The same Layout wraps every page without knowing their details."],
    ]),
    deepDive: d("Composition patterns", ["Wrapper components with `children` (Card, Modal, Layout).", "Named slots via props: `<Page header={<Nav />} />`.", "Specialisation: `<Dialog title=\"Delete?\" />` built from a generic Dialog.", "Passing components down avoids prop drilling.", "Prefer composition over inheritance."]),
  },
  "jsx-and-components--conditional-rendering": {
    animation: a("Choosing what to render", [["state", "State", "status"], ["check", "Condition", "if / ? / &&"], ["yes", "Branch A", "content"], ["no", "Branch B", "fallback / null"]], [
      ["state", "check", "read", "The component reads state or props."],
      ["check", "yes", "true", "If the condition holds, return or include branch A."],
      ["check", "no", "false", "Otherwise return branch B, or null for nothing."],
      ["no", "state", "change", "When state changes, the condition is re-evaluated on the next render."],
    ]),
    deepDive: d("Which syntax to use", ["Early `return` for loading, error and empty states.", "Ternary `a ? <A/> : <B/>` to choose between two elements.", "`cond && <A/>` for show/hide, with a boolean condition.", "A lookup object for many cases: `const views = { idle: <Idle/>, ... }`.", "Avoid deeply nested ternaries; extract a component."]),
  },
  "jsx-and-components--rendering-lists-and-keys": {
    animation: a("From array to keyed elements", [["data", "Array", "[{id, title}]"], ["map", "map()", "item → JSX"], ["keys", "Keys", "key={id}"], ["dom", "List DOM", "matched rows"]], [
      ["data", "map", "iterate", "Call `items.map(item => <Row ... />)`."],
      ["map", "keys", "identify", "Each element gets a stable key from the data."],
      ["keys", "dom", "match", "On re-render React matches rows by key, moving rather than recreating."],
      ["dom", "data", "reorder", "Sorting or deleting keeps each row's state with the right item."],
    ]),
    deepDive: d("Lists step by step", ["Filter or sort a copy first: `items.filter(...).toSorted(...)`.", "Map to JSX with a key on the outermost element.", "Keys must be unique among siblings, not globally.", "Use IDs from data, never Math.random().", "Extract a Row component when each item has its own state."]),
  },

  /* ---------- State and events ---------- */
  "state-and-events--handling-events": {
    animation: a("A click, step by step", [["user", "User", "clicks"], ["root", "React root", "delegation"], ["handler", "onClick", "your function"], ["state", "setState", "re-render"]], [
      ["user", "root", "bubbles", "The native click bubbles up to React's listener on the root."],
      ["root", "handler", "dispatch", "React calls your onClick with a synthetic event."],
      ["handler", "state", "update", "The handler updates state (or calls a parent callback)."],
      ["state", "user", "new UI", "React re-renders and the user sees the result."],
    ]),
    deepDive: d("Event handler rules", ["Pass the function, don't call it: `onClick={handleClick}`.", "Use an arrow to pass arguments: `onClick={() => remove(id)}`.", "Name handlers `handleX` and handler props `onX`.", "`e.preventDefault()` stops form submits or link navigation.", "`e.stopPropagation()` stops parents' handlers from running."]),
  },
  "state-and-events--component-state": {
    animation: a("State: a component's memory", [["first", "First render", "useState(0)"], ["slot", "React stores", "slot 0 = 0"], ["set", "setCount(1)", "queue update"], ["next", "Next render", "count = 1"]], [
      ["first", "slot", "create", "On mount React creates a slot holding 0."],
      ["slot", "set", "event", "A click calls the setter with a new value."],
      ["set", "next", "re-render", "React schedules a render; the function runs again."],
      ["next", "slot", "read", "useState now returns 1 from the stored slot."],
    ]),
    deepDive: d("Why a local variable isn't enough", ["Local variables reset each render.", "Changing them doesn't tell React to re-render.", "useState keeps the value between renders AND triggers a render.", "Each component instance has its own independent state.", "State is private to the component that declares it."]),
  },
  "state-and-events--updating-objects-in-state": {
    animation: a("Replacing, not mutating", [["old", "Old object", "{ name, city }"], ["copy", "Spread copy", "{ ...old }"], ["change", "Override", "city: 'Pune'"], ["set", "setUser(new)", "new reference"]], [
      ["old", "copy", "spread", "Copy existing fields into a new object."],
      ["copy", "change", "override", "Override only the fields that changed."],
      ["change", "set", "set", "Pass the new object to the setter."],
      ["set", "old", "compare", "React sees a new reference and re-renders."],
    ]),
    deepDive: d("Nested objects step by step", ["Copy each level you change: `{ ...user, address: { ...user.address, city } }`.", "Don't mutate first and then set; the reference stays the same.", "Use a computed key for forms: `{ ...form, [e.target.name]: e.target.value }`.", "Deeply nested data? Flatten it or use Immer.", "Remember `structuredClone` copies everything, which is usually more than you need."], "setUser(u => ({\n  ...u,\n  address: { ...u.address, city: 'Pune' },\n}));"),
  },
  "state-and-events--updating-arrays-in-state": {
    animation: a("Array operations without mutation", [["arr", "items", "current array"], ["add", "Add", "[...items, x]"], ["remove", "Remove", "filter()"], ["update", "Update", "map()"]], [
      ["arr", "add", "append", "Spread into a new array with the new item."],
      ["arr", "remove", "delete", "filter returns a new array without the item."],
      ["arr", "update", "edit", "map returns a new array with one item replaced."],
      ["update", "arr", "set", "Pass the new array to the setter; React re-renders."],
    ]),
    deepDive: d("Mutating vs non-mutating methods", ["Avoid: push, pop, shift, unshift, splice, sort, reverse, arr[i] = x.", "Prefer: concat/spread, filter, map, slice, toSorted, toReversed, with.", "Insert at an index: `[...a.slice(0, i), x, ...a.slice(i)]`.", "Update an object inside: `a.map(t => t.id === id ? { ...t, done } : t)`.", "Copying an array doesn't copy the objects inside it."]),
  },
  "state-and-events--lifting-state-up": {
    animation: a("Moving state to the common parent", [["a", "Panel A", "needs isOpen"], ["parent", "Accordion", "owns activeId"], ["b", "Panel B", "needs isOpen"], ["ui", "Synced UI", "one open"]], [
      ["a", "parent", "lift", "Remove local state from the panels; the parent now owns activeId."],
      ["parent", "a", "props", "Parent passes isActive and onShow to Panel A."],
      ["parent", "b", "props", "Same for Panel B, from the same source of truth."],
      ["b", "ui", "click", "Clicking B calls onShow → parent updates → both panels re-render in sync."],
    ]),
    deepDive: d("Lifting state in three moves", ["Remove the state from the children.", "Pass hard-coded data from the common parent to check the props work.", "Add state to the parent and pass value plus event handler down.", "Each piece of state has exactly one owner.", "Controlled components = state lifted to the parent."]),
  },
  "state-and-events--controlled-components": {
    animation: a("The controlled input loop", [["state", "State", "value"], ["input", "<input>", "value={value}"], ["type", "User types", "onChange"], ["set", "setValue", "new value"]], [
      ["state", "input", "render", "The input shows exactly what state holds."],
      ["input", "type", "keystroke", "The user types a character."],
      ["type", "set", "handler", "onChange reads e.target.value and calls the setter."],
      ["set", "state", "re-render", "State updates and the input shows the new value."],
    ]),
    deepDive: d("Controlled inputs step by step", ["Text: `value` + `onChange` with e.target.value.", "Checkbox: `checked` + e.target.checked.", "Select: `value` on the select element.", "Initialise with '' rather than undefined to avoid switching modes.", "Transform input in the handler (uppercase, trimming, masking)."]),
  },
  "state-and-events--state-as-a-snapshot": {
    animation: a("Each render sees a fixed snapshot", [["r0", "Render", "count = 0"], ["click", "Handler", "uses count 0"], ["queue", "Queue", "set(0 + 1) ×3"], ["r1", "Next render", "count = 1"]], [
      ["r0", "click", "snapshot", "The handler was created during the render where count is 0."],
      ["click", "queue", "set", "Three `setCount(count + 1)` calls all queue 'replace with 1'."],
      ["queue", "r1", "process", "React processes the queue: 1, 1, 1 → 1."],
      ["r1", "r0", "contrast", "With `setCount(c => c + 1)` each update would read the previous result: 3."],
    ]),
    deepDive: d("Snapshot rules", ["State variables are constant within one render.", "Setting state requests a new render; it doesn't change the variable now.", "Timers and async callbacks see the value from the render that created them.", "Use updater functions to build on queued updates.", "Read the 'next' value from a local variable you computed."]),
  },

  /* ---------- Hooks ---------- */
  "react-hooks--rules-of-hooks": {
    animation: a("Why call order matters", [["r1", "Render 1", "useState, useEffect"], ["list", "Hook list", "slot 0, slot 1"], ["r2", "Render 2", "same order"], ["bad", "Conditional", "order breaks"]], [
      ["r1", "list", "store", "React stores Hooks in a list in call order."],
      ["list", "r2", "match", "Next render, the first call gets slot 0, the second slot 1."],
      ["r2", "bad", "if skipped", "If a condition skips a Hook, every later Hook reads the wrong slot."],
      ["bad", "r1", "rule", "So: only call Hooks at the top level, the same way every render."],
    ]),
    deepDive: d("The two rules", ["Only call Hooks at the top level: not in conditions, loops or nested functions.", "Only call Hooks from React function components or custom Hooks.", "Put the condition inside the Hook: `useEffect(() => { if (open) ... })`.", "Return early only after all Hooks have been called.", "Turn on eslint-plugin-react-hooks to catch violations."]),
  },
  "react-hooks--usestate": {
    animation: a("useState lifecycle", [["init", "Initial value", "first render only"], ["pair", "[value, set]", "returned"], ["set", "set(next)", "queued"], ["render", "Re-render", "new value"]], [
      ["init", "pair", "mount", "On first render React stores the initial value."],
      ["pair", "set", "event", "An event calls the setter with a value or updater."],
      ["set", "render", "schedule", "If the value changed (Object.is), React re-renders."],
      ["render", "pair", "return", "useState returns the latest value; the initial value is ignored now."],
    ]),
    deepDive: d("useState checklist", ["Lazy init for expensive defaults: `useState(() => load())`.", "Updater function when the next value depends on the previous.", "Objects and arrays: always set a new reference.", "Don't mirror props in state; derive values instead.", "Group related values, or switch to useReducer when updates get complex."]),
  },
  "react-hooks--useeffect": {
    animation: a("Effect timing", [["render", "Render", "pure"], ["commit", "Commit", "DOM updated"], ["paint", "Paint", "user sees"], ["effect", "Effect", "sync outside"]], [
      ["render", "commit", "apply", "React renders and commits DOM changes."],
      ["commit", "paint", "paint", "The browser paints the new frame."],
      ["paint", "effect", "run", "Then React runs effects whose dependencies changed."],
      ["effect", "render", "maybe", "If the effect sets state, another render follows."],
    ]),
    deepDive: d("Writing an effect step by step", ["Declare it: `useEffect(() => { ... })`.", "Add dependencies: every reactive value used inside.", "Add cleanup when you subscribe, connect or start a timer.", "Check it with StrictMode's setup → cleanup → setup in development.", "Ask: is this syncing with an external system? If not, you may not need an effect."]),
  },
  "react-hooks--effect-cleanup": {
    animation: a("Setup and cleanup pairs", [["setup1", "Setup", "roomId = 1"], ["clean1", "Cleanup", "disconnect 1"], ["setup2", "Setup", "roomId = 2"], ["unmount", "Unmount", "final cleanup"]], [
      ["setup1", "clean1", "deps change", "roomId changes, so React first runs the previous cleanup."],
      ["clean1", "setup2", "re-run", "Then it runs setup with the new value."],
      ["setup2", "unmount", "leave", "When the component unmounts, cleanup runs one last time."],
      ["unmount", "setup1", "mirror", "Every setup is mirrored by exactly one cleanup."],
    ]),
    deepDive: d("What to clean up", ["setInterval/setTimeout → clearInterval/clearTimeout.", "addEventListener → removeEventListener with the same function.", "fetch → AbortController.abort() or an ignore flag.", "WebSocket/subscription → close or unsubscribe.", "Third-party widgets → their destroy() method."], "useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);"),
  },
  "react-hooks--useref": {
    animation: a("A ref is a box React doesn't watch", [["create", "useRef(0)", "{ current: 0 }"], ["mutate", "ref.current++", "no render"], ["persist", "Next render", "same object"], ["dom", "ref={ref}", "DOM node"]], [
      ["create", "mutate", "write", "Writing ref.current changes the value silently."],
      ["mutate", "persist", "keep", "The same object survives every render."],
      ["persist", "dom", "attach", "Pass it as `ref` to an element; React puts the node in current."],
      ["dom", "create", "use", "Use it in handlers/effects: focus, measure, timer IDs."],
    ]),
    deepDive: d("Ref vs state", ["Display it on screen? Use state.", "Only needed by handlers or effects? Use a ref.", "Don't read or write ref.current during render.", "DOM refs are null until after the first commit.", "Callback refs and ref cleanup handle dynamic lists."]),
  },
  "react-hooks--usememo": {
    animation: a("Cached calculation", [["deps", "Dependencies", "[items, query]"], ["check", "Changed?", "Object.is"], ["compute", "Recompute", "filter()"], ["cache", "Cached value", "reused"]], [
      ["deps", "check", "compare", "On render, React compares each dependency with last time."],
      ["check", "compute", "changed", "If any changed, it calls the function and stores the result."],
      ["check", "cache", "same", "If none changed, it returns the cached value without calling it."],
      ["cache", "deps", "next", "The cache holds one previous result per useMemo call."],
    ]),
    deepDive: d("When useMemo pays off", ["The calculation is measurably slow (≥1ms on a slow device).", "The value is passed to a memo() component.", "The value is a dependency of another Hook.", "Otherwise skip it; plain code is clearer.", "React Compiler can add this automatically."]),
  },
  "react-hooks--usecallback": {
    animation: a("Keeping a function identity", [["render", "Render", "new functions"], ["cb", "useCallback", "deps [id]"], ["same", "Same function", "deps unchanged"], ["child", "memo child", "skips render"]], [
      ["render", "cb", "wrap", "Wrap the handler in useCallback with its dependencies."],
      ["cb", "same", "reuse", "If dependencies are unchanged React returns the previous function."],
      ["same", "child", "props equal", "A memo child sees an identical prop and skips re-rendering."],
      ["child", "render", "deps change", "When id changes, a new function is created and the child renders."],
    ]),
    deepDive: d("useCallback step by step", ["Only useful with memo children or as a Hook dependency.", "List every value the function reads in the deps.", "Use updater functions to drop state from the deps.", "Don't wrap handlers for plain DOM elements.", "Measure before and after with the Profiler."]),
  },
  "react-hooks--usereducer": {
    animation: a("dispatch → reducer → state", [["ui", "Component", "dispatch(action)"], ["action", "Action", "{ type: 'added' }"], ["reducer", "Reducer", "pure function"], ["state", "New state", "re-render"]], [
      ["ui", "action", "dispatch", "The event handler dispatches an action describing what happened."],
      ["action", "reducer", "process", "React calls reducer(state, action)."],
      ["reducer", "state", "return", "The reducer returns a new state object."],
      ["state", "ui", "render", "The component re-renders with the new state."],
    ]),
    deepDive: d("Converting useState to useReducer", ["Replace setX calls with dispatch({ type, ...data }).", "Write a reducer with a switch on action.type.", "Return new objects; never mutate.", "Throw on unknown action types to catch typos.", "Test the reducer as a plain function."], "function reducer(state, action) {\n  switch (action.type) {\n    case 'added': return [...state, action.task];\n    case 'deleted': return state.filter(t => t.id !== action.id);\n    default: throw new Error('Unknown action ' + action.type);\n  }\n}"),
  },
  "react-hooks--custom-hooks": {
    animation: a("Extracting a custom Hook", [["dup", "Duplicate logic", "in 2 components"], ["hook", "useOnlineStatus", "useState + effect"], ["c1", "StatusBar", "calls hook"], ["c2", "SaveButton", "calls hook"]], [
      ["dup", "hook", "extract", "Move the shared state + effect into a function named useX."],
      ["hook", "c1", "use", "Component one calls the Hook and gets the value."],
      ["hook", "c2", "use", "Component two calls it too, with its own independent state."],
      ["c2", "dup", "result", "Logic lives once; each caller stays simple."],
    ]),
    deepDive: d("Designing a good custom Hook", ["Name it after its purpose: useOnlineStatus, useDebounce.", "Accept reactive inputs as arguments.", "Return the minimal API the caller needs.", "Hooks share logic, not state.", "Avoid lifecycle-style Hooks like useMount; they hide intent."]),
  },

  /* ---------- Forms ---------- */
  "forms--building-react-forms": {
    animation: a("Form data flow", [["fields", "Fields", "inputs"], ["state", "Form state", "values"], ["submit", "onSubmit", "preventDefault"], ["send", "Send", "API / action"]], [
      ["fields", "state", "change", "Each field updates form state (controlled) or keeps its own value."],
      ["state", "submit", "submit", "Pressing Enter or the button fires onSubmit."],
      ["submit", "send", "send", "Prevent the page reload, then send the data."],
      ["send", "fields", "reset", "On success reset the form; on error show messages."],
    ]),
    deepDive: d("Form building checklist", ["Wrap fields in a real <form> so Enter submits.", "Every input has a <label> linked with htmlFor/id.", "Use name attributes; FormData collects values by name.", "React 19: `<form action={fn}>` passes FormData to fn.", "Disable the submit button while pending."]),
  },
  "forms--form-validation": {
    animation: a("Validation flow", [["input", "Input", "user value"], ["rules", "Rules", "required, format"], ["errors", "Errors", "per field"], ["ui", "Feedback", "aria-invalid"]], [
      ["input", "rules", "validate", "On blur or submit, check the value against rules."],
      ["rules", "errors", "collect", "Collect a message per invalid field."],
      ["errors", "ui", "show", "Show the message next to the field and mark it invalid."],
      ["ui", "input", "fix", "As the user fixes it, re-validate and clear the error."],
    ]),
    deepDive: d("Validation step by step", ["Use native attributes first: required, minLength, type=email.", "Validate on submit; then on change for fields that already showed an error.", "Keep error messages specific and actionable.", "Link errors with aria-describedby and move focus to the first error.", "Always validate again on the server."]),
  },
  "forms--dynamic-form-fields": {
    animation: a("Adding and removing fields", [["list", "fields[]", "with ids"], ["add", "Add field", "append"], ["edit", "Edit field", "map by id"], ["remove", "Remove", "filter by id"]], [
      ["list", "add", "append", "Append `{ id: crypto.randomUUID(), value: '' }`."],
      ["list", "edit", "update", "Update one field by mapping over the array by id."],
      ["list", "remove", "delete", "Remove by filtering out the id."],
      ["remove", "list", "keys", "Keys from ids keep each input's focus and value attached correctly."],
    ]),
    deepDive: d("Dynamic fields tips", ["Never use the index as key for editable rows.", "Generate the id when the row is created.", "Name inputs `emails[0]` style for FormData or libraries.", "Focus the new field after adding (ref + effect or autoFocus).", "React Hook Form's useFieldArray manages this for larger forms."]),
  },
  "forms--form-submission": {
    animation: a("Submitting with an Action", [["form", "<form action>", "submit"], ["pending", "Pending", "useFormStatus"], ["server", "Action", "async fn(formData)"], ["result", "Result", "state / reset"]], [
      ["form", "pending", "submit", "React starts a transition; pending becomes true."],
      ["pending", "server", "call", "React calls your action with FormData."],
      ["server", "result", "return", "useActionState stores the returned value (errors or success)."],
      ["result", "form", "reset", "Uncontrolled fields reset automatically after success."],
    ]),
    deepDive: d("Submission states to handle", ["Idle → submitting → success or error.", "Prevent double submits by disabling the button while pending.", "Show server errors next to the relevant fields.", "Optimistic UI with useOptimistic for likely-successful actions.", "Keep the user's input when the submission fails."]),
  },

  /* ---------- Routing and data ---------- */
  "routing-and-data--client-side-routing": {
    animation: a("Client-side navigation", [["link", "<Link>", "click"], ["history", "History API", "pushState"], ["match", "Route match", "path → element"], ["render", "Render", "no reload"]], [
      ["link", "history", "navigate", "Link prevents the full reload and pushes the new URL."],
      ["history", "match", "location", "The router reads the new location."],
      ["match", "render", "render", "It renders the matching route's element."],
      ["render", "link", "back", "Back/forward buttons fire popstate and the router re-matches."],
    ]),
    deepDive: d("Routing setup step by step", ["Install react-router and create a router (createBrowserRouter).", "Define routes: path + element (+ children for layouts).", "Use <Link>/<NavLink> for internal navigation.", "Add a catch-all `*` route for 404 pages.", "Configure the server to serve index.html for unknown paths."]),
  },
  "routing-and-data--nested-routes": {
    animation: a("Layouts with Outlet", [["root", "/ Root layout", "nav + Outlet"], ["dash", "/dashboard", "layout + Outlet"], ["child", "/dashboard/stats", "page"], ["screen", "Screen", "nested UI"]], [
      ["root", "dash", "match", "The URL matches the root route and its dashboard child."],
      ["dash", "child", "match", "The deepest match is the stats page."],
      ["child", "screen", "render", "Each layout renders its own UI, putting the child in <Outlet />."],
      ["screen", "dash", "navigate", "Switching child pages keeps the parent layouts mounted."],
    ]),
    deepDive: d("Nested route rules", ["Child paths are relative to the parent.", "`index` routes render at the parent's exact path.", "Shared UI (nav, sidebar) lives in the parent layout.", "Pass data to children with `<Outlet context>`.", "Each level can have its own loader and error boundary."]),
  },
  "routing-and-data--fetching-data": {
    animation: a("Fetch lifecycle", [["start", "Effect / loader", "start request"], ["loading", "Loading UI", "spinner"], ["data", "Response", "json"], ["show", "Render data", "success"]], [
      ["start", "loading", "pending", "Set loading and start fetch (with an AbortController)."],
      ["loading", "data", "await", "The response arrives and is parsed."],
      ["data", "show", "set", "Store data, clear loading; check `ok` and handle errors."],
      ["show", "start", "deps change", "When the id changes, abort the old request and start again."],
    ]),
    deepDive: d("Fetching options compared", ["useEffect + fetch: fine for learning, needs race handling.", "TanStack Query / SWR: caching, dedupe, retries, refetching.", "Router loaders: fetch before the route renders, in parallel.", "Server Components: fetch on the server, no client JS.", "Avoid waterfalls: start independent requests together."]),
  },
  "routing-and-data--loading-and-error-states": {
    animation: a("Explicit request states", [["idle", "idle", "nothing yet"], ["loading", "loading", "skeleton"], ["error", "error", "retry button"], ["success", "success", "data"]], [
      ["idle", "loading", "start", "A request begins; show a skeleton or spinner."],
      ["loading", "success", "resolve", "Data arrives; render it."],
      ["loading", "error", "reject", "The request fails; show a message and a retry."],
      ["error", "loading", "retry", "Retry moves back to loading."],
    ]),
    deepDive: d("Model status, not booleans", ["Use one status field: 'idle' | 'loading' | 'error' | 'success'.", "Impossible combinations (loading AND error) disappear.", "Keep old data visible while refetching if helpful.", "Use Suspense and error boundaries with data libraries.", "Show empty states separately from errors."]),
  },
  "routing-and-data--mutations-and-optimistic-updates": {
    animation: a("Optimistic update", [["click", "User action", "like"], ["opt", "Optimistic UI", "show liked"], ["server", "Server", "request"], ["final", "Confirm/rollback", "real state"]], [
      ["click", "opt", "instant", "Update the UI immediately as if the request succeeded."],
      ["opt", "server", "send", "Send the mutation in the background."],
      ["server", "final", "settle", "Success keeps the change; failure rolls back and shows an error."],
      ["final", "click", "refresh", "Invalidate or refetch related queries to stay consistent."],
    ]),
    deepDive: d("Mutation step by step", ["Disable repeated submits while pending.", "Apply the optimistic change (useOptimistic or the query cache).", "On error, restore the previous value and tell the user.", "On success, refetch or update caches.", "Only be optimistic when success is very likely."]),
  },

  /* ---------- Performance ---------- */
  "performance--react-rendering-model": {
    animation: a("Trigger → render → commit", [["trigger", "Trigger", "setState"], ["render", "Render", "call components"], ["diff", "Reconcile", "compare trees"], ["commit", "Commit", "DOM changes"]], [
      ["trigger", "render", "schedule", "A state update schedules a render of that component."],
      ["render", "diff", "children", "Its children render too unless they bail out (memo)."],
      ["diff", "commit", "changes", "React computes the minimal set of DOM operations it needs."],
      ["commit", "trigger", "effects", "Effects run after commit and may trigger again."],
    ]),
    deepDive: d("Render is not commit", ["Rendering means calling your components.", "Committing means touching the DOM.", "A render that produces the same output commits nothing.", "Many cheap renders are fine; slow renders matter.", "Find slow renders with the Profiler before optimizing."]),
  },
  "performance--memoizing-components": {
    animation: a("memo bail-out", [["parent", "Parent renders", "new state"], ["compare", "memo compare", "props equal?"], ["skip", "Skip", "reuse output"], ["render", "Render child", "props changed"]], [
      ["parent", "compare", "props", "React compares the memo child's new props shallowly."],
      ["compare", "skip", "equal", "All equal → the child is skipped."],
      ["compare", "render", "different", "Any prop differs → the child renders."],
      ["render", "parent", "stabilize", "Stabilise object and function props with useMemo/useCallback."],
    ]),
    deepDive: d("Cheaper alternatives to memo", ["Move state down into the component that uses it.", "Pass expensive subtrees as children so they don't re-render.", "Split contexts by update frequency.", "Virtualize long lists.", "Let React Compiler handle memoization where available."]),
  },
  "performance--code-splitting": {
    animation: a("Splitting the bundle", [["app", "App code", "one bundle"], ["import", "import()", "split point"], ["chunk", "Chunk", "separate file"], ["load", "Load on demand", "network"]], [
      ["app", "import", "mark", "A dynamic import marks a split point."],
      ["import", "chunk", "build", "The bundler emits a separate chunk for that module."],
      ["chunk", "load", "request", "The chunk is downloaded only when the code runs."],
      ["load", "app", "smaller", "The initial bundle shrinks, improving load time."],
    ]),
    deepDive: d("Where to split", ["Routes: each page in its own chunk.", "Heavy widgets: editors, charts, maps.", "Rarely used features: admin panels, modals.", "Avoid splitting tiny components; each chunk is a request.", "Inspect bundles with a visualizer plugin."]),
  },
  "performance--lazy-loading": {
    animation: a("lazy + Suspense", [["render", "Render <Page/>", "lazy component"], ["fetch", "Load chunk", "import()"], ["fallback", "Fallback", "<Spinner/>"], ["page", "Page", "ready"]], [
      ["render", "fetch", "first use", "Rendering the lazy component starts loading its chunk."],
      ["fetch", "fallback", "suspend", "While loading, the nearest Suspense shows its fallback."],
      ["fallback", "page", "resolve", "When the module arrives, React renders the page."],
      ["page", "render", "cached", "Later renders use the cached module instantly."],
    ]),
    deepDive: d("lazy step by step", ["Declare at module level: `const Page = lazy(() => import('./Page'))`.", "The module must have a default export (or map a named one).", "Wrap usage in <Suspense fallback>.", "Add an error boundary for failed chunk loads.", "Preload on hover or idle for faster navigation."], "const Settings = lazy(() => import('./Settings'));\n\n<Suspense fallback={<Spinner />}>\n  <Settings />\n</Suspense>"),
  },
  "performance--profiling-react-applications": {
    animation: a("Profiling loop", [["record", "Record", "Profiler"], ["interact", "Interact", "slow action"], ["read", "Read chart", "flame graph"], ["fix", "Fix & re-measure", "compare"]], [
      ["record", "interact", "start", "Start recording in React DevTools Profiler."],
      ["interact", "read", "stop", "Perform the slow interaction, then stop."],
      ["read", "fix", "diagnose", "Find wide or frequent bars and why they rendered."],
      ["fix", "record", "verify", "Apply one fix and record again to confirm."],
    ]),
    deepDive: d("Reading a profile", ["Each bar is a component; width ≈ render time.", "Grey bars didn't render in that commit.", "Check 'why did this render' for props, state, context or parent.", "Use a production profiling build for realistic numbers.", "Combine with the browser Performance panel for layout and paint."]),
  },

  /* ---------- Testing ---------- */
  "testing--testing-fundamentals": {
    animation: a("Arrange, act, assert", [["arrange", "Arrange", "render + data"], ["act", "Act", "user event"], ["assert", "Assert", "visible result"], ["report", "Report", "pass / fail"]], [
      ["arrange", "act", "setup", "Render the component with the inputs the test needs."],
      ["act", "assert", "interact", "Simulate what a user does: click, type, tab."],
      ["assert", "report", "check", "Assert on what the user can see or hear."],
      ["report", "arrange", "next", "Each test is independent and starts fresh."],
    ]),
    deepDive: d("The testing pyramid for React", ["Unit tests: pure functions, reducers, hooks.", "Component tests: render + interact with Testing Library.", "Integration tests: several components with mocked network.", "End-to-end tests: real browser flows (Playwright).", "Test behaviour, not implementation details."]),
  },
  "testing--react-testing-library": {
    animation: a("Querying like a user", [["render", "render()", "component"], ["screen", "screen", "the page"], ["query", "getByRole", "button 'Save'"], ["expect", "expect", "toBeInTheDocument"]], [
      ["render", "screen", "mount", "render() mounts the component into a test DOM."],
      ["screen", "query", "find", "Query by accessible role and name, like assistive tech."],
      ["query", "expect", "assert", "Assert with jest-dom matchers."],
      ["expect", "render", "cleanup", "Testing Library unmounts after each test."],
    ]),
    deepDive: d("Query priority", ["getByRole with { name } first.", "getByLabelText for form fields.", "getByPlaceholderText, getByText for content.", "getByTestId only as a last resort.", "Use screen.debug() to print the current DOM."]),
  },
  "testing--testing-user-interactions": {
    animation: a("user-event simulation", [["setup", "userEvent.setup()", "user"], ["type", "user.type", "keystrokes"], ["click", "user.click", "pointer events"], ["assert", "Assert", "new UI"]], [
      ["setup", "type", "await", "Create a user and await each interaction."],
      ["type", "click", "fill", "Typing fires keydown, input and keyup like a real user."],
      ["click", "assert", "submit", "Clicking fires pointer, mouse and click events."],
      ["assert", "setup", "verify", "Assert on the updated UI, using findBy for async results."],
    ]),
    deepDive: d("Interaction test checklist", ["Prefer user-event over fireEvent.", "Always await user-event calls.", "Test keyboard flows (Tab, Enter, Escape) too.", "Use findBy for content that appears after async work.", "Use fake timers for debounces and timeouts."]),
  },
  "testing--mocking-api-requests": {
    animation: a("MSW intercepts requests", [["comp", "Component", "fetch('/api')"], ["msw", "MSW handler", "intercepts"], ["mock", "Mock response", "json"], ["ui", "UI", "renders data"]], [
      ["comp", "msw", "request", "The component makes a real fetch call."],
      ["msw", "mock", "match", "MSW matches the URL and method to a handler."],
      ["mock", "ui", "respond", "The handler returns fake data or an error."],
      ["ui", "comp", "override", "Tests override handlers to cover error and empty cases."],
    ]),
    deepDive: d("Mocking strategy", ["Mock the network, not your components.", "Share handlers between tests, Storybook and dev.", "Reset handlers after each test.", "Test loading, success, empty and error responses.", "Assert requests were made with the right data when it matters."]),
  },
  "testing--end-to-end-testing": {
    animation: a("End-to-end flow", [["start", "Start app", "dev/preview"], ["browser", "Real browser", "Playwright"], ["flow", "User flow", "login → buy"], ["assert", "Assertions", "URL, text"]], [
      ["start", "browser", "launch", "The test runner starts the app and opens a browser."],
      ["browser", "flow", "drive", "It clicks and types through a complete user journey."],
      ["flow", "assert", "check", "It asserts on visible text, URLs and network results."],
      ["assert", "start", "CI", "Run in CI on every pull request."],
    ]),
    deepDive: d("Keep E2E tests reliable", ["Cover a few critical journeys, not every edge case.", "Use role-based locators.", "Seed test data and isolate accounts.", "Rely on auto-waiting, not sleeps.", "Record traces and screenshots on failure."]),
  },

  /* ---------- Advanced ---------- */
  "advanced-react--context-api": {
    animation: a("Context skips the middle", [["provider", "Provider", "value={theme}"], ["mid", "Middle layers", "don't pass it"], ["consumer", "useContext", "reads theme"], ["update", "Value changes", "consumers render"]], [
      ["provider", "mid", "wrap", "A provider wraps a subtree with a value."],
      ["mid", "consumer", "skip", "Components in between don't need to forward props."],
      ["consumer", "update", "subscribe", "useContext subscribes the consumer to that context."],
      ["update", "consumer", "re-render", "When the provider's value changes, every consumer re-renders."],
    ]),
    deepDive: d("Context step by step", ["`const Ctx = createContext(defaultValue)` in its own module.", "Wrap: `<Ctx value={value}>` (React 19) or `<Ctx.Provider>`.", "Read: `useContext(Ctx)` or `use(Ctx)`.", "Memoize object values to avoid needless renders.", "Write a `useX()` Hook that throws if the provider is missing."]),
  },
  "advanced-react--error-boundaries": {
    animation: a("Catching a render error", [["child", "Child", "throws"], ["boundary", "Error boundary", "catches"], ["fallback", "Fallback UI", "message"], ["log", "Logging", "report"]], [
      ["child", "boundary", "throw", "A component throws while rendering."],
      ["boundary", "fallback", "state", "getDerivedStateFromError switches to the fallback."],
      ["boundary", "log", "report", "componentDidCatch sends the error to monitoring."],
      ["fallback", "child", "retry", "A reset (new key) tries rendering the child again."],
    ]),
    deepDive: d("Placing boundaries", ["One at the app root as a last resort.", "Around each route so one page can fail alone.", "Around risky widgets (charts, third-party embeds).", "They don't catch event handler or async errors.", "react-error-boundary gives a function-component API."]),
  },
  "advanced-react--portals": {
    animation: a("Portal: DOM elsewhere, React here", [["comp", "Modal component", "in React tree"], ["portal", "createPortal", "target node"], ["body", "document.body", "DOM location"], ["events", "Events", "bubble in React"]], [
      ["comp", "portal", "render", "The modal renders through createPortal."],
      ["portal", "body", "mount", "Its DOM nodes are placed in document.body."],
      ["body", "events", "click", "Clicks inside still bubble to React ancestors."],
      ["events", "comp", "context", "Context from the React tree is still available."],
    ]),
    deepDive: d("Modal portal checklist", ["Escape overflow and z-index issues with a portal.", "Move focus into the dialog and trap it.", "Close on Escape and restore focus on close.", "Use role=\"dialog\", aria-modal and a label.", "Consider native <dialog> as an alternative."]),
  },
  "advanced-react--suspense": {
    animation: a("Suspense boundary", [["child", "Child", "suspends"], ["boundary", "Suspense", "nearest"], ["fallback", "Fallback", "skeleton"], ["reveal", "Reveal", "content"]], [
      ["child", "boundary", "throw promise", "A lazy component or use(promise) isn't ready yet."],
      ["boundary", "fallback", "show", "The nearest Suspense renders its fallback."],
      ["fallback", "reveal", "resolve", "When the data or code is ready, React retries."],
      ["reveal", "boundary", "nest", "Nested boundaries reveal content progressively."],
    ]),
    deepDive: d("What can suspend", ["React.lazy components.", "`use(promise)` with a cached promise.", "Suspense-enabled frameworks and data libraries.", "Not: fetches started in useEffect.", "Transitions keep old content instead of showing fallbacks again."]),
  },
  "advanced-react--transitions": {
    animation: a("Urgent vs transition update", [["type", "Keystroke", "urgent"], ["input", "Input updates", "instantly"], ["trans", "startTransition", "results"], ["commit", "Commit", "when ready"]], [
      ["type", "input", "urgent", "The input's own state updates immediately."],
      ["type", "trans", "mark", "The expensive results update is wrapped in a transition."],
      ["trans", "commit", "background", "React renders results in the background, interruptible."],
      ["commit", "type", "interrupt", "A new keystroke interrupts and restarts the background render."],
    ]),
    deepDive: d("Transitions step by step", ["`const [isPending, startTransition] = useTransition()`.", "Wrap non-urgent updates: tab switches, filtering large lists.", "Show isPending as a subtle indicator.", "Never put controlled input values inside a transition.", "React 19: async functions in transitions become Actions."]),
  },
  "advanced-react--server-and-client-components": {
    animation: a("Server and client split", [["server", "Server Component", "reads DB"], ["payload", "RSC payload", "serialized UI"], ["client", "Client Component", "'use client'"], ["browser", "Browser", "interactive"]], [
      ["server", "payload", "render", "Server Components run on the server and fetch data directly."],
      ["payload", "browser", "stream", "The result streams to the browser without their code."],
      ["payload", "client", "props", "Client Components receive serializable props."],
      ["client", "browser", "hydrate", "Only Client Components ship JS and become interactive."],
    ]),
    deepDive: d("Choosing server or client", ["Server: data fetching, secrets, large dependencies, static content.", "Client: state, effects, event handlers, browser APIs.", "Put 'use client' at the boundary, as low in the tree as possible.", "Pass Server Components to Client Components as children.", "Props across the boundary must be serializable."]),
  },

  /* ---------- Production ---------- */
  "production-react--application-architecture": {
    animation: a("Layers of a React app", [["ui", "UI components", "presentational"], ["feature", "Features", "pages, hooks"], ["data", "Data layer", "queries, API"], ["infra", "Infrastructure", "auth, config"]], [
      ["ui", "feature", "composed by", "Features compose shared UI components."],
      ["feature", "data", "calls", "Features read data through query Hooks."],
      ["data", "infra", "uses", "The data layer uses HTTP clients, auth and config."],
      ["infra", "ui", "rule", "Dependencies point one way: UI never imports from features."],
    ]),
    deepDive: d("Architecture decisions", ["Feature folders over type folders.", "A clear public API per feature (index file).", "Server state in a query library; client state local first.", "Shared design system for consistency.", "Enforce boundaries with lint rules."]),
  },
  "production-react--state-management-strategy": {
    animation: a("Where should this state live?", [["q", "New state", "what kind?"], ["local", "Local state", "one component"], ["url", "URL", "filters, page"], ["server", "Server cache", "API data"]], [
      ["q", "local", "UI only", "Used by one component → useState."],
      ["q", "url", "shareable", "Should survive refresh or be shareable → URL search params."],
      ["q", "server", "remote", "Comes from the API → TanStack Query / RTK Query."],
      ["local", "q", "grows", "Shared widely and changing often → context or a store."],
    ]),
    deepDive: d("State decision checklist", ["Can it be derived? Then it isn't state.", "Start local; lift only when needed.", "Server data belongs in a cache, not a global store.", "Global client state: theme, auth user, feature flags.", "Pick one store library per app, not three."]),
  },
  "production-react--accessibility": {
    animation: a("Accessible interaction", [["semantic", "Semantic HTML", "button, label"], ["keyboard", "Keyboard", "Tab, Enter, Esc"], ["aria", "ARIA", "only if needed"], ["test", "Test", "axe, screen reader"]], [
      ["semantic", "keyboard", "free", "Native elements give focus and keyboard support for free."],
      ["keyboard", "aria", "custom", "Custom widgets need roles, states and keyboard handling."],
      ["aria", "test", "verify", "Check with automated tools and real assistive tech."],
      ["test", "semantic", "fix", "Fix issues at the HTML level first."],
    ]),
    deepDive: d("Accessibility checklist", ["Every input has a visible label.", "Focus is visible and moves logically.", "Dialogs trap and restore focus.", "Dynamic messages use aria-live regions.", "Colour contrast meets WCAG AA."]),
  },
  "production-react--security-practices": {
    animation: a("Where attacks enter", [["input", "User input", "untrusted"], ["render", "Render", "auto-escaped"], ["danger", "Raw HTML", "sanitize!"], ["server", "Server", "authorize"]], [
      ["input", "render", "text", "Text rendered through JSX is escaped automatically."],
      ["input", "danger", "html", "dangerouslySetInnerHTML bypasses escaping; sanitize first."],
      ["input", "server", "requests", "Every request must be validated and authorized server-side."],
      ["server", "render", "secrets", "Secrets stay on the server, never in the bundle."],
    ]),
    deepDive: d("Security checklist", ["Sanitize HTML with DOMPurify before injecting.", "Validate URLs (no javascript:).", "Use HttpOnly cookies for sessions; protect against CSRF.", "Set a Content-Security-Policy.", "Audit dependencies regularly."]),
  },
  "production-react--deployment": {
    animation: a("Build and deploy pipeline", [["push", "git push", "main branch"], ["ci", "CI", "lint, test"], ["build", "npm run build", "dist/"], ["cdn", "Host / CDN", "live"]], [
      ["push", "ci", "trigger", "A push triggers the CI pipeline."],
      ["ci", "build", "pass", "If lint and tests pass, a production build runs."],
      ["build", "cdn", "upload", "Static files go to a CDN or the app server deploys."],
      ["cdn", "push", "rollback", "Keep previous builds so you can roll back quickly."],
    ]),
    deepDive: d("Deployment checklist", ["Set production environment variables.", "Configure SPA fallback to index.html.", "Cache hashed assets long, index.html short.", "Enable compression (gzip/brotli).", "Use preview deployments for pull requests."]),
  },
  "production-react--monitoring-and-maintenance": {
    animation: a("Observe and improve", [["users", "Real users", "sessions"], ["metrics", "Metrics", "Web Vitals"], ["errors", "Errors", "Sentry"], ["fix", "Fix & release", "iterate"]], [
      ["users", "metrics", "measure", "Collect LCP, INP and CLS from real sessions."],
      ["users", "errors", "capture", "Report errors with stack traces and source maps."],
      ["errors", "fix", "triage", "Prioritise by frequency and impact."],
      ["fix", "users", "release", "Release the fix and watch the metrics improve."],
    ]),
    deepDive: d("Maintenance routine", ["Upgrade React and dependencies regularly.", "Read release notes for deprecations.", "Track bundle size in CI.", "Remove dead code and unused feature flags.", "Keep tests green so upgrades are safe."]),
  },
};
