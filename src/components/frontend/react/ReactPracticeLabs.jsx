import { Component, useEffect, useReducer, useRef, useState } from "react";

/* ---------- From JSX to createElement ---------- */
const jsxSamples = [
  {
    name: "Element",
    jsx: `<h1 className="title">Hello</h1>`,
    out: `React.createElement("h1", { className: "title" }, "Hello")`,
  },
  {
    name: "Nested",
    jsx: `<ul>\n  <li>One</li>\n  <li>Two</li>\n</ul>`,
    out: `React.createElement("ul", null,\n  React.createElement("li", null, "One"),\n  React.createElement("li", null, "Two")\n)`,
  },
  {
    name: "Component",
    jsx: `<Card title={course.title} />`,
    out: `React.createElement(Card, { title: course.title })`,
  },
  {
    name: "Expression",
    jsx: `<p>{done ? "Done" : "Pending"}</p>`,
    out: `React.createElement("p", null, done ? "Done" : "Pending")`,
  },
];

function JsxCompileLab() {
  const [index, setIndex] = useState(0);
  const sample = jsxSamples[index];
  return (
    <div className="reactLab">
      <h3>Compile JSX in your head</h3>
      <p>
        Pick a snippet. Predict the function call, then compare. Modern builds emit an equivalent
        jsx() call from react/jsx-runtime.
      </p>
      <div className="reactLabActions">
        {jsxSamples.map((item, i) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="reactLabSplit">
        <pre tabIndex={0} aria-label="JSX input">
          <code>{sample.jsx}</code>
        </pre>
        <pre key={index} className="reactLabReveal" tabIndex={0} aria-label="Compiled output">
          <code>{sample.out}</code>
        </pre>
      </div>
    </div>
  );
}

/* ---------- Virtual DOM diff ---------- */
const startItems = ["Inception", "Igniting", "Foundation"];

function DiffLab() {
  const [items, setItems] = useState(startItems);
  const [useIndexKeys, setUseIndexKeys] = useState(false);
  const [changed, setChanged] = useState([]);
  const previous = useRef(items);

  function apply(next) {
    const before = previous.current;
    const touched = next
      .map((item, i) =>
        useIndexKeys ? (before[i] !== item ? i : -1) : before.includes(item) ? -1 : i,
      )
      .filter((i) => i >= 0);
    previous.current = next;
    setChanged(touched);
    setItems(next);
  }

  return (
    <div className="reactLab">
      <h3>Watch reconciliation decide what to touch</h3>
      <p>
        Highlighted rows are the DOM nodes React must create or rewrite. Compare stable keys with
        index keys when you prepend.
      </p>
      <label className="reactLabInline">
        <input
          type="checkbox"
          checked={useIndexKeys}
          onChange={(event) => setUseIndexKeys(event.target.checked)}
        />
        Use array index as key
      </label>
      <div className="reactLabActions">
        <button type="button" onClick={() => apply(["New topic " + (items.length + 1), ...items])}>
          Prepend item
        </button>
        <button type="button" onClick={() => apply([...items, "New topic " + (items.length + 1)])}>
          Append item
        </button>
        <button type="button" onClick={() => apply([...items].reverse())}>
          Reverse
        </button>
        <button
          type="button"
          onClick={() => {
            previous.current = startItems;
            setItems(startItems);
            setChanged([]);
          }}
        >
          Reset
        </button>
      </div>
      <ul className="reactLabList">
        {items.map((item, i) => (
          <li key={item} className={changed.includes(i) ? "reactLabFlash" : undefined}>
            <span>{item}</span>
            <code>key: {useIndexKeys ? i : JSON.stringify(item)}</code>
          </li>
        ))}
      </ul>
      <p role="status">
        {changed.length} of {items.length} rows needed DOM work
        {useIndexKeys ? " (index keys)" : " (stable keys)"}.
      </p>
    </div>
  );
}

/* ---------- Class lifecycle ---------- */
class LifecycleChild extends Component {
  constructor(props) {
    super(props);
    this.state = { clicks: 0 };
    props.log(`${props.name}: constructor`);
  }
  componentDidMount() {
    this.props.log(`${this.props.name}: componentDidMount`);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.clicks !== this.state.clicks || prevProps.round !== this.props.round) {
      this.props.log(`${this.props.name}: componentDidUpdate`);
    }
  }
  componentWillUnmount() {
    this.props.log(`${this.props.name}: componentWillUnmount`);
  }
  render() {
    return (
      <button
        type="button"
        onClick={() => this.setState((state) => ({ clicks: state.clicks + 1 }))}
      >
        {this.props.name} clicks: {this.state.clicks}
      </button>
    );
  }
}

function LifecycleLab() {
  const [mounted, setMounted] = useState(false);
  const [round, setRound] = useState(0);
  const [entries, setEntries] = useState([]);
  // Logs arrive during render and commit, so batch them into one later state update
  // instead of setting parent state while a child is rendering.
  const queue = useRef([]);
  const scheduled = useRef(false);
  const log = (text) => {
    queue.current.push(text);
    if (scheduled.current) return;
    scheduled.current = true;
    window.queueMicrotask(() => {
      scheduled.current = false;
      const next = queue.current;
      queue.current = [];
      setEntries((list) => [...list, ...next].slice(-20));
    });
  };
  return (
    <div className="reactLab">
      <h3>Trace a class component lifecycle</h3>
      <p>
        Mount two children, click one, re-render from the parent, then unmount. Development
        StrictMode would repeat some steps to expose side effects.
      </p>
      <div className="reactLabActions">
        <button type="button" onClick={() => setMounted((value) => !value)}>
          {mounted ? "Unmount children" : "Mount children"}
        </button>
        <button type="button" disabled={!mounted} onClick={() => setRound((value) => value + 1)}>
          Parent re-render
        </button>
        <button type="button" onClick={() => setEntries([])}>
          Clear log
        </button>
      </div>
      {mounted && (
        <div className="reactLabActions">
          <LifecycleChild name="First" round={round} log={log} />
          <LifecycleChild name="Second" round={round} log={log} />
        </div>
      )}
      <ol className="reactLabLog" aria-label="Lifecycle log">
        {entries.length === 0 ? (
          <li>No lifecycle calls yet.</li>
        ) : (
          entries.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)
        )}
      </ol>
    </div>
  );
}

