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

export const microservicesSections = [
  section("welcome", "Welcome", ["Course Introduction", "Microservices Learning Roadmap", "How to Use This Course"]),
  section("microservices-foundations", "Microservices Foundations", [
    "What are Microservices?", "Monolith vs Microservices", "Benefits and Trade-Offs",
    "Service Boundaries", "Bounded Contexts", "When Not to Use Microservices",
  ]),
  section("service-decomposition", "Service Decomposition", [
    "Decompose by Business Capability", "Decompose by Subdomain", "Domain-Driven Design",
    "Identifying Service Boundaries", "Avoiding Distributed Monoliths", "Migration from a Monolith",
  ]),
  section("service-communication", "Service Communication", [
    "Synchronous Communication", "Asynchronous Communication", "REST Between Services",
    "gRPC Between Services", "Message Brokers", "Event-Driven Communication", "API Contracts",
  ]),
  section("distributed-data", "Distributed Data Management", [
    "Database per Service", "Shared Database Anti-Pattern", "Distributed Transactions",
    "Saga Pattern", "Transactional Outbox", "Event Sourcing", "CQRS", "Data Consistency",
  ]),
  section("discovery-and-routing", "Discovery and Routing", [
    "Service Discovery", "Client-Side Discovery", "Server-Side Discovery",
    "API Gateway", "Backend for Frontend", "Load Balancing",
  ]),
  section("resilience", "Resilience", [
    "Failure in Distributed Systems", "Timeouts", "Retries and Backoff", "Circuit Breaker",
    "Bulkhead Pattern", "Rate Limiting", "Graceful Degradation",
  ]),
  section("microservices-security", "Microservices Security", [
    "Zero Trust Architecture", "Service Authentication", "Service Authorization",
    "OAuth 2.0 and OpenID Connect", "Token Propagation", "Secrets Management",
  ]),
  section("observability", "Observability", [
    "Centralized Logging", "Metrics", "Distributed Tracing", "Correlation IDs",
    "Health Checks", "Service-Level Objectives",
  ]),
  section("deployment", "Deployment and Operations", [
    "Containerizing Services", "Kubernetes Fundamentals", "Service Configuration",
    "Rolling Deployments", "Blue-Green Deployments", "Canary Releases", "Autoscaling",
  ]),
  section("testing", "Testing Microservices", [
    "Unit Testing", "Integration Testing", "Contract Testing", "Component Testing",
    "End-to-End Testing", "Test Environments",
  ]),
  section("architecture-patterns", "Architecture Patterns", [
    "Sidecar Pattern", "Strangler Fig Pattern", "Anti-Corruption Layer", "Service Mesh",
    "Choreography vs Orchestration", "Cell-Based Architecture", "Microservices Case Study",
  ]),
];

export const microservicesArticles = microservicesSections.flatMap((item) => item.lessons);
