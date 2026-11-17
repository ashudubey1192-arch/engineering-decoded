// Web performance lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const performanceLessons = {
  "performance--performance-overview": fsd({
    intro:
      "Web performance is how quickly users can see, use, and trust what they asked for. It is measured with user-centred metrics, shaped by network, rendering, and JavaScript costs, and improved by reducing work, doing work earlier or later, and doing it closer to the user. This module moves from why it matters to how to measure and how to fix.",
    concepts: [
      "Core Web Vitals summarize experience: Largest Contentful Paint for loading (good under 2.5 s), Interaction to Next Paint for responsiveness (good under 200 ms), and Cumulative Layout Shift for visual stability (good under 0.1), each judged at the 75th percentile of real users.",
      "Costs fall into buckets: bytes over the network, requests on the critical path, main-thread work for parsing and executing JavaScript, and rendering work for style, layout, and paint. Each optimization targets one bucket.",
      "Performance is a continuous practice. Set budgets, measure in the lab and in the field, attribute regressions to changes, and give it an owner, because every new feature adds weight by default.",
    ],
    code: `// Field measurement with the web-vitals library, sent to your analytics endpoint
import { onCLS, onINP, onLCP, onTTFB } from "web-vitals/attribution";

function send(metric) {
  const body = JSON.stringify({
    name: metric.name,                 // "LCP", "INP", "CLS", "TTFB"
    value: Math.round(metric.value * 1000) / 1000,
    rating: metric.rating,             // "good" | "needs-improvement" | "poor"
    page: location.pathname,
    element: metric.attribution?.target || metric.attribution?.element, // what caused it
  });
  navigator.sendBeacon?.("/rum", body) || fetch("/rum", { method: "POST", body, keepalive: true });
}

onLCP(send);
onINP(send);
onCLS(send);
onTTFB(send);`,
    walkthrough:
      "The attribution build reports not just the metric but its cause, such as which element was the LCP or which element the slow interaction targeted. sendBeacon delivers data even as the page unloads. Aggregated per route at the 75th percentile, this tells you which pages fail which vital and why, which is where every later lesson in this module starts.",
    flow: ["Measure user metrics", "Attribute to causes", "Fix and guard with budgets"],
    mistake:
      "Optimizing whatever a tool lists first without checking whether it affects a metric users feel. Shaving 5 KB off a lazily loaded settings page matters less than one render-blocking font on the homepage.",
    exercise:
      "A product page has good LCP but poor INP. Which buckets of cost would you investigate?",
    answer:
      "Main-thread JavaScript work during interactions: heavy event handlers, large re-renders, synchronous layout reads, and third-party scripts running long tasks. Network bytes matter less, because the page already loaded quickly.",
    deepDive: [
      {
        heading: "The module map",
        points: [
          "Why performance matters: business and user impact.",
          "Monitoring and tools: measuring in field and lab.",
          "Network and asset optimization: fewer, smaller, closer bytes.",
          "Rendering patterns: where and when HTML is produced.",
          "Build optimization and JavaScript and React optimization: less work on the main thread.",
        ],
      },
    ],
    animation: {
      title: "The performance loop",
      nodes: [
        ["users", "Real users", "devices vary"],
        ["rum", "RUM data", "p75 vitals"],
        ["diagnose", "Diagnose", "attribution"],
        ["fix", "Optimize", "code + infra"],
        ["budget", "Budgets", "CI guard"],
      ],
      steps: [
        ["users", "rum", "beacons", "Every visit reports LCP, INP, CLS, and TTFB with attribution."],
        ["rum", "diagnose", "p75", "The product page fails INP at the 75th percentile on mobile."],
        ["diagnose", "fix", "long task", "Attribution points at a filter handler that re-renders 2,000 rows."],
        ["fix", "budget", "guard", "After the fix, a budget stops the regression from returning."],
        ["budget", "users", "faster", "Users feel the improvement, and the loop continues with the next issue."],
      ],
    },
  }),

  "performance--why-performance-matters": fsd({
    intro:
      "Speed is a feature users notice even when they cannot name it. Slow pages lose visitors before they see anything, frustrate users mid-task, and cost more to serve. For many people on mid-range phones and patchy networks, performance is the difference between an app that works and one that does not.",
    concepts: [
      "Abandonment rises sharply with load time, especially on mobile. Case studies across retailers and publishers consistently tie faster LCP and interactions to higher conversion, longer sessions, and lower bounce rates.",
      "Performance is inequality in disguise. A bundle that parses in 200 ms on a flagship phone can take over a second on a budget device, so the slowest users, often in growing markets, feel every extra kilobyte.",
      "Search ranking uses Core Web Vitals as a signal, and infrastructure costs track bytes and compute. Lighter pages are cheaper to serve and easier to scale during traffic spikes.",
    ],
    code: `// Estimating the cost of JavaScript on a budget device: a back-of-envelope model
const bundleKB = 600;          // compressed JS shipped on first load
const compressionRatio = 3.5;  // typical gzip/brotli ratio for JS
const parseCompileMsPerKB = {  // rough uncompressed cost per KB on each device
  flagship: 0.25,
  midRange: 0.8,
  budget: 2.0,
};

const uncompressedKB = bundleKB * compressionRatio;
for (const [device, cost] of Object.entries(parseCompileMsPerKB)) {
  console.log(device, Math.round(uncompressedKB * cost), "ms before your code even runs");
}
// flagship ≈ 525 ms, midRange ≈ 1680 ms, budget ≈ 4200 ms`,
    walkthrough:
      "The numbers are illustrative but the shape is real: compressed size drives download time, while uncompressed size drives parse and compile time on the CPU. The same 600 KB bundle costs roughly eight times longer on a budget phone than on a flagship. That is why performance work focuses on shipping less JavaScript, not just compressing it better.",
    flow: ["Users wait or leave", "Slow devices suffer most", "Business metrics move"],
    mistake:
      "Testing only on developer machines and fibre connections. The team never experiences the problem, so it never gets prioritised.",
    exercise:
      "How would you make the case for a two-week performance project to a product manager?",
    answer:
      "Show field data for key pages, segment conversion or engagement by speed bucket from your own analytics, estimate the users currently in the poor bucket, and propose specific fixes with expected metric gains and a budget to keep them.",
    deepDive: [
      {
        heading: "Perceived performance",
        points: [
          "Show meaningful content early, even if the rest is still loading.",
          "Respond to input within 100 ms with visual feedback, even if the work continues.",
          "Avoid layout jumps; stability feels faster than raw speed.",
          "Skeletons and optimistic updates reduce perceived waiting when real waiting cannot be removed.",
        ],
      },
    ],
    animation: {
      title: "The same page on three devices",
      nodes: [
        ["bundle", "600 KB JS", "compressed"],
        ["flagship", "Flagship", "~0.5 s CPU"],
        ["mid", "Mid-range", "~1.7 s CPU"],
        ["budget", "Budget phone", "~4.2 s CPU"],
        ["outcome", "Outcome", "bounce risk"],
      ],
      steps: [
        ["bundle", "flagship", "parse", "On a flagship phone, parsing and compiling feels nearly instant."],
        ["bundle", "mid", "parse", "On a mid-range phone the same work takes more than three times longer."],
        ["bundle", "budget", "parse", "On a budget phone the main thread is blocked for seconds."],
        ["budget", "outcome", "leave", "Users on the slowest devices are the most likely to abandon."],
      ],
    },
  }),

  "performance--performance-monitoring": fsd({
    intro:
      "Monitoring tells you how fast the app is for real users right now, where it is slow, and whether the last deploy made it worse. It combines real-user monitoring from browsers with synthetic checks from fixed locations, segmented by page, device, country, and release so that averages do not hide the people having a bad time.",
    concepts: [
      "Real-user monitoring (RUM) collects metrics from actual visits using browser APIs such as PerformanceObserver. It captures the real mix of devices, networks, and content, but it is noisy and needs enough traffic per segment.",
      "Synthetic monitoring runs scripted loads on a schedule from known locations and devices. It is consistent and works on low-traffic pages, making it good for alerting on sudden regressions and for third-party outages.",
      "Report percentiles, not averages. The 75th percentile is the Core Web Vitals threshold; the 95th shows the tail. Tag every beacon with the release version so a regression can be tied to a deploy.",
    ],
    code: `// Lightweight RUM with PerformanceObserver: long tasks and resource timing
const release = document.documentElement.dataset.release; // e.g. "2026.11.18-3"

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) {
      queue({ type: "long-task", duration: Math.round(entry.duration), release, page: location.pathname });
    }
  }
}).observe({ type: "longtask", buffered: true });

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.initiatorType === "script" && entry.duration > 1000) {
      queue({ type: "slow-script", url: entry.name, ms: Math.round(entry.duration), release });
    }
  }
}).observe({ type: "resource", buffered: true });

const batch = [];
function queue(event) { batch.push(event); }
addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && batch.length) {
    navigator.sendBeacon("/rum/batch", JSON.stringify(batch.splice(0)));
  }
});`,
    walkthrough:
      "Two observers watch for main-thread tasks longer than 100 ms and scripts that took over a second to load, including entries that happened before the observer started thanks to buffered: true. Events are batched and flushed when the page becomes hidden, which is the most reliable moment to send data on mobile. Every event carries the release tag for deploy correlation.",
    flow: ["Collect from real users", "Segment by page/device/release", "Alert on percentile shifts"],
    mistake:
      "Sending a beacon for every event immediately. On busy pages this adds dozens of requests competing with your own content; batch and flush on visibility change instead.",
    exercise:
      "After a release, median LCP is unchanged but p95 LCP doubled. What would you segment by first?",
    answer:
      "Device class and connection type, then country and page. A change that only hurts slow devices or one region, such as a larger hero image or a new third-party script blocked in one market, shows up in the tail first.",
    deepDive: [
      {
        heading: "Dashboards that people actually use",
        points: [
          "One chart per vital per key page, at p75, split by mobile and desktop.",
          "Release markers on the time axis.",
          "A table of top LCP elements and top INP targets, from attribution data.",
          "Alerts on sustained shifts, not single noisy data points.",
        ],
      },
    ],
    animation: {
      title: "From beacon to alert",
      nodes: [
        ["browser", "Browsers", "observers"],
        ["collector", "Collector", "/rum"],
        ["store", "Metrics store", "by release"],
        ["dashboard", "Dashboard", "p75 / p95"],
        ["alert", "Alert", "on-call"],
      ],
      steps: [
        ["browser", "collector", "beacon", "Each page sends a batched beacon when it becomes hidden."],
        ["collector", "store", "aggregate", "Events are aggregated by page, device, country, and release."],
        ["store", "dashboard", "percentiles", "Dashboards plot p75 and p95 with release markers."],
        ["dashboard", "alert", "regression", "p95 LCP doubles after release 3, triggering an alert."],
        ["alert", "browser", "rollback", "The team rolls back and confirms the tail recovers in fresh data."],
      ],
    },
  }),

  "performance--performance-tools": fsd({
    intro:
      "Performance tools fall into three groups: browser devtools for deep investigation of one page load or interaction, lab auditors that score a page against best practices, and field data sources that report what real users experience. Knowing which tool answers which question saves hours of guesswork.",
    concepts: [
      "Chrome DevTools Performance panel records a timeline of network, main thread, rendering, and frames. Flame charts show exactly which functions run during a long task, and the Insights sidebar points out LCP phases, layout shifts, and render-blocking requests.",
      "Lighthouse and WebPageTest run controlled lab loads. Lighthouse is built into Chrome and CI-friendly; WebPageTest offers real devices, many locations, filmstrips, and request waterfalls ideal for comparing before and after.",
      "Field sources include the Chrome User Experience Report and PageSpeed Insights for public origins, plus your own RUM. Bundle analyzers such as rollup-plugin-visualizer or source-map-explorer show what is inside your JavaScript.",
    ],
    code: `# A practical investigation sequence for a slow product page

# 1. Field reality: is the page actually slow for users? (PageSpeed Insights / CrUX / RUM)
#    → p75 LCP 3.8 s on mobile, LCP element = hero <img>

# 2. Lab reproduction with throttling
npx lighthouse https://staging.shop.example/products/p_demo0001 \\
  --preset=perf --form-factor=mobile --throttling-method=simulate --view

# 3. Waterfall: when does the hero image start downloading?
#    DevTools → Network → filter "img" → hero starts at 2.1 s (discovered late via CSS)

# 4. Main thread: what blocks before it?
#    DevTools → Performance → record reload → 700 ms long task: hydrating a carousel

# 5. Bundle contents: why is the carousel so heavy?
npx vite-bundle-visualizer      # or: npx source-map-explorer dist/assets/*.js`,
    walkthrough:
      "The sequence goes from field to lab to specific evidence. Field data confirms users are affected and names the LCP element. Lighthouse reproduces it under mobile throttling. The network waterfall shows the hero image was discovered late because it was a CSS background, and the performance trace shows a heavy carousel hydrating first. The bundle visualizer then explains why that carousel is so costly.",
    flow: ["Confirm in field data", "Reproduce in the lab", "Trace to the cause"],
    mistake:
      "Chasing a Lighthouse score of 100. The score is a weighted lab summary; a page can score 100 and still be slow for real users, or score 80 and feel great. Use it as a guide, not a goal.",
    exercise:
      "Which tool would you open first to find why typing in a search box feels laggy?",
    answer:
      "The DevTools Performance panel. Record while typing, then look for long tasks in the main-thread flame chart during each keystroke to see which handlers, renders, or layouts are taking the time.",
    deepDive: [
      {
        heading: "Devtools features worth knowing",
        points: [
          "CPU and network throttling to approximate mobile devices.",
          "Coverage panel to find unused JavaScript and CSS on a page.",
          "Rendering tab: paint flashing and layout shift regions.",
          "React DevTools Profiler to see which components re-render and why.",
        ],
      },
    ],
    animation: {
      title: "Investigating a slow page",
      nodes: [
        ["field", "Field data", "p75 LCP 3.8 s"],
        ["lab", "Lighthouse", "reproduces"],
        ["waterfall", "Network", "late hero"],
        ["trace", "Perf trace", "long task"],
        ["bundle", "Bundle map", "carousel lib"],
      ],
      steps: [
        ["field", "lab", "confirm", "Real users are slow on mobile; the LCP element is the hero image."],
        ["lab", "waterfall", "reproduce", "A throttled lab run shows the same slow LCP."],
        ["waterfall", "trace", "late fetch", "The hero image is discovered late because it lives in CSS."],
        ["trace", "bundle", "700 ms", "A long hydration task for the carousel blocks the main thread first."],
        ["bundle", "field", "fix + verify", "Splitting the carousel and preloading the hero fixes it in field data."],
      ],
    },
  }),

  "performance--network-optimization": fsd({
    intro:
      "Network optimization means sending fewer bytes, in fewer round trips, from closer to the user, in the right order. The critical rendering path should contain only what the first view needs; everything else should be deferred, compressed, cached, and prioritised so the browser spends its limited connections and bandwidth on what users see first.",
    concepts: [
      "Reduce round trips: serve from a CDN, use HTTP/2 or HTTP/3, preconnect to required third-party origins, and avoid request chains where one file must load before the next is discovered.",
      "Prioritise: preload critical late-discovered resources such as the LCP image or main font, mark the LCP image fetchpriority=high, defer non-critical scripts, and lazy-load below-the-fold images and iframes.",
      "Shrink and cache: Brotli or gzip for text, modern image formats, long-lived immutable caching for hashed assets, and API responses that return only the fields a view needs.",
    ],
    code: `<head>
  <!-- 1. Warm connections to origins needed in the first second -->
  <link rel="preconnect" href="https://images.cdn.example" crossorigin>

  <!-- 2. Discover critical resources early -->
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="image" href="https://images.cdn.example/hero-800.avif"
        imagesrcset="https://images.cdn.example/hero-800.avif 800w, https://images.cdn.example/hero-1600.avif 1600w"
        imagesizes="100vw" fetchpriority="high">

  <!-- 3. Inline only the critical CSS; load the rest without blocking -->
  <style>/* above-the-fold layout, ~10 KB */</style>
  <link rel="stylesheet" href="/assets/app.3f9a1.css" media="print" onload="this.media='all'">

  <!-- 4. Scripts never block parsing -->
  <script type="module" src="/assets/main.8c2e4.js"></script>
  <script src="https://analytics.example/a.js" defer></script>
</head>
<body>
  <img src="https://images.cdn.example/hero-800.avif" fetchpriority="high" alt="Winter jackets" width="1600" height="900">
  <img src="/products/thumb-1.avif" loading="lazy" decoding="async" alt="Red jacket" width="320" height="320">
</body>`,
    walkthrough:
      "The head is ordered by urgency. The image CDN connection opens immediately, the font and hero image are fetched before CSS or JS would have discovered them, critical CSS renders the first view without waiting for the full stylesheet, and scripts are module or deferred so they never block parsing. Below-the-fold thumbnails load lazily, and explicit width and height prevent layout shifts.",
    flow: ["Fewer round trips", "Right priority order", "Smaller cached bytes"],
    mistake:
      "Preloading everything. Each preload competes for bandwidth with the truly critical resource, and unused preloads waste bytes. Preload only what is late-discovered and needed for the first view.",
    exercise:
      "The LCP image starts downloading at 1.8 s because it is set by JavaScript after hydration. Give two fixes.",
    answer:
      "Render the image in the server HTML as a real img with fetchpriority=high so the preload scanner finds it immediately, or add a preload link for it in the head. Avoid making the LCP element depend on client JavaScript.",
    deepDive: [
      {
        heading: "API payload optimization",
        points: [
          "Return only fields the view needs, or use GraphQL field selection.",
          "Paginate long lists and stream large responses.",
          "Compress JSON responses; use 103 Early Hints to start fetching assets while the server thinks.",
          "Batch chatty requests or move aggregation into a backend-for-frontend.",
        ],
      },
    ],
    animation: {
      title: "Reordering the critical path",
      nodes: [
        ["html", "HTML", "head parsed"],
        ["preconnect", "Preconnect", "image CDN"],
        ["preload", "Preload", "hero + font"],
        ["css", "Critical CSS", "inline"],
        ["paint", "First view", "LCP"],
      ],
      steps: [
        ["html", "preconnect", "early", "Parsing the head opens a connection to the image CDN right away."],
        ["html", "preload", "fetch", "The hero image and font start downloading before CSS or JS could find them."],
        ["html", "css", "inline", "Inline critical CSS lets the first view render without a stylesheet round trip."],
        ["preload", "paint", "LCP", "The hero is already downloaded when layout needs it, so LCP lands early."],
        ["css", "paint", "stable", "Reserved image dimensions keep the layout from shifting as images arrive."],
      ],
    },
  }),

  "performance--asset-optimization": fsd({
    intro:
      "Images, fonts, video, and icons usually make up most of a page's bytes. Optimizing them means picking the right format, serving the right size for each device, loading them at the right moment, and reserving their space so nothing jumps. These changes are often the largest and safest wins in a performance project.",
    concepts: [
      "Formats: AVIF and WebP compress photos far better than JPEG; SVG suits icons and logos; video is better than GIF for animation. Serve modern formats with fallbacks through picture or content negotiation at the CDN.",
      "Responsive images use srcset and sizes so a phone downloads a 400-pixel image while a desktop gets 1600 pixels. An image CDN can generate sizes and formats on the fly from one original.",
      "Fonts: self-host WOFF2, subset to the characters you use, use font-display: swap or optional, preload the main face, and match fallback metrics with size-adjust so swapping does not shift layout.",
    ],
    code: `<!-- Responsive, modern-format product image with reserved space -->
<picture>
  <source type="image/avif"
          srcset="/img/jacket-400.avif 400w, /img/jacket-800.avif 800w, /img/jacket-1200.avif 1200w"
          sizes="(min-width: 1024px) 33vw, 100vw">
  <source type="image/webp"
          srcset="/img/jacket-400.webp 400w, /img/jacket-800.webp 800w, /img/jacket-1200.webp 1200w"
          sizes="(min-width: 1024px) 33vw, 100vw">
  <img src="/img/jacket-800.jpg" alt="Red insulated jacket" width="1200" height="1500"
       loading="lazy" decoding="async">
</picture>

<style>
  /* Fonts: swap quickly and match fallback metrics to avoid layout shift */
  @font-face {
    font-family: "Inter";
    src: url("/fonts/inter-latin-var.woff2") format("woff2");
    font-display: swap;
    unicode-range: U+0000-00FF;
  }
  @font-face {
    font-family: "Inter Fallback";
    src: local("Arial");
    size-adjust: 107%;
    ascent-override: 90%;
  }
  body { font-family: "Inter", "Inter Fallback", system-ui, sans-serif; }
</style>`,
    walkthrough:
      "The browser picks AVIF if supported, otherwise WebP, otherwise JPEG, and chooses the smallest width that fills a third of the viewport on desktop or the full width on mobile. Width and height give the aspect ratio so space is reserved before download. The font is a Latin subset in WOFF2, swaps in quickly, and the fallback is tuned so text barely moves when Inter arrives.",
    flow: ["Pick the right format", "Serve the right size", "Reserve space, load lazily"],
    mistake:
      "Lazy-loading the hero image. loading=\"lazy\" on the LCP element delays it until layout confirms it is in the viewport, which makes LCP worse. Lazy-load only below-the-fold images.",
    exercise:
      "A 2400 × 1600 JPEG of 900 KB is shown at 360 pixels wide on phones. Estimate the saving from proper sizing and AVIF.",
    answer:
      "Serving a 720-pixel image for 2× screens cuts pixels by roughly ten times, and AVIF typically halves the size again compared to a good JPEG. A 900 KB image could become around 40 to 60 KB, a saving of over 90%.",
    deepDive: [
      {
        heading: "Icons and video",
        points: [
          "Use an SVG sprite or inline SVG components instead of icon fonts, which block text and hurt accessibility.",
          "Replace GIFs with muted, autoplaying, looping MP4 or WebM video; they are often ten times smaller.",
          "For hero videos, use a poster image as the LCP candidate and preload=none until needed.",
        ],
      },
    ],
    animation: {
      title: "Choosing an image for a phone",
      nodes: [
        ["html", "picture", "sources"],
        ["browser", "Browser", "360px @2x"],
        ["cdn", "Image CDN", "resize + encode"],
        ["layout", "Layout", "space reserved"],
      ],
      steps: [
        ["html", "browser", "srcset", "The picture element lists AVIF and WebP sources at several widths."],
        ["browser", "cdn", "800w AVIF", "The browser supports AVIF and needs about 720 pixels, so it picks the 800w file."],
        ["cdn", "browser", "48 KB", "The CDN returns a 48 KB file instead of a 900 KB original."],
        ["html", "layout", "aspect", "Width and height reserve space, so nothing shifts while it downloads."],
      ],
    },
  }),

  "performance--rendering-patterns": fsd({
    intro:
      "A rendering pattern decides where and when HTML is produced: in the browser, on a server per request, at build time, at the edge, or progressively in streamed pieces. Each pattern trades time to first content, interactivity cost, freshness, and infrastructure. Large apps mix them per route.",
    concepts: [
      "Client-side rendering ships an empty shell and builds the page with JavaScript. It is simple to host and great for app-like dashboards behind sign-in, but first content waits for JavaScript to download and run.",
      "Server-side rendering produces HTML per request, so content appears early and is crawlable, then hydration attaches interactivity. Static site generation does this once at build time; incremental static regeneration refreshes static pages in the background.",
      "Streaming SSR with Suspense sends the shell immediately and streams slower sections as they resolve. Islands and React Server Components reduce hydration by shipping JavaScript only for interactive parts.",
    ],
    code: `// Next.js App Router: one app, several patterns per route

// app/blog/[slug]/page.jsx: static, regenerated at most hourly
export const revalidate = 3600;
export default async function Post({ params }) {
  const post = await getPost((await params).slug);
  return <Article post={post} />;
}

// app/products/[id]/page.jsx: streamed SSR; reviews arrive later
import { Suspense } from "react";
export default async function Product({ params }) {
  const product = await getProduct((await params).id); // fast, cached
  return (
    <>
      <ProductHero product={product} />           {/* server component, no JS */}
      <AddToCart productId={product.id} />         {/* client island */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={product.id} />         {/* slow query streams in */}
      </Suspense>
    </>
  );
}

// app/dashboard/page.jsx: client-rendered, personal, behind auth
"use client";
export default function Dashboard() { /* fetches after mount with SWR or TanStack Query */ }`,
    walkthrough:
      "Blog posts rarely change, so they are static and regenerated hourly, giving CDN-speed delivery. Product pages render the hero on the server immediately, hydrate only the Add to Cart island, and stream reviews into place when the slower query finishes. The dashboard is private and highly interactive, so client rendering after sign-in is a reasonable choice.",
    flow: ["Classify route freshness", "Pick where HTML is built", "Hydrate only what is interactive"],
    mistake:
      "Server-rendering a page and then fetching the same data again on the client during hydration, doubling the work and causing a flash of loading state. Pass server data into the client or use a framework that serialises it.",
    exercise:
      "Pick a pattern for: a marketing landing page, a stock trading dashboard, and a news article with live comments.",
    answer:
      "Landing page: static generation. Trading dashboard: client rendering after sign-in with real-time streams, perhaps an SSR shell. News article: static or ISR for the article body with a client island or streamed section for live comments.",
    deepDive: [
      {
        heading: "Hydration costs",
        points: [
          "Hydration re-runs components on the client to attach event handlers, which costs as much as client rendering for those components.",
          "Partial and progressive hydration delay or skip it for non-interactive parts.",
          "Resumability, as in Qwik, avoids replaying work by serialising state into the HTML.",
        ],
      },
    ],
    animation: {
      title: "Streaming a product page",
      nodes: [
        ["request", "Request", "/products/42"],
        ["server", "Server", "renders shell"],
        ["browser", "Browser", "paints HTML"],
        ["slow", "Reviews query", "800 ms"],
        ["island", "Cart island", "hydrates"],
      ],
      steps: [
        ["request", "server", "GET", "The request hits a server that renders the product hero immediately."],
        ["server", "browser", "shell", "The shell and hero stream out first with a reviews skeleton."],
        ["browser", "island", "hydrate", "Only the Add to Cart island downloads JavaScript and hydrates."],
        ["slow", "server", "resolved", "The slow reviews query finishes on the server."],
        ["server", "browser", "chunk", "A streamed chunk swaps the skeleton for real reviews."],
      ],
    },
  }),

  "performance--build-optimization": fsd({
    intro:
      "The build turns source code into the files users download. Build optimization makes those files small, split along sensible boundaries, cacheable for a long time, and targeted at the browsers you support. Most of the work is configuration and discipline around imports rather than clever code.",
    concepts: [
      "Minification removes whitespace and shortens names; tree shaking removes unused exports from ES modules; compression shrinks text further over the wire. Together they cut JavaScript size several times over.",
      "Code splitting creates separate chunks per route and for heavy, rarely used features loaded with dynamic import(). Vendor libraries that change rarely can live in their own chunk so app deploys do not invalidate them.",
      "Content-hashed file names such as main.8c2e4.js allow Cache-Control: immutable for a year, because any change produces a new name. Modern-only targets avoid shipping polyfills and transpiled syntax to browsers that do not need them.",
    ],
    code: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ filename: "stats.html", gzipSize: true })],
  build: {
    target: "es2022",          // no legacy transpilation for modern browsers
    sourcemap: "hidden",       // upload to error monitoring, don't expose publicly
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],      // rarely changes: long cache life
          charts: ["chart-lib"],              // only used on the analytics route
        },
      },
    },
  },
});

