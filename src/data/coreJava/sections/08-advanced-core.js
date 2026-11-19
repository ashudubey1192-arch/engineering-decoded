import { lesson, section } from "../schema.js";

export default section("advanced-core-java", "Immutability, Cloning, Reflection and Singleton", [
  lesson("Creating an Immutable Class", {
    intro:
      "An immutable object's state cannot change after construction. `String`, the wrapper classes, `LocalDate` and `BigDecimal` are all immutable, and they are simpler, thread-safe and safe to share or use as map keys. This lesson lists the rules for writing your own immutable class, including defensive copying of mutable fields, and shows records as the modern shortcut.",
    topics: [
      [
        "Rules for an immutable class",
        "1. Declare the class `final` (or make constructors private with static factories) so subclasses cannot add mutability. 2. Make all fields `private final`. 3. Do not provide setters. 4. Initialise everything in the constructor. 5. If a field refers to a mutable object (a `Date`, array or list), copy it on the way in and never hand out the internal reference: return a copy or an unmodifiable view. 6. Methods that \"change\" state return a new object (`withSalary(...)`).",
      ],
      [
        "Defensive copies",
        "Without a copy in the constructor, the caller keeps a reference to the same list and can modify it after construction. Without a copy in the getter, anyone can modify it through the returned reference. `List.copyOf` both copies and makes the result unmodifiable.",
      ],
      [
        "Benefits",
        "Thread-safe without synchronisation, safe to cache and share, reliable `HashMap` keys and `HashSet` elements (the hash never changes), easier reasoning and testing, and failure atomicity (an exception never leaves the object half-changed).",
      ],
      [
        "Records",
        "A `record` (Java 16) is a final class with private final fields, a canonical constructor, accessors, `equals`, `hashCode` and `toString`. It is shallowly immutable: you still need to copy mutable components in a compact constructor.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Main {
    static final class Employee {                       // 1. final class
        private final String name;                      // 2. private final fields
        private final double salary;
        private final List<String> skills;
        private final Date joined;

        Employee(String name, double salary, List<String> skills, Date joined) {
            this.name = name;
            this.salary = salary;
            this.skills = List.copyOf(skills);          // 5. copy in (and unmodifiable)
            this.joined = new Date(joined.getTime());   // 5. copy mutable Date
        }

        String name() { return name; }                  // 3. getters only
        double salary() { return salary; }
        List<String> skills() { return skills; }        // already unmodifiable
        Date joined() { return new Date(joined.getTime()); } // 5. copy out

        Employee withSalary(double newSalary) {         // 6. "modify" returns a new object
            return new Employee(name, newSalary, skills, joined);
        }

        public String toString() { return name + " " + salary + " " + skills + " joined " + joined.getTime(); }
    }

    record Address(String city, List<String> lines) {
        Address {                                        // compact constructor
            lines = List.copyOf(lines);                  // make the record deeply immutable
        }
    }

    public static void main(String[] args) {
        List<String> skills = new ArrayList<>(List.of("Java", "SQL"));
        Date date = new Date(0);
        Employee e = new Employee("Asha", 90_000, skills, date);

        skills.add("Hacking");                            // try to change it from outside
        date.setTime(999_999);
        e.joined().setTime(123);
        System.out.println("unchanged after outside edits: " + e);

        try {
            e.skills().add("Cobol");
        } catch (UnsupportedOperationException ex) {
            System.out.println("skills list is read-only");
        }

        Employee raised = e.withSalary(99_000);
        System.out.println("original: " + e.salary() + ", new object: " + raised.salary() + ", same object? " + (e == raised));

        List<String> lines = new ArrayList<>(List.of("12 MG Road"));
        Address address = new Address("Pune", lines);
        lines.add("changed");
        System.out.println("record stays immutable: " + address);
    }
}`,
    walk:
      "The caller keeps references to the `skills` list and the `Date`, then modifies both, and also modifies the `Date` returned by `joined()`. None of this affects the employee, because the constructor copied the inputs and the getter returns a copy.\n\nThe skills list is unmodifiable, so `add` fails. `withSalary` returns a new `Employee` and leaves the original untouched. The `Address` record copies its list in a compact constructor, so later changes to the caller's list do not leak in.",
    anim: [
      "Defensive copying",
      [
        ["caller", "caller list", "mutable"],
        ["ctor", "constructor", "List.copyOf"],
        ["field", "private copy", "unmodifiable"],
        ["getter", "skills()", "read-only"],
        ["edit", "caller edits", "no effect"],
      ],
      [
        ["caller", "ctor", "pass", "The caller passes its own mutable list into the constructor."],
        ["ctor", "field", "copy", "The constructor stores a private, unmodifiable copy, not the caller's list."],
        ["edit", "caller", "add", "Later the caller adds to its list; only the caller's list changes."],
        ["getter", "field", "read", "The getter exposes the unmodifiable copy, so nobody can change the field."],
      ],
    ],
    mistakes: [
      "Declaring fields final but storing a caller's mutable list directly.",
      "Returning internal arrays or dates from getters.",
      "Leaving the class non-final so a subclass can add mutable state.",
    ],
    qa: [
      ["How do you create an immutable class in Java?", "Make the class final, all fields private final, no setters, initialise in the constructor, defensively copy mutable fields in and out, and return new objects for changes."],
      ["Why are immutable objects thread-safe?", "Their state cannot change after construction, so threads can share them without synchronisation."],
      ["Are records immutable?", "Shallowly: their fields are final, but mutable components (like a List) must be copied to make them deeply immutable."],
    ],
    ex: [
      "Add an `int[] ratings` field to `Employee` and keep the class immutable. What must the constructor and getter do?",
      "Constructor: `this.ratings = ratings.clone();`. Getter: `return ratings.clone();`. Arrays are always mutable, so copy both ways.",
    ],
  }),

  lesson("Cloning: Shallow and Deep Copy", {
    intro:
      "Cloning creates a copy of an object. Java's built-in mechanism is `Object.clone()` combined with the `Cloneable` marker interface, and it produces a shallow copy by default. This lesson explains how `clone()` works, the difference between shallow and deep copies, techniques for deep copying and the important points and pitfalls of cloning.",
    topics: [
      [
        "How clone() works",
        "`Object.clone()` is protected and native. If the class implements `Cloneable`, it allocates a new object of the same class and copies every field bit by bit, without calling any constructor. If the class does not implement `Cloneable`, it throws `CloneNotSupportedException`. To make cloning usable, override `clone()` as public, call `super.clone()` and return your type (covariant return).",
      ],
      [
        "Shallow copy",
        "The default field-by-field copy duplicates primitives and references, but not the objects the references point to. So a cloned `Employee` shares the same `Address` and the same `List` as the original; changing them through one object affects the other.",
      ],
      [
        "Deep copy",
        "A deep copy also copies the referenced mutable objects, recursively, so the clone is completely independent. In `clone()`, after `super.clone()`, replace each mutable reference with its own copy (`copy.address = address.clone(); copy.skills = new ArrayList<>(skills);`). Immutable fields such as `String` can safely be shared.",
      ],
      [
        "Deep copy techniques",
        "1. Override `clone()` deeply as above. 2. A copy constructor (`new Employee(other)`) or a static factory (`Employee.copyOf(e)`), usually the clearest option. 3. Serialization: write the object to a byte stream and read it back (all classes must be `Serializable`; slow but generic). 4. Libraries that copy object graphs.",
      ],
      [
        "Important points about cloning",
        "`clone()` does not call constructors, so invariants set there are skipped. `final` fields cannot be reassigned in `clone()`, which makes deep copying them impossible. Arrays have a public `clone()` that is shallow for arrays of objects. Many developers, including the authors of the Java collections, recommend copy constructors over `Cloneable` for new code.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Address implements Cloneable {
        String city;
        Address(String city) { this.city = city; }
        @Override public Address clone() {
            try { return (Address) super.clone(); } catch (CloneNotSupportedException e) { throw new AssertionError(e); }
        }
        public String toString() { return city; }
    }

    static class Employee implements Cloneable {
        String name;                     // immutable: safe to share
        Address address;                 // mutable reference
        List<String> skills;             // mutable reference
        Employee(String name, Address address, List<String> skills) {
            this.name = name; this.address = address; this.skills = skills;
            System.out.println("  constructor ran for " + name);
        }
        Employee shallowCopy() {
            try { return (Employee) super.clone(); } catch (CloneNotSupportedException e) { throw new AssertionError(e); }
        }
        @Override public Employee clone() {                 // deep copy
            Employee copy = shallowCopy();
            copy.address = address.clone();
            copy.skills = new ArrayList<>(skills);
            return copy;
        }
        Employee(Employee other) {                           // copy constructor alternative
            this(other.name, new Address(other.address.city), new ArrayList<>(other.skills));
        }
        public String toString() { return name + " @ " + address + " " + skills; }
    }

    static class NotCloneable {
        Object tryClone() throws CloneNotSupportedException { return super.clone(); }
    }

    public static void main(String[] args) throws Exception {
        Employee original = new Employee("Asha", new Address("Pune"), new ArrayList<>(List.of("Java")));

        Employee shallow = original.shallowCopy();          // no constructor call
        shallow.name = "Asha (shallow)";
        shallow.address.city = "Mumbai";
        shallow.skills.add("Spring");
        System.out.println("after editing shallow copy:");
        System.out.println("  original: " + original);
        System.out.println("  shallow:  " + shallow);

        Employee deep = original.clone();
        deep.address.city = "Delhi";
        deep.skills.add("Kafka");
        System.out.println("after editing deep copy:");
        System.out.println("  original: " + original);
        System.out.println("  deep:     " + deep);

        System.out.println("copy constructor:");
        Employee viaConstructor = new Employee(original);
        viaConstructor.skills.clear();
        System.out.println("  original still: " + original.skills + ", copy: " + viaConstructor.skills);

        int[] numbers = {1, 2, 3};
        int[] copy = numbers.clone();
        copy[0] = 99;
        System.out.println("array clone is independent for primitives: " + numbers[0]);

        try {
            new NotCloneable().tryClone();
        } catch (CloneNotSupportedException e) {
            System.out.println("without Cloneable: CloneNotSupportedException");
        }
    }
}`,
    walk:
      "Creating `original` runs the constructor once. `shallowCopy()` uses `super.clone()`, which does not run the constructor and copies references, so changing the shallow copy's address city and skills list also changes the original's; only the reassigned `name` is independent.\n\nThe deep `clone()` copies the `Address` and the list, so its edits do not reach the original. The copy constructor achieves the same and does run the constructor. Cloning an `int[]` gives an independent array, and calling `super.clone()` in a class that does not implement `Cloneable` throws `CloneNotSupportedException`.",
    anim: [
      "Shallow vs deep copy",
      [
        ["orig", "original", "Employee"],
        ["addr", "Address", "Pune"],
        ["shal", "shallow copy", "same refs"],
        ["deep", "deep copy", "own refs"],
        ["addr2", "Address copy", "Delhi"],
      ],
      [
        ["orig", "addr", "refers", "The original Employee refers to an Address object."],
        ["shal", "addr", "shared", "super.clone() copies the reference, so the shallow copy shares the same Address."],
        ["deep", "addr2", "own", "A deep clone replaces the reference with a copy of the Address."],
        ["addr2", "addr", "independent", "Editing the deep copy's address no longer touches the original's."],
      ],
    ],
    mistakes: [
      "Assuming `super.clone()` gives a deep copy.",
      "Implementing `Cloneable` but forgetting to override `clone()` as public, so callers cannot use it.",
      "Using cloning with final mutable fields, which cannot be replaced after `super.clone()`.",
    ],
    qa: [
      ["What is the difference between shallow copy and deep copy?", "A shallow copy duplicates the object and copies references to the same nested objects; a deep copy also duplicates the nested mutable objects."],
      ["Why is Cloneable called a marker interface?", "It has no methods; it only tells `Object.clone()` that cloning is allowed, otherwise it throws CloneNotSupportedException."],
      ["Does clone() call the constructor?", "No. It allocates and copies the object without running any constructor."],
      ["What are alternatives to clone()?", "Copy constructors, static factory methods, serialization-based copying, or copy libraries."],
    ],
    ex: [
      "Clone a `List<Address>` deeply in one line using streams.",
      "`List<Address> copy = list.stream().map(Address::clone).collect(Collectors.toCollection(ArrayList::new));` copies every Address into a new list.",
    ],
  }),

  lesson("Reflection in Java", {
    intro:
      "Reflection lets a running program inspect and use classes, fields, methods and constructors that it did not know about at compile time. Frameworks such as Spring, Hibernate, JUnit and Jackson are built on it. This lesson covers obtaining `Class` objects, the main reflection methods, creating objects, calling methods, reading private fields, annotations, and the costs and risks.",
    topics: [
      [
        "Getting a Class object",
        "`obj.getClass()`, the class literal `Employee.class`, or `Class.forName(\"com.app.Employee\")` (loads the class by name). The `Class` object describes the type: name, modifiers, superclass, interfaces, package.",
      ],
      [
        "Main reflection methods",
        "`getDeclaredFields()`, `getDeclaredMethods()` and `getDeclaredConstructors()` return everything declared in the class, including private members; `getFields()`, `getMethods()` and `getConstructors()` return public members including inherited ones. Single lookups: `getDeclaredMethod(name, paramTypes...)`, `getDeclaredField(name)`.",
      ],
      [
        "Creating objects and invoking methods",
        "`clazz.getDeclaredConstructor(String.class).newInstance(\"x\")` creates an instance. `method.invoke(target, args...)` calls a method (pass `null` as target for static methods); exceptions thrown inside arrive wrapped in `InvocationTargetException`. `field.get(obj)` and `field.set(obj, value)` read and write fields.",
      ],
      [
        "Accessing private members",
        "`setAccessible(true)` disables access checks so you can read private fields or call private methods. Since Java 9 modules can block this for non-open packages (`InaccessibleObjectException`), which is why some frameworks need `--add-opens`.",
      ],
      [
        "Annotations and uses of reflection",
        "`method.isAnnotationPresent(Test.class)` and `getAnnotation(...)` read runtime annotations; that is how JUnit finds `@Test` methods and Spring finds `@Autowired` fields. Other uses: dependency injection, ORMs, serialisation libraries, debuggers and IDEs.",
      ],
      [
        "Drawbacks",
        "Slower than direct calls (though `MethodHandle` and JIT reduce this), no compile-time checking (typos become runtime exceptions), it breaks encapsulation, and it can fail under modules or a security policy. Use it in frameworks and tools, not in everyday business code.",
      ],
    ],
    code: String.raw`import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Comparator;

public class Main {
    @Retention(RetentionPolicy.RUNTIME)
    @interface Audit { String value(); }

    public static class Employee {
        private String name;
        private double salary;
        public static int created = 0;

        public Employee() { this("unknown", 0); }
        public Employee(String name, double salary) { this.name = name; this.salary = salary; created++; }

        public String getName() { return name; }
        @Audit("salary changes are logged")
        public void raise(double percent) { salary += salary * percent / 100; }
        private String secret() { return "private salary band B2"; }
        public static String company() { return "Decoded Ltd"; }
    }

    public static void main(String[] args) throws Exception {
        Class<?> clazz = Class.forName("Main$Employee");
        System.out.println("class: " + clazz.getSimpleName() + ", public: " + Modifier.isPublic(clazz.getModifiers())
                + ", superclass: " + clazz.getSuperclass().getSimpleName());

        Field[] fields = clazz.getDeclaredFields();
        Arrays.sort(fields, Comparator.comparing(Field::getName));
        for (Field f : fields)
            System.out.println("  field " + Modifier.toString(f.getModifiers()) + " " + f.getType().getSimpleName() + " " + f.getName());

        Method[] methods = clazz.getDeclaredMethods();
        Arrays.sort(methods, Comparator.comparing(Method::getName));
        for (Method m : methods)
            System.out.println("  method " + m.getName() + Arrays.toString(m.getParameterTypes()).replace("class ", "")
                    + (m.isAnnotationPresent(Audit.class) ? " @Audit(" + m.getAnnotation(Audit.class).value() + ")" : ""));
        System.out.println("  constructors: " + clazz.getDeclaredConstructors().length);

        Constructor<?> ctor = clazz.getDeclaredConstructor(String.class, double.class);
        Object emp = ctor.newInstance("Ravi", 50_000.0);
        clazz.getMethod("raise", double.class).invoke(emp, 10.0);
        System.out.println("getName() via invoke: " + clazz.getMethod("getName").invoke(emp));

        Field salary = clazz.getDeclaredField("salary");
        salary.setAccessible(true);                          // bypass private
        System.out.println("private salary after raise: " + salary.get(emp));
        salary.set(emp, 1.0);
        System.out.println("private salary overwritten: " + salary.get(emp));

        Method secret = clazz.getDeclaredMethod("secret");
        secret.setAccessible(true);
        System.out.println("private method: " + secret.invoke(emp));
        System.out.println("static method: " + clazz.getMethod("company").invoke(null)
                + ", static field created = " + clazz.getField("created").get(null));

        try {
            clazz.getMethod("fire");
        } catch (NoSuchMethodException e) {
            System.out.println("typo found only at runtime: NoSuchMethodException " + e.getMessage());
        }
    }
}`,
    walk:
      "`Class.forName` loads `Employee` by its binary name `Main$Employee`. The program lists its fields and methods (sorted, because reflection returns them in no guaranteed order), including private ones and the runtime `@Audit` annotation on `raise`.\n\nIt then creates an employee through the two-argument constructor, calls `raise` and `getName` with `invoke`, and reads and overwrites the private `salary` field after `setAccessible(true)`. It calls the private `secret()` method and a static method with a `null` target. The last call shows that a misspelled method name is only discovered at runtime.",
    anim: [
      "Calling a method by reflection",
      [
        ["name", "\"Main$Employee\"", "class name"],
        ["cls", "Class object", "forName"],
        ["ctor", "Constructor", "newInstance"],
        ["obj", "Employee object", "Ravi"],
        ["meth", "Method raise", "invoke"],
      ],
      [
        ["name", "cls", "forName", "Class.forName loads the class from its name at runtime."],
        ["cls", "ctor", "lookup", "getDeclaredConstructor(String, double) finds the matching constructor."],
        ["ctor", "obj", "newInstance", "newInstance creates the object exactly as new would."],
        ["meth", "obj", "invoke", "getMethod(\"raise\").invoke(obj, 10.0) calls the method on that object."],
      ],
    ],
    mistakes: [
      "Using reflection in normal application code where an interface would do.",
      "Relying on the order of `getDeclaredMethods()`; it is unspecified.",
      "Forgetting that exceptions from invoked methods come wrapped in `InvocationTargetException`.",
    ],
    qa: [
      ["What is reflection?", "An API in `java.lang.reflect` and `Class` to inspect and use classes, methods, fields and constructors at runtime."],
      ["What is the difference between getMethods() and getDeclaredMethods()?", "getMethods returns public methods including inherited ones; getDeclaredMethods returns all methods declared in that class, including private, but not inherited ones."],
      ["Can reflection access private fields?", "Yes, after `setAccessible(true)`, unless module rules or a security policy prevent it."],
      ["What are the disadvantages of reflection?", "Slower calls, no compile-time checking, broken encapsulation and potential module/security restrictions."],
    ],
    ex: [
      "Write a reflective `toString` that prints every declared field name and value of any object.",
      "Loop over `obj.getClass().getDeclaredFields()`, call `f.setAccessible(true)`, and append `f.getName() + \"=\" + f.get(obj)`. For the employee it prints name, salary and the static created field.",
    ],
  }),

  lesson("Singleton Design Pattern", {
    intro:
      "A singleton class guarantees there is exactly one instance in the JVM and provides a global access point to it, for example a configuration registry or a connection-pool manager. There are several ways to implement it, each with different trade-offs around laziness and thread safety. This lesson covers eager initialisation, static block initialisation, lazy initialisation, synchronized and double-checked locking, the holder idiom and the enum singleton, plus how reflection and serialization can break singletons.",
    topics: [
      [
        "Eager initialisation",
        "`private static final Config INSTANCE = new Config();` with a private constructor and `getInstance()` returning it. The JVM creates it when the class initialises, which is thread-safe by definition. The downside: it is created even if never used, and constructor exceptions cannot be handled.",
      ],
      [
        "Eager initialisation in a static block",
        "Same as eager, but the instance is created inside `static { }`, so you can catch exceptions or run setup code (such as reading a file) while creating it.",
      ],
      [
        "Lazy initialisation",
        "Create the instance only on the first `getInstance()` call: `if (instance == null) instance = new Config();`. Simple, but not thread-safe: two threads can both see null and create two instances. Making the whole method `synchronized` fixes that but makes every call pay for locking.",
      ],
      [
        "Double-checked locking",
        "Check null without a lock, then lock and check again before creating. The field must be `volatile`; without it, another thread could see a reference to a partially constructed object because of instruction reordering. After the instance exists, calls take no lock.",
      ],
      [
        "Bill Pugh holder idiom",
        "Put the instance in a private static nested `Holder` class. The holder is initialised only when `getInstance()` first touches it, and class initialisation is thread-safe, so you get laziness and thread safety with no synchronisation code.",
      ],
      [
        "Enum singleton and breaking singletons",
        "`enum Registry { INSTANCE; }` is the simplest robust singleton: the JVM guarantees one instance, and it is safe against reflection (enum constructors cannot be invoked reflectively) and serialization. Class-based singletons can be broken by reflection (calling the private constructor after `setAccessible(true)`; guard by throwing if the instance exists), by deserialization (implement `readResolve` to return the existing instance), and by cloning (do not implement `Cloneable`).",
      ],
    ],
    code: String.raw`import java.lang.reflect.Constructor;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    static class Eager {
        private static final Eager INSTANCE = new Eager();
        private Eager() { }
        static Eager getInstance() { return INSTANCE; }
    }

    static class StaticBlock {
        private static final StaticBlock INSTANCE;
        static {
            try { INSTANCE = new StaticBlock(); }
            catch (Exception e) { throw new ExceptionInInitializerError(e); }
        }
        private StaticBlock() { }
        static StaticBlock getInstance() { return INSTANCE; }
    }

    static class LazyUnsafe {
        private static LazyUnsafe instance;
        private LazyUnsafe() { try { Thread.sleep(5); } catch (InterruptedException ignored) { } } // slow constructor
        static LazyUnsafe getInstance() {
            if (instance == null) instance = new LazyUnsafe();   // race condition
            return instance;
        }
    }

    static class DoubleChecked {
        private static volatile DoubleChecked instance;       // volatile is essential
        private DoubleChecked() {
            if (instance != null) throw new IllegalStateException("use getInstance()"); // reflection guard
        }
        static DoubleChecked getInstance() {
            DoubleChecked local = instance;
            if (local == null) {
                synchronized (DoubleChecked.class) {
                    local = instance;
                    if (local == null) instance = local = new DoubleChecked();
                }
            }
            return local;
        }
    }

    static class Holder {
        private Holder() { }
        private static class Lazy { static final Holder INSTANCE = new Holder(); }
        static Holder getInstance() { return Lazy.INSTANCE; }
    }

    enum Registry {
        INSTANCE;
        private final Set<String> keys = ConcurrentHashMap.newKeySet();
        void register(String key) { keys.add(key); }
        int size() { return keys.size(); }
    }

    static int distinctInstances(java.util.function.Supplier<Object> getter) throws InterruptedException {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        CountDownLatch go = new CountDownLatch(1);
        for (int i = 0; i < 8; i++) pool.submit(() -> { go.await(); seen.add(getter.get()); return null; });
        go.countDown();
        pool.shutdown();
        pool.awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS);
        return seen.size();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("eager same: " + (Eager.getInstance() == Eager.getInstance()));
        System.out.println("static block same: " + (StaticBlock.getInstance() == StaticBlock.getInstance()));
        System.out.println("holder idiom, 8 threads -> instances: " + distinctInstances(Holder::getInstance));
        System.out.println("double-checked, 8 threads -> instances: " + distinctInstances(DoubleChecked::getInstance));
        System.out.println("lazy unsafe, 8 threads -> instances: " + distinctInstances(LazyUnsafe::getInstance)
                + " (often more than 1: a race condition)");

        Registry.INSTANCE.register("orders");
        Registry.INSTANCE.register("payments");
        System.out.println("enum singleton size: " + Registry.INSTANCE.size());

        Constructor<DoubleChecked> ctor = DoubleChecked.class.getDeclaredConstructor();
        ctor.setAccessible(true);
        try {
            ctor.newInstance();
        } catch (java.lang.reflect.InvocationTargetException e) {
            System.out.println("reflection attack blocked: " + e.getCause().getMessage());
        }
        try {
            Constructor<?> enumCtor = Registry.class.getDeclaredConstructors()[0];
            enumCtor.setAccessible(true);
            enumCtor.newInstance("INSTANCE2", 1);
        } catch (IllegalArgumentException e) {
            System.out.println("enum cannot be instantiated reflectively: " + e.getMessage());
        }
    }
}`,
    varies: true,
    walk:
      "`Eager` and `StaticBlock` are created during class initialisation, so every call returns the same object. `distinctInstances` starts eight threads behind a latch so they call `getInstance()` at the same moment, and counts distinct objects: the holder idiom and double-checked locking always give 1. The unsafe lazy version has a slow constructor, so in practice several threads see `null` and create separate instances (the exact number varies from run to run).\n\nThe enum singleton holds shared state safely. Finally, reflection tries to call `DoubleChecked`'s private constructor, but the guard throws because the instance already exists, and the JVM refuses outright to create enum instances reflectively.",
    anim: [
      "Double-checked locking",
      [
        ["call", "getInstance()", "thread A and B"],
        ["c1", "1st check", "no lock"],
        ["lock", "synchronized", "one at a time"],
        ["c2", "2nd check", "inside lock"],
        ["new", "new instance", "volatile write"],
        ["ret", "return", "same object"],
      ],
      [
        ["call", "c1", "null?", "Both threads see instance == null on the fast, unlocked check."],
        ["c1", "lock", "enter", "They compete for the class lock; thread A enters first."],
        ["lock", "c2", "recheck", "A checks again inside the lock, still null, so it creates the instance."],
        ["c2", "new", "create", "The volatile write publishes a fully built object to other threads."],
        ["c2", "ret", "B", "When B gets the lock, its second check sees the instance and skips creation."],
      ],
    ],
    mistakes: [
      "Double-checked locking without `volatile`.",
      "Making a singleton `Serializable` without `readResolve`, so deserialization creates a second instance.",
      "Using singletons for everything; they are global state and make testing harder. Dependency injection containers usually manage single instances better.",
    ],
    qa: [
      ["What are the ways to implement a singleton?", "Eager initialisation, static block, lazy initialisation, synchronized getInstance, double-checked locking with volatile, the Bill Pugh holder idiom, and the enum singleton."],
      ["Why is volatile needed in double-checked locking?", "Without it, another thread may see a non-null reference to an object whose constructor has not finished, because writes can be reordered."],
      ["Which singleton implementation is best?", "Usually the enum singleton (simple, safe against reflection and serialization) or the holder idiom when you need a class and laziness."],
      ["How can a singleton be broken?", "With reflection, serialization/deserialization, cloning, or multiple class loaders loading the class separately."],
    ],
    ex: [
      "Make `Eager` Serializable and keep it a singleton after deserialization. What method do you add?",
      "Add `private Object readResolve() { return INSTANCE; }`. Deserialization creates a temporary object, then readResolve replaces it with the existing instance.",
    ],
  }),

  lesson("How Many Methods Can a Class or Interface Have?", {
    intro:
      "There is no small fixed limit on methods in a Java class, but the class file format does set hard limits, because counts and indexes are stored in 16-bit fields. This lesson explains the limits on methods, fields, constant-pool entries, method size and parameters, and why you never hit them in well-designed code.",
    topics: [
      [
        "Methods per class or interface",
        "The class file stores the number of methods in an unsigned 16-bit field (`methods_count`), so a class or interface can declare at most 65,535 methods, including constructors and static initialisers (`<init>` and `<clinit>`). In practice the constant pool fills first, because every method name and descriptor needs constant-pool entries.",
      ],
      [
        "Constant pool and fields",
        "The constant pool can hold at most 65,535 entries (index 0 is unused; long and double take two slots). Fields per class are also limited to 65,535 by `fields_count`. Large generated classes (for example from code generators or huge enums) are what usually hit these limits, with errors such as \"too many constants\".",
      ],
      [
        "Method size and parameters",
        "The bytecode of a single method cannot exceed 65,535 bytes (\"code too large\"), which matters for giant generated methods and big array initialisers. A method can have at most 255 parameter slots, where `long` and `double` take two slots and `this` takes one for instance methods.",
      ],
      [
        "Practical meaning",
        "A class approaching even a few hundred methods is a design smell (a \"god class\"); split it by responsibility. The limits are trivia for interviews and a concern mainly for code generators.",
      ],
    ],
    code: String.raw`import java.lang.reflect.Method;

public class Main {
    interface Small { void a(); void b(); default void c() { } static void d() { } }

    static class Calculator {
        int add(int a, int b) { return a + b; }
        int sub(int a, int b) { return a - b; }
        int mul(int a, int b) { return a * b; }
        static int div(int a, int b) { return a / b; }
    }

    static int many(int p1, int p2, int p3, int p4, int p5, int p6, int p7, int p8) { return p1 + p8; }

    public static void main(String[] args) {
        System.out.println("max methods per class (u2 methods_count): " + 0xFFFF);
        System.out.println("max constant pool entries: " + (0xFFFF - 1) + " usable indexes");
        System.out.println("max bytecode bytes per method: " + 0xFFFF);
        System.out.println("max parameter slots per method: " + 255);

        System.out.println("Calculator declares " + Calculator.class.getDeclaredMethods().length + " methods");
        System.out.println("Small interface declares " + Small.class.getDeclaredMethods().length + " methods");
        System.out.println("Calculator inherits " + Calculator.class.getMethods().length + " public methods (from Object too)");

        int count = 0;
        for (Method m : Object.class.getDeclaredMethods()) count++;
        System.out.println("Object declares " + count + " methods");
        System.out.println("many(...) has " + countParams() + " parameters, result " + many(1, 2, 3, 4, 5, 6, 7, 8));
    }

    static int countParams() {
        for (Method m : Main.class.getDeclaredMethods()) if (m.getName().equals("many")) return m.getParameterCount();
        return -1;
    }
}`,
    varies: true,
    walk:
      "The first lines print the class-file limits: all of them come from 16-bit unsigned fields (0xFFFF = 65,535), except the 255 parameter-slot limit. Reflection then counts the methods actually declared by `Calculator` (4) and by the `Small` interface (abstract, default and static methods together).\n\n`getMethods()` adds the public methods inherited from `Object`, and the program counts `Object`'s own methods. The parameter count of `many` is read reflectively. The counts for `Object` can vary slightly between JDK versions.",
    anim: [
      "Where the limits come from",
      [
        ["cf", "Main.class", "class file"],
        ["cp", "constant_pool", "u2 count"],
        ["fields", "fields_count", "u2 = 65535"],
        ["methods", "methods_count", "u2 = 65535"],
        ["code", "Code attribute", "64 KB/method"],
      ],
      [
        ["cf", "cp", "first", "Every name and descriptor lives in the constant pool, limited to 65,535 entries."],
        ["cf", "fields", "count", "The number of fields is stored in an unsigned 16-bit field."],
        ["cf", "methods", "count", "So is the number of methods: at most 65,535 per class or interface."],
        ["methods", "code", "each", "Each method's bytecode is also capped at 65,535 bytes: 'code too large'."],
      ],
    ],
    mistakes: [
      "Generating one giant method from templates and hitting \"code too large\".",
      "Treating the theoretical limit as permission for huge classes.",
    ],
    qa: [
      ["How many methods can a Java class have?", "At most 65,535, because methods_count in the class file is an unsigned 16-bit value; the constant pool limit is usually reached first."],
      ["What is the maximum size of a method?", "65,535 bytes of bytecode."],
      ["How many parameters can a method have?", "Up to 255 parameter slots; long and double use two slots and `this` uses one for instance methods."],
    ],
    ex: [
      "How many `long` parameters can an instance method have at most?",
      "`this` uses one slot, leaving 254, and each long needs two slots, so at most 127 long parameters.",
    ],
  }),
]);
