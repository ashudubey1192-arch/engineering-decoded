import { lesson } from "../../schema.js";

// Top 100 concurrency and parallelism interview questions, Q81-Q100.
export default [
  lesson("Concurrency and Parallelism Q81-Q90: CompletableFuture Pipelines, Composition, Errors and Timeouts", {
    intro:
      "The ninth block is about **asynchronous composition** with CompletableFuture, the standard way to express \"do this, then that, and combine with the other\" without blocking threads:\n\n- CompletableFuture vs Future, supplyAsync and its default executor\n- thenApply vs thenApplyAsync, and which thread runs a callback\n- thenCompose vs thenCombine, and allOf and anyOf\n- exceptionally, handle and whenComplete, and the CompletionException wrapper\n- timeouts, join vs get vs getNow, cancellation, and designing async fan-out\n\nThe program builds a user, orders and exchange-rate pipeline, recovers from a failure three ways, times out a future that never completes, and shows that `cancel(true)` does not interrupt the running task.",
    topics: [
      [
        "Q81. What does CompletableFuture add over Future?",
        "`Future` (Java 5) can only be **polled or blocked on** with `get()`. CompletableFuture (Java 8) implements both `Future` and `CompletionStage` and adds:\n\n1. **Manual completion**: `complete(value)`, `completeExceptionally(ex)`, so any code (a callback-based HTTP client, a message listener) can finish it.\n2. **Callbacks**: `thenApply`, `thenAccept` and `thenRun` run when the value is ready, so no thread waits.\n3. **Composition**: `thenCompose` chains dependent async steps, and `thenCombine`, `allOf` and `anyOf` join independent ones.\n4. **Error handling** in the pipeline: `exceptionally`, `handle`, `whenComplete`, and (Java 12) `exceptionallyCompose`.\n5. **Timeouts** (Java 9): `orTimeout`, `completeOnTimeout`, and `delayedExecutor` for delays.\n\nIt is the foundation of non-blocking Java APIs, such as `HttpClient.sendAsync` and Spring's `@Async` methods. Its downside is that stack traces and debugging become harder than with straight-line code, which is one reason virtual threads became popular.",
      ],
      [
        "Q82. What do supplyAsync and runAsync do, and which executor do they use?",
        "- `supplyAsync(Supplier<U>)` runs the supplier asynchronously and completes the future with its **result**.\n- `runAsync(Runnable)` does the same for a task with **no result** (`CompletableFuture<Void>`).\n\nWithout an executor argument both use `ForkJoinPool.commonPool()`. If the common pool's parallelism is below 2 (a single-CPU container), they create **a new thread per task** instead. The overloads `supplyAsync(supplier, executor)` and `runAsync(runnable, executor)` use your executor.\n\nPass an explicit executor whenever the task **blocks** (JDBC, HTTP, file I/O) or runs long: the common pool is small (cores - 1) and shared with parallel streams, so blocking tasks starve the whole JVM. A dedicated bounded pool, or `Executors.newVirtualThreadPerTaskExecutor()` on Java 21+, is the safe choice.",
      ],
      [
        "Q83. What is the difference between thenApply and thenApplyAsync, and which thread runs a callback?",
        "- `thenApply(fn)` runs `fn` **synchronously**: if the future is **already** complete when you attach it, `fn` runs immediately on the **calling thread**; otherwise it runs on **whichever thread completes the previous stage**.\n- `thenApplyAsync(fn)` always submits `fn` as a **new task** to the common pool, and `thenApplyAsync(fn, executor)` to your executor.\n\nThe same pairs exist for `thenAccept`, `thenRun`, `thenCompose`, `thenCombine`, `handle` and `whenComplete`.\n\nWhy it matters: a non-async callback can end up running on an HTTP client's selector thread or a Netty event loop and block it, or on the thread that called `complete()`. Use the async variant with a chosen executor when the callback is slow or must not run on the completer's thread; use the plain variant for cheap transformations, to avoid extra hand-offs.",
      ],
      [
        "Q84. What is the difference between thenCompose and thenCombine?",
        "- `thenCompose(fn)` is for **dependent, sequential** async steps: `fn` takes the previous result and returns **another CompletionStage**, and thenCompose flattens it, like `flatMap`. Example: fetch the user, then (needing the user id) fetch their orders.\n- `thenCombine(other, bifn)` is for **independent, parallel** stages: both run at the same time, and `bifn(a, b)` runs when **both** are done. Example: combine the orders total with an exchange rate fetched separately.\n\nA common bug is using `thenApply` with a function that returns a future, which yields a nested `CompletableFuture<CompletableFuture<T>>`. Related methods: `thenAcceptBoth` and `runAfterBoth` (both done, no result), and `applyToEither` and `acceptEither` (the first of two).",
        "user.thenCompose(u -> fetchOrdersAsync(u))          // sequential: needs u\n    .thenCombine(rateAsync, (orders, rate) -> total(orders) * rate);   // parallel join",
      ],
      [
        "Q85. How do allOf and anyOf work?",
        "- `CompletableFuture.allOf(f1, f2, ...)` returns a `CompletableFuture<Void>` that completes when **all** inputs complete. If any fails, it completes exceptionally, but only after all have finished. It carries **no results**, so the idiom is `allOf(fs).thenApply(v -> fs.stream().map(CompletableFuture::join).toList())`; the joins do not block, because everything is done.\n- `CompletableFuture.anyOf(f1, f2, ...)` returns a `CompletableFuture<Object>` that completes with the result (or exception) of the **first** input to complete. The others keep running, so cancel them yourself if needed.\n\nBoth take arrays, so a List needs `toArray(new CompletableFuture[0])`. allOf is the fan-out and fan-in workhorse (call 10 services in parallel and gather), and anyOf suits hedged requests to replicas. Note that a failure does not short-circuit allOf; to fail fast, attach `exceptionally` to each future and complete a result future early.",
      ],
      [
        "Q86. How do you handle exceptions in a CompletableFuture pipeline?",
        "If a stage throws, every dependent stage is skipped and **completes exceptionally** with the same exception, wrapped in a **CompletionException**, until a handler is reached:\n\n- `exceptionally(ex -> fallback)` runs **only on failure** and replaces the exception with a value (`catch`).\n- `handle((value, ex) -> ...)` runs **always** and can transform either outcome (`catch` plus the normal path). Exactly one of value and ex is non-null.\n- `whenComplete((value, ex) -> ...)` runs always, for **side effects** (logging, metrics), and **passes the original outcome through** unchanged (`finally`).\n- `exceptionallyCompose(ex -> otherFuture)` (Java 12) recovers with another async call.\n\nWhen reading the outcome, `join()` throws the unchecked CompletionException, while `get()` throws the checked ExecutionException; in both cases the real error is `getCause()`. Always end a pipeline with a handler or an observer; an exception in a future nobody looks at is lost silently.",
      ],
      [
        "Q87. How do you add timeouts to a CompletableFuture?",
        "Java 9 added two non-blocking timeouts:\n\n- `orTimeout(time, unit)`: if the future has not completed in time, complete it **exceptionally** with `TimeoutException` (wrapped in CompletionException for dependants).\n- `completeOnTimeout(value, time, unit)`: if not complete in time, complete it **normally with a default value**, such as a cached or degraded response.\n\nBoth are scheduled on an internal daemon `Delayer` thread. They do **not** stop the underlying work: the task keeps running and its eventual result is ignored, so pair them with cancellable work or timeouts in the client itself (an HTTP request timeout or a JDBC query timeout). Before Java 9, people used `get(timeout, unit)`, which blocks the caller. `CompletableFuture.delayedExecutor(delay, unit)` (Java 9) is the matching tool for delayed or retry stages.",
      ],
      [
        "Q88. What is the difference between join, get and getNow?",
        "- `get()` comes from Future: it blocks, throws the **checked** `InterruptedException` and `ExecutionException`, and has a timed version `get(timeout, unit)` that throws TimeoutException.\n- `join()` blocks too, but throws the **unchecked** `CompletionException` (or CancellationException) and is **not interruptible**. It is convenient inside lambdas and streams, where checked exceptions are awkward.\n- `getNow(valueIfAbsent)` **never blocks**: it returns the result if complete, otherwise the given default.\n- `resultNow()` and `exceptionNow()` (Java 19) return the result or exception of a completed future and throw IllegalStateException if it is not done.\n- `isDone()`, `isCompletedExceptionally()`, `isCancelled()` and `state()` let you inspect without waiting.\n\nIn a well-designed async pipeline you call join or get at most once, at the outer edge (in main, a test or a controller boundary), never in the middle of the chain.",
      ],
      [
        "Q89. What happens when you cancel a CompletableFuture?",
        "`cancel(mayInterruptIfRunning)` on a CompletableFuture is just `completeExceptionally(new CancellationException())`:\n\n- the future and its dependants complete exceptionally, `isCancelled()` is true, and `join()` throws CancellationException\n- the `mayInterruptIfRunning` flag is **ignored**: the thread running the supplier is **not interrupted**, and the task keeps running to the end, with its result discarded\n\nThat is because a CompletableFuture is not tied to the thread computing it; anyone may complete it. To really stop work, check a shared cancellation flag in the task, use a `FutureTask` or `ExecutorService.submit` Future (whose `cancel(true)` does interrupt), or use structured concurrency, which cancels sibling sub-tasks by interrupting their threads.\n\nRelated: `obtrudeValue` and `obtrudeException` forcibly overwrite an already completed result. They exist for error recovery and are almost never what you want.",
      ],
      [
        "Q90. How do you design a robust async fan-out with CompletableFuture?",
        "A checklist interviewers like to hear:\n\n1. **Own executor** for blocking calls: bounded, with named threads, or a virtual-thread-per-task executor. Never block the common pool.\n2. **Fan out** with `supplyAsync(call, executor)` per service, and **fan in** with `allOf(...).thenApply(v -> join each)` or `thenCombine` for two.\n3. **Per-call timeout and fallback**: `completeOnTimeout(default, ...)` or `orTimeout` followed by `exceptionally`, so one slow service does not hold the whole response.\n4. **Handle every failure** in the chain, and log through `whenComplete` with the request id.\n5. **Do not block inside the chain** (no `join()` in a `thenApply`); compose instead.\n6. **Propagate context** (MDC, tracing, security) explicitly, because callbacks may run on other threads; ThreadLocals do not follow.\n7. **Limit concurrency** to a downstream service with a Semaphore or bulkhead.\n\nOn Java 21+, consider whether plain blocking code on virtual threads with structured concurrency is simpler to read and debug for the same throughput.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.stream.*;

public class Main {

    record User(int id, String name) { }
    record Order(String item, int price) { }

    static User fetchUser(int id) { return new User(id, "ana"); }
    static List<Order> fetchOrders(User user) { return List.of(new Order("book", 30), new Order("pen", 10)); }
    static double fetchRate() { return 0.5; }

    public static void main(String[] args) throws Exception {
        ExecutorService io = Executors.newFixedThreadPool(4, Thread.ofPlatform().name("io-", 0).factory());
        try {
            // Q81: completed manually by another thread.
            CompletableFuture<String> manual = new CompletableFuture<>();
            io.submit(() -> manual.complete("completed by another thread"));
            System.out.println("Q81 " + manual.get());

            // Q82: supplyAsync with an explicit executor.
            String where = CompletableFuture.supplyAsync(() -> Thread.currentThread().getName(), io).join();
            System.out.println("Q82 supplyAsync(task, io) ran on the io pool: " + where.startsWith("io-"));

            // Q83: thenApply on an already completed future runs on the CALLER.
            CompletableFuture<String> done = CompletableFuture.completedFuture("x");
            String syncThread = done.thenApply(v -> Thread.currentThread().getName()).join();
            String asyncThread = done.thenApplyAsync(v -> Thread.currentThread().getName(), io).join();
            System.out.println("Q83 thenApply ran on " + syncThread + ", thenApplyAsync ran on the io pool: " + asyncThread.startsWith("io-"));

            // Q84: compose (dependent) + combine (independent, in parallel).
            CompletableFuture<User> user = CompletableFuture.supplyAsync(() -> fetchUser(7), io);
            CompletableFuture<List<Order>> orders = user.thenCompose(u -> CompletableFuture.supplyAsync(() -> fetchOrders(u), io));
            CompletableFuture<Double> rate = CompletableFuture.supplyAsync(Main::fetchRate, io);
            double total = orders.thenCombine(rate, (list, r) -> list.stream().mapToInt(Order::price).sum() * r).join();
            System.out.println("Q84 orders of " + user.join().name() + " total 40 x rate 0.5 = " + total);
            CompletableFuture<CompletableFuture<List<Order>>> nested = user.thenApply(u -> CompletableFuture.supplyAsync(() -> fetchOrders(u), io));
            System.out.println("Q84 thenApply with an async function gives a nested future: " + (nested.join() instanceof CompletableFuture));

            // Q85: allOf gathers, anyOf takes the first.
            List<CompletableFuture<Integer>> prices = Stream.of(1, 2, 3)
                    .map(i -> CompletableFuture.supplyAsync(() -> i * 10, io)).toList();
            int sum = CompletableFuture.allOf(prices.toArray(new CompletableFuture[0]))
                    .thenApply(v -> prices.stream().mapToInt(CompletableFuture::join).sum()).join();
            Object first = CompletableFuture.anyOf(new CompletableFuture<String>(), CompletableFuture.completedFuture("fast replica")).join();
            System.out.println("Q85 allOf sum = " + sum + ", anyOf = " + first);

            // Q86: three ways to deal with a failed stage.
            CompletableFuture<Integer> failing = CompletableFuture.<Integer>supplyAsync(() -> { throw new IllegalStateException("db down"); }, io);
            int recovered = failing.exceptionally(ex -> -1).join();
            String handled = failing.handle((v, ex) -> ex == null ? "ok" : ex.getClass().getSimpleName() + " caused by " + ex.getCause().getMessage()).join();
            List<String> log = new CopyOnWriteArrayList<>();
            CompletableFuture<Integer> observed = failing.whenComplete((v, ex) -> log.add("logged " + ex.getCause().getMessage()));
            System.out.println("Q86 exceptionally -> " + recovered + "; handle -> " + handled);
            try { observed.join(); } catch (CompletionException e) { System.out.println("Q86 whenComplete " + log + " and passed the failure on: " + e.getCause().getMessage()); }
            try { failing.get(); } catch (ExecutionException e) { System.out.println("Q88 get() throws checked ExecutionException, join() throws unchecked CompletionException"); }

            // Q87: timeouts on futures that never complete.
            String fallback = new CompletableFuture<String>().completeOnTimeout("cached value", 50, TimeUnit.MILLISECONDS).join();
            String timedOut;
            try { new CompletableFuture<String>().orTimeout(50, TimeUnit.MILLISECONDS).join(); timedOut = "no"; }
            catch (CompletionException e) { timedOut = e.getCause().getClass().getSimpleName(); }
            System.out.println("Q87 completeOnTimeout -> " + fallback + ", orTimeout -> " + timedOut);

            // Q88: getNow never blocks.
            System.out.println("Q88 getNow on a pending future -> " + new CompletableFuture<String>().getNow("default"));

            // Q89: cancel(true) does NOT interrupt the running supplier.
            AtomicBoolean interrupted = new AtomicBoolean();
            CountDownLatch started = new CountDownLatch(1), finished = new CountDownLatch(1);
            CompletableFuture<Void> running = CompletableFuture.runAsync(() -> {
                started.countDown();
                try { Thread.sleep(150); } catch (InterruptedException e) { interrupted.set(true); }
                finished.countDown();
            }, io);
            started.await();
            running.cancel(true);
            finished.await();
            System.out.println("Q89 cancelled = " + running.isCancelled() + ", task was interrupted = " + interrupted.get() + " (it ran to the end)");

            // Q90: fan-out with per-call timeouts and fallbacks.
            List<CompletableFuture<String>> calls = Stream.of("inventory", "pricing", "reviews")
                    .map(s -> CompletableFuture.supplyAsync(() -> {
                                if (s.equals("reviews")) { try { Thread.sleep(3_000); } catch (InterruptedException e) { } }
                                return s + ":ok";
                            }, io)
                            .completeOnTimeout(s + ":fallback", 500, TimeUnit.MILLISECONDS))
                    .toList();
            String page = calls.stream().map(CompletableFuture::join).collect(Collectors.joining(", "));
            System.out.println("Q90 fan-out result: " + page);
        } finally {
            io.shutdownNow();
        }
    }
}`,
    walk:
      "Q81 completes a future from a pool thread, and main's `get()` returns that value. Q82 and Q83 record which thread ran each function: with an explicit executor the supplier runs on an `io-` thread; `thenApply` on an already completed future runs right away on main; `thenApplyAsync` hops to the io pool.\n\nQ84 builds the pipeline: the user is fetched, then `thenCompose` fetches the orders using it, while the exchange rate is fetched in parallel; `thenCombine` waits for both and computes (30 + 10) * 0.5 = 20.0. Using `thenApply` instead gives a nested future. Q85 gathers 10 + 20 + 30 with allOf, and anyOf returns the only future that is already complete.\n\nThe failing stage throws IllegalStateException, which dependants see wrapped in CompletionException: `exceptionally` replaces it with -1, `handle` turns it into a message, and `whenComplete` logs it but passes the failure on. The timeouts fire after 50 ms on futures nobody completes. In Q89 `cancel(true)` marks the future cancelled but the task is never interrupted: it sleeps its full 150 ms. Finally, the slow `reviews` call is replaced by its fallback after 500 ms, while the other two return normally.",
    anim: [
      "A CompletableFuture pipeline with a fallback",
      [
        ["user", "supplyAsync", "fetch user"],
        ["orders", "thenCompose", "fetch orders(u)"],
        ["rate", "supplyAsync", "fetch rate"],
        ["combine", "thenCombine", "total x rate"],
        ["fallback", "exceptionally", "default value"],
        ["result", "join()", "at the edge"],
      ],
      [
        ["user", "orders", "User(7, ana)", "The user future completes, and thenCompose starts the dependent orders call with it."],
        ["rate", "combine", "0.5", "Meanwhile the rate was fetched in parallel; thenCombine waits for both inputs."],
        ["orders", "combine", "[book, pen]", "With orders and rate both ready, the combiner computes 40 x 0.5 = 20.0."],
        ["combine", "fallback", "skipped if ok", "exceptionally runs only on failure. Had any stage thrown, it would supply the fallback value."],
        ["fallback", "result", "20.0", "The caller joins once, at the outer edge, and no thread was blocked in the middle of the chain."],
      ],
    ],
    mistakes: [
      "Calling `supplyAsync` without an executor for blocking I/O, which starves the shared common pool.",
      "Using `thenApply` with a function that returns a future, instead of `thenCompose`.",
      "Expecting `cancel(true)` or `orTimeout` to stop the running task. They only complete the future.",
      "Calling `join()` inside a callback in the middle of a chain, which blocks a pool thread and can deadlock a small pool.",
    ],
    qa: [
      [
        "Why might thenApply's function run on a thread you did not expect?",
        "A non-async callback runs on the thread that completes the previous stage, or on the caller if the stage is already complete. That can be an HTTP client thread, the `Delayer` thread of a timeout, or main. Use the Async variant with your executor to control it.",
      ],
      [
        "What is the difference between handle and whenComplete?",
        "Both see the value or the exception. `handle` returns a new value, so it can recover. `whenComplete` returns nothing and propagates the original result or exception unchanged; it is for side effects such as logging.",
      ],
      [
        "Does allOf fail fast when the first future fails?",
        "No. It completes only after every input has completed, then completes exceptionally if any of them failed. To fail fast, add an `exceptionally` (or `whenComplete`) to each input that completes a shared result future early.",
      ],
    ],
    ex: [
      "Given `CompletableFuture<Price> a` from supplier A and `b` from supplier B, return the cheaper price, but if one supplier fails, use the other; if both fail, return Price.UNKNOWN.",
      "Recover each side to Optional: `var oa = a.thenApply(Optional::of).exceptionally(ex -> Optional.empty());` and the same for b. Then `oa.thenCombine(ob, (x, y) -> Stream.of(x, y).flatMap(Optional::stream).min(Comparator.comparing(Price::amount)).orElse(Price.UNKNOWN))`. Both calls run in parallel, a single failure is tolerated, and nothing blocks.",
    ],
  }),

  lesson("Concurrency and Parallelism Q91-Q100: Virtual Threads, Pinning, Structured Concurrency, Scoped Values, Testing and Debugging", {
    intro:
      "The final block covers **modern Java concurrency** (Java 21 to 26) and the practical skills that close a senior interview:\n\n- virtual threads: what they are, how they mount on carrier threads, and when they help\n- pinning, why you should not pool virtual threads, and limiting concurrency with semaphores\n- ThreadLocal vs ScopedValue, and structured concurrency\n- a checklist for designing a thread-safe class\n- testing and debugging concurrent code\n\nThe program (compiled with `--release 25` for the final ScopedValue API) starts 10,000 virtual threads that each sleep, caps 50 of them at three concurrent \"database calls\", binds a ScopedValue, runs a starting-gate stress test 100 times, and inspects a thread dump.",
    topics: [
      [
        "Q91. What are virtual threads?",
        "Virtual threads (JEP 444, final in Java 21) are `java.lang.Thread` instances **managed by the JVM rather than the OS**. Their stacks live on the heap as resizable chunks, so they cost a few hundred bytes to a few KB instead of about 1 MB of reserved stack, and creating one costs about as much as creating an object. You can run **millions** of them.\n\nWays to create them:\n\n- `Thread.ofVirtual().start(task)` or `Thread.startVirtualThread(task)`\n- `Executors.newVirtualThreadPerTaskExecutor()`\n- `Thread.ofVirtual().name(\"worker-\", 0).factory()`\n\nThey are always **daemon** threads with normal priority, and `isVirtual()` returns true. The point is to let you write simple **blocking, thread-per-request** code that scales like asynchronous code: when a virtual thread blocks on I/O, a lock or `sleep`, it is parked cheaply and its carrier runs something else.",
      ],
      [
        "Q92. How do virtual threads run: what are carrier threads and mounting?",
        "The JVM schedules virtual threads onto a small pool of platform threads called **carriers**: a dedicated work-stealing ForkJoinPool with about one carrier per core (`-Djdk.virtualThreadScheduler.parallelism`).\n\n1. **Mount**: a runnable virtual thread is assigned a carrier, and its stack frames are copied from the heap onto the carrier's stack (lazily, as needed).\n2. It runs like any thread until it **blocks** in a JDK operation that supports it (socket or file I/O, `sleep`, `LockSupport.park`, BlockingQueue, ReentrantLock and, since JDK 24, `synchronized`).\n3. **Unmount**: the JDK saves the frames back to the heap as a continuation, frees the carrier, and the carrier picks the next runnable virtual thread.\n4. When the I/O completes or the lock is released, the virtual thread becomes runnable and **mounts again**, possibly on a different carrier.\n\nThis is all user-mode work and much cheaper than an OS context switch. `Thread.currentThread()` always returns the virtual thread, never the carrier.",
      ],
      [
        "Q93. When do virtual threads help, and when do they not?",
        "They help with **high concurrency of I/O-bound, blocking tasks**: servers handling thousands of simultaneous requests, each mostly waiting on databases, HTTP calls or queues. Throughput grows with the number of tasks in flight, without a thread-pool limit and without rewriting code into callbacks.\n\nThey do **not** help:\n\n- **CPU-bound** work: there are still only as many carriers as cores, so 10,000 CPU-heavy virtual threads are no faster than a pool of `cores` platform threads. Use Fork/Join or parallel streams.\n- **Latency of a single task**: a virtual thread is not faster than a platform thread; it is just cheaper.\n- When the **bottleneck is downstream**: if the database allows 20 connections, 10,000 virtual threads simply queue for them.\n\nRemember Little's law: concurrency = throughput * latency. Virtual threads raise the concurrency you can afford; they do not lower latency.",
      ],
      [
        "Q94. What is pinning, and how did JDK 24 change it?",
        "A virtual thread is **pinned** when it cannot unmount while blocked, so it blocks its **carrier** too. With few carriers, a handful of pinned threads can stall the whole scheduler, and in the worst case deadlock it.\n\nCauses:\n\n1. Blocking **inside a `synchronized` block or method**. This was the main cause in Java 21 to 23, because monitors were tied to the OS thread. **JDK 24 (JEP 491)** reimplemented monitors so virtual threads can unmount while holding or waiting for one; this pinning is gone on JDK 24+.\n2. Blocking while a **native method** or a foreign function is on the stack (JNI calls, some file I/O on some OSes). This still pins.\n3. Class initialization (static initializers) that blocks.\n\nOn older JDKs, replace `synchronized` around blocking I/O with `ReentrantLock`. To diagnose, use the JFR event `jdk.VirtualThreadPinned` (the `-Djdk.tracePinnedThreads` flag was removed in JDK 24). The JDK may temporarily add carriers to compensate for some pinned operations such as `Object.wait()`.",
      ],
      [
        "Q95. Why should you not pool virtual threads, and how do you limit concurrency instead?",
        "Thread pools exist because platform threads are **expensive**, so you create a few and reuse them. Virtual threads are **cheap**, so pooling them adds complexity and no benefit; the rule is **one new virtual thread per task**, then let it end. A pool of virtual threads also brings back the pool's queuing and starvation problems.\n\nPeople used pool sizes for a second purpose: **limiting concurrency** to protect a resource (\"at most 10 calls to the payment API\"). With virtual threads, limit the **resource**, not the threads:\n\n- a `Semaphore(10)` around the call, acquired and released in finally\n- a bounded connection pool (HikariCP), which blocks virtual threads cheaply while they wait\n- a rate limiter, or a bulkhead from Resilience4j\n\nAlso avoid caching expensive objects in ThreadLocals on virtual threads (each of a million threads would get its own copy).",
      ],
      [
        "Q96. How do ThreadLocals behave with virtual threads, and what are scoped values?",
        "ThreadLocals **work** on virtual threads, and each virtual thread has its own values, but they fit badly:\n\n- with millions of short-lived threads, per-thread caches (a parser, a buffer) are rebuilt for every task and multiply memory use\n- values are **mutable** and live until `remove()`, which makes data flow hard to follow\n- `InheritableThreadLocal` copies the whole map to each child thread, which is costly\n\n**ScopedValue** (JEP 506, final in **Java 25**) is the replacement for passing context such as the current user, request id or transaction:\n\n- `ScopedValue.where(USER, alice).run(() -> handle())` binds the value **for the duration of that call only**\n- code called from there reads `USER.get()`; outside the scope it is **unbound**\n- it is **immutable** within the scope (rebind with a nested `where`), automatically cleaned up, and cheaply inherited by sub-tasks forked with structured concurrency\n\nThink of it as an implicit, read-only method parameter with a well-defined lifetime.",
        "static final ScopedValue<String> USER = ScopedValue.newInstance();\nScopedValue.where(USER, \"alice\").run(() -> service.handle());   // USER.get() inside\n",
      ],
      [
        "Q97. What is structured concurrency?",
        "Structured concurrency (JEP 505 in Java 25 and JEP 525 in Java 26, still a **preview API**) treats a group of related sub-tasks as **one unit of work**, the way a block structures sequential code:\n\n1. Open a `StructuredTaskScope` in try-with-resources.\n2. `fork()` each sub-task; each runs in its own (virtual) thread.\n3. `join()` waits for them according to a **policy** (a Joiner): by default fail if any fails, or `anySuccessfulResultOrThrow()` for the first success, or `allSuccessfulOrThrow()`.\n4. Read the results from the Subtasks; leaving the block guarantees no sub-task is still running.\n\nThe benefits over ad-hoc executors and CompletableFuture: if one sub-task fails, its siblings are **cancelled** (interrupted) automatically; if the parent is cancelled, the children are too; there are **no leaked threads**; and thread dumps show the parent-child tree. Because it is preview, using it requires `--enable-preview`, and the API changed between releases.",
        "try (var scope = StructuredTaskScope.open()) {          // preview API (JDK 25-26)\n    Subtask<User>  user  = scope.fork(() -> findUser(id));\n    Subtask<Order> order = scope.fork(() -> fetchOrder(id));\n    scope.join();                                         // fails fast, cancels the sibling\n    return new Page(user.get(), order.get());\n}",
      ],
      [
        "Q98. How do you design a thread-safe class?",
        "A step-by-step checklist (in the spirit of Java Concurrency in Practice):\n\n1. **Identify the state**: every field, including objects reachable from it.\n2. **Identify the invariants**, such as `lower <= upper` or `balance >= 0`, and which variables they tie together.\n3. **Choose a policy** for each piece of state: immutable (final, no setters), confined (one thread or ThreadLocal), guarded by a lock, or delegated to a thread-safe class (ConcurrentHashMap, AtomicLong).\n4. Guard **all** variables of one invariant with the **same lock**, and hold it for the whole compound action.\n5. Use a **private final lock object** instead of `this`, so outside code cannot interfere or deadlock with you.\n6. **Do not let state escape**: return copies or unmodifiable views, and do not leak `this` from constructors.\n7. Keep critical sections short, and never call alien code while holding the lock.\n8. **Document** it: `@ThreadSafe` or `@GuardedBy(\"lock\")`, so maintainers keep the policy.\n\nPrefer composition of thread-safe parts, but remember that thread-safe parts do not automatically make a thread-safe whole.",
      ],
      [
        "Q99. How do you test concurrent code?",
        "Concurrency bugs are timing-dependent, so normal unit tests rarely catch them. Techniques:\n\n- **Starting gate**: create N threads that all `await()` a CountDownLatch(1), then release them at once to maximize overlap; a second latch waits for them all to finish. Repeat the test many times and check invariants (totals, no duplicates).\n- **More threads than cores** and random small sleeps or `Thread.yield()` to shake up interleavings.\n- **Deterministic tests** of logic: inject an Executor (`Runnable::run` for same-thread execution) or a controllable Clock, and use latches to force a specific interleaving.\n- **jcstress** (the OpenJDK Java Concurrency Stress harness) for memory-model level tests: it runs tiny actors millions of times and reports which outcomes (acceptable, forbidden, interesting) occurred.\n- **Static analysis**: SpotBugs (inconsistent synchronization), Error Prone's `@GuardedBy` checker.\n- **Timeouts** on every test (`assertTimeout`, `@Timeout`), so a deadlock fails the test instead of hanging the build.\n\nAnd test on the target hardware: ARM machines expose reordering bugs that x86 hides.",
      ],
      [
        "Q100. How do you debug and profile concurrency problems in production?",
        "1. **Thread dumps**, taken 3 to 5 times a few seconds apart: `jstack <pid>`, `jcmd <pid> Thread.print`, or for virtual threads `jcmd <pid> Thread.dump_to_file -format=json file.json`, which includes virtual threads grouped by their structured-concurrency scopes. Look for BLOCKED threads waiting on the same lock, \"Found one Java-level deadlock\", and threads whose stacks never move.\n2. **Java Flight Recorder and Mission Control**: `jcmd <pid> JFR.start duration=60s filename=rec.jfr`. Events such as `jdk.JavaMonitorEnter`, `jdk.ThreadPark` and `jdk.VirtualThreadPinned` show where threads wait and for how long.\n3. **Profilers** such as async-profiler in lock or wall-clock mode, to find contention and false sharing.\n4. **Metrics**: pool queue sizes, active counts, rejections, and connection-pool wait times.\n5. **Programmatic checks**: `ThreadMXBean.findDeadlockedThreads()`, `getThreadInfo` with lock info, and contention monitoring (`setThreadContentionMonitoringEnabled`).\n\nThe reasoning steps: is a thread **waiting** (deadlock, starvation, slow downstream), **spinning** (livelock, busy loop), or are you seeing **wrong values** (a race, which needs code review, logs with thread names, and stress tests)?",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.stream.*;

public class Main {

    // Q96: a scoped value replaces a ThreadLocal for request context (final in Java 25).
    static final ScopedValue<String> USER = ScopedValue.newInstance();

    static String handle(String path) { return USER.get() + " -> " + path; }

    // Q98: a thread-safe class - private lock, one invariant, no escaping state.
    static final class Inventory {
        private final Object lock = new Object();
        private final Map<String, Integer> stock = new HashMap<>();   // guarded by lock
        void add(String item, int qty) { synchronized (lock) { stock.merge(item, qty, Integer::sum); } }
        boolean take(String item, int qty) {
            synchronized (lock) {                                     // check AND act under one lock
                int have = stock.getOrDefault(item, 0);
                if (have < qty) return false;
                stock.put(item, have - qty);
                return true;
            }
        }
        Map<String, Integer> snapshot() { synchronized (lock) { return Map.copyOf(stock); } }
    }

    public static void main(String[] args) throws Exception {
        // Q91: building a virtual thread.
        Thread vt = Thread.ofVirtual().name("vt-demo").unstarted(() -> { });
        System.out.println("Q91 isVirtual = " + vt.isVirtual() + ", daemon = " + vt.isDaemon() + ", name = " + vt.getName());
        vt.start();
        vt.join();

        // Q92: a virtual thread's toString shows the carrier it is mounted on.
        String[] seen = new String[1];
        Thread.ofVirtual().start(() -> seen[0] = Thread.currentThread().toString()).join();
        System.out.println("Q92 mounted on a ForkJoinPool carrier: " + seen[0].contains("ForkJoinPool"));

        // Q93: 10,000 blocking tasks, one virtual thread each.
        try (ExecutorService perTask = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Integer>> results = IntStream.range(0, 10_000)
                    .mapToObj(i -> perTask.submit(() -> { Thread.sleep(50); return i; }))
                    .toList();
            long sum = 0;
            for (Future<Integer> f : results) sum += f.get();
            System.out.println("Q93 10,000 virtual threads slept 50 ms each; sum of ids = " + sum);
        }

        // Q95: limit the RESOURCE with a semaphore, not the threads.
        Semaphore database = new Semaphore(3);
        AtomicInteger inside = new AtomicInteger(), peak = new AtomicInteger();
        try (ExecutorService perTask = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 50; i++) perTask.submit(() -> {
                database.acquire();
                try {
                    peak.accumulateAndGet(inside.incrementAndGet(), Math::max);
                    Thread.sleep(5);
                    inside.decrementAndGet();
                } finally { database.release(); }
                return null;
            });
        }
        System.out.println("Q95 50 virtual threads, never more than 3 inside the database: " + (peak.get() <= 3));

        // Q96: bound only inside the call.
        String result = ScopedValue.where(USER, "alice").call(() -> handle("/orders"));
        System.out.println("Q96 " + result + "; USER bound outside the scope: " + USER.isBound());
        ThreadLocal<String> local = new ThreadLocal<>();
        local.set("main's value");
        String[] fromVirtual = new String[1];
        Thread.ofVirtual().start(() -> fromVirtual[0] = String.valueOf(local.get())).join();
        System.out.println("Q96 a ThreadLocal set on main is " + fromVirtual[0] + " in a new virtual thread");
        local.remove();

        // Q98 + Q99: a starting-gate stress test, repeated 100 times.
        boolean allConsistent = true;
        for (int trial = 0; trial < 100; trial++) {
            Inventory inventory = new Inventory();
            inventory.add("cpu", 10);
            CountDownLatch gate = new CountDownLatch(1);
            AtomicInteger sold = new AtomicInteger();
            try (ExecutorService perTask = Executors.newVirtualThreadPerTaskExecutor()) {
                for (int buyer = 0; buyer < 16; buyer++) perTask.submit(() -> {
                    gate.await();                                    // everyone starts together
                    if (inventory.take("cpu", 1)) sold.incrementAndGet();
                    return null;
                });
                gate.countDown();
            }
            allConsistent &= sold.get() == 10 && inventory.snapshot().get("cpu") == 0;
        }
        System.out.println("Q99 100 trials x 16 buyers for 10 CPUs: never oversold = " + allConsistent);

        // Q100: a programmatic thread dump.
        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        boolean mainListed = Arrays.stream(mx.dumpAllThreads(true, true)).anyMatch(info -> info.getThreadName().equals("main"));
        System.out.println("Q100 dumpAllThreads lists main: " + mainListed + "; deadlocks now: " + (mx.findDeadlockedThreads() == null ? 0 : mx.findDeadlockedThreads().length));
    }
}`,
    release: 25,
    walk:
      "`Thread.ofVirtual().unstarted` builds a virtual thread: `isVirtual()` is true and it is always a daemon. Inside a virtual thread, `toString()` names the carrier it is currently mounted on, a worker of the JVM's ForkJoinPool scheduler.\n\nQ93 submits 10,000 tasks that each sleep 50 ms. With platform threads this would need 10,000 OS threads or a long queue; here each sleep unmounts its virtual thread, the few carriers keep running others, and the whole batch finishes in a fraction of a second. The sum of the ids 0 to 9,999 is 49,995,000.\n\nQ95 starts 50 virtual threads freely, and the Semaphore(3) ensures at most three are ever inside the simulated database. Q96 binds USER only for the duration of `call`, so `handle` sees `alice` and the value is unbound afterwards; a ThreadLocal set on main is not visible in a new virtual thread, which prints null.\n\nThe Q99 stress test releases 16 buyers through a starting gate at once, 100 times, against an Inventory whose check and decrement happen under one private lock: every trial sells exactly 10 and leaves 0. Q100 takes a programmatic thread dump and confirms there are no deadlocks.",
    anim: [
      "Virtual threads mounting and unmounting on carriers",
      [
        ["v1", "virtual 1", "calls the DB"],
        ["v2", "virtual 2", "computes"],
        ["v3", "virtual 3", "waiting to run"],
        ["carrier", "Carrier thread", "ForkJoinPool"],
        ["heap", "Heap", "parked stacks"],
      ],
      [
        ["v1", "carrier", "mount", "Virtual thread 1 is mounted: its frames are copied onto the carrier's stack and it runs."],
        ["v1", "heap", "unmount on I/O", "It blocks on a socket read, so the JDK saves its stack to the heap and frees the carrier."],
        ["v2", "carrier", "mount", "The same carrier immediately runs virtual thread 2; no OS thread was blocked."],
        ["heap", "carrier", "I/O done: resume", "When the data arrives, virtual thread 1 is runnable again and mounts on the next free carrier."],
        ["v3", "carrier", "queued, cheap", "Thousands more can wait their turn; they cost heap memory, not OS threads."],
      ],
    ],
    mistakes: [
      "Using virtual threads for CPU-bound work and expecting a speedup. Carriers are limited to the core count.",
      "Putting virtual threads in a fixed-size pool. Create one per task and limit the resource with a Semaphore instead.",
      "Blocking inside `synchronized` on JDK 21 to 23, which pins the carrier. Upgrade to JDK 24+ or use ReentrantLock.",
      "Caching heavy objects in ThreadLocals when there are millions of virtual threads.",
    ],
    qa: [
      [
        "Can a virtual thread be a non-daemon thread, or have a priority?",
        "No. Virtual threads are always daemon threads with NORM_PRIORITY; `setDaemon(false)` throws IllegalArgumentException and `setPriority` is ignored. Use structured concurrency, or join the threads, to wait for them.",
      ],
      [
        "Do virtual threads replace reactive frameworks such as Reactor or RxJava?",
        "For the goal of scalable blocking I/O they mostly do, with simpler code and normal stack traces. Reactive libraries still offer streaming operators, back-pressure and event-driven composition, which you may want for genuinely stream-shaped problems.",
      ],
      [
        "What is the difference between ScopedValue and InheritableThreadLocal?",
        "InheritableThreadLocal copies mutable values to every child thread when it is created and keeps them until removed. A ScopedValue binding is immutable, lasts only for a bounded call, and is shared without copying with sub-tasks forked inside a StructuredTaskScope.",
      ],
    ],
    ex: [
      "A service handles 5,000 concurrent requests, and each makes one 200 ms call to a partner API that allows at most 50 concurrent calls. Design it with virtual threads and explain the expected throughput.",
      "Run each request on its own virtual thread (`newVirtualThreadPerTaskExecutor` or a virtual-thread web server), and wrap the partner call in a shared `Semaphore(50)`: `acquire()` before the call and `release()` in finally, perhaps with `tryAcquire(timeout)` to fail fast. By Little's law the partner limit caps throughput at 50 / 0.2 s = 250 calls per second; the 5,000 virtual threads simply park cheaply while waiting for a permit, and no thread pool has to be tuned.",
    ],
  }),
];
