import { Controls, Frame, Rich, useStepper, useSvgId } from "./Stepper";

// Flow diagrams: boxes + arrows, and steps that light up part of the picture and move a
// token along it. node: [id, label, x, y, w, sub?]   edge: [from, to, label?, options?]
// step: { on: [nodeIds], edges: ["from>to"], cls: { id: "bad" | "dead" | "ok" }, subs, token, note }

const FLOWS = {
  compile: {
    title: "From source code to running program",
    width: 780,
    height: 250,
    nodes: [
      ["src", "Main.java", 80, 60, 120, "source code"],
      ["javac", "javac", 235, 60, 100, "compiler"],
      ["class", "Main.class", 390, 60, 120, "bytecode"],
      ["jvm", "java Main", 550, 60, 120, "JVM runs it"],
      ["out", "Hello, World!", 705, 60, 130, "output"],
      ["win", "JVM · Windows", 260, 190, 140],
      ["linux", "JVM · Linux", 430, 190, 130],
      ["mac", "JVM · macOS", 600, 190, 130],
    ],
    edges: [["src", "javac"], ["javac", "class"], ["class", "jvm"], ["jvm", "out"], ["class", "win", "", { dashed: true }], ["class", "linux", "", { dashed: true }], ["class", "mac", "", { dashed: true }]],
    steps: [
      { on: ["src"], token: "src", note: "You write `Main.java`: a public class Main with `public static void main(String[] args)`." },
      { on: ["src", "javac"], edges: ["src>javac"], token: "javac", note: "`javac Main.java` checks syntax and types, then compiles. Compile errors stop here." },
      { on: ["class"], edges: ["javac>class"], token: "class", note: "The result is `Main.class`: platform-neutral BYTECODE, not machine code." },
      { on: ["jvm"], edges: ["class>jvm"], token: "jvm", note: "`java Main` starts a JVM, which loads the class, verifies the bytecode and calls main()." },
      { on: ["out"], edges: ["jvm>out"], token: "out", note: "The interpreter and JIT compiler turn bytecode into CPU instructions, and the program prints its output." },
      { on: ["class", "win", "linux", "mac"], edges: ["class>win", "class>linux", "class>mac"], token: "class", note: "Write once, run anywhere: the SAME .class file runs on every OS that has a JVM. The JVM is platform-specific; bytecode is not." },
    ],
  },
  jvm: {
    title: "JVM architecture: class loader → runtime data areas → execution engine",
    width: 860,
    height: 360,
    groups: [
      [20, 112, 820, 104, "RUNTIME DATA AREAS"],
      [20, 240, 610, 104, "EXECUTION ENGINE"],
    ],
    nodes: [
      ["src", "Main.java", 80, 50, 110],
      ["javac", "javac", 215, 50, 90],
      ["class", "Main.class", 350, 50, 110, "bytecode"],
      ["loader", "Class Loader", 560, 50, 190, "load → link → initialize"],
      ["method", "Method Area", 110, 168, 140, "classes, statics"],
      ["heap", "Heap", 270, 168, 130, "objects, arrays"],
      ["stack", "JVM Stacks", 430, 168, 140, "one frame per call"],
      ["pc", "PC Registers", 590, 168, 130, "next instruction"],
      ["native", "Native Stacks", 750, 168, 130, "for native code"],
      ["interp", "Interpreter", 110, 296, 130, "runs bytecode"],
      ["jit", "JIT Compiler", 270, 296, 140, "hot code → native"],
      ["gc", "Garbage Collector", 435, 296, 160, "frees heap"],
      ["jni", "JNI", 570, 296, 90, "native bridge"],
      ["lib", "Native Libraries", 750, 296, 150, ".dll / .so"],
    ],
    edges: [["src", "javac"], ["javac", "class"], ["class", "loader"], ["loader", "method", "", { bend: true }], ["interp", "jit", "hot"], ["gc", "heap", "", { dashed: true }], ["jni", "lib"]],
    steps: [
      { on: ["src", "javac", "class"], edges: ["src>javac", "javac>class"], token: "class", note: "javac compiles source into bytecode (.class). Everything below happens inside the JVM started by `java`." },
      { on: ["loader"], edges: ["class>loader"], token: "loader", note: "Class Loader subsystem: LOAD (Bootstrap → Platform → Application loaders, parent first), LINK (verify, prepare statics with defaults, resolve), INITIALIZE (run static blocks)." },
      { on: ["method"], edges: ["loader>method"], token: "method", note: "Method Area (Metaspace since Java 8): per-class data such as the runtime constant pool, field and method info, bytecode and static variables. Shared by all threads." },
      { on: ["heap"], token: "heap", note: "Heap: every object and array created with `new`. Shared by all threads, managed by the garbage collector, sized with -Xms / -Xmx." },
      { on: ["stack", "pc"], token: "stack", note: "Per THREAD: a JVM stack of frames (local variables, operand stack) for each method call, and a PC register holding the current instruction. Deep recursion → StackOverflowError." },
      { on: ["native"], token: "native", note: "Native method stacks serve methods written in C/C++." },
      { on: ["interp"], token: "interp", note: "Execution engine: the interpreter executes bytecode one instruction at a time. Starts fast, runs slowly." },
      { on: ["interp", "jit"], edges: ["interp>jit"], token: "jit", note: "The JIT (C1/C2 in HotSpot) compiles frequently-run ('hot') methods to native machine code and inlines calls, so long-running Java is fast." },
      { on: ["gc", "heap"], edges: ["gc>heap"], token: "gc", note: "The garbage collector finds objects no longer reachable from GC roots and reclaims their heap memory." },
      { on: ["jni", "lib"], edges: ["jni>lib"], token: "lib", note: "JNI (Java Native Interface) lets Java call native libraries and lets native code call back into Java." },
    ],
  },
  lifecycle: {
    title: "Thread life cycle: the six Thread.State values",
    width: 700,
    height: 270,
    nodes: [
      ["new", "NEW", 90, 55, 110, "created"],
      ["runnable", "RUNNABLE", 350, 55, 170, "ready ⇄ running"],
      ["terminated", "TERMINATED", 610, 55, 140, "run() finished"],
      ["timed", "TIMED_WAITING", 110, 205, 170, "sleep / wait(ms)"],
      ["blocked", "BLOCKED", 350, 205, 140, "waiting for lock"],
      ["waiting", "WAITING", 590, 205, 150, "wait() / join()"],
    ],
    edges: [
      ["new", "runnable", "start()"],
      ["runnable", "terminated", "run() returns"],
      ["runnable", "timed", "sleep(ms)", { off: -9 }],
      ["timed", "runnable", "time up", { off: -9 }],
      ["runnable", "blocked", "lock busy", { off: -9 }],
      ["blocked", "runnable", "lock acquired", { off: -9 }],
      ["runnable", "waiting", "wait()", { off: -9 }],
      ["waiting", "runnable", "notify()", { off: -9 }],
    ],
    steps: [
      { on: ["new"], token: "new", note: "`Thread t = new Thread(task);` The thread object exists but no OS thread runs yet: state NEW." },
      { on: ["runnable"], edges: ["new>runnable"], token: "runnable", note: "`t.start()` → RUNNABLE. The scheduler switches it between ready and running; Java reports both as RUNNABLE. Calling start() twice throws IllegalThreadStateException." },
      { on: ["timed"], edges: ["runnable>timed"], token: "timed", note: "`Thread.sleep(100)`, `wait(ms)` or `join(ms)` → TIMED_WAITING. sleep keeps any locks it holds." },
      { on: ["runnable"], edges: ["timed>runnable"], token: "runnable", note: "When the time elapses (or the thread is interrupted) it becomes RUNNABLE again." },
      { on: ["blocked"], edges: ["runnable>blocked"], token: "blocked", note: "Entering a `synchronized` block whose monitor another thread holds → BLOCKED." },
      { on: ["runnable"], edges: ["blocked>runnable"], token: "runnable", note: "The other thread releases the lock; this one acquires it and continues." },
      { on: ["waiting"], edges: ["runnable>waiting"], token: "waiting", note: "`lock.wait()` (releases the lock!), `t.join()` or `LockSupport.park()` → WAITING with no timeout." },
      { on: ["runnable"], edges: ["waiting>runnable"], token: "runnable", note: "Another thread calls `notify()` / `notifyAll()` (or the joined thread ends). It must re-acquire the lock before continuing." },
      { on: ["terminated"], edges: ["runnable>terminated"], token: "terminated", note: "run() returns or throws → TERMINATED. A terminated thread can never be restarted." },
    ],
  },
  propagation: {
    title: "Exception propagation down the call stack",
    width: 680,
    height: 330,
    nodes: [
      ["parseInt", "Integer.parseInt(\"x\")", 170, 40, 230, "throws NumberFormatException"],
      ["parse", "parse()", 170, 120, 230, "no catch"],
      ["process", "process()", 170, 200, 230, "no catch"],
      ["main", "main()", 170, 280, 230, "try { process(); }"],
      ["catch", "catch (NumberFormatException e)", 500, 280, 280, "handled here"],
      ["jvm", "Default handler", 500, 120, 230, "prints stack trace, thread dies"],
    ],
    edges: [["parseInt", "parse", "unwinds"], ["parse", "process", "unwinds"], ["process", "main", "unwinds"], ["main", "catch", "matches"], ["main", "jvm", "if no catch", { dashed: true }]],
    steps: [
      { on: ["main"], cls: { parse: "ghost", process: "ghost", parseInt: "ghost" }, token: "main", note: "main() calls process(). Each call pushes a stack frame." },
      { on: ["main", "process", "parse", "parseInt"], token: "parseInt", note: "process() → parse() → Integer.parseInt(\"x\"). Four frames are now on the stack." },
      { on: ["parseInt"], cls: { parseInt: "bad" }, token: "parseInt", note: "parseInt throws NumberFormatException. Normal execution stops at that line." },
      { on: ["parse"], cls: { parseInt: "dead", parse: "bad" }, edges: ["parseInt>parse"], token: "parse", note: "parse() has no matching catch, so its frame is popped and the exception moves to the caller (finally blocks still run)." },
      { on: ["process"], cls: { parseInt: "dead", parse: "dead", process: "bad" }, edges: ["parse>process"], token: "process", note: "process() has no handler either: popped. Unchecked exceptions propagate without any `throws`; checked ones must be declared." },
      { on: ["main", "catch"], cls: { parseInt: "dead", parse: "dead", process: "dead", catch: "ok" }, edges: ["process>main", "main>catch"], token: "catch", note: "main() has a matching catch: the exception is handled and the program continues after the try/catch." },
      { on: ["jvm"], cls: { parseInt: "dead", parse: "dead", process: "dead", jvm: "bad" }, edges: ["main>jvm"], token: "jvm", note: "If NO frame catches it, the thread's uncaught-exception handler prints the stack trace and the thread terminates." },
    ],
  },
  trycatch: {
    title: "try / catch / finally: the two possible paths",
    width: 700,
    height: 260,
    nodes: [
      ["try", "try { risky(); }", 95, 130, 160],
      ["check", "exception?", 265, 130, 110],
      ["catch", "catch (IOException e)", 430, 210, 190, "handle / log"],
      ["finally", "finally { close(); }", 600, 130, 170, "ALWAYS runs"],
      ["after", "next statement", 600, 30, 150],
    ],
    edges: [["try", "check"], ["check", "finally", "no"], ["check", "catch", "yes"], ["catch", "finally"], ["finally", "after"]],
    steps: [
      { on: ["try"], token: "try", note: "Code that may throw goes in try." },
      { on: ["check"], edges: ["try>check"], token: "check", note: "Path 1: risky() completes normally." },
      { on: ["finally"], edges: ["check>finally"], token: "finally", note: "No exception: catch is skipped and finally runs." },
      { on: ["after"], edges: ["finally>after"], token: "after", note: "Execution continues after the whole statement." },
      { on: ["try", "check"], edges: ["try>check"], cls: { check: "bad" }, token: "check", note: "Path 2: risky() throws IOException. The rest of the try block is skipped." },
      { on: ["catch"], edges: ["check>catch"], token: "catch", note: "The first catch whose type matches handles it (list subclasses before superclasses)." },
      { on: ["finally", "after"], edges: ["catch>finally", "finally>after"], token: "after", note: "finally runs on BOTH paths, even after a `return` in try or catch. Only System.exit() or a JVM crash skips it. Prefer try-with-resources for closing." },
    ],
  },
  deadlock: {
    title: "Deadlock: two threads waiting for each other forever",
    width: 640,
    height: 270,
    nodes: [
      ["t1", "Thread-1", 110, 55, 130],
      ["t2", "Thread-2", 530, 55, 130],
      ["a", "Lock A", 110, 215, 110],
      ["b", "Lock B", 530, 215, 110],
    ],
    edges: [["t1", "a", "holds"], ["t2", "b", "holds"], ["t1", "b", "waits for", { dashed: true, at: 0.28 }], ["t2", "a", "waits for", { dashed: true, at: 0.28 }]],
    steps: [
      { on: ["t1", "a"], edges: ["t1>a"], token: "a", note: "Thread-1 enters `synchronized (A)`." },
      { on: ["t2", "b"], edges: ["t1>a", "t2>b"], token: "b", note: "Meanwhile Thread-2 enters `synchronized (B)`." },
      { on: ["t1", "b"], edges: ["t1>a", "t2>b", "t1>b"], cls: { t1: "bad" }, token: "b", note: "Thread-1 now needs B, which Thread-2 holds → Thread-1 is BLOCKED." },
      { on: ["t2", "a"], edges: ["t1>a", "t2>b", "t1>b", "t2>a"], cls: { t1: "bad", t2: "bad" }, token: "a", note: "Thread-2 needs A, held by Thread-1 → BLOCKED. A cycle of waits: deadlock. Neither thread will ever continue." },
      { on: ["t1", "t2", "a", "b"], edges: ["t1>a", "t2>b"], cls: { t1: "ok", t2: "ok" }, token: "t1", note: "Fix: make every thread acquire locks in the SAME order (A then B), or use `tryLock(timeout)`. Detect with jstack or ThreadMXBean.findDeadlockedThreads()." },
    ],
  },
  failfast: {
    title: "Fail-fast iterator: modCount vs expectedModCount",
    width: 720,
    height: 250,
    nodes: [
      ["list", "ArrayList", 120, 55, 170, "modCount = 3"],
      ["iter", "Iterator", 120, 195, 170, "expectedModCount = 3"],
      ["add", "list.add(\"x\")", 380, 55, 150, "inside the loop"],
      ["next", "it.next()", 380, 195, 150, "checks the counts"],
      ["cme", "ConcurrentModificationException", 590, 195, 240],
      ["fix", "it.remove() / removeIf", 600, 55, 200, "keeps counts in sync"],
    ],
    edges: [["list", "iter", "iterator()"], ["iter", "next"], ["add", "list", "modCount++"], ["next", "cme", "3 ≠ 4"], ["fix", "add", "", { dashed: true }]],
    steps: [
      { on: ["list", "iter"], edges: ["list>iter"], token: "iter", note: "Every structural change (add/remove) increments the list's `modCount`. The iterator copies it into `expectedModCount`." },
      { on: ["iter", "next"], edges: ["iter>next"], token: "next", note: "Each `next()` first checks `modCount == expectedModCount`. 3 == 3: fine." },
      { on: ["add", "list"], edges: ["add>list"], subs: { list: "modCount = 4" }, token: "list", note: "The loop body modifies the list directly → modCount becomes 4." },
      { on: ["next", "cme"], edges: ["next>cme"], subs: { list: "modCount = 4" }, cls: { cme: "bad" }, token: "cme", note: "Next `next()`: 4 ≠ 3 → ConcurrentModificationException, even in a single thread. That is fail-FAST: stop early rather than iterate garbage." },
      { on: ["fix"], cls: { fix: "ok" }, subs: { list: "modCount = 4" }, token: "fix", note: "Fixes: remove through `it.remove()` (updates expectedModCount), use `list.removeIf(...)`, or a fail-SAFE collection like CopyOnWriteArrayList / ConcurrentHashMap that iterates a snapshot or weakly consistent view." },
    ],
  },
  // ---- Concurrency and parallelism interview visuals ----
  concpar: {
    title: "Concurrency (one core, time-sliced) vs parallelism (two cores)",
    width: 720,
    height: 250,
    groups: [
      [16, 14, 336, 222, "CONCURRENCY · 1 core"],
      [368, 14, 336, 222, "PARALLELISM · 2 cores"],
    ],
    nodes: [
      ["core", "Core 1", 184, 70, 150, "switches tasks"],
      ["ca", "Task A", 104, 185, 110, "A1 · A2 · A3"],
      ["cb", "Task B", 264, 185, 110, "B1 · B2 · B3"],
      ["p1", "Core 1", 456, 70, 120, "runs A"],
      ["p2", "Core 2", 616, 70, 120, "runs B"],
      ["pa", "Task A", 456, 185, 110, "A1 · A2 · A3"],
      ["pb", "Task B", 616, 185, 110, "B1 · B2 · B3"],
    ],
    edges: [["core", "ca", "slice"], ["core", "cb", "slice"], ["p1", "pa"], ["p2", "pb"]],
    steps: [
      { on: ["core", "ca"], edges: ["core>ca"], subs: { ca: "running A1" }, token: "ca", note: "One core runs task A's first step." },
      { on: ["core", "cb"], edges: ["core>cb"], subs: { cb: "running B1" }, token: "cb", note: "The scheduler saves A's state and switches to B: a **context switch**. Both tasks are in progress, but only one runs at any instant. That is **concurrency**." },
      { on: ["core", "ca"], edges: ["core>ca"], subs: { ca: "running A2" }, token: "ca", note: "Back to A, and so on: A1, B1, A2, B2... The program is concurrent even on a single core." },
      { on: ["p1", "p2", "pa", "pb"], edges: ["p1>pa", "p2>pb"], cls: { p1: "ok", p2: "ok" }, token: "p2", note: "With two cores the same two tasks run at the **same physical instant**, A on core 1 and B on core 2. That is **parallelism**." },
      { on: ["core", "p1", "p2"], cls: { p1: "ok", p2: "ok" }, token: "p1", note: "Concurrency is about structure (dealing with many things); parallelism is about execution (doing many things at once). Speedup needs parallelism, and Amdahl's law limits it." },
    ],
  },
  jmm: {
    title: "Java Memory Model: caches, volatile and happens-before",
    width: 720,
    height: 270,
    nodes: [
      ["t1", "Thread 1", 120, 45, 130, "writer"],
      ["t2", "Thread 2", 600, 45, 130, "reader"],
      ["c1", "Core 1 cache", 120, 140, 160, "data=0 ready=false"],
      ["c2", "Core 2 cache", 600, 140, 160, "data=0 ready=false"],
      ["mem", "Main memory", 360, 225, 220, "data=0 ready=false"],
    ],
    edges: [["t1", "c1", "write"], ["c1", "mem", "flush"], ["mem", "c2", "refresh"], ["c2", "t2", "read"]],
    steps: [
      { on: ["t1", "c1"], edges: ["t1>c1"], subs: { c1: "data=42 ready=true" }, token: "c1", note: "Thread 1 runs `data = 42; ready = true;`. With plain fields the writes may sit in core 1's cache or store buffer, and may even be reordered." },
      { on: ["t2", "c2"], edges: ["c2>t2"], cls: { c2: "bad" }, subs: { c1: "data=42 ready=true" }, token: "t2", note: "Thread 2 keeps reading its own stale copy: it may spin forever on `while (!ready)`, or see `ready` before `data`. That is a **visibility** bug." },
      { on: ["c1", "mem"], edges: ["c1>mem"], subs: { c1: "data=42 ready=true", mem: "data=42 ready=true" }, token: "mem", note: "Declare `volatile boolean ready`. The volatile write is a **release**: every earlier write (data = 42) is published with it, in order." },
      { on: ["mem", "c2"], edges: ["mem>c2"], subs: { c1: "data=42 ready=true", mem: "data=42 ready=true", c2: "data=42 ready=true" }, token: "c2", note: "Thread 2's volatile read of `ready` is an **acquire**: it cannot use a stale value, and later reads cannot move before it." },
      { on: ["t1", "t2"], edges: ["t1>c1", "c1>mem", "mem>c2", "c2>t2"], cls: { t2: "ok" }, subs: { c1: "data=42 ready=true", mem: "data=42 ready=true", c2: "data=42 ready=true" }, token: "t2", note: "The volatile write **happens-before** the read that sees it, so thread 2 is guaranteed to see data = 42. Locks, start/join and concurrent collections create the same edges." },
    ],
  },
  pool: {
    title: "ThreadPoolExecutor: core threads, then queue, then extra threads, then rejection",
    width: 720,
    height: 290,
    nodes: [
      ["task", "execute(task)", 110, 145, 150, "new task arrives"],
      ["core", "Core threads", 470, 40, 190, "corePoolSize = 1"],
      ["queue", "Work queue", 470, 110, 190, "capacity = 1"],
      ["extra", "Extra threads", 470, 180, 190, "up to max = 2"],
      ["reject", "Rejected", 470, 250, 190, "handler runs"],
    ],
    edges: [["task", "core", "1"], ["task", "queue", "2"], ["task", "extra", "3"], ["task", "reject", "4"]],
    steps: [
      { on: ["task", "core"], edges: ["task>core"], subs: { core: "thread 1 busy" }, token: "core", note: "Task 1: fewer than corePoolSize threads exist, so a **new core thread** starts for it (even if others are idle)." },
      { on: ["task", "queue"], edges: ["task>queue"], subs: { core: "thread 1 busy", queue: "1 / 1 full" }, token: "queue", note: "Task 2: the core is full, so the task is **offered to the queue**, which accepts it." },
      { on: ["task", "extra"], edges: ["task>extra"], subs: { core: "thread 1 busy", queue: "1 / 1 full", extra: "thread 2 busy" }, token: "extra", note: "Task 3: the queue is full and the pool is below max, so a **non-core thread** starts. With an unbounded queue this step never happens." },
      { on: ["task", "reject"], edges: ["task>reject"], cls: { reject: "bad" }, subs: { core: "thread 1 busy", queue: "1 / 1 full", extra: "thread 2 busy" }, token: "reject", note: "Task 4: core busy, queue full, max reached, so the **RejectedExecutionHandler** runs: Abort (throw), CallerRuns, Discard or DiscardOldest." },
      { on: ["queue", "core"], cls: { reject: "dead" }, subs: { core: "takes task 2", queue: "0 / 1" }, token: "core", note: "When a worker finishes, it takes the next task from the queue. Idle threads above the core size end after keepAliveTime." },
    ],
  },
  cas: {
    title: "Compare-and-swap: the lock-free retry loop",
    width: 700,
    height: 260,
    nodes: [
      ["read", "read value", 110, 60, 140, "expected = 5"],
      ["compute", "compute new", 350, 60, 140, "next = 6"],
      ["cas", "CAS(5, 6)", 590, 60, 140, "one CPU instruction"],
      ["retry", "retry", 350, 200, 140, "value changed"],
      ["ok", "success", 590, 200, 140, "value = 6"],
    ],
    edges: [["read", "compute"], ["compute", "cas"], ["cas", "ok", "still 5"], ["cas", "retry", "not 5"], ["retry", "read", "re-read"]],
    steps: [
      { on: ["read"], token: "read", note: "Read the current value: `prev = value.get()` returns 5." },
      { on: ["read", "compute"], edges: ["read>compute"], token: "compute", note: "Compute the new value from it with a pure function (no side effects, because it may run again)." },
      { on: ["compute", "cas", "retry"], edges: ["compute>cas", "cas>retry"], cls: { retry: "bad" }, subs: { cas: "memory now 7" }, token: "retry", note: "Another thread changed the value to 7 meanwhile, so `compareAndSet(5, 6)` writes nothing and returns false." },
      { on: ["retry", "read"], edges: ["retry>read"], subs: { read: "expected = 7", compute: "next = 8", cas: "CAS(7, 8)" }, token: "read", note: "Loop: re-read 7, compute 8. No thread ever blocked; that is what **lock-free** means." },
      { on: ["cas", "ok"], edges: ["compute>cas", "cas>ok"], cls: { ok: "ok" }, subs: { read: "expected = 7", compute: "next = 8", cas: "CAS(7, 8)", ok: "value = 8" }, token: "ok", note: "This time memory still holds 7, so the CAS succeeds. `updateAndGet`, `incrementAndGet` and ConcurrentHashMap's empty-bin insert all work this way." },
    ],
  },
  forkjoin: {
    title: "Fork/Join: split, fork, steal from the tail, join",
    width: 720,
    height: 290,
    nodes: [
      ["root", "sum[0..8)", 360, 40, 150, "worker 1"],
      ["l", "sum[0..4)", 190, 135, 140, "forked"],
      ["r", "sum[4..8)", 530, 135, 140, "computed here"],
      ["ll", "[0..2)", 110, 240, 90],
      ["lr", "[2..4)", 260, 240, 90],
      ["rl", "[4..6)", 460, 240, 90],
      ["rr", "[6..8)", 610, 240, 90],
    ],
    edges: [["root", "l", "fork()"], ["root", "r", "compute()"], ["l", "ll"], ["l", "lr"], ["r", "rl"], ["r", "rr"]],
    steps: [
      { on: ["root"], token: "root", note: "The task is above the threshold, so it splits in half instead of looping." },
      { on: ["root", "l", "r"], edges: ["root>l", "root>r"], subs: { l: "on worker 1 deque" }, token: "r", note: "`left.fork()` pushes the left half onto worker 1's deque; worker 1 itself computes the right half (never fork both)." },
      { on: ["l"], edges: ["root>l"], cls: { l: "ok" }, subs: { l: "stolen by worker 2" }, token: "l", note: "Idle worker 2 **steals from the tail** of worker 1's deque: the oldest, biggest task. Owners pop newest-first (LIFO), thieves take oldest-first." },
      { on: ["ll", "lr", "rl", "rr"], edges: ["l>ll", "l>lr", "r>rl", "r>rr"], cls: { l: "ok" }, subs: { l: "stolen by worker 2" }, token: "rr", note: "Below the threshold each leaf is summed with a plain loop, by both workers in parallel." },
      { on: ["root", "l", "r"], edges: ["root>l", "root>r"], cls: { root: "ok" }, subs: { root: "left + right" }, token: "root", note: "`left.join()` returns the stolen half's result (a waiting worker helps run other tasks instead of idling), and the halves are added." },
    ],
  },
  cfuture: {
    title: "CompletableFuture: compose, combine, recover, join once",
    width: 760,
    height: 250,
    nodes: [
      ["user", "supplyAsync", 95, 55, 150, "fetch user"],
      ["orders", "thenCompose", 290, 55, 150, "fetch orders(u)"],
      ["rate", "supplyAsync", 290, 190, 150, "fetch rate"],
      ["comb", "thenCombine", 490, 120, 150, "total × rate"],
      ["exc", "exceptionally", 670, 55, 140, "fallback"],
      ["join", "join()", 670, 190, 120, "at the edge"],
    ],
    edges: [["user", "orders"], ["orders", "comb"], ["rate", "comb"], ["comb", "exc"], ["exc", "join"]],
    steps: [
      { on: ["user", "rate"], token: "user", note: "Two independent calls start at once on your executor: the user lookup and the exchange rate." },
      { on: ["user", "orders"], edges: ["user>orders"], token: "orders", note: "`thenCompose` starts the orders call **with** the user (a dependent step), and flattens the nested future." },
      { on: ["orders", "rate", "comb"], edges: ["orders>comb", "rate>comb"], token: "comb", note: "`thenCombine` waits for **both** independent results and merges them: 40 × 0.5 = 20.0." },
      { on: ["comb", "exc"], edges: ["comb>exc"], cls: { comb: "bad", exc: "ok" }, token: "exc", note: "Had any stage thrown, every later stage would be skipped until `exceptionally` (or `handle`) replaces the failure with a fallback." },
      { on: ["exc", "join"], edges: ["comb>exc", "exc>join"], cls: { join: "ok" }, token: "join", note: "Call `join()` once, at the outer edge. No thread was blocked while the pipeline ran." },
    ],
  },
  vthreads: {
    title: "Virtual threads: mount, unmount on blocking I/O, remount",
    width: 720,
    height: 280,
    nodes: [
      ["v1", "virtual 1", 120, 45, 130, "calls the DB"],
      ["v2", "virtual 2", 360, 45, 130, "computes"],
      ["v3", "virtual 3", 600, 45, 130, "runnable"],
      ["heap", "Heap", 120, 225, 150, "parked stacks"],
      ["carrier", "Carrier thread", 420, 225, 190, "ForkJoinPool worker"],
    ],
    edges: [["v1", "carrier", "mount"], ["v1", "heap", "unmount"], ["v2", "carrier", "mount"], ["heap", "carrier", "remount"], ["v3", "carrier", "waits"]],
    steps: [
      { on: ["v1", "carrier"], edges: ["v1>carrier"], subs: { carrier: "running virtual 1" }, token: "carrier", note: "Virtual thread 1 is **mounted** on a carrier (a platform thread of the scheduler's ForkJoinPool) and runs." },
      { on: ["v1", "heap"], edges: ["v1>heap"], subs: { heap: "virtual 1 parked", carrier: "free" }, token: "heap", note: "It blocks on a socket read: the JDK saves its stack frames to the **heap** and frees the carrier. No OS thread blocks." },
      { on: ["v2", "carrier"], edges: ["v2>carrier"], subs: { heap: "virtual 1 parked", carrier: "running virtual 2" }, token: "carrier", note: "The same carrier immediately runs virtual thread 2. A few carriers (about one per core) serve thousands of virtual threads." },
      { on: ["heap", "carrier"], edges: ["heap>carrier"], cls: { heap: "ok" }, subs: { carrier: "running virtual 1" }, token: "carrier", note: "The data arrives, so virtual 1 becomes runnable and **remounts**, possibly on a different carrier, and continues where it left off." },
      { on: ["v3", "carrier"], edges: ["v3>carrier"], subs: { carrier: "running virtual 1" }, token: "v3", note: "Blocking inside native code still **pins** the carrier. Since JDK 24, `synchronized` no longer does. Limit scarce resources with a Semaphore, not a pool." },
    ],
  },
  lostwakeup: {
    title: "Lost wake-up: a signal sent before anyone waits",
    width: 720,
    height: 260,
    nodes: [
      ["prod", "Producer", 110, 60, 140, "adds data"],
      ["mon", "Monitor", 360, 60, 160, "wait set: empty"],
      ["cons", "Consumer", 610, 60, 140, "about to wait"],
      ["flag", "ready flag", 360, 200, 160, "false"],
      ["sem", "Semaphore(0)", 610, 200, 150, "permits: 0"],
    ],
    edges: [["prod", "mon", "notify()"], ["cons", "mon", "wait()", { off: 9 }], ["prod", "flag", "set"], ["cons", "flag", "check", { off: 9 }], ["prod", "sem", "release()"]],
    steps: [
      { on: ["prod", "mon"], edges: ["prod>mon"], token: "mon", note: "The producer calls `notify()` while the wait set is **empty**. A notification is an event, not state, so it is simply discarded." },
      { on: ["cons", "mon"], edges: ["cons>mon"], cls: { cons: "bad" }, subs: { mon: "consumer waiting" }, token: "cons", note: "The consumer now calls `wait()`. The signal already happened, so it sleeps forever: a **lost wake-up**." },
      { on: ["prod", "flag"], edges: ["prod>flag"], subs: { flag: "true" }, token: "flag", note: "Fix 1: make the signal **state**. The producer sets `ready = true` under the lock, then notifies." },
      { on: ["cons", "flag"], edges: ["cons>flag"], cls: { cons: "ok" }, subs: { flag: "true" }, token: "cons", note: "The consumer checks `while (!ready) wait();` under the same lock: the flag is already true, so it never waits. The loop also survives spurious wake-ups." },
      { on: ["prod", "sem", "cons"], edges: ["prod>sem"], cls: { cons: "ok" }, subs: { flag: "true", sem: "permits: 1" }, token: "sem", note: "Fix 2: use a primitive that **remembers** signals. A Semaphore permit, a CountDownLatch or `LockSupport.unpark` given early is still there when the waiter arrives." },
    ],
  },
  dining: {
    title: "Dining philosophers: from circular wait to ordered forks",
    width: 700,
    height: 300,
    nodes: [
      ["p0", "P0", 350, 35, 80],
      ["p1", "P1", 600, 120, 80],
      ["p2", "P2", 510, 265, 80],
      ["p3", "P3", 190, 265, 80],
      ["p4", "P4", 100, 120, 80],
      ["f0", "fork 0", 230, 75, 90],
      ["f1", "fork 1", 480, 75, 90],
      ["f2", "fork 2", 580, 205, 90],
      ["f3", "fork 3", 350, 270, 90],
      ["f4", "fork 4", 120, 205, 90],
    ],
    edges: [["p0", "f0"], ["p1", "f1"], ["p2", "f2"], ["p3", "f3"], ["p4", "f4"], ["p0", "f1", "", { dashed: true }], ["p4", "f0", "", { dashed: true }]],
    steps: [
      { on: ["p0", "p1", "p2", "p3", "p4"], token: "p0", note: "Five philosophers, five forks. Philosopher i needs fork i and fork i+1 (mod 5) to eat." },
      { on: ["f0", "f1", "f2", "f3", "f4"], edges: ["p0>f0", "p1>f1", "p2>f2", "p3>f3", "p4>f4"], token: "f4", note: "Everyone grabs their own fork i first. Each holds one fork and wants a second." },
      { on: ["p0", "p1", "p2", "p3", "p4"], edges: ["p0>f0", "p1>f1", "p2>f2", "p3>f3", "p4>f4", "p0>f1", "p4>f0"], cls: { p0: "bad", p1: "bad", p2: "bad", p3: "bad", p4: "bad" }, token: "p4", note: "Each waits for the fork its neighbour holds: a **circular wait**, so all five are deadlocked." },
      { on: ["p4", "f0"], edges: ["p0>f0", "p1>f1", "p2>f2", "p3>f3", "p4>f0"], cls: { p4: "ok" }, subs: {}, token: "f0", note: "Fix: always take the **lower-numbered** fork first. P4 needs forks 4 and 0, so it reaches for fork 0 first and waits holding nothing." },
      { on: ["p3", "f3", "f4"], edges: ["p0>f0", "p1>f1", "p2>f2", "p3>f3", "p4>f0"], cls: { p3: "ok", p4: "ok" }, token: "f4", note: "Fork 4 stays free, so P3 can take forks 3 and 4 and eat. The cycle can never close; a Semaphore(4) or a waiter also works." },
    ],
  },
  tokenbucket: {
    title: "Token bucket rate limiter",
    width: 720,
    height: 250,
    nodes: [
      ["req", "Requests", 100, 125, 130, "20 at once"],
      ["refill", "Refill", 360, 35, 170, "+1 token / 100 ms"],
      ["bucket", "Token bucket", 360, 125, 170, "5 / 5 tokens"],
      ["ok", "Allowed", 610, 70, 130],
      ["no", "Rejected", 610, 190, 130],
    ],
    edges: [["req", "bucket", "tryAcquire()"], ["refill", "bucket"], ["bucket", "ok", "token taken"], ["bucket", "no", "no token"]],
    steps: [
      { on: ["req", "bucket"], edges: ["req>bucket"], token: "bucket", note: "Each request calls the synchronized `tryAcquire()`: first refill by elapsed time, then try to take one token. Both steps happen under one lock." },
      { on: ["bucket", "ok"], edges: ["bucket>ok"], cls: { ok: "ok" }, subs: { bucket: "0 / 5 tokens", ok: "5 requests" }, token: "ok", note: "A full bucket allows a **burst** of 5 requests." },
      { on: ["bucket", "no"], edges: ["bucket>no"], cls: { ok: "ok", no: "bad" }, subs: { bucket: "0 / 5 tokens", ok: "5 requests", no: "15 requests" }, token: "no", note: "The other 15 find no token and are rejected (or could wait, or be queued)." },
      { on: ["refill", "bucket"], edges: ["refill>bucket"], subs: { bucket: "2.5 / 5 tokens", ok: "5 requests", no: "15 requests" }, token: "bucket", note: "250 ms later the refill adds 2.5 tokens, never more than the capacity." },
      { on: ["bucket", "ok"], edges: ["req>bucket", "bucket>ok"], cls: { ok: "ok" }, subs: { bucket: "0.5 / 5 tokens", ok: "7 requests", no: "15 requests" }, token: "ok", note: "Two more requests pass. The long-run rate equals the refill rate, and bursts are capped by the bucket size." },
    ],
  },
  msqueue: {
    title: "Michael-Scott lock-free queue: link, swing the tail, help",
    width: 720,
    height: 250,
    nodes: [
      ["head", "head", 90, 60, 100, "AtomicReference"],
      ["dummy", "dummy", 90, 170, 110],
      ["x", "node X", 280, 170, 110],
      ["a", "node A", 470, 170, 110, "thread 1"],
      ["b", "node B", 650, 170, 110, "thread 2"],
      ["tail", "tail", 470, 60, 100, "AtomicReference"],
    ],
    edges: [["head", "dummy"], ["dummy", "x"], ["x", "a"], ["a", "b"], ["tail", "x", "", { dashed: true }], ["tail", "a"]],
    steps: [
      { on: ["head", "dummy", "x"], edges: ["head>dummy", "dummy>x", "tail>x"], subs: { tail: "points to X" }, token: "x", note: "The queue is a linked list with a dummy node. `head` points at the dummy and `tail` at the last node, X." },
      { on: ["x", "a"], edges: ["head>dummy", "dummy>x", "tail>x", "x>a"], subs: { tail: "points to X" }, token: "a", note: "Thread 1 enqueues A: it sees `X.next == null` and links A with `CAS(X.next, null, A)`." },
      { on: ["tail", "a"], edges: ["head>dummy", "dummy>x", "x>a", "tail>a"], cls: { tail: "ok" }, subs: { tail: "points to A" }, token: "tail", note: "Before thread 1 moves the tail, thread 2 finds `X.next != null`: the tail is lagging. It **helps** with `CAS(tail, X, A)` instead of waiting." },
      { on: ["a", "b"], edges: ["head>dummy", "dummy>x", "x>a", "tail>a", "a>b"], subs: { tail: "points to A" }, token: "b", note: "Thread 2 retries, links B after A, and then swings the tail to B. Thread 1's own tail CAS simply fails, which is harmless." },
      { on: ["head", "x"], edges: ["head>dummy", "dummy>x", "x>a", "a>b"], subs: { head: "now X (new dummy)", tail: "points to B" }, token: "head", note: "Dequeue reads X's item and swings `head` to X with one CAS; X becomes the new dummy. No thread ever blocks: **lock-free**." },
    ],
  },
  marksweep: {
    title: "Mark and sweep: reachability from GC roots",
    width: 720,
    height: 270,
    nodes: [
      ["roots", "GC Roots", 90, 135, 130, "stack vars, statics"],
      ["a", "Order", 270, 60, 110],
      ["b", "Customer", 450, 60, 120],
      ["c", "List", 270, 210, 100],
      ["d", "Temp", 450, 210, 100],
      ["e", "Cache", 630, 60, 110],
      ["f", "Buffer", 630, 210, 110],
    ],
    edges: [["roots", "a"], ["a", "b"], ["roots", "c"], ["e", "d"], ["d", "f"], ["f", "e", "", { off: 10 }]],
    steps: [
      { on: [], token: "roots", note: "GC roots are references the JVM always knows about: local variables on thread stacks, static fields, JNI references and live threads." },
      { on: ["roots", "a", "c"], edges: ["roots>a", "roots>c"], cls: { a: "ok", c: "ok" }, token: "a", note: "MARK: starting at the roots, follow every reference and mark each object reached." },
      { on: ["a", "b", "c"], edges: ["roots>a", "roots>c", "a>b"], cls: { a: "ok", b: "ok", c: "ok" }, token: "b", note: "Customer is reachable through Order, so it is marked too." },
      { on: ["d", "e", "f"], edges: ["roots>a", "roots>c", "a>b"], cls: { a: "ok", b: "ok", c: "ok", d: "bad", e: "bad", f: "bad" }, token: "e", note: "Temp, Cache and Buffer reference each other in a cycle but nothing from a root reaches them: unmarked. Reference counting would leak them; tracing GC does not." },
      { on: ["a", "b", "c"], cls: { a: "ok", b: "ok", c: "ok", d: "dead", e: "dead", f: "dead" }, token: "roots", note: "SWEEP: unmarked objects' memory is reclaimed. Many collectors then COMPACT survivors together to avoid fragmentation." },
    ],
  },
};

