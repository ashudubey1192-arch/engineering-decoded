// Original teaching diagrams. IDs correspond to the supplied interview PDF.
// The diagrams explain mechanisms; they do not execute the displayed snippets.
const models = {};
function model(ids, title, labels, notes) {
  const nodes = labels.map((label, index) => ({ id: `n${index}`, label }));
  const steps = notes.map((note, index) => ({
    from: nodes[index % nodes.length].id,
    to: nodes[(index + 1) % nodes.length].id,
    note,
  }));
  for (const id of ids) models[id] = { title, nodes, steps };
}

model([1, 2, 9, 45, 46], 'Describe the screen from data',
  ['Inputs', 'Components', 'Elements', 'Browser'], [
    'Start with the current props and state. A component is a reusable unit that receives these inputs.',
    'React calls components to compute an element description. Rendering should not mutate external state.',
    'React reconciles that description with the previous tree and commits the needed browser changes.',
    'A later interaction can update state and start another render. Routing and data infrastructure are separate choices.',
  ]);
model([3, 4, 41, 48, 49], 'From JSX source to a screen',
  ['JSX source', 'Transform', 'Elements', 'DOM'], [
    'Write a JavaScript expression containing JSX. Curly braces embed expressions; JSX comments use a JavaScript block comment inside braces.',
    'The build transform turns JSX into element-creation calls. Capitalized names refer to JavaScript component values; lowercase names describe host tags.',
    'One returned expression can contain a Fragment or an array of elements. A Fragment groups children without adding a wrapper DOM node.',
    'The browser receives ordinary JavaScript and React commits DOM nodes. JSX itself is not parsed by the browser.',
  ]);
model([5, 6, 7, 33], 'Render, compare, then commit',
  ['New inputs', 'Element tree', 'Reconcile', 'Commit'], [
    'An update requests a new render; an element is a description, while a component is the function or class that produces descriptions.',
    'React compares types, positions and sibling keys against the previous tree. The virtual DOM is a mental model, not a full browser DOM clone.',
    'React determines which host changes are needed. Re-rendering a component does not mean replacing every DOM node.',
    'The commit updates the DOM. React does not promise the globally smallest possible edit sequence or that every DOM write triggers layout.',
  ]);
model([8, 83, 85, 128], 'Urgent input and interruptible work',
  ['Typing', 'Urgent state', 'Transition', 'Commit'], [
    'Update the text input state urgently so the field reflects the keystroke immediately.',
    'Mark the expensive result update as a transition. Transitions classify React updates; they do not move JavaScript computations to a worker.',
    'React may pause or abandon background rendering when a newer urgent update arrives. Rendering must therefore remain pure.',
    'Commit a completed result. A pending indicator can explain the delay without freezing the input.',
  ]);
model([10, 51, 101, 141], 'Stateful behavior in a component',
  ['Component', 'State owner', 'Render', 'Interaction'], [
    'A function component may use Hooks; a class component uses its instance state and lifecycle methods. Both describe UI from inputs.',
    'Store only the information that the component must remember. A presentational component can simply receive data and callbacks.',
    'Read the current state while rendering. Hooks cannot be called from a class method.',
    'For a legacy class that needs Hook logic, introduce a function wrapper and pass the result as props.',
  ]);
model([11, 13, 27, 29, 43], 'Props flow from parent to child',
  ['Parent', 'Props', 'Child', 'UI'], [
    'The parent chooses the child inputs. Object spread forwards properties, so place explicit overrides intentionally and avoid forwarding private fields to DOM nodes.',
    'Props are read-only snapshots. A default parameter supplies a value for an undefined prop, not for null.',
    'The child computes its UI from those inputs; it must not mutate the parent-owned object.',
    'When parent data changes, React can render the child with new props. To request a change, the child calls a callback supplied by its parent.',
  ]);
model([12, 53, 55, 57, 196], 'State updates use a render snapshot',
  ['Snapshot 0', 'Update queue', 'Next render', 'Screen 1'], [
    'An event handler sees the state snapshot from the render that created it. Calling a setter does not rewrite that local variable.',
    'Three setCount(count + 1) calls with count equal to zero enqueue three replacements with one. React batches the updates.',
    'React processes the queue before the next render. Replacing the value with one repeatedly still leaves one.',
    'The next render sees count equal to one. Setters are not Promises; awaiting a setter is not a way to wait for the commit.',
  ]);
model([14, 54, 98], 'Compute the next immutable value',
  ['Previous', 'Updater', 'New value', 'Render'], [
    'Treat the previous object or array as read-only. Other renders and components may still refer to it.',
    'An updater receives the pending state. For three c => c + 1 updates starting at zero, the queue computes one, then two, then three.',
    'For nested edits, copy every changed level and preserve unchanged references. map, filter and object spread are useful tools.',
    'Return the new value so React can observe the change. A copied outer object is insufficient if you mutate a shared nested object.',
  ]);
model([15, 16, 122], 'Compose behavior through children',
  ['Parent JSX', 'Wrapper', 'Children', 'DOM'], [
    'The caller supplies nested content. React exposes this content to the wrapper through its children prop.',
    'The wrapper chooses where to display children and supplies layout or shared behavior without knowing each child implementation.',
    'Use a Fragment when grouping is needed without an extra DOM element. Use an explicit keyed Fragment when a mapped group needs identity.',
    'Composition builds a tree of cooperating components and avoids a deep inheritance hierarchy.',
  ]);
model([17, 18, 20], 'Stable keys preserve item identity',
  ['IDs A B C', 'Reorder C A B', 'Match by key', 'State follows'], [
    'Render a collection with map and a stable domain ID as the key on each outermost returned element.',
    'After an insertion or reorder, positions change. An index key identifies a position, not the underlying item.',
    'React matches the previous and next siblings by key and type. Keys need only be unique among those siblings.',
    'An input draft stays with its item. Random keys force remounts and lose local state instead of improving reconciliation.',
  ]);
