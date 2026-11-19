import { lesson } from "../../schema.js";

export default [
  lesson("JDK Top 100 Q77-Q88: Virtual Threads, Pinning, Structured Concurrency and Scoped Values", {
    intro:
      "Questions 77 to 88 cover Project Loom, the biggest change to Java concurrency since Java 5:\n\n- what virtual threads are and how they work, and how to create them\n- when they help and when they do not\n- carrier threads, mounting and pinning, and what changed in Java 24\n- pooling, ThreadLocals and best practices\n- structured concurrency (preview through JDK 27)\n- scoped values (final in 25)\n\nThe program runs 10,000 virtual threads, a structured fan-out, and scoped values. It compiles with `--release 26 --enable-preview`, because StructuredTaskScope is still a preview API.",
    topics: [
      [
        "Q77. What are virtual threads?",
        "Virtual threads (preview in 19 and 20, **final in Java 21**, JEP 444) are **lightweight threads implemented by the JDK**, not by the OS. They are instances of `java.lang.Thread`, so existing code, debuggers and thread dumps work with them. They are cheap to create (a few hundred bytes to start, with stacks stored on the heap and growing as needed), so an application can run **millions** at once. When a virtual thread blocks on I/O, a lock, `sleep` or a BlockingQueue, the JVM **unmounts** it from its carrier OS thread and runs another virtual thread on that carrier. That makes the simple **thread-per-request** style scale like asynchronous code, without callbacks or reactive chains.",
      ],
      [
        "Q78. How do you create virtual threads?",
        "- `Thread.startVirtualThread(runnable)`\n- `Thread.ofVirtual().name(\"worker-\", 0).start(runnable)`, or `.unstarted(r)` and `.factory()`\n- `Executors.newVirtualThreadPerTaskExecutor()`, which creates a **new virtual thread for every submitted task**, with no pool; use it in try-with-resources so `close()` waits for all tasks\n- `Executors.newThreadPerTaskExecutor(Thread.ofVirtual().factory())`\n- frameworks: Spring Boot 3.2+ with `spring.threads.virtual.enabled=true`, and Tomcat, Jetty, Helidon Níma and Quarkus\n\nCheck a thread with `Thread.currentThread().isVirtual()`. Virtual threads are always daemon threads, with NORM_PRIORITY.",
      ],
      [
        "Q79. How do virtual threads work internally?",
        "A virtual thread is a **continuation** (a resumable stack of frames) plus a **scheduler**. By default the scheduler is a work-stealing **ForkJoinPool** of **carrier threads**, one per core (`jdk.virtualThreadScheduler.parallelism`). Running a virtual thread **mounts** its continuation on a carrier. When the code reaches a blocking point in the JDK (socket read, `Thread.sleep`, `LockSupport.park`, which is used by locks and queues), the JDK **yields** the continuation. Its frames are copied to the heap, the carrier is freed, and the I/O is registered with a poller. When the I/O is ready, the virtual thread is rescheduled on any carrier. All JDK blocking APIs were reworked for this, so blocking is cheap.",
      ],
      [
        "Q80. When do virtual threads help, and when do they not?",
        "They help **I/O-bound, high-concurrency** workloads: web servers, microservices calling other services and databases, message consumers, and crawlers, where threads spend most of their time waiting. Throughput scales with the number of concurrent tasks instead of the pool size. They do **not** make CPU-bound code faster: the core count still limits it, so use parallel streams or a fixed pool sized to the cores. They do not remove downstream limits either: a database pool of 20 connections still allows only 20 concurrent queries, so use a Semaphore or pool limits. Latency per request does not improve; only scalability does.",
      ],
      [
        "Q81. What is pinning, and what changed in Java 24?",
        "A virtual thread is **pinned** when it cannot unmount from its carrier while it blocks, so it ties up an OS thread like a platform thread. Up to **Java 23**, blocking inside a **`synchronized`** block or method (or `Object.wait()`) pinned the thread. **JEP 491 (Java 24)** reimplemented monitors so that virtual threads **can unmount inside synchronized**, which removed the most common pinning cause. Pinning still occurs during **native calls** (JNI and FFM downcalls) and some class initialisers. JFR's `jdk.VirtualThreadPinned` event, and on older JDKs `-Djdk.tracePinnedThreads`, help find it. On Java 21 to 23, prefer ReentrantLock around blocking I/O.",
      ],
      [
        "Q82. Should you pool virtual threads?",
        "**No.** Pools exist because platform threads are expensive. Virtual threads are cheap, so create **one per task** and let them end. Pooling them would add contention and complexity, and limit concurrency for no benefit. To **limit concurrency** (for example, at most 10 concurrent calls to a rate-limited API), use a **Semaphore**, not a small pool. Keep existing fixed pools for CPU-bound work. Replace `newFixedThreadPool(200)` used for blocking I/O with `newVirtualThreadPerTaskExecutor()`.",
      ],
      [
        "Q83. What should you watch out for with ThreadLocals and virtual threads?",
        "ThreadLocals still work in virtual threads: each virtual thread has its own values. But with **millions of threads**, heavy per-thread caches (for example, a ThreadLocal holding a large buffer or a SimpleDateFormat used as a cache) multiply memory use, and the cache is useless, because each thread lives for one task. Avoid ThreadLocal **caching** in code that may run on virtual threads. Use immutable shared objects (DateTimeFormatter) or explicit pools instead. For passing **context** down the call stack, prefer **ScopedValue** (Java 25), which is immutable, bounded and cheap to inherit. InheritableThreadLocals are copied into every child thread, which is costly.",
      ],
      [
        "Q84. What are the best practices for virtual threads?",
        "1. Write **plain blocking code**. There is no need for CompletableFuture chains just for scalability.\n2. Use **one virtual thread per task**, through `newVirtualThreadPerTaskExecutor()` in try-with-resources.\n3. **Limit access to scarce resources** with Semaphores or connection pools, not with thread counts.\n4. Avoid **pinning**: on Java 21 to 23, replace synchronized around I/O with ReentrantLock; Java 24 and later handle it.\n5. Do not **pool** virtual threads, and do not cache heavy objects in ThreadLocals.\n6. Keep CPU-heavy work on platform-thread pools.\n7. Monitor with JFR and the new thread-dump format (`jcmd <pid> Thread.dump_to_file -format=json`).\n8. Make sure libraries use JDK blocking APIs, rather than native blocking that would pin.\n9. Use **structured concurrency** to manage groups of related tasks.",
      ],
      [
        "Q85. What is structured concurrency?",
        "Structured concurrency (incubator in 19, **preview from 21 through 27**: JEP 505 in 25, **525 in 26**, **533 in 27**) treats a **group of related concurrent tasks as one unit of work** with a clear lifetime, like a code block. `StructuredTaskScope` (opened with `StructuredTaskScope.open()` since JDK 25) **forks** subtasks onto virtual threads, **joins** them, and guarantees that when the scope closes, **every subtask has completed or been cancelled**: no leaked threads. If one subtask fails, the default joiner cancels the others and `join()` throws. Thread dumps show the parent-child hierarchy. It replaces error-prone ExecutorService plus Future fan-outs, where a failure in one task left the others running.",
      ],
      [
        "Q86. How do you use StructuredTaskScope (JDK 25 to 27 API)?",
        "`try (var scope = StructuredTaskScope.open()) { Subtask<User> u = scope.fork(() -> findUser(id)); Subtask<List<Order>> o = scope.fork(() -> orders(id)); scope.join(); return new Page(u.get(), o.get()); }`\n\n`open()` uses the default policy: all subtasks must succeed, and the first failure cancels the rest and is rethrown by `join()` as a FailedException. Other **Joiners** change the policy:\n\n- `Joiner.anySuccessfulResultOrThrow()`: the first success wins, as in racing replicas\n- `Joiner.allSuccessfulOrThrow()`\n- `Joiner.awaitAll()`\n- custom joiners\n\nA timeout can be configured through the scope's configuration function. Compile and run with `--enable-preview`.",
      ],
      [
        "Q87. What are scoped values?",
        "Scoped values (incubator in 20, previews in 21 to 24, **final in Java 25**, JEP 506) share **immutable data** with code deeper in the call stack, and with child threads in a structured scope, **without passing parameters**. They are a better ThreadLocal for context. You declare one with `static final ScopedValue<User> CURRENT_USER = ScopedValue.newInstance();`, bind it with `ScopedValue.where(CURRENT_USER, user).run(() -> handle())`, and read it anywhere inside with `CURRENT_USER.get()`. The value is **bound only for the duration of `run` or `call`**. It **cannot be changed**, only rebound for a nested scope. Reads are fast, and inheritance into StructuredTaskScope subtasks is cheap, because nothing is copied.",
      ],
      [
        "Q88. How do scoped values compare with ThreadLocal?",
        "- **Mutability**: a ThreadLocal is mutable at any time with `set`; a ScopedValue is immutable once bound, and can only be rebound in a nested scope.\n- **Lifetime**: a ThreadLocal value lives until `remove()` or the thread's death, so leaks in pools are common; a ScopedValue is bound **exactly** for the lexical scope of `run` or `call`.\n- **Inheritance**: an InheritableThreadLocal copies its value into every child thread, which is expensive; a ScopedValue is shared with structured subtasks for free.\n- **Performance**: ScopedValue reads can be optimised like a local variable.\n- **Use**: ThreadLocal for per-thread mutable state, such as a legacy cache; ScopedValue for request context (user, transaction, trace id), especially with virtual threads.",
      ],
    ],
    code: String.raw`import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.StructuredTaskScope.Subtask;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    record User(int id, String name) { }
    record Page(User user, List<String> orders) { }

    // Q87: a scoped value carrying the current request's user.
    static final ScopedValue<String> REQUEST_USER = ScopedValue.newInstance();

    static User findUser(int id) throws InterruptedException { Thread.sleep(50); return new User(id, "user" + id); }
    static List<String> findOrders(int id) throws InterruptedException { Thread.sleep(80); return List.of("o" + id + "-1", "o" + id + "-2"); }
    static String auditLine() { return "audit by " + REQUEST_USER.get() + " on " + (Thread.currentThread().isVirtual() ? "virtual" : "platform") + " thread"; }

    public static void main(String[] args) throws Exception {
        // Q77 + Q78: creating virtual threads.
        Thread vt = Thread.ofVirtual().name("vt-demo").start(() -> { });
        vt.join();
        System.out.println("Q78 ofVirtual: isVirtual " + vt.isVirtual() + ", daemon " + vt.isDaemon() + ", name " + vt.getName());

        // Q79 + Q80: 10,000 blocking tasks finish quickly because sleeping threads release their carriers.
        Instant start = Instant.now();
        AtomicInteger done = new AtomicInteger();
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) exec.submit(() -> { Thread.sleep(Duration.ofMillis(100)); return done.incrementAndGet(); });
        }                                                                       // close() waits for all tasks
        long ms = Duration.between(start, Instant.now()).toMillis();
        System.out.println("Q80 10,000 virtual threads each slept 100 ms: completed " + done.get() + ", well under 10 s: " + (ms < 10_000));

        // Q81: synchronized no longer pins (Java 24+); ReentrantLock never did.
        Object monitor = new Object();
        ReentrantLock lock = new ReentrantLock();
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 1000; i++) {
                exec.submit(() -> { synchronized (monitor) { Thread.sleep(1); } return null; });
                exec.submit(() -> { lock.lock(); try { Thread.sleep(1); } finally { lock.unlock(); } return null; });
            }
        }
        System.out.println("Q81 2000 virtual threads blocked inside synchronized and ReentrantLock sections and all finished");

        // Q82: limit concurrency with a Semaphore, not a pool.
        Semaphore apiLimit = new Semaphore(10);
        AtomicInteger inFlight = new AtomicInteger(), peak = new AtomicInteger();
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 200; i++) exec.submit(() -> {
                apiLimit.acquire();
                try { peak.accumulateAndGet(inFlight.incrementAndGet(), Math::max); Thread.sleep(10); inFlight.decrementAndGet(); }
                finally { apiLimit.release(); }
                return null;
            });
        }
        System.out.println("Q82 200 virtual threads, Semaphore(10): peak concurrent calls = " + peak.get());

        // Q85 + Q86: structured fan-out - both subtasks run in parallel, scope waits for both.
        Instant t0 = Instant.now();
        Page page;
        try (var scope = StructuredTaskScope.open()) {
            Subtask<User> user = scope.fork(() -> findUser(7));
            Subtask<List<String>> orders = scope.fork(() -> findOrders(7));
            scope.join();                                                       // waits for both, throws if one failed
            page = new Page(user.get(), orders.get());
        }
        long fanOutMs = Duration.between(t0, Instant.now()).toMillis();
        System.out.println("Q86 " + page + ", ran in parallel (under the 130 ms a sequential run needs): " + (fanOutMs < 130));

        // Q85: one failure cancels the sibling and surfaces from join().
        try (var scope = StructuredTaskScope.open()) {
            scope.fork(() -> { Thread.sleep(5000); return "slow sibling"; });
            scope.fork(() -> { throw new IllegalStateException("inventory service down"); });
            scope.join();
        } catch (StructuredTaskScope.FailedException e) {
            System.out.println("Q85 scope failed fast: " + e.getCause().getMessage() + " (slow sibling was cancelled)");
        }

        // Q87 + Q88: scoped value bound for the request, visible in callees and in forked subtasks.
        ScopedValue.where(REQUEST_USER, "asha").run(() -> {
            System.out.println("Q87 " + auditLine());
            try (var scope = StructuredTaskScope.open()) {
                Subtask<String> child = scope.fork(Main::auditLine);              // inherits the binding
                scope.join();
                System.out.println("Q88 subtask sees binding: " + child.get());
            } catch (Exception e) { throw new RuntimeException(e); }
        });
        System.out.println("Q88 outside the scope the value is unbound: " + !REQUEST_USER.isBound());
    }
}`,
    release: 26,
    preview: true,
    walk:
      "Q78 starts a named virtual thread and confirms that it is virtual and a daemon. For Q80, 10,000 tasks each sleep for 100 ms on their own virtual thread. Sleeping unmounts each one from its carrier, so they all complete in well under the 1,000 seconds that sequential execution would take, using only a handful of OS threads. The executor's `close()` waits for all of them. Q81 blocks 2,000 virtual threads inside `synchronized` and ReentrantLock sections, which completes without the pinning starvation that synchronized caused before Java 24. Q82 limits 200 virtual threads to 10 concurrent \"API calls\" with a Semaphore, and the observed peak is 10.\n\nQ86 forks the user and orders lookups (50 ms and 80 ms) in a StructuredTaskScope, so the page is ready after about 80 ms. In Q85 one subtask fails, so the scope cancels its slow sibling and `join()` throws FailedException. In Q87 and Q88, the scoped value is visible in a method called inside `run`, and in a forked subtask, which runs on a virtual thread and inherits the binding. Outside the scope the value is unbound. The lesson compiles with `--release 26 --enable-preview`.",
    anim: [
      "Virtual threads on carrier threads",
      [
        ["vt1", "virtual thread A", "calls socket read"],
        ["vt2", "virtual thread B", "ready to run"],
        ["carrier", "carrier thread", "ForkJoinPool"],
        ["poller", "I/O poller", "waits on OS"],
        ["heap", "heap", "saved stack"],
      ],
      [
        ["vt1", "carrier", "mount", "A is mounted on a carrier OS thread and runs until it blocks on I/O."],
        ["vt1", "heap", "unmount", "At the blocking call the JDK saves A's stack frames to the heap."],
        ["vt1", "poller", "register", "The socket is registered with the poller; no OS thread waits for it."],
        ["vt2", "carrier", "mount B", "The free carrier immediately runs virtual thread B."],
        ["poller", "vt1", "data ready", "When data arrives, A is rescheduled and remounted on any free carrier."],
      ],
    ],
    varies: true,
    mistakes: [
      "Pooling virtual threads, or limiting them with a fixed-size pool. Create one per task, and limit resources with Semaphores.",
      "Expecting virtual threads to speed up CPU-bound computation.",
      "Holding big per-thread caches in ThreadLocals when running millions of virtual threads.",
      "Forgetting `--enable-preview` when using StructuredTaskScope on JDK 21 to 27.",
    ],
    qa: [
      [
        "Are virtual threads faster than platform threads?",
        "Not for a single task. They are about scalability: many more concurrent blocking tasks on the same hardware, with higher throughput for I/O-bound servers.",
      ],
      [
        "Can a virtual thread be a daemon or have a priority?",
        "Virtual threads are always daemon threads with NORM_PRIORITY. `setDaemon(false)` throws IllegalArgumentException, and `setPriority` is ignored.",
      ],
      [
        "Does reactive programming become obsolete?",
        "For scalability alone, largely yes: blocking code on virtual threads achieves similar throughput and is easier to read and debug. Reactive streams still shine for back-pressure, streaming data and complex event composition.",
      ],
    ],
    ex: [
      "Rewrite a fan-out that uses `newFixedThreadPool(50)` and three `Future.get()` calls (user, orders, recommendations) so that a failure in any call cancels the others and no thread leaks.",
      "`try (var scope = StructuredTaskScope.open()) { var u = scope.fork(() -> user(id)); var o = scope.fork(() -> orders(id)); var r = scope.fork(() -> recs(id)); scope.join(); return new Page(u.get(), o.get(), r.get()); }`. Each fork runs on its own virtual thread. The first failure cancels the siblings, and `join()` throws. The scope cannot be exited while subtasks are still running.",
    ],
  }),

  lesson("JDK Top 100 Q89-Q100: Sequenced Collections, FFM API, Compact Source Files, Flexible Constructors, Lazy Constants and JDK 25-27", {
    intro:
      "The final questions, 89 to 100, cover the newest features:\n\n- sequenced collections (Java 21)\n- the Foreign Function & Memory API (22)\n- the Class-File API (24)\n- compact source files with instance main methods, module import declarations, and flexible constructor bodies (all final in 25)\n- the KDF API and compact object headers\n- lazy constants (preview in 25 to 27)\n- the AOT cache\n- what JDK 26 and JDK 27 bring\n\nThe program uses Java 25's final features plus JDK 26 previews (lazy constants and primitive patterns), compiled with `--release 26 --enable-preview`.",
    topics: [
      [
        "Q89. What are sequenced collections (Java 21)?",
        "JEP 431 added three interfaces for collections with a **defined encounter order**:\n\n- **SequencedCollection** (implemented by List, Deque and LinkedHashSet): `getFirst()`, `getLast()`, `addFirst`, `addLast`, `removeFirst`, `removeLast` and **`reversed()`**, which returns a reverse-ordered **view**\n- **SequencedSet** (LinkedHashSet, TreeSet)\n- **SequencedMap** (LinkedHashMap, TreeMap): `firstEntry()`, `lastEntry()`, `pollFirstEntry()`, `putFirst`, `putLast`, `sequencedKeySet()` and `reversed()`\n\nBefore this, getting the last element meant `list.get(list.size() - 1)`, `deque.peekLast()` or iterating a LinkedHashSet. Now there is one uniform API. Unmodifiable collections throw UnsupportedOperationException from the mutators.",
      ],
      [
        "Q90. What is the Foreign Function & Memory API (Java 22)?",
        "FFM (`java.lang.foreign`, JEP 454, final in 22) replaces **JNI** and `sun.misc.Unsafe` for interoperating with native code and memory:\n\n- an **Arena** controls the lifetime of off-heap memory\n- a **MemorySegment** is a bounds-checked region of memory, on-heap or off-heap\n- **ValueLayout** and **MemoryLayout** describe the data\n- a **Linker** produces **downcall** method handles to C functions found with a **SymbolLookup**, and **upcall** stubs for callbacks\n\nIt is safer (bounds and lifetime checks), faster to develop with (no C glue code), and **jextract** generates Java bindings from C headers. Restricted methods print warnings unless `--enable-native-access` is given.",
      ],
      [
        "Q91. What is the Class-File API (Java 24)?",
        "JEP 484 (final in 24) provides a **standard API for parsing, generating and transforming class files** (`java.lang.classfile`). Frameworks no longer need to bundle ASM, which always lagged behind new class-file versions. The JDK itself (lambdas, proxies, jlink) migrated to it. You build a class with `ClassFile.of().build(ClassDesc.of(\"Hello\"), cb -> cb.withMethod(...))`, and transform one with `ClassFile.of().transformClass(model, transform)`. It is mainly for tools, agents and frameworks that generate bytecode.",
      ],
      [
        "Q92. What are compact source files and instance main methods (Java 25)?",
        "JEP 512 (final in 25, after previews since 21) makes small programs **simpler to write**:\n\n- a source file can omit the class declaration: its top-level methods and fields form an **implicitly declared class**\n- `main` can be an **instance method** with no `String[]` parameter and no `public static`: `void main() { IO.println(\"Hello\"); }`\n- the new **`java.lang.IO`** class provides `println`, `print` and `readln` for the console\n- compact source files automatically import the `java.base` module\n\nThe launch protocol picks a static `main(String[])` first and then the other forms. It is aimed at beginners and scripts, and grows naturally into ordinary classes.",
      ],
      [
        "Q93. What are module import declarations (Java 25)?",
        "JEP 511 (final in 25) adds `import module M;`, which imports **all public top-level types of all packages exported by module M**, and of the modules it reads transitively. `import module java.base;` gives you java.util, java.io, java.time, java.util.stream, java.util.concurrent and the rest in one line, and `import module java.sql;` gives JDBC. If two imported modules export the same simple name (`Date` from java.util and java.sql), you resolve the ambiguity with a single-type import. It works in any source file, not only in modular code, and is ideal for scripts, JShell and prototypes.",
      ],
      [
        "Q94. What are flexible constructor bodies (Java 25)?",
        "JEP 513 (final in 25, previewed as statements before super) allows **statements before `super(...)` or `this(...)`** in a constructor. You can validate arguments, compute values to pass up, or prepare data, **as long as that code does not touch the instance under construction** (no reading fields or calling instance methods). It can **assign fields of the class itself** before the super call. That prevents the classic bug where a superclass constructor calls an overridden method that sees uninitialised subclass fields. Before this, validation had to be squeezed into static helper calls inside the `super(...)` argument list.",
      ],
      [
        "Q95. What are lazy constants (formerly stable values)?",
        "**Stable Values** (JEP 502, preview in 25) were renamed **Lazy Constants** (JEP 526, second preview in **26**, JEP 531, third preview in **27**). A `LazyConstant<T>`, created with `LazyConstant.of(supplier)`, holds a value that is **computed at most once, on first `get()`**, thread-safely, and is then treated by the JIT as a **true constant**, like a `static final` field, enabling constant folding. They give deferred initialisation (faster startup, as with the holder-class idiom or double-checked locking) without giving up performance. There are also lazy lists and maps whose elements are computed on demand. They need `--enable-preview`.",
      ],
      [
        "Q96. What are the KDF API and compact object headers (Java 25)?",
        "**JEP 510** adds `javax.crypto.KDF`, a standard **Key Derivation Function** API, with **HKDF** built in (`KDF.getInstance(\"HKDF-SHA256\")` with extract and expand parameters). It is the foundation for hybrid public-key encryption and post-quantum TLS. **JEP 519** makes **compact object headers** a product feature in 25: object headers shrink from 12 or 16 bytes to **8 bytes** on 64-bit JVMs, saving 10 to 20% of heap in object-heavy applications and improving cache locality. It is enabled with `-XX:+UseCompactObjectHeaders` in 25 and 26, and **on by default in JDK 27** (JEP 534).",
      ],
      [
        "Q97. What is the AOT cache (Project Leyden, Java 24 to 26)?",
        "Ahead-of-time features reduce **startup and warm-up** time:\n\n- **JEP 483 (24)**: an **AOT cache** of classes that are already loaded and linked, created from a training run (`-XX:AOTMode=record`, then `create`, then `-XX:AOTCache=app.aot`).\n- **JEP 514 (25)**: command-line ergonomics, a one-step `-XX:AOTCacheOutput`.\n- **JEP 515 (25)**: **method profiles** stored in the cache, so the JIT starts optimising sooner.\n- **JEP 516 (26)**: **AOT object caching with any GC**, including ZGC.\n\nStartup improves by around 40% or more for typical frameworks such as Spring, without GraalVM native-image restrictions, because it is still the normal JVM.",
      ],
      [
        "Q98. What does JDK 26 (March 2026) bring?",
        "Ten JEPs. The final ones:\n\n- **JEP 500, Prepare to Make Final Mean Final**: warnings when deep reflection mutates final fields, ahead of future integrity enforcement\n- **JEP 504, Remove the Applet API**\n- **JEP 516, AOT Object Caching with Any GC**\n- **JEP 517, HTTP/3 for the HTTP Client**\n- **JEP 522, G1 GC throughput improvements** (reduced synchronization)\n\nThe previews and incubators:\n\n- **PEM encodings** of cryptographic objects (2nd preview, JEP 524)\n- **Structured Concurrency** (6th preview, JEP 525)\n- **Lazy Constants** (2nd preview, JEP 526)\n- **Vector API** (11th incubator, JEP 529)\n- **Primitive types in patterns** (4th preview, JEP 530)\n\nJDK 26 is not an LTS.",
      ],
      [
        "Q99. What does JDK 27 (September 2026) bring?",
        "Nine JEPs. The final ones:\n\n- **JEP 523**: G1 is the default collector in every environment, including small machines that previously got Serial\n- **JEP 534**: compact object headers by default\n- **JEP 527**: post-quantum **hybrid key exchange for TLS 1.3**, combining classical ECDHE with ML-KEM\n- **JEP 536**: JFR in-process **redaction of sensitive data** in recordings\n\nThe previews and incubators:\n\n- **Lazy Constants** (3rd preview, JEP 531)\n- **Primitive types in patterns** (5th preview, JEP 532)\n- **Structured Concurrency** (7th preview, JEP 533)\n- **Vector API** (12th incubator, JEP 537)\n- **PEM encodings** (3rd preview, JEP 538)\n\nIt is not an LTS; the next LTS is expected to be JDK 29 in September 2027.",
      ],
      [
        "Q100. Which Java version should a team use today, and how do you migrate?",
        "Production teams should run the **latest LTS that their frameworks support**. In late 2026 that means **Java 25**, or Java 21 at minimum. Java 8 and 11 lack virtual threads, records, pattern matching and years of GC and performance work, and their free updates are ending. Migration steps:\n\n1. Upgrade build tools and plugins (Maven, Gradle, Surefire, Lombok, ByteBuddy and ASM-based libraries).\n2. Run the tests on the new JDK, and use **jdeps** for removed modules (Java EE and CORBA in 11, Nashorn in 15).\n3. Fix illegal reflective access with `--add-opens` or library upgrades (17).\n4. Watch the deprecations: the Security Manager, finalization, Thread.stop and the Applet API.\n5. Adopt the new features gradually: `var`, records, switch expressions, then virtual threads.\n\nKeep testing on the latest non-LTS release in CI to catch problems early.",
      ],
    ],
    code: String.raw`import module java.base;                                  // Q93: one import for java.util, java.time, ...
import java.lang.foreign.*;
import java.lang.invoke.MethodHandle;

public class Main {

    // Q94: flexible constructor body - validate and compute before super().
    static class Account {
        final String id;
        Account(String id) { this.id = id; }
    }
    static class SavingsAccount extends Account {
        final double rate;
        SavingsAccount(String rawId, double rate) {
            if (rate < 0 || rate > 0.2) throw new IllegalArgumentException("bad rate " + rate);  // before super()
            String normalised = rawId.strip().toUpperCase();
            this.rate = rate;                                          // own field assigned before super()
            super(normalised);
        }
    }

    // Q95: a lazy constant, computed once on first access (preview).
    static final LazyConstant<String> CONFIG = LazyConstant.of(() -> {
        IO.println("Q95   computing CONFIG once");
        return "loaded-config";
    });

    // Q76 (primitive patterns, preview): pick the narrowest exact type.
    static String fits(long value) {
        return switch (value) {
            case byte b -> "fits in a byte (" + b + ")";
            case int i -> "fits in an int";
            case long l -> "needs a long";
        };
    }

    void main() throws Throwable {                             // Q92: instance main method, no String[] needed
        // Q89: sequenced collections.
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
        LinkedHashMap<String, Integer> scores = new LinkedHashMap<>(Map.of("a", 1));
        scores.putFirst("z", 26);
        scores.putLast("m", 13);
        IO.println("Q89 getFirst " + list.getFirst() + ", getLast " + list.getLast() + ", reversed view " + list.reversed()
                + ", map firstEntry " + scores.firstEntry() + ", lastEntry " + scores.lastEntry() + ", reversed keys " + scores.reversed().keySet());

        // Q90: FFM - off-heap memory and a downcall to C's strlen.
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment ints = arena.allocate(ValueLayout.JAVA_INT, 4);
            for (int i = 0; i < 4; i++) ints.setAtIndex(ValueLayout.JAVA_INT, i, i * i);
            Linker linker = Linker.nativeLinker();
            MethodHandle strlen = linker.downcallHandle(linker.defaultLookup().find("strlen").orElseThrow(),
                    FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));
            MemorySegment cString = arena.allocateFrom("foreign memory");
            IO.println("Q90 off-heap ints[3] = " + ints.getAtIndex(ValueLayout.JAVA_INT, 3) + ", C strlen(\"foreign memory\") = " + (long) strlen.invokeExact(cString));
        }                                                      // memory freed deterministically here

        // Q91: Class-File API - parse this class's own bytes.
        byte[] bytes;
        try (InputStream in = Main.class.getResourceAsStream("Main.class")) { bytes = in.readAllBytes(); }
        var model = java.lang.classfile.ClassFile.of().parse(bytes);
        IO.println("Q91 Class-File API parsed " + model.thisClass().asInternalName() + " with " + model.methods().size() + " methods");

        // Q94
        SavingsAccount acc = new SavingsAccount("  sb-01 ", 0.07);
        IO.println("Q94 flexible constructor: id " + acc.id + ", rate " + acc.rate);
        try { new SavingsAccount("x", 0.9); } catch (IllegalArgumentException e) { IO.println("Q94 validated before super(): " + e.getMessage()); }

        // Q95
        IO.println("Q95 first get -> " + CONFIG.get());
        IO.println("Q95 second get -> " + CONFIG.get() + " (no recomputation)");

        // Q96: KDF API (HKDF) derives a key.
        javax.crypto.KDF hkdf = javax.crypto.KDF.getInstance("HKDF-SHA256");
        var params = javax.crypto.spec.HKDFParameterSpec.ofExtract()
                .addIKM("input-key-material".getBytes()).addSalt("salt".getBytes())
                .thenExpand("context".getBytes(), 32);
        javax.crypto.SecretKey key = hkdf.deriveKey("AES", params);
        IO.println("Q96 HKDF derived a " + key.getAlgorithm() + " key of " + key.getEncoded().length * 8 + " bits");

        // Q76 primitive patterns (preview in 26 and 27).
        for (long v : new long[] {42, 100_000, 10_000_000_000L}) IO.println("Q76 " + v + " " + fits(v));

        // Q98: HTTP/3 is a selectable version in JDK 26's HttpClient.
        IO.println("Q98 HttpClient.Version values: " + Arrays.toString(java.net.http.HttpClient.Version.values()));
        IO.println("Q100 running on JDK 25 or newer: " + (Runtime.version().feature() >= 25) + "; the newest LTS is 25");
    }
}`,
    release: 26,
    preview: true,
    walk:
      "The file starts with `import module java.base;`, so List, Map, Arrays and InputStream need no individual imports (Q93). `main` is an instance method without parameters, launched by the Java 25 protocol, and output goes through `IO.println` (Q92). Q89 uses getFirst, getLast and reversed on a list, and putFirst, putLast and the first and last entries on a LinkedHashMap. Q90 allocates four ints off-heap in a confined Arena, and calls C's `strlen` through a downcall handle, which returns 14. The memory is freed when the arena closes. Q91 parses the program's own class file with the standard Class-File API.\n\nQ94's subclass validates the rate and normalises the id **before** `super(...)`, which is legal since Java 25. A bad rate is rejected before any superclass code runs. Q95's lazy constant prints its computation once, then returns the cached value. Q96 derives a 256-bit AES key with HKDF. The primitive-pattern switch picks the narrowest type each long fits into (Q76). Q98 lists HTTP_3 among the HttpClient versions on JDK 26. The program needs `--release 26 --enable-preview`, because of LazyConstant and primitive patterns. The JDK 27 changes (Q99) are runtime defaults and previews, described in the text.",
    anim: [
      "Flexible constructor body (Java 25)",
      [
        ["call", "new Savings(...)", "client"],
        ["pre", "prologue", "validate, compute"],
        ["own", "own fields", "this.rate = rate"],
        ["sup", "super(id)", "Account ctor"],
        ["post", "epilogue", "object complete"],
      ],
      [
        ["call", "pre", "enter", "The constructor starts with ordinary statements: no instance access yet."],
        ["pre", "pre", "validate", "The bad-rate check runs before any superclass code: fail fast."],
        ["pre", "own", "assign field", "Fields of this class may be assigned before super(...) (but not read)."],
        ["own", "sup", "super(normalised)", "The computed id is passed up; Account initialises its part."],
        ["sup", "post", "continue", "After super returns, the rest of the constructor may use 'this' freely."],
      ],
    ],
    mistakes: [
      "Reading `this` fields or calling instance methods before `super(...)` in a flexible constructor body. Only assignments to the class's own fields are allowed.",
      "Using preview APIs (LazyConstant, StructuredTaskScope, primitive patterns) without `--enable-preview` at both compile time and run time.",
      "Assuming `list.reversed()` copies the list. It is a live view.",
      "Forgetting `--enable-native-access` when using FFM restricted methods in production. Otherwise the JVM prints warnings, and future versions will deny the access.",
    ],
    qa: [
      [
        "Is `void main()` usable in a normal class too?",
        "Yes. Since Java 25 the launcher accepts instance and no-argument main methods in any class, not only in compact source files. A static `main(String[])` still takes priority if present.",
      ],
      [
        "What happens if two module imports export the same class name?",
        "Using the simple name is ambiguous and does not compile. Add a single-type import (`import java.util.Date;`), which shadows the on-demand module import.",
      ],
      [
        "Does FFM replace JNI completely?",
        "For new code, yes: it has no C glue, it is safer, and jextract generates the bindings. JNI remains supported for existing libraries.",
      ],
    ],
    ex: [
      "Write a compact source file (Java 25) that reads lines with `IO.readln` until \"quit\", and prints each line reversed.",
      "`void main() { String line; while (!(line = IO.readln(\"> \")).equals(\"quit\")) IO.println(new StringBuilder(line).reverse()); }`. Save it as Rev.java and run `java Rev.java`. No class declaration, imports or static are needed.",
    ],
  }),
];
