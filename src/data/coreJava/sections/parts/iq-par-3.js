import { lesson } from "../../schema.js";

// Top 100 concurrency and parallelism interview questions, Q61-Q80.
export default [
  lesson("Concurrency and Parallelism Q61-Q70: ConcurrentHashMap, Copy-on-Write, Blocking Queues and Synchronizers", {
    intro:
      "The seventh block covers the **ready-made thread-safe building blocks** in java.util.concurrent:\n\n- ConcurrentHashMap internals, its atomic compound methods, and how it compares with Hashtable and synchronizedMap\n- weakly consistent iterators and CopyOnWriteArrayList\n- the BlockingQueue family, non-blocking queues and ConcurrentSkipListMap\n- CountDownLatch vs CyclicBarrier vs Phaser, Semaphore and Exchanger\n\nThe program counts words from four threads with `merge`, modifies a map while iterating it, hands items through a SynchronousQueue, orders tasks in a PriorityBlockingQueue, and runs a CyclicBarrier for three generations.",
    topics: [
      [
        "Q61. How does ConcurrentHashMap work internally in Java 8 and later?",
        "Java 8 replaced Java 7's 16 **segments** with a finer design:\n\n1. One table of **bins** (`Node[]`), sized as a power of two.\n2. **Reads take no lock**: `get` reads volatile table slots and node fields, so readers never block.\n3. **Inserting into an empty bin** uses a single **CAS**, with no lock.\n4. **Updating a non-empty bin** locks only that bin's **first node** with `synchronized`, so writers to different bins run in parallel.\n5. A bin with 8 or more nodes (in a table of at least 64) becomes a red-black **TreeBin**, so lookups in a bad-hash bin are O(log n).\n6. **Resizing is cooperative**: threads that touch the map during a resize help move bins, marked by `ForwardingNode`s.\n7. `size()` uses a LongAdder-style `baseCount` plus `CounterCell`s, so counting does not become a hot spot.\n\nThe result: very high read concurrency and write concurrency proportional to the number of bins.",
      ],
      [
        "Q62. Why are compute, merge and computeIfAbsent important on ConcurrentHashMap?",
        "Each individual call on ConcurrentHashMap is thread-safe, but **sequences** of calls are not. `Integer c = map.get(word); map.put(word, c == null ? 1 : c + 1);` is a read-modify-write race: two threads read 3 and both write 4.\n\nThe compound methods run the whole update **atomically for that key** (under the bin lock):\n\n- `merge(word, 1, Integer::sum)` for counting\n- `computeIfAbsent(key, k -> new ArrayList<>())` for lazy creation of a value, such as a multimap\n- `compute(key, (k, v) -> ...)` for arbitrary updates (return null to remove)\n- `putIfAbsent` and `replace(key, old, new)` for CAS-style updates\n\nRules: keep the function **short and side-effect free**, and never modify **other keys of the same map** inside it, which can deadlock or throw IllegalStateException (\"Recursive update\"). For heavy counting, `map.computeIfAbsent(k, x -> new LongAdder()).increment()` scales even better.",
        "counts.merge(word, 1, Integer::sum);\nindex.computeIfAbsent(letter, k -> new CopyOnWriteArrayList<>()).add(word);",
      ],
      [
        "Q63. What are the differences between Hashtable, Collections.synchronizedMap and ConcurrentHashMap?",
        "- **Locking**: Hashtable and synchronizedMap lock the **whole map** for every operation, including reads, so one thread works at a time. ConcurrentHashMap uses lock-free reads and per-bin locks.\n- **Iteration**: with Hashtable and synchronizedMap, iterators are **fail-fast**, and you must hold the map's lock manually while iterating (`synchronized (map) { for ... }`), or risk ConcurrentModificationException. ConcurrentHashMap iterators are **weakly consistent**: they never throw CME and need no lock.\n- **Nulls**: Hashtable and ConcurrentHashMap reject null keys and values; synchronizedMap allows whatever the backing map allows.\n- **Atomic compound operations**: ConcurrentHashMap has an efficient `merge`, `compute` and `computeIfAbsent`; synchronizedMap's defaults lock the whole map.\n- **Extras**: ConcurrentHashMap offers parallel bulk operations (`forEach`, `reduce` and `search` with a parallelism threshold) and `mappingCount()`.\n\nHashtable is a legacy class; use ConcurrentHashMap for shared maps.",
      ],
      [
        "Q64. What does weakly consistent iteration mean, and why does ConcurrentHashMap forbid null?",
        "A **weakly consistent** iterator, used by ConcurrentHashMap and the other concurrent collections:\n\n- never throws ConcurrentModificationException\n- traverses elements as they existed when the iterator was created, **may or may not** reflect later modifications, and never returns the same element twice\n- can be used while other threads modify the collection\n\nSo a sum over a live map is an approximation under concurrent writes, and `size()` is a moment-in-time estimate.\n\n**Nulls are banned** because of ambiguity in a concurrent setting. With a HashMap, if `get(k)` returns null you can call `containsKey(k)` to tell \"absent\" from \"mapped to null\". In a concurrent map, another thread may change the map between those two calls, so the answer would be unreliable. Banning null makes `get()` returning null mean only \"absent\", and lets the implementation use null internally as a marker.",
      ],
      [
        "Q65. How does CopyOnWriteArrayList work, and when should you use it?",
        "CopyOnWriteArrayList keeps a **volatile reference to an array**:\n\n- **reads and iteration** use the current array without any lock\n- **every write** (add, set, remove) takes a lock, **copies the whole array**, modifies the copy and swaps the reference\n- **iterators** work on the **snapshot** that existed when they were created, so they never throw CME and never see later changes; `iterator.remove()` is unsupported\n\nThat makes writes O(n) in time and memory, but reads are as fast as an array. It suits collections that are **read very often and changed rarely**: listener or observer lists, configuration, routing tables. It is a bad fit for frequently modified or large lists. `CopyOnWriteArraySet` is the set equivalent (with O(n) contains). For a large shared list with many writes, use `Collections.synchronizedList` with external locking, or a concurrent queue or deque.",
      ],
      [
        "Q66. What are the main BlockingQueue implementations?",
        "BlockingQueue adds **blocking** `put` and `take`, **timed** `offer` and `poll`, and capacity limits to Queue. Implementations:\n\n- **ArrayBlockingQueue**: bounded, array-backed, a single lock, optional fairness.\n- **LinkedBlockingQueue**: optionally bounded, linked nodes, **two locks** (put and take), so producers and consumers do not contend.\n- **LinkedBlockingDeque**: a double-ended version, useful for work stealing.\n- **PriorityBlockingQueue**: unbounded, ordered by a Comparator, so `take()` returns the smallest element.\n- **DelayQueue**: unbounded; elements implement `Delayed` and become available only when their delay expires (retry and timeout scheduling).\n- **SynchronousQueue**: **no capacity**; each `put` waits for a `take`, a pure hand-off.\n- **LinkedTransferQueue**: unbounded, with `transfer(e)`, which waits until a consumer receives the element; the fastest general-purpose queue.\n\nMethod families: `add` and `remove` throw; `offer` and `poll` return a special value; `put` and `take` block; timed `offer` and `poll` wait.",
      ],
      [
        "Q67. What are ConcurrentLinkedQueue and ConcurrentLinkedDeque?",
        "They are **unbounded, non-blocking, lock-free** queues based on CAS, using the Michael-Scott algorithm for the queue.\n\n- `offer` never blocks and always succeeds.\n- `poll` returns **null** when empty, instead of waiting.\n- Iterators are weakly consistent.\n- `size()` is **O(n)** and only an estimate, so prefer `isEmpty()`.\n\nUse them when many threads add and remove and you do **not** want consumers to sleep: event buses where consumers poll in a loop that also does other work, or as building blocks for other structures. Use a BlockingQueue when consumers should **wait** for work (classic producer-consumer), because spinning on `poll()` returning null wastes CPU. Neither has capacity limits, so add back-pressure yourself if producers can outrun consumers.",
      ],
      [
        "Q68. What is ConcurrentSkipListMap, and when do you need it?",
        "It is the concurrent equivalent of **TreeMap**: a **sorted** NavigableMap implemented as a lock-free **skip list**, a linked list with several \"express lane\" levels chosen at random, giving expected O(log n) operations.\n\nYou need it when you require **ordering plus concurrency**:\n\n- range queries: `headMap`, `tailMap`, `subMap`\n- nearest-key lookups: `ceilingKey`, `floorEntry`, `firstKey`, `pollFirstEntry`\n- leaderboards, order books, time-indexed events, schedulers\n\nCompared with ConcurrentHashMap, it is slower for plain get and put (O(log n) and more memory per entry), but CHM has no ordering. Compared with `Collections.synchronizedSortedMap(new TreeMap<>())`, it scales without a global lock. `ConcurrentSkipListSet` is the sorted concurrent set.",
      ],
      [
        "Q69. Compare CountDownLatch, CyclicBarrier and Phaser.",
        "- **CountDownLatch(n)**: threads call `countDown()`, and waiters in `await()` are released when the count reaches **zero**. It is **one-shot** (it cannot be reset), and the threads counting down do not wait themselves. Typical use: \"start when the 3 services are ready\" or \"wait for N tasks to finish\".\n- **CyclicBarrier(n, action)**: n **parties** each call `await()` and all wait until the last one arrives; then the optional **barrier action** runs and the barrier **resets** for the next round. If one party is interrupted or times out, the barrier is **broken** for everyone (BrokenBarrierException). Typical use: iterative parallel algorithms where each phase must finish before the next.\n- **Phaser**: a reusable barrier with a **dynamic** number of parties (`register`, `arriveAndDeregister`), numbered **phases**, non-waiting arrival (`arrive`), tiering for many parties, and an `onAdvance` hook to end it.\n\nRule of thumb: one-time event, use a latch; a fixed team in repeated rounds, use CyclicBarrier; a changing team or many phases, use Phaser.",
      ],
      [
        "Q70. What are Semaphore and Exchanger used for?",
        "**Semaphore(permits)** limits **how many** threads can do something at once:\n\n- bounding access to a resource pool (10 DB connections, 5 concurrent downloads)\n- limiting in-flight requests to a downstream service (a bulkhead), especially with virtual threads, where you no longer limit the threads themselves\n- a simple rate gate with `tryAcquire(timeout)`\n\nPermits have no owner, so always release in finally, and only after a successful acquire.\n\n**Exchanger<V>** is a meeting point for exactly **two** threads: each calls `exchange(myObject)` and receives the other's object. The classic use is **double buffering**: a producer fills buffer A while a consumer drains buffer B, then they swap, so no allocation or copying happens. It is rare in practice, but a favourite interview question to check that you know the whole package.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    record Job(int priority, String name) { }

    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            // Q61 + Q62: four threads count words with ONE atomic merge per word.
            ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
            ConcurrentHashMap<Character, List<String>> byLetter = new ConcurrentHashMap<>();
            String text = "to be or not to be that is the question";
            List<Callable<Void>> counters = new ArrayList<>();
            for (int t = 0; t < 4; t++) counters.add(() -> {
                for (String word : text.split(" ")) {
                    counts.merge(word, 1, Integer::sum);
                    byLetter.computeIfAbsent(word.charAt(0), k -> new CopyOnWriteArrayList<>()).add(word);
                }
                return null;
            });
            pool.invokeAll(counters);
            System.out.println("Q62 merge counts (4 threads): to=" + counts.get("to") + " be=" + counts.get("be") + " question=" + counts.get("question"));
            System.out.println("Q62 computeIfAbsent built one list per letter, 't' has " + byLetter.get('t').size() + " words");

            // Q63 + Q64: modify a CHM while iterating it - no ConcurrentModificationException.
            ConcurrentHashMap<Integer, String> live = new ConcurrentHashMap<>(Map.of(1, "a", 2, "b", 3, "c"));
            for (Integer key : live.keySet()) if (key == 1) live.put(99, "added during iteration");
            boolean nullRejected;
            try { live.put(4, null); nullRejected = false; } catch (NullPointerException e) { nullRejected = true; }
            System.out.println("Q64 iterated while adding, size now " + live.size() + "; null value rejected: " + nullRejected);
            Map<Integer, String> plain = new HashMap<>(Map.of(1, "a", 2, "b"));
            try { for (Integer key : plain.keySet()) plain.put(key + 10, "x"); }
            catch (ConcurrentModificationException e) { System.out.println("Q63 plain HashMap iterator is fail-fast: ConcurrentModificationException"); }

            // Q65: a copy-on-write iterator sees the snapshot from its creation.
            CopyOnWriteArrayList<String> listeners = new CopyOnWriteArrayList<>(List.of("audit", "metrics"));
            Iterator<String> snapshot = listeners.iterator();
            listeners.add("alerts");
            List<String> seen = new ArrayList<>();
            snapshot.forEachRemaining(seen::add);
            System.out.println("Q65 snapshot iterator saw " + seen + ", list now " + listeners);

            // Q66: SynchronousQueue - every put waits for a take.
            SynchronousQueue<String> handoff = new SynchronousQueue<>();
            Future<?> producer = pool.submit(() -> { handoff.put("parcel-1"); handoff.put("parcel-2"); return null; });
            System.out.println("Q66 SynchronousQueue handed over " + handoff.take() + " then " + handoff.take() + " (size is always " + handoff.size() + ")");
            producer.get();

            // Q66: PriorityBlockingQueue orders by priority, not by insertion.
            PriorityBlockingQueue<Job> jobs = new PriorityBlockingQueue<>(4, Comparator.comparingInt(Job::priority));
            jobs.put(new Job(3, "report")); jobs.put(new Job(1, "payment")); jobs.put(new Job(2, "email"));
            System.out.println("Q66 priority order: " + jobs.take().name() + ", " + jobs.take().name() + ", " + jobs.take().name());

            // Q67: non-blocking poll returns null instead of waiting.
            ConcurrentLinkedQueue<Integer> events = new ConcurrentLinkedQueue<>(List.of(7));
            System.out.println("Q67 ConcurrentLinkedQueue poll: " + events.poll() + ", then " + events.poll());

            // Q68: sorted and concurrent.
            ConcurrentSkipListMap<Integer, String> board = new ConcurrentSkipListMap<>(Map.of(120, "ana", 95, "ben", 150, "cy"));
            System.out.println("Q68 skip-list first " + board.firstKey() + ", ceiling(100) = " + board.ceilingKey(100) + ", top scorer " + board.lastEntry().getValue());

            // Q69: CyclicBarrier with a barrier action, reused for 3 generations.
            AtomicInteger generations = new AtomicInteger();
            CyclicBarrier barrier = new CyclicBarrier(3, generations::incrementAndGet);
            List<Callable<Void>> parties = new ArrayList<>();
            for (int p = 0; p < 3; p++) parties.add(() -> { for (int round = 0; round < 3; round++) barrier.await(); return null; });
            pool.invokeAll(parties);
            CountDownLatch ready = new CountDownLatch(2);
            pool.submit(ready::countDown); pool.submit(ready::countDown);
            System.out.println("Q69 CyclicBarrier tripped " + generations.get() + " times; latch released: " + ready.await(1, TimeUnit.SECONDS) + " (count " + ready.getCount() + ")");

            // Q70: Exchanger swaps buffers between exactly two threads.
            Exchanger<String> exchanger = new Exchanger<>();
            Future<String> other = pool.submit(() -> exchanger.exchange("full buffer"));
            String mine = exchanger.exchange("empty buffer");
            System.out.println("Q70 main received '" + mine + "', other thread received '" + other.get() + "'");
        }
    }
}`,
    walk:
      "Four threads count the same sentence, so every word is counted four times: `to` and `be` appear twice in the sentence, giving 8, and `question` gives 4. No update is lost, because `merge` does the read-modify-write atomically inside the bin. `computeIfAbsent` creates exactly one list per first letter, and the 't' list collects 4 words per pass (to, to, that, the), 16 in total.\n\nAdding key 99 while iterating a ConcurrentHashMap is allowed (weakly consistent iteration), and null values are rejected with NullPointerException. The same pattern on a HashMap throws ConcurrentModificationException. The CopyOnWriteArrayList iterator, created before `alerts` was added, still sees only the two original listeners.\n\nThe SynchronousQueue holds nothing (`size()` is always 0), so each `put` on the producer thread waits until main takes. The PriorityBlockingQueue returns payment, email, report by priority, and the ConcurrentLinkedQueue returns 7 and then null without blocking. The CyclicBarrier action runs once per round, 3 times in total, and the Exchanger swaps the two buffers.",
    anim: [
      "ConcurrentHashMap: CAS for empty bins, a bin lock for the rest",
      [
        ["t1", "Thread 1", "merge(\"to\")"],
        ["t2", "Thread 2", "merge(\"be\")"],
        ["bin1", "Bin 3", "empty"],
        ["bin2", "Bin 7", "has nodes"],
        ["r", "Reader", "get(): no lock"],
      ],
      [
        ["t1", "bin1", "CAS new node", "Thread 1's key hashes to an empty bin, so a single CAS installs the node with no lock."],
        ["t2", "bin2", "lock head node", "Thread 2's bin already has nodes, so it locks only that bin's first node and updates it."],
        ["t1", "bin2", "waits (same bin)", "A second update to bin 7 would wait, but writes to all other bins continue in parallel."],
        ["r", "bin1", "volatile read", "Readers never lock: they read volatile table slots and see completed updates."],
        ["bin2", "r", "unlock, visible", "Thread 2 releases the bin lock; the new count is visible to every later get()."],
      ],
    ],
    mistakes: [
      "Doing `get` then `put` on a ConcurrentHashMap. Use `merge`, `compute` or `computeIfAbsent`.",
      "Iterating a `Collections.synchronizedList` without `synchronized (list)` around the loop.",
      "Using CopyOnWriteArrayList for a list that changes frequently; every write copies the array.",
      "Spinning on `ConcurrentLinkedQueue.poll()` while waiting for work. Use a BlockingQueue's `take()`.",
    ],
    qa: [
      [
        "Is ConcurrentHashMap.size() exact?",
        "It is exact when no updates are in flight, and otherwise a moment-in-time estimate, because counter cells are summed without a lock. For large maps, use `mappingCount()`, which returns a long.",
      ],
      [
        "Can a CountDownLatch be reused?",
        "No. Once the count reaches zero it stays open, and later `await()` calls return immediately. Use a CyclicBarrier or Phaser for repeated rounds, or create a new latch.",
      ],
      [
        "Why does LinkedBlockingQueue usually beat ArrayBlockingQueue under producer-consumer load?",
        "It uses separate put and take locks, so a producer and a consumer can work at the same time. ArrayBlockingQueue uses one lock for both ends, though it allocates no nodes and can be more predictable.",
      ],
    ],
    ex: [
      "Build a thread-safe multimap `Map<String, List<String>>` where many threads add values to the same key concurrently, without a global lock.",
      "Use `ConcurrentHashMap<String, List<String>> map` and `map.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>()).add(value);` (or `Collections.synchronizedList(new ArrayList<>())` if writes are frequent). `computeIfAbsent` creates exactly one list per key, and the list itself is thread-safe for the adds. A plain ArrayList value would race.",
    ],
  }),

  lesson("Concurrency and Parallelism Q71-Q80: Fork/Join, Work Stealing, Parallel Streams and Their Pitfalls", {
    intro:
      "The eighth block turns from coordination to **parallelism**: using every core to finish one big job sooner.\n\n- the Fork/Join framework, RecursiveTask, RecursiveAction and CountedCompleter\n- work stealing and the common pool\n- how parallel streams split work with a Spliterator, and when they make things slower\n- reduction rules (identity, associativity, combiner) and ordering\n- running a parallel stream in a custom pool, and the parallel array methods\n\nThe program sums an array with a RecursiveTask, doubles one in place with a RecursiveAction, shows a parallel stream giving the wrong answer with a bad identity, and runs a stream inside its own ForkJoinPool.",
    topics: [
      [
        "Q71. What is the Fork/Join framework?",
        "Fork/Join (Java 7, JSR-166y) is an executor designed for **divide-and-conquer** parallelism:\n\n1. If the problem is small (below a **threshold**), solve it directly.\n2. Otherwise **split** it into sub-tasks, `fork()` one or more of them (schedule them asynchronously), compute one yourself, and `join()` the others.\n3. **Combine** the partial results.\n\nThe pieces are `ForkJoinPool` (the executor, with work-stealing worker threads), `ForkJoinTask` and its subclasses, and `ForkJoinPool.commonPool()`, a shared static pool. `join()` is cheaper than `Future.get()`: a worker waiting on a join does not simply block but **helps**, running other queued tasks meanwhile, so few threads can handle a deep recursion tree. It is meant for CPU-bound, non-blocking work; parallel streams, `Arrays.parallelSort` and (by default) `CompletableFuture.supplyAsync` all use it.",
      ],
      [
        "Q72. What is the difference between RecursiveTask, RecursiveAction and CountedCompleter?",
        "- `RecursiveTask<V>`: `compute()` **returns a value** (sum, max, count). Combine children's results after `join()`.\n- `RecursiveAction`: `compute()` returns **nothing**; for in-place work such as sorting or transforming an array, or rendering image tiles.\n- `CountedCompleter<T>`: completion is driven by a **pending count**. A task does not wait for its children; when the last child completes, it triggers the parent's `onCompletion`. This avoids blocked joins entirely and suits irregular trees and traversals; parallel streams use it internally.\n\nThe idiom for the first two is: `left.fork(); rightResult = right.compute(); leftResult = left.join();`, or `invokeAll(left, right)`. Compute one half on the current thread instead of forking both; forking both and joining both wastes the current thread.",
        "left.fork();                    // queue the left half\nlong r = right.compute();       // do the right half here\nlong l = left.join();           // then wait for (or steal back) the left\nreturn l + r;",
      ],
      [
        "Q73. How does work stealing work?",
        "Each ForkJoinPool worker has its own **double-ended queue** (deque) of tasks.\n\n1. A worker **pushes** tasks it forks onto the **head** of its own deque and **pops** from the head: LIFO order, which works on the newest, smallest and cache-hot sub-task.\n2. A worker with an empty deque becomes a **thief**: it picks another worker at random and **steals from the tail** (FIFO end), taking the **oldest** task, which is usually the **largest** remaining chunk of work.\n3. Owners and thieves work at opposite ends, so they rarely contend; the steal uses a CAS.\n\nThe benefits are automatic load balancing (a worker that finishes early finds more work), few synchronization points, and good locality. It is why Fork/Join handles uneven sub-problems better than a fixed split into N chunks on a plain thread pool.",
      ],
      [
        "Q74. What is the common pool, and how big is it?",
        "`ForkJoinPool.commonPool()` is a static, lazily created pool shared by the **whole JVM**: parallel streams, `Arrays.parallelSort`, `CompletableFuture.*Async` methods without an executor, and any `ForkJoinTask.invoke()` from outside a pool.\n\n- Its parallelism defaults to **availableProcessors() - 1**, because the calling thread also does work in a parallel stream.\n- Change it with `-Djava.util.concurrent.ForkJoinPool.common.parallelism=N`, which is read once at startup.\n- Its threads are **daemon** threads.\n\nThe big risk is that it is **shared**: one library running blocking I/O or long tasks in it (through parallel streams or `supplyAsync`) starves every other user. Keep it for short, CPU-bound work, and give blocking or long work its own executor. `ForkJoinPool.managedBlock` can compensate for unavoidable blocking.",
      ],
      [
        "Q75. How do parallel streams work under the hood?",
        "Calling `.parallel()` or `collection.parallelStream()` sets a flag; nothing happens until the terminal operation.\n\n1. The source's **Spliterator** is split recursively with `trySplit()` into about `4 * parallelism` leaf chunks. ArrayList, arrays and `IntStream.range` split perfectly in half; LinkedList and `Stream.iterate` split badly.\n2. Each leaf runs the **whole pipeline** (filter, map and so on) on its chunk as a ForkJoinTask in the common pool, with the calling thread taking part.\n3. Partial results are **combined** up the tree: the reduce combiner, or the collector's `combiner()`.\n\nSpliterator characteristics matter: SIZED and SUBSIZED allow even splits and pre-sized arrays, and ORDERED forces ordered combining. Stateless operations parallelize well; stateful ones (`sorted`, `distinct`, `limit` on ordered streams) need buffering or coordination and can be slow.",
      ],
      [
        "Q76. When does a parallel stream make code slower, or wrong?",
        "**Slower** when:\n\n- the data is **small** (thousands of elements) or the per-element work is cheap, so splitting and merging cost more than they save (Brian Goetz's rule of thumb: N * Q > 10,000, where Q is the cost per element)\n- the source **splits badly**: LinkedList, `Stream.iterate`, `BufferedReader.lines()`\n- elements are **boxed** (`Stream<Integer>` instead of `IntStream`), adding memory traffic\n- the pipeline has ordered stateful operations: `limit`, `skip`, `findFirst` or `sorted` on an ordered stream\n- the work **blocks** (I/O or locks), which starves the shared common pool\n- the merge is expensive (`Collectors.groupingBy` into a TreeMap); prefer `groupingByConcurrent`\n\n**Wrong** when lambdas mutate **shared state** (`forEach(list::add)` on an ArrayList loses elements or throws), or the reduction is not associative. Always measure with JMH before parallelizing.",
      ],
      [
        "Q77. What rules must a parallel reduction follow?",
        "For `reduce(identity, accumulator, combiner)` or a custom Collector to give the same answer in parallel as sequentially:\n\n1. **Identity** must be neutral: `combiner(identity, x) == x`. That means 0 for sum, 1 for product, an empty string or list. Each leaf chunk starts from the identity, so `reduce(10, Integer::sum)` adds 10 **once per chunk**.\n2. The accumulator and combiner must be **associative**: `(a op b) op c == a op (b op c)`. Subtraction and averaging pairwise are not associative.\n3. Functions must be **non-interfering** (do not modify the source) and **stateless** (no shared mutable state).\n4. The combiner must be **compatible** with the accumulator: `combiner(u, accumulator(identity, t)) == accumulator(u, t)`.\n\nFor mutable containers, use `collect` (each chunk gets its own container, and combining merges them), never `reduce` with a shared ArrayList.",
      ],
      [
        "Q78. How do ordering, forEach vs forEachOrdered and findAny vs findFirst behave in parallel?",
        "Streams from Lists, arrays and ranges are **ORDERED** (encounter order); those from HashSet are not.\n\n- `forEach` in parallel runs actions in **any order** on any thread. `forEachOrdered` respects encounter order, at the cost of buffering and waiting.\n- `findFirst` must return the element that comes first in encounter order, so it may wait for earlier chunks. `findAny` returns **whichever** match a thread finds first, which is faster but non-deterministic.\n- `collect(toList())` and `toList()` still produce the elements **in encounter order** even in parallel: the chunks are combined in order.\n- `limit(n)` and `skip(n)` on ordered parallel streams are expensive; `.unordered()` relaxes them when you do not care which n elements you get.\n\nSo the rule is: parallel does not break the order of **results** that are defined by order, but side effects such as printing happen in arbitrary order.",
      ],
      [
        "Q79. How do you run a parallel stream in a custom ForkJoinPool, and why would you?",
        "A parallel stream's tasks run in the ForkJoinPool **of the thread that starts the terminal operation**. If that thread is a worker of a custom pool, the stream uses that pool: submit a lambda that runs the whole stream to `new ForkJoinPool(4)` and call `get()` on the result.\n\nWhy: to **isolate** a heavy or blocking job so it cannot starve the common pool, or to give it a different level of parallelism. Caveats: this is an implementation behaviour that the API does not promise (though it has been stable since Java 8); some operations still use the common pool; and you must shut the custom pool down. For I/O-bound fan-out, CompletableFuture with an explicit executor, or virtual threads, is clearer than a parallel stream.",
        "try (ForkJoinPool pool = new ForkJoinPool(4)) {\n    long n = pool.submit(() -> list.parallelStream().filter(x -> x > 0).count()).get();\n}",
      ],
      [
        "Q80. What do Arrays.parallelSort, parallelPrefix and parallelSetAll do?",
        "Java 8 added parallel array operations that run on the common pool:\n\n- `Arrays.parallelSort(array)`: a parallel merge sort that splits the array, sorts the pieces in parallel (with DualPivotQuicksort) and merges them. It falls back to a sequential sort below 8,192 elements (the MIN_ARRAY_SORT_GRAN), and is faster than `Arrays.sort` for large arrays on multi-core machines.\n- `Arrays.parallelPrefix(array, op)`: replaces each element with the **cumulative** result of `op` over all elements up to it (a prefix sum or scan), computed in parallel in O(log n) span. `op` must be associative.\n- `Arrays.parallelSetAll(array, i -> f(i))`: fills each index from a function of the index, in parallel. The function must not depend on other elements.\n\nPrefix sums are a classic building block of parallel algorithms (stream compaction, radix sort and range queries), and interviewers like to ask how a scan can be parallel at all: it runs an up-sweep and a down-sweep over a tree.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {

    // Q71 + Q72: RecursiveTask returns a value.
    static final class SumTask extends RecursiveTask<Long> {
        static final int THRESHOLD = 10_000;
        private final long[] data;
        private final int from, to;
        SumTask(long[] data, int from, int to) { this.data = data; this.from = from; this.to = to; }
        @Override protected Long compute() {
            if (to - from <= THRESHOLD) {                          // small enough: solve directly
                long sum = 0;
                for (int i = from; i < to; i++) sum += data[i];
                return sum;
            }
            int mid = (from + to) >>> 1;
            SumTask left = new SumTask(data, from, mid), right = new SumTask(data, mid, to);
            left.fork();                                            // push left onto this worker's deque
            long rightSum = right.compute();                        // do the right half ourselves
            return left.join() + rightSum;                          // join (or run it if nobody stole it)
        }
    }

    // Q72: RecursiveAction works in place and returns nothing.
    static final class DoubleAll extends RecursiveAction {
        private final long[] data;
        private final int from, to;
        DoubleAll(long[] data, int from, int to) { this.data = data; this.from = from; this.to = to; }
        @Override protected void compute() {
            if (to - from <= 5_000) { for (int i = from; i < to; i++) data[i] *= 2; return; }
            int mid = (from + to) >>> 1;
            invokeAll(new DoubleAll(data, from, mid), new DoubleAll(data, mid, to));
        }
    }

    public static void main(String[] args) throws Exception {
        long[] data = LongStream.rangeClosed(1, 1_000_000).toArray();

        // Q71 + Q73: one pool, work stealing balances the halves.
        try (ForkJoinPool pool = new ForkJoinPool(4)) {
            long sum = pool.invoke(new SumTask(data, 0, data.length));
            System.out.println("Q71 RecursiveTask sum = " + sum + " (expected " + (1_000_000L * 1_000_001 / 2) + ")");
            pool.invoke(new DoubleAll(data, 0, data.length));
            System.out.println("Q72 RecursiveAction doubled in place: first " + data[0] + ", last " + data[data.length - 1]);
            System.out.println("Q73 work-stealing pool with " + pool.getParallelism() + " workers, each with its own deque");

            // Q79: a parallel stream started inside a custom pool runs in that pool.
            Set<String> threads = ConcurrentHashMap.newKeySet();
            long evens = pool.submit(() -> IntStream.range(0, 200_000).parallel()
                    .peek(i -> threads.add(Thread.currentThread().getName()))
                    .filter(i -> i % 2 == 0).count()).get();
            boolean onlyCustomPool = threads.stream().noneMatch(name -> name.contains("commonPool"));
            System.out.println("Q79 stream inside custom pool counted " + evens + " evens, never touched the common pool: " + onlyCustomPool);
        }

        // Q74: the common pool's size is derived from the core count.
        System.out.println("Q74 common pool parallelism >= 1: " + (ForkJoinPool.getCommonPoolParallelism() >= 1));

        // Q75 + Q76: a primitive parallel stream over a range splits evenly.
        long parallelSum = LongStream.rangeClosed(1, 1_000_000).parallel().sum();
        System.out.println("Q75 LongStream.parallel().sum() = " + parallelSum);

        // Q77: identity must be neutral. 10 is added once PER CHUNK in parallel.
        int sequential = IntStream.rangeClosed(1, 100).boxed().reduce(10, Integer::sum);
        int parallelWrong = IntStream.rangeClosed(1, 100).boxed().parallel().reduce(10, Integer::sum);
        int parallelRight = IntStream.rangeClosed(1, 100).boxed().parallel().reduce(0, Integer::sum) + 10;
        System.out.println("Q77 reduce(10, sum): sequential " + sequential + ", parallel is larger: " + (parallelWrong > sequential) + ", fixed " + parallelRight);
        // Q77: subtraction is not associative, so parallel results drift.
        int minusSeq = IntStream.rangeClosed(1, 10).reduce(0, (a, b) -> a - b);
        System.out.println("Q77 sequential reduce with minus = " + minusSeq + " (parallel would differ: not associative)");

        // Q78: collect keeps encounter order; forEachOrdered too.
        List<Integer> squares = IntStream.rangeClosed(1, 8).parallel().map(i -> i * i).boxed().toList();
        StringBuilder ordered = new StringBuilder();
        IntStream.rangeClosed(1, 8).parallel().forEachOrdered(i -> ordered.append(i));
        int first = IntStream.rangeClosed(1, 1000).parallel().filter(i -> i % 7 == 0).findFirst().getAsInt();
        System.out.println("Q78 parallel toList " + squares + ", forEachOrdered " + ordered + ", findFirst multiple of 7 = " + first);

        // Q76: shared mutable state - use a collector, not forEach(list::add).
        List<Integer> safe = IntStream.range(0, 10_000).parallel().boxed().collect(Collectors.toList());
        System.out.println("Q76 collect() gathered " + safe.size() + " elements safely");

        // Q80: parallel array operations.
        int[] values = {5, 3, 9, 1, 7, 2};
        Arrays.parallelSort(values);
        int[] prefix = {1, 2, 3, 4, 5, 6};
        Arrays.parallelPrefix(prefix, Integer::sum);
        int[] squaresArray = new int[6];
        Arrays.parallelSetAll(squaresArray, i -> i * i);
        System.out.println("Q80 parallelSort " + Arrays.toString(values) + ", parallelPrefix " + Arrays.toString(prefix) + ", parallelSetAll " + Arrays.toString(squaresArray));
    }
}`,
    walk:
      "`SumTask` splits the million-element range in half until a piece has at most 10,000 elements, so there are about 128 leaves. At each level it forks the left half, computes the right half on the current worker and then joins the left; idle workers steal forked halves from the tail of busy workers' deques. The result matches the formula n(n + 1) / 2. `DoubleAll` uses `invokeAll` to process both halves and doubles every element in place.\n\nFor Q79, a parallel stream is started from inside the custom pool, and every thread that touched an element is recorded. None of them is a common-pool worker, which shows that the stream ran in the custom pool.\n\nQ77 is the classic bug: sequentially, `reduce(10, Integer::sum)` gives 5050 + 10 = 5060, but in parallel each chunk starts from 10, so the result is larger. Using the true identity 0 and adding 10 once fixes it. Q78 shows that `toList()` and `forEachOrdered` keep encounter order in parallel, and `findFirst` still returns 7. Q80 sorts, computes the prefix sums 1, 3, 6, 10, 15, 21, and fills squares by index.",
    anim: [
      "Fork/Join with work stealing",
      [
        ["root", "sum[0..8)", "worker 1"],
        ["left", "sum[0..4)", "worker 1 deque"],
        ["right", "sum[4..8)", "worker 1 deque"],
        ["w2", "Worker 2", "idle, steals"],
        ["combine", "combine", "left + right"],
      ],
      [
        ["root", "left", "fork()", "The root task is too big, so worker 1 splits it and forks the left half onto its own deque."],
        ["root", "right", "compute()", "Worker 1 computes the right half itself, pushing its sub-tasks to the head of its deque (LIFO)."],
        ["w2", "left", "steal from tail", "Worker 2 has nothing to do, so it steals the OLDEST task, the big left half, from the tail of worker 1's deque."],
        ["left", "combine", "left result", "Below the threshold each piece is summed directly; worker 2 finishes the stolen half."],
        ["right", "combine", "join() + add", "Worker 1 joins the left result (helping with other tasks instead of idling), then adds the halves."],
      ],
    ],
    mistakes: [
      "Choosing a tiny threshold, so millions of tasks are created and the overhead outweighs the parallel speedup.",
      "Calling `left.fork(); right.fork(); left.join(); right.join();` and wasting the current thread. Compute one half directly.",
      "Running blocking I/O in parallel streams or `supplyAsync` without an executor, which starves the shared common pool.",
      "Using `reduce` with an identity that is not neutral, or with a non-associative operation.",
    ],
    qa: [
      [
        "Is a parallel stream always faster for 10 million elements?",
        "Not always. It depends on the source (an array splits well, a LinkedList does not), boxing, the cost per element, other load on the common pool and memory bandwidth. Summing a primitive array is often memory-bound and scales well only up to a few cores. Measure it.",
      ],
      [
        "Why does the common pool use availableProcessors() - 1 threads?",
        "Because the thread that calls the terminal operation also takes part in the work, so cores - 1 workers plus the caller use every core without oversubscription.",
      ],
      [
        "What happens if a ForkJoinTask throws an exception?",
        "The exception is stored in the task and rethrown from `join()` or `invoke()` (as the same RuntimeException, with the stack trace adjusted). `get()` wraps it in ExecutionException. `isCompletedAbnormally()` and `getException()` let you check it.",
      ],
    ],
    ex: [
      "Write a RecursiveTask that finds the maximum of an int array. What threshold would you start with, and how would you choose it?",
      "`compute()`: if `to - from <= THRESHOLD`, loop and return the max; otherwise split at mid, `left.fork()`, `int r = right.compute()`, `return Math.max(left.join(), r)`. Start with a threshold that gives each leaf roughly 10,000 to 100,000 cheap operations (or `length / (parallelism * 8)` leaves), then tune it with JMH; too small creates task overhead, too large loses load balancing.",
    ],
  }),
];
