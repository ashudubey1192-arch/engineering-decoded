import HierarchyVisual from "./Hierarchy";
import {
  ArrayListVisual,
  CircularQueueVisual,
  HashMapVisual,
  LinkedListVisual,
  OrderingVisual,
  QueueVisual,
  StackVisual,
} from "./Structures";
import { GraphVisual, TreeVisual } from "./TreeGraph";
import { FlowVisual, HeapVisual, JdkLayersVisual } from "./Flows";
import "./JavaVisuals.css";

// Which pictures/animations each Java lesson shows, keyed by lesson slug.
// Used by CoreJavaLesson, JavaStructureArticle and JavaNetworkLesson.
const V = {
  collections: () => <HierarchyVisual views={["collection", "map"]} />,
  maps: () => <HierarchyVisual views={["map", "collection"]} title="Java Map hierarchy" />,
  exceptions: () => <HierarchyVisual views={["throwable"]} />,
  arrayList: () => <ArrayListVisual />,
  singly: () => <LinkedListVisual mode="singly" />,
  doubly: () => <LinkedListVisual mode="doubly" />,
  reverse: () => <LinkedListVisual mode="reverse" />,
  cycle: () => <LinkedListVisual mode="cycle" />,
  stack: () => <StackVisual />,
  queue: () => <QueueVisual />,
  circular: () => <CircularQueueVisual />,
  hashMap: () => <HashMapVisual />,
  setOrder: () => <OrderingVisual />,
  mapOrder: () => <OrderingVisual map />,
  traversals: () => <TreeVisual modes={["pre", "in", "post", "level"]} />,
  bst: () => <TreeVisual modes={["search", "insert", "in"]} />,
  levels: () => <TreeVisual modes={["level", "pre"]} />,
  graph: () => <GraphVisual modes={["bfs", "dfs"]} />,
  bfs: () => <GraphVisual modes={["bfs"]} />,
  dfs: () => <GraphVisual modes={["dfs", "bfs"]} />,
  compile: () => <FlowVisual flow="compile" />,
  jvm: () => <FlowVisual flow="jvm" />,
  jdk: () => <JdkLayersVisual />,
  lifecycle: () => <FlowVisual flow="lifecycle" />,
  propagation: () => <FlowVisual flow="propagation" />,
  tryCatch: () => <FlowVisual flow="trycatch" />,
  deadlock: () => <FlowVisual flow="deadlock" />,
  failFast: () => <FlowVisual flow="failfast" />,
  markSweep: () => <FlowVisual flow="marksweep" />,
  heap: () => <HeapVisual />,
};

