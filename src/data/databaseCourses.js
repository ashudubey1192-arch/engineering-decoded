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
    `Introduction to ${name}`, `${name} Architecture`, `Installing ${name}`, `${name} Data Model`, `${name} Tooling`,
  ]),
  section("modeling", "Data Modeling", [
    `Modeling ${focus}`, "Keys and Identifiers", "Relationships and Constraints", "Schema Design", "Model Evolution",
  ]),
  section("operations", "Core Operations", [
    "Creating and Updating Data", "Querying Data", "Filtering and Sorting", "Aggregation", "Bulk Operations",
  ]),
  section("performance", "Performance and Scale", [
    "Query Planning", "Index Strategy", "Caching", "Partitioning Strategy", "Performance Tuning",
  ]),
  section("reliability", "Reliability", [
    "Transactions and Consistency", "Concurrency Control", "Replication", "Backup and Recovery", "Failure Handling",
  ]),
  section("production", `Production ${name}`, [
    "Security and Access Control", "Monitoring", "Capacity Planning", "Migration Strategy", "Operational Best Practices",
  ]),
];

const definitions = [
  ["sql", "SQL", "relational data"], ["postgresql", "PostgreSQL", "PostgreSQL schemas"],
  ["mysql", "MySQL", "MySQL schemas"], ["oracle", "Oracle Database", "enterprise relational data"],
  ["transactions", "Database Transactions", "transactional workflows"],
  ["mongodb", "MongoDB", "document data"], ["cassandra", "Cassandra", "wide-column data"],
  ["redis", "Redis", "in-memory data"], ["influxdb", "InfluxDB", "time-series data"],
  ["hybrid-database-fundamentals", "Hybrid Database Fundamentals", "hybrid workloads"],
  ["distributed-sql", "Distributed SQL", "distributed relational data"],
  ["multi-model-databases", "Multi-model Databases", "multiple data models"],
  ["htap-databases", "HTAP Databases", "transactional and analytical workloads"],
  ["vector-database-fundamentals", "Vector Database Fundamentals", "vector embeddings"],
  ["pinecone", "Pinecone", "managed vector data"], ["milvus", "Milvus", "large-scale vector data"],
  ["weaviate", "Weaviate", "semantic data"], ["chroma", "Chroma", "application embeddings"],
  ["indexing", "Database Indexing", "index structures"], ["replication", "Database Replication", "replicated data"],
  ["sharding", "Database Sharding", "sharded data"], ["partitioning", "Database Partitioning", "partitioned data"],
];

export const databaseCourses = Object.fromEntries(
  definitions.map(([slug, name, focus]) => {
    const sections = buildSections(name, focus);
    return [slug, {
      name,
      sections,
      articles: sections.flatMap((item) => item.lessons),
      componentPath: `databases/${slug}`,
    }];
  }),
);
