import { lesson } from "../schema.js";

export default {
  "caching--write-around-and-refresh-ahead": lesson({
    intro: "**Write-around** skips the cache on writes, so that it only holds what is really read. **Refresh-ahead** renews popular entries **before** they expire, so readers never wait.",
    scene: "A log archive writes millions of records a day and reads a few hundred. With write-through, the cache is full of records that nobody will open. Meanwhile the home page's entry expires every minute, and one unlucky user per minute waits two seconds.",
    parts: [
      ["Write-around", "Writes go to the database only. The cache is filled on a later read miss. The cache stays small and useful, but the first read after a write is slow, and any old entry must be deleted."],
      ["Refresh-ahead", "When an entry is read and, say, 80% of its TTL has passed, the cache returns it at once and renews it in the background."],
      ["Soft and hard TTL", "Soft TTL: after it, serve the old value and refresh. Hard TTL: after it, do not serve. Between the two, users get an instant, slightly old answer."],
      ["Early random refresh", "Each reader may refresh with a small probability that rises as expiry approaches. Spreads the work without locks."],
      ["Cost", "Refresh-ahead does extra work for entries that nobody may read again. Limit it to keys that were read several times."],
    ],
    table: ["WRITE STRATEGIES SIDE BY SIDE", ["Strategy", "Write cost", "Next read", "Best for"], [["Write-through", "Cache + DB", "Fast and fresh", "Read soon after write"], ["Write-back", "Cache only", "Fast", "Very frequent writes"], ["Write-around", "DB only", "Miss", "Written often, read rarely"]]],
    anim: ["A hot key with refresh-ahead", "u:Readers | c:Cache:v1 TTL 60s | b:Background job | d:Database:v1", [
      ["u>c", "read at 10 s", "The entry is fresh: an immediate hit.", "c=+v1 fresh"],
      ["d", "update v2", "The value changes in the database.", "d=v2"],
      ["u>c", "read at 50 s", "83% of the TTL has passed. The reader receives v1 **at once**...", "c=~v1 ageing"],
      ["c>b", "refresh", "...and triggers one background refresh.", "b=loading"],
      ["b>d", "query 2 s", "The slow query takes two seconds, but no user is waiting for it.", "d=1 query"],
      ["b>c", "v2 TTL 60s", "The entry is renewed before it expires.", "c=+v2 fresh; b=idle"],
      ["u>c", "read at 61 s", "Without refresh-ahead this reader would have waited two seconds.", "u=+1 ms"],
    ]],
    example: [
      ["Classify keys", "Home page: read 500 times per second. Archive record: written once, read 0.01 times."],
      ["Home page", "Soft TTL 60 s, hard TTL 10 min, refresh at 80%: p99 falls from 2,000 to 3 ms."],
      ["Archive", "Write-around: the cache shrinks from 64 GB to 2 GB."],
      ["Protect", "If the database is down, the home page continues to be served for 10 minutes."],
      ["Watch", "Refreshes per second, refresh failures, and the age of served entries."],
    ],
    code: `async function get(key) {
  const entry = await cache.get(key);
  if (!entry) return load(key);                     // hard miss
  if (Date.now() > entry.softExpiry && (await lock(key, 5000)))
    load(key).catch(report);                        // one background refresh
  return entry.value;                               // answer immediately
}`,
    use: "Write-around for data read rarely; refresh-ahead for a small set of very hot, slow-to-build keys.",
    avoid: "Refresh-ahead for millions of cold keys, or for data that must be exact.",
    mistakes: [["Forgetting to delete", "Write-around with an old cached entry serves stale data until the TTL ends."], ["Everyone refreshes", "Without a lock, all readers start the same refresh at 80%."], ["Hiding failures", "If refresh fails silently, old data may be served for days. Alert on age."]],
    check: "Why does write-around have a higher read latency right after a write than write-through, and when is this irrelevant?",
    answer: "After a write the cache has no entry (or it was deleted), so the next read misses and goes to the database, while write-through already stored the new value. It does not matter if data is rarely or much later read.",
    qa: [["How does stale-while-revalidate relate?", "It is the same idea as an HTTP cache header: serve the old copy for a limited time while fetching a new one in the background."], ["How do you choose the refresh point?", "Refresh time plus safety must fit in the remaining TTL. If a refresh takes 2 s and TTL is 60 s, refreshing from 80% leaves 12 s, which is enough for a retry."]],
    take: "Do not cache what nobody reads, and do not let anybody wait for what everybody reads.",
  }),
  "caching--cache-stampede": lesson({
    intro: "A cache stampede happens when a popular entry expires and **all its readers** run the same expensive query at the same moment.",
    scene: "A home page query takes 2 seconds and is cached for 5 minutes. At 1,000 requests per second, the moment it expires, 2,000 identical queries hit the database before the first one finishes. The database falls over, so no query finishes, so the cache is never filled.",
    parts: [
      ["Why it is dangerous", "It feeds itself: queries slow each other down, the gap grows, and more readers join. It can start from expiry, eviction, restart or a purge."],
      ["Request coalescing (single flight)", "Within one process, the first miss loads and the others wait for the same promise. With 20 servers there are 20 queries rather than 2,000."],
      ["Distributed lock or lease", "Only one server wins the right to load. Others wait briefly, or serve the old value."],
      ["Serve stale", "Keep the old value past its soft expiry and refresh in the background. Nobody waits and the database sees one query."],
      ["Jitter", "Add random seconds to each TTL, so thousands of entries stored together do not expire together."],
    ],
    anim: ["Expiry with and without protection", "u:1000 readers | a:App servers | c:Cache:page fresh | l:Lock:free | d:Database:idle", [
      ["u>c", "hit", "While the entry is fresh, all 1,000 requests per second are hits.", "c=+page fresh; d=idle"],
      ["c", "expires", "The TTL ends.", "c=!empty"],
      ["a>d", "2000 queries", "Every request misses and runs the same 2-second query. Two thousand pile up.", "d=!overloaded"],
      ["d", "timeouts", "Queries time out, so nobody can refill the cache. The outage sustains itself.", "a=!errors; d=!down"],
      ["a>l", "try lock", "With protection: after the next expiry, one server gets the lock.", "l=server 3; d=idle; a=+stale copy; c=~old copy kept"],
      ["l>d", "1 query", "Only that server queries. The others serve the **old copy** meanwhile.", "d=+1 query"],
      ["a>c", "fill + jitter", "The new page is stored for 300 seconds plus a random 0-30.", "c=+page fresh; l=free; u=+no wait"],
    ]],
    example: [
      ["Measure", "Build time 2 s x 1,000 requests per second = 2,000 concurrent identical queries."],
      ["Single flight", "20 servers: at most 20 queries."],
      ["Lock", "One query; others wait up to 100 ms, and then use the stale copy."],
      ["Stale window", "Soft TTL 300 s, hard TTL 3,600 s."],
      ["Test", "Delete the key under full load and watch the number of database queries: it must be 1."],
    ],
    code: `const inFlight = new Map();

function singleFlight(key, load) {
  if (!inFlight.has(key)) {
    inFlight.set(key, load().finally(() => inFlight.delete(key)));
  }
  return inFlight.get(key);          // everyone shares one promise
}

const ttl = 300 + Math.random() * 30;  // jitter`,
    use: "Any key that is both hot and expensive to build.",
    avoid: "Locks around cheap lookups: they add more latency than they save.",
    mistakes: [["Lock without expiry", "If the loader crashes, nobody can load any more. Give the lock a TTL longer than the load."], ["Waiting forever", "Waiters need a timeout and a fallback (stale value, default, error)."], ["Purge all", "Clearing the entire cache during peak causes a stampede on every key at once. Purge by tag, or warm first."]],
    check: "An entry takes 500 ms to build and gets 400 requests per second, on 10 servers. How many queries run at expiry with no protection, with single flight, and with a distributed lock?",
    answer: "None: about 400 x 0.5 = 200 concurrent queries. Single flight per server: 10. Distributed lock: 1.",
    qa: [["What is probabilistic early expiration?", "Each reader refreshes early with a probability that grows as the expiry nears and with the build cost. On average one reader refreshes before expiry, without any lock."], ["How do you protect the database after a full cache restart?", "Warm the hottest keys before opening traffic, ramp up slowly, limit concurrent loads per key and overall, and shed the rest."]],
    take: "When a hot key expires, let one request rebuild it and everyone else wait briefly or use the old copy.",
  }),
  "caching--cache-penetration-and-avalanche": lesson({
    intro: "**Penetration**: requests for things that do not exist always miss the cache. **Avalanche**: many entries vanish at once. Both send traffic straight to the database.",
    scene: "A bot requests `/product/-1`, `/product/-2`... The cache never has them and the database is asked a million times for nothing. The same night, a job has loaded 500,000 entries with a TTL of exactly one hour. At 03:00 they all expire in the same second.",
    parts: [
      ["Penetration defences", "Stop requests for nothing early.", ["**Validate** ids: format, range, signature.", "**Cache the absence**: store 'not found' for 30-60 seconds.", "**Bloom filter** of existing ids: answers 'certainly not' without a lookup.", "**Rate limit** clients with many misses."]],
      ["Avalanche defences", "Spread expiry with jitter, refresh hot keys ahead, replicate the cache, and restart nodes one at a time."],
      ["Breakdown is the third one", "A single very hot key expires: that is the stampede from the previous lesson. Same direction, different cause, different cure."],
      ["Protect the database anyway", "Limit concurrent queries, use circuit breakers, serve stale or degraded content. Assume that some day the cache will be empty."],
    ],
    table: ["THREE FAILURES", ["Problem", "Cause", "Main cure"], [["Penetration", "Keys that do not exist", "Negative caching, Bloom filter"], ["Stampede", "One hot key expires", "Single flight, stale copy"], ["Avalanche", "Many keys vanish together", "TTL jitter, replicas, limits"]]],
    anim: ["Ghost ids, then a mass expiry", "x:Bot, u:Users | a:App | b:Bloom filter:off | c:Cache:500k same TTL | d:Database:calm", [
      ["x>a", "product -1 -2 -3", "The bot asks for ids that do not exist.", "a=lookups"],
      ["a>c", "miss", "The cache has nothing, as there is nothing to store.", "c=miss"],
      ["a>d", "not found x 1M", "Each request reaches the database.", "d=!busy for nothing"],
      ["a>b", "known id?", "A Bloom filter of valid ids is checked first: -1 is **certainly** unknown, so the answer is 404 at once.", "b=+rejects ghosts; d=+calm"],
      ["c", "3h00: all expire", "Second problem: 500,000 entries were stored with the same TTL and expire together.", "c=!empty"],
      ["u>a", "normal traffic", "Every normal request now misses.", "a=~all misses"],
      ["a>d", "avalanche", "The database receives everything at once.", "d=!overloaded"],
      ["a>c", "TTL 3600 +- 600", "Fix: random TTLs spread the expiry over 20 minutes, and a limit of 50 concurrent loads protects the database.", "c=+spread out; d=+50 at a time"],
    ]],
    example: [
      ["Symptom", "Hit rate 60% rather than 97%. 35% of lookups are for unknown ids."],
      ["Validate", "Ids are 10 digits with a check digit: 80% of junk is refused in the gateway."],
      ["Negative cache", "`product:123 = NONE` for 60 seconds; delete it when the product is created."],
      ["Bloom filter", "10 million ids x 10 bits = 12.5 MB, rebuilt hourly, updated on insert."],
      ["Jitter", "`ttl = 3600 + random(-600, 600)`: expiries become flat."],
    ],
    use: "Public endpoints with guessable ids and any bulk-loaded cache.",
    avoid: "Long negative TTLs: a newly created item stays invisible.",
    mistakes: [["Caching errors as absence", "A database timeout is not 'not found'. Cache only confirmed absence."], ["Unbounded ghost keys", "An attacker may fill the cache with millions of negative entries. Use short TTLs, and limits or the filter."], ["One big cache node", "Its failure is an avalanche. Use several nodes and consistent hashing."]],
    check: "You cache 'not found' for 10 minutes. A user creates username `asha`, but the profile page says it does not exist. What happened and what is the fix?",
    answer: "Someone looked up `asha` before (perhaps the sign-up form's check), and the absence was cached. Delete the negative entry when the name is created, and use a much shorter negative TTL (30-60 s).",
    qa: [["Why can't the Bloom filter give a wrong 404?", "It has no false negatives: if it says absent, the id was never added. It must be updated on every insert, before the item becomes visible."], ["How do you roll out a new cache cluster?", "Warm it by dual writes or by copying hot keys, move traffic in steps by key range, and keep the database's concurrency limit in place."]],
    take: "Do not ask the database for ghosts, and do not let everything expire at once.",
  }),
  "caching--distributed-caching": lesson({
    intro: "A distributed cache spreads entries over several machines, so that it is **larger than one server's memory**, survives failures and is shared by all application instances.",
    scene: "One cache server with 64 GB is full and handles 100,000 operations per second, its limit. You add two more. Which server has which key? What happens when one dies? And how do clients find out?",
    parts: [
      ["Partitioning", "Each key belongs to one shard, chosen by consistent hashing or by fixed hash slots (for example 16,384 slots assigned to nodes). Moving slots moves keys in small portions."],
      ["Replication", "Each shard has a replica that takes over on failure. Replication is usually asynchronous, so the last writes may be lost: acceptable for a cache, not for a ledger."],
      ["Who routes?", "Three options.", ["**Smart client:** knows the map, direct connection.", "**Proxy:** simple clients, one more hop.", "**Any node redirects:** the client learns from 'moved' answers."]],
      ["Multi-key operations", "Keys on different shards cannot be used in one atomic command. Put related keys together with a hash tag: `{user42}:cart` and `{user42}:profile`."],
      ["Failure of a shard", "1 of 10 shards down means 10% misses. The database must survive that. Limit loads and fail quickly; do not wait for a dead node."],
    ],
    anim: ["Three shards, one failure", "a:App client:has map | s1:Shard A:0-5460, s2:Shard B:5461-10922, s3:Shard C:10923-16383 | r2:Replica B | d:Database", [
      ["a", "slot 7000", "The client hashes `user:42` to slot 7000 and looks in its map: shard B.", "a=slot 7000 is B"],
      ["a>s2", "GET user:42", "It calls B directly: one hop, half a millisecond.", "s2=+hit"],
      ["s2", "crash", "B dies. A third of the keys is unavailable.", "s2=!down"],
      ["a>d", "miss to DB", "For a few seconds these reads go to the database, with a limit on concurrency.", "d=~33% of reads"],
      ["r2", "promote", "The others agree that B is down, and its replica is promoted.", "r2=+primary B"],
      ["a>r2", "moved", "The client gets an updated map and continues with the replica.", "a=+new map; d=+calm"],
      ["s1>s3", "move slots", "Later, adding a node only moves some slots, a few at a time, while serving.", "s3=+some slots moved"],
    ]],
    example: [
      ["Size", "200 million entries x 600 bytes = 120 GB, + 30% overhead = 156 GB."],
      ["Shards", "6 primaries with 32 GB (26 GB used) + 6 replicas in another zone."],
      ["Throughput", "400,000 operations per second / 6 = 67,000 each: fine."],
      ["Failure", "Losing one primary: 10 s failover, 17% misses x 400k reads = 67k per second. The database can take 15k, so limit loads and serve stale."],
      ["Clients", "Timeout 50 ms, one retry, circuit breaker per shard."],
    ],
    use: "Shared cache beyond one machine, sessions, counters, rate limits.",
    avoid: "Treating it as the only store for data you cannot rebuild.",
    mistakes: [["Modulo hashing", "Adding a node moves nearly all keys: a self-made avalanche."], ["Big values", "One 5 MB value blocks a single-threaded node for everybody. Split or compress it."], ["No client timeouts", "A hanging shard then hangs the whole application. A cache must fail quickly."]],
    check: "You have 4 shards with one replica each, at 70% memory. Two machines fail at once. When do you lose data, and what else can go wrong?",
    answer: "Data is lost only if both copies of the same shard were on these two machines (so spread them by zone). Otherwise replicas are promoted, but remaining machines may hold two primaries and run out of memory or CPU, and redundancy is gone until replaced.",
    qa: [["Cache cluster or local caches?", "Local caches are fastest and free of network, but duplicated and inconsistent. A cluster is shared and larger. Many systems use both: small L1 local, large L2 cluster."], ["How do you add a shard without misses?", "Move slots one by one with key migration while serving, or pre-warm the new shard by reading through both the old and new owner."]],
    take: "Partition for size, replicate for survival, route in the client, and make sure that the database survives losing one shard.",
  }),
  "caching--hot-keys": lesson({
    intro: "A hot key is one entry that gets so many requests that **its single shard** becomes the bottleneck, while all others are idle.",
    scene: "A celebrity announces a concert. Their profile gets 300,000 reads per second. The cache cluster has 20 nodes and could serve 2 million, but this key lives on one node that can do 100,000.",
    parts: [
      ["Detect", "Sample commands on nodes, count keys with a small sketch in the client, watch for uneven CPU or network between nodes. Detection must take seconds."],
      ["Local cache (L1)", "Keep hot keys in the memory of each app server for 1-5 seconds. 200 servers with a 1-second TTL make 200 reads per second in place of 300,000. Usually the best cure."],
      ["Replicate the key", "Store copies `profile:9#0` to `#9` on different shards; readers pick one at random, writers update all."],
      ["Hot writes", "Counters and likes: split into sub-counters, or buffer and write in batches. Reads add up the parts."],
      ["Prevent", "Known events (launch, match) can be pre-warmed and pre-replicated. Unknown ones need automatic detection."],
    ],
    anim: ["Cooling a hot key in three ways", "u:300k reads/s | a1:App 1, a2:App 2 | n1:Node 1:has key, n2:Node 2:idle, n3:Node 3:idle", [
      ["u>a1,a2", "profile:9", "All users want the same profile.", "a1=150k per s; a2=150k per s"],
      ["a1>n1", "150k/s", "The key hashes to node 1, so every server asks node 1.", "n1=~100%"],
      ["a2>n1", "150k/s", "Node 1 is overloaded. Other keys on it suffer, while nodes 2 and 3 are idle.", "n1=!overloaded"],
      ["a1", "L1 cache 1 s", "Cure 1: each server keeps the key for one second in its own memory.", "a1=+L1 hit"],
      ["a2>n1", "1 read/s", "Each server now asks once per second. Users may see data up to one second old.", "a2=+L1 hit; n1=+idle"],
      ["a1>n2,n3", "copies #1 #2", "Cure 2 for larger values: copies under different names live on other nodes, and readers choose at random.", "n2=copy #1; n3=copy #2"],
      ["n1", "likes +1", "Cure 3 for writes: 10 sub-counters on different nodes, added up when reading.", "n1=likes#0; n2=likes#1; n3=likes#2"],
    ]],
    example: [
      ["Signal", "Node 7 has 98% CPU, others 15%."],
      ["Find", "Sampling shows 82% of its commands are for `event:551`."],
      ["Mitigate", "Feature flag: enable L1 for keys with prefix `event:`, TTL 1 s. CPU falls to 12% in ten seconds."],
      ["Automate", "The client counts keys; any key above 1,000 reads per second per server goes to L1 automatically."],
      ["Writes", "View counts are buffered in memory and flushed every second as one increment per server."],
    ],
    code: `const l1 = new Map();                       // key -> { value, until }

async function read(key) {
  const local = l1.get(key);
  if (local && local.until > Date.now()) return local.value;
  const value = await cache.get(key);
  if (hits.increment(key) > 1000)           // hot on this server
    l1.set(key, { value, until: Date.now() + 1000 });
  return value;
}`,
    use: "Celebrity content, live events, configuration read by everyone, global counters.",
    avoid: "L1 for data that must be exact at once, such as remaining stock at checkout.",
    mistakes: [["Adding nodes", "More shards do not split one key. The load stays on one node."], ["Forgetting invalidation", "With 10 copies, a write must update or delete all ten, or wait for a short TTL."], ["Unbounded L1", "Limit its size and keep only hot keys, or every server will copy the whole cache."]],
    check: "500 app servers read one key 2 million times per second. With an L1 TTL of 2 seconds, how many reads per second reach the cache node, and what is the maximum staleness?",
    answer: "Each server reads once per 2 seconds: 500 / 2 = 250 reads per second. Staleness is at most 2 seconds (plus the staleness of the shared cache itself).",
    qa: [["How is a hot key different from a hot shard?", "A hot shard has many moderately busy keys by bad luck or bad key choice; moving keys or resharding helps. A hot key is one key, which no resharding can split."], ["How would you handle a hot row in a database?", "Cache reads, batch or split writes (sub-counters), serialise through a queue, or reserve portions in advance (escrow) to avoid lock contention."]],
    take: "You cannot shard one key. Copy it closer to the readers, and split or batch its writes.",
  }),
};
