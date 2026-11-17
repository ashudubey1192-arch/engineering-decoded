const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((title) => ({
    title,
    slug: `${slug}--${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    time: "10 min",
    sectionSlug: slug,
  })),
});

export const reactSections = [
  section("welcome", "Welcome", ["Course Introduction", "React Learning Roadmap", "Project Setup"]),
  section("react-foundations", "React Foundations", [
    "What is React?", "Creating a React Application", "React Project Structure",
    "Rendering Elements", "Declarative UI", "React Developer Tools",
  ]),
  section("under-the-hood", "How React Works", [
    "React Without a Build Tool", "npm, Bundlers and Babel", "From JSX to createElement",
    "Virtual DOM and Reconciliation", "Import and Export Patterns",
  ]),
  section("jsx-and-components", "JSX and Components", [
    "Understanding JSX", "Functional Components", "Props", "Component Composition",
    "Conditional Rendering", "Rendering Lists and Keys",
  ]),
  section("state-and-events", "State and Events", [
    "Handling Events", "Component State", "Updating Objects in State", "Updating Arrays in State",
    "Lifting State Up", "Controlled Components", "State as a Snapshot",
  ]),
  section("react-hooks", "React Hooks", [
    "Rules of Hooks", "useState", "useEffect", "Effect Cleanup", "useRef",
    "useMemo", "useCallback", "useReducer", "Custom Hooks",
  ]),
  section("forms", "Forms and Validation", [
    "Building React Forms", "Form Validation", "Dynamic Form Fields", "Form Submission",
  ]),
  section("routing-and-data", "Routing and Data", [
    "Client-Side Routing", "Nested Routes", "Fetching Data", "Loading and Error States",
    "Mutations and Optimistic Updates",
  ]),
  section("class-components", "Class Components and Patterns", [
    "Class Components", "Class Lifecycle Methods", "Higher-Order Components",
    "Controlled vs Uncontrolled Components", "Config-Driven UI",
  ]),
  section("tailwind-and-redux", "Tailwind and Redux Toolkit", [
    "Tailwind CSS in React", "Redux Toolkit Store and Slices", "useSelector and useDispatch",
    "Async Logic with Redux Thunks",
  ]),
  section("real-world-features", "Building Real Features", [
    "Working with Live APIs and CORS", "Shimmer UI", "Debounced Search and Caching",
    "Infinite Scroll", "Nested Comments", "Live Chat Updates",
    "Authentication and Protected Routes", "Environment Variables and API Keys",
    "Multi-Language Support",
  ]),
  section("performance", "Performance", [
    "React Rendering Model", "Memoizing Components", "Code Splitting", "Lazy Loading",
    "Profiling React Applications",
  ]),
  section("testing", "Testing React", [
    "Testing Fundamentals", "React Testing Library", "Testing User Interactions",
    "Mocking API Requests", "End-to-End Testing",
  ]),
  section("advanced-react", "Advanced React", [
    "Context API", "Error Boundaries", "Portals", "Suspense", "Transitions",
    "Server and Client Components",
  ]),
  section("production-react", "Production React", [
    "Application Architecture", "State Management Strategy", "Accessibility",
    "Security Practices", "Deployment", "Monitoring and Maintenance",
  ]),
];

export const reactArticles = reactSections.flatMap((item) => item.lessons);
