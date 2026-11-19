import { lesson, section } from "../schema.js";

export default section("threads", "Threads and Multithreading", [
  lesson("What Is a Thread? Process vs Thread", {
    intro:
      "A thread is an independent path of execution inside a program. A Java application starts with one thread (main) and can create more to do work concurrently: serve many users, keep a UI responsive, or use every CPU core. This lesson explains what a thread is, how threads relate to processes, and what threads share and do not share.",
    topics: [
      [
        "What a thread is",
        "A thread is the smallest unit of execution the operating system schedules. It has its own program counter, its own call stack (local variables and method frames) and its own state. Several threads can run the same code at the same time on different cores, or take turns on one core.",
      ],
      [
        "What a process is",
        "A process is a running program with its own memory address space, open files and resources. Each `java` command starts one JVM process. Processes are isolated: one cannot read another's memory without explicit inter-process communication (pipes, sockets, files).",
      ],
      [
        "Differences between process and thread",
        "A process can contain many threads; a thread always belongs to one process. Threads in a process share its heap (objects), static fields, code and open files, but each has its own stack. Creating and switching threads is cheaper than processes. Communication between threads is simple (shared objects) but needs synchronization; communication between processes needs IPC. A crash in a process does not affect others; an unhandled error in a thread can corrupt shared state for all threads.",
      ],
      [
        "Why use multiple threads",
        "Parallelism (use all CPU cores for CPU-heavy work), responsiveness (do slow I/O in the background), throughput (a server handles many requests at once), and simpler modelling of independent activities. The cost is complexity: race conditions, deadlocks and visibility problems.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final List<String> shared = new ArrayList<>();     // heap: shared by all threads

    public static void main(String[] args) throws InterruptedException {
        System.out.println("process id: " + (ProcessHandle.current().pid() > 0 ? "assigned by the OS" : "?"));
        System.out.println("running in thread: " + Thread.currentThread().getName());
        System.out.println("CPU cores available: " + (Runtime.getRuntime().availableProcessors() > 0));

        AtomicInteger counter = new AtomicInteger();
        List<Thread> workers = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            int id = i;                                         // each thread's own local copy
            Thread t = new Thread(() -> {
                int local = id * 100;                           // lives on this thread's stack
                synchronized (shared) { shared.add("worker-" + id + " computed " + local); }
                counter.incrementAndGet();
            }, "worker-" + i);
            workers.add(t);
            t.start();
        }
        for (Thread t : workers) t.join();

        shared.sort(null);
        shared.forEach(line -> System.out.println("  " + line));
        System.out.println("threads that touched the shared counter: " + counter.get());
        System.out.println("live threads in this JVM include system threads: " + (Thread.activeCount() >= 1));
    }
}`,
    walk:
      "The program reports that it runs in one OS process and starts in the `main` thread. It then starts three worker threads. Each has its own stack, so `local` is private to each worker, while `shared` and `counter` live on the heap and are visible to all of them, which is why access to the list is synchronized and the counter is atomic.\n\n`join` waits for all workers to finish, so the results are complete before printing; sorting removes the nondeterministic order in which workers finished.",
    anim: [
      "One process, many threads",
      [
        ["proc", "JVM process", "own memory"],
        ["heap", "Heap", "shared objects"],
        ["t1", "main thread", "own stack"],
        ["t2", "worker-1", "own stack"],
        ["t3", "worker-2", "own stack"],
      ],
      [
        ["proc", "heap", "owns", "The process owns one heap that every thread in it can use."],
        ["t1", "heap", "shared", "The main thread creates the shared list on the heap."],
        ["t2", "heap", "shared", "worker-1 adds to the same list, so access must be synchronized."],
        ["t3", "t2", "isolated", "Each worker's local variables stay on its own stack, invisible to others."],
      ],
    ],
    mistakes: [
      "Assuming more threads always means faster code; beyond the number of cores, CPU-bound work slows down from context switching.",
      "Sharing mutable objects between threads without synchronization.",
    ],
    qa: [
      ["What is the difference between a process and a thread?", "A process has its own memory space and resources; a thread is an execution path inside a process that shares the process's heap and resources but has its own stack and program counter."],
      ["What do threads share?", "The heap (objects), static fields, code and open resources of their process. They do not share stacks or local variables."],
      ["Why is thread creation cheaper than process creation?", "Threads reuse the existing address space and resources; a new process needs its own memory space and resource tables."],
    ],
    ex: [
      "Name two things that are private to each thread and two things that are shared.",
      "Private: the call stack (local variables, parameters) and the program counter. Shared: heap objects and static fields (also code and open files).",
    ],
  }),

  lesson("Thread Life Cycle and Thread States", {
    intro:
      "Every Java thread moves through a defined set of states from creation to termination. `Thread.getState()` reports which one it is in, and thread dumps print these states when you debug a hung application. This lesson explains the six states of `Thread.State` and the transitions between them, and the program captures each state for real.",
    topics: [
      [
        "NEW",
        "The thread object has been created with `new Thread(...)` but `start()` has not been called. No OS thread exists yet.",
      ],
      [
        "RUNNABLE",
        "After `start()`, the thread is runnable: either actually running on a CPU or ready and waiting for the scheduler. Java does not distinguish \"ready\" from \"running\". A thread blocked in native I/O also shows as RUNNABLE.",
      ],
      [
        "BLOCKED",
        "The thread wants to enter a `synchronized` block or method whose monitor another thread holds. It leaves BLOCKED when it acquires the lock.",
      ],
      [
        "WAITING and TIMED_WAITING",
        "WAITING: waiting indefinitely for another thread, via `Object.wait()`, `Thread.join()` or `LockSupport.park()`. TIMED_WAITING: the same with a timeout, via `Thread.sleep(ms)`, `wait(ms)`, `join(ms)` or `parkNanos`. They return to RUNNABLE when notified, interrupted or when the time expires (after `wait`, they must reacquire the monitor, possibly passing through BLOCKED).",
      ],
      [
        "TERMINATED",
        "The `run()` method has finished, normally or with an exception. A terminated thread cannot be restarted.",
      ],
    ],
    code: String.raw`public class Main {
    static final Object lock = new Object();

    static Thread.State waitForState(Thread t, Thread.State target) throws InterruptedException {
        for (int i = 0; i < 500 && t.getState() != target; i++) Thread.sleep(5);
        return t.getState();
    }

    public static void main(String[] args) throws Exception {
        Thread sleeper = new Thread(() -> {
            try { Thread.sleep(300); } catch (InterruptedException ignored) { }
        });
        System.out.println("after new:            " + sleeper.getState());
        sleeper.start();
        System.out.println("sleeping:             " + waitForState(sleeper, Thread.State.TIMED_WAITING));

        Thread waiter = new Thread(() -> {
            synchronized (lock) {
                try { lock.wait(); } catch (InterruptedException ignored) { }
            }
        });
        waiter.start();
        System.out.println("in lock.wait():       " + waitForState(waiter, Thread.State.WAITING));

        Thread blocked;
        synchronized (lock) {                              // main holds the monitor
            blocked = new Thread(() -> { synchronized (lock) { } });
            blocked.start();
            System.out.println("wants a held lock:    " + waitForState(blocked, Thread.State.BLOCKED));
            lock.notifyAll();                             // wake the waiter
        }

        Thread busy = new Thread(() -> { long x = 0; for (long i = 0; i < 300_000_000L; i++) x += i; if (x == 42) System.out.println(); });
        busy.start();
        System.out.println("computing:            " + busy.getState());

        sleeper.join(); waiter.join(); blocked.join(); busy.join();
        System.out.println("after finishing:      " + sleeper.getState());
        try {
            sleeper.start();
        } catch (IllegalThreadStateException e) {
            System.out.println("start() again:        IllegalThreadStateException");
        }
    }
}`,
    walk:
      "A freshly created thread is NEW. Once started, the sleeper spends its time in `Thread.sleep`, which the helper observes as TIMED_WAITING. The waiter calls `lock.wait()` without a timeout and shows WAITING.\n\nWhile `main` holds `lock`, a third thread trying to enter `synchronized (lock)` is BLOCKED; `notifyAll` then wakes the waiter. A thread doing pure computation is RUNNABLE. After `join`, every thread is TERMINATED, and calling `start()` on a terminated thread throws `IllegalThreadStateException`.",
    anim: [
      "Thread states",
      [
        ["new", "NEW", "created"],
        ["run", "RUNNABLE", "ready/running"],
        ["blocked", "BLOCKED", "wants monitor"],
        ["wait", "WAITING", "wait/join/sleep"],
        ["term", "TERMINATED", "run() ended"],
      ],
      [
        ["new", "run", "start()", "start() creates the OS thread and makes it RUNNABLE."],
        ["run", "blocked", "synchronized", "Entering a synchronized block held by another thread makes it BLOCKED."],
        ["run", "wait", "wait/sleep", "wait(), join() or sleep() park it in WAITING or TIMED_WAITING."],
        ["wait", "run", "notify/timeout", "notify, interrupt, timeout or the joined thread ending make it RUNNABLE again."],
        ["run", "term", "run() returns", "When run() finishes, the thread is TERMINATED for good."],
      ],
    ],
    mistakes: [
      "Expecting a RUNNING state; Java reports both ready and running as RUNNABLE.",
      "Trying to restart a finished thread instead of creating a new one or using a pool.",
    ],
    qa: [
      ["What are the states of a Java thread?", "NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING and TERMINATED (Thread.State)."],
      ["What is the difference between BLOCKED and WAITING?", "BLOCKED means waiting to acquire a monitor lock; WAITING means waiting indefinitely for another thread's action, such as notify or a joined thread finishing."],
      ["Can a terminated thread be restarted?", "No. Calling start() again throws IllegalThreadStateException."],
    ],
    ex: [
      "Which state does a thread show while blocked reading from a socket, and why might that surprise you?",
      "RUNNABLE: blocking native I/O is not modelled as WAITING in Java, so a thread dump shows it as RUNNABLE even though it is not using the CPU.",
    ],
  }),

  lesson("Creating Threads: Extending Thread vs Implementing Runnable", {
    intro:
      "There are two classic ways to create a thread: extend the `Thread` class and override `run()`, or implement `Runnable` and pass it to a `Thread`. This lesson writes a first thread both ways, creates several threads, explains why their output interleaves unpredictably, describes thread stacks and why platform threads are heavyweight, and lists the differences between the two approaches.",
    topics: [
      [
        "Extending Thread",
        "`class Worker extends Thread { public void run() { ... } }` then `new Worker().start()`. Simple, and `this` is the thread, but your class can no longer extend anything else, and task logic is tied to the thread mechanism.",
      ],
      [
        "Implementing Runnable",
        "`class Task implements Runnable { public void run() { ... } }` then `new Thread(new Task()).start()`, or with a lambda: `new Thread(() -> ...).start()`. The task stays a plain object that can extend another class, be shared by several threads, or be submitted to an executor. This is the preferred approach.",
      ],
      [
        "Creating multiple threads and unpredictable behaviour",
        "When you start several threads, the scheduler decides when each runs and for how long. Their output interleaves differently on every run, and the order of `start()` calls does not guarantee the order of execution. Correct programs must not depend on any particular interleaving.",
      ],
      [
        "Thread stacks and heavyweight threads",
        "Each platform thread gets its own stack (default about 512 KB to 1 MB, set with `-Xss`) for its method frames, and maps one-to-one to an operating-system thread. That makes platform threads heavyweight: creating thousands costs memory and scheduling overhead. Pools reuse a few threads, and Java 21 virtual threads remove most of the cost.",
      ],
      [
        "Runnable vs Thread differences",
        "Inheritance: extending Thread uses up the single superclass; Runnable does not. Design: Runnable separates the task from the runner. Sharing: one Runnable instance can be run by many threads; a Thread subclass instance is one thread. Executors accept Runnable (and Callable), not Thread subclasses. Thread offers thread control methods; Runnable has only `run()`.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    static final List<String> log = Collections.synchronizedList(new ArrayList<>());

    static class CounterThread extends Thread {               // way 1: extend Thread
        CounterThread(String name) { super(name); }
        @Override public void run() {
            for (int i = 1; i <= 3; i++) log.add(getName() + " counts " + i);
        }
    }

    static class PrintTask implements Runnable {              // way 2: implement Runnable
        private final String message;
        PrintTask(String message) { this.message = message; }
        @Override public void run() {
            log.add(Thread.currentThread().getName() + " says " + message);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread a = new CounterThread("thread-A");
        Thread b = new Thread(new PrintTask("hello"), "thread-B");
        PrintTask shared = new PrintTask("shared task");          // one Runnable, two threads
        Thread c = new Thread(shared, "thread-C");
        Thread d = new Thread(shared, "thread-D");
        Thread e = new Thread(() -> log.add("thread-E says lambda"), "thread-E");

        for (Thread t : List.of(a, b, c, d, e)) t.start();
        for (Thread t : List.of(a, b, c, d, e)) t.join();

        System.out.println("events: " + log.size() + " (order varies run to run)");
        List<String> sorted = new ArrayList<>(log);
        Collections.sort(sorted);
        sorted.forEach(line -> System.out.println("  " + line));

        Thread small = new Thread(null, () -> log.add("small stack"), "small-stack", 64 * 1024);
        small.start(); small.join();
        System.out.println("a thread can be given its own stack size: " + log.contains("small stack"));
        System.out.println("CounterThread is a Thread: " + (a instanceof Thread) + ", PrintTask is a Thread: " + (Object) shared.getClass().getSuperclass().getSimpleName());
    }
}`,
    walk:
      "`CounterThread` extends `Thread` and overrides `run`; `PrintTask` implements `Runnable` and is handed to `Thread` constructors, and one `PrintTask` instance is shared by threads C and D. A lambda provides the shortest Runnable.\n\nAll five threads start almost together, so their log entries interleave differently on every run; the program sorts them to show the complete result. A thread can be created with an explicit stack size. The last line shows `PrintTask` simply extends `Object`, so it remained free to extend another class.",
    anim: [
      "Two ways to define the work",
      [
        ["ext", "extends Thread", "override run()"],
        ["impl", "Runnable", "implements run()"],
        ["thread", "new Thread(task)", "runner"],
        ["start", "start()", "new OS thread"],
        ["run", "run() executes", "on new stack"],
      ],
      [
        ["ext", "start", "is a thread", "A Thread subclass is itself the thread; call start() on it."],
        ["impl", "thread", "pass task", "A Runnable is just a task object handed to a Thread (or an executor)."],
        ["thread", "start", "start()", "start() asks the OS for a new thread with its own stack."],
        ["start", "run", "callback", "The new thread calls run(); the starting thread continues immediately."],
      ],
    ],
    mistakes: [
      "Extending Thread just to run a task, which blocks reuse and inheritance.",
      "Assuming threads run in the order they were started.",
      "Creating a new platform thread per request in a server instead of using a pool.",
    ],
    qa: [
      ["What are the ways to create a thread in Java?", "Extend Thread and override run(), implement Runnable and pass it to a Thread, or submit Runnable/Callable tasks to an ExecutorService (and, since Java 21, start virtual threads)."],
      ["Which is better, extending Thread or implementing Runnable?", "Implementing Runnable: it keeps inheritance free, separates task from execution, allows sharing and works with executors."],
      ["Why are platform threads called heavyweight?", "Each maps to an OS thread with its own large stack and kernel scheduling, so creating many is expensive in memory and context switches."],
    ],
    ex: [
      "Rewrite `CounterThread` as a Runnable lambda without changing its output format.",
      "`Runnable counter = () -> { for (int i = 1; i <= 3; i++) log.add(Thread.currentThread().getName() + \" counts \" + i); }; new Thread(counter, \"thread-A\").start();`.",
    ],
  }),

  lesson("run() vs start()", {
    intro:
      "Calling `start()` and calling `run()` look similar but do completely different things: `start()` creates a new thread that then calls `run()`, while calling `run()` directly just executes it in the current thread. This lesson covers that difference, what happens if you do not override run(), if you override start(), and whether a thread can be started twice.",
    topics: [
      [
        "start() creates a new thread",
        "`start()` registers the thread with the JVM, asks the OS for a native thread, moves it to RUNNABLE and returns immediately. The new thread then calls `run()` on its own stack, concurrently with the caller.",
      ],
      [
        "Calling run() directly",
        "`t.run()` is an ordinary method call: it runs in the calling thread, synchronously, and no new thread is created. It is a common bug that compiles and \"works\" but gives no concurrency.",
      ],
      [
        "Not overriding run()",
        "If you extend Thread without overriding `run()` and pass no Runnable, `Thread.run()` does nothing and the thread ends immediately. If a Runnable was passed to the constructor, the default `run()` calls the Runnable's `run()`.",
      ],
      [
        "Overriding start()",
        "If you override `start()` without calling `super.start()`, no new thread is ever created; your start() is just a normal method. If you override it, always call `super.start()`. In practice, never override start().",
      ],
      [
        "Starting a thread twice",
        "A thread can be started only once. A second `start()` (even after it finished) throws `IllegalThreadStateException`. To run the task again, create a new Thread or submit it to an executor.",
      ],
    ],
    code: String.raw`public class Main {
    static class NoRunOverride extends Thread { }                       // inherits empty run()

    static class BadStart extends Thread {
        @Override public void run() { System.out.println("  BadStart.run on " + Thread.currentThread().getName()); }
        @Override public void start() { System.out.println("  overridden start() without super.start(): no new thread"); }
    }

    static class GoodStart extends Thread {
        GoodStart() { super("good-start"); }
        @Override public void run() { System.out.println("  GoodStart.run on " + Thread.currentThread().getName()); }
        @Override public void start() { System.out.println("  custom setup before start"); super.start(); }
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> System.out.println("  task runs on " + Thread.currentThread().getName());
        Thread worker = new Thread(task, "worker");

        System.out.println("worker.run():");
        worker.run();                                   // same thread: main
        System.out.println("worker.start():");
        worker.start();                                 // new thread: worker
        worker.join();

        System.out.println("thread without run override:");
        Thread empty = new NoRunOverride();
        empty.start();
        empty.join();
        System.out.println("  finished immediately, state " + empty.getState());

        System.out.println("BadStart:");
        BadStart bad = new BadStart();
        bad.start();
        System.out.println("  thread state is still " + bad.getState());

        System.out.println("GoodStart:");
        GoodStart good = new GoodStart();
        good.start();
        good.join();

        System.out.println("starting worker again:");
        try {
            worker.start();
        } catch (IllegalThreadStateException e) {
            System.out.println("  IllegalThreadStateException: a thread can only be started once");
        }
    }
}`,
    walk:
      "Calling `worker.run()` executes the task on the `main` thread: no new thread. Calling `worker.start()` creates the \"worker\" thread, which then runs the task.\n\n`NoRunOverride` inherits the empty `Thread.run()`, so it terminates at once. `BadStart` overrides `start()` without calling `super.start()`, so no thread is created and its state stays NEW. `GoodStart` does its own setup and then calls `super.start()`, so `run` executes on the new thread. Starting `worker` a second time throws `IllegalThreadStateException`.",
    anim: [
      "run() vs start()",
      [
        ["main", "main thread", "caller"],
        ["runcall", "t.run()", "plain call"],
        ["startcall", "t.start()", "JVM + OS"],
        ["newt", "new thread", "own stack"],
        ["body", "run() body", "the task"],
      ],
      [
        ["main", "runcall", "call", "Calling run() directly is just a method call on the main thread's stack."],
        ["runcall", "body", "same thread", "The task runs synchronously in main; nothing is concurrent."],
        ["main", "startcall", "call", "Calling start() asks the JVM and OS to create a new thread."],
        ["startcall", "newt", "spawn", "start() returns at once; the new thread starts with its own stack."],
        ["newt", "body", "calls run()", "The new thread itself invokes run(), concurrently with main."],
      ],
    ],
    mistakes: [
      "Calling `run()` instead of `start()` and wondering why nothing runs in parallel.",
      "Overriding `start()` and forgetting `super.start()`.",
      "Reusing a Thread object for repeated work instead of an executor.",
    ],
    qa: [
      ["What is the difference between start() and run()?", "start() creates a new thread which then calls run(); calling run() directly executes it in the current thread like any method."],
      ["What happens if you call start() twice?", "The second call throws IllegalThreadStateException."],
      ["What if a Thread subclass does not override run()?", "The inherited run() calls the Runnable passed to the constructor, if any, otherwise does nothing; the thread ends immediately."],
    ],
    ex: [
      "In a loop of 3 iterations you call `new Thread(task).run()`. How many threads are created and in what order do the tasks run?",
      "No new threads are created; the three tasks run one after another on the calling thread, in loop order.",
    ],
  }),

  lesson("sleep(), join(), yield() and isAlive()", {
    intro:
      "Four basic methods control and observe threads: `sleep` pauses the current thread, `join` waits for another thread to finish, `yield` hints that the current thread is willing to give up the CPU, and `isAlive` reports whether a thread is still running. This lesson explains each, how they respond to interruption, and the difference between yield and sleep.",
    topics: [
      [
        "Thread.sleep()",
        "`Thread.sleep(ms)` (static) pauses the current thread for at least that long, in TIMED_WAITING state. It does not release any monitors the thread holds. It throws `InterruptedException` if the thread is interrupted while sleeping. Sleep durations are approximate, depending on timer resolution and scheduling.",
      ],
      [
        "join()",
        "`t.join()` makes the calling thread wait until `t` terminates; `t.join(ms)` waits at most that long. It is how one thread waits for results from another. It also guarantees visibility: everything `t` did before finishing is visible after `join` returns.",
      ],
      [
        "Thread.yield()",
        "A static hint to the scheduler that the current thread is willing to let other runnable threads run. The scheduler may ignore it, the thread stays RUNNABLE, and no time is guaranteed. It is rarely useful in application code.",
      ],
      [
        "isAlive()",
        "Returns true from `start()` until the thread terminates. Polling `isAlive()` in a loop is wasteful; use `join` or other coordination.",
      ],
      [
        "yield vs sleep",
        "sleep moves the thread to TIMED_WAITING for a minimum time and throws InterruptedException; yield keeps it RUNNABLE, has no duration, never throws and may have no effect. Neither releases locks.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        long start = System.nanoTime();
        Thread.sleep(200);
        long sleptMs = (System.nanoTime() - start) / 1_000_000;
        System.out.println("sleep(200) paused at least 200 ms: " + (sleptMs >= 195));

        int[] result = new int[1];
        Thread worker = new Thread(() -> {
            try { Thread.sleep(150); } catch (InterruptedException e) { return; }
            result[0] = 42;                                        // written by the worker
        }, "worker");
        System.out.println("before start isAlive: " + worker.isAlive());
        worker.start();
        System.out.println("after start isAlive: " + worker.isAlive());
        worker.join();                                             // wait for it
        System.out.println("after join isAlive: " + worker.isAlive() + ", result visible: " + result[0]);

        Thread slow = new Thread(() -> { try { Thread.sleep(2_000); } catch (InterruptedException ignored) { } });
        slow.start();
        slow.join(100);                                            // wait at most 100 ms
        System.out.println("join(100) returned while still alive: " + slow.isAlive());
        slow.interrupt();
        slow.join();

        Thread sleeper = new Thread(() -> {
            try {
                Thread.sleep(10_000);
            } catch (InterruptedException e) {
                System.out.println("sleep interrupted -> InterruptedException");
            }
        });
        sleeper.start();
        sleeper.interrupt();
        sleeper.join();

        Object lock = new Object();
        Thread holder = new Thread(() -> {
            synchronized (lock) { try { Thread.sleep(300); } catch (InterruptedException ignored) { } }
        });
        holder.start();
        Thread.sleep(50);
        Thread contender = new Thread(() -> { synchronized (lock) { } });
        contender.start();
        Thread.sleep(50);
        System.out.println("sleep keeps the lock, contender state: " + contender.getState());
        holder.join(); contender.join();

        Thread.yield();                                            // only a hint
        System.out.println("yield() returned; state stays RUNNABLE: " + Thread.currentThread().getState());
    }
}`,
    walk:
      "`sleep(200)` pauses main for at least 200 ms. The worker's `isAlive()` is false before `start`, true while running and false after `join`; the value it wrote is visible after `join`. `join(100)` gives up waiting after 100 ms while the slow thread is still alive.\n\nInterrupting a sleeping thread throws `InterruptedException` inside it. A thread that sleeps while holding a lock keeps that lock, so another thread trying to enter is BLOCKED. `yield()` returns immediately and the main thread stays RUNNABLE.",
    anim: [
      "main waits with join()",
      [
        ["main", "main", "calls join()"],
        ["worker", "worker", "sleep(150)"],
        ["wait", "main WAITING", "until done"],
        ["done", "worker ends", "result = 42"],
        ["resume", "main resumes", "reads result"],
      ],
      [
        ["main", "worker", "start()", "main starts the worker, which sleeps and then computes."],
        ["main", "wait", "join()", "main calls worker.join() and waits in the WAITING state."],
        ["worker", "done", "finish", "The worker writes result and its run() method returns."],
        ["done", "resume", "visible", "join returns, and everything the worker did is visible to main."],
      ],
    ],
    mistakes: [
      "Using `sleep` to \"wait until another thread is ready\"; use join, latches or queues.",
      "Swallowing InterruptedException from sleep without restoring the interrupt flag.",
      "Expecting `yield` to guarantee another thread runs.",
    ],
    qa: [
      ["Does sleep() release the lock?", "No. A sleeping thread keeps every monitor it holds."],
      ["What is the difference between yield() and sleep()?", "sleep pauses for a minimum time in TIMED_WAITING and throws InterruptedException; yield is a hint that may do nothing and the thread stays RUNNABLE."],
      ["What does join() do?", "It makes the current thread wait until the target thread terminates (or the timeout expires)."],
    ],
    ex: [
      "Start three threads that each sleep a different time and print their name, then make main print \"all done\" only after all three finish.",
      "Keep the threads in a list, start them all, then call `join()` on each before printing \"all done\". The names print in order of sleep time, and \"all done\" is always last.",
    ],
  }),

  lesson("Thread Priorities, Daemon Threads and ThreadGroup", {
    intro:
      "Threads have a priority, can be marked as daemon threads, and belong to a thread group. Priority hints to the scheduler, daemon status decides whether a thread keeps the JVM alive, and thread groups were an early way of managing threads together. This lesson explains each, with their limits and modern alternatives.",
    topics: [
      [
        "Thread priorities",
        "Priorities range from `Thread.MIN_PRIORITY` (1) to `MAX_PRIORITY` (10), default `NORM_PRIORITY` (5); a new thread inherits its creator's priority. `setPriority` is only a hint: how (or whether) it maps to OS priorities is platform dependent, so programs must never rely on it for correctness.",
      ],
      [
        "Daemon threads",
        "A daemon thread is a background service thread (garbage collector, JIT compiler, timers). The JVM exits when only daemon threads remain, without waiting for them and without running their finally blocks. Call `setDaemon(true)` before `start()` (after start it throws `IllegalThreadStateException`). New threads inherit the daemon status of their creator.",
      ],
      [
        "When to use daemon threads",
        "For best-effort background work that may be abandoned at exit: cache refreshers, heartbeats, monitoring. Never for work that must complete, such as writing files or committing transactions.",
      ],
      [
        "ThreadGroup",
        "Every thread belongs to a `ThreadGroup` (main threads to the \"main\" group). Groups form a tree and once allowed bulk operations such as `interrupt()` on all members and enumerating active threads. Most of its API is deprecated or degraded; use executors and structured concurrency to manage groups of tasks instead.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread current = Thread.currentThread();
        System.out.println("main priority " + current.getPriority() + " (MIN " + Thread.MIN_PRIORITY
                + ", NORM " + Thread.NORM_PRIORITY + ", MAX " + Thread.MAX_PRIORITY + ")");

        Thread low = new Thread(() -> { }, "low");
        Thread high = new Thread(() -> { }, "high");
        low.setPriority(Thread.MIN_PRIORITY);
        high.setPriority(Thread.MAX_PRIORITY);
        System.out.println("priorities set: low=" + low.getPriority() + " high=" + high.getPriority() + " (only hints)");
        try { low.setPriority(11); } catch (IllegalArgumentException e) { System.out.println("priority 11 -> IllegalArgumentException"); }

        Thread heartbeat = new Thread(() -> {
            while (true) {
                try { Thread.sleep(100); } catch (InterruptedException e) { return; }
            }
        }, "heartbeat");
        heartbeat.setDaemon(true);                        // must be before start()
        heartbeat.start();
        System.out.println("heartbeat is daemon: " + heartbeat.isDaemon() + ", main is daemon: " + current.isDaemon());
        try { heartbeat.setDaemon(false); } catch (IllegalThreadStateException e) { System.out.println("setDaemon after start -> IllegalThreadStateException"); }

        Thread child = new Thread(() -> { });
        System.out.println("new thread inherits daemon=" + child.isDaemon() + " and priority=" + child.getPriority());

        ThreadGroup group = new ThreadGroup("workers");
        Thread inGroup = new Thread(group, () -> {
            try { Thread.sleep(200); } catch (InterruptedException e) { System.out.println("group member interrupted"); }
        }, "worker-1");
        inGroup.start();
        System.out.println("worker-1 group: " + inGroup.getThreadGroup().getName() + ", parent group: " + group.getParent().getName());
        group.interrupt();                                // bulk operation on the group
        inGroup.join();

        System.out.println("main ends now; the daemon heartbeat does not keep the JVM alive");
    }
}`,
    walk:
      "The main thread runs at the normal priority 5. Two new threads get minimum and maximum priority, which are accepted only as hints; 11 is out of range and rejected.\n\nThe heartbeat thread loops forever, but it is a daemon, so when `main` ends the JVM exits anyway. Changing daemon status after `start()` throws. A child thread inherits `main`'s non-daemon status and priority. The `ThreadGroup` example creates a thread inside the \"workers\" group (whose parent is \"main\") and interrupts every member at once.",
    anim: [
      "When does the JVM exit?",
      [
        ["main", "main thread", "user thread"],
        ["user", "user threads", "keep JVM alive"],
        ["daemon", "daemon threads", "background"],
        ["check", "any user alive?", "JVM checks"],
        ["exit", "JVM exits", "daemons killed"],
      ],
      [
        ["main", "check", "main ends", "When main returns, the JVM checks whether any user threads are still running."],
        ["user", "check", "alive", "If a non-daemon thread is alive, the JVM keeps running until it finishes."],
        ["daemon", "check", "ignored", "Daemon threads are not counted; they never keep the JVM alive."],
        ["check", "exit", "none left", "With only daemons left, the JVM exits and stops them abruptly."],
      ],
    ],
    mistakes: [
      "Relying on priorities to make a program correct.",
      "Doing important writes in daemon threads, which are killed at exit without running finally blocks.",
      "Using ThreadGroup for thread management in new code.",
    ],
    qa: [
      ["What is a daemon thread?", "A background thread that does not prevent the JVM from exiting; the JVM terminates when only daemon threads remain."],
      ["Can you make a thread daemon after starting it?", "No. setDaemon must be called before start(), otherwise IllegalThreadStateException is thrown."],
      ["What is the range of thread priorities?", "1 (MIN_PRIORITY) to 10 (MAX_PRIORITY), with 5 (NORM_PRIORITY) as the default."],
      ["What is a ThreadGroup?", "A legacy grouping of threads in a tree, used for bulk operations like interrupting all members; mostly superseded by executors."],
    ],
    ex: [
      "A daemon thread writes a log line in a finally block. Will it always appear when the program exits?",
      "No. When the JVM exits because only daemon threads remain, daemon threads are abandoned and their finally blocks do not run.",
    ],
  }),

  lesson("Interrupting and Stopping Threads", {
    intro:
      "Java has no safe way to forcibly kill a thread. Instead, threads cooperate: one thread requests cancellation with `interrupt()` (or a flag) and the target checks for it and stops cleanly. This lesson covers interruption, interrupted vs isInterrupted, stopping with a volatile flag, why `stop()`, `suspend()`, `resume()` and `destroy()` are deprecated, and the `ThreadDeath` error.",
    topics: [
      [
        "interrupt()",
        "`t.interrupt()` sets t's interrupt flag. If t is blocked in `sleep`, `wait`, `join` or an interruptible channel or lock, that call throws `InterruptedException` (or `ClosedByInterruptException`) and clears the flag. Otherwise nothing happens except the flag being set; running code must check it.",
      ],
      [
        "Checking the flag",
        "`Thread.currentThread().isInterrupted()` reads the flag without changing it. The static `Thread.interrupted()` reads and clears it. Long loops should check the flag regularly and exit; code catching `InterruptedException` should stop or restore the flag with `Thread.currentThread().interrupt()`.",
      ],
      [
        "Stopping with a volatile flag",
        "An alternative is a `volatile boolean running` field checked by the loop and set to false by another thread. `volatile` makes the change visible. Interruption is usually better because it also wakes blocked threads.",
      ],
      [
        "Why stop(), suspend(), resume() and destroy() are deprecated",
        "`stop()` threw `ThreadDeath` at an arbitrary point, releasing all monitors with objects half-modified, leaving data corrupt. `suspend()` paused a thread while it still held its locks, so any thread needing them (including the one meant to call `resume()`) deadlocked. `destroy()` was never implemented. In recent JDKs `stop()`, `suspend()` and `resume()` throw `UnsupportedOperationException` or have been removed.",
      ],
      [
        "ThreadDeath",
        "`ThreadDeath` is an `Error` subclass that `stop()` used to throw inside the target thread. Code was supposed to rethrow it if caught. With `stop()` gone it is only of historical interest, and it is deprecated for removal.",
      ],
    ],
    code: String.raw`import java.util.concurrent.atomic.AtomicLong;

public class Main {
    static class Poller implements Runnable {
        private volatile boolean running = true;                // visible to other threads
        final AtomicLong polls = new AtomicLong();
        void requestStop() { running = false; }
        public void run() {
            while (running) polls.incrementAndGet();
            System.out.println("  poller saw running=false and exited cleanly");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread cruncher = new Thread(() -> {
            long count = 0;
            while (!Thread.currentThread().isInterrupted()) count++;   // cooperative check
            System.out.println("  cruncher noticed the interrupt flag after work, flag still set: "
                    + Thread.currentThread().isInterrupted());
        });
        cruncher.start();
        Thread.sleep(50);
        cruncher.interrupt();
        cruncher.join();

        Thread sleeper = new Thread(() -> {
            try {
                Thread.sleep(10_000);
            } catch (InterruptedException e) {
                System.out.println("  sleeper woke with InterruptedException, flag cleared: " + !Thread.currentThread().isInterrupted());
                Thread.currentThread().interrupt();                   // restore for callers
                System.out.println("  flag restored: " + Thread.currentThread().isInterrupted());
            }
        });
        sleeper.start();
        sleeper.interrupt();
        sleeper.join();

        Thread.currentThread().interrupt();
        System.out.println("Thread.interrupted() first call: " + Thread.interrupted() + ", second call: " + Thread.interrupted());

        Poller poller = new Poller();
        Thread pollThread = new Thread(poller);
        pollThread.start();
        Thread.sleep(50);
        poller.requestStop();
        pollThread.join();
        System.out.println("poller did work before stopping: " + (poller.polls.get() > 0));

        Thread victim = new Thread(() -> { });
        try {
            victim.getClass().getMethod("stop").invoke(victim);
            System.out.println("stop() still callable on this JDK");
        } catch (NoSuchMethodException e) {
            System.out.println("Thread.stop() has been removed from this JDK");
        } catch (java.lang.reflect.InvocationTargetException e) {
            System.out.println("Thread.stop() -> " + e.getCause().getClass().getSimpleName());
        } catch (IllegalAccessException e) {
            System.out.println("Thread.stop() not accessible");
        }
    }
}`,
    walk:
      "The cruncher loops until its interrupt flag is set, then exits; the flag stays set because it was only read with `isInterrupted()`. The sleeper is woken from `sleep` by `InterruptedException`, which clears the flag, so it restores the flag for its callers.\n\n`Thread.interrupted()` returns true once and clears the flag, so the second call returns false. The poller stops when another thread sets its volatile `running` flag. Finally the program looks up `Thread.stop()` by reflection: on modern JDKs it either throws `UnsupportedOperationException` or no longer exists.",
    anim: [
      "Cooperative cancellation",
      [
        ["caller", "main", "wants stop"],
        ["flag", "interrupt flag", "set"],
        ["loop", "worker loop", "checks flag"],
        ["blocked", "sleep/wait", "throws IE"],
        ["exit", "clean exit", "resources freed"],
      ],
      [
        ["caller", "flag", "interrupt()", "main calls worker.interrupt(), which sets the worker's interrupt flag."],
        ["loop", "flag", "check", "A busy worker checks isInterrupted() regularly and leaves its loop."],
        ["blocked", "exit", "Interrupted", "A blocked worker is woken by InterruptedException instead."],
        ["loop", "exit", "finish", "Either way the worker stops at a safe point, with consistent state."],
      ],
    ],
    mistakes: [
      "Catching InterruptedException and ignoring it, so the thread never stops.",
      "Using a non-volatile boolean as a stop flag, which the worker may never see change.",
      "Calling Thread.interrupted() when you only meant to check the flag (it clears it).",
    ],
    qa: [
      ["How do you stop a thread in Java?", "Cooperatively: interrupt it (or set a volatile flag) and have the thread check the flag or handle InterruptedException and exit its run method."],
      ["What is the difference between interrupted() and isInterrupted()?", "Thread.interrupted() is static, checks the current thread and clears the flag; isInterrupted() checks any thread without clearing it."],
      ["Why are stop(), suspend() and resume() deprecated?", "stop() releases locks at arbitrary points leaving objects corrupted; suspend() keeps locks while paused and easily causes deadlocks."],
      ["What is ThreadDeath?", "The Error that Thread.stop() threw in the target thread; deprecated along with stop()."],
    ],
    ex: [
      "A worker reads from a `BlockingQueue` with `take()` in a loop. How do you shut it down cleanly?",
      "Call `worker.interrupt()`. `take()` throws InterruptedException; catch it, restore or simply exit the loop, and finish cleanup. Alternatively put a special \"poison pill\" element in the queue.",
    ],
  }),

  lesson("Race Conditions and the synchronized Keyword", {
    intro:
      "A race condition occurs when the correctness of a program depends on the timing of threads accessing shared data. The classic example is several threads incrementing a counter and losing updates. This lesson explains why races happen, demonstrates one, and shows how `synchronized` methods and blocks fix it by providing mutual exclusion and visibility.",
    topics: [
      [
        "Why races happen",
        "`count++` is not one operation: it reads `count`, adds 1 and writes it back. If two threads both read 5, both write 6, and one increment is lost. Similar problems occur with check-then-act (`if (!map.containsKey(k)) map.put(k, v)`) and read-modify-write sequences on any shared state.",
      ],
      [
        "Critical sections",
        "The code that accesses shared mutable state is the critical section. To be correct, only one thread at a time may execute it, and changes made inside must be visible to the next thread that enters.",
      ],
      [
        "synchronized methods",
        "Declaring a method `synchronized` makes a thread acquire the object's monitor (intrinsic lock) before running it and release it when the method returns or throws. Only one thread can hold a given object's monitor at a time. Static synchronized methods lock the `Class` object instead.",
      ],
      [
        "synchronized blocks",
        "`synchronized (lockObject) { ... }` locks only the statements that need it and lets you choose the lock object, often a private final field. Smaller critical sections mean less contention.",
      ],
      [
        "What synchronized guarantees",
        "Mutual exclusion (atomicity of the block) and visibility: unlocking a monitor happens-before every later locking of the same monitor, so changes made inside are seen by the next thread that acquires it. Intrinsic locks are reentrant: a thread holding a lock can enter other synchronized code on the same lock.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static class UnsafeCounter {
        int count;
        void increment() { count++; }                       // read, add, write: not atomic
    }

    static class SyncCounter {
        private int count;
        synchronized void increment() { count++; }          // whole method locks 'this'
        synchronized int get() { return count; }
    }

    static class BlockCounter {
        private final Object lock = new Object();
        private int count;
        void increment() {
            int unrelated = 1 + 1;                           // work that needs no lock
            synchronized (lock) { count += unrelated - 1; }  // only the critical section is locked
        }
        int get() { synchronized (lock) { return count; } }
    }

    static class Reentrant {
        synchronized void outer() { inner(); }               // already holds the lock
        synchronized void inner() { System.out.println("reentrant: inner() entered while holding the same lock"); }
    }

    static void hammer(Runnable increment) throws InterruptedException {
        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 4; t++) threads.add(new Thread(() -> { for (int i = 0; i < 100_000; i++) increment.run(); }));
        threads.forEach(Thread::start);
        for (Thread t : threads) t.join();
    }

    public static void main(String[] args) throws InterruptedException {
        UnsafeCounter unsafe = new UnsafeCounter();
        hammer(unsafe::increment);
        System.out.println("unsafe counter: expected 400000, lost updates: " + (unsafe.count < 400_000));

        SyncCounter sync = new SyncCounter();
        hammer(sync::increment);
        System.out.println("synchronized method counter: " + sync.get());

        BlockCounter block = new BlockCounter();
        hammer(block::increment);
        System.out.println("synchronized block counter: " + block.get());

        new Reentrant().outer();
    }
}`,
    varies: true,
    walk:
      "Four threads each increment the counter 100,000 times. The unsafe counter almost always ends below 400,000 because concurrent `count++` operations overwrite each other.\n\nThe `synchronized` method version always reaches exactly 400,000: only one thread at a time can run `increment` on that object, and each sees the previous thread's write. The block version locks only the critical section on a private lock object and is equally correct. `Reentrant.outer()` calls another synchronized method on the same object without deadlocking, because intrinsic locks are reentrant.",
    anim: [
      "A lost update",
      [
        ["mem", "count = 5", "shared memory"],
        ["t1", "Thread 1", "reads 5"],
        ["t2", "Thread 2", "reads 5"],
        ["w", "both write 6", "one lost"],
        ["sync", "synchronized", "one at a time"],
      ],
      [
        ["mem", "t1", "read", "Thread 1 reads count = 5 into a register."],
        ["mem", "t2", "read", "Before it writes, thread 2 also reads count = 5."],
        ["t1", "w", "write", "Both add 1 and write 6: two increments produced only +1."],
        ["sync", "mem", "fix", "With synchronized, the read-add-write of one thread finishes before the next starts."],
      ],
    ],
    mistakes: [
      "Synchronizing writes but not reads, so readers may see stale values.",
      "Synchronizing on different lock objects for the same data.",
      "Locking on a public object or `String` literal that other code may also lock.",
    ],
    qa: [
      ["What is a race condition?", "A bug where the outcome depends on the timing or interleaving of threads accessing shared data, such as lost updates from unsynchronized count++."],
      ["How does synchronized prevent race conditions?", "It ensures only one thread holds the monitor and executes the critical section at a time, and makes its writes visible to the next thread acquiring the lock."],
      ["What is the difference between a synchronized method and a synchronized block?", "A synchronized method locks this (or the Class for static methods) for the whole method; a block locks a chosen object for only part of the code."],
      ["Are Java intrinsic locks reentrant?", "Yes. A thread can reacquire a monitor it already holds."],
    ],
    ex: [
      "Fix `UnsafeCounter` without using `synchronized`.",
      "Use `AtomicInteger count` and `count.incrementAndGet()`, which performs the read-modify-write atomically with compare-and-swap.",
    ],
  }),

  lesson("Object Lock vs Class Lock", {
    intro:
      "Every object has a monitor, and every class has one too (through its `Class` object). Instance synchronized methods lock the object; static synchronized methods lock the class. Mixing them up leads to code that looks synchronized but is not. This lesson explains object locks and class locks, synchronized blocks on each, `Thread.holdsLock`, and why `wait`/`notify` are defined in `Object`.",
    topics: [
      [
        "Object lock",
        "A non-static `synchronized` method or `synchronized (this)` locks the specific instance. Two threads calling synchronized methods on the same object take turns; on two different objects they run in parallel, because each object has its own monitor.",
      ],
      [
        "Class lock",
        "A `static synchronized` method or `synchronized (MyClass.class)` locks the single `Class` object. Every thread calling any static synchronized method of that class takes turns, no matter which instance (if any) it uses. Use it to protect static data.",
      ],
      [
        "Object lock and class lock are independent",
        "A thread holding the class lock does not hold any object's lock, and vice versa. A static synchronized method and an instance synchronized method of the same class can run at the same time. If both touch the same static field, the field is not protected.",
      ],
      [
        "Thread.holdsLock and lock objects",
        "`Thread.holdsLock(obj)` returns true if the current thread holds obj's monitor, which is useful in assertions. Prefer a `private final Object lock = new Object()` over `this` so outside code cannot lock your object and interfere.",
      ],
      [
        "Why wait() and notify() are in Object",
        "Because the lock being waited on is an object's monitor, and any object can be a monitor. `wait` releases that specific object's monitor and `notify` wakes threads waiting on it, so the methods belong to the object, not to the thread.",
      ],
    ],
    code: String.raw`import java.util.concurrent.CountDownLatch;

public class Main {
    static long start;
    static void log(String msg) { System.out.printf("  t=%3d ms %s%n", (System.nanoTime() - start) / 1_000_000 / 100 * 100, msg); }

    static class Printer {
        final String name;
        Printer(String name) { this.name = name; }
        synchronized void printJob(String job) {                       // object lock
            sleep(300);
            log(name + " printed " + job);
        }
        static synchronized void calibrateAll(String who) {             // class lock
            sleep(300);
            log("calibrated by " + who);
        }
    }

    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); } }

    static void runTogether(Runnable a, Runnable b) throws InterruptedException {
        start = System.nanoTime();
        Thread t1 = new Thread(a), t2 = new Thread(b);
        t1.start(); t2.start(); t1.join(); t2.join();
    }

    public static void main(String[] args) throws InterruptedException {
        Printer p1 = new Printer("P1"), p2 = new Printer("P2");

        System.out.println("same object, two threads -> one waits:");
        runTogether(() -> p1.printJob("A"), () -> p1.printJob("B"));

        System.out.println("different objects -> run in parallel:");
        runTogether(() -> p1.printJob("C"), () -> p2.printJob("D"));

        System.out.println("static synchronized from two objects -> one class lock:");
        runTogether(() -> Printer.calibrateAll("thread-1"), () -> Printer.calibrateAll("thread-2"));

        System.out.println("static and instance synchronized -> independent locks, parallel:");
        runTogether(() -> Printer.calibrateAll("thread-3"), () -> p1.printJob("E"));

        Object lock = new Object();
        synchronized (lock) {
            System.out.println("holdsLock(lock) inside block: " + Thread.holdsLock(lock));
            synchronized (Printer.class) {
                System.out.println("holdsLock(Printer.class): " + Thread.holdsLock(Printer.class)
                        + ", holdsLock(p1): " + Thread.holdsLock(p1));
            }
        }
        System.out.println("holdsLock(lock) outside block: " + Thread.holdsLock(lock));
    }
}`,
    varies: true,
    walk:
      "Each print job takes about 300 ms and the log rounds timestamps to 100 ms. Two threads using the same `Printer` serialize on its object lock, so the second job finishes around 600 ms. With two different printers both finish at about 300 ms, because each object has its own lock.\n\nThe static `calibrateAll` uses the class lock, so two calls serialize regardless of instances. A static synchronized method and an instance synchronized method run in parallel because the class lock and the object lock are different monitors. `Thread.holdsLock` confirms which monitors the current thread holds.",
    anim: [
      "Two kinds of locks",
      [
        ["p1", "p1 monitor", "object lock"],
        ["p2", "p2 monitor", "object lock"],
        ["cls", "Printer.class", "class lock"],
        ["inst", "printJob()", "instance sync"],
        ["stat", "calibrateAll()", "static sync"],
      ],
      [
        ["inst", "p1", "p1.printJob", "An instance synchronized method on p1 locks p1's monitor only."],
        ["inst", "p2", "p2.printJob", "The same method on p2 locks p2's monitor, so both can run at once."],
        ["stat", "cls", "static", "A static synchronized method locks the single Printer.class monitor."],
        ["cls", "p1", "independent", "Holding the class lock says nothing about object locks: they never block each other."],
      ],
    ],
    mistakes: [
      "Protecting a static counter with an instance synchronized method (each object has a different lock).",
      "Synchronizing on `this` in a class whose instances are shared with code you do not control.",
    ],
    qa: [
      ["What is the difference between an object lock and a class lock?", "An object lock belongs to one instance and is taken by instance synchronized code; a class lock belongs to the Class object and is taken by static synchronized code or synchronized(X.class)."],
      ["Can a static synchronized and a non-static synchronized method run at the same time?", "Yes, because they use different monitors (the Class object vs the instance)."],
      ["Why are wait, notify and notifyAll in the Object class?", "Because they operate on an object's monitor, and every object can act as a monitor."],
    ],
    ex: [
      "Two threads call `p1.printJob()` and `p2.printJob()` where `printJob` uses `synchronized (Printer.class)` internally instead of being a synchronized method. Do they run in parallel?",
      "No. Both lock the same Printer.class monitor, so they serialize even though they use different objects.",
    ],
  }),

  lesson("Synchronization Situations: Two Threads, Objects and Methods", {
    intro:
      "Interviewers often describe a situation (two threads, one or two objects, static or instance methods, synchronized or not) and ask whether the methods can run at the same time. The answer always follows from one question: do the two calls need the same monitor? This lesson works through the ten classic situations with a program that measures each.",
    topics: [
      [
        "The rule",
        "Two pieces of code block each other only if both are synchronized on the same monitor. Instance synchronized methods use the object's monitor; static synchronized methods use the class's monitor; unsynchronized methods use none.",
      ],
      [
        "Same object situations",
        "1. Two threads, same object, same synchronized method: one waits. 2. Same object, two different synchronized methods: one waits (same object lock). 3. Same object, one synchronized and one unsynchronized method: both run concurrently. 4. Same object, two unsynchronized methods: concurrent.",
      ],
      [
        "Different object situations",
        "5. Two threads, two different objects, same synchronized method: concurrent (different object locks). 6. Two objects, same static synchronized method: one waits (one class lock).",
      ],
      [
        "Static vs instance situations",
        "7. Same class, one static synchronized and one instance synchronized method: concurrent. 8. Two different static synchronized methods of one class: one waits. 9. Static synchronized method and an unsynchronized method: concurrent. 10. A synchronized block on a shared lock object used by two different classes' methods: one waits, because they share that monitor.",
      ],
    ],
    code: String.raw`public class Main {
    static final Object SHARED = new Object();

    static class Resource {
        synchronized void syncA() { pause(); }
        synchronized void syncB() { pause(); }
        void plain() { pause(); }
        static synchronized void staticA() { pause(); }
        static synchronized void staticB() { pause(); }
        void sharedBlock() { synchronized (SHARED) { pause(); } }
    }

    static class Other {
        void sharedBlock() { synchronized (SHARED) { pause(); } }
    }

    static void pause() { try { Thread.sleep(200); } catch (InterruptedException e) { throw new RuntimeException(e); } }

    static String verdict(Runnable a, Runnable b) throws InterruptedException {
        long start = System.nanoTime();
        Thread t1 = new Thread(a), t2 = new Thread(b);
        t1.start(); t2.start(); t1.join(); t2.join();
        long ms = (System.nanoTime() - start) / 1_000_000;
        return ms >= 380 ? "one waits" : "run together";
    }

    public static void main(String[] args) throws InterruptedException {
        Resource r1 = new Resource(), r2 = new Resource();
        Other other = new Other();
        System.out.println(" 1 same object, same sync method        : " + verdict(r1::syncA, r1::syncA));
        System.out.println(" 2 same object, two sync methods        : " + verdict(r1::syncA, r1::syncB));
        System.out.println(" 3 same object, sync + plain method     : " + verdict(r1::syncA, r1::plain));
        System.out.println(" 4 same object, two plain methods       : " + verdict(r1::plain, r1::plain));
        System.out.println(" 5 two objects, same sync method        : " + verdict(r1::syncA, r2::syncA));
        System.out.println(" 6 two objects, same static sync method : " + verdict(() -> Resource.staticA(), () -> Resource.staticA()));
        System.out.println(" 7 static sync + instance sync          : " + verdict(Resource::staticA, r1::syncA));
        System.out.println(" 8 two different static sync methods    : " + verdict(Resource::staticA, Resource::staticB));
        System.out.println(" 9 static sync + plain method           : " + verdict(Resource::staticA, r1::plain));
        System.out.println("10 shared lock object, two classes      : " + verdict(r1::sharedBlock, other::sharedBlock));
    }
}`,
    varies: true,
    walk:
      "Every method sleeps 200 ms. `verdict` runs two calls on two threads at the same moment and measures the total time: about 200 ms means they ran together, about 400 ms means one waited for the other's lock.\n\nThe results follow the rule exactly. Calls block each other only when both need the same monitor: the same object's lock (situations 1 and 2), the class lock (6 and 8), or a shared lock object (10). Everything else runs concurrently, including mixing static and instance synchronized methods (7).",
    anim: [
      "Same monitor or not?",
      [
        ["callA", "call 1", "which monitor?"],
        ["callB", "call 2", "which monitor?"],
        ["objlock", "object monitor", "instance sync"],
        ["clslock", "class monitor", "static sync"],
        ["none", "no monitor", "plain method"],
      ],
      [
        ["callA", "objlock", "r1.syncA", "An instance synchronized call needs r1's object monitor."],
        ["callB", "objlock", "r1.syncB", "Another synchronized call on r1 needs the same monitor, so it waits."],
        ["callB", "clslock", "staticA", "A static synchronized call needs the class monitor: no conflict with r1."],
        ["callB", "none", "plain", "An unsynchronized call needs no monitor and never waits."],
      ],
    ],
    mistakes: [
      "Assuming a synchronized method protects data also touched by unsynchronized methods.",
      "Assuming static synchronized methods block instance synchronized methods.",
    ],
    qa: [
      ["Can two threads call two different synchronized methods of the same object at the same time?", "No. Both need the same object's monitor, so one waits."],
      ["Can two threads call the same synchronized method on two different objects at the same time?", "Yes. Each object has its own monitor."],
      ["Can a thread run an unsynchronized method while another thread is inside a synchronized method of the same object?", "Yes. Unsynchronized methods do not need the lock."],
      ["Do two static synchronized methods of a class block each other?", "Yes. Both use the single Class object monitor."],
    ],
    ex: [
      "Thread 1 calls `r1.syncA()`; thread 2 calls `synchronized (r1) { r1.plain(); }`. Do they run together?",
      "No. Thread 2 explicitly locks r1's monitor, the same one `syncA` uses, so one waits for the other.",
    ],
  }),

  lesson("The volatile Keyword and volatile vs synchronized", {
    intro:
      "Threads can cache variables in registers and CPU caches, so a change made by one thread may never become visible to another. `volatile` fixes visibility for a single variable; `synchronized` provides both visibility and atomicity for blocks of code. This lesson explains the visibility problem, what volatile guarantees (and does not), the happens-before rule, and how volatile differs from synchronized.",
    topics: [
      [
        "The visibility problem",
        "Without synchronization, the Java Memory Model allows a thread to keep using a stale value. A loop like `while (!stop) { }` may be compiled into an infinite loop because the JIT hoists the read of `stop` out of the loop, so the update from another thread is never seen.",
      ],
      [
        "What volatile guarantees",
        "Reads of a volatile variable always see the latest write by any thread. A write to a volatile variable happens-before every later read of it, so everything the writer did before the write is also visible to the reader (safe publication). It also prevents reordering of operations around the volatile access.",
      ],
      [
        "What volatile does not guarantee",
        "Atomicity of compound actions. `volatileCount++` is still read-modify-write and still loses updates. Use `synchronized`, a `Lock` or atomic classes for that. `long` and `double` writes are atomic when volatile (otherwise 64-bit writes may be split on some platforms).",
      ],
      [
        "Typical uses of volatile",
        "Status flags (`volatile boolean running`), publishing an immutable object once (`volatile Config config`), and the instance field in double-checked locking singletons.",
      ],
      [
        "volatile vs synchronized",
        "Scope: a variable vs a block or method. Guarantees: visibility and ordering vs visibility, ordering and mutual exclusion. Blocking: volatile never blocks; synchronized may block threads waiting for the lock. Usable on: fields only vs methods and blocks. Atomic compound operations: no vs yes. Deadlock risk: none vs possible.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static boolean plainStop = false;            // no visibility guarantee
    static volatile boolean volatileStop = false; // always visible
    static volatile int volatileCount = 0;
    static int syncCount = 0;

    static synchronized void syncIncrement() { syncCount++; }

    public static void main(String[] args) throws InterruptedException {
        Thread plainLoop = new Thread(() -> { while (!plainStop) { } });
        plainLoop.setDaemon(true);                // may never see the change, so do not keep the JVM alive
        plainLoop.start();
        Thread.sleep(300);                        // let the JIT compile the loop
        plainStop = true;
        plainLoop.join(1_000);
        System.out.println("non-volatile flag: loop still spinning after the update = " + plainLoop.isAlive());

        Thread volatileLoop = new Thread(() -> { while (!volatileStop) { } });
        volatileLoop.start();
        Thread.sleep(300);
        volatileStop = true;
        volatileLoop.join(1_000);
        System.out.println("volatile flag: loop stopped = " + !volatileLoop.isAlive());

        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 4; t++) {
            threads.add(new Thread(() -> {
                for (int i = 0; i < 50_000; i++) { volatileCount++; syncIncrement(); }
            }));
        }
        threads.forEach(Thread::start);
        for (Thread t : threads) t.join();
        System.out.println("volatile count++ loses updates: " + (volatileCount < 200_000));
        System.out.println("synchronized count: " + syncCount);
    }
}`,
    varies: true,
    walk:
      "The first loop reads a plain boolean. After the JIT compiles it, the read is typically hoisted out of the loop, so the update from main is never seen and the thread keeps spinning (it is a daemon so the program can still exit). This behaviour is allowed by the memory model but not guaranteed, so the first line may differ by JVM.\n\nThe same loop over a `volatile` flag stops promptly, because every read sees the latest write. The counter part shows volatile's limit: `volatileCount++` from four threads still loses updates, while the synchronized counter reaches exactly 200,000.",
    anim: [
      "Visibility with volatile",
      [
        ["t1", "writer thread", "stop = true"],
        ["cache1", "CPU cache 1", "stop = true"],
        ["mem", "main memory", "shared"],
        ["cache2", "CPU cache 2", "stale value?"],
        ["t2", "reader thread", "while(!stop)"],
      ],
      [
        ["t1", "cache1", "write", "The writer sets stop = true, which may sit in its core's cache."],
        ["cache1", "mem", "volatile flush", "A volatile write is published so other cores can see it."],
        ["mem", "cache2", "volatile read", "A volatile read cannot use a stale cached copy."],
        ["cache2", "t2", "sees true", "The reader sees stop == true and leaves its loop."],
      ],
    ],
    mistakes: [
      "Using volatile for counters and expecting `count++` to be safe.",
      "Forgetting volatile on a stop flag read in a hot loop.",
      "Thinking volatile makes the contents of a referenced object thread-safe; it only covers the reference itself.",
    ],
    qa: [
      ["What does volatile do?", "It guarantees visibility of the latest write to all threads and prevents reordering around the access; a volatile write happens-before subsequent reads."],
      ["Is volatile count++ thread-safe?", "No. volatile does not make read-modify-write atomic; use AtomicInteger or synchronization."],
      ["What is the difference between volatile and synchronized?", "volatile guarantees visibility for one variable without locking; synchronized guarantees visibility and mutual exclusion for a block, and may block threads."],
    ],
    ex: [
      "A config object is built once by one thread and read by many: `static Config config;`. What keyword makes this safe if Config is immutable?",
      "Declare it `static volatile Config config;`. The volatile write publishes the fully constructed immutable object safely to all readers.",
    ],
  }),

  lesson("wait(), notify() and notifyAll()", {
    intro:
      "`wait`, `notify` and `notifyAll` let threads coordinate through an object's monitor: one thread waits until a condition becomes true, another changes the state and notifies. They are the foundation of classic producer-consumer code. This lesson explains how they work, the rules for using them, and the differences between wait and sleep, wait() and wait(long), and notify and notifyAll.",
    topics: [
      [
        "How wait and notify work",
        "A thread must hold an object's monitor to call `obj.wait()`. `wait` atomically releases that monitor and suspends the thread. Another thread acquires the monitor, changes the shared state and calls `obj.notify()` (wake one waiting thread) or `obj.notifyAll()` (wake all). Woken threads must reacquire the monitor before `wait` returns.",
      ],
      [
        "The rules",
        "Call them only while holding the object's lock, otherwise `IllegalMonitorStateException`. Always wait in a loop that rechecks the condition (`while (!condition) obj.wait();`), because of spurious wakeups and because another thread may have changed the state before you reacquired the lock. Change the state before notifying.",
      ],
      [
        "wait vs sleep",
        "`wait` is an `Object` method, must be called while holding that object's lock, releases the lock and waits for notify or a timeout. `sleep` is a static `Thread` method, can be called anywhere, keeps all locks and waits for a time. Both throw InterruptedException.",
      ],
      [
        "wait() vs wait(long timeout)",
        "`wait()` waits until notified or interrupted, possibly forever. `wait(ms)` also returns when the timeout expires; you cannot tell from the return whether it timed out, so recheck the condition and the elapsed time.",
      ],
      [
        "notify vs notifyAll",
        "`notify` wakes one arbitrary waiting thread; `notifyAll` wakes all of them, and they compete for the lock. Use notifyAll when different threads wait for different conditions on the same object (or when unsure), because notify can wake the wrong thread and leave the right one waiting forever. notify is safe only when all waiters are interchangeable.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Mailbox {
        private String message;                       // shared state guarded by 'this'

        synchronized String take() throws InterruptedException {
            while (message == null) wait();           // releases the lock while waiting
            String m = message;
            message = null;
            notifyAll();                               // a putter may be waiting
            return m;
        }

        synchronized void put(String m) throws InterruptedException {
            while (message != null) wait();
            message = m;
            notifyAll();                               // wake takers
        }
    }

    public static void main(String[] args) throws Exception {
        Mailbox box = new Mailbox();
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 3; i++) System.out.println("  consumer took: " + box.take());
            } catch (InterruptedException ignored) { }
        });
        consumer.start();
        for (String m : List.of("hello", "world", "bye")) box.put(m);
        consumer.join();

        Object lock = new Object();
        try {
            lock.wait();
        } catch (IllegalMonitorStateException e) {
            System.out.println("wait() without holding the lock -> IllegalMonitorStateException");
        }

        long start = System.nanoTime();
        synchronized (lock) { lock.wait(200); }        // returns after timeout with no notify
        System.out.println("wait(200) returned after timeout: " + ((System.nanoTime() - start) / 1_000_000 >= 195));

        List<String> woken = new ArrayList<>();
        List<Thread> waiters = new ArrayList<>();
        boolean[] ready = {false};
        for (int i = 1; i <= 3; i++) {
            String name = "waiter-" + i;
            Thread w = new Thread(() -> {
                synchronized (lock) {
                    while (!ready[0]) { try { lock.wait(); } catch (InterruptedException e) { return; } }
                    woken.add(name);
                }
            });
            waiters.add(w);
            w.start();
        }
        Thread.sleep(100);
        synchronized (lock) { ready[0] = true; lock.notify(); }
        Thread.sleep(100);
        synchronized (lock) { System.out.println("after notify(): " + woken.size() + " thread woke"); }
        synchronized (lock) { lock.notifyAll(); }
        for (Thread w : waiters) w.join();
        System.out.println("after notifyAll(): " + woken.size() + " threads woke");
    }
}`,
    walk:
      "`Mailbox` holds at most one message. `take` waits in a loop while the box is empty and `put` waits while it is full; each changes the state and calls `notifyAll`. The consumer therefore receives the three messages in order, even though producer and consumer run in different threads.\n\nCalling `wait` without holding the lock throws `IllegalMonitorStateException`. `wait(200)` returns by itself when the timeout expires. Finally, three threads wait on one lock: `notify()` wakes exactly one of them, and `notifyAll()` wakes the remaining two.",
    anim: [
      "wait releases, notify wakes",
      [
        ["cons", "consumer", "take()"],
        ["mon", "box monitor", "lock"],
        ["wset", "wait set", "sleeping"],
        ["prod", "producer", "put()"],
        ["msg", "message", "shared state"],
      ],
      [
        ["cons", "wset", "wait()", "The consumer finds no message, calls wait() and releases the monitor."],
        ["prod", "mon", "lock", "The producer can now acquire the monitor and store a message."],
        ["prod", "wset", "notifyAll()", "notifyAll moves the waiting consumer out of the wait set."],
        ["wset", "msg", "reacquire", "The consumer reacquires the monitor, rechecks the condition and takes the message."],
      ],
    ],
    mistakes: [
      "Using `if` instead of `while` around `wait()`.",
      "Calling notify before changing the shared state, or outside synchronized.",
      "Using notify when different threads wait for different conditions.",
    ],
    qa: [
      ["Why must wait and notify be called inside synchronized?", "They operate on the object's monitor: wait must release it and notify must change shared state consistently, so the caller must own the monitor; otherwise IllegalMonitorStateException is thrown."],
      ["What is the difference between wait and sleep?", "wait releases the object's lock and waits for notify or timeout; sleep keeps all locks and waits for a time. wait is an Object method, sleep a static Thread method."],
      ["What is the difference between notify and notifyAll?", "notify wakes one waiting thread, notifyAll wakes all; notifyAll is safer when threads wait for different conditions."],
      ["What is a spurious wakeup?", "A thread returning from wait without being notified; the reason wait must be called in a loop that rechecks the condition."],
    ],
    ex: [
      "Change `Mailbox` to hold up to 5 messages. What must change in the conditions?",
      "Use a queue: `take` waits `while (queue.isEmpty())`, `put` waits `while (queue.size() == 5)`; both still call notifyAll after changing the queue.",
    ],
  }),

  lesson("Producer-Consumer: with wait/notify, Without It, and with BlockingQueue", {
    intro:
      "The producer-consumer problem is the classic coordination exercise: producers create items, consumers process them, and a bounded buffer sits between them. Producers must wait when the buffer is full and consumers when it is empty. This lesson solves it three ways: with wait/notify, without wait/notify (busy polling, and why it is bad), and with a `BlockingQueue`, the recommended approach.",
    topics: [
      [
        "The problem",
        "Shared bounded buffer, one or more producers and consumers. Requirements: no item lost or duplicated, producers block when full, consumers block when empty, and no busy-waiting that burns CPU. Shutdown must be handled too.",
      ],
      [
        "Solution 1: wait and notify",
        "Guard a queue with a monitor. `produce` waits `while (queue.size() == capacity)`, adds, then `notifyAll`; `consume` waits `while (queue.isEmpty())`, removes, then `notifyAll`. Correct but easy to get wrong (forgetting the loop, using notify, missing synchronized).",
      ],
      [
        "Solution 2: without wait and notify",
        "Polling: each thread repeatedly checks the buffer in a loop with `Thread.sleep` or `Thread.onSpinWait` between attempts. It works if access is synchronized, but wastes CPU or adds latency, and choosing the sleep time is a trade-off. It is shown mainly to understand why blocking coordination exists.",
      ],
      [
        "Solution 3: BlockingQueue",
        "`ArrayBlockingQueue` (bounded, array-based) or `LinkedBlockingQueue` (optionally bounded) do the waiting internally: `put` blocks when full and `take` blocks when empty. `offer(e, timeout)` and `poll(timeout)` wait with a limit. All synchronization is inside the queue, so the code becomes trivial.",
      ],
      [
        "Shutting down: poison pill",
        "To stop consumers, producers put a special sentinel value (a \"poison pill\") into the queue after the last item; each consumer exits when it takes one. Alternatively interrupt the consumers.",
      ],
    ],
    code: String.raw`import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    static class WaitNotifyBuffer {
        private final Queue<Integer> queue = new ArrayDeque<>();
        private final int capacity;
        WaitNotifyBuffer(int capacity) { this.capacity = capacity; }
        synchronized void produce(int item) throws InterruptedException {
            while (queue.size() == capacity) wait();
            queue.add(item);
            notifyAll();
        }
        synchronized int consume() throws InterruptedException {
            while (queue.isEmpty()) wait();
            int item = queue.remove();
            notifyAll();
            return item;
        }
    }

    static class PollingBuffer {                              // no wait/notify: polls instead
        private final Queue<Integer> queue = new ArrayDeque<>();
        private final int capacity;
        int retries = 0;
        PollingBuffer(int capacity) { this.capacity = capacity; }
        void produce(int item) throws InterruptedException {
            while (true) {
                synchronized (this) { if (queue.size() < capacity) { queue.add(item); return; } retries++; }
                Thread.sleep(1);                              // wastes time or CPU
            }
        }
        int consume() throws InterruptedException {
            while (true) {
                synchronized (this) { if (!queue.isEmpty()) return queue.remove(); retries++; }
                Thread.sleep(1);
            }
        }
    }

    static long sumConsumed(int items, ThrowingSupplier consume) throws Exception {
        long sum = 0;
        for (int i = 0; i < items; i++) sum += consume.get();
        return sum;
    }
    interface ThrowingSupplier { int get() throws Exception; }

    public static void main(String[] args) throws Exception {
        int items = 1000;
        long expected = (long) items * (items + 1) / 2;

        WaitNotifyBuffer wn = new WaitNotifyBuffer(5);
        Thread producer1 = new Thread(() -> { try { for (int i = 1; i <= items; i++) wn.produce(i); } catch (InterruptedException ignored) { } });
        producer1.start();
        System.out.println("1) wait/notify: consumed sum correct = " + (sumConsumed(items, wn::consume) == expected));
        producer1.join();

        PollingBuffer pb = new PollingBuffer(5);
        Thread producer2 = new Thread(() -> { try { for (int i = 1; i <= items; i++) pb.produce(i); } catch (InterruptedException ignored) { } });
        producer2.start();
        System.out.println("2) polling: sum correct = " + (sumConsumed(items, pb::consume) == expected) + ", wasted retries > 0: " + (pb.retries > 0));
        producer2.join();

        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);
        final int POISON = -1;
        List<Integer> handled = Collections.synchronizedList(new ArrayList<>());
        Runnable consumerTask = () -> {
            try {
                while (true) {
                    int item = queue.take();                  // blocks while empty
                    if (item == POISON) return;
                    handled.add(item);
                }
            } catch (InterruptedException ignored) { }
        };
        Thread c1 = new Thread(consumerTask), c2 = new Thread(consumerTask);
        c1.start(); c2.start();
        for (int i = 1; i <= items; i++) queue.put(i);        // blocks while full
        queue.put(POISON); queue.put(POISON);                 // one pill per consumer
        c1.join(); c2.join();
        long sum = handled.stream().mapToLong(Integer::longValue).sum();
        System.out.println("3) BlockingQueue with 2 consumers: items " + handled.size() + ", sum correct = " + (sum == expected));
    }
}`,
    walk:
      "All three versions move the numbers 1 to 1000 through a buffer of 5 slots, and the consumer side checks that the sum matches. The wait/notify buffer blocks producers when full and consumers when empty using the monitor.\n\nThe polling buffer gets the same result without wait/notify, but it repeatedly finds the buffer full or empty and sleeps, counting wasted retries. The `ArrayBlockingQueue` version needs no synchronization code at all: `put` and `take` block internally. Two consumers share the work, and one poison pill per consumer shuts them down cleanly.",
    anim: [
      "Bounded buffer coordination",
      [
        ["prod", "Producer", "put(item)"],
        ["full", "buffer full?", "wait"],
        ["buf", "BlockingQueue", "capacity 5"],
        ["empty", "buffer empty?", "wait"],
        ["cons", "Consumer", "take()"],
      ],
      [
        ["prod", "buf", "put", "The producer adds items while there is free capacity."],
        ["buf", "full", "full", "When all 5 slots are used, put() blocks the producer."],
        ["cons", "buf", "take", "The consumer removes an item, freeing a slot and waking the producer."],
        ["buf", "empty", "empty", "When the buffer is empty, take() blocks the consumer until a new item arrives."],
      ],
    ],
    mistakes: [
      "Writing producer-consumer by hand with wait/notify when a BlockingQueue does it correctly.",
      "Using an unbounded queue between a fast producer and a slow consumer, leading to OutOfMemoryError.",
      "Forgetting to send one poison pill per consumer.",
    ],
    qa: [
      ["How do you implement producer-consumer in Java?", "Most simply with a BlockingQueue (put/take); classically with wait/notifyAll around a shared queue."],
      ["Why use a bounded buffer?", "To apply back-pressure: a fast producer is slowed down instead of filling memory."],
      ["What is a poison pill?", "A sentinel item placed in the queue to tell a consumer to stop."],
    ],
    ex: [
      "Change the BlockingQueue version so consumers give up if no item arrives for 1 second instead of using poison pills.",
      "Use `Integer item = queue.poll(1, TimeUnit.SECONDS); if (item == null) return;` instead of `take()`.",
    ],
  }),

  lesson("Deadlock: Creation, Detection and Avoidance", {
    intro:
      "A deadlock happens when threads wait for each other forever, each holding a lock the other needs. The program freezes without any exception. This lesson creates a deadlock, detects it programmatically and with thread dumps (jstack, VisualVM), and explains how to avoid it with lock ordering, timeouts and fewer locks.",
    topics: [
      [
        "How a deadlock forms",
        "Four conditions together cause deadlock: mutual exclusion (locks are exclusive), hold and wait (a thread holds one lock while waiting for another), no preemption (locks cannot be taken away) and circular wait (T1 waits for T2's lock while T2 waits for T1's). The classic example: T1 locks A then B; T2 locks B then A.",
      ],
      [
        "Detecting deadlocks with thread dumps",
        "Run `jstack <pid>` (find the pid with `jps`) or `jcmd <pid> Thread.print`. The dump ends with \"Found one Java-level deadlock\" and lists each thread, the monitor it waits for and which thread holds it. In VisualVM, open the process, go to the Threads tab and it shows a \"Deadlock detected!\" banner; click Thread Dump for details. Ctrl+Break (Windows) or `kill -3` (Linux) prints a dump to the console.",
      ],
      [
        "Detecting deadlocks in code",
        "`ManagementFactory.getThreadMXBean().findDeadlockedThreads()` returns the ids of threads deadlocked on monitors or `java.util.concurrent` locks; monitoring tools use it to raise alerts.",
      ],
      [
        "Avoiding deadlock",
        "Acquire locks in a single global order (for example by account id), so circular wait cannot happen. Use `tryLock` with a timeout and back off. Hold locks for as short a time as possible and never call unknown code (callbacks) while holding a lock. Prefer higher-level concurrency utilities and fewer, coarser locks.",
      ],
      [
        "Resolving a deadlock",
        "Once deadlocked, intrinsic-lock threads cannot be broken out; the process must be restarted. Fix the code with lock ordering or timeouts. Deprecated `suspend()` was a notorious deadlock source because a suspended thread kept its locks.",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static void pause() { try { Thread.sleep(100); } catch (InterruptedException ignored) { } }

    public static void main(String[] args) throws Exception {
        Object lockA = new Object(), lockB = new Object();
        Thread t1 = new Thread(() -> { synchronized (lockA) { pause(); synchronized (lockB) { } } }, "transfer-A-to-B");
        Thread t2 = new Thread(() -> { synchronized (lockB) { pause(); synchronized (lockA) { } } }, "transfer-B-to-A");
        t1.setDaemon(true); t2.setDaemon(true);           // let the JVM exit despite the deadlock
        t1.start(); t2.start();
        Thread.sleep(500);

        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        long[] ids = mx.findDeadlockedThreads();
        System.out.println("deadlocked threads found: " + (ids == null ? 0 : ids.length));
        for (ThreadInfo info : mx.getThreadInfo(ids)) {
            System.out.println("  " + info.getThreadName() + " is " + info.getThreadState()
                    + ", waiting for a lock held by " + info.getLockOwnerName());
        }

        // Avoidance 1: consistent lock ordering (fresh locks; A and B stay deadlocked)
        Object lockC = new Object(), lockD = new Object();
        Object first = System.identityHashCode(lockC) < System.identityHashCode(lockD) ? lockC : lockD;
        Object second = first == lockC ? lockD : lockC;
        Runnable ordered = () -> { synchronized (first) { pause(); synchronized (second) { } } };
        Thread o1 = new Thread(ordered), o2 = new Thread(ordered);   // both use the same order
        o1.start(); o2.start();
        o1.join(2_000); o2.join(2_000);
        System.out.println("lock ordering: both threads finished = " + (!o1.isAlive() && !o2.isAlive()));

        // Avoidance 2: tryLock with timeout and back-off
        ReentrantLock x = new ReentrantLock(), y = new ReentrantLock();
        Thread holder = new Thread(() -> { y.lock(); try { Thread.sleep(400); } catch (InterruptedException ignored) { } finally { y.unlock(); } });
        holder.start();
        Thread.sleep(50);
        boolean done = false;
        int attempts = 0;
        while (!done) {
            attempts++;
            if (x.tryLock(100, TimeUnit.MILLISECONDS)) {
                try {
                    if (y.tryLock(100, TimeUnit.MILLISECONDS)) {
                        try { done = true; } finally { y.unlock(); }
                    }
                } finally { x.unlock(); }
            }
        }
        holder.join();
        System.out.println("tryLock with timeout: succeeded after backing off, attempts > 1: " + (attempts > 1));
        System.out.println("tip: jps -l to find the pid, then jstack <pid> prints 'Found one Java-level deadlock'");
    }
}`,
    walk:
      "Thread 1 locks A and then wants B; thread 2 locks B and then wants A. After a short pause each holds one lock and waits forever for the other: a deadlock. `ThreadMXBean.findDeadlockedThreads()` finds both, and `ThreadInfo` reports that each is BLOCKED on a lock owned by the other, which is the same information `jstack` prints. They are daemon threads, so the JVM can still exit.\n\nThe first fix orders locks consistently, so circular waiting is impossible and both threads finish. The second uses `ReentrantLock.tryLock` with timeouts: when the second lock is unavailable, the thread releases the first, backs off and retries until it succeeds.",
    anim: [
      "Circular wait",
      [
        ["t1", "Thread 1", "holds A"],
        ["a", "Lock A", "owned by T1"],
        ["b", "Lock B", "owned by T2"],
        ["t2", "Thread 2", "holds B"],
        ["dump", "jstack", "deadlock found"],
      ],
      [
        ["t1", "a", "lock", "Thread 1 acquires lock A first."],
        ["t2", "b", "lock", "Meanwhile thread 2 acquires lock B."],
        ["t1", "b", "waits", "Thread 1 now needs B, held by thread 2, so it blocks."],
        ["t2", "a", "waits", "Thread 2 needs A, held by thread 1: neither can ever continue."],
        ["dump", "t1", "detect", "A thread dump shows each thread waiting for a lock the other holds."],
      ],
    ],
    mistakes: [
      "Acquiring the same locks in different orders in different code paths.",
      "Calling external callbacks or I/O while holding locks.",
      "Using `lock()` instead of `tryLock(timeout)` where deadlock is possible and recovery is desired.",
    ],
    qa: [
      ["What is a deadlock?", "A situation where two or more threads wait forever for locks held by each other."],
      ["How do you detect a deadlock?", "Take a thread dump with jstack, jcmd Thread.print or VisualVM (it reports 'Found one Java-level deadlock'), or call ThreadMXBean.findDeadlockedThreads()."],
      ["How do you avoid deadlocks?", "Acquire locks in a consistent global order, use tryLock with timeouts, minimise lock scope, and avoid nested locks and callbacks under locks."],
      ["What are the conditions for deadlock?", "Mutual exclusion, hold and wait, no preemption and circular wait."],
    ],
    ex: [
      "Two bank accounts must be locked to transfer money between them. Write the locking order rule that prevents deadlock for any pair of transfers.",
      "Always lock the account with the smaller id first: `Account first = a.id < b.id ? a : b; Account second = first == a ? b : a; synchronized (first) { synchronized (second) { ... } }`.",
    ],
  }),

  lesson("Thread Starvation and Busy Spinning", {
    intro:
      "Two liveness problems are less dramatic than deadlock but still serious. Starvation means a thread is ready to run but rarely or never gets the resource it needs. Busy spinning means a thread waits by looping and burning CPU instead of blocking. This lesson explains both, shows them in code and covers the fixes: fair locks, shorter critical sections, and proper blocking or `Thread.onSpinWait`.",
    topics: [
      [
        "Thread starvation",
        "A thread is starved when others constantly get the CPU or a lock ahead of it. Causes: a thread holding a lock for a long time while others wait, unfair lock acquisition (synchronized and the default ReentrantLock do not guarantee order), priority misuse, or a thread pool saturated by long tasks so new tasks never run.",
      ],
      [
        "Fixing starvation",
        "Keep critical sections short; use fair locks (`new ReentrantLock(true)`) or fair semaphores when order matters (at some throughput cost); size thread pools properly and separate slow tasks into their own pool; avoid relying on priorities.",
      ],
      [
        "Busy spinning",
        "A loop that repeatedly checks a condition without blocking (`while (!ready) { }`) keeps a core at 100% and can starve other threads, including the one that should set the flag. It can also hide visibility bugs if the flag is not volatile.",
      ],
      [
        "When spinning is acceptable",
        "Very short expected waits in low-latency systems (for example high-frequency trading) where blocking and waking up costs more than spinning. Use a volatile flag and call `Thread.onSpinWait()` inside the loop (Java 9), which hints the CPU (PAUSE instruction) to save power and improve performance. Otherwise prefer blocking: `wait/notify`, `CountDownLatch`, `BlockingQueue`, `LockSupport.park`.",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static volatile boolean ready = false;

    static int runContention(ReentrantLock lock) throws InterruptedException {
        int[] counts = new int[3];
        Thread[] threads = new Thread[3];
        long end = System.currentTimeMillis() + 300;
        for (int t = 0; t < 3; t++) {
            int id = t;
            threads[t] = new Thread(() -> {
                while (System.currentTimeMillis() < end) {
                    lock.lock();
                    try { counts[id]++; } finally { lock.unlock(); }
                }
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();
        int min = Math.min(counts[0], Math.min(counts[1], counts[2]));
        int max = Math.max(counts[0], Math.max(counts[1], counts[2]));
        return max / Math.max(1, min);                  // imbalance ratio
    }

    public static void main(String[] args) throws Exception {
        int unfairRatio = runContention(new ReentrantLock(false));
        int fairRatio = runContention(new ReentrantLock(true));
        System.out.println("unfair lock: busiest/least busy thread turn ratio = " + unfairRatio + " (can be very uneven)");
        System.out.println("fair lock: turns are balanced (ratio <= 2): " + (fairRatio <= 2));

        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        Thread spinner = new Thread(() -> { while (!ready) { Thread.onSpinWait(); } });
        CountDownLatch latch = new CountDownLatch(1);
        Thread blocker = new Thread(() -> { try { latch.await(); } catch (InterruptedException ignored) { } });
        spinner.start(); blocker.start();
        Thread.sleep(300);
        long spinCpu = mx.getThreadCpuTime(spinner.getId()) / 1_000_000;
        long blockCpu = mx.getThreadCpuTime(blocker.getId()) / 1_000_000;
        ready = true;
        latch.countDown();
        spinner.join(); blocker.join();
        System.out.println("busy spinner burned CPU while waiting: " + (spinCpu > 100) + " (" + (spinCpu > 100 ? "~" + (spinCpu / 100 * 100) : spinCpu) + " ms)");
        System.out.println("blocking waiter used almost no CPU: " + (blockCpu < 50));
    }
}`,
    varies: true,
    walk:
      "Three threads compete for one lock for 300 ms and count how often each gets it. With the default unfair `ReentrantLock`, a thread that just released the lock often grabs it again immediately, so some threads get many more turns than others (starvation in the extreme). A fair lock hands the lock to the longest-waiting thread, so the counts are balanced, at the cost of throughput.\n\nThe second part waits 300 ms in two ways. The spinning thread loops with `Thread.onSpinWait()` and still burns roughly 300 ms of CPU time; the thread blocked on a `CountDownLatch` uses almost none. `ThreadMXBean.getThreadCpuTime` measures both.",
    anim: [
      "Spinning vs blocking",
      [
        ["spin", "spinning thread", "while(!ready)"],
        ["cpu", "CPU core", "100% busy"],
        ["block", "blocked thread", "latch.await()"],
        ["os", "OS scheduler", "parks thread"],
        ["signal", "ready=true", "or countDown()"],
      ],
      [
        ["spin", "cpu", "loop", "A spinning thread keeps a core busy checking the flag again and again."],
        ["block", "os", "park", "A blocked thread is parked by the OS and uses no CPU while waiting."],
        ["signal", "spin", "sees flag", "When the flag flips, the spinner notices on its next check."],
        ["signal", "os", "unpark", "countDown wakes the parked thread; it never wasted CPU."],
      ],
    ],
    mistakes: [
      "Writing `while (!done) { }` to wait for another thread.",
      "Holding a lock during slow I/O so other threads starve.",
      "Turning on fair locks everywhere; fairness reduces throughput and is only needed when order matters.",
    ],
    qa: [
      ["What is thread starvation?", "A thread being unable to make progress because others continually get the CPU or the resources it needs."],
      ["What is busy spinning?", "Waiting for a condition by looping and checking it repeatedly instead of blocking, which consumes CPU."],
      ["How can you prevent starvation?", "Short critical sections, fair locks or semaphores when needed, proper thread pool sizing and not relying on priorities."],
      ["When is busy spinning acceptable?", "For very short waits in latency-critical code, using a volatile flag and Thread.onSpinWait()."],
    ],
    ex: [
      "Replace `while (!ready) { }` with a blocking alternative that wakes up as soon as ready is set.",
      "Use a `CountDownLatch(1)`: the waiter calls `latch.await()` and the setter calls `latch.countDown()` instead of setting the flag.",
    ],
  }),

  lesson("ThreadLocal", {
    intro:
      "`ThreadLocal` gives each thread its own independent copy of a variable. It is how frameworks keep per-request data such as the current user or transaction, and how non-thread-safe objects like `SimpleDateFormat` were reused safely. This lesson explains how ThreadLocal works internally, its API, typical uses, and the memory-leak trap in thread pools.",
    topics: [
      [
        "What ThreadLocal does",
        "A `ThreadLocal<T>` object is a key; each thread that calls `get()` sees its own value. Values set by one thread are invisible to others, so no synchronization is needed.",
      ],
      [
        "API",
        "`ThreadLocal.withInitial(() -> value)` supplies a per-thread initial value, `get()` returns the current thread's value (creating it if needed), `set(value)` replaces it, and `remove()` deletes it. `InheritableThreadLocal` copies the parent thread's value into child threads at creation.",
      ],
      [
        "How it works internally",
        "Each `Thread` object has a `ThreadLocalMap`. The ThreadLocal instance is the key (held by a weak reference) and the value is held strongly. `get()` looks up the current thread's map, so the data actually lives with the thread.",
      ],
      [
        "Typical uses",
        "Per-request context (user id, locale, correlation id for logging, MDC in logging frameworks), transactions and database connections bound to a thread (Spring), and per-thread instances of non-thread-safe helpers (`SimpleDateFormat`, `Random` before `ThreadLocalRandom`).",
      ],
      [
        "The thread pool leak",
        "Pool threads live for the whole application. If a task sets a ThreadLocal and never removes it, the next task on that thread sees stale data (one user's identity leaking into another request) and the value is never garbage collected. Always call `remove()` in a finally block. Java 21's scoped values are a safer alternative for virtual threads.",
      ],
    ],
    code: String.raw`import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();
    static final ThreadLocal<SimpleDateFormat> FORMAT = ThreadLocal.withInitial(() -> {
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
        f.setTimeZone(TimeZone.getTimeZone("UTC"));
        return f;
    });

    static String handleRequest(String user) {
        CURRENT_USER.set(user);
        try {
            return audit("viewed dashboard");
        } finally {
            CURRENT_USER.remove();                        // essential in pools
        }
    }

    static String audit(String action) {                  // no user parameter needed
        return CURRENT_USER.get() + " " + action + " on " + FORMAT.get().format(new Date(0));
    }

    public static void main(String[] args) throws Exception {
        Thread a = new Thread(() -> { CURRENT_USER.set("asha"); sleep(); System.out.println("thread A sees " + CURRENT_USER.get()); });
        Thread b = new Thread(() -> { CURRENT_USER.set("ravi"); sleep(); System.out.println("thread B sees " + CURRENT_USER.get()); });
        a.start(); a.join(); b.start(); b.join();
        System.out.println("main never set it: " + CURRENT_USER.get());

        ExecutorService pool = Executors.newSingleThreadExecutor();     // one reused thread
        for (String user : List.of("meera", "neel")) System.out.println(pool.submit(() -> handleRequest(user)).get());

        Future<String> leaky = pool.submit(() -> { CURRENT_USER.set("leaky-user"); return "set without remove"; });
        leaky.get();
        System.out.println("next task on the same pooled thread sees: " + pool.submit(() -> CURRENT_USER.get()).get());
        pool.shutdown();

        InheritableThreadLocal<String> traceId = new InheritableThreadLocal<>();
        traceId.set("trace-42");
        Thread child = new Thread(() -> System.out.println("child inherited " + traceId.get()));
        child.start(); child.join();

        SimpleDateFormat f1 = FORMAT.get();
        Thread other = new Thread(() -> System.out.println("each thread has its own formatter: " + (FORMAT.get() != f1)));
        other.start(); other.join();
    }

    static void sleep() { try { Thread.sleep(20); } catch (InterruptedException ignored) { } }
}`,
    walk:
      "Threads A and B set different values in the same `ThreadLocal` and each sees only its own; `main` never set one, so it sees null. `handleRequest` stores the user for the duration of a request so `audit` can read it without a parameter, and removes it in `finally`.\n\nThe leaky task sets a value on the pool's single thread and never removes it, so the next, unrelated task on that thread sees \"leaky-user\": exactly how user data leaks between requests in a server. `InheritableThreadLocal` passes the trace id to a child thread, and `withInitial` gives each thread its own `SimpleDateFormat`.",
    anim: [
      "Each thread has its own map",
      [
        ["tl", "CURRENT_USER", "ThreadLocal key"],
        ["ta", "Thread A", "map: asha"],
        ["tb", "Thread B", "map: ravi"],
        ["pool", "pooled thread", "reused"],
        ["leak", "stale value", "if not removed"],
      ],
      [
        ["ta", "tl", "set/get", "Thread A stores \"asha\" in its own ThreadLocalMap under the CURRENT_USER key."],
        ["tb", "tl", "set/get", "Thread B stores \"ravi\" in its own map; neither sees the other's value."],
        ["pool", "tl", "reuse", "A pooled thread runs task after task with the same map."],
        ["pool", "leak", "no remove", "Without remove(), the next task inherits the previous task's value."],
      ],
    ],
    mistakes: [
      "Forgetting `remove()` in thread pools, leaking data between requests and memory.",
      "Using ThreadLocal as a hidden global variable that makes code hard to test.",
      "Expecting a value set in one thread to be visible to tasks running in other threads (for example after an async hop).",
    ],
    qa: [
      ["What is ThreadLocal?", "A class that provides a separate value of a variable for each thread that accesses it."],
      ["How does ThreadLocal work internally?", "Each Thread holds a ThreadLocalMap; the ThreadLocal instance is a weakly referenced key and the value is stored in the current thread's map."],
      ["Why can ThreadLocal cause memory leaks?", "In long-lived pool threads, values that are never removed stay strongly referenced by the thread's map, and stale data can leak to later tasks."],
    ],
    ex: [
      "Write a ThreadLocal-based correlation id that every log line in a request prints, and make sure it is cleared.",
      "`static final ThreadLocal<String> CID = new ThreadLocal<>();` set it at the start of the request (`CID.set(UUID.randomUUID().toString())`), read it in the logger, and call `CID.remove()` in a finally block at the end.",
    ],
  }),

  lesson("Implementing a Custom Thread Pool", {
    intro:
      "A thread pool keeps a fixed set of worker threads and feeds them tasks from a queue, avoiding the cost of creating a thread per task and limiting concurrency. Building a simple one by hand shows exactly what `ExecutorService` does for you. This lesson implements a custom pool with a blocking queue, worker threads, task submission and graceful shutdown.",
    topics: [
      [
        "Why thread pools",
        "Creating a platform thread is expensive (OS thread, stack memory). A pool reuses a few threads for many tasks, bounds the number of concurrent threads so the machine is not overloaded, and queues extra work.",
      ],
      [
        "Design",
        "A `BlockingQueue<Runnable>` holds submitted tasks. N worker threads loop: take a task from the queue, run it, catch any exception so the worker survives, repeat. `submit` adds to the queue. A shutdown flag stops new submissions; workers exit when the queue is empty and shutdown was requested (or when interrupted).",
      ],
      [
        "Shutdown",
        "Graceful shutdown: reject new tasks, let workers finish queued tasks, then stop (like `shutdown()`). Immediate shutdown: interrupt workers and drain the queue (like `shutdownNow()`). `awaitTermination` is joining the workers.",
      ],
      [
        "What real executors add",
        "`ThreadPoolExecutor` adds core and maximum pool sizes, keep-alive for idle threads, rejection policies (abort, caller-runs, discard), `Future` results, thread factories for naming, and hooks for monitoring. Use it in production; the custom pool is for understanding.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static class SimpleThreadPool {
        private final BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
        private final List<Thread> workers = new ArrayList<>();
        private volatile boolean shutdown = false;

        SimpleThreadPool(int size) {
            for (int i = 1; i <= size; i++) {
                Thread worker = new Thread(this::workLoop, "pool-worker-" + i);
                workers.add(worker);
                worker.start();
            }
        }

        private void workLoop() {
            while (true) {
                Runnable task;
                try {
                    task = queue.poll(50, TimeUnit.MILLISECONDS);
                } catch (InterruptedException e) {
                    return;                                       // shutdownNow
                }
                if (task == null) {
                    if (shutdown) return;                         // queue drained after shutdown
                    continue;
                }
                try {
                    task.run();
                } catch (RuntimeException e) {                    // keep the worker alive
                    System.out.println("  task failed: " + e.getMessage() + " (worker survives)");
                }
            }
        }

        void submit(Runnable task) {
            if (shutdown) throw new IllegalStateException("pool is shut down");
            queue.add(task);
        }

        void shutdown() { shutdown = true; }

        boolean awaitTermination(long ms) throws InterruptedException {
            long deadline = System.currentTimeMillis() + ms;
            for (Thread w : workers) w.join(Math.max(1, deadline - System.currentTimeMillis()));
            return workers.stream().noneMatch(Thread::isAlive);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        SimpleThreadPool pool = new SimpleThreadPool(3);
        AtomicInteger completed = new AtomicInteger();
        List<String> workersUsed = Collections.synchronizedList(new ArrayList<>());

        for (int i = 1; i <= 10; i++) {
            int id = i;
            pool.submit(() -> {
                if (id == 5) throw new IllegalArgumentException("task 5 is broken");
                workersUsed.add(Thread.currentThread().getName());
                try { Thread.sleep(20); } catch (InterruptedException ignored) { }
                completed.incrementAndGet();
            });
        }

        pool.shutdown();
        boolean terminated = pool.awaitTermination(5_000);
        System.out.println("completed tasks: " + completed.get() + " of 10 (one failed)");
        System.out.println("distinct worker threads used: " + workersUsed.stream().distinct().count() + " (threads reused for many tasks)");
        System.out.println("pool terminated: " + terminated);
        try {
            pool.submit(() -> { });
        } catch (IllegalStateException e) {
            System.out.println("submit after shutdown: " + e.getMessage());
        }
    }
}`,
    walk:
      "The pool starts three workers that loop, polling a shared `LinkedBlockingQueue` for tasks. Ten tasks are submitted; task 5 throws, and the worker catches the exception so it keeps serving other tasks. Only three distinct threads run all ten tasks, which is the whole point of pooling.\n\n`shutdown()` sets a volatile flag; workers finish the queued tasks and exit when they find the queue empty, so `awaitTermination` (joining the workers) returns true. Submitting afterwards is rejected, just like `RejectedExecutionException` from a real executor.",
    anim: [
      "Workers pulling from a queue",
      [
        ["client", "submit(task)", "callers"],
        ["queue", "BlockingQueue", "pending tasks"],
        ["w1", "worker-1", "loop: take, run"],
        ["w2", "worker-2", "loop: take, run"],
        ["w3", "worker-3", "loop: take, run"],
      ],
      [
        ["client", "queue", "enqueue", "submit() just places the task in the shared queue and returns."],
        ["queue", "w1", "take", "An idle worker takes the next task and runs it on its own thread."],
        ["queue", "w2", "take", "Other workers take other tasks in parallel; at most 3 run at once."],
        ["w3", "queue", "repeat", "After a task finishes, the worker loops back for the next one."],
      ],
    ],
    mistakes: [
      "Letting a task's exception kill the worker thread.",
      "Using an unbounded queue in production without back-pressure.",
      "Forgetting to shut the pool down, which keeps non-daemon worker threads (and the JVM) alive.",
    ],
    qa: [
      ["Why use a thread pool?", "To reuse threads instead of creating one per task, to bound concurrency, and to queue excess work."],
      ["How does a thread pool work internally?", "Worker threads repeatedly take tasks from a blocking queue and run them; submissions add to the queue."],
      ["What does ThreadPoolExecutor add beyond a basic pool?", "Core/max sizes, keep-alive, rejection policies, Futures, thread factories and lifecycle hooks."],
    ],
    ex: [
      "Add a `submit(Callable<T>)` that returns a result. What would you return to the caller?",
      "Wrap the callable in a `FutureTask<T>`, put the FutureTask (it is a Runnable) in the queue, and return it as a `Future<T>`; the caller uses `get()` to wait for the result.",
    ],
  }),

  lesson("Shutdown Hooks and Uncaught Exception Handlers", {
    intro:
      "Two hooks let you react to the end of threads and of the JVM itself. Shutdown hooks run when the JVM is shutting down, so you can flush logs and release resources. Uncaught exception handlers run when a thread dies from an exception nobody caught, so you can log it or alert. This lesson covers `Runtime.addShutdownHook`, `setDefaultUncaughtExceptionHandler` and per-thread handlers.",
    topics: [
      [
        "Shutdown hooks",
        "`Runtime.getRuntime().addShutdownHook(thread)` registers an unstarted thread that the JVM starts during an orderly shutdown: the last non-daemon thread ends, `System.exit` is called, or the process receives Ctrl+C or SIGTERM. Hooks run concurrently in unspecified order. They do not run on `Runtime.halt`, `kill -9`, power loss or a JVM crash.",
      ],
      [
        "Writing good shutdown hooks",
        "Keep them fast and thread-safe, do not depend on other services that may already be shutting down, never call `System.exit` inside one, and avoid long blocking work (the OS may kill the process). Typical work: flush buffers, close connection pools, deregister from service discovery.",
      ],
      [
        "Uncaught exception handlers",
        "When an exception escapes `run()`, the JVM calls the thread's handler: first `thread.setUncaughtExceptionHandler(h)`, then the thread group's, then `Thread.setDefaultUncaughtExceptionHandler(h)` for all threads, and finally the default behaviour of printing the stack trace to stderr. The thread still dies.",
      ],
      [
        "Executors and exceptions",
        "Tasks submitted with `submit()` capture exceptions in their `Future`, so the handler is not called; call `future.get()` to see them. Tasks run with `execute()` let the exception reach the worker thread's handler.",
      ],
    ],
    code: String.raw`import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        Runtime.getRuntime().addShutdownHook(new Thread(() ->
                System.out.println("shutdown hook: flushed logs and closed resources"), "cleanup-hook"));

        java.util.concurrent.CountDownLatch poolErrorHandled = new java.util.concurrent.CountDownLatch(1);
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            System.out.println("default handler: " + t.getName() + " died with " + e.getClass().getSimpleName() + ": " + e.getMessage());
            if (t.getName().equals("pool-thread")) poolErrorHandled.countDown();
        });

        Thread worker = new Thread(() -> { throw new IllegalStateException("config missing"); }, "worker-1");
        worker.start();
        worker.join();
        System.out.println("worker-1 state after uncaught exception: " + worker.getState());

        Thread special = new Thread(() -> { throw new ArithmeticException("divide by zero"); }, "worker-2");
        special.setUncaughtExceptionHandler((t, e) -> System.out.println("thread-specific handler for " + t.getName() + ": " + e.getMessage()));
        special.start();
        special.join();

        ExecutorService pool = Executors.newSingleThreadExecutor(r -> new Thread(r, "pool-thread"));
        Future<?> future = pool.submit(() -> { throw new RuntimeException("hidden in Future"); });
        try {
            future.get();
        } catch (ExecutionException e) {
            System.out.println("submit(): exception captured in Future -> " + e.getCause().getMessage());
        }
        pool.execute(() -> { throw new RuntimeException("reaches the handler"); });
        pool.shutdown();
        poolErrorHandled.await(5, java.util.concurrent.TimeUnit.SECONDS);   // the handler runs as the worker dies

        System.out.println("main finished; JVM shutting down");
    }
}`,
    walk:
      "A shutdown hook is registered first; it runs at the very end when the JVM shuts down after `main` returns. The default uncaught exception handler then reports that \"worker-1\" died with an `IllegalStateException`; the thread is TERMINATED either way.\n\n\"worker-2\" has its own handler, which takes precedence over the default. In the executor, the exception from `submit()` is stored in the `Future` and only appears when `get()` wraps it in `ExecutionException`, while the task run with `execute()` throws on the pool thread and reaches the default handler.",
    anim: [
      "Where an uncaught exception goes",
      [
        ["run", "run() throws", "not caught"],
        ["own", "thread handler", "if set"],
        ["group", "ThreadGroup", "uncaughtException"],
        ["def", "default handler", "global"],
        ["dies", "thread dies", "TERMINATED"],
      ],
      [
        ["run", "own", "first", "The JVM first looks for a handler set on this thread."],
        ["own", "group", "else", "If there is none, the thread group's uncaughtException is called."],
        ["group", "def", "delegate", "The group delegates to the default handler set for all threads."],
        ["def", "dies", "after", "After the handler runs, the thread terminates; the JVM keeps running."],
      ],
    ],
    mistakes: [
      "Relying on shutdown hooks for critical persistence; they do not run on kill -9 or crashes.",
      "Calling System.exit from a shutdown hook (it blocks forever).",
      "Losing executor task exceptions by never calling `Future.get()`.",
    ],
    qa: [
      ["What is a shutdown hook?", "An initialized but unstarted thread registered with Runtime.addShutdownHook that the JVM runs during an orderly shutdown."],
      ["When do shutdown hooks not run?", "On Runtime.halt, kill -9 (SIGKILL), JVM crashes and power loss."],
      ["How do you handle exceptions in threads you did not write try-catch for?", "Set an UncaughtExceptionHandler on the thread or a default one with Thread.setDefaultUncaughtExceptionHandler."],
      ["Why doesn't the uncaught exception handler fire for submit()?", "submit wraps the task in a FutureTask that catches the exception and stores it; it surfaces only via Future.get()."],
    ],
    ex: [
      "Write a default handler that logs the thread name and full stack trace to stderr.",
      "`Thread.setDefaultUncaughtExceptionHandler((t, e) -> { System.err.println(\"Thread \" + t.getName() + \" failed\"); e.printStackTrace(); });`.",
    ],
  }),

  lesson("Green Threads vs Native Threads and Virtual Threads", {
    intro:
      "How Java threads map onto the operating system has changed over time. Early JVMs used green threads scheduled by the JVM, modern JVMs use native OS threads, and Java 21 introduced virtual threads, which bring back lightweight user-mode scheduling at scale. This lesson compares the three models and covers related facts: why platform threads are heavyweight and why constructors cannot be synchronized.",
    topics: [
      [
        "Green threads",
        "In Java 1.1 on some platforms (notably Solaris), the JVM implemented threads itself in user space: all Java threads ran on a single OS thread and the JVM switched between them. Creation and switching were cheap, but they could not use multiple CPU cores, and one blocking system call blocked every thread.",
      ],
      [
        "Native (platform) threads",
        "Since Java 1.3 HotSpot maps each Java thread one-to-one to an operating-system thread. The OS schedules them on all cores, and blocking one does not affect others. The cost: each thread has a large fixed stack and kernel resources, so only a few thousand are practical. These are now called platform threads.",
      ],
      [
        "Virtual threads (Java 21)",
        "Virtual threads are managed by the JVM and run on a small pool of carrier platform threads. When a virtual thread blocks on I/O or a lock, the JVM unmounts it and the carrier runs another one. Millions can exist at once, which makes thread-per-request servers scale again. Create them with `Thread.ofVirtual().start(...)` or `Executors.newVirtualThreadPerTaskExecutor()`. They are not faster for CPU-bound work, only better at waiting.",
      ],
      [
        "Constructors cannot be synchronized",
        "`synchronized` is not allowed on constructors (compile error). The object under construction is not visible to other threads until the constructor finishes and publishes the reference, so there is nothing to lock against. If a constructor touches shared static data, use a synchronized block on a shared lock inside it, and never let `this` escape during construction.",
      ],
    ],
    code: String.raw`import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

public class Main {
    static class Registry {
        static int instances = 0;
        // synchronized Registry() { }   // compile error: constructors cannot be synchronized
        Registry() {
            synchronized (Registry.class) { instances++; }   // lock shared static state instead
        }
    }

    public static void main(String[] args) throws Exception {
        Thread platform = Thread.ofPlatform().name("platform-1").start(() -> { });
        platform.join();
        Thread virtual = Thread.ofVirtual().name("virtual-1").start(() -> { });
        virtual.join();
        System.out.println("platform thread is virtual: " + platform.isVirtual() + ", virtual thread is virtual: " + virtual.isVirtual());

        AtomicInteger done = new AtomicInteger();
        long start = System.nanoTime();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            IntStream.range(0, 10_000).forEach(i -> executor.submit(() -> {
                Thread.sleep(Duration.ofMillis(100));        // blocking: the carrier is released
                done.incrementAndGet();
                return null;
            }));
        }                                                     // close() waits for all tasks
        long ms = (System.nanoTime() - start) / 1_000_000;
        System.out.println("10,000 virtual threads each slept 100 ms: all done = " + (done.get() == 10_000)
                + ", took well under 10 s: " + (ms < 10_000));

        Thread carrierInfo = Thread.ofVirtual().unstarted(() ->
                System.out.println("virtual thread toString shows its carrier: " + Thread.currentThread().toString().contains("ForkJoinPool")));
        carrierInfo.start();
        carrierInfo.join();

        Thread[] creators = new Thread[4];
        for (int i = 0; i < 4; i++) { creators[i] = new Thread(() -> { for (int j = 0; j < 1000; j++) new Registry(); }); creators[i].start(); }
        for (Thread t : creators) t.join();
        System.out.println("constructor guarded with a synchronized block: instances = " + Registry.instances);
    }
}`,
    walk:
      "`Thread.ofPlatform()` creates a classic OS-backed thread and `Thread.ofVirtual()` a virtual one; `isVirtual()` tells them apart. The program then submits 10,000 tasks that each sleep 100 ms to a virtual-thread-per-task executor. Because sleeping virtual threads release their carriers, all of them finish in a fraction of a second instead of the 10+ seconds a small platform pool would need.\n\nA virtual thread's `toString()` shows the ForkJoinPool carrier it is mounted on. Finally, since constructors cannot be `synchronized`, `Registry` protects its shared static counter with a synchronized block, so 4,000 concurrent constructions count exactly.",
    anim: [
      "Virtual threads on carriers",
      [
        ["v1", "virtual 1", "running"],
        ["v2", "virtual 2", "blocked on I/O"],
        ["v3", "virtual 3", "waiting to run"],
        ["carrier", "carrier thread", "OS thread"],
        ["heap", "heap", "parked stacks"],
      ],
      [
        ["v1", "carrier", "mounted", "A virtual thread runs by being mounted on a carrier platform thread."],
        ["v2", "heap", "unmount", "When it blocks on I/O or sleep, its stack is saved to the heap and it unmounts."],
        ["v3", "carrier", "mount", "The freed carrier immediately runs another ready virtual thread."],
        ["heap", "v2", "resume", "When the I/O completes, the parked virtual thread is mounted again to continue."],
      ],
    ],
    mistakes: [
      "Pooling virtual threads; create one per task instead.",
      "Expecting virtual threads to speed up CPU-bound computations.",
      "Long synchronized blocks around blocking I/O in virtual threads on older JDKs, which pins the carrier.",
    ],
    qa: [
      ["What are green threads?", "Threads implemented and scheduled by the JVM in user space on a single OS thread, used by early JVMs; they could not use multiple cores."],
      ["What is the difference between green threads and native threads?", "Green threads are scheduled by the JVM on one OS thread; native threads map one-to-one to OS threads scheduled by the kernel across all cores."],
      ["What are virtual threads?", "Lightweight JVM-managed threads (Java 21) multiplexed on a few carrier threads, unmounted while blocking, so millions can run concurrently."],
      ["Can a constructor be synchronized?", "No. It is a compile error; the object is not shared until construction completes."],
    ],
    ex: [
      "A web server handles 50,000 concurrent requests that each wait 200 ms for a database. Platform thread pool of 200 or virtual threads? Why?",
      "Virtual threads: each request can have its own thread, and blocked ones release their carriers, whereas 200 platform threads would queue most requests and add large latency.",
    ],
  }),

  lesson("Guidelines for Writing Thread-Safe Code", {
    intro:
      "Thread safety is easier to design in than to bolt on. A small set of guidelines prevents most concurrency bugs: avoid shared mutable state, prefer immutability and confinement, use the right concurrent building blocks, and document your locking. This lesson lists those guidelines and illustrates each in one program.",
    topics: [
      [
        "1. Prefer immutability",
        "Immutable objects (final fields, no setters, defensive copies) are automatically thread-safe and can be shared freely. Records and `List.of` help.",
      ],
      [
        "2. Confine state to a thread",
        "Local variables are always thread-confined. Keep mutable objects inside one thread (stack confinement, ThreadLocal, or an actor-like single consumer) and pass results through thread-safe handoffs like queues or futures.",
      ],
      [
        "3. Use concurrent utilities instead of hand-written locking",
        "Atomic classes for counters, `ConcurrentHashMap` and concurrent queues for shared collections, executors instead of raw threads, `CountDownLatch`, `CompletableFuture` and friends for coordination.",
      ],
      [
        "4. When locking, lock correctly",
        "Guard every access to a piece of shared state (reads and writes) with the same lock, keep critical sections short, acquire multiple locks in a consistent order, never call alien code while holding a lock, and use private lock objects.",
      ],
      [
        "5. Publish safely and document",
        "Do not let `this` escape from constructors; publish shared objects through final fields, volatile fields, locks or concurrent collections. Document which classes are thread-safe and which lock guards which field (for example with comments or `@GuardedBy`).",
      ],
    ],
    code: String.raw`import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.LongAdder;

public class Main {
    record Price(String sku, long paise) { }                         // 1. immutable value

    static final Map<String, LongAdder> VIEWS = new ConcurrentHashMap<>();   // 3. concurrent utilities

    static class Inventory {                                          // 4. one private lock guards both fields
        private final Object lock = new Object();
        private int reserved;                                         // @GuardedBy("lock")
        private int available = 100;                                  // @GuardedBy("lock")
        boolean reserve(int qty) {
            synchronized (lock) {
                if (available < qty) return false;                    // check and act under one lock
                available -= qty;
                reserved += qty;
                return true;
            }
        }
        int[] snapshot() { synchronized (lock) { return new int[] {available, reserved}; } }
    }

    static long totalOf(List<Price> prices) {                         // 2. local state is confined
        long sum = 0;
        for (Price p : prices) sum += p.paise();
        return sum;
    }

    public static void main(String[] args) throws Exception {
        List<Price> catalog = List.of(new Price("pen", 1_000), new Price("ink", 4_500));   // shared safely
        Inventory inventory = new Inventory();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        List<Callable<Boolean>> tasks = new java.util.ArrayList<>();
        for (int i = 0; i < 200; i++) {
            tasks.add(() -> {
                VIEWS.computeIfAbsent("pen", k -> new LongAdder()).increment();
                totalOf(catalog);
                return inventory.reserve(1);
            });
        }
        long successes = 0;
        for (Future<Boolean> f : pool.invokeAll(tasks)) if (f.get()) successes++;   // 5. safe handoff via Future
        pool.shutdown();

        int[] snap = inventory.snapshot();
        System.out.println("reservations succeeded: " + successes + " (never more than stock)");
        System.out.println("available " + snap[0] + ", reserved " + snap[1] + ", invariant holds: " + (snap[0] + snap[1] == 100));
        System.out.println("pen views counted exactly: " + VIEWS.get("pen").sum());
        System.out.println("immutable catalog unchanged: " + catalog);
    }
}`,
    walk:
      "The catalog is a list of immutable records, so all threads can read it without locks. `totalOf` works only with local variables, which are confined to each thread. View counts use a `ConcurrentHashMap` of `LongAdder`s instead of manual locking.\n\n`Inventory` keeps two related fields consistent by guarding both with one private lock, and performs the check-then-act inside that lock, so exactly 100 of the 200 reservation attempts succeed and `available + reserved` always equals 100. Results come back through `Future`s from `invokeAll`, a safe handoff between threads.",
    anim: [
      "Thread-safety toolbox",
      [
        ["state", "shared state?", "start here"],
        ["imm", "immutable", "share freely"],
        ["conf", "confined", "one thread only"],
        ["conc", "concurrent utils", "atomics, CHM"],
        ["lock", "one lock", "guards invariant"],
      ],
      [
        ["state", "imm", "no mutation", "If the data never changes, make it immutable and share it without locks."],
        ["state", "conf", "no sharing", "If only one thread needs it, keep it confined to that thread."],
        ["state", "conc", "simple sharing", "For counters and maps, use atomic classes and concurrent collections."],
        ["state", "lock", "invariants", "If several fields must change together, guard them all with one lock."],
      ],
    ],
    mistakes: [
      "Making each field thread-safe individually while multi-field invariants remain unprotected.",
      "Sharing mutable objects \"temporarily\" without synchronization.",
      "Adding synchronized everywhere, which causes contention and deadlocks without guaranteeing correctness.",
    ],
    qa: [
      ["What makes a class thread-safe?", "It behaves correctly when accessed from multiple threads without extra synchronization by callers, typically through immutability, confinement or proper internal synchronization."],
      ["Why is immutability good for concurrency?", "Immutable objects cannot change after construction, so they can be shared without locks and never expose inconsistent state."],
      ["What is thread confinement?", "Ensuring mutable data is only ever accessed by one thread, such as local variables or ThreadLocal values."],
    ],
    ex: [
      "A class has `private int min; private int max;` that must always satisfy min <= max. Is making both volatile enough?",
      "No. volatile gives visibility per field but not atomic updates of both; a thread could see a new min with an old max. Guard both with one lock, or store them in an immutable object referenced by a single volatile or AtomicReference field.",
    ],
  }),

  lesson("Thread Interview Questions", {
    intro:
      "Threads generate some of the deepest interview questions in Java. This lesson collects the most frequently asked ones with concise answers, from basics to tricky behaviour, and the program demonstrates a few classic questions such as whether `main` waits for other threads and what happens to an exception in another thread.",
    topics: [
      [
        "Fundamentals",
        "Process vs thread; ways to create threads; Runnable vs Thread; start vs run; thread states; daemon threads; priorities; join, sleep, yield; wait vs sleep; notify vs notifyAll; why wait/notify are in Object.",
      ],
      [
        "Synchronization and memory",
        "synchronized methods vs blocks; object lock vs class lock; reentrancy; volatile vs synchronized; happens-before; race conditions; atomic variables; double-checked locking; immutability; ThreadLocal.",
      ],
      [
        "Liveness and design",
        "Deadlock and how to detect and avoid it; livelock (threads keep reacting to each other without progress); starvation; busy spinning; thread pools and their sizing; producer-consumer; interrupting threads; shutdown hooks; virtual threads.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) throws Exception {
        Thread background = new Thread(() -> {
            try { Thread.sleep(200); } catch (InterruptedException ignored) { }
            System.out.println("Q1 non-daemon worker still finished after main's last line");
        });
        background.start();

        Thread failing = new Thread(() -> { throw new RuntimeException("boom"); });
        failing.setUncaughtExceptionHandler((t, e) -> System.out.println("Q2 exception in another thread does not reach main: " + e.getMessage()));
        failing.start();
        failing.join();
        System.out.println("Q2 main keeps running after the other thread died");

        Thread t = new Thread(() -> { });
        System.out.println("Q3 default thread name pattern: " + t.getName().startsWith("Thread-"));

        Object lock = new Object();
        synchronized (lock) {
            synchronized (lock) {
                System.out.println("Q4 a thread can re-enter a monitor it already holds (reentrant)");
            }
        }

        Thread sleeper = new Thread(() -> {
            synchronized (lock) { try { lock.wait(100); } catch (InterruptedException ignored) { } }
        });
        sleeper.start();
        Thread.sleep(20);
        boolean acquired;
        synchronized (lock) { acquired = true; }
        System.out.println("Q5 wait() released the lock, so main could take it: " + acquired);
        sleeper.join();

        System.out.println("Q6 main thread name: " + Thread.currentThread().getName() + ", priority " + Thread.currentThread().getPriority());
        System.out.println("main's last line printed");
    }
}`,
    walk:
      "Q1: the background thread is not a daemon, so the JVM waits for it; its message appears after main's last line. Q2: an exception in another thread goes to that thread's handler and never propagates to `main`, which carries on. Q3: unnamed threads are called \"Thread-0\", \"Thread-1\" and so on.\n\nQ4: nested `synchronized` blocks on the same object work because monitors are reentrant. Q5: while the other thread is inside `lock.wait(100)`, `main` can acquire the same lock, proving that `wait` releases it. Q6 prints the main thread's name and default priority.",
    anim: [
      "Does main wait for other threads?",
      [
        ["main", "main()", "returns"],
        ["user", "worker", "non-daemon"],
        ["jvm", "JVM", "checks threads"],
        ["wait", "keep running", "until worker ends"],
        ["exit", "exit", "no user threads"],
      ],
      [
        ["main", "jvm", "ends", "When main returns, the JVM checks for remaining non-daemon threads."],
        ["user", "jvm", "alive", "The worker is a non-daemon thread and is still sleeping."],
        ["jvm", "wait", "wait", "So the JVM keeps running even though main has finished."],
        ["wait", "exit", "done", "When the worker finishes, no user threads remain and the JVM exits."],
      ],
    ],
    mistakes: [
      "Assuming main finishing ends the program while non-daemon threads still run.",
      "Assuming exceptions in worker threads propagate to the thread that started them.",
    ],
    qa: [
      ["What is a livelock?", "Threads that keep changing state in response to each other (for example both politely backing off and retrying) so neither makes progress, although none is blocked."],
      ["How many threads should a thread pool have?", "For CPU-bound work about the number of cores; for I/O-bound work more, roughly cores * (1 + wait time / compute time)."],
      ["Can we call run() directly?", "Yes, but it runs in the calling thread like a normal method; no new thread is created."],
      ["What happens if a thread throws an exception?", "If uncaught, the thread's uncaught exception handler runs and the thread terminates; other threads continue."],
      ["What is the difference between a user thread and a daemon thread?", "The JVM waits for user threads before exiting, but not for daemon threads."],
      ["What is context switching?", "The CPU saving one thread's state and restoring another's so they can share a core; it has a cost, which is why too many threads hurt performance."],
    ],
    ex: [
      "Without running it, what does this print? `Thread t = new Thread(() -> System.out.print(\"A\")); t.run(); t.start(); t.join(); System.out.print(\"B\");`",
      "\"AAB\": run() prints A on the main thread, start() runs the task again on the new thread (another A), join waits for it, then B.",
    ],
  }),
]);
