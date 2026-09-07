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

export const highLevelDesignSections = [
  section("welcome", "Welcome", ["Course Introduction", "Course Roadmap", "How to Approach HLD"]),
  section("hld-foundations", "HLD Foundations", [
    "What is High Level Design?", "Requirements Clarification", "Capacity Estimation",
    "Defining APIs and Data Models", "Identifying Core Components",
  ]),
  section("scalability", "Scalability and Performance", [
    "Horizontal and Vertical Scaling", "Load Balancing", "Caching Strategy",
    "Content Delivery Networks", "Asynchronous Processing", "Performance Bottlenecks",
  ]),
  section("data-layer", "Data Layer", [
    "Choosing a Database", "SQL vs NoSQL", "Replication", "Sharding",
    "Partitioning", "Data Consistency",
  ]),
  section("distributed-systems", "Distributed Systems", [
    "CAP Theorem", "Consistent Hashing", "Leader Election", "Distributed Locks",
    "Message Queues", "Event Streaming", "Service Discovery",
  ]),
  section("reliability", "Reliability and Resilience", [
    "Fault Tolerance", "Redundancy and Failover", "Circuit Breakers",
    "Retries and Backoff", "Disaster Recovery",
  ]),
  section("operations", "Security and Operations", [
    "Authentication and Authorization", "Rate Limiting", "Observability",
    "Logging and Monitoring", "Deployment Strategy",
  ]),
  section("hld-case-studies", "HLD Case Studies", [
    "Design a URL Shortener", "Design a Social Feed", "Design a Chat System",
    "Design a Video Platform", "Design a Ride-Sharing Service", "Design a Notification System",
  ]),
];

export const highLevelDesignArticles = highLevelDesignSections.flatMap((item) => item.lessons);
