import { useState } from "react";
import { Controls, Frame, Rich, textWidth, useStepper, useSvgId } from "./Stepper";

// Class / interface hierarchy pictures (Collection, Map, Throwable). Nodes are placed by
// hand like a textbook figure. Each node: [id, label, kind, x, y, parents, info, port?]
//   parents: [[parentId, "extends" | "implements"], ...]
//   port "left": child hangs off a vertical bus on the parent's left side (compact lists)
//   x may be { left } to align a column of left-port children by their left edge.

const H = 34;

const COLLECTION = {
  width: 960,
  height: 450,
  nodes: [
    ["iterable", "Iterable", "i", 480, 30, [], "Root of the for-each loop. Anything with `iterator()` can be used in `for (T x : items)`. Lives in java.lang."],
    ["collection", "Collection", "i", 480, 100, [["iterable", "extends"]], "Root interface for a group of elements: `add`, `remove`, `contains`, `size`, `iterator`, `stream`. Map is NOT a Collection."],
    ["list", "List", "i", 170, 180, [["collection", "extends"]], "Ordered by index, allows duplicates and nulls, positional access with `get(i)` and `set(i, x)`."],
    ["set", "Set", "i", 480, 180, [["collection", "extends"]], "No duplicates: `add` returns false when an equal element (equals/hashCode or compareTo) is already present."],
    ["queue", "Queue", "i", 800, 180, [["collection", "extends"]], "Holds elements waiting to be processed: `offer`, `poll`, `peek`. Usually FIFO; PriorityQueue orders by priority."],
    ["arraylist", "ArrayList", "c", 60, 260, [["list", "implements"]], "Resizable array. `get(i)` O(1), add at the end amortised O(1), insert/remove in the middle O(n). Grows by 50%. Not synchronized."],
    ["linkedlist", "LinkedList", "c", 170, 260, [["list", "implements"]], "Doubly linked list that implements BOTH List and Deque (dashed line). Add/remove at either end O(1); `get(i)` walks the chain, O(n)."],
    ["vector", "Vector", "l", 280, 260, [["list", "implements"]], "Legacy (Java 1.0) synchronized resizable array that doubles its capacity. Prefer ArrayList, or CopyOnWriteArrayList for concurrency."],
    ["stack", "Stack", "l", 280, 330, [["vector", "extends"]], "Legacy LIFO class that extends Vector, so every call is synchronized. Prefer `ArrayDeque` with `push`/`pop`."],
    ["hashset", "HashSet", "c", 410, 260, [["set", "implements"]], "Backed by a HashMap (elements are the keys). O(1) average add/contains, no iteration order guaranteed, one null allowed."],
    ["linkedhashset", "LinkedHashSet", "c", 410, 330, [["hashset", "extends"]], "HashSet plus a doubly linked list through the entries, so iteration follows insertion order."],
    ["sortedset", "SortedSet", "i", 560, 260, [["set", "extends"]], "Keeps elements sorted: `first()`, `last()`, `headSet`, `tailSet`, `subSet`."],
    ["navigableset", "NavigableSet", "i", 560, 330, [["sortedset", "extends"]], "Adds closest-match search: `lower`, `floor`, `ceiling`, `higher`, `pollFirst`, `descendingSet`."],
    ["treeset", "TreeSet", "c", 560, 400, [["navigableset", "implements"]], "Red-black tree (backed by TreeMap). Sorted by natural order or a Comparator, O(log n) operations, no null elements."],
    ["priorityqueue", "PriorityQueue", "c", 720, 260, [["queue", "implements"]], "Binary min-heap in an array: `poll()` returns the smallest element (or per Comparator). O(log n) offer/poll; iteration order is NOT sorted."],
    ["deque", "Deque", "i", 880, 260, [["queue", "extends"]], "Double-ended queue: add/remove at both ends. Works as a FIFO queue (`offerLast`/`pollFirst`) or a LIFO stack (`push`/`pop`)."],
    ["arraydeque", "ArrayDeque", "c", 880, 330, [["deque", "implements"]], "Resizable circular array. The recommended stack AND queue: faster than Stack and LinkedList. No null elements."],
  ],
  extra: [["linkedlist", "deque", "M170 277 V 432 H 948 V 260 H 912"]],
  tour: ["iterable", "collection", "list", "arraylist", "linkedlist", "vector", "stack", "set", "hashset", "linkedhashset", "sortedset", "treeset", "queue", "priorityqueue", "deque", "arraydeque"],
};

