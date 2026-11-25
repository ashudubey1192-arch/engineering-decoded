import { deep } from "../schema.js";

export default {
  "api-design--what-is-an-api": deep({
    anim: ["One contract, two implementations", "m:Mobile app | api:API contract:v1 | o:Old monolith, n:New service | d:Database", [
      ["m>api", "PATCH /notif/88", "The app calls the published contract. It knows the URL, method and fields, and nothing about what is behind.", "api=validates"],
      ["api>o", "mark read", "Today the contract is fulfilled by the old monolith.", "o=running"],
      ["o>d", "UPDATE", "The row changes and the API answers `204 No Content`.", "d=read = true"],
      ["api>n", "switch backend", "The team replaces the monolith with a new service behind the **same** contract.", "o=retired; n=+running"],
      ["m>api", "PATCH /notif/89", "The app sends the same request as before. No release was needed: that is what a contract buys.", "m=+unchanged"],
      ["api>m", "422 bad field", "A request that breaks the contract is refused with a clear error rather than guessed at.", "m=~fix request"],
    ]],
    more: [
      ["Public, partner, internal", "Public APIs change slowly and need versions, quotas and docs. Internal APIs can move faster, but only if callers are known and contract-tested."],
      ["Hyrum's law", "With enough users, every observable behaviour, even undocumented order or timing, will be depended on. Expose less than you are tempted to."],
      ["Contract first", "Write the schema (OpenAPI, protobuf) before code. Generate clients, mocks and validation from it, and fail the build on breaking changes."],
    ],
    use: "Two programs or teams need to change at different speeds.",
    avoid: "Splitting one simple module behind a network call just to have an API: you gain latency and failure for nothing.",
    answer: "`PATCH /users/me/notifications/88` with `{\"read\": true}` (or `PUT /notifications/88/read`). Success: `204 No Content`, or `200` with the updated resource. Repeating it gives the same state, so it is idempotent. Unknown id: 404.",
    qa: [
      ["What makes a change breaking?", "Removing or renaming a field, changing a type or meaning, making an optional input required, tightening validation, or changing error codes. Adding optional inputs and new output fields is normally safe."],
      ["Library API versus network API?", "A library call is in-process: fast, and it either runs or not. A network call can be slow, duplicated, or fail after doing the work, so its contract must cover timeouts, retries and idempotency."],
    ],
  }),
  "api-design--idempotency": deep({
    anim: ["Two concurrent retries, one transfer", "c1:Try 1, c2:Try 2 | api:Transfer API | k:Keys table:empty | b:Balances:A 100", [
      ["c1>api", "POST key=T9", "The client generates key T9 once and sends it with every attempt of this transfer.", "api=handling try 1"],
      ["api>k", "INSERT T9", "The key is inserted with a **unique** constraint in the same transaction as the work.", "k=T9 in progress"],
      ["c2>api", "POST key=T9", "A retry arrives while the first is still running.", "c2=retrying"],
      ["api>k", "INSERT T9 fails", "The unique constraint rejects the second insert, so only one attempt can do the work.", "c2=~409 wait"],
      ["api>b", "A -30", "Try 1 moves the money and stores the response next to the key, then commits both together.", "b=+A 70; k=T9 done"],
      ["c2>api", "POST key=T9", "The retry comes again, finds T9 done, and receives the **saved** response.", "c2=+same result; c1=+200"],
    ]],
    more: [
      ["Scope and lifetime", "Key = user + endpoint + client key. Keep it longer than any retry can last (24 hours is common), and reject the same key with a different body."],
      ["Natural idempotency", "`SET status = paid` repeats safely; `balance = balance - 30` does not. Conditional updates with a version also make repeats harmless."],
      ["Beyond one database", "When the work calls another service, pass the key downstream. Every hop that has side effects must deduplicate for the chain to be safe."],
    ],
    use: "Payments, orders, emails and any POST that a client, queue or proxy may retry.",
    avoid: "Storing keys only in a cache that can evict them: a lost key is a duplicate charge.",
    answer: "The server needs an idempotency key sent by the client and stored with the result. The check must live in the **same transaction and database** as the debit (unique constraint), not in a separate cache, so check and work cannot disagree.",
    qa: [
      ["Is DELETE idempotent if the second call returns 404?", "Yes. Idempotency is about the resulting state, not the response. After one or five calls the resource is gone."],
      ["Who should create the idempotency key?", "The caller that decides to perform the action, before the first attempt. If the server created it, a lost first response would leave the client without it."],
    ],
  }),
  "api-design--data-formats": deep({
    anim: ["The same record as JSON and as Protobuf", "s:Service | j:JSON encoder, p:Protobuf encoder | n:Network | c:Consumer", [
      ["s>j", "user record", "The record has id 42, name Asha and active true.", "j=text"],
      ["j>n", "38 bytes", "JSON repeats every field name in each message: `{\"id\":42,\"name\":\"Asha\",\"active\":true}`.", "n=38 B"],
      ["s>p", "user record", "Protobuf sends a field **number** instead of a name, and small integers in one byte.", "p=binary"],
      ["p>n", "10 bytes", "The same record takes about 10 bytes. At 80,000 calls per second that is 2 MB/s saved on this one field set.", "n=+10 B"],
      ["n>c", "decode", "Binary decoding needs no text parsing, so CPU per call drops several times.", "c=+fast decode"],
      ["p>c", "new field 4", "A newer producer adds field 4. The old consumer skips numbers it does not know, so nothing breaks.", "c=+ignores 4"],
    ]],
    more: [
      ["Schema evolution rules", "Never reuse a field number, never change a type, give new fields defaults, and reserve removed numbers. A schema registry can check this in CI."],
      ["Row and column formats", "JSON, Avro and Protobuf store whole records: good for messages. Parquet and ORC store columns: good for analytics that read few fields of many rows."],
      ["Text has advantages", "Humans can read it in a log or with curl, and any language parses it. With gzip the size gap shrinks, although CPU cost remains."],
    ],
    use: "JSON at public edges; Protobuf or Avro inside and on streams; Parquet for analytics files.",
    avoid: "Binary formats where people must inspect payloads daily and volume is low.",
    answer: "Protocol Buffers (over gRPC). Benefits: much smaller messages and cheaper encoding/decoding at 80,000 calls per second, plus a typed schema with generated clients and safe evolution.",
    qa: [
      ["Avro or Protobuf for event streams?", "Avro ships or registers the writer schema, so readers resolve differences dynamically, which suits data pipelines. Protobuf relies on compiled field numbers and suits service calls. Both need compatibility checks."],
      ["Why is JSON risky for large integers?", "Many parsers use 64-bit floats, so integers above 2^53 lose precision. Send ids as strings."],
    ],
  }),
  "api-design--api-architectural-styles": deep({
    anim: ["One screen, three API styles", "m:Mobile app:needs 3 things | r:REST, g:GraphQL, p:gRPC | u:Users, o:Orders, v:Reviews", [
      ["m>r", "3 round trips", "With REST the app calls `/user`, `/orders` and `/reviews`. On a 100 ms mobile link, sequential calls cost 300 ms.", "m=~300 ms"],
      ["r>u,o,v", "3 resources", "Each resource is simple and cacheable by URL, which proxies and browsers understand.", "r=+cacheable"],
      ["m>g", "1 query", "With GraphQL the app asks for exactly the fields it needs in one request.", "m=+100 ms"],
      ["g>u,o,v", "resolvers", "The server fans out inside the data centre where calls cost 1 ms. But every query is different, so URL caching is gone.", "g=~cost per query"],
      ["m>p", "binary call", "With gRPC the app would need generated code and HTTP/2 features. Ideal between services, awkward in browsers.", "p=typed + fast"],
      ["p>o", "stream", "gRPC also streams in both directions, which suits service-to-service feeds of data.", "o=+streaming"],
    ]],
    more: [
      ["Events are a style too", "WebSockets, server-sent events and webhooks push instead of answering. AsyncAPI documents them as OpenAPI documents REST."],
      ["Mixing is normal", "REST for partners, GraphQL or a BFF for apps, gRPC inside, events between domains. Choose per boundary, not per company."],
      ["Hidden costs", "REST: many trips. GraphQL: query cost control and caching. gRPC: tooling and proxies. SOAP: verbosity, but mature contracts in banking."],
    ],
    use: "REST by default; GraphQL when many clients need different shapes; gRPC for internal high-rate calls.",
    avoid: "Picking a style for fashion. The team's ability to operate it matters more than elegance.",
    answer: "GraphQL (or a BFF endpoint) lets one request fetch all six pieces. The new problem: HTTP caching by URL no longer works, and you must control query cost (depth limits, batching), both of which REST gave you for free.",
    qa: [
      ["How do you stop an expensive GraphQL query?", "Limit depth and complexity, require persisted queries, batch with a data loader, set timeouts and charge rate limits by computed cost instead of by request."],
      ["Why does REST scale well on the web?", "Stateless requests can go to any server, uniform methods make retries and caching predictable, and URLs give every intermediary a cache key."],
    ],
  }),
  "api-design--rest-api-design": deep({
    anim: ["A wishlist through REST verbs", "c:Client | a:REST API | w:wishlists:empty, i:items:empty", [
      ["c>a", "POST /wishlists", "Create: the server chooses the id and answers `201 Created` with `Location: /wishlists/9`.", "w=id 9"],
      ["c>a", "PUT /9/items/p7", "Add product p7. PUT names the exact resource, so a retry cannot add it twice.", "i=p7"],
      ["c>a", "GET /9/items", "Read: safe and cacheable. The list is paginated from day one.", "c=+sees p7"],
      ["a>i", "check version", "An update carries `If-Match: v3`. If someone changed it to v4 the server answers 412 instead of overwriting.", "i=~v4"],
      ["c>a", "DELETE /9/items/p7", "Remove: `204 No Content`. Deleting again still leaves the same state.", "i=empty"],
      ["a>c", "problem+json", "Errors share one shape: type, title, status, detail, and a request id for support.", "c=clear errors"],
    ]],
    more: [
      ["Nouns, then verbs when needed", "Model resources as nouns. For real actions (cancel, publish), a sub-resource such as `POST /orders/7/cancellation` keeps history and status."],
      ["Richardson maturity", "Level 1 resources, level 2 verbs and status codes, level 3 links. Most good APIs stop at 2 and add links only where they help."],
      ["Long operations", "Return `202 Accepted` with a status URL. The client polls it or registers a webhook. Never hold a request open for minutes."],
    ],
    use: "Public and partner APIs, CRUD-like domains, and anything that benefits from HTTP caches.",
    avoid: "Chatty screens on slow networks, or streaming, unless you add a BFF or another style.",
    answer: "(a) `GET /users/me/wishlists`, 200. (b) `PUT /wishlists/9/items/{productId}`, 201 the first time, 200 or 204 on repeat. (c) `DELETE /wishlists/9/items/{productId}`, 204.",
    qa: [
      ["PUT or PATCH?", "PUT replaces the whole resource and is idempotent. PATCH changes some fields and is idempotent only if the patch sets values. Document which fields missing from a PUT mean."],
      ["How do you prevent lost updates over REST?", "Return an ETag, require `If-Match` on writes, and answer 412 when the version is stale so the client re-reads and merges."],
    ],
  }),
  "api-design--graphql-deep-dive": deep({
    anim: ["The N+1 problem and batching", "c:Client | g:GraphQL server | l:DataLoader:off | d:Database:0 queries", [
      ["c>g", "100 posts + author", "One query asks for 100 posts and each post's author.", "g=resolving"],
      ["g>d", "1 query", "The posts resolver runs one SQL query and returns 100 rows.", "d=1 query"],
      ["g>d", "100 queries", "The author resolver runs **once per post**. That is 100 more queries: the N+1 problem.", "d=!101 queries"],
      ["g>l", "collect ids", "With a DataLoader each resolver only registers the id it needs and waits one tick.", "l=100 ids"],
      ["l>d", "WHERE id IN (...)", "The loader removes duplicates and sends **one** query for all authors.", "d=+2 queries"],
      ["l>c", "100 posts", "Results are matched back to each post. The loader also caches within this request only.", "c=+fast"],
    ]],
    more: [
      ["Schema as product", "Types, nullability and deprecation notes are the contract. Mark fields `@deprecated` and watch usage before removal instead of cutting a new version."],
      ["Authorization lives in the domain", "Check access in the business layer for every object. The same object can be reached by many query paths, so route-level checks are not enough."],
      ["Federation", "Several teams own parts of one graph; a router plans each query across them. It is powerful, but the router becomes a critical dependency."],
    ],
    use: "Many clients with different needs, fast-changing screens, or a graph-like domain.",
    avoid: "Simple CRUD with one client, file uploads, or when edge caching is your main scaling tool.",
    answer: "Without care: 1 for posts + 100 for authors + 100 for follower counts = about 201 queries. A DataLoader (batching and per-request caching) reduces it to about 3.",
    qa: [
      ["How do you cache GraphQL?", "Client normalised caches by type and id, persisted queries sent as GET so a CDN can cache them, response caching with field-level hints, and caching in the data layer."],
      ["Why can a GraphQL response be 200 with errors?", "Parts of a query can fail independently. The response carries partial `data` plus an `errors` list, so monitoring must look inside the body, not only at status codes."],
    ],
  }),
  "api-design--grpc-deep-dive": deep({
    anim: ["One HTTP/2 connection, many calls", "p:Payments | ch:HTTP/2 channel | f:Fraud service", [
      ["p", "compile .proto", "Both teams generate typed code from one `.proto` file, so a wrong field type fails at **build** time.", "p=stub ready"],
      ["p>ch", "open once", "A single HTTP/2 connection is opened and reused for every call.", "ch=1 connection"],
      ["ch>f", "Score #1 #2 #3", "Three calls run at the same time as separate streams; a slow one does not block the others.", "f=3 in flight"],
      ["p>f", "deadline 80 ms", "Each call carries a deadline. Fraud passes the remaining time on to its own dependencies.", "f=~budget 80 ms"],
      ["f>p", "DEADLINE_EXCEEDED", "Call 2 runs out of time. Both sides stop working on it and payments uses its fallback rule.", "p=~fallback"],
      ["f>p", "stream scores", "For bulk work a server stream sends thousands of results with flow control, with no polling.", "p=+streaming"],
    ]],
    more: [
      ["Four call types", "Unary, server streaming, client streaming and bidirectional. Streams are ordered, and slow readers naturally slow the sender."],
      ["Load balancing pitfall", "One connection pins all calls to one backend behind an L4 balancer. Use client-side balancing, a mesh, or an L7 proxy that speaks HTTP/2."],
      ["Status and retries", "Use codes precisely: UNAVAILABLE may be retried, INVALID_ARGUMENT may not. Configure retry policy with budgets in the service config."],
    ],
    use: "Internal low-latency calls, polyglot services, streaming, and strict contracts.",
    avoid: "Public browser APIs (needs gRPC-Web and a proxy) and teams that debug mainly with curl.",
    answer: "Internally, gRPC gives small binary messages, typed contracts, deadlines and multiplexing, which matter in a payment's tight time budget. Browsers cannot control HTTP/2 frames and trailers, so they need a gRPC-Web proxy, and public users expect readable JSON and easy tooling.",
    qa: [
      ["How do you evolve a proto safely?", "Add new fields with new numbers, never change or reuse numbers, reserve removed ones, keep enums with an UNSPECIFIED zero value, and check compatibility in CI."],
      ["What is deadline propagation?", "The caller's deadline travels with the request, each hop subtracts time spent, and work stops when nothing is left. It prevents servers from finishing work nobody is waiting for."],
    ],
  }),
};