export const JAVA_VISUALS = {
  "collections--build-your-own-arraylist-vector-hashmap-linkedhashmap-hashset-and-linkedhashset": ["arrayList", "hashMap", "setOrder"],
  // Introduction, JDK/JRE/JVM, memory
  "java-introduction--java-introduction-and-advantages": ["compile"],
  "java-introduction--your-first-java-program": ["compile"],
  "jdk-jre-jvm--jdk-vs-jre-vs-jvm": ["jdk", "compile"],
  "jdk-jre-jvm--jvm-architecture-in-detail": ["jvm"],
  "jdk-jre-jvm--jit-compiler-internals": ["jvm"],
  "garbage-collection--how-garbage-collection-works-mark-and-sweep": ["markSweep"],
  "garbage-collection--jvm-heap-structure-young-old-and-permanent-generation": ["heap"],
  "garbage-collection--minor-major-and-full-gc": ["heap"],
  "garbage-collection--gc-and-jvm-interview-questions": ["heap", "markSweep"],

  // Exceptions
  "exceptions--exception-hierarchy": ["exceptions"],
  "exceptions--checked-vs-unchecked-exceptions-and-errors": ["exceptions"],
  "exceptions--the-five-keywords-try-catch-finally-throw-and-throws": ["tryCatch"],
  "exceptions--nested-try-multiple-catch-blocks-and-returning-from-catch-and-finally": ["tryCatch"],
  "exceptions--exception-propagation": ["propagation"],
  "exceptions--most-common-checked-exceptions": ["exceptions"],
  "exceptions--most-common-unchecked-exceptions": ["exceptions"],
  "exceptions--exception-handling-interview-questions-and-output-puzzles": ["exceptions"],

  // Collections
  "collections--collection-framework-overview-list-set-and-map-properties": ["collections"],
  "collections--collection-hierarchy-list-set-and-map-in-detail": ["collections"],
  "collections--arraylist-and-a-custom-arraylist-implementation": ["arrayList"],
  "collections--linkedlist": ["doubly"],
  "collections--arraylist-vs-linkedlist-vs-vector-and-list-vs-set": ["arrayList", "doubly"],
  "collections--hashset-linkedhashset-and-treeset": ["setOrder"],
  "collections--hashmap-internals": ["hashMap"],
  "collections--linkedhashmap-and-treemap-hashmap-vs-linkedhashmap-vs-treemap": ["mapOrder", "maps"],
  "collections--hashmap-vs-hashtable": ["hashMap", "maps"],
  "collections--concurrenthashmap-segments-cas-and-hashmap-vs-concurrenthashmap": ["hashMap"],
  "collections--iterator-listiterator-and-enumeration": ["failFast"],
  "collections--fail-fast-fail-safe-and-concurrentmodificationexception": ["failFast"],
  "collections--collection-vs-collections": ["collections"],
  "collections--collection-framework-interview-questions": ["collections"],

  // Threads
  "threads--thread-life-cycle-and-thread-states": ["lifecycle"],
  "threads--sleep-join-yield-and-isalive": ["lifecycle"],
  "threads--wait-notify-and-notifyall": ["lifecycle"],
  "threads--deadlock-creation-detection-and-avoidance": ["deadlock"],
  "threads--thread-interview-questions": ["lifecycle"],

  // Java Data Structures: core lessons
  "data-structures--singly-linked-list-insert-delete-sorted-insert-and-objects": ["singly"],
  "data-structures--doubly-linked-list-insert-delete-and-sorted-insert": ["doubly"],
  "data-structures--linked-list-tricks-reverse-merge-intersection-and-cycles": ["reverse", "cycle"],
  "data-structures--stack-array-based-generic-and-a-stack-of-employee-objects": ["stack"],
  "data-structures--stack-and-queue-implemented-with-a-linked-list": ["singly", "stack", "queue"],
  "data-structures--queue-priority-queue-and-circular-queue": ["queue", "circular"],
  "data-structures--binary-tree-traversals-preorder-inorder-and-postorder": ["traversals"],

  // Java Data Structures: linked lists, stacks, queues, hash tables
  "java-linked-lists--nodes": ["singly"],
  "java-linked-lists--reverse": ["reverse"],
  "java-linked-lists--cycle": ["cycle"],
  "java-linked-lists--merge": ["singly"],
  "java-linked-lists--library-list": ["doubly"],
  "java-stacks--stack-api": ["stack"],
  "java-stacks--brackets": ["stack"],
  "java-stacks--monotonic-stack": ["stack"],
  "java-queues-deques--queue-api": ["queue"],
  "java-queues-deques--ring-buffer": ["circular"],
  "java-queues-deques--bfs": ["bfs"],
  "java-queues-deques--window": ["queue"],
  "java-queues-deques--blocking": ["queue"],
  "java-hash-tables--hash-contract": ["hashMap"],
  "java-hash-tables--map-api": ["hashMap", "mapOrder"],
  "java-hash-tables--two-sum": ["hashMap"],
  "java-hash-tables--prefix-map": ["hashMap"],
  "java-hash-tables--lru": ["hashMap", "doubly"],

  // Java Data Structures: trees and graphs
  "trees-in-java--model": ["traversals"],
  "trees-in-java--dfs": ["traversals"],
  "trees-in-java--levels": ["levels"],
  "trees-in-java--bst": ["bst"],
  "trees-in-java--balance": ["bst"],
  "trees-in-java--paths": ["traversals"],
  "trees-in-java--lca": ["bst"],
  "trees-in-java--codec": ["traversals"],
  "graph-networks-in-java--graph": ["graph"],
  "graph-networks-in-java--bfs": ["bfs"],
  "graph-networks-in-java--components": ["dfs"],
  "graph-networks-in-java--topo": ["dfs"],
  "graph-networks-in-java--bipartite": ["bfs"],
};

export const visualKeys = V;

export default function JavaVisuals({ slug }) {
  const keys = JAVA_VISUALS[slug];
  if (!keys) return null;
  return (
    <div className="jvStack">
      {keys.map((key) => {
        const Visual = V[key];
        return <Visual key={key} />;
      })}
    </div>
  );
}
