import { lesson } from "../../schema.js";

export default [
  lesson("JDK Top 100 Q26-Q40: Java 8 Streams in Depth", {
    intro:
      "Streams are the most heavily tested part of Java 8. Questions 26 to 40 cover:\n\n- what a stream is, and how it differs from a collection\n- intermediate vs terminal operations, and laziness\n- map vs flatMap\n- reduce\n- the collectors: groupingBy, partitioningBy, toMap with merge functions, joining, and summary statistics\n- primitive streams\n- parallel streams and when they hurt\n- short-circuiting\n- ordering\n- the newer stream methods from Java 9 to 24, including Gatherers\n\nThe program is a single employee-analytics example that answers each question.",
    topics: [
      [
        "Q26. What is a stream, and how is it different from a collection?",
        "A `java.util.stream.Stream` is a **sequence of elements supporting aggregate operations** in a pipeline (filter, map, reduce). It **does not store data**: it pulls elements from a source (a collection, an array, a generator or I/O). It is **lazy**, **consumable once**, and does not modify its source. It can run **sequentially or in parallel**, and supports internal iteration, so the library controls the looping. A collection is an in-memory data structure that you iterate yourself (external iteration), with elements that exist up front and can be traversed many times. The short version: collections are about data, streams are about computation.",
      ],
      [
        "Q27. What are intermediate and terminal operations?",
        "**Intermediate operations** return a new stream and are **lazy**: filter, map, flatMap, distinct, sorted, peek, limit, skip, takeWhile, dropWhile, mapMulti and gather. Nothing runs until a **terminal operation** is called: forEach, collect, reduce, count, min, max, anyMatch, allMatch, noneMatch, findFirst, findAny, toArray, toList and iterator. The terminal operation triggers the pipeline and closes the stream. Intermediate operations are further split into **stateless** ones (filter, map) and **stateful** ones (sorted and distinct need to see other elements), which matters for parallel performance.",
      ],
      [
        "Q28. What does stream laziness mean in practice?",
        "Elements flow **one at a time through the whole pipeline**, vertically, not stage by stage. For `stream.filter(f).map(m).findFirst()`, the first element is filtered and then mapped; if it matches, the stream stops, and **no other element is processed at all**. Intermediate operations with no terminal operation execute nothing. Laziness enables short-circuiting and infinite streams (`Stream.iterate(1, x -> x + 1).limit(5)`), and avoids building intermediate collections. `peek` is a good way to observe the order.",
      ],
      [
        "Q29. What is the difference between map and flatMap?",
        "`map(f)` transforms **each element into exactly one** element: `Stream<String>` with `map(String::length)` gives `Stream<Integer>`. `flatMap(f)` transforms each element into a **stream of zero or more elements**, then **flattens** all those streams into one: `Stream<List<String>>` with `flatMap(List::stream)` gives `Stream<String>`. Use flatMap to unnest collections, split lines into words, or expand Optionals (`flatMap(Optional::stream)`). `mapMulti` (Java 16) is an imperative alternative that pushes zero or more results to a consumer.",
      ],
      [
        "Q30. How does reduce work?",
        "`reduce` combines all elements into one result with an **associative** function. Its three forms:\n\n- `reduce(identity, accumulator)`: `Stream.of(1, 2, 3).reduce(0, Integer::sum)` returns 6. The identity is also returned for an empty stream.\n- `reduce(accumulator)` returns an **Optional**, which is empty for an empty stream.\n- `reduce(identity, accumulator, combiner)`: for a result type that differs from the element type, and for combining partial results in parallel streams.\n\nThe identity must be a true identity for the operation (0 for sum, 1 for product, \"\" for concatenation), and the functions must be associative and stateless, or parallel results are wrong. For mutable accumulation, prefer `collect`, and for numbers, `sum()` and `max()` on primitive streams.",
      ],
      [
        "Q31. What do groupingBy and partitioningBy do?",
        "`Collectors.groupingBy(classifier)` returns a `Map<K, List<T>>` that groups elements by key. It has overloads that take a **downstream collector**, such as `groupingBy(Employee::dept, counting())`, `averagingDouble`, `mapping(...)`, `toSet()`, `maxBy` or nested groupingBy, and a **map factory**, such as `groupingBy(f, TreeMap::new, toList())`. `partitioningBy(predicate)` is a special case that always returns a `Map<Boolean, List<T>>` with **both keys, true and false**, even if one list is empty. It also accepts a downstream collector. Since Java 9 there are also the downstream collectors `filtering` and `flatMapping`.",
      ],
      [
        "Q32. How does toMap work, and how do you handle duplicate keys?",
        "`Collectors.toMap(keyMapper, valueMapper)` builds a Map, and **throws IllegalStateException on a duplicate key**. Pass a **merge function** to resolve duplicates: `toMap(Employee::dept, Employee::salary, Integer::sum)` adds the values, and `(a, b) -> a` keeps the first. A fourth argument chooses the map type: `toMap(k, v, merge, LinkedHashMap::new)` keeps the stream order, and TreeMap gives sorted keys. toMap also throws NullPointerException for **null values**, because it uses `Map.merge`. Use `groupingBy` or a manual collect in that case.",
      ],
      [
        "Q33. Which other collectors are frequently used?",
        "- `toList()`, `toSet()`, `toCollection(TreeSet::new)`, and since Java 10 `toUnmodifiableList`, `toUnmodifiableSet` and `toUnmodifiableMap`.\n- `joining(\", \", \"[\", \"]\")`.\n- `counting()`, `summingInt`, `averagingDouble`, `minBy` and `maxBy`.\n- `summarizingInt`, which returns **IntSummaryStatistics** with count, sum, min, average and max in one pass.\n- `mapping` and `filtering` as downstream collectors.\n- `collectingAndThen(toList(), Collections::unmodifiableList)`.\n- `teeing(c1, c2, merger)` (Java 12), which runs two collectors and combines their results, for example the minimum and maximum together.\n- `reducing`.\n- `Stream.toList()` (Java 16), which returns an unmodifiable list without a collector.",
      ],
      [
        "Q34. What are primitive streams, and why use them?",
        "`IntStream`, `LongStream` and `DoubleStream` work on primitives **without boxing**, which saves memory and CPU in numeric pipelines. They provide numeric terminals (`sum()`, `average()` returning an OptionalDouble, `summaryStatistics()`, `max()`), ranges (`IntStream.range(0, n)` and `rangeClosed`), and conversions:\n\n- `mapToInt(Employee::salary)` goes from objects to primitives\n- `boxed()` and `mapToObj(...)` go back to objects\n- `asLongStream()` and `asDoubleStream()` widen\n\n`chars()` on a String returns an IntStream. Prefer them whenever you compute numbers: `list.stream().mapToInt(Integer::intValue).sum()`, not `reduce(0, Integer::sum)` on boxed values.",
      ],
      [
        "Q35. How do parallel streams work, and when should you avoid them?",
        "`collection.parallelStream()` or `stream.parallel()` splits the source with its **Spliterator** and processes the chunks on the **ForkJoinPool common pool** (cores minus one workers, plus the calling thread), then combines the results. They help for **large, CPU-bound** work on **easily splittable** sources (ArrayList, arrays, ranges), with cheap combining and no shared mutable state. Avoid them:\n\n- for small data\n- for I/O or blocking operations, which starve the common pool\n- for LinkedList or `Stream.iterate` sources, which split badly\n- for order-dependent operations (`findFirst`, `limit` and `sorted` on ordered streams, which are expensive)\n- with side effects on shared collections, which cause races\n- inside servers where the common pool is shared by everything\n\nAlways measure. Results must not depend on the order in which elements are processed.",
      ],
      [
        "Q36. What are short-circuiting operations?",
        "Operations that can finish **without processing all elements**. The terminal ones are `anyMatch`, `allMatch`, `noneMatch`, `findFirst` and `findAny`. The intermediate ones are `limit(n)` and `takeWhile` (Java 9). They make it possible to work with **infinite streams**: `Stream.iterate(1, n -> n * 2).anyMatch(n -> n > 1000)` terminates. Note that `allMatch` returns true and `anyMatch` returns false on an empty stream. `findAny` may return any element in parallel streams, which is cheaper than `findFirst`.",
      ],
      [
        "Q37. How do ordering and encounter order work in streams?",
        "Streams have an **encounter order** when the source is ordered: List, arrays, `Stream.of`, sorted streams. HashSet and HashMap are not ordered. Most operations preserve encounter order. `forEach` in a parallel stream does **not**, while `forEachOrdered` does, at some cost. `unordered()` drops the constraint, so that `distinct`, `limit` and `findAny` run faster in parallel. `sorted()` imposes an order and is stable for ordered streams. `findFirst` respects the encounter order, while `findAny` does not. `Collectors.toSet()` and `groupingBy` into a HashMap lose the order unless you use a LinkedHashMap or TreeMap factory.",
      ],
      [
        "Q38. What can you not do with a stream, and what are the common mistakes?",
        "- You cannot **reuse a stream**. A second terminal operation throws IllegalStateException (\"stream has already been operated upon or closed\"), so use a `Supplier<Stream<T>>`.\n- Do not **modify the source** during the pipeline: interference causes ConcurrentModificationException or undefined behaviour.\n- Avoid **stateful lambdas** and side effects, such as adding to an external list from `map`, especially in parallel; use collectors instead.\n- Do not use `peek` for business logic: it may be skipped when the count can be computed directly (Java 9+ `count()` optimisation).\n- Close streams that hold resources (`Files.lines`, `Files.walk`) with try-with-resources.\n- Do not over-use streams for simple loops, where readability suffers.",
      ],
      [
        "Q39. What stream methods were added after Java 8?",
        "- **9**: `takeWhile`, `dropWhile`, `Stream.iterate(seed, hasNext, next)`, `Stream.ofNullable`, `Optional.stream()`, and the collectors `filtering` and `flatMapping`.\n- **10**: the `toUnmodifiable*` collectors.\n- **11**: `Predicate.not`.\n- **12**: `Collectors.teeing`.\n- **16**: `Stream.toList()` and `mapMulti`.\n- **22 (preview)** and **24 (final)**: **Stream Gatherers**, `stream.gather(...)` with `Gatherers.windowFixed`, `windowSliding`, `fold`, `scan` and `mapConcurrent`, plus custom gatherers for intermediate operations the JDK lacks.",
      ],
      [
        "Q40. What are Stream Gatherers (Java 24)?",
        "A **Gatherer** is to intermediate operations what a Collector is to terminal ones: a pluggable, possibly **stateful** transformation from T to R. `stream.gather(gatherer)` can map one-to-one, one-to-many, many-to-one or many-to-many, keep state, and short-circuit. The built-ins:\n\n- `Gatherers.windowFixed(n)`: [1,2],[3,4],[5]\n- `windowSliding(n)`: [1,2],[2,3],...\n- `fold(init, fn)`: a single result emitted at the end\n- `scan(init, fn)`: running totals\n- `mapConcurrent(n, fn)`: concurrent mapping with **virtual threads**, preserving order\n\nCustom ones are built with `Gatherer.of(...)` or `Gatherer.ofSequential(...)`, giving an initializer, an integrator and a finisher. They fill gaps such as batching, distinct-by-key and sliding windows without collecting first.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    record Employee(String name, String dept, int salary, List<String> skills) { }

    public static void main(String[] args) {
        List<Employee> staff = List.of(
                new Employee("Asha", "eng", 120, List.of("java", "sql")),
                new Employee("Ravi", "eng", 95, List.of("java", "go")),
                new Employee("Meera", "sales", 70, List.of("excel")),
                new Employee("Om", "sales", 80, List.of("excel", "sql")),
                new Employee("Lina", "hr", 60, List.of()));

        // Q26 + Q27 + Q28: lazy, element-by-element processing.
        List<String> trace = new ArrayList<>();
        Optional<String> firstRich = staff.stream()
                .peek(e -> trace.add("see " + e.name()))
                .filter(e -> e.salary() > 90)
                .map(Employee::name)
                .findFirst();                                      // stops after the first match
        System.out.println("Q28 findFirst -> " + firstRich.orElse("-") + ", elements touched: " + trace);

        // Q29: map vs flatMap.
        List<Integer> nameLengths = staff.stream().map(e -> e.name().length()).toList();
        Set<String> allSkills = staff.stream().flatMap(e -> e.skills().stream()).collect(Collectors.toCollection(TreeSet::new));
        System.out.println("Q29 map -> " + nameLengths + ", flatMap -> " + allSkills);

        // Q30: reduce in its three forms.
        int total = staff.stream().map(Employee::salary).reduce(0, Integer::sum);
        Optional<Integer> none = Stream.<Integer>empty().reduce(Integer::sum);
        int nameChars = staff.stream().reduce(0, (acc, e) -> acc + e.name().length(), Integer::sum);
        System.out.println("Q30 total " + total + ", empty reduce " + none + ", identity+accumulator+combiner " + nameChars);

        // Q31: groupingBy with downstream collectors, and partitioningBy.
        Map<String, Long> perDept = staff.stream().collect(Collectors.groupingBy(Employee::dept, TreeMap::new, Collectors.counting()));
        Map<String, Double> avgSalary = staff.stream().collect(Collectors.groupingBy(Employee::dept, TreeMap::new, Collectors.averagingInt(Employee::salary)));
        Map<Boolean, List<String>> highEarners = staff.stream().collect(Collectors.partitioningBy(e -> e.salary() >= 90, Collectors.mapping(Employee::name, Collectors.toList())));
        System.out.println("Q31 count " + perDept + ", average " + avgSalary + ", partition " + highEarners);

        // Q32: toMap duplicates.
        try {
            staff.stream().collect(Collectors.toMap(Employee::dept, Employee::name));
        } catch (IllegalStateException e) {
            System.out.println("Q32 toMap without merge -> IllegalStateException (" + e.getMessage().replaceAll(" \\(.*", "") + ")");
        }
        Map<String, Integer> payroll = staff.stream().collect(Collectors.toMap(Employee::dept, Employee::salary, Integer::sum, TreeMap::new));
        System.out.println("Q32 with merge Integer::sum " + payroll);

        // Q33: joining, summarizing and teeing.
        String names = staff.stream().map(Employee::name).collect(Collectors.joining(", ", "[", "]"));
        IntSummaryStatistics stats = staff.stream().collect(Collectors.summarizingInt(Employee::salary));
        String range = staff.stream().collect(Collectors.teeing(
                Collectors.minBy(Comparator.comparingInt(Employee::salary)),
                Collectors.maxBy(Comparator.comparingInt(Employee::salary)),
                (min, max) -> min.get().name() + ".." + max.get().name()));
        System.out.println("Q33 " + names + " | stats min " + stats.getMin() + " max " + stats.getMax() + " avg " + stats.getAverage() + " | teeing " + range);

        // Q34: primitive streams avoid boxing.
        System.out.println("Q34 IntStream sum " + staff.stream().mapToInt(Employee::salary).sum()
                + ", rangeClosed(1, 5) squares " + IntStream.rangeClosed(1, 5).map(x -> x * x).boxed().toList()
                + ", average " + staff.stream().mapToInt(Employee::salary).average().orElse(0));

        // Q35: parallel stream gives the same result for an associative, stateless pipeline.
        long seq = LongStream.rangeClosed(1, 2_000_000).filter(n -> n % 3 == 0).sum();
        long par = LongStream.rangeClosed(1, 2_000_000).parallel().filter(n -> n % 3 == 0).sum();
        System.out.println("Q35 parallel sum equals sequential: " + (seq == par));

        // Q36: short-circuiting on an infinite stream.
        boolean found = Stream.iterate(1, n -> n * 2).anyMatch(n -> n > 1000);
        List<Integer> firstPowers = Stream.iterate(1, n -> n * 2).limit(6).toList();
        System.out.println("Q36 anyMatch on infinite stream " + found + ", limit(6) " + firstPowers + ", allMatch on empty " + Stream.empty().allMatch(x -> false));

        // Q37: ordered vs unordered sources.
        StringBuilder ordered = new StringBuilder();
        List.of(1, 2, 3, 4, 5).parallelStream().forEachOrdered(ordered::append);
        System.out.println("Q37 forEachOrdered on a parallel stream keeps order: " + ordered);

        // Q38: a stream cannot be reused; use a Supplier.
        Stream<Employee> once = staff.stream();
        once.count();
        try { once.count(); } catch (IllegalStateException e) { System.out.println("Q38 reuse -> IllegalStateException: " + e.getMessage()); }
        Supplier<Stream<Employee>> fresh = staff::stream;
        System.out.println("Q38 Supplier gives a new stream each time: " + fresh.get().count() + " and " + fresh.get().count());

        // Q39: Java 9-16 additions.
        System.out.println("Q39 takeWhile " + Stream.of(1, 2, 3, 10, 4).takeWhile(n -> n < 5).toList()
                + ", dropWhile " + Stream.of(1, 2, 3, 10, 4).dropWhile(n -> n < 5).toList()
                + ", iterate with predicate " + Stream.iterate(1, n -> n <= 100, n -> n * 10).toList()
                + ", ofNullable(null) count " + Stream.ofNullable(null).count());

        // Q40: Gatherers (Java 24).
        List<Integer> numbers = List.of(1, 2, 3, 4, 5);
        System.out.println("Q40 windowFixed(2) " + numbers.stream().gather(Gatherers.windowFixed(2)).toList()
                + ", windowSliding(3) " + numbers.stream().gather(Gatherers.windowSliding(3)).toList()
                + ", scan running sum " + numbers.stream().gather(Gatherers.scan(() -> 0, Integer::sum)).toList()
                + ", fold " + numbers.stream().gather(Gatherers.fold(() -> 0, Integer::sum)).toList());
    }
}`,
    release: 24,
    walk:
      "The trace for Q28 shows laziness: findFirst touches only Asha, the first employee earning more than 90, and never looks at the rest. Q29 maps each name to its length (one-to-one), while flatMap merges every skills list into one sorted set. Q30 sums the salaries with an identity, gets an empty Optional from reducing an empty stream, and uses the three-argument form to reduce Employees to an int.\n\nQ31 groups by department into a TreeMap with counting and averaging downstreams, and partitions the names by salary. Q32 shows toMap failing on the duplicate key \"eng\" until a merge function sums the salaries. Q33 joins names, computes summary statistics in one pass, and uses teeing to report the lowest and highest earners. Q35 confirms that a parallel sum matches the sequential one. Q36 short-circuits an infinite stream. Q38 shows the reuse error and the Supplier fix. Q40 runs four of the Java 24 Gatherers. The lesson compiles with `--release 24`.",
    anim: [
      "A lazy stream pipeline",
      [
        ["src", "staff list", "source"],
        ["peek", "peek", "trace"],
        ["filter", "filter", "salary > 90"],
        ["map", "map", "Employee::name"],
        ["term", "findFirst", "terminal"],
      ],
      [
        ["term", "src", "pull", "Nothing runs until findFirst pulls the first element from the source."],
        ["src", "filter", "Asha", "Asha flows through peek and filter: 120 > 90, so she passes."],
        ["filter", "map", "map", "map turns Asha into the String \"Asha\"."],
        ["map", "term", "result", "findFirst receives a value and short-circuits the whole pipeline."],
        ["src", "src", "rest skipped", "Ravi, Meera, Om and Lina are never touched: the trace has one entry."],
      ],
    ],
    mistakes: [
      "Adding to an external list inside `map` or `forEach` of a parallel stream. Use `collect`.",
      "Using `toMap` without a merge function on keys that might repeat.",
      "Reusing a stream variable after a terminal operation.",
      "Using parallel streams for blocking I/O on the common pool.",
    ],
    qa: [
      [
        "What is the difference between `Stream.toList()` and `collect(Collectors.toList())`?",
        "`toList()` (Java 16) returns an unmodifiable list and allows null elements. `Collectors.toList()` returns a modifiable ArrayList in practice, although that is not guaranteed by its specification.",
      ],
      [
        "Is `forEach` on a parallel stream ordered?",
        "No. Elements are processed in whatever order the threads reach them. Use `forEachOrdered` when the encounter order matters.",
      ],
      [
        "What is a Spliterator?",
        "A splittable iterator. It traverses elements and can split off part of its range (`trySplit`), which parallel streams use to divide the work. It also reports characteristics such as SIZED, ORDERED and DISTINCT.",
      ],
    ],
    ex: [
      "From the staff list, compute a `Map<String, Optional<String>>` with the name of the highest-paid employee in each department, in a single collect.",
      "`staff.stream().collect(Collectors.groupingBy(Employee::dept, Collectors.mapping(e -> e, Collectors.collectingAndThen(Collectors.maxBy(Comparator.comparingInt(Employee::salary)), o -> o.map(Employee::name)))))`. A simpler version is `groupingBy(Employee::dept, collectingAndThen(maxBy(comparingInt(Employee::salary)), o -> o.map(Employee::name)))`.",
    ],
  }),

  lesson("JDK Top 100 Q41-Q50: Optional, java.time, CompletableFuture and Other Java 8 APIs", {
    intro:
      "Questions 41 to 50 cover the rest of Java 8's headline APIs:\n\n- Optional, and how to use it well\n- why java.time replaced Date and Calendar\n- LocalDate vs LocalDateTime vs ZonedDateTime vs Instant\n- Duration vs Period\n- formatting and parsing\n- CompletableFuture: composing, combining, error handling and timeouts\n- the Map default methods\n- Base64\n- Nashorn's rise and removal\n\nThe program demonstrates each one, using fixed dates so that the output never changes.",
    topics: [
      [
        "Q41. What is Optional, and how should you use it?",
        "`Optional<T>` is a container that may or may not hold a non-null value. It was designed as a **method return type** that forces callers to think about absence instead of risking a NullPointerException. You create one with `Optional.of(v)` (v must not be null), `ofNullable(v)` or `empty()`, and consume it **functionally**:\n\n- `map`, `flatMap` and `filter`\n- `orElse(default)`, `orElseGet(supplier)` (lazy), `orElseThrow()` (Java 10) and `orElseThrow(exceptionSupplier)`\n- `ifPresent(consumer)` and `ifPresentOrElse` (Java 9)\n- `or(supplier)` (Java 9)\n- `stream()` (Java 9)\n- `isEmpty()` (Java 11)\n\nAvoid `get()` (use `orElseThrow`), Optional fields and parameters, and returning null instead of `Optional.empty()`.",
      ],
      [
        "Q42. Why was java.time introduced? What was wrong with Date and Calendar?",
        "The old classes had serious design flaws:\n\n- `java.util.Date` is **mutable**, so it is not thread-safe and needs defensive copies. It represents an instant but prints in the local time zone. Its years start at 1900 and its months at 0. Most of its methods are deprecated.\n- `Calendar` is mutable, complex and slow.\n- `SimpleDateFormat` is **not thread-safe**.\n\n**java.time** (JSR 310, Java 8, based on Joda-Time) is **immutable and thread-safe**. It has a clear model with separate types for dates, times, instants, durations and zones, a fluent API (`plusDays`, `withDayOfMonth`), ISO-8601 by default, and a thread-safe `DateTimeFormatter`. Interoperability goes through `date.toInstant()`, `Date.from(instant)` and `java.sql.Timestamp.valueOf(ldt)`.",
      ],
      [
        "Q43. What are LocalDate, LocalTime, LocalDateTime, ZonedDateTime, OffsetDateTime and Instant?",
        "- **LocalDate** is a date without time or zone, for example 2026-11-19 (a birthday).\n- **LocalTime** is a time of day, for example 09:30.\n- **LocalDateTime** is a date and time **without a zone**: a wall-clock reading that is not a point on the timeline.\n- **ZonedDateTime** is a date and time **in a zone with its rules**, such as Asia/Kolkata, and handles daylight saving time. Use it for user-facing scheduling.\n- **OffsetDateTime** is a date and time with a fixed UTC offset (+05:30). It suits databases and APIs.\n- **Instant** is a point on the UTC timeline, in nanoseconds since the epoch, used for timestamps and logs.\n\nThe rule of thumb: store Instants (or OffsetDateTime), and convert to ZonedDateTime for display.",
      ],
      [
        "Q44. What is the difference between Duration and Period?",
        "**Duration** is a time-based amount in **seconds and nanoseconds**, such as `Duration.ofHours(5)` or `Duration.between(start, end)` of two Instants or times, and is used for elapsed machine time. **Period** is a date-based amount in **years, months and days**, such as `Period.between(birth, today)` giving `P34Y2M5D`, and is used for calendar arithmetic. Adding `Period.ofDays(1)` to a ZonedDateTime keeps the local time across a daylight-saving change, while adding `Duration.ofHours(24)` may shift the clock time by an hour. `ChronoUnit.DAYS.between(a, b)` gives a single number.",
      ],
      [
        "Q45. How do you format and parse dates?",
        "Use `DateTimeFormatter`, which is immutable and **thread-safe**, unlike SimpleDateFormat. The predefined formatters are `ISO_LOCAL_DATE`, `ISO_INSTANT` and others. Patterns look like `DateTimeFormatter.ofPattern(\"dd MMM yyyy HH:mm\", Locale.ENGLISH)`, and localised styles come from `ofLocalizedDate(FormatStyle.LONG)`. You format with `date.format(formatter)` and parse with `LocalDate.parse(\"19-11-2026\", formatter)`, which throws `DateTimeParseException` on bad input. Pattern letter pitfalls: `yyyy` is the year of era and `uuuu` the proleptic year (strict resolving needs `uuuu`), `YYYY` is the week-based year (a classic bug), `MM` is month and `mm` minutes, and `HH` is the 24-hour clock while `hh` is 12-hour.",
      ],
      [
        "Q46. What is CompletableFuture?",
        "`CompletableFuture<T>` (Java 8) is a Future that can be **completed explicitly** and **composed without blocking**. You start work with `supplyAsync(supplier[, executor])` or `runAsync`. Without an executor it runs on the ForkJoinPool common pool. Its methods:\n\n- transform with `thenApply`\n- consume with `thenAccept` and `thenRun`\n- chain another async step with `thenCompose` (the flatMap of futures)\n- combine two results with `thenCombine`\n- wait for many with `allOf` and `anyOf`\n- handle errors with `exceptionally`, `handle` and `whenComplete`\n- time out with `orTimeout` and `completeOnTimeout` (Java 9)\n\nThe *Async variants run each stage on an executor. Call `join()` or `get()` only at the edges. Virtual threads now make plain blocking code an alternative for many uses.",
      ],
      [
        "Q47. What is the difference between thenApply, thenCompose and thenCombine?",
        "- `thenApply(fn)` transforms the result synchronously: `CF<T>` becomes `CF<R>` when fn returns R. It is like `map`.\n- `thenCompose(fn)` is used when fn itself **returns a CompletableFuture**. It flattens the result to `CF<R>` instead of `CF<CF<R>>`, like `flatMap`. It is used for dependent async calls: fetch the user, then fetch the user's orders.\n- `thenCombine(other, bifn)` runs **two independent** futures and combines both results when both complete, for example price and stock fetched in parallel.\n\nUse `allOf` for N independent futures, then collect their results with `join()`.",
      ],
      [
        "Q48. How do you handle errors in CompletableFuture?",
        "An exception in any stage completes the future **exceptionally**, and the dependent stages are skipped. Three methods deal with it:\n\n- `exceptionally(ex -> fallback)` recovers with a value, and is called only on failure.\n- `handle((value, ex) -> ...)` is always called, and maps either outcome to a new value.\n- `whenComplete((value, ex) -> ...)` is always called for side effects such as logging, and passes the original outcome through.\n\nThe exception is often wrapped in `CompletionException`, so inspect `getCause()`. `join()` throws CompletionException (unchecked), while `get()` throws ExecutionException (checked). `orTimeout(1, SECONDS)` fails a stage with TimeoutException, and `completeOnTimeout(default, ...)` supplies a default value instead.",
      ],
      [
        "Q49. Which default methods did Java 8 add to Map?",
        "- `getOrDefault(k, default)`\n- `putIfAbsent(k, v)`\n- `computeIfAbsent(k, k -> new ArrayList<>())`, the multimap idiom: `map.computeIfAbsent(dept, d -> new ArrayList<>()).add(name)`\n- `computeIfPresent` and `compute`\n- `merge(k, v, Integer::sum)` for counters\n- `remove(k, v)`, and `replace(k, v)` / `replace(k, old, new)`\n- `replaceAll(fn)`\n- `forEach(biConsumer)`\n\nJava 9 then added `Map.of`, `Map.ofEntries` and `Map.entry`. On ConcurrentHashMap these operations are **atomic**. If a compute function returns null, the entry is removed.",
      ],
      [
        "Q50. What are Base64 and Nashorn, and what happened to Nashorn?",
        "`java.util.Base64` (Java 8) provides standard encoders and decoders: `getEncoder()` (RFC 4648), `getUrlEncoder()` (URL- and filename-safe, using - and _), and `getMimeEncoder()` (line-wrapped). Before Java 8, developers used the unsupported `sun.misc.BASE64Encoder`. **Nashorn** was Java 8's JavaScript engine through JSR 223 (`ScriptEngineManager().getEngineByName(\"nashorn\")`), and it replaced Rhino. It could not keep up with ECMAScript, so it was **deprecated in Java 11 and removed in Java 15** (JEP 372). It now lives on as a standalone OpenJDK project, and GraalJS is the recommended alternative.",
      ],
    ],
    code: String.raw`import java.time.*;
import java.time.format.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    record User(int id, String name) { }

    static Optional<User> findUser(int id) { return id == 1 ? Optional.of(new User(1, "Asha")) : Optional.empty(); }

    public static void main(String[] args) throws Exception {
        // Q41: Optional used as a return type, consumed functionally.
        String found = findUser(1).map(User::name).map(String::toUpperCase).orElse("UNKNOWN");
        String missing = findUser(2).map(User::name).orElseGet(() -> "guest");
        System.out.print("Q41 " + found + ", " + missing + ", ");
        findUser(2).ifPresentOrElse(u -> System.out.print("present"), () -> System.out.print("ifPresentOrElse -> absent"));
        try { findUser(3).orElseThrow(); } catch (NoSuchElementException e) { System.out.println(", orElseThrow -> NoSuchElementException"); }

        // Q42 + Q43: immutable types and the main classes (fixed values for stable output).
        LocalDate date = LocalDate.of(2026, 11, 19);
        LocalDate later = date.plusMonths(3);                          // a new object
        LocalDateTime meeting = LocalDateTime.of(date, LocalTime.of(9, 30));
        ZonedDateTime inIndia = meeting.atZone(ZoneId.of("Asia/Kolkata"));
        ZonedDateTime inLondon = inIndia.withZoneSameInstant(ZoneId.of("Europe/London"));
        Instant instant = inIndia.toInstant();
        System.out.println("Q42 date unchanged " + date + ", plusMonths(3) " + later);
        System.out.println("Q43 Kolkata " + inIndia.toLocalTime() + " = London " + inLondon.toLocalTime() + " = Instant " + instant);

        // Q44: Duration vs Period, including a DST change.
        Period age = Period.between(LocalDate.of(1992, 9, 14), date);
        Duration call = Duration.between(LocalTime.of(9, 30), LocalTime.of(11, 5));
        ZonedDateTime beforeDst = ZonedDateTime.of(2026, 3, 28, 12, 0, 0, 0, ZoneId.of("Europe/London"));
        System.out.println("Q44 Period " + age + ", Duration " + call + ", days between " + ChronoUnit.DAYS.between(date, later)
                + " | across DST: +1 day -> " + beforeDst.plus(Period.ofDays(1)).toLocalTime() + ", +24h -> " + beforeDst.plus(Duration.ofHours(24)).toLocalTime());

        // Q45: formatting and parsing.
        DateTimeFormatter pretty = DateTimeFormatter.ofPattern("dd MMM uuuu HH:mm", Locale.ENGLISH);
        DateTimeFormatter input = DateTimeFormatter.ofPattern("dd-MM-uuuu");
        System.out.print("Q45 " + meeting.format(pretty) + ", parsed " + LocalDate.parse("01-02-2027", input));
        try { LocalDate.parse("31-02-2027", input.withResolverStyle(ResolverStyle.STRICT)); }
        catch (DateTimeParseException e) { System.out.println(", strict 31-02 -> DateTimeParseException"); }

        // Q46 + Q47: compose dependent calls and combine independent ones.
        ExecutorService pool = Executors.newFixedThreadPool(4);
        CompletableFuture<User> user = CompletableFuture.supplyAsync(() -> new User(7, "Kiran"), pool);
        CompletableFuture<List<String>> orders = user.thenCompose(u -> CompletableFuture.supplyAsync(() -> List.of("order-" + u.id() + "-a", "order-" + u.id() + "-b"), pool));
        CompletableFuture<Integer> price = CompletableFuture.supplyAsync(() -> 499, pool);
        CompletableFuture<Integer> stock = CompletableFuture.supplyAsync(() -> 3, pool);
        CompletableFuture<String> offer = price.thenCombine(stock, (p, s) -> "price " + p + " x stock " + s);
        System.out.println("Q47 thenApply " + user.thenApply(User::name).join() + ", thenCompose " + orders.join() + ", thenCombine " + offer.join());
        CompletableFuture<Void> all = CompletableFuture.allOf(price, stock);
        all.join();
        System.out.println("Q46 allOf completed: " + all.isDone() + ", sum " + (price.join() + stock.join()));

        // Q48: error handling and timeouts.
        CompletableFuture<Integer> failing = CompletableFuture.supplyAsync(() -> { if (true) throw new IllegalStateException("service down"); return 1; }, pool);
        int recovered = failing.exceptionally(ex -> -1).join();
        String handled = failing.handle((v, ex) -> ex == null ? "ok " + v : "handled " + ex.getCause().getMessage()).join();
        CompletableFuture<String> slow = CompletableFuture.supplyAsync(() -> { sleep(500); return "slow"; }, pool);
        String timed = slow.completeOnTimeout("default after timeout", 50, TimeUnit.MILLISECONDS).join();
        try { failing.join(); } catch (CompletionException e) { System.out.println("Q48 join() -> CompletionException caused by " + e.getCause().getClass().getSimpleName()); }
        System.out.println("Q48 exceptionally " + recovered + ", handle " + handled + ", completeOnTimeout " + timed);
        pool.shutdown();

        // Q49: Map default methods.
        Map<String, List<String>> byDept = new TreeMap<>();
        for (String[] row : new String[][] {{"eng", "Asha"}, {"eng", "Ravi"}, {"hr", "Lina"}})
            byDept.computeIfAbsent(row[0], d -> new ArrayList<>()).add(row[1]);
        Map<String, Integer> counts = new TreeMap<>();
        for (String w : "to be or not to be".split(" ")) counts.merge(w, 1, Integer::sum);
        counts.computeIfPresent("or", (k, v) -> null);                // returning null removes the entry
        System.out.println("Q49 computeIfAbsent " + byDept + ", merge " + counts + ", getOrDefault(x) " + counts.getOrDefault("x", 0));

        // Q50: Base64 variants; Nashorn is gone.
        byte[] data = {(byte) 0xfb, (byte) 0xff, (byte) 0xbf};             // bytes that encode to + and /
        System.out.println("Q50 basic " + Base64.getEncoder().encodeToString(data) + ", url-safe " + Base64.getUrlEncoder().encodeToString(data)
                + ", round trip ok " + Arrays.equals(data, Base64.getDecoder().decode(Base64.getEncoder().encodeToString(data)))
                + ", nashorn engine present: " + (new javax.script.ScriptEngineManager().getEngineByName("nashorn") != null));
    }

    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
}`,
    walk:
      "In Q41, `findUser(1)` returns a value that is mapped to upper case. `findUser(2)` is empty, so it falls back lazily to \"guest\", and `ifPresentOrElse` runs its empty branch. `orElseThrow()` on an empty Optional throws NoSuchElementException. Q42 shows that `plusMonths` returns a new LocalDate while the original stays unchanged. Q43 converts 09:30 in Kolkata to 04:00 in London and to its UTC Instant. Q44 computes an age as a Period and a call length as a Duration. Across the 29 March 2026 daylight-saving change in London, adding one day keeps 12:00, while adding 24 hours gives 13:00.\n\nQ45 formats with a pattern, parses another, and rejects 31 February in STRICT mode. Q46 and Q47 chain a dependent call with thenCompose, combine two independent futures with thenCombine, and wait for both with allOf. Q48 recovers from a failed future with exceptionally and handle, unwraps the CompletionException from join, and replaces a slow result with a default after a 50 ms timeout. Q49 builds a multimap with computeIfAbsent, counts words with merge, and removes an entry by returning null. Q50 shows the Base64 variants, and that Nashorn no longer exists.",
    anim: [
      "Composing CompletableFutures",
      [
        ["user", "fetch user", "supplyAsync"],
        ["orders", "fetch orders", "thenCompose"],
        ["price", "price", "independent"],
        ["stock", "stock", "independent"],
        ["offer", "offer", "thenCombine"],
      ],
      [
        ["user", "orders", "thenCompose", "Orders depend on the user's id, so thenCompose chains the second async call."],
        ["price", "offer", "thenCombine", "Price and stock run in parallel; thenCombine waits for both."],
        ["stock", "offer", "both done", "When the second of the two completes, the combining function builds the offer."],
        ["user", "user", "exceptionally", "If any stage throws, later stages are skipped until an exceptionally or handle."],
        ["offer", "offer", "join at edge", "join() is called only at the very end, so no thread blocks in between."],
      ],
    ],
    release: 21,
    mistakes: [
      "Using `LocalDateTime` for timestamps that must represent a real instant. Use Instant or OffsetDateTime.",
      "Using the pattern `YYYY` (week-based year) instead of `yyyy` or `uuuu`.",
      "Calling `get()` or `join()` in the middle of a CompletableFuture chain, which blocks a thread and defeats the purpose.",
      "Writing `orElse(expensive())` when `orElseGet(() -> expensive())` is meant.",
    ],
    qa: [
      [
        "What does `Optional.map` do when the mapper returns null?",
        "It returns `Optional.empty()`, because `map` wraps the result with `ofNullable`. That makes chains such as `user.map(User::address).map(Address::city)` null-safe.",
      ],
      [
        "Which thread runs a `thenApply` callback?",
        "If the future has already completed, the thread that calls `thenApply` runs it. Otherwise, the thread that completes the future does. Use `thenApplyAsync(fn, executor)` to control it.",
      ],
      [
        "How do you convert between `java.util.Date` and java.time?",
        "`date.toInstant()` and `Date.from(instant)`, then `instant.atZone(zone).toLocalDate()` or a similar conversion. For SQL, use `Timestamp.valueOf(ldt)` and `timestamp.toLocalDateTime()`, or bind java.time types directly with `setObject`.",
      ],
    ],
    ex: [
      "Two services return `CompletableFuture<Integer>` scores. Produce their average, but fall back to 0 for any service that fails or takes longer than 200 ms.",
      "`CompletableFuture<Integer> a = svcA().completeOnTimeout(0, 200, MILLISECONDS).exceptionally(ex -> 0);` Do the same for `b`, then `a.thenCombine(b, (x, y) -> (x + y) / 2.0).join()`. Each side recovers independently, so one slow or failing service does not spoil the other's value.",
    ],
  }),
];
