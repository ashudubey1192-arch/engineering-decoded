import { lesson } from "../../schema.js";

export default [
  lesson("Exceptions Output Questions Q26-Q37: Flow Through try, catch and finally", {
    intro:
      "Output questions 26 to 37 trace control flow through exception handlers:\n\n- a static String modified across nested calls\n- catching StackOverflowError from recursion\n- what happens after an uncaught division by zero\n- a general catch handling a specific exception\n- the order of try, catch and finally\n- `System.exit` inside try\n- a catch that does not match\n- catch and finally both returning\n- specific-to-general catch order, and the general-first compile error\n- nested try-catch-finally building a string\n- the value of a variable when a NullPointerException interrupts a method\n\nEach one runs in the program.",
    topics: [
      [
        "Q26 (output). How is a static String modified through try/catch in nested calls?",
        "A static field is shared, so every method that appends to it changes the same value. Each statement that completes before the exception has a lasting effect, and statements after the throwing line in the same try are skipped. Trace it like this: `s += \"a\"` in method1, then method1 calls method2, method2 appends \"b\", then throws, so its own later append is skipped. method1's catch appends \"c\", its finally appends \"d\", and main appends \"e\". The result is **\"abcde\"**. The key rule: an exception skips the rest of the try block, never what already ran.",
        "static String s = \"\";\nstatic void m2() { s += \"b\"; if (true) throw new RuntimeException(); s += \"X\"; }\nstatic void m1() { s += \"a\"; try { m2(); } catch (RuntimeException e) { s += \"c\"; } finally { s += \"d\"; } }\n// main: m1(); s += \"e\";  -> abcde",
      ],
      [
        "Q27 (output). Can recursion catch its own StackOverflowError?",
        "Yes. StackOverflowError is an Error, and it can be caught like any Throwable. When infinite recursion exhausts the thread stack, the error propagates up through the frames. A catch in main (or in a shallow frame) catches it, and the program **continues normally**, because the stack has unwound by then. The exact recursion depth printed varies with the stack size (`-Xss`) and the JIT, so output questions usually just print \"caught\". Catching it deep inside the recursion is risky, because there is very little stack left to run the handler.",
        "static int depth = 0;\nstatic void dive() { depth++; dive(); }\ntry { dive(); } catch (StackOverflowError e) { System.out.println(\"caught\"); }",
      ],
      [
        "Q28 (output). What runs after an uncaught 10 / 0?",
        "Integer division by zero throws **ArithmeticException: / by zero**. If nothing catches it, the statements after the division never execute: the method ends, the exception propagates, and if it leaves main, the stack trace is printed and the JVM exits with status 1. Output printed *before* the division still appears. Floating-point division (`10.0 / 0`) does **not** throw; it gives `Infinity` (and `0.0 / 0` gives `NaN`).",
        "System.out.println(\"before\");\nint r = 10 / 0;          // ArithmeticException\nSystem.out.println(\"after\");   // never printed",
      ],
      [
        "Q29 (output). Does catch (Exception e) handle an ArithmeticException, and does the program continue?",
        "Yes. ArithmeticException extends RuntimeException, which extends Exception, so `catch (Exception e)` matches it. After the catch block finishes, execution continues with the **statement after the whole try-catch**, not with the line after the division inside try. So a program that prints \"start\", divides by zero, catches, prints \"handled\" and then prints \"end\" outputs start, handled, end.",
        "try { System.out.println(\"start\"); int x = 1 / 0; System.out.println(\"skipped\"); }\ncatch (Exception e) { System.out.println(\"handled\"); }\nSystem.out.println(\"end\");",
      ],
      [
        "Q30 (output). In what order do try, catch and finally print?",
        "If try throws an exception that a catch handles, the order is: try (up to the throwing line), then catch, then finally, then the code after the statement. If try completes normally: try, then finally, then the code after. The catch is skipped. Finally always comes last within the statement, so printing \"T\", \"C\" and \"F\" gives **T C F** or **T F**.",
        "try { System.out.print(\"T \"); throw new RuntimeException(); }\ncatch (RuntimeException e) { System.out.print(\"C \"); }\nfinally { System.out.print(\"F \"); }   // T C F",
      ],
      [
        "Q31 (output). What happens with System.exit inside try?",
        "`System.exit(0)` starts JVM shutdown immediately. The rest of try, **all catch and finally blocks**, and everything after them **do not run**. Registered shutdown hooks still run. So `try { print(\"A\"); System.exit(0); } finally { print(\"B\"); }` prints only **A**. This is the classic exception to \"finally always runs\". The program in this lesson runs the case in a child JVM, so that it can show the output and keep going.",
        "try { System.out.println(\"A\"); System.exit(0); }\nfinally { System.out.println(\"B\"); }   // only A is printed",
      ],
      [
        "Q32 (output). What happens when catch(IndexOutOfBoundsException) meets an ArithmeticException?",
        "The catch type does not match: ArithmeticException is not an IndexOutOfBoundsException. So that catch is skipped, **finally still runs**, and then the ArithmeticException continues propagating out of the method. If no outer handler exists, the program prints the finally output, then the stack trace, and terminates. Code after the try statement does not run.",
        "try { int x = 5 / 0; }\ncatch (IndexOutOfBoundsException e) { System.out.println(\"not reached\"); }\nfinally { System.out.println(\"finally\"); }\n// finally, then ArithmeticException propagates",
      ],
      [
        "Q33 (output). Both catch and finally return a value. Which one is returned?",
        "**The finally's value.** When the catch executes `return \"catch\"`, the value is saved and finally runs. finally's own `return \"finally\"` replaces the pending return, so the caller receives \"finally\". The compiler warns (\"finally block does not complete normally\"). The same applies when try returns. Never return from finally in real code.",
        "static String f() {\n    try { throw new RuntimeException(); }\n    catch (RuntimeException e) { return \"catch\"; }\n    finally { return \"finally\"; }   // wins\n}",
      ],
      [
        "Q34 (output). How do catch blocks ordered from specific to general behave?",
        "When the blocks are ordered `catch (ArithmeticException)`, then `catch (RuntimeException)`, then `catch (Exception)`, an ArithmeticException is handled by the **first** block only. A NullPointerException skips the first block and is handled by the second. A checked exception thrown in the try reaches the third. Exactly one block runs per exception, and the program continues after the whole statement. This ordering compiles because each later type is a superclass of an earlier one, so none is unreachable.",
        "try { ... }\ncatch (ArithmeticException e) { ... }   // most specific first\ncatch (RuntimeException e) { ... }\ncatch (Exception e) { ... }           // most general last",
      ],
      [
        "Q35 (output). What happens when catch(Exception) comes before catch(ArithmeticException)?",
        "It is a **compile-time error**: \"exception ArithmeticException has already been caught\". Every ArithmeticException would already be handled by the earlier `catch (Exception e)`, so the second block is **unreachable**, and Java forbids unreachable code. The fix is to put the subclass first. This is one of the few output questions whose answer is \"does not compile\".",
        "try { int x = 1 / 0; }\ncatch (Exception e) { }\ncatch (ArithmeticException e) { }   // compile error: already caught",
      ],
      [
        "Q36 (output). What string does a nested try-catch-finally build?",
        "Trace each level separately. The inner try appends \"1\" and throws. The inner catch appends \"2\" and rethrows a new exception. The inner finally appends \"3\". The outer catch then receives the rethrown exception and appends \"4\", and the outer finally appends \"5\". Statements after the inner try statement but still inside the outer try are skipped, because the inner catch rethrew. The result is **\"12345\"**. If the inner catch did *not* rethrow, the outer catch would be skipped, and the code after the inner statement would run instead.",
        "try {\n    try { s += \"1\"; throw new RuntimeException(); }\n    catch (RuntimeException e) { s += \"2\"; throw new IllegalStateException(); }\n    finally { s += \"3\"; }\n} catch (IllegalStateException e) { s += \"4\"; } finally { s += \"5\"; }   // 12345",
      ],
      [
        "Q37 (output). What is the value of str when a NullPointerException interrupts a method?",
        "Only the statements that ran **before** the NullPointerException take effect. If a method sets `str = \"first\"`, then calls a method on a null reference, and the next line would have set `str = \"second\"`, then after catching the exception `str` is **\"first\"**. Java has no rollback: partial updates stay. This is why multi-step state changes should be made atomic: build the new state in locals and assign it at the end, or use a transaction.",
        "static String str = \"initial\";\nstatic void update() { str = \"first\"; String n = null; n.length(); str = \"second\"; }\n// after catching the NPE: str == \"first\"",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {
    static String s = "";
    static String str = "initial";

    // Q26
    static void method2() { s += "b"; if (s.length() > 0) throw new RuntimeException("m2"); s += "X"; }
    static void method1() {
        s += "a";
        try { method2(); } catch (RuntimeException e) { s += "c"; } finally { s += "d"; }
    }

    // Q27
    static int depth = 0;
    static void dive() { depth++; dive(); }

    // Q32
    static void mismatch() {
        try { int zero = 0; int x = 5 / zero; }
        catch (IndexOutOfBoundsException e) { System.out.println("Q32 not reached"); }
        finally { System.out.println("Q32 finally runs, then the ArithmeticException propagates"); }
        System.out.println("Q32 not reached either");
    }

    // Q33
    @SuppressWarnings("finally")
    static String bothReturn() {
        try { throw new RuntimeException(); }
        catch (RuntimeException e) { return "catch"; }
        finally { return "finally"; }
    }

    // Q34
    static String classify(int choice) {
        try {
            if (choice == 0) { int zero = 0; return "" + (1 / zero); }
            if (choice == 1) { Object o = null; return o.toString(); }
            throw new IOException("checked");
        } catch (ArithmeticException e) { return "ArithmeticException block";
        } catch (RuntimeException e) { return "RuntimeException block (" + e.getClass().getSimpleName() + ")";
        } catch (Exception e) { return "Exception block (" + e.getClass().getSimpleName() + ")"; }
    }

    // Q37
    static void update() { str = "first"; String n = null; n.length(); str = "second"; }

    public static void main(String[] args) throws Exception {
        method1();
        s += "e";
        System.out.println("Q26 s = " + s);

        try { dive(); } catch (StackOverflowError e) { System.out.println("Q27 StackOverflowError caught, program continues (depth > 1000: " + (depth > 1000) + ")"); }

        try {
            System.out.println("Q28 before");
            int zero = 0;
            int r = 10 / zero;
            System.out.println("Q28 after (never printed)");
        } catch (ArithmeticException e) { System.out.println("Q28 " + e.getMessage() + "; 10.0 / 0 = " + (10.0 / 0)); }

        try { System.out.println("Q29 start"); int zero = 0; int x = 1 / zero; System.out.println("Q29 skipped"); }
        catch (Exception e) { System.out.println("Q29 handled " + e.getClass().getSimpleName()); }
        System.out.println("Q29 end");

        StringBuilder order = new StringBuilder();
        try { order.append("T "); throw new RuntimeException(); }
        catch (RuntimeException e) { order.append("C "); }
        finally { order.append("F"); }
        System.out.println("Q30 " + order);

        // Q31: run the System.exit case in a separate JVM so this program can keep going.
        Path dir = Files.createTempDirectory("q31");
        Files.writeString(dir.resolve("Exit.java"),
                "public class Exit { public static void main(String[] a) { try { System.out.println(\"A\"); System.exit(0); } finally { System.out.println(\"B\"); } } }");
        Process p = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                dir.resolve("Exit.java").toString()).redirectErrorStream(true).start();
        String childOutput = new String(p.getInputStream().readAllBytes()).trim();
        p.waitFor();
        System.out.println("Q31 child JVM printed only: " + childOutput);

        try { mismatch(); } catch (ArithmeticException e) { System.out.println("Q32 caught by the caller: " + e.getMessage()); }

        System.out.println("Q33 returned " + bothReturn());

        for (int i = 0; i < 3; i++) System.out.println("Q34 choice " + i + " -> " + classify(i));

        System.out.println("Q35 catch(Exception) before catch(ArithmeticException) does not compile");

        String t = "";
        try {
            try { t += "1"; throw new RuntimeException(); }
            catch (RuntimeException e) { t += "2"; throw new IllegalStateException(); }
            finally { t += "3"; }
        } catch (IllegalStateException e) { t += "4"; } finally { t += "5"; }
        System.out.println("Q36 t = " + t);

        try { update(); } catch (NullPointerException e) { System.out.println("Q37 str = " + str); }
    }
}`,
    walk:
      "Q26 builds \"abcde\": a and b are appended, method2's throw skips its \"X\", and method1's catch, method1's finally and main add c, d and e. Q27 catches the StackOverflowError in main and prints a depth check instead of the exact depth, which varies. Q28 never prints \"after\", and shows that floating-point division by zero is Infinity. Q29 continues after the whole try-catch, and Q30 prints T C F.\n\nQ31 writes a tiny Exit.java and runs it in a child JVM using source-file mode. The child prints only \"A\", proving that `System.exit` stops finally from running. In Q32 the catch does not match, so finally runs and the exception escapes to main. Q33 returns \"finally\". Q34 sends three different exceptions to three catch blocks. Q36 traces the nested blocks to \"12345\". Q37 shows the partial update \"first\".",
    anim: [
      "Tracing Q26 across nested calls",
      [
        ["main", "main", "s += e at end"],
        ["m1", "method1", "a, catch c, fin d"],
        ["m2", "method2", "b, then throw"],
        ["s", "static s", "shared String"],
      ],
      [
        ["m1", "s", "append a", "method1 appends a and calls method2 inside its try."],
        ["m2", "s", "append b", "method2 appends b, then throws before it can append X."],
        ["m2", "m1", "exception", "The RuntimeException leaves method2 and reaches method1's catch."],
        ["m1", "s", "append c, d", "The catch appends c and the finally appends d."],
        ["main", "s", "append e", "Control returns normally to main, which appends e: abcde."],
      ],
    ],
    mistakes: [
      "Assuming execution resumes on the line after the one that threw. It resumes after the whole try statement.",
      "Forgetting that floating-point division by zero never throws.",
      "Expecting finally to run after `System.exit`.",
    ],
    qa: [
      [
        "Why does the program use `int zero = 0; 1 / zero` instead of `1 / 0`?",
        "Both throw at runtime, but `1 / 0` is a constant expression that tools warn about. A variable keeps the example realistic and the compiler quiet.",
      ],
      [
        "Is catching StackOverflowError a good recovery strategy?",
        "Rarely. It is acceptable in a top-level guard. The real fix is to make the recursion iterative or bounded, or to increase `-Xss` for legitimately deep stacks.",
      ],
      [
        "What exit status does the JVM use for an uncaught exception in main?",
        "1, after the default handler prints the stack trace, once no other non-daemon threads are alive.",
      ],
    ],
    ex: [
      "Predict: `try { System.out.print(\"1\"); return; } catch (Exception e) { System.out.print(\"2\"); } finally { System.out.print(\"3\"); } System.out.print(\"4\");` inside a void method.",
      "It prints `13`. The try prints 1 and returns, finally prints 3 before the method actually returns, catch is skipped because nothing was thrown, and 4 is never reached.",
    ],
  }),

  lesson("Exceptions Output Questions Q38-Q47: Uncaught, Multi-catch, Propagation, throws and try-with-resources", {
    intro:
      "Questions 38 to 47 test how far exceptions travel and what the compiler demands:\n\n- an uncaught custom RuntimeException\n- an invalid multi-catch of `IOException | Exception`\n- a NullPointerException propagating through methods\n- FileNotFoundException with a throws clause\n- a checked exception without throws\n- try-with-resources with one and with two resources\n- checked exceptions thrown and caught in the same method, or declared with throws and caught in main\n\nThe program uses temporary files, so the file questions really run.",
    topics: [
      [
        "Q38 (output). What happens with an uncaught custom RuntimeException?",
        "A custom class extending RuntimeException is unchecked, so it compiles without throws or catch. When it is thrown and never caught, it propagates out of main. The default handler prints `Exception in thread \"main\" MyException: message` plus the stack trace to **stderr**, and the program terminates. Output that was printed before the throw still appears on stdout, and code after the throw does not run. A finally block on the way still runs.",
        "class MyException extends RuntimeException { MyException(String m) { super(m); } }\nSystem.out.println(\"start\");\nthrow new MyException(\"boom\");   // start, then stack trace on stderr",
      ],
      [
        "Q39 (output). Does catch (IOException | Exception e) compile?",
        "**No.** The alternatives of a multi-catch must not be subclasses of one another. IOException is a subclass of Exception, so the compiler reports: \"Alternatives in a multi-catch statement cannot be related by subclassing\". Catching just `Exception` already covers IOException. The fix is either `catch (Exception e)` alone, or two separate blocks with IOException first.",
        "try { ... }\ncatch (IOException | Exception e) { }   // compile error",
      ],
      [
        "Q40 (output). How does a NullPointerException propagate through methods?",
        "If `c()` dereferences null and neither `c()`, `b()` nor `a()` catches the exception, it unwinds all three frames and reaches whichever method has a matching catch, for example main. Prints placed after the calls in a, b and c are skipped, while finally blocks in those methods run. Since Java 14, the NPE message says exactly what was null, for example `Cannot invoke \"String.length()\" because \"<local1>\" is null`, and it names the variable when the code is compiled with `-g`.",
        "static void c() { String s = null; s.length(); }\nstatic void b() { c(); System.out.println(\"b after\"); }   // skipped\nstatic void a() { b(); }\n// main: try { a(); } catch (NullPointerException e) { ... }",
      ],
      [
        "Q41 (output). What happens with FileNotFoundException and a throws clause?",
        "`new FileInputStream(\"missing.txt\")` throws the checked FileNotFoundException. If the method declares `throws FileNotFoundException` (or `throws IOException`), it compiles, and the exception goes to the caller. Main must catch it or declare it too. When the file is missing, the message is the path plus the reason, for example `missing.txt (No such file or directory)` on Unix or `(The system cannot find the file specified)` on Windows. When the file exists, the stream opens normally.",
        "static void open(String name) throws FileNotFoundException {\n    new FileInputStream(name);   // may throw\n}",
      ],
      [
        "Q42 (output). What happens with a checked exception that has no throws or catch?",
        "**Compile error**: \"unreported exception FileNotFoundException; must be caught or declared to be thrown\". The compiler enforces the catch-or-declare rule for checked exceptions, so a method that calls `new FileInputStream(name)` without a try-catch or a throws clause does not compile. Unchecked exceptions have no such rule.",
        "static void open(String name) {\n    new FileInputStream(name);   // compile error: unreported exception\n}",
      ],
      [
        "Q43 (output). What does try-with-resources do with a FileInputStream?",
        "`try (FileInputStream in = new FileInputStream(file)) { ... }` opens the file and runs the body, and `in.close()` is called automatically afterwards, even if the body throws. If opening fails (FileNotFoundException), the body never runs and there is nothing to close, so the exception goes to the catch. Reading a 5-byte file with `in.read()` in a loop prints the bytes, and then the stream is closed.",
        "try (FileInputStream in = new FileInputStream(file)) {\n    int b; while ((b = in.read()) != -1) System.out.print((char) b);\n} catch (IOException e) { ... }",
      ],
      [
        "Q44 (output). What does try-with-resources do with two resources?",
        "Resources separated by `;` are opened left to right and **closed right to left**: `try (FileInputStream in = ...; FileOutputStream out = ...)` closes `out` first, then `in`. If the second resource fails to open, the first is still closed. This makes copying a file safe in a single statement, with both streams always closed.",
        "try (FileInputStream in = new FileInputStream(src);\n     FileOutputStream out = new FileOutputStream(dst)) {\n    in.transferTo(out);\n}   // out closed, then in",
      ],
      [
        "Q45 (output). What happens when a checked exception is thrown without throws?",
        "`throw new Exception(\"x\");` or `throw new IOException()` inside a method that neither catches it nor declares it is a **compile error** (\"unreported exception\"). Using `throw` explicitly makes no difference: the compiler checks every point where a checked exception can escape. Declaring `throws Exception`, or wrapping the throw in try-catch, fixes it.",
        "static void fail() {\n    throw new Exception(\"x\");   // compile error\n}",
      ],
      [
        "Q46 (output). What happens when a checked exception is thrown and caught in the same method?",
        "It compiles **without** a throws clause, because the exception never escapes: `try { throw new IOException(\"local\"); } catch (IOException e) { print }`. The catch handles it, and execution continues after the try statement. The caller is unaffected. This is how to handle checked exceptions locally when you can recover.",
        "static void safe() {\n    try { throw new IOException(\"local\"); }\n    catch (IOException e) { System.out.println(\"handled \" + e.getMessage()); }\n}",
      ],
      [
        "Q47 (output). What happens with throws on the method and a catch in main?",
        "The method declares `throws IOException` and throws. The exception propagates to main, which catches it. Output: whatever the method printed before the throw, then main's catch message, then main's following statements. Code in the method after the throw is skipped. If main did not catch, main itself would have to declare `throws IOException`, and the stack trace would be printed.",
        "static void risky() throws IOException { System.out.println(\"risky start\"); throw new IOException(\"io\"); }\n// main: try { risky(); } catch (IOException e) { System.out.println(\"main caught \" + e.getMessage()); }",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;

public class Main {

    static class MyException extends RuntimeException { MyException(String m) { super(m); } }

    // Q40
    static void c() { String s = null; s.length(); }
    static void b() { try { c(); System.out.println("Q40 b after (skipped)"); } finally { System.out.println("Q40   finally in b"); } }
    static void a() { b(); }

    // Q41
    static void open(String name) throws FileNotFoundException {
        FileInputStream in = new FileInputStream(name);       // throws when missing
        try { in.close(); } catch (IOException ignored) { }
    }

    // Q46
    static void safe() {
        try { throw new IOException("local"); }
        catch (IOException e) { System.out.println("Q46 handled in the same method: " + e.getMessage()); }
    }

    // Q47
    static void risky() throws IOException {
        System.out.println("Q47 risky start");
        if (Boolean.TRUE) throw new IOException("io");
        System.out.println("Q47 risky end (skipped)");
    }

    public static void main(String[] args) throws Exception {
        // Q38: run the uncaught case on its own thread so main can report what happened.
        Thread worker = new Thread(() -> { throw new MyException("boom"); });
        worker.setUncaughtExceptionHandler((t, e) -> System.out.println("Q38 uncaught " + e.getClass().getSimpleName() + ": " + e.getMessage() + " -> thread terminated"));
        worker.start();
        worker.join();

        System.out.println("Q39 catch (IOException | Exception e) does not compile: alternatives related by subclassing");

        try { a(); } catch (NullPointerException e) { System.out.println("Q40 main caught: " + e.getMessage()); }

        Path dir = Files.createTempDirectory("q41");
        Path present = Files.writeString(dir.resolve("data.txt"), "hello");
        open(present.toString());
        System.out.println("Q41 existing file opened");
        try { open(dir.resolve("missing.txt").toString()); }
        catch (FileNotFoundException e) { System.out.println("Q41 FileNotFoundException for missing.txt"); }

        System.out.println("Q42 + Q45 a checked exception that is neither caught nor declared is a compile error");

        try (FileInputStream in = new FileInputStream(present.toFile())) {
            StringBuilder text = new StringBuilder();
            int value;
            while ((value = in.read()) != -1) text.append((char) value);
            System.out.println("Q43 read with try-with-resources: " + text);
        }

        Path copy = dir.resolve("copy.txt");
        try (FileInputStream in = new FileInputStream(present.toFile());
             FileOutputStream out = new FileOutputStream(copy.toFile())) {
            in.transferTo(out);
        }
        System.out.println("Q44 two resources, copy contains: " + Files.readString(copy));

        safe();

        try { risky(); } catch (IOException e) { System.out.println("Q47 main caught " + e.getMessage()); }
        System.out.println("Q47 main continues");
    }
}`,
    walk:
      "Q38 throws an uncaught custom RuntimeException on a worker thread whose uncaught-exception handler reports it. A real uncaught exception in main would print a stack trace to stderr and end the program, so a separate thread lets the demonstration continue. In Q40 the NullPointerException starts in `c()`, skips the print in b, runs b's finally, and reaches main. Its helpful message names the null local variable.\n\nQ41 opens a real temporary file successfully, then fails on a missing one with FileNotFoundException, which the method declares. Q43 reads \"hello\" with try-with-resources. Q44 copies the file through two resources, which are closed in reverse order. Q46 throws and catches a checked exception inside one method, with no throws clause. In Q47, `risky()` declares `throws IOException`, prints its start line, throws, and main catches the exception and continues. The compile-error cases (Q39, Q42, Q45) are explained in the printed lines.",
    anim: [
      "Catch or declare: the checked-exception rule",
      [
        ["thr", "throw IOExcept.", "checked"],
        ["catch", "local catch", "Q46"],
        ["decl", "throws clause", "Q41, Q47"],
        ["caller", "caller", "must handle"],
        ["err", "compile error", "Q42, Q45"],
      ],
      [
        ["thr", "catch", "handled here", "A matching catch in the same method handles it; no throws clause is needed."],
        ["thr", "decl", "or declare", "Without a catch, the method must list the type in its throws clause."],
        ["decl", "caller", "propagate", "Every caller must then catch it or declare it in turn."],
        ["thr", "err", "neither", "Neither catch nor throws: javac reports an unreported exception."],
        ["caller", "catch", "main catches", "In Q47, main is the caller whose catch finally handles the IOException."],
      ],
    ],
    mistakes: [
      "Expecting an uncaught exception's message on stdout. The default handler writes to stderr.",
      "Writing `catch (IOException | Exception e)`.",
      "Opening several streams without try-with-resources, so a failure leaks the ones already open.",
    ],
    qa: [
      [
        "Does the order of resources in try-with-resources matter?",
        "Yes. They open in declaration order and close in reverse, so declare a resource that depends on another after it. For example, declare the stream before a reader that wraps it.",
      ],
      [
        "Can main declare throws Exception?",
        "Yes. `public static void main(String[] args) throws Exception` is legal, and an exception escaping main is printed by the default handler.",
      ],
      [
        "What does Java 14's helpful NPE message add?",
        "It describes the exact null expression, for example `because \"user.address\" is null`, so chained calls no longer need guesswork. Local variable names appear when the code is compiled with `-g`.",
      ],
    ],
    ex: [
      "A method calls `Files.readString(path)` (which throws IOException). Show the two ways to make it compile, and say which is better when the caller cannot do anything useful about the failure.",
      "Either declare `throws IOException`, or catch it: `try { ... } catch (IOException e) { throw new UncheckedIOException(e); }`. When the caller cannot recover, wrapping in UncheckedIOException keeps the method signatures clean and preserves the cause.",
    ],
  }),

  lesson("Exceptions Output Questions Q48-Q59: Unhandled Exceptions and Overriding with throws", {
    intro:
      "The final exception output questions, 48 to 59, cover two themes. The first is unhandled exceptions:\n\n- an unchecked NullPointerException left unhandled\n- a checked exception with no handler\n- a method that declares `throws IOException, SQLException` and is caught as Exception\n\nThe second, and largest, is the **overriding rules** for throws clauses:\n\n- a subclass declaring RuntimeException where the parent declares NullPointerException\n- a subclass adding a checked exception the parent lacks\n- narrower and broader checked exceptions\n- IOException in the parent with NullPointerException in the child\n- the cases where neither, or only one side, declares anything\n\nThe program compiles every legal case and explains each illegal one.",
    topics: [
      [
        "Q48 (output). What happens when an unchecked NullPointerException is thrown and not handled?",
        "It compiles, because unchecked exceptions need no declaration. At runtime, `throw new NullPointerException(\"x\")` (or a real null dereference) propagates out of main. The default handler prints `Exception in thread \"main\" java.lang.NullPointerException: x` with the stack trace to stderr, the remaining statements do not run, and the exit code is 1.",
        "public static void main(String[] args) {\n    System.out.println(\"before\");\n    throw new NullPointerException(\"x\");   // compiles; crashes at runtime\n}",
      ],
      [
        "Q49 (output). What happens when a checked exception has no handler at all?",
        "**Compile error.** If `main` (or any method) throws `new Exception()` or `new IOException()` without catching it and without `throws` in its signature, javac reports \"unreported exception ... must be caught or declared to be thrown\". The program never runs. Adding `throws Exception` to main makes it compile; at runtime it then behaves like Q48.",
        "public static void main(String[] args) {\n    throw new IOException(\"x\");   // compile error\n}",
      ],
      [
        "Q50 (output). A method declares throws IOException, SQLException and is caught as Exception. Does it work?",
        "Yes. The caller may handle both declared types with a single `catch (Exception e)`, because both are subclasses of Exception. Whichever one is thrown is caught, and `e.getClass()` shows the actual type. You could also use separate catches, or `catch (IOException | SQLException e)`. Catching Exception compiles but also catches unrelated runtime exceptions, so prefer the precise form in real code.",
        "static void work(int n) throws IOException, SQLException {\n    if (n == 0) throw new IOException(\"io\");\n    throw new SQLException(\"sql\");\n}\ntry { work(0); } catch (Exception e) { System.out.println(e.getClass().getSimpleName()); }",
      ],
      [
        "Q51 (output). The superclass method throws NullPointerException and the subclass method throws RuntimeException. Legal?",
        "**Yes.** Both are unchecked, and the overriding rules restrict only **checked** exceptions. A subclass method may declare any unchecked exception, broader or narrower, and the compiler does not care. The program compiles and runs normally, and the declared types are just documentation.",
        "class Parent { void run() throws NullPointerException { } }\nclass Child extends Parent { @Override void run() throws RuntimeException { } }   // OK",
      ],
      [
        "Q52 (output). The superclass method declares nothing and the subclass method throws a checked exception. Legal?",
        "**No, compile error**: \"overridden method does not throw IOException\". Code that calls `parent.run()` through a Parent reference expects no checked exceptions, and a Child that could throw IOException would break that promise. The workarounds are to throw an unchecked exception (for example UncheckedIOException), to handle the exception inside the method, or to change the parent's signature.",
        "class Parent { void run() { } }\nclass Child extends Parent { @Override void run() throws IOException { } }   // compile error",
      ],
      [
        "Q53 (output). The superclass method throws IOException and the subclass method throws FileNotFoundException. Legal?",
        "**Yes.** FileNotFoundException is a subclass of IOException, so the overriding method declares a **narrower** checked exception. Every caller prepared for IOException can also handle FileNotFoundException. Declaring nothing at all is also legal.",
        "class Parent { void read() throws IOException { } }\nclass Child extends Parent { @Override void read() throws FileNotFoundException { } }   // OK",
      ],
      [
        "Q54 (output). The superclass method throws IOException and the subclass method throws Exception. Legal?",
        "**No, compile error**: \"overridden method does not throw Exception\". Exception is **broader** than IOException: it could include SQLException or other checked types that callers of the parent are not prepared for. An overriding method may never widen the set of checked exceptions.",
        "class Parent { void read() throws IOException { } }\nclass Child extends Parent { @Override void read() throws Exception { } }   // compile error",
      ],
      [
        "Q55 (output). The superclass method throws IOException and the subclass method throws NullPointerException. Legal?",
        "**Yes.** NullPointerException is unchecked, so it is always allowed, and the child simply declares no checked exceptions, which is fewer than the parent. Callers using a Parent reference must still write a catch for IOException, because the compiler checks the declared type of the reference, not the runtime object.",
        "class Parent { void read() throws IOException { } }\nclass Child extends Parent { @Override void read() throws NullPointerException { } }   // OK",
      ],
      [
        "Q56 (output). The superclass method declares nothing and the subclass method throws NullPointerException. Legal?",
        "**Yes.** Unchecked exceptions are never restricted by the overriding rules, so adding `throws NullPointerException` (or actually throwing one) in the child compiles. At runtime, a call through a Parent reference propagates the NPE like any unchecked exception.",
        "class Parent { void run() { } }\nclass Child extends Parent { @Override void run() throws NullPointerException { } }   // OK",
      ],
      [
        "Q57 (output). Neither the superclass nor the subclass method declares exceptions. Legal?",
        "**Yes**, this is the normal case. Both methods can still throw unchecked exceptions at runtime. Overriding works as usual: a call through a Parent reference runs the Child's version (dynamic dispatch).",
        "class Parent { void run() { System.out.println(\"parent\"); } }\nclass Child extends Parent { @Override void run() { System.out.println(\"child\"); } }",
      ],
      [
        "Q58 (output). The superclass method throws IOException and the subclass method declares nothing. Legal?",
        "**Yes.** An overriding method may declare **fewer** checked exceptions. The child promises not to throw IOException. Code using a **Child** reference needs no try-catch. Code using a **Parent** reference must still catch IOException, because the compiler only knows the reference type.",
        "class Parent { void read() throws IOException { } }\nclass Child extends Parent { @Override void read() { } }   // OK\nnew Child().read();          // no try needed\nParent p = new Child(); p.read();   // must handle IOException",
      ],
      [
        "Q59 (output). The superclass method throws NullPointerException and the subclass method declares nothing. Legal?",
        "**Yes.** Removing an unchecked exception from the throws clause changes nothing for the compiler, because unchecked exceptions in throws are documentation only. The program compiles and runs. Of the twelve overriding-rule cases, the illegal ones are exactly those where the **child adds or broadens a checked exception** (Q52 and Q54).",
        "class Parent { void run() throws NullPointerException { } }\nclass Child extends Parent { @Override void run() { } }   // OK",
      ],
    ],
    code: String.raw`import java.io.*;
import java.sql.SQLException;

public class Main {

    // Q50
    static void work(int n) throws IOException, SQLException {
        if (n == 0) throw new IOException("io failure");
        throw new SQLException("sql failure");
    }

    // Q51: unchecked in both, child broader - legal.
    static class P51 { void run() throws NullPointerException { } }
    static class C51 extends P51 { @Override void run() throws RuntimeException { System.out.println("Q51 compiles: unchecked types are unrestricted"); } }

    // Q53: narrower checked exception - legal.
    static class P53 { void read() throws IOException { } }
    static class C53 extends P53 { @Override void read() throws FileNotFoundException { throw new FileNotFoundException("narrower"); } }

    // Q55: unchecked instead of checked - legal.
    static class P55 { void read() throws IOException { } }
    static class C55 extends P55 { @Override void read() throws NullPointerException { System.out.println("Q55 compiles: child declares only an unchecked type"); } }

    // Q56: parent none, child unchecked - legal.
    static class P56 { void run() { } }
    static class C56 extends P56 { @Override void run() throws NullPointerException { System.out.println("Q56 compiles: adding an unchecked exception is fine"); } }

    // Q57: neither declares - legal, dynamic dispatch.
    static class P57 { void run() { System.out.println("parent"); } }
    static class C57 extends P57 { @Override void run() { System.out.println("Q57 child version runs through a Parent reference"); } }

    // Q58: parent checked, child none - legal.
    static class P58 { void read() throws IOException { } }
    static class C58 extends P58 { @Override void read() { System.out.println("Q58 C58.read() ran (declares no checked exception)"); } }

    // Q59: parent unchecked, child none - legal.
    static class P59 { void run() throws NullPointerException { } }
    static class C59 extends P59 { @Override void run() { System.out.println("Q59 compiles: dropping an unchecked type changes nothing"); } }

    public static void main(String[] args) throws Exception {
        // Q48: an unhandled unchecked exception, observed on a separate thread.
        Thread t = new Thread(() -> { throw new NullPointerException("x"); });
        t.setUncaughtExceptionHandler((thread, e) -> System.out.println("Q48 unhandled " + e.getClass().getSimpleName() + ": " + e.getMessage() + " (compiles, fails at runtime)"));
        t.start(); t.join();

        System.out.println("Q49 throwing a checked exception with no catch and no throws does not compile");

        for (int n = 0; n < 2; n++) {
            try { work(n); } catch (Exception e) { System.out.println("Q50 catch (Exception) got " + e.getClass().getSimpleName() + ": " + e.getMessage()); }
        }

        new C51().run();
        System.out.println("Q52 parent declares nothing, child throws IOException: compile error");
        P53 p53 = new C53();
        try { p53.read(); } catch (IOException e) { System.out.println("Q53 narrower checked exception thrown: " + e.getClass().getSimpleName()); }
        System.out.println("Q54 parent IOException, child Exception (broader): compile error");
        new C55().read();
        new C56().run();
        P57 p57 = new C57();
        p57.run();
        new C58().read();                                   // no try-catch needed
        P58 asParent = new C58();
        try { asParent.read(); } catch (IOException e) { }  // must handle through the Parent type
        System.out.println("Q58 Child reference: no try needed; Parent reference: try/catch required");
        new C59().run();
    }
}`,
    walk:
      "Q48 runs an unhandled NullPointerException on a worker thread, so its handler can report it. In main the same code would end the program with a stack trace. Q50 calls `work` twice, getting an IOException the first time and an SQLException the second, and both are caught by one `catch (Exception e)`.\n\nEvery legal overriding case from Q51 to Q59 is a real nested class pair that compiles. C51 declares a broader unchecked exception. C53 throws the narrower FileNotFoundException and is caught as IOException through the parent reference. C55, C56 and C59 add or drop unchecked declarations. C57 shows ordinary dynamic dispatch. C58 shows that a Child reference needs no try-catch, while the same object used through a P58 reference still requires one. The two illegal cases, Q52 and Q54, which add or broaden a checked exception, are printed as explanations, because they would stop the whole file from compiling.",
    anim: [
      "Overriding rule for checked exceptions",
      [
        ["parent", "Parent.read()", "throws IOException"],
        ["same", "same / narrower", "FNFE: legal"],
        ["none", "fewer / none", "legal"],
        ["unchk", "unchecked only", "legal"],
        ["broad", "broader / new", "compile error"],
      ],
      [
        ["parent", "same", "Q53", "Declaring FileNotFoundException, a subclass of IOException, is allowed."],
        ["parent", "none", "Q58", "Declaring no checked exception at all is allowed: callers just get less to handle."],
        ["parent", "unchk", "Q55", "Unchecked exceptions such as NPE are never restricted by the rules."],
        ["parent", "broad", "Q54", "Declaring Exception widens what callers must handle, so javac rejects it."],
        ["none", "broad", "Q52", "With no checked exceptions in the parent, any checked one in the child is an error."],
      ],
    ],
    mistakes: [
      "Thinking a child method cannot throw RuntimeException when the parent declares nothing. Unchecked exceptions are always allowed.",
      "Assuming that a child declaring fewer exceptions removes the need for try-catch when calling through a parent reference.",
      "Confusing the overriding rules (methods) with constructor rules. A subclass constructor must handle everything `super(...)` throws.",
    ],
    qa: [
      [
        "Why are only checked exceptions restricted when overriding?",
        "The restriction protects compile-time guarantees. Callers of the parent type were forced to handle exactly the parent's checked exceptions, while unchecked exceptions were never promised or required.",
      ],
      [
        "Do interface methods follow the same rules?",
        "Yes. An implementing method may declare the same, narrower or fewer checked exceptions than the interface method, never broader ones.",
      ],
      [
        "Can an overriding method declare a checked exception the parent lacks if it is a subclass of RuntimeException?",
        "Then it is not a checked exception. Any RuntimeException subclass is unchecked, and an overriding method may always declare it.",
      ],
    ],
    ex: [
      "The parent has `void save() throws IOException, SQLException`. Which of these child declarations compile: (a) `throws IOException` (b) `throws Exception` (c) `throws FileNotFoundException, SQLException` (d) `throws IllegalStateException`?",
      "(a) compiles (fewer). (b) does not compile (broader). (c) compiles (narrower plus the same). (d) compiles (it declares only an unchecked type, which means no checked exceptions).",
    ],
  }),
];
