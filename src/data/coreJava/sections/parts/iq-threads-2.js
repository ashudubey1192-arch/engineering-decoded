import { lesson } from "../../schema.js";

export default [
  lesson("Threads Q32-Q40: Thread-Safety Guidelines, State Transitions, notify vs notifyAll and Locks", {
    intro:
      "Questions 32 to 40 cover:\n\n- guidelines for thread-safe code\n- how a thread enters and leaves the waiting, sleeping and blocked states\n- a program proving the difference between notify and notifyAll\n- whether sleep and wait release locks\n- what happens if run is not overridden or start is overridden\n- the ways to acquire a class lock\n- object lock vs class lock\n\nThe program verifies every claim with thread states and timings.",
    topics: [
      [
        "Q32. What are the guidelines for thread-safe code?",
        "1. **Avoid sharing**: use local variables, thread confinement and ThreadLocal.\n2. **Prefer immutability**: final fields, immutable value objects and records.\n3. **Use the concurrency library**: ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue and the atomic classes, instead of hand-made locking.\n4. When locking, **guard each piece of shared state with exactly one lock**, and hold that lock for every read and write of it.\n5. Keep **critical sections short**, and never block (I/O, sleep) or call unknown code while holding a lock.\n6. Make compound actions atomic: `putIfAbsent`, `computeIfAbsent`, `merge`, `AtomicInteger.updateAndGet`.\n7. Acquire multiple locks in a fixed global order.\n8. Publish objects safely: final fields, volatile, or synchronized.\n9. Prefer executors and structured concurrency over raw threads.\n10. Document thread-safety, for example with `@ThreadSafe` or `@GuardedBy` annotations.",
      ],
      [
        "Q33. How does a thread enter the waiting, sleeping and blocked states, and how does it come back?",
        "- **WAITING**: enter through `obj.wait()` (lock held), `t.join()` or `LockSupport.park()`. Return through `notify`/`notifyAll` (then the thread must re-acquire the lock, possibly passing through BLOCKED), when the joined thread terminates, `unpark`, or an interrupt.\n- **TIMED_WAITING (sleeping)**: enter through `Thread.sleep(ms)`, `wait(ms)`, `join(ms)` or `parkNanos`. Return when the time expires, or on an interrupt or notify.\n- **BLOCKED**: enter by trying to enter a synchronized block or method whose monitor another thread owns, or by re-acquiring a monitor after `wait`. Return when the owner releases the monitor and this thread wins it.\n\nIn all cases, the thread comes back to RUNNABLE and then waits for the scheduler to give it CPU time.",
      ],
      [
        "Q34. What is the difference between notify and notifyAll? Prove it with a program.",
        "`notify()` moves **one** arbitrary waiting thread from the monitor's wait set to compete for the lock. `notifyAll()` moves **all** of them, and they then acquire the lock one at a time. Proof: start three threads that each `wait()` on the same object. After one `notify()`, exactly one finishes and two remain WAITING. After `notifyAll()`, the remaining two finish. Use notifyAll whenever waiters may be waiting for different conditions, or when you cannot guarantee that any single waiter can make progress.",
      ],
      [
        "Q35. Does sleep() release the lock?",
        "**No.** A thread that calls `Thread.sleep()` inside a synchronized block keeps the monitor for the entire sleep. Every other thread trying to enter a block on the same monitor stays BLOCKED until the sleeper wakes up and leaves the block. This is a common cause of throughput problems and apparent hangs. Never sleep while holding a lock.",
      ],
      [
        "Q36. Does wait() release the lock?",
        "**Yes.** `wait()` atomically releases the monitor of the object it is called on and suspends the thread. Other threads can then enter synchronized blocks on that object, for example to change the condition and call notify. When woken, the waiting thread must **re-acquire** the monitor before `wait()` returns. Note that `wait()` releases only *that* object's monitor: any other locks the thread holds stay held, which can cause deadlocks.",
      ],
      [
        "Q37. What happens if run() is not overridden?",
        "When you subclass Thread without overriding `run()`, the inherited `Thread.run()` executes. It calls the Runnable target passed to the constructor, if any, and otherwise does nothing. So `new Thread().start()` starts a thread that terminates immediately, without an error. With `new MyThread(runnable)` where MyThread does not override run, the runnable executes normally.",
      ],
      [
        "Q38. What happens if start() is overridden?",
        "If an override of `start()` does not call `super.start()`, **no new thread is created**: calling `start()` just runs your method on the current thread, and `run()` is never invoked on another thread. If the override calls `super.start()`, a thread is created as usual, plus whatever extra code your override adds, which runs on the calling thread. Overriding start is almost always a design mistake.",
      ],
      [
        "Q39. How do you acquire a lock on a class (the class lock)?",
        "There are two ways, and both lock the monitor of the `java.lang.Class` object:\n\n1. Declare a method **static synchronized**: `public static synchronized void log() { }` locks `MyClass.class`.\n2. Use a **synchronized block on the class literal**: `synchronized (MyClass.class) { ... }`, or `synchronized (obj.getClass())`, which is risky with subclasses because it may return a subclass's Class.\n\nThere is one class lock per class per class loader, and it is shared by all threads, no matter how many instances exist.",
      ],
      [
        "Q40. What is the difference between an object lock and a class lock?",
        "- **Object lock**: the monitor of a particular instance, used by non-static synchronized methods and `synchronized (this)` or `synchronized (obj)`. Each instance has its own, so threads working on different instances do not block each other.\n- **Class lock**: the monitor of the Class object, used by static synchronized methods and `synchronized (X.class)`. There is one per class. It protects static state.\n\nThe two are **independent monitors**: holding one never blocks access requiring the other. A static synchronized method and an instance synchronized method can therefore run at the same time.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    static void pause(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
    static void awaitState(Thread t, Thread.State s) { while (t.getState() != s) Thread.onSpinWait(); }

    static class Counter {
        static int total;                                    // static state: class lock
        int mine;                                            // instance state: object lock
        static synchronized void addTotal() { total++; }    // locks Counter.class
        synchronized void addMine() { mine++; }             // locks this
        static void addTotalBlock() { synchronized (Counter.class) { total++; } } // same class lock
    }

    public static void main(String[] args) throws Exception {
        // Q32: confinement + immutability + concurrent collection.
        ConcurrentHashMap<String, LongAdder> hits = new ConcurrentHashMap<>();
        List<String> pages = List.of("home", "cart", "home");                  // immutable input
        try (ExecutorService pool = Executors.newFixedThreadPool(3)) {
            for (String page : pages) pool.submit(() -> hits.computeIfAbsent(page, k -> new LongAdder()).increment());
        }
        System.out.println("Q32 safe counts " + new TreeMap<>(hits));

        // Q33: BLOCKED -> RUNNABLE, WAITING -> BLOCKED -> RUNNABLE.
        Object monitor = new Object();
        Thread t = new Thread(() -> { synchronized (monitor) { try { monitor.wait(); } catch (InterruptedException ignored) { } } });
        List<Thread.State> path = new ArrayList<>();
        synchronized (monitor) {
            t.start();
            awaitState(t, Thread.State.BLOCKED);  path.add(t.getState());      // waiting to enter
        }
        awaitState(t, Thread.State.WAITING);    path.add(t.getState());        // inside wait()
        synchronized (monitor) {
            monitor.notify();
            awaitState(t, Thread.State.BLOCKED); path.add(t.getState());       // woken, must re-acquire
        }
        t.join();                                path.add(t.getState());
        System.out.println("Q33 path " + path);

        // Q34: notify wakes one, notifyAll wakes the rest.
        Object room = new Object();
        AtomicInteger done = new AtomicInteger();
        List<Thread> waiters = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Thread w = new Thread(() -> { synchronized (room) { try { room.wait(); } catch (InterruptedException ignored) { } } done.incrementAndGet(); });
            waiters.add(w); w.start();
        }
        for (Thread w : waiters) awaitState(w, Thread.State.WAITING);
        synchronized (room) { room.notify(); }
        while (done.get() < 1) Thread.onSpinWait();
        pause(50);
        int afterNotify = done.get();
        synchronized (room) { room.notifyAll(); }
        for (Thread w : waiters) w.join();
        System.out.println("Q34 finished after notify: " + afterNotify + ", after notifyAll: " + done.get());

        // Q35: sleep keeps the lock.
        Object lock = new Object();
        Thread sleeper = new Thread(() -> { synchronized (lock) { pause(200); } });
        sleeper.start(); pause(30);
        Thread contender = new Thread(() -> { synchronized (lock) { } });
        contender.start(); awaitState(contender, Thread.State.BLOCKED);
        System.out.println("Q35 contender while holder sleeps: " + contender.getState());
        sleeper.join(); contender.join();

        // Q36: wait releases the lock.
        Thread waiter = new Thread(() -> { synchronized (lock) { try { lock.wait(200); } catch (InterruptedException ignored) { } } });
        waiter.start(); awaitState(waiter, Thread.State.TIMED_WAITING);
        long start = System.nanoTime();
        synchronized (lock) { }                                               // enters at once
        System.out.println("Q36 main entered the monitor during wait(): " + ((System.nanoTime() - start) < 100_000_000L));
        waiter.join();

        // Q37: subclass without run() override still runs its Runnable target.
        class NoRun extends Thread { NoRun(Runnable r) { super(r); } }
        Thread noRun = new NoRun(() -> System.out.println("Q37 inherited Thread.run() called the Runnable target"));
        noRun.start(); noRun.join();

        // Q38: start() overridden with and without super.start().
        Thread broken = new Thread(() -> System.out.println("Q38 run() on " + Thread.currentThread().getName())) {
            @Override public void start() { System.out.println("Q38 start() override without super.start() on " + Thread.currentThread().getName()); }
        };
        broken.start();
        Thread fixed = new Thread(() -> System.out.println("Q38 run() on " + Thread.currentThread().getName()), "real-thread") {
            @Override public void start() { super.start(); }
        };
        fixed.start(); fixed.join();

        // Q39 + Q40: class lock and object locks are independent.
        Counter c1 = new Counter(), c2 = new Counter();
        Thread[] workers = {
                new Thread(() -> { for (int i = 0; i < 10_000; i++) { Counter.addTotal(); c1.addMine(); } }),
                new Thread(() -> { for (int i = 0; i < 10_000; i++) { Counter.addTotalBlock(); c2.addMine(); } })};
        for (Thread w : workers) w.start();
        for (Thread w : workers) w.join();
        System.out.println("Q39 static total guarded by Counter.class = " + Counter.total + " | Q40 c1.mine = " + c1.mine + ", c2.mine = " + c2.mine);
    }
}`,
    walk:
      "Q32 counts page hits from three pool threads with `computeIfAbsent` plus LongAdder, which is atomic per key, so no explicit lock is needed. For Q33, main holds the monitor while the new thread starts, so the thread is BLOCKED. Main then releases it, and the thread enters and waits (WAITING). Main notifies while still holding the lock, so the woken thread goes back to BLOCKED until main leaves, and then it finishes (TERMINATED).\n\nQ34 puts three threads into `wait()`. One `notify()` finishes exactly one of them, and `notifyAll()` finishes the other two. Q35 shows a contender BLOCKED while the lock holder sleeps, because sleep keeps the lock. Q36 shows that main can enter the monitor immediately while another thread is in `wait(200)`. Q37 runs a Runnable through an inherited `run()`. Q38's broken override never creates a thread (it prints main), while the fixed one runs on real-thread. Q39 and Q40 show that the class lock exactly guards the static total of 20,000, while the two object locks protect separate counters independently.",
    anim: [
      "Waking up from wait() goes through BLOCKED",
      [
        ["t", "thread T", "in wait()"],
        ["mon", "monitor", "owned by main"],
        ["main", "main", "calls notify()"],
        ["cpu", "scheduler", "RUNNABLE queue"],
      ],
      [
        ["t", "mon", "wait()", "T releases the monitor and enters its wait set: WAITING."],
        ["main", "mon", "notify()", "main, holding the monitor, calls notify(); T leaves the wait set."],
        ["mon", "t", "BLOCKED", "T must re-acquire the monitor, but main still owns it, so T is BLOCKED."],
        ["main", "mon", "exit block", "main leaves the synchronized block and releases the monitor."],
        ["t", "cpu", "RUNNABLE", "T wins the monitor, wait() returns, and T continues when scheduled."],
      ],
    ],
    mistakes: [
      "Expecting a notified thread to run immediately. It must first re-acquire the lock.",
      "Sleeping inside synchronized code to \"wait\" for another thread. The other thread can never get in.",
      "Guarding static fields with instance-level synchronized methods, which use different locks.",
    ],
    qa: [
      [
        "Can a thread hold several monitors at once?",
        "Yes, through nested synchronized blocks. `wait()` releases only the monitor of the object it is called on, so the others remain held.",
      ],
      [
        "Is `synchronized (getClass())` the same as `synchronized (MyClass.class)`?",
        "Only when the object is exactly MyClass. For a subclass instance, `getClass()` returns the subclass's Class, so different subclasses would lock different monitors.",
      ],
      [
        "Why does LongAdder fit counters better than AtomicLong?",
        "Under contention, LongAdder spreads increments over several cells and sums them on read, so threads rarely fight over one memory location.",
      ],
    ],
    ex: [
      "A static method updates a static map, and an instance method reads it. Both are `synchronized`. Is the map safe? Fix it.",
      "No. The static method locks `X.class` and the instance method locks `this`, so they can run concurrently. Lock the same monitor in both: make the instance method use `synchronized (X.class)`, or use a ConcurrentHashMap.",
    ],
  }),

  lesson("Threads Q41-Q50: Can Thread 2 Enter This Method? Every synchronized Combination", {
    intro:
      "Questions 41 to 50 are a famous series of scenarios. While thread 1 is inside one method, can thread 2 enter another? The answer always comes down to one question: **do the two methods need the same monitor?**\n\n- Instance synchronized methods use the object's lock.\n- Static synchronized methods use the class's lock.\n- Non-synchronized methods need no lock.\n- A thread re-entering a lock it already holds is always allowed.\n\nThe program measures each scenario and prints whether thread 2 had to wait. The last question compares the states of `wait()` and `wait(long)`.",
    topics: [
      [
        "Q41. Thread 1 is in synchronized m1() of an object. Can thread 2 enter synchronized m2() of the same object?",
        "**No.** Both are instance synchronized methods, so both need the **same object lock** (`this`). While thread 1 holds it inside m1, thread 2 is BLOCKED at the entry to m2 until thread 1 leaves m1. Synchronization is per object, not per method: all synchronized instance methods of one object exclude each other.",
      ],
      [
        "Q42. Thread 1 is in static synchronized m1(). Can thread 2 enter static synchronized m2()?",
        "**No.** Both static synchronized methods lock the same **class lock** (`MyClass.class`). Thread 2 blocks until thread 1 exits m1. This is true whether the threads call the methods through the class name, through the same instance, or through different instances, because static methods ignore the instance.",
      ],
      [
        "Q43. Thread 1 is in synchronized m1() (instance). Can thread 2 enter static synchronized m2()?",
        "**Yes.** m1 holds the object lock, while m2 needs the class lock. They are different monitors, so thread 2 enters m2 immediately and the two run concurrently. This is the classic bug when an instance method and a static method touch the same static field: they do not exclude each other.",
      ],
      [
        "Q44. Can a thread in a synchronized method call another synchronized method of the same object?",
        "**Yes.** Intrinsic locks are **reentrant**. The JVM records the owner thread and a hold count. Calling m2 from inside m1 on the same object increments the count instead of blocking, and each exit decrements it, until the lock is released at zero. Without reentrancy, a thread would deadlock with itself, for example when a synchronized subclass method calls `super.m()`, which is also synchronized.",
      ],
      [
        "Q45. Can a thread in a static synchronized method call another static synchronized method?",
        "**Yes**, by the same reentrancy rule. The thread already owns the class lock, so calling the second static synchronized method of the same class simply increments the hold count. There is no blocking.",
      ],
      [
        "Q46. Can a thread in a static synchronized method call an instance synchronized method?",
        "**Yes, but** it must also acquire the object lock of the instance it calls, because a static method has no `this` and needs a reference. If that object lock is free, the thread proceeds and now holds both the class lock and the object lock. If another thread holds the object lock, this thread blocks while still holding the class lock, which is a potential deadlock if that other thread then wants the class lock.",
      ],
      [
        "Q47. Can a thread in an instance synchronized method call a static synchronized method?",
        "**Yes**, and it acquires the class lock in addition to the object lock it already holds. It succeeds immediately if nobody else holds the class lock, and blocks otherwise. Again, two threads taking the object lock and the class lock in **opposite** orders can deadlock.",
      ],
      [
        "Q48. Thread 1 is in synchronized m1() of object A. Can thread 2 enter synchronized m2() of object B?",
        "**Yes.** Different instances have **different object locks**, so thread 1 locking A does not affect B, and the two threads run in parallel. This is why per-instance synchronization scales when threads work on different objects. Shared static data still needs a shared lock.",
      ],
      [
        "Q49. Thread 1 is in static synchronized m1(), called through object A. Can thread 2 enter static synchronized m2() through object B?",
        "**No.** Calling a static method through an instance reference (`a.m1()`) is just syntax: it still locks the single **class lock**. Thread 2 calling `b.m2()` needs the same class lock and blocks. Instances are irrelevant to static synchronization.",
      ],
      [
        "Q50. What is the difference between wait() and wait(long timeout) in terms of thread state?",
        "`wait()` puts the thread into **WAITING**. It waits indefinitely, until notify, notifyAll, an interrupt or a spurious wake-up. `wait(long ms)` puts it into **TIMED_WAITING**, which also ends when the timeout expires. On wake-up, both pass through **BLOCKED** while re-acquiring the monitor, then become RUNNABLE. `wait(0)` means wait forever, the same as `wait()`. A timed wait lets the thread re-check its condition periodically, which guards against missed signals.",
      ],
    ],
    code: String.raw`public class Main {

    static class Shared {
        synchronized void m1() { pause(200); }                // object lock
        synchronized void m2() { }                            // object lock
        static synchronized void s1() { pause(200); }         // class lock
        static synchronized void s2() { }                     // class lock
        synchronized void reenter() { m2(); }                 // Q44: reentrant
        static synchronized void staticReenter() { s2(); }    // Q45
        static synchronized void staticCallsInstance(Shared x) { x.m2(); } // Q46: needs x's lock too
        synchronized void instanceCallsStatic() { s2(); }     // Q47: needs the class lock too
    }

    static void pause(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }

    // Runs 'first' on thread 1, waits until it is inside, then times 'second' on thread 2.
    static String scenario(Runnable first, Runnable second) throws InterruptedException {
        Thread t1 = new Thread(first);
        t1.start();
        pause(50);                                            // let thread 1 enter its method
        long start = System.nanoTime();
        Thread t2 = new Thread(second);
        t2.start();
        t2.join();
        long waited = (System.nanoTime() - start) / 1_000_000;
        t1.join();
        return waited >= 100 ? "NO  (thread 2 waited for the lock)" : "YES (entered immediately)";
    }

    public static void main(String[] args) throws Exception {
        Shared a = new Shared(), b = new Shared();
        System.out.println("Q41 same object, sync m1 -> sync m2:            " + scenario(a::m1, a::m2));
        System.out.println("Q42 static sync s1 -> static sync s2:           " + scenario(Shared::s1, Shared::s2));
        System.out.println("Q43 sync m1 (object) -> static sync s2 (class): " + scenario(a::m1, Shared::s2));
        System.out.println("Q48 sync m1 on A -> sync m2 on B:               " + scenario(a::m1, b::m2));
        System.out.println("Q49 static s1 via A -> static s2 via B:         " + scenario(Shared::s1, Shared::s2) + " (instances do not matter)");

        // Q44-Q47: one thread re-entering or combining locks.
        a.reenter();
        Shared.staticReenter();
        Shared.staticCallsInstance(a);
        a.instanceCallsStatic();
        System.out.println("Q44-Q47 reentrant calls and lock combinations completed on one thread without blocking");

        // Q50: wait() vs wait(long).
        Object monitor = new Object();
        Thread forever = new Thread(() -> { synchronized (monitor) { try { monitor.wait(); } catch (InterruptedException ignored) { } } });
        Thread timed = new Thread(() -> { synchronized (monitor) { try { monitor.wait(5000); } catch (InterruptedException ignored) { } } });
        forever.start(); timed.start();
        while (forever.getState() != Thread.State.WAITING || timed.getState() != Thread.State.TIMED_WAITING) Thread.onSpinWait();
        System.out.println("Q50 wait() -> " + forever.getState() + ", wait(5000) -> " + timed.getState());
        synchronized (monitor) { monitor.notifyAll(); }
        forever.join(); timed.join();
    }
}`,
    walk:
      "`scenario` starts thread 1 in a method that holds its lock for 200 ms. After 50 ms it starts thread 2 on the second method and measures how long thread 2 takes to finish. If thread 2 needed the same monitor, it waits about 150 ms and the result is NO. If it needed a different monitor, or none, it finishes at once and the result is YES. The threshold of 100 ms keeps the answer stable even on a slow machine.\n\nThe results match the rules: the same object's synchronized methods exclude each other (Q41). Static synchronized methods share the class lock (Q42, Q49), whichever instance is used to call them. An instance method and a static method use different locks (Q43). Different objects have different locks (Q48). The Q44 to Q47 calls run on main and show reentrancy and lock combinations without blocking. Q50 shows WAITING for `wait()` and TIMED_WAITING for `wait(5000)`.",
    anim: [
      "Which monitor does each method need?",
      [
        ["t2", "thread 2", "wants to enter"],
        ["objA", "lock of A", "instance sync"],
        ["objB", "lock of B", "other instance"],
        ["cls", "Shared.class", "static sync"],
      ],
      [
        ["t2", "objA", "A.m2 (Q41)", "Thread 1 holds A's lock in m1, so A.m2 blocks: same monitor."],
        ["t2", "cls", "s2 (Q43)", "s2 needs the class lock, not A's lock, so it runs at the same time."],
        ["t2", "objB", "B.m2 (Q48)", "B has its own lock, so thread 2 enters while A is still locked."],
        ["t2", "cls", "s2 vs s1 (Q42)", "If thread 1 is in static s1, it holds Shared.class and s2 must wait."],
        ["objA", "objA", "reentry (Q44)", "The owning thread re-enters A's lock freely; the hold count increases."],
      ],
    ],
    varies: true,
    mistakes: [
      "Thinking synchronization is per method. It is per monitor (object or class).",
      "Calling static synchronized methods through instances and believing different instances give different locks.",
      "Taking the class lock and object locks in different orders in different methods, which risks deadlock.",
    ],
    qa: [
      [
        "Can a non-synchronized method run while another thread is in a synchronized method of the same object?",
        "Yes. Non-synchronized methods acquire no lock, so they are never blocked by synchronized ones. That is also why they must not touch the guarded state.",
      ],
      [
        "Is `synchronized` on a method equivalent to `synchronized (this)` around its body?",
        "Yes for instance methods, and `synchronized (X.class)` for static methods. The method form sets the ACC_SYNCHRONIZED flag instead of using monitorenter and monitorexit bytecodes, but the semantics are the same.",
      ],
      [
        "How can you check whether the current thread holds a lock?",
        "`Thread.holdsLock(obj)` returns true if the current thread owns obj's monitor. It is mainly used in assertions.",
      ],
    ],
    ex: [
      "Class `Bank` has `synchronized void deposit()` and `static synchronized void audit()`, and both touch `static long total`. Explain the bug, and give two fixes.",
      "deposit locks the instance and audit locks Bank.class, so they can run concurrently and corrupt `total`. Fix it by making both lock the same monitor (use `synchronized (Bank.class)` inside deposit), or make `total` an AtomicLong or LongAdder and drop the locks.",
    ],
  }),

  lesson("Threads Q51-Q60: Thread Pools, ThreadLocal, Busy Spin, holdsLock, Starvation, Shutdown Hooks and Priorities", {
    intro:
      "The last theory questions on threads, 51 to 60, cover:\n\n- implementing a thread pool\n- ThreadLocal\n- busy spin\n- whether a constructor can be synchronized\n- `Thread.holdsLock`\n- thread starvation\n- shutdown hooks\n- what happens to an exception thrown from run\n- ThreadGroup\n- thread priorities\n\nThe program shows a working pool, a shutdown hook running in a child JVM, an uncaught-exception handler, and priority constants.",
    topics: [
      [
        "Q51. How do you implement your own thread pool?",
        "1. Create a `BlockingQueue<Runnable>` of tasks.\n2. Start N worker threads, each looping `while (running or the queue is not empty) { Runnable r = queue.take(); try { r.run(); } catch (RuntimeException e) { log } }`.\n3. `submit(r)` offers the task to the queue. Reject it, or block, if the queue is bounded and full.\n4. `shutdown()` stops accepting tasks and puts one poison pill per worker, or interrupts the idle workers.\n5. `awaitTermination` joins the workers.\n\nIn production use `ThreadPoolExecutor`, which adds:\n\n- core and maximum sizes, with keep-alive for idle threads\n- a pluggable queue and a ThreadFactory\n- rejection policies (Abort, CallerRuns, Discard, DiscardOldest)\n- `beforeExecute` and `afterExecute` hooks",
      ],
      [
        "Q52. What is ThreadLocal?",
        "`ThreadLocal<T>` stores one value **per thread**. Each thread that calls `get()` sees its own copy, initialised by `withInitial(supplier)`. The values live in the thread's own `ThreadLocalMap`, keyed by a weak reference to the ThreadLocal. Uses:\n\n- per-thread caches of non-thread-safe objects, such as a SimpleDateFormat or a MessageDigest\n- request context: user, locale, trace id or transaction, as used by Spring and logging MDC\n\nPitfalls: pooled threads live for a long time, so always `remove()` in finally, or values leak across requests and can pin class loaders. With many virtual threads, ThreadLocals multiply memory. Prefer ScopedValue (Java 25) for immutable context.",
      ],
      [
        "Q53. What is busy spin?",
        "Busy spinning means waiting in a tight loop that repeatedly checks a condition (`while (!flag) { }`) instead of blocking. The thread stays on the CPU, so it reacts to the change within nanoseconds, without the cost of a context switch or a cold cache. That matters in ultra-low-latency systems such as trading platforms and the Disruptor. The cost is a fully burned core while waiting. The flag must be volatile or atomic. Add `Thread.onSpinWait()` inside the loop, so the CPU can save power and the hyper-thread sibling can run. Locks spin briefly before parking for the same reason.",
      ],
      [
        "Q54. Can a constructor be synchronized?",
        "**No.** `synchronized` is not a legal modifier for constructors, and the code does not compile (\"modifier synchronized not allowed here\"). It is unnecessary: while a constructor runs, no other thread can have a reference to the new object, unless `this` escapes, for example by registering a listener in the constructor, which you should avoid. You *can* use a `synchronized (lock) { }` block inside a constructor, for example to update a shared static counter.",
      ],
      [
        "Q55. What does Thread.holdsLock do?",
        "`Thread.holdsLock(Object obj)` is a static method that returns `true` if the **current thread** holds the monitor of `obj`. It is mainly used in assertions and defensive checks, such as `assert Thread.holdsLock(this);` in a helper that must only be called from synchronized code. It checks only intrinsic monitors. For a ReentrantLock, use `lock.isHeldByCurrentThread()`.",
      ],
      [
        "Q56. What is thread starvation?",
        "Starvation occurs when a thread **never gets the resources it needs to make progress**, although they are not permanently locked. Causes:\n\n- high-priority threads always win the CPU\n- an unfair lock is repeatedly reacquired by the same threads\n- a thread holds a lock for a very long time\n- a thread pool's workers are all blocked waiting on tasks queued behind them (pool-induced deadlock or starvation)\n- reader-heavy ReadWriteLocks starve writers\n\nRemedies: fair locks (`new ReentrantLock(true)`), shorter critical sections, avoiding priorities, separate pools for dependent tasks, and timeouts.",
      ],
      [
        "Q57. What is addShutdownHook?",
        "`Runtime.getRuntime().addShutdownHook(Thread hook)` registers an initialised but **unstarted** thread that the JVM starts when it begins shutting down:\n\n- on a normal exit when the last non-daemon thread ends\n- on `System.exit()`\n- on SIGINT or SIGTERM (Ctrl+C, `kill`)\n\nHooks run concurrently, in no specific order. Use them for last-chance cleanup, such as flushing logs, closing connections or deleting temporary files. They do **not** run on `Runtime.halt()`, `kill -9` or a JVM crash. They must be quick and must not call `System.exit`. Remove one with `removeShutdownHook`.",
      ],
      [
        "Q58. What happens when an exception is thrown from run()?",
        "`run()` cannot declare checked exceptions, so only unchecked exceptions escape it. When one does, that **thread terminates**, and the JVM calls the thread's **UncaughtExceptionHandler**. It looks for:\n\n1. the handler set with `t.setUncaughtExceptionHandler(...)`\n2. otherwise the ThreadGroup's `uncaughtException`\n3. otherwise `Thread.getDefaultUncaughtExceptionHandler()`\n4. otherwise it prints the stack trace to stderr\n\nOther threads, including main, keep running, and the exception is **not** propagated to the thread that called `start()`. With executors, `submit` captures the exception in the Future, while `execute` lets it reach the handler.",
      ],
      [
        "Q59. What is a ThreadGroup, and what are its default priority and methods?",
        "A ThreadGroup is a legacy container that organises threads in a tree. Every thread belongs to one, the creator's group by default, and the main thread is in the group named \"main\". Its maximum priority is 10 (`MAX_PRIORITY`) by default, and threads in a group cannot have a higher priority than the group's max. Its methods include:\n\n- `getName()` and `getParent()`\n- `activeCount()` and `enumerate(Thread[])`\n- `getMaxPriority()` and `setMaxPriority(int)`\n- `interrupt()`, which interrupts all its threads\n- `uncaughtException(Thread, Throwable)`\n\nMost of the ThreadGroup API is deprecated or weakened (stop, suspend, destroy and daemon status are gone or no-ops), and virtual threads all belong to a special \"VirtualThreads\" group. Use executors to manage groups of tasks instead.",
      ],
      [
        "Q60. What are thread priorities?",
        "Each thread has a priority from `Thread.MIN_PRIORITY` (1) to `Thread.MAX_PRIORITY` (10). The default is `NORM_PRIORITY` (5), or rather the priority of the creating thread. Set it with `setPriority(int)`, capped by the ThreadGroup's maximum. Priorities are only **hints** to the OS scheduler: Windows maps them to OS priorities, while Linux typically ignores them for normal threads. Programs must never rely on priorities for correctness. Virtual threads always have NORM_PRIORITY, and `setPriority` has no effect on them.",
      ],
    ],
    code: String.raw`import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    // Q51: a small pool using ThreadPoolExecutor with a bounded queue and CallerRuns rejection.
    static ThreadPoolExecutor newPool() {
        AtomicInteger n = new AtomicInteger();
        return new ThreadPoolExecutor(2, 2, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(2),
                r -> new Thread(r, "pool-" + n.incrementAndGet()),
                new ThreadPoolExecutor.CallerRunsPolicy());      // overflow runs on the submitting thread
    }

    // Q52: one SimpleDateFormat per thread (the class is not thread-safe).
    static final ThreadLocal<SimpleDateFormat> FORMAT = ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

    static class Inventory {
        private int items;
        void add() {
            synchronized (this) { helper(); }
        }
        private void helper() {
            assert Thread.holdsLock(this);                        // Q55: must be called with the lock held
            items++;
        }
    }

    public static void main(String[] args) throws Exception {
        // Q51
        ThreadPoolExecutor pool = newPool();
        Set<String> runners = ConcurrentHashMap.newKeySet();
        CountDownLatch gate = new CountDownLatch(1);
        for (int i = 0; i < 6; i++) {
            pool.execute(() -> {
                runners.add(Thread.currentThread().getName().startsWith("pool-") ? "pool worker" : "caller (main)");
                try { gate.await(100, TimeUnit.MILLISECONDS); } catch (InterruptedException ignored) { }
            });
        }
        gate.countDown();
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("Q51 tasks ran on: " + new TreeSet<>(runners) + " (2 workers + queue of 2, overflow ran on the caller)");

        // Q52
        List<Integer> identities = Collections.synchronizedList(new ArrayList<>());
        Thread a = new Thread(() -> identities.add(System.identityHashCode(FORMAT.get())));
        Thread b = new Thread(() -> identities.add(System.identityHashCode(FORMAT.get())));
        a.start(); b.start(); a.join(); b.join();
        System.out.println("Q52 each thread got its own SimpleDateFormat: " + !identities.get(0).equals(identities.get(1))
                + ", formatted " + FORMAT.get().format(new Date(0)).length() + "-char date");
        FORMAT.remove();

        // Q53: busy spin with onSpinWait.
        AtomicBoolean ready = new AtomicBoolean();
        Thread spinner = new Thread(() -> { while (!ready.get()) Thread.onSpinWait(); });
        spinner.start(); ready.set(true); spinner.join();
        System.out.println("Q53 busy-spinning thread reacted to the flag");

        // Q54: a synchronized block inside a constructor is allowed; the modifier is not.
        System.out.println("Q54 'synchronized Main()' does not compile; a synchronized block inside a constructor does");

        // Q55
        Inventory inventory = new Inventory();
        inventory.add();
        System.out.println("Q55 holdsLock outside synchronized: " + Thread.holdsLock(inventory) + ", items " + inventory.items);

        // Q56: a fair lock serves waiters in order, which prevents starvation.
        java.util.concurrent.locks.ReentrantLock fair = new java.util.concurrent.locks.ReentrantLock(true);
        System.out.println("Q56 fair lock: " + fair.isFair());

        // Q57: run a child JVM that registers a shutdown hook and exits.
        Path dir = Files.createTempDirectory("hook");
        Files.writeString(dir.resolve("Hook.java"), "public class Hook { public static void main(String[] a) {"
                + " Runtime.getRuntime().addShutdownHook(new Thread(() -> System.out.println(\"hook ran\")));"
                + " System.out.println(\"main ends\"); System.exit(0); } }");
        Process child = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                dir.resolve("Hook.java").toString()).redirectErrorStream(true).start();
        String out = new String(child.getInputStream().readAllBytes()).trim().replace(System.lineSeparator(), " | ").replace("\n", " | ");
        child.waitFor();
        System.out.println("Q57 child JVM output: " + out);

        // Q58: exception from run() goes to the handler; main is unaffected.
        Thread failing = new Thread(() -> { throw new IllegalStateException("bad state"); }, "failing-worker");
        failing.setUncaughtExceptionHandler((t, e) -> System.out.println("Q58 handler: " + t.getName() + " died with " + e.getMessage()));
        failing.start(); failing.join();
        System.out.println("Q58 main still running after the worker died");

        // Q59 + Q60
        ThreadGroup group = Thread.currentThread().getThreadGroup();
        Thread low = new Thread(() -> { });
        low.setPriority(Thread.MIN_PRIORITY);
        System.out.println("Q59 main's group '" + group.getName() + "', max priority " + group.getMaxPriority());
        System.out.println("Q60 MIN " + Thread.MIN_PRIORITY + ", NORM " + Thread.NORM_PRIORITY + ", MAX " + Thread.MAX_PRIORITY
                + "; main " + Thread.currentThread().getPriority() + ", low thread " + low.getPriority()
                + ", virtual thread " + Thread.ofVirtual().unstarted(() -> { }).getPriority());
    }
}`,
    walk:
      "For Q51 the executor has two workers and a queue of two. Six tasks are submitted while the first ones block briefly, so tasks 5 and 6 are rejected by the full pool, and the CallerRuns policy runs them on main. The set of runners therefore contains both \"pool worker\" and \"caller (main)\". Q52 shows that two threads get different SimpleDateFormat instances from the same ThreadLocal, and the program calls `remove()` afterwards.\n\nQ55 asserts `holdsLock` inside the synchronized helper, and shows it returns false outside. Q57 starts a child JVM whose shutdown hook prints after main's last line, even though the program called `System.exit`. Q58's worker dies with an exception that its handler reports, while main carries on. Q59 and Q60 print main's group (\"main\", max priority 10) and the priority constants, including the fixed NORM priority of virtual threads.",
    anim: [
      "ThreadPoolExecutor accepting six tasks",
      [
        ["sub", "submitter", "execute() x6"],
        ["core", "2 core workers", "tasks 1-2"],
        ["queue", "queue (cap 2)", "tasks 3-4"],
        ["rej", "CallerRuns", "tasks 5-6"],
      ],
      [
        ["sub", "core", "tasks 1, 2", "Fewer threads than the core size: new workers start and take tasks 1 and 2."],
        ["sub", "queue", "tasks 3, 4", "Core workers are busy, so tasks 3 and 4 wait in the bounded queue."],
        ["sub", "rej", "task 5", "The queue is full and max = core = 2, so the rejection policy fires."],
        ["rej", "sub", "run on caller", "CallerRunsPolicy runs the task on the submitting thread, slowing it down."],
        ["queue", "core", "drain", "When workers finish, they take queued tasks until the queue is empty."],
      ],
    ],
    mistakes: [
      "Using `Executors.newFixedThreadPool` with its unbounded queue for bursty workloads, which can exhaust memory.",
      "Never calling `ThreadLocal.remove()` in pooled threads.",
      "Relying on thread priorities for correctness, or expecting them to work the same on every OS.",
      "Doing slow work or calling `System.exit` inside a shutdown hook.",
    ],
    qa: [
      [
        "When does a ThreadPoolExecutor create threads beyond the core size?",
        "Only when the queue is full and the pool has fewer than `maximumPoolSize` threads. With an unbounded queue, the maximum size is never reached.",
      ],
      [
        "What is InheritableThreadLocal?",
        "A ThreadLocal whose value is copied to child threads when they are created. That is useful for propagating context, but surprising with pools, because pooled threads are created once and reused.",
      ],
      [
        "Do shutdown hooks run when the JVM is killed with SIGKILL?",
        "No. `kill -9`, `Runtime.halt()` and native crashes stop the JVM without running hooks. SIGTERM and SIGINT do run them.",
      ],
    ],
    ex: [
      "Your pool of 4 threads runs tasks that each submit a subtask to the same pool and wait for its result. Under load, everything hangs. Name the problem, and give two fixes.",
      "It is thread-pool starvation (a pool-induced deadlock). All four workers wait for subtasks that sit in the queue with no free worker to run them. Fix it by using a separate pool for subtasks, by using ForkJoinPool or CompletableFuture composition without blocking `get()`, or by using virtual threads.",
    ],
  }),
];
