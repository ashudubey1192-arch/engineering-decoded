import { lesson } from "../schema.js";

export default {
  "load-balancing--sticky-sessions": lesson({
    intro: "Sticky sessions (session affinity) send the same user to the **same server** every time. They are a quick fix for servers that keep state, and they carry hidden costs.",
    scene: "An old shop keeps carts in server memory. After adding a second server, half of the page views show an empty cart. Turning on stickiness fixes it in a minute, and two months later a server restart deletes 4,000 carts.",
    parts: [
      ["How affinity is done", "The balancer must recognise the user again.", ["**Balancer cookie:** the balancer sets a cookie naming the server.", "**Application cookie:** it remembers which server issued a session id.", "**Source IP hash:** works for any protocol, but whole offices share one address.", "**Consistent hash** on a user id or header."]],
      ["What it gives", "Local caches stay warm, in-memory sessions work, uploads in several parts meet on one server, and no shared store is needed."],
      ["What it costs", "Load becomes uneven, since users differ. A server failure loses its sessions. New servers get only new users, so scaling out does not relieve a hot server. Deploys must drain slowly."],
      ["Soft and hard affinity", "Soft: prefer the same server but any can serve, as state is elsewhere; used for cache warmth. Hard: correctness depends on it. Aim for soft."],
    ],
    anim: ["Stickiness, a crash, and the real fix", "u:User | lb:Balancer:no cookie | a:Server A, b:Server B | r:Session store:empty", [
      ["u>lb", "add shoes", "The first request has no cookie, so the balancer picks server A.", "lb=picks A"],
      ["lb>a", "cart in memory", "A stores the cart in memory, and the balancer sets the cookie `srv=A`.", "a=cart: shoes; lb=cookie srv=A"],
      ["u>a", "srv=A", "Every later request goes to A. It works.", "a=+cart: shoes"],
      ["a", "deploy restart", "A restarts for a deploy. Its memory is empty.", "a=!cart lost"],
      ["lb>b", "fallback", "The balancer sends the user to B, which has no cart.", "b=~empty cart"],
      ["b>r", "save cart", "Real fix: each change is written to a shared store.", "r=+cart: shoes"],
      ["lb>a", "any server", "Now A or B can serve. Stickiness may remain as a **hint** for warm caches, not as a requirement.", "a=+reads store; b=+reads store"],
    ]],
    example: [
      ["Symptom", "Random logouts after adding server 2."],
      ["Stop the bleeding", "Enable a balancer cookie with a 30-minute lifetime."],
      ["Find the state", "Search for in-memory sessions, local file uploads, per-process caches used as truth."],
      ["Move it", "Sessions to a shared store, uploads to object storage."],
      ["Remove or soften", "Switch off affinity on 10% of traffic, compare errors, then turn it off everywhere."],
    ],
    use: "Temporary compatibility with stateful applications, WebSocket upgrades that need several HTTP steps, and cache warmth.",
    avoid: "As a permanent architecture for user data you are not willing to lose.",
    mistakes: [["IP affinity behind a proxy", "All users of a mobile carrier or company look like one client and overload one server."], ["Long lifetimes", "A cookie that lasts a day keeps old servers busy and prevents rebalancing."], ["Assuming durability", "Stickiness decides where requests go. It does not keep the data when the server goes away."]],
    check: "You add three servers to a sticky pool that is at 90% CPU. After ten minutes the old servers are still at 90%. Why, and what can you do right now?",
    answer: "Existing users keep their cookies, so only new users reach the new servers. Shorten or expire the affinity cookies (or drain the old servers gradually) so users are reassigned, provided their session state is shared or may be recreated.",
    qa: [["Are WebSockets sticky?", "A connection is tied to one server by nature. Stickiness matters only for handshakes that need several HTTP requests, or when a reconnect should find local state."], ["How does consistent hashing help affinity?", "It maps a user to a server without storing a cookie or table, and moves only a small share of users when servers change."]],
    take: "Use stickiness to be faster, never to be correct.",
  }),
  "load-balancing--auto-scaling": lesson({
    intro: "Auto scaling changes the number of servers to match demand. Doing it well is less about adding machines than about choosing the **signal**, the **speed** and the **limits**.",
    scene: "A ticket site scales on CPU. At 10:00 a sale starts, traffic grows 20 times in 30 seconds, and new servers need four minutes to become ready. The site is down before the first one helps. Scheduled scaling at 9:45 would have been enough.",
    parts: [
      ["Reactive, scheduled, predictive", "Reactive follows a metric and is always late. Scheduled uses known events. Predictive learns daily patterns. Combine them: schedule the known, react to the rest."],
      ["Choosing the metric", "It must rise with load and fall when capacity is added.", ["**Good:** CPU for compute work, requests per instance, concurrency, age of the oldest queue message.", "**Poor:** memory (rarely falls), latency (may come from a dependency), total queue length."]],
      ["Target tracking", "'Keep average CPU at 60%' is a thermostat: desired = current x actual / target. At 90% with 4 servers: 4 x 90 / 60 = 6 servers."],
      ["Time to useful", "Detect (1 min) + start (1-3 min) + warm up (1 min). During it, the existing servers carry everything, so leave headroom, use pre-baked images or warm pools."],
      ["Scale in carefully", "Add quickly, remove slowly. Use cooldowns, drain connections, and keep a minimum that survives losing a zone."],
    ],
    anim: ["Target tracking at 60% CPU", "u:Load:400 rps | m:Metric:50% | s:Scaler:4 wanted | p:Pool:4 servers | d:Database:40%", [
      ["u>m", "800 rps", "Load doubles. Four servers rise to 90% CPU.", "u=800 rps; m=!90%"],
      ["m>s", "4 x 90 / 60", "The scaler calculates: 4 x 90 / 60 = 6 servers.", "s=6 wanted"],
      ["s>p", "start 2", "Two servers start. For the next 3 minutes the four still carry everything.", "p=~4 + 2 starting"],
      ["p>m", "6 ready", "After warm-up the load is spread over six.", "p=+6 servers; m=+60%"],
      ["u>d", "1600 rps", "Load doubles again and the pool grows to 12. Each server opens database connections.", "u=1600 rps; p=12 servers; d=!95%"],
      ["d>s", "max = 12", "More servers would only hurt the database. The **maximum** protects what does not scale.", "s=~capped at 12"],
      ["u>p", "400 rps", "Load falls. Servers are removed one by one after 10 quiet minutes, with draining.", "u=400 rps; p=+4 servers; m=50%; d=40%"],
    ]],
    example: [
      ["Load test one server", "At 60% CPU it serves 120 requests per second with good p95."],
      ["Set minimum", "Night load 200 per second needs 2 servers; 3 zones and one lost zone make the minimum 3."],
      ["Set maximum", "The database accepts 240 connections, at 20 per server: maximum 12."],
      ["Set target", "60% CPU, scale out after 1 minute, scale in after 10."],
      ["Add a schedule", "Campaign at 10:00: minimum 10 from 9:40 to 11:00."],
      ["Test", "Replay a traffic spike, and measure errors between spike and readiness."],
    ],
    code: `# desired count for target tracking
desired = ceil(current * actual / target)

# example
ceil(4 * 90 / 60)  # 6
ceil(6 * 30 / 60)  # 3, applied slowly`,
    use: "Stateless services and queue workers with variable load.",
    avoid: "Databases and other stateful systems, or spikes faster than your start-up time without pre-scaling.",
    mistakes: [["No maximum", "A bug or an attack scales your bill, and crushes the database with connections."], ["Slow start", "Installing packages at boot turns every spike into an outage. Bake images."], ["Scaling on latency", "If the database is slow, adding web servers makes it slower."]],
    check: "Workers process 5 messages per second each, 200 messages per second arrive, and the queue holds 60,000. You want to drain it in 10 minutes. How many workers?",
    answer: "To keep up: 200 / 5 = 40 workers. To drain 60,000 in 600 seconds: 100 per second more = 20 workers. Total 60.",
    qa: [["Why is the age of the oldest message a better signal than queue length?", "It is the delay users experience and works for any job size. A long queue of tiny jobs may be fine; a short queue of huge ones may not."], ["What is flapping and how do you stop it?", "Repeated scale out and in. Use different thresholds or cooldowns for each direction, longer averages, and a target with some distance from both limits."]],
    take: "Scale on a signal that your capacity controls, start before you need it, and cap it at what the weakest dependency can bear.",
  }),
};
