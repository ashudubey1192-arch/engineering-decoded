import { lesson } from "../../schema.js";

export default [
  lesson("Core Java Q28-Q36: Exception Handling Questions", {
    intro:
      "Questions 28 to 36 are the exception-handling round. Does finally always run? What separates checked and unchecked exceptions? What are the five keywords? How do Exception and Error differ? When do you use throw vs throws? How does multi-catch compare with multiple catch blocks? How do final, finally and finalize differ? How does an exception propagate up the stack? And what are the best practices? The program demonstrates each one with labelled output.",
    topics: [
      [
        "Q28. Does finally always execute? When does it not?",
        "The finally block runs after try (and any catch) whether the try completed normally, returned, or threw an exception, even when the exception is not caught. It is skipped only when the JVM itself stops or the thread never leaves the try:\n\n- `System.exit()` or `Runtime.halt()` is called inside try or catch.\n- The JVM crashes or the process is killed (for example `kill -9`).\n- The thread loops forever or deadlocks inside try.\n- The machine loses power.\n- A daemon thread is still inside try when the JVM shuts down.\n\nIf finally contains its own `return`, that return overrides the try's return value and swallows any pending exception, which is why that style is discouraged.",
      ],
      [
        "Q29. What is the difference between checked and unchecked exceptions?",
        "**Checked exceptions** are subclasses of `Exception` that are not `RuntimeException`, such as IOException, SQLException and ClassNotFoundException. The compiler forces you to either catch them or declare them with `throws`. They represent recoverable conditions outside the program's control: a missing file, a network failure.\n\n**Unchecked exceptions** are `RuntimeException` and its subclasses, such as NullPointerException, ArithmeticException, IllegalArgumentException and IndexOutOfBoundsException. `Error` is unchecked too. The compiler does not force handling. They usually signal programming bugs that should be fixed rather than caught.",
      ],
      [
        "Q30. What are the five exception-handling keywords?",
        "- `try` encloses code that might throw.\n- `catch` handles a specific exception type thrown in the try. There can be several catch blocks, or one multi-catch.\n- `finally` always runs for cleanup.\n- `throw` raises one exception object explicitly: `throw new IllegalStateException(\"closed\")`.\n- `throws` appears in a method signature and declares the checked exceptions the method may pass to its caller: `void read() throws IOException`.\n\nJava 7 added try-with-resources, a form of `try` that closes resources automatically.",
      ],
      [
        "Q31. What is the difference between Exception and Error?",
        "Both extend `Throwable`. **Exception** represents conditions an application might reasonably catch and recover from (bad input, a missing file). **Error** represents serious problems in the JVM or its environment that an application usually cannot recover from: OutOfMemoryError, StackOverflowError, NoClassDefFoundError, ExceptionInInitializerError. Errors are unchecked. Catching them is legal but generally pointless, except at the top level to log before exiting.",
      ],
      [
        "Q32. What is the difference between throw and throws?",
        "`throw` is a **statement** inside a method body that throws one exception instance right now, and control leaves the method immediately. `throws` is a **clause** in the method declaration that lists exception types (comma separated) the method might throw, so callers know what to handle. `throw` is followed by an object (`throw new X()`), while `throws` is followed by class names (`throws X, Y`). Unchecked exceptions may be thrown without being declared. A checked exception that is thrown and not caught must be declared.",
      ],
      [
        "Q33. What is the difference between multiple catch blocks and multi-catch?",
        "With **multiple catch blocks**, each block handles one type with its own code, and the blocks must go from most specific to most general. Putting `catch (Exception e)` before `catch (IOException e)` is a compile error (unreachable code). **Multi-catch** (Java 7), `catch (IOException | SQLException e)`, shares one handler between unrelated types. The types in a multi-catch must not be subclasses of each other, and the variable `e` is implicitly final. Multi-catch removes duplicated handler code.",
      ],
      [
        "Q34. What is the difference between final, finally and finalize?",
        "`final` is a **keyword** that stops reassignment of a variable, overriding of a method, or extension of a class. `finally` is a **block** after try/catch that always runs, used for cleanup. `finalize()` was a **method** of Object that the garbage collector might call before reclaiming an object. It was unpredictable, slow and could even resurrect objects. It has been deprecated since Java 9 and marked for removal since Java 18. Use try-with-resources or `java.lang.ref.Cleaner` instead.",
      ],
      [
        "Q35. How does exception propagation work?",
        "When a method throws and does not catch, the JVM unwinds that frame and re-throws the exception in the caller at the call site. This repeats up the call stack until a matching catch is found. If the exception reaches the top of the thread's stack (for example out of `main`), the thread's uncaught-exception handler prints the stack trace and the thread terminates.\n\nUnchecked exceptions propagate automatically. Checked exceptions propagate only if every method on the way declares them with `throws`. Finally blocks run in each frame as it unwinds.",
      ],
      [
        "Q36. What are the best practices for exception handling?",
        "- Catch the most specific type you can handle, and never swallow exceptions with an empty catch.\n- Use try-with-resources for anything closeable.\n- Throw early (validate arguments) and catch late (where you can actually recover or report).\n- Wrap low-level exceptions in meaningful domain exceptions and keep the original as the cause: `new OrderException(\"...\", e)`.\n- Do not use exceptions for normal control flow.\n- Avoid returning from finally.\n- Log once, not at every layer.\n- Document thrown exceptions with `@throws`.\n- Prefer standard exceptions (IllegalArgumentException, IllegalStateException) when they fit.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {

    // Q32 + Q29: a checked exception must be declared with throws when not caught.
    static class InsufficientFundsException extends Exception {
        InsufficientFundsException(String message) { super(message); }
    }

    static void withdraw(int balance, int amount) throws InsufficientFundsException {
        if (amount > balance)
            throw new InsufficientFundsException("need " + amount + ", have " + balance); // throw = statement
    }

    // Q28: finally runs even after return; a return in finally would override it.
    static String tryReturn() {
        try {
            return "value from try";
        } finally {
            System.out.println("Q28 finally ran before the method returned");
        }
    }

    // Q35: c() throws, b() and a() do not catch, main does.
    static void a() { b(); }
    static void b() { c(); }
    static void c() { int[] data = new int[2]; data[5] = 1; }   // ArrayIndexOutOfBoundsException

    // Q36: wrap a low-level exception and keep it as the cause.
    static class ConfigException extends RuntimeException {
        ConfigException(String message, Throwable cause) { super(message, cause); }
    }

    static String loadConfig(String file) {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {   // closed automatically
            return reader.readLine();
        } catch (IOException e) {
            throw new ConfigException("cannot load " + file, e);                   // chaining
        }
    }

    public static void main(String[] args) {
        // Q28
        System.out.println("Q28 returned: " + tryReturn());

        // Q29 + Q30 + Q32: a checked exception forces try/catch here.
        try {
            withdraw(100, 500);
        } catch (InsufficientFundsException e) {
            System.out.println("Q29 checked exception caught: " + e.getMessage());
        } finally {
            System.out.println("Q30 finally: cleanup always runs");
        }

        // Q29: an unchecked exception needs no declaration.
        try {
            Object text = "hello";
            Integer wrong = (Integer) text;          // ClassCastException at runtime
        } catch (RuntimeException e) {
            System.out.println("Q29 unchecked exception caught: " + e.getClass().getSimpleName());
        }

        // Q31: an Error comes from the JVM, here a stack overflow from runaway recursion.
        try {
            recurse(0);
        } catch (StackOverflowError e) {
            System.out.println("Q31 Error caught only to demonstrate it: StackOverflowError");
        }

        // Q33: multi-catch shares one handler between unrelated types.
        for (String input : new String[] {"abc", null}) {
            try {
                System.out.println(Integer.parseInt(input.trim()));
            } catch (NumberFormatException | NullPointerException e) {
                System.out.println("Q33 multi-catch handled " + e.getClass().getSimpleName());
            }
        }

        // Q34: final variable cannot change; finally shown above; finalize is deprecated.
        final int limit = 3;
        System.out.println("Q34 final limit stays " + limit);

        // Q35: the stack trace shows how the exception travelled c -> b -> a -> main.
        try {
            a();
        } catch (ArrayIndexOutOfBoundsException e) {
            StackTraceElement[] trace = e.getStackTrace();
            System.out.println("Q35 propagated through " + trace[0].getMethodName() + " -> "
                    + trace[1].getMethodName() + " -> " + trace[2].getMethodName() + " -> " + trace[3].getMethodName());
        }

        // Q36: the wrapper carries the original cause.
        try {
            loadConfig("missing-file.txt");
        } catch (ConfigException e) {
            System.out.println("Q36 " + e.getMessage() + ", cause = " + e.getCause().getClass().getSimpleName());
        }
    }

    static int recurse(int depth) { return recurse(depth + 1) + 1; }
}`,
    walk:
      "`tryReturn()` returns from inside try, yet its finally prints first. That proves the finally block runs before control reaches the caller (Q28). `withdraw` throws a custom checked exception. Because it is checked, the method must declare it and `main` must catch it. A finally block then runs. A bad cast shows that an unchecked exception needs no declaration (Q29, Q30, Q32).\n\nUnbounded recursion fills the thread stack and raises StackOverflowError, an Error (Q31). The multi-catch loop parses \"abc\" (NumberFormatException) and null (NullPointerException) with one handler (Q33). Q35 throws in `c()` and catches in `main`. The stack trace lists c, b, a and main, showing the propagation path. Q36 wraps the FileNotFoundException from a missing file in a ConfigException and keeps the original exception as its cause.",
    anim: [
      "Exception propagation up the call stack",
      [
        ["main", "main()", "has catch"],
        ["a", "a()", "no catch"],
        ["b", "b()", "no catch"],
        ["c", "c()", "data[5] = 1"],
        ["jvm", "JVM", "creates exception"],
      ],
      [
        ["main", "a", "call", "main calls a, which calls b, which calls c: four frames on the stack."],
        ["c", "jvm", "bad index", "c writes index 5 of a 2-element array; the JVM creates the exception object."],
        ["jvm", "b", "unwind c", "c has no handler, so its frame is popped and the exception reappears in b."],
        ["b", "a", "unwind b", "b has no handler either; its frame is popped (finally blocks would run here)."],
        ["a", "main", "unwind a", "The exception reaches main, whose catch block matches and handles it."],
      ],
    ],
    mistakes: [
      "Catching `Exception` or `Throwable` everywhere. It hides bugs and also catches exceptions you cannot handle.",
      "Writing `catch (Exception e) {}` with an empty body. The failure disappears silently.",
      "Ordering catch blocks from general to specific, which is a compile error for the unreachable block.",
      "Returning from a finally block, which discards the try block's exception or return value.",
    ],
    qa: [
      [
        "Can we have try without catch?",
        "Yes, as long as there is a finally block (`try { } finally { }`), or as try-with-resources (`try (r) { }`), which needs neither catch nor finally.",
      ],
      [
        "Is it possible to catch an exception thrown in a static initializer?",
        "Not directly. An exception thrown there is wrapped in ExceptionInInitializerError when the class is initialised. Later attempts to use the class get NoClassDefFoundError.",
      ],
      [
        "What happens to an uncaught exception in a non-main thread?",
        "That thread terminates and its UncaughtExceptionHandler (by default, printing the stack trace) runs. The main thread and the other threads keep running.",
      ],
    ],
    ex: [
      "Predict the output: `static int f() { int x = 1; try { return x; } finally { x = 99; } }` and `System.out.println(f());`.",
      "It prints 1. The return value is evaluated and saved when `return x` executes. Changing the local variable in finally does not change the saved value. Only a `return` inside finally would replace it.",
    ],
  }),

  lesson("Core Java Q37-Q47: Cloning, Overriding Rules, Interfaces, Platforms and Primitives", {
    intro:
      "Questions 37 to 47 test object-oriented rules and platform basics:\n\n- shallow vs deep cloning\n- whether static and private methods can be overridden\n- interface vs abstract class\n- overloading vs overriding\n- equals vs == for String and StringBuffer\n- constructor chaining\n- the four Java platforms\n- JDK, JRE, JVM, OpenJDK and the JIT\n- the eight primitives\n- implicit casting and type promotion\n\nThe program proves each rule.",
    topics: [
      [
        "Q37. What is cloning in Java? Shallow vs deep copy?",
        "`clone()` creates a field-by-field copy of an object. A class must implement the marker interface `Cloneable`, or `Object.clone()` throws CloneNotSupportedException. It usually overrides `clone()` as public, calling `super.clone()`.\n\nThe default copy is **shallow**: primitive fields are copied, but reference fields still point to the same objects, so changing a shared array through the clone also changes the original. A **deep** copy also clones every mutable referenced object. Many developers prefer a copy constructor or a static factory (`new Person(other)`) over clone, because clone bypasses constructors and is awkward with final fields.",
      ],
      [
        "Q38. Can we override a static method?",
        "No. Static methods belong to the class, not the instance, and are resolved at compile time from the reference type. If a subclass declares a static method with the same signature, that is **method hiding**: `Parent p = new Child(); p.show()` calls `Parent.show()`. Putting `@Override` on it is a compile error. A subclass cannot declare an instance method with the same signature as a parent static method, or the reverse; both are compile errors.",
      ],
      [
        "Q39. Can we override a private method?",
        "No. A private method is not visible to subclasses, so it is not inherited and cannot be overridden. A method with the same signature in a subclass is a new, unrelated method. A call to the private method from inside the parent's own code always runs the parent version. Adding `@Override` to the subclass method gives a compile error, which is a good way to catch this mistake.",
      ],
      [
        "Q40. What is the difference between an interface and an abstract class?",
        "**Abstract class**:\n\n- It can have state (instance fields), constructors, any access modifiers, and both concrete and abstract methods.\n- A class can extend only one.\n- Use it for closely related classes that share code and state (a template with partial implementation).\n\n**Interface**:\n\n- It defines a contract.\n- Its fields are implicitly `public static final`.\n- Its methods are abstract by default, plus `default` and `static` methods (Java 8) and `private` helpers (Java 9).\n- It has no constructors and no instance state.\n- A class can implement many.\n- Use it for a capability that unrelated classes share (`Comparable`, `Runnable`).\n\nSince Java 17, `sealed` lets either one restrict which classes may implement or extend it.",
      ],
      [
        "Q41. What is the difference between overloading and overriding?",
        "**Overloading** (compile-time polymorphism) means the same method name with different parameter lists in the same class, or inherited into it. The compiler chooses one from the argument types. The return type alone cannot distinguish overloads.\n\n**Overriding** (runtime polymorphism) means a subclass redefines an inherited instance method with the same signature. The JVM chooses the version from the actual object type at runtime. Override rules:\n\n- The return type must be the same or covariant (a subtype).\n- Access can be widened but not narrowed.\n- The method cannot throw broader checked exceptions.\n- static, private and final methods cannot be overridden.",
      ],
      [
        "Q42. How do equals and == differ for String and StringBuffer?",
        "`==` always compares references: are these the same object? `String.equals` is overridden to compare characters, so two distinct Strings with the same text are equal. `StringBuffer` and `StringBuilder` do **not** override equals, so their `equals` falls back to `Object.equals`, which is `==`. Two buffers with the same content are therefore not equal. To compare contents, use `sb1.toString().equals(sb2.toString())`, or `sb1.compareTo(sb2) == 0` (both classes are Comparable since Java 11), or `String.contentEquals(sb)`.",
      ],
      [
        "Q43. What is constructor chaining?",
        "Constructor chaining means one constructor calls another. `this(...)` calls a constructor of the same class, usually to supply default values. `super(...)` calls a parent constructor. Either call must be the first statement in a constructor (Java 25's flexible constructor bodies allow plain statements before it, as long as they do not touch `this`). If neither is written, the compiler inserts `super()`. Chaining always runs up to Object first, so the parent fields are initialised before the child's constructor body runs.",
      ],
      [
        "Q44. What are the four Java platforms?",
        "- **Java SE** (Standard Edition): the core language, the JVM and the standard library. You need it for desktop apps, servers and tools.\n- **Jakarta EE** (formerly Java EE, Enterprise Edition): APIs for enterprise servers built on SE, such as Servlets, JPA, CDI and JAX-RS.\n- **Java ME** (Micro Edition): a small subset for embedded and old mobile devices.\n- **JavaFX**: a platform for rich client UIs, now developed separately as OpenJFX.\n\nCard-based Java Card is sometimes mentioned as well.",
      ],
      [
        "Q45. What are JDK, JRE, JVM, OpenJDK and the JIT compiler?",
        "- The **JVM** is the virtual machine that loads, verifies and executes bytecode, manages memory and runs garbage collection. Its implementation is platform specific.\n- The **JRE** is the JVM plus the standard class libraries: everything needed to run Java programs.\n- The **JDK** is the JRE plus development tools (`javac`, `jar`, `javadoc`, `jdb`, `jshell`, `jlink`). Since Java 11 no separate JRE is shipped; you use the JDK or a `jlink` image.\n- **OpenJDK** is the open-source reference implementation of Java SE. Oracle JDK, Temurin, Corretto and Zulu are builds of it.\n- The **JIT** (just-in-time) compiler inside the JVM watches which methods are hot and compiles their bytecode to native machine code at runtime (HotSpot C1 and C2), so long-running Java approaches native speed.",
      ],
      [
        "Q46. How many primitive types are there?",
        "There are eight:\n\n- `byte` (8-bit)\n- `short` (16)\n- `int` (32)\n- `long` (64)\n- `float` (32-bit IEEE 754)\n- `double` (64)\n- `char` (16-bit unsigned UTF-16 code unit)\n- `boolean` (true/false, size not specified by the JVM spec)\n\nThe integer types are signed two's complement. The defaults for fields are 0, 0.0, '\\u0000' and false. Local variables have no default and must be assigned before use. Each primitive has a wrapper class used for generics and collections.",
      ],
      [
        "Q47. What are implicit casting and type promotion?",
        "**Widening (implicit) casting** happens automatically when a smaller type fits a larger one without loss, along `byte → short → int → long → float → double`, and also `char → int`. `long → float` is allowed although it can lose precision.\n\n**Type promotion** in expressions: `byte`, `short` and `char` operands are promoted to `int` before arithmetic, and a mixed expression is promoted to the widest operand type. So `byte b = a + b;` does not compile without a cast, while compound assignment (`b += 1`) casts implicitly.\n\n**Narrowing** (for example `(int) 3.9`, which is 3) always needs an explicit cast and can overflow.",
      ],
    ],
    code: String.raw`import java.util.Arrays;

public class Main {

    // Q37: shallow vs deep cloning of an object that holds an array.
    static class Marks implements Cloneable {
        String student;
        int[] scores;
        Marks(String student, int[] scores) { this.student = student; this.scores = scores; }

        @Override public Marks clone() {
            try {
                return (Marks) super.clone();          // shallow: the array reference is shared
            } catch (CloneNotSupportedException e) { throw new AssertionError(e); }
        }
        Marks deepClone() {
            Marks copy = clone();
            copy.scores = scores.clone();              // deep: copy the mutable array too
            return copy;
        }
    }

    // Q38 + Q39: hiding a static method, and a private method that is not overridden.
    static class Parent {
        static String kind() { return "Parent.kind"; }
        private String secret() { return "Parent.secret"; }
        String callSecret() { return secret(); }      // always the parent's private method
        String who() { return "Parent.who"; }
    }
    static class Child extends Parent {
        static String kind() { return "Child.kind"; }  // hides, does not override
        String secret() { return "Child.secret"; }     // a new method, unrelated to Parent.secret
        @Override String who() { return "Child.who"; } // real overriding
    }

    // Q40: an interface capability and an abstract template.
    interface Payable { double MAX = 1_000_000; double pay(); default String currency() { return "INR"; } }
    static abstract class Staff implements Payable {
        protected final String name;
        Staff(String name) { this.name = name; }      // abstract classes can have constructors
        abstract double monthly();
        public double pay() { return monthly(); }
    }
    static class Engineer extends Staff {
        Engineer(String name) { super(name); }
        double monthly() { return 120000; }
    }

    // Q41: overloads picked by the compiler.
    static String describe(int x) { return "int " + x; }
    static String describe(long x) { return "long " + x; }
    static String describe(Object x) { return "Object " + x; }

    // Q43: constructor chaining with this(...) and super(...).
    static class Vehicle { Vehicle() { System.out.println("Q43   Vehicle() runs first"); } }
    static class Car extends Vehicle {
        final String model; final int seats;
        Car() { this("Basic"); System.out.println("Q43   Car() body runs last"); }
        Car(String model) { this(model, 4); }
        Car(String model, int seats) { super(); this.model = model; this.seats = seats;
            System.out.println("Q43   Car(model, seats) initialises fields"); }
    }

    public static void main(String[] args) {
        // Q37
        Marks original = new Marks("Neha", new int[] {70, 80});
        Marks shallow = original.clone();
        Marks deep = original.deepClone();
        shallow.scores[0] = 1;                          // also changes original.scores
        deep.scores[1] = 2;                             // does not affect original
        System.out.println("Q37 original " + Arrays.toString(original.scores)
                + ", deep " + Arrays.toString(deep.scores));

        // Q38 + Q39
        Parent p = new Child();
        System.out.println("Q38 Parent.kind() via reference type: " + Parent.kind() + ", Child.kind(): " + Child.kind());
        System.out.println("Q39 private method not overridden: " + p.callSecret() + ", overridden: " + p.who());

        // Q40
        Payable engineer = new Engineer("Kiran");
        System.out.println("Q40 pay " + engineer.pay() + " " + engineer.currency() + ", interface constant MAX " + Payable.MAX);

        // Q41
        byte small = 5;
        System.out.println("Q41 describe(5) -> " + describe(5) + ", describe(byte) -> " + describe(small)
                + ", describe(5L) -> " + describe(5L) + ", describe(\"5\") -> " + describe("5"));

        // Q42
        String s1 = new String("hi"), s2 = new String("hi");
        StringBuffer b1 = new StringBuffer("hi"), b2 = new StringBuffer("hi");
        System.out.println("Q42 String ==: " + (s1 == s2) + ", String equals: " + s1.equals(s2)
                + ", StringBuffer equals: " + b1.equals(b2) + ", contents: " + b1.toString().equals(b2.toString()));

        // Q43
        System.out.println("Q43 new Car():");
        Car car = new Car();
        System.out.println("Q43 model " + car.model + ", seats " + car.seats);

        // Q45: details of the running JVM.
        System.out.println("Q45 the JVM running this is Java 21 or newer: " + (Runtime.version().feature() >= 21));

        // Q46: sizes and ranges of the primitives.
        System.out.println("Q46 byte " + Byte.SIZE + " bits [" + Byte.MIN_VALUE + ", " + Byte.MAX_VALUE + "], int "
                + Integer.SIZE + ", long " + Long.SIZE + ", char " + Character.SIZE + ", double " + Double.SIZE);

        // Q47: widening, promotion and narrowing.
        int i = 'A';                                    // char widens to int
        double d = 10;                                  // int widens to double
        byte x = 10, y = 20;
        int sum = x + y;                                // bytes promoted to int before +
        x += 300;                                       // compound assignment casts back to byte
        int narrowed = (int) 3.99;                      // explicit narrowing truncates
        System.out.println("Q47 'A' as int " + i + ", 10 as double " + d + ", byte+byte is int " + sum
                + ", x += 300 -> " + x + ", (int) 3.99 -> " + narrowed);
    }
}`,
    walk:
      "Q37 changes element 0 through the shallow clone, and the original sees it because both share one array. The deep clone's change to element 1 stays private. Q38 calls the static `kind()` through each class: static methods follow the reference type, never the object. Q39's `callSecret()` still calls the parent's private `secret()` although Child has a method with the same name, while `who()` really is overridden.\n\nQ41 shows how overloads are resolved: an int literal picks `describe(int)`, and a byte widens to int as well. Q42 shows that StringBuffer inherits Object's identity equals. Q43 prints the constructor order: `Vehicle()` first (through `super()`), then the chained Car constructors return outwards. Q47 widens a char to int, promotes two bytes to int, and wraps `10 + 300 = 310` into a byte (310 − 256 = 54). The cast `(int) 3.99` truncates to 3.",
    anim: [
      "Constructor chaining for new Car()",
      [
        ["call", "new Car()", "client code"],
        ["c0", "Car()", "this(\"Basic\")"],
        ["c1", "Car(model)", "this(model, 4)"],
        ["c2", "Car(model,seats)", "super()"],
        ["veh", "Vehicle()", "then Object()"],
      ],
      [
        ["call", "c0", "new", "new Car() selects the no-argument constructor."],
        ["c0", "c1", "this(...)", "Its first statement delegates to Car(String) with the default model."],
        ["c1", "c2", "this(...)", "That constructor delegates again, adding the default seat count 4."],
        ["c2", "veh", "super()", "The full constructor calls super(), so Vehicle (and Object) initialise first."],
        ["veh", "c0", "bodies unwind", "Bodies then run from Vehicle back out to Car(), the last to print."],
      ],
    ],
    mistakes: [
      "Assuming `clone()` makes an independent copy. For mutable reference fields it does not.",
      "Using `@Override` on a static method and being surprised by the compile error. Static methods are hidden, not overridden.",
      "Comparing StringBuilder or StringBuffer contents with `equals`.",
      "Expecting `byte c = a + b;` to compile. The sum is an int.",
    ],
    qa: [
      [
        "Can an interface have a constructor?",
        "No. An interface has no instance state to initialise and cannot be instantiated. An anonymous class \"of an interface\" really calls Object's constructor.",
      ],
      [
        "Can we overload main?",
        "Yes, `main(int x)` is a legal overload, but the JVM only starts the program through `main(String[])` (or, since Java 25, an instance `main()` in a compact source file).",
      ],
      [
        "Which overload is chosen for `describe(null)` when there are String and Object versions?",
        "`describe(String)`, because the compiler picks the most specific applicable method. With two unrelated overloads (String and Integer) the call is ambiguous and does not compile.",
      ],
    ],
    ex: [
      "Write a class `Matrix` with an `int[][] cells` field and make `clone()` produce a true deep copy. Why is `cells.clone()` alone not enough?",
      "`cells.clone()` copies only the outer array, so its rows are still shared with the original. A deep copy clones every row: `copy.cells = new int[cells.length][]; for (int i = 0; i < cells.length; i++) copy.cells[i] = cells[i].clone();`.",
    ],
  }),

  lesson("Core Java Q48-Q55: Thread Basics, start vs run and volatile", {
    intro:
      "Questions 48 to 55 begin the multithreading round:\n\n- what a thread is and the two ways to create one\n- Runnable vs extending Thread\n- making threads end in the order they started, with main last\n- start vs run\n- volatile, and how it differs from synchronized\n- whether a thread can be started twice\n\nThe program shows `join` ordering, a volatile stop flag and the IllegalThreadStateException.",
    topics: [
      [
        "Q48. What is a thread?",
        "A thread is an independent path of execution inside a process. All threads of a process share its heap: objects, static fields and open files. Each thread has its own **stack** (local variables, method frames), its own program counter and its own native thread state. Java programs start with the `main` thread plus JVM background threads (GC, JIT compiler, finalizer, signal handling). Threads let a program use several CPU cores or keep responding while waiting for I/O, at the cost of having to coordinate access to shared data.",
      ],
      [
        "Q49. How do you implement a thread in Java?",
        "There are two classic ways, both of which end with `start()`. The first is to **implement Runnable** (or Callable) and pass it to a Thread: `new Thread(() -> work()).start()`. The second is to **extend Thread** and override `run()`. Modern alternatives build on the same idea:\n\n- submit tasks to an `ExecutorService`\n- use `CompletableFuture.runAsync`\n- since Java 21, start a virtual thread with `Thread.ofVirtual().start(task)` or `Executors.newVirtualThreadPerTaskExecutor()`\n\nIn every case the code to execute is a `run()` method, and the thread begins only when the JVM is asked to start it.",
      ],
      [
        "Q50. Should you implement Runnable or extend Thread?",
        "Prefer **Runnable**:\n\n- Java has single inheritance, so a class that extends Thread can extend nothing else.\n- Runnable separates the task (what to do) from the mechanism (how it runs), so the same task can go to a Thread, an executor or a virtual thread.\n- One Runnable instance can be shared by several threads.\n- Composition is usually better design than inheritance.\n\nExtend Thread only when you are really customising thread behaviour itself, which is rare.",
      ],
      [
        "Q51. How do you make threads end in the order they started, with main ending last?",
        "Use `join()`. `t.join()` makes the calling thread wait until `t` terminates. To finish threads in start order, start t1 and call `t1.join()` before starting t2, and so on. Each thread then runs and completes before the next begins. The main thread, which calls all the joins, necessarily finishes last.\n\nIf the threads should run in parallel and main only has to wait for all of them, start them all first and then join each one. In that case they finish in any order, but main is still last. `CountDownLatch` and `ExecutorService.invokeAll` are the higher-level alternatives.",
      ],
      [
        "Q52. What is the difference between run() and start()?",
        "`start()` asks the JVM to create a new native thread, which then calls `run()` on that new thread, and `start()` returns immediately. Calling `run()` directly is an ordinary method call: the code runs on the **current** thread, with no concurrency at all. `start()` can be called only once per Thread object; `run()` can be called any number of times. The program prints `Thread.currentThread().getName()` from both to show the difference.",
      ],
      [
        "Q53. What is volatile?",
        "`volatile` on a field guarantees **visibility** and **ordering**. Every read sees the latest write by any thread, because the value is not cached in a register or a core-local cache. A write to a volatile also publishes all the writes the same thread made before it (a happens-before edge). It also prevents the JIT from hoisting a read out of a loop, so `while (!stop)` sees the update.\n\nVolatile does **not** make compound actions such as `count++` (read, add, write) atomic. Two threads can still lose an update. Typical uses are stop flags, status fields and safe publication in double-checked locking.",
      ],
      [
        "Q54. What is the difference between synchronized and volatile?",
        "`synchronized` gives **mutual exclusion** (only one thread holds the monitor at a time) and **visibility** (releasing the lock publishes changes and acquiring it sees them). It works on methods and blocks, can protect compound actions over several variables, and can block threads.\n\n`volatile` gives only visibility and ordering for a single variable, never blocks, and cannot make check-then-act or `++` atomic. Volatile applies only to fields, while synchronized applies to code. Use volatile for simple flags, and synchronized (or Lock, or atomic classes) whenever a correct update needs several steps.",
      ],
      [
        "Q55. Can a thread be started twice?",
        "No. A Thread object moves from NEW to RUNNABLE on the first `start()`. Calling `start()` again, whether it is still running or already TERMINATED, throws **IllegalThreadStateException**, because the thread's internal state is no longer NEW. To run the same work again, create a new Thread with the same Runnable, or submit the task to an executor repeatedly.",
      ],
    ],
    code: String.raw`public class Main {

    // Q53: a volatile stop flag read by a worker thread.
    static volatile boolean stop = false;

    // Q50: the task is a Runnable, separate from the thread that runs it.
    static class PrintTask implements Runnable {
        private final String label;
        PrintTask(String label) { this.label = label; }
        public void run() {
            System.out.println("Q51 " + label + " runs on " + Thread.currentThread().getName());
        }
    }

    // Q49: the other way - extend Thread and override run().
    static class Worker extends Thread {
        Worker() { super("worker-subclass"); }
        @Override public void run() { System.out.println("Q49 extended Thread runs on " + getName()); }
    }

    public static void main(String[] args) throws Exception {
        // Q48: every program starts with the main thread.
        System.out.println("Q48 current thread: " + Thread.currentThread().getName());

        // Q49: both ways of creating a thread.
        Worker worker = new Worker();
        worker.start();
        worker.join();
        Thread lambda = new Thread(() -> System.out.println("Q49 Runnable lambda runs on "
                + Thread.currentThread().getName()), "worker-runnable");
        lambda.start();
        lambda.join();

        // Q51: start then join each thread so they finish in start order; main ends last.
        for (int i = 1; i <= 3; i++) {
            Thread t = new Thread(new PrintTask("thread " + i), "T" + i);
            t.start();
            t.join();                      // main waits here before starting the next thread
        }

        // Q52: run() executes on the caller, start() on a new thread.
        Thread direct = new Thread(() -> System.out.println("Q52 body executed by " + Thread.currentThread().getName()), "new-thread");
        direct.run();                      // plain method call on main
        direct.start();                    // real new thread
        direct.join();

        // Q53: the worker sees the volatile write and stops.
        Thread spinner = new Thread(() -> {
            long loops = 0;
            while (!stop) loops++;         // without volatile this loop might never end
            System.out.println("Q53 spinner saw stop = true and exited");
        });
        spinner.start();
        Thread.sleep(50);
        stop = true;                       // visible to the spinner immediately
        spinner.join();

        // Q54: volatile does not make ++ atomic; synchronized does.
        Counter counter = new Counter();
        Thread a = new Thread(counter::incrementBoth), b = new Thread(counter::incrementBoth);
        a.start(); b.start(); a.join(); b.join();
        System.out.println("Q54 synchronized count = " + counter.safe + " (always 200000)");
        System.out.println("Q54 volatile count <= 200000 (updates can be lost): " + (counter.unsafe <= 200000));

        // Q55: starting the same Thread twice.
        try {
            direct.start();
        } catch (IllegalThreadStateException e) {
            System.out.println("Q55 second start() -> IllegalThreadStateException, state was " + direct.getState());
        }
        System.out.println("Q51 main ends last");
    }

    static class Counter {
        volatile int unsafe = 0;           // visible but not atomic
        int safe = 0;
        synchronized void addSafe() { safe++; }
        void incrementBoth() {
            for (int i = 0; i < 100000; i++) { unsafe++; addSafe(); }
        }
    }
}`,
    walk:
      "The program first prints that it is running on `main` (Q48). It then creates one thread by extending Thread and one from a Runnable lambda. Each prints the name of the thread that executes it (Q49, Q50). The Q51 loop starts T1 and joins it before starting T2, so the lines appear strictly in order, and main's final line comes after everything.\n\nQ52 calls `run()` directly, which prints `main`, then `start()`, which prints `new-thread`. For Q53 the spinner loops on the volatile `stop` field. When main sets it 50 ms later, the spinner sees the change and exits. Q54 increments a volatile counter and a synchronized counter 100,000 times from each of two threads. The synchronized total is always 200,000, while the volatile one can lose updates. Q55 calls `start()` on the finished thread, which throws IllegalThreadStateException.",
    anim: [
      "start() versus run()",
      [
        ["main", "main thread", "calls methods"],
        ["obj", "Thread object", "state NEW"],
        ["jvm", "JVM scheduler", "native thread"],
        ["newt", "new thread", "own stack"],
      ],
      [
        ["main", "obj", "run()", "Calling run() directly is an ordinary call: the body runs on main's stack."],
        ["main", "obj", "start()", "Calling start() asks the JVM to create a native thread; state becomes RUNNABLE."],
        ["obj", "jvm", "schedule", "The scheduler gives the new thread CPU time when a core is free."],
        ["jvm", "newt", "invoke run()", "The new thread calls run() on its own stack, concurrently with main."],
        ["main", "obj", "start() again", "A second start() finds the state is not NEW and throws IllegalThreadStateException."],
      ],
    ],
    mistakes: [
      "Calling `run()` and believing a new thread was started.",
      "Using a volatile counter with `++` from several threads. Use AtomicInteger or a lock instead.",
      "Starting all threads and then joining them, and expecting them to finish in start order. They only finish before main.",
    ],
    qa: [
      [
        "What happens if you call join() on a thread that has not been started?",
        "It returns immediately, because a thread that is not alive counts as already finished. The calling thread does not wait.",
      ],
      [
        "Is the `main` thread a daemon thread?",
        "No, it is a user thread. The JVM exits only when all user threads have ended, so a non-daemon thread started by main keeps the JVM alive after main returns.",
      ],
      [
        "Does volatile work with long and double?",
        "Yes. Without volatile, a 64-bit long or double write may be split into two 32-bit writes on some JVMs (word tearing). With volatile the read and write are always atomic.",
      ],
    ],
    ex: [
      "Three threads print \"A\", \"B\" and \"C\". Make them always print `A B C` while still being started back to back (start all three first), without using join between the starts.",
      "Use two CountDownLatch(1) objects. B waits on latch1 and C waits on latch2. A prints and then counts down latch1; B prints and then counts down latch2; C prints. Start all three in any order. Main then joins all three.",
    ],
  }),

  lesson("Core Java Q56-Q61: Race Conditions, wait/notify and Producer-Consumer", {
    intro:
      "Questions 56 to 61 cover thread coordination:\n\n- what a race condition is\n- how threads communicate\n- why `wait`, `notify` and `notifyAll` live in Object rather than Thread\n- why the caller must hold the lock\n- two producer-consumer solutions: hand-written wait/notify, and a BlockingQueue\n\nThe program runs both producer-consumer versions with deterministic output.",
    topics: [
      [
        "Q56. What is a race condition?",
        "A race condition is a bug where the result depends on the timing of threads that access shared data without proper synchronization. The classic case is `count++`, which is three steps: read count, add one, write it back. Two threads can both read 5 and both write 6, losing one increment. Other forms are check-then-act (`if (!map.containsKey(k)) map.put(k, v)`, where another thread can insert in between) and lazy initialisation that creates two instances.\n\nThe fixes are to make the compound action atomic: synchronized, a Lock, atomic classes (`AtomicInteger.incrementAndGet`), concurrent collections (`putIfAbsent`, `computeIfAbsent`), or avoiding shared mutable state altogether.",
      ],
      [
        "Q57. How do threads communicate with each other?",
        "Threads communicate through shared objects plus a signalling mechanism. The low-level tool is `wait()`, `notify()` and `notifyAll()` on a shared monitor. A thread that cannot proceed waits, which releases the lock, and another thread that changes the condition notifies. The higher-level tools in `java.util.concurrent` are usually better:\n\n- `BlockingQueue` (put and take block for you)\n- `Condition` objects of a Lock (`await` and `signal`)\n- CountDownLatch, CyclicBarrier, Phaser and Semaphore\n- Exchanger\n- CompletableFuture\n\nOther options are `join()`, interruption and volatile flags.",
      ],
      [
        "Q58. Why are wait, notify and notifyAll in Object and not in Thread?",
        "Because in Java every object can be a monitor (a lock), and these methods operate on the **monitor's wait set**, not on a particular thread. A thread waits *on an object* for a condition guarded by that object's lock, and the notifier signals *that object*, without knowing or caring which threads are waiting. If the methods were on Thread, a notifier would have to know the identity of the waiting thread, and a lock would not carry its own queue of waiters. Putting them in Object ties the signalling to the same object that `synchronized` locks.",
      ],
      [
        "Q59. Why must a thread hold the lock to call wait or notify?",
        "`wait` must atomically release the monitor and put the thread into the wait set. Without holding the lock there is nothing to release, and the check of the condition and the wait would race (a lost wake-up: the notify could happen between your check and your wait). Likewise `notify` must be called while holding the lock, so that the condition change and the signal are seen together. If the current thread does not own the monitor, both methods throw **IllegalMonitorStateException** at runtime. Always wait inside a `while (!condition)` loop to handle spurious wake-ups.",
      ],
      [
        "Q60. How do you solve producer-consumer with wait and notify?",
        "Share a bounded buffer guarded by one lock. The producer locks the buffer and, `while` it is full, calls `wait()`. It then adds an item and calls `notifyAll()`. The consumer locks the buffer and, `while` it is empty, calls `wait()`. It then removes an item and calls `notifyAll()`.\n\nThe `while` loop re-checks the condition after waking, because another thread may have changed it or the wake-up may be spurious. `notifyAll` avoids the case where `notify` wakes another producer instead of a consumer and every thread ends up waiting. The program implements exactly this pattern.",
      ],
      [
        "Q61. How do you solve producer-consumer with a BlockingQueue?",
        "`BlockingQueue` (ArrayBlockingQueue, LinkedBlockingQueue) contains the locking and waiting logic. `put(e)` blocks while the queue is full and `take()` blocks while it is empty. The producer simply puts and the consumer simply takes, with no synchronized blocks, wait or notify. Bounded queues also give back-pressure: a fast producer slows down to the consumer's pace. A **poison pill** (a special end-of-stream item) is a common way to tell the consumer to stop.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {

    // Q60: a bounded buffer coordinated with wait/notifyAll on its own monitor.
    static class Buffer {
        private final Queue<Integer> items = new LinkedList<>();
        private final int capacity;
        Buffer(int capacity) { this.capacity = capacity; }

        synchronized void put(int value) throws InterruptedException {
            while (items.size() == capacity) wait();    // releases the lock while waiting
            items.add(value);
            notifyAll();                                 // wake consumers waiting for data
        }

        synchronized int take() throws InterruptedException {
            while (items.isEmpty()) wait();              // always re-check in a loop
            int value = items.remove();
            notifyAll();                                 // wake producers waiting for space
            return value;
        }
    }

    static int racyCount = 0;                            // Q56: shared and unprotected

    public static void main(String[] args) throws Exception {
        // Q56: two threads incrementing a plain int can lose updates.
        Runnable racy = () -> { for (int i = 0; i < 100_000; i++) racyCount++; };
        Thread r1 = new Thread(racy), r2 = new Thread(racy);
        r1.start(); r2.start(); r1.join(); r2.join();
        System.out.println("Q56 racy total is at most 200000: " + (racyCount <= 200_000));

        // Q59: calling wait without holding the lock fails.
        Object lock = new Object();
        try {
            lock.wait();
        } catch (IllegalMonitorStateException e) {
            System.out.println("Q59 wait() without the lock -> IllegalMonitorStateException");
        }

        // Q57 + Q58 + Q60: producer-consumer with wait/notifyAll; consumer collects in order.
        Buffer buffer = new Buffer(2);
        List<Integer> consumed = new ArrayList<>();
        Thread producer = new Thread(() -> {
            try { for (int i = 1; i <= 5; i++) buffer.put(i); } catch (InterruptedException ignored) { }
        });
        Thread consumer = new Thread(() -> {
            try { for (int i = 1; i <= 5; i++) consumed.add(buffer.take()); } catch (InterruptedException ignored) { }
        });
        producer.start(); consumer.start();
        producer.join(); consumer.join();
        System.out.println("Q60 wait/notify consumer received " + consumed);

        // Q61: the same with a BlockingQueue and a poison pill to stop.
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        final int POISON = -1;
        List<Integer> received = Collections.synchronizedList(new ArrayList<>());
        Thread qProducer = new Thread(() -> {
            try {
                for (int i = 10; i <= 50; i += 10) queue.put(i);  // blocks when the queue is full
                queue.put(POISON);
            } catch (InterruptedException ignored) { }
        });
        Thread qConsumer = new Thread(() -> {
            try {
                while (true) {
                    int value = queue.take();                     // blocks when the queue is empty
                    if (value == POISON) break;
                    received.add(value);
                }
            } catch (InterruptedException ignored) { }
        });
        qProducer.start(); qConsumer.start();
        qProducer.join(); qConsumer.join();
        System.out.println("Q61 BlockingQueue consumer received " + received + " then the poison pill");
    }
}`,
    walk:
      "Q56 runs two threads that each increment a plain static int 100,000 times. Without synchronization the total is often below 200,000. The program prints only that the total cannot exceed 200,000, so the output stays the same every run. Q59 calls `wait()` on an object it has not locked and gets IllegalMonitorStateException.\n\nFor Q60 the buffer holds at most two items. When it is full, the producer's `put` waits, releasing the monitor, until the consumer takes an item and calls `notifyAll`. The consumer receives 1 to 5 in order. Q61 repeats the exchange with an ArrayBlockingQueue whose `put` and `take` do all the waiting. The producer finishes with the poison value -1, which makes the consumer's loop exit cleanly.",
    anim: [
      "Producer-consumer with wait and notifyAll",
      [
        ["prod", "Producer", "put(i)"],
        ["lock", "Buffer monitor", "capacity 2"],
        ["ws", "wait set", "sleeping threads"],
        ["cons", "Consumer", "take()"],
      ],
      [
        ["prod", "lock", "put 1, 2", "The producer locks the buffer and adds items 1 and 2; now it is full."],
        ["lock", "ws", "wait()", "Buffer full: the producer calls wait(), releasing the lock and sleeping."],
        ["cons", "lock", "take()", "The consumer acquires the lock, removes item 1 and calls notifyAll()."],
        ["ws", "prod", "wake up", "The producer wakes, re-acquires the lock and re-checks the while condition."],
        ["prod", "lock", "put 3", "There is room again, so item 3 is added and notifyAll wakes any waiting consumer."],
      ],
    ],
    mistakes: [
      "Using `if` instead of `while` around `wait()`. A spurious or stolen wake-up then proceeds on a false condition.",
      "Calling `notify()` when producers and consumers wait on the same monitor. It can wake the wrong kind of thread and stall everything.",
      "Synchronizing on one object and calling wait or notify on another, which throws IllegalMonitorStateException.",
    ],
    qa: [
      [
        "What is a spurious wake-up?",
        "A waiting thread can return from `wait()` without any notify, interrupt or timeout. The specification allows this, which is why the condition must be re-checked in a loop.",
      ],
      [
        "Does notify() release the lock immediately?",
        "No. The notified thread can run only after the notifier leaves the synchronized block and the woken thread wins the lock again.",
      ],
      [
        "Which is better, a Lock's Condition or wait/notify?",
        "A Condition allows several wait sets per lock (for example `notFull` and `notEmpty`), so you can signal exactly the right group of threads. It also supports timed and uninterruptible waits.",
      ],
    ],
    ex: [
      "Change the wait/notify Buffer to use a `ReentrantLock` with two Conditions, `notFull` and `notEmpty`. Which signal does `put` send and which does `take` send?",
      "`put`: `lock.lock(); try { while (full) notFull.await(); add; notEmpty.signal(); } finally { lock.unlock(); }`. `take`: `while (empty) notEmpty.await(); remove; notFull.signal();`. Each side wakes only the threads waiting for the opposite condition, so `signal()` is safe here.",
    ],
  }),
];
