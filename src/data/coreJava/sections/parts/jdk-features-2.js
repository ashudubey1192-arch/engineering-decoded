import { lesson } from "../../schema.js";

export default [
  lesson("Java 7 (2011): Project Coin, try-with-resources, NIO.2, Fork/Join and invokedynamic", {
    intro:
      "Java SE 7 (July 2011, \"Dolphin\") was the first release under Oracle, five years after Java 6. It brought:\n\n- Project Coin's small language improvements: try-with-resources, multi-catch, the diamond operator, switch on String, binary literals and underscores in numbers\n- **NIO.2** for files\n- the **Fork/Join** framework\n- **invokedynamic** in the JVM\n- the `Objects` utility class\n\nThe program uses every one of them.",
    topics: [
      [
        "try-with-resources and multi-catch",
        "`try (BufferedReader r = Files.newBufferedReader(p)) { ... }` closes every resource that implements the new **AutoCloseable** interface automatically, in reverse order, and records close failures as **suppressed exceptions** (`Throwable.addSuppressed` and `getSuppressed`). **Multi-catch**, `catch (IOException | SQLException e)`, shares one handler between several types. **Precise rethrow** lets `catch (Exception e) { throw e; }` declare only the checked exceptions the try block can actually throw.",
        "try (var in = new FileInputStream(a); var out = new FileOutputStream(b)) {\n    in.transferTo(out);\n} catch (IOException | SecurityException e) { log(e); }",
      ],
      [
        "Diamond, switch on String, and binary and underscore literals",
        "- **Diamond**: `Map<String, List<Integer>> m = new HashMap<>();` infers the type arguments.\n- **switch on String**: compiled through `hashCode()` plus `equals()`.\n- **Binary literals**: `0b1010_1010`.\n- **Underscores in numeric literals**: `1_000_000`, `0xFF_FF`. They are for readability only, and cannot appear at the start or end of a number or next to the decimal point.",
      ],
      [
        "NIO.2: Path, Files and WatchService",
        "`java.nio.file` (JSR 203) replaced most uses of `java.io.File`:\n\n- `Path` and `Paths.get`, and `Path.of` since 11\n- **Files** utilities: `readAllLines`, `write`, `copy`, `move`, `delete`, `exists`, `createDirectories`, `walkFileTree`, `newBufferedReader`, and since 8 `lines`, `walk` and `list`\n- file **attributes**: POSIX permissions, owner, times\n- symbolic links\n- the **WatchService**, which notifies about file changes\n- zip and jar **file systems** (`FileSystems.newFileSystem`)\n\nErrors are now real exceptions (`NoSuchFileException`) instead of boolean results.",
      ],
      [
        "The Fork/Join framework",
        "`ForkJoinPool`, `RecursiveTask` and `RecursiveAction` parallelise divide-and-conquer algorithms with **work stealing**: idle workers take tasks from the tails of busy workers' deques. It was the engine behind Java 8's parallel streams, and is the default scheduler for virtual threads. Java 7 also added `Phaser`, `TransferQueue` / `LinkedTransferQueue`, and `ThreadLocalRandom`.",
      ],
      [
        "invokedynamic (JSR 292)",
        "A new bytecode instruction, **invokedynamic**, lets the linkage of a call site be decided at runtime by a **bootstrap method**, which returns a `MethodHandle` target (`java.lang.invoke`). It was introduced for dynamic languages on the JVM, such as JRuby, Groovy and Nashorn. Java itself then used it for **lambdas** (Java 8), **string concatenation** (Java 9), **records'** generated methods (16) and **pattern-matching switch** (21). `MethodHandle` is also a faster, type-safe alternative to reflection.",
      ],
      [
        "Objects, the G1 collector and other additions",
        "- **`java.util.Objects`**: `equals`, `hash`, `hashCode`, `toString`, `requireNonNull`, `isNull` and `nonNull`.\n- **G1** fully supported, becoming the default in 9.\n- **`System.lineSeparator()`**.\n- **`Character.isAlphabetic`**.\n- Elliptic-curve cryptography.\n- SCTP and SDP networking.\n- The **JavaFX 2** platform.\n- `ProcessBuilder.inheritIO`.\n- `URLClassLoader.close`.\n- Java 7 update 6 changed `String.substring` to copy the characters instead of sharing the array, which fixed memory leaks.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.lang.invoke.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static class Resource implements AutoCloseable {
        final String name; final List<String> log;
        Resource(String name, List<String> log) { this.name = name; this.log = log; log.add("open " + name); }
        public void close() { log.add("close " + name); if (name.equals("B")) throw new IllegalStateException("B failed to close"); }
    }

    static class SumTask extends RecursiveTask<Long> {
        final int from, to;
        SumTask(int from, int to) { this.from = from; this.to = to; }
        protected Long compute() {
            if (to - from <= 1000) { long s = 0; for (int i = from; i < to; i++) s += i; return s; }
            int mid = (from + to) / 2;
            SumTask left = new SumTask(from, mid);
            left.fork();
            return new SumTask(mid, to).compute() + left.join();
        }
    }

    public static void main(String[] args) throws Throwable {
        // try-with-resources: reverse close order + suppressed exception.
        List<String> log = new ArrayList<>();
        try (Resource a = new Resource("A", log); Resource b = new Resource("B", log)) {
            throw new IOException("body failed");
        } catch (IOException | IllegalStateException e) {                     // multi-catch
            System.out.println("try-with-resources " + log + ", primary '" + e.getMessage() + "', suppressed '" + e.getSuppressed()[0].getMessage() + "'");
        }

        // Diamond, switch on String, binary and underscore literals.
        Map<String, List<Integer>> map = new HashMap<>();
        map.computeIfAbsent("flags", k -> new ArrayList<>()).add(0b1010_1010);
        String release = "dolphin";
        String codename;
        switch (release) { case "mustang": codename = "Java 6"; break; case "dolphin": codename = "Java 7"; break; default: codename = "?"; }
        System.out.println("diamond map " + map + ", switch on String -> " + codename + ", 1_000_000 = " + 1_000_000);

        // NIO.2: create, write, walk, attributes, copy, delete.
        Path root = Files.createTempDirectory("nio2");
        Path docs = Files.createDirectories(root.resolve("docs/notes"));
        Files.write(docs.resolve("a.txt"), List.of("line 1", "line 2"));
        Files.copy(docs.resolve("a.txt"), docs.resolve("b.txt"));
        List<String> found = new ArrayList<>();
        Files.walkFileTree(root, new SimpleFileVisitor<Path>() {
            @Override public FileVisitResult visitFile(Path f, BasicFileAttributes attrs) { found.add(root.relativize(f).toString().replace('\\', '/') + "(" + attrs.size() + "B)"); return FileVisitResult.CONTINUE; }
        });
        Collections.sort(found);
        System.out.println("NIO.2 walkFileTree found " + found + ", readAllLines " + Files.readAllLines(docs.resolve("b.txt")));
        try { Files.delete(root.resolve("missing.txt")); } catch (NoSuchFileException e) { System.out.println("NIO.2 delete missing file -> NoSuchFileException (java.io.File.delete just returned false)"); }

        // Fork/Join.
        long sum = ForkJoinPool.commonPool().invoke(new SumTask(0, 100_000));
        System.out.println("Fork/Join sum 0..99999 = " + sum);

        // MethodHandles (the API behind invokedynamic).
        MethodHandle concat = MethodHandles.lookup().findVirtual(String.class, "concat", MethodType.methodType(String.class, String.class));
        String joined = (String) concat.invokeExact("invoke", "dynamic");
        System.out.println("MethodHandle String.concat -> " + joined);

        // Objects utilities.
        System.out.println("Objects.equals(null, null) " + Objects.equals(null, null) + ", Objects.hash(1, \"a\") " + Objects.hash(1, "a")
                + ", Objects.toString(null, \"default\") -> " + Objects.toString(null, "default"));
    }
}`,
    walk:
      "Resources A and B open in order. When the body throws, B is closed first and its close also fails, then A is closed. The catch receives the body's IOException with B's failure attached as a suppressed exception. The catch is a multi-catch. The diamond, a binary literal with underscores, and a switch on a String follow.\n\nNIO.2 creates nested directories, writes and copies a file, and walks the tree with a FileVisitor, printing relative paths and sizes. Deleting a missing file throws the precise NoSuchFileException. A Fork/Join task splits the summation down to chunks of 1,000 numbers. A MethodHandle, the API behind invokedynamic, calls `String.concat` with exact typing. Finally the `Objects` helpers handle nulls safely. `computeIfAbsent` and the lambda are Java 8 conveniences used for brevity.",
    anim: [
      "Closing order in try-with-resources",
      [
        ["open", "open A, open B", "declaration order"],
        ["body", "try body", "throws IOException"],
        ["closeB", "close B", "fails"],
        ["closeA", "close A", "still runs"],
        ["catch", "catch", "primary + suppressed"],
      ],
      [
        ["open", "body", "enter", "Resources are initialised left to right before the body runs."],
        ["body", "closeB", "exception", "The body throws; closing starts with the last opened resource."],
        ["closeB", "closeA", "suppressed", "B's close failure is attached to the primary exception, not lost."],
        ["closeA", "catch", "propagate", "A is closed anyway; then the primary exception reaches the catch."],
        ["catch", "catch", "getSuppressed()", "The handler can inspect both the body failure and the close failure."],
      ],
    ],
    mistakes: [
      "Wrapping a resource without declaring it in the try header, which then never closes: `try (var r = new BufferedReader(new FileReader(f)))` closes only the outer reader, and is fine if its constructor cannot fail.",
      "Using `java.io.File` boolean methods and ignoring failures. NIO.2 throws informative exceptions.",
    ],
    qa: [
      [
        "What did Project Coin deliver?",
        "Small language changes: strings in switch, binary literals and underscores, multi-catch with precise rethrow, try-with-resources, the diamond operator, and simplified varargs warnings (`@SafeVarargs`).",
      ],
      [
        "Why was invokedynamic important for Java 8?",
        "Lambdas compile to invokedynamic call sites bootstrapped by LambdaMetafactory, so the JVM decides at runtime how to create the function object. This avoids one class file per lambda, and leaves room for future optimisation.",
      ],
      [
        "Is `Files.readAllLines` safe for huge files?",
        "No. It loads everything into memory. Use `Files.lines` (Java 8, a lazy stream, closed with try-with-resources) or a BufferedReader.",
      ],
    ],
    ex: [
      "Use a WatchService to print the name of every file created in a directory, and stop after the first event.",
      "`try (WatchService ws = FileSystems.getDefault().newWatchService()) { dir.register(ws, StandardWatchEventKinds.ENTRY_CREATE); WatchKey key = ws.take(); for (WatchEvent<?> ev : key.pollEvents()) System.out.println(ev.context()); }`. `take()` blocks until an event arrives.",
    ],
  }),

  lesson("Java 8 (2014, LTS): Lambdas, Streams, Optional, java.time, Default Methods and CompletableFuture", {
    intro:
      "Java 8 (March 2014, LTS) changed how Java is written. It added:\n\n- **lambda expressions** and **method references**\n- **functional interfaces**\n- the **Stream API**\n- **default and static interface methods**\n- **Optional**\n- the **java.time** API\n- **CompletableFuture**\n- the Nashorn JavaScript engine\n- **Metaspace** in place of PermGen\n\nThe interview section covers Java 8 in depth (questions 13 to 50). This study lesson gives the overview, with one program that touches every headline feature.",
    topics: [
      [
        "Lambdas, method references and functional interfaces",
        "A lambda, `(a, b) -> a + b`, is a concise implementation of a **functional interface** (an interface with one abstract method). Method references, `String::length`, `System.out::println` and `ArrayList::new`, are shorthand for lambdas that just call an existing method. The `java.util.function` package provides Function, Predicate, Consumer, Supplier, the operators, and the primitive specialisations. Lambdas compile to invokedynamic plus a private method, not to anonymous classes.",
      ],
      [
        "The Stream API",
        "Streams process data declaratively: `orders.stream().filter(o -> o.total() > 100).map(Order::customer).distinct().sorted().collect(toList())`. The pipeline is lazy and can run in parallel. **Collectors** handle groupingBy, partitioningBy, joining and toMap. **Primitive streams** (IntStream and others) avoid boxing. Collections gained `stream()`, `forEach`, `removeIf` and `spliterator`, and Map gained `compute`, `merge` and `getOrDefault`. Files gained `lines` and `walk`.",
      ],
      [
        "Default and static methods in interfaces",
        "Interfaces can contain **method bodies**: `default` methods are inherited and can be overridden, while `static` methods are utilities on the interface itself. This let the JDK add `Collection.stream()`, `Iterable.forEach` and `Comparator.thenComparing` without breaking existing implementations. It also introduced rules for resolving conflicting defaults: the class wins, then the more specific interface, otherwise the class must override and call `X.super.m()`.",
      ],
      [
        "Optional",
        "`Optional<T>` is a return type that represents a possibly absent value. Its API is functional: `map`, `flatMap`, `filter`, `orElse`, `orElseGet`, `orElseThrow` and `ifPresent`. It makes absence explicit in API signatures, which cuts down NullPointerExceptions. Primitive versions exist: OptionalInt, OptionalLong and OptionalDouble.",
      ],
      [
        "The java.time API (JSR 310)",
        "These are immutable, thread-safe date and time types:\n\n- `LocalDate`, `LocalTime` and `LocalDateTime`\n- `ZonedDateTime` and `OffsetDateTime`\n- `Instant`\n- `Duration` and `Period`\n- `DateTimeFormatter`\n- `ZoneId`, `YearMonth` and `DayOfWeek`\n- `TemporalAdjusters`, such as `firstDayOfNextMonth`\n\nThe design is based on Joda-Time, led by Stephen Colebourne. It replaced the mutable and confusing `Date` and `Calendar` and the thread-unsafe `SimpleDateFormat`.",
      ],
      [
        "CompletableFuture and other concurrency additions",
        "**CompletableFuture** composes asynchronous steps: `supplyAsync`, then `thenApply`, `thenCompose`, `thenCombine` and `exceptionally`, and `allOf`. Other additions were `ConcurrentHashMap` rewritten with CAS and bin locks, bulk operations, and `newKeySet`. **LongAdder** and **LongAccumulator** serve contended counters. **StampedLock** offers optimistic reads. `Arrays.parallelSort` arrived too.",
      ],
      [
        "Everything else in Java 8",
        "- `String.join` and `StringJoiner`\n- `Base64`\n- **repeating annotations** (`@Repeatable`) and **type annotations** (`@NonNull String`)\n- method parameter names through reflection (`-parameters`)\n- `Math.addExact` and the other overflow-checking methods\n- unsigned arithmetic (`Integer.toUnsignedString`, `divideUnsigned`)\n- the Nashorn JavaScript engine\n- PermGen removed and **Metaspace** added\n- compact profiles\n- the `jdeps` dependency analyser\n- SecureRandom.getInstanceStrong()",
      ],
    ],
    code: String.raw`import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.LongAdder;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    record Order(String customer, String city, double total) { }

    interface Discountable {
        double total();
        default double discounted(double pct) { return total() * (1 - pct / 100); }    // default method
        static Discountable of(double t) { return () -> t; }                              // static method
    }

    public static void main(String[] args) throws Exception {
        List<Order> orders = List.of(new Order("asha", "Pune", 250), new Order("ravi", "Agra", 80),
                new Order("asha", "Pune", 120), new Order("meera", "Goa", 400));

        // Lambdas, method references, functional interfaces.
        Predicate<Order> big = o -> o.total() > 100;
        Function<Order, String> who = Order::customer;
        BinaryOperator<Double> add = Double::sum;
        System.out.println("lambdas: big orders by " + orders.stream().filter(big).map(who).distinct().sorted().collect(Collectors.toList()));

        // Streams + collectors.
        Map<String, Double> perCity = orders.stream().collect(Collectors.groupingBy(Order::city, TreeMap::new, Collectors.summingDouble(Order::total)));
        Map<Boolean, Long> split = orders.stream().collect(Collectors.partitioningBy(big, Collectors.counting()));
        double revenue = orders.stream().map(Order::total).reduce(0.0, add);
        System.out.println("streams: per city " + perCity + ", big/small " + split + ", revenue " + revenue
                + ", IntStream squares " + IntStream.rangeClosed(1, 4).map(x -> x * x).boxed().collect(Collectors.toList()));

        // Default and static interface methods.
        System.out.println("default method: 200 with 10% off = " + Discountable.of(200).discounted(10));

        // Optional.
        Optional<Order> fromGoa = orders.stream().filter(o -> o.city().equals("Goa")).findFirst();
        Optional<Order> fromDelhi = orders.stream().filter(o -> o.city().equals("Delhi")).findFirst();
        System.out.println("Optional: Goa -> " + fromGoa.map(Order::customer).orElse("none") + ", Delhi -> " + fromDelhi.map(Order::customer).orElse("none"));

        // java.time (fixed date for stable output).
        LocalDate release = LocalDate.of(2014, 3, 18);
        System.out.println("java.time: Java 8 released " + release.format(DateTimeFormatter.ofPattern("dd MMM uuuu", Locale.ENGLISH))
                + " (" + release.getDayOfWeek() + "), first day of next month " + release.with(TemporalAdjusters.firstDayOfNextMonth())
                + ", age at 2026-11-19 " + Period.between(release, LocalDate.of(2026, 11, 19)));

        // CompletableFuture + LongAdder.
        CompletableFuture<Double> price = CompletableFuture.supplyAsync(() -> 99.0);
        CompletableFuture<Integer> qty = CompletableFuture.supplyAsync(() -> 3);
        double invoice = price.thenCombine(qty, (p, q) -> p * q).thenApply(v -> v * 1.18).get();
        LongAdder hits = new LongAdder();
        IntStream.range(0, 1000).parallel().forEach(i -> hits.increment());
        System.out.printf("CompletableFuture invoice with tax %.2f, LongAdder hits %d%n", invoice, hits.sum());

        // Small Java 8 additions.
        StringJoiner sj = new StringJoiner(", ", "{", "}");
        orders.forEach(o -> sj.add(o.customer()));
        Map<String, Integer> counts = new TreeMap<>();
        orders.forEach(o -> counts.merge(o.customer(), 1, Integer::sum));
        System.out.println("StringJoiner " + sj + ", Map.merge " + counts + ", Base64 " + Base64.getEncoder().encodeToString("java8".getBytes())
                + ", unsigned " + Integer.toUnsignedString(-1));
    }
}`,
    walk:
      "A Predicate lambda and a method reference find the customers with big orders. A stream pipeline then groups revenue per city into a TreeMap, partitions the orders into big and small with counts, reduces the totals with a BinaryOperator, and squares a range with IntStream. The Discountable interface shows a default method calling an abstract one, plus a static factory that returns a lambda. Optional handles a city with an order (Goa) and one without (Delhi) without null checks.\n\njava.time formats Java 8's release date, finds its day of the week and the first day of the next month, and computes a Period up to a fixed date. Two CompletableFutures are combined, then transformed to include 18% tax. LongAdder counts increments from a parallel stream. The last line shows StringJoiner, Map.merge, Base64 and unsigned conversion. The Order type is a record (Java 16), used here to keep the code short.",
    anim: [
      "Java 8: from loops to pipelines",
      [
        ["data", "orders", "collection"],
        ["filter", "filter(big)", "Predicate"],
        ["map", "map(customer)", "Function"],
        ["collect", "collect", "Collectors"],
        ["result", "result", "List / Map"],
      ],
      [
        ["data", "filter", "stream()", "stream() turns the collection into a lazy pipeline source."],
        ["filter", "map", "lambda", "A lambda Predicate keeps orders above 100; nothing runs yet."],
        ["map", "collect", "method ref", "Order::customer maps each order to its customer name."],
        ["collect", "result", "terminal", "collect triggers the pipeline and gathers results with a Collector."],
        ["data", "result", "parallel()", "The same pipeline can run in parallel on the ForkJoin common pool."],
      ],
    ],
    release: 21,
    mistakes: [
      "Using streams for side effects (forEach that mutates shared state) instead of collectors.",
      "Using Optional for fields and method parameters. It is designed for return values.",
      "Mixing java.time with legacy Date/Calendar without explicit conversions.",
    ],
    qa: [
      [
        "Why was Java 8 so widely adopted, and for so long?",
        "Lambdas and streams modernised the language, and it was an LTS with long free updates, while Java 9's modules caused migration friction. Many companies stayed on 8 until 11 or 17.",
      ],
      [
        "What replaced PermGen?",
        "Metaspace, which stores class metadata in native memory, grows automatically, and is limited by `-XX:MaxMetaspaceSize`.",
      ],
      [
        "Which is the most important Java 8 feature?",
        "Lambdas. They enabled the Stream API, functional composition, CompletableFuture's fluent style, and much of how later Java APIs are designed.",
      ],
    ],
    ex: [
      "Using streams, find the customer with the highest total spending across all their orders.",
      "`orders.stream().collect(groupingBy(Order::customer, summingDouble(Order::total))).entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(\"none\")`, which gives \"meera\" (400) for the sample data.",
    ],
  }),

  lesson("Java 9 (2017): The Module System, JShell, Collection Factories and the Process API", {
    intro:
      "Java 9 (September 2017) was the last release on the old multi-year schedule. Its headline is **Project Jigsaw**, the Java Platform Module System, which modularised the JDK itself. It also brought:\n\n- **JShell**\n- `List.of`, `Set.of` and `Map.of`\n- private interface methods\n- new Stream and Optional methods\n- the Process API\n- the reactive Flow API\n- compact strings\n- G1 as the default collector\n- multi-release JARs\n- the new `9.0.1` version-string format",
    topics: [
      [
        "The Java Platform Module System (JPMS)",
        "A module declares its name, its dependencies and its exported packages in `module-info.java`: `module shop.core { requires java.sql; exports com.shop.api; opens com.shop.model to com.fasterxml.jackson.databind; }`. It gives **reliable configuration**, because missing modules are detected at startup, and **strong encapsulation**, because non-exported packages are invisible. The JDK is split into about 70 modules (java.base, java.sql, java.net.http and others). **jlink** builds custom runtime images that contain only the modules you need. Classpath code keeps working in the \"unnamed module\".",
      ],
      [
        "JShell",
        "`jshell` is Java's interactive REPL: you type expressions and declarations and see the results at once. It is useful for learning, exploring APIs and prototyping. Commands include `/vars`, `/methods`, `/imports`, `/edit`, `/save` and `/open`, with tab completion and automatic imports of common packages.",
      ],
      [
        "Collection factory methods",
        "`List.of(...)`, `Set.of(...)`, `Map.of(k1, v1, ...)` (up to 10 pairs) and `Map.ofEntries(entry(k, v), ...)` create **unmodifiable**, null-hostile, compact collections. Duplicate elements in Set.of and duplicate keys in Map.of throw IllegalArgumentException. They are perfect for constants and test data, and they replace `Collections.unmodifiableList(Arrays.asList(...))`.",
      ],
      [
        "Language tweaks: private interface methods, try-with-resources, diamond",
        "- **Private interface methods**, static and instance, let default methods share code.\n- **try-with-resources** accepts an existing **effectively final** variable: `try (reader) { ... }`.\n- The **diamond** works with anonymous classes.\n- `@SafeVarargs` is allowed on private methods.\n- The single underscore `_` is no longer a valid identifier, which reserved it for Java 22's unnamed variables.",
      ],
      [
        "Stream, Optional, Process and other API additions",
        "- **Streams**: `takeWhile`, `dropWhile`, `iterate(seed, hasNext, next)` and `ofNullable`.\n- **Optional**: `ifPresentOrElse`, `or` and `stream`.\n- **Collectors**: `filtering` and `flatMapping`.\n- **The Process API**: `ProcessHandle.current().pid()`, `info()`, `children()`, `descendants()`, `onExit()`, and listing all processes.\n- **The Flow API** (`java.util.concurrent.Flow`): reactive-streams interfaces Publisher, Subscriber and Subscription, and SubmissionPublisher.\n- **CompletableFuture**: `orTimeout`, `completeOnTimeout` and `delayedExecutor`.\n- **VarHandle**, the safe replacement for Unsafe field access.\n- **StackWalker**.\n- `Objects.requireNonNullElse`.",
      ],
      [
        "JVM changes: compact strings, G1 default, multi-release JARs",
        "- **Compact strings** (JEP 254): Latin-1 strings use one byte per character.\n- **G1** became the default collector.\n- **String concatenation** through invokedynamic (`StringConcatFactory`).\n- **Multi-release JARs** hold version-specific classes under `META-INF/versions/N`.\n- **Unified JVM logging**: `-Xlog`.\n- The HTML5 Javadoc search.\n- Applets and the browser plug-in deprecated.\n- The new version scheme (JEP 223): `9`, `9.0.1` and so on.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {
    // Private interface methods (9) shared by default methods.
    interface Greeter {
        default String morning(String n) { return wrap("Good morning", n); }
        default String evening(String n) { return wrap("Good evening", n); }
        private String wrap(String greeting, String n) { return greeting + ", " + n + "!"; }
    }

    public static void main(String[] args) throws Exception {
        // Modules at runtime.
        ModuleLayer boot = ModuleLayer.boot();
        System.out.println("JPMS: java.sql module present " + boot.findModule("java.sql").isPresent()
                + ", java.base exports java.lang " + Object.class.getModule().isExported("java.lang")
                + ", JDK modules in this runtime > 20: " + (boot.modules().size() > 20));

        // Collection factories.
        List<String> list = List.of("jigsaw", "jshell");
        Map<String, Integer> map = Map.ofEntries(Map.entry("year", 2017), Map.entry("version", 9));
        try { list.add("x"); } catch (UnsupportedOperationException e) { System.out.println("List.of " + list + " is unmodifiable; Map.ofEntries " + new TreeMap<>(map)); }

        // Private interface methods + try-with-resources on an existing variable.
        Greeter g = new Greeter() { };                       // diamond-like anonymous class use
        System.out.println(g.morning("Duke") + " " + g.evening("Duke"));
        java.io.StringReader reader = new java.io.StringReader("effectively final resource");
        try (reader) { System.out.println("try (reader) read " + (char) reader.read() + "..."); }

        // Stream + Optional additions.
        System.out.println("takeWhile " + Stream.of(2, 4, 6, 7, 8).takeWhile(n -> n % 2 == 0).collect(Collectors.toList())
                + ", dropWhile " + Stream.of(2, 4, 6, 7, 8).dropWhile(n -> n % 2 == 0).collect(Collectors.toList())
                + ", iterate " + Stream.iterate(1, n -> n < 50, n -> n * 3).collect(Collectors.toList()));
        Optional<String> empty = Optional.empty();
        System.out.print("Optional.or -> " + empty.or(() -> Optional.of("fallback")).get() + ", ifPresentOrElse -> ");
        empty.ifPresentOrElse(v -> System.out.println(v), () -> System.out.println("absent"));

        // Process API.
        ProcessHandle self = ProcessHandle.current();
        System.out.println("ProcessHandle: pid > 0 " + (self.pid() > 0) + ", command known " + self.info().command().isPresent());

        // Flow API: a SubmissionPublisher delivering to a subscriber.
        List<String> received = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch done = new CountDownLatch(1);
        try (SubmissionPublisher<String> publisher = new SubmissionPublisher<>()) {
            publisher.subscribe(new Flow.Subscriber<>() {
                Flow.Subscription sub;
                public void onSubscribe(Flow.Subscription s) { sub = s; s.request(1); }
                public void onNext(String item) { received.add(item); sub.request(1); }
                public void onError(Throwable t) { done.countDown(); }
                public void onComplete() { done.countDown(); }
            });
            for (String s : List.of("event-1", "event-2", "event-3")) publisher.submit(s);
        }
        done.await(2, TimeUnit.SECONDS);
        System.out.println("Flow API subscriber received " + received);

        // CompletableFuture.completeOnTimeout (9).
        String r = CompletableFuture.supplyAsync(() -> { try { Thread.sleep(300); } catch (InterruptedException e) { } return "slow"; })
                .completeOnTimeout("timed out -> default", 20, TimeUnit.MILLISECONDS).join();
        System.out.println("completeOnTimeout -> " + r + ", Runtime.version() feature " + (Runtime.version().feature() >= 9 ? ">= 9" : "?"));
    }
}`,
    walk:
      "The program inspects the module system at runtime: the boot layer contains java.sql, java.base exports java.lang, and the runtime has dozens of JDK modules. `List.of` and `Map.ofEntries` create unmodifiable collections. The Greeter interface's two default methods share a private helper, which was impossible before Java 9. The try statement reuses an existing effectively final reader.\n\n`takeWhile` stops at the first odd number, `dropWhile` skips until it, and `iterate` with a predicate generates 1, 3, 9 and 27. `Optional.or` supplies a fallback Optional, and `ifPresentOrElse` handles absence. ProcessHandle reports the current process. A SubmissionPublisher delivers three events to a Flow.Subscriber, which requests them one at a time (back-pressure). `completeOnTimeout` substitutes a default when a slow task misses its deadline.",
    anim: [
      "Modules: explicit dependencies and exports",
      [
        ["app", "shop.app", "module"],
        ["core", "shop.core", "exports api"],
        ["sql", "java.sql", "JDK module"],
        ["base", "java.base", "always read"],
        ["jlink", "jlink image", "only needed"],
      ],
      [
        ["app", "core", "requires", "shop.app declares requires shop.core and can use only its exported packages."],
        ["core", "sql", "requires", "shop.core requires java.sql for JDBC; the dependency is checked at startup."],
        ["sql", "base", "implicit", "Every module reads java.base automatically."],
        ["core", "app", "encapsulated", "Non-exported packages of shop.core are invisible to shop.app."],
        ["app", "jlink", "jlink", "jlink assembles a runtime with exactly app, core, java.sql and java.base."],
      ],
    ],
    mistakes: [
      "Expecting `List.of` to accept null elements. It throws NullPointerException.",
      "Assuming every library works on the module path. Many still run on the classpath (in the unnamed module), and some need `--add-opens` for reflection.",
    ],
    qa: [
      [
        "What is an automatic module?",
        "A plain JAR placed on the module path. It gets a module name from its manifest or file name, exports all of its packages, and reads all other modules. It is a bridge for migrating to modules.",
      ],
      [
        "What is the difference between exports and opens?",
        "`exports` makes a package's public types accessible at compile time and run time. `opens` allows deep reflection, including private members, at run time, as frameworks such as Jackson or Hibernate need.",
      ],
      [
        "Why did Java 9 cause migration pain?",
        "Strong encapsulation of internals (`sun.misc` and others), removed APIs, the new version string format that broke version parsing, and libraries using illegal reflective access all needed updates.",
      ],
    ],
    ex: [
      "Write a module-info.java for a module `com.acme.report` that uses JDBC and the HttpClient, exposes `com.acme.report.api`, and lets Jackson reflect over `com.acme.report.dto`.",
      "`module com.acme.report { requires java.sql; requires java.net.http; requires com.fasterxml.jackson.databind; exports com.acme.report.api; opens com.acme.report.dto to com.fasterxml.jackson.databind; }`",
    ],
  }),

  lesson("Java 10 (2018): var, Unmodifiable Copies and the First Six-Month Release", {
    intro:
      "Java 10 (March 2018) was the **first release of the six-month cadence**. It is small, but it brought `var` for local variable type inference, plus:\n\n- unmodifiable copy methods\n- `Optional.orElseThrow()`\n- application class-data sharing\n- a parallel full GC for G1\n- an experimental Graal JIT\n- time-based version numbers\n\nThe program focuses on `var` and its rules.",
    topics: [
      [
        "var: local variable type inference (JEP 286)",
        "`var` lets the compiler infer the type of a local variable from its initializer: `var list = new ArrayList<Map<String, Integer>>();`. It is still **static typing**: the variable has a fixed type, and `var x = 5; x = \"s\";` does not compile. It is allowed for:\n\n- local variables with an initializer\n- enhanced and classic for-loop variables\n- try-with-resources variables\n\nIt is not allowed for fields, method parameters, return types, catch parameters, variables without an initializer, or initializers of `null`, array literals (`{1, 2}`) or bare lambdas. `var` is a reserved type name, not a keyword.",
        "var map = new HashMap<String, List<Integer>>();   // inferred\nfor (var e : map.entrySet()) { ... }\n// var x;            // error: no initializer\n// var f = () -> 1;  // error: lambda needs a target type",
      ],
      [
        "When to use var, and when not to",
        "Use `var` when the type is **obvious from the right-hand side** (`var user = new User()`, `var reader = Files.newBufferedReader(p)`), or when it is long and repetitive (generic types, iterator variables). Avoid it when the type is not obvious (`var result = service.process();`), or when you rely on a specific interface type. `var list = new ArrayList<String>()` is an `ArrayList`, not a `List`. Watch out with numeric literals too: `var x = 0;` is an int, and `var y = 0L;` is a long. Good variable names matter more with var.",
      ],
      [
        "Unmodifiable copies and Optional.orElseThrow()",
        "`List.copyOf`, `Set.copyOf` and `Map.copyOf` create unmodifiable **snapshots** of existing collections, and return the argument itself if it is already an unmodifiable copy. `Collectors.toUnmodifiableList`, `toUnmodifiableSet` and `toUnmodifiableMap` do the same in streams. `Optional.orElseThrow()` with no arguments is the clearer alternative to `get()`, throwing NoSuchElementException when the Optional is empty.",
      ],
      [
        "JVM improvements",
        "- **Application class-data sharing** (AppCDS, JEP 310): an archive of pre-parsed application classes shared between JVMs, for faster startup and lower memory use.\n- **A parallel full GC for G1** (JEP 307).\n- **Thread-local handshakes** (JEP 312): threads can be stopped individually instead of at a global safepoint.\n- **The Graal JIT**, experimental (JEP 317).\n- **Heap allocation on alternative memory devices** (JEP 316).\n- **Container awareness** improvements, so the JVM respects Docker CPU and memory limits.\n- **Time-based release versioning** (JEP 322): `$FEATURE.$INTERIM.$UPDATE.$PATCH`.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // var with generic types: the inferred type is still static.
        var scores = new HashMap<String, List<Integer>>();
        scores.computeIfAbsent("asha", k -> new ArrayList<>()).add(90);
        scores.computeIfAbsent("asha", k -> new ArrayList<>()).add(85);
        scores.computeIfAbsent("ravi", k -> new ArrayList<>()).add(70);
        for (var entry : new TreeMap<>(scores).entrySet()) {              // var in for-each
            var avg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0);
            System.out.println("var in loops: " + entry.getKey() + " average " + avg);
        }

        // The inferred type is the concrete class, not the interface.
        var names = new ArrayList<String>();
        names.add("ten");
        names.ensureCapacity(10);                                        // ArrayList method: allowed because var = ArrayList
        System.out.println("var names is an " + names.getClass().getSimpleName() + ", ensureCapacity is available");

        // Literal pitfalls.
        var small = 0;            // int
        var big = 0L;             // long
        var ratio = 1 / 2;        // int division -> 0
        var precise = 1 / 2.0;    // double -> 0.5
        System.out.println("literals: int " + small + ", long " + big + ", 1/2 = " + ratio + ", 1/2.0 = " + precise);

        // var with try-with-resources.
        Path tmp = Files.createTempFile("j10", ".txt");
        Files.writeString(tmp, "first line\nsecond line");
        try (var reader = Files.newBufferedReader(tmp)) {
            System.out.println("var in try-with-resources read: " + reader.readLine());
        }

        // Unmodifiable copies (10).
        var source = new ArrayList<>(List.of(3, 1, 2));
        var copy = List.copyOf(source);
        source.add(4);
        var sortedSet = Stream.of("b", "a", "c").collect(Collectors.toUnmodifiableSet());
        System.out.println("List.copyOf snapshot " + copy + " (source now " + source + "), toUnmodifiableSet size " + sortedSet.size()
                + ", copyOf(copy) returns same instance: " + (List.copyOf(copy) == copy));

        // Optional.orElseThrow() (10).
        var present = Optional.of("java 10");
        try { Optional.empty().orElseThrow(); }
        catch (NoSuchElementException e) { System.out.println("orElseThrow on present -> " + present.orElseThrow() + ", on empty -> NoSuchElementException"); }

        // Time-based versioning (10).
        var v = Runtime.version();
        System.out.println("Runtime.version().feature() >= 10: " + (v.feature() >= 10) + ", has interim/update fields: " + (v.interim() >= 0 && v.update() >= 0));
    }
}`,
    walk:
      "A HashMap whose long generic type is inferred with `var` collects lists of scores. The for-each loop declares its entry and the computed average with `var`. Because `var names = new ArrayList<String>()` infers ArrayList itself, ArrayList-only methods such as `ensureCapacity` are available. That is convenient, but it ties the code to the implementation.\n\nThe literal examples show that `var` infers exactly what the expression produces: `1 / 2` is the int 0, while `1 / 2.0` is the double 0.5. `var` also works in try-with-resources. `List.copyOf` makes a snapshot that does not follow later changes to its source, and returns the same instance when it is given an unmodifiable copy. `orElseThrow()` is the clearer form of `get()`. The version API shows Java 10's time-based numbering fields.",
    anim: [
      "How var infers a type",
      [
        ["decl", "var names = ...", "declaration"],
        ["init", "initializer", "new ArrayList<>"],
        ["javac", "javac", "infers type"],
        ["type", "ArrayList", "static type"],
      ],
      [
        ["decl", "init", "look right", "var requires an initializer; the compiler examines its type."],
        ["init", "javac", "type of expr", "The expression's type is ArrayList<String>: the concrete class, not List."],
        ["javac", "type", "fix type", "The variable is given that exact static type; this is not dynamic typing."],
        ["type", "decl", "reassign?", "Assigning a String to names later is a compile error, as with explicit types."],
        ["decl", "decl", "no init", "Without an initializer (var x;) or with null, the type cannot be inferred: error."],
      ],
    ],
    release: 21,
    mistakes: [
      "Using `var` where the reader cannot tell the type, which hurts readability.",
      "Expecting `var list = new ArrayList<>()` to infer `List<String>`. With the diamond and no other information, it infers `ArrayList<Object>`.",
    ],
    qa: [
      [
        "Can var be used for lambda parameters?",
        "Yes, since Java 11 (JEP 323): `(var x, var y) -> x + y`. It allows annotations such as `(@NonNull var s) -> s.length()`.",
      ],
      [
        "Is var the same as JavaScript's var or C#'s dynamic?",
        "No. It is compile-time inference like C#'s `var` or Kotlin's `val` and `var`. The variable's type is fixed and fully checked.",
      ],
      [
        "Why did Java switch to six-month releases?",
        "To deliver features steadily instead of in large, multi-year releases that were often delayed by one big feature. Features ship when they are ready, and previews gather feedback early.",
      ],
    ],
    ex: [
      "Which of these compile: (a) `var a = null;` (b) `var b = new int[] {1, 2};` (c) `var c = {1, 2};` (d) `for (var i = 0; i < 3; i++) {}` (e) `var d = (Runnable) () -> {};`?",
      "(a) No: null has no usable type. (b) Yes: int[]. (c) No: an array initializer needs an explicit type. (d) Yes: int. (e) Yes: the cast gives the lambda its target type, Runnable.",
    ],
  }),

  lesson("Java 11 (2018, LTS): HttpClient, String and Files Methods, Single-File Launch and Java EE Removal", {
    intro:
      "Java 11 (September 2018) was the first LTS of the new cadence, and the version many companies moved to from Java 8. It added:\n\n- the standard **HttpClient**\n- new **String** methods\n- `Files.readString` and `writeString`\n- `var` in lambda parameters\n- **single-file source launching**\n- `Predicate.not`\n- TLS 1.3\n- ZGC and Epsilon (experimental)\n- Flight Recorder in OpenJDK\n\nIt **removed Java EE, CORBA and the bundled JavaFX**, and Oracle JDK and OpenJDK builds became functionally the same.",
    topics: [
      [
        "HttpClient (JEP 321)",
        "`java.net.http.HttpClient` became standard after incubating in 9 and 10. It supports **HTTP/1.1 and HTTP/2**, WebSockets, and **sync (`send`) and async (`sendAsync`, which returns a CompletableFuture)** calls, with a fluent builder, redirects, timeouts, proxies and authentication. Its body handlers write responses to a String, bytes, a file, a stream or lines. It replaced `HttpURLConnection` and many uses of Apache HttpClient. HTTP/3 support arrived in Java 26.",
        "HttpClient client = HttpClient.newHttpClient();\nHttpRequest req = HttpRequest.newBuilder(URI.create(\"https://api.example.com\")).build();\nHttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());",
      ],
      [
        "String, Files and Predicate additions",
        "- **String**: `isBlank()`, `lines()` (a stream of lines), `strip()`, `stripLeading()` and `stripTrailing()` (Unicode whitespace aware, unlike `trim`), and `repeat(n)`.\n- **Files**: `readString(path)` and `writeString(path, text)`, UTF-8 by default.\n- **Predicate**: `not(p)`, as in `filter(Predicate.not(String::isBlank))`.\n- **Collection**: `toArray(IntFunction)`, as in `list.toArray(String[]::new)`.\n- **Optional**: `isEmpty()`.\n- **Path**: `of(...)`.",
      ],
      [
        "Launching single-file source programs (JEP 330)",
        "`java Hello.java` compiles the file in memory and runs it, with no separate javac step. On Unix, a shebang (`#!/usr/bin/java --source 11`) makes Java files executable scripts. The file may contain several classes; the first top-level class must have `main`. It is ideal for learning and for small tools. Java 22 extended it to multi-file programs.",
      ],
      [
        "var in lambdas, nest-based access and other language changes",
        "`(var x, var y) -> x + y` (JEP 323) allows annotations on implicitly typed lambda parameters. **Nest-based access control** (JEP 181) lets nested classes access each other's private members directly, without synthetic bridge methods, through the `NestHost` and `NestMembers` attributes. **Dynamic class-file constants** (`CONSTANT_Dynamic`, JEP 309) laid groundwork for later features.",
      ],
      [
        "Removals and JVM features",
        "**Removed**: the Java EE modules (JAX-WS, JAXB, JAF, Common Annotations) and CORBA (JEP 320), so you must add them as Maven dependencies (Jakarta EE). Also gone: JavaFX from the JDK (it became OpenJFX), Java Web Start, the applet plug-in, and Nashorn's future (deprecated). **Added**:\n\n- **ZGC** (experimental), a scalable low-latency collector\n- **Epsilon**, a no-op GC for testing\n- **Java Flight Recorder** open-sourced\n- **TLS 1.3**\n- ChaCha20 and Poly1305 ciphers\n- Curve25519 key agreement",
      ],
    ],
    code: String.raw`import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    // Nest-based access: the nested class reads the outer class's private field directly.
    private static final String SECRET = "nestmates";
    static class Inner { String reveal() { return SECRET; } }

    public static void main(String[] args) throws Exception {
        // String additions.
        String text = "\u2003 Java 11 LTS \u2003";             // em spaces: trim() would keep them
        System.out.println("strip [" + text.strip() + "], trim length " + text.trim().length() + " vs strip length " + text.strip().length()
                + ", isBlank(\"  \\t\") " + "  \t".isBlank() + ", repeat " + "=".repeat(5));
        String multi = "alpha\n\nbeta\ngamma";
        List<String> nonBlank = multi.lines().filter(Predicate.not(String::isBlank)).collect(Collectors.toList());
        System.out.println("lines() + Predicate.not -> " + nonBlank + ", toArray(String[]::new) length " + nonBlank.toArray(String[]::new).length);

        // Files.writeString / readString.
        Path file = Files.writeString(Files.createTempFile("j11", ".txt"), "written with Files.writeString");
        System.out.println("Files.readString -> " + Files.readString(file) + ", Path.of works: " + Files.exists(Path.of(file.toString())));

        // var in lambda parameters.
        BiFunction<Integer, Integer, Integer> add = (var a, var b) -> a + b;
        System.out.println("(var a, var b) -> a + b gives " + add.apply(4, 7) + ", Optional.isEmpty " + Optional.empty().isEmpty());

        // Nest-based access control.
        System.out.println("nest host of Inner is " + Inner.class.getNestHost().getSimpleName() + ", Inner reads private field: " + new Inner().reveal());

        // HttpClient: build a client and requests (no network call in this demo).
        HttpClient client = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2).connectTimeout(Duration.ofSeconds(3))
                .followRedirects(HttpClient.Redirect.NORMAL).build();
        HttpRequest get = HttpRequest.newBuilder(URI.create("https://example.com/users/7")).header("Accept", "application/json").GET().build();
        HttpRequest post = HttpRequest.newBuilder(URI.create("https://example.com/users"))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString("{\"name\":\"Duke\"}")).build();
        System.out.println("HttpClient " + client.version() + " redirects " + client.followRedirects() + "; " + get.method() + " " + get.uri().getPath()
                + ", " + post.method() + " body length " + post.bodyPublisher().map(HttpRequest.BodyPublisher::contentLength).orElse(-1L));

        // Java EE modules are gone from the JDK.
        System.out.println("javax.xml.bind (JAXB) in the JDK: " + ModuleLayer.boot().findModule("java.xml.bind").isPresent()
                + ", java.net.http present: " + ModuleLayer.boot().findModule("java.net.http").isPresent());
    }
}`,
    walk:
      "The string contains em spaces (U+2003). `trim()` removes only characters up to U+0020, so the em spaces stay, while `strip()` removes all Unicode whitespace, as the two lengths show. `lines()` splits the text, and `Predicate.not(String::isBlank)` filters out the empty line, without writing a negating lambda. `Files.writeString` and `readString` round-trip a file in two calls. A lambda declares its parameters with `var`.\n\nThe nested Inner class reads the outer class's private constant. Since Java 11 the JVM allows this directly between nestmates, and `getNestHost()` reports Main. The HttpClient section builds a client and a GET and a POST request, and reports their settings without contacting the network. Sending would be `client.send(get, BodyHandlers.ofString())`. Finally the boot layer confirms that JAXB is no longer part of the JDK, while java.net.http is.",
    anim: [
      "HttpClient: sync and async",
      [
        ["app", "your code", "builds request"],
        ["client", "HttpClient", "HTTP/1.1, HTTP/2"],
        ["server", "server", "REST API"],
        ["cf", "CompletableFut.", "sendAsync"],
      ],
      [
        ["app", "client", "send(req)", "send() blocks the calling thread until the response arrives."],
        ["client", "server", "HTTP/2 stream", "The client negotiates HTTP/2 when the server supports it, multiplexing requests."],
        ["server", "client", "response", "The BodyHandler converts the body to a String, bytes, a file or a stream."],
        ["app", "cf", "sendAsync(req)", "sendAsync returns a CompletableFuture immediately: no thread waits."],
        ["cf", "app", "thenApply", "Callbacks process the response when it is ready, composing with other futures."],
      ],
    ],
    release: 21,
    mistakes: [
      "Upgrading from 8 to 11 without adding the JAXB or JAX-WS dependencies that used to be in the JDK.",
      "Using `trim()` for user input containing Unicode spaces. `strip()` is the Unicode-aware version.",
      "Creating a new HttpClient for every request instead of sharing one.",
    ],
    qa: [
      [
        "Is Oracle JDK 11 free?",
        "Oracle JDK 11 required a commercial license for production use, while OpenJDK builds (Temurin, Corretto, Zulu, Red Hat) were free and functionally identical. Since 17, Oracle's \"No-Fee Terms\" make Oracle JDK free again for a period.",
      ],
      [
        "What is Epsilon GC for?",
        "It allocates memory but never collects it. It is useful for performance testing, extremely short-lived jobs, and measuring allocation pressure.",
      ],
      [
        "Can a single-file program use external libraries?",
        "Yes, with `java --class-path lib/x.jar Script.java`. It still compiles in memory, but cannot span several source files until Java 22.",
      ],
    ],
    ex: [
      "Write the code that sends the GET request asynchronously, prints the status code and body length, and handles failures without blocking until the end.",
      "`client.sendAsync(get, HttpResponse.BodyHandlers.ofString()).thenApply(r -> r.statusCode() + \" \" + r.body().length()).exceptionally(ex -> \"failed: \" + ex.getMessage()).thenAccept(System.out::println).join();`",
    ],
  }),

  lesson("Java 12 (2019) and Java 13 (2019): Switch Expressions Preview, Text Blocks Preview, teeing and Shenandoah", {
    intro:
      "Java 12 (March 2019) and Java 13 (September 2019) were short-term releases that previewed two of modern Java's most visible features: **switch expressions** and **text blocks**. They also added:\n\n- `Collectors.teeing`\n- `String.indent` and `transform`\n- compact number formatting\n- `Files.mismatch`\n- the **Shenandoah** GC\n- JVM constants API\n- default CDS archives\n- dynamic CDS archives\n- ZGC uncommit\n- a reimplemented legacy Socket API\n\nBoth previews are final today, so the program uses their final forms.",
    topics: [
      [
        "Switch expressions (preview in 12 and 13, final in 14)",
        "Java 12 (JEP 325) previewed **arrow labels** (`case A, B -> ...`) with no fall-through, and switch as an **expression** that yields a value. Java 13 (JEP 354) replaced the preview's `break value` with **`yield value`** for block bodies. Previews need `--enable-preview --release 12`, or 13. The feature became final in Java 14 (JEP 361).",
        "int days = switch (month) {\n    case FEB -> leap ? 29 : 28;\n    case APR, JUN, SEP, NOV -> 30;\n    default -> { yield 31; }\n};",
      ],
      [
        "Text blocks (preview in 13, final in 15)",
        "Java 13 (JEP 355) previewed multi-line string literals delimited by `\"\"\"`, with automatic removal of incidental indentation, line-ending normalisation, and no need to escape quotes. Java 14 added the `\\` (no newline) and `\\s` escapes in a second preview, and Java 15 made the feature final. Text blocks make embedded SQL, JSON, HTML and test fixtures readable.",
      ],
      [
        "Java 12 library additions",
        "- **`Collectors.teeing(c1, c2, merger)`**: feeds every element to two collectors and merges both results, for example computing the average as sum/count, or min and max, in one pass.\n- **`String.indent(n)`**: adds or removes leading spaces on each line, and normalises line endings.\n- **`String.transform(fn)`**: applies a function to the string, which is useful for chaining.\n- **`NumberFormat.getCompactNumberInstance`**: formats 1,200 as \"1.2K\" or \"1 thousand\".\n- **`Files.mismatch(p1, p2)`**: the position of the first differing byte, or -1.\n- **The JVM Constants API** (`java.lang.constant`): ClassDesc, MethodTypeDesc and others.",
      ],
      [
        "Shenandoah and other GC work",
        "**Shenandoah** (JEP 189, Red Hat, experimental in 12, production in 15) is a low-pause collector that **compacts concurrently**, so pause times do not depend on heap size. G1 gained **abortable mixed collections** (JEP 344), and in 12 it promptly **returns unused memory to the OS** (JEP 346). Java 13 let **ZGC uncommit unused memory** (JEP 351). **Default CDS archives** (12) and **dynamic CDS archives** (`-XX:ArchiveClassesAtExit`, 13) made startup faster.",
      ],
      [
        "Java 13: reimplemented legacy Socket API",
        "JEP 353 replaced the old, hard-to-maintain `PlainSocketImpl` behind `java.net.Socket` and `ServerSocket` with `NioSocketImpl`, a simpler implementation based on NIO internals. This prepared the classic blocking socket API for **virtual threads** (Project Loom), which can now park instead of blocking an OS thread. Java 15 did the same for DatagramSocket (JEP 373).",
      ],
    ],
    code: String.raw`import java.nio.file.*;
import java.text.NumberFormat;
import java.util.*;
import java.util.stream.*;

public class Main {
    enum Month { JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC }

    static int days(Month m, boolean leap) {
        return switch (m) {                                   // switch expression (previewed in 12/13)
            case FEB -> leap ? 29 : 28;
            case APR, JUN, SEP, NOV -> 30;
            default -> {
                int full = 31;
                yield full;                                   // 'yield' introduced in 13
            }
        };
    }

    public static void main(String[] args) throws Exception {
        System.out.println("switch expression: FEB leap " + days(Month.FEB, true) + ", JUN " + days(Month.JUN, false) + ", DEC " + days(Month.DEC, false)
                + ", days in 2024 = " + Arrays.stream(Month.values()).mapToInt(m -> days(m, true)).sum());

        // Text block (previewed in 13).
        String sql = """
                SELECT name, salary
                FROM employees
                WHERE dept = 'eng'
                """;
        System.out.println("text block has " + sql.lines().count() + " lines, first: " + sql.lines().findFirst().get());

        // Collectors.teeing (12): average in one pass.
        double avg = Stream.of(10, 20, 30, 40).collect(Collectors.teeing(
                Collectors.summingInt(Integer::intValue), Collectors.counting(), (sum, n) -> (double) sum / n));
        String range = Stream.of(7, 3, 9, 1).collect(Collectors.teeing(
                Collectors.minBy(Integer::compare), Collectors.maxBy(Integer::compare), (mn, mx) -> mn.get() + ".." + mx.get()));
        System.out.println("teeing: average " + avg + ", range " + range);

        // String.indent and transform (12).
        String indented = "line1\nline2".indent(4);
        String shout = "java".transform(String::toUpperCase).transform(s -> s + "!");
        System.out.println("indent(4) first line [" + indented.lines().findFirst().get() + "], transform -> " + shout);

        // Compact number formatting (12).
        NumberFormat shortFmt = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
        NumberFormat longFmt = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.LONG);
        System.out.println("compact numbers: " + shortFmt.format(1_200) + ", " + shortFmt.format(3_400_000) + ", " + longFmt.format(2_000_000_000L));

        // Files.mismatch (12).
        Path a = Files.writeString(Files.createTempFile("m", "a"), "java twelve");
        Path b = Files.writeString(Files.createTempFile("m", "b"), "java thirteen");
        Path c = Files.writeString(Files.createTempFile("m", "c"), "java twelve");
        System.out.println("Files.mismatch: a vs b at byte " + Files.mismatch(a, b) + ", a vs c " + Files.mismatch(a, c));

        // Constants API (12).
        var desc = String.class.describeConstable().orElseThrow();
        System.out.println("JVM constants API: " + desc.descriptorString());
    }
}`,
    walk:
      "`days` is a switch expression over an enum, the feature previewed in Java 12 and 13. FEB returns 28 or 29 through an arrow case, four months share one case label, and the default uses a block with `yield`, the keyword introduced by Java 13. Summing the days of every month of a leap year gives 366. The SQL text block keeps its three lines, without escapes or concatenation.\n\n`Collectors.teeing` computes an average from a sum and a count in a single pass, and min..max from two collectors. `indent(4)` prefixes every line with four spaces, and `transform` chains two functions on a string. Compact number formatting prints 1K and 3M (no fraction digits unless you call `setMaximumFractionDigits`) and 2 billion. `Files.mismatch` finds the first differing byte (index 6, where \"twelve\" and \"thirteen\" diverge after \"java t\"), or -1 for identical files. The JVM constants API describes String as the descriptor `Ljava/lang/String;`. The program uses the final syntax, so it compiles without `--enable-preview`.",
    anim: [
      "From preview to final: switch expressions",
      [
        ["j12", "Java 12", "preview, break v"],
        ["j13", "Java 13", "preview, yield v"],
        ["j14", "Java 14", "final (JEP 361)"],
        ["j21", "Java 21", "patterns in switch"],
      ],
      [
        ["j12", "j13", "feedback", "Java 12 previewed arrow cases and switch as an expression with 'break value'."],
        ["j13", "j14", "yield", "Feedback replaced 'break value' with the clearer 'yield value' in Java 13."],
        ["j14", "j14", "standard", "Java 14 made switch expressions a permanent feature; no flag needed."],
        ["j14", "j21", "extended", "Java 21 added type patterns, guards and case null to switch."],
        ["j12", "j21", "preview model", "The preview mechanism lets features change before they are locked in."],
      ],
    ],
    release: 21,
    mistakes: [
      "Expecting preview code from Java 12 or 13 (`break value`) to compile on later JDKs. Previews change, and the final form uses `yield`.",
      "Forgetting that `String.indent` also normalises line endings and adds a trailing newline.",
    ],
    qa: [
      [
        "How do you compile a preview feature?",
        "`javac --release 13 --enable-preview Main.java`, then run with `java --enable-preview Main`. The class file is marked, so it runs only on that exact JDK version with previews enabled.",
      ],
      [
        "What is the difference between Shenandoah and ZGC?",
        "Both are concurrent, compacting, low-pause collectors. Shenandoah (Red Hat) uses Brooks-style forwarding with load-reference barriers, while ZGC (Oracle) uses coloured pointers. Both reach pauses of a millisecond or less. Both became generational later (ZGC in 21, Shenandoah in 25).",
      ],
      [
        "Why reimplement the old Socket API in Java 13?",
        "To simplify the code and remove native, thread-blocking parts, so that Project Loom's virtual threads could park cheaply on socket I/O.",
      ],
    ],
    ex: [
      "Use `Collectors.teeing` to compute both the list of even numbers and the count of odd numbers from 1 to 10 in one stream pass.",
      "`IntStream.rangeClosed(1, 10).boxed().collect(Collectors.teeing(Collectors.filtering(n -> n % 2 == 0, Collectors.toList()), Collectors.filtering(n -> n % 2 != 0, Collectors.counting()), (evens, odds) -> evens + \" / odd count \" + odds))` gives `[2, 4, 6, 8, 10] / odd count 5`.",
    ],
  }),
];
