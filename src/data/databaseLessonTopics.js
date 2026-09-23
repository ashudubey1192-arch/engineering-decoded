// Topic order matches the existing database course outlines; URLs remain stable.
export const databaseLessonTopics = [
  {
    concept:
      "Start with the workload: what is stored, which questions must be answered, and what must remain true after a failure. A database choice is useful only when its data model and guarantees fit those requirements.",
    detail:
      "Separate the source of truth from derived views. A search index or cache can often be rebuilt, while an accepted order must survive a restart. Write down the acceptable delay before another reader sees a change.",
    task: "Classify an order record, a cached order total, and a search embedding as authoritative or derived. Which can be rebuilt?",
    answer:
      "The order record is authoritative. The cached total and embedding are derived if their inputs and transformation versions are retained. Rebuilding them takes time, so recovery targets still matter.",
    mistake:
      "Choosing an engine from a feature checklist before defining access patterns and correctness requirements.",
    trace:
      "Order accepted → authoritative record committed → derived views updated → customer reads result",
  },
  {
    concept:
      "A request passes through a client, a coordinator or query processor, an execution path, and storage. Acknowledgment, durable persistence, replication, and visibility are different milestones.",
    detail:
      "Trace both a write and a read. Identify where routing occurs, which component owns data, and whether a response depends on memory, disk, or another node. This explains where latency and failures enter the system.",
    task: "A client times out immediately after sending a write. Does that prove the write failed?",
    answer:
      "No. The server may have committed the write while the response was lost. Reconcile using a stable operation identifier or an idempotent retry instead of creating a second logical operation.",
    mistake: "Treating a timeout as proof that no state changed.",
    trace: "Client → coordinator → storage/log → replicas → acknowledgment",
  },
  {
    concept:
      "A reproducible learning environment records the server release, client version, connection endpoint, and durable storage location. Installation is complete only after a write, read, and restart succeed.",
    detail:
      "Use an isolated disposable database and nonproduction credentials. Check the selected product's installation instructions for your operating system; verify compatibility before copying SDK examples. Concept courses use a concrete engine as a laboratory rather than installing the concept itself.",
    task: "Design a smoke test that distinguishes an in-memory session from persistent storage.",
    answer:
      "Create one uniquely identified record, read it, restart the process without deleting its storage, and read it again from a new client. Confirm the same endpoint and database are used after restart.",
    mistake:
      "Testing only connectivity, or confusing a temporary container filesystem with a persistent volume.",
    trace: "Install chosen release → connect → write fixture → restart → verify fixture",
  },
  {
    concept:
      "A logical data model defines entities, attributes, identifiers, and relationships. A physical model decides how those values are laid out and accessed. The two need not mirror each other.",
    detail:
      "Normalization reduces update anomalies; denormalization can reduce joins and network reads but creates synchronization work. Model one real request and one update before deciding whether to duplicate data.",
    task: "An order stores the buyer's current name and the delivery address used at purchase. Which should be a historical snapshot?",
    answer:
      "The delivery address used at purchase should remain a snapshot even if the buyer later moves. A reference to the buyer can supply current profile data. Historical and current facts have different update rules.",
    mistake:
      "Copying object shapes directly from an API without defining ownership and update semantics.",
    trace: "Business facts → logical entities → physical records → access paths",
  },
  {
    concept:
      "Use tools to inspect evidence: request latency, execution plans, storage growth, replication status, and error rates. A graphical dashboard and a command-line client should describe the same underlying state.",
    detail:
      "Capture a baseline before tuning. Keep reproducible fixtures and scripts under version control, but inject credentials at runtime. Redact record contents and tokens from logs; record query shapes and correlation IDs instead.",
    task: "A query becomes slower after a release. Which three artifacts would make the investigation reproducible?",
    answer:
      "Retain the query and parameters or representative sanitized values, an execution plan or request trace, and the data-size/configuration baseline. Compare distributions and concurrency, not just one duration.",
    mistake: "Changing settings before recording the original workload and measurements.",
    trace: "Fixture → query → plan/trace → latency distribution → repeatable report",
  },
  {
    concept:
      "Design from a short access-pattern inventory. For every operation, list the lookup key, required output, cardinality, ordering, and expected volume. A model is successful when important requests remain bounded as data grows.",
    detail:
      "Use a concrete scenario such as recent orders for one tenant. A full scan that works on ten rows can fail on ten million. Estimate both the typical tenant and the largest tenant before fixing the record boundary.",
    task: "Specify an access pattern for the latest 20 orders belonging to one tenant.",
    answer:
      "Input is tenant ID and an optional cursor; output is 20 order summaries ordered by created time with ID as a tie-breaker. Measure the largest tenant and choose an access path that avoids scanning unrelated tenants.",
    mistake: "Designing tables or collections without enumerating the queries they must serve.",
    trace: "Tenant + cursor → bounded lookup → ordered 20-record page",
  },
  {
    concept:
      "An identifier must remain stable for the lifetime of the object. Distinguish identity, uniqueness scope, and routing: an order ID can be globally unique while its tenant ID determines where it is stored.",
    detail:
      "Natural keys carry business meaning but can change. Surrogate keys decouple identity from that meaning. Idempotency keys identify operations rather than objects and need an explicit retention period and conflict policy.",
    task: "Two tenants both create order 42. When is that valid, and what key should an API accept?",
    answer:
      "It is valid if uniqueness is tenant-scoped. The API must carry tenant plus order ID, or a globally unique ID resolved through authorization. An order ID alone must not accidentally address another tenant's record.",
    mistake:
      "Assuming an identifier provides authorization, or dropping part of a composite identity.",
    trace: "tenant=A, order=42 ≠ tenant=B, order=42",
  },
  {
    concept:
      "Relationships encode ownership and cardinality. Constraints make invalid states harder to create, but only within the boundaries the engine actually enforces. An application-side check alone can race with another writer.",
    detail:
      "Choose explicit delete behavior: reject deletion, cascade owned records, or preserve historical data. In systems without foreign keys, use durable events, validation jobs, and repair procedures to handle orphaned references.",
    task: "Two clients check that a username is unused and then both insert it. How can uniqueness be enforced?",
    answer:
      "Use an atomic uniqueness constraint where supported. Otherwise coordinate ownership through a single authoritative key or conditional operation. A read-before-write check by itself cannot prevent the race.",
    mistake: "Treating a successful preflight read as equivalent to an atomic constraint.",
    trace: "Client A checks free; client B checks free → atomic arbiter accepts one",
  },
  {
    concept:
      "A schema is a contract for types, required fields, valid ranges, and interpretation. Schemaless storage still has a schema in the application; it merely shifts enforcement and migration responsibility.",
    detail:
      "Represent currency with an exact decimal or integer minor units and an explicit currency code. Specify timestamp timezone semantics. Distinguish a missing value, an explicit null, and an empty value in validation and queries.",
    task: "Why can storing money as a floating-point number produce inconsistent totals?",
    answer:
      "Many decimal fractions have no exact binary floating-point representation. Use exact decimal arithmetic or integer minor units with a currency-specific scale and explicit rounding rules.",
    mistake:
      "Leaving units, timezone, or null semantics implicit in field names and application code.",
    trace: "Input → type validation → range validation → invariant checks → stored record",
  },
  {
    concept:
      "Evolve a model with expand, migrate, and contract. Add a compatible representation, backfill existing records, move readers and writers, then remove the old representation after verification.",
    detail:
      "Mixed application versions may run simultaneously. Make the backfill restartable and define precedence when old and new fields disagree. Compare counts and sampled values before removing compatibility code.",
    task: "Plan a safe rename from full_name to display_name while old application instances remain active.",
    answer:
      "Introduce display_name, keep compatible reads and writes, backfill with checkpoints, switch all consumers, verify consistency, and only then stop maintaining full_name. A direct rename can break old binaries.",
    mistake: "Deploying a destructive schema change before every reader and writer is compatible.",
    trace: "Expand → compatible deployment → backfill → verify → contract",
  },
  {
    concept:
      "A write should state its precondition and intended effect. Prefer atomic mutations over reading a value, changing it in memory, and overwriting the whole record. Stable IDs make retry behavior easier to reason about.",
    detail:
      "Check affected-row counts or operation results. An update that matched nothing is not necessarily success. For optimistic concurrency, include the expected version and increment it only when the precondition holds.",
    task: "A record has version 7. Two clients submit edits based on version 7. What should happen?",
    answer:
      "An atomic conditional write accepts one edit and advances the version to 8. The other matches no record and must reload or surface a conflict. Silently overwriting loses an accepted edit.",
    mistake:
      "Retrying a non-idempotent increment after an ambiguous response without deduplication.",
    trace: "UPDATE if version=7 → one winner → version=8 → stale writer rejected",
  },
  {
    concept:
      "A query defines both the records selected and the fields returned. Bound the result size, use parameters for untrusted values, and make ordering explicit when pagination or reproducible output matters.",
    detail:
      "A query that returns ten records may still examine millions. Inspect the work performed, not only the response size. Keep authorization predicates in the executed query rather than filtering sensitive records after retrieval.",
    task: "Why is LIMIT 20 insufficient to guarantee a fast or secure tenant query?",
    answer:
      "The engine may scan many records before finding 20 matches, and missing tenant restrictions can expose other tenants' records. A suitable access path and an enforced tenant predicate are both required.",
    mistake: "Equating a small result set with a small scan or safe access control.",
    trace: "Authorized scope → predicate → access path → projection → bounded result",
  },
  {
    concept:
      "Filtering removes candidates; sorting orders them. An index can sometimes support both when its key order matches equality predicates followed by the requested ordering. Null ordering and collation may affect results.",
    detail:
      "Use a unique tie-breaker for stable pagination. Offset pagination often does more work as offsets grow; keyset pagination continues after the last observed ordered key, but needs a policy for concurrent inserts and deletes.",
    task: "Five orders share the same created_at value. What cursor fields prevent ambiguous page boundaries?",
    answer:
      "Use created_at plus a unique order ID, preserving both sort directions in the cursor comparison. A timestamp alone cannot distinguish the five orders and can skip or repeat records.",
    mistake: "Paginating on a nonunique ordering key without a deterministic tie-breaker.",
    trace: "tenant=A → order by (created_at, id) → continue after last pair",
  },
  {
    concept:
      "Aggregation reduces many records into grouped measures such as count, sum, minimum, or average. Define the grain of the input and output before combining records so that joins or duplicates do not inflate totals.",
    detail:
      "An average of averages is wrong when group sizes differ. Carry sums and counts through partial aggregation. Late data and corrections require a policy for recomputing materialized summaries.",
    task: "One group averages 10 across 2 records; another averages 20 across 8. What is the combined average?",
    answer:
      "The total is 2×10 + 8×20 = 180 across 10 records, so the average is 18. Averaging 10 and 20 directly gives 15 and weights the small group too heavily.",
    mistake:
      "Combining summaries without retaining their denominators or double-counting joined rows.",
    trace: "Group A: sum=20,count=2; B: sum=160,count=8 → 180/10=18",
  },
  {
    concept:
      "Bulk operations amortize network and commit overhead, but larger batches increase memory use, lock duration, and retry cost. A batch is not automatically an atomic transaction.",
    detail:
      "Choose bounded batches, stable record IDs, and a checkpoint written after confirmed progress. Separate invalid records from transient failures. Throttle ingestion when replication lag or foreground latency increases.",
    task: "A 1,000-record import fails after some records are accepted. How can it restart without duplicates?",
    answer:
      "Use deterministic IDs or deduplication keys, inspect per-record results, and retry only unresolved operations where possible. A checkpoint alone does not resolve a partially accepted batch unless replay is idempotent.",
    mistake: "Retrying an entire partially successful batch with new IDs.",
    trace: "Read batch → validate → write → inspect results → checkpoint → next batch",
  },
  {
    concept:
      "A query plan explains how work is performed: access paths, filtering, joins, sorting, and aggregation. Compare estimated and actual row counts to find selectivity mistakes before changing indexes.",
    detail:
      "Execution-based plan tools can actually run the statement. Use a safe read workload or an isolated fixture. Measure scanned records, memory, network exchange, and repeated loops rather than declaring every scan a failure.",
    task: "A planner predicts 10 rows but execution finds 100,000. What should you investigate first?",
    answer:
      "Check statistics freshness, skew, correlated predicates, and representative parameters. A wrong cardinality estimate can drive a poor join or access choice even when an appropriate index exists.",
    mistake: "Assuming an index scan is always faster than a sequential scan for broad queries.",
    trace: "Estimated rows=10 → actual rows=100000 → inspect statistics and skew",
  },
  {
    concept:
      "Indexes trade write work and storage for faster access. Select index keys from actual predicates and ordering; measure selectivity, index size, and maintenance cost under the write workload.",
    detail:
      "Composite key order matters. Equality on tenant followed by a time range often benefits from tenant first and time second. An index that contains all required fields may avoid record fetches, depending on the engine.",
    task: "For WHERE tenant_id = ? ORDER BY created_at, which composite ordering is a useful starting point?",
    answer:
      "Start by evaluating (tenant_id, created_at), adding a unique tie-breaker for pagination. Validate the actual plan and workload; this is a hypothesis, not a guarantee for every engine or query.",
    mistake:
      "Adding one index per column without considering compound access or write amplification.",
    trace: "Predicate + ordering → candidate index → measured plan → write-cost check",
  },
  {
    concept:
      "Caching reuses a previous result or a cheaper representation. Define what the key means, how long a value is acceptable, and which event invalidates it. A cache introduces a second copy with its own failure modes.",
    detail:
      "Include tenant and representation version in keys. Bound memory and protect the source against a stampede when many entries expire together. A low hit ratio may indicate poor locality rather than insufficient cache capacity.",
    task: "A cached balance has a 60-second TTL. Does the TTL make it safe for authorizing a payment?",
    answer:
      "No. The value may already be stale, and a concurrent debit can occur immediately after reading it. Authorization must use an authoritative atomic check; the cache may be suitable for a labeled display.",
    mistake: "Using cached values to enforce invariants that require current authoritative state.",
    trace: "Cache hit → serve within staleness budget; miss → source → populate",
  },
  {
    concept:
      "Partitioning divides a dataset into independently manageable subsets. Choose a key that supports pruning while avoiding uneven load. More partitions do not automatically provide more independent machines or higher throughput.",
    detail:
      "Time ranges simplify retention, but current writes can concentrate in the newest partition. Hashing spreads load but weakens range locality. Measure the largest partition and hottest key rather than only averages.",
    task: "One tenant generates half of all requests. Will hashing tenant IDs alone guarantee balanced load?",
    answer:
      "No. That tenant still maps to one partition or shard. Consider subpartitioning, dedicated placement, or a different access design, accounting for the extra fan-out required to read the tenant's data.",
    mistake:
      "Estimating scale from evenly distributed sample data when production traffic is skewed.",
    trace: "Partition key → placement → per-partition load → skew check",
  },
  {
    concept:
      "Tune one measured bottleneck at a time. Latency includes queueing, execution, network transfer, and retries. Throughput improvements can make tail latency worse if concurrency exceeds available capacity.",
    detail:
      "Keep workload, data distribution, and hardware constant during comparisons. Record p50, p95, and p99 latency with errors and resource utilization. Warm-cache and cold-cache runs answer different questions.",
    task: "A change doubles throughput but moves p99 latency from 100 ms to 2 s. Is it an improvement?",
    answer:
      "Only if the workload's latency objective permits it. Examine queueing and saturation, then control concurrency or add capacity. Average latency alone hides the user-visible regression.",
    mistake:
      "Optimizing a microbenchmark while ignoring tail latency, errors, and production skew.",
    trace: "Baseline → hypothesis → one change → comparable load → accept or revert",
  },
  {
    concept:
      "Atomicity groups effects; isolation controls interference; durability describes survival after acknowledgment. Consistency must be stated precisely: business invariants, read visibility, and replica convergence are separate concerns.",
    detail:
      "Keep invariants within a supported transaction boundary whenever possible. Across systems, use durable events and reconciliation; do not assume two individually atomic writes form one atomic workflow.",
    task: "An order commits but publishing its event fails. How can the event eventually be delivered reliably?",
    answer:
      "Write an outbox record in the same transaction as the order, then publish it asynchronously with retries. Consumers deduplicate by event ID. Delivery may repeat, but the durable intent is not lost.",
    mistake:
      "Assuming a transaction covers an external API call or another database automatically.",
    trace: "Order + outbox commit together → publisher retries → consumer deduplicates",
  },
  {
    concept:
      "Concurrency control prevents incompatible operations from silently corrupting state. Locks serialize access; optimistic checks detect conflicts; multiversion reads allow snapshots while writes continue.",
    detail:
      "Isolation levels permit different anomalies. Read skew, lost updates, and write skew need explicit tests. Keep transactions short, acquire locks in a consistent order, and retry the complete unit of work after a retryable abort.",
    task: "Two doctors each see the other on call and both go off call. Why might row version checks alone fail?",
    answer:
      "They update different rows, so neither row version necessarily conflicts. The invariant spans both records. Use a suitable serializable transaction or lock a shared guard record and recheck the invariant.",
    mistake: "Protecting individual rows while ignoring an invariant spanning multiple records.",
    trace: "Read shared invariant → coordinate conflicting decision → commit or retry",
  },
  {
    concept:
      "Replication keeps copies of data for availability, locality, or read capacity. Synchronous and asynchronous acknowledgment policies trade write latency against possible loss and freshness.",
    detail:
      "A replica can be reachable yet stale. Failover requires selecting an eligible new authority and fencing the old one. Copying data alone does not solve split-brain or route clients safely.",
    task: "A primary acknowledges a write before its asynchronous replica receives it and then fails. Can the promoted replica lose that write?",
    answer:
      "Yes. The acknowledged change may not exist on the replica. Choose durability and acknowledgment policies that match the loss budget, and measure replication lag rather than assuming it is zero.",
    mistake:
      "Treating a replica as a backup or assuming replication always provides read-after-write visibility.",
    trace: "Primary commit → asynchronous shipping → replica apply → visibility",
  },
  {
    concept:
      "Recovery needs a known-good copy, the means to replay required changes, and a tested restore procedure. RPO is acceptable data loss; RTO is acceptable time to restore service.",
    detail:
      "Replicas copy accidental deletes too. Keep backups outside the same failure boundary and test restoration into an isolated environment. Verify data, keys, permissions, and application behavior, not just whether a backup job reported success.",
    task: "Backups run nightly and no change log is retained. Can you promise an RPO of five minutes?",
    answer:
      "No. A failure just before the next backup can lose nearly a day. Meeting five minutes requires a suitable incremental/log strategy and verified recovery coverage, not merely frequent monitoring.",
    mistake: "Reporting successful backup creation as proof of recoverability.",
    trace: "Backup + retained changes → isolated restore → consistency checks → timed recovery",
  },
  {
    concept:
      "Classify errors as permanent, transient, or ambiguous before retrying. Backoff with jitter limits synchronized retry storms, while deadlines stop a failed dependency from consuming all request capacity.",
    detail:
      "A retry budget must fit inside the end-to-end deadline. Use stable operation IDs when outcomes are uncertain. Fault tests should include dropped responses, unavailable nodes, exhausted storage, and recovery after a partial batch.",
    task: "A write repeatedly fails validation. Will exponential backoff repair it?",
    answer:
      "No. Validation errors require correcting the request. Backoff helps temporary overload or connectivity failures; ambiguous outcomes additionally need reconciliation or idempotency.",
    mistake: "Retrying every error indefinitely and multiplying load on a failing service.",
    trace: "Error → classify → permanent: fix / transient: bounded retry / ambiguous: reconcile",
  },
  {
    concept:
      "Authentication establishes identity; authorization controls permitted actions and records. Apply least privilege to runtime clients, migration tools, and backup operators as separate roles.",
    detail:
      "Parameterize values, protect network connections, rotate secrets, and test cross-tenant denial. Filters supplied by the client are not an authorization boundary. Backups and diagnostic logs require the same data-access care as live records.",
    task: "An API accepts tenant_id from the request body. Why is adding it to a query insufficient authorization?",
    answer:
      "The caller can select another tenant. Derive or validate tenant scope from authenticated membership on the server, then enforce it in every data access path and test denial cases.",
    mistake: "Giving application credentials administrative privileges for convenience.",
    trace: "Authenticated identity → server-owned scope → least-privilege operation → audit",
  },
  {
    concept:
      "Monitor user-facing symptoms alongside resource causes. Latency, errors, traffic, saturation, replication lag, and storage growth reveal different classes of failure.",
    detail:
      "Alert on a sustained breach of an objective with enough context to act. High CPU can be healthy productive work; low CPU can coexist with stalled I/O. Correlate deployments and background jobs with changes in behavior.",
    task: "Database CPU is low but requests time out. Name two plausible causes and evidence to inspect.",
    answer:
      "Lock waits and exhausted connection pools can block requests without consuming much CPU. Inspect wait events, active/queued connections, transaction age, and end-to-end traces; also examine I/O and network waits.",
    mistake: "Using host CPU as the sole health signal.",
    trace: "User symptom → request trace → wait/resource signal → actionable alert",
  },
  {
    concept:
      "Capacity planning accounts for data, indexes, replicas, logs, temporary work, and failure headroom. Estimate growth and peak traffic separately because bytes and request rates stress different resources.",
    detail:
      "A cluster sized only for normal operation may overload after losing a node. Test with one failure domain unavailable and with maintenance running. Include rebuild duration and data-transfer bandwidth in the plan.",
    task: "100 GB of primary data has 50 GB of indexes and three full copies. Is 300 GB enough storage?",
    answer:
      "No. Data plus indexes already require roughly 450 GB across the three copies, before logs, compaction/sort space, backups, and headroom. Actual layouts and compression must be measured.",
    mistake: "Budgeting only raw payload bytes or average traffic.",
    trace: "Payload + indexes + logs + temporary work → replicas → failure headroom",
  },
  {
    concept:
      "A migration changes the running system while preserving correctness. Establish a snapshot boundary, capture subsequent changes, reconcile source and target, and make cutover reversible until verification is complete.",
    detail:
      "Compare semantics as well as counts: collation, timezones, decimal behavior, nulls, and consistency may differ. Dual writes can diverge unless there is a durable retry and reconciliation mechanism.",
    task: "Source and destination both contain one million records. Is migration correctness proven?",
    answer:
      "No. They can contain different keys or values with the same count. Compare key ranges, checksums or sampled canonical records, constraints, and business query results; verify changes made during the copy are included.",
    mistake:
      "Cutting over after a bulk copy without accounting for writes that occurred during copying.",
    trace: "Snapshot → change capture → reconcile → cutover → observe → retire old path",
  },
  {
    concept:
      "Operational readiness means another engineer can diagnose and recover the system using explicit procedures. Record ownership, supported versions, objectives, maintenance steps, and rollback criteria.",
    detail:
      "Practice the runbook with a realistic fixture: load data, generate traffic, introduce a failure, restore service, and compare records. Record measured recovery time and any manual assumptions discovered during the exercise.",
    task: "What evidence would justify calling a database deployment production-ready?",
    answer:
      "A representative load test meets objectives, access controls deny forbidden operations, restoration and failover are rehearsed, alerts reach an owner, and deployment/migration rollback is tested. A green health endpoint alone is insufficient.",
    mistake: "Treating installation completion as operational readiness.",
    trace: "Load test → failure drill → restore verification → runbook review → release decision",
  },
];
