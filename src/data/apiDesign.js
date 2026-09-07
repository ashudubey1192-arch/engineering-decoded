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

export const apiDesignSections = [
  section("welcome", "Welcome", ["Course Introduction", "API Design Learning Roadmap", "How to Use This Course"]),
  section("api-foundations", "API Foundations", [
    "What is an API?", "API Styles Overview", "API-First Design", "Consumer-Oriented APIs",
    "API Design Workflow", "Choosing an API Style",
  ]),
  section("rest-design", "REST API Design", [
    "REST Constraints", "Resource Modeling", "URI Design", "HTTP Methods",
    "HTTP Status Codes", "Representations", "Content Negotiation",
  ]),
  section("requests-and-responses", "Requests and Responses", [
    "Request Body Design", "Response Body Design", "Error Response Design", "Validation Errors",
    "Headers and Metadata", "Date and Time Formats", "Null and Optional Fields",
  ]),
  section("querying-resources", "Querying Resources", [
    "Filtering", "Sorting", "Searching", "Pagination", "Sparse Fieldsets", "Bulk Operations",
  ]),
  section("api-evolution", "API Evolution", [
    "Backward Compatibility", "API Versioning", "Deprecation Strategy", "Schema Evolution",
    "Breaking Changes", "Consumer Migration",
  ]),
  section("security", "API Security", [
    "Authentication vs Authorization", "API Keys", "OAuth 2.0", "OpenID Connect",
    "Token Design", "Input Security", "CORS",
  ]),
  section("reliability", "Reliability and Performance", [
    "Idempotency", "Rate Limiting", "Retries", "Timeouts", "Caching",
    "Concurrency Control", "Asynchronous Operations",
  ]),
  section("contracts-and-docs", "Contracts and Documentation", [
    "OpenAPI Fundamentals", "Schema Design", "Examples and Descriptions", "API Documentation",
    "Contract Testing", "Mock Servers",
  ]),
  section("alternative-api-styles", "Alternative API Styles", [
    "GraphQL Design", "gRPC Design", "Webhooks", "WebSockets", "Event APIs", "AsyncAPI",
  ]),
  section("api-platform", "API Platform and Governance", [
    "API Gateways", "Developer Portals", "API Observability", "Design Reviews",
    "Governance and Standards", "API Lifecycle", "API Design Case Study",
  ]),
];

export const apiDesignArticles = apiDesignSections.flatMap((item) => item.lessons);
