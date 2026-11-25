import { deep } from "../schema.js";

export default {
  "time-and-ordering--clock-synchronization-problem": deep({
    anim: ["A later write loses because of clock skew", "a:Node A:clock 10:00:05 | s:Store:empty | b:Node B:clock 10:00:01 | n:Time server", [
      ["a>s", "x=1 at 10:00:05", "A writes first in **real** time. Its clock is 4 seconds fast.", "s=x=1 @05"],
      ["b>s", "x=2 at 10:00:01", "One real second later B writes x = 2, with its slower clock.", "b=clock 10:00:01"],
      ["s", "last write wins", "The store keeps the highest timestamp: 05 is greater than 01.", "s=!x=1 kept"],
      ["s>b", "x = 1", "B's newer write has silently vanished. No error was reported.", "b=!write lost"],
      ["n>a,b", "NTP sync", "Synchronising reduces the skew to a few milliseconds. It never becomes zero.", "a=+off by 5 ms; b=+off by 5 ms"],
      ["a>s", "x=3 version 3", "For ordering use versions or logical clocks. Use wall clocks for display and rough times only.", "s=+x=3 v3"],
    ]],
    more: [
      ["Two clocks in one machine", "Wall clock: date and time, may jump backwards. Monotonic clock: only moves forward, meaningless across machines. Measure durations with the monotonic one."],
      ["Sources of error", "Crystal drift (about 10-50 ms per hour when unsynchronised), asymmetric network delay, virtual machine pauses, leap seconds."],
      ["Bounded uncertainty", "Some systems use GPS and atomic clocks and expose an interval [earliest, latest]. Waiting out the uncertainty before commit gives a true global order."],
    ],
    use: "Log timestamps, TTLs with margins, scheduling, rough ordering for people.",
    avoid: "Deciding which of two nearby writes is newer, or lock ownership, by wall clock alone.",
    answer: "Each machine's clock has its own error. If A's clock is ahead by 4 seconds, an event on A that happened first can carry a later timestamp than an event on B. Differences smaller than the clock error say nothing about order.",
    qa: [
      ["Why not use last-write-wins everywhere?", "It silently discards concurrent updates and depends on clocks. It is fine for data where losing one is harmless, such as presence or cached profiles."],
      ["How do you make token expiry robust to skew?", "Allow a small leeway (30-60 seconds), keep hosts synchronised and alert on offset, and have the issuer's time included in the token."],
    ],
  }),
  "time-and-ordering--logical-clocks": deep({
    anim: ["Counters order cause before effect", "a:Alice:L=0 | s:Server:L=0 | b:Bob:L=0", [
      ["a", "type question", "Alice writes a question. A local event raises her counter to 1.", "a=L=1"],
      ["a>s", "msg L=2", "Sending is an event as well: 2 is attached to the message.", "a=L=2"],
      ["s", "max(0,2)+1", "The server takes the larger of its own and the received value, plus one.", "s=L=3"],
      ["s>b", "msg L=4", "It passes the message on to Bob.", "s=L=4; b=L=5"],
      ["b>s", "reply L=6", "Bob's reply gets 6. The answer is **always** larger than the question that caused it.", "b=L=6; s=L=7"],
      ["s>a", "6 after 2", "Alice's phone clock may be wrong by an hour. Sorting by counter still shows the question before the answer.", "a=+ordered"],
    ]],
    more: [
      ["Happens-before", "A happens before B if they are on one node in that order, or A is a send and B its receive, or through a chain of those. Otherwise they are concurrent."],
      ["What you gain and lose", "You gain an order consistent with cause. You lose real time: 7 does not mean 7 seconds, and gaps have no meaning."],
      ["Family", "Lamport (one number, total order), vector (detects concurrency), version vectors (per data item), hybrid logical clocks (close to wall time with causal order)."],
    ],
    use: "Ordering events across machines, replication logs, versioning.",
    avoid: "Showing times to humans, or measuring durations.",
    answer: "The counter travels with the message and the receiver moves past it, so an effect always has a higher number than its cause. Physical clocks are not involved, so their disagreement does not matter.",
    qa: [
      ["What is a hybrid logical clock?", "A timestamp with wall time plus a counter. It stays close to real time, never goes backwards and respects causality. Useful for snapshots in distributed databases."],
      ["When are two events concurrent?", "When neither could have influenced the other: there is no chain of messages between them. It does not require that they happen at the same instant."],
    ],
  }),
  "time-and-ordering--lamport-timestamps": deep({
    anim: ["Three nodes building a total order", "p:P1:0 | q:P2:0 | r:P3:0", [
      ["p", "event a = 1", "P1 does something: the counter becomes 1.", "p=a = 1"],
      ["r", "event x = 1", "P3 independently does something: also 1. Nobody communicated.", "r=x = 1"],
      ["p>q", "send b = 2", "P1 sends a message with timestamp 2.", "p=b = 2"],
      ["q", "recv c = 3", "P2 computes max(0, 2) + 1 = 3. So a < b < c, which matches the cause.", "q=c = 3"],
      ["r", "event y = 2", "P3 continues alone: y = 2.", "r=y = 2"],
      ["q", "y=2 < c=3", "y has a smaller number than c, but y did **not** happen before c: there is no path. They are concurrent.", "q=~c vs y?"],
      ["q", "tie: (1 P1) (1 P3)", "For a total order break ties by node id. Everyone agrees on it, even if it is arbitrary for concurrent events.", "q=+total order"],
    ]],
    more: [
      ["The rule", "Before an event: L = L + 1. On receive: L = max(L, received) + 1. Two lines of code and one integer."],
      ["One-way implication", "If A happened before B then L(A) < L(B). The reverse is not true. Remember the direction and you have understood the algorithm."],
      ["Uses", "Distributed mutual exclusion, deterministic tie-breaking, ordering of replicated commands, and generating monotonic ids."],
    ],
    use: "You need some agreed order that never contradicts causality.",
    avoid: "Detecting conflicts between replicas. Use version vectors.",
    answer: "No. A smaller timestamp is necessary but not sufficient: the two events may be concurrent on nodes that never communicated. It only guarantees that B did not happen before A.",
    qa: [
      ["How does Lamport's mutual exclusion use these timestamps?", "Each request carries a timestamp, all nodes queue requests by (timestamp, node id), and a node enters when its request is first and it has heard later timestamps from everybody."],
      ["Why include the node id?", "Two nodes can produce the same number. The id breaks ties consistently, so that all nodes sort events in the same order."],
    ],
  }),
  "time-and-ordering--vector-clocks": deep({
    anim: ["Detecting two conflicting edits", "c1:Phone | a:Replica A:[0 0] | b:Replica B:[0 0] | c2:Laptop", [
      ["c1>a", "cart: milk", "The phone adds milk through replica A.", "a=[1 0] milk"],
      ["a>b", "replicate [1 0]", "B receives it. Both replicas agree.", "b=[1 0] milk"],
      ["c1>a", "add bread", "The phone adds bread at A: A's own entry rises.", "a=[2 0] +bread"],
      ["c2>b", "add eggs", "Meanwhile the laptop adds eggs at B, which has not seen bread.", "b=[1 1] +eggs"],
      ["a>b", "[2 0] vs [1 1]", "Compare: 2 > 1 in the first place, but 0 < 1 in the second. **Neither** is newer: a real conflict.", "b=~conflict"],
      ["b>a", "merge [2 1]", "The application merges both carts. The result is newer than both versions.", "a=+[2 1] all three; b=+[2 1] all three"],
    ]],
    more: [
      ["Comparison rule", "V <= W if every entry is <=. If V <= W then V is an ancestor. If neither holds, they are concurrent and both must be kept or merged."],
      ["Size", "One entry per writer. With thousands of clients use server-side entries, dotted version vectors, or prune old entries carefully."],
      ["Conflict policy", "Keep siblings and ask the application, merge automatically (sets), or pick a winner. The clock finds conflicts; it does not resolve them."],
    ],
    use: "Multi-writer replicated data where lost updates are unacceptable.",
    avoid: "Single-leader systems, where a log position is simpler.",
    answer: "It keeps one counter per node, so it records how much of each node's history an event has seen. If each event has seen something the other has not, they are concurrent. A Lamport timestamp collapses this into one number, so the information is lost.",
    qa: [
      ["Vector clock or version vector?", "The same structure with different use: vector clocks order events between processes, version vectors track versions of a data item across replicas."],
      ["Why do systems avoid client ids in version vectors?", "There may be millions of clients, so vectors grow without limit. Using replica ids plus dots keeps them small."],
    ],
  }),
};
