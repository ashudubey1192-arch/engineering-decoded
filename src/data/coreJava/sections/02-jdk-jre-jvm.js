import { lesson, section } from "../schema.js";

export default section("jdk-jre-jvm", "JDK, JRE and JVM", [
  lesson("JDK vs JRE vs JVM", {
    intro:
      "Three acronyms describe the Java toolchain: the JVM runs bytecode, the JRE is what you need to run programs, and the JDK is what you need to build them. Interviewers ask about them constantly because they explain how Java achieves portability. This lesson defines each one, shows how they nest inside each other and lists their differences.",
    topics: [
      [
        "What is the JVM?",
        "The Java Virtual Machine is an abstract computer, specified by the JVM Specification, that loads `.class` files, verifies their bytecode, manages memory with a garbage collector and executes the code through an interpreter and a JIT compiler. HotSpot (from OpenJDK) is the most widely used implementation; others include OpenJ9 and GraalVM. The JVM is platform dependent: there is a different native JVM for each operating system and CPU.",
      ],
      [
        "What is the JRE?",
        "The Java Runtime Environment is the JVM plus the Java class library (`java.lang`, `java.util` and the rest) and supporting files needed to run Java programs. It has no compiler. Since Java 11, vendors mostly ship only JDKs; a minimal runtime can instead be built for an application with `jlink`.",
      ],
      [
        "What is the JDK?",
        "The Java Development Kit is a JRE plus development tools: `javac` (compiler), `java` (launcher), `jar`, `javadoc`, `jdb` (debugger), `jshell`, `jlink`, `jpackage`, and diagnostic tools such as `jps`, `jstack`, `jmap`, `jstat` and `jcmd`. Developers install the JDK; a production server that only runs a JAR technically needs just a runtime.",
      ],
      [
        "Differences between JDK, JRE and JVM",
        "Scope: JDK contains JRE, and JRE contains JVM (JDK = JRE + tools, JRE = JVM + libraries). Purpose: JDK develops, JRE runs, JVM executes bytecode. Contents: only the JDK has `javac`. Who needs it: developers need the JDK, end users needed the JRE, and both rely on the JVM. Portability: all three are platform specific downloads, while the bytecode they produce or run is platform independent.",
      ],
    ],
    code: String.raw`import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) {
        Path home = Path.of(System.getProperty("java.home"));
        Path bin = home.resolve("bin");
        boolean windows = System.getProperty("os.name").toLowerCase().contains("win");
        String ext = windows ? ".exe" : "";

        // JVM: who is executing this bytecode right now?
        RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
        System.out.println("JVM vendor known: " + !runtime.getVmVendor().isEmpty());
        System.out.println("JVM spec name: " + System.getProperty("java.vm.specification.name"));

        // JRE part: the class library is always present.
        System.out.println("java.lang.String loaded by bootstrap loader: "
                + (String.class.getClassLoader() == null));

        // JDK part: development tools live next to the launcher.
        for (String tool : new String[] {"java", "javac", "jar", "javadoc", "jshell", "jstack"}) {
            boolean present = Files.exists(bin.resolve(tool + ext));
            System.out.printf("%-8s %s%n", tool, present ? "present" : "missing");
        }
        boolean isJdk = Files.exists(bin.resolve("javac" + ext));
        System.out.println(isJdk ? "This installation is a JDK (JRE + tools)"
                                 : "This installation is only a runtime");
    }
}`,
    walk:
      "`ManagementFactory.getRuntimeMXBean()` describes the running JVM, and the `java.vm.specification.name` property shows it implements the Java Virtual Machine Specification. `String.class.getClassLoader()` returns `null` because core library classes are loaded by the JVM's built-in bootstrap loader: that is the JRE's class library.\n\nThe loop checks the installation's `bin` folder for development tools. Finding `javac`, `jar` and `jshell` proves this is a JDK, which contains everything a JRE has plus the tools.",
    anim: [
      "JDK contains JRE contains JVM",
      [
        ["jdk", "JDK", "develop"],
        ["tools", "javac, jar ...", "dev tools"],
        ["jre", "JRE", "run"],
        ["lib", "Class library", "java.lang, util"],
        ["jvm", "JVM", "execute bytecode"],
      ],
      [
        ["jdk", "tools", "adds", "The JDK adds development tools like javac, jar, javadoc and jshell."],
        ["jdk", "jre", "contains", "Inside every JDK is a full runtime environment."],
        ["jre", "lib", "adds", "The JRE adds the standard class library your program calls."],
        ["jre", "jvm", "contains", "At the centre is the JVM, which loads and executes the bytecode."],
      ],
    ],
    mistakes: [
      "Saying the JVM is platform independent. Bytecode is; each JVM is a native program for one platform.",
      "Installing only a runtime on a build server and wondering why `javac` is missing.",
    ],
    qa: [
      ["What is the difference between JDK, JRE and JVM?", "JVM executes bytecode; JRE = JVM + class libraries to run programs; JDK = JRE + tools such as javac to develop programs."],
      ["Can you run a Java program with just a JVM?", "Not in practice: the program needs the class library (at least `java.base`), which the JRE or a jlink image provides."],
      ["Is the JVM a compiler or an interpreter?", "Both: it interprets bytecode and JIT-compiles hot methods into native code."],
    ],
    ex: [
      "Use `jlink --add-modules java.base --output tiny-runtime` and look at `tiny-runtime/bin`. Which tools are there, and is it a JDK or a JRE?",
      "It contains `java` and `keytool` but no `javac`, so it is a runtime image (a custom JRE). Running the program above with `tiny-runtime/bin/java` would print \"This installation is only a runtime\", though the program also needs `java.management`, so add that module.",
    ],
  }),

  lesson("JVM Architecture in Detail", {
    intro:
      "Inside the JVM there are three subsystems: the class loader subsystem that brings classes in, the runtime data areas that hold code and objects, and the execution engine that runs bytecode. Knowing this architecture explains stack overflows, out-of-memory errors, static initialization order and performance tuning. This lesson walks through each part.",
    topics: [
      [
        "Class loader subsystem",
        "Loading: classes are found and read by a hierarchy of loaders. The bootstrap loader (native) loads `java.base`, the platform loader loads other JDK modules, and the application (system) loader loads classes from the classpath. Loaders delegate to their parent first (parent delegation), which stops your code from replacing `java.lang.String`.\n\nLinking: verification checks the bytecode is safe, preparation allocates static fields with default values, and resolution turns symbolic references into direct ones. Initialization: static initializers and static field assignments run, exactly once, the first time the class is actively used.",
      ],
      [
        "Runtime data areas",
        "Method area (Metaspace in HotSpot since Java 8): class metadata, method bytecode, the runtime constant pool. Heap: all objects and arrays, shared by every thread and managed by the garbage collector. Java stacks: one per thread, holding a frame per method call with local variables and an operand stack; too-deep recursion throws `StackOverflowError`. PC register: one per thread, the address of the current bytecode instruction. Native method stacks: used by native (C/C++) code called through JNI.",
      ],
      [
        "Execution engine",
        "The interpreter executes bytecode one instruction at a time, which starts fast. The JIT compiler watches for hot methods and compiles them to native machine code (C1 for quick compilation, C2 for heavy optimisation). The garbage collector reclaims heap objects that are no longer reachable.",
      ],
      [
        "Native interface and libraries",
        "The Java Native Interface (JNI) lets the execution engine call native libraries (`.dll`, `.so`), which is how parts of the class library talk to the operating system for files, sockets and threads.",
      ],
    ],
    code: String.raw`public class Main {
    static int depth = 0;

    static class Config {
        static { System.out.println("  [Config] static initializer runs once, on first use"); }
        static final String NAME = computeName();
        static String computeName() { return "app-config"; }
    }

    static void recurse() {
        depth++;
        recurse(); // each call pushes a new frame on this thread's stack
    }

    public static void main(String[] args) {
        System.out.println("1) Class loaders");
        System.out.println("  String loader: " + String.class.getClassLoader() + " (bootstrap)");
        System.out.println("  Main loader:   " + Main.class.getClassLoader().getName());
        System.out.println("  its parent:    " + Main.class.getClassLoader().getParent().getName());

        System.out.println("2) Initialization happens lazily");
        System.out.println("  before touching Config");
        System.out.println("  Config.NAME = " + Config.NAME);
        System.out.println("  Config.NAME again = " + Config.NAME);

        System.out.println("3) Heap holds objects; stack holds frames");
        int[] onHeap = new int[1_000];
        System.out.println("  array of " + onHeap.length + " ints allocated on the heap");
        try {
            recurse();
        } catch (StackOverflowError e) {
            System.out.println("  StackOverflowError after many frames: " + (depth > 1000));
        }

        System.out.println("4) Threads get their own stack and PC register");
        Thread worker = new Thread(() -> System.out.println("  hello from " + Thread.currentThread().getName()), "worker-1");
        worker.start();
        try { worker.join(); } catch (InterruptedException ignored) { }
    }
}`,
    walk:
      "Part 1 prints the class loader hierarchy: `String` is loaded by the bootstrap loader (shown as `null`), `Main` by the `app` loader, whose parent is the `platform` loader.\n\nPart 2 shows lazy initialization: the static block of `Config` runs only when `Config.NAME` is first used, and never again. Part 3 allocates an array on the heap, then recurses until the thread's stack is full and catches `StackOverflowError`. Part 4 starts a second thread, which gets its own stack and PC register.",
    anim: [
      "Inside the JVM",
      [
        ["cls", "Main.class", "bytecode file"],
        ["loader", "Class loaders", "load, link, init"],
        ["meta", "Method area", "class metadata"],
        ["heap", "Heap", "objects"],
        ["stack", "Thread stacks", "frames"],
        ["engine", "Execution engine", "interpret + JIT"],
      ],
      [
        ["cls", "loader", "load", "The application class loader reads Main.class after delegating to its parents."],
        ["loader", "meta", "define", "After verification, the class's metadata and bytecode go into the method area."],
        ["engine", "stack", "frame", "Calling main pushes a frame with local variables on the main thread's stack."],
        ["stack", "heap", "new", "new int[1000] allocates the array on the shared heap; the frame keeps a reference."],
        ["meta", "engine", "execute", "The engine interprets bytecode and JIT-compiles hot methods to native code."],
      ],
    ],
    mistakes: [
      "Thinking static fields live on the stack. Class metadata lives in Metaspace; since Java 8 static field values themselves are stored with the `Class` object on the heap.",
      "Catching `StackOverflowError` to \"fix\" recursion. Fix the recursion depth or use iteration; the error means the design is wrong.",
    ],
    qa: [
      ["What are the main components of the JVM?", "The class loader subsystem, the runtime data areas (method area, heap, stacks, PC registers, native stacks) and the execution engine (interpreter, JIT compiler, garbage collector), plus JNI."],
      ["What is parent delegation?", "A class loader first asks its parent to load a class and only loads it itself if the parent cannot. This keeps core classes from being replaced."],
      ["Which runtime areas are shared between threads?", "The heap and the method area are shared; each thread has its own stack, PC register and native method stack."],
    ],
    ex: [
      "Run the program with `-Xss256k` and then with `-Xss4m`. What changes in part 3, and why?",
      "The `StackOverflowError` still happens, but after far fewer frames with 256 KB and far more with 4 MB, because `-Xss` sets each thread's stack size and therefore how many frames fit.",
    ],
  }),

  lesson("What is OpenJDK?", {
    intro:
      "OpenJDK is the open-source reference implementation of Java SE, and almost every JDK you can download today is built from it. Understanding the relationship between OpenJDK, Oracle JDK and vendor builds helps you pick a JDK and understand licensing. This lesson explains OpenJDK, its history, its distributions and how releases work.",
    topics: [
      [
        "OpenJDK definition and history",
        "In 2006 Sun announced it would open-source Java, and in 2007 released the HotSpot JVM, `javac` and the class library under the GPL v2 with the Classpath Exception (which lets you ship your own applications under any license). That project is OpenJDK. Since Java 11, Oracle JDK and OpenJDK are built from essentially the same code; differences are in licensing and support.",
      ],
      [
        "OpenJDK distributions",
        "Vendors build, test and patch OpenJDK and ship it under their names: Oracle OpenJDK builds (jdk.java.net), Oracle JDK (commercial terms for some uses), Eclipse Temurin (Adoptium), Amazon Corretto, Microsoft Build of OpenJDK, Azul Zulu, Red Hat build of OpenJDK, BellSoft Liberica and SAP Machine. All pass the Java SE compatibility test kit (TCK), so your code runs the same on them.",
      ],
      [
        "How OpenJDK evolves",
        "Changes are proposed as JEPs (JDK Enhancement Proposals), developed in projects such as Loom (virtual threads), Valhalla (value types), Panama (native interop) and Amber (language features), and released every six months. Preview features let developers try language changes before they become final.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        Runtime.Version version = Runtime.version();
        System.out.println("Feature release: " + version.feature());
        System.out.println("Is an LTS-numbered release: " + isLtsNumber(version.feature()));
        System.out.println("Implements Java SE spec: " + System.getProperty("java.specification.version"));
        System.out.println("VM name: " + System.getProperty("java.vm.name"));

        String[] distributions = {"Eclipse Temurin", "Amazon Corretto", "Microsoft OpenJDK",
                "Azul Zulu", "Oracle OpenJDK", "Red Hat OpenJDK", "BellSoft Liberica"};
        System.out.println("Popular OpenJDK builds:");
        for (String d : distributions) System.out.println("  - " + d);
    }

    // LTS releases since Java 17 follow a two-year cadence: 17, 21, 25, 29...
    static boolean isLtsNumber(int feature) {
        return feature == 8 || feature == 11 || (feature >= 17 && (feature - 17) % 4 == 0);
    }
}`,
    varies: true,
    walk:
      "`Runtime.version()` returns the running JDK's version; `feature()` is the major number. The helper `isLtsNumber` encodes the LTS cadence: 8 and 11, then every fourth release from 17 (two years at six-month releases).\n\nSystem properties show which Java SE specification version is implemented and the VM's name (for OpenJDK builds usually \"OpenJDK 64-Bit Server VM\"). The output depends on the JDK you run it with.",
    anim: [
      "One codebase, many JDKs",
      [
        ["jep", "JEPs", "proposals"],
        ["ojdk", "OpenJDK", "source code"],
        ["tck", "TCK", "compatibility"],
        ["vendors", "Vendor builds", "Temurin, Corretto"],
        ["app", "Your app", "runs the same"],
      ],
      [
        ["jep", "ojdk", "merge", "Features are proposed as JEPs and merged into the OpenJDK repository."],
        ["ojdk", "vendors", "build", "Vendors build binaries from the same source and add their own patches and support."],
        ["vendors", "tck", "certify", "Each build passes the Java SE TCK to prove it is compatible."],
        ["tck", "app", "trust", "Because every certified JDK behaves the same, your app runs on any of them."],
      ],
    ],
    mistakes: [
      "Assuming OpenJDK is a lower-quality copy of Oracle JDK. Since Java 11 they share the same source; choose based on support and license.",
      "Running a non-LTS release in production without planning to upgrade every six months.",
    ],
    qa: [
      ["What is OpenJDK?", "The open-source reference implementation of Java SE (JVM, compiler, libraries) licensed under GPL v2 with the Classpath Exception."],
      ["Is Oracle JDK different from OpenJDK?", "Technically they are nearly identical since Java 11; the differences are licensing, branding and commercial support."],
      ["What is a JEP?", "A JDK Enhancement Proposal, the document that describes and tracks a feature added to OpenJDK."],
    ],
    ex: [
      "Using `isLtsNumber`, list the LTS feature numbers between 8 and 33.",
      "8, 11, 17, 21, 25, 29 and 33. Loop from 8 to 33 and print each number for which `isLtsNumber` returns true.",
    ],
  }),

  lesson("JIT Compiler Internals", {
    intro:
      "Java starts by interpreting bytecode, yet long-running Java services are as fast as native code. The reason is the Just-In-Time (JIT) compiler, which compiles frequently executed code to optimised machine code while the program runs. This lesson explains what the JIT is, how HotSpot decides what to compile, tiered compilation and the main optimisations.",
    topics: [
      [
        "What is the JIT compiler?",
        "`javac` produces bytecode ahead of time; the JIT compiler runs inside the JVM and translates bytecode into native instructions at runtime. Compiled code is cached in the code cache, so later calls skip the interpreter entirely.",
      ],
      [
        "Hot spots and profiling",
        "The JVM counts method invocations and loop back-edges. When a counter passes a threshold the method is \"hot\" and queued for compilation on background compiler threads. Because the JIT sees real runtime behaviour (which branches are taken, which classes actually appear), it can optimise better than a static compiler in some cases.",
      ],
      [
        "Tiered compilation: C1 and C2",
        "HotSpot has two JIT compilers. C1 (client) compiles quickly with light optimisation and inserts profiling. C2 (server) compiles slowly but optimises aggressively using that profile. Tiered compilation (default since Java 8) moves code from the interpreter (tier 0) to C1 (tiers 1 to 3) and finally to C2 (tier 4). GraalVM provides an alternative JIT written in Java.",
      ],
      [
        "Key optimisations and deoptimisation",
        "Inlining small methods into callers, escape analysis (allocating non-escaping objects on the stack or removing them), loop unrolling, dead-code elimination, and devirtualisation of interface calls with only one implementation. If an assumption breaks, for example a new subclass gets loaded, the JVM deoptimises that code back to the interpreter and may recompile it later.",
      ],
      [
        "Observing and controlling the JIT",
        "`-XX:+PrintCompilation` prints methods as they are compiled. `-Xint` forces interpretation only (slow), `-Xcomp` compiles everything up front, and `-XX:TieredStopAtLevel=1` uses only C1. Benchmarks must include a warm-up phase so the JIT has compiled the code before you measure; tools such as JMH handle this correctly.",
      ],
    ],
    code: String.raw`public class Main {
    static long sumOfSquares(int n) {
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) i * i;
        return total;
    }

    public static void main(String[] args) {
        long expected = sumOfSquares(2_000_000);
        long firstRun = 0, warmRun = 0;
        for (int round = 1; round <= 30; round++) {
            long start = System.nanoTime();
            long result = sumOfSquares(2_000_000);
            long elapsed = System.nanoTime() - start;
            if (result != expected) throw new AssertionError();
            if (round == 1) firstRun = elapsed;
            if (round == 30) warmRun = elapsed;
        }
        System.out.println("Result is stable: " + expected);
        System.out.println("JIT made the warm run faster: " + (warmRun < firstRun));
        System.out.println("JIT compiler in use: " + (System.getProperty("java.vm.name").contains("Server")
                ? "tiered C1 + C2 (server VM)" : "other"));
    }
}`,
    varies: true,
    walk:
      "`sumOfSquares` is a tight loop, exactly what the JIT optimises. The program calls it 30 times and times the first and the last call with `System.nanoTime()`.\n\nEarly calls run in the interpreter or in quickly compiled C1 code; by round 30 the method has been compiled by C2, so the last run is much faster even though it does the same work. Run with `-Xint` and the speed-up disappears; with `-XX:+PrintCompilation` you can watch `sumOfSquares` being compiled.",
    anim: [
      "Tiered compilation",
      [
        ["bc", "Bytecode", "from javac"],
        ["interp", "Interpreter", "tier 0"],
        ["c1", "C1", "tiers 1-3, profile"],
        ["c2", "C2", "tier 4, optimised"],
        ["cache", "Code cache", "native code"],
      ],
      [
        ["bc", "interp", "start", "Every method starts in the interpreter, so startup is quick."],
        ["interp", "c1", "hot", "Counters pass a threshold; C1 compiles fast and adds profiling."],
        ["c1", "c2", "very hot", "Profiles show real branch and type use; C2 recompiles aggressively."],
        ["c2", "cache", "install", "Optimised native code is stored in the code cache and used for later calls."],
        ["cache", "interp", "deopt", "If an optimisation assumption breaks, the JVM deoptimises back to the interpreter."],
      ],
    ],
    mistakes: [
      "Benchmarking with one `System.currentTimeMillis()` measurement and no warm-up; you measure the interpreter, not your algorithm. Use JMH.",
      "Thinking JIT compilation happens on your thread. Compilation runs on background compiler threads while the interpreter keeps going.",
    ],
    qa: [
      ["What is the JIT compiler?", "A compiler inside the JVM that converts hot bytecode into optimised native machine code at runtime."],
      ["What are C1 and C2?", "HotSpot's two JIT compilers: C1 compiles quickly with basic optimisations and profiling; C2 compiles hot code with aggressive optimisations."],
      ["What is deoptimisation?", "Discarding compiled code whose assumptions became invalid (for example a newly loaded subclass) and falling back to the interpreter."],
    ],
    ex: [
      "Run the program with `-Xint`. What do you expect for \"JIT made the warm run faster\" and how much slower is the whole program?",
      "With `-Xint` there is no JIT, so the first and last runs take about the same time and the line can print `false`; the program runs many times slower because every instruction is interpreted.",
    ],
  }),

  lesson("JNI: Java Native Interface", {
    intro:
      "Sometimes Java must call code written in C or C++: an operating-system API, a hardware driver or a fast existing library. The Java Native Interface (JNI) is the bridge. This lesson explains what JNI is, how a `native` method is declared and linked, when to use it, its risks, and the modern alternative (the Foreign Function and Memory API).",
    topics: [
      [
        "What JNI is",
        "JNI is a standard programming interface that lets Java code call native functions in shared libraries (`.dll` on Windows, `.so` on Linux, `.dylib` on macOS) and lets native code create Java objects, call methods and throw exceptions. The JDK itself uses it for files, sockets, threads and graphics.",
      ],
      [
        "Declaring and loading a native method",
        "Mark a method `native` with no body, generate a C header with `javac -h`, implement the function in C with the generated name (for example `Java_Main_add`), compile it into a shared library and load it with `System.loadLibrary(\"mathlib\")` (looks in `java.library.path`) or `System.load(absolutePath)`. If the library or symbol is missing, the call throws `UnsatisfiedLinkError`.",
        String.raw`public class Main {
    static { System.loadLibrary("mathlib"); }  // mathlib.dll / libmathlib.so
    static native int add(int a, int b);         // implemented in C
}`,
      ],
      [
        "When to use JNI and its costs",
        "Use it for platform features Java does not expose, existing native libraries, or device access. Costs: you lose portability (one library per platform), a crash in C code kills the whole JVM, the garbage collector cannot manage native memory, and each call across the boundary has overhead.",
      ],
      [
        "Modern alternative: the Foreign Function and Memory API",
        "Since Java 22, `java.lang.foreign` (Project Panama) lets you call native functions and manage off-heap memory from pure Java, without writing C glue code. Prefer it for new code; JNI remains for existing libraries.",
      ],
    ],
    code: String.raw`public class Main {
    // Declared native: the body would live in a C library called "mathlib".
    static native int add(int a, int b);

    public static void main(String[] args) {
        System.out.println("java.library.path is set: " + (System.getProperty("java.library.path") != null));
        String mapped = System.mapLibraryName("mathlib");
        System.out.println("Platform file name for mathlib: " + (mapped.endsWith(".dll") || mapped.endsWith(".so") || mapped.endsWith(".dylib")));

        try {
            System.loadLibrary("mathlib");
        } catch (UnsatisfiedLinkError e) {
            System.out.println("loadLibrary failed: no mathlib in java.library.path");
        }

        try {
            System.out.println(add(2, 3));
        } catch (UnsatisfiedLinkError e) {
            System.out.println("Calling add without the library: UnsatisfiedLinkError");
        }

        // The JDK itself relies on native code, for example to read the clock.
        System.out.println("Native-backed call works: " + (System.currentTimeMillis() > 0));
    }
}`,
    walk:
      "`add` is declared `native` and has no Java body. `System.mapLibraryName` shows how the JVM turns the logical name `mathlib` into a platform file name (`mathlib.dll`, `libmathlib.so` or `libmathlib.dylib`).\n\nBecause no such library exists here, `System.loadLibrary` throws `UnsatisfiedLinkError`, and so does calling `add`, since the JVM cannot find `Java_Main_add`. The last line calls `System.currentTimeMillis()`, which is itself implemented natively inside the JDK.",
    anim: [
      "A native call through JNI",
      [
        ["java", "Java code", "add(2, 3)"],
        ["jvm", "JVM", "native lookup"],
        ["lib", "mathlib.dll", "loaded library"],
        ["c", "C function", "Java_Main_add"],
        ["err", "UnsatisfiedLink", "if missing"],
      ],
      [
        ["java", "jvm", "call", "Java calls a method marked native; the JVM must find its implementation."],
        ["jvm", "lib", "search", "It searches libraries loaded with System.loadLibrary for the JNI symbol."],
        ["lib", "c", "invoke", "The C function Java_Main_add runs and returns the sum to Java."],
        ["jvm", "err", "missing", "If no loaded library defines the symbol, the JVM throws UnsatisfiedLinkError."],
      ],
    ],
    mistakes: [
      "Forgetting that native crashes are not exceptions: a segmentation fault in C terminates the whole JVM.",
      "Allocating native memory in C and never freeing it; the garbage collector cannot see it.",
    ],
    qa: [
      ["What is JNI?", "The Java Native Interface, a standard API that lets Java call native code in shared libraries and lets native code use Java objects."],
      ["Which error appears when a native library cannot be found?", "`java.lang.UnsatisfiedLinkError`."],
      ["What is the modern replacement for writing JNI code?", "The Foreign Function and Memory API in `java.lang.foreign`, final since Java 22."],
    ],
    ex: [
      "Print `System.mapLibraryName(\"mathlib\")` on your machine. What name do you get on Windows, Linux and macOS?",
      "`mathlib.dll` on Windows, `libmathlib.so` on Linux and `libmathlib.dylib` on macOS.",
    ],
  }),
]);