model([19, 42], 'Choose a render branch',
  ['Condition', 'Choose type', 'Return JSX', 'Identity'], [
    'Evaluate a boolean or a known configuration value during rendering. Use an explicit comparison when zero is a possible value.',
    'Choose a component from a trusted map or select a JSX branch with if, a ternary or logical AND.',
    'Return the chosen description. Returning null renders no content; zero && JSX renders zero.',
    'Changing component type or removing a branch can reset its local state. Keep Hooks unconditional before early returns.',
  ]);
model([21, 22, 139], 'An event travels through the React tree',
  ['User event', 'Handler', 'Parent', 'State update'], [
    'Pass a handler function to onClick or another event prop; do not call it while rendering.',
    'React provides an event object with a consistent interface. Modern React DOM does not require event.persist() for old-style event pooling.',
    'Events usually propagate through the React tree. stopPropagation stops propagation; preventDefault cancels a browser default action.',
    'The handler may request a state update. Keep event-specific work in the handler instead of turning it into an Effect.',
  ]);
model([23, 25, 50], 'A controlled input has one owner',
  ['React state', 'Input value', 'onChange', 'Next state'], [
    'Initialize the input state to a suitable value, such as an empty string for a text field.',
    'Pass value and onChange. The displayed input value is controlled by React state.',
    'Read event.target.value, or event.target.checked for a checkbox. A shared handler can use the input name to select a field.',
    'Create the next form object with the changed field and render again. Do not switch a field between controlled and uncontrolled during its lifetime.',
  ]);
model([24], 'Read an uncontrolled field when needed',
  ['Default value', 'Browser input', 'Submit', 'Read value'], [
    'Provide defaultValue or defaultChecked to establish the initial browser value.',
    'The browser owns subsequent edits. React does not receive a state update for every keystroke unless you add one.',
    'At submission, prevent navigation when handling the form in client code and collect its FormData.',
    'Alternatively read a DOM ref. Changing defaultValue is not equivalent to controlling the current value.',
  ]);
model([26, 39, 40], 'Lift shared state to a common owner',
  ['Parent state', 'Child A', 'Callback', 'Child B'], [
    'Find the nearest parent that survives and contains both consumers. Put their shared value there.',
    'Pass the value and a callback down to the first child. The child renders the value without copying it into redundant state.',
    'An interaction calls the callback. The parent updates its state, maintaining a single source of truth.',
    'Pass the updated value to both siblings so they stay synchronized. The callback is a request, not reverse prop mutation.',
  ]);
model([28, 71, 123, 124, 167], 'Context distributes an owned value',
  ['State owner', 'Provider', 'Consumer', 'Update'], [
    'Choose where state lives first. Context transports a value through the tree; it does not create a reducer, cache or persistence layer.',
    'Place a provider above the consumers that need the value. Ordinary intermediate components need not forward a prop.',
    'A consumer reads the nearest provider. When its value changes by Object.is comparison, subscribed consumers can re-render.',
    'Split unrelated contexts or stabilize provider values when measurement justifies it. Redux adds store conventions and tooling beyond context transport.',
  ]);
model([30, 177], 'Check the component contract',
  ['Props type', 'Call site', 'Build check', 'Runtime data'], [
    'Declare required and optional props in a TypeScript type or interface, including event and children types where needed.',
    'The caller supplies values that match that contract. Static checks catch mistakes before the component runs.',
    'TypeScript types are erased at runtime. Legacy PropTypes checks are not a replacement for current React 19 typing practices.',
    'Validate untrusted network or user data at the boundary with runtime checks. A TypeScript annotation alone cannot validate a response.',
  ]);
model([31, 32], 'Scope a style to the component',
  ['CSS source', 'Class mapping', 'className', 'Computed style'], [
    'Write styles in a stylesheet. CSS Modules use a module file so class names can be scoped by the build tool.',
    'Import the generated class mapping and choose the class appropriate to the component state.',
    'Set className in JSX. For dynamic inline styles, pass an object using camelCase property names.',
    'The browser applies the cascade and computes the style. CSS Modules prevent name collisions, not all cascade or layout problems.',
  ]);
model([34, 94], 'Strict Mode checks reversibility',
  ['Setup', 'Cleanup', 'Setup again', 'Working UI'], [
    'In development, Strict Mode performs extra checks that can include rendering twice and running an additional Effect setup/cleanup cycle.',
    'Cleanup should undo the subscription, timer or resource allocation performed by setup.',
    'Run setup again. If duplicate listeners or requests cause incorrect behavior, fix ownership and cleanup rather than hiding the check.',
    'These extra development checks do not mean every production Effect always runs twice.',
  ]);
model([35, 44], 'Connect React to a browser root',
  ['React element', 'createRoot', 'root.render', 'DOM container'], [
    'React supplies component and element APIs; react-dom/client supplies the browser root renderer.',
    'Create a root for the existing DOM container with createRoot. Keep ownership of that container with React.',
    'Render the application element into the root. ReactDOM.render belongs to the older API and is removed in React 19.',
    'For HTML already rendered on the server, use hydrateRoot instead so React can attach to matching existing markup.',
  ]);
model([36, 37, 143], 'Pure rendering can be repeated safely',
  ['Same inputs', 'Pure render', 'Same output', 'Side effects'], [
    'Treat props, state and context as immutable snapshots for the current render.',
    'Compute the UI without mutating external objects, starting requests or changing the DOM.',
    'React may repeat or abandon renders. Pure computation remains correct under those scheduling decisions.',
    'Put interaction work in handlers and synchronization in Effects. PureComponent is a class optimization, not a license to mutate inputs.',
  ]);
