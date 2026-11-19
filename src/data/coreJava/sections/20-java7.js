import { lesson, section } from "../schema.js";

export default section("java-7", "Java 7 Features", [
  lesson("Java 7 Language and Library Features", {
    intro:
      "Java 7 (2011), the first release under Oracle, delivered \"Project Coin\" language improvements and important libraries: try-with-resources, multi-catch, strings in switch, the diamond operator, binary literals and underscores in numbers, NIO.2 file APIs, the Fork/Join framework and new concurrency utilities such as Phaser. This lesson tours every Java 7 feature with runnable examples and points to the lessons that cover each in depth.",
    topics: [
      [
        "Project Coin language changes",
        "Strings in `switch` statements; binary integer literals (`0b1010`); underscores in numeric literals (`1_000_000`); the diamond operator (`new HashMap<>()`) for type inference; try-with-resources with `AutoCloseable`; multi-catch (`catch (IOException | SQLException e)`); more precise rethrow of final exceptions; and simplified varargs warnings with `@SafeVarargs`.",
      ],
      [
        "Automatic resource management",
        "Try-with-resources closes resources automatically in reverse order and records close failures as suppressed exceptions (`Throwable.getSuppressed()`, also new in Java 7). See the exceptions section for full detail.",
      ],
      [
        "NIO.2 (java.nio.file)",
        "`Path`, `Paths`, `Files` (copy, move, delete, walkFileTree, readAllLines, newBufferedReader), file attributes and permissions, symbolic links, `WatchService` for directory change notifications and the ZIP file system provider.",
      ],
      [
        "Concurrency additions",
        "The Fork/Join framework (`ForkJoinPool`, `RecursiveTask`), `Phaser`, `TransferQueue`/`LinkedTransferQueue`, `ConcurrentLinkedDeque` and `ThreadLocalRandom`. The concurrency section covers ReentrantLock, ReadWriteLock, Semaphore, CountDownLatch, CyclicBarrier and atomics, which these build on.",
      ],
      [
        "JVM and other changes",
        "The `invokedynamic` bytecode instruction (the foundation for Java 8 lambdas), the string pool moved from PermGen to the heap, the G1 collector became fully supported, `java.util.Objects` utility methods (`equals`, `hash`, `requireNonNull`), and `Throwable` suppression and `addSuppressed`.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static String dayType(String day) {
        switch (day.toLowerCase()) {                         // strings in switch
            case "saturday":
            case "sunday": return "weekend";
            default: return "weekday";
        }
    }

    static void precise(boolean io) throws IOException, InterruptedException {
        try {
            if (io) throw new IOException("disk"); else throw new InterruptedException("stop");
        } catch (Exception e) {
            throw e;                                         // precise rethrow: only the two checked types
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("strings in switch: Sunday is a " + dayType("Sunday") + ", Monday a " + dayType("Monday"));
        int mask = 0b1010_1010;                              // binary literal with underscores
        long population = 1_400_000_000L;
        System.out.println("binary literal " + mask + ", underscores " + population);

        Map<String, List<Integer>> scores = new HashMap<>(); // diamond operator
        scores.computeIfAbsent("asha", k -> new ArrayList<>()).add(91);
        System.out.println("diamond inference: " + scores);

        Path file = Files.createTempFile("java7", ".txt");   // NIO.2
        Files.write(file, Arrays.asList("first", "second"));
        try (BufferedReader reader = Files.newBufferedReader(file)) {   // try-with-resources
            System.out.println("NIO.2 + try-with-resources: " + reader.readLine());
        }

        for (String input : new String[] {"12", null}) {
            try {
                System.out.println("parsed " + Integer.parseInt(Objects.requireNonNull(input, "input")));
            } catch (NumberFormatException | NullPointerException e) {   // multi-catch
                System.out.println("multi-catch: " + e.getClass().getSimpleName());
            }
        }
        try { precise(true); } catch (IOException e) { System.out.println("precise rethrow kept the type: " + e.getMessage()); }

        Exception primary = new Exception("primary");
        primary.addSuppressed(new IOException("close failed"));
        System.out.println("suppressed exceptions: " + primary.getSuppressed()[0].getMessage());

        System.out.println("Objects.equals(null, null): " + Objects.equals(null, null) + ", Objects.hash: " + (Objects.hash("a", 1) == Objects.hash("a", 1)));
        System.out.println("ThreadLocalRandom in range: " + (ThreadLocalRandom.current().nextInt(1, 7) >= 1));

        ForkJoinPool pool = new ForkJoinPool();
        long sum = pool.invoke(new RecursiveTask<Long>() {
            protected Long compute() { long s = 0; for (int i = 1; i <= 100; i++) s += i; return s; }
        });
        System.out.println("Fork/Join task result: " + sum);
        pool.shutdown();

        Phaser phaser = new Phaser(1);
        int before = phaser.getPhase();
        phaser.arrive();                                     // the only party arrives: phase advances
        System.out.println("Phaser phase before/after: " + before + " -> " + phaser.getPhase());
        Files.delete(file);
    }
}`,
    walk:
      "The program demonstrates Java 7 additions one by one: a `switch` on strings with fall-through for the weekend, a binary literal with underscores (170) and a readable `long`, and the diamond operator inferring generic types. NIO.2 writes a file with `Files.write`, and try-with-resources reads it and closes the reader automatically.\n\nMulti-catch handles a `NullPointerException` from `Objects.requireNonNull` in the same block as `NumberFormatException`. Precise rethrow lets `precise` declare only the two checked types it can really throw even though it catches `Exception`. The remaining lines show suppressed exceptions, the `Objects` utilities, `ThreadLocalRandom`, a Fork/Join task and a `Phaser`.",
    anim: [
      "Java 7 at a glance",
      [
        ["coin", "Project Coin", "syntax sugar"],
        ["twr", "try-with-res", "auto close"],
        ["nio", "NIO.2", "Path, Files"],
        ["fj", "Fork/Join", "parallelism"],
        ["indy", "invokedynamic", "for lambdas"],
      ],
      [
        ["coin", "twr", "language", "Project Coin brought string switch, diamond, binary literals and multi-catch."],
        ["twr", "nio", "resources", "try-with-resources pairs naturally with the new NIO.2 file API."],
        ["nio", "fj", "libraries", "java.util.concurrent gained Fork/Join, Phaser and TransferQueue."],
        ["fj", "indy", "JVM", "The JVM gained invokedynamic, which Java 8 later used for lambdas."],
      ],
    ],
    mistakes: [
      "Switching on a String that may be null (NullPointerException).",
      "Using multi-catch with related exception types (compile error).",
      "Placing underscores at the start or end of a number or next to the decimal point (compile error).",
    ],
    qa: [
      ["What were the main features of Java 7?", "Strings in switch, diamond operator, try-with-resources, multi-catch and precise rethrow, binary literals, underscores in numbers, NIO.2, Fork/Join, invokedynamic and Objects utilities."],
      ["What is the diamond operator?", "Writing new HashMap<>() so the compiler infers the type arguments from the declaration."],
      ["What is precise rethrow?", "Rethrowing a caught exception from a catch (Exception e) block while the method declares only the specific checked exceptions the try block can actually throw."],
    ],
    ex: [
      "Rewrite `Map<String, List<String>> m = new HashMap<String, List<String>>();` and `int million = 1000000;` in Java 7 style.",
      "`Map<String, List<String>> m = new HashMap<>();` and `int million = 1_000_000;`.",
    ],
  }),
]);