const MAP = {
  width: 960,
  height: 320,
  nodes: [
    ["map", "Map<K, V>", "i", 520, 30, [], "Key → value pairs with unique keys. Not a Collection, but offers views: `keySet()`, `values()`, `entrySet()`."],
    ["dictionary", "Dictionary", "a", 250, 30, [], "Obsolete abstract class from Java 1.0. Only Hashtable still extends it."],
    ["hashmap", "HashMap", "c", 90, 120, [["map", "implements"]], "Array of buckets indexed by the key's hash. O(1) average get/put, one null key, no order. A bucket with more than 8 entries becomes a red-black tree (table size 64+)."],
    ["linkedhashmap", "LinkedHashMap", "c", 90, 200, [["hashmap", "extends"]], "HashMap plus a linked list: insertion order, or access order (`new LinkedHashMap<>(16, 0.75f, true)`) which gives an LRU cache via `removeEldestEntry`."],
    ["hashtable", "Hashtable", "l", 250, 120, [["dictionary", "extends"], ["map", "implements"]], "Legacy synchronized hash table. No null keys or values. Use HashMap, or ConcurrentHashMap when threads share it."],
    ["weakhashmap", "WeakHashMap", "c", 390, 120, [["map", "implements"]], "Keys are weak references: an entry disappears after its key is garbage collected. Handy for metadata caches."],
    ["identityhashmap", "IdentityHashMap", "c", 545, 120, [["map", "implements"]], "Compares keys with `==` (reference identity) instead of `equals`. Used for graph copying and serialization."],
    ["sortedmap", "SortedMap", "i", 700, 120, [["map", "extends"]], "Keys kept sorted: `firstKey`, `lastKey`, `headMap`, `tailMap`, `subMap`."],
    ["navigablemap", "NavigableMap", "i", 700, 200, [["sortedmap", "extends"]], "Closest-key search: `floorKey`, `ceilingEntry`, `higherKey`, `descendingMap`, `pollFirstEntry`."],
    ["treemap", "TreeMap", "c", 700, 275, [["navigablemap", "implements"]], "Red-black tree keyed by natural order or a Comparator. O(log n) get/put, sorted iteration, no null key."],
    ["concurrentmap", "ConcurrentMap", "i", 875, 120, [["map", "extends"]], "Atomic compound operations for shared maps: `putIfAbsent`, `compute`, `merge`, `replace(k, old, new)`."],
    ["concurrenthashmap", "ConcurrentHashMap", "c", 875, 200, [["concurrentmap", "implements"]], "Thread-safe hash map: CAS for empty bins plus a lock per bin (Java 8+), lock-free reads, no null keys or values."],
  ],
  tour: ["map", "hashmap", "linkedhashmap", "dictionary", "hashtable", "weakhashmap", "identityhashmap", "sortedmap", "navigablemap", "treemap", "concurrentmap", "concurrenthashmap"],
};

