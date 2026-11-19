import { lesson } from "../../schema.js";

export default [
  lesson("Concurrency Q1-Q8: Executor Framework, Semaphore (and Writing One), Atomics, Future and Callable", {
    intro:
      "The `java.util.concurrent` round starts here:\n\n- the Executor framework, and execute vs submit\n- Semaphore, producer-consumer with semaphores, and writing your own semaphore\n- the atomic classes\n- Future and Callable, and Callable vs Runnable\n\nThe program contains a hand-written semaphore built on wait and notify, tested under contention.",
    topics: [
      [
        "Q1. What is the Executor framework?",
        "A set of interfaces and classes (Java 5) that **decouple task submission from execution policy**. You hand over tasks (Runnable or Callable), and the executor decides which thread runs them, when, and how many run at once. Its parts:\n\n- `Executor` (`execute`)\n- `ExecutorService` (`submit`, `invokeAll`, `invokeAny`, `shutdown`, `shutdownNow`, `awaitTermination`, and `close` since Java 19)\n- `ScheduledExecutorService` (`schedule`, `scheduleAtFixedRate`, `scheduleWithFixedDelay`)\n- the implementations `ThreadPoolExecutor`, `ScheduledThreadPoolExecutor` and `ForkJoinPool`\n- the `Executors` factories, including `newVirtualThreadPerTaskExecutor()` (Java 21)\n\nThe benefits are thread reuse, bounded concurrency, queuing, lifecycle management, and results through Futures.",
      ],
      [
        "Q2. What is the difference between execute() and submit()?",
        "- **Declared in**: `execute(Runnable)` comes from Executor, while `submit(Runnable | Callable)` comes from ExecutorService.\n- **Return value**: `execute` returns **void**, while `submit` returns a **Future** for the result or for completion.\n- **Exceptions**: with `execute`, an exception propagates to the worker's UncaughtExceptionHandler and is printed. With `submit`, the exception is **captured** in the Future and rethrown as ExecutionException only when `get()` is called; if nobody calls `get()`, it is silently lost.\n- **Callables**: `submit` accepts Callables (results and checked exceptions), while `execute` does not.\n\nChoose submit when you need the result or want to handle failure, and execute for fire-and-forget tasks where you want failures to be logged.",
      ],
      [
        "Q3. What is a Semaphore?",
        "A Semaphore maintains a set of **permits**. `acquire()` blocks until a permit is available and takes it, and `release()` returns one. It limits how many threads can access a resource at the same time, for example a pool of 5 connections or 10 concurrent downloads. The variants:\n\n- `tryAcquire()`, and `tryAcquire(timeout, unit)`\n- `acquire(n)` and `release(n)` for multiple permits\n- `acquireUninterruptibly()`\n- `availablePermits()` and `drainPermits()`\n- the fairness flag, `new Semaphore(n, true)`, which grants permits in FIFO order\n\nPermits are not owned: any thread may release, and releasing more than acquired increases the count. A semaphore with 1 permit acts as a mutex that another thread can unlock.",
      ],
      [
        "Q4. How do you implement producer-consumer with Semaphores?",
        "For a strict one-item hand-off, use two semaphores: `producerSem = new Semaphore(1)` and `consumerSem = new Semaphore(0)`. The producer runs `producerSem.acquire(); produce(); consumerSem.release();` and the consumer runs `consumerSem.acquire(); consume(); producerSem.release();`, so they alternate strictly. For a bounded buffer of N items, use `emptySlots = new Semaphore(N)`, `filledSlots = new Semaphore(0)` and a mutex (a third binary semaphore or a lock) around the buffer. The producer acquires emptySlots and the mutex, adds, then releases the mutex and filledSlots. The consumer does the mirror image.",
      ],
      [
        "Q5. How would you write your own Semaphore?",
        "Keep an `int permits` guarded by `synchronized`:\n\n- `acquire()`: `while (permits == 0) wait(); permits--;`\n- `release()`: `permits++; notify();`\n- `tryAcquire()`: `if (permits > 0) { permits--; return true; } return false;`\n- `availablePermits()` returns the count\n\nUse a `while` loop to survive spurious wake-ups. `notify()` is enough here, because every waiter waits for the same condition and one permit lets exactly one waiter proceed. For fairness or timeouts you would use a ReentrantLock with a Condition, or extend AbstractQueuedSynchronizer, as the JDK's Semaphore does.",
      ],
      [
        "Q6. What are atomic classes?",
        "Classes in `java.util.concurrent.atomic` that provide lock-free, thread-safe operations on single variables using hardware **compare-and-swap (CAS)**:\n\n- `AtomicInteger`, `AtomicLong`, `AtomicBoolean`, `AtomicReference<V>`\n- the array forms: `AtomicIntegerArray`, `AtomicLongArray`, `AtomicReferenceArray`\n- the field updaters: `AtomicIntegerFieldUpdater` and others\n- `AtomicStampedReference` and `AtomicMarkableReference`, against the ABA problem\n- the contention-friendly accumulators `LongAdder`, `DoubleAdder`, `LongAccumulator` and `DoubleAccumulator` (Java 8)\n\nThey have volatile read and write semantics plus atomic read-modify-write methods (`incrementAndGet`, `compareAndSet`, `updateAndGet`, `accumulateAndGet`). Since Java 9, VarHandle offers the same operations on ordinary fields.",
      ],
      [
        "Q7. What are Future and Callable?",
        "`Callable<V>` is a task with `V call() throws Exception`: it returns a result and can throw checked exceptions. `Future<V>` represents the pending result of an asynchronous computation. Its methods:\n\n- `get()`, which blocks until done, and `get(timeout, unit)`, which throws TimeoutException\n- `isDone()`\n- `cancel(mayInterruptIfRunning)` and `isCancelled()`\n- since Java 19, `resultNow()`, `exceptionNow()` and `state()` (RUNNING, SUCCESS, FAILED, CANCELLED)\n\nYou obtain a Future from `ExecutorService.submit` or `invokeAll`, or create one with `FutureTask`. Future cannot be composed without blocking, which is what `CompletableFuture` (Java 8) adds: `thenApply`, `thenCompose`, `thenCombine`, `exceptionally` and `allOf`.",
      ],
      [
        "Q8. What is the difference between Callable and Runnable?",
        "- **Package and age**: Runnable is in `java.lang` (JDK 1.0); Callable is in `java.util.concurrent` (Java 5).\n- **Method**: Runnable has `void run()`; Callable has `V call() throws Exception`.\n- **Result**: Runnable returns nothing; Callable returns a value.\n- **Checked exceptions**: Runnable cannot throw them; Callable can.\n- **Threads**: a Runnable can run directly in a Thread; a Callable needs an ExecutorService or a FutureTask wrapper.\n\nBoth are functional interfaces, so lambdas work. The compiler picks Callable for `submit(() -> 42)` and Runnable for `submit(() -> System.out.println())`. `Executors.callable(runnable, result)` adapts a Runnable into a Callable.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    // Q5: a counting semaphore built on intrinsic locks.
    static class MySemaphore {
        private int permits;
        MySemaphore(int permits) { this.permits = permits; }
        synchronized void acquire() throws InterruptedException {
            while (permits == 0) wait();          // loop: spurious wake-ups and races
            permits--;
        }
        synchronized boolean tryAcquire() {
            if (permits == 0) return false;
            permits--;
            return true;
        }
        synchronized void release() {
            permits++;
            notify();                             // one permit -> one waiter can proceed
        }
        synchronized int availablePermits() { return permits; }
    }

    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            // Q1 + Q2
            CountDownLatch ran = new CountDownLatch(1);
            pool.execute(() -> { System.out.println("Q2 execute(): fire and forget"); ran.countDown(); });
            ran.await();
            Future<Integer> answer = pool.submit(() -> 6 * 7);                  // Callable
            Future<?> failed = pool.submit(() -> { throw new IllegalStateException("captured"); });
            try { failed.get(); } catch (ExecutionException ignored) { }       // wait until it has finished
            System.out.println("Q2 submit() result " + answer.get() + ", failure kept in Future: "
                    + failed.exceptionNow().getMessage() + " (state " + failed.state() + ")");

            // Q3: at most 2 holders at any moment.
            Semaphore twoSlots = new Semaphore(2, true);
            AtomicInteger inside = new AtomicInteger(), peak = new AtomicInteger();
            List<Callable<Void>> users = new ArrayList<>();
            for (int i = 0; i < 6; i++) users.add(() -> {
                twoSlots.acquire();
                try { peak.accumulateAndGet(inside.incrementAndGet(), Math::max); Thread.sleep(30); inside.decrementAndGet(); }
                finally { twoSlots.release(); }
                return null;
            });
            pool.invokeAll(users);
            System.out.println("Q3 Semaphore(2) peak concurrent holders = " + peak.get() + ", permits back to " + twoSlots.availablePermits());

            // Q4: bounded buffer with empty/filled semaphores and a mutex.
            Deque<Integer> buffer = new ArrayDeque<>();
            Semaphore empty = new Semaphore(2), filled = new Semaphore(0), mutex = new Semaphore(1);
            List<Integer> received = new ArrayList<>();
            Future<?> producer = pool.submit(() -> { for (int i = 1; i <= 5; i++) {
                empty.acquire(); mutex.acquire(); buffer.add(i); mutex.release(); filled.release(); } return null; });
            Future<?> consumer = pool.submit(() -> { for (int i = 1; i <= 5; i++) {
                filled.acquire(); mutex.acquire(); received.add(buffer.remove()); mutex.release(); empty.release(); } return null; });
            producer.get(); consumer.get();
            System.out.println("Q4 semaphore producer-consumer received " + received);

            // Q5: our own semaphore guarding a counter.
            MySemaphore mine = new MySemaphore(1);
            int[] counter = {0};
            List<Callable<Void>> incs = new ArrayList<>();
            for (int t = 0; t < 4; t++) incs.add(() -> { for (int i = 0; i < 1000; i++) { mine.acquire(); try { counter[0]++; } finally { mine.release(); } } return null; });
            pool.invokeAll(incs);
            System.out.println("Q5 MySemaphore(1) as a mutex: counter = " + counter[0] + ", tryAcquire " + mine.tryAcquire() + " then " + mine.tryAcquire());

            // Q6
            AtomicInteger atomic = new AtomicInteger();
            List<Callable<Void>> adds = new ArrayList<>();
            for (int t = 0; t < 4; t++) adds.add(() -> { for (int i = 0; i < 2500; i++) atomic.incrementAndGet(); return null; });
            pool.invokeAll(adds);
            AtomicReference<String> ref = new AtomicReference<>("v1");
            boolean swapped = ref.compareAndSet("v1", "v2"), again = ref.compareAndSet("v1", "v3");
            System.out.println("Q6 AtomicInteger = " + atomic.get() + ", CAS v1->v2 " + swapped + ", stale CAS " + again + ", ref " + ref.get());

            // Q7 + Q8
            Callable<String> callable = () -> { Thread.sleep(50); return "callable result"; };
            Runnable runnable = () -> { };
            Future<String> f = pool.submit(callable);
            Future<?> r = pool.submit(runnable);
            try { f.get(1, TimeUnit.MILLISECONDS); } catch (TimeoutException e) { System.out.println("Q7 get(1 ms) -> TimeoutException while still running"); }
            System.out.println("Q7 get() -> " + f.get() + ", Runnable's Future.get() -> " + r.get());
            Callable<String> adapted = Executors.callable(runnable, "adapted value");
            System.out.println("Q8 Runnable adapted to Callable returns: " + pool.submit(adapted).get());
        }
    }
}`,
    walk:
      "Q2 shows that `execute` returns nothing, while `submit` returns a Future: 42 for the Callable, and a FAILED state holding the exception for the task that threw. `exceptionNow()` (Java 19) reads that exception without blocking. In Q3, six tasks pass through a fair two-permit Semaphore, the recorded peak is 2, and all permits are returned. Q4 moves five items through a two-slot buffer guarded by the empty, filled and mutex semaphores.\n\nIn Q5, four threads each increment a counter 1,000 times under the hand-written MySemaphore(1), and the total is exactly 4,000. Its `tryAcquire` succeeds once and then fails. Q6 shows an exact AtomicInteger total and a compare-and-set that fails when the expected value is stale. Q7 times out on a 1 ms `get`, then blocks for the real result. A Runnable's Future returns null. Q8 adapts a Runnable into a Callable with a fixed result.",
    anim: [
      "A semaphore with two permits",
      [
        ["t1", "thread 1", "acquire()"],
        ["t2", "thread 2", "acquire()"],
        ["t3", "thread 3", "acquire()"],
        ["sem", "Semaphore", "permits 2 -> 0"],
      ],
      [
        ["t1", "sem", "take 1", "Thread 1 takes a permit; one is left."],
        ["t2", "sem", "take 1", "Thread 2 takes the last permit; the count is now 0."],
        ["t3", "sem", "blocks", "Thread 3 finds no permit and waits in the semaphore's queue."],
        ["t1", "sem", "release()", "Thread 1 finishes and releases its permit."],
        ["sem", "t3", "wake", "The freed permit goes to thread 3, which proceeds; at most 2 are ever inside."],
      ],
    ],
    mistakes: [
      "Calling `release()` in a path that never acquired. The semaphore silently gains an extra permit.",
      "Forgetting `release()` in finally, so an exception permanently loses a permit.",
      "Using `submit` without ever checking the Future, which swallows exceptions.",
    ],
    qa: [
      [
        "What does `invokeAny` do?",
        "It runs a collection of Callables and returns the result of the first one that completes successfully, then cancels the rest. It throws ExecutionException if all of them fail.",
      ],
      [
        "Is a binary semaphore the same as a lock?",
        "Almost, but a semaphore has no owner and is not reentrant. The same thread acquiring twice deadlocks itself, and any thread may release it. A ReentrantLock is owned and reentrant.",
      ],
      [
        "Why is CompletableFuture preferred over Future?",
        "It can be completed manually, composed (thenApply, thenCompose, allOf), combined, and given callbacks and exception handling without blocking threads on `get()`.",
      ],
    ],
    ex: [
      "Add `acquire(int n)` and `release(int n)` to MySemaphore. Which notification method must `release(n)` use, and why?",
      "`acquire(n)`: `while (permits < n) wait(); permits -= n;`. `release(n)`: `permits += n; notifyAll();`. `notifyAll` is required, because waiters may need different numbers of permits, and a single `notify` could wake a thread that needs more permits than are available while another, which could proceed, stays asleep.",
    ],
  }),

  lesson("Concurrency Q9-Q18: CountDownLatch, CyclicBarrier, Writing Your Own, and Phaser Compared", {
    intro:
      "Questions 9 to 18 cover the synchronizers:\n\n- CountDownLatch, its real-world uses, and writing your own\n- CyclicBarrier, why it is cyclic, its real-world uses, and writing your own\n- CyclicBarrier vs CountDownLatch\n- how Phaser resembles and differs from CyclicBarrier\n\nThe program implements MyCountDownLatch and MyCyclicBarrier, then runs them next to the JDK versions.",
    topics: [
      [
        "Q9. What is CountDownLatch?",
        "A one-shot synchronizer initialised with a count. `countDown()` decrements the count without blocking. `await()` blocks until the count reaches **zero**, and `await(timeout, unit)` returns false on timeout. Once at zero, the latch stays open forever: every later `await` returns immediately, and further countDowns have no effect. `getCount()` reports the remaining count. It is built on AbstractQueuedSynchronizer in shared mode. Any thread may count down, and the threads that wait are often different from those that count.",
      ],
      [
        "Q10. What are real-world uses of CountDownLatch?",
        "- **Service start-up**: the application waits until N subsystems (database, cache, message broker) signal that they are ready.\n- **Starting gun**: N worker threads `await` a latch of 1 so that they all start at the same moment, which is useful for load tests and benchmarks.\n- **Fan-out and wait**: split a job into N parallel tasks and wait for all N to finish before aggregating.\n- **Tests**: wait for an asynchronous callback with a timeout, `assertTrue(latch.await(2, SECONDS))`.\n\nThe common pattern is waiting for a known number of events.",
      ],
      [
        "Q11. How would you write your own CountDownLatch?",
        "Keep a `count` and synchronize on the latch:\n\n- `countDown()`: `if (count > 0 && --count == 0) notifyAll();`\n- `await()`: `while (count > 0) wait();`\n- `getCount()`: return the count, synchronized for visibility\n\nUse `notifyAll`, because every waiter must be released when the count hits zero, and use a `while` loop for spurious wake-ups. For `await(timeout)`, compute a deadline, `wait(remaining)` in the loop, and return false when the time runs out.",
      ],
      [
        "Q12. What is CyclicBarrier?",
        "A synchronizer that makes a fixed number of **parties wait for each other**. Each party calls `await()`. The first N-1 callers block, and when the N-th arrives, the optional **barrier action** runs (in that last thread), then all N are released together. `await` returns the arrival index (N-1 for the first arrival, 0 for the last). If any party is interrupted or times out, or the barrier is reset, the barrier becomes **broken**: all waiting parties get BrokenBarrierException.",
      ],
      [
        "Q13. Why is it called cyclic?",
        "Because after the parties are released, the barrier **automatically resets** to its initial state and can be reused for the next round, or *generation*. Iterative algorithms rely on this: every thread finishes step k, waits at the barrier, then all start step k+1 with the same barrier object. CountDownLatch cannot be reused this way. `reset()` exists for forced resets, but it breaks any threads currently waiting.",
      ],
      [
        "Q14. What are real-world uses of CyclicBarrier?",
        "- **Parallel simulations and numeric iterations**: each worker computes its slice of a grid, and all must finish before the next time step. The barrier action merges the results or checks for convergence.\n- **Multiplayer games**: each round starts only when every player is ready.\n- **Batch pipelines**: N loaders each prepare a partition, then a merge step runs, and the next batch begins.\n- **Concurrency tests**: line up N threads to hit a critical section at the same instant.",
      ],
      [
        "Q15. How would you write your own CyclicBarrier?",
        "Keep `parties`, a `waiting` count and a `generation` counter, synchronized on the barrier. `await()` increments `waiting`. If it is the last party, it runs the barrier action, resets `waiting` to 0, increments the generation and calls `notifyAll()`. Otherwise it remembers the current generation and runs `while (generation == myGeneration) wait();`. The generation number is the key trick: it distinguishes \"released for my round\" from a spurious wake-up, and it lets the barrier be reused immediately. Breakage on interrupt can be added with a `broken` flag.",
      ],
      [
        "Q16. What is the difference between CyclicBarrier and CountDownLatch?",
        "- **Reusable**: a latch is single-use, while a barrier resets for the next generation.\n- **Who waits**: with a latch, waiters wait for **events**, and the counting threads do not block. With a barrier, every **party** calls `await` and waits for the others.\n- **What the count means**: for a latch, the number of countDown calls, which can come from any number of threads. For a barrier, the number of participating threads.\n- **Barrier action**: only CyclicBarrier has one.\n- **Failure model**: the barrier has a broken state; the latch has none.\n- **Typical uses**: a latch for \"wait until N things happen\", a barrier for \"N threads meet, then continue together, repeatedly\".",
      ],
      [
        "Q17. How is Phaser similar to CyclicBarrier?",
        "Both are **reusable barriers for multiple rounds**. Parties work through phase after phase, and each phase completes only when all registered parties arrive. `phaser.arriveAndAwaitAdvance()` behaves like `barrier.await()`. Both can run an action when a round completes: for Phaser you override `onAdvance(phase, registeredParties)`. Both advance a round number, the phase or the generation.",
      ],
      [
        "Q18. How does Phaser differ from CyclicBarrier?",
        "- **Dynamic party count**: `register()`, `bulkRegister(n)` and `arriveAndDeregister()` at any time, while CyclicBarrier's count is fixed.\n- **Non-blocking arrival**: `arrive()` signals and continues.\n- **Waiting for a specific phase**: `awaitAdvance(phase)`.\n- **Termination**: `onAdvance` returning true, or the party count reaching 0, ends the Phaser, and `isTerminated()` reports it.\n- **Interrupt behaviour**: `arriveAndAwaitAdvance` is not interruptible, while `awaitAdvanceInterruptibly` is.\n- **Hierarchy**: tiered Phasers (a parent and children) scale to large numbers of parties.\n- **No broken state**: an interrupted party does not break the others.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {

    // Q11: a minimal CountDownLatch.
    static class MyCountDownLatch {
        private int count;
        MyCountDownLatch(int count) { this.count = count; }
        synchronized void countDown() { if (count > 0 && --count == 0) notifyAll(); }
        synchronized void await() throws InterruptedException { while (count > 0) wait(); }
        synchronized int getCount() { return count; }
    }

    // Q15: a minimal reusable CyclicBarrier using a generation counter.
    static class MyCyclicBarrier {
        private final int parties; private final Runnable action;
        private int waiting; private long generation;
        MyCyclicBarrier(int parties, Runnable action) { this.parties = parties; this.action = action; }
        synchronized void await() throws InterruptedException {
            long myGeneration = generation;
            if (++waiting == parties) {             // last to arrive
                if (action != null) action.run();
                waiting = 0;
                generation++;                       // opens the barrier and resets it
                notifyAll();
                return;
            }
            while (myGeneration == generation) wait();
        }
    }

    public static void main(String[] args) throws Exception {
        // Q9 + Q10 + Q11: both latches gate main until three workers report.
        for (String kind : List.of("JDK", "My")) {
            CountDownLatch jdk = new CountDownLatch(3);
            MyCountDownLatch mine = new MyCountDownLatch(3);
            for (int i = 0; i < 3; i++) new Thread(() -> { if (kind.equals("JDK")) jdk.countDown(); else mine.countDown(); }).start();
            if (kind.equals("JDK")) jdk.await(); else mine.await();
            System.out.println("Q9/Q11 " + kind + " latch opened, count now " + (kind.equals("JDK") ? jdk.getCount() : mine.getCount()));
        }

        // Q10: a starting gun - all workers begin together.
        CountDownLatch gun = new CountDownLatch(1);
        CountDownLatch finished = new CountDownLatch(3);
        List<String> starts = Collections.synchronizedList(new ArrayList<>());
        for (int i = 1; i <= 3; i++) {
            int id = i;
            new Thread(() -> { try { gun.await(); starts.add("runner" + id); } catch (InterruptedException ignored) { } finished.countDown(); }).start();
        }
        gun.countDown();                             // fire
        finished.await();
        System.out.println("Q10 starting gun released " + starts.size() + " runners at once");

        // Q12 + Q13 + Q15: three rounds through each barrier.
        for (String kind : List.of("JDK", "My")) {
            List<String> rounds = Collections.synchronizedList(new ArrayList<>());
            int[] round = {0};
            Runnable action = () -> rounds.add("round " + (++round[0]) + " complete");
            CyclicBarrier jdkBarrier = new CyclicBarrier(3, action);
            MyCyclicBarrier myBarrier = new MyCyclicBarrier(3, action);
            Thread[] parties = new Thread[3];
            for (int p = 0; p < 3; p++) {
                parties[p] = new Thread(() -> {
                    try {
                        for (int r = 0; r < 3; r++) { if (kind.equals("JDK")) jdkBarrier.await(); else myBarrier.await(); }
                    } catch (Exception e) { throw new RuntimeException(e); }
                });
                parties[p].start();
            }
            for (Thread t : parties) t.join();
            System.out.println("Q13/Q15 " + kind + " barrier reused: " + rounds);
        }

        // Q16: a latch ignores extra countDowns and cannot be reused.
        CountDownLatch once = new CountDownLatch(1);
        once.countDown(); once.countDown();
        System.out.println("Q16 latch after two countDowns: " + once.getCount() + " (never negative, never resets)");

        // Q17 + Q18: Phaser with a party that joins late and one that leaves early.
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        Phaser phaser = new Phaser(2) {
            @Override protected boolean onAdvance(int phase, int registered) {
                log.add("phase " + phase + " parties " + registered);
                return phase == 2;                   // terminate after phase 2
            }
        };
        Thread leaver = new Thread(() -> { phaser.arriveAndAwaitAdvance(); phaser.arriveAndDeregister(); });
        leaver.start();
        phaser.arriveAndAwaitAdvance();              // phase 0 with 2 parties
        phaser.register();                           // a late joiner for phase 1
        Thread joiner = new Thread(() -> { phaser.arriveAndAwaitAdvance(); phaser.arriveAndAwaitAdvance(); });
        joiner.start();
        phaser.arriveAndAwaitAdvance();              // phase 1: main + joiner + leaver(deregistering)
        phaser.arriveAndAwaitAdvance();              // phase 2: main + joiner
        leaver.join(); joiner.join();
        System.out.println("Q18 " + log + ", terminated " + phaser.isTerminated());
    }
}`,
    walk:
      "Q9 and Q11 run the same scenario twice, once with the JDK's CountDownLatch and once with MyCountDownLatch: main waits for three workers, then sees the count at 0. Q10 releases three runners at once with a one-count latch. For Q12, Q13 and Q15, three parties go through three rounds of each barrier. The barrier action records \"round 1/2/3 complete\" each time. The hand-written barrier gets reuse right thanks to its generation counter: a waiter leaves only when the generation it saw has changed.\n\nQ16 shows that a latch's count stops at 0. The Phaser in Q18 starts with two parties (main and the leaver), completes phase 0, and then registers a joiner. Phase 1 counts main, the joiner and the leaver's deregistering arrival, and `onAdvance` reports 2 parties, because the leaver has left. Phase 2 completes with main and the joiner, and `onAdvance` returns true, which terminates the Phaser.",
    anim: [
      "Why MyCyclicBarrier needs a generation number",
      [
        ["p1", "party 1", "waits gen 0"],
        ["p2", "party 2", "waits gen 0"],
        ["p3", "party 3", "last arrival"],
        ["bar", "barrier", "waiting, gen"],
      ],
      [
        ["p1", "bar", "await()", "Party 1 records generation 0 and waits; waiting = 1."],
        ["p2", "bar", "await()", "Party 2 also records generation 0 and waits; waiting = 2."],
        ["p3", "bar", "trip", "Party 3 makes waiting = 3: it runs the action, sets waiting = 0, gen = 1."],
        ["bar", "p1", "notifyAll", "Waiters wake, see gen 1 differs from their recorded 0, and leave."],
        ["p1", "bar", "next round", "If party 1 calls await again at once, it waits on gen 1, so rounds never mix."],
      ],
    ],
    mistakes: [
      "Expecting `CountDownLatch.countDown()` to block. Only `await` blocks.",
      "Writing a reusable barrier without a generation counter. A fast thread entering the next round can be released by the previous round's wake-up.",
      "Using CyclicBarrier when the number of participants changes. Use Phaser.",
    ],
    qa: [
      [
        "What does `CyclicBarrier.await()` return?",
        "The arrival index: `getParties() - 1` for the first thread to arrive, down to 0 for the last. It can be used to elect one thread to do extra work.",
      ],
      [
        "Can a CountDownLatch count down from a thread that also awaits it?",
        "Yes, as long as it counts down before awaiting. Awaiting first would block that thread forever if it is needed for the count to reach zero.",
      ],
      [
        "What is the phase number after termination?",
        "Negative. `getPhase()` returns a negative value once the Phaser terminates, and `arriveAndAwaitAdvance` then returns immediately.",
      ],
    ],
    ex: [
      "Add `await(long millis)` returning boolean to MyCountDownLatch.",
      "`synchronized boolean await(long millis) throws InterruptedException { long deadline = System.currentTimeMillis() + millis; while (count > 0) { long left = deadline - System.currentTimeMillis(); if (left <= 0) return false; wait(left); } return true; }`",
    ],
  }),

  lesson("Concurrency Q19-Q27: Phaser in Depth, Exchanger and BlockingQueue Producer-Consumer", {
    intro:
      "Questions 19 to 27 dig into Phaser:\n\n- arrive vs arriveAndAwaitAdvance\n- when a Phaser terminates\n- controlling the number of phases\n- real-world uses\n- the maximum number of parties\n\nThey then turn to data hand-off: Exchanger, producer-consumer with Exchanger, producer-consumer with BlockingQueue, and writing your own LinkedBlockingQueue. The program contains a complete, commented MyLinkedBlockingQueue.",
    topics: [
      [
        "Q19. What is the difference between arrive() and arriveAndAwaitAdvance()?",
        "`arrive()` records that this party has reached the end of the current phase and **returns immediately** with the phase number, without waiting for the others. It is useful for a party that has nothing to do until the next phase, or for a coordinator that only signals. `arriveAndAwaitAdvance()` records arrival and **blocks** until all registered parties have arrived and the phase advances, like `CyclicBarrier.await()`. There is also `arriveAndDeregister()` (arrive and leave), `awaitAdvance(phase)` (wait without arriving), and `awaitAdvanceInterruptibly`.",
      ],
      [
        "Q20. When is a Phaser terminated?",
        "In two cases. The first is when **`onAdvance(phase, registeredParties)` returns true**. By default it returns true when the number of registered parties has dropped to 0, so the Phaser terminates once every party has deregistered. You can override it to stop after a given number of phases. The second is calling **`forceTermination()`**. After termination, `isTerminated()` is true, the phase number is negative, waiting methods return immediately, and registration has no effect.",
      ],
      [
        "Q21. How can you control the number of phases?",
        "Override `onAdvance` and return `true` when the desired phase is reached, for example `return phase >= maxPhase - 1 || registeredParties == 0;`. The parties loop `while (!phaser.isTerminated()) { work(); phaser.arriveAndAwaitAdvance(); }`, so they stop automatically when the Phaser terminates. You can also deregister parties early, or call `forceTermination()` on a condition, such as convergence or an error.",
      ],
      [
        "Q22. What are real-world uses of Phaser?",
        "- **Multi-stage pipelines** where the number of workers changes: a crawler adds a worker per discovered site (register) and removes it when done (deregister), while stages advance together.\n- **Iterative algorithms** with early exit: stop after convergence in `onAdvance`.\n- **Coordinating test threads** across several checkpoints.\n- **A reusable latch**: one coordinator awaits, while workers `arrive()`.\n- **Tiered Phasers** for thousands of tasks, to reduce contention.",
      ],
      [
        "Q23. What is the maximum number of parties a Phaser supports?",
        "**65,535** registered parties per Phaser, because the party counts are packed into 16 bits of its internal state word. Exceeding it throws IllegalStateException. For more participants, use **tiered Phasers**: create child Phasers with `new Phaser(parent, n)`. Each child counts as one party in its parent, so the tree can grow to any size, with less contention per node.",
      ],
      [
        "Q24. What is an Exchanger?",
        "An Exchanger is a synchronization point where **two threads swap objects**. Each calls `exchanger.exchange(myObject)`. The first one blocks until a partner arrives, and then each receives the other's object. `exchange(x, timeout, unit)` throws TimeoutException if no partner comes. It suits pipelines in which one thread fills a buffer while another drains a buffer, and they swap when both are done, so buffers are reused without allocation. It is meant for exactly two threads per exchange.",
      ],
      [
        "Q25. How do you implement producer-consumer with an Exchanger?",
        "Create two buffers. The producer fills buffer A and then calls `A = exchanger.exchange(A)`, receiving the consumer's emptied buffer. The consumer starts with empty buffer B, calls `B = exchanger.exchange(B)` to get the full buffer, drains it, and exchanges again. Only two buffers ever exist, and each side always has one to work on. The swap is the only synchronization needed, because ownership of each buffer passes cleanly between the threads.",
      ],
      [
        "Q26. How do you implement producer-consumer with a BlockingQueue?",
        "Share one `BlockingQueue<T>`. The producer loops `queue.put(item)`, which blocks if the queue is full. The consumer loops `item = queue.take()`, which blocks if it is empty. End the stream with a poison pill, or interrupt the consumer. Choose `ArrayBlockingQueue` (bounded and array-based, with a single lock), `LinkedBlockingQueue` (optionally bounded, with separate put and take locks for higher throughput), `PriorityBlockingQueue`, `DelayQueue`, or `SynchronousQueue` (direct hand-off with no capacity). It is the simplest and most robust producer-consumer solution in Java.",
      ],
      [
        "Q27. How would you write your own LinkedBlockingQueue?",
        "Use a singly linked list with `head` and `tail`, a `capacity`, a `count`, and a ReentrantLock with two Conditions, `notFull` and `notEmpty`.\n\n- `put(e)`: lock; `while (count == capacity) notFull.await();` link a node at the tail; `count++`; `notEmpty.signal()`; unlock in finally.\n- `take()`: lock; `while (count == 0) notEmpty.await();` unlink the head; `count--`; `notFull.signal()`; unlock.\n\nThe JDK's version goes further with **two locks** (putLock and takeLock) and an AtomicInteger count, so producers and consumers do not contend with each other.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {

    // Q27: a bounded blocking queue on a linked list with one lock and two conditions.
    static class MyLinkedBlockingQueue<E> {
        private static class Node<E> { E item; Node<E> next; Node(E item) { this.item = item; } }
        private Node<E> head = new Node<>(null), tail = head;     // dummy head node
        private final int capacity; private int count;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition(), notEmpty = lock.newCondition();
        MyLinkedBlockingQueue(int capacity) { this.capacity = capacity; }

        void put(E e) throws InterruptedException {
            lock.lockInterruptibly();
            try {
                while (count == capacity) notFull.await();             // wait for space
                tail = tail.next = new Node<>(e);                       // link at the tail
                count++;
                notEmpty.signal();                                      // a consumer can proceed
            } finally { lock.unlock(); }
        }
        E take() throws InterruptedException {
            lock.lockInterruptibly();
            try {
                while (count == 0) notEmpty.await();                    // wait for data
                Node<E> first = head.next;
                head = first;                                           // first becomes the new dummy
                E item = first.item; first.item = null;
                count--;
                notFull.signal();                                       // a producer can proceed
                return item;
            } finally { lock.unlock(); }
        }
    }

    public static void main(String[] args) throws Exception {
        // Q19: arrive() does not wait; arriveAndAwaitAdvance() does.
        Phaser p = new Phaser(2);
        int phaseSeen = p.arrive();                                     // main signals and continues
        System.out.println("Q19 arrive() returned at once for phase " + phaseSeen + ", phase still " + p.getPhase());
        Thread other = new Thread(p::arriveAndAwaitAdvance);
        other.start(); other.join();
        System.out.println("Q19 after the second party arrived, phase = " + p.getPhase());

        // Q20 + Q21: stop after exactly 3 phases.
        List<Integer> phases = Collections.synchronizedList(new ArrayList<>());
        Phaser limited = new Phaser(3) {
            @Override protected boolean onAdvance(int phase, int parties) { phases.add(phase); return phase >= 2; }
        };
        Thread[] workers = new Thread[3];
        for (int i = 0; i < 3; i++) { workers[i] = new Thread(() -> { while (!limited.isTerminated()) limited.arriveAndAwaitAdvance(); }); workers[i].start(); }
        for (Thread w : workers) w.join();
        System.out.println("Q21 phases completed " + phases + ", terminated " + limited.isTerminated() + ", phase number " + limited.getPhase());
        Phaser empty = new Phaser(1);
        empty.arriveAndDeregister();
        System.out.println("Q20 Phaser terminates when all parties deregister: " + empty.isTerminated());

        // Q23: party limit and tiering.
        try { new Phaser(70_000); } catch (IllegalArgumentException e) { System.out.println("Q23 70000 parties rejected: max is 65535 per Phaser"); }
        Phaser root = new Phaser();
        Phaser child1 = new Phaser(root, 3), child2 = new Phaser(root, 3);
        System.out.println("Q23 tiered: root sees " + root.getRegisteredParties() + " child phasers representing " + (child1.getRegisteredParties() + child2.getRegisteredParties()) + " parties");

        // Q24 + Q25: swap a full buffer for an empty one.
        Exchanger<List<Integer>> exchanger = new Exchanger<>();
        List<Integer> drained = new ArrayList<>();
        Thread producer = new Thread(() -> {
            List<Integer> buffer = new ArrayList<>();
            try {
                for (int batch = 0; batch < 2; batch++) {
                    for (int i = 1; i <= 3; i++) buffer.add(batch * 10 + i);
                    buffer = exchanger.exchange(buffer);                  // give full, receive empty
                }
            } catch (InterruptedException ignored) { }
        });
        Thread consumer = new Thread(() -> {
            List<Integer> buffer = new ArrayList<>();
            try {
                for (int batch = 0; batch < 2; batch++) {
                    buffer = exchanger.exchange(buffer);                  // give empty, receive full
                    drained.addAll(buffer);
                    buffer.clear();
                }
            } catch (InterruptedException ignored) { }
        });
        producer.start(); consumer.start(); producer.join(); consumer.join();
        System.out.println("Q25 Exchanger producer-consumer drained " + drained);

        // Q26 + Q27: JDK queue and our own queue, same scenario.
        for (String kind : List.of("LinkedBlockingQueue", "MyLinkedBlockingQueue")) {
            LinkedBlockingQueue<Integer> jdk = new LinkedBlockingQueue<>(2);
            MyLinkedBlockingQueue<Integer> mine = new MyLinkedBlockingQueue<>(2);
            boolean useJdk = kind.equals("LinkedBlockingQueue");
            List<Integer> got = new ArrayList<>();
            Thread prod = new Thread(() -> { try { for (int i = 1; i <= 6; i++) { if (useJdk) jdk.put(i); else mine.put(i); } } catch (InterruptedException ignored) { } });
            Thread cons = new Thread(() -> { try { for (int i = 1; i <= 6; i++) got.add(useJdk ? jdk.take() : mine.take()); } catch (InterruptedException ignored) { } });
            prod.start(); cons.start(); prod.join(); cons.join();
            System.out.println("Q26/Q27 " + kind + " (capacity 2) delivered " + got);
        }
    }
}`,
    walk:
      "In Q19, main calls `arrive()` on a two-party Phaser and returns immediately, with the phase still at 0. When the second party calls `arriveAndAwaitAdvance()`, the phase becomes 1. For Q21, three workers loop until the Phaser terminates, and `onAdvance` returns true after phase 2, so exactly phases 0, 1 and 2 complete and the phase number becomes negative. Q20 shows that a Phaser whose only party deregisters terminates. Q23 shows the 65,535-party limit, and a root Phaser that sees each child Phaser as one party.\n\nIn Q25, the producer fills a list with three numbers and exchanges it for the consumer's empty list, twice, and the consumer drains 1, 2, 3, 11, 12, 13. The same two list objects swap back and forth. Q26 and Q27 run identical producer-consumer code through the JDK's LinkedBlockingQueue and the hand-written MyLinkedBlockingQueue, both with capacity 2. Each delivers 1 to 6 in order, and the producer blocks whenever two items are waiting.",
    anim: [
      "Exchanger swapping buffers",
      [
        ["prod", "producer", "fills buffer A"],
        ["ex", "Exchanger", "meeting point"],
        ["cons", "consumer", "drains buffer B"],
        ["bufs", "two buffers", "A and B"],
      ],
      [
        ["prod", "ex", "exchange(A)", "The producer fills buffer A and offers it; it waits for a partner."],
        ["cons", "ex", "exchange(B)", "The consumer arrives with empty buffer B; the swap happens."],
        ["ex", "cons", "receives A", "The consumer now owns full buffer A and drains it."],
        ["ex", "prod", "receives B", "The producer now owns empty buffer B and refills it."],
        ["bufs", "ex", "repeat", "Only two buffers ever exist; ownership simply alternates between threads."],
      ],
    ],
    mistakes: [
      "Using Exchanger with more than two threads per exchange. Pairing becomes unpredictable.",
      "Signalling the wrong Condition in a hand-written queue, for example `notFull.signal()` after a put.",
      "Expecting `arriveAndAwaitAdvance` to be interruptible. Use `awaitAdvanceInterruptibly(phaser.arrive())`.",
    ],
    qa: [
      [
        "What is SynchronousQueue?",
        "A BlockingQueue with zero capacity. Each `put` waits for a matching `take`, so it is a direct hand-off. It is used by `Executors.newCachedThreadPool`.",
      ],
      [
        "Why does the JDK's LinkedBlockingQueue use two locks?",
        "Puts touch only the tail and takes touch only the head, so separate locks let a producer and a consumer work at the same time. An AtomicInteger count coordinates the full and empty checks between them.",
      ],
      [
        "What does `Phaser.bulkRegister(n)` do?",
        "It registers n new parties at once and returns the current phase number. It is useful when spawning a batch of workers.",
      ],
    ],
    ex: [
      "Add `offer(E e, long timeout, TimeUnit unit)` to MyLinkedBlockingQueue.",
      "Inside the lock: `long nanos = unit.toNanos(timeout); while (count == capacity) { if (nanos <= 0) return false; nanos = notFull.awaitNanos(nanos); }`, then link the node, increment the count, `notEmpty.signal()` and return true. `awaitNanos` returns the remaining time, so the loop handles spurious wake-ups correctly.",
    ],
  }),
];
