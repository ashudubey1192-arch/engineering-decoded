import { lesson } from "../../schema.js";

// Concurrency and parallelism interview questions, extra set Q141-Q150.
export default [
  lesson("Concurrency and Parallelism Q141-Q150: Building Concurrent Data Structures and Multithreaded Algorithms", {
    intro:
      "The final extra block asks you to **build** concurrent structures and algorithms rather than just use them:\n\n- a striped concurrent hash map and a two-lock blocking queue\n- a concurrent Bloom filter, a lock-free (Michael-Scott) queue and a concurrent priority queue\n- a thread-safe trie\n- multithreaded merge sort, a word-frequency counter, and concurrent BFS and DFS graph traversal\n\nEvery structure in the program is hammered by several threads and then checked against a simple sequential answer: same size, same order, same distances.",
    topics: [
      [
        "Q141. How would you design your own concurrent hash map?",
        "Start simple and improve step by step, explaining each trade-off:\n\n1. **One lock** around a HashMap: correct, but every operation is serialized.\n2. **Lock striping**: N independent segments (each a small hash map with its own lock), chosen by the key's hash. Operations on different stripes run in parallel. Spread the hash first (`h ^ (h >>> 16)`) so poor `hashCode`s still use all stripes. This is Java 7's ConcurrentHashMap design.\n3. **Whole-map operations** (`size`, `clear`, resize of everything) must lock all stripes **in index order** to avoid deadlock, or use per-stripe counters summed without locking (an estimate).\n4. **Per-bin locking with CAS** (Java 8): one table, CAS into empty bins, lock only the first node of a non-empty bin, lock-free volatile reads, and cooperative resizing. Far more concurrency, much more complex.\n5. **Atomic compound operations**: offer `putIfAbsent`, `compute` and `merge` that run under the stripe or bin lock, because callers cannot build them safely from get and put.\n\nIn the interview, implement version 2 and describe 4.",
      ],
      [
        "Q142. How would you build a bounded blocking queue with two locks?",
        "A one-lock queue (a lock with notFull and notEmpty conditions) is correct but makes producers and consumers contend. `LinkedBlockingQueue` uses **two locks**:\n\n1. A linked list with a **dummy head** node: producers only touch the **tail**, consumers only the **head**, so they work on different nodes.\n2. `putLock` with condition `notFull`, and `takeLock` with condition `notEmpty`.\n3. An `AtomicInteger count` shared by both sides; it is also what makes the new node's fields visible to the consumer (a happens-before edge through the atomic).\n4. `put`: under putLock, wait while full, link the node, `count.getAndIncrement()`; if there is still room, signal another producer. If the queue was **empty** before, take the takeLock briefly to signal `notEmpty`.\n5. `take` is the mirror image, signalling `notFull` when the queue was full.\n\nThe cascading signals (each side wakes the next of its own kind) avoid a `signalAll` storm. Producers and consumers now only meet on the count and the rare cross-signals.",
      ],
      [
        "Q143. How do you make a Bloom filter thread-safe?",
        "A Bloom filter answers \"definitely not present\" or \"maybe present\" using a bit array of size m and k hash functions: `add` sets k bits; `mightContain` checks that all k are set. False positives are possible, false negatives are not.\n\nThread safety is easy because bits only ever go from 0 to 1:\n\n1. Store the bits in an `AtomicLongArray` (64 bits per word).\n2. To set a bit, use a CAS loop or `accumulateAndGet(word, mask, (a, b) -> a | b)`, so two threads setting different bits in the same word do not overwrite each other. A plain `long[]` with `words[i] |= mask` would lose updates.\n3. `mightContain` uses plain atomic reads. A concurrent `add` may be only partly visible, which can produce a temporary false \"not present\" for an element still being added, which is acceptable because the add has not completed.\n4. Derive the k indexes from two base hashes (`h1 + i * h2`, Kirsch and Mitzenmacher), so you do not need k separate hash functions.\n\nSize it with m = -n ln(p) / (ln 2)^2 and k = (m / n) ln 2 for n elements and false-positive rate p. Guava's `BloomFilter` uses an AtomicLongArray this way.",
      ],
      [
        "Q144. How does the lock-free Michael-Scott queue work?",
        "The Michael-Scott queue (1996), the basis of `ConcurrentLinkedQueue`, is a linked list with a dummy node and two atomic references, **head** and **tail**.\n\n**Enqueue**, in a loop:\n\n1. Read `last = tail` and `next = last.next`.\n2. If `next` is null, try `CAS(last.next, null, node)`. On success, try to swing the tail with `CAS(tail, last, node)` and return. It does not matter if this second CAS fails.\n3. If `next` is **not** null, the tail is lagging behind (another enqueuer linked a node but has not moved the tail yet), so **help**: `CAS(tail, last, next)`, then retry.\n\n**Dequeue**: read head, tail and `head.next`. If the queue is empty (head == tail and next is null) return null; if the tail lags, help it; otherwise read `next.item` and `CAS(head, first, next)`. The old dummy is discarded and `next` becomes the new dummy.\n\nThe key idea is **helping**: no thread ever waits for another to finish its two-step update; it completes the update itself. That is what makes the queue lock-free.",
      ],
      [
        "Q145. How would you design a concurrent priority queue?",
        "Options, from simplest to most scalable:\n\n1. **A binary heap plus one lock** (and a `notEmpty` Condition for blocking take). This is `PriorityBlockingQueue`. Insert and remove are O(log n) but fully serialized; the heap root is a natural hot spot, because every `poll` touches it.\n2. **A skip list**: `ConcurrentSkipListSet` or `ConcurrentSkipListMap` with `pollFirst()`. It is lock-free, sorted and concurrent for inserts; removals of the minimum still contend at the front, and duplicates need a tie-breaker (wrap elements with a sequence number).\n3. **Relaxed priority queues** (for example the MultiQueue: several heaps, each with its own lock; insert into a random one, and poll the better of two random heads). They give much higher throughput by returning \"approximately the minimum\", acceptable for schedulers and graph algorithms.\n\nAlso mention that `PriorityBlockingQueue` is unbounded and that its iterator is **not** in priority order; only repeated `poll` or `take` yields sorted output. For delayed tasks, DelayQueue is a priority queue keyed by due time.",
      ],
      [
        "Q146. How do you build a thread-safe trie?",
        "A trie stores strings character by character, with each node holding its children and a flag marking the end of a word.\n\n1. **Children map**: a `ConcurrentHashMap<Character, Node>` per node. Insert walks down using `children.computeIfAbsent(c, k -> new Node())`, so two threads inserting the same new prefix create the node **once** and share it.\n2. **End-of-word flag**: a `volatile boolean`, or an `AtomicBoolean` with `compareAndSet(false, true)` if you need to count distinct words exactly (only the thread that flips it counts it).\n3. **Lookups** need no locks: they read concurrent maps and volatile flags.\n4. **Deletion** is the hard part: removing empty branches races with inserts that are about to use them. Options: never prune (just clear the flag), prune under a per-node lock, or use a global read-write lock where deletes are rare.\n\nAlternatives: a fixed `AtomicReferenceArray` of 26 children per node with CAS for lowercase words (faster, more memory), or copy-on-write for read-mostly dictionaries. Typical uses are autocomplete and prefix matching under concurrent updates.",
      ],
      [
        "Q147. How do you write a multithreaded merge sort?",
        "Merge sort is naturally divide and conquer, so it maps directly onto Fork/Join:\n\n1. `RecursiveAction` sorting the range `[from, to)` of an array, with a shared temporary buffer of the same size.\n2. If the range is below a **threshold** (say 8,192 elements), sort it sequentially (`Arrays.sort` on the range, or insertion sort for tiny ranges).\n3. Otherwise split at the middle and `invokeAll(left, right)`, which sorts both halves in parallel.\n4. **Merge** the two sorted halves through the buffer. The halves are disjoint, so no locking is needed: each task owns its range.\n\nThe span (critical path) is dominated by the final merge, which is sequential and O(n), so the speedup is limited (Amdahl again). Parallel merges (splitting the merge by binary search) reduce that. In practice `Arrays.parallelSort` does exactly this and should be your answer for production; writing it shows you understand thresholds, ownership of disjoint ranges and joining.",
      ],
      [
        "Q148. How do you count word frequencies across many files with multiple threads?",
        "Two classic designs:\n\n1. **Shared concurrent map**: workers process files in parallel and update one `ConcurrentHashMap<String, LongAdder>` with `map.computeIfAbsent(word, k -> new LongAdder()).increment()`. Simple; contention only on very hot words, and LongAdder absorbs most of that.\n2. **Map-reduce (thread-local maps)**: each worker counts into its **own** HashMap with no synchronization at all, and at the end the partial maps are **merged** (`total.merge(word, count, Long::sum)`). No contention during counting; the merge costs O(distinct words x workers). With streams: `lines.parallel().flatMap(split).collect(groupingByConcurrent(w -> w, counting()))`, or `groupingBy`, which merges per-thread maps.\n\nDiscuss the split granularity (by file, or by chunk for one huge file, careful not to cut a word in half), I/O vs CPU balance (reading may dominate, so overlap it with virtual threads or a reader thread feeding a queue), normalization (case, punctuation) and finding the top-k at the end with a heap of size k.",
      ],
      [
        "Q149. How do you run breadth-first search in parallel?",
        "BFS is processed **level by level**, which gives a natural parallel version (level-synchronous BFS):\n\n1. `frontier` = the nodes at distance d.\n2. Expand **all** frontier nodes in parallel (a parallel stream or invokeAll over chunks). For each neighbour, try to claim it atomically: `dist.compareAndSet(n, UNVISITED, d + 1)` on an `AtomicIntegerArray`, or `visited.add(n)` on a concurrent set. Only the winner adds it to the next frontier, so each node is discovered exactly once.\n3. Collect the next frontier and repeat; the end of each level is an implicit **barrier**.\n\nDistances are correct because all nodes at distance d are processed before any at d + 1. The cost is one synchronization per level, so it works best on graphs with wide frontiers (social networks, grids) and poorly on long chains. Alternatives for very large graphs are direction-optimizing BFS (switching to bottom-up search when the frontier is huge) and per-thread frontier buffers to reduce contention.",
      ],
      [
        "Q150. How do you traverse a graph with DFS in parallel?",
        "True depth-first **order** is inherently sequential, but many problems only need DFS-style **exploration** (reachability, connected components, crawling), which parallelizes well:\n\n1. A concurrent **visited set**; a node is processed only by the thread whose `visited.add(node)` returns true.\n2. Each node's unvisited neighbours become new tasks. A `CountedCompleter` is ideal: each task adds one to its pending count per forked child and calls `tryComplete()`, so nobody blocks in `join()` (no deep stacks of waiting joins) and the root completes exactly when the whole exploration has. Executor tasks with a Phaser or pending counter also work.\n3. Work stealing balances the irregular tree: idle workers steal large unexplored subtrees.\n4. Detect completion explicitly (the completer's pending counts, a Phaser or a counter). Relying on the pool looking idle, for example with `awaitQuiescence`, is fragile, because a task can be between forks at that moment.\n\nThe result (the set of reachable nodes, component ids) is deterministic even though the visiting order is not. Problems that depend on DFS order (topological sort by finish time, Tarjan's strongly connected components) need different parallel algorithms (Kahn's algorithm level by level, or forward-backward SCC).",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {

    // Q141: lock striping - 16 small maps, each with its own lock.
    static final class StripedMap<K, V> {
        private static final int STRIPES = 16;
        private final List<Map<K, V>> segments = new ArrayList<>();
        private final ReentrantLock[] locks = new ReentrantLock[STRIPES];
        StripedMap() { for (int i = 0; i < STRIPES; i++) { segments.add(new HashMap<>()); locks[i] = new ReentrantLock(); } }
        private int stripe(Object key) { int h = key.hashCode(); return (h ^ (h >>> 16)) & (STRIPES - 1); }
        V merge(K key, V value, BinaryOperator<V> fn) {
            int s = stripe(key);
            locks[s].lock();
            try { return segments.get(s).merge(key, value, fn); } finally { locks[s].unlock(); }
        }
        V get(K key) {
            int s = stripe(key);
            locks[s].lock();
            try { return segments.get(s).get(key); } finally { locks[s].unlock(); }
        }
        int size() {                                          // lock ALL stripes, always in index order
            for (ReentrantLock l : locks) l.lock();
            try { return segments.stream().mapToInt(Map::size).sum(); }
            finally { for (int i = STRIPES - 1; i >= 0; i--) locks[i].unlock(); }
        }
    }

    // Q142: LinkedBlockingQueue-style queue - producers use putLock, consumers takeLock.
    static final class TwoLockQueue<E> {
        private static final class Node<E> { E item; Node<E> next; Node(E item) { this.item = item; } }
        private final int capacity;
        private final AtomicInteger count = new AtomicInteger();
        private Node<E> head = new Node<>(null), tail = head;           // dummy head
        private final ReentrantLock putLock = new ReentrantLock(), takeLock = new ReentrantLock();
        private final Condition notFull = putLock.newCondition(), notEmpty = takeLock.newCondition();
        TwoLockQueue(int capacity) { this.capacity = capacity; }
        void put(E e) throws InterruptedException {
            int before;
            putLock.lockInterruptibly();
            try {
                while (count.get() == capacity) notFull.await();
                tail = tail.next = new Node<>(e);
                before = count.getAndIncrement();
                if (before + 1 < capacity) notFull.signal();           // cascade to the next producer
            } finally { putLock.unlock(); }
            if (before == 0) { takeLock.lock(); try { notEmpty.signal(); } finally { takeLock.unlock(); } }
        }
        E take() throws InterruptedException {
            E item;
            int before;
            takeLock.lockInterruptibly();
            try {
                while (count.get() == 0) notEmpty.await();
                Node<E> first = head.next;
                item = first.item;
                first.item = null;
                head = first;                                           // first becomes the new dummy
                before = count.getAndDecrement();
                if (before > 1) notEmpty.signal();
            } finally { takeLock.unlock(); }
            if (before == capacity) { putLock.lock(); try { notFull.signal(); } finally { putLock.unlock(); } }
            return item;
        }
    }

    // Q143: bits only go 0 -> 1, so an AtomicLongArray with OR-updates is enough.
    static final class ConcurrentBloomFilter {
        private final AtomicLongArray words;
        private final int bits, hashes;
        ConcurrentBloomFilter(int bits, int hashes) { this.words = new AtomicLongArray((bits + 63) / 64); this.bits = bits; this.hashes = hashes; }
        private int index(Object o, int i) {
            int h1 = o.hashCode() * 0x9E3779B9, h2 = Integer.rotateLeft(h1, 16) | 1;
            return Math.floorMod(h1 + i * h2, bits);
        }
        void add(Object o) {
            for (int i = 0; i < hashes; i++) {
                int b = index(o, i);
                words.accumulateAndGet(b >>> 6, 1L << (b & 63), (a, m) -> a | m);   // atomic OR
            }
        }
        boolean mightContain(Object o) {
            for (int i = 0; i < hashes; i++) { int b = index(o, i); if ((words.get(b >>> 6) & (1L << (b & 63))) == 0) return false; }
            return true;
        }
    }

    // Q144: Michael-Scott lock-free queue.
    static final class LockFreeQueue<E> {
        private static final class Node<E> { final E item; final AtomicReference<Node<E>> next = new AtomicReference<>(); Node(E item) { this.item = item; } }
        private final AtomicReference<Node<E>> head, tail;
        LockFreeQueue() { Node<E> dummy = new Node<>(null); head = new AtomicReference<>(dummy); tail = new AtomicReference<>(dummy); }
        void offer(E item) {
            Node<E> node = new Node<>(item);
            while (true) {
                Node<E> last = tail.get(), next = last.next.get();
                if (last != tail.get()) continue;                       // tail moved, re-read
                if (next == null) {
                    if (last.next.compareAndSet(null, node)) { tail.compareAndSet(last, node); return; }
                } else {
                    tail.compareAndSet(last, next);                     // help a lagging tail
                }
            }
        }
        E poll() {
            while (true) {
                Node<E> first = head.get(), last = tail.get(), next = first.next.get();
                if (first != head.get()) continue;
                if (first == last) {
                    if (next == null) return null;                      // empty
                    tail.compareAndSet(last, next);                     // help, then retry
                } else if (head.compareAndSet(first, next)) {
                    return next.item;                                   // next is the new dummy
                }
            }
        }
    }

    // Q146: trie with concurrent children and an atomic end-of-word flag.
    static final class Trie {
        static final class Node { final ConcurrentHashMap<Character, Node> kids = new ConcurrentHashMap<>(); final AtomicBoolean word = new AtomicBoolean(); }
        final Node root = new Node();
        final AtomicInteger words = new AtomicInteger();
        void insert(String w) {
            Node n = root;
            for (char c : w.toCharArray()) n = n.kids.computeIfAbsent(c, k -> new Node());
            if (n.word.compareAndSet(false, true)) words.incrementAndGet();      // count each word once
        }
        int countWithPrefix(String prefix) {
            Node n = root;
            for (char c : prefix.toCharArray()) { n = n.kids.get(c); if (n == null) return 0; }
            Deque<Node> stack = new ArrayDeque<>(List.of(n));
            int count = 0;
            while (!stack.isEmpty()) { Node x = stack.pop(); if (x.word.get()) count++; stack.addAll(x.kids.values()); }
            return count;
        }
    }

    // Q147: parallel merge sort on disjoint ranges.
    static final class MergeSort extends RecursiveAction {
        private final int[] a, buf;
        private final int from, to;
        MergeSort(int[] a, int[] buf, int from, int to) { this.a = a; this.buf = buf; this.from = from; this.to = to; }
        @Override protected void compute() {
            if (to - from <= 8_192) { Arrays.sort(a, from, to); return; }
            int mid = (from + to) >>> 1;
            invokeAll(new MergeSort(a, buf, from, mid), new MergeSort(a, buf, mid, to));
            System.arraycopy(a, from, buf, from, to - from);
            for (int i = from, l = from, r = mid; i < to; i++)
                a[i] = (r >= to || (l < mid && buf[l] <= buf[r])) ? buf[l++] : buf[r++];
        }
    }

    // Q150: a CountedCompleter forks children and never blocks in join; the root
    // completes only when every task forked below it has completed.
    static final class Explore extends CountedCompleter<Void> {
        private final int node; private final IntFunction<int[]> edges; private final Set<Integer> visited;
        Explore(CountedCompleter<?> parent, int node, IntFunction<int[]> edges, Set<Integer> visited) {
            super(parent); this.node = node; this.edges = edges; this.visited = visited;
        }
        @Override public void compute() {
            for (int next : edges.apply(node))
                if (visited.add(next)) {                          // only the winner explores it
                    addToPendingCount(1);
                    new Explore(this, next, edges, visited).fork();
                }
            tryComplete();                                        // done once all children are done
        }
    }

    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            // Q141
            StripedMap<String, Integer> striped = new StripedMap<>();
            List<Callable<Void>> writers = new ArrayList<>();
            for (int t = 0; t < 4; t++) writers.add(() -> { for (int i = 0; i < 1_000; i++) striped.merge("key-" + i, 1, Integer::sum); return null; });
            pool.invokeAll(writers);
            System.out.println("Q141 striped map: size = " + striped.size() + ", key-7 counted " + striped.get("key-7") + " times");

            // Q142: 2 producers, 2 consumers, capacity 4.
            TwoLockQueue<Integer> queue = new TwoLockQueue<>(4);
            AtomicLong sum = new AtomicLong();
            List<Callable<Void>> parties = new ArrayList<>();
            for (int p = 0; p < 2; p++) { int base = p * 1_000; parties.add(() -> { for (int i = 1; i <= 1_000; i++) queue.put(base + i); return null; }); }
            for (int c = 0; c < 2; c++) parties.add(() -> { for (int i = 0; i < 1_000; i++) sum.addAndGet(queue.take()); return null; });
            for (Future<Void> f : pool.invokeAll(parties)) f.get();
            System.out.println("Q142 two-lock queue moved 2000 items, sum = " + sum.get() + " (expected " + (2_001L * 1_000) + ")");

            // Q143
            ConcurrentBloomFilter bloom = new ConcurrentBloomFilter(32_768, 5);
            List<Callable<Void>> adders = new ArrayList<>();
            for (int t = 0; t < 4; t++) { int base = t * 500; adders.add(() -> { for (int i = 0; i < 500; i++) bloom.add("item-" + (base + i)); return null; }); }
            pool.invokeAll(adders);
            boolean noFalseNegatives = IntStream.range(0, 2_000).allMatch(i -> bloom.mightContain("item-" + i));
            long falsePositives = IntStream.range(0, 10_000).filter(i -> bloom.mightContain("other-" + i)).count();
            System.out.println("Q143 Bloom filter: no false negatives = " + noFalseNegatives + ", false-positive rate under 1% = " + (falsePositives < 100));

            // Q144: 4 producers and 4 consumers at the same time.
            LockFreeQueue<Integer> lockFree = new LockFreeQueue<>();
            Set<Integer> received = ConcurrentHashMap.newKeySet();
            AtomicInteger taken = new AtomicInteger();
            List<Callable<Void>> mixed = new ArrayList<>();
            for (int p = 0; p < 4; p++) { int base = p * 1_000; mixed.add(() -> { for (int i = 0; i < 1_000; i++) lockFree.offer(base + i); return null; }); }
            for (int c = 0; c < 4; c++) mixed.add(() -> {
                while (taken.get() < 4_000) { Integer x = lockFree.poll(); if (x != null) { received.add(x); taken.incrementAndGet(); } else Thread.onSpinWait(); }
                return null;
            });
            pool.invokeAll(mixed);
            System.out.println("Q144 Michael-Scott queue delivered " + received.size() + " distinct items, now empty: " + (lockFree.poll() == null));

            // Q145: concurrent inserts, then poll gives priority order.
            PriorityBlockingQueue<Integer> pq = new PriorityBlockingQueue<>();
            List<Callable<Void>> inserters = new ArrayList<>();
            for (int t = 0; t < 4; t++) { long seed = t; inserters.add(() -> { new Random(seed).ints(500, 0, 100_000).forEach(pq::add); return null; }); }
            pool.invokeAll(inserters);
            List<Integer> drained = new ArrayList<>();
            for (Integer x; (x = pq.poll()) != null; ) drained.add(x);
            boolean ordered = IntStream.range(1, drained.size()).allMatch(i -> drained.get(i - 1) <= drained.get(i));
            System.out.println("Q145 priority queue: " + drained.size() + " items polled in order: " + ordered);

            // Q146: 4 threads insert the same 300 words (with overlap).
            Trie trie = new Trie();
            List<Callable<Void>> trieTasks = new ArrayList<>();
            for (int t = 0; t < 4; t++) trieTasks.add(() -> { for (int i = 0; i < 300; i++) trie.insert((i % 3 == 0 ? "car" : i % 3 == 1 ? "cat" : "dog") + i); return null; });
            pool.invokeAll(trieTasks);
            System.out.println("Q146 trie: distinct words = " + trie.words.get() + ", with prefix 'car' = " + trie.countWithPrefix("car") + ", 'ca' = " + trie.countWithPrefix("ca"));

            // Q148: shared ConcurrentHashMap<String, LongAdder> vs per-thread maps merged at the end.
            String[] vocab = {"lock", "thread", "queue", "atomic", "future", "volatile"};
            Random rnd = new Random(42);
            List<String> lines = IntStream.range(0, 4_000)
                    .mapToObj(i -> IntStream.range(0, 6).mapToObj(j -> vocab[rnd.nextInt(vocab.length)]).collect(Collectors.joining(" ")))
                    .toList();
            ConcurrentHashMap<String, LongAdder> shared = new ConcurrentHashMap<>();
            List<Callable<Map<String, Long>>> chunks = new ArrayList<>();
            for (int t = 0; t < 4; t++) {
                List<String> part = lines.subList(t * 1_000, (t + 1) * 1_000);
                chunks.add(() -> {
                    Map<String, Long> local = new HashMap<>();                 // no locking at all
                    for (String line : part) for (String w : line.split(" ")) {
                        local.merge(w, 1L, Long::sum);
                        shared.computeIfAbsent(w, k -> new LongAdder()).increment();
                    }
                    return local;
                });
            }
            Map<String, Long> merged = new TreeMap<>();
            for (Future<Map<String, Long>> f : pool.invokeAll(chunks)) f.get().forEach((w, c) -> merged.merge(w, c, Long::sum));
            boolean same = merged.entrySet().stream().allMatch(e -> shared.get(e.getKey()).sum() == e.getValue());
            System.out.println("Q148 word counts " + merged + ", total " + merged.values().stream().mapToLong(Long::longValue).sum() + ", both designs agree: " + same);
        }

        // Q147
        int[] data = new Random(1).ints(200_000, 0, 1_000_000).toArray();
        int[] expected = data.clone();
        Arrays.sort(expected);
        try (ForkJoinPool fj = new ForkJoinPool(4)) { fj.invoke(new MergeSort(data, new int[data.length], 0, data.length)); }
        System.out.println("Q147 parallel merge sort of 200,000 ints matches Arrays.sort: " + Arrays.equals(data, expected));

        // Q149: level-synchronous BFS on a 60 x 60 grid with walls.
        int n = 60;
        IntPredicate open = c -> !(c % n == 30 && c / n != 10) && !(c / n == 20 && c % n < 50);
        IntFunction<int[]> grid = c -> IntStream.of(c - n, c + n, c % n == 0 ? -1 : c - 1, c % n == n - 1 ? -1 : c + 1)
                .filter(x -> x >= 0 && x < n * n && open.test(x)).toArray();
        AtomicIntegerArray dist = new AtomicIntegerArray(n * n);
        for (int i = 0; i < n * n; i++) dist.set(i, -1);
        dist.set(0, 0);
        List<Integer> frontier = List.of(0);
        int levels = 0;
        while (!frontier.isEmpty()) {
            int next = ++levels;
            frontier = frontier.parallelStream()
                    .flatMap(c -> Arrays.stream(grid.apply(c)).boxed())
                    .filter(x -> dist.compareAndSet(x, -1, next))          // claim each node once
                    .toList();
        }
        int[] seqDist = new int[n * n];
        Arrays.fill(seqDist, -1);
        seqDist[0] = 0;
        Deque<Integer> q = new ArrayDeque<>(List.of(0));
        while (!q.isEmpty()) { int c = q.poll(); for (int x : grid.apply(c)) if (seqDist[x] == -1) { seqDist[x] = seqDist[c] + 1; q.add(x); } }
        boolean sameDist = IntStream.range(0, n * n).allMatch(i -> dist.get(i) == seqDist[i]);
        System.out.println("Q149 parallel BFS distance to the far corner = " + dist.get(n * n - 1) + ", equals sequential BFS: " + sameDist);

        // Q150: parallel exploration of a 20,000-node graph, finished by quiescence.
        int nodes = 20_000;
        IntFunction<int[]> edges = p -> new int[] {(p * 2 + 1) % nodes, (p * 3 + 2) % nodes, (p + 7) % nodes};
        Set<Integer> reached = ConcurrentHashMap.newKeySet();
        reached.add(0);
        try (ForkJoinPool fj = new ForkJoinPool(4)) {
            fj.invoke(new Explore(null, 0, edges, reached));      // returns when the whole tree completed
        }
        BitSet seen = new BitSet(nodes);
        seen.set(0);
        Deque<Integer> stack = new ArrayDeque<>(List.of(0));
        while (!stack.isEmpty()) for (int x : edges.apply(stack.pop())) if (!seen.get(x)) { seen.set(x); stack.push(x); }
        System.out.println("Q150 parallel DFS reached " + reached.size() + " nodes, sequential DFS reached " + seen.cardinality());
    }
}`,
    walk:
      "Four threads merge 1,000 keys each into the striped map, so it holds 1,000 keys, each counted 4 times; `size()` locks all 16 stripes in index order. The two-lock queue moves 2,000 items through four slots between two producers and two consumers, and the sum matches 1 + ... + 2,000.\n\nThe Bloom filter receives 2,000 items from four threads with atomic OR updates: none is reported missing, and fewer than 1% of 10,000 unrelated strings are false positives. The Michael-Scott queue has four producers and four consumers running at the same time; all 4,000 items arrive exactly once and the queue ends empty. Two thousand random numbers inserted concurrently into a PriorityBlockingQueue come out sorted when polled.\n\nIn the trie, four threads insert the same 300 words; `computeIfAbsent` shares the nodes and the AtomicBoolean counts each word once (300 words, 100 starting with \"car\", 200 with \"ca\"). The word counter computes the same totals with a shared LongAdder map and with merged per-thread maps. Merge sort matches `Arrays.sort`. The level-synchronous BFS claims each grid cell with a CAS on its distance, and every distance matches a sequential BFS. Finally, the CountedCompleter exploration, which tracks pending children instead of joining them, reaches exactly the nodes that sequential DFS reaches.",
    anim: [
      "Michael-Scott queue: enqueue with helping",
      [
        ["t1", "Thread 1", "offer(A)"],
        ["t2", "Thread 2", "offer(B)"],
        ["last", "Last node", "tail points here"],
        ["a", "Node A", "new"],
        ["tail", "tail ref", "AtomicReference"],
      ],
      [
        ["t1", "last", "CAS next: A", "Thread 1 sees last.next == null and links node A with CAS(last.next, null, A)."],
        ["t2", "last", "next != null", "Before thread 1 moves the tail, thread 2 reads the same last node and finds its next already set."],
        ["t2", "tail", "help: tail = A", "Instead of waiting, thread 2 HELPS by swinging the tail to A with CAS, then retries."],
        ["t1", "tail", "CAS fails: ok", "Thread 1's own tail CAS now fails, which is harmless: the tail is already correct."],
        ["t2", "a", "CAS next: B", "Thread 2 links B after A. Nobody ever blocked, which is why the queue is lock-free."],
      ],
    ],
    mistakes: [
      "Locking stripes for `size()` in an arbitrary order, which can deadlock with another whole-map operation.",
      "Setting Bloom-filter bits with a plain `long[]` and `|=`, which loses concurrent updates to the same word.",
      "In a lock-free queue, waiting for another thread to finish updating the tail instead of helping it.",
      "Joining every child task in a parallel graph traversal, which builds deep stacks of blocked joins. Use a CountedCompleter or an explicit pending-task count.",
    ],
    qa: [
      [
        "Why does LinkedBlockingQueue keep a dummy head node?",
        "So producers and consumers never touch the same node: producers append after `tail`, consumers advance `head` to the first real node, which becomes the new dummy. The empty and one-element cases then need no special handling, and the two locks never protect the same fields.",
      ],
      [
        "Can a Bloom filter support deletion?",
        "Not a plain one, because clearing a bit could remove other elements. A counting Bloom filter keeps a small counter per position (an AtomicIntegerArray), incremented on add and decremented on remove, at several times the memory.",
      ],
      [
        "Is parallel BFS always faster than sequential BFS?",
        "No. Each level ends in a synchronization step, and the CAS per node adds overhead. Narrow graphs (long chains) have tiny frontiers and no parallelism; wide graphs with millions of nodes per level benefit most.",
      ],
    ],
    ex: [
      "Add `remove(K key)` and `computeIfAbsent(K key, Function<K, V> fn)` to the striped map, and explain why computeIfAbsent must not be written as get followed by put.",
      "Both lock the key's stripe: `remove` calls `segments.get(s).remove(key)`; `computeIfAbsent` calls `segments.get(s).computeIfAbsent(key, fn)` while holding the stripe lock. Writing it as `if (get(k) == null) put(k, fn.apply(k))` takes the lock twice, so two threads can both see null and both create values: a check-then-act race. Keep `fn` short, because it runs under the stripe lock.",
    ],
  }),
];
