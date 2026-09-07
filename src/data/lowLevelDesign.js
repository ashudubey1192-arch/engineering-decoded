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

export const lowLevelDesignSections = [
  section("welcome", "Welcome", ["Course Introduction", "Course Roadmap", "How to Approach LLD"]),
  section("lld-foundations", "LLD Foundations", [
    "What is Low Level Design?", "From Requirements to Classes", "Objects and Relationships",
    "Encapsulation and Abstraction", "Composition vs Inheritance",
  ]),
  section("solid-principles", "SOLID Principles", [
    "Single Responsibility Principle", "Open Closed Principle", "Liskov Substitution Principle",
    "Interface Segregation Principle", "Dependency Inversion Principle",
  ]),
  section("uml-modeling", "UML and Modeling", [
    "Class Diagrams", "Sequence Diagrams", "State Diagrams", "Use Case Diagrams",
  ]),
  section("creational-patterns", "Creational Design Patterns", [
    "Singleton Pattern", "Factory Method Pattern", "Abstract Factory Pattern",
    "Builder Pattern", "Prototype Pattern",
  ]),
  section("structural-patterns", "Structural Design Patterns", [
    "Adapter Pattern", "Decorator Pattern", "Facade Pattern", "Composite Pattern", "Proxy Pattern",
  ]),
  section("behavioral-patterns", "Behavioral Design Patterns", [
    "Strategy Pattern", "Observer Pattern", "Command Pattern", "State Pattern",
    "Template Method Pattern", "Chain of Responsibility Pattern",
  ]),
  section("lld-practices", "Implementation Practices", [
    "Error Handling", "Concurrency and Thread Safety", "Dependency Injection",
    "Unit Testing Designs", "Refactoring for Extensibility",
  ]),
  section("lld-case-studies", "LLD Case Studies", [
    "Design a Parking Lot", "Design an Elevator System", "Design a Library System",
    "Design a Vending Machine", "Design a Tic-Tac-Toe Game", "Design a Meeting Scheduler",
  ]),
];

export const lowLevelDesignArticles = lowLevelDesignSections.flatMap((item) => item.lessons);
