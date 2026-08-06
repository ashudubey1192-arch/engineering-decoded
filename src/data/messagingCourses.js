const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((lesson) => ({
    title: lesson,
    slug: `${slug}--${slugify(lesson)}`,
    time: "10 min",
    sectionSlug: slug,
  })),
});

const buildSections = (name, focus) => [
  section("foundations", `${name} Foundations`, [
    `Introduction to ${name}`, `${name} Use Cases`, `${name} Architecture`, `Core ${focus} Terminology`, `${name} Trade-offs`,
  ]),
  section("modeling", "Events and Messages", [
    "Event Design", "Message Contracts", "Keys and Ordering", "Headers and Metadata", "Schema Evolution",
  ]),
  section("delivery", "Delivery and Processing", [
    "Producers and Publishers", "Consumers and Subscribers", "Delivery Guarantees", "Acknowledgements", "Retries and Backoff",
  ]),
  section("reliability", "Reliability Patterns", [
    "Duplicate Handling", "Failure Recovery", "Poison Messages", "Backpressure", "Replay and Reprocessing",
  ]),
  section("scale", "Performance and Scale", [
    "Partitioning", "Consumer Scaling", "Throughput and Latency", "Capacity Planning", "Performance Tuning",
  ]),
  section("production", `Production ${name}`, [
    "Security", "Observability", "Testing", "Deployment and Operations", "Production Best Practices",
  ]),
];

const definitions = [
  ["kafka", "Apache Kafka", "streaming"],
  ["rabbitmq", "RabbitMQ", "queueing"],
  ["solace", "Solace", "event mesh"],
  ["event-streaming", "Event Streaming", "stream processing"],
  ["pub-sub", "Publish-Subscribe", "fan-out messaging"],
  ["dead-letter-queue", "Dead Letter Queue", "failed-message handling"],
  ["idempotency", "Idempotency", "duplicate-safe processing"],
  ["outbox-pattern", "Transactional Outbox Pattern", "reliable event publishing"],
];

export const messagingCourses = Object.fromEntries(
  definitions.map(([slug, name, focus]) => {
    const sections = buildSections(name, focus);
    return [slug, {
      name,
      sections,
      articles: sections.flatMap((item) => item.lessons),
      componentPath: `messaging/${slug}`,
    }];
  }),
);
