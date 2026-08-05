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

export const springBootSections = [
  section("welcome", "Welcome", ["Course Introduction", "Spring Boot Learning Roadmap", "Development Environment Setup"]),
  section("spring-boot-foundations", "Spring Boot Foundations", [
    "What is Spring Boot?", "Spring Initializr", "Project Structure", "Starter Dependencies",
    "Auto-Configuration", "Running a Spring Boot Application",
  ]),
  section("spring-core", "Spring Core", [
    "Inversion of Control", "Dependency Injection", "Spring Beans", "Bean Scopes",
    "Java-Based Configuration", "Configuration Properties",
  ]),
  section("web-and-rest", "Web and REST APIs", [
    "Spring MVC", "REST Controllers", "Request Mapping", "Request and Response Bodies",
    "Path and Query Parameters", "HTTP Status Codes", "API Versioning",
  ]),
  section("data-and-jpa", "Data Access and JPA", [
    "Spring Data JPA", "Entity Mapping", "Repositories", "Derived Queries",
    "JPQL and Native Queries", "Transactions", "Pagination and Sorting",
  ]),
  section("validation-and-errors", "Validation and Error Handling", [
    "Bean Validation", "Custom Validators", "Global Exception Handling",
    "Problem Details", "Error Response Design",
  ]),
  section("spring-security", "Spring Security", [
    "Security Fundamentals", "Security Filter Chain", "Authentication", "Authorization",
    "JWT Security", "OAuth 2.0", "Method-Level Security",
  ]),
  section("testing", "Testing Spring Boot", [
    "Unit Testing", "Mockito", "Spring Boot Test", "MVC Slice Tests",
    "Data Layer Tests", "Integration Testing with Testcontainers",
  ]),
  section("production", "Production Readiness", [
    "Profiles and Environments", "Actuator", "Health Checks", "Metrics and Observability",
    "Logging", "Externalized Configuration",
  ]),
  section("microservices", "Microservices with Spring", [
    "Microservice Architecture", "Service Discovery", "API Gateway", "Declarative HTTP Clients",
    "Circuit Breakers", "Distributed Tracing", "Centralized Configuration",
  ]),
  section("messaging", "Messaging and Events", [
    "Event-Driven Applications", "Spring for Apache Kafka", "RabbitMQ Integration",
    "Transactional Outbox", "Idempotent Consumers",
  ]),
  section("advanced-spring-boot", "Advanced Spring Boot", [
    "Caching", "Scheduling", "Async Processing", "WebSockets",
    "Dockerizing Spring Boot", "Deploying to Production",
  ]),
];

export const springBootArticles = springBootSections.flatMap((item) => item.lessons);
