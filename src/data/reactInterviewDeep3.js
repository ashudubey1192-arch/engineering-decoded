// Step-by-step explanations for interview questions 101-150.
export const deep3 = {
  101: {
    steps: [
      "Hooks only work inside function components and custom Hooks.",
      "Calling one in a class method throws 'Invalid hook call'.",
      "To reuse Hook logic in a class, wrap the class in a function component.",
      "That wrapper calls the Hook and passes results as props.",
    ],
    pitfall: "Converting a large class component wholesale just to use one Hook; a wrapper is often enough.",
    follow: ["Can a function component render a class component?", "Yes. They mix freely in the same tree."],
  },
  102: {
    steps: [
      "Mounting: constructor → getDerivedStateFromProps → render → componentDidMount.",
      "Updating: getDerivedStateFromProps → shouldComponentUpdate → render → getSnapshotBeforeUpdate → componentDidUpdate.",
      "Unmounting: componentWillUnmount.",
      "Errors: getDerivedStateFromError and componentDidCatch.",
    ],
    pitfall: "Putting side effects in render or the constructor; they belong in componentDidMount.",
    follow: ["Which phase methods must be pure?", "Render-phase methods: constructor, getDerivedStateFromProps, shouldComponentUpdate and render."],
  },
  103: {
    steps: [
      "Call `super(props)` first so `this.props` works.",
      "Initialise `this.state`.",
      "Bind handlers if not using class fields.",
      "No side effects or setState calls here.",
    ],
    pitfall: "Copying props into state in the constructor and expecting it to update later.",
    follow: ["Is a constructor required?", "No. Class fields (`state = {...}`, arrow methods) remove the need for one."],
  },
  104: {
    steps: [
      "Class methods are not automatically bound to the instance.",
      "Passing `this.handleClick` as a callback loses `this`, so it becomes undefined.",
      "Bind in the constructor, or define handlers as arrow-function class fields.",
      "Arrow fields capture `this` lexically.",
    ],
    pitfall: "Binding inside render (`onClick={this.f.bind(this)}`), which creates a new function every render.",
    follow: ["Why don't function components have this problem?", "They have no `this`; handlers close over props and state directly."],
  },
  105: {
    steps: [
      "`this.setState(partial)` merges the partial object into state (shallowly).",
      "Updates are batched and applied later.",
      "Use `this.setState(prev => ...)` when the new value depends on the old one.",
      "An optional second callback runs after the update is committed.",
    ],
    pitfall: "Reading `this.state` right after setState and expecting the new value.",
    follow: ["How does it differ from useState?", "useState replaces the value instead of merging; spread objects manually."],
  },
  106: {
    steps: [
      "It runs once after the component is first inserted into the DOM.",
      "Start subscriptions, timers and data fetches here.",
      "DOM measurements are safe because nodes exist.",
      "Remember to undo them in componentWillUnmount.",
    ],
    pitfall: "Fetching in the constructor or in render.",
    follow: ["What's the Hook equivalent?", "`useEffect(() => {...}, [])`, but thinking in synchronization is better."],
  },
  107: {
    steps: [
      "componentDidUpdate(prevProps, prevState) runs after each update commit.",
      "Use it to react to changes, e.g. refetch when an ID prop changes.",
      "Always compare: `if (prevProps.id !== this.props.id)`.",
      "Calling setState unconditionally causes an infinite loop.",
    ],
    pitfall: "Calling setState without a comparison guard.",
    follow: ["Does it run on mount?", "No. Only after updates; handle the initial case in componentDidMount."],
  },
  108: {
    steps: [
      "It runs just before the component is removed.",
      "Clear timers and intervals.",
      "Remove event listeners and unsubscribe.",
      "Abort pending requests to avoid updates on unmounted components.",
    ],
    pitfall: "Calling setState here; the component is going away and the update is ignored.",
    follow: ["Hook equivalent?", "The cleanup function returned from useEffect."],
  },
  109: {
    steps: [
      "`shouldComponentUpdate(nextProps, nextState)` returns true or false.",
      "Return false to skip render for that update.",
      "PureComponent implements it with a shallow comparison.",
      "Use it only for measured performance problems.",
    ],
    pitfall: "Returning false while some prop really changed, which leaves the UI out of date.",
    follow: ["What's the function-component equivalent?", "`React.memo(Component, arePropsEqual)`."],
  },
  110: {
    steps: [
      "A static method called before every render with props and state.",
      "Return an object to update state, or null for no change.",
      "Meant for rare cases where state depends on prop changes over time.",
      "Usually a `key` reset or a controlled component is better.",
    ],
    pitfall: "Using it to mirror props into state unconditionally, wiping local edits.",
    follow: ["Why is it static?", "So it can't access `this` or cause side effects; it must be pure."],
  },
  111: {
    steps: [
      "It runs right before DOM changes are applied.",
      "Read DOM info such as scroll position and return it.",
      "The returned value arrives as the third argument of componentDidUpdate.",
      "Use it to keep a chat scrolled correctly when items are added.",
    ],
    pitfall: "Using it without componentDidUpdate; the value is wasted.",
    follow: ["Hook alternative?", "useLayoutEffect, reading the DOM before paint, together with a ref."],
  },
  112: {
    steps: [
      "An error boundary is a class with `static getDerivedStateFromError` and/or `componentDidCatch`.",
      "When a descendant throws during render, React calls it.",
      "It renders fallback UI instead of crashing the whole app.",
      "`componentDidCatch` is where you log the error.",
    ],
    pitfall: "Expecting it to catch errors in event handlers, async code or itself.",
    follow: ["How to reset a boundary?", "Change its `key` or keep a reset state, e.g. on route change (react-error-boundary has resetKeys)."],
  },
  113: {
    steps: [
      "Event handlers: use try/catch inside the handler.",
      "Async code: catch promise rejections and store the error in state.",
      "Render the error state; or rethrow during render to reach a boundary.",
      "Report errors to a logging service.",
    ],
    pitfall: "Assuming error boundaries catch everything; they only catch render and lifecycle errors.",
    follow: ["How do you push an async error into a boundary?", "Store it and `throw` it during the next render, or call a `showBoundary` helper."],
  },
  114: {
    steps: [
      "`createRef()` makes a new ref object each time it's called.",
      "In classes you create it once in the constructor or a field.",
      "In function components, useRef returns the same object on every render.",
      "Calling createRef in a function component resets it every render.",
    ],
    pitfall: "Using createRef inside a function component.",
    follow: ["Are both objects with `current`?", "Yes; the difference is only persistence."],
  },
  115: {
    steps: [
      "componentWillMount, componentWillReceiveProps and componentWillUpdate are legacy.",
      "They were renamed with an `UNSAFE_` prefix in React 16.3.",
      "They encourage side effects in the render phase, unsafe for async rendering.",
      "Use componentDidMount, getDerivedStateFromProps and componentDidUpdate instead.",
    ],
    pitfall: "Adding `UNSAFE_` to silence warnings without refactoring.",
    follow: ["Does StrictMode warn about them?", "Yes, in development."],
  },
  116: {
    steps: [
      "`this.forceUpdate()` re-renders a class component, skipping shouldComponentUpdate.",
      "It is a workaround when render reads data React doesn't know about.",
      "Better: keep that data in state or use useSyncExternalStore.",
      "Function components fake it with a counter state.",
    ],
    pitfall: "Using it to hide mutated state.",
    follow: ["When is it legitimate?", "Bridging an external mutable object in legacy code, as a temporary measure."],
  },
  117: {
    steps: [
      "An HOC is a function taking a component and returning a new component.",
      "The wrapper adds behaviour or props (auth, data, theme).",
      "Example: `withAuth(Dashboard)`.",
      "Forward unknown props and set a displayName.",
    ],
    pitfall: "Creating the HOC inside render: a new component type every render remounts the subtree.",
    follow: ["Name a famous HOC.", "Redux's `connect` and React Router's old `withRouter`."],
  },
  118: {
    steps: [
      "Wrapper hell: many layers in DevTools.",
      "Prop collisions when two HOCs inject the same name.",
      "Implicit dependencies: hard to see where props come from.",
      "Static methods and refs need extra forwarding.",
    ],
    pitfall: "Composing five HOCs where one custom Hook would do.",
    follow: ["Do Hooks fix all of them?", "Most: values come from explicit Hook calls with clear names."],
  },
  119: {
    steps: [
      "A component receives a function prop (`render` or children).",
      "It calls that function with its internal data.",
      "The caller decides what to render with the data.",
      "Example: `<Mouse>{pos => <Cursor {...pos} />}</Mouse>`.",
    ],
    pitfall: "Inline render functions breaking memoization of the receiver.",
    follow: ["Where is it still used?", "Libraries like Formik, Downshift and some virtualization components."],
  },
  120: {
    steps: [
      "A parent component shares implicit state with child components through context.",
      "Users compose parts: `<Tabs><Tabs.List/><Tabs.Panel/></Tabs>`.",
      "Children read the shared state (active tab) without props.",
      "Gives flexible markup with a coordinated behaviour.",
    ],
    pitfall: "Rendering a child part outside its parent, where the context is missing; throw a helpful error.",
    follow: ["Examples in the wild?", "Radix UI, Headless UI and Reach UI use compound components."],
  },
  121: {
    steps: [
      "Containers handle data: fetching, state and logic.",
      "Presentational components only render props.",
      "This separates concerns and makes UI easy to test.",
      "Custom Hooks now often replace container components.",
    ],
    pitfall: "Applying it rigidly to every component, doubling files.",
    follow: ["Hook version?", "`const data = useOrders()` inside a component that otherwise only renders."],
  },
  122: {
    steps: [
      "Composition: build components by combining others and passing children or slots.",
      "Inheritance would create deep class hierarchies.",
      "Composition keeps components small and flexible.",
      "React's docs found no use case needing component inheritance.",
    ],
    pitfall: "Extending a base component class to share UI.",
    follow: ["How do you specialise a component?", "Render the generic one with specific props: `<Dialog title=\"Welcome\" />`."],
  },
  123: {
    steps: [
      "Context passes data through the tree without props.",
      "Create, provide a value and consume it with useContext.",
      "Good for theme, locale, auth user and configuration.",
      "Not a full state manager; combine with useReducer if needed.",
    ],
    pitfall: "Using context for fast-changing values read by many components.",
    follow: ["Can you nest providers?", "Yes. The nearest provider wins, useful for overriding a theme in one section."],
  },
  124: {
    steps: [
      "Every consumer re-renders when the context value changes.",
      "A new object value each render triggers that every time.",
      "Memoize the value with useMemo and split contexts by update frequency.",
      "For selective subscriptions use a store library.",
    ],
    pitfall: "One AppContext holding user, cart, theme and UI flags.",
    follow: ["Does React.memo stop context re-renders?", "No. Context bypasses memo for components that consume it."],
  },
  125: {
    steps: [
      "`createPortal(children, domNode)` renders into another DOM node.",
      "Used for modals, tooltips and toasts that must escape overflow or z-index.",
      "The portal stays in the React tree: context and events still flow normally.",
      "Add focus management and accessibility for modals.",
    ],
    pitfall: "Assuming events from the portal don't bubble to React parents; they do.",
    follow: ["Is a native `<dialog>` an alternative?", "Yes. It provides a top layer and focus behaviour, often with fewer portals."],
  },
  126: {
    steps: [
      "Wrap part of the UI in `<Suspense fallback={<Spinner />}>`.",
      "When a child suspends (lazy code, `use(promise)`, framework data), React shows the fallback.",
      "When it's ready React reveals the content.",
      "Nested boundaries give progressive loading.",
    ],
    pitfall: "Expecting Suspense to detect fetches started in useEffect; it doesn't.",
    follow: ["Why might a fallback not reappear on navigation?", "Updates wrapped in transitions keep the old UI visible instead of falling back."],
  },
  127: {
    steps: [
      "Use `const Page = lazy(() => import('./Page'))`.",
      "The bundler splits Page into its own chunk.",
      "Render it inside `<Suspense>`; the chunk downloads on first use.",
      "Split by route first, then heavy widgets.",
    ],
    pitfall: "Calling `lazy()` inside a component, which creates a new component each render.",
    follow: ["How do you preload a chunk?", "Call the same `import()` early, e.g. on hover."],
  },
  128: {
    steps: [
      "React can prepare multiple versions of the UI at once.",
      "Rendering is interruptible: urgent updates can jump ahead.",
      "Features using it: transitions, useDeferredValue and Suspense.",
      "It's opt-in per update; default updates remain synchronous.",
    ],
    pitfall: "Thinking concurrency means multithreading.",
    follow: ["Why must render be pure for concurrency?", "Interrupted renders are thrown away; side effects there would leak."],
  },
  129: {
    steps: [
      "The server sends ready HTML for a fast first view.",
      "JavaScript loads and `hydrateRoot` attaches React to that HTML.",
      "React builds its tree and adds event listeners without recreating the DOM.",
      "With Suspense, hydration can be selective and streamed.",
    ],
    pitfall: "Rendering different content on server and client (dates, random values), causing mismatch errors.",
    follow: ["How do you render client-only content?", "Render a placeholder first, then switch in an effect, or use a client-only boundary."],
  },
  130: {
    steps: [
      "CSR: browser downloads JS and renders everything.",
      "SSR: server renders HTML for each request.",
      "SSG: HTML is generated at build time.",
      "ISR: static pages regenerated in the background after a time or on demand.",
    ],
    pitfall: "Choosing SSR for everything, which adds server cost; static pages suit SSG.",
    follow: ["Which helps SEO most?", "Any approach that sends meaningful HTML: SSR, SSG or ISR."],
  },
  131: {
    steps: [
      "Server Components run only on the server (or at build time).",
      "They can read databases or files directly and send no JS for themselves.",
      "They render to a serialized format the client merges into the tree.",
      "Client Components (`'use client'`) handle interactivity.",
    ],
    pitfall: "Using state or effects in a Server Component; those need a Client Component.",
    follow: ["Can a Server Component import a Client one?", "Yes, and pass serializable props to it. Not the other way round, though one can be passed as children."],
  },
  132: {
    steps: [
      "SSR renders client components to HTML on the server, then hydrates them.",
      "RSC renders some components only on the server, shipping no JS for them.",
      "SSR improves first paint; RSC reduces bundle size and moves data access to the server.",
      "Frameworks use both together.",
    ],
    pitfall: "Treating them as the same thing.",
    follow: ["Do RSCs need SSR?", "No, but frameworks usually combine them for the initial HTML."],
  },
  133: {
    steps: [
      "Mark an async function with `'use server'`.",
      "Client code can call it, or pass it to `<form action>`.",
      "The framework turns the call into a network request.",
      "Validate input and authorize inside it; it's a public endpoint.",
    ],
    pitfall: "Trusting arguments from the client without validation.",
    follow: ["Do they work without JavaScript?", "Form actions can progressively enhance and submit before hydration."],
  },
  134: {
    steps: [
      "An Action is an async function used in a transition.",
      "Pass it to `<form action>`, startTransition or useActionState.",
      "React tracks pending state, errors and optimistic updates.",
      "Forms reset automatically after a successful action.",
    ],
    pitfall: "Manually managing isSubmitting state that Actions already provide.",
    follow: ["Which Hooks pair with Actions?", "useActionState, useFormStatus and useOptimistic."],
  },
  135: {
    steps: [
      "`ref` as a prop and ref cleanup functions.",
      "`<Context>` as a provider and the `use` API.",
      "Document metadata (`<title>`, `<meta>`) rendered from components.",
      "Stylesheet and script support, resource preloading and better hydration errors.",
    ],
    pitfall: "Forgetting removals: propTypes, defaultProps for functions, string refs and ReactDOM.render.",
    follow: ["How do you preload a font?", "`preload(href, { as: 'font' })` from react-dom."],
  },
  136: {
    steps: [
      "A build-time compiler (Babel plugin) that analyses components.",
      "It automatically memoizes values, callbacks and JSX.",
      "It reduces the need for manual useMemo, useCallback and memo.",
      "Code must follow the Rules of React for it to apply.",
    ],
    pitfall: "Thinking it's enabled by installing React 19; it needs separate setup.",
    follow: ["How do you adopt it gradually?", "Enable it for selected directories or use the `'use memo'` directive, and fix lint issues first."],
  },
  137: {
    steps: [
      "Effects re-run when reactive values change.",
      "Sometimes you need the latest value without re-running (e.g. a theme in a log).",
      "`useEffectEvent(fn)` creates a function that always sees the latest props and state.",
      "Call it from inside the effect; it's not a dependency.",
    ],
    pitfall: "Calling an effect event during render or passing it to children.",
    follow: ["Stable since?", "React 19.2 made useEffectEvent stable."],
  },
  138: {
    steps: [
      "`<Activity mode=\"visible\" | \"hidden\">` wraps part of the UI.",
      "Hidden content stays mounted with its state, but is hidden and its effects are cleaned up.",
      "React can pre-render hidden content at low priority.",
      "Use it for tabs or screens you'll likely return to.",
    ],
    pitfall: "Expecting hidden Activity content to keep running effects such as timers.",
    follow: ["Difference from conditional rendering?", "Conditional rendering unmounts and loses state; Activity preserves it."],
  },
  139: {
    steps: [
      "React attaches one listener per event type at the root container.",
      "A native event bubbles to the root.",
      "React builds the path of React handlers and calls capture then bubble handlers.",
      "`stopPropagation` stops it within React's tree.",
    ],
    pitfall: "Mixing native `document` listeners and React handlers and being surprised by ordering.",
    follow: ["How do you listen in the capture phase?", "Use `onClickCapture`."],
  },
  140: {
    steps: [
      "Web Components are browser-native custom elements with shadow DOM.",
      "React can render them like any tag: `<my-widget />`.",
      "React 19 passes props as properties when defined and supports custom events.",
      "They allow sharing components across frameworks.",
    ],
    pitfall: "Passing objects to custom elements in React 18, where they were set as string attributes.",
    follow: ["How do you listen to a custom event in React 19?", "`<my-widget onmyevent={handler} />` with the event name after `on`."],
  },
  141: {
    steps: [
      "Stateful components own and manage state.",
      "Stateless components only render props.",
      "Keep most components stateless and the state in few owners.",
      "Hooks blur the distinction, but the design principle remains.",
    ],
    pitfall: "Equating stateless with function components; function components can have state.",
    follow: ["Why prefer stateless components?", "They're predictable, reusable and easy to test."],
  },
  142: {
    steps: [
      "State belongs to a position in the UI tree, not to the component code.",
      "Same component at the same position: state is preserved.",
      "Different type at that position, or a different key: state is reset.",
      "Use keys to force resets deliberately.",
    ],
    pitfall: "Defining a component inside another, giving it a new type each render and resetting state.",
    follow: ["How do two `<Counter />` in a ternary behave?", "They share position, so state is preserved unless you give them different keys."],
  },
  143: {
    steps: [
      "Components and Hooks must be pure during render.",
      "React calls components and Hooks; you don't call them directly.",
      "Follow the Rules of Hooks.",
      "Props and state are immutable; don't mutate values after they are used in JSX.",
    ],
    pitfall: "Mutating props or reading a mutable global during render.",
    follow: ["Why do the rules matter more now?", "The React Compiler and concurrent features rely on them to optimise safely."],
  },
  144: {
    steps: [
      "Its own state changes.",
      "Its parent re-renders (by default all children render too).",
      "A context it consumes changes.",
      "A store it subscribes to (useSyncExternalStore) changes.",
    ],
    pitfall: "Believing props changing is the trigger; parent re-render is the trigger, props just carry the values.",
    follow: ["Does a re-render always change the DOM?", "No. If the output is the same, React commits nothing."],
  },
  145: {
    steps: [
      "`memo(Component)` returns a component that skips re-rendering when props are shallowly equal.",
      "React compares each prop with Object.is.",
      "Stable props (primitives, memoized objects or callbacks) keep it effective.",
      "Optionally pass a custom comparison function.",
    ],
    pitfall: "Passing inline objects or arrow functions to a memo component.",
    follow: ["Does memo stop state or context updates?", "No. A component's own state and consumed context still re-render it."],
  },
  146: {
    steps: [
      "Measure first: React Profiler, Lighthouse, Web Vitals.",
      "Reduce render work: move state down, memoize, virtualize long lists.",
      "Reduce JS: code splitting, lazy loading and tree shaking.",
      "Improve loading: SSR or SSG, image optimisation, caching data.",
    ],
    pitfall: "Optimising without measuring.",
    follow: ["What's the most common real issue?", "Too much state high in the tree causing large subtrees to re-render on every keystroke."],
  },
  147: {
    steps: [
      "Long lists put thousands of nodes into the DOM.",
      "Virtualization renders only rows visible in the viewport plus a buffer.",
      "As you scroll, rows are recycled with new data.",
      "Libraries: react-window, TanStack Virtual.",
    ],
    pitfall: "Breaking find-in-page and accessibility; offscreen rows aren't in the DOM.",
    follow: ["How do you handle variable row heights?", "Use dynamic measurement support in the library or estimated heights."],
  },
  148: {
    steps: [
      "Open React DevTools → Profiler and press record.",
      "Interact with the app, then stop.",
      "Inspect the flame chart: which components rendered, how long, and why.",
      "Fix the biggest offenders and record again.",
    ],
    pitfall: "Profiling development builds and reading absolute times as production numbers.",
    follow: ["How do you see why something rendered?", "Enable 'Record why each component rendered' in Profiler settings."],
  },
  149: {
    steps: [
      "Debounce: run after the user stops for a delay (search input).",
      "Throttle: run at most once per interval (scroll, resize).",
      "Keep the debounced or throttled function stable with useMemo or useRef.",
      "Cancel pending calls on unmount.",
    ],
    pitfall: "Creating a new debounced function every render, so it never actually debounces.",
    follow: ["React-native alternative to debouncing renders?", "useDeferredValue for rendering-heavy updates."],
  },
  150: {
    steps: [
      "A component defined inside another is a new function each render.",
      "React sees a new component type every time.",
      "It unmounts the old subtree and mounts a new one, losing state and focus.",
      "Define components at module level.",
    ],
    pitfall: "Inputs losing focus on every keystroke, a classic symptom.",
    follow: ["How do you pass inner data then?", "Through props to a top-level component."],
  },
};
