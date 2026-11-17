// Browser fundamentals and interview-method lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const browserLessons = {
  "browser-concepts--real-dom-vs-virtual-dom": fsd({
    intro:
      "The real DOM is the browser's live tree of nodes that it styles, lays out, and paints. A virtual DOM is a lightweight JavaScript description of what the UI should look like, which a library such as React compares against the previous description to compute the minimal set of real DOM changes. Understanding the difference explains both why frameworks use it and when it is not free.",
    concepts: [
      "Real DOM operations are not slow in themselves, but changes can trigger style recalculation, layout, and paint. Scattered, unbatched reads and writes cause repeated layout work, which is the real cost.",
      "A virtual DOM lets you write UI as a function of state. On each update the library builds a new tree of plain objects, diffs it against the old tree using heuristics such as element type and keys, and applies only the differences in one batch.",
      "Diffing is work too. For huge trees or very frequent updates, fine-grained reactivity (Solid, Svelte, Vue's compiler hints, signals) or compiler optimisations such as the React Compiler can skip unnecessary comparisons entirely.",
    ],
    code: `// What React does conceptually on an update
const previous = { type: "ul", props: { children: [
  { type: "li", key: "a", props: { children: "Apples" } },
  { type: "li", key: "b", props: { children: "Bananas" } },
] } };

const next = { type: "ul", props: { children: [
  { type: "li", key: "b", props: { children: "Bananas" } },
  { type: "li", key: "a", props: { children: "Apples (2)" } },
  { type: "li", key: "c", props: { children: "Cherries" } },
] } };

// Diff result (keys let React match items despite reordering):
// - move <li key="b"> before <li key="a">
// - update text of <li key="a"> to "Apples (2)"
// - insert new <li key="c">
// Then commit these three DOM operations in one batch.

// The manual equivalent with the real DOM, done carelessly:
for (const item of items) {
  list.innerHTML += \`<li>\${item}</li>\`;  // re-parses and rebuilds the whole list each time
  console.log(list.offsetHeight);          // forces a layout on every iteration
}`,
    walkthrough:
      "Both trees are plain objects. Keys tell the diff that b and a are the same items in a new order, so React moves existing nodes, updates one text node, and inserts one new item, all in a single commit. The careless manual version rebuilds the list's HTML on every iteration and forces synchronous layout each time by reading offsetHeight, which is the pattern that made direct DOM manipulation look slow.",
    flow: ["Describe UI as objects", "Diff old vs new tree", "Commit minimal DOM changes"],
    mistake:
      "Claiming the virtual DOM is always faster than the real DOM. Carefully batched direct DOM updates can be faster; the virtual DOM's value is a simple declarative model with good-enough performance by default.",
    exercise:
      "Why does using array indexes as keys cause bugs when you insert an item at the top of a list?",
    answer:
      "Every existing item's index shifts, so the diff thinks each position's item changed and reuses the wrong DOM nodes and component state for different data, causing inputs or animations to attach to the wrong row.",
    deepDive: [
      {
        heading: "Diffing heuristics",
        points: [
          "Different element types at the same position: tear down and rebuild the subtree.",
          "Same type: keep the node and update changed attributes.",
          "Lists: match children by key; without keys, match by position.",
          "These rules make diffing linear instead of the cubic cost of a general tree diff.",
        ],
      },
    ],
    animation: {
      title: "From state change to DOM commit",
      nodes: [
        ["state", "State change", "setItems"],
        ["vtree", "New virtual tree", "plain objects"],
        ["diff", "Diff", "keys + types"],
        ["patch", "Patch list", "3 operations"],
        ["dom", "Real DOM", "one commit"],
      ],
      steps: [
        ["state", "vtree", "render", "A state change re-runs the component and produces a new virtual tree."],
        ["vtree", "diff", "compare", "The new tree is compared with the previous one, using keys for list items."],
        ["diff", "patch", "minimal", "Only a move, a text update, and an insert are needed."],
        ["patch", "dom", "commit", "All three changes are applied to the real DOM in one batch."],
      ],
    },
  }),

  "browser-concepts--real-dom-vs-shadow-dom": fsd({
    intro:
      "The Shadow DOM is a browser feature that attaches a hidden, encapsulated DOM tree to an element. Styles inside it do not leak out, page styles do not leak in (except inherited properties and custom properties), and its internal structure is hidden from normal DOM queries. It is the encapsulation layer behind Web Components and built-in elements like video controls.",
    concepts: [
      "attachShadow({ mode: 'open' }) creates a shadow root. The element's light DOM children can be projected into the shadow tree through slot elements, so consumers supply content while the component controls structure.",
      "Style encapsulation: selectors inside the shadow root only match shadow content, and page selectors do not match it. Theming crosses the boundary via CSS custom properties and the ::part() pseudo-element for exposed parts.",
      "Shadow DOM is not the virtual DOM. The virtual DOM is a JavaScript diffing technique in frameworks; the Shadow DOM is a real browser DOM feature for encapsulation. They solve different problems and can be used together.",
    ],
    code: `class RatingStars extends HTMLElement {
  static observedAttributes = ["value"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = \`
      <style>
        :host { display: inline-flex; gap: 2px; color: var(--star-color, #f59e0b); }
        span { font-size: 1.25rem; }
        .off { opacity: 0.3; }
      </style>
      <span part="label"><slot>Rating</slot>:</span>
      <span id="stars" role="img"></span>\`;
  }

  attributeChangedCallback() {
    const value = Number(this.getAttribute("value") ?? 0);
    const stars = this.shadowRoot.getElementById("stars");
    stars.setAttribute("aria-label", \`\${value} out of 5\`);
    stars.innerHTML = Array.from({ length: 5 }, (_, i) => \`<span class="\${i < value ? "" : "off"}">★</span>\`).join("");
  }
}
customElements.define("rating-stars", RatingStars);

/* Page usage */
// <rating-stars value="4">Quality</rating-stars>
// <style>
//   span { color: red; }                         /* does NOT affect the stars inside */
//   rating-stars { --star-color: #10b981; }      /* custom properties DO cross the boundary */
//   rating-stars::part(label) { font-weight: 600; }
// </style>`,
    walkthrough:
      "The component's styles live inside its shadow root, so the page's span { color: red } does not turn the stars red, and the component's .off class cannot clash with any page class. The light DOM text 'Quality' is projected through the slot. The page themes the component through the --star-color custom property and styles the exposed label via ::part, which are the intended extension points.",
    flow: ["Attach a shadow root", "Encapsulate markup and styles", "Expose slots, parts, variables"],
    mistake:
      "Expecting global CSS frameworks or utility classes to style the inside of a shadow root. They cannot reach it; components must expose custom properties and parts or include their own styles.",
    exercise:
      "Your design system must work in React, Angular, and plain HTML apps. When might Web Components with Shadow DOM be a good fit, and what is a drawback?",
    answer:
      "They work natively in every framework, and encapsulation protects them from each app's CSS. Drawbacks include server-side rendering complexity (declarative shadow DOM helps), form participation needing ElementInternals, and harder theming without well-designed custom properties.",
    deepDive: [
      {
        heading: "Accessibility across the shadow boundary",
        points: [
          "aria-labelledby and aria-describedby cannot reference IDs across shadow roots, so keep related elements together.",
          "Use delegatesFocus: true to forward focus into the right internal element.",
          "Form-associated custom elements with ElementInternals participate in forms and validation.",
        ],
      },
    ],
    animation: {
      title: "Styles at the shadow boundary",
      nodes: [
        ["page", "Page CSS", "span { red }"],
        ["host", "<rating-stars>", "host element"],
        ["shadow", "Shadow root", "own styles"],
        ["vars", "--star-color", "custom property"],
      ],
      steps: [
        ["page", "host", "selector", "The page's span selector targets spans in the document."],
        ["host", "shadow", "blocked", "It cannot match spans inside the shadow root, so the stars stay amber."],
        ["vars", "shadow", "inherits", "A custom property set on the host does flow into the shadow styles."],
        ["shadow", "page", "slot", "The light DOM label is projected through the slot while staying in the page."],
      ],
    },
  }),

  "browser-concepts--minification-vs-compression": fsd({
    intro:
      "Minification and compression both shrink files, at different stages and in different ways. Minification rewrites source code at build time to an equivalent but smaller form. Compression encodes the bytes at transfer time, and the browser decodes them before use. You want both, because they shrink different things and stack well.",
    concepts: [
      "Minification removes whitespace and comments, shortens local variable names, simplifies expressions, and drops dead branches. The output is still valid JavaScript or CSS, so it also reduces parse and execution cost.",
      "Compression such as gzip or Brotli finds repeated byte sequences and encodes them efficiently. It happens on the server or CDN (ideally pre-compressed at build time for static assets), and the browser decompresses before parsing, so it reduces download size but not parse cost.",
      "Order matters: minify, then compress. Brotli at high levels typically beats gzip by 15 to 25% for text. Never compress already-compressed formats such as JPEG, AVIF, or MP4; it wastes CPU for no gain.",
    ],
    code: `// Source (1,180 bytes)
export function calculateDiscountedTotal(cartItems, discountPercentage) {
  // Sum up the price of every item in the cart
  const subtotal = cartItems.reduce((runningTotal, item) => runningTotal + item.price * item.quantity, 0);
  if (discountPercentage <= 0) {
    return subtotal;
  }
  return Math.round(subtotal * (1 - discountPercentage / 100));
}

// After minification (≈ 150 bytes): same behaviour, smaller to download AND parse
export function calculateDiscountedTotal(t,e){const n=t.reduce((t,e)=>t+e.price*e.quantity,0);return e<=0?n:Math.round(n*(1-e/100))}

// Transfer: the server sends compressed bytes; the browser decompresses before parsing
// Request:  Accept-Encoding: br, gzip
// Response: Content-Encoding: br    Content-Length: 118

// Build-time pre-compression with Vite
// import compression from "vite-plugin-compression2";
// plugins: [compression({ algorithm: "brotliCompress", exclude: [/\\.(png|jpg|avif|webp|mp4)$/] })]`,
    walkthrough:
      "Minification removed the comment, whitespace, and long local names, and turned the if into a ternary, while keeping the exported name that other modules depend on. The result is smaller to download and cheaper to parse. Brotli then compresses those bytes further for transfer, negotiated with Accept-Encoding and Content-Encoding. Pre-compressing at build time lets you use the highest compression level without per-request CPU cost.",
    flow: ["Minify at build", "Compress for transfer", "Browser decompresses, then parses"],
    mistake:
      "Measuring bundle size only by the compressed number. A 100 KB Brotli bundle can be 400 KB of JavaScript to parse and execute, which is what slow phones actually struggle with.",
    exercise:
      "Your 200 KB JSON API response is sent uncompressed. What would you check and expect?",
    answer:
      "Check that the server or CDN compresses application/json and that the client sends Accept-Encoding. JSON compresses extremely well, often by 80 to 90%, so the response could drop to around 20 to 40 KB. Also consider whether the API returns more fields than the view needs.",
    deepDive: [
      {
        heading: "What each technique touches",
        points: [
          "Minification: build time, changes code, reduces bytes and parse cost, needs source maps for debugging.",
          "Compression: transfer time, changes encoding only, reduces bytes on the wire, costs a little CPU to decode.",
          "Tree shaking and code splitting: build time, remove or defer whole modules, usually the biggest wins of all.",
        ],
      },
    ],
    animation: {
      title: "From source to bytes on the wire",
      nodes: [
        ["source", "Source", "1,180 B"],
        ["minify", "Minifier", "≈ 150 B"],
        ["compress", "Brotli", "≈ 118 B"],
        ["browser", "Browser", "decompress"],
        ["parse", "Parser", "parses 150 B"],
      ],
      steps: [
        ["source", "minify", "build", "The build minifies the function, removing comments and shortening names."],
        ["minify", "compress", "encode", "The CDN serves a pre-compressed Brotli version of the file."],
        ["compress", "browser", "transfer", "About 118 bytes travel over the network."],
        ["browser", "parse", "decode", "The browser decompresses back to the minified 150 bytes and parses them."],
      ],
    },
  }),

  "browser-concepts--spa-vs-mpa": fsd({
    intro:
      "A multi-page application serves a new HTML document from the server for each navigation. A single-page application loads one document and then renders routes in the browser with JavaScript, fetching data as needed. Modern frameworks blur the line with server rendering plus client navigation, but the trade-offs still shape architecture decisions.",
    concepts: [
      "MPAs are simple, fast to first content, naturally SEO friendly, and resilient: each page works even if JavaScript fails. Each navigation reloads the document, losing in-memory state, though the View Transitions API and bfcache now make cross-document navigations smoother.",
      "SPAs make navigation instant after the first load, preserve state such as a playing audio track or a draft across routes, and suit app-like products. They cost more upfront JavaScript, need client routing, focus management, and SEO care.",
      "Hybrid apps (Next.js, Remix, Nuxt, Astro, SvelteKit) server-render the first page and then navigate on the client, or keep pages as MPAs with interactive islands. Choose per product: content sites lean MPA or islands; productivity tools lean SPA.",
    ],
    code: `<!-- MPA: navigation is a full document request; the browser does the routing -->
<a href="/products/42">Red jacket</a>
<!-- Smooth cross-document transitions without a framework -->
<style>@view-transition { navigation: auto; }</style>

// SPA: intercept navigation, update the URL, render the route on the client
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href^='/']");
  if (!link || event.metaKey || event.ctrlKey || link.target === "_blank") return; // keep native behaviour
  event.preventDefault();
  history.pushState({}, "", link.href);
  renderRoute(location.pathname);
});
window.addEventListener("popstate", () => renderRoute(location.pathname));

async function renderRoute(path) {
  const route = routes.match(path);                  // e.g. /products/:id
  const [View, data] = await Promise.all([route.load(), route.loader?.(route.params)]);
  root.render(<View data={data} />);
  document.title = route.title(data);
  document.querySelector("main h1")?.focus();      // SPA must restore what MPAs give for free
}`,
    walkthrough:
      "The MPA link just works: the browser requests a new document, updates history, resets focus, and announces the new page, and a single CSS rule adds view transitions between pages. The SPA version intercepts same-origin clicks, keeps modifier-key behaviour, pushes history, loads route code and data in parallel, renders, then manually updates the title and focus, which are things the browser did automatically in the MPA.",
    flow: ["Full page per route (MPA)", "Client routing (SPA)", "Hybrid per need"],
    mistake:
      "Building a content-heavy marketing or blog site as a client-only SPA. Search engines and slow devices get an empty shell until JavaScript runs, hurting SEO and LCP for no benefit.",
    exercise:
      "Choose SPA, MPA, or hybrid for: a documentation site, a spreadsheet tool, and an online store.",
    answer:
      "Documentation: MPA or static site with islands. Spreadsheet: SPA, since it is app-like with long sessions and rich state. Online store: hybrid, server-rendered product and category pages for SEO and speed, client navigation and interactive islands for cart and filters.",
    deepDive: [
      {
        heading: "Things SPAs must reimplement",
        points: [
          "Scroll restoration on back and forward navigation.",
          "Focus management and route announcements for screen readers.",
          "Loading and error states per navigation.",
          "Link prefetching to approach MPA-with-cache speed.",
        ],
      },
    ],
    animation: {
      title: "Navigating in an MPA and an SPA",
      nodes: [
        ["click", "Link click", "/products/42"],
        ["server", "Server", "new HTML"],
        ["mpa", "MPA page", "full reload"],
        ["router", "SPA router", "pushState"],
        ["spa", "SPA view", "client render"],
      ],
      steps: [
        ["click", "server", "MPA", "In an MPA, the browser requests a whole new HTML document."],
        ["server", "mpa", "document", "The new page replaces the old one; in-memory state resets."],
        ["click", "router", "SPA", "In an SPA, the router intercepts the click and pushes a history entry."],
        ["router", "spa", "render", "Route code and data load, and only the content area re-renders."],
      ],
    },
  }),

  "browser-concepts--tree-shaking-vs-dead-code-elimination": fsd({
    intro:
      "Tree shaking and dead code elimination both remove code that will never run, at different levels. Tree shaking works across modules: the bundler includes only the exports that are actually imported somewhere. Dead code elimination works inside code: the minifier removes statements and branches that can never execute or whose results are unused.",
    concepts: [
      "Tree shaking relies on static ES module syntax. Because import and export are analysable at build time, bundlers such as Rollup, Vite, esbuild, and webpack can mark unused exports and drop them. CommonJS require calls are dynamic and much harder to shake.",
      "Side effects block tree shaking. If importing a module might run code that matters, such as patching globals or registering CSS, the bundler must keep it. The sideEffects field in package.json and /*#__PURE__*/ annotations tell it what is safe to drop.",
      "Dead code elimination, done by minifiers such as Terser or esbuild, removes unreachable branches like if (false), unused local variables, and code after return. Combined with environment constants such as process.env.NODE_ENV, it strips development-only code from production builds.",
    ],
    code: `// utils.js: an ES module with three exports
export function formatPrice(cents) { return \`₹\${(cents / 100).toFixed(2)}\`; }
export function formatDate(d) { return new Intl.DateTimeFormat("en-IN").format(d); }
export function heavyChartHelper() { /* 40 KB of code */ }

// app.js imports only one export
import { formatPrice } from "./utils.js";
console.log(formatPrice(129900));

// TREE SHAKING (bundler, across modules):
// formatDate and heavyChartHelper are never imported → excluded from the bundle.

// DEAD CODE ELIMINATION (minifier, within code):
function log(message) {
  if (process.env.NODE_ENV !== "production") {   // replaced with "production" !== "production" → false
    console.debug("[debug]", message);           // unreachable → removed
  }
}
const unused = expensiveSetup();                 // kept if expensiveSetup might have side effects
const alsoUnused = /*#__PURE__*/ createConfig(); // pure annotation → safe to remove

// package.json of a library: allow aggressive shaking except for CSS imports
// { "sideEffects": ["*.css"] }`,
    walkthrough:
      "Tree shaking sees that app.js imports only formatPrice, so the bundler leaves out formatDate and the 40 KB chart helper. Dead code elimination then works on the remaining code: after NODE_ENV is replaced with the literal 'production', the debug branch is provably false and removed. The unused call to expensiveSetup is kept because the minifier cannot prove it has no side effects, while the pure-annotated call is dropped.",
    flow: ["Analyse imports (tree shake)", "Drop unreachable code (DCE)", "Ship only what runs"],
    mistake:
      "Importing a CommonJS build of a library, or using import * as lib and accessing properties dynamically. The bundler cannot prove which parts are unused and includes everything.",
    exercise:
      "Your bundle includes all of a date library even though you use one function. Name two likely causes.",
    answer:
      "The package may be CommonJS or not marked side-effect free, or you imported it through a default or namespace import that pulls in the whole object. Switch to the ES module build with named or per-function imports, or a smaller library.",
    deepDive: [
      {
        heading: "Verifying it worked",
        points: [
          "Use a bundle visualizer to see which modules and exports were included.",
          "Search the production bundle for a distinctive string from the code you expect to be removed.",
          "Check library package.json for module or exports fields pointing to ESM builds and a sideEffects declaration.",
        ],
      },
    ],
    animation: {
      title: "Two passes that remove code",
      nodes: [
        ["graph", "Module graph", "imports/exports"],
        ["shake", "Tree shaking", "drop exports"],
        ["minify", "Minifier", "DCE"],
        ["bundle", "Bundle", "only live code"],
      ],
      steps: [
        ["graph", "shake", "analyse", "The bundler sees that only formatPrice is imported from utils.js."],
        ["shake", "minify", "2 exports gone", "formatDate and heavyChartHelper never enter the bundle."],
        ["minify", "bundle", "if (false)", "The minifier removes the debug branch made unreachable by NODE_ENV."],
        ["bundle", "graph", "verify", "A bundle visualizer confirms which modules remain."],
      ],
    },
  }),

  "browser-concepts--web-page-rendering-cycle": fsd({
    intro:
      "Between receiving HTML and showing pixels, the browser runs a pipeline: parse HTML into the DOM, parse CSS into the CSSOM, combine them into a render tree, compute layout, paint, and composite layers on the GPU. After load, the same stages rerun for every visual change. Knowing the pipeline tells you which changes are cheap and which block the page.",
    concepts: [
      "The critical rendering path is the work needed for the first paint. CSS is render-blocking because the browser will not paint without styles; synchronous scripts are parser-blocking because they may modify the DOM. Defer scripts and inline critical CSS to shorten it.",
      "Each frame, the browser may run JavaScript, then style, layout, paint, and composite. At 60 frames per second there are about 16 ms per frame; long JavaScript tasks or forced layouts cause dropped frames and slow interactions.",
      "Changes cost differently: changing layout properties such as width triggers layout, paint, and composite; changing colour triggers paint and composite; changing transform or opacity can skip straight to compositing, which is why animations should use them.",
    ],
    code: `<!doctype html>
<html>
<head>
  <!-- 1. Render-blocking: the browser waits for this before first paint -->
  <link rel="stylesheet" href="/app.css">
  <!-- 2. Parser-blocking unless async/defer/module -->
  <script src="/legacy-widget.js"></script>          <!-- ❌ stops HTML parsing until downloaded and run -->
  <script src="/app.js" defer></script>              <!-- ✅ downloads in parallel, runs after parsing -->
</head>
<body>
  <h1>Winter sale</h1>
  <div class="banner">50% off jackets</div>
</body>
</html>

<script>
  // Per-frame work: schedule visual updates right before paint
  function animateBanner(start) {
    requestAnimationFrame(function frame(now) {
      const progress = Math.min(1, (now - start) / 300);
      banner.style.transform = \`translateY(\${(1 - progress) * -20}px)\`; // composite-only
      banner.style.opacity = progress;                                  // composite-only
      if (progress < 1) requestAnimationFrame(frame);
    });
  }
  animateBanner(performance.now());
</script>`,
    walkthrough:
      "The stylesheet blocks first paint, so it should be small or split into critical and deferred parts. The legacy script without defer halts parsing until it downloads and runs, delaying everything after it; the deferred script downloads in parallel and runs after parsing. The animation uses requestAnimationFrame to update once per frame and changes only transform and opacity, so each frame skips layout and paint and is handled by the compositor.",
    flow: ["DOM + CSSOM → render tree", "Layout → paint", "Composite layers"],
    mistake:
      "Animating top, left, width, or height. Every frame forces layout and paint for the element and possibly its neighbours, causing jank on mid-range devices.",
    exercise:
      "Why can a page show a blank screen for seconds even though the HTML arrived quickly?",
    answer:
      "Render-blocking resources: large stylesheets, fonts with blocking display, or synchronous scripts in the head must download (and scripts must run) before the first paint. Client-side rendering apps also show nothing until their JavaScript builds the DOM.",
    deepDive: [
      {
        heading: "The stages in one list",
        points: [
          "Parse HTML → DOM; parse CSS → CSSOM.",
          "Style: compute final styles for each element.",
          "Layout: compute geometry, positions, and sizes.",
          "Paint: record drawing instructions for each layer.",
          "Composite: the GPU assembles layers into the final frame.",
        ],
      },
    ],
    animation: {
      title: "The rendering pipeline",
      nodes: [
        ["parse", "Parse", "DOM + CSSOM"],
        ["style", "Style", "computed styles"],
        ["layout", "Layout", "geometry"],
        ["paint", "Paint", "draw records"],
        ["composite", "Composite", "GPU layers"],
      ],
      steps: [
        ["parse", "style", "trees", "HTML and CSS become the DOM and CSSOM, combined into a render tree."],
        ["style", "layout", "styles", "Computed styles feed layout, which works out every box's size and position."],
        ["layout", "paint", "geometry", "Paint records how each layer should be drawn."],
        ["paint", "composite", "layers", "The compositor assembles layers on the GPU and shows the frame."],
        ["composite", "composite", "transform", "A transform animation updates only this last stage each frame."],
      ],
    },
  }),

  "browser-concepts--reflow-and-repaint": fsd({
    intro:
      "Reflow, also called layout, is the browser recalculating the size and position of elements. Repaint is redrawing pixels for elements whose appearance changed without geometry changing. Reflows are more expensive and can cascade to children, siblings, and ancestors. Layout thrashing, interleaving DOM writes with reads that force layout, is one of the most common causes of jank.",
    concepts: [
      "Reflow triggers include changing width, height, margin, padding, font size, content, adding or removing elements, and resizing the window. Repaint-only triggers include colour, background, visibility, and box-shadow.",
      "Reading layout properties such as offsetHeight, getBoundingClientRect, scrollTop, or getComputedStyle forces the browser to flush pending style and layout work synchronously so the answer is accurate.",
      "Avoid thrashing by batching: read everything first, then write everything, or schedule writes in requestAnimationFrame. Use transform and opacity for animation, contain: layout or content-visibility to limit layout scope, and ResizeObserver instead of polling sizes.",
    ],
    code: `// ❌ Layout thrashing: write, read, write, read... forces a layout per item
for (const card of cards) {
  card.style.width = container.offsetWidth / 3 + "px"; // read forces layout after previous write
}

// ✅ Batch reads, then writes: one layout
const width = container.offsetWidth / 3;  // single read
for (const card of cards) card.style.width = width + "px"; // writes only

// ✅ Better: let CSS do layout instead of JavaScript
// .grid { display: grid; grid-template-columns: repeat(3, 1fr); }

// ✅ Measure without polling
const observer = new ResizeObserver(([entry]) => {
  chart.resize(entry.contentRect.width); // called after layout, once per change
});
observer.observe(chartContainer);

/* ✅ Limit the blast radius of layout and skip off-screen work */
/* .widget { contain: layout paint; }
   .comment-list > article { content-visibility: auto; contain-intrinsic-size: auto 180px; } */`,
    walkthrough:
      "The first loop reads offsetWidth after each style write, so the browser recalculates layout once per card, which can mean hundreds of layouts in one frame. Reading once before the loop needs a single layout. The CSS grid version removes the JavaScript entirely. ResizeObserver reports size changes after layout instead of forcing new ones. contain and content-visibility tell the browser that layout inside a widget does not affect outside, and that off-screen comments can skip rendering until needed.",
    flow: ["Spot forced layouts", "Batch reads before writes", "Contain and offload to CSS"],
    mistake:
      "Calling getBoundingClientRect inside a scroll handler for many elements on every event. Each call can force layout, and scroll events fire rapidly; use IntersectionObserver or measure once and cache.",
    exercise:
      "The Performance panel shows purple 'Layout' blocks with a warning 'Forced reflow' inside a click handler. What does that tell you and how do you fix it?",
    answer:
      "The handler wrote styles and then read a layout property in the same task, forcing synchronous layout, possibly repeatedly. Restructure it to read all measurements first and then apply writes, or move writes into requestAnimationFrame.",
    deepDive: [
      {
        heading: "Properties by cost when changed",
        points: [
          "Layout + paint + composite: width, height, margin, padding, top, left, font-size, display.",
          "Paint + composite: color, background, border-color, box-shadow, visibility.",
          "Composite only (usually): transform, opacity, filter on promoted layers.",
        ],
      },
    ],
    animation: {
      title: "Layout thrashing versus batching",
      nodes: [
        ["write", "Style write", "card.width"],
        ["read", "Layout read", "offsetWidth"],
        ["layout", "Forced layout", "synchronous"],
        ["batch", "Batched loop", "1 read, N writes"],
        ["frame", "Frame", "one layout"],
      ],
      steps: [
        ["write", "read", "then read", "A write is followed immediately by a layout read."],
        ["read", "layout", "flush", "The browser must run layout now to answer accurately."],
        ["layout", "write", "repeat", "The loop repeats, forcing a layout for every card."],
        ["batch", "frame", "batched", "Reading once and writing after lets the browser lay out once per frame."],
      ],
    },
  }),

  "browser-concepts--html-parsing-vs-css-parsing": fsd({
    intro:
      "Browsers parse HTML and CSS very differently. The HTML parser is incremental and forgiving: it builds the DOM as bytes stream in and recovers from almost any error. The CSS parser builds the CSSOM and must have all stylesheets that apply before rendering, because later rules can override earlier ones. These differences explain render blocking, script blocking, and why the preload scanner exists.",
    concepts: [
      "HTML parsing is streaming. Tokens become DOM nodes as they arrive, so the browser can start fetching resources and even render partial content early. Synchronous scripts pause the parser because they might call document.write or change the DOM.",
      "CSS parsing produces the CSSOM. Because of the cascade, the browser cannot know an element's final style until every applicable stylesheet is parsed, so CSS is render-blocking. Scripts that read styles also wait for pending CSS, making CSS indirectly parser-blocking.",
      "The preload scanner is a secondary, lightweight parser that looks ahead in the HTML while the main parser is blocked, discovering images, scripts, and stylesheets early. Resources hidden in CSS backgrounds or injected by JavaScript are invisible to it.",
    ],
    code: `<head>
  <!-- CSS: render-blocking. Media queries make non-matching sheets non-blocking. -->
  <link rel="stylesheet" href="/core.css">
  <link rel="stylesheet" href="/print.css" media="print">       <!-- not render-blocking on screen -->
  <link rel="stylesheet" href="/wide.css" media="(min-width: 1200px)">

  <!-- A sync script after a stylesheet waits for the CSS AND blocks parsing -->
  <script src="/config.js"></script>

  <!-- Async/defer scripts let the parser continue -->
  <script src="/analytics.js" async></script>
  <script type="module" src="/app.js"></script>                 <!-- modules defer by default -->
</head>
<body>
  <!-- ✅ Discoverable by the preload scanner while the parser is blocked -->
  <img src="/hero.avif" alt="Sale" fetchpriority="high" width="1200" height="600">

  <!-- ❌ Hidden from the preload scanner: only found after CSS is parsed and applied -->
  <div class="hero-bg"></div>   <!-- .hero-bg { background-image: url(/hero.avif) } -->

  <!-- The HTML parser recovers from errors: this unclosed <p> still yields a valid DOM -->
  <p>Free delivery over ₹999
  <p>Easy returns
</body>`,
    walkthrough:
      "core.css blocks rendering, but print and wide-screen sheets that do not match the current media are downloaded at low priority without blocking. config.js must wait for core.css (it might read styles) and also blocks the parser. Analytics and the module script do not block. The real img tag is found by the preload scanner early; the CSS background version is discovered only after CSS is parsed and the element is styled, which delays LCP. The unclosed paragraphs show HTML's forgiving error recovery.",
    flow: ["HTML streams into the DOM", "CSS completes the CSSOM", "Render when both are ready"],
    mistake:
      "Loading the LCP image as a CSS background or via JavaScript. The preload scanner cannot see it, so it starts downloading late; use an img element or a preload hint.",
    exercise:
      "Why does placing a large synchronous script at the top of the body delay the rendering of everything below it?",
    answer:
      "The HTML parser stops at the script, downloads and executes it before continuing, so DOM nodes after it are not created and cannot render. If CSS is pending, the script also waits for it. Use defer or type=module, or place it at the end.",
    deepDive: [
      {
        heading: "Error handling contrast",
        points: [
          "HTML: the specification defines recovery for nearly every malformed input, so browsers build the same DOM.",
          "CSS: an invalid declaration or rule is skipped, and parsing continues with the next one.",
          "JavaScript: a syntax error stops the whole script from running, which is why one bad script can break a page.",
        ],
      },
    ],
    animation: {
      title: "Parsers working in parallel",
      nodes: [
        ["bytes", "HTML bytes", "streaming"],
        ["html", "HTML parser", "builds DOM"],
        ["scanner", "Preload scanner", "looks ahead"],
        ["css", "CSS parser", "builds CSSOM"],
        ["render", "First render", "DOM + CSSOM"],
      ],
      steps: [
        ["bytes", "html", "tokens", "HTML is tokenised and turned into DOM nodes as bytes arrive."],
        ["html", "css", "stylesheet", "A stylesheet link starts a fetch, and its CSS is parsed into the CSSOM."],
        ["bytes", "scanner", "look ahead", "While the parser waits on a sync script, the preload scanner finds the hero img."],
        ["css", "render", "CSSOM ready", "Once all render-blocking CSS is parsed, styles are known."],
        ["html", "render", "DOM so far", "The browser renders the DOM built so far with complete styles."],
      ],
    },
  }),

  "browser-concepts--dom-vs-bom": fsd({
    intro:
      "The DOM, Document Object Model, represents the page's content as a tree of nodes you can read and change. The BOM, Browser Object Model, is the informal name for everything else the browser exposes about the window and environment: location, history, navigator, screen, timers, storage, and dialogs. Both hang off the global window object, but they serve different purposes.",
    concepts: [
      "The DOM is standardised by WHATWG: document, elements, attributes, text nodes, events, and methods like querySelector and createElement. It represents the document, and frameworks ultimately manipulate it.",
      "The BOM covers the browsing context: window size and scroll, location for the URL, history for navigation, navigator for device and browser capabilities, screen, setTimeout and requestAnimationFrame, storage, and alert or confirm. Many parts are now individually specified.",
      "In frontend design both matter: routing uses history and location, feature detection uses navigator, persistence uses storage, responsive logic uses matchMedia, and the DOM is where everything renders.",
    ],
    code: `// DOM: the document's content
const list = document.querySelector("#cart-items");
const item = document.createElement("li");
item.textContent = "Red jacket × 1";
list.append(item);
list.addEventListener("click", (e) => e.target.closest("li")?.classList.toggle("selected"));

// BOM: the browser environment around the document
console.log(location.pathname);                         // "/cart"
history.pushState({ step: 2 }, "", "/checkout/address"); // change URL without reload
const isNarrow = window.matchMedia("(max-width: 600px)").matches;
const online = navigator.onLine;
const lang = navigator.language;                        // "en-IN"
const timer = setTimeout(() => console.log("idle"), 3000);
sessionStorage.setItem("checkout:step", "2");

// window is the global object that holds both
console.log(window.document === document); // true: the DOM is reachable from the BOM's window`,
    walkthrough:
      "The first block works with the document: querying, creating, appending, and handling events on nodes. The second block works with the browser environment: reading the URL, pushing a history entry, checking a media query, connectivity, and language, setting a timer, and using session storage. The last line shows the relationship: the document is a property of window, which is the root of the BOM.",
    flow: ["window (BOM root)", "document (DOM root)", "APIs for content vs environment"],
    mistake:
      "Accessing window or document during server-side rendering. Neither exists on the server, so code must guard with typeof window !== 'undefined' or run in effects that only execute in the browser.",
    exercise:
      "Classify each as DOM or BOM: element.classList, navigator.clipboard, history.back(), document.title, screen.width.",
    answer:
      "DOM: element.classList and document.title. BOM: navigator.clipboard, history.back(), and screen.width.",
    deepDive: [
      {
        heading: "Common BOM APIs in frontend design",
        points: [
          "location and history: client-side routing and deep links.",
          "navigator.onLine, connection, userAgentData, serviceWorker: capability and network-aware features.",
          "matchMedia: responsive behaviour and prefers-reduced-motion or color-scheme.",
          "localStorage, sessionStorage, indexedDB: persistence.",
          "requestAnimationFrame, requestIdleCallback: scheduling work.",
        ],
      },
    ],
    animation: {
      title: "The window holds both models",
      nodes: [
        ["window", "window", "global object"],
        ["document", "document", "DOM tree"],
        ["location", "location/history", "URL + navigation"],
        ["navigator", "navigator", "device + browser"],
        ["storage", "storage + timers", "environment"],
      ],
      steps: [
        ["window", "document", "DOM", "window.document is the entry point to the page's content tree."],
        ["window", "location", "BOM", "location and history read and change the URL for routing."],
        ["window", "navigator", "BOM", "navigator reports language, connectivity, and capabilities."],
        ["window", "storage", "BOM", "Storage and timers belong to the browsing environment, not the document."],
      ],
    },
  }),

  "browser-concepts--css-positioning": fsd({
    intro:
      "CSS positioning controls where elements sit relative to normal flow, their containing block, the viewport, or a scroll container. Static, relative, absolute, fixed, and sticky each solve different layout problems, and understanding containing blocks and stacking contexts prevents the classic bugs: dropdowns clipped by overflow, modals under headers, and sticky headers that do not stick.",
    concepts: [
      "static is normal flow. relative keeps the element in flow but offsets it visually and creates a containing block for absolute children. absolute removes it from flow and positions it against the nearest positioned ancestor.",
      "fixed positions against the viewport, unless an ancestor has transform, filter, or contain, which turns that ancestor into its containing block. sticky behaves like relative until a scroll threshold, then sticks within its scroll container and parent.",
      "z-index only compares elements within the same stacking context. New stacking contexts are created by positioned elements with z-index, opacity below 1, transform, filter, isolation: isolate, and others, which is why a modal's huge z-index can still lose.",
    ],
    code: `/* Card badge: absolute inside a relative card */
.card { position: relative; }
.card .badge { position: absolute; top: 8px; inset-inline-end: 8px; }

/* Sticky table header: sticks within the scrolling container */
.table-wrap { max-height: 420px; overflow: auto; }
.table-wrap thead th { position: sticky; top: 0; background: var(--surface); z-index: 1; }

/* Fixed bottom nav on mobile, with safe-area padding */
.bottom-nav { position: fixed; inset-inline: 0; bottom: 0; padding-bottom: env(safe-area-inset-bottom); }

/* Dropdown clipped by overflow: hidden on an ancestor? Render it in a portal or use the top layer */
.menu { position: absolute; top: 100%; inset-inline-start: 0; }

/* Modern alternative: popover + anchor positioning puts the menu in the top layer */
/* <button popovertarget="m" style="anchor-name: --trigger">Sort</button>
   <div id="m" popover style="position-anchor: --trigger; top: anchor(bottom); left: anchor(left)">…</div> */

/* Stacking contexts: isolate a component so its z-indexes stay local */
.carousel { isolation: isolate; }`,
    walkthrough:
      "The badge positions itself against its relative card. The sticky header sticks to the top of its scroll container, needs a background so rows do not show through, and a z-index above cells. The fixed bottom nav respects the phone's safe area. Dropdowns inside overflow-hidden containers get clipped, so they are rendered in a portal or, in modern browsers, as a popover in the top layer positioned with anchor positioning. isolation: isolate keeps a component's internal z-indexes from fighting the page.",
    flow: ["Pick the positioning scheme", "Know the containing block", "Manage stacking contexts"],
    mistake:
      "Fixing a modal hidden behind a header by raising its z-index to 999999. If the modal is inside a parent that creates a stacking context with a lower z-index, no value will help; move it to a portal or the top layer.",
    exercise:
      "A position: sticky sidebar does not stick at all. Name two common causes.",
    answer:
      "An ancestor has overflow: hidden, auto, or scroll, which becomes the scroll container the element sticks within, or the element has no top value set. It also cannot stick beyond the bounds of its parent, so a parent with the same height as the sidebar leaves no room.",
    deepDive: [
      {
        heading: "The top layer",
        paragraphs: [
          "Dialogs opened with showModal() and elements with the popover attribute render in the browser's top layer, above every stacking context in the document, without z-index. They also get backdrop styling via ::backdrop. This removes most z-index wars for overlays.",
        ],
      },
    ],
    animation: {
      title: "Where an absolute element anchors",
      nodes: [
        ["badge", "Badge", "absolute"],
        ["card", "Card", "relative"],
        ["page", "Page", "static body"],
        ["viewport", "Viewport", "fixed reference"],
      ],
      steps: [
        ["badge", "card", "nearest positioned", "The badge looks up its ancestors and finds the relative card first."],
        ["card", "badge", "top + end", "Its offsets are measured from the card's padding box."],
        ["badge", "page", "if no relative", "Without a positioned ancestor it would anchor to the initial containing block."],
        ["viewport", "badge", "fixed", "With position: fixed it would anchor to the viewport instead."],
      ],
    },
  }),

  "browser-concepts--polyfills-and-browser-support": fsd({
    intro:
      "Your users run many browsers and versions, including older WebKit-based browsers on iPhones that cannot update, embedded webviews, and TVs. A browser support strategy defines which browsers you target, uses feature detection and progressive enhancement, and adds polyfills or transpilation only where needed, without punishing modern browsers with unnecessary code.",
    concepts: [
      "Define targets with Browserslist from real analytics, for example the last two versions of major browsers plus Safari 16 and above. Build tools use it to decide which syntax to transpile and which CSS prefixes to add.",
      "Transpilation rewrites syntax, such as optional chaining, for older engines; polyfills add missing APIs, such as structuredClone, at runtime. Load polyfills conditionally or use differential serving so modern browsers do not download them.",
      "Prefer feature detection and progressive enhancement over user-agent sniffing. Check if ('IntersectionObserver' in window) or CSS @supports, provide a working baseline, and layer enhancements where supported.",
    ],
    code: `// package.json: one source of truth for build tools
{ "browserslist": ["> 0.5% in IN", "last 2 versions", "Safari >= 16", "not dead"] }

// Feature detection with a conditional polyfill (loaded only where missing)
async function ensureFeatures() {
  const needed = [];
  if (!("structuredClone" in globalThis)) needed.push(import("core-js/actual/structured-clone"));
  if (!Array.prototype.findLast) needed.push(import("core-js/actual/array/find-last"));
  await Promise.all(needed);
}
await ensureFeatures();

// Progressive enhancement: baseline works everywhere, enhancement where supported
if ("IntersectionObserver" in window) {
  lazyLoadImagesWithObserver();
} else {
  document.querySelectorAll("img[data-src]").forEach((img) => (img.src = img.dataset.src)); // load eagerly
}

/* CSS: enhance with @supports, keep a solid fallback */
/* .layout { display: flex; flex-wrap: wrap; }
   @supports (display: grid) { .layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
   @supports (container-type: inline-size) { .card-wrap { container-type: inline-size; } } */

// WebKit specifics worth testing: 100dvh vs 100vh with the iOS toolbar, date inputs,
// autoplay rules (muted + playsinline), and IndexedDB behaviour in private mode.`,
    walkthrough:
      "Browserslist encodes the support policy from analytics, so Babel, SWC, PostCSS, and Autoprefixer all agree. Polyfills load only in browsers missing the feature, so modern users download nothing extra. Lazy loading uses IntersectionObserver where available and falls back to eager loading elsewhere, which is slower but still correct. CSS starts with a flex layout that works everywhere and upgrades to grid and container queries when supported.",
    flow: ["Set targets from data", "Detect features", "Polyfill or degrade gracefully"],
    mistake:
      "Shipping a blanket polyfill bundle to every user. Modern browsers download and parse tens of kilobytes they never use, slowing the majority to support a small minority.",
    exercise:
      "Analytics show 3% of your users on iOS 15 Safari, where a dialog API you use is missing. What are your options?",
    answer:
      "Polyfill the dialog element conditionally for those browsers, or fall back to a simpler accessible modal implementation detected at runtime. Weigh it against the cost; at 3% of users on a key flow, supporting them is usually worth it. Add that browser to automated tests.",
    deepDive: [
      {
        heading: "Testing across browsers",
        points: [
          "Run E2E tests on Chromium, Firefox, and WebKit with Playwright.",
          "Use real-device clouds for iOS Safari and Android webviews.",
          "Watch error monitoring grouped by browser to catch unsupported APIs.",
          "Check Baseline status on MDN when adopting new web platform features.",
        ],
      },
    ],
    animation: {
      title: "One build, different browsers",
      nodes: [
        ["targets", "Browserslist", "from analytics"],
        ["build", "Build", "transpile syntax"],
        ["modern", "Modern browser", "no polyfills"],
        ["older", "Older Safari", "missing API"],
        ["polyfill", "Polyfill chunk", "loaded on demand"],
      ],
      steps: [
        ["targets", "build", "config", "Targets tell the build which syntax must be transpiled."],
        ["build", "modern", "ship", "Modern browsers run the code with no extra downloads."],
        ["build", "older", "ship", "An older Safari runs the same bundle and feature detection finds a missing API."],
        ["older", "polyfill", "import", "Only that browser fetches the small polyfill chunk before continuing."],
      ],
    },
  }),

  "browser-concepts--quality-checks-unit-component-and-e2e": fsd({
    intro:
      "Quality checks for a frontend come in three main sizes: unit tests for pure logic, component tests that render a component in isolation with its real behaviour, and end-to-end tests that drive the whole app in a real browser. Knowing exactly what each one proves, and what it cannot, lets you place every check at the cheapest level that still catches the bug.",
    concepts: [
      "Unit tests (UT) exercise functions and hooks without a browser: formatting, reducers, validators. They run in milliseconds and pin edge cases, but cannot tell you whether the UI works.",
      "Component tests (CT) render one component, either in jsdom with Testing Library or in a real browser with Playwright or Cypress component testing, and interact with it through the DOM. They catch rendering, accessibility, and interaction bugs with fast feedback.",
      "End-to-end tests (E2E) run the deployed or locally served app with a real backend or realistic mocks. They prove that pages, routing, APIs, and integrations work together, but are slower and need careful data management.",
    ],
    code: `// UT: pure logic
import { expect, test } from "vitest";
import { validatePincode } from "./validators";
test("accepts six-digit pincodes only", () => {
  expect(validatePincode("560001")).toBe(true);
  expect(validatePincode("56001")).toBe(false);
  expect(validatePincode("56000A")).toBe(false);
});

// CT: one component, real DOM behaviour, mocked dependencies
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
test("shows an error for an invalid pincode", async () => {
  render(<DeliveryCheck checkAvailability={async () => ({ deliverable: true })} />);
  await userEvent.type(screen.getByLabelText("Pincode"), "56001");
  await userEvent.click(screen.getByRole("button", { name: "Check" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a 6-digit pincode");
});

// E2E: the whole journey in a real browser
import { test as e2e, expect as expectE2E } from "@playwright/test";
e2e("product page shows delivery date for a valid pincode", async ({ page }) => {
  await page.goto("/products/p_demo0001");
  await page.getByLabel("Pincode").fill("560001");
  await page.getByRole("button", { name: "Check" }).click();
  await expectE2E(page.getByText(/delivery by/i)).toBeVisible();
});`,
    walkthrough:
      "The unit test pins the validation rules with several inputs in microseconds. The component test proves the DeliveryCheck component wires that validation to the UI correctly, showing an accessible alert, with the availability service injected as a fake. The E2E test proves that on the real product page, with real routing and API, a valid pincode produces a delivery date. Each layer catches bugs the others would miss.",
    flow: ["UT: logic", "CT: component behaviour", "E2E: integrated journey"],
    mistake:
      "Writing E2E tests for every validation edge case. Each one takes seconds and adds flakiness; push combinatorial cases down to unit tests and keep E2E for the journey.",
    exercise:
      "Which level would catch: a wrong rounding rule, a button missing its accessible name, and a broken API URL after a backend change?",
    answer:
      "Rounding rule: a unit test. Missing accessible name: a component test querying by role and name (or an axe check). Broken API URL: an E2E test or a contract test against the real API, since mocked component tests would not notice.",
    deepDive: [
      {
        heading: "Contract tests fill a gap",
        paragraphs: [
          "Between component tests with mocks and E2E against real services, contract tests check that the frontend's expectations of an API, such as fields and status codes, match what the backend actually provides. Generating mocks from an OpenAPI or GraphQL schema keeps component tests honest too.",
        ],
      },
    ],
    animation: {
      title: "Placing checks at the right level",
      nodes: [
        ["bug", "Bug types", "logic, UI, wiring"],
        ["ut", "Unit test", "milliseconds"],
        ["ct", "Component test", "seconds"],
        ["e2e", "E2E test", "minutes"],
        ["ci", "CI pipeline", "fast to slow"],
      ],
      steps: [
        ["bug", "ut", "logic", "A wrong pincode rule is caught by a fast unit test."],
        ["bug", "ct", "UI", "A missing accessible name is caught by a component test using roles."],
        ["bug", "e2e", "wiring", "A broken API URL is caught only when the real app runs end to end."],
        ["ut", "ci", "order", "CI runs unit tests first, then component tests, then E2E, failing fast."],
      ],
    },
  }),

  "browser-concepts--the-radio-framework": fsd({
    intro:
      "RADIO is a simple structure for answering frontend system design questions: Requirements, Architecture, Data model, Interface definition, and Optimizations. It keeps your answer complete and ordered under time pressure, and it maps neatly onto how real design documents are written. Treat it as a checklist, not a script.",
    concepts: [
      "Requirements: clarify scope, users, devices, and non-functional needs such as performance targets, offline, accessibility, internationalisation, and scale. Agree on what you will and will not design.",
      "Architecture and Data model: sketch the main client components and how they talk to servers (rendering strategy, state, caching, transport), then define the entities the client holds and where each lives, such as server cache, client store, or URL.",
      "Interface and Optimizations: define the API contracts between client and server and the key component APIs, then go deep on performance, network, rendering, accessibility, security, and failure handling for the most important interactions.",
    ],
    code: `// RADIO notes for "Design an autocomplete component" (what you might write on the whiteboard)
const radio = {
  R: {
    functional: ["suggest as user types", "keyboard selection", "recent searches"],
    nonFunctional: ["results < 300ms after pause", "works on mobile", "WCAG combobox", "i18n text"],
    outOfScope: ["search results page", "ranking algorithm"],
  },
  A: ["Input (combobox)", "Controller hook: debounce, cache, cancel", "Listbox (virtualised for long lists)", "API client"],
  D: {
    client: { query: "string", results: "Suggestion[]", activeIndex: "number", cache: "Map<query, Suggestion[]>" },
    Suggestion: { id: "string", label: "string", type: "product | category", thumbnail: "url?" },
  },
  I: {
    api: "GET /suggest?q=sho&limit=8 → { items: Suggestion[] }",
    component: "<Autocomplete onSelect(item) fetchSuggestions(q, signal) minChars=2 debounceMs=250 />",
  },
  O: ["debounce + AbortController", "LRU cache, prefetch popular prefixes", "aria-activedescendant", "highlight safely (no innerHTML)", "offline: show recent searches"],
};`,
    walkthrough:
      "Each letter becomes a short section. Requirements set the bar, including what is out of scope. Architecture lists the parts and their responsibilities. The data model states exactly what the client stores. Interface definitions give both the network contract and the component's props, which shows you can design reusable APIs. Optimizations is where you spend the most time, picking the issues that matter most for this product.",
    flow: ["Requirements", "Architecture + Data model", "Interface + Optimizations"],
    mistake:
      "Spending half the interview on requirements and architecture boxes, leaving no time for the deep dives where seniority is assessed. Timebox each step and steer towards optimizations.",
    exercise:
      "Apply RADIO briefly to 'Design a news feed'. What would you put under Interface?",
    answer:
      "GET /feed?cursor&limit returning items with nextCursor; POST /posts/:id/reactions; an SSE endpoint for new posts; and component interfaces such as <Feed /> rendering <FeedItem id /> from a normalized store, plus a PostRenderer registry keyed by post type.",
    deepDive: [
      {
        heading: "Suggested time split for 45 minutes",
        points: [
          "Requirements: about 5 minutes.",
          "Architecture: about 10 minutes.",
          "Data model and Interface: about 10 minutes.",
          "Optimizations and deep dives: about 15 to 20 minutes, leaving a few minutes for questions.",
        ],
      },
    ],
    animation: {
      title: "Walking through RADIO",
      nodes: [
        ["r", "Requirements", "scope + NFRs"],
        ["a", "Architecture", "components"],
        ["d", "Data model", "client entities"],
        ["i", "Interface", "API + props"],
        ["o", "Optimizations", "deep dives"],
      ],
      steps: [
        ["r", "a", "constraints", "Agreed requirements, such as mobile and accessibility, shape the architecture."],
        ["a", "d", "what data", "Each component's responsibilities reveal the data the client must hold."],
        ["d", "i", "contracts", "The data model turns into API payloads and component props."],
        ["i", "o", "go deep", "With contracts fixed, time goes to performance, accessibility, and failures."],
        ["o", "r", "check back", "Optimizations are checked against the original requirements before wrapping up."],
      ],
    },
  }),

  "browser-concepts--approaching-machine-coding-rounds": fsd({
    intro:
      "A machine coding round asks you to build a working UI feature, such as a todo app, file explorer, star rating, or autocomplete, in 60 to 90 minutes. Interviewers look for a working result, clean structure, sensible state, edge cases, and communication. A repeatable approach helps you deliver under time pressure instead of getting lost in details.",
    concepts: [
      "Clarify and plan for the first few minutes: confirm features, constraints (libraries allowed, styling expectations), and edge cases, then sketch components, state, and data flow before writing code.",
      "Build incrementally: get the core happy path working end to end first with simple markup, then add features one at a time, keeping the app runnable at every step. Style and polish last, unless the problem is about layout.",
      "Show engineering quality: meaningful names, small components, state in the right place, accessible elements, handling empty, loading, and error states, and talking through trade-offs and what you would do with more time.",
    ],
    code: `// Example plan for "Build a nested file explorer" written in the first 5 minutes
// Features: expand/collapse folders, add file/folder, rename, delete, keyboard navigation (stretch)
// Data: normalized { byId: { id, name, type: "file" | "folder", parentId, childIds } }, rootId
// Components: <Explorer> → <TreeNode id> (recursive) → <NodeActions>
// State: data in a reducer at <Explorer>; expanded Set; editingId
// Order: 1) render tree 2) expand/collapse 3) add 4) rename 5) delete 6) a11y/keys 7) styles

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const id = crypto.randomUUID();
      const node = { id, name: action.name, type: action.nodeType, parentId: action.parentId, childIds: [] };
      const parent = state.byId[action.parentId];
      return { ...state, byId: { ...state.byId, [id]: node, [parent.id]: { ...parent, childIds: [...parent.childIds, id] } } };
    }
    case "rename":
      return { ...state, byId: { ...state.byId, [action.id]: { ...state.byId[action.id], name: action.name } } };
    case "delete": {
      const byId = { ...state.byId };
      const removeTree = (id) => { byId[id].childIds.forEach(removeTree); delete byId[id]; };
      const parent = byId[byId[action.id].parentId];
      byId[parent.id] = { ...parent, childIds: parent.childIds.filter((c) => c !== action.id) };
      removeTree(action.id);
      return { ...state, byId };
    }
    default:
      return state;
  }
}`,
    walkthrough:
      "The plan comment captures scope, data shape, component tree, state placement, and build order before any UI code, which also gives the interviewer something to react to early. A normalized model makes add, rename, and delete simple, local updates; deletion recursively removes the subtree and unlinks it from its parent. With the reducer in place, the recursive TreeNode component and actions come together quickly, and accessibility and styling follow in the remaining time.",
    flow: ["Clarify and plan", "Build the happy path", "Iterate, harden, explain"],
    mistake:
      "Spending the first 30 minutes on project setup, styling, or a perfect folder structure. You run out of time with a beautiful header and no working feature.",
    exercise:
      "With 15 minutes left, your file explorer works but has no keyboard support and no styling. What do you prioritise and what do you say?",
    answer:
      "Add basic keyboard support or at least use real buttons and correct ARIA (tree and treeitem with aria-expanded), handle an obvious edge case such as empty names, then spend the last minutes explaining what you would add next: full arrow-key navigation, drag and drop, persistence, and tests.",
    deepDive: [
      {
        heading: "A checklist to run before you say done",
        points: [
          "Empty, loading, and error states handled?",
          "Long text, many items, and rapid clicks handled?",
          "Interactive elements are buttons, links, or inputs with labels?",
          "No console errors or warnings, and keys on lists?",
          "Can you explain your state shape and one trade-off you made?",
        ],
      },
    ],
    animation: {
      title: "Using the time well",
      nodes: [
        ["clarify", "Clarify", "5 min"],
        ["plan", "Plan", "data + components"],
        ["core", "Core path", "working early"],
        ["features", "Features", "one at a time"],
        ["polish", "Polish + talk", "a11y, edges"],
      ],
      steps: [
        ["clarify", "plan", "scope", "Confirm features and constraints, then note what is a stretch goal."],
        ["plan", "core", "build", "Sketch the data shape and components, then build the happy path first."],
        ["core", "features", "iterate", "Add features one by one, keeping the app runnable after each."],
        ["features", "polish", "harden", "Handle edge cases, accessibility, and styling with the remaining time."],
        ["polish", "clarify", "explain", "Close by explaining trade-offs and what you would do next."],
      ],
    },
  }),
};
