const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((title) => ({
    title,
    slug: `${slug}--${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    time: "8 min",
    sectionSlug: slug,
  })),
});

export const systemDesignFundamentalsSections = [
  section("welcome", "Welcome", [
    "Course Introduction",
    "Course Roadmap",
    "Join the Community",
  ]),
  section("introduction-to-system-design", "Introduction to System Design", [
    "What is System Design?",
    "30 Must-Know Concepts",
  ]),
  section("core-concepts", "Core Concepts", [
    "Functional and Non-Functional Requirements",
    "Scalability",
    "Availability",
    "Reliability",
    "Single Point of Failure (SPOF)",
    "Latency Throughput and Bandwidth",
    "Consistent Hashing",
    "CAP Theorem",
    "Consistency Models",
    "Capacity Estimation",
    "Back-of-the-Envelope Calculations",
  ]),
  section("networking", "Networking", [
    "How the Internet Works",
    "IP Addresses and Subnets",
    "DNS",
    "TCP and UDP",
    "HTTP and HTTPS",
    "WebSockets",
    "Content Delivery Networks",
    "OSI Model",
    "Checksums",
    "Proxy vs Reverse Proxy",
  ]),
  section("load-balancing", "Load Balancing", [
    "What are Load Balancers?",
    "Load Balancing Algorithms",
    "Layer 4 vs Layer 7 Load Balancing",
    "DNS Load Balancing",
    "Anycast Routing",
    "Health Checks and Failover",
  ]),
  section("api-fundamentals", "API Fundamentals", [
    "What is an API?",
    "REST APIs",
    "HTTP Methods",
    "Status Codes",
    "Request and Response Design",
    "API Versioning",
    "Pagination",
    "Filtering and Sorting",
    "Authentication and Authorization",
    "Rate Limiting",
    "Idempotency",
    "GraphQL",
    "gRPC",
    "API Gateways",
  ]),
  section("communication-patterns", "Communication Patterns", [
    "Synchronous Communication",
    "Asynchronous Communication",
    "Request-Response",
    "Polling",
    "Long Polling",
    "Server-Sent Events",
    "WebSockets",
    "Message Queues",
    "Publish-Subscribe",
    "Event-Driven Architecture",
    "Webhooks",
  ]),
  section("caching", "Caching", [
    "Introduction to Caching",
    "Client-Side Caching",
    "CDN Caching",
    "Application Caching",
    "Database Caching",
    "Cache-Aside Pattern",
    "Read-Through Cache",
    "Write-Through Cache",
    "Write-Back Cache",
    "Cache Eviction Policies",
    "Cache Invalidation",
  ]),
];

export const systemDesignFundamentalsArticles = systemDesignFundamentalsSections.flatMap(
  (item) => item.lessons,
);

export const getArticlesForTrack = (trackSlug) =>
  trackSlug === "system-design-fundamentals" ? systemDesignFundamentalsArticles : null;