model([38, 181], 'Keep untrusted content as data',
  ['External input', 'Validation', 'Text / HTML', 'Browser'], [
    'Treat user input, stored comments and API content as untrusted even when they come from your own server.',
    'Validate authorization on the server and validate data at trust boundaries. Client-side route guards cannot enforce access control.',
    'Rendering a string as a JSX text child escapes markup. Inserting raw HTML bypasses that protection and needs a trusted sanitization policy.',
    'Also consider unsafe URLs, dependency risks and token handling. Escaped text does not make every application operation safe.',
  ]);
model([47], 'Choose how the app is built',
  ['Requirements', 'Framework', 'Build tool', 'Deploy'], [
    'Decide whether the product needs routing, server rendering, data loading and deployment integration.',
    'A React framework can coordinate those concerns. Select it based on product constraints, not because React itself requires one universal framework.',
    'A build tool such as Vite is useful for a client-only application or learning project. Create React App is deprecated for new apps.',
    'Verify the production build and hosting behavior, including route fallbacks and environment configuration.',
  ]);
model([52], 'Hook call order identifies Hook state',
  ['Render A', 'Hook 1', 'Hook 2', 'Render B'], [
    'React associates ordinary Hook state with the component and the order in which Hooks are called.',
    'Call Hooks at the top level of a function component or custom Hook, before conditional returns.',
    'A conditional Hook can shift every later slot, causing a call to receive the wrong state.',
    'Keep the same ordering on the next render. The use API has special conditional-call rules and should not be generalized to other Hooks.',
  ]);
model([56], 'Initialize only when mounting',
  ['Mount', 'Initializer', 'Stored state', 'Later render'], [
    'Pass an initializer function to useState when computing the initial value is expensive.',
    'React calls that function to obtain the initial state; keep it pure because development checks may call it more than once.',
    'The resulting value becomes the component state for that mount.',
    'Later renders use the stored state rather than invoking the initializer to reset it. Use a state update or a new key when a reset is intended.',
  ]);
model([58, 59, 60, 93], 'An Effect synchronizes a resource',
  ['Commit', 'Setup', 'Deps change', 'Cleanup'], [
    'After a committed render, an Effect can synchronize with an external system such as a connection or browser subscription.',
    'Setup captures the reactive inputs it uses. Declare those inputs as dependencies instead of choosing dependencies to force a schedule.',
    'React compares dependencies with Object.is. Changed dependencies require a new synchronization; an empty array means no reactive inputs are used.',
    'React runs the previous cleanup before the next setup and on unmount. Think of each Effect as a synchronization process, not a literal class-lifecycle translation.',
  ]);
model([61, 62, 79], 'Only the current request may win',
  ['Query A', 'Request A', 'Query B', 'Request B'], [
    'An Effect starts an inner async function. The Effect callback itself returns cleanup or nothing, not a Promise.',
    'Represent loading, success and failure explicitly. A successful HTTP fetch still needs a response.ok check for HTTP failures.',
    'When the query changes, clean up the old request with AbortController or mark its result as stale.',
    'Apply only the current request result. Otherwise an older, slower response can overwrite the newer query result.',
  ]);
model([63, 64], 'Different Effect timings serve different jobs',
  ['Render', 'DOM commit', 'Layout phase', 'Paint / Effect'], [
    'Render computes UI and must stay pure. None of these Effects runs during server rendering.',
    'React commits DOM changes. useInsertionEffect is a specialist tool for CSS-in-JS style insertion, not a general layout measurement tool.',
    'useLayoutEffect can measure or adjust layout before the browser paints, but blocks painting and should be used sparingly.',
    'useEffect is preferred for ordinary synchronization. Its exact timing relative to paint can depend on the interaction; do not use it when pre-paint measurement is required.',
  ]);
model([65, 66, 67, 114], 'A ref retains a mutable value',
  ['Render', 'Ref object', 'Change current', 'Next render'], [
    'useRef returns the same ref object across renders of one mounted function component.',
    'Use current for a DOM node or a value that should survive without becoming render state, such as a timer handle.',
    'Changing current does not schedule a render. A previous-value Hook can update its ref after commit so the next render reads the preceding value.',
    'Use state for values that determine the UI. Calling createRef on every function render creates new objects, unlike useRef.',
  ]);
model([68, 69, 70], 'Expose a narrow imperative interface',
  ['Parent ref', 'Child', 'Handle / node', 'Cleanup'], [
    'The parent passes a ref to the child. React 19 function components can receive ref as a prop; older patterns use forwardRef.',
    'The child may pass that ref to a host element or use useImperativeHandle to expose selected operations such as focus.',
    'Invoke the exposed operation in a handler or appropriate Effect. Prefer ordinary props for declarative state.',
    'Callback refs can attach and clean up node-specific work. React 19 supports returning a cleanup function from a callback ref.',
  ]);
model([72, 73, 105], 'An action describes what happened',
  ['Event', 'Action', 'Reducer', 'Next state'], [
    'The event handler describes a domain event instead of scattering many unrelated updates throughout the UI.',
    'Dispatch a focused action, such as { type: "added", title }. Context may carry the state and dispatch function to distant consumers.',
    'The reducer computes the next state from current state and action without mutation or side effects.',
    'Render from the returned state. A class setState shallow-merges object updates, whereas a useState setter or reducer result replaces its value.',
  ]);
