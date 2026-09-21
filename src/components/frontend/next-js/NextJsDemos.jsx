import { useId, useState } from "react";

function BoundaryDemo() {
  const [wide, setWide] = useState(false);
  return (
    <div className="reactLab">
      <h3>Choose the client boundary</h3>
      <label>
        <input type="checkbox" checked={wide} onChange={(event) => setWide(event.target.checked)} />{" "}
        Put use client on the whole page
      </label>
      <div className="nextBoundaryTree">
        <div>
          <small>{wide ? "CLIENT MODULE" : "SERVER COMPONENT"}</small>
          <strong>Course page</strong>
        </div>
        <div>
          <small>{wide ? "CLIENT DEPENDENCY" : "SERVER COMPONENT"}</small>
          <strong>Course description</strong>
        </div>
        <div>
          <small>CLIENT COMPONENT</small>
          <strong>Bookmark button</strong>
        </div>
      </div>
      <p role="status">
        {wide
          ? "The page and its imported component dependencies join the client graph."
          : "Only the bookmark interaction needs the client boundary in this model."}
      </p>
      <p>
        Client Components can still produce initial server-rendered HTML. This diagram tracks module
        boundaries, not whether initial HTML exists.
      </p>
    </div>
  );
}

function CacheDemo() {
  const [database, setDatabase] = useState(1);
  const [cached, setCached] = useState(null);
  const [stale, setStale] = useState(false);
  const [view, setView] = useState(null);
  const [message, setMessage] = useState("Read the catalog to populate the cache.");
  function read() {
    if (cached === null) {
      setCached(database);
      setView(database);
      setStale(false);
      setMessage(`Cache miss: read database version ${database}.`);
    } else {
      setView(cached);
      setMessage(
        stale
          ? `Serve stale version ${cached}; refresh work may now obtain version ${database}.`
          : `Cache hit: reuse version ${cached}.`,
      );
    }
  }
  return (
    <div className="reactLab">
      <h3>Explore freshness and invalidation</h3>
      <p>
        A simplified single-entry cache. Background completion is manual so you can inspect
        stale-while-revalidate behavior.
      </p>
      <div className="nextStateGrid">
        <div>
          <small>DATABASE</small>
          <strong>Version {database}</strong>
        </div>
        <div>
          <small>SERVER CACHE</small>
          <strong>
            {cached === null ? "Missing" : `Version ${cached}${stale ? " · stale" : ""}`}
          </strong>
        </div>
        <div>
          <small>DISPLAYED RESULT</small>
          <strong>{view === null ? "Not read" : `Version ${view}`}</strong>
        </div>
      </div>
      <div className="reactLabActions">
        <button onClick={read}>Read / refresh page</button>
        <button
          onClick={() => {
            setDatabase((value) => value + 1);
            setMessage("Database changed. The cached result has not been invalidated.");
          }}
        >
          Change database
        </button>
        <button
          disabled={cached === null}
          onClick={() => {
            setStale(true);
            setMessage("Tag marked stale: a read may serve the old result while refreshing.");
          }}
        >
          Mark stale (max)
        </button>
        <button
          disabled={!stale}
          onClick={() => {
            setCached(database);
            setStale(false);
            setMessage("Background refresh finished. Read again to display the refreshed cache.");
          }}
        >
          Finish background refresh
        </button>
        <button
          onClick={() => {
            setCached(null);
            setStale(false);
            setMessage("Entry expired. The next read must obtain a fresh result.");
          }}
        >
          Expire immediately
        </button>
        <button
          onClick={() => {
            setDatabase(1);
            setCached(null);
            setStale(false);
            setView(null);
            setMessage("Cache model reset.");
          }}
        >
          Reset cache
        </button>
      </div>
      <p role="status">{message}</p>
      <p>
        A page refresh can reuse server data. Expiring a cache entry does not retroactively update
        every open browser tab.
      </p>
    </div>
  );
}

function StreamDemo() {
  const [ready, setReady] = useState({ catalog: false, report: false });
  return (
    <div className="reactLab">
      <h3>Reveal independent streaming regions</h3>
      <p>
        The shell is already available. Resolve each region to compare partial progress with waiting
        for everything.
      </p>
      <div className="reactPreview">
        <small>READY SHELL</small>
        <h3>Course dashboard</h3>
        <p>Navigation and heading stay available.</p>
      </div>
      <div className="nextDemoGrid">
        <div className="reactPreview">
          <small>CATALOG BOUNDARY</small>
          <p>{ready.catalog ? "React · Angular · Next.js" : "Loading course list…"}</p>
        </div>
        <div className="reactPreview">
          <small>REPORT BOUNDARY</small>
          <p>{ready.report ? "Two lessons completed this week." : "Loading progress report…"}</p>
        </div>
      </div>
      <div className="reactLabActions">
        <button
          disabled={ready.catalog}
          onClick={() => setReady((value) => ({ ...value, catalog: true }))}
        >
          Resolve catalog
        </button>
        <button
          disabled={ready.report}
          onClick={() => setReady((value) => ({ ...value, report: true }))}
        >
          Resolve report
        </button>
        <button onClick={() => setReady({ catalog: false, report: false })}>Reset stream</button>
      </div>
      <p role="status">
        {Number(ready.catalog) + Number(ready.report)} of 2 regions resolved. The shell remains
        visible.
      </p>
    </div>
  );
}