const THROWABLE = {
  width: 1030,
  height: 480,
  nodes: [
    ["throwable", "Throwable", "root", 520, 30, [], "Root of everything that can be thrown or caught. Holds the message, the cause and the stack trace."],
    ["error", "Error", "error", 150, 110, [["throwable", "extends"]], "Serious problems inside the JVM that an application should not try to recover from. Unchecked."],
    ["vme", "VirtualMachineError", "error", { left: 145 }, 175, [["error", "extends"]], "The JVM is broken or out of resources.", "left"],
    ["oom", "OutOfMemoryError", "error", { left: 175 }, 230, [["vme", "extends"]], "Heap (or metaspace, or native threads) exhausted. Raise -Xmx only after checking for a memory leak.", "left"],
    ["soe", "StackOverflowError", "error", { left: 175 }, 280, [["vme", "extends"]], "The thread's call stack is full, almost always from unbounded recursion.", "left"],
    ["assertion", "AssertionError", "error", { left: 145 }, 335, [["error", "extends"]], "Thrown by a failing `assert` statement (assertions are enabled with -ea).", "left"],
    ["exception", "Exception", "checked", 640, 110, [["throwable", "extends"]], "Conditions a program may want to handle. Every subclass is CHECKED (must be caught or declared with throws) except RuntimeException and its children."],
    ["ioexception", "IOException", "checked", 410, 190, [["exception", "extends"]], "Checked: reading or writing a file, socket or stream failed."],
    ["fnfe", "FileNotFoundException", "checked", { left: 385 }, 250, [["ioexception", "extends"]], "Checked: the file does not exist or cannot be opened.", "left"],
    ["eof", "EOFException", "checked", { left: 385 }, 300, [["ioexception", "extends"]], "Checked: the end of a stream was reached unexpectedly.", "left"],
    ["sql", "SQLException", "checked", 535, 190, [["exception", "extends"]], "Checked: a database access error from JDBC."],
    ["interrupted", "InterruptedException", "checked", 685, 190, [["exception", "extends"]], "Checked: a thread was interrupted while sleeping, waiting or joining."],
    ["runtime", "RuntimeException", "unchecked", 850, 190, [["exception", "extends"]], "UNCHECKED: usually a programming bug. The compiler does not force you to catch or declare it."],
    ["npe", "NullPointerException", "unchecked", { left: 800 }, 250, [["runtime", "extends"]], "Using a null reference: calling a method, reading a field or unboxing.", "left"],
    ["arith", "ArithmeticException", "unchecked", { left: 800 }, 300, [["runtime", "extends"]], "Integer division by zero (`10 / 0`). Floating-point division gives Infinity instead.", "left"],
    ["iae", "IllegalArgumentException", "unchecked", { left: 800 }, 350, [["runtime", "extends"]], "A method received a bad argument. NumberFormatException (`Integer.parseInt(\"x\")`) is a subclass.", "left"],
    ["ioobe", "IndexOutOfBoundsException", "unchecked", { left: 800 }, 400, [["runtime", "extends"]], "Index outside 0..size-1. Parent of ArrayIndexOutOfBounds and StringIndexOutOfBounds.", "left"],
    ["cce", "ClassCastException", "unchecked", { left: 800 }, 450, [["runtime", "extends"]], "Casting an object to a type it is not an instance of.", "left"],
  ],
  tour: ["throwable", "error", "vme", "oom", "soe", "exception", "ioexception", "fnfe", "sql", "interrupted", "runtime", "npe", "arith", "iae", "ioobe", "cce"],
};

export const HIERARCHIES = { collection: COLLECTION, map: MAP, throwable: THROWABLE };

const KIND = {
  i: "interface",
  a: "abstract class",
  c: "class",
  l: "legacy class",
  root: "root class",
  error: "Error (unchecked)",
  checked: "checked exception",
  unchecked: "unchecked exception",
};

function layout(data) {
  const nodes = data.nodes.map(([id, label, kind, x, y, parents, info, port]) => {
    const w = textWidth(label, 12.5);
    return { id, label, kind, x: typeof x === "object" ? x.left + w / 2 : x, y, w, parents, info, port };
  });
  return { ...data, nodes, byId: Object.fromEntries(nodes.map((node) => [node.id, node])) };
}

function lineage(byId, id) {
  const seen = new Set();
  const visit = (key) => {
    if (!key || seen.has(key)) return;
    seen.add(key);
    byId[key]?.parents.forEach(([parent]) => visit(parent));
  };
  visit(id);
  return seen;
}

function edgePath(child, parent) {
  if (child.port === "left") {
    const bus = parent.x - parent.w / 2 + 12;
    return `M${child.x - child.w / 2} ${child.y} H${bus} V${parent.y + H / 2}`;
  }
  const top = child.y - H / 2;
  const bottom = parent.y + H / 2;
  if (Math.abs(child.x - parent.x) < 1) return `M${child.x} ${top} V${bottom}`;
  if (child.y === parent.y) {
    const dir = parent.x > child.x ? 1 : -1;
    return `M${child.x + (dir * child.w) / 2} ${child.y} H${parent.x - (dir * parent.w) / 2}`;
  }
  const mid = (top + bottom) / 2;
  return `M${child.x} ${top} V${mid} H${parent.x} V${bottom}`;
}

