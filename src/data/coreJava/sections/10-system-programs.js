import { lesson, section } from "../schema.js";

export default section("system-programs", "Java System and JVM Programs", [
  lesson("Finding OS, Java Version, Bitness and Eclipse Version", {
    intro:
      "Programs often need to know where they are running: which operating system and version, whether the JVM is 32-bit or 64-bit, and which Java version is installed. Developers also need to check their JDK and IDE versions from the command line. This lesson covers the system properties and commands for all of these, including the Windows version, the OS name, the JDK version and the Eclipse version.",
    topics: [
      [
        "Finding the operating system name and Windows version",
        "`System.getProperty(\"os.name\")` returns names such as \"Windows 11\", \"Linux\" or \"Mac OS X\"; `os.version` gives the kernel or release version (for example \"10.0\" on Windows 10 and 11) and `os.arch` the CPU architecture. From CMD, `ver` prints the Windows version and `systeminfo` shows full details; `winver` opens a dialog.",
      ],
      [
        "Finding whether Java is 32-bit or 64-bit",
        "`System.getProperty(\"os.arch\")` returns `amd64`/`x86_64`/`aarch64` for 64-bit JVMs and `x86`/`i386` for 32-bit ones. On HotSpot, `sun.arch.data.model` returns \"64\" or \"32\". From the command line, `java -version` prints \"64-Bit Server VM\" for a 64-bit JVM.",
      ],
      [
        "Finding the JDK and Java version",
        "From a program: `Runtime.version()` (a structured `Runtime.Version` with `feature()`, `interim()`, `update()`), or the properties `java.version`, `java.vendor`, `java.vm.name` and `java.home`. From the command line: `java -version`, `javac -version` and `java -XshowSettings:properties -version` for every property.",
      ],
      [
        "Finding the Eclipse version",
        "In Eclipse: Help, About Eclipse IDE (the release name such as 2024-06 and the build id). On disk: the `.eclipseproduct` file in the installation folder contains `version=`, and `eclipse.ini` shows which JVM Eclipse uses. Eclipse's own Java version appears under Help, About, Installation Details, Configuration.",
      ],
    ],
    code: String.raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        String os = System.getProperty("os.name");
        String arch = System.getProperty("os.arch");
        System.out.println("os.name present: " + !os.isEmpty());
        System.out.println("is Windows: " + os.startsWith("Windows") + ", is Linux: " + os.equals("Linux")
                + ", is Mac: " + os.startsWith("Mac"));
        System.out.println("os.version present: " + !System.getProperty("os.version").isEmpty());

        boolean is64 = List.of("amd64", "x86_64", "aarch64", "ppc64le", "s390x").contains(arch);
        String dataModel = System.getProperty("sun.arch.data.model", "unknown");
        System.out.println("64-bit JVM: " + is64 + " (sun.arch.data.model = " + dataModel + ")");

        Runtime.Version v = Runtime.version();
        System.out.println("Java feature version >= 21: " + (v.feature() >= 21));
        System.out.println("java.version starts with feature: " + System.getProperty("java.version").startsWith(String.valueOf(v.feature())));
        System.out.println("java.vm.name mentions 64-Bit: " + System.getProperty("java.vm.name").contains("64-Bit"));

        String[] commands = {"ver (Windows version)", "java -version", "javac -version",
                "java -XshowSettings:properties -version", "type .eclipseproduct (Eclipse version)"};
        System.out.println("Useful commands:");
        for (String c : commands) System.out.println("  " + c);
    }
}`,
    varies: true,
    walk:
      "The program reads `os.name`, `os.version` and `os.arch` and classifies the platform. It decides bitness from the architecture name and, on HotSpot, from `sun.arch.data.model`.\n\n`Runtime.version()` returns a structured version whose `feature()` is the major release, matching the start of `java.version`. The output is written as true/false checks so it is meaningful on any machine, followed by the command-line equivalents for the Windows version, Java and Eclipse.",
    anim: [
      "Where environment facts come from",
      [
        ["prog", "Your program", "getProperty"],
        ["jvm", "JVM startup", "sets properties"],
        ["os", "os.name/arch", "from the OS"],
        ["ver", "java.version", "from the JDK"],
        ["cli", "java -version", "same info"],
      ],
      [
        ["jvm", "os", "query", "At startup the JVM asks the operating system for its name, version and CPU."],
        ["jvm", "ver", "record", "It records its own version, vendor and installation folder as properties."],
        ["prog", "os", "read", "Your program reads them with System.getProperty."],
        ["cli", "ver", "print", "java -version prints the same version and bitness from the command line."],
      ],
    ],
    mistakes: [
      "Parsing `java.version` by hand (it was \"1.8.0_x\" in Java 8 and \"21.0.2\" later); use `Runtime.version()`.",
      "Assuming a 64-bit OS means a 64-bit JVM; check the JVM's own architecture.",
    ],
    qa: [
      ["How do you find the OS name in Java?", "`System.getProperty(\"os.name\")`."],
      ["How do you check if the JVM is 64-bit?", "Check `os.arch` (amd64, x86_64, aarch64) or `sun.arch.data.model` on HotSpot, or look for \"64-Bit\" in `java -version`."],
      ["How do you get the Java version at runtime?", "`Runtime.version().feature()` or the `java.version` system property."],
    ],
    ex: [
      "Write a method `isAtLeast(int feature)` that returns true if the running Java is at least that version.",
      "`static boolean isAtLeast(int f) { return Runtime.version().feature() >= f; }`. On Java 21 or newer, `isAtLeast(17)` returns true.",
    ],
  }),

  lesson("Classpath and Where Classes Are Loaded From", {
    intro:
      "The classpath tells the JVM where to find classes and JARs. When something is \"not found\" or the wrong version of a library is used, the questions are: what is my classpath, and where was this class actually loaded from? This lesson covers the CLASSPATH environment variable, `-cp`, reading the classpath at runtime, and finding the JAR or folder a class (including the main class) came from.",
    topics: [
      [
        "What the classpath is",
        "A list of folders and JAR files, separated by `;` on Windows and `:` on Linux and macOS, that the application class loader searches for classes and resources. `.` means the current folder; `lib/*` includes every JAR in a folder.",
      ],
      [
        "CLASSPATH environment variable vs -cp",
        "If the `CLASSPATH` environment variable is set, the JVM uses it when no `-cp`/`-classpath` option is given. `-cp` overrides it completely. Setting a global CLASSPATH is discouraged because it affects every Java program; pass `-cp` explicitly or let Maven or Gradle manage it. If neither is set, the classpath defaults to `.`.",
      ],
      [
        "Finding the classpath at runtime",
        "`System.getProperty(\"java.class.path\")` returns the effective classpath as one string; split it with `File.pathSeparator`. Under a build tool or an IDE it shows the folders and JARs the tool assembled.",
      ],
      [
        "Finding where a class or JAR was loaded from",
        "`SomeClass.class.getProtectionDomain().getCodeSource().getLocation()` returns the URL of the folder or JAR that supplied the class (null for JDK classes from the bootstrap loader). Alternatively `getResource(\"/com/x/Some.class\")` returns the resource URL, which shows `jar:file:...!/` for JARs and `jrt:/java.base/...` for JDK classes. To find where the main class came from, apply this to the main class. `java -verbose:class` logs every class with its source.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.net.URL;
import java.security.CodeSource;

public class Main {
    static String origin(Class<?> c) {
        CodeSource source = c.getProtectionDomain().getCodeSource();
        return source == null ? "bootstrap (JDK runtime image)" : source.getLocation().getProtocol() + " location";
    }

    public static void main(String[] args) {
        String classpath = System.getProperty("java.class.path");
        String[] entries = classpath.split(File.pathSeparator);
        System.out.println("classpath entries: " + entries.length + " (separator '" + File.pathSeparator + "')");
        System.out.println("CLASSPATH env variable set: " + (System.getenv("CLASSPATH") != null));

        System.out.println("Main loaded from: " + origin(Main.class));
        System.out.println("String loaded from: " + origin(String.class));

        URL mainResource = Main.class.getResource("Main.class");
        URL stringResource = String.class.getResource("String.class");
        System.out.println("Main.class resource protocol: " + mainResource.getProtocol());
        System.out.println("String.class resource: " + stringResource);

        System.out.println("Main's class loader: " + Main.class.getClassLoader().getName());
        System.out.println("module of String: " + String.class.getModule().getName());
        System.out.println("tip: run java -verbose:class -cp . Main to see every class and its source");
    }
}`,
    walk:
      "`java.class.path` holds the effective classpath; the build script runs the program with `-cp .`, so there is one entry. The program reports whether a `CLASSPATH` variable exists, which would be ignored anyway because `-cp` was given.\n\n`origin` uses the class's `CodeSource`: `Main` comes from a `file:` location (the folder holding `Main.class`), while `String` has no code source because the bootstrap loader takes it from the JDK's runtime image. `getResource` confirms it: `Main.class` is a `file:` URL and `String.class` is a `jrt:/java.base/...` URL.",
    anim: [
      "How the app class loader searches",
      [
        ["req", "load Main", "request"],
        ["boot", "Bootstrap", "java.base"],
        ["plat", "Platform", "JDK modules"],
        ["app", "App loader", "classpath"],
        ["src", "./Main.class", "file: URL"],
      ],
      [
        ["req", "app", "ask", "The application class loader receives the request for Main."],
        ["app", "boot", "delegate", "It first delegates upward; the bootstrap loader has no Main."],
        ["app", "plat", "delegate", "The platform loader does not have it either."],
        ["app", "src", "search", "So the app loader searches each classpath entry and finds ./Main.class."],
      ],
    ],
    mistakes: [
      "Setting a global CLASSPATH that leaves out `.` or points to old JARs.",
      "Using `-cp lib/*.jar`; the wildcard form is `lib/*` (and must be quoted in some shells).",
    ],
    qa: [
      ["What is the difference between PATH and CLASSPATH?", "PATH tells the shell where to find executables like `java`; CLASSPATH tells the JVM where to find classes and JARs."],
      ["How do you print the classpath of a running program?", "`System.getProperty(\"java.class.path\")`."],
      ["How do you find which JAR a class was loaded from?", "`Foo.class.getProtectionDomain().getCodeSource().getLocation()`, or run with `-verbose:class`."],
    ],
    ex: [
      "Two JARs on the classpath both contain `com.acme.Util`. Which one is used, and how can you confirm it?",
      "The first JAR in classpath order wins, because the class loader stops at the first match. Confirm with `Util.class.getProtectionDomain().getCodeSource().getLocation()` or `java -verbose:class`.",
    ],
  }),

  lesson("JVM Runtime Programs: Processors, Memory and Terminating the JVM", {
    intro:
      "The `Runtime` class is the program's window into its JVM. It reports the number of available processors and three memory figures (total, free and maximum), and it can terminate the JVM. This lesson explains each value, how they relate to `-Xms` and `-Xmx`, how to compute used memory, and the difference between `System.exit`, `Runtime.halt` and shutdown hooks.",
    topics: [
      [
        "Number of available processors",
        "`Runtime.getRuntime().availableProcessors()` returns the number of CPUs the JVM may use (it respects container CPU limits since Java 10). It is the usual basis for thread pool sizes, such as `availableProcessors()` threads for CPU-bound work.",
      ],
      [
        "Total memory in the JVM",
        "`totalMemory()` is the heap currently reserved from the operating system. It starts at the initial heap size (`-Xms`) and grows towards the maximum as needed.",
      ],
      [
        "Free memory in the JVM",
        "`freeMemory()` is the unused part of the current total heap. Used heap is `totalMemory() - freeMemory()`. Free memory changes constantly as objects are allocated and collected.",
      ],
      [
        "Maximum memory the JVM can use",
        "`maxMemory()` is the largest heap the JVM will attempt to use, set by `-Xmx` (by default about a quarter of physical memory). If live data exceeds it, the JVM throws `OutOfMemoryError: Java heap space`.",
      ],
      [
        "Terminating the JVM",
        "`System.exit(status)` (same as `Runtime.getRuntime().exit`) starts an orderly shutdown: it runs shutdown hooks and then stops the JVM; 0 means success, non-zero means failure. It never returns, so `finally` blocks after it do not run. `Runtime.getRuntime().halt(status)` stops immediately without running hooks. The JVM also exits normally when the last non-daemon thread ends.",
      ],
    ],
    code: String.raw`public class Main {
    static final long MB = 1024 * 1024;

    static void printMemory(String label) {
        Runtime rt = Runtime.getRuntime();
        long total = rt.totalMemory(), free = rt.freeMemory(), max = rt.maxMemory();
        System.out.printf("%-18s used %4d MB | free %4d MB | total %4d MB | max %4d MB%n",
                label, (total - free) / MB, free / MB, total / MB, max / MB);
    }

    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println("available processors: " + rt.availableProcessors());

        printMemory("at start");
        byte[][] blocks = new byte[40][];
        for (int i = 0; i < blocks.length; i++) blocks[i] = new byte[1024 * 1024];   // about 40 MB
        printMemory("after 40 MB alloc");
        blocks = null;
        System.gc();                                    // a request, not a guarantee
        printMemory("after release + gc");

        System.out.println("max is set by -Xmx (this run: -Xmx256m): " + (rt.maxMemory() / MB <= 256));

        rt.addShutdownHook(new Thread(() -> System.out.println("shutdown hook: closing resources")));
        try {
            System.out.println("calling System.exit(0)");
            System.exit(0);
        } finally {
            System.out.println("this finally block never runs");
        }
    }
}`,
    jvm: ["-Xms32m", "-Xmx256m"],
    varies: true,
    walk:
      "The program prints the processor count and three memory snapshots. It starts with an initial heap of 32 MB (`-Xms32m`); allocating forty 1 MB arrays raises used memory and makes the total heap grow, but never beyond the 256 MB maximum (`-Xmx256m`). Dropping the reference and calling `System.gc()` usually lowers used memory, although the exact figures differ on every run and machine.\n\n`System.exit(0)` runs the registered shutdown hook and stops the JVM. Because `exit` never returns, the `finally` block after it does not run.",
    anim: [
      "Heap figures from Runtime",
      [
        ["max", "maxMemory()", "-Xmx limit"],
        ["total", "totalMemory()", "reserved now"],
        ["used", "used", "total - free"],
        ["free", "freeMemory()", "unused part"],
        ["oom", "OutOfMemoryError", "beyond max"],
      ],
      [
        ["total", "used", "allocate", "Allocating objects increases used memory inside the reserved heap."],
        ["used", "free", "collect", "Garbage collection turns unreachable objects back into free memory."],
        ["total", "max", "grow", "When the reserved heap fills, the JVM grows totalMemory toward maxMemory."],
        ["max", "oom", "exceed", "If live data needs more than maxMemory, an OutOfMemoryError is thrown."],
      ],
    ],
    mistakes: [
      "Treating `freeMemory()` as the memory left before OutOfMemoryError; the headroom is `maxMemory() - (totalMemory() - freeMemory())`.",
      "Calling `System.exit` inside library code or web applications, which kills the whole server.",
      "Relying on `System.gc()` to free memory at a specific moment.",
    ],
    qa: [
      ["What is the difference between totalMemory and maxMemory?", "totalMemory is the heap currently reserved; maxMemory is the upper limit the heap may grow to (-Xmx)."],
      ["How do you calculate used heap memory?", "`totalMemory() - freeMemory()`."],
      ["What is the difference between System.exit and Runtime.halt?", "exit runs shutdown hooks before stopping the JVM; halt stops it immediately without running them."],
      ["Does finally run after System.exit?", "No. System.exit does not return, so the finally block is never reached."],
    ],
    ex: [
      "Write a method that returns how many megabytes can still be allocated before reaching the max heap.",
      "`long headroom = (rt.maxMemory() - (rt.totalMemory() - rt.freeMemory())) / MB;`. It accounts for the heap not yet reserved as well as free space inside the reserved heap.",
    ],
  }),
]);