function RouteDemo() {
  const [path, setPath] = useState("/courses/next");
  const [soft, setSoft] = useState(true);
  const parts = path.split("/").filter(Boolean);
  const matches =
    parts.length === 2 && parts[0] === "courses" && ["next", "react", "angular"].includes(parts[1]);
  return (
    <div className="reactLab">
      <h3>Compare soft navigation with a direct load</h3>
      <label>
        Example destination
        <input value={path} onChange={(event) => setPath(event.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={soft} onChange={(event) => setSoft(event.target.checked)} />{" "}
        Follow a Link from the catalog
      </label>
      <pre tabIndex={0}>
        <code>{"app/courses/[slug]/page.tsx\napp/@modal/(.)courses/[slug]/page.tsx"}</code>
      </pre>
      <div className="reactPreview">
        <small>MATCH RESULT</small>
        <p role="status">
          {matches
            ? `slug = ${parts[1]} · ${soft ? "Intercepted course preview over the catalog" : "Canonical full course page"}`
            : "Course not found in this sample catalog."}
        </p>
      </div>
      <p>
        Clear the checkbox to model pasting the URL or refreshing. This demonstrates routing
        outcomes, not a functional modal or a live router.
      </p>
    </div>
  );
}

function OptimisticDemo() {
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("No pending mutation.");
  const displayed = pending ? !confirmed : confirmed;
  return (
    <div className="reactLab">
      <h3>Confirm or reject an optimistic change</h3>
      <p>
        Start a save, then choose a server outcome. The temporary view must agree with confirmed
        data after settlement.
      </p>
      <div className="nextStateGrid">
        <div>
          <small>CONFIRMED BASE</small>
          <strong>{confirmed ? "Complete" : "Incomplete"}</strong>
        </div>
        <div>
          <small>DISPLAYED UI</small>
          <strong>{displayed ? "Complete" : "Incomplete"}</strong>
        </div>
        <div>
          <small>REQUEST</small>
          <strong>{pending ? "Pending" : "Idle"}</strong>
        </div>
      </div>
      <div className="reactLabActions">
        <button
          disabled={pending}
          onClick={() => {
            setPending(true);
            setMessage("Optimistic overlay applied. Confirmed data is unchanged.");
          }}
        >
          Toggle and save
        </button>
        <button
          disabled={!pending}
          onClick={() => {
            setConfirmed((value) => !value);
            setPending(false);
            setMessage("Server confirmed the change. The new base is authoritative.");
          }}
        >
          Server succeeds
        </button>
        <button
          disabled={!pending}
          onClick={() => {
            setPending(false);
            setMessage("Server rejected the save. The UI returned to its confirmed base.");
          }}
        >
          Server fails
        </button>
        <button
          onClick={() => {
            setConfirmed(false);
            setPending(false);
            setMessage("Mutation model reset.");
          }}
        >
          Reset mutation
        </button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}

function FormDemo() {
  const id = useId();
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("No submission yet.");
  function settle() {
    const valid = title.trim().length >= 3 && title.trim().length <= 120;
    setPhase(valid ? "success" : "error");
    setMessage(
      valid
        ? `Validated: ${title.trim()}. This model does not persist data.`
        : "Use a title between 3 and 120 characters.",
    );
  }
  return (
    <div className="reactLab">
      <h3>Follow a form through its action states</h3>
      <p>Submit a title, inspect the pending state, then finish the simulated server validation.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPhase("pending");
          setMessage("Waiting for server validation…");
        }}
      >
        <label htmlFor={id}>Plan title</label>
        <input
          id={id}
          value={title}
          disabled={phase === "pending"}
          aria-invalid={phase === "error"}
          aria-describedby={`${id}-result`}
          onChange={(event) => {
            setTitle(event.target.value);
            setPhase("idle");
            setMessage("Draft edited; submit to validate.");
          }}
        />
        <div className="reactLabActions">
          <button type="submit" disabled={phase === "pending"}>
            Submit plan
          </button>
          <button type="button" disabled={phase !== "pending"} onClick={settle}>
            Finish validation
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setPhase("idle");
              setMessage("Form reset.");
            }}
          >
            Reset form
          </button>
        </div>
        <p id={`${id}-result`} role={phase === "error" ? "alert" : "status"}>
          {message}
        </p>
      </form>
    </div>
  );
}

const groups = [
  {
    Component: BoundaryDemo,
    slugs: [
      "foundations--why-next-js",
      "rendering--server-components",
      "rendering--client-components",
      "production--architecture",
    ],
  },
  {
    Component: CacheDemo,
    slugs: ["data--caching", "data--revalidation", "rendering--static-rendering"],
  },
  {
    Component: StreamDemo,
    slugs: ["rendering--streaming", "experience--loading-ui", "production--performance"],
  },
  {
    Component: RouteDemo,
    slugs: [
      "routing--dynamic-segments",
      "routing--parallel-routes",
      "routing--intercepting-routes",
      "foundations--navigation",
    ],
  },
  { Component: OptimisticDemo, slugs: ["data--optimistic-updates"] },
  {
    Component: FormDemo,
    slugs: ["data--server-actions", "fullstack--forms", "fullstack--route-handlers"],
  },
];
export default function NextJsDemos({ slug }) {
  const Demo = groups.find((group) => group.slugs.includes(slug))?.Component;
  if (!Demo) return null;
  return (
    <>
      <p className="nextDemoNote">
        Interactive model: explore the behavior here, then run the code in your Next.js practice
        workspace.
      </p>
      <Demo />
    </>
  );
}