model([74, 75, 76, 77, 145, 151, 200], 'Memoization depends on identity',
  ['Parent render', 'Compare inputs', 'Reuse or run', 'Child render'], [
    'A parent render may create new object or function references even when their contents appear unchanged.',
    'useMemo compares calculation dependencies, useCallback retains a function reference, and memo compares child props with Object.is by default.',
    'Reuse is possible only when the relevant dependencies or props remain equal. One always-new prop can defeat the optimization.',
    'Profile before adding memoization. State and context updates can still render a memoized child, and caching must not be required for correctness.',
  ]);
model([78, 81, 91, 99], 'Reuse logic without merging state',
  ['Component A', 'Custom Hook', 'Component B', 'Own state'], [
    'Extract a meaningful behavior, such as a toggle or an outside-click subscription, behind a custom Hook API.',
    'The Hook may compose other Hooks. For a document listener, check containment and remove the same listener during cleanup.',
    'Another component calls the same implementation. A Hook call shares logic, not a hidden singleton state variable.',
    'Each caller retains independent state. useDebugValue adds a readable label in DevTools; HOCs and render props are alternative reuse patterns.',
  ]);
model([80, 149], 'Debounce waits for quiet time',
  ['Input A', 'Timer A', 'Input B', 'Timer B fires'], [
    'The user types and a timer is scheduled to publish the value after a chosen delay.',
    'Keep the immediate field value responsive. Debouncing should delay the expensive downstream work, not typing itself.',
    'A newer input cancels the earlier timer and starts another one. Cleanup also cancels pending work on unmount.',
    'After a quiet period, publish the latest value. Throttling is different: it limits execution frequency during continuous activity.',
  ]);
model([82], 'Connect an accessible label and field',
  ['useId', 'Label htmlFor', 'Input id', 'Assistive tech'], [
    'Call useId at the top level to obtain an identifier associated with this component instance.',
    'Assign that value to the label htmlFor and use suffixes for related help or error element IDs.',
    'Assign the matching value to the field id and reference help through aria-describedby when appropriate.',
    'The label now names the field. useId is designed for these relationships, not as a replacement for stable data keys in lists.',
  ]);
model([84], 'A deferred value lets results lag',
  ['New query', 'Old results', 'Background', 'Fresh results'], [
    'Render the input with the latest query immediately and pass a deferred query to the expensive results subtree.',
    'For a non-urgent background update, the subtree may temporarily keep the previous value while the rest of the UI stays responsive.',
    'React tries rendering the latest deferred value in the background and can restart if another update arrives.',
    'When ready, commit the new results. This is not a fixed delay and does not automatically reduce network requests.',
  ]);
model([86], 'Subscribe to an external snapshot',
  ['External store', 'Subscription', 'Snapshot', 'React render'], [
    'A store outside React owns data and exposes a subscribe function that returns unsubscribe.',
    'useSyncExternalStore receives the subscription and a getSnapshot function; the store notifies listeners when its state changes.',
    'Return the same snapshot reference while the data is unchanged and an immutable new snapshot when it changes.',
    'React renders a consistent snapshot. Server-rendered applications also need a compatible getServerSnapshot for hydration.',
  ]);
model([87, 126, 127], 'A pending resource meets a boundary',
  ['Read resource', 'Pending', 'Fallback', 'Resolved UI'], [
    'A lazy component loads through dynamic import, or use reads a supported cached Promise supplied by the application or framework.',
    'If that resource is pending, rendering suspends. Ordinary fetching inside useEffect does not automatically trigger Suspense.',
    'The nearest suitable Suspense boundary displays a fallback. A rejected load belongs to an error boundary, not a perpetual loading message.',
    'When the resource resolves, React retries rendering. Declare lazy components outside render and reuse Promise identities rather than making a fresh Promise each render.',
  ]);
model([88, 89, 133, 134, 135], 'A form Action has a pending lifecycle',
  ['Submit', 'Action pending', 'Server / work', 'Result state'], [
    'A form submission collects FormData and invokes its action. A Server Function needs a supporting framework and a server execution boundary.',
    'useActionState can track returned state and pending status. A child of the form can use useFormStatus to read the form submission status.',
    'Validate and authorize again on the server. Client arguments and hidden fields are not trusted simply because React submitted them.',
    'Return useful validation or success state and render it accessibly. Handle failures without losing the user’s ability to retry.',
  ]);
model([90], 'Show an optimistic result, then reconcile',
  ['Base data', 'Optimistic UI', 'Request', 'Confirmed data'], [
    'Keep the authoritative result separate from the temporary prediction of a successful change.',
    'Apply an optimistic update in the Action so the interface responds before the request finishes.',
    'Perform the real operation and represent pending or failure status. The optimistic value is not proof of persistence.',
    'Reconcile with confirmed server data or explain the failure. Avoid duplicating an optimistic item after the server returns its permanent ID.',
  ]);
model([92, 197], 'A closure remembers its render',
  ['Render count 0', 'Timer closure', 'Tick', 'Updater fix'], [
    'A render creates a callback that closes over count equal to zero.',
    'An Effect with an empty dependency array may retain that callback for the whole subscription lifetime.',
    'Every tick executes setCount(count + 1) using the captured zero, repeatedly requesting one.',
    'Use setCount(c => c + 1) when the next value depends on previous state, or redesign dependencies and cleanup when other reactive values are involved.',
  ]);
model([95, 96, 97, 170], 'Calculate derived values during render',
  ['Source state', 'Calculation', 'UI', 'External sync?'], [
    'Store the smallest set of independent values. For example, store items and a query rather than a second filtered-items state.',
    'Calculate the filtered list or total from the current sources while rendering. Memoize only an expensive calculation when measured.',
    'The screen stays consistent because there is no extra Effect-driven render to repair duplicated state.',
    'Use an Effect only when synchronizing with an external system. An Effect that changes one of its own dependencies can create a loop.',
  ]);