/* ---------- Higher-order components ---------- */
function CourseTile({ title, price }) {
  return (
    <div className="reactLabCard">
      <strong>{title}</strong>
      <span>{price}</span>
    </div>
  );
}

function withBadge(Wrapped, badge) {
  function WithBadge(props) {
    return (
      <div className="reactLabBadged">
        <em>{badge}</em>
        <Wrapped {...props} />
      </div>
    );
  }
  WithBadge.displayName = `withBadge(${Wrapped.displayName || Wrapped.name})`;
  return WithBadge;
}

const FeaturedTile = withBadge(CourseTile, "Featured");

function HocLab() {
  const [featured, setFeatured] = useState(["react"]);
  const courses = [
    { id: "react", title: "React", price: "Free preview" },
    { id: "node", title: "Node.js", price: "8 modules" },
    { id: "css", title: "CSS", price: "5 modules" },
  ];
  return (
    <div className="reactLab">
      <h3>Wrap a component without editing it</h3>
      <p>
        Toggle which courses render through the enhanced component. CourseTile itself never changes.
      </p>
      <div className="reactLabGrid">
        {courses.map((course) => {
          const isFeatured = featured.includes(course.id);
          const Tile = isFeatured ? FeaturedTile : CourseTile;
          return (
            <label key={course.id} className="reactLabPick">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={() =>
                  setFeatured((list) =>
                    isFeatured ? list.filter((id) => id !== course.id) : [...list, course.id],
                  )
                }
              />
              <Tile title={course.title} price={course.price} />
            </label>
          );
        })}
      </div>
      <p role="status">
        Rendered as: {featured.length ? FeaturedTile.displayName : "CourseTile only"}
      </p>
    </div>
  );
}