// Route-level splitting in the app
import { lazy } from "react";
const Analytics = lazy(() => import("./routes/Analytics"));

// Import only what you use, so tree shaking works
import debounce from "lodash-es/debounce"; // not: import _ from "lodash"`,
    walkthrough:
      "Targeting ES2022 skips transpiling modern syntax. Hidden source maps help debugging without shipping them to users. React gets its own long-lived chunk, the charting library is isolated so only the analytics route pays for it, and the lazy route import creates that split at runtime. The visualizer report shows what each chunk contains after every build.",
    flow: ["Remove unused code", "Split by route and feature", "Hash names, cache forever"],
    mistake:
      "Importing an entire utility or icon library through a barrel file, such as import { X } from \"icons\", where the package is not marked side-effect free. The bundler keeps everything, adding hundreds of kilobytes.",
    exercise:
      "Every deploy invalidates a 400 KB vendor chunk even when only app code changed. What is likely wrong?",
    answer:
      "Vendor and app code share a chunk, or the chunk hash depends on module IDs that shift with app changes. Split stable vendor libraries into their own chunk and make sure hashing uses content, so the vendor file name only changes when its contents do.",
    deepDive: [
      {
        heading: "Checks worth automating",
        points: [
          "Bundle size budget per entry and route chunk, failing CI when exceeded.",
          "Duplicate package detection, such as two versions of date libraries.",
          "A report of the largest modules added in each pull request.",
        ],
      },
    ],
    animation: {
      title: "From source to cacheable chunks",
      nodes: [
        ["source", "Source", "modules"],
        ["shake", "Tree shake", "drop unused"],
        ["split", "Split", "route chunks"],
        ["minify", "Minify", "+ hash names"],
        ["cdn", "CDN cache", "immutable"],
      ],
      steps: [
        ["source", "shake", "graph", "The bundler builds the import graph from the entry points."],
        ["shake", "split", "used only", "Unused exports are removed from ES modules."],
        ["split", "minify", "chunks", "Each route and the stable vendor code get their own chunk."],
        ["minify", "cdn", "main.8c2e4.js", "Minified chunks get content-hashed names."],
        ["cdn", "source", "next deploy", "Only changed chunks get new names; the rest stay cached for users."],
      ],
    },
  }),

  "performance--javascript-and-react-optimization": fsd({
    intro:
      "Once the bytes have arrived, JavaScript still has to run on the main thread, which is shared with input handling, layout, and paint. Optimizing JavaScript and React means doing less work per interaction, breaking long tasks into smaller pieces, and avoiding needless re-renders, so the page answers every tap quickly.",
    concepts: [
      "Long tasks over 50 ms block input. Break heavy work into chunks that yield to the browser, move pure computation into a Web Worker, and defer non-urgent work with requestIdleCallback or scheduler.yield where available.",
      "In React, re-renders cascade from state changes. Keep state close to where it is used, split contexts so unrelated consumers do not update, memoize expensive children with memo, and use useMemo and useCallback when profiling shows a benefit. The React Compiler can automate much of this.",
      "Large lists should be virtualized so only visible rows exist in the DOM. Urgent updates such as typing can be separated from expensive ones such as filtering with useDeferredValue or startTransition.",
    ],
    code: `import { memo, useDeferredValue, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // typing stays responsive

  const results = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(deferredQuery.toLowerCase())),
    [products, deferredQuery],
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
      <ResultList items={results} stale={query !== deferredQuery} />
    </>
  );
}

const ResultList = memo(function ResultList({ items, stale }) {
  const parentRef = useRef(null);
  const rows = useVirtualizer({ count: items.length, getScrollElement: () => parentRef.current, estimateSize: () => 56 });
  return (
    <div ref={parentRef} style={{ height: 480, overflow: "auto", opacity: stale ? 0.6 : 1 }}>
      <div style={{ height: rows.getTotalSize(), position: "relative" }}>
        {rows.getVirtualItems().map((row) => (
          <ProductRow key={items[row.index].id} product={items[row.index]} top={row.start} />
        ))}
      </div>
    </div>
  );
});

// Yield during heavy non-React work so input is not blocked
async function processInChunks(items, work) {
  for (let i = 0; i < items.length; i++) {
    work(items[i]);
    if (i % 200 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }
}`,
    walkthrough:
      "The input updates immediately with the urgent query, while filtering uses the deferred value so React can interrupt it if the user keeps typing. The result list is memoized and virtualized: with 10,000 products only about ten rows exist in the DOM. The chunking helper shows the general technique for non-React work: yield every few hundred items so clicks and keystrokes get handled in between.",
    flow: ["Find long tasks", "Reduce or split work", "Render only what is visible"],
    mistake:
      "Wrapping every component in memo and every function in useCallback without profiling. It adds comparison cost and complexity, and often does nothing because a new object prop breaks memoization anyway.",
    exercise:
      "Opening a modal causes the whole product grid behind it to re-render. Where would you look first?",
    answer:
      "Find where the modal's open state lives. If it sits at the page root or in a context the grid consumes, every toggle re-renders the grid. Move the state down next to the modal, or split the context, so the grid is not a consumer of that change.",
    deepDive: [
      {
        heading: "Web Workers for heavy computation",
        code: `// worker.js
self.onmessage = ({ data }) => postMessage(heavySort(data.rows, data.column));

// main thread
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
worker.postMessage({ rows, column: "price" });
worker.onmessage = ({ data }) => setSorted(data); // UI never froze`,
      },
    ],
    animation: {
      title: "Keeping typing responsive",
      nodes: [
        ["key", "Keystroke", "urgent"],
        ["input", "Input", "updates now"],
        ["deferred", "Deferred value", "low priority"],
        ["filter", "Filter + list", "virtualized"],
        ["paint", "Paint", "next frame"],
      ],
      steps: [
        ["key", "input", "setQuery", "Each keystroke updates the input state as an urgent render."],
        ["input", "paint", "fast", "The input repaints within the frame, so typing feels instant."],
        ["input", "deferred", "later", "The deferred query lags behind and schedules the expensive filter."],
        ["deferred", "filter", "interruptible", "If another key arrives, React abandons the stale filter render."],
        ["filter", "paint", "10 rows", "Only visible rows render, so the final update is cheap."],
      ],
    },
  }),
};
