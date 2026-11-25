import { deep } from "../schema.js";

export default {
  "database-scaling-techniques--indexing": deep({
    anim: ["A composite index in action", "q:Query | p:Planner | i:Index:user + date | t:Table:10M rows", [
      ["q>p", "user 42 newest 20", "Find the 20 newest orders of user 42.", "p=no index yet"],
      ["p>t", "full scan", "Without an index the database reads 10 million rows, filters, and sorts: about 4 seconds.", "t=!10M rows read"],
      ["p>i", "(user_id, date)", "A composite index keeps entries sorted by user, then by date. User 42's entries are **together and in order**.", "i=+at user 42"],
      ["i>t", "20 rows", "It reads 20 entries from the newest end and fetches 20 rows. No sort is needed: about 1 ms.", "t=+20 rows read"],
      ["p>i", "WHERE date only", "A query on date alone cannot use it: dates are sorted only **inside** each user (leftmost rule).", "i=!not usable"],
      ["t>i", "INSERT", "Every insert must now update the index as well. Five indexes mean about six writes per row.", "i=~extra write"],
    ]],
    more: [
      ["Column order", "Equality columns first, then the range or sort column. `(status, created_at)` serves `status = ? ORDER BY created_at` perfectly."],
      ["Covering index", "If the index contains every column the query needs, the table is not touched at all. Useful for hot, narrow queries."],
      ["Special indexes", "Partial (only open orders), expression (`lower(email)`), GIN for JSON and text, BRIN for huge time-ordered tables. Small and precise beats large and general."],
    ],
    use: "Columns used in WHERE, JOIN and ORDER BY of frequent queries, with good selectivity.",
    avoid: "Columns with few values, tables that are mostly written, or duplicates of an existing index prefix.",
    answer: "Reads follow a sorted tree to the few matching rows, but each insert, update or delete must also change the tree. Index a column if frequent queries filter, join or sort by it, it is selective, and the measured read gain outweighs the write cost.",
    qa: [
      ["Why is my index not used?", "Low selectivity, a function or cast on the column, wrong leading column, stale statistics, a leading wildcard, or a table so small that a scan is cheaper. Read the plan."],
      ["How do you remove unused indexes safely?", "Check usage statistics over a full business cycle, include replicas, make the index invisible first if the engine allows, then drop it and watch."],
    ],
  }),
  "database-scaling-techniques--vertical-partitioning": deep({
    anim: ["Splitting hot and cold columns", "q:Profile list | h:users hot:100 B rows | c:users cold:20 KB rows | m:Memory:8 GB", [
      ["q>c", "read wide rows", "The table has name, avatar and a 20 KB biography. Listing names reads whole rows.", "c=20 KB each"],
      ["c>m", "400k rows fit", "Only 400,000 rows fit into 8 GB, so most reads go to disk.", "m=!400k rows"],
      ["c>h", "move hot columns", "Move id, name and avatar to a narrow table.", "h=100 B each"],
      ["q>h", "list names", "Listing reads only narrow rows.", "h=+fast"],
      ["h>m", "80M rows fit", "The same memory now holds 80 million hot rows.", "m=+80M rows"],
      ["q>c", "open one bio", "Opening one profile needs a second read by the same key. Rare, so acceptable.", "c=1 extra read"],
    ]],
    more: [
      ["By access, size and security", "Split columns that are rarely read, very large, or sensitive (medical notes) so that access rules and encryption can differ."],
      ["By function", "Moving whole tables to separate databases (orders, catalog) is functional partitioning. It scales well until one area outgrows its server."],
      ["Costs", "Two inserts per entity, joins for full rows, and a transaction to keep the halves together."],
    ],
    use: "Wide rows with a small hot part, or big blobs beside small fields.",
    avoid: "Narrow tables or when almost every query needs all columns.",
    answer: "Vertical partitioning splits **columns** into separate tables; sharding splits **rows** over machines. Use both when rows are wide and also too many: keep hot columns small and then shard by user id.",
    qa: [
      ["How is this different from columnar storage?", "Vertical partitioning is a schema choice in a row store with a few groups. A columnar engine stores every column separately and compresses it, designed for scans."],
      ["How do you migrate with no downtime?", "Create the new table, write to both, backfill in batches, read from the new one behind a flag, compare, then stop writing the old columns and drop them."],
    ],
  }),
  "database-scaling-techniques--query-optimization": deep({
    anim: ["From slow query to fast query", "l:Slow log | e:EXPLAIN | p:Plan:unknown | f:Fix | t:Time:3800 ms", [
      ["l>e", "top by total time", "Choose the query with the largest **total** time (calls x duration), not simply the slowest.", "l=query 17"],
      ["e>p", "actual rows", "EXPLAIN ANALYZE shows a sequential scan: 2 million rows read, 12 returned.", "p=!scan 2M for 12"],
      ["p>f", "why no index?", "The filter is `DATE(created_at) = ...`. A function on the column hides the index.", "f=rewrite filter"],
      ["f>t", "range filter", "Rewrite as `created_at >= x AND created_at < x + 1 day`. The index works.", "t=+9 ms"],
      ["e>p", "check N+1", "The page still runs 50 of them, one per item.", "p=~50 queries"],
      ["f>t", "one IN query", "Fetch all 50 in one query, then measure again in production.", "t=+12 ms for all"],
    ]],
    more: [
      ["Estimate versus actual", "A big gap between estimated and actual rows explains most bad plans. Refresh statistics or add extended statistics for correlated columns."],
      ["Common rewrites", "Select only needed columns, replace OFFSET with keyset pagination, EXISTS in place of large IN, pre-aggregate before joining, avoid OR across columns."],
      ["Waiting is not working", "A query may be slow because of locks, I/O or a full pool. Check wait events before changing SQL."],
    ],
    use: "Before any scaling project: it is usually the cheapest tenfold win.",
    avoid: "Tuning on tiny test data, or adding indexes without reading plans.",
    answer: "Look at the execution plan (EXPLAIN ANALYZE) and compare rows read with rows returned. If a selective filter or sort has no usable index, add one. If the query hides the index, fetches too much, or repeats in a loop, rewrite it.",
    qa: [
      ["A query is fast alone and slow in production. Why?", "Lock waits, cold cache, different parameters (plan built for another value), pool waiting, or replica lag. Compare plans and wait events under load."],
      ["Why is OFFSET slow on deep pages?", "The database must produce and throw away all skipped rows. Keyset pagination starts directly after the last seen key."],
    ],
  }),
  "database-scaling-techniques--read-replicas": deep({
    anim: ["Read your own write on a lagging replica", "u:User | a:App | p:Primary:name Al | r1:Replica 1:name Al, r2:Replica 2:name Al", [
      ["u>a", "name = Bo", "The user saves a new name.", "a=writing"],
      ["a>p", "UPDATE", "The primary commits at log position 900.", "p=name Bo @900"],
      ["p>r1", "log 900", "Replica 1 has applied up to 900. Replica 2 is 2 seconds behind.", "r1=name Bo @900; r2=~Al @870"],
      ["u>a", "reload page", "The user reloads. A random replica is chosen.", "a=reading"],
      ["a>r2", "reads Al", "Replica 2 returns the old name. The user thinks that saving failed.", "u=!sees Al"],
      ["a>r1", "need >= 900", "Fix: remember position 900 for this user and read only from a replica that has reached it, or from the primary.", "u=+sees Bo"],
    ]],
    more: [
      ["Replicas do not scale writes", "Every replica applies every write. At 80% write load on the primary, replicas are also busy, and adding more gives less each time."],
      ["Uses", "Read scaling, reports, backups, near-user reads in another region, and standby for failover. Keep reports away from the failover candidate."],
      ["Lag sources", "Long transactions, big batch updates, single-threaded apply, slow disk. Measure lag in seconds and in bytes, and remove replicas that are too far behind."],
    ],
    use: "Read-heavy workloads that accept slight staleness.",
    avoid: "Write bottlenecks, or reads that must be exact, such as balance checks.",
    answer: "Asynchronous replication keeps commits fast and lets the primary work when a replica is slow or down. The problem: a client that just wrote may read from a lagging replica and not see its own write.",
    qa: [
      ["How do you promote a replica safely?", "Fence the old primary, choose the replica with the latest log, promote, redirect clients by name, and rebuild the old primary. Know how much acknowledged data could be lost."],
      ["Semi-synchronous replication?", "The primary waits until at least one replica has received the log. It loses nothing on a single failure and costs about one round trip per commit."],
    ],
  }),
  "database-scaling-techniques--denormalization": deep({
    anim: ["Storing a counter instead of counting", "u:Reader | p:posts:no counter | l:likes:2M rows | j:Repair job", [
      ["u>l", "COUNT(*)", "Showing the like count needs a count over 2 million rows for each view.", "l=!slow count"],
      ["l>p", "add like_count", "Store the number in the post row. Reading it is free.", "p=2000000"],
      ["u>l", "like", "A new like inserts a row...", "l=2000001 rows"],
      ["l>p", "+1 same tx", "...and adds one to the counter in the **same transaction**, so they agree.", "p=+2000001"],
      ["l", "bulk delete", "A cleanup script deletes spam likes and forgets the counter.", "l=1999500 rows; p=!2000001"],
      ["j>p", "recount", "A periodic repair job compares and fixes the difference. Every copy needs an owner and a repair path.", "p=+1999500"],
    ]],
    more: [
      ["Forms", "Duplicated columns, counters, precomputed joins, JSON snapshots (the address on an order), and fan-out copies per reader."],
      ["Snapshot is not duplication", "The price on an order must stay as it was at purchase. Copying it is correct modelling rather than denormalization."],
      ["Hot counters", "A very popular row becomes a lock bottleneck. Use sharded counters or aggregate in a queue."],
    ],
    use: "Expensive joins or aggregates on hot read paths, with a clear update rule.",
    avoid: "As a first step. Try indexes, query rewrites and caching before copying truth.",
    answer: "The copies can drift apart: an update that misses one copy makes data inconsistent. Guard against it by updating in one transaction or by a change stream, and run a reconciliation job that detects and repairs differences.",
    qa: [
      ["Denormalize or cache?", "A cache can be dropped and rebuilt and has a TTL, but misses cost. A denormalized column is durable, queryable and always there, but must be maintained on every write."],
      ["How do you keep copies updated across services?", "The owner publishes changes; consumers store the fields they need with a version and ignore older ones. Offer a way to resync from scratch."],
    ],
  }),
  "database-scaling-techniques--materialized-views": deep({
    anim: ["Refreshing a sales summary", "d:Dashboard | v:Materialized view:empty | o:orders:50M rows | r:Refresh job", [
      ["d>o", "SUM by region", "The dashboard query scans 50 million rows: 40 seconds, on every load.", "o=!scanning"],
      ["r>o", "compute once", "A materialized view stores the **result** of the query as a table.", "o=read once"],
      ["r>v", "500 rows", "The result is 500 rows: region by day.", "v=+500 rows"],
      ["d>v", "read 5 ms", "The dashboard reads 500 rows, which you can also index.", "d=+5 ms"],
      ["o", "new orders", "New orders arrive. The view does not change until the next refresh.", "v=~10 min old"],
      ["r>v", "incremental", "Instead of recomputing everything, apply only the new orders to the affected 10 rows.", "v=+fresh"],
    ]],
    more: [
      ["Refresh choices", "On schedule, on demand, on commit, or continuously by a streaming engine. Fresher means more write cost."],
      ["Concurrent refresh", "Some engines lock readers during refresh. Use the concurrent mode (needs a unique index) or build a new table and swap names."],
      ["Incremental maths", "Sums and counts update easily. Distinct counts and medians need sketches or recomputation. Deletes need care: subtract the old contribution."],
    ],
    use: "Heavy aggregates read often, where minutes of staleness are fine.",
    avoid: "Per-user results with millions of variants, or data that must be exact now.",
    answer: "When results are per user or per parameter, rarely repeated, need second-level freshness, or combine data from several systems. An application cache with a TTL computes only what is asked for, while a view recomputes everything.",
    qa: [
      ["View or materialized view?", "A view is a stored query, run at read time and always current. A materialized view is a stored result: fast but possibly stale and using space."],
      ["How do you show freshness to users?", "Store the refresh time with the data, show 'as of 10:05', and alert when a refresh fails or becomes too old."],
    ],
  }),
  "database-scaling-techniques--connection-pooling": deep({
    anim: ["Too many connections and a pooler", "a:30 app servers | x:Pooler:not used | d:Database:300 max | w:Waiting", [
      ["a>d", "20 each = 600", "Each of the 30 servers opens a pool of 20. 600 connections exceed the limit of 300.", "d=!refused"],
      ["a>d", "8 each = 240", "Reduce to 8 per server: 240 in total, leaving 60 for admin, jobs and deploys.", "d=240 of 300"],
      ["d", "16 cores", "The database has 16 cores. 240 active queries would only fight for CPU and locks.", "d=~thrashing"],
      ["a>x", "pooler", "A pooler accepts 240 client connections...", "x=240 clients"],
      ["x>d", "40 real", "...and runs them over 40 real ones, lending a connection **per transaction**.", "d=+40 busy"],
      ["a>w", "wait 2 ms", "A short wait in the pool beats a long fight inside the database. Alert when the wait grows.", "w=+2 ms"],
    ]],
    more: [
      ["Sizing rule", "Start near (cores x 2) + effective disks for the whole database, then test. Small pools often give higher throughput than large ones."],
      ["Leaks and long holders", "A connection kept during an HTTP call starves others. Take it late, return it early, set a maximum hold time and log offenders."],
      ["Serverless", "Hundreds of short-lived instances each opening connections overwhelm a database. Use a pooler or an HTTP data API."],
    ],
    use: "Always, for any database or HTTP dependency with a connection cost.",
    avoid: "Transaction pooling with session features (temporary tables, advisory locks, session settings) unless you know they are safe.",
    answer: "Reserve some for admin and deploys, for example use 240: 240 / 30 = 8 per instance. During a rolling deploy, old and new instances overlap, so leave room. Watch pool wait time, active versus idle connections, checkout timeouts and database CPU.",
    qa: [
      ["What happens when the pool is exhausted?", "Requests wait for a connection up to a checkout timeout, then fail. Without a timeout they pile up and the service hangs although the database is fine."],
      ["Why is opening a connection expensive?", "TCP and TLS handshakes, authentication, and on some databases a whole process of several MB. Reuse turns 20-50 ms into microseconds."],
    ],
  }),
  "database-scaling-techniques--sharding": deep({
    anim: ["Routing queries to shards by tenant", "a:App | r:Shard router:hash tenant | s1:Shard 1, s2:Shard 2, s3:Shard 3", [
      ["a>r", "tenant 7 order", "The request includes the shard key, `tenant_id = 7`.", "r=hash = 2"],
      ["r>s2", "INSERT", "The router sends it to one shard. Each shard handles about a third of the writes.", "s2=+tenant 7"],
      ["a>r", "all tenants today", "A report without the key must ask **every** shard.", "r=scatter"],
      ["r>s1,s2,s3", "fan out", "The router queries all three and merges. The slowest shard decides the latency.", "s1=reading; s2=reading; s3=~slow"],
      ["s2", "tenant 7 grows", "Tenant 7 becomes 100 times bigger than the others. Shard 2 is hot while the rest are idle.", "s2=!95% CPU; s1=10% CPU; s3=10% CPU"],
      ["r>s3", "own shard", "With a directory, the big tenant gets a dedicated shard, or its data is split by `tenant_id + user_id`.", "s2=+30% CPU; s3=tenant 7 alone"],
    ]],
    more: [
      ["Before sharding", "Bigger machine, indexes, caching, replicas, archiving, functional split. Sharding is last because it complicates every query, migration and backup."],
      ["What becomes hard", "Joins and transactions across shards, unique constraints, auto-increment ids, ordered pagination, and schema changes on many databases."],
      ["Logical shards", "Create many more logical shards (say 1,024) than machines and map them. Growing means moving logical shards, with no change to the hash."],
    ],
    use: "One primary can no longer hold the data or absorb the writes, and a natural key exists.",
    avoid: "To speed up slow queries, or with fewer than about a terabyte and no write pressure.",
    answer: "That tenant's shard becomes a hot spot: CPU, disk, backups and noisy-neighbour effects for others there, and it may not even fit. Give it a dedicated shard (directory mapping), or split that tenant further with a compound key.",
    qa: [
      ["How do you choose a shard key?", "It should appear in almost all queries, have many values, spread traffic evenly, keep related rows together, and never change. Tenant or user id is common."],
      ["How do you enforce a unique email across shards?", "Keep a separate mapping table sharded by email hash, and reserve the email there first; or use a global consistent store for that index."],
    ],
  }),
  "database-scaling-techniques--sharding-vs-partitioning": deep({
    anim: ["Same table, partitioned and then sharded", "w:Writes 20k rps | p:One server:limit 12k | m1:Nov partition, m2:Oct partition | s1:Server A, s2:Server B", [
      ["w>p", "20k req/s", "The server is limited to 12,000 writes per second and is saturated.", "p=!100% busy"],
      ["p>m1", "partition by month", "Partitioning splits the table into monthly pieces **inside the same server**.", "m1=all new writes"],
      ["p>m2", "drop October", "Great for queries by month and for dropping old data instantly.", "m2=+dropped"],
      ["w>m1", "still 20k", "But all new writes go to November on the same machine. CPU and disk are unchanged.", "p=!100% busy"],
      ["w>s1,s2", "shard by user", "Sharding puts rows on **different servers**: 10,000 writes per second each.", "s1=+10k rps; s2=+10k rps"],
      ["s1", "both together", "Each shard can also be partitioned by month: sharding for load, partitioning for housekeeping.", "s1=+monthly"],
    ]],
    more: [
      ["Partition pruning", "A query with the partition key reads only matching partitions. Without it, every partition is checked, which can be slower than one table."],
      ["Local and global indexes", "Partitioned tables usually have one index per partition. A unique constraint must then include the partition key."],
      ["Naming is inconsistent", "Vendors use partition for both ideas. Ask: one server or many?"],
    ],
    use: "Partition for retention, maintenance and time-range queries; shard for capacity beyond one server.",
    avoid: "Partitioning small tables: planning overhead exceeds the gain.",
    answer: "No. Partitions are on the same server, so they share its CPU, memory and disk, and all current writes still hit that machine. More partitions may ease index maintenance a little, but write throughput needs sharding (or a bigger server).",
    qa: [
      ["How do you delete 100 million old rows?", "If partitioned by time, drop the partition: instant with no bloat. Otherwise delete in small batches, with pauses and vacuuming, or copy the remaining rows to a new table and swap."],
      ["Range, list or hash partitions?", "Range for time, list for categories such as region, hash to spread evenly when there is no natural range."],
    ],
  }),
  "database-scaling-techniques--data-compression": deep({
    anim: ["Why columns compress better than rows", "r:Row block | c:Column block | e:Encoder | o:Output", [
      ["r>e", "id name city date", "A row block mixes ids, names, cities and dates. Neighbouring bytes have little in common.", "r=8 KB mixed"],
      ["e>o", "2x smaller", "A general compressor finds some repetition.", "o=4 KB"],
      ["c>e", "city city city", "A column block holds only cities: thousands of values but only 40 different ones.", "c=8 KB of city"],
      ["e", "dictionary", "Each city becomes a 6-bit number from a dictionary.", "e=dictionary 40"],
      ["e", "run length", "Sorted data gives runs: `Pune x 900` is stored as one pair.", "e=run length"],
      ["e>o", "20x smaller", "The query can even skip or count runs without unpacking. Less I/O usually saves more time than CPU costs.", "o=+400 B"],
    ]],
    more: [
      ["Encodings first", "Dictionary, run length, delta and frame of reference understand the data type. A general codec (LZ4, Zstd) then squeezes the result."],
      ["Choosing a codec", "LZ4: very fast, modest ratio, for hot data. Zstd: strong ratio with tunable level, for warm data. Gzip: compatible. Higher levels for data written once and read rarely."],
      ["Where it hurts", "Compressed pages must be unpacked to update. Encrypted or already compressed data (images, video) does not shrink."],
    ],
    use: "Columnar analytics, logs, backups, network payloads, cold pages.",
    avoid: "Tiny values, or tables updated constantly with CPU as the bottleneck.",
    answer: "A columnar table keeps similar values together, so encodings give 5-20x, and analytics reads large ranges where less I/O wins. A row table updated constantly compresses less, and each update must decompress and recompress a page, costing CPU on the hot path.",
    qa: [
      ["Should you compress before or after encrypting?", "Before. Encrypted bytes look random and cannot be compressed. Beware of compressing secrets together with attacker-controlled input on the wire, since size can leak information."],
      ["How do you decide whether compression pays?", "Compare time saved on I/O with CPU spent: if disk or network is the bottleneck it helps, if CPU is, use a lighter codec. Measure on real data."],
    ],
  }),
};