/* ---------- Controlled vs uncontrolled ---------- */
function ControlledLab() {
  const [controlled, setControlled] = useState("");
  const uncontrolledRef = useRef(null);
  const [renders, setRenders] = useState(0);
  const [read, setRead] = useState("Nothing read yet.");
  return (
    <div className="reactLab">
      <h3>Type into both inputs</h3>
      <p>
        The controlled field updates state on every keystroke. The uncontrolled field keeps its own
        value until you read it.
      </p>
      <div className="reactLabFields">
        <label>
          Controlled (value + onChange)
          <input
            value={controlled}
            onChange={(event) => {
              setControlled(event.target.value.toUpperCase());
              setRenders((value) => value + 1);
            }}
          />
        </label>
        <label>
          Uncontrolled (defaultValue + ref)
          <input ref={uncontrolledRef} defaultValue="" />
        </label>
      </div>
      <div className="reactLabActions">
        <button
          type="button"
          onClick={() => setRead(`Ref read: "${uncontrolledRef.current?.value ?? ""}"`)}
        >
          Read uncontrolled value
        </button>
      </div>
      <p role="status">
        Controlled value in state: "{controlled}" · state updates: {renders} · {read}
      </p>
    </div>
  );
}

/* ---------- Config-driven UI ---------- */
const widgetCatalog = {
  banner: () => (
    <div className="reactLabCard reactLabBanner">
      <strong>Winter offer</strong>
      <span>Free delivery today</span>
    </div>
  ),
  categories: () => (
    <div className="reactLabCard">
      <strong>Categories</strong>
      <span>Pizza · Biryani · Dosa</span>
    </div>
  ),
  restaurants: () => (
    <div className="reactLabCard">
      <strong>Top restaurants</strong>
      <span>3 near you</span>
    </div>
  ),
  survey: () => (
    <div className="reactLabCard">
      <strong>Rate your last order</strong>
      <span>★★★★☆</span>
    </div>
  ),
};

const cityConfigs = {
  Bengaluru: ["banner", "categories", "restaurants"],
  Pune: ["restaurants", "categories"],
  Delhi: ["categories", "survey", "restaurants"],
};

