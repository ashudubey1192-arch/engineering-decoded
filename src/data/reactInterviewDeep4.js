// Step-by-step explanations for interview questions 151-200.
export const deep4 = {
  151: {
    steps: [
      "Inline `() => {}` or `{}` in JSX creates a new value every render.",
      "For plain DOM elements this costs almost nothing.",
      "For `memo` children it breaks the shallow comparison, forcing re-renders.",
      "Stabilise only those props with useCallback or useMemo.",
    ],
    pitfall: "Banning all inline functions; it hurts readability for no gain.",
    follow: ["Does React Compiler handle this?", "Yes. It memoizes inline values automatically."],
  },
  152: {
    steps: [
      "Add `loading=\"lazy\"` to `<img>` for native lazy loading.",
      "Set width and height (or aspect-ratio) to avoid layout shift.",
      "For custom behaviour, use IntersectionObserver in an effect.",
      "Serve responsive sizes with srcset and modern formats.",
    ],
    pitfall: "Lazy-loading the hero image above the fold, which delays LCP.",
    follow: ["How do you prioritise the hero image?", "`fetchPriority=\"high\"` and no lazy loading."],
  },
  153: {
    steps: [
      "LCP: how fast the main content appears.",
      "INP: how quickly the page responds to interactions.",
      "CLS: how much the layout shifts unexpectedly.",
      "React affects them via bundle size, render work, transitions and placeholders.",
    ],
    pitfall: "Still quoting FID; INP replaced it in 2024.",
    follow: ["How do you measure in production?", "With the `web-vitals` library sending metrics to analytics."],
  },
  154: {
    steps: [
      "React Router maps URLs to components.",
      "Navigation changes the URL with the History API without a page reload.",
      "Matching routes render, including nested layouts via Outlet.",
      "Framework mode adds loaders, actions and SSR.",
    ],
    pitfall: "Using `<a href>` for internal links, which reloads the whole app.",
    follow: ["What's the latest major version?", "React Router v7, which merged in Remix's framework features."],
  },
  155: {
    steps: [
      "`<a>` makes a full page request.",
      "`<Link>` changes the route client-side, keeping app state.",
      "`<NavLink>` is a Link that knows if it's active (for styling and aria-current).",
      "Use plain `<a>` only for external sites.",
    ],
    pitfall: "Styling the active menu item manually instead of using NavLink.",
    follow: ["How does NavLink expose state?", "className and style can be functions receiving `{ isActive, isPending }`."],
  },
  156: {
    steps: [
      "Define a dynamic segment: `path=\"/users/:id\"`.",
      "Read it with `const { id } = useParams()`.",
      "Read query strings with `const [params, setParams] = useSearchParams()`.",
      "Values are strings; convert and validate them.",
    ],
    pitfall: "Storing URL-derived data in separate state and letting it drift from the URL.",
    follow: ["Why keep filters in the URL?", "They become shareable, bookmarkable and survive refresh."],
  },
  157: {
    steps: [
      "`const navigate = useNavigate()`.",
      "Call `navigate('/dashboard')` after an action such as login.",
      "`navigate(-1)` goes back; `{ replace: true }` replaces history.",
      "In loaders and actions, return `redirect('/path')` instead.",
    ],
    pitfall: "Calling navigate during render; do it in handlers or effects.",
    follow: ["What does replace help with?", "Prevents the user going back to a login page after logging in."],
  },
  158: {
    steps: [
      "Define child routes inside a parent route.",
      "The parent renders shared layout plus `<Outlet />`.",
      "The matched child renders into the Outlet.",
      "Index routes render at the parent's exact path.",
    ],
    pitfall: "Forgetting the Outlet, so child routes match but never appear.",
    follow: ["How do you share data with children?", "`<Outlet context={value} />` and `useOutletContext()`."],
  },
  159: {
    steps: [
      "Create a wrapper that checks authentication.",
      "If not logged in, render `<Navigate to=\"/login\" replace state={{ from: location }} />`.",
      "Otherwise render the children or Outlet.",
      "Still enforce authorization on the server.",
    ],
    pitfall: "Treating the client guard as security; the API must check permissions.",
    follow: ["How do you return the user after login?", "Read `location.state.from` and navigate there."],
  },
  160: {
    steps: [
      "A loader fetches data for a route before it renders.",
      "Components read it with `useLoaderData()`.",
      "An action handles form submissions (POST, PUT, DELETE) for that route.",
      "After an action, loaders revalidate so the UI shows fresh data.",
    ],
    pitfall: "Duplicating fetches in useEffect when a loader already provides the data.",
    follow: ["How do you submit to an action?", "With `<Form method=\"post\">` or `useFetcher()`."],
  },
  161: {
    steps: [
      "BrowserRouter uses clean URLs (`/about`) with the History API.",
      "It needs the server to return index.html for every route.",
      "HashRouter uses `/#/about`; the server only ever sees `/`.",
      "Prefer BrowserRouter; use HashRouter only for static hosts you can't configure.",
    ],
    pitfall: "Getting 404 on refresh with BrowserRouter because the server has no fallback rule.",
    follow: ["Which is better for SEO?", "BrowserRouter. Hash fragments aren't sent to servers."],
  },
  162: {
    steps: [
      "One store holds the app's global state.",
      "State is read-only; changes happen by dispatching actions.",
      "Pure reducers compute the next state from state and action.",
      "Redux Toolkit is the standard way to write it today.",
    ],
    pitfall: "Writing hand-made action types and switch statements instead of Redux Toolkit slices.",
    follow: ["Why pure reducers?", "Predictable updates, time-travel debugging and easy testing."],
  },
  163: {
    steps: [
      "Wrap the app in `<Provider store={store}>`.",
      "Read data with `useSelector(state => state.cart.items)`.",
      "Dispatch with `const dispatch = useDispatch()`.",
      "Components re-render only when their selected value changes.",
    ],
    pitfall: "Selecting a new object each time (`state => ({...})`), causing re-renders on every update.",
    follow: ["What was used before Hooks?", "`connect(mapStateToProps, mapDispatchToProps)`."],
  },
  164: {
    steps: [
      "The UI dispatches an action describing what happened.",
      "Middleware (thunks, logging) may intercept it.",
      "Reducers compute the new state.",
      "Subscribed components with changed selections re-render.",
    ],
    pitfall: "Putting async calls or side effects inside reducers.",
    follow: ["Where do side effects go?", "In thunks, listener middleware or RTK Query."],
  },
  165: {
    steps: [
      "Middleware sits between dispatch and the reducer.",
      "It can log, delay, transform or dispatch more actions.",
      "A thunk is a function action receiving `(dispatch, getState)`.",
      "`createAsyncThunk` dispatches pending, fulfilled and rejected actions automatically.",
    ],
    pitfall: "Forgetting to handle the rejected case in extraReducers.",
    follow: ["Is thunk middleware included in RTK?", "Yes, configureStore adds it by default."],
  },
  166: {
    steps: [
      "RTK Query is Redux Toolkit's data fetching and caching layer.",
      "Define endpoints once with createApi.",
      "It generates Hooks like `useGetPostsQuery()` with loading and error state.",
      "It caches, deduplicates and invalidates by tags after mutations.",
    ],
    pitfall: "Copying RTK Query results into a separate slice.",
    follow: ["How do mutations refresh lists?", "Mutations invalidate tags that the list query provides, triggering a refetch."],
  },
  167: {
    steps: [
      "Context: built in, good for low-frequency global values.",
      "Redux: a predictable store with devtools, middleware and selectors.",
      "Context re-renders all consumers; Redux re-renders only matching selectors.",
      "Choose Redux (or Zustand) for complex, frequently updated shared state.",
    ],
    pitfall: "Calling Context a state manager; it's a transport for values.",
    follow: ["Can they be combined?", "Yes. Redux itself uses context to provide the store."],
  },
  168: {
    steps: [
      "Zustand is a small store library built on Hooks.",
      "`create(set => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) }))`.",
      "Components select slices: `useStore(s => s.count)`.",
      "No provider is needed; it's minimal boilerplate.",
    ],
    pitfall: "Selecting the whole store object, which re-renders on every change.",
    follow: ["How does it avoid tearing?", "It uses useSyncExternalStore internally."],
  },
  169: {
    steps: [
      "Client state: UI-only data (modals, form inputs, theme).",
      "Server state: data owned by the backend, which can be stale and shared.",
      "Server state needs caching, refetching and invalidation.",
      "Use TanStack Query or RTK Query for it and React state or a store for client state.",
    ],
    pitfall: "Storing API data in Redux by hand and reinventing caching.",
    follow: ["What is stale-while-revalidate?", "Show cached data immediately and refetch in the background."],
  },
  170: {
    steps: [
      "Derived state is anything computable from existing props or state.",
      "Compute it during render: `const total = items.reduce(...)`.",
      "Duplicating it in state requires syncing and creates bugs.",
      "Use useMemo if the computation is expensive.",
    ],
    pitfall: "`useEffect(() => setFiltered(items.filter(...)), [items])`.",
    follow: ["Example of truly needed state?", "User input such as the search text; the filtered list is derived from it."],
  },
  171: {
    steps: [
      "Validate on submit, and optionally on blur or change.",
      "Store errors per field and show them next to inputs.",
      "Link errors with aria-describedby and set aria-invalid.",
      "Use schemas (Zod, Yup) with React Hook Form for bigger forms; always revalidate on the server.",
    ],
    pitfall: "Showing errors while the user is still typing the first character.",
    follow: ["What about native validation?", "`required`, `pattern` and `type=\"email\"` give free browser validation."],
  },
  172: {
    steps: [
      "Use Vitest or Jest with React Testing Library.",
      "Render the component and query it like a user would (by role or label).",
      "Simulate interactions with user-event.",
      "Assert on visible output, not internal state.",
    ],
    pitfall: "Testing implementation details such as state values or class names.",
    follow: ["What's the guiding principle?", "The more tests resemble how users use the software, the more confidence they give."],
  },
  173: {
    steps: [
      "`getBy`: element must exist now, otherwise it throws.",
      "`queryBy`: returns null if missing; use for asserting absence.",
      "`findBy`: returns a promise that waits for the element (async).",
      "`getAllBy`/`queryAllBy`/`findAllBy` return arrays.",
    ],
    pitfall: "Using `waitFor(() => getBy...)` where `findBy` is simpler.",
    follow: ["Which query priority is recommended?", "ByRole first, then ByLabelText, ByText, and ByTestId last."],
  },
  174: {
    steps: [
      "Mock at the network level with MSW (Mock Service Worker).",
      "Define handlers that return fake responses.",
      "Components use real fetch code and receive mocked data.",
      "Override handlers per test for error cases.",
    ],
    pitfall: "Mocking your own fetch wrapper so deeply that tests stop catching real bugs.",
    follow: ["Why MSW over vi.mock(fetch)?", "Tests don't depend on how requests are made, and the same handlers work in the browser."],
  },
  175: {
    steps: [
      "Use `renderHook(() => useCounter())` from Testing Library.",
      "Read `result.current`.",
      "Wrap state changes in `act()`.",
      "Provide wrappers for context the Hook needs.",
    ],
    pitfall: "Testing a Hook in isolation when testing a component that uses it is clearer.",
    follow: ["How do you test async Hooks?", "Use `await waitFor(() => expect(result.current.data).toBeDefined())`."],
  },
  176: {
    steps: [
      "Render a component and save its output to a snapshot file.",
      "Later runs compare output with the snapshot.",
      "Any difference fails the test until reviewed and updated.",
      "Keep snapshots small and focused.",
    ],
    pitfall: "Huge snapshots everyone updates blindly.",
    follow: ["Better alternative?", "Explicit assertions on what matters to users."],
  },
  177: {
    steps: [
      "Define a props type: `type ButtonProps = { label: string; onClick?: () => void }`.",
      "Annotate: `function Button({ label, onClick }: ButtonProps)`.",
      "Extend native props: `ComponentProps<'button'>`.",
      "Type events: `React.ChangeEvent<HTMLInputElement>`.",
    ],
    pitfall: "Using `React.FC` everywhere; plain typed functions are simpler.",
    follow: ["How do you type children?", "`children: React.ReactNode`."],
  },
  178: {
    steps: [
      "Add a type parameter: `function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode })`.",
      "TypeScript infers T from the items passed in.",
      "Callbacks then get the right item type.",
      "In .tsx arrow functions write `<T,>` to avoid JSX ambiguity.",
    ],
    pitfall: "Falling back to `any`, which loses type safety.",
    follow: ["How do you constrain T?", "`<T extends { id: string }>` so the component can use item.id for keys."],
  },
  179: {
    steps: [
      "Type state and a discriminated-union Action type.",
      "Annotate the reducer: `(state: State, action: Action): State`.",
      "useReducer infers types from the reducer.",
      "For context, `createContext<Value | null>(null)` plus a Hook that throws when it's null.",
    ],
    pitfall: "Giving context a fake default `{} as Value`, hiding missing providers.",
    follow: ["Why discriminated unions?", "TypeScript narrows `action.payload` per `action.type` in each switch case."],
  },
  180: {
    steps: [
      "Use semantic HTML: button, nav, label, headings.",
      "Ensure keyboard access and visible focus.",
      "Add ARIA only when semantics are missing; manage focus in modals.",
      "Test with axe, screen readers and keyboard-only use.",
    ],
    pitfall: "Clickable `<div>`s without role, tabIndex or keyboard handlers.",
    follow: ["How do you announce dynamic updates?", "An `aria-live` region, e.g. role=\"status\"."],
  },
  181: {
    steps: [
      "XSS: avoid dangerouslySetInnerHTML or sanitize it; validate URLs.",
      "Never put secrets in client bundles.",
      "Store tokens safely (HttpOnly cookies) and protect against CSRF.",
      "Keep dependencies updated and authorize on the server.",
    ],
    pitfall: "Thinking React's escaping makes the app fully secure.",
    follow: ["Is localStorage safe for tokens?", "It's readable by any script on the page, so XSS can steal it; HttpOnly cookies are safer."],
  },
  182: {
    steps: [
      "Put values in `.env` files.",
      "Vite exposes only `VITE_`-prefixed variables via `import.meta.env`.",
      "Values are inlined at build time and become public.",
      "Keep real secrets on the server.",
    ],
    pitfall: "Putting a private API key in a VITE_ variable.",
    follow: ["How do you have different values per environment?", "`.env.development`, `.env.production` and the build mode."],
  },
  183: {
    steps: [
      "Group by feature (users/, cart/) rather than by file type.",
      "Keep shared UI in a components/ or ui/ folder.",
      "Each feature owns its components, Hooks, API calls and tests.",
      "Expose a small public API per feature.",
    ],
    pitfall: "One giant components folder with hundreds of files.",
    follow: ["Where do API calls live?", "In feature-level api or service modules, wrapped by query Hooks."],
  },
  184: {
    steps: [
      "Small focused components and clear props.",
      "Minimal state, derived values computed in render.",
      "Correct effects with cleanup, and stable keys.",
      "Accessibility, tests and TypeScript.",
    ],
    pitfall: "Listing practices without examples; mention a real case where one helped you.",
    follow: ["What do you check first in a code review?", "State placement and effects, the most common sources of bugs."],
  },
  185: {
    steps: [
      "State: `todos` array of `{ id, text, done }` and the input text.",
      "Add: on submit, `setTodos(t => [...t, { id: crypto.randomUUID(), text, done: false }])`.",
      "Toggle: map and flip `done` for the matching id.",
      "Delete: filter out the id; render with `key={todo.id}`.",
    ],
    pitfall: "Using the index as key, so checkboxes jump rows after deletion.",
    follow: ["How would you persist todos?", "Initialise from localStorage lazily and save in an effect when todos change."],
  },
  186: {
    steps: [
      "Keep the query in state, controlled by an input.",
      "Derive the filtered list during render: `items.filter(i => i.name.toLowerCase().includes(q))`.",
      "Show a 'no results' message when empty.",
      "For big lists use useDeferredValue or debounce.",
    ],
    pitfall: "Storing the filtered list in state and syncing it with an effect.",
    follow: ["How would you highlight matches?", "Split the text around the match and wrap it in `<mark>`."],
  },
  187: {
    steps: [
      "Keep `page` in state (or the URL).",
      "Fetch `/items?page=${page}` whenever page changes, with abort cleanup.",
      "Show loading and error states and disable buttons at the ends.",
      "Keep previous data visible while the next page loads.",
    ],
    pitfall: "Not cancelling requests, so fast clicks show the wrong page.",
    follow: ["Offset or cursor pagination?", "Cursor pagination is stable when data changes and scales better."],
  },
  188: {
    steps: [
      "Render items plus a sentinel `<div>` at the bottom.",
      "Observe it with IntersectionObserver in an effect.",
      "When visible and not already loading, fetch the next page and append.",
      "Stop when the server reports no more items.",
    ],
    pitfall: "Triggering several loads at once because the loading flag isn't checked.",
    follow: ["Accessibility concern?", "Offer a 'Load more' button and keep the footer reachable."],
  },
  189: {
    steps: [
      "Render through a portal into document.body (or use `<dialog>`).",
      "Listen for Escape in an effect and call onClose; remove the listener in cleanup.",
      "Move focus into the modal and restore it on close.",
      "Add role=\"dialog\", aria-modal and a label.",
    ],
    pitfall: "Closing when clicking inside the modal because the overlay handler doesn't check the target.",
    follow: ["How do you trap focus?", "Native `<dialog>.showModal()` does it, or use a focus-trap library."],
  },
  190: {
    steps: [
      "Lift state to the accordion: `openId`.",
      "Each panel gets `isOpen={openId === id}` and an onToggle.",
      "Toggle: `setOpenId(cur => cur === id ? null : id)`.",
      "Use buttons with aria-expanded and aria-controls.",
    ],
    pitfall: "Giving each panel its own isOpen state, so several open at once.",
    follow: ["How would you allow several open?", "Keep a Set of open IDs instead of one ID."],
  },
  191: {
    steps: [
      "State: remaining seconds and a running flag.",
      "Effect: when running, start an interval decreasing with an updater; clear it in cleanup.",
      "Stop at 0.",
      "Pause sets running false; reset restores the initial time.",
    ],
    pitfall: "`setSeconds(seconds - 1)` inside an interval created once: a stale closure.",
    follow: ["How do you keep accuracy when the tab is inactive?", "Store the end timestamp and compute the remaining time from Date.now()."],
  },
  192: {
    steps: [
      "Read the initial theme lazily from localStorage or prefers-color-scheme.",
      "Store it in state, provided via context if many components need it.",
      "Effect: set `document.documentElement.dataset.theme` and save to localStorage.",
      "Use CSS variables for colours.",
    ],
    pitfall: "A flash of the wrong theme on load; set the attribute with a small inline script before React loads.",
    follow: ["How do you follow the OS setting live?", "Listen to the matchMedia change event in an effect."],
  },
  193: {
    steps: [
      "Props: value, onChange and max (5).",
      "Render buttons for 1..max; filled when `i <= (hover || value)`.",
      "Hover state previews the rating; click calls onChange(i).",
      "Use radio semantics or aria-labels for accessibility.",
    ],
    pitfall: "Only mouse support; add keyboard arrows or use radio inputs.",
    follow: ["How would you support half stars?", "Use pointer position within the star to choose .5 steps."],
  },
  194: {
    steps: [
      "Keep `step` and one `data` object in the parent.",
      "Render the current step's component with data and a field-updating callback.",
      "Validate the step before next; allow going back without losing data.",
      "Submit the combined data on the last step.",
    ],
    pitfall: "Each step owning its own state, which is lost when unmounted.",
    follow: ["How do you show progress?", "A stepper with aria-current on the active step."],
  },
  195: {
    steps: [
      "Cart state: items with id, price and quantity (useReducer works well).",
      "Actions: add (increment if exists), change quantity, remove.",
      "Derive total with reduce during render.",
      "Share it through context for header badges.",
    ],
    pitfall: "Storing the total in state and forgetting to update it.",
    follow: ["How do you handle money precisely?", "Use integer cents to avoid floating-point errors."],
  },
  196: {
    steps: [
      "Several setState calls in one handler are batched.",
      "Logging state right after setting still shows the old snapshot.",
      "The component renders once with all updates applied.",
      "Updater functions chain; plain values replace each other.",
    ],
    pitfall: "Expecting a console.log after setState to show the new value.",
    follow: ["Does batching apply in setTimeout?", "Yes, since React 18 with createRoot."],
  },
  197: {
    steps: [
      "The interval (or handler) captured `count` from the first render (0).",
      "Each tick sets `count + 1` = 1 again.",
      "Fix: `setCount(c => c + 1)` so it reads the latest value.",
      "Or include count in deps and recreate the interval.",
    ],
    pitfall: "Adding count to deps without cleanup, stacking intervals.",
    follow: ["Which tool would have warned you?", "eslint-plugin-react-hooks' exhaustive-deps rule."],
  },
  198: {
    steps: [
      "Keep selected IDs in a Set in state.",
      "Item checkbox toggles its ID (copy the Set first).",
      "'Select all' is checked when all are selected; clicking it selects all or clears.",
      "Set the `indeterminate` DOM property via a ref when only some are selected.",
    ],
    pitfall: "Mutating the Set in place, so React doesn't re-render.",
    follow: ["Why a ref for indeterminate?", "It's a DOM property with no HTML attribute, so you set it imperatively."],
  },
  199: {
    steps: [
      "Create ToastContext with an `addToast` function.",
      "The provider holds a toasts array and renders them (often in a portal).",
      "addToast pushes `{ id, message }` and schedules removal with setTimeout.",
      "Components call `useToast().addToast('Saved')`.",
    ],
    pitfall: "Putting the toasts array in the same context value as addToast, re-rendering every caller.",
    follow: ["How do you make toasts accessible?", "Render them in an aria-live=\"polite\" region."],
  },
  200: {
    steps: [
      "The search text state lives in the parent of the big list.",
      "Every keystroke re-renders the parent and every list row.",
      "Fix: move the input state into its own component, or memoize rows with React.memo.",
      "Use useDeferredValue for filtering and virtualize long lists.",
    ],
    pitfall: "Passing a new inline callback to each memoized row, defeating memo.",
    follow: ["How do you confirm the fix?", "Profile before and after with React DevTools and compare commit times."],
  },
};
