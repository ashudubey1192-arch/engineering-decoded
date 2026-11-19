import { lesson, section } from "../schema.js";

export default section("concurrency", "Thread Concurrency (java.util.concurrent)", [
  lesson("Executor and ExecutorService: execute() vs submit()", {
    intro:
      "The Executor framework (Java 5) separates submitting tasks from deciding how and on which threads they run. Instead of creating threads by hand, you hand tasks to an `ExecutorService` backed by a thread pool. This lesson covers the Executor interfaces, the factory methods in `Executors`, task submission, shutdown, and the similarities and differences between `execute()` and `submit()`.",
    topics: [
      [
        "Executor, ExecutorService and ScheduledExecutorService",
        "`Executor` has one method, `execute(Runnable)`. `ExecutorService` extends it with `submit`, `invokeAll`, `invokeAny`, `shutdown`, `shutdownNow`, `awaitTermination` and `close()` (Java 19, for try-with-resources). `ScheduledExecutorService` adds `schedule`, `scheduleAtFixedRate` and `scheduleWithFixedDelay`.",
      ],
      [
        "Creating executors",
        "`Executors.newFixedThreadPool(n)` (n threads, unbounded queue), `newCachedThreadPool()` (grows as needed, idle threads die after 60 s), `newSingleThreadExecutor()` (one thread, tasks in order), `newScheduledThreadPool(n)`, `newWorkStealingPool()` (ForkJoinPool) and `newVirtualThreadPerTaskExecutor()` (Java 21). In production, `new ThreadPoolExecutor(...)` with a bounded queue and a rejection policy gives full control.",
      ],
      [
        "Shutting down",
        "`shutdown()` stops accepting new tasks and lets queued ones finish; `shutdownNow()` also interrupts running tasks and returns the queued ones; `awaitTermination(timeout)` waits for completion. Pool threads are non-daemon, so forgetting to shut down keeps the JVM alive.",
      ],
      [
        "execute() vs submit(): similarities",
        "Both hand a task to the executor for asynchronous execution on a pool thread and return immediately. Both accept a `Runnable`.",
      ],
      [
        "execute() vs submit(): differences",
        "`execute(Runnable)` comes from `Executor`, returns void, and an exception thrown by the task propagates to the worker thread's uncaught exception handler. `submit(...)` comes from `ExecutorService`, also accepts a `Callable`, returns a `Future` for the result, cancellation and status, and captures any exception inside the Future (seen only via `get()` as an `ExecutionException`).",
      ],
    ],
    code: String.raw`import java.util.List;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3, r -> {
            Thread t = new Thread(r);
            t.setUncaughtExceptionHandler((th, e) -> System.out.println("  execute(): exception reached the thread handler: " + e.getMessage()));
            return t;
        });

        CountDownLatch done = new CountDownLatch(1);
        pool.execute(() -> { System.out.println("  execute(): runs, returns nothing"); done.countDown(); });
        done.await();

        Future<Integer> future = pool.submit(() -> 6 * 7);            // Callable with a result
        System.out.println("  submit(Callable) result: " + future.get());

        Future<?> runnableFuture = pool.submit(() -> System.out.print(""));
        System.out.println("  submit(Runnable) future.get() returns: " + runnableFuture.get());

        Future<?> failing = pool.submit(() -> { throw new IllegalStateException("captured"); });
        try {
            failing.get();
        } catch (ExecutionException e) {
            System.out.println("  submit(): exception wrapped in ExecutionException: " + e.getCause().getMessage());
        }
        pool.execute(() -> { throw new IllegalStateException("not captured"); });
        Thread.sleep(100);

        List<Callable<String>> jobs = List.of(() -> "a", () -> "b", () -> "c");
        StringBuilder all = new StringBuilder();
        for (Future<String> f : pool.invokeAll(jobs)) all.append(f.get());
        System.out.println("  invokeAll: " + all + ", invokeAny: " + pool.invokeAny(List.of(() -> "first")));

        pool.shutdown();
        System.out.println("  terminated after shutdown: " + pool.awaitTermination(5, TimeUnit.SECONDS));
        try {
            pool.submit(() -> 1);
        } catch (RejectedExecutionException e) {
            System.out.println("  submit after shutdown -> RejectedExecutionException");
        }

        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        ScheduledFuture<String> later = scheduler.schedule(() -> "ran after 100 ms", 100, TimeUnit.MILLISECONDS);
        System.out.println("  scheduled: " + later.get());
        scheduler.shutdown();

        try (ExecutorService virtual = Executors.newVirtualThreadPerTaskExecutor()) {   // close() waits
            System.out.println("  virtual executor result: " + virtual.submit(() -> "hello").get());
        }
    }
}`,
    walk:
      "The pool's thread factory installs an uncaught exception handler so the difference between the two methods is visible. `execute` runs a Runnable and returns nothing. `submit` returns a `Future`: for a Callable it holds the result (42), for a Runnable `get()` returns null.\n\nAn exception in a submitted task is captured and rethrown by `get()` as `ExecutionException`, while the same exception from `execute` reaches the thread's handler. `invokeAll` runs several Callables and waits for all of them; `invokeAny` returns the first successful result. After `shutdown`, the pool terminates and rejects new tasks. A scheduled executor runs a task after a delay, and a virtual-thread executor closes itself in try-with-resources.",
    anim: [
      "Submitting to an executor",
      [
        ["caller", "caller", "submit(task)"],
        ["queue", "work queue", "pending tasks"],
        ["worker", "pool thread", "runs task"],
        ["future", "Future", "result / error"],
        ["get", "future.get()", "blocks for result"],
      ],
      [
        ["caller", "queue", "enqueue", "submit() places the task in the pool's queue and returns at once."],
        ["caller", "future", "returns", "The caller immediately gets a Future representing the pending result."],
        ["queue", "worker", "take", "A free pool thread takes the task and runs it."],
        ["worker", "future", "complete", "The result or exception is stored in the Future."],
        ["get", "future", "wait", "future.get() waits until the result is ready, rethrowing failures."],
      ],
    ],
    mistakes: [
      "Never shutting down an executor, which keeps the JVM running.",
      "Using `submit()` and never calling `get()`, silently losing exceptions.",
      "Using `newFixedThreadPool` or `newCachedThreadPool` with unbounded growth in production without limits.",
    ],
    qa: [
      ["What is the difference between execute() and submit()?", "execute takes a Runnable, returns void and lets exceptions reach the thread's handler; submit takes Runnable or Callable, returns a Future and captures exceptions in it."],
      ["What is the difference between shutdown() and shutdownNow()?", "shutdown lets queued tasks finish but accepts no new ones; shutdownNow interrupts running tasks and returns the unstarted ones."],
      ["Why use an ExecutorService instead of creating threads?", "It reuses threads, bounds concurrency, queues work, provides Futures and lifecycle management, and separates task logic from execution policy."],
    ],
    ex: [
      "Process 100 independent image resizes with at most 4 running at once, and wait for all of them. Sketch the code.",
      "`ExecutorService pool = Executors.newFixedThreadPool(4); List<Future<?>> fs = images.stream().map(img -> pool.submit(() -> resize(img))).toList(); for (Future<?> f : fs) f.get(); pool.shutdown();`.",
    ],
  }),

  lesson("Callable and Future: Callable vs Runnable", {
    intro:
      "`Runnable` cannot return a value or throw a checked exception. `Callable<V>`, added in Java 5, can do both, and a `Future<V>` represents its pending result. This lesson explains Callable, the Future API (get with timeout, cancel, isDone), FutureTask, and the differences between Callable and Runnable, with a look at CompletableFuture.",
    topics: [
      [
        "Callable",
        "`interface Callable<V> { V call() throws Exception; }`. Submit it with `executor.submit(callable)` to get a `Future<V>`. Because `call()` may throw any exception, it suits tasks like fetching data over the network.",
      ],
      [
        "Future",
        "`get()` waits for the result and throws `ExecutionException` (wrapping the task's exception) or `InterruptedException`. `get(timeout, unit)` throws `TimeoutException` if the result is not ready in time. `isDone()`, `isCancelled()` and `cancel(mayInterruptIfRunning)` manage the task. Since Java 19, `state()`, `resultNow()` and `exceptionNow()` inspect completed futures without blocking.",
      ],
      [
        "FutureTask",
        "`FutureTask<V>` implements both `Runnable` and `Future<V>`, wrapping a Callable. You can run it on any thread (`new Thread(futureTask).start()`) and read the result through the Future API. Executors use it internally.",
      ],
      [
        "Callable vs Runnable",
        "Method: `call()` vs `run()`. Return value: V vs void. Checked exceptions: allowed vs not. Usage: `ExecutorService.submit` and `invokeAll` vs `Thread`, `execute` and `submit`. Introduced: Java 5 vs Java 1.0. `Executors.callable(runnable, result)` adapts one to the other.",
      ],
      [
        "Beyond Future: CompletableFuture",
        "Plain futures can only be polled or blocked on. `CompletableFuture` (Java 8) adds non-blocking composition: `supplyAsync`, `thenApply`, `thenCombine`, `allOf`, `exceptionally`, so you can chain dependent asynchronous steps.",
      ],
    ],
    code: String.raw`import java.util.concurrent.*;

public class Main {
    static String fetchPrice(String sku, long delayMs) throws Exception {
        Thread.sleep(delayMs);
        if (sku.isBlank()) throw new java.io.IOException("empty sku");     // checked exception allowed
        return sku + ": 499";
    }

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Callable<String> task = () -> fetchPrice("pen", 100);
        Future<String> future = pool.submit(task);
        System.out.println("isDone right after submit: " + future.isDone());
        System.out.println("get(): " + future.get() + ", isDone now: " + future.isDone());

        Future<String> slow = pool.submit(() -> fetchPrice("desk", 2_000));
        try {
            slow.get(200, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            System.out.println("get(200 ms) -> TimeoutException; cancel(true): " + slow.cancel(true) + ", isCancelled: " + slow.isCancelled());
        }

        Future<String> broken = pool.submit(() -> fetchPrice(" ", 10));
        try {
            broken.get();
        } catch (ExecutionException e) {
            System.out.println("checked exception from call(): " + e.getCause().getClass().getSimpleName() + " - " + e.getCause().getMessage());
        }
        System.out.println("state(): " + broken.state() + ", exceptionNow(): " + broken.exceptionNow().getMessage());

        FutureTask<Integer> futureTask = new FutureTask<>(() -> 21 * 2);
        new Thread(futureTask).start();                                   // a FutureTask is a Runnable
        System.out.println("FutureTask on a plain thread: " + futureTask.get());

        Runnable runnable = () -> { };
        Callable<String> adapted = Executors.callable(runnable, "adapted result");
        System.out.println("Runnable adapted to Callable: " + pool.submit(adapted).get());

        CompletableFuture<String> combined = CompletableFuture.supplyAsync(() -> "pen")
                .thenApply(String::toUpperCase)
                .thenCombine(CompletableFuture.supplyAsync(() -> 499), (name, price) -> name + " costs " + price);
        System.out.println("CompletableFuture chain: " + combined.get());
        pool.shutdown();
    }
}`,
    walk:
      "The Callable returns a price and may throw a checked `IOException`. Right after `submit` the future is not done; `get()` waits about 100 ms and returns the value. For the slow task, `get(200, ms)` gives up with `TimeoutException`, and `cancel(true)` interrupts the task.\n\nThe broken task's checked exception arrives wrapped in `ExecutionException`, and the Java 19 `state()` and `exceptionNow()` methods inspect it without blocking. A `FutureTask` runs on a plain thread and still delivers its result. `Executors.callable` adapts a Runnable, and `CompletableFuture` composes two asynchronous results without blocking in between.",
    anim: [
      "Callable to Future",
      [
        ["callable", "Callable<V>", "call() returns V"],
        ["pool", "executor", "runs call()"],
        ["future", "Future<V>", "placeholder"],
        ["ok", "result", "get() returns"],
        ["err", "exception", "ExecutionExc"],
      ],
      [
        ["callable", "pool", "submit", "Submitting a Callable hands it to a pool thread."],
        ["pool", "future", "link", "The caller receives a Future that will hold the outcome."],
        ["future", "ok", "success", "If call() returns normally, get() returns its value."],
        ["future", "err", "failure", "If call() throws, get() throws ExecutionException wrapping the cause."],
      ],
    ],
    mistakes: [
      "Calling `get()` without a timeout on tasks that might hang.",
      "Ignoring that `cancel(true)` only interrupts; the task must respond to interruption.",
      "Calling `future.get()` immediately after each submit, which serializes the work.",
    ],
    qa: [
      ["What is the difference between Callable and Runnable?", "Callable.call returns a value and may throw checked exceptions; Runnable.run returns void and cannot throw checked exceptions."],
      ["What is a Future?", "A handle to the result of an asynchronous computation, with methods to wait for it, check completion and cancel it."],
      ["What is FutureTask?", "A cancellable asynchronous computation implementing both Runnable and Future, wrapping a Callable."],
      ["How do you avoid blocking forever on future.get()?", "Use get(timeout, unit) and handle TimeoutException."],
    ],
    ex: [
      "Fetch prices for three SKUs in parallel and print them in the original order. Why submit all before calling any get()?",
      "Submit three Callables and keep the Futures in a list, then call get() on each in order. Submitting all first lets them run concurrently; calling get() after each submit would make them sequential.",
    ],
  }),

  lesson("Atomic Variables: AtomicInteger, AtomicLong and AtomicBoolean", {
    intro:
      "Atomic classes in `java.util.concurrent.atomic` perform single-variable updates such as increment, compare-and-set and accumulate atomically without locks, using the CPU's compare-and-swap (CAS) instruction. This lesson covers AtomicInteger, AtomicLong and AtomicBoolean, how CAS works, writes custom versions of each, and introduces LongAdder for high contention.",
    topics: [
      [
        "AtomicInteger and AtomicLong",
        "Methods: `get`, `set`, `incrementAndGet`, `getAndIncrement`, `addAndGet`, `decrementAndGet`, `compareAndSet(expected, new)`, `updateAndGet(fn)` and `accumulateAndGet(x, fn)`. Reads and writes have volatile semantics, so values are always visible. Typical uses: counters, sequence numbers, statistics.",
      ],
      [
        "AtomicBoolean",
        "Holds a boolean with atomic `compareAndSet(false, true)`, `getAndSet` and `set`. The classic use is a one-time flag: \"only the first thread to call `start()` actually starts the service\".",
      ],
      [
        "How compare-and-swap works",
        "CAS atomically compares a memory location with an expected value and, only if they match, writes a new value. Atomic increment is a loop: read the current value, compute the next one, `compareAndSet(current, next)`; if another thread changed it in between, retry. No thread blocks, so there are no deadlocks.",
      ],
      [
        "Custom implementations",
        "A custom AtomicInteger can be written with `synchronized` getters and updaters (simple but blocking), or lock-free with a `VarHandle` performing CAS on a volatile field, which is how the JDK does it internally.",
      ],
      [
        "LongAdder and limits of atomics",
        "Under heavy contention, many threads failing CAS on one variable waste time retrying. `LongAdder` spreads increments over several cells and sums them on `sum()`, scaling far better for counters that are written often and read rarely. Atomics cover single variables only; invariants spanning several variables still need locks or an `AtomicReference` to an immutable object.",
      ],
    ],
    code: String.raw`import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static class SyncAtomicInteger {                        // custom version 1: locking
        private int value;
        synchronized int incrementAndGet() { return ++value; }
        synchronized int get() { return value; }
    }

    static class CasAtomicLong {                            // custom version 2: lock-free CAS
        private volatile long value;
        private static final VarHandle VALUE;
        static {
            try { VALUE = MethodHandles.lookup().findVarHandle(CasAtomicLong.class, "value", long.class); }
            catch (ReflectiveOperationException e) { throw new ExceptionInInitializerError(e); }
        }
        long incrementAndGet() {
            while (true) {
                long current = value;
                long next = current + 1;
                if (VALUE.compareAndSet(this, current, next)) return next;   // retry if someone beat us
            }
        }
        long get() { return value; }
    }

    static class CustomAtomicBoolean {
        private volatile boolean value;
        synchronized boolean compareAndSet(boolean expect, boolean update) {
            if (value != expect) return false;
            value = update;
            return true;
        }
    }

    static void run8Threads(Runnable action) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++) pool.submit(() -> { for (int i = 0; i < 25_000; i++) action.run(); });
        pool.shutdown();
        pool.awaitTermination(30, TimeUnit.SECONDS);
    }

    public static void main(String[] args) throws Exception {
        AtomicInteger ai = new AtomicInteger();
        AtomicLong al = new AtomicLong();
        SyncAtomicInteger custom1 = new SyncAtomicInteger();
        CasAtomicLong custom2 = new CasAtomicLong();
        LongAdder adder = new LongAdder();
        run8Threads(() -> { ai.incrementAndGet(); al.addAndGet(2); custom1.incrementAndGet(); custom2.incrementAndGet(); adder.increment(); });
        System.out.println("AtomicInteger " + ai.get() + ", AtomicLong " + al.get() + ", custom sync " + custom1.get()
                + ", custom CAS " + custom2.get() + ", LongAdder " + adder.sum());

        AtomicInteger value = new AtomicInteger(10);
        System.out.println("getAndIncrement " + value.getAndIncrement() + " -> " + value.get()
                + ", compareAndSet(11, 50) " + value.compareAndSet(11, 50) + ", compareAndSet(11, 99) " + value.compareAndSet(11, 99)
                + ", now " + value.get());
        System.out.println("updateAndGet(x * 2) " + value.updateAndGet(x -> x * 2) + ", accumulateAndGet(5, max) " + value.accumulateAndGet(5, Math::max));

        AtomicBoolean started = new AtomicBoolean(false);
        CustomAtomicBoolean customFlag = new CustomAtomicBoolean();
        AtomicInteger winners = new AtomicInteger(), customWinners = new AtomicInteger();
        run8Threads(() -> {
            if (started.compareAndSet(false, true)) winners.incrementAndGet();
            if (customFlag.compareAndSet(false, true)) customWinners.incrementAndGet();
        });
        System.out.println("AtomicBoolean one-time start: winners = " + winners.get() + ", custom = " + customWinners.get());
    }
}`,
    walk:
      "Eight threads perform 200,000 updates on each counter. The JDK atomics, the synchronized custom counter, the lock-free custom counter using a `VarHandle` CAS loop and the `LongAdder` all end with exact totals (AtomicLong adds 2 each time, so 400,000).\n\nThe single-threaded section shows the API: `getAndIncrement` returns the old value, `compareAndSet` succeeds only when the expected value matches, and `updateAndGet`/`accumulateAndGet` apply functions atomically. Finally 200,000 attempts race to flip a flag from false to true, and exactly one wins with both the JDK and the custom `AtomicBoolean`.",
    anim: [
      "CAS increment loop",
      [
        ["read", "read value", "current = 5"],
        ["calc", "compute", "next = 6"],
        ["cas", "CAS(5, 6)", "atomic"],
        ["ok", "success", "return 6"],
        ["retry", "failed", "someone wrote 6"],
      ],
      [
        ["read", "calc", "local", "Read the current value and compute the new value locally."],
        ["calc", "cas", "try", "Ask the CPU to replace 5 with 6 only if the value is still 5."],
        ["cas", "ok", "match", "If nobody changed it, the swap succeeds and the method returns."],
        ["cas", "retry", "conflict", "If another thread changed it, CAS fails and the loop retries with the new value."],
      ],
    ],
    mistakes: [
      "Combining two atomic operations (`if (a.get() == 0) a.set(1)`) and expecting atomicity; use `compareAndSet`.",
      "Using AtomicLong for very hot counters where LongAdder would scale better.",
      "Assuming atomics protect invariants across several variables.",
    ],
    qa: [
      ["How do atomic classes work without locks?", "They use compare-and-swap CPU instructions in retry loops, with volatile semantics for visibility."],
      ["What is compareAndSet?", "An atomic operation that sets a new value only if the current value equals the expected value, returning whether it succeeded."],
      ["When should you use LongAdder instead of AtomicLong?", "For counters updated by many threads and read rarely, where contention on a single CAS variable would be high."],
      ["What is the ABA problem?", "A value changes from A to B and back to A, so a CAS succeeds although the state changed; AtomicStampedReference adds a version stamp to detect it."],
    ],
    ex: [
      "Write a thread-safe method that keeps the maximum value ever seen using AtomicInteger.",
      "`max.accumulateAndGet(candidate, Math::max);` or a loop: `int cur; while (candidate > (cur = max.get()) && !max.compareAndSet(cur, candidate)) { }`.",
    ],
  }),

  lesson("Lock and ReentrantLock", {
    intro:
      "`java.util.concurrent.locks.Lock` is an explicit alternative to `synchronized` with more features: try-locking, timeouts, interruptible waiting, fairness and multiple conditions. `ReentrantLock` is its main implementation. This lesson covers the Lock API and correct usage, writes a custom lock, compares synchronized with ReentrantLock and lists where ReentrantLock is the better choice.",
    topics: [
      [
        "The Lock interface",
        "`lock()` blocks until acquired; `unlock()` releases; `tryLock()` returns immediately with true or false; `tryLock(timeout, unit)` waits up to a limit; `lockInterruptibly()` waits but can be interrupted; `newCondition()` creates a wait/notify-style condition. Always unlock in a finally block: `lock.lock(); try { ... } finally { lock.unlock(); }`.",
      ],
      [
        "ReentrantLock",
        "Reentrant (the owner can lock again; it must unlock as many times). Offers `isLocked()`, `isHeldByCurrentThread()`, `getHoldCount()`, `getQueueLength()`, and a fairness option: `new ReentrantLock(true)` grants the lock to the longest-waiting thread.",
      ],
      [
        "Custom lock implementation",
        "A simple reentrant lock can be built with an owner thread field, a hold count and `wait`/`notify` on an internal monitor: `lock()` waits while another thread owns it; `unlock()` decrements the count and notifies when it reaches zero, and throws `IllegalMonitorStateException` if the caller is not the owner.",
      ],
      [
        "synchronized vs ReentrantLock",
        "synchronized: implicit, released automatically, block-structured, no timeout, not interruptible, unfair, one wait set, simpler and less error-prone. ReentrantLock: explicit unlock (must use finally), can lock and unlock in different methods, tryLock with timeouts, interruptible, optional fairness, multiple Conditions, monitoring methods. Performance is similar in modern JVMs.",
      ],
      [
        "Applications of ReentrantLock",
        "Avoiding deadlock with `tryLock` and back-off; responsive cancellation with `lockInterruptibly`; fair queuing for resources; bounded buffers with separate notFull and notEmpty conditions; hand-over-hand locking in linked data structures.",
      ],
    ],
    code: String.raw`import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static class SimpleReentrantLock {                       // custom implementation
        private Thread owner;
        private int holds;
        synchronized void lock() throws InterruptedException {
            Thread me = Thread.currentThread();
            while (owner != null && owner != me) wait();
            owner = me;
            holds++;
        }
        synchronized void unlock() {
            if (owner != Thread.currentThread()) throw new IllegalMonitorStateException("not the owner");
            if (--holds == 0) { owner = null; notifyAll(); }
        }
    }

    static int counter = 0;

    public static void main(String[] args) throws Exception {
        ReentrantLock lock = new ReentrantLock();
        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int t = 0; t < 4; t++) pool.submit(() -> {
            for (int i = 0; i < 25_000; i++) {
                lock.lock();
                try { counter++; } finally { lock.unlock(); }   // always unlock in finally
            }
        });
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("counter with ReentrantLock: " + counter);

        lock.lock();
        lock.lock();                                          // reentrant
        System.out.println("hold count after locking twice: " + lock.getHoldCount() + ", held by me: " + lock.isHeldByCurrentThread());
        lock.unlock(); lock.unlock();

        Thread holder = new Thread(() -> { lock.lock(); try { Thread.sleep(500); } catch (InterruptedException ignored) { } finally { lock.unlock(); } });
        holder.start();
        Thread.sleep(50);
        System.out.println("tryLock() while held elsewhere: " + lock.tryLock());
        System.out.println("tryLock(100 ms): " + lock.tryLock(100, TimeUnit.MILLISECONDS) + ", waiting threads: " + lock.getQueueLength());

        Thread waiter = new Thread(() -> {
            try { lock.lockInterruptibly(); lock.unlock(); }
            catch (InterruptedException e) { System.out.println("lockInterruptibly() gave up after interrupt"); }
        });
        waiter.start();
        Thread.sleep(50);
        waiter.interrupt();
        waiter.join();
        holder.join();

        SimpleReentrantLock custom = new SimpleReentrantLock();
        int[] shared = {0};
        Thread[] threads = new Thread[4];
        for (int t = 0; t < 4; t++) {
            threads[t] = new Thread(() -> {
                for (int i = 0; i < 10_000; i++) {
                    try { custom.lock(); try { custom.lock(); shared[0]++; } finally { custom.unlock(); } }
                    catch (InterruptedException e) { return; }
                    finally { custom.unlock(); }
                }
            });
            threads[t].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("custom reentrant lock (locked twice per increment): " + shared[0]);
        try { custom.unlock(); } catch (IllegalMonitorStateException e) { System.out.println("unlock by non-owner: " + e.getMessage()); }
        System.out.println("fair lock: " + new ReentrantLock(true).isFair());
    }
}`,
    walk:
      "Four threads increment a counter 100,000 times in total under a `ReentrantLock`, unlocking in `finally`, and the result is exact. Locking twice from the same thread works and `getHoldCount()` reports 2.\n\nWhile another thread holds the lock, `tryLock()` fails immediately and `tryLock(100 ms)` fails after waiting; `lockInterruptibly()` lets a waiting thread abandon the wait when interrupted, which `synchronized` cannot do. The custom lock, built from an owner field, a hold count and wait/notifyAll, is reentrant too (each increment locks it twice) and rejects unlock by a non-owner.",
    anim: [
      "lock / try / finally unlock",
      [
        ["t", "thread", "wants lock"],
        ["lock", "lock()", "acquire"],
        ["cs", "critical section", "counter++"],
        ["fin", "finally", "unlock()"],
        ["next", "next waiter", "gets lock"],
      ],
      [
        ["t", "lock", "acquire", "The thread calls lock(); if another thread owns it, it waits in a queue."],
        ["lock", "cs", "enter", "Once acquired, it runs the critical section exclusively."],
        ["cs", "fin", "always", "finally guarantees unlock() runs, even if the section throws."],
        ["fin", "next", "handoff", "Releasing the lock lets the next queued thread acquire it."],
      ],
    ],
    mistakes: [
      "Forgetting `unlock()` in finally, leaving the lock held forever after an exception.",
      "Calling `lock()` inside the try block (if lock() fails, finally would unlock a lock you do not hold).",
      "Using ReentrantLock where synchronized would be simpler and clearer.",
    ],
    qa: [
      ["What is the difference between synchronized and ReentrantLock?", "ReentrantLock needs explicit unlock but adds tryLock with timeouts, interruptible locking, fairness, multiple conditions and monitoring; synchronized is implicit, block-structured and simpler."],
      ["What does reentrant mean?", "A thread holding the lock can acquire it again without deadlocking; it must release it the same number of times."],
      ["What is a fair lock?", "A lock that grants access in roughly the order threads requested it, preventing starvation at some throughput cost."],
    ],
    ex: [
      "Write a transfer method that locks two accounts with tryLock and retries instead of deadlocking.",
      "Loop: `if (from.lock.tryLock()) try { if (to.lock.tryLock()) try { move money; return; } finally { to.lock.unlock(); } } finally { from.lock.unlock(); }` then sleep briefly with random back-off and retry.",
    ],
  }),

  lesson("ReentrantLock Conditions: newCondition() and synchronized vs Condition", {
    intro:
      "A `Condition`, obtained from `lock.newCondition()`, is the explicit-lock equivalent of `wait`/`notify`. Unlike an object monitor's single wait set, one lock can have several conditions, so producers and consumers can wait and be signalled separately. This lesson covers the Condition API, a producer-consumer buffer with notFull and notEmpty conditions, and synchronized-with-wait/notify versus Condition.",
    topics: [
      [
        "Condition API",
        "`await()` releases the lock and waits (must be called while holding it); `signal()` wakes one waiting thread; `signalAll()` wakes all. Variants: `await(timeout, unit)`, `awaitNanos`, `awaitUntil(deadline)` and `awaitUninterruptibly()`. As with wait, always await in a loop that rechecks the condition.",
      ],
      [
        "Multiple conditions per lock",
        "A bounded buffer can use `notFull` (producers wait here when the buffer is full) and `notEmpty` (consumers wait here when it is empty). A producer that adds an item calls `notEmpty.signal()` to wake exactly a consumer, never another producer, which is more efficient than notifyAll and safe to signal just one.",
      ],
      [
        "Producer-consumer with ReentrantLock and conditions",
        "`put`: lock, `while (count == capacity) notFull.await()`, insert, `notEmpty.signal()`, unlock in finally. `take`: lock, `while (count == 0) notEmpty.await()`, remove, `notFull.signal()`, unlock. This is how `ArrayBlockingQueue` is implemented.",
      ],
      [
        "synchronized vs Condition",
        "synchronized/wait/notify: one implicit wait set per object, `wait`/`notify`/`notifyAll`, no timeout precision beyond wait(ms), no fairness. Lock/Condition: many wait sets per lock, `await`/`signal`/`signalAll`, deadline-based waits, interruptible or uninterruptible variants, optional fairness. Calling `await` or `signal` without holding the lock throws `IllegalMonitorStateException`, just like wait/notify.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static class BoundedBuffer<T> {
        private final Object[] items;
        private int putIndex, takeIndex, count;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();
        int producerWaits = 0, consumerWaits = 0;

        BoundedBuffer(int capacity) { items = new Object[capacity]; }

        void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (count == items.length) { producerWaits++; notFull.await(); }
                items[putIndex] = item;
                putIndex = (putIndex + 1) % items.length;
                count++;
                notEmpty.signal();                       // wake one consumer only
            } finally {
                lock.unlock();
            }
        }

        @SuppressWarnings("unchecked")
        T take() throws InterruptedException {
            lock.lock();
            try {
                while (count == 0) { consumerWaits++; notEmpty.await(); }
                T item = (T) items[takeIndex];
                items[takeIndex] = null;
                takeIndex = (takeIndex + 1) % items.length;
                count--;
                notFull.signal();                        // wake one producer only
                return item;
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws Exception {
        BoundedBuffer<Integer> buffer = new BoundedBuffer<>(3);
        List<Integer> consumed = Collections.synchronizedList(new ArrayList<>());
        Thread producer = new Thread(() -> { try { for (int i = 1; i <= 20; i++) buffer.put(i); } catch (InterruptedException ignored) { } });
        Thread consumer = new Thread(() -> {
            try { for (int i = 0; i < 20; i++) { consumed.add(buffer.take()); Thread.sleep(2); } } catch (InterruptedException ignored) { }
        });
        producer.start(); consumer.start();
        producer.join(); consumer.join();
        System.out.println("consumed in order: " + consumed);
        System.out.println("producer had to wait on notFull: " + (buffer.producerWaits > 0));

        ReentrantLock lock = new ReentrantLock();
        Condition ready = lock.newCondition();
        lock.lock();
        try {
            long start = System.nanoTime();
            boolean signalled = ready.await(150, TimeUnit.MILLISECONDS);
            System.out.println("await(150 ms) without a signal returned " + signalled + " after >= 150 ms: "
                    + ((System.nanoTime() - start) / 1_000_000 >= 145));
        } finally {
            lock.unlock();
        }
        try {
            ready.signal();
        } catch (IllegalMonitorStateException e) {
            System.out.println("signal() without holding the lock -> IllegalMonitorStateException");
        }
    }
}`,
    walk:
      "`BoundedBuffer` is a circular array of 3 slots guarded by one `ReentrantLock` with two conditions. The producer pushes 20 numbers faster than the consumer takes them, so it repeatedly finds the buffer full and waits on `notFull`; each `take` signals `notFull` to wake exactly one producer, and each `put` signals `notEmpty` to wake a consumer. All 20 numbers arrive in order.\n\nA timed `await(150 ms)` with no signal returns false after the timeout. Calling `signal()` without holding the lock throws `IllegalMonitorStateException`, the same rule as `notify`.",
    anim: [
      "Two conditions, one lock",
      [
        ["prod", "producer", "put()"],
        ["notFull", "notFull", "producers wait"],
        ["lock", "ReentrantLock", "buffer guard"],
        ["notEmpty", "notEmpty", "consumers wait"],
        ["cons", "consumer", "take()"],
      ],
      [
        ["prod", "notFull", "full", "When the buffer is full, the producer awaits on notFull, releasing the lock."],
        ["cons", "lock", "take", "The consumer acquires the lock and removes an item."],
        ["cons", "notFull", "signal", "It signals notFull, waking a producer, never another consumer."],
        ["prod", "notEmpty", "signal", "After putting, the producer signals notEmpty to wake a waiting consumer."],
      ],
    ],
    mistakes: [
      "Calling `await()` with `if` instead of `while`.",
      "Signalling a condition without holding its lock.",
      "Confusing `Condition.await()` with `Object.wait()`; calling `wait()` on a Condition uses its own monitor and is a bug.",
    ],
    qa: [
      ["What is a Condition?", "A wait set tied to a Lock, created with newCondition(), offering await, signal and signalAll."],
      ["What is the advantage of Condition over wait/notify?", "Multiple conditions per lock let you wake only the right kind of waiting thread, plus deadline waits and uninterruptible variants."],
      ["What is the difference between signal and signalAll?", "signal wakes one thread waiting on that condition; signalAll wakes all of them."],
    ],
    ex: [
      "Why is it safe to use `signal()` (not `signalAll()`) in BoundedBuffer, while plain `notify()` with one wait set would be risky?",
      "Each condition has only one kind of waiter (producers on notFull, consumers on notEmpty), so any woken thread can make progress. With a single wait set, notify might wake another producer instead of a consumer.",
    ],
  }),

  lesson("ReadWriteLock and ReentrantReadWriteLock", {
    intro:
      "Many shared resources are read far more often than they are written: caches, configuration, lookup tables. A `ReadWriteLock` lets any number of readers proceed together while giving writers exclusive access. This lesson covers the ReadWriteLock interface, ReentrantReadWriteLock's rules (reentrancy, downgrading, fairness), a custom implementation and when it actually helps.",
    topics: [
      [
        "ReadWriteLock",
        "Provides two linked locks: `readLock()` (shared) and `writeLock()` (exclusive). Many threads can hold the read lock at once as long as no thread holds the write lock; the write lock is granted only when no readers or writers hold the lock.",
      ],
      [
        "ReentrantReadWriteLock rules",
        "Both locks are reentrant. A writer can also acquire the read lock and then release the write lock (downgrading), keeping a consistent view. Upgrading (read to write) is not supported: a thread holding the read lock that requests the write lock deadlocks itself. Optional fairness prevents writer starvation; `getReadLockCount()` and `isWriteLocked()` help monitoring.",
      ],
      [
        "Custom ReadWriteLock",
        "A simple version tracks `readers` count and a `writer` flag in a monitor: `lockRead` waits while a writer is active (or waiting, to favour writers); `lockWrite` waits while there are readers or a writer; unlocks decrement and `notifyAll`.",
      ],
      [
        "When it helps and alternatives",
        "It pays off when reads are frequent, take noticeable time, and writes are rare; for very short critical sections the extra bookkeeping can make it slower than a plain lock. `StampedLock` (Java 8) adds optimistic reads that take no lock at all, and `ConcurrentHashMap` or copy-on-write structures are often simpler.",
      ],
    ],
    code: String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Main {
    static class Config {
        private final Map<String, String> values = new HashMap<>(Map.of("mode", "dark"));
        private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
        final AtomicInteger concurrentReaders = new AtomicInteger(), maxConcurrentReaders = new AtomicInteger();

        String read(String key) throws InterruptedException {
            rw.readLock().lock();
            try {
                int now = concurrentReaders.incrementAndGet();
                maxConcurrentReaders.accumulateAndGet(now, Math::max);
                Thread.sleep(50);                         // slow read, others read at the same time
                return values.get(key);
            } finally {
                concurrentReaders.decrementAndGet();
                rw.readLock().unlock();
            }
        }

        void write(String key, String value) {
            rw.writeLock().lock();
            try { values.put(key, value); } finally { rw.writeLock().unlock(); }
        }

        String writeThenDowngrade(String key, String value) {
            rw.writeLock().lock();
            try {
                values.put(key, value);
                rw.readLock().lock();                     // downgrade: acquire read before releasing write
            } finally {
                rw.writeLock().unlock();
            }
            try { return values.get(key); } finally { rw.readLock().unlock(); }
        }
    }

    static class SimpleReadWriteLock {                     // custom implementation
        private int readers = 0;
        private boolean writer = false;
        synchronized void lockRead() throws InterruptedException { while (writer) wait(); readers++; }
        synchronized void unlockRead() { readers--; if (readers == 0) notifyAll(); }
        synchronized void lockWrite() throws InterruptedException { while (writer || readers > 0) wait(); writer = true; }
        synchronized void unlockWrite() { writer = false; notifyAll(); }
    }

    public static void main(String[] args) throws Exception {
        Config config = new Config();
        ExecutorService pool = Executors.newFixedThreadPool(5);
        long start = System.nanoTime();
        for (int i = 0; i < 5; i++) pool.submit(() -> config.read("mode"));
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        long ms = (System.nanoTime() - start) / 1_000_000;
        System.out.println("5 slow reads overlapped: max concurrent readers " + config.maxConcurrentReaders.get()
                + ", total time under 200 ms: " + (ms < 200));

        config.write("mode", "light");
        System.out.println("after write: " + config.read("mode"));
        System.out.println("write then downgrade to read: " + config.writeThenDowngrade("lang", "en"));

        SimpleReadWriteLock custom = new SimpleReadWriteLock();
        int[] data = {0};
        Thread[] writers = new Thread[4];
        for (int t = 0; t < 4; t++) {
            writers[t] = new Thread(() -> {
                for (int i = 0; i < 5_000; i++) {
                    try { custom.lockWrite(); data[0]++; custom.unlockWrite(); } catch (InterruptedException e) { return; }
                }
            });
            writers[t].start();
        }
        for (Thread t : writers) t.join();
        custom.lockRead();
        System.out.println("custom read-write lock, writers exclusive: " + data[0]);
        custom.unlockRead();
    }
}`,
    varies: true,
    walk:
      "Five threads call `read`, which holds the read lock while sleeping 50 ms. Because the read lock is shared, all five overlap (up to five concurrent readers) and the batch finishes in about 50 ms instead of 250 ms.\n\n`write` takes the exclusive write lock, and the next read sees the new value. `writeThenDowngrade` acquires the read lock before releasing the write lock, so no other writer can slip in between. The custom lock lets four writer threads update shared data exclusively, ending at exactly 20,000.",
    anim: [
      "Shared readers, exclusive writer",
      [
        ["r1", "reader 1", "read lock"],
        ["r2", "reader 2", "read lock"],
        ["rw", "RW lock", "readers = 2"],
        ["w", "writer", "wants write"],
        ["data", "shared data", "config"],
      ],
      [
        ["r1", "rw", "shared", "Reader 1 takes the read lock; readers do not exclude each other."],
        ["r2", "rw", "shared", "Reader 2 also takes it, so both read the data at the same time."],
        ["w", "rw", "wait", "The writer must wait until the reader count drops to zero."],
        ["w", "data", "exclusive", "Then it gets the write lock and updates the data with no readers present."],
      ],
    ],
    mistakes: [
      "Trying to upgrade from the read lock to the write lock in the same thread (self-deadlock).",
      "Using a read-write lock for tiny critical sections where it only adds overhead.",
      "Modifying data while holding only the read lock.",
    ],
    qa: [
      ["What is a ReadWriteLock?", "A pair of locks: a shared read lock that many threads can hold together and an exclusive write lock."],
      ["Can you upgrade a read lock to a write lock in ReentrantReadWriteLock?", "No. Requesting the write lock while holding the read lock blocks forever; downgrading (write to read) is allowed."],
      ["When is a ReadWriteLock beneficial?", "When reads greatly outnumber writes and read sections are long enough that letting them run in parallel matters."],
    ],
    ex: [
      "Implement a cached `getOrLoad(key)` with a ReentrantReadWriteLock: read under the read lock and load under the write lock. What must you re-check after acquiring the write lock?",
      "Re-check whether another thread already loaded the key while you were waiting for the write lock (double-checking), and only load if it is still missing.",
    ],
  }),

  lesson("Semaphore", {
    intro:
      "A `Semaphore` controls access to a limited number of resources by handing out permits. Threads acquire a permit before using the resource and release it afterwards; when no permits are left, they wait. This lesson covers the Semaphore API, limiting concurrency, a custom semaphore, and producer-consumer built with two semaphores (with the JDK class and with the custom one).",
    topics: [
      [
        "Semaphore basics",
        "`new Semaphore(permits)` or `new Semaphore(permits, fair)`. `acquire()` takes a permit, blocking until one is available; `release()` returns one; `tryAcquire()` and `tryAcquire(timeout, unit)` do not block forever; `acquire(n)` and `release(n)` handle several permits; `availablePermits()` reports the count. Permits are not tied to threads: any thread may release.",
      ],
      [
        "Limiting concurrency",
        "The typical use: allow at most N threads into a section, for example at most 3 concurrent calls to a rate-limited API or 10 database connections. A semaphore with one permit is a mutex (binary semaphore), but unlike a lock it has no owner and is not reentrant.",
      ],
      [
        "Custom semaphore",
        "Keep an int `permits` in a monitor: `acquire` waits while permits is 0, then decrements; `release` increments and calls `notify` (or `notifyAll`).",
      ],
      [
        "Producer-consumer with semaphores",
        "Use two semaphores: `empty` starts with the buffer capacity (free slots) and `full` starts at 0 (filled slots). The producer does `empty.acquire()`, adds an item (under a mutex), `full.release()`; the consumer does `full.acquire()`, removes an item, `empty.release()`. The semaphores block producers when the buffer is full and consumers when it is empty.",
      ],
    ],
    code: String.raw`import java.util.ArrayDeque;
import java.util.Queue;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static class SimpleSemaphore {                          // custom implementation
        private int permits;
        SimpleSemaphore(int permits) { this.permits = permits; }
        synchronized void acquire() throws InterruptedException { while (permits == 0) wait(); permits--; }
        synchronized void release() { permits++; notifyAll(); }
    }

    interface Sem { void acquire() throws InterruptedException; void release(); }

    static long produceConsume(Sem empty, Sem full, int items) throws InterruptedException {
        Queue<Integer> buffer = new ArrayDeque<>();
        long[] sum = {0};
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= items; i++) {
                    empty.acquire();                         // wait for a free slot
                    synchronized (buffer) { buffer.add(i); }
                    full.release();                          // one more filled slot
                }
            } catch (InterruptedException ignored) { }
        });
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < items; i++) {
                    full.acquire();                          // wait for an item
                    synchronized (buffer) { sum[0] += buffer.remove(); }
                    empty.release();                         // one more free slot
                }
            } catch (InterruptedException ignored) { }
        });
        producer.start(); consumer.start();
        producer.join(); consumer.join();
        return sum[0];
    }

    public static void main(String[] args) throws Exception {
        Semaphore apiPermits = new Semaphore(3);
        AtomicInteger inside = new AtomicInteger(), maxInside = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(10);
        for (int i = 0; i < 10; i++) pool.submit(() -> {
            apiPermits.acquire();
            try {
                maxInside.accumulateAndGet(inside.incrementAndGet(), Math::max);
                Thread.sleep(50);
            } finally {
                inside.decrementAndGet();
                apiPermits.release();
            }
            return null;
        });
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("10 tasks, 3 permits: max concurrently inside = " + maxInside.get());

        Semaphore single = new Semaphore(1);
        single.acquire();
        System.out.println("tryAcquire with no permits left: " + single.tryAcquire(50, TimeUnit.MILLISECONDS)
                + ", available " + single.availablePermits());
        Thread other = new Thread(single::release);           // any thread may release
        other.start(); other.join();
        System.out.println("released by another thread, available " + single.availablePermits());

        long jdkSum = produceConsume(of(new Semaphore(5)), of(new Semaphore(0)), 1000);
        System.out.println("producer-consumer with JDK Semaphores: sum " + jdkSum);

        long customSum = produceConsume(of(new SimpleSemaphore(5)), of(new SimpleSemaphore(0)), 1000);
        System.out.println("producer-consumer with custom semaphores: sum " + customSum);
    }

    static Sem of(Semaphore s) {                            // adapt the JDK class
        return new Sem() {
            public void acquire() throws InterruptedException { s.acquire(); }
            public void release() { s.release(); }
        };
    }

    static Sem of(SimpleSemaphore s) {                      // adapt the custom class
        return new Sem() {
            public void acquire() throws InterruptedException { s.acquire(); }
            public void release() { s.release(); }
        };
    }
}`,
    walk:
      "Ten tasks compete for three permits, so at most three are ever inside the protected section at the same time, as the `maxInside` counter confirms. With one permit taken, `tryAcquire(50 ms)` fails, and the permit can be released by a different thread, which a lock would not allow.\n\nThe producer-consumer helper uses two semaphores: `empty` (5 free slots) and `full` (0 items). Both the JDK `Semaphore` and the custom monitor-based `SimpleSemaphore` move the numbers 1 to 1000 through the buffer correctly, giving the sum 500,500.",
    anim: [
      "Permits gate access",
      [
        ["t", "10 threads", "want access"],
        ["sem", "Semaphore(3)", "permits"],
        ["res", "API / pool", "3 at a time"],
        ["wait", "waiting", "no permit"],
        ["rel", "release()", "permit back"],
      ],
      [
        ["t", "sem", "acquire", "Each thread calls acquire(); the first three get permits immediately."],
        ["sem", "res", "enter", "Up to three threads use the limited resource at the same time."],
        ["t", "wait", "blocked", "The rest block in acquire() because no permits are left."],
        ["rel", "wait", "wake", "Each release() returns a permit and lets one waiting thread proceed."],
      ],
    ],
    mistakes: [
      "Forgetting to release a permit in finally, slowly leaking permits until everything blocks.",
      "Using a binary semaphore as a reentrant lock; the same thread acquiring twice deadlocks.",
      "Releasing more permits than acquired, silently raising the limit.",
    ],
    qa: [
      ["What is a Semaphore?", "A synchronizer that maintains a number of permits; threads acquire permits to proceed and release them when done."],
      ["What is the difference between a Semaphore and a Lock?", "A lock has an owner and allows one thread (reentrantly); a semaphore has a count of permits, no owner, and any thread can release."],
      ["How do you implement producer-consumer with semaphores?", "Use an 'empty slots' semaphore starting at capacity and a 'full slots' semaphore starting at 0, plus a mutex for the buffer itself."],
    ],
    ex: [
      "Limit a web scraper to 5 concurrent HTTP requests using a Semaphore. Where do acquire and release go?",
      "`permits.acquire()` right before sending the request and `permits.release()` in a finally block after the response is processed.",
    ],
  }),

  lesson("CountDownLatch", {
    intro:
      "A `CountDownLatch` lets one or more threads wait until a set of operations in other threads completes. It starts with a count; each finished operation counts down, and waiting threads are released when it reaches zero. This lesson covers the API, the two classic patterns (waiting for workers, and a start gate), a custom latch, and the fact that it cannot be reset.",
    topics: [
      [
        "API",
        "`new CountDownLatch(count)`; `countDown()` decrements (never below zero); `await()` blocks until the count is zero; `await(timeout, unit)` returns false on timeout; `getCount()` reports the remaining count.",
      ],
      [
        "Pattern 1: wait for N workers",
        "The main thread creates a latch with N, starts N workers that each call `countDown()` when finished (in a finally block), and calls `await()`. Typical for startup: wait until all services are initialised before accepting traffic.",
      ],
      [
        "Pattern 2: start gate",
        "Worker threads all call `start.await()` on a latch with count 1; the coordinator calls `start.countDown()` once to release them simultaneously, useful for tests and benchmarks that need maximum contention.",
      ],
      [
        "One-shot behaviour",
        "A latch cannot be reset. Once the count reaches zero, `await()` returns immediately forever. For reusable barriers use `CyclicBarrier` or `Phaser`.",
      ],
      [
        "Custom implementation",
        "A monitor with an int count: `countDown` decrements and calls `notifyAll` when it reaches zero; `await` waits while the count is above zero.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;

public class Main {
    static class SimpleLatch {                              // custom implementation
        private int count;
        SimpleLatch(int count) { this.count = count; }
        synchronized void countDown() { if (count > 0 && --count == 0) notifyAll(); }
        synchronized void await() throws InterruptedException { while (count > 0) wait(); }
        synchronized int getCount() { return count; }
    }

    public static void main(String[] args) throws Exception {
        List<String> ready = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch servicesUp = new CountDownLatch(3);
        for (String service : List.of("database", "cache", "search")) {
            new Thread(() -> {
                try {
                    Thread.sleep(service.length() * 20L);          // different start-up times
                    ready.add(service);
                } catch (InterruptedException ignored) {
                } finally {
                    servicesUp.countDown();                        // always count down
                }
            }).start();
        }
        servicesUp.await();
        System.out.println("all services ready (" + ready.size() + "), count = " + servicesUp.getCount() + " -> accepting traffic");

        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch finished = new CountDownLatch(4);
        List<Long> startTimes = Collections.synchronizedList(new ArrayList<>());
        for (int i = 0; i < 4; i++) {
            new Thread(() -> {
                try {
                    startGate.await();                             // all wait at the gate
                    startTimes.add(System.nanoTime());
                } catch (InterruptedException ignored) {
                } finally {
                    finished.countDown();
                }
            }).start();
        }
        Thread.sleep(100);
        startGate.countDown();                                     // release everyone together
        finished.await();
        long spreadMs = (Collections.max(startTimes) - Collections.min(startTimes)) / 1_000_000;
        System.out.println("start gate released 4 threads within a few ms of each other: " + (spreadMs < 50));

        CountDownLatch timed = new CountDownLatch(1);
        System.out.println("await(100 ms) when nobody counts down: " + timed.await(100, TimeUnit.MILLISECONDS));
        servicesUp.countDown();
        System.out.println("latch cannot be reset: count stays " + servicesUp.getCount() + ", await returns immediately");

        SimpleLatch custom = new SimpleLatch(2);
        new Thread(custom::countDown).start();
        new Thread(custom::countDown).start();
        custom.await();
        System.out.println("custom latch released, count = " + custom.getCount());
    }
}`,
    walk:
      "Three \"service\" threads start up at different speeds and each calls `countDown()` in a finally block. `main` waits on `await()` until all three are done and the count is 0.\n\nThe start gate holds four threads at `await()` until `main` calls `countDown()` once, releasing them within milliseconds of each other. A timed `await` returns false when nobody counts down. Counting down an exhausted latch has no effect: it stays at 0 and cannot be reset. The custom latch built on a monitor behaves the same way.",
    anim: [
      "Counting down to zero",
      [
        ["main", "main", "await()"],
        ["latch", "latch", "count = 3"],
        ["db", "database", "countDown()"],
        ["cache", "cache", "countDown()"],
        ["search", "search", "countDown()"],
      ],
      [
        ["main", "latch", "wait", "main blocks in await() while the count is above zero."],
        ["db", "latch", "3 -> 2", "The database service finishes and counts down."],
        ["cache", "latch", "2 -> 1", "The cache service finishes and counts down."],
        ["search", "latch", "1 -> 0", "The last service counts down to zero and await() releases main."],
      ],
    ],
    mistakes: [
      "Calling `countDown()` outside a finally block, so a failing worker leaves the waiter blocked forever.",
      "Trying to reuse a CountDownLatch for a second round.",
      "Waiting without a timeout on work that may never finish.",
    ],
    qa: [
      ["What is a CountDownLatch?", "A synchronizer that lets threads wait until a count reaches zero through countDown calls from other threads."],
      ["Can a CountDownLatch be reused?", "No. Once it reaches zero it stays open; use CyclicBarrier or Phaser for reusable synchronization."],
      ["What are typical uses of CountDownLatch?", "Waiting for N workers or services to finish or initialise, and releasing many threads at once with a start gate."],
    ],
    ex: [
      "Make a test that starts 10 threads calling `counter.increment()` at exactly the same moment and waits until all are done. Which two latches do you need?",
      "A start gate `CountDownLatch(1)` that all threads await before incrementing, and a done latch `CountDownLatch(10)` that each thread counts down at the end and the test awaits.",
    ],
  }),

  lesson("CyclicBarrier and CyclicBarrier vs CountDownLatch", {
    intro:
      "A `CyclicBarrier` makes a fixed group of threads wait for each other at a common point, then releases them together and resets for the next round. It suits algorithms that proceed in phases, such as simulations or parallel computations where every worker must finish step N before anyone starts step N+1. This lesson covers the API, the barrier action, broken barriers, a custom barrier, and the differences from CountDownLatch.",
    topics: [
      [
        "API",
        "`new CyclicBarrier(parties)` or `new CyclicBarrier(parties, barrierAction)`. Each thread calls `await()`; when the last of the parties arrives, the optional barrier action runs (on that last thread), all threads are released, and the barrier resets automatically. `await` returns the arrival index. `getNumberWaiting()`, `isBroken()` and `reset()` help manage it.",
      ],
      [
        "Barrier action",
        "A Runnable executed once per round when all parties have arrived, before they are released; ideal for merging partial results of a phase.",
      ],
      [
        "Broken barriers",
        "If a waiting thread is interrupted or times out (`await(timeout)`), or the barrier action throws, the barrier becomes broken and every other waiting thread gets `BrokenBarrierException`. `reset()` restores it.",
      ],
      [
        "Custom implementation",
        "A monitor with `parties`, a `waiting` count and a `generation` number: `await` increments waiting; the last arrival runs the action, resets waiting, increments generation and calls `notifyAll`; earlier arrivals wait until the generation changes.",
      ],
      [
        "CyclicBarrier vs CountDownLatch",
        "Reuse: cyclic barrier resets automatically; latch is one-shot. Who waits: in a barrier the participating threads wait for each other; in a latch some threads wait for events counted down by others (the counters need not wait). Count: barrier parties are threads calling await; latch counts are countDown calls (one thread can count down many times). Barrier supports an action per round; a latch does not. A broken barrier signals failure to all participants.",
      ],
    ],
    code: String.raw`import java.util.Arrays;
import java.util.concurrent.*;

public class Main {
    static class SimpleBarrier {                                 // custom implementation
        private final int parties;
        private final Runnable action;
        private int waiting = 0, generation = 0;
        SimpleBarrier(int parties, Runnable action) { this.parties = parties; this.action = action; }
        synchronized void await() throws InterruptedException {
            int myGeneration = generation;
            if (++waiting == parties) {
                action.run();
                waiting = 0;
                generation++;                                    // open the barrier for this round
                notifyAll();
            } else {
                while (myGeneration == generation) wait();
            }
        }
    }

    public static void main(String[] args) throws Exception {
        int workers = 3;
        long[] partialSums = new long[workers];
        long[] total = {0};
        int[] round = {0};
        CyclicBarrier barrier = new CyclicBarrier(workers, () -> {    // runs once per round
            long sum = Arrays.stream(partialSums).sum();
            total[0] += sum;
            System.out.println("  round " + (++round[0]) + " complete, partial sums " + Arrays.toString(partialSums) + " -> " + sum);
        });

        Thread[] threads = new Thread[workers];
        for (int w = 0; w < workers; w++) {
            int id = w;
            threads[w] = new Thread(() -> {
                try {
                    for (int r = 1; r <= 3; r++) {               // three phases, same barrier reused
                        partialSums[id] = (long) (id + 1) * r * 10;
                        barrier.await();
                    }
                } catch (InterruptedException | BrokenBarrierException e) {
                    System.out.println("  broken: " + e.getClass().getSimpleName());
                }
            });
            threads[w].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("total after 3 rounds: " + total[0] + ", barrier reset itself: waiting = " + barrier.getNumberWaiting());

        CyclicBarrier pair = new CyclicBarrier(2);
        Thread lonely = new Thread(() -> {
            try { pair.await(100, TimeUnit.MILLISECONDS); }
            catch (TimeoutException e) { System.out.println("timed out waiting for a partner -> barrier broken: " + pair.isBroken()); }
            catch (Exception e) { System.out.println("other: " + e); }
        });
        lonely.start(); lonely.join();
        pair.reset();
        System.out.println("after reset(), broken = " + pair.isBroken());

        SimpleBarrier custom = new SimpleBarrier(3, () -> System.out.println("  custom barrier action ran"));
        Thread[] cs = new Thread[3];
        for (int i = 0; i < 3; i++) { cs[i] = new Thread(() -> { try { custom.await(); custom.await(); } catch (InterruptedException ignored) { } }); cs[i].start(); }
        for (Thread t : cs) t.join();
        System.out.println("custom barrier passed twice by 3 threads");
    }
}`,
    walk:
      "Three workers compute a partial sum per round and call `await()`. When the third arrives, the barrier action combines the partial sums, then all three continue to the next round; the same barrier is reused for three rounds automatically and ends with no one waiting.\n\nA barrier for two parties with only one thread arriving times out; the timeout breaks the barrier, and `reset()` repairs it. The custom barrier, built with a generation counter so threads of one round cannot be confused with the next, is passed twice by three threads and runs its action each time.",
    anim: [
      "Phases with a barrier",
      [
        ["w1", "worker 1", "phase work"],
        ["w2", "worker 2", "phase work"],
        ["w3", "worker 3", "phase work"],
        ["bar", "barrier", "3 parties"],
        ["act", "barrier action", "merge results"],
      ],
      [
        ["w1", "bar", "await", "Worker 1 finishes its part of the phase and waits at the barrier."],
        ["w2", "bar", "await", "Worker 2 arrives too; it also waits."],
        ["w3", "bar", "await", "The last worker arrives, so the barrier trips."],
        ["bar", "act", "action", "The barrier action merges the round's results, then everyone continues."],
      ],
    ],
    mistakes: [
      "Using a barrier when the number of participating threads varies; use Phaser.",
      "Ignoring BrokenBarrierException, leaving other workers in an inconsistent phase.",
      "Doing slow work in the barrier action, which delays every party.",
    ],
    qa: [
      ["What is the difference between CyclicBarrier and CountDownLatch?", "CyclicBarrier makes a fixed set of threads wait for each other and resets for reuse, with an optional action; CountDownLatch lets threads wait for a count of events from others and is one-shot."],
      ["What is a barrier action?", "A Runnable passed to CyclicBarrier that runs once each time all parties arrive, before they are released."],
      ["What makes a CyclicBarrier broken?", "A waiting thread being interrupted or timing out, the barrier action throwing, or reset() being called while threads wait."],
    ],
    ex: [
      "A simulation has 4 worker threads, each updating a quarter of a grid per time step; the next step needs the whole previous grid. Which synchronizer and why?",
      "A CyclicBarrier with 4 parties: each worker awaits after its quarter, the barrier action can swap grid buffers, and the barrier resets for every time step.",
    ],
  }),

  lesson("Phaser: Parent and Child Phasers", {
    intro:
      "`Phaser` (Java 7) is the most flexible synchronization barrier: like a CyclicBarrier it coordinates phases, but parties can register and deregister dynamically, and phasers can be arranged in trees (parent and child phasers) to scale to many parties. This lesson covers registration, arriving and awaiting, phase numbers, `onAdvance`, termination, and tiered phasers.",
    topics: [
      [
        "Registering parties",
        "`new Phaser(n)` starts with n registered parties; `register()` adds one, `bulkRegister(k)` adds k, and `arriveAndDeregister()` leaves. The number of parties can change between phases, which a CyclicBarrier cannot do.",
      ],
      [
        "Arriving and waiting",
        "`arriveAndAwaitAdvance()` acts like barrier await; `arrive()` signals arrival without waiting (useful for producers); `awaitAdvance(phase)` waits for a given phase to finish. Each completed phase increments the phase number returned by `getPhase()`.",
      ],
      [
        "onAdvance and termination",
        "Override `protected boolean onAdvance(int phase, int registeredParties)` to run code between phases; return true to terminate the phaser (by default it terminates when no parties remain). After termination, `isTerminated()` is true and await methods return immediately with a negative phase.",
      ],
      [
        "Parent and child phasers",
        "`new Phaser(parent, parties)` creates a child that registers itself with the parent as one party. A child phase completes only when all its parties arrive and the parent advances. Trees of phasers reduce contention when thousands of parties synchronize, because each child is a small group.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Phaser;

public class Main {
    public static void main(String[] args) throws Exception {
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        Phaser phaser = new Phaser(1) {                                 // 1 = main thread
            @Override protected boolean onAdvance(int phase, int registeredParties) {
                log.add("phase " + phase + " done with " + registeredParties + " parties");
                return phase >= 2 || registeredParties == 0;            // stop after phase 2
            }
        };

        List<Thread> workers = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            int id = i;
            phaser.register();                                          // dynamic registration
            Thread t = new Thread(() -> {
                phaser.arriveAndAwaitAdvance();                         // phase 0
                if (id == 3) { phaser.arriveAndDeregister(); return; }  // worker 3 leaves after phase 0
                phaser.arriveAndAwaitAdvance();                         // phase 1
                phaser.arriveAndAwaitAdvance();                         // phase 2
            });
            workers.add(t);
            t.start();
        }
        for (int phase = 0; phase <= 2; phase++) phaser.arriveAndAwaitAdvance();
        for (Thread t : workers) t.join();
        log.forEach(line -> System.out.println("  " + line));
        System.out.println("terminated after phase 2: " + phaser.isTerminated());

        Phaser root = new Phaser() {
            @Override protected boolean onAdvance(int phase, int parties) {
                System.out.println("  root advanced phase " + phase + " (children registered as " + parties + " parties)");
                return phase >= 1;
            }
        };
        Phaser teamA = new Phaser(root, 2);                              // each child counts as one party of root
        Phaser teamB = new Phaser(root, 2);
        List<Thread> members = new ArrayList<>();
        for (Phaser team : List.of(teamA, teamB)) {
            for (int m = 0; m < 2; m++) {
                Thread t = new Thread(() -> { team.arriveAndAwaitAdvance(); team.arriveAndAwaitAdvance(); });
                members.add(t);
                t.start();
            }
        }
        for (Thread t : members) t.join();
        System.out.println("tiered phasers: 4 members in 2 child phasers synchronized through the root; root terminated: " + root.isTerminated());
    }
}`,
    walk:
      "The phaser starts with the main thread as one party, and three workers register dynamically. All four arrive at phase 0; worker 3 then deregisters, so phase 1 completes with only three parties. `onAdvance` logs each phase and returns true after phase 2, terminating the phaser.\n\nIn the tiered example, `teamA` and `teamB` are child phasers of `root`, each registering as one party of the root. Their two members synchronize within the team, and each child phase advances only when the root advances, so all four members across both teams move through phases 0 and 1 together.",
    anim: [
      "Dynamic parties across phases",
      [
        ["p0", "phase 0", "4 parties"],
        ["dereg", "worker 3", "deregisters"],
        ["p1", "phase 1", "3 parties"],
        ["p2", "phase 2", "3 parties"],
        ["end", "terminated", "onAdvance true"],
      ],
      [
        ["p0", "dereg", "advance", "All four registered parties arrive, so phase 0 completes."],
        ["dereg", "p1", "leave", "Worker 3 arrives and deregisters, reducing the party count to 3."],
        ["p1", "p2", "advance", "Phase 1 completes with just three arrivals."],
        ["p2", "end", "terminate", "After phase 2, onAdvance returns true and the phaser terminates."],
      ],
    ],
    mistakes: [
      "Forgetting to register a party before it arrives, causing IllegalStateException or early advances.",
      "Not deregistering parties that stop participating, so the phaser waits forever.",
    ],
    qa: [
      ["How is Phaser different from CyclicBarrier?", "Phaser supports a changing number of parties (register/deregister), non-waiting arrival, phase numbers, onAdvance termination control and tiering into trees."],
      ["What does arriveAndDeregister do?", "It arrives at the current phase and removes the party from future phases."],
      ["Why use parent and child phasers?", "To reduce contention when many parties synchronize: each child coordinates a small group and registers as a single party of its parent."],
    ],
    ex: [
      "A batch job spawns a variable number of tasks per stage and all tasks of a stage must finish before the next stage. Which synchronizer fits best?",
      "A Phaser: register each task as it is spawned, have it arriveAndDeregister when done, and let the coordinator arriveAndAwaitAdvance to move to the next stage.",
    ],
  }),

  lesson("Exchanger", {
    intro:
      "An `Exchanger<V>` is a meeting point where exactly two threads swap objects. Each thread calls `exchange(myObject)` and receives the other thread's object; whoever arrives first waits for its partner. This lesson covers the API, the double-buffering pattern where a filling thread and an emptying thread swap buffers, and timeouts.",
    topics: [
      [
        "API",
        "`V exchange(V x)` waits until another thread arrives at the same exchanger, then returns that thread's object while handing over x. `exchange(x, timeout, unit)` throws `TimeoutException` if no partner arrives in time. Both throw `InterruptedException`.",
      ],
      [
        "Pairs only",
        "An exchanger pairs threads two at a time. With more threads, they pair up in arrival order, so it is meant for exactly two collaborating threads.",
      ],
      [
        "Double buffering",
        "A producer fills buffer A while a consumer drains buffer B. When the producer's buffer is full and the consumer's is empty, they exchange buffers and continue without copying data or sharing a buffer at the same time.",
      ],
      [
        "Other uses",
        "Genetic algorithms swapping candidates, pipeline stages handing over batches, and tests needing two threads to rendezvous with data.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Exchanger;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Main {
    public static void main(String[] args) throws Exception {
        Exchanger<String> simple = new Exchanger<>();
        Thread alice = new Thread(() -> {
            try { System.out.println("  alice received: " + simple.exchange("apple from alice")); }
            catch (InterruptedException ignored) { }
        });
        alice.start();
        System.out.println("  main received: " + simple.exchange("orange from main"));
        alice.join();

        Exchanger<List<Integer>> buffers = new Exchanger<>();
        int batches = 3, size = 4;
        long[] consumedSum = {0};
        Thread producer = new Thread(() -> {
            List<Integer> filling = new ArrayList<>();
            int next = 1;
            try {
                for (int b = 0; b < batches; b++) {
                    while (filling.size() < size) filling.add(next++);
                    filling = buffers.exchange(filling);             // hand over the full buffer, get an empty one
                }
            } catch (InterruptedException ignored) { }
        });
        Thread consumer = new Thread(() -> {
            List<Integer> draining = new ArrayList<>();
            try {
                for (int b = 0; b < batches; b++) {
                    draining = buffers.exchange(draining);           // get a full buffer, give back the empty one
                    System.out.println("  consumer got batch " + draining);
                    for (int v : draining) consumedSum[0] += v;
                    draining.clear();
                }
            } catch (InterruptedException ignored) { }
        });
        producer.start(); consumer.start();
        producer.join(); consumer.join();
        System.out.println("double buffering consumed sum " + consumedSum[0] + " (1..12 = 78)");

        try {
            new Exchanger<String>().exchange("anyone?", 100, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            System.out.println("no partner within 100 ms -> TimeoutException");
        }
    }
}`,
    varies: true,
    walk:
      "`main` and the \"alice\" thread meet at the exchanger and swap strings: each receives the other's object.\n\nIn the double-buffering example, the producer fills a list with four numbers and exchanges it for the consumer's empty list; the consumer prints the full batch, sums it, clears it and offers it back at the next exchange. Three rounds deliver 1 to 12 with no shared buffer and no copying. Finally, waiting at an exchanger nobody else uses times out with `TimeoutException`.",
    anim: [
      "Swapping buffers",
      [
        ["prod", "producer", "full buffer A"],
        ["ex", "Exchanger", "meeting point"],
        ["cons", "consumer", "empty buffer B"],
        ["prod2", "producer", "now has B"],
        ["cons2", "consumer", "now has A"],
      ],
      [
        ["prod", "ex", "exchange(A)", "The producer arrives with its full buffer A and waits for a partner."],
        ["cons", "ex", "exchange(B)", "The consumer arrives with its empty buffer B."],
        ["ex", "prod2", "gets B", "The exchanger hands B to the producer to fill next."],
        ["ex", "cons2", "gets A", "And A to the consumer to drain: no copying, no shared buffer."],
      ],
    ],
    mistakes: [
      "Using an Exchanger with more than two threads and expecting specific pairings.",
      "Calling exchange without a timeout when the partner may never arrive.",
    ],
    qa: [
      ["What is an Exchanger?", "A synchronization point where two threads swap objects; each blocks until its partner arrives."],
      ["What happens if only one thread calls exchange?", "It waits until another thread calls exchange, until interrupted, or until the timeout expires (TimeoutException)."],
      ["What is a typical use of Exchanger?", "Double buffering between a producer and a consumer that swap buffers."],
    ],
    ex: [
      "Why is no synchronization needed on the lists in the double-buffering example?",
      "At any moment each list is owned by exactly one thread; the exchange hands ownership over, and Exchanger guarantees memory visibility of everything done before the exchange.",
    ],
  }),

  lesson("Fork/Join Framework", {
    intro:
      "The Fork/Join framework (Java 7) parallelises divide-and-conquer work: a task splits itself into subtasks (fork), runs them in parallel, and combines their results (join). Its `ForkJoinPool` uses work stealing so idle threads take work from busy ones. This lesson covers RecursiveTask and RecursiveAction, thresholds, work stealing, the common pool and how parallel streams use it.",
    topics: [
      [
        "RecursiveTask and RecursiveAction",
        "Extend `RecursiveTask<V>` when the computation returns a value, or `RecursiveAction` when it does not, and implement `compute()`. In compute: if the problem is small enough, solve it directly; otherwise split it into subtasks, `fork()` one (schedule it asynchronously), `compute()` the other in the current thread, then `join()` the forked one and combine.",
      ],
      [
        "Threshold",
        "Splitting has overhead, so stop splitting below a threshold (for example 10,000 elements) and solve sequentially. Too small a threshold creates millions of tiny tasks; too large leaves cores idle.",
      ],
      [
        "Work stealing",
        "Each worker thread has its own double-ended queue. It pushes and pops its own tasks at one end (LIFO, cache friendly); idle workers steal from the other end of busy workers' queues. This balances load automatically when subtasks take different amounts of time.",
      ],
      [
        "ForkJoinPool and the common pool",
        "`ForkJoinPool.commonPool()` is shared by the whole JVM, with parallelism of (cores - 1); `pool.invoke(task)` runs a task and waits. Parallel streams and `CompletableFuture.supplyAsync` without an executor use the common pool, so blocking I/O in those tasks starves everyone else. Create a dedicated `new ForkJoinPool(n)` when needed.",
      ],
    ],
    code: String.raw`import java.util.Arrays;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveAction;
import java.util.concurrent.RecursiveTask;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger tasksCreated = new AtomicInteger();

    static class SumTask extends RecursiveTask<Long> {
        static final int THRESHOLD = 10_000;
        final long[] data; final int from, to;
        SumTask(long[] data, int from, int to) { this.data = data; this.from = from; this.to = to; tasksCreated.incrementAndGet(); }

        @Override protected Long compute() {
            if (to - from <= THRESHOLD) {                         // small: solve directly
                long sum = 0;
                for (int i = from; i < to; i++) sum += data[i];
                return sum;
            }
            int mid = (from + to) >>> 1;
            SumTask left = new SumTask(data, from, mid);
            SumTask right = new SumTask(data, mid, to);
            left.fork();                                          // run asynchronously
            long rightResult = right.compute();                   // work in this thread
            return left.join() + rightResult;                     // wait and combine
        }
    }

    static class DoubleAction extends RecursiveAction {           // no result: modifies in place
        final long[] data; final int from, to;
        DoubleAction(long[] data, int from, int to) { this.data = data; this.from = from; this.to = to; }
        @Override protected void compute() {
            if (to - from <= 10_000) { for (int i = from; i < to; i++) data[i] *= 2; return; }
            int mid = (from + to) >>> 1;
            invokeAll(new DoubleAction(data, from, mid), new DoubleAction(data, mid, to));
        }
    }

    public static void main(String[] args) {
        long[] numbers = new long[1_000_000];
        for (int i = 0; i < numbers.length; i++) numbers[i] = i + 1;

        ForkJoinPool pool = new ForkJoinPool(4);
        long sum = pool.invoke(new SumTask(numbers, 0, numbers.length));
        System.out.println("fork/join sum of 1..1,000,000 = " + sum + ", expected " + (1_000_000L * 1_000_001 / 2));
        System.out.println("tasks created: " + tasksCreated.get() + " (split down to about 10,000 elements each)");

        pool.invoke(new DoubleAction(numbers, 0, numbers.length));
        System.out.println("RecursiveAction doubled in place: first " + numbers[0] + ", last " + numbers[numbers.length - 1]);
        System.out.println("work stealing happened: " + (pool.getStealCount() > 0));
        pool.shutdown();

        long streamSum = Arrays.stream(numbers).parallel().sum();      // uses the common pool
        System.out.println("parallel stream (common ForkJoinPool) sum = " + streamSum);
        System.out.println("common pool parallelism = cores - 1: "
                + (ForkJoinPool.commonPool().getParallelism() == Math.max(1, Runtime.getRuntime().availableProcessors() - 1)));
    }
}`,
    varies: true,
    walk:
      "`SumTask` splits the array in halves until a range has at most 10,000 elements, which it sums directly. For larger ranges it forks the left half, computes the right half in the current thread and joins the left result, which is the standard fork/join pattern. The total matches the formula, and the task count shows how many pieces were created.\n\n`DoubleAction` is a `RecursiveAction` that doubles every element in place using `invokeAll`. The pool's steal count shows that idle workers stole tasks from busy ones. Finally a parallel stream computes the same kind of sum on the common pool, whose parallelism is the number of cores minus one.",
    anim: [
      "Divide, fork, join",
      [
        ["root", "sum[0..1M]", "too big"],
        ["left", "sum[0..500k]", "forked"],
        ["right", "sum[500k..1M]", "computed here"],
        ["leaf", "<= 10k items", "sum directly"],
        ["join", "join + combine", "left + right"],
      ],
      [
        ["root", "left", "fork()", "The root task splits in two and forks the left half to the pool."],
        ["root", "right", "compute()", "The current thread keeps working on the right half itself."],
        ["right", "leaf", "split", "Halves keep splitting until they are below the threshold."],
        ["leaf", "join", "results", "Leaf sums flow back up; join waits for forked halves (or steals help)."],
      ],
    ],
    mistakes: [
      "Calling `left.fork(); right.fork(); left.join(); right.join();`, which wastes the current thread; compute one half directly.",
      "Choosing a tiny threshold that creates millions of tasks.",
      "Doing blocking I/O in the common pool (including in parallel streams).",
    ],
    qa: [
      ["What is the Fork/Join framework?", "A framework for parallel divide-and-conquer: tasks split into subtasks (fork), run in a ForkJoinPool with work stealing, and combine results (join)."],
      ["What is work stealing?", "Idle worker threads take tasks from the tail of other workers' deques, balancing load automatically."],
      ["What is the difference between RecursiveTask and RecursiveAction?", "RecursiveTask returns a result from compute(); RecursiveAction returns nothing."],
      ["Which pool do parallel streams use?", "The common ForkJoinPool, with parallelism equal to the number of cores minus one by default."],
    ],
    ex: [
      "Write the compute() of a `MaxTask extends RecursiveTask<Integer>` that finds the maximum of an int array range.",
      "If the range is small, loop to find the max; otherwise split at mid, `left.fork()`, `int r = right.compute(); int l = left.join(); return Math.max(l, r);`.",
    ],
  }),

  lesson("BlockingQueue, LinkedBlockingQueue and a Custom BlockingQueue", {
    intro:
      "`BlockingQueue` is the workhorse of concurrent Java: thread pools, producer-consumer pipelines and message passing all use it. This lesson explains the BlockingQueue methods and implementations, focuses on LinkedBlockingQueue, builds a custom LinkedBlockingQueue with two locks, and uses it for producer-consumer and inside a small thread pool.",
    topics: [
      [
        "Four styles of methods",
        "For inserting: `add` throws when full, `offer` returns false, `put` blocks, `offer(e, timeout)` waits up to a limit. For removing: `remove` throws when empty, `poll` returns null, `take` blocks, `poll(timeout)` waits. For examining: `element` throws, `peek` returns null. Null elements are not allowed. `drainTo(collection)` moves many elements at once.",
      ],
      [
        "Implementations",
        "`ArrayBlockingQueue` (bounded, array, one lock), `LinkedBlockingQueue` (optionally bounded, default Integer.MAX_VALUE, separate put and take locks), `PriorityBlockingQueue` (unbounded, ordered), `DelayQueue` (elements become available after a delay), `SynchronousQueue` (no capacity: each put waits for a take), `LinkedTransferQueue` and `LinkedBlockingDeque`.",
      ],
      [
        "LinkedBlockingQueue internals",
        "A linked list with a head and tail, an atomic count, and two `ReentrantLock`s: `putLock` with condition `notFull`, and `takeLock` with `notEmpty`. Producers and consumers lock different ends, so a put and a take can proceed at the same time, giving higher throughput than a single-lock queue.",
      ],
      [
        "Custom LinkedBlockingQueue",
        "The custom version mirrors that design: nodes, a dummy head, `AtomicInteger count`, and two locks with conditions. `put` waits on notFull, links a node at the tail, increments the count, and signals notEmpty (taking the take lock briefly). `take` does the mirror image.",
      ],
      [
        "Producer-consumer and thread pools",
        "Producers `put` and consumers `take`, with no other synchronization. A thread pool is the same pattern: callers `put` Runnables and worker threads `take` and run them, which is exactly how `ThreadPoolExecutor` uses its work queue.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static class MyLinkedBlockingQueue<E> {
        private static class Node<E> { E item; Node<E> next; Node(E item) { this.item = item; } }
        private final int capacity;
        private final AtomicInteger count = new AtomicInteger();
        private Node<E> head = new Node<>(null), tail = head;           // dummy head
        private final ReentrantLock putLock = new ReentrantLock(), takeLock = new ReentrantLock();
        private final Condition notFull = putLock.newCondition(), notEmpty = takeLock.newCondition();

        MyLinkedBlockingQueue(int capacity) { this.capacity = capacity; }

        void put(E e) throws InterruptedException {
            if (e == null) throw new NullPointerException();
            int before;
            putLock.lockInterruptibly();
            try {
                while (count.get() == capacity) notFull.await();
                tail = tail.next = new Node<>(e);
                before = count.getAndIncrement();
                if (before + 1 < capacity) notFull.signal();               // room for more producers
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
                head = first;
                item = first.item;
                first.item = null;
                before = count.getAndDecrement();
                if (before > 1) notEmpty.signal();                          // more items for consumers
            } finally { takeLock.unlock(); }
            if (before == capacity) { putLock.lock(); try { notFull.signal(); } finally { putLock.unlock(); } }
            return item;
        }

        int size() { return count.get(); }
    }

    public static void main(String[] args) throws Exception {
        BlockingQueue<String> jdk = new LinkedBlockingQueue<>(2);
        System.out.println("offer a: " + jdk.offer("a") + ", offer b: " + jdk.offer("b") + ", offer c (full): " + jdk.offer("c"));
        try { jdk.add("c"); } catch (IllegalStateException e) { System.out.println("add when full -> IllegalStateException"); }
        System.out.println("offer with timeout: " + jdk.offer("c", 50, TimeUnit.MILLISECONDS) + ", peek: " + jdk.peek());
        List<String> drained = new ArrayList<>();
        jdk.drainTo(drained);
        System.out.println("drainTo: " + drained + ", poll on empty: " + jdk.poll());

        MyLinkedBlockingQueue<Integer> queue = new MyLinkedBlockingQueue<>(10);
        int producers = 3, perProducer = 10_000;
        long[] sum = {0};
        Thread consumer = new Thread(() -> {
            try { for (int i = 0; i < producers * perProducer; i++) sum[0] += queue.take(); } catch (InterruptedException ignored) { }
        });
        consumer.start();
        List<Thread> ps = new ArrayList<>();
        for (int p = 0; p < producers; p++) {
            Thread t = new Thread(() -> { try { for (int i = 1; i <= perProducer; i++) queue.put(i); } catch (InterruptedException ignored) { } });
            ps.add(t); t.start();
        }
        for (Thread t : ps) t.join();
        consumer.join();
        System.out.println("custom queue, 3 producers -> 1 consumer: sum " + sum[0] + " (expected " + 3L * perProducer * (perProducer + 1) / 2 + "), size now " + queue.size());

        MyLinkedBlockingQueue<Runnable> work = new MyLinkedBlockingQueue<>(100);
        AtomicInteger done = new AtomicInteger();
        CountDownLatch finished = new CountDownLatch(20);
        for (int w = 0; w < 3; w++) {
            Thread worker = new Thread(() -> {
                try { while (true) { work.take().run(); } } catch (InterruptedException ignored) { }
            });
            worker.setDaemon(true);
            worker.start();
        }
        for (int i = 0; i < 20; i++) work.put(() -> { done.incrementAndGet(); finished.countDown(); });
        finished.await();
        System.out.println("thread pool built on the custom queue ran " + done.get() + " tasks");
    }
}`,
    walk:
      "The first part shows the method styles on a JDK `LinkedBlockingQueue` with capacity 2: `offer` returns false when full, `add` throws, a timed `offer` gives up, `peek` looks without removing, `drainTo` empties the queue in one call, and `poll` on an empty queue returns null.\n\nThe custom queue uses the two-lock design: producers lock only the tail and consumers only the head, with an atomic count deciding when to signal across locks. Three producers push 30,000 numbers through a 10-element queue to one consumer, and the sum is exact. Finally three daemon worker threads take Runnables from a custom queue and run them: a minimal thread pool.",
    anim: [
      "Two-lock linked queue",
      [
        ["prod", "producers", "put()"],
        ["putLock", "putLock", "tail end"],
        ["list", "linked nodes", "count (atomic)"],
        ["takeLock", "takeLock", "head end"],
        ["cons", "consumers", "take()"],
      ],
      [
        ["prod", "putLock", "lock", "Producers lock only the put lock and append at the tail."],
        ["putLock", "list", "link", "A new node is linked and the atomic count is incremented."],
        ["cons", "takeLock", "lock", "Consumers lock only the take lock and remove from the head."],
        ["takeLock", "list", "unlink", "Because the locks differ, a put and a take can happen at the same time."],
      ],
    ],
    mistakes: [
      "Using an unbounded LinkedBlockingQueue where back-pressure is needed.",
      "Mixing `add`/`remove` (throwing) with `put`/`take` (blocking) without knowing which behaviour you get.",
      "Trying to put null into a BlockingQueue.",
    ],
    qa: [
      ["What is a BlockingQueue?", "A thread-safe queue whose put blocks when full and take blocks when empty, with additional throwing, returning and timed variants."],
      ["What is the difference between ArrayBlockingQueue and LinkedBlockingQueue?", "ArrayBlockingQueue is bounded, array-based and uses one lock; LinkedBlockingQueue is linked, optionally bounded and uses separate put and take locks for higher throughput."],
      ["What is a SynchronousQueue?", "A queue with no capacity in which each put waits for a matching take, used for direct handoff (for example by cached thread pools)."],
    ],
    ex: [
      "Which BlockingQueue would you use for tasks that must run at a scheduled time in the future?",
      "A DelayQueue: elements implement Delayed and only become available to take() when their delay has expired (ScheduledThreadPoolExecutor uses a similar delayed work queue).",
    ],
  }),

  lesson("Concurrency Interview Questions", {
    intro:
      "This lesson collects the most frequently asked questions about `java.util.concurrent` with concise answers, plus a program that compares several synchronizers side by side: synchronized vs ReentrantLock, CountDownLatch vs CyclicBarrier, Callable vs Runnable, and execute vs submit.",
    topics: [
      [
        "Synchronizer comparison",
        "Lock/ReentrantLock: mutual exclusion with extra features. ReadWriteLock: many readers or one writer. Semaphore: N permits. CountDownLatch: wait for N events, one-shot. CyclicBarrier: N threads wait for each other, reusable. Phaser: dynamic parties, phases, tiers. Exchanger: two threads swap data.",
      ],
      [
        "Executors and futures",
        "ExecutorService pools, execute vs submit, Callable vs Runnable, Future and its limits, CompletableFuture for composition, invokeAll/invokeAny, shutdown vs shutdownNow, rejection policies, and choosing pool sizes.",
      ],
      [
        "Lock-free and collections",
        "CAS and atomic classes, ABA and AtomicStampedReference, LongAdder, ConcurrentHashMap internals, CopyOnWriteArrayList, BlockingQueue variants and Fork/Join with work stealing.",
      ],
    ],
    code: String.raw`import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicStampedReference;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) throws Exception {
        ReentrantLock lock = new ReentrantLock();
        Object monitor = new Object();
        synchronized (monitor) { System.out.println("synchronized: lock released automatically at block end"); }
        lock.lock();
        try { System.out.println("ReentrantLock: explicit unlock in finally, tryLock available: " + lock.tryLock()); }
        finally { lock.unlock(); lock.unlock(); }

        CountDownLatch latch = new CountDownLatch(2);
        latch.countDown(); latch.countDown();
        latch.await();
        System.out.println("CountDownLatch: one thread counted down twice, now open and one-shot: " + (latch.getCount() == 0));
        CyclicBarrier barrier = new CyclicBarrier(1, () -> System.out.println("CyclicBarrier: action runs every time the party count is reached"));
        barrier.await(); barrier.await();

        ExecutorService pool = Executors.newSingleThreadExecutor();
        Callable<Integer> callable = () -> 7;
        Runnable runnable = () -> { };
        System.out.println("Callable returns " + pool.submit(callable).get() + "; Runnable via submit returns " + pool.submit(runnable).get());
        pool.execute(runnable);
        pool.shutdown();

        AtomicStampedReference<String> ref = new AtomicStampedReference<>("A", 0);
        int stamp = ref.getStamp();
        ref.compareAndSet("A", "B", stamp, stamp + 1);
        ref.compareAndSet("B", "A", stamp + 1, stamp + 2);           // back to A, but the stamp changed
        System.out.println("ABA detected: CAS with the old stamp fails = " + !ref.compareAndSet("A", "C", stamp, stamp + 1));

        ThreadPoolExecutor bounded = new ThreadPoolExecutor(1, 1, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(1),
                new ThreadPoolExecutor.AbortPolicy());
        CountDownLatch block = new CountDownLatch(1);
        bounded.execute(() -> { try { block.await(); } catch (InterruptedException ignored) { } });   // occupies the thread
        bounded.execute(() -> { });                                                                    // fills the queue
        try { bounded.execute(() -> { }); }
        catch (RejectedExecutionException e) { System.out.println("bounded pool full -> RejectedExecutionException (AbortPolicy)"); }
        block.countDown();
        bounded.shutdown();
    }
}`,
    walk:
      "The program walks through common comparisons. `synchronized` releases its lock automatically while `ReentrantLock` must be unlocked explicitly (it was locked twice here, once by `tryLock`, so it is unlocked twice). A latch can be counted down twice by one thread and then stays open, while a barrier runs its action every time its parties arrive and resets.\n\n`submit` returns the Callable's value and null for a Runnable. `AtomicStampedReference` detects an ABA change because the stamp moved on even though the value is \"A\" again. A `ThreadPoolExecutor` with one thread and a queue of one rejects the third task with the abort policy.",
    anim: [
      "Picking a synchronizer",
      [
        ["need", "what you need", "coordination"],
        ["lock", "Lock", "one at a time"],
        ["sem", "Semaphore", "N at a time"],
        ["latch", "CountDownLatch", "wait for events"],
        ["barrier", "CyclicBarrier", "wait for peers"],
      ],
      [
        ["need", "lock", "exclusive", "Protect shared state for one thread at a time: a Lock or synchronized."],
        ["need", "sem", "limit", "Allow up to N threads into a section: a Semaphore."],
        ["need", "latch", "events", "Wait until N things have happened elsewhere: a CountDownLatch."],
        ["need", "barrier", "phases", "Make N threads wait for each other repeatedly: a CyclicBarrier."],
      ],
    ],
    mistakes: [
      "Choosing a synchronizer by name rather than by the coordination pattern.",
      "Using unbounded queues with fixed pools in servers, hiding overload until memory runs out.",
    ],
    qa: [
      ["What are the rejection policies of ThreadPoolExecutor?", "AbortPolicy (throw RejectedExecutionException, default), CallerRunsPolicy (run in the caller's thread), DiscardPolicy (drop silently) and DiscardOldestPolicy (drop the oldest queued task)."],
      ["What is the ABA problem?", "A CAS sees the expected value A although it changed A to B to A in between; AtomicStampedReference or AtomicMarkableReference detect this with a stamp."],
      ["How does ThreadPoolExecutor decide to create threads?", "Below corePoolSize it creates a thread per task; then it queues tasks; when the queue is full it creates threads up to maximumPoolSize; beyond that it rejects."],
      ["What is CompletableFuture?", "A Future that can be completed explicitly and composed with non-blocking callbacks such as thenApply, thenCombine, allOf and exceptionally."],
      ["What is the difference between CountDownLatch and Semaphore?", "A latch waits for a count to reach zero once; a semaphore repeatedly hands out and takes back permits to limit concurrency."],
    ],
    ex: [
      "With `ThreadPoolExecutor(2, 4, 60s, new ArrayBlockingQueue<>(10))`, how many tasks can be accepted before rejection if all tasks block forever?",
      "2 core threads + 10 queued + 2 extra threads up to the maximum of 4 = 14 tasks; the 15th is rejected.",
    ],
  }),
]);
