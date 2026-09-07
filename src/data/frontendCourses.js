const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((title) => ({
    title,
    slug: `${slug}--${slugify(title)}`,
    time: "10 min",
    sectionSlug: slug,
  })),
});

const course = (groups) => groups.map(([slug, title, lessons]) => section(slug, title, lessons));

export const htmlSections = course([
  ["getting-started", "HTML Foundations", ["How the Web Uses HTML", "Document Structure", "Elements and Attributes", "Text and Headings", "Comments and Entities"]],
  ["content", "Content and Semantics", ["Semantic HTML", "Links and Navigation", "Images and Figures", "Lists", "Tables"]],
  ["forms", "Forms", ["Form Structure", "Input Types", "Labels and Fieldsets", "Native Validation", "Accessible Forms"]],
  ["media", "Media and Embeds", ["Audio and Video", "Responsive Images", "Iframes", "SVG Basics", "Canvas Basics"]],
  ["accessibility", "Accessibility", ["Landmarks", "Heading Hierarchy", "Keyboard Navigation", "ARIA Fundamentals", "Accessibility Testing"]],
  ["browser", "Browser Integration", ["Metadata", "Favicons and Manifests", "Data Attributes", "Loading Scripts", "SEO Fundamentals"]],
  ["patterns", "Page Patterns", ["Article Page", "Application Shell", "Navigation Menu", "Dialog Markup", "Reusable Templates"]],
  ["production", "Production HTML", ["Validation and Debugging", "Performance", "Security Considerations", "Progressive Enhancement", "HTML Best Practices"]],
]);

export const cssSections = course([
  ["foundations", "CSS Foundations", ["Selectors", "Cascade and Specificity", "Inheritance", "Units and Values", "Custom Properties"]],
  ["box-model", "Box Model", ["Content Padding Border Margin", "Sizing Strategies", "Overflow", "Display Modes", "Stacking Contexts"]],
  ["layout", "Layout", ["Normal Flow", "Flexbox", "CSS Grid", "Positioning", "Multi-Column Layout"]],
  ["responsive", "Responsive Design", ["Media Queries", "Container Queries", "Fluid Typography", "Responsive Images", "Mobile First Design"]],
  ["visual", "Visual Styling", ["Colors", "Typography", "Backgrounds", "Borders and Shadows", "Filters and Blend Modes"]],
  ["motion", "Motion", ["Transitions", "Transforms", "Keyframe Animations", "Reduced Motion", "View Transitions"]],
  ["architecture", "CSS Architecture", ["BEM", "CSS Modules", "Utility Classes", "Design Tokens", "Component Styling"]],
  ["production", "Production CSS", ["Browser Compatibility", "Performance", "Debugging", "Accessibility", "Modern CSS Strategy"]],
]);

export const javascriptSections = course([
  ["foundations", "JavaScript Foundations", ["Values and Types", "Variables", "Operators", "Control Flow", "Functions"]],
  ["data", "Data and Collections", ["Objects", "Arrays", "Maps and Sets", "Destructuring", "Immutability"]],
  ["language", "Language Mechanics", ["Scope and Closures", "This Keyword", "Prototypes", "Classes", "Modules"]],
  ["browser", "Browser APIs", ["DOM Manipulation", "Events", "Forms", "Storage", "Observers"]],
  ["async", "Asynchronous JavaScript", ["Event Loop", "Promises", "Async and Await", "Fetch API", "AbortController"]],
  ["patterns", "Programming Patterns", ["Functional Programming", "Composition", "Factory Pattern", "Pub Sub", "Error Handling"]],
  ["quality", "Code Quality", ["Debugging", "Unit Testing", "Integration Testing", "Linting", "Documentation"]],
  ["advanced", "Advanced JavaScript", ["Iterators and Generators", "Proxy and Reflect", "Web Workers", "Memory Management", "Performance"]],
]);