function HierarchySvg({ data, selected, onSelect, label }) {
  const marker = useSvgId("jvTri");
  const chain = selected ? lineage(data.byId, selected) : null;
  const edges = data.nodes.flatMap((child) =>
    child.parents.map(([parentId, how]) => ({ child, parent: data.byId[parentId], how })),
  );
  return (
    <svg viewBox={`0 0 ${data.width} ${data.height}`} role="img" aria-label={label} className="jvHier" style={{ minWidth: Math.min(data.width, 720) }}>
      <defs>
        <marker id={marker} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
          <path d="M1 1 L11 6 L1 11 z" className="jvTriHead" />
        </marker>
      </defs>
      {edges.map(({ child, parent, how }) => {
        const on = chain && chain.has(child.id) && chain.has(parent.id);
        return (
          <path
            key={`${child.id}-${parent.id}`}
            d={edgePath(child, parent)}
            className={`jvEdge ${how === "implements" ? "dashed" : ""} ${on ? "on" : chain ? "dim" : ""}`}
            markerEnd={`url(#${marker})`}
          />
        );
      })}
      {(data.extra || []).map(([from, to, d]) => {
        const on = chain && chain.has(from);
        return <path key={`${from}-${to}-x`} d={d} className={`jvEdge dashed ${on ? "on" : chain ? "dim" : ""}`} markerEnd={`url(#${marker})`} />;
      })}
      {data.nodes.map((node) => {
        const state = !chain ? "" : node.id === selected ? "sel" : chain.has(node.id) ? "on" : "dim";
        return (
          <g
            key={node.id}
            className={`jvHNode k-${node.kind} ${state}`}
            role="button"
            tabIndex={0}
            aria-label={`${node.label}, ${KIND[node.kind]}`}
            onClick={() => onSelect(node.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(node.id);
              }
            }}
          >
            <rect x={node.x - node.w / 2} y={node.y - H / 2} width={node.w} height={H} rx={node.kind === "i" ? 17 : 5} />
            <text x={node.x} y={node.y + 4.5} textAnchor="middle">
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const LEGENDS = {
  collection: [
    ["i", "interface"],
    ["c", "class"],
    ["l", "legacy class"],
    ["line", "extends"],
    ["dash", "implements"],
  ],
  throwable: [
    ["error", "Error (unchecked)"],
    ["checked", "checked: catch or declare"],
    ["unchecked", "unchecked (RuntimeException)"],
    ["line", "extends"],
  ],
};
LEGENDS.map = [...LEGENDS.collection.slice(0, 2), ["a", "abstract class"], ...LEGENDS.collection.slice(2)];

function Legend({ items }) {
  return items.map(([kind, text]) => (
    <span key={kind}>
      {kind === "line" || kind === "dash" ? (
        <svg width="26" height="10" aria-hidden="true">
          <line x1="1" y1="5" x2="25" y2="5" className={`jvEdge ${kind === "dash" ? "dashed" : ""}`} />
        </svg>
      ) : (
        <i className={`jvSwatch k-${kind}`} />
      )}
      {text}
    </span>
  ));
}

// views: which pictures to show as tabs, e.g. ["collection", "map"] or ["throwable"].
export default function HierarchyVisual({ views = ["collection", "map"], title }) {
  const [view, setView] = useState(views[0]);
  const data = layout(HIERARCHIES[view]);
  const stepper = useStepper(data.tour.length, 1700);
  const [picked, setPicked] = useState(null);
  const [touring, setTouring] = useState(false);
  const selected = touring ? data.tour[stepper.index] : picked;
  const node = selected && data.byId[selected];
  const path = node
    ? [...lineage(data.byId, selected)].map((id) => data.byId[id].label).join(" → ")
    : "";
  const tabLabel = { collection: "Collection hierarchy", map: "Map hierarchy", throwable: "Throwable hierarchy" };
  return (
    <Frame
      wide
      kicker="HIERARCHY DIAGRAM"
      title={title || (views.includes("throwable") ? "Java exception class hierarchy" : "Java Collection Framework hierarchy")}
      tabs={views.length > 1 ? views.map((id) => ({ id, label: tabLabel[id] })) : null}
      tab={view}
      onTab={(id) => {
        setView(id);
        setPicked(null);
        setTouring(false);
        stepper.go(0);
      }}
      legend={<Legend items={LEGENDS[view]} />}
      controls={<Controls stepper={stepper} onInteract={() => setTouring(true)} />}
    >
      <HierarchySvg
        data={data}
        selected={selected}
        label={`${tabLabel[view]}. ${data.nodes.map((item) => item.label).join(", ")}.`}
        onSelect={(id) => {
          stepper.pause();
          setTouring(false);
          setPicked(id === picked && !touring ? null : id);
        }}
      />
      <div className="jvInfo" aria-live="polite">
        {node ? (
          <>
            <strong>{node.label}</strong> <em>{KIND[node.kind]}</em>
            <p>
              <Rich text={node.info} />
            </p>
            {path.includes("→") && <small>Is-a chain: {path}</small>}
          </>
        ) : (
          <p>
            Click any box to highlight its path to the root and read what it guarantees, or press{" "}
            <b>▶ Play</b> for a guided tour.
            {view === "collection" && " Map has its own hierarchy (see the Map tab): it does not extend Collection."}
          </p>
        )}
      </div>
    </Frame>
  );
}
