// Each profile supplies a course-specific explanation for all 30 outline entries.
// Examples are deliberately labeled by dialect or as design exercises.
const profile = (reference, context, notes, labs) => ({
  reference,
  context,
  notes: notes
    .trim()
    .split("\n")
    .map((line) => line.trim()),
  labs,
});
const lab = (label, code, result) => ({ label, code, result });

export const databaseLessonProfiles = {
  sql: profile(
    "https://www.postgresql.org/docs/current/tutorial.html",
    "Use a small order ledger to learn relational queries. The SQL examples use a PostgreSQL-compatible subset; identity columns, pagination, and administrative commands vary by engine.",
    `
SQL describes the result you want; the optimizer chooses an execution strategy. Tables represent relations, and SELECT composes filtering, projection, joins, and aggregation.
A SQL client submits statements to an engine that parses, plans, executes, and persists changes. SQL itself is a language, not a database server.
Install PostgreSQL and its psql client for this course's lab. Create a disposable database, connect with a limited role, and run SELECT 1 before creating tables.
Rows contain typed columns. Primary keys identify rows; foreign keys connect them. NULL means unknown or absent and requires IS NULL rather than equality.
Use a SQL client for experiments, versioned migration files for schema changes, and EXPLAIN for access paths. Keep application values in bound parameters.
Separate customers, orders, and order_items when they have independent identities. Snapshot purchase prices on order items instead of looking up today's price.
Use an order primary key and a unique tenant-scoped external reference. A generated identifier does not replace business uniqueness constraints.
Foreign keys enforce valid references. Choose restrictive deletion for historical orders rather than accidentally cascading away records that must be retained.
Declare NOT NULL, CHECK, and UNIQUE where the invariant belongs in one table. A CHECK expression involving NULL may not reject a row without NOT NULL.
Add nullable columns first, backfill, update writers, validate data, and only then tighten constraints. Large alterations can lock tables depending on the engine.
Use INSERT and predicate-scoped UPDATE inside explicit transactions when several changes must succeed together. Check the number of affected rows.
SELECT only required columns and use JOIN with an explicit key condition. A missing join predicate can multiply rows into a Cartesian product.
Combine WHERE with ORDER BY and a unique tie-breaker. A WHERE predicate on the right side of a LEFT JOIN can remove unmatched rows.
GROUP BY determines the output grain. WHERE filters source rows; HAVING filters groups. COUNT(column) excludes NULL while COUNT(*) counts rows.
Multi-row INSERT reduces round trips. Bulk loaders differ by engine; stage data, validate types and duplicates, and publish only accepted records.
Read EXPLAIN from access nodes upward. A sequential scan can be optimal for a small table or a query returning most records.
A composite B-tree on tenant_id and created_at is useful for tenant-scoped time ranges. Every extra index must also be updated on writes.
Cache expensive summaries only when their staleness is acceptable. SQL transactions cannot automatically invalidate an unrelated application cache.
Range partitions can prune old time periods and simplify retention. Partition pruning needs predicates the engine can relate to the partition key.
Find N+1 query patterns and missing predicates before tuning server memory. Compare query count, transferred rows, and tail latency under realistic concurrency.
COMMIT makes a transaction's changes durable according to engine configuration. Isolation behavior and autocommit defaults depend on the selected database and client.
Prevent lost updates with conditional updates or row locks. A read followed by an unconditional write is vulnerable to concurrent modification.
SQL does not standardize replication topology. Reads from asynchronous replicas may omit a recently committed write even though the primary sees it.
Use engine-native backup and log recovery tools; exporting selected tables may omit roles, sequences, and other state needed for a complete restore.
Handle deadlocks and serialization failures by retrying the entire transaction. Do not retry syntax, permission, or constraint errors without correcting their cause.
Use prepared statements for values and an allowlist for dynamic identifiers. A bound parameter cannot safely stand in for an arbitrary table name.
Monitor slow query shapes, active connections, lock waits, and transaction age. Long idle transactions can retain resources even when they execute no queries.
Estimate heap data, all indexes, logs, temporary sorts, and replicas. Test the largest tenant rather than multiplying an average row size blindly.
Check collation, timezone, NULL handling, and numeric precision when moving SQL between engines. Similar syntax does not guarantee identical semantics.
Keep migrations reviewed, restore drills timed, and query regressions measured. Document which SQL dialect each runnable example expects.
`,
    [
      lab(
        "SQL · disposable PostgreSQL database",
        "SELECT 1 AS connected;\nSELECT NULL IS NULL AS missing;",
        "The result columns contain 1 and true. NULL = NULL would instead evaluate to unknown.",
      ),
      lab(
        "SQL · create once in an empty lab schema",
        "CREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  tenant_id INTEGER NOT NULL,\n  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0)\n);",
        "Duplicate IDs and negative amounts are rejected. The table does not yet model order items or currencies.",
      ),
      lab(
        "SQL · after the modeling fixture",
        "INSERT INTO orders VALUES (1, 7, 1200), (2, 7, 800);\nSELECT tenant_id, SUM(amount_cents) AS total\nFROM orders GROUP BY tenant_id;",
        "Tenant 7 has total 2000. Run inserts once, or reset the disposable fixture before repeating.",
      ),
      lab(
        "SQL · after the modeling fixture",
        "CREATE INDEX orders_tenant ON orders (tenant_id);\nEXPLAIN SELECT id FROM orders WHERE tenant_id = 7;",
        "An index becomes available, but a tiny table may still use a sequential scan. Add realistic data before comparing plans.",
      ),
      lab(
        "SQL · after the operations fixture",
        "BEGIN;\nUPDATE orders SET amount_cents = 1500 WHERE id = 1;\nROLLBACK;\nSELECT amount_cents FROM orders WHERE id = 1;",
        "The value remains 1200 because the transaction was rolled back.",
      ),
      lab(
        "SQL · read-only integrity check",
        "SELECT tenant_id, COUNT(*) AS orders, SUM(amount_cents) AS total\nFROM orders GROUP BY tenant_id ORDER BY tenant_id;",
        "Compare this business-level summary before and after a restore or migration, alongside key/value checks.",
      ),
    ],
  ),
  postgresql: profile(
    "https://www.postgresql.org/docs/current/",
    "Build an order service using PostgreSQL tables, constraints, MVCC, and WAL. Examples use psql in a disposable database and require the privileges stated by each administrative operation.",
    `
PostgreSQL combines relational constraints and transactions with extensible types and indexes. Use relational columns for core invariants and JSONB for genuinely variable attributes.
A backend process executes a connection's work; shared buffers cache pages and WAL records changes. Checkpoints and background maintenance affect write behavior.
Install a supported PostgreSQL release and psql, create a lab database, and connect with a non-superuser. Verify current_database() and version() before loading fixtures.
Schemas namespace tables inside a database. MVCC stores row versions so readers can use snapshots while writers modify data.
psql supports interactive queries and scripts. EXPLAIN, pg_stat_activity, and pg_stat_user_tables expose plans, active work, and table maintenance statistics.
Normalize customer identity separately from order history. Store money with an exact type and timestamp instants with timestamptz when timezone-aware interpretation is needed.
GENERATED AS IDENTITY provides surrogate values but still needs a PRIMARY KEY or UNIQUE constraint to enforce uniqueness. Sequences can have gaps.
Foreign keys and unique constraints enforce relationships atomically. Index referencing columns when parent changes or lookup workloads would otherwise scan child tables.
Use CHECK for row-local conditions and constraints for uniqueness. Do not assume a CHECK can safely enforce an invariant involving arbitrary other rows.
Use expand-contract migrations and inspect locking behavior. CREATE INDEX CONCURRENTLY reduces write blocking but has restrictions and can leave invalid indexes after failure.
INSERT ... ON CONFLICT can implement idempotent writes when backed by an appropriate unique constraint. Define what an existing key means before choosing DO UPDATE.
Use joins, CTEs, and window functions to express reports clearly. A CTE is not an unconditional promise of materialization on every PostgreSQL release.
Match B-tree ordering to the filter and cursor. Use a unique ID with created_at so pages remain deterministic when timestamps are equal.
FILTER on aggregates and window functions serve different purposes: grouping reduces rows, while a window can retain each order alongside its tenant total.
COPY is efficient for bulk loading. Stage imports and validate them before merging; distinguish server-side file paths from psql's client-side backslash-copy command.
EXPLAIN (ANALYZE, BUFFERS) reports actual work and buffer activity, but executes the statement. Use safe reads and realistic fixtures.
B-tree supports common equality/range access; GIN suits selected containment/search workloads; BRIN can help large physically correlated tables. Index choice follows operators.
Shared buffers and the operating-system cache both affect measurements. An application result cache adds staleness semantics distinct from PostgreSQL page caching.
Declarative partitioning prunes partitions using compatible predicates. Unique constraints on a partitioned table have partition-key restrictions that influence identity design.
Investigate stale statistics, long transactions, dead tuples, and I/O before changing memory settings. VACUUM maintains reclaimable space and visibility information.
Read Committed takes a new snapshot for each statement. Repeatable Read and Serializable provide stronger behavior but may require retrying aborted transactions.
SELECT FOR UPDATE locks selected rows until the transaction ends. Acquire related locks in a consistent order and avoid holding locks across network calls.
Physical streaming replication ships WAL; logical replication publishes logical changes. Replica lag and schema compatibility require different operational checks.
pg_dump is a logical backup; base backups plus retained WAL enable physical recovery workflows. Test roles, extensions, and restore targets as part of recovery.
After failover, fence the former primary and reconnect clients. Retry serialization failures with bounded backoff, preserving the application's idempotency key.
Use roles, grants, and controlled search_path values. Row-level security can add tenant restrictions, but privileged roles and policy design require careful testing.
Track pg_stat_activity, lock waits, WAL volume, replication lag, and autovacuum progress. Long-running snapshots can prevent cleanup and increase table bloat.
Budget space for table growth, indexes, retained WAL, and temporary operations. A stalled replication slot can retain WAL and exhaust storage.
For logical migrations, compare types, extensions, sequences, and constraints as well as rows. Keep schema changes coordinated with replication consumers.
Practice point-in-time recovery, index maintenance, and failover in staging. Document extension dependencies and retain migration rollback procedures.
`,
    [
      lab(
        "PostgreSQL · psql",
        "SELECT current_database(), current_user;\nSHOW server_version;",
        "Confirm the disposable database and intended limited role before executing the later fixtures.",
      ),
      lab(
        "PostgreSQL · create once",
        "CREATE TABLE pg_orders (\n id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n tenant_id BIGINT NOT NULL,\n external_id TEXT NOT NULL,\n amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),\n UNIQUE (tenant_id, external_id)\n);",
        "An identity key and a tenant-scoped business key protect different invariants.",
      ),
      lab(
        "PostgreSQL · after schema lab",
        "INSERT INTO pg_orders (tenant_id, external_id, amount)\nVALUES (7, 'order-a', 12.50)\nON CONFLICT (tenant_id, external_id) DO NOTHING;\nSELECT tenant_id, SUM(amount) FROM pg_orders GROUP BY tenant_id;",
        "Replaying the insert does not create another order. Tenant 7 totals 12.50 on a fresh fixture.",
      ),
      lab(
        "PostgreSQL · after schema lab",
        "EXPLAIN (ANALYZE, BUFFERS)\nSELECT id, amount FROM pg_orders WHERE tenant_id = 7;",
        "Inspect actual versus estimated rows and buffer accesses. The unique composite index may support tenant lookup.",
      ),
      lab(
        "PostgreSQL · after operations lab",
        "BEGIN;\nSELECT * FROM pg_orders WHERE external_id = 'order-a' FOR UPDATE;\nUPDATE pg_orders SET amount = 15 WHERE tenant_id = 7 AND external_id = 'order-a';\nROLLBACK;",
        "The row lock is released and amount remains 12.50. Use a second session to observe contention while the transaction is open.",
      ),
      lab(
        "PostgreSQL · own-session visibility",
        "SELECT state, wait_event_type, wait_event\nFROM pg_stat_activity WHERE pid = pg_backend_pid();",
        "The current query is active. Broader monitoring may require additional privileges; avoid exposing other sessions' sensitive query text.",
      ),
    ],
  ),
  mysql: profile(
    "https://dev.mysql.com/doc/refman/8.4/en/",
    "Use MySQL 8.4 with InnoDB for a tenant order ledger. Storage-engine and isolation assumptions are explicit because MySQL engines do not all provide the same guarantees.",
    `
MySQL provides relational queries, indexes, and transactions. This course uses InnoDB so row locking, crash recovery, and foreign-key behavior have a concrete meaning.
The server processes SQL while InnoDB manages its buffer pool, pages, undo, and redo. The binary log serves replication and recovery workflows distinct from redo.
Install MySQL 8.4 and a compatible client, create a disposable schema, and verify the server version and transaction isolation setting before running the labs.
InnoDB stores row data in the clustered primary-key index. Secondary indexes include primary-key values, making primary-key width a storage decision.
Use the mysql client, EXPLAIN, Performance Schema, and the slow query log with controlled access. Capture representative query digests instead of sensitive literals.
Keep customer identity separate from order history and select explicit character sets and collations. Text comparison rules affect uniqueness and sorting.
AUTO_INCREMENT creates surrogate values, not gap-free business numbering. A separate unique tenant/reference constraint is needed for request deduplication.
InnoDB foreign keys protect references, while ON DELETE behavior determines historical retention. Confirm referenced and referencing columns use compatible definitions.
Use exact DECIMAL values for money and explicit nullability. Understand TIMESTAMP versus DATETIME behavior and configure connection timezone handling deliberately.
Online DDL capabilities depend on the operation and release. Check algorithm and locking behavior on a representative table before scheduling a large alteration.
INSERT ... ON DUPLICATE KEY UPDATE responds to unique-key conflicts. Multiple unique keys can make conflict intent harder to reason about, so keep ingestion keys explicit.
Use bound parameters and predicate-scoped queries. Keep transactions short when reading data that will subsequently be updated.
A composite index can satisfy a leftmost prefix of its keys. Test collation and sort direction with the actual ORDER BY query.
Use GROUP BY with explicit selected columns. ONLY_FULL_GROUP_BY helps reject ambiguous queries rather than choosing arbitrary values from each group.
Use bounded multi-row inserts or an appropriately configured loader into staging. Validate duplicate keys and encoding before merging into live tables.
EXPLAIN ANALYZE executes supported statements and reports actual iterator work. Compare access types and rows examined against rows returned.
Choose a narrow stable primary key because secondary indexes carry it. Covering indexes can save clustered lookups but consume additional write and storage capacity.
The InnoDB buffer pool caches pages. MySQL 8.4 does not provide the old query cache; application result caching has separate invalidation responsibilities.
MySQL partitioning has constraints on unique keys and foreign-key support. Check InnoDB partitioning limitations before mixing it with the order schema.
Inspect buffer-pool misses, lock waits, query digests, and fsync behavior. Avoid raising connection limits without checking memory and queueing effects.
InnoDB's default isolation is Repeatable Read, but consistent reads and locking reads differ. Verify settings rather than relying on a server-wide assumption.
Range locking can include gaps under relevant isolation and access paths. Use suitable indexes, short transactions, and consistent lock order to reduce deadlocks.
Binary-log replication can lag. GTIDs help track transaction identity, but failover still requires an eligible replica, routing updates, and old-primary fencing.
Combine a consistent backup with retained binary logs when point-in-time recovery is required. A logical dump's consistency depends on engine and options.
Deadlock victims must retry their transaction. A dropped connection during COMMIT leaves an ambiguous outcome that requires application-level reconciliation.
Separate application users from administration accounts and restrict host access. Require encrypted connections and grant only the specific schema operations needed.
Performance Schema exposes waits and statement summaries. Monitor replica apply lag, disk growth, active transactions, and connection usage alongside request latency.
Include secondary-index primary-key overhead, redo/binlog retention, replicas, and temporary space. Measure large transactions because they can amplify replication lag.
Check SQL modes, collations, case sensitivity, generated IDs, and timezone assumptions during migration. Validate totals and business uniqueness after cutover.
Rehearse backup restoration and replica promotion. Record version-specific DDL limitations and verify application reconnect behavior during maintenance.
`,
    [
      lab(
        "MySQL 8.4 · mysql client",
        "SELECT VERSION(), DATABASE();\nSELECT @@transaction_isolation;",
        "Confirm the chosen release, lab schema, and isolation setting; the default InnoDB setting is normally REPEATABLE-READ.",
      ),
      lab(
        "MySQL 8.4 · create once",
        "CREATE TABLE mysql_orders (\n id BIGINT PRIMARY KEY AUTO_INCREMENT,\n tenant_id BIGINT NOT NULL,\n ref VARCHAR(64) NOT NULL,\n amount DECIMAL(12,2) NOT NULL,\n UNIQUE KEY tenant_ref (tenant_id, ref),\n CHECK (amount >= 0)\n) ENGINE=InnoDB;",
        "The composite unique index deduplicates a tenant's reference independently of the generated primary key.",
      ),
      lab(
        "MySQL 8.4 · after schema lab",
        "INSERT INTO mysql_orders (tenant_id, ref, amount) VALUES (7, 'a', 12.50);\nSELECT tenant_id, SUM(amount) AS total\nFROM mysql_orders GROUP BY tenant_id;",
        "On a fresh fixture tenant 7 totals 12.50. A repeated insert fails the unique constraint rather than duplicating the order.",
      ),
      lab(
        "MySQL 8.4 · after schema lab",
        "EXPLAIN ANALYZE SELECT id, amount\nFROM mysql_orders WHERE tenant_id = 7;",
        "Compare estimated and actual work. Small fixtures cannot establish the index's benefit at production scale.",
      ),
      lab(
        "MySQL 8.4 · after operations lab",
        "START TRANSACTION;\nSELECT amount FROM mysql_orders WHERE tenant_id = 7 AND ref = 'a' FOR UPDATE;\nUPDATE mysql_orders SET amount = 20 WHERE tenant_id = 7 AND ref = 'a';\nROLLBACK;",
        "The amount remains 12.50; the lock exists only until the transaction ends.",
      ),
      lab(
        "MySQL 8.4 · diagnostic session",
        "SHOW SESSION STATUS LIKE 'Threads_running';\nSHOW ENGINE INNODB STATUS;",
        "The second command requires suitable privileges and exposes diagnostic state. Inspect deadlock information in a restricted lab environment.",
      ),
    ],
  ),
  oracle: profile(
    "https://docs.oracle.com/en/database/oracle/oracle-database/26/cncpt/",
    "Use Oracle SQL for an order ledger, with explicit transaction boundaries. Administrative exercises belong in a disposable pluggable database and may require a DBA-operated environment.",
    `
Oracle Database provides relational storage, SQL, PL/SQL, and transactional recovery. Separate everyday schema work from instance administration and licensed optional features.
An instance contains memory and background processes; database files persist data. Redo records changes and undo supports read consistency and rollback.
Use a supported Oracle installation or authorized training service. Connect to the intended pluggable database with SQLcl or another compatible client and verify identity.
A schema owns objects such as tables and indexes. Distinguish logical objects, tablespaces, datafiles, and the instance that accesses them.
Use SQLcl for scripts and execution-plan tools for query analysis. Some monitoring and tuning facilities require particular privileges or licenses.
Separate order headers and items and retain purchase-time values. Oracle NUMBER supports exact decimal values; define scale and validation for business quantities.
Identity columns or sequences can supply surrogate keys but can have gaps. Add a unique constraint for external request references when deduplicating operations.
Foreign keys protect references; index design on child keys matters for access and locking behavior. Preserve historical records instead of cascading without review.
Define NUMBER precision, timestamp semantics, and required columns. Oracle treats an empty character string as NULL, which differs from several other databases.
DDL commonly commits implicitly, so do not assume a schema alteration can be rolled back with surrounding DML. Plan compatible changes and separate deployment steps.
Use INSERT, UPDATE, and MERGE with explicit key conditions. Verify affected rows and commit deliberately; client autocommit settings change the apparent workflow.
Bind variables for values and qualify object ownership when needed. Plan stability depends on data distribution, statistics, and parameter selectivity.
Use ORDER BY with a unique tie-breaker and supported row-limiting syntax. Row selection without ordering does not promise a stable page.
GROUP BY reduces records while analytic functions retain detail rows. Define the partition and ordering of a window before calculating running totals.
Use supported array binding or bulk-loading tools to reduce round trips. Commit in deliberate units and account for undo, error reporting, and restartability.
Compare estimated plans with execution statistics when available. Bind selectivity and stale optimizer statistics can produce very different plans for similar statements.
B-tree indexes serve selective lookups; bitmap indexes target suitable analytical workloads and can be problematic with frequent concurrent modifications.
The buffer cache and application caches serve different purposes. Check eligibility and invalidation semantics before using any result-caching facility.
Partitioning can improve pruning and maintenance, but feature availability and licensing vary. Confirm requirements before designing an operational dependency around it.
Investigate wait events, I/O, parsing overhead, and SQL execution frequency. Reusing bind-aware statements can reduce unnecessary hard parsing.
Oracle supplies statement-level read consistency under Read Committed. A multi-statement workflow still needs an appropriate transaction and concurrency strategy.
Row locks protect writes, while undo supports consistent reads. Long-running queries need sufficient undo retention for their read-consistency requirements.
Data Guard and other replication solutions have different availability and licensing requirements. Define acknowledgment, lag, failover, and fencing policies explicitly.
RMAN provides physical backup/recovery workflows; Data Pump handles logical export/import. The two serve different recovery and migration objectives.
Recover from an ambiguous COMMIT response by reconciling a durable operation identifier. Do not assume reconnecting reveals whether an unacknowledged write committed.
Use separate schema owners and application users with least-privilege grants. Protect privileged dictionary access, audit records, and backup credentials.
Measure waits, active sessions, redo generation, undo pressure, and storage growth using facilities available to your environment and license.
Budget tablespaces, indexes, redo/archive logs, undo, temporary space, and standby copies. Retention and restore speed determine more than raw table size.
Validate empty-string behavior, NUMBER conversions, sequences, and PL/SQL dependencies when migrating. Count matching rows and compare important business queries.
Maintain approved restore and failover runbooks and verify them with the operations team. Record which optional capabilities the deployment actually uses.
`,
    [
      lab(
        "Oracle SQL · connected lab schema",
        "SELECT USER FROM dual;\nSELECT SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name FROM dual;",
        "Verify both schema identity and container before creating objects.",
      ),
      lab(
        "Oracle SQL · create once",
        "CREATE TABLE oracle_orders (\n id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n tenant_id NUMBER NOT NULL,\n ref VARCHAR2(64) NOT NULL,\n amount NUMBER(12,2) CHECK (amount >= 0) NOT NULL,\n CONSTRAINT oracle_order_ref UNIQUE (tenant_id, ref)\n);",
        "Schema creation is DDL; keep it separate from experiments intended to be rolled back.",
      ),
      lab(
        "Oracle SQL · after schema lab",
        "INSERT INTO oracle_orders (tenant_id, ref, amount) VALUES (7, 'a', 12.50);\nCOMMIT;\nSELECT tenant_id, SUM(amount) FROM oracle_orders GROUP BY tenant_id;",
        "Tenant 7 totals 12.50 after the explicit commit.",
      ),
      lab(
        "Oracle SQL · plan tools require access",
        "EXPLAIN PLAN FOR SELECT amount FROM oracle_orders WHERE tenant_id = 7;\nSELECT * FROM TABLE(DBMS_XPLAN.DISPLAY());",
        "This displays an estimated plan, not a measurement of actual execution time.",
      ),
      lab(
        "Oracle SQL · after operations lab",
        "UPDATE oracle_orders SET amount = 20 WHERE tenant_id = 7 AND ref = 'a';\nROLLBACK;\nSELECT amount FROM oracle_orders WHERE tenant_id = 7 AND ref = 'a';",
        "With client autocommit disabled, rollback restores 12.50.",
      ),
      lab(
        "Oracle SQL · migration semantics probe",
        "SELECT CASE WHEN '' IS NULL THEN 'NULL' ELSE 'VALUE' END AS empty_string\nFROM dual;",
        "Oracle reports NULL. Explicitly test this behavior when moving applications from engines that preserve empty strings.",
      ),
    ],
  ),
  transactions: profile(
    "https://www.postgresql.org/docs/current/mvcc.html",
    "Study transaction guarantees with a two-account transfer in PostgreSQL. Transactions are a database capability, so the installation lesson means preparing a two-session laboratory.",
    `
A transaction groups work behind a commit boundary. ACID describes atomicity, consistency of enforced invariants, isolation from interference, and configured durability.
Trace reads, tentative writes, lock/version checks, commit records, and acknowledgment. A successful application calculation is not equivalent to a durable commit.
Open two psql sessions against one disposable PostgreSQL database. Disable unintended autocommit assumptions and label the sessions A and B for schedules.
Model account balances and an immutable transfer identifier. The invariant is conservation of total balance, plus any rule that forbids negative balances.
Use session logs and lock/wait inspection to reconstruct interleavings. Record isolation level and exact statement order for every anomaly demonstration.
Place the debit, credit, and transfer record inside one supported transaction boundary. A remote payment API cannot join that boundary merely by being called inside it.
A unique transfer ID deduplicates retries. The ID belongs to the business operation and must remain the same after a lost acknowledgment.
Foreign keys connect transfers to accounts; conditional debits or constraints enforce local rules. Cross-row balance conservation needs a correct transactional workflow.
Use exact amounts and explicit currency. A transaction cannot repair an incorrect schema that mixes cents, dollars, and incompatible currencies.
During migration, preserve invariants across old and new writers. A partially backfilled balance representation must not become authoritative prematurely.
Debit only when sufficient funds exist and verify success before crediting. Abort the transaction when any precondition fails.
Read snapshots can be consistent at statement or transaction scope depending on isolation. Define which scope the business decision requires.
Locking a filtered range can behave differently across engines. Test absent rows and predicate conflicts, not just two writers targeting one existing row.
A report under a changing dataset needs a documented snapshot policy. Separate per-statement consistency from a consistent multi-query report.
Large transactions hold resources longer and make retries expensive. Batch only across independent invariants; do not split one atomic transfer across commits.
Transaction latency includes lock waits, commit log persistence, and replica acknowledgment. A fast query plan does not prove a fast transaction.
Indexes reduce the records inspected and sometimes the lock footprint. Missing indexes can turn a narrow business operation into broad contention.
Never use a stale cache to approve an authoritative debit. Update or invalidate display caches after commit with a durable delivery strategy if necessary.
Cross-partition transactions may require coordination across participants. Co-locate related writes when possible, but do not sacrifice correctness to avoid coordination.
Shorten the critical section and avoid external calls while locks are held. Raising concurrency can increase conflicts and reduce useful throughput.
Serializable aims to produce results equivalent to some serial order, often by aborting conflicts. It does not mean transactions literally run one at a time.
Lost updates affect the same value; write skew can affect different rows sharing an invariant. Choose locking or serializable validation to cover the whole decision.
A transaction committed on a primary may not yet be visible on an asynchronous replica. Read-your-writes requires a suitable routing or consistency policy.
Restore to a transactionally consistent point, then verify ledger invariants. Copying files or tables at unrelated moments can produce an impossible state.
Retry the complete transaction after a retryable abort. For unknown commit outcomes, first reconcile the transfer ID to avoid repeating a debit.
Separate permission to read balances, initiate transfers, and administer records. Enforced transaction logic does not replace authorization of the caller.
Track abort rate, deadlocks, transaction age, lock waits, and unknown outcomes. A low error rate can hide transactions queued for a long time.
Capacity includes contention on hot records as well as CPU and disk. One heavily used account can serialize work despite spare cluster capacity.
Moving between isolation implementations needs anomaly tests. Identical isolation-level names do not guarantee identical handling of every concurrency schedule.
Maintain adversarial schedules and reconciliation queries. A transfer test should prove total conservation, no duplicate transfer IDs, and correct failure recovery.
`,
    [
      lab(
        "PostgreSQL · transaction laboratory",
        "SHOW transaction_isolation;\nBEGIN;\nSELECT txid_current();\nROLLBACK;",
        "Record the isolation level and verify explicit transaction control before opening the second session.",
      ),
      lab(
        "PostgreSQL · create once",
        "CREATE TABLE accounts (id INTEGER PRIMARY KEY, cents INTEGER NOT NULL CHECK (cents >= 0));\nINSERT INTO accounts VALUES (1, 1000), (2, 500);",
        "The initial total is 1500 cents. The check protects a single balance, not total conservation.",
      ),
      lab(
        "PostgreSQL · after schema lab",
        "BEGIN;\nSELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;\nUPDATE accounts SET cents = cents - 100 WHERE id = 1;\nUPDATE accounts SET cents = cents + 100 WHERE id = 2;\nCOMMIT;",
        "Balances become 900 and 600. This teaching transfer is not retry-safe by itself; production requires a unique transfer record in the same transaction.",
      ),
      lab(
        "Two-session schedule · design exercise",
        "A: BEGIN; lock account 1\nB: BEGIN; attempt to lock account 1 → waits\nA: COMMIT\nB: obtains lock; recheck balance; finish",
        "Waiting is expected. Compare transaction duration with and without a simulated external call while A holds the lock.",
      ),
      lab(
        "PostgreSQL · rollback experiment",
        "BEGIN;\nUPDATE accounts SET cents = cents - 50 WHERE id = 1;\nROLLBACK;\nSELECT SUM(cents) AS total FROM accounts;",
        "After the prior transfer the total is still 1500; the rolled-back debit leaves no committed effect.",
      ),
      lab(
        "PostgreSQL · invariant audit",
        "SELECT SUM(cents) AS conserved_total, MIN(cents) AS smallest_balance\nFROM accounts;",
        "For this isolated fixture the total must remain 1500 and the smallest balance nonnegative. Real ledgers need a baseline including deposits and withdrawals.",
      ),
    ],
  ),
};

export { profile, lab };
