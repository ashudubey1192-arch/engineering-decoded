import { lesson } from "../../schema.js";

// Concurrency and parallelism interview questions, extra set Q101-Q120.
export default [
  lesson("Concurrency and Parallelism Q101-Q110: Thread States, Critical Sections, Creating Threads and Concurrency Models", {
    intro:
      "The extra questions start by filling in foundations that interviews often probe directly:\n\n- the six thread states and what moves a thread between them\n- the critical-section problem, its three requirements, and Peterson's algorithm\n- every way to create a thread in modern Java\n- concurrency models: shared memory, message passing, actors, CSP channels and event loops\n- how Java compares with Python's GIL, Go's goroutines and async/await\n- thread leakage, and a guided tour of java.util.concurrent\n\nThe program drives one thread through every `Thread.State`, protects a counter with Peterson's algorithm, creates threads six different ways, and builds a tiny actor and a channel pipeline.",
    topics: [
      [
        "Q101. What are the thread states in Java, and what causes each transition?",
        "`Thread.getState()` returns one of six `Thread.State` values:\n\n1. **NEW**: created but `start()` not yet called.\n2. **RUNNABLE**: started and either running or ready to run. Java does not distinguish \"running\" from \"ready\", and a thread blocked in native socket I/O also shows as RUNNABLE.\n3. **BLOCKED**: waiting to enter a `synchronized` block or method whose monitor another thread holds.\n4. **WAITING**: waiting indefinitely, through `Object.wait()`, `Thread.join()` or `LockSupport.park()`. Threads waiting on a ReentrantLock, CountDownLatch or BlockingQueue are WAITING (they park), not BLOCKED.\n5. **TIMED_WAITING**: the same with a timeout, through `sleep(ms)`, `wait(ms)`, `join(ms)`, `parkNanos` or a timed `await`.\n6. **TERMINATED**: `run()` returned or threw.\n\nA terminated thread can never be restarted; calling `start()` twice throws IllegalThreadStateException. In a thread dump, many BLOCKED threads on one monitor indicate lock contention, while many WAITING threads usually mean idle pools or threads waiting for work.",
      ],
      [
        "Q102. What is the critical-section problem, and what are its three requirements?",
        "A **critical section** is a piece of code that accesses shared state and must not be executed by more than one thread at a time. A correct solution must satisfy:\n\n1. **Mutual exclusion**: at most one thread is inside the critical section at any time.\n2. **Progress**: if no thread is inside and some want to enter, one of them must be allowed in within finite time; threads outside cannot block the decision.\n3. **Bounded waiting**: there is a limit on how many times other threads can enter ahead of a waiting thread, so nobody starves.\n\n**Peterson's algorithm** solves it for two threads using only reads and writes: each thread sets its own `flag` to true, gives the `turn` to the other, and then spins while the other's flag is set and it is the other's turn. In Java the fields must be `volatile`, because the algorithm depends on sequentially consistent ordering. In practice you use a lock, which also parks waiting threads instead of spinning.",
        "flag[me] = true; turn = other;\nwhile (flag[other] && turn == other) Thread.onSpinWait();\n// critical section\nflag[me] = false;",
      ],
      [
        "Q103. What are the ways to create and start a thread in Java?",
        "1. **Extend Thread** and override `run()`. Simple, but uses up your single superclass and mixes the task with the mechanism.\n2. **Implement Runnable** and pass it to `new Thread(runnable)`. Preferred over extending Thread, and works with lambdas.\n3. **Callable with FutureTask**: `new Thread(new FutureTask<>(callable))`, when you need a result or a checked exception.\n4. **An ExecutorService**: `submit` or `execute`. The usual choice in real code, because threads are reused and managed.\n5. **The Thread builders** (Java 21): `Thread.ofPlatform().name(\"w-\", 0).start(task)` and `Thread.ofVirtual().start(task)`, or `Thread.startVirtualThread(task)`.\n6. **CompletableFuture.runAsync and supplyAsync**, Fork/Join tasks and parallel streams create work that runs on pool threads.\n\nAlways call `start()`, not `run()`: `run()` just executes the task on the current thread. Give threads meaningful names; they appear in logs and dumps.",
      ],
      [
        "Q104. What are the main concurrency models?",
        "- **Shared memory with locks**: threads read and write the same objects, coordinated by locks, volatile and atomics. This is Java's default model. It is fast, but correctness depends on discipline.\n- **Message passing**: threads (or processes) own their state and communicate only by sending messages over queues. No shared mutable state means no data races. Examples are actors, CSP channels and microservices.\n- **Event loop (reactor)**: one thread (or a few) runs non-blocking handlers for events from a queue; I/O is asynchronous. Node.js, Netty, Vert.x and browser JavaScript work this way. It handles many connections with few threads, but any blocking call stalls everything.\n- **Fork/join data parallelism**: split the data, process the pieces independently and combine.\n- **Software transactional memory**: memory updates run as transactions that retry on conflict (Clojure's refs).\n\nModern Java mixes them: shared memory by default, BlockingQueues for message passing, CompletableFuture or reactive libraries for event-driven code, and virtual threads to keep the simple blocking style at scale.",
      ],
      [
        "Q105. What is the actor model, and how can you build an actor in Java?",
        "An **actor** is an object that:\n\n1. owns **private state** that no other thread touches\n2. has a **mailbox** (a queue of messages)\n3. processes **one message at a time**, so its state needs no locks\n4. reacts to a message by updating its state, sending messages to other actors, or creating actors\n\nBecause only the actor's own thread ever touches its state, there are no races inside it; concurrency comes from many actors running at once. Erlang and Akka (Pekko) are built on it, and errors are handled by supervisors that restart failed actors.\n\nA minimal Java actor is a class with a `BlockingQueue` mailbox and a single thread that drains it, or simply a **single-threaded executor** that owns the state: `send(msg)` becomes `executor.execute(() -> handle(msg))`. Ask-style replies can return a CompletableFuture. Trade-offs: messages are asynchronous, so request-reply flows need more code, and an actor whose mailbox grows faster than it drains needs back-pressure.",
      ],
      [
        "Q106. What is CSP, and how do channels map to Java?",
        "**Communicating Sequential Processes** (Tony Hoare, 1978) models a program as independent sequential processes that communicate only through **channels**. Go is the best-known language built on it: goroutines plus `chan`, with the motto \"do not communicate by sharing memory; share memory by communicating\".\n\nThe Java equivalents:\n\n- an **unbuffered channel** (send waits for a receiver) maps to `SynchronousQueue`\n- a **buffered channel** maps to `ArrayBlockingQueue(n)`\n- closing a channel maps to sending a **poison pill** (a sentinel value) or using a shared flag\n- Go's `select` over several channels has no direct equivalent; use one queue of tagged messages, or `poll` with timeouts\n\nA **pipeline** (generator, then transform, then sink) connected by queues is the classic CSP pattern. Each stage is simple sequential code, and the queues provide both synchronization and back-pressure. With virtual threads, a stage per thread is cheap, which makes this style practical in Java.",
      ],
      [
        "Q107. How does an event loop work, and how is async/await different from threads?",
        "An **event loop** is a single thread running `while (true) { event = queue.take(); handler(event); }`. I/O is non-blocking: you start an operation and register a callback, and when the OS reports completion, the callback is queued as a new event. As long as every handler is short and never blocks, one thread can serve thousands of connections.\n\n**async/await** (C#, JavaScript, Python, Kotlin's suspend functions) is syntax that lets you write sequential-looking code while the compiler splits each function into a state machine at every `await`; the continuation runs later, on the event loop or a pool thread. It is **cooperative**: a function yields only at awaits, and anything CPU-heavy between awaits blocks the loop. It also \"colors\" functions: async code can only be awaited from other async code.\n\nJava's answer was CompletableFuture and reactive libraries, and since Java 21 **virtual threads**, which give the same scalability with ordinary blocking code and no function coloring: the JVM suspends the virtual thread at a blocking call instead of the compiler rewriting the method.",
      ],
      [
        "Q108. How does Java's concurrency compare with Python, Go, C++ and C#?",
        "- **Python (CPython)**: the **Global Interpreter Lock** lets only one thread execute Python bytecode at a time, so threads help with I/O but not CPU-bound work; CPU parallelism uses `multiprocessing`. Python 3.13 added an experimental free-threaded build without the GIL. `asyncio` provides an event loop with async/await.\n- **Go**: **goroutines** are lightweight, scheduled by Go's runtime onto OS threads (M:N), and communicate through channels; the `sync` package adds mutexes and WaitGroups. Java's virtual threads take a similar approach.\n- **C++**: `std::thread`, `std::mutex` with RAII guards (`lock_guard`, `scoped_lock`), `std::atomic` with explicit **memory orders** (relaxed, acquire, release, seq_cst) and `std::async` and futures. More control, and more ways to get undefined behaviour.\n- **C#**: `lock` (Monitor), the Task Parallel Library, async/await, and Channels.\n\nJava's distinguishing points are a precise **memory model** that every JVM follows, a very rich standard library (java.util.concurrent), true parallel threads without a GIL, and virtual threads for scale.",
      ],
      [
        "Q109. What is thread leakage, and how do you prevent it?",
        "Thread leakage is creating threads that are **never released**: they keep running or waiting after their work is done, so the thread count grows until memory, file handles or the OS thread limit run out (`OutOfMemoryError: unable to create native thread`). Common causes:\n\n- creating a new `ExecutorService` per request and never shutting it down\n- threads blocked forever on a queue `take()`, a lock or a socket with no timeout\n- long-running loops with no exit condition or interrupt check\n- non-daemon threads keeping the JVM alive after main ends\n- ThreadLocal values or listeners that keep a thread's resources reachable\n\nPrevention: share long-lived executors and shut them down on application stop (or use try-with-resources with `close()`), set timeouts on every blocking call, make tasks respond to interruption, name threads so a dump shows who created them, and monitor the thread count (`ThreadMXBean.getThreadCount()`) in production.",
      ],
      [
        "Q110. What are the main parts of the java.util.concurrent package?",
        "A quick tour, useful for \"what would you use for ...?\" questions:\n\n1. **Executors**: `Executor`, `ExecutorService`, `ThreadPoolExecutor`, `ScheduledThreadPoolExecutor`, `ForkJoinPool`, the `Executors` factories, and `CompletableFuture` and `Future`.\n2. **Locks** (`java.util.concurrent.locks`): `ReentrantLock`, `ReentrantReadWriteLock`, `StampedLock`, `Condition`, `LockSupport`, and `AbstractQueuedSynchronizer`, the framework most synchronizers are built on.\n3. **Atomics** (`java.util.concurrent.atomic`): `AtomicInteger`, `AtomicLong`, `AtomicReference`, the array and field-updater classes, the stamped and markable references, `LongAdder` and the accumulators.\n4. **Synchronizers**: `CountDownLatch`, `CyclicBarrier`, `Phaser`, `Semaphore`, `Exchanger`.\n5. **Concurrent collections**: `ConcurrentHashMap`, `ConcurrentSkipListMap` and `ConcurrentSkipListSet`, `CopyOnWriteArrayList` and `CopyOnWriteArraySet`, `ConcurrentLinkedQueue` and `ConcurrentLinkedDeque`, and the `BlockingQueue` and `TransferQueue` implementations.\n6. **Utilities**: `TimeUnit`, `ThreadLocalRandom`, and the `Flow` interfaces for reactive streams (Java 9).\n\nThe outside pieces are `Thread` and its builders, `ThreadLocal`, `ScopedValue` and `StructuredTaskScope` in `java.lang` and `java.util.concurrent`.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    // Q102: Peterson's algorithm - volatile gives the sequential consistency it needs.
    static volatile boolean flag0, flag1;
    static volatile int turn;
    static int shared;                                  // protected by Peterson's lock

    static void enter(int me) {
        if (me == 0) { flag0 = true; turn = 1; while (flag1 && turn == 1) Thread.onSpinWait(); }
        else         { flag1 = true; turn = 0; while (flag0 && turn == 0) Thread.onSpinWait(); }
    }
    static void exit(int me) { if (me == 0) flag0 = false; else flag1 = false; }

    // Q105: an actor - private state, a mailbox, one message at a time.
    static final class CounterActor {
        private final ExecutorService mailbox = Executors.newSingleThreadExecutor();
        private int count;                              // touched only by the mailbox thread
        void send(int delta) { mailbox.execute(() -> count += delta); }
        CompletableFuture<Integer> ask() { return CompletableFuture.supplyAsync(() -> count, mailbox); }
        void stop() { mailbox.close(); }
    }

    static void waitFor(Thread t, Thread.State state) throws InterruptedException {
        for (int i = 0; i < 2000 && t.getState() != state; i++) Thread.sleep(1);
    }

    public static void main(String[] args) throws Exception {
        // Q101: drive threads through every state.
        List<Thread.State> states = new ArrayList<>();
        Object monitor = new Object();
        CountDownLatch never = new CountDownLatch(1);
        Thread blocked = new Thread(() -> { synchronized (monitor) { } });
        Thread waiting = new Thread(() -> { try { never.await(); } catch (InterruptedException e) { } });
        Thread sleeping = new Thread(() -> { try { Thread.sleep(10_000); } catch (InterruptedException e) { } });
        states.add(blocked.getState());                                     // NEW
        synchronized (monitor) {
            blocked.start();
            waitFor(blocked, Thread.State.BLOCKED);
            states.add(Thread.currentThread().getState());                 // main: RUNNABLE
            states.add(blocked.getState());                                 // BLOCKED on our monitor
        }
        waiting.start(); waitFor(waiting, Thread.State.WAITING); states.add(waiting.getState());
        sleeping.start(); waitFor(sleeping, Thread.State.TIMED_WAITING); states.add(sleeping.getState());
        blocked.join(); states.add(blocked.getState());                     // TERMINATED
        waiting.interrupt(); sleeping.interrupt(); waiting.join(); sleeping.join();
        System.out.println("Q101 states observed: " + states);

        // Q102: two threads, 50,000 entries each, guarded only by Peterson's algorithm.
        Thread p0 = new Thread(() -> { for (int i = 0; i < 50_000; i++) { enter(0); shared++; exit(0); } });
        Thread p1 = new Thread(() -> { for (int i = 0; i < 50_000; i++) { enter(1); shared++; exit(1); } });
        p0.start(); p1.start(); p0.join(); p1.join();
        System.out.println("Q102 Peterson's algorithm kept mutual exclusion: shared = " + shared);

        // Q103: six ways to get code running on another thread.
        List<String> ways = new CopyOnWriteArrayList<>();
        Thread subclass = new Thread() { @Override public void run() { ways.add("extends Thread"); } };
        Thread withRunnable = new Thread(() -> ways.add("Runnable"));
        FutureTask<String> futureTask = new FutureTask<>(() -> "Callable + FutureTask");
        Thread withCallable = new Thread(futureTask);
        for (Thread t : List.of(subclass, withRunnable, withCallable)) { t.start(); t.join(); }
        ways.add(futureTask.get());
        try (ExecutorService pool = Executors.newSingleThreadExecutor()) { pool.submit(() -> ways.add("ExecutorService")).get(); }
        Thread.ofPlatform().name("builder").start(() -> ways.add("Thread.ofPlatform()")).join();
        Thread.ofVirtual().start(() -> ways.add("Thread.ofVirtual()")).join();
        System.out.println("Q103 " + ways);

        // Q105: actor - 1,000 concurrent sends, no lock on count.
        CounterActor actor = new CounterActor();
        try (ExecutorService senders = Executors.newFixedThreadPool(4)) {
            for (int i = 0; i < 1_000; i++) senders.execute(() -> actor.send(1));
        }
        System.out.println("Q105 actor processed every message one at a time: count = " + actor.ask().get());
        actor.stop();

        // Q106: CSP pipeline - generator -> squarer -> sink, connected by channels.
        SynchronousQueue<Integer> numbers = new SynchronousQueue<>();     // unbuffered channel
        ArrayBlockingQueue<Integer> squares = new ArrayBlockingQueue<>(2); // buffered channel
        int poison = -1;
        Thread generator = Thread.ofVirtual().start(() -> {
            try { for (int i = 1; i <= 5; i++) numbers.put(i); numbers.put(poison); } catch (InterruptedException e) { }
        });
        Thread squarer = Thread.ofVirtual().start(() -> {
            try { for (int n; (n = numbers.take()) != poison; ) squares.put(n * n); squares.put(poison); } catch (InterruptedException e) { }
        });
        List<Integer> sink = new ArrayList<>();
        for (int s; (s = squares.take()) != poison; ) sink.add(s);
        generator.join(); squarer.join();
        System.out.println("Q106 pipeline over channels produced " + sink);

        // Q107: an event loop - one thread, a queue of events, short handlers.
        BlockingQueue<String> events = new LinkedBlockingQueue<>(List.of("connect", "read", "write", "close", "STOP"));
        List<String> handled = new ArrayList<>();
        Thread loop = new Thread(() -> {
            try { for (String e; !(e = events.take()).equals("STOP"); ) handled.add("handled " + e); } catch (InterruptedException ex) { }
        }, "event-loop");
        loop.start(); loop.join();
        System.out.println("Q107 event loop: " + handled);

        // Q109: threads from an executor that is never shut down stay alive (leak).
        AtomicInteger created = new AtomicInteger();
        List<Thread> made = new CopyOnWriteArrayList<>();
        ThreadFactory tracking = r -> { Thread t = new Thread(r, "leaky-" + created.incrementAndGet()); made.add(t); return t; };
        ExecutorService leaky = Executors.newFixedThreadPool(3, tracking);
        for (int i = 0; i < 3; i++) leaky.submit(() -> { }).get();
        long aliveBefore = made.stream().filter(Thread::isAlive).count();
        leaky.shutdown();
        leaky.awaitTermination(2, TimeUnit.SECONDS);
        for (Thread t : made) t.join(1000);                         // let exiting workers finish
        long aliveAfter = made.stream().filter(Thread::isAlive).count();
        System.out.println("Q109 idle pool threads alive before shutdown: " + aliveBefore + ", after shutdown: " + aliveAfter);
    }
}`,
    walk:
      "Q101 holds the monitor on main while `blocked` tries to enter it, so that thread shows BLOCKED; `waiting` parks on a latch (WAITING), `sleeping` is in `sleep` (TIMED_WAITING), and after main releases the monitor, `blocked` finishes and is TERMINATED. Main itself is RUNNABLE. The helper polls `getState()` because the state change happens asynchronously.\n\nIn Q102 two threads increment a plain `int` 50,000 times each, protected only by Peterson's two volatile flags and the volatile turn, and the result is exactly 100,000.\n\nQ103 starts code six ways and records each. Q105 sends 1,000 increments from four threads to an actor whose state is touched only by its single mailbox thread; the reply, read through the mailbox too, is 1,000. Q106 connects three stages with an unbuffered and a buffered channel and ends them with a poison pill, producing the squares in order. Q107 runs a one-thread event loop until a STOP event. Q109 shows the three worker threads of an idle fixed pool still alive until `shutdown`, after which none remain.",
    anim: [
      "Peterson's algorithm for two threads",
      [
        ["t0", "Thread 0", "flag0 = true"],
        ["turn", "turn", "shared volatile"],
        ["t1", "Thread 1", "flag1 = true"],
        ["cs", "Critical section", "one at a time"],
      ],
      [
        ["t0", "turn", "turn = 1", "Thread 0 raises its flag and politely gives the turn to thread 1."],
        ["t1", "turn", "turn = 0", "Thread 1 does the same a moment later; the LAST writer of turn is the one that waits."],
        ["t0", "cs", "enters", "Thread 0 sees turn == 0, so its loop condition is false and it enters the critical section."],
        ["t1", "turn", "spins", "Thread 1 spins: flag0 is true and turn is 0, so it is thread 0's turn."],
        ["cs", "t1", "flag0 = false", "Thread 0 leaves and lowers its flag; thread 1's loop ends and it enters. Mutual exclusion and bounded waiting hold."],
      ],
    ],
    mistakes: [
      "Calling `thread.run()` instead of `start()`. The task runs on the current thread and no new thread is created.",
      "Expecting a thread waiting on a ReentrantLock to show BLOCKED. It parks, so it shows WAITING or TIMED_WAITING.",
      "Implementing Peterson's algorithm with non-volatile fields. Reordering breaks mutual exclusion.",
      "Creating a new ExecutorService per request without shutting it down, which leaks threads.",
    ],
    qa: [
      [
        "Why does a thread doing blocking socket I/O show as RUNNABLE?",
        "Thread.State only reflects JVM-level waiting (monitors, park, sleep). A platform thread blocked inside a native read syscall is still RUNNABLE from the JVM's point of view, so a RUNNABLE thread in a dump is not necessarily using CPU.",
      ],
      [
        "Does Peterson's algorithm scale to many threads?",
        "Not directly. The filter algorithm and Lamport's bakery algorithm generalize it to N threads, but they spin and need O(N) shared variables. Real locks use atomic instructions such as CAS plus parking.",
      ],
      [
        "Is an actor the same as a single-threaded executor?",
        "A single-threaded executor that owns some state is the core of an actor. Full actor systems add addressing, supervision and restart on failure, location transparency and mailbox management.",
      ],
    ],
    ex: [
      "Write a `Channel<T>` class with `send`, `receive` and `close`, where `receive` returns `Optional.empty()` once the channel is closed and drained.",
      "Wrap a `BlockingQueue<Optional<T>>`: `send(t)` puts `Optional.of(t)` (throwing if closed); `close()` sets a volatile closed flag and puts `Optional.empty()` as the poison pill; `receive()` takes an element and, if it is empty, puts it back so other receivers also see the end, then returns `Optional.empty()`.",
    ],
  }),

  lesson("Concurrency and Parallelism Q111-Q120: Signaling, Lost and Spurious Wake-ups, Optimistic Locking and Two-Phase Locking", {
    intro:
      "This block covers how threads **tell each other** that something happened, and the locking strategies used above single objects:\n\n- the signaling pattern, lost wake-ups and spurious wake-ups\n- LockSupport park and unpark\n- mutex vs semaphore vs monitor\n- optimistic vs pessimistic locking, and two-phase locking\n- hand-over-hand (lock coupling) locking for fine-grained structures\n- producer-consumer with poison pills, and reader-writer preference policies\n\nThe program loses a `notify()` on purpose and then fixes it with a condition flag, shows that `unpark` before `park` is not lost, resolves a version conflict optimistically, runs a two-phase-locking transaction, and builds a hand-over-hand locked sorted list.",
    topics: [
      [
        "Q111. What is the signaling pattern?",
        "Signaling means one thread **notifying** another that an event happened or a condition became true, so the second can proceed. Java tools, from low to high level:\n\n- `Object.wait()` and `notify()` or `notifyAll()` on a monitor, with a guarded condition\n- `Condition.await()` and `signal()` on a Lock\n- `Semaphore(0)`: the waiter calls `acquire()`, the signaler calls `release()`. The permit is remembered, so the order does not matter.\n- `CountDownLatch(1)`: a one-time \"go\" signal for any number of waiters\n- `LockSupport.park()` and `unpark(thread)`: a per-thread permit\n- `CompletableFuture.complete()` and the BlockingQueue `put` and `take` methods for signals that carry data\n\nThe key design question is whether the signal must be **remembered** if nobody is waiting yet. `notify()` is not remembered; a semaphore permit, a latch and an unpark permit are. That distinction is the root of the lost-wake-up bug.",
      ],
      [
        "Q112. What is a lost wake-up (lost signal), and how do you prevent it?",
        "A lost wake-up happens when the signal is sent **before** the receiver starts waiting, so it is missed and the receiver waits forever. Step by step with wait and notify:\n\n1. The consumer checks for data, finds none, and is about to call `wait()`.\n2. Before it does, the producer adds data and calls `notify()`. Nobody is waiting, so the notification vanishes.\n3. The consumer now calls `wait()` and sleeps, even though data is available.\n\nPrevention:\n\n- always pair the signal with **state**: a condition variable such as `ready` or `queue.isEmpty()` that the waiter checks\n- check and wait **under the same lock** that the signaler uses to change the state and notify: `synchronized (lock) { while (!ready) lock.wait(); }`\n- or use primitives that **remember** signals: Semaphore, CountDownLatch, `LockSupport.unpark` (which grants one permit in advance), or a BlockingQueue\n\nA related cause is using `notify()` when waiters wait for different conditions, so the one thread woken cannot proceed and the right one never wakes. `notifyAll()` or separate Conditions fix it.",
      ],
      [
        "Q113. What is a spurious wake-up, and why must wait be in a loop?",
        "A **spurious wake-up** is a thread returning from `wait()` or `Condition.await()` **without** having been notified, interrupted or timed out. The JVM specification and POSIX allow it, because it lets implementations be simpler and faster (for example, a futex wait interrupted by a signal returns without rechecking).\n\nEven without true spurious wake-ups, a woken thread cannot assume the condition still holds: between the `notifyAll()` and this thread re-acquiring the lock, **another thread may have consumed** the item, or the wake-up may have been for a different condition.\n\nSo the rule is absolute: always wait in a **while loop** that re-checks the predicate.\n\n`synchronized (lock) { while (!condition) lock.wait(); act(); }`\n\nUsing `if` instead of `while` is one of the most common bugs in hand-written producer-consumer code, and an instant red flag in interviews.",
      ],
      [
        "Q114. What do LockSupport.park and unpark do?",
        "`LockSupport` is the low-level blocking primitive that ReentrantLock, the Conditions, FutureTask and most of java.util.concurrent are built on (through AbstractQueuedSynchronizer).\n\n- Every thread has **one permit**, initially unavailable.\n- `park()` consumes the permit and returns immediately if it is available; otherwise the thread is disabled (WAITING) until the permit becomes available, it is interrupted, or it wakes spuriously.\n- `unpark(thread)` makes the permit available, at most one. If the thread is parked, it wakes; if not, its **next** `park()` returns immediately.\n\nThat ordering independence avoids the lost-wake-up problem of wait and notify. Parking also needs no monitor, and it can target a specific thread. Like wait, `park` can return spuriously, so callers re-check their condition in a loop. `parkNanos` and `parkUntil` add timeouts, and the `blocker` argument shows up in thread dumps to explain what the thread is waiting for.",
      ],
      [
        "Q115. What is the difference between a mutex, a semaphore and a monitor?",
        "- A **mutex** (mutual-exclusion lock) has an **owner**: only the thread that locked it may unlock it. It allows one thread at a time. In Java: `ReentrantLock` (also reentrant), or the monitor behind `synchronized`.\n- A **semaphore** is a **counter of permits** with no owner: any thread may release. With N permits it allows N threads at once; with 1 permit it is a binary semaphore, which can be used for mutual exclusion but also for **signaling** between threads (one releases, another acquires).\n- A **monitor** is a higher-level construct that bundles a mutex with **condition variables** and the data they protect: entering the monitor gives exclusive access, and inside you can wait for conditions. Every Java object is a monitor (`synchronized` plus `wait` and `notify`); `Lock` plus `Condition` is the explicit version.\n\nInterview summary: a mutex is for exclusion, a semaphore is for counting and signaling, and a monitor is exclusion plus waiting for conditions.",
      ],
      [
        "Q116. What is the difference between optimistic and pessimistic locking?",
        "- **Pessimistic locking** assumes conflicts are likely, so it **locks first**, then reads and modifies, then releases. Others wait. In Java that means `synchronized` or ReentrantLock; in SQL, `SELECT ... FOR UPDATE`.\n- **Optimistic locking** assumes conflicts are rare, so it **does not lock**: it reads the data with a **version** (or timestamp), computes the change, and commits only if the version is unchanged, typically `UPDATE ... SET ..., version = version + 1 WHERE id = ? AND version = ?`. If zero rows were updated, someone else won: reload and retry, or report a conflict. In Java the same idea appears as CAS, `StampedLock.tryOptimisticRead`, and JPA's `@Version`.\n\nChoose optimistic when contention is low and reads dominate: there is no blocking, no deadlock, and it works across HTTP requests where you cannot hold a lock. Choose pessimistic when conflicts are frequent, because constant retries waste work, or when a retry is expensive or impossible (an external side effect).",
      ],
      [
        "Q117. What is two-phase locking (2PL)?",
        "Two-phase locking is the classic database protocol that guarantees **serializable** transactions. Each transaction has two phases:\n\n1. **Growing phase**: it may acquire locks (shared for reads, exclusive for writes) but release none.\n2. **Shrinking phase**: once it releases its first lock, it may not acquire any more.\n\nThis guarantees that the interleaving of transactions is equivalent to some serial order. **Strict 2PL**, which almost every database uses, holds all exclusive locks until commit or abort, which also prevents other transactions from reading uncommitted data (no cascading aborts).\n\n2PL does **not** prevent deadlock: two transactions in their growing phases can each wait for the other's lock. Databases detect the cycle and abort one transaction, or use timeouts. In Java the same idea applies when one operation must update several objects atomically: acquire all the locks you need (in a global order, to avoid deadlock), do the work, then release them all.",
      ],
      [
        "Q118. What is hand-over-hand (lock coupling) locking?",
        "Hand-over-hand locking is a **fine-grained** strategy for linked structures (lists, trees): instead of one lock for the whole structure, each **node** has its own lock, and a traversal holds at most two at a time:\n\n1. Lock the head (or a sentinel node).\n2. Lock the next node, then **release the previous** one.\n3. Repeat until you reach the position to modify; you hold the predecessor and current nodes, so nobody can change the link between them.\n\nThreads working on different parts of the list proceed in parallel, unlike with a single coarse lock, and because every thread acquires locks in the same direction (head to tail), there is no deadlock. Costs: a lock operation per node visited, more memory per node, and traversals cannot overtake each other. It suits teaching and moderate concurrency; in production, `ConcurrentSkipListMap` or lock-free lists perform better. The general trade-off, coarse vs fine-grained locking, is simplicity and fewer lock operations against more parallelism.",
      ],
      [
        "Q119. How do you shut down a producer-consumer system cleanly?",
        "Consumers blocked in `take()` must be told that no more work will arrive. Options:\n\n1. **Poison pill**: after the last real item, the producer puts one special sentinel object per consumer; each consumer stops when it takes a pill. Simple and ordered, as long as you know the number of consumers (with several producers, coordinate with a latch before sending pills).\n2. **Interrupt**: `executor.shutdownNow()` interrupts consumers blocked in `take()`, which throws InterruptedException. Items still in the queue are abandoned unless you drain them.\n3. **Timed poll plus a flag**: consumers use `poll(timeout)` and exit when a volatile `done` flag is set and the queue is empty.\n\nAlso decide what happens to **in-flight items** (finish them, drain them to storage, or drop them), and bound the queue so a slow consumer applies back-pressure to producers instead of exhausting memory. With several consumers the processing order across consumers is not guaranteed; if order matters per key, route each key to the same consumer.",
      ],
      [
        "Q120. What are the reader-writer preference policies, and which does ReentrantReadWriteLock use?",
        "When readers and writers compete, the lock must choose who goes next:\n\n- **Reader preference**: new readers may enter while other readers hold the lock, even if a writer is waiting. That maximizes read throughput but can **starve writers** forever.\n- **Writer preference**: once a writer is waiting, new readers are held back. Writers get through, but readers can starve under constant writes.\n- **Fair (FIFO)**: requests are served in arrival order; a batch of consecutive readers enters together.\n\n`ReentrantReadWriteLock` in **fair** mode is FIFO. In the default **non-fair** mode it uses a heuristic that avoids indefinite writer starvation: a new reader blocks if the **first queued thread is a writer**. Note that `readLock().tryLock()` without a timeout ignores this and barges in. `StampedLock` has no preference policy and relies on optimistic reads. Pick based on the workload, and measure; a writer waiting behind a constant stream of readers is a classic production stall.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class Main {

    // Q116: a "row" with a version number, updated optimistically.
    record Row(int balance, int version) { }

    // Q118: a sorted linked list with one lock per node (hand-over-hand).
    static final class LockCoupledList {
        static final class Node {
            final int value; Node next; final ReentrantLock lock = new ReentrantLock();
            Node(int value, Node next) { this.value = value; this.next = next; }
        }
        private final Node head = new Node(Integer.MIN_VALUE, new Node(Integer.MAX_VALUE, null));
        void add(int value) {
            Node pred = head;
            pred.lock.lock();
            Node curr = pred.next;
            curr.lock.lock();
            try {
                while (curr.value < value) {          // move both locks one step forward
                    pred.lock.unlock();
                    pred = curr;
                    curr = curr.next;
                    curr.lock.lock();
                }
                pred.next = new Node(value, curr);    // we hold pred and curr: the link is ours
            } finally {
                curr.lock.unlock();
                pred.lock.unlock();
            }
        }
        List<Integer> values() {
            List<Integer> out = new ArrayList<>();
            for (Node n = head.next; n.next != null; n = n.next) out.add(n.value);
            return out;
        }
    }

    public static void main(String[] args) throws Exception {
        Object lock = new Object();

        // Q112: notify() BEFORE wait() is lost - the waiter sleeps the full timeout.
        synchronized (lock) { lock.notify(); }                     // nobody is waiting yet
        long start = System.nanoTime();
        synchronized (lock) { lock.wait(200); }                    // misses the earlier signal
        long waitedMs = (System.nanoTime() - start) / 1_000_000;
        System.out.println("Q112 notify-before-wait was lost, waiter slept the whole timeout: " + (waitedMs >= 150));

        // Q112 + Q113: the fix - signal changes STATE, and the waiter checks it in a while loop.
        boolean[] ready = {false};
        synchronized (lock) { ready[0] = true; lock.notifyAll(); }
        start = System.nanoTime();
        synchronized (lock) { while (!ready[0]) lock.wait(200); }  // condition already true: no wait
        System.out.println("Q113 guarded wait returned immediately: " + ((System.nanoTime() - start) / 1_000_000 < 150));

        // Q114: unpark BEFORE park is remembered as a permit.
        Thread self = Thread.currentThread();
        LockSupport.unpark(self);
        start = System.nanoTime();
        LockSupport.parkNanos(2_000_000_000L);
        System.out.println("Q114 park after an early unpark returned at once: " + ((System.nanoTime() - start) / 1_000_000 < 1_000));

        // Q111 + Q115: a Semaphore(0) is a remembered signal; release may come first.
        Semaphore signal = new Semaphore(0);
        signal.release();                                           // signal before anyone waits
        System.out.println("Q111 Semaphore signal sent early still delivered: " + signal.tryAcquire(1, TimeUnit.SECONDS));

        // Q116: optimistic locking - both read version 1, only the first commit wins.
        AtomicReference<Row> row = new AtomicReference<>(new Row(100, 1));
        Row seenByA = row.get(), seenByB = row.get();
        boolean aCommitted = row.compareAndSet(seenByA, new Row(seenByA.balance() - 30, seenByA.version() + 1));
        boolean bCommitted = row.compareAndSet(seenByB, new Row(seenByB.balance() - 50, seenByB.version() + 1));
        Row reread = row.get();                                     // B reloads and retries
        boolean bRetry = row.compareAndSet(reread, new Row(reread.balance() - 50, reread.version() + 1));
        System.out.println("Q116 A commits " + aCommitted + ", B's stale commit " + bCommitted + ", B's retry " + bRetry + " -> " + row.get());

        // Q117: strict two-phase locking - grow (lock all, in order), work, then shrink.
        ReentrantLock[] accountLocks = { new ReentrantLock(), new ReentrantLock(), new ReentrantLock() };
        int[] balances = {100, 100, 100};
        List<String> phases = new ArrayList<>();
        int[] needed = {2, 0};                                      // this transaction touches accounts 0 and 2
        Arrays.sort(needed);                                        // global order prevents deadlock
        for (int a : needed) { accountLocks[a].lock(); phases.add("lock " + a); }        // growing
        balances[0] -= 40; balances[2] += 40; phases.add("update");
        for (int i = needed.length - 1; i >= 0; i--) { accountLocks[needed[i]].unlock(); phases.add("unlock " + needed[i]); } // shrinking
        System.out.println("Q117 2PL " + phases + " balances " + Arrays.toString(balances));

        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            // Q118: four threads insert into the lock-coupled list.
            LockCoupledList list = new LockCoupledList();
            List<Callable<Void>> inserters = new ArrayList<>();
            for (int t = 0; t < 4; t++) {
                int offset = t;
                inserters.add(() -> { for (int i = 0; i < 250; i++) list.add(i * 4 + offset); return null; });
            }
            pool.invokeAll(inserters);
            List<Integer> values = list.values();
            boolean sorted = true;
            for (int i = 1; i < values.size(); i++) sorted &= values.get(i - 1) < values.get(i);
            System.out.println("Q118 hand-over-hand list has " + values.size() + " values, sorted and unique: " + sorted);

            // Q119: two consumers, one poison pill each.
            BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);
            int pill = -1;
            AtomicInteger consumed = new AtomicInteger();
            List<Future<?>> consumers = new ArrayList<>();
            for (int c = 0; c < 2; c++) consumers.add(pool.submit(() -> {
                for (int item; (item = queue.take()) != pill; ) consumed.addAndGet(item);
                return null;
            }));
            for (int i = 1; i <= 100; i++) queue.put(i);
            queue.put(pill); queue.put(pill);
            for (Future<?> f : consumers) f.get();
            System.out.println("Q119 consumers stopped on poison pills after summing " + consumed.get());

            // Q120: non-fair RRWL - a new reader waits behind a queued writer.
            ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
            rw.readLock().lock();                                   // main is reading
            Future<?> writer = pool.submit(() -> { rw.writeLock().lock(); rw.writeLock().unlock(); });
            while (!rw.hasQueuedThreads()) Thread.onSpinWait();     // the writer is now queued
            Future<Boolean> lateReader = pool.submit(() -> {
                boolean got = rw.readLock().tryLock(100, TimeUnit.MILLISECONDS);
                if (got) rw.readLock().unlock();
                return got;
            });
            System.out.println("Q120 new reader admitted while a writer waits: " + lateReader.get());
            rw.readLock().unlock();
            writer.get();
        }
    }
}`,
    walk:
      "Q112 deliberately calls `notify()` with no waiter, then waits with a 200 ms timeout. The earlier notification is gone, so the wait lasts the whole timeout. The fix sets a `ready` flag under the same lock before notifying; the waiter checks it in a `while` loop and never waits at all.\n\nQ114 shows why LockSupport avoids that bug: an `unpark` issued before `park` leaves a permit, so `parkNanos(2 s)` returns immediately. A Semaphore(0) behaves the same way in Q111.\n\nQ116 simulates two clients that both read version 1. A's compare-and-set succeeds and bumps the version to 2; B's set fails because the row changed; B re-reads and its retry succeeds, ending at balance 20, version 3. Q117 prints the strict 2PL sequence: lock 0, lock 2, update, unlock 2, unlock 0.\n\nFour threads insert 1,000 different values into the hand-over-hand list, which ends sorted with no duplicates. Two consumers sum 1 to 100 (5,050) and stop on one poison pill each. Finally, with main holding a read lock and a writer queued, a new timed `tryLock` reader is refused, which is the non-fair lock's anti-writer-starvation rule.",
    anim: [
      "A lost wake-up, then the fix",
      [
        ["prod", "Producer", "sets data"],
        ["mon", "Monitor", "wait set empty"],
        ["cons", "Consumer", "about to wait"],
        ["flag", "ready flag", "state, not event"],
      ],
      [
        ["prod", "mon", "notify()", "The producer notifies while nobody is in the wait set, so the notification is simply discarded."],
        ["cons", "mon", "wait()", "The consumer now waits, but the signal already happened: it sleeps forever (a lost wake-up)."],
        ["prod", "flag", "ready = true", "Fix: the producer changes shared STATE under the lock before notifying."],
        ["cons", "flag", "while (!ready)", "The consumer checks the flag under the same lock; it is already true, so it never waits."],
        ["flag", "cons", "proceeds", "The while loop also survives spurious wake-ups and stolen conditions. Semaphores and unpark remember signals too."],
      ],
    ],
    mistakes: [
      "Calling `wait()` without checking a condition flag first, which loses any signal sent earlier.",
      "Waiting with `if` instead of `while`, which breaks on spurious wake-ups and on consumers that steal the item.",
      "Retrying optimistic updates forever under heavy contention. Bound the retries or switch to a lock.",
      "Sending one poison pill when there are several consumers, so the others block forever.",
    ],
    qa: [
      [
        "Why must wait and notify be called while holding the monitor?",
        "Otherwise they throw IllegalMonitorStateException. The requirement exists to prevent lost wake-ups: the waiter checks the condition and enters the wait set atomically under the lock, and the notifier changes the condition under the same lock.",
      ],
      [
        "Is optimistic locking possible without a version column?",
        "Yes, by comparing all the columns you read (`WHERE balance = :oldBalance AND ...`) or a hash of them, but a version or timestamp column is simpler, cheaper and avoids ABA-style false successes.",
      ],
      [
        "Does two-phase locking guarantee freedom from deadlock?",
        "No. It guarantees serializability, not deadlock freedom. Ordered lock acquisition, conservative 2PL (acquire everything up front) or deadlock detection with aborts are needed on top.",
      ],
    ],
    ex: [
      "Two threads must alternate: thread A prints \"ping\", then thread B prints \"pong\", 5 times each. Implement it with wait and notifyAll, avoiding lost and spurious wake-ups.",
      "Share `boolean pingTurn = true` guarded by one lock. A: `synchronized (lock) { while (!pingTurn) lock.wait(); print(\"ping\"); pingTurn = false; lock.notifyAll(); }` in a loop of 5; B is the mirror with `while (pingTurn)`. The state variable means a notify sent early is never lost, and the while loop handles spurious wake-ups.",
    ],
  }),
];
