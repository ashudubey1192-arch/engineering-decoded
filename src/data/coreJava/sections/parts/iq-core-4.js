import { lesson } from "../../schema.js";

export default [
  lesson("Core Java Q84-Q92: Thread Pools, ThreadLocal, Executors, Semaphore, Atomics and Future", {
    intro:
      "Questions 84 to 92 are about the tools you reach for instead of raw threads:\n\n- writing your own thread pool\n- ThreadLocal\n- busy spin\n- the Executor framework, and execute vs submit\n- Semaphore, including producer-consumer built on two semaphores\n- the atomic classes\n- Future and Callable\n\nThe program contains a complete hand-written thread pool plus a demonstration of each utility.",
    topics: [
      [
        "Q84. How would you write your own thread pool?",
        "A thread pool is a fixed set of worker threads that take tasks from a shared **blocking queue**:\n\n1. The constructor creates `n` worker threads and starts them.\n2. Each worker loops: `task = queue.take(); task.run();`, and catches exceptions so that one bad task cannot kill the worker.\n3. `execute(task)` just puts the task into the queue.\n4. `shutdown()` sets a flag and enqueues one poison-pill task per worker (or interrupts them), so the workers exit after finishing queued work.\n\nThe real `ThreadPoolExecutor` adds core vs maximum pool size, keep-alive, rejection policies, thread factories and lifecycle hooks. The program contains a full minimal pool.",
      ],
      [
        "Q85. What is ThreadLocal?",
        "`ThreadLocal<T>` gives **each thread its own independent copy** of a variable. `get()` returns the current thread's value and `set()` changes only it. Internally each Thread has a `ThreadLocalMap` keyed by the ThreadLocal object. Typical uses are per-thread non-thread-safe objects (a `SimpleDateFormat` or a random generator), and request context (user id, transaction, locale) carried without passing parameters.\n\nCreate one with `ThreadLocal.withInitial(() -> value)`. In thread pools, threads are reused, so always call `remove()` in a finally block. Otherwise values leak between requests and can cause memory leaks. For virtual threads, prefer `ScopedValue` (final in Java 25).",
      ],
      [
        "Q86. What is busy spin?",
        "Busy spin (busy waiting) means a thread waits for a condition by looping and checking it continuously (`while (!ready) { }`) instead of blocking with wait, park or sleep. It wastes a CPU core while waiting, but it avoids the cost of a context switch and of re-warming the cache. That is why it is used for very short waits in low-latency systems (for example the LMAX Disruptor) and inside lock implementations, which spin briefly before parking.\n\nThe flag must be volatile (or atomic) so the loop sees the update. Java 9 added `Thread.onSpinWait()` as a CPU hint (the PAUSE instruction) inside such loops.",
      ],
      [
        "Q87. What is the Executor framework?",
        "The Executor framework (`java.util.concurrent`, Java 5) separates **task submission** from **thread management**. These are its parts:\n\n- `Executor` has `execute(Runnable)`.\n- `ExecutorService` adds `submit`, `invokeAll`, `invokeAny`, `shutdown`, `shutdownNow` and `awaitTermination`.\n- `ScheduledExecutorService` adds delayed and periodic tasks.\n- The `Executors` factory methods are `newFixedThreadPool(n)`, `newCachedThreadPool()`, `newSingleThreadExecutor()`, `newScheduledThreadPool(n)`, `newWorkStealingPool()` and, in Java 21, `newVirtualThreadPerTaskExecutor()`.\n\nPools reuse threads, bound concurrency and queue extra work. For production code, configure `ThreadPoolExecutor` directly with a bounded queue and a rejection policy. Since Java 19, ExecutorService is AutoCloseable, so it works in try-with-resources.",
      ],
      [
        "Q88. What is the difference between execute() and submit()?",
        "`execute(Runnable)` is declared in `Executor` and returns **void**. You cannot get a result, and an exception thrown by the task reaches the worker thread's uncaught-exception handler, so it is printed.\n\n`submit(Runnable or Callable)` is declared in `ExecutorService` and returns a **Future**. With a Callable you get its result from `future.get()`. Any exception is **captured** inside the Future and re-thrown, wrapped in `ExecutionException`, only when you call `get()`. A submitted task that fails, and whose Future nobody checks, fails silently. That is a common production bug.",
      ],
      [
        "Q89. What is a Semaphore?",
        "A Semaphore holds a number of **permits**. `acquire()` takes one, blocking if none are available, and `release()` returns one. With N permits it limits concurrent access to a resource to N threads, for example a pool of 3 database connections or a rate-limited API. With one permit (a binary semaphore) it works like a mutex, except that any thread can release it, not just the one that acquired it.\n\nOther methods are `tryAcquire(timeout)`, `acquire(n)` and `availablePermits()`. `new Semaphore(n, true)` makes it fair (first come, first served). Always release in a finally block.",
      ],
      [
        "Q90. How do you solve producer-consumer with Semaphores?",
        "Use two semaphores. **producerSem** starts with 1 permit and **consumerSem** with 0. The producer calls `producerSem.acquire()`, produces an item, then `consumerSem.release()`. The consumer calls `consumerSem.acquire()`, consumes the item, then `producerSem.release()`. The permits pass back and forth, so the two threads alternate strictly: produce 1, consume 1, produce 2, and so on.\n\nFor a buffer of size N, start `emptySlots = N` and `fullSlots = 0`, and guard the buffer itself with a mutex.",
      ],
      [
        "Q91. What are atomic classes?",
        "The `java.util.concurrent.atomic` classes are:\n\n- `AtomicInteger`, `AtomicLong`, `AtomicBoolean` and `AtomicReference`\n- the array forms (`AtomicIntegerArray`, and so on)\n- the field updaters\n- `LongAdder`, `LongAccumulator` and `DoubleAdder`\n\nThey perform single-variable updates atomically **without locks**, using the CPU's compare-and-swap (CAS) instruction. Examples are `incrementAndGet()`, `getAndAdd()`, `compareAndSet(expected, new)`, `updateAndGet(fn)` and `accumulateAndGet(x, fn)`. A CAS loop retries if another thread changed the value in between, so nobody blocks.\n\nAtomics also have volatile visibility semantics. Under heavy contention, `LongAdder` scales better than AtomicLong for counters, because it spreads updates over cells.",
      ],
      [
        "Q92. What are Future and Callable?",
        "`Callable<V>` is a task that **returns a value and can throw checked exceptions**: `V call() throws Exception`. `Runnable.run()` returns nothing and cannot throw checked exceptions.\n\nA `Future<V>` is the handle to a result that will arrive later. Its methods are:\n\n- `get()`, which blocks until the result is ready\n- `get(timeout, unit)`\n- `isDone()`\n- `cancel(mayInterrupt)` and `isCancelled()`\n- since Java 19, `state()` and `resultNow()`\n\n`ExecutorService.submit(callable)` returns a Future, and `FutureTask` implements both Runnable and Future. For composing async steps without blocking, use `CompletableFuture` (Java 8): `supplyAsync(...).thenApply(...).thenCombine(...)`.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    // Q84: a minimal fixed-size thread pool.
    static class SimplePool {
        private final BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
        private final List<Thread> workers = new ArrayList<>();
        private static final Runnable POISON = () -> { };

        SimplePool(int size) {
            for (int i = 0; i < size; i++) {
                Thread worker = new Thread(() -> {
                    while (true) {
                        Runnable task;
                        try { task = queue.take(); } catch (InterruptedException e) { return; }
                        if (task == POISON) return;                // shutdown signal
                        try { task.run(); }                         // one failing task must not kill the worker
                        catch (RuntimeException e) { System.out.println("Q84   task failed: " + e.getMessage()); }
                    }
                }, "pool-worker-" + i);
                workers.add(worker);
                worker.start();
            }
        }
        void execute(Runnable task) { queue.add(task); }
        void shutdownAndWait() throws InterruptedException {
            for (int i = 0; i < workers.size(); i++) queue.add(POISON); // one pill per worker, after queued tasks
            for (Thread worker : workers) worker.join();
        }
    }

    // Q85: one counter per thread.
    static final ThreadLocal<Integer> requestId = ThreadLocal.withInitial(() -> 0);

    public static void main(String[] args) throws Exception {
        // Q84
        SimplePool pool = new SimplePool(2);
        AtomicInteger done = new AtomicInteger();
        for (int i = 0; i < 6; i++) pool.execute(done::incrementAndGet);
        pool.execute(() -> { throw new IllegalStateException("boom"); });
        pool.shutdownAndWait();
        System.out.println("Q84 SimplePool completed " + done.get() + " tasks and survived a failing one");

        // Q85: each thread sees only its own value.
        List<String> seen = Collections.synchronizedList(new ArrayList<>());
        Thread[] threads = new Thread[3];
        for (int i = 0; i < 3; i++) {
            int id = (i + 1) * 100;
            threads[i] = new Thread(() -> {
                try {
                    requestId.set(id);
                    seen.add(Thread.currentThread().getName() + "=" + requestId.get());
                } finally {
                    requestId.remove();                    // essential with pooled threads
                }
            }, "req-" + (i + 1));
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        Collections.sort(seen);
        System.out.println("Q85 ThreadLocal values " + seen + ", main still sees " + requestId.get());

        // Q86: busy spin on a volatile-like AtomicBoolean.
        AtomicBoolean ready = new AtomicBoolean(false);
        Thread spinner = new Thread(() -> { while (!ready.get()) Thread.onSpinWait(); });
        spinner.start();
        ready.set(true);
        spinner.join();
        System.out.println("Q86 busy-spinning thread saw the flag and finished");

        // Q87 + Q88: execute vs submit.
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch executed = new CountDownLatch(1);
        executor.execute(() -> { System.out.println("Q88 execute() ran a Runnable, nothing returned"); executed.countDown(); });
        executed.await();                                  // keep the output order fixed
        Future<?> failing = executor.submit(() -> { throw new IllegalArgumentException("hidden until get()"); });
        try {
            failing.get();
        } catch (ExecutionException e) {
            System.out.println("Q88 submit() stored the exception: " + e.getCause().getMessage());
        }

        // Q89: at most 2 threads inside the guarded section at once.
        Semaphore permits = new Semaphore(2);
        AtomicInteger inside = new AtomicInteger(), maxInside = new AtomicInteger();
        List<Future<?>> jobs = new ArrayList<>();
        ExecutorService six = Executors.newFixedThreadPool(6);
        for (int i = 0; i < 6; i++) {
            jobs.add(six.submit(() -> {
                permits.acquireUninterruptibly();
                try {
                    maxInside.accumulateAndGet(inside.incrementAndGet(), Math::max);
                    Thread.sleep(20);
                    inside.decrementAndGet();
                } catch (InterruptedException ignored) {
                } finally {
                    permits.release();
                }
            }));
        }
        for (Future<?> job : jobs) job.get();
        six.shutdown();
        System.out.println("Q89 Semaphore(2): max threads inside at once = " + maxInside.get());

        // Q90: producer-consumer alternating with two semaphores.
        Semaphore producerSem = new Semaphore(1), consumerSem = new Semaphore(0);
        int[] slot = new int[1];
        StringBuilder log = new StringBuilder();
        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                producerSem.acquireUninterruptibly();
                slot[0] = i;
                log.append("P").append(i).append(' ');
                consumerSem.release();
            }
        });
        Thread consumer = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                consumerSem.acquireUninterruptibly();
                log.append("C").append(slot[0]).append(' ');
                producerSem.release();
            }
        });
        producer.start(); consumer.start(); producer.join(); consumer.join();
        System.out.println("Q90 strict alternation: " + log.toString().trim());

        // Q91: lock-free counters.
        AtomicInteger atomic = new AtomicInteger();
        LongAdder adder = new LongAdder();
        List<Callable<Void>> increments = new ArrayList<>();
        for (int t = 0; t < 4; t++) increments.add(() -> { for (int i = 0; i < 25_000; i++) { atomic.incrementAndGet(); adder.increment(); } return null; });
        executor.invokeAll(increments);
        boolean swapped = atomic.compareAndSet(100_000, 0);
        System.out.println("Q91 AtomicInteger reached 100000 and CAS reset it: " + swapped + ", LongAdder sum = " + adder.sum());

        // Q92: Callable returns a value through a Future.
        Callable<Integer> sumTask = () -> { int sum = 0; for (int i = 1; i <= 100; i++) sum += i; return sum; };
        Future<Integer> future = executor.submit(sumTask);
        System.out.println("Q92 Future.get() = " + future.get() + ", isDone = " + future.isDone()
                + ", state = " + future.state());
        CompletableFuture<String> chained = CompletableFuture.supplyAsync(() -> 21, executor)
                .thenApply(n -> n * 2).thenApply(n -> "answer " + n);
        System.out.println("Q92 CompletableFuture chain -> " + chained.get());
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
    }
}`,
    walk:
      "The `SimplePool` starts two workers that block on a LinkedBlockingQueue. Seven tasks are queued: six increment a counter and one throws. The failing task is caught inside the worker loop, so both workers survive. `shutdownAndWait` queues one poison pill per worker behind the real tasks, so all queued work finishes before the workers exit (Q84).\n\nQ85 gives three threads their own `requestId`. Main still sees the initial 0, and `remove()` clears each thread's copy. Q86 spins with `Thread.onSpinWait()` until a flag flips. In Q88 the task submitted with `submit` throws, and the exception surfaces only when `get()` is called, wrapped in ExecutionException.\n\nQ89 runs six tasks through a Semaphore with two permits, and the recorded maximum is 2. Q90 passes one permit back and forth, giving P1 C1 P2 C2 P3 C3. Q91 counts to 100,000 with four threads, then CAS-resets the AtomicInteger. Q92 gets a Callable's result through a Future and chains a CompletableFuture.",
    anim: [
      "Inside a simple thread pool",
      [
        ["client", "caller", "execute(task)"],
        ["queue", "BlockingQueue", "pending tasks"],
        ["w1", "worker 1", "take() -> run()"],
        ["w2", "worker 2", "take() -> run()"],
        ["pill", "poison pill", "shutdown"],
      ],
      [
        ["client", "queue", "execute", "execute() only enqueues the task, so the caller returns immediately."],
        ["queue", "w1", "take()", "An idle worker blocked in take() wakes up and receives the task."],
        ["queue", "w2", "take()", "The second worker takes the next task, so two run in parallel."],
        ["w1", "queue", "loop", "After run() returns, the worker loops back and takes another task."],
        ["pill", "queue", "shutdown", "Shutdown enqueues one pill per worker; a worker that takes a pill exits."],
      ],
    ],
    mistakes: [
      "Using `submit` and never calling `get()`. Exceptions disappear silently.",
      "Forgetting `ThreadLocal.remove()` in pooled threads. The value leaks to the next task on that thread.",
      "Calling `Executors.newFixedThreadPool` in production without thinking about its unbounded queue, which can grow until memory runs out.",
      "Releasing a Semaphore without having acquired it. This silently increases the number of permits.",
    ],
    qa: [
      [
        "What is the difference between shutdown() and shutdownNow()?",
        "`shutdown()` stops accepting new tasks but finishes the queued ones. `shutdownNow()` also interrupts running tasks and returns the queued tasks that never started.",
      ],
      [
        "What does CAS stand for and what is the ABA problem?",
        "CAS is compare-and-swap. The ABA problem: a value changes from A to B and back to A, so a CAS that expects A succeeds although the state changed in between. `AtomicStampedReference` adds a version stamp to detect this.",
      ],
      [
        "What does `invokeAll` return?",
        "A list of completed Futures, one per task, in the same order as the input. It blocks until every task has finished or failed.",
      ],
    ],
    ex: [
      "Add a `submit(Callable<T>)` method returning `Future<T>` to SimplePool using only JDK classes.",
      "`<T> Future<T> submit(Callable<T> c) { FutureTask<T> task = new FutureTask<>(c); execute(task); return task; }`. FutureTask is a Runnable that stores the result or exception and is also a Future, so callers can `get()` it.",
    ],
  }),

  lesson("Core Java Q93-Q103: CountDownLatch, CyclicBarrier, Phaser, Locks and Fork/Join", {
    intro:
      "Questions 93 to 103 cover the synchronizers and lock classes of `java.util.concurrent`:\n\n- CountDownLatch and its real-world uses\n- CyclicBarrier, why it is called cyclic, and how it differs from a latch\n- Phaser and how it extends CyclicBarrier\n- the Lock interface\n- synchronized vs ReentrantLock\n- the Fork/Join framework\n\nThe program runs every one of them with deterministic output.",
    topics: [
      [
        "Q93. What is CountDownLatch?",
        "A CountDownLatch is created with a count. Threads that call `await()` block until other threads have called `countDown()` that many times. When the count reaches zero, all waiters are released, and later `await()` calls return immediately. The latch is **one-shot**: it cannot be reset. `await(timeout, unit)` returns false if the time runs out. Any thread can count down, and the waiting threads need not be the counting threads.",
      ],
      [
        "Q94. What are real-world uses of CountDownLatch?",
        "- **Startup gate**: the main thread waits until N services (cache, DB pool, message consumer) report that they are ready before it accepts traffic.\n- **Start signal**: worker threads `await` a latch of 1 so they all begin at the same moment, which is useful in load tests.\n- **Completion**: wait until N parallel downloads or computations finish, then merge the results.\n- **Tests**: wait for an asynchronous callback with a timeout.\n\nIn each case one group of threads waits for an event that a known number of other actions will produce.",
      ],
      [
        "Q95. What is CyclicBarrier?",
        "A CyclicBarrier makes a fixed number of parties wait **for each other** at a common point. Each thread calls `await()`. The barrier opens only when the last of the N parties arrives, and then all of them continue together. An optional **barrier action** (a Runnable) runs once, in the last arriving thread, before the others are released, for example to merge partial results. If a thread is interrupted or times out while waiting, the barrier becomes broken and the others get `BrokenBarrierException`.",
      ],
      [
        "Q96. Why is it called a cyclic barrier?",
        "Because it **resets automatically** after it opens, so the same barrier can be reused for the next round (a \"generation\"). That suits iterative algorithms: each thread computes its part of step 1, awaits; computes step 2, awaits; and so on, with the barrier action merging the results after every step. A CountDownLatch, by contrast, stays open once it reaches zero. `reset()` also exists, to force a reset, but it breaks threads that are currently waiting.",
      ],
      [
        "Q97. What are real-world uses of CyclicBarrier?",
        "- **Parallel iterative computations**: a simulation or matrix computation where each worker handles a slice of the grid and all must finish step k before anyone starts step k+1.\n- **Multiplayer games**: every player must be ready before a round starts.\n- **Batch processing in chunks**: N threads each load a partition, the barrier action writes the combined batch, and the next round begins.\n- **Tests that need several threads to reach a point simultaneously**, to provoke races.",
      ],
      [
        "Q98. What is the difference between CyclicBarrier and CountDownLatch?",
        "- **Reuse**: a latch is one-shot, while a barrier resets for the next generation.\n- **Who waits for whom**: with a latch, one or more threads wait for N `countDown` events, and the counting threads do not wait. With a barrier, N threads wait for each other, and every party calls `await`.\n- **Count**: the latch's count is decremented by events, possibly many per thread. The barrier's parties number is the count of threads that must arrive.\n- **Action**: a barrier can run a barrier action when it opens; a latch cannot.\n- **Failure**: a barrier has a broken state with BrokenBarrierException.",
      ],
      [
        "Q99. How is Phaser similar to CyclicBarrier?",
        "A Phaser (Java 7) is a reusable barrier like CyclicBarrier. A set of registered parties synchronises at the end of each **phase**: `arriveAndAwaitAdvance()` works like `await()`, and when all parties arrive the phase number increases and everyone continues. Both support repeated rounds, and both can run an action at each advance. In a Phaser you override `onAdvance(phase, parties)`, which can also return true to terminate the Phaser.",
      ],
      [
        "Q100. How does Phaser differ from CyclicBarrier?",
        "- **Dynamic parties**: in a Phaser, parties can `register()` and `arriveAndDeregister()` at any time, while a CyclicBarrier's count is fixed at construction.\n- **Arrive without waiting**: `arrive()` signals arrival and keeps going, without blocking.\n- **Phase numbers**: you can `awaitAdvance(phase)` for a specific phase.\n- **Termination**: `onAdvance` can return true, or all parties can deregister.\n- **Tiering**: Phasers can be arranged in a tree to reduce contention when there are huge numbers of parties.\n\nA Phaser can also act as a latch (one party waits, others `arrive`).",
      ],
      [
        "Q101. What is the Lock interface?",
        "`java.util.concurrent.locks.Lock` (Java 5) is an explicit alternative to `synchronized`. Its methods:\n\n- `lock()` and `unlock()`, where unlock must be in finally\n- `tryLock()` (non-blocking), and `tryLock(time, unit)` (bounded waiting)\n- `lockInterruptibly()` (waiting can be interrupted)\n- `newCondition()` (multiple wait sets)\n\nThe implementations are `ReentrantLock`, the read and write locks of `ReentrantReadWriteLock` (many readers or one writer), and `StampedLock` (Java 8, with optimistic reads, not reentrant). All of them give the same memory-visibility guarantees as synchronized.",
      ],
      [
        "Q102. What is the difference between synchronized and ReentrantLock?",
        "Both are reentrant mutual-exclusion locks with the same visibility semantics. **synchronized** is built into the language. The lock is released automatically when the block exits, even on an exception. It is simpler, and the JVM optimises it well. **ReentrantLock** is more flexible:\n\n- `tryLock` with a timeout helps avoid deadlock.\n- Lock waiting can be interrupted.\n- An optional **fair** ordering is available (`new ReentrantLock(true)`).\n- Several Condition objects are possible.\n- Query methods exist (`isLocked`, `getHoldCount`, `getQueueLength`).\n- The lock can be released in a different method than it was acquired.\n\nIt requires `unlock()` in finally. Prefer synchronized unless you need one of these features. Before Java 24, synchronized also pinned virtual threads to their carrier, a problem that JEP 491 removed.",
      ],
      [
        "Q103. What is the Fork/Join framework?",
        "The Fork/Join framework (Java 7) parallelises **divide-and-conquer** work. A task checks whether its problem is small enough to solve directly. If not, it splits the problem, `fork()`s one half (schedules it asynchronously), computes the other half itself, then `join()`s the forked half and combines the results.\n\n`ForkJoinPool` runs these tasks with **work stealing**: every worker has a double-ended queue, pushes and pops its own subtasks at one end, and idle workers steal from the other end of busy workers' queues. Subclass `RecursiveTask<V>` for a result or `RecursiveAction` for none. Parallel streams and `CompletableFuture`'s default executor use the common pool (`ForkJoinPool.commonPool()`).",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {

    // Q103: sum an array by splitting it until chunks are small.
    static class SumTask extends RecursiveTask<Long> {
        private static final int THRESHOLD = 1_000;
        private final int[] data; private final int from, to;
        SumTask(int[] data, int from, int to) { this.data = data; this.from = from; this.to = to; }
        @Override protected Long compute() {
            if (to - from <= THRESHOLD) {                      // small enough: solve directly
                long sum = 0;
                for (int i = from; i < to; i++) sum += data[i];
                return sum;
            }
            int mid = (from + to) >>> 1;
            SumTask left = new SumTask(data, from, mid);
            left.fork();                                       // run the left half asynchronously
            long right = new SumTask(data, mid, to).compute(); // compute the right half here
            return right + left.join();                        // wait for the forked half
        }
    }

    public static void main(String[] args) throws Exception {
        // Q93 + Q94: main waits until three services report ready.
        CountDownLatch ready = new CountDownLatch(3);
        List<String> started = Collections.synchronizedList(new ArrayList<>());
        for (String service : List.of("cache", "database", "queue")) {
            new Thread(() -> { started.add(service); ready.countDown(); }).start();
        }
        ready.await();                                         // blocks until the count is 0
        Collections.sort(started);
        System.out.println("Q93 all services ready: " + started + ", count now " + ready.getCount());

        // Q95 + Q96 + Q97: 3 workers, 2 rounds, a barrier action after each round.
        int[] partial = new int[3];
        List<String> rounds = Collections.synchronizedList(new ArrayList<>());
        CyclicBarrier barrier = new CyclicBarrier(3,
                () -> rounds.add("round total " + (partial[0] + partial[1] + partial[2])));
        Thread[] workers = new Thread[3];
        for (int w = 0; w < 3; w++) {
            int id = w;
            workers[w] = new Thread(() -> {
                try {
                    for (int round = 1; round <= 2; round++) {
                        partial[id] = (id + 1) * round;        // this round's piece of work
                        barrier.await();                       // wait for the other two
                    }
                } catch (InterruptedException | BrokenBarrierException e) { throw new RuntimeException(e); }
            });
            workers[w].start();
        }
        for (Thread t : workers) t.join();
        System.out.println("Q96 the same barrier was reused: " + rounds);

        // Q98: a latch stays open; a barrier resets.
        System.out.println("Q98 latch count stays " + ready.getCount() + ", barrier waiting parties reset to " + barrier.getNumberWaiting());

        // Q99 + Q100: a Phaser with a party that leaves after phase 0.
        List<String> phases = Collections.synchronizedList(new ArrayList<>());
        Phaser phaser = new Phaser(1) {                        // main is registered
            @Override protected boolean onAdvance(int phase, int parties) {
                phases.add("phase " + phase + " done with " + parties + " parties");
                return phase >= 1 || parties == 0;             // terminate after phase 1
            }
        };
        for (int i = 0; i < 2; i++) {
            boolean leavesEarly = i == 0;
            phaser.register();                                 // dynamic registration
            new Thread(() -> {
                phaser.arriveAndAwaitAdvance();                // phase 0
                if (leavesEarly) { phaser.arriveAndDeregister(); return; }
                phaser.arriveAndAwaitAdvance();                // phase 1
            }).start();
        }
        phaser.arriveAndAwaitAdvance();                        // main: phase 0
        phaser.arriveAndAwaitAdvance();                        // main: phase 1
        System.out.println("Q100 " + phases + ", terminated = " + phaser.isTerminated());

        // Q101 + Q102: tryLock with a timeout and a fair ReentrantLock.
        ReentrantLock lock = new ReentrantLock(true);
        lock.lock();
        lock.lock();                                           // reentrant: hold count 2
        int holds = lock.getHoldCount();
        Thread other = new Thread(() -> {
            try {
                boolean got = lock.tryLock(50, TimeUnit.MILLISECONDS);
                System.out.println("Q101 other thread tryLock(50 ms) while held: " + got);
            } catch (InterruptedException ignored) { }
        });
        other.start(); other.join();
        lock.unlock(); lock.unlock();                          // unlock as many times as locked
        System.out.println("Q102 hold count was " + holds + ", fair = " + lock.isFair() + ", locked now = " + lock.isLocked());

        // Q103
        int[] numbers = new int[100_000];
        Arrays.fill(numbers, 1);
        long sum = ForkJoinPool.commonPool().invoke(new SumTask(numbers, 0, numbers.length));
        System.out.println("Q103 Fork/Join sum of 100000 ones = " + sum);
    }
}`,
    walk:
      "Q93 starts three threads that each record a service name and count down. `await()` returns only after the third countDown, and the count then stays at 0 for good. For Q95 to Q97, three workers run two rounds. In each round every worker stores its partial value and awaits. The last to arrive runs the barrier action, which records the round total (6 in round 1 and 12 in round 2). The barrier then opens and resets automatically for round 2.\n\nIn Q100, main and two registered threads pass phase 0 together. One thread then deregisters, so phase 1 completes with two parties. `onAdvance` returns true after phase 1, which terminates the Phaser. In Q102, main locks a fair ReentrantLock twice (hold count 2). The other thread's `tryLock(50 ms)` gives up and returns false instead of deadlocking. Main then unlocks twice. Q103 sums 100,000 ones with a RecursiveTask that splits until a chunk has at most 1,000 elements.",
    anim: [
      "CyclicBarrier across two rounds",
      [
        ["w1", "worker 1", "partial 1, 2"],
        ["w2", "worker 2", "partial 2, 4"],
        ["w3", "worker 3", "partial 3, 6"],
        ["bar", "CyclicBarrier", "parties = 3"],
        ["act", "barrier action", "sum the round"],
      ],
      [
        ["w1", "bar", "await()", "Worker 1 finishes its round-1 piece and waits at the barrier."],
        ["w2", "bar", "await()", "Worker 2 arrives too; the barrier still waits for the third party."],
        ["w3", "bar", "await() last", "The third arrival trips the barrier."],
        ["bar", "act", "run action", "The last thread runs the barrier action once: round total 6."],
        ["bar", "w1", "release + reset", "All three continue, and the same barrier is ready for round 2."],
      ],
    ],
    mistakes: [
      "Expecting to reuse a CountDownLatch. Create a new one or use CyclicBarrier or Phaser.",
      "Forgetting `unlock()` in a finally block with ReentrantLock. An exception then leaves the lock held forever.",
      "Choosing a Fork/Join threshold that is too small. Splitting overhead then outweighs the parallel gain.",
    ],
    qa: [
      [
        "What happens if a CyclicBarrier party is interrupted?",
        "The barrier is broken. The interrupted thread gets InterruptedException, every other waiting or future `await()` throws BrokenBarrierException, and `reset()` is needed to reuse it.",
      ],
      [
        "Why compute one half directly instead of forking both halves?",
        "The current worker thread would otherwise sit idle while waiting. Computing one half itself halves the number of forked tasks and keeps the worker busy.",
      ],
      [
        "Is ReentrantLock faster than synchronized?",
        "Not in general. Modern JVMs optimise synchronized heavily (biased locking is gone, but lightweight locking remains). Pick ReentrantLock for its features, not for speed.",
      ],
    ],
    ex: [
      "Use a Phaser as a one-shot start gate: five workers must wait until main says \"go\", then all start together. Which methods do the workers and main call?",
      "Create `new Phaser(1)` (main registered). Each worker calls `phaser.register()` before starting and `phaser.arriveAndAwaitAdvance()` as its first step. When main is ready, it calls `phaser.arriveAndDeregister()`, which completes phase 0 and releases every worker at once.",
    ],
  }),
];
