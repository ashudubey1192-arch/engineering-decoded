// Feature-building lessons: live data, loading UX, search, feeds, chat, auth, config, i18n.
import { lesson } from "./reactLessonSchema.js";

const detailed = (base, extra) => ({ ...base, ...extra });

export const featureLessons = {
  "real-world-features--working-with-live-apis-and-cors": detailed(
    lesson(
      "Real apps load data from APIs you do not control. Doing that well means fetching in an effect with cancellation, checking the response, reading deeply nested JSON safely, and understanding CORS, the browser rule that decides whether your page may read a response from another origin.",
      [
        "Fetch after render inside useEffect and abort the request in the cleanup. Without cancellation, a slow response for an old restaurant can arrive after a newer one and overwrite the screen with stale data.",
        "fetch only rejects on network failure. A 404 or 500 still resolves, so check response.ok before parsing and turn bad statuses into errors your UI can display.",
        "CORS is enforced by the browser, not the server. When your page on one origin requests another origin, the browser only exposes the response if the server replies with a matching Access-Control-Allow-Origin header. Without it, the request may even succeed on the server, yet your code cannot read the result.",
      ],
      `import { useEffect, useState } from 'react';

export default function RestaurantMenu({ id }) {
  const [state, setState] = useState({ status: 'loading', menu: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', menu: null, error: null });

    async function load() {
      try {
        const res = await fetch('/api/menu?restaurantId=' + id, { signal: controller.signal });
        if (!res.ok) throw new Error('Request failed with ' + res.status);
        const json = await res.json();
        const info = json?.data?.cards?.[0]?.card?.info ?? {};
        setState({ status: 'ready', menu: { name: info.name ?? 'Unknown', cuisines: info.cuisines ?? [] }, error: null });
      } catch (error) {
        if (error.name !== 'AbortError') setState({ status: 'error', menu: null, error: error.message });
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  if (state.status === 'loading') return <p>Loading menu…</p>;
  if (state.status === 'error') return <p role="alert">{state.error}</p>;
  return (
    <section>
      <h2>{state.menu.name}</h2>
      <p>{state.menu.cuisines.join(', ')}</p>
    </section>
  );
}`,
      "Changing id aborts the previous request before starting a new one, so only the latest response can update state. Optional chaining and ?? defaults keep the component from crashing when the API leaves out a field. The request goes to /api on the same origin, which a dev proxy or your own backend forwards to the real API.",
      ["Effect starts fetch", "Response checked + parsed", "Cleanup aborts stale work"],
      "Installing a browser extension that disables CORS only changes your own browser. Every real user still gets blocked. Fix CORS where it belongs: have the API allow your origin, or call it from your own server or a dev proxy.",
      "Your request to a third-party API fails with a CORS error in the browser, but the same URL works in curl. Why?",
      "curl is not a browser, so it does not enforce the same-origin policy. The API simply does not send Access-Control-Allow-Origin for your site's origin. Call it from a server you control, which is not subject to CORS, or ask the provider to allow your origin.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "A development proxy in Vite",
          paragraphs: [
            "A proxy makes the browser talk only to your dev server, which forwards requests to the real API server side. Because the browser sees a same-origin request, CORS never applies. In production, an equivalent route on your own backend or edge function does the same job.",
          ],
          code: `// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
    },
  },
});`,
        },
        {
          heading: "Preflight requests",
          points: [
            "Simple GET requests with standard headers go straight to the server; the browser then checks the response headers.",
            "Requests with JSON bodies, custom headers like Authorization, or methods like PUT trigger an OPTIONS preflight first.",
            "If the preflight response does not allow the method and headers, the real request is never sent.",
            "Cookies cross origins only when the request uses credentials: 'include' and the server allows credentials for that specific origin.",
          ],
        },
      ],
      animation: {
        title: "A cross-origin request, step by step",
        nodes: [
          { id: "app", label: "React app", sub: "app.example.dev" },
          { id: "browser", label: "Browser", sub: "enforces CORS" },
          { id: "proxy", label: "Proxy / backend", sub: "same origin" },
          { id: "api", label: "Third-party API", sub: "other origin" },
        ],
        steps: [
          {
            from: "app",
            to: "browser",
            label: "fetch",
            note: "The component's effect calls fetch for a cross-origin URL.",
          },
          {
            from: "browser",
            to: "api",
            label: "request",
            note: "The browser sends the request and adds an Origin header.",
          },
          {
            from: "api",
            to: "browser",
            label: "no ACAO",
            note: "The reply lacks Access-Control-Allow-Origin, so the browser hides it from your code.",
          },
          {
            from: "app",
            to: "proxy",
            label: "/api",
            note: "The fix: call your own origin, where CORS does not apply.",
          },
          {
            from: "proxy",
            to: "api",
            label: "server call",
            note: "Your server forwards the request; servers are not bound by CORS.",
          },
          {
            from: "proxy",
            to: "app",
            label: "JSON",
            note: "The response returns through your origin and the component renders it.",
          },
        ],
      },
    },
  ),

  "real-world-features--shimmer-ui": detailed(
    lesson(
      "A shimmer, or skeleton screen, is a placeholder shaped like the content that is about to load. It makes waiting feel shorter than a blank page or a lone spinner, and because it reserves the right amount of space, the layout does not jump when real data arrives.",
      [
        "Render the skeleton from the same layout components as the real content so sizes match. If the real card is 240 pixels tall, the placeholder card should be too, otherwise the page shifts and users lose their place.",
        "Choose the placeholder with conditional rendering. An early return such as if (!restaurants) return <Shimmer /> keeps the main JSX focused on the loaded state.",
        "Skeletons are visual only. Mark the region with aria-busy, hide decorative shapes with aria-hidden, and announce completion in text so screen reader users know when content is ready.",
      ],
      `function CardSkeleton() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

function RestaurantCard({ name, eta }) {
  return (
    <div className="card">
      <img className="card-image" src="/placeholder.jpg" alt="" />
      <h3>{name}</h3>
      <p>{eta} min</p>
    </div>
  );
}

export default function Restaurants({ restaurants }) {
  const loading = restaurants === null;
  return (
    <section aria-busy={loading} aria-label="Restaurants">
      <div className="grid">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)
          : restaurants.map(r => <RestaurantCard key={r.id} {...r} />)}
      </div>
      <p className="visually-hidden" role="status">
        {loading ? 'Loading restaurants' : restaurants.length + ' restaurants loaded'}
      </p>
    </section>
  );
}

/* CSS
.skeleton-image, .skeleton-line {
  background: linear-gradient(90deg, #eee 25%, #f7f7f7 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
@media (prefers-reduced-motion: reduce) { .skeleton-image, .skeleton-line { animation: none } }
*/`,
      "While restaurants is null, eight skeleton cards fill the same grid, so the page structure is visible immediately. When data arrives the grid swaps to real cards of the same size. The status line tells assistive technology what happened, and the moving gradient stops for people who prefer reduced motion.",
      ["Data pending", "Skeleton with real layout", "Content swaps in place"],
      "An empty array and still-loading are different states. If you use restaurants.length === 0 to mean loading, a search with no results shows a skeleton forever. Track loading separately from the data, and render a proper empty message when the list is genuinely empty.",
      "Your API usually responds in 80 ms. Should you still show a shimmer?",
      "Usually not immediately. A skeleton that flashes for a few frames feels like flicker. Delay it by roughly 150 to 300 ms, or keep showing the previous content with a subtle pending indicator, so fast responses go straight to the content.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Shimmer versus spinner",
          points: [
            "Use a skeleton when you know the shape of the content: lists, cards, profile headers.",
            "Use a spinner or progress bar for actions with an unknown result shape, like submitting a payment.",
            "For very slow operations, show real progress or allow the user to keep working elsewhere.",
          ],
        },
        {
          heading: "Pairing shimmer with Suspense",
          paragraphs: [
            "With lazy routes or Suspense-enabled data, the skeleton becomes the fallback of a Suspense boundary. Place boundaries around regions that can load independently, so the header stays interactive while only the list shows placeholders.",
          ],
          code: `<Suspense fallback={<RestaurantGridSkeleton />}>
  <RestaurantGrid />
</Suspense>`,
        },
      ],
      animation: {
        title: "Loading without layout shift",
        nodes: [
          { id: "mount", label: "First render", sub: "data = null" },
          { id: "skeleton", label: "Shimmer cards", sub: "fixed sizes" },
          { id: "fetch", label: "Request", sub: "in flight" },
          { id: "data", label: "Data arrives", sub: "setState" },
          { id: "content", label: "Real cards", sub: "same slots" },
        ],
        steps: [
          {
            from: "mount",
            to: "skeleton",
            label: "render",
            note: "The first render has no data, so the grid renders skeleton cards.",
          },
          {
            from: "mount",
            to: "fetch",
            label: "effect",
            note: "After paint, an effect starts the request while the shimmer animates.",
          },
          {
            from: "fetch",
            to: "data",
            label: "200 OK",
            note: "The response is parsed and stored in state.",
          },
          {
            from: "data",
            to: "content",
            label: "re-render",
            note: "Real cards replace skeletons in exactly the same grid cells.",
          },
        ],
      },
    },
  ),

  "real-world-features--debounced-search-and-caching": detailed(
    lesson(
      "A search box that requests suggestions on every keystroke floods the server and flickers results. Debouncing waits until the user pauses, caching skips requests you already made, and cancellation makes sure only the latest query can update the list.",
      [
        "Debounce means delaying work until input has been quiet for a set time, often 200 to 300 ms. In React you start a timer in an effect that depends on the query and clear it in the cleanup, so each keystroke cancels the previous timer.",
        "Caching stores results by query. Typing 'iphone', deleting a letter, and retyping it should not hit the server twice. A Map in a ref works for one component; a Redux slice or a data library shares the cache across the app.",
        "Responses can return out of order. Abort the previous request or ignore results whose query no longer matches, otherwise the suggestions for 'ip' can appear after the ones for 'iphone'.",
      ],
      `import { useEffect, useRef, useState } from 'react';

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const cache = useRef(new Map());
  const term = useDebouncedValue(query.trim().toLowerCase(), 250);

  useEffect(() => {
    if (!term) { setSuggestions([]); return; }
    if (cache.current.has(term)) { setSuggestions(cache.current.get(term)); return; }

    const controller = new AbortController();
    fetch('/api/suggest?q=' + encodeURIComponent(term), { signal: controller.signal })
      .then(res => (res.ok ? res.json() : []))
      .then(list => { cache.current.set(term, list); setSuggestions(list); })
      .catch(error => { if (error.name !== 'AbortError') setSuggestions([]); });
    return () => controller.abort();
  }, [term]);

  return (
    <div>
      <label htmlFor="search">Search</label>
      <input id="search" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
      <ul aria-label="Suggestions">
        {suggestions.map(s => <li key={s}>{s}</li>)}
      </ul>
    </div>
  );
}`,
      "Typing 'dosa' quickly changes query four times but term only once, 250 ms after the last key. The second effect then checks the cache, fetches only on a miss, and aborts if term changes again before the response lands. The input itself stays instant because it is controlled by query, not by the debounced value.",
      ["Keystrokes", "Debounced term", "Cache hit or one request"],
      "Debouncing the input's own state makes typing feel laggy, because characters appear late. Keep the input bound to immediate state and debounce only the value that triggers work.",
      "What is the difference between debounce and throttle, and which suits a search box?",
      "Debounce waits for a pause and then runs once; throttle runs at most once per interval while events keep firing. Search suggestions want debounce, because only the final query matters. Throttle suits continuous events like scroll position or resize where regular updates are useful.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Keyboard support for suggestion lists",
          points: [
            "Track an activeIndex in state and change it with ArrowUp and ArrowDown in onKeyDown.",
            "Enter selects the active suggestion; Escape closes the list.",
            'Use the combobox pattern: role="combobox" on the input, aria-controls pointing at a role="listbox", and aria-activedescendant naming the highlighted option.',
            "Close the list on blur, but delay slightly so a mouse click on a suggestion still registers.",
          ],
        },
        {
          heading: "Keeping the cache healthy",
          paragraphs: [
            "An unbounded cache grows for as long as the tab stays open. Cap its size and drop the oldest entries, or store a timestamp and refetch entries older than a few minutes. When the cache lives in Redux, a slice keyed by query lets other components reuse results, for example a results page that opens with suggestions already loaded.",
          ],
          code: `function remember(cache, key, value, limit = 50) {
  if (cache.size >= limit) cache.delete(cache.keys().next().value); // oldest first
  cache.set(key, value);
}`,
        },
      ],
      animation: {
        title: "Debounce, cache, request",
        nodes: [
          { id: "keys", label: "Keystrokes", sub: "d · do · dos · dosa" },
          { id: "timer", label: "250 ms timer", sub: "reset each key" },
          { id: "cache", label: "Cache", sub: "Map by query" },
          { id: "api", label: "API", sub: "/suggest?q=dosa" },
          { id: "list", label: "Suggestions", sub: "rendered" },
        ],
        steps: [
          {
            from: "keys",
            to: "timer",
            label: "reset",
            note: "Each keystroke clears the pending timer and starts a new one.",
          },
          {
            from: "timer",
            to: "cache",
            label: "dosa",
            note: "After a 250 ms pause, the final term is checked against the cache.",
          },
          {
            from: "cache",
            to: "api",
            label: "miss",
            note: "On a miss, exactly one request is sent for the settled term.",
          },
          {
            from: "api",
            to: "cache",
            label: "store",
            note: "The response is saved so the same query never needs the network again.",
          },
          {
            from: "cache",
            to: "list",
            label: "render",
            note: "Suggestions render; retyping dosa later is served instantly from the cache.",
          },
        ],
      },
    },
  ),

  "real-world-features--infinite-scroll": detailed(
    lesson(
      "Infinite scroll loads the next page of a feed when the user nears the end of what is already shown. The reliable way to detect that moment is an IntersectionObserver watching a small sentinel element after the last item, instead of measuring scroll positions on every scroll event.",
      [
        "Place an empty sentinel element after the list and observe it. The browser calls your callback when it enters the viewport, or comes within a rootMargin of it, without you running code on every scroll frame.",
        "Guard against duplicate loads. The observer can fire again before the previous page arrives, so track a loading flag in a ref and stop observing when the server says there are no more pages.",
        "Ask the API for the next page with a cursor, such as the id of the last item, rather than a page number. Cursors stay correct when new items are added to the top of the feed between requests.",
      ],
      `import { useEffect, useRef, useState } from 'react';

export default function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      try {
        const res = await fetch('/api/videos?after=' + (cursor ?? ''));
        const page = await res.json();
        setVideos(list => [...list, ...page.items]);
        setCursor(page.nextCursor);
        setHasMore(Boolean(page.nextCursor));
      } finally {
        loadingRef.current = false;
      }
    }, { rootMargin: '400px' });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [cursor, hasMore]);

  return (
    <main>
      <ul>{videos.map(v => <li key={v.id}>{v.title}</li>)}</ul>
      {hasMore ? <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} /> : <p>You are all caught up.</p>}
    </main>
  );
}`,
      "On first render the sentinel is already visible, so the first page loads. Each response appends items and moves the cursor, which re-creates the observer with the new cursor. rootMargin: '400px' starts loading before the user actually reaches the bottom, so scrolling rarely stalls. When nextCursor is empty, the sentinel is replaced by an end message.",
      ["Sentinel visible", "Fetch next cursor", "Append + move sentinel"],
      "Attaching a scroll listener that reads scrollHeight on every event forces layout work dozens of times per second and is easy to get wrong on different screens. Let IntersectionObserver tell you when the sentinel is close instead.",
      "Why use a ref rather than state for loadingRef?",
      "The observer callback is created once per effect run and must see the current value immediately. A ref changes synchronously and does not trigger a render, so a second intersection that fires a moment later reads true and skips the duplicate request.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "When the list gets very long",
          paragraphs: [
            "Thousands of DOM nodes make scrolling and memory use worse. List virtualization renders only the rows near the viewport and recycles them as you scroll. Libraries such as TanStack Virtual handle measuring and positioning; combine them with the same sentinel idea to fetch more data.",
          ],
        },
        {
          heading: "Accessibility and usability checks",
          points: [
            "Keep a visible Load more button as a fallback for keyboard users and for browsers where the observer misbehaves.",
            "Footers become unreachable on an endless feed, so move important links elsewhere or stop auto-loading after a few pages.",
            "Announce new content politely, for example '20 more videos loaded', rather than moving focus.",
            "Preserve scroll position when the user navigates to a video and comes back.",
          ],
        },
      ],
      animation: {
        title: "Observer-driven pagination",
        nodes: [
          { id: "scroll", label: "User scrolls", sub: "list grows" },
          { id: "sentinel", label: "Sentinel", sub: "after last item" },
          { id: "observer", label: "Observer", sub: "rootMargin 400px" },
          { id: "api", label: "API", sub: "?after=cursor" },
          { id: "list", label: "Feed state", sub: "items appended" },
        ],
        steps: [
          {
            from: "scroll",
            to: "sentinel",
            label: "near",
            note: "Scrolling brings the sentinel within 400px of the viewport.",
          },
          {
            from: "sentinel",
            to: "observer",
            label: "intersect",
            note: "The observer fires once; the loading ref blocks duplicates.",
          },
          {
            from: "observer",
            to: "api",
            label: "cursor",
            note: "The next page is requested using the cursor from the last response.",
          },
          {
            from: "api",
            to: "list",
            label: "page",
            note: "New items are appended and the cursor moves forward.",
          },
          {
            from: "list",
            to: "sentinel",
            label: "move",
            note: "The sentinel renders after the new last item, ready for the next page.",
          },
        ],
      },
    },
  ),

  "real-world-features--nested-comments": detailed(
    lesson(
      "Comment threads are trees: each comment can have replies, which can have replies of their own. A recursive component, one that renders itself for its children, matches that shape exactly and handles any depth with a few lines of code.",
      [
        "Model each comment with an id, its content, and a replies array. The recursive component renders one comment and then renders a CommentList for its replies, which renders more comments the same way.",
        "Every recursion needs a base case. Here it is an empty replies array: nothing more is rendered, so the recursion stops naturally.",
        "Servers often send comments as a flat list with parentId fields. Build the tree once with a lookup map, which takes linear time, instead of filtering the whole list for every comment.",
      ],
      `const thread = [
  {
    id: 1, author: 'Asha', text: 'Great explanation of recursion!',
    replies: [
      {
        id: 2, author: 'Ravi', text: 'Agreed, the base case clicked for me.',
        replies: [{ id: 3, author: 'Asha', text: 'Empty arrays end it.', replies: [] }],
      },
    ],
  },
  { id: 4, author: 'Meera', text: 'Can this handle any depth?', replies: [] },
];

function Comment({ comment }) {
  return (
    <li>
      <p><strong>{comment.author}</strong> {comment.text}</p>
      {comment.replies.length > 0 && <CommentList comments={comment.replies} />}
    </li>
  );
}

function CommentList({ comments }) {
  return (
    <ul className="comment-list">
      {comments.map(comment => <Comment key={comment.id} comment={comment} />)}
    </ul>
  );
}

export default function Discussion() {
  return <section aria-label="Comments"><CommentList comments={thread} /></section>;
}

/* CSS: indent each nested level
.comment-list .comment-list { margin-left: 1.25rem; border-left: 2px solid #ddd; padding-left: 0.75rem; }
*/`,
      "CommentList renders two top-level comments. Asha's comment has replies, so it renders another CommentList, and so on until Asha's last reply, whose empty replies array renders nothing. Nested ul elements give screen readers the thread structure for free.",
      ["Comment", "CommentList(replies)", "Base case: no replies"],
      "Keys only need to be unique among siblings, but they must be stable. Using the array index means inserting a reply above another shifts every key and can move expanded or editing state to the wrong comment. Use the comment id.",
      "How do you add a reply to comment 3 without mutating the tree?",
      "Write a recursive update that copies only the path to that comment: map over the list, return a copy with a new replies array for the matching id, and recurse into replies for the others. Unchanged branches keep their old references, so React and memoized children can skip them.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Building a tree from a flat API response",
          code: `function buildTree(flat) {
  const byId = new Map(flat.map(c => [c.id, { ...c, replies: [] }]));
  const roots = [];
  for (const comment of byId.values()) {
    const parent = comment.parentId ? byId.get(comment.parentId) : null;
    (parent ? parent.replies : roots).push(comment);
  }
  return roots;
}`,
          paragraphs: [
            "One pass creates every node, a second attaches each node to its parent. Orphans whose parent was deleted end up as roots instead of disappearing, which is usually the friendlier behaviour.",
          ],
        },
        {
          heading: "Designing for deep threads",
          points: [
            "Cap visual indentation after a few levels so text does not shrink to a sliver on phones.",
            "Collapse long branches behind a Show 12 replies button and load them on demand.",
            "Very deep data can overflow the call stack in recursive code; real threads rarely get there, but server-side depth limits are a cheap safeguard.",
          ],
        },
      ],
      animation: {
        title: "Recursion over a comment tree",
        nodes: [
          { id: "root", label: "CommentList", sub: "top level", x: 50, y: 20 },
          { id: "c1", label: "Asha", sub: "1 reply", x: 28, y: 44 },
          { id: "c4", label: "Meera", sub: "no replies", x: 74, y: 44 },
          { id: "c2", label: "Ravi", sub: "1 reply", x: 28, y: 70 },
          { id: "c3", label: "Asha", sub: "base case", x: 28, y: 90 },
        ],
        steps: [
          {
            from: "root",
            to: "c1",
            label: "map",
            note: "The top-level list renders a Comment for Asha.",
          },
          {
            from: "c1",
            to: "c2",
            label: "recurse",
            note: "Asha has replies, so a nested CommentList renders Ravi.",
          },
          { from: "c2", to: "c3", label: "recurse", note: "Ravi's replies render one more level." },
          {
            from: "c3",
            to: "c3",
            label: "stop",
            note: "Empty replies: the base case renders nothing further.",
          },
          {
            from: "root",
            to: "c4",
            label: "map",
            note: "Back at the top, the list continues with Meera, who has no replies.",
          },
        ],
      },
    },
  ),

  "real-world-features--live-chat-updates": detailed(
    lesson(
      "A live chat panel keeps receiving messages while the user watches. The React side of the problem is the same regardless of transport: subscribe in an effect, append new messages immutably, cap how many you keep, clean up on unmount, and only auto-scroll when the user is already at the bottom.",
      [
        "Pick a transport for how fresh data must be. Polling with setInterval is simple and works everywhere; Server-Sent Events push one-way updates over HTTP; WebSockets give two-way, low-latency messaging. All three plug into the same effect-and-cleanup shape.",
        "Messages accumulate forever in a long stream. Keep only the most recent N in state, for example with slice, so memory and DOM size stay flat no matter how long the page is open.",
        "Deduplicate by message id. Reconnects and polling overlaps can deliver the same message twice, and stable ids also give each row a correct key.",
      ],
      `import { useEffect, useRef, useState } from 'react';

const LIMIT = 100;

export default function LiveChat({ streamId }) {
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    let since = 0;
    const id = setInterval(async () => {
      const res = await fetch('/api/chat/' + streamId + '?since=' + since);
      if (!res.ok) return;
      const incoming = await res.json();
      if (!incoming.length) return;
      since = incoming[incoming.length - 1].sentAt;
      setMessages(list => {
        const seen = new Set(list.map(m => m.id));
        const fresh = incoming.filter(m => !seen.has(m.id));
        return [...list, ...fresh].slice(-LIMIT);
      });
    }, 2000);
    return () => clearInterval(id);
  }, [streamId]);

  useEffect(() => {
    const el = listRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <ol ref={listRef} className="chat" aria-label="Live chat">
      {messages.map(m => <li key={m.id}><strong>{m.author}</strong> {m.text}</li>)}
    </ol>
  );
}`,
      "Every two seconds the effect asks for messages newer than the last one it saw, filters out duplicates, appends them, and keeps the newest 100. Changing streamId clears the old interval and starts polling the new stream. The second effect scrolls down only if the user was already near the bottom, so reading older messages is not interrupted.",
      ["Poll or subscribe", "Dedupe + cap list", "Smart auto-scroll"],
      "Forgetting to clear the interval means every visit to the page adds another poller. After a few navigations the app sends several requests per second and messages appear multiple times.",
      "When should you move from polling to WebSockets?",
      "When latency or request volume matters: many concurrent viewers, sub-second delivery, or users sending messages frequently. Polling every two seconds for thousands of viewers creates constant load even when nothing changes, while a socket only sends data when there is a message.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "The same component with a WebSocket",
          code: `useEffect(() => {
  const socket = new WebSocket('wss://chat.example.com/streams/' + streamId);
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    setMessages(list => [...list, message].slice(-LIMIT));
  });
  return () => socket.close();
}, [streamId]);`,
          paragraphs: [
            "Only the subscription changes. The capping, dedupe, keys, and scroll logic stay the same, which is a good sign the component separates transport from presentation. In production, add reconnection with backoff and resume from the last message id.",
          ],
        },
        {
          heading: "Sending messages",
          points: [
            "Add the user's message optimistically with a temporary id and a pending style, then replace it with the server copy.",
            "Disable the send button or debounce rapid presses to avoid accidental duplicates.",
            "Render message text as text, never as HTML, so a chat message cannot inject markup.",
          ],
        },
      ],
      animation: {
        title: "A capped, live-updating message list",
        nodes: [
          { id: "server", label: "Chat server", sub: "new messages" },
          { id: "transport", label: "Poll / socket", sub: "every 2 s" },
          { id: "dedupe", label: "Dedupe", sub: "by message id" },
          { id: "state", label: "State", sub: "last 100 only" },
          { id: "ui", label: "Chat list", sub: "scroll if at bottom" },
        ],
        steps: [
          {
            from: "server",
            to: "transport",
            label: "batch",
            note: "New messages arrive through polling or a pushed socket event.",
          },
          {
            from: "transport",
            to: "dedupe",
            label: "incoming",
            note: "Messages already in state are filtered out by id.",
          },
          {
            from: "dedupe",
            to: "state",
            label: "append",
            note: "Fresh messages are appended and the list is trimmed to the newest 100.",
          },
          {
            from: "state",
            to: "ui",
            label: "render",
            note: "The list re-renders, auto-scrolling only when the user was near the bottom.",
          },
        ],
      },
    },
  ),

  "real-world-features--authentication-and-protected-routes": detailed(
    lesson(
      "Most apps show different screens to signed-in and signed-out users. On the client, that means knowing the current user, keeping it in shared state, and redirecting from protected routes. The server must still check every request, because anything in the browser can be changed by the user.",
      [
        "Authentication providers expose a subscription such as onAuthStateChanged. Subscribe once near the root in an effect, store the user in context or Redux, and unsubscribe in the cleanup. Until the first callback arrives, the status is unknown, not signed out.",
        'A protected route component checks that state. While status is loading it renders a placeholder; when signed out it redirects with <Navigate to="/login" replace state={{ from: location }} />; otherwise it renders the child routes through <Outlet />.',
        "Client-side guards are user experience, not security. They stop people from seeing screens they cannot use, but the API must authorize each request with a session cookie or token it validates on the server.",
      ],
      `import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router';
import { subscribeToAuth } from './auth.js'; // wraps your provider's SDK

const AuthContext = createContext({ status: 'loading', user: null });

function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ status: 'loading', user: null });
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) =>
      setAuth({ status: user ? 'signedIn' : 'signedOut', user }),
    );
    return unsubscribe;
  }, []);
  return <AuthContext value={auth}>{children}</AuthContext>;
}

function RequireAuth() {
  const { status } = useContext(AuthContext);
  const location = useLocation();
  if (status === 'loading') return <p>Checking your session…</p>;
  if (status === 'signedOut') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/browse" element={<Browse />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}`,
      "AuthProvider subscribes once and turns provider callbacks into a status of loading, signedIn, or signedOut. RequireAuth wraps every protected route: a signed-out visitor to /browse is redirected to /login, and the original location travels in navigation state so the login page can send them back after signing in. Login, Browse, and Account are your page components.",
      ["Auth subscription", "Shared auth state", "Guard route or Outlet"],
      "Treating the initial loading state as signed out redirects users to the login page for a split second on every refresh, even though they have a valid session. Model loading explicitly and wait for the first auth callback before deciding.",
      "Where should you store an access token in a browser app?",
      "Prefer an httpOnly, Secure, SameSite cookie set by your server, because JavaScript cannot read it, which limits the damage of an XSS bug. If you must hold a token in JavaScript, keep it in memory and use short lifetimes. Avoid long-lived tokens in localStorage.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "Sign-in forms that help people",
          points: [
            'Use type="email" and the right autocomplete values, such as email and current-password, so password managers work.',
            "Validate on submit and show errors next to fields with aria-describedby; do not block typing.",
            "Show one generic message like 'Email or password is incorrect' so the form does not reveal which accounts exist.",
            "Disable the submit button while the request is in flight to avoid duplicate sign-ins.",
          ],
        },
        {
          heading: "Redirecting after sign-in",
          code: `function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/browse';

  async function handleSubmit(event) {
    event.preventDefault();
    await signIn(new FormData(event.currentTarget));
    navigate(from, { replace: true });
  }
  // ...form markup
}`,
          paragraphs: [
            "replace: true swaps the login entry out of history, so pressing Back after signing in does not return to the login form.",
          ],
        },
      ],
      animation: {
        title: "Visiting a protected page",
        nodes: [
          { id: "visit", label: "Visit /browse", sub: "route matches" },
          { id: "guard", label: "RequireAuth", sub: "reads context" },
          { id: "login", label: "/login", sub: "Navigate replace" },
          { id: "provider", label: "Auth provider", sub: "session check" },
          { id: "page", label: "Browse page", sub: "via Outlet" },
          { id: "api", label: "API", sub: "verifies token" },
        ],
        steps: [
          {
            from: "visit",
            to: "guard",
            label: "match",
            note: "The router matches /browse inside the RequireAuth layout route.",
          },
          {
            from: "provider",
            to: "guard",
            label: "signedOut",
            note: "The auth subscription reports no user, so the guard decides to redirect.",
          },
          {
            from: "guard",
            to: "login",
            label: "redirect",
            note: "Navigate replaces history with /login and remembers where the user was going.",
          },
          {
            from: "login",
            to: "provider",
            label: "sign in",
            note: "After a successful sign-in the provider emits the new user.",
          },
          {
            from: "guard",
            to: "page",
            label: "Outlet",
            note: "The guard now renders the requested page through Outlet.",
          },
          {
            from: "page",
            to: "api",
            label: "token",
            note: "Data requests still carry credentials the server validates every time.",
          },
        ],
      },
    },
  ),

  "real-world-features--environment-variables-and-api-keys": detailed(
    lesson(
      "Environment variables let one codebase run against different APIs in development, staging, and production. In a frontend build they are replaced with literal values at build time, which means anything you put in them ends up in JavaScript that every visitor can read.",
      [
        "Vite loads .env files and exposes variables prefixed with VITE_ on import.meta.env. The prefix is a safety net: unprefixed variables, which might hold server secrets, are never included in the client bundle.",
        "Values are inlined during the build. import.meta.env.VITE_API_URL becomes the string 'https://api.example.com' in the shipped file, so changing the variable requires a rebuild, and anyone can find it with View Source or DevTools.",
        "Secret keys, such as payment, database, or AI provider keys, must never be in frontend code, with or without .env. Call your own backend endpoint, keep the secret in the server's environment, and let the server talk to the third party.",
      ],
      `// .env.development (safe to expose: just a URL)
// VITE_API_URL=http://localhost:3000

// .env on the SERVER only (never VITE_ prefixed, never committed)
// OPENAI_API_KEY=sk-...

import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function MovieSuggestions() {
  const [prompt, setPrompt] = useState('');
  const [titles, setTitles] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    // The browser calls YOUR backend; the backend holds the AI key.
    const res = await fetch(API_URL + '/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) setTitles((await res.json()).titles);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="mood">What do you feel like watching?</label>
      <input id="mood" value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button>Suggest</button>
      <ul>{titles.map(title => <li key={title}>{title}</li>)}</ul>
    </form>
  );
}`,
      "The only build-time variable is the public API base URL, which is harmless to expose. The AI provider key lives in the server's environment, and the browser never sees it. The backend can also rate-limit, validate the prompt, and cache popular answers, which protects your bill as well as your key.",
      ["VITE_ public config", "Your backend endpoint", "Server-side secret"],
      "Adding .env to .gitignore does not make a VITE_ key secret. The key is still compiled into the bundle and served to every visitor; it is only missing from your repository. If a secret key was ever shipped, rotate it.",
      "Your app needs a different API URL for staging and production. How do you set it up with Vite?",
      "Create .env.staging and .env.production, each with its own VITE_API_URL, and build with vite build --mode staging or the default production mode. Each build inlines its own value. Keep a committed .env.example that lists the variable names without real values.",
      null,
    ),
    {
      deepDive: [
        {
          heading: "The matching backend route",
          code: `// server/routes/recommend.js (Node + Express)
app.post('/api/recommend', async (req, res) => {
  const prompt = String(req.body.prompt ?? '').slice(0, 300);
  const response = await fetch('https://api.example-ai.com/v1/complete', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.AI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'Suggest 5 movies for: ' + prompt }),
  });
  const data = await response.json();
  res.json({ titles: parseTitles(data) });
});`,
          paragraphs: [
            "process.env is read on the server at runtime and never reaches the browser. Trimming the prompt length and checking authentication here keeps strangers from using your endpoint as a free proxy to the provider.",
          ],
        },
        {
          heading: "Which values are safe in the frontend?",
          points: [
            "Safe: public API base URLs, feature flags, analytics site IDs, and publishable keys that the provider designs for browsers, such as a payment publishable key.",
            "Not safe: secret or private keys, database URLs, signing secrets, admin tokens, and any key that can spend money.",
            "When unsure, check the provider's docs: browser-safe keys are usually labeled public or publishable and are restricted by domain.",
          ],
        },
      ],
      animation: {
        title: "Where each value ends up",
        nodes: [
          { id: "env", label: ".env files", sub: "VITE_API_URL" },
          { id: "build", label: "vite build", sub: "inlines VITE_*" },
          { id: "bundle", label: "Browser bundle", sub: "readable by anyone" },
          { id: "server", label: "Your server", sub: "process.env secret" },
          { id: "ai", label: "AI provider", sub: "needs secret key" },
        ],
        steps: [
          {
            from: "env",
            to: "build",
            label: "read",
            note: "At build time, Vite reads .env files for the current mode.",
          },
          {
            from: "build",
            to: "bundle",
            label: "inline",
            note: "VITE_ values are pasted into the bundle as plain strings, visible to every user.",
          },
          {
            from: "bundle",
            to: "server",
            label: "POST",
            note: "The app calls your own endpoint and sends no secret at all.",
          },
          {
            from: "server",
            to: "ai",
            label: "key",
            note: "Only the server attaches the secret key when calling the provider.",
          },
          {
            from: "ai",
            to: "server",
            label: "result",
            note: "The answer flows back through your server, which can filter and cache it.",
          },
        ],
      },
    },
  ),

  "real-world-features--multi-language-support": detailed(
    lesson(
      "Supporting several languages means separating text from components. Components ask for a message by key, a dictionary per language supplies the words, and the browser's Intl APIs format numbers, dates, and plurals correctly for each locale.",
      [
        "Store translations as dictionaries keyed by language, such as en, hi, and es, each mapping message keys to strings. Components call t('search.placeholder') instead of embedding English text.",
        "Keep the current language in shared state, such as context or a Redux slice, and persist the choice. Changing it re-renders consumers with the new dictionary while the layout code stays identical.",
        "Never build sentences by concatenating translated fragments. Word order and plural rules differ between languages, so translate whole messages with placeholders and use Intl.PluralRules, Intl.NumberFormat, and Intl.DateTimeFormat for the variable parts.",
      ],
      `import { createContext, useContext, useState } from 'react';

const messages = {
  en: { title: 'Find a movie', placeholder: 'What do you want to watch?', results: { one: '{n} result', other: '{n} results' } },
  hi: { title: 'फ़िल्म खोजें', placeholder: 'आप क्या देखना चाहते हैं?', results: { one: '{n} परिणाम', other: '{n} परिणाम' } },
  es: { title: 'Busca una película', placeholder: '¿Qué quieres ver?', results: { one: '{n} resultado', other: '{n} resultados' } },
};

const LanguageContext = createContext('en');

function useT() {
  const lang = useContext(LanguageContext);
  const dict = messages[lang] ?? messages.en;
  return (key, n) => {
    const entry = dict[key];
    if (typeof entry === 'string') return entry;
    const form = new Intl.PluralRules(lang).select(n);
    const template = entry[form] ?? entry.other;
    return template.replace('{n}', new Intl.NumberFormat(lang).format(n));
  };
}

function Search({ count }) {
  const t = useT();
  return (
    <section>
      <h1>{t('title')}</h1>
      <input placeholder={t('placeholder')} aria-label={t('placeholder')} />
      <p>{t('results', count)}</p>
    </section>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  return (
    <LanguageContext value={lang}>
      <div lang={lang}>
        <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="es">Español</option>
        </select>
        <Search count={1250} />
      </div>
    </LanguageContext>
  );
}`,
      "Switching the select changes one context value. Search re-renders with the new dictionary, Intl.PluralRules chooses the singular or plural template, and Intl.NumberFormat writes 1,250 for English and Spanish-appropriate separators for Spanish. The lang attribute on the wrapper tells screen readers and the browser which language they are reading.",
      ["Language state", "Dictionary lookup", "Intl formatting"],
      "Hard-coding format like count + ' results' or date.toLocaleDateString() without a locale bakes English rules into the UI. Pass the active language to every Intl formatter and keep complete sentences in the dictionaries.",
      "Your app adds Arabic. Besides translations, what else must change?",
      'Arabic is written right to left, so set dir="rtl" alongside lang="ar" and use logical CSS properties such as margin-inline-start instead of margin-left, so the layout mirrors correctly. Arabic also has six plural categories, which Intl.PluralRules handles if your dictionary provides them.',
      null,
    ),
    {
      deepDive: [
        {
          heading: "When to reach for a library",
          paragraphs: [
            "A small dictionary is fine for a handful of screens. As the app grows, libraries like react-i18next or FormatJS add lazy loading of language files, rich message syntax with nested plurals and gender, missing-key warnings, and tooling for translators. The component code looks almost the same: t('key') or a FormattedMessage component.",
          ],
        },
        {
          heading: "Practical checklist",
          points: [
            "Detect an initial language from navigator.languages, then let the user override it and remember the choice.",
            "Lazy load each language file with import() so users only download their own language.",
            "Design layouts for longer text: German and Finnish strings can be 30 percent longer than English.",
            "Translate alt text, aria-labels, and validation messages too, not just visible headings.",
          ],
          code: `const loaders = { hi: () => import('./locales/hi.json'), es: () => import('./locales/es.json') };
const dictionary = (await loaders[lang]?.())?.default ?? englishMessages;`,
        },
      ],
      animation: {
        title: "Changing language at runtime",
        nodes: [
          { id: "select", label: "Language select", sub: "user picks hi" },
          { id: "state", label: "Language state", sub: "context / store" },
          { id: "dict", label: "Dictionary", sub: "messages.hi" },
          { id: "intl", label: "Intl APIs", sub: "plurals, numbers" },
          { id: "ui", label: "Components", sub: "t('key')" },
        ],
        steps: [
          {
            from: "select",
            to: "state",
            label: "hi",
            note: "Choosing Hindi updates one shared language value.",
          },
          {
            from: "state",
            to: "ui",
            label: "re-render",
            note: "Every component using the language context re-renders.",
          },
          {
            from: "ui",
            to: "dict",
            label: "t('title')",
            note: "Each component looks up its messages by key in the Hindi dictionary.",
          },
          {
            from: "ui",
            to: "intl",
            label: "1250",
            note: "Counts and dates are formatted with the rules of the active locale.",
          },
          {
            from: "intl",
            to: "ui",
            label: "text",
            note: "The same layout now reads naturally in the new language.",
          },
        ],
      },
    },
  ),
};