function geometry(config) {
  return Object.fromEntries(config.nodes.map(([id, label, x, y, w, sub]) => [id, { id, label, x, y, w, h: sub ? 46 : 36, sub }]));
}

function boundary(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (!dx && !dy) return { x: a.x, y: a.y };
  const scale = Math.min(dx ? a.w / 2 / Math.abs(dx) : Infinity, dy ? a.h / 2 / Math.abs(dy) : Infinity);
  return { x: a.x + dx * scale, y: a.y + dy * scale };
}

function edgeShape(from, to, options = {}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const off = options.off || 0;
  const nx = (-dy / len) * off;
  const ny = (dx / len) * off;
  const a = { ...from, x: from.x + nx, y: from.y + ny };
  const b = { ...to, x: to.x + nx, y: to.y + ny };
  if (options.bend) {
    const start = { x: from.x, y: from.y + from.h / 2 };
    const end = { x: to.x + to.w / 2 - 20, y: to.y - to.h / 2 };
    return { d: `M${start.x} ${start.y} V${(start.y + end.y) / 2} H${end.x} V${end.y - 2}`, mid: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 } };
  }
  const p = boundary(a, b);
  const q = boundary(b, a);
  const at = options.at ?? 0.5;
  return { d: `M${p.x} ${p.y} L${q.x} ${q.y}`, mid: { x: p.x + (q.x - p.x) * at + nx * 1.6, y: p.y + (q.y - p.y) * at + ny * 1.6 } };
}

