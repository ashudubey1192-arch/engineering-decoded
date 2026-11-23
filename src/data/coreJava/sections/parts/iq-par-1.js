import { lesson } from "../../schema.js";

// Top 100 concurrency and parallelism interview questions, Q1-Q30.
export default [
  lesson("Concurrency and Parallelism Q1-Q10: The Fundamentals, Amdahl's Law and Sizing Thread Pools", {
    intro:
      "The top 100 concurrency and parallelism round starts with the ideas every other answer builds on:\n\n- concurrency vs parallelism, and processes vs threads\n- why (and when) multiple threads help, and what they cost\n- Amdahl's law and Gustafson's law, the two speedup formulas interviewers ask you to apply\n- CPU-bound vs I/O-bound work, context switches, and how to size a thread pool\n- task parallelism vs data parallelism, and throughput vs latency\n\nThe program interleaves two tasks on one worker, sums a million numbers on four threads, and computes the speedup and pool-size formulas so you can check your own arithmetic.",
    topics: [
      [
        "Q1. What is the difference between concurrency and parallelism?",
        "**Concurrency** is about **structure**: several tasks are in progress during the same period, and their steps may interleave. **Parallelism** is about **execution**: several tasks run at the same physical instant on different cores.\n\n1. On a single core you can have concurrency without parallelism: the OS time-slices threads A and B, so A1, B1, A2, B2 run one after another, but both tasks make progress.\n2. On a multi-core machine the same concurrent program can also run in parallel, with A on core 1 and B on core 2.\n3. You can even have parallelism without much concurrency in the design, for example a SIMD loop or a parallel stream that splits one computation.\n\nA good one-liner: concurrency is **dealing with** many things at once, parallelism is **doing** many things at once. Concurrency is a property of the program, parallelism a property of the run.",
      ],
      [
        "Q2. What is the difference between a process and a thread?",
        "- **Memory**: a process has its own address space (heap, code, open files). Threads inside one process **share** the heap and static data but each has its own stack, program counter and registers.\n- **Cost**: creating a process is expensive (new address space, page tables). Creating a platform thread is cheaper but still costs an OS thread and roughly 1 MB of reserved stack. A virtual thread (Java 21) costs a few hundred bytes to kilobytes on the heap.\n- **Communication**: processes talk through IPC (pipes, sockets, shared memory files). Threads talk through shared objects, which is fast but needs synchronization.\n- **Isolation**: a crash in one process does not take down another; a thread that corrupts shared state or calls `System.exit` affects the whole JVM.\n\nA JVM is one process. `ProcessBuilder` starts more processes, and `new Thread` or an executor starts threads inside the current one.",
      ],
      [
        "Q3. Why use multiple threads at all, and what does it cost?",
        "Benefits:\n\n- **Responsiveness**: a UI or server thread is not blocked while slow work (disk, network) happens elsewhere.\n- **Throughput**: while one thread waits for I/O, others use the CPU.\n- **Speed on multi-core**: CPU-heavy work split across cores finishes sooner.\n- **Simpler modelling** of independent activities, such as one thread per connection with virtual threads.\n\nCosts:\n\n- **Correctness hazards**: race conditions, visibility bugs, deadlock, livelock and starvation.\n- **Overhead**: thread creation, context switches, cache misses, lock contention and memory for stacks.\n- **Complexity**: non-deterministic bugs that are hard to reproduce, test and debug.\n\nSo the honest answer is: add threads when the gain (latency hidden or cores used) clearly outweighs those costs, and prefer high-level tools (executors, concurrent collections, CompletableFuture) over raw threads.",
      ],
      [
        "Q4. What is Amdahl's law, and how do you apply it?",
        "Amdahl's law gives the **maximum speedup** of a fixed-size problem when only part of it can run in parallel:\n\n`speedup(n) = 1 / ((1 - p) + p / n)`\n\nwhere `p` is the parallel fraction and `n` the number of processors. Step by step for p = 0.90:\n\n1. With 2 cores: 1 / (0.10 + 0.45) = 1.82x.\n2. With 8 cores: 1 / (0.10 + 0.1125) = 4.71x.\n3. With infinite cores the `p / n` term vanishes, so the limit is 1 / 0.10 = **10x**.\n\nThe lesson: the serial part dominates. A 10% serial section caps you at 10x no matter how many cores you buy, so the best optimisation is often shrinking the serial part (less locking, less shared state, a shorter critical section) rather than adding threads.",
        "speedup(n) = 1 / ((1 - p) + p / n)\n// p = 0.90 -> n=2: 1.82x, n=8: 4.71x, n->infinity: 10x",
      ],
      [
        "Q5. What is Gustafson's law, and how is it different from Amdahl's?",
        "Amdahl assumes the **problem size is fixed**. Gustafson observes that in practice, when we get more cores we usually solve a **bigger problem** in the same time (more pixels, more users, a finer simulation grid). His scaled speedup is:\n\n`scaled speedup = n - s * (n - 1)`\n\nwhere `s` is the serial fraction of the **parallel run**. With s = 0.10 and n = 8: 8 - 0.1 * 7 = **7.3x**.\n\nSo Amdahl is pessimistic (strong scaling: same job, more cores) and Gustafson optimistic (weak scaling: bigger job, more cores). Mention both, and say which question you are answering: \"how much faster will this job get?\" is Amdahl; \"how much more work can I do in the same time?\" is Gustafson.",
      ],
      [
        "Q6. What is the difference between CPU-bound and I/O-bound work?",
        "- **CPU-bound** tasks spend their time computing: hashing, compression, image processing, sorting large arrays. They are limited by core count. More threads than cores adds context switches and gives no extra speed.\n- **I/O-bound** tasks spend most of their time **waiting**: database calls, HTTP requests, file reads. While a thread waits, its core is free, so many more threads than cores can be useful.\n\nThis split drives every tuning decision:\n\n1. CPU-bound: a pool of about `availableProcessors()` threads, Fork/Join or parallel streams.\n2. I/O-bound: a larger pool, asynchronous I/O, or (since Java 21) one **virtual thread** per task, which parks cheaply while waiting.\n\nMeasure which you have with a profiler or JFR: high CPU per thread means CPU-bound; threads mostly in WAITING or TIMED_WAITING means I/O-bound.",
      ],
      [
        "Q7. What is a context switch, and why is it expensive?",
        "A context switch is the OS (or JVM, for virtual threads) **saving one thread's state** (registers, program counter, stack pointer) and **restoring another's** so it can run on the same core. It happens when a time slice ends, a thread blocks (lock, I/O, sleep) or a higher-priority thread wakes.\n\nThe direct cost is a few microseconds of kernel work. The bigger hidden cost is **cache pollution**: the new thread's data is not in L1/L2, so it runs slowly for a while, and TLB entries may be flushed.\n\nHow to reduce switches:\n\n- do not create far more runnable CPU-bound threads than cores\n- keep critical sections short so threads block less\n- prefer non-blocking structures for hot paths\n- use virtual threads for blocking I/O, because mounting and unmounting a virtual thread is a cheap user-mode operation, not an OS switch",
      ],
      [
        "Q8. How many threads should a thread pool have?",
        "A widely used formula (from Java Concurrency in Practice):\n\n`threads = cores * targetUtilization * (1 + waitTime / computeTime)`\n\nWorked examples on 8 cores at 100% utilization:\n\n1. **CPU-bound** (wait = 0): 8 * 1 * (1 + 0) = **8** threads, often written as `cores` or `cores + 1`.\n2. **I/O-bound** (each request waits 90 ms and computes 10 ms): 8 * 1 * (1 + 9) = **80** threads.\n\nThen adjust for real limits: a database pool of 20 connections makes more than 20 DB threads pointless, memory per thread matters, and downstream services have rate limits. Always confirm with load tests. For blocking I/O on Java 21+, virtual threads remove most of this tuning: you limit the **resource** (a Semaphore around the DB) rather than the threads.",
        "int threads = (int) Math.ceil(cores * utilization * (1 + waitMs / computeMs));",
      ],
      [
        "Q9. What is the difference between task parallelism and data parallelism?",
        "- **Data parallelism**: the **same** operation runs on different pieces of the data at once. Split an array into four chunks, sum each chunk on its own thread, add the partial sums. Parallel streams, `Arrays.parallelSort` and Fork/Join divide-and-conquer are data parallel.\n- **Task parallelism**: **different** operations run at the same time, perhaps on the same data. Fetch the user, their orders and a price quote concurrently, then combine them. `CompletableFuture` pipelines and `invokeAll` with different Callables are task parallel.\n\nData parallelism scales with data size and core count and usually needs an associative combine step. Task parallelism is limited by how many independent tasks you have, and its speed is set by the slowest one (the critical path).",
      ],
      [
        "Q10. What is the difference between throughput and latency, and how do you measure a speedup correctly?",
        "**Latency** is how long one request takes; **throughput** is how many requests finish per second. They can move in opposite directions: batching raises throughput but adds latency; splitting one request across cores lowers its latency but may lower total throughput because of coordination overhead.\n\nMeasuring correctly:\n\n1. Use **JMH** (Java Microbenchmark Harness), not `System.currentTimeMillis()` around a loop. JMH handles JIT warm-up, dead-code elimination and forking.\n2. Compare against the **best sequential** version, not a deliberately slow one.\n3. Report percentiles (p50, p99) for latency, not just averages.\n4. Run on the target hardware with realistic data sizes; parallelism that wins on 10 million elements often loses on 1,000.\n5. Check CPU utilization and GC; a \"speedup\" that saturates the machine may hurt everything else running on it.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {

    // Q4: Amdahl's law for a fixed-size problem.
    static double amdahl(double parallelFraction, int cores) {
        return 1 / ((1 - parallelFraction) + parallelFraction / cores);
    }

    // Q5: Gustafson's scaled speedup (serial fraction measured on the parallel run).
    static double gustafson(double serialFraction, int cores) {
        return cores - serialFraction * (cores - 1);
    }

    // Q8: threads = cores * utilization * (1 + wait / compute)
    static int poolSize(int cores, double utilization, double waitMs, double computeMs) {
        return (int) Math.ceil(cores * utilization * (1 + waitMs / computeMs));
    }

    public static void main(String[] args) throws Exception {
        // Q1: concurrency WITHOUT parallelism - one worker alternates between two tasks.
        Iterator<String> taskA = List.of("A1", "A2", "A3").iterator();
        Iterator<String> taskB = List.of("B1", "B2", "B3").iterator();
        List<String> timeline = new ArrayList<>();
        while (taskA.hasNext() || taskB.hasNext()) {
            if (taskA.hasNext()) timeline.add(taskA.next());   // time slice for A
            if (taskB.hasNext()) timeline.add(taskB.next());   // switch to B
        }
        System.out.println("Q1 one worker, interleaved steps: " + timeline);

        long[] data = LongStream.rangeClosed(1, 1_000_000).toArray();
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            // Q9 data parallelism: the SAME work on four chunks at the same time.
            List<Future<Long>> partials = new ArrayList<>();
            int chunk = data.length / 4;
            for (int i = 0; i < 4; i++) {
                int from = i * chunk;
                int to = (i == 3) ? data.length : from + chunk;
                partials.add(pool.submit(() -> {
                    long sum = 0;
                    for (int k = from; k < to; k++) sum += data[k];
                    return sum;                                  // each thread owns its sum
                }));
            }
            long total = 0;
            for (Future<Long> partial : partials) total += partial.get();   // combine step
            System.out.println("Q9 data parallelism, 4 chunk sums combined: " + total);

            // Q9 task parallelism: DIFFERENT work running at the same time.
            Future<Long> evens = pool.submit(() -> Arrays.stream(data).filter(x -> x % 2 == 0).count());
            Future<Long> max = pool.submit(() -> Arrays.stream(data).max().getAsLong());
            System.out.println("Q9 task parallelism: evens = " + evens.get() + ", max = " + max.get());
        }

        // Q2: one process hosts many threads; a new thread starts in state NEW.
        Thread worker = new Thread(() -> { }, "worker-1");
        System.out.println("Q2 this JVM is one process (pid > 0: " + (ProcessHandle.current().pid() > 0)
                + "), new thread " + worker.getName() + " is " + worker.getState());

        // Q4 and Q5: the speedup formulas.
        for (int n : new int[] {2, 4, 8, 1024})
            System.out.printf("Q4 Amdahl p = 0.90, n = %-4d -> %.2fx%n", n, amdahl(0.90, n));
        System.out.printf("Q5 Gustafson serial = 0.10, n = 8 -> %.1fx%n", gustafson(0.10, 8));

        // Q8: pool sizing for 8 cores.
        System.out.println("Q8 CPU-bound pool (wait 0 ms, compute 10 ms): " + poolSize(8, 1.0, 0, 10) + " threads");
        System.out.println("Q8 I/O-bound pool (wait 90 ms, compute 10 ms): " + poolSize(8, 1.0, 90, 10) + " threads");

        // Q10: never hard-code the core count; ask the runtime.
        System.out.println("Q10 availableProcessors() is at least 1: " + (Runtime.getRuntime().availableProcessors() >= 1));
    }
}`,
    walk:
      "Q1 alternates two iterators on the main thread, which is exactly what a single core does with two threads: the timeline is A1, B1, A2, B2, A3, B3. Both tasks progress, but never at the same instant.\n\nQ9 then shows both kinds of parallelism. Four Callables each sum their own quarter of the array into a local variable, so nothing is shared and no lock is needed; the main thread adds the four partial results. Two different Callables (count the evens, find the max) show task parallelism.\n\nThe last block evaluates the formulas. Amdahl with 90% parallel work gives 1.82x, 3.08x and 4.71x for 2, 4 and 8 cores, and only 9.91x even with 1,024 cores, because the 10% serial part caps it at 10x. Gustafson's scaled speedup for 8 cores is 7.3x. The pool-size formula returns 8 threads for CPU-bound work and 80 for work that waits nine times longer than it computes.",
    anim: [
      "Concurrency on one core, then parallelism on two",
      [
        ["a", "Task A", "steps A1 A2"],
        ["b", "Task B", "steps B1 B2"],
        ["core1", "Core 1", "time-sliced"],
        ["core2", "Core 2", "idle at first"],
      ],
      [
        ["a", "core1", "A1 runs", "Core 1 runs the first step of task A."],
        ["b", "core1", "switch to B1", "The scheduler saves A's registers and switches core 1 to task B: concurrency, not parallelism."],
        ["a", "core1", "switch to A2", "Back to A. Both tasks progress, but only one runs at any instant on this core."],
        ["b", "core2", "B2 on core 2", "With a second core, B moves there and runs at the same instant as A: now it is parallelism."],
        ["core1", "core2", "no switching", "Each core keeps its own task, so context switches and cache misses drop and total time shrinks."],
      ],
    ],
    mistakes: [
      "Treating concurrency and parallelism as synonyms. A concurrent design can run on one core; parallel speedup needs several.",
      "Creating hundreds of platform threads for CPU-bound work. Beyond the core count you only add context switches.",
      "Quoting speedups from a single `currentTimeMillis()` run without warm-up. Use JMH and compare with the best sequential code.",
      "Forgetting the serial part. A short-looking synchronized section can cap the whole program's speedup (Amdahl).",
    ],
    qa: [
      [
        "Can a single-core machine run a multi-threaded Java program?",
        "Yes. The threads run concurrently by time-slicing. You still get responsiveness and overlap of I/O waits, but no CPU speedup, and all the same race conditions can happen because a switch can occur between any two instructions.",
      ],
      [
        "With p = 0.95, what is the maximum speedup by Amdahl's law?",
        "1 / (1 - 0.95) = 20x, however many cores you add. On 16 cores it is 1 / (0.05 + 0.95/16) = about 9.1x.",
      ],
      [
        "Why does Runtime.availableProcessors() sometimes return fewer cores than the machine has?",
        "The JVM is container-aware: it respects cgroup CPU limits (Docker, Kubernetes) and CPU affinity, so it reports the CPUs this process may actually use. `-XX:ActiveProcessorCount=n` overrides it.",
      ],
    ],
    ex: [
      "A job takes 100 s on one core; 20 s of it is serial. Using Amdahl's law, how long will it take on 4 cores and on 16 cores?",
      "p = 0.8. On 4 cores the time is 20 + 80/4 = 40 s (speedup 2.5x). On 16 cores it is 20 + 80/16 = 25 s (speedup 4x). The limit is 20 s (5x), set entirely by the serial part.",
    ],
  }),

  lesson("Concurrency and Parallelism Q11-Q20: The Java Memory Model, happens-before, volatile and Safe Publication", {
    intro:
      "The second block covers the rules that decide **what one thread can see of another thread's writes**:\n\n- what the Java Memory Model (JMM) is and why visibility bugs exist\n- the happens-before rules you should be able to list\n- what `volatile` does and does not guarantee, and instruction reordering\n- double-checked locking, the holder idiom and safe publication\n- final-field semantics, 64-bit tearing and false sharing\n\nThe program stops a spinning thread with a volatile flag, shows volatile `++` losing updates while AtomicInteger does not, races eight threads to two lazy singletons, and publishes an immutable object safely through a ConcurrentHashMap.",
    topics: [
      [
        "Q11. What is the Java Memory Model?",
        "The JMM (JSR-133, part of the Java Language Specification since Java 5) defines **which values a read of a shared variable may return** when several threads run. It exists because real hardware and compilers do not behave like a single, sequential memory:\n\n- each core has caches and store buffers, so a write may sit there before other cores see it\n- the JIT and the CPU reorder independent instructions for speed\n- registers can hold a copy of a field for a whole loop\n\nThe JMM's contract is: **if your program is correctly synchronized (free of data races), it behaves as if sequentially consistent**. The tool for being correctly synchronized is the **happens-before** relation, created by locks, volatile, thread start and join, final fields and the java.util.concurrent classes.",
      ],
      [
        "Q12. Why can a thread loop forever on a flag that another thread has set?",
        "Consider `boolean running = true;` and a worker doing `while (running) { }`. The main thread later sets `running = false`, yet the worker may never stop. Step by step:\n\n1. There is no happens-before edge between the main thread's write and the worker's reads.\n2. So the JIT is allowed to read the field **once**, keep it in a register, and compile the loop to `if (running) while (true) { }` (hoisting).\n3. The write is real, but the worker never looks at memory again.\n\nThe fix is to make the flag `volatile` (or an `AtomicBoolean`, or read it under a lock). A volatile read must observe the latest volatile write, and the JIT may not hoist it out of the loop. Calling `Thread.interrupt()` and checking `isInterrupted()` is the idiomatic alternative for stopping threads.",
        "static volatile boolean running = true;\n// worker: while (running) { ... }\n// main:   running = false;   // now guaranteed to be seen",
      ],
      [
        "Q13. What are the happens-before rules?",
        "If action A **happens-before** B, then A's effects are visible to B and A appears ordered before B. The rules to know:\n\n1. **Program order**: each action in a thread happens-before every later action in that thread.\n2. **Monitor lock**: an unlock of a monitor happens-before every later lock of the **same** monitor.\n3. **Volatile**: a write to a volatile field happens-before every later read of that field.\n4. **Thread start**: `t.start()` happens-before every action in `t`.\n5. **Thread join**: every action in `t` happens-before another thread returns from `t.join()` (or sees `isAlive()` false).\n6. **Interruption**: `t.interrupt()` happens-before `t` detects the interrupt.\n7. **Finalizer**: the end of a constructor happens-before the start of `finalize()`.\n8. **Transitivity**: if A hb B and B hb C, then A hb C.\n\nThe java.util.concurrent classes add their own: putting into a concurrent collection hb taking it out, `Future` completion hb `get()` returning, `countDown()` hb `await()` returning, and so on.",
      ],
      [
        "Q14. What does volatile guarantee, and what does it not?",
        "`volatile` guarantees:\n\n- **Visibility**: a read sees the most recent write to that variable by any thread.\n- **Ordering**: writes before a volatile write cannot move after it, and reads after a volatile read cannot move before it (release and acquire semantics). This is what makes a volatile flag safe for publishing other data.\n- **Atomic 64-bit access**: reads and writes of volatile `long` and `double` are not torn.\n\nIt does **not** make compound actions atomic. `count++` on a volatile int is still three steps (read, add, write), so two threads can read 5, both write 6, and one increment is lost. Use `AtomicInteger`, `LongAdder` or a lock for read-modify-write. Rule of thumb: volatile is for one writer with many readers, or for flags and state that are set but not computed from the old value.",
      ],
      [
        "Q15. What is instruction reordering, and how does it break code?",
        "Compilers and CPUs may execute independent statements in a different order than written, as long as the result **within that thread** is the same (as-if-serial). Another thread can observe the difference. The classic example:\n\n1. Thread 1 runs `data = 42; ready = true;` (both plain fields).\n2. Reordering may make `ready = true` visible first.\n3. Thread 2 runs `if (ready) print(data);` and can print **0**.\n\nMaking `ready` volatile fixes it: the write of `data` cannot be moved after the volatile write, and thread 2's read of `data` cannot be moved before its volatile read of `ready`. Locks give the same guarantee. Without one of these, the JMM allows the surprising result, and on ARM processors it actually happens far more often than on x86.",
      ],
      [
        "Q16. Why does double-checked locking need volatile, and what is the holder idiom?",
        "Double-checked locking (DCL) tries to avoid locking on every call to a lazy singleton:\n\n1. Check `instance == null` without a lock.\n2. If null, lock, check again, and create the instance.\n\nWithout `volatile`, step 2's `instance = new Config()` can be reordered as **allocate, publish the reference, then run the constructor**. A second thread doing the unlocked check sees a non-null reference to a **half-built object**. Declaring the field `volatile` forbids that reordering (Java 5+).\n\nThe simpler alternative is the **initialization-on-demand holder idiom**: put the instance in a static nested class. The JVM initializes a class lazily (on first use) and under an internal lock, with a happens-before edge to every user, so it is lazy, thread-safe and lock-free after initialization. An `enum` singleton is equally safe.",
        "private static final class Holder { static final Registry INSTANCE = new Registry(); }\nstatic Registry get() { return Holder.INSTANCE; }",
      ],
      [
        "Q17. What is safe publication?",
        "Publishing an object means making it reachable by another thread. It is **safe** when the other thread is guaranteed to see the object fully constructed, with all fields as the constructor left them. Safe ways to publish:\n\n- initialize it from a **static initializer** (`static final Foo FOO = new Foo();`)\n- store the reference in a **volatile** field or an `AtomicReference`\n- store it in a **final** field of an object that is itself safely published\n- store it in a field **guarded by a lock** that both threads use\n- hand it over through a **thread-safe collection or queue**, `Future`, `CompletableFuture` or `Exchanger`\n\nUnsafe publication, such as assigning to a plain public field, may expose default values (0, null) even after the constructor ran. Never let `this` escape from a constructor (registering a listener or starting a thread in the constructor), because other threads can see the object before construction ends.",
      ],
      [
        "Q18. What special guarantee do final fields have?",
        "The JMM gives final fields an **initialization safety** guarantee: if an object is constructed properly (no `this` escape), any thread that obtains a reference to it sees the correct values of its final fields, and of objects reachable through them as they were at the end of the constructor, **even if the reference was published through a data race**.\n\nThat is why immutable objects (all fields final, state set only in the constructor, no mutators, defensive copies of mutable inputs) are thread-safe by construction and can be shared freely. `String`, the boxed types, `LocalDate`, `List.of(...)` and records with immutable components are examples. Note the guarantee covers what the constructor wrote: if you later mutate an array that a final field points to, that mutation needs its own synchronization.",
      ],
      [
        "Q19. Are reads and writes of long and double atomic? What is the difference between atomicity and visibility?",
        "The JLS allows a non-volatile 64-bit `long` or `double` to be written as **two 32-bit halves**, so another thread could see the high half of one value and the low half of another (word tearing). Every 64-bit JVM in practice writes them atomically, but the specification only guarantees it for `volatile` fields, `AtomicLong` and access under a lock. References and all other primitives are always read and written atomically.\n\n- **Atomicity** means an operation happens all at once or not at all; no thread sees a half state.\n- **Visibility** means a write is seen by other threads.\n\nThey are independent: a plain `int` write is atomic but may never be seen; a volatile `count++` is visible but not atomic. Thread-safe code needs both, plus correct **ordering**.",
      ],
      [
        "Q20. What is false sharing, and how do you avoid it?",
        "CPU caches move memory in **cache lines** (usually 64 bytes). If two threads write two **different** variables that sit in the same line, each write invalidates the other core's copy, and the line ping-pongs between cores. The code is correct but can be several times slower. That is false sharing: the threads share a line, not data.\n\nFixes:\n\n1. **Padding**: put unused fields around a hot field so it sits alone in its line, or keep per-thread counters far apart in an array (index * 16 for longs).\n2. The JDK-internal `@jdk.internal.vm.annotation.Contended` annotation, which `LongAdder`'s cells and `Thread` fields use. Application code needs `-XX:-RestrictContended` to use it.\n3. Prefer **thread-local accumulation** and combine at the end, which is what `LongAdder` and parallel stream reductions do.\n\nDiagnose it with a profiler that shows cache misses (perf, async-profiler, Intel VTune) rather than guessing.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {

    static volatile boolean running = true;     // Q12: a stop flag must be volatile
    static volatile int volatileCount = 0;      // Q14: visible, but ++ is not atomic

    // Q16: double-checked locking - correct ONLY because the field is volatile.
    static final class Config {
        static final AtomicInteger created = new AtomicInteger();
        private static volatile Config instance;
        private Config() { created.incrementAndGet(); }
        static Config get() {
            Config local = instance;                   // one volatile read on the fast path
            if (local == null) {
                synchronized (Config.class) {
                    local = instance;                  // second check, under the lock
                    if (local == null) instance = local = new Config();
                }
            }
            return local;
        }
    }

    // Q16: the holder idiom - class initialization is lazy and thread-safe.
    static final class Registry {
        static final AtomicInteger created = new AtomicInteger();
        private Registry() { created.incrementAndGet(); }
        private static final class Holder { static final Registry INSTANCE = new Registry(); }
        static Registry get() { return Holder.INSTANCE; }
    }

    // Q18: immutable: final fields, a defensive copy, no setters.
    record Point(int x, int y) { }
    static final class Route {
        private final List<Point> points;
        Route(List<Point> points) { this.points = List.copyOf(points); }
        List<Point> points() { return points; }
    }

    // Q20: padding keeps each hot counter in its own cache line (illustrative).
    static final class PaddedCounter { volatile long value; long p1, p2, p3, p4, p5, p6, p7; }

    public static void main(String[] args) throws Exception {
        // Q12 + Q13: a volatile write happens-before the worker's next read of the flag.
        long[] spins = {0};
        Thread worker = new Thread(() -> { while (running) { spins[0]++; Thread.onSpinWait(); } });
        worker.start();                                   // start() happens-before the worker's actions
        Thread.sleep(50);
        running = false;
        worker.join(2000);                                // the worker's writes happen-before join returns
        System.out.println("Q12 worker saw the volatile flag and stopped: " + !worker.isAlive());
        System.out.println("Q13 after join() main sees the worker's writes: " + (spins[0] > 0));

        AtomicInteger atomic = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            // Q14: 4 threads x 100,000 increments.
            List<Callable<Void>> jobs = new ArrayList<>();
            for (int t = 0; t < 4; t++) jobs.add(() -> {
                for (int i = 0; i < 100_000; i++) { volatileCount++; atomic.incrementAndGet(); }
                return null;
            });
            pool.invokeAll(jobs);
            System.out.println("Q14 volatile++ never exceeds 400000 and may lose updates: " + (volatileCount <= 400_000)
                    + "; AtomicInteger = " + atomic.get());

            // Q16: eight threads race to both lazy singletons.
            List<Callable<List<Object>>> racers = new ArrayList<>();
            for (int t = 0; t < 8; t++) racers.add(() -> List.of(Config.get(), Registry.get()));
            Set<Object> distinct = Collections.newSetFromMap(new IdentityHashMap<>());
            for (Future<List<Object>> f : pool.invokeAll(racers)) distinct.addAll(f.get());
            System.out.println("Q16 Config created " + Config.created.get() + "x, Registry created "
                    + Registry.created.get() + "x, distinct instances seen: " + distinct.size());

            // Q17: safe publication through a thread-safe collection.
            ConcurrentHashMap<String, Route> published = new ConcurrentHashMap<>();
            pool.submit(() -> published.put("r1", new Route(List.of(new Point(0, 0), new Point(3, 4))))).get();
            Future<Integer> reader = pool.submit(() -> published.get("r1").points().size());
            System.out.println("Q17 reader thread saw a fully built Route with " + reader.get() + " points");
        }

        // Q18: the caller's list changes later; the immutable Route does not.
        List<Point> source = new ArrayList<>(List.of(new Point(1, 2)));
        Route route = new Route(source);
        source.add(new Point(9, 9));
        boolean unmodifiable;
        try { route.points().add(new Point(5, 5)); unmodifiable = false; }
        catch (UnsupportedOperationException e) { unmodifiable = true; }
        System.out.println("Q18 Route still has " + route.points().size() + " point; its list is unmodifiable: " + unmodifiable);

        // Q19: AtomicLong (like a volatile long) is never torn.
        System.out.println("Q19 AtomicLong holds a full 64-bit value: " + new AtomicLong(Long.MAX_VALUE).get());

        // Q20: each thread writes only its own padded counter.
        PaddedCounter[] counters = { new PaddedCounter(), new PaddedCounter() };
        Thread a = new Thread(() -> { for (int i = 0; i < 1_000_000; i++) counters[0].value++; });
        Thread b = new Thread(() -> { for (int i = 0; i < 1_000_000; i++) counters[1].value++; });
        a.start(); b.start(); a.join(); b.join();
        System.out.println("Q20 single-writer padded counters: " + counters[0].value + " and " + counters[1].value);
    }
}`,
    walk:
      "The worker spins on the static volatile `running` flag. After 50 ms main writes `false`; because that volatile write happens-before the worker's next volatile read, the worker leaves its loop and `join` returns. `join` also creates an edge from everything the worker did to main, so main can read `spins` safely.\n\nIn Q14 four threads increment both a volatile int and an AtomicInteger 100,000 times each. The AtomicInteger is always exactly 400,000. The volatile int can only be checked as \"at most 400,000\", because concurrent `++` operations overwrite each other.\n\nQ16 runs eight threads at once through `Config.get()` (DCL with a volatile field) and `Registry.get()` (holder idiom). Each constructor runs once, and the identity set holds exactly two objects. Q17 puts an immutable Route into a ConcurrentHashMap on one thread and reads it on another. Q18 shows the defensive copy: the caller's later `add` does not affect the Route, and the Route's own list rejects changes. Q20's counters each have one writer, so their volatile increments are exact.",
    anim: [
      "How a volatile write becomes visible",
      [
        ["t1", "Thread 1", "writer"],
        ["c1", "Core 1 cache", "ready = true"],
        ["mem", "Main memory", "shared heap"],
        ["c2", "Core 2 cache", "stale copy"],
        ["t2", "Thread 2", "reader"],
      ],
      [
        ["t1", "c1", "data=42 ready=1", "Thread 1 writes `data = 42` and then the flag. With plain fields both may stay in core 1's cache or store buffer."],
        ["c2", "t2", "reads stale", "Without happens-before, thread 2 may keep reading its stale copy, or see the flag before the data."],
        ["c1", "mem", "volatile flush", "Make `ready` volatile: the write releases, so `data = 42` and `ready = true` are published together, in order."],
        ["mem", "c2", "volatile read", "Thread 2's volatile read of `ready` acquires, invalidating the stale copy and fetching fresh values."],
        ["c2", "t2", "sees data = 42", "Because the volatile write happens-before the read that saw it, thread 2 is guaranteed to see data = 42."],
      ],
    ],
    mistakes: [
      "Using `volatile int count; count++` as a thread-safe counter. It is visible but not atomic.",
      "Writing double-checked locking without `volatile`, which can expose a half-constructed object.",
      "Starting a thread or registering a listener inside a constructor, which lets `this` escape before construction ends.",
      "Assuming that \"it works on my x86 laptop\" proves correctness. ARM servers reorder far more aggressively.",
    ],
    qa: [
      [
        "Does synchronized provide visibility as well as mutual exclusion?",
        "Yes. Releasing a monitor flushes the thread's writes and acquiring the same monitor sees them (the monitor-lock happens-before rule). Both threads must use the same lock object.",
      ],
      [
        "Is a volatile reference to an object enough to make the object thread-safe?",
        "No. It safely publishes the reference and the state at the time of the write, but later changes to the object's fields need their own synchronization. It is enough if the object is immutable or effectively immutable after publication.",
      ],
      [
        "What is a data race in JMM terms?",
        "Two accesses to the same variable by different threads, at least one a write, that are not ordered by happens-before. A program with data races can see stale or reordered values; a race-free program behaves as sequentially consistent.",
      ],
    ],
    ex: [
      "Thread 1 runs `x = 1; v = true;` where only `v` is volatile. Thread 2 runs `if (v) System.out.println(x);`. Which outputs are possible, and what changes if `v` is not volatile?",
      "With volatile `v`, the only possible outputs are nothing (v still false) or `1`, because the write to x happens-before the volatile write, which happens-before the read that saw true. Without volatile, `0` is also allowed: the writes may be reordered or the read of x may see a stale value.",
    ],
  }),

  lesson("Concurrency and Parallelism Q21-Q30: synchronized, ReentrantLock, Read-Write and Stamped Locks, Conditions", {
    intro:
      "The third block is about **locks**, the main tool for mutual exclusion:\n\n- what `synchronized` locks, and why intrinsic locks are reentrant\n- ReentrantLock vs synchronized, and fair vs unfair locks\n- ReadWriteLock and StampedLock with optimistic reads\n- Condition objects, `tryLock` and `lockInterruptibly`\n- lock granularity, lock striping, and blocking vs lock-free vs wait-free algorithms\n\nThe program counts with synchronized and with a striped lock, proves that three readers share a read lock at the same moment, times out a `tryLock`, invalidates an optimistic stamp, and runs a two-Condition bounded buffer.",
    topics: [
      [
        "Q21. What does synchronized lock, and what does it guarantee?",
        "Every Java object has an intrinsic lock (monitor). `synchronized` acquires it:\n\n- a `synchronized` **instance method** locks `this`\n- a `static synchronized` method locks the `Class` object (`Main.class`)\n- a `synchronized (obj) { }` **block** locks `obj`, which lets you choose a private lock object and keep the critical section small\n\nIt guarantees **mutual exclusion** (one thread at a time per monitor), **visibility** (unlock happens-before the next lock of the same monitor) and **atomicity** of the whole block. A thread that cannot get the monitor is BLOCKED and cannot be interrupted while waiting. Locks are released automatically when the block exits, even by an exception. Two threads only exclude each other if they lock the **same** object; an instance method and a static method do not block each other.",
      ],
      [
        "Q22. What is reentrancy, and why does it matter?",
        "A lock is **reentrant** if the thread that holds it can acquire it again without blocking. The lock keeps an owner and a hold count: each acquire by the owner increments it, each release decrements it, and the lock is free at zero.\n\nIt matters because:\n\n1. A synchronized method can call another synchronized method on the same object (or recurse) without deadlocking itself.\n2. A subclass's synchronized override can call `super.method()`, which locks the same `this`.\n\nBoth `synchronized` and `ReentrantLock` are reentrant (`getHoldCount()` shows the count). A `Semaphore` and a simple spin lock are **not**: acquiring twice from the same thread deadlocks. `StampedLock` is also not reentrant.",
      ],
      [
        "Q23. When would you choose ReentrantLock over synchronized?",
        "`synchronized` is simpler, cannot be forgotten to release, and is optimised well by the JVM. Choose `ReentrantLock` when you need something it lacks:\n\n- **timed or polled acquisition**: `tryLock()` and `tryLock(timeout, unit)`, to avoid deadlock or give up under load\n- **interruptible waiting**: `lockInterruptibly()`\n- **fairness**: `new ReentrantLock(true)`\n- **several wait sets** on one lock: `newCondition()` many times\n- **non-block-structured locking**: lock in one method, unlock in another (hand-over-hand locking in linked lists)\n- **introspection**: `isLocked()`, `getQueueLength()`, `isHeldByCurrentThread()`\n\nThe price is discipline: always `lock()` **before** `try` and `unlock()` in `finally`. Since JDK 24 (JEP 491), virtual threads no longer pin their carrier inside `synchronized`, which removed the main reason to switch for virtual-thread code.",
        "lock.lock();\ntry {\n    // critical section\n} finally {\n    lock.unlock();\n}",
      ],
      [
        "Q24. What is the difference between fair and unfair locks?",
        "- A **fair** lock grants access in roughly FIFO order: the longest-waiting thread goes next. It prevents starvation and gives more predictable latency.\n- An **unfair** lock (the default for ReentrantLock, and how synchronized behaves) lets a newly arriving thread **barge** ahead of queued threads if the lock happens to be free.\n\nUnfair locks have much higher throughput: waking a parked thread takes microseconds, and in that gap a running thread can take the lock, do its work and release it. Fair locks force a handoff to the queued thread every time, causing more context switches. Use fairness only when starvation is a demonstrated problem. Note that even a fair lock's `tryLock()` without a timeout barges.",
      ],
      [
        "Q25. What is a ReadWriteLock, and when does it help?",
        "`ReentrantReadWriteLock` has two linked locks:\n\n- the **read lock** can be held by many threads at once, as long as no thread holds the write lock\n- the **write lock** is exclusive: it waits for all readers to leave and blocks new ones\n\nIt helps when reads vastly outnumber writes and each read is long enough to benefit from running in parallel (a cache or configuration lookup). It hurts when critical sections are tiny or writes are frequent, because a read-write lock costs more per acquisition than a plain lock, and it can starve writers under heavy read load (unless fair).\n\nRules to quote: a writer can **downgrade** (acquire the read lock while holding the write lock, then release the write lock), but a reader can **not upgrade** to the write lock; trying deadlocks.",
      ],
      [
        "Q26. What is a StampedLock, and what is an optimistic read?",
        "`StampedLock` (Java 8) returns a `long` **stamp** from each acquisition and offers three modes: write, read, and **optimistic read**. An optimistic read takes no lock at all:\n\n1. `long stamp = sl.tryOptimisticRead();`\n2. Copy the fields you need into local variables.\n3. `if (!sl.validate(stamp))`, a writer got in meanwhile: fall back to `sl.readLock()` and read again.\n\nWhen writes are rare, readers never write to shared memory, so there is no cache-line contention between them, which makes it faster than ReadWriteLock. Cautions: it is **not reentrant**, has no Conditions, the copied values may be inconsistent until validated (so do not act on them first), and you must unlock with the exact stamp. It also supports conversion with `tryConvertToWriteLock`.",
      ],
      [
        "Q27. What is a Condition, and how does it improve on wait and notify?",
        "A `Condition` is a wait set tied to a `Lock`, created with `lock.newCondition()`. `await()` releases the lock and waits; `signal()` and `signalAll()` wake waiters, which re-acquire the lock before returning.\n\nAdvantages over `Object.wait/notify`:\n\n- **several conditions per lock**: a bounded buffer can have `notFull` and `notEmpty`, so producers wake only consumers and vice versa, and a single `signal()` is safe\n- timed and interruptible variants: `await(time, unit)`, `awaitNanos`, `awaitUntil(deadline)` and `awaitUninterruptibly()`\n- it works with fair locks and non-block-structured code\n\nThe rules are the same as wait/notify: hold the lock when calling them (or get IllegalMonitorStateException), and always wait in a `while` loop that re-checks the predicate, because of spurious wake-ups.",
      ],
      [
        "Q28. What do tryLock and lockInterruptibly give you?",
        "- `tryLock()` returns `true` immediately if the lock is free (or already held by you) and `false` otherwise, never blocking.\n- `tryLock(timeout, unit)` waits up to the timeout, returns false if it expires, and responds to interruption with InterruptedException.\n- `lockInterruptibly()` waits indefinitely but can be cancelled by `interrupt()`.\n\nThese turn a potential deadlock into a recoverable failure. A transfer between two accounts can `tryLock` both with a timeout, and if either fails, release what it holds, back off for a random time and retry. A request handler can give up after 100 ms and return \"busy\" rather than queuing forever. Plain `synchronized` offers none of this: a BLOCKED thread waits until it gets the monitor.",
      ],
      [
        "Q29. What is lock granularity and lock striping? What do lock coarsening and elision mean?",
        "**Granularity** is how much data one lock protects. One global lock is simple but serializes everything; finer locks allow more parallelism but risk deadlock and cost more to reason about.\n\n**Lock striping** is the middle ground: N locks each guard 1/N of the data, selected by hash. A key's stripe is `hash % N`, so operations on different stripes run in parallel. Java 7's ConcurrentHashMap used 16 segments this way; Java 8+ goes further and locks individual bins.\n\nThe JIT also optimises locks automatically:\n\n- **lock elision**: if escape analysis proves the object never leaves the thread (a local `StringBuffer`), its locks are removed\n- **lock coarsening**: adjacent lock and unlock pairs on the same object are merged into one bigger section\n\nBoth are reasons why micro-benchmarks of uncontended locks are misleading.",
      ],
      [
        "Q30. What is the difference between blocking, lock-free and wait-free algorithms?",
        "- **Blocking**: a thread may wait indefinitely for another (a lock holder). If the holder is descheduled or slow, everyone waits. Deadlock is possible.\n- **Obstruction-free**: a thread finishes in a bounded number of steps if it runs alone, without interference.\n- **Lock-free**: at every moment **some** thread makes progress. Individual threads may retry many times (a CAS loop can lose repeatedly), but the system as a whole never stalls. `AtomicInteger.incrementAndGet`, `ConcurrentLinkedQueue` and the Treiber stack are lock-free.\n- **Wait-free**: **every** thread finishes in a bounded number of its own steps, whatever others do. The strongest and hardest guarantee; a few operations, such as `getAndAdd` on hardware with a fetch-and-add instruction, are wait-free.\n\nNon-blocking algorithms avoid deadlock and priority inversion and survive a thread being paused, but under heavy contention CAS retries can waste CPU, so they are not automatically faster.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class Main {

    // Q21: synchronized instance methods lock "this".
    static class Counter {
        private int value;
        synchronized void increment() { value++; }
        synchronized int get() { return value; }
    }

    // Q22: reentrancy - the owner re-enters its own monitor.
    static class Tree {
        synchronized int depth(int n) { return n == 0 ? 0 : 1 + depth(n - 1); }
    }

    // Q27: a bounded buffer with TWO conditions on one lock.
    static class BoundedBuffer<T> {
        private final Deque<T> items = new ArrayDeque<>();
        private final int capacity;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();
        BoundedBuffer(int capacity) { this.capacity = capacity; }
        void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (items.size() == capacity) notFull.await();     // loop: spurious wake-ups
                items.addLast(item);
                notEmpty.signal();                                      // wake one consumer only
            } finally { lock.unlock(); }
        }
        T take() throws InterruptedException {
            lock.lock();
            try {
                while (items.isEmpty()) notEmpty.await();
                T item = items.removeFirst();
                notFull.signal();                                       // wake one producer only
                return item;
            } finally { lock.unlock(); }
        }
    }

    // Q26: optimistic read with a fallback to a real read lock.
    static class Position {
        private double x, y;
        private final StampedLock sl = new StampedLock();
        void move(double dx, double dy) {
            long stamp = sl.writeLock();
            try { x += dx; y += dy; } finally { sl.unlockWrite(stamp); }
        }
        double distanceFromOrigin() {
            long stamp = sl.tryOptimisticRead();
            double cx = x, cy = y;                       // copy first, validate second
            if (!sl.validate(stamp)) {
                stamp = sl.readLock();
                try { cx = x; cy = y; } finally { sl.unlockRead(stamp); }
            }
            return Math.hypot(cx, cy);
        }
    }

    // Q29: lock striping - 8 locks, each guarding one slot.
    static class StripedCounter {
        private final Object[] locks = new Object[8];
        private final long[] counts = new long[8];
        StripedCounter() { for (int i = 0; i < locks.length; i++) locks[i] = new Object(); }
        void add(int key) {
            int stripe = Math.floorMod(key, locks.length);
            synchronized (locks[stripe]) { counts[stripe]++; }
        }
        long total() {
            long sum = 0;
            for (int i = 0; i < locks.length; i++) synchronized (locks[i]) { sum += counts[i]; }
            return sum;
        }
    }

    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            Counter counter = new Counter();
            StripedCounter striped = new StripedCounter();
            List<Callable<Void>> jobs = new ArrayList<>();
            for (int t = 0; t < 4; t++) jobs.add(() -> {
                for (int i = 0; i < 10_000; i++) { counter.increment(); striped.add(i); }
                return null;
            });
            pool.invokeAll(jobs);
            System.out.println("Q21 synchronized counter = " + counter.get());
            System.out.println("Q22 reentrant recursion depth = " + new Tree().depth(5));

            // Q23 + Q24: a fair ReentrantLock acquired twice by main.
            ReentrantLock lock = new ReentrantLock(true);
            lock.lock();
            lock.lock();
            System.out.println("Q23 hold count = " + lock.getHoldCount() + ", fair = " + lock.isFair());

            // Q28: another thread gives up after 50 ms instead of blocking forever.
            Future<Boolean> other = pool.submit(() -> lock.tryLock(50, TimeUnit.MILLISECONDS));
            System.out.println("Q28 other thread tryLock(50 ms) while main holds it: " + other.get());
            lock.unlock();
            lock.unlock();
            Future<Boolean> later = pool.submit(() -> {
                boolean ok = lock.tryLock();
                if (ok) lock.unlock();
                return ok;
            });
            System.out.println("Q28 tryLock() after main released both holds: " + later.get());

            // Q25: three readers are inside the read lock at the same moment.
            ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
            CountDownLatch allInside = new CountDownLatch(3);
            List<Callable<Boolean>> readers = new ArrayList<>();
            for (int r = 0; r < 3; r++) readers.add(() -> {
                rw.readLock().lock();
                try {
                    allInside.countDown();
                    return allInside.await(2, TimeUnit.SECONDS);   // only true if all 3 share it
                } finally { rw.readLock().unlock(); }
            });
            boolean shared = true;
            for (Future<Boolean> f : pool.invokeAll(readers)) shared &= f.get();
            boolean writeFree = rw.writeLock().tryLock();
            System.out.println("Q25 three readers held the read lock together: " + shared + ", write lock free afterwards: " + writeFree);
            rw.writeLock().unlock();

            // Q26
            Position position = new Position();
            position.move(3, 4);
            System.out.println("Q26 optimistic read distance = " + position.distanceFromOrigin());
            StampedLock sl = new StampedLock();
            long stamp = sl.tryOptimisticRead();
            sl.unlockWrite(sl.writeLock());                       // a writer slips in
            System.out.println("Q26 optimistic stamp still valid after a write: " + sl.validate(stamp));

            // Q27: six items through a two-slot buffer.
            BoundedBuffer<Integer> buffer = new BoundedBuffer<>(2);
            Future<?> producer = pool.submit(() -> { for (int i = 1; i <= 6; i++) buffer.put(i); return null; });
            List<Integer> received = new ArrayList<>();
            for (int i = 0; i < 6; i++) received.add(buffer.take());
            producer.get();
            System.out.println("Q27 Condition-based buffer delivered " + received);
            System.out.println("Q29 striped counter total = " + striped.total());
        }

        // Q30: a lock-free update - a CAS loop, no thread ever holds a lock.
        AtomicInteger value = new AtomicInteger();
        value.updateAndGet(v -> v + 41);
        System.out.println("Q30 lock-free updateAndGet then incrementAndGet = " + value.incrementAndGet());
    }
}`,
    walk:
      "Four pool threads each call `increment()` and `striped.add(i)` 10,000 times. The synchronized counter reaches exactly 40,000, and so does the striped counter, whose eight locks let different keys proceed in parallel. `depth(5)` re-enters the same monitor five times and returns 5 instead of deadlocking.\n\nMain then locks a fair ReentrantLock twice (hold count 2). A pool thread's `tryLock(50 ms)` returns false after the timeout, because the lock is owned by main. After main unlocks twice, a plain `tryLock()` succeeds.\n\nIn Q25 each reader counts down a latch and waits for the other two while still holding the read lock. All three return true, which is only possible if the read lock was shared. Q26 computes the 3-4-5 distance with an optimistic read, then shows that a write between `tryOptimisticRead` and `validate` makes the stamp invalid. Q27 pushes six items through a two-slot buffer: the producer blocks on `notFull` whenever the buffer is full, and order is preserved.",
    anim: [
      "Two threads compete for one ReentrantLock",
      [
        ["t1", "Thread 1", "owner"],
        ["lock", "ReentrantLock", "holds = 0"],
        ["t2", "Thread 2", "contender"],
        ["queue", "Wait queue", "FIFO if fair"],
      ],
      [
        ["t1", "lock", "lock()", "Thread 1 acquires the free lock; owner = thread 1, hold count 1."],
        ["t1", "lock", "lock() again", "Reentrancy: the owner locks again without blocking, and the hold count becomes 2."],
        ["t2", "queue", "tryLock(50ms)", "Thread 2 cannot get the lock, so it parks in the queue for at most 50 ms."],
        ["queue", "t2", "timeout: false", "The timeout expires and tryLock returns false, so thread 2 can back off instead of deadlocking."],
        ["lock", "t2", "unlock() x2", "Thread 1 unlocks twice; at hold count 0 the lock is free and thread 2's next tryLock succeeds."],
      ],
    ],
    mistakes: [
      "Calling `lock.lock()` inside the try block. If it throws, finally runs `unlock()` on a lock you never got.",
      "Waiting on a Condition with `if` instead of `while`, which breaks on spurious wake-ups.",
      "Trying to upgrade a read lock to a write lock in ReentrantReadWriteLock. The thread deadlocks with itself.",
      "Using fairness by default. It sharply reduces throughput and is rarely needed.",
    ],
    qa: [
      [
        "Can two threads execute two different synchronized instance methods of the same object at the same time?",
        "No. Both methods lock the same `this` monitor, so the second thread blocks. They can run at the same time on two different objects, or if one method is static synchronized (which locks the Class object).",
      ],
      [
        "What happens if a thread calls unlock() on a ReentrantLock it does not hold?",
        "It throws IllegalMonitorStateException. That is also what happens if you call `await()` or `signal()` on a Condition without holding its lock.",
      ],
      [
        "When is ReadWriteLock slower than a simple lock?",
        "When critical sections are very short or writes are frequent. The read lock still updates a shared reader count with CAS, so readers contend on that cache line, and writers wait for every reader to leave.",
      ],
    ],
    ex: [
      "Implement `transfer(Account from, Account to, int amount)` with ReentrantLock so that it can never deadlock, even if two threads transfer in opposite directions at the same time.",
      "Either order the locks (always lock the account with the smaller id first), or loop: `if (from.lock.tryLock()) try { if (to.lock.tryLock()) try { move money; return; } finally { to.lock.unlock(); } } finally { from.lock.unlock(); }` and then sleep for a short random time before retrying. Ordering is simpler and has no retries; tryLock also supports timeouts and cancellation.",
    ],
  }),
];
