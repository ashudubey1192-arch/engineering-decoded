import { deep } from "../schema.js";

export default {
  "architectural-patterns--client-server-architecture": deep({
    anim: ["A hidden button is not security", "c:Browser, x:Curl script | s:Server | d:Database", [
      ["c>s", "GET /orders", "The client asks, the server decides and answers. The client renders; the server owns data and rules.", "s=checks session"],
      ["s>d", "only own rows", "The server queries with the user id from the **session**, never from the request body.", "d=12 rows"],
      ["s>c", "12 orders", "The page hides the Refund button because this user is not an agent.", "c=no refund button"],
      ["x>s", "POST /refund", "The same user calls the endpoint directly with a script. The hidden button changed nothing.", "x=same user"],
      ["s", "check role", "The server checks the role before acting and refuses.", "s=+not agent"],
      ["s>x", "403", "Anything running on the client can be read, changed or skipped, so every rule is enforced again on the server.", "x=!403"],
    ]],
    more: [
      ["Thin and thick clients", "Thin clients are simple to update. Thick clients feel fast and work offline, but carry logic you cannot recall quickly. Version the API for old apps."],
      ["Tiers", "Two-tier (client, database), three-tier (client, application, database), n-tier. Each tier can scale and be secured separately."],
      ["Where to render", "Server rendering gives fast first paint and SEO. Client rendering gives rich interaction. Many apps stream HTML and hydrate only the interactive parts."],
    ],
    use: "Central control over data, rules and updates, which covers most business systems.",
    avoid: "Direct device-to-device transfer, or systems that must work with no central server.",
    answer: "The client runs on the user's machine, so its code can be inspected, changed or bypassed by calling the API directly. Hiding a control only improves the interface. Only the server is under your control, so only its check is a real boundary.",
    qa: [
      ["Which validations belong on the client?", "Those that improve experience: required fields, formats, instant feedback. Repeat all of them on the server, which also checks permissions and business rules."],
      ["What is the difference between two-tier and three-tier?", "In two-tier the client talks to the database directly, exposing credentials and schema. Three-tier puts an application server between them, for security, pooling and shared rules."],
    ],
  }),
  "architectural-patterns--monolithic-architecture": deep({
    anim: ["One process: strength and limit", "u:Request | o:Orders module, p:Payments module, r:Reports module | d:Database", [
      ["u>o", "place order", "All modules live in one process. The request enters Orders.", "o=working"],
      ["o>p", "function call", "Calling Payments is a function call: nanoseconds, no network, no partial failure.", "p=+called"],
      ["o>d", "one transaction", "Both modules write in a **single** database transaction. Correctness is easy.", "d=+committed"],
      ["r", "memory leak", "A leak in Reports consumes the memory of the whole process.", "r=!leak"],
      ["r>o", "process dies", "Orders and Payments go down with it: one failure domain.", "o=!down; p=!down"],
      ["u>r", "own instance", "First remedy: run the same code as separate pools, so reports have their own instances. No rewrite needed.", "r=own pool; o=+up; p=+up"],
    ]],
    more: [
      ["Good monolith, bad monolith", "Good: modules with clear interfaces, one deployable. Bad: every class reaches into every table. The second is a structure problem, which microservices would spread over a network."],
      ["Scaling", "Copies behind a balancer scale far. Limits appear as build time, deploy queues, database load and team coordination, usually long before CPU."],
      ["Deploy safety", "Feature flags, canaries and fast rollback give a monolith most of the release safety people seek from services."],
    ],
    use: "New products, small to medium teams, and domains whose boundaries are not yet clear.",
    avoid: "Many teams blocked by one release train, or parts with very different scaling or compliance needs.",
    answer: "Long builds and deploy queues, teams blocking one another, a small change needing a full release, one module's failures or load taking down the rest, parts that need different scaling or technology, and unclear ownership.",
    qa: [
      ["Would you start a startup with microservices?", "Usually not. A modular monolith gives speed and easy refactoring while the domain is unknown. Extract services later, where a boundary and a reason are proven."],
      ["How do you scale a monolith's database?", "Indexes and query fixes, caching, read replicas, a bigger machine, moving separate modules to their own schema and then server, and sharding last."],
    ],
  }),
  "architectural-patterns--microservices-architecture": deep({
    anim: ["Business slices against technical layers", "ch:Change request | ui:UI service, bl:Logic service, da:Data service | ca:Cart service, pa:Pay service", [
      ["ch>ui", "gift wrap", "Split by **layer**: a new gift-wrap option needs a change in the UI service...", "ui=changed"],
      ["ch>bl", "gift wrap", "...and in the logic service...", "bl=changed"],
      ["ch>da", "gift wrap", "...and in the data service. Three teams, three deploys in the right order, for one small feature.", "da=changed; ch=!3 teams"],
      ["ch>ca", "gift wrap", "Split by **capability**: only Cart changes, including its own data. One team, one deploy.", "ca=+changed; ch=+1 team"],
      ["ca>pa", "total changed", "Cart tells Pay through a stable contract.", "pa=unchanged"],
      ["pa", "deploy alone", "Independent deployment is the test. If services must be released together, they are one distributed monolith.", "pa=+independent"],
    ]],
    more: [
      ["Data ownership", "Each service owns its tables. Others use its API or events. A shared database recreates the coupling, with extra network calls."],
      ["The bill", "Network failures, distributed tracing, versioned contracts, eventual consistency, local environments, many pipelines, on-call per service."],
      ["Size", "Not lines of code. A service should be owned by one team, hold one business capability and be replaceable. If two services always change together, merge them."],
    ],
    use: "Several teams that need independent release, scaling or isolation around clear domains.",
    avoid: "One small team, an unknown domain, or weak automation and monitoring.",
    answer: "A business change normally stays inside one capability, so one team changes and deploys one service. With technical layers nearly every feature crosses all layers, which forces coordinated changes and chatty calls.",
    qa: [
      ["How do you query data owned by several services?", "API composition for small joins, a read model fed by events for heavy ones, or an analytics store for reports. Never join across their databases directly."],
      ["How do you avoid a distributed monolith?", "Design around business boundaries, prefer async events, keep contracts backward compatible, forbid shared tables, and measure how often releases must be coordinated."],
    ],
  }),
  "architectural-patterns--serverless-architecture": deep({
    anim: ["Cold start, reuse and burst", "e:Upload event | p:Platform | f1:Instance 1:none, f2:Instance 2:none | s:Storage", [
      ["e>p", "1 upload", "A file arrives. No instance is running, and nothing has been paid for until now.", "p=no instance"],
      ["p>f1", "cold start", "The platform creates one: load the runtime and your code, about 300 ms to a few seconds.", "f1=~starting"],
      ["f1>s", "thumbnail", "The function does its work in 200 ms and stays warm for some minutes.", "f1=+warm; s=1 thumb"],
      ["e>f1", "next upload", "The next event reuses the warm instance: no cold start.", "s=2 thumbs"],
      ["p>f2", "burst of 500", "Five hundred events at once start hundreds of instances in parallel.", "f2=+x 500"],
      ["f2>s", "too many", "All of them call the same dependency. Set a concurrency limit, or a small database will drown.", "s=!overloaded"],
    ]],
    more: [
      ["Cost shape", "Pay per request and duration. Below some steady load it is nearly free; above it, reserved containers are several times cheaper. Calculate the crossing point."],
      ["Cold start remedies", "Smaller packages, lighter runtimes, provisioned concurrency, work outside the handler reused between calls, and avoiding private-network setup when unnecessary."],
      ["Constraints", "Time limits, no local state, limited connections, vendor-specific events. Keep business logic in plain modules, behind a thin handler."],
    ],
    use: "Event processing, spiky or rare traffic, glue between services, scheduled jobs.",
    avoid: "Steady high volume, long jobs, or strict low-latency paths without warm capacity.",
    answer: "Bursty work pays only when it runs and scales instantly with no idle servers. For steady high volume you pay a premium on every request all day, and reserved instances or containers would be cheaper and have no cold starts.",
    qa: [
      ["How do you connect functions to a relational database?", "Use a connection proxy or pooler, cap concurrency, reuse connections between invocations, or put a queue in between."],
      ["How do you handle retries in serverless?", "Platforms retry async events, so handlers must be idempotent. Configure maximum attempts, a dead-letter queue, and alerts on it."],
    ],
  }),
  "architectural-patterns--event-driven-architecture": deep({
    anim: ["Adding a consumer without touching the producer", "o:Orders | b:Event log | s:Shipping, l:Loyalty:not built | f:Fraud:not built", [
      ["o>b", "OrderPlaced #1", "Orders writes a fact to the log and moves on.", "b=1 event"],
      ["b>s", "#1", "Shipping reads it at its own pace and keeps its own position.", "s=at 1"],
      ["o>b", "#2 #3", "More events arrive while Shipping is down for a deploy. They wait in the log.", "b=3 events; s=~down"],
      ["b>s", "#2 #3", "Shipping returns and continues where it stopped. Orders never noticed.", "s=+at 3"],
      ["b>l", "from #1", "A new Loyalty service subscribes and **replays from the beginning**.", "l=+at 3"],
      ["b>f", "live", "Fraud joins from now on. Orders was neither changed nor redeployed. With direct calls it would need code for each new consumer.", "f=+live"],
    ]],
    more: [
      ["Event kinds", "Notification (something happened, ask me for details), state transfer (here is the data), and event sourcing (events are the record). Decide per stream."],
      ["Schema discipline", "Registry, compatibility checks and owners per topic. Never change the meaning of an existing field."],
      ["Seeing the whole", "Processes are implicit. Keep a catalog of events, trace ids across topics, and dashboards for stuck processes."],
    ],
    use: "Many independent reactions, integration between teams, and near real-time data flow.",
    avoid: "Simple request/response needs or strict global ordering and consistency.",
    answer: "The producer only publishes to a topic and does not know its consumers, so a new one subscribes without any producer change. With direct calls the producer must add code, configuration and failure handling for each new receiver.",
    qa: [
      ["What happens when a consumer has a bug for a day?", "Fix it, reset its position to before the bug and replay. Handlers must be idempotent, and side effects such as emails need protection from being repeated."],
      ["How do you version events?", "Prefer additive changes. For breaking ones publish a new event type or topic in parallel, migrate consumers, then retire the old one."],
    ],
  }),
  "architectural-patterns--peer-to-peer-p2p": deep({
    anim: ["A swarm grows its own capacity", "s:Seeder:ABCD | t:Tracker or DHT | p1:Peer 1:empty, p2:Peer 2:empty, p3:Peer 3:empty", [
      ["p1>t", "who has F?", "A new peer asks a tracker (or distributed hash table) who has the file.", "t=seeder list"],
      ["s>p1", "chunk A", "The seeder sends **different** chunks to different peers.", "p1=A"],
      ["s>p2", "chunk B", "Peer 2 receives chunk B, and peer 3 will receive C.", "p2=B"],
      ["p1>p2", "A", "Peers trade: peer 1 gives A and gets B. The seeder's bandwidth is no longer used.", "p2=A B"],
      ["p2>p3", "A B", "Every downloader is also an uploader, so more demand brings more supply.", "p3=A B C; p1=A B"],
      ["s", "seeder leaves", "The seeder disconnects. Enough copies exist in the swarm to finish, as long as every chunk is held by someone.", "s=!offline; p1=+ABCD; p2=+ABCD; p3=+ABCD"],
    ]],
    more: [
      ["Finding peers", "Central tracker, gossip, or a distributed hash table where each node stores a part of the index and lookups take about log N hops."],
      ["Trust", "Peers may lie. Verify each chunk by hash, limit freeloaders (tit for tat), and defend against one actor faking many identities."],
      ["NAT problem", "Most devices cannot accept connections. STUN discovers addresses, hole punching opens a path, and TURN relays when nothing else works."],
    ],
    use: "Large file distribution, video calls, decentralised ledgers, local-first sync.",
    avoid: "Central control, strict consistency, or predictable latency requirements.",
    answer: "Each new participant brings upload bandwidth and storage, so capacity rises along with demand. In client-server every new client only adds load to a fixed set of servers.",
    qa: [
      ["What is a distributed hash table?", "A lookup system without a centre: keys and nodes share an id space, each node knows a few others, and a query is forwarded ever closer to the key in O(log N) hops."],
      ["Is WebRTC peer to peer?", "Media flows directly between browsers when possible, but signalling needs a server, and TURN relays are used when direct paths fail. Large calls use a central forwarding server."],
    ],
  }),
  "architectural-patterns--hexagonal-architecture": deep({
    anim: ["Swapping a database behind a port", "h:HTTP adapter, t:Test | c:Order core | p:Repository port | pg:SQL adapter, mg:Document adapter", [
      ["h>c", "placeOrder()", "An inbound adapter translates HTTP to a plain method call.", "c=applies rules"],
      ["c>p", "save(order)", "The core calls an interface that **it** defines. It knows nothing about SQL.", "p=save(order)"],
      ["p>pg", "INSERT", "The SQL adapter implements the interface and maps objects to rows.", "pg=+saved"],
      ["t>c", "placeOrder()", "A test drives the same core with an in-memory adapter: milliseconds, no database.", "t=+passes"],
      ["p>mg", "insertOne", "Moving to another store means writing one new adapter and changing one line of wiring.", "mg=+saved; pg=removed"],
      ["c", "unchanged", "Business rules did not change. Dependencies point **inward**: adapters depend on the core, never the reverse.", "c=+0 lines changed"],
    ]],
    more: [
      ["Driving and driven", "Driving adapters call in (HTTP, CLI, queue consumer). Driven adapters are called (database, mail, clock). Both talk through ports."],
      ["Leaky ports", "A port that returns query builders or ORM entities has leaked. Speak in domain terms: `findOverdueInvoices()`."],
      ["Cost", "Extra mapping code and indirection. For a CRUD form it may double the files without any gain."],
    ],
    use: "Rich business rules, several entry points, or infrastructure likely to change.",
    avoid: "Thin CRUD services, scripts and prototypes.",
    answer: "The core depends only on the interface and not on any technology. A new database means a new adapter implementing the same interface; since the core never imports database code, its logic and tests stay the same.",
    qa: [
      ["How does it differ from layered architecture?", "In classic layers business code depends downward on the data layer. Here the dependency is inverted: the core owns the interface and the data adapter depends on the core."],
      ["Hexagonal, onion, clean: which one?", "They share the rule that dependencies point to the domain. Names for rings differ. Follow the rule and keep the number of layers as small as the project needs."],
    ],
  }),
  "architectural-patterns--cqrs": deep({
    anim: ["Write model and read model", "u:User | w:Write model | e:Event stream | p:Projector | r:Read model:total 0", [
      ["u>w", "add item", "A command goes to the write model, which checks rules such as stock and limits.", "w=validated"],
      ["w>e", "ItemAdded", "The change is stored and an event is emitted.", "e=ItemAdded"],
      ["u>r", "view cart", "The user reads at once. The projector has not caught up yet.", "r=~total 0"],
      ["e>p", "ItemAdded", "The projector receives the event about 100 ms later.", "p=updating"],
      ["p>r", "total 25", "It updates a table shaped exactly like the screen: no joins at read time.", "r=+total 25"],
      ["u>r", "view again", "Now the read is right and fast. Hide the gap by showing the command's result at once in the interface.", "u=+sees 25"],
    ]],
    more: [
      ["Levels", "Separate methods, separate models on one database, or separate stores. Start with the first; each level adds delay and operations."],
      ["Rebuildable views", "If events are kept, a read model can be dropped and rebuilt with a new shape. Build beside the old one and switch."],
      ["Independent scaling", "With 100 reads per write, read stores can be replicated, cached or put in a search engine, while the write side stays small and strict."],
    ],
    use: "Complex rules on writes and very different, heavy reads.",
    avoid: "Simple CRUD, where two models only double the work.",
    answer: "The read model is updated asynchronously from events, so there is a short delay after each write. It is acceptable when users tolerate slight staleness (lists, dashboards); decisions such as charging or stock checks must use the write model.",
    qa: [
      ["Does CQRS require event sourcing?", "No. The write side can be ordinary tables with change events. Event sourcing pairs well, but is a separate decision."],
      ["How do you give read-your-writes in CQRS?", "Return the new state from the command, wait until the projection reaches the command's version, or read that one screen from the write model."],
    ],
  }),
  "architectural-patterns--event-sourcing": deep({
    anim: ["Rebuilding a balance at any moment", "c:Command | a:Account:balance 0 | s:Event store:empty | v:View", [
      ["c>a", "deposit 100", "The command is checked against the current state.", "a=check ok"],
      ["a>s", "Deposited 100", "The **fact** is appended. Nothing is overwritten.", "s=+100; a=balance 100"],
      ["a>s", "Withdrawn 30", "Another fact is appended.", "s=+100 -30; a=balance 70"],
      ["s>a", "replay all", "After a restart the balance is computed again: 0 + 100 - 30 = 70.", "a=+balance 70"],
      ["s>v", "replay to Tue", "What was the balance on Tuesday? Replay only events up to Tuesday.", "v=+Tue: 100"],
      ["a>s", "snapshot @1000", "After thousands of events replay gets slow, so store a snapshot and replay only what came after it.", "s=snapshot + few"],
    ]],
    more: [
      ["Corrections", "You never edit an event. A wrong deposit is fixed by a compensating event, so the mistake and its fix both remain visible."],
      ["Concurrency", "Append with an expected version. If another event was added in the meantime, the append fails and the command is retried."],
      ["Privacy", "Personal data in immutable events conflicts with deletion rights. Encrypt per person and delete the key, or keep personal data outside."],
    ],
    use: "Audit, finance, undo, time travel, or when the history itself is business value.",
    avoid: "Simple records, or teams new to eventual consistency and schema evolution.",
    answer: "Every change is kept as an ordered, immutable event with a time. Replaying the events up to that moment gives exactly the state at that moment. A normal table only keeps the latest value.",
    qa: [
      ["How do you change an event's schema after years?", "Keep old events and upcast them when reading: a function turns v1 into v2. Never rewrite history unless unavoidable, and test replay in CI."],
      ["How is it different from an audit log?", "An audit log is a by-product that can miss changes. In event sourcing events are the source of truth, and the current state is derived from them."],
    ],
  }),
};
