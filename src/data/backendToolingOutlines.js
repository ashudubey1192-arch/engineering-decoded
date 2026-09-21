export const backendToolingOutlines = {
  springCache: {
    name: "Spring Cache", slug: "spring-cache", language: "Cache abstraction in Spring",
    platforms: "Backend · Caching",
    outline: [
      ["Foundations", "Cache abstraction", "Cache managers and providers", "Project configuration"],
      ["Cache operations", "Cacheable methods", "Cache updates and eviction", "Keys and conditions"],
      ["Integration", "Local and distributed providers", "Proxy boundaries", "Expiration and invalidation"],
      ["Production", "Testing cache behavior", "Metrics and troubleshooting", "Consistency and failure handling"],
    ],
  },
  redis: {
    name: "Redis", slug: "redis", language: "Separate server or process for shared caching",
    platforms: "Infrastructure · Distributed Cache",
    outline: [
      ["Foundations", "Server and client setup", "Keys and data types", "Cache versus system of record"],
      ["Caching patterns", "Cache-aside", "Expiration and invalidation", "Serialization and key design"],
      ["Integration", "Application clients", "Connection management", "Timeouts and fallbacks"],
      ["Production", "Eviction and capacity", "Availability and security", "Monitoring and testing"],
    ],
  },
  memcached: {
    name: "Memcached", slug: "memcached", language: "External distributed cache",
    platforms: "Infrastructure · Distributed Cache",
    outline: [
      ["Foundations", "Server and client setup", "Key-value operations", "Volatile cache storage"],
      ["Caching patterns", "Cache-aside", "Expiration and eviction", "Key design and serialization"],
      ["Integration", "Client-side distribution", "Connection handling", "Cache misses and fallbacks"],
      ["Production", "Memory planning", "Network access controls", "Monitoring and failure testing"],
    ],
  },
  postgresql: {
    name: "PostgreSQL", slug: "postgresql", language: "Persistent database and system of record",
    platforms: "Database",
    outline: [
      ["Foundations", "Database setup", "Tables and schemas", "SQL queries"],
      ["Data integrity", "Constraints and relationships", "Transactions", "Schema migrations"],
      ["Backend integration", "Database drivers and connection pools", "Queries and persistence", "Cache invalidation boundaries"],
      ["Production", "Indexes and query plans", "Backups and recovery", "Access control and monitoring"],
    ],
  },
};
