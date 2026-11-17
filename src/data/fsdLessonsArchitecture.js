// High-level design case studies for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const architectureLessons = {
  "high-level-design--hld-overview": fsd({
    intro:
      "Frontend high-level design is the architecture of a product's client: how it is rendered and delivered, how it gets and caches data, how components and state are organised, and how it stays fast, secure, accessible, and observable at scale. In interviews and design reviews you are judged on clarifying requirements, making explicit trade-offs, and going deep where it matters.",
    concepts: [
      "Start from requirements: functional (what users do) and non-functional (devices, networks, scale, latency targets, SEO, offline, accessibility, internationalisation). They decide everything else.",
      "Cover the architecture layers: rendering strategy, application shell and routing, component hierarchy, data model and API contracts, state and caching, real-time needs, and performance, security, accessibility, and observability.",
      "Every case study in this module follows the same structure so you can reuse it: requirements, architecture diagram, data model and APIs, key interactions, optimizations, and trade-offs.",
    ],
    code: `// A reusable frontend HLD template (fill one in per case study)
const design = {
  requirements: {
    functional: ["Browse feed", "Like and comment", "Upload photo"],
    nonFunctional: { devices: "mobile-first", p75LCP: "< 2.5s", offline: "read cached feed", a11y: "WCAG 2.2 AA", i18n: true },
  },
  architecture: {
    rendering: "SSR app shell + client navigation",
    delivery: "CDN for HTML shell, assets, and images",
    layers: ["UI components", "feature hooks", "API client", "cache/store", "transport (HTTP + SSE)"],
  },
  dataModel: { Post: ["id", "author", "media[]", "caption", "likeCount", "viewerHasLiked", "createdAt"] },
  apis: ["GET /feed?cursor", "POST /posts/:id/like", "POST /uploads (presigned)"],
  interactions: ["infinite feed", "optimistic like", "resumable upload"],
  optimizations: ["responsive images", "virtualized list", "prefetch next page", "code split composer"],
  tradeoffs: ["SSR cost vs. faster first paint", "cursor pagination: no page jumping"],
};`,
    walkthrough:
      "The template forces a complete answer. Requirements come first, and non-functional ones are quantified, such as an LCP target and the offline scope. Architecture names the rendering and delivery choices and the client layers. The data model and APIs are concrete enough to code against. Interactions are where you go deep, and the trade-offs section shows judgement, which interviewers weigh heavily.",
    flow: ["Clarify requirements", "Sketch architecture", "Deep-dive and trade off"],
    mistake:
      "Jumping straight into component trees or state libraries before asking who the users are, what devices they use, and what matters most. You end up optimising the wrong thing.",
    exercise:
      "In a 45-minute frontend HLD interview, roughly how would you spend your time?",
    answer:
      "About 5 minutes on requirements and scope, 10 on high-level architecture and data model, 20 on deep dives into two or three key interactions or optimizations, and the last 10 on trade-offs, edge cases, and questions. Adjust when the interviewer steers.",
    deepDive: [
      {
        heading: "Questions to ask at the start",
        points: [
          "Who are the users and on which devices and networks?",
          "Which features are in scope for this discussion?",
          "Does it need SEO, offline support, real-time updates, or internationalisation?",
          "What scale: users, content volume, update frequency?",
          "Are there accessibility, security, or compliance constraints?",
        ],
      },
    ],
    animation: {
      title: "Structure of a frontend design",
      nodes: [
        ["req", "Requirements", "functional + NFR"],
        ["arch", "Architecture", "render + layers"],
        ["data", "Data + APIs", "models, contracts"],
        ["deep", "Deep dives", "key interactions"],
        ["trade", "Trade-offs", "why this way"],
      ],
      steps: [
        ["req", "arch", "constraints", "Requirements such as mobile-first and SEO pick the rendering strategy."],
        ["arch", "data", "contracts", "The architecture defines which data each layer needs and how it arrives."],
        ["data", "deep", "interactions", "Concrete APIs make deep dives like optimistic likes discussable."],
        ["deep", "trade", "justify", "Each deep dive ends with alternatives and why one was chosen."],
        ["trade", "req", "revisit", "Trade-offs are checked back against the original requirements."],
      ],
    },
  }),

  "high-level-design--photo-sharing-app": fsd({
    intro:
      "Design the frontend of a photo sharing app: an infinite home feed of images and videos, likes and comments, profiles with photo grids, stories, and uploading new posts with filters. The hard parts are image performance on mobile networks, smooth infinite scrolling, optimistic interactions, and reliable uploads.",
    concepts: [
      "Media dominates. Serve responsive images from an image CDN in AVIF or WebP at the size each device needs, use blur-up placeholders from a tiny preview hash, lazy-load off-screen media, and autoplay muted video only when it is mostly visible.",
      "The feed is cursor-paginated, virtualised, and prefetches the next page. Likes and comments are optimistic with rollback. A normalized cache shares post data between feed, profile grid, and post detail views.",
      "Uploads go directly from the browser to object storage using presigned URLs, with client-side resizing and compression, chunked resumable uploads for video, progress UI, and a post-creation call once the media is stored.",
    ],
    code: `// Feed API contract
// GET /api/feed?cursor=...&limit=10
// → { items: [{ id, author: { id, username, avatarUrl }, media: [{ type, width, height, blurhash, srcset }],
//               caption, likeCount, viewerHasLiked, commentCount, createdAt }], nextCursor }

// Media component with blur-up placeholder and visibility-based video autoplay
function Media({ item, priority }) {
  const ref = useRef(null);
  useEffect(() => {
    if (item.type !== "video") return undefined;
    const io = new IntersectionObserver(([e]) => (e.intersectionRatio > 0.6 ? ref.current.play() : ref.current.pause()), { threshold: [0, 0.6] });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [item.type]);

  const style = { aspectRatio: \`\${item.width} / \${item.height}\`, backgroundImage: \`url(\${blurhashToDataUrl(item.blurhash)})\`, backgroundSize: "cover" };
  return item.type === "video"
    ? <video ref={ref} muted playsInline loop preload="metadata" poster={item.poster} style={style} src={item.src} />
    : <img srcSet={item.srcset} sizes="(min-width: 640px) 600px, 100vw" alt={item.alt ?? ""} style={style}
        loading={priority ? "eager" : "lazy"} fetchpriority={priority ? "high" : "auto"} decoding="async" />;
}

// Upload: resize on the client, then PUT to a presigned URL
async function uploadPhoto(file, caption) {
  const blob = await resizeImage(file, { maxWidth: 2048, type: "image/webp", quality: 0.85 }); // canvas or createImageBitmap
  const { uploadUrl, mediaId } = await api("/uploads", { method: "POST", body: { contentType: blob.type, size: blob.size } });
  await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": blob.type } });
  return api("/posts", { method: "POST", body: { mediaIds: [mediaId], caption } });
}`,
    walkthrough:
      "The feed payload includes dimensions and a blurhash, so every post reserves its space and shows a colourful placeholder before the image loads. Only the first post is fetched with high priority. Videos play only when at least 60% visible and pause otherwise, saving battery and data. Uploads are resized in the browser to cut bytes before sending them straight to storage, so the app servers never proxy large files.",
    flow: ["Optimise media delivery", "Virtualise and prefetch feed", "Upload direct to storage"],
    mistake:
      "Uploading original 12-megapixel photos from phones through your API server. It is slow on mobile networks, costly in bandwidth, and ties up server resources.",
    exercise:
      "How would you make the like button feel instant and stay correct?",
    answer:
      "Toggle viewerHasLiked and adjust likeCount optimistically in the normalized cache so every view updates, send the request, debounce rapid toggles to send only the final state, roll back on error with a toast, and reconcile with the server count in the response.",
    deepDive: [
      {
        heading: "Component architecture",
        points: [
          "AppShell: top bar, bottom navigation, route outlet; cached by the service worker.",
          "Feed: virtualised list of PostCard (Header, Media carousel, ActionBar, Caption, CommentPreview).",
          "StoriesTray: horizontally scrolling avatars; story viewer is code-split.",
          "Composer: code-split upload flow with filters done via canvas or WebGL.",
          "Profile: header plus a virtualised grid sharing the same post cache.",
        ],
      },
    ],
    animation: {
      title: "Posting a photo",
      nodes: [
        ["device", "Phone", "12 MP photo"],
        ["resize", "Client resize", "WebP 2048px"],
        ["api", "API", "presigned URL"],
        ["storage", "Object storage", "PUT media"],
        ["feed", "Feed cache", "new post"],
      ],
      steps: [
        ["device", "resize", "pick", "The user picks a photo and it is resized and compressed in the browser."],
        ["resize", "api", "request URL", "The app asks the API for a presigned upload URL."],
        ["resize", "storage", "PUT", "The image goes directly to object storage with a progress bar."],
        ["storage", "api", "create post", "Once stored, the app creates the post with the media ID and caption."],
        ["api", "feed", "prepend", "The new post is added to the top of the cached feed and profile grid."],
      ],
    },
  }),

  "high-level-design--e-commerce-app": fsd({
    intro:
      "Design the frontend of a large e-commerce site: home, search and category listings with filters, product detail pages, cart, and checkout. It must rank well in search, load fast on mobile, handle huge catalogs, keep cart and prices correct, and survive traffic spikes during sales. Different pages get different rendering strategies.",
    concepts: [
      "Rendering per route: product and category pages are server-rendered or statically generated with incremental revalidation for SEO and speed; personalised parts such as price for your pincode, stock, and recommendations load separately; cart and checkout are dynamic and private.",
      "Search and listing pages keep filters, sort, and page in the URL, use faceted search APIs, and update results without full reloads. Product images, structured data for rich results, and Core Web Vitals directly affect revenue.",
      "Cart and checkout prioritise correctness: the server is the source of truth for prices, stock, and discounts, the client updates optimistically but re-validates before payment, and payment uses a provider's hosted fields to keep card data out of your scope.",
    ],
    code: `// Product page: static shell + dynamic islands (Next.js-style)
export const revalidate = 300; // re-generate product HTML at most every 5 minutes

export default async function ProductPage({ params }) {
  const product = await getProduct((await params).slug); // title, images, specs: cacheable
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toProductJsonLd(product)) }} />
      <Gallery images={product.images} />                    {/* first image fetchpriority=high */}
      <h1>{product.title}</h1>
      <Suspense fallback={<PriceSkeleton />}>
        <LivePriceAndStock sku={product.sku} />             {/* per-user: pincode, offers, stock */}
      </Suspense>
      <AddToCartButton sku={product.sku} />                 {/* client island */}
      <Suspense fallback={<RecsSkeleton />}>
        <Recommendations sku={product.sku} />                {/* streamed, below the fold */}
      </Suspense>
    </>
  );
}

// Listing URL is the state: /c/jackets?size=M&brand=acme&sort=price_asc&page=2
// Cart API: server computes totals; client never trusts its own math for payment
// POST /api/cart/items { sku, qty } → { items, subtotal, discounts, deliveryFee, total, warnings: ["Only 2 left"] }`,
    walkthrough:
      "Product HTML is cached and regenerated every five minutes, so it is fast and crawlable, with JSON-LD structured data for rich search results. The parts that differ per user, such as price for a delivery location, offers, and stock, stream in through Suspense, so the cached page never shows another user's price. Add to Cart is the only hydrated island above the fold. Listing state lives in the URL, and the cart API returns server-computed totals and warnings.",
    flow: ["Cache the catalog", "Stream personal data", "Validate cart server side"],
    mistake:
      "Server-rendering personalised prices into a CDN-cached page. One user's discounted price gets cached and shown to everyone, or the page cannot be cached at all.",
    exercise:
      "A flash sale starts at noon and traffic jumps 20 times. Which frontend choices help the site survive?",
    answer:
      "Serve product and listing HTML from the CDN with stale-while-revalidate, keep the dynamic stock and price calls small and cacheable for a few seconds, queue or throttle checkout with a waiting room if needed, prefetch less aggressively during the spike, and ensure the client backs off on errors instead of retry storms.",
    deepDive: [
      {
        heading: "Checkout details that matter",
        points: [
          "Guest checkout and address autocomplete reduce friction.",
          "Idempotency keys on order placement prevent double charges on retries.",
          "Hosted payment fields in an iframe keep card data out of your JavaScript.",
          "Confirm orders only after the payment webhook or server verification.",
        ],
      },
    ],
    animation: {
      title: "Serving a product page",
      nodes: [
        ["user", "Shopper", "mobile"],
        ["cdn", "CDN", "cached HTML"],
        ["shell", "Product shell", "title, images"],
        ["price", "Price + stock", "per pincode"],
        ["cart", "Cart API", "server totals"],
      ],
      steps: [
        ["user", "cdn", "GET", "The shopper requests a product page and the CDN serves cached HTML instantly."],
        ["cdn", "shell", "render", "Title, gallery, and specs render with the hero image prioritised."],
        ["shell", "price", "stream", "Personal price and stock stream in for the shopper's delivery location."],
        ["price", "cart", "add", "Add to Cart sends the SKU; the server returns authoritative totals."],
        ["cart", "user", "warning", "A low-stock warning from the server appears in the mini cart."],
      ],
    },
  }),

  "high-level-design--news-feed": fsd({
    intro:
      "Design the frontend of a social news feed: a ranked, infinitely scrolling list of posts with text, images, links, and video, reactions and comments, a composer, and new-post notifications. The challenges are rendering heterogeneous posts efficiently, keeping interactions instant, handling real-time updates without disrupting reading, and staying fast on low-end devices.",
    concepts: [
      "The feed is a list of post IDs with cursors; posts are normalized entities so reactions and edits update every place they appear. The server ranks; the client renders and prefetches.",
      "Heterogeneous posts use a type-to-component registry, code-split rare types such as polls or events, and are virtualised with dynamic row heights measured after render.",
      "New posts arrive via SSE or polling and are held in a 'New posts' pill rather than inserted above the reader. Interactions are optimistic, and the composer saves drafts locally.",
    ],
    code: `// Normalized feed state
// feed: { ids: ["p9", "p8", ...], nextCursor, pendingNewIds: ["p10"] }
// posts: { p9: { id, type: "photo", authorId, ... }, ... }  users: { u1: {...} }

const postRenderers = {
  text: TextPost,
  photo: PhotoPost,
  link: LinkPreviewPost,
  video: lazy(() => import("./posts/VideoPost")),
  poll: lazy(() => import("./posts/PollPost")),
};

function FeedItem({ id }) {
  const post = usePost(id);                 // subscribes to one entity only
  const Renderer = postRenderers[post.type] ?? UnsupportedPost;
  return (
    <article aria-labelledby={\`author-\${id}\`} aria-posinset={post.index + 1} aria-setsize={-1}>
      <Suspense fallback={<PostSkeleton type={post.type} />}>
        <Renderer post={post} />
      </Suspense>
      <ReactionBar postId={id} />           {/* optimistic reactions */}
    </article>
  );
}

// Real-time: queue new posts, reveal on demand
useEventSource("/api/feed/stream", (event) => {
  if (event.type === "post.created") feedStore.queueNew(event.post);   // shows "3 new posts" pill
  if (event.type === "post.updated") feedStore.upsertPost(event.post); // edits apply in place
});`,
    walkthrough:
      "The feed stores IDs and each item subscribes only to its own post, so a reaction on one post re-renders one card, not the whole list. A registry maps post types to components and lazy-loads rare ones. Articles use aria-posinset with an unknown set size, the recommended pattern for infinite feeds. New posts from the stream are queued behind a pill so the content under the reader's eyes never jumps, while edits apply in place.",
    flow: ["Fetch ranked IDs", "Render typed, virtualised posts", "Merge live updates gently"],
    mistake:
      "Inserting new posts at the top as they arrive. The post the user is reading slides down the screen, and they lose their place.",
    exercise:
      "How would you track impressions, meaning which posts were actually seen, for ranking and analytics?",
    answer:
      "Use an IntersectionObserver per post with a threshold such as 50% visible for at least one second, batch impression events in memory, and flush with sendBeacon periodically and on page hide. Deduplicate per post per session.",
    deepDive: [
      {
        heading: "Performance budget for low-end phones",
        points: [
          "Keep initial JS for the feed route under about 150 KB compressed; lazy-load the composer and rare post types.",
          "Render the first few posts on the server for fast LCP; hydrate progressively.",
          "Avoid layout thrash from measuring every row; use estimated heights and correct after render.",
        ],
      },
    ],
    animation: {
      title: "Live feed without jumping",
      nodes: [
        ["api", "Feed API", "ranked IDs"],
        ["store", "Feed store", "ids + posts"],
        ["list", "Virtual list", "visible posts"],
        ["stream", "SSE stream", "new + updated"],
        ["pill", "New posts pill", "3 new"],
      ],
      steps: [
        ["api", "store", "page", "The first page of ranked post IDs and entities fills the store."],
        ["store", "list", "render", "Only visible posts render in the virtualised list."],
        ["stream", "store", "updated", "An edited post is upserted and its card updates in place."],
        ["stream", "pill", "created", "Three new posts are queued, and a pill offers to show them."],
        ["pill", "list", "reveal", "Tapping the pill scrolls to the top and inserts the new posts."],
      ],
    },
  }),

  "high-level-design--video-streaming": fsd({
    intro:
      "Design the frontend of a video streaming service: personalised browse rows of titles, a details page, and a player that starts quickly, adapts quality to the network, supports subtitles and audio tracks, resumes where you left off, and works across TVs, phones, and browsers. The player and the browse experience have very different performance problems.",
    concepts: [
      "Adaptive bitrate streaming with HLS or DASH splits video into short segments at several qualities. The player measures throughput and buffer health and switches renditions between segments, starting low for a fast start and stepping up.",
      "Media Source Extensions let JavaScript players such as hls.js, dash.js, or Shaka feed segments into the video element; Encrypted Media Extensions plus DRM licences protect premium content.",
      "Browse pages are image-heavy grids of rows: lazy-load rows and artwork, prefetch details and the first video segments on hover or focus, support remote-control and keyboard spatial navigation on TVs, and send playback heartbeats to resume across devices.",
    ],
    code: `import Hls from "hls.js";

export function Player({ title, startAt = 0, onProgress }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    let hls;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = title.hlsUrl;                       // Safari plays HLS natively
    } else if (Hls.isSupported()) {
      hls = new Hls({ startLevel: 0, capLevelToPlayerSize: true, maxBufferLength: 30 });
      hls.loadSource(title.hlsUrl);                   // master playlist with 240p…4K renditions
      hls.attachMedia(video);
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => track("abr_switch", { level: d.level }));
    }
    video.currentTime = startAt;

    const heartbeat = setInterval(() => onProgress(video.currentTime), 10_000); // resume across devices
    return () => { clearInterval(heartbeat); hls?.destroy(); };
  }, [title.hlsUrl, startAt, onProgress]);

  return (
    <video ref={videoRef} controls playsInline poster={title.backdrop} aria-label={\`Playing \${title.name}\`}>
      {title.subtitles.map((s) => <track key={s.lang} kind="subtitles" srcLang={s.lang} label={s.label} src={s.vttUrl} />)}
    </video>
  );
}

// Browse: prefetch when a tile is focused for 400 ms (TV remote or mouse hover)
function onTileFocus(title) {
  timer = setTimeout(() => {
    queryClient.prefetchQuery({ queryKey: ["title", title.id], queryFn: () => getTitle(title.id) });
    fetch(title.firstSegmentUrl, { priority: "low" }); // warm the CDN and connection
  }, 400);
}`,
    walkthrough:
      "Safari uses its native HLS support; other browsers use hls.js with Media Source Extensions. The player starts at the lowest rendition for a fast first frame, caps quality to the player size so a small window does not download 4K, and logs quality switches. Subtitles use standard track elements in WebVTT. A heartbeat saves progress every ten seconds for resume. Focusing a tile prefetches title details and warms the first segment so playback starts faster.",
    flow: ["Browse with lazy rows", "Prefetch on intent", "Adaptive playback + heartbeats"],
    mistake:
      "Starting playback at the highest quality to look impressive. The first segment takes seconds to download on average networks, and many users leave before the video starts.",
    exercise:
      "How would you measure and improve video start time?",
    answer:
      "Measure time from play intent to first frame and rebuffer ratio in real-user telemetry, segmented by device and network. Improve with a low start bitrate, short initial segments, prefetching on focus, preconnecting to the video CDN, and keeping the player code preloaded on details pages.",
    deepDive: [
      {
        heading: "TV and living-room constraints",
        points: [
          "Weak CPUs and limited memory: keep the DOM small and avoid heavy animations.",
          "Spatial navigation with arrow keys: a focus manager that moves between rows and tiles predictably.",
          "Large, high-contrast focus states visible from across a room.",
        ],
      },
    ],
    animation: {
      title: "Adaptive bitrate playback",
      nodes: [
        ["player", "Player", "hls.js / native"],
        ["manifest", "Master playlist", "240p … 4K"],
        ["cdn", "Video CDN", "segments"],
        ["buffer", "Buffer", "30 s target"],
        ["abr", "ABR logic", "picks quality"],
      ],
      steps: [
        ["player", "manifest", "load", "The player loads the master playlist listing every rendition."],
        ["abr", "cdn", "240p first", "ABR starts with a low rendition so the first frame appears quickly."],
        ["cdn", "buffer", "segments", "Segments fill the buffer while throughput is measured."],
        ["buffer", "abr", "healthy", "With a healthy buffer and fast network, ABR steps up to 1080p."],
        ["abr", "cdn", "drop", "When the network slows, the next segments are fetched at a lower quality."],
      ],
    },
  }),

  "high-level-design--music-streaming": fsd({
    intro:
      "Design the frontend of a music streaming app: browse and search, playlists, an always-present player that keeps playing across navigation, a queue with shuffle and repeat, lyrics, offline downloads, and media controls on the lock screen. The defining constraint is that playback must never be interrupted by anything else the app does.",
    concepts: [
      "The player lives outside the routed content, in the app shell, with its own state store. Navigation swaps pages but never remounts the audio element, which makes the app a single-page app by necessity.",
      "Queue management handles the current track, upcoming tracks, history, shuffle order, and repeat modes. Preload the next track near the end of the current one for gapless transitions.",
      "Integrate with the platform: the Media Session API for lock-screen and hardware media keys, service worker caching or IndexedDB for downloaded tracks, and the Page Visibility API to reduce UI work while playing in the background.",
    ],
    code: `// player-store.js: one audio element for the whole app
const audio = new Audio();
audio.preload = "auto";

export const usePlayer = create((set, get) => ({
  queue: [], index: -1, playing: false, shuffle: false, repeat: "off",

  playQueue(tracks, startIndex = 0) {
    set({ queue: tracks, index: startIndex });
    get().load();
  },
  load() {
    const track = get().queue[get().index];
    if (!track) return;
    audio.src = track.streamUrl;
    audio.play().then(() => set({ playing: true }));
    updateMediaSession(track);
  },
  next() {
    const { index, queue, repeat } = get();
    const nextIndex = index + 1 < queue.length ? index + 1 : repeat === "all" ? 0 : -1;
    if (nextIndex >= 0) { set({ index: nextIndex }); get().load(); } else set({ playing: false });
  },
}));

audio.addEventListener("ended", () => usePlayer.getState().next());
audio.addEventListener("timeupdate", () => {
  const { queue, index } = usePlayer.getState();
  const upcoming = queue[index + 1];
  if (upcoming && audio.duration - audio.currentTime < 15) prefetchAudio(upcoming.streamUrl); // gapless-ish
});

function updateMediaSession(track) {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, artwork: [{ src: track.art, sizes: "512x512" }] });
  navigator.mediaSession.setActionHandler("nexttrack", () => usePlayer.getState().next());
  navigator.mediaSession.setActionHandler("pause", () => { audio.pause(); usePlayer.setState({ playing: false }); });
}`,
    walkthrough:
      "A single Audio element is created outside React, so route changes and re-renders cannot interrupt it. The store manages the queue and repeat logic; ended advances automatically. Fifteen seconds before a track ends the next one is prefetched to avoid a gap. The Media Session API puts track metadata and controls on the lock screen, notification shade, and keyboard media keys.",
    flow: ["Keep the player in the shell", "Manage the queue", "Integrate with OS media controls"],
    mistake:
      "Rendering the audio element inside a route component. Navigating to an artist page unmounts it and stops the music, which is the one thing users never forgive.",
    exercise:
      "How would you support downloading playlists for offline listening?",
    answer:
      "Download tracks through the service worker into Cache Storage or IndexedDB with licence metadata and expiry, request persistent storage, show per-track download state, have the player check the local cache before streaming, and periodically re-validate licences when online.",
    deepDive: [
      {
        heading: "UI architecture",
        points: [
          "Shell: sidebar or bottom nav, routed content area, persistent NowPlaying bar.",
          "Pages: home rows, search with instant results, album, artist, and playlist pages sharing a TrackList component.",
          "TrackList is virtualised for 10,000-song playlists and supports keyboard selection and drag reorder.",
        ],
      },
    ],
    animation: {
      title: "Playback that survives navigation",
      nodes: [
        ["shell", "App shell", "owns <audio>"],
        ["route", "Routed page", "album → artist"],
        ["queue", "Queue store", "next track"],
        ["os", "OS controls", "Media Session"],
      ],
      steps: [
        ["route", "queue", "play album", "Clicking Play on an album loads its tracks into the queue."],
        ["queue", "shell", "load", "The shell's single audio element starts the first track."],
        ["route", "route", "navigate", "The user navigates to the artist page; the audio element is untouched."],
        ["queue", "shell", "prefetch", "Near the end of the track, the next one is prefetched."],
        ["os", "queue", "next key", "Pressing the hardware next key advances the queue via Media Session."],
      ],
    },
  }),

  "high-level-design--live-commentary": fsd({
    intro:
      "Design the frontend of a live sports commentary and scores app: a live scorecard, ball-by-ball or minute-by-minute commentary, match lists across many games, and notifications. Traffic spikes enormously at key moments, updates must arrive within seconds, and most users are on mobile, often on congested networks inside stadiums or on the move.",
    concepts: [
      "The read path must scale to millions of viewers. Serve the scorecard and commentary snapshot from a CDN with very short TTLs, and push incremental updates over SSE or a pub/sub WebSocket service, falling back to polling.",
      "Commentary is an append-only, ordered stream with sequence numbers. Clients render newest first, apply corrections as edits by ID, and resync from the snapshot on gaps or reconnects.",
      "Keep it light: small payloads with deltas rather than full scorecards, a lightweight page with minimal JavaScript for the live view, and battery-aware behaviour such as slowing updates when the tab is hidden.",
    ],
    code: `// Snapshot (CDN, max-age=2, stale-while-revalidate=10)
// GET /api/matches/ind-aus-3/live → { seq: 512, score: {...}, commentary: [{ id, seq, over: "18.4", text, kind: "four" }, ...] }

// Push stream (SSE) of small deltas
// event: ball   data: { "seq": 513, "over": "18.5", "runs": 1, "score": "152/4", "text": "Pushed to long-on for one." }
// event: edit   data: { "seq": 514, "id": "c_510", "text": "Correction: that was a leg bye." }

export function useLiveMatch(matchId) {
  const [state, setState] = useState(null);

  useEffect(() => {
    let source;
    let cancelled = false;
    async function connect() {
      const snapshot = await fetch(\`/api/matches/\${matchId}/live\`).then((r) => r.json());
      if (cancelled) return;
      setState(snapshot);
      source = new EventSource(\`/api/matches/\${matchId}/stream?after=\${snapshot.seq}\`);
      const apply = (e) => setState((s) => applyDelta(s, JSON.parse(e.data))); // ignores seq <= s.seq, flags gaps
      source.addEventListener("ball", apply);
      source.addEventListener("edit", apply);
    }
    connect();

    const onVisibility = () => {
      if (document.hidden) source?.close();           // save battery and server connections
      else { source?.close(); connect(); }             // resync on return
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { cancelled = true; source?.close(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [matchId]);

  return state;
}`,
    walkthrough:
      "The snapshot is served from the CDN with a two-second TTL, so millions of simultaneous page loads hit the edge, not the origin. The SSE stream starts after the snapshot's sequence number, so no ball is missed or duplicated. Corrections are edits by ID. When the tab is hidden the stream closes; when the user returns, the hook reloads the snapshot and resubscribes, which is cheaper than keeping millions of idle connections open.",
    flow: ["Load CDN snapshot", "Stream ordered deltas", "Resync on gaps or return"],
    mistake:
      "Having every client poll the origin API every second for the full scorecard. A single wicket that brings in ten million viewers becomes ten million origin requests per second.",
    exercise:
      "How would you show the score in a browser tab title and send a notification for a wicket?",
    answer:
      "Update document.title from the live state, such as 'IND 152/4 (18.5)', and use Web Push with the user's permission, triggered server side for subscribed events like wickets, so notifications arrive even when the tab is closed.",
    deepDive: [
      {
        heading: "Page architecture",
        points: [
          "Match list: SSR with short CDN caching; live badges update via a lightweight multiplexed stream.",
          "Match page tabs: live (commentary), scorecard, and stats; only the active tab subscribes to its updates.",
          "Commentary list is virtualised for long matches and supports jumping to a specific over.",
        ],
      },
    ],
    animation: {
      title: "A wicket reaching millions",
      nodes: [
        ["scorer", "Scorer input", "wicket!"],
        ["pubsub", "Pub/sub", "fan-out"],
        ["edge", "Stream edges", "SSE nodes"],
        ["cdn", "CDN snapshot", "TTL 2 s"],
        ["fans", "Fans' phones", "live UI"],
      ],
      steps: [
        ["scorer", "pubsub", "event seq 513", "The scorer records a wicket, publishing an event with the next sequence number."],
        ["pubsub", "edge", "fan-out", "Stream edge servers receive it and push it to their connected clients."],
        ["edge", "fans", "SSE", "Each phone applies the delta and the scorecard updates within a second."],
        ["fans", "cdn", "new viewers", "Fans who just opened the app load the CDN snapshot first."],
        ["cdn", "edge", "after=513", "They then subscribe from that sequence, so they see every later ball."],
      ],
    },
  }),

  "high-level-design--email-client": fsd({
    intro:
      "Design the frontend of a web email client: folders and labels, a fast message list for huge mailboxes, threaded conversation view, compose with drafts and attachments, search, keyboard shortcuts, and offline access. Users live in their email all day, so perceived speed, reliability of drafts, and safe rendering of untrusted HTML emails are critical.",
    concepts: [
      "Local-first data: cache recent threads and messages in IndexedDB, render lists from local data instantly, and sync deltas with the server using a history ID. Actions such as archive or label apply optimistically and queue in an outbox.",
      "Untrusted HTML email must be isolated. Sanitize it, render it inside a sandboxed iframe without scripts, block remote images by default to prevent tracking, and rewrite links to open safely.",
      "Productivity features: virtualised message lists, keyboard shortcuts for every action, autosaved drafts with conflict handling, resumable attachment uploads, and search that combines local results instantly with server results.",
    ],
    code: `// Rendering an untrusted HTML email safely
import DOMPurify from "dompurify";

export function EmailBody({ html, showImages }) {
  const clean = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style", "form", "input", "iframe", "object"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
    WHOLE_DOCUMENT: true,
  });
  const withImagePolicy = showImages ? clean : clean.replace(/<img\\b[^>]*>/gi, '<span class="blocked-img">[image blocked]</span>');

  return (
    <iframe
      title="Email message"
      sandbox="allow-popups allow-popups-to-escape-sandbox"   // no scripts, no same-origin
      srcDoc={\`<base target="_blank"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'">\${withImagePolicy}\`}
      style={{ width: "100%", border: 0 }}
      onLoad={(e) => (e.currentTarget.style.height = \`\${e.currentTarget.contentDocument?.body.scrollHeight ?? 600}px\`)}
    />
  );
}

// Optimistic archive with an outbox and undo
export function archive(threadId) {
  mailStore.moveThread(threadId, "INBOX", "ARCHIVE");          // UI updates instantly
  const op = outbox.enqueue({ type: "archive", threadId });    // persisted in IndexedDB
  showToast("Conversation archived", { action: "Undo", onAction: () => { outbox.cancel(op); mailStore.moveThread(threadId, "ARCHIVE", "INBOX"); } });
}`,
    walkthrough:
      "Email HTML is sanitized, remote images are blocked until the user chooses to show them, and the result renders in an iframe sandbox without allow-scripts or allow-same-origin, plus an inner CSP, so even a sanitizer bypass cannot run code or read the app. Links open in new tabs. Archiving moves the thread locally at once, persists the operation to an outbox that survives reloads and offline periods, and offers undo before the server call is final.",
    flow: ["Sync mailbox locally", "Render email in a sandbox", "Act optimistically with undo"],
    mistake:
      "Injecting email HTML directly into the app's DOM. Attackers send crafted emails, and any sanitizer gap becomes stored XSS that can read every message in the account.",
    exercise:
      "How would you make search feel instant in a mailbox with 200,000 messages?",
    answer:
      "Search the locally cached recent messages in IndexedDB immediately (by subject, sender, and a small local index) while sending the query to the server's full-text search, then merge and de-duplicate server results as they arrive, labelling them clearly. Debounce and cancel as in autocomplete.",
    deepDive: [
      {
        heading: "Compose and drafts",
        points: [
          "Autosave drafts locally on every change and to the server every few seconds with a version number.",
          "Detect conflicts when the same draft is edited on two devices and keep both versions.",
          "Upload attachments in chunks as soon as they are added, so Send is instant.",
          "Undo send by delaying the actual send request for a few seconds.",
        ],
      },
    ],
    animation: {
      title: "Archive offline, sync later",
      nodes: [
        ["user", "User", "presses e"],
        ["store", "Mail store", "local move"],
        ["outbox", "Outbox", "IndexedDB"],
        ["server", "Mail server", "applies op"],
        ["list", "Inbox list", "updated"],
      ],
      steps: [
        ["user", "store", "archive", "The keyboard shortcut archives the thread in the local store."],
        ["store", "list", "instant", "The inbox list updates immediately and shows an Undo toast."],
        ["store", "outbox", "queue", "The operation is persisted in the outbox while offline."],
        ["outbox", "server", "sync", "When online, the outbox sends the operation with a history ID."],
        ["server", "store", "confirm", "The server confirms and the outbox entry is cleared."],
      ],
    },
  }),

  "high-level-design--diagram-tool": fsd({
    intro:
      "Design the frontend of a collaborative diagramming tool with a hand-drawn style: an infinite canvas with shapes, arrows, text, and freehand drawing, selection and transforms, undo and redo, export, and real-time multiplayer with cursors. Performance on large drawings and conflict-free collaboration are the core challenges.",
    concepts: [
      "Render to canvas, not the DOM. Keep a scene graph of elements in memory, draw them on an HTML canvas with a camera transform for pan and zoom, cache rendered shapes as bitmaps, and only redraw what changed or what is in view.",
      "Hit-testing and selection use geometry: bounding boxes for quick rejection, precise point-in-shape and distance-to-path tests for accuracy, and a spatial index such as a grid or R-tree for large scenes.",
      "Collaboration syncs element changes, not pixels. Each element has an ID and version; concurrent edits merge with last-writer-wins per element or a CRDT library, presence such as cursors and selections travels on a separate lightweight channel, and undo is scoped to the local user's actions.",
    ],
    code: `// Scene model and render loop
// element: { id, type: "rect" | "arrow" | "text" | "freedraw", x, y, width, height, angle, points?, style, version, updatedBy }

const camera = { x: 0, y: 0, zoom: 1 };
let dirty = true;

function render(ctx, scene) {
  if (!dirty) return requestAnimationFrame(() => render(ctx, scene));
  dirty = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.x * camera.zoom, -camera.y * camera.zoom);

  const view = visibleBounds(camera, ctx.canvas);
  for (const el of scene.index.search(view)) {          // spatial index: only draw what is on screen
    const bitmap = shapeCache.get(el.id, el.version) ?? shapeCache.draw(el); // re-rasterise only on change
    ctx.save();
    ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
    ctx.rotate(el.angle);
    ctx.drawImage(bitmap, -el.width / 2, -el.height / 2);
    ctx.restore();
  }
  requestAnimationFrame(() => render(ctx, scene));
}

// Collaboration: send element-level changes, merge by version
function applyRemote(scene, incoming) {
  for (const el of incoming) {
    const local = scene.get(el.id);
    if (!local || el.version > local.version || (el.version === local.version && el.updatedBy > local.updatedBy)) {
      scene.put(el); // deterministic tie-break keeps every client consistent
    }
  }
  dirty = true;
}`,
    walkthrough:
      "The render loop only redraws when something marked the scene dirty, applies the camera transform for pan and zoom, queries a spatial index for elements in view, and draws cached bitmaps, re-rasterising a shape only when its version changes. Remote changes merge per element by version with a deterministic tie-break on user ID, so every client converges to the same scene without a central lock.",
    flow: ["Model a scene graph", "Render visible shapes on canvas", "Sync element changes"],
    mistake:
      "Rendering each shape as a DOM or SVG element for drawings with thousands of shapes. Pan and zoom trigger layout and style work for every node and the app becomes unusable.",
    exercise:
      "How do you implement undo and redo when several people are editing the same diagram?",
    answer:
      "Keep a per-user history of the user's own operations as inverse patches. Undo applies the inverse of the user's last change as a new edit, broadcast like any other change, rather than rewinding the shared document, so other users' work is preserved.",
    deepDive: [
      {
        heading: "Accessibility and export",
        points: [
          "Canvas content is invisible to screen readers; maintain a parallel accessible list of elements with labels and keyboard selection.",
          "Export to SVG by serialising the scene graph, and to PNG by rendering an offscreen canvas at higher resolution.",
          "Persist scenes as JSON with a schema version for migrations.",
        ],
      },
    ],
    animation: {
      title: "Two users editing one diagram",
      nodes: [
        ["alice", "Alice", "moves arrow"],
        ["scene", "Local scene", "version++"],
        ["relay", "Sync server", "broadcast"],
        ["bob", "Bob", "applies change"],
        ["canvas", "Canvas", "redraw dirty"],
      ],
      steps: [
        ["alice", "scene", "drag", "Alice drags an arrow; the element's version increments locally."],
        ["scene", "canvas", "dirty", "Only Alice's view redraws the moved arrow at 60 frames per second."],
        ["scene", "relay", "patch", "A small element patch is sent, throttled during the drag."],
        ["relay", "bob", "broadcast", "Bob receives the patch and merges it by version."],
        ["bob", "canvas", "redraw", "Bob's canvas marks itself dirty and draws the arrow in its new place."],
      ],
    },
  }),

  "high-level-design--analytics-dashboard": fsd({
    intro:
      "Design the frontend of a web analytics dashboard: date-range and filter controls, KPI tiles, time-series charts, breakdown tables, real-time visitors, and saved reports, over datasets with billions of events. The frontend must stay responsive while querying heavy aggregations, render many charts efficiently, and keep the URL as the source of truth for every view.",
    concepts: [
      "All view state such as date range, comparison period, filters, and segments lives in the URL, so reports are shareable and bookmarkable. Each widget derives its query from that shared state.",
      "Data fetching is per widget with caching keyed by the query, request deduplication, cancellation when filters change, and progressive loading so fast KPI tiles appear before slow breakdowns. The backend pre-aggregates; the frontend never downloads raw events.",
      "Charts must handle large series: downsample on the server to roughly one point per pixel, render with canvas for dense data and SVG for small, accessible charts, virtualise long tables, and offer data tables or summaries as accessible alternatives.",
    ],
    code: `// URL-driven report state: /reports/traffic?from=2026-10-01&to=2026-10-31&compare=prev&country=IN&device=mobile
function useReportParams() {
  const [params] = useSearchParams();
  return useMemo(() => ({
    from: params.get("from"), to: params.get("to"),
    compare: params.get("compare") ?? "none",
    filters: Object.fromEntries(["country", "device", "source"].flatMap((k) => (params.get(k) ? [[k, params.get(k)]] : []))),
  }), [params]);
}

function useMetric(metric, { granularity = "day" } = {}) {
  const report = useReportParams();
  return useQuery({
    queryKey: ["metric", metric, granularity, report],
    queryFn: ({ signal }) => api(\`/analytics/query\`, { method: "POST", signal, body: { metric, granularity, ...report, maxPoints: 400 } }),
    staleTime: 60_000,
    placeholderData: keepPreviousData, // keep old chart visible while new filters load
  });
}

export function TrafficReport() {
  return (
    <DashboardGrid>
      <ErrorBoundary fallback={<WidgetError />}><KpiTile metric="visitors" /></ErrorBoundary>
      <ErrorBoundary fallback={<WidgetError />}><KpiTile metric="bounce_rate" /></ErrorBoundary>
      <ErrorBoundary fallback={<WidgetError />}><TimeSeriesChart metric="visitors" /></ErrorBoundary>   {/* canvas for >1k points */}
      <ErrorBoundary fallback={<WidgetError />}><BreakdownTable dimension="page" /></ErrorBoundary>    {/* virtualised rows */}
      <LazyWhenVisible><GeoMap metric="visitors" /></LazyWhenVisible>
    </DashboardGrid>
  );
}`,
    walkthrough:
      "The URL describes the whole report, so sharing a link reproduces the exact view. Each widget builds its own query from that state; widgets that ask the same question share one request through the query cache. Changing a filter cancels in-flight queries, keeps old charts visible until new data arrives, and asks the server for at most 400 points per series. Widgets fail independently, and the heavy map only loads when scrolled into view.",
    flow: ["URL holds report state", "Each widget queries aggregates", "Render efficiently and accessibly"],
    mistake:
      "Fetching raw events into the browser and aggregating them in JavaScript. It works with demo data and collapses with real customers' millions of rows.",
    exercise:
      "Users complain that changing the date range makes every chart flash empty. What do you change?",
    answer:
      "Keep previous data visible with a subtle loading indicator while new data loads, debounce rapid range changes, cancel stale requests, and animate between old and new values only if it helps understanding.",
    deepDive: [
      {
        heading: "Real-time visitors widget",
        points: [
          "Subscribe via SSE to a per-site channel that sends an aggregated count every few seconds, not individual events.",
          "Pause the subscription when the tab is hidden.",
          "Render the number with an accessible label and avoid announcing every change.",
        ],
      },
    ],
    animation: {
      title: "Changing a filter",
      nodes: [
        ["filter", "Filter bar", "device=mobile"],
        ["url", "URL", "query params"],
        ["widgets", "Widgets", "derive queries"],
        ["api", "Query API", "pre-aggregated"],
        ["charts", "Charts", "keep old, swap"],
      ],
      steps: [
        ["filter", "url", "update", "Selecting mobile updates the URL, the single source of truth."],
        ["url", "widgets", "derive", "Each widget builds a new query key from the URL state."],
        ["widgets", "api", "parallel", "Queries run in parallel and stale ones are cancelled."],
        ["api", "charts", "≤ 400 points", "Downsampled results arrive; KPIs first, breakdowns later."],
        ["charts", "filter", "no flash", "Old charts stayed visible until the new data swapped in."],
      ],
    },
  }),

  "high-level-design--collaborative-documents": fsd({
    intro:
      "Design the frontend of a collaborative document editor: rich text with headings, lists, tables, and images, real-time co-editing with cursors, comments and suggestions, version history, and offline editing. The defining problem is merging concurrent edits from many people so every copy converges to the same document without losing anyone's work.",
    concepts: [
      "The editor keeps its own document model, such as a tree of nodes in ProseMirror, Lexical, or Slate, rather than trusting contenteditable's DOM. User input becomes transactions on the model, which renders to the DOM.",
      "Concurrency control uses Operational Transformation, where a server transforms concurrent operations against each other, or CRDTs such as Yjs or Automerge, where every character has a unique ID and merges are commutative, enabling peer and offline editing.",
      "Presence such as cursors, selections, and who is viewing is ephemeral and sent separately. Comments anchor to ranges that move with the text. Version history stores snapshots plus updates so users can view and restore past states.",
    ],
    code: `// Yjs + a rich-text editor binding (illustrative wiring)
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

const ydoc = new Y.Doc();
const docId = "doc_42";

// Offline-first: load local state immediately, sync with peers when online
new IndexeddbPersistence(docId, ydoc);
const provider = new WebsocketProvider("wss://collab.example.com", docId, ydoc);

// Shared types: the document body and threaded comments
const body = ydoc.getXmlFragment("body");     // bound to the editor's document model
const comments = ydoc.getMap("comments");      // commentId → { anchor: Y.RelativePosition, thread: [...] }

// Presence: ephemeral awareness state, not stored in the document
provider.awareness.setLocalStateField("user", { name: "Asha", color: "#e11d48" });
provider.awareness.on("change", () => renderRemoteCursors(provider.awareness.getStates()));

// Snapshots for version history every few minutes of activity
ydoc.on("update", throttle(() => saveSnapshot(docId, Y.encodeStateAsUpdate(ydoc)), 5 * 60_000));

// Editor setup (ProseMirror via y-prosemirror, or Lexical's Yjs plugin):
// new EditorView(el, { state: EditorState.create({ schema, plugins: [ySyncPlugin(body), yCursorPlugin(provider.awareness), yUndoPlugin()] }) });`,
    walkthrough:
      "The Yjs document holds the body as a shared XML fragment and comments as a shared map. IndexedDB persistence loads the last local state instantly and keeps edits made offline; the WebSocket provider exchanges compact binary updates with other clients and the server. Awareness carries cursors and names without polluting the document. The editor binding converts editor transactions to Yjs updates and back, and the Yjs undo manager undoes only the local user's changes.",
    flow: ["Edit a document model", "Merge with OT or CRDT", "Sync presence separately"],
    mistake:
      "Sending the whole document HTML on every keystroke and letting the last writer win. Two people typing in different paragraphs overwrite each other's work.",
    exercise:
      "Two users edit the same sentence while one of them is offline for ten minutes. What happens with a CRDT when they reconnect?",
    answer:
      "Both sets of changes are merged automatically and deterministically: insertions from both users appear, ordered by their unique IDs, and deletions apply to the characters they targeted. The text may need human cleanup, but no edit is lost and both clients converge to the same result.",
    deepDive: [
      {
        heading: "Performance for long documents",
        points: [
          "Render only visible pages or blocks for very long documents.",
          "Batch updates and throttle cursor broadcasts.",
          "Garbage-collect CRDT tombstones and compact history on the server.",
          "Lazy-load images and embeds inside the document.",
        ],
      },
    ],
    animation: {
      title: "Concurrent edits converging",
      nodes: [
        ["alice", "Alice", "types 'quick '"],
        ["bob", "Bob", "offline edits"],
        ["server", "Sync server", "relays updates"],
        ["idb", "Bob's IndexedDB", "local updates"],
        ["doc", "Shared doc", "converged"],
      ],
      steps: [
        ["alice", "server", "update", "Alice's insertion is encoded as a small CRDT update and sent."],
        ["bob", "idb", "save", "Bob is offline; his edits are saved locally as updates."],
        ["idb", "server", "reconnect", "When Bob reconnects, his pending updates are exchanged."],
        ["server", "alice", "merge", "Alice applies Bob's updates; ordering by unique IDs is deterministic."],
        ["server", "doc", "converge", "Both clients now hold the identical document with every edit."],
      ],
    },
  }),

  "high-level-design--collaborative-spreadsheets": fsd({
    intro:
      "Design the frontend of a collaborative spreadsheet: a grid of potentially millions of cells, formulas with dependencies, formatting, sorting and filtering, real-time co-editing, and fast scrolling. It combines the virtualisation challenges of huge tables with the computation challenges of a formula engine and the merge challenges of collaboration.",
    concepts: [
      "Virtualise in two dimensions. Only the visible rows and columns are rendered, typically on canvas for speed, with a single overlay input for editing. Row heights and column widths are stored sparsely with prefix sums to map scroll positions to cells quickly.",
      "Formulas form a dependency graph. Parse each formula into an AST, record which cells it reads, and on change recompute only dependents in topological order. Detect cycles and report them. Heavy recalculation runs in a Web Worker.",
      "Collaboration operates on cell-level operations. Concurrent edits to different cells never conflict; edits to the same cell resolve last-writer-wins; structural changes such as inserting rows must transform the coordinates of other users' operations, often using stable row and column IDs instead of indexes.",
    ],
    code: `// Sparse cell storage keyed by stable IDs, not positions
// cells: Map<"rowId:colId", { raw: "=SUM(B1:B3)", value: 42, format }>

// Dependency graph and incremental recalculation (runs in a worker)
const dependents = new Map();   // cellKey → Set of cells that reference it

function setCell(key, raw) {
  const cell = { raw };
  if (raw.startsWith("=")) {
    cell.ast = parseFormula(raw.slice(1));             // e.g. { fn: "SUM", range: ["B1", "B3"] }
    for (const ref of referencedCells(cell.ast)) {
      if (!dependents.has(ref)) dependents.set(ref, new Set());
      dependents.get(ref).add(key);
    }
  }
  cells.set(key, cell);
  recalc(key);
}

function recalc(start) {
  const order = topoSortFrom(start, dependents);      // throws CycleError for =A1 in A1
  for (const key of order) {
    const cell = cells.get(key);
    cell.value = cell.ast ? evaluate(cell.ast, (ref) => cells.get(ref)?.value) : coerce(cell.raw);
  }
  postMessage({ type: "values", changed: order.map((k) => [k, cells.get(k).value]) }); // main thread repaints
}

// Visible window from scroll position using prefix sums of row heights
function visibleRows(scrollTop, viewportHeight, rowOffsets) {
  const first = binarySearch(rowOffsets, scrollTop);
  const last = binarySearch(rowOffsets, scrollTop + viewportHeight);
  return [first, last + 1];
}`,
    walkthrough:
      "Cells are stored sparsely, so an empty million-row sheet costs nothing. Setting a cell parses its formula, records its dependencies, and recalculates only the cells affected, in dependency order, inside a worker so typing stays smooth. Only changed values are sent back to the main thread, which repaints the visible window computed with a binary search over row offsets.",
    flow: ["Virtualise rows and columns", "Recalculate the dependency graph", "Merge cell-level ops"],
    mistake:
      "Rendering every cell as a DOM element and recalculating every formula after any edit. Both scale with sheet size, not with what changed, and freeze the browser on real-world spreadsheets.",
    exercise:
      "User A inserts a row above row 5 while user B edits cell C10. How do you make sure B's edit lands in the right cell?",
    answer:
      "Address cells by stable row and column IDs rather than indexes, so B's edit targets the same row ID regardless of A's insertion. If the protocol uses indexes, the server transforms B's operation by shifting its row from 10 to 11 because an insert happened above it.",
    deepDive: [
      {
        heading: "Interaction details",
        points: [
          "A single absolutely positioned input moves over the active cell for editing.",
          "Selection ranges, copy and paste with TSV and HTML formats, and fill handles.",
          "Keyboard navigation like desktop spreadsheets: arrows, Tab, Enter, Ctrl+arrows to jump to edges.",
          "Accessible grid semantics via role=grid on a DOM layer for the visible region.",
        ],
      },
    ],
    animation: {
      title: "Editing a cell with dependents",
      nodes: [
        ["input", "Cell B2", "typed 50"],
        ["worker", "Calc worker", "dependency graph"],
        ["deps", "Dependents", "B4, D1"],
        ["main", "Main thread", "repaint window"],
        ["peers", "Collaborators", "cell op"],
      ],
      steps: [
        ["input", "worker", "setCell", "The new value for B2 is sent to the calculation worker."],
        ["worker", "deps", "topo order", "Only B4 = SUM(B1:B3) and D1 = B4 * 2 are recalculated, in order."],
        ["deps", "main", "changed values", "The worker posts just the changed values back."],
        ["main", "main", "repaint", "The visible canvas region repaints the three changed cells."],
        ["input", "peers", "broadcast", "The cell operation is broadcast with stable row and column IDs."],
      ],
    },
  }),

  "high-level-design--microfrontends": fsd({
    intro:
      "Microfrontends split a large frontend into independently built and deployed applications owned by different teams, composed into one user experience. They solve organisational scaling problems such as release coordination and ownership, and they introduce technical costs: duplicated dependencies, consistency, shared state, and performance. Use them deliberately.",
    concepts: [
      "Composition can happen at build time (packages), on the server or edge (assembling HTML fragments), or at runtime in the browser (Module Federation, import maps, or web components). Runtime composition gives independent deploys at the cost of runtime coordination.",
      "Split by business domain and route, such as search, product, checkout, and account, so most user journeys stay within one microfrontend. A thin shell handles routing, authentication, layout, and loading remotes.",
      "Keep shared surface small and explicit: a design system package, shared singletons such as React negotiated by version, communication through URLs, custom events, or a tiny event bus, and contracts tested in CI.",
    ],
    code: `// Shell (host) with Module Federation (webpack/rspack/vite plugin style config)
// federation.config.js
export default {
  name: "shell",
  remotes: {
    catalog: "catalog@https://cdn.shop.example/catalog/remoteEntry.js",
    checkout: "checkout@https://cdn.shop.example/checkout/remoteEntry.js",
  },
  shared: {
    react: { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
    "@shop/design-system": { singleton: true },
  },
};

// Shell routes lazily load each team's remote, isolated by error boundaries
const Catalog = lazy(() => import("catalog/App"));
const Checkout = lazy(() => import("checkout/App"));

<Routes>
  <Route path="/c/*" element={<Remote name="catalog"><Catalog /></Remote>} />
  <Route path="/checkout/*" element={<Remote name="checkout"><Checkout /></Remote>} />
</Routes>

// Cross-app communication through a minimal, typed event contract
// catalog: window.dispatchEvent(new CustomEvent("cart:item-added", { detail: { sku, qty } }));
// shell:   window.addEventListener("cart:item-added", (e) => cartBadge.increment(e.detail.qty));`,
    walkthrough:
      "The shell declares where each remote's entry file lives and shares React and the design system as singletons, so users download them once. Each route lazily loads a team's app inside an error boundary, so a broken checkout deploy cannot blank the catalog. Teams deploy remotes independently by publishing new remoteEntry files. Cross-app communication is a small set of documented events rather than shared global state.",
    flow: ["Split by domain", "Compose in a shell", "Share minimally, contract explicitly"],
    mistake:
      "Adopting microfrontends for a single team's app to look modern. You pay the full complexity, including version negotiation, duplicated bundles, and integration testing, without the organisational benefit.",
    exercise:
      "Two microfrontends accidentally ship different major versions of React and the page breaks. How do you prevent it?",
    answer:
      "Declare React as a shared singleton with a required version range, fail the remote's build or startup when its range is incompatible with the shell's, align upgrades through a platform team, and run integration tests of the composed app before deploying a remote.",
    deepDive: [
      {
        heading: "When microfrontends are worth it",
        points: [
          "Many teams (often 5 or more) blocked by a shared release train.",
          "Clear domain boundaries where journeys rarely cross apps.",
          "Need for incremental migration from a legacy framework.",
          "Strong platform team to own the shell, design system, and tooling.",
        ],
      },
    ],
    animation: {
      title: "Composing remotes at runtime",
      nodes: [
        ["user", "User", "/checkout"],
        ["shell", "Shell", "routing + auth"],
        ["shared", "Shared deps", "React, DS"],
        ["remote", "Checkout remote", "team B"],
        ["events", "Event contract", "cart events"],
      ],
      steps: [
        ["user", "shell", "navigate", "The user navigates to checkout; the shell matches the route."],
        ["shell", "shared", "singleton", "React and the design system are already loaded and shared."],
        ["shell", "remote", "load entry", "The checkout team's latest remoteEntry is fetched and mounted."],
        ["remote", "events", "order placed", "Checkout emits a documented event when the order is placed."],
        ["events", "shell", "update badge", "The shell listens and resets the cart badge without coupling to checkout code."],
      ],
    },
  }),

  "high-level-design--kanban-board": fsd({
    intro:
      "Design the frontend of a Kanban board like a project tracker: columns of cards, drag and drop between and within columns, card details, filters, swimlanes, and real-time updates when teammates move cards. The core problems are accessible drag and drop, ordering that survives concurrent moves, and keeping large boards smooth.",
    concepts: [
      "Normalize cards and columns. Columns hold ordered card IDs; cards hold data. Order is stored as a fractional index or rank string per card, so a move updates one card instead of renumbering a whole column.",
      "Drag and drop must work with mouse, touch, and keyboard. Libraries such as dnd-kit provide sensors and announcements; keyboard users pick up a card with Space, move with arrows, and drop with Space, with live announcements of position.",
      "Moves are optimistic with server reconciliation and real-time broadcast. Conflicting concurrent moves resolve deterministically by rank and version, and WIP limits or permissions are validated server side.",
    ],
    code: `// Fractional ranks: insert between two cards without renumbering
import { generateKeyBetween } from "fractional-indexing";

export function moveCard(board, cardId, toColumnId, toIndex) {
  const from = board.columns[board.cards[cardId].columnId];
  const to = board.columns[toColumnId];
  const target = to.cardIds.filter((id) => id !== cardId);
  const before = target[toIndex - 1] ? board.cards[target[toIndex - 1]].rank : null;
  const after = target[toIndex] ? board.cards[target[toIndex]].rank : null;
  const rank = generateKeyBetween(before, after);          // e.g. between "a0" and "a1" → "a0V"

  // Optimistic local update
  from.cardIds = from.cardIds.filter((id) => id !== cardId);
  target.splice(toIndex, 0, cardId);
  to.cardIds = target;
  board.cards[cardId] = { ...board.cards[cardId], columnId: toColumnId, rank, pending: true };

  return api(\`/cards/\${cardId}/move\`, { method: "POST", body: { columnId: toColumnId, rank, version: board.cards[cardId].version } })
    .then((saved) => { board.cards[cardId] = { ...saved, pending: false }; })
    .catch(() => rollback(board, cardId)); // e.g. WIP limit exceeded or permission denied
}

// Accessible drag and drop announcements (dnd-kit style)
const announcements = {
  onDragStart: ({ active }) => \`Picked up \${title(active.id)}.\`,
  onDragOver: ({ over }) => (over ? \`Over \${describe(over.id)}.\` : "Not over a column."),
  onDragEnd: ({ active, over }) => (over ? \`Dropped \${title(active.id)} in \${describe(over.id)}.\` : "Move cancelled."),
};`,
    walkthrough:
      "Each card has a sortable rank string. Moving a card computes a new rank between its new neighbours, so only that card changes on the server and concurrent moves elsewhere in the column do not conflict. The UI updates optimistically and rolls back if the server rejects the move. The announcements give screen reader users the same feedback sighted users get from watching the card move.",
    flow: ["Normalize and rank cards", "Drag with any input", "Reconcile and broadcast moves"],
    mistake:
      "Storing card order as integer positions and renumbering the whole column on every move. Concurrent moves by two people produce duplicates and lost updates, and every move writes many rows.",
    exercise:
      "A board has 40 columns and 5,000 cards. What do you do to keep scrolling and dragging smooth?",
    answer:
      "Virtualise cards within each column and columns horizontally, render lightweight card previews, keep drag overlays in a portal so only the dragged element moves, memoize columns so a move re-renders only the source and target, and paginate archived cards.",
    deepDive: [
      {
        heading: "Real-time collaboration",
        points: [
          "Broadcast card.moved events with rank and version; clients apply them if newer.",
          "Show who is viewing or dragging a card with presence indicators.",
          "If a remote move targets a card you are dragging, finish your drag, then reconcile by version.",
        ],
      },
    ],
    animation: {
      title: "Moving a card",
      nodes: [
        ["drag", "Drag start", "mouse or Space"],
        ["rank", "Rank calc", "between a0, a1"],
        ["local", "Local board", "optimistic"],
        ["api", "Server", "validate + save"],
        ["peers", "Teammates", "card.moved"],
      ],
      steps: [
        ["drag", "rank", "drop", "The card is dropped between two cards in the Doing column."],
        ["rank", "local", "a0V", "A new rank between its neighbours is computed; no other card changes."],
        ["local", "api", "POST move", "The board updates instantly while the move is sent with a version."],
        ["api", "peers", "broadcast", "The server checks WIP limits, saves, and broadcasts the move."],
        ["peers", "local", "converge", "Teammates' boards apply the move, so everyone sees the same order."],
      ],
    },
  }),
};