export const typescriptSections = course([
  ["foundations", "TypeScript Foundations", ["Why TypeScript", "Compiler Setup", "Primitive Types", "Arrays and Tuples", "Type Inference"]],
  ["modeling", "Modeling Data", ["Type Aliases", "Interfaces", "Unions", "Intersections", "Literal Types"]],
  ["functions", "Functions", ["Function Types", "Optional Parameters", "Overloads", "Rest Parameters", "This Types"]],
  ["generics", "Generics", ["Generic Functions", "Constraints", "Generic Interfaces", "Generic Classes", "Default Type Parameters"]],
  ["narrowing", "Type Narrowing", ["Type Guards", "Discriminated Unions", "Assertion Functions", "Unknown and Never", "Exhaustiveness"]],
  ["advanced", "Advanced Types", ["Keyof and Typeof", "Indexed Access", "Mapped Types", "Conditional Types", "Template Literal Types"]],
  ["ecosystem", "TypeScript Ecosystem", ["Declaration Files", "Module Resolution", "Project References", "JavaScript Migration", "Library Typing"]],
  ["production", "Production TypeScript", ["Strict Configuration", "Error Design", "Runtime Validation", "Testing", "Architecture Practices"]],
]);

export const vueSections = course([
  ["welcome", "Vue Foundations", ["Introducing Vue", "Creating a Vue App", "Project Structure", "Vue Devtools", "Template Syntax"]],
  ["components", "Components", ["Single File Components", "Props", "Events", "Slots", "Dynamic Components"]],
  ["reactivity", "Reactivity", ["Refs", "Reactive Objects", "Computed Properties", "Watchers", "Lifecycle Hooks"]],
  ["composition", "Composition API", ["Setup Function", "Composables", "Provide and Inject", "Template Refs", "Script Setup"]],
  ["application", "Application Features", ["Forms", "Vue Router", "State with Pinia", "Data Fetching", "Error Handling"]],
  ["advanced", "Advanced Vue", ["Transitions", "Teleport", "Suspense", "Async Components", "Custom Directives"]],
  ["testing", "Testing Vue", ["Component Tests", "User Interaction Tests", "Mocking Requests", "Router Tests", "End to End Tests"]],
  ["production", "Production Vue", ["Performance", "Accessibility", "Security", "Deployment", "Application Architecture"]],
]);

export const nextJsSections = course([
  ["foundations", "Next.js Foundations", ["Why Next.js", "Creating a Project", "App Router", "Layouts and Pages", "Navigation"]],
  ["rendering", "Rendering", ["Server Components", "Client Components", "Static Rendering", "Dynamic Rendering", "Streaming"]],
  ["data", "Data and Mutations", ["Fetching Data", "Caching", "Revalidation", "Server Actions", "Optimistic Updates"]],
  ["routing", "Advanced Routing", ["Dynamic Segments", "Route Groups", "Parallel Routes", "Intercepting Routes", "Middleware"]],
  ["fullstack", "Full-Stack Features", ["Route Handlers", "Forms", "Authentication", "Database Access", "File Uploads"]],
  ["experience", "User Experience", ["Loading UI", "Error Handling", "Images", "Fonts", "Metadata and SEO"]],
  ["quality", "Quality", ["Unit Testing", "Integration Testing", "End to End Testing", "Accessibility", "Security"]],
  ["production", "Production Next.js", ["Performance", "Observability", "Environment Variables", "Deployment", "Architecture"]],
]);

export const tailwindCssSections = course([
  ["foundations", "Tailwind Foundations", ["Utility First CSS", "Installation", "Responsive Utilities", "State Variants", "Dark Mode"]],
  ["layout", "Layout", ["Spacing", "Sizing", "Flexbox", "Grid", "Positioning"]],
  ["visual", "Visual Design", ["Colors", "Typography", "Borders", "Shadows", "Backgrounds"]],
  ["responsive", "Responsive UI", ["Breakpoints", "Container Queries", "Mobile First Patterns", "Responsive Components", "Adaptive Navigation"]],
  ["components", "Component Patterns", ["Buttons", "Forms", "Cards", "Dialogs", "Data Tables"]],
  ["customization", "Customization", ["Theme Configuration", "Design Tokens", "Custom Utilities", "Plugins", "Presets"]],
  ["integration", "Framework Integration", ["Tailwind with React", "Tailwind with Vue", "Tailwind with Next.js", "Class Composition", "Component Variants"]],
  ["production", "Production Tailwind", ["Performance", "Accessibility", "Reusable APIs", "Migration Strategy", "Best Practices"]],
]);

