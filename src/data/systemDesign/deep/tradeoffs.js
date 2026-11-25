import { deep } from "../schema.js";

export default {
  "tradeoffs--vertical-vs-horizontal-scaling": deep({
    anim: ["Scaling up, then out", "u:Load:1k rps | v:Big server:8 cores | lb:Balancer | a:Node A, b:Node B, c:Node C", [
      ["u>v", "1k req/s", "Eight cores handle 1,000 requests per second. No code changes were needed to get here.", "v=8 cores ok"],
      ["u>v", "4k req/s", "Scale **up** to 32 cores. Simple, but prices grow faster than power and there is a largest size.", "v=32 cores; u=4k rps"],
      ["v", "reboot for patch", "One machine means that every patch or failure is downtime for everyone.", "v=!offline"],
      ["lb>a,b,c", "3 nodes", "Scale **out**: three ordinary nodes behind a balancer.", "a=33%; b=33%; c=33%"],
      ["b", "node fails", "When one fails, two thirds of the capacity remain.", "b=!down; a=50%; c=50%"],
      ["lb>b", "replace", "A replacement joins automatically. The price: state had to leave the nodes.", "b=+33%; a=33%; c=33%"],
    ]],
    more: [
      ["Diagonal scaling", "Scale up to a comfortable size, then out with several of them. Very many tiny nodes waste memory and increase coordination."],
      ["What scales out easily", "Stateless web servers, workers, read replicas, caches. What does not: a single-writer database, global locks, sequences."],
      ["Include people in the cost", "One large machine may cost more per month, but a distributed cluster costs engineer hours every week."],
    ],
    use: "Up for databases and early stages; out for stateless tiers, availability and elastic load.",
    avoid: "Scaling out code that keeps state in memory, or up when a restart would stop the business.",
    answer: "With several machines the loss of one removes only a share of capacity and the rest keep serving. A vertically scaled system is one machine, so its failure or maintenance takes everything down whatever its size.",
    qa: [
      ["Why is scaling out a database harder than a web tier?", "Web servers are interchangeable. Database nodes hold different or replicated data, so adding one means moving data, routing queries and keeping copies consistent."],
      ["Which would you try first on a slow database?", "Find the bottleneck and fix queries, then scale up (minutes, no redesign), then replicas for reads, and shard last."],
    ],
  }),
  "tradeoffs--concurrency-vs-parallelism": deep({
    anim: ["One cook, two dishes; then two cooks", "t1:Task A, t2:Task B | c1:Core 1, c2:Core 2:off | io:Waiting for I/O", [
      ["t1>c1", "run A 5 ms", "Core 1 works on task A.", "c1=A"],
      ["t1>io", "A waits 50 ms", "A calls a database and has nothing to compute for 50 ms.", "io=A waiting; c1=free"],
      ["t2>c1", "run B 5 ms", "The core switches to B. Two tasks **in progress** on one core: concurrency.", "c1=B"],
      ["io>c1", "A ready", "A's data arrives and the core continues A. Only one instruction stream ran at any instant.", "c1=A; io=empty"],
      ["t1>c1", "heavy maths", "Now both tasks are pure computation. Switching does not help: the total time is the sum.", "c1=~A then B"],
      ["t2>c2", "second core", "With a second core both run **at the same instant**: parallelism. The time halves.", "c1=+A; c2=+B"],
    ]],
    more: [
      ["I/O-bound or CPU-bound", "I/O-bound work gains from concurrency (async, many threads). CPU-bound work gains only from more cores. Measure which one you have."],
      ["Costs", "Concurrency brings races, deadlocks and context switches. Parallelism adds coordination, false sharing and Amdahl's limit."],
      ["Structured concurrency", "Start related tasks in a scope and leave it only when all are finished or cancelled. It prevents leaked background work."],
    ],
    use: "Concurrency to serve many waiting clients; parallelism to finish big computations sooner.",
    avoid: "Adding threads to a CPU-bound job beyond the number of cores.",
    answer: "Yes. A single core can switch between tasks, so several are in progress (concurrent) while only one executes at each instant. Parallel needs at least two execution units working at the same moment.",
    qa: [
      ["How many threads should a pool have?", "CPU-bound: about the number of cores. I/O-bound: cores x (1 + wait / compute), bounded by what the dependency can handle."],
      ["How does an event loop serve 10,000 connections?", "It keeps them as state and asks the operating system which are ready, running short callbacks for those. One blocking callback stalls everyone."],
    ],
  }),
  "tradeoffs--push-vs-pull-architecture": deep({
    anim: ["A slow consumer under push and under pull", "p:Producer:100 per s | b:Broker:stored | x:Push consumer:60 per s, y:Pull consumer:60 per s", [
      ["p>b", "100 msg/s", "The producer sends 100 messages per second. Both consumers can process 60.", "b=100 per s"],
      ["b>x", "push 100/s", "Push delivers as fast as messages arrive, regardless of the consumer's state.", "x=~40 per s extra"],
      ["x", "buffer fills", "The consumer's memory grows by 40 messages each second until it fails.", "x=!out of memory"],
      ["y>b", "give me 10", "The pull consumer asks for ten when it is **ready** for ten.", "y=10 in work"],
      ["b>y", "10 messages", "It can never be flooded. The backlog waits safely in the broker.", "y=+60 per s; b=~lag grows"],
      ["y>b", "add 2nd puller", "The visible lag is a signal to add another consumer. Nothing crashed.", "b=+lag shrinks"],
    ]],
    more: [
      ["Latency", "Push is immediate. Pull adds half the poll interval, unless long polling is used, which gives both low delay and consumer control."],
      ["Fan-out feeds", "Push on write makes reads instant but costs a celebrity's post a million writes. Pull on read is cheap to write, expensive to read. Large feeds mix both."],
      ["Monitoring", "Pull-based metrics show when a target is unreachable. Push-based suits short-lived jobs and targets behind firewalls."],
    ],
    use: "Push for low latency and few, fast receivers; pull when consumers differ in speed or come and go.",
    avoid: "Push without flow control, or tight pull loops on idle sources.",
    answer: "In pull, the consumer decides when to take more, so a slow one simply takes less and the backlog stays in the broker. In push, the sender sets the speed and a slow consumer is overrun unless extra flow control is added.",
    qa: [
      ["How can a push system protect slow consumers?", "Credits or prefetch limits, acknowledgements before more is sent, bounded buffers with a drop policy, or falling back to pull."],
      ["Why do log-based brokers use pull?", "Consumers keep their own position, can replay, batch efficiently and run at different speeds without the broker tracking each delivery."],
    ],
  }),
  "tradeoffs--stateful-vs-stateless-architecture": deep({
    anim: ["A cart survives a server crash", "u:User | lb:Balancer | a:Server A, b:Server B | s:Shared store", [
      ["u>lb", "add shoes", "The user adds shoes to the cart.", "lb=to A"],
      ["lb>a", "cart in memory", "A stateful server keeps the cart in its own memory.", "a=cart: shoes"],
      ["a", "crash", "Server A crashes. The cart existed only there.", "a=!cart lost"],
      ["lb>b", "view cart", "Server B has never heard of it, so the user sees an empty cart.", "b=~empty cart"],
      ["b>s", "save cart", "Stateless version: the cart is saved in a shared store on every change.", "s=cart: shoes"],
      ["lb>a", "any server", "Any server can load it. Servers can crash, deploy and scale without losing anything.", "a=+cart: shoes"],
    ]],
    more: [
      ["State does not vanish", "Stateless services move state to a database, cache, token or client. That place must now be scaled and made reliable."],
      ["When stateful is right", "Databases, WebSocket servers, game rooms and stream processors keep state close for speed. They need partitioning, snapshots and careful handover."],
      ["Session affinity", "Sticky sessions are a halfway house: simple, but uneven load and lost sessions on failure."],
    ],
    use: "Stateless for web and API tiers; stateful for low-latency local state that is worth the operational cost.",
    avoid: "Local files, in-memory sessions or scheduled jobs inside services meant to scale.",
    answer: "Once state is shared, every server is identical, so a balancer can send any request anywhere, and servers can be added, removed or replaced freely. With state in memory each user is tied to one machine.",
    qa: [
      ["Is a service using a database stateless?", "The service process is stateless, since it holds nothing between requests. The system as a whole still has state, kept in the database."],
      ["How do you scale a stateful WebSocket service?", "Partition users over nodes with consistent hashing, keep recoverable state outside, use a bus between nodes, and drain connections during deploys."],
    ],
  }),
  "tradeoffs--long-polling-vs-websockets": deep({
    anim: ["The same three messages over both", "c:Client | lp:Long-poll server | ws:WebSocket server | e:Events", [
      ["c>lp", "GET, held", "Long polling: the client sends a full HTTP request and the server holds it.", "lp=holding 1"],
      ["e>lp", "msg 1", "Message 1 arrives, the response is sent, and the connection's request ends.", "lp=answered"],
      ["c>lp", "GET again", "The client must ask again. Each message costs about 800 bytes of headers.", "lp=3 requests total"],
      ["c>ws", "upgrade once", "WebSocket: one upgrade, then the connection stays open.", "ws=1 connection"],
      ["e>ws", "msgs 1 2 3", "Three messages cost three small frames of a few bytes each.", "ws=+3 frames"],
      ["c>ws", "typing...", "The client can also send at any time on the same connection, which long polling needs a second request for.", "ws=+both ways"],
    ]],
    more: [
      ["Infrastructure", "Long polling is ordinary HTTP: any balancer, cache rule, auth filter and log works. WebSockets need upgrade support, long timeouts and connection-aware balancing."],
      ["Failure behaviour", "Long polling reconnects by nature. WebSockets need heartbeats, reconnect logic, and replay from the last message id."],
      ["Middle option", "Server-sent events give streaming with plain HTTP when only the server needs to push."],
    ],
    use: "WebSockets for chat, games and collaboration; long polling for occasional updates or restrictive networks.",
    avoid: "WebSockets for one notification an hour.",
    answer: "An HTTP request is short and independent, so each can go to any server. A WebSocket is one long-lived connection tied to one server: the balancer must support the upgrade, keep it open through idle time, balance by connection count and drain on deploys.",
    qa: [
      ["What breaks WebSockets in corporate networks?", "Proxies that do not understand upgrades or cut idle connections. Use TLS on port 443, heartbeats, and fall back to SSE or long polling."],
      ["Which uses more server memory?", "Both hold a connection per client. Long polling adds request objects and repeated parsing; a WebSocket adds buffers. With async I/O they are similar, and message rate decides."],
    ],
  }),
  "tradeoffs--strong-vs-eventual-consistency": deep({
    anim: ["A like counter and a bank balance", "u:User | p:Primary:likes 10 bal 100 | r:Replica:likes 10 bal 100 | v:Viewer", [
      ["u>p", "like", "A like is added. The primary answers immediately.", "p=likes 11 bal 100"],
      ["v>r", "read likes", "Another viewer reads from a replica that is one second behind and sees 10.", "v=sees 10"],
      ["p>r", "replicate", "A second later the replica catches up. Nobody was harmed by the old number.", "r=+likes 11 bal 100"],
      ["u>p", "withdraw 100", "Now a withdrawal of the whole balance.", "p=likes 11 bal 0"],
      ["u>r", "withdraw 100", "If the second withdrawal checked the **replica**, it would still see 100 and pay twice.", "r=!bal 100 stale"],
      ["u>p", "check primary", "Balance checks go to the primary (or a quorum) and are conditional: `if balance >= 100`. It is refused correctly.", "p=+refused"],
    ]],
    more: [
      ["Price of strong", "Coordination: extra round trips (one per quorum, or across regions), lower write availability during partitions, and contention on hot keys."],
      ["Making eventual pleasant", "Show your own writes at once, pin users to a replica, use monotonic reads, display 'updating', and merge conflicts predictably."],
      ["Choose per field", "One screen can mix them: stock strongly checked at checkout, reviews eventual, view counts approximate."],
    ],
    use: "Strong for money, stock, uniqueness and permissions; eventual for feeds, counters and recommendations.",
    avoid: "Global strong consistency as a default, or eventual consistency for invariants.",
    answer: "A like counter that is briefly off harms nobody, and eventual consistency makes it fast, cheap and always available. A wrong balance can allow overspending, so it needs a strong, conditional read and write even if it is slower.",
    qa: [
      ["How do you enforce an invariant on an eventually consistent store?", "Use a conditional write on one key, route that key to a single leader, reserve portions in advance (escrow), or detect and compensate afterwards."],
      ["Does eventual consistency have a time limit?", "Not by definition. In practice you measure replication lag, alert on it and design the user experience for the worst case."],
    ],
  }),
};
