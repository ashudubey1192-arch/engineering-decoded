import { lesson } from "../../schema.js";

export default [
  lesson("JDK Top 100 Q1-Q12: Release History, LTS Cadence and the Big Features of Java 1 to 7", {
    intro:
      "The top 100 questions on JDK versions start with the timeline:\n\n- how Java is released today, and what LTS means\n- which features arrived in which version, from JDK 1.0 to Java 7: inner classes and JDBC, collections, assertions and NIO, generics, annotations, enums and varargs, try-with-resources and the diamond operator\n\nLater lessons go deep into Java 8, records, sealed classes, pattern matching and virtual threads. The program uses features from each early release and labels them.",
    topics: [
      [
        "Q1. How is Java released today, and what is an LTS release?",
        "Since **Java 10 (March 2018)**, Java ships a **feature release every six months**, in March and September, with versions numbered 10, 11, 12 and so on. Features that are not ready miss the train and ship later. Unfinished APIs appear as **preview** (complete but not yet final, enabled with `--enable-preview`) or **incubator** modules, so they can get feedback. Every few releases one is designated **LTS** (long-term support), with years of updates from vendors: **8, 11, 17, 21 and 25**. Since 17, an LTS comes every two years. Non-LTS releases get updates only until the next release. Most companies standardise on an LTS, while libraries test the latest release.",
      ],
      [
        "Q2. What did JDK 1.0 (1996) and 1.1 (1997) introduce?",
        "**JDK 1.0** introduced the language itself:\n\n- classes, interfaces and exceptions\n- garbage collection\n- threads with `synchronized`\n- applets\n- AWT\n- `java.io` and `java.net`\n- Vector, Hashtable and Stack\n\nThe promise was **write once, run anywhere** on the JVM. **JDK 1.1** added:\n\n- **inner classes** (member, local and anonymous)\n- **JDBC**\n- **RMI**\n- **reflection**\n- **JavaBeans**\n- **serialization**\n- the AWT event-delegation model\n- the first JIT compilers\n- Unicode-aware Readers and Writers",
      ],
      [
        "Q3. What did Java 1.2 (1998, \"Java 2\") introduce?",
        "- The **Collections Framework**: List, Set and Map, with ArrayList, HashMap and TreeMap, Iterator, and the Collections and Arrays utilities.\n- **Swing**.\n- The **strictfp** keyword.\n- The **HotSpot JIT**, as an add-on, becoming the default in 1.3.\n- Java Plug-in, Java IDL/CORBA, and the security policy model.\n- Weak, soft and phantom references.\n\nThe platform was split into J2SE, J2EE and J2ME editions. This is the release where Vector and Hashtable became \"legacy\".",
      ],
      [
        "Q4. What did Java 1.3 (2000) and 1.4 (2002) introduce?",
        "**1.3**:\n\n- HotSpot as the default JVM\n- JNDI in the core\n- `java.lang.reflect.Proxy` (dynamic proxies)\n- Java Sound\n- RMI over IIOP\n\n**1.4**:\n\n- the **`assert`** keyword\n- **NIO**: buffers, channels and selectors for scalable non-blocking I/O\n- **regular expressions** (`java.util.regex`)\n- **exception chaining** (`getCause`)\n- the logging API (`java.util.logging`)\n- XML parsing (JAXP)\n- the Preferences API\n- IPv6\n- LinkedHashMap and LinkedHashSet\n- `String.split`",
      ],
      [
        "Q5. What did Java 5 (2004) introduce?",
        "Java 5 (\"Tiger\") was the biggest language update before Java 8:\n\n- **generics**\n- **annotations** (`@Override`, `@Deprecated`, custom annotations)\n- **enums**\n- **autoboxing and unboxing**\n- **varargs** (`String... args`)\n- the **enhanced for-each** loop\n- **static imports**\n- the **java.util.concurrent** package: executors, ConcurrentHashMap, locks, atomics, CountDownLatch and others\n- the new **Java Memory Model** (JSR 133), which fixed volatile and final semantics\n- StringBuilder\n- Scanner and `printf` / `String.format`\n- the Instrumentation API",
      ],
      [
        "Q6. What did Java 6 (2006) introduce?",
        "- **The scripting API** (JSR 223), with the Rhino JavaScript engine.\n- **The Compiler API** (`javax.tools.JavaCompiler`).\n- **JDBC 4.0**, with automatic driver loading, so `Class.forName` was no longer needed.\n- **Pluggable annotation processing** (JSR 269).\n- JAX-WS and JAXB in the JDK.\n- `java.awt.Desktop`.\n- `@Override` allowed on interface method implementations.\n- `Deque` and `ArrayDeque`, `NavigableMap` and `NavigableSet`.\n- Large performance improvements in HotSpot.\n\nThe OpenJDK project started around Java 6 and 7, when Sun open-sourced the JDK under the GPL.",
      ],
      [
        "Q7. What did Java 7 (2011) introduce?",
        "Project Coin's small language changes:\n\n- **try-with-resources** and AutoCloseable\n- **multi-catch** (`catch (A | B e)`) and precise rethrow\n- the **diamond operator** (`new ArrayList<>()`)\n- **switch on String**\n- **binary literals** (`0b1010`) and **underscores in numeric literals** (`1_000_000`)\n\nAlso:\n\n- **NIO.2**: `java.nio.file.Path`, Files, Paths, WatchService and file attributes\n- the **Fork/Join framework**\n- **invokedynamic** in the JVM, the foundation for lambdas and JVM languages\n- the G1 collector, as experimental\n- `Objects` utilities\n- ThreadLocalRandom and Phaser",
      ],
      [
        "Q8. Why was Java 8 such a big release?",
        "Java 8 (March 2014, LTS) changed **how Java code is written**:\n\n- **lambda expressions** and **method references**\n- **functional interfaces** (java.util.function)\n- the **Stream API** for declarative, parallelisable processing of collections\n- **default and static methods** in interfaces, so APIs could evolve\n- **Optional**\n- the **java.time** date and time API (JSR 310)\n- **CompletableFuture**\n- Nashorn JavaScript\n- PermGen replaced by **Metaspace**\n- `String.join`, Base64, StampedLock, LongAdder\n- repeating and type annotations\n- parameter names through reflection\n\nIts ecosystem support lasted a decade, and many companies stayed on 8 until 11 or 17.",
      ],
      [
        "Q9. What are the key features of Java 9, 10 and 11?",
        "**Java 9 (2017)**:\n\n- the **module system** (JPMS, Project Jigsaw: `module-info.java`, `jlink`)\n- **JShell**\n- collection factory methods `List.of`, `Set.of` and `Map.of`\n- `private` interface methods\n- the Stream methods `takeWhile`, `dropWhile` and `iterate` with a predicate\n- Optional improvements\n- the Process API\n- the reactive `Flow` API\n- compact strings\n- G1 as the default collector\n\n**Java 10**: **`var`** for local variable type inference, `List.copyOf`, and application class-data sharing.\n\n**Java 11 (LTS)**:\n\n- the standard **HttpClient**\n- `var` in lambda parameters\n- new String methods `isBlank`, `lines`, `strip` and `repeat`\n- `Files.readString` and `writeString`\n- running a single source file (`java Main.java`)\n- ZGC (experimental) and Epsilon GC\n- TLS 1.3\n- removal of Java EE, CORBA and the JavaFX bundle",
      ],
      [
        "Q10. What are the key features of Java 12 to 17?",
        "- **12**: switch expressions (preview), `String.indent` and `transform`, the Shenandoah GC.\n- **13**: text blocks (preview), and switch `yield`.\n- **14**: **switch expressions final**, records (preview), pattern matching for instanceof (preview), **helpful NullPointerException messages**.\n- **15**: **text blocks final**, sealed classes (preview), hidden classes, ZGC and Shenandoah production-ready, Nashorn removed.\n- **16**: **records final**, **instanceof pattern matching final**, Stream.toList(), the jpackage tool, strong encapsulation by default.\n- **17 (LTS)**: **sealed classes final**, strongly encapsulated JDK internals, the new RandomGenerator API, macOS/AArch64 support, the Applet API deprecated for removal, the Security Manager deprecated.",
      ],
      [
        "Q11. What are the key features of Java 18 to 21?",
        "- **18**: **UTF-8 by default**, the `jwebserver` simple web server, `@snippet` in Javadoc, finalization deprecated for removal.\n- **19**: virtual threads (preview), record patterns (preview), structured concurrency (incubator), the Foreign Function & Memory API (preview).\n- **20**: scoped values (incubator), with more previews.\n- **21 (LTS)**:\n  - **virtual threads final**\n  - **record patterns** and **pattern matching for switch** final\n  - **sequenced collections**\n  - generational ZGC\n  - the Key Encapsulation Mechanism API\n  - unnamed patterns and variables, string templates and unnamed classes, all as previews",
      ],
      [
        "Q12. What are the key features of Java 22 to 27?",
        "- **22**:\n  - the **Foreign Function & Memory API** final\n  - **unnamed variables and patterns** (`_`) final\n  - launching **multi-file source programs**\n  - statements before `super()` (preview)\n- **23**: Markdown in Javadoc comments, and primitive patterns (preview).\n- **24**:\n  - **Stream Gatherers** final\n  - the **Class-File API** final\n  - **synchronized no longer pins virtual threads**\n  - the AOT class-loading cache\n  - quantum-resistant ML-KEM and ML-DSA\n  - the Security Manager permanently disabled\n- **25 (LTS)**:\n  - **compact source files with instance main methods**, **module import declarations** and **flexible constructor bodies**, all final\n  - **scoped values** final\n  - the KDF API, compact object headers, generational Shenandoah, and JFR enhancements\n- **26**: HTTP/3 in HttpClient, the Applet API removed, \"prepare to make final mean final\", AOT object caching with any GC, G1 throughput gains.\n- **27 (September 2026)**:\n  - G1 the default everywhere\n  - compact object headers on by default\n  - post-quantum hybrid key exchange for TLS 1.3\n  - JFR in-process redaction\n  - further previews of structured concurrency, lazy constants and primitive patterns",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.*;

public class Main {
    // Java 5: enum with a field and a constructor.
    enum Release {
        JDK_1_0(1996), JAVA_5(2004), JAVA_8(2014), JAVA_11(2018), JAVA_17(2021), JAVA_21(2023), JAVA_25(2025);
        final int year;
        Release(int year) { this.year = year; }
    }

    // Java 5: annotation definition and use.
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @interface Since { String value(); }

    @Since("1.1") static class Outer {
        class Inner { String who() { return "inner class (1.1)"; } }   // Java 1.1 inner class
    }

    // Java 5: varargs + generics.
    @SafeVarargs static <T> List<T> listOf(T... items) { return new ArrayList<>(Arrays.asList(items)); }

    public static void main(String[] args) throws Exception {
        // Q1: the running JVM's version (feature number of the 6-month cadence).
        System.out.println("Q1 running on a JDK with feature release >= 21: " + (Runtime.version().feature() >= 21));

        // Q2: inner class + reflection on an annotation (1.1, 5).
        Outer.Inner inner = new Outer().new Inner();
        System.out.println("Q2 " + inner.who() + ", annotation via reflection: @Since(" + Outer.class.getAnnotation(Since.class).value() + ")");

        // Q3: collections framework (1.2).
        Map<String, Integer> map = new TreeMap<>(Map.of("b", 2, "a", 1));
        System.out.println("Q3 TreeMap (1.2) " + map);

        // Q4: assert (1.4, disabled unless -ea), regex (1.4), exception chaining (1.4).
        Matcher m = Pattern.compile("(\\d+)\\.(\\d+)").matcher("version 1.4");
        System.out.println("Q4 regex groups: " + (m.find() ? m.group(1) + " and " + m.group(2) : "none")
                + ", chained cause: " + new RuntimeException("outer", new IOException("inner")).getCause().getMessage());

        // Q5: generics, autoboxing, varargs, for-each, enums, concurrency utilities.
        List<Integer> numbers = listOf(3, 1, 2);
        int sum = 0;
        for (int n : numbers) sum += n;                         // unboxing in for-each
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<Integer> f = pool.submit(() -> 6 * 7);
        System.out.println("Q5 varargs list " + numbers + " sum " + sum + ", enum " + Release.JAVA_5 + " (" + Release.JAVA_5.year + "), Future " + f.get());
        pool.shutdown();

        // Q6: Deque/ArrayDeque and NavigableMap (6).
        Deque<String> stack = new ArrayDeque<>(List.of("x", "y"));
        stack.push("top");
        NavigableMap<Integer, String> nav = new TreeMap<>(Map.of(10, "ten", 20, "twenty"));
        System.out.println("Q6 ArrayDeque push -> " + stack.peek() + ", NavigableMap floorKey(15) -> " + nav.floorKey(15));

        // Q7: try-with-resources, multi-catch, diamond, switch on String, binary and underscore literals, NIO.2.
        Path temp = Files.createTempFile("java7", ".txt");
        try (BufferedWriter w = Files.newBufferedWriter(temp)) { w.write("nio2"); }
        String kind = "LTS";
        switch (kind) { case "LTS": System.out.print("Q7 switch on String works, "); break; default: break; }
        int mask = 0b1010, million = 1_000_000;
        try { Integer.parseInt("x"); } catch (NumberFormatException | NullPointerException e) { System.out.print("multi-catch works, "); }
        System.out.println("binary " + mask + ", underscores " + million + ", NIO.2 read " + Files.readString(temp));

        // Q1: LTS releases in order with their years.
        StringJoiner lts = new StringJoiner(", ");
        for (Release r : Release.values()) if (r.ordinal() >= 2) lts.add(r.name().replace("JAVA_", "") + "(" + r.year + ")");
        System.out.println("Q1 LTS line since 8: " + lts);
    }
}`,
    walk:
      "The program walks through the early releases in code. It checks the feature number of the running JDK (Q1). It creates an instance of a 1.1-style inner class, and reads a Java 5 annotation reflectively (Q2). A TreeMap stands for the 1.2 Collections Framework (Q3). A regex with capture groups and exception chaining stand for 1.4 (Q4). Java 5 appears as a generic varargs helper, a for-each loop that unboxes, an enum with a field and constructor, and an executor Future (Q5).\n\nJava 6 adds ArrayDeque and NavigableMap (Q6). The Java 7 block uses try-with-resources over NIO.2 Files, switch on a String, multi-catch, a binary literal and an underscore literal (Q7). Finally the enum lists the LTS releases from 8 onwards with their years. The later questions in this course explain the modern features in depth.",
    anim: [
      "Java release timeline",
      [
        ["j1", "JDK 1.0-1.4", "1996-2002"],
        ["j5", "Java 5-7", "generics, NIO.2"],
        ["j8", "Java 8", "lambdas, streams"],
        ["j17", "Java 9-17", "modules, records"],
        ["j21", "Java 21-27", "virtual threads"],
      ],
      [
        ["j1", "j5", "language grows", "1.1 inner classes, 1.2 collections and 1.4 NIO lead to Java 5's generics and enums."],
        ["j5", "j8", "2011 -> 2014", "Java 7 adds try-with-resources and invokedynamic, which Java 8's lambdas use."],
        ["j8", "j17", "6-month cadence", "From Java 10, a release every six months: var, switch expressions, records, sealed classes."],
        ["j17", "j21", "LTS 17 -> 21", "Java 21 finalises virtual threads, record patterns and pattern matching for switch."],
        ["j21", "j21", "25 LTS, 26, 27", "Java 25 is the next LTS; 26 and 27 refine AOT, GC, security and previews."],
      ],
    ],
    mistakes: [
      "Calling every new version \"Java 2\". That name referred to the 1.2 to 1.4 era (J2SE).",
      "Assuming preview features are stable. They need `--enable-preview` and can change between releases.",
      "Confusing the release with its LTS support: only some releases get long-term updates.",
    ],
    qa: [
      [
        "Which Java versions are LTS?",
        "8, 11, 17, 21 and 25. Since 17, a new LTS arrives every two years, so 29 is expected in 2027.",
      ],
      [
        "Is OpenJDK the same as Oracle JDK?",
        "Since Java 11 they are built from the same source and are functionally equivalent. The differences are licensing, support and the update schedule. Temurin, Corretto, Zulu and others are free OpenJDK builds.",
      ],
      [
        "What is a preview feature?",
        "A fully specified and implemented language or VM feature that is not yet permanent. It must be enabled at compile time and at runtime with `--enable-preview`, and it can change or be removed based on feedback.",
      ],
    ],
    ex: [
      "Without looking it up: in which version did each of these appear: `var`, text blocks (final), records (final), `List.of`, try-with-resources, switch on String, virtual threads (final)?",
      "`var`: 10. Text blocks: 15. Records: 16. `List.of`: 9. Try-with-resources: 7. Switch on String: 7. Virtual threads: 21.",
    ],
  }),

  lesson("JDK Top 100 Q13-Q25: Java 8 Lambdas, Functional Interfaces, Method References and Default Methods", {
    intro:
      "Java 8 is the most asked-about release. Questions 13 to 25 cover:\n\n- lambda syntax and how lambdas compile\n- effectively final captures\n- functional interfaces and `@FunctionalInterface`\n- the four core interfaces and their specialisations\n- function composition\n- the four kinds of method reference\n- default and static interface methods, and the diamond problem\n- lambdas vs anonymous classes\n\nThe program exercises every one of them.",
    topics: [
      [
        "Q13. What is a lambda expression?",
        "A lambda is an **anonymous function**: a short block of code with parameters that can be passed around as a value. Its syntax is `(params) -> expression` or `(params) -> { statements; }`. Parameter types are usually inferred, and parentheses are optional for a single parameter: `x -> x * 2`. A lambda can be used wherever a **functional interface** is expected, and its type comes from that context (target typing): `Comparator<String> c = (a, b) -> a.length() - b.length();`. Lambdas enable a functional style: passing behaviour to `sort`, `forEach`, streams and CompletableFuture without anonymous-class boilerplate.",
      ],
      [
        "Q14. How does a lambda compile? Is it an anonymous class?",
        "No. An anonymous class compiles to its own `.class` file and is instantiated with `new` every time. A lambda compiles to a **private synthetic method** in the enclosing class (`lambda$main$0`), plus an **invokedynamic** call site. On first execution, `LambdaMetafactory` spins a hidden class implementing the functional interface that calls that method. A non-capturing lambda then becomes a **singleton** that is reused, while a capturing one creates a small object holding the captured values. That is why lambdas start fast, use less memory than anonymous classes, and let the JVM optimise their implementation over time.",
      ],
      [
        "Q15. What is \"effectively final\", and why can lambdas only capture such variables?",
        "A local variable is **effectively final** if it is never reassigned after initialisation, even without the `final` keyword. Lambdas (and, since Java 8, anonymous classes) may capture only final or effectively final locals. They capture the **value**, not the variable: the lambda may run later, on another thread, after the method's stack frame is gone. Allowing mutation would require sharing the variable, which brings race conditions and confusing semantics. To accumulate inside a lambda, use an instance field, an `AtomicInteger`, or better, a stream reduction or collector.",
      ],
      [
        "Q16. What is a functional interface?",
        "An interface with **exactly one abstract method** (SAM, a single abstract method). It may also have any number of default and static methods, and redeclared Object methods (such as `equals`) do not count. Lambdas and method references implement functional interfaces. Examples are `Runnable`, `Callable`, `Comparator`, `Predicate`, `Function` and `Supplier`. The **`@FunctionalInterface`** annotation is optional. It makes the compiler verify that there is exactly one abstract method, and documents the intent.",
      ],
      [
        "Q17. What are the core functional interfaces in java.util.function?",
        "- **Function<T, R>**: `R apply(T t)`. Transforms a value.\n- **Predicate<T>**: `boolean test(T t)`. Tests a condition.\n- **Consumer<T>**: `void accept(T t)`. Performs a side effect.\n- **Supplier<T>**: `T get()`. Produces a value lazily.\n- **UnaryOperator<T>** and **BinaryOperator<T>**: functions whose argument and result types are the same.\n- **BiFunction**, **BiPredicate** and **BiConsumer**: two-argument versions.\n- **Primitive specialisations** to avoid boxing: `IntPredicate`, `IntFunction<R>`, `ToIntFunction<T>`, `IntUnaryOperator`, `IntBinaryOperator`, `IntSupplier`, `ObjIntConsumer<T>`, and the Long and Double variants.\n\nThe package has 43 interfaces in total.",
      ],
      [
        "Q18. How do you compose functional interfaces?",
        "The interfaces have **default methods** for composition:\n\n- `Function.andThen(g)` (apply this, then g)\n- `Function.compose(g)` (apply g, then this)\n- `Function.identity()`\n- `Predicate.and`, `or` and `negate`, plus `Predicate.not(p)` (Java 11) and `Predicate.isEqual`\n- `Consumer.andThen`\n- `Comparator.comparing`, `thenComparing`, `reversed`, `nullsFirst` and `naturalOrder`\n- `BinaryOperator.minBy` and `maxBy`\n\nComposition builds complex behaviour from small, reusable pieces, for example `isAdult.and(hasEmail).negate()`.",
      ],
      [
        "Q19. What are method references?",
        "A method reference is shorthand for a lambda that just calls an existing method. There are four kinds:\n\n1. A **static method**: `Integer::parseInt` means `s -> Integer.parseInt(s)`.\n2. An **instance method of a particular object**: `System.out::println` means `x -> System.out.println(x)`.\n3. An **instance method of an arbitrary object of a type**: `String::toUpperCase` means `s -> s.toUpperCase()`. The first parameter becomes the receiver.\n4. A **constructor**: `ArrayList::new` means `() -> new ArrayList<>()`, and array constructors `int[]::new`.\n\nThey improve readability when the method name says it all.",
      ],
      [
        "Q20. What are default methods, and why were they added?",
        "A **default method** is an interface method with a body, marked `default`. Implementing classes inherit it and may override it. It was added so that existing interfaces could **evolve without breaking** every implementation. Java 8 had to add `stream()`, `forEach`, `removeIf` and `spliterator` to Collection and Iterable, which millions of classes already implemented. Default methods also enable \"mixin\" behaviour and fluent composition (`Comparator.reversed`). They cannot override Object's methods (equals, hashCode, toString), and they cannot hold state.",
      ],
      [
        "Q21. How is the diamond problem with default methods resolved?",
        "If a class inherits the same default method from two interfaces, the rules are:\n\n1. **Classes win**: a method declared in the class or its superclasses takes priority over interface defaults.\n2. **The more specific interface wins**: if B extends A and both define the method, B's version is used.\n3. Otherwise the class **must override** the method, or it does not compile (\"inherits unrelated defaults\"). Inside the override it can call one parent explicitly with `InterfaceName.super.method()`.\n\nThe program shows rule 3 with a `Flyer` and a `Swimmer`, both defining `move()`.",
      ],
      [
        "Q22. What are static and private interface methods?",
        "**Static methods** in interfaces (Java 8) hold utility code that belongs to the interface: `Comparator.naturalOrder()`, `Function.identity()`, `List.of()` (Java 9). They are called as `InterfaceName.method()` and are **not inherited** by implementing classes. **Private methods** (Java 9) and **private static methods** let several default or static methods share helper code without exposing it in the public API.",
      ],
      [
        "Q23. What is the difference between a lambda and an anonymous class?",
        "- **`this`**: in a lambda it refers to the **enclosing instance**; in an anonymous class it refers to the anonymous object.\n- **Scope**: a lambda has no scope of its own, so it cannot shadow local variables; an anonymous class can.\n- **Target**: a lambda can only implement a **functional interface**; an anonymous class can extend a class, implement any interface, and have state and several methods.\n- **Compilation**: a lambda uses invokedynamic, with no extra class file; an anonymous class gets an `Outer$1.class` and a `new` instance each time.\n- **Serialization**: lambdas are not serializable by default.\n\nUse lambdas for behaviour, and anonymous or named classes when you need state, several methods, or a class to extend.",
      ],
      [
        "Q24. Can a lambda throw a checked exception?",
        "Only if the functional interface's method declares it. `Callable.call() throws Exception` allows it, but `Function.apply` does not, so `list.stream().map(path -> Files.readString(path))` does not compile. Options:\n\n- catch the exception inside the lambda and wrap it (`UncheckedIOException`)\n- define your own functional interface that declares the exception (`interface ThrowingFunction<T, R> { R apply(T t) throws IOException; }`) plus a wrapper method\n- use a library such as Vavr\n\nThe JDK deliberately keeps java.util.function free of checked exceptions.",
      ],
      [
        "Q25. What are the other Java 8 additions besides lambdas?",
        "- `forEach`, `removeIf`, `replaceAll`, `computeIfAbsent`, `merge` and `getOrDefault` on collections and maps\n- `String.join` and `StringJoiner`\n- `Base64`\n- `Optional`\n- the `java.time` API\n- `CompletableFuture`\n- `StampedLock`, `LongAdder` and `ConcurrentHashMap`'s bulk operations\n- `Arrays.parallelSort` and `parallelPrefix`\n- `Files.lines` and `Files.walk`\n- the `Comparator` combinators\n- repeating annotations (`@Repeatable`) and type annotations\n- the `-parameters` compiler flag\n- the Nashorn JavaScript engine\n- Metaspace replacing PermGen\n- `Math.addExact` and the other overflow-checking methods\n- unsigned arithmetic helpers (`Integer.toUnsignedString`)",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.*;

public class Main {

    @FunctionalInterface
    interface Validator<T> {                            // Q16: one abstract method
        boolean validate(T t);
        default Validator<T> and(Validator<T> other) { return t -> validate(t) && other.validate(t); } // Q20
        static <T> Validator<T> always() { return t -> true; }                                       // Q22
    }

    // Q21: the diamond problem.
    interface Flyer { default String move() { return "fly"; } }
    interface Swimmer { default String move() { return "swim"; } }
    static class Duck implements Flyer, Swimmer {
        @Override public String move() { return Flyer.super.move() + " and " + Swimmer.super.move(); } // must resolve
    }

    // Q24: a functional interface that may throw a checked exception.
    @FunctionalInterface interface ThrowingFunction<T, R> { R apply(T t) throws Exception; }
    static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
        return t -> { try { return f.apply(t); } catch (Exception e) { throw new RuntimeException(e); } };
    }

    final String name = "Main instance";

    void thisDemo() {
        // Q23: 'this' in a lambda is the enclosing object; in an anonymous class it is the anonymous object.
        Supplier<String> lambda = () -> this.name;
        Supplier<String> anon = new Supplier<>() { public String get() { return this.getClass().isAnonymousClass() ? "anonymous object" : "?"; } };
        System.out.println("Q23 lambda this -> " + lambda.get() + ", anonymous this -> " + anon.get());
    }

    public static void main(String[] args) {
        // Q13: lambda syntax forms.
        Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());
        BinaryOperator<Integer> add = (x, y) -> { int sum = x + y; return sum; };
        List<String> words = new ArrayList<>(List.of("banana", "fig", "apple"));
        words.sort(byLength);
        System.out.println("Q13 sorted by length " + words + ", add(2, 3) = " + add.apply(2, 3));

        // Q14: a non-capturing lambda is reused; it is not an anonymous inner class.
        Supplier<Supplier<String>> make = () -> () -> "hi";
        System.out.println("Q14 non-capturing lambda instance reused: " + (make.get() == make.get())
                + ", lambda class is synthetic/hidden: " + (make.getClass().isSynthetic() || make.getClass().isHidden()));

        // Q15: effectively final capture, and the accumulator workaround.
        int base = 10;                                   // never reassigned -> effectively final
        Function<Integer, Integer> plusBase = x -> x + base;
        AtomicInteger counter = new AtomicInteger();
        words.forEach(w -> counter.incrementAndGet());   // cannot do count++ on a local
        System.out.println("Q15 plusBase(5) = " + plusBase.apply(5) + ", counted " + counter.get() + " words");

        // Q16 + Q20 + Q22
        Validator<String> notEmpty = s -> !s.isEmpty();
        Validator<String> shortWord = s -> s.length() < 5;
        System.out.println("Q16 custom functional interface: \"fig\" " + notEmpty.and(shortWord).validate("fig")
                + ", \"banana\" " + notEmpty.and(shortWord).validate("banana") + ", always() " + Validator.always().validate(null));

        // Q17: the four core interfaces and a primitive specialisation.
        Function<String, Integer> length = String::length;
        Predicate<Integer> even = n -> n % 2 == 0;
        Consumer<String> shout = s -> System.out.print(s.toUpperCase() + " ");
        Supplier<List<String>> fresh = ArrayList::new;
        IntBinaryOperator multiply = (a, b) -> a * b;    // no boxing
        System.out.print("Q17 ");
        shout.accept("consumer");
        System.out.println("| length(\"lambda\") " + length.apply("lambda") + ", even(4) " + even.test(4)
                + ", supplier " + fresh.get() + ", IntBinaryOperator " + multiply.applyAsInt(6, 7));

        // Q18: composition.
        Function<Integer, Integer> times2 = x -> x * 2, plus3 = x -> x + 3;
        Predicate<String> startsA = s -> s.startsWith("a");
        System.out.println("Q18 times2.andThen(plus3)(5) = " + times2.andThen(plus3).apply(5) + ", times2.compose(plus3)(5) = " + times2.compose(plus3).apply(5)
                + ", not startsA on apple: " + Predicate.not(startsA).test("apple"));

        // Q19: the four kinds of method reference.
        Function<String, Integer> parse = Integer::parseInt;              // static
        Consumer<Object> printer = System.out::println;                  // particular object
        Function<String, String> upper = String::toUpperCase;            // arbitrary object of a type
        Function<Integer, int[]> newArray = int[]::new;                  // array constructor
        System.out.print("Q19 ");
        printer.accept(parse.apply("42") + 1 + " " + upper.apply("ref") + " int[" + newArray.apply(3).length + "]");

        // Q21
        System.out.println("Q21 Duck.move() -> " + new Duck().move());

        // Q23
        new Main().thisDemo();

        // Q24
        Function<String, Integer> safeParse = unchecked(Integer::valueOf);
        try { safeParse.apply("x"); } catch (RuntimeException e) { System.out.println("Q24 checked/unchecked wrapper rethrew: " + e.getCause().getClass().getSimpleName()); }

        // Q25: a few other Java 8 additions.
        Map<String, Integer> counts = new HashMap<>();
        for (String w : List.of("a", "b", "a")) counts.merge(w, 1, Integer::sum);
        System.out.println("Q25 merge " + new TreeMap<>(counts) + ", String.join " + String.join("|", words)
                + ", Base64 " + Base64.getEncoder().encodeToString("java8".getBytes()) + ", addExact overflow detected: " + overflow());
    }

    static boolean overflow() { try { Math.addExact(Integer.MAX_VALUE, 1); return false; } catch (ArithmeticException e) { return true; } }
}`,
    walk:
      "Q13 sorts words with a comparator lambda, and adds with a block lambda. Q14 shows that a non-capturing lambda returns the same instance every time, and that its class is a hidden class spun at runtime, not an `Outer$1` anonymous class. Q15 captures the effectively final `base`, and counts with an AtomicInteger, because a captured local cannot be incremented.\n\nThe custom `Validator` (Q16) has one abstract method, a default `and` (Q20), and a static `always` (Q22). Q17 uses the four core interfaces and a primitive specialisation. In Q18, `andThen` gives (5 × 2) + 3 = 13, while `compose` gives (5 + 3) × 2 = 16. Q19 uses all four kinds of method reference. Q21's Duck must override `move()`, and combines both parents through `X.super.move()`. Q23 contrasts `this` in a lambda with `this` in an anonymous class. Q24 wraps a checked-exception function, and Q25 samples other Java 8 additions.",
    anim: [
      "How a lambda becomes an object",
      [
        ["src", "x -> x + base", "source"],
        ["javac", "javac", "lambda$main$0"],
        ["indy", "invokedynamic", "call site"],
        ["lmf", "LambdaMetafact.", "spins class"],
        ["obj", "Function obj", "captures base"],
      ],
      [
        ["src", "javac", "compile", "javac moves the lambda body into a private synthetic method."],
        ["javac", "indy", "emit indy", "At the use site it emits an invokedynamic instruction, not a new."],
        ["indy", "lmf", "first run", "The first execution bootstraps through LambdaMetafactory."],
        ["lmf", "obj", "hidden class", "A hidden class implementing Function is generated; capturing lambdas get the values."],
        ["obj", "indy", "reuse", "Later executions reuse the linked call site; non-capturing lambdas are singletons."],
      ],
    ],
    mistakes: [
      "Trying to modify a captured local variable inside a lambda.",
      "Writing complex multi-line lambdas instead of extracting a well-named method and using a method reference.",
      "Using a lambda where its `this` must refer to the lambda itself (for example, to remove itself as a listener). Use an anonymous class.",
    ],
    qa: [
      [
        "Can a functional interface extend another interface?",
        "Yes, as long as it ends up with exactly one abstract method. For example, `interface Discount extends UnaryOperator<Double> { }` is still functional.",
      ],
      [
        "Why is `Comparator` a functional interface although it declares `equals`?",
        "`equals(Object)` is a public method of Object, so redeclaring it does not count as an abstract method. `compare` is the only one that does.",
      ],
      [
        "What is target typing?",
        "The type of a lambda is inferred from the context in which it is used: an assignment, a method argument or a cast. The same lambda text can therefore be a `Predicate<String>` in one place and a custom functional interface in another.",
      ],
    ],
    ex: [
      "Write a `Function<String, String>` pipeline that trims, converts to lower case, and replaces spaces with dashes, using only `andThen` and method references where possible.",
      "`Function<String, String> slug = ((Function<String, String>) String::trim).andThen(String::toLowerCase).andThen(s -> s.replace(' ', '-'));`. The cast gives the first method reference a target type so that `andThen` is available. Calling `slug.apply(\"  Hello World \")` returns \"hello-world\".",
    ],
  }),
];
