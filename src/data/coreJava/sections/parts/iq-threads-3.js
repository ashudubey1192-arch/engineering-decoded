import { lesson } from "../../schema.js";

export default [
  lesson("Threads Output Questions Q61-Q71: Shared Runnables, join, Interrupts, wait Without notify and Deadlock", {
    intro:
      "Output questions 61 to 71 show small thread programs and ask what they print, or whether they hang. They cover:\n\n- two threads sharing one Runnable\n- join between starts\n- a loop stopped by interrupt while main reads input\n- `wait()` on `this` with nobody to notify\n- producer-consumer with a delay\n- `wait(1000)` with no notify\n- `thread1.sleep()` called from main\n- code after notify inside a synchronized block\n- an anonymous subclass of a Thread subclass\n- two threads calling a synchronized method through an unsynchronized run\n- a deadlock on `String.class` and `Object.class`\n\nThe program runs every case safely, using timeouts wherever the original would hang.",
    topics: [
      [
        "Q61 (output). Two threads share one Runnable that prints start and end. What is printed?",
        "Both threads run the **same** `run()` method on the same Runnable object, so each prints its own \"start\" and \"end\" lines with its thread name. The **interleaving is unpredictable**: you may see `T1 start, T2 start, T1 end, T2 end`, or any other order consistent with each thread printing start before its own end. Only that per-thread order is guaranteed. Any instance field of the shared Runnable is shared by both threads, so it needs synchronization if they modify it.",
        "Runnable task = () -> { print(name() + \" start\"); print(name() + \" end\"); };\nnew Thread(task, \"T1\").start();\nnew Thread(task, \"T2\").start();   // order varies",
      ],
      [
        "Q62 (output). What does join between starts do?",
        "`t1.start(); t1.join(); t2.start();` makes main wait until t1 has completely finished before t2 even starts. The output is therefore **deterministic**: all of t1's lines, then all of t2's lines. The two threads never run concurrently, so the concurrency is lost, but the order is guaranteed. Moving `t1.join()` after `t2.start()` lets them overlap again.",
        "t1.start(); t1.join();   // t1 finishes completely\nt2.start(); t2.join();   // then t2 runs",
      ],
      [
        "Q63 (output). A loop runs until interrupted while main blocks in System.in.read(). What happens?",
        "The worker loops `while (!isInterrupted())`. Main blocks in `System.in.read()` until the user presses Enter, then calls `worker.interrupt()`. The flag is set, the loop condition becomes false, and the worker prints its final line and ends. If the worker was inside `sleep()`, it gets InterruptedException instead, which also clears the flag, so its catch must exit or re-interrupt. Until input arrives, the worker keeps looping. The program feeds a newline through stdin to simulate pressing Enter.",
        "Thread worker = new Thread(() -> { while (!Thread.currentThread().isInterrupted()) { /* work */ } print(\"stopped\"); });\nworker.start();\nSystem.in.read();        // waits for Enter\nworker.interrupt();",
      ],
      [
        "Q64 (output). A thread calls wait() on this and nobody ever notifies it. What happens?",
        "The thread enters WAITING and **never returns** (apart from a rare spurious wake-up). If it is a non-daemon thread, the **JVM never exits**: main can finish, but the program hangs. Nothing is printed after the wait call. The fixes are `wait(timeout)`, a notify somewhere, an interrupt, or making the thread a daemon. A thread dump would show it parked in `Object.wait`.",
        "synchronized void waitForever() throws InterruptedException {\n    wait();                       // no notify anywhere: hangs\n    System.out.println(\"never\");\n}",
      ],
      [
        "Q65 (output). The consumer starts after a delay. Does producer-consumer still work?",
        "Yes, if the code waits in a **loop on a condition**. The producer fills the buffer and then waits while it is full. The consumer starts later, finds the items, consumes them and notifies. No signal is lost, because the condition, not the notification, is what matters. Code that calls `notify()` **before** anyone is waiting and uses `if` checks may lose that signal, but a condition loop simply sees that the buffer has data. The output is the same values in the same order, just later.",
        "// producer: while (full) wait(); add; notifyAll();\n// consumer starts 200 ms later: while (empty) wait(); remove; notifyAll();",
      ],
      [
        "Q66 (output). What does wait(1000) with no notify do?",
        "The thread waits in TIMED_WAITING for about **one second**, then wakes up by itself, re-acquires the monitor and continues. The lines after the wait are printed roughly 1 second later. It never hangs, because the timeout acts as a built-in wake-up. There is no indication of *why* it woke (timeout or notify), so code should re-check its condition.",
        "synchronized (lock) {\n    lock.wait(1000);   // returns after ~1 s even without notify\n    System.out.println(\"woke up\");\n}",
      ],
      [
        "Q67 (output). Main calls thread1.sleep(2000). Which thread sleeps?",
        "**Main sleeps**, not thread1. `sleep` is a **static** method of Thread that always pauses the *current* thread. Calling it through an instance reference (`thread1.sleep(2000)`) compiles, with a warning, but the reference is ignored. So main pauses for 2 seconds, while thread1 keeps running and may finish before main resumes. This trick question tests whether you know which Thread methods are static: sleep, yield, currentThread and interrupted.",
        "thread1.start();\nthread1.sleep(2000);   // pauses MAIN, not thread1\nSystem.out.println(\"main resumes\");",
      ],
      [
        "Q68 (output). More code runs after notify() inside the synchronized block. When does the waiter continue?",
        "`notify()` does not release the lock. The notifier continues executing the rest of its synchronized block. The woken thread moves to BLOCKED and continues only **after the notifier leaves the block**. So all lines printed after `notify()` inside the block appear **before** the waiter's post-wait output.",
        "synchronized (lock) {\n    lock.notify();\n    System.out.println(\"notifier still inside\");   // printed first\n}\n// waiter prints after the block exits",
      ],
      [
        "Q69 (output). An anonymous subclass of a Thread subclass overrides run. Which run executes?",
        "The **most derived** override wins. `new MyThread() { public void run() { ... } }.start()` runs the anonymous class's `run()`, not MyThread's, through normal dynamic dispatch. If the anonymous `run()` calls `super.run()`, MyThread's version runs as well, in the same thread. A Runnable passed to the constructor is ignored unless some run in the chain calls `Thread.run()`.",
        "class MyThread extends Thread { public void run() { System.out.println(\"MyThread.run\"); } }\nnew MyThread() { public void run() { System.out.println(\"anonymous run\"); } }.start();   // anonymous run",
      ],
      [
        "Q70 (output). Two threads call a synchronized method through an unsynchronized run. Is the output interleaved?",
        "`run()` itself is not synchronized, but if both threads call `shared.print()`, which **is** synchronized, on the **same** object, then each call executes completely before the other thread's call can start. So each block of output lines from one call stays together, while the order of the calls between the threads still varies. If each thread uses a *different* object, the locks differ and the lines can interleave.",
        "class Printer { synchronized void print(String who) { for (int i = 0; i < 3; i++) System.out.println(who + i); } }\n// both threads: printer.print(name)  -> blocks of 3 lines never mix",
      ],
      [
        "Q71 (output). Two threads lock String.class and Object.class in opposite orders. What happens?",
        "A **deadlock** is possible, and with a short sleep between the two locks it is practically guaranteed. Thread 1 locks `String.class` and then wants `Object.class`, while thread 2 locks `Object.class` and then wants `String.class`. Each holds what the other needs. Neither prints its \"got both\" line, and the program hangs forever. Class literals are global singletons, so even unrelated code locking them can join the deadlock. The fix is one global lock order.",
        "t1: synchronized (String.class) { sleep(100); synchronized (Object.class) { print(\"t1\"); } }\nt2: synchronized (Object.class) { sleep(100); synchronized (String.class) { print(\"t2\"); } }   // deadlock",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static void pause(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }

    static class MyThread extends Thread { @Override public void run() { System.out.println("Q69 MyThread.run"); } }
    static class Printer { synchronized void print(String who, List<String> out) { for (int i = 0; i < 3; i++) out.add(who); } }

    public static void main(String[] args) throws Exception {
        // Q61: one shared Runnable, two threads. Only per-thread order is guaranteed.
        List<String> log61 = Collections.synchronizedList(new ArrayList<>());
        Runnable task = () -> { String n = Thread.currentThread().getName(); log61.add(n + " start"); log61.add(n + " end"); };
        Thread t1 = new Thread(task, "T1"), t2 = new Thread(task, "T2");
        t1.start(); t2.start(); t1.join(); t2.join();
        boolean perThreadOrder = log61.indexOf("T1 start") < log61.indexOf("T1 end") && log61.indexOf("T2 start") < log61.indexOf("T2 end");
        System.out.println("Q61 4 lines printed, each thread's start before its end: " + perThreadOrder);

        // Q62: join between starts gives a fixed order.
        StringBuilder log62 = new StringBuilder();
        Thread a = new Thread(() -> log62.append("A1 A2 ")), b = new Thread(() -> log62.append("B1 B2"));
        a.start(); a.join(); b.start(); b.join();
        System.out.println("Q62 " + log62);

        // Q63: stdin supplies Enter, then main interrupts the worker.
        Thread worker = new Thread(() -> {
            long loops = 0;
            while (!Thread.currentThread().isInterrupted()) loops++;
            System.out.println("Q63 worker stopped by interrupt");
        });
        worker.start();
        System.in.read();                                     // the build pipes "\n" to stdin
        worker.interrupt();
        worker.join();

        // Q64: wait() with no notify would hang; we show it is still WAITING after a while.
        Object self = new Object();
        Thread forever = new Thread(() -> { synchronized (self) { try { self.wait(); System.out.println("never"); } catch (InterruptedException e) { } } });
        forever.setDaemon(true);                              // so this demo can still exit
        forever.start(); pause(200);
        System.out.println("Q64 after 200 ms the thread is still " + forever.getState() + " (a non-daemon would hang the JVM)");

        // Q65: consumer starts 200 ms late; condition loops make it work.
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        List<Integer> consumed = new ArrayList<>();
        Thread producer = new Thread(() -> { try { for (int i = 1; i <= 4; i++) queue.put(i); } catch (InterruptedException ignored) { } });
        Thread consumer = new Thread(() -> { pause(200); try { for (int i = 1; i <= 4; i++) consumed.add(queue.take()); } catch (InterruptedException ignored) { } });
        producer.start(); consumer.start(); producer.join(); consumer.join();
        System.out.println("Q65 late consumer still received " + consumed);

        // Q66: wait(1000) returns by itself.
        Object lock = new Object();
        long start = System.nanoTime();
        synchronized (lock) { lock.wait(1000); }
        long ms = (System.nanoTime() - start) / 1_000_000;
        System.out.println("Q66 wait(1000) returned without notify after about 1 s: " + (ms >= 950 && ms < 3000));

        // Q67: calling sleep through another thread's reference pauses the caller.
        Thread thread1 = new Thread(() -> pause(10), "thread1");
        thread1.start();
        long before = System.nanoTime();
        Thread.sleep(300);                                    // what thread1.sleep(300) really means
        System.out.println("Q67 main slept " + ((System.nanoTime() - before) / 1_000_000 >= 290 ? "~300 ms" : "?") + "; thread1 finished meanwhile: " + !thread1.isAlive());

        // Q68: lines after notify() inside the block come before the waiter continues.
        List<String> log68 = Collections.synchronizedList(new ArrayList<>());
        Object m = new Object();
        Thread waiter = new Thread(() -> { synchronized (m) { try { m.wait(); } catch (InterruptedException ignored) { } log68.add("waiter continues"); } });
        waiter.start();
        while (waiter.getState() != Thread.State.WAITING) Thread.onSpinWait();
        synchronized (m) { m.notify(); log68.add("notifier still inside"); pause(50); log68.add("notifier leaving"); }
        waiter.join();
        System.out.println("Q68 " + log68);

        // Q69: the most derived run() executes.
        Thread anon = new MyThread() { @Override public void run() { System.out.println("Q69 anonymous run (MyThread.run is skipped)"); } };
        anon.start(); anon.join();

        // Q70: synchronized method on one shared object keeps each block of 3 together.
        Printer printer = new Printer();
        List<String> out = Collections.synchronizedList(new ArrayList<>());
        Thread p1 = new Thread(() -> printer.print("X", out)), p2 = new Thread(() -> printer.print("Y", out));
        p1.start(); p2.start(); p1.join(); p2.join();
        String joined = String.join("", out);
        System.out.println("Q70 blocks stay together: " + (joined.equals("XXXYYY") || joined.equals("YYYXXX")));

        // Q71: opposite lock order on class literals deadlocks (daemon threads so we can exit).
        CountDownLatch both = new CountDownLatch(2);
        Thread d1 = new Thread(() -> { synchronized (String.class) { both.countDown(); await(both); synchronized (Object.class) { System.out.println("never"); } } });
        Thread d2 = new Thread(() -> { synchronized (Object.class) { both.countDown(); await(both); synchronized (String.class) { System.out.println("never"); } } });
        d1.setDaemon(true); d2.setDaemon(true); d1.start(); d2.start();
        long[] dead = null;
        for (int i = 0; i < 100 && dead == null; i++) { pause(20); dead = ManagementFactory.getThreadMXBean().findDeadlockedThreads(); }
        System.out.println("Q71 deadlocked threads: " + (dead == null ? 0 : dead.length));
    }

    static void await(CountDownLatch latch) { try { latch.await(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
}`,
    stdin: "\n",
    walk:
      "Q61 records the four lines of two threads sharing one Runnable, and checks only the guaranteed part: each thread prints start before end. Q62 joins A before starting B, so the order is fixed. For Q63 the build pipes a newline into stdin. `System.in.read()` returns, main interrupts the worker, and its loop ends. Q64 shows a thread still WAITING after 200 ms, because no one notifies it. It is marked as a daemon so that the demo can exit.\n\nQ65 delays the consumer by 200 ms and still gets 1 to 4, because the blocking queue waits on conditions, not on notifications. Q66 returns from `wait(1000)` after about one second without any notify. Q67 shows that the static `sleep` pauses main. Q68 proves that the notifier's remaining lines come first. Q69 runs the anonymous override. Q70 keeps each thread's three lines together through the synchronized method. Q71 deadlocks two threads on `String.class` and `Object.class`, and ThreadMXBean detects it.",
    anim: [
      "notify() does not release the lock",
      [
        ["w", "waiter", "in wait()"],
        ["n", "notifier", "inside sync block"],
        ["mon", "monitor m", "owned by notifier"],
        ["out", "output", "order of lines"],
      ],
      [
        ["n", "w", "notify()", "The notifier signals the waiter, which leaves the wait set."],
        ["n", "out", "keeps running", "It still owns the monitor and prints 'notifier still inside'."],
        ["w", "mon", "BLOCKED", "The waiter tries to re-acquire m but must wait: BLOCKED."],
        ["n", "mon", "exit block", "The notifier prints 'notifier leaving' and releases the monitor."],
        ["w", "out", "continues", "Only now does the waiter re-acquire m and print 'waiter continues'."],
      ],
    ],
    varies: true,
    mistakes: [
      "Calling `t.sleep()` and believing it pauses `t`. It pauses the current thread.",
      "Expecting the waiter to run right after `notify()`, before the notifier leaves its block.",
      "Leaving a non-daemon thread in `wait()` forever, which stops the JVM from exiting.",
    ],
    qa: [
      [
        "Which Thread methods are static?",
        "`currentThread`, `sleep`, `yield`, `interrupted`, `holdsLock`, `onSpinWait`, `activeCount`, `dumpStack`, `getAllStackTraces` and the builders `ofPlatform` and `ofVirtual`. Calling them through an instance is misleading.",
      ],
      [
        "Does interrupting a thread that is blocked in System.in.read() wake it?",
        "No. Classic blocking stream I/O is not interruptible. Use NIO interruptible channels, close the stream, or check the interrupt flag between reads.",
      ],
      [
        "Why use class literals as locks rarely?",
        "They are JVM-wide singletons, so any library can lock them too, and that can cause unexpected contention or deadlocks. Use a private final lock object instead.",
      ],
    ],
    ex: [
      "Change Q71 so that it can never deadlock while still locking both class literals in both threads.",
      "Make both threads lock in the same order, for example always `synchronized (Object.class) { synchronized (String.class) { ... } }`. Without a cycle in the lock order, at most one thread waits, and only until the other finishes.",
    ],
  }),

  lesson("Threads Output Questions Q72-Q82: Lock Rules, IllegalMonitorStateException, Double start and Exceptions in run", {
    intro:
      "Questions 72 to 82 are the last thread output puzzles:\n\n- `wait()` on the args array with no notify\n- non-static fields when every thread creates its own object\n- synchronized m1 and m2 on one object\n- wait without the lock\n- calling start twice\n- a Thread subclass without run\n- overriding start\n- static synchronized methods on different objects\n- instance synchronized methods on different objects\n- `synchronized (this)` in a static method\n- an exception thrown in run\n\nThe program runs each legal case and catches each runtime exception.",
    topics: [
      [
        "Q72 (output). A thread waits on the args array and nobody notifies. What happens?",
        "Any object can be a monitor, including `String[] args`, so `synchronized (args) { args.wait(); }` compiles and runs. With no notify, the thread waits **forever**. If it is main or another non-daemon thread, the program hangs after printing whatever came before the wait. There is no exception. A timeout, an interrupt or a matching notify on the same array object is needed.",
        "public static void main(String[] args) throws InterruptedException {\n    synchronized (args) { args.wait(); }   // hangs: no one notifies args\n    System.out.println(\"never\");\n}",
      ],
      [
        "Q73 (output). Each thread creates its own new MyClass and increments a non-static field. What is printed?",
        "Every thread operates on its **own object**, so the non-static field is not shared at all: each thread sees and prints its own count (for example 1 after one increment). There is no race and no need for synchronization. If the field were **static**, all instances would share one variable, and unsynchronized increments could race and lose updates.",
        "class MyClass { int count; void inc() { count++; } }\n// each thread: MyClass m = new MyClass(); m.inc(); print(m.count);   -> 1 each",
      ],
      [
        "Q74 (output). Two threads call synchronized m1 and synchronized m2 on the same object. What is the output order?",
        "Both methods lock the same object, so they **never overlap**. Whichever thread acquires the lock first prints all of its method's lines, and then the other prints all of its lines. Which method goes first can vary, but the lines from m1 and m2 are never mixed.",
        "synchronized void m1() { print(\"m1 start\"); sleep(100); print(\"m1 end\"); }\nsynchronized void m2() { print(\"m2 start\"); print(\"m2 end\"); }\n// m1 start, m1 end, m2 start, m2 end   (or m2 first)",
      ],
      [
        "Q75 (output). What happens with wait() without holding the lock?",
        "It throws **IllegalMonitorStateException** at runtime (\"current thread is not owner\"). The code compiles, because `wait` is a normal method, but the JVM checks monitor ownership when it is called. The same applies to `notify` and `notifyAll`, and to calling wait on one object while synchronized on another.",
        "Object lock = new Object();\nlock.wait();   // IllegalMonitorStateException",
      ],
      [
        "Q76 (output). What happens when start() is called twice on the same Thread?",
        "The first `start()` launches the thread. The second throws **IllegalThreadStateException** immediately, in the calling thread, whether or not the first run has finished. So the output is the thread's normal output plus a stack trace from the caller (unless it is caught). The thread itself runs only once.",
        "Thread t = new Thread(() -> System.out.println(\"run\"));\nt.start();\nt.start();   // IllegalThreadStateException",
      ],
      [
        "Q77 (output). A Thread subclass without a run override is started. What is printed?",
        "**Nothing** from the thread. The inherited `Thread.run()` runs the Runnable target if there is one; with no target, it simply returns. The thread starts and terminates immediately, without any error. Lines printed by main around `start()` still appear.",
        "class Quiet extends Thread { }\nnew Quiet().start();   // starts and ends silently",
      ],
      [
        "Q78 (output). A Thread subclass overrides start(). What is printed?",
        "If `start()` is overridden **without** calling `super.start()`, the overriding code runs on the calling thread, and **no new thread** begins, so `run()` never executes unless the override calls it, and then it also runs on the caller. If the override calls `super.start()`, a new thread runs `run()` as usual. Printing the thread name in each method shows which case applies.",
        "class Custom extends Thread {\n    public void start() { System.out.println(\"custom start on \" + Thread.currentThread().getName()); }\n    public void run() { System.out.println(\"never runs\"); }\n}",
      ],
      [
        "Q79 (output). Two threads call static synchronized methods on different objects. Do they overlap?",
        "**No.** Static synchronized methods lock the **class**, so the calls are serialised even when made through two different instances (`obj1.staticM()` and `obj2.staticM()`). One method's output always completes before the other starts.",
        "static synchronized void work(String who) { print(who + \" in\"); sleep(100); print(who + \" out\"); }\n// t1: a.work(\"A\")   t2: b.work(\"B\")   -> never overlap",
      ],
      [
        "Q80 (output). Two threads call instance synchronized methods on different objects. Do they overlap?",
        "**Yes.** Each object has its own monitor. Thread 1 locks `a` and thread 2 locks `b`, so both methods run at the same time and their output can interleave (\"A in, B in, A out, B out\"). Per-instance synchronization protects only per-instance state.",
        "synchronized void work(String who) { print(who + \" in\"); sleep(100); print(who + \" out\"); }\n// t1: a.work(\"A\")   t2: b.work(\"B\")   -> overlap",
      ],
      [
        "Q81 (output). Does synchronized (this) compile inside a static method?",
        "**No, compile error**: \"non-static variable this cannot be referenced from a static context\". A static method has no `this`. Use `synchronized (MyClass.class)` to lock the class monitor, the same lock a static synchronized method uses, or a static final lock object.",
        "static void update() {\n    synchronized (this) { }   // compile error\n}",
      ],
      [
        "Q82 (output). run() throws a RuntimeException. What happens to the thread and to main?",
        "The exception terminates **only that thread**. Its UncaughtExceptionHandler, by default, prints `Exception in thread \"Thread-0\" java.lang.RuntimeException: ...` to stderr. Main and the other threads continue normally, and the exception never reaches the code that called `start()`, so a try-catch around `start()` cannot catch it. Lines main prints afterwards still appear.",
        "Thread t = new Thread(() -> { throw new RuntimeException(\"in run\"); });\ntry { t.start(); } catch (RuntimeException e) { /* never reached */ }\nSystem.out.println(\"main continues\");",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    static void pause(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }

    static class MyClass { int count; void inc() { count++; } }

    static class Shared {
        synchronized void m1(List<String> log) { log.add("m1 start"); pause(100); log.add("m1 end"); }
        synchronized void m2(List<String> log) { log.add("m2 start"); log.add("m2 end"); }
        static synchronized void staticWork(String who, List<String> log) { log.add(who + " in"); pause(100); log.add(who + " out"); }
        synchronized void instanceWork(String who, List<String> log) { log.add(who + " in"); pause(100); log.add(who + " out"); }
    }

    static class Quiet extends Thread { }
    static class Custom extends Thread {
        @Override public void start() { System.out.println("Q78 custom start() on " + Thread.currentThread().getName() + " - no new thread"); }
        @Override public void run() { System.out.println("never runs"); }
    }

    public static void main(String[] args) throws Exception {
        // Q72: wait on args (a daemon helper so the demo continues).
        Thread argsWaiter = new Thread(() -> { synchronized (args) { try { args.wait(); } catch (InterruptedException ignored) { } } });
        argsWaiter.setDaemon(true); argsWaiter.start(); pause(100);
        System.out.println("Q72 thread waiting on the args array: " + argsWaiter.getState() + " (would hang if non-daemon)");

        // Q73: each thread has its own object.
        List<Integer> counts = Collections.synchronizedList(new ArrayList<>());
        Thread[] ts = new Thread[3];
        for (int i = 0; i < 3; i++) { ts[i] = new Thread(() -> { MyClass m = new MyClass(); m.inc(); counts.add(m.count); }); ts[i].start(); }
        for (Thread t : ts) t.join();
        System.out.println("Q73 each thread's own count: " + counts);

        // Q74: m1 and m2 on one object never overlap.
        Shared shared = new Shared();
        List<String> log74 = Collections.synchronizedList(new ArrayList<>());
        Thread x = new Thread(() -> shared.m1(log74)), y = new Thread(() -> shared.m2(log74));
        x.start(); pause(20); y.start(); x.join(); y.join();
        System.out.println("Q74 " + log74);

        // Q75
        try { new Object().wait(); } catch (IllegalMonitorStateException e) { System.out.println("Q75 IllegalMonitorStateException: " + e.getMessage()); }

        // Q76
        Thread once = new Thread(() -> System.out.println("Q76 run executes once"));
        once.start();
        try { once.start(); } catch (IllegalThreadStateException e) { System.out.println("Q76 second start() -> IllegalThreadStateException"); }
        once.join();

        // Q77
        Quiet quiet = new Quiet();
        quiet.start(); quiet.join();
        System.out.println("Q77 Quiet thread printed nothing and ended: " + quiet.getState());

        // Q78
        new Custom().start();

        // Q79: static synchronized via two objects - serialised.
        List<String> log79 = Collections.synchronizedList(new ArrayList<>());
        Thread s1 = new Thread(() -> Shared.staticWork("A", log79)), s2 = new Thread(() -> Shared.staticWork("B", log79));
        s1.start(); pause(20); s2.start(); s1.join(); s2.join();
        System.out.println("Q79 static on different objects: " + log79);

        // Q80: instance synchronized on different objects - overlap.
        Shared a = new Shared(), b = new Shared();
        List<String> log80 = Collections.synchronizedList(new ArrayList<>());
        Thread i1 = new Thread(() -> a.instanceWork("A", log80)), i2 = new Thread(() -> b.instanceWork("B", log80));
        i1.start(); pause(20); i2.start(); i1.join(); i2.join();
        System.out.println("Q80 instance on different objects: " + log80);

        // Q81
        System.out.println("Q81 synchronized (this) in a static method does not compile; use synchronized (Main.class)");
        synchronized (Main.class) { System.out.println("Q81 locked Main.class instead"); }

        // Q82: the exception kills only the worker.
        Thread failing = new Thread(() -> { throw new RuntimeException("in run"); }, "worker-0");
        failing.setUncaughtExceptionHandler((t, e) -> System.out.println("Q82 " + t.getName() + " terminated: " + e.getMessage()));
        try { failing.start(); } catch (RuntimeException e) { System.out.println("never: start() does not throw it"); }
        failing.join();
        System.out.println("Q82 main continues, worker state " + failing.getState());
    }
}`,
    walk:
      "Q72 locks the args array in a helper thread and waits on it. The thread is still WAITING after 100 ms, which shows that it would hang a program if it were not a daemon. Q73's threads each create their own MyClass, so every count is 1. In Q74, m1 starts first and holds the object lock for 100 ms, so m2 can only begin after m1 ends: the log is m1 start, m1 end, m2 start, m2 end.\n\nQ75 and Q76 trigger IllegalMonitorStateException and IllegalThreadStateException. Q77's subclass has no run, so it ends silently. Q78's override never calls `super.start()`, so it prints on main and no thread starts. Q79 serialises A and B through the class lock, even through different objects. Q80 interleaves them, because each object has its own lock: A in, B in, A out, B out. Q81 locks `Main.class` instead of the illegal `this`. Q82 shows that the exception from run kills only worker-0 and is reported by its handler, while main continues.",
    anim: [
      "Same object vs different objects",
      [
        ["t1", "thread 1", "a.work(A)"],
        ["t2", "thread 2", "b.work(B)"],
        ["la", "lock of a", "instance"],
        ["lb", "lock of b", "instance"],
        ["lc", "Shared.class", "static"],
      ],
      [
        ["t1", "la", "instance call", "Thread 1 calls a synchronized instance method on a, so it takes a's lock."],
        ["t2", "lb", "instance call", "Thread 2 uses b, a different lock, so both run at once (Q80)."],
        ["t1", "lc", "static call", "For staticWork, thread 1 takes the single class lock instead (Q79)."],
        ["t2", "lc", "must wait", "Thread 2's static call needs the same class lock and waits for thread 1."],
        ["lc", "t2", "released", "When thread 1 leaves staticWork, thread 2 gets the class lock and runs."],
      ],
    ],
    varies: true,
    mistakes: [
      "Wrapping `start()` in try-catch to handle exceptions from `run()`. They happen on another thread.",
      "Thinking per-instance synchronization protects static data.",
      "Overriding `start()` and forgetting that only `super.start()` creates a thread.",
    ],
    qa: [
      [
        "How do you collect exceptions from worker threads in main?",
        "Use an ExecutorService with `submit` and call `Future.get()`, which rethrows the exception wrapped in ExecutionException. Alternatively, set an UncaughtExceptionHandler that records it.",
      ],
      [
        "Is `synchronized (args)` a good idea?",
        "It works, but locking objects other code can see (args, string literals, class literals, boxed values) risks accidental contention. Lock a private final Object.",
      ],
      [
        "Why can't `wait` be called on an object without its monitor?",
        "Releasing the monitor is part of what wait does. A thread that does not own it has nothing to release, so the JVM throws IllegalMonitorStateException.",
      ],
    ],
    ex: [
      "Two threads call `counter.increment()` on two different Counter objects. Both increment a `static int total` inside an instance synchronized method. Predict whether `total` is always correct after 1,000 calls each.",
      "No. Each thread locks its own Counter instance, so the instance locks do not exclude each other, and the shared static increments can race and lose updates. Lock `Counter.class` or use an AtomicInteger.",
    ],
  }),
];
