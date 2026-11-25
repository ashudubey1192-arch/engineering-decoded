import { deep } from "../schema.js";

export default {
  "load-balancing--what-are-load-balancers": deep({
    anim: ["A balancer hides a server crash", "u:Users | lb:Load balancer:3 healthy | a:Server A:healthy, b:Server B:healthy, c:Server C:healthy", [
      ["u>lb", "300 req/s", "Clients know one address. The balancer owns it and keeps a list of healthy servers.", "lb=3 healthy"],
      ["lb>a,b,c", "100 each", "Requests are spread evenly: 100 per second per server.", "a=100 rps; b=100 rps; c=100 rps"],
      ["b", "process dies", "Server B crashes. For a few seconds the balancer does not know, so some requests fail.", "b=!down"],
      ["lb>b", "health check", "Two checks in a row fail, so B is removed. Failed idempotent requests are retried on another server.", "lb=2 healthy"],
      ["lb>a,c", "150 each", "A and C absorb the load. This works only because each had at least 50% spare capacity.", "a=150 rps; c=150 rps"],
      ["lb>b", "check passes", "B restarts, passes its checks, and gets traffic slowly while its caches warm up.", "b=+100 rps; a=100 rps; c=100 rps"],
    ]],
    more: [
      ["Where they sit", "At the edge (internet to web), between tiers (web to services) and inside the client itself (client-side balancing with service discovery), which removes a hop."],
      ["Hardware, software, managed", "Appliances are fast and costly. Software runs anywhere. Managed balancers scale and patch themselves but limit tuning. Most teams start managed."],
      ["Balancer redundancy", "Pairs share a floating IP, or several run behind DNS or anycast. Otherwise the balancer becomes the single point of failure it was meant to remove."],
    ],
    use: "More than one server, zero-downtime deploys, TLS in one place, or health-based routing.",
    avoid: "Using one to hide a slow application. It spreads slowness evenly.",
    answer: "Sessions are kept in each server's memory, so the next request lands on a server that does not know the user. Fix by moving sessions to a shared store (or signed tokens), or as a stopgap by enabling sticky sessions.",
    qa: [
      ["What happens to in-flight requests when a server is removed?", "With connection draining the balancer stops sending new requests but lets existing ones finish for a set time. Without it they are cut off and clients see errors."],
      ["How do you do zero-downtime deploys with a balancer?", "Mark a server as draining, wait, update, wait for readiness, put it back, then do the next one. Keep both versions compatible during the roll."],
    ],
  }),
  "load-balancing--load-balancing-algorithms": deep({
    anim: ["Round robin against least connections", "lb:Balancer:round robin | a:Server A:0 active, b:Server B:0 active", [
      ["lb>a", "export 6s", "Request 1 is a slow export. Round robin sends it to A, which is busy for six seconds.", "a=1 active"],
      ["lb>b", "search 20ms", "Request 2, a fast search, goes to B and finishes at once.", "b=0 active"],
      ["lb>a", "export 6s", "Request 3 is another export and it is A's turn again. Round robin cannot see that A is busy.", "a=~2 active"],
      ["lb>a", "search waits", "Request 5 is a search. It lands on A behind two exports and takes seconds instead of milliseconds.", "a=!3 active"],
      ["lb", "least conn", "Switch the algorithm: choose the server with the fewest active requests.", "lb=least conn"],
      ["lb>b", "search 20ms", "B has 0 active, A has 3, so searches go to B and stay fast.", "b=+20 ms"],
    ]],
    more: [
      ["Power of two choices", "Pick two servers at random and use the less busy one. It avoids almost all bad luck without global state, and it stops many balancers from stampeding the same idle server."],
      ["Weighted variants", "Give bigger machines bigger weights. Slow-start raises a new server's weight gradually so cold caches do not cause timeouts."],
      ["Hash based", "Hash the user or URL to a server to keep caches warm or sessions together. Use consistent hashing so adding a server does not reshuffle everyone."],
    ],
    use: "Round robin for equal short requests; least connections for mixed durations; hashing for cache affinity; latency-based for uneven servers.",
    avoid: "Least-connections with a server that fails instantly: it looks idle and attracts all traffic. Combine with error-aware health checks.",
    answer: "Least connections (or least outstanding requests). Round robin counts requests, not work, so slow exports pile up on some servers and searches queue behind them. Better still, put /export on its own pool.",
    qa: [
      ["Why can least connections behave badly with many balancers?", "Each balancer sees only its own connections, so all may choose the same 'idle' server. Power of two choices or shared load reports reduce the herd."],
      ["How would you balance long-lived WebSockets?", "Least connections, plus a slow rebalance when new servers join, because existing sockets do not move on their own."],
    ],
  }),
  "load-balancing--layer-4-vs-layer-7-load-balancing": deep({
    anim: ["The same traffic at layer 4 and layer 7", "u:Client | l4:L4 balancer:sees IP + port, l7:L7 balancer:sees HTTP | w:Blog pool, s:Shop pool", [
      ["u>l4", "TCP to :443", "A layer 4 balancer sees only addresses and ports. It chooses a backend for the **whole connection**.", "l4=picks a server"],
      ["l4>w", "bytes as is", "It forwards encrypted bytes without reading them: very fast, any protocol, client TLS untouched.", "w=gets everything"],
      ["u>l7", "TLS + HTTP", "A layer 7 balancer ends the TLS connection itself, so it can read the request.", "l7=GET /shop/7"],
      ["l7>s", "/shop/*", "It routes by path: `/shop` goes to the shop pool over a reused backend connection.", "s=+shop only"],
      ["l7>w", "/blog/*", "The next request **on the same client connection** goes elsewhere, because decisions are made per request.", "w=+blog only"],
      ["l7", "extra work", "Parsing, TLS and header logic cost CPU and add about a millisecond. In return you get retries, auth, caching and metrics per route.", "l7=~more CPU"],
    ]],
    more: [
      ["Direct server return", "Some L4 setups let the server answer the client directly. Responses, usually 10x larger than requests, skip the balancer entirely."],
      ["Both together", "Large sites run L4 in front (cheap, huge throughput) and L7 behind it (smart routing). Losing one L7 node then affects little."],
      ["gRPC and HTTP/2", "One long connection carries many requests. An L4 balancer pins them all to one server; only L7 or client-side balancing spreads them."],
    ],
    use: "L7 for HTTP routing, retries and security rules; L4 for raw speed, non-HTTP protocols or end-to-end TLS.",
    avoid: "L7 when the balancer is not allowed to see plaintext, or L4 for gRPC without client-side balancing.",
    answer: "Layer 7, because only it can read the URL path. The feature is path-based routing: `/blog/*` to the WordPress pool and `/shop/*` to the shop service.",
    qa: [
      ["Why can L7 retry a request but L4 cannot?", "L7 understands request boundaries and methods, so it can replay a failed GET on another backend. L4 only sees a byte stream and cannot know what was processed."],
      ["How does the backend learn the client IP behind L7?", "Through `X-Forwarded-For` or `Forwarded` headers added by the balancer. With L4 it may see the real address directly or through the PROXY protocol."],
    ],
  }),
  "load-balancing--dns-load-balancing": deep({
    anim: ["Moving traffic between regions with DNS", "u:User:cache empty | d:DNS service:TTL 60 | e:EU region:healthy, us:US region:healthy", [
      ["u>d", "api.shop?", "The resolver asks for the address. The DNS service knows the user is in Europe.", "d=geo rule"],
      ["d>u", "EU address", "It returns the EU address with TTL 60. The client keeps it for a minute.", "u=EU for 60s"],
      ["u>e", "requests", "All requests go to Europe directly. DNS takes no part in the data path.", "e=serving"],
      ["e", "region fails", "Europe goes down. Health checks notice in about 20 seconds and DNS stops returning it.", "e=!down; d=US only"],
      ["u>e", "still cached", "This client keeps using the cached EU address until its TTL ends. DNS cannot recall an answer.", "u=~errors up to 60s"],
      ["u>us", "new answer", "After the TTL the client asks again and goes to the US. Slower, but working.", "u=+US; us=serving"],
    ]],
    more: [
      ["Policies", "Round robin, weighted (send 5% to a new stack), latency-based, geolocation (law or language) and failover (primary and backup)."],
      ["Granularity", "DNS decides per resolver, not per request. One large resolver can stand for a million users, so load splits are approximate."],
      ["Client behaviour", "Some runtimes cache DNS forever. Set their TTL explicitly and make clients try the next address when a connection fails."],
    ],
    use: "Choosing a region, blue-green at the site level, and disaster recovery.",
    avoid: "Balancing individual servers or needing failover in seconds.",
    answer: "DNS hands out an address that clients cache, so it can steer new lookups to another data centre, but it does not see individual requests or per-server load behind that address. The TTL (plus health-check time) controls failover speed.",
    qa: [
      ["Why not set TTL to 0?", "Every request would need a lookup, adding latency and DNS load, and many resolvers enforce a minimum anyway. 30-60 seconds is a usual compromise."],
      ["DNS failover or anycast?", "Anycast reroutes in the network within seconds and ignores client caches, but needs your own address space and BGP. DNS is simple and works with any provider."],
    ],
  }),
  "load-balancing--anycast-routing": deep({
    anim: ["One address announced from three cities", "u1:User Tokyo, u2:User Paris | net:Internet BGP | t:Tokyo site:192.0.2.1, p:Paris site:192.0.2.1", [
      ["t>net", "announce", "Tokyo announces the address 192.0.2.1 to its neighbours by BGP.", "net=route to Tokyo"],
      ["p>net", "announce", "Paris announces the **same** address. Routers now know two paths and keep the closer one.", "net=2 routes"],
      ["u1>t", "nearest", "The Tokyo user's packets follow the shortest path and land in Tokyo, about 5 ms away.", "u1=+5 ms"],
      ["u2>p", "nearest", "The Paris user, using the same address, lands in Paris.", "u2=+6 ms"],
      ["p>net", "withdraw", "Paris fails its health check and withdraws the route. No DNS change is needed.", "p=!withdrawn"],
      ["u2>t", "rerouted", "Within seconds routers send Paris users to Tokyo. UDP lookups just work; open TCP connections break because Tokyo does not know them.", "u2=~220 ms"],
    ]],
    more: [
      ["Natural attack absorption", "A distributed flood is split across sites by its own origins, so no single location receives all of it."],
      ["Nearest is not fastest", "BGP counts network hops and policies, not latency or load. A site can be overloaded while its neighbour is idle; operators shape this by changing announcements."],
      ["Keeping TCP stable", "Operators terminate TCP at the edge close to the user, keep routes stable, and use connection tracking or QUIC connection ids to survive changes."],
    ],
    use: "DNS resolvers, CDN edges, attack protection, and short request/response traffic.",
    avoid: "Long single connections without an edge that terminates them, or precise load splits.",
    answer: "A DNS lookup is one tiny UDP packet each way, so if a route changes the retry simply reaches another identical site. A 30-minute upload depends on connection state in one site; if routing shifts midway, packets arrive at a site with no such connection and it resets.",
    qa: [
      ["How does anycast fail over?", "The unhealthy site withdraws its BGP announcement. Neighbours converge on the next best path, usually within seconds, with no client change."],
      ["Anycast or geo DNS?", "Anycast decides in routers per packet and reacts fast. Geo DNS decides at lookup time, allows rules by country, and needs no own address space, but is slowed by caching."],
    ],
  }),
  "load-balancing--health-checks-and-failover": deep({
    anim: ["A shallow check lies, a deep check tells", "lb:Balancer | a:Server A:up, b:Server B:up | c:Cache node | db:Database", [
      ["lb>a", "GET /", "The balancer checks `/`, which returns a static page. The answer is 200, so A looks healthy.", "a=+200 OK"],
      ["a>c", "lookup", "A's cache node has died, so every real API call on A fails with 500.", "c=!down; a=!500 on APIs"],
      ["lb>a", "GET /", "The shallow check still passes. Users keep being sent to a server that cannot serve them.", "lb=~thinks A is fine"],
      ["lb>a", "GET /ready", "A readiness check exercises the dependencies that **only this server** uses. It now returns 503.", "lb=A removed"],
      ["lb>b", "all traffic", "Traffic moves to B after three failed checks, about 15 seconds.", "b=+serving"],
      ["db", "slow for 2s", "If the check also included the shared database, one slow moment would remove **every** server at once. Check shared parts separately.", "db=~slow"],
    ]],
    more: [
      ["Liveness and readiness", "Liveness failing means restart me. Readiness failing means send me no traffic for now. Mixing them causes restart loops during dependency outages."],
      ["Thresholds and hysteresis", "Remove after 3 failures, return after 2 successes, with jittered intervals. Single-failure rules turn a brief pause into a removed server and more load on the rest."],
      ["Fail open", "If all servers look unhealthy, the check is probably wrong. Many balancers then send traffic to everyone rather than to no one."],
    ],
    use: "Every pool. Combine active probes with passive signals such as error rate and timeouts from real traffic.",
    avoid: "Expensive checks every second from dozens of balancers: the checks become the load.",
    answer: "A deep (readiness) check that calls the dependency, or passive checks on the real error rate, would catch it. A one-failure threshold removes servers for a single lost packet or pause; the rest get more load, fail their own checks, and the pool collapses.",
    qa: [
      ["What should a readiness endpoint check?", "That the process can do useful work: config loaded, warm-up finished, pools available, critical private dependencies reachable. Return quickly, with a short timeout and cached results."],
      ["How do you avoid failover flapping?", "Use consecutive thresholds, different limits for leaving and returning, a minimum time in state, and gradual traffic ramp-up after recovery."],
    ],
  }),
};
