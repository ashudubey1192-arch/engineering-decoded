import { lesson } from "../../schema.js";

export default [
  lesson("Core Java Q1-Q10: OOP, String Creation, final, HashMap Keys and Immutability", {
    intro:
      "This first set of core Java interview questions covers the ideas interviewers use to warm up: the four OOP principles, how string objects are created, what `final` really freezes, why a custom key in a HashMap needs `equals` and `hashCode`, and how to design an immutable class. Every question below has a detailed answer, and the commented program at the end proves each answer by printing real results.",
    topics: [
      [
        "Q1. What are the four principles of OOP?",
        "**Encapsulation** keeps an object's data private and exposes behaviour through methods, so the object can protect its own invariants (a bank account never goes negative because only `withdraw` can change the balance). **Abstraction** shows what an object does and hides how: callers use a `List` without knowing it is an array inside. **Inheritance** lets a class reuse and extend another class with `extends`, forming an is-a relationship. **Polymorphism** lets one reference type point to many object types; the method that runs is chosen at runtime from the actual object (overriding) or at compile time from the argument types (overloading).\n\nIn an interview, give one line per principle plus a tiny example, and mention that Java supports single inheritance of classes but multiple inheritance of interfaces.",
      ],
      [
        "Q2. What is the difference between creating a String with and without new?",
        "A literal such as `String a = \"java\"` is looked up in the **string constant pool**, a table of interned strings on the heap. If the same literal already exists, the existing object is reused, so two literals with the same text are the same object (`a == b` is true).\n\n`new String(\"java\")` always creates a brand-new object on the heap, even when the pool already holds \"java\". So `new String(\"java\") == \"java\"` is false although `equals` is true. Calling `intern()` returns the pooled copy. Prefer literals: they save memory, and never compare strings with `==`.",
        'String a = "java";            // pooled\nString b = "java";            // same pooled object\nString c = new String("java"); // new heap object\na == b;          // true\na == c;          // false\na == c.intern(); // true',
      ],
      [
        "Q3. What is the significance of final in Java?",
        "`final` means \"cannot be changed after it is set\", and its effect depends on where it is used. A **final variable** can be assigned only once; for a reference this freezes the reference, not the object, so a `final List` can still have elements added. A **final method** cannot be overridden by subclasses, which protects behaviour that must not change. A **final class** cannot be extended at all; `String`, `Integer` and the other wrappers are final.\n\nA final field must be assigned exactly once, either at declaration, in an initializer block or in every constructor (a blank final). Local variables captured by lambdas and anonymous classes must be final or effectively final.",
      ],
      [
        "Q4. How do you use a custom object as a HashMap key?",
        "HashMap finds a key in two steps: `hashCode()` picks the bucket and `equals()` finds the matching entry inside that bucket. A custom key class must therefore override **both** methods consistently: equal objects must return equal hash codes, and both methods must be based on the same fields.\n\nThe key should also be **immutable** (final fields, no setters). If a field used in `hashCode` changes after the key is inserted, the entry sits in the old bucket and `get` with the same object can no longer find it, which is a classic memory leak.",
      ],
      [
        "Q5. How do you override equals and hashCode for an Employee class used as a key?",
        "Pick the fields that define identity, for example `id` and `name`. In `equals`: return true when `this == o`; return false when `o` is null or a different class; cast and compare every chosen field with `==` for primitives and `Objects.equals` for references. In `hashCode`: combine the same fields, typically with `Objects.hash(id, name)` or the manual `31 * result + field` formula. The number 31 is an odd prime that spreads values well and that the JIT can compute as `(i << 5) - i`.\n\nThe program at the end of this lesson shows an Employee key found by a different but equal instance.",
        "@Override public boolean equals(Object o) {\n    if (this == o) return true;\n    if (!(o instanceof Employee e)) return false;\n    return id == e.id && Objects.equals(name, e.name);\n}\n@Override public int hashCode() { return Objects.hash(id, name); }",
      ],
      [
        "Q6. Which classes are preferred as HashMap keys?",
        "Immutable classes with well-defined `equals` and `hashCode` make the best keys: `String`, `Integer` and the other wrappers, enums, and records. `String` is the most popular because it is immutable, final and caches its hash code after the first call, so repeated lookups are cheap.\n\nAvoid mutable keys (a `StringBuilder` or a `List` you keep changing) and classes that do not override `equals`/`hashCode`, because then only the exact same instance can find the entry.",
      ],
      [
        "Q7. Can overriding hashCode hurt performance?",
        "Yes, in two ways. A **poor distribution**, such as `return 1;` for every object, sends all keys into one bucket. Every `get` then compares against every entry: O(n) per lookup instead of O(1). Since Java 8 a crowded bucket turns into a red-black tree after 8 entries, which helps when keys are Comparable, but it is still much slower than a spread-out map.\n\nAn **expensive computation**, such as hashing a large collection on every call, slows down every put and get. Cache the hash in a field for immutable objects, as String does.",
      ],
      [
        "Q8. What are immutable classes, how do you create one and what are the advantages?",
        "An immutable object cannot change state after construction. To create one:\n\n1. Declare the class `final`, or give it only private constructors, so subclasses cannot add mutability.\n2. Make every field `private final`.\n3. Do not write setters.\n4. Make defensive copies of mutable inputs in the constructor and of mutable outputs in getters (for example `List.copyOf`).\n5. Return a new object from any \"modifying\" method.\n\nThe advantages:\n\n- **Thread safety**: no synchronization is needed.\n- **Safe sharing and caching**: the string pool and the Integer cache depend on this.\n- **Safe HashMap keys.**\n- **Simpler reasoning**, because the state is fixed at construction.\n\nThe cost is extra objects whenever a change is needed. Records (Java 16) give you most of this with one line.",
      ],
      [
        "Q9. Which classes in the JDK are immutable?",
        "The common ones:\n\n- `String`.\n- All wrapper classes: `Integer`, `Long`, `Double`, `Boolean`, `Character`, `Byte`, `Short`, `Float`.\n- `BigInteger` and `BigDecimal`.\n- The `java.time` classes such as `LocalDate`, `LocalDateTime`, `Instant` and `Duration`.\n- `java.io.File` and `java.nio.file.Path`.\n- `java.net.URI` and `java.util.UUID`.\n- `Optional`.\n- The unmodifiable collections from `List.of`, `Set.of` and `Map.of`.\n- Every enum constant (if its fields are final).\n\nBy contrast, `java.util.Date`, `Calendar`, `StringBuilder` and `ArrayList` are mutable.",
      ],
      [
        "Q10. What is the difference between List and Set?",
        "A **List** is an ordered sequence. It keeps insertion order, allows duplicates and any number of nulls, and supports positional access with `get(index)` and `add(index, e)`. Implementations: `ArrayList`, `LinkedList`, `Vector`, `CopyOnWriteArrayList`.\n\nA **Set** stores unique elements only; adding a duplicate returns false. Ordering depends on the implementation: none for `HashSet`, insertion order for `LinkedHashSet`, sorted for `TreeSet`. A Set has no index-based methods. `HashSet` allows one null; `TreeSet` rejects null because it must compare elements. Use a List when order or duplicates matter, and a Set to remove duplicates or test membership quickly.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {

    // Q5: an Employee designed to be a safe HashMap key.
    // final class + private final fields + no setters = immutable (Q8).
    static final class Employee {
        private final int id;
        private final String name;

        Employee(int id, String name) {
            this.id = id;
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;                       // same reference: equal
            if (!(o instanceof Employee e)) return false;     // null or another type
            return id == e.id && Objects.equals(name, e.name); // compare the identity fields
        }

        @Override
        public int hashCode() {
            return Objects.hash(id, name);                    // same fields as equals
        }

        @Override
        public String toString() { return name + "#" + id; }
    }

    // Q8: an immutable class that holds a mutable List safely.
    static final class Team {
        private final String title;
        private final List<String> members;

        Team(String title, List<String> members) {
            this.title = title;
            this.members = List.copyOf(members);              // defensive copy on the way in
        }

        List<String> members() { return members; }           // already unmodifiable
        Team withMember(String m) {                           // "change" returns a new object
            List<String> next = new ArrayList<>(members);
            next.add(m);
            return new Team(title, next);
        }
    }

    // Q1: polymorphism through an abstract type.
    static abstract class Shape { abstract double area(); }
    static class Circle extends Shape { double r = 1; double area() { return Math.PI * r * r; } }
    static class Square extends Shape { double s = 2; double area() { return s * s; } }

    // Q7: a deliberately bad key whose hash code is always 1.
    record BadKey(int value) {
        @Override public int hashCode() { return 1; }         // every key collides
    }

    public static void main(String[] args) {
        // Q1: one reference type, many runtime types.
        for (Shape shape : List.of(new Circle(), new Square()))
            System.out.printf("Q1  %s area = %.2f%n", shape.getClass().getSimpleName(), shape.area());

        // Q2: literals are pooled, new always creates a fresh object.
        String a = "java";
        String b = "java";
        String c = new String("java");
        System.out.println("Q2  a == b: " + (a == b) + ", a == c: " + (a == c)
                + ", a.equals(c): " + a.equals(c) + ", a == c.intern(): " + (a == c.intern()));

        // Q3: a final reference cannot be reassigned, but the object can still change.
        final List<String> names = new ArrayList<>();
        names.add("still allowed");
        // names = new ArrayList<>();  // would not compile: cannot assign a final variable
        System.out.println("Q3  final list content: " + names);

        // Q4 + Q5: a different but equal Employee finds the entry.
        Map<Employee, String> desk = new HashMap<>();
        desk.put(new Employee(7, "Asha"), "Desk 12");
        System.out.println("Q5  lookup with an equal key: " + desk.get(new Employee(7, "Asha")));

        // Q6: String caches its hash, so repeated lookups are cheap.
        Map<String, Integer> stock = new HashMap<>(Map.of("pen", 10));
        System.out.println("Q6  String key lookup: " + stock.get("pen"));

        // Q7: compare the time of 2000 lookups with good keys vs colliding keys.
        Map<Integer, Integer> good = new HashMap<>();
        Map<BadKey, Integer> bad = new HashMap<>();
        for (int i = 0; i < 2000; i++) { good.put(i, i); bad.put(new BadKey(i), i); }
        long goodHits = 0, badHits = 0;
        for (int i = 0; i < 2000; i++) {
            if (good.get(i) != null) goodHits++;
            if (bad.get(new BadKey(i)) != null) badHits++;
        }
        System.out.println("Q7  both maps still work (" + goodHits + ", " + badHits
                + ") but BadKey puts all 2000 entries in one bucket");

        // Q8: the outside list changes, the immutable Team does not.
        List<String> source = new ArrayList<>(List.of("Ravi"));
        Team team = new Team("core", source);
        source.add("Intruder");
        Team bigger = team.withMember("Meera");
        System.out.println("Q8  team = " + team.members() + ", new team = " + bigger.members());
        try {
            team.members().add("hack");
        } catch (UnsupportedOperationException e) {
            System.out.println("Q8  members() is read-only: " + e.getClass().getSimpleName());
        }

        // Q9: "modifying" an immutable JDK object returns a new object.
        String s = "core";
        String upper = s.toUpperCase();
        System.out.println("Q9  original = " + s + ", new = " + upper);

        // Q10: List keeps duplicates and order, Set keeps unique elements.
        List<String> list = new ArrayList<>(List.of("b", "a", "b"));
        Set<String> hashSet = new HashSet<>(list);
        Set<String> treeSet = new TreeSet<>(list);
        System.out.println("Q10 list = " + list + ", list.get(0) = " + list.get(0)
                + ", treeSet = " + treeSet + ", set size = " + hashSet.size());
    }
}`,
    walk:
      "Each block in `main` is labelled with the question it answers. Q1 loops over two `Shape` objects, and `area()` dispatches to the real class. Q2 compares pooled literals with a `new String`. Q3 adds to a final list, which works because final protects only the reference.\n\nQ4 and Q5 store a value under one `Employee` and read it back with a different but equal `Employee`. That works only because both `equals` and `hashCode` are overridden on the same fields. Q7 fills a map with `BadKey`, whose hash is always 1. The lookups still succeed, but they all walk one crowded bucket.\n\nQ8 builds a `Team` from a list and then changes that list. The team stays the same because the constructor copied it, and `members()` throws when you try to modify it. Q9 shows that `toUpperCase()` returns a new string. Q10 prints a list with a duplicate next to a sorted, de-duplicated TreeSet.",
    anim: [
      "How HashMap finds a custom key",
      [
        ["key", "Employee key", "id + name"],
        ["hash", "hashCode()", "Objects.hash"],
        ["bucket", "bucket index", "hash & (n-1)"],
        ["eq", "equals()", "same fields"],
        ["val", "value", "Desk 12"],
      ],
      [
        ["key", "hash", "hashCode()", "get(new Employee(7, Asha)) first asks the key for its hash code."],
        ["hash", "bucket", "spread + mask", "The hash is spread and masked to choose one bucket of the table."],
        ["bucket", "eq", "walk entries", "Inside the bucket every entry with the same hash is compared using equals."],
        ["eq", "val", "match", "equals returns true on id and name, so the stored value is returned."],
        ["eq", "bucket", "no equals?", "Without an equals override, only the very same instance would match."],
      ],
    ],
    mistakes: [
      "Overriding `equals` but not `hashCode` (or the reverse). Equal objects then land in different buckets and lookups fail.",
      "Thinking `final List` makes the list read-only. Use `List.copyOf` or `Collections.unmodifiableList` for that.",
      "Comparing strings with `==`. It only works by accident for pooled literals.",
      "Returning a mutable field directly from a getter of a so-called immutable class.",
    ],
    qa: [
      [
        "Why is String immutable?",
        "Security (class names, file paths and URLs cannot change after validation), the string pool (sharing is safe only if nobody can modify a shared object), thread safety, and hash caching (the hash never changes, so it can be stored).",
      ],
      [
        "Is a record a good HashMap key?",
        "Yes. A record has final fields and generates `equals` and `hashCode` from all its components. Avoid putting mutable components such as an ArrayList inside it.",
      ],
      [
        "Can an abstract class have a constructor?",
        "Yes. It runs when a subclass is instantiated (through `super(...)`) to initialise the abstract class's fields, even though you can never call `new` on the abstract class itself.",
      ],
    ],
    ex: [
      "Write an immutable `Money` class with `amount` (long, in paise) and `currency` (String), `plus(Money)` returning a new object, and correct equals/hashCode. Prove that two equal Money objects find the same HashMap entry.",
      "Use `final class Money { private final long amount; private final String currency; ... }`. `plus` checks that the currencies match and returns `new Money(amount + other.amount, currency)`. `equals` compares both fields and `hashCode` returns `Objects.hash(amount, currency)`. `map.put(new Money(100, \"INR\"), \"x\")` followed by `map.get(new Money(100, \"INR\"))` returns \"x\".",
    ],
  }),

  lesson("Core Java Q11-Q20: Collection Class Comparisons", {
    intro:
      "Questions 11 to 20 are the \"difference between\" questions that almost every Java interview includes: HashMap vs Hashtable, ArrayList vs Vector and LinkedList, the three Set implementations, the four Map implementations, IdentityHashMap, Collection vs Collections, Comparable vs Comparator and Iterator vs ListIterator. Each answer explains the reason behind the difference so you can reason about it instead of memorising a table.",
    topics: [
      [
        "Q11. What is the difference between HashMap and Hashtable?",
        "**Synchronization**: Hashtable synchronizes every method, so it is thread-safe but slow under contention. HashMap is not synchronized. **Nulls**: HashMap allows one null key and any number of null values. Hashtable throws a NullPointerException for both. **Iteration**: HashMap's iterator is fail-fast. Hashtable's legacy `Enumeration` is not fail-fast. **Age**: Hashtable is a JDK 1.0 legacy class that extends `Dictionary`, while HashMap (1.2) belongs to the Collections Framework.\n\nToday you use HashMap on a single thread and ConcurrentHashMap when threads share the map, not Hashtable.",
      ],
      [
        "Q12. What is the difference between ArrayList and Vector?",
        "Both are resizable arrays. Vector's methods are synchronized, so every call takes a lock even on one thread. ArrayList's methods are not. When full, Vector doubles its capacity by default (or grows by a set `capacityIncrement`), while ArrayList grows by about 50% (`old + old/2`). Vector is a legacy 1.0 class that also offers an `Enumeration`.\n\nFor a thread-safe list, prefer `Collections.synchronizedList(new ArrayList<>())`, or `CopyOnWriteArrayList` when reads dominate.",
      ],
      [
        "Q13. What is the difference between ArrayList and LinkedList?",
        "ArrayList stores elements in a contiguous array. `get(i)` is O(1), and adding at the end is amortised O(1). Inserting or removing in the middle shifts the following elements, O(n). LinkedList is a doubly linked list of nodes. `get(i)` walks from the nearer end, O(n). Inserting or removing at a known node (through an iterator, or at either end) is O(1). LinkedList also implements `Deque`, so it works as a stack or queue.\n\nEach LinkedList node costs extra memory for two pointers, and its scattered nodes are less cache friendly. In practice ArrayList is faster for most workloads. For queues, prefer `ArrayDeque`.",
      ],
      [
        "Q14. When do you use HashSet, LinkedHashSet and TreeSet?",
        "**HashSet** (backed by a HashMap) has no defined order, O(1) add, remove and contains, and allows one null. Use it for fast membership checks. **LinkedHashSet** adds a doubly linked list through the entries, so it iterates in insertion order at almost the same speed. Use it to remove duplicates while keeping the original order. **TreeSet** (a red-black tree through TreeMap) keeps elements sorted by natural order or a Comparator. Operations are O(log n). It offers `first`, `last`, `floor`, `ceiling` and `headSet`, and rejects null.",
      ],
      [
        "Q15. What is the difference between HashMap and ConcurrentHashMap?",
        "HashMap is not thread-safe: concurrent puts can lose updates or corrupt buckets, and modifying it while iterating throws ConcurrentModificationException. ConcurrentHashMap is built for concurrency. Reads take no lock, writes lock only one bucket (using CAS for an empty bucket), and its iterators are weakly consistent and never throw CME. It also provides atomic compound operations such as `putIfAbsent`, `computeIfAbsent` and `merge`.\n\nConcurrentHashMap rejects null keys and values, because a null from `get` would be ambiguous between \"absent\" and \"mapped to null\" when other threads can change the map.",
      ],
      [
        "Q16. When do you use HashMap, Hashtable, LinkedHashMap and TreeMap?",
        "**HashMap**: the default choice, with no ordering and O(1) operations. **LinkedHashMap**: when you need predictable iteration order. It keeps insertion order, or access order when constructed with `accessOrder = true`, which together with `removeEldestEntry` makes a simple LRU cache. **TreeMap**: when keys must stay sorted or you need range queries (`firstKey`, `headMap`, `ceilingKey`). Operations are O(log n) and the keys must be comparable. **Hashtable**: only for old APIs that require it; otherwise use ConcurrentHashMap.",
      ],
      [
        "Q17. What is the difference between HashMap and IdentityHashMap?",
        "HashMap compares keys with `equals()` and hashes them with `hashCode()`. IdentityHashMap compares keys with `==` and uses `System.identityHashCode()`, so two different String objects with the same text are two separate keys. Internally it uses linear probing in a single array instead of bucket chains.\n\nIdentityHashMap deliberately breaks the general Map contract. It is meant for algorithms that track object identity, such as serialization, deep copying and graph traversal, where you must know whether you have already seen this exact object.",
      ],
      [
        "Q18. What is the difference between Collection and Collections?",
        "`Collection` (singular) is the root **interface** of the collection hierarchy. List, Set and Queue extend it, and it declares `add`, `remove`, `size`, `iterator` and `stream`. `Collections` (plural) is a **utility class** full of static methods that operate on collections. Examples are `sort`, `reverse`, `shuffle`, `max`, `min`, `frequency`, `unmodifiableList`, `synchronizedMap` and `emptyList`. The same naming pattern exists for `Array`/`Arrays` and `Object`/`Objects`.",
      ],
      [
        "Q19. What is the difference between Comparable and Comparator?",
        "**Comparable** (`java.lang`) defines a class's natural ordering from inside the class with a single method, `compareTo(T other)`. String, Integer and LocalDate implement it. `Collections.sort(list)` and TreeSet use it automatically.\n\n**Comparator** (`java.util`) is a separate object with `compare(T a, T b)`, so you can define many orderings without touching the class, even for classes you cannot edit. Since Java 8 you can build comparators fluently: `Comparator.comparing(Employee::salary).reversed().thenComparing(Employee::name)`.",
      ],
      [
        "Q20. What is the difference between Iterator and ListIterator?",
        "`Iterator` works on any Collection and moves only forward. Its methods are `hasNext()`, `next()` and `remove()`. `ListIterator` works only on Lists and moves both ways (`hasPrevious()`, `previous()`). It knows its position (`nextIndex()`, `previousIndex()`), can replace the last returned element with `set(e)`, and can insert at the cursor with `add(e)`. You get one from `list.listIterator()` or `list.listIterator(startIndex)`.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    record Employee(String name, int salary) implements Comparable<Employee> {
        // Q19: natural ordering defined inside the class (by name).
        public int compareTo(Employee other) { return name.compareTo(other.name); }
    }

    public static void main(String[] args) {
        // Q11: HashMap accepts nulls, Hashtable rejects them.
        Map<String, String> hashMap = new HashMap<>();
        hashMap.put(null, "null key ok");
        System.out.println("Q11 HashMap null key -> " + hashMap.get(null));
        try {
            new Hashtable<String, String>().put(null, "x");
        } catch (NullPointerException e) {
            System.out.println("Q11 Hashtable null key -> NullPointerException");
        }

        // Q12: Vector doubles, ArrayList grows by half (capacity is internal, so we show the rule).
        int capacity = 10;
        System.out.println("Q12 next capacity: ArrayList " + (capacity + (capacity >> 1)) + ", Vector " + capacity * 2);

        // Q13: LinkedList is also a Deque.
        LinkedList<Integer> linked = new LinkedList<>(List.of(2, 3));
        linked.addFirst(1);      // O(1) at the head
        linked.addLast(4);       // O(1) at the tail
        System.out.println("Q13 LinkedList as deque: " + linked + ", pollFirst = " + linked.pollFirst());

        // Q14: the three Set implementations and their ordering.
        List<String> input = List.of("mango", "apple", "kiwi", "apple");
        System.out.println("Q14 LinkedHashSet " + new LinkedHashSet<>(input) + ", TreeSet " + new TreeSet<>(input));

        // Q15: ConcurrentHashMap allows modification during iteration and offers atomic merge.
        Map<String, Integer> chm = new ConcurrentHashMap<>(Map.of("a", 1));
        for (String key : chm.keySet()) if (!key.endsWith("!")) chm.put(key + "!", 2); // no CME
        chm.merge("a", 10, Integer::sum);                        // atomic read-modify-write
        System.out.println("Q15 ConcurrentHashMap after edits: " + new TreeMap<>(chm));
        try {
            Map<String, Integer> plain = new HashMap<>(Map.of("a", 1, "b", 2));
            for (String key : plain.keySet()) plain.put(key + "!", 2);
        } catch (ConcurrentModificationException e) {
            System.out.println("Q15 HashMap modified during iteration -> ConcurrentModificationException");
        }

        // Q16: an LRU cache from LinkedHashMap in access order.
        Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) { return size() > 2; }
        };
        lru.put("x", 1); lru.put("y", 2); lru.get("x"); lru.put("z", 3);   // y is least recently used
        TreeMap<Integer, String> grades = new TreeMap<>(Map.of(90, "A", 75, "B", 60, "C"));
        System.out.println("Q16 LRU keeps " + lru.keySet() + ", TreeMap floorKey(80) = " + grades.floorKey(80));

        // Q17: identity vs equality.
        String k1 = new String("id"), k2 = new String("id");
        Map<String, Integer> equalityMap = new HashMap<>();
        Map<String, Integer> identityMap = new IdentityHashMap<>();
        equalityMap.put(k1, 1); equalityMap.put(k2, 2);
        identityMap.put(k1, 1); identityMap.put(k2, 2);
        System.out.println("Q17 HashMap size " + equalityMap.size() + ", IdentityHashMap size " + identityMap.size());

        // Q18: Collections is the utility class.
        List<Integer> numbers = new ArrayList<>(List.of(5, 1, 4));
        Collections.sort(numbers);
        System.out.println("Q18 Collections.sort -> " + numbers + ", max = " + Collections.max(numbers));

        // Q19: natural order vs a separate Comparator.
        List<Employee> staff = new ArrayList<>(List.of(new Employee("Zoya", 90), new Employee("Arun", 70)));
        Collections.sort(staff);
        System.out.println("Q19 by name (Comparable): " + staff);
        staff.sort(Comparator.comparingInt(Employee::salary).reversed());
        System.out.println("Q19 by salary desc (Comparator): " + staff);

        // Q20: ListIterator walks both ways and can set/add.
        List<String> letters = new ArrayList<>(List.of("a", "b", "c"));
        ListIterator<String> it = letters.listIterator();
        while (it.hasNext()) {
            String value = it.next();
            if (value.equals("b")) { it.set("B"); it.add("b+"); }
        }
        StringBuilder backwards = new StringBuilder();
        while (it.hasPrevious()) backwards.append(it.previous()).append(' ');
        System.out.println("Q20 after set/add: " + letters + ", backwards: " + backwards.toString().trim());
    }
}`,
    walk:
      "Each block shows one comparison in action. Q11 stores a null key in HashMap and gets a NullPointerException from Hashtable. Q12 prints the two growth formulas. Q13 uses LinkedList's deque methods at both ends. Q14 feeds the same words into LinkedHashSet (insertion order) and TreeSet (sorted, duplicates removed).\n\nQ15 adds keys to a ConcurrentHashMap while iterating it, which is allowed, then repeats the loop on a HashMap and catches the ConcurrentModificationException. Q16 builds an access-ordered LinkedHashMap that removes its eldest entry. Reading `x` makes `y` the least recently used, so `y` is evicted. Q17 shows that two equal but distinct strings are one key in HashMap and two keys in IdentityHashMap. Q19 sorts once by natural order and once with a Comparator. Q20 replaces and inserts during a forward pass with ListIterator, then walks back.",
    anim: [
      "Choosing a Map implementation",
      [
        ["need", "requirement", "what do you need?"],
        ["hm", "HashMap", "fast, no order"],
        ["lhm", "LinkedHashMap", "insert/access order"],
        ["tm", "TreeMap", "sorted keys"],
        ["chm", "ConcurrentHM", "many threads"],
      ],
      [
        ["need", "hm", "just lookups", "Single thread, no ordering needed: HashMap with O(1) get and put."],
        ["need", "lhm", "keep order", "Iteration must follow insertion or access order: LinkedHashMap, also an LRU base."],
        ["need", "tm", "sorted/range", "Keys must stay sorted or you need floorKey/headMap: TreeMap at O(log n)."],
        ["need", "chm", "shared", "Threads share the map: ConcurrentHashMap, not the fully locked Hashtable."],
        ["hm", "chm", "upgrade", "A HashMap that becomes shared must be replaced, never just read without locks."],
      ],
    ],
    mistakes: [
      "Choosing LinkedList for random access by index. Every `get(i)` walks the nodes.",
      "Using Hashtable or Vector in new code just to get thread safety. The concurrent collections scale far better.",
      "Calling `list.remove()` inside a for-each loop instead of using `Iterator.remove()`.",
      "Writing a Comparator by subtracting ints (`a - b`). It overflows for large values; use `Integer.compare`.",
    ],
    qa: [
      [
        "Which is faster for adding at the end, ArrayList or LinkedList?",
        "Both are O(1) amortised, but ArrayList is usually faster in practice because it writes into an existing array slot, while LinkedList allocates a node object for every element.",
      ],
      [
        "Why can't ConcurrentHashMap store null?",
        "With concurrent updates, `get(k) == null` could not tell \"absent\" from \"mapped to null\", and a follow-up `containsKey` could see a different state. Disallowing null keeps the answer unambiguous.",
      ],
      [
        "Can TreeMap use keys that do not implement Comparable?",
        "Yes, if you pass a Comparator to the TreeMap constructor. Without one, the first `put` of a non-comparable key throws ClassCastException.",
      ],
    ],
    ex: [
      "You must store user sessions so that the least recently used session is evicted when there are more than 1000. Which collection do you pick and how?",
      "Extend `LinkedHashMap` with `accessOrder = true` and override `removeEldestEntry` to return `size() > 1000`. Every `get` moves the entry to the end, so the eldest entry is the least recently used one. For multi-threaded use, wrap it with `Collections.synchronizedMap` or use a cache library.",
    ],
  }),

  lesson("Core Java Q21-Q27: Concurrent Collections, Your Own HashMap and Fail-Fast Iterators", {
    intro:
      "Questions 21 to 27 move from basic collections to their concurrent counterparts: CopyOnWriteArrayList, CopyOnWriteArraySet, ConcurrentSkipListSet and ConcurrentSkipListMap. Then come writing your own HashMap, fail-fast vs fail-safe iteration with ConcurrentModificationException, and the old Enumeration interface. The program contains a complete, commented mini HashMap.",
    topics: [
      [
        "Q21. What is the difference between ArrayList and CopyOnWriteArrayList?",
        "CopyOnWriteArrayList (`java.util.concurrent`) is thread-safe without locking reads. Every write (add, set, remove) copies the whole internal array, changes the copy and swaps a volatile reference. Readers and iterators always see a stable snapshot, so its iterator **never throws** ConcurrentModificationException, and `Iterator.remove()` is not supported.\n\nThe cost is O(n) memory and time for every write, so it suits lists that are read very often and changed rarely, such as listener lists. An ArrayList is faster on a single thread, but it is unsafe to share, and its fail-fast iterator throws CME on concurrent modification.",
      ],
      [
        "Q22. What is the difference between HashSet and CopyOnWriteArraySet?",
        "HashSet is backed by a HashMap. It has O(1) operations and no ordering, is not thread-safe, and has a fail-fast iterator. CopyOnWriteArraySet is backed by a CopyOnWriteArrayList. It is thread-safe, keeps insertion order and has snapshot iterators. Because it is really a list, `contains` and `add` are O(n) (add must check for duplicates first), and every write copies the array. Use it only for small sets that are read far more than written.",
      ],
      [
        "Q23. What is the difference between TreeSet and ConcurrentSkipListSet?",
        "Both keep elements sorted and offer navigation methods such as `first`, `floor` and `headSet`. TreeSet uses a red-black tree and is not thread-safe; its iterator is fail-fast. ConcurrentSkipListSet uses a lock-free **skip list**: sorted linked lists layered with express lanes, giving expected O(log n) operations. Many threads can add and remove at the same time, and its iterators are weakly consistent, so they never throw CME. Neither allows null.",
      ],
      [
        "Q24. What is the difference between TreeMap and ConcurrentSkipListMap?",
        "This is the same contrast for maps. TreeMap is a sorted red-black tree for a single thread. ConcurrentSkipListMap is a sorted, concurrent NavigableMap built on a skip list. It provides atomic `putIfAbsent`, `replace` and `remove(key, value)` and weakly consistent iteration, and it rejects null keys and values. Use it when threads need a shared sorted map, for example an order book keyed by price or a time-ordered event index.",
      ],
      [
        "Q25. How would you write your own HashMap?",
        "A minimal HashMap is an array of buckets, where each bucket is a linked list of `Entry(key, value, next)`.\n\n- `put`: compute `index = (hash & 0x7fffffff) % table.length`, walk the bucket, replace the value if an entry's key `equals` the new key, otherwise prepend a new entry.\n- `get`: walk the same bucket comparing with `equals`.\n- `remove`: unlink the matching entry.\n- Resize: track the size and double the table when `size > capacity * 0.75` (the load factor), re-hashing every entry into the new array.\n- Null key: special-case it into bucket 0.\n\nThe real `java.util.HashMap` adds hash spreading (`h ^ (h >>> 16)`), power-of-two tables with `hash & (n - 1)`, and treeification of long buckets. The program below implements the simple version.",
      ],
      [
        "Q26. What are fail-fast and fail-safe iterators, and what is ConcurrentModificationException?",
        "A **fail-fast** iterator (ArrayList, HashMap, HashSet) records the collection's `modCount` when it is created. On each `next()` it compares that with the current modCount, and if the collection was structurally modified other than through the iterator itself, it throws **ConcurrentModificationException**. This happens even on a single thread: removing inside a for-each loop is enough. It is a best-effort bug detector, not a guarantee.\n\nA **fail-safe** (more precisely, weakly consistent or snapshot) iterator, from CopyOnWriteArrayList or ConcurrentHashMap, works on a snapshot or tolerates concurrent change, so it never throws CME. It may not show the latest updates. To remove safely while iterating, use `iterator.remove()` or `removeIf`.",
      ],
      [
        "Q27. What is the difference between Iterator and Enumeration?",
        "`Enumeration` (JDK 1.0) is the legacy cursor of Vector and Hashtable. It has `hasMoreElements()` and `nextElement()` and cannot remove elements. `Iterator` (JDK 1.2) works with all collections, has shorter method names, adds `remove()`, and is fail-fast for most collections. The Enumerations of Vector and Hashtable are not fail-fast. `Collections.list(enumeration)` converts one to an ArrayList, and since Java 9 `enumeration.asIterator()` adapts it.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {

    // Q25: a small, complete HashMap with separate chaining and resizing.
    static class MyHashMap<K, V> {
        // Each bucket is a singly linked list of entries.
        private static class Entry<K, V> {
            final K key;
            V value;
            Entry<K, V> next;
            Entry(K key, V value, Entry<K, V> next) { this.key = key; this.value = value; this.next = next; }
        }

        private Entry<K, V>[] table = newTable(4);
        private int size;

        @SuppressWarnings("unchecked")
        private static <K, V> Entry<K, V>[] newTable(int n) { return (Entry<K, V>[]) new Entry[n]; }

        // A null key always goes to bucket 0; otherwise drop the sign bit and take the remainder.
        private int indexFor(Object key, int length) {
            return key == null ? 0 : (key.hashCode() & 0x7fffffff) % length;
        }

        public V put(K key, V value) {
            int i = indexFor(key, table.length);
            for (Entry<K, V> e = table[i]; e != null; e = e.next) {
                if (Objects.equals(e.key, key)) {        // same key: replace the value
                    V old = e.value;
                    e.value = value;
                    return old;
                }
            }
            table[i] = new Entry<>(key, value, table[i]); // new key: prepend to the chain
            if (++size > table.length * 3 / 4) resize();  // load factor 0.75
            return null;
        }

        public V get(Object key) {
            for (Entry<K, V> e = table[indexFor(key, table.length)]; e != null; e = e.next)
                if (Objects.equals(e.key, key)) return e.value;
            return null;
        }

        public V remove(Object key) {
            int i = indexFor(key, table.length);
            Entry<K, V> prev = null;
            for (Entry<K, V> e = table[i]; e != null; prev = e, e = e.next) {
                if (Objects.equals(e.key, key)) {
                    if (prev == null) table[i] = e.next; else prev.next = e.next; // unlink
                    size--;
                    return e.value;
                }
            }
            return null;
        }

        // Double the table and re-insert every entry, because indexes depend on the length.
        private void resize() {
            Entry<K, V>[] old = table;
            table = newTable(old.length * 2);
            for (Entry<K, V> head : old)
                for (Entry<K, V> e = head; e != null; e = e.next) {
                    int i = indexFor(e.key, table.length);
                    table[i] = new Entry<>(e.key, e.value, table[i]);
                }
        }

        public int size() { return size; }
        public int capacity() { return table.length; }
    }

    public static void main(String[] args) throws Exception {
        // Q21: CopyOnWriteArrayList iterates over a snapshot, so adding during iteration is safe.
        List<String> cow = new CopyOnWriteArrayList<>(List.of("a", "b"));
        for (String s : cow) cow.add(s.toUpperCase());          // loop still sees only a, b
        System.out.println("Q21 CopyOnWriteArrayList: " + cow);

        // Q22: CopyOnWriteArraySet keeps insertion order and ignores duplicates.
        Set<Integer> cowSet = new CopyOnWriteArraySet<>(List.of(3, 1, 3, 2));
        System.out.println("Q22 CopyOnWriteArraySet: " + cowSet);

        // Q23 + Q24: concurrent sorted collections filled by four threads at once.
        ConcurrentSkipListSet<Integer> skipSet = new ConcurrentSkipListSet<>();
        ConcurrentSkipListMap<Integer, String> skipMap = new ConcurrentSkipListMap<>();
        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int t = 0; t < 4; t++) {
            int start = t;
            pool.submit(() -> {
                for (int i = start; i < 20; i += 4) { skipSet.add(i); skipMap.put(i, "v" + i); }
            });
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("Q23 ConcurrentSkipListSet size " + skipSet.size() + ", first " + skipSet.first()
                + ", headSet(5) " + skipSet.headSet(5));
        System.out.println("Q24 ConcurrentSkipListMap ceilingKey(8): " + skipMap.ceilingKey(8)
                + ", lastEntry " + skipMap.lastEntry());

        // Q25: exercise the hand-written map.
        MyHashMap<String, Integer> map = new MyHashMap<>();
        for (String word : "to be or not to be".split(" ")) {
            Integer count = map.get(word);
            map.put(word, count == null ? 1 : count + 1);
        }
        map.put(null, 0);
        System.out.println("Q25 MyHashMap to=" + map.get("to") + " be=" + map.get("be") + " null=" + map.get(null)
                + " size=" + map.size() + " capacity=" + map.capacity());
        map.remove("or");
        System.out.println("Q25 after remove(or): get(or)=" + map.get("or") + " size=" + map.size());

        // Q26: fail-fast iterator vs the safe ways to remove.
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
        try {
            for (Integer n : nums) if (n == 2) nums.remove(n);   // structural change behind the iterator
        } catch (ConcurrentModificationException e) {
            System.out.println("Q26 for-each + list.remove -> ConcurrentModificationException");
        }
        for (Iterator<Integer> it = nums.iterator(); it.hasNext(); )
            if (it.next() % 2 == 0) it.remove();                 // the iterator's own remove is allowed
        System.out.println("Q26 after iterator.remove of evens: " + nums);

        // Q27: Enumeration from a Vector, converted to an Iterator.
        Vector<String> vector = new Vector<>(List.of("x", "y"));
        Enumeration<String> en = vector.elements();
        StringBuilder seen = new StringBuilder();
        while (en.hasMoreElements()) seen.append(en.nextElement());
        Iterator<String> adapted = vector.elements().asIterator();
        System.out.println("Q27 Enumeration read " + seen + ", asIterator first = " + adapted.next());
    }
}`,
    walk:
      "Q21 adds to a CopyOnWriteArrayList inside its own for-each loop. The loop iterates the original two-element snapshot, so it ends normally and the list has four elements. Q22 shows that CopyOnWriteArraySet drops the duplicate 3 and keeps insertion order. For Q23 and Q24, four pool threads insert 0 to 19 into the skip-list set and map at the same time. After `awaitTermination` both are complete and sorted.\n\nQ25 counts words with the hand-written `MyHashMap`. Four distinct words plus the null key make five entries. The fourth entry pushes the size past 0.75 × 4 = 3, so the table doubles once from 4 to 8, and the null key lands in bucket 0. `remove` unlinks the entry. Q26 triggers ConcurrentModificationException with a for-each removal, then removes the even numbers safely with `Iterator.remove`. Q27 walks a Vector with an Enumeration and adapts it with `asIterator()`.",
    anim: [
      "Fail-fast iteration and modCount",
      [
        ["list", "ArrayList", "modCount = 4"],
        ["it", "Iterator", "expected = 4"],
        ["loop", "for-each body", "list.remove(2)"],
        ["check", "next()", "4 != 5 ?"],
        ["cme", "CME thrown", "fail fast"],
      ],
      [
        ["list", "it", "iterator()", "Creating the iterator copies the list's modCount as expectedModCount."],
        ["it", "loop", "next() = 2", "The loop body receives element 2 and calls list.remove directly."],
        ["loop", "list", "modCount++", "A structural change increments the list's modCount to 5."],
        ["it", "check", "next()", "The next call compares expectedModCount 4 with modCount 5."],
        ["check", "cme", "mismatch", "The counts differ, so ConcurrentModificationException is thrown at once."],
      ],
    ],
    mistakes: [
      "Expecting a fail-fast iterator to guarantee detection in multi-threaded code. It is best effort only; use a concurrent collection instead.",
      "Using CopyOnWriteArrayList for a list that changes often. Each write copies the whole array.",
      "Forgetting to resize, or to re-hash on resize, in a custom HashMap. The bucket index depends on the table length.",
    ],
    qa: [
      [
        "Why does the hand-written map use `hash & 0x7fffffff`?",
        "`hashCode()` can be negative, and a negative number `%` the length gives a negative index. Masking off the sign bit keeps the index in range.",
      ],
      [
        "Does a fail-safe iterator show elements added after it was created?",
        "For CopyOnWriteArrayList, no: it iterates the snapshot taken at creation. For ConcurrentHashMap it may or may not, because its iterator is weakly consistent.",
      ],
      [
        "How do you safely remove while iterating a HashMap?",
        "Use `map.entrySet().removeIf(e -> ...)`, or `Iterator<Map.Entry<K,V>> it = map.entrySet().iterator(); ... it.remove();`.",
      ],
    ],
    ex: [
      "Add a `containsKey(Object key)` method and a `keys()` method returning a List to the hand-written MyHashMap. How must `containsKey` differ from `get(key) != null`?",
      "`containsKey` walks the bucket and returns true as soon as `Objects.equals(e.key, key)`, even when the stored value is null. `get(key) != null` would wrongly report false for a key mapped to null. `keys()` loops over every bucket and every chain, adding `e.key` to a new ArrayList.",
    ],
  }),
];
