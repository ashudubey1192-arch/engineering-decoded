import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Real-time transport simulator ---------- */
// Events arrive at fixed seconds during a one-minute window. Each strategy is
// simulated to count requests and the average delay before the UI sees an event.
const EVENT_TIMES = [4, 9, 23, 24, 41, 57];

function simulate(strategy, interval) {
  if (strategy === "short") {
    const polls = Math.floor(60 / interval);
    const delays = EVENT_TIMES.map((t) => Math.ceil(t / interval) * interval - t);
    return { requests: polls, empty: polls - new Set(EVENT_TIMES.map((t) => Math.ceil(t / interval))).size, delays };
  }
  if (strategy === "long") {
    // One response per batch of events, plus timeouts every 25 quiet seconds.
    let requests = 1;
    let last = 0;
    for (const t of EVENT_TIMES) {
      requests += Math.floor((t - last) / 25) + 1;
      last = t;
    }
    requests += Math.floor((60 - last) / 25);
    return { requests, empty: requests - EVENT_TIMES.length - 1, delays: EVENT_TIMES.map(() => 0.1) };
  }
  return { requests: 1, empty: 0, delays: EVENT_TIMES.map(() => 0.05) };
}

function TransportLab() {
  const [strategy, setStrategy] = useState("short");
  const [interval, setIntervalValue] = useState(10);
  const result = simulate(strategy, interval);
  const average = result.delays.reduce((sum, d) => sum + d, 0) / result.delays.length;
  return (
    <div className="reactLab">
      <h3>Compare transports over one minute</h3>
      <p>Six server events happen at seconds {EVENT_TIMES.join(", ")}. Pick a strategy and compare.</p>
      <div className="reactLabFields">
        <label>
          Strategy
          <select value={strategy} onChange={(event) => setStrategy(event.target.value)}>
            <option value="short">Short polling</option>
            <option value="long">Long polling (25s hold)</option>
            <option value="push">SSE or WebSocket</option>
          </select>
        </label>
        {strategy === "short" && (
          <label>
            Interval: {interval}s
            <input
              type="range"
              min="1"
              max="30"
              value={interval}
              onChange={(event) => setIntervalValue(Number(event.target.value))}
            />
          </label>
        )}
      </div>
      <ul className="reactLabList">
        <li>
          <span>HTTP requests or connections</span>
          <code>{result.requests}</code>
        </li>
        <li>
          <span>Responses with no news</span>
          <code>{Math.max(0, result.empty)}</code>
        </li>
        <li>
          <span>Average delay before the UI updates</span>
          <code>{average.toFixed(2)}s</code>
        </li>
      </ul>
      <p role="status">
        {strategy === "short"
          ? "Shorter intervals cut delay but multiply wasted requests for every connected user."
          : strategy === "long"
            ? "Long polling answers almost immediately and only wastes a request on each timeout."
            : "One persistent connection delivers every event almost instantly, at the cost of stateful servers."}
      </p>
    </div>
  );
}

/* ---------- XSS: where untrusted text ends up ---------- */
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");

function XssLab() {
  const [input, setInput] = useState('<img src=x onerror="alert(document.cookie)">');
  const dangerous = /<\s*script|on\w+\s*=|javascript:/i.test(input);
  return (
    <div className="reactLab">
      <h3>Trace an untrusted comment</h3>
      <p>Type a comment. Nothing here is executed; the lab shows what each sink would receive.</p>
      <label>
        Comment text
        <input value={input} onChange={(event) => setInput(event.target.value)} />
      </label>
      <pre tabIndex={0} aria-label="innerHTML sink">
        <code>{`element.innerHTML = ${JSON.stringify(input)}\n// parsed as HTML → ${dangerous ? "attacker markup and handlers run" : "markup is interpreted"}`}</code>
      </pre>
      <pre tabIndex={0} aria-label="Escaped output">
        <code>{`element.textContent = ...  // or {comment} in JSX\n// the HTML source becomes: ${escapeHtml(input)}\n// and the reader sees the characters, not markup`}</code>
      </pre>
      <p role="status">
        {dangerous
          ? "This input contains an executable pattern. Text sinks and output encoding keep it inert."
          : "No obvious payload, but the safe sink is still the right default for any user text."}
      </p>
    </div>
  );
}

/* ---------- HTTP cache decision ---------- */
function CacheLab() {
  const [maxAge, setMaxAge] = useState(60);
  const [age, setAge] = useState(30);
  const [noCache, setNoCache] = useState(false);
  const [hasEtag, setHasEtag] = useState(true);
  const [swr, setSwr] = useState(0);
  let outcome;
  if (noCache) outcome = hasEtag ? "Revalidate first: send If-None-Match, expect 304 if unchanged." : "Download again: no-cache without a validator means a full request.";
  else if (age <= maxAge) outcome = "Fresh: served from the browser cache with zero network.";
  else if (age <= maxAge + swr) outcome = "Stale but within stale-while-revalidate: serve instantly, refresh in the background.";
  else outcome = hasEtag ? "Stale: conditional request with If-None-Match; 304 saves the body." : "Stale with no validator: full download.";
  return (
    <div className="reactLab">
      <h3>Will the browser hit the network?</h3>
      <div className="reactLabFields">
        <label>
          max-age: {maxAge}s
          <input type="range" min="0" max="600" step="10" value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} />
        </label>
        <label>
          stale-while-revalidate: {swr}s
          <input type="range" min="0" max="600" step="10" value={swr} onChange={(e) => setSwr(Number(e.target.value))} />
        </label>
        <label>
          Response age: {age}s
          <input type="range" min="0" max="1200" step="10" value={age} onChange={(e) => setAge(Number(e.target.value))} />
        </label>
      </div>
      <div className="reactLabActions">
        <label>
          <input type="checkbox" checked={noCache} onChange={(e) => setNoCache(e.target.checked)} /> no-cache
        </label>
        <label>
          <input type="checkbox" checked={hasEtag} onChange={(e) => setHasEtag(e.target.checked)} /> ETag present
        </label>
      </div>
      <pre tabIndex={0} aria-label="Response headers">
        <code>{`Cache-Control: ${noCache ? "no-cache" : `max-age=${maxAge}${swr ? `, stale-while-revalidate=${swr}` : ""}`}${hasEtag ? '\nETag: "v42"' : ""}\nAge: ${age}`}</code>
      </pre>
      <p role="status">{outcome}</p>
    </div>
  );
}

