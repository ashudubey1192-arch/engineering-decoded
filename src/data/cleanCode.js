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

export const cleanCodeSections = [
  section("welcome", "Welcome", ["Course Introduction", "Clean Code Learning Roadmap", "How to Practice Clean Code"]),
  section("clean-code-foundations", "Clean Code Foundations", [
    "What is Clean Code?", "Why Code Quality Matters", "Readability and Maintainability",
    "The Boy Scout Rule", "Technical Debt", "Professional Responsibility",
  ]),
  section("meaningful-names", "Meaningful Names", [
    "Naming Variables", "Naming Functions", "Naming Classes", "Avoiding Disinformation",
    "Searchable Names", "Domain Language",
  ]),
  section("functions", "Functions", [
    "Small Functions", "Single Level of Abstraction", "Function Arguments", "Command Query Separation",
    "Avoiding Side Effects", "Error Handling in Functions", "Pure Functions",
  ]),
  section("comments-and-formatting", "Comments and Formatting", [
    "When Comments Help", "Misleading Comments", "Self-Documenting Code", "Vertical Formatting",
    "Horizontal Formatting", "Team Formatting Rules",
  ]),
  section("objects-and-data", "Objects and Data", [
    "Data Abstraction", "Objects vs Data Structures", "Law of Demeter", "Data Transfer Objects",
    "Immutability", "Encapsulation Boundaries",
  ]),
  section("error-handling", "Error Handling", [
    "Exceptions over Error Codes", "Writing Try-Catch Blocks", "Custom Exceptions",
    "Null Handling", "Fail Fast", "Error Context",
  ]),
  section("classes-and-modules", "Classes and Modules", [
    "Small Classes", "Single Responsibility", "High Cohesion", "Low Coupling",
    "Dependency Management", "Organizing Modules",
  ]),
  section("testing", "Clean Tests", [
    "Readable Tests", "Arrange Act Assert", "One Concept per Test", "Test Naming",
    "Test Independence", "Test Doubles", "FIRST Principles",
  ]),
  section("refactoring", "Refactoring", [
    "Recognizing Code Smells", "Extract Method", "Rename and Move", "Replace Conditionals",
    "Simplifying Dependencies", "Safe Refactoring Workflow", "Legacy Code Refactoring",
  ]),
  section("clean-architecture-practices", "Applied Clean Code", [
    "Clean Boundaries", "Dependency Inversion", "Code Review Practices", "Static Analysis",
    "Team Conventions", "Clean Code Case Study",
  ]),
];

export const cleanCodeArticles = cleanCodeSections.flatMap((item) => item.lessons);
