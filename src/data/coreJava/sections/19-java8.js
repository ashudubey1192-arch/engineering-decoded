import { lesson, section } from "../schema.js";

export default section("java-8", "Java 8 Features", [
  lesson("Java 8 Overview and Setting Up Java 8 on Windows", {
    intro:
      "Java 8 (March 2014) was the biggest change to the language since generics: lambdas, streams and the java.time API reshaped how Java is written, and it remained the most widely deployed version for a decade. This lesson lists the major Java 8 features, explains how to download, install and set up Java 8 on Windows, and how to run several JDK versions side by side.",
    topics: [
      [
        "Major Java 8 features",
        "Lambda expressions and functional interfaces (`java.util.function`), method references, the Stream API, default and static methods in interfaces, `Optional`, the new Date and Time API (`java.time`), Nashorn JavaScript engine, `CompletableFuture`, parallel array sorting, `StringJoiner` and `String.join`, `Base64`, repeatable and type annotations, and PermGen replaced by Metaspace.",
      ],
      [
        "Downloading and installing Java 8 on Windows",
        "Download a Java 8 JDK build (Eclipse Temurin 8, Amazon Corretto 8, Azul Zulu 8, or Oracle JDK 8 under its license terms), choose x64, and run the `.msi` installer. The default folder is like `C:\\Program Files\\Eclipse Adoptium\\jdk-8.0.x-hotspot`.",
      ],
      [
        "Setting up JAVA_HOME and PATH",
        "Set `JAVA_HOME` to the JDK 8 root and add `%JAVA_HOME%\\bin` to `PATH` (System Properties, Environment Variables), then open a new terminal and check `java -version`, which prints `1.8.0_xxx` because Java 8 still used the 1.x numbering.",
      ],
      [
        "Several JDKs side by side",
        "Install JDK 8 and a newer LTS together and switch by changing JAVA_HOME and PATH per terminal, using a version manager (SDKMAN!, jEnv) or the IDE's project SDK setting. Build tools can compile for Java 8 from a newer JDK with `--release 8`.",
      ],
    ],
    code: String.raw`import java.time.LocalDate;
import java.util.*;
import java.util.function.*;
import java.util.stream.Collectors;

public class Main {
    interface Greeter { String greet(String name); default String loud(String name) { return greet(name).toUpperCase(); } }

    public static void main(String[] args) {
        Greeter greeter = name -> "Hello " + name;                      // lambda
        System.out.println("lambda + default method: " + greeter.loud("java 8"));

        List<String> names = Arrays.asList("Ravi", "Asha", "Meera", "Neel");
        System.out.println("stream: " + names.stream().filter(n -> n.length() == 4).map(String::toUpperCase).sorted().collect(Collectors.toList()));

        Optional<String> longest = names.stream().max(Comparator.comparingInt(String::length));
        System.out.println("Optional: " + longest.orElse("none"));

        System.out.println("java.time: " + LocalDate.of(2014, 3, 18) + " was a " + LocalDate.of(2014, 3, 18).getDayOfWeek());
        System.out.println("String.join: " + String.join(" | ", names) + ", Base64: " + Base64.getEncoder().encodeToString("java8".getBytes()));

        Function<Integer, Integer> square = x -> x * x;
        BiFunction<Integer, Integer, Integer> add = Integer::sum;
        Supplier<List<String>> listMaker = ArrayList::new;
        Predicate<String> empty = String::isEmpty;
        System.out.println("functional interfaces: square(7)=" + square.apply(7) + ", add=" + add.apply(2, 3)
                + ", supplier=" + listMaker.get() + ", isEmpty(\"\")=" + empty.test(""));

        int[] numbers = {5, 3, 9, 1};
        Arrays.parallelSort(numbers);
        System.out.println("Arrays.parallelSort: " + Arrays.toString(numbers));

        String version = System.getProperty("java.version");
        System.out.println("Java 8 reports versions like 1.8.0_402; this JVM's version string starts with a digit: " + Character.isDigit(version.charAt(0)));
    }
}`,
    walk:
      "In a few lines the program uses most Java 8 headline features: a lambda implementing a functional interface that also has a default method, a stream pipeline with filter, map (via a method reference), sort and collect, an `Optional` result from `max`, the java.time API, `String.join` and `Base64`.\n\nIt also uses the standard functional interfaces `Function`, `BiFunction`, `Supplier` and `Predicate`, and `Arrays.parallelSort`. The last line notes that Java 8 itself reported versions as `1.8.0_xxx`, unlike today's `21.0.x` style.",
    anim: [
      "What Java 8 added",
      [
        ["lambda", "Lambdas", "x -> x * x"],
        ["fi", "Functional API", "Function, ..."],
        ["stream", "Streams", "filter, map"],
        ["opt", "Optional", "no nulls"],
        ["time", "java.time", "LocalDate"],
      ],
      [
        ["lambda", "fi", "implement", "A lambda is a compact implementation of a functional interface."],
        ["fi", "stream", "plug in", "Stream operations accept those functional interfaces as behaviour."],
        ["stream", "opt", "results", "Terminal operations such as max and findFirst return Optional instead of null."],
        ["opt", "time", "plus", "Alongside them came java.time, default methods and much more."],
      ],
    ],
    mistakes: [
      "Running a newer `java` while JAVA_HOME points to JDK 8 (or vice versa), causing UnsupportedClassVersionError.",
      "Compiling with a newer JDK for Java 8 using only `-source/-target` instead of `--release 8`, which can accidentally use newer APIs.",
    ],
    qa: [
      ["What are the main features of Java 8?", "Lambdas, functional interfaces, method references, Streams, default and static interface methods, Optional, java.time, Nashorn, CompletableFuture and Metaspace replacing PermGen."],
      ["How do you check the installed Java version?", "Run `java -version` (Java 8 shows 1.8.0_xxx) and `javac -version`."],
      ["What is UnsupportedClassVersionError?", "The error when a class compiled for a newer Java version is run on an older JVM, for example class file version 61 (Java 17) on Java 8."],
    ],
    ex: [
      "A library is compiled with Java 17 and your server runs Java 8. What happens at startup and what are your options?",
      "Loading its classes fails with UnsupportedClassVersionError (class file version 61.0, while Java 8 supports up to 52.0). Upgrade the server's Java, or use a library version built for Java 8 (`--release 8`).",
    ],
  }),

  lesson("Functional Interfaces", {
    intro:
      "A functional interface has exactly one abstract method, which makes it the target type for lambdas and method references. Java 8 added the `@FunctionalInterface` annotation and dozens of ready-made interfaces in `java.util.function`. This lesson explains the rules, the core interfaces (Function, Predicate, Consumer, Supplier and their variants), composing them, and writing your own.",
    topics: [
      [
        "What makes an interface functional",
        "Exactly one abstract method (the single abstract method, or SAM). Default methods, static methods and methods that override `Object` methods (like `equals`) do not count. Classic examples predate Java 8: `Runnable`, `Callable`, `Comparator`, `ActionListener`.",
      ],
      [
        "@FunctionalInterface",
        "Optional but recommended: the compiler then reports an error if the interface has zero or more than one abstract method, protecting it from accidental changes.",
      ],
      [
        "The core java.util.function interfaces",
        "`Function<T, R>` (`apply`, transforms T to R), `Predicate<T>` (`test`, returns boolean), `Consumer<T>` (`accept`, returns nothing), `Supplier<T>` (`get`, takes nothing), `UnaryOperator<T>` and `BinaryOperator<T>`, and two-argument versions `BiFunction`, `BiPredicate`, `BiConsumer`.",
      ],
      [
        "Primitive specialisations",
        "`IntPredicate`, `IntFunction<R>`, `ToIntFunction<T>`, `IntUnaryOperator`, `IntBinaryOperator`, `IntSupplier`, `IntConsumer` and the Long and Double equivalents avoid boxing in hot code.",
      ],
      [
        "Composition",
        "`Function.andThen` and `compose` chain transformations, `Predicate.and`, `or`, `negate` and `Predicate.not` combine conditions, `Consumer.andThen` runs two actions, and `Function.identity()` returns its input.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.function.*;

public class Main {
    @FunctionalInterface
    interface DiscountRule {
        double apply(double price);                          // the single abstract method
        default DiscountRule then(DiscountRule next) { return p -> next.apply(apply(p)); }
        static DiscountRule percent(double pct) { return p -> p * (1 - pct / 100); }
        boolean equals(Object other);                        // Object method: does not count
    }

    public static void main(String[] args) {
        DiscountRule festival = DiscountRule.percent(10);
        DiscountRule coupon = p -> p - 50;
        System.out.println("custom functional interface: 1000 -> " + festival.then(coupon).apply(1000));

        Function<String, Integer> length = String::length;
        Predicate<String> isLong = s -> s.length() > 4;
        Consumer<String> printer = s -> System.out.print("[" + s + "] ");
        Supplier<String> defaultName = () -> "guest";
        UnaryOperator<String> shout = String::toUpperCase;
        BinaryOperator<Integer> max = BinaryOperator.maxBy(Comparator.naturalOrder());
        BiFunction<String, Integer, String> repeat = String::repeat;

        System.out.println("Function: " + length.apply("lambda") + ", Predicate: " + isLong.test("java")
                + ", Supplier: " + defaultName.get() + ", UnaryOperator: " + shout.apply("hi")
                + ", BinaryOperator: " + max.apply(3, 9) + ", BiFunction: " + repeat.apply("ab", 3));
        System.out.print("Consumer: ");
        List.of("x", "y").forEach(printer);
        System.out.println();

        Function<Integer, Integer> plus2 = x -> x + 2, times3 = x -> x * 3;
        System.out.println("andThen (x+2)*3 for 5: " + plus2.andThen(times3).apply(5) + ", compose (x*3)+2: " + plus2.compose(times3).apply(5));

        Predicate<String> startsWithA = s -> s.startsWith("A");
        List<String> names = List.of("Asha", "Ravi", "Amitabh", "Al", "Neel");
        System.out.println("and: " + names.stream().filter(startsWithA.and(isLong)).toList()
                + ", or: " + names.stream().filter(startsWithA.or(isLong)).toList()
                + ", negate: " + names.stream().filter(startsWithA.negate()).toList()
                + ", Predicate.not: " + names.stream().filter(Predicate.not(isLong)).toList());

        IntPredicate even = n -> n % 2 == 0;
        ToIntFunction<String> len = String::length;
        IntBinaryOperator multiply = (a, b) -> a * b;
        System.out.println("primitive specialisations: even(4)=" + even.test(4) + ", len=" + len.applyAsInt("stream") + ", 6*7=" + multiply.applyAsInt(6, 7));
        Runnable classic = () -> System.out.println("Runnable is a functional interface too");
        classic.run();
    }
}`,
    walk:
      "`DiscountRule` has one abstract method plus a default method, a static factory and a redeclared `equals`, which does not count, so `@FunctionalInterface` accepts it. Chaining 10% off with a 50 coupon turns 1000 into 850.\n\nThe standard interfaces each play a role: `Function` maps, `Predicate` tests, `Consumer` acts, `Supplier` produces, and the operator variants keep the same type. `andThen` applies functions left to right while `compose` applies the argument first, so 5 gives 21 and 17. Predicates combine with `and`, `or`, `negate` and `Predicate.not`, and the int specialisations avoid boxing.",
    anim: [
      "The core four",
      [
        ["fn", "Function<T,R>", "T -> R"],
        ["pred", "Predicate<T>", "T -> boolean"],
        ["cons", "Consumer<T>", "T -> nothing"],
        ["sup", "Supplier<T>", "nothing -> T"],
        ["lambda", "lambda", "fits one of them"],
      ],
      [
        ["lambda", "fn", "transform", "s -> s.length() fits Function: it turns a value into another."],
        ["lambda", "pred", "test", "s -> s.isEmpty() fits Predicate: it answers yes or no."],
        ["lambda", "cons", "act", "s -> System.out.println(s) fits Consumer: it uses a value, returns nothing."],
        ["lambda", "sup", "produce", "() -> \"guest\" fits Supplier: it creates a value from nothing."],
      ],
    ],
    mistakes: [
      "Adding a second abstract method to an interface used with lambdas, breaking all callers (use @FunctionalInterface to catch it).",
      "Using `Function<Integer, Integer>` in hot loops instead of `IntUnaryOperator`.",
      "Writing a custom interface when a standard one fits.",
    ],
    qa: [
      ["What is a functional interface?", "An interface with exactly one abstract method, usable as the target of a lambda or method reference."],
      ["Is @FunctionalInterface mandatory?", "No; it only makes the compiler verify the single-abstract-method rule."],
      ["Can a functional interface have default and static methods?", "Yes, any number; only abstract methods are counted (and Object methods do not count)."],
      ["Name the four most important functional interfaces.", "Function (apply), Predicate (test), Consumer (accept) and Supplier (get)."],
    ],
    ex: [
      "Create a `Predicate<Integer>` that is true for numbers that are positive and even, using composition.",
      "`Predicate<Integer> positive = n -> n > 0; Predicate<Integer> even = n -> n % 2 == 0; Predicate<Integer> both = positive.and(even);` then `both.test(4)` is true and `both.test(-2)` is false.",
    ],
  }),

  lesson("Lambda Expressions and Lambda Scopes", {
    intro:
      "A lambda expression is an anonymous function: parameters, an arrow and a body, used wherever a functional interface is expected. Lambdas made Java code far more concise. This lesson covers lambda syntax, type inference, how lambdas capture variables (effectively final), what `this` means inside them, and how they differ from anonymous classes.",
    topics: [
      [
        "Syntax",
        "`() -> 42`, `x -> x * 2`, `(a, b) -> a + b`, `(String s) -> s.length()`, and block bodies `(a, b) -> { int sum = a + b; return sum; }`. Parentheses are optional for a single untyped parameter; braces and `return` are needed for multiple statements. Since Java 11 parameters can be `var`.",
      ],
      [
        "Target typing and inference",
        "A lambda has no type of its own; the compiler infers it from the context (an assignment, a method parameter, a return statement), and infers the parameter types from the functional interface's method. The same lambda text can be a `Predicate<String>` or a `Function<String, Boolean>` depending on where it is used.",
      ],
      [
        "Accessing local variables: effectively final",
        "A lambda can read local variables of the enclosing method only if they are final or effectively final (never reassigned). It captures their values. It cannot assign to them; use an `AtomicInteger`, an array holder or, better, a stream reduction.",
      ],
      [
        "Accessing fields and this",
        "Lambdas can read and modify instance and static fields freely. Inside a lambda, `this` refers to the enclosing instance (lambdas do not introduce a new scope), unlike an anonymous class, where `this` is the anonymous object. A lambda parameter cannot have the same name as a local variable in the enclosing scope.",
      ],
      [
        "Lambda vs anonymous class",
        "Lambdas only implement functional interfaces, have no state of their own, share the enclosing `this`, and are compiled with `invokedynamic` (no extra class file). Anonymous classes can implement any interface or extend a class, can have fields and several methods, and create a new scope.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.*;

public class Main {
    private int counter = 0;
    private static int instances = 0;
    private final String name = "outer object";

    void demoScopes() {
        int base = 10;                                     // effectively final
        // base = 11;                                      // would make the lambda below illegal
        IntUnaryOperator addBase = x -> x + base;          // captures base's value
        System.out.println("captured local: " + addBase.applyAsInt(5));

        Runnable incrementField = () -> { counter++; instances++; };   // fields can be modified
        incrementField.run();
        incrementField.run();
        System.out.println("fields modified by lambda: counter " + counter + ", static " + instances);

        Supplier<String> lambdaThis = () -> this.name;
        Supplier<String> anonymousThis = new Supplier<>() {
            private final String name = "anonymous object";
            public String get() { return this.name; }
        };
        System.out.println("this in lambda: " + lambdaThis.get() + ", this in anonymous class: " + anonymousThis.get());

        AtomicInteger total = new AtomicInteger();
        List.of(1, 2, 3).forEach(n -> total.addAndGet(n));   // mutate through a holder
        System.out.println("sum via AtomicInteger holder: " + total.get());
    }

    public static void main(String[] args) {
        Runnable noArgs = () -> System.out.println("no parameters");
        Function<Integer, Integer> oneParam = x -> x * 2;
        BinaryOperator<Integer> twoParams = (a, b) -> a + b;
        BiFunction<String, String, Integer> typed = (String a, String b) -> a.length() + b.length();
        BiFunction<Integer, Integer, Integer> block = (a, b) -> {
            int product = a * b;
            return product + 1;
        };
        Comparator<String> withVar = (var a, var b) -> a.compareToIgnoreCase(b);
        noArgs.run();
        System.out.println("one " + oneParam.apply(21) + ", two " + twoParams.apply(2, 3) + ", typed " + typed.apply("ab", "cde")
                + ", block " + block.apply(6, 7) + ", var params " + withVar.compare("java", "JAVA"));

        Predicate<String> asPredicate = s -> s.isEmpty();
        Function<String, Boolean> asFunction = s -> s.isEmpty();          // same text, different target type
        System.out.println("target typing: predicate " + asPredicate.test("") + ", function " + asFunction.apply("x"));

        new Main().demoScopes();

        List<String> cities = new ArrayList<>(List.of("pune", "agra", "delhi"));
        cities.sort((a, b) -> b.compareTo(a));
        cities.replaceAll(String::toUpperCase);
        cities.removeIf(c -> c.startsWith("A"));
        System.out.println("lambdas with collection methods: " + cities);
    }
}`,
    walk:
      "The first block shows every syntax form: no parameters, one parameter without parentheses, two parameters, explicit types, a block body with `return`, and `var` parameters. The same text `s -> s.isEmpty()` becomes a `Predicate` or a `Function` depending on its target type.\n\n`demoScopes` captures the effectively final local `base` (reassigning it would not compile), modifies instance and static fields freely, and shows that `this` in a lambda is the enclosing object while in an anonymous class it is the anonymous object itself. An `AtomicInteger` is used to accumulate from inside a lambda. Finally lambdas sort, transform and filter a list with `sort`, `replaceAll` and `removeIf`.",
    anim: [
      "What a lambda can see",
      [
        ["lambda", "x -> x + base", "lambda body"],
        ["local", "local base", "effectively final"],
        ["field", "counter field", "read and write"],
        ["self", "this", "enclosing object"],
        ["no", "base = 11", "not allowed"],
      ],
      [
        ["lambda", "local", "capture", "A lambda captures the value of an effectively final local variable."],
        ["lambda", "field", "access", "Fields are reached through the enclosing object, so they can be modified."],
        ["lambda", "self", "same this", "this inside the lambda is the enclosing instance, not the lambda."],
        ["no", "local", "forbidden", "Reassigning a captured local anywhere makes the lambda a compile error."],
      ],
    ],
    mistakes: [
      "Trying to change a local variable inside a lambda (`count++`).",
      "Writing long, multi-purpose lambdas; extract a named method and use a method reference.",
      "Expecting `this` in a lambda to refer to the lambda itself.",
    ],
    qa: [
      ["What is a lambda expression?", "A concise anonymous function `(params) -> body` that implements a functional interface."],
      ["Why must local variables used in lambdas be effectively final?", "The lambda captures a copy of the value and may run later or on another thread; forbidding reassignment keeps the copy consistent and avoids races."],
      ["What does this refer to inside a lambda?", "The enclosing instance; lambdas do not create a new scope for this."],
      ["What is the difference between a lambda and an anonymous class?", "Lambdas implement only functional interfaces, have no own state or this, and are compiled with invokedynamic; anonymous classes can extend classes, have fields and their own this."],
    ],
    ex: [
      "Rewrite `new Thread(new Runnable() { public void run() { System.out.println(\"hi\"); } }).start();` with a lambda.",
      "`new Thread(() -> System.out.println(\"hi\")).start();`.",
    ],
  }),

  lesson("Method References", {
    intro:
      "A method reference is a shorthand for a lambda that only calls an existing method: `String::toUpperCase` instead of `s -> s.toUpperCase()`. It makes stream pipelines read like prose. This lesson covers the four kinds of method references, how the compiler matches them to functional interfaces, and when a lambda is clearer.",
    topics: [
      [
        "Reference to a static method",
        "`ClassName::staticMethod`, such as `Integer::parseInt` (for `s -> Integer.parseInt(s)`) or `Math::max` (for `(a, b) -> Math.max(a, b)`).",
      ],
      [
        "Reference to an instance method of a particular object",
        "`object::method`, such as `System.out::println` (for `x -> System.out.println(x)`) or `validator::isValid`. The object is evaluated once, when the reference is created.",
      ],
      [
        "Reference to an instance method of an arbitrary object of a type",
        "`ClassName::instanceMethod`, where the first parameter becomes the receiver: `String::length` (for `s -> s.length()`) and `String::compareToIgnoreCase` (for `(a, b) -> a.compareToIgnoreCase(b)`).",
      ],
      [
        "Reference to a constructor",
        "`ClassName::new`, such as `ArrayList::new` (Supplier), `StringBuilder::new` with an argument (Function), and array constructors `int[]::new` (for `n -> new int[n]`), used by `toArray(String[]::new)`.",
      ],
      [
        "When to prefer a lambda",
        "Use a method reference when it reads naturally and there is exactly one call. Use a lambda when you need extra logic, argument reordering or when overloaded methods make the reference ambiguous.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.function.*;
import java.util.stream.Collectors;

public class Main {
    record Employee(String name, int salary) {
        static int compareBySalary(Employee a, Employee b) { return Integer.compare(a.salary, b.salary); }
        boolean earnsMoreThan(int amount) { return salary > amount; }
    }

    static class Validator {
        private final int minLength;
        Validator(int minLength) { this.minLength = minLength; }
        boolean isValid(String s) { return s.length() >= minLength; }
    }

    public static void main(String[] args) {
        List<String> raw = List.of("42", "7", "19");
        List<Integer> numbers = raw.stream().map(Integer::parseInt).toList();          // 1. static
        System.out.println("static Integer::parseInt: " + numbers + ", Math::max reduce: " + numbers.stream().reduce(Math::max).orElseThrow());

        Validator validator = new Validator(5);
        List<String> words = List.of("java", "streams", "lambda", "jdk");
        System.out.println("particular object validator::isValid: " + words.stream().filter(validator::isValid).toList());  // 2.
        System.out.print("System.out::println prints each: ");
        words.stream().limit(2).forEach(System.out::print);                          // 2. particular object
        System.out.println();

        System.out.println("arbitrary object String::length: " + words.stream().map(String::length).toList());   // 3.
        List<String> sorted = new ArrayList<>(List.of("banana", "Apple", "cherry"));
        sorted.sort(String::compareToIgnoreCase);                                    // 3. two parameters
        System.out.println("String::compareToIgnoreCase sort: " + sorted);

        Supplier<List<String>> listFactory = ArrayList::new;                         // 4. constructor
        Function<String, StringBuilder> builder = StringBuilder::new;
        IntFunction<int[]> arrayMaker = int[]::new;
        String[] asArray = words.stream().toArray(String[]::new);
        System.out.println("constructor refs: " + listFactory.get() + ", " + builder.apply("abc").reverse()
                + ", int[]::new length " + arrayMaker.apply(4).length + ", toArray(String[]::new) " + Arrays.toString(asArray));

        List<Employee> staff = List.of(new Employee("Asha", 90), new Employee("Ravi", 70), new Employee("Meera", 120));
        System.out.println("static method as Comparator: " + staff.stream().sorted(Employee::compareBySalary).map(Employee::name).toList());
        BiPredicate<Employee, Integer> earns = Employee::earnsMoreThan;              // receiver + argument
        System.out.println("Employee::earnsMoreThan as BiPredicate: " + earns.test(staff.get(0), 80));
        Map<String, Integer> byName = staff.stream().collect(Collectors.toMap(Employee::name, Employee::salary, (a, b) -> a, TreeMap::new));
        System.out.println("toMap with references and TreeMap::new: " + byName);

        Function<Integer, String> lambdaClearer = n -> "#" + (n + 1);               // extra logic: lambda is better
        System.out.println("when extra logic is needed use a lambda: " + numbers.stream().map(lambdaClearer).toList());
    }
}`,
    walk:
      "`Integer::parseInt` and `Math::max` refer to static methods. `validator::isValid` and `System.out::print` are bound to particular objects created before the stream runs. `String::length` and `String::compareToIgnoreCase` refer to instance methods of whatever string is passed in; for the comparator, the first argument becomes the receiver.\n\nConstructor references create lists, builders and arrays, including `toArray(String[]::new)`. A static method with two `Employee` parameters works as a comparator, and the instance method `earnsMoreThan(int)` becomes a `BiPredicate<Employee, Integer>`. `Collectors.toMap` combines several references, while the last line keeps a lambda because it adds logic.",
    anim: [
      "Four kinds of method references",
      [
        ["stat", "Integer::parse..", "static method"],
        ["bound", "obj::isValid", "particular object"],
        ["unbound", "String::length", "arbitrary obj"],
        ["ctor", "ArrayList::new", "constructor"],
        ["lambda", "same lambda", "what it means"],
      ],
      [
        ["stat", "lambda", "s -> ...", "Integer::parseInt means s -> Integer.parseInt(s)."],
        ["bound", "lambda", "s -> v...", "validator::isValid means s -> validator.isValid(s) for that one object."],
        ["unbound", "lambda", "s -> s...", "String::length means s -> s.length(): the argument is the receiver."],
        ["ctor", "lambda", "() -> new", "ArrayList::new means () -> new ArrayList<>()."],
      ],
    ],
    mistakes: [
      "Using method references for overloaded methods where the compiler cannot decide which one you mean.",
      "Confusing bound (`obj::m`) and unbound (`Type::m`) references.",
      "Forcing a method reference when a lambda would be clearer.",
    ],
    qa: [
      ["What is a method reference?", "A compact form of a lambda that just calls an existing method or constructor, written Class::method, object::method or Class::new."],
      ["What are the four types of method references?", "Static method, instance method of a particular object, instance method of an arbitrary object of a type, and constructor references."],
      ["What does String::compareToIgnoreCase mean as a Comparator<String>?", "(a, b) -> a.compareToIgnoreCase(b): the first parameter is the receiver."],
    ],
    ex: [
      "Rewrite `names.stream().map(n -> n.trim()).filter(n -> !n.isEmpty()).forEach(n -> System.out.println(n))` with method references.",
      "`names.stream().map(String::trim).filter(Predicate.not(String::isEmpty)).forEach(System.out::println)`.",
    ],
  }),

  lesson("Default and Static Methods in Interfaces", {
    intro:
      "Before Java 8, adding a method to an interface broke every implementation. Java 8 allowed interfaces to contain method bodies: default methods (inherited by implementing classes and overridable) and static methods (utilities on the interface itself). This lesson explains both, the rules for conflicts (the diamond problem), private interface methods (Java 9) and real examples from the JDK.",
    topics: [
      [
        "Default methods",
        "Declared with the `default` keyword and a body. Implementing classes inherit them automatically and may override them. They let library designers evolve interfaces, which is how `Collection.stream()`, `List.sort()`, `Iterable.forEach()` and `Map.getOrDefault()` were added without breaking existing code.",
      ],
      [
        "Static methods",
        "Belong to the interface and are called through it (`Comparator.naturalOrder()`, `List.of()`, `Map.entry()`), not through instances or implementing classes; they are not inherited. They keep utility methods next to the type instead of a separate helper class.",
      ],
      [
        "Conflict resolution rules",
        "1. Class wins: a method in the class or a superclass beats any interface default. 2. More specific interface wins: if B extends A and both define the default, B's is used. 3. Otherwise, if two unrelated interfaces provide the same default, the class must override it, and can call either with `A.super.method()`.",
      ],
      [
        "Private interface methods (Java 9)",
        "Private methods (and private static methods) share code between default methods without exposing it to implementers.",
      ],
      [
        "Limits",
        "Interfaces still cannot have instance fields or constructors, so default methods can only work through other interface methods. A default method cannot override an `Object` method such as `equals` or `toString`.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    interface PaymentGateway {
        String charge(double amount);                                 // abstract

        default String chargeWithReceipt(double amount) {             // default: inherited, overridable
            return charge(amount) + " | receipt #" + receiptNumber(amount);
        }

        private String receiptNumber(double amount) {                // private helper (Java 9)
            return String.valueOf((long) (amount * 7) % 1000);
        }

        static PaymentGateway sandbox() {                             // static factory on the interface
            return amount -> "SANDBOX charged " + amount;
        }
    }

    static class CardGateway implements PaymentGateway {
        public String charge(double amount) { return "CARD charged " + amount; }
    }

    static class UpiGateway implements PaymentGateway {
        public String charge(double amount) { return "UPI charged " + amount; }
        @Override public String chargeWithReceipt(double amount) { return charge(amount) + " | SMS receipt sent"; }
    }

    interface Walker { default String move() { return "walks"; } }
    interface Swimmer { default String move() { return "swims"; } }
    interface FastWalker extends Walker { default String move() { return "walks fast"; } }

    static class Duck implements Walker, Swimmer {
        @Override public String move() { return Walker.super.move() + " and " + Swimmer.super.move(); }   // must resolve
    }
    static class Runner implements Walker, FastWalker { }            // more specific interface wins
    static class Animal { public String move() { return "class method wins"; } }
    static class Robot extends Animal implements Walker { }           // class beats interface default

    public static void main(String[] args) {
        System.out.println(new CardGateway().chargeWithReceipt(100));
        System.out.println(new UpiGateway().chargeWithReceipt(100));
        System.out.println(PaymentGateway.sandbox().chargeWithReceipt(100));

        System.out.println("Duck " + new Duck().move() + "; Runner " + new Runner().move() + "; Robot " + new Robot().move());

        List<String> list = new ArrayList<>(List.of("pear", "apple", "fig"));
        list.sort(Comparator.naturalOrder());                         // default List.sort + static Comparator method
        list.forEach(s -> System.out.print(s + " "));                 // default Iterable.forEach
        System.out.println();
        Map<String, Integer> stock = Map.of("pen", 3);
        System.out.println("default Map.getOrDefault: " + stock.getOrDefault("ink", 0) + ", static Map.entry: " + Map.entry("k", "v"));
    }
}`,
    walk:
      "`PaymentGateway` has one abstract method, a default `chargeWithReceipt` that builds on it using a private helper, and a static factory `sandbox()` returning a lambda. `CardGateway` inherits the default, `UpiGateway` overrides it, and the sandbox lambda gets it for free.\n\nThe conflict examples show the three rules: `Duck` inherits two unrelated defaults and must override `move`, calling both with `Walker.super` and `Swimmer.super`; `Runner` gets `FastWalker`'s version because it is more specific; and `Robot` uses the method from its superclass, because a class method beats an interface default. The last lines use JDK default and static methods: `List.sort`, `Iterable.forEach`, `Comparator.naturalOrder`, `Map.getOrDefault` and `Map.entry`.",
    anim: [
      "Resolving a default method",
      [
        ["call", "obj.move()", "which one?"],
        ["cls", "class method?", "rule 1"],
        ["specific", "most specific", "rule 2"],
        ["conflict", "two unrelated", "rule 3"],
        ["override", "must override", "X.super.move()"],
      ],
      [
        ["call", "cls", "first", "If the class or a superclass declares move(), that method wins."],
        ["cls", "specific", "else", "Otherwise the default from the most specific interface is used."],
        ["specific", "conflict", "tie", "If two unrelated interfaces both provide a default, it is ambiguous."],
        ["conflict", "override", "resolve", "The class must override and may call either version with X.super.move()."],
      ],
    ],
    mistakes: [
      "Using default methods to add state-like behaviour to interfaces as if they were abstract classes.",
      "Calling a static interface method through an implementing class or instance (not allowed).",
      "Forgetting to resolve a default-method conflict, which is a compile error.",
    ],
    qa: [
      ["Why were default methods introduced?", "To let interfaces gain new methods (such as Collection.stream) without breaking existing implementations."],
      ["Are static interface methods inherited by implementing classes?", "No; they must be called through the interface name."],
      ["What happens if a class implements two interfaces with the same default method?", "It must override the method; it can delegate with InterfaceName.super.method()."],
      ["Can a default method override equals or hashCode?", "No; default methods cannot override Object's public methods."],
    ],
    ex: [
      "Add a default method `chargeTwice(double amount)` to PaymentGateway. Does CardGateway need to change?",
      "No. `default String chargeTwice(double a) { return charge(a) + \" & \" + charge(a); }` is inherited by every implementation automatically.",
    ],
  }),

  lesson("Creating Streams: From Collections, Integer and String Streams, Filter, Sort and Display", {
    intro:
      "A stream is a sequence of elements that you process with a pipeline of operations: a source, zero or more intermediate operations and one terminal operation. This lesson creates streams from an ArrayList and other sources, builds Integer and String streams, and filters, sorts and displays them, explaining lazy evaluation along the way.",
    topics: [
      [
        "What a stream is",
        "A stream does not store data; it carries elements from a source (collection, array, generator, file) through a pipeline. Intermediate operations (`filter`, `map`, `sorted`, `distinct`, `limit`) are lazy and return a new stream; nothing happens until a terminal operation (`forEach`, `collect`, `count`, `reduce`, `toList`) runs. A stream can be consumed only once.",
      ],
      [
        "Converting an ArrayList to a stream",
        "`list.stream()` (sequential) or `list.parallelStream()`. Works for any Collection, including lists of Integers and Strings. `Map` has no stream method; use `map.entrySet().stream()`, `keySet()` or `values()`.",
      ],
      [
        "Creating Integer and String streams directly",
        "`Stream.of(1, 2, 3)`, `Stream.of(\"a\", \"b\")`, `Arrays.stream(array)`, `Stream.iterate(1, n -> n * 2)`, `Stream.generate(supplier)`, `IntStream.range(0, 10)` and `rangeClosed`, `\"text\".chars()`, `Pattern.compile(\",\").splitAsStream(csv)`, `Files.lines(path)` and `Stream.empty()`, `Stream.ofNullable(x)` (Java 9).",
      ],
      [
        "Filter, sort and display",
        "`filter(predicate)` keeps matching elements; `sorted()` uses natural order and `sorted(comparator)` a custom one; `map` transforms; `distinct` removes duplicates; `forEach(System.out::println)` displays; `collect(Collectors.joining(\", \"))` builds a string; `toList()` (Java 16) collects into an unmodifiable list.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> marks = new ArrayList<>(List.of(72, 95, 41, 88, 60, 95, 33));
        List<String> cities = new ArrayList<>(List.of("Pune", "delhi", "Agra", "Mumbai", "Chennai"));

        Stream<Integer> markStream = marks.stream();                       // ArrayList -> stream
        System.out.println("passed marks sorted: " + markStream.filter(m -> m >= 50).sorted().toList());
        try {
            markStream.count();                                            // consumed already
        } catch (IllegalStateException e) {
            System.out.println("reusing a stream -> IllegalStateException");
        }

        System.out.println("distinct, descending: " + marks.stream().distinct().sorted(Comparator.reverseOrder()).toList());
        System.out.print("display with forEach: ");
        cities.stream().map(String::toUpperCase).sorted().forEach(c -> System.out.print(c + " "));
        System.out.println();
        System.out.println("joined: " + cities.stream().filter(c -> c.length() > 4).sorted(String.CASE_INSENSITIVE_ORDER).collect(Collectors.joining(", ", "[", "]")));

        Stream<Integer> ints = Stream.of(5, 3, 8);
        Stream<String> strings = Stream.of("x", "y", "z");
        System.out.println("Stream.of integers sum " + ints.mapToInt(Integer::intValue).sum() + ", strings " + strings.collect(Collectors.joining()));
        System.out.println("Arrays.stream: " + Arrays.stream(new String[] {"b", "a", "c"}).sorted().toList()
                + ", IntStream.rangeClosed(1,5): " + IntStream.rangeClosed(1, 5).boxed().toList());
        System.out.println("Stream.iterate powers of 2: " + Stream.iterate(1, n -> n * 2).limit(6).toList()
                + ", Stream.generate: " + Stream.generate(() -> "hi").limit(3).toList());
        System.out.println("chars(): " + "java".chars().mapToObj(c -> String.valueOf((char) c)).toList()
                + ", splitAsStream: " + Pattern.compile(",").splitAsStream("a,b,c").toList()
                + ", ofNullable(null) count: " + Stream.ofNullable(null).count());

        List<String> log = new ArrayList<>();
        Stream<String> lazy = cities.stream().filter(c -> { log.add("filter " + c); return c.startsWith("A"); });
        System.out.println("before terminal op, operations run: " + log.size());
        System.out.println("after findFirst: " + lazy.findFirst().orElse("none") + ", operations run: " + log);

        Map<String, Integer> stock = Map.of("pen", 3, "ink", 0, "pad", 7);
        System.out.println("map entries in stock, sorted: " + stock.entrySet().stream().filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey).sorted().toList());
    }
}`,
    walk:
      "`marks.stream()` turns the ArrayList into a stream; filtering and sorting give the passed marks, and reusing the consumed stream throws `IllegalStateException`. `distinct` with a reverse comparator removes the duplicate 95. Strings are upper-cased, sorted and displayed with `forEach`, or joined into one string with a prefix and suffix.\n\nStreams can also come from `Stream.of`, arrays, `IntStream.rangeClosed`, `iterate`, `generate`, a string's `chars()`, a regex split and `ofNullable`. The lazy example proves intermediate operations do nothing until a terminal operation runs, and then only as much as needed: `findFirst` stops after reaching \"Agra\". Maps are streamed through their entry set.",
    anim: [
      "A lazy stream pipeline",
      [
        ["src", "marks list", "source"],
        ["filter", "filter(>= 50)", "intermediate"],
        ["sort", "sorted()", "intermediate"],
        ["term", "toList()", "terminal"],
        ["out", "[60, 72, 88..]", "result"],
      ],
      [
        ["src", "filter", "lazy", "stream() and filter() only describe the pipeline; nothing runs yet."],
        ["filter", "sort", "lazy", "sorted() is also lazy; it will need all filtered elements."],
        ["term", "src", "pull", "The terminal operation starts the flow by pulling elements from the source."],
        ["term", "out", "collect", "Elements pass the filter, get sorted, and are collected into a list."],
      ],
    ],
    mistakes: [
      "Reusing a stream after a terminal operation.",
      "Expecting intermediate operations with side effects to run without a terminal operation.",
      "Modifying the source collection while streaming over it.",
    ],
    qa: [
      ["What is the difference between intermediate and terminal operations?", "Intermediate operations (filter, map, sorted) are lazy and return a stream; terminal operations (collect, forEach, count) trigger processing and produce a result."],
      ["How do you convert a List to a Stream?", "list.stream() or list.parallelStream()."],
      ["Can a stream be reused?", "No. After a terminal operation it is consumed; create a new stream from the source."],
      ["Is a stream a data structure?", "No. It does not store elements; it processes elements from a source on demand."],
    ],
    ex: [
      "From a list of names, print the distinct first letters in alphabetical order, joined by commas.",
      "`names.stream().map(n -> n.substring(0, 1).toUpperCase()).distinct().sorted().collect(Collectors.joining(\",\"))`.",
    ],
  }),

  lesson("Sequential vs Parallel Streams", {
    intro:
      "A parallel stream splits its data into chunks processed by multiple threads of the common ForkJoinPool, then combines the results. It can speed up large CPU-bound computations, or slow everything down and produce wrong results if misused. This lesson compares sequential and parallel streams, shows ordering, thread usage and side-effect problems, and gives guidelines for when parallelism pays off.",
    topics: [
      [
        "Creating parallel streams",
        "`collection.parallelStream()`, `stream.parallel()` and back with `sequential()`. The last call wins for the whole pipeline. `isParallel()` reports the mode.",
      ],
      [
        "How parallel streams work",
        "The source is split with a `Spliterator` into chunks, each processed by a worker from `ForkJoinPool.commonPool()` (plus the calling thread), and partial results are combined. Sources that split cheaply and evenly (arrays, ArrayList, IntStream.range) parallelise well; LinkedList and `Stream.iterate` split poorly.",
      ],
      [
        "Ordering",
        "`forEach` on a parallel stream processes elements in an unpredictable order; `forEachOrdered` keeps encounter order at some cost. `findAny` may return any element; `findFirst` must respect order. `unordered()` can make some operations cheaper.",
      ],
      [
        "Side effects and correctness",
        "Operations must be stateless and non-interfering. Adding to a shared `ArrayList` from a parallel `forEach` loses elements or throws; use `collect`, `reduce` or thread-safe collectors instead. Reduction identities and combiners must be correct (`reduce(0, Integer::sum)` is fine; subtraction is not associative).",
      ],
      [
        "When to use parallel streams",
        "Large data (typically 10,000+ elements), CPU-heavy per-element work, cheaply splittable sources and no shared mutable state. Avoid them for I/O, small collections, and in servers where the common pool is shared by all requests. Always measure.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.*;

public class Main {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; (long) i * i <= n; i++) if (n % i == 0) return false;
        return true;
    }

    public static void main(String[] args) {
        Set<String> threads = ConcurrentHashMap.newKeySet();
        long count = IntStream.rangeClosed(1, 2_000_000).parallel()
                .filter(n -> { threads.add(Thread.currentThread().getName().replaceAll("\\d+$", "N")); return isPrime(n); })
                .count();
        System.out.println("primes up to 2,000,000 (parallel): " + count + ", sequential gives the same: "
                + (count == IntStream.rangeClosed(1, 2_000_000).filter(Main::isPrime).count()));
        System.out.println("threads used include ForkJoinPool workers: " + threads.stream().anyMatch(t -> t.contains("ForkJoinPool")));

        long start = System.nanoTime();
        IntStream.rangeClosed(1, 3_000_000).filter(Main::isPrime).count();
        long seqMs = (System.nanoTime() - start) / 1_000_000;
        start = System.nanoTime();
        IntStream.rangeClosed(1, 3_000_000).parallel().filter(Main::isPrime).count();
        long parMs = (System.nanoTime() - start) / 1_000_000;
        System.out.println("CPU-heavy work faster in parallel on a multi-core machine: " + (parMs < seqMs));

        List<Integer> small = List.of(1, 2, 3, 4, 5, 6, 7, 8);
        StringBuilder unordered = new StringBuilder(), ordered = new StringBuilder();
        small.parallelStream().forEach(n -> { synchronized (unordered) { unordered.append(n); } });
        small.parallelStream().forEachOrdered(ordered::append);
        System.out.println("forEach order may vary: " + unordered.length() + " elements; forEachOrdered: " + ordered);
        System.out.println("findFirst respects order: " + small.parallelStream().filter(n -> n > 3).findFirst().orElseThrow());

        List<Integer> unsafe = new ArrayList<>();
        try {
            IntStream.range(0, 100_000).parallel().forEach(unsafe::add);      // shared mutable state
        } catch (RuntimeException e) {
            System.out.println("side effect threw " + e.getClass().getSimpleName());
        }
        System.out.println("side effects into ArrayList lost elements: " + (unsafe.size() != 100_000));
        List<Integer> safe = IntStream.range(0, 100_000).parallel().boxed().collect(Collectors.toList());
        System.out.println("collect() instead: " + safe.size() + " elements, in order: " + safe.get(99_999));

        System.out.println("reduce with sum (associative): " + IntStream.rangeClosed(1, 10).parallel().reduce(0, Integer::sum)
                + ", with subtraction (not associative) differs from sequential: "
                + (IntStream.rangeClosed(1, 10).parallel().reduce(0, (a, b) -> a - b) != IntStream.rangeClosed(1, 10).reduce(0, (a, b) -> a - b)));
        System.out.println("isParallel: " + small.stream().parallel().isParallel() + ", after sequential(): " + small.stream().parallel().sequential().isParallel());
    }
}`,
    varies: true,
    walk:
      "Counting primes up to two million in parallel gives exactly the same answer as the sequential stream, and the thread names show ForkJoinPool workers sharing the work. For this CPU-heavy task, the parallel version is faster on a multi-core machine.\n\n`forEach` on a parallel stream visits elements in an unpredictable order, while `forEachOrdered` and `findFirst` respect encounter order. Adding to a plain `ArrayList` from parallel threads loses elements (or throws), whereas `collect` builds a correct list in order. `reduce` with `Integer::sum` is safe in parallel, but a non-associative operation such as subtraction gives a different result than sequential.",
    anim: [
      "Splitting work across threads",
      [
        ["src", "1..2,000,000", "range"],
        ["split", "Spliterator", "split in chunks"],
        ["w1", "worker 1", "count chunk"],
        ["w2", "worker 2", "count chunk"],
        ["combine", "combine", "add counts"],
      ],
      [
        ["src", "split", "split", "The source is divided into chunks by its Spliterator."],
        ["split", "w1", "chunk", "A ForkJoinPool worker processes one chunk..."],
        ["split", "w2", "chunk", "...while other workers process other chunks at the same time."],
        ["w1", "combine", "merge", "Partial results are combined; this is only correct for stateless, associative operations."],
      ],
    ],
    mistakes: [
      "Parallelising small collections or I/O-bound work.",
      "Mutating shared collections from parallel stream operations.",
      "Using non-associative reductions or wrong identity values in parallel reduce.",
    ],
    qa: [
      ["What is the difference between sequential and parallel streams?", "Sequential streams process elements one at a time on the calling thread; parallel streams split the data and process chunks on the common ForkJoinPool's threads."],
      ["Which thread pool do parallel streams use?", "ForkJoinPool.commonPool(), sized to the number of cores minus one by default, plus the calling thread."],
      ["When should you use parallel streams?", "For large, easily splittable data with CPU-intensive, stateless, side-effect-free operations, after measuring."],
    ],
    ex: [
      "Why is `Stream.iterate(1, n -> n + 1).limit(1_000_000).parallel().reduce(0, Integer::sum)` usually slower than `IntStream.rangeClosed(1, 1_000_000).parallel().sum()`?",
      "`iterate` produces elements one after another, so it cannot be split efficiently, and it boxes Integers; `IntStream.rangeClosed` splits into equal ranges instantly and works on primitives.",
    ],
  }),

  lesson("reduce() and Optional: OptionalInt, Optional and OptionalDouble", {
    intro:
      "`reduce` combines all elements of a stream into a single result, such as a sum, a maximum or a concatenation. When a stream may be empty, the result is wrapped in an `Optional`. This lesson covers the three forms of reduce on object streams, reducing IntStream and DoubleStream to `OptionalInt` and `OptionalDouble`, and using Optional values safely.",
    topics: [
      [
        "reduce with an identity",
        "`stream.reduce(identity, accumulator)`, for example `reduce(0, Integer::sum)`. The identity is the result for an empty stream and must be neutral (0 for sums, 1 for products, \"\" for concatenation). The accumulator must be associative for correct parallel results.",
      ],
      [
        "reduce without identity: Optional",
        "`stream.reduce(accumulator)` returns `Optional<T>`, empty if the stream had no elements, because there is no sensible answer. `reduce(Integer::max)` is the maximum or empty.",
      ],
      [
        "reduce with a combiner",
        "`reduce(identity, accumulator, combiner)` lets the result type differ from the element type (for example summing string lengths into an int); the combiner merges partial results in parallel streams.",
      ],
      [
        "IntStream and DoubleStream reductions",
        "`IntStream.reduce(0, Integer::sum)` returns an int; without identity it returns `OptionalInt`. `DoubleStream.reduce(Double::max)` returns `OptionalDouble`. Shortcuts: `sum()`, `min()`, `max()` (OptionalInt), `average()` (OptionalDouble) and `summaryStatistics()`.",
      ],
      [
        "Using Optional, OptionalInt and OptionalDouble",
        "`isPresent()`, `isEmpty()`, `orElse(default)`, `orElseGet(supplier)`, `orElseThrow()`, `ifPresent(consumer)`, `ifPresentOrElse`, `map`, `filter`, `flatMap` and `or` (Optional only). Primitive optionals use `getAsInt()` and `getAsDouble()`. Optional is meant for return values; do not use it for fields or parameters.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.stream.*;

public class Main {
    record Order(String id, double amount) { }

    static Optional<Order> findLargest(List<Order> orders) {
        return orders.stream().reduce((a, b) -> a.amount() >= b.amount() ? a : b);
    }

    public static void main(String[] args) {
        List<Integer> numbers = List.of(4, 8, 15, 16, 23, 42);
        int sum = numbers.stream().reduce(0, Integer::sum);                       // identity form
        int product = Stream.of(1, 2, 3, 4).reduce(1, (a, b) -> a * b);
        String sentence = Stream.of("streams", "are", "fun").reduce("", (a, b) -> a.isEmpty() ? b : a + " " + b);
        System.out.println("sum " + sum + ", product " + product + ", concatenation \"" + sentence + "\"");

        Optional<Integer> max = numbers.stream().reduce(Integer::max);           // no identity -> Optional
        Optional<Integer> none = Stream.<Integer>empty().reduce(Integer::max);
        System.out.println("max " + max.get() + ", max of empty: " + none + ", orElse(-1): " + none.orElse(-1));

        int totalLength = Stream.of("java", "lambda", "jdk").reduce(0, (acc, s) -> acc + s.length(), Integer::sum);   // combiner form
        System.out.println("total length with combiner: " + totalLength);

        IntStream ints = IntStream.of(7, 3, 9, 1);
        OptionalInt smallest = ints.reduce(Integer::min);
        System.out.println("IntStream reduce -> OptionalInt " + smallest + ", getAsInt " + smallest.getAsInt());
        System.out.println("IntStream.reduce(0, sum) of 1..100 = " + IntStream.rangeClosed(1, 100).reduce(0, Integer::sum));

        OptionalDouble highestTemp = DoubleStream.of(31.5, 29.0, 35.2, 33.8).reduce(Double::max);
        OptionalDouble averageTemp = DoubleStream.of(31.5, 29.0, 35.2, 33.8).average();
        System.out.printf("DoubleStream reduce -> OptionalDouble %.1f, average %.2f%n", highestTemp.getAsDouble(), averageTemp.getAsDouble());
        System.out.println("average of empty IntStream: " + IntStream.empty().average() + ", isPresent " + IntStream.empty().average().isPresent());

        List<Order> orders = List.of(new Order("A1", 250), new Order("A2", 990), new Order("A3", 410));
        findLargest(orders).ifPresent(o -> System.out.println("largest order: " + o.id()));
        String label = findLargest(List.of()).map(Order::id).orElseGet(() -> "no orders yet");
        System.out.println("empty list: " + label);
        System.out.println("map + filter on Optional: " + findLargest(orders).map(Order::amount).filter(a -> a > 500).isPresent());
        try {
            findLargest(List.of()).orElseThrow();
        } catch (NoSuchElementException e) {
            System.out.println("orElseThrow on empty -> NoSuchElementException");
        }
        IntSummaryStatistics stats = numbers.stream().mapToInt(Integer::intValue).summaryStatistics();
        System.out.println("summaryStatistics: " + stats);
    }
}`,
    walk:
      "With an identity, `reduce` always returns a plain value: the sum, the product (identity 1) and a sentence built from words. Without an identity it returns an `Optional`, which is empty for an empty stream, so `orElse` supplies a default. The three-argument form sums string lengths, a result type different from the element type, with `Integer::sum` as the combiner.\n\n`IntStream.reduce(Integer::min)` returns an `OptionalInt`, and `DoubleStream.reduce(Double::max)` and `average()` return `OptionalDouble`; the average of an empty stream is empty. `findLargest` returns an `Optional<Order>`, used with `ifPresent`, `map`, `orElseGet`, `filter` and `orElseThrow`. `summaryStatistics` gives count, sum, min, average and max in one pass.",
    anim: [
      "Reducing a stream step by step",
      [
        ["id", "identity 0", "start"],
        ["s1", "0 + 4 = 4", "accumulate"],
        ["s2", "4 + 8 = 12", "accumulate"],
        ["s3", "... + 42", "accumulate"],
        ["res", "108", "result"],
      ],
      [
        ["id", "s1", "first", "Reduction starts from the identity value 0."],
        ["s1", "s2", "next", "The accumulator combines the running result with the next element."],
        ["s2", "s3", "repeat", "This repeats for every element: 12, 27, 43, 66..."],
        ["s3", "res", "done", "After the last element (42) the result is 108; an empty stream would return 0."],
      ],
    ],
    mistakes: [
      "Calling `get()` on an Optional without checking it, which recreates the NullPointerException problem.",
      "Using a wrong identity (for example 1 for sums) or a non-associative accumulator.",
      "Using Optional for fields, parameters or collections.",
    ],
    qa: [
      ["What does reduce do?", "It combines stream elements into one result using an accumulator, optionally starting from an identity value."],
      ["Why does reduce without identity return Optional?", "Because an empty stream has no result; Optional makes the empty case explicit."],
      ["What are OptionalInt and OptionalDouble?", "Primitive versions of Optional returned by IntStream and DoubleStream operations such as reduce, min, max and average, avoiding boxing."],
      ["What is the difference between orElse and orElseGet?", "orElse always evaluates its argument; orElseGet only calls the supplier when the Optional is empty."],
    ],
    ex: [
      "Find the longest word in a list using reduce, returning \"none\" for an empty list.",
      "`words.stream().reduce((a, b) -> a.length() >= b.length() ? a : b).orElse(\"none\")`.",
    ],
  }),

  lesson("IntStream: Practical Examples", {
    intro:
      "`IntStream` is a stream of primitive ints with arithmetic operations built in, so it avoids boxing and makes number crunching concise. This lesson works through a series of practical examples: even numbers from 1 to 5, numbers greater than 2, even numbers greater than 2, the sum of 1 to 5, the sum of even numbers, max, min, count, average, and the sum plus 10.",
    topics: [
      [
        "Creating IntStreams",
        "`IntStream.range(1, 6)` (end exclusive), `rangeClosed(1, 5)` (end inclusive), `IntStream.of(...)`, `Arrays.stream(int[])`, `list.stream().mapToInt(Integer::intValue)`, `\"abc\".chars()` and `IntStream.iterate(1, i -> i + 2)`.",
      ],
      [
        "Filtering",
        "`filter(i -> i % 2 == 0)` keeps even numbers, `filter(i -> i > 2)` keeps numbers greater than 2, and filters can be chained or combined with `&&` for even numbers greater than 2.",
      ],
      [
        "Aggregates",
        "`sum()` returns an int; `max()` and `min()` return `OptionalInt`; `count()` returns a long; `average()` returns `OptionalDouble`; `summaryStatistics()` returns all of them at once.",
      ],
      [
        "Transforming and converting",
        "`map(i -> i * i)`, `mapToObj(i -> \"#\" + i)`, `boxed()` to get a `Stream<Integer>`, `asLongStream()`, `asDoubleStream()` and `toArray()`. A computed result such as the sum can then be used in further arithmetic, for example adding 10.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("1. even numbers 1..5:            " + IntStream.rangeClosed(1, 5).filter(i -> i % 2 == 0).boxed().toList());
        System.out.println("2. numbers greater than 2:        " + IntStream.rangeClosed(1, 5).filter(i -> i > 2).boxed().toList());
        System.out.println("3. even numbers greater than 2:   " + IntStream.rangeClosed(1, 10).filter(i -> i % 2 == 0 && i > 2).boxed().toList());
        System.out.println("4. sum of 1..5:                   " + IntStream.rangeClosed(1, 5).sum());
        System.out.println("5. sum of even numbers 1..10:     " + IntStream.rangeClosed(1, 10).filter(i -> i % 2 == 0).sum());
        int[] scores = {72, 95, 41, 88, 60};
        System.out.println("6. max of scores:                 " + Arrays.stream(scores).max().getAsInt());
        System.out.println("7. min of scores:                 " + Arrays.stream(scores).min().getAsInt());
        System.out.println("8. count of scores above 60:      " + Arrays.stream(scores).filter(s -> s > 60).count());
        System.out.printf ("9. average of scores:             %.1f%n", Arrays.stream(scores).average().orElse(0));
        System.out.println("10. sum of 1..5 plus 10:          " + (IntStream.rangeClosed(1, 5).sum() + 10));

        System.out.println("range(1, 6) vs rangeClosed(1, 5): " + IntStream.range(1, 6).boxed().toList() + " == " + IntStream.rangeClosed(1, 5).boxed().toList());
        System.out.println("squares: " + Arrays.toString(IntStream.rangeClosed(1, 5).map(i -> i * i).toArray()));
        System.out.println("mapToObj labels: " + IntStream.rangeClosed(1, 3).mapToObj(i -> "Q" + i).collect(Collectors.joining(" ")));
        System.out.println("odd numbers via iterate: " + IntStream.iterate(1, i -> i + 2).limit(5).boxed().toList());
        System.out.println("vowels in 'stream api': " + "stream api".chars().filter(c -> "aeiou".indexOf(c) >= 0).count());
        System.out.println("List<Integer> -> IntStream sum: " + List.of(10, 20, 30).stream().mapToInt(Integer::intValue).sum());
        System.out.println("statistics: " + Arrays.stream(scores).summaryStatistics());
        System.out.println("max of empty IntStream: " + IntStream.empty().max());
    }
}`,
    walk:
      "Each numbered line solves one exercise: filtering 1 to 5 for even numbers [2, 4] and for numbers greater than 2 [3, 4, 5], combining both conditions over 1 to 10 [4, 6, 8, 10], summing 1 to 5 (15) and the even numbers up to 10 (30), and computing the max (95), min (41), count above 60 (3), average (71.2) and the sum plus 10 (25).\n\nThe remaining lines show IntStream tools: `range` excludes the end while `rangeClosed` includes it, `map` squares, `mapToObj` builds labels, `iterate` generates odd numbers, `chars()` counts vowels, `mapToInt` converts a `List<Integer>`, `summaryStatistics` gives everything at once, and `max` of an empty stream is an empty `OptionalInt`.",
    anim: [
      "Even numbers greater than 2",
      [
        ["range", "rangeClosed", "1..10"],
        ["even", "i % 2 == 0", "keep evens"],
        ["gt2", "i > 2", "keep > 2"],
        ["boxed", "boxed()", "to Integers"],
        ["res", "[4, 6, 8, 10]", "result"],
      ],
      [
        ["range", "even", "test", "Each int from 1 to 10 is tested; odd numbers are dropped."],
        ["even", "gt2", "test", "The remaining even numbers must also be greater than 2, so 2 is dropped."],
        ["gt2", "boxed", "convert", "boxed() turns the primitive ints into Integer objects for the list."],
        ["boxed", "res", "collect", "toList() collects 4, 6, 8 and 10."],
      ],
    ],
    mistakes: [
      "Using `range(1, 5)` when you meant to include 5.",
      "Calling `getAsInt()` on max or min of a possibly empty stream.",
      "Boxing ints into Stream<Integer> just to sum them; stay with IntStream.",
    ],
    qa: [
      ["What is the difference between range and rangeClosed?", "range(a, b) excludes b; rangeClosed(a, b) includes b."],
      ["What does IntStream.max() return?", "An OptionalInt, empty if the stream is empty."],
      ["How do you convert an IntStream to a List<Integer>?", "intStream.boxed().toList() (or collect(Collectors.toList()))."],
    ],
    ex: [
      "Compute the sum of the squares of the odd numbers from 1 to 9.",
      "`IntStream.rangeClosed(1, 9).filter(i -> i % 2 == 1).map(i -> i * i).sum()` gives 1 + 9 + 25 + 49 + 81 = 165.",
    ],
  }),

  lesson("Short-Circuiting Operations and Infinite Streams", {
    intro:
      "Some stream operations can finish without looking at every element: `findFirst`, `findAny`, `anyMatch`, `allMatch`, `noneMatch` and `limit`. These short-circuiting operations make it possible to work with infinite streams safely. This lesson covers each one, shows exactly how many elements are processed, counts records greater than 2, and builds infinite streams with `iterate` and `generate`.",
    topics: [
      [
        "findFirst and findAny",
        "`findFirst()` returns the first element in encounter order as an Optional; `findAny()` returns any element, which is cheaper in parallel streams. Both stop as soon as one element passes the earlier operations.",
      ],
      [
        "anyMatch, allMatch and noneMatch",
        "`anyMatch(p)` stops at the first match (true); `allMatch(p)` stops at the first non-match (false); `noneMatch(p)` stops at the first match (false). On an empty stream, `anyMatch` is false while `allMatch` and `noneMatch` are true (vacuous truth).",
      ],
      [
        "limit and takeWhile",
        "`limit(n)` is a short-circuiting stateful intermediate operation: it passes at most n elements and then stops pulling from upstream. `takeWhile(p)` (Java 9) passes elements while the predicate holds; `dropWhile` skips them.",
      ],
      [
        "Infinite streams",
        "`Stream.iterate(seed, next)` and `Stream.generate(supplier)` never end on their own. They are safe only when followed by a short-circuiting operation (`limit`, `takeWhile`, `findFirst`, `anyMatch`); `forEach` or `count` on them never returns. `Stream.iterate(seed, hasNext, next)` (Java 9) has a built-in stop condition.",
      ],
      [
        "Counting matching records",
        "`count()` is not short-circuiting: it must see every element. `filter(n -> n > 2).count()` counts the records greater than 2, and on a sized source with no filter, Java 9+ may compute the count without running the pipeline at all.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.*;

public class Main {
    static AtomicInteger visited = new AtomicInteger();

    static Stream<Integer> tracked(List<Integer> list) {
        visited.set(0);
        return list.stream().peek(x -> visited.incrementAndGet());
    }

    public static void main(String[] args) {
        List<Integer> records = List.of(1, 2, 5, 8, 3, 9, 4);

        System.out.println("findFirst > 4: " + tracked(records).filter(n -> n > 4).findFirst().orElse(-1) + ", elements visited " + visited);
        System.out.println("findAny > 4 (sequential): " + tracked(records).filter(n -> n > 4).findAny().orElse(-1) + ", visited " + visited);
        System.out.println("anyMatch even: " + tracked(records).anyMatch(n -> n % 2 == 0) + ", visited " + visited);
        System.out.println("allMatch < 6: " + tracked(records).allMatch(n -> n < 6) + ", visited " + visited);
        System.out.println("noneMatch > 100: " + tracked(records).noneMatch(n -> n > 100) + ", visited " + visited);
        System.out.println("count of records greater than 2: " + tracked(records).filter(n -> n > 2).count() + ", visited " + visited + " (count is not short-circuiting)");
        System.out.println("empty stream: anyMatch " + Stream.empty().anyMatch(x -> true) + ", allMatch " + Stream.empty().allMatch(x -> false)
                + ", noneMatch " + Stream.empty().noneMatch(x -> true));

        System.out.println("limit(3): " + tracked(records).limit(3).toList() + ", visited " + visited);
        System.out.println("takeWhile < 6: " + records.stream().takeWhile(n -> n < 6).toList() + ", dropWhile < 6: " + records.stream().dropWhile(n -> n < 6).toList());

        System.out.println("infinite iterate, first 8 multiples of 7: " + Stream.iterate(7, n -> n + 7).limit(8).toList());
        Random random = new Random(42);
        System.out.println("infinite generate, 5 seeded dice rolls: " + Stream.generate(() -> random.nextInt(6) + 1).limit(5).toList());
        System.out.println("first square above 1000 from an infinite stream: " + IntStream.iterate(1, i -> i + 1).map(i -> i * i).filter(sq -> sq > 1000).findFirst().getAsInt());
        System.out.println("iterate with stop condition: " + Stream.iterate(1, n -> n <= 100, n -> n * 3).toList());
        System.out.println("Fibonacci (first 10): " + Stream.iterate(new long[] {0, 1}, f -> new long[] {f[1], f[0] + f[1]}).limit(10).map(f -> f[0]).toList());
    }
}`,
    walk:
      "`peek` counts how many elements each operation actually pulls. `findFirst` stops after visiting 3 elements (it finds 5), `anyMatch(even)` stops at the second element, `allMatch(< 6)` stops at 8, the first failure, and `noneMatch` has to visit all 7 because nothing matches. `count` always visits every element; 5 records are greater than 2. On an empty stream, `anyMatch` is false and the other two are vacuously true.\n\n`limit(3)` pulls exactly three elements, and `takeWhile`/`dropWhile` split the list at the first element of 6 or more. The infinite streams are tamed by `limit`, `findFirst` or the three-argument `iterate`: multiples of 7, seeded dice rolls, the first square above 1000 (1024), powers of 3 up to 100, and the Fibonacci sequence.",
    anim: [
      "anyMatch stops early",
      [
        ["e1", "1", "odd"],
        ["e2", "2", "even: match"],
        ["e3", "5", "never visited"],
        ["rest", "8, 3, 9, 4", "never visited"],
        ["res", "true", "visited 2"],
      ],
      [
        ["e1", "e2", "next", "anyMatch tests 1: not even, so it pulls the next element."],
        ["e2", "res", "match", "2 is even, so the answer is already known: true."],
        ["e2", "e3", "stop", "The pipeline stops pulling; 5 is never visited."],
        ["rest", "res", "skipped", "The remaining elements are skipped, which is what makes infinite streams usable."],
      ],
    ],
    mistakes: [
      "Calling `count()` or `forEach` on an infinite stream (it never ends).",
      "Putting `sorted()` before `limit` on an infinite stream; sorted needs every element.",
      "Assuming `findAny` returns the first element in parallel streams.",
    ],
    qa: [
      ["What are short-circuiting operations?", "Operations that can finish without processing all elements: findFirst, findAny, anyMatch, allMatch, noneMatch (terminal) and limit, takeWhile (intermediate)."],
      ["How do you create an infinite stream?", "Stream.iterate(seed, next) or Stream.generate(supplier); stop it with limit, takeWhile or a short-circuiting terminal operation."],
      ["What does allMatch return for an empty stream?", "true (vacuous truth); anyMatch returns false."],
    ],
    ex: [
      "Find the first 5 prime numbers using an infinite stream.",
      "`IntStream.iterate(2, i -> i + 1).filter(Main::isPrime).limit(5).boxed().toList()` gives [2, 3, 5, 7, 11].",
    ],
  }),

  lesson("Handling Exceptions in Streams", {
    intro:
      "Lambdas used in streams implement interfaces like `Function` whose methods do not declare checked exceptions, so calling a method that throws `IOException` inside `map` does not compile. Runtime exceptions, meanwhile, abort the whole pipeline. This lesson shows how exceptions behave in streams and the common patterns for handling them: wrapping, filtering out failures, returning Optional and collecting results with errors.",
    topics: [
      [
        "Checked exceptions do not compile in lambdas",
        "`files.stream().map(Files::readString)` fails to compile because `readString` throws `IOException` and `Function.apply` does not. You must handle the exception inside the lambda or wrap it.",
      ],
      [
        "Wrapping in an unchecked exception",
        "Catch the checked exception inside the lambda and rethrow `UncheckedIOException` (for I/O) or a custom runtime exception. A small helper, `unchecked(ThrowingFunction)`, removes the repetition. The first failure stops the pipeline.",
      ],
      [
        "Unchecked exceptions abort the pipeline",
        "If `Integer.parseInt` throws `NumberFormatException` for one element, the terminal operation throws and no result is produced, even if other elements were valid. Elements already processed are lost.",
      ],
      [
        "Skipping or collecting failures",
        "To continue past bad elements, catch inside the lambda and return an `Optional` (then `flatMap(Optional::stream)`), or map each element to a result object holding either a value or an error, then partition successes and failures with `Collectors.partitioningBy`.",
      ],
    ],
    code: String.raw`import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Main {
    @FunctionalInterface
    interface ThrowingFunction<T, R> { R apply(T t) throws Exception; }

    static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
        return t -> {
            try { return f.apply(t); }
            catch (IOException e) { throw new UncheckedIOException(e); }
            catch (Exception e) { throw new RuntimeException(e); }
        };
    }

    static Optional<Integer> tryParse(String s) {
        try { return Optional.of(Integer.parseInt(s.trim())); }
        catch (NumberFormatException e) { return Optional.empty(); }
    }

    record Result(String input, Integer value, String error) { boolean ok() { return error == null; } }

    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("stream-ex");
        Files.writeString(dir.resolve("a.txt"), "alpha");
        Files.writeString(dir.resolve("b.txt"), "beta");
        List<Path> good = List.of(dir.resolve("a.txt"), dir.resolve("b.txt"));
        List<Path> withMissing = List.of(dir.resolve("a.txt"), dir.resolve("missing.txt"), dir.resolve("b.txt"));

        // good.stream().map(Files::readString)   // does not compile: IOException is checked
        System.out.println("wrapped checked exception, all files ok: " + good.stream().map(unchecked(Files::readString)).toList());
        try {
            withMissing.stream().map(unchecked(Files::readString)).toList();
        } catch (UncheckedIOException e) {
            System.out.println("first failure stops the pipeline: " + e.getCause().getClass().getSimpleName());
        }

        List<String> inputs = List.of("10", "20", "x", " 30 ", "4.5");
        try {
            inputs.stream().map(Integer::parseInt).toList();
        } catch (NumberFormatException e) {
            System.out.println("unchecked exception aborts everything: " + e.getMessage());
        }

        List<Integer> parsed = inputs.stream().map(Main::tryParse).flatMap(Optional::stream).toList();
        System.out.println("skip bad elements with Optional: " + parsed);

        Map<Boolean, List<Result>> outcome = inputs.stream()
                .map(s -> {
                    try { return new Result(s, Integer.parseInt(s.trim()), null); }
                    catch (NumberFormatException e) { return new Result(s, null, e.getMessage()); }
                })
                .collect(Collectors.partitioningBy(Result::ok));
        System.out.println("successes: " + outcome.get(true).stream().map(Result::value).toList());
        System.out.println("failures:  " + outcome.get(false).stream().map(r -> r.input() + " (" + r.error() + ")").toList());

        String contents = withMissing.stream().map(p -> {
            try { return Files.readString(p); } catch (IOException e) { return "<unreadable " + p.getFileName() + ">"; }
        }).collect(Collectors.joining(", "));
        System.out.println("fallback value per element: " + contents);
    }
}`,
    walk:
      "The commented line shows that `Files::readString` cannot be used directly in `map`. The `unchecked` helper adapts a throwing function by wrapping `IOException` in `UncheckedIOException`; it works when every file exists, and stops at the first missing file otherwise.\n\nUnchecked exceptions behave the same way: one bad number aborts the whole `map(Integer::parseInt)` pipeline. Returning `Optional` from `tryParse` and using `flatMap(Optional::stream)` skips bad elements. Mapping each input to a `Result` record and using `partitioningBy` keeps both the values and the error messages. The last pipeline substitutes a fallback value for unreadable files.",
    anim: [
      "Keeping going past bad input",
      [
        ["in", "\"10\", \"x\", \"30\"", "inputs"],
        ["try", "try parse", "per element"],
        ["ok", "Result(value)", "success"],
        ["bad", "Result(error)", "failure"],
        ["part", "partitioningBy", "two lists"],
      ],
      [
        ["in", "try", "map", "Each input is parsed inside its own try-catch in the lambda."],
        ["try", "ok", "valid", "Valid numbers become successful Result objects."],
        ["try", "bad", "invalid", "Bad input becomes a Result carrying the error instead of throwing."],
        ["ok", "part", "collect", "partitioningBy separates successes and failures without stopping the stream."],
      ],
    ],
    mistakes: [
      "Swallowing exceptions silently inside lambdas (return null or ignore).",
      "Wrapping every checked exception in a generic RuntimeException and losing its type.",
      "Expecting partial results after an exception aborted the pipeline.",
    ],
    qa: [
      ["Why can't you call a method that throws IOException inside Stream.map?", "Function.apply does not declare checked exceptions, so the lambda must handle them or wrap them in an unchecked exception."],
      ["What happens when a lambda in a stream throws a RuntimeException?", "It propagates out of the terminal operation and aborts the whole pipeline."],
      ["How can you skip invalid elements instead of failing?", "Catch inside the lambda and return Optional.empty() (then flatMap(Optional::stream)), or map to a result type and partition."],
    ],
    ex: [
      "Write a pipeline that reads every `.txt` file in a directory and returns a `Map<String, Integer>` of file name to line count, skipping unreadable files.",
      "Stream `Files.list(dir)`, filter `.txt`, map each path to `Optional<Map.Entry<String, Integer>>` with a try-catch around `Files.readAllLines`, `flatMap(Optional::stream)`, then `collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))`.",
    ],
  }),

  lesson("Nashorn JavaScript Engine: Running JavaScript from Java", {
    intro:
      "Java 8 shipped Nashorn, a JavaScript engine running on the JVM through the `javax.script` API. It could evaluate JavaScript code, load script files, call JavaScript functions from Java, and parse JSON. Nashorn was deprecated in Java 11 and removed in Java 15; it now lives on as the standalone `org.openjdk.nashorn:nashorn-core` library. This lesson covers its core uses and the common troubleshooting issues.",
    topics: [
      [
        "Getting the engine",
        "`new ScriptEngineManager().getEngineByName(\"nashorn\")` (also \"js\" or \"javascript\"). On Java 8 to 14 it is built in; on Java 15+ add the `nashorn-core` dependency (and its ASM dependencies), otherwise `getEngineByName` returns null. GraalJS is the modern high-performance alternative.",
      ],
      [
        "Evaluating code and loading files",
        "`engine.eval(\"1 + 2\")` returns the result as a Java object. `engine.eval(new FileReader(\"script.js\"))` runs a file, and inside scripts `load(\"other.js\")` loads more files (or a URL, as people did with `underscore.js`). The special variable `__FILE__` prints the current script's location.",
      ],
      [
        "Calling JavaScript functions from Java",
        "Cast the engine to `Invocable` and call `invokeFunction(\"name\", args...)`, or `invokeMethod(object, \"name\", args)` for methods on script objects. `getInterface(Runnable.class)` turns script functions into Java interface implementations.",
      ],
      [
        "Printing, strings and JSON",
        "In scripts, `print(...)` writes to standard output (as does `java.lang.System.out.println`). JavaScript strings support `trim()`, `trimLeft()` and `trimRight()`. `JSON.parse` returns a script object, which Java sees as a `ScriptObjectMirror` that implements `Map`, so you can read its members with `get`.",
      ],
      [
        "Troubleshooting: access restriction errors",
        "In Eclipse with Java 8, `jdk.nashorn.api.scripting.NashornScriptEngine` could show \"Access restriction: The type is not API\". Code against the `javax.script` interfaces instead, or add an access rule allowing `jdk/nashorn/**` in the JRE library settings.",
      ],
    ],
    code: String.raw`import javax.script.*;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        if (engine == null) {
            System.out.println("Nashorn not found: add org.openjdk.nashorn:nashorn-core to the classpath on Java 15+");
            return;
        }

        Object sum = engine.eval("var a = 20; var b = 22; a + b;");
        System.out.println("eval result: " + sum + " (" + sum.getClass().getSimpleName() + ")");

        engine.eval("print('print() from JavaScript')");
        engine.eval("java.lang.System.out.println('System.out from JavaScript')");

        engine.eval("function greet(name) { return 'Namaste, ' + name.trim() + '!'; }"
                + "function square(n) { return n * n; }");
        Invocable invocable = (Invocable) engine;
        System.out.println("invokeFunction greet: " + invocable.invokeFunction("greet", "   Asha   "));
        System.out.println("invokeFunction square: " + invocable.invokeFunction("square", 12));

        Object parsed = engine.eval("JSON.parse('{\"name\":\"Ravi\",\"skills\":[\"java\",\"js\"],\"age\":31}')");
        @SuppressWarnings("unchecked")
        Map<String, Object> json = (Map<String, Object>) parsed;          // ScriptObjectMirror implements Map
        System.out.println("JSON via ScriptObjectMirror: name=" + json.get("name") + ", age=" + json.get("age"));

        System.out.println("trim functions: [" + engine.eval("'  padded  '.trimLeft()") + "] [" + engine.eval("'  padded  '.trimRight()") + "]");

        Runnable task = invocable.getInterface(engine.eval("({ run: function() { print('script object as a Java Runnable'); } })"), Runnable.class);
        task.run();
        engine.eval("var files = 'loaded scripts can print __FILE__'; print(files)");
    }
}`,
    mode: "compile",
    sample: String.raw`eval result: 42 (Integer)
print() from JavaScript
System.out from JavaScript
invokeFunction greet: Namaste, Asha!
invokeFunction square: 144
JSON via ScriptObjectMirror: name=Ravi, age=31
trim functions: [padded  ] [  padded]
script object as a Java Runnable
loaded scripts can print __FILE__`,
    walk:
      "The program asks `ScriptEngineManager` for the Nashorn engine and explains what to add if it is missing (on this course's JDK it compiles, and the sample output comes from running with the standalone `nashorn-core` library). `eval` runs JavaScript and returns 42 to Java. Scripts print with `print()` or with Java's `System.out` directly.\n\nAfter defining functions with `eval`, `Invocable.invokeFunction` calls them from Java with Java arguments. `JSON.parse` returns a `ScriptObjectMirror`, readable as a `Map`. The trim functions behave as in JavaScript, and `getInterface` turns a script object into a Java `Runnable`.",
    anim: [
      "Java and JavaScript via javax.script",
      [
        ["java", "Java code", "ScriptEngine"],
        ["engine", "Nashorn", "JS on the JVM"],
        ["js", "JS functions", "greet, square"],
        ["inv", "Invocable", "invokeFunction"],
        ["mirror", "ScriptObjMirror", "JS object as Map"],
      ],
      [
        ["java", "engine", "eval", "eval hands JavaScript source to the Nashorn engine running on the JVM."],
        ["engine", "js", "define", "Function definitions stay in the engine's global scope."],
        ["inv", "js", "call", "Invocable.invokeFunction calls a script function with Java arguments."],
        ["engine", "mirror", "objects", "Script objects come back to Java wrapped as ScriptObjectMirror (a Map)."],
      ],
    ],
    mistakes: [
      "Expecting Nashorn to exist on Java 15+ without adding the dependency.",
      "Coding against internal `jdk.nashorn` classes instead of the `javax.script` API.",
      "Evaluating untrusted scripts, which can call any Java class.",
    ],
    qa: [
      ["What is Nashorn?", "The JavaScript engine that shipped with Java 8 to 14, running JavaScript on the JVM through javax.script; now a separate library."],
      ["How do you call a JavaScript function from Java?", "Evaluate the script, cast the engine to Invocable and call invokeFunction(name, args)."],
      ["What replaced Nashorn?", "The standalone nashorn-core library or GraalVM's GraalJS engine."],
    ],
    ex: [
      "How would you run a JavaScript file `rules.js` and call its function `discount(total)` from Java?",
      "`engine.eval(new FileReader(\"rules.js\")); Object d = ((Invocable) engine).invokeFunction(\"discount\", 1500);`.",
    ],
  }),

  lesson("Nashorn and Java Interoperability", {
    intro:
      "Nashorn's real power was the two-way bridge between JavaScript and Java: scripts could use Java classes, receive Java objects, extend Java types, and Java could pass dates, collections and custom objects into scripts. This lesson covers passing Java objects (Date, Employee, arrays, ArrayList, HashMap, GregorianCalendar), binding objects into the script scope, importing Java packages, calling Java methods from JavaScript, converting arrays and lists, running threads, and extending Java classes with method overriding and super calls.",
    topics: [
      [
        "Passing Java objects into scripts",
        "Put objects into the engine's bindings (`engine.put(\"emp\", employee)`) or pass them as function arguments. Scripts can call their public methods and read JavaBean properties directly: `emp.name` calls `getName()`. `java.util.Date`, `GregorianCalendar`, `ArrayList` (indexable like a JS array: `list[0]`, `list.size()`) and `HashMap` (`map.get(k)` or `map[k]`) all work.",
      ],
      [
        "Using Java classes from JavaScript",
        "`Java.type(\"java.util.ArrayList\")` gets a class; `new ArrayList()` creates an instance. Static methods are called on the type (`Java.type(\"java.lang.Math\").max(1, 2)`). `importPackage` and `JavaImporter` (with the `mozilla_compat.js` script) bring whole packages into scope.",
      ],
      [
        "Converting arrays and lists",
        "`Java.from(javaArrayOrList)` converts a Java array or List into a JavaScript array; `Java.to(jsArray, \"int[]\")` converts a JavaScript array into a typed Java array such as `int[]` or `java.util.List`.",
      ],
      [
        "Extending Java types and overriding methods",
        "`Java.extend(Java.type(\"java.lang.Thread\"), { run: function() { ... } })` creates a subclass in JavaScript; a JavaScript object literal can implement an interface such as `Runnable`. `Java.super(obj).method()` calls the overridden parent implementation.",
      ],
      [
        "Threads",
        "Scripts can create and start Java threads with a Runnable implemented in JavaScript (`new Thread(function() { ... }).start()`), but the engine's global scope is not thread-safe; give each thread its own bindings or synchronize.",
      ],
    ],
    code: String.raw`import javax.script.*;
import java.util.*;

public class Main {
    public static class Employee {
        private final String name;
        private final double salary;
        public Employee(String name, double salary) { this.name = name; this.salary = salary; }
        public String getName() { return name; }
        public double getSalary() { return salary; }
        public String raise(double pct) { return name + " now earns " + (salary * (1 + pct / 100)); }
    }

    public static class Greeter {
        public String greet(String who) { return "Hello " + who; }
    }

    public static void main(String[] args) throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        if (engine == null) {
            System.out.println("Nashorn not found: add org.openjdk.nashorn:nashorn-core to the classpath on Java 15+");
            return;
        }

        engine.put("emp", new Employee("Asha", 90000));
        engine.put("today", new GregorianCalendar(2026, Calendar.NOVEMBER, 19));
        engine.put("when", new Date(0));
        engine.put("skills", new ArrayList<>(List.of("java", "sql", "js")));
        engine.put("stock", new HashMap<>(Map.of("pen", 3)));
        engine.put("scores", new int[] {7, 9, 4});

        engine.eval("print('JavaBean property: ' + emp.name + ', method call: ' + emp.raise(10))");
        engine.eval("print('GregorianCalendar year: ' + today.get(java.util.Calendar.YEAR) + ', Date millis: ' + when.getTime())");
        engine.eval("print('ArrayList indexed like JS: ' + skills[0] + ', size ' + skills.size())");
        engine.eval("print('HashMap: ' + stock.get('pen') + ' / ' + stock['pen'])");
        engine.eval("var jsArray = Java.from(scores); print('int[] -> JS array, sorted: ' + jsArray.sort())");

        Object javaInts = engine.eval("Java.to([3, 1, 2], 'int[]')");
        System.out.println("JS array -> int[]: " + Arrays.toString((int[]) javaInts));
        Object javaList = engine.eval("Java.to(['a', 'b'], 'java.util.List')");
        System.out.println("JS array -> java.util.List: " + javaList);

        engine.eval("var ArrayList = Java.type('java.util.ArrayList'); var l = new ArrayList(); l.add('made in JS'); print('Java.type: ' + l)");
        engine.eval("print('static method: ' + Java.type('java.lang.Math').max(17, 42))");

        engine.eval("var Thread = Java.type('java.lang.Thread');"
                + "var t = new Thread(function() { print('thread started from JavaScript'); }); t.start(); t.join();");

        engine.put("greeter", new Greeter());
        engine.eval("var Greeter = Java.type('Main$Greeter');"
                + "var Polite = Java.extend(Greeter, { greet: function(who) { return Java.super(polite).greet(who) + ', welcome!'; } });"
                + "var polite = new Polite();"
                + "print('overridden with super call: ' + polite.greet('Ravi'))");
    }
}`,
    mode: "compile",
    sample: String.raw`JavaBean property: Asha, method call: Asha now earns 99000.00000000001
GregorianCalendar year: 2026, Date millis: 0
ArrayList indexed like JS: java, size 3
HashMap: 3 / 3
int[] -> JS array, sorted: 4,7,9
JS array -> int[]: [3, 1, 2]
JS array -> java.util.List: [a, b]
Java.type: [made in JS]
static method: 42
thread started from JavaScript
overridden with super call: Hello Ravi, welcome!`,
    walk:
      "Java objects are bound into the script scope with `engine.put`. The script reads the employee's `name` property (which calls `getName()`), calls `raise`, reads a calendar field, indexes an `ArrayList` like a JavaScript array and reads a `HashMap` both ways. `Java.from` turns an `int[]` into a sortable JavaScript array, and `Java.to` turns JavaScript arrays into an `int[]` and a `java.util.List` returned to Java.\n\n`Java.type` gives scripts access to Java classes and static methods. A JavaScript function becomes a `Runnable` for a new Java `Thread`. Finally `Java.extend` subclasses the Java `Greeter` class in JavaScript, overriding `greet` and calling the parent implementation with `Java.super`. The output shown is a sample run with the standalone Nashorn library.",
    anim: [
      "Two-way bridge",
      [
        ["java", "Java objects", "Employee, List"],
        ["bind", "engine.put", "bindings"],
        ["script", "JavaScript", "emp.name"],
        ["type", "Java.type", "use Java classes"],
        ["extend", "Java.extend", "subclass in JS"],
      ],
      [
        ["java", "bind", "put", "Java puts objects into the script's bindings under a name."],
        ["bind", "script", "use", "The script calls their methods and reads bean properties naturally."],
        ["script", "type", "import", "Java.type lets the script create Java objects and call static methods."],
        ["type", "extend", "subclass", "Java.extend creates Java subclasses whose methods are written in JavaScript."],
      ],
    ],
    mistakes: [
      "Sharing one engine's global scope across threads without synchronization.",
      "Expecting JavaScript numbers to keep Java integer types (they often become doubles).",
      "Exposing powerful Java objects to untrusted scripts.",
    ],
    qa: [
      ["How do you pass a Java object to a Nashorn script?", "engine.put(\"name\", object) or pass it as an argument to invokeFunction; the script can then call its public methods."],
      ["How do you convert between JavaScript arrays and Java arrays?", "Java.from(javaArray) gives a JavaScript array; Java.to(jsArray, \"int[]\") gives a Java array."],
      ["How do you extend a Java class in Nashorn?", "Java.extend(Java.type(\"pkg.Class\"), { methodName: function() { ... } }), calling the parent with Java.super(obj).method()."],
    ],
    ex: [
      "In a script, sum the salaries in a `List<Employee>` passed from Java as `staff`.",
      "`var total = 0; for each (var e in staff) total += e.salary; total;` or `Java.from(staff).reduce(function(a, e) { return a + e.salary; }, 0)`.",
    ],
  }),
]);