export function FlowVisual({ flow }) {
  const config = FLOWS[flow];
  const nodes = geometry(config);
  const marker = useSvgId("jvF");
  const stepper = useStepper(config.steps.length, 1900);
  const step = config.steps[stepper.index];
  const lit = new Set(step.on || []);
  const hot = new Set(step.edges || []);
  const token = step.token && nodes[step.token];
  return (
    <Frame kicker="FLOW DIAGRAM" title={config.title} wide={config.width > 760} controls={<Controls stepper={stepper} />} note={<Rich text={step.note} />}>
      <svg viewBox={`0 0 ${config.width} ${config.height}`} className="jvSvg jvScroll" style={{ minWidth: Math.min(config.width, 640) }} role="img" aria-label={`${config.title}. ${config.nodes.map((node) => node[1]).join(", ")}.`}>
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="jvArrowHead" />
          </marker>
        </defs>
        {(config.groups || []).map(([x, y, w, h, label]) => (
          <g key={label}>
            <rect x={x} y={y} width={w} height={h} rx={10} className="jvGroup" />
            <text x={x + 12} y={y + 15} className="jvTiny jvGroupLabel">
              {label}
            </text>
          </g>
        ))}
        {config.edges.map(([from, to, label, options = {}]) => {
          const shape = edgeShape(nodes[from], nodes[to], options);
          const on = hot.has(`${from}>${to}`);
          return (
            <g key={`${from}>${to}`} className={`jvFlowEdge ${on ? "on" : ""} ${options.dashed ? "dashed" : ""}`}>
              <path d={shape.d} markerEnd={`url(#${marker})`} />
              {label && (
                <text x={shape.mid.x} y={shape.mid.y - 5} textAnchor="middle" className="jvEdgeLabel">
                  {label}
                </text>
              )}
            </g>
          );
        })}
        {Object.values(nodes).map((node) => {
          const cls = step.cls?.[node.id] || "";
          const sub = step.subs?.[node.id] || node.sub;
          return (
            <g key={node.id} className={`jvFlowNode ${lit.has(node.id) ? "on" : ""} ${cls}`}>
              <rect x={node.x - node.w / 2} y={node.y - node.h / 2} width={node.w} height={node.h} rx={7} />
              <text x={node.x} y={node.y + (sub ? -3 : 5)} textAnchor="middle" className="jvFlowLabel">
                {node.label}
              </text>
              {sub && (
                <text x={node.x} y={node.y + 14} textAnchor="middle" className="jvFlowSub">
                  {sub}
                </text>
              )}
            </g>
          );
        })}
        {token && <circle r={7} className="jvToken" style={{ transform: `translate(${token.x + token.w / 2 - 8}px, ${token.y - token.h / 2 + 8}px)` }} />}
      </svg>
    </Frame>
  );
}

