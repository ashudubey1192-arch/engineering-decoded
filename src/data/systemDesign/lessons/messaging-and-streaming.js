import { lesson } from "../schema.js";

export default {
  "messaging-and-streaming--delivery-guarantees": lesson({
    intro: "A message can be delivered **at most once**, **at least once**, or processed with an **exactly-once effect**. Which one you get is decided by when you acknowledge and how you handle repeats.",
    scene: "A loyalty service adds points for each order event. After a restart, some customers have double points. Another team 'fixes' the same problem by acknowledging first, and now some customers get no points at all.",
    parts: [
      ["At most once", "Acknowledge **before** processing. A crash in between loses the message. Never duplicated. Fine for metrics or live positions."],
      ["At least once", "Acknowledge **after** processing. A crash in between causes redelivery. Never lost, sometimes repeated. The usual default."],
      ["Exactly-once effect", "The network cannot deliver exactly once, but the **result** can be exactly once: at-least-once delivery plus an idempotent or transactional consumer."],
      ["The producer side", "A producer that times out does not know if the broker stored the message, so it retries. Idempotent producers attach a sequence number, so that the broker drops the repeat."],
      ["End to end", "A chain is as strong as its weakest hop: producer to broker, broker durability (replicas), consumer processing, and the external effect."],
    ],
    table: ["THREE GUARANTEES", ["Guarantee", "Acknowledge", "On crash", "Use for"], [["At most once", "Before work", "Lost", "Metrics, presence"], ["At least once", "After work", "Repeated", "Most jobs, if idempotent"], ["Exactly-once effect", "With the work, atomically", "Repeated but harmless", "Money, stock, counters"]]],
    anim: ["The same crash under three guarantees", "q:Queue:msg 7 | c:Consumer | d:Points:100 | k:Processed ids:none", [
      ["q>c", "msg 7: +10", "At most once: the consumer receives message 7 and acknowledges at once.", "q=empty; c=acked"],
      ["c", "crash", "It crashes before adding the points. The message is gone.", "c=!crashed; d=!100 lost"],
      ["q>c", "msg 8: +10", "At least once: now it adds the points first...", "q=msg 8; c=working; d=110"],
      ["c", "crash before ack", "...and crashes before acknowledging. The queue delivers 8 again.", "c=!crashed; q=~msg 8 again"],
      ["q>c", "msg 8 again", "The points are added twice.", "d=!120"],
      ["c>k", "insert 9", "Exactly-once effect: points and message id are stored in **one transaction**.", "k=9; d=130"],
      ["q>c", "msg 9 again", "After a crash, 9 comes again, but the id already exists, so nothing is added.", "d=+130; k=+9 once"],
    ]],
    example: [
      ["Start", "Consumer with automatic acknowledgement every 5 seconds: losses on crash."],
      ["Change", "Manual acknowledgement after processing: no more losses, 0.1% duplicates at restarts."],
      ["Protect", "Table `processed(message_id primary key)` written in the same transaction as the points."],
      ["Clean up", "Delete ids older than 7 days, the maximum age at which a redelivery can happen."],
      ["Prove", "Kill the consumer 100 times during a test, and compare the sum of points with the events."],
    ],
    code: `BEGIN;
INSERT INTO processed (message_id) VALUES ('evt-9')
  ON CONFLICT DO NOTHING;             -- 0 rows = seen before
-- only if 1 row was inserted:
UPDATE loyalty SET points = points + 10 WHERE user_id = 42;
COMMIT;
-- then acknowledge the message`,
    use: "Designing any consumer: write down the guarantee and test it by crashing.",
    avoid: "Paying for exactly-once where a lost or repeated message is harmless.",
    mistakes: [["Believing the label", "'Exactly once' in a broker covers its own topics. An email or an HTTP call is outside the transaction."], ["Ack in a separate thread", "Automatic acknowledgements on a timer can confirm messages that are still being processed."], ["Ids only in memory", "A restart forgets them, and the redelivery that follows is exactly the case you needed them for."]],
    check: "A consumer calls an external SMS API and then acknowledges. How can you reduce duplicate messages to customers, and can you reach zero?",
    answer: "Store 'sending' with the message id before the call, pass an idempotency key to the API, and store 'sent' after. If the provider supports keys, the effect is once. Without that, a crash between call and record leaves an unknown state, so you must choose between possibly missing and possibly repeated.",
    qa: [["Why is exactly-once delivery impossible?", "The last acknowledgement can always be lost. The sender then must either retry (duplicate) or not (possible loss). Only the receiver can make a duplicate harmless."], ["How do transactional stream processors do it?", "They commit input offsets, state changes and output messages atomically in the same log, so after a failure all three roll back together."]],
    take: "Delivery is at most or at least once; exactly-once is something your consumer achieves.",
  }),
  "messaging-and-streaming--partitioned-logs-and-consumer-groups": lesson({
    intro: "A partitioned log stores messages in ordered, append-only files. Consumers keep their own **offset**, so the same messages can be read by many groups, at different speeds, and again later.",
    scene: "A company's queue deletes each message after reading. The fraud team wants last month's events to train a model: gone. With a log the data is still there, and a new reader simply starts from the beginning.",
    parts: [
      ["Topic, partition, offset", "A topic is divided into partitions. Each partition is an ordered list; a message's position is its offset. Order is guaranteed **within** a partition only."],
      ["Keys choose partitions", "partition = hash(key) mod partitions. All events with the same key (order 7) go to one partition and stay in order."],
      ["Consumer groups", "Within a group each partition is read by exactly one consumer, so work is shared. Different groups are independent: each sees everything."],
      ["Rebalancing", "When a consumer joins or dies, partitions are reassigned. Processing pauses briefly, and uncommitted work is repeated elsewhere."],
      ["Retention and compaction", "Keep by time or size, or **compact**: keep only the newest message per key, which turns the topic into a replayable table."],
      ["Replication", "Each partition has a leader and followers. With acknowledgement from all in-sync replicas, an accepted message survives the loss of a broker."],
    ],
    anim: ["Two groups read three partitions", "p:Producer | t0:P0, t1:P1, t2:P2 | a1:Billing 1, a2:Billing 2, f:Fraud", [
      ["p>t1", "key order7", "The producer hashes the key `order7`, which gives partition 1. All its events will go there.", "t1=order7 @0"],
      ["p>t0", "key order3", "Another order lands on partition 0.", "t0=order3 @0"],
      ["t0>a1", "offset 0", "Group Billing has two consumers. Consumer 1 is assigned P0 and P1.", "a1=P0 P1"],
      ["t2>a2", "idle", "Consumer 2 is assigned P2. A third consumer would get something, but a **fourth would be idle**.", "a2=P2; t2=empty"],
      ["t1>f", "offset 0", "Group Fraud reads the same messages independently, with its own offsets.", "f=P0 P1 P2"],
      ["a1", "crash", "Billing 1 crashes. Its last committed offset on P1 was 0.", "a1=!crashed"],
      ["t1>a2", "from offset 1", "The group rebalances: Billing 2 takes all partitions and continues after the committed offsets. Fraud noticed nothing.", "a2=+P0 P1 P2"],
    ]],
    example: [
      ["Estimate", "60 MB/s incoming; one consumer handles 10 MB/s: at least 6 partitions."],
      ["Leave room", "Choose 12, so that you can double the consumers later. Increasing later changes key placement."],
      ["Pick the key", "`order_id` gives order per order; `country` would put half of the traffic in one partition."],
      ["Durability", "Replication 3, minimum in-sync 2, producer waits for all."],
      ["Watch", "Lag per partition (newest offset - committed offset). Alert on lag in seconds."],
    ],
    use: "Event streams, several independent consumers, replay, high throughput.",
    avoid: "Job queues that need per-message retry, delay or priority.",
    mistakes: [["More consumers than partitions", "The extra ones do nothing. Partitions are the limit of parallelism."], ["Hot key", "One key with half the traffic makes one partition slow. Split it, or handle that key separately."], ["Commit before work", "A crash then skips messages. Commit after processing, and make it idempotent."]],
    check: "A topic has 6 partitions. A group has 4 consumers, each processing 100 messages per second, and 500 arrive per second evenly. Does it keep up? What if you add 4 more consumers?",
    answer: "Two consumers have 2 partitions (about 167 messages per second each) and two have 1 (83). The ones with two partitions are limited to 100 and fall behind. With 8 consumers only 6 get a partition, at 83 per second each: it keeps up, and two are idle.",
    qa: [["Why are logs so fast?", "Sequential appends, batching and compression, zero-copy transfer from the page cache, and no per-message bookkeeping in the broker: consumers hold only an offset."], ["What does log compaction give you?", "The latest value per key remains forever, so a new consumer can rebuild the full current state by reading the topic, as with a table snapshot plus changes."]],
    take: "A log remembers and consumers remember their place. Keys decide order, partitions decide parallelism.",
  }),
  "messaging-and-streaming--message-ordering": lesson({
    intro: "Global order is slow and rarely needed. Most systems need order **per entity**: all events of one order, account or document, in the sequence they happened.",
    scene: "A shipping service receives `cancelled` before `created` for the same order, ignores the unknown cancel, then creates and ships it. The events were right; only their order was lost.",
    parts: [
      ["How order gets lost", "Every step can reorder.", ["Two producers or threads publish at the same time.", "Different partitions are read at different speeds.", "A failed message is retried while later ones proceed.", "One consumer processes in parallel threads."]],
      ["Order per key", "Use the entity id as partition key and one sequential processor per partition. Different keys run in parallel, the same key never does."],
      ["Sequence numbers", "The producer adds a version per entity (1, 2, 3). The consumer ignores older versions and waits for, or fetches, missing ones. This works even over unordered transport."],
      ["Retries versus order", "If message 3 fails you can block its key until it succeeds (order kept, key stuck) or continue and retry later (order broken). Decide for each stream; park only that key if possible."],
      ["Make order matter less", "Send state instead of change: 'status is cancelled, version 5' can be applied in any order by keeping the highest version."],
    ],
    anim: ["Cancel overtakes create, then versions save the day", "o:Order service | q1:Partition 1, q2:Partition 2 | s:Shipping:no order 7 | t:Order 7 state:none", [
      ["o>q1", "created 7", "Without a key, `created` goes to partition 1, which is slow at the moment.", "q1=created 7"],
      ["o>q2", "cancelled 7", "`cancelled` goes to partition 2, which is fast.", "q2=cancelled 7"],
      ["q2>s", "cancelled 7", "Shipping receives the cancel first, for an order it does not know. It ignores it.", "s=~unknown order"],
      ["q1>s", "created 7", "Then `created` arrives and the parcel is sent.", "s=!shipped; t=!shipped"],
      ["o>q1", "key 7: v1 v2", "Fix 1: key = order id. Both events are in the same partition, in order.", "q1=v1 created v2 cancel; q2=other keys; s=waiting"],
      ["q1>s", "v2 again", "Fix 2: versions. Even if v2 comes first it is stored as version 2.", "t=v2 cancelled"],
      ["s>t", "v1 < v2", "When v1 arrives later it is older than the stored version and is ignored.", "t=+v2 cancelled; s=+not shipped"],
    ]],
    example: [
      ["Requirement", "Events of one bank account must be applied in order; accounts are independent."],
      ["Key", "account_id. 100 partitions, so up to 100 accounts are processed in parallel."],
      ["Producer", "One writer per account (row lock), version from the account row, outbox to keep commit order."],
      ["Consumer", "Keeps `last_version`; applies only last_version + 1; on a gap it reads the missing events from the API."],
      ["Failure", "A poison event for account 9 parks account 9 in a retry table; others continue."],
    ],
    use: "State changes of the same entity, ledgers, replication, workflows.",
    avoid: "Forcing total order on independent events: it limits you to a single partition and thread.",
    mistakes: [["Ordering by timestamp", "Clocks differ. Use versions from the owner of the entity."], ["Thread pool in the consumer", "Ten threads on one partition destroy its order. Use one lane per key."], ["Changing partition count", "Keys move to other partitions, so old and new events of a key may be read at once."]],
    check: "Your consumer processes a partition with 8 threads for speed. How can you keep order per key and still use 8 threads?",
    answer: "Send each message to a lane by hash(key) mod 8, with one thread per lane, so the same key always runs in the same thread. Commit the offset only up to the lowest message that all lanes have completed.",
    qa: [["How do you keep order when the producer retries?", "Use an idempotent producer with sequence numbers, or allow one in-flight request. Otherwise batch 2 may succeed before the retry of batch 1."], ["When is total order necessary?", "When every event may affect every other: a single ledger with global constraints, or a replicated state machine. Then one log with a leader defines the order, at limited throughput."]],
    take: "Ask 'order among what?'. Use that as the key, number the events, and let everything else run in parallel.",
  }),
  "messaging-and-streaming--idempotent-consumers": lesson({
    intro: "An idempotent consumer gives the same result whether it sees a message **once or five times**. It is what makes at-least-once delivery safe.",
    scene: "A deploy restarts 40 consumers at once. About 3,000 messages are redelivered. One team notices nothing. Another sends 3,000 duplicate parcels.",
    parts: [
      ["Naturally idempotent", "`SET status = 'paid'`, `PUT` of a full document, upsert by key, delete by id. Design operations as 'make it so' rather than 'change by'."],
      ["Deduplication table (inbox)", "Store the message id with a unique constraint in the **same transaction** as the effect. A duplicate fails the insert and is skipped."],
      ["Version checks", "Apply only if the event's version is newer than the stored one. Also handles out-of-order delivery."],
      ["External effects", "Pass an idempotency key to the other system. If it has none, record intent before and result after, and reconcile the unknown ones."],
      ["Which id?", "Use a **business** id chosen by the producer (order id + event type), not the broker's delivery id, as the latter may change on republish."],
    ],
    anim: ["A duplicate meets an inbox table", "q:Queue | c:Consumer | i:Inbox:empty, s:Stock:10 | m:Mail API", [
      ["q>c", "order7 reserve 2", "The consumer opens a database transaction.", "c=tx open"],
      ["c>i", "insert order7", "It inserts the message id. One row: this is new.", "i=order7"],
      ["c>s", "10 - 2", "It reduces the stock in the same transaction, and commits both.", "s=8; c=committed"],
      ["c>m", "mail key=order7", "The mail is sent with an idempotency key. Then the consumer crashes before acknowledging.", "m=1 mail; c=!crashed"],
      ["q>c", "order7 again", "The message is delivered again after a restart.", "c=tx open"],
      ["c>i", "insert fails", "The unique constraint says: seen before. The stock change is skipped.", "i=+order7 once; s=+8"],
      ["c>m", "mail key=order7", "The mail call is repeated since we do not know whether it happened. The key makes the API ignore it.", "m=+still 1 mail; c=+acked"],
    ]],
    example: [
      ["Find effects", "Stock change (own database), email (external), event to the next topic."],
      ["Own database", "Inbox row + stock update + outbox row in one transaction."],
      ["Next topic", "The outbox relay publishes; the next consumer has its own inbox."],
      ["External", "Email with key `order7-receipt`; the provider removes duplicates within 24 hours."],
      ["Test", "Deliver each message twice in all integration tests; the final state must be identical."],
    ],
    code: `async function handle(message) {
  await db.transaction(async (tx) => {
    const fresh = await tx.query(
      "INSERT INTO inbox (id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id",
      [message.id],
    );
    if (!fresh.rowCount) return;                       // duplicate: do nothing
    await tx.query(
      "UPDATE stock SET qty = qty - $1 WHERE sku = $2 AND qty >= $1",
      [message.qty, message.sku],
    );
    await tx.query("INSERT INTO outbox (type, body) VALUES ($1, $2)",
      ["StockReserved", JSON.stringify(message)]);
  });
  await message.ack();                                 // after commit
}`,
    use: "Every consumer with a side effect.",
    avoid: "Adding an inbox to handlers that are already idempotent by nature.",
    mistakes: [["Check, then act", "SELECT first and INSERT later lets two workers pass the check together. Let the unique constraint decide."], ["Id in a cache with short TTL", "Redelivery after an hour-long outage comes after the cache has forgotten."], ["Marking before the work in another transaction", "A crash after the mark and before the work loses the message for good."]],
    check: "Is `UPDATE accounts SET balance = balance - 30 WHERE id = 5` idempotent? Give two ways to make it so.",
    answer: "No: each repeat subtracts again. 1) Insert a ledger entry with a unique transaction id and derive the balance from entries. 2) Store the message id in an inbox within the same transaction (or a version: `AND version = 12` and set 13).",
    qa: [["How long should you keep inbox ids?", "Longer than the longest possible redelivery, including manual replays: often 7 to 30 days. Partition by day, and drop old partitions."], ["Can a Bloom filter be the deduplication store?", "Only as a first filter. False positives would drop new messages, so a positive must be confirmed in the exact store."]],
    take: "Assume every message comes twice, and let one transaction decide whether its work has already been done.",
  }),
  "messaging-and-streaming--dead-letter-queues": lesson({
    intro: "A dead letter queue (DLQ) is a side queue for messages that **keep failing**. It protects the main flow from one bad message and keeps that message for investigation.",
    scene: "One order contains an emoji in a field that a parser cannot handle. The consumer crashes, restarts, receives the same message and crashes again. 50,000 good orders wait behind it all night.",
    parts: [
      ["Poison messages", "Some failures never succeed: bad format, missing reference, a bug. Retrying forever only blocks and burns resources."],
      ["Transient or permanent", "Retry transient errors (timeout, 503) with growing delays. Send permanent errors (validation) to the DLQ at once. Unknown: retry a few times and then DLQ."],
      ["What to store", "The original message unchanged, plus error, stack, attempt count, time, consumer version and source position. Without context a DLQ is a rubbish bin."],
      ["Operate it", "Alert on the first message or on rate, assign an owner, look at it daily, fix, and **redrive** (send back) with a tool. Set retention longer than a holiday."],
      ["Delayed retries", "Use retry queues with 1, 5 and 30 minute delays so that the main queue keeps flowing between attempts."],
    ],
    anim: ["A poison message leaves the main queue", "q:Main queue:m1 BAD m3 | c:Consumer | r:Retry queue:empty | d:DLQ:empty, o:Owner", [
      ["q>c", "m1", "A good message is processed and acknowledged.", "c=+m1 done; q=BAD m3"],
      ["q>c", "BAD", "The next one fails: cannot parse a date.", "c=!error"],
      ["c>r", "retry in 1 min", "It might be temporary, so it is moved to the retry queue. The main queue is **free**.", "r=BAD try 2; q=m3"],
      ["q>c", "m3", "Good messages continue.", "c=+m3 done; q=empty"],
      ["r>c", "BAD try 2, 3", "The second and third attempts fail the same way.", "c=!error; r=empty"],
      ["c>d", "BAD + error", "After three attempts it goes to the DLQ with the error and version.", "d=~BAD + details"],
      ["d>o", "alert", "The owner is alerted, sees the date format, and releases a fix.", "o=+fixed parser"],
      ["d>q", "redrive", "The message is sent back to the main queue and now succeeds.", "q=BAD; d=+empty; c=+BAD done"],
    ]],
    example: [
      ["Classify", "`ValidationError` is permanent; `TimeoutError` is transient; others: 3 attempts."],
      ["Delays", "1 minute, 5 minutes, 30 minutes, with jitter."],
      ["Alert", "Any message in the payments DLQ pages; more than 50 per hour in emails opens a ticket."],
      ["Triage view", "Group by error text and version, so 400 messages become one bug."],
      ["Redrive", "Filter by error, replay 10, check, then replay the rest at a limited rate."],
    ],
    use: "Every queue where one bad message must not block the others.",
    avoid: "Strictly ordered streams without thought: skipping a message may corrupt the state of its key. Park the key instead.",
    mistakes: [["Nobody reads it", "A DLQ without an alert and an owner is data loss with a delay."], ["Redriving everything at once", "If the cause remains, they all fail again; if it is fixed, the burst may overload the system."], ["DLQ for outages", "When a dependency is down for an hour, all messages would move to the DLQ. Pause consumption instead (circuit breaker)."]],
    check: "Your payment consumer's dependency is down for 20 minutes. With 3 quick retries all messages go to the DLQ. What would you change?",
    answer: "Treat it as a transient failure of the dependency, not of the messages: open a circuit breaker and pause consuming (messages wait safely in the queue), or use longer delays. Only message-specific permanent errors should go to the DLQ.",
    qa: [["How is a DLQ done with a log-based broker?", "The broker cannot skip a single message, so the consumer itself publishes the failed message to a DLQ topic and commits the offset. Retry topics with delays work in the same way."], ["Should DLQ messages be fixed by hand?", "Prefer fixing the consumer and replaying the original. If data must be corrected, keep the original and an audit record of the change."]],
    take: "Retry what may heal, park what will not, keep the evidence, and make sure somebody looks.",
  }),
  "messaging-and-streaming--backpressure": lesson({
    intro: "Backpressure is a signal from a slow part to a fast part: **slow down**. Without it, the difference piles up in memory until something breaks.",
    scene: "An import service reads a file at 50,000 rows per second and writes to a database that accepts 5,000. It looks fine for two minutes. Then memory is full, garbage collection takes over, and the process dies at row six million with nothing to show.",
    parts: [
      ["Four choices", "When input exceeds capacity there are only four options.", ["**Slow the producer** (backpressure).", "**Buffer** for a while (only for bursts).", "**Drop** something (sampling, load shedding).", "**Add capacity** (takes time)."]],
      ["Bounded buffers", "Every queue needs a maximum. A full queue that blocks or rejects is the signal. Unbounded queues turn overload into latency and then into a crash."],
      ["How the signal travels", "TCP's receive window, HTTP 429 and 503, pull-based consumers, credits in stream protocols, blocking `put`, `await writer.ready`. It must reach the original source."],
      ["At the edge", "Users cannot be slowed politely. There, backpressure becomes rejection: rate limits and load shedding with a clear answer."],
      ["Latency view", "Waiting time = queue length / throughput. If a request is useless after 2 seconds and you handle 100 per second, a queue longer than 200 only does useless work."],
    ],
    anim: ["A buffer without and with a limit", "r:Reader:50k per s | q:Buffer:0 | w:Writer:5k per s | d:Database", [
      ["r>q", "50k rows/s", "The reader is ten times faster than the writer.", "q=50k"],
      ["q>w", "5k rows/s", "The writer takes 5,000 per second, so the buffer grows by 45,000 each second.", "w=busy; d=5k per s"],
      ["q", "after 60 s", "After one minute it holds 2.7 million rows.", "q=~2.7M rows"],
      ["q", "out of memory", "The process is killed and everything in the buffer is lost.", "q=!crash; r=stopped"],
      ["r>q", "limit 10k", "Second attempt: the buffer holds at most 10,000 rows.", "q=10k full; r=50k per s"],
      ["q>r", "wait", "When it is full, `put` **waits**. The reader is now exactly as fast as the writer.", "r=+5k per s"],
      ["q>w", "steady", "Memory stays constant and the job finishes, at the speed of its slowest part.", "w=+steady; d=+5k per s; q=+10k max"],
    ]],
    example: [
      ["Measure each stage", "Read 50k, parse 30k, write 5k rows per second."],
      ["Bound the buffers", "1,000 rows between read and parse, 10,000 between parse and write."],
      ["Speed up the bottleneck", "Batch inserts of 500 rows: write 25k per second."],
      ["Result", "Backpressure settles the whole pipeline at 25k per second with constant memory."],
      ["Observe", "Time blocked on each buffer shows the next bottleneck."],
    ],
    code: `// Node streams: respect the return value of write()
for await (const row of source) {
  if (!writer.write(row)) await once(writer, "drain");   // wait until it has room
}

// bounded queue between two workers
const queue = new BoundedQueue(10_000);
await queue.put(row);    // waits while full
const next = await queue.take();`,
    use: "Pipelines, streams, queues, proxies, and anything with stages of different speed.",
    avoid: "Blocking a thread that serves other users: there, reject quickly.",
    mistakes: [["Bigger buffer as fix", "It moves the crash from minute two to minute twenty and adds latency."], ["Signal stops halfway", "A bounded queue in front of an unbounded one protects nothing. Trace it to the source."], ["Fire and forget promises", "Starting a million async writes without waiting is an unbounded queue in disguise."]],
    check: "Requests arrive at 120 per second, capacity is 100 per second and clients give up after 3 seconds. How long should the queue be at most, and what happens to the rest?",
    answer: "Waiting time is length / 100, so a queue longer than about 300 (less the service time) only serves clients that have gone. Use a bit less, e.g. 200, and reject the surplus of about 20 per second at once with 503/429.",
    qa: [["How does TCP implement backpressure?", "The receiver advertises how much buffer it has left (window). When the application does not read, the window goes to zero and the sender must stop."], ["LIFO or FIFO when overloaded?", "Under overload LIFO serves the newest requests, whose clients are still waiting, while the old ones time out. Adaptive queues switch to LIFO when the delay grows."]],
    take: "Every queue needs a limit, and every limit needs a way to tell the source.",
  }),
  "messaging-and-streaming--choosing-a-queue-or-a-log": lesson({
    intro: "A **queue** distributes tasks and forgets them. A **log** records events and remembers them. Many design mistakes come from using one where the other fits.",
    scene: "A team uses a log for image resizing. One image takes ten minutes and blocks its whole partition. Another team uses a queue for order events, and when a third service needs them, the events are already gone.",
    parts: [
      ["Queue strengths", "Per-message acknowledgement, retry, delay, priority and dead-lettering. Any free worker takes the next message, so a slow one blocks nobody. Scale by adding workers."],
      ["Log strengths", "Order per key, replay, many independent consumer groups, very high throughput, long retention."],
      ["Queue limits", "Messages disappear after processing, order is weak with several workers, and each extra consumer type needs its own queue."],
      ["Log limits", "Parallelism is bound by partitions, one slow message delays its partition, and there is no built-in per-message retry or delay."],
      ["Using both", "Events in a log as the source of truth; consumers that need job semantics copy work into their own queue."],
    ],
    table: ["DECISION GUIDE", ["Question", "Queue", "Log"], [["Task or fact?", "Do this", "This happened"], ["Readers", "One type", "Many types"], ["Replay", "No", "Yes"], ["Slow single message", "Harmless", "Blocks partition"], ["Order per key", "Limited", "Natural"], ["Delay or priority", "Yes", "Build it yourself"]]],
    anim: ["A slow job in a queue and in a log", "p:Producer | q:Queue:J1 J2 J3, l:Log P0:J1 J2 J3 | w1:Worker 1, w2:Worker 2, c:Log consumer | n:New service", [
      ["q>w1", "J1 (10 min)", "Queue: worker 1 takes the slow job.", "w1=J1 busy; q=J2 J3"],
      ["q>w2", "J2 and J3", "Worker 2 takes the others at once. The slow job delays nobody.", "w2=+J2 J3 done; q=empty"],
      ["l>c", "J1 (10 min)", "Log: one consumer owns the partition and must go in order.", "c=~J1 busy"],
      ["l", "J2 J3 wait", "J2 and J3 wait ten minutes behind J1, even if other consumers are idle.", "l=!J2 J3 blocked"],
      ["q>n", "past jobs?", "A new service wants the history. In the queue there is nothing: messages were deleted.", "n=!nothing"],
      ["l>n", "from offset 0", "In the log it reads everything from the start, without disturbing others.", "n=+full history"],
      ["p>l", "fact, then task", "Combine: publish the **fact** to the log, and let the image service put **tasks** into its own queue.", "l=+events; q=+tasks"],
    ]],
    example: [
      ["Order placed", "A fact with many readers (billing, stock, analytics): log, key = order id."],
      ["Send email", "A task, independent, needs retry and delay: queue."],
      ["Resize image", "A task of varied length: queue with several workers."],
      ["Clickstream", "High volume, replay for new models: log with 7 days retention."],
      ["Bank ledger", "Order per account and audit: log with long retention, plus a database."],
    ],
    use: "Every time you draw an arrow between two services.",
    avoid: "Adding a second broker for a small system: one product used carefully can often do both.",
    mistakes: [["Log as a job queue", "Long jobs cause rebalances and blocked partitions."], ["Queue as event bus", "Every new consumer needs changes at the producer or a fan-out layer."], ["Choosing by brand", "Compare needs (replay, order, delay, fan-out, throughput) before products."]],
    check: "You must process 5,000 video transcodes per day (1 to 60 minutes each), and also inform three teams when a video is ready. What would you use for each, and why?",
    answer: "Transcoding: a queue, as jobs vary a lot in length and need retries and flexible workers. 'VideoReady': a log (or pub/sub), because it is a fact with several independent readers that may want to replay.",
    qa: [["Can a queue preserve order?", "With message groups: only one message per group is in flight at a time. Throughput per group is limited, but different groups run in parallel."], ["How do you delay a message in a log system?", "Write to a delay topic and let a scheduler republish when due, store due times in a database, or use a queue that supports delays for this part."]],
    take: "Tasks go to queues, facts go to logs.",
  }),
};
