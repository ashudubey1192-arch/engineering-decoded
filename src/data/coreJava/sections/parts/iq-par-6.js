import { lesson } from "../../schema.js";

// Concurrency and parallelism interview questions, extra set Q121-Q140.
export default [
  lesson("Concurrency and Parallelism Q121-Q130: Classic Synchronization Problems, from FooBar to Dining Philosophers", {
    intro:
      "Coding rounds love the **classic synchronization puzzles**, because each one tests whether you can turn an ordering rule into the right primitive:\n\n- strict alternation: FooBar, Zero-Even-Odd, and multithreaded FizzBuzz\n- grouping: building H2O molecules\n- access policies: readers-writers and the unisex bathroom\n- the textbook problems: sleeping barber, dining philosophers, cigarette smokers and Santa Claus\n\nThe program solves eight of them for real (semaphores for alternation, a monitor for FizzBuzz, a barrier for H2O, ordered forks for the philosophers) and checks every invariant, so the output is the same on every run.",
    topics: [
      [
        "Q121. How do you make two threads print \"foo\" and \"bar\" alternately?",
        "Thread A calls `foo()` n times and thread B calls `bar()` n times, and the output must be `foobarfoobar...`. This is **strict alternation**, and the cleanest tool is two semaphores used as signals:\n\n1. `fooSem = new Semaphore(1)` (foo goes first) and `barSem = new Semaphore(0)`.\n2. A: `fooSem.acquire(); print(\"foo\"); barSem.release();`\n3. B: `barSem.acquire(); print(\"bar\"); fooSem.release();`\n\nEach thread hands the turn to the other, and permits are remembered, so it does not matter which thread starts first. Alternatives: a shared `volatile boolean fooTurn` with wait and notifyAll on a monitor (needs a while loop), a ReentrantLock with two Conditions, or a `SynchronousQueue` ping-pong. Busy-waiting on a volatile flag works but wastes CPU.",
        "foo: fooSem.acquire(); print(\"foo\"); barSem.release();\nbar: barSem.acquire(); print(\"bar\"); fooSem.release();",
      ],
      [
        "Q122. How do you solve Print Zero-Even-Odd?",
        "Three threads share an object: one calls `zero()`, one `even()`, one `odd()`, and together they must print `0102030405...` up to n. It is alternation with a **branch**:\n\n1. Semaphores `zero = 1`, `odd = 0`, `even = 0`.\n2. The zero thread, for i = 1 to n: acquire `zero`, print 0, then release `odd` if i is odd, otherwise `even`.\n3. The odd thread, for i = 1, 3, 5 ...: acquire `odd`, print i, release `zero`.\n4. The even thread, for i = 2, 4 ...: acquire `even`, print i, release `zero`.\n\nThe zero thread acts as a dispatcher deciding who goes next; the other two always hand control back. Each thread must loop exactly as many times as it has turns (`(n + 1) / 2` odds and `n / 2` evens), or it blocks forever at the end.",
      ],
      [
        "Q123. How do you solve multithreaded FizzBuzz?",
        "Four threads: one prints \"fizz\" (multiples of 3 only), one \"buzz\" (of 5 only), one \"fizzbuzz\" (of 15), and one the plain numbers, together printing 1 to n in order. A **monitor with a shared counter** is the natural fit:\n\n1. Shared `int current = 1`, guarded by `synchronized`.\n2. Each thread loops: `while (current <= n && !mine(current)) wait();`\n3. If `current > n`, notifyAll and return (so the others can exit too).\n4. Otherwise print, `current++`, `notifyAll()`.\n\n`notifyAll` is required, not `notify`, because the four threads wait for **different** conditions; a single notify might wake a thread whose condition is false while the right one sleeps forever. A semaphore-per-thread design also works: a dispatcher computes who owns the next number and releases that thread's semaphore.",
      ],
      [
        "Q124. How do you solve Building H2O?",
        "Hydrogen and oxygen threads arrive in any order, and they must leave in groups of exactly **two H and one O**, each group bonding together before the next group starts. Combine **two semaphores and a barrier**:\n\n1. `hSem = new Semaphore(2)` and `oSem = new Semaphore(1)` admit at most two H and one O into the current molecule.\n2. `barrier = new CyclicBarrier(3)` makes the three wait for each other; its barrier action can record the molecule.\n3. Each thread: acquire its semaphore, `bond()`, `barrier.await()`, then release its semaphore so the next molecule can form.\n\nThe semaphores enforce composition and the barrier enforces grouping. Releasing *after* the barrier is important; releasing before it would let a third H slip into the forming molecule. The same pattern solves \"form teams of 2 + 2\" or \"board a boat with 4 people\" variants.",
      ],
      [
        "Q125. What is the readers-writers problem, and how do you avoid starving writers?",
        "Many readers may read a shared resource at the same time, but a writer needs **exclusive** access. The first solution (reader preference) lets readers in whenever no writer is **active**, so a continuous stream of readers can starve a writer forever.\n\nA **writer-preference** monitor fixes that with three counters:\n\n- readers: `while (writing || waitingWriters > 0) wait(); readers++;` and later `if (--readers == 0) notifyAll();`\n- writers: `waitingWriters++; while (writing || readers > 0) wait(); waitingWriters--; writing = true;` and later `writing = false; notifyAll();`\n\nA waiting writer now blocks new readers, so it gets in once the current readers leave. The **third** variant is fair FIFO, which `new ReentrantReadWriteLock(true)` implements. In real code use ReentrantReadWriteLock or StampedLock; in an interview, write the monitor and explain the starvation trade-off.",
      ],
      [
        "Q126. How do you solve the unisex bathroom problem?",
        "A bathroom holds at most **N people**, and men and women may not be inside **at the same time**. It is a readers-writers variant with two groups of \"readers\" who exclude each other, plus a capacity limit. A monitor solution:\n\n- state: `count` and `currentGender`\n- enter(g): `while (count == N || (count > 0 && currentGender != g)) wait(); currentGender = g; count++;`\n- leave(): `count--; notifyAll();`\n\nThe catch is **starvation**: if men keep arriving while men are inside, women may never get in. Fixes: once someone of the other gender is waiting, stop admitting more of the current gender (a turn flag, like writer preference), cap the number of consecutive entries per gender, or serve arrivals in FIFO order with a fair lock or ticket numbers. Interviewers usually want you to spot that starvation and propose one of these.",
      ],
      [
        "Q127. How do you solve the sleeping barber problem?",
        "A barber shop has one barber, one barber chair and N waiting chairs. If there are no customers the barber sleeps; an arriving customer wakes him, waits in a chair if he is busy, or **leaves** if all chairs are full. It models a server with a bounded request queue and load shedding. With semaphores:\n\n1. `customers = new Semaphore(0)` counts waiting customers (the barber sleeps on it).\n2. `barberReady = new Semaphore(0)` signals that the barber is ready to cut.\n3. A mutex guards `waiting`, the number of occupied chairs.\n4. Customer: lock; if `waiting < N` then `waiting++`, `customers.release()`, unlock, `barberReady.acquire()`, get the haircut; else unlock and leave.\n5. Barber: loop `customers.acquire()`, lock, `waiting--`, `barberReady.release()`, unlock, cut hair.\n\nThe interview points are the race on `waiting` (hence the mutex), the remembered signals (no lost wake-up if a customer arrives just as the barber falls asleep), and the parallel with a ThreadPoolExecutor that has a bounded queue and a discard policy.",
      ],
      [
        "Q128. How do you solve the dining philosophers problem without deadlock?",
        "Five philosophers sit around a table with one fork between each pair; each needs **both** neighbouring forks to eat. If all five pick up their left fork at once, each waits forever for the right one: a circular wait, which is deadlock. Solutions:\n\n1. **Resource ordering**: number the forks, and always pick up the **lower-numbered** fork first. The last philosopher then reaches for fork 0 before fork 4, which breaks the cycle. This is the standard answer.\n2. **Limit the diners**: a `Semaphore(4)` lets at most four try to eat at once, so at least one can always get both forks.\n3. **tryLock with back-off**: take the left fork, `tryLock` the right; on failure put the left down, wait a random time, and retry (avoid livelock with the randomness).\n4. **An arbitrator (waiter)**: a philosopher must ask a central monitor for both forks at once (hold-and-wait removed).\n\nAlso discuss starvation: with ordering, a philosopher can still be repeatedly beaten to a fork; fair locks or a waiter queue give bounded waiting.",
        "ReentrantLock first = forks[Math.min(left, right)], second = forks[Math.max(left, right)];\nfirst.lock(); try { second.lock(); try { eat(); } finally { second.unlock(); } } finally { first.unlock(); }",
      ],
      [
        "Q129. What is the cigarette smokers problem?",
        "Three smokers each have an infinite supply of one ingredient: tobacco, paper or matches. An agent repeatedly puts **two different** ingredients on the table; the smoker who has the third should take them, smoke, and signal the agent, which then places the next pair.\n\nThe difficulty (Suhas Patil, 1971) is that with one semaphore per ingredient, a smoker who grabs one ingredient may wait for a second that belongs to another smoker's pair, which causes deadlock. Working designs:\n\n- **A monitor on the table**: the agent puts the pair and calls notifyAll; each smoker waits `while (!table.containsAll(whatIMiss))`; the right smoker takes both, smokes, clears the table and notifies the agent.\n- **Pushers**: helper threads track which ingredients are on the table and signal the one correct smoker once a pair is complete.\n\nThe lesson is that waiting for a *combination* of resources acquired one by one easily deadlocks; check the whole condition atomically under one lock instead.",
      ],
      [
        "Q130. What is the Santa Claus problem?",
        "Santa sleeps until woken by either **all nine reindeer** back from holiday (then he harnesses them and delivers toys) or **three elves** who need help (he helps the three, and other elves must wait until those three are done). Reindeer have **priority** if both groups are waiting. (John Trono, 1994.)\n\nIt combines several patterns:\n\n1. **Counting groups**: a reindeer counter and an elf counter under a mutex; the 9th reindeer or the 3rd elf wakes Santa through a semaphore.\n2. **Group admission**: an elf mutex (or `Semaphore(3)`) stops a fourth elf from joining a group in progress.\n3. **Barriers**: reindeer use a barrier so all nine are harnessed together; the three elves wait for Santa to finish helping.\n4. **Priority**: when Santa wakes, he checks the reindeer count first.\n\nIn Java, a clean version uses a monitor for Santa's state plus `CyclicBarrier(9)` and `CyclicBarrier(3)`, or a `Phaser`. Interviewers mainly want you to identify the waiting conditions, who signals whom, and how the priority rule is enforced.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;
import java.util.function.*;

public class Main {

    // Q121: strict alternation with two semaphores.
    static String fooBar(int n) throws InterruptedException {
        StringBuffer out = new StringBuffer();
        Semaphore foo = new Semaphore(1), bar = new Semaphore(0);
        Thread a = new Thread(() -> { for (int i = 0; i < n; i++) { foo.acquireUninterruptibly(); out.append("foo"); bar.release(); } });
        Thread b = new Thread(() -> { for (int i = 0; i < n; i++) { bar.acquireUninterruptibly(); out.append("bar"); foo.release(); } });
        b.start(); a.start();                                   // start order does not matter
        a.join(); b.join();
        return out.toString();
    }

    // Q122: the zero thread dispatches to odd or even.
    static String zeroEvenOdd(int n) throws InterruptedException {
        StringBuffer out = new StringBuffer();
        Semaphore zero = new Semaphore(1), odd = new Semaphore(0), even = new Semaphore(0);
        Thread z = new Thread(() -> { for (int i = 1; i <= n; i++) { zero.acquireUninterruptibly(); out.append(0); (i % 2 == 1 ? odd : even).release(); } });
        Thread o = new Thread(() -> { for (int i = 1; i <= n; i += 2) { odd.acquireUninterruptibly(); out.append(i); zero.release(); } });
        Thread e = new Thread(() -> { for (int i = 2; i <= n; i += 2) { even.acquireUninterruptibly(); out.append(i); zero.release(); } });
        for (Thread t : List.of(z, o, e)) t.start();
        for (Thread t : List.of(z, o, e)) t.join();
        return out.toString();
    }

    // Q123: four threads, one monitor, notifyAll.
    static final class FizzBuzz {
        private final int n;
        private int current = 1;
        final List<String> out = new ArrayList<>();
        FizzBuzz(int n) { this.n = n; }
        void run(IntPredicate mine, IntFunction<String> say) {
            synchronized (this) {
                while (true) {
                    while (current <= n && !mine.test(current)) {
                        try { wait(); } catch (InterruptedException e) { return; }
                    }
                    if (current > n) { notifyAll(); return; }
                    out.add(say.apply(current));
                    current++;
                    notifyAll();                                // different threads wait for different numbers
                }
            }
        }
    }

    // Q126: capacity 3, one gender at a time.
    static final class Bathroom {
        private int count; private char gender; int peak; int violations;
        synchronized void enter(char g) throws InterruptedException {
            while (count == 3 || (count > 0 && gender != g)) wait();
            if (count > 0 && gender != g) violations++;
            gender = g; count++; peak = Math.max(peak, count);
        }
        synchronized void leave() { count--; notifyAll(); }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("Q121 FooBar n=3: " + fooBar(3));
        System.out.println("Q122 ZeroEvenOdd n=5: " + zeroEvenOdd(5));

        // Q123
        FizzBuzz fb = new FizzBuzz(15);
        List<Thread> fbThreads = List.of(
                new Thread(() -> fb.run(i -> i % 3 == 0 && i % 5 != 0, i -> "fizz")),
                new Thread(() -> fb.run(i -> i % 5 == 0 && i % 3 != 0, i -> "buzz")),
                new Thread(() -> fb.run(i -> i % 15 == 0, i -> "fizzbuzz")),
                new Thread(() -> fb.run(i -> i % 3 != 0 && i % 5 != 0, String::valueOf)));
        for (Thread t : fbThreads) t.start();
        for (Thread t : fbThreads) t.join();
        System.out.println("Q123 FizzBuzz 1-15: " + String.join(" ", fb.out));

        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            // Q124: H2O - 6 hydrogen and 3 oxygen threads in random arrival order.
            Semaphore hSem = new Semaphore(2), oSem = new Semaphore(1);
            List<Character> forming = Collections.synchronizedList(new ArrayList<>());
            List<String> molecules = new CopyOnWriteArrayList<>();
            CyclicBarrier bond = new CyclicBarrier(3, () -> {
                List<Character> m = new ArrayList<>(forming);
                Collections.sort(m);
                molecules.add(m.toString());
                forming.clear();
            });
            List<Callable<Void>> atoms = new ArrayList<>();
            for (char atom : "HOHHOHHOH".toCharArray()) {
                Semaphore gate = atom == 'H' ? hSem : oSem;
                atoms.add(() -> { gate.acquire(); forming.add(atom); bond.await(); gate.release(); return null; });
            }
            Collections.shuffle(atoms, new Random(7));
            for (Future<Void> f : pool.invokeAll(atoms)) f.get();
            System.out.println("Q124 H2O molecules: " + molecules.size() + ", all [H, H, O]: " + molecules.stream().allMatch("[H, H, O]"::equals));

            // Q125: writer-preference readers-writers check - writers always alone.
            AtomicInteger readersIn = new AtomicInteger(), writersIn = new AtomicInteger(), rwViolations = new AtomicInteger();
            ReentrantReadWriteLock rw = new ReentrantReadWriteLock(true);
            List<Callable<Void>> rwTasks = new ArrayList<>();
            for (int t = 0; t < 8; t++) {
                boolean writer = t % 4 == 0;
                rwTasks.add(() -> {
                    for (int i = 0; i < 200; i++) {
                        Lock l = writer ? rw.writeLock() : rw.readLock();
                        l.lock();
                        try {
                            if (writer) { if (writersIn.incrementAndGet() != 1 || readersIn.get() != 0) rwViolations.incrementAndGet(); writersIn.decrementAndGet(); }
                            else { readersIn.incrementAndGet(); if (writersIn.get() != 0) rwViolations.incrementAndGet(); readersIn.decrementAndGet(); }
                        } finally { l.unlock(); }
                    }
                    return null;
                });
            }
            pool.invokeAll(rwTasks);
            System.out.println("Q125 readers-writers: violations of writer exclusivity = " + rwViolations.get());

            // Q126: 6 men and 6 women use the bathroom 5 times each.
            Bathroom bathroom = new Bathroom();
            List<Callable<Void>> people = new ArrayList<>();
            for (int p = 0; p < 12; p++) {
                char g = p % 2 == 0 ? 'M' : 'W';
                people.add(() -> { for (int i = 0; i < 5; i++) { bathroom.enter(g); Thread.sleep(1); bathroom.leave(); } return null; });
            }
            pool.invokeAll(people);
            System.out.println("Q126 unisex bathroom: peak occupancy <= 3: " + (bathroom.peak <= 3) + ", mixed-gender violations = " + bathroom.violations);

            // Q127: sleeping barber - 3 chairs, 12 customers arriving close together.
            Semaphore customers = new Semaphore(0), barberReady = new Semaphore(0);
            Object chairs = new Object();
            int[] waiting = {0}, maxWaiting = {0};
            AtomicInteger served = new AtomicInteger(), turnedAway = new AtomicInteger();
            Thread barber = Thread.ofVirtual().start(() -> {
                try {
                    while (true) {
                        customers.acquire();                         // sleep until a customer arrives
                        synchronized (chairs) { waiting[0]--; }
                        barberReady.release();                       // call the customer to the chair
                        Thread.sleep(3);                             // cut hair
                    }
                } catch (InterruptedException e) { }
            });
            List<Callable<Void>> arrivals = new ArrayList<>();
            for (int c = 0; c < 12; c++) arrivals.add(() -> {
                synchronized (chairs) {
                    if (waiting[0] == 3) { turnedAway.incrementAndGet(); return null; }
                    waiting[0]++;
                    maxWaiting[0] = Math.max(maxWaiting[0], waiting[0]);
                }
                customers.release();
                barberReady.acquire();
                served.incrementAndGet();
                return null;
            });
            pool.invokeAll(arrivals);
            barber.interrupt();
            System.out.println("Q127 sleeping barber: served + turned away = " + (served.get() + turnedAway.get())
                    + ", waiting chairs never above 3: " + (maxWaiting[0] <= 3));

            // Q128: dining philosophers with resource ordering - 5 x 200 meals, no deadlock.
            ReentrantLock[] forks = new ReentrantLock[5];
            for (int i = 0; i < 5; i++) forks[i] = new ReentrantLock();
            int[] meals = new int[5];
            List<Callable<Void>> philosophers = new ArrayList<>();
            for (int p = 0; p < 5; p++) {
                int id = p, left = p, right = (p + 1) % 5;
                philosophers.add(() -> {
                    ReentrantLock first = forks[Math.min(left, right)], second = forks[Math.max(left, right)];
                    for (int i = 0; i < 200; i++) {
                        first.lock();
                        try { second.lock(); try { meals[id]++; } finally { second.unlock(); } }
                        finally { first.unlock(); }
                    }
                    return null;
                });
            }
            for (Future<Void> f : pool.invokeAll(philosophers)) f.get(5, TimeUnit.SECONDS);
            System.out.println("Q128 dining philosophers finished, meals per philosopher " + Arrays.toString(meals));
        }

        // Q129: cigarette smokers - a monitor checks the WHOLE pair atomically.
        List<String> ingredients = List.of("tobacco", "paper", "matches");
        Set<String> table = new HashSet<>();
        boolean[] done = {false};
        List<String> smoked = new ArrayList<>();
        List<Thread> smokers = new ArrayList<>();
        for (String has : ingredients) {
            Set<String> needs = new HashSet<>(ingredients);
            needs.remove(has);
            smokers.add(Thread.ofVirtual().start(() -> {
                synchronized (table) {
                    while (true) {
                        while (!done[0] && !table.equals(needs)) { try { table.wait(); } catch (InterruptedException e) { return; } }
                        if (done[0]) return;
                        table.clear();
                        smoked.add("smoker with " + has);
                        table.notifyAll();
                    }
                }
            }));
        }
        synchronized (table) {
            for (int round = 0; round < 6; round++) {
                while (!table.isEmpty()) table.wait();             // wait for the last pair to be smoked
                for (int i = 0; i < 3; i++) if (i != round % 3) table.add(ingredients.get(i));
                table.notifyAll();
            }
            while (!table.isEmpty()) table.wait();
            done[0] = true;
            table.notifyAll();
        }
        for (Thread s : smokers) s.join();
        System.out.println("Q129 cigarette smokers in order: " + smoked);
    }
}`,
    walk:
      "FooBar starts the bar thread first on purpose: it blocks on its zero-permit semaphore until foo runs, so the output is always `foobarfoobarfoobar`. Zero-Even-Odd lets the zero thread decide who prints next, giving `0102030405`. In FizzBuzz all four threads wait on one monitor for \"their\" number; `notifyAll` after each step lets the right thread take the next one, and every thread exits cleanly once the counter passes 15.\n\nThe H2O atoms arrive in a shuffled order. The semaphores admit two H and one O at a time, the barrier action records each group, and all three molecules are `[H, H, O]`. The readers-writers check counts any moment when a writer was not alone (0). Twelve people use the unisex bathroom with never more than three inside and never mixed genders.\n\nIn the barber shop, every one of the 12 customers is either served or turned away, and the waiting room never holds more than 3. The five philosophers each eat 200 times because the forks are always taken lowest-numbered first, so no circular wait can form. Finally, the agent places six pairs in a fixed rotation and the matching smoker takes each pair, so the order cycles tobacco, paper, matches twice.",
    anim: [
      "Dining philosophers: circular wait, then ordered forks",
      [
        ["p0", "Philosopher 0", "forks 0 and 1"],
        ["f0", "Fork 0", "shared by P0, P4"],
        ["f4", "Fork 4", "shared by P3, P4"],
        ["p4", "Philosopher 4", "forks 4 and 0"],
      ],
      [
        ["p0", "f0", "left fork", "Everyone picks up the left fork first: philosopher 0 takes fork 0."],
        ["p4", "f4", "left fork", "Philosopher 4 takes fork 4. Around the table every philosopher now holds one fork."],
        ["p4", "f0", "waits forever", "Philosopher 4 needs fork 0, held by philosopher 0, and so on around the circle: deadlock."],
        ["p4", "f0", "lowest first", "Fix: always take the LOWER-numbered fork first. Philosopher 4 reaches for fork 0 before fork 4."],
        ["f4", "p0", "cycle broken", "Philosopher 4 waits without holding anything, so someone can always get both forks and the meals continue."],
      ],
    ],
    mistakes: [
      "Using `notify()` when threads wait for different conditions (FizzBuzz), so the wrong thread wakes and the right one sleeps forever.",
      "Releasing the H2O semaphores before the barrier, which lets a fourth atom join a molecule that is still forming.",
      "Grabbing ingredients or forks one at a time with no ordering. Check the whole condition atomically, or order the resources.",
      "Forgetting starvation in readers-writers and unisex-bathroom answers. Interviewers expect you to raise it.",
    ],
    qa: [
      [
        "Why does the dining philosophers ordering fix also apply to bank transfers?",
        "It is the same circular-wait pattern: each account (fork) is a lock, and transferring needs two of them. Locking by a global order (account id) removes the cycle exactly as fork numbering does.",
      ],
      [
        "Can FooBar be solved with a single semaphore?",
        "Not reliably. One semaphore cannot tell whose turn it is: after foo releases it, foo itself may re-acquire it before bar does. You need two signals, or one shared turn variable checked under a lock.",
      ],
      [
        "What does the sleeping barber problem correspond to in a real server?",
        "A single worker thread with a bounded request queue: the waiting chairs are the queue capacity, and turning customers away is a rejection policy (load shedding), like a ThreadPoolExecutor with an ArrayBlockingQueue and DiscardPolicy.",
      ],
    ],
    ex: [
      "Three threads must print A, B, C in that order, repeating 4 times (ABCABCABCABC). Design it with the fewest primitives.",
      "Use three semaphores `a = 1`, `b = 0`, `c = 0`. Thread A: `a.acquire(); print A; b.release();`, thread B: `b.acquire(); print B; c.release();`, thread C: `c.acquire(); print C; a.release();`, each in a loop of 4. It is a ring of hand-offs; alternatively use one lock with a `turn` counter (`while (turn % 3 != me) await()`) and `signalAll`.",
    ],
  }),

  lesson("Concurrency and Parallelism Q131-Q140: Designing a TTL Cache, Rate Limiter, Pub-Sub, Crawler and Task Scheduler", {
    intro:
      "Senior concurrency interviews often end with a **design problem**: build a small, thread-safe component and explain its trade-offs. This block works through the most common ones:\n\n- a thread-safe cache with TTL, and an LRU cache\n- a rate limiter (token bucket)\n- a deferred callback executor, a ticket booking system and an object pool\n- a multithreaded web crawler and a pub-sub system\n- a task scheduler with dependencies, and request coalescing (single-flight)\n\nThe program implements each with a fake clock or latches where time matters, and checks its invariants: no double booking, exactly one load per key, every dependency finishing before its dependants, and so on.",
    topics: [
      [
        "Q131. How do you design a thread-safe cache with TTL (time to live)?",
        "Requirements: `put(key, value, ttl)`, `get(key)` returns null once expired, safe for many threads, and memory must not grow forever.\n\n1. **Storage**: `ConcurrentHashMap<K, Entry>`, where Entry is an immutable record of `value` and `expiresAt`.\n2. **Lazy expiry on read**: `get` checks `expiresAt <= now`; if expired, `map.remove(key, entry)` (the two-argument remove only removes that exact entry, so it never deletes a fresh value another thread just put) and return null.\n3. **Active cleanup**: a `ScheduledExecutorService` periodically calls `map.values().removeIf(expired)`, so keys that are never read again do not leak. Alternatively keep a `DelayQueue` of expirations.\n4. **Clock injection**: take a `LongSupplier` or `Clock`, so tests control time.\n5. **Loading**: `computeIfAbsent` or a single-flight map, to avoid many threads loading the same missing key.\n\nAdd a maximum size with an eviction policy for production; libraries such as Caffeine implement TTL, size limits and near-optimal eviction (W-TinyLFU) and are what you would actually use.",
      ],
      [
        "Q132. How do you design a thread-safe rate limiter?",
        "The most common algorithm is the **token bucket**: a bucket holds up to `capacity` tokens and refills at `rate` tokens per second; each request takes one token or is rejected. It allows bursts up to the capacity while enforcing the average rate.\n\n1. State: `tokens` (a double) and `lastRefill` (a timestamp).\n2. `tryAcquire()`: refill by `(now - lastRefill) * rate`, capped at capacity; set `lastRefill = now`; if `tokens >= 1`, subtract one and return true.\n3. Make the whole method `synchronized` (the refill and the take must be one atomic step), or pack the state into one immutable object and CAS an `AtomicReference` for a lock-free version.\n\nAlternatives: a **fixed window** counter (simple, but bursts at window edges), a **sliding log** (exact, but memory per request) and a **sliding window counter** (a good approximation). For many keys (per user), keep one bucket per key in a ConcurrentHashMap. For a cluster, the state must move to a shared store such as Redis with atomic Lua scripts. Resilience4j and Guava's RateLimiter are ready-made options.",
        "synchronized boolean tryAcquire() {\n    long now = clock.getAsLong();\n    tokens = Math.min(capacity, tokens + (now - last) * ratePerMs);\n    last = now;\n    if (tokens < 1) return false;\n    tokens -= 1;\n    return true;\n}",
      ],
      [
        "Q133. How do you design a deferred callback executor?",
        "Requirement: `register(callback, delayMs)` runs each callback once its delay has passed, from many registering threads, with callbacks executed in order of due time.\n\n1. Wrap each callback in an object implementing `Delayed` (due time plus `getDelay` and `compareTo`).\n2. Store them in a **DelayQueue**, a priority queue in which `take()` blocks until the head is due.\n3. One (or a few) worker threads loop: `queue.take().run()`. If a newly registered callback is due earlier than the current head, DelayQueue wakes the waiting worker automatically.\n\nWithout DelayQueue, the hand-written version uses a `PriorityQueue` guarded by a lock and a Condition: the worker `awaitNanos(head.due - now)`, and `register` signals the condition when it adds a new earliest item. Discuss what happens to slow callbacks (hand them off to a pool so they do not delay others), cancellation (remove from the queue), and shutdown. `ScheduledThreadPoolExecutor.schedule` is the production equivalent.",
      ],
      [
        "Q134. How do you design a ticket booking system that never double-books a seat?",
        "The core invariant is: **one seat, at most one booking**, even when thousands of users click at the same moment.\n\n1. **Atomic claim**: in memory, `ConcurrentHashMap<SeatId, BookingId>` with `putIfAbsent`: exactly one caller gets null back and wins. In a database, a unique constraint on (show, seat), or a conditional `UPDATE seats SET status = 'HELD' WHERE id = ? AND status = 'FREE'` that succeeds for only one transaction.\n2. **Hold, then confirm**: a seat is first **held** with an expiry (say 10 minutes) while the user pays, then confirmed. Expired holds are released by a scheduled job or lazily, with a compare-and-remove so a confirmed booking is never released.\n3. **Multi-seat bookings**: claim all seats or none: lock them in sorted order, or claim one by one and roll back on any failure.\n4. **Idempotency**: payment callbacks and retries carry a booking id, so repeating them does not book twice.\n\nInterviewers look for the atomic check-and-set (never \"check if free, then book\"), the hold expiry, and ordered locking for multiple seats.",
      ],
      [
        "Q135. How do you design a multithreaded web crawler?",
        "Requirements: starting from a URL, fetch pages in parallel, follow links within a domain, and visit each page exactly once.\n\n1. **Visited set**: `ConcurrentHashMap.newKeySet()`, and only the thread whose `visited.add(url)` returns **true** schedules that URL. That atomic add is what prevents duplicate crawling.\n2. **Work distribution**: an executor (virtual threads are ideal, because crawling is I/O-bound) where each task fetches a page and submits tasks for its new links.\n3. **Termination detection**: the hard part, since new tasks keep appearing. Use a `Phaser` (register before submitting a child, arrive and deregister when a task ends), an AtomicInteger of pending tasks, or a CountedCompleter. When the count reaches zero, the crawl is done.\n4. **Politeness and limits**: a per-host Semaphore or rate limiter, a maximum depth, timeouts, and robots.txt.\n5. **Errors**: one failed fetch must not stop the crawl; catch, log and continue.\n\nThe BFS alternative processes the frontier level by level with `invokeAll`, which simplifies termination but loses some parallelism between levels.",
      ],
      [
        "Q136. How do you design a multithreaded pub-sub system?",
        "Components: topics, publishers that send messages to a topic, and subscribers that receive them asynchronously.\n\n1. **Registry**: `ConcurrentHashMap<String, CopyOnWriteArrayList<Subscriber>>`. Subscriptions change rarely and publishing iterates often, which is exactly the copy-on-write sweet spot.\n2. **Delivery**: `publish` must not run subscriber code on the publisher's thread (one slow subscriber would block everyone). Give each subscriber its own **queue and single consumer thread** (a single-threaded executor), which also preserves **per-subscriber message order**.\n3. **Back-pressure**: bound each subscriber's queue and decide what to do when it is full: block the publisher, drop the oldest, or drop the subscriber.\n4. **Failure isolation**: catch exceptions per message, so a failing subscriber neither dies silently nor affects others.\n5. **Lifecycle**: unsubscribe, and shut down each subscriber's executor.\n\nThis is how in-process event buses work (Guava's AsyncEventBus) and a small model of Kafka-style systems, which add persistence, partitions and consumer groups. Java 9's `SubmissionPublisher` implements this pattern with back-pressure.",
      ],
      [
        "Q137. How do you design a task scheduler that respects dependencies?",
        "Tasks form a **DAG**: a task may run only after all its prerequisites finish, and independent tasks should run in parallel.\n\n**Approach 1: CompletableFuture graph.** For each task, create `allOf(futuresOfDeps).thenRunAsync(task, executor)`, building the futures in topological order (memoized recursion). Independent branches run in parallel automatically, and a failure propagates to every dependant.\n\n**Approach 2: Kahn's algorithm with counters.** Keep `remainingDeps` as an AtomicInteger per task and a list of dependants. Submit all tasks with zero dependencies. When a task finishes, decrement each dependant's counter; the thread that brings a counter to **zero** submits that task (`decrementAndGet() == 0` guarantees exactly one submitter). Termination: a counter of tasks still to run, or a latch.\n\nAlso cover cycle detection before starting (a topological sort that cannot visit every node means a cycle), failure policy (skip dependants or retry), and limits on parallelism through the executor size. Build tools such as Gradle and workflow engines such as Airflow are built on exactly this.",
      ],
      [
        "Q138. How do you design a thread-safe object pool (for example a connection pool)?",
        "A pool lends out a limited number of expensive objects and takes them back.\n\n1. **Limit**: `Semaphore(maxSize)`: `borrow()` acquires a permit (optionally with a timeout, so callers fail fast under overload) and `release()` returns it.\n2. **Idle objects**: a `ConcurrentLinkedQueue` (or LinkedBlockingDeque) of available objects. `borrow` polls one, or creates a new one if the queue is empty and the permit allows it.\n3. **Return**: validate or reset the object (roll back an open transaction, clear state), put it back, then release the permit. Always return in finally.\n4. **Health**: test objects on borrow or in the background, evict idle ones after a timeout, and replace broken ones.\n5. **Leak detection**: record the borrowing thread and time, and warn when an object is held too long.\n\nBecause the semaphore holds the limit, the queue itself does not need to be bounded. HikariCP adds thread-local fast paths and a lock-free bag; with virtual threads, a pool like this is the natural place to limit concurrency against a database.",
      ],
      [
        "Q139. What is request coalescing (single-flight), and how do you implement it?",
        "When many threads ask for the **same missing key** at the same moment (a cache stampede, or thundering herd), each would hit the database. Single-flight makes **one** thread do the load while the others wait for and share its result.\n\n1. `ConcurrentHashMap<K, CompletableFuture<V>> inFlight`.\n2. `get(key)`: `inFlight.computeIfAbsent(key, k -> CompletableFuture.supplyAsync(() -> load(k), executor))`. Only the first caller's function runs; everyone else receives the same future.\n3. When it completes, remove it: `future.whenComplete((v, e) -> inFlight.remove(key, future))`, so later calls trigger a fresh load (or keep it as a cache entry, with a TTL).\n4. Callers `join()` or compose on the shared future.\n\nPut a CompletableFuture, not the value, in the map: `computeIfAbsent` holds a bin lock while its function runs, so doing a slow load inside it would block other keys in the same bin. Remove failed futures too, so an error is not cached forever. Go's `singleflight` package and Caffeine's `AsyncLoadingCache` provide this behaviour.",
      ],
      [
        "Q140. How do you design a thread-safe LRU cache?",
        "An LRU cache evicts the **least recently used** entry when it is full, and both `get` and `put` count as a use.\n\n1. The classic structure is a **HashMap plus a doubly linked list**: the map finds the node in O(1), and the list keeps usage order. `get` moves the node to the front; `put` adds at the front and removes from the tail when over capacity.\n2. In Java, `LinkedHashMap` with `accessOrder = true` and an overridden `removeEldestEntry` does all of that.\n3. **Thread safety**: in LRU, even `get` **modifies** the structure (it reorders), so a read-write lock does not help; reads need exclusive access. The simple answer is one lock around every operation (`synchronized`, or `Collections.synchronizedMap`).\n4. **Scaling**: one lock becomes a bottleneck. Options are **striping** (N independent LRU caches chosen by key hash, each with its own lock, giving approximate global LRU), or buffering access events in a lock-free queue and replaying them under the lock in batches, which is what Caffeine does.\n\nMention that exact LRU is rarely required; approximate LRU or W-TinyLFU gives better hit rates with far less contention.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;

public class Main {

    // Q131: TTL cache with an injectable clock.
    static final class TtlCache<K, V> {
        private record Entry<V>(V value, long expiresAt) { }
        private final ConcurrentHashMap<K, Entry<V>> map = new ConcurrentHashMap<>();
        private final LongSupplier clock;
        TtlCache(LongSupplier clock) { this.clock = clock; }
        void put(K key, V value, long ttlMs) { map.put(key, new Entry<>(value, clock.getAsLong() + ttlMs)); }
        V get(K key) {
            Entry<V> e = map.get(key);
            if (e == null) return null;
            if (e.expiresAt() <= clock.getAsLong()) { map.remove(key, e); return null; }   // remove only THIS entry
            return e.value();
        }
        int purgeExpired() {
            long now = clock.getAsLong();
            int before = map.size();
            map.values().removeIf(e -> e.expiresAt() <= now);
            return before - map.size();
        }
    }

    // Q132: token bucket - refill and take in one synchronized step.
    static final class TokenBucket {
        private final double capacity, perMs;
        private double tokens;
        private long last;
        private final LongSupplier clock;
        TokenBucket(int capacity, double perMs, LongSupplier clock) {
            this.capacity = capacity; this.perMs = perMs; this.tokens = capacity; this.clock = clock; this.last = clock.getAsLong();
        }
        synchronized boolean tryAcquire() {
            long now = clock.getAsLong();
            tokens = Math.min(capacity, tokens + (now - last) * perMs);
            last = now;
            if (tokens < 1) return false;
            tokens -= 1;
            return true;
        }
    }

    // Q133: a callback that becomes available after its delay.
    record Deferred(String name, long dueNanos) implements Delayed {
        public long getDelay(TimeUnit unit) { return unit.convert(dueNanos - System.nanoTime(), TimeUnit.NANOSECONDS); }
        public int compareTo(Delayed o) { return Long.compare(dueNanos, ((Deferred) o).dueNanos); }
    }

    // Q135: crawler over a fake link graph; Phaser detects when no task is left.
    static Set<Integer> crawl(Function<Integer, List<Integer>> links, int start) {
        Set<Integer> visited = ConcurrentHashMap.newKeySet();
        Phaser pending = new Phaser(1);                       // party 1 = main
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            visited.add(start);
            submit(pool, pending, visited, links, start);
            pending.arriveAndAwaitAdvance();                  // returns when every task has arrived
        }
        return visited;
    }
    static void submit(ExecutorService pool, Phaser pending, Set<Integer> visited, Function<Integer, List<Integer>> links, int page) {
        pending.register();
        pool.execute(() -> {
            try {
                for (int next : links.apply(page))
                    if (visited.add(next)) submit(pool, pending, visited, links, next);   // only the winner schedules
            } finally { pending.arriveAndDeregister(); }
        });
    }

    // Q136: each subscriber has its own single-threaded mailbox (keeps order, isolates slowness).
    static final class Subscriber {
        final String name;
        final List<String> received = new CopyOnWriteArrayList<>();
        final ExecutorService mailbox = Executors.newSingleThreadExecutor();
        Subscriber(String name) { this.name = name; }
    }
    static final class Broker {
        private final ConcurrentHashMap<String, CopyOnWriteArrayList<Subscriber>> topics = new ConcurrentHashMap<>();
        void subscribe(String topic, Subscriber s) { topics.computeIfAbsent(topic, t -> new CopyOnWriteArrayList<>()).add(s); }
        void publish(String topic, String message) {
            for (Subscriber s : topics.getOrDefault(topic, new CopyOnWriteArrayList<>()))
                s.mailbox.execute(() -> s.received.add(message));
        }
    }

    // Q140: LRU with LinkedHashMap in access order, one lock for every operation.
    static final class LruCache<K, V> {
        private final LinkedHashMap<K, V> map;
        LruCache(int capacity) {
            map = new LinkedHashMap<>(16, 0.75f, true) {
                @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) { return size() > capacity; }
            };
        }
        synchronized V get(K key) { return map.get(key); }        // get REORDERS, so it needs the lock too
        synchronized void put(K key, V value) { map.put(key, value); }
        synchronized Set<K> keys() { return new LinkedHashSet<>(map.keySet()); }
    }

    public static void main(String[] args) throws Exception {
        AtomicLong now = new AtomicLong(1_000);                   // fake clock in ms

        // Q131
        TtlCache<String, String> cache = new TtlCache<>(now::get);
        cache.put("session", "alice", 500);
        cache.put("token", "xyz", 100);
        now.addAndGet(200);
        System.out.println("Q131 after 200 ms: session = " + cache.get("session") + ", token = " + cache.get("token"));
        now.addAndGet(400);
        System.out.println("Q131 after 600 ms: purged " + cache.purgeExpired() + " expired entry, session = " + cache.get("session"));

        // Q132: capacity 5, refill 1 token per 100 ms; 20 threads race at the same instant.
        TokenBucket bucket = new TokenBucket(5, 0.01, now::get);
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            List<Callable<Boolean>> requests = new ArrayList<>();
            for (int i = 0; i < 20; i++) requests.add(bucket::tryAcquire);
            int allowed = 0;
            for (Future<Boolean> f : pool.invokeAll(requests)) if (f.get()) allowed++;
            now.addAndGet(250);
            int afterRefill = 0;
            for (int i = 0; i < 5; i++) if (bucket.tryAcquire()) afterRefill++;
            System.out.println("Q132 burst: " + allowed + " of 20 allowed; 250 ms later " + afterRefill + " more");
        }

        // Q133: registered out of order, executed in due order.
        DelayQueue<Deferred> due = new DelayQueue<>();
        long t0 = System.nanoTime();
        for (var e : Map.of("third", 60, "first", 20, "second", 40).entrySet())
            due.put(new Deferred(e.getKey(), t0 + TimeUnit.MILLISECONDS.toNanos(e.getValue())));
        List<String> ran = new ArrayList<>();
        Thread worker = new Thread(() -> { try { for (int i = 0; i < 3; i++) ran.add(due.take().name()); } catch (InterruptedException e) { } });
        worker.start(); worker.join();
        System.out.println("Q133 deferred callbacks ran in due order: " + ran);

        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            // Q134: 30 users race for 10 seats - putIfAbsent makes each claim atomic.
            ConcurrentHashMap<Integer, String> seats = new ConcurrentHashMap<>();
            CountDownLatch gate = new CountDownLatch(1);
            List<Callable<Boolean>> users = new ArrayList<>();
            for (int u = 0; u < 30; u++) {
                String user = "user-" + u;
                int seat = u % 10;
                users.add(() -> { gate.await(); return seats.putIfAbsent(seat, user) == null; });
            }
            List<Future<Boolean>> claims = new ArrayList<>();
            for (Callable<Boolean> c : users) claims.add(pool.submit(c));
            gate.countDown();
            int booked = 0;
            for (Future<Boolean> f : claims) if (f.get()) booked++;
            System.out.println("Q134 successful bookings = " + booked + ", seats taken = " + seats.size() + " (no double booking)");

            // Q137: DAG A -> {B, C} -> D -> E, run with CompletableFutures.
            Map<String, List<String>> deps = Map.of("A", List.of(), "B", List.of("A"), "C", List.of("A"), "D", List.of("B", "C"), "E", List.of("D"));
            List<String> finished = new CopyOnWriteArrayList<>();
            Map<String, CompletableFuture<Void>> futures = new HashMap<>();
            for (String task : List.of("E", "D", "C", "B", "A")) schedule(task, deps, futures, finished, pool);
            CompletableFuture.allOf(futures.values().toArray(new CompletableFuture[0])).join();
            boolean respected = deps.entrySet().stream().allMatch(e -> e.getValue().stream()
                    .allMatch(d -> finished.indexOf(d) < finished.indexOf(e.getKey())));
            System.out.println("Q137 ran " + finished.size() + " tasks, first " + finished.get(0) + ", last " + finished.get(4) + ", every dependency first: " + respected);

            // Q138: object pool of 3 connections shared by 12 tasks.
            Semaphore permits = new Semaphore(3);
            ConcurrentLinkedQueue<String> idle = new ConcurrentLinkedQueue<>();
            AtomicInteger created = new AtomicInteger(), inUse = new AtomicInteger(), peak = new AtomicInteger();
            List<Callable<Void>> borrowers = new ArrayList<>();
            for (int i = 0; i < 12; i++) borrowers.add(() -> {
                permits.acquire();
                String conn = idle.poll();
                if (conn == null) conn = "conn-" + created.incrementAndGet();
                try { peak.accumulateAndGet(inUse.incrementAndGet(), Math::max); Thread.sleep(5); inUse.decrementAndGet(); }
                finally { idle.offer(conn); permits.release(); }       // always give it back
                return null;
            });
            pool.invokeAll(borrowers);
            System.out.println("Q138 object pool created " + created.get() + " connections, never more than 3 in use: " + (peak.get() <= 3));

            // Q139: single-flight - 8 concurrent callers, one load.
            ConcurrentHashMap<String, CompletableFuture<String>> inFlight = new ConcurrentHashMap<>();
            AtomicInteger loads = new AtomicInteger();
            CountDownLatch start = new CountDownLatch(1);
            Function<String, String> slowLoad = key -> {
                loads.incrementAndGet();
                try { Thread.sleep(300); } catch (InterruptedException e) { }
                return "value-of-" + key;
            };
            List<Callable<String>> callers = new ArrayList<>();
            for (int i = 0; i < 8; i++) callers.add(() -> {
                start.await();
                CompletableFuture<String> f = inFlight.computeIfAbsent("user:42", k -> CompletableFuture.supplyAsync(() -> slowLoad.apply(k), pool));
                f.whenComplete((v, e) -> inFlight.remove("user:42", f));
                return f.join();
            });
            List<Future<String>> results = new ArrayList<>();
            for (Callable<String> c : callers) results.add(pool.submit(c));
            start.countDown();
            Set<String> values = new HashSet<>();
            for (Future<String> r : results) values.add(r.get());
            System.out.println("Q139 single-flight: 8 callers, loads = " + loads.get() + ", shared value " + values);
        }

        // Q135: crawl a 100-page link graph; compare with a sequential BFS.
        Function<Integer, List<Integer>> links = p -> List.of((p * 2 + 1) % 100, (p * 3 + 2) % 100, (p + 7) % 100);
        Set<Integer> parallel = crawl(links, 0);
        Set<Integer> sequential = new HashSet<>(List.of(0));
        Deque<Integer> frontier = new ArrayDeque<>(List.of(0));
        while (!frontier.isEmpty()) for (int n : links.apply(frontier.poll())) if (sequential.add(n)) frontier.add(n);
        System.out.println("Q135 crawler visited " + parallel.size() + " pages exactly once, same as sequential BFS: " + parallel.equals(sequential));

        // Q136: two subscribers each receive all messages, in publish order.
        Broker broker = new Broker();
        Subscriber audit = new Subscriber("audit"), email = new Subscriber("email");
        broker.subscribe("orders", audit);
        broker.subscribe("orders", email);
        for (int i = 1; i <= 5; i++) broker.publish("orders", "order-" + i);
        for (Subscriber s : List.of(audit, email)) s.mailbox.close();
        System.out.println("Q136 audit got " + audit.received + ", email got the same order: " + audit.received.equals(email.received));

        // Q140: capacity 3; reading "a" makes "b" the eldest, so "b" is evicted.
        LruCache<String, Integer> lru = new LruCache<>(3);
        lru.put("a", 1); lru.put("b", 2); lru.put("c", 3);
        lru.get("a");
        lru.put("d", 4);
        System.out.println("Q140 LRU keys after get(a) and put(d): " + lru.keys());
    }

    // Q137 helper: memoized, so each task gets exactly one future.
    static CompletableFuture<Void> schedule(String task, Map<String, List<String>> deps, Map<String, CompletableFuture<Void>> futures,
                                            List<String> finished, ExecutorService pool) {
        CompletableFuture<Void> existing = futures.get(task);
        if (existing != null) return existing;
        CompletableFuture<?>[] before = deps.get(task).stream().map(d -> schedule(d, deps, futures, finished, pool)).toArray(CompletableFuture[]::new);
        CompletableFuture<Void> f = CompletableFuture.allOf(before).thenRunAsync(() -> finished.add(task), pool);
        futures.put(task, f);
        return f;
    }
}`,
    walk:
      "The TTL cache and token bucket run on a fake clock (`AtomicLong now`), so time is fully controlled. After 200 ms the 100 ms token has expired but the session has not; at 600 ms the purge removes the expired session (the token was already removed lazily on read). Twenty threads hit a full bucket of 5 at the same instant and exactly 5 succeed, because refill and take happen in one synchronized step; 250 ms later 2.5 tokens have refilled, so 2 more are allowed.\n\nThe DelayQueue releases callbacks by due time, so they run first, second, third even though they were registered in a different order. Thirty virtual threads released by one latch race for 10 seats; `putIfAbsent` lets exactly one claimant win each seat.\n\nThe scheduler builds one future per task with memoized recursion; A runs first, B and C in parallel, then D and E, and every dependency finished before its dependants. The pool of three connections serves 12 borrowers without ever lending more than 3. In the single-flight test, eight callers arrive together, `computeIfAbsent` runs the loader once, and all eight share its value. The crawler's Phaser ends the crawl when the last task arrives, and it visits exactly the pages a sequential BFS reaches. Each pub-sub subscriber received all five messages in order, and reading `a` saves it from LRU eviction, so `b` is evicted.",
    anim: [
      "Token bucket rate limiter",
      [
        ["req", "Requests", "20 at once"],
        ["bucket", "Token bucket", "5 tokens max"],
        ["ok", "Allowed", "took a token"],
        ["no", "Rejected", "bucket empty"],
        ["clock", "Refill", "1 per 100 ms"],
      ],
      [
        ["req", "bucket", "tryAcquire()", "Each request enters the synchronized tryAcquire: refill by the elapsed time, then try to take a token."],
        ["bucket", "ok", "5 tokens taken", "The full bucket allows a burst of 5; each successful call removes one token."],
        ["bucket", "no", "15 rejected", "With no tokens left, the other 15 requests are rejected immediately (or could wait or queue)."],
        ["clock", "bucket", "+2.5 tokens", "250 ms later the refill adds 2.5 tokens, capped at the capacity."],
        ["bucket", "ok", "2 more allowed", "Two more requests pass. The long-run rate is the refill rate, and bursts are limited to the capacity."],
      ],
    ],
    mistakes: [
      "Checking availability and then booking in two steps (\"if free, then book\"). Claim atomically with putIfAbsent or a conditional UPDATE.",
      "Doing a slow load inside `ConcurrentHashMap.computeIfAbsent`, which holds the bin lock. Store a CompletableFuture instead.",
      "Running subscriber callbacks on the publisher's thread, so one slow subscriber blocks every publish.",
      "Using a read-write lock for an LRU cache. LRU reads reorder the list, so they are writes too.",
    ],
    qa: [
      [
        "How would you make the rate limiter work across many servers?",
        "Move the bucket state into a shared store with atomic operations, such as Redis with a Lua script that refills and decrements in one step (or INCR with expiry for fixed windows), or use a gateway that enforces limits centrally. Local buckets can still pre-filter traffic.",
      ],
      [
        "How does the crawler know it is finished when tasks keep creating tasks?",
        "It counts outstanding work: every task registers with a Phaser (or increments a counter) before it is submitted and arrives (decrements) when it ends. Zero outstanding tasks means nothing can create more work, so the crawl is complete.",
      ],
      [
        "Why remove the single-flight future only if it is still the same future?",
        "`inFlight.remove(key, future)` avoids deleting a newer future that another caller created after this one completed. The two-argument remove is a compare-and-delete.",
      ],
    ],
    ex: [
      "Extend the TTL cache with a maximum size: when full, evict the entry that expires soonest. Which extra data structure would you add, and how do you keep it consistent with the map?",
      "Add a `ConcurrentSkipListSet` of (expiresAt, key) pairs ordered by expiry, or a PriorityQueue guarded by the same lock as the map. On put, insert into both; on eviction, `pollFirst()` and `map.remove(key, entry)` only if the entry still matches. The simplest consistent version guards the map and the ordered set with one lock; a lock-free version tolerates stale index entries and checks them against the map.",
    ],
  }),
];