function ConfigLab() {
  const [city, setCity] = useState("Bengaluru");
  const config = cityConfigs[city];
  return (
    <div className="reactLab">
      <h3>Same code, different config</h3>
      <p>
        Each city receives a different layout list from the backend. The renderer maps widget types
        to components and skips unknown ones.
      </p>
      <label>
        City
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          {Object.keys(cityConfigs).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <div className="reactLabSplit">
        <pre tabIndex={0} aria-label="Layout config">
          <code>{JSON.stringify({ layout: config.map((type) => ({ type })) }, null, 2)}</code>
        </pre>
        <div className="reactLabStack" key={city}>
          {config.map((type) => {
            const Widget = widgetCatalog[type];
            return Widget ? <Widget key={type} /> : null;
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Redux-style store ---------- */
function cartReducer(state, action) {
  switch (action.type) {
    case "cart/addItem": {
      const existing = state.items.find((item) => item.id === action.payload.id);
      const items = existing
        ? state.items.map((item) =>
            item.id === action.payload.id ? { ...item, qty: item.qty + 1 } : item,
          )
        : [...state.items, { ...action.payload, qty: 1 }];
      return { ...state, items };
    }
    case "cart/removeItem":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case "cart/clearCart":
      return { ...state, items: [] };
    default:
      return state;
  }
}

const menu = [
  { id: "dosa", name: "Masala dosa", price: 120 },
  { id: "paneer", name: "Paneer tikka", price: 220 },
];

function StoreLab() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [log, setLog] = useState([]);
  function send(action) {
    dispatch(action);
    setLog((list) => [JSON.stringify(action), ...list].slice(0, 6));
  }
  const count = state.items.reduce((sum, item) => sum + item.qty, 0);
  const total = state.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  return (
    <div className="reactLab">
      <h3>Dispatch actions into a cart slice</h3>
      <p>
        Buttons dispatch plain action objects. The reducer returns the next state and the header
        reads it through a selector-like calculation.
      </p>
      <div className="reactLabActions">
        {menu.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => send({ type: "cart/addItem", payload: item })}
          >
            Add {item.name}
          </button>
        ))}
        <button type="button" disabled={!count} onClick={() => send({ type: "cart/clearCart" })}>
          Clear cart
        </button>
      </div>
      <div className="reactLabSplit">
        <div>
          <p className="reactLabNumber" aria-label="Cart count">
            🛒 {count}
          </p>
          <ul className="reactLabList">
            {state.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => send({ type: "cart/removeItem", payload: item.id })}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p>Total: ₹{total}</p>
        </div>
        <ol className="reactLabLog" aria-label="Dispatched actions">
          {log.length ? (
            log.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)
          ) : (
            <li>No actions dispatched.</li>
          )}
        </ol>
      </div>
    </div>
  );
}

/* ---------- Shimmer UI ---------- */
function ShimmerLab() {
  const [status, setStatus] = useState("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function load() {
    setStatus("loading");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("ready"), 1600);
  }
  return (
    <div className="reactLab">
      <h3>Reserve space while data loads</h3>
      <p>
        The skeleton keeps the same card size as the real content, so nothing jumps when the
        response arrives.
      </p>
      <div className="reactLabActions">
        <button type="button" onClick={load}>
          Load restaurants
        </button>
      </div>
      <div className="reactLabGrid" aria-busy={status === "loading"}>
        {[1, 2, 3].map((n) =>
          status === "ready" ? (
            <div key={n} className="reactLabCard">
              <strong>Restaurant {n}</strong>
              <span>
                {20 + n * 5} min · ★ 4.{n + 2}
              </span>
            </div>
          ) : (
            <div
              key={n}
              className={status === "loading" ? "reactLabSkeleton isLoading" : "reactLabSkeleton"}
              aria-hidden="true"
            >
              <span />
              <span />
            </div>
          ),
        )}
      </div>
      <p role="status">
        {status === "idle"
          ? "Press load to start."
          : status === "loading"
            ? "Loading restaurants…"
            : "3 restaurants loaded."}
      </p>
    </div>
  );
}

/* ---------- Debounced search ---------- */
const suggestionsSource = [
  "react",
  "react router",
  "react hooks",
  "redux toolkit",
  "react testing library",
  "reconciliation",
  "render props",
];

function DebounceLab() {
  const [query, setQuery] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [requests, setRequests] = useState([]);
  const [results, setResults] = useState([]);
  const cache = useRef(new Map());
  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      setResults([]);
      return undefined;
    }
    const id = window.setTimeout(() => {
      if (cache.current.has(term)) {
        setResults(cache.current.get(term));
        setRequests((list) => [`cache hit: "${term}"`, ...list].slice(0, 6));
        return;
      }
      const found = suggestionsSource.filter((item) => item.includes(term));
      cache.current.set(term, found);
      setResults(found);
      setRequests((list) => [`request: "${term}"`, ...list].slice(0, 6));
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);
  return (
    <div className="reactLab">
      <h3>Count keystrokes against requests</h3>
      <p>
        Type quickly, pause, then retype an earlier term. Requests only fire after 300 ms of quiet,
        and repeated terms come from the cache.
      </p>
      <label>
        Search topics
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setKeystrokes((value) => value + 1);
          }}
        />
      </label>
      <ul className="reactLabList" aria-label="Suggestions">
        {results.map((item) => (
          <li key={item}>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="reactLabSplit">
        <p role="status">
          Keystrokes: {keystrokes} · Lookups: {requests.length}
        </p>
        <ol className="reactLabLog" aria-label="Request log">
          {requests.length ? (
            requests.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)
          ) : (
            <li>No lookups yet.</li>
          )}
        </ol>
      </div>
    </div>
  );
}

