const section = (slug, title, lessons) => ({
  slug, title,
  lessons: lessons.map((title) => ({
    title,
    slug: `${slug}--${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    time: "10 min", sectionSlug: slug,
  })),
});

export const dddSections = [
  section("welcome", "Welcome", ["Course Introduction", "DDD Learning Roadmap", "How to Practice Domain Modeling"]),
  section("ddd-foundations", "DDD Foundations", [
    "What is Domain-Driven Design?", "Complex Domains", "Knowledge Crunching", "Model-Driven Design",
    "Domain Experts", "Strategic vs Tactical DDD", "When to Use DDD",
  ]),
  section("domains-and-subdomains", "Domains and Subdomains", [
    "Business Domains", "Core Domain", "Supporting Subdomains", "Generic Subdomains",
    "Subdomain Discovery", "Core Domain Investment",
  ]),
  section("strategic-design", "Strategic Design", [
    "Bounded Context Strategy", "Context Mapping", "Partnership", "Shared Kernel",
    "Customer Supplier", "Conformist", "Anti-Corruption Layer",
  ]),
  section("bounded-contexts", "Bounded Contexts", [
    "Defining Model Boundaries", "Context Boundaries", "Team Ownership", "Language Boundaries",
    "Splitting Contexts", "Evolving Contexts",
  ]),
  section("ubiquitous-language", "Ubiquitous Language", [
    "Building a Shared Language", "Language in Code", "Language in Conversations",
    "Resolving Ambiguity", "Evolving the Language",
  ]),
  section("tactical-modeling", "Tactical Modeling", [
    "Entities", "Value Objects", "Domain Services", "Factories", "Repositories",
    "Specifications", "Modules",
  ]),
  section("aggregates", "Aggregates", [
    "Aggregate Boundaries", "Aggregate Roots", "Business Invariants", "Referencing Aggregates",
    "Transaction Boundaries", "Designing Small Aggregates",
  ]),
  section("domain-events", "Domain Events", [
    "Identifying Domain Events", "Event Naming", "Publishing Events", "Event Handlers",
    "Eventual Consistency", "Event Storming",
  ]),
  section("ddd-architecture", "DDD Architecture", [
    "Layered Architecture", "Hexagonal Architecture", "Clean Architecture", "CQRS",
    "Event Sourcing", "Modular Monoliths",
  ]),
  section("context-integration", "Context Integration", [
    "Integration Contracts", "Translation Layers", "Published Language", "Open Host Service",
    "Asynchronous Integration", "Integration Events",
  ]),
  section("applied-ddd", "Applied DDD", [
    "Discovery Workshops", "Modeling a New Domain", "Refactoring Toward DDD", "DDD in Microservices",
    "Common DDD Mistakes", "Testing Domain Models", "DDD Case Study",
  ]),
];

export const dddArticles = dddSections.flatMap((item) => item.lessons);
