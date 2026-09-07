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

export const javaSections = [
  section("welcome", "Welcome", ["Course Introduction", "Java Learning Roadmap", "Development Environment Setup"]),
  section("java-fundamentals", "Java Fundamentals", [
    "Java Platform and JVM", "Variables and Data Types", "Operators and Expressions",
    "Control Flow", "Methods", "Arrays and Strings",
  ]),
  section("object-oriented-programming", "Object-Oriented Programming", [
    "Classes and Objects", "Encapsulation", "Inheritance", "Polymorphism",
    "Abstraction", "Interfaces", "Composition",
  ]),
  section("java-type-system", "Java Type System", [
    "Packages and Access Modifiers", "Enums", "Records", "Generics",
    "Annotations", "Reflection",
  ]),
  section("collections", "Collections Framework", [
    "Collection Hierarchy", "Lists", "Sets", "Maps", "Queues and Deques",
    "Iterators", "Comparable and Comparator",
  ]),
  section("errors-and-io", "Exceptions and I/O", [
    "Exception Handling", "Custom Exceptions", "Files and Paths", "Java I/O Streams",
    "Serialization", "Try-with-Resources",
  ]),
  section("functional-java", "Functional Java", [
    "Lambda Expressions", "Functional Interfaces", "Stream API", "Optional",
    "Method References", "Collectors",
  ]),
  section("concurrency", "Concurrency", [
    "Threads and Runnable", "Synchronization", "Locks", "Executor Framework",
    "CompletableFuture", "Concurrent Collections", "Virtual Threads",
  ]),
  section("jvm-internals", "JVM and Performance", [
    "JVM Architecture", "Class Loading", "Memory Model", "Garbage Collection",
    "Profiling Java Applications", "Performance Optimization",
  ]),
  section("production-java", "Production Java", [
    "Unit Testing with JUnit", "Build Tools", "Logging", "Database Connectivity with JDBC",
    "REST API Foundations", "Security Basics", "Packaging and Deployment",
  ]),
];

export const javaArticles = javaSections.flatMap((item) => item.lessons);
