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

export const cleanArchitectureSections = [
  section("welcome", "Welcome", ["Course Introduction", "Clean Architecture Roadmap", "How to Use This Course"]),
  section("foundations", "Architecture Foundations", [
    "What is Software Architecture?", "Why Architecture Matters", "Policy and Detail",
    "Architecture vs Design", "Managing Change", "The Cost of Coupling",
  ]),
  section("design-principles", "Design Principles", [
    "Single Responsibility Principle", "Open Closed Principle", "Liskov Substitution Principle",
    "Interface Segregation Principle", "Dependency Inversion Principle", "Stable Dependencies",
    "Stable Abstractions",
  ]),
  section("boundaries", "Architectural Boundaries", [
    "Defining Boundaries", "Boundary Anatomy", "Crossing Boundaries", "Boundary Interfaces",
    "Plugin Architecture", "Partial Boundaries", "Boundary Trade-Offs",
  ]),
  section("entities-and-use-cases", "Entities and Use Cases", [
    "Enterprise Business Rules", "Application Business Rules", "Entities", "Use Case Interactors",
    "Input and Output Ports", "Use Case Boundaries",
  ]),
  section("interface-adapters", "Interface Adapters", [
    "Controllers", "Presenters", "Gateways", "View Models", "DTO Mapping", "Adapter Responsibilities",
  ]),
  section("frameworks-and-drivers", "Frameworks and Drivers", [
    "Frameworks as Details", "Web Framework Boundary", "Database Boundary", "External Services",
    "UI as a Detail", "Delayed Decisions",
  ]),
  section("data-and-persistence", "Data and Persistence", [
    "Database Independence", "Repository Interfaces", "Persistence Models", "Mapping Domain Objects",
    "Transaction Boundaries", "Changing the Database",
  ]),
  section("dependency-management", "Dependency Management", [
    "The Dependency Rule", "Compile-Time Dependencies", "Runtime Dependencies", "Dependency Injection",
    "Main Component", "Composition Root",
  ]),
  section("testing", "Testing Clean Architecture", [
    "Testing Entities", "Testing Use Cases", "Testing Adapters", "Testing Boundaries",
    "Architecture Tests", "Testable Design",
  ]),
  section("applied-clean-architecture", "Applied Clean Architecture", [
    "Package Organization", "Feature-Based Structure", "Modular Monoliths", "Clean Architecture with Microservices",
    "Refactoring a Legacy System", "Common Architecture Mistakes", "Clean Architecture Case Study",
  ]),
];

export const cleanArchitectureArticles = cleanArchitectureSections.flatMap((item) => item.lessons);
