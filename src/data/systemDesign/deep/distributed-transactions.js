import { deep } from "../schema.js";

export default {
  "distributed-transactions--the-problem-with-distributed-transactions": deep({
    anim: ["A crash between two databases", "o:Order service | od:Order DB:empty | pd:Payment DB:empty | u:User", [
      ["o>od", "INSERT order", "Step 1 commits in the order database: order 7 is confirmed.", "od=order 7"],
      ["o>pd", "charge", "Step 2 should write in **another** database, with its own log and its own commit.", "pd=waiting"],
      ["o", "crash", "The service crashes between the two commits.", "o=!crashed"],
      ["od>u", "order confirmed", "Neither database sees a problem. Each transaction was perfectly atomic by itself.", "od=order 7; pd=!no payment; u=free goods"],
      ["o>pd", "reverse order?", "Charging first only swaps the damage: money taken with no order.", "pd=~charged; od=!no order"],
      ["o", "choose a pattern", "You need either a shared commit protocol (2PC), or steps that can be completed or undone later (saga, outbox).", "o=+saga + outbox"],
    ]],
    more: [
      ["Dual writes everywhere", "Database plus message broker, database plus cache, database plus search: every pair of separate writes has this gap, not only two databases."],
      ["Four options", "Avoid (put both in one database), 2PC (atomic but blocking), saga (compensate), transactional outbox (one local write, reliable follow-up)."],
      ["Reconciliation", "Whatever you choose, a job that compares both sides and repairs differences is the final safety net, and it also measures how well the pattern works."],
    ],
    use: "Whenever one action must change two systems.",
    avoid: "Splitting data that always changes together: keep it in one transaction.",
    answer: "A database can only control its own log, locks and commit. It cannot force another database to commit or roll back, so a crash or failure between the two commits leaves one done and the other not.",
    qa: [
      ["Is calling the second service inside the first transaction a solution?", "No. The call can succeed and then the local commit can fail, or the call may time out with an unknown result, and the transaction holds locks during network waits."],
      ["How do you avoid a distributed transaction by design?", "Redraw boundaries so that the invariant lives in one service, use reservations, or accept a pending state that completes asynchronously."],
    ],
  }),
  "distributed-transactions--two-phase-commit-2pc": deep({
    anim: ["2PC with a coordinator crash", "c:Coordinator | l:Decision log:empty | a:Bank A:bal 100, b:Bank B:bal 20", [
      ["c>a,b", "prepare", "Phase 1: can you commit? Each does the work, writes it to its log, and **locks** the rows.", "a=prepared lock; b=prepared lock"],
      ["a>c", "yes", "A yes vote is a promise: it can commit later, whatever happens.", "c=1 of 2 yes"],
      ["b>c", "yes", "All voted yes. The decision is made when it is written to the coordinator's log.", "c=2 of 2 yes"],
      ["c", "crash", "The coordinator crashes before telling anyone.", "c=!crashed"],
      ["a", "in doubt", "A may not commit (B might have said no) and may not abort (the decision may be commit). It **waits with locks held**.", "a=!blocked; b=!blocked"],
      ["c>l", "recover", "The coordinator restarts and finds the decision in its log, or aborts if there is none.", "l=commit; c=+recovered"],
      ["c>a,b", "commit", "Phase 2: both commit and release their locks.", "a=+bal 50; b=+bal 70"],
    ]],
    more: [
      ["Cost", "Two round trips, several forced log writes, and locks for the whole time. One slow participant slows everyone."],
      ["Making it safer", "Replicate the coordinator and each participant with consensus. Then a crash of one machine no longer blocks: modern distributed SQL works this way."],
      ["Heuristic decisions", "Operators sometimes force a stuck participant to commit or abort. It frees locks and may break atomicity, so record and reconcile."],
    ],
    use: "Few participants, short transactions, strong atomicity, and one administrative domain.",
    avoid: "Across companies, over slow links, or with high contention.",
    answer: "After voting yes they have promised to commit if told so, yet they do not know the decision. Committing could contradict an abort and aborting could contradict a commit. So they must hold the locks until the coordinator (or its log) tells them.",
    qa: [
      ["What if a participant crashes after voting yes?", "On restart it finds the prepared record in its log, re-acquires its locks and asks the coordinator for the decision."],
      ["Is 2PC a consensus algorithm?", "It solves atomic commit and needs every participant to answer, so it blocks on failure. Consensus needs only a majority. Combining both gives non-blocking atomic commit."],
    ],
  }),
  "distributed-transactions--three-phase-commit-3pc": deep({
    anim: ["The extra phase, and where it still fails", "c:Coordinator | a:Part A, b:Part B | n:Network", [
      ["c>a,b", "can commit?", "Phase 1: everyone votes yes, without locking for the long term yet.", "a=yes; b=yes"],
      ["c>a,b", "pre-commit", "Phase 2: **everyone voted yes** is announced. Receiving it proves that nobody voted no.", "a=pre-committed; b=pre-committed"],
      ["c", "crash", "The coordinator crashes before the final commit.", "c=!crashed"],
      ["a>b", "state?", "The survivors compare: both are pre-committed, so commit is the only possible decision.", "a=+commit; b=+commit"],
      ["n", "partition instead", "Now assume a partition: A received pre-commit and B did not.", "n=!split; a=pre-committed; b=~only yes"],
      ["b", "timeout: abort", "B times out and aborts, while A times out and commits. Under partitions 3PC loses atomicity.", "b=!aborted; a=!committed"],
    ]],
    more: [
      ["Assumption", "3PC is safe when failures are crashes and delays are bounded. Real networks give no bound, which is why it is rarely used."],
      ["What people use", "2PC with replicated coordinators, or sagas. They give up latency or isolation, but not safety in a partition."],
      ["Lesson", "Timeouts can tell you that something is slow, never that it is dead. Protocols that act on a timeout as if it were proof break."],
    ],
    use: "Learning why non-blocking commit is hard.",
    avoid: "Production use on ordinary networks.",
    answer: "A participant in pre-commit knows that all voted yes, so if the coordinator vanishes the survivors can safely agree to commit; if nobody is in pre-commit, they can abort. In 2PC a participant that voted yes cannot tell which of the two happened.",
    qa: [
      ["Why does 3PC need an extra round trip?", "To separate 'everybody agreed' from 'do it now', so that no participant can commit while another is still uncertain."],
      ["Which protocol survives partitions?", "Consensus-based commit (Paxos Commit, or 2PC over Raft groups): decisions need a majority, so a minority waits without contradicting."],
    ],
  }),
  "distributed-transactions--saga-pattern": deep({
    anim: ["A trip booking that compensates", "s:Saga | f:Flight, h:Hotel, c:Car | u:User", [
      ["s>f", "book flight", "Step 1 commits locally at once. Other users can already see the seat as taken.", "f=+booked"],
      ["s>h", "book hotel", "Step 2 commits locally as well.", "h=+booked"],
      ["s>c", "book car", "Step 3 fails: no cars left.", "c=!failed"],
      ["s>h", "cancel hotel", "The saga runs compensations **in reverse order**.", "h=~cancelled"],
      ["s>f", "cancel flight", "Cancelling is a new business action (perhaps with a fee), not a database rollback.", "f=~cancelled"],
      ["s>u", "trip failed", "The user is told once everything is undone. In between, others could see the half-booked trip.", "u=no trip; s=+consistent"],
    ]],
    more: [
      ["Orchestration or choreography", "An orchestrator holds the state and tells each step what to do: visible and testable. Choreography reacts to events: less coupling, harder to follow."],
      ["Countering missing isolation", "Pending states, semantic locks (reserved), re-checking values before the final step, ordering risky steps late, and making the non-undoable step last."],
      ["Compensations can fail", "They must be idempotent and retried until they succeed, and end in a human queue if they cannot."],
    ],
    use: "Business processes across services that can be undone.",
    avoid: "Invariants that must never be visible as broken, or steps that cannot be compensated.",
    answer: "Every step commits locally before the next begins, so its effects are visible at once. Until the saga finishes or compensates, others can see, for example, a booked hotel for a trip that will be cancelled.",
    qa: [
      ["What is a pivot step?", "The point of no return. Steps before it can be compensated; steps after it must be retryable until success. Put the irreversible action there, e.g. capturing the payment."],
      ["How do you keep saga state through crashes?", "Persist each transition before acting, use an outbox for commands, make steps idempotent, and resume from the last stored state."],
    ],
  }),
  "distributed-transactions--outbox-pattern": deep({
    anim: ["One local transaction, then reliable publishing", "a:Order service | d:orders table:empty, x:outbox table:empty | r:Relay | k:Broker | c:Consumer", [
      ["a>d", "BEGIN, insert", "The order is inserted inside a transaction.", "d=order 7"],
      ["a>x", "insert event", "The event row is inserted in the **same** transaction. Both commit or neither does.", "x=OrderPlaced 7"],
      ["a", "crash", "The service crashes immediately after commit. The event is safe in the table.", "a=!crashed"],
      ["r>x", "read unsent", "A relay (poller or change capture) finds the unsent row.", "r=event 7"],
      ["r>k", "publish 7", "It publishes, then crashes before marking the row as sent.", "k=event 7; r=~crashed"],
      ["r>k", "publish 7 again", "After restart it publishes again: at-least-once.", "k=~event 7 x2; r=+running; x=sent"],
      ["k>c", "7 and 7", "The consumer remembers processed ids (an inbox table) and ignores the duplicate.", "c=+handled once"],
    ]],
    more: [
      ["Polling or log capture", "Polling is simple, with a small delay and load. Change capture reads the database log: near real-time, no polling, but more infrastructure."],
      ["Order", "Publish by sequence per aggregate and use the aggregate id as the partition key, so that consumers see one order's events in order."],
      ["Housekeeping", "Delete or partition sent rows, monitor the age of the oldest unsent row, and keep event payloads small."],
    ],
    use: "A database change must reliably lead to a message.",
    avoid: "Fire-and-forget notifications where an occasional loss is fine.",
    answer: "Because the event row and the data change commit atomically in one database, there is no moment where the data is saved and the event is not. The relay keeps retrying until the broker accepts it, so it may be sent twice but never lost.",
    qa: [
      ["Why not publish first and then write the database?", "If the write fails, consumers act on something that never happened. Publishing after the write has the opposite gap. Only one atomic write removes both."],
      ["What is the inbox pattern?", "The consumer stores message ids in its own database in the same transaction as its work, so a redelivered message is recognised and skipped."],
    ],
  }),
};