model([100, 142, 150], 'Type, position and key define identity',
  ['Old tree', 'Type + key', 'Same identity', 'New identity'], [
    'React retains component state in association with its place in the rendered tree.',
    'Compare the type and key at that position. Defining a component inside another component creates a new function type on each render.',
    'With matching identity, state can survive a parent update. Moving JSX between source-code branches does not itself guarantee a reset.',
    'A different key or type remounts the subtree and resets state. Use a deliberate key change when a fresh form draft is intended.',
  ]);
model([102, 106, 107, 108, 115], 'Class resources follow committed lifecycle',
  ['Mount', 'Did mount', 'Did update', 'Will unmount'], [
    'Construction and render prepare the UI. Keep render free of external effects.',
    'componentDidMount can subscribe or start synchronization after mounting.',
    'componentDidUpdate compares previous and current props before resynchronizing. An unconditional setState here can loop.',
    'componentWillUnmount removes subscriptions and timers. Avoid deprecated UNSAFE lifecycle methods for new synchronization logic.',
  ]);
model([103, 104], 'A class handler needs the correct instance',
  ['Instance', 'Initialize', 'Handler', 'this.setState'], [
    'Create a component instance and call super(props) before accessing this in an explicit constructor.',
    'Initialize state once and bind a prototype method, or use a class-field arrow handler.',
    'Passing an unbound ordinary method as a callback can lose the intended this value.',
    'The correctly bound handler can request a state update on its component instance. Do not invoke it during render.',
  ]);
model([109, 110, 116], 'Class render decisions need restraint',
  ['Next inputs', 'State choice', 'Render decision', 'Commit'], [
    'React receives an update. Prefer deriving display values from props during render rather than copying props into state.',
    'getDerivedStateFromProps is a rare state-adjustment escape hatch, not the normal way to handle every new prop.',
    'shouldComponentUpdate or PureComponent can skip some work when inputs are equivalent. They are performance tools, not correctness mechanisms.',
    'forceUpdate bypasses shouldComponentUpdate on that instance, but does not repair a mutable or inconsistent data model.',
  ]);
model([111], 'Capture layout before a DOM update',
  ['Old DOM', 'Snapshot', 'Commit', 'Restore scroll'], [
    'A class component is about to commit new content, such as appended messages.',
    'getSnapshotBeforeUpdate reads a needed measurement from the old DOM, such as distance from the bottom.',
    'React commits the DOM update and passes the snapshot to componentDidUpdate.',
    'Use the saved measurement to preserve the intended scroll position without guessing from the already-changed DOM.',
  ]);
model([112, 113], 'Route failures to the right owner',
  ['Render failure', 'Boundary', 'Fallback', 'Retry / report'], [
    'An error thrown while rendering a descendant can be handled by an error boundary above that subtree.',
    'The boundary switches to a fallback and can report the error. It cannot catch an error in its own fallback.',
    'Ordinary event-handler errors and async request rejections require explicit handling at their own call sites.',
    'Offer a meaningful recovery path. Suspense handles pending supported resources; it does not replace error handling.',
  ]);
model([117, 118, 119, 120, 121], 'Share behavior while composing views',
  ['Behavior owner', 'Public API', 'View', 'User action'], [
    'Separate stateful behavior from the view when that separation solves a real reuse or testing need.',
    'A HOC wraps a component, a render prop calls a supplied function, and compound components coordinate through a shared parent contract.',
    'The view renders the supplied values. Keep APIs explicit so wrapper layers do not collide on prop names or hide ownership.',
    'The view reports actions through callbacks. Modern custom Hooks often provide simpler logic reuse without extra wrapper trees.',
  ]);
model([125], 'Portals change DOM placement, not ownership',
  ['React parent', 'Portal', 'Other DOM node', 'React event'], [
    'The parent renders a child using createPortal and supplies an existing DOM destination.',
    'React retains the portal child in the same logical component tree, including its context relationships.',
    'The DOM nodes appear at the supplied destination, useful for overlays that must escape a clipping container.',
    'Events still propagate according to the React tree. Modal focus, keyboard behavior and accessibility remain application responsibilities.',
  ]);
model([129, 130, 132], 'Server HTML becomes interactive',
  ['Server render', 'HTML response', 'Client React', 'Hydrate'], [
    'SSR produces HTML for a request; SSG produces it ahead of time; ISR is a framework revalidation strategy for generated content.',
    'The browser can display the HTML before all client JavaScript has run. CSR instead builds the initial app UI in the browser.',
    'Load the client code and initialize it with the data needed to reproduce the server result.',
    'hydrateRoot attaches React behavior to matching markup. Hydration is not the same operation as executing Server Components.',
  ]);
model([131], 'Server and client components have different jobs',
  ['Server component', 'Data / secrets', 'Serialized UI', 'Client boundary'], [
    'A Server Component runs in the server environment provided by the framework, where it can access server-only data.',
    'Keep credentials and server dependencies on that side. A Server Component does not use client state or browser event handlers.',
    'Its result is transported in the framework’s component payload; it may also participate in server HTML generation.',
    'A Client Component supplies interactive behavior. Props crossing the boundary must be supported serializable values, not arbitrary closures.',
  ]);
model([136], 'Compiler optimization happens during the build',
  ['Component source', 'Compiler', 'Memoized work', 'Runtime'], [
    'Write components and Hooks that follow React’s purity and Hook rules.',
    'When configured, the React Compiler analyzes supported code during the build and introduces memoization where it can safely do so.',
    'The generated code can reuse calculations and avoid some repeated rendering work without hand-written memo wrappers.',
    'The compiler does not fix incorrect Effects, network waterfalls or huge bundles. Verify the build configuration and measure the remaining bottleneck.',
  ]);
