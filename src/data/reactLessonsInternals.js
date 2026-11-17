// Under the hood and class-era patterns. Each lesson keeps the shared schema and adds
// `deepDive` sections plus an `animation` script for the animated walkthrough.
import { lesson } from "./reactLessonSchema.js";

const detailed = (base, extra) => ({ ...base, ...extra });

export const internalsLessons = {
  "under-the-hood--react-without-a-build-tool": detailed(
    lesson(
      "Before reaching for a bundler, it helps to see React running from a single HTML file. Loading React straight from a CDN shows exactly what the library does on its own: create element objects and hand them to a root that owns one DOM container.",
      [
        "React is split into two packages. react creates elements and runs components and Hooks; react-dom/client knows how to turn those elements into browser DOM. A CDN page loads both, just as an installed project imports both.",
        'React 19 no longer publishes the old UMD files that attached a global React to window. In a no-build page you import ES modules from a CDN that serves npm packages as modules, such as esm.sh, inside a script with type="module".',
        "Without a build step there is no JSX compiler, so you call createElement(type, props, ...children) yourself. Doing this once by hand makes it obvious that JSX is only a nicer way to write these calls.",
      ],
      `<!-- index.html: open with any static file server -->
<!doctype html>
<html lang="en">
  <body>
    <div id="root"></div>
    <script type="module">
      import { createElement as h } from "https://esm.sh/react@19";
      import { createRoot } from "https://esm.sh/react-dom@19/client";

      const heading = h("h1", { id: "title" }, "Namaste from React");
      const list = h("ul", null,
        h("li", { key: "a" }, "No bundler"),
        h("li", { key: "b" }, "No JSX compiler"),
      );
      const app = h("main", null, heading, list);

      createRoot(document.getElementById("root")).render(app);
    </script>
  </body>
</html>`,
      "The browser downloads both modules, the script builds three nested element objects, and root.render commits them into the empty div. Anything already inside #root is replaced. Open the console and log heading: it is a plain object with type, props, and key, not a DOM node.",
      ["createElement objects", "createRoot(container)", "root.render → DOM"],
      "Opening the file with file:// can block module imports in some browsers. Serve the folder with a small static server instead, and pin a major version in the CDN URL so the page does not change underneath you.",
      'If you add a second <div id="sidebar"> outside #root, can React change it?',
      "Not through this root. A root only manages the container it was created for. You could create a second root for the sidebar, but most applications use one root and render everything inside it.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Why a CDN page is a learning tool, not a production setup",
          paragraphs: [
            "Every visitor's browser has to fetch React from the CDN and resolve imports at runtime. There is no minification of your own code, no tree shaking, no cache-busting file names, and no compile-time error checking. The page works, but each improvement a real app needs would have to be added by hand.",
            "That gap is exactly what bundlers and package managers fill. Keep this page around as a reference: when a build tool behaves unexpectedly, remembering that the end result is still createElement calls and a root render makes debugging much calmer.",
          ],
        },
        {
          heading: "Elements are cheap descriptions",
          points: [
            "An element is immutable once created. To show something different you create new elements and render again.",
            "Calling root.render a second time with a new tree updates the existing DOM where possible instead of rebuilding it.",
            "The key prop is reserved for React and never appears in props, which is why the list items above pass it separately from text.",
          ],
          code: `const first = h("p", null, "Count: 1");
root.render(first);

// Later: React compares the new description with the old one
// and only changes the text node inside the existing <p>.
root.render(h("p", null, "Count: 2"));`,
        },
      ],
      animation: {
        title: "From script tag to pixels",
        nodes: [
          { id: "cdn", label: "CDN", sub: "react, react-dom" },
          { id: "script", label: "Module script", sub: "createElement" },
          { id: "elements", label: "Element tree", sub: "plain objects" },
          { id: "root", label: "Root", sub: "#root container" },
          { id: "dom", label: "Browser DOM", sub: "visible page" },
        ],
        steps: [
          {
            from: "cdn",
            to: "script",
            label: "import",
            note: "The module script imports react and react-dom/client from the CDN.",
          },
          {
            from: "script",
            to: "elements",
            label: "h()",
            note: "createElement calls build a nested tree of element objects.",
          },
          {
            from: "elements",
            to: "root",
            label: "render",
            note: "root.render receives the tree that describes the screen.",
          },
          {
            from: "root",
            to: "dom",
            label: "commit",
            note: "React creates DOM nodes for the tree and inserts them into #root.",
          },
          {
            from: "dom",
            to: "root",
            label: "update",
            note: "A later render sends a new tree; React patches only what changed.",
          },
        ],
      },
    },
  ),

  "under-the-hood--npm-bundlers-and-babel": detailed(
    lesson(
      "Real React projects are assembled from hundreds of packages and modern syntax that browsers cannot run directly. npm manages those packages, a transpiler rewrites JSX and newer syntax, and a bundler turns the whole dependency graph into a few optimized files.",
      [
        "npm reads package.json to know what the project needs. dependencies ship with the app, devDependencies are only for building and testing. The lockfile records the exact resolved versions so every machine installs the same tree.",
        "A transpiler such as Babel, SWC, esbuild, or Oxc parses source code and prints equivalent code a browser understands. Converting JSX into function calls is one of its jobs; downlevelling newer syntax for older browsers is another.",
        "A bundler such as Vite, Parcel, or webpack starts at an entry file, follows every import, and builds a dependency graph. For production it minifies, removes unused exports, splits code into chunks, and gives each file a content hash for long-term caching.",
      ],
      `{
  "name": "food-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0"
  }
}`,
      "npm install reads this manifest, resolves every version range, writes node_modules, and records the result in package-lock.json. npm run dev starts a dev server that transforms files on request; npm run build produces the optimized dist folder that you actually deploy.",
      ["package.json + lockfile", "Transpile + bundle", "Hashed dist files"],
      "Never commit node_modules. It is large, platform specific, and fully reproducible from package.json plus the lockfile. Do commit the lockfile, or teammates and CI may install different versions.",
      "Your teammate's build fails but yours works with the same package.json. What is the first thing to check?",
      "Whether both of you installed from the same committed lockfile. A caret range like ^19.2.0 allows newer minor and patch versions, so without the lockfile two installs can resolve different packages. Run npm ci in CI to install exactly what the lockfile says.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Reading version ranges",
          points: [
            "^19.2.0 accepts any 19.x.y release at or above 19.2.0, but never 20.0.0.",
            "~19.2.0 accepts patch releases only: 19.2.1 yes, 19.3.0 no.",
            "19.2.0 with no prefix pins one exact version.",
            "npx runs a package binary without installing it globally, which is handy for scaffolding tools.",
          ],
        },
        {
          heading: "What the bundler does that you would otherwise do by hand",
          paragraphs: [
            "During development, Vite serves each module separately and uses Hot Module Replacement so an edit swaps just the changed module while component state survives where possible. Parcel offers a similar experience with zero configuration, which is why it is popular for learning setups.",
            "For production the priorities flip from fast feedback to small, cacheable output. The bundler minifies names and whitespace, tree shakes exports nobody imports, compresses images it knows about, and emits files such as index-4f9a1c.js. Because the hash changes only when the content changes, servers can cache those files for a year.",
          ],
          code: `# Parcel: zero-config bundling for a quick practice app
npm install -D parcel
npx parcel index.html        # dev server with HMR
npx parcel build index.html  # optimized dist/ output`,
        },
        {
          heading: "Browser support is a build input",
          paragraphs: [
            "Transpilers decide how far to downlevel syntax using a target list, often written as a browserslist entry in package.json. Supporting very old browsers adds code size, so pick targets from your real audience rather than defaulting to everything.",
          ],
        },
      ],
      animation: {
        title: "How a build turns source into deployable files",
        nodes: [
          { id: "src", label: "src/*.jsx", sub: "your code" },
          { id: "npm", label: "node_modules", sub: "packages" },
          { id: "graph", label: "Dependency graph", sub: "imports followed" },
          { id: "transpile", label: "Transpiler", sub: "JSX → JS" },
          { id: "optimize", label: "Optimizer", sub: "minify, shake" },
          { id: "dist", label: "dist/", sub: "hashed chunks" },
        ],
        steps: [
          {
            from: "src",
            to: "graph",
            label: "entry",
            note: "The bundler starts at main.jsx and follows each import statement.",
          },
          {
            from: "npm",
            to: "graph",
            label: "deps",
            note: "Imports like 'react' resolve to packages inside node_modules.",
          },
          {
            from: "graph",
            to: "transpile",
            label: "parse",
            note: "Every module is parsed and JSX is rewritten into function calls.",
          },
          {
            from: "transpile",
            to: "optimize",
            label: "bundle",
            note: "Unused exports are dropped and code is minified and split into chunks.",
          },
          {
            from: "optimize",
            to: "dist",
            label: "emit",
            note: "Files are written with content hashes so browsers can cache them safely.",
          },
        ],
      },
    },
  ),

  "under-the-hood--from-jsx-to-createelement": detailed(
    lesson(
      "JSX looks like HTML inside JavaScript, but the browser never sees it. A compiler rewrites every tag into a function call that returns a React element object. Knowing that translation explains most JSX rules that otherwise feel arbitrary.",
      [
        'Each tag becomes a call with three parts: the type, a props object, and children. A lowercase type becomes a string such as "div"; a capitalized type is passed as the component function itself. That is why components must start with a capital letter.',
        "Curly braces insert any JavaScript expression into the props object or the children list. Statements like if or for are not expressions, so you use ternaries, &&, or map instead, or compute values before the return.",
        "The modern automatic runtime imports jsx() helpers from react/jsx-runtime for you, so files no longer need import React. The resulting element is a plain object: { type, props, key }, with children stored inside props.",
      ],
      `import { createElement } from 'react';

function Badge({ label }) {
  return <span className="badge">{label}</span>;
}

// The same tree written twice: once in JSX, once as calls.
const withJsx = (
  <section id="menu">
    <h2>Menu</h2>
    <Badge label="Veg" />
  </section>
);

const withCalls = createElement('section', { id: 'menu' },
  createElement('h2', null, 'Menu'),
  createElement(Badge, { label: 'Veg' }),
);

export default function App() {
  return <main>{withJsx}{withCalls}</main>;
}`,
      "Both constants describe identical trees, so the page shows the menu twice. Notice that Badge appears without quotes in the call: React receives the function and calls it while rendering. The string 'h2' tells React to create a built-in element.",
      ["JSX source", "Compiler output", "Element object"],
      "Writing <badge /> in lowercase compiles to createElement('badge'), an unknown HTML tag, so your component silently never runs. Capitalize component names and the variables that hold them.",
      "Why must a component return a single root such as <div> or a Fragment instead of two sibling tags?",
      "A function can only return one value. Two adjacent tags would compile to two separate createElement calls with nothing joining them. A Fragment (<>...</>) is one element whose children are the siblings, and it adds no extra DOM node.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "JSX rules that come straight from the translation",
          points: [
            "Attributes become object keys, so they use JavaScript names: className instead of class, htmlFor instead of for, and camelCase event names like onClick.",
            "style takes an object, {{ color: 'tomato' }}, because the outer braces start an expression and the inner braces are the object literal.",
            "Text in curly braces is escaped before it reaches the DOM, which protects you from injected markup. dangerouslySetInnerHTML is the deliberate, clearly named exception.",
            "Comments inside JSX need braces too: {/* note */}.",
          ],
        },
        {
          heading: "Composing components is just nesting calls",
          paragraphs: [
            "When React meets an element whose type is a function, it calls that function with the props and renders whatever it returns. A Header that renders a Logo that renders an img is a chain of these calls, which is why component composition feels so natural: it is ordinary function composition with a scheduler in charge of when calls happen.",
            'Never call a component directly as Badge({ label }) inside JSX. Doing so runs it as a plain function, so its Hooks attach to the parent and React loses track of its identity. Always render it as <Badge label="Veg" />.',
          ],
          code: `// Fragments group siblings without a wrapper element
function Price({ amount }) {
  return (
    <>
      <span className="currency">₹</span>
      <span className="amount">{amount}</span>
    </>
  );
}`,
        },
      ],
      animation: {
        title: "One tag, three representations",
        nodes: [
          { id: "jsx", label: "<Badge label />", sub: "what you write" },
          { id: "compiler", label: "Compiler", sub: "Babel / Oxc" },
          { id: "call", label: "jsx(Badge, props)", sub: "function call" },
          { id: "object", label: "{ type, props }", sub: "element object" },
          { id: "render", label: "Badge(props)", sub: "React calls it" },
        ],
        steps: [
          {
            from: "jsx",
            to: "compiler",
            label: "parse",
            note: "The build tool parses JSX syntax that browsers cannot read.",
          },
          {
            from: "compiler",
            to: "call",
            label: "rewrite",
            note: "Each tag becomes a jsx() or createElement call with type, props, and children.",
          },
          {
            from: "call",
            to: "object",
            label: "return",
            note: "At runtime the call returns a plain, immutable element object.",
          },
          {
            from: "object",
            to: "render",
            label: "type()",
            note: "Because type is a function, React calls Badge with the props during rendering.",
          },
        ],
      },
    },
  ),

  "under-the-hood--virtual-dom-and-reconciliation": detailed(
    lesson(
      "Every render produces a fresh tree of element objects. Reconciliation is how React compares that tree with the previous one and works out the smallest set of DOM changes. The term virtual DOM describes those lightweight element trees; the real work is the comparison rules.",
      [
        "Rendering and committing are separate phases. In the render phase React calls components and builds the next tree; nothing on screen changes yet. In the commit phase it applies the calculated changes to the DOM and then runs effects.",
        "React compares trees with two cheap heuristics. If an element's type changes, for example a div becomes a section or one component becomes another, the old subtree and its state are thrown away and a new one mounts. If the type matches, React keeps the node and updates only the props that changed.",
        "In lists, keys tell React which child is which between renders. With stable keys, inserting at the top moves nothing else. With index keys, every item after the insertion appears to have changed, which costs work and can attach state to the wrong row.",
      ],
      `import { useState } from 'react';

function Counter({ label }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{label}: {count}</button>;
}

export default function App() {
  const [fancy, setFancy] = useState(false);
  return (
    <main>
      <label>
        <input type="checkbox" checked={fancy} onChange={e => setFancy(e.target.checked)} />
        Wrap in a section
      </label>
      {fancy
        ? <section><Counter label="Clicks" /></section>
        : <div><Counter label="Clicks" /></div>}
    </main>
  );
}`,
      "Click the counter a few times, then tick the checkbox. The count resets to zero because the parent element changed type from div to section, so React unmounted the old subtree and mounted a new Counter. Keep the same wrapper type and the count survives.",
      ["New element tree", "Diff by type and key", "Minimal DOM commit"],
      "Generating keys with Math.random() or crypto.randomUUID() during render gives every item a new identity on every render, so React remounts the whole list and loses input focus and state. Use an ID that comes from the data.",
      "You want a profile form to reset completely when the selected user changes. How can reconciliation do that for you?",
      "Render it as <ProfileForm key={userId} />. A different key tells React it is a different component instance, so the old one unmounts and the new one starts with fresh state. No reset effect is needed.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Fiber: making rendering interruptible",
          paragraphs: [
            "Internally React represents each component instance as a fiber, a small record that links to its parent, child, and sibling and stores its state and pending work. Because work is split into these units, React can pause a large render to handle a keystroke, then continue.",
            "That is what makes features such as useTransition possible. An urgent update like typing is processed first, while a non-urgent update like filtering a long list can be restarted if newer input arrives. The commit phase itself is never interrupted, so the screen never shows half an update.",
          ],
        },
        {
          heading: "Batching keeps renders cheap",
          points: [
            "Several state updates inside one event handler are batched into a single render.",
            "Since React 18, updates inside promises, timeouts, and native handlers are batched too.",
            "A render is a calculation; it is cheap when components are pure and expensive only when they do heavy work. Measure with the Profiler before optimizing.",
          ],
          code: `function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  setLabel('Saved');
  // React renders once with all three updates applied.
}`,
        },
      ],
      animation: {
        title: "Reconciling one update",
        nodes: [
          { id: "state", label: "setState", sub: "update queued" },
          { id: "render", label: "Render phase", sub: "call components" },
          { id: "next", label: "Next tree", sub: "new elements" },
          { id: "diff", label: "Diff", sub: "type + key rules" },
          { id: "commit", label: "Commit phase", sub: "patch DOM" },
          { id: "effects", label: "Effects", sub: "run after paint" },
        ],
        steps: [
          {
            from: "state",
            to: "render",
            label: "schedule",
            note: "A state update marks the component and schedules a render.",
          },
          {
            from: "render",
            to: "next",
            label: "call",
            note: "React calls the affected components to produce a new element tree.",
          },
          {
            from: "next",
            to: "diff",
            label: "compare",
            note: "Each new element is compared with the previous one by type and key.",
          },
          {
            from: "diff",
            to: "commit",
            label: "changes",
            note: "Only nodes whose type, props, or position changed are written to the DOM.",
          },
          {
            from: "commit",
            to: "effects",
            label: "after",
            note: "Once the DOM is updated, React runs effects whose dependencies changed.",
          },
        ],
      },
    },
  ),

  "under-the-hood--import-and-export-patterns": detailed(
    lesson(
      "As soon as an app grows past one file you need a clear module system. ES modules let each file decide what it shares, and two export styles, default and named, cover almost every case. Consistent choices make files easy to find and refactor.",
      [
        "A default export is the one main thing a file provides, usually a component: export default function Header. The importer chooses any name: import Header from './Header.jsx'.",
        "Named exports share several values by their exact names, such as constants or helpers: export const LOGO_URL = ... and import { LOGO_URL } from './constants.js'. Use as to rename on import when names collide.",
        "Imports are static and hoisted, so tools can analyse them before running code. That is what lets bundlers tree shake unused named exports and catch typos in paths at build time.",
      ],
      `// src/utils/constants.js
export const CDN_URL = 'https://images.example.com/';
export const MENU_API = '/api/menu/';

// src/components/RestaurantCard.jsx
import { CDN_URL } from '../utils/constants.js';

export default function RestaurantCard({ name, imageId }) {
  return (
    <article>
      <img src={CDN_URL + imageId} alt="" />
      <h3>{name}</h3>
    </article>
  );
}

// src/App.jsx
import RestaurantCard from './components/RestaurantCard.jsx';

export default function App() {
  return <RestaurantCard name="Udupi Grand" imageId="dosa.jpg" />;
}`,
      "Three files, three roles. constants.js only shares named values, RestaurantCard.jsx shares one default component and imports what it needs, and App.jsx composes the screen. Moving the image CDN now means editing one line instead of searching every card.",
      ["Named constants", "Default component", "Composed App"],
      "Mixing up the two styles causes undefined imports. import CDN_URL from './constants.js' asks for a default export that does not exist. If a value is exported with export const, import it in braces.",
      "Should every folder have an index.js that re-exports everything inside it?",
      "Not by default. Barrel files make imports shorter, but they can create circular imports and make bundlers and dev servers load more modules than a page needs. Use them for a small, stable public API of a package, not for every folder.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "A folder structure that scales",
          points: [
            "components/ for reusable presentational pieces such as Button or Shimmer.",
            "features/ or pages/ for screens that combine components with data, such as RestaurantMenu.",
            "hooks/ for custom Hooks like useOnlineStatus that several features share.",
            "utils/ for pure helpers and constants with no React imports.",
            "Keep a component's test and styles next to it so moving the folder moves everything.",
          ],
          paragraphs: [
            "Two common approaches are grouping by type (all components together) and grouping by feature (everything for the cart together). Small projects are fine either way; larger ones usually drift toward features because changes tend to happen one feature at a time.",
          ],
        },
        {
          heading: "Dynamic import for code you rarely need",
          paragraphs: [
            "import() is the expression form of import. It returns a promise and tells the bundler to put the target in a separate chunk. React.lazy builds on it so that a rarely visited page downloads only when someone navigates there.",
          ],
          code: `import { lazy } from 'react';
const Grocery = lazy(() => import('./pages/Grocery.jsx'));`,
        },
      ],
      animation: {
        title: "How modules link together",
        nodes: [
          { id: "constants", label: "constants.js", sub: "named exports" },
          { id: "card", label: "RestaurantCard", sub: "default export" },
          { id: "app", label: "App.jsx", sub: "composes UI" },
          { id: "main", label: "main.jsx", sub: "entry module" },
          { id: "bundle", label: "Bundle", sub: "unused code removed" },
        ],
        steps: [
          {
            from: "constants",
            to: "card",
            label: "{ CDN_URL }",
            note: "RestaurantCard imports only the named constant it needs.",
          },
          {
            from: "card",
            to: "app",
            label: "default",
            note: "App imports the default component under any name it chooses.",
          },
          {
            from: "app",
            to: "main",
            label: "default",
            note: "The entry module imports App and renders it into the root.",
          },
          {
            from: "main",
            to: "bundle",
            label: "graph",
            note: "The bundler follows these imports and drops exports nobody used.",
          },
        ],
      },
    },
  ),

  "class-components--class-components": detailed(
    lesson(
      "Before Hooks, stateful React components were written as JavaScript classes. You will still meet them in older codebases, in interview questions, and in error boundaries, which can only be written as classes today. Reading them comfortably is a practical skill.",
      [
        "A class component extends Component and must implement render(), which returns elements. Props arrive on this.props. React creates one instance per mounted component and keeps it alive across renders.",
        "State lives on this.state and is initialised in the constructor or as a class field. You change it only with this.setState, which shallowly merges the object you pass into the existing state and schedules a render.",
        "Hooks do not work inside classes. Instead of useEffect you use lifecycle methods, and instead of closures over render variables you read this.props and this.state at the moment you need them.",
      ],
      `import { Component } from 'react';

export default class UserCard extends Component {
  constructor(props) {
    super(props); // required before using this
    this.state = { followers: 0, following: false };
  }

  // Class field arrow keeps 'this' bound to the instance.
  toggleFollow = () => {
    this.setState((state) => ({
      following: !state.following,
      followers: state.followers + (state.following ? -1 : 1),
    }));
  };

  render() {
    const { name, city } = this.props;
    const { followers, following } = this.state;
    return (
      <article>
        <h2>{name}</h2>
        <p>{city} · {followers} followers</p>
        <button onClick={this.toggleFollow}>{following ? 'Unfollow' : 'Follow'}</button>
      </article>
    );
  }
}`,
      'Render <UserCard name="Akira" city="Pune" /> and press the button. setState merges the two changed fields and React calls render again on the same instance. The functional form of setState reads the latest state, so rapid clicks never double count.',
      ["new UserCard(props)", "render() with this.state", "this.setState → re-render"],
      "Passing a normal method like onClick={this.toggle} without binding loses this, so this.setState throws. Use a class field arrow function, or bind once in the constructor with this.toggle = this.toggle.bind(this).",
      "In a class, setState({ followers: 5 }) runs when state is { followers: 0, following: true }. What is the state afterwards?",
      "{ followers: 5, following: true }. Class setState merges the given keys into existing state. That differs from a useState setter, which replaces the whole value you stored.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Mapping class ideas to function components",
          points: [
            "this.state with several keys ↔ several useState calls, or one useReducer.",
            "this.setState(updater) ↔ setValue(prev => next).",
            "componentDidMount + componentWillUnmount ↔ useEffect with a cleanup and the right dependencies.",
            "Instance fields that do not trigger renders, such as a timer id ↔ useRef.",
          ],
          paragraphs: [
            "The mapping is close but not exact. A function component captures props and state for a specific render, while a class reads the current this.props whenever a method runs. That difference matters for delayed callbacks: a class timeout can see props that changed after it was scheduled.",
          ],
        },
        {
          heading: "Where classes are still required",
          paragraphs: [
            "Error boundaries need static getDerivedStateFromError and componentDidCatch, which have no Hook equivalent yet. Many teams write one small class boundary or use a library, then keep everything else as functions.",
          ],
          code: `class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { reportError(error, info.componentStack); }
  render() {
    return this.state.failed ? <p>Something went wrong.</p> : this.props.children;
  }
}`,
        },
      ],
      animation: {
        title: "Life of a class instance",
        nodes: [
          { id: "props", label: "Props", sub: "from parent" },
          { id: "instance", label: "Instance", sub: "this.state" },
          { id: "render", label: "render()", sub: "returns elements" },
          { id: "dom", label: "DOM", sub: "committed" },
          { id: "event", label: "Click handler", sub: "this.setState" },
        ],
        steps: [
          {
            from: "props",
            to: "instance",
            label: "new",
            note: "React constructs one instance and passes props to the constructor.",
          },
          {
            from: "instance",
            to: "render",
            label: "call",
            note: "render() reads this.props and this.state to describe the UI.",
          },
          {
            from: "render",
            to: "dom",
            label: "commit",
            note: "React commits the elements returned by render to the DOM.",
          },
          {
            from: "dom",
            to: "event",
            label: "click",
            note: "A user event runs a method bound to the same instance.",
          },
          {
            from: "event",
            to: "instance",
            label: "merge",
            note: "setState merges the change into this.state and schedules another render.",
          },
        ],
      },
    },
  ),

  "class-components--class-lifecycle-methods": detailed(
    lesson(
      "Lifecycle methods are the hooks a class component gets at fixed moments: after it first appears, after each update, and just before it disappears. Knowing the exact order, especially between parents and children, answers a whole family of interview questions.",
      [
        "Mounting runs constructor, then render, then React commits to the DOM, then componentDidMount. componentDidMount is the place to start network requests, subscriptions, or timers, because the DOM now exists.",
        "Updating runs render again and, after commit, componentDidUpdate(prevProps, prevState). Compare with the previous values before acting, otherwise a setState inside componentDidUpdate can trigger an endless loop.",
        "Unmounting calls componentWillUnmount right before the instance is removed. Clear intervals, cancel subscriptions, and abort requests here so nothing keeps running for a component that no longer exists.",
      ],
      `import { Component } from 'react';

export default class LiveScore extends Component {
  state = { score: null, ticks: 0 };

  componentDidMount() {
    this.load();
    this.timer = setInterval(() => this.setState(s => ({ ticks: s.ticks + 1 })), 5000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.matchId !== this.props.matchId) this.load();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.controller?.abort();
  }

  async load() {
    this.controller?.abort();
    this.controller = new AbortController();
    try {
      const res = await fetch('/api/score/' + this.props.matchId, { signal: this.controller.signal });
      this.setState({ score: await res.json() });
    } catch (error) {
      if (error.name !== 'AbortError') this.setState({ score: { error: true } });
    }
  }

  render() {
    const { score, ticks } = this.state;
    if (!score) return <p>Loading match…</p>;
    return <p>{score.error ? 'Score unavailable' : score.summary} · refreshed {ticks}×</p>;
  }
}`,
      "On mount the component renders a loading message, then componentDidMount starts the request and the timer. A new matchId triggers componentDidUpdate, which reloads only because the id actually changed. Leaving the page calls componentWillUnmount, which stops both the timer and any in-flight request.",
      [
        "Mount: constructor → render → didMount",
        "Update: render → didUpdate",
        "Unmount: willUnmount",
      ],
      "Forgetting componentWillUnmount leaves intervals running after navigation. In a single-page app the page never reloads, so each visit stacks another timer and calls setState on an instance React has already discarded.",
      "A parent renders two class children. In what order do the constructors, renders, and componentDidMount calls happen?",
      "Parent constructor, parent render, then child 1 constructor and render, child 2 constructor and render, then child 1 componentDidMount, child 2 componentDidMount, and finally parent componentDidMount. React finishes the render phase for the whole tree before committing, and mount callbacks run from the children up.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Why children finish mounting before the parent",
          paragraphs: [
            "React renders the tree top down to find out what to show, then commits it in one batch. componentDidMount promises that the component's DOM is in the page, and a parent's DOM includes its children's DOM, so a parent can only be fully mounted after every child is. That is why the commit callbacks run bottom up.",
            "Batching also explains why both siblings render before either one mounts. React would rather compute the complete tree once and touch the DOM once than interleave rendering and DOM writes.",
          ],
        },
        {
          heading: "Lifecycle methods versus useEffect",
          points: [
            "useEffect(fn, []) is close to componentDidMount, and its cleanup is close to componentWillUnmount.",
            "An effect with dependencies combines didMount and didUpdate: it runs after the first render and again whenever a dependency changes, cleaning up the previous run first.",
            "Effects describe synchronisation with one external system rather than moments in time, which keeps related setup and cleanup in one place instead of spread across three methods.",
            "In development StrictMode, React mounts, unmounts, and remounts once to prove your cleanup works. Production does not.",
          ],
          code: `useEffect(() => {
  const id = setInterval(tick, 5000);
  return () => clearInterval(id); // same job as componentWillUnmount
}, []);`,
        },
        {
          heading: "Less common lifecycle methods",
          paragraphs: [
            "shouldComponentUpdate(nextProps, nextState) can skip a render by returning false, and PureComponent implements it with a shallow comparison. getSnapshotBeforeUpdate reads layout information, such as scroll position, right before the DOM changes. Methods prefixed UNSAFE_ are legacy and should not be used in new code.",
          ],
        },
      ],
      animation: {
        title: "Parent and child lifecycle order",
        nodes: [
          { id: "pc", label: "Parent", sub: "constructor", x: 15, y: 22 },
          { id: "pr", label: "Parent", sub: "render", x: 38, y: 22 },
          { id: "c1", label: "Child 1", sub: "ctor + render", x: 62, y: 22 },
          { id: "c2", label: "Child 2", sub: "ctor + render", x: 85, y: 22 },
          { id: "dom", label: "Commit", sub: "DOM updated", x: 85, y: 76 },
          { id: "cdm", label: "Children", sub: "didMount", x: 52, y: 76 },
          { id: "pdm", label: "Parent", sub: "didMount", x: 18, y: 76 },
        ],
        steps: [
          {
            from: "pc",
            to: "pr",
            label: "1",
            note: "The parent is constructed and renders, revealing two children.",
          },
          { from: "pr", to: "c1", label: "2", note: "Child 1 is constructed and rendered." },
          {
            from: "c1",
            to: "c2",
            label: "3",
            note: "Child 2 is constructed and rendered before anything is committed.",
          },
          {
            from: "c2",
            to: "dom",
            label: "4",
            note: "The whole tree is committed to the DOM in one batch.",
          },
          {
            from: "dom",
            to: "cdm",
            label: "5",
            note: "componentDidMount runs for child 1, then child 2.",
          },
          {
            from: "cdm",
            to: "pdm",
            label: "6",
            note: "The parent's componentDidMount runs last, once its children are in place.",
          },
        ],
      },
    },
  ),

  "class-components--higher-order-components": detailed(
    lesson(
      "A higher-order component, or HOC, is a function that takes a component and returns a new component with extra behaviour. It lets you add the same enhancement, such as a badge, a permission check, or logging, to many components without editing them.",
      [
        "The pattern is plain JavaScript: const Enhanced = withSomething(Base). The returned component renders Base, passing through the props it received and adding or changing whatever it is responsible for.",
        "HOCs should not modify the wrapped component. They compose around it, so Base still works on its own and can be enhanced in different ways in different places.",
        "Many HOC use cases are now written as custom Hooks, which share logic without adding wrapper layers. HOCs remain useful when the enhancement is about rendering around a component, such as adding a label, a layout, or a guard.",
      ],
      `function RestaurantCard({ name, rating }) {
  return (
    <article className="card">
      <h3>{name}</h3>
      <p>★ {rating}</p>
    </article>
  );
}

// Higher-order component: input a component, output a new one.
function withPromotedLabel(Card) {
  function PromotedCard(props) {
    return (
      <div className="promoted">
        <span className="label">Promoted</span>
        <Card {...props} />
      </div>
    );
  }
  PromotedCard.displayName = 'withPromotedLabel(' + (Card.displayName || Card.name) + ')';
  return PromotedCard;
}

// Create it once, outside any component.
const PromotedRestaurantCard = withPromotedLabel(RestaurantCard);

const list = [
  { id: 1, name: 'Masala Corner', rating: 4.4, promoted: true },
  { id: 2, name: 'Biryani House', rating: 4.1, promoted: false },
];

export default function Feed() {
  return list.map((r) =>
    r.promoted
      ? <PromotedRestaurantCard key={r.id} {...r} />
      : <RestaurantCard key={r.id} {...r} />,
  );
}`,
      "Both rows render the same RestaurantCard. The promoted one is wrapped by PromotedCard, which adds the label and forwards every prop with {...props}. displayName makes the wrapper readable in React DevTools as withPromotedLabel(RestaurantCard).",
      ["Base component", "withPromotedLabel(Base)", "Enhanced component"],
      "Calling the HOC inside render, like const Card = withPromotedLabel(RestaurantCard) inside Feed, creates a brand-new component type on every render. React then unmounts and remounts the card each time, losing its state. Create enhanced components once at module level.",
      'Your HOC renders <Card title="x" /> instead of <Card {...props} />. What breaks?',
      "Every prop the caller passed, such as name, rating, or onClick, is dropped, so the wrapped card renders with missing data. A HOC should forward the props it does not own and only add or override what it is responsible for.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "A HOC that adds behaviour, not just markup",
          paragraphs: [
            "A guard HOC can decide whether to render the wrapped component at all. Here the enhancement reads a custom Hook, which shows how the two patterns work together: the Hook owns the logic and the HOC applies it to any component.",
          ],
          code: `function withOnlineGuard(Component) {
  return function Guarded(props) {
    const online = useOnlineStatus();
    if (!online) return <p role="alert">You are offline. Check your connection.</p>;
    return <Component {...props} />;
  };
}

const GuardedCheckout = withOnlineGuard(Checkout);`,
        },
        {
          heading: "Trade-offs to keep in mind",
          points: [
            "Stacking several HOCs creates a deep tree of wrappers in DevTools, often called wrapper hell.",
            "Two HOCs that inject a prop with the same name will silently overwrite each other.",
            "Static methods on the original component are not copied to the wrapper automatically.",
            "In React 19, ref is an ordinary prop for function components, so spreading props forwards it without forwardRef.",
          ],
        },
      ],
      animation: {
        title: "Wrapping without editing",
        nodes: [
          { id: "base", label: "RestaurantCard", sub: "unchanged" },
          { id: "hoc", label: "withPromoted()", sub: "function" },
          { id: "enhanced", label: "PromotedCard", sub: "new component" },
          { id: "props", label: "Props", sub: "{...props}" },
          { id: "ui", label: "UI", sub: "label + card" },
        ],
        steps: [
          {
            from: "base",
            to: "hoc",
            label: "input",
            note: "The base component is passed into the HOC as an argument.",
          },
          {
            from: "hoc",
            to: "enhanced",
            label: "return",
            note: "The HOC returns a new component that will render the base inside it.",
          },
          {
            from: "props",
            to: "enhanced",
            label: "props",
            note: "Callers render the enhanced component with the same props as before.",
          },
          {
            from: "enhanced",
            to: "ui",
            label: "render",
            note: "It renders the label, then the base card with every prop forwarded.",
          },
        ],
      },
    },
  ),

  "class-components--controlled-vs-uncontrolled-components": detailed(
    lesson(
      "Controlled and uncontrolled describe who owns a piece of state. A controlled component receives its value from its parent and reports changes upward; an uncontrolled one keeps its own state internally. The idea applies to inputs and to your own components, like an accordion.",
      [
        "A controlled input sets value from state and updates that state in onChange. React state is the single source of truth, so you can validate, format, or disable things on every keystroke.",
        "An uncontrolled input sets only defaultValue and is read when needed, through a ref or the form's FormData on submit. It needs less code when you only care about the final value.",
        "The same choice exists for your components. An accordion item that stores its own open state is uncontrolled; one that receives isOpen and onToggle from its parent is controlled, which lets the parent enforce rules like only one section open at a time.",
      ],
      `import { useState } from 'react';

function MenuSection({ title, items, isOpen, onToggle }) {
  return (
    <section>
      <h3>
        <button aria-expanded={isOpen} onClick={onToggle}>
          {title} ({items.length})
        </button>
      </h3>
      {isOpen && <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>}
    </section>
  );
}

const sections = [
  { title: 'Recommended', items: ['Masala dosa', 'Idli'] },
  { title: 'Rice', items: ['Lemon rice', 'Curd rice'] },
  { title: 'Desserts', items: ['Kesari bath'] },
];

export default function Menu() {
  const [openIndex, setOpenIndex] = useState(0);
  return sections.map((section, index) => (
    <MenuSection
      key={section.title}
      {...section}
      isOpen={index === openIndex}
      onToggle={() => setOpenIndex(current => (current === index ? null : index))}
    />
  ));
}`,
      "MenuSection owns no state, so it is fully controlled by Menu. Opening Rice sets openIndex to 1, which closes Recommended automatically because both read the same parent value. Clicking an open section sets openIndex to null and collapses everything.",
      ["Parent owns state", "Props down: isOpen", "Events up: onToggle"],
      'Switching an input from value={undefined} to value="text" flips it from uncontrolled to controlled and triggers a React warning. Initialise controlled text inputs with an empty string, not undefined or null.',
      "When is an uncontrolled input the better choice?",
      "When nothing else depends on the value until submission, such as a simple search or feedback form. Reading FormData on submit avoids a render per keystroke and keeps the code short. Choose controlled when you need live validation, formatting, or other UI that reacts to each change.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "An uncontrolled form read on submit",
          code: `export default function Feedback() {
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('email'), data.get('message'));
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue="" required />
      <textarea name="message" defaultValue="" />
      <button>Send</button>
    </form>
  );
}`,
          paragraphs: [
            "The browser keeps each field's value. React only reads them once, when the form is submitted. A ref works the same way for a single field: inputRef.current.value.",
          ],
        },
        {
          heading: "Supporting both modes in a reusable component",
          paragraphs: [
            "Libraries often let a component work either way: if the parent passes value it is controlled, otherwise it falls back to internal state seeded from defaultValue. Pick one mode per usage and never switch between them while mounted.",
          ],
        },
      ],
      animation: {
        title: "Who owns the value?",
        nodes: [
          { id: "parent", label: "Menu", sub: "openIndex state" },
          { id: "a", label: "Recommended", sub: "isOpen prop" },
          { id: "b", label: "Rice", sub: "isOpen prop" },
          { id: "c", label: "Desserts", sub: "isOpen prop" },
        ],
        steps: [
          {
            from: "parent",
            to: "a",
            label: "true",
            note: "Menu passes isOpen=true to the first section and false to the rest.",
          },
          {
            from: "b",
            to: "parent",
            label: "onToggle",
            note: "Clicking Rice calls onToggle, sending the event up to the owner.",
          },
          {
            from: "parent",
            to: "b",
            label: "true",
            note: "Menu updates openIndex to 1 and Rice re-renders open.",
          },
          {
            from: "parent",
            to: "a",
            label: "false",
            note: "Recommended receives false from the same state change and closes.",
          },
          {
            from: "c",
            to: "parent",
            label: "onToggle",
            note: "Every section follows the same contract, so the rule lives in one place.",
          },
        ],
      },
    },
  ),

  "class-components--config-driven-ui": detailed(
    lesson(
      "In a config-driven UI the server decides what appears on screen by sending data that describes the layout, and the client maps that description to components. Food delivery and e-commerce apps use it to show different banners, carousels, and sections per city or user without shipping a new release.",
      [
        "The config is a list of widgets, each with a type and its data: { type: 'banner', data: {...} }. It can change per location, experiment group, or time of day.",
        "The client keeps a registry that maps each type string to a component. Rendering is a loop over the config that looks up the component and passes the widget's data as props.",
        "Robustness matters more than usual because the server can send something the client does not know. Unknown types should be skipped or replaced by a fallback, and the data for each widget should be validated before it reaches the component.",
      ],
      `const Banner = ({ title, subtitle }) => (
  <section className="banner"><h2>{title}</h2><p>{subtitle}</p></section>
);
const Carousel = ({ heading, items }) => (
  <section><h3>{heading}</h3><ul>{items.map(i => <li key={i}>{i}</li>)}</ul></section>
);
const RestaurantGrid = ({ count }) => <section><h3>{count} restaurants near you</h3></section>;

const registry = { banner: Banner, carousel: Carousel, restaurantGrid: RestaurantGrid };

// Usually fetched from the server for the current city or user.
const layout = [
  { id: 'w1', type: 'banner', data: { title: '50% off', subtitle: 'On your first order' } },
  { id: 'w2', type: 'carousel', data: { heading: 'What is on your mind?', items: ['Pizza', 'Dosa'] } },
  { id: 'w3', type: 'videoAd', data: {} },
  { id: 'w4', type: 'restaurantGrid', data: { count: 128 } },
];

export default function Home() {
  return (
    <main>
      {layout.map(({ id, type, data }) => {
        const Widget = registry[type];
        return Widget ? <Widget key={id} {...data} /> : null;
      })}
    </main>
  );
}`,
      "The page renders a banner, a carousel, and the restaurant grid in exactly the order the config lists them. videoAd has no registered component, so it is skipped instead of crashing the page. Reordering or removing widgets now only needs a config change on the server.",
      ["Server layout config", "Type → component registry", "Rendered page"],
      "Trusting the config blindly is risky. A missing field such as items crashes the carousel, and rendering arbitrary HTML from config opens injection holes. Validate the shape of each widget and keep content as data, not markup.",
      "The server starts sending a new widget type before the app update that supports it reaches users. What should older clients do?",
      "Ignore the unknown type gracefully, as the registry lookup above does, and ideally report it for monitoring. Many teams also version the config so the server can send a layout that older clients are known to support.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Real API responses are deeply nested",
          paragraphs: [
            "Production configs often wrap each widget in several layers of metadata. Write small adapter functions that pull the fields you need with optional chaining and defaults, and keep components unaware of the raw shape. When the backend changes, only the adapter changes.",
          ],
          code: `function toRestaurantCards(response) {
  const cards = response?.data?.cards ?? [];
  const grid = cards.find(c => c?.card?.card?.id === 'restaurant_grid');
  return grid?.card?.card?.gridElements?.infoWithStyle?.restaurants ?? [];
}`,
        },
        {
          heading: "Benefits and costs",
          points: [
            "Product teams can run experiments and seasonal campaigns without app releases.",
            "One client can serve many markets with different layouts.",
            "Debugging is harder because the UI depends on data you may not see locally, so log the config version with errors.",
            "Every widget becomes a public contract between client and server and needs documentation and tests.",
          ],
        },
      ],
      animation: {
        title: "From config to screen",
        nodes: [
          { id: "server", label: "Server", sub: "per-city layout" },
          { id: "config", label: "Config JSON", sub: "[{ type, data }]" },
          { id: "registry", label: "Registry", sub: "type → component" },
          { id: "fallback", label: "Unknown type", sub: "skipped" },
          { id: "page", label: "Page", sub: "ordered widgets" },
        ],
        steps: [
          {
            from: "server",
            to: "config",
            label: "fetch",
            note: "The client requests the layout for the user's city.",
          },
          {
            from: "config",
            to: "registry",
            label: "banner",
            note: "Each widget type is looked up in the component registry.",
          },
          {
            from: "registry",
            to: "page",
            label: "<Banner/>",
            note: "Known types render with their data spread in as props.",
          },
          {
            from: "config",
            to: "fallback",
            label: "videoAd",
            note: "An unknown type finds no component and renders nothing.",
          },
          {
            from: "registry",
            to: "page",
            label: "<Grid/>",
            note: "Rendering continues, keeping the order the server chose.",
          },
        ],
      },
    },
  ),
};
