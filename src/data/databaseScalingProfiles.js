import { profile, lab } from "./databaseLessonProfiles.js";

export const databaseScalingProfiles = {
  indexing: profile(
    "https://www.postgresql.org/docs/current/indexes.html",
    "Use PostgreSQL indexes to study access paths, selectivity, maintenance, and plan evidence. Indexing is a capability, so the lab installs an engine rather than a separate indexing product.",
    `
An index is an auxiliary access structure that reduces some reads at the cost of writes and storage. Its value is specific to a query workload.
Trace lookup from index key to matching record locations and visibility checks. An index can avoid scanning unrelated rows without eliminating all table access.
Prepare PostgreSQL and a disposable table with realistic row counts and skew. Ten uniformly distributed rows cannot establish an indexing strategy.
Index entries encode selected keys and references to records. Covering designs retain extra values to reduce record fetches where the engine supports it.
Use EXPLAIN, actual execution statistics, index sizes, and usage counters. Capture before/after measurements with the same data and cache conditions.
Write a query inventory with equality predicates, range predicates, sort order, and returned columns. Design candidate indexes from that inventory.
Primary-key indexes enforce identity while secondary indexes serve alternate access. A unique business index may be needed even with a surrogate primary key.
Unique indexes can enforce some constraints atomically. Foreign-key lookup performance often needs a separate index on the referencing columns.
Choose key order, collation, operator support, and expressions deliberately. An indexed expression must match how the query asks for data.
Build replacement indexes safely, verify plans, then retire redundant indexes after an observation period. Check invalid indexes after interrupted concurrent builds.
Every insert and relevant update maintains affected indexes. Indexed-column churn can add more cost than a read-only benchmark reveals.
An index helps when its structure and operators fit the predicate. Wrapping a column in a function can prevent use of a plain-column index.
Equality-prefix then range/order keys often fit tenant timelines. Test mixed directions, null ordering, and a unique pagination tie-breaker.
Indexes can support grouping or ordered scans, but large aggregates may still read much of the dataset. Materialized summaries have different maintenance trade-offs.
Bulk loading with many indexes amplifies work. Compare staging plus index build against incremental maintenance, preserving required uniqueness validation.
Compare estimated rows with actual rows and buffers. A sequential scan on a low-selectivity predicate may be the correct plan.
B-tree, GIN, GiST, and BRIN serve different operator/data characteristics in PostgreSQL. No index type is universally fastest.
Index pages compete for cache with table pages. A large rarely used index can displace useful data and worsen unrelated requests.
Partitioned tables generally maintain partition-local index structures with engine-specific uniqueness rules. Pruning and indexing solve different layers of work.
Measure p99 reads, write throughput, index size, and build duration together. A read improvement that collapses ingestion may be a poor trade.
Index maintenance participates in transactional correctness according to engine rules. An index is not an independently authoritative copy of business records.
Concurrent builds and uniqueness checks can interact with writers and old snapshots. Understand lock phases and wait conditions before production maintenance.
Index definitions and physical maintenance differ between replication mechanisms. Logical replication may require separately coordinated schema/index setup.
Recovery must restore or rebuild usable indexes and constraints. Measure rebuild time before assuming all indexes can simply be regenerated during an outage.
Detect invalid or failed builds and verify whether uniqueness is enforced. Do not drop the previous access path before the replacement is usable.
Indexes can contain sensitive values even when selected query output is masked. Restrict diagnostic access and protect physical backups.
Track index usage, growth, bloat indicators, and query plans. Low usage over a short window does not prove an index is unnecessary for monthly jobs.
Estimate each index's keys, row references, page overhead, and replicas. Reserve space for creating a replacement alongside the original.
Porting indexes between engines requires checking collation, NULL uniqueness, included columns, and operator behavior. Revalidate every important query plan.
Maintain an index rationale tied to query shapes and measured outcomes. Remove redundant indexes through reviewed changes with rollback evidence.
`,
    [
      lab(
        "PostgreSQL · disposable index lab",
        "CREATE TABLE index_events (id INTEGER PRIMARY KEY, tenant INTEGER, happened INTEGER);\nINSERT INTO index_events SELECT n, n % 100, n FROM generate_series(1, 10000) AS n;\nANALYZE index_events;",
        "The fixture has 10,000 rows and 100 tenants. It is deliberately uniform; add skew for production-like experiments.",
      ),
      lab(
        "PostgreSQL · after fixture",
        "CREATE INDEX events_tenant_time ON index_events (tenant, happened, id);",
        "Tenant equality can bound a contiguous key range, followed by ordered happened/id traversal.",
      ),
      lab(
        "PostgreSQL · after fixture",
        "SELECT id, happened FROM index_events\nWHERE tenant = 7 AND happened > 5000\nORDER BY happened, id LIMIT 20;",
        "The first matching ID is 5007; the query continues in increments of 100 for this synthetic fixture.",
      ),
      lab(
        "PostgreSQL · execution measurement",
        "EXPLAIN (ANALYZE, BUFFERS) SELECT id, happened\nFROM index_events WHERE tenant = 7 AND happened > 5000\nORDER BY happened, id LIMIT 20;",
        "Inspect selected access path, rows, buffers, and any sort. Do not assert an exact plan across all engine versions and machines.",
      ),
      lab(
        "PostgreSQL · constraint experiment",
        "BEGIN;\nINSERT INTO index_events VALUES (1, 7, 1);\n-- Duplicate primary key aborts this transaction.\nROLLBACK;",
        "The primary-key index rejects the duplicate; it is more than a performance optimization.",
      ),
      lab(
        "PostgreSQL · index inventory",
        "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'index_events';",
        "Inventory the primary key and composite index before a restore, migration, or removal review.",
      ),
    ],
  ),
  replication: profile(
    "https://www.postgresql.org/docs/current/high-availability.html",
    "Reason about a primary and replicas using PostgreSQL streaming replication as a reference. Topology exercises are plans for isolated staging environments, not production failover commands.",
    `
Replication maintains copies for availability, locality, or read scaling. It does not inherently protect against accidental deletion or guarantee zero data loss.
Trace commit logging, transmission, durable receipt, replay, and read visibility. Each stage can have a separate position and lag measurement.
Prepare a documented primary/standby laboratory with isolated ports and storage. A single connection to one server cannot demonstrate replication or failover.
Physical replication copies storage-level changes; logical replication transfers logical records. Their compatibility, filtering, and schema-management constraints differ.
Use source and replica status views with application probes. Distinguish bytes behind, time behind, receive position, and replay position.
Assign one clear write authority unless the chosen system explicitly supports coordinated multi-writer behavior. Conflict resolution is part of the data model.
Stable operation IDs make failover reconciliation possible. Generated IDs and sequences need special attention when migrating or using logical replication.
Check when constraints apply on replicas and subscribers. A logical target with different schema rules can reject changes and stall the stream.
Schema compatibility is part of replication health. Logical replication does not universally propagate every DDL change automatically.
Deploy compatible schema changes before producers emit new shapes. Track all subscribers rather than assuming a healthy primary means migration completion.
Writes acknowledged before replica durability can be lost on failover. Set acknowledgment policy from the business loss budget and measured latency.
Route reads according to freshness requirements. A replica query can be fast and successful while missing a just-committed primary write.
Pagination across replicas with different positions can expose inconsistent views. Keep a consistent routing/snapshot policy where the workflow requires it.
Reporting replicas isolate some query work but still consume replication and storage resources. Long snapshots can interfere with cleanup or replay.
Bulk imports can generate large replication backlogs. Measure catch-up capacity and throttle ingestion before retention or disk limits are reached.
Query plans may differ on logical subscribers with different statistics and indexes. Replication correctness does not imply identical query performance.
Physical replicas generally follow physical index changes; logical targets can need independent index management. Confirm behavior for the chosen mechanism.
A replica is a maintained data copy, not a cache with arbitrary eviction. Application result caching adds another independent staleness layer.
Replicate across actual failure domains, not just separate processes on one host. Partition placement and replica placement solve different problems.
Measure commit latency under synchronous settings and stale-read exposure under asynchronous settings. No configuration eliminates every trade-off.
Define what synchronous acknowledgment waits for: receipt, durable storage, or replay. These states provide different durability and visibility guarantees.
Promoting a replica while the former primary still writes creates split-brain risk. Fence the old authority before accepting a conflicting history.
Replication factor is a count, not a failover protocol. Elections, quorum rules, log continuity, and client routing determine actual availability.
Keep independent recoverable backups because corruption and deletes can replicate. Verify that retained logs cover the intended recovery point.
Rejoin a former primary only through the supported rewind/rebuild workflow. Never assume its divergent history can simply resume as a replica.
Use least-privilege replication identities and encrypted transport. Replication access can expose the full dataset even if application queries are restricted.
Alert on replay lag, disconnected replicas, retained-log growth, and missing eligible failover targets. Measure application-visible freshness too.
Budget network egress, replica storage, retained logs, and catch-up CPU/I/O. A replica that can only match normal write rate cannot recover backlog.
Use controlled switchover for planned migrations with final catch-up and fencing. Verify clients follow the new authority and stale connections are closed.
Rehearse promotion, fencing, reconnect, and failback with clear ownership. Record measured RPO and RTO from the drill rather than topology claims.
`,
    [
      lab(
        "Replication · architecture map",
        "client writes → primary log → replica receive → replica replay\nclient reads → primary or replica according to freshness contract",
        "Label where a write is acknowledged and which failures can occur before replay.",
      ),
      lab(
        "Replication · position model",
        "primary committed position: 120\nreplica received position: 118\nreplica replayed position: 115",
        "The replica has received more than it can currently serve. A record committed at position 119 is not yet received.",
      ),
      lab(
        "Replication · read-after-write schedule",
        "write order 42 on primary → acknowledgment\nimmediate read on lagging replica → not found\nread after replica replay catches up → found",
        "A temporary miss is compatible with asynchronous replication; route the session appropriately if this is unacceptable.",
      ),
      lab(
        "Replication · backlog calculation",
        "incoming log rate: 20 MB/s\nreplica catch-up rate: 30 MB/s\nbacklog: 600 MB\nnet drain: 10 MB/s → ideal catch-up: 60 seconds",
        "If both rates become 20 MB/s, backlog does not drain. Include contention and variable rates in real planning.",
      ),
      lab(
        "Replication · isolated failover drill",
        "1. Record last acknowledged operation ID.\n2. Stop or fence old primary.\n3. Promote eligible replica using documented tooling.\n4. Reconnect client and reconcile operation ID.",
        "Measure any lost acknowledged operations and time to useful service. Do not execute topology changes against production as a tutorial.",
      ),
      lab(
        "PostgreSQL · safe role inspection",
        "SELECT pg_is_in_recovery();",
        "False indicates a server not in recovery; true identifies recovery/standby state. It does not by itself prove failover readiness or freshness.",
      ),
    ],
  ),
  sharding: profile(
    "https://www.mongodb.com/docs/manual/sharding/",
    "Study horizontal distribution with a multi-tenant order service. MongoDB sharding is a concrete reference, while routing and resharding exercises are intentionally engine-neutral.",
    `
Sharding assigns different subsets of data to different owners. Replication creates copies of the same subset; scalable systems often use both.
A routing layer maps shard keys to owners using metadata. Stale routing, ownership transfer, and per-shard replicas complicate the request path.
Choose a documented multi-shard lab or start with a pure routing simulation. Installing a second independent database alone does not create safe sharding.
Separate logical identity from the shard key. The shard key should make dominant requests target a bounded subset while distributing load acceptably.
Observe routing decisions, per-shard load, and scatter-gather queries. Aggregate cluster averages hide skew and a single overloaded shard.
Tenant sharding makes tenant queries local but exposes large-tenant hotspots. Consider whether a tenant needs subdivision or dedicated placement.
A global order ID and a tenant routing key serve different purposes. Uniqueness constraints spanning shards require supported coordination or key design.
Cross-shard references and joins can require distributed queries or denormalization. Application-side integrity repair is necessary when the engine cannot enforce them.
Include routing keys in relevant access contracts and indexes. Omitting them can turn a point lookup into a broadcast.
Changing the shard key is a data migration, not merely a metadata edit. Readers and writers need a consistent ownership transition.
Route mutations through the current ownership map and use idempotent IDs. A retry during movement must not create duplicate logical records on two owners.
Targeted reads are cheaper than fan-out when data can be located directly. Queries without a shard key need explicit cost and timeout handling.
Global ordering requires merging ordered shard results. Cursors need enough state to continue correctly without assuming one local offset.
Distributed aggregation computes partial results then combines them. Merge sums and counts, not unweighted averages of shard averages.
Distribute bulk loads with per-shard backpressure. One saturated shard should not accumulate unlimited queued work while others remain idle.
Explain whether queries target one shard or scatter to many. Measure network fan-out and slowest-shard effects, not just local index efficiency.
Local indexes remain important after sharding. Sharding a full scan can distribute cost while still doing far too much total work.
Cache routing metadata with a refresh policy and handle stale-owner responses. Cache invalidation is part of safe ownership movement.
Hashing spreads keys but weakens range locality; ranges support pruning but can concentrate monotonic writes. Choose from workload evidence.
Measure hot keys, hot tenants, and scatter-gather tail latency. Adding shards cannot parallelize an indivisible hot record automatically.
Cross-shard atomicity requires engine support and coordination. Co-location can reduce cost, but splitting an invariant across independent commits changes correctness.
During rebalancing, prevent concurrent owners from accepting conflicting writes. Use the product's migration protocol rather than a hand-built copy-and-switch guess.
Each shard can have its own replica group and failure budget. Losing one shard can make a subset of tenants unavailable even when most nodes are healthy.
Backups need a consistent cross-shard recovery point plus routing metadata. Restoring shards at unrelated moments can violate cross-shard invariants.
Handle partial scatter-gather failures explicitly. Returning only successful shards as if the result were complete silently corrupts reports.
Authorize tenant scope before routing. A caller-supplied shard identifier must not bypass tenant checks or expose another shard directly.
Monitor per-shard storage, QPS, p99 latency, migrations, and routing errors. Track both average and maximum utilization.
Plan spare capacity for moving data and surviving replica loss. Rebalancing consumes network and disk while foreground traffic continues.
Use supported resharding workflows, checkpoints, and validation. Verify every key has the intended owner and no accepted writes were lost at cutover.
Document shard-key rationale, large-tenant handling, and resharding procedures. Test skew, owner movement, and partial query failures before rollout.
`,
    [
      lab(
        "Sharding · routing simulation",
        "tenant A → shard 1\ntenant B → shard 2\ntenant C → shard 1\norder lookup requires tenant + order ID",
        "Data ownership differs by tenant; replicas of shard 1 would still contain A and C rather than additional tenants.",
      ),
      lab(
        "Sharding · skew exercise",
        "A: 800 requests/second\nB: 100 requests/second\nC: 100 requests/second\nshard 1 receives A+C = 900 requests/second",
        "An even tenant count is not an even load. Subdivision or dedicated placement may be needed for A.",
      ),
      lab(
        "Sharding · distributed top-k",
        "shard 1 newest IDs: [a9, a8]\nshard 2 newest IDs: [b9, b8]\nfetch local top-2 with timestamps\nmerge globally by (timestamp, unique ID) → top-2",
        "Ordering must compare keys, not concatenate results. The global cursor needs a deliberate continuation strategy.",
      ),
      lab(
        "Sharding · fan-out tail",
        "shard response times: 10 ms, 12 ms, 300 ms\ncomplete aggregate waits for all three\nminimum completion time ≈ 300 ms plus merge/network overhead",
        "The slowest required shard controls completion. Adding shards can increase exposure to tail latency.",
      ),
      lab(
        "Sharding · ownership transition",
        "copy bounded range → catch up writes → fence old owner\nupdate routing atomically through supported protocol\nverify new owner → retire old copy after safety window",
        "A plain copy followed by a client config edit does not account for writes made during transfer.",
      ),
      lab(
        "Sharding · migration audit",
        "For every source key:\n  resolve expected owner\n  compare destination version and value\n  flag missing, duplicate, or stale records\nAlso compare per-tenant totals.",
        "Totals alone can conceal misplaced or duplicated keys. Audit ownership and values as well as aggregate counts.",
      ),
    ],
  ),
  partitioning: profile(
    "https://www.postgresql.org/docs/current/ddl-partitioning.html",
    "Use PostgreSQL range partitions to organize events by month. Partitioning is a logical/physical subdivision and does not necessarily distribute data across independent servers.",
    `
Partitioning splits one logical dataset into subsets with explicit boundaries. It helps pruning and lifecycle operations when queries and retention align with those boundaries.
A partitioned parent routes rows to child partitions. The planner prunes irrelevant children while each remaining partition still needs an efficient access path.
Prepare a disposable PostgreSQL database and create a partitioned events table. No separate partitioning service is installed for this lab.
Range, list, and hash partitioning encode different grouping rules. Choose the key and boundaries before assuming partitioning helps the dominant query.
Use EXPLAIN and catalog inspection to verify routing and pruning. A partitioned schema can still scan every child if the query lacks usable predicates.
Monthly event partitions fit time-bounded reporting and retention. Estimate the newest and largest partitions rather than relying on uniform historical volume.
In PostgreSQL, parent unique constraints must include all partition keys in supported designs. Decide how global event identity is enforced when time is part of uniqueness.
Foreign keys and uniqueness have engine-specific partition limitations. Validate the exact schema rather than assuming all unpartitioned designs transfer unchanged.
Use nonoverlapping half-open time ranges and explicit timezone semantics. Boundary ambiguity creates missing partitions or misrouted records at midnight.
Create future partitions before writes reach them. Changing boundaries or partition keys requires a migration and validation of existing rows.
Inserts into the parent are routed by key. Updating a partition key may move a row and has concurrency/operational implications that must be tested.
Include bounded partition-key predicates where they fit the business request. A lookup by unrelated ID may still inspect many partitions.
Use direct timestamp bounds compatible with partition pruning. Applying arbitrary expressions can prevent useful pruning unless supported by the planner.
Partial aggregates can be combined across partitions. Retention that removes a partition also changes historical totals unless summaries are retained elsewhere.
Load and validate staged data before attaching a partition where the engine supports it. Index/constraint compatibility and locking requirements matter.
EXPLAIN should show only required children for a narrow range. Runtime pruning can differ from planning-time pruning for parameterized statements.
Partition-local indexes accelerate work within each child. A good partition key does not replace an index needed by predicates inside a large partition.
Old partitions may be cold while the current one is hot. Cache behavior depends on the active working set, not total historical table size.
Choose partition granularity from retention, pruning, and maintenance needs. Too many tiny partitions add planning and operational overhead.
Compare query latency, planning time, and maintenance duration before/after partitioning. A broad all-history query may see little benefit.
Partitioning does not change the need for transactions or correct isolation. Operations spanning children still need supported atomicity and invariant checks.
Attach/detach and index maintenance can require locks. Test concurrent writes and schedule maintenance according to measured lock behavior.
Replication may propagate partition DDL differently by mechanism. Keep subscriber schemas compatible and confirm routing on the destination.
Restore partition definitions, child data, indexes, and constraints together. A restored parent without needed children cannot serve the intended history.
Missing future partitions can reject incoming writes. Alert on partition coverage and provide a tested creation/repair procedure before the boundary is reached.
Partition boundaries are not tenant authorization. Queries against the parent still need the same grants, row policies, and trusted filters.
Monitor per-partition size, row count estimates, pruning, and future coverage. A rapidly growing newest partition may need a different granularity.
Budget active indexes, retained partitions, and staging/attach space. Retention savings depend on actually removing data under an approved lifecycle policy.
Migrate an existing table with backfill plus captured changes and key verification. Replacing the parent name alone does not migrate foreign keys and dependencies safely.
Automate partition creation with checks and rehearse retention on disposable data. Verify backups and historical reporting needs before destructive lifecycle operations.
`,
    [
      lab(
        "PostgreSQL · create once",
        "CREATE TABLE partition_events (\n id INTEGER NOT NULL, happened DATE NOT NULL, value INTEGER,\n PRIMARY KEY (happened, id)\n) PARTITION BY RANGE (happened);",
        "The primary key includes the partition key. It does not enforce uniqueness of id alone across different dates.",
      ),
      lab(
        "PostgreSQL · after parent fixture",
        "CREATE TABLE events_2026_01 PARTITION OF partition_events\nFOR VALUES FROM ('2026-01-01') TO ('2026-02-01');\nCREATE TABLE events_2026_02 PARTITION OF partition_events\nFOR VALUES FROM ('2026-02-01') TO ('2026-03-01');",
        "The upper boundary is exclusive, so February 1 belongs to the second partition.",
      ),
      lab(
        "PostgreSQL · after child fixtures",
        "INSERT INTO partition_events VALUES (1, '2026-01-31', 10), (2, '2026-02-01', 20);\nSELECT tableoid::regclass AS stored_in, id, happened FROM partition_events ORDER BY happened;",
        "The January row routes to events_2026_01 and the February row to events_2026_02.",
      ),
      lab(
        "PostgreSQL · pruning check",
        "EXPLAIN SELECT * FROM partition_events\nWHERE happened >= DATE '2026-02-01' AND happened < DATE '2026-03-01';",
        "With partition pruning enabled, the January partition need not be scanned for this bounded February query.",
      ),
      lab(
        "PostgreSQL · missing-boundary test",
        "BEGIN;\nINSERT INTO partition_events VALUES (3, '2026-03-01', 30);\n-- No March partition exists, so this insert fails.\nROLLBACK;",
        "Future partition coverage is an availability requirement. Add March deliberately before accepting March events.",
      ),
      lab(
        "PostgreSQL · partition inventory",
        "SELECT inhrelid::regclass AS child\nFROM pg_inherits WHERE inhparent = 'partition_events'::regclass;",
        "Compare the child inventory and date bounds against retention and upcoming ingestion windows.",
      ),
    ],
  ),
};
