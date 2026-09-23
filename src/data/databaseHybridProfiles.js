import { profile, lab } from "./databaseLessonProfiles.js";

const designLabs = (system, model, operation, performance, reliability, production) => [
  lab(
    `${system} · architecture exercise`,
    "Identify the authoritative write path.\nDraw each derived read path.\nMark asynchronous boundaries and ownership.",
    "A useful diagram labels acknowledgment and visibility separately. " + model,
  ),
  lab(
    `${system} · modeling exercise`,
    model,
    "List the owner, stable key, version, and deletion behavior for each representation. One fact must not have two unexplained authorities.",
  ),
  lab(
    `${system} · request trace`,
    operation,
    "Trace the operation through every representation and record the point at which each reader can observe it.",
  ),
  lab(
    `${system} · benchmark plan`,
    performance,
    "Compare p99 transaction latency, analytical latency, freshness, and resource usage together. Record dataset size and concurrent load.",
  ),
  lab(
    `${system} · failure schedule`,
    reliability,
    "State which operations stop, which remain available, and how accepted changes are reconciled after recovery.",
  ),
  lab(
    `${system} · release checklist`,
    production,
    "Attach measured results and an owner to each check. A design proposal alone is not evidence that recovery or isolation works.",
  ),
];

export const databaseHybridProfiles = {
  "hybrid-database-fundamentals": profile(
    "https://docs.cockroachlabs.com/docs/stable/architecture/overview",
    "Hybrid database is an architectural category, not a universal engine or query language. Follow an order service with an authoritative relational store and a derived analytical/search view.",
    `
A hybrid design combines capabilities or storage paths for different workloads. Define the combination explicitly rather than assuming the label guarantees strong consistency everywhere.
Map the write authority, change stream, transformations, and read stores. Every asynchronous edge creates a possible freshness gap and recovery responsibility.
There is no hybrid-database installer. Prepare a relational lab and a derived-view worker, or choose a documented integrated engine with explicit guarantees.
The authoritative model and read model can differ. An order row can feed a denormalized dashboard without making the dashboard authoritative for payments.
Use source query tools and pipeline diagnostics together. A fast destination query can hide a stalled change stream and hours of missing updates.
Assign ownership of customers, orders, and derived summaries. Duplicate only facts with a specified propagation, deletion, and reconciliation policy.
Carry stable source IDs and event versions into every derived record. A destination-generated ID makes replay and deletion unnecessarily difficult.
Enforce business references at the source and validate derived links asynchronously. A cross-store reference is not protected by a local foreign key.
Define canonical types, timestamp units, and event schemas. A decimal converted to binary floating point can change a dashboard's financial totals.
Version events and readers before changing the source schema. Keep replay compatibility with old retained events during backfills.
Write once to an authoritative transaction and record durable propagation intent. Uncoordinated dual writes can leave one store updated and the other stale.
Route operational reads to the authority and analytical reads to derived stores according to freshness requirements. Make stale-read behavior explicit.
Apply authorization and tenant filters in every read path. A filtered source feed does not automatically secure a broadly accessible destination.
Build rollups at a documented grain with replay-safe event handling. Corrections and deletes must reverse earlier contributions or trigger recomputation.
Backfill from a snapshot while capturing subsequent changes. Coordinate the snapshot/change-stream boundary so records are neither lost nor double-applied.
Explain plans in each engine and trace end-to-end latency across the pipeline. The slowest stage may be transformation rather than query execution.
Choose indexes independently for transactional lookups and analytical scans. Copying source indexes into the destination rarely matches its access patterns.
A derived store behaves like a maintained read model, not necessarily an expendable cache. Recovery cost and freshness objectives determine retention and rebuild strategy.
Source partitions and destination partitions need not align. Preserve routing metadata and account for skew and repartitioning traffic at transformation boundaries.
Benchmark source writes while backfills and analytics run. Shared network or storage can couple workloads even when database processes are separate.
Local atomicity does not create a global transaction across stores. Use outbox/change capture, idempotent consumption, and reconciliation for eventual propagation.
Resolve out-of-order events with source versions or ordered streams. Arrival time at the destination is not necessarily the correct business ordering.
Replicas and derived views serve different purposes. A transformed view may omit information needed to replace the authoritative source.
Back up authoritative data plus the information needed to rebuild views. Test replay duration against the allowed recovery time.
Pause or label stale dashboards when lag exceeds the contract. Keep durable retry queues and route invalid events to an owned repair path.
Apply least privilege to source readers, destination writers, and dashboard readers separately. Deletions and access revocations must propagate to derived copies.
Monitor stream position, end-to-end freshness, dead-letter volume, divergence, and transaction latency. Destination uptime alone is an incomplete health check.
Capacity includes source logs, retained events, destination indexes, and catch-up throughput. Recovery must process faster than new events arrive.
Run old and new projections side by side and compare canonical results before cutover. Keep source offsets and rollback rules explicit.
Document the source of truth, replay contract, freshness objective, and reconciliation owner. Test a missing event and an out-of-order update deliberately.
`,
    designLabs(
      "Hybrid architecture",
      "orders: authoritative rows\norder_events: durable propagation intent\norders_dashboard: derived by tenant and day",
      "commit order 42 + event e42 → worker applies e42 → dashboard visible\nworker sees e42 again → deduplicates by event ID",
      "Run order writes at fixed rate.\nStart a full dashboard backfill.\nMeasure write p99 and destination freshness before/during/after.",
      "Stop worker after source commit but before destination write.\nRestart from durable checkpoint.\nVerify order 42 appears exactly once in the logical summary.",
      "Restore source; replay events; compare tenant totals.\nRemove a tenant; verify deletion in all derived stores.\nTime catch-up under continuing writes.",
    ),
  ),
  "distributed-sql": profile(
    "https://docs.cockroachlabs.com/docs/stable/architecture/overview",
    "Study a range-sharded, consensus-replicated SQL architecture using CockroachDB as a concrete reference. Vendor SQL compatibility, isolation, and operational controls must be checked individually.",
    `
Distributed SQL combines a relational interface with distributed storage and transactions. SQL compatibility does not remove network coordination or locality costs.
A SQL layer routes work to replicated ranges or tablets. Consensus orders changes within replication groups while transactions coordinate related keys.
Use the chosen vendor's supported local tutorial cluster. A single-node mode teaches syntax but cannot validate quorum or regional-failure guarantees.
Relational tables are mapped to distributed key ranges. Primary and secondary index keys affect locality and the distribution of write traffic.
Use SQL EXPLAIN together with node, range, and network diagnostics. A local-looking join may exchange data across machines or regions.
Co-locate strongly related tenant data where the product supports it. Cross-region business invariants incur coordination that cannot be optimized away by naming.
Monotonic primary keys can concentrate inserts at one end of a keyspace in some designs. Evaluate hashing or distributed IDs with locality trade-offs.
Foreign keys may require remote checks and distributed coordination. Preserve correctness while measuring the write path they introduce.
Confirm supported types, sequences, computed columns, and constraints against the selected engine. PostgreSQL-wire compatibility is not full PostgreSQL feature equivalence.
Distributed schema changes have coordination and backfill phases. Check job status and compatibility before treating DDL completion as fully materialized state.
Use stable request IDs and the driver's documented transaction retry pattern. Retrying only the final statement can break a multi-statement invariant.
Choose selective queries and avoid unnecessary cross-range joins. Understand whether explicit follower or stale reads relax freshness.
Composite indexes should match tenant filters and ordered access. Distributed offset pagination can amplify work and network transfer.
Push partial aggregation close to data when supported. Global grouping still needs exchange or reduction and may compete with transactional traffic.
Bulk ingestion has product-specific paths and limits. Rate-limit backfills and watch range rebalancing, replication, and foreground request latency.
Inspect distributed plan stages, scanned keys, network transfer, and contention. A good local access path can still have high inter-region latency.
Each secondary index is another distributed structure to maintain. Covering indexes can reduce remote lookups but increase write and storage amplification.
Follower reads and result caches are distinct. A follower read's timestamp policy must satisfy the user's freshness and session guarantees.
Range splitting and replica placement distribute work but cannot split a single hot logical key arbitrarily. Locality policies must match failure objectives.
Measure geographically representative round trips and retry rates. A benchmark with all clients beside one node hides regional coordination costs.
Consensus within a range and atomicity across ranges are different mechanisms. Determine the engine's default isolation and how retryable conflicts are reported.
Serializable conflict detection can abort transactions. Short transactions, stable access order, and bounded retries improve useful work under contention.
Quorum replication tolerates only specified failures. Losing quorum intentionally stops some writes to preserve safety instead of accepting conflicting histories.
Use consistent distributed backups and test restoring required timestamps and metadata. Replica copies are not protection from accidental logical deletion.
Handle node loss, regional partitions, leader movement, and ambiguous commit results. A stable operation key is essential for safe reconciliation.
Secure node-to-node traffic, client roles, and tenant access. Administrative topology privileges should not be available to the application runtime.
Monitor quorum health, replica placement, unavailable ranges, transaction retries, and regional latency. Node uptime is not equivalent to data availability.
Include replica factor, index count, network bandwidth, and failover headroom. Rebalancing and recovery consume the same resources as foreground requests.
Validate SQL features, isolation behavior, and driver retry integration when migrating. Compare latency under realistic distribution before committing to cutover.
Rehearse one-node and one-region failures according to the intended topology. Document data placement, loss budget, and transaction retry policy.
`,
    designLabs(
      "Distributed SQL",
      "tenant A rows → range 1 replicated on nodes 1/2/3\ntenant B rows → range 2 replicated on nodes 2/3/4",
      "transfer touches ranges 1 and 2\nread balances → validate invariant → coordinate commit\nretryable abort → retry complete transfer with same business ID",
      "Compare a same-region lookup with a cross-region transaction.\nRecord network round trips, p99 latency, and conflict retries.",
      "Three voting replicas; quorum is two.\nOne unavailable replica: quorum may remain.\nTwo unavailable replicas: writes cannot safely proceed for that group.",
      "Verify placement matches failure-domain policy.\nRestore backup in an isolated cluster.\nCheck driver retries and ambiguous-outcome reconciliation.",
    ),
  ),
  "multi-model-databases": profile(
    "https://docs.arango.ai/arangodb/stable/concepts/data-models/",
    "Explore documents, graphs, and key lookups in one database through a product-neutral catalog design. ArangoDB documentation is a concrete reference; examples below are model and query-design exercises, not portable commands.",
    `
Multi-model databases expose more than one logical model. Shared infrastructure may simplify operations, but capabilities and transaction scope differ across products.
Identify which models share storage, indexes, query execution, and transaction machinery. One endpoint does not prove one atomic boundary for every API.
Choose a specific engine and supported local tutorial environment. Record which document, graph, and key-value capabilities the selected edition provides.
Documents represent entities, edges represent relationships, and keyed access retrieves known identities. Use each model where it makes a query simpler.
Use the selected engine's query profiler and graph tools. Separate traversal expansion cost from document lookup and serialization time.
Store products as documents and recommendations as edges. Do not duplicate the same mutable property on every edge without an update policy.
Use stable vertex IDs and explicit edge identity. External IDs need uniqueness enforcement independent of internal storage handles.
Graph relationships may have endpoint rules specific to the product. Decide what happens to edges when a vertex is deleted and test orphan cleanup.
Validate document shapes and edge attributes such as weight and relationship type. A graph is not automatically semantically valid because its endpoints exist.
Version vertex and edge schemas compatibly. Old traversals must handle new relationship types without unexpectedly expanding their search space.
Update entity properties and related edges inside the supported transaction scope. Cross-shard graph mutations may require additional coordination or restrictions.
Use direct lookup when the ID is known and traversal when relationships answer the question. A graph traversal is wasteful for a simple key fetch.
Apply tenant and edge-type filters early. Bound traversal depth and define uniqueness semantics to avoid cycles producing repeated or explosive results.
Count entities or relationships deliberately. Traversal paths can reach the same vertex multiple times, so path count is not distinct entity count.
Import vertices before dependent edges or stage both with validation. Stable IDs allow repair and replay without multiplying edges.
Profile frontier sizes, index use, and visited edges. A traversal with depth four can still be enormous when each vertex has many neighbors.
Document indexes and edge adjacency structures solve different access needs. Index a selective starting predicate before traversing a large graph.
Cache bounded query results with invalidation for both property and edge changes. A unchanged vertex can have a changed neighborhood.
Graph cuts create cross-partition traffic. Co-locating related vertices helps some traversals but may concentrate high-degree communities.
Measure high-degree vertices and realistic traversal depth. Uniform synthetic graphs can conceal the few hubs that dominate production cost.
Check whether document and graph mutations share atomicity in the chosen topology. Do not infer global transactions from a common API surface.
Concurrent edge additions need deduplication rules; concurrent vertex deletion needs an ownership/cleanup policy. A preflight existence check can race.
Replication behavior belongs to the engine and topology, not the graph abstraction. Define visibility for newly written edges and properties.
Back up all participating collections and metadata consistently. Restoring vertices without edges can silently change business queries despite valid documents.
Retry imports and mutations using stable vertex/edge IDs. Validate partially completed subgraphs before exposing them to production traversals.
Enforce authorization at traversal entry points and across traversed relationships. An authorized starting vertex does not authorize every reachable vertex.
Monitor traversal expansion, query timeouts, orphan edges, and model-specific errors. Aggregate query counts cannot reveal an explosive graph workload.
Capacity depends on edge count and degree distribution as well as document size. Indexes and replicated adjacency data may dominate storage.
Preserve identifiers and relationship direction during migration. Compare representative traversals and distinct-vertex results, not just collection counts.
Document model boundaries, maximum traversal depth, and integrity checks. Include high-degree and cyclic graphs in performance and authorization tests.
`,
    designLabs(
      "Multi-model catalog",
      "product document: {id: p1, tenant: t1, name: Camera}\nproduct document: {id: p2, tenant: t1, name: Lens}\nedge: p1 --compatible_with--> p2",
      "find authorized product p1 → traverse compatible_with one hop\nfilter tenant t1 → return distinct product IDs",
      "Start with degree 10, then degree 1000.\nCompare depth 1 and depth 3.\nCount visited edges, distinct vertices, and duplicate paths.",
      "Delete product p2 during an edge import.\nVerify whether the engine rejects or permits the orphan.\nApply the documented repair or transaction policy.",
      "Restore vertices and edges together.\nCheck endpoint existence and cross-tenant traversal denial.\nVerify bounded traversal on cyclic graphs.",
    ),
  ),
  "htap-databases": profile(
    "https://docs.pingcap.com/tidb/stable/tiflash-overview/",
    "HTAP combines transactional processing and analytical queries. Use a row-oriented order path and a columnar analytical replica as the teaching architecture; TiDB/TiFlash is a concrete implementation to investigate.",
    `
HTAP aims to serve operational writes and analytical reads over related data. The key questions are freshness, isolation, resource interference, and operational complexity.
A row-oriented transaction path and a columnar analytical path optimize different work. Replication and snapshot coordination determine which version analytics can read.
There is no generic HTAP installation. Choose a documented deployment with its transactional and analytical components and verify their compatibility.
Row storage groups values by record; column storage groups values by attribute. Point updates and scans of a few columns therefore have different cost profiles.
Use separate transaction and analytical profiling tools plus replica-lag diagnostics. Verify actual execution placement instead of assuming every report uses the columnar path.
Keep normalized order facts authoritative and define analytical grain explicitly. A line-item report and an order-header report must avoid double-counting order totals.
Preserve source primary keys through analytical replication. Stable identity allows updates and deletes to replace the correct analytical representation.
Relational constraints are enforced on the transactional path according to engine capabilities. Analytical visibility must still respect a consistent supported snapshot.
Use types that retain exactness in both execution paths. Confirm decimal, timezone, and null behavior in columnar expressions and aggregates.
Schema changes must reach analytical replicas and queries compatibly. Track replica readiness during backfill and avoid silently querying incomplete columns.
Send business mutations through the supported transactional interface. Treat analytical storage as a maintained read representation unless the product explicitly documents otherwise.
Choose point lookups for operational requests and scans for reporting. Confirm optimizer routing and any supported hints against the selected release.
Push selective filters and column projection into analytical scans. A dashboard that requests every column defeats part of the columnar advantage.
Use partial aggregates and define report snapshot/freshness requirements. Late corrections must appear in the next valid snapshot rather than being permanently omitted.
Backfills can saturate replication and storage. Throttle imports and verify analytical readiness before exposing a newly loaded reporting window.
Inspect whether plans use row or column storage and where exchanges occur. Compare actual row counts, scanned columns, and distributed reduction costs.
Row-store indexes and columnar scan structures differ. Do not replicate every transactional index mechanically as an analytical optimization.
Dashboard result caches add another freshness boundary beyond analytical replication. Expose or measure the age of the data actually shown.
Align partition pruning with typical report time windows while preserving transaction distribution. Hot current data may dominate both paths at once.
Run analytics concurrently with writes and measure transaction p99. Dedicated analytical nodes can still share network, ingest, and storage bottlenecks.
Snapshot consistency and freshness are separate: a report can be internally consistent yet slightly old. Check the product's timestamp and replica-read guarantees.
Long analytical reads may retain historical versions or occupy resources. Monitor their effect on cleanup and transactional contention.
An analytical replica is not automatically a failover target for transactional writes. Availability roles depend on the implementation.
Back up the authoritative data and metadata and verify analytical rebuild duration. A source restore can succeed while reporting remains unavailable.
When analytical replicas lag or fail, define whether reports wait, fail, or use another supported path. Avoid unbounded fallback that overloads transactions.
Apply equivalent authorization and masking to operational and analytical access. Broad reporting roles can expose far more records than a point-query API.
Monitor transaction latency, analytical scan cost, freshness, replication backlog, and query placement. Track objectives for both workload classes.
Plan row copies, column copies, replication bandwidth, and rebuild headroom. Analytical storage savings do not erase the cost of keeping both representations.
Compare operational invariants and report results during migration. Test corrections, deletes, and schema changes reaching the analytical path before cutover.
Maintain mixed-workload benchmarks and replica-rebuild drills. Document the maximum acceptable report age and behavior when that bound is exceeded.
`,
    designLabs(
      "HTAP order analytics",
      "row path: order_id → complete order\ncolumn path: day, tenant, amount → grouped revenue\nshared logical identity: order_id",
      "commit order 42 → analytical replication → snapshot becomes readable\nreport uses supported snapshot → grouped total includes order 42",
      "Baseline point writes alone.\nAdd a seven-day revenue scan.\nMeasure write p99, report duration, replica lag, and resource saturation.",
      "Stop analytical replica.\nKeep permitted transactional work running.\nRestart and measure time to regain the reporting freshness objective.",
      "Verify consistent report snapshot and age.\nRestore source and rebuild analytical copy.\nTest that report fallback cannot exhaust transaction capacity.",
    ),
  ),
};