/* ---------- Color contrast checker ---------- */
function luminance(hex) {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ContrastLab() {
  const [fg, setFg] = useState("#767676");
  const [bg, setBg] = useState("#ffffff");
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  const grade = (min) => (ratio >= min ? "pass" : "fail");
  return (
    <div className="reactLab">
      <h3>Check a text and background pair</h3>
      <div className="reactLabFields">
        <label>
          Text color
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
        </label>
        <label>
          Background
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
        </label>
      </div>
      <div className="reactPreview" style={{ color: fg, background: bg }}>
        <strong>Order #9001 has shipped</strong>
        <p>Small body text needs the most contrast.</p>
      </div>
      <ul className="reactLabList">
        <li><span>Contrast ratio</span><code>{ratio.toFixed(2)}:1</code></li>
        <li><span>AA normal text (4.5:1)</span><code>{grade(4.5)}</code></li>
        <li><span>AA large text and UI parts (3:1)</span><code>{grade(3)}</code></li>
        <li><span>AAA normal text (7:1)</span><code>{grade(7)}</code></li>
      </ul>
    </div>
  );
}

/* ---------- Debounced search ---------- */
function DebounceLab() {
  const [query, setQuery] = useState("");
  const [delay, setDelay] = useState(300);
  const [keystrokes, setKeystrokes] = useState(0);
  const [sent, setSent] = useState([]);
  const cache = useRef(new Map());
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!query.trim()) return undefined;
    const id = window.setTimeout(() => {
      const key = query.trim().toLowerCase();
      if (cache.current.has(key)) setHits((value) => value + 1);
      else {
        cache.current.set(key, true);
        setSent((items) => [...items.slice(-5), key]);
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [query, delay]);

  return (
    <div className="reactLab">
      <h3>Count the requests an autocomplete sends</h3>
      <div className="reactLabFields">
        <label>
          Search products
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setKeystrokes((value) => value + 1);
            }}
          />
        </label>
        <label>
          Debounce: {delay}ms
          <input type="range" min="0" max="800" step="50" value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
        </label>
      </div>
      <ul className="reactLabList">
        <li><span>Keystrokes</span><code>{keystrokes}</code></li>
        <li><span>Requests sent</span><code>{cache.current.size}</code></li>
        <li><span>Answered from cache</span><code>{hits}</code></li>
      </ul>
      <p role="status">{sent.length ? `Recent requests: ${sent.join(" · ")}` : "Type quickly, then retype an earlier term."}</p>
      <button
        type="button"
        onClick={() => {
          cache.current = new Map();
          setQuery("");
          setKeystrokes(0);
          setSent([]);
          setHits(0);
        }}
      >
        Reset
      </button>
    </div>
  );
}

/* ---------- Pagination window ---------- */
function pageWindow(current, total, siblings = 1) {
  const pages = new Set([1, total]);
  for (let p = current - siblings; p <= current + siblings; p++) if (p >= 1 && p <= total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? ["…", p] : [p]));
}

function PaginationLab() {
  const [page, setPage] = useState(6);
  const total = 20;
  const items = useMemo(() => pageWindow(page, total), [page]);
  return (
    <div className="reactLab">
      <h3>Explore a pagination window</h3>
      <nav aria-label="Pagination">
        <div className="reactLabActions">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </button>
          {items.map((item, index) =>
            item === "…" ? (
              <span key={`gap-${index}`} aria-hidden="true">…</span>
            ) : (
              <button key={item} type="button" aria-current={item === page ? "page" : undefined} onClick={() => setPage(item)}>
                {item}
              </button>
            ),
          )}
          <button type="button" onClick={() => setPage((p) => Math.min(total, p + 1))} disabled={page === total}>
            Next
          </button>
        </div>
      </nav>
      <p role="status">
        Page {page} of {total}: request <code>?offset={(page - 1) * 10}&limit=10</code>
      </p>
    </div>
  );
}

const labs = {
  TransportLab: [
    "communication--communication-overview",
    "communication--short-polling",
    "communication--long-polling",
    "communication--websockets",
    "communication--server-sent-events",
  ],
  XssLab: ["security--cross-site-scripting-xss", "security--input-validation-and-sanitization"],
  CacheLab: ["database-and-caching--http-caching", "database-and-caching--api-caching"],
  ContrastLab: ["accessibility--color-contrast"],
  DebounceLab: ["low-level-design--autocomplete-search-bar"],
  PaginationLab: ["low-level-design--pagination-design", "low-level-design--pagination-implementation"],
};
const components = { TransportLab, XssLab, CacheLab, ContrastLab, DebounceLab, PaginationLab };

export default function FsdPracticeLab({ slug }) {
  const name = Object.keys(labs).find((key) => labs[key].includes(slug));
  const Lab = name ? components[name] : null;
  return Lab ? <Lab /> : null;
}
