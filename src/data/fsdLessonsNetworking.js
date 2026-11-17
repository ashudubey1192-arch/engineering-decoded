// Networking and real-time communication lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const networkingLessons = {
  "networking--how-the-web-works": fsd({
    intro:
      "Every frontend design starts with a request. When a user types a URL, the browser resolves a name to an address, opens a connection, negotiates encryption, asks for a document, and then discovers dozens of further resources. Knowing each hop tells you where latency hides and which layer a design decision actually changes.",
    concepts: [
      "DNS turns shop.example.com into an IP address. The answer is cached at several levels: the browser, the operating system, the router, and the resolver run by the ISP or a public provider. A cold lookup can cost tens of milliseconds before any byte of your app moves.",
      "TCP (or QUIC for HTTP/3) establishes a reliable connection, and TLS negotiates keys so the traffic is private. On HTTP/1.1 and HTTP/2 that is one round trip for TCP plus one for TLS 1.3, which is why reusing connections and serving from a nearby CDN edge matters so much.",
      "The HTML response is parsed incrementally. Each stylesheet, script, font, and image it references becomes another request, so the critical path is a tree of requests, not a single download. Frontend system design is largely about shaping that tree.",
    ],
    code: `// Measure the hops of the current page load in the browser console.
const [nav] = performance.getEntriesByType("navigation");

const timeline = {
  dns: nav.domainLookupEnd - nav.domainLookupStart,
  tcp: nav.connectEnd - nav.connectStart,
  tls: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
  ttfb: nav.responseStart - nav.requestStart,
  download: nav.responseEnd - nav.responseStart,
  domReady: nav.domContentLoadedEventEnd - nav.startTime,
  protocol: nav.nextHopProtocol, // "h2", "h3" or "http/1.1"
};

console.table(timeline);`,
    walkthrough:
      "The Navigation Timing API records a timestamp for each phase of the document request. Subtracting neighbours gives the cost of each hop. A large dns value suggests adding a dns-prefetch or preconnect hint; a large ttfb points at the server or a missing CDN cache; a large download points at document size or compression. nextHopProtocol tells you whether HTTP/2 or HTTP/3 was actually negotiated.",
    flow: ["Resolve the name", "Connect and encrypt", "Request, parse, discover more"],
    mistake:
      "Treating the server response time as the whole story. A 50 ms API can still feel slow if the browser spends 300 ms on DNS, connection setup, and a chain of render-blocking resources before it even sends the request.",
    exercise:
      "Your users in Sydney see a 600 ms time to first byte while users in Frankfurt see 80 ms. The origin is in Frankfurt. What two changes would you consider first?",
    answer:
      "Serve cacheable responses from a CDN edge close to Sydney so the round trips are short, and keep connections warm (HTTP/2 or HTTP/3 with connection reuse, plus preconnect hints for third-party origins). If the document itself must be dynamic, consider edge rendering or caching the shell and fetching personalized data separately.",
    deepDive: [
      {
        heading: "Where each millisecond goes",
        points: [
          "Round-trip time (RTT) is the physical floor. Light in fibre needs roughly 100 ms for a Frankfurt to Sydney round trip, and no code change removes it; only moving content closer does.",
          "HTTP/2 multiplexes many requests over one connection, removing the six-connections-per-origin limit of HTTP/1.1. HTTP/3 runs over QUIC on UDP and avoids head-of-line blocking when packets are lost.",
          "A CDN stores copies of responses at edge locations. Cache hits skip the long trip to the origin; cache misses still benefit from the CDN's warm, optimized connection back to the origin.",
        ],
      },
      {
        heading: "Resource hints shape the request tree",
        code: `<!-- Warm up a third-party origin before the first request needs it -->
<link rel="preconnect" href="https://images.cdn.example" crossorigin>
<link rel="dns-prefetch" href="https://analytics.example">

<!-- Fetch the hero image early, at high priority -->
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">`,
      },
    ],
    animation: {
      title: "From URL to first paint",
      nodes: [
        ["browser", "Browser", "user types URL"],
        ["dns", "DNS resolver", "name → IP"],
        ["edge", "CDN edge", "TCP + TLS"],
        ["origin", "Origin server", "builds HTML"],
        ["render", "Renderer", "parse + paint"],
      ],
      steps: [
        ["browser", "dns", "lookup", "The browser checks its caches, then asks a resolver for the IP of shop.example.com."],
        ["dns", "browser", "IP", "The resolver returns an address and a TTL that says how long to cache it."],
        ["browser", "edge", "handshake", "A TCP and TLS handshake opens an encrypted connection to the nearest edge."],
        ["edge", "origin", "miss", "On a cache miss the edge forwards the request to the origin over a warm connection."],
        ["origin", "edge", "HTML", "The origin responds and the edge may keep a copy for the next visitor."],
        ["edge", "render", "bytes", "The browser parses HTML as it streams in and discovers CSS, JS, and images to fetch."],
      ],
    },
  }),

  "networking--communication-protocols": fsd({
    intro:
      "A protocol is an agreement about message shape and timing. The browser speaks HTTP for documents and APIs, WebSocket for long-lived two-way channels, and WebRTC for peer media, all layered on top of TCP, UDP, and TLS. Choosing the right one is a design decision with consequences for latency, caching, and infrastructure.",
    concepts: [
      "Transport protocols move bytes. TCP guarantees ordered, reliable delivery; UDP sends independent datagrams with no guarantee. QUIC rebuilds reliability and encryption on top of UDP so a single lost packet does not stall every stream.",
      "Application protocols give the bytes meaning. HTTP is request and response with methods, status codes, and headers. WebSocket upgrades an HTTP connection into a persistent full-duplex channel. SMTP, FTP, and SSH exist too, but a browser app rarely speaks them directly.",
      "The choice follows the interaction. Fetching data on demand fits HTTP. A server pushing frequent updates fits Server-Sent Events or WebSocket. Low-latency audio and video between users fits WebRTC over UDP.",
    ],
    code: `// One app, three protocols, each chosen for its interaction pattern.

// 1. Request/response: product details (cacheable HTTP GET)
const product = await fetch("/api/products/42").then((r) => r.json());

// 2. Server push only: order status updates (SSE over HTTP)
const status = new EventSource("/api/orders/9001/events");
status.onmessage = (event) => renderStatus(JSON.parse(event.data));

// 3. Two-way, low latency: support chat (WebSocket)
const chat = new WebSocket("wss://chat.example.com/rooms/9001");
chat.onmessage = (event) => appendMessage(JSON.parse(event.data));
chat.onopen = () => chat.send(JSON.stringify({ type: "join", orderId: 9001 }));`,
    walkthrough:
      "Product details are fetched once and benefit from HTTP caching. Order status only flows from server to client, so SSE gives automatic reconnection without a custom protocol. Chat needs messages in both directions with minimal overhead, so a WebSocket keeps one connection open. Each choice also changes infrastructure: SSE and WebSocket require servers and proxies that tolerate long-lived connections.",
    flow: ["Identify the interaction", "Pick transport + protocol", "Plan infrastructure"],
    mistake:
      "Reaching for WebSockets for everything. A socket bypasses HTTP caching, needs sticky connections or a pub/sub layer to scale, and must handle reconnection manually. If data flows only one way or changes rarely, plain HTTP or SSE is simpler and cheaper.",
    exercise:
      "A stock ticker shows prices that change several times a second, and users never send data back. Which protocol would you choose and why?",
    answer:
      "Server-Sent Events fit well: the flow is one-directional, SSE runs over ordinary HTTP, reconnects automatically, and supports resuming with Last-Event-ID. A WebSocket also works but adds complexity you do not need unless the client must send frequent messages too.",
    deepDive: [
      {
        heading: "The layers in one picture",
        points: [
          "Application: HTTP, WebSocket, WebRTC data channels, gRPC.",
          "Security: TLS 1.3 encrypts HTTP/1.1 and HTTP/2; QUIC builds TLS 1.3 in.",
          "Transport: TCP for HTTP/1.1, HTTP/2, and WebSocket; UDP for QUIC (HTTP/3) and WebRTC media.",
          "Network: IP routes packets between machines; DNS maps names to IP addresses.",
        ],
      },
    ],
    animation: {
      title: "Matching interactions to protocols",
      nodes: [
        ["app", "Frontend app", "three features"],
        ["http", "HTTP", "request/response"],
        ["sse", "SSE", "server → client"],
        ["ws", "WebSocket", "both directions"],
        ["server", "Servers", "API + realtime"],
      ],
      steps: [
        ["app", "http", "GET", "Product details are requested once with a cacheable HTTP GET."],
        ["http", "server", "cache?", "The request can be answered by a browser, CDN, or origin cache."],
        ["server", "sse", "event", "Order status changes are pushed down a long-lived SSE stream."],
        ["sse", "app", "update", "EventSource delivers each event and reconnects on its own if the stream drops."],
        ["app", "ws", "message", "Chat messages travel up the same WebSocket that delivers replies."],
        ["ws", "server", "frame", "WebSocket frames have tiny headers, so frequent small messages stay cheap."],
      ],
    },
  }),

  "networking--rest-apis": fsd({
    intro:
      "REST models an API as resources with URLs and a uniform set of HTTP methods. For frontend engineers, a well-designed REST API means predictable endpoints, cacheable reads, meaningful status codes, and pagination that scales. A poorly designed one leaks into the UI as waterfalls and duplicated state.",
    concepts: [
      "Resources are nouns addressed by URLs, such as /products/42 or /users/7/orders. Methods are verbs: GET reads, POST creates, PUT replaces, PATCH partially updates, DELETE removes. GET, PUT, and DELETE are idempotent: repeating them leaves the same result.",
      "Statelessness means each request carries everything the server needs, typically an auth token or cookie. That lets any server instance handle any request and makes horizontal scaling and caching straightforward.",
      "Status codes are part of the contract. 200 and 201 for success, 204 for no content, 304 for not modified, 400 and 422 for bad input, 401 for unauthenticated, 403 for forbidden, 404 for missing, 409 for conflicts, 429 for rate limits, and 5xx for server failures. The UI should branch on them.",
    ],
    code: `// A small typed client that respects REST semantics.
async function api(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(\`/api\${path}\`, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || response.statusText);
    error.status = response.status; // 401 → sign in, 409 → refresh, 422 → field errors
    error.details = data?.errors;
    throw error;
  }
  return data;
}

// Cursor pagination keeps pages stable while new items are inserted.
const page = await api("/products?limit=20&cursor=eyJpZCI6NDJ9");
await api("/cart/items", { method: "POST", body: { productId: 42, qty: 1 } });
await api("/cart/items/42", { method: "PATCH", body: { qty: 2 } });`,
    walkthrough:
      "The helper centralizes headers, credentials, and error mapping so every feature handles a 401 or 422 the same way. Reads use GET and can be cached; writes use the method that matches their meaning. The product list uses a cursor rather than a page number, so inserting new products does not shift every subsequent page and cause duplicates.",
    flow: ["Model resources", "Map verbs and statuses", "Paginate and cache reads"],
    mistake:
      "Returning 200 with an error body, or putting actions in URLs like /getProducts and /deleteUser. Clients then cannot rely on status codes, caches cannot reason about methods, and every endpoint needs custom handling.",
    exercise:
      "A product page needs the product, its seller, and the first five reviews. With pure REST that is three requests. Name two ways to avoid a slow request waterfall.",
    answer:
      "Fire the three requests in parallel with Promise.all since none depends on another's result, or offer a composite endpoint or an include parameter such as /products/42?include=seller,reviews. A backend-for-frontend layer can also aggregate them server side close to the data.",
    deepDive: [
      {
        heading: "Offset versus cursor pagination",
        points: [
          "Offset pagination (?page=3&limit=20) is simple and supports jumping to a page, but skips or duplicates items when the list changes, and deep offsets are slow in many databases.",
          "Cursor pagination (?cursor=...&limit=20) returns an opaque pointer to the last item. It is stable under inserts and fast at any depth, which suits infinite feeds.",
        ],
      },
      {
        heading: "Versioning and evolution",
        paragraphs: [
          "Additive changes such as new optional fields are safe. Removing or renaming fields breaks clients that are still deployed, including mobile apps you cannot force to update. Version through the URL (/v2/) or a header, and deprecate with a timeline.",
        ],
      },
    ],
    animation: {
      title: "A REST request lifecycle",
      nodes: [
        ["ui", "UI action", "add to cart"],
        ["client", "API client", "method + body"],
        ["cache", "HTTP cache", "GETs only"],
        ["server", "REST server", "/cart/items"],
        ["store", "Client state", "cart view"],
      ],
      steps: [
        ["ui", "client", "POST", "The button calls POST /cart/items with the product and quantity."],
        ["client", "server", "JSON", "The request carries credentials and a JSON body; writes bypass the HTTP cache."],
        ["server", "client", "201", "201 Created with the new item means success; 422 would carry field errors."],
        ["client", "store", "update", "The client updates cart state from the response instead of guessing."],
        ["ui", "cache", "GET", "Later, GET /products/42 can be answered by a fresh cached copy."],
        ["cache", "server", "304?", "A stale copy is revalidated; 304 Not Modified saves re-downloading the body."],
      ],
    },
  }),

  "networking--graphql": fsd({
    intro:
      "GraphQL exposes one endpoint and a typed schema. The client sends a query describing exactly the shape it needs, and the server returns that shape. It solves over-fetching and request waterfalls for complex screens, at the cost of harder HTTP caching and a new class of performance risks on the server.",
    concepts: [
      "The schema is the contract. Types, fields, and relationships are declared once, and tools generate client types and validate queries at build time. Queries read data, mutations change it, and subscriptions stream updates.",
      "Clients choose the shape. A product card query can ask for name and price only, while the detail page asks for reviews and seller in the same request. This removes over-fetching and multiple round trips.",
      "Normalized client caches such as Apollo Client or urql's graphcache store each object by type and ID. When a mutation returns an updated Product:42, every component showing that product updates automatically.",
    ],
    code: `// A single request for a product page, shaped by the component tree.
const PRODUCT_PAGE = /* GraphQL */ \`
  query ProductPage($id: ID!, $reviewCount: Int = 5) {
    product(id: $id) {
      id
      name
      price { amount currency }
      seller { id name rating }
      reviews(first: $reviewCount) {
        edges { node { id rating body author { name } } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
\`;

const response = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: PRODUCT_PAGE, variables: { id: "42" } }),
});
const { data, errors } = await response.json();
if (errors?.length) reportPartialErrors(errors); // GraphQL can return data AND errors`,
    walkthrough:
      "One POST returns the product, its seller, and the first five reviews in exactly the requested shape. Variables keep the query text static, which allows persisted queries and caching by hash. Note that GraphQL usually responds with 200 even when some fields fail, so the client must inspect the errors array rather than relying on status codes alone.",
    flow: ["Declare needs in a query", "Server resolves the graph", "Normalized cache updates UI"],
    mistake:
      "Letting clients send arbitrary deep queries. A query nesting friends of friends of friends can explode server work. Protect the server with depth and complexity limits, persisted queries, and batching resolvers with a DataLoader to avoid N+1 database calls.",
    exercise:
      "Your team switches from REST to GraphQL and CDN cache hit rates drop to nearly zero. Why, and how could you recover some caching?",
    answer:
      "Queries are POST requests to one URL, so CDNs cannot key on the URL. Use persisted queries sent as GET requests with a query hash and variables in the URL, add cache-control hints per field, and rely on the normalized client cache for repeat reads within a session.",
    deepDive: [
      {
        heading: "REST versus GraphQL, honestly",
        points: [
          "Choose GraphQL when many clients need different shapes of deeply related data, or when product teams iterate quickly on screens.",
          "Choose REST when resources are simple, HTTP caching matters a lot, or the API is public and must be easy to consume with curl.",
          "Both can coexist: a GraphQL gateway in front of REST microservices is a common backend-for-frontend pattern.",
        ],
      },
    ],
    animation: {
      title: "One query, one response, one cache",
      nodes: [
        ["component", "Components", "declare fields"],
        ["query", "Query", "single POST"],
        ["server", "GraphQL server", "resolvers"],
        ["sources", "Data sources", "DB + services"],
        ["cache", "Normalized cache", "Type:ID"],
      ],
      steps: [
        ["component", "query", "fields", "Each component contributes the fields it needs to one page query."],
        ["query", "server", "POST", "The query and variables travel in a single request to /graphql."],
        ["server", "sources", "resolve", "Resolvers fetch product, seller, and reviews, batching calls with a DataLoader."],
        ["sources", "server", "rows", "Results are assembled into exactly the requested shape."],
        ["server", "cache", "data", "The client stores each object by type and ID, such as Product:42."],
        ["cache", "component", "render", "Every component reading Product:42 re-renders when that entry changes."],
      ],
    },
  }),

  "networking--grpc": fsd({
    intro:
      "gRPC is a remote procedure call framework that uses Protocol Buffers for compact binary messages and HTTP/2 for transport. It shines between backend services. Browsers cannot speak raw gRPC because they lack control over HTTP/2 framing and trailers, so frontends use gRPC-Web or Connect through a proxy.",
    concepts: [
      "A .proto file defines services, methods, and message types. Code generators produce typed client and server stubs in many languages, so a TypeScript frontend and a Go backend share one source of truth.",
      "Protocol Buffers encode fields by number in binary. Messages are smaller and faster to parse than JSON, and adding new field numbers keeps old clients compatible.",
      "gRPC supports unary calls and three streaming modes: server streaming, client streaming, and bidirectional. gRPC-Web supports unary and server streaming in browsers; full bidirectional streaming still needs WebSockets or WebTransport.",
    ],
    code: `// product.proto: the shared contract
syntax = "proto3";
package shop.v1;

service ProductService {
  rpc GetProduct (GetProductRequest) returns (Product);
  rpc WatchPrice (GetProductRequest) returns (stream PriceUpdate);
}

message GetProductRequest { string id = 1; }
message Product { string id = 1; string name = 2; int64 price_cents = 3; }
message PriceUpdate { string id = 1; int64 price_cents = 2; }

// Frontend (generated client, Connect-Web style)
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ProductService } from "./gen/shop/v1/product_pb";

const client = createClient(ProductService, createConnectTransport({ baseUrl: "/rpc" }));
const product = await client.getProduct({ id: "42" });
for await (const update of client.watchPrice({ id: "42" })) renderPrice(update.priceCents);`,
    walkthrough:
      "The proto file defines a unary GetProduct and a server-streaming WatchPrice. Code generation creates a typed TypeScript client, so calling getProduct feels like a local async function. The streaming call returns an async iterator that yields price updates as the server sends them. A proxy such as Envoy or a Connect-compatible server translates between the browser-friendly wire format and native gRPC.",
    flow: ["Define .proto contract", "Generate typed stubs", "Call through a web proxy"],
    mistake:
      "Reusing or renumbering field tags. Protobuf identifies fields by number, so changing a number or reusing a removed one makes old clients decode the wrong data silently. Reserve removed numbers instead.",
    exercise:
      "Your public web API is consumed by partners using curl and Postman, while internal services call each other thousands of times per second. Where would gRPC fit?",
    answer:
      "Use gRPC between internal services for compact payloads, typed contracts, and streaming. Keep the public API as REST or GraphQL with JSON, which is easier to inspect and consume. A gateway can translate between the two.",
    deepDive: [
      {
        heading: "Why browsers need a bridge",
        paragraphs: [
          "Native gRPC relies on HTTP/2 trailers to send the final status after the response body. Browser fetch APIs do not expose trailers or frame-level control, so gRPC-Web moves the status into the body and a proxy converts it back. Connect offers a similar protocol that also accepts plain JSON over POST, which keeps debugging in the network panel pleasant.",
        ],
      },
    ],
    animation: {
      title: "A gRPC-Web call",
      nodes: [
        ["proto", "product.proto", "contract"],
        ["client", "Typed client", "generated"],
        ["proxy", "Web proxy", "Envoy / Connect"],
        ["service", "gRPC service", "HTTP/2"],
        ["ui", "UI", "price stream"],
      ],
      steps: [
        ["proto", "client", "codegen", "The proto file generates a TypeScript client with typed request and response messages."],
        ["client", "proxy", "binary", "getProduct sends a compact protobuf message over HTTP to the proxy."],
        ["proxy", "service", "gRPC", "The proxy forwards it as native gRPC over HTTP/2."],
        ["service", "proxy", "stream", "WatchPrice keeps the response open and streams PriceUpdate messages."],
        ["proxy", "ui", "update", "Each message arrives as one iteration of the async iterator and updates the price."],
      ],
    },
  }),

  "communication--communication-overview": fsd({
    intro:
      "Real-time features such as chat, notifications, live scores, and collaborative editing all answer one question: how does the client learn about changes on the server quickly enough? The answer is a spectrum from simple polling to persistent sockets and peer connections, each with different costs.",
    concepts: [
      "Pull techniques have the client ask. Short polling asks on a timer; long polling asks and waits until the server has something to say. They work everywhere HTTP works and are easy to cache and debug.",
      "Push techniques keep a connection open so the server can speak first. Server-Sent Events push text events one way; WebSockets carry messages both ways. They cut latency and wasted requests but need servers built for many idle connections.",
      "Some communication is not browser to server at all. Webhooks are server to server callbacks, and WebRTC connects browsers directly to each other for media and data.",
    ],
    code: `// A decision helper you can adapt for design reviews.
function chooseTransport({ direction, updatesPerMinute, latencyBudgetMs, peerToPeer }) {
  if (peerToPeer) return "WebRTC";
  if (direction === "server-to-server") return "Webhook";
  if (direction === "both" && latencyBudgetMs < 500) return "WebSocket";
  if (direction === "server-to-client" && updatesPerMinute > 2) return "Server-Sent Events";
  if (latencyBudgetMs < 5000) return "Long polling";
  return "Short polling";
}

chooseTransport({ direction: "server-to-client", updatesPerMinute: 30, latencyBudgetMs: 1000 });
// → "Server-Sent Events" for a live score widget
chooseTransport({ direction: "server-to-client", updatesPerMinute: 0.1, latencyBudgetMs: 60000 });
// → "Short polling" for a nightly report status`,
    walkthrough:
      "The helper encodes the questions you should ask in a design review: who talks first, how often data changes, how fresh it must be, and whether a server is in the middle at all. The thresholds are illustrative. In practice also consider infrastructure: serverless platforms and some proxies cut long-lived connections, which pushes you back towards polling.",
    flow: ["Who talks first?", "How fresh must it be?", "What can infra sustain?"],
    mistake:
      "Choosing by novelty rather than requirements. A dashboard refreshed every five minutes does not need a WebSocket fleet; a collaborative editor cannot survive on 30-second polling.",
    exercise:
      "Classify each: an email inbox badge, a multiplayer drawing board, a payment provider confirming a charge to your backend.",
    answer:
      "Inbox badge: long polling or SSE, depending on infrastructure. Multiplayer drawing: WebSocket, since many small messages flow both ways with tight latency. Payment confirmation: a webhook from the provider's server to yours, which then notifies the browser over whatever channel the UI already uses.",
    deepDive: [
      {
        heading: "Comparing the options",
        points: [
          "Short polling: simplest, highest waste, latency up to the interval.",
          "Long polling: near real-time, one request per update, more server connections held open.",
          "SSE: one-way push over HTTP, automatic reconnect, text only.",
          "WebSocket: two-way, binary or text, needs custom reconnection and scaling.",
          "WebRTC: peer to peer, lowest latency for media, needs signaling and TURN servers.",
        ],
      },
    ],
    animation: {
      title: "The real-time spectrum",
      nodes: [
        ["short", "Short poll", "ask on a timer"],
        ["long", "Long poll", "ask and wait"],
        ["sse", "SSE", "server pushes"],
        ["ws", "WebSocket", "both directions"],
        ["rtc", "WebRTC", "peer to peer"],
      ],
      steps: [
        ["short", "long", "less waste", "Long polling removes empty responses by holding the request until data exists."],
        ["long", "sse", "one stream", "SSE keeps a single stream open instead of one request per update."],
        ["sse", "ws", "two-way", "WebSocket adds client-to-server messages on the same connection."],
        ["ws", "rtc", "direct", "WebRTC removes the server from the media path entirely."],
        ["rtc", "short", "trade-off", "Each step right lowers latency but raises infrastructure complexity."],
      ],
    },
  }),

  "communication--short-polling": fsd({
    intro:
      "Short polling is the client asking the server for news at a fixed interval. It is crude, but it works through every proxy, firewall, and serverless platform, and it is often the right answer for data that changes slowly. The design work is in choosing the interval and avoiding wasted or overlapping requests.",
    concepts: [
      "Each poll is an independent HTTP request. The server answers immediately, even when nothing has changed, so most responses for quiet data are wasted bandwidth and server work.",
      "Latency is bounded by the interval. With a 10-second interval, a change waits on average five seconds to appear. Halving the interval doubles the request volume across every connected user.",
      "Good pollers are polite: they use conditional requests so unchanged data returns 304, pause when the tab is hidden, back off when the server struggles, and never start a new request while one is still in flight.",
    ],
    code: `function startPolling(url, onData, { interval = 10000 } = {}) {
  let etag = null;
  let timer = null;
  let stopped = false;
  let delay = interval;

  async function poll() {
    if (stopped) return;
    if (document.visibilityState === "hidden") return schedule(); // skip hidden tabs
    try {
      const response = await fetch(url, { headers: etag ? { "If-None-Match": etag } : {} });
      if (response.status === 200) {
        etag = response.headers.get("ETag");
        onData(await response.json());
      }
      delay = interval; // 304 or 200: healthy
    } catch {
      delay = Math.min(delay * 2, 60000); // back off on errors
    }
    schedule();
  }

  // setTimeout after completion, never setInterval, so requests cannot overlap.
  const schedule = () => { timer = setTimeout(poll, delay); };
  poll();
  return () => { stopped = true; clearTimeout(timer); };
}

const stop = startPolling("/api/build/77/status", renderBuildStatus);`,
    walkthrough:
      "The poller schedules the next request only after the current one finishes, so a slow server never causes a pile-up. The ETag makes unchanged responses tiny 304s. Hidden tabs skip work, and errors double the delay up to a minute, which protects a struggling backend from thousands of clients retrying in lockstep.",
    flow: ["Wait interval", "Ask with ETag", "Render or back off"],
    mistake:
      "Using setInterval with an async fetch. If a response takes longer than the interval, requests overlap, responses can arrive out of order, and an older status can overwrite a newer one.",
    exercise:
      "Ten thousand users poll every 5 seconds. How many requests per second is that, and what is one cheap way to cut it in half without hurting freshness much?",
    answer:
      "10,000 / 5 = 2,000 requests per second. Pausing polling for hidden tabs often removes a large share, and adding jitter or lengthening the interval when data has been unchanged for a while reduces load further.",
    deepDive: [
      {
        heading: "When short polling is the right call",
        points: [
          "Build or export job status checked every few seconds for a minute.",
          "Dashboards where a refresh every 30 to 60 seconds is acceptable.",
          "Environments where long-lived connections are cut, such as some serverless functions or corporate proxies.",
        ],
      },
    ],
    animation: {
      title: "Polling with conditional requests",
      nodes: [
        ["timer", "Timer", "every 10s"],
        ["client", "Client", "ETag stored"],
        ["server", "Server", "status API"],
        ["ui", "UI", "build status"],
      ],
      steps: [
        ["timer", "client", "tick", "The timer fires after the previous request has fully completed."],
        ["client", "server", "If-None-Match", "The client asks for status and sends the last ETag it saw."],
        ["server", "client", "304", "Nothing changed, so the server replies 304 with no body."],
        ["client", "server", "poll again", "Ten seconds later the client asks again with the same ETag."],
        ["server", "client", "200", "The build finished: a 200 with a new ETag and a fresh body."],
        ["client", "ui", "render", "Only real changes reach the UI, so it re-renders once."],
      ],
    },
  }),

  "communication--long-polling": fsd({
    intro:
      "Long polling flips the waiting. The client sends a request and the server holds it open until there is new data or a timeout passes. The client immediately sends the next request. It delivers near real-time updates over plain HTTP, which makes it a dependable fallback when sockets are unavailable.",
    concepts: [
      "The server parks the request. When an event arrives it responds right away, so latency is roughly one network trip rather than half a polling interval.",
      "A timeout bounds the wait, typically 20 to 30 seconds, below proxy and load balancer idle limits. An empty response, often 204, just tells the client to reconnect.",
      "A cursor or last-event ID in each request prevents missed messages. If an event happens while the client is reconnecting, the server sees the client's cursor is behind and responds immediately with the backlog.",
    ],
    code: `async function longPoll(url, onEvents, signal) {
  let cursor = "0";
  let retryDelay = 1000;

  while (!signal.aborted) {
    try {
      const response = await fetch(\`\${url}?after=\${cursor}&timeout=25\`, { signal });
      if (response.status === 200) {
        const { events, nextCursor } = await response.json();
        cursor = nextCursor;
        onEvents(events);
      }
      // 204 means the wait timed out with no news: reconnect immediately.
      retryDelay = 1000;
    } catch (error) {
      if (signal.aborted) return;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }
}

const controller = new AbortController();
longPoll("/api/notifications/wait", showNotifications, controller.signal);
// later: controller.abort();`,
    walkthrough:
      "The loop always has exactly one request outstanding. The server answers as soon as an event newer than the cursor exists, or with 204 after 25 seconds. Advancing the cursor from the response means no event is lost between requests, and exponential backoff stops a server outage from becoming a retry storm. AbortController ends the loop cleanly when the component unmounts.",
    flow: ["Request with cursor", "Server holds until event", "Respond, then re-request"],
    mistake:
      "Forgetting the cursor. Without it, an event that fires during the few milliseconds between one response and the next request is silently dropped.",
    exercise:
      "Your long polls start failing exactly at 60 seconds behind a corporate proxy. What setting do you change on the client and server?",
    answer:
      "Lower the server's hold timeout below the proxy's idle limit, for example 25 seconds, and pass that timeout from the client. The server then replies 204 before the proxy kills the connection, and the client simply reconnects.",
    deepDive: [
      {
        heading: "Server-side cost",
        paragraphs: [
          "Each waiting client holds a connection and possibly a request handler. Thread-per-request servers struggle with tens of thousands of parked requests; event-driven servers such as Node.js, Go, or async Python handle them well. Fan-out across instances usually goes through a pub/sub system like Redis so whichever instance holds the request can be woken.",
        ],
      },
    ],
    animation: {
      title: "Hold, respond, reconnect",
      nodes: [
        ["client", "Client", "cursor = 41"],
        ["server", "Server", "holds request"],
        ["bus", "Event bus", "pub/sub"],
        ["ui", "UI", "notifications"],
      ],
      steps: [
        ["client", "server", "after=41", "The client asks for events after cursor 41 and the server parks the request."],
        ["bus", "server", "event 42", "A new notification is published and wakes the waiting request."],
        ["server", "client", "200", "The server replies at once with event 42 and nextCursor 42."],
        ["client", "ui", "show", "The UI shows the notification without waiting for any timer."],
        ["client", "server", "after=42", "The client immediately opens the next long poll from the new cursor."],
        ["server", "client", "204", "After 25 quiet seconds the server answers 204, and the loop repeats."],
      ],
    },
  }),

  "communication--websockets": fsd({
    intro:
      "A WebSocket begins life as an HTTP request that asks to upgrade. Once the server agrees, the same TCP connection becomes a persistent, full-duplex channel where either side can send messages at any time with only a few bytes of framing overhead. It is the backbone of chat, multiplayer, and collaborative tools.",
    concepts: [
      "The handshake is an HTTP GET with Upgrade: websocket. A 101 Switching Protocols response converts the connection. Use wss:// in production so the channel is encrypted and passes through proxies reliably.",
      "WebSocket gives you frames, not semantics. You design the message protocol yourself: message types, IDs for acknowledgments, versioning, and what happens on reconnect.",
      "Connections drop on network changes, laptop sleep, and deploys. Robust clients reconnect with exponential backoff and jitter, send heartbeats to detect dead connections, and resubscribe and fetch missed messages after reconnecting.",
    ],
    code: `function createSocket(url, { onMessage, onStatus }) {
  let socket;
  let attempt = 0;
  let heartbeat;
  const outbox = []; // messages queued while offline

  function connect() {
    socket = new WebSocket(url);
    onStatus("connecting");

    socket.onopen = () => {
      attempt = 0;
      onStatus("open");
      socket.send(JSON.stringify({ type: "resume", lastSeenId: localStorage.lastSeenId }));
      while (outbox.length) socket.send(outbox.shift());
      heartbeat = setInterval(() => socket.send('{"type":"ping"}'), 25000);
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) localStorage.lastSeenId = message.id;
      if (message.type !== "pong") onMessage(message);
    };
    socket.onclose = () => {
      clearInterval(heartbeat);
      onStatus("reconnecting");
      const delay = Math.min(30000, 1000 * 2 ** attempt++) * (0.5 + Math.random());
      setTimeout(connect, delay); // backoff with jitter avoids reconnect stampedes
    };
  }

  connect();
  return {
    send(payload) {
      const data = JSON.stringify(payload);
      socket.readyState === WebSocket.OPEN ? socket.send(data) : outbox.push(data);
    },
  };
}`,
    walkthrough:
      "The wrapper handles what the raw API leaves to you. On open it resumes from the last message ID so nothing is missed during the outage, flushes messages typed while offline, and starts a heartbeat. On close it reconnects with exponential backoff and random jitter so a server restart does not trigger every client reconnecting in the same millisecond.",
    flow: ["HTTP upgrade (101)", "Exchange framed messages", "Heartbeat, reconnect, resume"],
    mistake:
      "Scaling WebSocket servers like stateless HTTP servers. Each connection lives on one instance, so a message for room 9001 must reach whichever instances hold that room's sockets. Use a pub/sub backbone such as Redis or NATS, and drain connections gracefully during deploys.",
    exercise:
      "A user's laptop sleeps for ten minutes, then wakes. The socket still claims readyState OPEN but no messages arrive. What detects this and how do you recover missed chat messages?",
    answer:
      "Heartbeats detect it: if a ping gets no pong within a timeout, close and reconnect. On reconnect, send the last seen message ID so the server can replay the backlog, or fetch it over HTTP before resuming the live stream.",
    deepDive: [
      {
        heading: "Designing the message protocol",
        code: `// Envelope used for every message
{ "v": 1, "type": "message.created", "id": "m_981", "room": "9001",
  "clientId": "tmp_17", "payload": { "text": "Hi!" }, "ts": 1731900000000 }

// clientId lets the sender match the server echo to its optimistic message
// id gives a total order for resume and deduplication`,
      },
      {
        heading: "Security notes",
        points: [
          "Browsers do not apply CORS to WebSockets. Check the Origin header during the handshake.",
          "Authenticate during the handshake with a cookie or a short-lived token, not a long-lived token in the URL that ends up in logs.",
          "Rate-limit messages per connection and validate every payload as untrusted input.",
        ],
      },
    ],
    animation: {
      title: "Upgrade, talk, recover",
      nodes: [
        ["client", "Browser", "new WebSocket"],
        ["lb", "Load balancer", "sticky upgrade"],
        ["server", "WS server", "room 9001"],
        ["pubsub", "Pub/sub", "fan-out"],
      ],
      steps: [
        ["client", "lb", "Upgrade", "The browser sends GET with Upgrade: websocket over TLS."],
        ["lb", "server", "101", "The server replies 101 Switching Protocols; the connection now carries frames."],
        ["client", "server", "message", "The user sends a chat message as a small JSON frame."],
        ["server", "pubsub", "publish", "The server publishes it so instances holding other room members receive it."],
        ["pubsub", "server", "deliver", "Each instance pushes the message down its own sockets."],
        ["server", "client", "resume", "After a drop, the client reconnects and resumes from its last seen ID."],
      ],
    },
  }),

  "communication--server-sent-events": fsd({
    intro:
      "Server-Sent Events let a server push a stream of text events to the browser over an ordinary HTTP response that never ends. The browser's EventSource API parses the stream, dispatches events, and reconnects automatically. For one-way feeds such as notifications, progress, and live prices, it is simpler than WebSocket.",
    concepts: [
      "The response has Content-Type: text/event-stream. Each event is a block of lines such as event:, data:, and id:, ending with a blank line. Because it is plain HTTP, it works with existing auth cookies, HTTP/2 multiplexing, and most proxies.",
      "EventSource reconnects on its own. When it does, it sends the last received id in a Last-Event-ID header so the server can replay what was missed. The server can tune the reconnect delay with a retry: line.",
      "SSE is one-way and text only. The client sends data back with ordinary fetch requests. On HTTP/1.1 browsers allow only about six connections per origin, so many SSE tabs can starve other requests; HTTP/2 removes that limit.",
    ],
    code: `// Server (Node.js / Express)
app.get("/api/orders/:id/events", (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
  res.flushHeaders();

  const since = req.get("Last-Event-ID");
  for (const event of history.after(req.params.id, since)) send(event); // replay

  const unsubscribe = orders.subscribe(req.params.id, send);
  const keepAlive = setInterval(() => res.write(": ping\\n\\n"), 15000);
  req.on("close", () => { unsubscribe(); clearInterval(keepAlive); });

  function send({ id, type, data }) {
    res.write(\`id: \${id}\\nevent: \${type}\\ndata: \${JSON.stringify(data)}\\n\\n\`);
  }
});

// Browser
const events = new EventSource("/api/orders/9001/events");
events.addEventListener("status", (e) => renderStatus(JSON.parse(e.data)));
events.onerror = () => showBanner("Reconnecting…"); // EventSource retries by itself`,
    walkthrough:
      "The server writes events in the text format and keeps the response open. A comment line every 15 seconds keeps proxies from closing an idle connection. When the browser reconnects after a drop, it sends Last-Event-ID automatically and the server replays newer events from history, so the order status never skips a step.",
    flow: ["Open event-stream", "Server writes id + data", "Auto-reconnect with Last-Event-ID"],
    mistake:
      "Leaving response buffering or compression on in a proxy. Nginx and some CDNs buffer the stream, so events arrive in bursts or not at all. Disable buffering for the route (for example X-Accel-Buffering: no) and make sure compression flushes per event.",
    exercise:
      "Why might SSE be a better fit than WebSocket for streaming tokens from an AI model into a chat UI?",
    answer:
      "Tokens flow only from server to client, the request is a normal authenticated HTTP call, and the stream ends when the answer completes. SSE gives event framing and works through standard HTTP infrastructure without building a socket protocol. Many AI APIs stream exactly this way.",
    deepDive: [
      {
        heading: "Fetch-based streaming",
        paragraphs: [
          "EventSource only supports GET and cannot set custom headers. When you need POST bodies or an Authorization header, read the text/event-stream response with fetch and a ReadableStream reader, parsing the same line format yourself or with a small library.",
        ],
      },
    ],
    animation: {
      title: "A resumable event stream",
      nodes: [
        ["browser", "EventSource", "/events"],
        ["server", "SSE endpoint", "text/event-stream"],
        ["history", "Event history", "replay store"],
        ["ui", "UI", "order status"],
      ],
      steps: [
        ["browser", "server", "GET", "EventSource opens a GET request that the server never finishes."],
        ["server", "browser", "id: 7", "The server writes an event block with id 7 and status packed."],
        ["browser", "ui", "status", "The status listener parses data and updates the order tracker."],
        ["browser", "server", "Last-Event-ID", "The network drops; EventSource reconnects and sends Last-Event-ID: 7."],
        ["server", "history", "replay", "The server reads events after 7 from history."],
        ["history", "browser", "id: 8", "Missed event 8, shipped, arrives first, then the live stream continues."],
      ],
    },
  }),

  "communication--webhooks": fsd({
    intro:
      "A webhook is a reverse API call. Instead of your server polling a provider such as a payment gateway, the provider sends an HTTP POST to a URL you registered whenever something happens. Frontend engineers meet webhooks when designing flows like checkout, where the browser's view of success must wait for a server-side confirmation.",
    concepts: [
      "Webhooks are server to server. The browser never receives them directly; your backend does, then updates its database and notifies the browser through polling, SSE, or a socket.",
      "Anyone can POST to a public URL, so verify every webhook. Providers sign the raw body with a shared secret; you recompute the HMAC and compare it in constant time, and reject old timestamps to stop replays.",
      "Delivery is at least once. Providers retry on failure and may send duplicates or out of order. Respond 2xx quickly, store the event ID to make processing idempotent, and do slow work in a background job.",
    ],
    code: `// Backend: receive a signed payment webhook (Express)
import crypto from "node:crypto";

app.post("/webhooks/payments", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.get("X-Signature");
  const timestamp = req.get("X-Timestamp");
  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(\`\${timestamp}.\${req.body}\`)
    .digest("hex");

  const fresh = Math.abs(Date.now() / 1000 - Number(timestamp)) < 300;
  const valid = signature && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!fresh || !valid) return res.sendStatus(400);

  const event = JSON.parse(req.body);
  if (await processedEvents.has(event.id)) return res.sendStatus(200); // duplicate
  await processedEvents.add(event.id);
  await jobs.enqueue("payment-event", event); // slow work happens later
  res.sendStatus(200);
});

// Frontend: after redirect back from checkout, wait for the server's truth
const order = await waitFor(() => api(\`/orders/\${orderId}\`), (o) => o.status !== "pending");`,
    walkthrough:
      "The handler keeps the raw body because signatures cover exact bytes, verifies the HMAC and timestamp, deduplicates by event ID, and acknowledges within milliseconds. The browser does not trust the redirect from the payment page as proof of payment; it waits until the order record, updated by the webhook, leaves the pending state.",
    flow: ["Provider POSTs event", "Verify, dedupe, enqueue", "Notify the browser"],
    mistake:
      "Marking an order as paid because the browser landed on a success URL. Users can open that URL directly, and redirects can fail. Only the verified webhook or a server-side API check is authoritative.",
    exercise:
      "Your webhook handler takes 12 seconds because it sends an email and generates a PDF. The provider times out at 10 seconds. What happens and how do you fix it?",
    answer:
      "The provider treats the delivery as failed and retries, so you may send duplicate emails. Acknowledge with 200 immediately after verifying and storing the event, move the email and PDF into a background job, and make the job idempotent by event ID.",
    deepDive: [
      {
        heading: "Developing locally",
        points: [
          "Use the provider's CLI or a tunnel to forward webhooks to localhost during development.",
          "Store raw payloads so you can replay real events in tests.",
          "Expose a small admin view of recent webhook deliveries; it saves hours during incidents.",
        ],
      },
    ],
    animation: {
      title: "Checkout confirmed by webhook",
      nodes: [
        ["browser", "Browser", "checkout"],
        ["provider", "Payment provider", "charges card"],
        ["backend", "Your backend", "/webhooks"],
        ["db", "Orders DB", "status"],
      ],
      steps: [
        ["browser", "provider", "pay", "The user pays on the provider's hosted page."],
        ["provider", "browser", "redirect", "The provider redirects back, but this is not proof of payment."],
        ["provider", "backend", "POST", "Separately, the provider POSTs a signed payment.succeeded event."],
        ["backend", "db", "paid", "The backend verifies the signature, deduplicates, and marks the order paid."],
        ["browser", "db", "poll", "The confirmation page polls the order until the status is no longer pending."],
      ],
    },
  }),

  "communication--webrtc": fsd({
    intro:
      "WebRTC lets browsers send audio, video, and arbitrary data directly to each other with very low latency. It powers video calls, screen sharing, and peer file transfer. The surprising part for most engineers is that a direct connection still needs servers: one to exchange connection details, and sometimes one to relay traffic.",
    concepts: [
      "Signaling is how peers find each other. They exchange an SDP offer and answer describing codecs and media, plus ICE candidates describing network addresses. WebRTC does not define signaling; teams usually send these messages over a WebSocket.",
      "NAT traversal uses ICE. A STUN server tells a peer its public address so a direct path can be attempted. When firewalls block direct paths, a TURN server relays the media, which costs bandwidth but keeps the call alive.",
      "Media runs over UDP with SRTP encryption, accepting a little loss for low delay. RTCDataChannel carries arbitrary messages and can be configured reliable or unreliable, ordered or unordered.",
    ],
    code: `const peer = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.example.com:3478" },
    { urls: "turn:turn.example.com:3478", username: "u", credential: "short-lived" },
  ],
});

// Send local camera and microphone
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach((track) => peer.addTrack(track, stream));

// Exchange connection details through your own signaling channel (a WebSocket here)
peer.onicecandidate = ({ candidate }) => candidate && signaling.send({ type: "ice", candidate });
peer.ontrack = ({ streams }) => (remoteVideo.srcObject = streams[0]);

const offer = await peer.createOffer();
await peer.setLocalDescription(offer);
signaling.send({ type: "offer", sdp: offer });

signaling.on("answer", (answer) => peer.setRemoteDescription(answer));
signaling.on("ice", (candidate) => peer.addIceCandidate(candidate));`,
    walkthrough:
      "The caller captures media, creates an offer, and sends it through signaling. The callee sets it as the remote description, creates an answer, and sends it back. Meanwhile both sides trickle ICE candidates as they discover addresses. Once a candidate pair works, media flows directly between browsers, or through TURN when no direct path exists.",
    flow: ["Signal offer and answer", "Discover paths with ICE", "Stream peer to peer"],
    mistake:
      "Shipping without a TURN server. Calls work on the office network during testing and fail for a meaningful share of real users behind symmetric NATs or strict corporate firewalls.",
    exercise:
      "A video call with eight participants is choppy because each browser uploads its video seven times. What architecture change helps?",
    answer:
      "Use a Selective Forwarding Unit. Each participant uploads one stream to the SFU, which forwards it to the others, often at several qualities using simulcast. Pure mesh peer-to-peer only works well for small groups.",
    deepDive: [
      {
        heading: "Group call topologies",
        points: [
          "Mesh: every peer connects to every other. No media server, but upload grows with participant count.",
          "SFU: one upload per peer; the server forwards streams without decoding. The common choice for group calls.",
          "MCU: the server mixes streams into one. Lowest client load, highest server cost and added latency.",
        ],
      },
    ],
    animation: {
      title: "Setting up a peer connection",
      nodes: [
        ["alice", "Alice", "caller"],
        ["signal", "Signaling", "WebSocket"],
        ["stun", "STUN / TURN", "NAT help"],
        ["bob", "Bob", "callee"],
      ],
      steps: [
        ["alice", "signal", "offer", "Alice creates an SDP offer and sends it through the signaling server."],
        ["signal", "bob", "offer", "Bob receives the offer and sets it as his remote description."],
        ["bob", "signal", "answer", "Bob replies with an SDP answer through the same channel."],
        ["alice", "stun", "ICE", "Both peers ask STUN for public addresses and trickle ICE candidates."],
        ["alice", "bob", "media", "A working candidate pair is found and encrypted media flows directly."],
        ["stun", "bob", "relay", "If no direct path works, TURN relays the media so the call still connects."],
      ],
    },
  }),
};
