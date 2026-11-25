import { deep } from "../schema.js";

export default {
  "distributed-systems-fundamentals--challenges-of-distribution": deep({
    anim: ["Three different failures that look the same", "a:Node A | n:Network | b:Node B:x = 0", [
      ["a>n", "set x = 1", "Case 1: A sends a request and it is **lost on the way**. B never sees it.", "n=!dropped"],
      ["a", "timeout", "A waits one second and hears nothing. B still has x = 0.", "a=~no answer"],
      ["a>b", "set x = 1", "Case 2: the request arrives and B applies it...", "b=x = 1; n=ok"],
      ["b>n", "ok lost", "...but the **reply** is lost. A again hears nothing, yet now x = 1.", "n=!dropped; a=~no answer"],
      ["b", "GC pause 5s", "Case 3: B is alive but paused. It will do the work **after** A has given up.", "b=~paused"],
      ["a>b", "set x = 1 id=9", "A cannot tell the cases apart. The only safe move is a retry with an id, so that doing it twice changes nothing.", "a=+safe retry; b=+x = 1"],
    ]],
    more: [
      ["The eight fallacies", "The network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology does not change, there is one administrator, transport cost is zero, the network is homogeneous. All false."],
      ["Partial failure", "On one machine things work or crash. In a distributed system some parts fail while others continue, and no node sees the whole truth."],
      ["System models", "State your assumptions: asynchronous or partially synchronous network, crash-stop, crash-recovery or Byzantine nodes. Algorithms are correct only inside their model."],
    ],
    use: "Distribute when one machine cannot give the needed capacity, availability or proximity.",
    avoid: "Distributing for elegance. A single machine has none of these problems.",
    answer: "All three produce the same observation: silence. The sender has no information about where the failure happened, and a reply may be merely late. So it must treat the result as unknown, and retry idempotently or query the state.",
    qa: [
      ["How long should a timeout be?", "Based on measured latency, e.g. slightly above p99.9, within the caller's deadline. Too short creates duplicates and false failovers; too long wastes resources."],
      ["Can exactly-once delivery exist over an unreliable network?", "Not as delivery: the last acknowledgement may always be lost. Exactly-once effects are achieved by at-least-once delivery plus deduplication."],
    ],
  }),
  "distributed-systems-fundamentals--network-partitions": deep({
    anim: ["A five-node cluster splits 3 and 2", "c1:Client 1, c2:Client 2 | n1:N1 leader, n2:N2, n3:N3 | n4:N4, n5:N5", [
      ["n1>n4", "link cut", "A switch fails. N1 N2 N3 can talk with each other, and so can N4 N5, but not across.", "n4=~isolated; n5=~isolated"],
      ["c1>n1", "write x = 1", "Client 1 writes on the larger side.", "n1=x = 1"],
      ["n1>n2,n3", "replicate", "Three of five acknowledge: a majority, so the write commits.", "n2=x = 1; n3=x = 1"],
      ["c2>n4", "write x = 2", "Client 2 reaches the smaller side. Two of five can never be a majority.", "n4=~refuses"],
      ["n4>c2", "unavailable", "Refusing keeps the data **consistent** and gives up **availability** there. Accepting would do the opposite.", "c2=!error"],
      ["n1>n4,n5", "heal + catch up", "When the link heals, N4 and N5 copy the missing log. No conflict exists, as only one side accepted writes.", "n4=+x = 1; n5=+x = 1"],
    ]],
    more: [
      ["Shapes", "Full split, one isolated node, one-way loss (A hears B, B does not hear A), and flapping links. One-way loss causes the strangest bugs."],
      ["Frequency", "Not only cut cables: overloaded switches, firewall changes, long pauses and cloud zone issues look like partitions."],
      ["Degrade on purpose", "Decide per feature during a partition: reads from local data with a notice, writes queued, critical operations refused."],
    ],
    use: "Reviewing any replicated system: what does each side do when it cannot see the other?",
    avoid: "Assuming one data centre never partitions.",
    answer: "The two sides cannot communicate, so a write on one side is unknown on the other. To remain consistent one side must refuse requests (losing availability); to remain available both must answer, and they may give different answers.",
    qa: [
      ["How do you test partitions?", "Inject packet loss and one-way blocks between nodes in a test cluster, run a workload, and check the recorded history for lost or contradictory results."],
      ["Why use an odd number of nodes?", "Five nodes tolerate two failures and four tolerate only one, since a majority of four is three. The even node adds cost without tolerance."],
    ],
  }),
  "distributed-systems-fundamentals--split-brain-problem": deep({
    anim: ["Two leaders, and how a quorum prevents it", "a:Node A:leader | w:Witness C | b:Node B:standby | s:Storage", [
      ["a>b", "heartbeat lost", "Two nodes, no quorum. The link breaks while both are alive.", "b=~A seems dead"],
      ["b", "promote self", "B promotes itself. A is still leader as well: **split brain**.", "b=!leader; a=!leader"],
      ["a>s", "write v1", "Both write to shared storage, and the data is corrupted.", "s=!conflict"],
      ["b>w", "vote for me?", "Replay with a witness: three votes, and two are needed to lead.", "b=candidate; a=leader; s=clean"],
      ["a>w", "still here", "The witness can still hear A and refuses B. B cannot become a leader.", "w=+votes A; b=+standby"],
      ["s", "fence token 8", "Extra safety: storage accepts only the newest leader number, so a paused old leader is rejected.", "s=+token 8 only"],
    ]],
    more: [
      ["Quorum arithmetic", "Two majorities of the same group always share a member, and a member votes once per term. So two leaders in one term are impossible."],
      ["Fencing", "Stop the old leader for real: cut its power, revoke its storage access, or check increasing tokens on every write. Voting alone does not stop a node that is asleep and wakes later."],
      ["Stretched clusters", "With two data centres neither has a majority alone. Put a witness in a third location, or accept manual failover."],
    ],
    use: "Any automatic failover of a leader, primary database or lock holder.",
    avoid: "Two-node clusters with automatic promotion and no tie-breaker.",
    answer: "A majority needs more than half of the nodes, and after a split at most one side can contain more than half. The other side cannot win an election, so at most one leader is active in a given term.",
    qa: [
      ["The old leader is only paused, not partitioned. What happens?", "It wakes up, still believes it leads and may write. Leases that expire by its own clock help, and fencing tokens at the resource make it safe."],
      ["How do you recover from a split brain that happened?", "Stop writes, pick the authoritative side, export the differences, merge by business rules with humans where needed, rebuild the other side, then fix the quorum design."],
    ],
  }),
  "distributed-systems-fundamentals--heartbeats": deep({
    anim: ["From missed beats to safe failover", "n:Node 7 | m:Monitor:healthy | c:Cluster | r:Replacement", [
      ["n>m", "beat 1s", "Node 7 sends a small message every second.", "m=last seen 0s"],
      ["n", "long GC pause", "It freezes for 4 seconds. It is **not dead**, only silent.", "n=~paused"],
      ["m", "3 missed", "After 3 missed beats the monitor suspects it. Suspect does not mean dead.", "m=~suspect"],
      ["m>c", "can you reach it?", "The monitor asks other nodes to probe, to exclude its own network as the cause.", "c=nobody can"],
      ["c>r", "take over, term 9", "Work is handed over with a **higher term number**.", "r=+owner term 9"],
      ["n>c", "write, term 8", "Node 7 wakes and continues its work. Its old term is rejected: suspicion was enough to be safe.", "n=!rejected; m=confirmed"],
    ]],
    more: [
      ["Interval and timeout", "Timeout of 3-10 intervals. Short: fast detection, more false alarms. Long: the opposite. Choose by the cost of each mistake."],
      ["Scaling", "All-to-all heartbeats grow with N squared. Use gossip or hierarchical monitors, where each node probes a few others."],
      ["Phi accrual", "In place of a fixed timeout compute how unlikely the current silence is given past arrival times, and let each action choose its own threshold."],
    ],
    use: "Failure detection, leases, membership and health reporting.",
    avoid: "Treating a missed heartbeat as proof of death before an irreversible action.",
    answer: "Silence can come from a crash, a pause, an overloaded CPU or a network problem. If failover assumes death while the node is alive, two nodes act as owner. So failover must fence the old one (leases, terms, tokens) rather than trust the guess.",
    qa: [
      ["Should the heartbeat come from a separate thread?", "A separate thread can keep beating while the real work is stuck. Tie the beat to progress, for example the main loop updating a timestamp that the beat checks."],
      ["Push or pull heartbeats?", "Push scales and works behind firewalls. Pull (probing) also tests that the node can accept requests. Many systems use both."],
    ],
  }),
  "distributed-systems-fundamentals--handling-failures-in-distributed-systems": deep({
    anim: ["A layered defence for one payment call", "c:Checkout | t:Deadline + retry | b:Breaker | p:Payment | q:Retry queue", [
      ["c>t", "pay, 2s budget", "Checkout gives the whole operation 2 seconds and creates idempotency key K.", "t=budget 2.0s"],
      ["t>p", "try 1, 600 ms", "The first attempt times out: unknown result.", "p=~slow; t=budget 1.4s"],
      ["t>p", "try 2 after 200", "After a random pause it retries with the **same key** K. If try 1 actually charged, K prevents a second charge.", "t=budget 0.6s"],
      ["t>b", "failures counted", "Failures exceed the threshold and the breaker opens for other users too.", "b=!open"],
      ["c>q", "queue K", "Instead of an error, the order is saved as pending and queued.", "q=K pending; c=order pending"],
      ["q>p", "later, key K", "When the service recovers, the queue retries safely and the order is confirmed.", "p=+paid once; c=+confirmed"],
    ]],
    more: [
      ["Order of defences", "Timeout, then retry with backoff and jitter, then breaker, then fallback. Each one assumes the previous exists."],
      ["Classify errors", "Transient (retry), permanent (do not retry, tell the user), unknown (retry only if idempotent). Put this in code, not in people's heads."],
      ["Steady-state recovery", "Systems should heal without humans: reconcile loops, dead-letter replay, automatic restarts, periodic comparison of both sides' records."],
    ],
    use: "Every remote call that matters to users.",
    avoid: "Adding all patterns to trivial internal calls. Complexity causes outages as well.",
    answer: "After a timeout the client does not know whether the charge happened. Without a key, the retry may charge again. With the same idempotency key, the server recognises the repeated request and returns the first result.",
    qa: [
      ["How can retries cause an outage?", "When a service slows, every client retries, multiplying load exactly when capacity is low. Limit attempts, add jitter, and use a retry budget such as 10% of requests."],
      ["What is a gray failure?", "The system looks healthy to its checks, but is slow or wrong for some users. Detect it from the caller's side, and by comparing instances with each other."],
    ],
  }),
};