/* ---------- Infinite scroll ---------- */
function InfiniteLab() {
  const [items, setItems] = useState(() => Array.from({ length: 8 }, (_, i) => i + 1));
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const done = items.length >= 40;

  useEffect(() => {
    if (done || typeof window.IntersectionObserver === "undefined") return undefined;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        window.setTimeout(() => {
          setItems((list) => [
            ...list,
            ...Array.from({ length: 8 }, (_, i) => list.length + i + 1),
          ]);
          loadingRef.current = false;
          setLoading(false);
        }, 700);
      },
      { root: rootRef.current, rootMargin: "80px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [done]);

  return (
    <div className="reactLab">
      <h3>Scroll the feed</h3>
      <p>
        An observer watches the invisible sentinel at the bottom. When it nears the viewport, the
        next page loads. The feed stops at 40 videos.
      </p>
      <div className="reactLabScroller" ref={rootRef} tabIndex={0} aria-label="Video feed">
        {items.map((n) => (
          <div key={n} className="reactLabCard">
            <strong>Video {n}</strong>
            <span>{((n * 37) % 90) + 10}K views</span>
          </div>
        ))}
        <div ref={sentinelRef} className="reactLabSentinel">
          {done ? "You reached the end." : loading ? "Loading more…" : "sentinel"}
        </div>
      </div>
      <p role="status">{items.length} videos loaded</p>
    </div>
  );
}

/* ---------- Nested comments ---------- */
const startComments = [
  {
    id: 1,
    author: "Asha",
    text: "Recursion finally makes sense.",
    replies: [
      {
        id: 2,
        author: "Ravi",
        text: "Same component, smaller data.",
        replies: [{ id: 3, author: "Asha", text: "And an empty array ends it.", replies: [] }],
      },
    ],
  },
  { id: 4, author: "Meera", text: "How deep can it go?", replies: [] },
];

function addReply(list, parentId, reply) {
  return list.map((comment) =>
    comment.id === parentId
      ? { ...comment, replies: [...comment.replies, reply] }
      : { ...comment, replies: addReply(comment.replies, parentId, reply) },
  );
}

function CommentList({ comments, depth, onReply }) {
  return (
    <ul className="reactLabComments">
      {comments.map((comment) => (
        <li key={comment.id}>
          <p>
            <strong>{comment.author}</strong> {comment.text}
          </p>
          <button type="button" onClick={() => onReply(comment.id)}>
            Reply
          </button>
          {comment.replies.length > 0 && (
            <CommentList comments={comment.replies} depth={depth + 1} onReply={onReply} />
          )}
        </li>
      ))}
    </ul>
  );
}

function CommentsLab() {
  const [comments, setComments] = useState(startComments);
  const nextId = useRef(5);
  function reply(parentId) {
    const id = nextId.current++;
    setComments((list) =>
      addReply(list, parentId, { id, author: "You", text: `Reply #${id}`, replies: [] }),
    );
  }
  return (
    <div className="reactLab">
      <h3>Reply at any depth</h3>
      <p>
        CommentList renders itself for each replies array. Add replies and watch new levels appear.
      </p>
      <CommentList comments={comments} depth={0} onReply={reply} />
      <div className="reactLabActions">
        <button type="button" onClick={() => setComments(startComments)}>
          Reset thread
        </button>
      </div>
    </div>
  );
}

/* ---------- Live chat ---------- */
const names = ["Kiran", "Dev", "Sana", "Ira", "Om"];
const lines = [
  "Great stream!",
  "Hello from Pune 👋",
  "What editor is that?",
  "🔥🔥",
  "Can you share the repo?",
  "Namaste!",
];

function ChatLab() {
  const [messages, setMessages] = useState([]);
  const [live, setLive] = useState(false);
  const [draft, setDraft] = useState("");
  const limit = 8;
  useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => {
      setMessages((list) => {
        const n = list.length ? list[0].id + 1 : 1;
        const incoming = { id: n, name: names[n % names.length], text: lines[n % lines.length] };
        return [incoming, ...list].slice(0, limit);
      });
    }, 1200);
    return () => window.clearInterval(id);
  }, [live]);
  return (
    <div className="reactLab">
      <h3>Poll for chat and cap the list</h3>
      <p>
        New messages enter at the top. Only the latest {limit} stay in state, so memory and DOM size
        stay flat however long the stream runs.
      </p>
      <div className="reactLabActions">
        <button type="button" onClick={() => setLive((value) => !value)} aria-pressed={live}>
          {live ? "Stop polling" : "Start polling"}
        </button>
      </div>
      <ul className="reactLabChat" aria-live="off">
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.name}</strong> {message.text}
          </li>
        ))}
      </ul>
      <form
        className="reactLabActions"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setMessages((list) =>
            [{ id: (list[0]?.id ?? 0) + 1, name: "You", text: draft.trim() }, ...list].slice(
              0,
              limit,
            ),
          );
          setDraft("");
        }}
      >
        <label className="reactLabInline">
          Message
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button type="submit">Send</button>
      </form>
      <p role="status">
        {messages.length} of {limit} slots used · {live ? "polling every 1.2 s" : "paused"}
      </p>
    </div>
  );
}

