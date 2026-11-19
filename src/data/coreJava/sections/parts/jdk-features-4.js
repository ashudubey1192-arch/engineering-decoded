import { lesson } from "../../schema.js";

export default [
  lesson("Java 21 (2023, LTS): Virtual Threads, Pattern Matching for switch, Record Patterns and Sequenced Collections", {
    intro:
      "Java 21 (September 2023) is an LTS release and one of the most significant in Java's history. Its final features are:\n\n- **virtual threads** (JEP 444)\n- **pattern matching for switch** (JEP 441)\n- **record patterns** (JEP 440)\n- **sequenced collections** (JEP 431)\n- **generational ZGC** (JEP 439)\n- the **Key Encapsulation Mechanism API** (JEP 452)\n\nIt also previewed string templates (later withdrawn), unnamed patterns and variables, unnamed classes with instance main methods, scoped values, and structured concurrency. It began restricting the dynamic loading of agents. The program shows every final feature.",
    topics: [
      [
        "Virtual threads (JEP 444)",
        "Virtual threads are lightweight `java.lang.Thread` instances scheduled by the JVM onto a small pool of carrier threads. They make the thread-per-request style scale to millions of concurrent blocking tasks, with no async code. You create them with `Thread.ofVirtual()`, `Thread.startVirtualThread()` or `Executors.newVirtualThreadPerTaskExecutor()`. Don't pool them. In 21, blocking inside `synchronized` pins the carrier; Java 24 fixed that. The interview questions Q77 to Q88 cover them in depth.",
      ],
      [
        "Pattern matching for switch (JEP 441)",
        "A switch can match **type patterns** with bindings (`case String s`), **guards** (`case Integer i when i > 0`), **`case null`**, and **qualified enum constants**. It checks **dominance**: a more general case before a more specific one is an error. It requires **exhaustiveness** for pattern switches, and sealed hierarchies satisfy that without a default. It works with both switch statements and switch expressions, and replaces if-else instanceof chains.",
      ],
      [
        "Record patterns (JEP 440)",
        "Record patterns deconstruct records directly in `instanceof` and `case` labels: `case Line(Point(var x1, var y1), Point(var x2, var y2)) -> ...`. They nest to any depth, infer generic type arguments, and combine with sealed types for exhaustive, data-oriented code. The previewed record patterns in enhanced for loops were dropped.",
      ],
      [
        "Sequenced collections (JEP 431)",
        "New interfaces give a uniform API for collections with an encounter order:\n\n- **SequencedCollection**: `getFirst`, `getLast`, `addFirst`, `addLast`, `removeFirst`, `removeLast` and `reversed()`\n- **SequencedSet**\n- **SequencedMap**: `firstEntry`, `lastEntry`, `pollFirstEntry`, `putFirst`, `putLast`, `sequencedKeySet` and `reversed()`\n\nList, Deque, LinkedHashSet, SortedSet, LinkedHashMap and SortedMap were retrofitted. `Collections.unmodifiableSequencedCollection` and the related wrappers were added too.",
      ],
      [
        "Generational ZGC, KEM API and other changes",
        "- **Generational ZGC** (JEP 439): ZGC with separate young and old generations, for much lower overhead. Enable it with `-XX:+UseZGC -XX:+ZGenerational`. It became ZGC's default mode in 23.\n- **The KEM API** (`javax.crypto.KEM`, JEP 452): key encapsulation, the building block of hybrid and post-quantum encryption, with DHKEM over X25519 among the built-in algorithms.\n- **New String and StringBuilder methods**: `indexOf(ch, from, to)`, `splitWithDelimiters`, `repeat`.\n- **`Character.isEmoji`**.\n- **`Math.clamp`**.\n- **A warning on dynamic agent loading** (JEP 451).\n- **The 32-bit Windows x86 port** deprecated.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import javax.crypto.*;
import java.security.*;

public class Main {
    sealed interface Event permits Login, Purchase, Logout { }
    record Login(String user) implements Event { }
    record Purchase(String user, Item item, int qty) implements Event { }
    record Logout(String user) implements Event { }
    record Item(String name, double price) { }

    static String handle(Object o) {
        return switch (o) {
            case null -> "null event";
            case Login(var user) -> user + " logged in";
            case Purchase(var user, Item(var name, var price), var qty) when qty * price > 1000 -> user + " made a BIG purchase of " + name;
            case Purchase(var user, Item(var name, var price), var qty) -> user + " bought " + qty + " x " + name;
            case Logout l -> l.user() + " logged out";
            case String s -> "raw text: " + s;
            default -> "unknown " + o.getClass().getSimpleName();
        };
    }

    public static void main(String[] args) throws Exception {
        // Virtual threads: 10,000 concurrent blocking tasks.
        AtomicInteger done = new AtomicInteger();
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) exec.submit(() -> { Thread.sleep(50); return done.incrementAndGet(); });
        }
        System.out.println("virtual threads: " + done.get() + " blocking tasks completed");

        // Pattern matching for switch + record patterns (nested, guarded, case null).
        List<Object> inputs = Arrays.asList(new Login("asha"), new Purchase("ravi", new Item("laptop", 900), 2),
                new Purchase("om", new Item("pen", 10), 3), new Logout("asha"), "hello", null, 42);
        for (Object in : inputs) System.out.println("switch pattern -> " + handle(in));

        // Sequenced collections.
        List<String> list = new ArrayList<>(List.of("b", "c"));
        list.addFirst("a"); list.addLast("d");
        LinkedHashSet<Integer> set = new LinkedHashSet<>(List.of(3, 1, 2));
        LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
        map.put("x", 1); map.putFirst("first", 0); map.putLast("last", 9);
        System.out.println("sequenced: list " + list + " reversed " + list.reversed() + ", set first/last " + set.getFirst() + "/" + set.getLast()
                + ", map first " + map.firstEntry() + " last " + map.lastEntry() + " reversed " + map.reversed());

        // KEM API (21): DHKEM over X25519.
        KeyPair receiver = KeyPairGenerator.getInstance("X25519").generateKeyPair();
        KEM kem = KEM.getInstance("DHKEM");
        KEM.Encapsulated sent = kem.newEncapsulator(receiver.getPublic()).encapsulate();
        SecretKey received = kem.newDecapsulator(receiver.getPrivate()).decapsulate(sent.encapsulation());
        System.out.println("KEM: both sides derived the same key: " + Arrays.equals(sent.key().getEncoded(), received.getEncoded())
                + " (" + sent.encapsulation().length + "-byte encapsulation)");

        // New small APIs in 21.
        System.out.println("Math.clamp(150, 0, 100) = " + Math.clamp(150, 0, 100) + ", \"a-b-c\".splitWithDelimiters " + Arrays.toString("a-b-c".splitWithDelimiters("-", 0))
                + ", Character.isEmoji(0x1F600) " + Character.isEmoji(0x1F600) + ", StringBuilder.repeat " + new StringBuilder().repeat("ab", 3));
    }
}`,
    release: 21,
    walk:
      "10,000 virtual threads each sleep for 50 ms, and all complete quickly, because a sleeping virtual thread frees its carrier. The `handle` switch is the centrepiece of Java 21:\n\n- `case null`\n- record patterns that deconstruct a Login\n- a **nested** pattern that reaches into the Item inside a Purchase\n- a **guard** (`when qty * price > 1000`), placed before the general Purchase case to satisfy dominance\n- a plain type pattern, and a default for other objects\n\nThe sequenced-collections block adds at both ends of a list, reads the first and last elements of a LinkedHashSet, and uses `putFirst`, `putLast`, `firstEntry`, `lastEntry` and `reversed()` on a LinkedHashMap. The KEM API encapsulates a fresh secret to a receiver's X25519 public key, and the receiver decapsulates the same key. The last line samples small Java 21 additions.",
    anim: [
      "A Java 21 pattern switch, case by case",
      [
        ["sel", "selector", "Object o"],
        ["nul", "case null", "explicit"],
        ["rec", "record pattern", "Login(var user)"],
        ["guard", "nested + guard", "Purchase(...) when"],
        ["def", "default", "everything else"],
      ],
      [
        ["sel", "nul", "null?", "A null selector matches case null instead of throwing NullPointerException."],
        ["sel", "rec", "Login", "A Login is deconstructed and its user component bound in one step."],
        ["sel", "guard", "Purchase", "The nested pattern reaches inside Item; the guard selects big purchases first."],
        ["guard", "guard", "dominance", "The unguarded Purchase case must come after the guarded one, or javac rejects it."],
        ["sel", "def", "other", "Strings, Integers and other types fall through to their own cases or to default."],
      ],
    ],
    mistakes: [
      "Putting the unguarded case before the guarded case of the same type, which is a dominance compile error.",
      "Using `synchronized` around blocking I/O with virtual threads on Java 21 to 23, which pins carriers. Upgrade to 24, or use ReentrantLock.",
      "Forgetting `case null` when the selector can be null.",
    ],
    qa: [
      [
        "What happened to string templates (previewed in 21)?",
        "They were previewed in 21 and 22, then withdrawn in 23 for a redesign. They are not part of Java 25, 26 or 27.",
      ],
      [
        "Which Java 21 previews became final later?",
        "Unnamed patterns and variables (22), the FFM API (22), unnamed classes and instance main methods, as compact source files (25), and scoped values (25). Structured concurrency is still in preview in 27.",
      ],
      [
        "Is Java 21 a good baseline in 2026?",
        "Yes, it is a widely supported LTS. Java 25 is the newer LTS, with additional final features and runtime improvements, such as no synchronized pinning, the AOT cache and compact headers.",
      ],
    ],
    ex: [
      "Add a `Refund(String user, double amount)` record to the sealed Event hierarchy. What must change for code that switches over Event without a default?",
      "Add `Refund` to the `permits` clause and declare the record. Every exhaustive switch over Event without a default then fails to compile until a `case Refund(...)` is added. That is exactly the safety net sealed types provide.",
    ],
  }),

  lesson("Java 22 (2024): Unnamed Variables, the Foreign Function & Memory API and Multi-File Source Launch", {
    intro:
      "Java 22 (March 2024) finalised **unnamed variables and patterns** (`_`), the **Foreign Function & Memory API** (JEP 454), and **launching multi-file source programs** (JEP 458). It added **region pinning for G1** (JEP 423), which avoids stalling the GC during JNI critical regions. It previewed:\n\n- statements before `super(...)`\n- the Class-File API\n- Stream Gatherers\n- string templates (second preview)\n- implicitly declared classes (second preview)\n- structured concurrency and scoped values (second previews)\n\nThe program uses `_`, calls C's `strlen` through FFM, and launches a two-file program from source.",
    topics: [
      [
        "Unnamed variables and patterns (JEP 456)",
        "`_` declares variables and pattern components you will not use:\n\n- `catch (NumberFormatException _)`\n- `for (var _ : items)`\n- `(_, value) -> value`\n- `try (var _ = lock.acquire())`\n- `case Point(var x, _)` and `case Circle _, Square _ -> ...`\n\nIt documents intent, lets several patterns share a case label, and stops you from using a variable by accident. It works for local variables, exception parameters, lambda parameters and pattern components, but not for fields or method parameters.",
      ],
      [
        "The Foreign Function & Memory API (JEP 454)",
        "`java.lang.foreign` replaces JNI and Unsafe:\n\n- **Arena** controls the lifetime of memory (confined, shared, auto or global)\n- **MemorySegment** is bounds-checked, safe memory\n- **ValueLayout** and **StructLayout** describe the data\n- **Linker** creates **downcall** handles to native functions, which you find with a **SymbolLookup**, and **upcall** stubs so that C can call Java\n\nThe **jextract** tool generates bindings from C headers. Restricted operations warn unless `--enable-native-access=ALL-UNNAMED` (or a module name) is set.",
      ],
      [
        "Launch multi-file source-code programs (JEP 458)",
        "`java Main.java` can now use **other source files**, which are found from the same root directory by package structure and compiled in memory on demand. Small programs can therefore grow into several classes and files without a build tool, and `--class-path` adds library JARs. Together with implicit classes (final in 25), this makes Java a comfortable scripting and learning language.",
      ],
      [
        "Previews in 22, and G1 region pinning",
        "- **Statements before super()** (JEP 447), finalised in 25 as flexible constructor bodies.\n- **The Class-File API** (JEP 457), final in 24.\n- **Stream Gatherers** (JEP 461), final in 24.\n- **Implicitly declared classes and instance main methods** (JEP 463), final in 25.\n- **Structured concurrency** (JEP 462) and **scoped values** (JEP 464).\n- **String templates**, second preview, then withdrawn.\n- **The Vector API**, seventh incubator.\n- **G1 region pinning** (JEP 423): G1 can keep collecting while a thread is inside a JNI critical region, instead of disabling GC.",
      ],
    ],
    code: String.raw`import java.lang.foreign.*;
import java.lang.invoke.MethodHandle;
import java.nio.file.*;
import java.util.*;

public class Main {
    sealed interface Shape permits Circle, Square, Rect { }
    record Circle(double r) implements Shape { }
    record Square(double s) implements Shape { }
    record Rect(double w, double h) implements Shape { }

    static String kind(Shape shape) {
        return switch (shape) {
            case Circle _ -> "round";                              // unnamed pattern variable
            case Square _, Rect _ -> "angular";                    // several patterns share one case
        };
    }

    public static void main(String[] args) throws Throwable {
        // Unnamed variables and patterns (final in 22).
        int count = 0;
        for (var _ : List.of("a", "b", "c")) count++;
        int parsed;
        try { parsed = Integer.parseInt("22x"); } catch (NumberFormatException _) { parsed = -1; }
        Map<String, Integer> stock = Map.of("pen", 3);
        stock.forEach((_, qty) -> System.out.print("value-only lambda saw qty " + qty + "; "));
        System.out.println("loop count " + count + ", parse fallback " + parsed + ", kinds " + List.of(kind(new Circle(1)), kind(new Rect(1, 2))));

        // FFM API (final in 22): off-heap memory + calling C's strlen and qsort-free math via a struct.
        try (Arena arena = Arena.ofConfined()) {
            MemoryLayout pointLayout = MemoryLayout.structLayout(ValueLayout.JAVA_INT.withName("x"), ValueLayout.JAVA_INT.withName("y"));
            MemorySegment point = arena.allocate(pointLayout);
            var xHandle = pointLayout.varHandle(MemoryLayout.PathElement.groupElement("x"));
            var yHandle = pointLayout.varHandle(MemoryLayout.PathElement.groupElement("y"));
            xHandle.set(point, 0L, 3);
            yHandle.set(point, 0L, 4);
            Linker linker = Linker.nativeLinker();
            MethodHandle strlen = linker.downcallHandle(linker.defaultLookup().find("strlen").orElseThrow(),
                    FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));
            long len = (long) strlen.invokeExact(arena.allocateFrom("Java 22 FFM"));
            System.out.println("FFM: struct {x=" + (int) xHandle.get(point, 0L) + ", y=" + (int) yHandle.get(point, 0L) + "} of " + pointLayout.byteSize()
                    + " bytes, C strlen = " + len);
            try { point.get(ValueLayout.JAVA_INT, 8); } catch (IndexOutOfBoundsException e) { System.out.println("FFM bounds check: reading past the struct -> IndexOutOfBoundsException"); }
        }

        // Multi-file source launch (final in 22): Main2.java uses Helper.java, compiled on demand.
        Path dir = Files.createTempDirectory("multi");
        Files.writeString(dir.resolve("App.java"), "public class App { public static void main(String[] a) { System.out.println(Helper.greet(\"multi-file launch\")); } }");
        Files.writeString(dir.resolve("Helper.java"), "public class Helper { static String greet(String s) { return \"Hello from Helper via \" + s; } }");
        Process p = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(), "App.java")
                .directory(dir.toFile()).redirectErrorStream(true).start();
        String out = new String(p.getInputStream().readAllBytes()).trim();
        p.waitFor();
        System.out.println("java App.java (2 source files) -> " + out);
    }
}`,
    release: 22,
    walk:
      "The unnamed variable `_` appears as a loop variable whose value is irrelevant, as an exception parameter, as an unused lambda parameter in `Map.forEach`, and as unnamed pattern bindings. The `kind` switch even lets `Square _` and `Rect _` share one case. The FFM block allocates a C-style struct `{int x; int y;}` in a confined Arena, and writes and reads its fields through layout-derived VarHandles. It calls the C library's `strlen` through a downcall handle, which returns 11. Reading past the 8-byte struct is caught by the bounds check, where C would silently read garbage.\n\nThe multi-file launch writes App.java and Helper.java to a temporary directory and runs `java App.java` in a child JVM. The launcher compiles Helper on demand, which was impossible before Java 22. The lesson compiles with `--release 22`.",
    anim: [
      "Calling C from Java with the FFM API",
      [
        ["java", "Java code", "strlen.invoke"],
        ["arena", "Arena", "owns memory"],
        ["seg", "MemorySegment", "\"Java 22 FFM\\0\""],
        ["linker", "Linker", "downcall handle"],
        ["c", "C library", "strlen()"],
      ],
      [
        ["java", "arena", "allocateFrom", "The string is copied into native memory owned by a confined Arena."],
        ["arena", "seg", "segment", "A bounds-checked MemorySegment points at the NUL-terminated bytes."],
        ["java", "linker", "downcallHandle", "The Linker builds a MethodHandle for strlen from its C signature."],
        ["linker", "c", "invokeExact", "Calling the handle jumps into native code with the segment's address."],
        ["arena", "seg", "close()", "Closing the arena frees the memory; later access throws instead of crashing."],
      ],
    ],
    mistakes: [
      "Using `_` and then trying to read it. An unnamed variable cannot be referenced.",
      "Allocating native memory with `Arena.global()` for short-lived data. It is never freed.",
      "Ignoring the native-access warnings instead of adding `--enable-native-access`.",
    ],
    qa: [
      [
        "Can `_` be used as a field name?",
        "No. Unnamed variables are only for local variables, exception parameters, lambda parameters, resources, loop variables and pattern components. Since Java 9, `_` cannot be an ordinary identifier at all.",
      ],
      [
        "What is the difference between a confined and a shared Arena?",
        "A confined arena can be used and closed only by the thread that created it. A shared arena can be accessed by many threads, and closing it is a coordinated, more expensive operation.",
      ],
      [
        "Does multi-file launch replace Maven or Gradle?",
        "No. It is for small programs, scripts and learning. Real projects still need dependency management, tests and packaging from a build tool.",
      ],
    ],
    ex: [
      "Use the FFM API to call the C function `abs(int)` from the standard library and print `abs(-42)`.",
      "`MethodHandle abs = linker.downcallHandle(linker.defaultLookup().find(\"abs\").orElseThrow(), FunctionDescriptor.of(ValueLayout.JAVA_INT, ValueLayout.JAVA_INT)); System.out.println((int) abs.invokeExact(-42));` prints 42.",
    ],
  }),

  lesson("Java 23 (2024): Markdown Documentation Comments, Generational ZGC by Default and Many Previews", {
    intro:
      "Java 23 (September 2024) had fewer final features, but many previews moved forward. Its final changes:\n\n- **Markdown documentation comments** (`///`, JEP 467)\n- **generational mode as ZGC's default** (JEP 474)\n- **deprecating the memory-access methods of sun.misc.Unsafe** for removal (JEP 471)\n\nIts previews:\n\n- **primitive types in patterns** (first preview)\n- **module import declarations** (first preview)\n- **flexible constructor bodies** (second preview)\n- implicitly declared classes (third preview)\n- the Class-File API and Stream Gatherers (second previews)\n- structured concurrency and scoped values (third previews)\n\n**String templates were withdrawn.** The program uses Markdown comments, and runs a child JVM on generational ZGC.",
    topics: [
      [
        "Markdown documentation comments (JEP 467)",
        "Javadoc comments can now be written in **Markdown** with `///` line comments instead of `/** ... */` with HTML: `**bold**`, lists, tables, fenced code blocks, and links written as `[String]` or `[java.util.List#add(Object)]`. Javadoc tags such as `@param` still work. It makes documentation easier to write and read in source code. The javadoc tool renders both styles.",
        "/// Returns the **sum** of two numbers.\n///\n/// - `a`: first operand\n/// - `b`: second operand\n///\n/// @return `a + b`\nstatic int add(int a, int b) { return a + b; }",
      ],
      [
        "Generational ZGC by default (JEP 474)",
        "With `-XX:+UseZGC`, ZGC now runs in **generational mode by default**. It collects young objects frequently and cheaply, and old objects rarely. That gives lower memory overhead, higher throughput and fewer allocation stalls than the original single-generation ZGC. The non-generational mode was deprecated, and then removed in 24 (JEP 490). G1 remains the JVM's default collector.",
      ],
      [
        "Deprecating sun.misc.Unsafe memory access (JEP 471)",
        "The memory-access methods of `sun.misc.Unsafe` (`getInt`, `putLong`, `allocateMemory` and others) were deprecated for removal, because safe, supported replacements now exist. They are **VarHandle**, for on-heap field and array access with atomics and fences, and the **FFM API**, for off-heap memory. Java 24 (JEP 498) started printing warnings on first use. Libraries such as Netty and Agrona are migrating.",
      ],
      [
        "Previews: primitive patterns, module imports and flexible constructors",
        "- **Primitive types in patterns, instanceof and switch** (JEP 455), still in preview through 27.\n- **Module import declarations** (JEP 476), final in 25.\n- **Flexible constructor bodies** (JEP 482), final in 25.\n- **Implicitly declared classes and instance main methods** (JEP 477), which added automatic import of `java.base` and the `IO` helper methods. Final in 25.\n- **The Class-File API** (JEP 466) and **Stream Gatherers** (JEP 473), final in 24.\n- **Structured concurrency** (JEP 480) and **scoped values** (JEP 481).\n- **The Vector API**, eighth incubator.\n- **String templates** (previewed in 21 and 22) were **removed** pending a redesign.",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.nio.file.*;
import java.util.*;

public class Main {

    /// A temperature reading in **degrees Celsius**.
    ///
    /// Valid readings are:
    /// - at or above absolute zero (${"`"}-273.15${"`"})
    /// - finite numbers
    ///
    /// @param celsius the measured value
    record Reading(double celsius) {
        /// Validates the reading; see [Double#isFinite(double)].
        Reading {
            if (!Double.isFinite(celsius) || celsius < -273.15) throw new IllegalArgumentException("invalid: " + celsius);
        }
    }

    /// Returns the average of the readings, or ${"`"}0${"`"} for an empty list.
    static double average(List<Reading> readings) {
        return readings.stream().mapToDouble(Reading::celsius).average().orElse(0);
    }

    public static void main(String[] args) throws Exception {
        // Markdown doc comments compile like any comment; javadoc renders them.
        System.out.printf("Markdown-documented code: average %.2f%n", average(List.of(new Reading(20.5), new Reading(22.5))));
        try { new Reading(Double.NaN); } catch (IllegalArgumentException e) { System.out.println("validation: " + e.getMessage()); }

        // Default GC of this JVM vs a child JVM started with ZGC (generational by default since 23).
        List<String> mine = ManagementFactory.getGarbageCollectorMXBeans().stream().map(GarbageCollectorMXBean::getName).toList();
        System.out.println("default collector here: " + (mine.stream().anyMatch(n -> n.startsWith("G1")) ? "G1" : mine));

        Path dir = Files.createTempDirectory("zgc");
        Files.writeString(dir.resolve("Gc.java"), "import java.lang.management.*; public class Gc { public static void main(String[] a) {"
                + " for (GarbageCollectorMXBean b : ManagementFactory.getGarbageCollectorMXBeans()) System.out.println(b.getName()); } }");
        Process p = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(), "-XX:+UseZGC", "Gc.java")
                .directory(dir.toFile()).redirectErrorStream(true).start();
        List<String> zgcBeans = new String(p.getInputStream().readAllBytes()).lines().map(String::trim).filter(s -> !s.isEmpty()).sorted().toList();
        p.waitFor();
        System.out.println("child JVM with -XX:+UseZGC reports collectors: " + zgcBeans
                + " -> generational: " + zgcBeans.stream().anyMatch(n -> n.contains("Minor")));

        // VarHandle: the supported replacement for Unsafe field access.
        var counter = new int[1];
        var handle = java.lang.invoke.MethodHandles.arrayElementVarHandle(int[].class);
        handle.getAndAdd(counter, 0, 23);
        System.out.println("VarHandle atomic getAndAdd on an array element -> " + counter[0]);
    }
}`,
    release: 23,
    walk:
      "The Reading record and the `average` method are documented with Java 23's `///` Markdown comments: bold text, a bullet list, inline code, and a `[Double#isFinite(double)]` reference link. They compile like ordinary comments, and the javadoc tool renders them as HTML. The record's compact constructor rejects NaN.\n\nThis JVM reports G1, which is still the default collector. The program then writes a tiny Gc.java and launches it in a child JVM with `-XX:+UseZGC`. Its collector MXBeans are ZGC's major and minor cycles and pauses, and the minor ones show that **generational** mode is active by default since Java 23. Finally a VarHandle performs an atomic `getAndAdd` on an array element: the supported replacement for the Unsafe methods deprecated in this release. The program compiles with `--release 23`.",
    anim: [
      "Generational ZGC",
      [
        ["alloc", "allocation", "new objects"],
        ["young", "young gen", "frequent, cheap"],
        ["old", "old gen", "rare, concurrent"],
        ["app", "app threads", "keep running"],
      ],
      [
        ["alloc", "young", "allocate", "New objects are allocated in the young generation."],
        ["young", "young", "minor cycle", "Most objects die young, so frequent minor cycles reclaim memory cheaply."],
        ["young", "old", "promote", "Objects that survive several cycles are promoted to the old generation."],
        ["old", "old", "major cycle", "The old generation is collected less often, still concurrently."],
        ["app", "young", "sub-ms pauses", "Application threads pause only briefly; marking and relocation are concurrent."],
      ],
    ],
    mistakes: [
      "Mixing `///` Markdown and `/** */` HTML styles in the same comment. A doc comment is one style or the other.",
      "Expecting string templates (`STR.\"...\"`) to compile on Java 23 or later. The preview was removed.",
      "Adding new uses of `sun.misc.Unsafe` memory access. Use VarHandle or FFM.",
    ],
    qa: [
      [
        "Why were string templates withdrawn?",
        "Feedback showed that the design, with processors such as `STR` and the `\\{}` syntax, needed rethinking. Rather than freeze an imperfect design, the preview was removed in 23 so it could return in a better form.",
      ],
      [
        "How do you link to a method in a Markdown doc comment?",
        "Use reference links: `[String#length()]` or `[the list][java.util.List]`. The javadoc tool resolves them like `{@link}`.",
      ],
      [
        "When should you choose ZGC over G1?",
        "For large heaps, or latency-sensitive services that need consistently short pauses. G1 balances throughput and latency well for most applications, which is why it remains the default.",
      ],
    ],
    ex: [
      "Convert this Javadoc to a Markdown doc comment: `/** Returns <b>true</b> if <code>s</code> is empty.<ul><li>null is not allowed</li></ul> */`.",
      "`/// Returns **true** if `s` is empty.`, then a `///` line, then `/// - `null` is not allowed`. Each line starts with `///`, uses Markdown instead of HTML, and no closing marker is needed.",
    ],
  }),

  lesson("Java 24 (2025): Stream Gatherers, Class-File API, No More synchronized Pinning, AOT Cache and Post-Quantum Crypto", {
    intro:
      "Java 24 (March 2025) had **24 JEPs**, one of the largest recent releases. Its final features:\n\n- **Stream Gatherers** (JEP 485)\n- the **Class-File API** (JEP 484)\n- **virtual threads synchronizing without pinning** (JEP 491)\n- **ahead-of-time class loading and linking** (JEP 483)\n- the quantum-resistant **ML-KEM** (JEP 496) and **ML-DSA** (JEP 497) algorithms\n- the **Security Manager permanently disabled** (JEP 486)\n- warnings for Unsafe memory access\n- removal of non-generational ZGC\n- linking run-time images without JMODs\n\nIt previewed compact object headers (experimental), generational Shenandoah (experimental), the KDF API, and further rounds of the Amber and Loom features. The program uses every final feature.",
    topics: [
      [
        "Stream Gatherers (JEP 485)",
        "`Stream.gather(Gatherer)` adds custom **intermediate** operations: stateful, one-to-many or many-to-one, and optionally short-circuiting or parallel-capable. The built-ins are `Gatherers.windowFixed(n)`, `windowSliding(n)`, `fold(init, op)`, `scan(init, op)` and `mapConcurrent(maxConcurrency, fn)`, which maps with virtual threads while preserving order. You write your own with `Gatherer.ofSequential(initializer, integrator, finisher)`, for example distinct-by-key or batching.",
      ],
      [
        "The Class-File API (JEP 484)",
        "`java.lang.classfile` is the JDK's standard API to **parse, generate and transform class files**. It is immutable, model-based, and always up to date with the JVM specification, so frameworks no longer need to ship their own copy of ASM, which lags behind new class-file versions. `ClassFile.of().build(desc, classBuilder -> ...)` generates a class, and `parse(bytes)` returns a ClassModel of fields, methods and attributes. The JDK uses it internally for lambdas, jlink and proxies.",
      ],
      [
        "Synchronize virtual threads without pinning (JEP 491)",
        "Object monitors were reimplemented so that a virtual thread that blocks **inside `synchronized`** (or in `Object.wait()`) can **unmount** from its carrier. Previously it pinned the carrier, which could starve the scheduler. Existing code with synchronized blocks around I/O, in many libraries and JDBC drivers, now scales on virtual threads without rewriting it to ReentrantLock. The remaining pinning cases are native frames and some class initialisation.",
      ],
      [
        "AOT class loading and linking (JEP 483)",
        "Project Leyden's first deliverable is an **AOT cache**. A training run records which classes the application loads and links (`-XX:AOTMode=record -XX:AOTConfiguration=app.aotconf`). A creation step builds the cache (`-XX:AOTMode=create -XX:AOTCache=app.aot`). Production runs start with `-XX:AOTCache=app.aot`, with the classes already loaded and linked. Startup improves by up to about 40% for framework-heavy applications. Java 25 simplified this to one step, and added method profiles.",
      ],
      [
        "Post-quantum cryptography and security changes",
        "**ML-KEM** (FIPS 203) is a key encapsulation mechanism, and **ML-DSA** (FIPS 204) a digital signature algorithm. Both resist attacks by future quantum computers, and both are available through the standard `KEM`, `KeyPairGenerator` and `Signature` APIs. The **Security Manager is permanently disabled** (JEP 486): `System.setSecurityManager` throws UnsupportedOperationException. JNI use now warns (JEP 472), and so does Unsafe memory access (JEP 498).",
      ],
      [
        "Other Java 24 changes",
        "- **Late barrier expansion for G1** (JEP 475), with simpler and faster JIT code.\n- **Non-generational ZGC removed** (JEP 490).\n- **Linking run-time images without JMODs** (JEP 493), so JDKs can be about 25% smaller.\n- **The 32-bit x86 port** deprecated for removal (JEP 501), and the Windows 32-bit x86 port removed (JEP 479).\n- **Compact object headers** (experimental, JEP 450).\n- **Generational Shenandoah** (experimental, JEP 404).\n- **The KDF API** (preview, JEP 478).\n- **Previews**: primitive patterns (second), flexible constructor bodies (third), module imports (second), simple source files (fourth), structured concurrency (fourth), scoped values (fourth).",
      ],
    ],
    code: String.raw`import java.lang.classfile.*;
import java.lang.constant.*;
import java.lang.invoke.MethodHandles;
import java.security.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;
import javax.crypto.KEM;

public class Main {
    // A custom sequential gatherer: emit only the first element of each key (distinct-by-key).
    static <T, K> Gatherer<T, ?, T> distinctBy(java.util.function.Function<T, K> key) {
        return Gatherer.ofSequential(
                () -> new HashSet<K>(),
                (seen, element, downstream) -> seen.add(key.apply(element)) ? downstream.push(element) : true);
    }

    public static void main(String[] args) throws Throwable {
        // Stream Gatherers (final in 24).
        List<String> words = List.of("apple", "avocado", "banana", "blueberry", "cherry");
        System.out.println("windowFixed(2) " + Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2)).toList()
                + ", scan " + Stream.of(1, 2, 3, 4).gather(Gatherers.scan(() -> 0, Integer::sum)).toList()
                + ", custom distinctBy(first letter) " + words.stream().gather(distinctBy(w -> w.charAt(0))).toList());
        List<String> upper = words.stream().gather(Gatherers.mapConcurrent(3, w -> { sleep(20); return w.toUpperCase(); })).toList();
        System.out.println("mapConcurrent on virtual threads keeps order: " + upper);

        // Class-File API (final in 24): generate a class with a static method, define it, call it.
        byte[] bytes = ClassFile.of().build(ClassDesc.of("Generated"), cb -> cb
                .withFlags(ClassFile.ACC_PUBLIC)
                .withMethod("greet", MethodTypeDesc.of(ConstantDescs.CD_String), ClassFile.ACC_PUBLIC | ClassFile.ACC_STATIC,
                        mb -> mb.withCode(code -> code.ldc("hello from generated bytecode").areturn())));
        Class<?> generated = MethodHandles.lookup().defineHiddenClass(bytes, true).lookupClass();
        ClassModel model = ClassFile.of().parse(bytes);
        System.out.println("Class-File API: " + generated.getMethod("greet").invoke(null) + " (" + bytes.length + " bytes, methods "
                + model.methods().stream().map(m -> m.methodName().stringValue()).toList() + ")");

        // No pinning in synchronized (24): 500 virtual threads block inside one monitor in turn.
        Object monitor = new Object();
        long start = System.nanoTime();
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 500; i++) exec.submit(() -> { synchronized (monitor) { Thread.sleep(1); } return null; });
            for (int i = 0; i < 500; i++) exec.submit(() -> { Thread.sleep(50); return null; });  // still progress meanwhile
        }
        System.out.println("500 virtual threads slept inside synchronized without exhausting carriers: finished in under 10 s "
                + ((System.nanoTime() - start) / 1_000_000_000L < 10));

        // Post-quantum algorithms (final in 24).
        KeyPair mlkemPair = KeyPairGenerator.getInstance("ML-KEM").generateKeyPair();
        KEM mlkem = KEM.getInstance("ML-KEM");
        KEM.Encapsulated enc = mlkem.newEncapsulator(mlkemPair.getPublic()).encapsulate();
        boolean sameKey = Arrays.equals(enc.key().getEncoded(), mlkem.newDecapsulator(mlkemPair.getPrivate()).decapsulate(enc.encapsulation()).getEncoded());
        KeyPair dsaPair = KeyPairGenerator.getInstance("ML-DSA").generateKeyPair();
        java.security.Signature signer = java.security.Signature.getInstance("ML-DSA");
        signer.initSign(dsaPair.getPrivate());
        signer.update("java 24".getBytes());
        byte[] sig = signer.sign();
        java.security.Signature verifier = java.security.Signature.getInstance("ML-DSA");
        verifier.initVerify(dsaPair.getPublic());
        verifier.update("java 24".getBytes());
        System.out.println("ML-KEM shared key agreed: " + sameKey + " (ciphertext " + enc.encapsulation().length + " bytes); ML-DSA signature "
                + sig.length + " bytes, verifies " + verifier.verify(sig));

        // Security Manager permanently disabled (24).
        try { System.setSecurityManager(null); System.out.println("setSecurityManager(null) is a no-op"); }
        catch (UnsupportedOperationException e) { System.out.println("Security Manager disabled: " + e.getClass().getSimpleName()); }
    }

    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
}`,
    release: 24,
    walk:
      "The built-in gatherers group 1 to 5 into fixed windows and compute running sums. The custom `distinctBy` gatherer keeps a HashSet of seen keys, and pushes only the first word per initial letter: apple, banana, cherry. `mapConcurrent(3, ...)` upper-cases the words on at most three virtual threads at once, while preserving the input order. The Class-File API builds a class named Generated with a static `greet` method that returns a constant. The program defines it as a hidden class, calls it, and parses the same bytes back into a ClassModel.\n\nIn the pinning test, 500 virtual threads each sleep inside the same `synchronized` block, while 500 more sleep outside it. On Java 24 and later they unmount instead of pinning the carriers, so everything finishes promptly. ML-KEM encapsulates a shared secret, with a 1,088-byte ciphertext for the default ML-KEM-768. ML-DSA signs and verifies, with a 3,309-byte signature for ML-DSA-65. `setSecurityManager` is no longer supported. The program compiles with `--release 24`.",
    anim: [
      "A custom Gatherer: distinct by key",
      [
        ["src", "words stream", "apple, avocado..."],
        ["init", "initializer", "new HashSet"],
        ["integ", "integrator", "seen.add(key)?"],
        ["down", "downstream", "push element"],
        ["out", "result", "apple, banana..."],
      ],
      [
        ["init", "integ", "state", "The initializer creates per-stream state: a set of keys seen so far."],
        ["src", "integ", "apple", "apple's key 'a' is new, so the integrator pushes apple downstream."],
        ["src", "integ", "avocado", "avocado's key 'a' is already in the set, so it is dropped."],
        ["integ", "down", "banana", "banana's key 'b' is new and is pushed; blueberry is then dropped."],
        ["down", "out", "toList()", "The terminal toList collects apple, banana and cherry."],
      ],
    ],
    mistakes: [
      "Writing a stateful gatherer with shared mutable state outside the initializer. State must come from the initializer, so that each stream evaluation is independent.",
      "Assuming the AOT cache works across different JDK builds or classpaths. It must be created by the same JVM with the same application.",
      "Still calling `System.setSecurityManager` in tests or launchers. It is permanently unsupported.",
    ],
    qa: [
      [
        "Why does the JDK provide its own class-file API instead of using ASM?",
        "The JDK evolves the class-file format every six months, and a bundled ASM copy always lagged behind. A JDK-owned API is updated together with the format, and frameworks get it for free.",
      ],
      [
        "What problem does ML-KEM solve?",
        "Classical key exchanges (RSA, ECDH) can be broken by a large quantum computer. ML-KEM is based on lattice problems believed to resist quantum attacks, so data encrypted today stays protected against \"harvest now, decrypt later\" attacks.",
      ],
      [
        "Is `mapConcurrent` the same as a parallel stream?",
        "No. It runs the mapping function concurrently on virtual threads, with a concurrency limit, and is meant for blocking I/O such as HTTP calls, while keeping the encounter order. Parallel streams split CPU work over the ForkJoin common pool.",
      ],
    ],
    ex: [
      "Write a gatherer `batch(n)` that groups elements into lists of size n, emitting the last partial batch at the end. Which built-in gatherer already does this?",
      "`Gatherer.ofSequential(() -> new ArrayList<T>(), (buf, e, down) -> { buf.add(e); if (buf.size() == n) { down.push(List.copyOf(buf)); buf.clear(); } return true; }, (buf, down) -> { if (!buf.isEmpty()) down.push(List.copyOf(buf)); })`. The built-in `Gatherers.windowFixed(n)` does exactly this.",
    ],
  }),

  lesson("Java 25 (2025, LTS): Compact Source Files, Module Imports, Flexible Constructors, Scoped Values and Compact Headers", {
    intro:
      "Java 25 (September 2025) is the newest **LTS**. Its 18 JEPs finalise several long-running previews:\n\n- **compact source files and instance main methods** (JEP 512)\n- **module import declarations** (JEP 511)\n- **flexible constructor bodies** (JEP 513)\n- **scoped values** (JEP 506)\n\nIt also brings:\n\n- the **KDF API** (JEP 510)\n- **compact object headers** as a product feature (JEP 519)\n- **generational Shenandoah** (JEP 521)\n- **AOT ergonomics and method profiling** (JEPs 514 and 515)\n- **JFR CPU-time profiling, cooperative sampling and method timing** (JEPs 509, 518 and 520)\n- removal of the 32-bit x86 port (JEP 503)\n\nIts previews are PEM encodings, stable values, structured concurrency, primitive patterns and the Vector API.",
    topics: [
      [
        "Compact source files and instance main methods (JEP 512)",
        "A source file may skip the class declaration entirely: `void main() { IO.println(\"Hello\"); }` is a complete program. The compiler wraps the top-level members in an **implicitly declared class**, which automatically imports the **java.base** module. **Instance main methods** are allowed in any class, with no `static` and no `String[]` needed. The launcher tries the traditional `public static void main(String[])` first. The new **`java.lang.IO`** class offers `println`, `print` and `readln`. Beginners can learn Java one concept at a time, and small scripts become shorter.",
        "// Hello.java - the whole file\nvoid main() {\n    String name = IO.readln(\"Name? \");\n    IO.println(\"Hello, \" + name);\n}",
      ],
      [
        "Module import declarations (JEP 511)",
        "`import module java.base;` imports every public top-level type of every package that the module exports, and of the modules it requires transitively. One line covers java.util, java.io, java.nio.file, java.time, java.util.stream and the rest. `import module java.sql;` brings in all of JDBC. Single-type imports resolve name conflicts (`import java.util.List;` beats `java.awt.List`). It works in any compilation unit, modular or not.",
      ],
      [
        "Flexible constructor bodies (JEP 513)",
        "Statements may appear **before** `super(...)` or `this(...)`, as long as they do not read the instance under construction. The constructor can validate arguments and **fail fast before the superclass runs**, compute or convert the values it passes up, and **assign its own fields first**. That fixes the long-standing bug where a superclass constructor calls an overridden method that sees subclass fields still at their defaults.",
      ],
      [
        "Scoped values (JEP 506)",
        "`ScopedValue<T>` shares immutable context with callees and child threads for a bounded period: `ScopedValue.where(USER, user).run(() -> service.handle())`, and `USER.get()` anywhere inside. It cannot be mutated and is automatically unbound afterwards. It is cheap to inherit into StructuredTaskScope subtasks. It is the modern replacement for ThreadLocal request context, and works especially well with virtual threads.",
      ],
      [
        "KDF API, compact object headers and generational Shenandoah",
        "- **`javax.crypto.KDF`** standardises key-derivation functions, with **HKDF** built in. It is used for deriving session keys, and is the basis for hybrid post-quantum schemes.\n- **Compact object headers** (`-XX:+UseCompactObjectHeaders`) shrink object headers on 64-bit JVMs from 12 bytes (with compressed class pointers) to **8 bytes**, typically saving 10 to 20% of the heap. They became the default in 27.\n- **Generational Shenandoah** became a product feature.",
      ],
      [
        "AOT, JFR and platform changes",
        "- **AOT command-line ergonomics** (JEP 514): a one-step `-XX:AOTCacheOutput=app.aot` training run.\n- **AOT method profiling** (JEP 515): the cache also stores JIT profiles, so peak performance comes sooner.\n- **JFR CPU-time profiling** (JEP 509, experimental, Linux): accurate CPU sampling.\n- **Cooperative sampling** (JEP 518): safer and more scalable stack sampling.\n- **Method timing and tracing** (JEP 520): `jfr` can time specific methods without bytecode agents.\n- **The 32-bit x86 port removed** (JEP 503).\n- **Previews and incubators**: PEM encodings (JEP 470), stable values (JEP 502), structured concurrency (fifth preview, JEP 505), primitive patterns (third preview, JEP 507), the Vector API (tenth incubator, JEP 508).",
      ],
    ],
    code: String.raw`import module java.base;                                 // module import (final in 25)

public class Main {

    // Flexible constructor bodies (final in 25).
    static abstract class Shape {
        Shape() { IO.println("  Shape() sees area " + area()); }   // calls an overridden method
        abstract double area();
    }
    static final class Square extends Shape {
        private final double side;
        Square(double side) {
            if (side <= 0) throw new IllegalArgumentException("side must be positive");   // before super()
            this.side = side;                                       // field set before Shape() runs
            super();
        }
        double area() { return side * side; }
    }

    // Scoped values (final in 25).
    static final ScopedValue<String> TRACE_ID = ScopedValue.newInstance();
    static String log(String msg) { return "[" + (TRACE_ID.isBound() ? TRACE_ID.get() : "-") + "] " + msg; }
    static String service() { return log("service called"); }

    void main() throws Exception {                              // instance main method (final in 25)
        IO.println("Java 25 instance main, IO.println and import module java.base: " + List.of(LocalDate.of(2025, 9, 16).getDayOfWeek(), Duration.ofMinutes(90)));

        IO.println("Flexible constructor body:");
        Square sq = new Square(3);
        IO.println("  area " + sq.area());
        try { new Square(-1); } catch (IllegalArgumentException e) { IO.println("  rejected before super(): " + e.getMessage()); }

        String inside = ScopedValue.where(TRACE_ID, "req-25").call(() -> service());
        IO.println("Scoped values: inside -> " + inside + ", outside -> " + log("no binding"));

        // KDF API (final in 25): HKDF extract-then-expand.
        KDF hkdf = KDF.getInstance("HKDF-SHA256");
        var spec = HKDFParameterSpec.ofExtract().addIKM("shared-secret".getBytes()).addSalt("salt-25".getBytes()).thenExpand("session".getBytes(), 32);
        SecretKey key = hkdf.deriveKey("AES", spec);
        byte[] again = hkdf.deriveKey("AES", spec).getEncoded();
        IO.println("KDF: derived " + key.getEncoded().length * 8 + "-bit AES key, deterministic: " + Arrays.equals(key.getEncoded(), again));

        // Compact object headers: compare heap use of a child JVM with and without the flag.
        Path dir = Files.createTempDirectory("coh");
        Files.writeString(dir.resolve("Heap.java"), "public class Heap { public static void main(String[] a) { Object[] objs = new Object[2_000_000];"
                + " Runtime r = Runtime.getRuntime(); System.gc(); long before = r.totalMemory() - r.freeMemory();"
                + " for (int i = 0; i < objs.length; i++) objs[i] = new Object(); System.gc();"
                + " System.out.println((r.totalMemory() - r.freeMemory() - before) / objs.length); } }");
        long normal = bytesPerObject(dir, "-XX:-UseCompactObjectHeaders");
        long compact = bytesPerObject(dir, "-XX:+UseCompactObjectHeaders");
        IO.println("Compact object headers: a plain Object needs about " + normal + " bytes normally vs " + compact + " with compact headers -> smaller: " + (compact < normal));
    }

    static long bytesPerObject(Path dir, String flag) throws Exception {
        Process p = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(), flag, "-XX:+UseSerialGC", "-Xmx512m", "Heap.java")
                .directory(dir.toFile()).redirectErrorStream(true).start();
        String out = new String(p.getInputStream().readAllBytes()).trim();
        p.waitFor();
        long value = Long.parseLong(out.lines().reduce((a, b) -> b).orElse("0").trim());
        return Math.round(value / 4.0) * 4;                        // round to the 4-byte granularity
    }
}`,
    release: 25,
    walk:
      "The file starts with `import module java.base;`, so List, LocalDate, Duration, Path, Files, Arrays, KDF and SecretKey need no individual imports (KDF and SecretKey come from `javax.crypto`, which java.base exports). `main` is an instance method with no parameters, and output uses `IO.println`. Square's constructor validates its argument and assigns its own field **before** calling `super()`, so when Shape's constructor calls the overridden `area()`, it sees side = 3 and prints 9.0. Before Java 25 it would have printed 0.0. A negative side is rejected before any superclass code runs.\n\nThe scoped value TRACE_ID is bound only while `call` runs, so `service()` sees \"req-25\", and the log outside shows \"-\". HKDF derives a 256-bit AES key deterministically from the same inputs. Finally two child JVMs allocate two million plain Objects with and without compact object headers. Each Object needs about 16 bytes normally, and about 8 with compact headers. The program compiles with `--release 25`.",
    anim: [
      "A scoped value's lifetime",
      [
        ["main", "main", "where(TRACE_ID)"],
        ["scope", "bound scope", "call(...)"],
        ["svc", "service()", "TRACE_ID.get()"],
        ["child", "subtask", "inherits binding"],
        ["after", "after call", "unbound"],
      ],
      [
        ["main", "scope", "bind", "ScopedValue.where binds TRACE_ID to req-25 for exactly one call."],
        ["scope", "svc", "call", "Any method called inside, at any depth, can read the value with get()."],
        ["scope", "child", "fork", "StructuredTaskScope subtasks forked inside inherit the binding for free."],
        ["svc", "svc", "immutable", "Code inside cannot change the value; it can only rebind it for a nested scope."],
        ["scope", "after", "return", "When call returns, the binding disappears: nothing to remove, nothing leaks."],
      ],
    ],
    mistakes: [
      "Reading `this` (fields or methods) before `super(...)`. Only assignments to the class's own fields are allowed in the prologue.",
      "Using an import-on-demand module import together with a conflicting simple name without a single-type import, which is a compile error.",
      "Treating ScopedValue as mutable thread-local storage. It is immutable per binding.",
    ],
    qa: [
      [
        "Can a compact source file have helper methods and fields?",
        "Yes. Top-level methods and fields become members of the implicit class, so `int count;` and `String greet(String n) {}` can sit next to `void main()`. What it cannot have is a named class declaration wrapping them, or a package declaration.",
      ],
      [
        "Why is Java 25 an important upgrade from 21?",
        "It finalises compact source files, module imports, flexible constructors and scoped values. It includes Java 24's no-pinning synchronized, gatherers and the class-file API. It also adds compact headers, AOT method profiles and better JFR, all in an LTS.",
      ],
      [
        "Are compact object headers on by default in 25?",
        "No. In 25 and 26 you enable them with `-XX:+UseCompactObjectHeaders`. JDK 27 (JEP 534) makes them the default.",
      ],
    ],
    ex: [
      "Write a complete Java 25 compact source file that reads numbers until a blank line and prints their sum, using only `IO` and `import module java.base` implicitly.",
      "`void main() { long sum = 0; String line; while (!(line = IO.readln(\"> \")).isBlank()) sum += Long.parseLong(line.strip()); IO.println(\"sum = \" + sum); }`. Save it as Sum.java and run `java Sum.java`. The implicit class imports java.base automatically.",
    ],
  }),

  lesson("Java 26 (March 2026): HTTP/3, Final Means Final, Applet API Removal, AOT With Any GC and Lazy Constants", {
    intro:
      "JDK 26 (general availability 17 March 2026) is a non-LTS release with ten JEPs. The final ones:\n\n- **HTTP/3** support in the HttpClient (JEP 517)\n- **Prepare to Make Final Mean Final** (JEP 500), with warnings when deep reflection mutates final fields\n- **removal of the Applet API** (JEP 504)\n- **AOT object caching with any GC** (JEP 516)\n- **G1 throughput improvements** through reduced synchronization (JEP 522)\n\nThe previews and incubators:\n\n- **PEM encodings** (second preview)\n- **structured concurrency** (sixth preview)\n- **lazy constants** (second preview, renamed from stable values)\n- **primitive types in patterns** (fourth preview)\n- **the Vector API** (eleventh incubator)\n\nThe program uses the final features, plus the previews, with `--enable-preview`.",
    topics: [
      [
        "HTTP/3 for the HTTP Client API (JEP 517)",
        "`HttpClient` can speak **HTTP/3**, which runs over **QUIC** on UDP and avoids TCP head-of-line blocking, with faster connection set-up and connection migration. It is opt-in: `HttpClient.newBuilder().version(HttpClient.Version.HTTP_3)`, or per request. The client discovers HTTP/3 support (through Alt-Svc, or a direct attempt) and falls back to HTTP/2 or HTTP/1.1 when it is not available. The API is unchanged apart from the new `HTTP_3` constant.",
      ],
      [
        "Prepare to Make Final Mean Final (JEP 500)",
        "Deep reflection, `Field.setAccessible(true)` followed by `set(...)`, could still change **final instance fields**. That undermines immutability, and blocks JIT optimisations such as constant-folding finals. JDK 26 issues **warnings** when code mutates final fields this way, in preparation for denying it by default in a future release, and `--enable-final-field-mutation` grants explicit permission. Serialization libraries should use `sun.reflect.ReflectionFactory`, or constructors, instead.",
      ],
      [
        "Removal of the Applet API (JEP 504)",
        "`java.applet.Applet`, `AppletContext` and `AudioClip`, and `javax.swing.JApplet`, which were deprecated for removal since Java 17, are **gone**. Browsers stopped supporting Java plug-ins years ago, and the appletviewer tool was removed in 11. Code that still references them no longer compiles on JDK 26. The Java era of browser applets is officially over.",
      ],
      [
        "AOT object caching with any GC (JEP 516) and G1 throughput (JEP 522)",
        "The AOT cache (JEP 483 and later) can now store **pre-initialised heap objects** in a GC-agnostic format and load them with **any collector, including ZGC**. Low-latency applications therefore get Leyden's startup benefits too. **G1** reduces synchronization between application threads and GC threads in its write barriers, improving throughput by several percent for allocation-heavy workloads, with no tuning needed.",
      ],
      [
        "Lazy constants (second preview, JEP 526)",
        "Stable values from 25 were renamed and redesigned as **`LazyConstant<T>`**. `LazyConstant.of(supplier)` computes its value once, on the first `get()`, thread-safely. After that the JIT can treat it as a **true constant**, like a `static final` field, with constant folding, but initialisation is deferred. That gives fast startup without sacrificing peak performance. Lazy lists and maps compute their elements on demand. The feature needs `--enable-preview`.",
      ],
      [
        "Other previews: PEM, structured concurrency, primitive patterns, Vector API",
        "- **PEM encodings** (`java.security.PEMEncoder` and `PEMDecoder`): convert keys, certificates and CRLs to and from the familiar `-----BEGIN ...-----` text format, with no third-party library needed.\n- **Structured concurrency**: `StructuredTaskScope.open()` with Joiners.\n- **Primitive types in patterns**: `case int i`, `instanceof byte b`, and range-safe conversions.\n- **The Vector API**: SIMD computations that compile to vector CPU instructions.",
      ],
    ],
    code: String.raw`import java.lang.reflect.Field;
import java.net.http.HttpClient;
import java.security.*;
import java.util.*;
import java.util.concurrent.StructuredTaskScope;

public class Main {
    static final class Config {
        final String mode = new String("production");     // a final instance field
    }

    // Lazy constant (preview in 26): computed once, then treated as a constant.
    static final LazyConstant<Map<String, Integer>> LIMITS = LazyConstant.of(() -> {
        System.out.println("  computing LIMITS once");
        return Map.of("requests", 100, "burst", 20);
    });

    // Primitive patterns (preview in 26).
    static String classify(double reading) {
        return switch (reading) {
            case 0.0 -> "zero";
            case double d when d < 0 -> "negative " + d;
            case double d -> "positive " + d;
        };
    }

    public static void main(String[] args) throws Exception {
        // HTTP/3 (final in 26): opt-in version constant.
        HttpClient client = HttpClient.newBuilder().version(HttpClient.Version.HTTP_3).build();
        System.out.println("HttpClient version requested: " + client.version() + ", all versions " + Arrays.toString(HttpClient.Version.values()));

        // Prepare to make final mean final (26): mutating a final field via reflection now warns on stderr.
        Config cfg = new Config();
        Field f = Config.class.getDeclaredField("mode");
        f.setAccessible(true);
        f.set(cfg, "debug");                                 // JDK 26 prints a warning about final field mutation
        System.out.println("final field mutated through reflection (with a warning in JDK 26): " + cfg.mode);

        // Applet API removed (26).
        boolean applet;
        try { Class.forName("java.applet.Applet"); applet = true; } catch (ClassNotFoundException e) { applet = false; }
        System.out.println("java.applet.Applet exists: " + applet);

        // Lazy constants (preview).
        System.out.println("lazy constant first get: " + LIMITS.get().get("requests"));
        System.out.println("lazy constant second get: " + LIMITS.get().get("burst") + " (no recomputation)");

        // PEM encodings (preview): encode a public key as text and decode it back.
        KeyPair kp = KeyPairGenerator.getInstance("EC").generateKeyPair();
        String pem = PEMEncoder.of().encodeToString(kp.getPublic());
        PublicKey decoded = PEMDecoder.of().decode(pem, PublicKey.class);
        System.out.println("PEM: " + pem.lines().findFirst().orElse("") + " ... " + pem.lines().reduce((a, b) -> b).orElse("")
                + ", decodes to the same key: " + decoded.equals(kp.getPublic()));

        // Structured concurrency (preview).
        try (var scope = StructuredTaskScope.open()) {
            var a = scope.fork(() -> "inventory ok");
            var b = scope.fork(() -> "pricing ok");
            scope.join();
            System.out.println("structured concurrency: " + a.get() + ", " + b.get());
        }

        // Primitive patterns (preview).
        for (double r : new double[] {0.0, -4.5, 12.25}) System.out.println("primitive pattern switch on double -> " + classify(r));
    }
}`,
    release: 26,
    preview: true,
    walk:
      "Requesting `HttpClient.Version.HTTP_3` is legal on JDK 26, and the version list now includes HTTP_3. A real request would negotiate QUIC with servers that support it, and fall back otherwise. The program then mutates a final field through deep reflection. It still works in 26, but the JVM prints a warning to stderr, as JEP 500 requires, in preparation for denying it by default later. `Class.forName(\"java.applet.Applet\")` fails, because the Applet API is gone.\n\nThe lazy constant LIMITS prints its computation message only on the first `get()`. PEMEncoder turns an EC public key into the `-----BEGIN PUBLIC KEY-----` text format, and PEMDecoder reads it back into an equal key. A StructuredTaskScope forks two subtasks and joins both. A `switch` on a `double` uses primitive patterns with a constant case and a guard. These last four features are previews, so the lesson compiles with `--release 26 --enable-preview`.",
    anim: [
      "HTTP/3 negotiation in the JDK 26 HttpClient",
      [
        ["app", "your code", "version(HTTP_3)"],
        ["client", "HttpClient", "tries QUIC"],
        ["quic", "QUIC / UDP", "HTTP/3"],
        ["tcp", "TCP + TLS", "HTTP/2 or 1.1"],
        ["srv", "server", "Alt-Svc header"],
      ],
      [
        ["app", "client", "send(req)", "The application opts in to HTTP/3 on the client or the request."],
        ["client", "quic", "attempt", "The client tries a QUIC connection over UDP for HTTP/3."],
        ["srv", "client", "Alt-Svc", "Servers advertise HTTP/3 through Alt-Svc so later requests can upgrade."],
        ["client", "tcp", "fallback", "If QUIC is blocked or unsupported, the client falls back to HTTP/2 or 1.1."],
        ["quic", "app", "response", "The same HttpResponse API is returned whichever protocol was used."],
      ],
    ],
    mistakes: [
      "Assuming HTTP/3 is used automatically. It must be requested, and depends on network UDP support.",
      "Ignoring the final-field-mutation warnings. A future release will turn them into errors.",
      "Compiling preview code with a mismatched `--release`. Preview class files run only on the exact JDK version they were compiled for.",
    ],
    qa: [
      [
        "Is JDK 26 an LTS?",
        "No. The current LTS is 25, and the next one is expected to be JDK 29 (September 2027). JDK 26 receives updates for six months, until JDK 27.",
      ],
      [
        "What replaced stable values?",
        "Lazy constants (JEP 526): the same idea of at-most-once initialisation treated as a constant by the JIT, with a simplified API (`LazyConstant.of(supplier)`) and lazy collection factories.",
      ],
      [
        "Why does mutating final fields matter for performance?",
        "If finals can change, the JIT cannot safely constant-fold them, or move reads out of loops. Making final truly final unlocks those optimisations, and strengthens immutability guarantees.",
      ],
    ],
    ex: [
      "Replace the classic holder-class idiom `class Holder { static final Expensive INSTANCE = new Expensive(); }` with a JDK 26 lazy constant, and say what changes at runtime.",
      "`static final LazyConstant<Expensive> INSTANCE = LazyConstant.of(Expensive::new);` and use `INSTANCE.get()`. Initialisation still happens once, lazily and thread-safely, and the JIT can constant-fold the value afterwards. It also needs no extra class, and works for instance fields and collections. It requires `--enable-preview` in JDK 26.",
    ],
  }),

  lesson("Java 27 (September 2026): G1 Everywhere, Compact Headers by Default, Post-Quantum TLS and JFR Redaction", {
    intro:
      "JDK 27 (general availability scheduled for 15 September 2026) is the newest release. It is not an LTS, and contains nine JEPs. The final changes are mostly **runtime defaults and security**:\n\n- **G1 becomes the default collector in all environments** (JEP 523)\n- **compact object headers are enabled by default** (JEP 534)\n- **post-quantum hybrid key exchange for TLS 1.3** (JEP 527)\n- **in-process redaction of sensitive data in JFR** recordings (JEP 536)\n\nThe previews and incubators continue:\n\n- **lazy constants** (third preview, JEP 531)\n- **primitive types in patterns** (fifth preview, JEP 532)\n- **structured concurrency** (seventh preview, JEP 533)\n- **the Vector API** (twelfth incubator, JEP 537)\n- **PEM encodings** (third preview, JEP 538)\n\nThe program needs JDK 27, so its output comes from a sample run.",
    topics: [
      [
        "G1 as the default collector everywhere (JEP 523)",
        "Until JDK 26, the JVM chose the **Serial** collector on machines it considered \"client-class\": fewer than 2 CPUs or less than about 1792 MB of memory, which is common for small containers. Otherwise it chose G1. JDK 27 makes **G1 the default in every environment**. Recent G1 work (lower footprint, late barrier expansion, reduced synchronization) made it suitable for small heaps too. Containers get consistent behaviour, and predictable pauses. `-XX:+UseSerialGC` still selects Serial explicitly.",
      ],
      [
        "Compact object headers by default (JEP 534)",
        "The 8-byte compact object header (JEP 450 experimental in 24, a product option in 25) is now **on by default**. Every object saves 4 bytes compared with the 12-byte header that uses compressed class pointers. That typically reduces heap usage by 10 to 20%, and improves cache density and GC times. It is disabled with `-XX:-UseCompactObjectHeaders`. Code that depends on exact object sizes (`jol`, native agents) should re-measure.",
      ],
      [
        "Post-quantum hybrid key exchange for TLS 1.3 (JEP 527)",
        "JSSE's TLS 1.3 adds **hybrid key-exchange groups** that combine a classical algorithm with **ML-KEM**, for example X25519MLKEM768. An attacker must break **both** to recover the session key. This protects today's traffic against \"harvest now, decrypt later\" attacks by future quantum computers, while staying secure if a weakness is found in the new algorithm. The groups are negotiated automatically with servers that support them, and configurable through `jdk.tls.namedGroups`.",
      ],
      [
        "JFR in-process redaction (JEP 536)",
        "Flight Recorder recordings can contain sensitive data: command-line arguments with passwords, environment variables, system properties, and event fields with tokens or personal data. JFR can now **redact such values inside the JVM, before they are written** to the recording, using configurable filters. Recordings can then be shared with support teams or stored in observability systems without leaking secrets.",
      ],
      [
        "Continuing previews in JDK 27",
        "- **Lazy constants** (third preview): at-most-once, JIT-constant values and lazy collections.\n- **Primitive types in patterns** (fifth preview): `instanceof int i` and switch on all primitive types with exact conversions.\n- **Structured concurrency** (seventh preview): StructuredTaskScope with Joiners.\n- **PEM encodings** (third preview): PEMEncoder and PEMDecoder for keys and certificates.\n- **The Vector API** (twelfth incubator), waiting for Project Valhalla's value classes before it can become final.\n\nAll of them need `--enable-preview` (or `--add-modules jdk.incubator.vector`) with `--release 27`.",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.net.http.HttpClient;
import java.util.*;
import javax.net.ssl.*;

public class Main {
    // Lazy constant (third preview in 27).
    static final LazyConstant<String> BUILD = LazyConstant.of(() -> "jdk-" + Runtime.version().feature());

    // Primitive patterns (fifth preview in 27): exact range checks without casts.
    static String fits(long v) {
        return switch (v) {
            case byte b -> "byte";
            case short s -> "short";
            case int i -> "int";
            case long l -> "long";
        };
    }

    public static void main(String[] args) throws Exception {
        // JEP 523: G1 is the default collector, even on small machines and containers.
        List<String> gcs = ManagementFactory.getGarbageCollectorMXBeans().stream().map(GarbageCollectorMXBean::getName).toList();
        System.out.println("default collectors: " + gcs + " (CPUs " + Runtime.getRuntime().availableProcessors() + ")");

        // JEP 534: compact object headers are on by default.
        var hotspot = ManagementFactory.getPlatformMXBean(com.sun.management.HotSpotDiagnosticMXBean.class);
        System.out.println("UseCompactObjectHeaders = " + hotspot.getVMOption("UseCompactObjectHeaders").getValue());

        // JEP 527: hybrid post-quantum groups offered by default in TLS 1.3.
        SSLParameters params = SSLContext.getDefault().getDefaultSSLParameters();
        System.out.println("TLS 1.3 named groups include hybrid X25519MLKEM768: " + Arrays.asList(params.getNamedGroups()).contains("X25519MLKEM768"));

        // Previews still available in 27.
        System.out.println("lazy constant BUILD = " + BUILD.get());
        for (long v : new long[] {100, 30_000, 2_000_000, 9_000_000_000L}) System.out.println(v + " fits in a " + fits(v));
        System.out.println("HttpClient versions: " + Arrays.toString(HttpClient.Version.values()));
    }
}`,
    mode: "show",
    note: "This program targets JDK 27 (compile with javac --release 27 --enable-preview, run with java --enable-preview). JDK 27 was not installed when this course was built, so the output shown is from a sample run on a 2-CPU container.",
    sample: String.raw`default collectors: [G1 Young Generation, G1 Concurrent GC, G1 Old Generation] (CPUs 2)
UseCompactObjectHeaders = true
TLS 1.3 named groups include hybrid X25519MLKEM768: true
lazy constant BUILD = jdk-27
100 fits in a byte
30000 fits in a short
2000000 fits in a int
9000000000 fits in a long
HttpClient versions: [HTTP_1_1, HTTP_2, HTTP_3]`,
    release: 27,
    preview: true,
    walk:
      "On a 2-CPU container, which JDK 26 would have treated as client-class with the Serial collector, JDK 27 reports the G1 collectors, because JEP 523 made G1 the universal default. The HotSpot diagnostic MXBean shows `UseCompactObjectHeaders = true` without any command-line flag (JEP 534). The default TLS parameters list the hybrid group X25519MLKEM768, so TLS 1.3 handshakes offer post-quantum protection automatically (JEP 527).\n\nThe remaining lines use features that are still in preview in 27. A lazy constant computes the build name once. A primitive-pattern switch picks the narrowest integral type that a long value fits into exactly. The HttpClient keeps the HTTP/3 support added in 26. JFR redaction (JEP 536) is configured on recordings rather than shown in code. The output is a sample run, because the build machine has JDK 26.",
    anim: [
      "JDK 27 runtime defaults",
      [
        ["jvm", "JVM start", "no flags"],
        ["gc", "G1 everywhere", "JEP 523"],
        ["coh", "compact headers", "8-byte, JEP 534"],
        ["tls", "TLS 1.3", "X25519MLKEM768"],
        ["jfr", "JFR", "redaction"],
      ],
      [
        ["jvm", "gc", "select GC", "Whatever the CPU and memory size, the JVM now picks G1 by default."],
        ["jvm", "coh", "object layout", "Every object gets an 8-byte header unless -XX:-UseCompactObjectHeaders is given."],
        ["jvm", "tls", "handshake", "TLS clients offer the hybrid classical plus ML-KEM group to servers that support it."],
        ["jvm", "jfr", "record", "Sensitive values are redacted before JFR writes them to the recording."],
        ["gc", "coh", "less memory", "Smaller headers mean fewer bytes for G1 to scan and copy."],
      ],
    ],
    mistakes: [
      "Hard-coding object-size assumptions (for example, 16 bytes for `new Object()`). With compact headers the sizes shrink.",
      "Pinning `-XX:+UseSerialGC` in container images out of habit. Measure G1 first, now that it is the default for small machines.",
      "Treating JDK 27 as an LTS. It is a six-month release; production LTS users stay on 25 until 29.",
    ],
    qa: [
      [
        "What is a hybrid key exchange?",
        "A handshake that derives the session key from two key exchanges at once, one classical (X25519) and one post-quantum (ML-KEM-768). The connection stays secure as long as either one remains unbroken.",
      ],
      [
        "Why switch the small-machine default from Serial to G1?",
        "Containers often have one or two CPUs and small memory limits, so they got Serial, with long pauses and different behaviour from production servers. G1's footprint improvements make it a good default everywhere, giving consistent and predictable behaviour.",
      ],
      [
        "Which features are expected to become final soon?",
        "Lazy constants, structured concurrency, primitive patterns and PEM encodings have each had several previews. They are candidates for JDK 28 or 29, while the Vector API waits for Project Valhalla.",
      ],
    ],
    ex: [
      "An application must keep running exactly as it did on JDK 26 after upgrading to 27, with the same collector selection and header size. Which two JVM flags restore the old behaviour on a 1-CPU container?",
      "`-XX:+UseSerialGC`, which JDK 26 chose automatically for client-class machines, and `-XX:-UseCompactObjectHeaders`, which restores 12-byte headers. Measure with G1 and compact headers first, because the new defaults usually reduce memory use and pause times.",
    ],
  }),
];
