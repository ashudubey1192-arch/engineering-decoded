// Original course examples target the React 19 APIs used by this project.
// Snippets marked as excerpts belong inside the component described in the lesson.
import { stateLessons } from "./reactLessonsState.js";
import { applicationLessons } from "./reactLessonsApplication.js";
import { advancedLessons } from "./reactLessonsAdvanced.js";
import { lesson } from "./reactLessonSchema.js";

export const reactLessons = {
  ...stateLessons,
  ...applicationLessons,
  ...advancedLessons,
  "welcome--course-introduction": lesson(
    "Build a small course planner while learning how React turns data into an interactive interface. By the end, you will be able to design components, manage state, load data, test behavior, and prepare an application for release.",
    [
      "Start with HTML semantics, CSS layout, and JavaScript functions, arrays, objects, imports, and promises. React builds on these skills; JSX does not replace them.",
      "The course follows one recurring domain: courses with stable IDs, titles, and completion status. Begin with static cards, add a filter and completion controls, then introduce remote data and tests.",
      "Work through the lessons in order the first time. For each example, predict the output, run it in a local practice app, change one input, and explain the resulting render. Later chapters identify any extra packages they need.",
    ],
    `export default function App() {
  const course = { id: 'react', title: 'React', complete: false };
  return (
    <main>
      <h1>My course planner</h1>
      <p>{course.title}: {course.complete ? 'Complete' : 'In progress'}</p>
    </main>
  );
}`,
    "Place this component in src/App.jsx in the practice project. The page shows React: In progress. Change complete to true and the displayed status changes without writing a DOM update command.",
    ["Static course card", "Interactive planner", "Tested application"],
    "Do not begin by adding a global store, a router, and a component library. Introduce each dependency when a concrete requirement appears.",
    "Add a second course and describe which parts of the markup should become reusable.",
    "A CourseCard can receive each course through props. The page owns the collection; each card describes one item. The same component can render different titles and statuses.",
  ),
  "welcome--react-learning-roadmap": lesson(
    "Learn React as a sequence of capabilities: describe a screen, make it interactive, coordinate components, connect external systems, and verify the complete experience.",
    [
      "Foundations cover rendering, JSX, props, and composition. A useful checkpoint is a reusable card that has no hidden dependencies on its parent.",
      "State and Hooks introduce user interactions and synchronization. Before advancing, explain why a state update schedules a render and why an Effect needs cleanup.",
      "Routing, data, performance, testing, and production build on those models. You are ready to optimize only when you can reproduce and measure a real issue.",
    ],
    `const milestones = [
  { id: 'ui', title: 'Render a course list' },
  { id: 'state', title: 'Filter and complete courses' },
  { id: 'data', title: 'Load and save a planner' },
  { id: 'quality', title: 'Test and deploy' },
];

export default function Roadmap() {
  return <ol>{milestones.map(step => <li key={step.id}>{step.title}</li>)}</ol>;
}`,
    "The list makes the learning sequence visible. After each milestone, keep a working version of the planner. Revisit earlier code as you learn better state ownership or error handling instead of repeatedly starting over.",
    ["Describe UI", "Model interactions", "Deliver reliably"],
    "Memorizing Hook names without understanding rendering makes advanced topics harder. Use a working feature as evidence of understanding.",
    "What should you understand before learning useMemo?",
    "First understand pure rendering, state updates, reference identity, and how to profile a slow calculation. Memoization is a performance tool, not a way to make incorrect state logic work.",
  ),
  "welcome--project-setup": lesson(
    "Create an isolated practice application so you can edit and run every introductory example. This course uses a Vite client application; routing, server rendering, and server components require additional choices later.",
    [
      "Install a Node.js version supported by the current Vite release and use its bundled npm. Check the Vite getting-started page for current runtime requirements.",
      "The React template provides JSX transformation, a development server, and a production build. The development server is a local editing tool; it is not the production host.",
      "Keep the lockfile in version control so teammates and CI resolve the same dependency versions. Read package.json to understand scripts before running them.",
    ],
    `# Terminal: create a NEW practice folder
npm create vite@latest react-planner -- --template react
cd react-planner
npm install
npm run dev

# Later, verify the production output
npm run build
npm run preview`,
    "Open the local URL printed by Vite. Edit src/App.jsx and confirm the browser refreshes. Build creates a dist directory; preview serves that build locally so you can check behavior without the development server.",
    ["Source files", "Vite transformation", "Browser preview"],
    "Do not run the scaffolding command inside an existing application you want to keep. Frontend environment variables are public build inputs, so they cannot hold secret credentials.",
    "Why test both npm run dev and npm run build?",
    "Development prioritizes rapid feedback. A production build bundles and optimizes the app and can reveal import or build configuration failures that an unvisited development route never exposed.",
    "https://vite.dev/guide/",
  ),
  "react-foundations--what-is-react": lesson(
    "React is a library for describing user interfaces with components. A component combines a rendering function with inputs, and React coordinates updates when those inputs or its state change.",
    [
      "A component is a reusable unit of UI, such as a course card or search box. Capitalized JSX names refer to components; lowercase names refer to built-in browser elements.",
      "Rendering calculates a description of the desired interface. React then commits necessary changes to the host environment, such as the browser DOM.",
      "React does not supply every application feature. Routing, deployment, data caching, and server rendering belong to additional libraries, frameworks, or infrastructure.",
    ],
    `function CourseCard({ title }) {
  return <article><h2>{title}</h2><p>Ready to learn</p></article>;
}

export default function App() {
  return <main><CourseCard title="React" /><CourseCard title="CSS" /></main>;
}`,
    "React calls CourseCard for each occurrence with different props. The two articles share an implementation but receive separate inputs. Editing the component updates the structure of both cards.",
    ["Component + inputs", "Element description", "DOM update"],
    "Do not treat a component as an HTML string or manually call it like an ordinary helper in JSX. Render it with a JSX tag so React manages its identity.",
    "Does using React automatically give an application client-side routes?",
    "No. React provides the UI model. A router or framework maps URLs to components and manages navigation.",
  ),
  "react-foundations--creating-a-react-application": lesson(
    "Connect a component tree to a browser container using createRoot. A client-rendered application usually creates one root and lets React manage the DOM within it.",
    [
      'The HTML entry contains a container such as <div id="root"></div>. A JavaScript module finds that element and passes it to createRoot from react-dom/client.',
      "root.render describes the initial tree. Later state updates cause React to render again; application event handlers should not repeatedly create roots.",
      "StrictMode enables additional development checks, including extra rendering and Effect setup/cleanup cycles. These checks expose impurities; they do not mean production always runs Effects twice.",
    ],
    `// src/main.jsx; index.html contains <div id="root"></div>
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);`,
    "The module imports the application and its styles, creates a root, then renders App. If the container ID differs from root, initialization fails before the page can show the component.",
    ["HTML container", "createRoot", "App component tree"],
    "Use hydrateRoot when attaching to matching server-rendered React HTML. createRoot is for a client root and can replace existing contents.",
    "Where should a second card be added: another root or inside App?",
    "Inside App for a normal single application. Multiple roots are useful for independently embedded widgets, not for every reusable component.",
    "https://react.dev/reference/react-dom/client/createRoot",
  ),
  "react-foundations--react-project-structure": lesson(
    "Organize files around clear responsibilities so a feature can grow without becoming a collection of unrelated imports. Begin small and separate code when there is a reason to reuse or maintain it independently.",
    [
      "The entry module initializes React; App assembles the screen. A component module exports a UI unit and may import its own CSS.",
      "Feature folders keep related components, data access, and tests near one another. Shared components should be generic enough that multiple features can use them without importing feature-specific state.",
      "Static public assets are copied as files, while assets imported from source participate in the bundler pipeline. Keep runtime secrets on the server regardless of folder names.",
    ],
    `src/
  main.jsx
  App.jsx
  features/
    courses/
      CourseList.jsx
      CourseCard.jsx
      coursesApi.js
      CourseList.test.jsx
  components/
    Button.jsx
  styles/
    tokens.css`,
    "CourseList can import CourseCard from the same feature, while both use shared visual tokens. coursesApi.js contains network details; a presentational card only receives data and callbacks.",
    ["Entry point", "Feature modules", "Shared primitives"],
    "Avoid a single components folder containing hundreds of unrelated files, and avoid creating deep folder hierarchies for a one-screen prototype.",
    "Where would a course-specific enrollment request belong?",
    "In the course feature or its data layer. A generic Button should receive onClick rather than importing the enrollment API.",
  ),
  "react-foundations--rendering-elements": lesson(
    "A React element is a description of what should appear, not a DOM node that you update directly. Rendering a component produces elements that React uses to reconcile the visible tree.",
    [
      "JSX evaluates to React element descriptions. Treat them as immutable values: create a new description when data changes instead of editing an element object.",
      "A render can run without changing the DOM when the output is equivalent. Keep rendering pure so React can safely repeat or interrupt the calculation.",
      "State is associated with a component position and identity in the tree. Replacing the type or changing a key can cause a subtree to reset.",
    ],
    `function Status({ complete }) {
  const label = complete ? 'Completed' : 'Keep learning';
  return <p className="status">{label}</p>;
}

export default function App() {
  return <Status complete={true} />;
}`,
    "Status computes a paragraph containing Completed. If its parent later passes false, React computes the new output and updates the text. Your rendering code never queries or rewrites that paragraph.",
    ["Render function", "Compare descriptions", "Commit changes"],
    "Avoid network requests, DOM mutations, or state updates performed unconditionally during rendering. Rendering describes UI; event handlers and Effects handle work at the appropriate time.",
    "If a component renders again, must every DOM node be recreated?",
    "No. React reconciles the descriptions and can reuse existing DOM nodes, applying only the changes needed for the committed output.",
    "https://react.dev/learn/render-and-commit",
  ),
  "react-foundations--declarative-ui": lesson(
    "Declarative UI describes what the screen should look like for a given state. Instead of coordinating individual DOM edits, model the state and derive the visible content from it.",
    [
      "Choose state values that express meaningful conditions. A status such as idle, saving, or saved can be clearer than several booleans that allow impossible combinations.",
      "Derive text, disabled controls, and visibility from the same state. This keeps different parts of the screen consistent when the underlying state changes.",
      "User events request a state transition. React reruns the rendering function to compute the new interface; the handler does not need to know which text node changed.",
    ],
    `import { useState } from 'react';

export default function Completion() {
  const [complete, setComplete] = useState(false);
  return (
    <section>
      <p>{complete ? 'Course complete' : 'Course in progress'}</p>
      <button onClick={() => setComplete(value => !value)}>
        {complete ? 'Mark incomplete' : 'Mark complete'}
      </button>
    </section>
  );
}`,
    "One boolean determines both the status and the button label. Clicking toggles that value, producing a consistent new view. No separately stored label can drift out of sync.",
    ["User event", "State transition", "Derived interface"],
    "Storing both complete and a separate statusLabel creates redundant state. Compute the label from complete during rendering.",
    "Add a badge without adding another state variable.",
    "Render a badge conditionally from complete, for example complete ? <span>Done</span> : null. It will stay synchronized with the existing status.",
  ),
  "react-foundations--react-developer-tools": lesson(
    "React Developer Tools exposes the component tree and profiling information that ordinary DOM inspection cannot explain. Use it to connect visible behavior to the props and state that produced it.",
    [
      "The Components panel shows React ownership and inputs. Browser Elements shows the resulting DOM; the two trees answer different questions.",
      "Select a component, inspect its props and Hook values, then trigger an interaction. Track the nearest owner of a value instead of guessing which child changed it.",
      "The Profiler records commits and component rendering cost. Development checks and extensions add overhead, so use traces to locate candidates and confirm improvements under representative conditions.",
    ],
    `import { useState } from 'react';

export default function InspectableCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}`,
    "Find InspectableCounter in Components, click its button, and observe the state increase. Record a short profiling session around the same click and locate the commit. Compare the state change with the DOM text change.",
    ["Select component", "Inspect inputs", "Record interaction"],
    "Console logging alone can be misleading under StrictMode. A render log is not proof that React committed a visible DOM change.",
    "The label is wrong but the DOM matches the rendered text. What should you inspect next?",
    "Inspect the component props and state, then trace their owner. The defect is likely in the data or rendering expression rather than the browser DOM.",
    "https://react.dev/learn/react-developer-tools",
  ),
  "jsx-and-components--understanding-jsx": lesson(
    "JSX is a syntax extension that lets JavaScript describe nested UI. It resembles HTML, but expressions, attributes, and component names follow JavaScript and React rules.",
    [
      "Use braces for JavaScript expressions, such as a property lookup, a calculation, or a conditional expression. Statements such as if and for belong outside the returned JSX.",
      "Return one enclosing element or a Fragment. Close every tag, use className for CSS classes, and use htmlFor to associate a label with an input.",
      "Strings rendered as text are escaped by React. An object is not directly renderable as a child; select one of its properties or map a collection into elements.",
    ],
    `export default function CourseSummary() {
  const course = { title: 'React', lessons: 62 };
  return (
    <>
      <h2 className="courseTitle">{course.title}</h2>
      <p>{course.lessons} lessons</p>
      <label htmlFor="notes">Your notes</label>
      <input id="notes" placeholder="What did you learn?" />
    </>
  );
}`,
    "The Fragment groups four siblings without creating another DOM wrapper. Braces read course properties, while quoted attributes supply literal strings. The label points to the input through a matching ID.",
    ["JSX source", "JavaScript expressions", "Element tree"],
    'Writing title="course.title" passes literal text. Use title={course.title} to evaluate the property. Render {course.title}, not the entire course object.',
    "How would you display twice the number of lessons?",
    "Use {course.lessons * 2} in a text position. JSX braces accept the multiplication expression and React renders the resulting number.",
    "https://react.dev/learn/writing-markup-with-jsx",
  ),
  "jsx-and-components--functional-components": lesson(
    "A function component receives props and returns renderable output. Its job is to describe a small, coherent part of the interface while staying pure during rendering.",
    [
      "Name components with an initial capital and define them at module scope. React uses component type and position to associate state with a tree location.",
      "A component can return an element, a Fragment, text, or null. null deliberately displays nothing while keeping the component itself in the React tree.",
      "Use props to make reusable behavior explicit. A focused CourseCard is easier to compose and test than a large component that reads unrelated global values.",
    ],
    `function CourseCard({ title, description }) {
  return <article><h2>{title}</h2><p>{description}</p></article>;
}

export default function Catalog() {
  return <CourseCard title="React" description="Build interactive interfaces" />;
}`,
    "Catalog supplies two named inputs. CourseCard destructures them and renders semantic markup. Rendering the card again with the same inputs should produce the same description without modifying external data.",
    ["Props in", "Pure component", "UI out"],
    "Defining CourseCard inside Catalog creates a new component type on each render and can reset child state. Define reusable component functions at module scope.",
    "Make CourseCard render nothing when its title is missing.",
    "Add if (!title) return null before the normal return. If the component later uses Hooks, keep those Hook calls before any conditional return.",
    "https://react.dev/learn/your-first-component",
  ),
  "jsx-and-components--props": lesson(
    "Props carry information from a parent to a child. They are read-only snapshots for a render and may contain strings, objects, JSX, or callback functions.",
    [
      "Destructure named props in a component parameter. Default values apply when a prop is missing or undefined, not when it is explicitly null.",
      "A child must not mutate a prop or a nested object received through it. Ask the owner to change state by calling a supplied callback.",
      "React reserves key for reconciliation; it is not passed through as a normal prop. Pass an explicit id when a child needs to read an identifier.",
    ],
    `function CourseCard({ title, level = 'Beginner', onSelect }) {
  return (
    <article>
      <h2>{title}</h2><p>{level}</p>
      <button onClick={onSelect}>Select course</button>
    </article>
  );
}

export default function App() {
  return <CourseCard title="React" onSelect={() => window.alert('React selected')} />;
}`,
    "The card shows Beginner because level is omitted. Selecting the button invokes the callback provided by App. The card does not need to know whether selection eventually opens a dialog or changes a route.",
    ["Parent owns data", "Props go down", "Callbacks report intent"],
    "Do not assign to props.title or push into a received array. Mutations make state ownership unclear and can prevent expected updates.",
    "How can a card request deletion without owning the list?",
    "Accept onDelete and call it with the card ID. The parent updates its list state and passes the resulting data back down.",
    "https://react.dev/learn/passing-props-to-a-component",
  ),
  "jsx-and-components--component-composition": lesson(
    "Composition builds larger interfaces by nesting smaller components. A wrapper can provide structure and styling while its caller supplies the content through children or named JSX props.",
    [
      "children represents the nested content between a component’s opening and closing tags. It lets a layout component stay independent of domain details.",
      "Named slots, such as actions or footer, make multiple placement areas explicit. Use them when one children area would require the wrapper to guess the meaning of its content.",
      "Prefer a small reusable structure over a component with many unrelated boolean modes. Composition keeps the allowed combinations visible at the call site.",
    ],
    `function Panel({ title, children, actions }) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
      <footer>{actions}</footer>
    </section>
  );
}

export default function App() {
  return <Panel title="Study plan" actions={<a href="#notes">View notes</a>}>
    <p>Finish the props lesson today.</p>
  </Panel>;
}`,
    "Panel places the paragraph in its content area and the link in its footer. It can also host a form or list without knowing how those elements work.",
    ["Caller supplies content", "Panel defines placement", "Composed screen"],
    "A wrapper should not assume children is an array or inspect child types to infer behavior. Prefer explicit props when placement needs to be controlled.",
    "Reuse Panel for a warning without adding an isWarningContent prop.",
    "Pass a warning heading and a paragraph or alert component as children. If styling differs, a small explicit variant prop can control appearance without hardcoding the content.",
  ),
  "jsx-and-components--conditional-rendering": lesson(
    "Use ordinary JavaScript conditions to choose which elements appear. A clear conditional expresses application state and should make empty, pending, and successful outcomes intentional.",
    [
      "Use an early return for substantially different screens, a ternary for two inline alternatives, and a boolean && expression when an element is optional.",
      "React renders numbers, including zero. An expression such as count && <Badge /> can display 0 when count is zero; compare explicitly with count > 0.",
      "Conditionally removing a component removes its local state. Hiding it with CSS leaves it mounted; choose deliberately when preserving input matters.",
    ],
    `export default function CourseStatus({ loading = false, count = 0 }) {
  if (loading) return <p role="status">Loading courses…</p>;
  return (
    <section>
      <h2>{count > 0 ? 'Your courses' : 'No courses yet'}</h2>
      {count > 0 && <p>{count} courses available</p>}
    </section>
  );
}`,
    "With loading true, only the status appears. With loading false and count zero, the empty heading appears with no stray zero. A positive count adds the paragraph.",
    ["Check loading", "Evaluate count", "Render matching branch"],
    "Do not call Hooks only in one branch. Hooks must run consistently before early returns in components that use them.",
    "Why might a form lose its draft when a details panel is toggled off?",
    "If conditional rendering removes the form, its local state is discarded. Lift the draft to a surviving parent when the product requires preserving it.",
  ),
  "jsx-and-components--rendering-lists-and-keys": lesson(
    "Transform collections with map and give each sibling a stable key. Keys help React match an item’s identity across insertions, deletions, and reordering.",
    [
      "Choose a stable domain identifier, such as a database ID. Keys only need to be unique among siblings, but they must continue to identify the same item between renders.",
      "Place key on the outermost element returned by map. If a mapped item needs several siblings, use a keyed Fragment rather than the shorthand Fragment syntax.",
      "Filtering and sorting are normal JavaScript operations. Copy an array before sorting if it came from props or state, because sort mutates its receiver.",
    ],
    `const courses = [
  { id: 'react', title: 'React' },
  { id: 'css', title: 'CSS' },
];

export default function CourseList() {
  return <ul>{courses.map(course => (
    <li key={course.id}>
      <label>{course.title} <input placeholder="Personal note" /></label>
    </li>
  ))}</ul>;
}`,
    "Each input belongs to the course identified by its key. If courses are reordered, React can retain the correct input with the matching item rather than associating it with an old array position.",
    ["Stable course ID", "Match previous item", "Preserve correct state"],
    "Array indexes can associate state with the wrong item after reordering. Random keys force remounts on every render. Neither is a substitute for stable identity.",
    "A new course is inserted first. Why is its index a poor key?",
    "Every following index shifts. React may reuse an existing component and its input state for a different course, because the position-based key now identifies different data.",
    "https://react.dev/learn/rendering-lists",
  ),
};
