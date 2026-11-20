// Step-by-step explanations for interview questions 51-100 (mostly Hooks).
export const deep2 = {
  51: {
    steps: [
      "Hooks are functions starting with `use` that let function components use React features.",
      "`useState` adds memory, `useEffect` syncs with outside systems, `useContext` reads context.",
      "React stores each Hook's data on the component's Fiber in call order.",
      "Custom Hooks combine built-in Hooks to reuse stateful logic.",
    ],
    pitfall: "Thinking Hooks share state between components. Each component instance gets its own copy.",
    follow: ["What problem did Hooks solve?", "Reusing stateful logic without HOCs or render props, and grouping related logic instead of splitting it across lifecycle methods."],
  },
  52: {
    steps: [
      "Call Hooks only at the top level of a component or custom Hook.",
      "Never inside conditions, loops, nested functions or after an early return.",
      "React identifies each Hook by its call order on every render.",
      "eslint-plugin-react-hooks enforces both rules.",
    ],
    pitfall: "`if (user) useEffect(...)`: on a render where the condition flips, every later Hook reads the wrong slot.",
    follow: ["Is `use()` an exception?", "Yes. React 19's `use` can be called conditionally; it is still only allowed inside components or Hooks."],
  },
  53: {
    steps: [
      "`const [value, setValue] = useState(initial)` creates a state slot on first render.",
      "On later renders React returns the stored value, ignoring `initial`.",
      "`setValue(next)` queues an update and schedules a re-render.",
      "If `Object.is(next, current)` React may skip the re-render.",
    ],
    pitfall: "Reading the state right after setting it and expecting the new value; the variable keeps this render's snapshot.",
    follow: ["Is the setter identity stable?", "Yes. It never changes, so it is safe to omit from effect dependencies."],
  },
  54: {
    steps: [
      "Pass a function to the setter: `setCount(c => c + 1)`.",
      "React queues the function and calls it with the latest pending value.",
      "Several updater calls in one event apply one after another.",
      "Use it whenever the next value depends on the previous one.",
    ],
    pitfall: "Calling `setCount(count + 1)` three times expecting +3; all three read the same snapshot so the result is +1.",
    follow: ["Does it help with stale closures in intervals?", "Yes. `setCount(c => c + 1)` inside `setInterval` never needs `count` in the dependency list."],
  },
  55: {
    steps: [
      "Calling the setter does not change the variable immediately.",
      "React batches updates and re-renders after the event handler finishes.",
      "The new value appears in the next render.",
      "So it behaves asynchronously from your code's point of view, though it is not a Promise.",
    ],
    pitfall: "`await setState(x)`: setters return nothing, so awaiting them has no effect.",
    follow: ["How do you act after state updates?", "Compute the next value in a variable and use it directly, or react to it in an effect when you must sync with something external."],
  },
  56: {
    steps: [
      "`useState(expensive())` runs `expensive` on every render even though only the first result is used.",
      "Pass a function instead: `useState(() => expensive())`.",
      "React calls it only on the first render.",
      "Use it for parsing localStorage, building large structures and so on.",
    ],
    pitfall: "Writing `useState(expensive)` when `expensive` needs arguments; wrap it in an arrow.",
    follow: ["Does StrictMode affect it?", "In development the initializer may run twice; keep it pure."],
  },
  57: {
    steps: [
      "Several state updates in the same tick are grouped into one re-render.",
      "Since React 18 (createRoot) this also happens inside timeouts, promises and native handlers.",
      "Fewer renders means less work and no half-updated UI.",
      "`flushSync` forces an immediate render when you truly need it.",
    ],
    pitfall: "Expecting a render between two `setX` calls in the same handler.",
    follow: ["When is flushSync needed?", "Rarely: e.g. reading layout or scrolling right after adding an item, before the browser paints."],
  },
  58: {
    steps: [
      "React renders the component and commits the DOM.",
      "After paint, React runs the effect function.",
      "Before running it again (deps changed) or on unmount, React runs the previous cleanup.",
      "Effects synchronize the component with something outside React.",
    ],
    pitfall: "Using effects to compute values from props or state; do it during render instead.",
    follow: ["Why run after paint?", "So the browser can show the update first; effects shouldn't block visual updates (use useLayoutEffect if they must)."],
  },
  59: {
    steps: [
      "No array: the effect runs after every render.",
      "`[]`: it runs after mount only (cleanup on unmount).",
      "`[a, b]`: it re-runs when `a` or `b` changes, compared with `Object.is`.",
      "List every reactive value the effect reads; the lint rule checks this.",
    ],
    pitfall: "Leaving out dependencies to stop re-runs, which creates stale values and hidden bugs.",
    follow: ["How do you avoid an object dependency changing every render?", "Create the object inside the effect, or depend on its primitive fields."],
  },
  60: {
    steps: [
      "Return a function from the effect: the cleanup.",
      "React calls it before the next run and when the component unmounts.",
      "Use it to clear timers, remove listeners, abort requests and close sockets.",
      "This prevents leaks and updates arriving for old inputs.",
    ],
    pitfall: "Adding a listener without removing it: every re-run stacks another listener.",
    follow: ["Does cleanup see the old or new values?", "The old ones: it closes over the render that created it."],
  },
  61: {
    steps: [
      "Start the request in an effect that depends on the input (e.g. `id`).",
      "Track loading and error state alongside the data.",
      "In cleanup, abort the request or set an `ignore` flag so stale responses are dropped.",
      "In production use a data library or framework loader for caching and deduplication.",
    ],
    pitfall: "Race conditions: switching quickly from id 1 to 2 and letting the slower response for 1 overwrite the data.",
    follow: ["Why not fetch in render?", "Render must be pure and may run many times; fetching there would fire repeated requests."],
  },
  62: {
    steps: [
      "An `async` function always returns a Promise.",
      "React expects an effect to return nothing or a cleanup function.",
      "So define an async function inside the effect and call it.",
      "Handle errors and cancellation inside that function.",
    ],
    pitfall: "`useEffect(async () => {...})`: React receives a Promise as the cleanup and warns.",
    follow: ["How do you cancel an async effect?", "Use an AbortController and call `abort()` in the cleanup."],
  },
  63: {
    steps: [
      "`useEffect` runs after the browser paints.",
      "`useLayoutEffect` runs after DOM mutation but before paint, blocking it.",
      "Use layout effects to measure DOM and adjust (tooltips, scroll positions) without flicker.",
      "Default to useEffect; layout effects hurt performance if overused.",
    ],
    pitfall: "Using useLayoutEffect for data fetching; it delays paint for no benefit.",
    follow: ["What happens on the server?", "Neither runs during SSR; useLayoutEffect logs a warning in older versions, so guard layout-only code."],
  },
  64: {
    steps: [
      "`useInsertionEffect` runs before any layout effects, before DOM reads.",
      "It is meant for CSS-in-JS libraries to inject `<style>` tags.",
      "Injecting styles before layout prevents expensive recalculation.",
      "Application code should almost never use it.",
    ],
    pitfall: "Trying to update state from it; you can't read refs or schedule updates there.",
    follow: ["Why not useLayoutEffect for styles?", "Layout effects of other components may already read layout; inserting styles then forces extra recalculation."],
  },
  65: {
    steps: [
      "`useRef(initial)` returns an object `{ current }` that lives for the component's lifetime.",
      "Changing `ref.current` does not trigger a re-render.",
      "Attach it to JSX (`ref={inputRef}`) to get the DOM node.",
      "Also use it for timer IDs, previous values or any mutable instance data.",
    ],
    pitfall: "Reading or writing `ref.current` during render for values that affect output; the UI won't update.",
    follow: ["When is `inputRef.current` set?", "After commit. It is null during the first render and available in effects and handlers."],
  },
  66: {
    steps: [
      "Both persist across renders.",
      "Setting state re-renders; mutating a ref does not.",
      "State values are snapshots per render; refs are one mutable box.",
      "Use state for what the screen shows, refs for behind-the-scenes data.",
    ],
    pitfall: "Storing a counter that is displayed in a ref; the display never updates.",
    follow: ["Why might a ref fix a stale closure?", "An interval callback can read `ref.current` to see the latest value without re-subscribing."],
  },
  67: {
    steps: [
      "Create a ref: `const prev = useRef()`.",
      "In an effect after render, store the current value: `prev.current = value`.",
      "During the next render, `prev.current` still holds the old value.",
      "Alternatively store the previous value in state and compare during render.",
    ],
    pitfall: "Assigning `prev.current = value` during render; StrictMode or concurrent renders make it unreliable.",
    follow: ["What's the render-time alternative?", "Keep `[prevValue, setPrevValue]` and when `value !== prevValue`, call `setPrevValue(value)` while rendering; React re-renders immediately."],
  },
  68: {
    steps: [
      "Before React 19, function components needed `forwardRef` to receive a `ref`.",
      "`forwardRef((props, ref) => <input ref={ref} />)` passed it through.",
      "In React 19, `ref` is a normal prop for function components.",
      "`forwardRef` still works but will be deprecated.",
    ],
    pitfall: "Passing `ref` to a function component in React 18 without forwardRef: it is silently dropped.",
    follow: ["Can ref callbacks return cleanup now?", "Yes. React 19 ref callbacks may return a cleanup function, called when the element detaches."],
  },
  69: {
    steps: [
      "A parent holds a ref to a child component.",
      "In the child, `useImperativeHandle(ref, () => ({ focus, reset }))` defines what the ref exposes.",
      "The parent calls `ref.current.focus()` without seeing the raw DOM node.",
      "This keeps the child's internals private.",
    ],
    pitfall: "Using imperative handles for things props could do, e.g. `open()` instead of an `isOpen` prop.",
    follow: ["When is it justified?", "Focus, scroll, play/pause media and similar imperative browser actions."],
  },
  70: {
    steps: [
      "Pass a function as `ref`: `ref={node => { ... }}`.",
      "React calls it with the DOM node on attach and (before React 19) with `null` on detach.",
      "Useful for measuring nodes or refs in a dynamic list.",
      "In React 19 the callback can return a cleanup function.",
    ],
    pitfall: "Defining the callback inline without memoization when it does expensive work; it is called again on every render.",
    follow: ["How do you keep refs for many list items?", "Store them in a Map keyed by ID inside one ref, populated by a callback ref."],
  },
  71: {
    steps: [
      "Create a context: `const ThemeContext = createContext('light')`.",
      "Wrap a subtree with `<ThemeContext value={theme}>` (React 19) or `.Provider`.",
      "Any descendant reads it with `useContext(ThemeContext)`.",
      "When the value changes, every consumer re-renders.",
    ],
    pitfall: "Passing a new object literal as the value each render, so all consumers re-render needlessly.",
    follow: ["What if there's no provider?", "useContext returns the default value passed to createContext."],
  },
  72: {
    steps: [
      "Write a reducer: `(state, action) => newState`, pure and immutable.",
      "`const [state, dispatch] = useReducer(reducer, initial)`.",
      "Components dispatch actions like `{ type: 'added', item }`.",
      "Prefer it when many related values change together or the logic gets complex.",
    ],
    pitfall: "Mutating the state inside the reducer instead of returning a new object.",
    follow: ["Is dispatch stable?", "Yes, its identity never changes, which makes it great to pass through context."],
  },
  73: {
    steps: [
      "Hold state with `useReducer` in a provider component.",
      "Put `state` in one context and `dispatch` in another.",
      "Components read the state context or dispatch actions anywhere below.",
      "Splitting the contexts means dispatch-only components never re-render on state changes.",
    ],
    pitfall: "Putting both in one `{state, dispatch}` object created each render.",
    follow: ["When should you switch to Redux or Zustand?", "When you need selectors, devtools, middleware or very frequent updates across many components."],
  },
  74: {
    steps: [
      "`useMemo(() => compute(a, b), [a, b])` caches a computed value.",
      "On re-render React reuses the cached value if the deps are unchanged.",
      "Use it for expensive calculations or to keep object identity stable for memo children.",
      "It is a performance hint; code must work without it.",
    ],
    pitfall: "Memoizing trivial calculations; the dependency check costs more than the work.",
    follow: ["Is the cache guaranteed?", "No. React may discard it (e.g. offscreen), so never rely on it for correctness."],
  },
  75: {
    steps: [
      "Functions defined in a component are new on every render.",
      "`useCallback(fn, deps)` returns the same function until deps change.",
      "That keeps `React.memo` children from re-rendering and effects from re-running.",
      "It's equivalent to `useMemo(() => fn, deps)`.",
    ],
    pitfall: "Wrapping callbacks passed to plain DOM elements; nothing benefits.",
    follow: ["Does React Compiler change this?", "Yes. It memoizes automatically, so manual useCallback becomes rarely necessary."],
  },
  76: {
    steps: [
      "useMemo caches the result of calling a function.",
      "useCallback caches the function itself.",
      "`useCallback(fn, d)` equals `useMemo(() => fn, d)`.",
      "Choose by what you need to keep stable: a value or a callback.",
    ],
    pitfall: "Using useMemo to 'memoize a function' and accidentally calling it.",
    follow: ["Which one avoids recomputation?", "useMemo. useCallback doesn't prevent work; it only preserves identity."],
  },
  77: {
    steps: [
      "Skip them for cheap calculations and simple components.",
      "Skip them when the result goes to elements that are not memoized.",
      "Skip them when deps change every render anyway.",
      "Measure with the Profiler first; add memoization where it removes real work.",
    ],
    pitfall: "Memoizing everything 'just in case', making code harder to read with no gain.",
    follow: ["What should you try before memoizing?", "Move state down, lift content up as children, and avoid creating components inside components."],
  },
  78: {
    steps: [
      "A custom Hook is a function named `useSomething` that calls other Hooks.",
      "It extracts reusable stateful logic (fetching, subscriptions, forms).",
      "Each component calling it gets its own independent state.",
      "Return whatever the caller needs: values, setters, status.",
    ],
    pitfall: "Expecting two components using the same custom Hook to share state; they don't.",
    follow: ["Must it start with `use`?", "Yes. The name tells React and the linter that Hook rules apply."],
  },
  79: {
    steps: [
      "Keep data, error and loading state.",
      "Start fetching in an effect that depends on the URL.",
      "Abort in the cleanup so stale responses are ignored.",
      "Return `{ data, error, loading }` to the caller.",
    ],
    pitfall: "Forgetting to reset loading or error when the URL changes, showing old data as if it were new.",
    follow: ["What would you add for production?", "Caching, deduplication, retries and revalidation, which is why teams adopt TanStack Query or SWR."],
  },
  80: {
    steps: [
      "Keep a `debounced` state copy of the value.",
      "In an effect, start a timer that sets `debounced` after the delay.",
      "The cleanup clears the timer whenever the value changes first.",
      "So `debounced` updates only after the user pauses typing.",
    ],
    pitfall: "Debouncing the input's own state, which makes typing feel laggy; debounce only the derived query.",
    follow: ["Debounce vs useDeferredValue?", "Debounce waits a fixed time; useDeferredValue renders the new value as soon as React has time, without a timer."],
  },
  81: {
    steps: [
      "useToggle: `useState(false)` plus a stable `toggle = useCallback(() => setOn(v => !v), [])`.",
      "useOnClickOutside: accept a ref and a handler.",
      "In an effect, listen for `pointerdown` on `document` and call the handler when `!ref.current.contains(e.target)`.",
      "Remove the listener in the cleanup.",
    ],
    pitfall: "Listening to `click` and having the opening click instantly close the menu.",
    follow: ["How do you avoid re-subscribing when the handler changes?", "Store the latest handler in a ref (or use useEffectEvent) and subscribe once."],
  },
  82: {
    steps: [
      "`useId()` returns a unique string ID stable across renders.",
      "It matches between server and client, avoiding hydration mismatches.",
      "Use it to link labels and inputs or aria-describedby.",
      "Append suffixes for several related IDs: `${id}-hint`.",
    ],
    pitfall: "Using useId for list keys; keys must come from data.",
    follow: ["Why not Math.random()?", "Server and client would generate different values, breaking hydration."],
  },
  83: {
    steps: [
      "`const [isPending, startTransition] = useTransition()`.",
      "Wrap a non-urgent state update: `startTransition(() => setTab(next))`.",
      "React keeps the current UI interactive and renders the new one in the background.",
      "`isPending` lets you show a subtle loading hint.",
    ],
    pitfall: "Wrapping a controlled input's own value in a transition; input updates must stay urgent.",
    follow: ["Can transitions be async in React 19?", "Yes. Async functions passed to startTransition become Actions, and isPending stays true until they finish."],
  },
  84: {
    steps: [
      "`const deferred = useDeferredValue(value)`.",
      "On an urgent update, React first re-renders with the old deferred value.",
      "Then it renders again in the background with the new value.",
      "Pair it with memoized slow children so the input stays responsive.",
    ],
    pitfall: "Expecting it to delay network requests; it only defers rendering.",
    follow: ["How do you show stale content?", "Compare `value !== deferred` and dim the results while they catch up."],
  },
  85: {
    steps: [
      "useTransition wraps the code that sets state.",
      "useDeferredValue wraps a value you receive (often a prop).",
      "Both mark work as non-urgent and interruptible.",
      "Use useDeferredValue when you don't control the setter.",
    ],
    pitfall: "Using both for the same update; one is enough.",
    follow: ["Which gives an isPending flag?", "useTransition. For deferred values compare the value with its deferred copy."],
  },
  86: {
    steps: [
      "Use it to read from an external store (browser API, Redux, custom store).",
      "Provide `subscribe(callback)` and `getSnapshot()`.",
      "React re-renders when the snapshot changes and avoids tearing in concurrent rendering.",
      "Optionally provide `getServerSnapshot` for SSR.",
    ],
    pitfall: "Returning a new object from getSnapshot every call, which causes infinite re-renders.",
    follow: ["Give a browser example.", "Online status: subscribe to `online`/`offline` events and return `navigator.onLine`."],
  },
  87: {
    steps: [
      "`use(promise)` suspends until the promise resolves, then returns its value.",
      "`use(Context)` reads context, even inside conditions.",
      "Wrap suspending components in `<Suspense>` and errors in an error boundary.",
      "Promises should come from a cache or the server, not be created in render.",
    ],
    pitfall: "`use(fetch(url))` inside the component: a new promise every render, causing an endless suspend loop.",
    follow: ["Can you use `use` in a loop?", "Yes, unlike other Hooks, but only inside a component or Hook."],
  },
  88: {
    steps: [
      "`const [state, formAction, isPending] = useActionState(action, initial)`.",
      "Pass `formAction` to `<form action>` or a button's `formAction`.",
      "On submit React calls `action(previousState, formData)`.",
      "Its return value becomes the new state (e.g. errors or a success message).",
    ],
    pitfall: "Forgetting the first argument is the previous state, not the form data.",
    follow: ["What did it replace?", "The Canary `useFormState` from react-dom, renamed and moved to 'react'."],
  },
  89: {
    steps: [
      "Import `useFormStatus` from 'react-dom'.",
      "Call it in a component rendered inside a `<form>`.",
      "It returns `{ pending, data, method, action }` for the parent form's submission.",
      "Use it for submit buttons that disable themselves while pending.",
    ],
    pitfall: "Calling it in the same component that renders the form; it only reads a parent form.",
    follow: ["Why a separate Hook?", "So reusable design-system buttons can know the form state without prop drilling."],
  },
  90: {
    steps: [
      "`const [optimistic, addOptimistic] = useOptimistic(state, updateFn)`.",
      "Inside an Action, call `addOptimistic(newItem)` before the request finishes.",
      "The UI shows the optimistic value immediately.",
      "When the Action settles, React switches back to the real state, reverting on failure.",
    ],
    pitfall: "Calling addOptimistic outside a transition or Action; React warns and it reverts immediately.",
    follow: ["Where is it useful?", "Likes, chat messages and todo additions, where success is very likely."],
  },
  91: {
    steps: [
      "Call `useDebugValue(value)` inside a custom Hook.",
      "React DevTools shows the label next to the Hook.",
      "Pass a formatter as a second argument for expensive formatting.",
      "It has no effect on the app itself.",
    ],
    pitfall: "Adding it to every Hook; it's for shared library Hooks where inspection helps.",
    follow: ["When does the formatter run?", "Only when the component is inspected in DevTools."],
  },
  92: {
    steps: [
      "Every render creates new functions that capture that render's values.",
      "A callback kept from an old render (interval, listener, effect with missing deps) sees old values.",
      "Example: `setInterval(() => setCount(count + 1))` with `[]` deps sticks at 1.",
      "Fix with correct deps, updater functions, refs or useEffectEvent.",
    ],
    pitfall: "Silencing the exhaustive-deps lint rule, the usual source of stale closures.",
    follow: ["Why is it called a closure?", "The function closes over the variables in scope when it was created; it doesn't see later renders' variables."],
  },
  93: {
    steps: [
      "Mount: `useEffect(() => {...}, [])`.",
      "Update: `useEffect(() => {...}, [dep])` runs after renders where dep changed.",
      "Unmount: return a cleanup from the effect.",
      "Think in synchronization, not lifecycles: each effect keeps one thing in sync.",
    ],
    pitfall: "Putting all logic in one big `[]` effect like componentDidMount.",
    follow: ["How do you skip the mount run for 'update only'?", "Track a ref flag, but first ask whether the logic belongs in an event handler."],
  },
  94: {
    steps: [
      "In development, StrictMode mounts, unmounts and re-mounts every component.",
      "So effects run setup → cleanup → setup.",
      "This exposes effects without proper cleanup.",
      "Production runs them once.",
    ],
    pitfall: "Using a 'didRun' ref to block the second run instead of writing a correct cleanup.",
    follow: ["What about data fetching duplicates?", "Abort or ignore the first request in cleanup, or use a caching library that deduplicates."],
  },
  95: {
    steps: [
      "An effect that sets state it also depends on triggers itself forever.",
      "Objects or functions created during render change every time, re-running the effect.",
      "Fix: derive values in render, move objects into the effect, or memoize them.",
      "Use updater functions so the state isn't a dependency.",
    ],
    pitfall: "`useEffect(() => setData({...}), [data])`: a new object every run equals an infinite loop.",
    follow: ["How do you spot it quickly?", "React logs 'Maximum update depth exceeded'; the Profiler shows repeated commits."],
  },
  96: {
    steps: [
      "Effects are for syncing with external systems.",
      "Derived data: compute it during render (with useMemo if expensive).",
      "User actions: handle them in event handlers, not effects that watch state.",
      "Resetting state on prop change: use a `key`.",
    ],
    pitfall: "Chains of effects that set state that triggers other effects.",
    follow: ["Give one valid effect use.", "Subscribing to a WebSocket, a browser API or a third-party widget."],
  },
  97: {
    steps: [
      "Separate variables for unrelated values that change independently.",
      "One object for values that always change together (e.g. x and y).",
      "Objects need spreading on every update.",
      "For complex related updates prefer useReducer.",
    ],
    pitfall: "Replacing a state object with only one field: `setForm({ name })` drops the rest.",
    follow: ["Does splitting state improve performance?", "Slightly, but the main benefit is clarity and simpler updates."],
  },
  98: {
    steps: [
      "Copy every level you change: `{ ...user, address: { ...user.address, city } }`.",
      "Arrays: add with `[...a, x]`, remove with `filter`, update with `map`.",
      "Never use push, splice or direct assignment on state.",
      "For deep structures use Immer (`produce`) or normalize the data.",
    ],
    pitfall: "Shallow copying only the top level and mutating nested objects, which are still shared.",
    follow: ["Why does immutability matter for memo?", "New references signal changes; mutation keeps the same reference and hides the change."],
  },
  99: {
    steps: [
      "Higher-order components wrap a component and inject props.",
      "Render props pass a function child that receives data.",
      "Both work, but add wrapper layers and prop-name collisions.",
      "Custom Hooks share the same logic with no extra components.",
    ],
    pitfall: "Saying HOCs are obsolete; they are still used for cross-cutting concerns in some libraries.",
    follow: ["Which pattern shares UI rather than logic?", "Composition with children and slot props."],
  },
  100: {
    steps: [
      "Give the component a `key` that changes when it should reset: `<Form key={userId} />`.",
      "A new key unmounts the old instance and mounts a fresh one.",
      "All state inside resets to initial values.",
      "Alternatively call setters to reset specific fields.",
    ],
    pitfall: "Resetting with an effect that watches the prop, which first renders stale state.",
    follow: ["Does rendering the same component in another position reset it?", "Yes. State is tied to position in the tree and component type."],
  },
};
