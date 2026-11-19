import { lesson } from "../../schema.js";

export default [
  lesson("Java 14 (2020): Switch Expressions Final, Helpful NullPointerExceptions, Records and instanceof Preview", {
    intro:
      "Java 14 (March 2020) had 16 JEPs. It made **switch expressions** final, and turned on **helpful NullPointerException** messages. It previewed **records** and **pattern matching for instanceof**, with a second preview of text blocks. It also added:\n\n- JFR event streaming\n- the packaging tool `jpackage`, as an incubator\n- non-volatile mapped byte buffers\n- NUMA-aware memory allocation for G1\n\nIt removed the CMS collector, and deprecated the Solaris and SPARC ports. The program shows each feature in its final form.",
    topics: [
      [
        "Switch expressions are final (JEP 361)",
        "After two previews (12 and 13), switch expressions became a permanent feature:\n\n- `case L ->` arrow labels without fall-through\n- several labels per case\n- switch as an **expression** that yields a value, with `yield` for blocks\n- **exhaustiveness** checking for enums when used as an expression\n\nThe traditional colon form still works, and can also `yield` in an expression switch.",
      ],
      [
        "Helpful NullPointerExceptions (JEP 358)",
        "The JVM now explains **which expression was null**: `Cannot invoke \"String.toLowerCase()\" because \"user.getName()\" is null`, or `Cannot load from int array because \"data\" is null`. It was off by default in 14 (`-XX:+ShowCodeDetailsInExceptionMessages`) and became the **default in 15**. The message is computed lazily from the bytecode, so it costs nothing until it is printed. With `-g`, local variable names appear as well.",
      ],
      [
        "Records (first preview, JEP 359)",
        "`record Point(int x, int y) { }` previewed concise, immutable data carriers with a generated constructor, accessors, equals, hashCode and toString. The design changed slightly through the second preview in 15, for example to allow local records and interfaces. Records became final in Java 16.",
      ],
      [
        "Pattern matching for instanceof (first preview, JEP 305)",
        "`if (obj instanceof String s) { s.length(); }` previewed merging the type test with a binding variable, which removes the explicit cast. It was finalised in 16, and became the foundation for Java 21's switch patterns and record patterns.",
      ],
      [
        "JFR event streaming, jpackage and the platform",
        "- **JFR event streaming** (JEP 349): consume Flight Recorder events continuously in-process through `RecordingStream`, for monitoring without dump files.\n- **jpackage** (incubator, final in 16): builds native installers (msi, exe, dmg, pkg, deb, rpm) that bundle a runtime.\n- **NUMA-aware memory allocation for G1** (JEP 345).\n- **Non-volatile mapped byte buffers** (JEP 352), for persistent memory.\n- The **foreign-memory access API**, first incubator (JEP 370).\n- **Removed**: the CMS collector (JEP 363) and the Pack200 tools.\n- **Deprecated**: the ParallelScavenge + SerialOld GC combination.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    record Address(String city) { }                        // previewed in 14, final in 16
    record Customer(String name, Address address) { }

    enum Size { S, M, L, XL }

    static String price(Size size) {
        return switch (size) {                              // final in 14, exhaustive over the enum
            case S, M -> "standard";
            case L -> "large";
            case XL -> {
                String note = "extra large";
                yield note + " (+20%)";
            }
        };
    }

    public static void main(String[] args) {
        // Switch expressions (final in 14).
        for (Size s : Size.values()) System.out.print(s + "=" + price(s) + "  ");
        System.out.println();

        // Helpful NullPointerExceptions.
        Customer c = new Customer("Duke", null);
        try { System.out.println(c.address().city().toUpperCase()); }
        catch (NullPointerException e) { System.out.println("helpful NPE: " + e.getMessage()); }
        int[] data = null;
        try { System.out.println(data[0]); }
        catch (NullPointerException e) { System.out.println("helpful NPE: " + e.getMessage()); }

        // Records (preview in 14).
        Customer d = new Customer("Ana", new Address("Pune"));
        System.out.println("record " + d + ", equals copy " + d.equals(new Customer("Ana", new Address("Pune"))));

        // Pattern matching for instanceof (preview in 14).
        Object[] values = {42, "fourteen", 3.5, d};
        for (Object v : values) {
            String text;
            if (v instanceof Integer i) text = "int doubled " + i * 2;
            else if (v instanceof String s && s.length() > 4) text = "long string " + s.toUpperCase();
            else if (v instanceof Customer cu) text = "customer from " + cu.address().city();
            else text = "other " + v;
            System.out.println("instanceof pattern -> " + text);
        }
    }
}`,
    release: 21,
    walk:
      "The `price` switch expression covers every Size constant, so no default is needed. S and M share an arrow case, and XL computes its value in a block with `yield`. Two helpful NullPointerException messages follow. One names the record accessor `Main$Customer.address()` whose return value was null. The other says exactly that the program could not load from an int array because the local variable `data` is null.\n\nThe records Customer and Address get their constructor, accessors, toString and value-based equals generated. A loop over mixed objects uses instanceof patterns: an Integer binding doubled, a String binding with an extra `&&` condition, and a record binding whose accessor chain is called directly. In Java 14 both records and patterns needed `--enable-preview`. This program uses their final Java 16 forms and compiles with `--release 21`.",
    anim: [
      "Reading a helpful NullPointerException",
      [
        ["code", "address().city()", "chained calls"],
        ["jvm", "JVM", "NPE thrown"],
        ["bc", "bytecode check", "which value?"],
        ["msg", "message", "precise reason"],
      ],
      [
        ["code", "jvm", "invoke city()", "address() returns null, so invoking city() on it throws NullPointerException."],
        ["jvm", "bc", "getMessage()", "Only when the message is requested does the JVM analyse the failing bytecode."],
        ["bc", "msg", "reconstruct", "It reconstructs the null expression: the return value of Customer.address()."],
        ["msg", "code", "fix fast", "The developer sees exactly which link of the chain was null."],
        ["bc", "bc", "zero cost", "No analysis happens if the exception is caught and never printed."],
      ],
    ],
    mistakes: [
      "Catching NullPointerException to handle missing values. Fix the null source, or use Optional.",
      "Using Java 14 preview record syntax in production code without understanding that previews could change.",
    ],
    qa: [
      [
        "Why were helpful NPE messages off by default in Java 14?",
        "To assess the risk: messages can reveal code details, and they needed a performance check. They became the default in Java 15 after that evaluation.",
      ],
      [
        "Which garbage collector was removed in Java 14?",
        "CMS (Concurrent Mark Sweep), deprecated in Java 9. G1, ZGC and Shenandoah replace it.",
      ],
      [
        "What does jpackage produce?",
        "A platform-specific installer or application image containing your app plus a jlink-trimmed runtime, so users need no separate Java installation.",
      ],
    ],
    ex: [
      "Rewrite `if (o instanceof String) { String s = (String) o; if (!s.isEmpty()) print(s); }` using a pattern, in one line.",
      "`if (o instanceof String s && !s.isEmpty()) print(s);`. The binding `s` is in scope on the right of `&&`, because it is definitely assigned there.",
    ],
  }),

  lesson("Java 15 (2020): Text Blocks Final, Sealed Classes Preview, Hidden Classes, ZGC and Shenandoah Production", {
    intro:
      "Java 15 (September 2020) made **text blocks** final. It previewed **sealed classes**, gave **records** a second preview, and introduced **hidden classes**. Its other changes:\n\n- **ZGC** and **Shenandoah** became production-ready\n- **EdDSA** signatures (JEP 339)\n- the legacy DatagramSocket API was reimplemented\n- **Nashorn was removed**, along with the Solaris and SPARC ports\n- biased locking was disabled and deprecated\n\nThe program uses text blocks, sealed types and EdDSA.",
    topics: [
      [
        "Text blocks are final (JEP 378)",
        "Multi-line literals: `\"\"\"`, then a newline, the content, and a closing `\"\"\"`. The compiler removes **incidental indentation**, so the content's indentation is measured relative to the least-indented line, including the closing delimiter. It strips trailing spaces and normalises line endings to `\\n`. The escapes `\\<newline>` (join lines) and `\\s` (a kept space) were added. String gained `formatted(...)`, `stripIndent()` and `translateEscapes()` to go with them.",
        "String html = \"\"\"\n        <p>Hello, %s</p>\n        \"\"\".formatted(name);",
      ],
      [
        "Sealed classes (first preview, JEP 360)",
        "`sealed interface Shape permits Circle, Square { }` previewed restricting which classes may extend or implement a type. The subclasses must be final, sealed or non-sealed. They let the compiler reason about **all** subtypes, which is the basis for exhaustive pattern matching. The feature was finalised in Java 17.",
      ],
      [
        "Hidden classes (JEP 371)",
        "`MethodHandles.Lookup.defineHiddenClass(bytes, ...)` defines classes that **cannot be discovered** by name (no `Class.forName`), cannot be linked from other classes' bytecode, and can be **unloaded independently** of their class loader. Frameworks that generate classes at runtime (lambdas, proxies, dynamic languages) use them instead of the old `Unsafe.defineAnonymousClass`. Lambda classes have been hidden classes since Java 15.",
      ],
      [
        "ZGC and Shenandoah ready for production (JEPs 377, 379)",
        "Both low-latency, concurrent, compacting collectors lost their experimental flags. They are enabled with `-XX:+UseZGC` and `-XX:+UseShenandoahGC`. They keep pause times in the millisecond range, or below, regardless of heap size, which suits large heaps and latency-sensitive services. G1 remains the default.",
      ],
      [
        "EdDSA, removals and deprecations",
        "- **EdDSA** (Ed25519 and Ed448) signatures: fast and secure modern digital signatures.\n- A reimplemented **DatagramSocket** (JEP 373).\n- **Removed**: the Nashorn JavaScript engine (JEP 372), and the Solaris and SPARC ports.\n- **Biased locking disabled** by default and deprecated (JEP 374).\n- **RMI Activation** deprecated for removal.\n- **Records** second preview (JEP 384), including local records.\n- **instanceof patterns** second preview (JEP 375).\n- **The foreign-memory API**, second incubator.",
      ],
    ],
    code: String.raw`import java.security.*;
import java.util.*;

public class Main {
    sealed interface Vehicle permits Car, Bike, Truck { }      // previewed in 15, final in 17
    record Car(int seats) implements Vehicle { }
    record Bike() implements Vehicle { }
    record Truck(double tons) implements Vehicle { }

    static String toll(Vehicle v) {
        return switch (v) {                                    // exhaustive thanks to sealed
            case Car c -> "car with " + c.seats() + " seats: 50";
            case Bike b -> "bike: free";
            case Truck t -> "truck " + t.tons() + "t: " + (int) (100 * t.tons());
        };
    }

    public static void main(String[] args) throws Exception {
        // Text blocks (final in 15) with formatted().
        String json = """
                {
                  "release": %d,
                  "features": ["text blocks", "hidden classes"]
                }
                """.formatted(15);
        System.out.println("text block JSON:\n" + json.strip());

        // \ (line join) and \s (kept space) escapes.
        String oneLine = """
                Java 15 \
                joins this line""";
        String padded = """
                abc\s
                """;
        System.out.println("line-join escape -> [" + oneLine + "], \\s keeps trailing space: [" + padded.stripTrailing().length() + " chars after strip vs " + padded.length() + "]");

        // Sealed classes.
        for (Vehicle v : List.of(new Car(5), new Bike(), new Truck(2.5))) System.out.println("sealed switch: " + toll(v));
        System.out.println("permitted subclasses: " + Arrays.stream(Vehicle.class.getPermittedSubclasses()).map(Class::getSimpleName).toList());

        // Hidden classes: lambdas are hidden classes since 15.
        Runnable r = () -> { };
        System.out.println("lambda class is hidden: " + r.getClass().isHidden());

        // EdDSA signatures (15).
        KeyPair keys = KeyPairGenerator.getInstance("Ed25519").generateKeyPair();
        Signature signer = Signature.getInstance("Ed25519");
        signer.initSign(keys.getPrivate());
        signer.update("release notes".getBytes());
        byte[] sig = signer.sign();
        Signature verifier = Signature.getInstance("Ed25519");
        verifier.initVerify(keys.getPublic());
        verifier.update("release notes".getBytes());
        System.out.println("Ed25519 signature " + sig.length + " bytes, verifies: " + verifier.verify(sig));

        // Nashorn removed in 15.
        System.out.println("nashorn available: " + (new javax.script.ScriptEngineManager().getEngineByName("nashorn") != null));
    }
}`,
    release: 21,
    walk:
      "The JSON text block keeps its relative indentation, and fills in the release number with `formatted`. A trailing `\\` joins two source lines into one string. `\\s` keeps a trailing space that would otherwise be stripped, so the string is one character longer than its stripped version (plus the newline). The sealed Vehicle interface permits exactly three records. The toll switch is therefore exhaustive without a default, and `getPermittedSubclasses()` lists them.\n\nA lambda's runtime class reports `isHidden()` as true, because the JDK has spun lambda classes as hidden classes since Java 15. Ed25519 generates a key pair, signs a message into a 64-byte signature, and verifies it. Finally the program confirms that Nashorn is gone. The sealed and record code uses its final forms (Java 16 and 17).",
    anim: [
      "Text block indentation stripping",
      [
        ["src", "source lines", "indented in code"],
        ["min", "minimum indent", "closing quotes too"],
        ["strip", "strip incidental", "remove common"],
        ["norm", "normalise", "\\n, trailing spaces"],
        ["str", "String", "final value"],
      ],
      [
        ["src", "min", "measure", "The compiler measures the leading whitespace of each content line and the closing delimiter."],
        ["min", "strip", "common prefix", "The smallest indentation is incidental and is removed from every line."],
        ["strip", "norm", "clean up", "Trailing spaces are stripped and line endings become \\n."],
        ["norm", "str", "escapes", "Escape sequences such as \\s and line-join \\ are processed last."],
        ["str", "src", "relative indent", "Indentation beyond the minimum is kept, so nested JSON stays readable."],
      ],
    ],
    mistakes: [
      "Putting content on the same line as the opening `\"\"\"`. A line break is required after it.",
      "Expecting trailing spaces in a text block to survive. Use `\\s`, or escape them.",
    ],
    qa: [
      [
        "Why was biased locking removed?",
        "It sped up uncontended locking in old code (Vector, Hashtable), but added complexity and revocation pauses. Modern code uses fewer synchronized collections, so its benefit no longer justified the cost.",
      ],
      [
        "Where can I run JavaScript after Nashorn's removal?",
        "Use the standalone OpenJDK Nashorn library (`org.openjdk.nashorn`), or GraalJS through the JSR 223 API or Graal's polyglot API.",
      ],
      [
        "How does a hidden class differ from an anonymous class?",
        "An anonymous class is a normal class that the compiler generates with a name (Outer$1). A hidden class is defined at runtime from bytes, has no discoverable name, and can be unloaded on its own.",
      ],
    ],
    ex: [
      "Write a text block containing an SQL query with a `%s` placeholder for the table name, and produce the final string for the table `orders`.",
      "`String q = \"\"\"\\n    SELECT id, total\\n    FROM %s\\n    WHERE total > 100\\n    \"\"\".formatted(\"orders\");`. In source code each line is written on its own line; `formatted` replaces `%s`.",
    ],
  }),

  lesson("Java 16 (2021): Records and instanceof Patterns Final, Stream.toList, jpackage and Strong Encapsulation", {
    intro:
      "Java 16 (March 2021) finalised **records** and **pattern matching for instanceof**, and made **strong encapsulation of JDK internals** the default. It also added:\n\n- `Stream.toList()` and `mapMulti`\n- the **jpackage** tool, now final\n- Unix-domain socket channels\n- warnings for synchronizing on value-based classes\n- the Vector API, as an incubator\n- elastic metaspace\n- concurrent stack processing in ZGC\n\nOpenJDK also moved its source code to Git and GitHub.",
    topics: [
      [
        "Records are final (JEP 395)",
        "`record Point(int x, int y) { }` declares a final, shallowly immutable data class with a canonical constructor, accessors, equals, hashCode and toString. Compact constructors validate and normalise the values. Records can implement interfaces, and have static members, instance methods and nested types. **Local records**, along with local enums and interfaces, are allowed. Inner classes may now declare static members, which made local records possible.",
      ],
      [
        "Pattern matching for instanceof is final (JEP 394)",
        "`if (o instanceof String s)` binds `s` when the test succeeds. The binding is in scope only where it is definitely matched (flow scoping), and **binding variables are no longer implicitly final**, a change from the preview. Pattern variables cannot shadow fields in conflicting ways, and `instanceof` with a pattern is a compile error when the test always succeeds (for example, `String s instanceof CharSequence cs`).",
      ],
      [
        "Strong encapsulation by default (JEP 396)",
        "The default for `--illegal-access` changed from `permit` to **`deny`**. Code that reflects into non-exported JDK packages now fails with InaccessibleObjectException, unless it is opened with `--add-opens`. This forced libraries to use supported APIs. Java 17 removed the option completely (JEP 403). The critical internal API `sun.misc.Unsafe` stayed accessible in the jdk.unsupported module.",
      ],
      [
        "Stream.toList(), mapMulti and other APIs",
        "- **`Stream.toList()`**: a short way to get an **unmodifiable** List, which allows nulls.\n- **`Stream.mapMulti((e, sink) -> ...)`**: an imperative flatMap that pushes zero or more results.\n- **Unix-domain socket channels** (`UnixDomainSocketAddress`, JEP 380), for fast local IPC on Linux, macOS and Windows.\n- `HttpClient` improvements.\n- Day-period support in DateTimeFormatter (the `B` pattern letter, \"in the morning\").\n- The **Vector API** (incubator, JEP 338), for SIMD computations.\n- The **Foreign Linker API** incubator.",
      ],
      [
        "jpackage, value-based classes and the JVM",
        "- **jpackage** is final (JEP 392): it creates native installers.\n- **Warnings for value-based classes** (JEP 390): the wrapper constructors such as `new Integer(5)` are deprecated for removal, and `synchronized` on Integer, LocalDate and similar classes gives a warning. This prepared for **Project Valhalla**'s value objects.\n- **ZGC concurrent thread-stack processing** (JEP 376), for even shorter pauses.\n- **Elastic metaspace** (JEP 387), which returns unused metaspace memory to the OS.\n- An Alpine Linux (musl) port.\n- The OpenJDK source moved to **GitHub** (JEPs 357 and 369).",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.stream.*;

public class Main {
    // Records (final in 16) with a compact constructor and a static factory.
    record Temperature(double celsius) {
        Temperature {
            if (celsius < -273.15) throw new IllegalArgumentException("below absolute zero: " + celsius);
        }
        static Temperature ofFahrenheit(double f) { return new Temperature((f - 32) * 5 / 9); }
        double fahrenheit() { return celsius * 9 / 5 + 32; }
    }

    interface Shape { double area(); }
    record Circle(double r) implements Shape { public double area() { return Math.PI * r * r; } }
    record Rect(double w, double h) implements Shape { public double area() { return w * h; } }

    public static void main(String[] args) throws Exception {
        // Records.
        Temperature boiling = new Temperature(100);
        Temperature body = Temperature.ofFahrenheit(98.6);
        System.out.printf("records: %s = %.1f F, body %.1f C, equals %b%n", boiling, boiling.fahrenheit(), body.celsius(), boiling.equals(new Temperature(100)));
        try { new Temperature(-300); } catch (IllegalArgumentException e) { System.out.println("compact constructor: " + e.getMessage()); }

        // Local record (allowed since 16).
        record Pair(String name, double area) { }
        List<Pair> areas = Stream.of(new Circle(1), new Rect(2, 3))
                .map(s -> new Pair(s.getClass().getSimpleName(), Math.round(s.area() * 100) / 100.0))
                .toList();                                          // Stream.toList (16)
        System.out.println("local record + Stream.toList: " + areas);
        try { areas.add(new Pair("x", 0)); } catch (UnsupportedOperationException e) { System.out.println("Stream.toList() result is unmodifiable"); }

        // instanceof patterns (final in 16): binding variables are not final anymore.
        Object o = "  sixteen  ";
        if (o instanceof String s) {
            s = s.strip();                                          // allowed in the final version
            System.out.println("instanceof binding reassigned: [" + s + "]");
        }
        if (!(o instanceof String text)) throw new AssertionError();
        System.out.println("flow scoping after negated test: length " + text.length());

        // mapMulti (16): an imperative flatMap.
        List<Object> nested = List.of(1, List.of(2, 3), 4, List.of(5));
        List<Integer> flat = nested.stream().<Integer>mapMulti((item, sink) -> {
            if (item instanceof Integer i) sink.accept(i);
            else if (item instanceof List<?> list) list.forEach(x -> sink.accept((Integer) x));
        }).toList();
        System.out.println("mapMulti flattened " + flat);

        // Strong encapsulation (16/17).
        try {
            var field = java.util.ArrayList.class.getDeclaredField("elementData");
            field.setAccessible(true);
            System.out.println("unexpected access");
        } catch (RuntimeException | NoSuchFieldException e) {
            System.out.println("deep reflection into java.util -> " + e.getClass().getSimpleName() + " (use --add-opens java.base/java.util=ALL-UNNAMED)");
        }

        // Value-based classes: prefer valueOf over deprecated constructors.
        Integer a = Integer.valueOf(127), b = Integer.valueOf(127);
        System.out.println("value-based: Integer.valueOf(127) cached " + (a == b) + "; new Integer(..) is deprecated for removal");
    }
}`,
    release: 21,
    walk:
      "The Temperature record validates its value in a compact constructor, so -300 °C is rejected. It also offers a static factory converting from Fahrenheit, and a derived method, and its equals is value-based. A **local record** Pair is declared inside main, which Java 16 allows. A stream maps two shapes into Pairs and collects them with `Stream.toList()`, which returns an unmodifiable list.\n\nThe instanceof binding `s` is reassigned after the strip, which is legal in the final version of the feature. The negated test shows flow scoping: `text` is in scope after the early exit. `mapMulti` flattens a mixed list by pushing values into a sink, with a pattern for each case. Reflection into `ArrayList.elementData` fails with InaccessibleObjectException, because JDK internals have been encapsulated by default since Java 16. Finally `Integer.valueOf` is preferred over the deprecated wrapper constructors.",
    anim: [
      "What a record declaration generates",
      [
        ["decl", "record header", "Temperature(c)"],
        ["field", "private final", "celsius"],
        ["ctor", "constructor", "compact checks"],
        ["acc", "accessor", "celsius()"],
        ["obj", "equals/hash/str", "value semantics"],
      ],
      [
        ["decl", "field", "components", "Each component becomes a private final field."],
        ["decl", "ctor", "canonical", "A canonical constructor is generated; the compact form adds validation."],
        ["decl", "acc", "accessors", "Accessors are named after the components: celsius(), not getCelsius()."],
        ["decl", "obj", "Object methods", "equals, hashCode and toString are derived from all components."],
        ["ctor", "field", "assign last", "The compact constructor's checks run first, then the fields are assigned."],
      ],
    ],
    mistakes: [
      "Using `Stream.toList()` and then trying to add to the result. It is unmodifiable.",
      "Treating records as JPA entities. They are immutable and final, and have no no-arg constructor.",
      "Relying on `--illegal-access=permit` workarounds. The option was removed in Java 17.",
    ],
    qa: [
      [
        "How does `Stream.toList()` differ from `Collectors.toUnmodifiableList()`?",
        "Both are unmodifiable, but `toList()` allows null elements while `toUnmodifiableList()` throws NullPointerException on them. `toList()` is also shorter and slightly more efficient.",
      ],
      [
        "Can a record have extra instance fields?",
        "No. Only the components become instance fields. Derived values must be computed in methods, or stored in static fields if they are shared.",
      ],
      [
        "What are value-based classes?",
        "Classes such as Integer, Optional and LocalDate whose instances should be treated as interchangeable values. Their identity, `==` and synchronization should not be relied upon. Project Valhalla will turn many of them into true value classes.",
      ],
    ],
    ex: [
      "Write a record `Money(long paise, String currency)` with a compact constructor that rejects negative amounts and normalises the currency to upper case, plus a `plus` method.",
      "`record Money(long paise, String currency) { Money { if (paise < 0) throw new IllegalArgumentException(); currency = currency.toUpperCase(); } Money plus(Money o) { if (!currency.equals(o.currency)) throw new IllegalArgumentException(\"currency\"); return new Money(paise + o.paise, currency); } }`",
    ],
  }),

  lesson("Java 17 (2021, LTS): Sealed Classes Final, Strong Encapsulation, RandomGenerator and Strict Floating Point", {
    intro:
      "Java 17 (September 2021) is an LTS release, and became the most adopted modern baseline. Spring Boot 3 and Jakarta EE 10 require it. It made **sealed classes** final and **strongly encapsulated JDK internals** with no opt-out switch. It also brought:\n\n- the new **RandomGenerator** API\n- **always-strict floating point** again\n- context-specific **deserialization filters**\n- macOS/AArch64 support\n- pattern matching for switch, as a first preview\n\nIt deprecated the **Applet API** and the **Security Manager** for removal.",
    topics: [
      [
        "Sealed classes and interfaces are final (JEP 409)",
        "`sealed` types list their permitted direct subtypes with `permits`, which can be omitted when they are in the same file. Each subtype must be `final`, `sealed` or `non-sealed`. The permitted subclasses must be in the same module, or the same package when unnamed. Reflection exposes `isSealed()` and `getPermittedSubclasses()`. Combined with records and (from Java 21) pattern-matching switch, sealed types give algebraic data types with **exhaustiveness checking**.",
      ],
      [
        "Strongly encapsulated JDK internals (JEP 403)",
        "The `--illegal-access` option is gone. All internal packages of the JDK are inaccessible to reflection unless they are explicitly opened with `--add-opens`. A few critical internal APIs, such as `sun.misc.Unsafe` and `sun.misc.Signal`, remain available through the `jdk.unsupported` module. Upgrading to 17 often requires newer versions of libraries such as Lombok, ByteBuddy, Mockito and Spring.",
      ],
      [
        "Enhanced pseudo-random number generators (JEP 356)",
        "The new `java.util.random.RandomGenerator` interface unifies Random, ThreadLocalRandom, SplittableRandom and new algorithms such as the **LXM family** (`L64X128MixRandom` and others) and Xoshiro. You select one by name with `RandomGenerator.of(\"L64X128MixRandom\")`, or through `RandomGeneratorFactory`. They also offer jumpable and splittable generators for parallel simulations, plus stream methods (`ints`, `doubles`).",
      ],
      [
        "Always-strict floating point and other language changes",
        "**JEP 306** restored **always-strict** floating-point semantics: all float and double arithmetic now gives identical, IEEE-754-strict results on every platform, so the `strictfp` modifier is redundant and produces a warning. Pattern matching for **switch** appeared as a first preview (JEP 406), and was finalised in 21. Context-specific **deserialization filters** (JEP 415) let applications configure per-stream filters through a filter factory.",
      ],
      [
        "Platform: macOS/AArch64, deprecations and removals",
        "- **macOS on Apple Silicon** (AArch64) port (JEP 391), and a new macOS rendering pipeline on Metal (JEP 382).\n- **Deprecated for removal**: the Applet API (JEP 398, removed in 26) and the **Security Manager** (JEP 411, permanently disabled in 24).\n- **Removed**: RMI Activation (JEP 407), and the experimental AOT and Graal JIT compilers (JEP 410).\n- The **Foreign Function & Memory API** (incubator, JEP 412).\n- The **Vector API** (second incubator).\n- Oracle JDK became free to use again under the **No-Fee Terms and Conditions**.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.random.*;
import java.util.stream.*;

public class Main {
    // Sealed hierarchy (final in 17), with each kind of permitted subclass.
    sealed interface Account permits Savings, Current, Special { }
    record Savings(double balance, double rate) implements Account { }            // records are implicitly final
    record Current(double balance, double overdraft) implements Account { }
    static non-sealed class Special implements Account { final double balance = 0; } // reopened for extension
    static final class Escrow extends Special { }

    static double available(Account a) {
        if (a instanceof Savings s) return s.balance();
        if (a instanceof Current c) return c.balance() + c.overdraft();
        return ((Special) a).balance;                                               // the only remaining permitted type
    }

    public static void main(String[] args) {
        // Sealed classes and reflection.
        System.out.println("Account sealed: " + Account.class.isSealed() + ", permits "
                + Arrays.stream(Account.class.getPermittedSubclasses()).map(Class::getSimpleName).toList()
                + ", Special sealed: " + Special.class.isSealed());
        for (Account a : List.of(new Savings(1000, 0.04), new Current(500, 200), new Escrow()))
            System.out.println("available(" + a.getClass().getSimpleName() + ") = " + available(a));

        // RandomGenerator API (17) - seeded so the output is reproducible.
        RandomGenerator lxm = RandomGeneratorFactory.of("L64X128MixRandom").create(42);
        RandomGenerator classic = new Random(42);
        System.out.println("L64X128MixRandom ints " + lxm.ints(5, 1, 100).boxed().toList()
                + ", java.util.Random is a RandomGenerator: " + (classic instanceof RandomGenerator));
        System.out.println("available algorithms include Xoshiro256PlusPlus: "
                + RandomGeneratorFactory.all().anyMatch(f -> f.name().equals("Xoshiro256PlusPlus")));

        // Always-strict floating point: identical results everywhere, no strictfp needed.
        double x = 0.1 * 3, y = Math.pow(2, -1074);
        System.out.println("strict FP: 0.1 * 3 = " + x + ", smallest double " + y + ", 1e308 * 10 = " + (1e308 * 10));

        // Strong encapsulation: no --illegal-access any more.
        try {
            var f = Class.forName("java.lang.Thread").getDeclaredField("name");
            f.setAccessible(true);
            System.out.println("unexpected");
        } catch (Exception e) {
            System.out.println("deep reflection into java.lang.Thread -> " + e.getClass().getSimpleName());
        }

        // Applet API deprecated for removal in 17 (removed in 26).
        boolean appletPresent = ModuleLayer.boot().findModule("java.desktop").map(m -> m.getPackages().contains("java.applet")).orElse(false);
        System.out.println("java.applet package present on this JDK: " + appletPresent);
    }
}`,
    release: 21,
    walk:
      "Account is sealed and permits two records and a non-sealed class. Reflection confirms that Account is sealed, lists its permitted subclasses, and shows that the non-sealed Special is open again: Escrow extends it freely. `available` handles every permitted subtype with instanceof patterns; Java 21's switch can do the same with exhaustiveness checking.\n\nThe RandomGenerator API creates a seeded LXM generator by name and draws five reproducible integers. The legacy `java.util.Random` now implements the same interface. Floating point is strict: `0.1 * 3` gives 0.30000000000000004 on every platform, and the subnormal minimum and overflow to Infinity behave the same everywhere. Reflecting into Thread's private field fails, because internals are strongly encapsulated. The program also checks whether `java.applet` still exists, and it does not on JDK 26, where the API was removed.",
    anim: [
      "Sealed, final and non-sealed",
      [
        ["root", "sealed Account", "permits 3"],
        ["sav", "Savings", "record (final)"],
        ["cur", "Current", "record (final)"],
        ["spec", "Special", "non-sealed"],
        ["esc", "Escrow", "any subclass"],
      ],
      [
        ["root", "sav", "permits", "Savings is a permitted subtype; as a record it is implicitly final."],
        ["root", "cur", "permits", "Current is the second permitted record."],
        ["root", "spec", "permits", "Special is permitted but declared non-sealed, reopening that branch."],
        ["spec", "esc", "extends", "Any class may extend Special, for example Escrow, without new permits."],
        ["root", "root", "closed list", "No other direct subtype of Account can exist: the compiler knows them all."],
      ],
    ],
    mistakes: [
      "Forgetting to mark each permitted subclass final, sealed or non-sealed, which is a compile error.",
      "Upgrading to 17 without upgrading bytecode-manipulating libraries, which then hit InaccessibleObjectException.",
      "Keeping `strictfp` in new code. It now has no effect.",
    ],
    qa: [
      [
        "Why is Java 17 such a popular baseline?",
        "It was the first LTS after 11, with records, sealed classes, text blocks, switch expressions and much better GCs. Spring Boot 3 and Jakarta EE 10 made it their minimum, and Oracle's free licence terms returned.",
      ],
      [
        "What can a sealed interface's `permits` list contain?",
        "Classes and interfaces (sealed or non-sealed interfaces, too) that directly extend or implement it, in the same module, or in the same package for the unnamed module.",
      ],
      [
        "What replaces the Security Manager?",
        "Nothing inside the JVM. Use OS-level sandboxing (containers, seccomp), process isolation, and the module system's encapsulation. The JDK will not provide in-process sandboxing.",
      ],
    ],
    ex: [
      "Make Account's `available` method a Java 21 switch expression without a default, and explain what happens if a fourth permitted class is added later.",
      "`return switch (a) { case Savings s -> s.balance(); case Current c -> c.balance() + c.overdraft(); case Special sp -> sp.balance; };`. If a fourth type is added to `permits`, this switch stops compiling until a case is added for it.",
    ],
  }),

  lesson("Java 18 (2022): UTF-8 by Default, the Simple Web Server and Code Snippets in Javadoc", {
    intro:
      "Java 18 (March 2022) made **UTF-8 the default charset** on every platform, and shipped the **`jwebserver`** simple HTTP file server. It added `@snippet` for code samples in Javadoc. The remaining changes:\n\n- core reflection reimplemented with method handles\n- an internet-address resolution SPI\n- the Vector API (third incubator)\n- the FFM API (second incubator)\n- pattern matching for switch (second preview)\n\nIt also **deprecated finalization for removal**. The program checks the charset defaults, and starts the simple web server API in-process.",
    topics: [
      [
        "UTF-8 by default (JEP 400)",
        "Before 18, the default charset (`Charset.defaultCharset()`) depended on the OS locale, for example windows-1252 on many Windows machines. So `new FileReader(file)`, `String.getBytes()` and `new String(bytes)` behaved differently on different machines, causing mojibake. Since 18, **UTF-8 is the default everywhere** for those APIs. The console encoding (`stdout.encoding`) and `sun.jnu.encoding` (file names) still follow the OS. `-Dfile.encoding=COMPAT` restores the old behaviour, and the system property `native.encoding` reveals the OS charset.",
      ],
      [
        "Simple Web Server (JEP 408)",
        "`jwebserver` serves static files from the current directory over HTTP/1.1, by default on port 8000 and bound to loopback. It is for prototyping, testing and quick file sharing, and is not for production: it has no HTTPS, no dynamic content and only minimal security. The API `com.sun.net.httpserver.SimpleFileServer` creates the same server programmatically, with output filters and request handlers for small test servers.",
      ],
      [
        "Code snippets in Javadoc (JEP 413)",
        "The `{@snippet : ... }` tag (inline, or external through `file=` and `region=`) replaces `<pre>{@code ...}</pre>` for examples in Javadoc. It supports highlighting (`@highlight`), links (`@link`), and replacements (`@replace`) inside the snippet, and external snippet files can be compiled and tested so that documentation examples do not rot.",
      ],
      [
        "Reflection with method handles, address-resolution SPI, finalization deprecated",
        "- **Core reflection reimplemented** on method handles (JEP 416): `Method.invoke`, `Constructor.newInstance` and `Field` access, with less duplicated code and better performance after warm-up.\n- **The internet-address resolution SPI** (JEP 418): pluggable host-name resolution, useful for tests and Project Loom.\n- **Finalization deprecated for removal** (JEP 421): `finalize()` methods should be replaced with try-with-resources or `Cleaner`. `--finalization=disabled` lets you test without it.\n- **Previews and incubators**: switch patterns (second preview), Vector API, FFM API.",
      ],
    ],
    code: String.raw`import com.sun.net.httpserver.*;
import java.io.*;
import java.lang.ref.Cleaner;
import java.net.*;
import java.net.http.*;
import java.nio.charset.Charset;
import java.nio.file.*;

public class Main {
    // Cleaner instead of finalize() (finalization deprecated for removal in 18).
    static final Cleaner CLEANER = Cleaner.create();
    static class NativeResource implements AutoCloseable {
        private final Cleaner.Cleanable cleanable;
        NativeResource(String name) { cleanable = CLEANER.register(this, () -> System.out.println("cleaned " + name)); }
        public void close() { cleanable.clean(); }        // deterministic; Cleaner is only the safety net
    }

    public static void main(String[] args) throws Exception {
        // UTF-8 by default.
        System.out.println("default charset " + Charset.defaultCharset() + ", file.encoding " + System.getProperty("file.encoding")
                + ", native.encoding known: " + (System.getProperty("native.encoding") != null));
        Path file = Files.createTempFile("utf8", ".txt");
        try (Writer w = new FileWriter(file.toFile())) { w.write("नमस्ते café"); }   // FileWriter now writes UTF-8
        System.out.println("FileWriter default -> " + Files.size(file) + " bytes, read back with default charset: "
                + new String(Files.readAllBytes(file)).equals("नमस्ते café"));

        // Simple web server API (the same server as the jwebserver tool).
        Path site = Files.createTempDirectory("site");
        Files.writeString(site.resolve("index.html"), "<h1>Hello from SimpleFileServer</h1>");
        HttpServer server = SimpleFileServer.createFileServer(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), site, SimpleFileServer.OutputLevel.NONE);
        server.start();
        try {
            int port = server.getAddress().getPort();
            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> res = client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/index.html")).build(),
                    HttpResponse.BodyHandlers.ofString());
            HttpResponse<String> missing = client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/nope.html")).build(),
                    HttpResponse.BodyHandlers.ofString());
            System.out.println("SimpleFileServer: GET /index.html -> " + res.statusCode() + " " + res.body() + ", /nope.html -> " + missing.statusCode()
                    + ", content type " + res.headers().firstValue("content-type").orElse("?"));
        } finally {
            server.stop(0);
        }

        // Cleaner replaces finalize().
        try (NativeResource r = new NativeResource("buffer-1")) {
            System.out.println("using NativeResource");
        }
    }
}`,
    release: 21,
    walk:
      "The first line confirms that the default charset is UTF-8, whatever the operating system's locale. `native.encoding` still reveals the OS charset. A FileWriter created without an explicit charset now writes UTF-8, so the Hindi and accented text round-trips correctly: Devanagari characters take 3 bytes each and é takes 2. Before Java 18 on Windows, the same code would have corrupted this text.\n\n`SimpleFileServer.createFileServer` starts the same server as the `jwebserver` tool, serving a temporary directory on a random loopback port. The HttpClient fetches index.html (200, with a text/html content type) and a missing page (404), then the server stops. Finally a Cleaner-based resource shows the replacement for the deprecated `finalize()`: `close()` cleans deterministically, and the Cleaner remains a safety net.",
    anim: [
      "Default charset before and after Java 18",
      [
        ["code", "new FileWriter", "no charset given"],
        ["old", "Java 17 Windows", "windows-1252"],
        ["new", "Java 18+", "UTF-8 everywhere"],
        ["file", "file bytes", "on disk"],
      ],
      [
        ["code", "old", "before 18", "Without an explicit charset, Java 17 used the OS default, such as windows-1252."],
        ["old", "file", "lossy", "Characters outside that code page became '?', or garbage on another machine."],
        ["code", "new", "since 18", "Java 18 makes UTF-8 the default for file and string conversion APIs."],
        ["new", "file", "portable", "The same program writes identical UTF-8 bytes on Windows, Linux and macOS."],
        ["new", "code", "still explicit", "Best practice: still pass StandardCharsets.UTF_8 explicitly."],
      ],
    ],
    mistakes: [
      "Assuming the console output encoding also became UTF-8. `System.out` uses `stdout.encoding`, which follows the terminal.",
      "Using `jwebserver` in production. It is a development tool.",
      "Writing new `finalize()` methods. Use try-with-resources and Cleaner.",
    ],
    qa: [
      [
        "How can you get the pre-18 charset behaviour back?",
        "Run with `-Dfile.encoding=COMPAT`, so the default charset follows the OS again, or pass explicit charsets everywhere, which is better.",
      ],
      [
        "Why is finalization being removed?",
        "Finalizers run unpredictably (or never), slow down GC, can resurrect objects, and have caused security and memory issues. Deterministic closing and Cleaner are safer.",
      ],
      [
        "What is the difference between `@snippet` and `@code`?",
        "`@code` only escapes text. `@snippet` supports markup for highlighting and links, external validated source files, and regions of those files.",
      ],
    ],
    ex: [
      "Serve the files in `./docs` on port 9000 for a quick demo using only the JDK. Give both the command-line and the Java API version.",
      "Command line: `jwebserver -d ./docs -p 9000`. API: `SimpleFileServer.createFileServer(new InetSocketAddress(9000), Path.of(\"docs\").toAbsolutePath(), SimpleFileServer.OutputLevel.INFO).start();`. The directory must be absolute.",
    ],
  }),

  lesson("Java 19 (2022) and Java 20 (2023): Virtual Threads, Record Patterns, Structured Concurrency and Scoped Values Previews", {
    intro:
      "Java 19 (September 2022) and Java 20 (March 2023) were the **Project Loom and Project Amber preview releases**. Java 19 previewed **virtual threads**, **record patterns** and the **FFM API**, with **structured concurrency** as an incubator. Java 20 added **scoped values** (incubator) and second or third previews of the rest. These releases also added:\n\n- the Linux/RISC-V port (19)\n- `Future.state`, `resultNow` and `exceptionNow` (19)\n- `ExecutorService` becoming AutoCloseable (19)\n- `HashMap.newHashMap(n)` (19)\n\nAll of these features are final today, so the program uses their final forms.",
    topics: [
      [
        "Virtual threads (preview in 19 and 20, final in 21)",
        "JEP 425 (19) and JEP 436 (20) previewed lightweight threads scheduled by the JVM on a few carrier threads: `Thread.ofVirtual().start(r)`, `Thread.startVirtualThread(r)` and `Executors.newVirtualThreadPerTaskExecutor()`. Blocking I/O unmounts the virtual thread instead of blocking an OS thread, so millions of concurrent tasks become feasible with plain blocking code. They were finalised in Java 21 (JEP 444).",
      ],
      [
        "Record patterns (preview in 19 and 20, final in 21)",
        "JEP 405 (19) and JEP 432 (20) previewed **deconstructing records in patterns**: `if (o instanceof Point(int x, int y))`, nested patterns, and `var` in components. Java 20 added record patterns in **enhanced for loops**, which was later dropped, and inference of generic type arguments. Pattern matching for switch had its third and fourth previews in these releases (JEPs 427 and 433). Both were finalised in 21.",
      ],
      [
        "Structured concurrency (incubator in 19 and 20)",
        "JEP 428 (19) and JEP 437 (20) incubated `StructuredTaskScope` in the `jdk.incubator.concurrent` module. It treats a group of subtasks as one unit, with fork, join, propagation of failure and cancellation, and no leaked threads. Its API changed several times, and it is still a **preview in Java 21 to 27** (now `StructuredTaskScope.open()` with Joiners).",
      ],
      [
        "Scoped values (incubator in 20)",
        "JEP 429 (20) incubated `ScopedValue`, an immutable, bounded alternative to ThreadLocal for passing context down the call stack and into child threads: `ScopedValue.where(USER, u).run(...)`. It went through previews in 21 to 24, and became **final in Java 25** (JEP 506).",
      ],
      [
        "Foreign Function & Memory API previews, and other changes",
        "- **The FFM API** (`java.lang.foreign`) moved from incubator to **preview** in 19 (JEP 424) and had a second preview in 20 (JEP 434). It was finalised in 22.\n- **The Vector API**: fourth and fifth incubators.\n- **Linux/RISC-V** port (JEP 422).\n- In 19: **`ExecutorService` implements AutoCloseable**, `Future.state()`, `resultNow()` and `exceptionNow()`, and the presizing factories `HashMap.newHashMap(n)`, `HashSet.newHashSet(n)` and `LinkedHashMap.newLinkedHashMap(n)`.\n- `Thread.join(Duration)` and `Thread.sleep(Duration)`.\n- The new **thread dump format** (JSON).",
      ],
    ],
    code: String.raw`import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    record Point(int x, int y) { }
    record Line(Point from, Point to) { }

    static String describe(Object o) {
        // Record patterns (previewed in 19/20, final in 21) with nesting and var.
        if (o instanceof Line(Point(var x1, var y1), Point(var x2, var y2)))
            return "line of length " + Math.hypot(x2 - x1, y2 - y1);
        if (o instanceof Point(int x, int y)) return "point at " + x + "," + y;
        return "something else";
    }

    public static void main(String[] args) throws Exception {
        // Virtual threads (previewed in 19/20).
        Thread vt = Thread.startVirtualThread(() -> { });
        vt.join(Duration.ofSeconds(1));                               // join(Duration) added in 19
        System.out.println("virtual thread: isVirtual " + vt.isVirtual() + ", terminated " + (vt.getState() == Thread.State.TERMINATED));

        // ExecutorService is AutoCloseable (19); close() waits for tasks.
        List<Future<Integer>> futures = new ArrayList<>();
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 1; i <= 5; i++) {
                int n = i;
                futures.add(exec.submit(() -> { Thread.sleep(Duration.ofMillis(20)); return n * n; }));   // sleep(Duration) (19)
            }
        }
        // Future.state() and resultNow() (19).
        List<String> states = new ArrayList<>();
        for (Future<Integer> f : futures) states.add(f.state() + ":" + f.resultNow());
        System.out.println("ExecutorService closed after all tasks; Future.state/resultNow -> " + states);

        Future<Integer> failed;
        try (ExecutorService exec = Executors.newSingleThreadExecutor()) {
            failed = exec.submit(() -> { throw new IllegalStateException("boom"); });
        }
        System.out.println("failed future state " + failed.state() + ", exceptionNow " + failed.exceptionNow().getMessage());

        // Record patterns.
        System.out.println("record pattern -> " + describe(new Line(new Point(0, 0), new Point(6, 8))));
        System.out.println("record pattern -> " + describe(new Point(2, 3)));

        // Presized collections (19): capacity for the expected number of mappings, not buckets.
        Map<String, Integer> sized = HashMap.newHashMap(100);
        for (int i = 0; i < 100; i++) sized.put("k" + i, i);
        Set<String> set = HashSet.newHashSet(10);
        set.add("loom");
        System.out.println("HashMap.newHashMap(100) holds " + sized.size() + " entries without resizing; HashSet.newHashSet -> " + set);
    }
}`,
    release: 21,
    walk:
      "A virtual thread is started and joined with the `Duration` overload added in Java 19. Five tasks then run on a virtual-thread-per-task executor inside try-with-resources. Since Java 19, ExecutorService is AutoCloseable, so the closing brace waits for every task. Each Future's `state()` reports SUCCESS, and `resultNow()` reads its value without blocking or checked exceptions. A failing task shows the FAILED state and `exceptionNow()`.\n\nThe `describe` method deconstructs nested records: a Line of two Points gives length 10 for (0,0) to (6,8), using `var` components, and a single Point is matched by its own record pattern. `HashMap.newHashMap(100)` creates a map sized for 100 mappings, so it never resizes while filling. Previously developers had to calculate `100 / 0.75 + 1` by hand. Virtual threads and record patterns are used in their final Java 21 forms.",
    anim: [
      "Preview to final: Loom and Amber",
      [
        ["j19", "Java 19", "previews begin"],
        ["j20", "Java 20", "second previews"],
        ["j21", "Java 21", "final"],
        ["j25", "Java 25", "scoped values final"],
      ],
      [
        ["j19", "j20", "virtual threads", "Virtual threads preview in 19 (JEP 425) and 20 (JEP 436)."],
        ["j20", "j21", "JEP 444", "They become a standard feature in Java 21 LTS."],
        ["j19", "j21", "record patterns", "Record patterns preview in 19 and 20, then become final in 21 (JEP 440)."],
        ["j20", "j25", "scoped values", "Scoped values incubate in 20, preview in 21-24, and become final in 25."],
        ["j19", "j19", "structured conc.", "Structured concurrency incubates in 19 and is still a preview in 27."],
      ],
    ],
    mistakes: [
      "Running preview-era code (Java 19 or 20) on newer JDKs and expecting identical APIs. Previews changed before they were finalised.",
      "Calling `resultNow()` on a future that is not complete, which throws IllegalStateException.",
    ],
    qa: [
      [
        "Why did virtual threads need two preview rounds?",
        "To collect feedback on API details (such as thread-local behaviour and pinning diagnostics) and on compatibility with existing tools, before committing to a final, permanent design in an LTS.",
      ],
      [
        "What does `ExecutorService.close()` do?",
        "It initiates an orderly shutdown and waits until all tasks have completed, like `shutdown()` plus `awaitTermination` in a loop. It enables try-with-resources for executors.",
      ],
      [
        "Why use `HashMap.newHashMap(n)` instead of `new HashMap<>(n)`?",
        "The constructor's argument is the initial table capacity, not the number of mappings. With the default load factor of 0.75, `new HashMap<>(100)` resizes before reaching 100 entries, while `newHashMap(100)` is sized for exactly 100 mappings.",
      ],
    ],
    ex: [
      "Rewrite a fan-out of 3 blocking calls, written with a fixed thread pool and `Future.get()`, using a virtual-thread executor in try-with-resources and `resultNow()`.",
      "`try (var exec = Executors.newVirtualThreadPerTaskExecutor()) { var a = exec.submit(this::callA); var b = exec.submit(this::callB); var c = exec.submit(this::callC); exec.close(); return List.of(a.resultNow(), b.resultNow(), c.resultNow()); }`. `close()` waits for all three, so `resultNow()` is safe (it throws if one failed).",
    ],
  }),
];
