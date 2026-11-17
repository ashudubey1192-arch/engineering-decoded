// Client storage, caching, and state lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const dataLessons = {
  "database-and-caching--database-and-caching-overview": fsd({
    intro:
      "Frontends keep data in many places at once: in memory as component and store state, in browser storage for persistence, in the HTTP cache and service worker caches for responses, and on CDNs and servers further away. Designing data flow means deciding what lives where, how long it stays valid, and how the copies agree.",
    concepts: [
      "Storage options differ in capacity, lifetime, scope, and API. Memory is fastest but lost on reload; localStorage and sessionStorage are small synchronous key-value stores; cookies travel with requests; IndexedDB holds large structured data asynchronously; Cache Storage holds request and response pairs.",
      "Caching layers stack from the user outward: in-memory query caches, the browser HTTP cache, service worker caches, CDN edges, and server caches. Each hit at a closer layer saves a round trip to the next.",
      "Every cache needs an invalidation story. Time-based expiry, validators such as ETags, version keys, and explicit invalidation after mutations are the main tools. Stale data is a product decision: how wrong, for how long, is acceptable?",
    ],
    code: `// A data placement table for an e-commerce frontend
const placement = [
  { data: "Theme preference",       where: "localStorage",       lifetime: "until changed", sensitive: false },
  { data: "Checkout step in progress", where: "sessionStorage",  lifetime: "this tab",      sensitive: false },
  { data: "Session identifier",     where: "HttpOnly cookie",     lifetime: "1 hour sliding", sensitive: true },
  { data: "Product catalog pages",  where: "HTTP cache + CDN",    lifetime: "max-age=300",   sensitive: false },
  { data: "Offline order history",  where: "IndexedDB",           lifetime: "30 days",       sensitive: true },
  { data: "App shell assets",       where: "Service worker cache", lifetime: "per release",  sensitive: false },
  { data: "Cart and server state",  where: "Query cache (memory)", lifetime: "stale after 30s", sensitive: false },
];

console.table(placement);`,
    walkthrough:
      "Writing placements down makes trade-offs visible. Sensitive identifiers sit in HttpOnly cookies, not scriptable storage. Catalog pages lean on HTTP caching and the CDN because many users share them. Offline order history needs IndexedDB's capacity and structure, with an expiry and cleanup on logout because it holds personal data.",
    flow: ["Classify each piece of data", "Choose layer and lifetime", "Plan invalidation"],
    mistake:
      "Caching everything everywhere without a plan to invalidate it. Users see old prices after an update, support cannot reproduce it, and the fix becomes telling people to clear their cache.",
    exercise:
      "A product price changes. List the caches that might still show the old price and how each one learns about the change.",
    answer:
      "The in-memory query cache (invalidated by refetch on focus or a push event), the browser HTTP cache (until max-age expires, then ETag revalidation), the service worker cache (according to its strategy), and the CDN (until its TTL expires or an explicit purge). Short TTLs plus purge on price change keep them consistent.",
    deepDive: [
      {
        heading: "Rough capacity and lifetime",
        points: [
          "Cookies: about 4 KB each, sent with matching requests.",
          "localStorage and sessionStorage: roughly 5 MB per origin, synchronous, strings only.",
          "IndexedDB and Cache Storage: a share of free disk, often gigabytes, subject to eviction unless persistent storage is granted.",
        ],
      },
    ],
    animation: {
      title: "A request walking the cache layers",
      nodes: [
        ["memory", "Query cache", "in memory"],
        ["http", "HTTP cache", "browser disk"],
        ["sw", "Service worker", "Cache Storage"],
        ["cdn", "CDN edge", "shared"],
        ["origin", "Origin", "database"],
      ],
      steps: [
        ["memory", "http", "miss", "The query cache has no fresh copy of the product list."],
        ["http", "sw", "stale", "The browser cache entry has expired, so the request continues."],
        ["sw", "cdn", "network", "The service worker strategy sends this request to the network."],
        ["cdn", "origin", "miss", "The CDN copy is also stale, so the origin is asked."],
        ["origin", "memory", "fresh data", "Fresh data fills every layer on the way back for the next reader."],
      ],
    },
  }),

  "database-and-caching--local-storage": fsd({
    intro:
      "localStorage is a simple, synchronous key-value store that persists across tabs and browser restarts for an origin. It is perfect for small, non-sensitive preferences and drafts, and a poor fit for large data, frequent writes, or secrets. Good designs wrap it so failures, versioning, and cross-tab updates are handled in one place.",
    concepts: [
      "Values are strings only, typically about 5 MB per origin. Store JSON with try and catch, because quota errors, corrupt values, and disabled storage in some private modes all throw.",
      "Every call is synchronous and blocks the main thread. Small reads at startup are fine; writing large objects on every keystroke is not.",
      "The storage event fires in other tabs of the same origin when a value changes, which allows simple cross-tab synchronization such as logging out everywhere or keeping a theme consistent.",
    ],
    code: `// A versioned, failure-tolerant wrapper
const PREFIX = "shop:";

export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw == null) return fallback;
      const { v, value, expires } = JSON.parse(raw);
      if (v !== 1 || (expires && Date.now() > expires)) return fallback;
      return value;
    } catch {
      return fallback; // corrupted JSON or storage unavailable
    }
  },
  set(key, value, { ttlMs } = {}) {
    try {
      const expires = ttlMs ? Date.now() + ttlMs : undefined;
      localStorage.setItem(PREFIX + key, JSON.stringify({ v: 1, value, expires }));
    } catch (error) {
      console.warn("Storage write failed", error.name); // QuotaExceededError, SecurityError
    }
  },
  remove: (key) => { try { localStorage.removeItem(PREFIX + key); } catch {} },
};

// Cross-tab sync: other tabs react to the change
window.addEventListener("storage", (event) => {
  if (event.key === "shop:theme") applyTheme(JSON.parse(event.newValue).value);
  if (event.key === "shop:logout") location.assign("/signed-out");
});`,
    walkthrough:
      "The wrapper namespaces keys, stores a version and optional expiry alongside each value, and never lets a storage failure crash the app. Bumping the version invalidates old shapes after a refactor. The storage listener runs only in other tabs, so changing the theme in one tab updates the rest, and writing a logout key signs out every tab.",
    flow: ["Serialize with version", "Read defensively", "Sync across tabs"],
    mistake:
      "Storing access tokens or personal data in localStorage. Any script in the origin, including a compromised dependency, can read it, and it persists on shared computers.",
    exercise:
      "A shopping cart for signed-out users should survive closing the browser. Is localStorage a good fit, and what would you add?",
    answer:
      "Yes, for a small cart of product IDs and quantities. Add a version and an expiry such as 30 days, re-validate prices and stock with the server on load, and merge it into the server cart when the user signs in.",
    deepDive: [
      {
        heading: "When to reach for something else",
        points: [
          "Large or structured data, or anything queried: IndexedDB.",
          "Per-tab state: sessionStorage.",
          "Data the server needs on every request: a cookie.",
          "High-frequency writes: keep in memory and debounce persistence.",
        ],
      },
    ],
    animation: {
      title: "Changing the theme in one tab",
      nodes: [
        ["tabA", "Tab A", "toggles theme"],
        ["storage", "localStorage", "shop:theme"],
        ["tabB", "Tab B", "listening"],
        ["reload", "Next visit", "reads value"],
      ],
      steps: [
        ["tabA", "storage", "setItem", "Tab A writes the new theme with a version wrapper."],
        ["storage", "tabB", "storage event", "Tab B receives a storage event with the new value."],
        ["tabB", "tabB", "apply", "Tab B applies the theme without reloading the page."],
        ["storage", "reload", "getItem", "Days later, the next visit reads the theme before first paint."],
      ],
    },
  }),

  "database-and-caching--session-storage": fsd({
    intro:
      "sessionStorage has the same API as localStorage, but its data belongs to a single tab and disappears when that tab closes. That makes it ideal for state that should survive a reload but not leak into other tabs, such as a multi-step form, a scroll position, or a one-time redirect target.",
    concepts: [
      "Scope is per origin and per tab. Two tabs of the same site have separate sessionStorage, which avoids conflicts when a user runs two checkouts in parallel.",
      "Data survives reloads and same-tab navigation, but not closing the tab. Duplicating a tab copies its sessionStorage at that moment; afterwards the copies diverge.",
      "The limitations of localStorage still apply: strings only, synchronous calls, roughly 5 MB, and readable by any script in the origin.",
    ],
    code: `// Persist a multi-step checkout form per tab, so a reload does not lose input
import { useEffect, useState } from "react";

function useSessionState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

export function CheckoutWizard() {
  const [step, setStep] = useSessionState("checkout:step", 1);
  const [address, setAddress] = useSessionState("checkout:address", { line1: "", city: "" });

  function finish() {
    sessionStorage.removeItem("checkout:step");
    sessionStorage.removeItem("checkout:address");
  }
  // ...render step 1 (address), step 2 (delivery), step 3 (payment)
}`,
    walkthrough:
      "The hook reads its initial value from sessionStorage once and writes back whenever it changes. Reloading the page mid-checkout returns the user to the same step with their address intact, while a second tab starts a fresh checkout. Payment details are never stored, and the keys are cleared when the order completes.",
    flow: ["Read on first render", "Write on change", "Clear on completion"],
    mistake:
      "Expecting sessionStorage to share state between tabs, such as a sign-in flow opened in a popup or new tab. Each tab has its own copy; use localStorage, BroadcastChannel, or the server for cross-tab state.",
    exercise:
      "Where would you store the URL a user tried to visit before being redirected to sign in, and why?",
    answer:
      "sessionStorage in the same tab, or better, a validated returnTo query parameter. It belongs to that tab's journey only, should not affect other tabs, and should be cleared once used. Always validate it against your own origin to avoid open redirects.",
    deepDive: [
      {
        heading: "Restoring scroll position",
        code: `// Save before leaving a long list, restore on return in the same tab
addEventListener("pagehide", () => sessionStorage.setItem("scroll:/products", String(scrollY)));
const y = Number(sessionStorage.getItem("scroll:/products") || 0);
requestAnimationFrame(() => scrollTo(0, y));`,
      },
    ],
    animation: {
      title: "Two tabs, two checkouts",
      nodes: [
        ["tab1", "Tab 1", "step 2"],
        ["ss1", "Session store 1", "address saved"],
        ["tab2", "Tab 2", "new checkout"],
        ["ss2", "Session store 2", "empty"],
      ],
      steps: [
        ["tab1", "ss1", "save", "Tab 1 stores its checkout step and address in its own sessionStorage."],
        ["ss1", "tab1", "reload", "After a reload, Tab 1 restores step 2 with the address filled in."],
        ["tab2", "ss2", "read", "Tab 2 reads its own empty store and starts at step 1."],
        ["tab1", "ss1", "clear", "Finishing the order in Tab 1 clears only Tab 1's keys."],
      ],
    },
  }),

  "database-and-caching--cookie-storage": fsd({
    intro:
      "Cookies are small pieces of data the browser stores per domain and automatically sends with matching requests. That automatic sending is their superpower for sessions and their danger for performance and security. Attributes decide who can read a cookie, where it is sent, and how long it lives.",
    concepts: [
      "Attributes: Expires or Max-Age for lifetime, Domain and Path for scope, Secure for HTTPS only, HttpOnly to hide from JavaScript, and SameSite (Strict, Lax, None) to control cross-site sending. Partitioned cookies (CHIPS) isolate third-party cookies per top-level site.",
      "Every matching request carries every matching cookie. Large or numerous cookies on the main domain inflate requests for images, scripts, and APIs; serve static assets from a cookieless domain or keep cookies small.",
      "Third-party cookies are restricted or blocked in major browsers. Authentication across your own subdomains still works with first-party cookies scoped to the parent domain, but embedded cross-site flows need alternatives.",
    ],
    code: `# Server-set session cookie: the safest default
Set-Cookie: __Host-sid=7f3a…; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400

# Readable preference cookie the server also needs (for SSR theme without flash)
Set-Cookie: theme=dark; Path=/; Secure; SameSite=Lax; Max-Age=31536000

// Client: read and write non-sensitive cookies with the Cookie Store API when available
async function setTheme(theme) {
  if ("cookieStore" in window) {
    await cookieStore.set({ name: "theme", value: theme, expires: Date.now() + 365 * 864e5, sameSite: "lax" });
  } else {
    document.cookie = \`theme=\${encodeURIComponent(theme)}; Path=/; Max-Age=31536000; Secure; SameSite=Lax\`;
  }
}

// SSR reads the cookie and renders the right theme on the server: no flash of the wrong theme
// const theme = request.cookies.get("theme") ?? "light";`,
    walkthrough:
      "The session cookie is HttpOnly so scripts cannot steal it, Secure so it never crosses plain HTTP, Lax to block most cross-site sending, and __Host- so subdomains cannot overwrite it. The theme cookie is deliberately readable because both client and server need it: the server uses it to render the correct theme in the first HTML, avoiding a flash.",
    flow: ["Server sets attributes", "Browser stores per domain", "Sent on matching requests"],
    mistake:
      "Setting SameSite=None on every cookie to fix an embedding bug. It reopens cross-site request forgery for every cookie and is only needed for genuinely cross-site embedded scenarios, which should use Partitioned too.",
    exercise:
      "Your marketing site at www.shop.example and app at app.shop.example must share a sign-in. How do you scope the cookie?",
    answer:
      "Set it with Domain=shop.example so both subdomains receive it, keep Secure, HttpOnly, and SameSite=Lax, and accept that you cannot use the __Host- prefix, which forbids Domain. Make sure no untrusted subdomain exists under shop.example.",
    deepDive: [
      {
        heading: "Choosing SameSite",
        points: [
          "Strict: never sent cross-site, even on link clicks. Safest, but users arriving from email links appear signed out.",
          "Lax: sent on top-level GET navigations from other sites, not on cross-site POSTs or subresources. The sensible default.",
          "None: always sent, requires Secure. Only for intentional cross-site use.",
        ],
      },
    ],
    animation: {
      title: "Where a cookie is sent",
      nodes: [
        ["server", "shop.example", "Set-Cookie"],
        ["jar", "Cookie jar", "sid, theme"],
        ["same", "Same-site call", "fetch /api"],
        ["cross", "Cross-site POST", "from evil.site"],
      ],
      steps: [
        ["server", "jar", "store", "The response sets a session cookie and a theme cookie."],
        ["jar", "same", "attach", "Requests to shop.example automatically carry both cookies."],
        ["cross", "jar", "check", "A form on another site POSTs to shop.example."],
        ["jar", "cross", "withheld", "SameSite=Lax withholds the cookies from that cross-site POST."],
      ],
    },
  }),

  "database-and-caching--indexeddb": fsd({
    intro:
      "IndexedDB is a transactional, asynchronous database built into the browser. It stores structured objects, files, and blobs, supports indexes for queries, and can hold far more than localStorage. It is the backbone of offline-capable apps such as email clients, note apps, and field tools, usually used through a small wrapper library.",
    concepts: [
      "A database contains object stores, similar to tables, each with a key path and optional indexes. Schema changes happen in an upgrade callback tied to a version number.",
      "All reads and writes happen inside transactions that are asynchronous and atomic. Either every operation in a transaction commits or none do, which keeps local data consistent.",
      "Storage can be evicted under disk pressure unless navigator.storage.persist() is granted. Design for re-sync from the server, and estimate usage with navigator.storage.estimate().",
    ],
    code: `import { openDB } from "idb"; // tiny promise wrapper around IndexedDB

const db = await openDB("mail", 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      const messages = db.createObjectStore("messages", { keyPath: "id" });
      messages.createIndex("byFolderDate", ["folder", "receivedAt"]);
    }
    if (oldVersion < 2) {
      db.createObjectStore("outbox", { keyPath: "clientId" }); // drafts sent while offline
    }
  },
});

// Write a page of messages atomically
export async function saveMessages(list) {
  const tx = db.transaction("messages", "readwrite");
  await Promise.all([...list.map((m) => tx.store.put(m)), tx.done]);
}

// Query the newest 50 messages in a folder using the compound index
export async function inbox(folder) {
  const range = IDBKeyRange.bound([folder, 0], [folder, Infinity]);
  const results = [];
  let cursor = await db.transaction("messages").store.index("byFolderDate").openCursor(range, "prev");
  while (cursor && results.length < 50) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

await navigator.storage.persist?.(); // ask the browser not to evict our data`,
    walkthrough:
      "Version 1 creates a messages store with a compound index on folder and date; version 2 adds an outbox for messages written offline. saveMessages writes a page of messages in one transaction. inbox walks the index backwards, newest first, and stops at 50, so even a mailbox with 100,000 messages renders quickly from local data.",
    flow: ["Open with versioned schema", "Read and write in transactions", "Query via indexes"],
    mistake:
      "Opening a transaction, awaiting an unrelated fetch, then trying to use the transaction. IndexedDB transactions auto-commit when the event loop has no pending requests on them, so the later call throws TransactionInactiveError.",
    exercise:
      "Design the local schema for an offline notes app that must search notes by tag and sort by last edited.",
    answer:
      "A notes store keyed by id with a multiEntry index on tags and an index on updatedAt, plus a pendingChanges store for edits made offline. Search by tag uses the tags index; the list view uses the updatedAt index in reverse.",
    deepDive: [
      {
        heading: "Syncing local data with the server",
        points: [
          "Store a sync cursor or last-modified timestamp and fetch only changes since then.",
          "Queue local writes with client-generated IDs, send them when online, and reconcile server IDs.",
          "Resolve conflicts with last-write-wins for simple fields, or merge strategies and CRDTs for collaborative content.",
        ],
      },
    ],
    animation: {
      title: "Inbox from local data",
      nodes: [
        ["app", "Mail app", "opens inbox"],
        ["idb", "IndexedDB", "messages store"],
        ["index", "Index", "folder + date"],
        ["api", "Server", "delta sync"],
      ],
      steps: [
        ["app", "index", "query", "The app opens a cursor on the folder and date index, newest first."],
        ["index", "app", "50 rows", "The newest 50 messages render instantly, even offline."],
        ["app", "api", "since cursor", "In the background, the app asks the server for changes since its last sync."],
        ["api", "idb", "delta", "New and changed messages are written in one transaction."],
        ["idb", "app", "refresh", "The list updates with the newly synced messages."],
      ],
    },
  }),

  "database-and-caching--normalization": fsd({
    intro:
      "Normalization stores each entity once, keyed by ID, and refers to it by ID everywhere else. In client state it prevents the classic bug where a user renames themselves and half the screen still shows the old name. It also makes updates cheap and lookups constant time.",
    concepts: [
      "APIs often return nested data: posts with embedded authors with embedded avatars. Copying that shape into state duplicates the author in every post, so an update must find and change every copy.",
      "Normalized state keeps entity tables such as users.byId and posts.byId, plus ordered ID lists for views such as feed.ids. Components select an entity by ID and derive what they need.",
      "Denormalize at read time with selectors. Memoized selectors combine tables into view-ready shapes without storing the combination, so there is one source of truth.",
    ],
    code: `// API response (nested)
const response = {
  posts: [
    { id: "p1", text: "Hello", author: { id: "u1", name: "Asha" } },
    { id: "p2", text: "Second post", author: { id: "u1", name: "Asha" } },
  ],
};

// Normalize into tables
function normalize({ posts }) {
  const users = {};
  const postsById = {};
  for (const post of posts) {
    users[post.author.id] = post.author;
    postsById[post.id] = { id: post.id, text: post.text, authorId: post.author.id };
  }
  return { users, posts: postsById, feed: posts.map((p) => p.id) };
}

let state = normalize(response);

// One update fixes every place the user appears
state = { ...state, users: { ...state.users, u1: { ...state.users.u1, name: "Asha R." } } };

// Selector denormalizes for a view
const selectFeed = (s) => s.feed.map((id) => ({ ...s.posts[id], author: s.users[s.posts[id].authorId] }));
console.log(selectFeed(state).map((p) => p.author.name)); // ["Asha R.", "Asha R."]

// Redux Toolkit offers this pattern built in:
// const usersAdapter = createEntityAdapter(); usersAdapter.upsertMany(state, users)`,
    walkthrough:
      "normalize splits posts and users into ID-keyed tables and keeps the feed as an ordered list of IDs. Renaming the user touches a single object, and the selector rebuilds the feed with the new name everywhere. Redux Toolkit's createEntityAdapter, normalized GraphQL caches, and libraries like normalizr implement the same idea.",
    flow: ["Split entities by type", "Reference by ID", "Join in selectors"],
    mistake:
      "Normalizing everything, including small, view-specific data that is never shared or updated. It adds boilerplate without benefit. Normalize entities that appear in many places or are updated independently.",
    exercise:
      "A Kanban board shows cards inside columns, and cards can move between columns. Sketch a normalized shape.",
    answer:
      "cards: { byId }, columns: { byId: { id, title, cardIds: [] } }, and board: { columnIds: [] }. Moving a card removes its ID from one column's cardIds and inserts it into another's; card data itself never moves.",
    deepDive: [
      {
        heading: "Normalization in server-state libraries",
        paragraphs: [
          "Apollo Client and urql's graphcache normalize automatically by __typename and id. TanStack Query caches by query key instead, so the same entity can live in several queries; after a mutation you either invalidate those keys or update them with setQueryData. Choose the model that matches how much data overlaps between screens.",
        ],
      },
    ],
    animation: {
      title: "One rename, every view updated",
      nodes: [
        ["api", "API response", "nested posts"],
        ["normalize", "normalize()", "split tables"],
        ["users", "users.byId", "u1: Asha"],
        ["posts", "posts.byId", "authorId: u1"],
        ["view", "Feed view", "selector join"],
      ],
      steps: [
        ["api", "normalize", "nested", "The API returns posts with the author embedded in each one."],
        ["normalize", "users", "u1", "The author is stored once in the users table."],
        ["normalize", "posts", "p1, p2", "Posts keep only the author's ID."],
        ["users", "view", "rename", "Renaming u1 updates one object in the users table."],
        ["posts", "view", "join", "The feed selector joins posts to users and shows the new name everywhere."],
      ],
    },
  }),

  "database-and-caching--http-caching": fsd({
    intro:
      "HTTP caching lets browsers and CDNs reuse responses instead of downloading them again. It is controlled almost entirely by response headers, so it is cheap to adopt and easy to get wrong. The core design is simple: cache versioned static files forever, revalidate documents and APIs, and never cache personal data in shared caches.",
    concepts: [
      "Cache-Control sets policy. max-age says how long a response is fresh; s-maxage applies to shared caches like CDNs; no-cache means store but revalidate before use; no-store means do not store at all; private keeps it out of shared caches; immutable says it will never change.",
      "Validators enable cheap revalidation. ETag (a content fingerprint) and Last-Modified let the browser ask If-None-Match or If-Modified-Since; a 304 Not Modified response has no body.",
      "stale-while-revalidate serves a stale copy instantly while fetching a fresh one in the background, which hides latency for data that can be slightly old. Vary tells caches which request headers change the response.",
    ],
    code: `# Hashed static assets: cache for a year, never revalidate
GET /assets/main.8c2e4.js
Cache-Control: public, max-age=31536000, immutable

# HTML document: always check for a new deploy, but a 304 is cheap
GET /products/42
Cache-Control: no-cache
ETag: "html-v812"

# Public API data: fresh for 60 s in browsers, 5 min at the CDN, then serve stale while refreshing
GET /api/products?category=jackets
Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
ETag: "list-77c1"
Vary: Accept-Encoding

# Personal data: browser only, revalidate every time
GET /api/me/orders
Cache-Control: private, no-cache

# Secrets: never store
GET /api/me/payment-methods
Cache-Control: no-store`,
    walkthrough:
      "Hashed assets change name on every content change, so they can be cached for a year without risk. HTML uses no-cache with an ETag so a new deploy is picked up immediately while unchanged pages return a tiny 304. Public product lists use short browser freshness, longer CDN freshness, and stale-while-revalidate to keep responses instant. Personal and sensitive responses are kept out of shared caches or not stored at all.",
    flow: ["Fresh? Serve locally", "Stale? Revalidate with ETag", "Changed? Download new"],
    mistake:
      "Giving index.html a long max-age. Users keep loading an old HTML file that points at old asset hashes, so they do not see deploys for days, or see broken pages when old chunks are deleted.",
    exercise:
      "After a deploy, some users get errors loading a lazily imported chunk that no longer exists. What caching and deployment practices prevent this?",
    answer:
      "Serve HTML with no-cache so users fetch new HTML promptly, keep previous asset versions available for a while after deploys, and handle chunk load failures by reloading the page once to pick up the new HTML.",
    deepDive: [
      {
        heading: "Shared caches and personalization",
        points: [
          "A CDN cache key is usually the URL plus Vary headers. Responses that differ by cookie must be private or keyed explicitly.",
          "Varying on Cookie or Authorization effectively disables shared caching; separate the personalized parts into their own requests.",
          "Purge CDN caches by tag or URL when content changes, instead of waiting for TTLs.",
        ],
      },
    ],
    animation: {
      title: "Fresh, stale, revalidated",
      nodes: [
        ["page", "Page", "needs /api/list"],
        ["cache", "Browser cache", "max-age=60"],
        ["cdn", "CDN", "s-maxage=300"],
        ["origin", "Origin", "ETag list-77c1"],
      ],
      steps: [
        ["page", "cache", "t = 30 s", "The copy is 30 seconds old and still fresh, so no request is sent."],
        ["page", "cache", "t = 90 s", "The copy is now stale but within stale-while-revalidate."],
        ["cache", "page", "instant", "The stale copy is shown instantly while a background refresh starts."],
        ["cache", "cdn", "If-None-Match", "The refresh asks the CDN with the stored ETag."],
        ["cdn", "origin", "revalidate", "The CDN's own copy expired, so it checks with the origin."],
        ["origin", "cache", "304", "Nothing changed; a 304 renews freshness without sending the body."],
      ],
    },
  }),

  "database-and-caching--service-worker-caching": fsd({
    intro:
      "A service worker sits between your pages and the network, intercepting requests and deciding how to answer them using Cache Storage. Unlike the HTTP cache, you write the rules in JavaScript, so you can precache an app shell, serve offline fallbacks, and choose a different strategy for each kind of request.",
    concepts: [
      "Precaching stores known files, such as the app shell and offline page, during the install event, so the app works offline from the second visit. Versioned cache names let the activate event delete old caches.",
      "Runtime strategies decide per request: cache first for hashed assets and fonts, network first with a cache fallback for HTML and API data, and stale-while-revalidate for content where speed beats freshness.",
      "Service worker caches are not automatically expired. Limit entries and age, and keep personal data out of shared-looking caches or clear them on logout.",
    ],
    code: `// sw.js
const VERSION = "v42";
const SHELL = \`shell-\${VERSION}\`;
const RUNTIME = "runtime-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/", "/offline.html", "/assets/app.8c2e4.js", "/assets/app.3f9a1.css"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("shell-") && k !== SHELL).map((k) => caches.delete(k)))),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    // Network first for pages, offline page as a fallback
    event.respondWith(fetch(request).catch(async () => (await caches.match(request)) || caches.match("/offline.html")));
  } else if (url.pathname.startsWith("/assets/")) {
    // Cache first: hashed files never change
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
  } else if (url.pathname.startsWith("/api/products")) {
    // Stale-while-revalidate for catalog data
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; });
        return cached || network;
      }),
    );
  }
});`,
    walkthrough:
      "Install precaches the shell and offline page under a versioned name, and activate deletes previous shell versions. Navigations try the network first so users see fresh HTML, falling back to a cached page or the offline page. Hashed assets come straight from cache. Product API calls return the cached copy immediately while refreshing it, so browsing the catalog is instant and works offline.",
    flow: ["Precache the shell", "Pick a strategy per route", "Version and clean up"],
    mistake:
      "Caching HTML cache-first forever. Users are stuck on an old version of the app until the service worker updates, and if the update logic has a bug, they may never get a new release.",
    exercise:
      "Which strategy would you choose for user avatars, the checkout API, and the article pages of a news site?",
    answer:
      "Avatars: stale-while-revalidate with an entry limit. Checkout API: network only, never cached. Article pages: network first with cache fallback, so readers get the latest version but can still read saved articles offline.",
    deepDive: [
      {
        heading: "Use a library for the details",
        paragraphs: [
          "Workbox and framework plugins such as vite-plugin-pwa generate precache manifests from your build output, implement the standard strategies, add expiration and broadcast updates. Hand-written workers are great for learning; libraries handle edge cases like opaque responses, range requests, and quota errors.",
        ],
      },
    ],
    animation: {
      title: "A fetch through the service worker",
      nodes: [
        ["page", "Page", "fetch()"],
        ["sw", "Service worker", "routes request"],
        ["cache", "Cache Storage", "shell + runtime"],
        ["network", "Network", "server"],
      ],
      steps: [
        ["page", "sw", "/assets/app.js", "A request for a hashed asset is intercepted by the service worker."],
        ["sw", "cache", "cache first", "The asset is found in the precache and returned immediately."],
        ["page", "sw", "/api/products", "A catalog request uses stale-while-revalidate."],
        ["cache", "page", "stale copy", "The cached list renders instantly."],
        ["sw", "network", "refresh", "A background fetch updates the cache for next time."],
        ["network", "page", "offline?", "If a navigation fails offline, the cached offline page is shown instead."],
      ],
    },
  }),

  "database-and-caching--api-caching": fsd({
    intro:
      "API caching in the frontend means keeping server responses in memory, keyed by request, so components can read them instantly, share them, and refresh them intelligently. Server-state libraries such as TanStack Query, SWR, RTK Query, and Apollo turn this into a declarative layer with deduplication, background refetching, and invalidation after mutations.",
    concepts: [
      "Each query has a key, such as ['products', { category: 'jackets' }]. Components using the same key share one request and one cached result, which removes duplicate fetches across the tree.",
      "staleTime decides how long data counts as fresh, so no refetch happens; gcTime decides how long unused data stays in memory. Stale data is still shown while a background refetch runs on mount, focus, or reconnect.",
      "Mutations invalidate or update affected queries. After adding to the cart, invalidate ['cart']; for snappier UIs, optimistically update the cache and roll back on error.",
    ],
    code: `import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 2 } },
});

export function useProducts(category) {
  return useQuery({
    queryKey: ["products", { category }],
    queryFn: ({ signal }) => fetch(\`/api/products?category=\${category}\`, { signal }).then((r) => r.json()),
    placeholderData: (previous) => previous, // keep old list visible while switching category
  });
}

export function useAddToCart() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (item) => fetch("/api/cart/items", { method: "POST", body: JSON.stringify(item) }).then((r) => r.json()),
    onMutate: async (item) => {
      await client.cancelQueries({ queryKey: ["cart"] });
      const previous = client.getQueryData(["cart"]);
      client.setQueryData(["cart"], (cart) => ({ ...cart, items: [...cart.items, { ...item, pending: true }] }));
      return { previous };
    },
    onError: (_error, _item, context) => client.setQueryData(["cart"], context.previous),
    onSettled: () => client.invalidateQueries({ queryKey: ["cart"] }),
  });
}`,
    walkthrough:
      "Product lists are cached per category for 30 seconds of freshness and kept in memory for five minutes after the last user. Switching categories keeps the previous list visible instead of flashing a spinner. Adding to the cart updates the cached cart instantly with a pending item, rolls back if the server rejects it, and finally refetches the cart so the client matches the server.",
    flow: ["Key the request", "Serve fresh or stale + refetch", "Invalidate after mutations"],
    mistake:
      "Copying query results into separate component or global state. Now there are two caches that drift apart; read directly from the query cache and derive what you need.",
    exercise:
      "Five components on a page all call useProducts('jackets') at the same time. How many network requests are made, and why?",
    answer:
      "One. The components share the same query key, so the library deduplicates the in-flight request and all five subscribe to the same cache entry.",
    deepDive: [
      {
        heading: "Simple in-memory cache without a library",
        code: `const cache = new Map(); // key → { promise, at }
export function cachedFetch(url, ttl = 30_000) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < ttl) return hit.promise;
  const promise = fetch(url).then((r) => r.json()).catch((e) => { cache.delete(url); throw e; });
  cache.set(url, { promise, at: Date.now() }); // caching the promise dedupes concurrent calls
  return promise;
}`,
      },
    ],
    animation: {
      title: "Shared query, optimistic mutation",
      nodes: [
        ["components", "5 components", "same key"],
        ["cache", "Query cache", "['products']"],
        ["api", "API", "/api/products"],
        ["mutation", "Add to cart", "optimistic"],
        ["cart", "Cart query", "['cart']"],
      ],
      steps: [
        ["components", "cache", "subscribe", "Five components ask for the same query key at once."],
        ["cache", "api", "1 request", "The cache sends a single request and shares its result."],
        ["api", "components", "data", "All five render from the same cached response."],
        ["mutation", "cart", "optimistic", "Adding to cart updates the cart cache immediately with a pending item."],
        ["cart", "api", "invalidate", "When the server confirms, the cart query refetches to match the server."],
      ],
    },
  }),

  "database-and-caching--state-management": fsd({
    intro:
      "State management is deciding where each piece of state lives and how changes flow to the UI. Most bugs come from putting state in the wrong place: server data copied into a global store, URL state hidden in component state, or one giant context re-rendering everything. A clear taxonomy makes the choice obvious most of the time.",
    concepts: [
      "Server state is a cache of remote data with loading, error, and staleness; it belongs in a server-state library. Client state is owned by the browser, such as an open modal or a draft, and should stay as local as possible.",
      "URL state, such as filters, sort order, page, and selected tab, belongs in the URL so it survives reloads and can be shared. Form state belongs in the form, often with a form library for complex validation.",
      "Global client state, such as the signed-in user, theme, or a multi-step wizard spanning routes, can live in context or a small store such as Zustand or Redux Toolkit. Keep it small and split by concern.",
    ],
    code: `// One product listing page, state placed by kind
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";

// Global client state: tiny, cross-route
const useUi = create((set) => ({
  compare: [],
  toggleCompare: (id) => set((s) => ({ compare: s.compare.includes(id) ? s.compare.filter((x) => x !== id) : [...s.compare, id] })),
}));

export function ProductListing() {
  // URL state: shareable, survives reload
  const [params, setParams] = useSearchParams();
  const filters = { category: params.get("category") ?? "all", sort: params.get("sort") ?? "popular" };

  // Server state: cached, deduped, refetched
  const { data, isPending } = useQuery({ queryKey: ["products", filters], queryFn: () => fetchProducts(filters) });

  // Local UI state: only this component cares
  const [quickViewId, setQuickViewId] = useState(null);

  const compare = useUi((s) => s.compare);
  // ...render filters (setParams), grid (data), quick view modal (quickViewId), compare tray (compare)
}`,
    walkthrough:
      "Filters live in the URL, so a shared link reproduces the exact listing. Products are server state cached by their filters. The quick view modal is local because nothing else needs it. The compare list is global because it must persist as the user navigates to product pages, and the selector subscribes only to that slice, so other store changes do not re-render the listing.",
    flow: ["Classify the state", "Place it at the lowest owner", "Subscribe narrowly"],
    mistake:
      "Putting everything in one global store by default. Every update risks re-rendering unrelated screens, server data goes stale because nothing refetches it, and simple components become hard to reuse.",
    exercise:
      "Where would you put: the current page of search results, whether a dropdown is open, and the logged-in user's profile?",
    answer:
      "Search page number: the URL. Dropdown open: local component state. User profile: server state fetched once and cached, optionally exposed through a small context or hook for convenience.",
    deepDive: [
      {
        heading: "Signals of a misplaced state",
        points: [
          "You sync two copies of the same value with useEffect.",
          "Reloading loses the user's filters or position.",
          "A small toggle re-renders a large part of the page in the Profiler.",
          "Tests need a whole store set up to render a simple component.",
        ],
      },
    ],
    animation: {
      title: "Placing state by kind",
      nodes: [
        ["url", "URL", "category, sort"],
        ["server", "Query cache", "products"],
        ["local", "Local state", "quick view"],
        ["global", "Global store", "compare list"],
        ["ui", "Listing UI", "renders"],
      ],
      steps: [
        ["url", "server", "filters", "Filters from the URL become part of the product query key."],
        ["server", "ui", "products", "The cached product list renders the grid."],
        ["local", "ui", "modal", "Opening quick view changes only the local state of the listing."],
        ["global", "ui", "compare", "The compare tray subscribes to its slice and persists across routes."],
        ["ui", "url", "change sort", "Changing sort updates the URL, which drives a new query."],
      ],
    },
  }),
};
