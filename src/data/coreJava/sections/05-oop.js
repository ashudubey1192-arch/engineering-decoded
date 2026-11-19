import { lesson, section } from "../schema.js";

export default section("oop", "Classes, Objects and OOP", [
  lesson("Classes and Objects", {
    intro:
      "A class is a blueprint that describes state (fields) and behaviour (methods); an object is a concrete instance created from that blueprint at runtime. Everything in object-oriented Java starts here. This lesson covers declaring classes, creating objects with `new`, fields and methods, the `this` reference, and the ways objects can be created.",
    topics: [
      [
        "What a class is",
        "A class declares fields (data each object carries), methods (operations), constructors (how objects are initialised) and possibly nested types. It is compiled to one `.class` file and loaded once by the JVM. A class itself does not hold per-object data; it defines what each object will have.",
      ],
      [
        "What an object is",
        "An object is a block of heap memory with its own copy of every instance field plus a pointer to its class. It has identity (it is a distinct object), state (field values) and behaviour (the class's methods). `new Car(\"red\")` allocates the object, runs the constructor and returns a reference.",
      ],
      [
        "Instance vs static members",
        "Instance fields and methods belong to each object and are accessed through a reference (`car.speed`). Static fields and methods belong to the class itself and are shared by all objects (`Car.count`). Instance methods can use `this`, the reference to the current object.",
      ],
      [
        "Ways to create objects",
        "With `new` (the usual way); with reflection (`Class.getDeclaredConstructor().newInstance()`); with `clone()`; through deserialization; and through factory methods such as `List.of()` or `Integer.valueOf()`, which call `new` internally or return cached objects.",
      ],
    ],
    code: String.raw`public class Main {
    static class Car {
        static int carsBuilt = 0;      // shared by all cars
        String color;                  // each car has its own copy
        int speed;

        Car(String color) {
            this.color = color;        // this = the object being built
            carsBuilt++;
        }

        void accelerate(int amount) { speed += amount; }

        String describe() { return color + " car at " + speed + " km/h"; }
    }

    public static void main(String[] args) throws Exception {
        Car first = new Car("red");
        Car second = new Car("blue");
        first.accelerate(40);
        second.accelerate(70);
        first.accelerate(15);

        System.out.println(first.describe());
        System.out.println(second.describe());
        System.out.println("Cars built: " + Car.carsBuilt);
        System.out.println("Different objects: " + (first != second));
        System.out.println("Same class: " + (first.getClass() == second.getClass()));

        Car viaReflection = Car.class.getDeclaredConstructor(String.class).newInstance("green");
        System.out.println("Created by reflection: " + viaReflection.describe());
        System.out.println("Cars built now: " + Car.carsBuilt);
    }
}`,
    walk:
      "The `Car` class has a static counter, two instance fields, a constructor and two methods. Creating `first` and `second` allocates two separate objects; each has its own `color` and `speed`, so accelerating one does not affect the other.\n\n`carsBuilt` is static, so both constructors increment the same counter. The two references point to different objects of the same class. Reflection finds the `String` constructor and creates a third car, which also increments the shared counter to 3.",
    anim: [
      "One class, many objects",
      [
        ["cls", "class Car", "blueprint"],
        ["stat", "carsBuilt", "static, shared"],
        ["o1", "first", "red, 55 km/h"],
        ["o2", "second", "blue, 70 km/h"],
        ["o3", "viaReflection", "green, 0 km/h"],
      ],
      [
        ["cls", "o1", "new", "new Car(\"red\") allocates an object with its own color and speed fields."],
        ["o1", "stat", "count++", "The constructor increments the single static counter stored with the class."],
        ["cls", "o2", "new", "A second new creates an independent object; its fields are separate."],
        ["cls", "o3", "reflect", "Reflection calls the same constructor; carsBuilt becomes 3."],
      ],
    ],
    mistakes: [
      "Storing per-object data in a static field, so every object overwrites the others.",
      "Calling an instance method from `static main` without an object (\"non-static method cannot be referenced from a static context\").",
    ],
    qa: [
      ["What is the difference between a class and an object?", "A class is a compile-time blueprint; an object is a runtime instance of it with its own state on the heap."],
      ["What are the ways to create an object in Java?", "`new`, reflection (`Constructor.newInstance`), `clone()`, deserialization, and factory methods that use one of these internally."],
      ["What does `this` refer to?", "The current object whose method or constructor is running."],
    ],
    ex: [
      "Add a `brake(int amount)` method that never lets speed go below 0, and show it working on `first`.",
      "`void brake(int a) { speed = Math.max(0, speed - a); }`. After `first.brake(100)`, `first.describe()` prints `red car at 0 km/h`.",
    ],
  }),

  lesson("Constructors: Overloading, Chaining, Access and Inheritance", {
    intro:
      "A constructor initialises a new object. It has the class's name, no return type, and runs every time `new` is used. This lesson covers the default constructor, parameterised constructors, constructor overloading, chaining with `this()` and `super()`, access modifiers on constructors (including private constructors) and how constructors behave with inheritance.",
    topics: [
      [
        "Default and no-argument constructors",
        "If a class declares no constructor, the compiler adds a public no-argument default constructor that just calls `super()`. As soon as you declare any constructor, the default one is no longer generated, so `new Product()` stops compiling unless you write a no-arg constructor yourself.",
      ],
      [
        "Constructor overloading",
        "A class can have several constructors with different parameter lists, for example `Product()`, `Product(String name)` and `Product(String name, double price)`. The compiler picks one by the arguments, exactly like method overloading.",
      ],
      [
        "Constructor chaining with this() and super()",
        "`this(...)` calls another constructor of the same class; `super(...)` calls a constructor of the parent class. Either must be the first statement, so a constructor can use only one of them. Chaining keeps initialisation logic in one place. If you write neither, the compiler inserts `super()`.",
      ],
      [
        "Access modifiers on constructors",
        "Public constructors can be used anywhere; protected ones by subclasses and the package; package-private ones within the package; private ones only inside the class. Private constructors are used for singletons, static factory methods (`Money.of(...)`) and utility classes that must not be instantiated.",
      ],
      [
        "Constructors and inheritance",
        "Constructors are not inherited and cannot be overridden. Creating a subclass object always runs the parent constructor first (top-down: `Object`, then parent, then child). If the parent has no no-arg constructor, the child must call `super(args)` explicitly or it will not compile. Constructors cannot be `static`, `final`, `abstract` or `synchronized`.",
      ],
    ],
    code: String.raw`public class Main {
    static class Product {
        final String name;
        final double price;
        final String category;

        Product() { this("Unnamed"); }                      // chain to the next one
        Product(String name) { this(name, 0.0); }
        Product(String name, double price) { this(name, price, "general"); }
        Product(String name, double price, String category) { // the one real constructor
            this.name = name;
            this.price = price;
            this.category = category;
            System.out.println("  Product(...) built " + name);
        }
        public String toString() { return name + "/" + price + "/" + category; }
    }

    static class Book extends Product {
        final String author;
        Book(String name, double price, String author) {
            super(name, price, "books");                     // parent first
            this.author = author;
            System.out.println("  Book(...) set author " + author);
        }
    }

    static final class MathUtil {
        private MathUtil() { throw new AssertionError("no instances"); }
        static int square(int x) { return x * x; }
    }

    static class Temperature {
        private final double celsius;
        private Temperature(double c) { celsius = c; }       // private: use factories
        static Temperature ofCelsius(double c) { return new Temperature(c); }
        static Temperature ofFahrenheit(double f) { return new Temperature((f - 32) * 5 / 9); }
        public String toString() { return String.format("%.1f C", celsius); }
    }

    public static void main(String[] args) {
        System.out.println("new Product():");
        System.out.println("  -> " + new Product());
        System.out.println("new Product(\"Pen\", 10):");
        System.out.println("  -> " + new Product("Pen", 10));
        System.out.println("new Book(...):");
        Book book = new Book("Clean Code", 450, "R. Martin");
        System.out.println("  -> " + book + " by " + book.author);

        System.out.println("MathUtil.square(7) = " + MathUtil.square(7));
        System.out.println("factory: " + Temperature.ofFahrenheit(212) + ", " + Temperature.ofCelsius(25));
    }
}`,
    walk:
      "`new Product()` chains through three constructors with `this(...)` until the four-argument constructor does the actual work, so the message is printed once. Every constructor delegates to that single place.\n\n`Book` calls `super(name, price, \"books\")` as its first statement, so the parent's message prints before the child's. `MathUtil` has a private constructor so it cannot be instantiated, and `Temperature` hides its constructor behind named factory methods, which make the unit explicit.",
    anim: [
      "Constructor chaining",
      [
        ["call", "new Product()", "no args"],
        ["c1", "Product(name)", "this(name, 0)"],
        ["c2", "Product(n, p)", "this(n, p, cat)"],
        ["c3", "Product(n,p,c)", "sets fields"],
        ["obj", "Product object", "Unnamed/0/general"],
      ],
      [
        ["call", "c1", "this(...)", "The no-arg constructor immediately delegates with this(\"Unnamed\")."],
        ["c1", "c2", "this(...)", "That constructor adds the default price and delegates again."],
        ["c2", "c3", "this(...)", "The last delegation reaches the constructor that really assigns the fields."],
        ["c3", "obj", "init", "Fields are set once, in one place, and the reference is returned to new."],
      ],
    ],
    mistakes: [
      "Adding a parameterised constructor and breaking code that relied on the implicit no-arg constructor.",
      "Calling overridable methods from a constructor; a subclass override runs before the subclass fields are initialised.",
      "Writing a return type such as `void Product()`, which makes it an ordinary method, not a constructor.",
    ],
    qa: [
      ["Can a constructor be private?", "Yes. It prevents outside instantiation and is used for singletons, factories and utility classes."],
      ["Are constructors inherited?", "No. A subclass must declare its own constructors, which call a parent constructor with `super(...)` (explicitly or implicitly)."],
      ["Can you call both this() and super() in one constructor?", "No. Each must be the first statement, so only one can appear; the chain eventually reaches a super call."],
      ["What is the default constructor?", "A public no-arg constructor generated by the compiler only when a class declares no constructors."],
    ],
    ex: [
      "Remove the no-arg constructor from `Product` and add `class Gift extends Product { Gift() {} }`. Does it compile? Why?",
      "No. `Gift()` implicitly calls `super()`, but `Product` no longer has a no-arg constructor. Fix it with `Gift() { super(\"Gift\"); }`.",
    ],
  }),

  lesson("The Four OOP Concepts", {
    intro:
      "Object-oriented programming rests on four principles: encapsulation, abstraction, inheritance and polymorphism. Each solves a different problem in building large programs. This lesson gives an overview of all four and shows them working together in one small program; the following lessons cover each in depth.",
    topics: [
      [
        "Encapsulation",
        "Bundle data and the methods that operate on it in one class, and hide the data behind access control (`private` fields, public methods). The object protects its own invariants, for example a bank account that never allows a negative balance.",
      ],
      [
        "Abstraction",
        "Expose what an object does and hide how it does it. Callers use an interface or abstract class (`PaymentMethod.pay(amount)`) without knowing the implementation details (cards, UPI, wallets).",
      ],
      [
        "Inheritance",
        "Create a new class from an existing one with `extends`, reusing and specialising its fields and methods. It models an \"is-a\" relationship: a `SavingsAccount` is an `Account`.",
      ],
      [
        "Polymorphism",
        "One reference type, many runtime forms. A variable of type `Account` can hold any subclass, and calling an overridden method runs the subclass version (runtime polymorphism). Method overloading is the compile-time form.",
      ],
      [
        "Why the four work together",
        "Encapsulation keeps each class correct on its own, abstraction lets callers depend on contracts, inheritance shares common code, and polymorphism lets new types plug in without changing callers. The result is code that is easier to change and test.",
      ],
    ],
    code: String.raw`import java.util.List;

public class Main {
    // Abstraction: callers know only this contract
    interface Account {
        void deposit(double amount);
        double monthEnd();
        String id();
    }

    // Encapsulation: balance is private and guarded
    static abstract class BaseAccount implements Account {
        private final String id;
        private double balance;
        BaseAccount(String id) { this.id = id; }
        public String id() { return id; }
        public void deposit(double amount) {
            if (amount <= 0) throw new IllegalArgumentException("deposit must be positive");
            balance += amount;
        }
        protected double balance() { return balance; }
        protected void adjust(double delta) { balance += delta; }
    }

    // Inheritance: specialise the base class
    static class SavingsAccount extends BaseAccount {
        SavingsAccount(String id) { super(id); }
        public double monthEnd() { adjust(balance() * 0.01); return balance(); }   // 1% interest
    }

    static class CurrentAccount extends BaseAccount {
        CurrentAccount(String id) { super(id); }
        public double monthEnd() { adjust(-50); return balance(); }               // monthly fee
    }

    public static void main(String[] args) {
        List<Account> accounts = List.of(new SavingsAccount("SAV-1"), new CurrentAccount("CUR-1"));
        for (Account account : accounts) account.deposit(10_000);

        // Polymorphism: the same call runs different code
        for (Account account : accounts) {
            System.out.printf("%s after month end: %.2f%n", account.id(), account.monthEnd());
        }

        try {
            accounts.get(0).deposit(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Encapsulation guarded the balance: " + e.getMessage());
        }
    }
}`,
    walk:
      "`Account` is the abstraction: the loop in `main` only knows `deposit`, `monthEnd` and `id`. `BaseAccount` encapsulates the balance in a private field and rejects invalid deposits.\n\n`SavingsAccount` and `CurrentAccount` inherit everything from `BaseAccount` and each override `monthEnd`. When the loop calls `account.monthEnd()`, polymorphism picks the right version at runtime: interest for savings (10,100) and a fee for current (9,950).",
    anim: [
      "Four principles in one design",
      [
        ["abs", "Account", "abstraction"],
        ["enc", "BaseAccount", "encapsulation"],
        ["sav", "SavingsAccount", "inheritance"],
        ["cur", "CurrentAccount", "inheritance"],
        ["call", "monthEnd()", "polymorphism"],
      ],
      [
        ["abs", "enc", "implements", "BaseAccount implements the Account contract callers depend on."],
        ["enc", "sav", "extends", "SavingsAccount reuses the guarded balance logic through inheritance."],
        ["enc", "cur", "extends", "CurrentAccount reuses it too, with a different month-end rule."],
        ["call", "sav", "dispatch", "account.monthEnd() on a SavingsAccount object runs the interest version."],
        ["call", "cur", "dispatch", "The same call on a CurrentAccount runs the fee version instead."],
      ],
    ],
    mistakes: [
      "Using inheritance only to reuse code when there is no \"is-a\" relationship; prefer composition.",
      "Making fields public \"for convenience\", which breaks encapsulation and lets callers corrupt state.",
    ],
    qa: [
      ["What are the four pillars of OOP?", "Encapsulation, abstraction, inheritance and polymorphism."],
      ["What is the difference between encapsulation and abstraction?", "Encapsulation hides data and protects state inside a class; abstraction hides implementation complexity behind a simpler contract."],
      ["Give an example of polymorphism.", "A `List<Account>` holding different account types, where calling `monthEnd()` runs each subclass's own implementation."],
    ],
    ex: [
      "Add a `FixedDepositAccount` that earns 2% at month end. Which code in `main` must change to include it?",
      "Only the list creation: add `new FixedDepositAccount(\"FD-1\")`. The loops stay unchanged because they depend on the `Account` abstraction; it prints 10200.00.",
    ],
  }),

  lesson("Encapsulation", {
    intro:
      "Encapsulation means an object owns its data and controls every change to it. Fields are private, and the only way in is through methods that validate and keep the object consistent. This lesson covers private fields with getters and setters, validation, read-only and immutable designs, and the benefits of encapsulation.",
    topics: [
      [
        "Private fields with getters and setters",
        "Declare fields `private` and expose `getX()` and `setX()` only where needed. Callers cannot write invalid values directly, and you can change the internal representation later without breaking them.",
      ],
      [
        "Validation and invariants",
        "Setters and business methods check their inputs (`if (age < 0) throw ...`) so the object can never enter an invalid state. An invariant is a rule that is always true for valid objects, such as `balance >= 0`.",
      ],
      [
        "Tell, don't ask",
        "Instead of `account.setBalance(account.getBalance() - 100)`, call `account.withdraw(100)`. Behaviour belongs next to the data it changes, so the rule lives in one place.",
      ],
      [
        "Defensive copies",
        "If a field is a mutable object (a list or a date), returning it directly lets callers change your internals. Return an unmodifiable view or a copy, and copy incoming mutable arguments in constructors.",
      ],
      [
        "Benefits",
        "Data hiding and security, easier maintenance (internal changes do not ripple out), easier testing, and the ability to make classes read-only (getters only) or immutable.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    static class Student {
        private final String name;
        private int age;
        private final List<Integer> marks = new ArrayList<>();

        Student(String name, int age) {
            if (name == null || name.isBlank()) throw new IllegalArgumentException("name required");
            this.name = name;
            setAge(age);
        }

        public String getName() { return name; }     // read-only: no setter
        public int getAge() { return age; }
        public void setAge(int age) {
            if (age < 3 || age > 120) throw new IllegalArgumentException("invalid age " + age);
            this.age = age;
        }

        public void addMark(int mark) {              // behaviour next to data
            if (mark < 0 || mark > 100) throw new IllegalArgumentException("mark out of range");
            marks.add(mark);
        }
        public List<Integer> getMarks() { return Collections.unmodifiableList(marks); }
        public double average() {
            return marks.stream().mapToInt(Integer::intValue).average().orElse(0);
        }
    }

    public static void main(String[] args) {
        Student s = new Student("Ravi", 20);
        s.addMark(88);
        s.addMark(92);
        System.out.println(s.getName() + ", age " + s.getAge() + ", marks " + s.getMarks()
                + ", average " + s.average());

        try { s.setAge(-4); } catch (IllegalArgumentException e) { System.out.println("rejected: " + e.getMessage()); }
        try { s.addMark(150); } catch (IllegalArgumentException e) { System.out.println("rejected: " + e.getMessage()); }
        try {
            s.getMarks().add(0);
        } catch (UnsupportedOperationException e) {
            System.out.println("callers cannot modify marks directly");
        }
        System.out.println("state is still valid: age " + s.getAge() + ", marks " + s.getMarks());
    }
}`,
    walk:
      "All `Student` fields are private. `name` has only a getter, so it is read-only after construction. The constructor reuses `setAge` so validation lives in one place.\n\nInvalid ages and marks are rejected with exceptions. `getMarks` returns an unmodifiable view, so a caller's attempt to add a mark directly fails with `UnsupportedOperationException`. After all the rejected attempts, the student's state is still valid.",
    anim: [
      "All access goes through methods",
      [
        ["caller", "Caller", "outside code"],
        ["setter", "setAge(-4)", "public method"],
        ["check", "validation", "3..120 ?"],
        ["field", "private age", "hidden"],
        ["err", "exception", "rejected"],
      ],
      [
        ["caller", "setter", "call", "Outside code cannot touch the private field; it must call setAge."],
        ["setter", "check", "validate", "The setter checks the value against the rule before storing it."],
        ["check", "err", "-4 invalid", "-4 breaks the rule, so an IllegalArgumentException is thrown."],
        ["check", "field", "21 valid", "A valid value such as 21 passes and is stored in the private field."],
      ],
    ],
    mistakes: [
      "Generating a getter and setter for every field automatically, which exposes everything and is barely better than public fields.",
      "Returning internal mutable collections directly from getters.",
    ],
    qa: [
      ["What is encapsulation?", "Wrapping data and the code that manipulates it in one class and restricting direct access to the data, usually with private fields and public methods."],
      ["How do you make a field read-only?", "Make it private (often final) and provide a getter but no setter."],
      ["What is data hiding?", "Preventing outside code from accessing an object's internal fields directly; it is the mechanism encapsulation uses."],
    ],
    ex: [
      "Add `removeLowestMark()` to `Student` without exposing the list. What does the average become after removing the lowest of 88 and 92?",
      "Inside the class: `marks.remove(Collections.min(marks));` (remove by object, not index). Only 92 remains, so the average is 92.0.",
    ],
  }),

  lesson("Abstraction", {
    intro:
      "Abstraction means showing only the essential features of something and hiding the details. In Java it is achieved with abstract classes and interfaces: callers program against a contract, and implementations can change freely. This lesson covers abstraction with abstract classes and interfaces, levels of abstraction and how it differs from encapsulation.",
    topics: [
      [
        "What abstraction means",
        "When you call `list.add(x)` you do not care whether the list is an array or linked nodes. The `List` interface is an abstraction: it describes what operations exist and what they promise, not how they work.",
      ],
      [
        "Abstraction with abstract classes",
        "An abstract class can declare abstract methods (no body) that subclasses must implement, plus concrete methods with shared logic. It gives partial abstraction: some details are fixed, some are left to subclasses.",
      ],
      [
        "Abstraction with interfaces",
        "An interface declares a contract that any class can implement. Before Java 8 every interface method was abstract, giving full abstraction; default and static methods now allow some shared code, but interfaces still hold no instance state.",
      ],
      [
        "Abstraction vs encapsulation",
        "Abstraction is a design-level idea about hiding complexity (what vs how). Encapsulation is an implementation-level mechanism for hiding data (private fields). A well-designed class uses both: an abstract contract on the outside and encapsulated state inside.",
      ],
    ],
    code: String.raw`import java.util.List;

public class Main {
    // The caller-facing contract
    interface Notifier {
        void send(String to, String message);
    }

    // Shared skeleton, details left abstract (template method)
    static abstract class BaseNotifier implements Notifier {
        public final void send(String to, String message) {
            if (to == null || to.isBlank()) throw new IllegalArgumentException("recipient required");
            String formatted = format(message);
            deliver(to, formatted);
            System.out.println("  logged delivery to " + to);
        }
        protected String format(String message) { return message.trim(); }
        protected abstract void deliver(String to, String body);   // the hidden "how"
    }

    static class EmailNotifier extends BaseNotifier {
        protected String format(String m) { return "Hello,\n    " + m.trim() + "\n    Regards"; }
        protected void deliver(String to, String body) { System.out.println("  EMAIL to " + to + ":\n    " + body); }
    }

    static class SmsNotifier extends BaseNotifier {
        protected void deliver(String to, String body) {
            String text = body.length() > 20 ? body.substring(0, 20) + "..." : body;
            System.out.println("  SMS to " + to + ": " + text);
        }
    }

    // Depends only on the abstraction
    static void announce(List<Notifier> channels, String message) {
        for (Notifier n : channels) n.send(n instanceof EmailNotifier ? "ravi@example.com" : "+91-98xxxxxx01", message);
    }

    public static void main(String[] args) {
        System.out.println("Sending:");
        announce(List.of(new EmailNotifier(), new SmsNotifier()), "  Your order #1042 has been shipped today  ");
        Notifier lambda = (to, msg) -> System.out.println("  PUSH to " + to + ": " + msg);
        lambda.send("device-7", "Order shipped");
    }
}`,
    walk:
      "`Notifier` is pure abstraction: callers see only `send`. `BaseNotifier` is partial abstraction: it fixes the steps (validate, format, deliver, log) and leaves `deliver` abstract.\n\n`EmailNotifier` and `SmsNotifier` provide the hidden details; the SMS version truncates long text. `announce` works with any `Notifier`, and because `Notifier` has a single abstract method, a lambda can implement it too.",
    anim: [
      "Caller sees what, not how",
      [
        ["caller", "announce()", "caller"],
        ["iface", "Notifier", "send()"],
        ["base", "BaseNotifier", "fixed steps"],
        ["email", "EmailNotifier", "deliver()"],
        ["sms", "SmsNotifier", "deliver()"],
      ],
      [
        ["caller", "iface", "send", "The caller only knows the Notifier contract and calls send."],
        ["iface", "base", "template", "BaseNotifier validates and formats, the same for every channel."],
        ["base", "email", "abstract", "For an EmailNotifier the abstract deliver step sends an email."],
        ["base", "sms", "abstract", "For an SmsNotifier the same step sends a shortened SMS."],
      ],
    ],
    mistakes: [
      "Creating an interface for every class \"just in case\"; abstraction should hide real variation.",
      "Leaking implementation details through the abstraction, for example an interface method that returns an `ArrayList` instead of `List`.",
    ],
    qa: [
      ["How is abstraction achieved in Java?", "With abstract classes (partial abstraction) and interfaces (full contract abstraction)."],
      ["Can you create an object of an abstract class?", "No. You can only instantiate concrete subclasses, though an anonymous subclass can be created inline."],
      ["What is the difference between abstraction and encapsulation?", "Abstraction hides complexity by exposing a simple contract; encapsulation hides data by restricting access to fields."],
    ],
    ex: [
      "Add a `WhatsAppNotifier` that prefixes messages with `[WA]`. Which classes must change?",
      "None except the new class: `class WhatsAppNotifier extends BaseNotifier { protected void deliver(String to, String b) { System.out.println(\"[WA] \" + b); } }`, then add it to the list passed to `announce`.",
    ],
  }),

  lesson("Inheritance", {
    intro:
      "Inheritance lets a class acquire the fields and methods of another class with `extends`, so common behaviour is written once and specialised in subclasses. This lesson covers the is-a relationship, the types of inheritance Java supports, why multiple inheritance of classes is not allowed, the `super` keyword, and what is and is not inherited.",
    topics: [
      [
        "The is-a relationship",
        "`class Dog extends Animal` means every Dog is an Animal: a Dog can be used wherever an Animal is expected. The parent is the superclass (base class) and the child is the subclass (derived class). Every class implicitly extends `java.lang.Object`.",
      ],
      [
        "Types of inheritance",
        "Single (B extends A), multilevel (C extends B extends A) and hierarchical (B and C both extend A) are supported with classes. Multiple inheritance (one class extending two classes) is not supported for classes, but a class can implement many interfaces, and an interface can extend several interfaces. Hybrid inheritance is possible only through interfaces.",
      ],
      [
        "Why Java has no multiple class inheritance",
        "If C extended both A and B and both defined `show()`, which one should C inherit? This is the diamond problem. Java avoids it for state and implementations by allowing only one superclass; for interface default methods with the same signature, the class must override and choose explicitly (`A.super.show()`).",
      ],
      [
        "What is inherited",
        "Public and protected members are inherited, and package-private members are inherited when the subclass is in the same package. Private members exist in the object but are not accessible from the subclass. Constructors and static initialisers are not inherited. Static methods are inherited but hidden, not overridden.",
      ],
      [
        "The super keyword in inheritance",
        "`super.method()` calls the parent's version of an overridden method, `super.field` accesses a hidden parent field, and `super(...)` calls the parent constructor. Mark a class `final` to forbid inheritance (like `String`), or use `sealed` (Java 17) to allow only specific subclasses.",
      ],
    ],
    code: String.raw`public class Main {
    static class Animal {
        protected String name;
        private int secretId = 7;                        // not accessible from subclasses
        Animal(String name) { this.name = name; }
        void eat() { System.out.println(name + " eats"); }
        String sound() { return "..."; }
        int getSecretId() { return secretId; }
    }

    static class Dog extends Animal {                    // single inheritance
        Dog(String name) { super(name); }
        @Override String sound() { return "Woof"; }
        void fetch() { System.out.println(name + " fetches the ball"); }
    }

    static class Puppy extends Dog {                      // multilevel
        Puppy(String name) { super(name); }
        @Override String sound() { return super.sound() + " (tiny)"; }
    }

    static class Cat extends Animal {                     // hierarchical: Dog and Cat share Animal
        Cat(String name) { super(name); }
        @Override String sound() { return "Meow"; }
    }

    interface Swimmer { default String move() { return "swims"; } }
    interface Runner { default String move() { return "runs"; } }

    static class Labrador extends Dog implements Swimmer, Runner {   // multiple interfaces
        Labrador(String name) { super(name); }
        @Override public String move() { return Swimmer.super.move() + " and " + Runner.super.move(); }
    }

    public static void main(String[] args) {
        Animal[] animals = {new Dog("Rex"), new Puppy("Bit"), new Cat("Tom"), new Labrador("Max")};
        for (Animal a : animals) {
            a.eat();
            System.out.println("  " + a.getClass().getSimpleName() + " says " + a.sound()
                    + ", is Animal: " + (a instanceof Animal) + ", secret via getter: " + a.getSecretId());
        }
        new Puppy("Bit").fetch();
        System.out.println("Labrador " + new Labrador("Max").move());
        System.out.println("Dog's superclass: " + Dog.class.getSuperclass().getSimpleName()
                + ", Animal's superclass: " + Animal.class.getSuperclass().getSimpleName());
    }
}`,
    walk:
      "`Dog` and `Cat` extend `Animal` (single and hierarchical inheritance), and `Puppy` extends `Dog` (multilevel). Every subclass inherits `eat()` and the `name` field, overrides `sound()`, and can reach the private `secretId` only through the inherited public getter.\n\n`Puppy.sound()` builds on the parent with `super.sound()`, and `Puppy` also inherits `fetch()` from `Dog`. `Labrador` implements two interfaces that define the same default method, so it must override `move()` and pick both with `Swimmer.super` and `Runner.super`. The last line shows the chain up to `Object`.",
    anim: [
      "Inheritance tree",
      [
        ["obj", "Object", "root"],
        ["animal", "Animal", "eat(), sound()"],
        ["dog", "Dog", "fetch()"],
        ["cat", "Cat", "Meow"],
        ["puppy", "Puppy", "multilevel"],
      ],
      [
        ["obj", "animal", "extends", "Every class implicitly extends Object, including Animal."],
        ["animal", "dog", "extends", "Dog inherits eat() and name, and overrides sound()."],
        ["animal", "cat", "extends", "Cat is a sibling of Dog: hierarchical inheritance."],
        ["dog", "puppy", "extends", "Puppy extends Dog, so it inherits from both Dog and Animal."],
      ],
    ],
    mistakes: [
      "Using inheritance for \"has-a\" relationships (a `Car extends Engine`); use composition instead.",
      "Deep inheritance hierarchies that make behaviour hard to trace; prefer shallow trees.",
      "Thinking private fields are not part of the subclass object; they are present but inaccessible.",
    ],
    qa: [
      ["Does Java support multiple inheritance?", "Not of classes. A class can extend one class but implement many interfaces, which gives multiple inheritance of type."],
      ["What is the diamond problem?", "Ambiguity when a class inherits the same method from two parents. Java forbids multiple superclasses and requires explicit overrides for conflicting default methods."],
      ["Are private members inherited?", "They are part of the object but not accessible in the subclass; access them through inherited public or protected methods."],
      ["Which class is the superclass of every class?", "`java.lang.Object`."],
    ],
    ex: [
      "Declare `final class Cat` and try `class Lion extends Cat`. What happens? Then try sealing Animal with `sealed class Animal permits Dog, Cat`.",
      "Extending a final class is a compile error. With the sealed version, only `Dog` and `Cat` may extend `Animal` directly, and each must be declared `final`, `sealed` or `non-sealed`.",
    ],
  }),

  lesson("Compile-Time and Runtime Polymorphism", {
    intro:
      "Polymorphism means \"many forms\": the same name can do different things depending on context. Java has compile-time (static) polymorphism through method overloading and runtime (dynamic) polymorphism through method overriding and dynamic dispatch. This lesson explains both, upcasting, dynamic method dispatch and what is not polymorphic.",
    topics: [
      [
        "Compile-time polymorphism (overloading)",
        "Several methods share a name but differ in parameter lists: `print(int)`, `print(String)`, `print(int, int)`. The compiler chooses which one to call from the argument types it sees, so the decision is fixed at compile time. Also called static binding or early binding.",
      ],
      [
        "Runtime polymorphism (overriding)",
        "A subclass provides its own version of an inherited method. When you call the method through a parent-type reference, the JVM looks at the actual object at runtime and runs the most specific override. This is dynamic method dispatch, dynamic binding or late binding.",
      ],
      [
        "Upcasting and the reference type",
        "`Shape s = new Circle();` is an upcast. The reference type (`Shape`) decides which methods you may call (checked at compile time); the object type (`Circle`) decides which implementation runs (decided at runtime).",
      ],
      [
        "What is not polymorphic",
        "Fields are not overridden: `s.name` uses the reference type's field. Static methods are hidden, not overridden, so the reference type decides. Private and final methods cannot be overridden and are bound statically.",
      ],
    ],
    code: String.raw`public class Main {
    static class Printer {
        void print(int value) { System.out.println("int: " + value); }
        void print(double value) { System.out.println("double: " + value); }
        void print(String value) { System.out.println("String: " + value); }
        void print(int a, int b) { System.out.println("two ints: " + a + ", " + b); }
    }

    static class Shape {
        String name = "shape";
        double area() { return 0; }
        static String kind() { return "Shape.kind"; }
    }
    static class Circle extends Shape {
        String name = "circle";
        final double r;
        Circle(double r) { this.r = r; }
        @Override double area() { return Math.PI * r * r; }
        static String kind() { return "Circle.kind"; }
    }
    static class Square extends Shape {
        final double side;
        Square(double side) { this.side = side; }
        @Override double area() { return side * side; }
    }

    public static void main(String[] args) {
        Printer p = new Printer();          // compile-time: chosen by argument types
        p.print(5);
        p.print(5.5);
        p.print("five");
        p.print(2, 3);
        p.print('A');                       // char widens to int

        Shape[] shapes = {new Circle(1), new Square(2), new Shape()};
        for (Shape s : shapes) {            // runtime: chosen by the object
            System.out.printf("%s area = %.2f%n", s.getClass().getSimpleName(), s.area());
        }

        Shape s = new Circle(2);
        System.out.println("field via Shape reference: " + s.name + ", via Circle: " + ((Circle) s).name);
        System.out.println("static via Shape reference: " + Shape.kind() + " (no dynamic dispatch for static)");
    }
}`,
    walk:
      "The `Printer` calls are resolved at compile time: the compiler matches 5 to `print(int)`, 5.5 to `print(double)`, and so on; `'A'` has no `char` version, so it widens to `int` and prints 65.\n\nIn the loop every element has the reference type `Shape`, yet `s.area()` runs the `Circle`, `Square` or `Shape` implementation depending on the actual object, which is runtime polymorphism. Fields are not polymorphic: through a `Shape` reference, `name` is \"shape\"; and static methods are resolved by type, never by object.",
    anim: [
      "Dynamic method dispatch",
      [
        ["ref", "Shape s", "reference type"],
        ["call", "s.area()", "call site"],
        ["vt", "Runtime class", "look up object"],
        ["circle", "Circle.area()", "pi r squared"],
        ["square", "Square.area()", "side squared"],
      ],
      [
        ["ref", "call", "compile", "The compiler checks that Shape has an area() method; that is all it decides."],
        ["call", "vt", "runtime", "At runtime the JVM checks which class the object actually belongs to."],
        ["vt", "circle", "Circle", "For a Circle object, the overriding Circle.area() runs."],
        ["vt", "square", "Square", "For a Square object, the same call runs Square.area()."],
      ],
    ],
    mistakes: [
      "Expecting fields or static methods to behave polymorphically.",
      "Thinking overloading is decided by the runtime type of the argument; it uses the compile-time (declared) type.",
    ],
    qa: [
      ["What is the difference between compile-time and runtime polymorphism?", "Compile-time polymorphism is overloading, resolved by the compiler from argument types; runtime polymorphism is overriding, resolved by the JVM from the actual object type."],
      ["What is dynamic method dispatch?", "The mechanism by which a call to an overridden method through a superclass reference is resolved at runtime to the subclass implementation."],
      ["Can static methods be polymorphic?", "No. They are bound at compile time by reference type; a subclass static method with the same signature hides the parent's."],
    ],
    ex: [
      "Given `void show(Object o)` and `void show(String s)`, which is called by `Object x = \"hi\"; show(x);`?",
      "`show(Object)`, because overload resolution uses the declared type `Object`, not the runtime type `String`.",
    ],
  }),

  lesson("Interfaces: Multiple Inheritance and Marker Interfaces", {
    intro:
      "An interface defines a contract: a set of methods a class promises to provide. Interfaces are how Java achieves multiple inheritance of type, decouples code, and even marks classes with special meaning. This lesson covers declaring and implementing interfaces, interface members, multiple inheritance, marker interfaces, functional interfaces and when to use interfaces.",
    topics: [
      [
        "Declaring and implementing interfaces",
        "`interface Payable { double amount(); }` declares a contract and `class Invoice implements Payable` fulfils it. Interface methods are implicitly `public abstract` unless they are `default`, `static` or (since Java 9) `private`. Fields are implicitly `public static final` constants. Interfaces cannot have constructors or instance fields.",
      ],
      [
        "Multiple inheritance with interfaces",
        "A class can implement any number of interfaces (`class Duck implements Flyer, Swimmer`), and an interface can extend several interfaces. Because interfaces carry no instance state, this avoids most of the diamond problem; conflicting default methods must be resolved explicitly.",
      ],
      [
        "Default, static and private methods",
        "Java 8 added `default` methods (with a body, inherited by implementers, used to evolve interfaces without breaking them) and `static` methods (utility methods called on the interface). Java 9 added `private` methods to share code between defaults.",
      ],
      [
        "Marker interfaces",
        "A marker interface has no methods; implementing it tags the class for special treatment. `Serializable` lets `ObjectOutputStream` serialize the class, `Cloneable` lets `Object.clone()` work, and `RandomAccess` tells algorithms a List supports fast index access. Annotations are the modern alternative for metadata, but markers have the advantage of being types you can check with `instanceof` at compile time.",
      ],
      [
        "When to use interfaces",
        "Use an interface when unrelated classes should share a capability (Comparable, AutoCloseable), when you want to program to a contract and swap implementations (List, Repository), for callbacks and lambdas (functional interfaces with one abstract method), and to allow multiple inheritance of type.",
      ],
    ],
    code: String.raw`import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.RandomAccess;

public class Main {
    interface Flyer {
        int MAX_ALTITUDE = 10_000;                         // public static final
        String fly();                                       // public abstract
        default String describe() { return "I can " + fly() + suffix(); }
        private String suffix() { return " (max " + MAX_ALTITUDE + " m)"; }
        static Flyer glider() { return () -> "glide"; }    // static factory
    }

    interface Swimmer { String swim(); }

    interface Amphibious extends Flyer, Swimmer { }        // interface extends two interfaces

    static class Duck implements Amphibious, Serializable { // marker interface too
        public String fly() { return "fly"; }
        public String swim() { return "paddle"; }
    }

    static class Plane implements Flyer {
        public String fly() { return "fly with engines"; }
    }

    static String accessStyle(List<?> list) {
        return list instanceof RandomAccess ? "index loop is fast" : "use an iterator";
    }

    public static void main(String[] args) {
        Duck duck = new Duck();
        System.out.println(duck.describe() + ", and " + duck.swim());
        System.out.println(new Plane().describe());
        System.out.println(Flyer.glider().describe());

        Flyer asFlyer = duck;                               // one object, many types
        Swimmer asSwimmer = duck;
        System.out.println("duck is Flyer: " + (asFlyer != null) + ", Swimmer: " + (asSwimmer != null)
                + ", Serializable: " + (duck instanceof Serializable));
        System.out.println("Plane is Serializable: " + (new Plane() instanceof Serializable));

        System.out.println("ArrayList: " + accessStyle(new ArrayList<>()));
        System.out.println("LinkedList: " + accessStyle(new LinkedList<>()));
    }
}`,
    walk:
      "`Flyer` shows every kind of interface member: a constant, an abstract method, a default method that uses a private helper, and a static factory that returns a lambda. `Amphibious` extends two interfaces, and `Duck` implements it plus the marker `Serializable`.\n\nThe same `Duck` object can be referenced as a `Flyer` or a `Swimmer`, which is multiple inheritance of type. The marker checks show `Duck` is serializable while `Plane` is not, and `accessStyle` uses the `RandomAccess` marker to tell an `ArrayList` from a `LinkedList`.",
    anim: [
      "One class, several contracts",
      [
        ["flyer", "Flyer", "fly()"],
        ["swimmer", "Swimmer", "swim()"],
        ["amph", "Amphibious", "extends both"],
        ["ser", "Serializable", "marker"],
        ["duck", "Duck", "implements"],
      ],
      [
        ["flyer", "amph", "extends", "Amphibious inherits the Flyer contract..."],
        ["swimmer", "amph", "extends", "...and the Swimmer contract: an interface can extend many interfaces."],
        ["amph", "duck", "implements", "Duck implements both methods and so is a Flyer and a Swimmer."],
        ["ser", "duck", "marks", "Implementing the empty Serializable interface marks Duck as serializable."],
      ],
    ],
    mistakes: [
      "Declaring interface constants for configuration and implementing the interface to use them (the \"constant interface\" anti-pattern); use a final class or enum.",
      "Adding an abstract method to a published interface, which breaks every implementer; add a default method instead.",
    ],
    qa: [
      ["What is a marker interface?", "An interface with no methods, such as `Serializable`, `Cloneable` or `RandomAccess`, used to signal that a class has a property or permission."],
      ["Can an interface have a constructor or instance fields?", "No. Interfaces can have constants, abstract, default, static and private methods, but no constructors or instance state."],
      ["How does Java achieve multiple inheritance?", "Through interfaces: a class can implement several interfaces, and interfaces can extend several interfaces."],
      ["Why were default methods added?", "To let interfaces such as `Collection` gain new methods (like `stream()`) in Java 8 without breaking existing implementations."],
    ],
    ex: [
      "Make `Duck` also implement `Comparable<Duck>` comparing by a new `weight` field. Which method must it add?",
      "`public int compareTo(Duck other) { return Double.compare(weight, other.weight); }`. Then a `List<Duck>` can be sorted with `Collections.sort`.",
    ],
  }),

  lesson("Abstract Classes", {
    intro:
      "An abstract class is a class that cannot be instantiated and may contain abstract methods for subclasses to implement. It sits between an interface and a concrete class: it can hold state, constructors and shared code while leaving some steps open. This lesson covers abstract classes and methods, their rules, the template method pattern and when to choose an abstract class over an interface.",
    topics: [
      [
        "Abstract classes and abstract methods",
        "Mark a class `abstract` to forbid `new` on it. An abstract method has no body (`abstract double area();`) and must be implemented by every concrete subclass. A class with any abstract method must itself be abstract, but an abstract class may have no abstract methods at all.",
      ],
      [
        "What an abstract class can contain",
        "Everything a normal class can: instance fields, constructors (called by subclasses through `super`), concrete methods, static members and final methods. That makes it ideal for sharing state and logic among closely related classes.",
      ],
      [
        "Rules",
        "An abstract method cannot be `private` (it must be overridable), `static`, or `final`. An abstract class cannot be `final`. A subclass that does not implement all abstract methods must also be abstract.",
      ],
      [
        "When to use an abstract class vs an interface",
        "Choose an abstract class when related classes share code and state (fields), need constructors, or need non-public members, and when you want a fixed algorithm skeleton (template method). Choose an interface for capabilities that unrelated classes can share and when a class needs several of them. A common design combines both: an interface for the contract and an abstract base class implementing it.",
      ],
    ],
    code: String.raw`public class Main {
    static abstract class Employee {
        private final String name;
        protected final double baseSalary;
        private static int count = 0;

        protected Employee(String name, double baseSalary) {   // constructor in abstract class
            this.name = name;
            this.baseSalary = baseSalary;
            count++;
        }

        abstract double bonus();                               // each subclass decides

        public final String payslip() {                       // template method, cannot be overridden
            double total = baseSalary + bonus() - tax();
            return String.format("%-8s %-9s base=%8.0f bonus=%7.0f tax=%7.0f net=%8.0f",
                    name, getClass().isAnonymousClass() ? getClass().getSuperclass().getSimpleName() : getClass().getSimpleName(), baseSalary, bonus(), tax(), total);
        }

        protected double tax() { return (baseSalary + bonus()) * 0.10; }   // default, overridable
        static int count() { return count; }
    }

    static class Engineer extends Employee {
        Engineer(String name, double base) { super(name, base); }
        double bonus() { return baseSalary * 0.15; }
    }

    static class Manager extends Employee {
        private final int reports;
        Manager(String name, double base, int reports) { super(name, base); this.reports = reports; }
        double bonus() { return 5_000 * reports; }
        @Override protected double tax() { return super.tax() + 2_000; }
    }

    static abstract class Intern extends Employee {          // still abstract: bonus not implemented
        Intern(String name) { super(name, 20_000); }
    }

    public static void main(String[] args) {
        Employee[] staff = {
            new Engineer("Asha", 100_000),
            new Manager("Vikram", 150_000, 4),
            new Intern("Neel") { double bonus() { return 0; } }  // anonymous concrete subclass
        };
        for (Employee e : staff) System.out.println(e.payslip());
        System.out.println("Employees created: " + Employee.count());
        // new Employee("x", 1);  // compile error: Employee is abstract
    }
}`,
    walk:
      "`Employee` is abstract: it has fields, a constructor, a static counter, an abstract `bonus()`, an overridable `tax()` and a final `payslip()` template that fixes the calculation steps.\n\n`Engineer` and `Manager` implement `bonus()`; `Manager` also extends `tax()` using `super.tax()`. `Intern` does not implement `bonus()`, so it must stay abstract; `main` creates a concrete anonymous subclass of it inline. Each payslip is produced by the same template but with each class's own bonus and tax.",
    anim: [
      "Template method in an abstract class",
      [
        ["call", "payslip()", "final template"],
        ["base", "baseSalary", "shared field"],
        ["bonus", "bonus()", "abstract step"],
        ["tax", "tax()", "default step"],
        ["net", "net pay", "result"],
      ],
      [
        ["call", "base", "read", "The template reads the base salary stored in the abstract class."],
        ["call", "bonus", "dispatch", "It calls the abstract bonus(); each subclass supplies its own."],
        ["call", "tax", "dispatch", "tax() has a default that Manager overrides to add a surcharge."],
        ["tax", "net", "combine", "The fixed formula base + bonus - tax gives the net pay for every type."],
      ],
    ],
    mistakes: [
      "Making a class abstract just to prevent instantiation of a utility class; use a private constructor instead.",
      "Calling abstract methods from the abstract class's constructor; the subclass fields are not initialised yet.",
    ],
    qa: [
      ["Can an abstract class have a constructor?", "Yes. It runs when a subclass object is created, through `super(...)`."],
      ["Can an abstract class have no abstract methods?", "Yes. It is still not instantiable; this is used for base classes that only make sense when extended."],
      ["Can an abstract method be static, private or final?", "No. Abstract methods must be overridable, which static, private and final methods are not."],
      ["When should you use an abstract class instead of an interface?", "When subclasses are closely related and need shared state, constructors, non-public members or a fixed algorithm skeleton."],
    ],
    ex: [
      "Add a `Contractor` employee whose bonus is 0 and whose tax is a flat 5%. Write the class.",
      "`class Contractor extends Employee { Contractor(String n, double b) { super(n, b); } double bonus() { return 0; } @Override protected double tax() { return baseSalary * 0.05; } }`.",
    ],
  }),

  lesson("Interface vs Abstract Class: 10 Differences", {
    intro:
      "\"What is the difference between an interface and an abstract class?\" is one of the most common Java interview questions. Since Java 8 and 9 added default, static and private interface methods, the answer has nuances. This lesson lists ten concrete differences and demonstrates each in code.",
    topics: [
      [
        "1-3: Keyword, inheritance count and state",
        "1. Declared with `interface` vs `abstract class`. 2. A class can implement many interfaces but extend only one abstract class. 3. Interfaces have no instance fields (only `public static final` constants); abstract classes can have any fields, including mutable instance state.",
      ],
      [
        "4-6: Constructors, method kinds and access",
        "4. Interfaces cannot have constructors; abstract classes can. 5. Interface methods are abstract, default, static or private; abstract classes can mix abstract and concrete methods freely, including `final` and `protected` ones. 6. Interface members are implicitly public (except private methods); abstract class members can be public, protected, package-private or private.",
      ],
      [
        "7-8: Keywords used by subclasses and extension",
        "7. Classes use `implements` for interfaces and `extends` for abstract classes. 8. An interface can extend several interfaces; an abstract class can extend one class and implement several interfaces.",
      ],
      [
        "9-10: Purpose and evolution",
        "9. An interface describes a capability (\"can do\": Comparable, Runnable) shared by unrelated classes; an abstract class describes a base identity (\"is a\": AbstractList) for closely related classes. 10. Lambdas can implement functional interfaces (one abstract method), never abstract classes; and adding a method to an interface needs a default to stay compatible, whereas an abstract class can add concrete methods freely.",
      ],
    ],
    code: String.raw`public class Main {
    interface Drivable {                                  // 1. interface keyword
        int WHEELS = 4;                                   // 3. only constants
        void drive();                                     // 6. implicitly public abstract
        default String horn() { return "beep"; }          // 5. default method
        static Drivable of(String n) { return () -> System.out.println(n + " drives (lambda)"); } // 10.
    }
    interface Electric { default String charge() { return "charging"; } }
    interface SmartVehicle extends Drivable, Electric { }  // 8. extends many interfaces

    static abstract class Vehicle {                        // 1. abstract class keyword
        protected int mileage;                             // 3. mutable instance state
        private final String plate;
        protected Vehicle(String plate) { this.plate = plate; }  // 4. constructor
        abstract void service();
        final String plate() { return plate; }             // 5. final concrete method
        protected void addMiles(int m) { mileage += m; }   // 6. protected member
    }

    // 2 & 7: extends one abstract class, implements several interfaces
    static class Tesla extends Vehicle implements SmartVehicle {
        Tesla(String plate) { super(plate); }
        public void drive() { addMiles(120); System.out.println(plate() + " drives, mileage " + mileage); }
        void service() { System.out.println(plate() + " gets a software update"); }
    }

    public static void main(String[] args) {
        Tesla car = new Tesla("KA-01-EV-9");
        car.drive();
        car.service();
        System.out.println("horn: " + car.horn() + ", " + car.charge() + ", wheels " + Drivable.WHEELS);

        Drivable quick = Drivable.of("Scooter");   // 10. lambda for an interface
        quick.drive();
        // Vehicle v = () -> {};                   // 10. impossible for an abstract class

        System.out.println("Tesla interfaces: " + Tesla.class.getInterfaces().length
                + ", superclass: " + Tesla.class.getSuperclass().getSimpleName());
    }
}`,
    walk:
      "The comments number each difference. `Drivable` has only a constant, an abstract method, a default method and a static factory; `SmartVehicle` extends two interfaces. `Vehicle` has a constructor, mutable and final fields, a final method and a protected method, none of which an interface can have.\n\n`Tesla` extends exactly one abstract class and implements an interface hierarchy. `Drivable.of` returns a lambda, which only works because `Drivable` is a functional interface; the commented line shows a lambda cannot implement an abstract class.",
    anim: [
      "Combining both in one design",
      [
        ["iface", "SmartVehicle", "interfaces"],
        ["abs", "Vehicle", "abstract class"],
        ["tesla", "Tesla", "concrete class"],
        ["lambda", "Drivable lambda", "functional"],
      ],
      [
        ["abs", "tesla", "extends 1", "Tesla extends exactly one abstract class and inherits its state."],
        ["iface", "tesla", "implements", "Tesla also implements an interface hierarchy: many types at once."],
        ["iface", "lambda", "lambda", "A lambda can implement the single-method Drivable interface."],
        ["abs", "lambda", "not allowed", "No lambda can implement Vehicle, because it is an abstract class."],
      ],
    ],
    mistakes: [
      "Saying interfaces cannot have method bodies; since Java 8 default and static methods can.",
      "Choosing an abstract class when unrelated classes need the capability; that forces them into one hierarchy.",
    ],
    qa: [
      ["Can an interface have a concrete method?", "Yes, default and static methods have bodies (Java 8), and private methods too (Java 9)."],
      ["Can an abstract class implement an interface without implementing its methods?", "Yes. The abstract class may leave interface methods unimplemented; the first concrete subclass must implement them."],
      ["Which is faster, an interface call or an abstract class call?", "There is no meaningful difference in modern JVMs; the JIT optimises both. Choose by design, not speed."],
    ],
    ex: [
      "You are designing `Shape` for Circle, Square and Triangle, which all store a colour and a name. Interface, abstract class or both? Justify.",
      "Both: a `Shape` interface for the contract (area, perimeter) used by callers, and an `AbstractShape` class implementing it to hold the shared colour and name fields and constructor.",
    ],
  }),

  lesson("Access Modifiers: private, default, protected and public", {
    intro:
      "Access modifiers control which code can see a class, field, method or constructor. Java has four levels, from most to least restrictive: private, package-private (no keyword, often called default), protected and public. This lesson explains each level, what top-level classes may use, how protected really works across packages, and how overriding interacts with access.",
    topics: [
      [
        "private",
        "Visible only inside the same top-level class (including its nested classes). Use it for fields and internal helpers. A private method cannot be overridden.",
      ],
      [
        "Package-private (default)",
        "With no modifier, a member is visible to all code in the same package and nowhere else, even to subclasses in other packages. It is useful for package-internal collaborators.",
      ],
      [
        "protected",
        "Visible in the same package and in subclasses in other packages. From a different package, a subclass can access a protected member only through a reference of its own type (or `this`/`super`), not through an arbitrary parent-type reference.",
      ],
      [
        "public",
        "Visible everywhere (subject to module exports since Java 9). Use it for the API you intend others to call.",
      ],
      [
        "Top-level classes and overriding rules",
        "Top-level classes and interfaces can be only `public` or package-private; nested classes can use all four. When overriding, you can keep or widen access (protected to public) but never narrow it (public to protected does not compile), because callers using the parent type must still be able to call the method.",
      ],
    ],
    code: String.raw`public class Main {
    static class Account {
        private double balance = 1_000;           // only inside the top-level class Main
        String branch = "Pune";                   // package-private
        protected String type = "savings";        // package + subclasses
        public String owner = "Meera";            // everyone

        private void audit() { System.out.println("  private audit, balance " + balance); }
        void branchReport() { System.out.println("  package-private report for " + branch); }
        protected double interestRate() { return 0.04; }
        public void summary() { audit(); System.out.println("  public summary for " + owner); }
    }

    static class PremiumAccount extends Account {
        @Override public double interestRate() { return 0.06; }   // widened protected -> public: allowed
        // @Override private double interestRate() {...}         // narrowing: compile error
        void show() {
            System.out.println("  subclass sees protected type: " + type);
            System.out.println("  subclass sees package branch (same package): " + branch);
        }
    }

    public static void main(String[] args) throws NoSuchMethodException {
        Account account = new Account();
        System.out.println("public field: " + account.owner);
        System.out.println("protected field (same package): " + account.type);
        System.out.println("private field (nested class of Main, still allowed): " + account.balance);
        account.summary();
        account.branchReport();

        PremiumAccount premium = new PremiumAccount();
        premium.show();
        System.out.println("rate via Account ref: " + ((Account) premium).interestRate());

        System.out.println("modifiers of interestRate in PremiumAccount: "
                + java.lang.reflect.Modifier.toString(
                    PremiumAccount.class.getDeclaredMethod("interestRate").getModifiers()));
    }
}`,
    walk:
      "Because every class here is nested inside `Main` and in the same (default) package, `main` can reach all four levels, even the private `balance`: private access is scoped to the top-level class, which includes its nested classes. In a separate file in another package, only `owner` and `summary()` would be accessible.\n\n`PremiumAccount` widens `interestRate()` from protected to public, which is allowed, and calling it through an `Account` reference still runs the subclass version. Reflection confirms the overriding method is public.",
    anim: [
      "Who can see what",
      [
        ["priv", "private", "same class only"],
        ["def", "default", "same package"],
        ["prot", "protected", "package + subclass"],
        ["pub", "public", "everyone"],
        ["other", "Other package", "outside code"],
      ],
      [
        ["priv", "def", "wider", "Package-private adds every class in the same package."],
        ["def", "prot", "wider", "protected adds subclasses in other packages."],
        ["prot", "pub", "wider", "public adds all other code."],
        ["other", "pub", "allowed", "Unrelated code in another package can only reach public members."],
      ],
    ],
    mistakes: [
      "Making everything public; start with private and widen only when needed.",
      "Expecting package-private members to be visible to subclasses in other packages.",
      "Reducing visibility in an override, which does not compile.",
    ],
    qa: [
      ["What are the access modifiers in Java?", "private, package-private (default, no keyword), protected and public."],
      ["Can a top-level class be private or protected?", "No, only public or package-private. Nested classes can be private or protected."],
      ["Can you reduce the visibility of an overridden method?", "No. An override may keep or increase visibility but never decrease it."],
    ],
    ex: [
      "Order these from least to most visible and say which ones a subclass in another package can use: public, private, protected, default.",
      "private < default < protected < public. A subclass in another package can use protected and public members only.",
    ],
  }),

  lesson("Method Overloading", {
    intro:
      "Method overloading means defining several methods with the same name in a class, differing in their parameter lists. It gives a natural API (`println(int)`, `println(String)`) and is resolved by the compiler. This lesson covers the rules, what does and does not count as a different signature, how the compiler picks an overload, and overloading `main` and static methods.",
    topics: [
      [
        "Rules of overloading",
        "Overloads must differ in the number, types or order of parameters. Return type, parameter names, access modifiers and thrown exceptions alone do not count: two methods differing only in return type will not compile. Overloads can have different return types and modifiers as long as parameters differ.",
      ],
      [
        "How the compiler chooses an overload",
        "In order: exact match, then widening primitive conversion (int to long), then boxing (int to Integer), then varargs. Among candidates it picks the most specific one; if two are equally specific the call is ambiguous and does not compile (for example `f(null)` with `f(String)` and `f(Integer)`).",
      ],
      [
        "Overloading static methods and main",
        "Static methods can be overloaded. Even `main` can be overloaded, but the JVM only calls `public static void main(String[])` (or, in newer Java, a matching instance main); other overloads are ordinary methods.",
      ],
      [
        "Overloading and inheritance",
        "A subclass can add overloads of an inherited method; that is overloading, not overriding, because the parameter list differs. Be careful: `equals(Employee e)` overloads `equals(Object)` instead of overriding it, a classic bug.",
      ],
    ],
    code: String.raw`public class Main {
    static int area(int side) { return side * side; }
    static int area(int length, int width) { return length * width; }
    static double area(double radius) { return Math.PI * radius * radius; }
    static String describe(int a, String b) { return "int, String"; }
    static String describe(String b, int a) { return "String, int"; }   // order differs

    static String pick(long x) { return "long (widening)"; }
    static String pick(Integer x) { return "Integer (boxing)"; }
    static String pick(int... x) { return "varargs"; }

    static String which(Object o) { return "Object"; }
    static String which(String s) { return "String (more specific)"; }

    // static int area(int side) { ... } returning long -> compile error: return type alone is not enough

    public static void main(String[] args) {
        System.out.println("square 4: " + area(4));
        System.out.println("rectangle 3x5: " + area(3, 5));
        System.out.printf("circle r=2: %.2f%n", area(2.0));
        System.out.println(describe(1, "x") + " / " + describe("x", 1));

        System.out.println("pick(5) -> " + pick(5));         // widening beats boxing
        System.out.println("pick(Integer.valueOf(5)) -> " + pick(Integer.valueOf(5)));
        System.out.println("pick() -> " + pick());

        System.out.println("which(\"hi\") -> " + which("hi"));
        System.out.println("which(null) -> " + which(null));  // String is more specific than Object
        Object o = "hi";
        System.out.println("which(Object o) -> " + which(o)); // declared type decides

        main(new String[0], "overloaded main");
    }

    static void main(String[] args, String note) {
        System.out.println("called " + note + " (the JVM never calls this one)");
    }
}`,
    walk:
      "Three `area` overloads differ in parameter count and type, and two `describe` overloads differ only in parameter order; the compiler picks by the arguments.\n\n`pick(5)` prefers widening to `long` over boxing to `Integer`, and varargs is the last resort. `which(null)` chooses `String` because it is more specific than `Object`, while `which(o)` chooses `Object` because overloads are selected by the declared type. Finally, `main` is overloaded with a second version that the program calls explicitly.",
    anim: [
      "How javac picks an overload",
      [
        ["call", "pick(5)", "int argument"],
        ["exact", "pick(int)?", "phase 1: exact"],
        ["widen", "pick(long)", "phase 1: widening"],
        ["box", "pick(Integer)", "phase 2: boxing"],
        ["var", "pick(int...)", "phase 3: varargs"],
      ],
      [
        ["call", "exact", "look", "javac first looks for an exact pick(int); there is none."],
        ["exact", "widen", "widen", "Still in phase 1, widening int to long matches pick(long): chosen."],
        ["widen", "box", "skipped", "Boxing to Integer is only tried if phase 1 found nothing."],
        ["box", "var", "last", "Varargs is the final fallback, used for pick() with no arguments."],
      ],
    ],
    mistakes: [
      "Overloading with `Object` and `String` and passing `null`, or with `Integer` and `String`, which is ambiguous.",
      "Writing `equals(MyType other)` and believing it overrides `equals(Object)`.",
      "Overloads that do very different things; overloaded methods should be variations of one operation.",
    ],
    qa: [
      ["Can two methods differ only by return type?", "No. The parameter lists must differ; the return type is not part of the signature for overloading."],
      ["Can main be overloaded?", "Yes, but only the standard `main(String[])` is used as the entry point."],
      ["Is overloading resolved at compile time or runtime?", "At compile time, using the declared types of the arguments."],
    ],
    ex: [
      "Given `void f(long x)` and `void f(Integer x)`, which runs for `f(10)`? What if only `f(Long x)` and `f(Object x)` exist?",
      "`f(long)`: widening beats boxing. With only `f(Long)` and `f(Object)`, `f(10)` boxes to `Integer`, which is not a `Long`, so `f(Object)` runs.",
    ],
  }),

  lesson("Method Overriding and the @Override Annotation", {
    intro:
      "Method overriding lets a subclass replace an inherited method's implementation with its own, while keeping the same signature. It is the basis of runtime polymorphism. This lesson covers the rules of overriding (signature, return type, access, exceptions), the `@Override` annotation, what cannot be overridden, and calling the parent version with `super`.",
    topics: [
      [
        "Rules of overriding",
        "Same name and parameter types as the parent method. The return type must be the same or a subtype (covariant return). Access must be the same or wider. The method may throw fewer or narrower checked exceptions, never new or broader ones; unchecked exceptions are unrestricted.",
      ],
      [
        "The @Override annotation",
        "`@Override` asks the compiler to verify the method really overrides something. A typo such as `tostring()` or a wrong parameter type then becomes a compile error instead of a silent new method. Always use it.",
      ],
      [
        "What cannot be overridden",
        "`final` methods (to lock behaviour), `static` methods (hidden instead), `private` methods (not inherited, so a same-named subclass method is unrelated) and constructors.",
      ],
      [
        "Calling the parent implementation",
        "`super.method()` inside the override runs the parent version, letting you extend behaviour instead of replacing it entirely, for example adding a log line and then calling `super.save()`.",
      ],
      [
        "Covariant return type in overriding",
        "Since Java 5 an override may return a subtype of the parent's return type, so `Animal reproduce()` can be overridden as `Dog reproduce()`. The next lesson covers it in detail.",
      ],
    ],
    code: String.raw`import java.io.FileNotFoundException;
import java.io.IOException;

public class Main {
    static class Document {
        String title = "untitled";
        protected String render() { return "[plain] " + title; }
        Document copy() { Document d = new Document(); d.title = title + " (copy)"; return d; }
        void save() throws IOException { System.out.println("  Document.save writes bytes"); }
        final String id() { return "DOC-" + title.hashCode() % 100; }
        static String kind() { return "document"; }
        private String secret() { return "parent secret"; }
    }

    static class Report extends Document {
        @Override public String render() { return "[report] " + title.toUpperCase(); } // wider access
        @Override Report copy() { Report r = new Report(); r.title = title + " (report copy)"; return r; } // covariant
        @Override void save() throws FileNotFoundException {                         // narrower exception
            System.out.println("  Report.save validates first");
            try { super.save(); } catch (IOException e) { throw new FileNotFoundException(e.getMessage()); }
        }
        // String id() { ... }            // compile error: id() is final
        static String kind() { return "report"; }        // hides, does not override
        private String secret() { return "child secret"; } // unrelated new method
        // @Override public String tostring() { ... }   // compile error thanks to @Override
    }

    public static void main(String[] args) throws IOException {
        Document doc = new Report();
        doc.title = "Q3 sales";
        System.out.println(doc.render());                 // runtime polymorphism
        Document copy = doc.copy();
        System.out.println(copy.getClass().getSimpleName() + ": " + copy.title);
        doc.save();
        System.out.println("final id(): " + doc.id().startsWith("DOC-"));
        System.out.println("static kind() through Document ref: " + Document.kind());
        System.out.println("private methods are not overridden: " + new Document().secret());
    }
}`,
    walk:
      "`Report.render()` overrides `Document.render()` and widens access to public; through the `Document` reference the report version runs. `copy()` returns `Report`, a covariant return. `save()` declares a narrower checked exception and calls `super.save()` to extend rather than replace behaviour.\n\nThe commented lines show what fails to compile: overriding a `final` method, and a misspelled method marked `@Override`. `kind()` is static, so `Report.kind()` only hides it, and `secret()` is private, so the child's version is a separate method.",
    anim: [
      "Override extends the parent",
      [
        ["ref", "Document doc", "reference"],
        ["obj", "Report object", "runtime type"],
        ["child", "Report.save()", "validates"],
        ["parent", "super.save()", "writes bytes"],
        ["done", "saved", "both ran"],
      ],
      [
        ["ref", "obj", "dispatch", "doc.save() is dispatched to the actual Report object."],
        ["obj", "child", "override", "Report's override runs first and validates the document."],
        ["child", "parent", "super", "super.save() then runs the original Document implementation."],
        ["parent", "done", "return", "The override extended the parent's behaviour instead of replacing it."],
      ],
    ],
    mistakes: [
      "Forgetting `@Override` and accidentally overloading (wrong parameter type) or misspelling the name.",
      "Throwing a broader checked exception in the override, which does not compile.",
      "Expecting a static method in the subclass to override the parent's.",
    ],
    qa: [
      ["What are the rules for method overriding?", "Same signature; same or covariant return type; same or wider access; no new or broader checked exceptions; not final, static or private in the parent."],
      ["Is @Override mandatory?", "No, but it makes the compiler check that the method really overrides one, which prevents subtle bugs."],
      ["Can a private method be overridden?", "No. Private methods are not inherited; a method with the same name in the subclass is a new, unrelated method."],
    ],
    ex: [
      "Override `toString()` in `Report` but declare it as `protected`. What happens and why?",
      "Compile error: `Object.toString()` is public and an override cannot reduce visibility. Declare it `public String toString()`.",
    ],
  }),

  lesson("Overloading vs Overriding: 10 Differences", {
    intro:
      "Overloading and overriding sound alike but are opposites in many ways: one is resolved by the compiler within a class, the other by the JVM across a class hierarchy. This lesson lists ten differences and demonstrates them side by side.",
    topics: [
      [
        "1-3: Where, signature and binding",
        "1. Overloading happens within one class (or with inherited methods); overriding needs a parent and a child class. 2. Overloading requires different parameter lists; overriding requires the same parameter list. 3. Overloading is compile-time (static) polymorphism; overriding is runtime (dynamic) polymorphism.",
      ],
      [
        "4-6: Return type, access and exceptions",
        "4. Overloaded methods can have any return type; overriding needs the same or a covariant return type. 5. Overloads can have any access modifiers; overrides cannot reduce access. 6. Overloads can throw any exceptions; overrides cannot add new or broader checked exceptions.",
      ],
      [
        "7-8: static, private and final",
        "7. Static methods can be overloaded but not overridden (only hidden). 8. Private and final methods can be overloaded but not overridden.",
      ],
      [
        "9-10: Purpose and decision basis",
        "9. Overloading increases readability by offering variants of one operation (`print(int)`, `print(String)`); overriding provides a specific implementation of an inherited behaviour. 10. Overload selection is based on the declared (compile-time) types of the arguments; override selection is based on the runtime type of the object the method is called on.",
      ],
    ],
    code: String.raw`public class Main {
    static class Calculator {
        int add(int a, int b) { return a + b; }                          // 1, 2: same class, different params
        double add(double a, double b) { return a + b; }                 // 4: different return type ok
        private String add(String a, String b) { return a + b; }         // 5, 8: private overload ok
        static int multiply(int a, int b) { return a * b; }              // 7: static overload
        static int multiply(int a, int b, int c) { return a * b * c; }
        Number result() { return 0; }
        String name() { return "Calculator"; }
        String concat(String a, String b) { return add(a, b); }
    }

    static class ScientificCalculator extends Calculator {
        @Override int add(int a, int b) {                                // same params: overriding
            System.out.print("  [sci override] ");
            return super.add(a, b);
        }
        @Override Integer result() { return 42; }                        // 4: covariant return
        @Override public String name() { return "ScientificCalculator"; } // 5: wider access
        static int multiply(int a, int b) { return -1; }                 // 7: hides, not overrides
    }

    static String kind(Calculator c) { return "Calculator param"; }
    static String kind(ScientificCalculator c) { return "ScientificCalculator param"; }

    public static void main(String[] args) {
        Calculator calc = new ScientificCalculator();
        System.out.println("add(int,int): " + calc.add(2, 3));           // 3: runtime -> override
        System.out.println("add(double,double): " + calc.add(2.5, 3.5)); // compile-time overload
        System.out.println("concat: " + calc.concat("Ja", "va"));
        System.out.println("multiply 3 args: " + Calculator.multiply(2, 3, 4));
        System.out.println("static via Calculator: " + Calculator.multiply(2, 3) + ", via Scientific: " + ScientificCalculator.multiply(2, 3));
        System.out.println("covariant result: " + calc.result() + ", name: " + calc.name());
        System.out.println("overload chosen by declared type: " + kind(calc));          // 10
        System.out.println("override chosen by object type: " + calc.getClass().getSimpleName());
    }
}`,
    walk:
      "`calc` is declared as `Calculator` but refers to a `ScientificCalculator`. Calling `add(2, 3)` runs the override (it prints the marker) because overriding follows the object. `add(2.5, 3.5)` picks the double overload at compile time.\n\nThe private overload of `add` is used internally by `concat`. Static `multiply` is overloaded in `Calculator` and only hidden in the subclass. `result()` uses a covariant return and `name()` widens access. Finally `kind(calc)` chooses the `Calculator` overload from the declared type, even though the object is a `ScientificCalculator`.",
    anim: [
      "Compiler vs JVM decisions",
      [
        ["src", "calc.add(...)", "call site"],
        ["javac", "javac", "picks overload"],
        ["sig", "add(int, int)", "signature fixed"],
        ["jvm", "JVM", "picks override"],
        ["impl", "Scientific.add", "runs"],
      ],
      [
        ["src", "javac", "compile", "At compile time javac looks at argument types: two ints."],
        ["javac", "sig", "overloading", "It selects the add(int, int) signature; that is overloading resolution."],
        ["sig", "jvm", "runtime", "At runtime the JVM sees the object is a ScientificCalculator."],
        ["jvm", "impl", "overriding", "It runs the overriding version of that signature: dynamic dispatch."],
      ],
    ],
    mistakes: [
      "Saying static methods can be overridden; they are hidden.",
      "Believing an override can change parameter types; that creates an overload.",
    ],
    qa: [
      ["Give three key differences between overloading and overriding.", "Overloading: same class, different parameters, compile-time. Overriding: subclass, same parameters, runtime. Overrides also must respect return-type, access and exception rules."],
      ["Can we overload and override at the same time?", "Yes. A subclass can override one version of a method and add another overload with different parameters."],
      ["Which is decided by the object type?", "Overriding. Overloading is decided by the declared types of the arguments."],
    ],
    ex: [
      "In `ScientificCalculator`, add `int add(int a, int b, int c)`. Is that overloading or overriding, and can it be called through a `Calculator` reference?",
      "Overloading (different parameter list). It cannot be called through a `Calculator` reference, because the compiler only sees methods declared in `Calculator`.",
    ],
  }),

  lesson("Covariant Return Type", {
    intro:
      "A covariant return type lets an overriding method return a more specific type than the method it overrides. It was added in Java 5 and removes many casts from client code. This lesson explains the rule, shows typical uses such as `clone()` and builders, and explains how the compiler implements it with bridge methods.",
    topics: [
      [
        "The rule",
        "If a parent method returns type `T`, an override may return `T` or any subtype of `T`. It applies only to reference types: an override of a method returning `int` must return `int`, not `short`.",
      ],
      [
        "Why it is useful",
        "Without it, code calling `dog.reproduce()` would receive an `Animal` and need a cast to `Dog`. With it, the subclass override returns `Dog` and callers that know they have a `Dog` get the precise type for free.",
      ],
      [
        "Typical uses",
        "Overriding `clone()` to return the class itself (`public Point clone()`), fluent builders in class hierarchies, and factory methods such as `copy()` or `withName()` returning the subclass type.",
      ],
      [
        "Bridge methods",
        "The JVM matches methods by exact descriptor, including return type. To make covariant returns work, javac generates a synthetic bridge method with the parent's return type that calls the covariant one. You can see it with reflection (`isBridge()`).",
      ],
    ],
    code: String.raw`import java.lang.reflect.Method;

public class Main {
    static class Animal {
        Animal reproduce() { return new Animal(); }
        public String toString() { return "Animal"; }
    }

    static class Dog extends Animal {
        @Override Dog reproduce() { return new Dog(); }        // covariant: Dog is an Animal
        void bark() { System.out.println("  puppy barks"); }
        public String toString() { return "Dog"; }
    }

    static class Point implements Cloneable {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
        @Override public Point clone() {                       // Object.clone() returns Object
            try { return (Point) super.clone(); }
            catch (CloneNotSupportedException e) { throw new AssertionError(e); }
        }
        public String toString() { return "Point(" + x + "," + y + ")"; }
    }

    public static void main(String[] args) {
        Dog dog = new Dog();
        Dog puppy = dog.reproduce();     // no cast needed
        puppy.bark();
        Animal generic = dog;
        System.out.println("through Animal ref: " + generic.reproduce());

        Point p = new Point(3, 4);
        Point copy = p.clone();          // no cast needed
        copy.x = 99;
        System.out.println("original " + p + ", clone " + copy);

        Method[] methods = Dog.class.getDeclaredMethods();
        java.util.Arrays.sort(methods, java.util.Comparator.comparing(Method::isBridge));
        for (Method m : methods) {
            if (m.getName().equals("reproduce")) {
                System.out.println("Dog." + m.getName() + " returns " + m.getReturnType().getSimpleName()
                        + (m.isBridge() ? " (bridge generated by javac)" : " (the method you wrote)"));
            }
        }
    }
}`,
    walk:
      "`Dog.reproduce()` returns `Dog`, so `dog.reproduce()` can call `bark()` without a cast. Through an `Animal` reference the call still runs the `Dog` override and prints \"Dog\".\n\n`Point.clone()` narrows `Object.clone()`'s return type to `Point`, so client code needs no cast. Reflection lists two `reproduce` methods in `Dog`: the real one returning `Dog` and a synthetic bridge returning `Animal` that javac generated so the JVM can dispatch calls made through `Animal`.",
    anim: [
      "Covariant return and the bridge",
      [
        ["call", "a.reproduce()", "via Animal ref"],
        ["bridge", "bridge method", "returns Animal"],
        ["real", "Dog.reproduce()", "returns Dog"],
        ["direct", "dog.reproduce()", "Dog ref"],
        ["result", "new Dog", "object"],
      ],
      [
        ["call", "bridge", "descriptor", "A call through Animal uses the descriptor returning Animal, which is the bridge."],
        ["bridge", "real", "delegates", "The synthetic bridge simply calls the real covariant method."],
        ["direct", "real", "direct", "A call through a Dog reference uses the Dog-returning method directly."],
        ["real", "result", "return", "Either way a Dog object comes back, with no cast in client code."],
      ],
    ],
    mistakes: [
      "Trying covariance with primitives (`int` to `short`); it only works for reference types.",
      "Returning an unrelated type and expecting it to compile.",
    ],
    qa: [
      ["What is a covariant return type?", "An overriding method returning a subtype of the overridden method's return type; allowed since Java 5."],
      ["Does covariance work with primitive return types?", "No. The return type must be identical for primitives."],
      ["How does the JVM support covariant returns?", "javac generates a bridge method with the original return type that delegates to the covariant method."],
    ],
    ex: [
      "Make `Point` immutable-style with `Point withX(int newX)` and a subclass `Point3D` that overrides it to return `Point3D`. Is that valid?",
      "Yes. `@Override Point3D withX(int newX) { return new Point3D(newX, y, z); }` is a covariant override, so `point3d.withX(1).z` compiles without a cast.",
    ],
  }),

  lesson("Varargs Methods", {
    intro:
      "Varargs (variable-length arguments), added in Java 5, let a method accept zero or more arguments of a type with `Type... name`. Inside the method they are an array. This lesson covers declaring and calling varargs methods, their rules, passing arrays and null, overloading pitfalls and generic varargs with `@SafeVarargs`.",
    topics: [
      [
        "Declaring and calling varargs",
        "`int sum(int... numbers)` can be called as `sum()`, `sum(5)`, `sum(1, 2, 3)` or `sum(new int[] {1, 2})`. Inside, `numbers` is an `int[]` (empty, never null, when called with no arguments).",
      ],
      [
        "Rules",
        "Only one varargs parameter per method, and it must be the last parameter: `log(String level, Object... args)`. `String.format` and `printf` are varargs methods.",
      ],
      [
        "Varargs and overloading",
        "Varargs overloads are chosen last, after exact matches, widening and boxing. Two varargs overloads such as `f(int...)` and `f(Integer...)` can make `f()` ambiguous.",
      ],
      [
        "Passing null and arrays",
        "Passing `null` to `f(String...)` passes a null array, which can cause `NullPointerException`; `f((String) null)` passes an array with one null element. Passing an existing array passes it directly, not wrapped.",
      ],
      [
        "Generic varargs and @SafeVarargs",
        "A parameter like `T... items` creates a generic array, which can cause heap pollution, so the compiler warns. If the method only reads the elements, annotate it with `@SafeVarargs` (allowed on static, final and private methods, and constructors), as `List.of` and `Arrays.asList` do.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
    static int sum(int... numbers) {
        int total = 0;
        for (int n : numbers) total += n;
        return total;
    }

    static String log(String level, Object... details) {     // varargs must be last
        return "[" + level + "] " + details.length + " detail(s): " + Arrays.toString(details);
    }

    static String count(String... items) {
        return items == null ? "null array" : items.length + " item(s)";
    }

    static String pick(int a, int b) { return "fixed (int, int)"; }
    static String pick(int... values) { return "varargs"; }

    @SafeVarargs
    static <T> List<T> listOf(T... items) {
        return new ArrayList<>(Arrays.asList(items));
    }

    public static void main(String[] args) {
        System.out.println("sum() = " + sum());
        System.out.println("sum(5) = " + sum(5));
        System.out.println("sum(1, 2, 3, 4) = " + sum(1, 2, 3, 4));
        System.out.println("sum(array) = " + sum(new int[] {10, 20}));

        System.out.println(log("INFO"));
        System.out.println(log("WARN", "disk", 91, true));

        System.out.println("pick(1, 2) -> " + pick(1, 2));      // fixed arity wins
        System.out.println("pick(1, 2, 3) -> " + pick(1, 2, 3));

        System.out.println("count() -> " + count());
        System.out.println("count((String[]) null) -> " + count((String[]) null));
        System.out.println("count((String) null) -> " + count((String) null));

        List<String> names = listOf("Asha", "Ravi", "Meera");
        names.add("Neel");
        System.out.println("generic varargs list: " + names);
        System.out.println(String.format("printf is varargs too: %s has %d letters", "Java", 4));
    }
}`,
    walk:
      "`sum` treats its varargs as an `int[]`: no arguments give an empty array and a total of 0, and an explicit array is passed straight through. `log` has a normal parameter followed by varargs of `Object`.\n\nOverload resolution prefers `pick(int, int)` for two arguments and falls back to varargs for three. Casting `null` to `String[]` passes a null array, while casting it to `String` passes an array containing one null. `listOf` is a generic varargs method marked `@SafeVarargs` because it only reads the items.",
    anim: [
      "Varargs become an array",
      [
        ["call", "sum(1, 2, 3)", "call site"],
        ["javac", "javac", "wraps args"],
        ["arr", "new int[]{1,2,3}", "array"],
        ["method", "sum(int[] n)", "inside"],
        ["res", "6", "total"],
      ],
      [
        ["call", "javac", "compile", "javac sees a varargs method and collects the trailing arguments."],
        ["javac", "arr", "wrap", "It generates code that builds a new int[] holding 1, 2 and 3."],
        ["arr", "method", "pass", "The method receives that array as its numbers parameter."],
        ["method", "res", "loop", "The method loops over the array like any other and returns 6."],
      ],
    ],
    mistakes: [
      "Declaring varargs anywhere but last, or declaring two varargs parameters.",
      "Mutating a generic varargs array or exposing it, which is what `@SafeVarargs` promises not to do.",
      "Using varargs in hot paths; each call allocates a new array.",
    ],
    qa: [
      ["What is varargs?", "A parameter declared `Type... name` that accepts zero or more arguments, received as an array."],
      ["Can a method have two varargs parameters?", "No. Only one, and it must be the last parameter."],
      ["Is `main(String... args)` valid?", "Yes. It is equivalent to `main(String[] args)`."],
    ],
    ex: [
      "Write `static double average(double first, double... rest)` that guarantees at least one argument. What does `average(4, 6, 8)` return?",
      "Sum `first` plus each element of `rest` and divide by `rest.length + 1`. `average(4, 6, 8)` returns 6.0, and `average()` does not compile.",
    ],
  }),

  lesson("The toString() Method", {
    intro:
      "Every object has a `toString()` method inherited from `Object`, used whenever an object is printed or concatenated with a string. The default output is not very helpful, so overriding it is one of the first things to do in a new class. This lesson covers the default implementation, how and when toString is called, how to override it well and modern helpers such as records.",
    topics: [
      [
        "The default Object.toString()",
        "It returns `getClass().getName() + \"@\" + Integer.toHexString(hashCode())`, for example `Main$Employee@1b6d3586`. The hex part is the hash code, not a memory address.",
      ],
      [
        "When toString() is called implicitly",
        "`System.out.println(obj)`, string concatenation `\"Value: \" + obj`, `String.valueOf(obj)`, logging frameworks and debuggers all call it. Collections' toString calls each element's toString, which is why `[Asha, Ravi]` prints nicely for strings.",
      ],
      [
        "Overriding toString well",
        "Include the fields that identify the object and help debugging, keep it cheap, never return null, avoid exposing secrets such as passwords, and do not rely on its format for parsing. Use `@Override` and consider `String.format` or `StringBuilder` for readability.",
      ],
      [
        "Arrays, null and records",
        "Arrays do not override toString (`[I@...`), so use `Arrays.toString`. `String.valueOf(null)` prints \"null\" while calling `obj.toString()` on null throws. Records (Java 16) generate a toString automatically: `Employee[name=Asha, salary=50000]`.",
      ],
    ],
    code: String.raw`import java.util.Arrays;
import java.util.List;

public class Main {
    static class Plain {
        int id = 1;
    }

    static class Employee {
        private final String name;
        private final double salary;
        private final String password = "s3cret";
        Employee(String name, double salary) { this.name = name; this.salary = salary; }

        @Override
        public String toString() {               // useful, cheap, no secrets
            return String.format("Employee{name='%s', salary=%.0f}", name, salary);
        }
    }

    record Department(String name, int size) { }

    public static void main(String[] args) {
        Plain plain = new Plain();
        String defaultText = plain.toString();
        System.out.println("default toString looks like Class@hash: "
                + defaultText.equals(plain.getClass().getName() + "@" + Integer.toHexString(plain.hashCode())));

        Employee e = new Employee("Asha", 85_000);
        System.out.println(e);                    // println calls toString
        System.out.println("Concatenated: " + e);
        System.out.println(List.of(e, new Employee("Ravi", 72_000)));

        int[] numbers = {1, 2, 3};
        System.out.println("array default starts with [I@: " + numbers.toString().startsWith("[I@"));
        System.out.println("Arrays.toString: " + Arrays.toString(numbers));

        Employee nobody = null;
        System.out.println("String.valueOf(null ref): " + String.valueOf(nobody));
        try {
            nobody.toString();
        } catch (NullPointerException ex) {
            System.out.println("calling toString on null throws NullPointerException");
        }

        System.out.println(new Department("Engineering", 42));
    }
}`,
    walk:
      "`Plain` does not override `toString`, and the program confirms the default is the class name, `@` and the hex hash code. `Employee` overrides it with a formatted string that leaves out the password.\n\n`println`, concatenation and `List.toString` all call the override implicitly. Arrays keep the unhelpful default, so `Arrays.toString` is used. `String.valueOf` handles a null reference safely, while calling `toString()` on null throws. The record prints its generated `toString` automatically.",
    anim: [
      "Where toString gets called",
      [
        ["obj", "Employee e", "object"],
        ["print", "println(e)", "printing"],
        ["concat", "\"x\" + e", "concatenation"],
        ["list", "List.toString", "collections"],
        ["ts", "e.toString()", "your override"],
      ],
      [
        ["print", "ts", "calls", "println(Object) calls String.valueOf, which calls e.toString()."],
        ["concat", "ts", "calls", "String concatenation converts e with toString() too."],
        ["list", "ts", "calls", "A List prints itself by calling toString() on each element."],
        ["obj", "ts", "override", "Overriding once improves every one of these outputs."],
      ],
    ],
    mistakes: [
      "Including passwords, tokens or personal data in toString; it ends up in logs.",
      "Writing expensive or recursive toString methods (two objects that print each other cause `StackOverflowError`).",
    ],
    qa: [
      ["What does the default toString return?", "The class name, `@`, and the hash code in hexadecimal, such as `com.app.User@6d06d69c`."],
      ["When is toString called automatically?", "When an object is printed, concatenated with a String, passed to `String.valueOf`, or printed as part of a collection."],
      ["Why override toString?", "For readable logging, debugging and error messages."],
    ],
    ex: [
      "Override `toString` in `Plain` to return `Plain#1` and print a `List` containing two `Plain` objects.",
      "`@Override public String toString() { return \"Plain#\" + id; }`. Printing `List.of(new Plain(), new Plain())` gives `[Plain#1, Plain#1]`.",
    ],
  }),

  lesson("Inner Classes: Member, Static Nested, Local and Anonymous", {
    intro:
      "Java lets you declare a class inside another class or even inside a method. Nested classes group helpers with the class that uses them, increase encapsulation, and are the basis of callbacks and iterators. This lesson covers the four kinds of nested classes: member inner classes, static nested classes, local inner classes and anonymous inner classes, plus why local and anonymous classes can only use effectively final local variables.",
    topics: [
      [
        "Member (non-static) inner classes",
        "Declared directly inside a class without `static`. Each inner object is tied to an outer object and can access all of the outer object's members, including private ones (through a hidden reference, `Outer.this`). Create one with `outer.new Inner()`. Before Java 16 they could not declare static members.",
      ],
      [
        "Static nested classes",
        "Declared with `static` inside a class. They do not have an outer instance, so they can only access the outer class's static members directly. Create one with `new Outer.Nested()`. Typical uses are builders (`Pizza.Builder`), map entries and helper types. Prefer static nested classes unless you really need the outer instance, because inner classes keep the outer object alive.",
      ],
      [
        "Local inner classes",
        "Declared inside a method or block and visible only there. They can access the enclosing class's members and the method's local variables that are final or effectively final.",
      ],
      [
        "Anonymous inner classes",
        "A class without a name, declared and instantiated in one expression: `new Comparator<String>() { public int compare(...) { ... } }`. Used for one-off implementations of an interface or subclass. For functional interfaces, lambdas are usually shorter, but anonymous classes can have state, several methods and their own `this`.",
      ],
      [
        "Why local and anonymous classes need effectively final variables",
        "Local variables live on the method's stack frame and disappear when the method returns, but the inner object may live much longer (for example in a thread or a listener). So Java copies the variable's value into the inner object. If the variable could still change afterwards, the copy and the original would disagree, so Java requires it to be final or effectively final (never reassigned after initialisation), which makes the copy always correct. Before Java 8 the `final` keyword was mandatory.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

public class Main {
    private final String bankName = "Java Bank";
    private static int branches = 12;
    private final List<String> customers = new ArrayList<>(List.of("Asha", "Ravi", "Meera"));

    class Teller {                                         // member inner class
        String greet(String customer) { return bankName + " welcomes " + customer; } // outer private field
    }

    static class Address {                                 // static nested class
        final String city;
        Address(String city) { this.city = city; }
        String info() { return city + " (one of " + branches + " branches)"; }  // only static outer members
    }

    Iterator<String> reverseIterator() {
        class ReverseIterator implements Iterator<String> { // local inner class
            int index = customers.size() - 1;
            public boolean hasNext() { return index >= 0; }
            public String next() { return customers.get(index--); }
        }
        return new ReverseIterator();
    }

    public static void main(String[] args) {
        Main bank = new Main();
        Main.Teller teller = bank.new Teller();            // needs an outer instance
        System.out.println(teller.greet("Asha"));

        Main.Address address = new Main.Address("Pune");    // no outer instance needed
        System.out.println(address.info());

        Iterator<String> it = bank.reverseIterator();
        StringBuilder reversed = new StringBuilder();
        while (it.hasNext()) reversed.append(it.next()).append(' ');
        System.out.println("local class iterator: " + reversed.toString().trim());

        String suffix = "!";                                // effectively final
        Comparator<String> byLength = new Comparator<>() {   // anonymous inner class
            int comparisons = 0;                            // anonymous classes can hold state
            @Override public int compare(String a, String b) {
                comparisons++;
                return Integer.compare(a.length(), b.length());
            }
            @Override public String toString() { return "byLength used " + comparisons + " times" + suffix; }
        };
        List<String> names = new ArrayList<>(bank.customers);
        names.sort(byLength);
        System.out.println("sorted by length: " + names + ", " + (byLength.toString().endsWith("!")));
        // suffix = "?";   // would make suffix not effectively final -> compile error above

        Runnable lambda = () -> System.out.println("lambda also captures effectively final: " + suffix);
        lambda.run();
        System.out.println("compiled class names: " + Teller.class.getName() + ", " + Address.class.getName());
    }
}`,
    walk:
      "`Teller` is a member inner class, so it is created with `bank.new Teller()` and reads the outer private field `bankName`. `Address` is static nested: it is created without a `Main` object and can only use the static `branches`.\n\n`ReverseIterator` is a local class inside `reverseIterator()` that walks the outer list backwards. The anonymous `Comparator` keeps its own counter and captures the effectively final `suffix`; reassigning `suffix` anywhere would break compilation, and the lambda follows the same rule. The compiled names `Main$Teller` and `Main$Address` show how nested classes become separate class files.",
    anim: [
      "Capturing an effectively final local",
      [
        ["frame", "main() frame", "suffix = \"!\""],
        ["anon", "anonymous obj", "copy of suffix"],
        ["heap", "Heap", "outlives frame"],
        ["sort", "names.sort()", "uses compare()"],
        ["reassign", "suffix = \"?\"", "not allowed"],
      ],
      [
        ["frame", "anon", "copy", "When the anonymous object is created, the value of suffix is copied into it."],
        ["anon", "heap", "lives on", "The object lives on the heap and may outlive main's stack frame."],
        ["sort", "anon", "calls", "Later calls use the copied value, which is guaranteed to match the original."],
        ["reassign", "frame", "rejected", "Reassigning suffix would make the copy stale, so the compiler forbids it."],
      ],
    ],
    mistakes: [
      "Using a non-static inner class for a builder or helper that does not need the outer object, which wastes memory and can leak the outer object.",
      "Trying to modify a captured local variable inside a lambda or anonymous class; use a field or an `AtomicInteger` instead.",
      "Confusing `this` in an anonymous class (the anonymous object) with `this` in a lambda (the enclosing object).",
    ],
    qa: [
      ["What are the types of nested classes in Java?", "Static nested classes and inner classes; inner classes are member inner, local and anonymous classes."],
      ["Why can a local inner class only access final or effectively final local variables?", "Because it gets a copy of the variable's value and may outlive the method; forbidding reassignment guarantees the copy never becomes stale."],
      ["How do you create an instance of a member inner class from outside?", "`Outer outer = new Outer(); Outer.Inner inner = outer.new Inner();`."],
      ["Can a static nested class access instance members of the outer class?", "Not directly; it needs a reference to an outer object, since it has no implicit outer instance."],
    ],
    ex: [
      "Count how many times `compare` is called from inside a lambda instead of an anonymous class. Why does `int count = 0; ... count++` fail, and what works?",
      "Lambdas cannot modify captured locals, so `count++` does not compile. Use `AtomicInteger count = new AtomicInteger();` and `count.incrementAndGet()` inside the lambda, or an `int[] count = {0}` holder.",
    ],
  }),
]);
