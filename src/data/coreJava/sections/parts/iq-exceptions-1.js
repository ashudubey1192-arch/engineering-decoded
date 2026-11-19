import { lesson } from "../../schema.js";

export default [
  lesson("Exceptions Q1-Q10: What Exceptions Are, the Hierarchy, Keywords and Custom Exceptions", {
    intro:
      "Questions 1 to 10 of the exception round build the foundation:\n\n- what an exception is\n- the Throwable hierarchy\n- checked vs unchecked\n- the five keywords\n- what an Error is, and how it differs from an Exception\n- throw, throws, and the difference between them\n- writing your own checked and unchecked exceptions\n\nThe program prints the hierarchy of common exception classes and throws custom exceptions of both kinds.",
    topics: [
      [
        "Q1. What is an exception?",
        "An exception is an **event during execution that disrupts the normal flow** of a program: dividing by zero, a missing file, a null reference, a bad array index. In Java it is represented by an **object** of a `Throwable` subclass. The object carries a message, an optional cause and a stack trace showing where it happened. When it is thrown, the normal statement sequence stops, and the JVM searches the call stack for a matching handler (`catch`). Exceptions separate error-handling code from normal logic, and they propagate errors to callers that are able to handle them.",
      ],
      [
        "Q2. What is the exception hierarchy?",
        "`java.lang.Object → Throwable`, which has two branches:\n\n- **Error**: serious JVM or environment problems, such as OutOfMemoryError, StackOverflowError, VirtualMachineError, LinkageError (with NoClassDefFoundError and ExceptionInInitializerError) and AssertionError.\n- **Exception**: conditions an application may handle.\n- **Checked exceptions**, the non-runtime subclasses of Exception: IOException (FileNotFoundException, EOFException), SQLException, ClassNotFoundException, InterruptedException, CloneNotSupportedException and ReflectiveOperationException.\n- **RuntimeException**, the unchecked subclass of Exception: NullPointerException, ArithmeticException, ClassCastException, IllegalArgumentException (with NumberFormatException), IllegalStateException, IndexOutOfBoundsException (with ArrayIndexOutOfBoundsException and StringIndexOutOfBoundsException), UnsupportedOperationException and ConcurrentModificationException.\n\nYou can throw and catch only Throwable instances.",
      ],
      [
        "Q3. What is the difference between checked and unchecked exceptions?",
        "**Checked** exceptions are verified by the compiler. Any method that may throw one must catch it or declare it with `throws`, or the code does not compile. They model recoverable, external failures (an I/O error, a database error) that a caller should consciously handle.\n\n**Unchecked** exceptions are RuntimeException, Error and their subclasses. They need no declaration and are usually programming bugs (null, a bad index, a bad cast) or fatal conditions. A good design rule: throw a checked exception when a caller can reasonably recover, and an unchecked one for API misuse. Many modern libraries (Spring, JPA) prefer unchecked exceptions to avoid boilerplate.",
      ],
      [
        "Q4. What are the five exception-handling keywords?",
        "- `try` marks a block whose exceptions you want to handle.\n- `catch (Type e)` handles a matching exception from the try. There can be several, ordered from specific to general, or one multi-catch with `|`.\n- `finally` always executes after try or catch, for cleanup.\n- `throw` raises an exception object.\n- `throws` declares in a method header the checked exceptions the method may propagate.\n\nJava 7 added try-with-resources (`try (Resource r = ...)`) as a special form of try.",
      ],
      [
        "Q5. What is an Error in Java?",
        "`Error` is the Throwable subclass for **abnormal conditions an application should not try to catch**. They mostly come from the JVM or the environment:\n\n- `OutOfMemoryError`: the heap or metaspace is exhausted.\n- `StackOverflowError`: recursion is too deep.\n- `NoClassDefFoundError`: a class was present at compile time but is missing at runtime.\n- `ExceptionInInitializerError`: a static initializer failed.\n- `AssertionError`: an `assert` statement failed.\n- `InternalError`.\n\nErrors are unchecked. Catching one is legal and occasionally useful at a top-level boundary (log and exit), but the program state is usually unreliable afterwards.",
      ],
      [
        "Q6. What is the difference between Exception and Error?",
        "Both extend Throwable. An **Exception** indicates a condition that a reasonable application might want to catch and recover from, and it can be checked or unchecked. An **Error** indicates a serious problem, mostly in the JVM or its resources, that the application usually cannot recover from, and it is always unchecked. Exceptions are typically caused by the program or its inputs, while Errors are caused by the runtime environment. In practice, you catch exceptions, and let Errors terminate the thread or log them at the top level.",
      ],
      [
        "Q7. What does throw do?",
        "`throw` is a statement that raises one exception object immediately: `throw new IllegalArgumentException(\"age must be positive\");`. Control leaves the current block at once. Statements after a `throw` in the same block are unreachable, which is a compile error. The thrown object must be a Throwable. You can also re-throw a caught exception (`throw e;`) or wrap it (`throw new ServiceException(\"...\", e);`). Throwing null throws a NullPointerException instead.",
      ],
      [
        "Q8. What does throws do?",
        "`throws` appears in a method or constructor signature and lists the exception types that the method may pass to its caller: `void load(String path) throws IOException, ParseException`. It is mandatory for checked exceptions the method does not catch, and optional (documentation only) for unchecked ones. Callers must then handle or re-declare those checked exceptions. Overriding methods may declare fewer, or narrower, checked exceptions, but not broader ones.",
      ],
      [
        "Q9. What is the difference between throw and throws?",
        "- **Kind**: `throw` is a statement inside a method body, while `throws` is a clause in its declaration.\n- **What follows**: `throw` takes one Throwable instance, while `throws` takes one or more class names.\n- **Purpose**: `throw` actually raises an exception, while `throws` only declares that one may propagate.\n- **Checked exceptions**: a checked exception that is thrown with `throw` and not caught must appear in `throws`.\n\nExample: `void withdraw(int amt) throws InsufficientFundsException { if (amt > balance) throw new InsufficientFundsException(amt); }`.",
      ],
      [
        "Q10. How do you create a user-defined checked or unchecked exception?",
        "For a **checked** exception, extend `Exception` (or a checked subclass such as IOException). For an **unchecked** one, extend `RuntimeException`. Provide the usual constructors: `()`, `(String message)`, `(String message, Throwable cause)` and `(Throwable cause)`. Pass them to `super`, so that the message and cause chaining work. You may add domain fields (an error code, the failing value). Add a `serialVersionUID`, because Throwable is Serializable. Name the class with the `Exception` suffix and make it describe the problem, for example `InsufficientFundsException` or `OrderNotFoundException`.",
        "public class InsufficientFundsException extends Exception {\n    private final long shortBy;\n    public InsufficientFundsException(long shortBy) {\n        super(\"short by \" + shortBy);\n        this.shortBy = shortBy;\n    }\n    public long getShortBy() { return shortBy; }\n}",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.*;

public class Main {

    // Q10: a checked exception with a domain field.
    static class InsufficientFundsException extends Exception {
        private static final long serialVersionUID = 1L;
        private final long shortBy;
        InsufficientFundsException(long shortBy) { super("short by " + shortBy); this.shortBy = shortBy; }
        long getShortBy() { return shortBy; }
    }

    // Q10: an unchecked exception that keeps the cause.
    static class ConfigMissingException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        ConfigMissingException(String key, Throwable cause) { super("missing config: " + key, cause); }
    }

    static long balance = 500;

    // Q8 + Q9: throws declares, throw raises.
    static void withdraw(long amount) throws InsufficientFundsException {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");  // unchecked: no declaration needed
        if (amount > balance) throw new InsufficientFundsException(amount - balance);     // checked: declared above
        balance -= amount;
    }

    static String readKey(String key) {
        try {
            throw new FileNotFoundException("app.properties");                        // simulate a missing file
        } catch (IOException e) {
            throw new ConfigMissingException(key, e);                                  // wrap and rethrow
        }
    }

    // Q2: print the superclass chain of a Throwable type.
    static String chain(Class<?> type) {
        StringJoiner joiner = new StringJoiner(" -> ");
        for (Class<?> c = type; c != Object.class; c = c.getSuperclass()) joiner.add(c.getSimpleName());
        return joiner.toString();
    }

    public static void main(String[] args) {
        // Q1: an exception object carries a message and a stack trace.
        try {
            int[] data = new int[3];
            data[3] = 1;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Q1  " + e.getClass().getSimpleName() + ": " + e.getMessage()
                    + " at line " + e.getStackTrace()[0].getLineNumber() + " of main");
        }

        // Q2: the hierarchy.
        for (Class<?> c : List.of(FileNotFoundException.class, NumberFormatException.class, StackOverflowError.class, NoClassDefFoundError.class))
            System.out.println("Q2  " + chain(c));

        // Q3: checked means "subclass of Exception but not RuntimeException".
        for (Class<?> c : List.of(IOException.class, InterruptedException.class, NullPointerException.class, OutOfMemoryError.class)) {
            boolean checked = Exception.class.isAssignableFrom(c) && !RuntimeException.class.isAssignableFrom(c);
            System.out.println("Q3  " + c.getSimpleName() + " is " + (checked ? "checked" : "unchecked"));
        }

        // Q4 + Q7 + Q9: all five keywords in action.
        for (long amount : new long[] {200, 800, -5}) {
            try {
                withdraw(amount);
                System.out.println("Q4  withdrew " + amount + ", balance " + balance);
            } catch (InsufficientFundsException e) {
                System.out.println("Q4  checked: " + e.getMessage() + " (shortBy field = " + e.getShortBy() + ")");
            } catch (IllegalArgumentException e) {
                System.out.println("Q4  unchecked: " + e.getMessage());
            } finally {
                System.out.println("Q4    finally after amount " + amount);
            }
        }

        // Q5 + Q6: an Error from the JVM vs a recoverable Exception.
        try {
            long[] huge = new long[Integer.MAX_VALUE];                                // larger than any heap allows
        } catch (OutOfMemoryError e) {
            System.out.println("Q5  Error caught only to demonstrate: " + e.getClass().getSimpleName());
        }

        // Q10: the unchecked wrapper keeps the original cause.
        try {
            readKey("db.url");
        } catch (ConfigMissingException e) {
            System.out.println("Q10 " + e.getMessage() + " <- caused by " + e.getCause().getClass().getSimpleName()
                    + "(" + e.getCause().getMessage() + ")");
        }
    }
}`,
    walk:
      "Q1 writes past the end of an array. The resulting exception object reports its type, a message (\"Index 3 out of bounds for length 3\") and the line where it happened. Q2 prints the real superclass chains, showing the Exception and Error branches under Throwable. Q3 classifies four types with the rule \"subclass of Exception but not of RuntimeException\".\n\nThe Q4 loop calls `withdraw` three times. 200 succeeds. 800 throws the custom checked exception, whose `shortBy` field holds 500. -5 throws an unchecked IllegalArgumentException. The finally block runs after each attempt. Q5 asks for an array of about 2^31 longs, which no heap allows, so the JVM throws an OutOfMemoryError (an Error) at once, without filling memory. Q10 wraps a FileNotFoundException in a custom RuntimeException and prints both the wrapper and its cause.",
    anim: [
      "The Throwable family",
      [
        ["thr", "Throwable", "message + trace"],
        ["err", "Error", "JVM problems"],
        ["exc", "Exception", "app conditions"],
        ["chk", "checked", "IOException ..."],
        ["rte", "RuntimeException", "unchecked"],
      ],
      [
        ["thr", "err", "extends", "Error covers OutOfMemoryError, StackOverflowError and NoClassDefFoundError."],
        ["thr", "exc", "extends", "Exception covers the conditions an application may want to handle."],
        ["exc", "chk", "compiler checks", "Non-runtime subclasses are checked: catch them or declare them with throws."],
        ["exc", "rte", "unchecked", "RuntimeException and its subclasses (NPE, IAE ...) need no declaration."],
        ["err", "rte", "both unchecked", "Errors are unchecked too: the compiler never forces you to handle them."],
      ],
    ],
    mistakes: [
      "Creating a custom exception without a `(message, cause)` constructor, so the root cause is lost when wrapping.",
      "Extending `Throwable` or `Error` directly for application exceptions.",
      "Declaring `throws Exception` on every method. It hides what can actually fail.",
    ],
    qa: [
      [
        "Is it good practice to catch Throwable?",
        "Only at the outermost boundary (a thread's top-level loop or a framework dispatcher) to log and keep the process alive. Elsewhere it swallows Errors and bugs you cannot handle.",
      ],
      [
        "Can a constructor throw an exception?",
        "Yes. A constructor can declare `throws`, and if it throws, no object reference is returned to the caller. The partly built object becomes garbage.",
      ],
      [
        "Which exceptions are most common in production?",
        "NullPointerException, IllegalArgumentException, IllegalStateException, IndexOutOfBoundsException, ClassCastException, NumberFormatException, IOException and SQLException, plus timeout and connection exceptions from libraries.",
      ],
    ],
    ex: [
      "Create an unchecked `InvalidAgeException` with a field `age`, throw it from `setAge(int)` when the age is negative, and catch it in main to print the field. Does `setAge` need a throws clause?",
      "`class InvalidAgeException extends RuntimeException { final int age; InvalidAgeException(int age) { super(\"invalid age \" + age); this.age = age; } }`. `setAge` does not need `throws`, because the exception is unchecked, although documenting it with `@throws` in Javadoc is good practice.",
    ],
  }),

  lesson("Exceptions Q11-Q20: try/catch/finally Rules, ARM, Nested try, Overriding Rules and Returns", {
    intro:
      "Questions 11 to 20 go into the mechanics:\n\n- how try, catch and finally combine, and which of them can stand alone\n- multiple catch blocks\n- Java 7 automatic resource management (try-with-resources) and why no explicit close is needed\n- the finally block\n- nested try\n- what overriding methods may declare\n- what happens when catch or try and finally both return\n- how exceptions propagate\n\nThe program shows resources closing in reverse order, suppressed exceptions, and return values overridden by finally.",
    topics: [
      [
        "Q11. How are try, catch and finally used? Can each be used alone?",
        "`try` must be followed by at least one `catch` **or** a `finally`, or be a try-with-resources. So `try-catch`, `try-finally`, `try-catch-finally` and `try (resource) { }` are all legal. `catch` and `finally` can **never** appear without a preceding try, and a bare `try { }` with nothing after it does not compile. Between try and catch there can be no other statements. The order is fixed: try, then the catches, then finally.",
      ],
      [
        "Q12. How do multiple catch blocks work?",
        "When an exception is thrown in try, the catch blocks are checked **top to bottom**, and the **first** whose type matches (the same class or a superclass) runs. The others are skipped. A subclass catch must come before its superclass catch. `catch (Exception e)` before `catch (IOException e)` is a compile error (\"exception has already been caught\"), because the second block is unreachable. Unrelated types can appear in any order. Only one catch block runs per exception.",
      ],
      [
        "Q13. What is automatic resource management (ARM) in Java 7?",
        "ARM is the language feature behind **try-with-resources**. Resources declared in parentheses after try, `try (BufferedReader r = new BufferedReader(...))`, are closed automatically at the end of the block, whether it completes normally or throws. It works with any class implementing `java.lang.AutoCloseable` (or its subinterface `java.io.Closeable`). Before Java 7, you had to close resources in finally, with null checks and nested try-catch around `close()`. Java 9 also allows effectively-final variables declared earlier: `try (reader) { ... }`.",
      ],
      [
        "Q14. How does try-with-resources work in detail?",
        "- Several resources can be declared, separated by `;`. They are initialised in order and **closed in reverse order**.\n- `close()` runs before any catch or finally block of the same statement.\n- If the body throws and `close()` also throws, the body's exception is the one propagated, and the close exception is attached as a **suppressed** exception (`e.getSuppressed()`). In the old finally pattern, a close exception would overwrite the original.\n- A resource whose initialisation returned null is skipped at close.\n- The resource variables are implicitly final.",
      ],
      [
        "Q15. Why don't we need to close resources explicitly with try-with-resources?",
        "Because the compiler generates the closing code for you. It desugars the statement into a try-finally that calls `close()` on every non-null resource, in reverse order, handling exceptions from close by adding them as suppressed. This removes the classic bugs: forgetting to close, closing in the wrong order, losing the original exception, and NullPointerExceptions in finally. It also handles early `return`, `break` and exceptions from the middle of the block.",
      ],
      [
        "Q16. What is the finally block?",
        "`finally` contains code that runs **after** try and catch, regardless of the outcome:\n\n- after normal completion\n- after a caught exception\n- after an uncaught exception, before it propagates\n- after `return`, `break` or `continue` inside try or catch\n\nIt is used for cleanup: unlocking a lock, closing resources that are not AutoCloseable, restoring state. It does not run if the JVM exits (`System.exit`) or the thread never leaves the try. A `return` or `throw` inside finally replaces whatever try or catch was doing, which is why it is discouraged.",
      ],
      [
        "Q17. What is a nested try block?",
        "A try block inside another try (or inside a catch or finally). If the inner try has no matching catch, the exception propagates to the **outer** try's catches. The inner finally always runs first, then the outer handlers. Nesting lets you handle a specific failure locally (for example, a bad record) while an outer block handles everything else (for example, a failed file). An exception thrown from an inner catch or finally also travels outwards. Deep nesting harms readability, so extract methods instead.",
      ],
      [
        "Q18. What exception rules apply when overriding a method?",
        "An overriding method:\n\n- **may** throw any **unchecked** exceptions, whatever the parent declares\n- **may** declare **the same, narrower (subclass), or fewer** checked exceptions\n- **may not** declare **new or broader** checked exceptions than the parent method\n\nThe reason is substitutability: code calling through the parent type handles only the parent's declared checked exceptions. So if the parent throws IOException, the child may throw FileNotFoundException, nothing, or RuntimeExceptions, but not Exception or SQLException. If the parent declares nothing, the child cannot add any checked exception. These rules apply to methods only; constructors are not overridden.",
      ],
      [
        "Q19. What happens when catch and finally both return, or try and finally both return?",
        "**The finally return wins** in both cases. In `try { return 1; } finally { return 2; }`, the try's return value 1 is computed and saved, finally then runs and executes `return 2`, which replaces it, so the method returns 2. In `try { throw ... } catch (...) { return 1; } finally { return 3; }`, the method returns 3. If try throws and finally returns, the exception is **silently discarded**. Without a return in finally, changing a variable in finally does not affect an already-evaluated primitive return value. A mutable object's state can still change, though.",
      ],
      [
        "Q20. How does exception propagation work?",
        "When an exception is not caught in the method where it occurs, that method's frame is removed (after its finally runs), and the exception is re-thrown at the call site in the caller. This continues down the call stack until a matching catch is found. If none is found, the thread's UncaughtExceptionHandler handles it, which by default prints the stack trace to stderr, and the thread dies. For the main thread, the JVM exits with status 1 once no other non-daemon threads remain. Checked exceptions propagate only through methods that declare them.",
      ],
    ],
    code: String.raw`public class Main {

    // Q13-Q15: a resource that reports when it is opened and closed.
    static class Resource implements AutoCloseable {
        private final String name; private final boolean failOnClose;
        Resource(String name, boolean failOnClose) {
            this.name = name; this.failOnClose = failOnClose;
            System.out.println("Q14   open " + name);
        }
        void use() { System.out.println("Q14   use " + name); }
        @Override public void close() {
            System.out.println("Q14   close " + name);
            if (failOnClose) throw new IllegalStateException("close failed: " + name);
        }
    }

    // Q19
    @SuppressWarnings("finally")
    static int tryAndFinallyReturn() { try { return 1; } finally { return 2; } }
    @SuppressWarnings("finally")
    static int catchAndFinallyReturn() {
        try { throw new RuntimeException("x"); }
        catch (RuntimeException e) { return 1; }
        finally { return 3; }
    }
    @SuppressWarnings("finally")
    static String finallySwallows() {
        try { throw new IllegalStateException("lost"); }
        finally { return "finally returned, exception discarded"; }
    }
    static int finallyChangesLocal() {
        int x = 10;
        try { return x; } finally { x = 99; }                  // the saved return value stays 10
    }
    static StringBuilder finallyChangesObject() {
        StringBuilder sb = new StringBuilder("try");
        try { return sb; } finally { sb.append("+finally"); }  // same object, so the change is visible
    }

    // Q18: overriding may narrow or drop checked exceptions.
    static class Reader { void read() throws java.io.IOException { } }
    static class FileReaderLike extends Reader {
        @Override void read() throws java.io.FileNotFoundException { throw new java.io.FileNotFoundException("narrower is fine"); }
    }
    static class SilentReader extends Reader { @Override void read() { } }   // fewer is fine

    // Q20
    static void level3() { throw new UnsupportedOperationException("deep failure"); }
    static void level2() { try { level3(); } finally { System.out.println("Q20   finally in level2 runs while unwinding"); } }
    static void level1() { level2(); }

    public static void main(String[] args) throws Exception {
        // Q11 + Q12: the first matching catch wins.
        Object[] inputs = {"12", "x", null};
        for (Object input : inputs) {
            try {
                int n = Integer.parseInt(((String) input).trim());
                System.out.println("Q12 parsed " + n);
            } catch (NumberFormatException e) {
                System.out.println("Q12 NumberFormatException branch for \"" + input + "\"");
            } catch (RuntimeException e) {
                System.out.println("Q12 general RuntimeException branch: " + e.getClass().getSimpleName());
            }
        }

        // Q13 + Q14 + Q15: reverse close order and a suppressed exception.
        try (Resource a = new Resource("A", false); Resource b = new Resource("B", true)) {
            a.use(); b.use();
            throw new IllegalArgumentException("body failed");
        } catch (IllegalArgumentException e) {
            System.out.println("Q14 caught '" + e.getMessage() + "' with suppressed: " + e.getSuppressed()[0].getMessage());
        }

        // Q16 + Q17: nested try, inner finally first, outer catch handles.
        try {
            try {
                System.out.println("Q17 inner try");
                Object o = null;
                o.toString();
            } finally {
                System.out.println("Q17 inner finally");
            }
        } catch (NullPointerException e) {
            System.out.println("Q17 outer catch got NullPointerException");
        } finally {
            System.out.println("Q16 outer finally");
        }

        // Q18
        Reader reader = new FileReaderLike();
        try { reader.read(); } catch (java.io.IOException e) { System.out.println("Q18 overriding method threw narrower " + e.getClass().getSimpleName()); }
        new SilentReader().read();
        System.out.println("Q18 SilentReader.read() declares nothing, called without try");

        // Q19
        System.out.println("Q19 try+finally return -> " + tryAndFinallyReturn() + ", catch+finally return -> " + catchAndFinallyReturn());
        System.out.println("Q19 " + finallySwallows());
        System.out.println("Q19 primitive changed in finally -> " + finallyChangesLocal() + ", object changed in finally -> " + finallyChangesObject());

        // Q20
        try { level1(); } catch (UnsupportedOperationException e) { System.out.println("Q20 main caught: " + e.getMessage()); }
    }
}`,
    walk:
      "In Q12, the input \"12\" parses. \"x\" matches the specific NumberFormatException catch first. null fails with a NullPointerException on `trim()`, which skips the first catch and is handled by the general RuntimeException catch. For Q14, resources A and B open in order, are used, and the body throws. B is closed first and throws on close, then A is closed. The body's exception reaches the catch, with B's close failure attached as a suppressed exception.\n\nIn Q17, the inner try throws a NullPointerException. The inner finally prints first, then the outer catch handles the exception, and the outer finally runs last. Q18 calls an overriding `read()` that declares the narrower FileNotFoundException, and a version that declares nothing. Q19 shows that a return in finally beats the try or catch return and even discards an exception. Assigning a primitive in finally does not change the saved return value, while mutating a returned object does. Q20 shows level2's finally running as the exception unwinds to main.",
    anim: [
      "try-with-resources closing order",
      [
        ["body", "try body", "uses A and B"],
        ["b", "resource B", "closes first"],
        ["a", "resource A", "closes second"],
        ["exc", "body exception", "primary"],
        ["catch", "catch block", "sees both"],
      ],
      [
        ["body", "exc", "throw", "The body throws IllegalArgumentException; leaving the block starts the closing."],
        ["exc", "b", "close B", "B was opened last, so it is closed first; its close() throws too."],
        ["b", "exc", "suppressed", "B's failure is attached to the primary exception with addSuppressed."],
        ["exc", "a", "close A", "A is still closed even though B's close failed."],
        ["a", "catch", "deliver", "Only then does catch run, with getSuppressed() holding B's close error."],
      ],
    ],
    mistakes: [
      "Ordering catch blocks from general to specific, which is a compile error.",
      "Returning or throwing from finally, which hides the real result or exception.",
      "Declaring a broader checked exception on an overriding method, which is a compile error.",
      "Closing resources manually in finally without handling exceptions from `close()`, so the original exception is lost.",
    ],
    qa: [
      [
        "What is a suppressed exception?",
        "An exception that occurred while another was already propagating, typically from `close()` in try-with-resources. It is stored on the primary exception through `addSuppressed` and read with `getSuppressed()`.",
      ],
      [
        "Does finally run if there is a return in catch?",
        "Yes. The return value is evaluated, finally runs, and then the method returns, unless finally itself returns or throws.",
      ],
      [
        "Can a constructor of an overriding class declare broader exceptions?",
        "Constructors are not overridden, so the rule does not apply. A subclass constructor must, however, handle or declare everything its `super(...)` call throws, so it can only declare the same or broader exceptions.",
      ],
    ],
    ex: [
      "What does `static int f() { int i = 0; try { i = 1; return i; } finally { i = 2; } }` return, and what if `return i;` were moved into finally?",
      "It returns 1, because the value of `i` is saved when `return i` executes, and finally then changes only the variable. With `return i;` in finally, it returns 2, because finally's return replaces the saved one (and the compiler warns that finally does not complete normally).",
    ],
  }),

  lesson("Exceptions Q21-Q26: Throwing from catch and finally, Catching Exception, Multi-catch, Overloading and Best Practices", {
    intro:
      "Questions 21 to 26, plus two unnumbered questions, finish the exception theory:\n\n- whether catch and finally can throw\n- why catching `Exception` is a bad idea\n- multiple catch vs multi-catch\n- overloading methods that differ only in their exception clauses\n- best practices\n- final, finally and finalize\n- ClassNotFoundException vs NoClassDefFoundError\n- the exceptions developers meet most often\n\nThe program reproduces NoClassDefFoundError and both causes of ClassNotFoundException.",
    topics: [
      [
        "Q21. Can catch and finally blocks throw exceptions?",
        "Yes. A **catch** block can throw: re-throw the same exception, wrap it (`throw new ServiceException(\"...\", e)`), or throw something unrelated. The new exception propagates to outer handlers, and a checked one must be declared. A **finally** block can throw too, but then the finally exception **replaces** any exception from try or catch, and the original is lost unless you add it with `addSuppressed`. Code in finally that might fail, such as `close()`, should be wrapped in its own try-catch, or replaced with try-with-resources.",
      ],
      [
        "Q22. Why shouldn't you catch Exception?",
        "`catch (Exception e)` catches **every** checked and unchecked exception, including bugs (NullPointerException, ClassCastException) and conditions such as InterruptedException that need special handling. The consequences:\n\n- You cannot react appropriately, because every failure is treated the same.\n- Programming errors are hidden instead of fixed.\n- New exceptions added later are silently absorbed.\n- Interrupt status is often lost.\n\nCatch the specific types you can actually handle, and let the others propagate. Catching Exception is acceptable only at a top-level boundary (a request handler, a thread loop, main) to log and translate.",
      ],
      [
        "Q23. What is the difference between multiple catch blocks and multi-catch?",
        "**Multiple catch** gives each exception type its own block and logic, ordered from specific to general. **Multi-catch** (Java 7), `catch (FileNotFoundException | SQLException e)`, handles several unrelated types with one block, removing duplicated code. Its rules:\n\n- The alternatives must not be subclasses of each other: `IOException | FileNotFoundException` is a compile error, because it is redundant.\n- The parameter `e` is implicitly final.\n- The static type of `e` is the closest common supertype.\n\nThe compiled bytecode is smaller than the duplicated blocks.",
      ],
      [
        "Q24. Can methods be overloaded on their exception clauses alone?",
        "No. Overloading is decided only by the **parameter list** (the number, types and order of parameters). Neither the return type nor the `throws` clause is part of the method signature. Two methods `void load() throws IOException` and `void load() throws SQLException` in the same class are a duplicate-method compile error. Overloads with different parameters, on the other hand, may declare completely different exceptions.",
      ],
      [
        "Q25. What are the best practices for exception handling?",
        "1. Catch specific exceptions, at the level where you can actually handle them.\n2. Never swallow exceptions; at least log them with context.\n3. Use try-with-resources for all closeable resources.\n4. Preserve the cause when wrapping: `new X(msg, e)`.\n5. Throw early (validate inputs) and catch late.\n6. Use standard exceptions (IllegalArgumentException, IllegalStateException, UnsupportedOperationException) when they fit, and custom ones for domain errors.\n7. Do not use exceptions for normal control flow.\n8. Do not return or throw from finally.\n9. Log once, at the boundary, not at every layer.\n10. Restore the interrupt flag (`Thread.currentThread().interrupt()`) when catching InterruptedException.\n11. Write meaningful messages that include the offending values.\n12. Document exceptions with `@throws`.",
      ],
      [
        "Q26. What is the difference between final, finally and finalize?",
        "- **final** is a modifier. A final variable cannot be reassigned, a final method cannot be overridden, and a final class cannot be subclassed.\n- **finally** is the block after try/catch that always runs, used for cleanup.\n- **finalize()** was a protected method of Object, called by the garbage collector before reclaiming an object. It was unpredictable (no guarantee it runs, nor when), slow, and could resurrect objects. It has been deprecated since Java 9 and marked for removal since Java 18 (JEP 421). Use try-with-resources or `java.lang.ref.Cleaner`.\n\nThe three are unrelated apart from the similar names.",
      ],
      [
        "What is the difference between ClassNotFoundException and NoClassDefFoundError?",
        "**ClassNotFoundException** is a **checked exception**. It is thrown when code **explicitly loads a class by name**, with `Class.forName(\"com.x.Driver\")`, `ClassLoader.loadClass` or `findSystemClass`, and the class is not on the classpath. It is usually a configuration problem you can handle, for example by falling back to another implementation.\n\n**NoClassDefFoundError** is an **Error**. The class was present at **compile time** and is referenced directly by code (`new Helper()`), but the JVM cannot find or define it at **runtime**. Typical causes are a missing JAR at runtime, or a class whose static initialiser failed earlier: the first attempt throws ExceptionInInitializerError, and every later use throws NoClassDefFoundError. Its cause is often a ClassNotFoundException.",
      ],
      [
        "Which exceptions are faced most often?",
        "- **Runtime bugs**: NullPointerException, ArrayIndexOutOfBoundsException and IndexOutOfBoundsException, ClassCastException, ArithmeticException (division by zero), NumberFormatException, IllegalArgumentException, IllegalStateException, ConcurrentModificationException, UnsupportedOperationException (modifying `List.of` or `Arrays.asList`).\n- **Checked**: IOException and FileNotFoundException, SQLException, InterruptedException, ClassNotFoundException, CloneNotSupportedException, ParseException.\n- **Errors**: OutOfMemoryError, StackOverflowError, NoClassDefFoundError, ExceptionInInitializerError.\n- **Frameworks**: DateTimeParseException, SocketTimeoutException, NoSuchElementException (Optional.get, Iterator.next).",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.*;

public class Main {

    static class BrokenInit {
        static final int VALUE = compute();              // fails once, so the class is unusable afterwards
        static int compute() { throw new IllegalStateException("static init failed"); }
    }

    // Q21: catch wraps; finally adds a suppressed exception instead of losing the original.
    static void process() throws IOException {
        IOException primary = null;
        try {
            throw new FileNotFoundException("input.csv");
        } catch (FileNotFoundException e) {
            primary = new IOException("cannot process input", e);   // thrown from catch
            throw primary;
        } finally {
            try {
                throw new IllegalStateException("cleanup failed");
            } catch (IllegalStateException cleanup) {
                if (primary != null) primary.addSuppressed(cleanup);   // keep both
            }
        }
    }

    public static void main(String[] args) {
        // Q21
        try { process(); }
        catch (IOException e) {
            System.out.println("Q21 " + e.getMessage() + " | cause " + e.getCause().getMessage()
                    + " | suppressed " + e.getSuppressed()[0].getMessage());
        }

        // Q22: a broad catch hides a bug; a specific one lets it surface.
        List<String> names = Arrays.asList("x", null);
        int hidden = 0;
        for (String n : names) {
            try { hidden += n.length(); } catch (Exception e) { /* swallowed: the NPE bug disappears */ }
        }
        System.out.println("Q22 catch(Exception) silently produced " + hidden + " (the null was a bug)");

        // Q23: one handler for unrelated types.
        for (String s : new String[] {"abc", "5"}) {
            try {
                int value = Integer.parseInt(s);
                Object o = value == 5 ? "not a number" : value;
                Integer forced = (Integer) o;
            } catch (NumberFormatException | ClassCastException e) {
                System.out.println("Q23 multi-catch handled " + e.getClass().getSimpleName());
            }
        }

        // Q24: overloads differ by parameters, not by throws.
        System.out.println("Q24 " + load("cfg") + " / " + load(3));

        // Q26: final variable
        final String fixed = "immutable reference";
        System.out.println("Q26 final -> " + fixed + "; finalize() is deprecated for removal");

        // ClassNotFoundException: loading a class by name that does not exist.
        try {
            Class.forName("com.example.MissingDriver");
        } catch (ClassNotFoundException e) {
            System.out.println("CNFE checked exception: " + e.getMessage());
        }

        // NoClassDefFoundError: the class exists but its static initializer failed earlier.
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                System.out.println(BrokenInit.VALUE);
            } catch (ExceptionInInitializerError e) {
                System.out.println("NCDFE attempt " + attempt + ": ExceptionInInitializerError (" + e.getCause().getMessage() + ")");
            } catch (NoClassDefFoundError e) {
                System.out.println("NCDFE attempt " + attempt + ": NoClassDefFoundError for " + e.getMessage().replace("Could not initialize class ", ""));
            }
        }

        // Most common exceptions, triggered one by one.
        List<Runnable> faults = List.of(
                () -> { String s = null; s.length(); },
                () -> { int[] a = new int[1]; a[2] = 0; },
                () -> { Object o = "s"; Integer i = (Integer) o; },
                () -> { int z = 0; int r = 10 / z; },
                () -> Integer.parseInt("12a"),
                () -> List.of(1).add(2),
                () -> new ArrayList<Integer>().iterator().next());
        StringJoiner seen = new StringJoiner(", ");
        for (Runnable fault : faults) {
            try { fault.run(); } catch (RuntimeException e) { seen.add(e.getClass().getSimpleName()); }
        }
        System.out.println("Common: " + seen);
    }

    static String load(String name) { return "load(String) " + name; }
    static String load(int id) { return "load(int) " + id; }
}`,
    walk:
      "Q21's catch block wraps the FileNotFoundException in a new IOException and throws it. The finally block's cleanup fails, but instead of replacing the primary exception, it is added as suppressed, so the caller sees the message, the cause and the suppressed exception. In Q22, `catch (Exception e)` swallows the NullPointerException from the null element and the program carries on with a wrong total, which is exactly the danger of broad catches. Q23 handles a NumberFormatException and a ClassCastException with one multi-catch.\n\n`Class.forName` on a missing class gives the checked ClassNotFoundException. BrokenInit's static initialiser throws. The first access gets ExceptionInInitializerError, and the second gets NoClassDefFoundError (\"Could not initialize class Main$BrokenInit\"), although the class file exists. The last block triggers seven of the most common runtime exceptions and lists their names.",
    anim: [
      "Why a failed static init becomes NoClassDefFoundError",
      [
        ["use1", "first use", "BrokenInit.VALUE"],
        ["init", "static init", "compute() throws"],
        ["eiie", "EIIE", "attempt 1"],
        ["state", "class state", "erroneous"],
        ["ncdfe", "NoClassDefFound", "attempt 2+"],
      ],
      [
        ["use1", "init", "initialize", "The first access triggers class initialisation and runs the static initializer."],
        ["init", "eiie", "throws", "compute() throws, so the JVM wraps it in ExceptionInInitializerError."],
        ["init", "state", "mark failed", "The JVM marks the class as erroneous; it is never initialised again."],
        ["state", "ncdfe", "second use", "Any later use finds the erroneous class and throws NoClassDefFoundError."],
        ["ncdfe", "use1", "root cause", "To debug, look for the first ExceptionInInitializerError in the logs."],
      ],
    ],
    mistakes: [
      "Throwing from finally, which silently drops the exception that was already propagating.",
      "Writing `catch (IOException | FileNotFoundException e)`. Alternatives in a multi-catch cannot be related by subclassing.",
      "Debugging NoClassDefFoundError only by checking the classpath, when the real cause is an earlier ExceptionInInitializerError.",
    ],
    qa: [
      [
        "How do you handle InterruptedException correctly?",
        "Either let it propagate (declare `throws InterruptedException`), or catch it and call `Thread.currentThread().interrupt()` to restore the flag, so that code further up knows the thread was asked to stop.",
      ],
      [
        "Is it possible to re-throw a more precise type from `catch (Exception e)`?",
        "Yes, since Java 7 (precise rethrow). If the try can only throw IOException and SQLException, `catch (Exception e) { throw e; }` lets the method declare just those two, as long as `e` is not reassigned.",
      ],
      [
        "Why is NoClassDefFoundError an Error and not an exception?",
        "It signals a broken runtime environment or class state (a linkage failure) that the application usually cannot fix by retrying, so it belongs to the LinkageError branch of Error.",
      ],
    ],
    ex: [
      "Rewrite `try { r = open(); use(r); } finally { r.close(); }` so that a failure in `close()` never hides a failure in `use()`. Give the shortest correct version.",
      "`try (Resource r = open()) { use(r); }`. If `use` throws and `close` throws too, the close exception is attached as suppressed and the original propagates. A null `r` is skipped automatically.",
    ],
  }),
];
