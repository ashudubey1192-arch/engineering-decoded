import { lesson, section } from "../schema.js";

export default section("language-basics", "Data Types, Operators and Control Flow", [
  lesson("Primitive Data Types", {
    intro:
      "Java has exactly eight primitive types. They hold raw values directly (not references), have fixed sizes on every platform, and are the building blocks of everything else. This lesson covers each primitive with its size, range and default value, plus overflow and floating-point precision.",
    topics: [
      [
        "The eight primitives",
        "Integers: `byte` (8 bits, -128 to 127), `short` (16 bits, -32,768 to 32,767), `int` (32 bits, about plus or minus 2.1 billion) and `long` (64 bits, about plus or minus 9.2 quintillion). Floating point: `float` (32-bit IEEE 754, about 7 decimal digits) and `double` (64-bit, about 15 to 16 digits). `char` is a 16-bit unsigned UTF-16 code unit (0 to 65,535). `boolean` is `true` or `false`; its size is not defined by the specification.",
      ],
      [
        "Default values",
        "Fields and array elements get defaults: `0` for numeric types, `0.0` for `float` and `double`, `'\\u0000'` for `char` and `false` for `boolean`. Local variables get no default; using one before assigning it is a compile error (\"variable might not have been initialized\").",
      ],
      [
        "Overflow and wrap-around",
        "Integer arithmetic does not throw on overflow; it wraps around in two's complement, so `Integer.MAX_VALUE + 1` equals `Integer.MIN_VALUE`. Use `long`, `Math.addExact` (throws `ArithmeticException`) or `BigInteger` when values can grow large.",
      ],
      [
        "Floating-point precision",
        "`float` and `double` store binary fractions, so many decimal values are approximations: `0.1 + 0.2` is `0.30000000000000004`. Never use them for money; use `BigDecimal` or whole numbers of the smallest unit (cents or paise). Division by zero with doubles gives `Infinity` or `NaN` instead of an exception.",
      ],
      [
        "Why primitives exist",
        "Primitives are stored inline in a stack frame or an object, so they use little memory and need no garbage collection. Each primitive has a wrapper class (`Integer`, `Double` and so on) for use where an object is required, such as collections.",
      ],
    ],
    code: String.raw`import java.math.BigDecimal;

public class Main {
    static int intField;
    static double doubleField;
    static char charField;
    static boolean booleanField;

    public static void main(String[] args) {
        System.out.printf("byte   %2d bits  %d .. %d%n", Byte.SIZE, Byte.MIN_VALUE, Byte.MAX_VALUE);
        System.out.printf("short  %2d bits  %d .. %d%n", Short.SIZE, Short.MIN_VALUE, Short.MAX_VALUE);
        System.out.printf("int    %2d bits  %d .. %d%n", Integer.SIZE, Integer.MIN_VALUE, Integer.MAX_VALUE);
        System.out.printf("long   %2d bits  %d .. %d%n", Long.SIZE, Long.MIN_VALUE, Long.MAX_VALUE);
        System.out.printf("float  %2d bits  max %e%n", Float.SIZE, Float.MAX_VALUE);
        System.out.printf("double %2d bits  max %e%n", Double.SIZE, Double.MAX_VALUE);
        System.out.printf("char   %2d bits  %d .. %d%n", Character.SIZE, (int) Character.MIN_VALUE, (int) Character.MAX_VALUE);

        System.out.println("Defaults: int=" + intField + " double=" + doubleField
                + " char=" + (int) charField + " boolean=" + booleanField);

        int max = Integer.MAX_VALUE;
        System.out.println("MAX_VALUE + 1 = " + (max + 1));
        try {
            Math.addExact(max, 1);
        } catch (ArithmeticException e) {
            System.out.println("addExact: " + e.getMessage());
        }

        System.out.println("0.1 + 0.2 = " + (0.1 + 0.2));
        System.out.println("BigDecimal: " + new BigDecimal("0.1").add(new BigDecimal("0.2")));
        System.out.println("1.0 / 0 = " + (1.0 / 0) + ", 0.0 / 0 = " + (0.0 / 0));
    }
}`,
    walk:
      "The wrapper classes expose each primitive's size and range as constants, and `printf` prints them in a table. Static fields that were never assigned show the default values.\n\n`Integer.MAX_VALUE + 1` silently wraps to the minimum value, while `Math.addExact` detects the overflow and throws. `0.1 + 0.2` shows binary rounding error, `BigDecimal` built from strings gives the exact `0.3`, and dividing a double by zero yields `Infinity` and `NaN` without any exception.",
    anim: [
      "int overflow wraps around",
      [
        ["max", "2147483647", "MAX_VALUE"],
        ["plus", "+ 1", "int addition"],
        ["bits", "0x80000000", "sign bit set"],
        ["min", "-2147483648", "MIN_VALUE"],
        ["exact", "addExact", "throws instead"],
      ],
      [
        ["max", "plus", "add", "Start from Integer.MAX_VALUE, binary 0111...1, and add one."],
        ["plus", "bits", "carry", "The carry flips every bit, giving 1000...0 in 32 bits."],
        ["bits", "min", "two's comp", "In two's complement that bit pattern is the most negative int."],
        ["plus", "exact", "checked", "Math.addExact detects the overflow and throws ArithmeticException instead."],
      ],
    ],
    mistakes: [
      "Using `double` for money: rounding errors accumulate. Use `BigDecimal` or `long` cents.",
      "Expecting `int` overflow to throw. It wraps silently; use `Math.addExact` or `long`.",
      "Writing `long big = 3000000000;`. Without the `L` suffix the literal is an `int` and does not compile; write `3000000000L`.",
    ],
    qa: [
      ["How many primitive types does Java have?", "Eight: byte, short, int, long, float, double, char and boolean."],
      ["What is the size of char in Java and why?", "16 bits, because Java chars are UTF-16 code units, not single bytes as in C."],
      ["What happens when an int overflows?", "It wraps around using two's complement; no exception is thrown unless you use the `Math.*Exact` methods."],
      ["Do local variables have default values?", "No. Only fields and array elements are defaulted; local variables must be assigned before use."],
    ],
    ex: [
      "What do `(byte) 200` and `(short) 70000` print, and why?",
      "`(byte) 200` prints -56 and `(short) 70000` prints 4464. Casting keeps only the low 8 or 16 bits: 200 - 256 = -56 and 70000 - 65536 = 4464.",
    ],
  }),

  lesson("Reference (Custom) Data Types", {
    intro:
      "Everything that is not one of the eight primitives is a reference type: classes, interfaces, arrays, enums and records. A variable of a reference type does not hold the object itself; it holds a reference that points to an object on the heap. This lesson explains reference types, `null`, how assignment shares objects and how they differ from primitives.",
    topics: [
      [
        "What reference types are",
        "Reference types are the custom types you or the JDK define: `String`, `ArrayList`, `Employee`, `int[]`, `enum Day`, `record Point`. A reference variable stores the address-like handle of an object. Creating an object with `new` allocates it on the heap and returns the reference.",
      ],
      [
        "null",
        "A reference variable can hold `null`, meaning it points to no object. Calling a method or reading a field through `null` throws `NullPointerException`. Reference fields default to `null`.",
      ],
      [
        "Assignment copies the reference",
        "`b = a` copies the reference, not the object, so both variables point at the same object and a change through one is visible through the other. To get an independent object you must copy it explicitly (copy constructor, `clone()` or a factory).",
      ],
      [
        "Primitive vs reference types",
        "Primitives hold values, are never `null`, compare with `==` by value and live inline. References point to heap objects, can be `null`, compare with `==` by identity (same object) and `equals()` by content, and are garbage collected when unreachable.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Employee {
        String name;
        int salary;
        Employee(String name, int salary) { this.name = name; this.salary = salary; }
        @Override public String toString() { return name + "(" + salary + ")"; }
    }

    static Employee unassigned; // reference field: defaults to null

    public static void main(String[] args) {
        int x = 10;
        int y = x;          // copies the value
        y = 20;
        System.out.println("primitives: x=" + x + " y=" + y);

        Employee a = new Employee("Asha", 50_000);
        Employee b = a;     // copies the reference: same object
        b.salary = 60_000;
        System.out.println("references: a=" + a + " b=" + b + " same object=" + (a == b));

        Employee c = new Employee("Asha", 60_000);
        System.out.println("a == c (identity): " + (a == c));

        int[] numbers = {1, 2, 3};          // arrays are reference types too
        int[] alias = numbers;
        alias[0] = 99;
        System.out.println("numbers[0] = " + numbers[0]);

        List<Employee> team = new ArrayList<>();
        team.add(a);
        a.name = "Asha K";
        System.out.println("team sees the change: " + team);

        System.out.println("default reference field: " + unassigned);
        try {
            System.out.println(unassigned.name);
        } catch (NullPointerException e) {
            System.out.println("NullPointerException when using null");
        }
    }
}`,
    walk:
      "Copying an `int` copies its value, so changing `y` leaves `x` untouched. Copying an `Employee` reference makes `a` and `b` point to the same object, so raising the salary through `b` shows up through `a`, and `a == b` is true.\n\n`c` has identical content but is a different object, so `a == c` is false. Arrays and objects inside collections behave the same way. Finally the unassigned static field is `null`, and dereferencing it throws `NullPointerException`.",
    anim: [
      "Two references, one object",
      [
        ["a", "a", "stack ref"],
        ["b", "b = a", "stack ref"],
        ["obj", "Employee", "heap: Asha"],
        ["c", "c", "stack ref"],
        ["obj2", "Employee", "heap: copy"],
      ],
      [
        ["a", "obj", "new", "new Employee allocates an object on the heap; a holds its reference."],
        ["b", "obj", "copy ref", "b = a copies the reference, so both point at the same object."],
        ["b", "obj", "salary", "Changing salary through b changes the one shared object, visible via a."],
        ["c", "obj2", "new", "A second new creates a separate object, so a == c is false."],
      ],
    ],
    mistakes: [
      "Expecting `b = a` to copy an object. It copies the reference only.",
      "Comparing objects with `==` when you mean equal content; use `equals()`.",
    ],
    qa: [
      ["What is a reference type?", "Any type that is not primitive (class, interface, array, enum, record); its variables hold references to heap objects."],
      ["What is the default value of a reference field?", "`null`."],
      ["Are arrays primitive or reference types?", "Reference types, even `int[]`; the array object lives on the heap."],
    ],
    ex: [
      "Add a copy constructor `Employee(Employee other)` and use it so changing `b.salary` no longer affects `a`.",
      "Write `Employee(Employee o) { this(o.name, o.salary); }` and set `Employee b = new Employee(a);`. Now `a == b` is false and `a` keeps its salary of 50000.",
    ],
  }),

  lesson("Literals and Escape Sequences", {
    intro:
      "A literal is a fixed value written directly in source code, such as `42`, `3.14`, `'A'` or `\"hello\"`. Java has literal forms for integers in four bases, floating-point numbers, characters, strings, booleans and `null`, plus escape sequences for special characters. This lesson covers each kind.",
    topics: [
      [
        "Integer literals",
        "Decimal `255`, hexadecimal `0xFF`, octal `0377` (leading zero) and binary `0b11111111` (Java 7). They are `int` by default; add `L` for `long` (`10_000_000_000L`). Underscores improve readability (`1_000_000`) but cannot start or end a number or touch the decimal point.",
      ],
      [
        "Floating-point literals",
        "`3.14` is a `double` by default; add `f` or `F` for `float` (`3.14f`) and optionally `d`. Scientific notation: `6.02e23`, `1.5E-3`. Hexadecimal floating point also exists (`0x1.0p3` is 8.0).",
      ],
      [
        "Character literals",
        "Single quotes: `'A'`. A Unicode escape gives any code unit: `'\\u0041'` is `'A'`. Because `char` is numeric, `'A' + 1` is the `int` 66.",
      ],
      [
        "String literals and text blocks",
        "Double quotes: `\"Hello\"`. Identical literals share one object from the string pool. Since Java 15, text blocks use triple quotes and keep line breaks, which is handy for JSON, SQL and HTML.",
      ],
      [
        "Escape sequences",
        "`\\n` newline, `\\t` tab, `\\r` carriage return, `\\b` backspace, `\\f` form feed, `\\'` single quote, `\\\"` double quote, `\\\\` backslash, `\\s` space (Java 15) and octal escapes like `\\101`. Boolean literals are `true` and `false`, and `null` is the null literal.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        int decimal = 255, hex = 0xFF, octal = 0377, binary = 0b1111_1111;
        System.out.println("255 four ways: " + decimal + " " + hex + " " + octal + " " + binary);

        long population = 8_100_000_000L;
        float price = 19.99f;
        double avogadro = 6.022e23;
        System.out.println("long: " + population + ", float: " + price + ", double: " + avogadro);
        System.out.println("hex float 0x1.0p3 = " + 0x1.0p3);

        char letter = 'A', unicode = 'A';
        System.out.println("chars equal: " + (letter == unicode) + ", 'A' + 1 = " + ('A' + 1)
                + ", (char) ('A' + 1) = " + (char) ('A' + 1));

        System.out.println("Tab:\tafter tab");
        System.out.println("Quote: \"Java\" and 'single' and backslash \\");
        System.out.println("Line one\nLine two");
        System.out.println("Octal escape \\101 gives: \101");

        String json = """
                {
                  "name": "Asha",
                  "role": "developer"
                }""";
        System.out.println(json);

        boolean ready = true;
        String nothing = null;
        System.out.println("boolean literal: " + ready + ", null literal: " + nothing);
    }
}`,
    walk:
      "The first line prints 255 written in decimal, hex, octal and binary (with an underscore for readability). The `L` and `f` suffixes make the literals `long` and `float`, and `6.022e23` uses scientific notation.\n\n`'\\u0041'` is the same character as `'A'`; adding 1 to a `char` produces an `int` unless you cast back. The escape sequences print a tab, quotes, a backslash, a line break and an octal escape. The text block keeps its line breaks and strips the common indentation.",
    anim: [
      "One value, four bases",
      [
        ["dec", "255", "decimal"],
        ["hex", "0xFF", "hexadecimal"],
        ["oct", "0377", "octal"],
        ["bin", "0b11111111", "binary"],
        ["val", "int 255", "same value"],
      ],
      [
        ["dec", "val", "base 10", "A plain number is a decimal int literal."],
        ["hex", "val", "base 16", "0x prefix: F times 16 plus F equals 255."],
        ["oct", "val", "base 8", "A leading 0 means octal: 3*64 + 7*8 + 7 = 255."],
        ["bin", "val", "base 2", "0b prefix (Java 7): eight one bits equal 255."],
      ],
    ],
    mistakes: [
      "Writing `010` and expecting ten; the leading zero makes it octal 8.",
      "Using `\\u000a` inside a comment or string. Unicode escapes are processed before parsing, so it becomes a real line break and can break compilation.",
      "Assigning `float f = 1.5;`, which fails because `1.5` is a `double`; write `1.5f`.",
    ],
    qa: [
      ["What is the default type of an integer literal and a decimal literal?", "`int` for integer literals and `double` for floating-point literals."],
      ["How do you write a binary literal?", "With the `0b` or `0B` prefix, for example `0b1010` (since Java 7)."],
      ["What does `'a' + 'b'` evaluate to?", "The `int` 195, because chars are promoted to int and added numerically (97 + 98)."],
    ],
    ex: [
      "Print the value of `0x7FFF_FFFF + 0b1` and explain it.",
      "It prints -2147483648. `0x7FFF_FFFF` is `Integer.MAX_VALUE`; adding 1 overflows and wraps to `Integer.MIN_VALUE`.",
    ],
  }),

  lesson("Type Casting and Type Promotion", {
    intro:
      "Java converts between numeric types in two directions. Widening (implicit casting) happens automatically when no information can be lost, and narrowing (explicit casting) needs a cast because data may be lost. Expressions also promote smaller types to `int` or larger. This lesson covers implicit casting, numeric promotion rules, explicit casts and reference casting.",
    topics: [
      [
        "Implicit casting (widening)",
        "A smaller type is converted automatically to a larger one: `byte` to `short` to `int` to `long` to `float` to `double`, and `char` to `int`. `long x = 5;` and `double d = 10;` need no cast. Widening from `int` or `long` to `float` or `double` can lose precision for very large values, but it never fails.",
      ],
      [
        "Numeric promotion in expressions",
        "In arithmetic, `byte`, `short` and `char` are first promoted to `int`. If either operand is `long` the result is `long`; if either is `float` it is `float`; if either is `double` it is `double`. That is why `byte b = a + c;` does not compile when `a` and `c` are bytes: the sum is an `int`.",
      ],
      [
        "Compound assignment includes a hidden cast",
        "`b += 5` compiles for a `byte` because compound operators cast back to the left-hand type: it means `b = (byte) (b + 5)`. This can overflow silently.",
      ],
      [
        "Explicit casting (narrowing)",
        "Larger to smaller needs a cast: `int i = (int) 3.99;` truncates toward zero to 3; `(byte) 300` keeps the low 8 bits (44). Use `Math.round`, `Math.floor` or `Math.ceil` when you need rounding instead of truncation.",
      ],
      [
        "Casting references",
        "Upcasting (subclass to superclass) is implicit and always safe. Downcasting (superclass to subclass) needs an explicit cast and fails at runtime with `ClassCastException` if the object is not actually that type; check first with `instanceof`.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        // Implicit widening
        byte small = 10;
        int widened = small;
        long bigger = widened;
        double decimal = bigger;
        char letter = 'A';
        int code = letter;
        System.out.println("widening: " + small + " -> " + widened + " -> " + bigger + " -> " + decimal);
        System.out.println("char 'A' widened to int: " + code);

        // Promotion in expressions
        byte a = 40, b = 50;
        int sum = a + b;           // byte + byte is int
        // byte bad = a + b;       // compile error: possible lossy conversion
        long mixed = 5 + 10L;      // int + long is long
        double ratio = 7 / 2;      // int division happens first: 3, then widened
        double real = 7 / 2.0;     // one double operand: 3.5
        System.out.println("byte+byte=" + sum + " long=" + mixed + " 7/2=" + ratio + " 7/2.0=" + real);

        // Compound assignment hides a cast
        byte counter = 120;
        counter += 10;             // (byte) (120 + 10)
        System.out.println("byte 120 += 10 -> " + counter);

        // Explicit narrowing
        System.out.println("(int) 3.99 = " + (int) 3.99 + ", (int) -3.99 = " + (int) -3.99);
        System.out.println("(byte) 300 = " + (byte) 300 + ", Math.round(3.5) = " + Math.round(3.5));
        long hugeLong = 123_456_789_123L;
        System.out.println("(int) hugeLong = " + (int) hugeLong);

        // Reference casts
        Object obj = "casting";      // upcast: implicit
        String text = (String) obj;  // downcast: explicit
        System.out.println("downcast ok: " + text.toUpperCase());
        try {
            Integer wrong = (Integer) obj;
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: String is not an Integer");
        }
    }
}`,
    walk:
      "The first block widens a `byte` step by step to `double`, and a `char` to its code 65, with no casts. The second block shows promotion: two bytes add up to an `int`, `5 + 10L` is a `long`, and `7 / 2` is integer division (3) before the result is widened, while `7 / 2.0` gives 3.5.\n\n`counter += 10` on a byte overflows to -126 because of the hidden cast. Explicit casts truncate (3.99 becomes 3, -3.99 becomes -3) or keep low bits (300 becomes 44). The last block upcasts a `String` to `Object`, downcasts it back safely, and shows `ClassCastException` for a wrong downcast.",
    anim: [
      "Widening chain",
      [
        ["byte", "byte", "8 bits"],
        ["short", "short", "16 bits"],
        ["int", "int", "32 bits"],
        ["long", "long", "64 bits"],
        ["float", "float", "32-bit IEEE"],
        ["double", "double", "64-bit IEEE"],
      ],
      [
        ["byte", "short", "auto", "byte widens to short automatically; no value can be lost."],
        ["short", "int", "auto", "short and char widen to int, the type arithmetic starts at."],
        ["int", "long", "auto", "int to long is always exact."],
        ["long", "float", "auto", "long to float is allowed but can round very large values."],
        ["float", "double", "auto", "float to double completes the chain; going back needs a cast."],
      ],
    ],
    mistakes: [
      "Expecting `double avg = sum / count;` to keep decimals when both are ints. Cast one operand: `(double) sum / count`.",
      "Downcasting without checking `instanceof`, which crashes with `ClassCastException`.",
    ],
    qa: [
      ["What is the difference between widening and narrowing?", "Widening converts to a larger type automatically without data loss; narrowing converts to a smaller type, needs an explicit cast and may lose data."],
      ["Why does `byte c = a + b;` fail but `a += b;` compile?", "`a + b` is promoted to `int`, which cannot be assigned to `byte` implicitly; compound assignment includes an implicit cast back to `byte`."],
      ["What does `(int) 9.99` return?", "9, because casting a floating-point value to an integer truncates toward zero."],
    ],
    ex: [
      "Compute the average of `int[] marks = {90, 85, 72}` correctly as a double with two decimals.",
      "`double avg = (double) (90 + 85 + 72) / marks.length;` then `System.out.printf(\"%.2f%n\", avg);` prints 82.33. Without the cast the division would be integer division giving 82.",
    ],
  }),

  lesson("Arithmetic and Unary Operators", {
    intro:
      "Arithmetic operators do math, and unary operators act on a single operand: sign, increment, decrement and logical complement. They look simple, but integer division, remainder with negative numbers and prefix versus postfix increment are classic interview traps. This lesson covers all of them along with operator precedence.",
    topics: [
      [
        "Arithmetic operators",
        "`+` addition (also string concatenation), `-` subtraction, `*` multiplication, `/` division and `%` remainder. Integer division truncates toward zero (`7 / 2` is 3, `-7 / 2` is -3). Dividing an integer by zero throws `ArithmeticException`.",
      ],
      [
        "The remainder operator",
        "`%` returns what is left after division and takes the sign of the left operand: `7 % 3` is 1, `-7 % 3` is -1, `7 % -3` is 1. It also works on doubles (`5.5 % 2` is 1.5). Use `Math.floorMod` when you need a non-negative result, for example for array indexes.",
      ],
      [
        "Unary plus, minus and logical complement",
        "`+x` (promotes to int), `-x` (negation) and `!flag` (inverts a boolean). Note that `-Integer.MIN_VALUE` is still `Integer.MIN_VALUE` because of overflow.",
      ],
      [
        "Increment and decrement: prefix vs postfix",
        "`++x` increments first and then yields the new value; `x++` yields the old value and then increments. The same applies to `--`. In `int y = x++;` y gets the old value. Avoid writing `x = x++;`, which leaves x unchanged.",
      ],
      [
        "Precedence and associativity",
        "From high to low: postfix (`x++`), unary (`++x`, `-`, `!`), multiplicative (`* / %`), additive (`+ -`), shift, relational, equality, bitwise, logical, ternary, assignment. Operators of equal precedence are evaluated left to right, except assignment, which is right to left. Use parentheses for clarity.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        int a = 17, b = 5;
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b) + "  (integer division)");
        System.out.println("a % b = " + (a % b));
        System.out.println("-17 / 5 = " + (-17 / 5) + ", -17 % 5 = " + (-17 % 5)
                + ", floorMod(-17, 5) = " + Math.floorMod(-17, 5));
        System.out.println("5.5 % 2 = " + (5.5 % 2));

        int x = 5;
        int post = x++;   // post gets 5, x becomes 6
        int pre = ++x;    // x becomes 7, pre gets 7
        System.out.println("post=" + post + " pre=" + pre + " x=" + x);

        int y = 10;
        int result = y++ + ++y;  // 10 + 12
        System.out.println("y++ + ++y = " + result + ", y = " + y);

        int z = 3;
        z = z++;                 // z stays 3
        System.out.println("z = z++ leaves z = " + z);

        boolean on = true;
        System.out.println("!on = " + !on + ", -a = " + -a);
        System.out.println("2 + 3 * 4 = " + (2 + 3 * 4) + ", (2 + 3) * 4 = " + ((2 + 3) * 4));
        System.out.println("\"1\" + 2 + 3 = " + "1" + 2 + 3 + ", 1 + 2 + \"3\" = " + (1 + 2 + "3"));

        try {
            System.out.println(a / 0);
        } catch (ArithmeticException e) {
            System.out.println("int / 0 -> " + e.getMessage());
        }
    }
}`,
    walk:
      "The first lines apply each arithmetic operator to 17 and 5; division truncates to 3 and the remainder is 2. With -17 the quotient is -3 and the remainder -2 (sign of the left operand), while `Math.floorMod` returns the non-negative 3.\n\n`x++` returns the old value and `++x` the new one. In `y++ + ++y` the left operand is evaluated first: 10 is used and y becomes 11, then y becomes 12 and 12 is used, giving 22. `z = z++` assigns the old value back, so z stays 3. The concatenation line shows left-to-right evaluation: once a String appears, `+` concatenates.",
    anim: [
      "x++ vs ++x",
      [
        ["x5", "x = 5", "start"],
        ["post", "post = x++", "use then add"],
        ["x6", "x = 6", "after post"],
        ["pre", "pre = ++x", "add then use"],
        ["x7", "x = 7", "after pre"],
      ],
      [
        ["x5", "post", "read 5", "Postfix reads the current value 5 and gives it to post."],
        ["post", "x6", "increment", "Only after the read does x become 6."],
        ["x6", "pre", "increment", "Prefix increments first, so x becomes 7."],
        ["pre", "x7", "read 7", "Then the new value 7 is given to pre."],
      ],
    ],
    mistakes: [
      "Expecting `-7 % 3` to be 2. Java returns -1; use `Math.floorMod` for a positive remainder.",
      "Writing `count = count++;` and expecting the counter to grow.",
      "Printing `\"Total: \" + a + b` and getting `Total: 175` instead of 22; put the sum in parentheses.",
    ],
    qa: [
      ["What is the difference between i++ and ++i?", "Both add 1 to i. `i++` evaluates to the value before the increment; `++i` evaluates to the value after it."],
      ["What does 10 / 0 and 10.0 / 0 give?", "`10 / 0` throws `ArithmeticException`; `10.0 / 0` returns `Infinity`."],
      ["What is the sign of the result of %?", "The sign of the dividend (left operand)."],
    ],
    ex: [
      "Without running it, compute `int i = 2; int j = i++ * 3 + --i;` and the final value of i.",
      "`i++` yields 2 and makes i 3; `2 * 3` is 6; `--i` makes i 2 and yields 2; so j is 8 and i ends at 2.",
    ],
  }),

  lesson("Equality, Relational and Conditional Operators", {
    intro:
      "Every decision in a program is a boolean expression built from equality operators, relational operators and the conditional (logical) operators. This lesson covers `==` and `!=`, `<`, `<=`, `>` and `>=`, the short-circuit operators `&&` and `||`, and the ternary operator `?:`.",
    topics: [
      [
        "Equality operators: == and !=",
        "For primitives `==` compares values. For references it compares identity: whether both sides are the same object. To compare object content use `equals()`. Floating-point equality is risky because of rounding; compare with a tolerance. `NaN` is never equal to anything, not even itself.",
      ],
      [
        "Relational operators",
        "`<`, `<=`, `>` and `>=` compare numbers (including `char`, which compares by code). They return `boolean`. Objects are compared with `compareTo()` (from `Comparable`) instead.",
      ],
      [
        "Conditional operators && and ||",
        "`&&` is true only if both sides are true; `||` is true if either side is true. They short-circuit: if the left side of `&&` is false, the right side is not evaluated, and if the left side of `||` is true, the right side is skipped. This lets you write null-safe checks such as `s != null && s.isEmpty()`.",
      ],
      [
        "Non-short-circuit & and |",
        "Applied to booleans, `&` and `|` compute the same result as `&&` and `||` but always evaluate both sides. `^` is exclusive or (true when exactly one side is true).",
      ],
      [
        "The ternary operator ?:",
        "`condition ? valueIfTrue : valueIfFalse` is an expression that returns one of two values, for example `String label = age >= 18 ? \"adult\" : \"minor\";`. Nesting ternaries quickly hurts readability.",
      ],
    ],
    code: String.raw`public class Main {
    static int calls = 0;

    static boolean check(boolean value) {
        calls++;
        return value;
    }

    public static void main(String[] args) {
        int a = 10, b = 20;
        System.out.println("a == b: " + (a == b) + ", a != b: " + (a != b));
        System.out.println("a < b: " + (a < b) + ", a >= b: " + (a >= b) + ", 'a' < 'b': " + ('a' < 'b'));

        String s1 = new String("java");
        String s2 = new String("java");
        System.out.println("s1 == s2: " + (s1 == s2) + ", s1.equals(s2): " + s1.equals(s2));

        double sum = 0.1 + 0.2;
        System.out.println("0.1 + 0.2 == 0.3: " + (sum == 0.3)
                + ", within tolerance: " + (Math.abs(sum - 0.3) < 1e-9));
        System.out.println("NaN == NaN: " + (Double.NaN == Double.NaN) + ", isNaN: " + Double.isNaN(0.0 / 0));

        calls = 0;
        boolean r1 = check(false) && check(true);
        System.out.println("false && ... = " + r1 + ", calls = " + calls);
        calls = 0;
        boolean r2 = check(false) & check(true);
        System.out.println("false & ...  = " + r2 + ", calls = " + calls);
        calls = 0;
        boolean r3 = check(true) || check(false);
        System.out.println("true || ...  = " + r3 + ", calls = " + calls);
        System.out.println("true ^ true = " + (true ^ true) + ", true ^ false = " + (true ^ false));

        String name = null;
        boolean empty = name != null && name.isEmpty(); // no NullPointerException
        System.out.println("null-safe check: " + empty);

        int age = 20;
        String label = age >= 18 ? "adult" : "minor";
        String grade = a > 15 ? "big" : a > 5 ? "medium" : "small";
        System.out.println("ternary: " + label + ", nested ternary: " + grade);
    }
}`,
    walk:
      "Comparing ints with `==` and relational operators gives the expected booleans, and chars compare by their codes. Two `new String(\"java\")` objects have equal content but are different objects, so `==` is false while `equals` is true.\n\nThe floating-point line shows why exact equality fails and how a tolerance works. The `calls` counter proves short-circuiting: `false && ...` calls `check` once, `false & ...` calls it twice, and `true || ...` stops after the first call. The null-safe check never calls `isEmpty` on null, and the ternaries pick a label based on conditions.",
    anim: [
      "Short-circuit evaluation",
      [
        ["left", "s != null", "left side"],
        ["and", "&&", "AND"],
        ["right", "s.isEmpty()", "right side"],
        ["skip", "skipped", "no NPE"],
        ["res", "false", "result"],
      ],
      [
        ["left", "and", "false", "With s == null the left side evaluates to false."],
        ["and", "skip", "short-circuit", "false && anything is false, so && does not evaluate the right side."],
        ["skip", "res", "false", "The result is false and s.isEmpty() never runs, so no NullPointerException."],
        ["and", "right", "if true", "Only when the left side is true does && go on to call s.isEmpty()."],
      ],
    ],
    mistakes: [
      "Comparing strings with `==`. It works only by accident for pooled literals; use `equals()`.",
      "Writing `if (x = 5)`, which is an assignment; in Java it does not compile for ints, but `if (flag = true)` compiles for booleans and is always true.",
      "Putting side effects on the right of `&&` or `||` and expecting them to always run.",
    ],
    qa: [
      ["What is the difference between & and &&?", "Both are logical AND for booleans, but `&&` short-circuits (skips the right side when the left is false) while `&` always evaluates both sides. `&` is also bitwise AND for integers."],
      ["Why is `0.1 + 0.2 == 0.3` false?", "Because those decimals cannot be represented exactly in binary floating point; the sum is 0.30000000000000004."],
      ["What does the ternary operator return?", "One of its two value operands, chosen by the boolean condition; it is an expression, not a statement."],
    ],
    ex: [
      "Write a single expression that is true when `int year` is a leap year (divisible by 4 and not by 100, unless divisible by 400).",
      "`(year % 4 == 0 && year % 100 != 0) || year % 400 == 0`. For 2024 it is true, for 1900 false, for 2000 true.",
    ],
  }),

  lesson("Bitwise and Bit Shift Operators", {
    intro:
      "Bitwise operators work on the individual bits of integer values. They are used for flags and permissions, hashing (HashMap uses them), compression, cryptography and fast arithmetic. This lesson covers AND, OR, XOR and complement, the three shift operators, and common bit tricks.",
    topics: [
      [
        "AND, OR, XOR and complement",
        "`&` sets a bit when both bits are 1 (masking), `|` when either is 1 (setting flags), `^` when the bits differ (toggling), and `~` flips every bit. For any int, `~x == -x - 1` because of two's complement.",
      ],
      [
        "Left shift <<",
        "`x << n` moves bits left by n positions, filling with zeros; it multiplies by 2 to the power n as long as no significant bits fall off. `1 << 4` is 16.",
      ],
      [
        "Signed right shift >>",
        "`x >> n` moves bits right and fills with the sign bit, so negative numbers stay negative. It divides by 2 to the power n, rounding toward negative infinity: `-9 >> 1` is -5.",
      ],
      [
        "Unsigned right shift >>>",
        "`x >>> n` fills with zeros regardless of sign, so a negative int becomes a large positive one. It is used in hashing and for treating ints as unsigned. Shift counts are taken modulo 32 for int and 64 for long, so `1 << 33` equals `1 << 1`.",
      ],
      [
        "Common bit tricks",
        "Even/odd: `(n & 1) == 0`. Power of two: `n > 0 && (n & (n - 1)) == 0`. Set bit k: `n | (1 << k)`; clear it: `n & ~(1 << k)`; toggle: `n ^ (1 << k)`; test: `(n >> k & 1) == 1`. Count set bits: `Integer.bitCount(n)`. Swap without a temp: `a ^= b; b ^= a; a ^= b;`.",
      ],
    ],
    code: String.raw`public class Main {
    static String bits(int value) {
        return String.format("%8s", Integer.toBinaryString(value & 0xFF)).replace(' ', '0');
    }

    public static void main(String[] args) {
        int a = 0b1100_1010, b = 0b1010_0110;
        System.out.println("a       = " + bits(a));
        System.out.println("b       = " + bits(b));
        System.out.println("a & b   = " + bits(a & b));
        System.out.println("a | b   = " + bits(a | b));
        System.out.println("a ^ b   = " + bits(a ^ b));
        System.out.println("~5 = " + ~5 + " (equals -5 - 1)");

        System.out.println("3 << 2 = " + (3 << 2) + ", 40 >> 3 = " + (40 >> 3));
        System.out.println("-9 >> 1 = " + (-9 >> 1) + ", -9 >>> 28 = " + (-9 >>> 28));
        System.out.println("1 << 33 = " + (1 << 33) + " (shift count mod 32)");

        // Permission flags
        final int READ = 1, WRITE = 2, EXECUTE = 4;
        int perms = READ | WRITE;
        System.out.println("can write: " + ((perms & WRITE) != 0) + ", can execute: " + ((perms & EXECUTE) != 0));
        perms |= EXECUTE;
        perms &= ~WRITE;
        System.out.println("after granting execute and revoking write: " + bits(perms));

        int n = 64;
        System.out.println(n + " is power of two: " + (n > 0 && (n & (n - 1)) == 0));
        System.out.println("17 is even: " + ((17 & 1) == 0) + ", bitCount(255) = " + Integer.bitCount(255));

        int x = 7, y = 9;
        x ^= y; y ^= x; x ^= y;
        System.out.println("XOR swap: x=" + x + " y=" + y);
    }
}`,
    walk:
      "The helper `bits` prints the low 8 bits with leading zeros, so you can line up the results of `&`, `|` and `^` column by column. `~5` is -6, matching the `-x - 1` rule.\n\nShifting 3 left by 2 multiplies by 4; 40 right by 3 divides by 8. `-9 >> 1` keeps the sign (-5) while `-9 >>> 28` shifts in zeros and gives 15. The permission example combines flags with `|`, tests them with `&`, adds one with `|=` and removes one with `&= ~`. The last lines show the power-of-two test, the even test, `bitCount` and the XOR swap.",
    anim: [
      "Masking with AND",
      [
        ["val", "11001010", "value a"],
        ["mask", "10100110", "mask b"],
        ["and", "&", "both 1"],
        ["res", "10000010", "result"],
        ["use", "test a flag", "!= 0 ?"],
      ],
      [
        ["val", "and", "bits", "Each bit of a is lined up with the same position in the mask."],
        ["mask", "and", "bits", "The mask has 1s only where we care about a's bits."],
        ["and", "res", "AND", "A result bit is 1 only when both a and the mask have 1 there."],
        ["res", "use", "test", "A non-zero result means at least one masked flag is set."],
      ],
    ],
    mistakes: [
      "Confusing `>>` and `>>>` for negative numbers; only `>>>` fills with zeros.",
      "Forgetting precedence: `n & 1 == 0` parses as `n & (1 == 0)` and does not compile; write `(n & 1) == 0`.",
      "Shifting an int by 32 or more and expecting zero; the count is taken modulo 32.",
    ],
    qa: [
      ["What is the difference between >> and >>>?", "`>>` is an arithmetic shift that copies the sign bit; `>>>` is a logical shift that always fills with zeros."],
      ["How do you check if a number is a power of two?", "`n > 0 && (n & (n - 1)) == 0`, because a power of two has exactly one set bit."],
      ["Why does HashMap use `h ^ (h >>> 16)`?", "It mixes the high bits of the hash into the low bits, which are the ones used to pick a bucket index with `(n - 1) & hash`."],
    ],
    ex: [
      "Write an expression that returns the lowest set bit of `n` (for 12, binary 1100, the answer is 4).",
      "`n & -n` isolates the lowest set bit, because `-n` is `~n + 1`. For 12 it returns 4. `Integer.lowestOneBit(12)` gives the same.",
    ],
  }),

  lesson("Assignment Operators and instanceof", {
    intro:
      "Assignment operators store values, and compound forms combine an operation with assignment. The `instanceof` operator tests an object's runtime type and, since Java 16, can also bind it to a new variable. This lesson covers simple and compound assignment, chained assignment and both forms of `instanceof`.",
    topics: [
      [
        "Simple assignment",
        "`=` stores the right-hand value in the left-hand variable and is itself an expression whose value is the assigned value. Assignment is right-associative, so `a = b = c = 5` sets all three to 5.",
      ],
      [
        "Compound assignment operators",
        "`+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=` and `>>>=`. `x op= y` means `x = (T) (x op y)` where T is the type of x, with x evaluated only once. The implicit cast lets `byte b = 1; b += 2;` compile, and `+=` on a String concatenates.",
      ],
      [
        "The instanceof operator",
        "`obj instanceof Type` is true when obj is not null and its runtime class is Type or a subtype. `null instanceof Anything` is false, so it never throws. The compiler rejects checks that can never be true, such as `\"text\" instanceof Integer`.",
      ],
      [
        "Pattern matching for instanceof (Java 16)",
        "`if (shape instanceof Circle c)` tests the type and declares `c` already cast, so there is no separate cast. The pattern variable is in scope only where the test is known to be true, for example `if (o instanceof String s && s.length() > 3)`.",
      ],
    ],
    code: String.raw`public class Main {
    interface Shape {}
    record Circle(double radius) implements Shape {}
    record Rectangle(double width, double height) implements Shape {}

    static double area(Shape shape) {
        if (shape instanceof Circle c) {                  // test + bind
            return Math.PI * c.radius() * c.radius();
        } else if (shape instanceof Rectangle r && r.width() > 0) {
            return r.width() * r.height();
        }
        return 0;
    }

    public static void main(String[] args) {
        int a, b, c;
        a = b = c = 5;                    // right to left
        System.out.println("chained: " + a + " " + b + " " + c);

        int x = 10;
        x += 5;  System.out.print("+= " + x);
        x -= 3;  System.out.print(", -= " + x);
        x *= 2;  System.out.print(", *= " + x);
        x /= 4;  System.out.print(", /= " + x);
        x %= 4;  System.out.print(", %= " + x);
        x <<= 3; System.out.print(", <<= " + x);
        x |= 1;  System.out.println(", |= " + x);

        short s = 10;
        s += 100_000;                     // hidden cast to short
        System.out.println("short after += 100000: " + s);

        String greeting = "Hello";
        greeting += ", Java";
        System.out.println(greeting);

        Object value = "pattern";
        System.out.println("String? " + (value instanceof String) + ", CharSequence? " + (value instanceof CharSequence));
        Object nothing = null;
        System.out.println("null instanceof Object: " + (nothing instanceof Object));

        Shape[] shapes = {new Circle(1), new Rectangle(2, 3)};
        for (Shape shape : shapes) {
            System.out.printf("%s area = %.2f%n", shape, area(shape));
        }
    }
}`,
    walk:
      "`a = b = c = 5` assigns from right to left. The compound operators then transform `x` step by step: 15, 12, 24, 6, 2, 16 and finally 17. Adding 100,000 to a `short` compiles thanks to the hidden cast and wraps around to -31,062. `+=` on a String concatenates.\n\n`instanceof` is true for the actual class and its supertypes, and false for `null`. In `area`, pattern matching both tests the type and binds `c` or `r`, so there is no explicit cast, and the `&&` condition can use the bound variable immediately.",
    anim: [
      "Pattern matching instanceof",
      [
        ["obj", "Shape shape", "static type"],
        ["test", "instanceof", "runtime check"],
        ["bind", "Circle c", "bound variable"],
        ["use", "c.radius()", "no cast"],
        ["no", "next branch", "if false"],
      ],
      [
        ["obj", "test", "check", "At runtime the JVM checks whether shape really is a Circle."],
        ["test", "bind", "true", "If it is, the pattern binds c, already typed as Circle."],
        ["bind", "use", "use", "Inside the branch c.radius() works directly, with no explicit cast."],
        ["test", "no", "false", "If the object is not a Circle (or is null), c does not exist and the next branch runs."],
      ],
    ],
    mistakes: [
      "Forgetting that `b += 1` on a byte can overflow silently because of the hidden cast.",
      "Long `instanceof` chains that grow with every new type; consider polymorphism or a `switch` with patterns.",
    ],
    qa: [
      ["Is `x += y` exactly the same as `x = x + y`?", "No. `x += y` includes an implicit cast to the type of x and evaluates x once, so `byte b += 1` compiles while `b = b + 1` does not."],
      ["What does `null instanceof String` return?", "`false`. instanceof never throws for null."],
      ["What is pattern matching for instanceof?", "A Java 16 feature: `if (o instanceof String s)` tests the type and declares a variable already cast to that type."],
    ],
    ex: [
      "Add a `Square(double side)` record and handle it in `area` with a pattern. What is the area of `new Square(4)`?",
      "Add `record Square(double side) implements Shape {}` and `else if (shape instanceof Square sq) return sq.side() * sq.side();`. The area is 16.00.",
    ],
  }),

  lesson("Decision Making: if, if-else and switch", {
    intro:
      "Control flow statements decide which code runs. Java offers `if`, `if-else`, `else if` chains and `switch` in its classic statement form and its modern expression form. This lesson covers each one, fall-through, switching on strings and enums, and the arrow syntax from Java 14.",
    topics: [
      [
        "Control flow statements overview",
        "Code normally runs top to bottom. Decision statements (`if`, `switch`) choose a path, looping statements (`for`, `while`, `do-while`) repeat code, and branching statements (`break`, `continue`, `return`) jump. The next two lessons cover loops and branching.",
      ],
      [
        "if and if-else",
        "`if (condition) { ... }` runs a block only when the boolean condition is true; `else` runs when it is false. The condition must be a `boolean` (Java does not treat 0 or null as false). Always use braces; without them only the next single statement belongs to the if.",
      ],
      [
        "else-if ladders and nested if",
        "`if ... else if ... else` tests conditions in order and runs the first match. An `else` belongs to the nearest unmatched `if` (the dangling-else rule), which is another reason to use braces.",
      ],
      [
        "Classic switch statement",
        "`switch (value) { case 1: ...; break; default: ... }` works with `byte`, `short`, `char`, `int`, their wrappers, `String` (Java 7) and enums. Without `break`, execution falls through into the next case, which is sometimes useful for grouping but is a common bug. Case labels must be compile-time constants and unique.",
      ],
      [
        "Switch expressions and arrow labels (Java 14)",
        "`case A, B -> ...` labels never fall through, can list several values, and the whole switch can return a value: `int days = switch (month) { case FEB -> 28; default -> 31; };`. A block body returns its value with `yield`. Switch expressions on enums must be exhaustive. Java 21 adds pattern matching with `case Circle c ->`.",
      ],
    ],
    code: String.raw`public class Main {
    enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

    static String grade(int marks) {
        if (marks >= 90) return "A";
        else if (marks >= 75) return "B";
        else if (marks >= 50) return "C";
        else return "F";
    }

    public static void main(String[] args) {
        int temperature = 32;
        if (temperature > 30) {
            System.out.println("Hot day");
        } else {
            System.out.println("Pleasant day");
        }

        for (int marks : new int[] {95, 80, 60, 20}) System.out.print(marks + "->" + grade(marks) + " ");
        System.out.println();

        // Classic switch with deliberate fall-through
        int month = 2;
        switch (month) {
            case 12:
            case 1:
            case 2:
                System.out.println("Month " + month + " is winter");
                break;
            case 6:
                System.out.println("Summer");
                break;
            default:
                System.out.println("Other season");
        }

        // Forgotten break: falls through
        int level = 1;
        switch (level) {
            case 1: System.out.print("one ");
            case 2: System.out.print("two ");
            case 3: System.out.println("three (fell through)");
        }

        String command = "stop";
        switch (command) {
            case "start" -> System.out.println("Starting");
            case "stop", "halt" -> System.out.println("Stopping");
            default -> System.out.println("Unknown");
        }

        for (Day day : new Day[] {Day.SAT, Day.WED}) {
            String type = switch (day) {
                case SAT, SUN -> "weekend";
                case MON, TUE, WED, THU, FRI -> {
                    String result = "weekday";
                    yield result.toUpperCase();
                }
            };
            System.out.println(day + " is a " + type);
        }
    }
}`,
    walk:
      "The `if-else` picks \"Hot day\" because 32 > 30, and `grade` shows an else-if ladder returning the first matching grade. The classic switch groups 12, 1 and 2 by leaving out `break` on purpose; the second switch shows an accidental fall-through that prints all three words.\n\nThe arrow switch on a String handles two labels in one case and never falls through. The switch expression on the enum returns a value; the weekday branch uses a block and `yield`. Because all seven days are covered, no `default` is needed.",
    anim: [
      "Fall-through vs arrow switch",
      [
        ["val", "level = 1", "switch value"],
        ["c1", "case 1", "prints one"],
        ["c2", "case 2", "prints two"],
        ["c3", "case 3", "prints three"],
        ["arrow", "case 1 ->", "only this"],
      ],
      [
        ["val", "c1", "match", "The switch jumps to the matching label, case 1, and prints \"one\"."],
        ["c1", "c2", "no break", "Without break, execution falls into case 2 and prints \"two\"."],
        ["c2", "c3", "no break", "It keeps falling through into case 3, printing \"three\"."],
        ["val", "arrow", "arrow form", "With arrow labels only the matching case runs; there is no fall-through."],
      ],
    ],
    mistakes: [
      "Forgetting `break` in a classic switch.",
      "Switching on a `null` String or enum throws `NullPointerException` (unless you write `case null` in Java 21).",
      "Writing `if (x > 0); { ... }`. The semicolon ends the if, so the block always runs.",
    ],
    qa: [
      ["Which types can a switch use?", "byte, short, char, int, their wrappers, String, enums, and (since Java 21) any type with pattern labels."],
      ["What is fall-through?", "In a classic switch without `break`, execution continues into the following case labels."],
      ["What is the difference between a switch statement and a switch expression?", "A switch expression produces a value, uses `->` or `yield`, never falls through and must be exhaustive."],
    ],
    ex: [
      "Write a switch expression that returns the number of days in a month (1 to 12) for a non-leap year.",
      "`int days = switch (m) { case 2 -> 28; case 4, 6, 9, 11 -> 30; default -> 31; };`. For m = 9 it returns 30.",
    ],
  }),

  lesson("Loops: for, while, do-while and Enhanced for", {
    intro:
      "Loops repeat code. Java has the counting `for` loop, the condition-driven `while` and `do-while` loops, the enhanced `for` (for-each) loop over arrays and collections, and infinite loops that run until something breaks out. This lesson covers each, the difference between while and do-while, and when to use which.",
    topics: [
      [
        "for loop",
        "`for (init; condition; update) { body }`. The init runs once, the condition is checked before each iteration, and the update runs after each one. Any part can be empty, and you can use several variables: `for (int i = 0, j = 10; i < j; i++, j--)`. Variables declared in init are scoped to the loop.",
      ],
      [
        "while loop",
        "`while (condition) { body }` checks the condition before each iteration, so the body may run zero times. Use it when you do not know the number of iterations in advance, such as reading until the end of input.",
      ],
      [
        "do-while loop and how it differs from while",
        "`do { body } while (condition);` runs the body first and checks afterwards, so it always runs at least once. That is the key difference from `while`, which can run zero times. Typical use: menus and input validation where you must ask at least once. Note the semicolon after the condition.",
      ],
      [
        "Enhanced for loop (for-each)",
        "`for (Type item : arrayOrIterable)` visits every element of an array or any `Iterable` (List, Set). It has no index and you cannot remove elements from a collection inside it (that throws `ConcurrentModificationException`); use an `Iterator` for that.",
      ],
      [
        "Infinite loops",
        "`for (;;)` and `while (true)` never end on their own; they are used for servers, game loops and event loops and must contain a `break`, `return` or exception to stop. An accidental infinite loop usually comes from a condition that never changes, such as forgetting `i++`.",
      ],
    ],
    code: String.raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.print("for: ");
        for (int i = 1; i <= 5; i++) System.out.print(i + " ");
        System.out.println();

        System.out.print("two variables: ");
        for (int i = 0, j = 6; i < j; i++, j--) System.out.print("(" + i + "," + j + ") ");
        System.out.println();

        int n = 1234, digits = 0;
        while (n > 0) {          // unknown number of iterations
            n /= 10;
            digits++;
        }
        System.out.println("while: 1234 has " + digits + " digits");

        int count = 10;
        while (count < 5) System.out.println("never printed");
        do {
            System.out.println("do-while ran once even though count=" + count);
        } while (count < 5);

        int[] scores = {72, 88, 95};
        int total = 0;
        for (int score : scores) total += score;
        System.out.println("for-each over array: total=" + total);

        List<String> languages = List.of("Java", "Kotlin", "Scala");
        for (String language : languages) System.out.print(language.toUpperCase() + " ");
        System.out.println();

        int attempts = 0;
        while (true) {           // infinite loop with an exit
            attempts++;
            if (attempts * attempts > 50) break;
        }
        System.out.println("infinite loop exited after " + attempts + " attempts");

        System.out.println("3 x 3 multiplication table (nested loops):");
        for (int row = 1; row <= 3; row++) {
            for (int col = 1; col <= 3; col++) System.out.printf("%4d", row * col);
            System.out.println();
        }
    }
}`,
    walk:
      "The basic `for` prints 1 to 5, and the two-variable version moves `i` up and `j` down until they meet. The `while` loop counts digits by dividing until nothing is left, which needs an unknown number of iterations.\n\nWith `count = 10`, the `while` body never runs but the `do-while` body runs once, which is exactly their difference. The enhanced `for` totals an array and walks a `List`. The `while (true)` loop runs until `break` fires at 8 attempts (64 > 50), and nested loops print a small table.",
    anim: [
      "while vs do-while",
      [
        ["start", "count = 10", "start"],
        ["wcheck", "while check", "10 < 5 ?"],
        ["skip", "body skipped", "0 runs"],
        ["dobody", "do body", "runs first"],
        ["dcheck", "do check", "10 < 5 ?"],
      ],
      [
        ["start", "wcheck", "enter", "while tests the condition before running the body."],
        ["wcheck", "skip", "false", "10 < 5 is false, so the while body runs zero times."],
        ["start", "dobody", "enter", "do-while runs the body first, without checking."],
        ["dobody", "dcheck", "then test", "Only now is the condition tested; it is false, so the loop ends after one run."],
      ],
    ],
    mistakes: [
      "Off-by-one errors such as `i <= array.length`, which reads past the last index.",
      "Removing items from a list inside a for-each loop; use `Iterator.remove()` or `removeIf`.",
      "Forgetting the update in a `while` loop, creating an accidental infinite loop.",
    ],
    qa: [
      ["What is the difference between while and do-while?", "while checks the condition first and may run zero times; do-while runs the body once before checking, so it runs at least once."],
      ["How do you write an infinite loop?", "`for (;;) { }` or `while (true) { }`, with a break or return inside to stop it."],
      ["Can you modify a collection in a for-each loop?", "You can modify the elements' state, but adding or removing elements throws `ConcurrentModificationException`; use an Iterator."],
    ],
    ex: [
      "Write a loop that prints the digits of 9075 in reverse (5, 7, 0, 9) and their sum.",
      "`int n = 9075, sum = 0; while (n > 0) { int d = n % 10; System.out.print(d + \" \"); sum += d; n /= 10; }` prints `5 7 0 9` and the sum is 21.",
    ],
  }),

  lesson("Branching: break, continue, Labels, return and goto", {
    intro:
      "Branching statements change the normal flow inside loops and methods. `break` leaves a loop or switch, `continue` skips to the next iteration, labels let both act on an outer loop, and `return` leaves the method. Java reserves `goto` but does not allow it. This lesson covers all of them.",
    topics: [
      [
        "break",
        "`break` immediately ends the innermost `for`, `while`, `do-while` or `switch` and continues after it. Use it to stop searching once you find a result.",
      ],
      [
        "Labeled break",
        "A label is an identifier followed by a colon placed before a loop: `outer: for (...)`. `break outer;` ends the labeled loop, not just the inner one, which is the clean way to exit nested loops.",
      ],
      [
        "continue and labeled continue",
        "`continue` skips the rest of the current iteration and jumps to the next one (in a `for` loop, the update still runs). `continue outer;` skips to the next iteration of the labeled outer loop.",
      ],
      [
        "return",
        "`return` exits the current method, optionally with a value (`return total;`). In a `void` method a bare `return;` ends it early. Code directly after an unconditional return is unreachable and does not compile. A `finally` block still runs when you return from inside `try`.",
      ],
      [
        "The goto keyword",
        "`goto` (and `const`) are reserved keywords with no meaning: you cannot use them as identifiers and you cannot write goto statements. Java's designers left them out on purpose because unstructured jumps make code hard to follow; labeled break and continue cover the legitimate uses.",
      ],
    ],
    code: String.raw`public class Main {
    static int indexOf(int[] values, int target) {
        for (int i = 0; i < values.length; i++) {
            if (values[i] == target) return i;   // leave the method early
        }
        return -1;
    }

    public static void main(String[] args) {
        System.out.print("break at 4: ");
        for (int i = 1; i <= 10; i++) {
            if (i == 4) break;
            System.out.print(i + " ");
        }
        System.out.println();

        System.out.print("continue skips evens: ");
        for (int i = 1; i <= 7; i++) {
            if (i % 2 == 0) continue;
            System.out.print(i + " ");
        }
        System.out.println();

        int[][] grid = {{1, 2, 3}, {4, 99, 6}, {7, 8, 9}};
        outer:
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[r].length; c++) {
                if (grid[r][c] == 99) {
                    System.out.println("labeled break: found 99 at [" + r + "][" + c + "]");
                    break outer;                 // leaves both loops
                }
            }
        }

        System.out.print("labeled continue: ");
        rows:
        for (int r = 0; r < 3; r++) {
            for (int c = 0; c < 3; c++) {
                if (c > r) continue rows;        // next row
                System.out.print("(" + r + "," + c + ")");
            }
        }
        System.out.println();

        System.out.println("indexOf 30: " + indexOf(new int[] {10, 20, 30}, 30)
                + ", indexOf 5: " + indexOf(new int[] {10, 20, 30}, 5));
        // int goto = 1;   // compile error: goto is a reserved keyword
        System.out.println("goto is reserved but unused in Java");
    }
}`,
    walk:
      "The first loop prints 1, 2 and 3 and stops when `break` runs at 4. The second uses `continue` to skip even numbers. Searching the grid for 99 uses `break outer`, which exits both loops at once instead of continuing the outer loop.\n\nThe labeled `continue rows` jumps to the next row as soon as the column passes the row, printing a triangle of coordinates. `indexOf` returns from inside the loop when it finds the target and returns -1 otherwise. The commented line shows that `goto` cannot even be used as a variable name.",
    anim: [
      "Labeled break leaves both loops",
      [
        ["outer", "outer: rows", "loop r"],
        ["inner", "inner: cols", "loop c"],
        ["found", "grid[1][1]", "== 99"],
        ["brk", "break outer", "jump"],
        ["after", "after loops", "continue here"],
      ],
      [
        ["outer", "inner", "r = 1", "The outer loop is on row 1 and starts the inner loop over its columns."],
        ["inner", "found", "c = 1", "The inner loop reaches column 1, where the value is 99."],
        ["found", "brk", "match", "break outer is executed instead of a plain break."],
        ["brk", "after", "exit both", "Control jumps past the labeled outer loop; no more rows are scanned."],
      ],
    ],
    mistakes: [
      "Using a plain `break` in nested loops and expecting the outer loop to stop.",
      "Using `continue` in a `while` loop before the update statement, which creates an infinite loop.",
      "Overusing labels; often extracting a method and using `return` is clearer.",
    ],
    qa: [
      ["Does Java support goto?", "No. `goto` is a reserved keyword but there is no goto statement; labeled break and continue replace it."],
      ["What is the difference between break and continue?", "`break` ends the loop entirely; `continue` ends only the current iteration and starts the next."],
      ["Can break be used outside loops?", "In a switch, yes; a labeled break can also exit any labeled block. Otherwise it is a compile error."],
    ],
    ex: [
      "Print all pairs (i, j) with 1 <= i, j <= 5 and i + j == 6, but stop everything at the first pair where i == j.",
      "Use `outer: for (i...) for (j...) { if (i + j == 6) { if (i == j) break outer; print } }`. It prints (1,5), (2,4) and stops at (3,3).",
    ],
  }),

  lesson("Blocks and Variable Scope", {
    intro:
      "A block is a group of statements in braces, and it defines where variables exist. Scope rules decide which names are visible where, what shadowing means, and when variables are created and destroyed. This lesson covers statement blocks, local, instance and static variable scope, shadowing and initializer blocks in brief.",
    topics: [
      [
        "What a block is",
        "A block is zero or more statements between `{` and `}`. Method bodies, loop bodies, if branches, try blocks and plain standalone blocks are all blocks. A block can be used wherever a single statement is allowed.",
      ],
      [
        "Local variable scope",
        "A local variable exists from its declaration to the end of the block that declares it. A loop variable declared in `for (int i = 0; ...)` exists only inside that loop. Two variables with the same name cannot be declared in nested blocks of the same method (no local shadowing of locals), but sibling blocks may reuse names.",
      ],
      [
        "Instance and static variable scope",
        "Fields are visible throughout their class. Instance fields live as long as their object; static fields live as long as the class is loaded. A local variable or parameter with the same name as a field shadows the field; use `this.name` to reach the field.",
      ],
      [
        "Initializer blocks",
        "A block directly inside a class is an instance initializer that runs on every object creation before the constructor body; `static { }` runs once when the class is initialized. They are covered in depth in the keywords section.",
      ],
    ],
    code: String.raw`public class Main {
    static int counter = 0;        // class scope, lives while the class is loaded
    private String name = "field"; // instance scope

    { counter++; }                 // instance initializer block
    static { System.out.println("static block: class initialized"); }

    void show(String name) {       // parameter shadows the field
        System.out.println("parameter name = " + name + ", this.name = " + this.name);
    }

    public static void main(String[] args) {
        int total = 0;             // visible until the end of main
        {
            int temp = 5;          // visible only inside this block
            total += temp;
        }
        // System.out.println(temp); // compile error: temp is out of scope
        System.out.println("total after block = " + total);

        for (int i = 0; i < 3; i++) {
            int square = i * i;    // a fresh variable each iteration
            total += square;
        }
        System.out.println("total after loop = " + total);

        {
            int temp = 100;        // sibling block may reuse the name
            System.out.println("second block temp = " + temp);
        }

        // int total = 1;          // compile error: already defined in this scope
        new Main().show("argument");
        new Main();
        System.out.println("objects created (instance block ran each time): " + counter);
    }
}`,
    walk:
      "The static block runs once when `Main` is initialized, before `main` starts. Inside `main`, `temp` exists only within its inner block, so using it afterwards would not compile; a later sibling block can declare its own `temp`.\n\nThe loop variable `i` and `square` exist only inside the loop. In `show`, the parameter `name` shadows the field, and `this.name` reaches the field. Each `new Main()` runs the instance initializer, so `counter` ends at 2.",
    anim: [
      "Variable lifetime in nested blocks",
      [
        ["method", "main block", "total"],
        ["inner", "inner block", "temp = 5"],
        ["gone", "temp gone", "end of block"],
        ["loop", "for block", "i, square"],
        ["end", "main ends", "total gone"],
      ],
      [
        ["method", "inner", "enter", "Entering the inner block creates temp; total is still visible from outside."],
        ["inner", "gone", "}", "At the closing brace temp goes out of scope and its stack slot is reused."],
        ["method", "loop", "enter", "The for loop creates i once and a fresh square each iteration."],
        ["loop", "end", "return", "When main returns, total and every other local disappears with the frame."],
      ],
    ],
    mistakes: [
      "Declaring a variable inside an `if` and trying to use it after the if.",
      "Accidentally shadowing a field with a parameter and forgetting `this.` in a setter (`name = name;` does nothing).",
    ],
    qa: [
      ["What is the scope of a local variable?", "From its declaration to the end of the enclosing block."],
      ["Can a local variable have the same name as a field?", "Yes; it shadows the field inside its scope, and `this.field` accesses the field."],
      ["Can you declare the same local name in a nested block?", "No, Java forbids a local variable shadowing another local in an enclosing block of the same method."],
    ],
    ex: [
      "In a setter `void setName(String name) { name = name; }`, why does the field never change, and how do you fix it?",
      "Both `name`s refer to the parameter, so the parameter is assigned to itself. Write `this.name = name;`.",
    ],
  }),

  lesson("Arrays: One-Dimensional, Two-Dimensional and Jagged", {
    intro:
      "An array is a fixed-size, indexed container of elements of one type, stored as an object on the heap. Java supports one-dimensional arrays, multi-dimensional arrays (arrays of arrays) and jagged arrays whose rows have different lengths. This lesson covers declaring, creating, initializing, iterating, copying and sorting arrays.",
    topics: [
      [
        "One-dimensional arrays",
        "Declare with `int[] marks;` (preferred) or `int marks[];`. Create with `new int[5]` (elements default to 0, null or false) or initialize with `int[] marks = {90, 75, 60};`. Indexes run from 0 to `length - 1`; `length` is a field, not a method. Accessing outside that range throws `ArrayIndexOutOfBoundsException`.",
      ],
      [
        "Two-dimensional arrays",
        "`int[][] matrix = new int[3][4];` creates 3 rows of 4 columns. It is really an array whose elements are references to row arrays. Access with `matrix[row][col]`, and `matrix.length` is the row count while `matrix[0].length` is the column count of row 0.",
      ],
      [
        "Jagged arrays",
        "Because rows are separate arrays, they can have different lengths: `int[][] triangle = new int[4][];` then `triangle[i] = new int[i + 1];`. Always use `triangle[i].length` for the inner loop.",
      ],
      [
        "Useful java.util.Arrays methods",
        "`Arrays.toString(a)` and `Arrays.deepToString(m)` for printing, `Arrays.sort(a)`, `Arrays.binarySearch(a, key)` on sorted arrays, `Arrays.fill(a, value)`, `Arrays.copyOf(a, newLength)`, `Arrays.copyOfRange`, `Arrays.equals(a, b)` and `Arrays.asList(...)`. `System.arraycopy` is the low-level fast copy.",
      ],
      [
        "Arrays are objects",
        "An array variable holds a reference, so assigning it shares the array and passing it to a method lets the method change its elements. Arrays are covariant (`String[]` is an `Object[]`), which can cause `ArrayStoreException` at runtime.",
      ],
    ],
    code: String.raw`import java.util.Arrays;

public class Main {
    static void doubleAll(int[] values) {          // receives a reference
        for (int i = 0; i < values.length; i++) values[i] *= 2;
    }

    public static void main(String[] args) {
        int[] empty = new int[3];
        int[] marks = {90, 45, 78, 62};
        System.out.println("defaults: " + Arrays.toString(empty) + ", length " + marks.length);

        int sum = 0, max = marks[0];
        for (int m : marks) { sum += m; max = Math.max(max, m); }
        System.out.println("sum=" + sum + " max=" + max);

        int[] sorted = Arrays.copyOf(marks, marks.length);
        Arrays.sort(sorted);
        System.out.println("sorted copy: " + Arrays.toString(sorted) + ", original: " + Arrays.toString(marks));
        System.out.println("binarySearch 78 -> index " + Arrays.binarySearch(sorted, 78));

        doubleAll(marks);
        System.out.println("after doubleAll: " + Arrays.toString(marks));

        int[][] matrix = {{1, 2, 3}, {4, 5, 6}};
        System.out.println("2D: " + Arrays.deepToString(matrix) + " rows=" + matrix.length + " cols=" + matrix[0].length);
        int[][] transposed = new int[3][2];
        for (int r = 0; r < 2; r++)
            for (int c = 0; c < 3; c++) transposed[c][r] = matrix[r][c];
        System.out.println("transposed: " + Arrays.deepToString(transposed));

        int[][] triangle = new int[4][];             // jagged
        for (int i = 0; i < triangle.length; i++) {
            triangle[i] = new int[i + 1];
            triangle[i][0] = triangle[i][i] = 1;
            for (int j = 1; j < i; j++) triangle[i][j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
        }
        for (int[] row : triangle) System.out.println("  " + Arrays.toString(row));

        try {
            marks[4] = 1;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("AIOOBE: " + e.getMessage());
        }
        Object[] objects = new String[1];
        try {
            objects[0] = 42;
        } catch (ArrayStoreException e) {
            System.out.println("ArrayStoreException: " + e.getMessage());
        }
    }
}`,
    walk:
      "`new int[3]` holds three zeros. A for-each loop totals the marks and finds the maximum. `Arrays.copyOf` makes an independent copy so sorting it leaves the original alone, and `binarySearch` finds 78 in the sorted copy.\n\n`doubleAll` changes the caller's array because it receives a reference to the same object. The 2D section prints a matrix and its transpose. The jagged `triangle` gives each row its own length and fills it with Pascal's triangle. Finally, writing index 4 of a length-4 array and storing an `Integer` in a `String[]` viewed as `Object[]` show the two array runtime errors.",
    anim: [
      "A 2D array is an array of arrays",
      [
        ["ref", "matrix", "reference"],
        ["outer", "int[][]", "2 row refs"],
        ["row0", "row 0", "{1, 2, 3}"],
        ["row1", "row 1", "{4, 5, 6}"],
        ["cell", "matrix[1][2]", "= 6"],
      ],
      [
        ["ref", "outer", "points", "The variable matrix refers to an outer array of row references."],
        ["outer", "row0", "[0]", "Element 0 of the outer array refers to a separate int[] for row 0."],
        ["outer", "row1", "[1]", "Element 1 refers to row 1; rows could even have different lengths."],
        ["row1", "cell", "[2]", "matrix[1][2] first picks row 1, then column 2 inside it, giving 6."],
      ],
    ],
    mistakes: [
      "Using `length()` on an array; arrays have the field `length`, strings have the method `length()`.",
      "Printing an array with `System.out.println(arr)`, which prints something like `[I@1b6d3586`; use `Arrays.toString`.",
      "Comparing arrays with `==` or `equals`; use `Arrays.equals` (or `deepEquals` for 2D).",
    ],
    qa: [
      ["What is a jagged array?", "A multi-dimensional array whose rows have different lengths, possible because each row is a separate array."],
      ["What is the default value of elements in a new String array?", "`null` for every element."],
      ["How do you copy an array?", "`Arrays.copyOf`, `Arrays.copyOfRange`, `array.clone()` or `System.arraycopy`; plain assignment only copies the reference."],
    ],
    ex: [
      "Write code that rotates `int[] a = {1, 2, 3, 4, 5}` left by 2 positions to get `{3, 4, 5, 1, 2}`.",
      "Create `int[] r = new int[a.length];` and set `r[i] = a[(i + 2) % a.length]` for each i. `Arrays.toString(r)` prints `[3, 4, 5, 1, 2]`.",
    ],
  }),

  lesson("Arguments vs Parameters and Pass by Value", {
    intro:
      "Two pieces of terminology confuse many learners: the difference between arguments and parameters, and whether Java passes by value or by reference. Java always passes by value; for objects, the value passed is a copy of the reference. This lesson explains both with a program that proves it.",
    topics: [
      [
        "Parameters vs arguments",
        "Parameters (formal parameters) are the variables in a method declaration: in `int add(int a, int b)`, `a` and `b` are parameters. Arguments (actual parameters) are the values supplied when calling the method: in `add(2, 3)`, 2 and 3 are arguments. Parameters are local variables initialized with the arguments.",
      ],
      [
        "Copy by value for primitives",
        "When you pass a primitive, the method receives a copy of the value. Changing the parameter changes only the copy, so the caller's variable is unaffected.",
      ],
      [
        "Copy of the reference for objects",
        "When you pass an object, the method receives a copy of the reference. Both the caller's variable and the parameter point to the same object, so the method can change the object's state. But reassigning the parameter to a new object changes only the local copy; the caller still points to the original. That is why Java is pass-by-value, not pass-by-reference.",
      ],
      [
        "Copy by value vs copy by reference",
        "In true pass-by-reference (C++ `int&`, C# `ref`), the method can make the caller's variable point to something else. Java cannot do that; a classic test is that you cannot write a `swap(a, b)` method in Java that swaps the caller's two variables.",
      ],
    ],
    code: String.raw`public class Main {
    static class Box { int value; Box(int v) { value = v; } public String toString() { return "Box(" + value + ")"; } }

    static void changePrimitive(int number) {   // number is a parameter
        number = 99;
    }

    static void changeState(Box box) {          // copy of the reference
        box.value = 99;                          // same object: visible to caller
    }

    static void reassign(Box box) {
        box = new Box(500);                      // only the local copy changes
        box.value = 600;
    }

    static void swap(Box a, Box b) {
        Box temp = a; a = b; b = temp;           // swaps local copies only
    }

    public static void main(String[] args) {
        int count = 5;
        changePrimitive(count);                  // count is an argument
        System.out.println("primitive after call: " + count);

        Box box = new Box(1);
        changeState(box);
        System.out.println("state change visible: " + box);

        reassign(box);
        System.out.println("after reassign: " + box);

        Box first = new Box(1), second = new Box(2);
        swap(first, second);
        System.out.println("after swap: first=" + first + " second=" + second);

        String text = "hello";
        text.toUpperCase();                      // strings are immutable
        System.out.println("string unchanged: " + text);
    }
}`,
    walk:
      "`changePrimitive` modifies its own copy of 5, so `count` is still 5. `changeState` receives a copy of the reference, follows it to the same `Box` and sets its value to 99, which the caller sees.\n\n`reassign` points its local copy to a brand-new `Box`; the caller's `box` still refers to the original, so it stays `Box(99)`. `swap` only swaps its local references, proving Java does not pass by reference. Strings are immutable, so `toUpperCase` returns a new string and `text` is unchanged.",
    anim: [
      "Passing a copy of the reference",
      [
        ["caller", "caller: box", "reference"],
        ["param", "param: box", "copied ref"],
        ["obj", "Box(1)", "heap object"],
        ["new", "Box(500)", "new object"],
      ],
      [
        ["caller", "obj", "points", "The caller's variable refers to a Box object on the heap."],
        ["param", "obj", "copy", "The call copies the reference, so the parameter points to the same Box."],
        ["param", "obj", "value=99", "Changing box.value through the parameter changes the shared object."],
        ["param", "new", "reassign", "Reassigning the parameter points only the copy to a new Box; the caller is unaffected."],
      ],
    ],
    mistakes: [
      "Saying \"Java passes objects by reference\". It passes references by value.",
      "Expecting a method that reassigns its parameter to update the caller's variable; return the new value instead.",
    ],
    qa: [
      ["Is Java pass by value or pass by reference?", "Always pass by value. For objects the value is a copy of the reference, so methods can mutate the object but cannot rebind the caller's variable."],
      ["What is the difference between an argument and a parameter?", "A parameter is the variable in the method signature; an argument is the actual value passed in a call."],
      ["Can you write a swap method for two Integer variables in Java?", "Not one that swaps the caller's variables. You can swap elements inside an array or fields inside an object."],
    ],
    ex: [
      "Write a method that \"swaps\" two values by working on an array: `swap(int[] arr, int i, int j)`. Why does this one work?",
      "Swap `arr[i]` and `arr[j]` with a temp variable. It works because the method receives a copy of the reference to the same array object and changes that object's elements.",
    ],
  }),

  lesson("ASCII Values of Characters", {
    intro:
      "Every character is stored as a number. ASCII defines codes 0 to 127 for English letters, digits, punctuation and control characters, and Unicode extends that; Java's `char` uses UTF-16, whose first 128 values are exactly ASCII. This lesson shows how to get ASCII values, convert between characters and numbers, and use them in programs.",
    topics: [
      [
        "ASCII table basics",
        "0 to 31 and 127 are control characters (9 is tab, 10 is line feed, 13 is carriage return). 32 is space. 48 to 57 are digits '0' to '9'. 65 to 90 are 'A' to 'Z'. 97 to 122 are 'a' to 'z'. Uppercase and lowercase letters differ by exactly 32.",
      ],
      [
        "Character to ASCII value and back",
        "Cast or assign a `char` to an `int`: `int code = 'A';` gives 65. Cast an int to a `char` to get the character: `(char) 97` is 'a'. Arithmetic on chars produces ints, so `'a' + 1` is 98 while `(char) ('a' + 1)` is 'b'.",
      ],
      [
        "Common uses",
        "Converting a digit character to its value: `'7' - '0'` is 7. Changing case: `(char) (c - 32)` or better `Character.toUpperCase(c)`. Counting letters with an `int[26]` indexed by `c - 'a'`. Caesar ciphers and simple checksums.",
      ],
      [
        "Beyond ASCII: Unicode",
        "Java strings are Unicode, so `'é'` is 233 and `'₹'` is 8377. Characters outside the Basic Multilingual Plane (such as many emoji) need two `char`s (a surrogate pair); use `codePointAt` and `codePoints()` to handle them correctly.",
      ],
    ],
    code: String.raw`public class Main {
    public static void main(String[] args) {
        char[] samples = {'A', 'Z', 'a', 'z', '0', '9', ' ', '@'};
        for (char c : samples) System.out.print("'" + c + "'=" + (int) c + " ");
        System.out.println();

        System.out.print("A to E: ");
        for (int code = 65; code <= 69; code++) System.out.print((char) code);
        System.out.println();

        System.out.println("'a' + 1 = " + ('a' + 1) + ", (char) ('a' + 1) = " + (char) ('a' + 1));
        System.out.println("'a' - 'A' = " + ('a' - 'A'));
        System.out.println("digit value of '7' = " + ('7' - '0'));

        String word = "Hello";
        StringBuilder swapped = new StringBuilder();
        for (char c : word.toCharArray()) {
            if (c >= 'a' && c <= 'z') swapped.append((char) (c - 32));
            else if (c >= 'A' && c <= 'Z') swapped.append((char) (c + 32));
            else swapped.append(c);
        }
        System.out.println("case swapped: " + swapped);

        int[] counts = new int[26];
        for (char c : "banana".toCharArray()) counts[c - 'a']++;
        System.out.println("banana: a=" + counts['a' - 'a'] + " b=" + counts['b' - 'a'] + " n=" + counts['n' - 'a']);

        int asciiSum = 0;
        for (char c : "Java".toCharArray()) asciiSum += c;
        System.out.println("sum of ASCII values in Java = " + asciiSum);
        System.out.println("rupee sign code point = " + "₹".codePointAt(0));
    }
}`,
    walk:
      "Casting each sample `char` to `int` prints its code, and casting the ints 65 to 69 back to `char` prints ABCDE. Char arithmetic yields ints unless you cast back, uppercase and lowercase letters are 32 apart, and subtracting `'0'` turns a digit character into its numeric value.\n\nThe case-swapping loop adds or subtracts 32 based on the letter range. The counting array uses `c - 'a'` as an index from 0 to 25. The ASCII sum of \"Java\" is 74 + 97 + 118 + 97 = 386, and the rupee sign shows a Unicode code point beyond ASCII.",
    anim: [
      "From character to code and back",
      [
        ["ch", "'a'", "char"],
        ["code", "97", "int code"],
        ["plus", "97 + 1", "arithmetic"],
        ["res", "98", "int result"],
        ["cast", "(char) 98", "'b'"],
      ],
      [
        ["ch", "code", "widen", "A char is stored as a number; 'a' widens to the int 97."],
        ["code", "plus", "+ 1", "Arithmetic promotes chars to int, so 'a' + 1 is computed as 97 + 1."],
        ["plus", "res", "int", "The result is the int 98, not a character."],
        ["res", "cast", "narrow", "Casting back with (char) turns 98 into the character 'b'."],
      ],
    ],
    mistakes: [
      "Printing `'a' + 'b'` and expecting \"ab\"; it prints 195. Use `\"\" + 'a' + 'b'` or a StringBuilder.",
      "Using `c - 32` for case conversion on non-English text; use `Character.toUpperCase`.",
    ],
    qa: [
      ["How do you get the ASCII value of a character in Java?", "Assign or cast it to an int: `int code = (int) 'A';` gives 65."],
      ["What are the ASCII ranges for digits, uppercase and lowercase letters?", "Digits 48 to 57, uppercase 65 to 90, lowercase 97 to 122."],
      ["Is Java char ASCII?", "No, it is a 16-bit UTF-16 code unit; ASCII is just the first 128 values."],
    ],
    ex: [
      "Write a Caesar cipher that shifts lowercase letters by 3, wrapping around, so \"xyz\" becomes \"abc\".",
      "For each char c: `(char) ('a' + (c - 'a' + 3) % 26)`. \"xyz\" gives 'a', 'b', 'c'; \"java\" gives \"mdyd\".",
    ],
  }),
]);
