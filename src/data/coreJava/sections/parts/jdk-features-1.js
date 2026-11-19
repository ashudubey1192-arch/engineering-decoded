import { lesson } from "../../schema.js";

export default [
  lesson("Java 1.0 (1996): The Original Platform", {
    intro:
      "JDK 1.0, released in January 1996, introduced the Java language and its core promise: **write once, run anywhere**. Source code compiles to platform-neutral **bytecode** that the **Java Virtual Machine** executes on any operating system. This lesson covers the features that shipped in 1.0 and are still the foundation of every Java program:\n\n- the object model and the primitive types\n- exceptions\n- automatic garbage collection\n- built-in threads and `synchronized`\n- the first core libraries\n\nThe program uses only 1.0-era APIs.",
    topics: [
      [
        "Bytecode and the JVM",
        "`javac` compiles `.java` source to `.class` files containing **bytecode**: compact instructions for a stack-based virtual machine, not for any real CPU. The **JVM** loads the classes, **verifies** the bytecode, which rejects code that would break type safety or the stack, and interprets it. Later versions also compile hot code with a JIT. The same class file runs on Windows, Linux and macOS, as long as the platform has a JVM. This is what \"write once, run anywhere\" means, and it was revolutionary at a time when C and C++ programs had to be recompiled for every platform.",
        "javac Hello.java    // -> Hello.class (bytecode)\njava Hello          // the JVM loads, verifies and runs it",
      ],
      [
        "A simple, object-oriented, safe language",
        "Java 1.0 took C++ syntax and removed its riskiest parts. There are **no pointers** or pointer arithmetic, only references. There is **no manual memory management** and **no multiple inheritance of classes**, only interfaces. There is no operator overloading, no preprocessor and no header files. Every piece of code lives in a **class**, arrays are bounds-checked objects, and the eight **primitive types** have fixed sizes on every platform (an `int` is always 32 bits). Strings are immutable objects. These choices made Java programs portable and much harder to crash.",
      ],
      [
        "Automatic garbage collection",
        "Objects are allocated with `new` on a managed **heap**, and are never freed explicitly. The **garbage collector** reclaims objects that are no longer reachable. This removed whole classes of bugs, including dangling pointers, double frees and most memory leaks. The 1.0 collector was a simple stop-the-world mark-and-sweep. Generational and concurrent collectors came later (G1, ZGC and Shenandoah), but the programming model has never changed.",
      ],
      [
        "Exceptions, including checked exceptions",
        "Errors are reported with **exception objects**: `try`, `catch`, `finally`, `throw` and `throws`. Java 1.0 introduced **checked exceptions**: the compiler forces callers to handle or declare recoverable failures such as `IOException`. The `Throwable`, `Exception`, `RuntimeException` and `Error` hierarchy dates from 1.0 and is unchanged today.",
      ],
      [
        "Threads and synchronized built into the language",
        "Unusually for its time, Java had **multithreading in the language and the core library**: the `Thread` class, the `Runnable` interface, the `synchronized` keyword for methods and blocks, and `wait`, `notify` and `notifyAll` on every object. Every object can act as a lock (a monitor). This made Java an early choice for servers and GUIs, which need several things happening at once.",
      ],
      [
        "The 1.0 core libraries",
        "- `java.lang`: Object, String, StringBuffer, Math, the wrapper classes, Thread and System.\n- `java.io`: byte streams.\n- `java.net`: sockets and URLs.\n- `java.util`: **Vector**, **Hashtable**, **Stack**, Enumeration, Date and Random.\n- `java.awt`: the Abstract Window Toolkit for GUIs.\n- `java.applet`: **applets**, small programs running inside web browsers, which drove Java's early popularity.\n\nApplets are long gone: deprecated in 9 and removed in Java 26.",
      ],
    ],
    code: String.raw`import java.util.*;

// Only APIs that existed in JDK 1.0: Vector, Hashtable, Enumeration, Thread, synchronized, StringBuffer.
public class Main {

    static class Counter {
        private int value;
        synchronized void increment() { value++; }      // every object is a monitor
        synchronized int get() { return value; }
    }

    static class Worker extends Thread {                 // the 1.0 way to create a thread
        private final Counter counter;
        Worker(Counter counter) { this.counter = counter; }
        public void run() { for (int i = 0; i < 1000; i++) counter.increment(); }
    }

    public static void main(String[] args) throws Exception {
        // Vector and Enumeration: the original collections.
        Vector v = new Vector();                          // no generics yet in 1.0 (raw type)
        v.addElement("write");
        v.addElement("once");
        v.addElement("run anywhere");
        StringBuffer motto = new StringBuffer();          // StringBuilder did not exist until Java 5
        Enumeration e = v.elements();
        while (e.hasMoreElements()) motto.append(e.nextElement()).append(' ');
        System.out.println("Vector + Enumeration: " + motto.toString().trim());

        // Hashtable: the original map.
        Hashtable versions = new Hashtable();
        versions.put("JDK", "1.0");
        System.out.println("Hashtable lookup: JDK " + versions.get("JDK"));

        // Threads + synchronized.
        Counter counter = new Counter();
        Worker a = new Worker(counter), b = new Worker(counter);
        a.start(); b.start(); a.join(); b.join();
        System.out.println("two threads, synchronized counter = " + counter.get());

        // Exceptions and array bounds checking.
        try {
            int[] data = new int[2];
            data[2] = 1;
        } catch (ArrayIndexOutOfBoundsException ex) {
            System.out.println("arrays are bounds-checked: " + ex.getClass().getName());
        }

        // Fixed-size primitives on every platform.
        System.out.println("int is always 32 bits: max " + Integer.MAX_VALUE + ", long max " + Long.MAX_VALUE);
    }
}`,
    walk:
      "The program deliberately uses only APIs that existed in JDK 1.0. A raw Vector collects three words, read back through an Enumeration and joined in a StringBuffer. Generics and StringBuilder came much later. A Hashtable maps a key to a value. Two threads created by extending Thread each increment a shared counter 1,000 times. Because `increment` is synchronized on the counter's monitor, the total is exactly 2000.\n\nWriting index 2 of a two-element array throws ArrayIndexOutOfBoundsException instead of corrupting memory, which shows Java's safety guarantee. The last line prints the fixed limits of `int` and `long`, the same on every platform. Raw types produce warnings on modern compilers, which the build silences.",
    anim: [
      "Write once, run anywhere",
      [
        ["src", "Main.java", "source code"],
        ["javac", "javac", "compiler"],
        ["cls", "Main.class", "bytecode"],
        ["jvmw", "JVM on Windows", "verify + run"],
        ["jvml", "JVM on Linux", "verify + run"],
      ],
      [
        ["src", "javac", "compile", "javac translates Java source into platform-neutral bytecode."],
        ["javac", "cls", "write", "The output is a .class file: the same bytes on every platform."],
        ["cls", "jvmw", "load", "A Windows JVM loads, verifies and executes the class file."],
        ["cls", "jvml", "load", "The identical class file runs unchanged on a Linux JVM."],
        ["jvmw", "jvml", "same output", "Fixed primitive sizes and one standard library give the same results."],
      ],
    ],
    mistakes: [
      "Thinking Java 1.0 had generics or a Collections Framework. It had only Vector, Hashtable and Stack.",
      "Believing the JVM was fast from day one. Early JVMs interpreted bytecode; JIT compilers arrived in 1.1 and 1.2.",
    ],
    qa: [
      [
        "What was Java originally called?",
        "Oak, after a tree outside James Gosling's office. It was renamed Java in 1995 because of a trademark conflict.",
      ],
      [
        "Why did Java leave out multiple inheritance of classes?",
        "To avoid the diamond problem and the complexity of C++. Interfaces provide multiple inheritance of type without inheritance of state.",
      ],
      [
        "Why was the bytecode verifier important?",
        "Applets ran untrusted code downloaded from the web. The verifier guaranteed that the bytecode could not forge pointers, overflow the stack or break type safety before it ran.",
      ],
    ],
    ex: [
      "Rewrite the Vector loop using today's equivalents (generics, ArrayList, String.join) and name the Java version that introduced each one.",
      "`List<String> v = new ArrayList<>(List.of(\"write\", \"once\", \"run anywhere\")); String motto = String.join(\" \", v);`. ArrayList came in 1.2, generics in 5, the diamond in 7, `String.join` in 8 and `List.of` in 9.",
    ],
  }),

  lesson("Java 1.1 (1997): Inner Classes, JDBC, Reflection, RMI and Serialization", {
    intro:
      "JDK 1.1 (February 1997) filled the biggest gaps of 1.0, and added several APIs that enterprise Java still relies on:\n\n- inner classes, needed by the new AWT event model\n- JDBC for databases\n- reflection\n- RMI for remote calls\n- object serialization\n- JavaBeans\n- internationalization support\n\nThe program demonstrates inner classes, reflection and serialization.",
    topics: [
      [
        "Inner classes",
        "Classes can now be declared **inside other classes**:\n\n- **member inner classes**, which hold a reference to an outer instance\n- **static nested classes**\n- **local classes**, declared inside a method\n- **anonymous classes**, declared and instantiated in one expression\n\nInner classes can access the members of the outer class, including private ones. They were added mainly for the new event model, where `button.addActionListener(new ActionListener() { ... })` is an anonymous class. Lambdas replaced most of these uses in Java 8.",
        "class Outer {\n    private int secret = 42;\n    class Inner { int peek() { return secret; } }   // can read Outer's private field\n}",
      ],
      [
        "JDBC",
        "**Java Database Connectivity** (`java.sql`) is a vendor-neutral API for relational databases: `DriverManager.getConnection(url)`, `Statement`, `PreparedStatement` and `ResultSet`. Each vendor supplies a driver. JDBC let Java move into enterprise back ends, and every ORM (Hibernate, JPA) and SQL framework is still built on it.",
      ],
      [
        "Reflection",
        "`java.lang.reflect` lets code **inspect and use classes at runtime**: list fields, methods and constructors, read and write fields, invoke methods, and create instances, all by name. It powers JavaBeans tools, serialization, dependency-injection frameworks, test runners and ORMs. Since Java 9, reflection into JDK internals is restricted by the module system.",
      ],
      [
        "RMI (Remote Method Invocation)",
        "RMI lets a Java object **call methods on an object in another JVM**, possibly on another machine, as if it were local. Remote interfaces extend `java.rmi.Remote`, arguments are passed by serialization, and an `rmiregistry` looks up the objects. RMI was the basis of early EJB. Today it has mostly been replaced by HTTP and gRPC services, and RMI activation was removed in Java 17.",
      ],
      [
        "Object serialization",
        "Classes that implement `java.io.Serializable` can be converted to a byte stream with `ObjectOutputStream` and rebuilt with `ObjectInputStream`. This was needed for RMI, saving objects to files, and HTTP sessions. Serialization of untrusted data later proved to be a major security risk, which led to deserialization filters (Java 9) and a general move to JSON and Protobuf.",
      ],
      [
        "JavaBeans, the AWT event model and internationalization",
        "**JavaBeans** are a component convention: properties exposed through getters and setters, events, and introspection. GUI builders and later frameworks used them. The **delegation event model** replaced 1.0's inheritance-based events with listener interfaces. **Internationalization** brought Unicode-aware `Reader` and `Writer` character streams, `Locale`, `ResourceBundle`, and the `java.text` formatters (NumberFormat, DateFormat, Collator). 1.1 also added the first **JIT compiler** for Windows, `BigDecimal` and `BigInteger`, and `Calendar`.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.lang.reflect.*;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.*;

public class Main {
    private int clicks = 0;

    // Member inner class: has access to the outer instance's private field.
    class ClickListener {
        void onClick() { clicks++; }
    }

    // A JavaBean-style serializable class.
    public static class Person implements Serializable {
        private static final long serialVersionUID = 1L;
        private String name;
        private int age;
        public Person() { }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }
    }

    interface Greeter { String greet(String who); }

    public static void main(String[] args) throws Exception {
        // Inner, local and anonymous classes.
        Main app = new Main();
        Main.ClickListener listener = app.new ClickListener();
        listener.onClick(); listener.onClick();
        class Shouter implements Greeter { public String greet(String w) { return "HELLO " + w.toUpperCase(); } }   // local class
        Greeter polite = new Greeter() { public String greet(String w) { return "Good day, " + w; } };              // anonymous class
        System.out.println("inner class updated outer field: clicks = " + app.clicks + " | " + new Shouter().greet("java") + " | " + polite.greet("Duke"));

        // Reflection: set bean properties by name, like a JavaBeans tool would.
        Person p = Person.class.getDeclaredConstructor().newInstance();
        Map<String, Object> props = new TreeMap<>(Map.of("name", "Duke", "age", 26));
        for (Map.Entry<String, Object> prop : props.entrySet()) {
            String setter = "set" + Character.toUpperCase(prop.getKey().charAt(0)) + prop.getKey().substring(1);
            Class<?> type = prop.getValue() instanceof Integer ? int.class : String.class;
            Method m = Person.class.getMethod(setter, type);
            m.invoke(p, prop.getValue());
        }
        System.out.println("reflection set name=" + p.getName() + ", age=" + p.getAge() + " via " + Person.class.getMethods().length + " public methods");

        // Serialization round trip.
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(p); }
        Person copy;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) { copy = (Person) in.readObject(); }
        System.out.println("serialized " + bytes.size() + " bytes, restored " + copy.getName() + " (" + copy.getAge() + ")");

        // Internationalization and BigDecimal (both 1.1).
        System.out.println("NumberFormat India: " + NumberFormat.getInstance(new Locale("en", "IN")).format(1234567.891)
                + ", BigDecimal 0.1 + 0.2 = " + new BigDecimal("0.1").add(new BigDecimal("0.2")));
    }
}`,
    walk:
      "A member inner class created with `app.new ClickListener()` increments the outer object's private `clicks` field twice. A local class and an anonymous class each implement Greeter, the style that 1.1's event listeners used everywhere. Reflection then acts like a JavaBeans tool: it creates a Person through its no-arg constructor, and calls `setName` and `setAge` by building the method names from property names.\n\nThe Person is serialized into a byte array and deserialized into an equal copy, the mechanism RMI uses to pass arguments. The last line formats a number for the en-IN locale with the 1.1 internationalization API NumberFormat, and adds 0.1 and 0.2 exactly with BigDecimal, also new in 1.1. JDBC and RMI need a database or a second JVM, so the topics explain them instead.",
    anim: [
      "1.1's event model with an inner class",
      [
        ["btn", "Button", "event source"],
        ["reg", "addListener", "registration"],
        ["lst", "anonymous class", "ActionListener"],
        ["outer", "outer object", "private state"],
      ],
      [
        ["lst", "reg", "register", "An anonymous inner class implementing the listener interface is registered."],
        ["btn", "lst", "event", "When the button is clicked, the source calls the listener's method."],
        ["lst", "outer", "access state", "The inner class reads and writes the outer object's private fields."],
        ["outer", "btn", "update UI", "The outer object reacts, for example by updating a label."],
        ["lst", "lst", "Java 8 lambda", "Java 8 replaces this anonymous class with a one-line lambda."],
      ],
    ],
    mistakes: [
      "Creating an inner class instance without an outer instance. You must write `outer.new Inner()`.",
      "Thinking reflection is free. It bypasses compile-time checks and is slower than direct calls.",
    ],
    qa: [
      [
        "Why do anonymous inner classes keep a reference to the outer instance?",
        "So that they can access its members. It also means they can keep the outer object alive, which is a common memory leak in listeners.",
      ],
      [
        "Which 1.1 APIs are still used directly today?",
        "JDBC, reflection, serialization (in legacy code), BigDecimal, BigInteger, Calendar (legacy), java.text and the Reader and Writer character streams.",
      ],
      [
        "What is the difference between a static nested class and an inner class?",
        "An inner class has an implicit reference to an instance of the outer class. A static nested class has none, and can be created on its own.",
      ],
    ],
    ex: [
      "Rewrite the anonymous Greeter as a lambda and as a method reference to a static method `static String greetFormally(String w)`.",
      "`Greeter polite = w -> \"Good day, \" + w;` and `Greeter formal = Main::greetFormally;`. Greeter is a functional interface (one abstract method), so both forms are allowed from Java 8.",
    ],
  }),

  lesson("Java 1.2 (1998): The Collections Framework, Swing, strictfp and Reference Objects", {
    intro:
      "J2SE 1.2 (December 1998) was such a large step that Sun rebranded the platform \"Java 2\", with three editions: J2SE, J2EE and J2ME. This lesson covers its headline additions:\n\n- the **Collections Framework**, which replaced ad-hoc use of Vector and Hashtable\n- **Swing**\n- the `strictfp` keyword\n- weak, soft and phantom references\n- the JIT compiler as standard\n- the policy-based security model\n\nThe program uses the framework's interfaces and algorithms.",
    topics: [
      [
        "The Collections Framework",
        "Java 1.2 introduced a unified architecture:\n\n- **interfaces**: Collection, List, Set, SortedSet, Map and SortedMap\n- **implementations**: ArrayList, LinkedList, HashSet, TreeSet, HashMap and TreeMap\n- **algorithms** in the `Collections` and `Arrays` utility classes: sort, binarySearch, reverse, shuffle, min, max, unmodifiable and synchronized wrappers\n- `Iterator`, `ListIterator`, `Comparable` and `Comparator`\n\nVector and Hashtable were retrofitted to implement List and Map, and became \"legacy\". You now program against interfaces (`List list = new ArrayList();`) and can swap the implementation.",
        "List list = new ArrayList();      // program to the interface (pre-generics)\nCollections.sort(list);\nMap map = new TreeMap();           // sorted keys",
      ],
      [
        "Swing",
        "Swing (`javax.swing`) is a GUI toolkit written **entirely in Java**, drawn by Java itself rather than by native widgets as in AWT. It has pluggable look-and-feels, rich components (JTable, JTree), and an MVC-style design. It made cross-platform desktop applications practical, including NetBeans and IntelliJ IDEA. It is still part of the JDK.",
      ],
      [
        "strictfp",
        "The `strictfp` modifier on classes and methods forced floating-point calculations to follow strict IEEE 754 semantics, so results were bit-for-bit identical on every platform. Without it, some CPUs (x87) could use extended precision for intermediate results. **Java 17 (JEP 306) made all floating point strict again**, so `strictfp` is now redundant and produces a warning.",
      ],
      [
        "Reference objects",
        "`java.lang.ref` added **SoftReference**, which the GC clears only under memory pressure and which suits caches, **WeakReference**, cleared at the next GC once only weakly reachable, as used by WeakHashMap (also 1.2), and **PhantomReference**, which tracks reclamation for cleanup. A **ReferenceQueue** delivers the cleared references. Programs could cooperate with the garbage collector for the first time.",
      ],
      [
        "JIT, the security model and other additions",
        "Sun's **JIT compiler** shipped as standard, and the HotSpot JVM followed as an add-on before becoming the default in 1.3. The **fine-grained security architecture** introduced policy files, permissions, protection domains and AccessController. It was later deprecated with the Security Manager in 17 and permanently disabled in 24. Also new: Java Plug-in, Java IDL/CORBA (removed in 11), the Java Sound groundwork, and `ThreadLocal`.",
      ],
    ],
    code: String.raw`import java.lang.ref.*;
import java.util.*;

public class Main {
    // Comparable (1.2): natural ordering for TreeSet and Collections.sort.
    static class Version implements Comparable<Version> {
        final int major, minor;
        Version(int major, int minor) { this.major = major; this.minor = minor; }
        public int compareTo(Version o) { return major != o.major ? Integer.compare(major, o.major) : Integer.compare(minor, o.minor); }
        public String toString() { return major + "." + minor; }
    }

    public static void main(String[] args) throws Exception {
        // Interfaces + implementations + algorithms.
        List<Version> releases = new ArrayList<>(List.of(new Version(1, 4), new Version(1, 0), new Version(1, 2), new Version(1, 1)));
        Collections.sort(releases);                                   // natural order
        System.out.println("Collections.sort " + releases + ", binarySearch(1.2) -> index " + Collections.binarySearch(releases, new Version(1, 2))
                + ", max " + Collections.max(releases));

        // A Comparator (1.2) for a different order, and an unmodifiable view (1.2).
        List<Version> newestFirst = new ArrayList<>(releases);
        newestFirst.sort(new Comparator<Version>() { public int compare(Version a, Version b) { return b.compareTo(a); } });
        List<Version> readOnly = Collections.unmodifiableList(newestFirst);
        try { readOnly.add(new Version(9, 9)); } catch (UnsupportedOperationException e) { System.out.println("Comparator order " + readOnly + ", unmodifiableList rejects add"); }

        // Set and Map implementations.
        Set<String> tags = new TreeSet<>(Arrays.asList("swing", "collections", "jit", "collections"));
        Map<String, Integer> lengths = new HashMap<>();
        for (Iterator<String> it = tags.iterator(); it.hasNext(); ) { String t = it.next(); lengths.put(t, t.length()); }   // Iterator (1.2)
        System.out.println("TreeSet " + tags + ", HashMap size " + lengths.size() + ", TreeMap " + new TreeMap<>(lengths));

        // Legacy classes retrofitted into the framework.
        System.out.println("Vector is a List: " + (new Vector<>() instanceof List) + ", Hashtable is a Map: " + (new Hashtable<>() instanceof Map));

        // Reference objects (1.2).
        WeakReference<Object> weak = new WeakReference<>(new Object());
        SoftReference<byte[]> soft = new SoftReference<>(new byte[1024]);
        for (int i = 0; i < 10 && weak.get() != null; i++) { System.gc(); Thread.sleep(20); }
        System.out.println("after GC: weak cleared " + (weak.get() == null) + ", soft kept " + (soft.get() != null));

        // ThreadLocal (1.2).
        ThreadLocal<String> name = ThreadLocal.withInitial(() -> Thread.currentThread().getName());
        System.out.println("ThreadLocal on main -> " + name.get());
    }
}`,
    walk:
      "Version implements Comparable, so `Collections.sort` orders the releases 1.0, 1.1, 1.2, 1.4, `binarySearch` finds 1.2 at index 2, and `Collections.max` returns 1.4. A Comparator written as an anonymous class sorts newest first, and `Collections.unmodifiableList` wraps the result in a read-only view that rejects `add`.\n\nA TreeSet removes the duplicate tag and sorts the rest. An explicit Iterator fills a HashMap of tag lengths. The program also confirms that Vector and Hashtable were retrofitted into List and Map. A WeakReference is cleared by GC while a SoftReference survives, because memory is not low. A ThreadLocal is initialised per thread. The code uses generics for readability, but every class and algorithm shown was introduced in 1.2.",
    anim: [
      "The 1.2 Collections Framework",
      [
        ["ifc", "interfaces", "List, Set, Map"],
        ["impl", "implementations", "ArrayList ..."],
        ["algo", "Collections", "sort, max ..."],
        ["iter", "Iterator", "uniform traversal"],
        ["legacy", "Vector, Hasht.", "retrofitted"],
      ],
      [
        ["ifc", "impl", "implemented by", "ArrayList, LinkedList, HashSet, TreeSet, HashMap and TreeMap implement the interfaces."],
        ["algo", "ifc", "works on", "Collections.sort and binarySearch accept any List: code once, reuse everywhere."],
        ["impl", "iter", "iterator()", "Every collection hands out an Iterator with hasNext, next and remove."],
        ["legacy", "ifc", "retrofit", "Vector became a List and Hashtable a Map, so old code could join in."],
        ["ifc", "algo", "Comparable", "Comparable and Comparator decide the order the algorithms use."],
      ],
    ],
    varies: true,
    mistakes: [
      "Declaring variables with implementation types (`ArrayList list`) instead of interfaces (`List list`).",
      "Using `strictfp` in new code. All floating point has been strict since Java 17.",
    ],
    qa: [
      [
        "Why was 1.2 called \"Java 2\"?",
        "The changes were large enough (collections, Swing, security) that Sun rebranded it as the Java 2 Platform, with J2SE, J2EE and J2ME. The \"2\" stayed until Java 6 dropped it.",
      ],
      [
        "Who designed the Collections Framework?",
        "Joshua Bloch, who later wrote Effective Java.",
      ],
      [
        "Is Swing still supported?",
        "Yes. It ships with every JDK and receives fixes. JavaFX, now OpenJFX, is a separate download.",
      ],
    ],
    ex: [
      "Using only 1.2-era APIs (no generics, no for-each), print the elements of a TreeSet of Strings in reverse order.",
      "Copy them into a list and reverse it: `List list = new ArrayList(set); Collections.reverse(list); for (Iterator it = list.iterator(); it.hasNext(); ) System.out.println(it.next());`. `descendingIterator()` would be shorter, but NavigableSet did not arrive until Java 6.",
    ],
  }),

  lesson("Java 1.3 (2000) and 1.4 (2002): HotSpot, Dynamic Proxies, assert, NIO, Regex and Logging", {
    intro:
      "J2SE 1.3 (May 2000, \"Kestrel\") made the **HotSpot JVM** the default and added **dynamic proxies**. J2SE 1.4 (February 2002, \"Merlin\") was the first release developed through the Java Community Process. It added:\n\n- the `assert` keyword\n- **NIO** with buffers, channels and selectors\n- **regular expressions**\n- **exception chaining**\n- the logging API\n- XML processing\n- LinkedHashMap\n\nThe program demonstrates each one.",
    topics: [
      [
        "1.3: HotSpot becomes the default JVM",
        "HotSpot uses **adaptive optimisation**. It interprets code first, profiles it to find the hot spots, and compiles only those to highly optimised machine code. That gave Java performance competitive with C++ for long-running server code. It is still the JVM inside OpenJDK today, now with tiered C1 and C2 compilation, and Graal as an option. 1.3 also brought **JNDI**, **RMI over IIOP** (CORBA interoperability), the Java Sound API, and `java.util.Timer`.",
      ],
      [
        "1.3: Dynamic proxies",
        "`java.lang.reflect.Proxy.newProxyInstance(loader, interfaces, handler)` creates, **at runtime**, a class implementing the given interfaces, which routes every call to an `InvocationHandler`. It enables generic cross-cutting behaviour (logging, transactions, security, remote calls and mocking) without writing a class per interface. Spring AOP, JDK-based mock libraries, and RMI and EJB stubs all build on it.",
        "Greeter g = (Greeter) Proxy.newProxyInstance(loader, new Class<?>[] {Greeter.class},\n    (proxy, method, args) -> \"intercepted \" + method.getName());",
      ],
      [
        "1.4: assert",
        "`assert condition : message;` checks an internal invariant, and throws AssertionError if it is false. Assertions are **disabled by default** and enabled with `java -ea` (or `-ea:com.mypkg...`). So they cost nothing in production, and must never contain side effects or replace argument validation in public APIs. They document assumptions and catch bugs during testing.",
      ],
      [
        "1.4: NIO (New I/O)",
        "`java.nio` adds:\n\n- **Buffers** (ByteBuffer, CharBuffer and others), including **direct** buffers outside the heap\n- **Channels** (FileChannel, SocketChannel), with bulk transfers and memory-mapped files\n- **Selectors** for **non-blocking I/O**, where one thread multiplexes thousands of connections\n- **charsets** for encoding and decoding\n\nNIO made scalable servers possible in Java, through Netty, Jetty and Tomcat's NIO connector. File system work moved to NIO.2 in Java 7.",
      ],
      [
        "1.4: Regular expressions",
        "`java.util.regex` (Pattern and Matcher) brought Perl-style regular expressions: character classes, quantifiers, groups, backreferences, lookarounds and flags. String gained `matches`, `replaceAll`, `replaceFirst` and `split`. Before 1.4, Java developers needed third-party libraries such as Jakarta ORO.",
      ],
      [
        "1.4: Exception chaining, logging, XML and more",
        "- **Exception chaining**: `new Exception(message, cause)`, `getCause()` and `initCause()`. Stack traces print \"Caused by:\", so wrapped exceptions keep their root cause.\n- **`java.util.logging`**: Logger, Handler, Level and Formatter.\n- **JAXP**: DOM, SAX and XSLT for XML.\n- The **Preferences API**.\n- **`LinkedHashMap` and `LinkedHashSet`**, collections with insertion order.\n- `StackTraceElement`, for reading stack traces programmatically.\n- Image I/O, and IPv6 support.\n- `CharSequence` and `String.split`.",
      ],
    ],
    code: String.raw`import java.lang.reflect.*;
import java.nio.*;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.logging.*;
import java.util.regex.*;

public class Main {
    interface Service { String fetch(String id); int count(); }

    public static void main(String[] args) throws Exception {
        // 1.3 dynamic proxy: one handler intercepts every interface method.
        List<String> calls = new ArrayList<>();
        Service real = new Service() { public String fetch(String id) { return "item-" + id; } public int count() { return 3; } };
        Service logged = (Service) Proxy.newProxyInstance(Service.class.getClassLoader(), new Class<?>[] {Service.class},
                (proxy, method, a) -> { calls.add(method.getName()); return method.invoke(real, a); });
        System.out.println("1.3 proxy result " + logged.fetch("7") + ", count " + logged.count() + ", intercepted " + calls);

        // 1.4 assert: disabled unless the JVM runs with -ea.
        boolean enabled = false;
        assert enabled = true;                         // assignment only happens when assertions are on
        System.out.println("1.4 assertions enabled in this run: " + enabled + " (use java -ea to enable)");

        // 1.4 NIO: buffers and a FileChannel.
        Path file = Files.createTempFile("nio", ".bin");
        try (FileChannel ch = FileChannel.open(file, StandardOpenOption.WRITE, StandardOpenOption.READ)) {
            ByteBuffer out = ByteBuffer.allocate(16);
            out.putInt(2002).putDouble(1.4).flip();      // write mode -> read mode
            ch.write(out);
            ByteBuffer in = ByteBuffer.allocate(16);
            ch.read(in, 0);
            in.flip();
            System.out.println("1.4 NIO wrote and read back int " + in.getInt() + " and double " + in.getDouble() + " (" + ch.size() + " bytes)");
        }
        ByteBuffer encoded = StandardCharsets.UTF_8.encode("é");
        System.out.println("1.4 charset: 'é' encodes to " + encoded.remaining() + " UTF-8 bytes");

        // 1.4 regex.
        Matcher m = Pattern.compile("J2SE (\\d)\\.(\\d)").matcher("J2SE 1.3 and J2SE 1.4");
        List<String> found = new ArrayList<>();
        while (m.find()) found.add(m.group(1) + "." + m.group(2));
        System.out.println("1.4 regex found " + found + ", split " + Arrays.toString("a,b;;c".split("[,;]+")));

        // 1.4 exception chaining.
        try {
            try { Integer.parseInt("x"); } catch (NumberFormatException e) { throw new IllegalStateException("config invalid", e); }
        } catch (IllegalStateException e) {
            System.out.println("1.4 chained: " + e.getMessage() + " <- caused by " + e.getCause().getClass().getSimpleName());
        }

        // 1.4 logging to a custom handler.
        Logger log = Logger.getLogger("demo");
        log.setUseParentHandlers(false);
        List<String> records = new ArrayList<>();
        log.addHandler(new Handler() {
            public void publish(LogRecord r) { records.add(r.getLevel() + ": " + r.getMessage()); }
            public void flush() { } public void close() { }
        });
        log.info("started"); log.warning("disk 90% full"); log.fine("not logged at default level");
        System.out.println("1.4 logging captured " + records);

        // 1.4 LinkedHashMap keeps insertion order.
        Map<String, Integer> lhm = new LinkedHashMap<>();
        lhm.put("zeta", 1); lhm.put("alpha", 2);
        System.out.println("1.4 LinkedHashMap order " + lhm.keySet());
    }
}`,
    walk:
      "The 1.3 dynamic proxy implements Service at runtime. Every call goes through one InvocationHandler, which records the method name and forwards the call to the real object. `assert enabled = true` performs the assignment only when assertions are enabled, so in a normal run it prints false, which proves that assertions are off by default.\n\nThe NIO block writes an int and a double into a ByteBuffer, flips it from writing to reading mode, writes it through a FileChannel, and reads it back. A charset encodes é into two UTF-8 bytes. The regex finds both version numbers with capture groups, and `split` takes a character-class pattern. The chained exception keeps its NumberFormatException cause. A custom logging Handler captures INFO and WARNING, while FINE is below the default level. LinkedHashMap preserves insertion order.",
    anim: [
      "A dynamic proxy call",
      [
        ["client", "client code", "logged.fetch(7)"],
        ["proxy", "$Proxy class", "made at runtime"],
        ["handler", "InvocHandler", "one method"],
        ["real", "real Service", "target"],
      ],
      [
        ["client", "proxy", "fetch(\"7\")", "The client calls an ordinary interface method on the proxy."],
        ["proxy", "handler", "invoke(...)", "The generated class forwards every call to handler.invoke with a Method object."],
        ["handler", "handler", "log name", "Cross-cutting work happens here: logging, timing, security, transactions."],
        ["handler", "real", "method.invoke", "The handler calls the real implementation reflectively."],
        ["real", "client", "item-7", "The result flows back through the proxy to the client."],
      ],
    ],
    mistakes: [
      "Putting side effects (or required checks) in `assert` statements. They are skipped unless `-ea` is set.",
      "Forgetting `buffer.flip()` between writing and reading a ByteBuffer.",
      "Losing the root cause by wrapping exceptions without passing the original as `cause`.",
    ],
    qa: [
      [
        "Can a JDK dynamic proxy implement a class rather than an interface?",
        "No. `java.lang.reflect.Proxy` works only with interfaces. Libraries such as ByteBuddy or CGLIB generate subclasses to proxy classes.",
      ],
      [
        "Why are NIO selectors important?",
        "One thread can watch thousands of non-blocking channels and service only those that are ready. Before Loom's virtual threads, that was the only way to build highly concurrent Java servers.",
      ],
      [
        "What does `-ea` vs `-da` do?",
        "`-ea` enables assertions (optionally per package or class), and `-da` disables them. `-esa` enables them in system classes.",
      ],
    ],
    ex: [
      "Write a dynamic proxy that measures and prints how long each method of any interface takes.",
      "`(T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[] {type}, (p, m, a) -> { long t = System.nanoTime(); try { return m.invoke(target, a); } finally { System.out.println(m.getName() + \" took \" + (System.nanoTime() - t) + \" ns\"); } })`, wrapped in a generic `static <T> T timed(Class<T> type, T target)` method.",
    ],
  }),

  lesson("Java 5 (2004): Generics, Annotations, Enums, Autoboxing, Varargs, for-each and java.util.concurrent", {
    intro:
      "J2SE 5.0 (September 2004, \"Tiger\") was the biggest language update between 1.0 and Java 8. The version number jumped from 1.4 to 5 to signal the size of the change. It added:\n\n- generics\n- annotations\n- enums\n- autoboxing\n- varargs\n- the enhanced for loop\n- static imports\n- the new Java Memory Model\n- the `java.util.concurrent` library\n- StringBuilder, Scanner and printf\n\nThe program uses every one of them.",
    topics: [
      [
        "Generics",
        "Type parameters for classes, interfaces and methods: `List<String>`, `Map<K, V>` and `<T extends Comparable<T>> T max(List<T>)`. They give **compile-time type safety** and remove casts. Generics are implemented by **type erasure**, so `List<String>` is a plain `List` at runtime, which kept compatibility with pre-5 code (raw types). Wildcards (`? extends`, `? super`) and bounded types followed the PECS rules.",
        "List<String> names = new ArrayList<String>();\nnames.add(\"Duke\");\nString first = names.get(0);   // no cast",
      ],
      [
        "Annotations",
        "Annotations attach **metadata** to code: `@Override`, `@Deprecated` and `@SuppressWarnings` are built in, and custom annotations are declared with `@interface`, using a retention policy (SOURCE, CLASS or RUNTIME) and targets. They can be read by the compiler, by annotation processors (Java 6), or through reflection at runtime. They transformed Java frameworks: JUnit's `@Test`, JPA's `@Entity`, and Spring's `@Autowired` replaced XML configuration.",
      ],
      [
        "Enums",
        "`enum` defines a **type-safe set of constants**, which are full classes. Enums can have fields, constructors, methods, constant-specific bodies and interfaces. They work in switch, have `values()`, `valueOf()`, `ordinal()` and `name()`, are singletons per constant, and are serialization-safe. `EnumSet` and `EnumMap` give compact, fast collections. They replaced error-prone `int` constants.",
      ],
      [
        "Autoboxing, varargs, for-each and static import",
        "- **Autoboxing and unboxing**: automatic conversion between primitives and wrappers (`list.add(5)`, `int x = map.get(k)`). It uses the Integer cache for -128 to 127. Unboxing null throws an NPE.\n- **Varargs**: `String.format(String fmt, Object... args)`. The arguments arrive as an array.\n- **Enhanced for loop**: `for (String s : list)` over arrays and Iterables.\n- **Static import**: `import static java.lang.Math.*;` lets you write `sqrt(2)` without the class name.",
      ],
      [
        "java.util.concurrent and the new memory model",
        "Doug Lea's JSR 166 added:\n\n- **Executors** and thread pools, with `Callable` and `Future`\n- **ConcurrentHashMap**, CopyOnWriteArrayList and BlockingQueues\n- **locks** (ReentrantLock, ReadWriteLock and Condition)\n- **atomic** classes\n- CountDownLatch, CyclicBarrier, Semaphore and Exchanger\n\n**JSR 133** rewrote the **Java Memory Model**: precise happens-before rules, and fixed semantics for `volatile` (which now also orders surrounding writes) and `final` fields (safe publication). This made double-checked locking with volatile correct.",
      ],
      [
        "StringBuilder, Scanner, printf and more",
        "- **StringBuilder**: an unsynchronized and faster StringBuffer.\n- **Scanner**: parses input with `nextInt` and `nextLine`.\n- **Formatter, `String.format` and `System.out.printf`**: C-style formatting.\n- `Arrays.toString`, `Arrays.deepToString` and `Arrays.hashCode`.\n- `Queue` and `PriorityQueue`.\n- `java.lang.instrument` for Java agents.\n- `ProcessBuilder`.\n- `System.nanoTime()`.\n- The `UUID` class.",
      ],
    ],
    code: String.raw`import java.lang.annotation.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static java.lang.Math.max;                      // static import

public class Main {

    // Annotation with runtime retention.
    @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
    @interface Benchmark { int runs() default 1; }

    // Enum with a field, constructor and constant-specific behaviour.
    enum Operation {
        PLUS("+") { int apply(int a, int b) { return a + b; } },
        TIMES("*") { int apply(int a, int b) { return a * b; } };
        final String symbol;
        Operation(String symbol) { this.symbol = symbol; }
        abstract int apply(int a, int b);
    }

    // Generic method with a bounded type parameter.
    static <T extends Comparable<T>> T largest(List<T> items) {
        T best = items.get(0);
        for (T item : items) if (item.compareTo(best) > 0) best = item;   // enhanced for loop
        return best;
    }

    // Varargs.
    static int sum(int... values) { int s = 0; for (int v : values) s += v; return s; }

    @Benchmark(runs = 3)
    static void annotatedTask() { }

    public static void main(String[] args) throws Exception {
        // Generics + autoboxing.
        List<Integer> scores = new ArrayList<Integer>();
        scores.add(42); scores.add(7); scores.add(99);          // ints boxed to Integer
        int top = largest(scores);                              // unboxed
        System.out.println("generics + autoboxing: largest " + top + ", Integer cache 127==127 " + (Integer.valueOf(127) == Integer.valueOf(127)));

        // Enums with behaviour, EnumMap.
        EnumMap<Operation, Integer> results = new EnumMap<>(Operation.class);
        for (Operation op : Operation.values()) results.put(op, op.apply(6, 7));
        System.out.println("enum constant bodies " + results + ", TIMES symbol " + Operation.TIMES.symbol + ", valueOf " + Operation.valueOf("PLUS").ordinal());

        // Varargs + static import.
        System.out.println("varargs sum(1,2,3,4) = " + sum(1, 2, 3, 4) + ", static import max(3, 9) = " + max(3, 9));

        // Annotations read through reflection.
        Benchmark b = Main.class.getDeclaredMethod("annotatedTask").getAnnotation(Benchmark.class);
        System.out.println("annotation @Benchmark(runs=" + b.runs() + ")");

        // java.util.concurrent: executor, Callable/Future, ConcurrentHashMap, AtomicInteger, CountDownLatch.
        ExecutorService pool = Executors.newFixedThreadPool(3);
        ConcurrentHashMap<String, Integer> wordCounts = new ConcurrentHashMap<>();
        AtomicInteger tasks = new AtomicInteger();
        CountDownLatch done = new CountDownLatch(3);
        for (String text : new String[] {"tiger tiger", "java tiger", "java"}) {
            pool.execute(() -> {
                for (String w : text.split(" ")) wordCounts.merge(w, 1, Integer::sum);
                tasks.incrementAndGet();
                done.countDown();
            });
        }
        done.await();
        Future<String> f = pool.submit(new Callable<String>() { public String call() { return "callable result"; } });
        System.out.println("concurrent: counts " + new TreeMap<>(wordCounts) + ", tasks " + tasks.get() + ", " + f.get());
        pool.shutdown();

        // StringBuilder, printf, Scanner.
        StringBuilder sb = new StringBuilder("tiger");
        Scanner sc = new Scanner("5 cats");
        int n = sc.nextInt();
        System.out.printf("printf: %s reversed is %s, scanned %d then '%s'%n", sb.toString(), sb.reverse(), n, sc.next());
    }
}`,
    walk:
      "Integers are boxed automatically when added to a generic `List<Integer>`, and unboxed when the bounded generic `largest` method returns its result, 99. The Operation enum gives each constant its own `apply` body. An EnumMap stores 6+7 and 6×7 in declaration order. `sum(int...)` accepts any number of arguments, and `max` is used through a static import. Reflection reads `@Benchmark(runs = 3)` from a method at runtime.\n\nThe concurrency block runs three word-count tasks on a fixed pool. ConcurrentHashMap's atomic merge produces exact counts, AtomicInteger counts the tasks, and a CountDownLatch waits for all three. A Callable is then submitted and its Future read. Finally printf formats a StringBuilder before and after `reverse()`. The arguments are evaluated left to right, so `sb.toString()` captures \"tiger\" before `reverse()` changes the builder. A Scanner parses an int and a word from a string. Lambdas and `merge` are used for brevity; they are Java 8 features.",
    anim: [
      "Generics and type erasure (Java 5)",
      [
        ["src", "List<Integer>", "source code"],
        ["check", "javac checks", "type safety"],
        ["erase", "erasure", "raw List + casts"],
        ["box", "autoboxing", "int <-> Integer"],
        ["run", "runtime", "plain ArrayList"],
      ],
      [
        ["src", "check", "add(\"x\")?", "javac rejects adding a String to a List<Integer>: the error is caught at compile time."],
        ["src", "box", "add(42)", "The int 42 is boxed with Integer.valueOf(42) automatically."],
        ["check", "erase", "compile", "Type arguments are erased; the compiler inserts the casts."],
        ["erase", "run", "load", "At runtime the list is a plain ArrayList, compatible with pre-Java-5 code."],
        ["run", "box", "get(0)", "Reading unboxes Integer back to int; a null here would throw NullPointerException."],
      ],
    ],
    mistakes: [
      "Comparing boxed Integers with `==` outside the cached range.",
      "Mixing raw types with generics, which turns compile-time errors into runtime ClassCastExceptions.",
      "Using int constants instead of enums for fixed sets of values.",
    ],
    qa: [
      [
        "Why did Java 5 use type erasure instead of reified generics?",
        "Migration compatibility: existing libraries and JVMs had to keep working with code that used raw collections. Erasure let generic and non-generic code interoperate without changing the JVM.",
      ],
      [
        "Why is the release called 5.0 and not 1.5?",
        "Marketing reflected the size of the change. Internally the version string was still 1.5.0, and the \"1.\" prefix disappeared only with Java 9's new version scheme.",
      ],
      [
        "What did JSR 133 fix about volatile?",
        "Under the old memory model, volatile writes could be reordered with ordinary writes, so it could not be used to publish objects safely. JSR 133 made volatile writes and reads act as release and acquire barriers (happens-before).",
      ],
    ],
    ex: [
      "Add a MINUS constant to Operation and a static method `Operation fromSymbol(String s)` that finds the constant by its symbol.",
      "`MINUS(\"-\") { int apply(int a, int b) { return a - b; } },` and `static Operation fromSymbol(String s) { for (Operation op : values()) if (op.symbol.equals(s)) return op; throw new IllegalArgumentException(s); }`.",
    ],
  }),

  lesson("Java 6 (2006): Scripting, the Compiler API, JDBC 4, Annotation Processing and NavigableMap", {
    intro:
      "Java SE 6 (December 2006, \"Mustang\") had no new language syntax, but it brought major platform improvements:\n\n- the scripting API (JSR 223)\n- the Java Compiler API\n- JDBC 4.0 with automatic driver loading\n- pluggable annotation processing\n- the `Deque` and `NavigableMap` and `NavigableSet` collections\n- web services (JAX-WS) and JAXB in the JDK\n- big HotSpot performance gains\n\nIt dropped the \"2\" from the platform name. The program compiles Java source at runtime and uses the new collections.",
    topics: [
      [
        "The scripting API (JSR 223)",
        "`javax.script` lets Java host scripting languages through a `ScriptEngineManager`. You look up an engine by name, `eval` scripts, and exchange variables through bindings. Java 6 bundled Mozilla's **Rhino** JavaScript engine, Java 8 replaced it with **Nashorn**, and Nashorn was removed in Java 15. Today you plug in GraalJS, Groovy, JRuby or Jython through the same API.",
      ],
      [
        "The Java Compiler API",
        "`javax.tools.ToolProvider.getSystemJavaCompiler()` exposes **javac as a library**. Programs can compile source code at runtime, with diagnostics, in-memory file managers and options. IDEs, build tools, template engines, JShell and the single-file source launcher (Java 11) build on it. The program in this lesson uses it to compile and load a class while running.",
      ],
      [
        "JDBC 4.0",
        "Drivers now register themselves through `META-INF/services/java.sql.Driver` (the ServiceLoader mechanism), so the old `Class.forName(\"com.mysql.jdbc.Driver\")` became unnecessary. JDBC 4 also added `SQLXML`, `RowId`, `NClob`, the exception subclasses `SQLTransientException`, `SQLNonTransientException` and `SQLRecoverableException`, and the wrapper pattern (`unwrap`). Java DB (Apache Derby) was bundled with the JDK until Java 9.",
      ],
      [
        "Pluggable annotation processing (JSR 269)",
        "The `javax.annotation.processing` API lets **processors run inside javac**. They inspect annotated elements and **generate new source files** at compile time. Lombok, MapStruct, Dagger, Immutables and JPA metamodels rely on it, and it replaced the separate `apt` tool of Java 5. Processing is round-based: generated sources are processed in the next round.",
      ],
      [
        "Collections: Deque, ArrayDeque, NavigableMap and NavigableSet",
        "- **Deque** (double-ended queue) with **ArrayDeque**: a fast, resizable array, and the recommended stack and queue (instead of Stack and LinkedList).\n- **NavigableMap** and **NavigableSet**, implemented by TreeMap, TreeSet and the new **ConcurrentSkipListMap** and **ConcurrentSkipListSet**: `floor`, `ceiling`, `higher` and `lower`, `pollFirst` and `pollLast`, `descendingMap` and `descendingSet`, and inclusive or exclusive `subMap`, `headMap` and `tailMap`.\n- `Arrays.copyOf` and `copyOfRange`.\n- `LinkedBlockingDeque`.",
      ],
      [
        "Desktop, web services and performance",
        "- `java.awt.Desktop`: open a browser, a mail client or a file.\n- The splash screen and system tray APIs.\n- **JAX-WS** and **JAXB** bundled, then removed in 11.\n- `@Override` allowed on interface implementations.\n- `java.io.Console`.\n- `String.isEmpty()`.\n- `ServiceLoader`.\n- HotSpot gains: biased locking, a parallel compacting old generation, and lock coarsening.\n\nThe OpenJDK project was launched in 2006 and 2007, and OpenJDK 6 became the first open-source Java SE.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.net.URI;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.ConcurrentSkipListMap;
import javax.tools.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // Java Compiler API: compile a class from a String at runtime, then load and run it.
        String source = "public class Generated { public static String hello() { return \"compiled at runtime by javax.tools\"; } }";
        Path dir = Files.createTempDirectory("gen");
        Path file = dir.resolve("Generated.java");
        Files.writeString(file, source);
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        try (StandardJavaFileManager fm = compiler.getStandardFileManager(diagnostics, null, null)) {
            boolean ok = compiler.getTask(null, fm, diagnostics, List.of("-d", dir.toString()), null, fm.getJavaFileObjects(file)).call();
            try (java.net.URLClassLoader loader = new java.net.URLClassLoader(new java.net.URL[] {dir.toUri().toURL()})) {
                Object result = loader.loadClass("Generated").getMethod("hello").invoke(null);
                System.out.println("Compiler API: success " + ok + ", " + result);
            }
        }

        // ServiceLoader (6): how JDBC 4 finds drivers without Class.forName.
        long compilers = ServiceLoader.load(javax.tools.Tool.class).stream().count();
        System.out.println("ServiceLoader found Tool providers: " + (compilers >= 0) + " (JDBC 4 drivers are discovered the same way)");

        // Deque as stack and queue.
        Deque<String> deque = new ArrayDeque<>();
        deque.push("b"); deque.push("a");              // stack: a on top
        deque.offerLast("z");                          // queue end
        System.out.println("ArrayDeque " + deque + ", pop " + deque.pop() + ", pollLast " + deque.pollLast());

        // NavigableMap / NavigableSet.
        NavigableMap<Integer, String> grades = new TreeMap<>(Map.of(90, "A", 75, "B", 60, "C", 40, "D"));
        System.out.println("NavigableMap floorEntry(82) " + grades.floorEntry(82) + ", ceilingKey(61) " + grades.ceilingKey(61)
                + ", headMap(75, inclusive) " + grades.headMap(75, true) + ", descending " + grades.descendingMap());
        NavigableSet<String> words = new TreeSet<>(List.of("mustang", "tiger", "dolphin", "kestrel"));
        System.out.println("NavigableSet higher(\"mustang\") " + words.higher("mustang") + ", pollFirst " + words.pollFirst() + ", left " + words);

        // ConcurrentSkipListMap (6): a concurrent NavigableMap.
        ConcurrentSkipListMap<Long, String> events = new ConcurrentSkipListMap<>(Map.of(300L, "c", 100L, "a", 200L, "b"));
        System.out.println("ConcurrentSkipListMap firstKey " + events.firstKey() + ", tailMap(200) " + events.tailMap(200L));

        // Small Java 6 additions.
        System.out.println("String.isEmpty: " + "".isEmpty() + ", Arrays.copyOfRange " + Arrays.toString(Arrays.copyOfRange(new int[] {1, 2, 3, 4}, 1, 3))
                + ", Console available: " + (System.console() != null ? "yes" : "no (output is redirected)"));
    }
}`,
    walk:
      "The program writes Java source for a class named Generated into a temporary directory. It compiles it with `ToolProvider.getSystemJavaCompiler()` (the Java 6 Compiler API), loads the compiled class through a URLClassLoader, and calls its static method reflectively. Generating and running code at runtime is how template engines, rule engines and JShell work. A ServiceLoader lookup illustrates the mechanism JDBC 4 uses to discover drivers.\n\nArrayDeque serves as both a stack (`push` and `pop`) and a queue (`offerLast` and `pollLast`). The NavigableMap of grades answers floor, ceiling, head-map and descending queries. NavigableSet finds the next higher word, and removes the first one. ConcurrentSkipListMap offers the same navigation for concurrent code. The last line samples small Java 6 additions. `System.console()` is null when the output is redirected, as it is in this build.",
    anim: [
      "Compiling code at runtime with javax.tools",
      [
        ["src", "source string", "Generated.java"],
        ["javac", "JavaCompiler", "ToolProvider"],
        ["cls", "Generated.class", "temp directory"],
        ["loader", "URLClassLoader", "load class"],
        ["call", "reflection", "invoke hello()"],
      ],
      [
        ["src", "javac", "getTask(...)", "The source file is handed to the system compiler with output options."],
        ["javac", "cls", "call()", "javac compiles in-process; diagnostics are collected instead of printed."],
        ["cls", "loader", "loadClass", "A class loader pointing at the output directory defines the new class."],
        ["loader", "call", "getMethod", "Reflection finds the static method on the freshly defined class."],
        ["call", "src", "result", "The method runs and returns its message to the host program."],
      ],
    ],
    mistakes: [
      "Still writing `Class.forName(driver)` for JDBC 4+ drivers. It is harmless, but unnecessary.",
      "Using Stack or LinkedList as a stack or queue instead of ArrayDeque.",
      "Expecting `ToolProvider.getSystemJavaCompiler()` on a JRE-only image. It returns null without the jdk.compiler module.",
    ],
    qa: [
      [
        "Why did Java 6 matter for open source?",
        "Sun announced OpenJDK in 2006, and released most of the JDK under GPLv2 with the Classpath Exception. OpenJDK 6 and 7 led to the vendor ecosystem we have today.",
      ],
      [
        "What is the difference between floorKey and lowerKey?",
        "`floorKey(k)` returns the greatest key that is less than or equal to k. `lowerKey(k)` returns the greatest key strictly less than k. `ceilingKey` and `higherKey` mirror them.",
      ],
      [
        "Who uses annotation processing today?",
        "Lombok (with unusual tricks), MapStruct, Dagger, AutoValue, Immutables, Micronaut and Quarkus build-time DI, and the Hibernate JPA metamodel generator.",
      ],
    ],
    ex: [
      "Use a NavigableMap<LocalTime, String> of bus departures to find the next bus at or after a given time, wrapping to the first bus of the next day.",
      "`Map.Entry<LocalTime, String> next = departures.ceilingEntry(now); if (next == null) next = departures.firstEntry();`. ceilingEntry gives the first departure at or after `now`, and firstEntry wraps around past midnight.",
    ],
  }),
];
