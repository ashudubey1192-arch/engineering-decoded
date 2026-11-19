import { lesson } from "../../schema.js";

export default [
  lesson("Core Java Q62-Q71: Strings, Reflection, static, Singleton and Initialization Blocks", {
    intro:
      "Questions 62 to 71 mix language fundamentals:\n\n- String vs StringBuffer vs StringBuilder\n- where reflection is used\n- the meaning of static, and again whether a static method can be overridden\n- accessing shared resources without deadlock\n- which method the garbage collector calls and which algorithm it uses\n- writing a correct singleton\n- pass by value\n- the kinds of classes in Java\n- instance vs static initialisation blocks\n\nThe program shows each idea with labelled output.",
    topics: [
      [
        "Q62. What is the difference between String, StringBuffer and StringBuilder?",
        "**String** is immutable. Every \"modification\" (concat, replace, toUpperCase) creates a new object, which makes it thread-safe and poolable but wasteful in loops. **StringBuffer** (JDK 1.0) is a mutable character buffer whose methods are synchronized, so it is thread-safe and slower. **StringBuilder** (Java 5) has the same API as StringBuffer without synchronization, so it is the fastest choice for building strings on one thread.\n\nUse String for values, and StringBuilder for concatenation in loops. StringBuffer is rarely needed: you almost never share one buffer between threads. The compiler already turns `a + b + c` into efficient code (invokedynamic `StringConcatFactory` since Java 9), but not for concatenation across loop iterations.",
      ],
      [
        "Q63. Where is reflection used, directly and indirectly?",
        "**Directly**, your code calls `Class.forName`, `getDeclaredMethods`, `Field.setAccessible` or `Method.invoke`, for example in a plugin loader, a generic `toString` or a test utility. **Indirectly**, frameworks use it on your classes all the time:\n\n- Spring and Jakarta CDI dependency injection\n- JPA and Hibernate entity mapping\n- Jackson and Gson JSON binding\n- JUnit finding `@Test` methods\n- serialization (calling private `readObject` and `writeObject`)\n- annotation processing at runtime\n- dynamic proxies (`java.lang.reflect.Proxy`, used for AOP and mocks)\n- JDBC drivers loaded with `Class.forName`\n\nReflection is slower and bypasses compile-time checks, and since Java 9 the module system limits deep reflection into JDK internals.",
      ],
      [
        "Q64. What is the significance of static?",
        "`static` means \"belongs to the class, not to an instance\":\n\n- A **static field** has one copy shared by all objects (a counter, a constant with `static final`).\n- A **static method** is called on the class and has no `this`, so it can use only static members directly. Examples are utility methods and factories.\n- A **static block** runs once when the class is initialised.\n- A **static nested class** has no reference to an outer instance.\n- A **static import** lets you use static members without the class name.\n\nStatic members are initialised when the class is first actively used, and live as long as the class is loaded.",
      ],
      [
        "Q65. Can we override a static method? (asked again with variations)",
        "Interviewers often repeat this question to test consistency. The answer is still **no**: static methods are bound at compile time from the reference type, and a same-signature static method in a subclass **hides** the parent's. Follow-ups:\n\n- Can a static method be overloaded? Yes.\n- Can a static method be inherited? Yes. `Child.parentStatic()` compiles and calls the parent method.\n- Can an abstract method be static? No, because an abstract method needs overriding.\n- Can an interface have static methods? Yes, since Java 8, but they are called only through the interface name and are not inherited by implementing classes.",
      ],
      [
        "Q66. How can threads access shared resources concurrently without deadlock?",
        "A deadlock needs four conditions at once: mutual exclusion, hold-and-wait, no preemption and circular wait. Breaking any one of them prevents it:\n\n- **Lock ordering**: always acquire locks in one global order (for example by account id), which breaks circular wait.\n- **Timeouts**: use `tryLock(timeout)` from ReentrantLock and back off when it fails, which breaks hold-and-wait.\n- **Fewer locks**: lock one object at a time, keep critical sections short, and never call unknown (alien) code while holding a lock.\n- **Better tools**: concurrent collections, atomic classes and immutable objects need no locks.\n- **Detection**: thread dumps or `ThreadMXBean.findDeadlockedThreads()`.",
      ],
      [
        "Q67. Which method does the garbage collector call, and which algorithm does it use?",
        "Historically the GC called `finalize()` on an object with a non-trivial finalizer before reclaiming it. Finalization has been deprecated since Java 9 and marked for removal since Java 18, so use `Cleaner` or try-with-resources instead. `System.gc()` only *requests* a collection.\n\nAll collectors use **reachability** from GC roots (thread stacks, static fields, JNI references) instead of reference counting. The basic algorithm is **mark-and-sweep** (mark the live objects, reclaim the rest), usually with **compaction** or **copying**. HotSpot organises the heap by **generations**: a young generation (eden plus survivor spaces, collected by copying) and an old generation. The collectors are Serial, Parallel, **G1** (region-based and the default), ZGC and Shenandoah (concurrent, low pause).",
      ],
      [
        "Q68. How do you write a singleton?",
        "A singleton guarantees one instance per class loader. The options:\n\n- **Eager**: `private static final Singleton INSTANCE = new Singleton();`. Simple and thread-safe, because class initialisation is.\n- **Lazy holder idiom**: a nested `Holder` class holds the instance and is initialised only on first `getInstance()`. Lazy and thread-safe without locking.\n- **Double-checked locking**: needs a `volatile` field and a second null check inside `synchronized`.\n- **Enum**: `enum Singleton { INSTANCE; }`. Recommended by Effective Java, because it also survives serialization and reflection attacks.\n\nIn every version except enum, make the constructor private, add `readResolve()` if the class is Serializable, and throw from the constructor if an instance already exists, to stop reflection.",
      ],
      [
        "Q69. Is Java pass by value or pass by reference?",
        "Java is **always pass by value**. For primitives, the value is copied. For objects, the value of the *reference* is copied. The method gets its own copy of the pointer, aimed at the same object. So a method **can change the object's state** through its copy (`list.add(x)` is visible to the caller), but **cannot make the caller's variable point to a different object**: assigning the parameter (`list = new ArrayList<>()`) changes only the local copy. A swap method that swaps two parameters does nothing for the caller.",
      ],
      [
        "Q70. What types of classes are there in Java?",
        "- **Concrete (top-level) classes**.\n- **Abstract classes**.\n- **Final classes**.\n- **Static nested classes**, which need no outer instance.\n- **Inner (non-static) classes**, which hold a reference to an outer instance.\n- **Local classes**, declared inside a method.\n- **Anonymous classes**, declared and instantiated in one expression.\n- **Enums**.\n- **Records** (Java 16, data carriers).\n- **Sealed classes** (Java 17, restricted hierarchy).\n- **Interfaces**, along with annotations, which are special interfaces.\n\nSingleton, immutable and POJO classes describe a design rather than a language feature.",
      ],
      [
        "Q71. What is the difference between instance and static initialization blocks?",
        "A **static block** (`static { ... }`) runs **once**, when the class is initialised: on first use, before any constructor or static method call. It sets up static fields, for example loading a driver or filling a lookup table. An **instance block** (`{ ... }`) runs **every time** an object is created, before the constructor body and after `super()`. The compiler copies its code into every constructor. The order is: static blocks (parent then child, once each), then for each `new`, parent instance blocks and constructor, then child instance blocks and constructor. Several blocks of the same kind run in source order.",
      ],
    ],
    code: String.raw`import java.lang.reflect.*;
import java.util.*;

public class Main {

    // Q68: three singleton styles.
    enum Registry { INSTANCE; int hits; }                          // enum singleton
    static class Config {                                          // lazy holder idiom
        private Config() { }
        private static class Holder { static final Config INSTANCE = new Config(); }
        static Config get() { return Holder.INSTANCE; }
    }
    static class Cache {                                           // double-checked locking
        private static volatile Cache instance;
        private Cache() { }
        static Cache get() {
            Cache local = instance;
            if (local == null) {
                synchronized (Cache.class) {
                    local = instance;
                    if (local == null) instance = local = new Cache();
                }
            }
            return local;
        }
    }

    // Q71: order of static and instance initialisation.
    static class Base {
        static { System.out.println("Q71   Base static block (once)"); }
        { System.out.println("Q71   Base instance block"); }
        Base() { System.out.println("Q71   Base constructor"); }
    }
    static class Derived extends Base {
        static { System.out.println("Q71   Derived static block (once)"); }
        { System.out.println("Q71   Derived instance block"); }
        Derived() { System.out.println("Q71   Derived constructor"); }
    }

    // Q63: a reflective "toString" that reads private fields.
    static class Product {
        private final String name = "pen";
        private final int price = 20;
        private int secret() { return 42; }
    }

    // Q64: one static counter shared by all objects.
    static class Visitor {
        static int count;
        Visitor() { count++; }
    }

    // Q69: pass by value of the reference.
    static void change(List<String> list) {
        list.add("added");            // visible to the caller: same object
        list = new ArrayList<>();     // only the local copy now points elsewhere
        list.add("lost");
    }

    public static void main(String[] args) throws Exception {
        // Q62: building a string in a loop.
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 5; i++) builder.append(i).append(',');
        String fixed = "a";
        String other = fixed.concat("b");
        System.out.println("Q62 builder " + builder + " | String unchanged " + fixed + " -> new " + other
                + " | StringBuffer synchronized append: " + new StringBuffer("x").append("y"));

        // Q63: reflection reads private fields and calls a private method.
        Product product = new Product();
        StringBuilder fields = new StringBuilder();
        for (Field field : Product.class.getDeclaredFields()) {
            field.setAccessible(true);
            fields.append(field.getName()).append('=').append(field.get(product)).append(' ');
        }
        Method secret = Product.class.getDeclaredMethod("secret");
        secret.setAccessible(true);
        System.out.println("Q63 reflection: " + fields.toString().trim() + ", secret() = " + secret.invoke(product));

        // Q64
        new Visitor(); new Visitor(); new Visitor();
        System.out.println("Q64 static count shared by 3 objects: " + Visitor.count);

        // Q66: lock ordering - both threads lock the lower id first, so no deadlock.
        Object lockA = new Object(), lockB = new Object();
        Runnable ordered = () -> {
            for (int i = 0; i < 1000; i++)
                synchronized (lockA) { synchronized (lockB) { Registry.INSTANCE.hits++; } }
        };
        Thread t1 = new Thread(ordered), t2 = new Thread(ordered);
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("Q66 ordered locking finished without deadlock, hits = " + Registry.INSTANCE.hits);

        // Q67: GC is only requested; reachability decides.
        Object temp = new Object();
        java.lang.ref.WeakReference<Object> weak = new java.lang.ref.WeakReference<>(temp);
        temp = null;                                    // no strong reference left
        System.gc();                                    // a request, not a command
        System.out.println("Q67 System.gc() requested; object is now unreachable (weak ref may be cleared)");

        // Q68: every call returns the same instance.
        System.out.println("Q68 holder same: " + (Config.get() == Config.get()) + ", DCL same: "
                + (Cache.get() == Cache.get()) + ", enum: " + Registry.INSTANCE.name());

        // Q69
        List<String> names = new ArrayList<>(List.of("start"));
        change(names);
        System.out.println("Q69 caller sees " + names);

        // Q70: a few kinds of classes.
        Runnable anonymous = new Runnable() { public void run() { } };
        record Point(int x, int y) { }
        System.out.println("Q70 anonymous class? " + anonymous.getClass().isAnonymousClass()
                + ", record? " + Point.class.isRecord() + ", enum? " + Registry.class.isEnum()
                + ", member class? " + Config.class.isMemberClass());

        // Q71: static blocks once, instance blocks per object.
        System.out.println("Q71 first new Derived():");
        new Derived();
        System.out.println("Q71 second new Derived():");
        new Derived();
    }
}`,
    walk:
      "Q62 builds a string in a StringBuilder and shows that `concat` returns a new String, leaving the original untouched. Q63 lists Product's private fields and calls its private method through reflection, which is exactly what frameworks do for you. Q64 creates three Visitors, which all share one static counter.\n\nQ66 runs two threads that each take lockA and then lockB 1,000 times. Because both use the same order, a circular wait is impossible. Q67 drops the only strong reference to an object and requests a GC. Q68 shows that every singleton style returns one instance. Q69's method adds to the caller's list, but its reassignment is invisible to the caller. Q70 asks reflection what kind of class each one is. Q71 creates Derived twice: the static blocks print only the first time, while the instance blocks and constructors print for every object.",
    anim: [
      "Class and object initialisation order",
      [
        ["load", "class loader", "loads Base, Derived"],
        ["sb", "static blocks", "Base, then Derived"],
        ["new", "new Derived()", "each object"],
        ["base", "Base part", "block + constructor"],
        ["der", "Derived part", "block + constructor"],
      ],
      [
        ["load", "sb", "first use", "On first use, Base is initialised and then Derived: their static blocks run once."],
        ["sb", "new", "allocate", "new Derived() allocates the object, with fields at default values."],
        ["new", "base", "super()", "The Derived constructor calls super() first: Base instance block, then constructor."],
        ["base", "der", "own init", "Then Derived's instance block runs, followed by the Derived constructor body."],
        ["der", "new", "next object", "A second new Derived() repeats only the instance steps, not the static ones."],
      ],
    ],
    mistakes: [
      "Concatenating with `+` across loop iterations. Each iteration creates a new String, so use a StringBuilder.",
      "Writing double-checked locking without `volatile`. Another thread can see a partially constructed object.",
      "Thinking Java passes objects by reference because the method can change them. It passes the reference by value.",
    ],
    qa: [
      [
        "Can a static block throw a checked exception?",
        "Not directly. A static block cannot declare `throws`, so it must catch checked exceptions. An unchecked exception escaping it becomes ExceptionInInitializerError.",
      ],
      [
        "Why is the enum singleton considered the best?",
        "The JVM guarantees exactly one instance per enum constant. Serialization returns the existing constant, and reflection cannot call an enum constructor (it throws IllegalArgumentException).",
      ],
      [
        "When does a class get initialised?",
        "On first active use: creating an instance, calling a static method, reading or writing a non-constant static field, `Class.forName`, or initialising a subclass. Reading a compile-time `static final` constant does not trigger it.",
      ],
    ],
    ex: [
      "Add a `count` static field to Base that increases in its instance block. After `new Derived(); new Derived(); new Base();`, what is `Base.count`, and how many times did Derived's static block run?",
      "`Base.count` is 3, because every object, including each Derived, runs Base's instance block once. Derived's static block ran exactly once, on the first `new Derived()`.",
    ],
  }),

  lesson("Core Java Q72-Q83: ConcurrentHashMap, Deadlock, Thread States and Locks", {
    intro:
      "Questions 72 to 83 dig deeper into threads:\n\n- how ConcurrentHashMap works when two threads use it\n- creating, detecting, solving and avoiding deadlock\n- the thread states\n- daemon threads\n- wait vs sleep, and yield vs sleep\n- guidelines for thread-safe code\n- notify vs notifyAll\n- what happens when run or start is not overridden or is overridden\n- class-level locks vs object locks\n\nThe program detects a real deadlock with ThreadMXBean and then avoids it.",
    topics: [
      [
        "Q72. How does ConcurrentHashMap work, and what happens when two threads use it?",
        "Since Java 8, ConcurrentHashMap is an array of bins like HashMap. Reads (`get`) take no lock: the table and node fields are volatile, so a reader always sees a fully published node. A put into an **empty bin** uses a lock-free CAS. A put into a **non-empty bin** locks only that bin's first node with `synchronized`, so two threads writing to different bins proceed in parallel and only same-bin writers wait for each other. Bins with many collisions become trees. Resizing is cooperative: threads that arrive during a resize help transfer bins. `size()` is a sum over striped counters (like LongAdder). In Java 7 the design used 16 lock **segments** instead (the concurrency level).",
      ],
      [
        "Q73. How do you create, detect, solve and avoid deadlock?",
        "**Create**: thread 1 locks A and then wants B, while thread 2 locks B and then wants A. Both wait forever.\n\n**Detect**:\n\n- Take a thread dump (`jstack <pid>`, `jcmd <pid> Thread.print`, or Ctrl+Break / `kill -3`). It prints \"Found one Java-level deadlock\" with the cycle.\n- Call `ThreadMXBean.findDeadlockedThreads()` in code.\n- Use VisualVM or JConsole.\n\n**Solve** a running deadlock by restarting, because Java cannot preempt intrinsic locks.\n\n**Avoid**:\n\n- Use a consistent global lock order.\n- Use `tryLock` with timeouts.\n- Hold fewer locks and hold them for less time.\n- Do not call alien methods while locked.\n- Use higher-level concurrency utilities.",
      ],
      [
        "Q74. What are the thread states?",
        "`Thread.State` has six values:\n\n- **NEW**: created, not yet started.\n- **RUNNABLE**: running or ready to run. This includes running native I/O.\n- **BLOCKED**: waiting to enter a synchronized block or method held by another thread.\n- **WAITING**: waiting with no timeout, via `wait()`, `join()` or `LockSupport.park()`.\n- **TIMED_WAITING**: `sleep(ms)`, `wait(ms)`, `join(ms)` or `parkNanos`.\n- **TERMINATED**: `run` has finished.\n\nTextbooks also describe a \"running\" state, but Java reports running and ready-to-run threads both as RUNNABLE.",
      ],
      [
        "Q75. What are daemon threads?",
        "A daemon thread is a low-priority background service thread that does **not** keep the JVM alive. When the last user (non-daemon) thread ends, the JVM exits and abandons any running daemon threads, without running their finally blocks. Mark a thread with `setDaemon(true)` **before** `start()`; calling it afterwards throws IllegalThreadStateException. A thread inherits daemon status from its creator. The GC and the JIT compiler threads are daemons. Never use a daemon for work that must complete, such as writing a file.",
      ],
      [
        "Q76. What is the difference between wait() and sleep()?",
        "`wait()` is an instance method of **Object**. It must be called while holding that object's monitor, it **releases the lock**, and it waits until `notify`/`notifyAll`, a timeout, or an interrupt. It is used for coordination between threads.\n\n`sleep(ms)` is a static method of **Thread**. It can be called anywhere, it **keeps any locks** it holds, and it simply pauses the current thread for a time. Both throw InterruptedException. `wait` leaves the thread WAITING (or TIMED_WAITING with a timeout); `sleep` leaves it TIMED_WAITING.",
      ],
      [
        "Q77. What is the difference between yield() and sleep()?",
        "`Thread.yield()` is a hint to the scheduler that the current thread is willing to give up the CPU so that other runnable threads of similar priority can run. The thread stays **RUNNABLE**, the scheduler may ignore the hint, and it may resume immediately. `sleep(ms)` definitely suspends the thread for at least that time, in TIMED_WAITING. Neither releases locks. `yield` is rarely useful outside tests and spin loops (where `Thread.onSpinWait()` is better).",
      ],
      [
        "Q78. What are the guidelines for writing thread-safe code?",
        "- Prefer **immutability**: final fields and immutable objects need no locks.\n- **Confine** data: local variables, ThreadLocal, or objects owned by one thread.\n- Use **concurrent collections** (ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue) and **atomic classes**, not hand-made locking.\n- When you do lock, guard all access to a variable with the same lock, keep critical sections small, and document which lock guards what.\n- Make compound actions atomic (`computeIfAbsent`, `merge`).\n- Publish objects safely: final fields, volatile, or a lock.\n- Avoid calling alien methods while holding a lock.\n- Prefer executors over raw threads.\n- Handle InterruptedException properly by restoring the interrupt flag.",
      ],
      [
        "Q79. What is the difference between notify() and notifyAll()?",
        "`notify()` wakes **one** arbitrary thread from the monitor's wait set. `notifyAll()` wakes **all** of them, and they then compete for the lock one by one, each re-checking its condition. `notify` is efficient only when every waiter waits for the same condition and any one of them can proceed. When different threads wait for different conditions on the same monitor, `notify` can wake the wrong one, and the signal is lost. `notifyAll` is the safe default. The program shows three waiting threads: one notify releases one of them, and notifyAll releases the rest.",
      ],
      [
        "Q80. What happens if you do not override run()?",
        "If you extend Thread and do not override `run()`, the inherited `Thread.run()` calls the Runnable target passed to the constructor, if there is one. Otherwise it does nothing. So `new Thread().start()` starts a thread that ends immediately, with no error. If you pass a Runnable to a subclass that does override `run()` without calling `super.run()`, the Runnable is ignored.",
      ],
      [
        "Q81. What happens if you override start()?",
        "`Thread.start()` is the method that asks the JVM to create the native thread (internally through `start0()`). If you override it and do not call `super.start()`, **no new thread is created**: your start method runs as a normal call on the current thread, and `run()` executes only if you call it yourself, also on the current thread. If you override it and call `super.start()`, a real thread is started as usual. Overriding start is almost always a mistake.",
      ],
      [
        "Q82. How do you acquire a lock on a class?",
        "Every class has a `Class` object, and its monitor is the class-level lock. You acquire it in two ways. The first is a **static synchronized method**: `static synchronized void m()` locks `MyClass.class`. The second is a **synchronized block on the class literal**: `synchronized (MyClass.class) { ... }`. The class lock protects static data shared by all instances. Only one thread at a time can hold it, regardless of how many objects exist.",
      ],
      [
        "Q83. What is the difference between an object lock and a class lock?",
        "An **object lock** is the monitor of one instance, taken by instance synchronized methods or `synchronized (this)`. Each object has its own, so threads using different objects do not block each other. A **class lock** is the monitor of the `Class` object, taken by static synchronized methods or `synchronized (X.class)`. There is one per class.\n\nThe two locks are independent: a thread holding a class lock does **not** block another thread from entering an instance synchronized method, and the reverse. This is why mixing static and instance synchronized methods on the same data is a bug.",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.util.concurrent.*;

public class Main {

    public static void main(String[] args) throws Exception {
        // Q72: two threads update one ConcurrentHashMap safely with merge.
        ConcurrentHashMap<String, Integer> hits = new ConcurrentHashMap<>();
        Runnable count = () -> { for (int i = 0; i < 10_000; i++) hits.merge(i % 2 == 0 ? "even" : "odd", 1, Integer::sum); };
        Thread c1 = new Thread(count), c2 = new Thread(count);
        c1.start(); c2.start(); c1.join(); c2.join();
        System.out.println("Q72 ConcurrentHashMap totals even=" + hits.get("even") + " odd=" + hits.get("odd"));

        // Q73: create a deadlock with daemon threads, then detect it.
        Object a = new Object(), b = new Object();
        CountDownLatch bothHoldOne = new CountDownLatch(2);
        Thread d1 = new Thread(() -> lockBoth(a, b, bothHoldOne), "D1");
        Thread d2 = new Thread(() -> lockBoth(b, a, bothHoldOne), "D2");   // opposite order
        d1.setDaemon(true); d2.setDaemon(true);                              // Q75: will not block JVM exit
        d1.start(); d2.start();
        long[] stuck = null;
        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        for (int i = 0; i < 100 && stuck == null; i++) { Thread.sleep(20); stuck = mx.findDeadlockedThreads(); }
        System.out.println("Q73 deadlocked threads detected: " + (stuck == null ? 0 : stuck.length)
                + ", D1 state " + d1.getState());

        // Q74: observe states of one thread.
        Object monitor = new Object();
        Thread t = new Thread(() -> {
            synchronized (monitor) {
                try { monitor.wait(); } catch (InterruptedException ignored) { }
            }
        });
        System.out.print("Q74 " + t.getState());
        t.start();
        while (t.getState() != Thread.State.WAITING) Thread.onSpinWait();
        System.out.print(" -> " + t.getState());
        synchronized (monitor) { monitor.notify(); }
        t.join();
        System.out.println(" -> " + t.getState());

        // Q75: a daemon flag must be set before start.
        Thread daemon = new Thread(() -> { });
        daemon.setDaemon(true);
        System.out.println("Q75 isDaemon=" + daemon.isDaemon() + ", main isDaemon=" + Thread.currentThread().isDaemon());

        // Q76: sleep keeps the lock, wait releases it.
        Object shared = new Object();
        Thread sleeper = new Thread(() -> { synchronized (shared) { pause(150); } });
        sleeper.start();
        Thread.sleep(30);
        Thread contender = new Thread(() -> { synchronized (shared) { } });
        contender.start();
        Thread.sleep(30);
        System.out.println("Q76 while the lock holder sleeps, a contender is " + contender.getState());
        sleeper.join(); contender.join();

        // Q77: yield keeps the thread RUNNABLE.
        Thread.yield();
        System.out.println("Q77 after yield main is " + Thread.currentThread().getState());

        // Q79: notify wakes one waiter, notifyAll wakes the rest.
        Object room = new Object();
        CountDownLatch waiting = new CountDownLatch(3);
        int[] woken = {0};
        Thread[] waiters = new Thread[3];
        for (int i = 0; i < 3; i++) {
            waiters[i] = new Thread(() -> {
                synchronized (room) {
                    waiting.countDown();
                    try { room.wait(); } catch (InterruptedException ignored) { }
                    woken[0]++;
                }
            });
            waiters[i].start();
        }
        waiting.await();
        synchronized (room) { }                       // ensure all three are inside wait()
        while (!allWaiting(waiters)) Thread.onSpinWait();
        synchronized (room) { room.notify(); }
        Thread.sleep(100);
        synchronized (room) { System.out.print("Q79 after notify: " + woken[0] + " woken"); room.notifyAll(); }
        for (Thread w : waiters) w.join();
        System.out.println(", after notifyAll: " + woken[0] + " woken");

        // Q80: a Thread with no run override and no Runnable simply ends.
        Thread empty = new Thread();
        empty.start(); empty.join();
        System.out.println("Q80 empty thread ended: " + empty.getState());

        // Q81: overriding start without super.start() never creates a thread.
        Thread fake = new Thread(() -> System.out.println("Q81 run() executed on " + Thread.currentThread().getName())) {
            @Override public void start() { System.out.println("Q81 overridden start() on " + Thread.currentThread().getName()); run(); }
        };
        fake.start();

        // Q82 + Q83: class lock and object lock are independent.
        Account acc = new Account();
        Thread staticHolder = new Thread(Account::classLocked);
        staticHolder.start();
        Thread.sleep(30);
        long start = System.nanoTime();
        acc.objectLocked();                           // not blocked by the class lock
        System.out.println("Q83 instance method entered while class lock held: " + ((System.nanoTime() - start) < 100_000_000L));
        staticHolder.join();
    }

    static void lockBoth(Object first, Object second, CountDownLatch latch) {
        synchronized (first) {
            latch.countDown();
            try { latch.await(); } catch (InterruptedException ignored) { }
            synchronized (second) { System.out.println("never printed"); }
        }
    }

    static boolean allWaiting(Thread[] threads) {
        for (Thread t : threads) if (t.getState() != Thread.State.WAITING) return false;
        return true;
    }

    static void pause(long ms) { try { Thread.sleep(ms); } catch (InterruptedException ignored) { } }

    static class Account {
        static synchronized void classLocked() { pause(200); }   // holds Account.class
        synchronized void objectLocked() { }                       // needs only this object
    }
}`,
    walk:
      "Q72 has two threads merge 20,000 counts into one ConcurrentHashMap. The totals are exact because `merge` is atomic per key. For Q73, D1 locks `a` and D2 locks `b`. A latch makes sure both hold their first lock before reaching for the other, so they deadlock for certain. `findDeadlockedThreads()` reports both and D1 shows BLOCKED. They are daemon threads, so the JVM can still exit at the end (Q75).\n\nQ74 prints one thread's states, NEW, WAITING and TERMINATED, as it starts, waits on a monitor and is notified. Q76 shows that a thread sleeping inside `synchronized` keeps the lock, so a contender is BLOCKED. Q79 puts three threads into `wait()`: `notify` wakes exactly one and `notifyAll` the other two. Q80 starts a Thread with nothing to do. Q81's overridden `start()` runs `run()` on main, proving that no thread was created. Q83 enters an instance synchronized method while another thread holds the class lock, which works without waiting.",
    anim: [
      "How a deadlock forms",
      [
        ["t1", "Thread D1", "holds A"],
        ["la", "lock A", "monitor"],
        ["lb", "lock B", "monitor"],
        ["t2", "Thread D2", "holds B"],
        ["mx", "ThreadMXBean", "detects cycle"],
      ],
      [
        ["t1", "la", "lock A", "D1 enters synchronized(A) and now owns monitor A."],
        ["t2", "lb", "lock B", "D2 enters synchronized(B) at the same time and owns monitor B."],
        ["t1", "lb", "wants B", "D1 now needs B, held by D2, so D1 becomes BLOCKED."],
        ["t2", "la", "wants A", "D2 needs A, held by D1: a circular wait, so neither can ever proceed."],
        ["mx", "t1", "find cycle", "findDeadlockedThreads walks the owner graph and reports D1 and D2."],
      ],
    ],
    varies: true,
    mistakes: [
      "Acquiring two locks in different orders in different methods. This is the root of most deadlocks.",
      "Calling `setDaemon(true)` after `start()`, or using a daemon thread for work that must finish.",
      "Assuming a static synchronized method and an instance synchronized method exclude each other. They use different locks.",
    ],
    qa: [
      [
        "Is `ConcurrentHashMap.size()` exact?",
        "It is exact when no updates are in flight. During concurrent updates it is an estimate built from striped counters, and `mappingCount()` returns a long for very large maps.",
      ],
      [
        "In which state is a thread that is blocked on reading a socket?",
        "RUNNABLE. Java reports threads in native blocking I/O as runnable, because the JVM does not track OS-level I/O waits as a separate state.",
      ],
      [
        "Can a deadlock happen with a single thread?",
        "Not with intrinsic locks, because they are reentrant. It can with a non-reentrant lock, or when a thread joins itself (`Thread.currentThread().join()` waits forever).",
      ],
    ],
    ex: [
      "Rewrite `lockBoth` so that the two threads can never deadlock, whatever order the arguments come in.",
      "Order the locks with a stable key before locking: `Object first = System.identityHashCode(x) <= System.identityHashCode(y) ? x : y;` and the other one as `second`. Lock `first` and then `second`. For a hash tie, take a third global tie-breaker lock first. Alternatively, use ReentrantLock with `tryLock(timeout)` and release everything on failure.",
    ],
  }),
];
