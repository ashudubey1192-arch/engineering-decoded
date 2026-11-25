import { lesson } from "../schema.js";

export default {
  "introduction-to-system-design--how-to-approach-a-system-design-problem": lesson({
    intro: "A system design problem has no single right answer, but it does have a reliable **order of work**: understand, estimate, sketch, deepen, and challenge your own design.",
    scene: "You are asked to design a link shortener in 45 minutes. One candidate starts drawing Kafka and five databases in the first minute. Another asks about traffic, finds that reads are 100 times the writes, and lets that fact choose the design. The second candidate gets the job.",
    parts: [
      ["Step 1: Requirements (5 minutes)", "Agree what the system must do and how well it must do it, and say what you leave out.", ["**Functional:** two or three core actions a user can perform.", "**Quality:** scale, latency, availability, consistency, durability.", "**Out of scope:** say it aloud, so that nobody waits for it."]],
      ["Step 2: Estimates (5 minutes)", "Calculate requests per second (average and peak), storage for a few years, and bandwidth. Only keep numbers that change a decision, for example 'does it fit on one machine?'."],
      ["Step 3: API and data model (5 minutes)", "Write the three or four main endpoints and the main entities with their keys. The access pattern that appears here decides the database far better than taste does."],
      ["Step 4: High-level design (10 minutes)", "Draw client, entry point, services, stores and queues. Trace **one write and one read** through the picture from end to end before adding anything."],
      ["Step 5: Deep dives (15 minutes)", "Choose the two or three parts where this problem is hard, such as id generation, hot keys or fan-out. Offer alternatives, choose one, and state its cost."],
      ["Step 6: Challenge it (5 minutes)", "What breaks first at ten times the load? What happens when each box fails? How would you notice? What would you do with more time?"],
    ],
    table: ["WHAT THE NUMBERS TELL YOU", ["Finding", "Design consequence"], [["Reads far exceed writes", "Cache, replicas, CDN, precomputed views"], ["Writes far exceed reads", "Queue, batching, append-only storage, sharding"], ["Data fits on one machine", "One primary with replicas; do not shard"], ["Must never lose or double", "Transactions, idempotency keys, outbox, reconciliation"], ["Users around the world", "Edge caching, regional reads, a decision on write location"]]],
    anim: ["A 45 minute design, minute by minute", "r:Requirements | e:Estimates | h:High-level sketch | d:Deep dive | c:Challenge", [
      ["r", "0 to 5 min", "Ask: shorten and redirect only? Custom names? Expiry? Agree on **redirect under 100 ms** and links never lost.", "r=+2 actions agreed"],
      ["r>e", "5 to 10 min", "100M new links per month is 40 writes per second. At 100 reads per write: 4,000 reads per second.", "e=40 w/s and 4k r/s"],
      ["e>h", "10 to 25 min", "Reads dominate, so the sketch is: balancer, stateless service, cache, key-value store.", "h=cache first"],
      ["h>d", "25 to 35 min", "The hard part: unique short codes. Compare hash, random and counter; choose counter ranges in base 62.", "d=id generation"],
      ["d>h", "revise sketch", "The deep dive adds an id service to the sketch. Going back is normal and shows judgement.", "h=+ id service"],
      ["h>c", "35 to 45 min", "What if the cache dies? 4,000 reads per second hit the store: size it for that, or protect it with request merging.", "c=~cache loss plan"],
      ["c>r", "final check", "Compare the design with the agreed requirements one by one, and name what you would do next.", "c=+covered; r=+all met"],
    ]],
    example: [
      ["Clarify", "'Do links expire? Do we need analytics?' The interviewer says: no expiry, simple click counts, eventually consistent."],
      ["Estimate", "100M per month x 500 bytes x 60 months = 3 TB. It does not fit in memory but fits on a few nodes. Peak reads 12,000 per second."],
      ["Define the API", "`POST /links {url}` returns a code; `GET /{code}` returns a redirect. The read is a lookup by one key, so a key-value store fits."],
      ["Sketch and trace", "Write: service takes an id from its range, stores code and URL. Read: cache, then store, then 302 redirect."],
      ["Go deep", "Counter ranges: each server leases 10,000 ids at a time, so there is no coordination per request and no collisions."],
      ["Challenge", "A viral link: one key gets 50,000 reads per second. Add a tiny in-process cache and let the CDN cache redirects for a minute."],
    ],
    use: "Interviews, design documents at work, and reviewing other people's designs.",
    avoid: "Following the timetable mechanically. If the interviewer pulls you towards one topic, go there.",
    mistakes: [["Solution first", "Naming products before requirements makes every later choice look like a guess. Begin with questions and numbers."], ["Silent thinking", "The interviewer grades your reasoning. Say the options, the choice and the price aloud."], ["No failure story", "A design that only works when everything works is half a design. Walk through at least one failure."]],
    check: "You have five minutes left and have not discussed failures. What two questions would you answer first, and why?",
    answer: "First: what happens when the main data store (or its leader) fails, because it decides whether data is lost and how long the system is down. Second: what breaks first at ten times the load, since it shows you know the bottleneck. Both prove that you understand the design's limits.",
    qa: [["How much should you draw?", "Five to ten boxes that you can explain. Each box must have a reason from the requirements; remove those that have none."], ["What if you do not know a technology the interviewer mentions?", "Say so, describe the properties you need (ordered log, replay, partitions) and continue. Reasoning about properties is worth more than names."]],
    take: "Requirements choose numbers, numbers choose mechanisms, and mechanisms come with costs. Say all three aloud.",
  }),
};