model([137], 'Read current values from an Effect Event',
  ['Reactive Effect', 'External event', 'Effect Event', 'Latest values'], [
    'Keep the external synchronization Effect reactive to values that genuinely control the resource, such as a room ID.',
    'When the resource reports an event, invoke the locally declared Effect Event from that Effect-owned logic.',
    'The Effect Event reads current committed props and state without making those reads reconnect the resource.',
    'Do not use it to hide genuine dependencies, pass it to other components, or call it during render. It is not a general-purpose stable event handler.',
  ]);
model([138], 'Hide a subtree while preserving its state',
  ['Visible', 'Hidden', 'Effects cleaned', 'Visible again'], [
    'An Activity boundary initially displays its child subtree and runs its Effects normally.',
    'Switching to hidden preserves its state and DOM while hiding the content.',
    'React cleans up Effects while hidden. The subtree may still receive lower-priority updates; hidden does not mean all computation ceases.',
    'When shown again, the previous state is restored and Effects are recreated. This differs from removing the subtree and losing its state.',
  ]);
model([140], 'A custom element meets React',
  ['Custom element', 'JSX tag', 'Props / events', 'Browser API'], [
    'Register the custom element with the browser’s customElements registry.',
    'Use its hyphenated tag name in JSX. The custom element implementation owns its internal behavior.',
    'React 19 improves support for custom-element properties and events. Match the element’s documented names and value types.',
    'Use refs for necessary imperative integration and clean up listeners you attach manually. A Web Component is not itself a React component.',
  ]);
model([144], 'Trace the reason for a render',
  ['Update source', 'Affected tree', 'Render work', 'Commit'], [
    'A local state update, an ancestor render, a consumed context change or an external-store subscription can initiate work.',
    'Inspect which components are affected rather than assuming only changed DOM nodes execute component code.',
    'React may call component functions and then discover that their resulting DOM needs no changes.',
    'Use profiling evidence to identify expensive work. A render count alone does not describe user-visible performance.',
  ]);
model([146, 148, 153], 'Measure the slow interaction first',
  ['Reproduce', 'Profile', 'Target cause', 'Measure again'], [
    'Choose a specific slow interaction or loading scenario and record the relevant device and network conditions.',
    'Use React DevTools for component commit costs and browser performance tooling for scripting, layout, network and responsiveness.',
    'Apply the fix that matches the cause: reduce transferred code, avoid repeated work, improve data loading or reduce rendered content.',
    'Compare the same scenario afterward. Field Web Vitals reflect real user experience and are not replaced by a single local React profile.',
  ]);
model([147, 188], 'Render only the useful window',
  ['Scroll position', 'Visible range', 'Rows / sentinel', 'Next range'], [
    'For virtualization, calculate the row range near the viewport and retain enough overscan for smooth scrolling.',
    'Render only that range while preserving the total scrollable space and stable row identity.',
    'Infinite loading is a separate concern: an observer sentinel can request another page when more content is needed.',
    'Guard against duplicate requests, stop at the end, clean up the observer and expose loading or retry status. Infinite loading alone does not limit DOM size.',
  ]);
model([152], 'Defer offscreen image transfer',
  ['Image slot', 'Near viewport', 'Download', 'Paint image'], [
    'Reserve dimensions with width and height or aspect-ratio so the page does not jump when the image arrives.',
    'Use native loading="lazy" for suitable offscreen images. Do not blindly lazy-load the likely largest above-the-fold image.',
    'Serve appropriately sized sources with responsive image attributes where useful.',
    'Provide meaningful alt text, or empty alt for decorative images. Image lazy loading is independent of React.lazy code splitting.',
  ]);
model([154, 155, 156, 157, 158, 161], 'The URL selects a route tree',
  ['URL', 'Route match', 'Params / data', 'Outlet'], [
    'A router observes the current location. Browser history URLs require a server fallback; hash routing encodes navigation after #.',
    'Match route definitions and extract path parameters. Query strings are a separate URLSearchParams-based input.',
    'Use links for navigation and a navigation API after an operation when appropriate. A normal anchor may request a new document.',
    'Nested route content renders in its parent Outlet. NavLink can indicate the active route without manually duplicating URL state.',
  ]);
model([159], 'A route guard is a user-interface decision',
  ['Auth pending', 'Session known', 'Route decision', 'Server check'], [
    'Wait until the authentication state is known so a valid user is not redirected during initialization.',
    'Determine whether to show the route, request sign-in or display an access-denied state.',
    'Preserve a safe return destination when redirecting. Do not expose protected data while checking.',
    'Enforce authentication and authorization on every protected server operation. Hiding a client route cannot secure an API.',
  ]);
model([160, 166, 169], 'Remote data needs a lifecycle',
  ['Route / query', 'Cache / loader', 'Remote result', 'Invalidate'], [
    'A route loader or query key identifies the data required by the current screen.',
    'The chosen data layer coordinates loading and may cache, deduplicate or cancel requests according to its API.',
    'Render loading, error, empty and successful states explicitly. Server state can become stale independently of local UI state.',
    'After a mutation, update or invalidate the relevant cached data. React Router loaders and RTK Query are different tools with their own contracts.',
  ]);
model([162, 163, 164, 165, 168], 'A store publishes selected state',
  ['UI action', 'Store logic', 'Next state', 'Selector'], [
    'The component requests a domain change through the store API; Redux uses dispatched actions.',
    'Reducers compute immutable updates. Middleware or thunks coordinate side effects outside reducers; other stores such as Zustand expose different update APIs.',
    'The store publishes its next state to subscribers.',
    'A selector reads the part a component needs. Keep selected references stable when unchanged and avoid subscribing every component to the whole store.',
  ]);