/* ---------------- JDK ⊃ JRE ⊃ JVM ---------------- */

const LAYERS = [
  { id: "jvm", note: "JVM (Java Virtual Machine): loads .class files, verifies and executes bytecode (interpreter + JIT), manages memory with the GC. It is what makes bytecode portable." },
  { id: "jre", note: "JRE (Java Runtime Environment) = JVM + the Java class libraries (java.lang, java.util, java.io, ...). Enough to RUN programs. Since Java 11 there is no separate JRE download; `jlink` builds a custom runtime." },
  { id: "jdk", note: "JDK (Java Development Kit) = JRE + development tools: javac, java, jar, javadoc, jdb, jshell, jlink, jcmd, jstack. Needed to WRITE and compile programs." },
  { id: "all", note: "JDK ⊃ JRE ⊃ JVM. Developers install a JDK; end users only need a runtime. The JVM is platform-specific while bytecode is the same everywhere." },
];

export function JdkLayersVisual() {
  const stepper = useStepper(LAYERS.length, 2200);
  const layer = LAYERS[stepper.index].id;
  const on = (id) => layer === "all" || layer === id;
  return (
    <Frame kicker="DIAGRAM" title="JDK vs JRE vs JVM" controls={<Controls stepper={stepper} />} note={<Rich text={LAYERS[stepper.index].note} />}>
      <svg viewBox="0 0 640 300" className="jvSvg" role="img" aria-label="Nested boxes: the JDK contains the JRE, which contains the JVM">
        <g className={`jvLayer l-jdk ${on("jdk") ? "on" : ""}`}>
          <rect x={10} y={10} width={620} height={280} rx={14} />
          <text x={28} y={38} className="jvLayerTitle">JDK</text>
          <text x={28} y={58} className="jvFlowSub" textAnchor="start">development tools</text>
          {["javac", "jar", "javadoc", "jdb", "jshell", "jlink"].map((tool, i) => (
            <g key={tool}>
              <rect x={30} y={76 + i * 34} width={92} height={26} rx={5} className="jvChip" />
              <text x={76} y={94 + i * 34} textAnchor="middle" className="jvSmallStrong">
                {tool}
              </text>
            </g>
          ))}
        </g>
        <g className={`jvLayer l-jre ${on("jre") ? "on" : ""}`}>
          <rect x={140} y={30} width={474} height={244} rx={12} />
          <text x={158} y={56} className="jvLayerTitle">JRE</text>
          <text x={158} y={76} className="jvFlowSub" textAnchor="start">class libraries</text>
          {["java.lang", "java.util", "java.io", "java.net", "java.time"].map((lib, i) => (
            <g key={lib}>
              <rect x={158} y={90 + i * 34} width={110} height={26} rx={5} className="jvChip" />
              <text x={213} y={108 + i * 34} textAnchor="middle" className="jvSmallStrong">
                {lib}
              </text>
            </g>
          ))}
        </g>
        <g className={`jvLayer l-jvm ${on("jvm") ? "on" : ""}`}>
          <rect x={290} y={58} width={306} height={196} rx={10} />
          <text x={308} y={84} className="jvLayerTitle">JVM</text>
          {[["Class Loader", 314, 102], ["Bytecode Verifier", 456, 102], ["Interpreter", 314, 148], ["JIT Compiler", 456, 148], ["Garbage Collector", 314, 194], ["Runtime Areas", 456, 194]].map(([part, x, y]) => (
            <g key={part}>
              <rect x={x} y={y} width={128} height={34} rx={5} className="jvChip" />
              <text x={x + 64} y={y + 22} textAnchor="middle" className="jvSmallStrong">
                {part}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </Frame>
  );
}

/* ---------------- Heap generations: objects ageing from Eden to Old ---------------- */

const REGIONS = {
  eden: [20, 60, 300, 120, "Eden"],
  s0: [330, 60, 120, 120, "Survivor S0"],
  s1: [460, 60, 120, 120, "Survivor S1"],
  old: [20, 210, 560, 80, "Old Generation (tenured)"],
  meta: [600, 60, 130, 230, "Metaspace"],
};

const HEAP_STEPS = [
  { objs: [], note: "The heap is split into a Young generation (Eden + two Survivor spaces) and an Old generation. Class metadata lives in Metaspace (native memory) since Java 8, replacing PermGen." },
  { objs: [["a", "eden"], ["b", "eden"], ["c", "eden"], ["d", "eden"], ["e", "eden"]], note: "`new` allocates in Eden, very cheaply (a pointer bump in a thread-local buffer)." },
  { objs: [["a", "eden"], ["b", "eden", 0, 1], ["c", "eden"], ["d", "eden", 0, 1], ["e", "eden", 0, 1]], note: "Most objects die young: b, d and e are no longer referenced (grey)." },
  { objs: [["a", "s0", 1], ["c", "s0", 1]], note: "Eden fills up → MINOR GC. Live objects are COPIED to the empty survivor space with age 1; Eden is wiped in one go. Cost depends on survivors, not garbage." },
  { objs: [["a", "s0", 1], ["c", "s0", 1, 1], ["f", "eden"], ["g", "eden"], ["h", "eden", 0, 1]], note: "New objects keep filling Eden. c dies, h dies." },
  { objs: [["a", "s1", 2], ["f", "s1", 1], ["g", "s1", 1]], note: "Next minor GC: survivors from Eden AND S0 are copied into S1, and ages increase. S0 and S1 swap roles every collection." },
  { objs: [["a", "old", 3], ["f", "s0", 2], ["g", "s0", 2], ["i", "eden"], ["j", "eden"]], note: "An object that survives enough collections (the tenuring threshold, up to 15) is PROMOTED to the Old generation. Shown here with a threshold of 3." },
  { objs: [["a", "old", 3], ["k", "old", 3, 1], ["m", "old", 3], ["f", "s0", 2], ["g", "s0", 2], ["i", "eden"], ["j", "eden"]], note: "When the Old generation fills, a MAJOR (old) or FULL GC collects it. These are slower and are what you tune with -Xmx, -XX:+UseG1GC and friends." },
];

export function HeapVisual() {
  const stepper = useStepper(HEAP_STEPS.length, 2100);
  const step = HEAP_STEPS[stepper.index];
  const slots = {};
  const placed = step.objs.map(([id, region, age = 0, dead = 0]) => {
    const n = (slots[region] = (slots[region] ?? -1) + 1);
    const [x, y, w] = REGIONS[region];
    const perRow = Math.max(1, Math.floor((w - 10) / 42));
    return { id, age, dead, cx: x + 28 + (n % perRow) * 42, cy: y + 50 + Math.floor(n / perRow) * 40 };
  });
  return (
    <Frame kicker="ANIMATION" title="Generational heap: Eden → Survivor → Old" controls={<Controls stepper={stepper} />} note={<Rich text={step.note} />}>
      <svg viewBox="0 0 750 305" className="jvSvg" role="img" aria-label={`Heap regions; objects: ${placed.map((o) => `${o.id} age ${o.age}${o.dead ? " (dead)" : ""}`).join(", ") || "none"}`}>
        <rect x={10} y={30} width={580} height={160} rx={10} className="jvGroup" />
        <text x={22} y={48} className="jvTiny jvGroupLabel">YOUNG GENERATION</text>
        {Object.entries(REGIONS).map(([id, [x, y, w, h, label]]) => (
          <g key={id} className={`jvRegion r-${id}`}>
            <rect x={x} y={id === "old" || id === "meta" ? y : y} width={w} height={h} rx={8} />
            <text x={x + 10} y={y + 18} className="jvSmallStrong">
              {label}
            </text>
          </g>
        ))}
        <text x={665} y={180} textAnchor="middle" className="jvTiny">class metadata,</text>
        <text x={665} y={194} textAnchor="middle" className="jvTiny">native memory</text>
        {placed.map((obj) => (
          <g key={obj.id} className={`jvObj ${obj.dead ? "dead" : ""}`} style={{ transform: `translate(${obj.cx}px, ${obj.cy}px)` }}>
            <circle r={17} />
            <text y={4} textAnchor="middle">
              {obj.id}
            </text>
            {obj.age > 0 && (
              <text y={30} textAnchor="middle" className="jvTiny">
                age {obj.age}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Frame>
  );
}
