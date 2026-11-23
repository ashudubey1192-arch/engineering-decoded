import { lesson } from "../../schema.js";

// Top 100 concurrency and parallelism interview questions, Q31-Q60.
export default [
  lesson("Concurrency and Parallelism Q31-Q40: Race Conditions, Deadlock, Livelock, Starvation and Thread Confinement", {
    intro:
      "The fourth block covers what goes wrong when threads share state, and the design strategies that avoid it:\n\n- race conditions vs data races, check-then-act and read-modify-write\n- deadlock: the four Coffman conditions, prevention and detection\n- livelock, starvation and priority inversion\n- thread confinement with ThreadLocal, and its memory-leak trap\n- immutability and statelessness as the cheapest thread-safety\n\nThe program builds a real deadlock between two daemon threads and lets `ThreadMXBean` find it, then fixes the same transfer with lock ordering, replaces a racy check-then-act with `putIfAbsent`, and confines a StringBuilder per thread.",
    topics: [
      [
        "Q31. What is the difference between a race condition and a data race?",
        "- A **data race** is a memory-model term: two threads access the same variable, at least one writes, and there is no happens-before ordering between them. The result is undefined visibility.\n- A **race condition** is a correctness term: the program's result depends on the **timing or interleaving** of threads.\n\nThey overlap but are not the same:\n\n1. A data race without a race condition: a benign racy cache of a value that is always computed the same way, such as `String.hashCode()`.\n2. A race condition without a data race: every access is synchronized, but `if (!map.containsKey(k)) map.put(k, v)` on a `synchronizedMap` still lets two threads both see \"absent\" and both put, because the **two** calls are not one atomic step.\n\nFixing data races needs synchronization; fixing race conditions needs the right **atomicity scope**.",
      ],
      [
        "Q32. What are check-then-act and read-modify-write races?",
        "These are the two classic race-condition patterns.\n\n**Check-then-act**: decide based on a check, then act, while the state may change between the two.\n\n- lazy initialization: `if (instance == null) instance = new X();`\n- `if (!map.containsKey(k)) map.put(k, v);`\n- `if (file.exists()) file.delete();`\n\n**Read-modify-write**: read a value, compute a new one from it, write it back.\n\n- `count++`, `balance -= amount`, `list.set(i, list.get(i) + 1)`\n\nFixes, from most to least preferred: use an atomic compound method (`putIfAbsent`, `computeIfAbsent`, `merge`, `incrementAndGet`, `updateAndGet`); hold one lock over both steps; or use a CAS loop that retries if the value changed in between.",
      ],
      [
        "Q33. What is a deadlock, and what are the four Coffman conditions?",
        "A deadlock is a set of threads each waiting for a resource held by another thread in the set, so none can ever continue. It requires **all four** Coffman conditions at once:\n\n1. **Mutual exclusion**: a resource can be held by only one thread.\n2. **Hold and wait**: a thread holds one resource while waiting for another.\n3. **No preemption**: a resource cannot be taken away; the holder must release it.\n4. **Circular wait**: thread 1 waits for thread 2, which waits for ... thread 1.\n\nIn Java the typical case is two threads taking two monitors in opposite orders: thread 1 locks A then wants B; thread 2 locks B then wants A. Both are BLOCKED forever, the JVM does not recover, and with synchronized there is no way to cancel them. Breaking any one condition prevents deadlock.",
      ],
      [
        "Q34. How do you prevent deadlock?",
        "Attack one Coffman condition:\n\n- **Circular wait, by lock ordering**: define a global order (by account id, or `System.identityHashCode` with a tie-breaker lock) and always acquire locks in that order. The most common and effective fix.\n- **Hold and wait**: acquire all the locks you need at once, or never call unknown code (callbacks, listeners, overridable methods) while holding a lock. These are \"open calls\".\n- **No preemption, by timed acquisition**: `tryLock(timeout)`; on failure release everything, back off for a random time and retry.\n- **Mutual exclusion**: avoid the lock entirely with immutable data, confinement, or lock-free structures.\n\nAlso keep critical sections small, prefer one lock over nested locks, and use higher-level tools (a single-threaded executor that owns the state, or message passing) for complex interactions.",
      ],
      [
        "Q35. How do you detect a deadlock in a running JVM?",
        "1. **Thread dump**: `jstack <pid>`, `jcmd <pid> Thread.print`, `kill -3` on Unix or Ctrl+Break on Windows. The dump ends with a section \"Found one Java-level deadlock\" listing each thread, the lock it holds and the lock it waits for.\n2. **Programmatically**: `ManagementFactory.getThreadMXBean().findDeadlockedThreads()` returns the ids of threads deadlocked on monitors **or** ownable synchronizers (ReentrantLock); `findMonitorDeadlockedThreads()` covers monitors only. A watchdog thread can poll it and log the `ThreadInfo`.\n3. **Tools**: JConsole and VisualVM have a \"Detect Deadlock\" button; Java Mission Control and JFR show lock contention.\n\nThe JVM only **detects**; it never breaks a deadlock. Recovery means restarting the process, which is why prevention matters. Deadlocks over Semaphores or plain waits (a missed notify) are not reported, because those have no owner.",
      ],
      [
        "Q36. What is a livelock?",
        "In a livelock, threads are **not blocked**: they keep running and changing state in response to each other, but no useful work gets done. The picture is two people in a corridor who both step aside the same way, then both step back, forever.\n\nIn code, it often comes from over-polite deadlock avoidance: two threads each take lock A or B, `tryLock` the other, fail, release, and retry **immediately and in sync**, so they fail again every time. Another form is a message that is retried forever because processing it always fails.\n\nFixes: add **randomized back-off** (sleep a random few milliseconds before retrying), cap retries, or impose an order or priority so one side wins. Livelock burns CPU, so it shows up as threads that are RUNNABLE with high CPU but no progress, unlike deadlock where the threads are BLOCKED and idle.",
      ],
      [
        "Q37. What is starvation, and how does fairness help?",
        "Starvation is a thread being **perpetually denied** the resource it needs, even though the system as a whole makes progress. Causes:\n\n- unfair locks under heavy load, where newly arriving threads keep barging ahead\n- a reader-preferring read-write lock with a constant stream of readers, so the writer never gets in\n- thread priorities, which some OS schedulers honour strongly\n- a thread holding a lock for a long time (blocking I/O inside synchronized)\n- a thread pool whose threads are all busy with long tasks while short tasks wait in the queue\n\nFixes: fair locks (`new ReentrantLock(true)`, fair ReadWriteLock or Semaphore), shorter critical sections, separate pools for slow and fast work (bulkheads), and avoiding priorities. Fairness costs throughput, so apply it where starvation is observed.",
      ],
      [
        "Q38. What is priority inversion?",
        "Priority inversion happens when a **high-priority** thread waits for a lock held by a **low-priority** thread, and a **medium-priority** thread, which does not need the lock, preempts the low-priority one. The high-priority thread is effectively running at the lowest priority. The famous case is the Mars Pathfinder lander, which kept rebooting in 1997 until engineers enabled priority inheritance remotely.\n\nOperating systems fix it with **priority inheritance** (the lock holder temporarily gets the waiter's priority) or **priority ceilings**. Java offers neither: thread priorities are only hints and mostly ignored by Linux's default scheduler. So in Java the answer is design: do not rely on priorities, keep critical sections short, and prefer lock-free structures for real-time-sensitive paths.",
      ],
      [
        "Q39. What is thread confinement, and what is the ThreadLocal memory leak?",
        "If data is only ever accessed by **one thread**, it needs no synchronization. That is thread confinement:\n\n- **stack confinement**: local variables and objects that never escape the method\n- **ThreadLocal confinement**: `ThreadLocal<T>` gives each thread its own copy, for example a non-thread-safe `SimpleDateFormat` or a per-request context\n- **ad-hoc confinement**: a design rule, such as \"only the event thread touches the UI\"\n\nThe leak: a ThreadLocal value lives in the **thread's** map. Pool threads live for the whole application, so a value set by one request stays referenced after the request ends, and the next task on that thread can even **see the previous user's data**. In application servers it can also pin a redeployed web app's classloader. Always `remove()` in a finally block, prefer `ThreadLocal.withInitial` for read-mostly caches, and on Java 25+ consider **ScopedValue**, which is bound for a block and unbound automatically.",
        "static final ThreadLocal<StringBuilder> BUF = ThreadLocal.withInitial(StringBuilder::new);\ntry { BUF.get().append(...); } finally { BUF.remove(); }",
      ],
      [
        "Q40. Why are immutability and statelessness the best thread-safety strategies?",
        "Every concurrency bug needs **shared, mutable** state. Remove either word and the bug class disappears:\n\n- **Stateless** objects (a servlet or Spring bean with no fields, a pure function) can be called by any number of threads at once; all their data is on each caller's stack.\n- **Immutable** objects (final fields, no setters, defensive copies, `this` not leaked) can be shared freely without locks, and are safely published through any channel thanks to final-field semantics.\n- **Effectively immutable** objects (never modified after safe publication) are also fine.\n\nTo \"change\" an immutable value, create a new one and swap a single reference atomically: `AtomicReference.updateAndGet(old -> old.withX(5))`. Records, `List.copyOf` and `Map.of` make this easy. Persistent collections (structural sharing) extend the idea to large data. What is left mutable should be encapsulated behind one lock or one owning thread.",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class Main {

    static final class Account {
        final int id;
        int balance;
        final ReentrantLock lock = new ReentrantLock();
        Account(int id, int balance) { this.id = id; this.balance = balance; }
    }

    // Q34: lock ordering - always lock the smaller id first, so no cycle can form.
    static void transfer(Account from, Account to, int amount) {
        Account first = from.id < to.id ? from : to;
        Account second = from.id < to.id ? to : from;
        first.lock.lock();
        try {
            second.lock.lock();
            try { from.balance -= amount; to.balance += amount; }
            finally { second.lock.unlock(); }
        } finally { first.lock.unlock(); }
    }

    // Q39: one StringBuilder per thread, removed after use.
    static final ThreadLocal<StringBuilder> BUFFER = ThreadLocal.withInitial(StringBuilder::new);
    static String render(String user) {
        try {
            StringBuilder sb = BUFFER.get();
            sb.setLength(0);
            return sb.append("<b>").append(user).append("</b>").toString();
        } finally {
            BUFFER.remove();                    // no stale data for the next pool task
        }
    }

    // Q40: an immutable value swapped atomically.
    record Settings(int timeoutMs, int retries) {
        Settings withRetries(int r) { return new Settings(timeoutMs, r); }
    }

    public static void main(String[] args) throws Exception {
        // Q33 + Q35: two daemon threads lock A and B in opposite orders.
        Object lockA = new Object(), lockB = new Object();
        CountDownLatch bothHoldOne = new CountDownLatch(2);
        Runnable ab = () -> { synchronized (lockA) { arrive(bothHoldOne); synchronized (lockB) { } } };
        Runnable ba = () -> { synchronized (lockB) { arrive(bothHoldOne); synchronized (lockA) { } } };
        for (Runnable r : List.of(ab, ba)) { Thread t = new Thread(r); t.setDaemon(true); t.start(); }

        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        long[] stuck = null;
        for (int i = 0; i < 200 && stuck == null; i++) { Thread.sleep(10); stuck = mx.findDeadlockedThreads(); }
        System.out.println("Q35 ThreadMXBean found deadlocked threads: " + (stuck == null ? 0 : stuck.length));
        if (stuck != null) {
            ThreadInfo info = mx.getThreadInfo(stuck[0]);
            System.out.println("Q35 one of them is " + info.getThreadState() + " waiting for a " + info.getLockName().split("@")[0]);
        }

        // Q34: the same opposite-direction transfers, with lock ordering.
        Account x = new Account(1, 1000), y = new Account(2, 1000);
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            List<Callable<Void>> transfers = new ArrayList<>();
            for (int t = 0; t < 4; t++) {
                boolean forward = t % 2 == 0;
                transfers.add(() -> {
                    for (int i = 0; i < 5_000; i++) { if (forward) transfer(x, y, 1); else transfer(y, x, 1); }
                    return null;
                });
            }
            pool.invokeAll(transfers);
            System.out.println("Q34 ordered locking finished, balances " + x.balance + " + " + y.balance + " = " + (x.balance + y.balance));

            // Q32: check-then-act. putIfAbsent makes "check and insert" ONE atomic step.
            ConcurrentHashMap<String, Integer> owners = new ConcurrentHashMap<>();
            AtomicInteger winners = new AtomicInteger();
            List<Callable<Void>> claims = new ArrayList<>();
            for (int t = 0; t < 8; t++) {
                int id = t;
                claims.add(() -> { if (owners.putIfAbsent("seat-1", id) == null) winners.incrementAndGet(); return null; });
            }
            pool.invokeAll(claims);
            System.out.println("Q32 eight threads claimed seat-1 with putIfAbsent, winners = " + winners.get());

            // Q39: each pool thread uses its own confined buffer.
            List<Callable<String>> pages = new ArrayList<>();
            for (String user : List.of("ana", "ben", "cy")) pages.add(() -> render(user));
            List<String> html = new ArrayList<>();
            for (Future<String> f : pool.invokeAll(pages)) html.add(f.get());
            System.out.println("Q39 ThreadLocal buffers rendered " + html);
        }

        // Q40: immutable settings, replaced with one atomic reference swap.
        AtomicReference<Settings> settings = new AtomicReference<>(new Settings(500, 1));
        Settings old = settings.get();
        settings.updateAndGet(s -> s.withRetries(s.retries() + 2));
        System.out.println("Q40 old snapshot " + old + " unchanged; current " + settings.get());
    }

    static void arrive(CountDownLatch latch) {
        latch.countDown();
        try { latch.await(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}`,
    walk:
      "The two daemon threads each take their first monitor, count down the latch and wait for each other, so both are guaranteed to hold one lock before reaching for the second. Each then blocks on the other's lock, which is a circular wait. Main polls `findDeadlockedThreads()` until it reports both threads, and `getThreadInfo` shows one of them BLOCKED on a `java.lang.Object` monitor. The threads are daemons, so they do not stop the JVM from exiting at the end.\n\nQ34 runs four threads that move money in opposite directions 5,000 times each, but `transfer` always locks the account with the smaller id first, so the run finishes and the total stays 2,000. In Q32 eight threads try to claim the same seat; `putIfAbsent` returns null for exactly one of them. Q39 renders three pages using per-thread buffers that are removed in finally. Q40 swaps an immutable record through an AtomicReference; the old snapshot that a reader holds never changes.",
    anim: [
      "Deadlock, then the lock-ordering fix",
      [
        ["t1", "Thread 1", "transfer x to y"],
        ["a", "Lock A", "account 1"],
        ["b", "Lock B", "account 2"],
        ["t2", "Thread 2", "transfer y to x"],
      ],
      [
        ["t1", "a", "holds A", "Thread 1 locks account 1 first (hold and wait begins)."],
        ["t2", "b", "holds B", "Thread 2 locks account 2 first, the opposite order."],
        ["t1", "b", "waits for B", "Thread 1 now needs B, which thread 2 holds, so it is BLOCKED."],
        ["t2", "a", "waits for A", "Thread 2 needs A: a circular wait. All four Coffman conditions hold, which is a deadlock."],
        ["t2", "a", "order: A then B", "Fix: both threads lock the smaller id first. Thread 2 also asks for A first, waits, and no cycle can form."],
      ],
    ],
    mistakes: [
      "Calling an alien method (listener, callback, overridable method) while holding a lock, which invites lock-order deadlocks.",
      "Retrying a failed `tryLock` immediately in a tight loop. Two threads can livelock; add random back-off.",
      "Setting a ThreadLocal in a pooled thread without `remove()`, which leaks memory and leaks data between requests.",
      "Assuming every method of a synchronized collection makes your compound action atomic.",
    ],
    qa: [
      [
        "Can a single thread deadlock itself?",
        "Yes, with a non-reentrant lock: a thread that acquires a Semaphore(1) or a hand-written spin lock twice waits for itself forever. It can also happen by joining itself (`Thread.currentThread().join()`), or by waiting for a Future of a task queued behind it on a single-threaded executor.",
      ],
      [
        "Does findDeadlockedThreads detect deadlocks with ReentrantLock?",
        "Yes. `findDeadlockedThreads()` covers monitors and ownable synchronizers (ReentrantLock, the write lock of ReentrantReadWriteLock). `findMonitorDeadlockedThreads()` covers only synchronized monitors.",
      ],
      [
        "Why is a stateless Spring singleton bean thread-safe?",
        "All callers share one instance, but it has no mutable fields; each request's data lives in local variables on that request thread's stack. Adding an instance field that requests write to breaks this immediately.",
      ],
    ],
    ex: [
      "Two threads each need locks on objects `a` and `b` that have no natural id. How can you still impose a lock order?",
      "Compare `System.identityHashCode(a)` and `System.identityHashCode(b)` and lock the smaller first. Hash codes can tie, so when they are equal, first acquire a single global tie-breaker lock, then lock a and b in either order. This is the technique from Java Concurrency in Practice.",
    ],
  }),

  lesson("Concurrency and Parallelism Q41-Q50: CAS, the ABA Problem, LongAdder, VarHandle and Lock-Free Structures", {
    intro:
      "The fifth block goes under the locks to **compare-and-swap**, the instruction that every atomic class and most of java.util.concurrent is built on:\n\n- what CAS is and how to write a CAS retry loop\n- the ABA problem and AtomicStampedReference\n- AtomicLong vs LongAdder, and accumulators\n- VarHandle and the four memory-ordering modes\n- a spin lock, a Treiber lock-free stack, and when atomics are not enough\n\nThe program writes its own CAS loop, reproduces ABA and catches it with a stamp, uses a VarHandle on a plain field, guards a counter with a hand-written spin lock, and pushes into a lock-free stack from four threads.",
    topics: [
      [
        "Q41. What is compare-and-swap (CAS)?",
        "CAS is a single atomic CPU instruction (`LOCK CMPXCHG` on x86, LDXR and STXR pairs or CAS on ARM) with three operands: a memory location, an **expected** value and a **new** value. It writes the new value **only if** the location still holds the expected one, and reports whether it did. All in one indivisible step.\n\nIn Java it surfaces as `compareAndSet(expected, newValue)` on the atomic classes and VarHandle. Its strengths are no blocking, no context switches, no deadlock, and no lock to forget. Its weaknesses:\n\n- under heavy contention, many threads retry and waste CPU\n- it covers **one** variable at a time\n- it is vulnerable to ABA when the expected value can come back\n\nIt is the basis of optimistic concurrency: assume no conflict, detect it, retry.",
      ],
      [
        "Q42. How do you write a CAS retry loop?",
        "Every lock-free update follows the same pattern:\n\n1. Read the current value.\n2. Compute the new value from it (a pure function, with no side effects, because it may run several times).\n3. `compareAndSet(current, next)`. If it fails, another thread changed the value, so loop back to step 1.\n\nThe JDK wraps this for you in `getAndUpdate`, `updateAndGet`, `getAndAccumulate` and `accumulateAndGet`. Writing it by hand is still a common interview task, for example an atomic \"max so far\", or a counter that refuses to go below zero.",
        "int prev, next;\ndo {\n    prev = value.get();\n    next = Math.max(prev, candidate);\n} while (!value.compareAndSet(prev, next));",
      ],
      [
        "Q43. What is the ABA problem, and how do you solve it?",
        "CAS only checks that the value **equals** the expected one, not that it was never changed. Step by step:\n\n1. Thread 1 reads A and is paused.\n2. Thread 2 changes A to B, and then back to A.\n3. Thread 1's CAS(A, C) succeeds, though the world changed underneath it.\n\nWith plain counters this is harmless. It breaks pointer-based structures: in a lock-free stack, node A may have been popped, freed or reused and pushed again with a different `next`, so the CAS links in a stale node. Java's garbage collector prevents the memory-reuse form (a node cannot be recycled while thread 1 still references it), but logical ABA remains.\n\nSolutions: `AtomicStampedReference` (reference plus an int version, both compared together), `AtomicMarkableReference` (reference plus a boolean), or a version number you increment on every change. Or avoid reusing node objects.",
      ],
      [
        "Q44. What is the difference between AtomicLong and LongAdder?",
        "- `AtomicLong` keeps **one** value and every update CASes the same memory location. Under high contention, threads keep failing and retrying on one hot cache line.\n- `LongAdder` (Java 8) keeps a **base** value plus an array of **cells**, padded against false sharing. A thread whose CAS on the base fails moves to its own cell (chosen by a per-thread probe), so contending threads update different lines. `sum()` adds base and all cells.\n\nTrade-offs:\n\n- LongAdder is much faster for frequently updated counters (metrics, statistics, hit counts).\n- `sum()` is **not an atomic snapshot**; concurrent updates during the sum may or may not be included.\n- LongAdder uses more memory and has no `compareAndSet` or `incrementAndGet` that returns the new value.\n\nUse AtomicLong for sequence numbers and ids, and anything that needs the exact value at update time; use LongAdder for counters that are written often and read rarely.",
      ],
      [
        "Q45. What is a VarHandle?",
        "`java.lang.invoke.VarHandle` (Java 9, JEP 193) is a typed reference to a variable (an instance or static field, an array element, or off-heap memory) that supports **atomic and ordered access** without wrapping the variable in an Atomic object. It replaces most uses of `sun.misc.Unsafe` and of `AtomicXxxFieldUpdater`.\n\nYou obtain one with `MethodHandles.lookup().findVarHandle(Owner.class, \"field\", int.class)` and store it in a `static final` field, so the JIT can make it as fast as direct access. It offers `get` and `set`, `getVolatile` and `setVolatile`, `getAcquire` and `setRelease`, `getOpaque` and `setOpaque`, `compareAndSet`, `compareAndExchange`, `weakCompareAndSet` and `getAndAdd`. Why bother? Thousands of small objects (nodes) each holding an AtomicInteger cost an extra object each; a VarHandle on a plain `volatile int` field costs nothing per object. The JDK's own concurrent classes use VarHandles internally.",
      ],
      [
        "Q46. What are the VarHandle memory-ordering modes?",
        "From weakest to strongest:\n\n1. **Plain** (`get` and `set`): ordinary field access, no ordering or visibility guarantees, and 64-bit values may tear.\n2. **Opaque** (`getOpaque` and `setOpaque`): the access really happens (not hoisted or cached), is atomic, and is coherent per variable, but has no ordering relative to other variables. Good for progress flags and statistics.\n3. **Acquire/Release** (`getAcquire` and `setRelease`): a release write keeps all earlier writes before it, and an acquire read keeps all later reads after it. That is exactly what message passing needs (\"publish data, then set ready\"), and it is cheaper than volatile on some CPUs.\n4. **Volatile** (`getVolatile`, `setVolatile` and the CAS methods): acquire and release plus a single total order across all volatile accesses (sequential consistency).\n\nIn interviews, the key point is that the default `volatile` is the strongest and simplest choice; the weaker modes are for library authors after profiling.",
      ],
      [
        "Q47. How would you implement a spin lock, and when is spinning a good idea?",
        "A minimal spin lock is an `AtomicBoolean`:\n\n- `lock()`: `while (!locked.compareAndSet(false, true)) Thread.onSpinWait();`\n- `unlock()`: `locked.set(false);`\n\n`Thread.onSpinWait()` (Java 9) emits a CPU hint (PAUSE on x86) that saves power and helps the sibling hyperthread. Improvements are test-and-test-and-set (spin on a plain `get()` before trying CAS, to reduce cache traffic) and exponential back-off.\n\nSpinning only pays off when critical sections are **very short** (nanoseconds), threads are on different cores, and the number of threads is not above the number of cores. Otherwise a spinning thread burns the CPU that the lock holder needs. Real locks (ReentrantLock, synchronized) spin briefly and then **park**. This simple lock is also not reentrant and not fair; production code should rarely write its own.",
      ],
      [
        "Q48. How does a lock-free stack (Treiber stack) work?",
        "The Treiber stack (1986) keeps `AtomicReference<Node> head`, where each node is immutable (value plus next).\n\n- **push(v)**: create `n = new Node(v)`, then loop: `n.next = head.get(); if (head.compareAndSet(n.next, n)) return;`\n- **pop()**: loop: `h = head.get(); if (h == null) return null; if (head.compareAndSet(h, h.next)) return h.value;`\n\nIt works because every change is one CAS on `head`. If another thread changed the head between our read and our CAS, the CAS fails and we retry with the new head. Nobody ever blocks, so it is lock-free (some thread always succeeds). Points to mention: the ABA risk if nodes were reused (safe in Java thanks to GC when nodes are fresh), contention on the single head under heavy load (elimination back-off arrays help), and the fact that `ConcurrentLinkedDeque` and `ConcurrentLinkedQueue` (the Michael-Scott queue) use the same ideas.",
      ],
      [
        "Q49. What are LongAccumulator and accumulateAndGet, and what rules must their functions follow?",
        "- `AtomicInteger.accumulateAndGet(x, op)` applies `op(current, x)` atomically in a CAS loop and returns the result. Example: `max.accumulateAndGet(sample, Math::max)`.\n- `LongAccumulator(op, identity)` is the LongAdder-style version for any operation: each cell accumulates independently, and `get()` combines cells with the same operation.\n\nRules for the function:\n\n1. **No side effects**, because a CAS loop may call it several times.\n2. For LongAccumulator, the operation must be **associative and commutative** (max, min, sum, bitwise OR), because the order in which threads hit cells and the order in which cells are combined are unspecified.\n3. The identity must really be neutral: 0 for sum, `Long.MIN_VALUE` for max.\n\nA non-commutative function such as `(a, b) -> a * 2 + b` gives results that depend on scheduling.",
      ],
      [
        "Q50. When are atomic variables not enough?",
        "Each atomic variable is individually thread-safe, but **an invariant across several variables** is not. Example: a range with `AtomicInteger lower` and `AtomicInteger upper` and the rule `lower <= upper`. Starting from (0, 10):\n\n1. Thread 1 calls `setLower(5)`: it checks 5 <= upper (10), which passes.\n2. Thread 2 calls `setUpper(4)`: it checks 4 >= lower (still 0), which passes.\n3. Both write, and the range is (5, 4), which is invalid, though every single operation was atomic.\n\nFixes:\n\n- put both values in **one immutable object** and CAS a single `AtomicReference<Range>`\n- guard both with **one lock**\n\nThe same applies to \"update a map and a counter together\" and \"check a balance, then debit\". Atomicity has to cover the whole invariant, not each field.",
      ],
    ],
    code: String.raw`import java.lang.invoke.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    // Q42: a hand-written CAS loop for an atomic "max so far".
    static int casMax(AtomicInteger max, int candidate) {
        int prev, next;
        do {
            prev = max.get();
            next = Math.max(prev, candidate);
        } while (!max.compareAndSet(prev, next));       // retry if someone changed it meanwhile
        return next;
    }

    // Q45: a VarHandle on a plain volatile field - no AtomicInteger object per instance.
    static final class Hits {
        volatile int count;
        static final VarHandle COUNT;
        static {
            try { COUNT = MethodHandles.lookup().findVarHandle(Hits.class, "count", int.class); }
            catch (ReflectiveOperationException e) { throw new ExceptionInInitializerError(e); }
        }
        void hit() { COUNT.getAndAdd(this, 1); }
    }

    // Q47: test-and-test-and-set spin lock (not reentrant).
    static final class SpinLock {
        private final AtomicBoolean locked = new AtomicBoolean();
        void lock() {
            while (true) {
                while (locked.get()) Thread.onSpinWait();            // spin on a cheap read
                if (locked.compareAndSet(false, true)) return;        // then try to take it
            }
        }
        void unlock() { locked.set(false); }
    }

    // Q48: Treiber stack - every change is one CAS on head.
    static final class LockFreeStack<T> {
        private record Node<T>(T value, Node<T> next) { }
        private final AtomicReference<Node<T>> head = new AtomicReference<>();
        void push(T value) {
            Node<T> current, node;
            do { current = head.get(); node = new Node<>(value, current); }
            while (!head.compareAndSet(current, node));
        }
        T pop() {
            Node<T> current;
            do { current = head.get(); if (current == null) return null; }
            while (!head.compareAndSet(current, current.next()));
            return current.value();
        }
    }

    // Q50: keep both bounds in ONE immutable object.
    record Range(int lower, int upper) { }

    public static void main(String[] args) throws Exception {
        // Q41
        AtomicInteger value = new AtomicInteger(5);
        System.out.println("Q41 CAS(5 -> 6) = " + value.compareAndSet(5, 6) + ", CAS(5 -> 7) = " + value.compareAndSet(5, 7) + ", value = " + value.get());

        // Q43: ABA - a plain reference cannot tell that A left and came back.
        String a = "A", b = "B";
        AtomicReference<String> ref = new AtomicReference<>(a);
        String seen = ref.get();                       // thread 1 reads A ... and pauses
        ref.set(b); ref.set(a);                        // thread 2: A -> B -> A
        System.out.println("Q43 plain CAS after A->B->A succeeds: " + ref.compareAndSet(seen, "C"));
        AtomicStampedReference<String> stamped = new AtomicStampedReference<>(a, 0);
        int[] stampHolder = new int[1];
        String seenS = stamped.get(stampHolder);
        int seenStamp = stampHolder[0];
        stamped.compareAndSet(a, b, 0, 1); stamped.compareAndSet(b, a, 1, 2);
        System.out.println("Q43 stamped CAS with stale stamp " + seenStamp + " succeeds: "
                + stamped.compareAndSet(seenS, "C", seenStamp, seenStamp + 1) + " (current stamp " + stamped.getStamp() + ")");

        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            AtomicInteger max = new AtomicInteger(Integer.MIN_VALUE);
            AtomicLong atomicLong = new AtomicLong();
            LongAdder adder = new LongAdder();
            LongAccumulator maxAcc = new LongAccumulator(Long::max, Long.MIN_VALUE);
            Hits hits = new Hits();
            SpinLock spin = new SpinLock();
            int[] guarded = {0};
            LockFreeStack<Integer> stack = new LockFreeStack<>();

            List<Callable<Void>> jobs = new ArrayList<>();
            for (int t = 0; t < 4; t++) {
                int base = t * 10_000;
                jobs.add(() -> {
                    for (int i = 0; i < 10_000; i++) {
                        casMax(max, base + i);                          // Q42
                        atomicLong.incrementAndGet();                   // Q44
                        adder.increment();                              // Q44
                        maxAcc.accumulate(base + i);                    // Q49
                        hits.hit();                                     // Q45
                        spin.lock(); try { guarded[0]++; } finally { spin.unlock(); }   // Q47
                        if (i < 250) stack.push(base + i);              // Q48
                    }
                    return null;
                });
            }
            pool.invokeAll(jobs);
            System.out.println("Q42 hand-written CAS max = " + max.get());
            System.out.println("Q44 AtomicLong = " + atomicLong.get() + ", LongAdder.sum() = " + adder.sum());
            System.out.println("Q45 VarHandle getAndAdd on a plain field = " + hits.count);
            System.out.println("Q47 spin-lock-guarded counter = " + guarded[0]);
            int popped = 0;
            while (stack.pop() != null) popped++;
            System.out.println("Q48 lock-free stack: 4 threads pushed 1000, popped " + popped);
            System.out.println("Q49 LongAccumulator(max) = " + maxAcc.get());
        }

        // Q46: release/acquire publishes 'data' before 'ready'.
        System.out.println("Q46 modes: plain < opaque < acquire/release < volatile");

        // Q50: one AtomicReference<Range> keeps lower <= upper as a single CAS.
        AtomicReference<Range> range = new AtomicReference<>(new Range(0, 10));
        boolean lowerOk = trySetLower(range, 5), upperOk = trySetUpper(range, 4);
        System.out.println("Q50 setLower(5) = " + lowerOk + ", setUpper(4) rejected = " + !upperOk + ", range " + range.get());
    }

    static boolean trySetLower(AtomicReference<Range> range, int lower) {
        while (true) {
            Range r = range.get();
            if (lower > r.upper()) return false;                    // invariant checked on the SAME snapshot
            if (range.compareAndSet(r, new Range(lower, r.upper()))) return true;
        }
    }

    static boolean trySetUpper(AtomicReference<Range> range, int upper) {
        while (true) {
            Range r = range.get();
            if (upper < r.lower()) return false;
            if (range.compareAndSet(r, new Range(r.lower(), upper))) return true;
        }
    }
}`,
    walk:
      "Q41 shows the CAS rule directly: CAS(5, 6) succeeds; the second CAS expects 5 but finds 6, so it fails and the value stays 6.\n\nQ43 simulates the ABA interleaving on one thread for determinism: the \"paused\" thread remembers A, the other side changes A to B and back, and the plain CAS still succeeds. With AtomicStampedReference the two changes moved the stamp from 0 to 2, so the CAS that expects stamp 0 fails.\n\nThe pool block then hammers every primitive from four threads at once, each thread contributing 10,000 updates: the hand-written CAS max ends at 39,999, the AtomicLong, LongAdder, VarHandle counter and spin-lock-guarded counter all reach exactly 40,000, the Treiber stack received 1,000 pushes and gives back exactly 1,000 pops, and the LongAccumulator agrees with the CAS max. Finally, Q50 keeps both bounds in one Range record, so `setUpper(4)` sees the lower bound of 5 in the same snapshot it would replace, and refuses.",
    anim: [
      "A CAS retry loop under contention",
      [
        ["t1", "Thread 1", "reads 5"],
        ["t2", "Thread 2", "reads 5"],
        ["mem", "value", "5"],
        ["cpu", "CMPXCHG", "atomic CPU op"],
      ],
      [
        ["t1", "mem", "read 5", "Both threads read the current value 5 and compute 6 locally."],
        ["t2", "cpu", "CAS(5, 6) ok", "Thread 2 reaches CAS first: memory still holds 5, so it writes 6 and succeeds."],
        ["t1", "cpu", "CAS(5, 6) fails", "Thread 1's CAS expects 5 but memory now holds 6, so nothing is written and it returns false."],
        ["t1", "mem", "re-read 6", "Thread 1 loops: it reads 6 and computes 7. Nobody blocked; one thread always wins."],
        ["t1", "cpu", "CAS(6, 7) ok", "The retry succeeds. Both increments are counted, without any lock."],
      ],
    ],
    mistakes: [
      "Putting side effects (logging, I/O) inside an `updateAndGet` lambda. It may run several times.",
      "Using LongAdder where you need `incrementAndGet()`'s return value or an exact snapshot.",
      "Checking an invariant across two AtomicIntegers separately. Combine them in one immutable object.",
      "Writing your own spin lock for long critical sections, which burns the CPU the lock holder needs.",
    ],
    qa: [
      [
        "What is weakCompareAndSet?",
        "A CAS that may fail **spuriously** (return false even when the value matched) and, in its plain form, gives no ordering guarantees. On LL/SC architectures such as ARM it can be cheaper, and it is fine inside a retry loop anyway.",
      ],
      [
        "Is AtomicInteger.incrementAndGet always a CAS loop?",
        "No. On x86 the JIT turns `getAndAdd` and `incrementAndGet` into a single `LOCK XADD` instruction, which never retries, so it is wait-free there. On other CPUs it may be a CAS or LL/SC loop.",
      ],
      [
        "Why are atomic classes faster than synchronized under low contention?",
        "An uncontended CAS is a single instruction with no OS involvement; a contended lock may park the thread, which means a system call and a context switch. Under very high contention both slow down, and LongAdder-style striping helps.",
      ],
    ],
    ex: [
      "Write `boolean tryDecrement(AtomicInteger stock)` that decrements stock only if it is greater than zero, without locks, and returns whether it succeeded.",
      "`while (true) { int s = stock.get(); if (s <= 0) return false; if (stock.compareAndSet(s, s - 1)) return true; }` The check and the update use the same snapshot `s`, so stock can never drop below zero. A plain `if (stock.get() > 0) stock.decrementAndGet();` is a check-then-act race.",
    ],
  }),

  lesson("Concurrency and Parallelism Q51-Q60: ThreadPoolExecutor Internals, Queues, Rejection, Shutdown and Scheduling", {
    intro:
      "The sixth block opens up the **thread pool**, the workhorse of server-side Java:\n\n- the seven ThreadPoolExecutor parameters and how a task flows through them\n- work queue choices and the four rejection policies\n- why the `Executors` factory methods can be dangerous\n- shutdown, shutdownNow, awaitTermination and close\n- exceptions in pool tasks, scheduled executors, CompletionService and custom ThreadFactories\n\nThe program builds a pool with 1 core thread, 2 maximum threads and a queue of 1, then submits four blocked tasks so you can watch the core thread, the queue, the extra thread and the rejection happen in order.",
    topics: [
      [
        "Q51. What are the parameters of ThreadPoolExecutor?",
        "`new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory, handler)`:\n\n1. **corePoolSize**: threads kept alive even when idle (unless `allowCoreThreadTimeOut(true)`).\n2. **maximumPoolSize**: the upper bound on threads, used only when the queue is full.\n3. **keepAliveTime** and **unit**: how long a thread above the core size may stay idle before it ends.\n4. **workQueue**: the BlockingQueue that holds tasks waiting for a thread.\n5. **threadFactory**: creates the threads (names, daemon flag, priority, uncaught-exception handler).\n6. **handler**: the RejectedExecutionHandler called when the pool cannot accept a task.\n\nUseful extras: `prestartAllCoreThreads()`, the `beforeExecute`, `afterExecute` and `terminated` hooks, and monitoring getters such as `getPoolSize()`, `getActiveCount()`, `getQueue().size()` and `getCompletedTaskCount()`.",
      ],
      [
        "Q52. In what order does ThreadPoolExecutor use threads, the queue and rejection?",
        "When you call `execute(task)`:\n\n1. If fewer than **corePoolSize** threads are running, start a **new core thread** for this task, even if other threads are idle.\n2. Otherwise, try to **offer** the task to the **queue**.\n3. If the queue is full and fewer than **maximumPoolSize** threads are running, start a **non-core thread** for this task.\n4. Otherwise, **reject** it through the handler.\n\nThe surprising consequence: threads beyond the core size are created only when the queue is full. With an **unbounded** queue (`LinkedBlockingQueue` with no capacity), step 3 never happens, so `maximumPoolSize` is ignored. People often expect \"grow to max first, then queue\"; to get that behaviour you need a SynchronousQueue (direct hand-off) or a custom queue whose `offer` returns false while the pool can still grow.",
      ],
      [
        "Q53. Which work queue should a thread pool use?",
        "- `ArrayBlockingQueue(n)`: **bounded**, one lock, fixed array. Gives back-pressure; the size must be chosen.\n- `LinkedBlockingQueue(n)`: bounded or **unbounded** (the default capacity is Integer.MAX_VALUE). Has separate locks for put and take. `newFixedThreadPool` uses the unbounded form.\n- `SynchronousQueue`: **zero capacity**, every offer must meet a waiting thread. Tasks are handed off directly, otherwise a new thread is created up to the max. `newCachedThreadPool` uses it.\n- `PriorityBlockingQueue`: unbounded, ordered by a Comparator. Tasks must be comparable (wrap them), and plain `submit` wraps them in FutureTask, which breaks ordering.\n- `DelayQueue` and `DelayedWorkQueue`: release elements after a delay; the scheduled pool uses the latter.\n\nIn production, prefer a **bounded** queue plus an explicit rejection policy, so overload is visible and memory is safe.",
      ],
      [
        "Q54. What rejection policies are built in?",
        "When the pool is saturated or shut down, the RejectedExecutionHandler decides:\n\n1. `AbortPolicy` (the default): throw `RejectedExecutionException`. The caller sees the overload.\n2. `CallerRunsPolicy`: run the task **on the submitting thread**. This is natural back-pressure, because the producer is slowed down by doing the work itself. It does nothing after shutdown.\n3. `DiscardPolicy`: silently drop the task. Dangerous, because nothing is logged and any Future never completes.\n4. `DiscardOldestPolicy`: drop the oldest queued task and retry this one. Suitable only when stale work is worthless (live sensor readings).\n\nCustom handlers can log and record a metric, put the task into an overflow store, or block with `queue.put` (simple, but it can deadlock if it is called after shutdown). Whichever you pick, monitor rejections; they are your overload signal.",
      ],
      [
        "Q55. Why can the Executors factory methods be dangerous in production?",
        "- `newFixedThreadPool(n)` and `newSingleThreadExecutor()` use an **unbounded** LinkedBlockingQueue. Under sustained overload, tasks pile up until OutOfMemoryError, and latency grows without bound with no rejection signal.\n- `newCachedThreadPool()` has max = Integer.MAX_VALUE with a SynchronousQueue, so a burst of slow tasks creates **thousands of threads**, exhausting memory or OS limits.\n- `newScheduledThreadPool(n)` has an unbounded delay queue.\n\nThat is why many style guides (for example Alibaba's Java manual) require constructing `ThreadPoolExecutor` directly with a bounded queue, a naming ThreadFactory and an explicit policy. The factories are fine for tests, demos and bounded workloads. For blocking I/O on Java 21+, `Executors.newVirtualThreadPerTaskExecutor()` is a good default, because virtual threads are cheap; limit the downstream resource with a Semaphore.",
      ],
      [
        "Q56. What is the difference between shutdown, shutdownNow, awaitTermination and close?",
        "- `shutdown()`: stop **accepting** new tasks, but run everything already submitted, including queued tasks. It returns immediately.\n- `shutdownNow()`: stop accepting, **drain** the queue and **return the tasks that never started**, and **interrupt** running workers. Tasks that ignore interruption keep running.\n- `awaitTermination(timeout, unit)`: block until all tasks finish after a shutdown, or until the timeout, returning whether it terminated.\n- `close()` (Java 19, from AutoCloseable): `shutdown()`, then wait until terminated, calling `shutdownNow()` if the waiting thread is interrupted. It enables try-with-resources.\n\nThe recommended graceful pattern: `shutdown()`; `if (!awaitTermination(30, SECONDS)) { shutdownNow(); awaitTermination(...); }`. Forgetting to shut down a pool of non-daemon threads keeps the JVM alive after main ends.",
      ],
      [
        "Q57. What happens to an exception thrown inside a pool task?",
        "It depends on how the task was submitted:\n\n- `execute(Runnable)`: the exception escapes `run()`, the worker thread **dies** (the pool replaces it), and the thread's **UncaughtExceptionHandler** prints it (by default to stderr).\n- `submit(...)`: the task is wrapped in a FutureTask, which **catches** the exception and stores it. Nothing is printed. It is rethrown, wrapped in ExecutionException, only when someone calls `future.get()`. If nobody does, the error **disappears**.\n\nRemedies:\n\n1. Always consume Futures, or use CompletableFuture with `exceptionally` or `whenComplete`.\n2. Catch and log inside the task body.\n3. Override `afterExecute(r, t)` (for submit, `t` is null, so unwrap the Future).\n4. Install an UncaughtExceptionHandler through the ThreadFactory for `execute`-style tasks.",
      ],
      [
        "Q58. What is the difference between scheduleAtFixedRate and scheduleWithFixedDelay?",
        "Both run a task periodically on a ScheduledExecutorService:\n\n- `scheduleAtFixedRate(task, initialDelay, period, unit)` aims for start times at **initial, initial + period, initial + 2 * period**, and so on. If a run takes longer than the period, the next one starts **late, right after**; runs never overlap, but they can bunch up to catch up.\n- `scheduleWithFixedDelay(task, initialDelay, delay, unit)` waits **delay after the previous run ends**, so the gap between runs is constant and the start times drift.\n\nUse fixed rate for clock-like work (metrics every 10 s), and fixed delay for work that must rest between runs (polling a queue). Crucial gotcha: if one execution **throws**, all future executions are **silently cancelled**, and the exception is only visible through the returned ScheduledFuture. Wrap the body in try/catch.",
      ],
      [
        "Q59. What are invokeAll, invokeAny and ExecutorCompletionService?",
        "- `invokeAll(tasks)`: submits all tasks and **waits for all** of them; it returns Futures in the **same order** as the input. The timed version cancels whatever has not finished.\n- `invokeAny(tasks)`: returns the result of the **first task that completes successfully**, and cancels the rest. Good for querying redundant replicas.\n- `ExecutorCompletionService`: wraps an executor and puts each Future on a queue **when it completes**. `take()` returns results in **completion order**, so you can process the fastest first instead of blocking on a slow early task.\n\nFor example, fetch 10 product prices and show each as it arrives: submit all ten to the CompletionService and call `take().get()` ten times. In modern code, `CompletableFuture` with `thenAccept` on each, or structured concurrency, gives similar control.",
      ],
      [
        "Q60. Why write a custom ThreadFactory, and how do you monitor a pool?",
        "A ThreadFactory controls every thread the pool creates. Set:\n\n- a **meaningful name** (`orders-io-3`), so thread dumps and logs show which pool a thread belongs to\n- the **daemon flag**: daemon threads do not keep the JVM alive, which is fine for background work but loses tasks at exit\n- an **UncaughtExceptionHandler** that logs\n- the priority or thread group, if needed\n\nSince Java 21, `Thread.ofPlatform().name(\"orders-\", 0).daemon(false).factory()` and `Thread.ofVirtual().name(\"vt-\", 0).factory()` build factories without a custom class.\n\nTo monitor, export `getPoolSize`, `getActiveCount`, `getQueue().size()`, `getCompletedTaskCount`, `getLargestPoolSize` and a rejection counter to your metrics system (Micrometer's ExecutorServiceMetrics does this). Alert on a growing queue or on rejections, which mean the pool is saturated.",
        "ThreadFactory named = Thread.ofPlatform().name(\"orders-\", 0).factory();",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    public static void main(String[] args) throws Exception {
        // Q51 + Q60: explicit construction with a naming ThreadFactory.
        ThreadFactory named = Thread.ofPlatform().name("orders-", 0).factory();
        CountDownLatch release = new CountDownLatch(1);
        Runnable blocked = () -> { try { release.await(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } };

        ThreadPoolExecutor pool = new ThreadPoolExecutor(
                1, 2,                                   // core 1, max 2
                30, TimeUnit.SECONDS,                   // idle non-core threads end after 30 s
                new ArrayBlockingQueue<>(1),            // Q53: bounded queue with 1 slot
                named,
                new ThreadPoolExecutor.AbortPolicy());  // Q54: the default policy

        // Q52: watch a task flow core thread -> queue -> extra thread -> rejection.
        pool.execute(blocked);
        System.out.println("Q52 task 1 -> new core thread:  pool=" + pool.getPoolSize() + " queue=" + pool.getQueue().size());
        pool.execute(blocked);
        System.out.println("Q52 task 2 -> queued:           pool=" + pool.getPoolSize() + " queue=" + pool.getQueue().size());
        pool.execute(blocked);
        System.out.println("Q52 task 3 -> queue full, extra thread: pool=" + pool.getPoolSize() + " queue=" + pool.getQueue().size());
        try { pool.execute(blocked); }
        catch (RejectedExecutionException e) { System.out.println("Q54 task 4 -> AbortPolicy threw RejectedExecutionException"); }

        // Q54: CallerRunsPolicy runs the overflow task on the submitting thread.
        pool.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        String[] ranOn = new String[1];
        pool.execute(() -> ranOn[0] = Thread.currentThread().getName());
        System.out.println("Q54 CallerRunsPolicy ran the overflow task on: " + ranOn[0]);

        // Q56: shutdownNow returns queued tasks and interrupts the running ones.
        List<Runnable> neverStarted = pool.shutdownNow();
        boolean done = pool.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("Q56 shutdownNow returned " + neverStarted.size() + " queued task, terminated = " + done + ", accepts more = " + !pool.isShutdown());

        try (ExecutorService es = Executors.newFixedThreadPool(3, Thread.ofPlatform().name("worker-", 0).factory())) {
            // Q57: submit captures the exception in the Future.
            Future<?> failing = es.submit(() -> { throw new IllegalStateException("boom"); });
            try { failing.get(); }
            catch (ExecutionException e) { System.out.println("Q57 submit kept the exception until get(): " + e.getCause()); }

            // Q59: completion order, forced by latches: B finishes, then C, then A.
            CountDownLatch bDone = new CountDownLatch(1), cDone = new CountDownLatch(1);
            CompletionService<String> cs = new ExecutorCompletionService<>(es);
            cs.submit(() -> { cDone.await(); return "A"; });
            cs.submit(() -> { bDone.countDown(); return "B"; });
            cs.submit(() -> { bDone.await(); cDone.countDown(); return "C"; });
            List<String> order = new ArrayList<>();
            for (int i = 0; i < 3; i++) order.add(cs.take().get());
            System.out.println("Q59 CompletionService completion order: " + order);

            List<Future<Integer>> all = es.invokeAll(List.<Callable<Integer>>of(() -> 1, () -> 2, () -> 3));
            int sum = 0;
            for (Future<Integer> f : all) sum += f.get();
            System.out.println("Q59 invokeAll keeps input order, sum = " + sum + "; invokeAny = " + es.invokeAny(List.<Callable<String>>of(() -> "replica-ok")));
        }

        // Q58: fixed delay - a periodic task that cancels itself after 3 runs.
        try (ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor()) {
            AtomicInteger runs = new AtomicInteger();
            CountDownLatch threeRuns = new CountDownLatch(3);
            ScheduledFuture<?> periodic = scheduler.scheduleWithFixedDelay(() -> { runs.incrementAndGet(); threeRuns.countDown(); }, 0, 10, TimeUnit.MILLISECONDS);
            threeRuns.await();
            periodic.cancel(false);
            ScheduledFuture<String> once = scheduler.schedule(() -> "ran once after 20 ms", 20, TimeUnit.MILLISECONDS);
            System.out.println("Q58 periodic task ran at least 3 times: " + (runs.get() >= 3) + "; one-shot: " + once.get());

            // Q58 gotcha: a periodic task that throws is cancelled for good.
            ScheduledFuture<?> crashing = scheduler.scheduleAtFixedRate(() -> { throw new RuntimeException("tick failed"); }, 0, 10, TimeUnit.MILLISECONDS);
            try { crashing.get(); }
            catch (ExecutionException e) { System.out.println("Q58 after one exception the periodic task is done: " + crashing.isDone()); }
        }
        // Q55: what the factory methods hide.
        ThreadPoolExecutor fixed = (ThreadPoolExecutor) Executors.newFixedThreadPool(2);
        System.out.println("Q55 newFixedThreadPool queue capacity = " + fixed.getQueue().remainingCapacity() + " (unbounded)");
        fixed.shutdown();
        release.countDown();
    }
}`,
    walk:
      "The pool has 1 core thread, a maximum of 2 and a one-slot ArrayBlockingQueue, and every task blocks on a latch so nothing finishes early. Task 1 starts the core thread (`orders-0`). Task 2 does not create a thread because the pool already has its core thread, so it waits in the queue. Task 3 finds the queue full and the pool below its maximum, so a second thread starts for it. Task 4 has nowhere to go and AbortPolicy throws.\n\nAfter switching to CallerRunsPolicy, the overflow task runs on `main`, the submitting thread. `shutdownNow` hands back the one task still in the queue and interrupts the two blocked workers, which exit, so `awaitTermination` returns true.\n\nThe second pool shows `submit` hiding an exception until `get()`, and a CompletionService returning results in completion order (B, C, A), which the latches force regardless of timing. The scheduler runs a fixed-delay task three times and then cancels it, and shows that one exception permanently stops a periodic task. Finally, the queue behind `newFixedThreadPool` reports a remaining capacity of Integer.MAX_VALUE.",
    anim: [
      "Where ThreadPoolExecutor sends each new task",
      [
        ["submit", "execute(task)", "caller"],
        ["core", "Core threads", "corePoolSize = 1"],
        ["queue", "Work queue", "capacity 1"],
        ["extra", "Extra threads", "up to max = 2"],
        ["reject", "Rejection", "handler"],
      ],
      [
        ["submit", "core", "task 1", "Fewer than corePoolSize threads exist, so a new core thread starts for task 1."],
        ["submit", "queue", "task 2", "The core is full, so task 2 is offered to the queue, which accepts it."],
        ["submit", "extra", "task 3", "The queue is full and the pool is below max, so a non-core thread starts for task 3."],
        ["submit", "reject", "task 4", "Core busy, queue full, max reached: the RejectedExecutionHandler runs (AbortPolicy throws)."],
        ["queue", "core", "task 2 runs", "When a worker finishes, it takes the next task from the queue; extra threads end after keepAliveTime."],
      ],
    ],
    mistakes: [
      "Expecting `maximumPoolSize` to matter with an unbounded queue. Extra threads are created only when the queue is full.",
      "Using `submit` and never calling `get()`, so exceptions vanish silently.",
      "Letting a scheduled periodic task throw. All later runs are cancelled without any log.",
      "Forgetting to shut down a pool of non-daemon threads, which keeps the JVM running after main returns.",
    ],
    qa: [
      [
        "How do you make a pool grow to max threads before it starts queuing?",
        "Use a SynchronousQueue (a hand-off with no queuing, which is how the cached pool works), or a custom queue whose `offer()` returns false while `getPoolSize() < getMaximumPoolSize()`, plus a rejection handler that then puts the task in the queue. Tomcat's TaskQueue does exactly this.",
      ],
      [
        "Can core threads time out?",
        "Yes, after `allowCoreThreadTimeOut(true)`: idle core threads then also end after keepAliveTime, so an idle pool can shrink to zero threads.",
      ],
      [
        "What does a thread pool do after a worker thread dies from an exception?",
        "With `execute`, the exception kills the worker and the pool starts a replacement thread to keep the pool size. With `submit` the worker survives, because FutureTask caught the exception.",
      ],
    ],
    ex: [
      "A pool has core = 2, max = 4 and a queue of capacity 10, and every task blocks. You submit 20 tasks. How many threads run, how many tasks are queued, and how many are rejected?",
      "Tasks 1 and 2 start the two core threads. Tasks 3 to 12 fill the queue (10). Tasks 13 and 14 start threads 3 and 4 (the maximum). Tasks 15 to 20 are rejected: 6 tasks. So 4 threads run, 10 tasks wait in the queue, and 6 are rejected.",
    ],
  }),
];
