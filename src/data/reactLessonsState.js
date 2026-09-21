import { lesson } from "./reactLessonSchema.js";

export const stateLessons = {
  "state-and-events--handling-events": lesson(
    "Event handlers respond to a specific user action. Pass a function to React so it can call that function when the event occurs, rather than executing the action during rendering.",
    [
      "React event props use camelCase names such as onClick and onChange. A handler receives an event with details about the interaction and the current target.",
      "Use an arrow function when you need to pass an argument. onClick={() => select(id)} defers the call; onClick={select(id)} calls select immediately.",
      "preventDefault stops a browser default, such as form navigation. stopPropagation stops propagation through the event tree; these operations solve different problems.",
    ],
    `export default function Enrollment() {
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.alert('Enrolled: ' + data.get('name'));
  }
  return <form onSubmit={handleSubmit}>
    <label>Name <input name="name" required /></label>
    <button type="submit">Enroll</button>
  </form>;
}`,
    "Submitting by button or Enter invokes the same form handler. The browser checks required first. preventDefault keeps the page in place, and FormData reads the named field.",
    ["User submits", "Handler reads event", "Action runs"],
    'A button inside a form submits by default. Set type="button" for controls that only add a row or open a preview.',
    "Why attach saving to onSubmit rather than only to the button’s onClick?",
    "onSubmit handles keyboard submission and the form’s semantics as well as the button. A click-only implementation can miss other valid submission paths.",
    "https://react.dev/learn/responding-to-events",
  ),
  "state-and-events--component-state": lesson(
    "State is a component’s memory between renders. Updating it requests a new render, unlike changing an ordinary local variable that is recreated each time the function runs.",
    [
      "useState returns the current value and a setter. Each mounted component instance gets its own state, even if several instances use the same component function.",
      "Choose the smallest useful state representation. Values that can be calculated from existing state or props should usually be derived during rendering.",
      "React preserves state while the same component occupies the same position with the same identity. Unmounting or intentionally changing its key resets it.",
    ],
    `import { useState } from 'react';
export default function LessonCounter() {
  const [completed, setCompleted] = useState(0);
  const remaining = 5 - completed;
  return <section>
    <p>{completed} complete · {remaining} remaining</p>
    <button disabled={remaining === 0}
      onClick={() => setCompleted(c => Math.min(5, c + 1))}>Complete one</button>
  </section>;
}`,
    "The setter queues the next count, and React recalculates remaining. At five, the button becomes disabled. A second LessonCounter would track its own progress independently.",
    ["Current memory", "Setter queues update", "Next render"],
    "Assigning completed = completed + 1 cannot replace a state setter. Storing remaining separately also creates unnecessary synchronization work.",
    "Add a reset button and explain what it updates.",
    "Call setCompleted(0). remaining is recalculated as five, so it needs no setter or Effect.",
    "https://react.dev/learn/state-a-components-memory",
  ),
  "state-and-events--updating-objects-in-state": lesson(
    "Treat an object in state as read-only. To change a field, create a replacement object and copy every level on the path to the changed value.",
    [
      "The spread operator makes a shallow copy. Nested objects still share references unless you explicitly copy the nested level you are changing.",
      "A functional updater reads the pending previous state. It is useful when a new object must preserve other fields from the latest queued value.",
      "Flatten deeply nested state when frequent updates require many layers of copying. An ID-based model can make ownership and updates easier to follow.",
    ],
    `import { useState } from 'react';
export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Mira', preferences: { weeklyGoal: 3, theme: 'dark' }
  });
  return <button onClick={() => setProfile(previous => ({
    ...previous,
    preferences: { ...previous.preferences, weeklyGoal: previous.preferences.weeklyGoal + 1 }
  }))}>Weekly goal: {profile.preferences.weeklyGoal}</button>;
}`,
    "Both the outer profile and its preferences object are replaced. name and theme are preserved. React receives a new state reference without changing the object used by earlier renders.",
    ["Previous object", "Copy changed path", "New state object"],
    "Copying profile but then assigning next.preferences.weeklyGoal mutates the old nested object too. A shallow copy does not clone the entire object graph.",
    "Update theme without dropping weeklyGoal.",
    'Use setProfile(p => ({ ...p, preferences: { ...p.preferences, theme: "light" } })). Each changed level gets a new object.',
    "https://react.dev/learn/updating-objects-in-state",
  ),
  "state-and-events--updating-arrays-in-state": lesson(
    "Add, remove, or replace array items by creating a new array. Use stable item IDs to describe which item changed and retain references for items that did not change.",
    [
      "Spread appends items, filter removes items, and map replaces selected items. push, splice, reverse, and sort mutate their receiver and should not operate directly on state.",
      "Copying an array does not copy its objects. Updating one item requires a new object for that item as well as a new surrounding array.",
      "Functional updates prevent an operation from depending on an old array captured by an earlier render. Generate IDs when creating items, not while rendering their keys.",
    ],
    `import { useState } from 'react';
export default function Planner() {
  const [courses, setCourses] = useState([
    { id: 'react', title: 'React', complete: false }
  ]);
  function complete(id) {
    setCourses(items => items.map(item =>
      item.id === id ? { ...item, complete: true } : item
    ));
  }
  return <ul>{courses.map(item => <li key={item.id}>
    {item.title} — {item.complete ? 'Done' : 'Pending'}
    <button onClick={() => complete(item.id)}>Complete</button>
  </li>)}</ul>;
}`,
    "map returns a new array. The matching course gets a replacement object, while unrelated courses keep their references. The changed complete field produces the new status text.",
    ["Find item by ID", "Replace matching object", "Render new array"],
    "Using items[0].complete = true mutates existing state even if you later spread the array. Copy the item itself.",
    "Remove a course by ID.",
    "Use setCourses(items => items.filter(item => item.id !== id)). filter returns an array containing only the items to retain.",
    "https://react.dev/learn/updating-arrays-in-state",
  ),
  "state-and-events--lifting-state-up": lesson(
    "When two components must agree on one value, put that value in their closest shared owner. Pass the current value down and pass callbacks that request changes.",
    [
      "A single source of truth avoids duplicate state that drifts between siblings. The owner coordinates changes; children can focus on displaying and reporting interactions.",
      "Lift only the state that must be shared. Unrelated hover or temporary input state can remain local to reduce coupling and unnecessary renders.",
      "Derived values, such as a filtered list, can be calculated in the owner from the shared query rather than stored as a second synchronized state variable.",
    ],
    `import { useState } from 'react';
const courses = ['React', 'CSS', 'JavaScript'];
function Search({ value, onChange }) {
  return <label>Search <input value={value} onChange={e => onChange(e.target.value)} /></label>;
}
function Results({ query }) {
  return <ul>{courses.filter(name => name.toLowerCase().includes(query.toLowerCase()))
    .map(name => <li key={name}>{name}</li>)}</ul>;
}
export default function Catalog() {
  const [query, setQuery] = useState('');
  return <><Search value={query} onChange={setQuery} /><Results query={query} /></>;
}`,
    "Typing in Search calls setQuery owned by Catalog. Catalog renders again and supplies the same new query to both children. Results derives the visible courses without a synchronization Effect.",
    ["Shared parent state", "Value to both children", "Child callback to parent"],
    "Copying a prop into child state often creates two competing sources of truth. Use the prop directly unless an intentionally independent draft is required.",
    "Where should a clear-search button live?",
    'It can be rendered anywhere below the owner. Pass a callback that calls setQuery("") so it changes the same shared value.',
    "https://react.dev/learn/sharing-state-between-components",
  ),
  "state-and-events--controlled-components": lesson(
    "A controlled input displays a value supplied by React state. Every edit reports its next value through onChange, making the parent’s state the source of truth.",
    [
      "Text inputs use value and read event.target.value. Checkboxes use checked and read event.target.checked. Match the property to the control type.",
      "Initialize controlled text values to an empty string rather than undefined. Switching between uncontrolled and controlled modes makes behavior inconsistent.",
      "Use defaultValue for an uncontrolled initial value when you plan to read from the DOM at submission. Changing defaultValue is not the same as controlling each keystroke.",
    ],
    `import { useState } from 'react';
export default function Preferences() {
  const [name, setName] = useState('');
  const [reminders, setReminders] = useState(false);
  return <section>
    <label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
    <label><input type="checkbox" checked={reminders}
      onChange={e => setReminders(e.target.checked)} /> Reminders</label>
    <p>{name || 'Learner'}: reminders {reminders ? 'on' : 'off'}</p>
  </section>;
}`,
    "Each keystroke updates name and immediately changes the preview. The checkbox passes a boolean into state, so the preview and control stay synchronized.",
    ["State value", "Input displays value", "onChange updates state"],
    "Supplying value without onChange creates a read-only input unless that is intentional. Do not read a checkbox’s value when you need its checked status.",
    "How can one button reset both controls?",
    'Call setName("") and setReminders(false). The displayed inputs follow state, so a DOM form reset alone is not the source of truth.',
  ),
  "state-and-events--state-as-a-snapshot": lesson(
    "A render and its event handlers see a fixed snapshot of state. Calling a setter requests a future render; it does not rewrite variables inside the currently running handler.",
    [
      "Several setCount(count + 1) calls in one handler use the same captured count. They request the same replacement value rather than three successive increments.",
      "Functional updaters are queued transformations. React passes each one the pending result of the previous update, allowing deliberate accumulation.",
      "An asynchronous callback also captures the values from the render that created it. Decide whether the operation needs that historical snapshot or a current value.",
    ],
    `import { useState } from 'react';
export default function Snapshot() {
  const [count, setCount] = useState(0);
  function addThree() {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  }
  return <button onClick={addThree}>Count: {count}; add three</button>;
}`,
    "Starting from zero, the updater queue computes 1, then 2, then 3. React displays the final count on the next render. Reading count inside addThree still refers to the original snapshot.",
    ["Snapshot: 0", "Queue: +1, +1, +1", "Next snapshot: 3"],
    "Do not await a state setter as if it returned a completion promise. Derive the next value locally or respond through the next render.",
    "Replace all three updaters with setCount(count + 1). What happens?",
    "A click increases the displayed count by one because all three calls request the same replacement based on that render’s count.",
    "https://react.dev/learn/queueing-a-series-of-state-updates",
  ),
  "react-hooks--rules-of-hooks": lesson(
    "Hooks connect a function component to React features. Call ordinary Hooks at the top level of components or custom Hooks so React can associate their state consistently across renders.",
    [
      "Do not call useState, useEffect, or other ordinary Hooks in loops, conditions, nested callbacks, or after a conditional return. Their order must remain stable.",
      "Custom Hooks begin with use and follow the same rules. They share stateful logic, not a single shared state instance across all callers.",
      "The special React use API has different conditional-call rules; do not generalize that exception to useState or useEffect. Enable the recommended React Hooks lint rules in applications.",
    ],
    `import { useState } from 'react';
export default function Notes({ enabled }) {
  const [text, setText] = useState('');
  if (!enabled) return <p>Notes disabled</p>;
  return <label>Notes <textarea value={text}
    onChange={event => setText(event.target.value)} /></label>;
}`,
    "useState runs regardless of enabled. The component can then choose its output. Toggling enabled changes what appears without changing Hook order within this mounted component.",
    ["Render begins", "Same Hook order", "Conditional output"],
    "Moving useState below the early return makes the Hook count depend on enabled. Put the condition inside an Effect or after Hook declarations instead.",
    "Can a click handler call useState to create a new field?",
    "No. Declare the state during rendering, then call its setter from the handler. For repeated fields, store an array or render child components with their own Hooks.",
    "https://react.dev/reference/rules/rules-of-hooks",
  ),
  "react-hooks--usestate": lesson(
    "useState is the simplest tool for local state. Choose a meaningful initial value, use replacement values for explicit assignments, and use updater functions for changes based on previous state.",
    [
      "The initial argument is used for initialization, not on every update. Pass a function for expensive initial calculation so React can invoke it when initializing the component.",
      "State setters replace values; they do not merge objects automatically. Construct the complete next object when only one field changes.",
      "Initializer and updater functions must be pure. Development StrictMode may call them extra times to detect accidental side effects.",
    ],
    `import { useState } from 'react';
export default function Goal() {
  const [goal, setGoal] = useState(3);
  return <section>
    <p>Weekly goal: {goal}</p>
    <button onClick={() => setGoal(g => g + 1)}>Increase</button>
    <button onClick={() => setGoal(3)}>Reset</button>
  </section>;
}`,
    "Increase derives a new goal from the pending previous value. Reset deliberately replaces it with three. There is no separate reset flag or Effect to coordinate.",
    ["Initialize once", "Queue replacement or updater", "Render next value"],
    "Passing calculateInitial() evaluates it during every render even though React ignores later initial values. Pass calculateInitial when lazy initialization is needed.",
    "Why must an updater avoid making an API request?",
    "React may run it more than once while checking or processing renders. Perform the request in an event handler or appropriate synchronization layer, and keep the updater a pure calculation.",
    "https://react.dev/reference/react/useState",
  ),
  "react-hooks--useeffect": lesson(
    "An Effect synchronizes a component with something outside React, such as a browser API, subscription, or network connection. It is not the default place for derived values or user-event logic.",
    [
      "Effects run after React commits. Their dependencies describe every reactive value used by the setup code, allowing React to resynchronize when those values change.",
      "An omitted dependency array runs after every commit; an empty array declares no reactive dependencies. React compares listed dependencies using Object.is.",
      "If a value can be calculated during rendering, calculate it there. If work is caused by a specific click, put it in that click’s handler rather than an Effect watching a flag.",
    ],
    `import { useEffect, useState } from 'react';
export default function StudyTitle() {
  const [topic, setTopic] = useState('React');
  useEffect(() => {
    const previous = document.title;
    document.title = 'Studying ' + topic;
    return () => { document.title = previous; };
  }, [topic]);
  return <label>Topic <input value={topic} onChange={e => setTopic(e.target.value)} /></label>;
}`,
    "After a commit, the browser tab title reflects topic. Before resynchronizing or unmounting, cleanup restores the prior title. This simple example assumes this component is the sole owner of the title.",
    ["Commit UI", "Synchronize external system", "Resync on dependency change"],
    "Suppressing dependency warnings can leave an Effect using stale data. Restructure the code so dependencies describe what it actually reads.",
    "Should filtering courses from query happen in an Effect?",
    "Usually no. Derive filteredCourses during rendering. An Effect that sets a second state value adds an unnecessary render and synchronization path.",
    "https://react.dev/reference/react/useEffect",
  ),
  "react-hooks--effect-cleanup": lesson(
    "Cleanup reverses the work of an Effect. React runs it before setting up an Effect with changed dependencies and when the component leaves the tree.",
    [
      "Pair subscriptions with unsubscriptions, timers with cancellation, and connections with disconnection. Capture the exact resource created by that Effect invocation.",
      "Cleanup must handle repeated setup safely. StrictMode’s development setup-cleanup-setup cycle is a useful test that each resource has a matching release.",
      "For asynchronous work, cancel supported operations and prevent stale results from committing. Cleanup alone is not a universal cancellation mechanism for arbitrary promises.",
    ],
    `import { useEffect, useState } from 'react';
export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <p>Study time: {seconds}s</p>;
}`,
    "The Effect starts one interval for the mounted timer and clears that exact interval on cleanup. The functional updater reads the latest pending seconds without recreating the timer every second.",
    ["Setup resource", "Use resource", "Release before restart/unmount"],
    "Returning clearInterval(id) runs cancellation immediately and returns no cleanup function. Return () => clearInterval(id) instead.",
    "What happens if cleanup is omitted and this component is repeatedly mounted?",
    "Old intervals continue running and consume resources. Each mount adds another interval even though its previous UI no longer exists.",
    "https://react.dev/learn/synchronizing-with-effects",
  ),
  "react-hooks--useref": lesson(
    "A ref retains a mutable value between renders without requesting a render when it changes. Use it for a DOM handle or bookkeeping that does not determine displayed content.",
    [
      "useRef returns a stable object with a current property. React fills a DOM ref after committing its element and clears it when that element is removed.",
      "Read or update refs in event handlers and Effects for ordinary imperative work. Avoid reading mutable ref values to decide rendering output.",
      "A value that must update the visible UI belongs in state. A timer ID or the element to focus is a good ref candidate because changing it alone need not redraw the screen.",
    ],
    `import { useRef } from 'react';
export default function FocusNotes() {
  const inputRef = useRef(null);
  return <section>
    <label>Notes <input ref={inputRef} /></label>
    <button onClick={() => inputRef.current?.focus()}>Focus notes</button>
  </section>;
}`,
    "After the input mounts, current points to its DOM node. The button handler calls the browser focus method. React still owns the input’s structure; the ref only performs the focused imperative action.",
    ["Commit input", "Ref stores DOM handle", "Event requests focus"],
    "Incrementing ref.current will not update a rendered counter. Use state for the count and a ref only for non-visual bookkeeping.",
    "Would an interval ID belong in state or a ref?",
    "Usually a ref, if event handlers need to cancel it. Its identity is bookkeeping rather than displayed content.",
    "https://react.dev/reference/react/useRef",
  ),
  "react-hooks--usememo": lesson(
    "useMemo can reuse the result of an expensive pure calculation when its dependencies have not changed. Treat it as an optional performance optimization, not as persistent application storage.",
    [
      "Measure before memoizing. A cheap calculation may cost less than the extra dependency tracking and complexity.",
      "List all reactive inputs used by the calculation. A new object created every render can invalidate the cache even if its contents look unchanged.",
      "React may discard cached results. The application must remain correct if the calculation runs again, and the calculation must not perform side effects.",
    ],
    `import { useMemo, useState } from 'react';
export default function SearchableCourses({ courses }) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => courses.filter(course =>
    course.title.toLowerCase().includes(query.toLowerCase())
  ), [courses, query]);
  return <section>
    <label>Search <input value={query} onChange={e => setQuery(e.target.value)} /></label>
    <p>{visible.length} matches</p>
  </section>;
}`,
    "The filter runs when courses or query changes. An unrelated parent render can reuse the array only if both dependency identities remain equal. For a tiny list, the plain filter would usually be simpler.",
    ["Compare dependencies", "Reuse or calculate", "Render result"],
    "Using useMemo to hide a mutation or guarantee a permanent object identity is incorrect. Fix state design first.",
    "Will memoization help when a parent recreates courses on every render?",
    "Not for this dependency: the new array reference invalidates the cache. First determine whether the parent needs to recreate it and whether the calculation is actually costly.",
    "https://react.dev/reference/react/useMemo",
  ),
  "react-hooks--usecallback": lesson(
    "useCallback can preserve a function reference between renders while its dependencies remain equal. It is useful when that identity matters to a memoized child or another Hook.",
    [
      "It caches the function reference, not the result of calling the function. useMemo caches a calculation’s result instead.",
      "Callbacks capture values from the render that created them. Dependencies must include the reactive values they read to avoid stale closures.",
      "A functional state updater can remove the need to read the current state inside a callback. This can reduce dependencies without concealing them.",
    ],
    `import { memo, useCallback, useState } from 'react';
const AddButton = memo(function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add study session</button>;
});
export default function Sessions() {
  const [count, setCount] = useState(0);
  const add = useCallback(() => setCount(c => c + 1), []);
  return <><p>{count} sessions</p><AddButton onAdd={add} /></>;
}`,
    "add stays stable because it does not read changing render values. The memoized child receives the same callback on subsequent parent renders. This tiny example demonstrates identity; it does not establish a measurable speedup.",
    ["Dependency comparison", "Stable function reference", "Memoized consumer"],
    "Wrapping every handler in useCallback adds noise without automatically reducing rendering. It helps only when a consumer benefits from stable identity.",
    "What if add also reads a changing courseId prop?",
    "Include courseId in the dependency array. When it changes, React must provide a callback capturing the new course.",
    "https://react.dev/reference/react/useCallback",
  ),
  "react-hooks--usereducer": lesson(
    "useReducer centralizes related state transitions in a pure function. It is useful when several events update the same structured state and the transition rules deserve explicit names.",
    [
      "A reducer receives the current state and an action, then returns the next state. The action describes what happened rather than directly mutating the state.",
      "dispatch queues an action for React to process. Keep network requests and other side effects outside the reducer so transitions are predictable and independently testable.",
      "Reducers still follow immutable update rules. They do not automatically create a global store; a reducer’s state belongs to the component that calls the Hook.",
    ],
    `import { useReducer } from 'react';
function reducer(state, action) {
  switch (action.type) {
    case 'completed': return { ...state, completed: state.completed + 1 };
    case 'reset': return { completed: 0 };
    default: throw new Error('Unknown action: ' + action.type);
  }
}
export default function Progress() {
  const [state, dispatch] = useReducer(reducer, { completed: 0 });
  return <><p>{state.completed} complete</p>
    <button onClick={() => dispatch({ type: 'completed' })}>Complete</button>
    <button onClick={() => dispatch({ type: 'reset' })}>Reset</button></>;
}`,
    "The event reports completed; the reducer determines its meaning. Reset returns the initial shape. An unknown action fails visibly rather than silently corrupting state.",
    ["Dispatch action", "Pure reducer", "Next state"],
    "Do not mutate state and return it from a reducer. Return a new object for a changed state, and keep action payloads focused.",
    "How would you test the completed transition without rendering React?",
    'Call reducer({ completed: 2 }, { type: "completed" }) and expect { completed: 3 }. Also verify the original object still contains two.',
    "https://react.dev/reference/react/useReducer",
  ),
  "react-hooks--custom-hooks": lesson(
    "A custom Hook packages reusable stateful logic behind a focused API. Components using it share the implementation but each invocation retains its own state and lifecycle.",
    [
      "Start the name with use so callers and tooling recognize Hook rules. Return the minimum values and operations a component needs.",
      "Extract a Hook when the behavior has a meaningful purpose, such as tracking connection status. Avoid vague lifecycle wrappers that hide dependencies.",
      "Each caller owns a separate Hook execution. To share a single state value across components, use a common owner, context, or an external store.",
    ],
    `import { useEffect, useState } from 'react';
function useOnlineStatus() {
  const [online, setOnline] = useState(() => window.navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}
export default function Connection() {
  const online = useOnlineStatus();
  return <p role="status">{online ? 'Network available' : 'Offline'}</p>;
}`,
    "The Hook initializes from the browser and keeps its state synchronized with connectivity events. Cleanup removes both listeners. This is a client-only example; server rendering needs a suitable server snapshot or browser guard.",
    ["Reusable Hook logic", "Independent caller state", "Subscription cleanup"],
    "navigator.onLine is a connectivity hint, not proof that your API is reachable. Still handle request failures.",
    "Do two Connection components share one online state variable?",
    "No. Each Hook call has its own state and listeners. They often display the same value because they observe the same browser events.",
    "https://react.dev/learn/reusing-logic-with-custom-hooks",
  ),
};
