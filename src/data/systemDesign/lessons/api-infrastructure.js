import { lesson } from "../schema.js";

export default {
  "api-infrastructure--rate-limiting-algorithms": lesson({
    intro: "Five algorithms answer the same question, 'is this request allowed now?', with different treatment of **bursts**, **memory** and **accuracy**.",
    scene: "An API allows 100 requests per minute and counts per clock minute. A client sends 100 requests at 10:00:59 and 100 more at 10:01:00. Two hundred in two seconds, and every one was within the rules.",
    parts: [
      ["Fixed window", "One counter per clock window. Tiny memory, trivial code, but up to twice the limit can pass around the border."],
      ["Sliding log", "Store the time of every request, and count those in the last 60 seconds. Exact, but memory grows with the limit."],
      ["Sliding window counter", "Keep the current and the previous window's counters, and weight the previous one by how much of it still overlaps. Nearly exact with two numbers: the best default."],
      ["Token bucket", "Tokens drip in at the sustained rate up to a maximum. Each request takes one. Allows controlled bursts. Needs two numbers: tokens and last refill time."],
      ["Leaky bucket", "Requests enter a queue that drains at a fixed rate. Output is perfectly smooth; bursts wait or are dropped. Good in front of systems that need a steady rate."],
    ],
    table: ["COMPARISON", ["Algorithm", "Burst", "Memory per key", "Accuracy"], [["Fixed window", "2x at the border", "1 number", "Low"], ["Sliding log", "No", "1 per request", "Exact"], ["Sliding counter", "Small", "2 numbers", "High"], ["Token bucket", "Up to bucket size", "2 numbers", "Exact on average"], ["Leaky bucket", "Queued", "Queue", "Smooth output"]]],
    anim: ["The border problem and the sliding fix", "c:Client | f:Fixed window:limit 100, s:Sliding counter:limit 100 | p:Prev minute:0, n:This minute:0 | a:API:0 passed", [
      ["c>f", "100 at 10h00m59", "All 100 requests are inside minute 10:00, and allowed.", "p=100; f=100 of 100"],
      ["f>a", "pass 100", "They reach the API.", "a=100 passed"],
      ["c>f", "100 at 10h01m00", "A new minute begins, and the counter is zero again.", "n=0; f=0 of 100"],
      ["f>a", "pass 100", "200 requests within two seconds: **double the limit**.", "a=!200 in 2 s"],
      ["c>s", "same traffic", "Sliding counter: at second 0 of the new minute, the previous minute still overlaps 100%.", "a=100 passed; s=checking"],
      ["s>p", "100 x 100%", "Estimated count = 100 x 1.0 + 0 = 100. The limit is reached, so the request is refused.", "s=+refused"],
      ["s>n", "at second 30", "Half a minute later: 100 x 50% + 0 = 50, so 50 requests are allowed.", "s=+50 allowed; n=50"],
    ]],
    example: [
      ["Requirement", "Allow short bursts of 20, and 5 per second on average."],
      ["Choose", "Token bucket: capacity 20, refill 5 per second."],
      ["Time 0", "The client sends 20 requests: all pass, 0 tokens left."],
      ["Time 1 s", "5 tokens were added. 8 requests arrive: 5 pass, 3 get 429 with Retry-After 1."],
      ["Time 5 s", "No requests for 4 seconds: 20 tokens again (capped). A new burst of 20 is possible."],
    ],
    code: `function allow(bucket, now) {
  const refill = (now - bucket.last) * bucket.rate;     // tokens since last time
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + refill);
  bucket.last = now;
  if (bucket.tokens < 1) return false;                  // 429
  bucket.tokens -= 1;
  return true;
}`,
    use: "Sliding counter for quotas, token bucket for APIs with bursts, leaky bucket to protect fragile back ends.",
    avoid: "Fixed windows for security limits such as login attempts, since the border doubles them.",
    mistakes: [["A timer for every bucket", "No background refill is needed. Compute tokens from the elapsed time on each request."], ["One limit for all endpoints", "A search may cost 100 times a ping. Charge by cost: take 10 tokens for expensive calls."], ["Rejecting without help", "Return Retry-After and the remaining quota, or clients will hammer you."]],
    check: "A token bucket has capacity 10 and refill 2 per second. A client sends 4 requests per second for 10 seconds. When does it first get refused, and what is its rate afterwards?",
    answer: "Tokens fall by 2 per second net (4 used, 2 added), so 10 tokens last 5 seconds. After that only the refill rate of 2 per second passes, and half of the requests are refused.",
    qa: [["Token bucket or leaky bucket?", "Token bucket limits the average but lets bursts through at once. Leaky bucket shapes traffic into a constant output by queueing. Choose by whether the back end can handle bursts."], ["How would you limit by cost, not count?", "Assign each request a cost (rows, CPU, response size) and take that many tokens, charging an estimate first and correcting afterwards."]],
    take: "Decide first how you want to treat bursts; the algorithm follows from that.",
  }),
  "api-infrastructure--distributed-rate-limiting": lesson({
    intro: "When many gateways enforce one limit, they must share counts. The challenge is to be **accurate enough** without adding a slow remote call to each request.",
    scene: "The limit is 100 per minute per customer. With ten gateways each counting alone, a customer gets 1,000. With one shared counter each request needs a network call, and when that counter's server fails, the entire API fails with it.",
    parts: [
      ["Central counter", "All gateways use one fast store. Exact and simple, adding 0.5-1 ms per request. Read, compare and write must be **one atomic operation** (a script or an increment with expiry)."],
      ["Local share", "Divide the limit by the number of gateways. No network, but unfair if the balancer is uneven, and it must adapt when gateways come and go."],
      ["Leased tokens", "Each gateway takes a batch of tokens (say 10) from the central bucket and serves from memory, returning for more when empty. 90% fewer calls, with a small error."],
      ["Gossip and sync", "Count locally and exchange counts every 100 ms. Very fast, allows some overshoot. Good for large anti-abuse limits."],
      ["Hot keys and failure", "One huge customer makes one counter hot: split it into several sub-counters. If the store is down, use a local emergency limit instead of blocking all or allowing all."],
    ],
    anim: ["A race, then an atomic script, then leases", "c:Client | g1:Gateway 1, g2:Gateway 2 | r:Counter store:99 of 100 | a:API", [
      ["g1>r", "read 99", "Both gateways handle a request at the same moment. Gateway 1 reads 99.", "g1=sees 99"],
      ["g2>r", "read 99", "Gateway 2 also reads 99, before gateway 1 writes.", "g2=sees 99"],
      ["g1>a", "allow", "Both think there is room for one more.", "r=100 of 100"],
      ["g2>a", "allow", "101 requests passed: a classic read-modify-write race.", "r=!101 of 100; a=!101"],
      ["g1>r", "atomic check+add", "Fix: one script does check and increment in the store. Only one request wins the last slot.", "r=+100 of 100; g1=+allowed"],
      ["g2>r", "atomic check+add", "The other is refused.", "g2=~429"],
      ["g1>r", "lease 10", "Next minute: to save calls, each gateway leases 10 tokens at once.", "r=10 leased; g1=10 tokens"],
      ["c>g1", "9 more requests", "Gateway 1 answers nine requests from memory with no network call at all.", "g1=+1 token left"],
    ]],
    example: [
      ["Numbers", "20 gateways, 50,000 requests per second, 5,000 customers."],
      ["Central counter", "50,000 store operations per second: possible, but a hot and critical dependency."],
      ["Leases of 20", "2,500 operations per second. Error: at most 20 x 20 = 400 unused tokens, so use smaller leases for small limits."],
      ["Failure mode", "Store down: each gateway allows limit / 20 locally and raises an alert."],
      ["Check", "Compare passed counts per customer with the limit; accept 2% overshoot."],
    ],
    code: `-- atomic sliding window (runs inside the store)
local now, window, limit = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)
if redis.call('ZCARD', KEYS[1]) >= limit then return 0 end
redis.call('ZADD', KEYS[1], now, ARGV[4])      -- unique request id
redis.call('PEXPIRE', KEYS[1], window)
return 1`,
    use: "Several gateway instances or regions that share a customer limit.",
    avoid: "Perfect global accuracy across continents: 150 ms per request is worse than a little overshoot.",
    mistakes: [["Get then set", "Two separate calls always race. Use atomic operations."], ["Trusting gateway clocks", "Different clocks give different windows. Use the store's time."], ["No expiry", "Counters for millions of old keys fill the memory."]],
    check: "A limit is 1,000 per minute over 4 regions, with regional counters synchronised every second. What is the worst overshoot, and how can you reduce it?",
    answer: "In the first second each region may allow up to 1,000 before hearing from others: up to 4,000. Give each region a budget (e.g. 250, with rebalancing), synchronise faster as the limit is approached, or route each customer to one home region.",
    qa: [["Should the limiter fail open or closed?", "Open with a local fallback for normal traffic, so a limiter outage does not become an API outage; closed for login, password reset and payment attempts."], ["How do you limit at several levels at once?", "Check from cheapest to most specific: IP at the edge, then key, tenant and endpoint. Reserve all atomically, or give back tokens if a later check fails."]],
    take: "Make the check atomic, take tokens in batches, and decide beforehand what happens when the counter is gone.",
  }),
};
