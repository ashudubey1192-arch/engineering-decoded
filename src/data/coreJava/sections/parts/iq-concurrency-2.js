import { lesson } from "../../schema.js";

export default [
  lesson("Concurrency Q28-Q33 and Q40: The Lock Interface, Conditions, ReentrantLock and Writing Your Own", {
    intro:
      "Questions 28 to 33, together with question 40, are about explicit locks:\n\n- the Lock interface and its methods\n- producer-consumer with `newCondition()`\n- the ReentrantLock methods, and a ReentrantLock program\n- writing your own reentrant lock\n- synchronized vs ReentrantLock\n\nThe program implements MyReentrantLock with an owner and a hold count, and compares it with the JDK lock.",
    topics: [
      [
        "Q28. What is the Lock interface?",
        "`java.util.concurrent.locks.Lock` (Java 5) is an explicit, more flexible alternative to `synchronized` blocks. A thread acquires the lock with `lock()` and **must** release it with `unlock()`, normally in a `finally` block. The lock offers non-blocking and timed acquisition, interruptible waiting, and multiple condition variables. Its implementations are `ReentrantLock`, `ReentrantReadWriteLock.ReadLock` and `WriteLock`. `StampedLock` offers a lock view through `asReadLock()` and `asWriteLock()`. Memory semantics match synchronized: a successful lock has the visibility effects of entering a monitor, and unlock those of exiting it.",
      ],
      [
        "Q29. What methods does Lock have?",
        "- `void lock()`: acquire, waiting as long as necessary (not interruptible).\n- `void lockInterruptibly() throws InterruptedException`: acquire unless the thread is interrupted while waiting.\n- `boolean tryLock()`: acquire only if free right now, without waiting.\n- `boolean tryLock(long time, TimeUnit unit)`: wait up to the timeout, interruptibly.\n- `void unlock()`: release. Calling it from a thread that does not hold the lock throws IllegalMonitorStateException.\n- `Condition newCondition()`: create a wait set bound to this lock, with `await`, `awaitNanos`, `awaitUntil`, `signal` and `signalAll`.",
      ],
      [
        "Q30. How do you implement producer-consumer with Lock and newCondition()?",
        "Create one `ReentrantLock` and two Conditions, `notFull` and `notEmpty`.\n\n- Producer: `lock.lock(); try { while (queue.size() == capacity) notFull.await(); queue.add(x); notEmpty.signal(); } finally { lock.unlock(); }`.\n- Consumer: `while (queue.isEmpty()) notEmpty.await(); x = queue.remove(); notFull.signal();`.\n\nThe advantage over wait/notify is **separate wait sets**: a producer signals only consumers, and a consumer signals only producers, so `signal()` (one thread) is safe and efficient. With intrinsic locks, everyone shares one wait set, so notifyAll is needed.",
      ],
      [
        "Q31. What methods does ReentrantLock add?",
        "On top of Lock, ReentrantLock provides:\n\n- `isLocked()` and `isHeldByCurrentThread()`\n- `getHoldCount()`, the reentrant depth for the current thread\n- `isFair()`\n- `hasQueuedThreads()`, `hasQueuedThread(t)` and `getQueueLength()`\n- `hasWaiters(condition)` and `getWaitQueueLength(condition)`\n- protected `getOwner()`, `getQueuedThreads()` and `getWaitingThreads(c)` for subclasses and monitoring tools\n\nThe constructor `ReentrantLock(boolean fair)` chooses fair (FIFO-ish) or non-fair acquisition. Non-fair is the default and allows barging, which gives better throughput.",
      ],
      [
        "Q32. What does a typical ReentrantLock program look like?",
        "The canonical idiom is `lock.lock(); try { /* critical section */ } finally { lock.unlock(); }`. Never put `lock()` inside the try: if `lock()` itself throws, the finally would try to unlock a lock that is not held. Reentrancy means a method holding the lock can call another method that locks it again, and the hold count goes from 1 to 2 and back. The program uses a bank account with deposit, withdraw and transfer, tryLock with a timeout, and the query methods.",
      ],
      [
        "Q33. How would you write your own reentrant lock?",
        "Track `owner` (a Thread) and `holdCount`, synchronized on the lock object:\n\n- `lock()`: `while (owner != null && owner != current) wait(); owner = current; holdCount++;`\n- `unlock()`: if `owner != current`, throw IllegalMonitorStateException; otherwise `if (--holdCount == 0) { owner = null; notify(); }`\n- `tryLock()`: acquire only if free or already owned\n\nThe JDK version is built on **AbstractQueuedSynchronizer**, which uses a CAS on an int state for the hold count, a CLH-style queue of parked threads, and `LockSupport.park` and `unpark` instead of monitors.",
      ],
      [
        "Q40. What is the difference between synchronized and ReentrantLock?",
        "- **Acquire and release**: synchronized is implicit and block-structured, released automatically even on exceptions. ReentrantLock needs explicit `unlock()` in finally, and can be released in a different method.\n- **Waiting**: synchronized cannot time out and cannot be interrupted. ReentrantLock has `tryLock`, `tryLock(timeout)` and `lockInterruptibly`.\n- **Fairness**: synchronized is always non-fair. ReentrantLock has an optional fair mode.\n- **Conditions**: synchronized has one wait set (wait/notify). ReentrantLock can have many Conditions.\n- **Introspection**: only ReentrantLock has hold count and queue queries.\n- **Readability and safety**: synchronized is simpler and cannot leak a lock.\n- **Virtual threads**: before Java 24, blocking inside synchronized pinned the carrier thread; JEP 491 fixed this.\n\nUse synchronized by default, and ReentrantLock when you need its features.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {

    // Q33: a reentrant lock with an owner and a hold count.
    static class MyReentrantLock {
        private Thread owner;
        private int holdCount;
        synchronized void lock() throws InterruptedException {
            Thread me = Thread.currentThread();
            while (owner != null && owner != me) wait();        // someone else holds it
            owner = me;
            holdCount++;                                         // reentry just counts
        }
        synchronized boolean tryLock() {
            Thread me = Thread.currentThread();
            if (owner != null && owner != me) return false;
            owner = me; holdCount++;
            return true;
        }
        synchronized void unlock() {
            if (owner != Thread.currentThread()) throw new IllegalMonitorStateException("not the owner");
            if (--holdCount == 0) { owner = null; notify(); }    // fully released
        }
        synchronized int getHoldCount() { return owner == Thread.currentThread() ? holdCount : 0; }
    }

    // Q30: bounded buffer with two conditions.
    static class ConditionBuffer {
        private final Deque<Integer> items = new ArrayDeque<>();
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition(), notEmpty = lock.newCondition();
        void put(int v) throws InterruptedException {
            lock.lock();
            try { while (items.size() == 2) notFull.await(); items.add(v); notEmpty.signal(); }
            finally { lock.unlock(); }
        }
        int take() throws InterruptedException {
            lock.lock();
            try { while (items.isEmpty()) notEmpty.await(); int v = items.remove(); notFull.signal(); return v; }
            finally { lock.unlock(); }
        }
    }

    // Q32: an account protected by a ReentrantLock.
    static class Account {
        private final ReentrantLock lock = new ReentrantLock();
        private int balance = 100;
        void deposit(int amount) { lock.lock(); try { balance += amount; } finally { lock.unlock(); } }
        boolean withdraw(int amount) {
            lock.lock();
            try {
                if (balance < amount) return false;
                balance -= amount;
                return true;
            } finally { lock.unlock(); }
        }
        int depthDuringNestedCall() {
            lock.lock();
            try { return nested(); } finally { lock.unlock(); }
        }
        private int nested() { lock.lock(); try { return lock.getHoldCount(); } finally { lock.unlock(); } }
    }

    public static void main(String[] args) throws Exception {
        // Q28 + Q29: tryLock variants while another thread holds the lock.
        ReentrantLock lock = new ReentrantLock();
        CountDownLatch held = new CountDownLatch(1), release = new CountDownLatch(1);
        Thread holder = new Thread(() -> { lock.lock(); try { held.countDown(); release.await(); } catch (InterruptedException ignored) { } finally { lock.unlock(); } });
        holder.start(); held.await();
        boolean immediate = lock.tryLock();
        boolean timed = lock.tryLock(50, TimeUnit.MILLISECONDS);
        Thread interruptible = new Thread(() -> {
            try { lock.lockInterruptibly(); lock.unlock(); }
            catch (InterruptedException e) { System.out.println("Q29 lockInterruptibly() gave up after interrupt"); }
        });
        interruptible.start();
        while (!lock.hasQueuedThread(interruptible)) Thread.onSpinWait();
        System.out.println("Q31 queued threads waiting: " + lock.getQueueLength() + ", isLocked " + lock.isLocked() + ", held by me " + lock.isHeldByCurrentThread());
        interruptible.interrupt(); interruptible.join();
        System.out.println("Q29 tryLock() " + immediate + ", tryLock(50 ms) " + timed);
        release.countDown(); holder.join();
        try { lock.unlock(); } catch (IllegalMonitorStateException e) { System.out.println("Q29 unlock() by a non-owner -> IllegalMonitorStateException"); }

        // Q30
        ConditionBuffer buffer = new ConditionBuffer();
        List<Integer> got = new ArrayList<>();
        Thread producer = new Thread(() -> { try { for (int i = 1; i <= 5; i++) buffer.put(i); } catch (InterruptedException ignored) { } });
        Thread consumer = new Thread(() -> { try { for (int i = 1; i <= 5; i++) got.add(buffer.take()); } catch (InterruptedException ignored) { } });
        producer.start(); consumer.start(); producer.join(); consumer.join();
        System.out.println("Q30 Condition-based producer-consumer received " + got);

        // Q32: concurrent deposits and withdrawals keep the balance exact.
        Account account = new Account();
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int i = 0; i < 100; i++) { pool.submit(() -> account.deposit(10)); pool.submit(() -> account.withdraw(10)); }
        }
        System.out.println("Q32 balance after 100 deposits and 100 withdrawals of 10: " + account.balance
                + ", hold count inside nested call " + account.depthDuringNestedCall());

        // Q33: our own lock - reentrant, exclusive, owner-checked.
        MyReentrantLock mine = new MyReentrantLock();
        mine.lock(); mine.lock();
        int depth = mine.getHoldCount();
        boolean otherTry[] = new boolean[1];
        Thread intruder = new Thread(() -> otherTry[0] = mine.tryLock());
        intruder.start(); intruder.join();
        Thread badUnlock = new Thread(() -> { try { mine.unlock(); } catch (IllegalMonitorStateException e) { System.out.println("Q33 unlock from another thread -> " + e.getMessage()); } });
        badUnlock.start(); badUnlock.join();
        mine.unlock(); mine.unlock();
        int[] shared = {0};
        Thread[] workers = new Thread[4];
        for (int t = 0; t < 4; t++) {
            workers[t] = new Thread(() -> { for (int i = 0; i < 1000; i++) { try { mine.lock(); try { shared[0]++; } finally { mine.unlock(); } } catch (InterruptedException ignored) { } } });
            workers[t].start();
        }
        for (Thread w : workers) w.join();
        System.out.println("Q33 MyReentrantLock: hold count " + depth + ", other thread tryLock " + otherTry[0] + ", 4x1000 guarded increments = " + shared[0]);

        // Q40: fairness is only available with ReentrantLock.
        System.out.println("Q40 new ReentrantLock(true).isFair() = " + new ReentrantLock(true).isFair() + "; synchronized is always non-fair");
    }
}`,
    walk:
      "In Q29, a holder thread keeps the JDK lock while main tries to take it. `tryLock()` fails immediately, and `tryLock(50 ms)` fails after the timeout. A third thread waits in `lockInterruptibly()`, and the query methods report one queued thread (Q31). When it is interrupted, it gives up instead of waiting forever. Calling `unlock()` from main, which never acquired the lock, throws IllegalMonitorStateException.\n\nQ30 passes 1 to 5 through a two-slot buffer using the `notFull` and `notEmpty` Conditions. In Q32, 100 deposits and 100 withdrawals run concurrently on a ReentrantLock-guarded account. The balance stays exact, and a nested call shows a hold count of 2. Q33 exercises MyReentrantLock: main locks twice (hold count 2), another thread's `tryLock` fails, an unlock from a non-owner is rejected, and four threads then perform 4,000 guarded increments with an exact result.",
    anim: [
      "Reentrant lock: owner and hold count",
      [
        ["t1", "thread 1", "owner"],
        ["lk", "lock state", "owner, count"],
        ["t2", "thread 2", "contender"],
        ["q", "wait queue", "parked threads"],
      ],
      [
        ["t1", "lk", "lock()", "The lock is free: thread 1 becomes the owner with hold count 1."],
        ["t1", "lk", "lock() again", "The owner re-enters: no blocking, the hold count becomes 2."],
        ["t2", "q", "lock() blocks", "Thread 2 finds another owner and waits (tryLock would just return false)."],
        ["t1", "lk", "unlock() x2", "Each unlock decrements; at 0 the owner is cleared and a waiter is woken."],
        ["q", "t2", "acquire", "Thread 2 wakes, sees the lock free, and becomes the new owner."],
      ],
    ],
    mistakes: [
      "Writing `try { lock.lock(); ... } finally { lock.unlock(); }`. If `lock()` throws, unlock fails with IllegalMonitorStateException.",
      "Unlocking fewer times than locking with a reentrant lock. The lock stays held forever.",
      "Using a fair lock everywhere. Fairness costs a lot of throughput and is rarely needed.",
    ],
    qa: [
      [
        "What is ReentrantReadWriteLock for?",
        "Data that is read often and written rarely. Many threads can hold the read lock at the same time, while the write lock is exclusive. A writer can downgrade to a read lock, but a reader cannot upgrade.",
      ],
      [
        "What is StampedLock's optimistic read?",
        "`long stamp = sl.tryOptimisticRead();` reads fields without locking, then `sl.validate(stamp)` checks that no write happened in between. If one did, you retry with a real read lock. It is very fast for read-mostly data, but it is not reentrant.",
      ],
      [
        "Can a Condition be used without holding its lock?",
        "No. `await` and `signal` require the current thread to hold the owning lock, otherwise they throw IllegalMonitorStateException, just like wait and notify.",
      ],
    ],
    ex: [
      "Make MyReentrantLock fair, so that waiting threads acquire it in arrival order.",
      "Keep a `Queue<Thread> waiters`. In `lock()`, add the current thread and wait `while (owner != null && owner != me || waiters.peek() != me)`, then remove itself from the queue, set the owner and increment the count. `unlock()` uses `notifyAll()`, so the thread at the head of the queue can see that it is its turn.",
    ],
  }),

  lesson("Concurrency Q34-Q39 and Q41: Fork/Join, Divide and Conquer, Work Stealing and Parallel Programming", {
    intro:
      "Questions 34 to 39 explain the Fork/Join framework:\n\n- what it is\n- divide and conquer\n- the work-stealing approach of ForkJoinPool\n- ForkJoinPool and ForkJoinTask\n- RecursiveAction vs RecursiveTask\n- real-world uses\n\nQuestion 41 contrasts traditional multithreading with parallel programming. The program parallelises an array sum (RecursiveTask) and an in-place transformation (RecursiveAction), and checks both against sequential versions.",
    topics: [
      [
        "Q34. What is the Fork/Join framework?",
        "A framework (Java 7, JSR 166y) for **parallelising recursive, divide-and-conquer computations** across all CPU cores. You write a task that either solves a small problem directly, or splits it into subtasks, **forks** them (schedules them for asynchronous execution), and **joins** them (waits for and combines their results). The tasks run in a `ForkJoinPool`, whose threads use work stealing to stay busy. It powers parallel streams, `Arrays.parallelSort`, `CompletableFuture`'s default async executor (the common pool) and, as carrier threads, virtual threads.",
      ],
      [
        "Q35. What is divide and conquer?",
        "An algorithm design pattern with three steps:\n\n1. **Divide** the problem into smaller independent subproblems of the same kind.\n2. **Conquer** each subproblem recursively, solving it directly once it is small enough (the base case, or threshold).\n3. **Combine** the sub-results into the answer.\n\nMerge sort, quicksort, binary search, the parallel sum and max of an array, matrix multiplication, and tree traversals are examples. Because the subproblems are independent, they can be solved in parallel, which is exactly what Fork/Join exploits. Choosing the threshold well (for example, a few thousand elements) balances parallelism against task overhead.",
      ],
      [
        "Q36. What approach does ForkJoinPool use? Explain work stealing.",
        "Each worker thread owns a **double-ended queue (deque)** of tasks. When a task forks a subtask, the subtask is pushed onto the **top** of the worker's own deque, and the worker pops from the top (LIFO), which is cache-friendly and depth-first. An idle worker **steals** from the **bottom** (FIFO end) of another worker's deque. It takes the oldest, and usually largest, chunk of work, so it rarely needs to steal again. Owners and thieves work at opposite ends, so contention is minimal. A worker calling `join()` on an unfinished task does not just block: it helps by running other tasks. The result is near-automatic load balancing.",
      ],
      [
        "Q37. What are ForkJoinPool and ForkJoinTask?",
        "**ForkJoinPool** is an ExecutorService specialised for ForkJoinTasks. You can create your own with a parallelism level (`new ForkJoinPool(4)`), or use the shared `ForkJoinPool.commonPool()`, whose parallelism is the number of cores minus one by default. You submit work with `invoke(task)` (blocks and returns the result), `submit` or `execute`.\n\n**ForkJoinTask<V>** is the abstract lightweight task type. Its key methods are `fork()`, `join()`, `invoke()`, `invokeAll(t1, t2)`, `isDone()`, `getRawResult()` and `cancel()`. It is far cheaper than a Thread, so millions can exist. You normally extend one of its subclasses: RecursiveTask, RecursiveAction or CountedCompleter.",
      ],
      [
        "Q38. What is the difference between RecursiveAction and RecursiveTask?",
        "Both extend ForkJoinTask and are implemented by overriding `compute()`. **RecursiveTask<V>** returns a result: `protected V compute()`. Use it for sum, max, count or search, where sub-results are combined with `left.join() + right.join()`. **RecursiveAction** returns nothing: `protected void compute()`. Use it for side-effect work such as sorting an array in place, transforming elements, or writing output, where subtasks are joined only to wait for completion. A third subclass, **CountedCompleter**, triggers completion callbacks instead of blocking joins, and is used inside parallel streams.",
      ],
      [
        "Q39. What are real-world uses of Fork/Join?",
        "- **Parallel streams** (`list.parallelStream()...`), which split data with Spliterators on the common pool.\n- **`Arrays.parallelSort`** and `Arrays.parallelPrefix`.\n- **Large-scale data processing**: summing or aggregating big arrays, image processing in tiles, matrix operations.\n- **Recursive searches**: walking a large file tree or graph, and game-tree search.\n- **Batch computations**: risk calculations, Monte Carlo simulations.\n- **Frameworks**: the default executor for CompletableFuture's async methods, and the scheduler for virtual threads.\n\nFork/Join suits CPU-bound work that splits into independent pieces, not blocking I/O.",
      ],
      [
        "Q41. What is the difference between traditional multithreading and parallel programming?",
        "**Traditional multithreading** creates threads, mostly for **concurrency**: doing several *different* activities at once, such as handling many client requests or keeping a UI responsive during I/O. It is often I/O-bound, and the threads communicate through locks and wait/notify, so the developer manages coordination by hand.\n\n**Parallel programming** splits **one** CPU-bound computation across cores to finish it faster. It is about data or task decomposition (Fork/Join, parallel streams), usually with minimal shared mutable state, and the framework handles scheduling and load balancing. Concurrency is about structure (dealing with many things), while parallelism is about execution (doing many things at the same instant). Parallelism needs multiple cores; concurrency does not.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {

    // Q38 RecursiveTask: returns a value (sum of a range).
    static class SumTask extends RecursiveTask<Long> {
        static final int THRESHOLD = 10_000;
        final long[] data; final int lo, hi;
        SumTask(long[] data, int lo, int hi) { this.data = data; this.lo = lo; this.hi = hi; }
        @Override protected Long compute() {
            if (hi - lo <= THRESHOLD) {                       // conquer: small enough
                long s = 0;
                for (int i = lo; i < hi; i++) s += data[i];
                return s;
            }
            int mid = (lo + hi) >>> 1;                        // divide
            SumTask left = new SumTask(data, lo, mid), right = new SumTask(data, mid, hi);
            left.fork();                                      // push onto this worker's deque
            long r = right.compute();                         // work on the other half directly
            return left.join() + r;                           // combine
        }
    }

    // Q38 RecursiveAction: no result, transforms the array in place.
    static class SquareAction extends RecursiveAction {
        final long[] data; final int lo, hi;
        SquareAction(long[] data, int lo, int hi) { this.data = data; this.lo = lo; this.hi = hi; }
        @Override protected void compute() {
            if (hi - lo <= 10_000) { for (int i = lo; i < hi; i++) data[i] = data[i] * data[i]; return; }
            int mid = (lo + hi) >>> 1;
            invokeAll(new SquareAction(data, lo, mid), new SquareAction(data, mid, hi)); // fork both, wait for both
        }
    }

    // Q36: count how many tasks each worker executed (shows that work spread out).
    static final ConcurrentHashMap<String, Integer> workerTasks = new ConcurrentHashMap<>();
    static class CountingTask extends RecursiveAction {
        final int size;
        CountingTask(int size) { this.size = size; }
        @Override protected void compute() {
            workerTasks.merge(Thread.currentThread().getName(), 1, Integer::sum);
            if (size <= 1) { busy(); return; }
            invokeAll(new CountingTask(size / 2), new CountingTask(size - size / 2));
        }
        static void busy() { long x = 0; for (int i = 0; i < 200_000; i++) x += i; if (x == 42) System.out.print(""); }
    }

    public static void main(String[] args) {
        long[] numbers = LongStream.rangeClosed(1, 1_000_000).toArray();

        // Q34 + Q35 + Q37
        ForkJoinPool pool = new ForkJoinPool(4);
        long parallel = pool.invoke(new SumTask(numbers, 0, numbers.length));
        long sequential = 0;
        for (long n : numbers) sequential += n;
        System.out.println("Q35 Fork/Join sum " + parallel + " equals sequential " + (parallel == sequential));

        // Q38: RecursiveAction squares in place.
        long[] small = LongStream.rangeClosed(1, 50_000).toArray();
        pool.invoke(new SquareAction(small, 0, small.length));
        System.out.println("Q38 RecursiveAction squared in place: first " + small[0] + ", last " + small[small.length - 1]);

        // Q36: work stealing spreads the leaves over several workers.
        pool.invoke(new CountingTask(512));
        System.out.println("Q36 work stealing used more than one worker: " + (workerTasks.size() > 1)
                + " (pool parallelism " + pool.getParallelism() + ", steals > 0: " + (pool.getStealCount() > 0) + ")");
        pool.shutdown();

        // Q37: the common pool backs parallel streams.
        Set<Boolean> poolThreads = ConcurrentHashMap.newKeySet();
        long streamSum = IntStream.rangeClosed(1, 100_000).parallel()
                .peek(i -> poolThreads.add(Thread.currentThread() instanceof ForkJoinWorkerThread || Thread.currentThread().getName().equals("main")))
                .asLongStream().sum();
        System.out.println("Q37 parallel stream sum " + streamSum + " ran on main + common-pool workers: " + poolThreads.equals(Set.of(true))
                + ", common pool parallelism >= 1: " + (ForkJoinPool.commonPool().getParallelism() >= 1));

        // Q39: Arrays.parallelSort is Fork/Join underneath.
        int[] shuffled = new Random(7).ints(200_000, 0, 1_000_000).toArray();
        int[] copy = shuffled.clone();
        Arrays.parallelSort(shuffled);
        Arrays.sort(copy);
        System.out.println("Q39 Arrays.parallelSort matches Arrays.sort: " + Arrays.equals(shuffled, copy));

        // Q41: concurrency (different activities) vs parallelism (one job split).
        List<String> activities = Collections.synchronizedList(new ArrayList<>());
        Thread ui = new Thread(() -> activities.add("respond to user"));
        Thread io = new Thread(() -> activities.add("download file"));
        ui.start(); io.start();
        try { ui.join(); io.join(); } catch (InterruptedException ignored) { }
        System.out.println("Q41 concurrency ran " + activities.size() + " different activities; parallelism split one sum over cores");
    }
}`,
    walk:
      "SumTask splits the million-element range until a chunk has at most 10,000 elements, forks the left half, computes the right half itself, and adds the joined results. Its answer equals the sequential sum, 500,000,500,000 (Q34, Q35, Q37). SquareAction is a RecursiveAction: it returns nothing and squares the array in place with `invokeAll`, so the last element of 1..50,000 becomes 2,500,000,000 (Q38).\n\nCountingTask builds a tree of 512 leaves on a four-thread pool and records which worker executed each task. More than one worker participates, and the pool's steal count is positive, which is work stealing in action (Q36). A parallel stream runs on main plus common-pool workers (Q37). `Arrays.parallelSort` matches `Arrays.sort` (Q39). Q41 contrasts two different activities running concurrently with one computation split for speed.",
    anim: [
      "Work stealing between two workers",
      [
        ["w1", "worker 1", "own deque"],
        ["d1", "deque 1", "top: newest"],
        ["w2", "worker 2", "idle"],
        ["task", "big task", "sum 1..1e6"],
      ],
      [
        ["task", "w1", "invoke", "The big task starts on worker 1, which splits it into two halves."],
        ["w1", "d1", "fork() push", "The left half is pushed onto the top of worker 1's own deque."],
        ["w1", "w1", "compute right", "Worker 1 keeps splitting the right half itself, depth first."],
        ["w2", "d1", "steal bottom", "Idle worker 2 steals the oldest, biggest task from the bottom of deque 1."],
        ["w2", "w1", "results join", "Each worker finishes its part; join combines them into the final sum."],
      ],
    ],
    varies: true,
    mistakes: [
      "Forking both halves and then joining in the wrong order (`left.fork(); right.fork(); left.join(); right.join();`). Forking one and computing the other is more efficient.",
      "Doing blocking I/O inside Fork/Join tasks. It starves the pool; use ManagedBlocker or a separate executor.",
      "Using a parallel stream for tiny inputs or with shared mutable state.",
    ],
    qa: [
      [
        "Why compute the right half directly instead of forking it?",
        "The current thread would otherwise sit idle in `join`. Computing one half halves the number of tasks and keeps work on the local, cache-warm thread.",
      ],
      [
        "How do you run a parallel stream on a custom pool?",
        "Submit the stream pipeline from inside the pool: `customPool.submit(() -> list.parallelStream()...).get()`. Its tasks then run on that pool instead of the common pool.",
      ],
      [
        "What is a good Fork/Join threshold?",
        "One where the sequential work per leaf is around 10,000 to 100,000 basic operations. Measure it, because too small adds overhead and too large leaves cores idle.",
      ],
    ],
    ex: [
      "Write a RecursiveTask<Integer> that returns the maximum of an int array.",
      "In `compute()`: if `hi - lo <= THRESHOLD`, loop and return the max. Otherwise split at mid, `left.fork()`, compute `right` directly, and return `Math.max(left.join(), rightResult)`. Call it with `ForkJoinPool.commonPool().invoke(new MaxTask(a, 0, a.length))`.",
    ],
  }),

  lesson("Concurrency Q42-Q49: Atomic Operations, AtomicInteger and AtomicLong (and Writing Them), Output Questions", {
    intro:
      "The last concurrency questions, 42 to 49, cover:\n\n- what atomic operations are\n- the methods of AtomicInteger and AtomicLong, and how to write your own versions with CAS loops\n- two output questions, one about locks and one about Phaser\n- which atomic classes exist, and why there is no AtomicFloat or AtomicDouble\n\nThe source presents its two output questions as images, so this lesson uses equivalent programs written here. The custom atomics are built on VarHandle, the modern CAS API.",
    topics: [
      [
        "Q42. What are atomic operations?",
        "An atomic operation **completes as a single, indivisible step**: no other thread can observe it half-done or interleave with it. In Java, reads and writes of references and of most primitive variables are atomic. Plain `long` and `double` writes may not be atomic unless the field is volatile. Compound actions such as `i++` (read, add, write) or check-then-act are **not** atomic. Hardware provides atomic read-modify-write instructions such as **compare-and-swap** (CAS: set the variable to `new` only if it still equals `expected`). The atomic classes expose those instructions, giving thread-safe updates without locks.",
      ],
      [
        "Q43. What are the important AtomicInteger methods?",
        "- `get()` and `set(v)`: volatile read and write. `lazySet(v)` / `setRelease(v)` is an ordered write that becomes visible eventually.\n- `getAndSet(v)`.\n- `incrementAndGet()`, `getAndIncrement()`, `decrementAndGet()`, `getAndDecrement()`.\n- `addAndGet(d)` and `getAndAdd(d)`.\n- `compareAndSet(expect, update)`, which returns a boolean, and `weakCompareAndSetPlain`, `compareAndExchange` and other variants.\n- `updateAndGet(fn)` and `getAndUpdate(fn)`.\n- `accumulateAndGet(x, fn)` and `getAndAccumulate(x, fn)`.\n- `intValue()`, `longValue()` and the other Number methods.\n- Since Java 9, `getPlain`, `getOpaque` and `getAcquire`.\n\nThe naming tells you the order: *getAndX* returns the old value, *XAndGet* the new one.",
      ],
      [
        "Q44. How would you write your own AtomicInteger?",
        "Hold a `volatile int value` and implement every update as a **CAS retry loop**:\n\n`int incrementAndGet() { while (true) { int current = value; int next = current + 1; if (compareAndSet(current, next)) return next; } }`\n\n`compareAndSet` must be truly atomic. Before Java 9 that meant `sun.misc.Unsafe`; now use a **VarHandle**: `VALUE.compareAndSet(this, expect, update)`. If another thread changed the value between the read and the CAS, the CAS fails and the loop retries with the fresh value, so no lock is ever taken. A simpler but blocking alternative is to synchronize every method.",
      ],
      [
        "Q45. What are the important AtomicLong methods?",
        "The same API as AtomicInteger, for 64-bit values: `get`, `set`, `getAndSet`, `incrementAndGet`, `getAndIncrement`, `decrementAndGet`, `addAndGet`, `getAndAdd`, `compareAndSet`, `updateAndGet`, `getAndUpdate`, `accumulateAndGet`, `getAndAccumulate`, plus the VarHandle-style memory-order methods. Unlike a plain long field, AtomicLong guarantees atomic 64-bit reads and writes on every platform. For a heavily contended counter that is mostly incremented and rarely read, `LongAdder` scales better.",
      ],
      [
        "Q46. How would you write your own AtomicLong?",
        "Exactly as for MyAtomicInteger, but with a `volatile long` field and a VarHandle of type long. Every method (`incrementAndGet`, `addAndGet`, `getAndUpdate`) is a CAS loop over `compareAndSet(current, next)`. The `volatile` keyword is essential: it makes plain `get()` and `set()` reads and writes of the 64-bit value atomic and visible. Without it, a reader could see a torn value, half old and half new.",
      ],
      [
        "Q47 (output). What does this ReentrantLock program print?",
        "Here is an equivalent of the source's lock-based output question. Two threads each increment a shared counter 1,000 times inside `lock.lock(); try { count++; } finally { lock.unlock(); }`. The output is always **2000**, because the lock makes the increments mutually exclusive. Remove the lock, and the result becomes unpredictable, usually less than 2,000. Add a nested `lock.lock()` without a second unlock, and the other thread blocks forever, so the program **hangs**: reentrant locks must be unlocked as many times as they were locked.",
        "lock.lock();\ntry { count++; } finally { lock.unlock(); }   // two threads x 1000 -> 2000",
      ],
      [
        "Q48 (output). What does this Phaser program print?",
        "Here is an equivalent of the source's Phaser output question. A `Phaser(1)` registers main. Three workers each call `register()`, then `arriveAndAwaitAdvance()` twice, printing the phase number after each call. Main also calls `arriveAndAwaitAdvance()` twice. Every party sees phase **1** after the first advance and phase **2** after the second, and `getRegisteredParties()` is 4. The order of the worker print lines within a phase varies, but no worker prints a phase-2 line before all four parties have finished phase 1.",
        "Phaser ph = new Phaser(1);           // main\nfor 3 workers: ph.register(); start { ph.arriveAndAwaitAdvance(); print(ph.getPhase()); ... }",
      ],
      [
        "Q49. Which atomic classes exist, and which do not?",
        "**They exist**:\n\n- AtomicBoolean, AtomicInteger, AtomicLong, AtomicReference\n- AtomicIntegerArray, AtomicLongArray, AtomicReferenceArray\n- AtomicIntegerFieldUpdater, AtomicLongFieldUpdater, AtomicReferenceFieldUpdater\n- AtomicMarkableReference and AtomicStampedReference\n- LongAdder, LongAccumulator, DoubleAdder and DoubleAccumulator (Java 8)\n\n**They do not exist**: AtomicFloat, AtomicDouble, AtomicByte, AtomicShort and AtomicChar. CPUs offer CAS on 32-bit and 64-bit integer words, and floating-point values can be stored in those words by bit pattern. That is exactly how you would build an atomic double: `AtomicLong` holding `Double.doubleToRawLongBits(d)`, updated in a CAS loop with `Double.longBitsToDouble`. DoubleAdder covers the common case of summing. The JDK chose not to add more types for rarely needed cases.",
      ],
    ],
    code: String.raw`import java.lang.invoke.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.LongUnaryOperator;

public class Main {

    // Q44: our own AtomicInteger built on a VarHandle CAS.
    static class MyAtomicInteger {
        private volatile int value;
        private static final VarHandle VALUE;
        static {
            try { VALUE = MethodHandles.lookup().findVarHandle(MyAtomicInteger.class, "value", int.class); }
            catch (ReflectiveOperationException e) { throw new ExceptionInInitializerError(e); }
        }
        int get() { return value; }
        boolean compareAndSet(int expect, int update) { return VALUE.compareAndSet(this, expect, update); }
        int incrementAndGet() {
            while (true) {                                   // CAS retry loop
                int current = value;
                int next = current + 1;
                if (compareAndSet(current, next)) return next;
            }
        }
        int getAndAdd(int delta) {
            int current;
            do { current = value; } while (!compareAndSet(current, current + delta));
            return current;
        }
    }

    // Q46: our own AtomicLong.
    static class MyAtomicLong {
        private volatile long value;                         // volatile: no torn 64-bit reads
        private static final VarHandle VALUE;
        static {
            try { VALUE = MethodHandles.lookup().findVarHandle(MyAtomicLong.class, "value", long.class); }
            catch (ReflectiveOperationException e) { throw new ExceptionInInitializerError(e); }
        }
        long get() { return value; }
        long updateAndGet(LongUnaryOperator fn) {
            while (true) {
                long current = value, next = fn.applyAsLong(current);
                if (VALUE.compareAndSet(this, current, next)) return next;
            }
        }
    }

    // Q49: an "AtomicDouble" built from AtomicLong bit patterns.
    static class AtomicDouble {
        private final AtomicLong bits = new AtomicLong(Double.doubleToRawLongBits(0.0));
        double addAndGet(double delta) {
            while (true) {
                long current = bits.get();
                double next = Double.longBitsToDouble(current) + delta;
                if (bits.compareAndSet(current, Double.doubleToRawLongBits(next))) return next;
            }
        }
        double get() { return Double.longBitsToDouble(bits.get()); }
    }

    static void inParallel(int threads, Runnable body) throws InterruptedException {
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) { ts[i] = new Thread(body); ts[i].start(); }
        for (Thread t : ts) t.join();
    }

    static int lockedCount = 0;

    public static void main(String[] args) throws Exception {
        // Q42: i++ is not atomic, incrementAndGet is.
        int[] plain = {0};
        AtomicInteger atomic = new AtomicInteger();
        inParallel(4, () -> { for (int i = 0; i < 25_000; i++) { plain[0]++; atomic.incrementAndGet(); } });
        System.out.println("Q42 plain ++ total <= 100000: " + (plain[0] <= 100_000) + ", atomic total " + atomic.get());

        // Q43: the method family on one AtomicInteger.
        AtomicInteger n = new AtomicInteger(10);
        System.out.println("Q43 getAndIncrement " + n.getAndIncrement() + ", incrementAndGet " + n.incrementAndGet()
                + ", addAndGet(5) " + n.addAndGet(5) + ", getAndSet(1) " + n.getAndSet(1)
                + ", CAS(1,7) " + n.compareAndSet(1, 7) + ", updateAndGet(x*3) " + n.updateAndGet(x -> x * 3)
                + ", accumulateAndGet(4, max) " + n.accumulateAndGet(4, Math::max));

        // Q44
        MyAtomicInteger mine = new MyAtomicInteger();
        inParallel(4, () -> { for (int i = 0; i < 25_000; i++) mine.incrementAndGet(); });
        System.out.println("Q44 MyAtomicInteger after 4 x 25000 increments: " + mine.get() + ", getAndAdd(5) returned " + mine.getAndAdd(5) + " -> " + mine.get());

        // Q45 + Q46
        AtomicLong big = new AtomicLong(Long.MAX_VALUE - 1);
        MyAtomicLong myLong = new MyAtomicLong();
        inParallel(4, () -> { for (int i = 0; i < 10_000; i++) myLong.updateAndGet(v -> v + 3); });
        System.out.println("Q45 AtomicLong incrementAndGet near MAX: " + big.incrementAndGet() + " | Q46 MyAtomicLong 4 x 10000 x 3 = " + myLong.get());

        // Q47: lock-protected counter always reaches 2000.
        ReentrantLock lock = new ReentrantLock();
        inParallel(2, () -> { for (int i = 0; i < 1000; i++) { lock.lock(); try { lockedCount++; } finally { lock.unlock(); } } });
        System.out.println("Q47 ReentrantLock-guarded count = " + lockedCount);

        // Q48: Phaser phases seen by every party.
        Phaser phaser = new Phaser(1);
        ConcurrentLinkedQueue<String> seen = new ConcurrentLinkedQueue<>();
        Thread[] workers = new Thread[3];
        for (int i = 0; i < 3; i++) {
            phaser.register();
            workers[i] = new Thread(() -> {
                phaser.arriveAndAwaitAdvance(); seen.add("p" + phaser.getPhase());
                phaser.arriveAndAwaitAdvance(); seen.add("p" + phaser.getPhase());
            });
            workers[i].start();
        }
        int registered = phaser.getRegisteredParties();
        phaser.arriveAndAwaitAdvance();
        phaser.arriveAndAwaitAdvance();
        for (Thread w : workers) w.join();
        long phaseOneLines = seen.stream().filter("p1"::equals).count(), phaseTwoLines = seen.stream().filter("p2"::equals).count();
        System.out.println("Q48 registered parties " + registered + ", worker lines in phase 1: " + phaseOneLines + ", phase 2: " + phaseTwoLines);

        // Q49
        AtomicDouble total = new AtomicDouble();
        inParallel(4, () -> { for (int i = 0; i < 1000; i++) total.addAndGet(0.5); });
        DoubleAdder adder = new DoubleAdder();
        inParallel(4, () -> { for (int i = 0; i < 1000; i++) adder.add(0.25); });
        System.out.println("Q49 AtomicDouble via AtomicLong bits = " + total.get() + ", DoubleAdder sum = " + adder.sum()
                + "; java.util.concurrent.atomic has no AtomicFloat/AtomicDouble class");
    }
}`,
    walk:
      "Q42 increments a plain int and an AtomicInteger 100,000 times across four threads. The atomic total is always exact, while the plain one can lose updates; only a safe check is printed for it. Q43 walks through the AtomicInteger API on one variable: getAndIncrement returns 10 and incrementAndGet then gives 12, addAndGet(5) gives 17, getAndSet(1) returns 17, the CAS from 1 to 7 succeeds, tripling gives 21, and the max with 4 keeps 21.\n\nMyAtomicInteger and MyAtomicLong implement their methods as VarHandle CAS loops, and both give exact totals under four threads (Q44, Q46). AtomicLong handles values near Long.MAX_VALUE (Q45). Q47's lock-guarded counter reaches exactly 2,000. In Q48, four parties are registered, and each worker logs phase 1 and then phase 2, three lines each. Q49 builds an atomic double from AtomicLong bit patterns, and compares it with DoubleAdder.",
    anim: [
      "A compare-and-swap retry loop",
      [
        ["t1", "thread 1", "read 5, want 6"],
        ["t2", "thread 2", "read 5, want 6"],
        ["mem", "value", "volatile int"],
        ["cas", "CAS", "expected == actual?"],
      ],
      [
        ["t1", "mem", "read 5", "Thread 1 reads the current value 5 and computes 6."],
        ["t2", "mem", "read 5", "Thread 2 also reads 5 and computes 6."],
        ["t1", "cas", "CAS(5, 6) ok", "Thread 1's CAS finds 5, writes 6 and succeeds."],
        ["t2", "cas", "CAS(5, 6) fails", "Thread 2's CAS finds 6, not 5, so it fails without writing."],
        ["t2", "mem", "retry: 6 -> 7", "Thread 2 loops: it re-reads 6 and succeeds with 7. No update is lost and no lock is used."],
      ],
    ],
    mistakes: [
      "Writing `if (a.get() == x) a.set(y)`. That is check-then-act; use `compareAndSet`.",
      "Using side effects inside `updateAndGet` functions. The function may run several times under contention.",
      "Building an atomic double by CAS on `==` of doubles. Compare the raw long bits so that NaN and -0.0 work.",
    ],
    qa: [
      [
        "What is the ABA problem and how do you avoid it?",
        "A value goes from A to B and back to A between a thread's read and its CAS, so the CAS succeeds although the state changed. AtomicStampedReference pairs the value with a version stamp, so the CAS fails if the stamp moved.",
      ],
      [
        "What is the difference between `lazySet` and `set`?",
        "`set` is a volatile write with full ordering. `lazySet` (`setRelease`) only guarantees that earlier writes are not reordered after it, so it is cheaper and becomes visible to other threads slightly later.",
      ],
      [
        "Are atomic classes always faster than locks?",
        "Under low to moderate contention, yes. Under very heavy contention, CAS loops retry a lot, and LongAdder (for counters) or a lock with fewer retries can perform better.",
      ],
    ],
    ex: [
      "Using `AtomicReference<ImmutablePoint>`, write a lock-free `move(dx, dy)` for a point shared by many threads.",
      "`void move(int dx, int dy) { ImmutablePoint cur, next; do { cur = ref.get(); next = new ImmutablePoint(cur.x() + dx, cur.y() + dy); } while (!ref.compareAndSet(cur, next)); }`. Because points are immutable, the CAS replaces the whole state atomically, and both coordinates always change together.",
    ],
  }),
];
