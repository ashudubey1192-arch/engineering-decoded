import { lesson, section } from "../schema.js";

export default section("beginner-programs", "Basic Programs for Beginners", [
  lesson("Arithmetic Programs: Add, Subtract, Multiply, Divide, Square, Cube and Square Root", {
    intro:
      "The first programs every Java learner writes read two numbers and do arithmetic on them. They teach variables, operators, `Scanner` input, integer versus floating-point division and the `Math` class. This lesson builds one program that adds, subtracts, multiplies and divides two numbers and computes square, cube and square root.",
    topics: [
      [
        "Reading numbers with Scanner",
        "`Scanner sc = new Scanner(System.in);` wraps standard input. `sc.nextInt()` and `sc.nextDouble()` read the next number, skipping whitespace. Close the Scanner when you are done (closing it also closes `System.in`).",
      ],
      [
        "Addition, subtraction, multiplication and division",
        "Use `+`, `-` and `*` directly. For division, decide whether you want integer division (`a / b` with ints, which truncates) or exact division (`(double) a / b`). Check for a zero divisor before dividing ints, because `a / 0` throws `ArithmeticException`.",
      ],
      [
        "Square and cube",
        "Square is `n * n` and cube is `n * n * n`. `Math.pow(n, 2)` also works but returns a `double` and is slower; for integer powers, plain multiplication is clearer. Use `long` when the result can exceed the `int` range (the cube of 2000 already does).",
      ],
      [
        "Square root",
        "`Math.sqrt(x)` returns the square root as a `double` and gives `NaN` for negative input. `Math.cbrt(x)` returns the cube root. Format results with `printf(\"%.2f\", value)` to control decimals.",
      ],
    ],
    code: String.raw`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter two integers: ");
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println();

        System.out.println(a + " + " + b + " = " + (a + b));
        System.out.println(a + " - " + b + " = " + (a - b));
        System.out.println(a + " * " + b + " = " + (a * b));
        if (b != 0) {
            System.out.println(a + " / " + b + " = " + (a / b) + " (integer division)");
            System.out.printf("%d / %d = %.2f (exact division)%n", a, b, (double) a / b);
            System.out.println(a + " % " + b + " = " + (a % b));
        } else {
            System.out.println("Cannot divide by zero");
        }

        System.out.print("Enter a number for square, cube and roots: ");
        double n = sc.nextDouble();
        System.out.println();
        System.out.println("square      = " + (n * n));
        System.out.println("cube        = " + (n * n * n));
        System.out.printf("square root = %.4f%n", Math.sqrt(n));
        System.out.printf("cube root   = %.4f%n", Math.cbrt(n));
        System.out.println("Math.pow(n, 2) = " + Math.pow(n, 2));

        long big = 2000;
        System.out.println("cube of 2000 as long = " + big * big * big + ", as int = " + (2000 * 2000 * 2000));
        sc.close();
    }
}`,
    stdin: "17 5\n9\n",
    walk:
      "The program reads 17 and 5 from standard input with `nextInt`, prints their sum, difference and product, and checks the divisor before dividing. It shows integer division (3), exact division with a cast (3.40) and the remainder (2).\n\nIt then reads 9 with `nextDouble` and prints its square, cube, square root and cube root, plus `Math.pow`. The last line shows why `long` matters: the cube of 2000 is 8,000,000,000, which overflows `int` and prints a wrong negative-looking number.",
    anim: [
      "Reading input and computing",
      [
        ["in", "System.in", "17 5 / 9"],
        ["sc", "Scanner", "nextInt()"],
        ["vars", "a=17, b=5", "variables"],
        ["ops", "+ - * / %", "operators"],
        ["out", "Console", "results"],
      ],
      [
        ["in", "sc", "tokens", "Scanner splits standard input into tokens separated by whitespace."],
        ["sc", "vars", "parse", "nextInt() parses 17 and 5 into int variables a and b."],
        ["vars", "ops", "compute", "Each operator computes a result; b != 0 is checked before dividing."],
        ["ops", "out", "print", "println and printf write the formatted results to the console."],
      ],
    ],
    mistakes: [
      "Dividing two ints and expecting a decimal result.",
      "Using `int` for a cube or factorial that overflows; use `long` or `BigInteger`.",
      "Calling `nextLine()` right after `nextInt()` and getting an empty string, because the newline is still in the buffer.",
    ],
    qa: [
      ["How do you read an integer from the keyboard?", "Create `Scanner sc = new Scanner(System.in);` and call `sc.nextInt()`."],
      ["What does Math.sqrt(-4) return?", "`NaN`, because the square root of a negative number is not a real number."],
      ["Why might `nextLine()` return an empty string after `nextInt()`?", "`nextInt()` leaves the line break in the input; the next `nextLine()` reads the rest of that line, which is empty."],
    ],
    ex: [
      "Extend the program to print the average of the two integers with exactly one decimal place.",
      "`System.out.printf(\"average = %.1f%n\", (a + b) / 2.0);` prints `average = 11.0` for 17 and 5. Dividing by `2.0` forces floating-point division.",
    ],
  }),

  lesson("Temperature Conversion, Grades with switch and a Calculator", {
    intro:
      "Three classic beginner programs combine arithmetic with decisions: converting temperatures between Fahrenheit and Celsius, turning marks into a grade with `switch`, and a menu-driven calculator. Together they practise formulas, integer division tricks, switch statements and loops.",
    topics: [
      [
        "Fahrenheit and Celsius conversion",
        "Celsius to Fahrenheit: `f = c * 9 / 5 + 32`. Fahrenheit to Celsius: `c = (f - 32) * 5 / 9`. Use `double` and write `9.0 / 5` so the division is not done in integers (with ints, `9 / 5` is 1 and the result is wrong).",
      ],
      [
        "Grade program with switch",
        "A switch needs discrete values, so divide marks by 10 to get a band: 95 / 10 is 9. Then `case 10, 9 -> 'A'`, `case 8 -> 'B'`, and so on. Validate the range (0 to 100) first.",
      ],
      [
        "Calculator program",
        "Read two numbers and an operator character, then `switch` on the operator to compute the result. Handle division by zero and unknown operators. Wrapping it in a loop that ends on a quit command turns it into a simple interactive calculator.",
      ],
    ],
    code: String.raw`import java.util.Scanner;

public class Main {
    static double toFahrenheit(double celsius) { return celsius * 9.0 / 5 + 32; }
    static double toCelsius(double fahrenheit) { return (fahrenheit - 32) * 5.0 / 9; }

    static char grade(int marks) {
        if (marks < 0 || marks > 100) return '?';
        return switch (marks / 10) {
            case 10, 9 -> 'A';
            case 8 -> 'B';
            case 7 -> 'C';
            case 6 -> 'D';
            default -> 'F';
        };
    }

    static String calculate(double a, char op, double b) {
        switch (op) {
            case '+': return String.valueOf(a + b);
            case '-': return String.valueOf(a - b);
            case '*': return String.valueOf(a * b);
            case '/': return b == 0 ? "error: divide by zero" : String.valueOf(a / b);
            case '%': return b == 0 ? "error: divide by zero" : String.valueOf(a % b);
            default:  return "error: unknown operator " + op;
        }
    }

    public static void main(String[] args) {
        System.out.printf("37 C = %.1f F%n", toFahrenheit(37));
        System.out.printf("98.6 F = %.1f C%n", toCelsius(98.6));
        System.out.printf("-40 C = %.1f F (the scales meet)%n", toFahrenheit(-40));
        System.out.println("wrong int formula 37 * 9 / 5 + 32 = " + (37 * 9 / 5 + 32) + ", (9 / 5) = " + (9 / 5));

        for (int marks : new int[] {100, 91, 85, 72, 64, 30, 120}) {
            System.out.print(marks + "->" + grade(marks) + " ");
        }
        System.out.println();

        Scanner sc = new Scanner(System.in);
        while (sc.hasNext()) {
            String first = sc.next();
            if (first.equals("q")) break;
            double a = Double.parseDouble(first);
            char op = sc.next().charAt(0);
            double b = sc.nextDouble();
            System.out.println(a + " " + op + " " + b + " = " + calculate(a, op, b));
        }
        System.out.println("Calculator closed");
    }
}`,
    stdin: "12 + 30\n7 / 2\n9 / 0\n5 ^ 2\nq\n",
    walk:
      "`toFahrenheit` and `toCelsius` use `9.0` and `5.0` so the division happens in floating point; 37 °C is 98.6 °F and -40 is the same on both scales. The next line shows the integer-division bug: `9 / 5` is 1.\n\n`grade` divides the marks by 10 and switches on the band, returning '?' for invalid marks. The calculator loop reads \"number operator number\" lines from input, switches on the operator, reports division by zero and unknown operators, and stops at `q`.",
    anim: [
      "Calculator switch",
      [
        ["in", "7 / 2", "input line"],
        ["parse", "a, op, b", "parsed"],
        ["sw", "switch (op)", "pick case"],
        ["div", "case '/'", "b != 0 ?"],
        ["out", "3.5", "result"],
      ],
      [
        ["in", "parse", "read", "Scanner reads the number, the operator character and the second number."],
        ["parse", "sw", "op = '/'", "switch compares the operator with each case label."],
        ["sw", "div", "match", "case '/' matches and first checks that the divisor is not zero."],
        ["div", "out", "a / b", "With doubles, 7 / 2 gives 3.5, which is printed."],
      ],
    ],
    mistakes: [
      "Writing `c * 9 / 5 + 32` with ints, which rounds away decimals.",
      "Forgetting `break` in the classic switch form, so every following case also runs.",
    ],
    qa: [
      ["How do you convert Celsius to Fahrenheit?", "`f = c * 9.0 / 5 + 32`."],
      ["How can a switch handle ranges of marks?", "Map the range to discrete values first, for example `marks / 10`, then switch on that band."],
      ["How do you read a single character with Scanner?", "Scanner has no `nextChar`; use `sc.next().charAt(0)`."],
    ],
    ex: [
      "Add a `^` (power) case to the calculator using `Math.pow`. What does `2 ^ 10` print?",
      "Add `case '^': return String.valueOf(Math.pow(a, b));`. `2.0 ^ 10.0` then prints `1024.0` instead of the unknown-operator error.",
    ],
  }),

  lesson("Power of Two, GCD and LCM", {
    intro:
      "Number-theory programs are interview favourites because they test loops, recursion and clever use of operators. This lesson covers checking whether a number is a power of two (three ways), finding the GCD (HCF) with Euclid's algorithm iteratively and recursively, and computing the LCM from the GCD.",
    topics: [
      [
        "Check whether a number is a power of two",
        "Loop method: keep dividing by 2 while the number is even; it is a power of two if you reach 1. Bit method: a power of two has exactly one set bit, so `n > 0 && (n & (n - 1)) == 0`. Library method: `Integer.bitCount(n) == 1`. Zero and negative numbers are not powers of two.",
      ],
      [
        "GCD / HCF with Euclid's algorithm",
        "The greatest common divisor (also called the highest common factor) is the largest number dividing both. Euclid's rule: `gcd(a, b) = gcd(b, a % b)` and `gcd(a, 0) = a`. It needs only a few steps even for large numbers. The brute-force alternative tries every divisor from `min(a, b)` downwards.",
      ],
      [
        "LCM",
        "The least common multiple is the smallest number divisible by both: `lcm(a, b) = a / gcd(a, b) * b`. Divide before multiplying to reduce overflow risk, and use `long` for large inputs. For several numbers, fold: `lcm(a, lcm(b, c))`.",
      ],
    ],
    code: String.raw`public class Main {
    static boolean isPowerOfTwoLoop(int n) {
        if (n <= 0) return false;
        while (n % 2 == 0) n /= 2;
        return n == 1;
    }

    static boolean isPowerOfTwoBits(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    static int gcdIterative(int a, int b) {
        while (b != 0) {
            int remainder = a % b;
            a = b;
            b = remainder;
        }
        return Math.abs(a);
    }

    static int gcdRecursive(int a, int b) {
        return b == 0 ? Math.abs(a) : gcdRecursive(b, a % b);
    }

    static long lcm(long a, long b) {
        return a / gcdIterative((int) a, (int) b) * b;
    }

    public static void main(String[] args) {
        for (int n : new int[] {1, 6, 16, 64, 100, 0, -8}) {
            System.out.printf("%4d power of two? loop=%-5b bits=%-5b bitCount=%b%n",
                    n, isPowerOfTwoLoop(n), isPowerOfTwoBits(n), n > 0 && Integer.bitCount(n) == 1);
        }

        int a = 84, b = 36;
        System.out.println("gcd(84, 36) iterative = " + gcdIterative(a, b));
        System.out.println("gcd(84, 36) recursive = " + gcdRecursive(a, b));
        System.out.print("Euclid steps: ");
        int x = a, y = b;
        while (y != 0) { System.out.print("(" + x + "," + y + ") "); int r = x % y; x = y; y = r; }
        System.out.println("-> " + x);
        System.out.println("lcm(84, 36) = " + lcm(a, b));
        System.out.println("lcm of 4, 6 and 10 = " + lcm(4, lcm(6, 10)));
    }
}`,
    walk:
      "Each candidate number is tested three ways. 1, 16 and 64 are powers of two; 6 and 100 are not; 0 and -8 are rejected by the `n > 0` check.\n\nEuclid's algorithm reduces (84, 36) to (36, 12) and then (12, 0), so the GCD is 12; the recursive version follows the same steps. The LCM is `84 / 12 * 36` = 252, and folding the LCM over 4, 6 and 10 gives 60.",
    anim: [
      "Euclid's algorithm",
      [
        ["s1", "(84, 36)", "84 % 36 = 12"],
        ["s2", "(36, 12)", "36 % 12 = 0"],
        ["s3", "(12, 0)", "b is 0"],
        ["gcd", "gcd = 12", "answer"],
        ["lcm", "lcm = 252", "84/12*36"],
      ],
      [
        ["s1", "s2", "a % b", "Replace (a, b) with (b, a % b): 84 % 36 leaves 12."],
        ["s2", "s3", "a % b", "36 % 12 is 0, so the pair becomes (12, 0)."],
        ["s3", "gcd", "stop", "When b reaches 0, a holds the greatest common divisor: 12."],
        ["gcd", "lcm", "formula", "LCM = a / gcd * b = 84 / 12 * 36 = 252."],
      ],
    ],
    mistakes: [
      "Treating 0 as a power of two: `0 & -1` is 0, so the bit trick needs the `n > 0` guard.",
      "Computing `a * b / gcd` with ints and overflowing for large inputs; divide first.",
    ],
    qa: [
      ["How do you check if a number is a power of two in O(1)?", "`n > 0 && (n & (n - 1)) == 0`."],
      ["What is Euclid's algorithm?", "Repeatedly replace (a, b) with (b, a % b) until b is 0; then a is the GCD."],
      ["How are GCD and LCM related?", "`gcd(a, b) * lcm(a, b) == a * b` for positive integers, so `lcm = a / gcd * b`."],
    ],
    ex: [
      "Find the GCD of all numbers in `{48, 180, 600}` and their LCM.",
      "Fold: gcd(48, 180) = 12, gcd(12, 600) = 12; lcm(48, 180) = 720, lcm(720, 600) = 3600.",
    ],
  }),

  lesson("Positive or Negative and Smallest and Largest in an Array", {
    intro:
      "Two more fundamentals: classifying a number as positive, negative or zero, and scanning an array for its smallest and largest elements in a single pass. They teach comparison, edge cases (zero, empty arrays, all-negative values) and the classic min/max loop pattern.",
    topics: [
      [
        "Check positive, negative or zero",
        "Compare with zero using an if-else ladder: `> 0` positive, `< 0` negative, otherwise zero. `Integer.signum(n)` returns 1, -1 or 0, and `Math.signum` does the same for doubles. For doubles also consider `-0.0` and `NaN`.",
      ],
      [
        "Smallest and largest number in an array",
        "Start `min` and `max` from the first element (not from 0, which fails for all-negative arrays), then loop over the rest updating them. One pass, O(n) time, O(1) extra space. Alternatives: `Arrays.stream(a).min()` or `IntSummaryStatistics`, or sorting (O(n log n), wasteful for this).",
      ],
      [
        "Edge cases",
        "An empty array has no minimum: throw an exception or return an empty `OptionalInt`. A single-element array has min equal to max. Track indexes as well if you need to know where the extremes are.",
      ],
    ],
    code: String.raw`import java.util.Arrays;
import java.util.IntSummaryStatistics;

public class Main {
    static String classify(int n) {
        if (n > 0) return "positive";
        else if (n < 0) return "negative";
        else return "zero";
    }

    static int[] minMax(int[] values) {
        if (values.length == 0) throw new IllegalArgumentException("empty array");
        int min = values[0], max = values[0];
        int minIndex = 0, maxIndex = 0;
        for (int i = 1; i < values.length; i++) {
            if (values[i] < min) { min = values[i]; minIndex = i; }
            if (values[i] > max) { max = values[i]; maxIndex = i; }
        }
        return new int[] {min, minIndex, max, maxIndex};
    }

    public static void main(String[] args) {
        for (int n : new int[] {25, -7, 0}) {
            System.out.println(n + " is " + classify(n) + " (signum " + Integer.signum(n) + ")");
        }

        int[] numbers = {42, -3, 17, 99, 0, -55, 8};
        int[] result = minMax(numbers);
        System.out.println("array: " + Arrays.toString(numbers));
        System.out.println("smallest = " + result[0] + " at index " + result[1]);
        System.out.println("largest  = " + result[2] + " at index " + result[3]);

        int[] allNegative = {-9, -4, -12};
        System.out.println("all negative: min=" + minMax(allNegative)[0] + " max=" + minMax(allNegative)[2]);

        IntSummaryStatistics stats = Arrays.stream(numbers).summaryStatistics();
        System.out.println("stream stats: min=" + stats.getMin() + " max=" + stats.getMax()
                + " avg=" + String.format("%.2f", stats.getAverage()));

        System.out.println("empty array min via stream: " + Arrays.stream(new int[0]).min());
        try {
            minMax(new int[0]);
        } catch (IllegalArgumentException e) {
            System.out.println("minMax on empty array: " + e.getMessage());
        }
    }
}`,
    walk:
      "`classify` uses an if-else ladder and `Integer.signum` confirms the result. `minMax` starts both extremes from the first element and updates them in one pass, also recording their indexes: -55 at index 5 and 99 at index 3.\n\nThe all-negative array proves why starting from 0 would be wrong (max would wrongly be 0). `summaryStatistics` gives min, max and average in one stream call, and an empty stream returns `OptionalInt.empty` while `minMax` throws a clear exception.",
    anim: [
      "Single-pass min and max",
      [
        ["init", "min=max=42", "first element"],
        ["e1", "-3", "new min"],
        ["e3", "99", "new max"],
        ["e5", "-55", "new min"],
        ["done", "min -55, max 99", "result"],
      ],
      [
        ["init", "e1", "compare", "Start from the first value, then -3 is smaller, so min becomes -3."],
        ["e1", "e3", "compare", "17 changes nothing; 99 is larger, so max becomes 99."],
        ["e3", "e5", "compare", "0 changes nothing; -55 is smaller than -3, so min becomes -55."],
        ["e5", "done", "finish", "After the last element, min and max hold the answers after one pass."],
      ],
    ],
    mistakes: [
      "Initialising `max = 0` or `min = 0`, which is wrong for all-negative or all-large arrays; start from `values[0]` or `Integer.MIN_VALUE`/`MAX_VALUE`.",
      "Sorting the array just to find min and max, which costs O(n log n) and changes the order.",
    ],
    qa: [
      ["How do you find min and max in one pass?", "Initialise both to the first element and update each while looping over the remaining elements: O(n) time."],
      ["What does Integer.signum return?", "1 for positive, -1 for negative and 0 for zero."],
      ["What should min of an empty array return?", "There is no valid answer: throw an exception or return an empty `OptionalInt`."],
    ],
    ex: [
      "Find the second largest distinct number in `{42, -3, 17, 99, 0, -55, 8, 99}` in one pass.",
      "Track `first` and `second` starting at `Integer.MIN_VALUE`; when a value is greater than `first`, move `first` to `second`; else if it is greater than `second` and different from `first`, update `second`. The answer is 42.",
    ],
  }),
]);
