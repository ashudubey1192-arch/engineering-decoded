// Low-level design (machine coding) lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const designLessons = {
  "low-level-design--component-design": fsd({
    intro:
      "Component design is deciding how a piece of UI is split, what it owns, and what API it exposes. Well-designed components are easy to use correctly, hard to use incorrectly, and flexible enough for the next three use cases without a rewrite. In machine coding rounds and real codebases alike, this is where frontend seniority shows.",
    concepts: [
      "Separate concerns: data fetching and business logic in hooks or containers, presentation in components that receive props. Presentational components are easy to test, reuse, and show in a component explorer such as Storybook.",
      "Design the API from the consumer's point of view. Prefer a few clear props, sensible defaults, controlled and uncontrolled modes for inputs, and composition through children or slots instead of an ever-growing list of boolean flags.",
      "Compound components share implicit state through context, such as Tabs with Tabs.List, Tabs.Tab, and Tabs.Panel. They give consumers control over markup and layout while the parent keeps behaviour consistent and accessible.",
    ],
    code: `import { createContext, useContext, useId, useState } from "react";

const DisclosureContext = createContext(null);

// Compound, optionally controlled component
export function Disclosure({ open: controlledOpen, defaultOpen = false, onOpenChange, children }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const id = useId();

  function setOpen(next) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }
  return <DisclosureContext.Provider value={{ open, setOpen, id }}>{children}</DisclosureContext.Provider>;
}

Disclosure.Button = function DisclosureButton({ children, ...props }) {
  const { open, setOpen, id } = useContext(DisclosureContext);
  return (
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} {...props}>
      {children}
    </button>
  );
};

Disclosure.Panel = function DisclosurePanel({ children, ...props }) {
  const { open, id } = useContext(DisclosureContext);
  return <div id={id} hidden={!open} {...props}>{children}</div>;
};

// Usage: consumers own layout, the component owns behaviour and accessibility
<Disclosure defaultOpen>
  <Disclosure.Button className="faq-q">What is the return policy?</Disclosure.Button>
  <Disclosure.Panel className="faq-a">30 days, free returns.</Disclosure.Panel>
</Disclosure>`,
    walkthrough:
      "Disclosure keeps open state internally unless the parent passes open, in which case it becomes controlled and reports changes through onOpenChange. The button and panel read shared state from context, wire up aria-expanded and aria-controls automatically, and spread remaining props so consumers can style them. The same component powers FAQ items, filter groups, and accordion sections.",
    flow: ["Define responsibilities", "Design the props API", "Compose and stay accessible"],
    mistake:
      "Growing a component by adding booleans: showIcon, isCompact, hasBorder, isDanger, iconRight. The combinations explode and many are invalid. Use variants for mutually exclusive styles and composition for optional parts.",
    exercise:
      "Design the props for a reusable Modal used for confirmations, forms, and image previews.",
    answer:
      "open and onOpenChange for control, a title or aria-labelledby for naming, children for content, optional initialFocusRef, and size variants. Footer actions are passed as children or a footer slot, not as config, so each use case composes its own buttons.",
    deepDive: [
      {
        heading: "A component design checklist",
        points: [
          "What does it own, and what does the parent own?",
          "Controlled, uncontrolled, or both?",
          "Which states exist: loading, empty, error, disabled?",
          "How does it behave with long text, RTL languages, and small screens?",
          "Keyboard behaviour and ARIA pattern?",
          "How will it be tested and documented?",
        ],
      },
    ],
    animation: {
      title: "A compound component sharing state",
      nodes: [
        ["parent", "Disclosure", "owns open"],
        ["context", "Context", "open, setOpen"],
        ["button", "Button", "aria-expanded"],
        ["panel", "Panel", "hidden?"],
        ["consumer", "Consumer", "onOpenChange"],
      ],
      steps: [
        ["parent", "context", "provide", "Disclosure provides open state and an ID through context."],
        ["button", "context", "toggle", "Clicking the button calls setOpen from context."],
        ["context", "panel", "open", "The panel reads the new state and becomes visible."],
        ["context", "button", "expanded", "The button updates aria-expanded so screen readers hear the change."],
        ["parent", "consumer", "callback", "onOpenChange lets a controlling parent react or persist the state."],
      ],
    },
  }),

  "low-level-design--design-systems": fsd({
    intro:
      "A design system is the shared language of a product: design tokens, accessible components, patterns, and guidelines, published as code and design assets with versioning and documentation. It lets many teams ship consistent, accessible interfaces faster. Designing one is a system design problem with its own architecture, governance, and release process.",
    concepts: [
      "Tokens are the foundation: named values for colour, spacing, typography, radius, shadow, and motion, organised in layers from raw palette values to semantic roles like color.text.danger, and exported to CSS variables, platform files, and design tools.",
      "Components implement patterns once with accessibility, theming, and responsive behaviour built in. Headless primitives for behaviour plus styled components for the brand let teams customise without forking.",
      "Distribution and governance: publish as versioned packages with semantic versioning, changelogs, and codemods for breaking changes; document in a living site with live examples; and run a contribution process so product teams can propose additions.",
    ],
    code: `/* tokens.css: generated from a single tokens.json source */
:root {
  /* primitive */
  --blue-600: #1a56db; --red-700: #b91c1c; --gray-900: #111827; --gray-50: #f9fafb;
  --space-2: 0.5rem; --space-4: 1rem; --radius-md: 8px;
  /* semantic */
  --color-bg: var(--gray-50);
  --color-text: var(--gray-900);
  --color-action: var(--blue-600);
  --color-danger: var(--red-700);
}
[data-theme="dark"] {
  --color-bg: #0b1220; --color-text: #e5e7eb; --color-action: #60a5fa;
}

// Button.jsx: variants map to tokens, never to raw colours
const variants = {
  primary: { background: "var(--color-action)", color: "white" },
  danger: { background: "var(--color-danger)", color: "white" },
  ghost: { background: "transparent", color: "var(--color-action)" },
};

export function Button({ variant = "primary", size = "md", loading = false, children, ...props }) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      disabled={props.disabled || loading}
      style={{ ...variants[variant], padding: size === "sm" ? "var(--space-2)" : "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)" }}
    >
      {loading ? <Spinner aria-hidden="true" /> : null}
      {children}
    </button>
  );
}`,
    walkthrough:
      "Primitive tokens hold raw values; semantic tokens give them meaning, and themes swap semantic values without touching components. The Button exposes variant, size, and loading instead of colour props, so every team's buttons stay on brand and accessible. Changing --color-action in one place updates every primary button in every product that consumes the package.",
    flow: ["Define tokens", "Build accessible components", "Version, document, govern"],
    mistake:
      "Letting components accept arbitrary className or style overrides for everything. Within months every team has a slightly different button, and the system no longer guarantees consistency or accessibility.",
    exercise:
      "Your design system needs to support three brands with different colours and fonts. How do you architect it?",
    answer:
      "Keep components brand-neutral and driven by semantic tokens, create a token set per brand that maps the same semantic names to different values, and load the brand's token CSS at the app root. Components, tests, and docs stay shared.",
    deepDive: [
      {
        heading: "Release and adoption",
        points: [
          "Semantic versioning: patch for fixes, minor for additions, major for breaking API changes.",
          "Visual regression tests on every component story to catch unintended changes.",
          "Usage analytics, such as scanning repositories for imports, to know who will be affected by a change.",
          "Codemods that automatically migrate consumers to new APIs.",
        ],
      },
    ],
    animation: {
      title: "A token change flowing to products",
      nodes: [
        ["tokens", "tokens.json", "source of truth"],
        ["build", "Token build", "CSS, iOS, Android"],
        ["components", "Components", "use semantic vars"],
        ["package", "npm package", "v3.2.0"],
        ["apps", "Product apps", "upgrade"],
      ],
      steps: [
        ["tokens", "build", "edit", "The brand's action colour is updated in tokens.json."],
        ["build", "components", "generate", "The build regenerates CSS variables and platform token files."],
        ["components", "package", "release", "Visual tests pass and a minor version is published with a changelog."],
        ["package", "apps", "upgrade", "Product apps upgrade and every primary button updates at once."],
      ],
    },
  }),

  "low-level-design--config-driven-ui": fsd({
    intro:
      "Config-driven UI renders screens from data rather than hard-coded components. A server or CMS sends a JSON description, such as which widgets appear on the homepage, in which order, with which data, and the client maps each entry to a registered component. It lets teams change layouts per city, user segment, or experiment without shipping new code.",
    concepts: [
      "The client keeps a registry mapping widget types to components. The config only references known types and passes props, so the server controls composition while the client controls rendering, behaviour, and security.",
      "Configs need a schema and versioning. Validate them on the server before publishing and again on the client, ignore unknown widget types gracefully, and include a minimum app version for widgets that need new code.",
      "Use it where variation is real, such as marketing pages, dashboards, forms built by operations teams, or market-specific homepages. Fully generic, logic-in-JSON systems become hard to debug, so keep business logic in code.",
    ],
    code: `// Config from the server for a food delivery homepage in one city
const homeConfig = {
  version: 3,
  widgets: [
    { id: "w1", type: "banner_carousel", props: { banners: ["diwali-offer", "free-delivery"] } },
    { id: "w2", type: "category_grid", props: { title: "What's on your mind?", categories: ["biryani", "pizza", "dosa"] } },
    { id: "w3", type: "restaurant_list", props: { title: "Top picks near you", query: { sort: "rating", limit: 20 } } },
    { id: "w4", type: "new_widget_type", props: {} }, // unknown to older clients
  ],
};

// Client registry: the only components config can ask for
const registry = {
  banner_carousel: lazy(() => import("./widgets/BannerCarousel")),
  category_grid: lazy(() => import("./widgets/CategoryGrid")),
  restaurant_list: lazy(() => import("./widgets/RestaurantList")),
};

export function ConfigPage({ config }) {
  return (
    <main>
      {config.widgets.map((widget) => {
        const Widget = registry[widget.type];
        if (!Widget) return null; // forward compatible: skip unknown types
        return (
          <ErrorBoundary key={widget.id} fallback={null}>
            <Suspense fallback={<WidgetSkeleton type={widget.type} />}>
              <Widget {...widget.props} />
            </Suspense>
          </ErrorBoundary>
        );
      })}
    </main>
  );
}`,
    walkthrough:
      "The server decides that this city's homepage shows a carousel, a category grid, and a restaurant list, in that order. The client renders each through its registry, code-splits widgets so unused types are never downloaded, isolates each in an error boundary so one bad widget does not blank the page, and silently skips the type it does not recognise yet.",
    flow: ["Server sends layout config", "Client maps types to components", "Render with isolation"],
    mistake:
      "Letting config contain arbitrary HTML, scripts, or URLs that are rendered without validation. A compromised CMS account then becomes an XSS attack on every user.",
    exercise:
      "Product wants to reorder homepage sections per user segment and A/B test a new widget. What do you need in the config system?",
    answer:
      "Server-side config resolution by segment and experiment bucket, schema validation and preview before publishing, a widget registry entry and minimum version for the new widget, exposure logging per widget, and a fallback config if resolution fails.",
    deepDive: [
      {
        heading: "Config-driven forms",
        code: `const fields = [
  { name: "fullName", type: "text", label: "Full name", required: true },
  { name: "plan", type: "select", label: "Plan", options: ["Basic", "Pro"] },
  { name: "gst", type: "text", label: "GST number", showIf: { field: "plan", equals: "Pro" } },
];
// A FormRenderer maps type → input component and evaluates simple showIf rules.`,
      },
    ],
    animation: {
      title: "Rendering a page from config",
      nodes: [
        ["cms", "Config service", "per city"],
        ["client", "Client", "fetch config"],
        ["registry", "Registry", "type → component"],
        ["widgets", "Widgets", "lazy + isolated"],
        ["page", "Page", "rendered"],
      ],
      steps: [
        ["cms", "client", "JSON", "The config service returns the widget list for the user's city."],
        ["client", "registry", "lookup", "Each widget type is looked up in the client registry."],
        ["registry", "widgets", "load", "Known widgets are lazy-loaded; the unknown type is skipped."],
        ["widgets", "page", "render", "Each widget renders inside its own error boundary and skeleton."],
        ["cms", "page", "reorder", "Changing the order in config reorders the page without a deploy."],
      ],
    },
  }),

  "low-level-design--shimmer-ui": fsd({
    intro:
      "Shimmer UI, also called skeleton screens, shows grey placeholders shaped like the content that is about to load, often with a subtle moving highlight. It makes waiting feel shorter, reduces layout shift because space is reserved, and tells the user what kind of content is coming. Good skeletons match the final layout closely and respect accessibility and reduced motion.",
    concepts: [
      "Skeletons should mirror the real layout: same card sizes, image aspect ratios, and number of text lines. When content arrives, nothing jumps, which also protects Cumulative Layout Shift.",
      "Use skeletons for content areas that take more than a few hundred milliseconds; for very fast loads, delay showing them briefly to avoid a flash. For actions such as saving, a button spinner is clearer than a skeleton.",
      "Accessibility: mark the loading region with aria-busy, give screen readers a single status message instead of reading placeholder shapes, and disable the shimmer animation for users who prefer reduced motion.",
    ],
    code: `export function RestaurantCardSkeleton() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="sk-img" />            {/* same 16:9 ratio as the real image */}
      <div className="sk-line w-70" />
      <div className="sk-line w-40" />
    </div>
  );
}

export function RestaurantGrid() {
  const { data, isPending } = useRestaurants();
  return (
    <section aria-busy={isPending} aria-labelledby="top-picks">
      <h2 id="top-picks">Top picks near you</h2>
      {isPending && <p className="visually-hidden" role="status">Loading restaurants</p>}
      <div className="grid">
        {isPending
          ? Array.from({ length: 8 }, (_, i) => <RestaurantCardSkeleton key={i} />)
          : data.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
      </div>
    </section>
  );
}

/* skeleton.css */
/* .sk-img  { aspect-ratio: 16 / 9; border-radius: 8px; background: var(--sk-base); }
   .sk-line { height: 0.9rem; margin-top: 0.6rem; border-radius: 4px; background: var(--sk-base); }
   .skeleton > * { background-image: linear-gradient(90deg, transparent, var(--sk-shine), transparent);
                   background-size: 200% 100%; animation: shimmer 1.4s infinite; }
   @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
   @media (prefers-reduced-motion: reduce) { .skeleton > * { animation: none; } } */`,
    walkthrough:
      "While restaurants load, the grid renders eight skeleton cards with the same image ratio and line widths as the real cards, so the switch causes no layout shift. The section is marked busy, a single visually hidden status tells screen reader users what is happening, and the placeholder shapes themselves are hidden from assistive tech. The shimmer stops for users who prefer reduced motion.",
    flow: ["Reserve the real layout", "Show placeholders while loading", "Swap in content without shifts"],
    mistake:
      "Showing a generic full-page skeleton that does not match the final layout. When content arrives, everything jumps, which feels slower and hurts CLS.",
    exercise:
      "Data usually arrives in 120 ms but sometimes in 3 seconds. How do you avoid a skeleton flash on fast loads?",
    answer:
      "Delay showing the skeleton by about 200 ms, and once shown, keep it for a minimum duration such as 300 ms so it does not flicker. React's Suspense with transitions or a small useDelayedFlag hook can implement this.",
    deepDive: [
      {
        heading: "Skeletons and streaming",
        paragraphs: [
          "With streaming SSR, Suspense fallbacks are skeletons rendered on the server. The browser shows them immediately in the first HTML chunk, and streamed content replaces them, giving a fast first paint without client JavaScript for the loading state.",
        ],
      },
    ],
    animation: {
      title: "From skeleton to content",
      nodes: [
        ["request", "Load starts", "isPending"],
        ["skeleton", "Skeleton", "reserved layout"],
        ["status", "Status text", "for AT"],
        ["data", "Data arrives", "8 restaurants"],
        ["content", "Content", "no shift"],
      ],
      steps: [
        ["request", "skeleton", "render", "Skeleton cards with the real dimensions render while data loads."],
        ["request", "status", "announce", "Screen readers hear one message: Loading restaurants."],
        ["data", "content", "swap", "When data arrives, real cards replace skeletons in the same boxes."],
        ["skeleton", "content", "CLS 0", "Because sizes matched, nothing on the page moves."],
      ],
    },
  }),

  "low-level-design--routing-and-protected-routes": fsd({
    intro:
      "Routing maps URLs to screens, and protected routes make sure some of those screens are only reachable by signed-in or authorised users. In a single-page app this involves client-side navigation, nested layouts, data loading per route, redirects that remember where the user was going, and server-side checks that the client cannot bypass.",
    concepts: [
      "Client-side routing intercepts link clicks, updates the URL with the History API, and renders the matching route without a full page load. Nested routes share layouts, and route-based code splitting loads each screen's code on demand.",
      "Protection happens in layers. The client redirects unauthenticated users to sign-in and hides links they cannot use; the server or API enforces the same rules, because client checks are only UX.",
      "Remember intent. When redirecting to sign-in, carry the original path (validated to be on your own origin) and return the user there afterwards. Handle loading states while the session is being checked to avoid flashes of protected content or premature redirects.",
    ],
    code: `import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from "react-router";
import { lazy } from "react";

function RequireAuth({ role }) {
  const { user, status } = useSession(); // "loading" | "authenticated" | "anonymous"
  const location = useLocation();
  if (status === "loading") return <FullPageSpinner />;
  if (!user) return <Navigate to={\`/login?returnTo=\${encodeURIComponent(location.pathname + location.search)}\`} replace />;
  if (role && !user.roles.includes(role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  { path: "/", element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: "login", element: <Login /> },
    { element: <RequireAuth />, children: [
      { path: "orders", Component: lazy(() => import("./routes/Orders")) },
      { path: "orders/:id", Component: lazy(() => import("./routes/OrderDetail")) },
    ] },
    { element: <RequireAuth role="admin" />, children: [
      { path: "admin/*", Component: lazy(() => import("./routes/Admin")) },
    ] },
    { path: "*", element: <NotFound /> },
  ] },
]);

// After login: only allow same-origin relative paths
export function safeReturnTo(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function App() { return <RouterProvider router={router} />; }`,
    walkthrough:
      "RequireAuth is a layout route: it renders child routes through Outlet only when the session allows it. While the session is loading it shows a spinner instead of redirecting too early. Anonymous users are sent to login with a returnTo parameter, and safeReturnTo rejects absolute or protocol-relative URLs to prevent open redirects. Admin routes add a role check, and each protected screen is lazily loaded. The APIs behind these screens still check authorisation on every request.",
    flow: ["Match the URL", "Check session and role", "Render or redirect with intent"],
    mistake:
      "Shipping admin-only data inside the main bundle or initial API response and just hiding the admin route. Anyone can read it in devtools; protect data on the server and lazy-load admin code.",
    exercise:
      "A signed-in user's session expires while they are on /orders/42. What should happen on their next action?",
    answer:
      "The API returns 401, the app tries a silent refresh, and if that fails it redirects to login with returnTo=/orders/42, preserving any unsaved input where possible. After signing in, the user lands back on the same order.",
    deepDive: [
      {
        heading: "Routing design questions",
        points: [
          "Which state belongs in the URL, such as filters, tabs, and pagination?",
          "Which routes need server rendering for SEO, and which can be client-only?",
          "How are 404s and permission errors displayed?",
          "Do route changes move focus and update document.title for accessibility?",
        ],
      },
    ],
    animation: {
      title: "Visiting a protected route",
      nodes: [
        ["url", "URL", "/orders/42"],
        ["guard", "RequireAuth", "checks session"],
        ["login", "Login", "?returnTo="],
        ["route", "OrderDetail", "lazy loaded"],
        ["api", "API", "authorises"],
      ],
      steps: [
        ["url", "guard", "match", "The router matches /orders/42 under the RequireAuth layout."],
        ["guard", "login", "anonymous", "No session, so the user is redirected to login with returnTo."],
        ["login", "url", "return", "After signing in, safeReturnTo sends them back to /orders/42."],
        ["guard", "route", "allowed", "Now the guard renders the lazily loaded order screen."],
        ["route", "api", "GET /orders/42", "The API checks that this order belongs to the user before returning it."],
      ],
    },
  }),

  "low-level-design--state-management-libraries": fsd({
    intro:
      "When built-in React state and context are not enough, teams reach for libraries. Each makes different trade-offs: Redux Toolkit for predictable global updates with great tooling, Zustand for minimal stores, Jotai and Recoil-style atoms for fine-grained state, XState for complex flows, and TanStack Query or RTK Query for server state. Choosing well means matching the library to the kind of state.",
    concepts: [
      "Server-state libraries handle caching, deduplication, background refetching, and invalidation of remote data. For most apps they remove the majority of global state code.",
      "Client-state stores differ in model. Redux uses a single store, actions, and reducers with time-travel devtools; Zustand uses small hook-based stores with selectors; atomic libraries let components subscribe to individual pieces; state machines model explicit states and transitions.",
      "Evaluate by team needs: bundle size, devtools, TypeScript ergonomics, server rendering support, how updates trigger re-renders, and how easily state can be tested and persisted.",
    ],
    code: `// Same cart feature, three client-state approaches

// 1) Redux Toolkit: explicit actions, devtools, middleware
const cartSlice = createSlice({
  name: "cart",
  initialState: { items: {} },
  reducers: {
    added(state, { payload }) { state.items[payload.id] = (state.items[payload.id] ?? 0) + 1; },
    removed(state, { payload }) { delete state.items[payload.id]; },
  },
});
const count = useSelector((s) => Object.values(s.cart.items).reduce((a, b) => a + b, 0));

// 2) Zustand: a tiny store with selector subscriptions
const useCart = create((set) => ({
  items: {},
  add: (id) => set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + 1 } })),
}));
const countZ = useCart((s) => Object.values(s.items).reduce((a, b) => a + b, 0));

// 3) XState: when the flow, not the data, is the hard part
const checkoutMachine = createMachine({
  id: "checkout", initial: "cart",
  states: {
    cart: { on: { CHECKOUT: "address" } },
    address: { on: { NEXT: "payment", BACK: "cart" } },
    payment: { on: { PAY: "processing", BACK: "address" } },
    processing: { invoke: { src: "pay", onDone: "success", onError: "payment" } },
    success: { type: "final" },
  },
});`,
    walkthrough:
      "Redux Toolkit makes every change an action you can log, replay, and inspect, which helps large teams and complex debugging. Zustand achieves the same cart with less ceremony and fine-grained selectors. XState is a different tool: it makes impossible states such as paying from the cart step unrepresentable, which suits checkout and onboarding flows. Server data like product details would sit in a query library in all three cases.",
    flow: ["Classify the state", "Pick the model that fits", "Measure re-renders and DX"],
    mistake:
      "Adopting a heavy global store on day one and putting server responses in it. You end up rebuilding caching, loading flags, and invalidation by hand, which query libraries already solve.",
    exercise:
      "A dashboard has 30 independent filter widgets, each updated frequently, and a chart that depends on a few of them. Which state model avoids re-rendering everything on each change?",
    answer:
      "A fine-grained model: atoms per filter (Jotai) or a store with narrow selectors (Zustand or Redux with memoized selectors), so each widget and the chart subscribe only to the values they use.",
    deepDive: [
      {
        heading: "Quick comparison",
        points: [
          "Context + useReducer: built in, fine for low-frequency global state like theme or session.",
          "Redux Toolkit: structured, great devtools and middleware, more concepts to learn.",
          "Zustand: very small, simple API, selectors for performance.",
          "Jotai: atomic, derived atoms, good for many independent pieces.",
          "XState: explicit state machines for complex flows.",
          "TanStack Query, RTK Query, SWR, Apollo: server state.",
        ],
      },
    ],
    animation: {
      title: "Choosing a state tool",
      nodes: [
        ["state", "New state", "what kind?"],
        ["server", "Server data", "query library"],
        ["flow", "Complex flow", "state machine"],
        ["shared", "Shared client", "store / atoms"],
        ["local", "Local only", "useState"],
      ],
      steps: [
        ["state", "server", "remote?", "Product lists and orders come from the server, so a query library owns them."],
        ["state", "flow", "steps?", "Checkout has strict steps and transitions, so a state machine fits."],
        ["state", "shared", "many readers?", "The cart count is read across routes, so a small store holds it."],
        ["state", "local", "one component?", "Whether a tooltip is open stays in local state."],
      ],
    },
  }),

  "low-level-design--multi-language-support": fsd({
    intro:
      "Multi-language support, internationalization (i18n) and localization (l10n), means the app can be translated and formatted for different languages and regions without code changes. Beyond swapping strings, it covers plurals, gender, dates, numbers, currencies, right-to-left layouts, fonts, and loading translations efficiently.",
    concepts: [
      "Externalise every user-facing string into message catalogs keyed by ID, using ICU MessageFormat for variables, plurals, and selects. Never concatenate translated fragments, since word order differs between languages.",
      "Format data with the Intl APIs: Intl.NumberFormat for currency and numbers, Intl.DateTimeFormat and Intl.RelativeTimeFormat for dates, Intl.PluralRules for plural categories, and Intl.Collator for sorting names correctly.",
      "Layout must adapt: set lang and dir on the html element, use CSS logical properties such as margin-inline-start so RTL languages like Arabic and Hebrew mirror correctly, and allow text to grow by 30% or more in languages such as German.",
    ],
    code: `// messages/en.json
{ "cart.summary": "{count, plural, =0 {Your cart is empty} one {# item in your cart} other {# items in your cart}}",
  "order.eta": "Arrives {date}" }
// messages/hi.json
{ "cart.summary": "{count, plural, =0 {आपकी कार्ट खाली है} one {आपकी कार्ट में # आइटम} other {आपकी कार्ट में # आइटम}}",
  "order.eta": "{date} तक पहुँचेगा" }

// i18n.js: load only the active locale, lazily
import { IntlMessageFormat } from "intl-messageformat";
const loaders = { en: () => import("./messages/en.json"), hi: () => import("./messages/hi.json"), ar: () => import("./messages/ar.json") };

export async function createI18n(locale) {
  const messages = (await loaders[locale]()).default;
  document.documentElement.lang = locale;
  document.documentElement.dir = new Intl.Locale(locale).textInfo?.direction ?? (locale === "ar" ? "rtl" : "ltr");

  return {
    t: (id, values) => new IntlMessageFormat(messages[id] ?? id, locale).format(values),
    price: (amount, currency) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount),
    date: (d) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d),
  };
}

const i18n = await createI18n("hi");
i18n.t("cart.summary", { count: 3 });       // "आपकी कार्ट में 3 आइटम"
i18n.price(129900.5, "INR");                // "₹1,29,900.50" (Indian digit grouping)
i18n.t("order.eta", { date: i18n.date(new Date(2026, 10, 20)) });

/* RTL-friendly CSS */
/* .badge { margin-inline-start: 8px; padding-inline: 12px; text-align: start; } */`,
    walkthrough:
      "Messages use ICU plural syntax so each language defines its own plural forms. Only the active locale's catalog is downloaded. The html lang and dir attributes are set so screen readers pronounce text correctly and the browser lays out RTL languages. Intl formats the price with Indian digit grouping and the rupee symbol automatically, and logical CSS properties flip margins and padding for Arabic without separate stylesheets.",
    flow: ["Extract messages", "Format with Intl", "Adapt layout and direction"],
    mistake:
      "Building sentences like t('you_have') + count + t('items'). It breaks in languages with different word order or plural rules, and translators cannot fix it.",
    exercise:
      "Where should the chosen language be stored, and how should the first page load pick it?",
    answer:
      "Keep it in the URL path or subdomain (for example /hi/) for shareability and SEO, remember the user's explicit choice in a cookie or profile, and on the first visit fall back to the Accept-Language header. Server rendering then sends the right language in the first HTML.",
    deepDive: [
      {
        heading: "Translation workflow",
        points: [
          "Extract message IDs from code automatically and sync with a translation management system.",
          "Give translators context: screenshots, descriptions, and maximum lengths.",
          "Use pseudo-localisation in development, such as [Ŷöûŕ çåŕţ ìš éɱþţý!!!], to spot hard-coded strings and overflow.",
          "Fail CI on missing keys for supported locales.",
        ],
      },
    ],
    animation: {
      title: "Rendering a localized cart",
      nodes: [
        ["request", "Request", "Accept-Language: hi"],
        ["loader", "Loader", "hi.json only"],
        ["format", "Formatter", "ICU + Intl"],
        ["dom", "Document", "lang=hi dir=ltr"],
        ["ui", "Cart UI", "localized"],
      ],
      steps: [
        ["request", "loader", "pick hi", "The server picks Hindi from the cookie or Accept-Language."],
        ["loader", "format", "messages", "Only the Hindi catalog is loaded."],
        ["format", "ui", "3 आइटम", "ICU plural rules produce the right phrase for a count of 3."],
        ["format", "ui", "₹1,29,900.50", "Intl formats currency with Indian digit grouping."],
        ["loader", "dom", "lang, dir", "lang and dir are set so text direction and pronunciation are correct."],
      ],
    },
  }),

  "low-level-design--infinite-scroll": fsd({
    intro:
      "Infinite scroll loads the next page of content automatically as the user nears the end of a list. It suits feeds and discovery, where users browse rather than search for a specific item. A solid implementation uses an Intersection Observer sentinel, cursor pagination, request deduplication, virtualisation for long sessions, and accessible fallbacks.",
    concepts: [
      "An Intersection Observer watches a sentinel element near the bottom of the list, with a rootMargin so loading starts before the user actually reaches the end. This is far cheaper than listening to scroll events.",
      "Cursor-based pagination keeps pages stable as new items are added. Guard against duplicate requests while one is in flight, stop when hasMore is false, and handle errors with a retry button rather than infinite retries.",
      "After hundreds of items, the DOM becomes heavy. Virtualise the list so only visible rows exist, and preserve scroll position when users navigate to an item and come back.",
    ],
    code: `import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

export function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam, signal }) =>
      fetch(\`/api/feed?limit=20\${pageParam ? \`&cursor=\${pageParam}\` : ""}\`, { signal }).then((r) => r.json()),
    initialPageParam: null,
    getNextPageParam: (last) => last.nextCursor ?? undefined, // undefined → no more pages
  });

  const sentinel = useRef(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "600px 0px" }, // start loading ~one screen early
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <section aria-label="Feed" aria-busy={isFetchingNextPage}>
      <ol>{posts.map((post) => <li key={post.id}><Post post={post} /></li>)}</ol>
      {isError && <button onClick={() => fetchNextPage()}>Couldn't load more. Retry</button>}
      {hasNextPage ? <div ref={sentinel} aria-hidden="true" /> : <p>You're all caught up.</p>}
      {isFetchingNextPage && <p role="status">Loading more posts…</p>}
    </section>
  );
}`,
    walkthrough:
      "useInfiniteQuery stores pages and the next cursor, and refuses to fetch a page that is already loading. The observer fires when the sentinel comes within 600 pixels of the viewport, so new posts usually arrive before the user notices. Errors show a retry button, the end of the feed is announced clearly, and a status message tells screen reader users that more content is loading.",
    flow: ["Observe a sentinel", "Fetch next cursor page", "Append, virtualise, repeat"],
    mistake:
      "Placing important links such as the footer below an infinite list. Users can never reach them because new content keeps pushing them away; provide the footer elsewhere or switch to a Load more button.",
    exercise:
      "A user scrolls through 300 posts, opens one, and presses Back. What do you need so they land where they were?",
    answer:
      "Keep the loaded pages in the query cache, render the same list on return, and restore scroll position, either with the router's scroll restoration or by saving the offset or anchor item ID in sessionStorage. With virtualisation, restore by item index.",
    deepDive: [
      {
        heading: "Infinite scroll versus pagination",
        points: [
          "Infinite scroll: browsing feeds, image galleries, social content.",
          "Load more button: similar benefits, keeps the footer reachable and gives users control.",
          "Numbered pagination: search results, admin tables, anything users need to reference or return to.",
        ],
      },
    ],
    animation: {
      title: "Loading the next page early",
      nodes: [
        ["list", "Feed list", "20 posts"],
        ["sentinel", "Sentinel", "rootMargin 600px"],
        ["observer", "Observer", "isIntersecting"],
        ["api", "API", "cursor=abc"],
        ["virtual", "Virtualizer", "visible rows"],
      ],
      steps: [
        ["list", "sentinel", "scroll", "As the user scrolls, the sentinel approaches the viewport."],
        ["sentinel", "observer", "intersect", "It crosses the 600 px margin, so the observer fires."],
        ["observer", "api", "next page", "fetchNextPage requests the next 20 posts with the cursor."],
        ["api", "list", "append", "New posts are appended before the user reaches the end."],
        ["list", "virtual", "300 posts", "After many pages, only visible rows stay mounted in the DOM."],
      ],
    },
  }),

  "low-level-design--accordion": fsd({
    intro:
      "An accordion is a vertically stacked set of headings that expand and collapse panels of content. It is a classic machine coding question because it tests component API design, state modelling for single and multiple open panels, accessibility, and animation, all in a small amount of code.",
    concepts: [
      "Model open state as a set of IDs. Single mode keeps at most one ID; multiple mode allows many. Supporting both controlled and uncontrolled use makes the component reusable for FAQs, filters, and settings pages.",
      "Accessibility follows the ARIA accordion pattern: each header is a heading containing a button with aria-expanded and aria-controls, and each panel has an ID and aria-labelledby. Native details and summary elements provide a simpler built-in alternative.",
      "Animate height smoothly with CSS grid row transitions or interpolate-size, and respect reduced motion. Keep collapsed content in the DOM with hidden or content-visibility only when you want in-page search to find it.",
    ],
    code: `import { useId, useState } from "react";

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const base = useId();

  function toggle(id) {
    setOpen((current) => {
      const next = new Set(allowMultiple ? current : []);
      if (current.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const buttonId = \`\${base}-btn-\${item.id}\`;
        const panelId = \`\${base}-panel-\${item.id}\`;
        return (
          <div key={item.id} className="accordion-item">
            <h3>
              <button id={buttonId} aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(item.id)}>
                {item.title}
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="accordion-panel" data-open={isOpen}>
              <div>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Smooth height without measuring: animate grid rows from 0fr to 1fr */
/* .accordion-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 200ms ease; }
   .accordion-panel[data-open="true"] { grid-template-rows: 1fr; }
   .accordion-panel > div { overflow: hidden; }
   @media (prefers-reduced-motion: reduce) { .accordion-panel { transition: none; } } */`,
    walkthrough:
      "Open panels are a Set, so single mode starts each toggle from an empty set while multiple mode copies the current one. Each header is a real button inside a heading with aria-expanded and aria-controls, and each panel is a labelled region. The CSS animates grid-template-rows between 0fr and 1fr, which smoothly animates to the content's natural height without JavaScript measurement.",
    flow: ["Model open IDs", "Wire ARIA relationships", "Animate height accessibly"],
    mistake:
      "Making the whole header a div with a click handler. It cannot be focused or toggled from the keyboard, and screen readers do not know it expands anything.",
    exercise:
      "Interviewers ask you to add 'expand all' and 'collapse all' buttons. How does your state model make that easy?",
    answer:
      "Expand all sets open to a new Set of every item ID (only meaningful in multiple mode); collapse all sets it to an empty Set. Because state is a set of IDs, both are one-line updates.",
    deepDive: [
      {
        heading: "Native alternative",
        code: `<details name="faq">            <!-- same name = exclusive, like single mode -->
  <summary>What is the return policy?</summary>
  <p>30 days, free returns.</p>
</details>
<details name="faq">
  <summary>Do you ship abroad?</summary>
  <p>Yes, to 40 countries.</p>
</details>`,
      },
    ],
    animation: {
      title: "Single-open accordion",
      nodes: [
        ["state", "open Set", "{ shipping }"],
        ["returns", "Returns header", "button"],
        ["shipping", "Shipping panel", "open"],
        ["panel", "Returns panel", "expands"],
      ],
      steps: [
        ["returns", "state", "toggle", "Clicking the Returns header toggles its ID in single mode."],
        ["state", "shipping", "close", "Single mode starts from an empty set, so Shipping closes."],
        ["state", "panel", "open", "Returns is added and its panel animates open."],
        ["panel", "returns", "aria-expanded", "Its button now reports aria-expanded true to assistive tech."],
      ],
    },
  }),

  "low-level-design--nested-comments": fsd({
    intro:
      "Nested comments, as on discussion forums, form a tree of replies with arbitrary depth. Designing them covers data modelling, recursive rendering, collapsing threads, loading more replies lazily, optimistic posting, voting, and keeping deep threads readable on small screens.",
    concepts: [
      "Store comments normalized by ID with a parentId and childIds, rather than deeply nested JSON. Adding a reply, editing, or voting then updates one entry, and threads can be loaded or collapsed independently.",
      "Render recursively with a Comment component that renders its children, but cap visual depth: after a few levels, stop indenting or show 'Continue this thread' linking to a focused view.",
      "Large threads need pagination per level: load top-level comments first, show reply counts, and fetch more replies on demand. Optimistic replies appear instantly with a temporary ID and are reconciled when the server responds.",
    ],
    code: `// Normalized data: { byId: { c1: { id, parentId, body, author, score, childIds, replyCount } }, rootIds }
import { memo, useState } from "react";

const MAX_DEPTH = 4;

export const Comment = memo(function Comment({ id, depth, store }) {
  const comment = store.byId[id];
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const hiddenReplies = comment.replyCount - comment.childIds.length;

  return (
    <article className="comment" style={{ marginInlineStart: depth < MAX_DEPTH ? 16 : 0 }} aria-label={\`Comment by \${comment.author}\`}>
      <header>
        <button aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>{collapsed ? "[+]" : "[−]"}</button>
        <strong>{comment.author}</strong> · {comment.score} points
      </header>
      {!collapsed && (
        <>
          <p>{comment.body}</p>
          <button onClick={() => setReplying(true)}>Reply</button>
          {replying && <ReplyForm parentId={id} onDone={() => setReplying(false)} />}
          {depth >= MAX_DEPTH && comment.childIds.length > 0 ? (
            <a href={\`/comments/\${id}\`}>Continue this thread →</a>
          ) : (
            comment.childIds.map((childId) => <Comment key={childId} id={childId} depth={depth + 1} store={store} />)
          )}
          {hiddenReplies > 0 && <button onClick={() => store.loadReplies(id)}>Load {hiddenReplies} more replies</button>}
        </>
      )}
    </article>
  );
});

// Optimistic reply: insert with a temp ID, swap for the real one later
export function addReplyOptimistic(store, parentId, body, me) {
  const tempId = \`tmp-\${crypto.randomUUID()}\`;
  store.byId[tempId] = { id: tempId, parentId, body, author: me, score: 1, childIds: [], replyCount: 0, pending: true };
  store.byId[parentId].childIds.unshift(tempId);
  return tempId;
}`,
    walkthrough:
      "Each Comment reads its own entry by ID and renders its children recursively, indenting until a maximum depth where it offers a link to continue the thread on its own page. Collapse state is local to each comment. When a comment has more replies on the server than are loaded, a button fetches the next batch. New replies are inserted optimistically with a temporary ID and marked pending until the server confirms.",
    flow: ["Normalize the tree", "Render recursively with limits", "Lazy-load and post optimistically"],
    mistake:
      "Rendering the entire tree from one huge nested API response. A popular thread with thousands of comments downloads megabytes and freezes the page while rendering every hidden branch.",
    exercise:
      "How would you keep the vote count consistent if a user upvotes quickly several times on a slow network?",
    answer:
      "Store the user's vote state (up, down, none) rather than incrementing counts, apply it optimistically, debounce or serialise requests so only the final state is sent, and reconcile with the server's returned score.",
    deepDive: [
      {
        heading: "API shape that supports the UI",
        points: [
          "GET /posts/:id/comments?sort=top&limit=50 returns top-level comments with replyCount and the first few replies.",
          "GET /comments/:id/replies?cursor=... loads more replies for one branch.",
          "Include a depth or path field so deep links can render a focused subtree.",
        ],
      },
    ],
    animation: {
      title: "Replying in a nested thread",
      nodes: [
        ["root", "Comment c1", "depth 0"],
        ["child", "Reply c2", "depth 1"],
        ["form", "Reply form", "on c2"],
        ["store", "Comment store", "byId + childIds"],
        ["api", "API", "POST reply"],
      ],
      steps: [
        ["root", "child", "render", "c1 renders its children recursively, so c2 appears indented below it."],
        ["child", "form", "Reply", "The user opens a reply form under c2."],
        ["form", "store", "temp id", "The reply is inserted optimistically into c2's childIds."],
        ["store", "api", "POST", "The request is sent in the background."],
        ["api", "store", "real id", "The server's ID replaces the temporary one and pending is cleared."],
      ],
    },
  }),

  "low-level-design--image-slider": fsd({
    intro:
      "An image slider, or carousel, shows one or a few images at a time with controls to move between them, and sometimes autoplays. It is a popular machine coding problem that tests state management, animation, touch support, performance with lazy loading, and accessibility, an area where many real carousels fail.",
    concepts: [
      "State is the current index, with wrap-around or clamped boundaries. Navigation comes from previous and next buttons, dot indicators, keyboard arrows, and swipe gestures, all funnelling into one goTo function.",
      "Animate with CSS transforms on a track (translateX(-index * 100%)) or native CSS scroll snap, which gives smooth swiping for free. Only load the current and adjacent images eagerly; lazy-load the rest.",
      "Accessibility: label the carousel region, give each slide a group role with 'Slide 2 of 5', announce changes politely, provide a pause button if it autoplays, and pause on hover and focus. Autoplay should be off for reduced-motion users.",
    ],
    code: `import { useCallback, useEffect, useRef, useState } from "react";

export function ImageSlider({ images, autoPlayMs = 0 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = images.length;
  const goTo = useCallback((i) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!autoPlayMs || paused || reduce) return undefined;
    const id = setTimeout(() => goTo(index + 1), autoPlayMs);
    return () => clearTimeout(id);
  }, [index, paused, autoPlayMs, goTo]);

  return (
    <section aria-roledescription="carousel" aria-label="Product photos" className="slider"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") goTo(index + 1); if (e.key === "ArrowLeft") goTo(index - 1); }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1)); }}>
      <div className="track" style={{ transform: \`translateX(-\${index * 100}%)\` }} aria-live={autoPlayMs && !paused ? "off" : "polite"}>
        {images.map((img, i) => (
          <div key={img.src} role="group" aria-roledescription="slide" aria-label={\`\${i + 1} of \${count}\`} aria-hidden={i !== index}>
            <img src={img.src} alt={img.alt} loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"} width="800" height="600" />
          </div>
        ))}
      </div>
      <button onClick={() => goTo(index - 1)} aria-label="Previous photo">‹</button>
      <button onClick={() => goTo(index + 1)} aria-label="Next photo">›</button>
      {autoPlayMs > 0 && <button onClick={() => setPaused(!paused)}>{paused ? "Play" : "Pause"}</button>}
      <div className="dots">
        {images.map((img, i) => (
          <button key={img.src} aria-label={\`Show photo \${i + 1}\`} aria-current={i === index} onClick={() => goTo(i)} />
        ))}
      </div>
    </section>
  );
}`,
    walkthrough:
      "All controls route through goTo, which wraps around with modulo arithmetic. The track slides with a CSS transform, which runs on the compositor and stays smooth. Autoplay is a timeout that resets on every index change and stops when hovered, focused, paused, or when reduced motion is preferred. Swipes over 40 pixels change slides. Slides are labelled 'n of total', hidden slides are aria-hidden, and announcements are polite only when not autoplaying, to avoid constant chatter.",
    flow: ["Track the index", "Navigate by buttons, keys, swipes", "Load lazily, announce politely"],
    mistake:
      "Loading every full-resolution image upfront. A ten-image hero carousel can add several megabytes and delay LCP; load the first eagerly and the rest lazily at the right size.",
    exercise:
      "How would you implement an infinite loop where sliding from the last image to the first looks continuous, not a fast rewind?",
    answer:
      "Clone the first and last slides at the ends of the track, animate onto the clone, then on transitionend jump without animation to the real slide at the other end. Alternatively, reorder slides around the current index, or use scroll snap with a virtual offset.",
    deepDive: [
      {
        heading: "Scroll-snap version",
        code: `.track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; }
.track > * { flex: 0 0 100%; scroll-snap-align: center; }
/* Buttons call track.scrollBy({ left: track.clientWidth }) and an
   IntersectionObserver reports which slide is visible to update the dots. */`,
      },
    ],
    animation: {
      title: "Moving to the next slide",
      nodes: [
        ["input", "Input", "button, key, swipe"],
        ["goto", "goTo()", "wrap index"],
        ["track", "Track", "translateX"],
        ["img", "Next image", "preloaded"],
        ["sr", "Live region", "2 of 5"],
      ],
      steps: [
        ["input", "goto", "next", "A swipe, arrow key, or button calls goTo with index + 1."],
        ["goto", "track", "index 1", "The track transform moves to -100% on the compositor."],
        ["img", "track", "ready", "The adjacent image was already loaded eagerly, so no blank frame appears."],
        ["track", "sr", "announce", "The polite region tells screen reader users they are on slide 2 of 5."],
      ],
    },
  }),

  "low-level-design--pagination-design": fsd({
    intro:
      "Pagination splits large result sets into pages users can navigate. Designing it means choosing between offset and cursor pagination, deciding what lives in the URL, designing a page control that stays usable with hundreds of pages, and handling edge cases such as deleted items, changing totals, and out-of-range pages.",
    concepts: [
      "Offset pagination (?page=7&pageSize=20) supports jumping to any page and showing totals, which suits admin tables and search results. It is slow at deep offsets in many databases and can skip or duplicate items when data changes.",
      "Cursor pagination (?after=opaqueCursor&limit=20) is stable under inserts and fast at any depth, but cannot jump to arbitrary pages or show exact totals cheaply. It suits feeds and infinite lists.",
      "The page control shows first, last, the current page with a few neighbours, and ellipses for gaps, plus previous and next. The current page belongs in the URL so it survives reloads, sharing, and the back button.",
    ],
    code: `// Window of page numbers with ellipses: 1 … 5 6 [7] 8 9 … 42
export function pageWindow(current, total, siblings = 2) {
  const pages = new Set([1, total]);
  for (let p = current - siblings; p <= current + siblings; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("…");
    result.push(page);
  });
  return result;
}

pageWindow(7, 42); // [1, "…", 5, 6, 7, 8, 9, "…", 42]
pageWindow(1, 5);  // [1, 2, 3, 4, 5]

// API contracts for both styles
// Offset: GET /api/orders?page=7&pageSize=20
//   → { items: [...], page: 7, pageSize: 20, total: 834 }
// Cursor: GET /api/orders?limit=20&after=eyJpZCI6IjEwMjQifQ
//   → { items: [...], nextCursor: "eyJpZCI6IjEwMDQifQ", hasMore: true }`,
    walkthrough:
      "pageWindow always includes the first and last pages and two neighbours each side of the current page, inserting an ellipsis wherever numbers are skipped. That keeps the control the same width whether there are 5 pages or 5,000. The two API contracts show what the frontend needs from each style: totals for numbered controls, or a next cursor and hasMore for sequential loading.",
    flow: ["Pick offset or cursor", "Keep page in the URL", "Render a compact window"],
    mistake:
      "Keeping the current page only in component state. Refreshing, sharing the link, or pressing Back after opening an item loses the user's place.",
    exercise:
      "A user is on page 40 of a list, deletes items until only 38 pages remain, then reloads. What should happen?",
    answer:
      "The server returns an empty page or an out-of-range indicator, and the client clamps to the last valid page (38), updating the URL with replace so history is not polluted.",
    deepDive: [
      {
        heading: "Accessible pagination markup",
        code: `<nav aria-label="Orders pagination">
  <a href="?page=6" rel="prev">Previous</a>
  <a href="?page=1">1</a> <span aria-hidden="true">…</span>
  <a href="?page=7" aria-current="page">7</a>
  <a href="?page=8" rel="next">Next</a>
</nav>`,
      },
    ],
    animation: {
      title: "Building the page window",
      nodes: [
        ["input", "current = 7", "total = 42"],
        ["ends", "Ends", "1 and 42"],
        ["siblings", "Siblings", "5 to 9"],
        ["gaps", "Gaps", "insert …"],
        ["output", "Control", "1 … 5–9 … 42"],
      ],
      steps: [
        ["input", "ends", "always", "The first and last pages are always shown."],
        ["input", "siblings", "±2", "Two neighbours on each side of page 7 are added."],
        ["siblings", "gaps", "sort", "Sorted pages with jumps larger than one get an ellipsis."],
        ["gaps", "output", "render", "The control renders a compact, constant-width window."],
      ],
    },
  }),

  "low-level-design--pagination-implementation": fsd({
    intro:
      "This lesson builds a complete paginated table in React: URL-synced page state, data fetching with caching and prefetching of the next page, a page control from the design lesson, loading and empty states, and keyboard-friendly, accessible markup. It is the shape interviewers expect in a machine coding round.",
    concepts: [
      "Derive the page from the URL with useSearchParams, and update it with setSearchParams so the back button and sharing work. Validate it: non-numbers or out-of-range values fall back to a valid page.",
      "Fetch by query key ['orders', page]. Keep the previous page visible while the next loads to avoid layout jumps, and prefetch page + 1 so clicking Next is instant.",
      "After changing pages, move focus to the table caption or heading and scroll it into view, so keyboard and screen reader users are not left at the bottom of the old page.",
    ],
    code: `import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { pageWindow } from "./pageWindow";

const PAGE_SIZE = 20;
const fetchOrders = (page) => fetch(\`/api/orders?page=\${page}&pageSize=\${PAGE_SIZE}\`).then((r) => r.json());

export function OrdersTable() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const client = useQueryClient();
  const caption = useRef(null);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => fetchOrders(page),
    placeholderData: keepPreviousData,
  });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  useEffect(() => {
    if (data && page > totalPages) setParams({ page: String(totalPages) }, { replace: true }); // clamp
    if (page < totalPages) client.prefetchQuery({ queryKey: ["orders", page + 1], queryFn: () => fetchOrders(page + 1) });
  }, [data, page, totalPages, client, setParams]);

  function go(next) {
    setParams({ page: String(next) });
    caption.current?.focus();
    caption.current?.scrollIntoView({ block: "start" });
  }

  if (isPending) return <TableSkeleton rows={PAGE_SIZE} />;
  if (data.items.length === 0) return <p>No orders yet.</p>;

  return (
    <>
      <table aria-busy={isFetching}>
        <caption ref={caption} tabIndex={-1}>Orders, page {page} of {totalPages}</caption>
        <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Total</th></tr></thead>
        <tbody>{data.items.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.date}</td><td>{o.total}</td></tr>)}</tbody>
      </table>
      <nav aria-label="Orders pagination">
        <button onClick={() => go(page - 1)} disabled={page === 1}>Previous</button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? <span key={\`gap\${i}\`} aria-hidden="true">…</span>
            : <button key={p} onClick={() => go(p)} aria-current={p === page ? "page" : undefined}>{p}</button>)}
        <button onClick={() => go(page + 1)} disabled={page === totalPages}>Next</button>
      </nav>
    </>
  );
}`,
    walkthrough:
      "The page number is parsed from the URL and defaults to 1 for invalid values. Each page is cached by key, the previous page stays on screen while the next loads, and the following page is prefetched so Next feels instant. If the total shrinks below the current page, the URL is clamped with replace. Navigating focuses the caption, which announces 'Orders, page 8 of 42' and keeps keyboard users in context.",
    flow: ["Read page from URL", "Fetch, keep previous, prefetch next", "Navigate and manage focus"],
    mistake:
      "Resetting to page 1 whenever any filter changes but forgetting to include filters in the query key. The cache returns page 3 of the old filter for page 3 of the new filter.",
    exercise:
      "Add a page-size selector (10, 20, 50). What else must change?",
    answer:
      "Store pageSize in the URL, include it in the query key and API call, reset page to 1 when it changes (or compute the page that contains the current first item), and recompute totalPages from the new size.",
    deepDive: [
      {
        heading: "Server-side considerations",
        points: [
          "Index the sort columns so deep offsets stay fast, or switch to keyset pagination.",
          "Return total counts cheaply, or show 'many' when counting is expensive.",
          "Keep sort order stable by adding a unique tiebreaker such as ID.",
        ],
      },
    ],
    animation: {
      title: "Clicking Next on a paginated table",
      nodes: [
        ["click", "Next button", "page 7 → 8"],
        ["url", "URL", "?page=8"],
        ["cache", "Query cache", "page 8 prefetched"],
        ["table", "Table", "rows + caption"],
        ["api", "API", "page 9 prefetch"],
      ],
      steps: [
        ["click", "url", "setParams", "Clicking Next writes page 8 to the URL, creating a history entry."],
        ["url", "cache", "key ['orders', 8]", "The query for page 8 was prefetched, so data is already cached."],
        ["cache", "table", "instant", "The table renders page 8 immediately and focus moves to the caption."],
        ["table", "api", "prefetch", "In the background, page 9 is prefetched for the next click."],
      ],
    },
  }),

  "low-level-design--real-time-updates": fsd({
    intro:
      "Real-time updates keep a screen in sync with server changes as they happen: new orders on a dashboard, a delivery driver's position, stock levels, or presence indicators. At the component level the challenge is merging a stream of events into existing state correctly, efficiently, and in a way that does not overwhelm the user.",
    concepts: [
      "Start with a snapshot and then apply deltas. Load current state over HTTP, subscribe to changes with a version or sequence number, and discard or re-fetch if you detect a gap in the sequence.",
      "Merge events idempotently into normalized state keyed by ID. Updates must handle out-of-order and duplicate events, typically by comparing a version or updatedAt field before applying.",
      "Protect the UI: batch high-frequency updates into one render per animation frame, avoid moving content under the user's cursor, and use a 'N new items' banner instead of inserting rows while someone is reading.",
    ],
    code: `import { useEffect, useReducer, useRef } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "snapshot":
      return { seq: action.seq, byId: Object.fromEntries(action.items.map((o) => [o.id, o])), pending: [] };
    case "events": {
      let { seq, byId, pending } = state;
      byId = { ...byId };
      for (const event of action.events) {
        if (event.seq <= seq) continue;                 // duplicate or old
        if (event.seq > seq + 1) return { ...state, gap: true }; // missed something: resync
        const current = byId[event.order.id];
        if (!current || current.version < event.order.version) {
          if (!current) pending = [...pending, event.order.id]; // new: show banner, don't jump the list
          byId[event.order.id] = event.order;
        }
        seq = event.seq;
      }
      return { ...state, seq, byId, pending };
    }
    case "reveal":
      return { ...state, pending: [] };
    default:
      return state;
  }
}

export function useLiveOrders(socket) {
  const [state, dispatch] = useReducer(reducer, { seq: 0, byId: {}, pending: [] });
  const buffer = useRef([]);

  useEffect(() => {
    fetch("/api/orders/live").then((r) => r.json()).then(({ seq, items }) => dispatch({ type: "snapshot", seq, items }));
    let frame = 0;
    const onEvent = (event) => {
      buffer.current.push(event);
      if (!frame) frame = requestAnimationFrame(() => { dispatch({ type: "events", events: buffer.current.splice(0) }); frame = 0; });
    };
    socket.on("order.updated", onEvent);
    return () => { socket.off("order.updated", onEvent); cancelAnimationFrame(frame); };
  }, [socket]);

  return [state, () => dispatch({ type: "reveal" })];
}`,
    walkthrough:
      "The hook loads a snapshot with its sequence number, then applies socket events in batches once per animation frame, so a burst of fifty events causes one render. The reducer ignores events it has already seen, flags a gap when a sequence number is skipped so the caller can reload the snapshot, applies only newer versions of each order, and puts brand-new orders into a pending list shown as a 'new orders' banner instead of shifting the table.",
    flow: ["Load snapshot", "Apply ordered deltas", "Batch renders, respect the reader"],
    mistake:
      "Subscribing to the stream before or without loading a snapshot, or loading the snapshot without a sequence number. Events that happen between the two are lost or applied twice, and the screen silently drifts from the truth.",
    exercise:
      "A live map shows 500 delivery drivers whose positions update every second. How do you keep it smooth?",
    answer:
      "Batch position updates per frame, update marker positions imperatively in the map library rather than re-rendering 500 React components, interpolate movement between updates, and only subscribe to drivers within the visible map bounds.",
    deepDive: [
      {
        heading: "Choosing the transport",
        points: [
          "Updates every few minutes: polling with ETags.",
          "Server-to-client feeds such as order status or scores: Server-Sent Events.",
          "Two-way interaction such as collaborative editing or games: WebSockets.",
          "Always pair the stream with a snapshot API for initial load and recovery.",
        ],
      },
    ],
    animation: {
      title: "Snapshot plus ordered deltas",
      nodes: [
        ["snapshot", "Snapshot", "seq 100"],
        ["socket", "Socket", "events 101–103"],
        ["buffer", "Frame buffer", "batch"],
        ["reducer", "Reducer", "dedupe + version"],
        ["ui", "Dashboard", "banner: 2 new"],
      ],
      steps: [
        ["snapshot", "reducer", "load", "The dashboard loads current orders with sequence number 100."],
        ["socket", "buffer", "burst", "Three events arrive within a few milliseconds."],
        ["buffer", "reducer", "one batch", "They are applied together on the next animation frame."],
        ["reducer", "ui", "merge", "Updated orders change in place; two new orders go to the banner."],
        ["socket", "snapshot", "gap", "If event 105 arrives after 103, the gap triggers a fresh snapshot."],
      ],
    },
  }),

  "low-level-design--live-stream-chat-ui": fsd({
    intro:
      "A live stream chat shows a fast-moving list of messages next to a video, sometimes hundreds per second during popular streams. Designing it means receiving messages efficiently, capping memory, keeping scrolling smooth, handling the user's own messages optimistically, and letting viewers scroll up to read without being yanked back down.",
    concepts: [
      "Keep a bounded buffer. Only the latest few hundred messages stay in memory and the DOM; older ones are dropped. Batch incoming messages and render at most once per animation frame, or throttle further during extreme bursts.",
      "Stick to the bottom only when the user is already at the bottom. If they scroll up, pause auto-scroll and show a 'New messages' button that jumps back down.",
      "Send messages optimistically with a client ID, show them immediately with a pending style, and reconcile when the server echoes them back. Apply rate limits, moderation states, and safe text rendering for user content.",
    ],
    code: `import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MAX_MESSAGES = 300;

export function LiveChat({ socket, me }) {
  const [messages, setMessages] = useState([]);
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef(null);
  const queue = useRef([]);

  useEffect(() => {
    let frame = 0;
    socket.on("chat", (message) => {
      queue.current.push(message);
      if (!frame) frame = requestAnimationFrame(() => {
        const batch = queue.current.splice(0);
        setMessages((current) => {
          const confirmed = new Set(batch.map((m) => m.clientId).filter(Boolean));
          const kept = current.filter((m) => !confirmed.has(m.clientId) || !m.pending); // replace optimistic copies
          return [...kept, ...batch].slice(-MAX_MESSAGES);
        });
        frame = 0;
      });
    });
    return () => socket.off("chat");
  }, [socket]);

  useLayoutEffect(() => {
    if (atBottom) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, atBottom]);

  function onScroll() {
    const el = listRef.current;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  }

  function send(text) {
    const clientId = crypto.randomUUID();
    setMessages((m) => [...m, { clientId, author: me, text, pending: true }].slice(-MAX_MESSAGES));
    socket.emit("chat", { clientId, text });
  }

  return (
    <aside aria-label="Live chat">
      <ol ref={listRef} onScroll={onScroll} className="chat-list" aria-live="off">
        {messages.map((m) => (
          <li key={m.id ?? m.clientId} className={m.pending ? "pending" : undefined}>
            <strong>{m.author}</strong> {m.text}
          </li>
        ))}
      </ol>
      {!atBottom && <button onClick={() => setAtBottom(true)}>New messages ↓</button>}
      <ChatInput onSend={send} maxLength={200} />
    </aside>
  );
}`,
    walkthrough:
      "Incoming messages are queued and applied once per frame, so a burst becomes one render, and the list is capped at 300 messages. A layout effect keeps the view pinned to the bottom only while the user is there; scrolling up pauses it and reveals a jump button. Your own messages appear instantly as pending and are replaced when the server echoes them with the same client ID. Text is rendered as text, never HTML, and aria-live is off so screen readers are not flooded.",
    flow: ["Batch and cap messages", "Auto-scroll only at bottom", "Send optimistically"],
    mistake:
      "Appending every message with its own setState and keeping all messages forever. During a busy stream the page re-renders hundreds of times per second and memory grows until the tab crashes.",
    exercise:
      "How would you show emotes and links in chat messages safely?",
    answer:
      "Parse the plain text into tokens on the client: known emote codes become image components from your own emote list, URLs matching an allowlisted pattern become links with rel=noopener and nofollow, and everything else stays text. Never inject message content as HTML.",
    deepDive: [
      {
        heading: "Scaling the backend side",
        points: [
          "Fan out through pub/sub per stream channel, with edge servers holding viewer connections.",
          "Sample or summarise messages for very large streams; nobody can read 1,000 messages per second.",
          "Apply slow mode, rate limits, and moderation before broadcasting.",
        ],
      },
    ],
    animation: {
      title: "A burst of chat messages",
      nodes: [
        ["socket", "Socket", "40 msgs/frame"],
        ["queue", "Queue", "frame batch"],
        ["buffer", "Message buffer", "cap 300"],
        ["list", "Chat list", "pinned bottom"],
        ["user", "Viewer", "scrolls up"],
      ],
      steps: [
        ["socket", "queue", "burst", "Forty messages arrive between two frames."],
        ["queue", "buffer", "one update", "They are appended in one state update and the oldest are dropped."],
        ["buffer", "list", "render", "The list renders once and stays pinned to the newest message."],
        ["user", "list", "scroll up", "The viewer scrolls up to read, so auto-scroll pauses."],
        ["list", "user", "jump button", "A New messages button appears to return to the live position."],
      ],
    },
  }),

  "low-level-design--autocomplete-search-bar": fsd({
    intro:
      "An autocomplete search bar suggests results as the user types. It looks simple and is a favourite interview problem because it touches everything: debouncing, request cancellation, race conditions, caching, keyboard navigation, accessibility with the combobox pattern, highlighting matches, and handling slow or failing networks.",
    concepts: [
      "Reduce requests: debounce input by 200 to 300 ms, skip queries shorter than a minimum length, cache results per query, and cancel in-flight requests with AbortController when the query changes.",
      "Prevent race conditions. Responses can arrive out of order, so only apply a response if it belongs to the latest query; cancellation plus a query check makes this robust.",
      "Accessibility uses the combobox pattern: the input has role combobox, aria-expanded, aria-controls, and aria-activedescendant pointing to the highlighted option in a listbox. Arrow keys move, Enter selects, Escape closes, and a status message announces the number of results.",
    ],
    code: `import { useEffect, useId, useRef, useState } from "react";

const cache = new Map();

export function Autocomplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { setResults([]); return undefined; }
    if (cache.has(q)) { setResults(cache.get(q)); setOpen(true); return undefined; }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(\`/api/suggest?q=\${encodeURIComponent(q)}\`, { signal: controller.signal });
        const data = await response.json();
        cache.set(q, data);
        setResults(data); // safe: aborted requests never reach here
        setOpen(true);
        setActive(-1);
      } catch (error) {
        if (error.name !== "AbortError") setResults([]);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); }; // debounce + cancel stale requests
  }, [query]);

  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(results.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter" && active >= 0) { onSelect(results[active]); setOpen(false); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="autocomplete">
      <label htmlFor={\`\${listId}-input\`}>Search products</label>
      <input id={\`\${listId}-input\`} role="combobox" aria-autocomplete="list" aria-expanded={open && results.length > 0}
        aria-controls={listId} aria-activedescendant={active >= 0 ? \`\${listId}-\${active}\` : undefined}
        value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} onBlur={() => setOpen(false)} />
      {open && results.length > 0 && (
        <ul id={listId} role="listbox">
          {results.map((item, i) => (
            <li key={item.id} id={\`\${listId}-\${i}\`} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); onSelect(item); setOpen(false); }}>
              <Highlight text={item.name} query={query} />
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="visually-hidden">{open ? \`\${results.length} suggestions\` : ""}</p>
    </div>
  );
}

function Highlight({ text, query }) {
  const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (i < 0 || !query.trim()) return text;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + query.trim().length)}</mark>{text.slice(i + query.trim().length)}</>;
}`,
    walkthrough:
      "Each keystroke resets a 250 ms timer, so a fast typist sends one request when they pause. The effect cleanup both clears the timer and aborts the previous request, which removes race conditions: a slow response for 'sho' can never overwrite results for 'shoes'. Results are cached per query, so backspacing is instant. The combobox ARIA attributes and aria-activedescendant let screen reader users hear the highlighted option while focus stays in the input, and onMouseDown with preventDefault stops the blur from closing the list before a click registers.",
    flow: ["Debounce and cache", "Cancel stale requests", "Navigate as a combobox"],
    mistake:
      "Debouncing without cancellation or a latest-query check. Responses that arrive out of order still show results for an older query, which looks like a random bug to users.",
    exercise:
      "Product wants recent searches shown when the input is focused and empty. How does that fit the design?",
    answer:
      "Store recent queries in localStorage with a cap, show them as options when the query is empty and the input is focused, label the group 'Recent searches', and let users remove entries. Selecting one sets the query and goes through the same cached path.",
    deepDive: [
      {
        heading: "Scaling suggestions",
        points: [
          "Serve suggestions from a dedicated, cached endpoint backed by a prefix index or search engine.",
          "Cache popular prefixes at the CDN with short TTLs.",
          "Return small payloads: ID, display name, type, and a thumbnail URL at most.",
          "Log selected suggestions to improve ranking.",
        ],
      },
    ],
    animation: {
      title: "Typing 'shoes' quickly",
      nodes: [
        ["input", "Input", "s-h-o-e-s"],
        ["debounce", "Debounce", "250 ms"],
        ["abort", "AbortController", "cancel stale"],
        ["api", "Suggest API", "?q=shoes"],
        ["list", "Listbox", "8 options"],
      ],
      steps: [
        ["input", "debounce", "keystrokes", "Five fast keystrokes keep resetting the 250 ms timer."],
        ["debounce", "api", "one request", "Only when typing pauses does a request for 'shoes' go out."],
        ["input", "abort", "keep typing", "If the user types again, the in-flight request is aborted."],
        ["api", "list", "results", "The latest response renders as options with the match highlighted."],
        ["list", "input", "ArrowDown", "Arrow keys move aria-activedescendant while focus stays in the input."],
      ],
    },
  }),
};