model([171, 194], 'Validate before advancing a form',
  ['Field values', 'Validation', 'Errors / next', 'Submit'], [
    'Keep draft values in an owner that survives step navigation. Track the current step separately from the complete draft.',
    'Validate the fields relevant to the attempted action and derive errors from the actual values.',
    'Show errors beside the fields, preserve entered data and move focus appropriately. Advance only when the step satisfies its constraints.',
    'Validate the complete payload and enforce rules again on the server. A disabled submit button alone does not enforce valid data.',
  ]);
model([172, 173, 174, 175, 176], 'Test observable behavior',
  ['Arrange', 'User action', 'Observe', 'Assert'], [
    'Render the component or Hook with the required providers and a controlled network boundary when the test needs one.',
    'Perform a realistic user interaction. Prefer accessible role and label queries over implementation details.',
    'Use getBy for an immediate required match, queryBy when absence is expected, and findBy to await an appearing element.',
    'Assert the result and failure cases. A snapshot detects structural differences but does not prove an interaction works or an output is correct.',
  ]);
model([178, 179], 'Let types preserve relationships',
  ['Generic input', 'Type parameter', 'Typed callback', 'Safe usage'], [
    'Identify the relationship that must remain consistent, such as the item type in a list and its render callback.',
    'Declare a generic parameter rather than erasing the relationship with any.',
    'For reducer actions, use a discriminated union so each action type has the correct payload and branches narrow safely.',
    'Give context a deliberate missing-provider strategy and check it in a custom Hook. Runtime validation is still needed for untrusted values.',
  ]);
model([180], 'Make the interaction perceivable and operable',
  ['Semantic HTML', 'Accessible name', 'Keyboard', 'Feedback'], [
    'Start with the native element that matches the task, such as a button for an action and a label for a field.',
    'Supply an accessible name and connect instructions or validation messages where needed.',
    'Verify keyboard operation, visible focus and sensible focus movement when content opens or closes.',
    'Announce important asynchronous status without overwhelming users. Automated checks help, but keyboard and screen-reader review remain valuable.',
  ]);
model([182], 'Separate public configuration from secrets',
  ['Build config', 'Client bundle', 'Browser', 'Server secret'], [
    'A client build can replace environment-variable references according to its build tool’s naming rules.',
    'Values included in the resulting bundle can be read by visitors, even if the original source file was called .env.',
    'Use client configuration for public endpoints and flags, not private credentials.',
    'Keep secrets in the server runtime and expose only authorized operations through an API. Changing a build-time value often requires rebuilding.',
  ]);
model([183, 184], 'Organize around ownership and behavior',
  ['Feature', 'State / API', 'UI boundary', 'Tests'], [
    'Group related feature behavior so a change can be understood without searching many unrelated directories.',
    'Make state ownership and server communication explicit, with shared infrastructure introduced only when reuse is real.',
    'Keep components focused and use accessible, pure render logic with deliberate loading and failure states.',
    'Test important user behavior and measure real bottlenecks. Folder names alone do not establish a maintainable architecture.',
  ]);
model([185], 'Todo operations preserve identity',
  ['Draft title', 'Add ID', 'Toggle / delete', 'Next list'], [
    'Control the draft input, trim it on submission and reject an empty title.',
    'Create a stable ID once when adding the item, not on every render.',
    'Use map to toggle the matching item and filter to remove it without mutating the existing list.',
    'Render each item with its ID as key. Keep the draft input separate from persisted todo data.',
  ]);
model([186], 'Filter from source data and a query',
  ['Input query', 'Normalize', 'Filter items', 'Visible list'], [
    'Store the immediate search query in state and keep the original collection unchanged.',
    'Choose a matching rule, such as lowercasing both the query and searchable text.',
    'Derive the filtered items during rendering. Do not replace the original list and lose items needed for the next query.',
    'Render stable keys and an explicit empty result. Debounce remote requests only if this is a server-backed search.',
  ]);
model([187], 'Page changes invalidate old requests',
  ['Page number', 'Request', 'Current result', 'Navigation'], [
    'Keep the selected page and page size as explicit query inputs. Reset the page when a new filter changes the result set.',
    'Start the request and identify it with the current page. Cancel or ignore the previous request during a page change.',
    'Apply only the current response, with loading, error and empty states. Read the server’s total or next-page indicator.',
    'Disable unavailable navigation and retry failures without silently advancing the page.',
  ]);
model([189], 'An accessible modal owns focus while open',
  ['Open control', 'Dialog', 'Keyboard', 'Close / restore'], [
    'Remember the trigger and open the dialog. A portal can change placement but does not implement modal behavior by itself.',
    'Give the dialog a name and move focus into it. Prevent background interaction and keep focus within the modal.',
    'Handle Escape and deliberate close controls. Remove manually attached listeners when the dialog closes.',
    'Restore focus to a sensible trigger when closing. Review keyboard behavior rather than relying only on overlay styling.',
  ]);
model([190], 'One active ID controls an accordion',
  ['Active ID', 'Header click', 'Next active ID', 'Panels'], [
    'Store one active panel ID, or null when all panels are closed, instead of independent booleans for every panel.',
    'A header button reports its panel ID and exposes aria-expanded plus the relevant panel relationship.',
    'Clicking a different header selects that ID; clicking the active one may clear it if collapsing all is allowed.',
    'Derive each panel’s visibility from the shared ID, ensuring at most one is open.',
  ]);
model([191], 'A timer needs one owner and cleanup',
  ['Start', 'Clock ticks', 'Remaining time', 'Pause / reset'], [
    'Start one timer when the running state becomes true. Do not allocate an interval during render.',
    'Use a functional update or derive remaining time from a deadline to avoid a stale closure and cumulative timing drift.',
    'Clamp the display at zero and stop the timer when the countdown ends.',
    'Pause and reset clear the owned timer; unmount cleanup does the same. A timer handle belongs in a ref when it is not display state.',
  ]);
