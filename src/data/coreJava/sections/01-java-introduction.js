import { lesson, section } from "../schema.js";

export default section("java-introduction", "Introduction to Java", [
  lesson("Java Introduction and Advantages", {
    intro:
      "Java is a general-purpose, class-based, object-oriented language that compiles to bytecode instead of machine code. The bytecode runs on a Java Virtual Machine (JVM), so one compiled program runs on Windows, Linux and macOS without changes. This lesson explains what Java is, why teams choose it, where it is used and what platform independence really means.",
    topics: [
      [
        "What is Java?",
        "Java is a programming language and a platform. As a language it gives you classes, objects, strong static typing, automatic memory management and a large standard library. As a platform it is the JVM plus the Java Class Library that every Java program relies on.\n\nYou write source code in `.java` files, the `javac` compiler turns it into bytecode in `.class` files, and the `java` launcher starts a JVM that loads and executes that bytecode.",
      ],
      [
        "Advantages of Java",
        "Simple: no pointers arithmetic, no manual memory freeing, no multiple inheritance of classes. Object-oriented: everything except primitives is an object. Robust: strong type checking at compile time, exceptions, and garbage collection prevent whole classes of crashes. Secure: bytecode is verified before it runs and there is no direct memory access. Multithreaded: threads and concurrency utilities are built in. High performance: the JIT compiler turns hot bytecode into optimized machine code. Portable and architecture-neutral: primitive sizes are fixed (an `int` is always 32 bits). Huge ecosystem: Spring, Hibernate, Kafka, Maven, Gradle and millions of libraries.",
      ],
      [
        "Real-world uses of Java",
        "Enterprise back ends and microservices (banking, insurance, e-commerce) built with Spring Boot or Jakarta EE. Android apps (Android uses Java and Kotlin on its own runtime). Big data tools such as Hadoop, Spark, Kafka and Elasticsearch run on the JVM. Desktop tools such as IntelliJ IDEA and Eclipse. Embedded devices, smart cards (Java Card) and set-top boxes. Scientific and trading systems that need speed plus safety.",
      ],
      [
        "Platform independence: write once, run anywhere",
        "C and C++ compile to machine code for one operating system and CPU. Java compiles to bytecode, an instruction set for the JVM rather than for real hardware. Each operating system has its own JVM, and every JVM understands the same bytecode, so the same `.class` file runs everywhere.\n\nThe JVM itself is platform dependent (there is a Windows JVM and a Linux JVM), but your program is not. That is the precise meaning of platform independence.",
      ],
    ],
    code: String.raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        // The same bytecode runs everywhere; only these JVM-reported values change.
        System.out.println("Java says hello from the JVM!");
        System.out.println("int is always " + Integer.SIZE + " bits on every platform");
        System.out.println("long is always " + Long.SIZE + " bits on every platform");
        System.out.println("char is always " + Character.SIZE + " bits (UTF-16 code unit)");

        // Automatic memory management: no free() or delete needed.
        List<String> advantages = List.of("Simple", "Object-oriented", "Robust", "Secure",
                "Multithreaded", "Portable", "High performance");
        for (int i = 0; i < advantages.size(); i++) {
            System.out.println((i + 1) + ". " + advantages.get(i));
        }

        // Robust: errors become exceptions instead of crashing the process.
        try {
            int[] numbers = new int[2];
            numbers[5] = 10;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught safely: " + e.getMessage());
        }
    }
}`,
    walk:
      "The program prints the sizes of `int`, `long` and `char`. They come from constants in the standard library and are identical on every operating system, which is why Java arithmetic behaves the same everywhere.\n\nIt then lists Java's main advantages from an immutable `List` and finally writes past the end of an array. In C this could corrupt memory silently; in Java the JVM checks the index and throws `ArrayIndexOutOfBoundsException`, which the program catches and reports.",
    anim: [
      "Write once, run anywhere",
      [
        ["src", "Hello.java", "source code"],
        ["javac", "javac", "compiler"],
        ["class", "Hello.class", "bytecode"],
        ["win", "Windows JVM", "runs bytecode"],
        ["linux", "Linux JVM", "runs bytecode"],
        ["mac", "macOS JVM", "runs bytecode"],
      ],
      [
        ["src", "javac", "source", "You write human-readable Java source in a .java file."],
        ["javac", "class", "bytecode", "javac checks types and emits platform-neutral bytecode, not machine code."],
        ["class", "win", ".class", "The same .class file is copied to a Windows machine and runs on its JVM."],
        ["class", "linux", ".class", "Without recompiling, the identical file runs on a Linux JVM."],
        ["class", "mac", ".class", "And again on macOS: only the JVM is platform specific, never your program."],
      ],
    ],
    mistakes: [
      "Saying \"Java is platform independent, so the JVM is too\". The JVM is a native program built separately for each operating system; only the bytecode is portable.",
      "Confusing Java with JavaScript. They share a name for marketing reasons only; JavaScript is a different, dynamically typed language that usually runs in browsers.",
      "Believing garbage collection means memory leaks are impossible. Objects you still reference (for example in a static list) are never collected.",
    ],
    qa: [
      ["Why is Java called platform independent?", "Because `javac` produces bytecode for the JVM, not machine code for a CPU. Any operating system with a JVM can run that bytecode unchanged."],
      ["Is Java a pure object-oriented language?", "No. It has eight primitive types (`int`, `char`, `boolean` and so on) that are not objects, and it allows static members that do not belong to any object."],
      ["Why is Java considered secure?", "There is no pointer arithmetic, bytecode is verified before execution, array bounds are checked, and memory is managed by the JVM rather than by the program."],
      ["Is Java compiled or interpreted?", "Both. Source is compiled to bytecode by `javac`; the JVM then interprets bytecode and JIT-compiles frequently used parts to native machine code at runtime."],
    ],
    ex: [
      "Copy `Main.class` produced on one machine to a machine with a different operating system and run `java Main` there without recompiling. What output do you expect, and why?",
      "The output is identical. The `.class` file holds bytecode, every JVM interprets the same bytecode, and primitive sizes are fixed by the language, so nothing in the output depends on the operating system.",
    ],
  }),

  lesson("History of Java", {
    intro:
      "Java was designed in the early 1990s for consumer electronics, renamed after a coffee, and became the language of the web, the enterprise and Android. Knowing its history explains many design choices, from bytecode portability to backward compatibility. This lesson covers the team, the original goal, the creator, the version timeline and some facts about Java's reach.",
    topics: [
      [
        "The Green Team and the Oak language",
        "In 1991 Sun Microsystems started the Green Project. A small team led by James Gosling, with Mike Sheridan and Patrick Naughton, built a language first called Greentalk, then Oak (after an oak tree outside Gosling's office). The name Oak was already trademarked, so in 1995 it was renamed Java, after the Indonesian coffee the team drank.",
      ],
      [
        "Initial target: consumer devices",
        "Oak was meant for interactive television, set-top boxes and other consumer electronics. Those devices had many different chips, so the language had to run on any CPU. That requirement produced the virtual machine and bytecode design. The TV market did not take off, but the same portability fitted the new World Wide Web perfectly, where applets ran inside browsers on any operating system.",
      ],
      [
        "Creator of Java",
        "James Gosling is called the father of Java. Sun Microsystems released Java 1.0 publicly on 23 January 1996. Oracle acquired Sun in 2010 and has stewarded Java since; most development now happens in the open-source OpenJDK project.",
      ],
      [
        "Java releases",
        "JDK 1.0 (1996). JDK 1.1 (1997): inner classes, JDBC, reflection. J2SE 1.2 (1998): Collections framework, Swing. 1.3 (2000): HotSpot JVM. 1.4 (2002): assert, NIO, regex. Java 5 (2004): generics, autoboxing, enums, varargs, annotations, enhanced for, java.util.concurrent. Java 6 (2006). Java 7 (2011): try-with-resources, diamond operator, strings in switch, multi-catch, NIO.2, Fork/Join. Java 8 (2014): lambdas, streams, java.time, default methods. Java 9 (2017): modules, JShell. Java 10: `var`. Java 11 (LTS, 2018): HTTP client. Java 14 to 17: switch expressions, records, text blocks, sealed classes (17 is LTS). Java 21 (LTS, 2023): virtual threads, pattern matching for switch, record patterns. Java 25 (LTS, 2025). Since Java 10 a new version ships every six months, with a long-term-support release every two years.",
      ],
      [
        "Platforms and how many Java developers there are",
        "Java grew into several platforms: Java SE for desktops and servers, Java EE (now Jakarta EE) for enterprise servers, Java ME for small devices, and JavaFX for rich client UIs. Oracle states that Java runs on billions of devices, and industry surveys put the number of Java developers at roughly 9 to 10 million worldwide, keeping it among the most used languages for decades.",
      ],
    ],
    code: String.raw`import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    record Release(String version, int year, String headline) {}

    public static void main(String[] args) {
        Release[] timeline = {
            new Release("JDK 1.0", 1996, "first public release"),
            new Release("JDK 1.1", 1997, "inner classes, JDBC, reflection"),
            new Release("J2SE 1.2", 1998, "Collections framework, Swing"),
            new Release("J2SE 1.4", 2002, "assert, NIO, regex"),
            new Release("Java 5", 2004, "generics, autoboxing, enums, varargs"),
            new Release("Java 7", 2011, "try-with-resources, diamond, NIO.2"),
            new Release("Java 8", 2014, "lambdas, streams, java.time"),
            new Release("Java 11", 2018, "LTS, HTTP client"),
            new Release("Java 17", 2021, "LTS, records, sealed classes"),
            new Release("Java 21", 2023, "LTS, virtual threads"),
            new Release("Java 25", 2025, "LTS")
        };
        for (Release r : timeline) {
            System.out.printf("%-9s %d  %s%n", r.version(), r.year(), r.headline());
        }

        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("Creator", "James Gosling, Sun Microsystems");
        facts.put("First name", "Oak (then Greentalk before it)");
        facts.put("Original target", "set-top boxes and consumer devices");
        facts.put("Owner today", "Oracle (OpenJDK is the open-source project)");
        facts.forEach((key, value) -> System.out.println(key + ": " + value));

        int years = timeline[timeline.length - 1].year() - timeline[0].year();
        System.out.println("Java has evolved for " + years + " years in this timeline");
    }
}`,
    walk:
      "A `record` named `Release` stores a version, a year and a headline feature. The program prints the timeline with `printf`, padding the version to nine characters so the columns line up.\n\nA `LinkedHashMap` keeps the key facts in insertion order, and `forEach` with a lambda prints them. Finally it subtracts the first year from the last one to show how long Java has been evolving.",
    anim: [
      "From Oak to modern Java",
      [
        ["green", "Green Project", "1991"],
        ["oak", "Oak", "set-top boxes"],
        ["java", "Java 1.0", "1996, applets"],
        ["five", "Java 5", "generics, 2004"],
        ["eight", "Java 8", "lambdas, 2014"],
        ["lts", "Java 21/25", "LTS today"],
      ],
      [
        ["green", "oak", "idea", "Sun's Green team designs a portable language for consumer devices."],
        ["oak", "java", "rename", "Oak is trademarked, so it ships as Java in 1996, targeting web applets."],
        ["java", "five", "generics", "Java 5 adds generics, enums, autoboxing and java.util.concurrent."],
        ["five", "eight", "lambdas", "Java 8 brings lambdas, streams and the java.time API."],
        ["eight", "lts", "6-month", "A six-month release train now ships features with an LTS every two years."],
      ],
    ],
    mistakes: [
      "Thinking Java 2 was a version number. \"Java 2\" was branding for 1.2 to 1.4 (J2SE, J2EE, J2ME); the internal version was still 1.x.",
      "Assuming every new version is long-term supported. Only LTS releases (8, 11, 17, 21, 25) get years of updates; others are replaced after six months.",
    ],
    qa: [
      ["Who created Java and when was it released?", "James Gosling and the Green team at Sun Microsystems; Java 1.0 was released in January 1996."],
      ["What was Java's original name and target?", "Oak, designed for interactive TV and set-top boxes in the early 1990s."],
      ["Which Java version introduced generics and which introduced lambdas?", "Generics came in Java 5 (2004); lambdas and streams came in Java 8 (2014)."],
      ["What is an LTS release?", "A long-term-support release that vendors patch for many years. Java 8, 11, 17, 21 and 25 are LTS releases."],
    ],
    ex: [
      "Add a `Release` for Java 9 (2017, modules and JShell) in the right position and also print how many releases in the array are LTS.",
      "Insert `new Release(\"Java 9\", 2017, \"modules, JShell\")` between Java 8 and Java 11. Count LTS releases with a loop that checks `r.headline().contains(\"LTS\")`; with the original data plus Java 9, it prints 4.",
    ],
  }),

  lesson("Four Java Platforms: SE, EE, ME and JavaFX", {
    intro:
      "Java is not one product but a family of platforms that share the same language and JVM. Each platform adds a set of APIs for a kind of device or application. This lesson explains Java SE, Java EE (now Jakarta EE), Java ME and JavaFX, how they differ and how they relate to each other.",
    topics: [
      [
        "Java SE (Standard Edition)",
        "The core platform: the language, the JVM and the core libraries such as `java.lang`, `java.util`, `java.io`, `java.nio`, `java.net`, `java.time`, `java.sql` and concurrency. Desktop programs, command-line tools and the base of every server framework are built on Java SE. When people say \"core Java\" they mean Java SE.",
      ],
      [
        "Java EE / Jakarta EE (Enterprise Edition)",
        "A set of specifications on top of Java SE for large server applications: Servlets, JSP, JPA (persistence), EJB, JMS (messaging), JAX-RS (REST), CDI (dependency injection) and transactions. Application servers such as Tomcat (partly), WildFly, GlassFish and Open Liberty implement them. In 2017 Oracle moved Java EE to the Eclipse Foundation, where it became Jakarta EE and the package prefix changed from `javax.*` to `jakarta.*`.",
      ],
      [
        "Java ME (Micro Edition)",
        "A small subset of Java SE plus device-specific APIs for constrained hardware: feature phones, set-top boxes, printers and sensors. It uses compact virtual machines and profiles such as CLDC and MIDP. Smart phones replaced most of its original market, but it is still used in embedded and IoT devices.",
      ],
      [
        "JavaFX",
        "A platform for rich desktop and embedded user interfaces with CSS styling, FXML layouts, animation, media and hardware-accelerated graphics. It was bundled with Oracle JDK 8 and since Java 11 ships separately as OpenJFX, which you add as a dependency.",
      ],
      [
        "How the platforms relate",
        "All four use the Java language and run on a JVM. Java SE is the foundation: Jakarta EE builds on top of it, JavaFX adds UI libraries to it, and Java ME is a trimmed-down subset of it. Choosing a platform means choosing the APIs and runtime size, not a different language.",
      ],
    ],
    code: String.raw`import java.util.List;

public class Main {
    enum Platform {
        SE("Standard Edition", "desktop, servers, core libraries", "java.lang, java.util, java.io"),
        EE("Enterprise Edition (Jakarta EE)", "large server applications", "Servlet, JPA, JAX-RS, CDI"),
        ME("Micro Edition", "small and embedded devices", "CLDC, MIDP profiles"),
        FX("JavaFX", "rich desktop user interfaces", "Stage, Scene, FXML, CSS");

        final String fullName, usedFor, keyApis;

        Platform(String fullName, String usedFor, String keyApis) {
            this.fullName = fullName;
            this.usedFor = usedFor;
            this.keyApis = keyApis;
        }
    }

    public static void main(String[] args) {
        for (Platform p : Platform.values()) {
            System.out.println("Java " + p + " - " + p.fullName);
            System.out.println("   used for : " + p.usedFor);
            System.out.println("   key APIs : " + p.keyApis);
        }

        // Everything in this program uses only Java SE classes.
        List<String> seModules = List.of("java.base", "java.sql", "java.net.http", "java.desktop");
        System.out.println("Some Java SE modules: " + seModules);
        System.out.println("This JVM is running Java " + Runtime.version().feature());
    }
}`,
    varies: true,
    walk:
      "An `enum` models the four platforms; each constant passes its description to the enum constructor and stores it in final fields. Looping over `Platform.values()` prints each platform with what it is used for and its main APIs.\n\nThe last lines show that the program itself uses only Java SE and prints the feature version of the JVM it runs on, read with `Runtime.version().feature()`.",
    anim: [
      "Java platforms share one core",
      [
        ["jvm", "JVM + language", "shared by all"],
        ["se", "Java SE", "core libraries"],
        ["ee", "Jakarta EE", "server specs"],
        ["fx", "JavaFX", "rich UI"],
        ["me", "Java ME", "small devices"],
      ],
      [
        ["jvm", "se", "core", "Java SE packages the language, JVM and core class library."],
        ["se", "ee", "+ specs", "Jakarta EE adds servlets, JPA, CDI and REST on top of Java SE."],
        ["se", "fx", "+ UI", "JavaFX adds a scene graph, CSS and media for desktop apps."],
        ["se", "me", "subset", "Java ME trims Java SE down for devices with little memory."],
      ],
    ],
    mistakes: [
      "Thinking you must learn a new language for Jakarta EE or JavaFX. They are libraries and specifications over the same Java language.",
      "Importing `javax.servlet` in new Jakarta EE 9+ projects. The packages were renamed to `jakarta.servlet`.",
    ],
    qa: [
      ["What is the difference between Java SE and Java EE?", "Java SE is the core language, JVM and libraries. Java EE (Jakarta EE) is a set of enterprise specifications such as Servlets and JPA built on top of Java SE."],
      ["Is JavaFX part of the JDK?", "It was bundled with Oracle JDK 8. Since Java 11 it is a separate download (OpenJFX) added as a dependency."],
      ["What is Java ME used for?", "Resource-constrained devices such as embedded systems, sensors, set-top boxes and older feature phones."],
    ],
    ex: [
      "Add a field `server` (boolean) to the enum and print only the platforms that are mainly used on servers.",
      "Add `final boolean server;` to the constructor, pass `true` for SE and EE and `false` for ME and FX, then filter with `if (p.server)` in the loop. It prints SE and EE.",
    ],
  }),

  lesson("Installing the JDK and Setting PATH", {
    intro:
      "Before you can compile Java you need a JDK, and your shell needs to find `javac` and `java`. That is what the `PATH` and `JAVA_HOME` environment variables are for. This lesson covers downloading and installing the JDK, setting `JAVA_HOME` and `PATH` temporarily and permanently on Windows, doing the same on Linux and Unix, and what `PATH` actually is.",
    topics: [
      [
        "Downloading and installing the JDK",
        "Download a JDK build such as Oracle JDK, Eclipse Temurin, Amazon Corretto or Microsoft Build of OpenJDK. Choose an LTS version (for example 21 or 25) and your operating system and CPU. On Windows run the `.msi` installer (default folder `C:\\Program Files\\Java\\jdk-21`); on Linux use the package manager (`sudo apt install openjdk-21-jdk`) or extract the `.tar.gz` archive; on macOS use the `.pkg` installer or Homebrew. Verify with `java -version` and `javac -version`.",
      ],
      [
        "What PATH is",
        "`PATH` is an environment variable holding a list of folders. When you type a command such as `javac`, the shell searches those folders in order and runs the first matching executable. On Windows entries are separated by `;`, on Linux and macOS by `:`. If the JDK's `bin` folder is not in `PATH`, you get \"'javac' is not recognized\" (Windows) or \"command not found\" (Linux).",
      ],
      [
        "JAVA_HOME",
        "`JAVA_HOME` points to the JDK's root folder (not its `bin`). Tools such as Maven, Gradle, Tomcat and IDEs read it to find the JDK. A common setup is to set `JAVA_HOME` once and add `%JAVA_HOME%\\bin` (Windows) or `$JAVA_HOME/bin` (Linux) to `PATH`.",
      ],
      [
        "Setting PATH on Windows: temporary and permanent",
        "Temporary (only the current Command Prompt window): `set JAVA_HOME=C:\\Program Files\\Java\\jdk-21` and `set PATH=%JAVA_HOME%\\bin;%PATH%`. Closing the window loses it.\n\nPermanent: open System Properties, Advanced, Environment Variables; add a new variable `JAVA_HOME`, then edit `Path` and add `%JAVA_HOME%\\bin`. Or run `setx JAVA_HOME \"C:\\Program Files\\Java\\jdk-21\"` in a terminal. Open a new terminal afterwards because running ones keep the old values.",
      ],
      [
        "Setting PATH on Linux and Unix: temporary and permanent",
        "Temporary (current shell only): `export JAVA_HOME=/usr/lib/jvm/java-21-openjdk` and `export PATH=$JAVA_HOME/bin:$PATH`.\n\nPermanent for your user: add the same two `export` lines to `~/.bashrc`, `~/.bash_profile` or `~/.zshrc`, then run `source ~/.bashrc`. System-wide: add them to `/etc/profile` or a file in `/etc/profile.d/`. On Debian and Ubuntu, `update-alternatives --config java` switches between installed JDKs.",
      ],
    ],
    code: String.raw`import java.io.File;

public class Main {
    public static void main(String[] args) {
        // Where is the running JVM installed?
        String javaHome = System.getProperty("java.home");
        System.out.println("java.home of this JVM: " + (javaHome != null ? "found" : "missing"));
        System.out.println("Running Java feature version: " + Runtime.version().feature());

        // JAVA_HOME and PATH are ordinary environment variables.
        String envJavaHome = System.getenv("JAVA_HOME");
        System.out.println("JAVA_HOME set: " + (envJavaHome != null));

        String path = System.getenv("PATH");
        if (path == null) path = System.getenv("Path"); // Windows spelling
        String[] entries = path == null ? new String[0] : path.split(File.pathSeparator);
        System.out.println("PATH separator on this OS: '" + File.pathSeparator + "'");

        boolean javacOnPath = false;
        String javac = File.separatorChar == '\\' ? "javac.exe" : "javac";
        for (String folder : entries) {
            if (new File(folder, javac).isFile()) {
                javacOnPath = true;
                break;
            }
        }
        System.out.println("PATH has " + entries.length + " folders");
        System.out.println("javac reachable through PATH: " + javacOnPath);
    }
}`,
    varies: true,
    walk:
      "`System.getProperty(\"java.home\")` reports where the running JVM lives, and `System.getenv` reads `JAVA_HOME` and `PATH` exactly as the shell set them. Windows sometimes spells the variable `Path`, so the program tries both.\n\nIt splits `PATH` with `File.pathSeparator` (`;` on Windows, `:` elsewhere) and checks each folder for a `javac` executable, which is the same search the shell performs when you type `javac`. The values depend on your machine, so your output will differ.",
    anim: [
      "How the shell finds javac",
      [
        ["cmd", "You type javac", "terminal"],
        ["path", "PATH", "folder list"],
        ["f1", "C:\\Windows", "no javac"],
        ["f2", "JAVA_HOME\\bin", "javac.exe"],
        ["run", "Compiler runs", "first match"],
      ],
      [
        ["cmd", "path", "lookup", "The shell reads the PATH variable to know where to look for javac."],
        ["path", "f1", "try 1", "It checks the first folder; javac is not there, so it moves on."],
        ["path", "f2", "try 2", "The JDK bin folder, added through JAVA_HOME, contains javac."],
        ["f2", "run", "execute", "The first match runs. Without that PATH entry you would see 'not recognized'."],
      ],
    ],
    mistakes: [
      "Setting `JAVA_HOME` to the `bin` folder. It must point to the JDK root; `bin` is appended in `PATH`.",
      "Testing in a terminal that was already open. Environment changes apply only to newly started terminals (or after `source ~/.bashrc`).",
      "Having an old JRE folder earlier in `PATH`, so `java -version` and `javac -version` report different versions.",
    ],
    qa: [
      ["What is the difference between PATH and JAVA_HOME?", "`PATH` is the list of folders the shell searches for commands. `JAVA_HOME` is a single folder, the JDK root, that build tools and servers read to locate Java."],
      ["How do you set PATH temporarily on Windows and Linux?", "Windows: `set PATH=C:\\...\\jdk-21\\bin;%PATH%`. Linux: `export PATH=/usr/lib/jvm/jdk-21/bin:$PATH`. Both last only for that shell session."],
      ["Why does 'javac is not recognized' appear after installing the JDK?", "The JDK's `bin` folder is not in `PATH`, or the terminal was opened before `PATH` was updated."],
    ],
    ex: [
      "On your machine, temporarily remove the JDK from `PATH` in one terminal and run `javac -version`. Then restore it and run the program above again.",
      "Without the entry the shell prints an error (\"not recognized\" or \"command not found\"). After restoring, `javac -version` works and the program reports `javac reachable through PATH: true`.",
    ],
  }),

  lesson("Your First Java Program", {
    intro:
      "Every Java journey starts with a program that prints a message. Writing it by hand in a plain editor shows exactly what `javac` and `java` do; using an IDE such as Eclipse shows how projects are organised. This lesson covers writing and running a first program from the Windows command line, setting up Eclipse, and where the `.class` file is generated.",
    topics: [
      [
        "Writing the program in Notepad",
        "Create a folder such as `C:\\java`, open Notepad and type a class with a `main` method. Save it as `Main.java` (choose \"All files\" so Notepad does not add `.txt`). The file name must match the public class name exactly, including capital letters.\n\n`public static void main(String[] args)` is the entry point: `public` so the JVM can call it, `static` so no object is needed, `void` because it returns nothing, and `String[] args` for command-line arguments.",
      ],
      [
        "Compiling and running from CMD",
        "Open Command Prompt, `cd C:\\java`, then run `javac Main.java`. If there are no errors, `Main.class` appears in the same folder. Run it with `java Main` (no `.class` extension). Arguments after the class name arrive in `args`: `java Main Ashu 3`.\n\nSince Java 11 you can also run a single source file directly with `java Main.java`; it compiles in memory without leaving a `.class` file.",
      ],
      [
        "Setting up Eclipse",
        "Download \"Eclipse IDE for Java Developers\", extract or install it, and choose a workspace folder. Select File, New, Java Project, give it a name and choose a JRE. Right-click `src`, New, Class, tick \"public static void main\", then write code and press Run (Ctrl+F11). Eclipse compiles automatically every time you save.",
      ],
      [
        "Where the .class file is generated",
        "With plain `javac`, the `.class` file is written next to the `.java` file, or into the folder given by `-d` (for example `javac -d out Main.java`; packages become subfolders). In Eclipse, sources live in `src` and compiled classes go to the project's `bin` folder (Maven projects use `target/classes`). The Package Explorer hides `bin`, so look in the workspace folder on disk.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // Command-line arguments arrive in args: java Main Ashu 3
        String name = args.length > 0 ? args[0] : "Java learner";
        int times = args.length > 1 ? Integer.parseInt(args[1]) : 2;
        for (int i = 1; i <= times; i++) {
            System.out.println(i + ": Welcome, " + name + "!");
        }

        // Where was this class loaded from? (the folder holding Main.class)
        String location = Main.class.getProtectionDomain().getCodeSource().getLocation().getPath();
        System.out.println("Main.class was loaded from a folder: " + location.endsWith("/"));
        System.out.println("Number of arguments received: " + args.length);
    }
}`,
    walk:
      "The JVM calls `main` and the first line prints the classic greeting. Without arguments, `name` falls back to a default and the loop prints the welcome twice; run `java Main Ashu 3` to see three personalised lines.\n\n`getProtectionDomain().getCodeSource().getLocation()` tells you where `Main.class` was loaded from, which is the output folder of `javac` (or Eclipse's `bin`). The final line confirms how many arguments were passed.",
    anim: [
      "From Notepad to output",
      [
        ["edit", "Main.java", "Notepad"],
        ["javac", "javac Main.java", "compile"],
        ["cls", "Main.class", "same folder"],
        ["java", "java Main", "launch JVM"],
        ["out", "Hello, World!", "console"],
      ],
      [
        ["edit", "javac", "save", "Save the source as Main.java; the name must match the public class."],
        ["javac", "cls", "bytecode", "javac checks the code and writes Main.class next to the source file."],
        ["cls", "java", "load", "java Main starts a JVM, loads Main.class and finds the main method."],
        ["java", "out", "println", "main runs and System.out.println writes the text to the console."],
      ],
    ],
    mistakes: [
      "Running `java Main.class`. The launcher expects a class name, so it looks for a class called `class` in a package `Main` and fails with \"Could not find or load main class\".",
      "Saving as `main.java` or `Main.java.txt`. The file name must exactly match the public class `Main`.",
      "Writing `static public void Main(String args)`. The method must be named `main` (lowercase) and take a `String[]`.",
    ],
    qa: [
      ["Why is main declared public static void?", "`public` so the JVM can call it from outside the class, `static` so it runs without creating an object, and `void` because the JVM does not use a return value; exit codes are set with `System.exit`."],
      ["Can a Java file contain more than one class?", "Yes, but at most one top-level class can be `public`, and the file must be named after that class."],
      ["Where does Eclipse put compiled classes?", "In the project's `bin` folder (or `target/classes` for Maven projects), separate from `src`."],
    ],
    ex: [
      "Compile with `javac -d out Main.java` and run it with `java -cp out Main Ashu 3`. What changes compared with compiling without `-d`?",
      "`Main.class` is written into the `out` folder instead of next to the source, so you must tell the JVM where to find it with `-cp out`. The output shows three welcome lines for Ashu and `Number of arguments received: 2`.",
    ],
  }),

  lesson("Naming Conventions and Source File Rules", {
    intro:
      "Java has two kinds of naming rules: hard rules that the compiler enforces, and conventions that every Java developer follows so code is readable. This lesson covers the source file rules (file names, public classes, package and import order) and the naming conventions for interfaces, classes, packages, variables, methods and constants.",
    topics: [
      [
        "Source file rules",
        "A source file can contain any number of top-level classes, interfaces, enums and records, but at most one of them can be `public`, and the file must then be named after it (`Invoice.java` for `public class Invoice`). If there is no public type, any file name works. The order is fixed: an optional `package` statement first, then `import` statements, then type declarations. Comments can go anywhere. Each class in the file still compiles into its own `.class` file.",
      ],
      [
        "Legal identifiers",
        "Names can contain letters, digits, `_` and `$`, must not start with a digit, are case-sensitive and cannot be a keyword (`class`, `int`) or the literals `true`, `false` and `null`. Since Java 9, a single underscore `_` is not a valid identifier on its own.",
      ],
      [
        "Class and interface names",
        "Use nouns in UpperCamelCase (PascalCase) for classes: `Employee`, `OrderService`, `HttpClient`. Interfaces also use UpperCamelCase and are usually adjectives or nouns describing a capability: `Runnable`, `Comparable`, `List`, `Serializable`. Avoid prefixes such as `IEmployee`.",
      ],
      [
        "Package names",
        "All lowercase, usually your organisation's reversed domain name: `com.engineeringdecoded.billing`. Words are not separated by capitals; an underscore is used only to avoid keywords or leading digits (`com.example.int_`).",
      ],
      [
        "Variable and method names",
        "Variables use lowerCamelCase nouns: `firstName`, `totalAmount`, `i` for short loop counters. Methods use lowerCamelCase verbs: `calculateTax()`, `getName()`, `isActive()` for booleans. Getters and setters follow the JavaBeans pattern `getX`/`setX`/`isX`.",
      ],
      [
        "Constant names",
        "`static final` constants use UPPER_SNAKE_CASE: `MAX_SIZE`, `DEFAULT_TIMEOUT_SECONDS`, `PI`. Enum constants follow the same style: `Color.DARK_RED`.",
      ],
    ],
    code: String.raw`// File name: Main.java (it must match the only public class below)
import java.util.ArrayList;
import java.util.List;

interface Payable {                       // interface: UpperCamelCase capability
    double MAX_DISCOUNT_PERCENT = 20.0;   // constant: UPPER_SNAKE_CASE (implicitly static final)
    double calculateAmount();             // method: lowerCamelCase verb
}

class InvoiceLine implements Payable {    // class: UpperCamelCase noun (non-public: any number allowed)
    private final String itemName;        // variable: lowerCamelCase noun
    private final int quantity;
    private final double unitPrice;

    InvoiceLine(String itemName, int quantity, double unitPrice) {
        this.itemName = itemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public String getItemName() { return itemName; }   // JavaBeans getter
    public boolean isBulkOrder() { return quantity >= 10; }  // boolean: isX

    @Override
    public double calculateAmount() { return quantity * unitPrice; }
}

public class Main {
    static final int DEFAULT_QUANTITY = 1;

    public static void main(String[] args) {
        List<InvoiceLine> invoiceLines = new ArrayList<>();
        invoiceLines.add(new InvoiceLine("Keyboard", DEFAULT_QUANTITY, 1499.0));
        invoiceLines.add(new InvoiceLine("USB cable", 12, 99.0));

        double totalAmount = 0;
        for (InvoiceLine line : invoiceLines) {
            System.out.printf("%-10s bulk=%-5b amount=%.2f%n",
                    line.getItemName(), line.isBulkOrder(), line.calculateAmount());
            totalAmount += line.calculateAmount();
        }
        System.out.printf("Total: %.2f (max discount %.0f%%)%n", totalAmount, Payable.MAX_DISCOUNT_PERCENT);
        int $price_2 = 5;                 // legal but unconventional identifier
        System.out.println("Legal identifier value: " + $price_2);
    }
}`,
    walk:
      "One file holds an interface, a non-public class and the public class `Main`, which is allowed because only `Main` is public and the file is named `Main.java`. Imports come before the types, as the rules require.\n\nEvery name follows the conventions: `Payable` and `InvoiceLine` in UpperCamelCase, `calculateAmount` and `isBulkOrder` as lowerCamelCase verbs, `MAX_DISCOUNT_PERCENT` and `DEFAULT_QUANTITY` as constants. `$price_2` compiles but shows the kind of name conventions tell you to avoid. Compiling produces `Payable.class`, `InvoiceLine.class` and `Main.class`.",
    anim: [
      "javac checks the file rules",
      [
        ["file", "Main.java", "source file"],
        ["pkg", "package/import", "first"],
        ["pub", "public Main", "name matches"],
        ["other", "InvoiceLine", "non-public"],
        ["out", "3 .class files", "one per type"],
      ],
      [
        ["file", "pkg", "order", "javac expects the package statement and imports before any type."],
        ["file", "pub", "match", "The only public class must be named exactly like the file: Main."],
        ["file", "other", "allowed", "Extra non-public types such as InvoiceLine and Payable are fine."],
        ["pub", "out", "compile", "Each type in the file becomes its own .class file."],
      ],
    ],
    mistakes: [
      "Declaring two public classes in one file; javac reports \"class X is public, should be declared in a file named X.java\".",
      "Using UpperCamelCase for methods or variables (`GetName()`, `TotalAmount`), which readers mistake for types.",
      "Naming packages with capitals (`com.Example.Billing`). It works on some file systems and breaks on case-sensitive ones.",
    ],
    qa: [
      ["Can a source file have no public class?", "Yes. Then the file can have any name, and each class still compiles into its own `.class` file."],
      ["What is the naming convention for constants?", "UPPER_SNAKE_CASE with `static final`, for example `MAX_CONNECTIONS`."],
      ["What order must package, import and class declarations follow?", "`package` first (optional, at most one), then any `import` statements, then type declarations."],
      ["Is `$value` a valid identifier?", "Yes, `$` is legal anywhere in an identifier, but conventions reserve it for generated code, so avoid it."],
    ],
    ex: [
      "Rename the file to `Invoice.java` without changing the code and compile. What happens, and what are two ways to fix it?",
      "javac fails because public class `Main` must be in `Main.java`. Fix it by renaming the file back, or by renaming the public class to `Invoice` (or by removing `public` from `Main`).",
    ],
  }),

  lesson("Common Java Setup and Startup Errors", {
    intro:
      "A handful of errors appear again and again when people start with Java. They are confusing because they come from the launcher or the compiler, not from your logic. This lesson explains \"Could not find or load main class\", \"Class names are only accepted if annotation processing is explicitly requested\" and Eclipse's \"Failed to load the JNI shared library\", and the program reproduces the first two for real.",
    topics: [
      [
        "Error: Could not find or load main class",
        "The `java` launcher could not find the class you named. Common causes: you typed `java Main.class` instead of `java Main`; you are in the wrong folder; the classpath (`-cp`) does not include the folder or JAR holding the class; the class is in a package and you did not use its full name (`java com.shop.Main` from the folder above `com`); or the name's capitalisation differs. Since Java 9 the message adds \"Caused by: java.lang.ClassNotFoundException\".",
      ],
      [
        "Class names are only accepted if annotation processing is explicitly requested",
        "`javac` needs source file names with the `.java` extension. If you type `javac Main`, javac thinks `Main` is a class name for annotation processing and reports this error. Fix: `javac Main.java`. The same error appears if you mistype the extension, for example `javac Main.Java` on a case-sensitive system.",
      ],
      [
        "Failed to load the JNI shared library (Eclipse)",
        "Eclipse starts using a native `jvm.dll`. If Eclipse is 64-bit and the JDK it finds is 32-bit (or the reverse), Windows refuses to load the library and Eclipse shows \"Failed to load the JNI shared library\". Fix it by installing matching bitness (normally 64-bit everything), or by pointing Eclipse to the right JDK with `-vm C:\\Program Files\\Java\\jdk-21\\bin\\javaw.exe` on its own line before `-vmargs` in `eclipse.ini`.",
      ],
      [
        "A habit for diagnosing startup errors",
        "Read which tool printed the error (javac or java), check the exact file and class names, check the current folder with `dir` or `ls`, then check `-cp`. Run `java -version` and `javac -version` to make sure both come from the same JDK.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    // Runs a JDK tool and returns everything it printed (stdout and stderr together).
    static String run(String... command) throws IOException, InterruptedException {
        Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
        String output = new String(process.getInputStream().readAllBytes()).trim();
        process.waitFor();
        return output;
    }

    public static void main(String[] args) throws Exception {
        String bin = System.getProperty("java.home") + File.separator + "bin" + File.separator;
        Path folder = Files.createTempDirectory("startup-errors");
        Files.writeString(folder.resolve("Hello.java"),
                "public class Hello { public static void main(String[] a) { System.out.println(\"hi\"); } }");

        System.out.println("1) javac Hello   (extension missing)");
        System.out.println(run(bin + "javac", "-d", folder.toString(), "Hello").lines().findFirst().orElse(""));

        System.out.println("2) javac Hello.java   (correct)");
        String ok = run(bin + "javac", "-d", folder.toString(), folder.resolve("Hello.java").toString());
        System.out.println(ok.isEmpty() ? "compiled, Hello.class created: " + Files.exists(folder.resolve("Hello.class")) : ok);

        System.out.println("3) java Hello.class   (wrong: .class added)");
        System.out.println(run(bin + "java", "-cp", folder.toString(), "Hello.class").lines().findFirst().orElse(""));

        System.out.println("4) java Hello   (wrong folder / classpath)");
        System.out.println(run(bin + "java", "Hello").lines().findFirst().orElse(""));

        System.out.println("5) java -cp <folder> Hello   (correct)");
        System.out.println(run(bin + "java", "-cp", folder.toString(), "Hello"));
    }
}`,
    walk:
      "The helper `run` starts a JDK tool with `ProcessBuilder`, merges its error stream into its output stream and returns the text. The JDK tools are located through `java.home`, so the program does not depend on `PATH`.\n\nIt writes `Hello.java` into a temporary folder and then reproduces each mistake: `javac Hello` gives the annotation-processing error, `java Hello.class` and running without the right classpath both give \"Could not find or load main class\", and the correct commands compile and print `hi`.",
    anim: [
      "Why the JVM cannot find Main",
      [
        ["cmd", "java Main.class", "you type"],
        ["launch", "Launcher", "parses name"],
        ["cp", "Classpath", "-cp folders"],
        ["miss", "Not found", "error shown"],
        ["fix", "java Main", "correct"],
      ],
      [
        ["cmd", "launch", "args", "The launcher treats Main.class as package Main, class class."],
        ["launch", "cp", "search", "It searches every classpath entry for Main/class.class."],
        ["cp", "miss", "fail", "Nothing matches, so it prints 'Could not find or load main class'."],
        ["fix", "cp", "search", "With the plain class name, the search for Main.class in the classpath succeeds."],
      ],
    ],
    mistakes: [
      "Setting a global `CLASSPATH` environment variable that leaves out `.`, so `java Main` stops finding classes in the current folder.",
      "Running a packaged class from inside its package folder. Run `java com.shop.Main` from the folder that contains `com`.",
    ],
    qa: [
      ["What causes 'Could not find or load main class'?", "The class is not on the classpath under that exact name: wrong folder, missing `-cp`, `.class` added to the name, wrong capitalisation, or a missing package prefix."],
      ["Why does `javac Main` fail?", "javac requires a source file name with `.java`; a bare name is treated as a class for annotation processing, which was not requested."],
      ["How do you fix Eclipse's 'Failed to load the JNI shared library'?", "Make Eclipse and the JDK the same bitness, or point `-vm` in `eclipse.ini` to a matching `javaw.exe`."],
    ],
    ex: [
      "Put `Hello` in package `demo` (add `package demo;`), compile with `javac -d out Hello.java`, and work out the exact command to run it.",
      "javac creates `out/demo/Hello.class`. Run it with `java -cp out demo.Hello`; `java -cp out Hello` or `java -cp out/demo Hello` both fail because the class's full name is `demo.Hello`.",
    ],
  }),
]);
