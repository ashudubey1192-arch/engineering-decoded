import { lesson, section } from "../schema.js";

// Interview Q&A: additional frequently asked questions not covered by the earlier sets.
export default section("interview-additional", "Interview Q&A: Additional Frequently Asked Questions", [
  lesson("Additional Q1-Q10: JVM Memory, Class Loading, GC Roots, Leaks and the JIT", {
    intro:
      "These additional questions fill the gaps that interviewers probe after the classic sets:\n\n- the JVM memory areas, stack vs heap, and metaspace vs PermGen\n- class loaders and parent delegation\n- GC roots\n- strong, soft, weak and phantom references\n- memory leaks in Java\n- the JIT and escape analysis\n- the String pool's location\n- OutOfMemoryError types\n\nThe program inspects its own JVM through the management API and demonstrates reference types.",
    topics: [
      [
        "AQ1. What are the JVM runtime memory areas?",
        "- **Heap**: shared by all threads, it holds every object and array, and is managed by the GC. HotSpot splits it into a young generation (eden and survivors) and an old generation, or into regions for G1, ZGC and Shenandoah.\n- **Metaspace** (native memory, Java 8+): class metadata, method bytecode and the constant pools.\n- **JVM stacks**: one per thread, made of frames holding locals and partial results.\n- **PC register**: one per thread.\n- **Native method stacks**.\n- **Code cache**: JIT-compiled machine code.\n- **Direct memory**: native buffers used by NIO (`ByteBuffer.allocateDirect`).\n\nThe heap is sized with `-Xms` and `-Xmx`, metaspace with `-XX:MaxMetaspaceSize`, and stacks with `-Xss`.",
      ],
      [
        "AQ2. What is the difference between stack and heap memory?",
        "The **stack** is per thread. It is LIFO, holds method frames with their primitive locals and object **references**, and is allocated and freed automatically on method entry and exit. It is very fast and small (around 1 MB), and running out gives StackOverflowError. The **heap** is shared by all threads, holds the **objects** themselves, and is reclaimed by the garbage collector when objects become unreachable. It is large, and running out gives OutOfMemoryError: Java heap space. Escape analysis can let the JIT avoid allocating short-lived objects on the heap at all, through scalar replacement.",
      ],
      [
        "AQ3. What is the difference between Metaspace and PermGen?",
        "Before Java 8, class metadata lived in **PermGen**, a fixed-size part of the heap (`-XX:MaxPermSize`). Frequent redeploys and many classes caused `OutOfMemoryError: PermGen space`. Java 8 replaced it with **Metaspace** in **native memory**. It grows automatically, and is capped only by `-XX:MaxMetaspaceSize` (unlimited by default). Interned strings and static fields moved to the heap in Java 7 and 8. Class-loader leaks now show up as `OutOfMemoryError: Metaspace`.",
      ],
      [
        "AQ4. What are class loaders, and what is parent delegation?",
        "Class loaders load class bytes and define classes at runtime. The hierarchy (Java 9+) is: the **bootstrap** loader (native; it loads `java.base` and the core modules), the **platform** loader (other JDK modules), and the **application** (system) loader (the classpath and module path). Custom loaders sit below these. Under **parent delegation**, a loader first asks its parent, and defines the class itself only if the parent cannot find it. This guarantees that core classes such as `java.lang.String` always come from the bootstrap loader, and cannot be replaced. A class's identity is its name **plus** its defining loader, which is why the same class loaded twice causes ClassCastException.",
      ],
      [
        "AQ5. What are GC roots?",
        "GC roots are the starting points of the reachability analysis:\n\n- local variables and operands in the frames of live threads\n- static fields of loaded classes\n- JNI references\n- monitors held by synchronization\n- the live threads themselves\n- some JVM-internal references\n\nAn object is **live** if a chain of strong references leads to it from a root. Everything else is garbage, even when objects reference each other in a cycle. That is why Java does not need reference counting, and why cycles are no problem.",
      ],
      [
        "AQ6. What are strong, soft, weak and phantom references?",
        "- **Strong**: a normal reference. The object is never collected while it is strongly reachable.\n- **SoftReference**: cleared only when memory is **low**, so it suits memory-sensitive caches.\n- **WeakReference**: cleared at the **next GC** once only weak references remain. It is the basis of WeakHashMap and of canonicalising maps.\n- **PhantomReference**: `get()` always returns null. It is enqueued after the object is finalised and before its memory is reclaimed, and is used with a ReferenceQueue for post-mortem cleanup. `java.lang.ref.Cleaner` builds on it.\n\nAll the reference kinds can be registered with a **ReferenceQueue**, to learn when they are cleared.",
      ],
      [
        "AQ7. How can memory leak in Java?",
        "The garbage collector frees only unreachable objects, so a Java leak is an **unintentionally reachable** object. Common causes:\n\n- static collections or caches that only grow\n- listeners and callbacks that are never removed\n- ThreadLocals not removed in pooled threads\n- inner (non-static) classes holding their outer instance\n- unclosed resources\n- class-loader leaks on redeploy\n- `String.intern` abuse\n- keys in a HashMap that are mutated after insertion\n- unbounded queues\n\nDiagnose with a heap dump (`jcmd <pid> GC.heap_dump` or `-XX:+HeapDumpOnOutOfMemoryError`) analysed in Eclipse MAT or VisualVM. Look at dominator trees and the paths to GC roots.",
      ],
      [
        "AQ8. What is the JIT compiler, and what is escape analysis?",
        "The HotSpot JVM starts by **interpreting** bytecode and profiles which methods and loops are hot. **Tiered compilation** first compiles hot code with C1, which compiles quickly with light optimisation, then recompiles the hottest code with C2 (or Graal), which applies aggressive optimisation guided by the profile. The optimisations include inlining, loop unrolling, constant folding, devirtualisation, lock elision, and **escape analysis**. Escape analysis proves that an object never leaves a method or thread, so the JVM can skip allocating it (scalar replacement) and drop its locks. Code that turns out wrong for new types is **deoptimised**, back to the interpreter. That is why Java needs warm-up before peak performance, and why AOT caches (JEP 483, 514, 515) shorten it.",
      ],
      [
        "AQ9. Where is the String pool stored?",
        "Since **Java 7** the string pool (the intern table) lives in the **main heap**. Before that it was in PermGen. Pooled strings are therefore collected like any other object when they are no longer referenced. The table itself is a fixed-size hash table inside the JVM, tunable with `-XX:StringTableSize`. String literals from class files are interned when they are resolved, and `intern()` adds runtime strings. G1 and other collectors can also **deduplicate** the character arrays of equal strings (`-XX:+UseStringDeduplication`), which is a different mechanism from interning.",
      ],
      [
        "AQ10. What kinds of OutOfMemoryError exist?",
        "- `Java heap space`: the heap is full of live objects (a leak, or an `-Xmx` that is too small).\n- `GC overhead limit exceeded`: more than 98% of the time is spent in GC while recovering very little memory.\n- `Metaspace`: too many classes, or a class-loader leak.\n- `Direct buffer memory`: NIO direct buffers exceed `-XX:MaxDirectMemorySize`.\n- `unable to create native thread`: the OS thread limit or native memory is exhausted.\n- `Requested array size exceeds VM limit`.\n- `Compressed class space`.\n- `Out of swap space` or a native allocation failure.\n\nEach has a different fix, so read the message, and enable `-XX:+HeapDumpOnOutOfMemoryError`.",
      ],
    ],
    code: String.raw`import java.lang.management.*;
import java.lang.ref.*;
import java.util.*;

public class Main {
    static final List<byte[]> LEAK = new ArrayList<>();       // AQ7: a static root that only grows

    public static void main(String[] args) throws Exception {
        // AQ1 + AQ3: memory pools of this JVM (names vary by collector).
        Set<String> kinds = new TreeSet<>();
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) kinds.add(pool.getType() + ":" + (pool.getName().contains("Metaspace") ? "Metaspace" : pool.getName().contains("CodeHeap") || pool.getName().contains("Code") ? "Code cache" : "other"));
        System.out.println("AQ1 memory pool kinds: " + kinds);
        MemoryUsage heap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        System.out.println("AQ1 heap max is set: " + (heap.getMax() > 0) + ", non-heap (metaspace, code) used > 0: "
                + (ManagementFactory.getMemoryMXBean().getNonHeapMemoryUsage().getUsed() > 0));

        // AQ2: deep recursion overflows the stack, not the heap.
        try { recurse(0); } catch (StackOverflowError e) { System.out.println("AQ2 StackOverflowError: the thread stack is small and per thread"); }

        // AQ4: parent delegation - core classes come from the bootstrap loader (null).
        System.out.println("AQ4 String loader: " + String.class.getClassLoader()
                + ", java.sql loader: " + java.sql.Connection.class.getClassLoader().getName()
                + ", Main loader: " + Main.class.getClassLoader().getName()
                + ", app parent: " + Main.class.getClassLoader().getParent().getName());

        // AQ5 + AQ6: reference strengths.
        Object strong = new Object();
        WeakReference<Object> weak = new WeakReference<>(new Object());
        SoftReference<byte[]> soft = new SoftReference<>(new byte[1024]);
        ReferenceQueue<Object> queue = new ReferenceQueue<>();
        PhantomReference<Object> phantom = new PhantomReference<>(new Object(), queue);
        for (int i = 0; i < 10 && weak.get() != null; i++) { System.gc(); Thread.sleep(20); }
        System.out.println("AQ6 strong kept: " + (strong != null) + ", weak cleared after GC: " + (weak.get() == null)
                + ", soft kept (memory not low): " + (soft.get() != null) + ", phantom.get() always null: " + (phantom.get() == null));

        // AQ7: a static list keeps 10 MB reachable from a GC root.
        for (int i = 0; i < 10; i++) LEAK.add(new byte[1024 * 1024]);
        System.gc();
        System.out.println("AQ7 static list still holds " + LEAK.size() + " MB after GC (reachable = not garbage)");
        LEAK.clear();

        // AQ8: JIT compiler information.
        CompilationMXBean jit = ManagementFactory.getCompilationMXBean();
        System.out.println("AQ8 JIT present: " + (jit != null) + (jit != null ? ", name contains HotSpot or Graal: " + (jit.getName().contains("HotSpot") || jit.getName().contains("Graal")) : ""));

        // AQ9: interned strings are ordinary heap objects that are shared.
        String a = new String("pooled-demo").intern();
        System.out.println("AQ9 interned == literal: " + (a == "pooled-demo"));

        // AQ10: the message tells you which OOM it is.
        try { long[] tooBig = new long[Integer.MAX_VALUE]; }
        catch (OutOfMemoryError e) { System.out.println("AQ10 OutOfMemoryError: " + (e.getMessage().contains("heap") || e.getMessage().contains("VM limit") ? "heap / array size message" : e.getMessage())); }
    }

    static int recurse(int n) { return recurse(n + 1) + 1; }
}`,
    walk:
      "AQ1 asks the MemoryPoolMXBeans for this JVM's pools. There are heap pools, which the program labels \"other\", plus the non-heap pools: Metaspace and the code cache. It also confirms that the heap has a maximum. The pool names depend on the collector, so the program groups them by kind. AQ2's unbounded recursion overflows the thread stack. AQ4 shows parent delegation at work: String comes from the bootstrap loader (printed as null), `java.sql` from the platform loader, and Main from the app loader, whose parent is the platform loader.\n\nAQ6 creates all four reference strengths. After a GC, the weak referent is cleared. The soft one survives, because memory is not low. `phantom.get()` is always null. AQ7 shows that 10 MB held by a static list survives GC, because it is reachable from a root, which is how real leaks look. AQ8 confirms that a JIT compiler is present. AQ9 shows that an interned string is the same object as the literal. AQ10 provokes an OutOfMemoryError and reports the kind from its message.",
    anim: [
      "Reachability from GC roots",
      [
        ["roots", "GC roots", "stacks, statics"],
        ["live", "live objects", "reachable"],
        ["weak", "weakly held", "WeakReference"],
        ["dead", "garbage", "unreachable"],
        ["gc", "collector", "mark + reclaim"],
      ],
      [
        ["roots", "live", "strong refs", "Marking starts from the roots and follows every strong reference."],
        ["live", "live", "graph walk", "Everything reachable is marked live, including LEAK's 10 MB of arrays."],
        ["roots", "weak", "weak only", "Objects reachable only through WeakReferences are not marked live."],
        ["gc", "weak", "clear + enqueue", "The collector clears the weak references and enqueues them if registered."],
        ["gc", "dead", "reclaim", "Unmarked objects, including unreachable cycles, are reclaimed."],
      ],
    ],
    varies: true,
    mistakes: [
      "Thinking Java cannot leak memory. Reachable but unused objects are leaks.",
      "Using SoftReference caches as the main cache. Prefer a bounded cache library with explicit eviction.",
      "Tuning `-Xmx` before checking for a leak with a heap dump.",
    ],
    qa: [
      [
        "Why does `String.class.getClassLoader()` return null?",
        "Classes loaded by the bootstrap loader report a null class loader, because the bootstrap loader is implemented natively, not as a Java object.",
      ],
      [
        "What does `-XX:+HeapDumpOnOutOfMemoryError` do?",
        "When an OutOfMemoryError occurs, the JVM writes an `.hprof` heap dump, optionally to `-XX:HeapDumpPath`, which you can analyse afterwards to find what filled the heap.",
      ],
      [
        "Can you force garbage collection?",
        "No. `System.gc()` and `Runtime.gc()` are requests the JVM may ignore, and `-XX:+DisableExplicitGC` disables them completely.",
      ],
    ],
    ex: [
      "An application's heap grows after every hot redeploy in Tomcat until it fails with OutOfMemoryError: Metaspace. What is the likely cause, and how do you confirm it?",
      "A class-loader leak. Something outside the web app (a JDBC driver registered in DriverManager, a ThreadLocal on a container thread, a static cache in a shared library, a thread that is still running) keeps a reference to the old web-app class loader. All its classes then stay in metaspace. Confirm it with a heap dump: find multiple WebappClassLoader instances, and follow the path to GC roots of the old ones.",
    ],
  }),

  lesson("Additional Q11-Q20: Generics, Type Erasure, Strings, Wrappers and equals Pitfalls", {
    intro:
      "This group covers the language questions that follow the basics:\n\n- what generics give you, and type erasure\n- bounded types and wildcards\n- why `new T()` is impossible\n- String immutability and compact strings\n- `+` concatenation inside loops\n- the Integer cache and autoboxing traps\n- `BigDecimal` for money\n- `char` and code points\n\nThe program demonstrates each pitfall with real output.",
    topics: [
      [
        "AQ11. What are generics, and what problems do they solve?",
        "Generics (Java 5) let classes, interfaces and methods take **type parameters**: `List<String>`, `Map<K, V>`, `<T extends Comparable<T>> T max(List<T>)`. They give **compile-time type safety**, because adding an Integer to a `List<String>` is a compile error instead of a ClassCastException later. They also remove **casts** (`String s = list.get(0)`), and let you write **reusable algorithms** that work for many types. They are implemented by **type erasure**, so there is no runtime cost, and old non-generic code (raw types) still interoperates.",
      ],
      [
        "AQ12. What is type erasure?",
        "The compiler checks the generic types, then **erases** them. Type parameters are replaced by their bound (Object, or the first bound), casts are inserted where values come out, and **bridge methods** are generated to keep overriding working. At runtime, `List<String>` and `List<Integer>` are the same class, `ArrayList`. The consequences:\n\n- no `new T()` or `new T[]`\n- no `instanceof List<String>` (only `List<?>`)\n- no primitive type arguments\n- no overloading `m(List<String>)` with `m(List<Integer>)`, because they would have the same erasure\n- static fields are shared by all parameterisations\n\nThe generic information does survive in class files for declarations (fields, method signatures, superclasses), and reflection can read it there.",
      ],
      [
        "AQ13. What are bounded type parameters and wildcards?",
        "A **bounded type parameter** restricts what T can be: `<T extends Number>` lets the code call `t.doubleValue()`, and `<T extends Comparable<? super T>>` allows comparisons. Several bounds are joined with `&`: `<T extends Number & Comparable<T>>`. **Wildcards** describe unknown types at the point of use:\n\n- `List<?>` is a list of something.\n- `List<? extends Number>` is a list of some subtype of Number, which you can read from (a producer).\n- `List<? super Integer>` is a list of some supertype of Integer, which you can add Integers to (a consumer).\n\nThe rule of thumb is **PECS: Producer Extends, Consumer Super**, as in `Collections.copy(List<? super T> dest, List<? extends T> src)`.",
      ],
      [
        "AQ14. Why can't you write new T() or new T[n]?",
        "Because of erasure, the runtime does not know what T is. The fixes are to pass the information explicitly:\n\n- a `Class<T>`, then `type.getDeclaredConstructor().newInstance()` and `(T[]) Array.newInstance(type, n)`\n- a `Supplier<T>` factory (`create(ArrayList::new)`), the cleanest option\n- an `IntFunction<T[]>` array generator, as in `stream.toArray(String[]::new)`\n\nA generic array can be faked with `(T[]) new Object[n]` inside a class that never exposes it, as ArrayList does. Exposing such an array causes ClassCastException at the call site.",
      ],
      [
        "AQ15. Why is String immutable, and what are compact strings?",
        "String is immutable (its state is final and private, and the class is final) for several reasons: **security** (paths, URLs and class names cannot be changed after they are checked), the **string pool** (sharing is safe), **thread safety**, and **hash caching** (the hash is computed once, which makes strings fast HashMap keys). Since **Java 9, compact strings** (JEP 254) store text in a `byte[]` plus a coder flag. Strings that contain only Latin-1 characters use **one byte per char**, and others use UTF-16 (two bytes per char). This roughly halves the memory of typical strings without any API change.",
      ],
      [
        "AQ16. Is + concatenation slow?",
        "A single expression such as `a + b + c` is compiled efficiently: since Java 9 through `invokedynamic` with `StringConcatFactory`, and before that into one StringBuilder. **Inside a loop**, though, `s = s + x` creates a new String every iteration, copying everything so far, which is **O(n²)**. Use one `StringBuilder` (or `StringJoiner`, `String.join`, or `Collectors.joining`) and append inside the loop. Compile-time constants such as `\"a\" + \"b\"` are folded into a single literal.",
      ],
      [
        "AQ17. What is the Integer cache, and which autoboxing traps exist?",
        "`Integer.valueOf(int)` (used by autoboxing) returns **cached instances for -128 to 127**. The upper bound can be raised with `-XX:AutoBoxCacheMax`. So `Integer a = 127, b = 127; a == b` is true, but for 128 it is **false**: always compare wrappers with `equals`. Other traps:\n\n- unboxing a null Integer throws **NullPointerException**\n- `list.remove(1)` on a `List<Integer>` removes **index** 1, not the value 1\n- the ternary `cond ? 1 : null` mixes int and Integer, so it unboxes and can throw an NPE\n- boxing inside hot loops creates garbage\n\nByte, Short, Long and Character have similar caches; Float and Double have none.",
      ],
      [
        "AQ18. Why use BigDecimal for money?",
        "`double` and `float` are **binary floating point**, so most decimal fractions (0.1, 0.2) cannot be represented exactly: `0.1 + 0.2` gives `0.30000000000000004`, and rounding errors accumulate. `BigDecimal` stores an unscaled integer plus a scale, so decimal values are exact. Rules:\n\n- construct it from a **String** or with `BigDecimal.valueOf(double)`, never `new BigDecimal(0.1)`, which captures the binary error\n- give division a scale and a RoundingMode, or it throws ArithmeticException for non-terminating results\n- compare values with `compareTo`, because `equals` also compares the scale (2.0 vs 2.00)\n\nAlternatively, use a long amount in the smallest currency unit (paise or cents).",
      ],
      [
        "AQ19. What is the difference between char, code point and grapheme?",
        "A Java `char` is a **16-bit UTF-16 code unit**. Characters outside the Basic Multilingual Plane, such as emoji and some CJK characters, need **two chars** (a surrogate pair), so `\"😀\".length()` is 2. A **code point** is the Unicode number of a character. Use `codePointCount`, `codePointAt`, `codePoints()` and `Character.toChars` to handle full characters. A **grapheme cluster** is what a user sees as one character, which can be several code points (e.g. an emoji with a skin-tone modifier, or a letter with combining accents). `BreakIterator` or regex `\\X` find those. String reversal, truncation and length checks must take this into account.",
      ],
      [
        "AQ20. What are the common equals and hashCode pitfalls in practice?",
        "- Overloading `equals(MyType)` instead of overriding `equals(Object)`.\n- Mutable fields in hashCode.\n- Inheritance breaking symmetry.\n- Comparing arrays with equals (it is identity; use `Arrays.equals`).\n- `BigDecimal.equals` being scale-sensitive.\n- `URL.equals` doing **DNS lookups**.\n- Comparing different numeric wrapper types (`Long.valueOf(1).equals(1)` is false, because 1 is an Integer).\n- JPA entities whose id is null before persisting.\n- Using `==` on enums is fine, but `==` on strings is not.\n\nRecords and IDE-generated methods avoid most of these.",
      ],
    ],
    code: String.raw`import java.lang.reflect.*;
import java.math.*;
import java.util.*;
import java.util.function.*;

public class Main {

    // AQ13: a bounded type parameter.
    static <T extends Comparable<? super T>> T max(List<? extends T> items) {
        T best = items.get(0);
        for (T t : items) if (t.compareTo(best) > 0) best = t;
        return best;
    }

    // AQ14: create T values and T arrays without new T().
    static <T> List<T> fill(Supplier<T> factory, int n) {
        List<T> out = new ArrayList<>();
        for (int i = 0; i < n; i++) out.add(factory.get());
        return out;
    }
    @SuppressWarnings("unchecked") static <T> T[] newArray(Class<T> type, int n) { return (T[]) Array.newInstance(type, n); }

    // AQ12: generic info survives on declarations.
    static List<String> declared;

    public static void main(String[] args) throws Exception {
        // AQ11 + AQ12: erasure - same runtime class.
        List<String> strings = new ArrayList<>();
        List<Integer> ints = new ArrayList<>();
        System.out.println("AQ12 same class at runtime: " + (strings.getClass() == ints.getClass())
                + ", declared field type still known: " + Main.class.getDeclaredField("declared").getGenericType());

        // AQ13
        System.out.println("AQ13 max(ints) = " + max(List.of(3, 9, 4)) + ", max(strings) = " + max(List.of("pear", "apple")));

        // AQ14
        List<StringBuilder> builders = fill(StringBuilder::new, 3);
        String[] array = newArray(String.class, 2);
        System.out.println("AQ14 Supplier made " + builders.size() + " objects, Array.newInstance made " + array.getClass().getSimpleName() + " of length " + array.length);

        // AQ15: immutability.
        String s = "java";
        String t = s.toUpperCase();
        System.out.println("AQ15 original unchanged: " + s + " -> new " + t);

        // AQ16: loop concatenation vs StringBuilder.
        long t0 = System.nanoTime();
        String slow = "";
        for (int i = 0; i < 20_000; i++) slow += "x";
        long slowMs = (System.nanoTime() - t0) / 1_000_000;
        t0 = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 20_000; i++) sb.append("x");
        long fastMs = (System.nanoTime() - t0) / 1_000_000;
        System.out.println("AQ16 same length " + (slow.length() == sb.length()) + ", StringBuilder at least as fast: " + (fastMs <= slowMs));

        // AQ17: Integer cache and unboxing traps.
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println("AQ17 127 == 127 " + (a == b) + ", 128 == 128 " + (c == d) + ", 128 equals 128 " + c.equals(d));
        Integer missing = null;
        try { int x = missing; } catch (NullPointerException e) { System.out.println("AQ17 unboxing null -> NullPointerException"); }
        List<Integer> nums = new ArrayList<>(List.of(10, 1, 20));
        nums.remove(1);                                              // index 1
        System.out.println("AQ17 remove(1) on [10, 1, 20] -> " + nums);

        // AQ18: money.
        System.out.println("AQ18 0.1 + 0.2 as double = " + (0.1 + 0.2) + ", as BigDecimal = " + new BigDecimal("0.1").add(new BigDecimal("0.2")));
        System.out.println("AQ18 new BigDecimal(0.1) = " + new BigDecimal(0.1).toString().substring(0, 22) + "..., valueOf(0.1) = " + BigDecimal.valueOf(0.1));
        System.out.println("AQ18 10 / 3 with scale 2 HALF_UP = " + BigDecimal.TEN.divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP)
                + ", 2.0 equals 2.00: " + new BigDecimal("2.0").equals(new BigDecimal("2.00")) + ", compareTo == 0: " + (new BigDecimal("2.0").compareTo(new BigDecimal("2.00")) == 0));

        // AQ19: chars vs code points.
        String emoji = "hi😀";
        System.out.println("AQ19 length() " + emoji.length() + ", code points " + emoji.codePointCount(0, emoji.length())
                + ", StringBuilder.reverse keeps surrogate pairs: " + new StringBuilder(emoji).reverse().toString().equals(reverseCodePoints(emoji)));

        // AQ20: equals pitfalls.
        System.out.println("AQ20 arrays equals " + new int[] {1}.equals(new int[] {1}) + ", Arrays.equals " + Arrays.equals(new int[] {1}, new int[] {1})
                + ", Long(1).equals(1) " + Long.valueOf(1).equals(1));
    }

    static String reverseCodePoints(String text) {
        int[] cps = text.codePoints().toArray();
        StringBuilder out = new StringBuilder();
        for (int i = cps.length - 1; i >= 0; i--) out.appendCodePoint(cps[i]);
        return out.toString();
    }
}`,
    walk:
      "AQ12 shows that `List<String>` and `List<Integer>` share one runtime class, while reflection can still read the generic type of a declared field. AQ13's bounded method finds the maximum of Integers and of Strings. AQ14 creates objects through a Supplier and an array through `Array.newInstance`, the standard workarounds for `new T()`.\n\nAQ16 builds a 20,000-character string both ways, and the StringBuilder is never slower. AQ17 shows the Integer cache boundary at 127, an NPE when unboxing null, and `remove(1)` removing the element at index 1. AQ18 shows binary floating-point error, the exact BigDecimal sum, why the double constructor is wrong, division with an explicit scale, and the scale-sensitive equals. AQ19 counts 4 chars but 3 code points in \"hi😀\". `StringBuilder.reverse` handles surrogate pairs correctly, so it matches the code-point reversal. AQ20 shows that arrays compare by identity, and that `Long.equals(Integer)` is false.",
    anim: [
      "Type erasure at compile time",
      [
        ["src", "source", "List<String>"],
        ["javac", "javac", "type checks"],
        ["erase", "erasure", "List + casts"],
        ["jvm", "JVM", "one ArrayList"],
      ],
      [
        ["src", "javac", "compile", "javac checks every use of List<String>: adding an Integer is rejected here."],
        ["javac", "erase", "erase T", "Type arguments are removed; T becomes Object (or its bound)."],
        ["erase", "erase", "insert casts", "A cast (String) is inserted where values come out of the list."],
        ["erase", "jvm", "load", "At runtime there is only ArrayList: List<String> and List<Integer> are the same class."],
        ["jvm", "src", "limits", "That is why new T(), instanceof List<String> and primitives as type arguments are impossible."],
      ],
    ],
    varies: true,
    mistakes: [
      "Comparing Integer objects with `==` outside the cached range.",
      "Constructing BigDecimal from a double literal.",
      "Using raw types (`List list`), which silently disables generic type checks.",
      "Treating `String.length()` as the number of user-visible characters.",
    ],
    qa: [
      [
        "What is a bridge method?",
        "A synthetic method that the compiler generates when a class overrides a generic method with a more specific parameter type. Its erased signature forwards to the real method, so polymorphism still works after erasure.",
      ],
      [
        "What is heap pollution?",
        "When a variable of a parameterised type refers to an object of a different parameterisation, typically through raw types or generic varargs. It leads to ClassCastException far from the cause. `@SafeVarargs` documents methods that are safe.",
      ],
      [
        "Why is `char` 16 bits when Unicode needs 21?",
        "Java was designed when Unicode fitted in 16 bits (UCS-2). Supplementary characters were added later, so Java represents them as surrogate pairs of two chars (UTF-16).",
      ],
    ],
    ex: [
      "Write `static <T extends Comparable<? super T>> void sortDesc(List<T> list)` without using `Collections.reverseOrder`.",
      "`list.sort((a, b) -> b.compareTo(a));`. The `? super T` bound lets it work for types such as a subclass of a Comparable parent, for example `java.sql.Timestamp`, which is Comparable through `java.util.Date`.",
    ],
  }),

  lesson("Additional Q21-Q30: Design Patterns, SOLID, Immutability, Records vs Lombok and Common Coding Questions", {
    intro:
      "This group covers the design and coding questions that close many interviews:\n\n- SOLID\n- composition vs inheritance\n- the Builder, Factory, Strategy and Observer patterns in modern Java\n- dependency injection\n- records vs Lombok\n- defensive copying\n- the Optional anti-patterns\n- three classic coding tasks: reversing words, finding the first non-repeating character, and grouping anagrams\n\nThe program implements each pattern and coding answer compactly.",
    topics: [
      [
        "AQ21. What are the SOLID principles?",
        "- **S, single responsibility**: a class should have one reason to change.\n- **O, open/closed**: open for extension and closed for modification, for example by adding new Strategy implementations instead of editing a switch.\n- **L, Liskov substitution**: subtypes must be usable anywhere their supertype is, without surprises. The square/rectangle problem is the classic violation.\n- **I, interface segregation**: many small, focused interfaces are better than one fat one.\n- **D, dependency inversion**: depend on abstractions, not concretions. High-level code takes an interface, and the wiring supplies the implementation, for example through dependency injection.",
      ],
      [
        "AQ22. Should you prefer composition or inheritance?",
        "Prefer **composition**: a class *has* collaborators and delegates to them. Inheritance exposes the parent's implementation details, and changes in the parent can break subclasses (the fragile base class problem). It is fixed at compile time, and a class can extend only one parent. Composition lets you swap behaviour at runtime, combine several behaviours, and test with fakes. Use inheritance for genuine **is-a** relationships, designed for extension: abstract classes or sealed hierarchies. Effective Java's example is `InstrumentedHashSet` extending HashSet, which double-counts because `addAll` calls `add`. Wrapping the set (a forwarding decorator) fixes it.",
      ],
      [
        "AQ23. How do you implement the Builder pattern?",
        "Use a builder when a class has many optional parameters. A static nested `Builder` has fluent setters that return `this`, and a `build()` method that validates the values and calls a private constructor taking the builder. The result can be immutable, and the call sites are readable: `new Pizza.Builder(\"large\").cheese(true).topping(\"olive\").build()`. With records, a compact canonical constructor validates the values, and a separate builder or `with` methods add the fluency. Lombok's `@Builder` generates the code.",
      ],
      [
        "AQ24. How do you implement Factory and Strategy in modern Java?",
        "A **factory** hides which concrete class is created: a static method such as `Shape.of(\"circle\")`, or a `Map<String, Supplier<Shape>>` registry. A **strategy** encapsulates interchangeable algorithms behind an interface, such as `DiscountPolicy`, `Comparator` or `PaymentMethod`. With lambdas, a strategy is often just a functional interface value, `Function<Order, BigDecimal>`, and the factory a map of constructor references. Sealed interfaces plus a pattern-matching switch are an alternative when the set of variants is closed.",
      ],
      [
        "AQ25. How do you implement the Observer pattern?",
        "A subject keeps a list of listeners (an interface such as `PriceListener { void onChange(Price p); }`). Its methods are `addListener`, `removeListener`, and `notify`, which calls each listener in turn. Use **CopyOnWriteArrayList** for the listener list, so that listeners can be added or removed during notification and across threads. Remember to remove listeners to avoid leaks, or hold them weakly. `java.util.Observable` is deprecated. Modern alternatives are `java.util.concurrent.Flow` (reactive streams), event buses, and the frameworks' application events.",
      ],
      [
        "AQ26. What is dependency injection?",
        "Dependency injection (DI) means an object **receives** its dependencies, usually through its **constructor**, instead of creating them itself (`new MySqlRepo()` inside the class). This implements dependency inversion: the class depends on interfaces, and tests pass in fakes. A DI container (Spring, Jakarta CDI, Guice, Dagger) builds the object graph, manages scopes (singleton, request) and lifecycle, and wires the implementations by type and qualifier. Constructor injection with final fields is preferred over field injection: dependencies are explicit, the object is immutable, and it can be tested without a container.",
      ],
      [
        "AQ27. Should you use records or Lombok?",
        "**Records** (Java 16) are a language feature for **transparent, shallowly immutable data carriers**. They get final fields, a canonical constructor, accessors, equals, hashCode and toString, with no extra library and no build plugin, and they are understood by pattern matching (record patterns, Java 21). Their limits: no inheritance (they are final and implicitly extend Record), all fields are part of the API, and no mutable state. **Lombok** generates boilerplate for ordinary classes through an annotation processor: `@Data`, `@Value`, `@Builder`, `@Getter`. It covers mutable entities (JPA) and builders, but depends on compiler internals and hides code. Prefer records for DTOs and value types, and use regular classes (perhaps with Lombok) for entities.",
      ],
      [
        "AQ28. What is defensive copying?",
        "When a class stores or returns references to **mutable** objects (arrays, Lists, Dates), callers can modify its internal state behind its back. **Defensive copying** makes copies at the boundaries:\n\n- in the constructor: `this.items = List.copyOf(items)` and `this.start = new Date(start.getTime())`\n- in getters: return an unmodifiable view or a copy\n\nCopy **before** validating, to avoid a check-then-use race where another thread changes the object in between. Prefer immutable types (`List.copyOf`, `java.time`), so that no copies are needed. Records do **not** copy automatically, so add the copies in the compact constructor.",
      ],
      [
        "AQ29. What are the Optional anti-patterns?",
        "Optional was designed as a **return type** for \"might be absent\". The anti-patterns:\n\n- calling `get()` without checking (use `orElse`, `orElseGet`, `orElseThrow`, `map`, `ifPresent`)\n- `if (opt.isPresent()) opt.get()` chains instead of `map` and `orElse`\n- Optional **fields** (it is not serializable, and adds overhead)\n- Optional **parameters** (use overloads)\n- returning `null` from a method declared to return Optional\n- `Optional<List<X>>` (return an empty list instead)\n- `orElse(expensiveCall())`, which always evaluates its argument (use `orElseGet`)\n\nFor primitives, use OptionalInt, OptionalLong and OptionalDouble.",
      ],
      [
        "AQ30. Three classic coding tasks: reverse words, first non-repeating character, and group anagrams.",
        "**Reverse words**: split on whitespace (`\\\\s+`), reverse the list, and join with spaces. That is O(n).\n\n**First non-repeating character**: count characters in a `LinkedHashMap<Character, Long>` (which keeps insertion order), for example with `groupingBy(identity(), LinkedHashMap::new, counting())`, then return the first entry with count 1. It is two passes, O(n).\n\n**Group anagrams**: the key is the sorted characters of each word (`\"eat\"` becomes `\"aet\"`), and you collect with `groupingBy(key)`. That is O(n · k log k) for words of length k. A character-count key gives O(n · k).\n\nInterviewers look for the right collection, edge cases (empty input, case, Unicode), and the complexity.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.*;
import java.util.stream.*;

public class Main {

    // AQ23: Builder for an immutable class.
    static final class Pizza {
        private final String size; private final boolean cheese; private final List<String> toppings;
        private Pizza(Builder b) { size = b.size; cheese = b.cheese; toppings = List.copyOf(b.toppings); } // AQ28 defensive copy
        public String toString() { return size + (cheese ? " +cheese" : "") + " " + toppings; }
        static final class Builder {
            private final String size; private boolean cheese; private final List<String> toppings = new ArrayList<>();
            Builder(String size) { this.size = Objects.requireNonNull(size); }
            Builder cheese(boolean c) { cheese = c; return this; }
            Builder topping(String t) { toppings.add(t); return this; }
            Pizza build() { if (toppings.size() > 5) throw new IllegalStateException("too many toppings"); return new Pizza(this); }
        }
    }

    // AQ24: strategy as a functional interface + factory as a map of suppliers.
    interface Discount extends UnaryOperator<Double> { }
    static final Map<String, Supplier<Discount>> DISCOUNTS = Map.of(
            "none", () -> p -> p,
            "festive", () -> p -> p * 0.8,
            "flat50", () -> p -> Math.max(0, p - 50));

    // AQ25: observer with a thread-safe listener list.
    interface PriceListener { void onChange(String symbol, double price); }
    static final class Ticker {
        private final List<PriceListener> listeners = new CopyOnWriteArrayList<>();
        void subscribe(PriceListener l) { listeners.add(l); }
        void unsubscribe(PriceListener l) { listeners.remove(l); }
        void publish(String s, double p) { listeners.forEach(l -> l.onChange(s, p)); }
    }

    // AQ26: constructor injection of an abstraction.
    interface Repo { String find(int id); }
    record UserService(Repo repo) { String greet(int id) { return "Hello " + repo.find(id); } }

    // AQ27: a record with validation and a defensive copy.
    record Team(String name, List<String> members) {
        Team { Objects.requireNonNull(name); members = List.copyOf(members); }
    }

    public static void main(String[] args) {
        System.out.println("AQ23 " + new Pizza.Builder("large").cheese(true).topping("olive").topping("corn").build());

        for (String kind : List.of("none", "festive", "flat50"))
            System.out.println("AQ24 " + kind + " on 200 -> " + DISCOUNTS.get(kind).get().apply(200.0));

        Ticker ticker = new Ticker();
        List<String> received = new ArrayList<>();
        PriceListener logger = (s, p) -> received.add(s + "=" + p);
        ticker.subscribe(logger);
        ticker.publish("INFY", 1500.5);
        ticker.unsubscribe(logger);
        ticker.publish("INFY", 1600.0);                            // no longer received
        System.out.println("AQ25 observer received " + received);

        UserService service = new UserService(id -> "user" + id);  // a fake repository for testing
        System.out.println("AQ26 " + service.greet(7));

        List<String> source = new ArrayList<>(List.of("a", "b"));
        Team team = new Team("core", source);
        source.add("intruder");
        System.out.println("AQ27/AQ28 record copied its list: " + team.members() + ", equals by value: " + team.equals(new Team("core", List.of("a", "b"))));

        // AQ29: Optional used as intended.
        Map<String, String> emails = Map.of("ana", "ana@example.com");
        String email = Optional.ofNullable(emails.get("bob")).map(String::toUpperCase).orElse("NO EMAIL");
        System.out.println("AQ29 " + email + ", orElseGet is lazy: " + Optional.of("x").orElseGet(() -> { throw new AssertionError("not called"); }));

        // AQ30: three coding tasks.
        String sentence = "  Java   makes interviews fun ";
        List<String> words = new ArrayList<>(Arrays.asList(sentence.trim().split("\\s+")));
        Collections.reverse(words);
        System.out.println("AQ30 reversed words: " + String.join(" ", words));

        String text = "swiss";
        Character firstUnique = text.chars().mapToObj(c -> (char) c)
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
                .entrySet().stream().filter(e -> e.getValue() == 1).map(Map.Entry::getKey).findFirst().orElse(null);
        System.out.println("AQ30 first non-repeating in \"" + text + "\": " + firstUnique);

        List<String> input = List.of("eat", "tea", "tan", "ate", "nat", "bat");
        Map<String, List<String>> groups = input.stream().collect(Collectors.groupingBy(
                w -> { char[] c = w.toCharArray(); Arrays.sort(c); return new String(c); }, TreeMap::new, Collectors.toList()));
        System.out.println("AQ30 anagram groups: " + groups.values());
    }
}`,
    walk:
      "AQ23's Builder collects optional settings fluently. `build()` validates them, and the private constructor copies the toppings list, so the Pizza stays immutable. AQ24 looks up discount strategies by name in a map of Suppliers (a factory) and applies each one to 200. AQ25 subscribes a listener, publishes, unsubscribes and publishes again, and only the first event is received. AQ26 injects a fake repository, a lambda, through the record's constructor.\n\nThe Team record's compact constructor validates the name and copies the members list, so a later change to the source list does not leak in, and equality is by value (AQ27, AQ28). AQ29 maps an absent Optional to a default, and shows that `orElseGet` never calls its supplier when the value is present. AQ30 reverses words (\"fun interviews makes Java\"), finds the first non-repeating character of \"swiss\" (\"w\") with an insertion-ordered count, and groups anagrams by their sorted letters.",
    anim: [
      "Builder pattern flow",
      [
        ["client", "client code", "new Builder"],
        ["builder", "Pizza.Builder", "mutable settings"],
        ["validate", "build()", "checks rules"],
        ["pizza", "Pizza", "immutable result"],
      ],
      [
        ["client", "builder", "new Builder(large)", "Required values go into the builder's constructor."],
        ["client", "builder", "cheese().topping()", "Optional values are set fluently; each setter returns the builder."],
        ["builder", "validate", "build()", "build() validates the combination, for example the topping limit."],
        ["validate", "pizza", "private ctor", "The private constructor copies everything into final fields."],
        ["pizza", "client", "use", "The client gets an immutable Pizza; the builder can be discarded."],
      ],
    ],
    mistakes: [
      "Extending a concrete library class just to reuse code. Compose and delegate instead.",
      "Exposing a record's mutable list component without copying it in the compact constructor.",
      "Field injection with `@Autowired` on private fields, which hides dependencies and blocks immutability.",
      "Calling `Optional.get()` without checking that a value is present.",
    ],
    qa: [
      [
        "Which design patterns does the JDK itself use?",
        "Builder (`StringBuilder`, `HttpRequest.newBuilder`), Factory (`List.of`, `Calendar.getInstance`), Strategy (`Comparator`), Iterator, Decorator (`BufferedInputStream`), Adapter (`Arrays.asList`), Template Method (`AbstractList`), Observer (`Flow`), Singleton (`Runtime.getRuntime()`) and Proxy (`java.lang.reflect.Proxy`).",
      ],
      [
        "When is inheritance the right choice?",
        "For a true is-a relationship within your own code, designed and documented for extension: abstract template classes, framework base classes, or sealed hierarchies whose subtypes you control.",
      ],
      [
        "How does a record differ from Lombok's @Value?",
        "Both make immutable value classes. A record is a language construct, with fixed accessor names (`name()`), no inheritance, and support for pattern matching. `@Value` generates a regular final class with getters, needs Lombok, and can extend other classes.",
      ],
    ],
    ex: [
      "Group a list of words by length into a `TreeMap<Integer, List<String>>` and print it. Then change the code to count the words per length instead.",
      "`words.stream().collect(Collectors.groupingBy(String::length, TreeMap::new, Collectors.toList()))`. For counts, use `Collectors.counting()` as the downstream collector, which gives `TreeMap<Integer, Long>`.",
    ],
  }),
]);
