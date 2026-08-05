const section = (slug, title, lessons) => ({
  slug, title,
  lessons: lessons.map((title) => ({
    title,
    slug: `${slug}--${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    time: "10 min", sectionSlug: slug,
  })),
});

export const designPatternsSections = [
  section("welcome", "Welcome", ["Course Introduction", "Design Patterns Roadmap", "How to Practice Patterns"]),
  section("pattern-foundations", "Pattern Foundations", [
    "What is a Design Pattern?", "Pattern Language", "Intent and Applicability",
    "Forces and Trade-Offs", "Patterns vs Principles", "Avoiding Pattern Overuse",
  ]),
  section("object-design", "Object Design Principles", [
    "Program to an Interface", "Favor Composition", "Encapsulate Variation",
    "Loose Coupling", "Cohesion", "Open Closed Design",
  ]),
  section("creational-patterns", "Creational Patterns", [
    "Singleton", "Factory Method", "Abstract Factory", "Builder", "Prototype", "Object Pool",
  ]),
  section("structural-patterns", "Structural Patterns", [
    "Adapter", "Bridge", "Composite", "Decorator", "Facade", "Flyweight", "Proxy", "Module",
  ]),
  section("behavioral-patterns", "Behavioral Patterns", [
    "Chain of Responsibility", "Command", "Interpreter", "Iterator", "Mediator", "Memento",
    "Observer", "State", "Strategy", "Template Method", "Visitor",
  ]),
  section("enterprise-patterns", "Enterprise Patterns", [
    "Repository", "Unit of Work", "Data Mapper", "Service Layer", "Specification",
  ]),
  section("concurrency-patterns", "Concurrency Patterns", [
    "Thread Pool", "Producer Consumer", "Read Write Lock", "Future and Promise",
    "Reactor", "Actor Model",
  ]),
  section("distributed-patterns", "Distributed System Patterns", [
    "Circuit Breaker", "Saga", "Transactional Outbox", "Retry and Backoff",
    "Bulkhead", "Idempotent Consumer",
  ]),
  section("refactoring-to-patterns", "Refactoring to Patterns", [
    "Replace Conditional with Strategy", "Introduce Factory", "Move Creation to Builder",
    "Replace Inheritance with Composition", "Simplify with Facade",
  ]),
  section("pattern-selection", "Selecting Patterns", [
    "Identify the Design Problem", "Compare Pattern Trade-Offs", "Combine Patterns",
    "Recognize Anti-Patterns", "Review Pattern Decisions",
  ]),
  section("pattern-case-studies", "Pattern Case Studies", [
    "Design a Notification Framework", "Design a Payment Workflow", "Design a Plugin System",
    "Design a Document Editor", "Design a Cache Library", "Design an Event Dispatcher",
  ]),
];

export const designPatternsArticles = designPatternsSections.flatMap((item) => item.lessons);
