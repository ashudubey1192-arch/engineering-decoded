import { deep } from "../schema.js";

export default {
  "api-infrastructure--api-gateways": deep({
    anim: ["A request through the gateway pipeline", "c:Mobile app | g:API gateway | a:Auth keys, r:Rate counters | o:Orders, p:Profile", [
      ["c>g", "GET /me/home", "All clients use one host. The gateway ends TLS and gives the request an id.", "g=id r-81"],
      ["g>a", "verify token", "It checks the signature with a cached public key. Invalid tokens never reach a service.", "a=+valid"],
      ["g>r", "count +1", "It checks the caller's quota: 41 of 100 this minute.", "r=41 of 100"],
      ["g>o,p", "fan out", "It calls Orders and Profile in parallel with a 300 ms timeout.", "o=working; p=working"],
      ["p>g", "timeout", "Profile is slow. The gateway returns the page without it instead of failing everything.", "p=!slow; g=~partial"],
      ["g>c", "200 partial", "The client gets orders now, and metrics show exactly which dependency was slow.", "c=+home screen"],
    ]],
    more: [
      ["Keep it thin", "Authentication, limits, routing, TLS and telemetry belong here. Business rules do not: they would couple every team to one deploy."],
      ["Gateway, mesh, balancer", "The gateway handles traffic entering from outside (north-south). A mesh handles service-to-service traffic (east-west). Both may use the same proxy software."],
      ["Failure isolation", "Run several instances in several zones, keep configuration versioned, roll out changes gradually, and give large tenants or risky routes their own pool."],
    ],
    use: "Several services share one public entry and the same cross-cutting rules.",
    avoid: "A single service (a reverse proxy is enough) or using it as an integration layer with logic.",
    answer: "Move in: authentication/token validation, rate limiting, TLS and request logging/ids. Leave out: business authorization such as 'may this user refund this order', because it needs domain data that belongs to the service.",
    qa: [
      ["How do you keep the gateway from being a bottleneck?", "Make it stateless and horizontally scaled, cache keys and config locally, use async I/O, avoid body buffering, and test its limit separately from the services behind it."],
      ["Should services trust the gateway blindly?", "No. Verify a signed identity passed by the gateway, restrict network access, and still enforce object-level authorization, so a bypass does not expose data."],
    ],
  }),
  "api-infrastructure--rate-limiting": deep({
    anim: ["A token bucket with burst 5 and refill 1 per second", "c:Client | l:Limiter | b:Bucket:5 tokens | s:API", [
      ["c>l", "5 requests", "The client sends five requests at once. The bucket holds five tokens, so the burst is allowed.", "b=5 tokens"],
      ["l>b", "take 5", "Each request takes one token.", "b=~0 tokens"],
      ["l>s", "5 pass", "All five reach the API immediately. Bursts are fine as long as the average is respected.", "s=+5 served"],
      ["c>l", "6th request", "The sixth arrives with no tokens left.", "l=~empty"],
      ["l>c", "429 retry in 1s", "The limiter answers `429` with `Retry-After: 1`. The API never sees the request.", "c=!429"],
      ["b", "refill +1", "One second later a token is added. The long-run rate can never exceed one per second.", "b=+1 token"],
    ]],
    more: [
      ["What to limit by", "User, API key, IP, tenant, endpoint, or cost. IP alone punishes offices behind one address and barely slows a botnet; combine several keys."],
      ["Where to enforce", "Edge for floods, gateway for quotas, service for expensive operations. Inner limits protect against your own clients and retries."],
      ["Good manners", "Return 429, Retry-After and remaining quota headers. Publish limits, and let clients back off instead of guessing."],
    ],
    use: "Protecting capacity, fair sharing between tenants, limiting brute force, and controlling cost.",
    avoid: "Treating it as security on its own. Attackers rotate keys and addresses.",
    answer: "Token bucket. The bucket size maps to the burst, 50 tokens. The refill rate maps to the sustained rate, 10 tokens per second.",
    qa: [
      ["Fail open or fail closed when the limiter store is down?", "Usually fail open with a local fallback limit for normal APIs, so the limiter does not cause an outage. Fail closed for login and other abuse-sensitive endpoints."],
      ["What is the difference between rate limiting and load shedding?", "Rate limiting enforces a policy per caller regardless of health. Load shedding rejects work because the server is overloaded right now, choosing the least important first."],
    ],
  }),
};
