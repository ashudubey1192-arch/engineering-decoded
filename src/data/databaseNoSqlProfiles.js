import { profile, lab } from "./databaseLessonProfiles.js";

export const databaseNoSqlProfiles = {
  mongodb: profile(
    "https://www.mongodb.com/docs/manual/",
    "Model an order as a MongoDB document and test operations with mongosh. Single-document atomicity, replica-set transactions, and sharding are distinct capabilities.",
    `
MongoDB stores BSON documents in collections. Its flexible structure supports aggregates such as an order with bounded line items, while validation still matters.
Clients reach a server or sharded router; replica sets provide redundant copies. A primary handles writes and secondaries replicate an operation log.
Prepare a local disposable deployment and mongosh. Use a replica set for multi-document transaction labs; a standalone server is not an equivalent environment.
Embed data read and updated together when growth is bounded. Reference independently changing or unbounded entities to avoid oversized documents.
Use mongosh, explain, collection statistics, and controlled profiling. Inspect query shapes and scanned documents without logging sensitive document contents unnecessarily.
An order can embed purchase-time items while referencing a customer. Avoid embedding an ever-growing order history inside one customer document.
The _id field identifies a document. Add a unique compound index for tenant-scoped business references, checking sharding restrictions before relying on global uniqueness.
MongoDB does not provide relational foreign-key enforcement. References need application validation and repair; single-document embedding can keep some invariants atomic.
Collection validators can enforce required fields and types. Flexible schemas do not excuse mixing numeric units or storing incompatible shapes without versions.
Add new fields compatibly and read both versions during migration. Backfill in bounded batches and distinguish missing fields from explicit nulls.
Use update operators such as $inc and $set for atomic document changes. Replace-one operations can overwrite unrelated fields if based on stale copies.
Use find with explicit filters and projections. Multi-document joins through $lookup exist, but are not a reason to ignore document access patterns.
Combine a tenant predicate with deterministic sorting and a supporting compound index. Range cursors avoid increasingly expensive deep skip pagination.
Aggregation pipelines process staged transformations. Place selective matches early when possible and verify whether pipeline stages can use indexes.
bulkWrite groups operations but is not automatically one atomic transaction. Ordered and unordered modes have different error and continuation behavior.
Explain execution statistics show keys examined and documents examined. A small returned count can conceal a costly scan or blocking sort.
Compound indexes follow key-order rules and multikey indexes have array-related constraints. Index only useful access paths and measure write overhead.
WiredTiger caching and application result caching are different layers. A cached document still needs an explicit invalidation or staleness policy.
A shard key determines distribution and routing. Monotonic or low-cardinality choices can concentrate writes; tenant skew requires measurement.
Investigate scanned-to-returned ratios, working-set pressure, and slow aggregations. Adding shards does not fix a query that broadcasts unnecessarily.
Single-document writes are atomic. Multi-document transactions require supported topology and have costs; read concern and write concern define additional guarantees.
Use conditional updates with a version predicate for optimistic control. An update result with zero matches must be treated as a conflict when a version was expected.
Replica-set elections restore an eligible primary. Read preference controls placement, while read concern controls visibility; neither alone answers every freshness question.
Use a supported consistent backup approach and test restoration. A naive file copy during active writes is not a verified backup procedure.
Retryable writes have defined scope and deployment requirements. Keep stable business IDs because retry support does not make every multi-step workflow idempotent.
Enable authentication, scoped roles, and protected transport. Never accept a raw client-supplied query object as an unrestricted authorization filter.
Monitor replication lag, cache pressure, connections, slow operations, and shard balance. A healthy router does not prove all shards are healthy.
Estimate documents, indexes, replica copies, and operation-log retention. Large arrays and frequent document growth can change both memory and I/O demand.
Coordinate schema versions and shard-key changes with readers and writers. Verify document counts, keys, and business summaries after migration.
Rehearse elections, restores, and partial bulk-write recovery. Document which reads tolerate staleness and which operations require transactions.
`,
    [
      lab(
        "mongosh · disposable database",
        "use database_course\ndb.runCommand({ ping: 1 })",
        "A successful response has ok: 1. Use a replica-set deployment if testing transactions later.",
      ),
      lab(
        "mongosh · create once",
        "db.orders.createIndex({ tenant: 1, ref: 1 }, { unique: true });\ndb.orders.insertOne({ _id: 'o1', tenant: 't1', ref: 'a', cents: 1200, version: 1 });",
        "The primary ID and tenant/reference index enforce distinct uniqueness rules.",
      ),
      lab(
        "mongosh · after modeling lab",
        "db.orders.updateOne({ _id: 'o1', version: 1 }, { $inc: { cents: 100, version: 1 } });\ndb.orders.aggregate([{ $match: { tenant: 't1' } }, { $group: { _id: '$tenant', total: { $sum: '$cents' } } }]);",
        "The first update changes cents to 1300 and version to 2; replaying the same version predicate matches nothing.",
      ),
      lab(
        "mongosh · after modeling lab",
        "db.orders.find({ tenant: 't1', ref: 'a' }).explain('executionStats');",
        "Inspect keys/documents examined. The unique compound index can bound this exact lookup.",
      ),
      lab(
        "mongosh · conditional-write check",
        "db.orders.updateOne({ _id: 'o1', version: 1 }, { $set: { cents: 1 } });\ndb.orders.findOne({ _id: 'o1' });",
        "After the operations lab this stale update has matchedCount 0 and must not be reported as an accepted edit.",
      ),
      lab(
        "mongosh · recovery verification",
        "db.orders.countDocuments({ tenant: 't1' });\ndb.orders.find({ tenant: 't1' }, { _id: 1, ref: 1, cents: 1 }).sort({ _id: 1 });",
        "Compare stable keys and values after restoring a lab backup; matching counts alone are insufficient.",
      ),
    ],
  ),
  cassandra: profile(
    "https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/intro.html",
    "Use Cassandra CQL to model events by tenant and day. Query patterns, bounded partitions, consistency levels, and repair are central; CQL is not interchangeable with relational SQL.",
    `
Cassandra is a distributed wide-column database designed around partition-key access. Model tables for known queries rather than expecting arbitrary joins.
A coordinator routes requests to replicas responsible for token ranges. Writes pass through commit logs and memtables before immutable SSTables and compaction.
Use a disposable Cassandra deployment and cqlsh. A one-node lab can teach syntax but cannot demonstrate quorum availability or production replication behavior.
A partition key places related rows together; clustering columns order rows within the partition. Partition size and hotspot risk shape the model.
Use cqlsh, nodetool, request tracing, and metrics carefully. Full tracing and broad administrative operations have overhead and should be bounded.
Create an events_by_tenant_day table for recent events. A second access pattern may need a second table maintained by the application or ingestion flow.
Choose ((tenant_id, day), event_time, event_id) so identity and ordering are explicit. A UUID alone does not provide a useful query partition.
Cassandra does not enforce foreign keys or relational joins. Duplicated query tables require idempotent writes and reconciliation to keep representations aligned.
Use explicit CQL types and bounded collections. Unbounded partitions or collections undermine predictable reads and maintenance even if individual writes succeed.
Schema changes propagate through cluster metadata, while data backfills need application planning. Prefer compatible readers and explicit versioned representations.
INSERT and UPDATE are upserts. Reusing the full primary key addresses the same row; timestamp conflict resolution is not business-level deduplication.
Efficient reads supply the partition key and supported clustering restrictions. ALLOW FILTERING is not a general solution to an unsuitable table design.
Clustering order supports ordered reads within a partition. Global sorting across arbitrary partitions requires another processing layer or a different model.
Design rollups or an analytical pipeline for large aggregates. Cross-partition scans and COUNT over a large table are not cheap monitoring primitives.
Batches serve specific atomicity/partition use cases, not generic throughput optimization. Use bounded concurrent asynchronous writes for independent partitions.
Trace partition access, replica responses, and tombstones. Cassandra does not offer the same relational optimizer model as a SQL engine.
Secondary indexing capabilities depend on the release and index type. Begin with query-first primary keys and test selectivity before adding an index.
Caches may help repeated reads but cannot rescue an unbounded partition. Measure cache hit rates alongside disk work and tombstone scanning.
Bucket time-series events by a bounded period, then estimate the largest tenant's events per bucket. Smaller buckets trade partition size for read fan-out.
Inspect compaction backlog, tombstones, disk latency, and hot partitions. Increasing request concurrency can overload replicas and cause timeout cascades.
Consistency levels set required replica acknowledgments. Quorum overlap assumptions do not turn all operations into serializable transactions; lightweight transactions are separate.
Lightweight transactions use conditional statements for stronger per-key coordination at additional cost. Ordinary last-write-wins updates can lose application intent.
Replication factor and consistency level jointly influence availability. Repair is necessary to converge replicas and manage deleted data correctly over time.
Snapshots reference SSTables, but recovery also needs schema and an appropriate incremental/log strategy. Test restores and account for data written after the snapshot.
Timeouts may mean some replicas accepted the write. Retry idempotently with deliberate timestamps and avoid blindly retrying non-idempotent counters.
Enable authentication and authorization and protect internode/client transport. Tenant separation in a partition key is a modeling choice, not an access policy.
Monitor latency by operation, dropped messages, pending compactions, tombstones, disk space, and repair health. Cluster averages can conceal one overloaded node.
Budget replication factor, compaction headroom, repair traffic, and peak partition sizes. Storage near full can prevent the maintenance needed to recover performance.
Migrate with dual-readable query tables and checkpointed backfills. Verify by partition and time bucket rather than issuing a huge global count repeatedly.
Schedule repair, test node replacement, and document retention/TTL behavior. Align deletion and repair policies to avoid resurrecting deleted data.
`,
    [
      lab(
        "CQL · single-node learning environment only",
        "CREATE KEYSPACE course_lab WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};\nUSE course_lab;",
        "This intentionally nonresilient lab keyspace is not a production topology. Production placement needs a suitable datacenter-aware strategy.",
      ),
      lab(
        "CQL · after keyspace lab",
        "CREATE TABLE events (\n tenant text, day date, at timestamp, id int, value int,\n PRIMARY KEY ((tenant, day), at, id)\n) WITH CLUSTERING ORDER BY (at DESC);",
        "One tenant/day is one partition; timestamp and ID order and identify its rows.",
      ),
      lab(
        "CQL · after schema lab",
        "INSERT INTO events (tenant, day, at, id, value)\nVALUES ('t1', '2026-01-01', '2026-01-01T12:00:00Z', 1, 42);\nSELECT * FROM events WHERE tenant = 't1' AND day = '2026-01-01';",
        "The query targets one partition and returns the inserted event.",
      ),
      lab(
        "Cassandra · partition-size exercise",
        "tenant rate = 100 events/second\nper-day partition = 100 × 86400 = 8,640,000 rows\nper-hour partition = 100 × 3600 = 360,000 rows",
        "Daily bucketing may still be too large. Measure row bytes and access costs before choosing a bucket; hourly reads need more fan-out.",
      ),
      lab(
        "Cassandra · quorum exercise",
        "replication factor N = 3\nwrite acknowledgments W = 2\nread acknowledgments R = 2\nR + W = 4 > N",
        "Read and write replica sets overlap under these assumptions. This alone does not establish serializable multi-row transactions or solve concurrent-write semantics.",
      ),
      lab(
        "Cassandra · operational drill",
        "1. Record per-node latency and free disk.\n2. In staging, remove one replica from service.\n3. Measure success at the selected consistency level.\n4. Restore it and verify the repair procedure.",
        "A single-node RF=1 lab cannot pass this availability drill. Use a separate multi-node fixture and document expected failures.",
      ),
    ],
  ),
  redis: profile(
    "https://redis.io/docs/latest/develop/data-types/",
    "Use Redis commands for expiring sessions, counters, and ordered data. Redis is memory-oriented; persistence, replication, eviction, and atomic command semantics must be chosen explicitly.",
    `
Redis serves key-oriented data structures such as strings, hashes, sets, sorted sets, and streams. Choose the structure according to required operations, not JSON familiarity.
Commands operate on in-memory structures, with configured persistence and replication paths. Atomic execution of a command is distinct from crash durability.
Start an isolated Redis instance and connect with redis-cli. Verify PING and inspect persistence settings before assuming data survives restart.
A key identifies a typed value. Hashes represent field maps, sorted sets associate members with scores, and streams retain ordered entries with consumer semantics.
Use redis-cli, INFO, SLOWLOG, and latency tools with appropriate permissions. Avoid production-wide KEYS scans; iterate using SCAN when necessary.
Represent an expiring session separately from durable customer records. Redis can be a source of truth only if durability and eviction policies support that role.
Namespace keys with environment and tenant. Redis Cluster hash tags influence slot placement, but concentrating many keys in one tag can create hotspots.
Redis does not enforce foreign keys. Keep related atomic changes within supported command/script and cluster-slot boundaries or reconcile them externally.
Document key type, value shape, units, TTL, and ownership. Reusing a key for a different type causes WRONGTYPE errors and fragile deployments.
Version key formats and let old caches expire when possible. Durable Redis data needs an explicit backfill and compatibility plan rather than a TTL shortcut.
INCR and HINCRBY avoid read-modify-write races for counters. SET with NX and an expiry can establish conditional state, but a robust lock protocol needs more analysis.
Read with key-specific commands such as GET or HGETALL, keeping value sizes bounded. A single giant value can increase latency for every client sharing resources.
Sorted sets support score-based ordering and ranges. Lexicographic and score ordering differ; define tie behavior and pagination in the application.
Maintain counters or bounded rollups when aggregates are required. A counter updated separately from authoritative data can drift and needs reconciliation.
Pipelining reduces round trips but is not an atomic transaction. Bound pipeline sizes and inspect each response for errors and partial outcomes.
Redis core key access does not use a SQL query optimizer. Measure command complexity, key sizes, and slow operations instead of searching for EXPLAIN plans.
Core structures are access paths: hashes for fields, sets for membership, sorted sets for ordering. Search indexes require additional supported functionality.
Set a memory limit and an eviction policy appropriate to the role. Evicting a cache entry is different from evicting an authoritative balance.
Redis Cluster maps keys to hash slots. Multi-key operations generally require compatible slot placement; a hash tag is a deliberate locality decision.
Watch large keys, blocking commands, persistence overhead, and connection behavior. More clients can increase queueing on command execution rather than throughput.
MULTI/EXEC groups commands without interleaving, but runtime command errors do not roll back earlier successful commands. It is not SQL-style rollback.
WATCH detects changes before EXEC for optimistic retries. Lua scripts can perform atomic conditional logic but must remain short and respect deployment constraints.
Replication is commonly asynchronous. Sentinel and Cluster have different failover responsibilities; failover can lose recent writes depending on acknowledgment and persistence.
RDB snapshots and AOF offer different recovery trade-offs. Back up the required files and configuration and test a restart/restore using the chosen persistence policy.
Unknown outcomes can duplicate increments. Use operation IDs or authoritative reconciliation; a timeout does not make a non-idempotent command safe to repeat.
Use ACL users, key-pattern permissions, protected networking, and TLS where configured. Avoid exposing an unauthenticated server to untrusted networks.
Inspect used memory, evictions, hit/miss counts, replication offsets, blocked clients, and latency. A high cache hit ratio can still conceal very slow misses.
Include object overhead, fragmentation, replication buffers, and persistence copy-on-write headroom. Raw string byte counts understate memory requirements.
Change key versions and coordinate consumers during migration. Rebuilding a cache is simpler than moving authoritative Redis records with strict continuity.
Document whether Redis is disposable or authoritative, then rehearse the corresponding loss scenario. Test expiration, eviction, restart, and failover behavior separately.
`,
    [
      lab(
        "Redis CLI · isolated instance",
        "PING\nSET course:hello world\nGET course:hello",
        "PING returns PONG and GET returns world. Persistence still depends on server configuration.",
      ),
      lab(
        "Redis CLI · session model",
        "HSET course:session:1 user_id 7 role reader\nEXPIRE course:session:1 300\nTTL course:session:1",
        "The session is a hash with a five-minute lifetime; TTL decreases over time.",
      ),
      lab(
        "Redis CLI · ordered data",
        "ZADD course:scores 10 alice 20 bob\nZRANGE course:scores 0 -1 WITHSCORES\nINCR course:visits",
        "The sorted set lists alice before bob in ascending score order. Each INCR changes state again, so replay is not idempotent.",
      ),
      lab(
        "Redis CLI · bounded inspection",
        "SCAN 0 MATCH course:* COUNT 20\nMEMORY USAGE course:scores",
        "SCAN returns a cursor to continue and may return duplicates; COUNT is a hint, not a strict page size.",
      ),
      lab(
        "Redis CLI · transaction semantics",
        "SET course:n 1\nMULTI\nINCR course:n\nLPUSH course:n x\nEXEC\nGET course:n",
        "EXEC increments the string to 2; LPUSH fails with WRONGTYPE. The successful increment is not rolled back.",
      ),
      lab(
        "Redis CLI · restricted monitoring role",
        "INFO memory\nINFO persistence\nINFO replication",
        "Inspect memory use, persistence state, and replication role. These diagnostics require appropriate ACL permissions.",
      ),
    ],
  ),
  influxdb: profile(
    "https://docs.influxdata.com/influxdb3/core/",
    "Use InfluxDB 3 Core concepts for timestamped sensor data. Line protocol is the ingestion example; do not mix InfluxDB 1.x/2.x Flux and bucket administration with this version's APIs.",
    `
InfluxDB stores time-series observations for time-bounded analysis. This course targets InfluxDB 3 Core; product versions differ in APIs, deployment, and query language support.
Ingestion converts timestamped points into queryable storage with buffering and persistence. Separate write acknowledgment, query visibility, and long-term retention behavior.
Follow the InfluxDB 3 Core installation guide for your platform, create an isolated database and token, and verify one line-protocol write and SQL read.
Measurements/tables contain tags, fields, and timestamps. Tags identify dimensions; fields hold measured values. Choose types and timestamp precision deliberately.
Use the version-matched CLI or HTTP API and SQL query tools. Confirm endpoint, token scope, database name, and write precision in every fixture.
Model sensor ID and location as dimensions with temperature as a numeric field. Define whether a point is an observation or a mutable device state.
Point identity depends on the product's series/timestamp semantics. Retries with changed timestamps create new observations rather than deduplicating the original event.
Time-series data does not automatically enforce device foreign keys. Maintain device metadata ownership separately and define behavior for unknown devices.
Avoid inconsistent field types and implicit unit changes. A temperature field that silently switches from Celsius to Fahrenheit invalidates all downstream averages.
Introduce versioned fields or measurements when units or types change. Keep queries compatible during backfill and document the transition time boundary.
Batch line-protocol points with an explicit timestamp precision. Escaping spaces and commas in identifiers is part of valid ingestion, not cosmetic formatting.
Use SQL supported by InfluxDB 3 with a selective time window. Product-specific query limits and capabilities should be checked against the selected deployment.
Combine time bounds with selective dimensions. Always specify ordering for a latest-reading query and define how duplicate event times are handled.
Windowed aggregates summarize observations. Distinguish missing windows from zero values and account for late events before publishing finalized summaries.
Use bounded write batches and inspect rejected points. Retry with stable timestamps and identifiers so a transient network error does not fabricate extra observations.
Inspect available query diagnostics and the amount of time-series data scanned. Broad time windows can dominate cost even for a small result set.
Time-series indexing and columnar storage differ from relational B-tree design. Verify supported indexing features instead of issuing generic CREATE INDEX advice.
Cache dashboards only within their freshness budget. Include query window, dimensions, and aggregation version in the cache key.
Time-oriented storage organization helps prune scans and manage retention. Internal partition controls and deployment options are version-specific rather than generic SQL DDL.
Measure write batch size, query window, selected columns, and concurrent dashboards. Avoid inferring performance solely from the number of devices.
Do not assume multi-statement relational transactions across sensor writes. Define acceptable ingestion duplication, late arrival, and query visibility for the application.
Concurrent writers need a point-identity and conflict policy. Event time and ingestion time represent different facts and should not be confused.
High availability depends on the selected InfluxDB product and deployment. A local Core instance is not evidence of a replicated production service.
Use the version-supported backup/recovery workflow and retain configuration and tokens securely. Verify restored time ranges and recent writes, not just database presence.
Distinguish invalid line protocol from transient service errors. Quarantine malformed points and retry accepted-or-unknown batches with stable event identities.
Scope tokens to required databases and operations, secure transport, and protect device metadata. A database name supplied by the caller must be authorized.
Monitor ingestion errors, write/query latency, stored bytes, freshness, and missing series. A responsive endpoint can still be missing device data.
Estimate points per second, bytes per point, retention, and query concurrency. Dimension growth and late-data correction patterns affect actual cost.
Version migration requires checking API paths, authentication, query language, and schema semantics. Validate representative dashboards before switching ingestion.
Document version, timestamp precision, retention, and late-arrival policy. Rehearse restoring a known time range and detecting a silently stalled sensor.
`,
    [
      lab(
        "InfluxDB 3 Core · setup checklist",
        "record: server release, database, token scope\nwrite: one point with nanosecond timestamp\nquery: same database and time range\nverify: timestamp and field type",
        "Use the official version-matched write/query interface. This checklist is not a shell command.",
      ),
      lab(
        "Line protocol · nanosecond precision",
        "temperature,sensor=s1,room=lab celsius=21.5 1767225600000000000",
        "This describes one temperature observation at 2026-01-01T00:00:00Z, with sensor and room dimensions.",
      ),
      lab(
        "InfluxDB 3 SQL · after ingesting the point",
        "SELECT time, sensor, celsius FROM temperature\nWHERE time >= '2026-01-01T00:00:00Z'\n  AND time < '2026-01-02T00:00:00Z'\n  AND sensor = 's1' ORDER BY time;",
        "The query includes the example point. Adjust the date if the deployment's configured retention has expired it.",
      ),
      lab(
        "InfluxDB 3 SQL · bounded aggregation",
        "SELECT sensor, AVG(celsius) AS mean_celsius\nFROM temperature\nWHERE time >= '2026-01-01T00:00:00Z'\n  AND time < '2026-01-02T00:00:00Z'\nGROUP BY sensor;",
        "With only the fixture point, sensor s1 averages 21.5. Averages weight observations, not elapsed time, unless explicitly modeled otherwise.",
      ),
      lab(
        "Time-series ingestion · design exercise",
        "event: sensor=s1, timestamp=T, value=21.5\nresponse lost → retry same event identity\nincorrect retry: timestamp=now, value=21.5",
        "Changing event time during a retry creates a different observation. Preserve event identity and inspect the selected release's duplicate-point rules.",
      ),
      lab(
        "Time-series capacity · calculation",
        "1000 sensors × 1 point/second × 86400 seconds\n= 86,400,000 points/day\nretained points = daily points × retention days",
        "Multiply measured stored bytes per point and include query/maintenance headroom. Do not treat raw line-protocol length as compressed storage size.",
      ),
    ],
  ),
};