model([192], 'Persist a theme without trusting storage blindly',
  ['Initial choice', 'Theme state', 'Apply theme', 'Persist'], [
    'Read a valid saved preference when browser storage is available, with a deliberate fallback and server-rendering strategy.',
    'The toggle updates a single theme state value rather than separately updating conflicting class and state variables.',
    'Apply the selected theme to the appropriate root attribute or class.',
    'Persist the value with failure handling because storage can be unavailable. Avoid server/client initial markup mismatches.',
  ]);
model([193], 'Rating is a discrete accessible choice',
  ['Current rating', 'Choose star', 'Next rating', 'Announce'], [
    'Store the selected integer rating independently of a temporary hover preview.',
    'Use accessible buttons or a radio-group pattern, with meaningful labels for each rating.',
    'Clicking or keyboard selection commits the new rating; hover alone should not silently submit a value.',
    'Expose the selected state and support keyboard operation. Decorative star glyphs should not obscure the control’s name.',
  ]);
model([195], 'Cart totals are derived from line items',
  ['Product ID', 'Quantity change', 'Next items', 'Derived total'], [
    'Identify each cart line with a stable product or variant ID and store the quantity explicitly.',
    'Apply add, decrement and remove operations immutably, with clear rules for zero or invalid quantities.',
    'The next items array is the source of truth; avoid keeping a separately updated total that can drift.',
    'Derive the subtotal from price times quantity. For checkout, the server recalculates trusted prices and validates inventory.',
  ]);
model([198], 'Selection is a set of stable IDs',
  ['Selected IDs', 'One toggle', 'Select all', 'Derived state'], [
    'Represent selected items by their stable IDs, not by their current visual index.',
    'Toggle one ID by creating a new Set or array so state identity changes.',
    'Define whether select-all means all data or only filtered visible items, then add or remove those IDs consistently.',
    'Derive checked and indeterminate states from the selected count in that scope. Do not maintain a separate allSelected boolean that can become stale.',
  ]);
model([199], 'Toasts are temporary records with IDs',
  ['Notify API', 'Toast record', 'Visible region', 'Dismiss'], [
    'A provider owns the toast collection and exposes a notify function to consumers.',
    'Create a stable ID and a message for each toast so overlapping notifications can be removed independently.',
    'Render an appropriate live region, with a deliberate announcement priority and accessible dismiss control.',
    'Remove the matching toast on dismissal or timeout and clear owned timers during cleanup. Do not let a stale timer remove a different notification.',
  ]);

export function interviewVisual(question) {
  const id = Number(question.id ?? question.number);
  const animation = models[id];
  if (!animation) throw new Error(`No interview visual for question ${id}`);
  return animation;
}

export const interviewVisualCoverage = Object.keys(models).map(Number).sort((a, b) => a - b);

// Clarifications correct common simplifications without silently changing the source transcript.
export const interviewClarifications = {
  3: { text: 'className and htmlFor reflect React DOM property naming; saying they exist only because class and for are reserved words is an incomplete explanation. JSX is transformed before browser execution.', url: 'https://react.dev/learn/writing-markup-with-jsx' },
  5: { text: 'A virtual DOM is a useful description of React’s in-memory UI representation, not a literal copy of every browser DOM property. React does not guarantee the globally minimal edit sequence.', url: 'https://react.dev/learn/render-and-commit' },
  6: { text: 'DOM writes do not all trigger immediate layout. Browser layout and paint scheduling, and what code reads afterward, affect their cost; React also has rendering and reconciliation costs.', url: 'https://react.dev/learn/render-and-commit' },
  8: { text: 'A transition does not make the synchronous filter call itself interruptible. It marks React updates as non-urgent; heavy non-React computation may still need a worker or a different algorithm. The PDF excerpt updates filtered state but does not render that list; add a result list to observe the filtering.', url: 'https://react.dev/reference/react/useTransition' },
  30: { text: 'React 19 removes React’s propTypes checking for function components. Use TypeScript or another static checker for developer contracts and runtime validation for untrusted data.', url: 'https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops' },
  55: { text: 'A setter schedules a state update and returns no Promise. The current render’s state variable remains a snapshot; “asynchronous” alone does not explain batching or commit timing.', url: 'https://react.dev/reference/react/useState' },
  83: { text: 'Transition callbacks run immediately. Expensive synchronous JavaScript inside the callback still runs on the main thread; the React rendering work caused by the update can be interruptible.', url: 'https://react.dev/reference/react/useTransition' },
  87: { text: 'use is a React API with special rules: it can read a supported resource conditionally, but must still be called in a component or Hook. Promise identity must be cached/reused; do not create an uncached Promise on every render.', url: 'https://react.dev/reference/react/use' },
  137: { text: 'Effect Events read the latest committed values, but they are not general-purpose stable callbacks. Keep them local to Effect logic and do not use them to suppress genuine dependencies.', url: 'https://react.dev/reference/react/useEffectEvent' },
  138: { text: 'Activity preserves state while hidden and cleans up Effects. Hidden children may still render at lower priority when props change; hiding is not a guarantee of zero work.', url: 'https://react.dev/reference/react/Activity' },
  159: { text: 'A protected client route improves navigation and presentation. The server must independently authorize every protected request.', url: 'https://react.dev/reference/rsc/use-server#security-considerations' },
  189: { text: 'Escape-to-close and a portal are only part of a modal. A production dialog also needs an accessible name, focus containment, background inertness and focus restoration.', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' },
};

export function interviewNotes(question) {
  const note = interviewClarifications[Number(question.id ?? question.number)];
  return note ? [note] : [];
}
