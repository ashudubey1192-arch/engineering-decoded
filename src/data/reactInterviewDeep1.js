// Step-by-step explanations for interview questions 1-50.
// Each entry: { steps: [...], pitfall, follow: [question, answer] }. Original wording.
export const deep1 = {
  1: {
    steps: [
      "You describe the screen as components: functions that take inputs (props) and return JSX.",
      "React calls those functions and builds a lightweight tree of elements describing the UI.",
      "When state changes, React calls the affected components again and compares the new tree with the old one.",
      "React DOM applies only the needed changes to the real page, so you never write manual DOM updates.",
    ],
    pitfall: "Calling React a full framework. It is a UI library: routing, data fetching and builds come from tools like React Router, TanStack Query, Vite or Next.js.",
    follow: ["Why is declarative UI easier to maintain?", "You state what the screen should look like for a given state; React works out the DOM steps. Fewer hand-written update paths means fewer bugs where the DOM and data disagree."],
  },
  2: {
    steps: [
      "Components: the UI is split into reusable, independent pieces.",
      "JSX: markup-like syntax inside JavaScript that compiles to function calls.",
      "One-way data flow: data moves down through props; changes travel back up through callbacks.",
      "Reconciliation and concurrent rendering keep updates efficient and the UI responsive.",
    ],
    pitfall: "Listing 'Virtual DOM makes React the fastest' as a feature. Its real value is a simple programming model with good-enough default performance.",
    follow: ["Which feature matters most in a large team?", "Component boundaries with one-way data flow: each component owns a small, predictable piece of UI and state, which makes code review and refactoring safer."],
  },
  3: {
    steps: [
      "You write HTML-like tags inside a .jsx/.tsx file.",
      "A compiler (Babel, SWC, esbuild) converts each tag into a call such as `jsx('h1', { children: 'Hi' })`.",
      "At runtime that call returns a plain JavaScript object, a React element.",
      "React reads the elements to decide what to show on screen.",
    ],
    pitfall: "Thinking browsers understand JSX. Without a build step (or Babel in the browser) the file is a syntax error.",
    follow: ["Why `className` instead of `class`?", "JSX becomes JavaScript object properties and `class` is a reserved word, so React uses the DOM property name `className` (likewise `htmlFor`)."],
  },
  4: {
    steps: [
      "Import `createElement` from 'react'.",
      "Call `createElement(type, props, ...children)` where JSX would have been.",
      "Nest calls for children: `createElement('ul', null, createElement('li', null, 'A'))`.",
      "Render the result with `createRoot(...).render(element)` exactly as with JSX.",
    ],
    pitfall: "Assuming non-JSX React is a different API. JSX is only syntax sugar; the produced elements are identical.",
    follow: ["When would you skip JSX?", "Tiny demos with a CDN script and no build step, or code generators. For real apps JSX is far more readable."],
  },
  5: {
    steps: [
      "Render produces a tree of plain objects (elements) describing the UI.",
      "On an update React produces a new tree.",
      "Reconciliation compares the new tree with the previous one, node by node.",
      "Only the differences are committed to the browser DOM.",
    ],
    pitfall: "Saying the Virtual DOM is a full copy of the browser DOM. It is a description of what React rendered, kept in Fiber nodes.",
    follow: ["Is the Virtual DOM always faster than direct DOM code?", "No. Hand-tuned DOM code can be faster; the Virtual DOM trades a little overhead for a much simpler declarative model."],
  },
  6: {
    steps: [
      "Real DOM: browser objects; changing them can trigger style, layout and paint work.",
      "Virtual DOM: cheap JavaScript objects created on every render.",
      "React diffs virtual trees in memory, which is fast, then touches the real DOM only where needed.",
      "Result: you write 'rerender everything' code while the browser sees targeted updates.",
    ],
    pitfall: "Claiming every real-DOM write causes a full reflow. Browsers batch layout; the cost comes from interleaving reads and writes.",
    follow: ["Can React update the DOM without the Virtual DOM?", "Refs give direct DOM access for focus, measurement or third-party widgets, but React-managed content should still change through state."],
  },
  7: {
    steps: [
      "A state or prop change schedules a re-render of a component.",
      "React compares old and new elements: a different type replaces the subtree; the same type updates props.",
      "For lists, keys match children across renders so items are moved instead of recreated.",
      "The collected changes are committed to the DOM in one pass.",
    ],
    pitfall: "Changing the element type (or a key) by accident, e.g. defining a component inside another, which destroys and remounts the subtree and loses its state.",
    follow: ["What are the two heuristics that keep diffing O(n)?", "Elements of different types produce different trees, and keys identify children that persist across renders."],
  },
  8: {
    steps: [
      "Fiber is React's internal engine (since React 16): one Fiber object per component instance.",
      "Rendering work is split into small units, one Fiber at a time.",
      "Between units React can pause, give the browser time, prioritise urgent updates or throw work away.",
      "Once a tree is complete, the commit phase applies DOM changes synchronously.",
    ],
    pitfall: "Thinking Fiber makes your JavaScript multithreaded. It is cooperative scheduling on the main thread.",
    follow: ["Which features depend on Fiber?", "Concurrent rendering, transitions, Suspense, error boundaries and time slicing all rely on interruptible Fiber work."],
  },
  9: {
    steps: [
      "A component is a JavaScript function whose name starts with a capital letter.",
      "It receives props and returns JSX describing a piece of UI.",
      "You use it like a tag: `<Card title=\"Hi\" />`, as many times as you like.",
      "Each usage gets its own state and lifecycle in the tree.",
    ],
    pitfall: "Calling a component as a function (`Card()`) instead of rendering `<Card />`. Hooks then belong to the parent and break.",
    follow: ["How small should components be?", "Split when a piece has its own responsibility, is reused, or its state changes independently; not merely to reduce line count."],
  },
  10: {
    steps: [
      "Class components extend `React.Component`, keep state in `this.state` and use lifecycle methods.",
      "Function components are plain functions and use Hooks for state and effects.",
      "Hooks group related logic together (one effect per concern) instead of splitting it across lifecycles.",
      "New code uses function components; classes remain for legacy code and error boundaries.",
    ],
    pitfall: "Saying function components cannot have state. Since React 16.8 Hooks give them state, effects and context.",
    follow: ["Which feature still needs a class?", "Error boundaries (`componentDidCatch` / `getDerivedStateFromError`) have no Hook equivalent; libraries like react-error-boundary wrap one."],
  },
  11: {
    steps: [
      "The parent writes attributes on a component tag: `<Avatar size={40} />`.",
      "React collects them into one object, `props`.",
      "The child reads them (usually destructured) to decide what to render.",
      "When the parent re-renders with new values, the child renders with the new props.",
    ],
    pitfall: "Mutating props inside the child. Props are read-only; ask the parent to change them through a callback prop.",
    follow: ["Can props be functions or JSX?", "Yes. Any JavaScript value works: callbacks for events, JSX for slots, and `children` for nested content."],
  },
  12: {
    steps: [
      "State is data a component remembers between renders, created with `useState`.",
      "React stores it outside the function, keyed by the component's position in the tree.",
      "Calling the setter schedules a re-render with the new value.",
      "The UI is recomputed from the latest state.",
    ],
    pitfall: "Storing values in state that can be computed from props or other state; derive them during render instead.",
    follow: ["Why not a normal variable?", "Local variables reset on every render and changing them does not trigger a re-render."],
  },
  13: {
    steps: [
      "Props come from the parent; state is owned by the component.",
      "Props are read-only for the child; state changes through its setter.",
      "A parent's state often becomes a child's props.",
      "Both trigger a re-render when they change.",
    ],
    pitfall: "Copying a prop into state (`useState(props.value)`) and expecting it to update; the initial value is used only on mount.",
    follow: ["When should a prop seed state?", "Only when the prop is truly an initial value (name it `initialX`). Use a `key` to reset the child when the seed changes."],
  },
  14: {
    steps: [
      "`state.count = 5` changes the value but React is never told.",
      "No re-render is scheduled, so the screen shows stale data.",
      "Mutating the same object also defeats `Object.is` comparisons used by memo and effects.",
      "Always call the setter with a new value or new object.",
    ],
    pitfall: "`items.push(x); setItems(items)`: same array reference, so React may skip the update. Use `setItems([...items, x])`.",
    follow: ["How does React decide if state changed?", "With `Object.is(old, new)`. Same reference means 'no change' and the render can bail out."],
  },
  15: {
    steps: [
      "Whatever you nest between a component's tags becomes `props.children`.",
      "The component decides where to place it: `<div className=\"card\">{children}</div>`.",
      "This lets generic wrappers (cards, layouts, modals) accept any content.",
      "Use extra props (e.g. `header`, `footer`) for multiple slots.",
    ],
    pitfall: "Manipulating children with `React.Children` helpers for simple cases; prefer explicit props or composition.",
    follow: ["Can children be a function?", "Yes, that is the render-props pattern: `{children(data)}`. It is less common now that custom Hooks exist."],
  },
  16: {
    steps: [
      "A component must return one expression.",
      "Wrap siblings in `<>...</>` (a Fragment) instead of an extra `<div>`.",
      "Fragments add nothing to the DOM, keeping tables, flex and grid layouts valid.",
      "Use `<Fragment key={id}>` when mapping lists of groups.",
    ],
    pitfall: "Adding wrapper divs inside `<tr>` or `<ul>`, which produces invalid HTML.",
    follow: ["Can the short `<>` syntax take a key?", "No. Import `Fragment` and write `<Fragment key={id}>` when you need a key."],
  },
  17: {
    steps: [
      "When rendering a list, give each item a stable unique `key` (usually its ID).",
      "On the next render React matches old and new children by key.",
      "Matched items keep their DOM nodes and state; new keys mount; missing keys unmount.",
      "Without keys React matches by position and may attach state to the wrong item.",
    ],
    pitfall: "Generating keys with `Math.random()` during render: every render remounts every item.",
    follow: ["Are keys visible as props?", "No. `key` is consumed by React; pass the ID again as a separate prop if the child needs it."],
  },
  18: {
    steps: [
      "Index keys are tied to position, not to the item.",
      "Insert, delete, sort or filter and an item's index changes.",
      "React then reuses the wrong component instance: input text or checkbox state jumps to another row.",
      "Use a stable ID from the data instead.",
    ],
    pitfall: "Believing index keys are always wrong. They are fine for static lists that never reorder and have no item state.",
    follow: ["The data has no ID. What now?", "Generate one when the item is created (e.g. `crypto.randomUUID()`) and store it with the item, never during render."],
  },
  19: {
    steps: [
      "Use `if` / early `return` for whole-component branches.",
      "Use the ternary `cond ? <A /> : <B />` inline in JSX.",
      "Use `cond && <A />` to render something or nothing.",
      "Return `null` to render nothing at all.",
    ],
    pitfall: "`{count && <Badge />}` renders `0` when count is 0. Write `{count > 0 && <Badge />}`.",
    follow: ["Does hiding with CSS differ from conditional rendering?", "Yes: CSS keeps the component mounted with its state; conditional rendering unmounts it and resets its state."],
  },
  20: {
    steps: [
      "Keep the data in an array.",
      "Call `array.map(item => <Row key={item.id} item={item} />)` inside JSX.",
      "Optionally `filter` or `sort` (on a copy) before mapping.",
      "React renders the returned array of elements in order.",
    ],
    pitfall: "Sorting state in place with `items.sort()` during render; it mutates state. Use `[...items].sort()` or `toSorted()`.",
    follow: ["How do you render a very long list?", "Virtualize it (react-window, TanStack Virtual) so only visible rows are in the DOM."],
  },
  21: {
    steps: [
      "Attach a handler with a camelCase prop: `onClick={handleClick}`.",
      "Pass the function itself, not its result (`onClick={save}`, not `onClick={save()}`).",
      "React calls it with an event object when the event happens.",
      "Inside, update state, call `e.preventDefault()` or `e.stopPropagation()` as needed.",
    ],
    pitfall: "`onClick={remove(id)}` runs on every render. Use `onClick={() => remove(id)}`.",
    follow: ["How do you pass an argument?", "Wrap it in an arrow function, or read it from a `data-` attribute on `e.currentTarget`."],
  },
  22: {
    steps: [
      "React wraps native browser events in a SyntheticEvent with the same interface everywhere.",
      "React attaches listeners at the root container, not on each element (delegation).",
      "When an event bubbles to the root React dispatches it to your handlers in tree order.",
      "`e.nativeEvent` gives the underlying browser event.",
    ],
    pitfall: "Relying on event pooling (`e.persist()`): pooling was removed in React 17, so events can be used asynchronously.",
    follow: ["Do portal events bubble?", "Yes, through the React tree: a click inside a portal reaches React ancestors even if the DOM node is elsewhere."],
  },
  23: {
    steps: [
      "Store the input value in state.",
      "Render `<input value={value} />` so the DOM always shows state.",
      "Update state in `onChange` with `e.target.value`.",
      "Validation, formatting and disabling submit can react on every keystroke.",
    ],
    pitfall: "Setting `value` without `onChange` makes the field read-only (React warns).",
    follow: ["How do controlled checkboxes differ?", "Use `checked` and `e.target.checked` instead of `value`."],
  },
  24: {
    steps: [
      "The DOM keeps the input's value, not React state.",
      "Give an initial value with `defaultValue` (or `defaultChecked`).",
      "Read the value when needed through a ref or `new FormData(form)` on submit.",
      "Fewer re-renders; good for simple forms and file inputs.",
    ],
    pitfall: "Switching an input between controlled and uncontrolled (value changes from `undefined` to a string). Initialise with `''`.",
    follow: ["Why is a file input always uncontrolled?", "Its value can only be set by the user for security, so you read `files` from the element."],
  },
  25: {
    steps: [
      "Controlled: React state is the single source of truth; the DOM mirrors it.",
      "Uncontrolled: the DOM is the source of truth; React reads it when needed.",
      "Controlled gives instant validation and dependent fields at the cost of a render per keystroke.",
      "Uncontrolled is simpler and pairs well with form actions and libraries like React Hook Form.",
    ],
    pitfall: "Using one style dogmatically. Mix them: controlled where the UI must react live, uncontrolled elsewhere.",
    follow: ["Which does React 19's `<form action>` favour?", "Uncontrolled: the action receives a FormData object built from the fields' current values."],
  },
  26: {
    steps: [
      "Two siblings need the same changing data.",
      "Move the state to their closest common parent.",
      "Pass the value down as props and a setter callback down to the one that changes it.",
      "Both children now render from one source of truth.",
    ],
    pitfall: "Keeping duplicate copies of the state in each child and trying to sync them with effects.",
    follow: ["When is lifting too far?", "When many intermediate components only pass props through; use composition or context instead."],
  },
  27: {
    steps: [
      "Data flows down: parent → child through props.",
      "Children cannot change parent data directly.",
      "To request a change, the child calls a function the parent passed down.",
      "The parent updates its state and the new data flows down again.",
    ],
    pitfall: "Comparing it with two-way binding and assuming forms need it; controlled inputs give the same result explicitly.",
    follow: ["Why is one-way flow easier to debug?", "Every value has one owner, so you can trace where a change came from by walking up the tree."],
  },
  28: {
    steps: [
      "Prop drilling: passing a prop through layers that don't use it, only to reach a deep child.",
      "First try composition: pass the deep child as `children` so intermediate layers don't see the data.",
      "For truly global values (theme, user, locale) use Context.",
      "For complex shared state use a store (Redux Toolkit, Zustand).",
    ],
    pitfall: "Putting everything in one giant context, which re-renders every consumer on any change.",
    follow: ["Is two levels of props drilling?", "Not really. Explicit props are clear; reach for context when many layers or many consumers are involved."],
  },
  29: {
    steps: [
      "In function components use default parameter values: `function Button({ size = 'md' })`.",
      "They apply when the prop is `undefined` (not when it is `null`).",
      "`defaultProps` on function components was removed in React 19.",
      "Class components can still use `static defaultProps`.",
    ],
    pitfall: "Expecting a default to apply for `null`; only `undefined` triggers it.",
    follow: ["How do you default an object prop without re-creating it?", "Define the default object as a module-level constant so its identity is stable."],
  },
  30: {
    steps: [
      "PropTypes is a runtime library that checks prop types in development.",
      "You declare `Component.propTypes = { name: PropTypes.string.isRequired }`.",
      "Mismatches log console warnings; production builds skip the checks.",
      "React 19 removed built-in propTypes checking; TypeScript is the modern replacement.",
    ],
    pitfall: "Treating PropTypes as validation of user input; it only warns developers in development.",
    follow: ["Why is TypeScript preferred?", "It catches errors at compile time, in the editor, for props, state and hooks, without runtime cost."],
  },
  31: {
    steps: [
      "Plain CSS files with `className`.",
      "CSS Modules for locally scoped class names.",
      "Utility classes (Tailwind) or CSS-in-JS (styled-components, Emotion).",
      "Inline `style={{ color: 'red' }}` objects for dynamic one-off values.",
    ],
    pitfall: "Using inline styles for everything: no media queries, pseudo-classes or caching.",
    follow: ["Why are inline style keys camelCase?", "They are JavaScript object properties mapped to DOM `style` properties, e.g. `backgroundColor`."],
  },
  32: {
    steps: [
      "Name a file `Button.module.css`.",
      "Import it: `import styles from './Button.module.css'`.",
      "Use `className={styles.primary}`; the build renames it to a unique class.",
      "Styles cannot leak into or collide with other components.",
    ],
    pitfall: "Using kebab-case class names and writing `styles.my-class`; use `styles['my-class']` or camelCase.",
    follow: ["How do you share variables between modules?", "Use CSS custom properties (variables) or `composes:` from another module."],
  },
  33: {
    steps: [
      "A component is a function (or class) that produces UI.",
      "An element is the plain object returned when you write `<Button />`.",
      "Elements are immutable descriptions; components are reused blueprints.",
      "React calls components to turn elements of that type into more elements.",
    ],
    pitfall: "Calling `<Button />` an instance. It is an element; instances live inside React's Fiber tree.",
    follow: ["What does an element look like?", "Roughly `{ type: Button, props: { ... }, key: null }`."],
  },
  34: {
    steps: [
      "Wrap the app in `<StrictMode>`.",
      "In development React renders components twice and runs effects setup → cleanup → setup.",
      "This reveals impure renders and missing effect cleanups.",
      "It also warns about deprecated APIs. Nothing changes in production.",
    ],
    pitfall: "Removing StrictMode to 'fix' a double fetch instead of adding proper cleanup.",
    follow: ["Why double-invoke effects?", "To simulate unmount and remount (like Fast Refresh or future offscreen features) and prove the effect cleans up correctly."],
  },
  35: {
    steps: [
      "`ReactDOM.render(el, node)` was the legacy root API, removed in React 19.",
      "`createRoot(node)` creates a concurrent root, then `root.render(el)`.",
      "Concurrent roots enable automatic batching, transitions and Suspense features.",
      "Use `hydrateRoot` for server-rendered HTML.",
    ],
    pitfall: "Upgrading to React 18/19 but keeping the old API and wondering why batching or transitions behave differently.",
    follow: ["How do you unmount a root?", "Call `root.unmount()`."],
  },
  36: {
    steps: [
      "A pure component renders the same output for the same props and state.",
      "`React.PureComponent` (classes) and `React.memo` (functions) skip re-rendering when props are shallowly equal.",
      "Shallow means comparing each prop with `Object.is`.",
      "New object or function props every render defeat the check.",
    ],
    pitfall: "Wrapping everything in memo; the comparison has a cost and often saves nothing.",
    follow: ["How do you keep memo effective?", "Pass stable values: primitives, memoized objects (`useMemo`) and callbacks (`useCallback`)."],
  },
  37: {
    steps: [
      "React may call your component many times, pause it, or discard the result.",
      "If rendering mutates outside data or performs side effects, those repeat unpredictably.",
      "Pure renders make concurrent rendering, StrictMode and caching safe.",
      "Put side effects in event handlers or effects instead.",
    ],
    pitfall: "Pushing to a module-level array or incrementing a global counter during render.",
    follow: ["Is local mutation allowed?", "Yes: mutating a variable you created during this render (e.g. building an array) is fine."],
  },
  38: {
    steps: [
      "React escapes every string you render, so `<b>` shows as text, preventing XSS.",
      "To inject HTML, pass `dangerouslySetInnerHTML={{ __html: html }}`.",
      "The name is a warning: React no longer protects you.",
      "Sanitize untrusted HTML first (e.g. DOMPurify).",
    ],
    pitfall: "Rendering user-supplied markdown or rich text without sanitizing it.",
    follow: ["Are `href` values safe?", "Not fully: `javascript:` URLs are a risk. React 19 blocks them, but validate URLs from users anyway."],
  },
  39: {
    steps: [
      "The parent defines a function, e.g. `handleSelect(id)`.",
      "It passes the function down: `<List onSelect={handleSelect} />`.",
      "The child calls `onSelect(item.id)` when something happens.",
      "The parent updates its state with the received data.",
    ],
    pitfall: "Trying to read child state from the parent via refs; lift the state instead.",
    follow: ["How do you name callback props?", "By convention `onSomething` for props and `handleSomething` for the implementation."],
  },
  40: {
    steps: [
      "Siblings cannot pass props directly.",
      "Lift the shared state to the common parent.",
      "Pass the value to one sibling and the setter to the other.",
      "For distant components use context or a store.",
    ],
    pitfall: "Using a global event bus to message between siblings; it hides the data flow.",
    follow: ["What if updates must be very frequent?", "Use a store with selectors (Zustand, Redux) so only components that read the changed slice re-render."],
  },
  41: {
    steps: [
      "JSX compiles lowercase tags to strings: `<div>` → `'div'`.",
      "Capitalised tags compile to variables: `<Card>` → `Card`.",
      "So a lowercase component name would be treated as an unknown HTML tag.",
      "Name components in PascalCase.",
    ],
    pitfall: "Storing a component in a lowercase variable and rendering `<comp />`; assign it to `const Comp = comp` first.",
    follow: ["How do you render `components[type]`?", "Assign it to a capitalised variable: `const Icon = icons[type]; return <Icon />`."],
  },
  42: {
    steps: [
      "Create a map from strings to components: `{ text: TextField, date: DatePicker }`.",
      "Look up the component: `const Field = fields[config.type]`.",
      "Render it with `<Field {...config.props} />`.",
      "Fall back to a default when the key is unknown.",
    ],
    pitfall: "Using `eval` or dynamic `import()` from untrusted strings; always map from a fixed allow-list.",
    follow: ["Where is this used?", "Config-driven UI: CMS layouts, form builders and dashboards where the server decides which widgets to show."],
  },
  43: {
    steps: [
      "`<Input {...props} />` passes every key in an object as a prop.",
      "Later props override earlier ones: `{...props} disabled` forces disabled.",
      "Combined with rest destructuring you can forward unknown props: `({ label, ...rest })`.",
      "This is common in wrapper components around native elements.",
    ],
    pitfall: "Spreading everything onto a DOM element, which leaks unknown props and triggers warnings.",
    follow: ["How do you merge classNames when spreading?", "Destructure `className` and combine it: `className={`btn ${className ?? ''}`}`."],
  },
  44: {
    steps: [
      "`react` holds the platform-independent core: components, Hooks, elements, context.",
      "`react-dom` renders that core to the browser DOM (createRoot, portals, form hooks).",
      "Other renderers (React Native, react-three-fiber) reuse the same core.",
      "`react-dom/server` renders to HTML strings or streams.",
    ],
    pitfall: "Importing Hooks from 'react-dom'; most Hooks live in 'react' (useFormStatus is the exception, in react-dom).",
    follow: ["Why split the packages?", "So one component model can target many platforms with different renderers."],
  },
  45: {
    steps: [
      "React solves one problem: building UI from components.",
      "It does not prescribe routing, data fetching, styling or build tooling.",
      "That makes it a library; frameworks like Next.js or React Router (framework mode) add the rest.",
      "In practice teams pick a framework or assemble a stack around React.",
    ],
    pitfall: "Answering with only one word; explain what React leaves to other tools.",
    follow: ["What does the React team recommend for new apps?", "Start with a framework (Next.js, React Router, Expo) or Vite when you need a custom setup."],
  },
  46: {
    steps: [
      "Advantages: component reuse, declarative UI, huge ecosystem, React Native for mobile.",
      "Advantages: strong tooling (DevTools, TypeScript) and a large hiring pool.",
      "Limitations: only the view layer, so many decisions and libraries to choose.",
      "Limitations: JSX and Hook rules have a learning curve; SEO needs SSR or SSG.",
    ],
    pitfall: "Listing 'fast' without nuance; performance depends on how you structure state and renders.",
    follow: ["How do frameworks address the limitations?", "They add routing, data loading, SSR/SSG and bundling conventions so you make fewer decisions."],
  },
  47: {
    steps: [
      "create-react-app (CRA) generated a Webpack-based setup with zero config.",
      "It became slow and unmaintained and was officially deprecated in 2025.",
      "Today: Vite for client-only apps, or a framework such as Next.js or React Router.",
      "These give faster dev servers, modern builds and routing or SSR options.",
    ],
    pitfall: "Starting new projects with CRA from old tutorials.",
    follow: ["Why is Vite's dev server fast?", "It serves native ES modules and pre-bundles dependencies with esbuild, so it doesn't bundle the whole app on start."],
  },
  48: {
    steps: [
      "Inside JSX children, use `{/* comment */}`.",
      "Inside a tag's attributes you can use `/* */` or `//` on its own line.",
      "Outside JSX, normal JavaScript comments work.",
      "HTML comments `<!-- -->` are not allowed.",
    ],
    pitfall: "Writing `// comment` directly between JSX tags; it renders as text.",
    follow: ["Do comments end up in the DOM?", "No. They are stripped during compilation."],
  },
  49: {
    steps: [
      "JSX compiles to one function call that returns one value.",
      "A function cannot return two values, so siblings need a parent.",
      "Use a Fragment `<>...</>` to group without extra DOM.",
      "Arrays of keyed elements are also valid return values.",
    ],
    pitfall: "Wrapping in a `<div>` and breaking table or flex layouts; use a Fragment.",
    follow: ["Can a component return a string or number?", "Yes, as well as `null`, booleans (render nothing) and arrays."],
  },
  50: {
    steps: [
      "Give each input a `name` matching a key in one state object.",
      "Write one handler: `setForm(f => ({ ...f, [e.target.name]: e.target.value }))`.",
      "Computed property names update just that field.",
      "Handle checkboxes with `type === 'checkbox' ? checked : value`.",
    ],
    pitfall: "Forgetting to spread the old state, which wipes the other fields.",
    follow: ["When does a library help?", "Large forms with validation, arrays of fields and many re-renders: React Hook Form or TanStack Form."],
  },
};
