import { lesson, section } from "../schema.js";

// Programs that start child JVMs locate the java launcher through java.home, so they do
// not depend on PATH.
export default section("garbage-collection", "JVM Memory and Garbage Collection", [
  lesson("How Garbage Collection Works: Mark and Sweep", {
    intro:
      "Java frees memory automatically: the garbage collector (GC) finds objects the program can no longer reach and reclaims their space. Understanding how it decides what is garbage explains memory leaks, pauses and tuning. This lesson covers reachability and GC roots, the mark and sweep phases, compaction and copying, and what makes an object eligible for collection.",
    topics: [
      [
        "Reachability and GC roots",
        "An object is live if it can be reached by following references from a GC root. Roots include local variables and parameters on every thread's stack, static fields of loaded classes, active threads themselves, JNI references and monitors held by synchronisation. Anything not reachable from a root is garbage, even if objects still reference each other in a cycle.",
      ],
      [
        "Mark phase",
        "The collector starts at the roots and follows every reference, marking each object it reaches as live. Marking can be done while the application is paused (stop-the-world) or mostly concurrently with it (G1, ZGC, Shenandoah), using write barriers to track changes made meanwhile.",
      ],
      [
        "Sweep (delete) phase",
        "Unmarked objects are dead and their memory is reclaimed. A pure sweep leaves holes between live objects, causing fragmentation: there may be enough total free space but no single block big enough for a large allocation.",
      ],
      [
        "Compacting and copying",
        "Mark-sweep-compact moves live objects together to remove fragmentation, so allocation becomes a simple pointer bump. Copying collectors (used for the young generation) copy live objects into an empty space and discard the whole old space at once, which is fast when most objects are dead.",
      ],
      [
        "When an object becomes eligible",
        "When the last reference is dropped: a variable set to `null`, a reference reassigned, a local variable whose method returned, an object removed from a collection, or an island of objects referencing only each other. Eligible does not mean collected immediately; the GC runs when it decides to.",
      ],
    ],
    code: String.raw`import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Node {
        Node partner;
        final byte[] payload = new byte[1024];
        final String name;
        Node(String name) { this.name = name; }
    }

    static List<Node> rootList = new ArrayList<>();        // static field: a GC root

    static boolean collected(WeakReference<?> ref) {
        for (int i = 0; i < 10 && ref.get() != null; i++) System.gc();
        return ref.get() == null;
    }

    public static void main(String[] args) {
        Node kept = new Node("kept");                          // local variable: a root
        rootList.add(new Node("in static list"));
        WeakReference<Node> keptRef = new WeakReference<>(kept);
        WeakReference<Node> listRef = new WeakReference<>(rootList.get(0));

        Node temp = new Node("temp");
        WeakReference<Node> tempRef = new WeakReference<>(temp);
        temp = null;                                           // last reference dropped

        Node a = new Node("a"), b = new Node("b");
        a.partner = b; b.partner = a;                          // a cycle
        WeakReference<Node> cycleRef = new WeakReference<>(a);
        a = null; b = null;                                    // island of isolation

        Node reassigned = new Node("first");
        WeakReference<Node> firstRef = new WeakReference<>(reassigned);
        reassigned = new Node("second");                      // first is now unreachable

        System.out.println("object with null reference collected: " + collected(tempRef));
        System.out.println("unreachable cycle collected:          " + collected(cycleRef));
        System.out.println("reassigned-away object collected:     " + collected(firstRef));
        System.out.println("object held by a local still alive:   " + !collected(keptRef) + " (" + kept.name + ")");
        System.out.println("object held by a static field alive:  " + !collected(listRef));
        System.out.println("second object alive: " + reassigned.name);
    }
}`,
    jvm: ["-XX:+UseSerialGC"],
    walk:
      "Each `WeakReference` lets the program watch an object without keeping it alive. `collected` asks for garbage collection (with the Serial collector, `System.gc()` performs a full collection) and checks whether the weak reference was cleared.\n\nThe object whose only reference was set to null, the two-object cycle with no outside references, and the object whose variable was reassigned are all collected: none is reachable from a root. The object referenced by a live local variable and the one stored in a static list stay alive, because locals and static fields are GC roots.",
    anim: [
      "Mark from roots, sweep the rest",
      [
        ["roots", "GC roots", "stack, statics"],
        ["kept", "kept", "reachable"],
        ["list", "static list item", "reachable"],
        ["cycle", "a <-> b", "unreachable cycle"],
        ["temp", "temp", "no references"],
      ],
      [
        ["roots", "kept", "mark", "Marking starts at the roots: the local variable kept leads to its object."],
        ["roots", "list", "mark", "The static field rootList leads to the node stored inside it."],
        ["cycle", "temp", "unmarked", "Nothing from a root reaches the cycle or temp, so they stay unmarked."],
        ["temp", "roots", "sweep", "The sweep reclaims every unmarked object, cycles included."],
      ],
    ],
    mistakes: [
      "Believing reference cycles leak memory in Java; tracing collectors handle them.",
      "Setting every local variable to null \"to help the GC\"; it is unnecessary once the method returns.",
      "Keeping objects in static collections forever, which is the most common real leak.",
    ],
    qa: [
      ["How does garbage collection work in Java?", "It marks every object reachable from GC roots and reclaims the rest, often compacting or copying live objects to avoid fragmentation."],
      ["What are GC roots?", "Starting points for reachability: thread stacks (locals, parameters), static fields, active threads, JNI references and monitors."],
      ["Can objects in a reference cycle be garbage collected?", "Yes, if no GC root can reach the cycle."],
      ["When is an object eligible for garbage collection?", "When it is no longer reachable from any GC root."],
    ],
    ex: [
      "After `List<Node> list = new ArrayList<>(); list.add(new Node(\"x\")); list.clear();`, is the node eligible for GC? What if instead `list = null` while another variable still refers to the list?",
      "After `clear()` the node is unreachable and eligible. If another variable still refers to the list, setting `list = null` does not help: the list and the node stay reachable through the other variable.",
    ],
  }),

  lesson("finalize() and Why It Is Protected", {
    intro:
      "`Object.finalize()` was Java's original hook for cleaning up before an object is garbage collected. It turned out to be slow, unpredictable and dangerous, and is deprecated for removal. This lesson explains how finalize worked, why it is `protected`, its problems, and the modern replacements: try-with-resources and `java.lang.ref.Cleaner`.",
    topics: [
      [
        "How finalize() works",
        "If a class overrides `finalize()`, the JVM registers each instance when it is created. When the GC finds such an object unreachable, it does not free it immediately; it queues it for a finalizer thread, which calls `finalize()` once. The memory is reclaimed only in a later GC cycle. Exceptions thrown by `finalize` are ignored.",
      ],
      [
        "Why finalize() is protected",
        "It is `protected` so that only the JVM's finalization mechanism and subclasses (calling `super.finalize()`) invoke it; arbitrary outside code should never call cleanup on someone else's object. If it were public, any caller could trigger cleanup while the object was still in use. Subclasses may widen it to public, but should not.",
      ],
      [
        "Problems with finalize",
        "No guarantee when or whether it runs (the JVM may exit first). It delays reclamation and slows allocation. An object can resurrect itself by storing `this` somewhere. The finalizer thread can fall behind and cause OutOfMemoryError. It runs on an unknown thread. Since Java 9 it is deprecated, and Java 18 (JEP 421) deprecated it for removal and added `--finalization=disabled`.",
      ],
      [
        "Modern alternatives",
        "Implement `AutoCloseable` and use try-with-resources for deterministic cleanup. For a safety net when callers forget to close, register a cleaning action with `java.lang.ref.Cleaner`; the action must not reference the object itself.",
      ],
    ],
    code: String.raw`import java.lang.ref.Cleaner;

public class Main {
    static final Cleaner CLEANER = Cleaner.create();

    @SuppressWarnings({"deprecation", "removal"})
    static class LegacyResource {
        @Override protected void finalize() {                   // protected, called by the JVM
            System.out.println("  finalize() ran on thread: " + Thread.currentThread().getName());
        }
    }

    static class ModernResource implements AutoCloseable {
        private static class State implements Runnable {      // must not reference ModernResource
            final String name;
            State(String name) { this.name = name; }
            public void run() { System.out.println("  cleaning action for " + name); }
        }
        private final Cleaner.Cleanable cleanable;
        ModernResource(String name) { cleanable = CLEANER.register(this, new State(name)); }
        @Override public void close() { cleanable.clean(); }   // runs the action at most once
    }

    public static void main(String[] args) throws Exception {
        System.out.println("1. try-with-resources: deterministic");
        try (ModernResource r = new ModernResource("file-1")) {
            System.out.println("  using file-1");
        }

        System.out.println("2. Cleaner as a safety net when close() is forgotten");
        new ModernResource("file-2");                           // never closed, becomes garbage
        for (int i = 0; i < 5; i++) { System.gc(); Thread.sleep(50); }

        System.out.println("3. finalize(): deprecated and unpredictable");
        new LegacyResource();
        for (int i = 0; i < 5; i++) { System.gc(); Thread.sleep(50); }

        System.out.println("finalize is protected: "
                + java.lang.reflect.Modifier.isProtected(Object.class.getDeclaredMethod("finalize").getModifiers()));
    }
}`,
    jvm: ["-XX:+UseSerialGC"],
    varies: true,
    walk:
      "The try-with-resources block calls `close()` as soon as it ends, which runs the cleaning action immediately and exactly once. The second resource is never closed; after it becomes unreachable and the GC runs, the `Cleaner` thread runs its action as a safety net.\n\nThe legacy object's `finalize()` runs only after a GC, on the JVM's Finalizer thread, and only if finalization is enabled; with `--finalization=disabled` it would never run. Timing varies by run. The last line confirms `Object.finalize` is protected.",
    anim: [
      "Lifecycle of a finalizable object",
      [
        ["alive", "Reachable", "in use"],
        ["unreach", "Unreachable", "GC finds it"],
        ["queue", "Finalizer queue", "waits"],
        ["fin", "finalize()", "finalizer thread"],
        ["free", "Reclaimed", "next GC cycle"],
      ],
      [
        ["alive", "unreach", "drop ref", "The last reference is dropped; the object is now unreachable."],
        ["unreach", "queue", "GC #1", "Because it has finalize(), the first GC queues it instead of freeing it."],
        ["queue", "fin", "later", "A background Finalizer thread eventually calls finalize() once."],
        ["fin", "free", "GC #2", "Only a later GC actually frees the memory: cleanup is slow and unpredictable."],
      ],
    ],
    mistakes: [
      "Relying on finalize to close files or connections; they may stay open indefinitely.",
      "Letting a Cleaner action reference the object being cleaned, which keeps it alive forever.",
    ],
    qa: [
      ["Why is finalize() protected?", "So that only the JVM and subclasses call it; outside code should not trigger an object's cleanup while it may still be in use."],
      ["Is finalize() guaranteed to run?", "No. It might run late or never, for example if the JVM exits first or finalization is disabled."],
      ["What should you use instead of finalize?", "try-with-resources with AutoCloseable, and Cleaner as a safety net."],
      ["How many times can finalize be called for an object?", "At most once by the JVM, even if the object resurrects itself."],
    ],
    ex: [
      "Why does the `State` class in the program have to be a static nested class rather than an inner class or a lambda that uses `this`?",
      "An inner class or such a lambda would hold a reference to the `ModernResource`, keeping it reachable, so it would never become phantom-reachable and the cleaning action would never run.",
    ],
  }),

  lesson("JVM Heap Structure: Young, Old and Permanent Generation", {
    intro:
      "The HotSpot heap is divided into generations because most objects die young. New objects start in the young generation, survivors are promoted to the old generation, and class metadata lived in the permanent generation until Java 8 replaced it with Metaspace. This lesson explains each area, object ageing and promotion, and the difference between PermGen and Metaspace.",
    topics: [
      [
        "The generational hypothesis",
        "Observations of real programs show that most objects become unreachable very soon after allocation (temporary strings, iterators, request objects), while a few live for a long time (caches, configuration). Collecting the young area often and the old area rarely makes GC cheap.",
      ],
      [
        "Young generation: Eden and survivor spaces",
        "New objects are allocated in Eden (with fast thread-local allocation buffers). When Eden fills, a minor GC copies live objects into one of two survivor spaces (S0 or S1, also called from and to) and empties Eden. On each minor GC, live objects move between the survivor spaces and their age increases. By default Eden and the two survivors are sized 8:1:1 (`-XX:SurvivorRatio=8`).",
      ],
      [
        "Old (tenured) generation",
        "Objects that survive enough minor GCs (the tenuring threshold, up to 15 by `-XX:MaxTenuringThreshold`) are promoted to the old generation. Very large objects may be allocated there directly. The old generation is collected by major or full GCs, which are less frequent and more expensive.",
      ],
      [
        "Permanent generation (before Java 8)",
        "PermGen was a fixed-size area, outside the normal heap generations, holding class metadata, method bytecode, interned strings (until Java 7) and static variables. Its size was set with `-XX:PermSize` and `-XX:MaxPermSize`, and applications that loaded many classes (or redeployed in app servers) hit `OutOfMemoryError: PermGen space`.",
      ],
      [
        "Metaspace (Java 8 and later)",
        "Java 8 removed PermGen. Class metadata now lives in Metaspace, which uses native memory and grows automatically, limited by `-XX:MaxMetaspaceSize` (unlimited by default). Interned strings and static field values moved to the regular heap. G1 (the default since Java 9) still has young and old generations, but as sets of equal-sized regions rather than contiguous spaces.",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;
import java.lang.management.MemoryType;

public class Main {
    public static void main(String[] args) {
        System.out.println("Memory pools with the Serial collector:");
        ManagementFactory.getMemoryPoolMXBeans().stream()
                .sorted(java.util.Comparator.comparing((MemoryPoolMXBean p) -> p.getType()).thenComparing(MemoryPoolMXBean::getName))
                .forEach(pool -> System.out.println("  " + (pool.getType() == MemoryType.HEAP ? "heap    " : "non-heap")
                        + "  " + pool.getName()));

        boolean hasPermGen = ManagementFactory.getMemoryPoolMXBeans().stream()
                .anyMatch(p -> p.getName().contains("Perm"));
        System.out.println("PermGen present: " + hasPermGen + " (removed in Java 8; Metaspace replaced it)");

        // Short-lived objects die in Eden; one long-lived object survives
        byte[] longLived = new byte[1024 * 1024];
        for (int i = 0; i < 200; i++) {
            byte[] shortLived = new byte[64 * 1024];   // garbage after each iteration
            shortLived[0] = 1;
        }
        System.out.println("long-lived array still reachable: " + (longLived.length == 1024 * 1024));
    }
}`,
    jvm: ["-XX:+UseSerialGC", "-Xmx64m"],
    walk:
      "With the Serial collector, the JVM exposes its memory pools through `MemoryPoolMXBean`. The heap pools are the young generation's Eden Space and Survivor Space and the old generation's Tenured Gen. The non-heap pools include Metaspace and Compressed Class Space (class metadata) and the code cache segments where JIT-compiled code lives.\n\nNo pool contains \"Perm\": PermGen no longer exists. The loop then allocates many short-lived arrays, which die in Eden, while one long-lived array stays reachable and would be promoted to the old generation if it survived enough collections.",
    anim: [
      "Object ageing and promotion",
      [
        ["eden", "Eden", "new objects"],
        ["s0", "Survivor S0", "age 1"],
        ["s1", "Survivor S1", "age 2+"],
        ["old", "Old / Tenured", "long-lived"],
        ["meta", "Metaspace", "class metadata"],
      ],
      [
        ["eden", "s0", "minor GC", "Eden fills up; a minor GC copies the few live objects to a survivor space."],
        ["s0", "s1", "minor GC", "On the next minor GC, live objects move to the other survivor and age by 1."],
        ["s1", "old", "promote", "After surviving enough GCs (the tenuring threshold), objects are promoted."],
        ["meta", "old", "separate", "Class metadata lives in native Metaspace, outside the generational heap."],
      ],
    ],
    mistakes: [
      "Still passing `-XX:MaxPermSize` to Java 8 and later; it is ignored (with a warning) or rejected.",
      "Making the young generation too small, which promotes short-lived objects and fills the old generation.",
    ],
    qa: [
      ["What are the generations of the JVM heap?", "Young generation (Eden and two survivor spaces) and old (tenured) generation; class metadata was in PermGen before Java 8 and is in Metaspace since."],
      ["What is the difference between PermGen and Metaspace?", "PermGen was a fixed-size area managed by the JVM; Metaspace uses native memory and grows automatically, limited only by MaxMetaspaceSize."],
      ["Why are there two survivor spaces?", "So a copying collector always has one empty survivor to copy live objects into; the other is emptied entirely."],
    ],
    ex: [
      "Run the program with `-XX:+UseG1GC` instead. Which pool names change?",
      "The heap pools become G1 Eden Space, G1 Survivor Space and G1 Old Gen; Metaspace, Compressed Class Space and the code cache pools remain.",
    ],
  }),

  lesson("Minor, Major and Full GC", {
    intro:
      "Not all garbage collections are equal. A minor GC cleans only the young generation and is quick; a major GC cleans the old generation; a full GC cleans the whole heap and often Metaspace too, usually with a long pause. This lesson defines each, what triggers it, how long it takes and how to observe them.",
    topics: [
      [
        "Minor GC",
        "Collects the young generation (Eden and survivors) when Eden is full. Because most young objects are dead, it copies only the few live ones and is fast, usually milliseconds. It is a stop-the-world pause in most collectors, but short. Frequent minor GCs are normal.",
      ],
      [
        "Major GC",
        "Collects the old generation. It is triggered when the old generation fills up (often because of promotions from minor GCs). It takes much longer because the old generation is large and full of live objects. In CMS and G1, much of the old-generation work is concurrent.",
      ],
      [
        "Full GC",
        "Collects the entire heap (young and old) and may also unload classes from Metaspace. Triggers: old generation full and concurrent collection could not keep up (\"concurrent mode failure\" or \"to-space exhausted\"), Metaspace limit reached, explicit `System.gc()`, or a heap dump. Full GCs are the long pauses you want to avoid.",
      ],
      [
        "Observing GC events",
        "Run with `-Xlog:gc` (Java 9+) or `-verbose:gc` to log each event with its type, sizes and pause time, or read counts and times from `GarbageCollectorMXBean`. Tools such as GCeasy or GCViewer visualise logs.",
      ],
    ],
    code: String.raw`import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static GarbageCollectorMXBean young, old;

    static String counts() { return "young=" + young.getCollectionCount() + " old=" + old.getCollectionCount(); }

    public static void main(String[] args) {
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            if (gc.getName().equals("Copy")) young = gc;                 // Serial young collector
            if (gc.getName().equals("MarkSweepCompact")) old = gc;      // Serial old collector
        }
        System.out.println("collectors: " + young.getName() + " (young), " + old.getName() + " (old)");
        long youngStart = young.getCollectionCount(), oldStart = old.getCollectionCount();

        for (int i = 0; i < 20_000; i++) {
            byte[] garbage = new byte[10 * 1024];       // short-lived: dies young
            garbage[0] = (byte) i;
        }
        System.out.println("after short-lived garbage: minor GCs happened = " + (young.getCollectionCount() > youngStart)
                + ", old GCs = " + (old.getCollectionCount() - oldStart));

        List<byte[]> retained = new ArrayList<>();
        for (int i = 0; i < 40; i++) retained.add(new byte[1024 * 1024]);   // long-lived data fills old gen
        System.out.println("retained " + retained.size() + " MB of long-lived arrays");

        long beforeExplicit = old.getCollectionCount();
        System.gc();                                    // explicit request: a full GC with Serial
        System.out.println("System.gc() caused a full GC: " + (old.getCollectionCount() > beforeExplicit));
        System.out.println("total time in young GCs is short: " + (young.getCollectionTime() < 5_000) + " ms budget");
    }
}`,
    jvm: ["-XX:+UseSerialGC", "-Xms64m", "-Xmx64m", "-Xmn16m"],
    walk:
      "The program finds the Serial collector's two `GarbageCollectorMXBean`s: `Copy` for the young generation and `MarkSweepCompact` for the old. Allocating 200 MB of short-lived 10 KB arrays in a 16 MB young generation forces many minor GCs, while the old-generation count does not rise because nothing survives.\n\nKeeping 40 MB of arrays alive fills the old generation, and an explicit `System.gc()` triggers a full collection, which the old collector's count confirms. Run it with `-Xlog:gc` to see each pause logged.",
    anim: [
      "Which GC cleans what",
      [
        ["eden", "Young gen", "Eden + survivors"],
        ["minor", "Minor GC", "fast, frequent"],
        ["old", "Old gen", "tenured"],
        ["major", "Major GC", "old only"],
        ["full", "Full GC", "everything"],
      ],
      [
        ["eden", "minor", "Eden full", "When Eden fills, a minor GC collects only the young generation."],
        ["minor", "old", "promote", "Objects that keep surviving are promoted into the old generation."],
        ["old", "major", "old full", "When the old generation fills, a major collection cleans it."],
        ["full", "eden", "whole heap", "A full GC (for example from System.gc()) collects young and old together."],
      ],
    ],
    mistakes: [
      "Treating every GC log line as a problem; frequent short minor GCs are healthy.",
      "Calling `System.gc()` in application code, which can trigger an expensive full GC.",
    ],
    qa: [
      ["What is the difference between minor, major and full GC?", "Minor GC cleans the young generation, major GC cleans the old generation, and full GC cleans the whole heap (and often Metaspace)."],
      ["What triggers a minor GC?", "Eden running out of space for new allocations."],
      ["What causes a full GC?", "A full old generation that concurrent collection cannot handle, Metaspace exhaustion, explicit System.gc(), heap dumps, or promotion failures."],
    ],
    ex: [
      "Run the program with `-Xlog:gc` and identify a young pause and the full pause from `System.gc()`. Which is longer?",
      "Lines with \"Pause Young\" are the minor GCs; the line with \"Pause Full (System.gc())\" is the full GC, and it takes clearly longer because it marks and compacts the whole heap.",
    ],
  }),

  lesson("Garbage Collector Types: Serial, Parallel, CMS, G1, ZGC and Shenandoah", {
    intro:
      "HotSpot ships several garbage collectors with different trade-offs between throughput (how much CPU goes to your code), pause time and memory overhead. Knowing which collector does what, and their internal names (PS Scavenge, ParNew and so on), is essential for tuning and for interviews. This lesson covers Serial, Parallel (Throughput), CMS, ParNew, G1, ZGC and Shenandoah.",
    topics: [
      [
        "Serial collector (-XX:+UseSerialGC)",
        "Single-threaded for both generations: copying for the young generation (internal name `Copy`) and mark-sweep-compact for the old (`MarkSweepCompact`). Every collection stops the world. It has the lowest overhead and suits small heaps, single-CPU machines and small containers.",
      ],
      [
        "Parallel / Throughput collector (-XX:+UseParallelGC)",
        "Uses many threads for young and old collections, still stop-the-world, to maximise throughput. Its MXBean names are `PS Scavenge` (young, Parallel Scavenge) and `PS MarkSweep` (old). It was the default up to Java 8 and is good for batch jobs where pauses do not matter.",
      ],
      [
        "CMS and ParNew",
        "Concurrent Mark Sweep (`-XX:+UseConcMarkSweepGC`) collected the old generation mostly concurrently with the application, reducing pauses, but did not compact (fragmentation) and could fall back to a full GC on \"concurrent mode failure\". It was paired with ParNew, a parallel young collector. CMS was deprecated in Java 9 and removed in Java 14.",
      ],
      [
        "G1 (Garbage-First) (-XX:+UseG1GC)",
        "The default since Java 9. Divides the heap into equal regions (1 to 32 MB) that act as Eden, survivor, old or humongous regions. It collects the regions with the most garbage first, aims for a pause-time goal (`-XX:MaxGCPauseMillis=200` by default), marks concurrently and compacts incrementally. MXBean names: `G1 Young Generation`, `G1 Old Generation` and `G1 Concurrent GC`.",
      ],
      [
        "ZGC and Shenandoah",
        "Low-latency collectors that do almost all work concurrently, including relocation, keeping pauses typically under a millisecond regardless of heap size (up to terabytes). ZGC (`-XX:+UseZGC`, production since Java 15, generational since 21) and Shenandoah (`-XX:+UseShenandoahGC`) use more CPU and memory overhead in exchange. Epsilon (`-XX:+UseEpsilonGC`) is a no-op collector for testing.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    static class Probe {   // runs inside each child JVM
        public static void main(String[] a) {
            System.out.println(ManagementFactory.getGarbageCollectorMXBeans().stream()
                    .map(GarbageCollectorMXBean::getName).collect(Collectors.joining(", ")));
        }
    }

    public static void main(String[] args) throws Exception {
        String java = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
        String cp = System.getProperty("java.class.path");
        List<String[]> collectors = List.of(
                new String[] {"Serial", "-XX:+UseSerialGC"},
                new String[] {"Parallel", "-XX:+UseParallelGC"},
                new String[] {"G1 (default)", "-XX:+UseG1GC"},
                new String[] {"ZGC", "-XX:+UseZGC"});
        for (String[] c : collectors) {
            Process p = new ProcessBuilder(java, c[1], "-cp", cp, "Main$Probe").redirectErrorStream(true).start();
            String out = new String(p.getInputStream().readAllBytes()).trim();
            p.waitFor();
            System.out.printf("%-13s %-20s -> %s%n", c[0], c[1], out);
        }
        Process cms = new ProcessBuilder(java, "-XX:+UseConcMarkSweepGC", "-version").redirectErrorStream(true).start();
        String cmsOut = new String(cms.getInputStream().readAllBytes());
        cms.waitFor();
        System.out.println("CMS on this JDK: " + (cmsOut.contains("Unrecognized") || cmsOut.contains("ignoring")
                ? "removed (gone since Java 14)" : "available"));
    }
}`,
    walk:
      "The nested `Probe` class prints the names of the garbage collector MXBeans of whatever JVM it runs in. `main` launches it four times in child JVMs, each with a different collector flag, and prints the internal names: `Copy`/`MarkSweepCompact` for Serial, `PS Scavenge`/`PS MarkSweep` for Parallel, the three G1 beans, and ZGC's cycle and pause beans.\n\nFinally it starts a JVM with the CMS flag; on a modern JDK the launcher reports the option as unrecognised, because CMS was removed in Java 14.",
    anim: [
      "Picking a collector",
      [
        ["need", "Your priority", "workload"],
        ["serial", "Serial", "small heap"],
        ["par", "Parallel", "throughput"],
        ["g1", "G1", "balanced default"],
        ["zgc", "ZGC/Shenandoah", "lowest pauses"],
      ],
      [
        ["need", "serial", "tiny", "Tiny heaps or one CPU: Serial has the least overhead."],
        ["need", "par", "batch", "Batch jobs that care about total throughput, not pauses: Parallel."],
        ["need", "g1", "general", "Most services: G1 balances throughput and predictable pause goals."],
        ["need", "zgc", "latency", "Huge heaps with strict latency needs: ZGC or Shenandoah, sub-millisecond pauses."],
      ],
    ],
    mistakes: [
      "Copying CMS tuning flags into modern JVM configurations; they no longer exist.",
      "Choosing ZGC for small batch jobs where Parallel would finish faster.",
    ],
    qa: [
      ["What are the main garbage collectors in HotSpot?", "Serial, Parallel (Throughput), CMS (removed in 14), G1 (default since 9), ZGC and Shenandoah, plus the no-op Epsilon."],
      ["What are PS Scavenge and PS MarkSweep?", "The MXBean names of the Parallel collector's young (Parallel Scavenge) and old (parallel mark-sweep-compact) collectors."],
      ["What is ParNew?", "A multi-threaded young-generation collector used together with CMS; removed along with CMS."],
      ["How does G1 differ from Parallel GC?", "G1 splits the heap into regions, collects the most garbage-filled ones first, works partly concurrently and targets a pause time; Parallel collects whole generations in stop-the-world pauses for maximum throughput."],
    ],
    ex: [
      "Add Shenandoah (`-XX:+UseShenandoahGC`) to the list. What output do you expect on your JDK?",
      "If the JDK build includes Shenandoah (most OpenJDK builds do), it prints Shenandoah's beans (Shenandoah Cycles and Shenandoah Pauses); otherwise the child JVM reports the option is unrecognised.",
    ],
  }),

  lesson("Serial vs Throughput GC, Default Collectors and Finding the GC in Use", {
    intro:
      "Two practical questions come up constantly: which collector is my JVM using, and what is the default for a given Java version? This lesson compares the Serial and Throughput (Parallel) collectors, lists the defaults for Java 7, 8 and 9+, and shows how to find the active collector from the command line and from Java code.",
    topics: [
      [
        "Serial vs Throughput (Parallel) GC",
        "Both are stop-the-world generational collectors with the same algorithms; the difference is threads. Serial uses one thread, so it has minimal overhead and is efficient on one CPU or small heaps. Throughput uses as many threads as CPUs (`-XX:ParallelGCThreads`), so pauses are shorter on multi-core machines and total throughput is higher, at the cost of more memory and CPU during collection.",
      ],
      [
        "Default collector for Java 7, 8 and 9+",
        "Java 7 and 8 default to the Parallel (Throughput) collector on \"server-class\" machines (2+ CPUs and 2+ GB of memory) and to Serial otherwise. Java 9 and later default to G1 on server-class machines; on machines or containers with fewer than 2 CPUs or less than about 1.8 GB the JVM still picks Serial.",
      ],
      [
        "Finding the GC from the command line",
        "`java -XX:+PrintCommandLineFlags -version` prints the chosen flags, including `-XX:+UseG1GC`. `java -XX:+PrintFlagsFinal -version | findstr Use.*GC` (or `grep`) shows which `Use...GC` flag is true. For a running process: `jcmd <pid> VM.flags` or `jinfo -flags <pid>`.",
      ],
      [
        "Finding the GC from Java code",
        "`ManagementFactory.getGarbageCollectorMXBeans()` returns one bean per collector with names that identify it: `Copy` and `MarkSweepCompact` for Serial, `PS Scavenge` and `PS MarkSweep` for Parallel, `G1 Young Generation` and `G1 Old Generation` for G1.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static String identify(List<String> names) {
        if (names.contains("Copy")) return "Serial";
        if (names.contains("PS Scavenge")) return "Parallel (Throughput)";
        if (names.stream().anyMatch(n -> n.startsWith("G1"))) return "G1";
        if (names.stream().anyMatch(n -> n.startsWith("ZGC"))) return "ZGC";
        return "other: " + names;
    }

    public static void main(String[] args) throws Exception {
        List<String> names = new ArrayList<>();
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) names.add(gc.getName());
        System.out.println("this JVM (no GC flag given) uses: " + identify(names));

        String java = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
        Process p = new ProcessBuilder(java, "-XX:+PrintCommandLineFlags", "-version").redirectErrorStream(true).start();
        String flags = new String(p.getInputStream().readAllBytes());
        p.waitFor();
        String gcFlag = flags.contains("UseG1GC") ? "-XX:+UseG1GC" : flags.contains("UseSerialGC") ? "-XX:+UseSerialGC"
                : flags.contains("UseParallelGC") ? "-XX:+UseParallelGC" : "unknown";
        System.out.println("java -XX:+PrintCommandLineFlags -version reports: " + gcFlag);

        Process small = new ProcessBuilder(java, "-XX:ActiveProcessorCount=1", "-XX:+PrintCommandLineFlags", "-version")
                .redirectErrorStream(true).start();
        String smallFlags = new String(small.getInputStream().readAllBytes());
        small.waitFor();
        System.out.println("with only 1 CPU visible, the JVM picks: " + (smallFlags.contains("UseSerialGC") ? "Serial" : "not Serial"));
        System.out.println("CPUs available here: " + Runtime.getRuntime().availableProcessors());
    }
}`,
    varies: true,
    walk:
      "The program identifies its own collector from the MXBean names. On a multi-core machine running Java 9 or later with no GC flag, it is G1. A child JVM run with `-XX:+PrintCommandLineFlags -version` prints the flags the JVM chose, and the program extracts the GC flag from them.\n\nA second child JVM is told that only one processor is available (`-XX:ActiveProcessorCount=1`), so it no longer counts as a server-class machine and picks the Serial collector, exactly as it would in a small container.",
    anim: [
      "How the JVM picks a default collector",
      [
        ["start", "JVM start", "no GC flag"],
        ["check", "server-class?", "2+ CPUs, 2+ GB"],
        ["g1", "G1", "Java 9+ default"],
        ["par", "Parallel", "Java 7/8 default"],
        ["serial", "Serial", "small machine"],
      ],
      [
        ["start", "check", "ergonomics", "At startup, JVM ergonomics checks CPU count and memory."],
        ["check", "g1", "yes, 9+", "On a server-class machine Java 9 and later choose G1."],
        ["check", "par", "yes, 7/8", "Java 7 and 8 chose the Parallel throughput collector instead."],
        ["check", "serial", "no", "With 1 CPU or little memory, every version falls back to Serial."],
      ],
    ],
    mistakes: [
      "Assuming G1 runs in a 1-CPU container; ergonomics may choose Serial unless you set the flag.",
      "Assuming Java 8 production servers use G1 by default; they use Parallel unless configured.",
    ],
    qa: [
      ["What is the default GC in Java 8?", "The Parallel (Throughput) collector on server-class machines, Serial otherwise."],
      ["What is the default GC in Java 9 and later?", "G1 on server-class machines; Serial on small machines or containers."],
      ["How do you find which GC a JVM uses?", "`java -XX:+PrintCommandLineFlags -version`, `jcmd <pid> VM.flags`, or the names of `GarbageCollectorMXBean`s in code."],
      ["What is the difference between Serial and Throughput GC?", "Serial uses a single GC thread; Throughput (Parallel) uses multiple threads for the same stop-the-world algorithms, giving shorter pauses and higher throughput on multi-core machines."],
    ],
    ex: [
      "Run `java -XX:+PrintFlagsFinal -version` and filter for `UseSerialGC`, `UseParallelGC` and `UseG1GC`. What values do you see on a laptop with Java 21?",
      "`UseG1GC = true` and the other two `false`, because a typical laptop is server-class and Java 21 defaults to G1.",
    ],
  }),

  lesson("Important VM Parameters", {
    intro:
      "JVM options control heap sizes, generation sizes, logging and verification. A handful of them are used everywhere and appear in every interview: `-Xms`, `-Xmx`, `-Xmn`, `-XX:NewRatio`, `-XX:NewSize`, `-XX:MaxNewSize`, `-XX:PermSize`, `-XX:MaxPermSize`, `-verbose:gc` and `-Xverify`. This lesson explains each, the kinds of JVM options, and how to verify what the JVM actually applied.",
    topics: [
      [
        "Kinds of JVM options",
        "Standard options (`-cp`, `-version`, `-verbose:gc`) work on every JVM. Non-standard `-X` options (`-Xmx`, `-Xss`) are HotSpot-specific but common. Advanced `-XX` options control internals: boolean `-XX:+Flag` / `-XX:-Flag`, and valued `-XX:Name=value`. Sizes take suffixes `k`, `m` and `g`.",
      ],
      [
        "-Xms and -Xmx",
        "`-Xms` sets the initial heap size and `-Xmx` the maximum heap size. Setting them equal (for example `-Xms4g -Xmx4g`) avoids resizing pauses in servers. Without them, the JVM uses ergonomic defaults (initial about 1/64 and maximum about 1/4 of physical memory). In containers, `-XX:MaxRAMPercentage=75` is often preferred.",
      ],
      [
        "-Xmn, -XX:NewSize, -XX:MaxNewSize and -XX:NewRatio",
        "`-Xmn` sets the young generation size (both initial and maximum). `-XX:NewSize` and `-XX:MaxNewSize` set them separately. `-XX:NewRatio=n` sets old:young to n:1, so `NewRatio=2` makes the young generation one third of the heap. With G1, avoid fixing the young size because it disables G1's adaptive sizing toward its pause goal.",
      ],
      [
        "-XX:PermSize and -XX:MaxPermSize",
        "Initial and maximum size of the permanent generation in Java 7 and earlier (for example `-XX:MaxPermSize=256m` for app servers that load many classes). Java 8 removed PermGen; the equivalents are `-XX:MetaspaceSize` (the threshold for the first Metaspace-triggered GC) and `-XX:MaxMetaspaceSize`. Passing PermSize options to Java 8 printed a warning; newer JVMs refuse to start.",
      ],
      [
        "-verbose:gc and -Xverify",
        "`-verbose:gc` prints a line for every collection (equivalent to `-Xlog:gc` since Java 9; `-Xlog:gc*:file=gc.log` writes detailed logs to a file). `-Xverify` controls bytecode verification: `-Xverify:all` verifies everything, `-Xverify:remote` (default) verifies classes not loaded by the bootstrap loader, and `-Xverify:none` turns verification off to speed up startup but is unsafe and deprecated since Java 13.",
      ],
      [
        "Other everyday options",
        "`-Xss512k` (thread stack size), `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=...`, `-XX:MaxGCPauseMillis=200` for G1, `-XX:+UseStringDeduplication`, and `-XX:+PrintFlagsFinal` to list every flag with its value.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static final long MB = 1024 * 1024;

    static class Probe {
        public static void main(String[] a) {
            Runtime rt = Runtime.getRuntime();
            long young = 0;
            for (MemoryPoolMXBean p : ManagementFactory.getMemoryPoolMXBeans()) {
                String n = p.getName();
                if (n.contains("Eden") || n.contains("Survivor")) young += p.getUsage().getMax() > 0 ? p.getUsage().getMax() : p.getUsage().getCommitted();
            }
            System.out.println("max heap " + Math.round(rt.maxMemory() / (double) MB) + " MB, initial heap "
                    + Math.round(rt.totalMemory() / (double) MB) + " MB, young gen about " + Math.round(young / (double) MB) + " MB");
        }
    }

    static String run(String... options) throws Exception {
        String launcher = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
        List<String> cmd = new ArrayList<>(List.of(launcher));
        cmd.addAll(List.of(options));
        cmd.addAll(List.of("-cp", System.getProperty("java.class.path"), "Main$Probe"));
        Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
        String out = new String(p.getInputStream().readAllBytes()).trim();
        p.waitFor();
        return out.lines().filter(l -> l.startsWith("Unrecognized")).findFirst()
                .orElse(out.lines().reduce((first, second) -> second).orElse(""));
    }

    public static void main(String[] args) throws Exception {
        System.out.println("-Xms64m -Xmx256m           : " + run("-XX:+UseSerialGC", "-Xms64m", "-Xmx256m"));
        System.out.println("-Xms128m -Xmx128m -Xmn32m  : " + run("-XX:+UseSerialGC", "-Xms128m", "-Xmx128m", "-Xmn32m"));
        System.out.println("-Xmx120m -XX:NewRatio=2    : " + run("-XX:+UseSerialGC", "-Xms120m", "-Xmx120m", "-XX:NewRatio=2"));
        System.out.println("-XX:NewSize/MaxNewSize=16m : " + run("-XX:+UseSerialGC", "-Xms96m", "-Xmx96m", "-XX:NewSize=16m", "-XX:MaxNewSize=16m"));
        System.out.println("-XX:MaxPermSize=256m       : " + run("-XX:MaxPermSize=256m"));
        String verbose = run("-XX:+UseSerialGC", "-verbose:gc", "-Xmx32m");
        System.out.println("-verbose:gc                : prints GC log lines before the probe output: " + !verbose.isEmpty());
    }
}`,
    walk:
      "Each line starts a child JVM with different options and runs `Probe`, which reports the maximum heap, the initial (committed) heap and the young generation size it ended up with. `-Xms64m -Xmx256m` gives a 64 MB start and a 256 MB limit; `-Xmn32m` fixes the young generation at about 32 MB; `-XX:NewRatio=2` makes the young generation about one third of a 120 MB heap; `NewSize` and `MaxNewSize` pin it to 16 MB.\n\nThe JVM reports the max heap slightly below `-Xmx` because one survivor space is not counted. `-XX:MaxPermSize` belongs to Java 7 and earlier, so a modern JVM refuses to start and prints an \"Unrecognized VM option\" error, which the program shows.",
    anim: [
      "How heap flags carve up memory",
      [
        ["xmx", "-Xmx", "max heap"],
        ["xms", "-Xms", "initial heap"],
        ["young", "-Xmn / NewRatio", "young gen"],
        ["old", "old gen", "the rest"],
        ["meta", "MaxMetaspaceSize", "outside heap"],
      ],
      [
        ["xms", "xmx", "grows to", "The heap starts at -Xms and can grow up to -Xmx."],
        ["xmx", "young", "split", "-Xmn, NewSize or NewRatio decide how much of it is young generation."],
        ["young", "old", "remainder", "Whatever is not young generation becomes the old generation."],
        ["meta", "xmx", "separate", "Metaspace (PermGen before Java 8) is sized separately, outside -Xmx."],
      ],
    ],
    mistakes: [
      "Setting `-Xmx` larger than the container's memory limit, leading to the process being killed by the OS.",
      "Keeping `-XX:MaxPermSize` in startup scripts after upgrading from Java 7.",
      "Disabling verification with `-Xverify:none` in production.",
    ],
    qa: [
      ["What do -Xms and -Xmx mean?", "Initial and maximum Java heap size."],
      ["What does -XX:NewRatio=3 mean?", "The old generation is three times the young generation, so the young generation is a quarter of the heap."],
      ["What replaced -XX:MaxPermSize in Java 8?", "-XX:MaxMetaspaceSize, because PermGen was replaced by Metaspace."],
      ["What does -verbose:gc do?", "It prints a log line for each garbage collection (the same as -Xlog:gc in Java 9+)."],
    ],
    ex: [
      "With `-Xmx900m -XX:NewRatio=2`, roughly how big are the young and old generations?",
      "NewRatio=2 means old:young = 2:1, so young is about 300 MB and old about 600 MB.",
    ],
  }),

  lesson("Passing VM Parameters: CMD, Eclipse and Tomcat", {
    intro:
      "Knowing which VM parameter to use is half the job; the other half is passing it to the right JVM. A program started from the command line, a program run from Eclipse, Eclipse itself and an application server such as Tomcat each take options in a different place. This lesson covers all four, plus fixing Tomcat's classic OutOfMemoryError problems with heap and PermGen settings.",
    topics: [
      [
        "From the command line",
        "JVM options go before the class name or `-jar`; anything after them is a program argument: `java -Xms256m -Xmx1g -Dapp.env=prod -jar app.jar --port 8080`. The `JAVA_TOOL_OPTIONS` environment variable is picked up by every JVM, and `JDK_JAVA_OPTIONS` by the `java` launcher (Java 9+). System properties are passed with `-Dname=value` and read with `System.getProperty`.",
      ],
      [
        "In Eclipse for your program",
        "Run, Run Configurations, select the launch configuration, Arguments tab: put JVM options in \"VM arguments\" and program arguments in \"Program arguments\". Default options for every launch can be set under Window, Preferences, Java, Installed JREs, Edit, \"Default VM arguments\".",
      ],
      [
        "For Eclipse itself: eclipse.ini and -vmargs",
        "Eclipse's own memory is configured in `eclipse.ini` next to the executable. Everything after the `-vmargs` line is passed to Eclipse's JVM, one option per line: `-Xms512m`, `-Xmx2048m`. The `-vm` option (on its own line, followed by the path on the next line, placed before `-vmargs`) selects which JVM runs Eclipse.",
      ],
      [
        "Passing VM arguments to Tomcat",
        "Do not edit `catalina.bat`/`catalina.sh`; create `bin/setenv.bat` (Windows) or `bin/setenv.sh` (Linux) with `set CATALINA_OPTS=-Xms512m -Xmx2g` or `export CATALINA_OPTS=...`. `CATALINA_OPTS` applies only when starting the server; `JAVA_OPTS` also applies to stop and other commands. For the Windows service, use `tomcat9w.exe` (the Java tab) or `tomcat9 //US//Tomcat9 ++JvmOptions=...`. In Eclipse's Servers view, double-click the server, Open launch configuration, VM arguments.",
      ],
      [
        "Tomcat and OutOfMemoryError: heap and PermGen",
        "\"java.lang.OutOfMemoryError: Java heap space\" in Tomcat means the applications need more heap than `-Xmx` allows, or there is a leak: raise `-Xmx` in `setenv` and analyse a heap dump. \"OutOfMemoryError: PermGen space\" (Java 7 and earlier) usually appears after several redeployments, because old web-app class loaders stay referenced and their classes are never unloaded; raise `-XX:MaxPermSize` as a stopgap and fix the leak (threads or drivers registered by the app that are never stopped). On Java 8+ the same leak shows up as \"Metaspace\".",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> jvmArgs = ManagementFactory.getRuntimeMXBean().getInputArguments();
        System.out.println("JVM options this program received: " + jvmArgs);
        System.out.println("program arguments: " + List.of(args));
        System.out.println("system property app.env = " + System.getProperty("app.env", "(not set)"));
        System.out.println("max heap MB = " + Runtime.getRuntime().maxMemory() / (1024 * 1024));

        System.out.println("Where to put the same options:");
        System.out.println("  CMD     : java -Xmx128m -Dapp.env=dev Main  (options before the class name)");
        System.out.println("  Eclipse : Run Configurations > Arguments > VM arguments");
        System.out.println("  eclipse.ini (for Eclipse itself): lines after -vmargs, e.g. -Xmx2048m");
        System.out.println("  Tomcat  : bin/setenv.bat -> set CATALINA_OPTS=-Xms512m -Xmx2g");
        System.out.println("            bin/setenv.sh  -> export CATALINA_OPTS=\"-Xms512m -Xmx2g\"");
    }
}`,
    jvm: ["-Xmx128m", "-Dapp.env=dev"],
    walk:
      "`RuntimeMXBean.getInputArguments()` returns exactly the JVM options the program was started with: here `-Xmx128m` and `-Dapp.env=dev`, which the build passes before the class name. Program arguments arrive separately in `args` (none here).\n\n`System.getProperty(\"app.env\")` reads the `-D` property, and the max heap confirms `-Xmx128m` was applied (slightly less is reported because one survivor space is excluded). The rest of the output lists where the same options go in Eclipse, `eclipse.ini` and Tomcat.",
    anim: [
      "One option, four places",
      [
        ["opt", "-Xmx2g", "the option"],
        ["cmd", "java command", "before class"],
        ["ecl", "Run Config", "VM arguments"],
        ["ini", "eclipse.ini", "after -vmargs"],
        ["tom", "setenv.sh", "CATALINA_OPTS"],
      ],
      [
        ["opt", "cmd", "CLI", "On the command line, JVM options go before the class name or -jar."],
        ["opt", "ecl", "your app", "For programs launched from Eclipse, use the VM arguments box."],
        ["opt", "ini", "the IDE", "To give Eclipse itself more memory, add it after -vmargs in eclipse.ini."],
        ["opt", "tom", "server", "For Tomcat, set CATALINA_OPTS in bin/setenv so upgrades keep it."],
      ],
    ],
    mistakes: [
      "Putting JVM options after the class name, where they become program arguments.",
      "Editing `catalina.sh` directly, so changes are lost on upgrade; use `setenv`.",
      "Raising MaxPermSize repeatedly instead of fixing the class-loader leak causing redeploy OOMs.",
    ],
    qa: [
      ["How do you pass VM arguments to a Java program?", "Before the main class or -jar: `java -Xmx1g -Dkey=value -jar app.jar`."],
      ["How do you increase Eclipse's own memory?", "Edit eclipse.ini and change the -Xms/-Xmx lines after -vmargs."],
      ["How do you set heap size for Tomcat?", "Create bin/setenv.sh or setenv.bat and set CATALINA_OPTS, for example `-Xms512m -Xmx2g`."],
      ["What is the difference between CATALINA_OPTS and JAVA_OPTS?", "CATALINA_OPTS is used only when starting Tomcat; JAVA_OPTS is used by every Tomcat command, including stop."],
    ],
    ex: [
      "You run `java Main -Xmx64m`. What does the program print for JVM options and program arguments?",
      "JVM options are empty (no heap limit was applied) and program arguments are `[-Xmx64m]`, because everything after the class name is passed to `main`.",
    ],
  }),

  lesson("OutOfMemoryError: All Types Explained", {
    intro:
      "`OutOfMemoryError` is thrown when the JVM cannot allocate memory, but the message after the colon tells you which memory ran out, and each needs a different fix. This lesson explains all the common types: Java heap space, GC overhead limit exceeded, requested array size exceeds VM limit, Metaspace, PermGen space, unable to create native thread, out of swap space, compressed class space, stack_trace_with_native_method and the operating system's \"kill process or sacrifice child\".",
    topics: [
      [
        "Java heap space",
        "The heap is full of live objects and the GC cannot free enough. Causes: a memory leak (objects kept in collections, caches without limits) or simply a heap too small for the workload. Fix: take a heap dump (`-XX:+HeapDumpOnOutOfMemoryError`), find what holds the memory, fix the leak or raise `-Xmx`.",
      ],
      [
        "GC overhead limit exceeded",
        "Thrown by the Parallel collector when more than 98% of time is spent in GC while less than 2% of the heap is recovered: the program is almost out of heap and thrashing. It is an early warning of the same problem as heap space. Fix as above; `-XX:-UseGCOverheadLimit` only hides it.",
      ],
      [
        "Requested array size exceeds VM limit",
        "The program tried to allocate an array larger than the JVM supports (close to `Integer.MAX_VALUE` elements), regardless of free heap. Usually a bug in size calculation; fix the code or split the data.",
      ],
      [
        "Metaspace and PermGen space",
        "Class metadata ran out of room: too many classes loaded, typically generated proxies or class-loader leaks after redeployments. Java 8+ reports \"Metaspace\" (limit `-XX:MaxMetaspaceSize`); Java 7 and earlier reported \"PermGen space\" (limit `-XX:MaxPermSize`). \"Compressed class space\" is a sub-area of Metaspace for class pointers, limited by `-XX:CompressedClassSpaceSize` (1 GB by default).",
      ],
      [
        "Unable to create native thread",
        "The JVM asked the OS for a new thread and was refused: too many threads (OS per-user limit `ulimit -u`, container pid limits) or not enough native memory for thread stacks. Fix: use thread pools instead of unbounded thread creation, reduce `-Xss`, raise OS limits.",
      ],
      [
        "Out of swap space, stack_trace_with_native_method and kill process",
        "\"request size bytes for reason. Out of swap space?\": a native allocation failed because the OS ran out of virtual memory; reduce heap or other processes, add swap. \"stack_trace_with_native_method\": a native (JNI) method failed to allocate; the stack trace's top frame is native, so investigate native code or OS limits. \"Kill process or sacrifice child\" is not a Java message: the Linux OOM killer terminated the JVM because the whole machine ran out of memory; give the container more memory or lower `-Xmx` and native usage.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("max heap: " + Runtime.getRuntime().maxMemory() / (1024 * 1024) + " MB");

        List<byte[]> leak = new ArrayList<>();
        try {
            while (true) leak.add(new byte[1024 * 1024]);           // keep everything reachable
        } catch (OutOfMemoryError e) {
            int held = leak.size();
            leak = null;                                             // release so we can continue
            System.out.println("1) " + e.getMessage() + " after holding about " + (held > 10 ? "many" : "few") + " MB");
        }

        try {
            int[] huge = new int[Integer.MAX_VALUE];                 // beyond the VM array limit
            System.out.println(huge.length);
        } catch (OutOfMemoryError e) {
            System.out.println("2) " + e.getMessage());
        }

        try {
            long[] tooBig = new long[200_000_000];                   // 1.6 GB, more than -Xmx
            System.out.println(tooBig.length);
        } catch (OutOfMemoryError e) {
            System.out.println("3) " + e.getMessage() + " (single allocation larger than the heap)");
        }

        System.out.println("The program survived: OutOfMemoryError is an Error you can catch, but rarely should.");
    }
}`,
    jvm: ["-Xmx32m", "-XX:+UseSerialGC"],
    walk:
      "With a 32 MB heap, the first loop keeps adding 1 MB arrays to a list, so nothing can be collected; eventually the JVM throws `OutOfMemoryError: Java heap space`. Setting `leak` to null makes the arrays garbage so the program can continue.\n\nThe second allocation asks for an `int` array with `Integer.MAX_VALUE` elements, which the JVM rejects immediately with \"Requested array size exceeds VM limit\", whatever the heap size. The third asks for 1.6 GB in one array, more than the whole heap, giving \"Java heap space\" again. Catching the error is only for demonstration; real code should fix the cause.",
    anim: [
      "Reading the OutOfMemoryError message",
      [
        ["oom", "OutOfMemoryError", "message?"],
        ["heap", "Java heap space", "heap full"],
        ["meta", "Metaspace", "classes"],
        ["thread", "native thread", "OS threads"],
        ["array", "array size", "VM limit"],
      ],
      [
        ["oom", "heap", "heap", "\"Java heap space\" or GC overhead: analyse a heap dump, fix leaks or raise -Xmx."],
        ["oom", "meta", "metadata", "\"Metaspace\" or \"PermGen\": too many classes or a class-loader leak."],
        ["oom", "thread", "threads", "\"unable to create native thread\": too many threads or OS limits."],
        ["oom", "array", "array", "\"Requested array size exceeds VM limit\": a bug in a size calculation."],
      ],
    ],
    mistakes: [
      "Catching `OutOfMemoryError` and continuing as if nothing happened; the JVM may be in an inconsistent state.",
      "Raising `-Xmx` again and again for what is really a leak.",
      "Creating a new thread per request instead of using a pool.",
    ],
    qa: [
      ["What are the common types of OutOfMemoryError?", "Java heap space, GC overhead limit exceeded, requested array size exceeds VM limit, Metaspace (PermGen before Java 8), compressed class space, unable to create native thread, out of swap space, and stack_trace_with_native_method."],
      ["How do you troubleshoot 'Java heap space'?", "Enable -XX:+HeapDumpOnOutOfMemoryError, open the dump in a tool such as Eclipse MAT, find the largest retained objects and their GC roots, then fix the leak or size the heap properly."],
      ["Is OutOfMemoryError checked or unchecked?", "It is an Error (a subclass of VirtualMachineError), so it is unchecked."],
    ],
    ex: [
      "Which OutOfMemoryError would this cause: `while (true) new Thread(() -> { try { Thread.sleep(1_000_000); } catch (InterruptedException e) { } }).start();`?",
      "\"unable to create native thread\": each sleeping thread stays alive, and the process eventually hits the OS thread limit or runs out of native memory for stacks. (Do not run it on a shared machine.)",
    ],
  }),

  lesson("Error Occurred During Initialization of VM", {
    intro:
      "Sometimes the JVM does not even start and prints \"Error occurred during initialization of VM\" followed by a reason. These errors come from invalid or impossible memory settings. This lesson covers the common reasons: initial heap larger than maximum, too small initial or maximum heap, could not reserve enough space for the object heap, failure to allocate card tables, and native malloc failures, and the program reproduces several of them.",
    topics: [
      [
        "Initial heap size set to a larger value than the maximum heap size",
        "`-Xms` is greater than `-Xmx`, for example `-Xms1g -Xmx512m`. Fix the values so `-Xms <= -Xmx`, or remove `-Xms`. It often happens when one value is set in an environment variable and another in a script.",
      ],
      [
        "Too small initial heap / too small maximum heap",
        "The heap cannot be smaller than the JVM's minimum (about 1 to 2 MB, depending on the collector), so `-Xms1k` or `-Xmx1k` fails. Usually a missing unit: `-Xmx512` means 512 bytes, not megabytes.",
      ],
      [
        "Could not reserve enough space for object heap",
        "The JVM tried to reserve the virtual address range for `-Xmx` and the OS refused. Classic cause: a 32-bit JVM with `-Xmx` above about 1.5 GB (it has only a 2 to 4 GB address space). Also caused by OS or container limits on virtual memory. Fix: use a 64-bit JVM, lower `-Xmx`, or raise limits.",
      ],
      [
        "Could not allocate card tables / malloc failures",
        "Card tables are side tables the collector uses to track references from old to young objects; they need native memory proportional to the heap. If the native allocation (`malloc`) fails, the VM reports it during initialisation. Causes: very large `-Xmx` on a machine with little memory or swap, overcommit settings, or memory limits. Fix by lowering heap settings or freeing memory.",
      ],
      [
        "Diagnosing",
        "Run `java -XX:+PrintCommandLineFlags -version` with the same options and environment variables (`JAVA_TOOL_OPTIONS`, `_JAVA_OPTIONS`) to see what the JVM receives; check `java -version` for 32-bit vs 64-bit.",
      ],
    ],
    code: String.raw`import java.io.File;

public class Main {
    static String start(String... options) throws Exception {
        String java = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
        String[] cmd = new String[options.length + 2];
        cmd[0] = java;
        System.arraycopy(options, 0, cmd, 1, options.length);
        cmd[cmd.length - 1] = "-version";
        Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
        String out = new String(p.getInputStream().readAllBytes());
        int exit = p.waitFor();
        String reason = out.lines().filter(l -> l.contains("heap") || l.contains("Error") || l.contains("Invalid"))
                .filter(l -> !l.startsWith("Error: Could not create"))
                .reduce((a, b) -> a + " | " + b).orElse("started fine");
        return "exit " + exit + ": " + (exit == 0 ? "JVM started" : reason);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("-Xms512m -Xmx64m : " + start("-Xms512m", "-Xmx64m"));
        System.out.println("-Xms1k           : " + start("-Xms1k"));
        System.out.println("-Xmx1k           : " + start("-Xmx1k"));
        System.out.println("-Xmx512 (no unit): " + start("-Xmx512"));
        System.out.println("-Xms64m -Xmx64m  : " + start("-Xms64m", "-Xmx64m"));
    }
}`,
    walk:
      "`start` launches a child JVM with the given options and `-version`, captures its output and exit code, and keeps only the lines that explain the failure.\n\n`-Xms512m -Xmx64m` fails because the initial heap is larger than the maximum. `-Xms1k` and `-Xmx1k` are below the JVM's minimum heap. `-Xmx512` without a unit means 512 bytes, so it is also too small. A valid pair of settings starts normally with exit code 0. The \"could not reserve\" and card-table errors depend on the machine's memory and address space, so they are described rather than reproduced.",
    anim: [
      "JVM startup memory checks",
      [
        ["parse", "Parse options", "-Xms -Xmx"],
        ["order", "-Xms <= -Xmx ?", "consistency"],
        ["min", "above minimum?", "a few MB"],
        ["reserve", "Reserve heap", "OS address space"],
        ["ok", "VM started", "main runs"],
      ],
      [
        ["parse", "order", "check", "First the JVM checks that the initial heap is not larger than the maximum."],
        ["order", "min", "check", "Then that both sizes are above the collector's minimum heap size."],
        ["min", "reserve", "reserve", "Then it reserves address space and native card tables from the OS."],
        ["reserve", "ok", "success", "Only if every step succeeds does the VM finish initialising and run main."],
      ],
    ],
    mistakes: [
      "Forgetting the unit suffix (`-Xmx512` instead of `-Xmx512m`).",
      "Setting `-Xmx` in `_JAVA_OPTIONS` or `JAVA_TOOL_OPTIONS` and forgetting it is applied to every JVM.",
      "Running a 32-bit JVM with a multi-gigabyte heap.",
    ],
    qa: [
      ["What causes 'Could not reserve enough space for object heap'?", "The OS cannot provide a contiguous virtual address range of size -Xmx; typically a 32-bit JVM with a large -Xmx, or OS/container limits."],
      ["What happens if -Xms is larger than -Xmx?", "The JVM fails to start: 'Initial heap size set to a larger value than the maximum heap size'."],
      ["What are card tables?", "Native side tables used by generational collectors to record which old-generation areas reference young objects, so minor GCs need not scan the whole old generation."],
    ],
    ex: [
      "A colleague's script uses `java -Xms2048 -Xmx4g -jar app.jar` and it starts, but performance is poor at startup. What is wrong?",
      "`-Xms2048` has no unit, so the initial heap is 2048 bytes (raised to the JVM's minimum), and the heap must grow repeatedly at startup. Write `-Xms2048m` or `-Xms2g`.",
    ],
  }),

  lesson("Monitoring GC and Fixing Memory Leaks", {
    intro:
      "A memory leak in Java is not memory that nobody can free; it is memory that is still reachable but no longer needed. The heap grows until the application slows down with constant GC and finally fails with OutOfMemoryError. This lesson covers ten ways to monitor GC, the command-line tools (`-verbose:gc`, `jps`, `jstat`, `jmap`, `jhat`, heap dumps on OOM) and a step-by-step method to detect and fix a leak.",
    topics: [
      [
        "Ten ways to monitor garbage collection",
        "1. `-verbose:gc` / `-Xlog:gc*` logs. 2. `jstat -gc <pid> 1000` live statistics. 3. `jcmd <pid> GC.heap_info`. 4. JConsole (Memory tab). 5. VisualVM (Monitor and Visual GC plugin). 6. Java Mission Control with Java Flight Recorder (`-XX:StartFlightRecording`). 7. `GarbageCollectorMXBean` and `MemoryMXBean` in code. 8. JMX exporters to Prometheus/Grafana or an APM tool. 9. GC log analysers such as GCeasy or GCViewer. 10. Heap dumps (`jmap`, `jcmd GC.heap_dump`, or automatically on OOM) analysed with Eclipse MAT or VisualVM.",
      ],
      [
        "jps and the vmid",
        "`jps -l` lists running Java processes with their process ids (the local vmid) and main classes or JARs. Most JDK tools take that id as their target: `jstat -gcutil 12345 1s`.",
      ],
      [
        "jstat",
        "`jstat -gcutil <vmid> <interval> <count>` prints survivor, Eden, old and Metaspace occupancy percentages plus counts and times of young (YGC), full (FGC) and concurrent GCs. An old generation (O) that keeps climbing after every full GC is the signature of a leak.",
      ],
      [
        "jmap, jhat and heap dumps on OutOfMemoryError",
        "`jmap -histo:live <pid>` prints a histogram of live objects by class; `jmap -dump:live,format=b,file=heap.hprof <pid>` writes a heap dump (`jcmd <pid> GC.heap_dump file` is the modern equivalent). `jhat heap.hprof` started a small web server to browse dumps but was removed in Java 9; use Eclipse MAT or VisualVM instead. Add `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` in production so a dump is written automatically when the leak finally fails.",
      ],
      [
        "Detecting and fixing a leak",
        "Symptoms: used heap after each full GC keeps rising, GC frequency increases, latency grows. Steps: confirm the trend with logs or jstat; take two heap dumps some time apart; compare them in MAT (dominator tree, \"Leak Suspects\") to find which objects grow; follow the path to GC roots to see who holds them (often a static collection, a cache without eviction, listeners never removed, ThreadLocals in pooled threads, or unclosed resources). Fix the reference (remove entries, bound the cache, use `WeakHashMap` or an eviction policy, deregister listeners, call `ThreadLocal.remove()`).",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    static final List<byte[]> LEAKY_CACHE = new ArrayList<>();   // grows forever

    static final Map<Integer, byte[]> BOUNDED_CACHE = new LinkedHashMap<>(16, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<Integer, byte[]> eldest) { return size() > 20; }
    };

    static long usedAfterGc(MemoryMXBean memory) {
        System.gc();
        return memory.getHeapMemoryUsage().getUsed() / (1024 * 1024);
    }

    static void handleRequest(int id, boolean leaky) {
        byte[] response = new byte[100 * 1024];                  // 100 KB per request
        if (leaky) LEAKY_CACHE.add(response);                    // never removed
        else BOUNDED_CACHE.put(id % 1000, response);             // evicts old entries
    }

    public static void main(String[] args) {
        MemoryMXBean memory = ManagementFactory.getMemoryMXBean();
        System.out.println("leaky version, used heap after GC (MB):");
        StringBuilder trend = new StringBuilder("  ");
        long first = 0, last = 0;
        for (int round = 1; round <= 5; round++) {
            for (int i = 0; i < 200; i++) handleRequest(round * 1000 + i, true);
            last = usedAfterGc(memory);
            if (round == 1) first = last;
            trend.append(last).append(round < 5 ? " -> " : "");
        }
        System.out.println(trend + "  (keeps rising: leak)");
        System.out.println("  grew by at least 60 MB: " + (last - first >= 60));

        LEAKY_CACHE.clear();                                     // the fix: release references
        long afterFix = usedAfterGc(memory);
        System.out.println("after clearing the static cache: used heap dropped: " + (afterFix < last));

        long boundedFirst = 0, boundedLast = 0;
        for (int round = 1; round <= 5; round++) {
            for (int i = 0; i < 200; i++) handleRequest(round * 1000 + i, false);
            boundedLast = usedAfterGc(memory);
            if (round == 1) boundedFirst = boundedLast;
        }
        System.out.println("bounded cache stays flat: " + (Math.abs(boundedLast - boundedFirst) <= 3) + ", entries = " + BOUNDED_CACHE.size());
        System.out.println("commands: jps -l | jstat -gcutil <pid> 1s | jmap -histo:live <pid> | jcmd <pid> GC.heap_dump heap.hprof");
    }
}`,
    jvm: ["-XX:+UseSerialGC", "-Xmx256m"],
    varies: true,
    walk:
      "`handleRequest` allocates 100 KB per request. In leaky mode every response is added to a static list that is never cleared, so after each round of 200 requests the used heap measured after a full GC grows by about 20 MB: the classic leak signature of memory that survives every collection.\n\nClearing the static list removes the references from the GC root, and the next GC frees the memory. The bounded `LinkedHashMap` cache evicts its eldest entry beyond 20 items, so its memory stays flat no matter how many requests arrive. The last line lists the command-line tools you would use on a real process.",
    anim: [
      "Hunting a memory leak",
      [
        ["sym", "Heap rising", "after every GC"],
        ["stat", "jstat -gcutil", "confirm trend"],
        ["dump", "Heap dump", "jmap / on OOM"],
        ["mat", "Eclipse MAT", "dominators"],
        ["fix", "Fix the root ref", "evict / remove"],
      ],
      [
        ["sym", "stat", "watch", "Old-generation usage climbing after each full GC suggests a leak."],
        ["stat", "dump", "capture", "Take heap dumps with jmap or jcmd, or let -XX:+HeapDumpOnOutOfMemoryError do it."],
        ["dump", "mat", "analyse", "MAT's dominator tree shows which objects retain the most memory."],
        ["mat", "fix", "path to root", "The path to GC roots reveals the static cache holding them; bound it or clear it."],
      ],
    ],
    mistakes: [
      "Restarting the application regularly instead of finding the leak.",
      "Using `jmap -dump` on a huge production heap without knowing it pauses the JVM for the duration.",
      "Using `WeakHashMap` for caches whose keys are strongly held elsewhere (they then never expire).",
    ],
    qa: [
      ["What is a memory leak in Java?", "Objects that are no longer needed but stay reachable, so the GC can never reclaim them."],
      ["How do you detect a memory leak?", "Watch heap usage after full GCs (logs, jstat, VisualVM); if it keeps rising, take heap dumps and analyse retained objects and their GC roots in MAT."],
      ["What do jps, jstat and jmap do?", "jps lists Java processes and their ids; jstat prints GC and heap statistics; jmap prints object histograms and writes heap dumps."],
      ["What replaced jhat?", "jhat was removed in Java 9; use Eclipse MAT, VisualVM or JDK Mission Control to analyse heap dumps."],
    ],
    ex: [
      "A web app stores each logged-in user's session data in a `static Map<String, Session>` and removes entries on logout. Users often just close the browser. What leaks, and how would you fix it?",
      "Sessions of users who never log out stay in the static map forever. Add expiry (for example a scheduled cleanup of entries idle beyond 30 minutes, or a cache library with time-based eviction).",
    ],
  }),

  lesson("System.gc(), Static Variables and GC", {
    intro:
      "A few garbage-collection facts trip up developers and appear in interviews: whether `System.gc()` actually runs the collector and whether calling it is good practice, whether static variables are ever garbage collected, and what the old \"PermSize\" warnings meant. This lesson covers each with a program.",
    topics: [
      [
        "What System.gc() does",
        "`System.gc()` (same as `Runtime.getRuntime().gc()`) is a request, not a command. HotSpot usually performs a full, stop-the-world collection when it is called (G1 can make it concurrent with `-XX:+ExplicitGCInvokesConcurrent`), and `-XX:+DisableExplicitGC` makes it a no-op.",
      ],
      [
        "Is calling System.gc() good practice?",
        "Almost never. The JVM schedules collections far better than application code; explicit calls cause unnecessary full GCs and long pauses. Legitimate uses are rare: tests and benchmarks that need a clean baseline, or diagnostics. Libraries such as RMI's distributed GC called it periodically, which is why `-XX:+DisableExplicitGC` exists.",
      ],
      [
        "Static variables are not garbage collected",
        "A static field is a GC root as long as its class is loaded, so the object it references stays alive. Classes are unloaded only when their class loader becomes unreachable, which never happens for the application class loader in a normal program. In web servers, redeploying an app creates a new class loader; if anything still references the old one, all its classes and their static data leak (the classic PermGen or Metaspace leak).",
      ],
      [
        "The PermSize warning",
        "On Java 8, passing `-XX:PermSize` or `-XX:MaxPermSize` printed \"ignoring option MaxPermSize; support was removed in 8.0\". It was harmless but meant the setting did nothing; the equivalent is `-XX:MaxMetaspaceSize`. Since Java 17 the options are rejected with \"Unrecognized VM option\" and the JVM does not start.",
      ],
    ],
    code: String.raw`import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.ref.WeakReference;

public class Main {
    static Object staticHolder = new byte[1024];                  // referenced from a static field

    static long fullGcCount() {
        long count = 0;
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans())
            if (gc.getName().equals("MarkSweepCompact")) count += gc.getCollectionCount();
        return count;
    }

    public static void main(String[] args) {
        long before = fullGcCount();
        System.gc();
        System.out.println("System.gc() triggered a full GC here: " + (fullGcCount() > before));

        WeakReference<Object> viaStatic = new WeakReference<>(staticHolder);
        WeakReference<Object> unreferenced = new WeakReference<>(new byte[1024]);
        System.gc();
        System.out.println("object referenced by a static field collected: " + (viaStatic.get() == null));
        System.out.println("unreferenced object collected: " + (unreferenced.get() == null));

        staticHolder = null;                                     // remove the static reference
        System.gc();
        System.out.println("after setting the static field to null, collected: " + (viaStatic.get() == null));
    }
}`,
    jvm: ["-XX:+UseSerialGC"],
    walk:
      "With the Serial collector, `System.gc()` performs a full collection, which the `MarkSweepCompact` counter confirms. Run the program with `-XX:+DisableExplicitGC` and that line prints false.\n\nThe object referenced from the static field `staticHolder` survives the collection because static fields are GC roots, while an object with only a weak reference is collected. Once the static field is set to null, the same object becomes unreachable and the next collection reclaims it.",
    anim: [
      "Static fields as GC roots",
      [
        ["cls", "Main class", "loaded"],
        ["field", "staticHolder", "static field"],
        ["obj", "byte[1024]", "heap object"],
        ["gc", "System.gc()", "full GC"],
        ["null", "field = null", "reference cut"],
      ],
      [
        ["cls", "field", "owns", "While the class is loaded, its static fields are GC roots."],
        ["field", "obj", "refers", "The static field keeps the array reachable, so every GC keeps it."],
        ["null", "field", "clear", "Setting the field to null cuts the only path from a root."],
        ["gc", "obj", "reclaim", "The next collection finds the array unreachable and frees it."],
      ],
    ],
    mistakes: [
      "Sprinkling `System.gc()` calls in production code to \"free memory\".",
      "Holding large caches in static fields without any eviction.",
    ],
    qa: [
      ["Does System.gc() guarantee garbage collection?", "No. It is only a request; the JVM may ignore it, for example with -XX:+DisableExplicitGC."],
      ["Are static variables garbage collected?", "Objects referenced by static fields stay alive while the class is loaded; they become collectable only if the field is cleared or the class is unloaded with its class loader."],
      ["Is calling System.gc() a good practice?", "No. It usually forces an expensive full GC; let the JVM decide, except in tests or diagnostics."],
    ],
    ex: [
      "Run the program with `-XX:+DisableExplicitGC`. Which lines change?",
      "None of the System.gc() calls do anything, so the full GC count does not rise and the weakly referenced objects are usually not collected; the 'collected' lines print false.",
    ],
  }),

  lesson("GC and JVM Interview Questions", {
    intro:
      "This lesson gathers the garbage collection and JVM questions interviewers ask most often, from fundamentals to tuning, with concise answers. The program demonstrates the four reference strengths (strong, soft, weak and phantom), a frequent follow-up question.",
    topics: [
      [
        "Reference types",
        "Strong references (normal variables) keep objects alive. `SoftReference` objects are cleared only when memory is low (useful for memory-sensitive caches). `WeakReference` objects are cleared at the next GC once no strong references remain (used by `WeakHashMap`). `PhantomReference` objects are enqueued after the object is finalized and can never be dereferenced; they are used for post-mortem cleanup, which is how `Cleaner` works.",
      ],
      [
        "Stop-the-world, throughput and latency",
        "A stop-the-world pause halts all application threads at a safepoint while the GC works. Throughput is the percentage of time spent running application code rather than GC; latency is the pause length. Collectors trade one for the other: Parallel maximises throughput, ZGC minimises latency, G1 balances them.",
      ],
      [
        "Stack vs heap",
        "Each thread's stack holds frames with local primitives and references, is small (`-Xss`) and is freed when methods return; overflowing it throws `StackOverflowError`. The heap holds all objects, is shared by threads, is managed by the GC and overflowing it throws `OutOfMemoryError`.",
      ],
      [
        "Other common questions",
        "Escape analysis lets the JIT avoid heap allocation for objects that never leave a method. TLABs (thread-local allocation buffers) make allocation a pointer bump. String deduplication in G1 saves memory for duplicate strings. Safepoints are points where threads can be stopped safely. Humongous objects in G1 are those larger than half a region.",
      ],
    ],
    code: String.raw`import java.lang.ref.PhantomReference;
import java.lang.ref.ReferenceQueue;
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;

public class Main {
    public static void main(String[] args) throws Exception {
        Object strong = new byte[1024];
        SoftReference<Object> soft = new SoftReference<>(new byte[1024]);
        WeakReference<Object> weak = new WeakReference<>(new byte[1024]);
        ReferenceQueue<Object> queue = new ReferenceQueue<>();
        PhantomReference<Object> phantom = new PhantomReference<>(new byte[1024], queue);

        System.gc();
        Thread.sleep(100);
        System.out.println("strong reference alive:        " + (strong != null));
        System.out.println("soft reference alive (memory ok): " + (soft.get() != null));
        System.out.println("weak reference cleared:        " + (weak.get() == null));
        System.out.println("phantom get() is always null:  " + (phantom.get() == null));
        System.out.println("phantom enqueued after GC:     " + (queue.remove(1000) == phantom));

        try {
            java.util.List<byte[]> pressure = new java.util.ArrayList<>();
            while (true) pressure.add(new byte[1024 * 1024]);
        } catch (OutOfMemoryError e) {
            System.out.println("soft reference cleared before OutOfMemoryError: " + (soft.get() == null));
        }
    }
}`,
    jvm: ["-XX:+UseSerialGC", "-Xmx32m"],
    walk:
      "After a GC, the strong reference and the soft reference are still alive (memory is not low yet), the weak reference has been cleared, and the phantom reference never returns its object but is placed on its `ReferenceQueue`, which `queue.remove` confirms.\n\nThe program then fills the 32 MB heap until `OutOfMemoryError`. Before throwing it, the JVM clears all soft references to try to free memory, so the soft reference is now null.",
    anim: [
      "Reference strength",
      [
        ["strong", "Strong", "never cleared"],
        ["soft", "SoftReference", "low memory"],
        ["weak", "WeakReference", "next GC"],
        ["phantom", "PhantomRef", "after death"],
        ["gc", "GC", "decides"],
      ],
      [
        ["gc", "strong", "keeps", "Strongly reachable objects are never collected."],
        ["gc", "soft", "if needed", "Softly reachable objects are cleared only when the heap is running out."],
        ["gc", "weak", "clears", "Weakly reachable objects are cleared at the next collection."],
        ["gc", "phantom", "enqueue", "Phantom references are enqueued after the object is gone, for cleanup."],
      ],
    ],
    mistakes: [
      "Using SoftReference caches as the main caching strategy; they cause unpredictable GC behaviour under pressure.",
      "Confusing stack overflow with heap exhaustion.",
    ],
    qa: [
      ["What is the difference between soft, weak and phantom references?", "Soft: cleared when memory is low. Weak: cleared at the next GC once only weakly reachable. Phantom: never returns its referent and is enqueued after the object is collected, for cleanup."],
      ["What is a stop-the-world pause?", "A pause during which all application threads are stopped at a safepoint so the GC can work safely."],
      ["What is the difference between stack and heap memory?", "The stack is per-thread, holds frames and local variables and is freed on return; the heap is shared, holds objects and is managed by the GC."],
      ["What is a TLAB?", "A thread-local allocation buffer: a chunk of Eden reserved for one thread so it can allocate objects without synchronisation."],
      ["What is escape analysis?", "A JIT optimisation that detects objects not escaping a method or thread and can allocate them on the stack, replace them with scalars, or remove locks on them."],
      ["Which GC would you choose for a low-latency trading app with a 64 GB heap?", "ZGC or Shenandoah, whose pauses stay in the sub-millisecond range regardless of heap size."],
    ],
    ex: [
      "Explain why `WeakHashMap<Key, Value>` entries disappear when the key is no longer used elsewhere, but not when the value refers back to the key.",
      "WeakHashMap holds its keys weakly, so an entry is removed once the key is only weakly reachable. If the value strongly references the key, the map's strong reference to the value keeps the key strongly reachable, so the entry never expires.",
    ],
  }),
]);