/* ---------- Multi-language ---------- */
const dictionary = {
  en: { greeting: "Welcome back", search: "Search movies", results: (n) => `${n} results` },
  hi: { greeting: "वापसी पर स्वागत है", search: "फ़िल्में खोजें", results: (n) => `${n} परिणाम` },
  es: {
    greeting: "Bienvenido de nuevo",
    search: "Buscar películas",
    results: (n) => `${n} resultados`,
  },
};

function LanguageLab() {
  const [lang, setLang] = useState("en");
  const [count, setCount] = useState(3);
  const t = dictionary[lang];
  return (
    <div className="reactLab">
      <h3>Switch the language, keep the component</h3>
      <p>
        The component reads strings by key. Changing the language changes one value; layout code
        does not branch.
      </p>
      <div className="reactLabFields">
        <label>
          Language
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="es">Español</option>
          </select>
        </label>
        <label>
          Result count
          <input
            type="number"
            min="0"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="reactPreview" lang={lang} key={lang}>
        <small>RENDERED UI</small>
        <h3>{t.greeting}</h3>
        <p>
          {t.search} · {t.results(count)}
        </p>
      </div>
    </div>
  );
}

const labs = {
  "under-the-hood--from-jsx-to-createelement": JsxCompileLab,
  "under-the-hood--virtual-dom-and-reconciliation": DiffLab,
  "class-components--class-components": LifecycleLab,
  "class-components--class-lifecycle-methods": LifecycleLab,
  "class-components--higher-order-components": HocLab,
  "class-components--controlled-vs-uncontrolled-components": ControlledLab,
  "class-components--config-driven-ui": ConfigLab,
  "tailwind-and-redux--redux-toolkit-store-and-slices": StoreLab,
  "tailwind-and-redux--useselector-and-usedispatch": StoreLab,
  "real-world-features--shimmer-ui": ShimmerLab,
  "real-world-features--debounced-search-and-caching": DebounceLab,
  "real-world-features--infinite-scroll": InfiniteLab,
  "real-world-features--nested-comments": CommentsLab,
  "real-world-features--live-chat-updates": ChatLab,
  "real-world-features--multi-language-support": LanguageLab,
};

export default function PracticeLab({ slug }) {
  const Lab = labs[slug];
  return Lab ? <Lab /> : null;
}
