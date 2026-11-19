import { lesson, section } from "../schema.js";

export default section("strings-and-wrappers", "Strings, Wrappers and Boxing", [
  lesson("String Immutability", {
    intro:
      "A Java `String` can never change after it is created. Every method that seems to modify a string, such as `toUpperCase`, `concat` or `replace`, returns a new string and leaves the original untouched. This lesson explains what immutability means for strings, how `String` is made immutable, and why the designers chose it.",
    topics: [
      [
        "What immutability means",
        "Once a `String` object is created, its characters cannot change. `s.toUpperCase()` returns a new object; unless you reassign (`s = s.toUpperCase()`), `s` still refers to the old text. Reassigning the variable does not modify the object either; it just points the variable at a different object.",
      ],
      [
        "How String is made immutable",
        "The class is `final`, so no subclass can add mutating behaviour. Its internal value array is `private final` and never exposed; methods that return arrays (`toCharArray`, `getBytes`) return copies. No method modifies the array after construction. Since Java 9 the internal storage is a compact `byte[]` with a coder flag (Latin-1 or UTF-16).",
      ],
      [
        "Why strings are immutable: string pool",
        "Because literals are shared through the string pool, many variables can point to the same `\"admin\"` object. If strings were mutable, changing one would change all of them.",
      ],
      [
        "Why strings are immutable: security, threads and hashing",
        "Strings hold file paths, URLs, class names and credentials passed to sensitive APIs; immutability prevents them from being changed after validation. Immutable objects are automatically thread-safe. And because the content never changes, `String` caches its hash code, making it a fast and safe `HashMap` key.",
      ],
      [
        "Cost of immutability",
        "Building a string in a loop with `+=` creates a new object each time, which is slow for large loops; use `StringBuilder` instead. Passwords are better held in a `char[]` that you can clear, because a `String` stays in memory until garbage collected.",
      ],
    ],
    code: String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        String original = "java";
        String upper = original.toUpperCase();
        original.concat(" rocks");                        // result ignored: original unchanged
        System.out.println("original: " + original + ", upper: " + upper);
        System.out.println("same object? " + (original == upper));

        String s = "hello";
        String alias = s;
        s = s + " world";                                  // new object; alias keeps the old one
        System.out.println("s: " + s + ", alias: " + alias);

        char[] chars = alias.toCharArray();               // a copy
        chars[0] = 'J';
        System.out.println("modified copy: " + new String(chars) + ", alias still: " + alias);

        String a = "admin", b = "admin";
        System.out.println("pooled literals share one object: " + (a == b));

        Map<String, Integer> roles = new HashMap<>();
        String key = "manager";
        roles.put(key, 3);
        key = key.toUpperCase();                           // cannot corrupt the map's key
        System.out.println("lookup still works: " + roles.get("manager") + ", hash stable: "
                + ("manager".hashCode() == "manager".hashCode()));

        System.out.println("String is final: " + java.lang.reflect.Modifier.isFinal(String.class.getModifiers()));
    }
}`,
    walk:
      "`toUpperCase` and `concat` return new strings; because the `concat` result is ignored, `original` is still \"java\" and is a different object from `upper`. Reassigning `s` makes it point to a new string while `alias` keeps the old one.\n\n`toCharArray` returns a copy, so changing it cannot affect the string. Two equal literals share one pooled object. The map key cannot be changed behind the map's back, because \"modifying\" a string only creates a new one, and the hash code is stable. Reflection confirms `String` is final.",
    anim: [
      "Modifying creates a new String",
      [
        ["var", "s", "variable"],
        ["old", "\"hello\"", "object 1"],
        ["alias", "alias", "variable"],
        ["op", "s + \" world\"", "concat"],
        ["new", "\"hello world\"", "object 2"],
      ],
      [
        ["var", "old", "points", "s refers to the String object \"hello\"."],
        ["alias", "old", "points", "alias = s copies the reference; both point to the same object."],
        ["op", "new", "creates", "Concatenation never edits \"hello\"; it builds a brand-new String."],
        ["var", "new", "reassign", "s now points to the new object, while alias still sees \"hello\"."],
      ],
    ],
    mistakes: [
      "Calling `s.trim()` or `s.replace(...)` without assigning the result and expecting `s` to change.",
      "Concatenating in large loops with `+=` instead of `StringBuilder`.",
    ],
    qa: [
      ["Why is String immutable in Java?", "To make the string pool safe, for security of values passed to sensitive APIs, for thread safety, and so the hash code can be cached for fast map lookups."],
      ["How is String made immutable?", "The class is final, its value array is private and final, no method changes it, and arrays returned to callers are copies."],
      ["Does `s = s + \"x\"` modify the string?", "No. It creates a new String and points `s` to it; the old object is unchanged."],
    ],
    ex: [
      "Write your own immutable class `Name` that wraps a `String` and offers `withSuffix(String)` returning a new `Name`. What rules must you follow?",
      "Make the class final, the field private final, set it only in the constructor, provide no setters, and have `withSuffix` return `new Name(value + suffix)`.",
    ],
  }),

  lesson("String Pool and Constant Pool", {
    intro:
      "To save memory, the JVM keeps one shared copy of each string literal in a special area called the string pool (or literal pool). Separately, every class file has a constant pool that stores its literals and symbolic references. The two are often confused. This lesson explains the string pool, `new String` versus literals, `intern()`, compile-time concatenation and the difference between the constant pool and the string pool.",
    topics: [
      [
        "The string pool (literal pool)",
        "When code uses a literal such as `\"java\"`, the JVM looks it up in the string pool. If it exists, the existing object is reused; if not, it is added. So `String a = \"java\"; String b = \"java\";` makes `a == b` true. Since Java 7 the pool lives in the main heap (not PermGen), so pooled strings can be garbage collected.",
      ],
      [
        "new String(\"java\")",
        "`new` always creates a new object on the heap, even if the same text is pooled. `new String(\"java\")` can create up to two objects: the pooled literal (if not already there) and the new heap copy. Hence `new String(\"java\") == \"java\"` is false.",
      ],
      [
        "intern()",
        "`s.intern()` returns the pooled instance with the same content, adding it to the pool if needed. After interning, `==` comparison works, but `equals` is still the right tool for content comparison.",
      ],
      [
        "Compile-time vs runtime concatenation",
        "`\"ja\" + \"va\"` and concatenation of `final` constants are computed by the compiler, so the result is a pooled literal. Concatenation involving non-final variables happens at runtime and creates a new, unpooled object.",
      ],
      [
        "Constant pool vs string pool",
        "The constant pool is per class: a table inside each `.class` file (loaded as the runtime constant pool in Metaspace) holding numeric and string literals, class and method names and other symbolic references. The string pool is a single, JVM-wide table of `String` objects on the heap. When a class's constant-pool string entry is first used, the JVM resolves it to the string pool's object. In short: constant pool = per-class symbols and literals; string pool = global cache of String objects.",
      ],
    ],
    code: String.raw`public class Main {
    static final String PREFIX = "ja";           // compile-time constant

    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        String d = c.intern();

        System.out.println("a == b (both literals):       " + (a == b));
        System.out.println("a == c (literal vs new):      " + (a == c));
        System.out.println("a.equals(c):                  " + a.equals(c));
        System.out.println("a == c.intern():              " + (a == d));

        String e = "ja" + "va";                    // folded by javac
        String f = PREFIX + "va";                  // final constant: also folded
        String part = "ja";
        String g = part + "va";                    // runtime concatenation
        System.out.println("\"ja\" + \"va\" == a:           " + (e == a));
        System.out.println("FINAL + \"va\" == a:          " + (f == a));
        System.out.println("variable + \"va\" == a:       " + (g == a));
        System.out.println("(variable + \"va\").intern() == a: " + (g.intern() == a));

        String built = new StringBuilder("ja").append("va").toString();
        System.out.println("StringBuilder result == a:  " + (built == a));
        System.out.println("identity hash same for a and b: " + (System.identityHashCode(a) == System.identityHashCode(b)));
    }
}`,
    walk:
      "`a` and `b` are the same pooled object, while `new String` creates a separate heap object `c` with equal content, so `==` is false and `equals` is true. `c.intern()` returns the pooled instance, which is `a`.\n\n`\"ja\" + \"va\"` and `PREFIX + \"va\"` are computed at compile time into the literal \"java\", so they are the pooled object too. Concatenating with a non-final variable or using a `StringBuilder` happens at runtime and creates a new object, unless you intern it.",
    anim: [
      "Literals share the pool, new does not",
      [
        ["a", "a = \"java\"", "literal"],
        ["b", "b = \"java\"", "literal"],
        ["pool", "String pool", "\"java\""],
        ["c", "c = new String", "heap copy"],
        ["heap", "Heap object", "\"java\" #2"],
      ],
      [
        ["a", "pool", "lookup", "The first literal \"java\" is added to the string pool and a points to it."],
        ["b", "pool", "reuse", "The second literal finds the existing pooled object; a == b is true."],
        ["c", "heap", "new", "new String always allocates a separate object outside the pool."],
        ["heap", "pool", "intern()", "c.intern() looks up the pool and returns the original pooled object."],
      ],
    ],
    mistakes: [
      "Comparing strings with `==` because it \"worked\" with literals; runtime-built strings break it.",
      "Calling `intern()` on huge numbers of unique strings, which bloats the pool.",
    ],
    qa: [
      ["What is the string pool?", "A JVM-wide cache of String objects on the heap where literals are stored once and shared."],
      ["How many objects does `new String(\"abc\")` create?", "Up to two: the pooled literal \"abc\" (if not already pooled) and a new heap String."],
      ["What is the difference between the constant pool and the string pool?", "The constant pool is a per-class table of literals and symbolic references from the class file; the string pool is one global table of String objects, which constant-pool string entries resolve to."],
      ["Where is the string pool located?", "In the heap since Java 7 (it was in PermGen before)."],
    ],
    ex: [
      "Predict: `String x = \"Hello\"; String y = \"Hel\" + \"lo\"; String z = \"Hel\"; String w = z + \"lo\";` Which of `x == y`, `x == w`, `x == w.intern()` are true?",
      "`x == y` is true (compile-time folding), `x == w` is false (runtime concatenation), `x == w.intern()` is true (intern returns the pooled \"Hello\").",
    ],
  }),

  lesson("String vs StringBuffer vs StringBuilder", {
    intro:
      "Java has three main classes for text: immutable `String`, and mutable `StringBuffer` and `StringBuilder`. Choosing the right one affects correctness under concurrency and performance in loops. This lesson compares mutability, thread safety, performance and API, and shows when to use each.",
    topics: [
      [
        "String",
        "Immutable and therefore thread-safe; every modification creates a new object. Best for values that do not change, map keys and constants. The `+` operator is compiled to efficient code for single expressions (since Java 9 via `invokedynamic`), but `+=` inside a loop still creates a new string on every iteration.",
      ],
      [
        "StringBuffer",
        "Mutable, with methods such as `append`, `insert`, `delete`, `reverse` and `setCharAt` that change the same object. All public methods are `synchronized`, so it is thread-safe for individual calls but slower. It exists since Java 1.0.",
      ],
      [
        "StringBuilder",
        "Added in Java 5 with the same API as StringBuffer but without synchronisation, so it is faster. It is not thread-safe, which is fine for the usual case of building a string inside one method. Use it for loops and complex string construction.",
      ],
      [
        "Capacity",
        "Both builders keep an internal array with spare capacity (16 by default plus the initial string length). When it fills, they grow to about double. Pass an expected size to the constructor (`new StringBuilder(1000)`) to avoid repeated copying.",
      ],
      [
        "Differences in one place",
        "Mutability: String no, the others yes. Thread safety: String (immutable) and StringBuffer (synchronized) yes, StringBuilder no. Speed for repeated modification: StringBuilder fastest, then StringBuffer, then String. `equals`: String compares content; the builders do not override `equals`, so compare `sb.toString()` or use `compareTo` (Java 11).",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        String s = "Java";
        s.concat(" 21");                              // new object discarded
        System.out.println("String after concat (ignored): " + s);

        StringBuilder sb = new StringBuilder("Java");
        sb.append(" 21").insert(0, "Hello ").replace(0, 5, "Hi").reverse().reverse();
        System.out.println("StringBuilder modified in place: " + sb + ", length " + sb.length());
        sb.setCharAt(0, 'h');
        sb.deleteCharAt(sb.length() - 1);
        System.out.println("after setCharAt/deleteCharAt: " + sb);

        StringBuffer buffer = new StringBuffer();
        System.out.println("StringBuffer default capacity: " + buffer.capacity());
        buffer.append("x".repeat(17));
        System.out.println("capacity after 17 chars: " + buffer.capacity());

        Runnable task = () -> { for (int i = 0; i < 1000; i++) buffer.append('a'); };
        Thread t1 = new Thread(task), t2 = new Thread(task);
        t1.start(); t2.start();
        try { t1.join(); t2.join(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        System.out.println("StringBuffer length after 2 threads x 1000 appends (+17): " + buffer.length());

        int n = 20_000;
        long start = System.nanoTime();
        String slow = "";
        for (int i = 0; i < n; i++) slow += "x";
        long stringTime = System.nanoTime() - start;
        start = System.nanoTime();
        StringBuilder fast = new StringBuilder(n);
        for (int i = 0; i < n; i++) fast.append("x");
        long builderTime = System.nanoTime() - start;
        System.out.println("same result: " + slow.equals(fast.toString()) + ", StringBuilder faster: " + (builderTime < stringTime));

        System.out.println("builders do not override equals: " + new StringBuilder("a").equals(new StringBuilder("a"))
                + ", compareTo == 0: " + (new StringBuilder("a").compareTo(new StringBuilder("a")) == 0));
    }
}`,
    varies: true,
    walk:
      "The ignored `concat` shows `String` cannot change. The `StringBuilder` is changed in place by a chain of `append`, `insert`, `replace` and two `reverse` calls (which cancel out), then `setCharAt` and `deleteCharAt`.\n\n`StringBuffer` starts with capacity 16 and grows to 34 (16 * 2 + 2) once 17 characters are added. Two threads append 1,000 characters each; because every `StringBuffer` method is synchronized, no append is lost and the length is exactly 2,017. The timing comparison shows `+=` in a loop is far slower than a pre-sized builder, and the last line shows builders compare by identity with `equals` but by content with `compareTo`.",
    anim: [
      "+= in a loop vs StringBuilder",
      [
        ["loop", "loop i", "20,000 times"],
        ["str", "slow += \"x\"", "copy every time"],
        ["garbage", "garbage", "old strings"],
        ["sb", "sb.append(\"x\")", "same buffer"],
        ["res", "toString()", "one copy"],
      ],
      [
        ["loop", "str", "String", "Each += copies the whole existing text into a new String object."],
        ["str", "garbage", "discard", "The previous string becomes garbage: O(n squared) copying in total."],
        ["loop", "sb", "builder", "append writes into the builder's existing array, growing it rarely."],
        ["sb", "res", "finish", "One final toString() copies the characters once into a String."],
      ],
    ],
    mistakes: [
      "Using StringBuffer by default; in single-threaded code StringBuilder is the right choice.",
      "Sharing one StringBuilder between threads, which can corrupt its content.",
      "Comparing builders with `equals`, which checks identity.",
    ],
    qa: [
      ["What is the difference between String, StringBuffer and StringBuilder?", "String is immutable; StringBuffer is mutable and synchronized (thread-safe, slower); StringBuilder is mutable and unsynchronized (faster, not thread-safe)."],
      ["When should you use StringBuilder?", "When building or modifying a string repeatedly in a single thread, especially in loops."],
      ["What is the default capacity of a StringBuilder?", "16 characters, or 16 plus the length of the initial string; it grows to about double plus two when full."],
    ],
    ex: [
      "Reverse each word of \"Java is fun\" in place using a single StringBuilder, keeping word order (result \"avaJ si nuf\").",
      "Split on spaces, and for each word `sb.append(new StringBuilder(word).reverse()).append(' ')`, then trim. Result: `avaJ si nuf`.",
    ],
  }),

  lesson("equals() vs == Operator", {
    intro:
      "`==` and `equals()` both answer \"are these the same?\" but they mean different things. `==` compares primitive values or object identity; `equals()` compares logical content as defined by the class. Mixing them up is one of the most common Java bugs. This lesson explains both, how classes override `equals`, and the special cases of strings, wrappers, enums and null.",
    topics: [
      [
        "== with primitives and references",
        "For primitives, `==` compares values (`5 == 5.0` is true after promotion). For references, `==` is true only when both refer to the very same object (identity). It never calls a method and works with null.",
      ],
      [
        "equals()",
        "`equals(Object)` is defined in `Object`, where it also checks identity. Classes override it to compare content: `String`, wrappers, `List`, `Set`, `Map`, `LocalDate`, records and your own value classes. Calling `equals` on a null reference throws `NullPointerException`; `Objects.equals(a, b)` is null-safe.",
      ],
      [
        "Strings and wrappers",
        "Two strings with the same text may or may not be the same object (pooling), so always use `equals` or `equalsIgnoreCase`. Wrapper objects compared with `==` can surprise you because of caching: `Integer` values from -128 to 127 are cached, larger ones usually are not.",
      ],
      [
        "Enums and singletons",
        "Enum constants are singletons, so `==` is correct and preferred for them: it is null-safe and checked at compile time.",
      ],
      [
        "Rule of thumb",
        "Use `==` for primitives, enums and deliberate identity checks; use `equals` (or `Objects.equals`) for everything else. When you override `equals`, also override `hashCode` (covered in its own lesson).",
      ],
    ],
    code: String.raw`import java.util.List;
import java.util.Objects;

public class Main {
    enum Status { ACTIVE, BLOCKED }

    static class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
    }

    record PointRecord(int x, int y) { }      // records generate equals and hashCode

    public static void main(String[] args) {
        int i = 5; double d = 5.0;
        System.out.println("5 == 5.0: " + (i == d));

        String s1 = "hello", s2 = "hello", s3 = new String("hello");
        System.out.println("s1 == s2: " + (s1 == s2) + ", s1 == s3: " + (s1 == s3) + ", s1.equals(s3): " + s1.equals(s3));
        System.out.println("equalsIgnoreCase: " + "Hello".equalsIgnoreCase(s1));

        Integer small1 = 100, small2 = 100, big1 = 1000, big2 = 1000;
        System.out.println("Integer 100 == 100: " + (small1 == small2) + ", Integer 1000 == 1000: " + (big1 == big2)
                + ", 1000 equals: " + big1.equals(big2));

        Point p1 = new Point(1, 2), p2 = new Point(1, 2);
        System.out.println("Point without equals override: " + p1.equals(p2));
        System.out.println("record with generated equals: " + new PointRecord(1, 2).equals(new PointRecord(1, 2)));
        System.out.println("List equals compares elements: " + List.of(1, 2).equals(List.of(1, 2)));

        Status st = Status.ACTIVE;
        System.out.println("enum ==: " + (st == Status.ACTIVE));

        String maybeNull = null;
        System.out.println("Objects.equals(null, \"x\"): " + Objects.equals(maybeNull, "x")
                + ", \"x\".equals(null): " + "x".equals(maybeNull));
        try {
            maybeNull.equals("x");
        } catch (NullPointerException e) {
            System.out.println("null.equals(...) throws NullPointerException");
        }
    }
}`,
    walk:
      "The int and double compare by value after promotion. Two string literals are the same pooled object, but the `new String` is not, even though `equals` says the contents match.\n\n`Integer` 100 comes from the cache, so `==` is true, but 1000 creates two objects, so `==` is false while `equals` is true. `Point` does not override `equals`, so it falls back to identity; the record and `List` compare content. Enums compare safely with `==`. `Objects.equals` and calling `equals` on a known non-null value avoid the `NullPointerException` thrown by `null.equals(...)`.",
    anim: [
      "Identity vs content",
      [
        ["s1", "s1", "\"hello\" literal"],
        ["s3", "s3", "new String"],
        ["o1", "pooled object", "\"hello\""],
        ["o2", "heap object", "\"hello\""],
        ["eq", "equals()", "compare chars"],
      ],
      [
        ["s1", "o1", "points", "s1 refers to the pooled \"hello\" object."],
        ["s3", "o2", "points", "s3 refers to a different object holding the same characters."],
        ["o1", "o2", "== false", "== compares references: different objects, so the result is false."],
        ["eq", "o2", "same text", "equals() compares the characters one by one and returns true."],
      ],
    ],
    mistakes: [
      "Comparing strings or wrapper objects with `==`.",
      "Calling `input.equals(\"yes\")` when `input` may be null; write `\"yes\".equals(input)`.",
      "Overriding `equals(Point other)` instead of `equals(Object other)`, which overloads rather than overrides.",
    ],
    qa: [
      ["What is the difference between == and equals()?", "`==` compares primitive values or reference identity; `equals()` compares logical equality as defined by the class."],
      ["Why does `Integer a = 127, b = 127; a == b` return true but 128 returns false?", "Integer.valueOf caches -128 to 127, so 127 gives the same object while 128 creates new objects."],
      ["Should enums be compared with == or equals?", "With `==`: enum constants are singletons, and `==` is null-safe and type-checked."],
    ],
    ex: [
      "Override `equals` in `Point` correctly so `p1.equals(p2)` is true.",
      "`@Override public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof Point p)) return false; return x == p.x && y == p.y; }` plus a matching `hashCode()` such as `Objects.hash(x, y)`.",
    ],
  }),

  lesson("Autoboxing and Unboxing", {
    intro:
      "Autoboxing is the automatic conversion of a primitive into its wrapper object (`int` to `Integer`), and unboxing is the reverse. Introduced in Java 5, it lets you put primitives into collections and mix the two freely. This lesson explains how it works, where it happens, its interaction with widening and varargs, its pitfalls, and the Eclipse setting that highlights it.",
    topics: [
      [
        "What autoboxing and unboxing are",
        "`Integer x = 5;` is compiled to `Integer x = Integer.valueOf(5);` (boxing). `int y = x;` becomes `int y = x.intValue();` (unboxing). Every primitive has a wrapper: `byte`/Byte, `short`/Short, `int`/Integer, `long`/Long, `float`/Float, `double`/Double, `char`/Character, `boolean`/Boolean.",
      ],
      [
        "Where it happens",
        "Assignments, method arguments and return values, collections (`list.add(5)`), arithmetic and comparison on wrappers (`a + b` unboxes both), conditions (`if (flagObj)`), and switch statements on wrappers.",
      ],
      [
        "Boxing with widening and varargs",
        "Java can widen then box only in limited ways: an `int` can be boxed to `Integer` and then widened to `Number` or `Object`, but it cannot be widened to `long` and then boxed to `Long` (`Long l = 5;` fails, write `5L`). In overload resolution, widening is preferred over boxing, and boxing over varargs.",
      ],
      [
        "Pitfalls",
        "Unboxing `null` throws `NullPointerException` (`int n = map.get(\"missing\");`). Comparing wrappers with `==` checks identity. Boxing in hot loops (`Long sum = 0L; sum += i;`) creates millions of objects. `list.remove(1)` on a `List<Integer>` removes by index, not the value 1.",
      ],
      [
        "Eclipse boxing setting",
        "Eclipse can flag boxing and unboxing so you notice hidden allocations: Window, Preferences, Java, Compiler, Errors/Warnings, Potential programming problems, \"Boxing and unboxing conversions\", set to Warning or Error. The editor can also highlight them under Java, Editor, Syntax Coloring, \"Auto(un)boxed expressions\".",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    static void show(Object o) { System.out.println("  show(Object): " + o + " is " + o.getClass().getSimpleName()); }
    static int twice(Integer value) { return value * 2; }          // unboxed for arithmetic

    public static void main(String[] args) {
        Integer boxed = 42;                // Integer.valueOf(42)
        int unboxed = boxed;               // boxed.intValue()
        System.out.println("boxed=" + boxed + " unboxed=" + unboxed);

        List<Integer> numbers = new ArrayList<>();
        for (int i = 1; i <= 5; i++) numbers.add(i * 10);   // autoboxing into the list
        int sum = 0;
        for (int n : numbers) sum += n;                     // unboxing out of it
        System.out.println("list " + numbers + " sum " + sum);

        System.out.println("twice(21) = " + twice(21));
        show(7);                            // int -> Integer -> Object
        show('c');                          // char -> Character
        // Long wrong = 5;                  // compile error: int cannot widen-then-box to Long
        Long right = 5L;
        System.out.println("Long needs 5L: " + right);

        numbers.remove(1);                  // removes INDEX 1 (value 20)
        numbers.remove(Integer.valueOf(50)); // removes the VALUE 50
        System.out.println("after removes: " + numbers);

        Map<String, Integer> stock = new HashMap<>();
        stock.put("pen", 12);
        try {
            int pencils = stock.get("pencil");   // null unboxed
        } catch (NullPointerException e) {
            System.out.println("unboxing null -> NullPointerException");
        }
        int pencils = stock.getOrDefault("pencil", 0);
        System.out.println("safe default: " + pencils);

        Boolean flag = Boolean.TRUE;
        if (flag) System.out.println("Boolean unboxed in if condition");
        Character grade = 'A';
        switch (grade) { case 'A' -> System.out.println("switch unboxes Character: top grade"); default -> { } }
    }
}`,
    walk:
      "The first lines box 42 into an `Integer` and unbox it again. The loop boxes each int into the list, and the enhanced for unboxes them to compute the sum of 150. `twice` receives an `Integer` and unboxes it for the multiplication.\n\n`show(7)` boxes the int to `Integer`, then widens it to `Object`; `show('c')` produces a `Character`. `numbers.remove(1)` removes the element at index 1, not the value 1, so you must box explicitly to remove by value. Unboxing a missing map value throws `NullPointerException`, and `getOrDefault` avoids it. `if` and `switch` unbox `Boolean` and `Character` automatically.",
    anim: [
      "Boxing and unboxing",
      [
        ["prim", "int 42", "primitive"],
        ["valueOf", "Integer.valueOf", "boxing"],
        ["obj", "Integer object", "heap / cache"],
        ["intValue", "intValue()", "unboxing"],
        ["back", "int 42", "primitive again"],
      ],
      [
        ["prim", "valueOf", "Integer x = 42", "Assigning a primitive to a wrapper compiles to Integer.valueOf(42)."],
        ["valueOf", "obj", "object", "valueOf returns an Integer object (cached for -128..127)."],
        ["obj", "intValue", "int y = x", "Assigning back to int compiles to x.intValue()."],
        ["intValue", "back", "value", "If x were null, intValue() would throw NullPointerException here."],
      ],
    ],
    mistakes: [
      "Unboxing a possibly-null wrapper, for example a missing map value.",
      "Using `List.remove(int)` when you meant to remove a value.",
      "Using wrapper types for counters in loops, which creates garbage.",
    ],
    qa: [
      ["What is autoboxing?", "Automatic conversion of a primitive to its wrapper object by the compiler, using `valueOf` (e.g. int to Integer)."],
      ["What happens when you unbox null?", "A `NullPointerException` is thrown, because the compiler inserts a call such as `intValue()`."],
      ["Why does `Long l = 5;` not compile?", "5 is an int; Java will not widen it to long and then box it to Long. Use `5L`."],
    ],
    ex: [
      "What does this print and why? `Integer a = 1000, b = 1000; System.out.println(a <= b && a >= b && a != b);`",
      "It prints `true`. `<=` and `>=` unbox and compare values (equal), but `!=` compares references, and 1000 is outside the Integer cache, so the two objects differ.",
    ],
  }),

  lesson("Integer Cache (-128 to 127)", {
    intro:
      "`Integer.valueOf` does not always create a new object: for values from -128 to 127 it returns a cached instance. That is why `Integer a = 127, b = 127; a == b` is true but the same code with 128 is false. This lesson explains the Integer cache, the caches of other wrappers, how to resize it, and why you should never rely on it.",
    topics: [
      [
        "How the cache works",
        "`Integer` has a private static nested class `IntegerCache` holding an array of `Integer` objects for -128 to 127, created when the class initialises. `Integer.valueOf(int)`, which autoboxing calls, returns an element of that array when the value is in range, and `new Integer(...)` otherwise.",
      ],
      [
        "Other wrapper caches",
        "`Byte`, `Short` and `Long` cache -128 to 127, `Character` caches 0 to 127, and `Boolean` has only the two constants `TRUE` and `FALSE`. `Float` and `Double` have no cache.",
      ],
      [
        "Changing the upper bound",
        "Only the Integer cache's upper limit is configurable: `-XX:AutoBoxCacheMax=1000` or the system property `java.lang.Integer.IntegerCache.high`. The lower bound is always -128.",
      ],
      [
        "Why the cache exists and the lesson to learn",
        "Small numbers are used constantly, so caching them saves allocations. But the behaviour makes `==` on wrappers unpredictable: code that works with small test values breaks with real data. Always compare wrapper values with `equals()` or unbox them first. The constructors `new Integer(5)` are deprecated for removal precisely because they bypass the cache.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println("127 == 127: " + (a == b) + "   (cached)");
        System.out.println("128 == 128: " + (c == d) + "  (new objects)");
        System.out.println("128 equals: " + c.equals(d));
        System.out.println("-128 == -128: " + (Integer.valueOf(-128) == Integer.valueOf(-128))
                + ", -129 == -129: " + (Integer.valueOf(-129) == Integer.valueOf(-129)));

        int cachedHits = 0;
        for (int i = -200; i <= 200; i++) {
            if (Integer.valueOf(i) == Integer.valueOf(i)) cachedHits++;
        }
        System.out.println("values in [-200, 200] returning the same object: " + cachedHits);

        System.out.println("Long 100: " + (Long.valueOf(100) == Long.valueOf(100))
                + ", Character 'a': " + (Character.valueOf('a') == Character.valueOf('a'))
                + ", Boolean: " + (Boolean.valueOf(true) == Boolean.TRUE)
                + ", Double 1.0: " + (Double.valueOf(1.0) == Double.valueOf(1.0)));

        // The right way, whatever the value:
        System.out.println("safe comparison of 128: " + (c.intValue() == d.intValue()) + " / " + c.equals(d));
        String high = System.getProperty("java.lang.Integer.IntegerCache.high");
        System.out.println("custom cache high set: " + (high != null));
    }
}`,
    walk:
      "Boxing 127 twice returns the same cached object, so `==` is true; boxing 128 creates two different objects, so `==` is false while `equals` is true. The bounds -128 and -129 show the lower edge.\n\nThe loop counts how many values between -200 and 200 return the same object, which is exactly 256 (-128 to 127). `Long` and `Character` cache small values, `Boolean.valueOf` returns the shared constants, and `Double` has no cache. Comparing unboxed values or using `equals` is always correct. Run with `-XX:AutoBoxCacheMax=1000` to see the count rise.",
    anim: [
      "Integer.valueOf and the cache",
      [
        ["box", "valueOf(n)", "autoboxing"],
        ["range", "-128..127 ?", "range check"],
        ["cache", "IntegerCache", "256 objects"],
        ["new", "new Integer(n)", "fresh object"],
        ["ref", "reference", "returned"],
      ],
      [
        ["box", "range", "check", "valueOf first checks whether n is between -128 and the cache high (127)."],
        ["range", "cache", "127", "For 127 it returns the preallocated object, so every 127 is the same object."],
        ["range", "new", "128", "For 128 it allocates a new Integer each time."],
        ["new", "ref", "==", "Two boxings of 128 give two different references, so == is false."],
      ],
    ],
    mistakes: [
      "Comparing `Integer` IDs or amounts with `==`; it works in tests with small numbers and fails in production.",
      "Assuming `Double` or `Float` are cached.",
    ],
    qa: [
      ["What is the Integer cache range?", "-128 to 127 by default; the upper bound can be raised with `-XX:AutoBoxCacheMax`."],
      ["Which wrapper classes have caches?", "Byte, Short, Integer and Long (-128 to 127), Character (0 to 127) and Boolean (TRUE/FALSE). Float and Double do not."],
      ["Does `new Integer(10) == Integer.valueOf(10)`?", "No. The constructor always creates a new object (and is deprecated); valueOf returns the cached one."],
    ],
    ex: [
      "Write a method `boolean sameAmount(Integer a, Integer b)` that is correct for all values including nulls.",
      "`return Objects.equals(a, b);` handles nulls and compares values. `a.equals(b)` works when a is non-null; `a == b` is wrong outside the cache range.",
    ],
  }),

  lesson("Primitives vs Wrapper Classes", {
    intro:
      "If wrappers can do everything primitives can and more, why does Java still have primitives? Because they are much cheaper. Wrappers exist because many APIs need objects. This lesson compares primitives and wrapper classes, explains why primitives are still used, when to choose wrappers, and the utility methods wrappers provide.",
    topics: [
      [
        "Why primitives are still used",
        "A primitive is just its bits (an `int` is 4 bytes) stored inline in a stack frame, array or object. An `Integer` is a heap object with a header (12 to 16 bytes) plus the value, reached through a reference, and it must be garbage collected. Primitive arithmetic is direct; wrapper arithmetic unboxes and reboxes. An `int[1_000_000]` is about 4 MB, while an `Integer[]` with a million distinct objects is roughly 20 MB. Primitives also cannot be null, which removes a class of bugs.",
      ],
      [
        "When to use wrapper classes",
        "Generic collections and type parameters (`List<Integer>`, `Map<String, Long>`) because generics need objects. When a value can be absent (`null` meaning \"unknown\", for example a nullable database column mapped by JPA). When an API expects an `Object`. And when you need the wrapper's utility methods.",
      ],
      [
        "Useful wrapper utilities",
        "Parsing: `Integer.parseInt(\"42\")`, `Double.parseDouble`, `Boolean.parseBoolean`. Conversions: `Integer.toBinaryString`, `toHexString`, `Integer.valueOf(\"ff\", 16)`. Constants: `MIN_VALUE`, `MAX_VALUE`, `SIZE`, `BYTES`. Helpers: `Integer.compare`, `Integer.sum`, `Integer.max`, `Character.isDigit`, `Character.isLetter`, `Double.isNaN`.",
      ],
      [
        "Primitive-specialised APIs",
        "To get both speed and an API, Java offers `IntStream`, `LongStream`, `DoubleStream`, `OptionalInt` and functional interfaces such as `IntPredicate`, which avoid boxing.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        int size = 2_000_000;

        long start = System.nanoTime();
        long primitiveSum = 0;
        for (int i = 0; i < size; i++) primitiveSum += i;
        long primitiveTime = System.nanoTime() - start;

        start = System.nanoTime();
        Long boxedSum = 0L;                             // boxed accumulator: new Long each step
        for (int i = 0; i < size; i++) boxedSum += i;
        long boxedTime = System.nanoTime() - start;

        System.out.println("same sum: " + (primitiveSum == boxedSum) + ", primitive faster: " + (primitiveTime < boxedTime));

        System.out.println("int is " + Integer.BYTES + " bytes; an Integer is an object with a header plus those bytes");

        List<Integer> scores = new ArrayList<>(List.of(70, 85));
        scores.add(null);                               // wrapper can represent "missing"
        long missing = scores.stream().filter(s -> s == null).count();
        System.out.println("scores with a missing value: " + scores + ", missing count " + missing);

        System.out.println("parseInt(\"123\") + 1 = " + (Integer.parseInt("123") + 1));
        System.out.println("hex ff = " + Integer.valueOf("ff", 16) + ", binary of 10 = " + Integer.toBinaryString(10));
        System.out.println("Integer.compare(3, 9) = " + Integer.compare(3, 9) + ", Character.isDigit('7') = " + Character.isDigit('7'));
        System.out.println("Integer range: " + Integer.MIN_VALUE + " .. " + Integer.MAX_VALUE);

        int total = IntStream.rangeClosed(1, 100).sum();   // primitive stream: no boxing
        System.out.println("IntStream sum 1..100 = " + total);
    }
}`,
    varies: true,
    walk:
      "The two loops compute the same sum. The primitive version adds into a `long` register; the boxed version unboxes `boxedSum`, adds, and boxes a new `Long` on every iteration, creating two million objects, so it is clearly slower.\n\nA `List<Integer>` can hold `null` to mean \"missing\", which a primitive cannot. The wrapper classes provide parsing, base conversion, comparison and range constants. `IntStream` gives a stream API without boxing.",
    anim: [
      "int vs Integer in memory",
      [
        ["frame", "Stack frame", "local vars"],
        ["prim", "int x = 5", "4 bytes inline"],
        ["ref", "Integer y", "reference"],
        ["obj", "Integer object", "header + 5"],
        ["gc", "GC", "must collect"],
      ],
      [
        ["frame", "prim", "inline", "A primitive lives directly in the frame: no object, no reference."],
        ["frame", "ref", "reference", "A wrapper variable holds only a reference..."],
        ["ref", "obj", "points", "...to a heap object with its own header around the value."],
        ["obj", "gc", "garbage", "Short-lived wrapper objects become garbage the collector must clean up."],
      ],
    ],
    mistakes: [
      "Using `Long`/`Integer` as loop counters or accumulators.",
      "Using a wrapper where null has no meaning, then hitting `NullPointerException` on unboxing.",
    ],
    qa: [
      ["Why does Java still have primitive types?", "For performance and memory: they are stored inline without object headers or garbage collection, and arithmetic on them is direct."],
      ["When must you use wrapper classes?", "With generics and collections, when a value can be null, and when an API requires objects."],
      ["How do you convert a String to an int?", "`Integer.parseInt(s)` returns an int; `Integer.valueOf(s)` returns an Integer."],
    ],
    ex: [
      "A JPA entity has `private int discount;` mapped to a nullable column. What goes wrong when the column is NULL, and how do you fix it?",
      "A null cannot be stored in an `int`, so loading fails or silently becomes 0 depending on the provider. Use `Integer discount` so null can represent \"no discount set\".",
    ],
  }),

  lesson("Overloading with Widening, Autoboxing and Varargs", {
    intro:
      "When several overloads could accept an argument, Java picks one in a fixed order: exact match, then widening, then boxing, then varargs. This rule, introduced with autoboxing in Java 5, keeps old code behaving the same. This lesson walks through each phase with examples and the combinations that do not compile.",
    topics: [
      [
        "Phase 1: exact match and widening",
        "The compiler first looks for overloads that accept the argument without boxing or varargs: an exact match, or a widening primitive conversion (byte to short to int to long to float to double, char to int) or a widening reference conversion (subclass to superclass). If one or more apply, it picks the most specific.",
      ],
      [
        "Phase 2: boxing and unboxing",
        "Only if phase 1 found nothing does the compiler consider boxing (int to Integer) and unboxing, possibly followed by widening of the reference (Integer to Number to Object).",
      ],
      [
        "Phase 3: varargs",
        "Only if phases 1 and 2 found nothing are varargs methods considered. Varargs is always the last resort.",
      ],
      [
        "Combinations that do not work",
        "Widening then boxing is not allowed: an `int` cannot become a `Long` (it would need int to long then boxing). Boxing then widening is allowed: an `int` can become an `Object` via `Integer`. Two equally specific overloads in the same phase make the call ambiguous, for example `f(Integer...)` and `f(int...)` called as `f(1)`.",
      ],
    ],
    code: String.raw`public class Main {
    static String m(long x) { return "long (widening)"; }
    static String m(Integer x) { return "Integer (boxing)"; }
    static String m(int... x) { return "int... (varargs)"; }

    static String n(Integer x) { return "Integer (boxing)"; }
    static String n(int... x) { return "int... (varargs)"; }

    static String o(Object x) { return "Object (boxing then widening)"; }
    static String o(long... x) { return "long... (varargs)"; }

    static String p(Long x) { return "Long"; }
    static String p(Object x) { return "Object"; }

    static String q(double x) { return "double (widening)"; }
    static String q(Character x) { return "Character (boxing)"; }

    public static void main(String[] args) {
        int i = 5;
        System.out.println("m(int)          -> " + m(i));          // phase 1 wins
        System.out.println("n(int)          -> " + n(i));          // phase 2 wins
        System.out.println("m()             -> " + m());           // only varargs fits
        System.out.println("o(int)          -> " + o(i));          // boxing+widening beats varargs
        System.out.println("p(int)          -> " + p(i));          // cannot widen then box to Long
        System.out.println("p(5L)           -> " + p(5L));
        System.out.println("q('c')          -> " + q('c'));         // char widens to double before boxing
        byte b = 1;
        System.out.println("m(byte)         -> " + m(b));          // byte widens to long
        Integer boxed = 7;
        System.out.println("m(Integer)      -> " + m(boxed));      // exact reference match
    }
}`,
    walk:
      "`m(i)` has three candidates; phase 1 already finds `m(long)` through widening, so boxing and varargs are never considered. `n(i)` has no phase-1 candidate, so boxing to `Integer` wins over varargs. `m()` with no arguments can only match varargs.\n\n`o(i)` boxes to `Integer` and widens to `Object` in phase 2, which beats varargs. `p(i)` cannot become a `Long` (that would be widening then boxing), so it becomes `Integer` and then `Object`. `q('c')` widens the char to double in phase 1 instead of boxing to `Character`. A `byte` widens to `long`, and an `Integer` argument matches `m(Integer)` exactly.",
    anim: [
      "Three phases of overload resolution",
      [
        ["arg", "argument int", "call m(i)"],
        ["p1", "Phase 1", "exact / widening"],
        ["p2", "Phase 2", "boxing"],
        ["p3", "Phase 3", "varargs"],
        ["pick", "most specific", "chosen"],
      ],
      [
        ["arg", "p1", "try", "javac tries overloads reachable without boxing or varargs: m(long) fits."],
        ["p1", "pick", "found", "Because phase 1 found a match, javac stops and picks m(long)."],
        ["p2", "pick", "if none", "Boxing overloads such as m(Integer) are tried only if phase 1 finds nothing."],
        ["p3", "pick", "last resort", "Varargs overloads are considered only when both earlier phases fail."],
      ],
    ],
    mistakes: [
      "Adding a new overload to a library and silently changing which method existing calls pick.",
      "Expecting `p(Long)` to accept an int literal.",
    ],
    qa: [
      ["What is the order of preference for overloaded methods?", "Exact match or widening first, then boxing/unboxing, then varargs."],
      ["Is widening preferred over boxing?", "Yes. `m(long)` beats `m(Integer)` for an int argument."],
      ["Can an int be passed to a method taking Long?", "No. Java does not widen and then box; an int can be boxed to Integer, then widened to Number or Object."],
    ],
    ex: [
      "Given only `void f(Object o)` and `void f(long... xs)`, which runs for `f(3)`? What about `f(3, 4)`?",
      "`f(3)` calls `f(Object)` (boxing then widening in phase 2 beats varargs). `f(3, 4)` can only match varargs, so `f(long...)` runs.",
    ],
  }),

  lesson("Checking Substrings: indexOf and contains", {
    intro:
      "Checking whether one string contains another is one of the most common string operations. Java offers `contains`, `indexOf`, `lastIndexOf`, `startsWith`, `endsWith` and `matches`. This lesson covers each, case-insensitive checks, counting occurrences, and the edge cases of empty strings and null.",
    topics: [
      [
        "contains()",
        "`s.contains(\"java\")` returns true if the sequence appears anywhere. It accepts any `CharSequence` and internally calls `indexOf(...) >= 0`. It is case-sensitive.",
      ],
      [
        "indexOf() and lastIndexOf()",
        "`indexOf(str)` returns the index of the first occurrence or -1; `indexOf(str, from)` starts searching at `from`, which is how you find every occurrence in a loop. `lastIndexOf` searches from the end. Both also accept a single `char` or code point.",
      ],
      [
        "startsWith, endsWith and regionMatches",
        "`startsWith(prefix)` and `endsWith(suffix)` check the ends. `regionMatches(ignoreCase, offset, other, otherOffset, len)` compares a region, optionally ignoring case.",
      ],
      [
        "Case-insensitive checks",
        "Convert both sides with `toLowerCase(Locale.ROOT)` (a fixed locale avoids surprises such as the Turkish dotless i), or use a regex with `Pattern.CASE_INSENSITIVE`.",
      ],
      [
        "Edge cases",
        "Every string contains the empty string, and `indexOf(\"\")` is 0. Calling these methods on null throws `NullPointerException`, and passing null as the argument does too.",
      ],
    ],
    code: String.raw`import java.util.Locale;
import java.util.regex.Pattern;

public class Main {
    static int countOccurrences(String text, String word) {
        int count = 0, from = 0;
        while ((from = text.indexOf(word, from)) != -1) {
            count++;
            from += word.length();
        }
        return count;
    }

    public static void main(String[] args) {
        String text = "Java is fun. I love Java because Java is portable.";

        System.out.println("contains \"Java\": " + text.contains("Java"));
        System.out.println("contains \"java\": " + text.contains("java") + " (case-sensitive)");
        System.out.println("indexOf \"Java\": " + text.indexOf("Java"));
        System.out.println("indexOf \"Java\" from 1: " + text.indexOf("Java", 1));
        System.out.println("lastIndexOf \"Java\": " + text.lastIndexOf("Java"));
        System.out.println("indexOf \"Python\": " + text.indexOf("Python"));
        System.out.println("indexOf char 'f': " + text.indexOf('f'));
        System.out.println("occurrences of \"Java\": " + countOccurrences(text, "Java"));

        System.out.println("startsWith \"Java\": " + text.startsWith("Java") + ", endsWith \".\": " + text.endsWith("."));
        String lower = text.toLowerCase(Locale.ROOT);
        System.out.println("case-insensitive contains \"JAVA\": " + lower.contains("JAVA".toLowerCase(Locale.ROOT)));
        System.out.println("regex case-insensitive: " + Pattern.compile("PORTABLE", Pattern.CASE_INSENSITIVE).matcher(text).find());
        System.out.println("regionMatches ignoring case: " + text.regionMatches(true, 0, "JAVA", 0, 4));

        System.out.println("contains empty string: " + text.contains("") + ", indexOf(\"\"): " + text.indexOf(""));
        try {
            text.contains(null);
        } catch (NullPointerException e) {
            System.out.println("contains(null) throws NullPointerException");
        }
    }
}`,
    walk:
      "`contains` finds \"Java\" but not \"java\", since it is case-sensitive. `indexOf` returns 0 for the first \"Java\", 20 when searching from index 1, and `lastIndexOf` returns 33; a missing word gives -1.\n\n`countOccurrences` repeatedly calls `indexOf(word, from)` and moves past each match, finding 3. Case-insensitive checks are done by lower-casing both sides with `Locale.ROOT`, with a case-insensitive regex, or with `regionMatches(true, ...)`. The empty string is found at index 0, and passing null throws.",
    anim: [
      "Counting matches with indexOf",
      [
        ["start", "from = 0", "start"],
        ["m1", "match at 0", "count 1"],
        ["m2", "match at 20", "count 2"],
        ["m3", "match at 33", "count 3"],
        ["end", "-1", "no more"],
      ],
      [
        ["start", "m1", "indexOf", "indexOf(\"Java\", 0) finds the first match at index 0; from moves to 4."],
        ["m1", "m2", "indexOf", "Searching from 4 finds the next \"Java\" at 20; from moves to 24."],
        ["m2", "m3", "indexOf", "Searching from 24 finds the last one at 33; from moves to 37."],
        ["m3", "end", "indexOf", "Searching from 37 returns -1, so the loop stops with count 3."],
      ],
    ],
    mistakes: [
      "Using `toLowerCase()` without a locale for case-insensitive comparisons of identifiers.",
      "Advancing `from` by 1 instead of the word length, which double-counts overlapping matches when you did not intend to.",
    ],
    qa: [
      ["How do you check if a String contains a substring?", "`s.contains(sub)` or `s.indexOf(sub) != -1`."],
      ["What does indexOf return if the substring is not found?", "-1."],
      ["How do you do a case-insensitive contains?", "Lower-case both strings with a fixed locale and call `contains`, or use a regex with `Pattern.CASE_INSENSITIVE`."],
    ],
    ex: [
      "Count overlapping occurrences of \"aa\" in \"aaaa\". How does the loop need to change?",
      "Advance `from` by 1 instead of `word.length()`. Overlapping matches start at 0, 1 and 2, so the count is 3 (non-overlapping would give 2).",
    ],
  }),
]);
