import { lesson } from "../../schema.js";

export default [
  lesson("Threads Q1-Q10: Threads vs Processes, Creating Threads, Ordering and volatile", {
    intro:
      "The thread interview round starts with fundamentals:\n\n- what a thread is, and how it differs from a process\n- the ways to implement a thread, and whether each thread has its own stack\n- Runnable vs extending Thread\n- why multithreaded output is unpredictable, and when threads stop being lightweight\n- making threads finish in order with main last\n- run vs start\n- volatile\n\nThe program shows separate stacks (each thread's local variables are private) and ordered completion with join.",
    topics: [
      [
        "Q1. What is a thread?",
        "A thread is the smallest unit of execution that the OS scheduler manages: a sequence of instructions with its own program counter, its own stack and its own registers, running inside a process. A Java program starts with the `main` thread, and you can create more to do work concurrently. Threads of one process share the same heap and resources, so they communicate cheaply through shared objects, which is also why they need synchronization. Since Java 21 there are two kinds: **platform threads** (one-to-one with OS threads) and **virtual threads** (lightweight threads scheduled by the JVM on top of a few carrier platform threads).",
      ],
      [
        "Q2. What is the difference between a process and a thread?",
        "A **process** is an independent program in execution. It has its own address space (heap, code and data), file handles and security context, and it is isolated from other processes. A **thread** is a path of execution *inside* a process. Threads of the same process share the address space and resources but each has its own stack and registers. Creating and switching processes is expensive, because the OS must set up and swap memory mappings. Threads are much cheaper. Processes communicate through IPC (pipes, sockets, shared memory), while threads communicate through shared variables. One crashing process does not take others down, but a thread that corrupts memory can affect its whole process. The JVM itself is one process.",
      ],
      [
        "Q3. How can a thread be implemented in Java?",
        "1. Implement **Runnable** and pass it to `new Thread(runnable)`, with a lambda or a class.\n2. **Extend Thread** and override `run()`.\n3. Implement **Callable** and submit it to an **ExecutorService**, which returns a Future.\n4. Use **CompletableFuture** (`runAsync` and `supplyAsync`).\n5. Since Java 21, use **virtual threads**: `Thread.ofVirtual().start(r)`, `Thread.startVirtualThread(r)` or `Executors.newVirtualThreadPerTaskExecutor()`.\n6. Use the thread builders: `Thread.ofPlatform().name(\"w-\", 0).start(r)`.\n\nIn every case, `start()` (or the executor) creates the thread, and `run()` or `call()` holds the code.",
      ],
      [
        "Q4. Does each thread have its own stack?",
        "**Yes.** Every thread has a private **JVM stack** of frames. Each frame holds a method's local variables, its operand stack and its return address. Primitive local variables and object references held in locals are therefore never shared: two threads running the same method each have their own copy of its locals. The **objects** those references point to live on the shared heap, though, so two threads holding references to the same object share it. Stack size is set with `-Xss` (or per thread in the Thread constructor), and too deep a recursion gives StackOverflowError for that thread only. Each thread also has its own program counter register and native method stack.",
      ],
      [
        "Q5. Should you implement Runnable or extend Thread?",
        "Prefer **Runnable**:\n\n- the class remains free to extend another class (Java has single inheritance)\n- the task is decoupled from the execution mechanism, so the same Runnable runs on a Thread, a thread pool or a virtual thread\n- one task object can be shared by several threads\n- it is cleaner object-oriented design: a task *is not* a thread\n\nExtend Thread only if you need to override other Thread behaviour, which is rarely justified. In modern code, a lambda passed to an executor is the norm.",
      ],
      [
        "Q6. Why is the output of a multithreaded program unpredictable?",
        "The **thread scheduler** (the OS, for platform threads) decides when each thread runs and for how long. Time slices, priorities, the number of cores, other load on the machine and even JIT compilation change the interleaving from run to run. Two threads printing in loops can produce a different mix every time. The JVM gives no ordering guarantee between threads unless you create one with synchronization, join, latches or other happens-before relationships. Correct concurrent programs must therefore never depend on timing, and tests should not assert interleavings.",
      ],
      [
        "Q7. When are threads not lightweight?",
        "Threads are lighter than processes, but platform threads are **not free**:\n\n- each reserves a stack, about 512 KB to 1 MB of virtual memory by default\n- each needs an OS thread, and creating or destroying one costs microseconds\n- context switches between many threads cost CPU and cache\n- thousands of blocked threads exhaust memory or OS limits\n\nSo \"one thread per request\" stops scaling at a few thousand concurrent requests. Thread pools reuse threads to amortise the cost, and **virtual threads** (Java 21) make threads truly lightweight. Their stacks live on the heap and grow as needed, so millions are possible for I/O-bound work.",
      ],
      [
        "Q8. How do you ensure threads end in the order they started, with main ending last?",
        "Use `join()`, which makes the caller wait for a thread to die. For **strict sequential order**, start t1 and `t1.join()`, then start t2 and `t2.join()`, and so on. Each one finishes before the next starts, and main, after the last join, ends last. For **parallel threads with main last**, start them all and then join each: they finish in any order, but main waits for all of them. To force the *finishing* order while still running in parallel, have each thread join its predecessor before completing (`t2` calls `t1.join()` at its end). Higher-level options are a CountDownLatch, `invokeAll`, or a single-thread executor that runs tasks in submission order.",
      ],
      [
        "Q9. What is the difference between start() and run()?",
        "`start()` creates a new thread of execution. The JVM allocates its stack and native thread, moves it to RUNNABLE, and that new thread calls `run()`. `start()` returns immediately, and calling it twice throws IllegalThreadStateException. `run()` is an ordinary method: calling it directly executes the code on the **current** thread, synchronously, with no new thread created, and it can be called any number of times. Printing `Thread.currentThread().getName()` inside `run()` shows the difference.",
      ],
      [
        "Q10. What is volatile?",
        "A `volatile` field guarantees **visibility**: every read sees the most recent write by any thread, because the value is not cached in a register or reordered. It also guarantees **ordering**: a volatile write happens-before every later read of that field, so everything written before the volatile write is visible to a thread that reads it. Volatile long and double reads and writes are atomic too. Volatile does **not** provide atomicity for compound operations (`x++`, check-then-act) or mutual exclusion. Typical uses are stop flags, published configuration references, and the instance field in double-checked locking.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    static volatile boolean running = true;                         // Q10: visible to all threads

    // Q4: each thread runs this method with its own local 'sum' on its own stack.
    static int sumTo(int n) {
        int sum = 0;                                                 // local: private per thread
        for (int i = 1; i <= n; i++) sum += i;
        return sum;
    }

    public static void main(String[] args) throws Exception {
        // Q1 + Q2: one process, many threads sharing its heap.
        long pid = ProcessHandle.current().pid();
        List<String> sharedHeapList = Collections.synchronizedList(new ArrayList<>());
        Thread w1 = new Thread(() -> sharedHeapList.add("from w1"));
        Thread w2 = new Thread(() -> sharedHeapList.add("from w2"));
        w1.start(); w2.start(); w1.join(); w2.join();
        System.out.println("Q2  same process for all threads (pid > 0: " + (pid > 0) + "), shared list size " + sharedHeapList.size());

        // Q3: several ways to run code on another thread.
        Thread viaRunnable = new Thread(() -> System.out.println("Q3  Runnable on " + Thread.currentThread().getName()), "runnable-thread");
        viaRunnable.start(); viaRunnable.join();
        try (ExecutorService pool = Executors.newSingleThreadExecutor()) {
            Future<String> f = pool.submit(() -> "Callable via executor");
            System.out.println("Q3  " + f.get());
        }
        Thread virtual = Thread.ofVirtual().name("virtual-1").start(() -> System.out.println("Q3  virtual thread isVirtual=" + Thread.currentThread().isVirtual()));
        virtual.join();
        System.out.println("Q3  CompletableFuture -> " + CompletableFuture.supplyAsync(() -> "async result").get());

        // Q4: two threads, same method, independent locals.
        int[] results = new int[2];
        Thread a = new Thread(() -> results[0] = sumTo(100));
        Thread b = new Thread(() -> results[1] = sumTo(10));
        a.start(); b.start(); a.join(); b.join();
        System.out.println("Q4  private stacks: sumTo(100) = " + results[0] + ", sumTo(10) = " + results[1]);

        // Q8: finish in start order, main last.
        StringBuilder order = new StringBuilder();
        for (int i = 1; i <= 3; i++) {
            int id = i;
            Thread t = new Thread(() -> order.append("T").append(id).append(' '));
            t.start();
            t.join();                                                // wait before starting the next
        }
        order.append("main");
        System.out.println("Q8  " + order);

        // Q9: start vs run.
        Thread demo = new Thread(() -> System.out.println("Q9  body runs on " + Thread.currentThread().getName()), "started-thread");
        demo.run();
        demo.start(); demo.join();

        // Q10: a volatile flag stops a worker promptly.
        Thread loop = new Thread(() -> { long spins = 0; while (running) spins++; System.out.println("Q10 worker saw running = false"); });
        loop.start();
        Thread.sleep(20);
        running = false;
        loop.join();

        // Q6: interleaving is decided by the scheduler; we only show that both threads ran.
        Set<String> who = ConcurrentHashMap.newKeySet();
        Thread x = new Thread(() -> who.add("x")), y = new Thread(() -> who.add("y"));
        x.start(); y.start(); x.join(); y.join();
        System.out.println("Q6  both threads ran (order not guaranteed): " + new TreeSet<>(who));

        // Q7: a platform thread's default stack is reserved per thread; virtual threads are cheap.
        long start = System.nanoTime();
        try (ExecutorService vt = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) vt.submit(() -> { Thread.sleep(10); return null; });   // a Callable may throw
        }
        System.out.println("Q7  10,000 sleeping virtual threads finished (fast: " + ((System.nanoTime() - start) / 1_000_000 < 5000) + ")");
    }
}`,
    walk:
      "Q2 starts two threads that add to one list. Both writes land in the same heap object, which proves the threads share the process memory. Q3 runs code through a Runnable, a Callable in an executor, a virtual thread, and a CompletableFuture. For Q4, two threads call `sumTo` at the same time with different arguments and get correct, independent results (5050 and 55), because each has its own `sum` on its own stack.\n\nQ8 starts T1 and joins it before starting T2, and so on, so the order is fixed and main appends last. Q9 calls `run()` (prints main) and then `start()` (prints started-thread). Q10's worker spins on a volatile flag and stops as soon as main clears it. Q6 shows only that both threads ran, because their order is unpredictable. Q7 runs 10,000 virtual threads that each sleep 10 ms. They finish in well under five seconds, because sleeping virtual threads release their carrier threads.",
    anim: [
      "Shared heap, private stacks",
      [
        ["t1", "thread A", "stack: sum, i"],
        ["t2", "thread B", "stack: sum, i"],
        ["heap", "shared heap", "objects, statics"],
        ["obj", "results[]", "one array"],
      ],
      [
        ["t1", "t1", "push frame", "Thread A calls sumTo(100): a new frame with its own sum and i on A's stack."],
        ["t2", "t2", "push frame", "Thread B calls sumTo(10) at the same time with a separate frame on B's stack."],
        ["t1", "obj", "write [0]", "A stores 5050 into the shared array object on the heap."],
        ["t2", "obj", "write [1]", "B stores 55 into a different slot of the same heap object."],
        ["obj", "heap", "shared", "Locals never clash; only heap objects need care when threads share them."],
      ],
    ],
    mistakes: [
      "Assuming local variables need synchronization. Only shared heap objects do.",
      "Asserting a particular thread interleaving in tests.",
      "Creating thousands of platform threads for blocking I/O instead of using a pool or virtual threads.",
    ],
    qa: [
      [
        "What is a carrier thread?",
        "A platform thread in the ForkJoinPool that the JVM uses to run virtual threads. A virtual thread is mounted on a carrier while it runs, and unmounted when it blocks.",
      ],
      [
        "Can the main thread finish before other threads?",
        "Yes. If main does not join them, it can return first. The JVM keeps running until every non-daemon thread has finished.",
      ],
      [
        "How do you set a thread's stack size?",
        "Globally with `-Xss512k`, or per thread with the `Thread(ThreadGroup, Runnable, String, long stackSize)` constructor, which is only a hint to the JVM.",
      ],
    ],
    ex: [
      "Start three threads in parallel (not one after another), but make sure that they *finish* in the order T1, T2, T3 and that main finishes last. Use only Thread and join.",
      "Start T1. Start T2, whose run does its work and then calls `t1.join()` before finishing. Start T3, whose run calls `t2.join()` at its end. Main then calls `t3.join()`. All three work in parallel, but each completes only after its predecessor, and main completes last.",
    ],
  }),

  lesson("Threads Q11-Q20: synchronized vs volatile, Race Conditions, wait/notify and Deadlock", {
    intro:
      "Questions 11 to 20 cover how threads share data safely:\n\n- synchronized vs volatile, and whether a thread can be started again\n- race conditions\n- inter-thread communication\n- why wait and notify live in Object, and why the lock must be held\n- producer-consumer three ways: wait/notify, a solution without wait/notify, and BlockingQueue\n- how deadlocks form and how to avoid them\n\nThe program runs the three producer-consumer versions and a tryLock-based deadlock-free transfer.",
    topics: [
      [
        "Q11. What is the difference between synchronized and volatile?",
        "`synchronized` provides **mutual exclusion and visibility**. Only one thread at a time executes code guarded by the same monitor, and entering or leaving it flushes and refreshes memory. It applies to blocks and methods, can protect multi-step invariants across several variables, and can block threads. `volatile` provides **visibility and ordering only** for one variable. It never blocks, adds no mutual exclusion, and cannot make `count++` or check-then-act atomic. Use volatile for independent flags and references, and synchronized (or locks or atomics) for any compound update.",
      ],
      [
        "Q12. Can we start a thread twice?",
        "No. `start()` checks that the thread's status is NEW. A second call, whether the thread is still running or has terminated, throws **IllegalThreadStateException**. A Thread object represents one execution. To run the same logic again, create a new Thread with the same Runnable, or submit the task to an executor again.",
      ],
      [
        "Q13. What is a race condition?",
        "A race condition occurs when the correctness of a result depends on the relative timing of threads accessing shared mutable state without proper synchronization. Common forms:\n\n- **read-modify-write** (`count++` lost updates)\n- **check-then-act** (`if (instance == null) instance = new X()` creating two instances; `if (!map.containsKey(k)) map.put(...)`)\n- unsafe **publication** of objects\n\nThe fix is to make the critical section atomic with synchronized, a lock, an atomic class or an atomic collection method, or to eliminate the shared mutable state.",
      ],
      [
        "Q14. How do threads communicate with each other?",
        "Through **shared memory plus synchronization signals**:\n\n- `wait`, `notify` and `notifyAll` on a shared monitor\n- Lock Conditions (`await` and `signal`)\n- blocking queues that hand data over\n- synchronizers that signal events: CountDownLatch, CyclicBarrier, Phaser, Semaphore, Exchanger\n- Futures and CompletableFuture that deliver results\n- volatile flags and interruption (`interrupt()` and `isInterrupted()`)\n- `join()` to wait for completion\n\nThe higher-level tools are preferred, because they are harder to misuse than wait and notify.",
      ],
      [
        "Q15. Why are wait, notify and notifyAll in the Object class?",
        "Because every Java object has an intrinsic **monitor** (lock), and these methods operate on that monitor's **wait set**. Threads wait for a condition on the object whose lock guards that condition, and a notifier signals that object, without needing to know which threads are waiting. If the methods were in Thread, you would have to name the thread to wake, and the condition would not be tied to the lock that protects it. Keeping them in Object pairs the signalling with `synchronized(obj)`.",
      ],
      [
        "Q16. Why must the lock be held before calling wait or notify?",
        "To avoid the **lost wake-up** race. A waiter checks its condition and then waits; if a notifier could change the condition and notify between those two steps, the waiter would sleep forever. Requiring the monitor means checking the condition, and entering the wait set while atomically releasing the lock, happen without interference. `notify` must also hold the lock, so that its change to the condition is visible to the woken thread. Calling either method without owning the monitor throws IllegalMonitorStateException.",
      ],
      [
        "Q17. How do you solve producer-consumer with wait and notify?",
        "Use a bounded buffer whose methods are synchronized on one monitor. `put` runs `while (full) wait();`, then adds the item and calls `notifyAll()`. `take` runs `while (empty) wait();`, then removes an item and calls `notifyAll()`. Use `while`, not `if`, to handle spurious wake-ups and competing threads, and `notifyAll`, not `notify`, because producers and consumers share one wait set.",
      ],
      [
        "Q18. How do you solve producer-consumer without wait and notify?",
        "Use higher-level concurrency utilities instead of monitor methods:\n\n- a **BlockingQueue** (see Q19)\n- **two Semaphores**: `empty` starts at the capacity, `full` starts at 0, and a mutex guards the buffer\n- a **Lock with two Conditions** (`notFull` and `notEmpty`)\n- an **Exchanger** to swap a full buffer for an empty one\n- a busy-wait on a volatile or atomic flag, which works but wastes CPU\n\nThe program shows the Semaphore version.",
      ],
      [
        "Q19. How do you solve producer-consumer with a BlockingQueue?",
        "Share an `ArrayBlockingQueue` (bounded, array-based) or a `LinkedBlockingQueue`. The producer calls `queue.put(item)`, which blocks when the queue is full. The consumer calls `queue.take()`, which blocks when it is empty. All locking and signalling is internal. To stop the consumer, send a **poison pill** sentinel, or interrupt it. `offer` and `poll` with timeouts give non-blocking or bounded-time variants. This is the recommended solution.",
      ],
      [
        "Q20. How is a deadlock formed, and how can it be avoided?",
        "A deadlock forms when two or more threads each hold a lock and wait for a lock held by another, in a cycle, so none can proceed. The four **Coffman conditions** must all hold:\n\n- mutual exclusion\n- hold and wait\n- no preemption\n- circular wait\n\nAvoid it by breaking one condition:\n\n- **Lock ordering**: acquire locks in one consistent global order.\n- **tryLock with a timeout**: back off and retry instead of waiting forever.\n- **Lock one thing at a time**: avoid nested locks and alien calls while holding a lock.\n- **Coarse locking**: a single lock where contention allows.\n- **Lock-free structures**: concurrent collections and atomics.\n\nDetect deadlocks with thread dumps or `ThreadMXBean`.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {

    // Q17: wait/notifyAll buffer.
    static class MonitorBuffer {
        private final Deque<Integer> items = new ArrayDeque<>();
        synchronized void put(int v) throws InterruptedException { while (items.size() == 2) wait(); items.add(v); notifyAll(); }
        synchronized int take() throws InterruptedException { while (items.isEmpty()) wait(); int v = items.remove(); notifyAll(); return v; }
    }

    // Q18: semaphore buffer - no wait/notify.
    static class SemaphoreBuffer {
        private final Deque<Integer> items = new ArrayDeque<>();
        private final Semaphore empty = new Semaphore(2), full = new Semaphore(0), mutex = new Semaphore(1);
        void put(int v) throws InterruptedException { empty.acquire(); mutex.acquire(); items.add(v); mutex.release(); full.release(); }
        int take() throws InterruptedException { full.acquire(); mutex.acquire(); int v = items.remove(); mutex.release(); empty.release(); return v; }
    }

    interface Buffer { void put(int v) throws InterruptedException; int take() throws InterruptedException; }

    static List<Integer> runPair(Buffer buffer) throws InterruptedException {
        List<Integer> got = new ArrayList<>();
        Thread producer = new Thread(() -> { try { for (int i = 1; i <= 5; i++) buffer.put(i); } catch (InterruptedException ignored) { } });
        Thread consumer = new Thread(() -> { try { for (int i = 1; i <= 5; i++) got.add(buffer.take()); } catch (InterruptedException ignored) { } });
        producer.start(); consumer.start(); producer.join(); consumer.join();
        return got;
    }

    // Q20: an account transfer that cannot deadlock because it uses tryLock and backs off.
    static class Account {
        final String id; int balance; final ReentrantLock lock = new ReentrantLock();
        Account(String id, int balance) { this.id = id; this.balance = balance; }
    }
    static boolean transfer(Account from, Account to, int amount) throws InterruptedException {
        while (true) {
            if (from.lock.tryLock(10, TimeUnit.MILLISECONDS)) {
                try {
                    if (to.lock.tryLock(10, TimeUnit.MILLISECONDS)) {
                        try { from.balance -= amount; to.balance += amount; return true; }
                        finally { to.lock.unlock(); }
                    }
                } finally { from.lock.unlock(); }
            }
            Thread.sleep(ThreadLocalRandom.current().nextInt(1, 5));     // back off, then retry
        }
    }

    static int unsafeCount = 0;
    static int safeCount = 0;
    static synchronized void safeIncrement() { safeCount++; }

    public static void main(String[] args) throws Exception {
        // Q11 + Q13
        Runnable work = () -> { for (int i = 0; i < 50_000; i++) { unsafeCount++; safeIncrement(); } };
        Thread a = new Thread(work), b = new Thread(work);
        a.start(); b.start(); a.join(); b.join();
        System.out.println("Q13 race: unsafe total <= 100000 " + (unsafeCount <= 100_000) + ", synchronized total " + safeCount);

        // Q12
        try { a.start(); } catch (IllegalThreadStateException e) { System.out.println("Q12 restarting a finished thread -> IllegalThreadStateException"); }

        // Q16
        try { new Object().notify(); } catch (IllegalMonitorStateException e) { System.out.println("Q16 notify() without the lock -> IllegalMonitorStateException"); }

        // Q17, Q18, Q19
        MonitorBuffer monitor = new MonitorBuffer();
        System.out.println("Q17 wait/notify      -> " + runPair(new Buffer() { public void put(int v) throws InterruptedException { monitor.put(v); } public int take() throws InterruptedException { return monitor.take(); } }));
        SemaphoreBuffer sem = new SemaphoreBuffer();
        System.out.println("Q18 semaphores       -> " + runPair(new Buffer() { public void put(int v) throws InterruptedException { sem.put(v); } public int take() throws InterruptedException { return sem.take(); } }));
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        System.out.println("Q19 BlockingQueue    -> " + runPair(new Buffer() { public void put(int v) throws InterruptedException { queue.put(v); } public int take() throws InterruptedException { return queue.take(); } }));

        // Q20: opposite-direction transfers at the same time, which would deadlock with plain nested locks.
        Account x = new Account("X", 1000), y = new Account("Y", 1000);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Callable<Void>> jobs = List.of(
                () -> { for (int i = 0; i < 200; i++) transfer(x, y, 1); return null; },
                () -> { for (int i = 0; i < 200; i++) transfer(y, x, 1); return null; });
        for (Future<Void> f : pool.invokeAll(jobs)) f.get();
        pool.shutdown();
        System.out.println("Q20 400 opposite transfers finished without deadlock, total still " + (x.balance + y.balance));
    }
}`,
    walk:
      "Q13 runs two threads that each increment an unsynchronized counter and a synchronized one 50,000 times. The synchronized total is always 100,000, while the plain one may lose updates; the program prints only a check that never fails. Q12 restarts a finished thread and gets IllegalThreadStateException. Q16 calls `notify()` without holding the monitor.\n\nQ17 to Q19 run the same producer and consumer, each pair passing five numbers through a buffer of capacity 2, with three different mechanisms: a wait/notifyAll monitor, three semaphores (empty, full and mutex), and an ArrayBlockingQueue. All three deliver 1 to 5 in order. Q20 transfers money in opposite directions from two threads at once. With plain nested `synchronized` blocks this could deadlock. With `tryLock` and a random back-off, any thread that cannot get its second lock releases its first, so all 400 transfers finish, and the total of 2,000 is preserved.",
    anim: [
      "Deadlock avoided with tryLock",
      [
        ["t1", "thread 1", "X -> Y"],
        ["lx", "lock X", "ReentrantLock"],
        ["ly", "lock Y", "ReentrantLock"],
        ["t2", "thread 2", "Y -> X"],
      ],
      [
        ["t1", "lx", "tryLock X", "Thread 1 acquires X and then tries Y with a 10 ms timeout."],
        ["t2", "ly", "tryLock Y", "Thread 2 has already acquired Y and now tries X."],
        ["t1", "ly", "timeout", "Thread 1 cannot get Y in time, so instead of waiting forever it fails."],
        ["t1", "lx", "release, back off", "It releases X and sleeps a random moment, breaking hold-and-wait."],
        ["t2", "lx", "gets X", "Thread 2 now acquires X, completes its transfer and releases both locks."],
      ],
    ],
    mistakes: [
      "Retrying tryLock immediately without a random back-off. Both threads can then repeat the same collision forever (livelock).",
      "Mixing signalling styles, for example waiting on one object and notifying another.",
      "Using a volatile counter instead of AtomicInteger for increments.",
    ],
    qa: [
      [
        "What is a livelock?",
        "Threads are not blocked but keep reacting to each other without making progress, like two people stepping aside in the same direction. Random back-off breaks the symmetry.",
      ],
      [
        "Is BlockingQueue.put fair?",
        "ArrayBlockingQueue can be constructed fair (`new ArrayBlockingQueue<>(n, true)`), so blocked threads are served in FIFO order. The default is unfair, which gives higher throughput.",
      ],
      [
        "How does lock ordering avoid deadlock for transfers?",
        "Always lock the account with the smaller id first, whatever the direction of the transfer. Every thread then requests the locks in the same global order, so a cycle cannot form.",
      ],
    ],
    ex: [
      "Rewrite `transfer` without tryLock, using lock ordering by account id, so that opposite transfers still never deadlock.",
      "`Account first = from.id.compareTo(to.id) < 0 ? from : to; Account second = first == from ? to : from; synchronized (first) { synchronized (second) { from.balance -= amount; to.balance += amount; } }`. Every transfer between X and Y locks X before Y.",
    ],
  }),

  lesson("Threads Q21-Q31: Thread Dumps, Life Cycle, Scheduling, Daemons, Deprecated Methods, sleep and yield", {
    intro:
      "Questions 21 to 31 cover:\n\n- how to take thread dumps\n- the thread life cycle and its states\n- preemptive scheduling and time slicing\n- daemon threads\n- why suspend, resume, stop and destroy are deprecated\n- how to stop an infinite thread without `stop()`\n- the effect of yield and sleep on thread state\n- wait vs sleep, and yield vs sleep\n\nThe program takes a thread dump of itself and stops an infinite loop cleanly with interruption.",
    topics: [
      [
        "Q21. How do you generate and analyse thread dumps?",
        "A thread dump lists every thread with its name, state, stack trace and the locks it holds or waits for. Ways to take one:\n\n- `jstack <pid>`\n- `jcmd <pid> Thread.print`\n- `kill -3 <pid>` on Unix, which prints to the process's stdout\n- Ctrl+Break in a Windows console\n- VisualVM or JMC\n- programmatically, through `Thread.getAllStackTraces()` or `ThreadMXBean.dumpAllThreads(true, true)`\n- for virtual threads, `jcmd <pid> Thread.dump_to_file -format=json file`\n\nTo analyse it, look for BLOCKED threads and the monitor they wait for, a \"Found one Java-level deadlock\" section, many threads stuck in the same frame (a hot spot or slow dependency), and thread-pool exhaustion. Take three dumps a few seconds apart to see what is truly stuck.",
      ],
      [
        "Q22. What are the thread life-cycle states?",
        "Textbooks describe **New → Runnable → Running → Waiting/Blocked → Dead**. Java's `Thread.State` enum has six values:\n\n- **NEW**: constructed, `start()` not yet called.\n- **RUNNABLE**: ready or running. Java does not separate running from ready-to-run.\n- **BLOCKED**: waiting to acquire a monitor.\n- **WAITING**: `wait()`, `join()` or `park()` with no timeout.\n- **TIMED_WAITING**: `sleep`, `wait(ms)`, `join(ms)` or `parkNanos`.\n- **TERMINATED**: `run()` has ended, normally or through an exception.\n\nA thread moves between RUNNABLE and the three waiting states many times, but NEW and TERMINATED happen exactly once.",
      ],
      [
        "Q23. What are preemptive scheduling and time slicing?",
        "With **preemptive scheduling**, the scheduler can interrupt a running thread at any moment to run another, for example a higher-priority thread or a thread whose I/O has just completed, without the running thread's cooperation. With **time slicing** (round-robin), each runnable thread of the same priority gets a fixed quantum of CPU time and then goes back into the queue. Modern OSes combine both, and the JVM maps Java platform threads to OS threads, so Java inherits OS scheduling. Thread priorities are only hints. Virtual threads, by contrast, are scheduled cooperatively by the JVM: they yield at blocking operations.",
      ],
      [
        "Q24. What are daemon threads?",
        "A daemon thread is a background service thread that **does not keep the JVM alive**. When only daemon threads remain, the JVM exits, abandoning them mid-work: their finally blocks do not run. Set it with `setDaemon(true)` **before** `start()`, or get IllegalThreadStateException. New threads inherit the daemon status of the thread that creates them. GC, JIT and housekeeping threads are daemons, and virtual threads are always daemons. Use daemons for optional background work, such as cache refreshers and monitoring, never for work that must finish, such as saving data.",
      ],
      [
        "Q25. Why are suspend() and resume() deprecated?",
        "`suspend()` freezes a thread **while it keeps all the monitors it holds**. If the thread that is supposed to call `resume()` needs one of those locks first, both are stuck forever, a deadlock that is very easy to cause. A suspended thread also shows up as RUNNABLE in dumps, which hides the problem. Both methods were deprecated in Java 1.2 and deprecated for removal in Java 14. JDK 20 made them throw UnsupportedOperationException, and JDK 23 removed them. Use a cooperative flag together with wait/notify or `LockSupport.park` and `unpark`.",
      ],
      [
        "Q26. Why is destroy() deprecated?",
        "`destroy()` was meant to kill a thread instantly **without any cleanup**, and it would have left all its monitors permanently locked. That is just as deadlock-prone as `suspend()`, or worse. It was never even implemented: it always threw NoSuchMethodError and later UnsupportedOperationException. It was deprecated in 1.5 and removed in Java 11. `stop()` (deprecated, throwing UnsupportedOperationException since Java 20, and absent from the newest JDKs) is unsafe for the opposite reason: it releases all locks abruptly through ThreadDeath, which can leave objects in an inconsistent state.",
      ],
      [
        "Q27. How do you stop a thread running an infinite loop without stop()?",
        "Use **cooperative cancellation**:\n\n1. A `volatile boolean running` flag that the loop checks, which another thread sets to false.\n2. Better, **interruption**: loop `while (!Thread.currentThread().isInterrupted())` and call `thread.interrupt()` from outside. Blocking calls such as `sleep`, `wait`, `join` and `BlockingQueue.take` respond by throwing InterruptedException. Catch it, clean up, and exit (or restore the flag).\n3. With executors, `future.cancel(true)` or `executor.shutdownNow()` send the interrupt.\n\nThe thread then finishes its current step, releases its resources normally and terminates.",
      ],
      [
        "Q28. What does yield() do, and what state does it leave the thread in?",
        "`Thread.yield()` hints to the scheduler that the current thread is willing to give up its current use of the CPU, so that other runnable threads (typically of the same priority) can run. The thread **stays RUNNABLE**: it is only moved back into the ready queue. The scheduler may ignore the hint, and the thread may be picked again immediately. It does not release locks. Its behaviour is platform-dependent and it is rarely useful in application code. For spin loops, `Thread.onSpinWait()` is the better hint.",
      ],
      [
        "Q29. What does sleep() do, and what state does it leave the thread in?",
        "`Thread.sleep(ms)` pauses the **current** thread for at least the given time. The thread is in **TIMED_WAITING** during the sleep and returns to RUNNABLE when it ends, after which it must still be scheduled. It does **not release any locks** it holds. It throws InterruptedException if the thread is interrupted while sleeping. `Thread.sleep(Duration)` exists since Java 19. Sleeping inside synchronized code blocks every other thread that needs the same lock.",
      ],
      [
        "Q30. What is the difference between wait() and sleep()?",
        "- **Owner**: `wait` is an instance method of Object, while `sleep` is a static method of Thread.\n- **Lock**: `wait` must be called while holding the monitor and **releases it**, while `sleep` can be called anywhere and **keeps** any locks.\n- **Wake-up**: `wait` ends on notify, notifyAll, a timeout, an interrupt or a spurious wake-up, and must re-acquire the lock before continuing. `sleep` ends on its timeout or an interrupt.\n- **Purpose**: `wait` is for inter-thread coordination, while `sleep` is for pausing.\n- **State**: `wait()` is WAITING and `wait(ms)` is TIMED_WAITING; `sleep` is TIMED_WAITING.",
      ],
      [
        "Q31. What is the difference between yield() and sleep()?",
        "`yield()` is only a hint. The thread remains RUNNABLE, may continue immediately, and its effect is unpredictable. `sleep(ms)` definitely suspends the thread for at least that time, in TIMED_WAITING, so other threads, including lower-priority ones, get the CPU. `sleep` throws InterruptedException and `yield` does not. Neither releases monitors. `sleep(0)` is similar to yield on some platforms.",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // Q21: a programmatic thread dump of selected threads.
        Object lock = new Object();
        CountDownLatch holding = new CountDownLatch(1);
        Thread holder = new Thread(() -> { synchronized (lock) { holding.countDown(); pause(300); } }, "lock-holder");
        Thread waiter = new Thread(() -> { synchronized (lock) { } }, "lock-waiter");
        holder.start(); holding.await(); waiter.start();
        while (waiter.getState() != Thread.State.BLOCKED) Thread.onSpinWait();
        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        for (ThreadInfo info : mx.getThreadInfo(new long[] {holder.threadId(), waiter.threadId()}, true, true)) {
            String lockInfo = info.getLockName() == null ? "" : " on " + info.getLockName().replaceAll("@.*", "") + " owned by " + info.getLockOwnerName();
            System.out.println("Q21 dump: \"" + info.getThreadName() + "\" " + info.getThreadState() + lockInfo);
        }
        holder.join(); waiter.join();

        // Q22: walk one thread through NEW, TIMED_WAITING, WAITING and TERMINATED.
        Object monitor = new Object();
        Thread life = new Thread(() -> {
            pause(100);                                                   // TIMED_WAITING
            synchronized (monitor) { try { monitor.wait(); } catch (InterruptedException ignored) { } } // WAITING
        });
        List<Thread.State> states = new ArrayList<>(List.of(life.getState()));
        life.start();
        while (life.getState() != Thread.State.TIMED_WAITING) Thread.onSpinWait();
        states.add(life.getState());
        while (life.getState() != Thread.State.WAITING) Thread.onSpinWait();
        states.add(life.getState());
        synchronized (monitor) { monitor.notify(); }
        life.join();
        states.add(life.getState());
        System.out.println("Q22 states observed: " + states);

        // Q24: a daemon is abandoned at exit; it must be marked before start.
        Thread daemon = new Thread(() -> { while (true) pause(1000); }, "background");
        daemon.setDaemon(true);
        daemon.start();
        Thread userThread = new Thread(() -> { });
        System.out.println("Q24 background isDaemon " + daemon.isDaemon() + ", default for new thread " + userThread.isDaemon()
                + ", virtual threads are daemons " + Thread.ofVirtual().unstarted(() -> { }).isDaemon());

        // Q25 + Q26: the deprecated methods are gone in practice.
        try { daemon.suspend(); } catch (UnsupportedOperationException | NoSuchMethodError e) {
            System.out.println("Q25 suspend() is unusable: throws (JDK 20-22) or removed (JDK 23+)");   // compiled against Java 21
        }
        try { daemon.stop(); } catch (UnsupportedOperationException | NoSuchMethodError e) {
            System.out.println("Q26 stop() is unusable as well; destroy() was removed in Java 11");
        }

        // Q27: stop an infinite loop with interruption.
        Thread infinite = new Thread(() -> {
            long iterations = 0;
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    iterations++;
                    Thread.sleep(5);                                       // blocking call responds to interrupt
                }
            } catch (InterruptedException e) {
                System.out.println("Q27 interrupted during sleep, cleaning up and exiting");
            }
        });
        infinite.start();
        Thread.sleep(50);
        infinite.interrupt();
        infinite.join();
        System.out.println("Q27 thread state after interrupt: " + infinite.getState());

        // Q28 + Q29 + Q31: yield keeps RUNNABLE, sleep is TIMED_WAITING.
        Thread.yield();
        Thread sleeper = new Thread(() -> pause(200));
        sleeper.start();
        while (sleeper.getState() != Thread.State.TIMED_WAITING) Thread.onSpinWait();
        System.out.println("Q28 main after yield: " + Thread.currentThread().getState() + " | Q29 sleeping thread: " + sleeper.getState());
        sleeper.join();

        // Q30: wait releases the monitor, sleep keeps it.
        Object shared = new Object();
        Thread waits = new Thread(() -> { synchronized (shared) { try { shared.wait(200); } catch (InterruptedException ignored) { } } });
        waits.start();
        while (waits.getState() != Thread.State.TIMED_WAITING) Thread.onSpinWait();
        boolean gotLockWhileWaiting;
        synchronized (shared) { gotLockWhileWaiting = true; }             // possible because wait released it
        waits.join();
        System.out.println("Q30 main acquired the monitor while the other thread was in wait(): " + gotLockWhileWaiting);
    }

    static void pause(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
}`,
    walk:
      "Q21 creates a lock-holder and a lock-waiter, then asks ThreadMXBean for their ThreadInfo, exactly what a thread dump contains. The waiter is BLOCKED on an Object monitor owned by lock-holder, which is the kind of line you search for in real dumps. For Q22 one thread is observed in NEW, then TIMED_WAITING (sleeping), then WAITING (in `wait()`), and finally TERMINATED after main notifies it.\n\nQ24 shows that a daemon flag must be set explicitly, that new threads are not daemons by default, and that virtual threads always are. On current JDKs, `suspend()` and `stop()` either throw UnsupportedOperationException or no longer exist at all. The program is compiled against Java 21's API, so it catches both outcomes (Q25, Q26). Q27 stops an endless loop with `interrupt()`: the sleeping thread gets InterruptedException, cleans up and terminates. Q28 and Q29 compare yield (still RUNNABLE) with sleep (TIMED_WAITING). Q30 proves that `wait(200)` releases the monitor, because main can enter `synchronized (shared)` while the other thread is waiting.",
    anim: [
      "Thread.State transitions",
      [
        ["new", "NEW", "created"],
        ["run", "RUNNABLE", "ready/running"],
        ["blk", "BLOCKED", "monitor wait"],
        ["wait", "WAITING / TIMED", "wait, sleep, join"],
        ["term", "TERMINATED", "run() ended"],
      ],
      [
        ["new", "run", "start()", "start() moves the thread from NEW to RUNNABLE exactly once."],
        ["run", "blk", "synchronized", "Trying to enter a monitor held by another thread makes it BLOCKED."],
        ["blk", "run", "lock acquired", "When the monitor is released and won, the thread is RUNNABLE again."],
        ["run", "wait", "sleep/wait/join", "sleep or timed wait gives TIMED_WAITING; wait() or join() gives WAITING."],
        ["run", "term", "run() returns", "When run() returns or throws, the thread is TERMINATED for good."],
      ],
    ],
    mistakes: [
      "Using `stop()`, `suspend()` or `destroy()`. They are unsafe and no longer work.",
      "Catching InterruptedException and ignoring it inside a loop, which makes the thread impossible to stop.",
      "Saving important data from a daemon thread, which may be killed mid-write at JVM exit.",
    ],
    qa: [
      [
        "What is the difference between `interrupted()` and `isInterrupted()`?",
        "`Thread.interrupted()` is static: it checks the current thread **and clears** the flag. `t.isInterrupted()` checks any thread without clearing.",
      ],
      [
        "Does `interrupt()` stop a thread?",
        "No. It only sets a flag and wakes the thread from blocking calls with InterruptedException. The thread's own code decides to stop.",
      ],
      [
        "Which threads exist in every JVM?",
        "main, plus system daemon threads such as Reference Handler, Finalizer, Signal Dispatcher, Common-Cleaner, the GC and JIT compiler threads, and Attach Listener when tools connect.",
      ],
    ],
    ex: [
      "A worker loops `while (true) { Task t = queue.take(); process(t); }`. Make it stoppable from another thread without any flag variable.",
      "Loop `while (!Thread.currentThread().isInterrupted())` and catch InterruptedException around `take()`: `catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }`. Stop it with `worker.interrupt()`. A blocked `take()` throws immediately, and the loop exits.",
    ],
  }),
];
