import { deep } from "../schema.js";

export default {
  "consensus-and-coordination--consensus-algorithms": deep({
    anim: ["Why two majorities must overlap", "p1:Proposer Red, p2:Proposer Blue | a:Acceptor A, b:Acceptor B, c:Acceptor C | l:Learner", [
      ["p1>a,b", "propose Red", "Red reaches A and B. Two of three is a majority.", "a=Red; b=Red"],
      ["a>l", "Red chosen", "Once a majority has accepted, the value is chosen for good.", "l=+Red"],
      ["p2>b,c", "propose Blue", "Blue also needs a majority. Any two acceptors include A or B.", "c=no value"],
      ["b>p2", "already Red", "B tells Blue that it already accepted Red. This overlap is the whole trick.", "p2=~learns Red"],
      ["p2>b,c", "propose Red", "Blue must now propose **Red** as well, so the decision cannot be reversed.", "b=Red; c=Red"],
      ["c>l", "still Red", "Every later majority contains someone who knows the decision.", "l=+Red forever"],
    ]],
    more: [
      ["Four properties", "Agreement (no two decide differently), validity (the value was proposed), integrity (decide once) and termination (eventually decide). The first three are safety and the last is liveness."],
      ["FLP result", "In a fully asynchronous network with even one crash, no deterministic algorithm can always terminate. Real systems use timeouts and randomness to make progress, and never give up safety."],
      ["Cost", "Each decision needs about one round trip to a majority and a disk flush. Batching and pipelining many commands per round makes it practical."],
    ],
    use: "Leader election, configuration, locks, replicated logs, atomic commit.",
    avoid: "High-volume data that tolerates weaker guarantees. Put only metadata through consensus.",
    answer: "Each majority contains more than half of the nodes, so any two share at least one. That shared node accepted the first proposal, and the protocol rules stop it from supporting a conflicting one, so two different proposals can never both be finalized.",
    qa: [
      ["How many failures does a cluster of N tolerate?", "Crash failures: floor((N-1)/2), so 3 tolerate 1 and 5 tolerate 2. Byzantine failures need 3f+1 nodes for f liars."],
      ["Why not use consensus for everything?", "Every operation then waits for a majority round trip and goes through one log, limiting throughput and adding latency, especially between regions."],
    ],
  }),
  "consensus-and-coordination--paxos-algorithm": deep({
    anim: ["Two phases with a crash in between", "p1:Proposer 1, p2:Proposer 2 | a:Acceptor A, b:Acceptor B, c:Acceptor C", [
      ["p1>a,b", "prepare 5", "Phase 1: proposer 1 picks number 5 and asks a majority for a promise.", "p1=n = 5"],
      ["a>p1", "promise 5", "A and B promise to ignore anything below 5. Neither has accepted a value yet.", "a=promised 5; b=promised 5"],
      ["p1>a", "accept 5 X", "Phase 2: it asks for X, but only A receives it before proposer 1 crashes.", "a=accepted 5 X; p1=!crashed"],
      ["p2>a,b,c", "prepare 8", "Proposer 2 takes over with a higher number.", "a=promised 8; b=promised 8; c=promised 8"],
      ["a>p2", "I accepted 5 X", "A reports the value it accepted earlier.", "p2=~must use X"],
      ["p2>b,c", "accept 8 X", "Proposer 2 must propose **X**, the highest-numbered value it heard of, not its own.", "b=accepted 8 X; c=accepted 8 X"],
      ["b>p2", "X chosen", "A majority accepted X. Whatever had been possibly chosen is preserved.", "p2=+X chosen"],
    ]],
    more: [
      ["Multi-Paxos", "Running both phases per value is slow. A stable leader does phase 1 once and then only phase 2 per log entry: one round trip."],
      ["Duelling proposers", "Two proposers can keep outbidding each other forever. Random backoff or a distinguished leader ensures progress."],
      ["What must be durable", "Promises and accepted values must be flushed to disk before answering. A node that forgets its promise after a restart breaks safety."],
    ],
    use: "Understanding the foundation of consensus, or systems built on Multi-Paxos variants.",
    avoid: "Writing your own for production. Use a proven implementation.",
    answer: "The promise phase tells the proposer about any value already accepted by that majority and blocks older proposals there. If accept went to a group not overlapping it, an older value accepted elsewhere could be missed and two values chosen. Overlap guarantees that the earlier choice is seen.",
    qa: [
      ["Why must the new proposer adopt the old value?", "The old value may already be chosen by a majority that the proposer cannot fully see. Adopting the highest-numbered accepted value guarantees it never contradicts a possible decision."],
      ["How do proposal numbers stay unique?", "Combine a counter with the node id, for example (8, node 2), and always choose a number larger than any seen."],
    ],
  }),
  "consensus-and-coordination--raft-algorithm": deep({
    anim: ["Election and log repair after a crash", "c:Client | a:Node A:leader t1, b:Node B:log 1 2, d:Node D:log 1", [
      ["a", "leader crashes", "The leader of term 1 crashes. Heartbeats stop.", "a=!crashed"],
      ["b", "timeout 190 ms", "B's randomised timer fires first. It moves to term 2 and becomes a candidate.", "b=candidate t2"],
      ["b>d", "vote? log len 2", "D compares logs: B's is at least as up to date as its own, so it grants its vote.", "d=+voted B"],
      ["b", "2 of 3 votes", "B has a majority and becomes leader. It already holds **every committed entry**.", "b=+leader t2"],
      ["c>b", "set y = 4", "A client write is appended as entry 3 of term 2.", "b=log 1 2 3"],
      ["b>d", "append 3", "D is missing entry 2, so it refuses. The leader steps back and sends 2 and 3.", "d=log 1 2 3"],
      ["b>c", "committed", "Two of three hold entry 3: committed. When A returns it is a follower, and its log is repaired to match.", "c=+ok; a=follower t2"],
    ]],
    more: [
      ["Commit rule detail", "A leader only counts majorities for entries of its **own** term. Older entries become committed indirectly, which avoids a subtle overwrite bug."],
      ["Reads", "Reading from the leader is not enough: it may be deposed. Confirm leadership with a heartbeat round (read index) or rely on a bounded lease."],
      ["Membership and snapshots", "Add or remove one node at a time (or joint consensus). Snapshots cut the log; slow followers receive the snapshot."],
    ],
    use: "Replicated state machines: metadata stores, distributed SQL, brokers.",
    avoid: "Cross-continent clusters with tight write latency, or more than about seven voters.",
    answer: "If all nodes had the same timeout, they would become candidates together, split the votes and repeat. Random timeouts make one node start earlier and win before others wake up, so elections normally end in one round.",
    qa: [
      ["What happens to an uncommitted entry of a crashed leader?", "It may be overwritten by the new leader, or kept if a node holding it becomes leader. The client got no success reply, so either result is valid. It should retry with an id."],
      ["Why can a node with an old log not become leader?", "Voters refuse candidates whose last entry is older or whose log is shorter. A committed entry is on a majority, so some voter in any majority will refuse."],
    ],
  }),
  "consensus-and-coordination--leader-election": deep({
    anim: ["Electing a scheduler with a lease", "a:Worker A, b:Worker B | l:Lease store:free | j:Jobs", [
      ["a>l", "create if absent", "Both workers try to create the lease key. The store lets only one succeed.", "l=A until +10s"],
      ["a>j", "run jobs", "A is the leader and runs the scheduled jobs.", "a=+leader; j=by A"],
      ["a>l", "renew every 3s", "A renews in time. B watches the key and waits.", "b=watching"],
      ["a", "paused 15s", "A freezes and misses its renewals.", "a=~paused"],
      ["b>l", "lease expired", "After 10 seconds the key disappears, and B creates it with epoch 2.", "l=B epoch 2; b=+leader"],
      ["a>j", "epoch 1 job", "A wakes and still **thinks** that it leads. Jobs accept epoch 2 only, so the late work is refused.", "j=+by B; a=!rejected"],
    ]],
    more: [
      ["Self-check", "A leader should stop by itself when it could not renew for, say, two thirds of the lease, measured with a monotonic clock."],
      ["Avoid needing a leader", "Idempotent jobs, partitioned work, or conditional writes can remove the need. A leader is a throughput and availability limit."],
      ["Healthy failover", "Measure how long leadership changes take, warm the standby, and avoid flapping with a minimum time between changes."],
    ],
    use: "Exactly one node should act: schedulers, partition assignment, primary databases.",
    avoid: "Work that can be partitioned or made idempotent.",
    answer: "Its knowledge is local and old. It may have been paused or cut off while its lease expired and others elected a new leader. Until it contacts the group it cannot know, so the resource must check a term or fencing token.",
    qa: [
      ["How long should a lease be?", "Longer than normal pauses and network hiccups, and shorter than the outage you can accept. 10-30 seconds is common, renewed at a third of it."],
      ["Bully algorithm or consensus based?", "Bully assumes reliable failure detection and can elect two leaders in a partition. Consensus-backed leases stay safe, so use those in production."],
    ],
  }),
  "consensus-and-coordination--distributed-locks": deep({
    anim: ["A paused lock holder and a fencing token", "a:Client A, b:Client B | l:Lock service | s:Storage:last token 32", [
      ["a>l", "lock, TTL 10s", "A obtains the lock with fencing token **33**.", "l=A token 33"],
      ["a", "GC pause 15s", "A stops for 15 seconds before writing.", "a=~paused"],
      ["l", "TTL expired", "The lock expires, as it must, or a crashed client would block everyone.", "l=free"],
      ["b>l", "lock", "B obtains the lock with token **34**.", "l=B token 34"],
      ["b>s", "write, token 34", "B writes. Storage remembers the highest token it has seen.", "s=last token 34; b=+written"],
      ["a>s", "write, token 33", "A wakes, believes it still holds the lock and writes. 33 < 34, so storage **rejects** it.", "a=!rejected; s=+protected"],
    ]],
    more: [
      ["Efficiency or correctness", "If the lock only avoids duplicate work, a simple TTL key is fine. If it protects correctness, you need consensus-backed locks with fencing."],
      ["Release safely", "Delete only if the value is still your own random id, atomically. Otherwise you may release someone else's lock."],
      ["Alternatives", "Conditional updates, unique constraints, SELECT FOR UPDATE, partitioned queues: usually simpler and checked by the data store itself."],
    ],
    use: "Coordinating rare, exclusive operations over systems that cannot coordinate themselves.",
    avoid: "Hot paths, long critical sections, or where a database constraint can do the job.",
    answer: "The TTL can end while the holder is paused or slow, so a second client gets the lock and both may write. A fencing token is a number that increases with each grant; the resource refuses any write with an older token, so the late holder cannot do damage.",
    qa: [
      ["How do you choose a lock's TTL?", "A few times the expected hold time, with renewal by a watchdog while the work runs. Keep the critical section short."],
      ["Is a lock in a single Redis node safe?", "It is fine for efficiency. If the node fails over to a replica that missed the write, two clients can hold the lock, so do not rely on it for correctness."],
    ],
  }),
  "consensus-and-coordination--gossip-protocol": deep({
    anim: ["A rumour reaches eight nodes in three rounds", "a:Node 1:knows X | b:Node 2, c:Node 3 | d:Node 4, e:Node 5 | f:Nodes 6-7, g:Node 8", [
      ["a>b", "X", "Round 1: node 1 tells one random peer. Two nodes know.", "b=knows X"],
      ["a>c", "X", "Round 2: both informed nodes tell one peer each.", "c=knows X"],
      ["b>d", "X", "Now four nodes know. The number doubles each round.", "d=knows X"],
      ["c>e", "X", "Round 3: four nodes tell four more.", "e=knows X"],
      ["d>f", "X", "Each node still sends only **one** message per round, whatever the cluster size.", "f=know X"],
      ["e>g", "X", "Eight nodes after 3 rounds; a thousand after about 10. Duplicates are harmless.", "g=+knows X"],
    ]],
    more: [
      ["Push, pull, push-pull", "Push spreads fast at first, pull finishes the last few quickly, and push-pull combines them. Anti-entropy compares digests to repair anything missed."],
      ["Membership (SWIM)", "Probe a random node; if silent ask others to probe; mark suspect, then dead. Incarnation numbers let a live node refute the rumour."],
      ["Limits", "Delivery is probabilistic and delayed by a few rounds, and state per node grows with cluster size. Not for decisions that need agreement."],
    ],
    use: "Membership, failure detection, config and load information in large clusters.",
    avoid: "Strong agreement, ordering, or instant propagation.",
    answer: "In each round every informed node tells another, so the informed count roughly doubles: log2(N) rounds. Each node sends a fixed number of messages per round regardless of N, so its load stays constant.",
    qa: [
      ["How does gossip handle a node that missed messages?", "Later rounds and pull-based anti-entropy exchange digests (versions or hashes) and fetch the differences, so all converge."],
      ["How do you stop old information from coming back?", "Attach versions or incarnation numbers, keep newer over older, and keep tombstones for removed nodes for a while."],
    ],
  }),
  "consensus-and-coordination--crdts": deep({
    anim: ["A grow-only counter merged in any order", "u1:User 1, u2:User 2 | a:Replica A:{A0 B0}, b:Replica B:{A0 B0} | m:Merged", [
      ["u1>a", "+3 likes", "Each replica increments only its **own** slot. A has 3.", "a={A3 B0}"],
      ["u2>b", "+2 likes", "While disconnected, B counts 2 in its own slot.", "b={A0 B2}"],
      ["a>b", "send {A3 B0}", "Merge takes the **maximum per slot**: A = max(0,3), B = max(2,0).", "b={A3 B2}"],
      ["a>b", "send again", "The same message arrives twice. Max(3,3) is still 3: duplicates are harmless.", "b=+{A3 B2}"],
      ["b>a", "send {A3 B2}", "In the other direction the result is the same. Order does not matter.", "a=+{A3 B2}"],
      ["a>m", "3 + 2 = 5", "The value is the sum of slots: 5 everywhere, with no coordination and no lost increment.", "m=+5 likes"],
    ]],
    more: [
      ["Merge law", "Merge must be commutative (order), associative (grouping) and idempotent (repeats). Any structure with these properties converges."],
      ["Useful types", "G-Counter, PN-Counter (two counters for plus and minus), OR-Set (add wins over concurrent remove), LWW-Register, sequence CRDTs for text."],
      ["Price", "Metadata: slots, unique tags, tombstones. And no global invariants: a counter that must not go below zero cannot be guaranteed by a plain CRDT."],
    ],
    use: "Offline editing, multi-region counters, presence, shopping carts, collaborative tools.",
    avoid: "Uniqueness, balances, or limits that need agreement at write time.",
    answer: "Each replica writes only its own slot and merging takes the maximum of each slot. Maximum does not depend on order, grouping or repetition, so once all replicas have seen all updates they hold the same slots and therefore the same sum.",
    qa: [
      ["How can a CRDT set support removal?", "An OR-Set tags every add with a unique id. Remove deletes only the tags it has seen, so a concurrent add with a new tag survives: add wins, predictably."],
      ["State-based or operation-based CRDTs?", "State-based sends the (delta) state and tolerates any delivery. Operation-based sends small operations, but needs reliable, causal, exactly-once delivery."],
    ],
  }),
  "consensus-and-coordination--operational-transformation": deep({
    anim: ["Two edits on the word CAT", "a:User A:CAT | s:Server:CAT rev 0 | b:User B:CAT", [
      ["a>s", "ins S at 0", "A inserts S at the start and sees SCAT. The operation is based on revision 0.", "a=SCAT"],
      ["b>s", "ins S at 3", "At the same moment B appends S at position 3 and sees CATS, also based on revision 0.", "b=CATS"],
      ["s", "apply A", "The server receives A first: the document is SCAT, revision 1.", "s=SCAT rev 1"],
      ["s", "shift 3 to 4", "B's position 3 was meant for the old text. A inserted one character before it, so it becomes **4**.", "s=~transforming"],
      ["s>a", "ins S at 4", "A applies the transformed operation and gets SCATS.", "a=+SCATS; s=SCATS rev 2"],
      ["s>b", "ins S at 0", "B receives A's operation. Position 0 is before B's edit, so it needs no shift.", "b=+SCATS"],
    ]],
    more: [
      ["Central server helps", "A server that gives one order makes it enough for client and server to transform against each other. Fully peer-to-peer OT is far harder."],
      ["Undo and rich text", "Undo means transforming the inverse of an old operation past everything since. Formatting and tables multiply the cases to be proved."],
      ["OT or CRDT", "OT: small metadata, needs a server and careful transforms. CRDT: works offline and peer to peer, more metadata. Both are used in production editors."],
    ],
    use: "Server-based collaborative text editing.",
    avoid: "Offline-first or peer-to-peer apps, where CRDTs fit better.",
    answer: "B's position refers to the document B saw. A's insert, ordered first, shifted every character after it, so the same index now points to a different place. The operation must be transformed to keep B's intention (after the T) and to let all copies converge.",
    qa: [
      ["How does a client type without waiting for the server?", "It applies edits locally at once, keeps one operation in flight and buffers the rest, and transforms incoming operations against its own pending ones."],
      ["How do you handle a client that was offline for an hour?", "It sends operations based on its last revision. The server transforms them over everything since; if the gap is too big, it sends a snapshot and replays the local edits."],
    ],
  }),
};
