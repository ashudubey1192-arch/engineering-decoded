import { lesson, section } from "../schema.js";

export default section("keywords", "Java Keywords", [
  lesson("Java Keywords List", {
    intro:
      "Keywords are words reserved by the language with a fixed meaning; you cannot use them as names for variables, methods or classes. Java has about 50 reserved keywords, a few reserved literals, and newer contextual keywords that are only special in certain positions. This lesson lists them by category and explains the special cases.",
    topics: [
      [
        "Reserved keywords by category",
        "Data types: `byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`, `void`. Flow control: `if`, `else`, `switch`, `case`, `default`, `for`, `while`, `do`, `break`, `continue`, `return`. Exceptions: `try`, `catch`, `finally`, `throw`, `throws`, `assert`. Classes and objects: `class`, `interface`, `enum`, `extends`, `implements`, `new`, `this`, `super`, `instanceof`, `package`, `import`. Modifiers: `public`, `protected`, `private`, `static`, `final`, `abstract`, `synchronized`, `volatile`, `transient`, `native`, `strictfp`. Unused: `goto`, `const`. Also `_` (underscore) since Java 9.",
      ],
      [
        "Reserved literals",
        "`true`, `false` and `null` are not technically keywords but literals; they are still reserved and cannot be identifiers.",
      ],
      [
        "Contextual (restricted) keywords",
        "Newer words are special only in specific places so that old code using them as names keeps compiling: `var` (local type inference, Java 10), `record` (Java 16), `yield` (switch expressions), `sealed`, `non-sealed` and `permits` (Java 17), `when` (pattern guards, Java 21), and module words such as `module`, `requires`, `exports`, `opens`, `uses`, `provides`, `with`, `to`, `transitive` and `open`. You can still name a variable `record` or `var`, but you cannot name a class `var`.",
      ],
      [
        "Keyword facts that interviews ask",
        "All keywords are lowercase, so `Class`, `String` and `Main` are not keywords. `main` is not a keyword either. `goto` and `const` are reserved but unused. `sizeof`, `delete` and `friend` from C++ do not exist in Java.",
      ],
    ],
    code: String.raw`import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Map<String, List<String>> keywords = new TreeMap<>();
        keywords.put("1 data types", List.of("byte", "short", "int", "long", "float", "double", "char", "boolean", "void"));
        keywords.put("2 flow control", List.of("if", "else", "switch", "case", "default", "for", "while", "do", "break", "continue", "return"));
        keywords.put("3 exceptions", List.of("try", "catch", "finally", "throw", "throws", "assert"));
        keywords.put("4 classes/objects", List.of("class", "interface", "enum", "extends", "implements", "new", "this", "super", "instanceof", "package", "import"));
        keywords.put("5 modifiers", List.of("public", "protected", "private", "static", "final", "abstract", "synchronized", "volatile", "transient", "native", "strictfp"));
        keywords.put("6 reserved, unused", List.of("goto", "const", "_"));
        int total = 0;
        for (var entry : keywords.entrySet()) {
            System.out.println(entry.getKey() + " (" + entry.getValue().size() + "): " + String.join(" ", entry.getValue()));
            total += entry.getValue().size();
        }
        System.out.println("total reserved keywords listed: " + total);
        System.out.println("reserved literals: true false null");

        // Contextual keywords can still be identifiers in most places
        var record = "record used as a variable name";
        int yield = 3, sealed = 4, permits = 5;
        String when = "when";
        System.out.println(record + "; yield+sealed+permits=" + (yield + sealed + permits) + "; " + when);

        // Keywords are case sensitive: these are ordinary identifiers
        String Int = "Int", CLASS = "CLASS", main = "main";
        System.out.println("legal identifiers: " + Int + " " + CLASS + " " + main);
    }
}`,
    walk:
      "A `TreeMap` keeps the categories in order, and the loop prints each category with its count; the total is 51 reserved words including `goto`, `const` and `_`. `var` itself is used in the loop for the entry type.\n\nThe second part shows that contextual keywords (`record`, `yield`, `sealed`, `permits`, `when`) are still valid variable names, and that capitalised versions of keywords (`Int`, `CLASS`) and `main` are ordinary identifiers because Java keywords are lowercase and case-sensitive.",
    anim: [
      "How the compiler treats a word",
      [
        ["word", "token", "e.g. class, var"],
        ["kw", "Reserved?", "50+ keywords"],
        ["err", "not a name", "compile error"],
        ["ctx", "Contextual?", "var, record ..."],
        ["id", "identifier", "allowed"],
      ],
      [
        ["word", "kw", "check", "The compiler first checks whether the word is a reserved keyword or literal."],
        ["kw", "err", "class", "Reserved words such as class or goto can never be used as identifiers."],
        ["word", "ctx", "check", "Words like var, record and yield are special only in certain positions."],
        ["ctx", "id", "elsewhere", "Outside those positions they are ordinary names, so old code keeps compiling."],
      ],
    ],
    mistakes: [
      "Thinking `String`, `main` or `System` are keywords; they are class or method names.",
      "Naming a class `var` or `record`; type names cannot use these restricted identifiers.",
    ],
    qa: [
      ["Is goto a keyword in Java?", "Yes, it is reserved but has no function; Java has no goto statement. `const` is the same."],
      ["Are true, false and null keywords?", "They are reserved literals; you cannot use them as identifiers."],
      ["Is var a keyword?", "It is a reserved type name (contextual keyword) for local variable type inference; it can still be a variable or method name."],
    ],
    ex: [
      "Which of these are legal identifiers: `_count`, `_`, `goto`, `Goto`, `null1`, `var`, `2nd`?",
      "Legal: `_count`, `Goto`, `null1` and `var` (as a variable). Illegal: `_` (reserved since Java 9), `goto` (reserved) and `2nd` (starts with a digit).",
    ],
  }),

  lesson("The final Keyword", {
    intro:
      "`final` means \"cannot change\", but what cannot change depends on where it is used: a final variable cannot be reassigned, a final method cannot be overridden and a final class cannot be extended. This lesson collects the important features of `final`, including blank finals, final parameters, final references versus immutability, and performance myths.",
    topics: [
      [
        "final variables",
        "A final local variable, field or parameter can be assigned exactly once. Final primitives with compile-time constant values (`static final int MAX = 10`) are inlined by the compiler. Since Java 8, a local variable that is never reassigned is \"effectively final\" and can be captured by lambdas without the keyword.",
      ],
      [
        "Blank final fields",
        "A final field without an initializer is a blank final. Instance blank finals must be assigned exactly once in every constructor (or an instance initializer); static blank finals must be assigned in a static initializer. Forgetting one path is a compile error.",
      ],
      [
        "final references are not immutable objects",
        "`final List<String> list = new ArrayList<>();` means `list` always points to the same list, but you can still add and remove elements. To make the content unchangeable, use an immutable or unmodifiable collection and immutable element types.",
      ],
      [
        "final methods",
        "A final method cannot be overridden, which protects critical behaviour (for example a template method or security check) from subclasses. Private methods are implicitly final. Final methods can still be overloaded and inherited.",
      ],
      [
        "final classes",
        "A final class cannot be extended. `String`, `Integer` and the other wrappers, `Math` and `System` are final. All methods of a final class are effectively final. Records and enums are implicitly final (enum constants with bodies aside).",
      ],
      [
        "Other final rules",
        "Constructors cannot be final. Abstract and final cannot be combined. Interface fields are implicitly `public static final`. A final parameter cannot be reassigned inside the method. `final` in a catch parameter or enhanced-for variable works the same way. Marking methods final no longer brings speed benefits; the JIT handles that itself.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static final double PI_APPROX = 3.14;          // constant: assigned once
    static final List<String> LOG;                  // static blank final
    static { LOG = new ArrayList<>(); }

    static final class Money {                      // final class: cannot be extended
        private final long paise;                   // instance blank final
        Money(long rupees, int paise) {
            this.paise = rupees * 100 + paise;      // assigned exactly once
        }
        final long totalPaise() { return paise; }
        public String toString() { return paise / 100 + "." + String.format("%02d", paise % 100); }
    }

    static class Base {
        final String id() { return "fixed-id"; }    // final method
        String name() { return "base"; }
    }
    static class Derived extends Base {
        // String id() { return "x"; }             // compile error: cannot override final
        String id(int n) { return "overload " + n; } // overloading a final method is fine
        @Override String name() { return "derived"; }
    }

    static int twice(final int value) {
        // value = 3;                               // compile error: final parameter
        return value * 2;
    }

    public static void main(String[] args) {
        final int limit = 5;
        // limit = 6;                               // compile error
        System.out.println("final local: " + limit + ", constant: " + PI_APPROX);

        LOG.add("first entry");                     // final reference, mutable object
        LOG.add("second entry");
        System.out.println("final list can still change: " + LOG);
        // LOG = new ArrayList<>();                 // compile error: cannot reassign

        List<String> frozen = List.of("a", "b");
        try { frozen.add("c"); } catch (UnsupportedOperationException e) { System.out.println("immutable content: add rejected"); }

        System.out.println("Money: " + new Money(149, 5));
        Derived d = new Derived();
        System.out.println(d.id() + ", " + d.id(2) + ", " + d.name());
        System.out.println("twice(21) = " + twice(21));

        int counter = 10;                           // effectively final: never reassigned
        Runnable r = () -> System.out.println("lambda sees effectively final counter " + counter);
        r.run();
        System.out.println("String is final: " + java.lang.reflect.Modifier.isFinal(String.class.getModifiers()));
    }
}`,
    walk:
      "`PI_APPROX` is a constant and `LOG` is a static blank final assigned in a static block. `Money` is a final class with a blank final field assigned once in the constructor. `Base.id()` is final, so `Derived` cannot override it but may overload it.\n\nThe list section proves a final reference does not make the object immutable: `LOG` accepts new elements, while `List.of` creates a truly unmodifiable list. `twice` has a final parameter, `counter` is effectively final so the lambda can capture it, and reflection confirms `String` is a final class.",
    anim: [
      "What final locks",
      [
        ["var", "final variable", "no reassign"],
        ["meth", "final method", "no override"],
        ["cls", "final class", "no subclass"],
        ["obj", "object state", "still mutable"],
        ["imm", "immutable", "List.of"],
      ],
      [
        ["var", "obj", "points to", "A final reference always points to the same object..."],
        ["obj", "imm", "not same", "...but the object itself can change unless it is immutable."],
        ["meth", "cls", "class level", "A final method blocks overriding of one method; a final class blocks subclassing."],
        ["var", "meth", "different", "The same keyword means different locks on variables, methods and classes."],
      ],
    ],
    mistakes: [
      "Believing a `final` collection or array cannot be modified.",
      "Leaving a constructor path that does not assign a blank final field.",
      "Combining `abstract` and `final` on a class or method.",
    ],
    qa: [
      ["What is a blank final variable?", "A final field declared without an initializer and assigned exactly once later, in every constructor or in a static initializer for static ones."],
      ["Can a final method be overloaded?", "Yes. final only prevents overriding."],
      ["Does final make an object immutable?", "No. It makes the reference unchangeable; the object's state can still change unless the class is designed to be immutable."],
      ["Can a constructor be final?", "No. Constructors are never inherited, so final has no meaning and is not allowed."],
    ],
    ex: [
      "Make `LOG` truly read-only for outside code while still letting the class add entries.",
      "Keep `private static final List<String> LOG = new ArrayList<>();` and expose `static List<String> log() { return Collections.unmodifiableList(LOG); }`. Callers get a read-only view; the class can still add.",
    ],
  }),

  lesson("The static Keyword", {
    intro:
      "`static` means \"belongs to the class, not to any object\". Static members exist once per class, are created when the class is initialised and can be used without creating an object. This lesson covers static variables, static methods, static blocks, static nested classes and their rules and pitfalls.",
    topics: [
      [
        "Static variables",
        "A static field has a single copy shared by every object of the class, for example a counter of created objects or a shared configuration. It is initialised when the class is initialised, before any object exists. Access it through the class name (`Employee.count`); accessing it through an object compiles but is misleading.",
      ],
      [
        "Static methods",
        "Static methods belong to the class and are called as `Math.max(a, b)`. They have no `this`, so they cannot access instance fields or call instance methods directly; they must receive an object to work on one. They cannot be abstract and are hidden rather than overridden in subclasses. `main` is static so the JVM can call it without an object.",
      ],
      [
        "Static blocks",
        "`static { ... }` runs once when the class is initialised, in textual order with static field initialisers. Use it for complex initialisation such as loading a lookup table. If it throws, the class fails to initialise with `ExceptionInInitializerError`.",
      ],
      [
        "Static nested classes",
        "A nested class declared `static` does not need an instance of the outer class. It is the right default for helper types and builders. Top-level classes cannot be static.",
      ],
      [
        "When a class is initialised",
        "On first active use: creating an instance, calling a static method, reading or writing a non-constant static field, reflection with `Class.forName`, or initialising a subclass. Reading a `static final` compile-time constant does not trigger initialisation because the value is inlined.",
      ],
      [
        "Rules and pitfalls",
        "Local variables cannot be static. Static state shared across threads needs synchronisation. Mutable static state makes testing hard and can leak memory (static collections live as long as the class). Static fields are stored with the `Class` object on the heap and are garbage collected only if the class is unloaded.",
      ],
    ],
    code: String.raw`public class Main {
    static class Employee {
        static int created = 0;                    // one copy for the whole class
        static final String COMPANY;               // set in static block
        static final int MAX_LEAVE = 24;           // compile-time constant
        final String name;
        final int id;

        static {
            System.out.println("  [static block] Employee class initialised");
            COMPANY = "Decoded Pvt Ltd";
        }

        Employee(String name) {
            this.name = name;
            this.id = ++created;                    // instance uses static counter
        }

        static String companyBanner() {            // no 'this' available
            // return name;                        // compile error: instance field
            return COMPANY + " has " + created + " employees";
        }

        static Employee hire(String name) { return new Employee(name); } // static factory
    }

    static class Config {
        static { System.out.println("  [static block] Config initialised"); }
        static final int VERSION = 3;              // constant: inlined, no init needed
        static String mode = "prod";               // non-constant: triggers init
    }

    public static void main(String[] args) {
        System.out.println("1. Reading a compile-time constant:");
        System.out.println("  Config.VERSION = " + Config.VERSION);
        System.out.println("2. Reading a non-constant static field:");
        System.out.println("  Config.mode = " + Config.mode);

        System.out.println("3. Constant does not initialise Employee: MAX_LEAVE = " + Employee.MAX_LEAVE);
        System.out.println("4. Calling a static method:");
        Employee a = Employee.hire("Asha");
        Employee b = new Employee("Ravi");
        System.out.println("  ids: " + a.id + ", " + b.id);
        System.out.println("  " + Employee.companyBanner());
        System.out.println("  shared through any object: " + (a.created == b.created));
        System.out.println("  Math.max is static: " + Math.max(a.id, b.id));
    }
}`,
    walk:
      "Reading `Config.VERSION` does not run the `Config` static block, because the constant is inlined at compile time. Reading `Config.mode`, a non-constant static field, triggers initialisation, so the static block prints first.\n\nThe same happens with `Employee`: `MAX_LEAVE` is a constant and does not initialise the class, but calling `Employee.hire` does. Each constructor increments the single shared `created` counter to produce ids 1 and 2, and `companyBanner()` can use only static members.",
    anim: [
      "Static members live with the class",
      [
        ["cls", "Employee class", "static: created"],
        ["block", "static block", "runs once"],
        ["a", "Asha object", "id 1"],
        ["b", "Ravi object", "id 2"],
        ["m", "companyBanner()", "static method"],
      ],
      [
        ["cls", "block", "first use", "The first active use initialises the class and runs the static block once."],
        ["a", "cls", "created++", "Creating Asha increments the single shared counter to 1."],
        ["b", "cls", "created++", "Creating Ravi increments the same counter to 2: one copy for all objects."],
        ["m", "cls", "reads", "The static method reads only class-level data; there is no this."],
      ],
    ],
    mistakes: [
      "Calling an instance method from a static method without an object.",
      "Using static mutable fields to share data between requests in a web app, causing thread-safety bugs and leaks.",
      "Accessing static members through instances (`obj.count`), which hides that the value is shared.",
    ],
    qa: [
      ["Can a static method access instance variables?", "Not directly. It has no `this`; it needs an object reference passed in or created."],
      ["When is a static block executed?", "Once, when the class is initialised on its first active use, before any static method runs or object is created."],
      ["Why is main static?", "So the JVM can call it without creating an instance of the class."],
      ["Can we override static methods?", "No; a static method with the same signature in a subclass hides the parent's method."],
    ],
    ex: [
      "Add `static void resetCount()` to `Employee`. Should it be static, and what happens to ids created afterwards?",
      "Yes, it changes class-level state, so it should be static: `static void resetCount() { created = 0; }`. The next employee created gets id 1 again, which shows why shared mutable static state must be handled carefully.",
    ],
  }),

  lesson("Why Static Methods Cannot Be Overridden", {
    intro:
      "A subclass can declare a static method with the same signature as a static method in its parent, and it compiles, so it looks like overriding. It is not: it is method hiding. This lesson explains why static methods cannot be overridden, how hiding works, and the rules the compiler enforces.",
    topics: [
      [
        "Overriding needs an object",
        "Overriding relies on dynamic dispatch: the JVM chooses the method from the runtime class of the object. Static methods are not called on an object; they are bound to a class at compile time (with the `invokestatic` instruction), so there is nothing to dispatch on.",
      ],
      [
        "Method hiding",
        "When a subclass declares a static method with the same signature, it hides the parent's method. Which one runs depends only on the type used in the call: `Parent.show()` calls the parent's, `Child.show()` the child's, and `Parent p = new Child(); p.show()` still calls the parent's because the reference type is `Parent`.",
      ],
      [
        "Compiler rules",
        "A static method cannot hide an instance method, and an instance method cannot override a static method; both are compile errors. `@Override` on a static method is an error. The hiding method must not reduce visibility and must have a compatible return type.",
      ],
      [
        "Design consequence",
        "If you need polymorphic behaviour, use instance methods. For class-level variation, pass a strategy object or use an enum with constant-specific methods.",
      ],
    ],
    code: String.raw`public class Main {
    static class Parent {
        static String create() { return "Parent.create (static)"; }
        String describe() { return "Parent.describe (instance)"; }
    }

    static class Child extends Parent {
        static String create() { return "Child.create (static, hides parent)"; }   // hiding
        @Override String describe() { return "Child.describe (instance, overrides)"; }
        // @Override static String create() {...}   // compile error: static methods cannot be overridden
        // String create() {...}                    // compile error: instance cannot override static
    }

    public static void main(String[] args) {
        Parent ref = new Child();

        System.out.println("Parent.create(): " + Parent.create());
        System.out.println("Child.create():  " + Child.create());
        System.out.println("ref.create() with Parent ref to a Child: " + callStaticThroughReference(ref));
        System.out.println("ref.describe(): " + ref.describe());
        Child child = new Child();
        System.out.println("child.describe(): " + child.describe());
    }

    @SuppressWarnings("static-access")
    static String callStaticThroughReference(Parent p) {
        return p.create();   // compiled as Parent.create(); the object is ignored
    }
}`,
    walk:
      "`Child.create()` hides `Parent.create()`. Calling them by class name runs each class's version, as expected.\n\n`callStaticThroughReference` receives a `Child` object in a `Parent`-typed parameter and calls `p.create()`. Because static calls are bound to the declared type at compile time, the parent's method runs and the object is ignored. In contrast, `ref.describe()` is an instance method, so dynamic dispatch runs the child's override.",
    anim: [
      "Hiding vs overriding",
      [
        ["ref", "Parent ref", "holds a Child"],
        ["stat", "ref.create()", "static call"],
        ["pc", "Parent.create", "bound at compile"],
        ["inst", "ref.describe()", "instance call"],
        ["cd", "Child.describe", "runtime dispatch"],
      ],
      [
        ["ref", "stat", "call", "A static call through the reference is compiled as Parent.create()."],
        ["stat", "pc", "invokestatic", "invokestatic uses the declared type; the Child object is never consulted."],
        ["ref", "inst", "call", "An instance call is compiled as a virtual call on the object."],
        ["inst", "cd", "dispatch", "At runtime the JVM sees a Child and runs the overriding Child.describe()."],
      ],
    ],
    mistakes: [
      "Calling static methods through object references, which makes hiding look like overriding.",
      "Expecting `@Override` to be allowed on static methods.",
    ],
    qa: [
      ["Can static methods be overridden?", "No. They can be hidden by a subclass static method with the same signature, but there is no runtime polymorphism."],
      ["What is method hiding?", "A subclass static method with the same signature as a parent static method; the method called depends on the reference type, not the object."],
      ["Can a static method hide an instance method?", "No. Mixing static and instance methods with the same signature in a hierarchy is a compile error."],
    ],
    ex: [
      "Predict the output of `Parent p = null; System.out.println(p.create());`.",
      "It prints `Parent.create (static)` with no NullPointerException, because the static call is resolved to `Parent.create()` and never uses the null reference.",
    ],
  }),

  lesson("Static Import", {
    intro:
      "Static import, added in Java 5, lets you use static members of another class without qualifying them with the class name: `sqrt(x)` instead of `Math.sqrt(x)`. Used sparingly it makes code read naturally; overused it hides where names come from. This lesson covers the syntax, single and on-demand forms, conflicts and good practice.",
    topics: [
      [
        "Syntax",
        "`import static java.lang.Math.PI;` imports one static member; `import static java.lang.Math.*;` imports all static members on demand. After that, `PI` and `sqrt(2)` can be used unqualified. It works for static fields, static methods and enum constants.",
      ],
      [
        "Conflicts and precedence",
        "If two static imports bring the same name (for example `Integer.MAX_VALUE` and `Long.MAX_VALUE`), using the name is ambiguous and does not compile. A local or class member with the same name shadows the import. A single-member import beats an on-demand import.",
      ],
      [
        "Good uses",
        "Constants and helpers used heavily in a file: `Math` functions in numeric code, `Collectors.toList` in stream code, JUnit assertions (`assertEquals`), Mockito helpers, and enum constants in switch-heavy code.",
      ],
      [
        "When to avoid it",
        "Avoid importing many static members from many classes in business code; readers can no longer tell where a name is defined. Prefer explicit single-member imports over wildcards.",
      ],
    ],
    code: String.raw`import static java.lang.Math.PI;
import static java.lang.Math.max;
import static java.lang.Math.pow;
import static java.lang.Math.sqrt;
import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.stream.Collectors.joining;

import java.util.List;

public class Main {
    enum Level { LOW, MEDIUM, HIGH }

    static double circleArea(double r) {
        return PI * pow(r, 2);              // instead of Math.PI * Math.pow(r, 2)
    }

    static double hypotenuse(double a, double b) {
        return sqrt(a * a + b * b);
    }

    // Naming this method max would shadow the imported Math.max completely (even with a
    // different parameter count), so max(a, b) below would no longer compile.
    static int maxOfThree(int a, int b, int c) {
        return max(max(a, b), c);            // max comes from the static import of Math
    }

    public static void main(String[] args) {
        System.out.printf("area r=2: %.3f%n", circleArea(2));
        System.out.println("hypotenuse 3,4: " + hypotenuse(3, 4));
        System.out.println("max of three: " + maxOfThree(7, 19, 4));
        System.out.println("90 seconds in minutes: " + SECONDS.toMinutes(90));

        String joined = List.of("static", "import", "demo").stream().collect(joining(" | "));
        System.out.println(joined);

        Level level = Level.HIGH;
        String advice = switch (level) {      // enum constants are unqualified in case labels anyway
            case LOW -> "relax";
            case MEDIUM -> "watch";
            case HIGH -> "act now";
        };
        System.out.println(level + ": " + advice);
    }
}`,
    walk:
      "The static imports bring `PI`, `max`, `pow` and `sqrt` from `Math`, `SECONDS` from `TimeUnit` and `joining` from `Collectors`, so the code reads like formulas: the area of a circle with radius 2 is about 12.566, and the hypotenuse of 3 and 4 is 5.0.\n\n`maxOfThree` calls the imported `Math.max` twice. It is deliberately not named `max`: a method declared in the class with the same simple name shadows the static import entirely, whatever its parameter count, so `max(a, b)` would stop compiling. `SECONDS.toMinutes(90)` returns 1 and `joining` concatenates the stream with separators.",
    anim: [
      "Resolving an unqualified name",
      [
        ["use", "sqrt(25)", "in your code"],
        ["local", "Local scope", "variables"],
        ["cls", "This class", "members"],
        ["single", "import static", "Math.sqrt"],
        ["call", "Math.sqrt(25)", "actual call"],
      ],
      [
        ["use", "local", "look", "javac first looks for a local variable or parameter named sqrt."],
        ["local", "cls", "look", "Then for a member of the current class (or its supertypes)."],
        ["cls", "single", "look", "Then single static imports, before any wildcard static imports."],
        ["single", "call", "bind", "It finds java.lang.Math.sqrt and compiles the call to it."],
      ],
    ],
    mistakes: [
      "Wildcard-importing static members from several classes, causing ambiguous names.",
      "Using static import to save a few characters in code where the class name gives important context.",
    ],
    qa: [
      ["What is static import?", "A Java 5 feature that imports static members so they can be used without the class name."],
      ["What happens if two static imports have the same member name?", "The import itself compiles, but using the name unqualified is an ambiguity error."],
      ["Can you static-import instance members?", "No, only static fields, static methods and nested types."],
    ],
    ex: [
      "Add `import static java.lang.Integer.MAX_VALUE;` and `import static java.lang.Long.MAX_VALUE;` and print `MAX_VALUE`. What happens and how do you fix it?",
      "Compile error: reference to MAX_VALUE is ambiguous. Remove one import or qualify the name, for example `Long.MAX_VALUE`.",
    ],
  }),

  lesson("The this Keyword", {
    intro:
      "`this` is a reference to the current object, the one whose method or constructor is running. It resolves name clashes, chains constructors, passes the object to other code and enables fluent APIs. This lesson covers every use of `this` and where it cannot be used.",
    topics: [
      [
        "Referring to instance fields",
        "When a parameter or local variable has the same name as a field, the local name shadows the field; `this.name = name` assigns the parameter to the field.",
      ],
      [
        "Calling another constructor with this()",
        "`this(arguments)` calls another constructor of the same class to avoid duplicated initialisation. It must be the first statement and cannot be combined with `super(...)` in the same constructor. Constructor calls cannot form a cycle.",
      ],
      [
        "Passing and returning this",
        "Pass `this` to register the current object (`button.addListener(this)`, `registry.add(this)`). Return `this` from setters to allow method chaining: `builder.name(\"x\").age(3)`.",
      ],
      [
        "Invoking current-class methods and Outer.this",
        "`this.method()` is the same as `method()` for instance methods but can make code clearer. In an inner class, `this` is the inner object; `Outer.this` refers to the enclosing outer object.",
      ],
      [
        "Where this cannot be used",
        "Not in static methods or static blocks (there is no current object). `this` cannot be reassigned. In a lambda, `this` means the enclosing object, unlike an anonymous class, where it means the anonymous object.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<Object> registry = new ArrayList<>();

    static class Order {
        private String customer;
        private int quantity;
        private String note = "";

        Order() { this("guest"); }                         // this(): constructor chaining
        Order(String customer) { this(customer, 1); }
        Order(String customer, int quantity) {
            this.customer = customer;                      // this.field = parameter
            this.quantity = quantity;
            registry.add(this);                            // pass the current object
        }

        Order note(String note) { this.note = note; return this; }      // return this for chaining
        Order quantity(int quantity) { this.quantity = quantity; return this; }

        boolean sameAs(Order other) { return this == other; }

        class Line {                                       // inner class
            String describe() { return "line of order for " + Order.this.customer; } // Outer.this
        }

        Runnable lambdaPrinter() { return () -> System.out.println("  lambda this is the Order: " + this); }

        public String toString() { return customer + " x" + quantity + (note.isEmpty() ? "" : " (" + note + ")"); }
    }

    public static void main(String[] args) {
        Order first = new Order();
        Order second = new Order("Asha").quantity(3).note("gift wrap");
        System.out.println("first: " + first);
        System.out.println("second: " + second);
        System.out.println("registry holds both: " + registry);
        System.out.println("first.sameAs(first): " + first.sameAs(first) + ", first.sameAs(second): " + first.sameAs(second));
        System.out.println(second.new Line().describe());
        second.lambdaPrinter().run();
        // System.out.println(this);   // compile error: no this in static main
    }
}`,
    walk:
      "`new Order()` chains through `this(\"guest\")` and `this(customer, 1)` to the full constructor, which assigns the fields with `this.field = parameter` and registers the current object with `registry.add(this)`.\n\n`quantity(3).note(\"gift wrap\")` works because each setter returns `this`. `sameAs` compares the current object with another by identity. The inner `Line` uses `Order.this.customer` to reach its enclosing order, and inside the lambda `this` is the `Order`, not the lambda.",
    anim: [
      "Fluent calls returning this",
      [
        ["new", "new Order(..)", "creates object"],
        ["q", ".quantity(3)", "sets, returns this"],
        ["n", ".note(\"gift\")", "sets, returns this"],
        ["obj", "same Order", "one object"],
      ],
      [
        ["new", "obj", "create", "The constructor creates the object and registers this in the registry."],
        ["q", "obj", "this", "quantity(3) updates the field and returns this: the very same object."],
        ["n", "obj", "this", "note(...) is called on that returned object and again returns this."],
        ["new", "n", "chain", "Because each call returns this, the calls can be chained in one expression."],
      ],
    ],
    mistakes: [
      "Forgetting `this.` in a constructor or setter, so the parameter is assigned to itself and the field stays at its default.",
      "Leaking `this` from a constructor to other threads before the object is fully built.",
    ],
    qa: [
      ["What are the uses of this?", "Referring to fields shadowed by parameters, calling another constructor with `this()`, passing or returning the current object, calling current-class methods, and `Outer.this` in inner classes."],
      ["Can this be used in a static method?", "No. Static methods have no current object."],
      ["Can this() and super() both appear in one constructor?", "No. Both must be the first statement, so only one is allowed."],
    ],
    ex: [
      "Write a `copy()` method in `Order` that returns a new order with the same customer and quantity, using `this`.",
      "`Order copy() { return new Order(this.customer, this.quantity).note(this.note); }`. It also registers the copy, so the registry grows by one.",
    ],
  }),

  lesson("The super Keyword", {
    intro:
      "`super` refers to the parent-class part of the current object. It is used to call parent constructors, invoke overridden parent methods, and access parent fields hidden by subclass fields. This lesson covers each use, the implicit `super()` call, and `Interface.super` for default methods.",
    topics: [
      [
        "Calling the parent constructor with super()",
        "`super(arguments)` must be the first statement of a subclass constructor. If you omit it, the compiler inserts `super()` (no arguments), which fails to compile when the parent has no no-arg constructor. Parent constructors always run before the child constructor body.",
      ],
      [
        "Calling an overridden parent method",
        "`super.method()` runs the parent implementation from inside the child, typically to extend behaviour: do extra work, then call `super.method()`. It only reaches one level up; you cannot write `super.super.method()`.",
      ],
      [
        "Accessing a hidden parent field",
        "If the child declares a field with the same name as a parent field, the child's field hides the parent's; `super.field` reaches the parent's. Hiding fields is confusing and best avoided.",
      ],
      [
        "Interface.super for default methods",
        "When a class implements an interface with a default method and overrides it, `InterfaceName.super.method()` calls the interface's default implementation. It is also how you resolve conflicts between two interfaces' defaults.",
      ],
      [
        "Where super cannot be used",
        "Not in static contexts, and not to call constructors from ordinary methods. In a top-level class with no explicit parent, `super` refers to `Object`.",
      ],
    ],
    code: String.raw`public class Main {
    static class Vehicle {
        protected String type = "vehicle";
        protected final int wheels;
        Vehicle(int wheels) {
            this.wheels = wheels;
            System.out.println("  Vehicle constructor: " + wheels + " wheels");
        }
        String start() { return "engine on"; }
    }

    interface Connected {
        default String start() { return "app connected"; }
    }

    static class ElectricCar extends Vehicle implements Connected {
        protected String type = "electric car";            // hides Vehicle.type
        ElectricCar() {
            super(4);                                      // must be first
            System.out.println("  ElectricCar constructor runs after the parent");
        }
        @Override public String start() {
            return "battery check, " + super.start() + ", " + Connected.super.start();
        }
        String types() { return "this.type=" + this.type + ", super.type=" + super.type; }
    }

    static class Base { Base(String name) { System.out.println("  Base(" + name + ")"); } }
    static class Derived extends Base {
        Derived() { super("from Derived"); }               // required: Base has no no-arg constructor
    }

    public static void main(String[] args) {
        System.out.println("Creating ElectricCar:");
        ElectricCar car = new ElectricCar();
        System.out.println("start(): " + car.start());
        System.out.println(car.types());
        System.out.println("wheels inherited: " + car.wheels);
        System.out.println("Creating Derived:");
        new Derived();
    }
}`,
    walk:
      "Creating `ElectricCar` first runs `super(4)`, so the `Vehicle` constructor prints before the child's. `start()` extends the parent version with `super.start()` and also calls the interface's default with `Connected.super.start()`.\n\n`types()` shows field hiding: `this.type` is the child's field and `super.type` the parent's. `Derived` must call `super(\"from Derived\")` explicitly, because `Base` has no no-argument constructor for the compiler to call implicitly.",
    anim: [
      "Constructor order with super()",
      [
        ["new", "new ElectricCar", "start"],
        ["child", "ElectricCar()", "first: super(4)"],
        ["parent", "Vehicle(4)", "runs first"],
        ["obj", "Object()", "root"],
        ["done", "child body", "runs last"],
      ],
      [
        ["new", "child", "invoke", "new calls the ElectricCar constructor, whose first statement is super(4)."],
        ["child", "parent", "super(4)", "Control jumps to the Vehicle constructor before any child code runs."],
        ["parent", "obj", "super()", "Vehicle implicitly calls Object's constructor first."],
        ["parent", "done", "return", "After the parent finishes, the rest of the ElectricCar constructor runs."],
      ],
    ],
    mistakes: [
      "Writing code before `super(...)` in a constructor (allowed only in a limited form in very recent Java versions).",
      "Trying `super.super.method()` to skip a level; restructure the hierarchy instead.",
    ],
    qa: [
      ["What are the uses of super?", "Calling a parent constructor with `super()`, calling a parent's overridden method with `super.method()`, and accessing a hidden parent field with `super.field`."],
      ["Is super() always called?", "Yes. If you do not call `super(...)` or `this(...)` explicitly, the compiler inserts `super()`."],
      ["How do you call an interface's default method from an overriding class?", "`InterfaceName.super.methodName()`."],
    ],
    ex: [
      "Add a `Truck extends Vehicle` with 6 wheels whose `start()` returns the parent's message plus \", air brakes ready\".",
      "`class Truck extends Vehicle { Truck() { super(6); } @Override String start() { return super.start() + \", air brakes ready\"; } }`. It prints `engine on, air brakes ready`.",
    ],
  }),

  lesson("strictfp and const Keywords", {
    intro:
      "Two Java keywords are rarely used today: `strictfp`, which once forced strict IEEE 754 floating-point behaviour, and `const`, which is reserved but has never done anything. Both appear in interview questions. This lesson explains what `strictfp` did, why it is now redundant, and why `const` exists but is unused.",
    topics: [
      [
        "What strictfp did",
        "Before Java 17, the JVM was allowed to use extended precision (for example 80-bit x87 registers) for intermediate floating-point results, so the same calculation could give slightly different results on different hardware. Marking a class, interface or method `strictfp` forced every intermediate result to strict 32-bit or 64-bit IEEE 754 values, guaranteeing identical results everywhere.",
      ],
      [
        "Where strictfp could be applied",
        "On classes, interfaces and methods (including abstract methods' implementations in a strictfp class). Not on variables or constructors. A strictfp class makes all its methods and nested types strictfp.",
      ],
      [
        "strictfp since Java 17",
        "JEP 306 made all floating-point operations strict by default in Java 17, because modern CPUs (SSE2) do strict arithmetic efficiently. The keyword is still accepted but has no effect, and javac warns that it is redundant.",
      ],
      [
        "The const keyword",
        "`const` is reserved, like `goto`, so it cannot be used as an identifier, but it has no meaning in Java. The designers reserved it so that C and C++ programmers would get a clear error instead of surprising behaviour. Java uses `final` (and `static final` for constants) instead.",
      ],
    ],
    code: String.raw`public class Main {
    static final double RATE = 0.1;     // Java's "const" is static final
    // static const double X = 1;       // compile error: const is reserved but unused

    @SuppressWarnings("strictfp")
    static strictfp double compound(double principal, int years) {   // redundant since Java 17
        double amount = principal;
        for (int i = 0; i < years; i++) amount *= 1 + RATE;
        return amount;
    }

    static double compoundDefault(double principal, int years) {
        double amount = principal;
        for (int i = 0; i < years; i++) amount *= 1 + RATE;
        return amount;
    }

    public static void main(String[] args) {
        double strict = compound(1000, 10);
        double normal = compoundDefault(1000, 10);
        System.out.println("strictfp result:  " + strict);
        System.out.println("default result:   " + normal);
        System.out.println("bit-for-bit equal: " + (Double.doubleToLongBits(strict) == Double.doubleToLongBits(normal)));
        System.out.println("0.1 * 3 = " + (0.1 * 3) + " on every platform");
        System.out.println("constant RATE = " + RATE);
    }
}`,
    walk:
      "Both methods compute 10 years of 10% compound growth. One is marked `strictfp` and the other is not; on Java 17 and later they behave identically, and the program confirms the results are equal bit for bit (javac also warns that `strictfp` is redundant, which `@SuppressWarnings` silences).\n\n`0.1 * 3` gives 0.30000000000000004 on every platform, because strict IEEE 754 arithmetic is now guaranteed everywhere. `RATE` shows how Java expresses constants with `static final`, since `const` cannot be used.",
    anim: [
      "Floating point before and after Java 17",
      [
        ["calc", "a * b * c", "expression"],
        ["old", "Old x87 JVM", "80-bit temps"],
        ["sfp", "strictfp", "forced 64-bit"],
        ["j17", "Java 17+", "always strict"],
        ["same", "same result", "everywhere"],
      ],
      [
        ["calc", "old", "pre-17", "Before Java 17 a JVM could keep intermediate results in 80-bit registers."],
        ["old", "sfp", "fix", "strictfp forced every intermediate value back to standard IEEE 754 precision."],
        ["calc", "j17", "now", "Since Java 17 every floating-point operation is strict by default."],
        ["j17", "same", "result", "So results are identical on every platform and strictfp is redundant."],
      ],
    ],
    mistakes: [
      "Adding `strictfp` to new code; it has no effect since Java 17.",
      "Thinking strictfp fixes rounding errors like `0.1 + 0.2`; it only made results reproducible, not exact.",
    ],
    qa: [
      ["What is strictfp?", "A modifier that forced strict IEEE 754 floating-point semantics for platform-independent results; it is redundant since Java 17."],
      ["Can strictfp be used on variables or constructors?", "No, only on classes, interfaces and methods."],
      ["Is const a keyword in Java?", "It is reserved but unused; use `final` or `static final` for constants."],
    ],
    ex: [
      "Why would two Java 8 programs computing the same double expression on different CPUs sometimes print different last digits?",
      "Without `strictfp`, Java 8 JVMs could use extended-precision intermediate results on x87 hardware, so rounding could differ slightly. Marking the code strictfp, or running Java 17+, guarantees identical results.",
    ],
  }),

  lesson("Instance vs Static Initialization Blocks", {
    intro:
      "Besides constructors and field initialisers, Java has two kinds of initialisation blocks: static blocks, which run once when the class is initialised, and instance blocks, which run every time an object is created. Knowing their exact order is a favourite interview topic. This lesson compares them and traces the full initialisation order with inheritance.",
    topics: [
      [
        "Static initialization block",
        "`static { ... }` runs once per class, when the class is initialised on first active use. It can only access static members. Several static blocks run in the order they appear, interleaved with static field initialisers. Typical use: building lookup tables, loading native libraries or configuration.",
      ],
      [
        "Instance initialization block",
        "A plain `{ ... }` block inside the class body runs every time an object is created, before the constructor body but after the `super(...)` call. The compiler actually copies instance blocks and instance field initialisers into every constructor (except those starting with `this(...)`). Typical use: shared setup code for several constructors, and anonymous classes, which cannot have constructors.",
      ],
      [
        "Differences",
        "Static block: runs once per class, at class initialisation, accesses only static members, cannot use `this`. Instance block: runs once per object, at object creation, can access instance and static members and `this`. Static blocks run before any instance block.",
      ],
      [
        "Full order with inheritance",
        "1. Parent static fields and static blocks (once). 2. Child static fields and static blocks (once). For each `new Child()`: 3. Parent instance fields and instance blocks, 4. Parent constructor body, 5. Child instance fields and instance blocks, 6. Child constructor body.",
      ],
    ],
    code: String.raw`public class Main {
    static StringBuilder trace = new StringBuilder();
    static void log(String s) { System.out.println("  " + s); }

    static class Parent {
        static { log("1. Parent static block"); }
        { log("3. Parent instance block"); }
        Parent() { log("4. Parent constructor"); }
    }

    static class Child extends Parent {
        static String config = loadConfig();
        static { log("2b. Child static block"); }
        private String name = initName();
        { log("5b. Child instance block, name already = " + name); }

        Child() { log("6. Child constructor"); }
        Child(String n) { this(); name = n; log("6b. Child(String) after this(), name = " + name); }

        static String loadConfig() { log("2a. Child static field initialiser"); return "cfg"; }
        String initName() { log("5a. Child instance field initialiser"); return "default"; }
    }

    public static void main(String[] args) {
        System.out.println("First object:");
        new Child();
        System.out.println("Second object (static parts do not run again):");
        new Child("Asha");
        System.out.println("Anonymous class uses an instance block instead of a constructor:");
        java.util.List<String> list = new java.util.ArrayList<>() {{ add("x"); add("y"); }};
        System.out.println("  " + list);
    }
}`,
    walk:
      "On the first `new Child()`, the JVM initialises `Parent` (step 1) and then `Child`, whose static field initialiser and static block run in textual order (2a, 2b). Then the object is built: parent instance block and constructor (3, 4), child field initialiser and instance block (5a, 5b), and finally the child constructor body (6).\n\nThe second object skips all static steps. `Child(String)` starts with `this()`, so the instance initialisation runs once (inside the no-arg constructor), and then its own body runs. The last example uses an instance block inside an anonymous `ArrayList` subclass (\"double-brace initialisation\").",
    anim: [
      "Initialization order",
      [
        ["ps", "Parent static", "once"],
        ["cs", "Child static", "once"],
        ["pi", "Parent inst+ctor", "per object"],
        ["ci", "Child inst block", "per object"],
        ["cc", "Child ctor", "last"],
      ],
      [
        ["ps", "cs", "class init", "Classes are initialised top-down: Parent's static code, then Child's."],
        ["cs", "pi", "new", "Each new first runs Parent's instance blocks and constructor."],
        ["pi", "ci", "then", "Then Child's field initialisers and instance blocks run in order."],
        ["ci", "cc", "finally", "The Child constructor body runs last, when everything else is ready."],
      ],
    ],
    mistakes: [
      "Expecting a static block to run again for every object.",
      "Using double-brace initialisation in production: it creates an extra anonymous class and holds a reference to the outer object.",
      "Throwing unchecked exceptions from a static block, which makes the class unusable (`NoClassDefFoundError` on later use).",
    ],
    qa: [
      ["What is the difference between a static block and an instance block?", "A static block runs once when the class is initialised and can use only static members; an instance block runs on every object creation before the constructor body."],
      ["What is the order of execution of static block, instance block and constructor?", "Static blocks (once, parent first), then for each object: parent instance blocks and constructor, then child instance blocks and constructor."],
      ["Can a class have multiple static blocks?", "Yes. They run in the order they appear in the source."],
    ],
    ex: [
      "Without running it, how many times is \"3. Parent instance block\" printed by the program, and why?",
      "Twice, once per `Child` object created with `new`; the anonymous `ArrayList` is unrelated. Static blocks print once each.",
    ],
  }),
]);
