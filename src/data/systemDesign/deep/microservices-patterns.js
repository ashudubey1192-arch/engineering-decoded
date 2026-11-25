import { deep } from "../schema.js";

export default {
  "microservices-patterns--service-discovery": deep({
    anim: ["Finding instances that come and go", "c:Cart service | r:Registry:empty | a:Price A, b:Price B:not started", [
      ["a>r", "register", "Price A starts, passes its readiness check and registers its address with a 10-second lease.", "r=A 10.0.1.4"],
      ["c>r", "where is price?", "Cart asks by **name** and caches the answer for a few seconds.", "c=knows A"],
      ["c>a", "GET price", "Cart calls the instance directly.", "a=+serving"],
      ["b>r", "register", "Traffic grows and a second instance starts and registers by itself.", "r=A and B; b=+serving"],
      ["a", "crash", "A crashes and stops renewing its lease.", "a=!down"],
      ["r>c", "A expired", "After 10 seconds the registry drops A and pushes the new list. Until then Cart retries on B.", "r=B only; c=knows B"],
    ]],
    more: [
      ["Client or server side", "Client-side: the caller picks an instance (no extra hop, logic in every client). Server-side: a balancer or DNS name does it (simple clients, one more hop)."],
      ["Platform discovery", "Orchestrators give each service a stable name and virtual IP, with endpoints kept up to date from readiness probes. Often that is all you need."],
      ["Registry availability", "Prefer available over perfectly consistent: a slightly old list plus retries is better than no list. Clients should keep working from cache when the registry is down."],
    ],
    use: "Instances are created, moved and removed automatically.",
    avoid: "A handful of fixed servers, where DNS and configuration are enough.",
    answer: "Addresses change whenever instances are scaled, restarted or moved, so a hardcoded IP soon points to nothing, or to a different service, and it also uses only one of several instances. Discovery maps a stable name to the current healthy set.",
    qa: [
      ["How do you deregister cleanly?", "On shutdown: fail readiness, deregister, wait for callers to refresh, finish in-flight work, then exit. Leases cover crashes."],
      ["What if the registry returns a dead instance?", "Use short connect timeouts, retry on another instance, and passive health checks (outlier ejection) in the client."],
    ],
  }),
  "microservices-patterns--api-gateway-pattern": deep({
    anim: ["Authentication once, not ten times", "c:Client | g:API gateway | i:Identity keys | o:Orders, r:Reviews", [
      ["c>g", "JWT + request", "Without a gateway, ten services would each validate tokens, limits and TLS, in ten slightly different ways.", "g=received"],
      ["g>i", "public key", "The gateway verifies the token with a cached public key.", "i=+valid"],
      ["g>o", "user=7 role=buyer", "It forwards a compact, **signed** identity. Orders needs no login code.", "o=trusts signature"],
      ["o", "owns order?", "Orders still decides whether user 7 may see this order. Only the owner of the data can know.", "o=+owner ok"],
      ["c>g", "bad token", "A bad token is refused at the door, and no service spends any work on it.", "g=!401"],
      ["g>r", "/reviews/v2", "A route change or canary is configuration at the gateway, invisible to clients.", "r=+10% v2"],
    ]],
    more: [
      ["Composition", "It can join two or three calls for a screen, but growing business logic there makes it the new monolith. Move that to a BFF."],
      ["Several gateways", "Split by audience (public, partner, internal) or domain, so that one misconfiguration does not affect everyone."],
      ["Performance", "Keep policies local and cached, avoid reading bodies, and reuse upstream connections. A good gateway adds 1-5 ms."],
    ],
    use: "Several services exposed to outside clients with common policies.",
    avoid: "One service, or internal traffic where a mesh fits better.",
    answer: "The token is validated once at the entry, and services receive an already verified identity. So the login, key handling and error logic is written, patched and audited in one place, not copied into every service in every language.",
    qa: [
      ["What must not be in the gateway?", "Business rules, object-level permissions, data transformation specific to one domain, and anything that needs a database join."],
      ["How do you deploy gateway config safely?", "Version it as code, validate in CI, canary to a few instances, watch error rates per route, and keep one-click rollback."],
    ],
  }),
  "microservices-patterns--backend-for-frontend-bff": deep({
    anim: ["Two clients, two shapes", "m:Mobile app, w:Web dashboard | bm:Mobile BFF, bw:Web BFF | o:Orders, p:Products", [
      ["m>bm", "GET /home", "The phone needs three fields and small images, over a slow network, in one call.", "bm=composing"],
      ["bm>o,p", "2 calls", "The mobile BFF calls both services inside the data centre and trims the result.", "o=full data; p=full data"],
      ["bm>m", "4 KB", "It returns 4 KB, shaped exactly for that screen.", "m=+4 KB"],
      ["w>bw", "GET /board", "The dashboard wants big tables, totals and filters.", "bw=composing"],
      ["bw>o,p", "2 calls", "The web BFF asks for more fields and adds aggregates.", "o=full data"],
      ["bw>w", "220 KB", "A single shared API would be too big for the phone or too small for the dashboard, and each team would block the other.", "w=+220 KB"],
    ]],
    more: [
      ["Ownership", "The frontend team owns its BFF, so UI and API change together. Shared rules stay in the services."],
      ["Security benefit", "The BFF can keep tokens server-side and give the browser an HttpOnly session cookie."],
      ["Duplication", "Some code repeats between BFFs. Share libraries, not a common BFF, and stop at one per distinct experience rather than one per screen."],
    ],
    use: "Clients with clearly different data, network or release needs.",
    avoid: "One client, or when GraphQL already lets each client shape its data.",
    answer: "They need different data volume, shapes, security and release speed: the phone a small single response, the dashboard rich tables. With own BFFs each can change independently; a shared API becomes a compromise with many flags.",
    qa: [
      ["BFF or GraphQL?", "GraphQL lets clients choose fields from one graph; a BFF gives a hand-made endpoint with full control of caching and security. A GraphQL server can itself act as a BFF."],
      ["What logic belongs in a BFF?", "Aggregation, formatting, client-specific caching, session handling, fallbacks. Not pricing, stock or permissions rules."],
    ],
  }),
  "microservices-patterns--sidecar-pattern": deep({
    anim: ["Retries and TLS without changing the app", "a:App (any language) | s1:Sidecar A | s2:Sidecar B | b:Other app", [
      ["a>s1", "plain localhost", "The app makes a simple call to localhost and has no TLS or retry code.", "s1=takes over"],
      ["s1>s2", "mTLS", "The sidecar encrypts, presents a certificate, and adds a trace id.", "s2=+verified"],
      ["s2>b", "plain localhost", "The other sidecar checks the caller's identity and passes the request on.", "b=working"],
      ["b>s2", "503", "The app fails once with a temporary error.", "b=!503"],
      ["s1>s2", "retry 1 of 2", "Sidecar A retries within its budget. The calling app notices nothing.", "s1=retrying; b=+200"],
      ["s1>a", "200", "The same behaviour for Java, Go and Python, updated without touching their code.", "a=+200"],
    ]],
    more: [
      ["Other sidecars", "Log shipping, config and secret refresh, local cache, protocol translation, file sync. Anything generic and tied to the app's lifecycle."],
      ["Costs", "Extra memory and CPU per instance, 1-3 ms per hop, start and stop ordering, and one more thing to upgrade across the fleet."],
      ["Alternatives", "A library (fast, but per language), a node-level agent (shared, less isolation), or kernel-level networking without sidecars."],
    ],
    use: "Many languages, consistent network behaviour, or legacy apps you cannot change.",
    avoid: "Tiny services where the sidecar uses more resources than the app.",
    answer: "The sidecar runs as a separate process next to each service and handles network traffic for it, whatever language the service uses. The logic exists once and is updated once, so teams need not write and maintain it in each language.",
    qa: [
      ["What happens if the sidecar crashes?", "The app loses its network path, so treat both as one unit: health checks cover both, and the platform restarts the pair."],
      ["Why can retries in both app and sidecar be harmful?", "They multiply: 3 app attempts x 3 sidecar attempts = 9 calls. Choose one layer, and use retry budgets."],
    ],
  }),
  "microservices-patterns--circuit-breaker-pattern": deep({
    anim: ["Closed, open, half-open, closed", "c:Checkout | b:Breaker:closed | r:Reviews service | f:Fallback", [
      ["c>b", "calls", "The breaker is **closed**: calls pass and results are counted.", "b=closed 2% err"],
      ["b>r", "timeouts", "Reviews slows down, and 60 of the last 100 calls time out.", "r=!slow; b=~60% err"],
      ["b", "trip", "Above the 50% threshold it opens. No more calls are sent for 30 seconds.", "b=!open"],
      ["c>b", "call", "Checkout calls again and fails in 1 ms instead of waiting 2 seconds for a timeout.", "c=no waiting"],
      ["b>f", "empty list", "The fallback returns no reviews. Checkout works, and Reviews gets time to recover.", "f=+page without reviews"],
      ["b>r", "1 probe", "After 30 seconds it is **half-open**: a single probe is allowed through.", "b=~half-open; r=recovered"],
      ["r>b", "ok", "The probe succeeds, so it closes again. A failed probe would open it for longer.", "b=+closed"],
    ]],
    more: [
      ["Tuning", "Use a rolling window, a minimum number of calls (so 1 of 2 failures does not trip it), slow-call detection, and different settings per dependency."],
      ["What counts as failure", "Timeouts, connection errors and 5xx. Not 4xx: a bad request does not mean the dependency is sick."],
      ["Scope", "Per dependency and ideally per host or partition. One breaker for everything turns one sick shard into a total outage."],
    ],
    use: "Remote calls that can be slow or fail, especially when a useful fallback exists.",
    avoid: "In-process calls, or as a substitute for timeouts, which it depends on.",
    answer: "When the dependency is known to be failing, each attempt would wait for a timeout, hold threads and add load to a sick service. Failing at once keeps the caller responsive and gives the dependency room to recover.",
    qa: [
      ["How do circuit breakers and retries work together?", "Retry a few times with backoff inside the breaker's view, and never retry when it is open. Otherwise retries become the load that keeps the dependency down."],
      ["What makes a good fallback?", "A cached or default answer, a reduced feature, or a queued action. It must be fast, safe and tested; calling another fragile service is not a fallback."],
    ],
  }),
  "microservices-patterns--bulkhead-pattern": deep({
    anim: ["One slow dependency, with and without bulkheads", "u:Requests | p:Shared pool:30 threads | pa:Pay pool:10, rv:Review pool:10 | d1:Payments, d2:Reviews", [
      ["u>p", "mixed load", "All calls share 30 threads.", "p=12 busy"],
      ["p>d2", "Reviews slow", "Reviews takes 10 seconds. Every review call holds a thread.", "d2=!slow"],
      ["p", "30 of 30 stuck", "Within seconds all 30 threads wait on Reviews.", "p=!exhausted"],
      ["u>p", "pay", "Payments is healthy, but no thread is free to call it. Checkout is down because of **reviews**.", "d1=healthy; u=!checkout down"],
      ["u>rv", "own pool 10", "With bulkheads Reviews may use at most 10 threads. The 11th call fails fast.", "rv=~10 of 10"],
      ["u>pa", "own pool 10", "Payments has its own 10 and continues normally. The ship has a flooded compartment and still floats.", "pa=+3 of 10; u=+checkout works"],
    ]],
    more: [
      ["Kinds", "Thread pools, semaphores (a counter, cheap with async code), connection pools, separate processes, separate clusters per tenant or tier."],
      ["Sizing", "Peak rate x normal latency + margin. 50 per second x 0.1 s = 5, so 8-10 slots. Too large a compartment protects nothing."],
      ["Priority lanes", "Reserve capacity for critical work (checkout) so that bulk jobs cannot take it."],
    ],
    use: "Several dependencies or tenants share one process or cluster.",
    avoid: "So many tiny pools that capacity is wasted while others are full.",
    answer: "A slow dependency can only exhaust its own pool. Requests that need other dependencies use other pools, so they continue to get threads and connections. Without isolation, the slow calls fill the shared pool and block everything.",
    qa: [
      ["Bulkhead or circuit breaker?", "A bulkhead limits how much can be stuck at once, from the first moment. A breaker notices failure and stops calling. Use both, along with timeouts."],
      ["How do you isolate tenants?", "Per-tenant concurrency limits and queues, shuffle sharding so that few tenants share the same nodes, and dedicated cells for the largest ones."],
    ],
  }),
  "microservices-patterns--strangler-fig-pattern": deep({
    anim: ["Replacing a monolith route by route", "u:Users | f:Facade:100% old | o:Old system | n:New service | d:Data sync", [
      ["u>f", "all traffic", "A facade is placed in front of the old system. Nothing changes for users yet.", "o=100%"],
      ["f>n", "shadow copy", "Requests for `/invoices` are copied to the new service. Its answers are compared and then thrown away.", "n=shadow"],
      ["n>d", "keep in step", "Invoice data is synchronised from old to new by change capture.", "d=in sync"],
      ["f>n", "5% of /invoices", "When results match, 5% of real traffic moves.", "n=+5%; f=5% new"],
      ["f>o", "back to 0%", "An error rate rises. One routing change sends everything back within seconds.", "n=~fixing; f=100% old"],
      ["f>n", "100% of /invoices", "After the fix the route moves fully, and the old code and tables are **deleted**.", "n=+100%; o=smaller"],
    ]],
    more: [
      ["Pick the first slice", "Low risk, clear boundary, real value. Not the hardest part and not a trivial one that teaches nothing."],
      ["Data is the hard half", "Decide who owns writes at each step. One writer at a time, with sync to the other side, avoids conflicts."],
      ["Finish it", "Half-migrated systems are the most expensive state. Track remaining routes and tables and schedule removal, not only addition."],
    ],
    use: "Replacing a live system that cannot stop.",
    avoid: "Small systems that can be rewritten and switched in a weekend.",
    answer: "Each step is small, testable with real traffic and reversible by routing back, and value arrives early. A full rewrite puts all risk at a single cutover, takes long without feedback, and chases a moving target.",
    qa: [
      ["How do you compare old and new safely?", "Shadow traffic for reads, diff the responses with tolerance for ids and times. For writes, run the new one in a dry-run mode or on synced test data."],
      ["What if there is no HTTP layer to intercept?", "Intercept elsewhere: database change capture, message queues, or a branch by abstraction inside the code (an interface with two implementations and a flag)."],
    ],
  }),
  "microservices-patterns--service-mesh": deep({
    anim: ["One policy for every service", "op:Operator | cp:Control plane | p1:Proxy Java, p2:Proxy Go, p3:Proxy Python", [
      ["op>cp", "mTLS strict", "The operator declares: all traffic must be encrypted and authenticated.", "cp=policy v1"],
      ["cp>p1,p2,p3", "certs + config", "The control plane sends certificates and rules to the proxy beside each service.", "p1=+v1; p2=+v1; p3=+v1"],
      ["p1>p2", "mTLS call", "Java calls Go. The **proxies** do the handshake; neither app contains TLS code.", "p2=+identity ok"],
      ["p2>p3", "90/10 split", "A canary rule sends 10% of calls to the new Python version.", "p3=+10% v2"],
      ["p3>cp", "metrics", "Every proxy reports the same metrics: rate, errors, latency for each pair of services.", "cp=+full map"],
      ["cp", "control plane down", "If the control plane stops, proxies continue with the last config. New certificates and changes wait.", "cp=!down"],
    ]],
    more: [
      ["Data and control plane", "Proxies carry traffic (data plane). The control plane distributes config, identity and discovery. The first must be fast, the second must be correct."],
      ["Sidecar or ambient", "Sidecars isolate best but cost memory per instance. Ambient meshes use a shared node proxy for encryption and add L7 proxies only where needed."],
      ["Adopt in steps", "Observe first, then permissive mTLS, then strict, then traffic rules. Turning on everything at once makes debugging miserable."],
    ],
    use: "Many services in several languages that need uniform security and traffic control.",
    avoid: "A few services, where libraries and an ingress are simpler.",
    answer: "Encryption, identity and telemetry are done by a proxy beside each service and configured centrally, so they do not depend on the service's language or code. Every service gets the same mTLS and the same metrics automatically.",
    qa: [
      ["Mesh or API gateway?", "The gateway handles traffic from outside (auth, quotas, public API). The mesh handles traffic between services (mTLS, retries, splits). Large systems use both."],
      ["What does a mesh not solve?", "Business authorization, data consistency, bad service boundaries and slow code. It also cannot make non-idempotent calls safe to retry."],
    ],
  }),
};
