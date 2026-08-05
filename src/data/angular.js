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

export const angularSections = [
  section("welcome", "Welcome", ["Course Introduction", "Angular Learning Roadmap", "Development Environment Setup"]),
  section("angular-foundations", "Angular Foundations", [
    "What is Angular?", "Angular CLI", "Workspace and Project Structure", "Bootstrapping an Application",
    "Standalone Components", "Angular Developer Tools",
  ]),
  section("components-and-templates", "Components and Templates", [
    "Creating Components", "Template Syntax", "Property Binding", "Event Binding",
    "Two-Way Binding", "Template Variables", "Content Projection",
  ]),
  section("directives-and-pipes", "Directives and Pipes", [
    "Built-in Control Flow", "Attribute Directives", "Structural Directives", "Creating Custom Directives",
    "Built-in Pipes", "Creating Custom Pipes",
  ]),
  section("services-and-di", "Services and Dependency Injection", [
    "Creating Services", "Dependency Injection Fundamentals", "Provider Configuration",
    "Injection Tokens", "Hierarchical Injectors", "Service Design Patterns",
  ]),
  section("routing", "Angular Routing", [
    "Router Configuration", "Router Links", "Route Parameters", "Nested Routes",
    "Route Guards", "Resolvers", "Lazy-Loaded Routes",
  ]),
  section("forms", "Angular Forms", [
    "Template-Driven Forms", "Reactive Forms", "Form Validation", "Custom Validators",
    "Dynamic Forms", "Form Arrays",
  ]),
  section("http-and-rxjs", "HTTP and RxJS", [
    "HttpClient", "HTTP Interceptors", "Observables", "RxJS Operators", "Subjects",
    "Error Handling", "Canceling Requests", "Async Pipe",
  ]),
  section("state-management", "State Management", [
    "Component State", "Shared Service State", "Signals", "Computed State", "Effects", "NgRx Fundamentals",
  ]),
  section("testing", "Testing Angular", [
    "Unit Testing Fundamentals", "Testing Components", "Testing Services", "Testing HTTP Requests",
    "Testing Routes", "End-to-End Testing",
  ]),
  section("production-angular", "Production Angular", [
    "Application Architecture", "Change Detection", "Performance Optimization", "Accessibility",
    "Security", "Server-Side Rendering", "Build and Deployment",
  ]),
];

export const angularArticles = angularSections.flatMap((item) => item.lessons);
