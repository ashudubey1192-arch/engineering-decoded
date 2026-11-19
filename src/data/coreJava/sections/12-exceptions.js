import { lesson, section } from "../schema.js";

export default section("exceptions", "Exception Handling", [
  lesson("Exception Hierarchy", {
    intro:
      "An exception is an event that disrupts the normal flow of a program, such as a missing file, invalid input or a null reference. Java represents every such event as an object whose class sits in one hierarchy rooted at `Throwable`. This lesson explains what an exception is and walks through the hierarchy: `Throwable`, `Error`, `Exception` and `RuntimeException`.",
    topics: [
      [
        "What an exception is",
        "When something goes wrong, the JVM or your code creates an exception object describing the problem (type, message, stack trace) and throws it. The normal flow stops and the runtime looks for a matching handler up the call stack. If none is found, the thread terminates and the default handler prints the stack trace.",
      ],
      [
        "Throwable",
        "The root of everything that can be thrown or caught. It stores the message, the cause and the stack trace, and provides `getMessage()`, `getCause()`, `printStackTrace()`, `getStackTrace()` and `getSuppressed()`. Only `Throwable` and its subclasses can be used with `throw` and `catch`.",
      ],
      [
        "Error",
        "Serious problems the application should normally not try to handle, usually from the JVM: `OutOfMemoryError`, `StackOverflowError`, `NoClassDefFoundError`, `ExceptionInInitializerError`, `AssertionError`. They are unchecked.",
      ],
      [
        "Exception and RuntimeException",
        "`Exception` covers conditions a program might want to handle. Its direct subclasses other than `RuntimeException` are checked exceptions (`IOException`, `SQLException`, `InterruptedException`, `ClassNotFoundException`). `RuntimeException` and its subclasses are unchecked and usually indicate programming bugs: `NullPointerException`, `IllegalArgumentException`, `IndexOutOfBoundsException`, `ArithmeticException`, `ClassCastException`.",
      ],
    ],
    code: String.raw`import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static String chain(Class<?> c) {
        List<String> names = new ArrayList<>();
        for (Class<?> k = c; k != null; k = k.getSuperclass()) names.add(k.getSimpleName());
        return String.join(" -> ", names);
    }

    static String kind(Class<? extends Throwable> c) {
        if (Error.class.isAssignableFrom(c)) return "Error (unchecked)";
        if (RuntimeException.class.isAssignableFrom(c)) return "RuntimeException (unchecked)";
        return "checked Exception";
    }

    public static void main(String[] args) {
        List<Class<? extends Throwable>> types = List.of(FileNotFoundException.class, NullPointerException.class,
                ArithmeticException.class, InterruptedException.class, StackOverflowError.class, OutOfMemoryError.class);
        for (Class<? extends Throwable> t : types) {
            System.out.println(kind(t) + ": " + chain(t));
        }

        try {
            throw new FileNotFoundException("config.yml not found");
        } catch (IOException e) {                     // a superclass catches its subclasses
            System.out.println("caught via IOException: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }

        try {
            Object o = null;
            o.toString();
        } catch (Throwable t) {                       // the root catches everything (avoid in real code)
            System.out.println("Throwable caught " + t.getClass().getSimpleName()
                    + ", stack trace depth > 0: " + (t.getStackTrace().length > 0));
        }
    }
}`,
    walk:
      "`chain` walks up the superclasses of each exception type, printing the full path to `Object`, and `kind` classifies it. `FileNotFoundException` and `InterruptedException` descend from `Exception` but not `RuntimeException`, so they are checked; `NullPointerException` and `ArithmeticException` are runtime exceptions; the two errors descend from `Error` through `VirtualMachineError`.\n\nA `catch (IOException e)` handles the more specific `FileNotFoundException`, because catch blocks match subclasses. Catching `Throwable` catches anything, including the `NullPointerException`, whose stack trace records where it happened.",
    anim: [
      "The Throwable family",
      [
        ["thr", "Throwable", "root"],
        ["err", "Error", "JVM problems"],
        ["exc", "Exception", "checked"],
        ["rte", "RuntimeException", "unchecked"],
        ["npe", "NullPointer...", "a bug"],
        ["ioe", "IOException", "must handle"],
      ],
      [
        ["thr", "err", "extends", "Error covers serious JVM-level problems such as OutOfMemoryError."],
        ["thr", "exc", "extends", "Exception covers conditions programs may recover from."],
        ["exc", "ioe", "checked", "IOException is checked: the compiler forces you to handle or declare it."],
        ["exc", "rte", "extends", "RuntimeException is the branch of unchecked exceptions."],
        ["rte", "npe", "unchecked", "NullPointerException is unchecked, usually a programming bug."],
      ],
    ],
    mistakes: [
      "Catching `Throwable` or `Exception` everywhere, which also swallows bugs and errors.",
      "Thinking `Error` and `Exception` are unrelated; both extend `Throwable`.",
    ],
    qa: [
      ["What is the root class of the exception hierarchy?", "`java.lang.Throwable`, with the two main subclasses `Error` and `Exception`."],
      ["Is RuntimeException checked or unchecked?", "Unchecked, along with all its subclasses and all Errors."],
      ["Can you throw an object that does not extend Throwable?", "No. Only Throwable and its subclasses can be thrown."],
    ],
    ex: [
      "Is `ClassCastException` checked or unchecked? What about `CloneNotSupportedException`?",
      "`ClassCastException` extends RuntimeException, so it is unchecked. `CloneNotSupportedException` extends Exception directly, so it is checked.",
    ],
  }),

  lesson("Checked vs Unchecked Exceptions and Errors", {
    intro:
      "Java splits throwables into checked exceptions, which the compiler forces you to handle or declare, and unchecked ones (runtime exceptions and errors), which it does not. Knowing which is which, and why, shapes how you design APIs. This lesson defines each kind, lists typical examples, explains the differences and demonstrates a `StackOverflowError`.",
    topics: [
      [
        "Checked exceptions",
        "Subclasses of `Exception` that are not `RuntimeException`. The compiler checks that every method that can throw one either catches it or declares it with `throws`. They represent recoverable conditions outside the program's control: a missing file (`FileNotFoundException`), a network failure (`IOException`), a database error (`SQLException`), an interrupted wait (`InterruptedException`).",
      ],
      [
        "Unchecked exceptions",
        "`RuntimeException` and its subclasses. The compiler does not require handling. They usually mean a bug or a violated precondition: `NullPointerException`, `ArrayIndexOutOfBoundsException`, `IllegalArgumentException`, `NumberFormatException`, `ArithmeticException`. Fix the code rather than catching them, except at boundaries (for example a REST controller turning them into a 400 response).",
      ],
      [
        "Errors",
        "`Error` and its subclasses are also unchecked and indicate problems the application usually cannot recover from: `OutOfMemoryError`, `StackOverflowError`, `NoClassDefFoundError`. Catching them is rarely appropriate, except to log and shut down cleanly.",
      ],
      [
        "Differences in one place",
        "Compile-time checking: checked yes, unchecked no. Base class: `Exception` vs `RuntimeException`/`Error`. Cause: external conditions vs programming errors or JVM failures. Handling: must catch or declare vs optional. Lambdas: standard functional interfaces cannot throw checked exceptions, which is one reason modern APIs lean toward unchecked exceptions.",
      ],
      [
        "StackOverflowError example",
        "Each method call pushes a frame on the thread's stack. Unbounded recursion (missing base case) keeps pushing frames until the stack (`-Xss`, typically 512 KB to 1 MB) is exhausted and the JVM throws `StackOverflowError`.",
      ],
    ],
    code: String.raw`import java.io.FileReader;
import java.io.IOException;

public class Main {
    static int depth = 0;

    static void readConfig(String path) throws IOException {   // checked: must declare or catch
        try (FileReader reader = new FileReader(path)) {
            System.out.println("first char: " + (char) reader.read());
        }
    }

    static int parseAge(String text) {                         // unchecked: no throws needed
        int age = Integer.parseInt(text);
        if (age < 0) throw new IllegalArgumentException("age must be >= 0");
        return age;
    }

    static void recurseForever() {
        depth++;
        recurseForever();                                       // no base case
    }

    public static void main(String[] args) {
        try {
            readConfig("missing-config.txt");
        } catch (IOException e) {
            System.out.println("checked   " + e.getClass().getSimpleName() + ": handled because the compiler required it");
        }

        for (String input : new String[] {"25", "abc", "-3"}) {
            try {
                System.out.println("unchecked parseAge(\"" + input + "\") = " + parseAge(input));
            } catch (RuntimeException e) {
                System.out.println("unchecked " + e.getClass().getSimpleName() + ": " + e.getMessage());
            }
        }

        try {
            recurseForever();
        } catch (StackOverflowError e) {
            System.out.println("error     StackOverflowError after more than 1000 frames: " + (depth > 1000));
        }
    }
}`,
    walk:
      "`readConfig` declares `throws IOException` because opening a file can fail; `main` must catch it, and does when the file is missing (`FileNotFoundException`). `parseAge` throws unchecked exceptions without declaring them: \"abc\" causes `NumberFormatException` inside `parseInt`, and -3 triggers the `IllegalArgumentException`.\n\n`recurseForever` has no base case, so frames pile up until the thread's stack is full and the JVM throws `StackOverflowError`. Catching it here is only for demonstration.",
    anim: [
      "Who checks what",
      [
        ["code", "Your method", "may throw"],
        ["javac", "Compiler", "checks"],
        ["checked", "IOException", "checked"],
        ["unchecked", "NPE / IAE", "unchecked"],
        ["runtime", "At runtime", "propagates"],
      ],
      [
        ["code", "javac", "compile", "The compiler inspects every call that can throw a checked exception."],
        ["javac", "checked", "enforce", "For IOException it demands a catch block or a throws clause."],
        ["javac", "unchecked", "ignore", "Runtime exceptions and errors are not checked at compile time."],
        ["unchecked", "runtime", "throw", "They still propagate at runtime if they occur and nothing catches them."],
      ],
    ],
    mistakes: [
      "Wrapping every checked exception in `RuntimeException` without context, losing the reason.",
      "Catching `NullPointerException` instead of preventing it.",
      "Declaring `throws Exception` on every method, which hides what can actually fail.",
    ],
    qa: [
      ["What is the difference between checked and unchecked exceptions?", "Checked exceptions are verified by the compiler and must be caught or declared; unchecked ones (RuntimeException and Error subclasses) are not."],
      ["Give examples of checked and unchecked exceptions.", "Checked: IOException, SQLException, InterruptedException, ClassNotFoundException. Unchecked: NullPointerException, ArithmeticException, IllegalArgumentException, ArrayIndexOutOfBoundsException."],
      ["Can you catch a StackOverflowError?", "Technically yes, since it is a Throwable, but you should fix the recursion instead."],
    ],
    ex: [
      "Should a method that validates user input throw a checked or unchecked exception when the input is invalid? Justify.",
      "Usually unchecked (such as IllegalArgumentException or a custom ValidationException extending RuntimeException): the caller violated a precondition and handling can happen at a boundary. Use checked only if callers are realistically expected to recover at each call site.",
    ],
  }),

  lesson("The Five Keywords: try, catch, finally, throw and throws", {
    intro:
      "Java's exception handling uses five keywords: `try` marks code that might fail, `catch` handles a specific exception, `finally` runs cleanup no matter what, `throw` raises an exception, and `throws` declares exceptions a method may raise. This lesson explains each keyword and how they work together, including when finally does and does not run.",
    topics: [
      [
        "try",
        "A `try` block wraps code that may throw. It must be followed by at least one `catch` or a `finally` (or be a try-with-resources). Variables declared inside it are not visible in the catch or finally blocks.",
      ],
      [
        "catch",
        "`catch (ExceptionType e)` handles an exception of that type or any subclass. Several catch blocks are checked in order and the first match wins, so more specific types must come first. Inside, `e.getMessage()`, `e.printStackTrace()` and logging are typical.",
      ],
      [
        "finally",
        "Runs after the try (and any catch) whether an exception was thrown, caught, rethrown, or the block ended with `return`, `break` or `continue`. Use it to release resources. It does not run if the JVM exits (`System.exit`), the thread is killed, or the machine crashes; an infinite loop or deadlock in try also prevents it.",
      ],
      [
        "throw",
        "`throw new IllegalStateException(\"msg\");` raises an exception explicitly. It takes a single `Throwable` instance. Code after an unconditional throw is unreachable. You can also rethrow a caught exception: `throw e;`.",
      ],
      [
        "throws",
        "Part of a method signature, listing checked exceptions it may throw: `void load() throws IOException, SQLException`. Callers must handle or declare them. Unchecked exceptions may be listed for documentation but need not be.",
      ],
    ],
    code: String.raw`import java.io.IOException;

public class Main {
    static int withdraw(int balance, int amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");    // throw
        if (amount > balance) throw new IllegalStateException("insufficient funds");
        return balance - amount;
    }

    static String fetch(String url) throws IOException {                                   // throws
        if (!url.startsWith("https")) throw new IOException("insecure URL: " + url);
        return "data from " + url;
    }

    static String withFinallyAndReturn() {
        try {
            return "value from try";
        } finally {
            System.out.println("  finally runs even when try returns");
        }
    }

    public static void main(String[] args) {
        int[] amounts = {300, -5, 5000};
        for (int amount : amounts) {
            try {                                                                            // try
                int left = withdraw(1000, amount);
                System.out.println("withdrew " + amount + ", left " + left);
            } catch (IllegalArgumentException e) {                                           // catch (specific)
                System.out.println("bad input: " + e.getMessage());
            } catch (IllegalStateException e) {
                System.out.println("rejected: " + e.getMessage());
            } finally {                                                                      // finally
                System.out.println("  audit log written for amount " + amount);
            }
        }

        try {
            System.out.println(fetch("https://example.com"));
            System.out.println(fetch("http://example.com"));
        } catch (IOException e) {
            System.out.println("IOException: " + e.getMessage());
        }

        System.out.println(withFinallyAndReturn());
    }
}`,
    walk:
      "`withdraw` uses `throw` for invalid amounts. In the loop, 300 succeeds, -5 is caught by the `IllegalArgumentException` block, and 5000 by the `IllegalStateException` block. The `finally` block writes the audit line in all three cases.\n\n`fetch` declares `throws IOException`, so `main` must handle it; the second call fails and jumps straight to the catch block, skipping the println. In `withFinallyAndReturn`, the `finally` block runs before the method actually returns its value.",
    anim: [
      "try / catch / finally flow",
      [
        ["try", "try block", "withdraw(...)"],
        ["ok", "success", "next statement"],
        ["throw", "throw", "exception object"],
        ["catch", "matching catch", "handle"],
        ["fin", "finally", "always runs"],
      ],
      [
        ["try", "ok", "no error", "If the try block completes normally, the catch blocks are skipped."],
        ["try", "throw", "error", "If something throws, the rest of the try block is skipped."],
        ["throw", "catch", "match", "The first catch whose type matches the exception handles it."],
        ["catch", "fin", "cleanup", "finally runs afterwards in every case: success, caught, or uncaught."],
      ],
    ],
    mistakes: [
      "Putting a general `catch (Exception e)` before specific ones, which makes the later blocks unreachable (a compile error).",
      "Returning from `finally`, which silently discards an exception or the try's return value.",
      "Using `throws` and `throw` interchangeably; one declares, the other raises.",
    ],
    qa: [
      ["Can a try block exist without catch?", "Yes, with a finally block (`try { } finally { }`) or as try-with-resources."],
      ["When does finally not execute?", "When the JVM exits (System.exit, crash, kill) or the thread never leaves the try block (infinite loop, deadlock)."],
      ["What is the difference between throw and throws?", "`throw` raises one exception instance inside a method; `throws` in the signature declares the exception types the method may propagate."],
    ],
    ex: [
      "What does `static int f() { try { throw new RuntimeException(); } catch (RuntimeException e) { return 1; } finally { System.out.print(\"F \"); } }` print and return?",
      "It prints `F ` and returns 1: the catch block prepares the return value 1, then finally runs before the method returns.",
    ],
  }),

  lesson("Nested try, Multiple catch Blocks and Returning from catch and finally", {
    intro:
      "Real code often needs more than one try-catch: several catch blocks for different failures, try blocks inside other try blocks, and sometimes return statements in catch or finally. These combinations have precise rules that interview questions love. This lesson covers multiple catch blocks and their order, nested try-catch, and what happens when both catch and finally return a value.",
    topics: [
      [
        "Multiple catch blocks",
        "One try can have many catch blocks. They are tested from top to bottom and only the first matching one runs. A subclass must come before its superclass; putting `catch (Exception e)` before `catch (IOException e)` is a compile error (\"exception has already been caught\").",
      ],
      [
        "Nested try-catch",
        "A try block can contain another try-catch. If the inner block does not catch an exception, it propagates to the outer try's catch blocks. Each level's finally runs as the exception passes through. Nesting is useful when part of the work can fail independently, but deep nesting hurts readability; extract methods instead.",
      ],
      [
        "Return in catch and finally",
        "If catch returns a value and finally also returns, the finally's return wins and replaces the catch's. If finally returns while an exception is propagating, the exception is discarded. If finally modifies a variable that try or catch already returned, a primitive return value is unaffected (it was already evaluated) but a returned object's state can still be changed.",
      ],
      [
        "Exceptions thrown from finally",
        "If finally throws, that exception replaces any exception from try or catch, which is then lost. Try-with-resources avoids this by attaching such exceptions as suppressed.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static String classify(String input) {
        try {
            int[] data = {10, 20};
            int index = Integer.parseInt(input);
            return "value " + (data[index] / (index == 0 ? 0 : 1));
        } catch (NumberFormatException e) {                    // most specific first
            return "not a number";
        } catch (ArrayIndexOutOfBoundsException e) {
            return "index out of range";
        } catch (RuntimeException e) {                         // broader last
            return "other: " + e.getClass().getSimpleName();
        }
    }

    @SuppressWarnings("finally")
    static int bothReturn() {
        try {
            throw new IllegalStateException();
        } catch (IllegalStateException e) {
            return 1;
        } finally {
            return 2;                                          // overrides catch's return
        }
    }

    static int primitiveNotChanged() {
        int x = 10;
        try { return x; } finally { x = 99; }                 // return value already evaluated
    }

    static List<String> objectChanged() {
        List<String> list = new ArrayList<>(List.of("try"));
        try { return list; } finally { list.add("finally"); } // same object, state changed
    }

    @SuppressWarnings("finally")
    static String swallowed() {
        try {
            throw new RuntimeException("important failure");
        } finally {
            return "finally returned, exception lost";
        }
    }

    public static void main(String[] args) {
        for (String in : new String[] {"1", "x", "5", "0"}) System.out.println("classify(" + in + ") -> " + classify(in));

        try {                                                   // outer
            try {                                               // inner
                Object o = "text";
                Integer n = (Integer) o;
            } catch (NumberFormatException e) {
                System.out.println("inner catch (not reached)");
            } finally {
                System.out.println("inner finally");
            }
        } catch (ClassCastException e) {
            System.out.println("outer catch handled ClassCastException");
        }

        System.out.println("catch returns 1, finally returns 2 -> " + bothReturn());
        System.out.println("finally changes primitive after return -> " + primitiveNotChanged());
        System.out.println("finally changes returned object -> " + objectChanged());
        System.out.println(swallowed());
    }
}`,
    walk:
      "`classify` has three catch blocks from specific to general. \"x\" fails parsing, \"5\" is out of range, and \"0\" causes division by zero, an `ArithmeticException` handled by the general `RuntimeException` block; \"1\" succeeds.\n\nIn the nested example, the inner try has no matching catch for `ClassCastException`, so its finally runs and the exception propagates to the outer catch. `bothReturn` shows finally's return replacing the catch's. `primitiveNotChanged` returns 10 because the value was computed before finally ran, while `objectChanged` returns a list that finally modified. `swallowed` shows a return in finally silently discarding an exception.",
    anim: [
      "Exception leaving a nested try",
      [
        ["inner", "inner try", "ClassCastException"],
        ["ic", "inner catch", "NumberFormat only"],
        ["if", "inner finally", "runs"],
        ["oc", "outer catch", "ClassCast"],
        ["done", "continue", "after outer"],
      ],
      [
        ["inner", "ic", "no match", "The inner catch handles NumberFormatException only, so it does not match."],
        ["inner", "if", "cleanup", "The inner finally still runs as the exception leaves the inner try."],
        ["if", "oc", "propagate", "The exception moves outward and the outer catch for ClassCastException matches."],
        ["oc", "done", "handled", "After handling, execution continues after the outer try statement."],
      ],
    ],
    mistakes: [
      "Ordering catch blocks from general to specific (compile error).",
      "Returning from finally, which hides exceptions and overrides results.",
    ],
    qa: [
      ["What happens if both catch and finally return a value?", "The method returns the value from finally; the catch's return value is discarded."],
      ["Can we have multiple catch blocks for one try?", "Yes. They are checked in order and only the first match runs; subclasses must come before superclasses."],
      ["If finally modifies a returned variable, does the caller see it?", "Not for primitives or reassigned references (the value was already captured), but yes for changes to the state of a returned object."],
    ],
    ex: [
      "What does this return? `int f() { int i = 0; try { i = 1; return i; } catch (Exception e) { i = 2; return i; } finally { i = 3; } }`",
      "1. No exception occurs, so try returns the value 1; finally sets i to 3, but the return value was already evaluated.",
    ],
  }),

  lesson("Creating Custom Checked and Unchecked Exceptions", {
    intro:
      "The standard exceptions cannot describe your domain: \"insufficient balance\", \"order already shipped\", \"invalid coupon\". Custom exceptions make failures self-explanatory and let callers handle them precisely. This lesson shows how to create user-defined checked and unchecked exceptions, which constructors to provide, how to add fields, and how to choose between checked and unchecked.",
    topics: [
      [
        "User-defined checked exception",
        "Extend `Exception` (not `RuntimeException`): `class InsufficientFundsException extends Exception`. Methods that throw it must declare `throws InsufficientFundsException`, and callers must handle it. Use it when callers can and should recover at the call site.",
      ],
      [
        "User-defined unchecked exception",
        "Extend `RuntimeException`: `class OrderNotFoundException extends RuntimeException`. No `throws` declaration is required. Use it for programming errors or for failures that are handled centrally (for example by a global exception handler in a web framework).",
      ],
      [
        "Constructors to provide",
        "Mirror the standard ones: no-arg, `(String message)`, `(String message, Throwable cause)` and `(Throwable cause)`, each calling `super(...)`. The cause constructors let you chain the original exception so its stack trace is not lost.",
      ],
      [
        "Adding context fields",
        "Custom exceptions can carry data callers need: the shortfall amount, the order id, an error code. Make the fields final and expose getters. Keep the message human-readable and include key values.",
      ],
      [
        "Naming and serialisation",
        "End the name with `Exception`. `Throwable` implements `Serializable`, so add a `serialVersionUID`. Do not create a custom exception when a standard one fits (`IllegalArgumentException`, `IllegalStateException`, `UnsupportedOperationException`).",
      ],
    ],
    code: String.raw`public class Main {
    // Checked: callers must handle it
    static class InsufficientFundsException extends Exception {
        private static final long serialVersionUID = 1L;
        private final double shortfall;
        InsufficientFundsException(String message, double shortfall) {
            super(message);
            this.shortfall = shortfall;
        }
        double getShortfall() { return shortfall; }
    }

    // Unchecked: handled centrally, no throws clause needed
    static class AccountNotFoundException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        AccountNotFoundException(String id) { super("account " + id + " does not exist"); }
        AccountNotFoundException(String id, Throwable cause) { super("account " + id + " does not exist", cause); }
    }

    static double balance = 500;

    static void withdraw(String accountId, double amount) throws InsufficientFundsException {
        if (!accountId.startsWith("ACC")) throw new AccountNotFoundException(accountId);
        if (amount > balance) {
            throw new InsufficientFundsException("cannot withdraw " + amount + ", balance is " + balance, amount - balance);
        }
        balance -= amount;
        System.out.println("withdrew " + amount + ", balance " + balance);
    }

    static void loadAccount(String id) {
        try {
            Integer.parseInt(id.substring(3));
        } catch (NumberFormatException e) {
            throw new AccountNotFoundException(id, e);          // chain the cause
        }
    }

    public static void main(String[] args) {
        try {
            withdraw("ACC-1", 200);
            withdraw("ACC-1", 1000);
        } catch (InsufficientFundsException e) {
            System.out.println("checked: " + e.getMessage() + " (short by " + e.getShortfall() + ")");
        }

        try {
            withdraw("XYZ", 10);
        } catch (InsufficientFundsException e) {
            System.out.println("not reached");
        } catch (AccountNotFoundException e) {
            System.out.println("unchecked: " + e.getMessage());
        }

        try {
            loadAccount("ACCabc");
        } catch (AccountNotFoundException e) {
            System.out.println("unchecked with cause: " + e.getMessage() + " <- " + e.getCause().getClass().getSimpleName());
        }
        System.out.println("InsufficientFundsException is checked: "
                + !RuntimeException.class.isAssignableFrom(InsufficientFundsException.class));
    }
}`,
    walk:
      "`InsufficientFundsException` extends `Exception`, so `withdraw` must declare it and `main` must catch it. It carries the shortfall amount, which the handler prints. The first withdrawal succeeds; the second exceeds the 300 remaining and throws.\n\n`AccountNotFoundException` extends `RuntimeException`, so `withdraw` throws it without declaring it; `main` catches it separately. `loadAccount` wraps a `NumberFormatException` as the cause of an `AccountNotFoundException`, preserving the original failure.",
    anim: [
      "Throwing a custom checked exception",
      [
        ["call", "withdraw(1000)", "caller"],
        ["check", "amount > balance", "rule"],
        ["new", "new Insufficient", "with shortfall"],
        ["catch", "catch block", "caller handles"],
        ["use", "getShortfall()", "700"],
      ],
      [
        ["call", "check", "validate", "withdraw compares the requested amount with the current balance."],
        ["check", "new", "throw", "The rule fails, so it creates the custom exception with the shortfall."],
        ["new", "catch", "propagate", "The checked exception travels to the caller, which was forced to catch it."],
        ["catch", "use", "context", "The handler reads the extra field to show a useful message."],
      ],
    ],
    mistakes: [
      "Creating custom exceptions without the cause constructor, so wrapped stack traces are lost.",
      "Making every domain exception checked, forcing try-catch noise everywhere.",
      "Extending `Throwable` or `Error` directly for application exceptions.",
    ],
    qa: [
      ["How do you create a custom checked exception?", "Extend Exception and provide constructors that call super(message) and super(message, cause)."],
      ["How do you create a custom unchecked exception?", "Extend RuntimeException."],
      ["When should a custom exception be checked?", "When the caller is expected to recover at the call site; otherwise prefer unchecked."],
    ],
    ex: [
      "Create `InvalidCouponException` (unchecked) carrying the coupon code and use it in `applyCoupon(String code)` when the code does not start with \"SAVE\".",
      "`class InvalidCouponException extends RuntimeException { final String code; InvalidCouponException(String c) { super(\"invalid coupon \" + c); code = c; } }` and `if (!code.startsWith(\"SAVE\")) throw new InvalidCouponException(code);`.",
    ],
  }),

  lesson("Try-with-Resources and AutoCloseable", {
    intro:
      "Before Java 7, closing files, sockets and database connections correctly required verbose finally blocks with nested try-catch. Java 7 introduced try-with-resources, also called automatic resource management (ARM): resources declared in the try header are closed automatically. This lesson covers the syntax, `AutoCloseable` and `Closeable`, closing order, suppressed exceptions and the Java 9 improvement.",
    topics: [
      [
        "The old way and the Java 7 catch block improvements",
        "Previously you opened a resource before try and closed it in finally, wrapping `close()` in another try-catch and checking for null. Java 7 added try-with-resources and, in the same release, multi-catch (`catch (IOException | SQLException e)`) and more precise rethrow, which together simplified exception handling.",
      ],
      [
        "Syntax",
        "`try (BufferedReader r = new BufferedReader(new FileReader(f))) { ... }`. Several resources are separated by semicolons. Each resource variable is implicitly final. The try can still have catch and finally blocks, which run after the resources are closed. Since Java 9 you can use an existing effectively final variable: `try (reader) { ... }`.",
      ],
      [
        "AutoCloseable and Closeable",
        "Any class implementing `java.lang.AutoCloseable` (one method, `void close() throws Exception`) can be used. `java.io.Closeable` extends it with `close() throws IOException` and must be idempotent. Streams, readers, writers, sockets, JDBC connections, statements and result sets, `Scanner` and executor services (Java 19) all implement it.",
      ],
      [
        "Closing order",
        "Resources are closed in reverse order of declaration, right after the try block finishes, whether normally or with an exception, so a statement closes before its connection.",
      ],
      [
        "Suppressed exceptions",
        "If the try block throws and then `close()` also throws, the exception from the body is the one propagated, and the close exception is attached to it as a suppressed exception (`e.getSuppressed()`). In the old finally style the close exception would have replaced the original one.",
      ],
    ],
    code: String.raw`public class Main {
    static class Resource implements AutoCloseable {
        private final String name;
        private final boolean failOnClose;
        Resource(String name, boolean failOnClose) {
            this.name = name;
            this.failOnClose = failOnClose;
            System.out.println("  open  " + name);
        }
        void use() { System.out.println("  use   " + name); }
        @Override public void close() {
            System.out.println("  close " + name);
            if (failOnClose) throw new IllegalStateException("close failed for " + name);
        }
    }

    public static void main(String[] args) {
        System.out.println("1. normal use, closed in reverse order:");
        try (Resource connection = new Resource("connection", false);
             Resource statement = new Resource("statement", false)) {
            connection.use();
            statement.use();
        }

        System.out.println("2. body throws and close throws: close failure is suppressed");
        try (Resource file = new Resource("file", true)) {
            file.use();
            throw new RuntimeException("body failed");
        } catch (RuntimeException e) {
            System.out.println("  caught: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) System.out.println("  suppressed: " + s.getMessage());
        } finally {
            System.out.println("  finally runs after resources are closed");
        }

        System.out.println("3. Java 9: an existing effectively final variable");
        Resource socket = new Resource("socket", false);
        try (socket) {
            socket.use();
        }

        System.out.println("4. multi-catch from the same Java 7 release");
        try {
            if (args.length == 0) throw new NumberFormatException("no args");
        } catch (NumberFormatException | NullPointerException e) {
            System.out.println("  handled " + e.getClass().getSimpleName() + " in one block");
        }
    }
}`,
    walk:
      "In part 1, two resources open in order and close in reverse order (statement, then connection) as soon as the block ends. In part 2 the body throws \"body failed\" and then `close()` throws too; the body's exception is propagated and the close failure is attached as a suppressed exception. The catch and finally blocks run after the resource is closed.\n\nPart 3 uses the Java 9 form with an existing variable. Part 4 shows multi-catch, introduced with try-with-resources in Java 7, handling two exception types in one block.",
    anim: [
      "Automatic closing",
      [
        ["open1", "open connection", "resource 1"],
        ["open2", "open statement", "resource 2"],
        ["body", "try body", "use both"],
        ["close2", "close statement", "first"],
        ["close1", "close connection", "last"],
      ],
      [
        ["open1", "open2", "declare", "Resources are opened in the order they appear in the try header."],
        ["open2", "body", "run", "The body uses them; it may finish normally or throw."],
        ["body", "close2", "auto", "On exit the last-declared resource is closed first."],
        ["close2", "close1", "reverse", "Then the earlier one: reverse order, even if an exception occurred."],
      ],
    ],
    mistakes: [
      "Opening a resource before the try and only using try-with-resources on a wrapper, leaving the inner one unclosed if the wrapper's constructor fails.",
      "Ignoring suppressed exceptions when debugging close failures.",
      "Returning a resource from inside try-with-resources; it is already closed when the caller gets it.",
    ],
    qa: [
      ["What is try-with-resources?", "A Java 7 form of try that automatically closes resources implementing AutoCloseable when the block ends."],
      ["In which order are resources closed?", "In the reverse order of their declaration."],
      ["What are suppressed exceptions?", "Exceptions thrown while closing resources after the body already threw; they are attached to the primary exception and available via getSuppressed()."],
      ["What is the difference between AutoCloseable and Closeable?", "Closeable extends AutoCloseable, narrows close() to throw IOException and requires close to be idempotent."],
    ],
    ex: [
      "Rewrite this Java 6 code with try-with-resources: `BufferedReader r = null; try { r = new BufferedReader(new FileReader(\"a.txt\")); System.out.println(r.readLine()); } finally { if (r != null) r.close(); }`",
      "`try (BufferedReader r = new BufferedReader(new FileReader(\"a.txt\"))) { System.out.println(r.readLine()); }` with the method declaring or catching IOException.",
    ],
  }),

  lesson("Exception Propagation", {
    intro:
      "When an exception is not caught where it is thrown, it travels up the call stack, method by method, until a matching catch is found or it leaves `main` and terminates the thread. This is exception propagation. This lesson explains how unchecked and checked exceptions propagate, what happens to each frame, and how the stack trace records the path.",
    topics: [
      [
        "How propagation works",
        "The JVM looks for a matching catch in the current method. If there is none, the method ends abruptly (its finally blocks run) and the exception is rethrown at the call site in the caller. This repeats down the stack. If it escapes the thread's `run` or `main`, the thread's uncaught exception handler prints the stack trace and the thread dies; if that was the last non-daemon thread, the JVM exits with status 1.",
      ],
      [
        "Unchecked exceptions propagate automatically",
        "Runtime exceptions and errors propagate without any declaration in the intermediate methods.",
      ],
      [
        "Checked exceptions need throws on the way",
        "A checked exception can only propagate through methods that declare it (or a supertype) in their `throws` clause; otherwise the code does not compile. Each method decides: handle it, or declare it and let it pass.",
      ],
      [
        "Where to catch",
        "Catch an exception at the level that can do something meaningful about it: retry, use a fallback, translate it into a domain or user-facing error, or log and abort the request. Catching too early (in a utility method that cannot recover) leads to swallowed errors.",
      ],
    ],
    code: String.raw`import java.io.IOException;

public class Main {
    static void level3(int value) {
        System.out.println("  level3 dividing by " + value);
        int result = 100 / value;                       // may throw ArithmeticException
        System.out.println("  level3 result " + result);
    }
    static void level2(int value) {
        try {
            level3(value);
        } finally {
            System.out.println("  level2 finally (exception passes through)");
        }
    }
    static void level1(int value) { level2(value); System.out.println("  level1 finished"); }

    static void readFile() throws IOException { throw new IOException("disk not ready"); }
    static void service() throws IOException { readFile(); }   // must declare to propagate
    static void controller() {
        try {
            service();
        } catch (IOException e) {                                // handled where it is meaningful
            System.out.println("  controller: show error page because " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        System.out.println("value 5:");
        level1(5);
        System.out.println("value 0:");
        try {
            level1(0);
        } catch (ArithmeticException e) {
            System.out.println("  main caught: " + e.getMessage());
            StackTraceElement[] trace = e.getStackTrace();
            for (int i = 0; i < 4; i++) System.out.println("    at " + trace[i].getMethodName());
        }
        System.out.println("checked exception propagation:");
        controller();
    }
}`,
    walk:
      "With 5, every method completes normally. With 0, `level3` throws `ArithmeticException`; it has no catch, so it ends abruptly. `level2`'s finally runs as the exception passes through, `level1` never prints \"finished\", and `main` catches it. The stack trace lists the path: level3, level2, level1, main.\n\nThe checked `IOException` from `readFile` can only reach `controller` because `readFile` and `service` declare `throws IOException`; `controller` handles it by choosing an error page.",
    anim: [
      "Unwinding the call stack",
      [
        ["main", "main()", "has catch"],
        ["l1", "level1()", "no catch"],
        ["l2", "level2()", "finally only"],
        ["l3", "level3()", "100 / 0"],
        ["err", "Arithmetic...", "thrown"],
      ],
      [
        ["l3", "err", "throw", "Dividing by zero in level3 creates and throws an ArithmeticException."],
        ["err", "l2", "unwind", "level3 has no catch, so its frame is popped and level2 receives it; its finally runs."],
        ["l2", "l1", "unwind", "level2 has no catch either; the exception moves on to level1."],
        ["l1", "main", "caught", "level1 has no catch; main has one, so propagation stops there."],
      ],
    ],
    mistakes: [
      "Catching and ignoring exceptions deep in utility code (`catch (Exception e) {}`), hiding failures.",
      "Declaring `throws Exception` all the way up to avoid thinking about where to handle failures.",
    ],
    qa: [
      ["What is exception propagation?", "The process of an uncaught exception moving from the method where it was thrown up the call stack until a matching catch handles it."],
      ["Do checked exceptions propagate automatically?", "Only through methods that declare them with throws; otherwise the code does not compile."],
      ["What happens if an exception is never caught?", "The thread's uncaught exception handler prints the stack trace and the thread terminates; if it was the main thread and no other non-daemon threads remain, the JVM exits."],
    ],
    ex: [
      "Add a catch for `ArithmeticException` in `level2` that prints a message and returns. What changes in the output for value 0?",
      "level2 handles it, so the finally still runs, level1 then prints \"level1 finished\", and main's catch is never reached.",
    ],
  }),

  lesson("Exception Chaining and Stack Traces", {
    intro:
      "When a low-level failure causes a higher-level one, you should report the high-level problem without losing the original. Exception chaining (wrapping) does that by storing the original exception as the cause. The stack trace then tells the whole story. This lesson covers chaining, reading stack traces with \"Caused by\" sections, and debugging techniques.",
    topics: [
      [
        "Exception chaining / wrapping",
        "Catch the low-level exception and throw a more meaningful one with it as the cause: `throw new OrderException(\"cannot save order 42\", e);`. The cause is available through `getCause()`. You can also call `initCause(cause)` once on an exception created without one. Chaining translates exceptions between layers (SQL errors become repository errors) without losing details.",
      ],
      [
        "Reading a stack trace",
        "The first line is the exception class and message. Each `at` line is a frame: `class.method(File.java:line)`, most recent call first. \"Caused by:\" introduces the wrapped exception with its own frames, and \"... 3 more\" means those frames are identical to the enclosing trace. \"Suppressed:\" lists exceptions from try-with-resources closes. Read from the deepest \"Caused by\" to find the root cause.",
      ],
      [
        "Debugging exceptions",
        "Log the exception object itself (`logger.error(\"msg\", e)`), not just `e.getMessage()`, so the full trace and causes are kept. Use `e.printStackTrace()` only in small programs. Walk to the root cause in code with a loop over `getCause()`. In an IDE, set an exception breakpoint to stop where it is thrown. Since Java 14, helpful NullPointerException messages name the null variable.",
      ],
      [
        "Rethrowing correctly",
        "Rethrowing the same exception (`throw e;`) keeps its original stack trace. Creating a new exception without passing the cause loses it. `fillInStackTrace()` resets a trace and is rarely needed.",
      ],
    ],
    code: String.raw`import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.SQLException;

public class Main {
    static class RepositoryException extends RuntimeException {
        RepositoryException(String message, Throwable cause) { super(message, cause); }
    }
    static class OrderServiceException extends RuntimeException {
        OrderServiceException(String message, Throwable cause) { super(message, cause); }
    }

    static void insertRow() throws SQLException {
        throw new SQLException("duplicate key value violates unique constraint", "23505");
    }
    static void saveOrder(int id) {
        try {
            insertRow();
        } catch (SQLException e) {
            throw new RepositoryException("could not insert order " + id, e);   // wrap: keep the cause
        }
    }
    static void placeOrder(int id) {
        try {
            saveOrder(id);
        } catch (RepositoryException e) {
            throw new OrderServiceException("order " + id + " could not be placed", e);
        }
    }

    static Throwable rootCause(Throwable t) {
        while (t.getCause() != null && t.getCause() != t) t = t.getCause();
        return t;
    }

    public static void main(String[] args) {
        try {
            placeOrder(42);
        } catch (OrderServiceException e) {
            System.out.println("top message : " + e.getMessage());
            System.out.println("cause       : " + e.getCause().getMessage());
            Throwable root = rootCause(e);
            System.out.println("root cause  : " + root.getClass().getSimpleName() + " - " + root.getMessage()
                    + " (SQLState " + ((SQLException) root).getSQLState() + ")");

            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            sw.toString().lines()
                    .filter(l -> !l.contains("java.base"))
                    .map(l -> l.replaceAll("\\(Main\\.java:\\d+\\)", "(Main.java)"))
                    .forEach(l -> System.out.println("  | " + l));
        }

        try {
            String name = null;
            name.length();
        } catch (NullPointerException e) {
            System.out.println("helpful NPE message: " + e.getMessage());
        }
    }
}`,
    walk:
      "`insertRow` throws a `SQLException`. `saveOrder` wraps it in a `RepositoryException`, and `placeOrder` wraps that in an `OrderServiceException`, each passing the previous exception as the cause. `main` prints the top message, the direct cause and the root cause found by following `getCause()`.\n\nThe printed stack trace (line numbers removed for readability) shows the top exception, then \"Caused by: Main$RepositoryException\" and \"Caused by: java.sql.SQLException\", with \"... more\" lines for shared frames. The last part shows Java's helpful NullPointerException message naming the null local variable.",
    anim: [
      "Wrapping across layers",
      [
        ["db", "SQLException", "JDBC layer"],
        ["repo", "RepositoryExc", "data layer"],
        ["svc", "OrderServiceExc", "service layer"],
        ["log", "Stack trace", "Caused by ..."],
        ["root", "getCause() loop", "root cause"],
      ],
      [
        ["db", "repo", "wrap", "The repository catches the SQLException and wraps it as the cause."],
        ["repo", "svc", "wrap", "The service wraps again with a business-level message."],
        ["svc", "log", "print", "The stack trace shows each level, joined by 'Caused by:' sections."],
        ["log", "root", "follow", "Following getCause() repeatedly leads back to the original SQLException."],
      ],
    ],
    mistakes: [
      "Throwing `new RuntimeException(e.getMessage())`, which drops the original stack trace.",
      "Logging only `e.getMessage()`; you lose the type, stack trace and causes.",
      "Reading only the first line of a stack trace instead of the deepest \"Caused by\".",
    ],
    qa: [
      ["What is exception chaining?", "Wrapping a caught exception as the cause of a new, more meaningful exception so both are preserved."],
      ["How do you get the original exception from a wrapped one?", "Call getCause(), repeatedly if needed, to reach the root cause."],
      ["What does '... 5 more' mean in a stack trace?", "The remaining 5 frames are the same as in the enclosing exception's trace and were omitted."],
    ],
    ex: [
      "Change `saveOrder` to `throw new RepositoryException(\"could not insert order \" + id, null);`. What do you lose?",
      "The SQLException and its SQLState vanish: `rootCause` returns the RepositoryException itself, and the stack trace no longer shows where in JDBC the failure happened.",
    ],
  }),

  lesson("Exceptions with Method Overloading and Overriding", {
    intro:
      "Exceptions interact with method signatures. Overloaded methods may declare any exceptions, because they are different methods. Overriding methods are restricted, because callers using the parent type must not be surprised by new checked exceptions. This lesson covers the rules for overloading, the rules for overriding (checked and unchecked, broader and narrower), and constructors.",
    topics: [
      [
        "Overloading and exceptions",
        "Exceptions are not part of the method signature for overload resolution, and each overload can declare whatever it wants. Two methods that differ only in their throws clause are not valid overloads; they are a duplicate definition.",
      ],
      [
        "Overriding: checked exceptions",
        "An overriding method may throw the same checked exceptions as the parent, subclasses of them (narrower), fewer, or none. It may not throw new checked exceptions or broader ones: if the parent declares `throws FileNotFoundException`, the override cannot declare `throws IOException`, and if the parent declares nothing, the override cannot declare any checked exception.",
      ],
      [
        "Overriding: unchecked exceptions",
        "There are no restrictions on unchecked exceptions; an override can throw any `RuntimeException` or `Error` regardless of the parent.",
      ],
      [
        "Why the rule exists",
        "Code written against the parent type only catches what the parent declares. If a subclass could throw a broader checked exception, that code would face an exception the compiler never forced it to handle, breaking the substitution principle.",
      ],
      [
        "Constructors",
        "A subclass constructor must declare every checked exception thrown by the superclass constructor it calls (it can also declare broader ones, because nothing calls it polymorphically), since `super(...)` cannot be wrapped in try-catch.",
      ],
    ],
    code: String.raw`import java.io.FileNotFoundException;
import java.io.IOException;

public class Main {
    static class Reader {
        String read(String path) throws IOException {               // parent declares IOException
            throw new IOException("generic read failure for " + path);
        }
        String read(String path, int retries) throws InterruptedException {  // overload: any exceptions
            Thread.sleep(1);
            return "read " + path + " with " + retries + " retries";
        }
        void close() { System.out.println("  closed"); }           // declares nothing
    }

    static class FileReaderX extends Reader {
        @Override String read(String path) throws FileNotFoundException {   // narrower: allowed
            throw new FileNotFoundException(path + " not found");
        }
        // @Override String read(String path) throws Exception { }       // broader: compile error
        @Override void close() {                                         // unchecked is always fine
            throw new IllegalStateException("already closed");
        }
        // @Override void close() throws IOException { }                 // new checked: compile error
    }

    static class SafeReader extends Reader {
        @Override String read(String path) { return "safe read of " + path; }  // throws nothing: allowed
    }

    static class Base { Base() throws IOException { } }
    static class Derived extends Base {
        Derived() throws IOException { super(); }                    // must declare what super throws
    }

    public static void main(String[] args) throws Exception {
        Reader[] readers = {new Reader(), new FileReaderX(), new SafeReader()};
        for (Reader r : readers) {
            try {
                System.out.println(r.getClass().getSimpleName() + ": " + r.read("data.txt"));
            } catch (IOException e) {                                   // covers parent and narrower types
                System.out.println(r.getClass().getSimpleName() + ": " + e.getClass().getSimpleName() + " - " + e.getMessage());
            }
        }
        System.out.println(new Reader().read("data.txt", 3));
        try {
            new FileReaderX().close();
        } catch (IllegalStateException e) {
            System.out.println("unchecked from override: " + e.getMessage());
        }
        new Derived();
        System.out.println("Derived constructed (declared IOException from super)");
    }
}`,
    walk:
      "`Reader.read` declares `IOException`. `FileReaderX` overrides it with the narrower `FileNotFoundException`, and `SafeReader` overrides it with no exception at all; both are allowed. The commented lines show the illegal versions (broader or new checked exceptions).\n\nBecause every override throws at most an `IOException`, one `catch (IOException e)` in `main` safely handles all three readers. The overload `read(path, retries)` declares a completely different exception. `FileReaderX.close()` throws an unchecked exception, which is always permitted, and `Derived` declares the checked exception thrown by its parent constructor.",
    anim: [
      "Allowed exceptions in an override",
      [
        ["parent", "Parent.read()", "throws IOException"],
        ["same", "IOException", "allowed"],
        ["narrow", "FileNotFound", "allowed"],
        ["none", "nothing", "allowed"],
        ["broad", "Exception", "compile error"],
      ],
      [
        ["parent", "same", "same", "Declaring the same checked exception as the parent is fine."],
        ["parent", "narrow", "subclass", "A subclass of the declared exception is fine: callers still catch it."],
        ["parent", "none", "fewer", "Throwing nothing at all is always allowed."],
        ["parent", "broad", "broader", "A broader or new checked exception would surprise callers, so javac rejects it."],
      ],
    ],
    mistakes: [
      "Trying to add a new checked exception to an interface implementation; wrap it in an unchecked exception or change the interface.",
      "Believing overloads must keep the same throws clause.",
    ],
    qa: [
      ["Can an overriding method throw a broader checked exception?", "No. It may throw the same, narrower or no checked exceptions, but never broader or new ones."],
      ["Can an overriding method throw an unchecked exception the parent does not declare?", "Yes. Unchecked exceptions are unrestricted."],
      ["Do exceptions affect method overloading?", "No. Overloads are distinguished only by parameters; their throws clauses can differ freely."],
    ],
    ex: [
      "An interface method `void save()` declares no exceptions, but your implementation calls code that throws `IOException`. What are your options?",
      "Catch it and handle it inside, or wrap it in an unchecked exception (`UncheckedIOException`), or change the interface to declare `throws IOException` if you own it. Declaring it on the implementation alone does not compile.",
    ],
  }),

  lesson("Handling Exceptions Thrown from a Static Block", {
    intro:
      "A static initializer runs when a class is initialised, before any of your code uses it, so there is no caller to catch its exceptions. If it fails, the JVM wraps the problem in `ExceptionInInitializerError`, and every later use of the class fails with `NoClassDefFoundError`. This lesson explains these rules, why static blocks cannot throw checked exceptions, and how to handle failures properly.",
    topics: [
      [
        "Checked exceptions are not allowed",
        "A static block cannot declare `throws`, and it must complete normally, so a checked exception must be caught inside it. Throwing one is a compile error (\"unreported exception\").",
      ],
      [
        "Unchecked exceptions become ExceptionInInitializerError",
        "If a static block or static field initializer throws a runtime exception, the JVM wraps it in `ExceptionInInitializerError` (its `getCause()` returns the original) and throws that at the point where the class was first used.",
      ],
      [
        "Later uses: NoClassDefFoundError",
        "After a failed initialisation the class is marked as erroneous. Every further attempt to use it throws `NoClassDefFoundError: Could not initialize class X`. The class cannot be retried in the same class loader, which often confuses people reading only the later errors.",
      ],
      [
        "Handling it well",
        "Catch exceptions inside the static block and either fall back to safe defaults or rethrow as an `ExceptionInInitializerError` with a clear message. Better still, avoid heavy work in static initializers: use lazy initialisation (holder idiom or a factory) so failures happen in normal code that can catch and retry them.",
      ],
    ],
    code: String.raw`import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;

public class Main {
    static class BrokenConfig {
        static final int TIMEOUT;
        static {
            System.out.println("  BrokenConfig static block runs");
            TIMEOUT = Integer.parseInt("thirty");              // NumberFormatException
        }
    }

    static class SafeConfig {
        static final Properties PROPS = new Properties();
        static {
            try (FileReader reader = new FileReader("app.properties")) {   // checked: must catch here
                PROPS.load(reader);
            } catch (IOException e) {
                System.out.println("  SafeConfig: file missing, using defaults (" + e.getClass().getSimpleName() + ")");
                PROPS.setProperty("timeout", "30");
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("first use of BrokenConfig:");
        try {
            System.out.println(BrokenConfig.TIMEOUT);
        } catch (ExceptionInInitializerError e) {
            System.out.println("  " + e.getClass().getSimpleName() + ", cause: " + e.getCause());
        }

        System.out.println("second use of BrokenConfig:");
        try {
            System.out.println(BrokenConfig.TIMEOUT);
        } catch (NoClassDefFoundError e) {
            System.out.println("  " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }

        System.out.println("SafeConfig:");
        System.out.println("  timeout = " + SafeConfig.PROPS.getProperty("timeout"));
    }
}`,
    walk:
      "The first access to `BrokenConfig.TIMEOUT` initialises the class; its static block fails to parse \"thirty\", and the JVM throws `ExceptionInInitializerError` whose cause is the `NumberFormatException`. The static block does not run again: the second access immediately throws `NoClassDefFoundError: Could not initialize class Main$BrokenConfig`.\n\n`SafeConfig` catches the checked `IOException` inside its static block (it has no choice) and falls back to a default timeout, so the class initialises successfully.",
    anim: [
      "Failed static initialization",
      [
        ["use1", "1st use", "BrokenConfig.X"],
        ["init", "static block", "throws NFE"],
        ["eiie", "ExceptionInInit", "cause: NFE"],
        ["bad", "class erroneous", "no retry"],
        ["ncdf", "NoClassDefFound", "every later use"],
      ],
      [
        ["use1", "init", "initialise", "The first active use triggers class initialisation and the static block."],
        ["init", "eiie", "wrap", "The block throws, and the JVM wraps the cause in ExceptionInInitializerError."],
        ["eiie", "bad", "mark", "The class is marked as failed; initialisation is never attempted again."],
        ["bad", "ncdf", "later", "Every later use throws NoClassDefFoundError: Could not initialize class."],
      ],
    ],
    mistakes: [
      "Debugging only the `NoClassDefFoundError` in logs and missing the earlier `ExceptionInInitializerError` with the real cause.",
      "Reading configuration files or opening connections in static blocks without a fallback.",
    ],
    qa: [
      ["Can a static block throw a checked exception?", "No. It must catch it internally; static initializers cannot declare throws."],
      ["What is ExceptionInInitializerError?", "The error the JVM throws when a static initializer or static field initializer throws an exception; the original is its cause."],
      ["Why does NoClassDefFoundError appear after a static block fails?", "The class is marked as erroneous after the failed initialisation, so later uses fail with 'Could not initialize class'."],
    ],
    ex: [
      "Rewrite `BrokenConfig` so a parse failure falls back to a timeout of 30 and the class still initialises.",
      "Wrap the parse: `int t; try { t = Integer.parseInt(value); } catch (NumberFormatException e) { t = 30; } TIMEOUT = t;` inside the static block (assign the final field exactly once).",
    ],
  }),

  lesson("Exception Handling Best Practices", {
    intro:
      "Exceptions are part of an API and of operations: they decide whether failures are visible, diagnosable and recoverable. This lesson lists twelve practical rules for handling exceptions well, each demonstrated in the program with a good and a bad version where useful.",
    topics: [
      [
        "1-4: Specific, never empty, close resources, don't use for flow",
        "1. Catch the most specific exception you can handle, not `Exception` or `Throwable`. 2. Never leave a catch block empty; at minimum log with context, or explain in a comment why ignoring is safe. 3. Always release resources with try-with-resources. 4. Do not use exceptions for normal control flow (for example to end loops or check if a string is numeric in a hot path); test conditions first.",
      ],
      [
        "5-8: Throw early, catch late, preserve causes, meaningful messages",
        "5. Validate arguments at the start of a method and throw immediately (`Objects.requireNonNull`, `IllegalArgumentException`). 6. Catch where you can actually handle the problem, usually at higher layers. 7. When wrapping, always pass the original as the cause. 8. Write messages that include the key values: \"Order 42 not found for customer 7\" instead of \"error\".",
      ],
      [
        "9-12: Standard types, document, don't log and rethrow, clean finally",
        "9. Prefer standard exceptions (`IllegalArgumentException`, `IllegalStateException`, `UnsupportedOperationException`) when they fit. 10. Document exceptions with `@throws` in Javadoc, including important unchecked ones. 11. Either log or rethrow, not both, or the same failure is logged many times. 12. Never return or throw from finally; keep it to cleanup.",
      ],
      [
        "Handling InterruptedException",
        "A special case: when catching `InterruptedException`, either rethrow it or restore the interrupt flag with `Thread.currentThread().interrupt()`, so code higher up knows the thread was asked to stop.",
      ],
    ],
    code: String.raw`import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class Main {
    static final Map<Integer, String> ORDERS = Map.of(1, "keyboard", 2, "mouse");

    static class OrderNotFoundException extends RuntimeException {
        OrderNotFoundException(String message) { super(message); }
    }

    // 5. throw early with a clear message; 9. standard exception; 10. documented
    /** @throws IllegalArgumentException if id is not positive
     *  @throws OrderNotFoundException if no order has this id */
    static String findOrder(int id) {
        if (id <= 0) throw new IllegalArgumentException("order id must be positive, was " + id);
        String item = ORDERS.get(id);
        if (item == null) throw new OrderNotFoundException("order " + id + " not found");   // 8. include values
        return item;
    }

    // 4. avoid exceptions for flow: check first, return Optional
    static Optional<Integer> parseQuantity(String text) {
        if (text == null || !text.matches("\\d{1,6}")) return Optional.empty();
        return Optional.of(Integer.parseInt(text));
    }

    static void process(String name) {
        Objects.requireNonNull(name, "name must not be null");   // 5. fail fast
        System.out.println("  processing " + name);
    }

    public static void main(String[] args) {
        // 1 + 6: catch specific exceptions at the level that can respond
        for (int id : new int[] {1, 9, -1}) {
            try {
                System.out.println("order " + id + ": " + findOrder(id));
            } catch (OrderNotFoundException e) {
                System.out.println("show 404 page: " + e.getMessage());
            } catch (IllegalArgumentException e) {
                System.out.println("show 400 page: " + e.getMessage());
            }
        }

        for (String q : new String[] {"12", "twelve"}) {
            System.out.println("quantity '" + q + "' -> " + parseQuantity(q).map(String::valueOf).orElse("invalid, ask again"));
        }

        try {
            process(null);
        } catch (NullPointerException e) {
            System.out.println("fail-fast message: " + e.getMessage());
        }

        // 2. never swallow silently; handle InterruptedException properly
        Thread worker = new Thread(() -> {
            try {
                Thread.sleep(10_000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();               // restore the flag
                System.out.println("  worker interrupted, flag restored: " + Thread.currentThread().isInterrupted());
            }
        });
        worker.start();
        worker.interrupt();
        try { worker.join(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        System.out.println("done");
    }
}`,
    walk:
      "`findOrder` validates its argument first and throws standard or domain exceptions with messages that contain the id. `main` catches each specific type and maps it to a different response, the way a web controller would.\n\n`parseQuantity` avoids using `NumberFormatException` for normal flow by checking the format first and returning an `Optional`. `Objects.requireNonNull` fails fast with a clear message. The worker thread shows the correct way to handle `InterruptedException`: restore the interrupt flag instead of swallowing it.",
    anim: [
      "Throw early, catch late",
      [
        ["ui", "Controller", "catches"],
        ["svc", "Service", "rethrows/wraps"],
        ["repo", "findOrder()", "validates"],
        ["throw", "throw early", "bad id"],
        ["resp", "404 / 400", "user response"],
      ],
      [
        ["repo", "throw", "validate", "The low-level method checks its input first and throws a precise exception."],
        ["throw", "svc", "propagate", "Middle layers let it pass or wrap it with context and the cause."],
        ["svc", "ui", "propagate", "It reaches the layer that can decide what to do."],
        ["ui", "resp", "handle", "The controller catches specific types and turns them into the right response."],
      ],
    ],
    mistakes: [
      "`catch (Exception e) { }`: the worst anti-pattern, hiding every failure.",
      "Logging an exception and then rethrowing it at every layer, filling logs with duplicates.",
      "Swallowing `InterruptedException`, which breaks cancellation and shutdown.",
    ],
    qa: [
      ["What are exception handling best practices?", "Catch specific exceptions, never swallow them, close resources with try-with-resources, throw early and catch late, preserve causes, write meaningful messages, prefer standard exceptions, document them, don't log-and-rethrow, keep finally clean, and handle InterruptedException properly."],
      ["Why should exceptions not be used for control flow?", "Creating and throwing exceptions is expensive (stack trace capture) and it hides intent; normal conditions should be checked explicitly."],
      ["How should InterruptedException be handled?", "Rethrow it or restore the interrupt status with Thread.currentThread().interrupt()."],
    ],
    ex: [
      "Improve this code: `try { return Integer.parseInt(s); } catch (Exception e) { return 0; }`.",
      "Catch only `NumberFormatException`, and decide whether 0 is a real default or the failure should surface; for example return `OptionalInt.empty()` or throw `IllegalArgumentException(\"not a number: \" + s, e)`.",
    ],
  }),

  lesson("Exception vs Error, throw vs throws, final vs finally vs finalize, and Multi-catch", {
    intro:
      "Four comparison questions appear in almost every Java interview: Exception versus Error, throw versus throws, final versus finally versus finalize, and multiple catch blocks versus a multi-catch block. This lesson answers each clearly with a program demonstrating all four.",
    topics: [
      [
        "Exception vs Error",
        "Both extend `Throwable`. `Exception` represents conditions an application might handle (missing file, bad input); `Error` represents serious problems, usually from the JVM, that applications should not try to handle (`OutOfMemoryError`, `StackOverflowError`). Exceptions can be checked or unchecked; errors are always unchecked. Exceptions are typically caused by the program or its environment; errors by the runtime system.",
      ],
      [
        "throw vs throws",
        "`throw` is a statement that raises one exception instance inside a method body: `throw new IllegalArgumentException()`. `throws` is a clause in a method or constructor declaration listing the exception types it may propagate: `void read() throws IOException, SQLException`. `throw` is followed by an object; `throws` by class names.",
      ],
      [
        "final vs finally vs finalize",
        "`final` is a modifier: a final variable cannot be reassigned, a final method cannot be overridden and a final class cannot be extended. `finally` is a block after try that always runs for cleanup. `finalize()` is a deprecated method of `Object` that the garbage collector could call before reclaiming an object. They only share spelling.",
      ],
      [
        "Multiple catch blocks vs multi-catch",
        "Multiple catch blocks give each exception type its own handler. Multi-catch (Java 7) handles several unrelated types in one block: `catch (IOException | SQLException e)`. In multi-catch the types cannot be subclasses of each other (compile error), and the parameter `e` is implicitly final. Use it when the handling is identical, to avoid duplicated code.",
      ],
    ],
    code: String.raw`import java.io.IOException;
import java.sql.SQLException;

public class Main {
    static final int MAX_RETRIES = 3;                                  // final

    static void connect(int attempt) throws IOException, SQLException {  // throws: declares
        if (attempt == 1) throw new IOException("network down");          // throw: raises
        if (attempt == 2) throw new SQLException("bad credentials");
        if (attempt == 3) throw new IllegalStateException("pool exhausted");
        System.out.println("  connected on attempt " + attempt);
    }

    @SuppressWarnings({"deprecation", "removal"})
    static class Legacy { @Override protected void finalize() { } }   // finalize: deprecated hook

    public static void main(String[] args) {
        for (int attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            try {
                connect(attempt);
            } catch (IOException | SQLException e) {                    // multi-catch: same handling
                System.out.println("  multi-catch: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                // e = new IOException();   // compile error: multi-catch parameter is final
            } catch (IllegalStateException e) {                          // separate block: different handling
                System.out.println("  separate catch: retry later, " + e.getMessage());
            } finally {                                                  // finally: cleanup
                System.out.println("  finally after attempt " + attempt);
            }
        }

        try {
            throw new StackOverflowError("simulated");
        } catch (Error e) {
            Throwable t = e;
            System.out.println("an Error is not an Exception: " + !(t instanceof Exception));
        }
        Exception checked = new IOException("x");
        System.out.println("IOException is an Exception: " + (checked instanceof Exception));
        System.out.println("finalize exists but is deprecated: " + Legacy.class.getDeclaredMethods().length);
    }
}`,
    walk:
      "`connect` declares two checked exceptions with `throws` and raises them with `throw` depending on the attempt. Attempts 1 and 2 are handled by one multi-catch block because the handling is identical; attempt 3 has its own catch block because `IllegalStateException` needs different handling; attempt 4 succeeds. `finally` runs after every attempt, and `MAX_RETRIES` is a `final` constant.\n\nThe last lines show that an `Error` is not an `Exception`, and that `finalize` is just a deprecated method you can override, unrelated to `final` and `finally`.",
    anim: [
      "Three look-alike words",
      [
        ["final", "final", "modifier"],
        ["finally", "finally", "block"],
        ["finalize", "finalize()", "method"],
        ["var", "no reassign", "variables etc."],
        ["clean", "always runs", "after try"],
      ],
      [
        ["final", "var", "locks", "final locks a variable, method or class against change."],
        ["finally", "clean", "runs", "finally is a block that runs after try/catch for cleanup."],
        ["finalize", "clean", "GC hook", "finalize() was a GC-time cleanup hook, now deprecated for removal."],
        ["final", "finally", "unrelated", "Despite the spelling, the three have nothing to do with each other."],
      ],
    ],
    mistakes: [
      "Writing `catch (FileNotFoundException | IOException e)`; the types are related, so it does not compile.",
      "Confusing `throws` (declaration) with `throw` (statement).",
    ],
    qa: [
      ["What is the difference between Exception and Error?", "Exception covers conditions applications may handle and can be checked or unchecked; Error covers serious JVM problems, is always unchecked and should usually not be caught."],
      ["What is the difference between final, finally and finalize?", "final is a modifier preventing change, finally is a cleanup block that always runs after try, finalize is a deprecated Object method called by the GC."],
      ["What is multi-catch and its restrictions?", "A Java 7 catch block for several exception types separated by |; the types must not be related by inheritance and the parameter is implicitly final."],
    ],
    ex: [
      "Can you write `catch (IOException | Exception e)`? Why or why not?",
      "No: IOException is a subclass of Exception, so the alternatives are related, which multi-catch forbids. Catch `Exception` alone if that is what you mean.",
    ],
  }),

  lesson("Most Common Checked Exceptions", {
    intro:
      "A small set of checked exceptions covers most of what real programs must handle: I/O failures, missing files, unexpected end of data, database errors, interrupted threads, missing classes and incompatible serialized classes. This lesson explains IOException, FileNotFoundException, EOFException, SQLException, InterruptedException, ClassNotFoundException and InvalidClassException, with what causes each and how to handle it, and the program triggers each one.",
    topics: [
      [
        "IOException and FileNotFoundException",
        "`IOException` is the general checked exception for input/output failures: reading, writing, network sockets, closing streams. `FileNotFoundException` (a subclass) is thrown when opening a file that does not exist, is a directory, or cannot be accessed. Handle by checking paths, permissions and retries; prefer the NIO `Files` API, which throws more specific `NoSuchFileException` and `AccessDeniedException`.",
      ],
      [
        "EOFException",
        "Thrown by `DataInputStream` and `ObjectInputStream` when the end of the stream is reached in the middle of reading a value (for example `readInt()` with only two bytes left). It is often used to detect the end of a file of serialized objects, though writing a count first is cleaner.",
      ],
      [
        "SQLException",
        "Thrown by JDBC for any database error: connection failure, syntax error, constraint violation, timeout. It carries `getSQLState()` (standard code), `getErrorCode()` (vendor code) and `getNextException()` for chains. Subclasses such as `SQLIntegrityConstraintViolationException` and `SQLTimeoutException` give finer detail.",
      ],
      [
        "InterruptedException",
        "Thrown by blocking methods such as `Thread.sleep`, `wait`, `join` and `BlockingQueue.take` when another thread interrupts the waiting thread. It is a cancellation request: clean up and stop, rethrow, or restore the flag with `Thread.currentThread().interrupt()`.",
      ],
      [
        "ClassNotFoundException and InvalidClassException",
        "`ClassNotFoundException` is thrown by `Class.forName`, `ClassLoader.loadClass` and deserialization when a class requested by name is not on the classpath. `InvalidClassException` (a subclass of `IOException`) is thrown during deserialization when the stream's class does not match the local class, most often a different `serialVersionUID`, or when the class has no accessible no-arg constructor in its first non-serializable superclass.",
      ],
    ],
    code: String.raw`import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.EOFException;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InvalidClassException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Main {
    static class Version1 implements Serializable { private static final long serialVersionUID = 1L; int value = 5; }

    public static void main(String[] args) throws Exception {
        try {
            new FileInputStream("no-such-file.txt");
        } catch (FileNotFoundException e) {
            System.out.println("FileNotFoundException (an IOException): " + (e instanceof IOException));
        }

        try (DataInputStream in = new DataInputStream(new ByteArrayInputStream(new byte[] {0, 1}))) {
            in.readInt();                                         // needs 4 bytes, only 2 available
        } catch (EOFException e) {
            System.out.println("EOFException: stream ended in the middle of readInt()");
        }

        try {
            DriverManager.getConnection("jdbc:unknown://localhost/db");
        } catch (SQLException e) {
            System.out.println("SQLException: " + e.getMessage() + " | SQLState " + e.getSQLState());
        }

        Thread sleeper = new Thread(() -> {
            try { Thread.sleep(5_000); }
            catch (InterruptedException e) { System.out.println("InterruptedException: sleep was interrupted"); }
        });
        sleeper.start();
        sleeper.interrupt();
        sleeper.join();

        try {
            Class.forName("com.example.MissingDriver");
        } catch (ClassNotFoundException e) {
            System.out.println("ClassNotFoundException: " + e.getMessage());
        }

        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(new Version1()); }
        byte[] data = bytes.toByteArray();
        byte[] uid = java.nio.ByteBuffer.allocate(8).putLong(1L).array();
        for (int i = 0; i + 8 <= data.length; i++) {             // simulate a class with a different UID
            if (java.util.Arrays.equals(java.util.Arrays.copyOfRange(data, i, i + 8), uid)) { data[i + 7] = 2; break; }
        }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) {
            in.readObject();
        } catch (InvalidClassException e) {
            System.out.println("InvalidClassException: serialVersionUID mismatch detected: " + e.getMessage().contains("serialVersionUID"));
        }
    }
}`,
    walk:
      "Each block triggers one checked exception for real. Opening a missing file throws `FileNotFoundException`, which is an `IOException`. `readInt()` on a two-byte stream hits the end mid-value and throws `EOFException`. Asking `DriverManager` for an unknown JDBC URL throws `SQLException` with SQLState 08001 (\"no suitable driver\").\n\nInterrupting a sleeping thread makes `sleep` throw `InterruptedException`. `Class.forName` for a class not on the classpath throws `ClassNotFoundException`. Finally, the program serializes an object, patches the `serialVersionUID` bytes in the stream to simulate a changed class, and reading it back throws `InvalidClassException`.",
    anim: [
      "Where checked exceptions come from",
      [
        ["io", "Files / streams", "IOException"],
        ["db", "JDBC", "SQLException"],
        ["thr", "Blocking calls", "Interrupted"],
        ["cls", "Class.forName", "ClassNotFound"],
        ["ser", "readObject()", "InvalidClass"],
        ["you", "Your code", "must handle"],
      ],
      [
        ["io", "you", "declared", "File and stream APIs declare IOException and its subclasses."],
        ["db", "you", "declared", "Every JDBC call declares SQLException."],
        ["thr", "you", "declared", "sleep, wait, join and take declare InterruptedException."],
        ["cls", "you", "declared", "Loading a class by name declares ClassNotFoundException."],
        ["ser", "you", "declared", "Deserialization can throw InvalidClassException on version mismatch."],
      ],
    ],
    mistakes: [
      "Catching `IOException` around a whole method and losing which operation failed.",
      "Ignoring `getSQLState()`, which tells you whether a SQL error is a constraint violation, a connection problem or a syntax error.",
    ],
    qa: [
      ["Name common checked exceptions.", "IOException, FileNotFoundException, EOFException, SQLException, InterruptedException, ClassNotFoundException, InvalidClassException, CloneNotSupportedException, ParseException."],
      ["When is EOFException thrown?", "When a data or object stream reaches its end in the middle of reading a value."],
      ["What causes InvalidClassException?", "A mismatch between the serialized class and the local class, usually a different serialVersionUID."],
    ],
    ex: [
      "Write a loop that reads all ints from a `DataInputStream` until the end, using EOFException. What is a cleaner alternative?",
      "`while (true) { try { list.add(in.readInt()); } catch (EOFException e) { break; } }`. Cleaner: write the count first and loop that many times, or check `in.available()` for byte-array streams.",
    ],
  }),

  lesson("Most Common Unchecked Exceptions", {
    intro:
      "Unchecked exceptions are usually bugs, and a handful of them account for nearly all crashes: NullPointerException, NumberFormatException, the IndexOutOfBounds family, ArithmeticException, IllegalStateException, IllegalMonitorStateException and UnsupportedOperationException. This lesson explains what causes each and how to prevent it, including why dividing a double by zero does not throw.",
    topics: [
      [
        "NullPointerException",
        "Thrown when you use a null reference: calling a method, accessing a field or array element, unboxing, `synchronized (null)` or throwing null. Since Java 14 the message names the null expression. Prevent with validation (`Objects.requireNonNull`), `Optional` for absent values, and avoiding nulls in collections.",
      ],
      [
        "NumberFormatException",
        "A subclass of `IllegalArgumentException`, thrown by `Integer.parseInt`, `Double.parseDouble` and similar when the text is not a valid number: \"12a\", \"\", \" 5\", values out of range. Validate or catch it at the input boundary.",
      ],
      [
        "IndexOutOfBoundsException, ArrayIndexOutOfBoundsException, StringIndexOutOfBoundsException",
        "`IndexOutOfBoundsException` is the parent, thrown by lists (`list.get(5)` on a smaller list). `ArrayIndexOutOfBoundsException` is thrown for arrays with an index below 0 or at least the length. `StringIndexOutOfBoundsException` is thrown by `charAt`, `substring` and similar.",
      ],
      [
        "ArithmeticException and division by zero with floating point",
        "Integer division or remainder by zero throws `ArithmeticException: / by zero`. Floating-point division does not: IEEE 754 defines `5.0 / 0` as `Infinity`, `-5.0 / 0` as `-Infinity` and `0.0 / 0` as `NaN`, so no exception occurs. `BigDecimal.divide` throws ArithmeticException for non-terminating decimals without a rounding mode.",
      ],
      [
        "IllegalStateException and IllegalMonitorStateException",
        "`IllegalStateException`: a method was called at the wrong time for the object's state, such as reading from a closed scanner, adding to a full `ArrayBlockingQueue` with `add`, or calling `iterator.remove()` twice. `IllegalMonitorStateException`: calling `wait`, `notify` or `notifyAll` without holding the object's lock (outside a synchronized block on that object), or unlocking a `ReentrantLock` you do not own.",
      ],
      [
        "UnsupportedOperationException",
        "Thrown when an operation is not supported by an implementation: adding to `List.of(...)`, `Collections.unmodifiableList` or `Arrays.asList(...)` (which supports `set` but not `add` or `remove`), or calling an interface method an implementation deliberately does not support.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;

public class Main {
    interface Action { void run() throws Exception; }

    static void attempt(String label, Action action) {
        try {
            action.run();
            System.out.println(label + " -> no exception");
        } catch (Exception e) {
            System.out.println(label + " -> " + e.getClass().getSimpleName() + (e.getMessage() != null ? ": " + e.getMessage() : ""));
        }
    }

    public static void main(String[] args) {
        String nothing = null;
        attempt("nothing.length()", () -> nothing.length());
        attempt("parseInt(\"12a\")", () -> Integer.parseInt("12a"));
        attempt("list.get(3)", () -> new ArrayList<>(List.of(1, 2)).get(3));
        attempt("array[5]", () -> { int[] a = new int[2]; a[5] = 1; });
        attempt("\"java\".charAt(10)", () -> "java".charAt(10));
        attempt("10 / 0", () -> System.out.println(10 / 0));
        attempt("10.0 / 0 = " + (10.0 / 0) + ", 0.0 / 0 = " + (0.0 / 0), () -> { });
        attempt("full queue.add()", () -> { var q = new ArrayBlockingQueue<Integer>(1); q.add(1); q.add(2); });
        attempt("iterator.remove() twice", () -> {
            Iterator<Integer> it = new ArrayList<>(List.of(1, 2)).iterator();
            it.next(); it.remove(); it.remove();
        });
        attempt("wait() without lock", () -> new Object().wait());
        attempt("List.of(1).add(2)", () -> List.of(1).add(2));
        attempt("Arrays.asList(1).add(2)", () -> Arrays.asList(1).add(2));
        attempt("Arrays.asList(1).set(0, 9)", () -> Arrays.asList(1).set(0, 9));
    }
}`,
    walk:
      "`attempt` runs a lambda and prints the exception type and message. Calling a method on a null String gives the Java 14+ helpful message. Parsing \"12a\" throws `NumberFormatException`; an out-of-range list index, array index and `charAt` throw the three IndexOutOfBounds variants with their own messages.\n\nInteger `10 / 0` throws `ArithmeticException`, while the floating-point divisions produce `Infinity` and `NaN` without any exception. Adding to a full bounded queue and removing twice through an iterator are illegal states. `wait()` without holding the lock throws `IllegalMonitorStateException`. Immutable `List.of` and fixed-size `Arrays.asList` reject `add`, though `Arrays.asList` allows `set`.",
    anim: [
      "Integer vs floating-point division by zero",
      [
        ["int", "10 / 0", "int operands"],
        ["ae", "ArithmeticExc", "/ by zero"],
        ["dbl", "10.0 / 0", "double operand"],
        ["inf", "Infinity", "IEEE 754"],
        ["nan", "0.0 / 0", "NaN"],
      ],
      [
        ["int", "ae", "throws", "Integer arithmetic has no value for division by zero, so it throws."],
        ["dbl", "inf", "returns", "IEEE 754 floating point defines 10.0 / 0 as positive Infinity."],
        ["dbl", "nan", "0 / 0", "0.0 / 0 has no meaningful value, so the result is NaN, not an exception."],
        ["inf", "ae", "no throw", "So only integer division by zero raises ArithmeticException."],
      ],
    ],
    mistakes: [
      "Catching `NullPointerException` instead of fixing the null source.",
      "Assuming `Arrays.asList` returns a normal `ArrayList`; wrap it with `new ArrayList<>(...)` to add or remove.",
      "Assuming floating-point division by zero is caught by `catch (ArithmeticException e)`.",
    ],
    qa: [
      ["Does dividing a double by zero throw an exception?", "No. It returns Infinity, -Infinity or NaN; only integer division by zero throws ArithmeticException."],
      ["When is IllegalMonitorStateException thrown?", "When wait, notify or notifyAll is called on an object whose monitor the thread does not hold, or a lock is released by a thread that does not own it."],
      ["Why does Arrays.asList(...).add() throw UnsupportedOperationException?", "Arrays.asList returns a fixed-size list backed by the array; set is supported but add and remove are not."],
      ["What is the difference between IllegalArgumentException and IllegalStateException?", "IllegalArgumentException means the argument is invalid; IllegalStateException means the object is not in a state where the call is allowed."],
    ],
    ex: [
      "What does `\"java\".substring(2, 1)` throw, and why?",
      "`StringIndexOutOfBoundsException`, because the begin index (2) is greater than the end index (1).",
    ],
  }),

  lesson("Common Errors and ClassNotFoundException vs NoClassDefFoundError", {
    intro:
      "Four `Error` types show up in production logs again and again: OutOfMemoryError, StackOverflowError, ExceptionInInitializerError and NoClassDefFoundError. The last one is often confused with ClassNotFoundException. This lesson explains the four errors and the precise difference between ClassNotFoundException and NoClassDefFoundError, and the program reproduces the class-loading cases by deleting a compiled class.",
    topics: [
      [
        "OutOfMemoryError and StackOverflowError",
        "`OutOfMemoryError`: the JVM could not allocate memory (heap, Metaspace, native threads); see the GC section for all its types. `StackOverflowError`: a thread's stack is exhausted, almost always by unbounded or very deep recursion; fix the recursion or, rarely, raise `-Xss`.",
      ],
      [
        "ExceptionInInitializerError",
        "Thrown when a static initializer or static field initialization throws an exception. The original exception is the cause. The class is then unusable for the life of its class loader.",
      ],
      [
        "NoClassDefFoundError",
        "An `Error` thrown when the JVM needs a class that was present at compile time but cannot be loaded at runtime: the JAR is missing from the runtime classpath, a class file was deleted, or the class failed to initialise earlier (\"Could not initialize class X\"). It happens implicitly, when code that references the class runs.",
      ],
      [
        "ClassNotFoundException vs NoClassDefFoundError",
        "ClassNotFoundException is a checked exception thrown when code explicitly loads a class by name (`Class.forName`, `loadClass`, deserialization) and it is not found; the class was never known to the compiler. NoClassDefFoundError is an error thrown when a class that the compiled code directly references is missing at runtime or failed to initialise. In short: dynamic loading by name fails with ClassNotFoundException; static references that worked at compile time fail with NoClassDefFoundError. NoClassDefFoundError often has a ClassNotFoundException as its cause.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    static class Helper {                       // compiled to Main$Helper.class
        static String greet() { return "hello from Helper"; }
    }

    static class Uses {                         // references Helper directly
        static String call() { return Helper.greet(); }
    }

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            // Delete Helper's class file, then start a fresh JVM to see the errors.
            Path helper = Path.of(Main.class.getProtectionDomain().getCodeSource().getLocation().toURI())
                    .resolve("Main$Helper.class");
            byte[] backup = Files.readAllBytes(helper);
            Files.delete(helper);
            String java = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
            Process p = new ProcessBuilder(java, "-cp", System.getProperty("java.class.path"), "Main", "child")
                    .redirectErrorStream(true).start();
            System.out.print(new String(p.getInputStream().readAllBytes()));
            p.waitFor();
            Files.write(helper, backup);        // restore
            return;
        }

        try {
            Class.forName("Main$Helper");      // explicit load by name
        } catch (ClassNotFoundException e) {
            System.out.println("Class.forName -> ClassNotFoundException (checked): " + e.getMessage());
        }

        try {
            System.out.println(Uses.call());    // direct reference compiled earlier
        } catch (NoClassDefFoundError e) {
            System.out.println("direct use    -> NoClassDefFoundError (error): " + e.getMessage());
            System.out.println("                 cause: " + e.getCause().getClass().getSimpleName());
        }

        try {
            recurse(0);
        } catch (StackOverflowError e) {
            System.out.println("deep recursion -> StackOverflowError");
        }
    }

    static int recurse(int n) { return recurse(n + 1) + 1; }
}`,
    walk:
      "Run without arguments, the program deletes `Main$Helper.class` from its own output folder and starts a fresh JVM (the \"child\" run), then restores the file. In the child, `Class.forName(\"Main$Helper\")` loads by name and fails with the checked `ClassNotFoundException`.\n\n`Uses.call()` was compiled against `Helper`, so the bytecode references it directly; when it runs, the JVM cannot find the class and throws `NoClassDefFoundError`, with a `ClassNotFoundException` as its cause. Deep recursion then shows `StackOverflowError`.",
    anim: [
      "ClassNotFound vs NoClassDefFound",
      [
        ["dyn", "Class.forName", "by name"],
        ["cnfe", "ClassNotFound", "checked exc."],
        ["stat", "Uses.call()", "compiled ref"],
        ["load", "JVM loads Helper", "file missing"],
        ["ncdf", "NoClassDefFound", "Error"],
      ],
      [
        ["dyn", "cnfe", "explicit", "Loading a class by name that is not on the classpath throws ClassNotFoundException."],
        ["stat", "load", "implicit", "Running code compiled against Helper makes the JVM load Helper implicitly."],
        ["load", "ncdf", "missing", "The class existed at compile time but not at runtime: NoClassDefFoundError."],
        ["ncdf", "cnfe", "cause", "Its cause is usually the ClassNotFoundException from the class loader."],
      ],
    ],
    mistakes: [
      "Treating NoClassDefFoundError as a missing JAR when an earlier ExceptionInInitializerError is the real cause.",
      "Having a dependency at compile scope but not packaged at runtime (for example Maven `provided` scope in a standalone JAR).",
    ],
    qa: [
      ["What is the difference between ClassNotFoundException and NoClassDefFoundError?", "ClassNotFoundException is a checked exception from explicit loading by name (Class.forName); NoClassDefFoundError is an Error when a class present at compile time is missing or failed to initialise at runtime."],
      ["What are common causes of NoClassDefFoundError?", "A JAR missing from the runtime classpath, deleted class files, version conflicts, or a failed static initializer."],
      ["Is StackOverflowError an Exception?", "No, it is an Error (a VirtualMachineError)."],
    ],
    ex: [
      "A JDBC program calls `Class.forName(\"com.mysql.cj.jdbc.Driver\")` and fails. Which exception do you get, and what is the fix?",
      "`ClassNotFoundException`, because the driver class is loaded by name and the MySQL Connector/J JAR is not on the classpath. Add the JAR (or Maven dependency) to the runtime classpath.",
    ],
  }),

  lesson("Exception Handling Interview Questions and Output Puzzles", {
    intro:
      "Exception questions in interviews come in two flavours: concept questions and \"what is the output?\" puzzles about try, catch and finally. This lesson collects the most common of both. The program runs several classic puzzles so you can check your predictions.",
    topics: [
      [
        "Classic output puzzles",
        "Return in try plus finally; return in catch plus return in finally; an exception thrown in finally replacing the original; finally modifying a returned variable; nested try with an inner finally; `System.exit` in try (finally does not run); catching a superclass first (does not compile).",
      ],
      [
        "Rules that answer most puzzles",
        "Finally always runs unless the JVM stops. A return in finally overrides everything. A throw in finally replaces the pending exception. The return value of a primitive is fixed when the return statement executes. Only the first matching catch runs.",
      ],
      [
        "Concept questions",
        "Checked vs unchecked; throw vs throws; final/finally/finalize; can we have try without catch (yes, with finally); can we catch multiple exceptions in one block (multi-catch); what is exception chaining; what are suppressed exceptions; what is the parent of all exceptions; what happens when an exception is thrown in a static block; rules of exceptions in overriding.",
      ],
    ],
    code: String.raw`public class Main {
    @SuppressWarnings("finally")
    static int puzzle1() {
        try { return 1; } finally { return 2; }
    }

    static int puzzle2() {
        int x = 1;
        try { x = 2; return x; } finally { x = 3; }
    }

    @SuppressWarnings("finally")
    static String puzzle3() {
        try {
            throw new IllegalStateException("from try");
        } finally {
            throw new IllegalArgumentException("from finally");
        }
    }

    static String puzzle4() {
        StringBuilder sb = new StringBuilder();
        try {
            sb.append("T");
            throw new RuntimeException();
        } catch (RuntimeException e) {
            sb.append("C");
            return sb.append("R").toString();
        } finally {
            sb.append("F");
        }
    }

    static String puzzle5() {
        String s = "";
        for (int i = 0; i < 3; i++) {
            try {
                if (i == 1) continue;
                s += i;
            } finally {
                s += "f";
            }
        }
        return s;
    }

    public static void main(String[] args) {
        System.out.println("puzzle1 return 1 vs finally return 2 -> " + puzzle1());
        System.out.println("puzzle2 finally changes x after return -> " + puzzle2());
        try {
            puzzle3();
        } catch (RuntimeException e) {
            System.out.println("puzzle3 exception that escapes -> " + e.getMessage());
        }
        System.out.println("puzzle4 return value -> " + puzzle4());
        System.out.println("puzzle5 finally with continue -> " + puzzle5());
        try {
            throw null;                                      // throwing null
        } catch (NullPointerException e) {
            System.out.println("throw null -> NullPointerException");
        }
    }
}`,
    walk:
      "Puzzle 1 returns 2 because finally's return overrides try's. Puzzle 2 returns 2: the value is captured when `return x` executes, and finally's assignment to x is too late. In puzzle 3, the exception from finally replaces the one from try, so \"from finally\" escapes.\n\nPuzzle 4 returns \"TCR\": the return value is computed in catch before finally appends \"F\" to the builder. Puzzle 5 shows finally running even when `continue` skips the rest of an iteration: \"0ff2f\". Finally, `throw null` throws a `NullPointerException`.",
    anim: [
      "Who wins: try, catch or finally?",
      [
        ["try", "try", "return 1"],
        ["catch", "catch", "return value"],
        ["fin", "finally", "return 2"],
        ["result", "caller gets", "2"],
        ["exc", "pending exc.", "discarded"],
      ],
      [
        ["try", "fin", "then", "try prepares to return 1, but finally must run first."],
        ["catch", "fin", "then", "The same happens when catch returns a value."],
        ["fin", "result", "override", "If finally itself returns, its value replaces whatever was pending."],
        ["fin", "exc", "discard", "A return or throw in finally also discards any pending exception."],
      ],
    ],
    mistakes: [
      "Forgetting that finally runs on continue and break as well.",
      "Assuming the first exception always wins; a later one from finally replaces it.",
    ],
    qa: [
      ["Can we write a try block without catch?", "Yes, with finally, or as try-with-resources."],
      ["What is the parent class of all exceptions?", "Throwable (Exception and Error both extend it)."],
      ["Can we throw an exception from finally?", "Yes, but it replaces any exception from try or catch, which is then lost."],
      ["What happens with System.exit() inside try?", "The JVM exits; finally does not run."],
      ["What is the output of `throw null`?", "A NullPointerException is thrown."],
      ["What are suppressed exceptions?", "Exceptions from closing resources in try-with-resources, attached to the primary exception via addSuppressed."],
    ],
    ex: [
      "Predict the output: `try { System.out.print(\"A\"); System.exit(0); } finally { System.out.print(\"B\"); }`.",
      "It prints only `A`. System.exit stops the JVM before finally can run.",
    ],
  }),
]);
