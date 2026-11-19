import { lesson } from "../../schema.js";

export default [
  lesson("JDK Top 100 Q51-Q62: Modules, var, Collection Factories, HttpClient, switch Expressions and Text Blocks", {
    intro:
      "Questions 51 to 62 cover the features of Java 9 to 17 that changed everyday code:\n\n- the module system and jlink\n- JShell\n- the immutable collection factories\n- `var` and its rules\n- the new String and Files methods\n- the standard HttpClient\n- single-file source launching\n- switch expressions with `yield`\n- text blocks\n- helpful NullPointerExceptions\n- strong encapsulation of JDK internals\n\nThe program runs everything except the network call, which is compiled but not executed.",
    topics: [
      [
        "Q51. What is the Java Platform Module System (JPMS)?",
        "Introduced in **Java 9** (Project Jigsaw), a **module** is a named group of packages with a `module-info.java` descriptor: `module com.shop { requires java.sql; exports com.shop.api; }`. Modules give:\n\n- **reliable configuration**: missing dependencies fail at startup, not at runtime\n- **strong encapsulation**: only exported packages are accessible, and reflection into others needs `opens`\n- **a modular JDK**: java.base, java.sql, java.net.http and so on\n\n`jlink` builds a minimal custom runtime that contains only the modules you need. Other directives are `requires transitive`, `requires static` (optional), `uses` and `provides ... with` for services. Code on the classpath runs in the unnamed module, so adoption is optional.",
      ],
      [
        "Q52. What is JShell?",
        "JShell (Java 9) is Java's **REPL** (read-eval-print loop). You type expressions, statements, methods and classes and see the results immediately, without writing a class with `main` or compiling. It provides tab completion, `/vars`, `/methods`, `/imports`, `/edit` and `/save`, and imports common packages automatically. It is ideal for exploring APIs, testing regexes or date formats, and teaching. It is started with the `jshell` command, and can also be used programmatically through the `jdk.jshell` API.",
      ],
      [
        "Q53. What are List.of, Set.of and Map.of?",
        "Static factory methods (Java 9) that create **compact, unmodifiable collections** in one expression: `List.of(1, 2, 3)`, `Set.of(\"a\", \"b\")`, `Map.of(\"k\", 1, \"j\", 2)`, and `Map.ofEntries(Map.entry(...))` for more than 10 pairs. Their properties:\n\n- they are **immutable**: add, put and remove throw UnsupportedOperationException\n- they **reject null** elements, keys and values (NullPointerException)\n- `Set.of` and `Map.of` **reject duplicates** with IllegalArgumentException\n- Set and Map iteration order is unspecified and randomised per JVM run\n- they are serializable and value-based\n\n`List.copyOf` and the others (Java 10) make unmodifiable copies, and return the argument itself if it is already such a collection. `Collections.unmodifiableList` is only a **view** of a list that can still change.",
      ],
      [
        "Q54. What is var, and what are its rules?",
        "`var` (Java 10) declares **local variables with an inferred type**: `var list = new ArrayList<String>();` infers `ArrayList<String>`. It is **static typing**: the type is fixed at compile time, and var is not a dynamic type. It is allowed for local variables with an initializer, for-loop and for-each variables, try-with-resources variables, and lambda parameters (Java 11, so they can carry annotations: `(@NonNull var x) -> ...`). It is **not** allowed for fields, method parameters or return types, without an initializer, for `null` alone, for array initializers (`var a = {1, 2}`), or for lambdas without a target type. `var` is a reserved type name, not a keyword, so a variable can still be called `var`. Use it when the type is obvious from the right-hand side.",
      ],
      [
        "Q55. Which useful String and Files methods were added in Java 11 to 15?",
        "- **String (11)**: `isBlank()`, `lines()`, `strip()`, `stripLeading()` and `stripTrailing()`, which are Unicode-aware unlike `trim`, and `repeat(n)`.\n- **String (12)**: `indent(n)` and `transform(fn)`.\n- **String (15)**: `formatted(args)`, `stripIndent()` and `translateEscapes()`.\n- **Files (11)**: `readString(path)` and `writeString(path, text)`.\n- **Files (12)**: `mismatch(p1, p2)`.\n- **Others**: `Optional.isEmpty()` (11), `Collection.toArray(IntFunction)` (11), `Predicate.not` (11), and `Path.of(...)` (11) as the preferred alternative to `Paths.get`.",
      ],
      [
        "Q56. What is the standard HttpClient (Java 11)?",
        "`java.net.http.HttpClient` replaced the clumsy `HttpURLConnection`. It supports:\n\n- **HTTP/1.1 and HTTP/2**, and **HTTP/3 since Java 26** (JEP 517, opt-in through `version(HTTP_3)`)\n- WebSockets\n- **synchronous** calls (`send`) and **asynchronous** calls (`sendAsync`, which returns a CompletableFuture)\n- body handlers for String, bytes, files, streams and lines\n- redirects, proxies, authenticators, timeouts and cookie handlers\n\nIt is immutable and thread-safe, so create one and reuse it. Requests are built fluently: `HttpRequest.newBuilder(URI.create(url)).header(\"Accept\", \"application/json\").timeout(Duration.ofSeconds(5)).GET().build()`. It is AutoCloseable since Java 21.",
      ],
      [
        "Q57. What is single-file and multi-file source launching?",
        "Since **Java 11** (JEP 330), `java Hello.java` compiles a single source file in memory and runs it, with no `javac` step and no class files. It is great for scripts and learning. On Unix, a shebang line (`#!/usr/bin/java --source 21`) makes the file executable. **Java 22** (JEP 458) extended this to **multi-file programs**: the launcher compiles other source files in the same directory tree on demand. Together with **compact source files and instance main methods** (final in Java 25), a beginner's program can be just `void main() { IO.println(\"Hello\"); }`.",
      ],
      [
        "Q58. What are switch expressions?",
        "Switch expressions (preview in 12, final in **Java 14**, JEP 361) let `switch` **produce a value** and introduce the arrow form `case X -> ...`:\n\n- there is **no fall-through**, so no `break` is needed\n- several labels share one case: `case SAT, SUN -> \"weekend\"`\n- a block uses **`yield value;`** to return its result\n- an expression switch must be **exhaustive**: enums need every constant or a `default`, and sealed types (Java 21) need every subtype\n\nThe classic colon form still works, and `yield` can be used there too. Java 21 extended switch with **patterns** and `case null`.",
      ],
      [
        "Q59. What are text blocks?",
        "Text blocks (final in **Java 15**, JEP 378) are multi-line string literals delimited by `\"\"\"`, which is how JSON, SQL, HTML and XML belong in code. The rules:\n\n- the opening `\"\"\"` must be followed by a line break\n- **incidental indentation is removed**, using the least-indented line (including the closing delimiter's position)\n- trailing spaces are stripped\n- line endings are normalised to `\\n`\n- quotes need no escaping\n- the new escapes are `\\` at the end of a line (no newline) and `\\s` (a single space that is kept)\n\nThey combine well with `formatted(...)`. The result is an ordinary String.",
      ],
      [
        "Q60. What are helpful NullPointerExceptions?",
        "Since **Java 14** (JEP 358, enabled by default from 15), the JVM's NullPointerException message describes **exactly what was null**, for example: `Cannot invoke \"String.length()\" because \"user.address.city\" is null`. Before that, the message was empty, and chained expressions such as `a.b().c().d()` were hard to debug. The JVM analyses the bytecode lazily, only when the message is requested, so there is no runtime cost. Local variable names appear when the code is compiled with `-g`; otherwise the message shows `<local1>`.",
      ],
      [
        "Q61. What does strong encapsulation of JDK internals (Java 16 and 17) mean?",
        "Before Java 9, libraries freely used internal APIs such as `sun.misc.Unsafe` and `sun.security.*`, or reflected into private fields of JDK classes. **Java 9 to 15** warned about \"illegal reflective access\". **Java 16** (JEP 396) denied it by default, and **Java 17** (JEP 403) removed the `--illegal-access` switch, so internals are now **strongly encapsulated**. Code that needs deep reflection must be explicitly allowed with `--add-opens module/package=target`. The critical `sun.misc.Unsafe` remains in the jdk.unsupported module, but its memory-access methods are being deprecated in favour of VarHandle and the FFM API (JEP 471).",
      ],
      [
        "Q62. What else did Java 12 to 17 add?",
        "- **12**: `Collectors.teeing`, the compact number format (`NumberFormat.getCompactNumberInstance`), `String.indent` and `transform`, and Shenandoah (experimental).\n- **13**: dynamic CDS archives and ZGC returning memory to the OS.\n- **14**: JFR event streaming, and NUMA-aware G1.\n- **15**: **hidden classes** (used for lambdas), the removal of Nashorn, and ZGC and Shenandoah ready for production.\n- **16**: `Stream.toList()`, the jpackage tool, Unix-domain socket channels, and the warnings for value-based classes.\n- **17**: the enhanced pseudo-random generators (`RandomGenerator`), the restoration of always-strict floating point (JEP 306), context-specific deserialization filters, and the deprecation for removal of the Applet API and the Security Manager.",
      ],
    ],
    code: String.raw`import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;

public class Main {
    enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

    record Address(String city) { }
    record User(String name, Address address) { }

    public static void main(String[] args) throws Exception {
        // Q51: modules at runtime.
        Module base = String.class.getModule();
        System.out.println("Q51 String is in module " + base.getName() + ", which exports java.util: " + base.isExported("java.util")
                + ", this class is in the unnamed module: " + !Main.class.getModule().isNamed());

        // Q53: immutable factories.
        List<Integer> list = List.of(1, 2, 3);
        try { list.add(4); } catch (UnsupportedOperationException e) { System.out.print("Q53 List.of is immutable, "); }
        try { Set.of("a", "a"); } catch (IllegalArgumentException e) { System.out.print("Set.of duplicate -> IllegalArgumentException, "); }
        try { List.of("x", null); } catch (NullPointerException e) { System.out.println("null -> NullPointerException"); }
        List<Integer> source = new ArrayList<>(List.of(1, 2));
        List<Integer> view = Collections.unmodifiableList(source), copy = List.copyOf(source);
        source.add(3);
        System.out.println("Q53 unmodifiable view sees change " + view + ", List.copyOf does not " + copy);

        // Q54: var.
        var names = new ArrayList<String>();
        names.add("var is static typing");
        for (var entry : Map.of("k", 1).entrySet()) System.out.println("Q54 " + names.get(0) + "; entry type inferred: " + entry.getKey() + "=" + entry.getValue());

        // Q55: String and Files methods.
        String text = "  Java 11  \nnew line\n";
        Path tmp = Files.writeString(Files.createTempFile("q55", ".txt"), "written by writeString");
        System.out.println("Q55 strip [" + text.lines().findFirst().get().strip() + "], isBlank(\"  \") " + "  ".isBlank()
                + ", repeat " + "ab".repeat(3) + ", lines " + text.lines().count() + ", readString " + Files.readString(tmp)
                + ", formatted " + "%s=%d".formatted("x", 5));

        // Q56: HttpClient request building (sending needs a network, so it is only built here).
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).version(HttpClient.Version.HTTP_2).build();
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com/api")).header("Accept", "application/json").GET().build();
        System.out.println("Q56 HttpClient " + client.version() + ", request " + request.method() + " " + request.uri() + ", HTTP_3 constant available: "
                + Arrays.stream(HttpClient.Version.values()).anyMatch(v -> v.name().equals("HTTP_3")));

        // Q58: switch expressions with arrow, multiple labels and yield.
        for (Day d : List.of(Day.MON, Day.SAT, Day.WED)) {
            int hours = switch (d) {
                case SAT, SUN -> 0;
                case WED -> {
                    int fullDay = 8;
                    yield fullDay - 2;                 // half-day Wednesday
                }
                default -> 8;
            };
            System.out.print("Q58 " + d + "=" + hours + "h ");
        }
        System.out.println();

        // Q59: text block with incidental indentation removed.
        String json = """
                {
                  "name": "%s",
                  "lts": true
                }
                """.formatted("Java 17");
        System.out.println("Q59 text block lines " + json.lines().count() + ", first two: " + json.lines().limit(2).toList());

        // Q60: helpful NPE message.
        User user = new User("Asha", null);
        try { System.out.println(user.address().city().length()); }
        catch (NullPointerException e) { System.out.println("Q60 " + e.getMessage()); }

        // Q61: deep reflection into JDK internals is blocked.
        try {
            var field = String.class.getDeclaredField("value");
            field.setAccessible(true);
            System.out.println("Q61 unexpectedly accessible");
        } catch (RuntimeException e) {
            System.out.println("Q61 setAccessible on String.value -> " + e.getClass().getSimpleName());
        }

        // Q62: Collectors.teeing (12) and the compact number format (12).
        System.out.println("Q62 compact number " + java.text.NumberFormat.getCompactNumberInstance(Locale.US, java.text.NumberFormat.Style.SHORT).format(1_250_000)
                + ", RandomGenerator algorithm L64X128MixRandom available: " + java.util.random.RandomGeneratorFactory.all().anyMatch(f -> f.name().equals("L64X128MixRandom")));
    }
}`,
    release: 21,
    walk:
      "Q51 asks the runtime about modules: String lives in `java.base`, which exports `java.util`, while this program runs in the unnamed module of the classpath. Q53 shows that `List.of` refuses modification, duplicates and nulls, and contrasts an unmodifiable **view**, which sees later changes, with a `List.copyOf` snapshot. Q54 uses `var` for an ArrayList and in a for-each loop. Q55 demonstrates strip, isBlank, repeat, lines, readString and formatted.\n\nQ56 builds an HttpClient and a request without sending them, and confirms that the HTTP_3 version constant exists on this JDK. Q58 computes working hours with an arrow switch: SAT is 0, the default is 8, and WED uses a block with `yield` to give 6. Q59's text block keeps the JSON indentation relative to its least-indented line. Q60 prints the helpful NPE message naming `user.address()`. Q61 shows that reflecting into `String.value` is blocked by strong encapsulation. Q62 formats 1,250,000 as \"1M\" and finds a Java 17 random generator.",
    anim: [
      "Strong encapsulation in the module system",
      [
        ["app", "your code", "unnamed module"],
        ["base", "java.base", "named module"],
        ["exp", "exported pkgs", "java.util ..."],
        ["int", "internal pkgs", "jdk.internal ..."],
      ],
      [
        ["app", "exp", "public API", "Exported packages such as java.util are freely usable from any module."],
        ["app", "int", "compile error", "Internal packages are not exported: using them does not even compile."],
        ["app", "base", "setAccessible", "Deep reflection on private members of JDK classes is denied since Java 16/17."],
        ["base", "app", "--add-opens", "Only an explicit --add-opens on the command line can open a package."],
        ["exp", "app", "migrate", "Libraries move to supported APIs: VarHandle, MethodHandles and the FFM API."],
      ],
    ],
    mistakes: [
      "Treating `Collections.unmodifiableList(x)` as a copy. It reflects later changes to x.",
      "Using `var` where the type is not obvious, for example `var result = service.process();`.",
      "Forgetting `yield` (or writing `return`) inside a block of a switch expression.",
      "Creating a new HttpClient per request instead of reusing one.",
    ],
    qa: [
      [
        "Is `var` a keyword?",
        "No. It is a reserved type name, so `int var = 3;` is still legal for compatibility, but a class cannot be named `var`.",
      ],
      [
        "Do I have to use modules in my application?",
        "No. Classpath applications keep working in the unnamed module. Modules matter for libraries that want strong encapsulation, and for building small runtimes with jlink.",
      ],
      [
        "Can a switch expression's arrow case fall through?",
        "No. Each arrow case executes only its own expression, block or throw statement, which removes the classic missing-break bug.",
      ],
    ],
    ex: [
      "Rewrite `String msg; switch (status) { case 200: case 201: msg = \"ok\"; break; case 404: msg = \"missing\"; break; default: msg = \"error\"; }` as a switch expression.",
      "`String msg = switch (status) { case 200, 201 -> \"ok\"; case 404 -> \"missing\"; default -> \"error\"; };`. The result is assigned once, there are no breaks, and the default keeps it exhaustive for int.",
    ],
  }),

  lesson("JDK Top 100 Q63-Q76: Records, Sealed Classes and Pattern Matching (instanceof, switch, Record Patterns)", {
    intro:
      "Questions 63 to 76 cover data-oriented programming, the most important language change since Java 8:\n\n- **records**: what they generate, compact constructors, the restrictions, and when to use them\n- **sealed classes and interfaces**: permits, final, sealed and non-sealed subclasses\n- **pattern matching**: instanceof patterns, switch patterns with guards and `case null`, exhaustiveness, record patterns and nested deconstruction, unnamed patterns (`_`)\n- how the pieces combine into algebraic data types\n\nThe program models shapes and payments as sealed hierarchies of records.",
    topics: [
      [
        "Q63. What is a record?",
        "A record (preview in 14, **final in Java 16**, JEP 395) is a **transparent carrier for immutable data**: `record Point(int x, int y) { }`. From the header, the compiler generates:\n\n- **private final fields** for each component\n- a **canonical constructor**\n- **accessors** named after the components: `x()`, not `getX()`\n- **equals and hashCode** based on all components\n- a readable **toString**: `Point[x=1, y=2]`\n\nRecords are implicitly **final** and extend `java.lang.Record`. They state their intent (\"this is just data\") and remove boilerplate for DTOs, value objects, map keys, multiple return values and messages.",
      ],
      [
        "Q64. What is a compact constructor, and how do you validate or normalise a record?",
        "A **compact canonical constructor** omits the parameter list and the field assignments. You write the validation and normalisation logic, and the compiler assigns the fields at the end:\n\n`record Range(int lo, int hi) { Range { if (lo > hi) throw new IllegalArgumentException(\"lo > hi\"); } }`\n\nYou can **reassign the parameters**, for example `name = name.trim();` or `items = List.copyOf(items);` for defensive copies. You may also write a full canonical constructor, or **additional constructors** that delegate with `this(...)`. Static factory methods are common too: `static Range of(int a, int b)`.",
      ],
      [
        "Q65. What are the restrictions on records?",
        "- **No instance fields** other than the components, although **static** fields are allowed.\n- **Cannot extend** another class; records already extend Record. They **can implement** interfaces.\n- **Final**, so they cannot be subclassed. Records cannot be abstract.\n- Component fields are **final**: there are no setters, and the immutability is shallow, so a `List` component can still be mutated unless you copy it.\n- Accessors, equals, hashCode and toString can be overridden, but must keep the semantics.\n- Records can have instance and static methods, nested types and annotations, and can be **local** (declared in a method).\n- Records are serialized through their canonical constructor.\n- JPA entities cannot be records, because they need mutability, proxies and a no-arg constructor. Records suit DTOs and projections instead.",
      ],
      [
        "Q66. When should you use a record instead of a class or Lombok?",
        "Use a record when the type is **just its data**: API request and response DTOs, events and messages, value objects (Money, Coordinates), composite **map keys**, multiple return values, stream intermediate tuples, and configuration properties. Records give correct equals and hashCode for free, which matters for keys, and they work with **record patterns**. Use a regular class when you need mutable state, encapsulation that hides the representation, inheritance, lazily computed fields, or framework requirements such as JPA entities. Lombok's `@Value` is similar, but needs a library and does not support deconstruction.",
      ],
      [
        "Q67. What are sealed classes and interfaces?",
        "Sealed types (preview in 15, **final in Java 17**, JEP 409) restrict **which classes may extend or implement them**: `sealed interface Shape permits Circle, Square, Rect { }`. Every permitted subclass must be **final**, **sealed** (restricting further), or **non-sealed** (opening that branch again), and must be in the same module, or in the same package when unnamed. If all subclasses are in the same file, `permits` can be omitted. The benefits: the author controls the hierarchy, intent is documented, and the **compiler knows all subtypes**, so it can check that a switch over a sealed type is **exhaustive** without a default.",
      ],
      [
        "Q68. Why combine sealed types with records?",
        "Together they model **algebraic data types**: a sealed interface is the *sum* (one of a fixed set of alternatives), and records are the *products* (fixed data per alternative). For example, `sealed interface Payment permits Card, Upi, Cash`, with `record Card(String number, int cvv) implements Payment` and so on. Operations are written as **exhaustive pattern-matching switches** rather than virtual methods spread over the classes. When a new subtype is added, every switch that does not handle it fails to compile, so the compiler finds the code you must update. This is the essence of **data-oriented programming** in Java.",
      ],
      [
        "Q69. What is pattern matching for instanceof?",
        "Final in **Java 16** (JEP 394), it merges the type test, the cast and the variable declaration: `if (obj instanceof String s && !s.isEmpty()) { use s }`. The **binding variable** `s` is in scope only where the test is definitely true, which is flow scoping: inside the if, after `&&`, or after a negated early return (`if (!(o instanceof String s)) return; s.length();`). It removes repetitive casts and the ClassCastException risk. Since Java 21, it also accepts **record patterns**, and with JEP 530 (preview in 26) **primitive patterns** such as `o instanceof int i`.",
      ],
      [
        "Q70. What is pattern matching for switch?",
        "Final in **Java 21** (JEP 441), switch can test **types and patterns**, not just constants: `switch (obj) { case Integer i when i > 10 -> ...; case Integer i -> ...; case String s -> ...; case null -> ...; default -> ...; }`. The features:\n\n- **type patterns** with bindings\n- **guards** with `when`\n- **`case null`**: without it, a null selector still throws NullPointerException\n- **dominance checking**: a more general case before a more specific one is a compile error\n- **exhaustiveness** for sealed hierarchies, with no default needed\n- **qualified enum constants** as case labels\n\nIt works in both switch statements and switch expressions, and replaces long if-else instanceof chains and the visitor pattern.",
      ],
      [
        "Q71. What are record patterns?",
        "Record patterns (final in **Java 21**, JEP 440) **deconstruct** a record into its components inside a pattern: `if (o instanceof Point(int x, int y)) { return x + y; }`, or `case Circle(double r) -> Math.PI * r * r;`. They **nest**, as in `case Line(Point(var x1, var y1), Point(var x2, var y2)) -> ...`, so you can match deep structures in one step. `var` infers the component types. Combined with sealed types and switch, they give concise, exhaustive and type-safe processing of tree-shaped data such as ASTs, JSON-like values and events.",
      ],
      [
        "Q72. What are unnamed variables and patterns (_)?",
        "Final in **Java 22** (JEP 456), the underscore `_` declares a variable or pattern component that you **do not intend to use**:\n\n- `case Point(var x, _) -> x` ignores y\n- `catch (NumberFormatException _) { }`\n- `for (var _ : list) count++;`\n- `map.forEach((_, v) -> ...)`\n- `try (var _ = lock()) { }`\n\nIt communicates intent, prevents accidental use, and avoids inventing names such as `ignored`. In a switch, several patterns with unnamed bindings can share one case: `case Circle _, Square _ -> \"simple\";`.",
      ],
      [
        "Q73. What does exhaustiveness mean for a switch?",
        "A switch **expression**, or a switch statement that uses patterns or `null`, must cover **every possible value** of the selector, or it does not compile. The compiler accepts the switch as exhaustive in four cases:\n\n- it has a `default`\n- it has an unconditional pattern (`case Object o`)\n- it covers all enum constants\n- it covers **all permitted subtypes** of a sealed type, recursively for nested sealed types and for record patterns over them\n\nThe advantage of relying on sealed exhaustiveness instead of `default` is that adding a new subtype makes those switches **fail to compile**. At runtime, a value the compiler did not know about (from separately compiled code) throws `MatchException`.",
      ],
      [
        "Q74. What is dominance in pattern switches?",
        "A case label **dominates** a later one if it matches everything the later one would match, and then the later label is **unreachable**, which is a compile error. For example, `case CharSequence cs` before `case String s` is an error, because every String is a CharSequence. Guarded patterns are considered not to dominate unguarded ones of the same type: `case Integer i when i > 0` followed by `case Integer i` is fine, while the reverse is an error. `default` should come last. The rule forces the cases into the order specific → general, the same rule as for catch blocks.",
      ],
      [
        "Q75. How do pattern matching and sealed types replace the visitor pattern?",
        "Classic OO puts each operation in every subclass (a virtual method) or uses a **Visitor** with double dispatch to add operations without touching the classes. With sealed records, an operation is simply a function containing an **exhaustive switch**: `double area(Shape s) { return switch (s) { case Circle c -> ...; case Square q -> ...; }; }`. A new operation is one new method, needing no change to the types and no accept and visit boilerplate. Adding a new type makes the compiler flag every switch. Use virtual methods when the set of types is open and the operations are stable. Use sealed types with switch when the types are closed and the operations grow.",
      ],
      [
        "Q76. What are primitive types in patterns (Java 23 to 27 preview)?",
        "JEP 455 (preview in 23), then JEP 507 (25), **JEP 530 (26)** and **JEP 532 (27)**, extends patterns, instanceof and switch to **all primitive types**:\n\n- `if (obj instanceof int i)` matches a boxed Integer and binds the int\n- `switch (x) { case byte b -> ...; case int i -> ...; }` on a long or int selects the narrowest **exact** type the value fits into without loss\n- `instanceof` can test whether a value converts safely: `longValue instanceof int i` is true only if the value fits in an int\n- switch now accepts boolean, long, float and double selectors\n\nThe feature removes manual range checks and unsafe casts. It is still in **preview** (`--enable-preview`) as of JDK 26 and 27.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {

    // Q63 + Q64 + Q65: a record with a compact constructor, a static factory and a method.
    record Range(int lo, int hi) {
        static final Range EMPTY = new Range(0, 0);                  // static fields are allowed
        Range {                                                      // compact canonical constructor
            if (lo > hi) throw new IllegalArgumentException("lo > hi: " + lo + " > " + hi);
        }
        static Range of(int a, int b) { return new Range(Math.min(a, b), Math.max(a, b)); }
        int length() { return hi - lo; }
    }

    record Team(String name, List<String> members) {
        Team { name = name.strip(); members = List.copyOf(members); } // normalise + defensive copy
    }

    // Q67 + Q68: a sealed hierarchy of records (an algebraic data type).
    sealed interface Shape permits Circle, Square, Rect { }
    record Circle(double r) implements Shape { }
    record Square(double side) implements Shape { }
    record Rect(double w, double h) implements Shape { }

    // Q67: final, sealed and non-sealed subclasses.
    sealed interface Payment permits Card, Upi, Wallet { }
    record Card(String last4, int amount) implements Payment { }
    record Upi(String vpa, int amount) implements Payment { }
    static non-sealed class Wallet implements Payment {              // opens this branch again
        final int amount; Wallet(int amount) { this.amount = amount; }
    }
    static final class GiftWallet extends Wallet { GiftWallet(int a) { super(a); } }

    // Q71: nested record patterns.
    record Point(int x, int y) { }
    record Line(Point from, Point to) { }

    // Q70 + Q73 + Q75: exhaustive switch over the sealed type, no default needed.
    static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.r() * c.r();
            case Square(double side) -> side * side;                // record pattern
            case Rect(double w, double h) when w == h -> w * w;      // guard
            case Rect(double w, double h) -> w * h;
        };
    }

    static String describe(Object o) {
        return switch (o) {
            case null -> "null value";                                // Q70: case null
            case Integer i when i > 100 -> "big int " + i;            // guard before the general case (Q74)
            case Integer i -> "int " + i;
            case String s when s.isBlank() -> "blank string";
            case String s -> "string of length " + s.length();
            case Line(Point(var x1, var y1), Point(var x2, var y2)) -> "line of length " + Math.hypot(x2 - x1, y2 - y1);
            case Point(var x, _) -> "point with x=" + x;              // Q72: unnamed pattern
            default -> "other " + o.getClass().getSimpleName();
        };
    }

    static String pay(Payment p) {
        return switch (p) {
            case Card(var last4, var amount) -> "card ..." + last4 + " paid " + amount;
            case Upi(var vpa, var amount) -> "UPI " + vpa + " paid " + amount;
            case Wallet w -> w.getClass().getSimpleName() + " paid " + w.amount;  // covers GiftWallet too
        };
    }

    public static void main(String[] args) {
        // Q63: generated members.
        Range r = Range.of(9, 3);
        System.out.println("Q63 " + r + ", lo() " + r.lo() + ", length() " + r.length() + ", equals " + r.equals(new Range(3, 9))
                + ", hash equal " + (r.hashCode() == new Range(3, 9).hashCode()) + ", is a Record: " + (r instanceof Record));

        // Q64: validation and normalisation.
        try { new Range(5, 1); } catch (IllegalArgumentException e) { System.out.println("Q64 compact constructor rejected: " + e.getMessage()); }
        List<String> people = new ArrayList<>(List.of("ana"));
        Team team = new Team("  core  ", people);
        people.add("intruder");
        System.out.println("Q64 normalised name [" + team.name() + "], defensive copy " + team.members());

        // Q66: records as composite map keys.
        Map<Point, String> grid = new HashMap<>();
        grid.put(new Point(1, 2), "tree");
        System.out.println("Q66 lookup with an equal record key: " + grid.get(new Point(1, 2)));

        // Q67 + Q68 + Q70 + Q73
        for (Shape s : List.of(new Circle(1), new Square(2), new Rect(2, 2), new Rect(2, 3)))
            System.out.printf("Q70 area(%s) = %.2f%n", s, area(s));
        System.out.println("Q67 permitted subclasses of Shape: " + Arrays.stream(Shape.class.getPermittedSubclasses()).map(Class::getSimpleName).toList());
        for (Payment p : List.of(new Card("4242", 500), new Upi("asha@upi", 200), new GiftWallet(50))) System.out.println("Q68 " + pay(p));

        // Q69: instanceof patterns and flow scoping.
        Object value = "pattern";
        if (value instanceof String s && s.length() > 3) System.out.println("Q69 binding s used directly: " + s.toUpperCase());
        if (!(value instanceof String text)) return;
        System.out.println("Q69 flow scoping after negated test: " + text.length());

        // Q70 + Q71 + Q72 + Q74
        for (Object o : new Object[] {null, 7, 500, " ", "hello", new Line(new Point(0, 0), new Point(3, 4)), new Point(9, 1), 2.5})
            System.out.println("Q71 describe -> " + describe(o));

        // Q72: unnamed variables elsewhere.
        int count = 0;
        for (var _ : List.of("a", "b", "c")) count++;
        try { Integer.parseInt("x"); } catch (NumberFormatException _) { count += 10; }
        System.out.println("Q72 unnamed loop variable and catch parameter -> count " + count);
    }
}`,
    release: 22,
    walk:
      "Q63 shows what a record generates: `Range.of(9, 3)` normalises to `Range[lo=3, hi=9]`, with equal equals and hashCode for an identical record, and it is a `java.lang.Record`. The compact constructor rejects a reversed range (Q64). Team strips its name and copies its list, so a later change to the source list has no effect. In Q66, a Point record works as a HashMap key without any hand-written equals.\n\nThe Shape switch (Q70, Q73) has no default. It is exhaustive because Shape is sealed, and it uses a type pattern, record patterns and a guard. A square Rect gives 4.00 through the guarded case, while 2 × 3 gives 6.00. `getPermittedSubclasses` lists the sealed type's subclasses (Q67). The Payment switch deconstructs Card and Upi, while the non-sealed Wallet branch also covers its subclass GiftWallet (Q68). Q69 uses instanceof bindings and flow scoping. `describe` exercises `case null`, guards, dominance-ordered Integer cases, a nested Line pattern (the 3-4-5 triangle gives 5.0), an unnamed `_` component, and default (Q70 to Q74). Q72 also uses `_` as a loop variable and as a catch parameter. The program compiles with `--release 22`.",
    anim: [
      "Exhaustive switch over a sealed hierarchy",
      [
        ["sealed", "sealed Shape", "permits 3"],
        ["circle", "Circle(r)", "record"],
        ["square", "Square(side)", "record"],
        ["rect", "Rect(w, h)", "record"],
        ["sw", "switch (s)", "no default"],
      ],
      [
        ["sealed", "sw", "known subtypes", "The compiler knows Shape has exactly three permitted subtypes."],
        ["sw", "circle", "type pattern", "case Circle c binds the matched value as c."],
        ["sw", "square", "record pattern", "case Square(double side) deconstructs the record directly."],
        ["sw", "rect", "guard + general", "case Rect(...) when w == h comes before the general Rect case."],
        ["sealed", "sw", "add Triangle?", "Adding a fourth permitted type would make this switch fail to compile."],
      ],
    ],
    mistakes: [
      "Expecting a record to be deeply immutable when it holds a mutable List. Copy it in the compact constructor.",
      "Adding `default` to a switch over a sealed type. It silences the compile error you would want when a new subtype is added.",
      "Ordering a general pattern before a specific one, which is a dominance compile error.",
      "Forgetting `case null`. Without it, a pattern switch on a null selector throws NullPointerException.",
    ],
    qa: [
      [
        "Can a record have a no-arg constructor?",
        "Only if it delegates to the canonical one, for example `Point() { this(0, 0); }`. Every constructor must ultimately call the canonical constructor.",
      ],
      [
        "Can a sealed interface's permitted subclasses live in another package?",
        "Only within the same named module. In the unnamed module (the classpath), they must be in the same package as the sealed type.",
      ],
      [
        "What is MatchException?",
        "It is thrown when an exhaustive pattern switch meets a value no case matched at runtime, for example a new subclass added through separate compilation, or an exception thrown in a record accessor during deconstruction.",
      ],
    ],
    ex: [
      "Model a JSON value as a sealed interface with records (JsonNull, JsonBool, JsonNumber, JsonString, JsonArray, JsonObject), and write `String render(Json j)` as an exhaustive switch.",
      "`sealed interface Json permits JsonNull, JsonBool, JsonNumber, JsonString, JsonArray, JsonObject {}`, with records such as `record JsonArray(List<Json> items) implements Json {}`. Then `render` is `return switch (j) { case JsonNull _ -> \"null\"; case JsonBool(var b) -> String.valueOf(b); case JsonNumber(var n) -> n.toString(); case JsonString(var s) -> '\"' + s + '\"'; case JsonArray(var items) -> items.stream().map(Main::render).collect(joining(\",\", \"[\", \"]\")); case JsonObject(var m) -> ...; };`, with no default needed.",
    ],
  }),
];
