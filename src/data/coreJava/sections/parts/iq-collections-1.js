import { lesson } from "../../schema.js";

export default [
  lesson("Collections Q1-Q12: Framework, Hierarchies and the Basic Differences", {
    intro:
      "This lesson opens the collection-framework interview round:\n\n- what the framework is and its root interface\n- the most-used interfaces and classes\n- the sub-interfaces of Collection, and whether Map is one\n- the List, Set and Map hierarchies in detail\n- the first comparison questions: ArrayList vs LinkedList and Vector, List vs Set, Iterator vs ListIterator and Enumeration, and Collection vs Collections\n\nThe program prints the real type hierarchy using reflection, so you can see the tree instead of memorising it.",
    topics: [
      [
        "Q1. What is the Collection Framework, and what is its root interface?",
        "The Java Collections Framework (JDK 1.2, `java.util`) is a unified architecture for storing and manipulating groups of objects. It has three parts:\n\n- **interfaces** (Collection, List, Set, Queue, Deque, Map) that describe behaviour\n- **implementations** (ArrayList, HashSet, HashMap...) that provide data structures\n- **algorithms** (in `Collections` and `Arrays`) such as sort, search and shuffle\n\nIts benefits are less code, interoperability between APIs, and tuned performance. The root of the element hierarchy is **`java.util.Collection`**, which itself extends `java.lang.Iterable`, so every collection can be used in a for-each loop. Map is a separate root.",
      ],
      [
        "Q2. Which collection interfaces and classes are used most often?",
        "Interfaces: `List`, `Set`, `SortedSet`/`NavigableSet`, `Queue`, `Deque`, `Map`, `SortedMap`/`NavigableMap`, `Iterator` and `Comparator`.\n\nClasses:\n\n- **List**: `ArrayList` and `LinkedList`.\n- **Set**: `HashSet`, `LinkedHashSet` and `TreeSet`.\n- **Map**: `HashMap`, `LinkedHashMap` and `TreeMap`.\n- **Queue and Deque**: `ArrayDeque` and `PriorityQueue`.\n- **Concurrent**: `ConcurrentHashMap`, `CopyOnWriteArrayList`, `LinkedBlockingQueue` and `ArrayBlockingQueue`.\n- **Utilities**: `Collections` and `Arrays`.\n- **Legacy**: `Vector`, `Stack` and `Hashtable` still appear in old code.",
      ],
      [
        "Q3. What are the sub-interfaces of Collection? Is Map a Collection?",
        "The direct sub-interfaces of `Collection` are:\n\n- **List**: ordered, indexed, duplicates allowed.\n- **Set**: unique elements, with `SortedSet` and then `NavigableSet` below it.\n- **Queue**: FIFO-style processing, with `Deque` and `BlockingQueue` below it.\n- **SequencedCollection** (Java 21), which sits between Collection and List or Deque.\n\n**Map is not a Collection**. It stores key-value pairs and its operations (`put(k, v)`, `get(k)`) do not fit `add(e)`. You can view a map as collections through `keySet()`, `values()` and `entrySet()`.",
      ],
      [
        "Q4. What is the difference between ArrayList and LinkedList?",
        "ArrayList is backed by a resizable array:\n\n- `get(i)` is O(1).\n- Appending is amortised O(1).\n- Inserting or removing in the middle shifts elements, O(n).\n- It uses little memory per element and is cache friendly.\n\nLinkedList is a doubly linked list:\n\n- `get(i)` is O(n).\n- Insertion or removal at the ends, or at an iterator position, is O(1).\n- Each node costs about 24 extra bytes.\n- It also implements Deque.\n\nUse ArrayList by default and ArrayDeque for queues. LinkedList wins only when you insert or remove heavily through a ListIterator in the middle.",
      ],
      [
        "Q5. What is the difference between ArrayList and Vector?",
        "Vector synchronizes every method, while ArrayList synchronizes none. Vector doubles its capacity when full, while ArrayList grows by 50%. Vector is legacy (JDK 1.0) and also has an `elements()` Enumeration. Both allow nulls and duplicates and both have fail-fast iterators. Vector's per-method locking is not enough for compound actions anyway (check-then-act still races), so modern code uses ArrayList with external locking, `Collections.synchronizedList`, or `CopyOnWriteArrayList`.",
      ],
      [
        "Q6. What is the difference between List and Set?",
        "A List keeps insertion order, allows duplicates and many nulls, and supports positional access (`get`, `set`, `add(index)`, `indexOf`, `subList`). A Set rejects duplicates, as decided by `equals` (or `compareTo` for TreeSet), and has no index. Its order depends on the implementation, and its null support does too: HashSet allows one null, TreeSet allows none. `list.contains` is O(n), while `HashSet.contains` is O(1), which is why converting a List to a Set is the standard way to remove duplicates or speed up membership checks.",
      ],
      [
        "Q7. What is the difference between Iterator and ListIterator?",
        "`Iterator` works on every Collection. It is forward-only, with `hasNext`, `next` and `remove`. `ListIterator` works only on Lists. It is bidirectional (`hasPrevious`, `previous`), knows its position (`nextIndex`, `previousIndex`), can `set` the last returned element and `add` at the cursor, and can start at any index with `listIterator(i)`. Both are fail-fast for the standard lists.",
      ],
      [
        "Q8. What is the difference between Collection and Collections?",
        "`Collection` is the root interface that List, Set and Queue extend. `Collections` is a final utility class with only static methods:\n\n- `sort`, `binarySearch`, `reverse`, `shuffle`, `swap`, `rotate`\n- `max`, `min`, `frequency`, `disjoint`\n- `unmodifiableX` and `synchronizedX` wrappers\n- `emptyList`, `singletonList`, `nCopies`\n- `addAll`\n\nOne describes a type, the other provides algorithms over that type.",
      ],
      [
        "Q9. What does the List hierarchy look like?",
        "`Iterable → Collection → SequencedCollection (21) → List`. The implementations are:\n\n- `ArrayList` (extends AbstractList)\n- `LinkedList` (extends AbstractSequentialList and also implements Deque)\n- `Vector` (extends AbstractList), with `Stack` extending Vector\n- `CopyOnWriteArrayList` (implements List directly)\n\nThe immutable lists returned by `List.of` are internal classes (`ImmutableCollections.ListN`). `RandomAccess` is a marker interface implemented by ArrayList, Vector and CopyOnWriteArrayList, so algorithms can choose index loops over iterators.",
      ],
      [
        "Q10. What does the Set hierarchy look like?",
        "`Iterable → Collection → Set`. Then:\n\n- `HashSet` (extends AbstractSet, backed by a HashMap), with `LinkedHashSet` extending it.\n- `SortedSet → NavigableSet → TreeSet`, backed by a TreeMap.\n- `ConcurrentSkipListSet` (NavigableSet).\n- `CopyOnWriteArraySet`.\n- `EnumSet`, an abstract class with RegularEnumSet and JumboEnumSet as implementations.\n\nLinkedHashSet also implements SequencedSet (Java 21), so `reversed()`, `getFirst()` and `getLast()` work on it.",
      ],
      [
        "Q11. What does the Map hierarchy look like?",
        "`Map` is a separate root. Then:\n\n- `HashMap` (extends AbstractMap), with `LinkedHashMap` extending it.\n- `SortedMap → NavigableMap → TreeMap`.\n- `Hashtable` (extends the legacy `Dictionary`), with `Properties` extending Hashtable.\n- `WeakHashMap`, `IdentityHashMap` and `EnumMap`.\n- `ConcurrentMap → ConcurrentHashMap`, and `ConcurrentNavigableMap → ConcurrentSkipListMap`.\n- `SequencedMap` (Java 21) above LinkedHashMap and the sorted maps.\n\nEvery Map works with `Map.Entry` pairs.",
      ],
      [
        "Q12. What is the difference between Iterator and Enumeration?",
        "Enumeration (JDK 1.0) belongs to the legacy classes Vector, Hashtable and Properties. It has `hasMoreElements` and `nextElement`, has no remove, and is not fail-fast. Iterator (JDK 1.2) works with all collections, has shorter names, supports `remove()`, is fail-fast for most collections, and since Java 8 has `forEachRemaining`. Use `Collections.list(e)` or `e.asIterator()` to bridge from old code.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {

    // Walk up the interfaces of a class to print where it sits in the hierarchy.
    static String interfacesOf(Class<?> type) {
        Set<String> names = new TreeSet<>();
        Deque<Class<?>> todo = new ArrayDeque<>();
        for (Class<?> c = type; c != null; c = c.getSuperclass()) todo.addAll(List.of(c.getInterfaces()));
        while (!todo.isEmpty()) {
            Class<?> i = todo.pop();
            if (i.getPackageName().equals("java.util") || i == Iterable.class) {
                if (names.add(i.getSimpleName())) todo.addAll(List.of(i.getInterfaces()));
            }
        }
        names.remove("RandomAccess");                     // keep the output focused on the main tree
        return names.toString();
    }

    static String superclasses(Class<?> type) {
        StringJoiner chain = new StringJoiner(" -> ");
        for (Class<?> c = type; c != null; c = c.getSuperclass()) chain.add(c.getSimpleName());
        return chain.toString();
    }

    public static void main(String[] args) {
        // Q1 + Q3: Collection extends Iterable; Map is not a Collection.
        System.out.println("Q1  Collection extends Iterable: " + Iterable.class.isAssignableFrom(Collection.class));
        System.out.println("Q3  HashMap is a Collection? " + Collection.class.isAssignableFrom(HashMap.class)
                + ", its views: keySet " + new HashMap<>(Map.of(1, "a")).keySet() + " is a Set");

        // Q9, Q10, Q11: hierarchies discovered at runtime.
        System.out.println("Q9  ArrayList  : " + superclasses(ArrayList.class) + " implements " + interfacesOf(ArrayList.class));
        System.out.println("Q9  LinkedList : implements " + interfacesOf(LinkedList.class));
        System.out.println("Q10 TreeSet    : " + superclasses(TreeSet.class) + " implements " + interfacesOf(TreeSet.class));
        System.out.println("Q10 LinkedHashSet: " + superclasses(LinkedHashSet.class));
        System.out.println("Q11 LinkedHashMap: " + superclasses(LinkedHashMap.class) + " implements " + interfacesOf(LinkedHashMap.class));
        System.out.println("Q11 Properties : " + superclasses(Properties.class));

        // Q4: positional insert in both lists.
        List<Integer> array = new ArrayList<>(List.of(1, 2, 4));
        LinkedList<Integer> linked = new LinkedList<>(array);
        array.add(2, 3);
        linked.add(2, 3);
        linked.offerFirst(0);                              // Deque operation only LinkedList has
        System.out.println("Q4  ArrayList " + array + ", LinkedList as Deque " + linked);

        // Q5: Vector is legacy and synchronized; it still offers an Enumeration.
        Vector<String> vector = new Vector<>(List.of("v1", "v2"));
        System.out.println("Q5  Vector capacity starts at " + new Vector<>().capacity() + ", elements() first = " + vector.elements().nextElement());

        // Q6: duplicates in a List vs a Set.
        List<String> list = List.of("a", "b", "a");
        System.out.println("Q6  List " + list + " size " + list.size() + ", Set " + new LinkedHashSet<>(list) + " size " + new HashSet<>(list).size());

        // Q7: ListIterator from the end, backwards with indexes.
        List<String> letters = new ArrayList<>(List.of("x", "y", "z"));
        ListIterator<String> it = letters.listIterator(letters.size());
        StringBuilder back = new StringBuilder();
        while (it.hasPrevious()) { int index = it.previousIndex(); back.append(index).append('=').append(it.previous()).append(' '); }
        System.out.println("Q7  backwards with indexes: " + back.toString().trim());

        // Q8: Collections algorithms.
        List<Integer> nums = new ArrayList<>(List.of(4, 1, 3, 1));
        Collections.sort(nums);
        System.out.println("Q8  sorted " + nums + ", frequency(1) = " + Collections.frequency(nums, 1)
                + ", nCopies " + Collections.nCopies(3, "ab"));

        // Q12: Enumeration vs Iterator on a Hashtable.
        Hashtable<String, Integer> table = new Hashtable<>(Map.of("k", 1));
        Enumeration<String> keys = table.keys();
        Iterator<String> keyIterator = table.keySet().iterator();
        System.out.println("Q12 Enumeration -> " + keys.nextElement() + ", Iterator -> " + keyIterator.next()
                + ", Iterator can remove: " + tryRemove(keyIterator) + ", table now " + table);

        // Q2: a few concurrent classes and their interfaces.
        System.out.println("Q2  ConcurrentHashMap is a ConcurrentMap: " + (new ConcurrentHashMap<>() instanceof ConcurrentMap)
                + ", ArrayDeque is a Deque: " + (new ArrayDeque<>() instanceof Deque));
    }

    static boolean tryRemove(Iterator<String> iterator) { iterator.remove(); return true; }
}`,
    walk:
      "The two helper methods use reflection. `superclasses` follows `getSuperclass()` up to Object, and `interfacesOf` collects every `java.util` interface a class implements, directly or through its parents. The printed lines are therefore the real hierarchy of the JDK you run on, including Java 21's SequencedCollection and SequencedMap.\n\nQ1 and Q3 check the type relations: Collection extends Iterable, and HashMap is not a Collection although its keySet is a Set. Q4 inserts at index 2 in both lists and uses a Deque method only LinkedList has. Q6 shows duplicates kept in a List and dropped by a Set. Q7 walks a ListIterator backwards from the end, printing indexes. Q8 uses Collections utilities. Q12 reads a Hashtable through both an Enumeration and an Iterator, and only the Iterator can remove.",
    anim: [
      "The collection framework at a glance",
      [
        ["iter", "Iterable", "for-each"],
        ["coll", "Collection", "root interface"],
        ["list", "List", "ArrayList ..."],
        ["set", "Set", "HashSet, TreeSet"],
        ["queue", "Queue/Deque", "ArrayDeque ..."],
        ["map", "Map", "separate root"],
      ],
      [
        ["iter", "coll", "extends", "Collection extends Iterable, so every collection works in a for-each loop."],
        ["coll", "list", "ordered", "List adds index-based, ordered access and allows duplicates."],
        ["coll", "set", "unique", "Set forbids duplicates; SortedSet and NavigableSet add ordering."],
        ["coll", "queue", "processing", "Queue and Deque model FIFO, LIFO and priority processing."],
        ["map", "set", "keySet()", "Map is not a Collection, but its keySet, values and entrySet views are."],
      ],
    ],
    mistakes: [
      "Saying Map extends Collection. It does not; it is a separate hierarchy.",
      "Choosing LinkedList \"because inserts are O(1)\". Finding the position is O(n) unless you already hold an iterator there.",
      "Treating Vector as fully thread-safe for compound actions like `if (!v.contains(x)) v.add(x)`.",
    ],
    qa: [
      [
        "What is the RandomAccess interface for?",
        "It is a marker that says index access is fast. Algorithms such as `Collections.binarySearch` check `instanceof RandomAccess` to choose between an index loop and an iterator.",
      ],
      [
        "What did Java 21 add to the collection hierarchy?",
        "SequencedCollection, SequencedSet and SequencedMap, with `getFirst`, `getLast`, `addFirst`, `addLast`, `removeFirst`, `removeLast` and `reversed()` on ordered collections such as List, Deque, LinkedHashSet, LinkedHashMap, TreeSet and TreeMap.",
      ],
      [
        "Is Stack recommended?",
        "No. Stack extends synchronized Vector and exposes index methods that break the LIFO abstraction. Use `ArrayDeque` with `push`, `pop` and `peek`.",
      ],
    ],
    ex: [
      "Without running it, list every interface (from java.util) that `TreeMap` implements, directly or indirectly. Then check yourself by passing `TreeMap.class` to `interfacesOf`.",
      "Map, SortedMap, NavigableMap and SequencedMap (Java 21), plus Cloneable and Serializable from outside java.util. AbstractMap is its superclass and is not an interface.",
    ],
  }),

  lesson("Collections Q13-Q22: Keys, Implementation Choices, WeakHashMap, EnumSet and EnumMap", {
    intro:
      "Questions 13 to 22 are about choosing and using implementations:\n\n- overriding equals and hashCode for an Employee key\n- the preferred key types\n- HashMap vs Hashtable\n- when to use each Set\n- HashMap vs ConcurrentHashMap\n- when to use each Map\n- HashMap vs IdentityHashMap\n- the specialised WeakHashMap, EnumSet and EnumMap\n\nThe program shows WeakHashMap losing an entry after its key becomes unreachable, and the compact enum collections in action.",
    topics: [
      [
        "Q13. How do you override equals and hashCode for an Employee key?",
        "Choose the identity fields (for example `id` and `name`) and use exactly the same fields in both methods. In `equals`: check `this == o`, then `o instanceof Employee e` (or a getClass comparison), then compare the fields with `==` and `Objects.equals`. In `hashCode`, return `Objects.hash(id, name)`. Keep the fields final so the hash cannot change while the object is a key. A record, `record Employee(int id, String name) {}`, generates both methods correctly.",
      ],
      [
        "Q14. Which classes make the best HashMap keys?",
        "Immutable, final classes with a correct, well-distributed and cheap `hashCode`:\n\n- `String`, the most common, because it caches its hash\n- the wrapper classes (`Integer`, `Long`...)\n- enums (identity-based, with very fast hashing)\n- records with immutable components\n- `UUID`, `LocalDate` and other value-based classes\n\nMutable keys are dangerous, because a changed key cannot be found again. So are arrays, which use identity equality: wrap them in `List.of(...)` or use `Arrays.hashCode` in a key class.",
      ],
      [
        "Q15. What is the difference between HashMap and Hashtable?",
        "HashMap is unsynchronized, allows one null key and many null values, has a fail-fast iterator, and is part of the Collections Framework. Hashtable synchronizes every method, rejects null keys and values (NullPointerException), uses Enumeration plus fail-fast iterators, and extends the obsolete Dictionary class. HashMap is also faster because of hash spreading and tree bins. For thread safety use ConcurrentHashMap.",
      ],
      [
        "Q16. When should you use HashSet, LinkedHashSet or TreeSet?",
        "Use **HashSet** when you only need uniqueness and fast `contains`. **LinkedHashSet** removes duplicates while keeping first-insertion order, for example de-duplicating a list of user actions. **TreeSet** keeps elements sorted and lets you query neighbours: `ceiling(x)`, `floor(x)`, `headSet(x)`, `descendingSet()`. A leaderboard or an index of time slots are typical uses. TreeSet decides uniqueness by `compareTo`/`compare`, not by `equals`, so a comparator that returns 0 for distinct objects drops one of them.",
      ],
      [
        "Q17. What is the difference between HashMap and ConcurrentHashMap?",
        "ConcurrentHashMap is thread-safe:\n\n- Reads take no lock.\n- An empty bin is filled with CAS; otherwise only that bin is locked.\n- Iterators are weakly consistent and never throw ConcurrentModificationException.\n- It has atomic `putIfAbsent`, `compute`, `merge` and bulk `forEach`, `reduce` and `search` with a parallelism threshold.\n- It rejects nulls.\n\nHashMap is faster on one thread, allows nulls and is fail-fast. A HashMap shared between threads can lose entries.",
      ],
      [
        "Q18. When should you use HashMap, Hashtable, LinkedHashMap or TreeMap?",
        "- **HashMap**: the general default.\n- **LinkedHashMap**: when iteration order matters (insertion order, or access order for LRU caches with `removeEldestEntry`).\n- **TreeMap**: when keys must be sorted, or for range and nearest-key queries (`subMap`, `floorEntry`, `firstKey`), at O(log n).\n- **Hashtable**: only for legacy APIs.\n\nIf several threads share the map, pick ConcurrentHashMap or ConcurrentSkipListMap (sorted) instead.",
      ],
      [
        "Q19. What is the difference between HashMap and IdentityHashMap?",
        "HashMap matches keys by `equals` and `hashCode`. IdentityHashMap matches them by reference (`==`) and `System.identityHashCode`, uses an open-addressing array, and is meant for identity-sensitive algorithms: object-graph copying, serialization and proxy caches. With IdentityHashMap, `new String(\"a\")` and `new String(\"a\")` are two keys, while two references to one object are the same key.",
      ],
      [
        "Q20. What is WeakHashMap?",
        "A WeakHashMap holds its **keys through WeakReferences**. When a key is no longer strongly reachable anywhere else, the garbage collector can clear it, and the entry is removed automatically on the next map operation (through a ReferenceQueue). Values are held strongly, so a value must not refer back to its own key, or that key can never be collected.\n\nIt is useful for caches and metadata attached to objects whose lifetime you do not control (a listener registry, per-class data). Keys compare with equals, so String literals, which are pooled and always strongly reachable, are poor keys for it.",
      ],
      [
        "Q21. What is EnumSet?",
        "EnumSet is a specialised, very fast Set for the constants of one enum type. Internally it is a **bit vector**: a single `long` for up to 64 constants (RegularEnumSet), or a long array otherwise (JumboEnumSet). Operations are bit operations, iteration follows declaration (ordinal) order, and nulls are not allowed. You create one with factories: `EnumSet.of(A, B)`, `allOf`, `noneOf`, `range(from, to)` and `complementOf`. It replaces bit-flag ints in a type-safe way.",
      ],
      [
        "Q22. What is EnumMap?",
        "EnumMap is a Map whose keys are the constants of one enum type. It is backed by an **array indexed by ordinal**, so get and put are simple array accesses, faster than HashMap and more compact. It iterates in declaration order, rejects null keys (null values are allowed), and needs the enum class in its constructor: `new EnumMap<>(Day.class)`. Use it for per-constant data, such as counters per status or handlers per command type.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

    // Q13: equals and hashCode on the same final fields.
    static final class Employee {
        private final int id; private final String name;
        Employee(int id, String name) { this.id = id; this.name = name; }
        @Override public boolean equals(Object o) {
            return o instanceof Employee e && id == e.id && Objects.equals(name, e.name);
        }
        @Override public int hashCode() { return Objects.hash(id, name); }
    }

    // A key class for WeakHashMap whose instances are not pooled.
    record Session(String id) { }

    public static void main(String[] args) throws Exception {
        // Q13
        Map<Employee, String> roles = new HashMap<>();
        roles.put(new Employee(1, "Ira"), "lead");
        System.out.println("Q13 equal Employee finds: " + roles.get(new Employee(1, "Ira")));

        // Q14: arrays make poor keys; a List wrapper works.
        Map<Object, String> byArray = new HashMap<>();
        byArray.put(new int[] {1, 2}, "array");
        byArray.put(List.of(1, 2), "list");
        System.out.println("Q14 array key found? " + byArray.containsKey(new int[] {1, 2})
                + ", List key found? " + byArray.containsKey(List.of(1, 2)));

        // Q15
        Map<String, String> hashMap = new HashMap<>();
        hashMap.put(null, null);
        System.out.println("Q15 HashMap with null key/value size " + hashMap.size());

        // Q16: TreeSet neighbour queries.
        TreeSet<Integer> slots = new TreeSet<>(List.of(9, 11, 14, 16));
        System.out.println("Q16 next slot after 12: " + slots.ceiling(12) + ", before 12: " + slots.floor(12)
                + ", descending " + slots.descendingSet());

        // Q17: ConcurrentHashMap rejects null.
        try {
            new ConcurrentHashMap<String, String>().put("k", null);
        } catch (NullPointerException e) {
            System.out.println("Q17 ConcurrentHashMap null value -> NullPointerException");
        }

        // Q18: TreeMap range view.
        TreeMap<Integer, String> prices = new TreeMap<>(Map.of(100, "pen", 250, "book", 900, "bag"));
        System.out.println("Q18 items 100..300: " + prices.subMap(100, true, 300, true) + ", cheapest " + prices.firstEntry());

        // Q19
        Map<String, Integer> identity = new IdentityHashMap<>();
        String shared = new String("a");
        identity.put(shared, 1);
        identity.put(shared, 2);                  // same reference: replaces
        identity.put(new String("a"), 3);         // equal text, different object: new key
        System.out.println("Q19 IdentityHashMap size " + identity.size());

        // Q20: WeakHashMap drops an entry whose key is unreachable.
        Map<Session, String> cache = new WeakHashMap<>();
        Session alive = new Session("alive");
        cache.put(alive, "kept");
        cache.put(new Session("temp"), "dropped");  // nobody else references this key
        for (int i = 0; i < 20 && cache.size() > 1; i++) { System.gc(); Thread.sleep(20); }
        System.out.println("Q20 WeakHashMap after GC keeps only reachable keys: " + cache.values());

        // Q21: EnumSet factories.
        EnumSet<Day> weekend = EnumSet.of(Day.SAT, Day.SUN);
        System.out.println("Q21 weekdays = complementOf(weekend) " + EnumSet.complementOf(weekend)
                + ", range(TUE, THU) " + EnumSet.range(Day.TUE, Day.THU));

        // Q22: EnumMap keeps declaration order regardless of insertion order.
        EnumMap<Day, Integer> hours = new EnumMap<>(Day.class);
        hours.put(Day.FRI, 6); hours.put(Day.MON, 8); hours.put(Day.WED, 7);
        System.out.println("Q22 EnumMap " + hours);
    }
}`,
    walk:
      "Q13 finds an entry with a different but equal Employee. Q14 shows why arrays are poor keys: a new array with the same contents is not found, while `List.of(1, 2)` is, because List has value-based equals. Q16 asks a TreeSet for the neighbours of 12. Q18 takes a range view of a TreeMap.\n\nQ19 puts the same String reference twice (one key) and an equal copy once (a second key), so the IdentityHashMap holds two entries. In Q20 the WeakHashMap holds two Session keys, but only `alive` is still referenced by a local variable. After a GC the other key is cleared, and the map drops its entry. The loop retries a few times because a GC is only a request. Q21 builds the weekdays as the complement of the weekend, and Q22 shows that EnumMap iterates in declaration order.",
    anim: [
      "How WeakHashMap forgets a key",
      [
        ["code", "your code", "holds 'alive'"],
        ["map", "WeakHashMap", "weak keys"],
        ["gc", "GC", "reachability"],
        ["rq", "ReferenceQueue", "cleared refs"],
      ],
      [
        ["code", "map", "put x2", "Two Session keys are added, but only one is still referenced by your code."],
        ["gc", "map", "scan", "The GC finds the 'temp' key reachable only through a WeakReference."],
        ["gc", "rq", "enqueue", "It clears that weak reference and puts it on the map's ReferenceQueue."],
        ["map", "rq", "expunge", "On the next size() or get(), the map polls the queue and removes the stale entry."],
        ["map", "code", "values()", "Only the entry whose key is strongly reachable remains: [kept]."],
      ],
    ],
    varies: true,
    mistakes: [
      "Using mutable objects or arrays as HashMap keys.",
      "Putting String literals as WeakHashMap keys and expecting them to disappear. Pooled literals stay reachable.",
      "Writing a TreeSet comparator that returns 0 for different objects, which silently drops elements.",
    ],
    qa: [
      [
        "Why is EnumSet faster than HashSet<Enum>?",
        "It stores one bit per constant in a long. Add, contains and remove are single bit operations with no hashing, no boxing and no node objects.",
      ],
      [
        "Can a WeakHashMap value keep its key alive?",
        "Yes, if the value strongly references the key. The key is then always reachable and is never collected, which is a classic leak.",
      ],
      [
        "Why use EnumMap over a HashMap with enum keys?",
        "It is an array indexed by ordinal: faster, smaller and ordered by declaration. It also refuses keys of other types at runtime.",
      ],
    ],
    ex: [
      "You need to count orders per status (an enum with 5 constants) and print the counts in the enum's order. Which map do you use, and how do you increment a count in one line?",
      "Use `EnumMap<Status, Integer> counts = new EnumMap<>(Status.class);` and increment with `counts.merge(status, 1, Integer::sum);`. Iteration follows the declaration order of Status automatically.",
    ],
  }),

  lesson("Collections Q23-Q28: Writing Custom HashMap, LinkedHashMap, ArrayList, HashSet and LinkedHashSet", {
    intro:
      "Questions 23 to 28 ask you to build collections yourself. You will write:\n\n- a custom HashMap\n- a custom LinkedHashMap that remembers insertion order\n- a custom ArrayList with a growing array\n- a custom HashSet on top of the map\n- a custom LinkedHashSet\n\nThe lesson ends with fail-fast vs fail-safe iterators. All five structures are in one complete, commented program, and the custom ArrayList has its own fail-fast iterator.",
    topics: [
      [
        "Q23. How do you write a custom HashMap?",
        "Use an array of buckets, where each bucket is a chain of `Node(key, value, next)`.\n\n- `index = (hash & 0x7fffffff) % capacity`.\n- `put`: walk the chain, replacing the value on an `equals` match, otherwise add a node.\n- `get`: walk the same chain.\n- `remove`: unlink the node.\n- Grow when `size > capacity * loadFactor` by doubling the capacity and re-inserting every node, because indexes depend on the capacity.\n- Handle a null key with `Objects.equals` and a fixed bucket.\n\nThe program's `MyLinkedHashMap` starts from exactly this design.",
      ],
      [
        "Q24. How do you write a custom LinkedHashMap?",
        "Extend the custom HashMap's node with `before` and `after` pointers, and keep `head` and `tail` references. A **new** key is linked at the tail. Updating an existing key keeps its position. Removing unlinks the node from both the bucket chain and the doubly linked order list. Iteration follows `head → after → ...` instead of the buckets, so insertion order is preserved at O(1) cost. For access order, also move the node to the tail on every `get`.",
      ],
      [
        "Q25. How do you write a custom ArrayList?",
        "Keep an `Object[] elements` and an `int size`.\n\n- `add(e)`: if `size == elements.length`, grow with `Arrays.copyOf(elements, newCapacity)` (the JDK uses 1.5×), then store at `size++`.\n- `get(i)`: check `0 <= i < size` (throw IndexOutOfBoundsException) and cast.\n- `remove(i)`: shift the tail left with `System.arraycopy` and null out the last slot, so the GC can reclaim it.\n- Keep a `modCount` and give the iterator an `expectedModCount`, so it is fail-fast like the JDK's.",
      ],
      [
        "Q26. How do you write a custom HashSet?",
        "Reuse a map, as the JDK does. Inside, keep `MyHashMap<E, Object> map` and a shared dummy value `PRESENT = new Object()`.\n\n- `add(e)` returns `map.put(e, PRESENT) == null`, which is true if the element was new.\n- `contains(e)` is `map.containsKey(e)`.\n- `remove(e)` is `map.remove(e) == PRESENT`.\n- `size()` delegates to the map.\n\nUniqueness comes for free from the map's key handling.",
      ],
      [
        "Q27. How do you write a custom LinkedHashSet?",
        "Do the same as the custom HashSet, but on top of the custom LinkedHashMap. The set then iterates in insertion order, because the map's keys do. The JDK's LinkedHashSet is literally a HashSet whose package-private constructor creates a LinkedHashMap. Re-adding an existing element does not change its position.",
      ],
      [
        "Q28. What are fail-fast and fail-safe iterators?",
        "**Fail-fast** iterators (ArrayList, HashMap, HashSet, TreeMap) throw ConcurrentModificationException as soon as they detect, through `modCount`, that the collection was structurally modified other than through the iterator itself. **Fail-safe** iterators work on a snapshot (CopyOnWriteArrayList, CopyOnWriteArraySet) or are weakly consistent (ConcurrentHashMap, the ConcurrentSkipList collections). They never throw CME and may or may not reflect concurrent changes. Fail-fast is a debugging aid, not a thread-safety mechanism.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {

    // Q25: a growable array list with a fail-fast iterator.
    static class MyArrayList<E> implements Iterable<E> {
        private Object[] elements = new Object[2];
        private int size;
        private int modCount;                                     // structural changes

        void add(E e) {
            if (size == elements.length)
                elements = Arrays.copyOf(elements, elements.length + (elements.length >> 1) + 1); // ~1.5x
            elements[size++] = e;
            modCount++;
        }
        @SuppressWarnings("unchecked") E get(int i) {
            if (i < 0 || i >= size) throw new IndexOutOfBoundsException("Index " + i + ", size " + size);
            return (E) elements[i];
        }
        E remove(int i) {
            E old = get(i);
            System.arraycopy(elements, i + 1, elements, i, size - i - 1); // shift left
            elements[--size] = null;                              // let GC reclaim it
            modCount++;
            return old;
        }
        int size() { return size; }
        int capacity() { return elements.length; }

        public Iterator<E> iterator() {
            return new Iterator<>() {
                int cursor;
                final int expectedModCount = modCount;            // snapshot of the counter
                public boolean hasNext() { return cursor < size; }
                public E next() {
                    if (modCount != expectedModCount) throw new ConcurrentModificationException();
                    return get(cursor++);
                }
            };
        }
    }

    // Q23 + Q24: a hash map whose nodes are also linked in insertion order.
    static class MyLinkedHashMap<K, V> {
        static class Node<K, V> {
            final K key; V value; Node<K, V> next;                 // bucket chain
            Node<K, V> before, after;                              // insertion order
            Node(K key, V value) { this.key = key; this.value = value; }
        }
        private Node<K, V>[] table = newTable(4);
        private Node<K, V> head, tail;
        private int size;

        @SuppressWarnings("unchecked") static <K, V> Node<K, V>[] newTable(int n) { return (Node<K, V>[]) new Node[n]; }
        private int index(Object key, int length) { return key == null ? 0 : (key.hashCode() & 0x7fffffff) % length; }

        V put(K key, V value) {
            int i = index(key, table.length);
            for (Node<K, V> n = table[i]; n != null; n = n.next)
                if (Objects.equals(n.key, key)) { V old = n.value; n.value = value; return old; } // keep position
            Node<K, V> node = new Node<>(key, value);
            node.next = table[i]; table[i] = node;                 // add to bucket
            if (tail == null) head = node; else { tail.after = node; node.before = tail; }
            tail = node;                                           // add to order list
            if (++size > table.length * 3 / 4) resize();
            return null;
        }
        V get(Object key) {
            for (Node<K, V> n = table[index(key, table.length)]; n != null; n = n.next)
                if (Objects.equals(n.key, key)) return n.value;
            return null;
        }
        boolean containsKey(Object key) {
            for (Node<K, V> n = table[index(key, table.length)]; n != null; n = n.next)
                if (Objects.equals(n.key, key)) return true;
            return false;
        }
        V remove(Object key) {
            int i = index(key, table.length);
            Node<K, V> prev = null;
            for (Node<K, V> n = table[i]; n != null; prev = n, n = n.next) {
                if (!Objects.equals(n.key, key)) continue;
                if (prev == null) table[i] = n.next; else prev.next = n.next;   // unlink from bucket
                if (n.before == null) head = n.after; else n.before.after = n.after; // unlink from order
                if (n.after == null) tail = n.before; else n.after.before = n.before;
                size--;
                return n.value;
            }
            return null;
        }
        private void resize() {                                    // rebuild buckets, order list untouched
            table = newTable(table.length * 2);
            for (Node<K, V> n = head; n != null; n = n.after) {
                int i = index(n.key, table.length);
                n.next = table[i]; table[i] = n;
            }
        }
        List<K> keys() { List<K> keys = new ArrayList<>(); for (Node<K, V> n = head; n != null; n = n.after) keys.add(n.key); return keys; }
        int size() { return size; }
    }

    // Q26 + Q27: a set is a map whose values are all one dummy object.
    static class MyLinkedHashSet<E> {
        private static final Object PRESENT = new Object();
        private final MyLinkedHashMap<E, Object> map = new MyLinkedHashMap<>();
        boolean add(E e) { return map.put(e, PRESENT) == null; }   // true only if new
        boolean contains(E e) { return map.containsKey(e); }
        boolean remove(E e) { return map.remove(e) == PRESENT; }
        List<E> toList() { return map.keys(); }
    }

    public static void main(String[] args) {
        // Q25
        MyArrayList<String> list = new MyArrayList<>();
        for (String s : List.of("a", "b", "c", "d", "e")) list.add(s);
        list.remove(1);
        StringBuilder all = new StringBuilder();
        for (String s : list) all.append(s);
        System.out.println("Q25 MyArrayList " + all + " size " + list.size() + " capacity " + list.capacity());
        try { list.get(9); } catch (IndexOutOfBoundsException e) { System.out.println("Q25 " + e.getMessage()); }

        // Q28: our iterator is fail-fast too.
        try {
            for (String s : list) if (s.equals("c")) list.add("z");
        } catch (ConcurrentModificationException e) {
            System.out.println("Q28 custom iterator detected modification -> ConcurrentModificationException");
        }

        // Q23 + Q24
        MyLinkedHashMap<String, Integer> map = new MyLinkedHashMap<>();
        for (String city : List.of("Pune", "Agra", "Goa", "Delhi", "Surat")) map.put(city, city.length());
        map.put("Agra", 99);                                      // update keeps position
        map.remove("Goa");
        System.out.println("Q24 MyLinkedHashMap keys in insertion order " + map.keys() + ", Agra=" + map.get("Agra")
                + ", size " + map.size());

        // Q26 + Q27
        MyLinkedHashSet<Integer> set = new MyLinkedHashSet<>();
        boolean first = set.add(30), again = set.add(30);
        set.add(10); set.add(20);
        System.out.println("Q27 MyLinkedHashSet " + set.toList() + ", add(30) first " + first + " then " + again
                + ", contains(20) " + set.contains(20) + ", remove(10) " + set.remove(10) + " -> " + set.toList());
    }
}`,
    walk:
      "`MyArrayList` starts with capacity 2 and grows by about 1.5× plus one (2, 4, 7) as five strings are added. `remove(1)` shifts c, d and e left and nulls the freed slot. A bad index throws a JDK-style IndexOutOfBoundsException. Its iterator copies `modCount` when created. Adding during the for-each loop changes `modCount`, so the next `next()` throws ConcurrentModificationException, just like ArrayList (Q25, Q28).\n\n`MyLinkedHashMap` keeps each node in two structures: its bucket chain and a doubly linked insertion list. Updating Agra keeps its position. Removing Goa unlinks it from both. Resizing rebuilds only the buckets (Q23, Q24). `MyLinkedHashSet` stores elements as keys with a shared dummy value, so the second `add(30)` returns false and the order is the order of first insertion (Q26, Q27).",
    anim: [
      "One node, two links in a LinkedHashMap",
      [
        ["put", "put(Delhi, 5)", "new key"],
        ["bucket", "bucket chain", "for lookup"],
        ["order", "order list", "head ... tail"],
        ["iter", "keys()", "follows order"],
      ],
      [
        ["put", "bucket", "hash -> index", "The key's hash picks a bucket and the node is pushed onto that chain."],
        ["put", "order", "link at tail", "The same node is linked after the current tail, recording insertion order."],
        ["bucket", "order", "update Agra", "Updating an existing key changes its value in place; its order slot stays."],
        ["order", "bucket", "remove Goa", "Remove unlinks the node from its bucket and from its before and after neighbours."],
        ["order", "iter", "walk head->tail", "Iteration follows the order list, not the buckets: Pune, Agra, Delhi, Surat."],
      ],
    ],
    mistakes: [
      "Rebuilding the order list during resize in a custom LinkedHashMap. Only the bucket links depend on the capacity.",
      "Forgetting to null out the freed slot in a custom ArrayList's remove. This causes a memory leak.",
      "Not unlinking both directions of the order list on remove. Iteration then visits deleted nodes.",
    ],
    qa: [
      [
        "Why does the JDK's HashSet use a dummy PRESENT object instead of null as the value?",
        "`map.put` returns the previous value. With a non-null dummy, a null return means \"newly added\", and `remove` can return true only when the dummy came back.",
      ],
      [
        "How would you add access order to the custom LinkedHashMap?",
        "In `get`, after finding the node, unlink it from its current position in the order list and relink it at the tail. Evicting from the head then evicts the least recently used entry.",
      ],
      [
        "Does a fail-fast iterator detect a `set(i, value)` call?",
        "No. Replacing an element is not a structural change, so modCount does not change and the iterator keeps going.",
      ],
    ],
    ex: [
      "Add a `removeEldest()` method and a `maxSize` constructor argument to MyLinkedHashMap so that `put` evicts the oldest entry when the size exceeds maxSize.",
      "`removeEldest()` calls `remove(head.key)` when head is not null. At the end of `put`, after inserting a new node, add `if (size > maxSize) removeEldest();`. Because head is always the oldest inserted node, this makes a FIFO cache, and with access ordering it becomes an LRU cache.",
    ],
  }),
];