export const materialUiSections = course([
  ["foundations", "Material UI Foundations", ["Material Design", "Installation", "Component Anatomy", "Theme Provider", "CSS Baseline"]],
  ["layout", "Layout", ["Box", "Stack", "Grid", "Container", "Responsive Breakpoints"]],
  ["inputs", "Inputs", ["Buttons", "Text Fields", "Selects", "Checkboxes and Radios", "Autocomplete"]],
  ["display", "Data Display", ["Typography", "Cards", "Tables", "Lists", "Chips and Avatars"]],
  ["feedback", "Navigation and Feedback", ["App Bar", "Drawer", "Tabs", "Dialogs", "Snackbars"]],
  ["theming", "Theming", ["Palette", "Typography Theme", "Component Overrides", "Variants", "Dark Mode"]],
  ["advanced", "Advanced Patterns", ["Styled API", "Sx Prop", "Composition", "Data Grid", "Date Pickers"]],
  ["production", "Production Material UI", ["Accessibility", "Performance", "Server Rendering", "Testing", "Design System Architecture"]],
]);

export const reduxSections = course([
  ["foundations", "Redux Foundations", ["Why Redux", "One Way Data Flow", "Store Actions Reducers", "Immutability", "Redux DevTools"]],
  ["toolkit", "Redux Toolkit", ["Configure Store", "Create Slice", "Payload Actions", "Selectors", "Entity Adapter"]],
  ["react", "React Redux", ["Provider", "useSelector", "useDispatch", "Typed Hooks", "Component Design"]],
  ["async", "Async Logic", ["Create Async Thunk", "Thunk Lifecycle", "Loading and Errors", "Cancellation", "Listener Middleware"]],
  ["rtk-query", "RTK Query", ["API Slices", "Queries", "Mutations", "Cache Invalidation", "Optimistic Updates"]],
  ["architecture", "State Architecture", ["State Shape", "Normalization", "Derived Data", "Feature Folders", "Local vs Global State"]],
  ["testing", "Testing Redux", ["Reducer Tests", "Selector Tests", "Thunk Tests", "Component Integration Tests", "Mock APIs"]],
  ["production", "Production Redux", ["Performance", "Persistence", "Authentication State", "Error Monitoring", "Migration and Best Practices"]],
]);

export const viteSections = course([
  ["foundations", "Vite Foundations", ["Why Vite", "Creating a Project", "Development Server", "Project Structure", "Index HTML"]],
  ["configuration", "Configuration", ["Config File", "Plugins", "Aliases", "Environment Variables", "Modes"]],
  ["assets", "Modules and Assets", ["ES Modules", "CSS Handling", "Static Assets", "JSON and Glob Imports", "Web Workers"]],
  ["development", "Development Workflow", ["Hot Module Replacement", "Proxying APIs", "HTTPS", "Source Maps", "Debugging"]],
  ["build", "Production Builds", ["Build Options", "Code Splitting", "Chunk Strategy", "Library Mode", "Preview"]],
  ["frameworks", "Framework Integration", ["React", "Vue", "TypeScript", "CSS Tools", "Testing with Vitest"]],
  ["advanced", "Advanced Vite", ["Plugin Hooks", "SSR", "Backend Integration", "Monorepos", "Performance Tuning"]],
  ["production", "Production Vite", ["Deployment", "Caching", "Security", "Bundle Analysis", "Troubleshooting"]],
]);

export const htmlArticles = htmlSections.flatMap((item) => item.lessons);
export const cssArticles = cssSections.flatMap((item) => item.lessons);
export const javascriptArticles = javascriptSections.flatMap((item) => item.lessons);
export const typescriptArticles = typescriptSections.flatMap((item) => item.lessons);
export const vueArticles = vueSections.flatMap((item) => item.lessons);
export const nextJsArticles = nextJsSections.flatMap((item) => item.lessons);
export const tailwindCssArticles = tailwindCssSections.flatMap((item) => item.lessons);
export const materialUiArticles = materialUiSections.flatMap((item) => item.lessons);
export const reduxArticles = reduxSections.flatMap((item) => item.lessons);
export const viteArticles = viteSections.flatMap((item) => item.lessons);
