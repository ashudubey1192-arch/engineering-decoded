import { deep } from "../schema.js";

export default {
  "introduction-to-system-design--what-is-system-design": deep({
    anim: ["One small app grows step by step", "u:Users:100 | w:Web server:app + data | d:Database:not split, c:Cache:not added | q:Queue:not added, k:Worker:not added", [
      ["u>w", "100 users", "Day one: a single machine runs the app **and** the database. For 100 users this is the right design.", "w=10% busy"],
      ["w>d", "split data", "At 5,000 users the app and database fight for memory. Moving the database to its own machine lets each be sized separately.", "u=5k users; d=own machine"],
      ["w>c", "cache hot reads", "At 50,000 users the same product pages are read again and again. A cache answers 90% of them in about 1 ms.", "u=50k users; c=90% hits; d=+calm"],
      ["w>q", "defer slow work", "Sending email inside the request made checkout take 3 seconds. The server now drops a job in a queue and replies at once.", "q=jobs waiting; w=+fast replies"],
      ["q>k", "process later", "Workers send email at their own speed. If the mail provider is down, jobs wait instead of breaking checkout.", "k=sending"],
      ["u>w", "next limit", "Each box was added to fix a **measured** problem. That is system design: name the limit, choose the trade-off, repeat.", "w=~next limit?"],
    ]],
    more: [
      ["High level and low level", "High-level design decides services, data stores and how they talk. Low-level design decides classes, tables and algorithms inside one service. Interviews usually separate them; real projects move between both."],
      ["Every choice has a price", "A cache buys speed and costs freshness. Replicas buy availability and cost consistency. Microservices buy team independence and cost operations. Always say both halves."],
      ["Start simple on purpose", "A clear monolith with one database serves a surprising amount of traffic. Complexity added before it is needed is paid for every day, by everyone."],
    ],
    use: "The system will have many users, data that must survive, or several teams changing it at once.",
    avoid: "A prototype that might be thrown away next month. Ship it, learn, and design when the shape is known.",
    answer: "Ask about requirements before technology. For example: how many users and messages per second, and must delivery be real-time and ordered? And what is the team's size and experience? With 1,000 users and three engineers, one service and one database is almost certainly better.",
    qa: [
      ["What makes a design good?", "It meets the stated requirements, its trade-offs are explicit, it fails in a predictable way, the team can operate it, and it has a path to the next order of magnitude without a rewrite."],
      ["How is system design different from coding?", "Code decides how one program behaves. System design decides how many programs and machines share work, data and failure, where the network, partial failure and scale change what is correct."],
    ],
  }),
  "introduction-to-system-design--30-must-know-concepts": deep({
    anim: ["Thirty concepts met by one request", "u:Browser | dns:DNS + CDN, lb:Load balancer | gw:API gateway, app:Service | c:Cache, db:Primary DB | r:Replica, q:Queue", [
      ["u>dns", "resolve + cache", "**DNS** turns the name into an address and the **CDN** returns images nearby. Concepts: latency, TTL, edge caching.", "dns=static files"],
      ["u>lb", "HTTPS", "The API call goes to the **load balancer** over TLS. Concepts: load balancing, health checks, horizontal scaling.", "lb=healthy pool"],
      ["lb>gw", "route", "The **gateway** checks the token and the rate limit. Concepts: authentication, authorization, rate limiting.", "gw=token valid"],
      ["gw>app", "call", "A stateless **service** handles it. Concepts: API design, idempotency, microservices, circuit breakers.", "app=working"],
      ["app>c", "lookup", "It tries the **cache** first. Concepts: cache-aside, eviction, invalidation.", "c=miss"],
      ["app>db", "query", "On a miss it reads the **database**. Concepts: indexes, ACID, sharding, consistent hashing.", "db=row found"],
      ["db>r", "replicate", "The change is copied to a **replica**. Concepts: replication lag, CAP, consistency models, failover.", "r=~30 ms behind"],
      ["app>q", "publish event", "Slow follow-up work goes to a **queue**. Concepts: async processing, pub/sub, retries, dead letters.", "q=1 event; u=+200 OK"],
    ]],
    more: [
      ["Four families", "Moving requests (DNS, load balancing, gateways), holding data (databases, caches, storage), moving work (queues, events, streams) and staying alive (replication, retries, observability). Nearly every concept fits in one."],
      ["Learn them as pairs", "Latency and throughput, SQL and NoSQL, push and pull, sync and async, replication and sharding, strong and eventual. The contrast is what makes each idea stick."],
      ["From word to mechanism", "For each concept be able to say: the problem, the mechanism in one sentence, one number, one failure mode. If one of the four is missing, revisit that lesson."],
    ],
    use: "Building a mental index before deep lessons, or revising the night before an interview.",
    avoid: "Treating the list as enough. Recognising a word is not the same as being able to apply it.",
    answer: "A strong answer is one sentence with problem and mechanism, for example: 'Consistent hashing spreads keys so that adding a server moves only about 1/N of them.' Hesitation usually means you know the name but not the failure it prevents.",
    qa: [
      ["Which concepts come up in almost every design?", "Load balancing, caching, a database choice with indexes, replication, queues for slow work, and some form of rate limiting and monitoring. Sharding and consensus appear when scale or correctness demands them."],
      ["How do you explain a concept you only half remember?", "State the problem it solves and reason from there. For a Bloom filter: 'I need a cheap check that says definitely not present or maybe present', then derive the bit array. Reasoning aloud scores better than a guess."],
    ],
  }),
};
