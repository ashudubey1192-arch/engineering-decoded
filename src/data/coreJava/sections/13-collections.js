import { lesson, section } from "../schema.js";

export default section("collections", "Collection Framework", [
  lesson("Collection Framework Overview: List, Set and Map Properties", {
    intro:
      "The Java Collections Framework is a unified set of interfaces and implementations for storing groups of objects: lists, sets, queues and maps, plus algorithms in `Collections` and `Arrays`. Choosing the right collection depends on three properties: ordering, duplicates and null handling. This lesson introduces the framework and compares Collection, List, Set and Map side by side.",
    topics: [
      [
        "What the framework provides",
        "Interfaces that define behaviour (`Collection`, `List`, `Set`, `Queue`, `Deque`, `Map`, `SortedSet`, `SortedMap`), implementations (`ArrayList`, `LinkedList`, `HashSet`, `TreeSet`, `HashMap`, `TreeMap`, `ArrayDeque`, `PriorityQueue`) and algorithms (`Collections.sort`, `binarySearch`, `shuffle`, `unmodifiableList`). Before Java 1.2 there were only `Vector`, `Hashtable` and arrays.",
      ],
      [
        "Collection",
        "The root interface for groups of elements (Map is separate). It defines `add`, `remove`, `contains`, `size`, `isEmpty`, `iterator`, `stream`, `removeIf` and bulk operations such as `addAll` and `retainAll`.",
      ],
      [
        "List",
        "An ordered sequence with index access (`get(i)`, `set(i, e)`, `add(i, e)`). Allows duplicates and (in most implementations) nulls. Insertion order is preserved. Implementations: `ArrayList`, `LinkedList`, `Vector`, `CopyOnWriteArrayList`.",
      ],
      [
        "Set",
        "A collection with no duplicates, decided by `equals`/`hashCode` (hash sets) or `compareTo`/a comparator (sorted sets). Order: none (`HashSet`), insertion (`LinkedHashSet`) or sorted (`TreeSet`). `HashSet` allows one null; `TreeSet` does not allow null with natural ordering.",
      ],
      [
        "Map",
        "Key-value pairs with unique keys; values may repeat. Not a `Collection`, but offers `keySet()`, `values()` and `entrySet()` views. Order: none (`HashMap`), insertion or access (`LinkedHashMap`), sorted (`TreeMap`). `HashMap` allows one null key and many null values; `TreeMap` and `Hashtable` do not allow null keys.",
      ],
      [
        "Properties at a glance",
        "List: ordered by index, duplicates yes, nulls yes. Set: no duplicates, order depends on the implementation, at most one null (none for TreeSet). Map: unique keys, order depends on the implementation, null keys only in HashMap and LinkedHashMap. Queue/Deque: ordered for processing (FIFO, LIFO or priority); `ArrayDeque` forbids nulls.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("banana", "apple", "banana"));
        list.add(null);
        System.out.println("List keeps order and duplicates: " + list + ", get(1) = " + list.get(1));

        Set<String> hashSet = new HashSet<>(list);
        Set<String> linkedSet = new LinkedHashSet<>(list);
        Set<String> treeSet = new TreeSet<>(List.of("banana", "apple", "cherry"));
        System.out.println("HashSet removes duplicates: size " + hashSet.size() + ", contains null: " + hashSet.contains(null));
        System.out.println("LinkedHashSet keeps insertion order: " + linkedSet);
        System.out.println("TreeSet is sorted: " + treeSet);
        try {
            treeSet.add(null);
        } catch (NullPointerException e) {
            System.out.println("TreeSet rejects null");
        }

        Map<String, Integer> stock = new HashMap<>();
        stock.put("pen", 10);
        stock.put("pen", 12);                      // same key replaces value
        stock.put(null, 0);                        // one null key allowed
        stock.put("ink", 12);                      // duplicate value fine
        System.out.println("HashMap unique keys: size " + stock.size() + ", pen = " + stock.get("pen"));
        System.out.println("TreeMap sorted by key: " + new TreeMap<>(Map.of("z", 1, "a", 2, "m", 3)));

        Deque<String> stack = new ArrayDeque<>();
        stack.push("first"); stack.push("second");
        Queue<String> queue = new LinkedList<>(List.of("first", "second"));
        System.out.println("Deque as stack pops " + stack.pop() + ", Queue polls " + queue.poll());

        System.out.println("Map is not a Collection: " + !Collection.class.isAssignableFrom(Map.class));
    }
}`,
    walk:
      "The list keeps insertion order, duplicates and even null. Copying it into a `HashSet` removes the duplicate \"banana\" (size 3 including null), a `LinkedHashSet` keeps the first-seen order, and a `TreeSet` sorts its elements and rejects null.\n\nThe `HashMap` replaces the value when the same key is put twice, accepts one null key and allows duplicate values. A `TreeMap` sorts by key. An `ArrayDeque` used as a stack returns the last element pushed, while a queue returns the first element added. Finally the program confirms `Map` is not a subtype of `Collection`.",
    anim: [
      "Choosing a collection",
      [
        ["need", "What you need", "question"],
        ["list", "List", "order + index"],
        ["set", "Set", "no duplicates"],
        ["map", "Map", "key -> value"],
        ["queue", "Queue/Deque", "process in order"],
      ],
      [
        ["need", "list", "sequence", "Need positions and duplicates? Use a List such as ArrayList."],
        ["need", "set", "uniqueness", "Need each element once? Use a Set: Hash, Linked or Tree depending on order."],
        ["need", "map", "lookup", "Need to find values by key? Use a Map such as HashMap or TreeMap."],
        ["need", "queue", "processing", "Need FIFO, LIFO or priority processing? Use ArrayDeque or PriorityQueue."],
      ],
    ],
    mistakes: [
      "Using a List and calling `contains` repeatedly for uniqueness checks (O(n) each); use a Set.",
      "Assuming HashSet or HashMap iteration order is stable or meaningful.",
    ],
    qa: [
      ["What is the Collection Framework?", "A unified architecture of interfaces, implementations and algorithms for storing and manipulating groups of objects."],
      ["Is Map part of the Collection interface hierarchy?", "No. Map is a separate root interface, though it is part of the framework and offers collection views."],
      ["What are the main differences between List, Set and Map?", "List is ordered and allows duplicates; Set forbids duplicates; Map stores key-value pairs with unique keys."],
    ],
    ex: [
      "You need to store user ids and quickly check whether an id has been seen, in the order ids arrived. Which collection?",
      "A `LinkedHashSet<Integer>`: O(1) `contains`, no duplicates, and iteration in arrival order.",
    ],
  }),

  lesson("Collection Hierarchy: List, Set and Map in Detail", {
    intro:
      "The framework's interfaces form a hierarchy, and every implementation sits at a specific place in it. Knowing the hierarchy tells you which methods a class has and which types you can use for variables and parameters. This lesson walks through the List, Set, Queue and Map hierarchies with their main implementations.",
    topics: [
      [
        "Iterable and Collection",
        "`Iterable` (in `java.lang`) is the top: anything with an `iterator()` can be used in a for-each loop. `Collection` extends it. Since Java 21, `SequencedCollection` sits between `Collection` and `List`, `Deque` and `LinkedHashSet`, adding `getFirst()`, `getLast()`, `addFirst()` and `reversed()`.",
      ],
      [
        "List hierarchy",
        "`List` extends `Collection` (and `SequencedCollection`). `AbstractList` provides a skeleton. Implementations: `ArrayList` (resizable array), `LinkedList` (doubly linked list, also a `Deque`), `Vector` (synchronized array) and its subclass `Stack`, and `CopyOnWriteArrayList` (concurrent).",
      ],
      [
        "Set hierarchy",
        "`Set` extends `Collection`. `SortedSet` and `NavigableSet` add ordering methods (`first`, `headSet`, `ceiling`). Implementations: `HashSet`, its subclass `LinkedHashSet`, `TreeSet` (a `NavigableSet`), `EnumSet`, `CopyOnWriteArraySet` and `ConcurrentSkipListSet`.",
      ],
      [
        "Queue hierarchy",
        "`Queue` extends `Collection`; `Deque` extends `Queue`; `BlockingQueue` and `BlockingDeque` add waiting operations. Implementations: `PriorityQueue`, `ArrayDeque`, `LinkedList`, `ArrayBlockingQueue`, `LinkedBlockingQueue`, `PriorityBlockingQueue`, `DelayQueue`, `ConcurrentLinkedQueue`.",
      ],
      [
        "Map hierarchy",
        "`Map` is its own root. `SortedMap` and `NavigableMap` add ordering; `ConcurrentMap` adds atomic operations. Implementations: `HashMap`, its subclass `LinkedHashMap`, `TreeMap`, `Hashtable` (legacy) and its subclass `Properties`, `IdentityHashMap`, `WeakHashMap`, `EnumMap`, `ConcurrentHashMap` and `ConcurrentSkipListMap`.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    static String interfaces(Class<?> c) {
        Set<String> all = new TreeSet<>();
        Deque<Class<?>> todo = new ArrayDeque<>();
        for (Class<?> k = c; k != null; k = k.getSuperclass()) todo.addAll(List.of(k.getInterfaces()));
        while (!todo.isEmpty()) {
            Class<?> i = todo.pop();
            if (all.add(i.getSimpleName())) todo.addAll(List.of(i.getInterfaces()));
        }
        all.removeAll(Set.of("Serializable", "Cloneable", "RandomAccess"));
        return String.join(", ", all);
    }

    static String parents(Class<?> c) {
        StringBuilder sb = new StringBuilder(c.getSimpleName());
        for (Class<?> k = c.getSuperclass(); k != null && k != Object.class; k = k.getSuperclass()) sb.append(" < ").append(k.getSimpleName());
        return sb.toString();
    }

    public static void main(String[] args) {
        Class<?>[] types = {ArrayList.class, LinkedList.class, Stack.class, HashSet.class, LinkedHashSet.class,
                TreeSet.class, PriorityQueue.class, ArrayDeque.class, HashMap.class, LinkedHashMap.class,
                TreeMap.class, Properties.class, ConcurrentHashMap.class};
        for (Class<?> t : types) {
            System.out.println(parents(t));
            System.out.println("    implements: " + interfaces(t));
        }
    }
}`,
    walk:
      "`parents` prints each class's superclass chain (excluding `Object`), and `interfaces` collects every interface it implements directly or indirectly, ignoring marker interfaces. Together they draw the hierarchy from real classes.\n\nYou can read off facts such as: `LinkedList` is both a `List` and a `Deque`; `Stack` extends `Vector`; `LinkedHashSet` extends `HashSet` and is a `SequencedSet`; `TreeSet` is a `NavigableSet`; `Properties` extends `Hashtable`; and `ConcurrentHashMap` implements `ConcurrentMap`.",
    anim: [
      "The interface tree",
      [
        ["iter", "Iterable", "for-each"],
        ["coll", "Collection", "add, remove"],
        ["list", "List", "ArrayList ..."],
        ["set", "Set", "HashSet ..."],
        ["queue", "Queue/Deque", "ArrayDeque ..."],
        ["map", "Map", "separate root"],
      ],
      [
        ["iter", "coll", "extends", "Collection extends Iterable, so every collection works in a for-each loop."],
        ["coll", "list", "extends", "List adds indexed, ordered access."],
        ["coll", "set", "extends", "Set adds the no-duplicates rule; SortedSet and NavigableSet add ordering."],
        ["coll", "queue", "extends", "Queue and Deque add head/tail processing operations."],
        ["map", "coll", "views", "Map is not a Collection, but keySet, values and entrySet are collection views."],
      ],
    ],
    mistakes: [
      "Declaring variables with implementation types (`ArrayList<String> list`) instead of interfaces (`List<String>`).",
      "Using the legacy `Stack` class; prefer `ArrayDeque` for stacks.",
    ],
    qa: [
      ["What is the root interface of the Collection hierarchy?", "Iterable, then Collection; Map is a separate root."],
      ["Which classes implement both List and Deque?", "LinkedList."],
      ["What does SequencedCollection add?", "Java 21 methods for ordered collections: getFirst, getLast, addFirst, addLast, removeFirst, removeLast and reversed."],
    ],
    ex: [
      "Using the program, find which interfaces `TreeMap` implements. Which one gives it `floorKey` and `ceilingKey`?",
      "Map, SortedMap, NavigableMap and SequencedMap. `floorKey` and `ceilingKey` come from NavigableMap.",
    ],
  }),

  lesson("ArrayList and a Custom ArrayList Implementation", {
    intro:
      "`ArrayList` is the most used collection in Java: a resizable array with fast random access. Understanding how it stores elements and grows explains its performance. This lesson covers ArrayList's API and complexity, its default capacity and resize rule, and builds a custom ArrayList with add, get, remove and growth.",
    topics: [
      [
        "How ArrayList stores elements",
        "Internally it holds an `Object[] elementData` and a `size`. `get(i)` and `set(i, e)` are O(1). `add(e)` at the end is amortised O(1). Inserting or removing in the middle shifts later elements with `System.arraycopy`, which is O(n).",
      ],
      [
        "Default capacity and resizing",
        "`new ArrayList<>()` starts with an empty shared array; the first `add` allocates capacity 10. When full, it grows to `oldCapacity + oldCapacity / 2` (1.5x): 10, 15, 22, 33, 49. You can pre-size with `new ArrayList<>(1000)` or `ensureCapacity`, and shrink with `trimToSize()`. Vector, by contrast, doubles its capacity.",
      ],
      [
        "Important behaviours",
        "Allows duplicates and null. Not synchronized. Its iterators are fail-fast. `remove(int index)` removes by position while `remove(Object o)` removes the first equal element. `subList` returns a view, not a copy.",
      ],
      [
        "Custom ArrayList",
        "A minimal version needs an array, a size counter, a `grow` method that copies into a bigger array, bounds checks, and shifting on removal. Clearing the vacated slot after removal (`elements[--size] = null`) avoids holding references that would prevent garbage collection.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
    static class MyArrayList<E> {
        private Object[] elements = new Object[0];
        private int size;

        void add(E e) {
            if (size == elements.length) grow();
            elements[size++] = e;
        }

        void add(int index, E e) {
            if (index < 0 || index > size) throw new IndexOutOfBoundsException("Index " + index + ", size " + size);
            if (size == elements.length) grow();
            System.arraycopy(elements, index, elements, index + 1, size - index);   // shift right
            elements[index] = e;
            size++;
        }

        @SuppressWarnings("unchecked")
        E get(int index) {
            if (index < 0 || index >= size) throw new IndexOutOfBoundsException("Index " + index + ", size " + size);
            return (E) elements[index];
        }

        E remove(int index) {
            E old = get(index);
            System.arraycopy(elements, index + 1, elements, index, size - index - 1); // shift left
            elements[--size] = null;                                                   // help GC
            return old;
        }

        private void grow() {
            int newCapacity = elements.length == 0 ? 10 : elements.length + (elements.length >> 1);
            System.out.println("    grow: " + elements.length + " -> " + newCapacity);
            elements = Arrays.copyOf(elements, newCapacity);
        }

        int size() { return size; }
        int capacity() { return elements.length; }
        public String toString() { return Arrays.toString(Arrays.copyOf(elements, size)); }
    }

    public static void main(String[] args) {
        MyArrayList<Integer> list = new MyArrayList<>();
        System.out.println("adding 1..23:");
        for (int i = 1; i <= 23; i++) list.add(i);
        System.out.println("size " + list.size() + ", capacity " + list.capacity());

        list.add(0, 100);
        System.out.println("after add(0, 100): first = " + list.get(0) + ", second = " + list.get(1));
        System.out.println("remove(0) returned " + list.remove(0) + ", size " + list.size());
        try {
            list.get(99);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("bounds check: " + e.getMessage());
        }

        List<String> jdk = new ArrayList<>(List.of("a", "b", "c", "b"));
        jdk.remove("b");                  // first equal element
        jdk.remove(0);                    // by index
        System.out.println("JDK ArrayList after remove(\"b\") and remove(0): " + jdk);
        List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30));
        numbers.remove(Integer.valueOf(10));
        System.out.println("remove(Integer.valueOf(10)): " + numbers);
    }
}`,
    walk:
      "Adding 23 elements to the custom list shows the growth sequence: 0 to 10 on the first add, then 15, 22 and 33, each time copying the array with `Arrays.copyOf`. That is the same 1.5x rule the JDK uses.\n\n`add(0, 100)` shifts every element one place to the right with `System.arraycopy`, and `remove(0)` shifts them back and nulls the freed slot. The bounds check reproduces `IndexOutOfBoundsException`. The JDK part shows the classic difference between `remove(Object)` and `remove(int)`.",
    anim: [
      "ArrayList growth",
      [
        ["full", "capacity 10", "size 10"],
        ["add", "add(11th)", "no room"],
        ["new", "new array", "capacity 15"],
        ["copy", "arraycopy", "10 elements"],
        ["done", "store element", "size 11"],
      ],
      [
        ["full", "add", "check", "The backing array is full: size equals capacity."],
        ["add", "new", "grow", "grow() allocates a new array 1.5 times larger: 10 + 10 / 2 = 15."],
        ["new", "copy", "copy", "Existing elements are copied into the new array; the old one becomes garbage."],
        ["copy", "done", "add", "The new element is stored at index 10; later adds are cheap until it fills again."],
      ],
    ],
    mistakes: [
      "Calling `list.remove(i)` on a `List<Integer>` when you meant to remove the value i.",
      "Inserting at the front of a large ArrayList in a loop (O(n) each time).",
      "Modifying a list while iterating with for-each (ConcurrentModificationException).",
    ],
    qa: [
      ["What is the default capacity of ArrayList?", "10, allocated lazily on the first add (an empty array before that)."],
      ["How does ArrayList grow?", "To 1.5 times its current capacity (old + old >> 1), copying elements into the new array."],
      ["What is the time complexity of ArrayList operations?", "get/set O(1); add at end amortised O(1); add/remove in the middle O(n); contains O(n)."],
    ],
    ex: [
      "How many times does an ArrayList created with `new ArrayList<>()` grow while 100 elements are added?",
      "Capacities 10, 15, 22, 33, 49, 73, 109: the array is allocated at 10 and then grows 6 times (to 15, 22, 33, 49, 73 and 109) to hold 100 elements.",
    ],
  }),

  lesson("LinkedList", {
    intro:
      "`LinkedList` stores elements in a doubly linked list of nodes. It implements both `List` and `Deque`, so it can be used as a list, a queue, a stack or a double-ended queue. This lesson explains its structure, the cost of each operation, its List and Deque methods, and when it is actually the right choice.",
    topics: [
      [
        "Structure",
        "Each element is wrapped in a `Node` with `item`, `prev` and `next` references; the list keeps `first`, `last` and `size`. There is no backing array and no capacity. Each node costs extra memory (object header plus two references), so a LinkedList uses several times more memory than an ArrayList.",
      ],
      [
        "Performance",
        "Adding or removing at either end is O(1). `get(i)` and `set(i, e)` are O(n): the list walks from the nearer end. Inserting or removing in the middle is O(1) once you are at the position (for example through a `ListIterator`), but finding the position is O(n). Iteration is slower than ArrayList because nodes are scattered in memory (poor CPU cache locality).",
      ],
      [
        "List and Deque methods",
        "As a List: `add`, `get`, `remove(index)`, `listIterator`. As a Deque: `addFirst`/`offerFirst`, `addLast`/`offerLast`, `pollFirst`, `pollLast`, `peekFirst`, `peekLast`, `push`/`pop` (stack) and `offer`/`poll` (queue). It allows null elements, unlike `ArrayDeque`.",
      ],
      [
        "When to use it",
        "Rarely. For queues and stacks `ArrayDeque` is faster; for lists `ArrayList` is faster for almost all workloads. LinkedList fits when you insert and remove many elements in the middle while already iterating with a `ListIterator`, or when you need a List and a Deque in one object.",
      ],
    ],
    code: String.raw`import java.util.LinkedList;
import java.util.ListIterator;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<>();
        list.add("B");
        list.addFirst("A");          // O(1) at the head
        list.addLast("D");           // O(1) at the tail
        list.add(2, "C");            // walks to index 2, then links a node
        System.out.println("list: " + list + ", first " + list.getFirst() + ", last " + list.getLast());

        ListIterator<String> it = list.listIterator();
        while (it.hasNext()) {
            String value = it.next();
            if (value.equals("B")) it.add("B2");          // O(1) insertion at the cursor
            if (value.equals("C")) it.remove();            // O(1) removal at the cursor
        }
        System.out.println("after iterator edits: " + list);

        LinkedList<Integer> queue = new LinkedList<>();
        queue.offer(1); queue.offer(2); queue.offer(3);
        System.out.println("queue poll: " + queue.poll() + ", peek: " + queue.peek());

        LinkedList<Integer> stack = new LinkedList<>();
        stack.push(1); stack.push(2); stack.push(3);
        System.out.println("stack pop: " + stack.pop() + ", then " + stack.pop());

        list.add(null);
        System.out.println("allows null: " + list + ", descending: " + list.reversed());

        LinkedList<Integer> big = new LinkedList<>();
        for (int i = 0; i < 50_000; i++) big.add(i);
        long start = System.nanoTime();
        long sum = 0;
        for (int i = 0; i < big.size(); i += 1000) sum += big.get(i);       // each get walks the list
        long indexed = System.nanoTime() - start;
        start = System.nanoTime();
        long sum2 = 0;
        int pos = 0;
        for (int v : big) { if (pos++ % 1000 == 0) sum2 += v; }             // one pass
        long iterated = System.nanoTime() - start;
        System.out.println("same sums: " + (sum == sum2) + " (get(i) is O(n) per call; iterate instead)");
    }
}`,
    walk:
      "`addFirst` and `addLast` are constant-time because they only relink the head or tail nodes; `add(2, \"C\")` first walks to index 2. The `ListIterator` inserts \"B2\" after \"B\" and removes \"C\" at the cursor without any shifting.\n\nThe same class works as a FIFO queue (`offer`/`poll`) and a LIFO stack (`push`/`pop`), allows null, and supports `reversed()` (Java 21). The final part contrasts calling `get(i)` repeatedly, which walks the list from the start each time, with a single iteration.",
    anim: [
      "Inserting into a doubly linked list",
      [
        ["a", "Node A", "prev | next"],
        ["b", "Node B", "prev | next"],
        ["new", "Node B2", "new"],
        ["c", "Node C", "prev | next"],
        ["head", "first / last", "list refs"],
      ],
      [
        ["head", "a", "first", "The list keeps references to its first and last nodes."],
        ["a", "b", "next", "Each node links to the next and previous nodes; there is no array."],
        ["b", "new", "relink", "Inserting B2 after B only rewires B.next, C.prev and B2's two links."],
        ["new", "c", "next", "No elements are shifted, so insertion at a known node is O(1)."],
      ],
    ],
    mistakes: [
      "Using `get(i)` in a loop over a LinkedList, which is O(n squared).",
      "Choosing LinkedList \"because inserts are O(1)\" without accounting for the O(n) search to reach the position.",
    ],
    qa: [
      ["How is LinkedList implemented?", "As a doubly linked list of nodes with references to the first and last node."],
      ["What is the complexity of get(i) in LinkedList?", "O(n); it traverses from the closer end."],
      ["Which interfaces does LinkedList implement?", "List, Deque (and therefore Queue), SequencedCollection, Cloneable and Serializable."],
    ],
    ex: [
      "Remove every even number from a `LinkedList<Integer>` of 1..10 in a single O(n) pass.",
      "Use an iterator: `Iterator<Integer> it = list.iterator(); while (it.hasNext()) if (it.next() % 2 == 0) it.remove();` or simply `list.removeIf(n -> n % 2 == 0);`. The list becomes [1, 3, 5, 7, 9].",
    ],
  }),

  lesson("ArrayList vs LinkedList vs Vector and List vs Set", {
    intro:
      "Three classic comparison questions: ArrayList versus LinkedList, ArrayList versus Vector, and List versus Set. This lesson answers them, including how ArrayList and Vector grow their capacity and what Vector's synchronization means in multithreaded code.",
    topics: [
      [
        "ArrayList vs LinkedList",
        "Structure: resizable array vs doubly linked nodes. Random access: O(1) vs O(n). Add at end: amortised O(1) for both. Add/remove at the front: O(n) vs O(1). Memory: compact vs a node object per element. Interfaces: ArrayList implements `RandomAccess`; LinkedList implements `Deque`. Cache locality: excellent vs poor. In practice ArrayList wins for most workloads.",
      ],
      [
        "ArrayList vs Vector",
        "Both are resizable arrays. Vector (Java 1.0) synchronizes every method, so it is thread-safe for single calls but slower; ArrayList (Java 1.2) is unsynchronized. Growth: ArrayList grows by 50%, Vector doubles (or grows by `capacityIncrement` if set). Both default to capacity 10. Vector also has legacy methods (`addElement`, `elements()` returning an `Enumeration`). Vector is considered legacy.",
      ],
      [
        "Vector in multithreading",
        "Advantage: individual operations such as `add` are atomic, so concurrent adds never corrupt the array the way they can with ArrayList. Limitation: compound actions (\"check then act\", such as `if (!v.contains(x)) v.add(x)`) are still not atomic without external synchronization, and every call pays for locking. Prefer `Collections.synchronizedList` or `CopyOnWriteArrayList`.",
      ],
      [
        "List vs Set",
        "List is ordered by index and allows duplicates and positional access; Set forbids duplicates and has no index. `contains` on a List is O(n), on a HashSet O(1). Use List for sequences (playlist, order lines), Set for uniqueness (tags, visited ids).",
      ],
    ],
    code: String.raw`import java.lang.reflect.Field;
import java.util.*;

public class Main {
    static int capacity(Object list) {
        try {
            Field f = list.getClass().getDeclaredField("elementData");
            f.setAccessible(true);
            return ((Object[]) f.get(list)).length;
        } catch (ReflectiveOperationException | RuntimeException e) {
            return -1;      // not accessible (module encapsulation)
        }
    }

    public static void main(String[] args) throws Exception {
        Vector<Integer> vector = new Vector<>();
        StringBuilder vectorGrowth = new StringBuilder("Vector capacity: ");
        int last = vector.capacity();
        vectorGrowth.append(last);
        for (int i = 0; i < 100; i++) {
            vector.add(i);
            if (vector.capacity() != last) { last = vector.capacity(); vectorGrowth.append(" -> ").append(last); }
        }
        System.out.println(vectorGrowth + " (doubles)");
        System.out.println("ArrayList grows by 50%: 10 -> 15 -> 22 -> 33 -> 49 -> 73 -> 109");

        List<Integer> unsafe = new ArrayList<>();
        List<Integer> safe = new Vector<>();
        Runnable task = () -> {
            for (int i = 0; i < 10_000; i++) {
                try { unsafe.add(i); } catch (ArrayIndexOutOfBoundsException ignored) { }
                safe.add(i);
            }
        };
        Thread t1 = new Thread(task), t2 = new Thread(task);
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("2 threads x 10000 adds: Vector size = " + safe.size()
                + ", ArrayList lost updates: " + (unsafe.size() < 20_000));

        List<String> list = new ArrayList<>(List.of("java", "java", "kotlin"));
        Set<String> set = new HashSet<>(list);
        System.out.println("List allows duplicates: " + list + ", Set removes them: " + new TreeSet<>(set));
        System.out.println("ArrayList is RandomAccess: " + (new ArrayList<>() instanceof RandomAccess)
                + ", LinkedList is RandomAccess: " + (new LinkedList<>() instanceof RandomAccess));
    }
}`,
    varies: true,
    walk:
      "A `Vector` reports its capacity directly; adding 100 elements shows it doubling: 10, 20, 40, 80, 160. ArrayList's 1.5x sequence is printed for comparison.\n\nTwo threads then add 10,000 numbers each to an ArrayList and a Vector at the same time. The Vector ends with exactly 20,000 elements because every `add` is synchronized; the ArrayList loses updates (and may even throw internally), because its size counter and array writes race. The last lines contrast List and Set and show the `RandomAccess` marker.",
    anim: [
      "Concurrent adds: ArrayList vs Vector",
      [
        ["t1", "Thread 1", "add(x)"],
        ["t2", "Thread 2", "add(y)"],
        ["al", "ArrayList", "size++ races"],
        ["v", "Vector", "synchronized"],
        ["res", "result", "lost vs exact"],
      ],
      [
        ["t1", "al", "add", "Both threads read the same size and write to the same slot in ArrayList."],
        ["t2", "al", "add", "One write overwrites the other: an element is lost and size is wrong."],
        ["t1", "v", "lock", "Vector's add is synchronized, so threads take turns."],
        ["v", "res", "exact", "Every add completes atomically: 20,000 elements, none lost."],
      ],
    ],
    mistakes: [
      "Choosing Vector for new code; use ArrayList plus explicit synchronization or a concurrent list.",
      "Believing a synchronized list makes check-then-act sequences safe.",
    ],
    qa: [
      ["What is the difference between ArrayList and LinkedList?", "ArrayList is array-backed with O(1) random access and cheap appends; LinkedList is node-based with O(1) end operations but O(n) access and more memory."],
      ["What is the difference between ArrayList and Vector?", "Vector is synchronized and doubles its capacity; ArrayList is unsynchronized, faster, and grows by 50%."],
      ["What is the difference between List and Set?", "List keeps order and allows duplicates with index access; Set does not allow duplicates and has no index."],
    ],
    ex: [
      "Why is `if (!vector.contains(x)) vector.add(x);` not thread-safe even though Vector is synchronized?",
      "Each call is atomic, but another thread can add x between `contains` and `add`. Wrap both in `synchronized (vector) { ... }` or use a concurrent Set.",
    ],
  }),

  lesson("HashSet, LinkedHashSet and TreeSet", {
    intro:
      "Java's three general-purpose Set implementations differ in ordering, performance and null handling. HashSet is fastest with no order, LinkedHashSet remembers insertion order, and TreeSet keeps elements sorted. This lesson explains how each works internally, compares them, and shows TreeSet's navigation methods.",
    topics: [
      [
        "HashSet",
        "Backed by a `HashMap` (elements are keys). O(1) average `add`, `remove` and `contains`. No ordering guarantee. Allows one null. Uniqueness via `hashCode` and `equals`.",
      ],
      [
        "LinkedHashSet",
        "Backed by a `LinkedHashMap`, so it adds a doubly linked list through the entries: iteration is in insertion order, and re-inserting an existing element does not change its position. Same O(1) operations with slightly more memory.",
      ],
      [
        "TreeSet",
        "Backed by a `TreeMap` (a red-black tree). Elements are sorted by natural order (`Comparable`) or a `Comparator`. Operations are O(log n). Uniqueness is decided by `compareTo` returning 0, not by `equals`. No null with natural ordering. Offers navigation: `first`, `last`, `floor`, `ceiling`, `lower`, `higher`, `headSet`, `tailSet`, `subSet`, `descendingSet`, `pollFirst`.",
      ],
      [
        "Comparison",
        "Order: none / insertion / sorted. Speed: O(1) / O(1) / O(log n). Null: one / one / none (natural ordering). Duplicates decided by: equals+hashCode / equals+hashCode / compareTo. Use HashSet by default, LinkedHashSet when order of arrival matters, TreeSet when you need sorting or range queries.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> input = List.of("pear", "apple", "fig", "banana", "apple", "cherry");

        Set<String> hash = new HashSet<>(input);
        Set<String> linked = new LinkedHashSet<>(input);
        TreeSet<String> tree = new TreeSet<>(input);
        System.out.println("HashSet       size " + hash.size() + " (order not guaranteed)");
        System.out.println("LinkedHashSet " + linked);
        System.out.println("TreeSet       " + tree);

        TreeSet<String> byLength = new TreeSet<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        byLength.addAll(input);
        System.out.println("TreeSet by length " + byLength);

        TreeSet<Integer> scores = new TreeSet<>(List.of(42, 7, 88, 65, 15, 99));
        System.out.println("first " + scores.first() + ", last " + scores.last()
                + ", floor(50) " + scores.floor(50) + ", ceiling(50) " + scores.ceiling(50)
                + ", higher(88) " + scores.higher(88));
        System.out.println("headSet(<50) " + scores.headSet(50) + ", tailSet(>=65) " + scores.tailSet(65)
                + ", subSet[15,88) " + scores.subSet(15, 88) + ", descending " + scores.descendingSet());

        TreeSet<String> caseInsensitive = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        caseInsensitive.addAll(List.of("Java", "JAVA", "java"));
        System.out.println("comparator decides duplicates: " + caseInsensitive + " (equals() would say 3 distinct)");

        hash.add(null);
        System.out.println("HashSet accepts null: " + hash.contains(null));
        try { tree.add(null); } catch (NullPointerException e) { System.out.println("TreeSet rejects null"); }
    }
}`,
    walk:
      "From six inputs with one duplicate, every set ends with five elements. The `LinkedHashSet` keeps arrival order and the `TreeSet` sorts alphabetically; the `HashSet` order depends on hash codes and should not be relied on.\n\nA `TreeSet` with a length-then-alphabetical comparator orders by word length. The navigation methods answer range questions on sorted scores: floor and ceiling around 50, head, tail and sub-sets, and a descending view. A case-insensitive comparator treats \"Java\", \"JAVA\" and \"java\" as one element, because TreeSet uses the comparator, not `equals`, for uniqueness.",
    anim: [
      "Same input, three sets",
      [
        ["in", "input", "pear apple fig..."],
        ["hash", "HashSet", "hash buckets"],
        ["linked", "LinkedHashSet", "insertion order"],
        ["tree", "TreeSet", "red-black tree"],
        ["out", "iteration", "order differs"],
      ],
      [
        ["in", "hash", "add", "HashSet places each element in a bucket by hash code: fast, no order."],
        ["in", "linked", "add", "LinkedHashSet also links elements in arrival order."],
        ["in", "tree", "add", "TreeSet inserts into a balanced tree by comparison: O(log n), sorted."],
        ["tree", "out", "iterate", "Iterating gives no order, arrival order, or sorted order respectively."],
      ],
    ],
    mistakes: [
      "Using a TreeSet with a comparator inconsistent with equals and being surprised by \"missing\" elements.",
      "Adding objects that do not implement Comparable to a TreeSet without a comparator (ClassCastException).",
    ],
    qa: [
      ["What is the difference between HashSet, LinkedHashSet and TreeSet?", "HashSet has no order and O(1) operations; LinkedHashSet keeps insertion order with O(1) operations; TreeSet keeps sorted order with O(log n) operations."],
      ["How does TreeSet decide duplicates?", "With compareTo or the comparator: elements comparing as 0 are duplicates."],
      ["Can TreeSet contain null?", "Not with natural ordering (NullPointerException); a comparator that handles null could allow it."],
    ],
    ex: [
      "Given scores 42, 7, 88, 65, 15, 99 in a TreeSet, find the smallest score strictly greater than 65 and all scores between 10 and 70 inclusive.",
      "`scores.higher(65)` returns 88; `scores.subSet(10, true, 70, true)` returns [15, 42, 65].",
    ],
  }),

  lesson("EnumSet and EnumMap", {
    intro:
      "When keys or elements are enum constants, `EnumSet` and `EnumMap` are the fastest and most compact collections available. They use the enum's ordinal positions instead of hashing. This lesson covers how they work internally, their factory methods, ordering and null rules, and typical uses.",
    topics: [
      [
        "EnumSet",
        "An abstract class with factory methods: `EnumSet.of(...)`, `noneOf(Day.class)`, `allOf(Day.class)`, `range(MON, FRI)`, `complementOf(set)` and `copyOf(...)`. Internally it is a bit vector: `RegularEnumSet` uses a single `long` for enums with up to 64 constants, and `JumboEnumSet` uses a `long[]` for larger enums. All operations are bit operations, so they are extremely fast.",
      ],
      [
        "EnumMap",
        "A Map whose keys are constants of one enum type, created with `new EnumMap<>(Day.class)`. It stores values in an array indexed by ordinal, so `get` and `put` are O(1) without hashing, and it uses little memory.",
      ],
      [
        "Ordering and nulls",
        "Both iterate in the order the enum constants are declared (ordinal order), regardless of insertion order. Neither allows null keys or elements (EnumMap allows null values). Both are not synchronized, and their iterators are weakly consistent (they never throw ConcurrentModificationException).",
      ],
      [
        "Typical uses",
        "EnumSet replaces bit flags (`EnumSet<Permission>` instead of `int` masks), for example days a shop is open or enabled features. EnumMap fits per-state or per-category data: counts per status, handlers per command, prices per tier.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }
    enum Permission { READ, WRITE, DELETE, ADMIN }
    enum Status { NEW, PAID, SHIPPED, DELIVERED }

    public static void main(String[] args) {
        EnumSet<Day> weekdays = EnumSet.range(Day.MON, Day.FRI);
        EnumSet<Day> weekend = EnumSet.complementOf(weekdays);
        EnumSet<Day> openDays = EnumSet.of(Day.SAT, Day.TUE, Day.THU);   // inserted out of order
        System.out.println("weekdays " + weekdays + ", weekend " + weekend);
        System.out.println("open days iterate in declaration order: " + openDays);
        System.out.println("all " + EnumSet.allOf(Day.class).size() + " days, none: " + EnumSet.noneOf(Day.class));

        EnumSet<Permission> user = EnumSet.of(Permission.READ, Permission.WRITE);
        System.out.println("user can delete: " + user.contains(Permission.DELETE));
        user.add(Permission.DELETE);
        System.out.println("after grant: " + user + ", implementation " + user.getClass().getSimpleName());

        List<Status> orders = List.of(Status.PAID, Status.NEW, Status.PAID, Status.SHIPPED, Status.PAID, Status.NEW);
        EnumMap<Status, Integer> counts = new EnumMap<>(Status.class);
        for (Status s : orders) counts.merge(s, 1, Integer::sum);
        System.out.println("counts per status: " + counts);

        EnumMap<Status, String> next = new EnumMap<>(Status.class);
        next.put(Status.SHIPPED, "deliver");
        next.put(Status.NEW, "collect payment");
        next.put(Status.PAID, "pack and ship");
        next.put(Status.DELIVERED, null);                 // null values allowed
        System.out.println("next actions: " + next);
        try {
            next.put(null, "x");
        } catch (NullPointerException e) {
            System.out.println("EnumMap rejects null keys");
        }
    }
}`,
    walk:
      "`EnumSet.range` builds the weekdays and `complementOf` derives the weekend. Even though `openDays` was created with SAT first, it iterates in declaration order (TUE, THU, SAT) because elements are bits ordered by ordinal. The permission set behaves like bit flags and its class is `RegularEnumSet`, the single-`long` version.\n\n`EnumMap.merge` counts orders per status, printed in declaration order. The second map stores the next action per status, accepts a null value, and rejects a null key.",
    anim: [
      "EnumSet as a bit vector",
      [
        ["enum", "enum Day", "7 constants"],
        ["bits", "long bits", "0b0101010"],
        ["add", "add(SAT)", "set bit 5"],
        ["contains", "contains(TUE)", "test bit 1"],
        ["iter", "iterate", "low to high bit"],
      ],
      [
        ["enum", "bits", "ordinal", "Each constant's ordinal (MON = 0 ... SUN = 6) is a bit position in one long."],
        ["add", "bits", "OR", "Adding SAT is a single bitwise OR with 1 << 5."],
        ["contains", "bits", "AND", "contains(TUE) is a single AND with 1 << 1: no hashing at all."],
        ["bits", "iter", "order", "Iteration goes from the lowest bit up, so order follows declaration order."],
      ],
    ],
    mistakes: [
      "Using HashSet or HashMap with enum keys, which is slower and uses more memory.",
      "Expecting EnumSet to keep insertion order.",
    ],
    qa: [
      ["How is EnumSet implemented?", "As a bit vector: RegularEnumSet uses one long for up to 64 constants, JumboEnumSet uses a long array for more."],
      ["What is the iteration order of EnumMap?", "The natural order of the enum keys, i.e. their declaration (ordinal) order."],
      ["Does EnumMap allow null?", "Null values yes, null keys no."],
    ],
    ex: [
      "Build an `EnumSet<Day>` of days on which a gym is closed (MON and SUN) and compute the open days.",
      "`EnumSet<Day> closed = EnumSet.of(Day.MON, Day.SUN); EnumSet<Day> open = EnumSet.complementOf(closed);` gives [TUE, WED, THU, FRI, SAT].",
    ],
  }),

  lesson("HashMap Internals", {
    intro:
      "`HashMap` is the most important data structure in everyday Java. Its average O(1) lookups come from hashing keys into buckets. This lesson explains its internal structure: the bucket array and hash spreading, how put and get work, collisions with linked lists and Java 8 red-black trees, load factor and resizing, and null-key handling.",
    topics: [
      [
        "Buckets and hashing",
        "A `HashMap` holds a `Node<K,V>[] table` whose length is a power of two (default 16, created lazily). Each node stores the hash, key, value and next pointer. The hash is `key.hashCode() ^ (h >>> 16)`, which mixes high bits into low bits, and the bucket index is `hash & (table.length - 1)`.",
      ],
      [
        "put() and get()",
        "`put` computes the index; if the bucket is empty it stores a new node; otherwise it walks the bucket and, if a node has the same hash and an equal key, replaces the value (returning the old one); else it appends a new node. `get` computes the same index and walks the bucket comparing hash first, then `==` or `equals`.",
      ],
      [
        "Collisions and treeification",
        "Different keys can land in the same bucket. Buckets start as linked lists. Since Java 8, when a bucket reaches 8 nodes (`TREEIFY_THRESHOLD`) and the table has at least 64 buckets, it becomes a red-black tree, so the worst case is O(log n) instead of O(n). It turns back into a list below 6 nodes.",
      ],
      [
        "Load factor and resizing",
        "The default load factor is 0.75: when size exceeds capacity times 0.75 (12 for 16 buckets), the table doubles. Each node either stays at its index or moves to index + old capacity, depending on one bit of its hash, so resizing does not need to recompute hashes. Pre-size with `new HashMap<>(expected / 0.75 + 1)` or `HashMap.newHashMap(expected)` (Java 19).",
      ],
      [
        "Null key and other facts",
        "One null key is allowed and always lives in bucket 0 (its hash is 0); any number of null values are allowed. Iteration order is unspecified and can change after a resize. HashMap is not synchronized and its iterators are fail-fast.",
      ],
    ],
    code: String.raw`import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class Main {
    record BadKey(int id) {
        @Override public int hashCode() { return 42; }        // every key collides
    }

    static int spread(Object key) { int h = key == null ? 0 : key.hashCode(); return h ^ (h >>> 16); }

    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        for (String key : new String[] {"apple", "banana", "cherry"}) {
            System.out.printf("%-7s hashCode=%11d spread=%11d bucket(16)=%2d%n", key, key.hashCode(), spread(key), spread(key) & 15);
        }

        System.out.println("put new key returns: " + map.put("apple", 1));
        System.out.println("put same key returns old value: " + map.put("apple", 2) + ", now " + map.get("apple"));
        map.put(null, 0);
        map.put("banana", null);
        System.out.println("null key bucket = " + (spread(null) & 15) + ", get(null) = " + map.get(null)
                + ", containsKey(banana) = " + map.containsKey("banana") + " with null value");

        System.out.println("resize threshold for 16 buckets at load factor 0.75: " + (int) (16 * 0.75));
        StringBuilder steps = new StringBuilder("capacity as entries grow:");
        int capacity = 16;
        for (int size = 1; size <= 100; size++) {
            if (size > capacity * 0.75) { capacity *= 2; steps.append(" ").append(size).append("->").append(capacity); }
        }
        System.out.println(steps);

        Map<BadKey, Integer> colliding = new HashMap<>();
        for (int i = 0; i < 1000; i++) colliding.put(new BadKey(i), i);
        System.out.println("1000 keys in one bucket still found: " + colliding.get(new BadKey(777))
                + " (bucket became a red-black tree, O(log n))");

        for (String k : new String[] {"apple", "cherry"}) {
            int h = spread(k);
            System.out.println("on resize 16->32, " + k + " goes from bucket " + (h & 15) + " to " + (h & 31)
                    + ((h & 16) == 0 ? " (stays)" : " (moves by +16)"));
        }
    }
}`,
    walk:
      "For each key the program prints the raw hash code, the spread hash and the resulting bucket in a 16-bucket table, which is exactly what `HashMap` computes. `put` returns null for a new key and the old value when replacing. The null key always maps to bucket 0, and a key can be present with a null value, which is why `containsKey` matters.\n\nThe growth simulation shows the table doubling whenever size exceeds 75% of capacity: at 13, 25, 49 and 97 entries. A key class whose hash is constant forces 1,000 entries into one bucket; since it is a record (and therefore not `Comparable`), the tree orders entries by identity hash, yet lookups still succeed. The last lines show the resize rule: when the table doubles from 16 to 32, \"cherry\" stays in bucket 1 while \"apple\" moves from 1 to 17, depending on a single bit of the hash.",
    anim: [
      "HashMap.put step by step",
      [
        ["key", "key.hashCode()", "e.g. apple"],
        ["spread", "h ^ (h >>> 16)", "mix bits"],
        ["index", "hash & (n-1)", "bucket index"],
        ["bucket", "bucket", "list or tree"],
        ["resize", "size > 0.75n", "double table"],
      ],
      [
        ["key", "spread", "hash", "put takes the key's hashCode and mixes the high bits into the low bits."],
        ["spread", "index", "mask", "The bucket index is the hash ANDed with (table length - 1)."],
        ["index", "bucket", "store", "The entry is added to that bucket, or replaces the value of an equal key."],
        ["bucket", "resize", "check", "If size now exceeds capacity times 0.75, the table doubles and entries split."],
      ],
    ],
    mistakes: [
      "Mutating key fields used in hashCode after insertion.",
      "Assuming iteration order is insertion order (that is LinkedHashMap).",
      "Using HashMap from several threads without synchronization (data loss, and before Java 8 even infinite loops during resize).",
    ],
    qa: [
      ["How does HashMap work internally?", "It hashes the key, spreads the hash, selects a bucket with hash & (n - 1), and stores nodes in a linked list or red-black tree per bucket, resizing when size exceeds capacity times the load factor."],
      ["What is the default capacity and load factor?", "16 buckets and 0.75, so the first resize happens after 12 entries."],
      ["What changed in HashMap in Java 8?", "Buckets with many collisions (8+ nodes, table at least 64) become red-black trees, making the worst case O(log n); resizing also preserves node order within buckets."],
      ["Can HashMap have a null key?", "Yes, one null key (stored in bucket 0) and any number of null values."],
    ],
    ex: [
      "You will store 1,000 entries. What initial capacity avoids all resizes, and what does `new HashMap<>(1000)` actually allocate?",
      "You need capacity at least 1000 / 0.75 = 1334, rounded up to a power of two: 2048. `new HashMap<>(1000)` allocates 1024 buckets (threshold 768), so it would still resize once; use `HashMap.newHashMap(1000)` instead.",
    ],
  }),

  lesson("LinkedHashMap and TreeMap: HashMap vs LinkedHashMap vs TreeMap", {
    intro:
      "Java has three general-purpose Map implementations with different ordering guarantees. HashMap has none, LinkedHashMap keeps insertion or access order, and TreeMap keeps keys sorted. This lesson explains LinkedHashMap and TreeMap, compares all three, and shows TreeMap's navigation methods.",
    topics: [
      [
        "LinkedHashMap",
        "A HashMap subclass whose entries also form a doubly linked list. By default it iterates in insertion order (re-putting a key keeps its place). With `accessOrder = true` it iterates from least to most recently accessed, and with `removeEldestEntry` it becomes an LRU cache. Operations stay O(1).",
      ],
      [
        "TreeMap",
        "A red-black tree sorted by key, using natural ordering or a `Comparator`. `get`, `put` and `remove` are O(log n). It implements `NavigableMap`: `firstKey`, `lastKey`, `floorKey`, `ceilingKey`, `headMap`, `tailMap`, `subMap`, `descendingMap`, `pollFirstEntry`. No null keys with natural ordering; uniqueness is decided by comparison.",
      ],
      [
        "HashMap vs LinkedHashMap vs TreeMap",
        "Order: none / insertion or access / sorted by key. Performance: O(1) / O(1) / O(log n). Null keys: one / one / none (natural order). Memory: lowest / plus two links per entry / tree node per entry. Extra features: none / LRU support / range and navigation queries. Choose HashMap by default, LinkedHashMap for predictable order or caches, TreeMap for sorted keys or range lookups.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] cities = {"Pune", "Delhi", "Mumbai", "Agra", "Chennai"};
        Map<String, Integer> hash = new HashMap<>();
        Map<String, Integer> linked = new LinkedHashMap<>();
        TreeMap<String, Integer> tree = new TreeMap<>();
        for (int i = 0; i < cities.length; i++) {
            hash.put(cities[i], i);
            linked.put(cities[i], i);
            tree.put(cities[i], i);
        }
        System.out.println("HashMap       " + hash.size() + " entries, order not guaranteed");
        System.out.println("LinkedHashMap " + linked.keySet() + " (insertion order)");
        System.out.println("TreeMap       " + tree.keySet() + " (sorted)");

        linked.put("Pune", 99);
        System.out.println("re-put keeps position: " + linked);

        System.out.println("firstKey " + tree.firstKey() + ", lastKey " + tree.lastKey()
                + ", floorKey(M) " + tree.floorKey("M") + ", ceilingKey(M) " + tree.ceilingKey("M"));
        System.out.println("headMap(<D) " + tree.headMap("D") + ", tailMap(>=M) " + tree.tailMap("M"));
        System.out.println("descending " + tree.descendingMap().keySet());

        TreeMap<Integer, String> taxSlabs = new TreeMap<>(Map.of(0, "0%", 300_000, "5%", 700_000, "10%", 1_000_000, "15%"));
        for (int income : new int[] {250_000, 650_000, 1_200_000}) {
            System.out.println("income " + income + " -> slab " + taxSlabs.floorEntry(income).getValue());
        }

        TreeMap<String, Integer> reverse = new TreeMap<>(Comparator.reverseOrder());
        reverse.putAll(tree);
        System.out.println("TreeMap with comparator: " + reverse.keySet());
    }
}`,
    walk:
      "The same five cities go into all three maps. `LinkedHashMap` returns them in insertion order, `TreeMap` alphabetically, and `HashMap` in an order you should not depend on. Re-putting \"Pune\" changes its value but not its position in the `LinkedHashMap`.\n\nThe `TreeMap` navigation methods answer questions such as \"the greatest key not after M\" (Delhi) and \"keys from M onwards\". `floorEntry` is a neat way to look up ranges: each income maps to the highest slab threshold at or below it. A comparator reverses the order.",
    anim: [
      "Three maps, three orders",
      [
        ["put", "put cities", "Pune, Delhi..."],
        ["hm", "HashMap", "bucket order"],
        ["lhm", "LinkedHashMap", "insertion order"],
        ["tm", "TreeMap", "sorted keys"],
        ["nav", "floorEntry()", "range lookup"],
      ],
      [
        ["put", "hm", "hash", "HashMap stores entries by hash: fastest, but order is arbitrary."],
        ["put", "lhm", "link", "LinkedHashMap also links entries, so iteration follows insertion order."],
        ["put", "tm", "tree", "TreeMap inserts into a red-black tree: O(log n) and always sorted."],
        ["tm", "nav", "navigate", "Sorted keys enable floor, ceiling and range queries like tax slabs."],
      ],
    ],
    mistakes: [
      "Using TreeMap when you only need lookups (slower than HashMap).",
      "Expecting `LinkedHashMap` in insertion mode to move a re-put key to the end.",
    ],
    qa: [
      ["What is the difference between HashMap, LinkedHashMap and TreeMap?", "HashMap: no order, O(1). LinkedHashMap: insertion or access order, O(1). TreeMap: sorted by key, O(log n), with navigation methods."],
      ["How is TreeMap implemented?", "As a red-black tree (a self-balancing binary search tree)."],
      ["Which Map would you use for an LRU cache?", "LinkedHashMap with accessOrder = true and removeEldestEntry overridden."],
    ],
    ex: [
      "Use a TreeMap to find which time slot a booking at 14:20 falls into, given slots starting at 9:00, 12:00, 14:00 and 17:00 (store minutes since midnight).",
      "Keys 540, 720, 840, 1020. `floorKey(14 * 60 + 20)` = `floorKey(860)` returns 840, the 14:00 slot.",
    ],
  }),

  lesson("HashMap vs Hashtable", {
    intro:
      "`Hashtable` is the original Java 1.0 hash table; `HashMap` arrived with the Collections Framework in Java 1.2. They look similar but differ in synchronization, null handling, iteration and performance. This lesson compares them and explains why Hashtable is considered legacy.",
    topics: [
      [
        "Synchronization",
        "Every public method of Hashtable is `synchronized` on the table, so only one thread can use it at a time; it is thread-safe for single operations but every call pays for the lock. HashMap is not synchronized. For concurrency, `ConcurrentHashMap` is far better than both.",
      ],
      [
        "Nulls",
        "HashMap allows one null key and many null values. Hashtable allows neither: `put(null, v)` and `put(k, null)` throw `NullPointerException`. (ConcurrentHashMap follows Hashtable here, because a null return would be ambiguous in concurrent code.)",
      ],
      [
        "Iteration and legacy API",
        "Hashtable supports the legacy `Enumeration` through `keys()` and `elements()`, which are not fail-fast, plus fail-fast iterators from its collection views. HashMap offers only fail-fast iterators. Hashtable extends the obsolete `Dictionary` class; HashMap extends `AbstractMap`.",
      ],
      [
        "Internals and performance",
        "HashMap uses power-of-two tables with hash spreading and treeified buckets; Hashtable uses a default capacity of 11, grows to `2n + 1` and uses `(hash & 0x7FFFFFFF) % length` for the index, with no tree bins. HashMap is faster in single-threaded code.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, String> hashMap = new HashMap<>();
        hashMap.put(null, "null key ok");
        hashMap.put("k", null);
        System.out.println("HashMap null key and value: " + hashMap);

        Hashtable<String, String> table = new Hashtable<>();
        try { table.put(null, "x"); } catch (NullPointerException e) { System.out.println("Hashtable null key -> NullPointerException"); }
        try { table.put("k", null); } catch (NullPointerException e) { System.out.println("Hashtable null value -> NullPointerException"); }

        table.put("one", "1"); table.put("two", "2"); table.put("three", "3");
        Enumeration<String> keys = table.keys();                     // legacy, not fail-fast
        table.put("four", "4");                                      // modify during enumeration
        int seen = 0;
        while (keys.hasMoreElements()) { keys.nextElement(); seen++; }
        System.out.println("Enumeration survived a modification, saw " + seen + " keys");

        Map<Integer, Integer> unsafe = new HashMap<>();
        Map<Integer, Integer> safe = new Hashtable<>();
        Runnable writer = () -> { for (int i = 0; i < 20_000; i++) { unsafe.put(i, i); safe.put(i, i); } };
        Runnable writer2 = () -> { for (int i = 20_000; i < 40_000; i++) { unsafe.put(i, i); safe.put(i, i); } };
        Thread a = new Thread(writer), b = new Thread(writer2);
        a.start(); b.start(); a.join(); b.join();
        System.out.println("concurrent puts: Hashtable size " + safe.size() + ", HashMap lost entries: " + (unsafe.size() != 40_000));

        System.out.println("Hashtable superclass: " + Hashtable.class.getSuperclass().getSimpleName()
                + ", HashMap superclass: " + HashMap.class.getSuperclass().getSimpleName());
    }
}`,
    varies: true,
    walk:
      "HashMap accepts a null key and a null value; Hashtable rejects both with `NullPointerException`. Hashtable's legacy `Enumeration` keeps going after the table is modified instead of failing fast (whether it sees the new key depends on where it lands).\n\nTwo threads then put 20,000 distinct keys each into both maps. Hashtable ends with exactly 40,000 entries because each `put` is synchronized; HashMap typically loses entries because concurrent writes and resizes interfere. The superclasses show Hashtable's legacy `Dictionary` parent.",
    anim: [
      "Hashtable locks the whole table",
      [
        ["t1", "Thread 1", "put(a)"],
        ["t2", "Thread 2", "put(b)"],
        ["lock", "table lock", "one at a time"],
        ["ht", "Hashtable", "consistent"],
        ["hm", "HashMap", "no lock, races"],
      ],
      [
        ["t1", "lock", "acquire", "Thread 1 enters a synchronized put and holds the whole table's lock."],
        ["t2", "lock", "wait", "Thread 2 must wait, even if it writes to a different bucket."],
        ["lock", "ht", "release", "Operations happen one by one, so Hashtable never loses an entry."],
        ["t2", "hm", "no lock", "HashMap lets both threads write at once, which can lose entries."],
      ],
    ],
    mistakes: [
      "Choosing Hashtable for thread safety in new code; use ConcurrentHashMap.",
      "Porting code from HashMap to Hashtable or ConcurrentHashMap without removing null keys and values.",
    ],
    qa: [
      ["What are the differences between HashMap and Hashtable?", "Hashtable is synchronized, disallows null keys and values, supports Enumeration and is legacy; HashMap is unsynchronized, allows one null key and null values, and is faster."],
      ["Why does Hashtable not allow null?", "Its methods call key.hashCode() and treat null values as absent, so nulls are rejected; it was designed before null-tolerant collections."],
      ["What should you use instead of Hashtable?", "HashMap in single-threaded code, ConcurrentHashMap in concurrent code."],
    ],
    ex: [
      "What is the initial capacity of a Hashtable and how does it grow?",
      "11 buckets with load factor 0.75; when the threshold is exceeded it grows to 2 * capacity + 1 (23, 47, ...).",
    ],
  }),

  lesson("ConcurrentHashMap: Segments, CAS and HashMap vs ConcurrentHashMap", {
    intro:
      "`ConcurrentHashMap` is the standard thread-safe map: many threads can read and write it at the same time without locking the whole table. Its design changed significantly between Java 7 (segments) and Java 8 (CAS and per-bucket locks). This lesson explains both designs, its atomic methods, iteration behaviour and how it differs from HashMap.",
    topics: [
      [
        "Java 7 design: segments",
        "The map was split into 16 segments by default (`concurrencyLevel`), each a small hash table with its own `ReentrantLock`. Writers locked only their segment, so up to 16 threads could write concurrently; reads were mostly lock-free using volatile fields.",
      ],
      [
        "Java 8+ design: CAS and bucket locks",
        "Segments were removed. The map is one array of bins like HashMap. Inserting into an empty bin uses a lock-free compare-and-swap (CAS); updating a non-empty bin synchronizes only on that bin's first node. Reads take no locks at all. Long bins become trees, and resizing is done cooperatively by several threads. The `concurrencyLevel` constructor argument is kept only for compatibility.",
      ],
      [
        "Atomic compound operations",
        "`putIfAbsent`, `computeIfAbsent`, `compute`, `merge`, `replace(key, old, new)` and `remove(key, value)` are atomic, so you can safely write `map.merge(word, 1, Integer::sum)` from many threads. A sequence of `get` then `put` is not atomic.",
      ],
      [
        "Iteration and size",
        "Iterators are weakly consistent: they never throw `ConcurrentModificationException` and may or may not reflect updates made during iteration. `size()` is an estimate under concurrent updates; `mappingCount()` returns a long. Bulk operations `forEach`, `reduce` and `search` can run in parallel.",
      ],
      [
        "HashMap vs ConcurrentHashMap",
        "Thread safety: no / yes. Nulls: HashMap allows them; ConcurrentHashMap forbids null keys and values (a null from `get` would be ambiguous between missing and present). Iterators: fail-fast / weakly consistent. Performance: HashMap is slightly faster single-threaded; ConcurrentHashMap scales across threads, unlike `Collections.synchronizedMap` or Hashtable, which lock everything.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        String text = "to be or not to be that is the question to be";
        List<String> words = new ArrayList<>();
        for (int i = 0; i < 2000; i++) words.addAll(List.of(text.split(" ")));

        ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
        Map<String, Integer> plain = new HashMap<>();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        int chunk = words.size() / 8;
        for (int t = 0; t < 8; t++) {
            List<String> part = words.subList(t * chunk, (t + 1) * chunk);
            pool.submit(() -> {
                for (String w : part) {
                    counts.merge(w, 1, Integer::sum);                 // atomic read-modify-write
                    synchronized (plain) { plain.merge(w, 1, Integer::sum); } // HashMap needs a lock
                }
            });
        }
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("to=" + counts.get("to") + " be=" + counts.get("be") + " question=" + counts.get("question")
                + ", matches locked HashMap: " + counts.equals(plain));

        ConcurrentHashMap<String, List<String>> groups = new ConcurrentHashMap<>();
        for (String w : List.of("apple", "avocado", "banana", "blueberry", "cherry"))
            groups.computeIfAbsent(w.substring(0, 1), k -> new CopyOnWriteArrayList<>()).add(w);
        System.out.println("computeIfAbsent groups: " + new TreeMap<>(groups));

        System.out.println("putIfAbsent existing: " + counts.putIfAbsent("to", 0) + ", replace(to, 6000, 1): "
                + counts.replace("to", 6000, 1) + " -> " + counts.get("to"));

        for (String key : counts.keySet()) counts.put(key + "!", 0);   // modify while iterating: no CME
        System.out.println("modified during iteration without exception, mappingCount = " + counts.mappingCount());

        try { counts.put(null, 1); } catch (NullPointerException e) { System.out.println("null key rejected"); }
        try { counts.put("x", null); } catch (NullPointerException e) { System.out.println("null value rejected"); }
        System.out.println("parallel reduce of values: " + counts.reduceValuesToLong(1, Integer::longValue, 0L, Long::sum));
    }
}`,
    varies: true,
    walk:
      "Eight threads count words in parallel. `merge` on the `ConcurrentHashMap` is atomic, so the counts are exact (\"to\" and \"be\" appear 6,000 times each); the HashMap version needs an explicit lock to reach the same result.\n\n`computeIfAbsent` builds per-letter groups atomically. `putIfAbsent` returns the existing value without overwriting, and `replace(key, expected, new)` is an atomic compare-and-set. Adding keys while iterating does not throw, because iterators are weakly consistent (how many new keys the loop also visits can vary). Null keys and values are rejected, and `reduceValuesToLong` sums the values with parallel bulk processing.",
    anim: [
      "Java 8 ConcurrentHashMap write",
      [
        ["t", "Thread", "put(k, v)"],
        ["bin", "bin = hash & n-1", "find bin"],
        ["cas", "CAS", "empty bin"],
        ["sync", "sync on head", "non-empty bin"],
        ["read", "get()", "no lock"],
      ],
      [
        ["t", "bin", "hash", "The key's spread hash selects one bin in the shared table."],
        ["bin", "cas", "empty", "If the bin is empty, a lock-free compare-and-swap installs the node."],
        ["bin", "sync", "occupied", "Otherwise the thread locks only that bin's head node, not the whole map."],
        ["read", "bin", "volatile", "Readers never lock; they read volatile fields and see a consistent node."],
      ],
    ],
    mistakes: [
      "Writing `if (!map.containsKey(k)) map.put(k, v);` on a ConcurrentHashMap; use `putIfAbsent` or `computeIfAbsent`.",
      "Using a `ConcurrentHashMap<String, Integer>` with `get` + `put` for counters; use `merge` or `LongAdder` values.",
      "Doing slow work inside `computeIfAbsent`, which blocks other writers of that bin.",
    ],
    qa: [
      ["How does ConcurrentHashMap achieve thread safety?", "Java 7 used 16 lock-protected segments; Java 8+ uses CAS for empty bins and synchronizes on individual bin heads, with lock-free reads."],
      ["Why doesn't ConcurrentHashMap allow null keys or values?", "Because a null result from get would be ambiguous (absent or mapped to null) and cannot be checked safely with containsKey in concurrent code."],
      ["Are ConcurrentHashMap iterators fail-fast?", "No, they are weakly consistent and never throw ConcurrentModificationException."],
      ["What is the difference between ConcurrentHashMap and Collections.synchronizedMap?", "synchronizedMap locks the whole map for every operation; ConcurrentHashMap locks per bin (or not at all for reads), so it scales much better."],
    ],
    ex: [
      "Count page views per URL from many threads with the least contention. Which value type and method would you use?",
      "`ConcurrentHashMap<String, LongAdder>` with `map.computeIfAbsent(url, k -> new LongAdder()).increment();`. LongAdder spreads contention across cells for hot keys.",
    ],
  }),

  lesson("IdentityHashMap and WeakHashMap", {
    intro:
      "Two special-purpose maps change the rules that ordinary maps follow. `IdentityHashMap` compares keys by reference (`==`) instead of `equals`, and `WeakHashMap` holds its keys weakly so entries vanish when the key is no longer used elsewhere. This lesson explains both, their uses, and how IdentityHashMap differs from HashMap.",
    topics: [
      [
        "IdentityHashMap",
        "Uses `==` for key comparison and `System.identityHashCode` for hashing, deliberately violating the general Map contract. Two distinct `String` objects with the same text are different keys. Internally it uses linear probing in a single array of alternating keys and values, not linked buckets.",
      ],
      [
        "Uses of IdentityHashMap",
        "Algorithms that track objects by identity: serialization and deep-copy frameworks (\"have I already copied this exact object?\"), graph traversal of object graphs with cycles, proxies and object registries where equal-but-distinct objects must stay separate.",
      ],
      [
        "HashMap vs IdentityHashMap",
        "Key equality: `equals()` vs `==`. Hashing: `hashCode()` vs `identityHashCode()`. Structure: buckets with chaining or trees vs open addressing with linear probing. Use HashMap for normal value-keyed lookups; IdentityHashMap only when identity is what you mean.",
      ],
      [
        "WeakHashMap",
        "Keys are held through `WeakReference`s. When a key is no longer strongly reachable anywhere else, the garbage collector clears it, and the entry is removed the next time the map is used (it polls a `ReferenceQueue`). Values are held strongly, so a value must not reference its own key or the entry never expires.",
      ],
      [
        "Uses of WeakHashMap",
        "Attaching metadata to objects you do not own without preventing their collection (caches keyed by class loader or by UI component, canonicalizing maps). It is not a general-purpose cache for string keys, because string literals are always strongly reachable.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static class Session { final String user; Session(String u) { user = u; } public String toString() { return "Session(" + user + ")"; } }

    public static void main(String[] args) throws Exception {
        String a = new String("key"), b = new String("key");
        Map<String, Integer> hash = new HashMap<>();
        Map<String, Integer> identity = new IdentityHashMap<>();
        hash.put(a, 1); hash.put(b, 2);
        identity.put(a, 1); identity.put(b, 2);
        System.out.println("equal strings, different objects: a.equals(b)=" + a.equals(b) + ", a==b=" + (a == b));
        System.out.println("HashMap size " + hash.size() + " (equals), IdentityHashMap size " + identity.size() + " (==)");
        System.out.println("identity.get(new String(\"key\")) = " + identity.get(new String("key")) + ", identity.get(a) = " + identity.get(a));

        Map<Session, String> metadata = new WeakHashMap<>();
        Session alive = new Session("asha");
        Session temporary = new Session("ravi");
        metadata.put(alive, "logged in 09:00");
        metadata.put(temporary, "logged in 09:05");
        System.out.println("WeakHashMap before GC: " + metadata.size() + " entries");

        temporary = null;                                   // no strong reference left
        for (int i = 0; i < 10 && metadata.size() > 1; i++) { System.gc(); Thread.sleep(20); }
        System.out.println("after GC: " + metadata.size() + " entry, remaining " + metadata.keySet());

        Map<Session, String> strong = new HashMap<>();
        Session other = new Session("meera");
        strong.put(other, "x");
        other = null;
        System.gc();
        System.out.println("HashMap keeps its entry even when the key is unused elsewhere: " + strong.size());
    }
}`,
    jvm: ["-XX:+UseSerialGC"],
    walk:
      "Two `String` objects with the same text are equal but not identical. A `HashMap` treats them as one key (size 1, the second put overwrote the first), while an `IdentityHashMap` keeps both (size 2). Looking up a third, equal string in the identity map returns null; only the exact object works.\n\nIn the `WeakHashMap`, dropping the last strong reference to the \"ravi\" session lets the garbage collector clear the weak key, and the entry disappears the next time the map is accessed. A normal `HashMap` keeps its entry forever because it references the key strongly.",
    anim: [
      "WeakHashMap entry expiry",
      [
        ["var", "temporary", "strong ref"],
        ["key", "Session(ravi)", "object"],
        ["entry", "WeakHashMap", "weak key"],
        ["gc", "GC", "clears weak ref"],
        ["gone", "entry removed", "on next access"],
      ],
      [
        ["var", "key", "strong", "While a variable references the session, the key is strongly reachable."],
        ["entry", "key", "weak", "The map refers to the key only weakly, which does not keep it alive."],
        ["gc", "key", "collect", "After temporary = null, the GC can clear the weak reference and the object."],
        ["gc", "gone", "expunge", "The map notices the cleared reference and removes the stale entry."],
      ],
    ],
    mistakes: [
      "Using IdentityHashMap with string or boxed keys and expecting value-based lookups.",
      "Storing values in a WeakHashMap that reference their keys, so entries never expire.",
      "Using WeakHashMap with string literal keys; literals are always strongly reachable.",
    ],
    qa: [
      ["What is the difference between HashMap and IdentityHashMap?", "HashMap compares keys with equals and hashCode; IdentityHashMap uses == and identityHashCode, and uses linear probing internally."],
      ["How does WeakHashMap work?", "It wraps keys in weak references; when a key is otherwise unreachable, the GC clears it and the map removes the entry on its next operation."],
      ["When would you use IdentityHashMap?", "When you must track specific object instances, for example during serialization, deep copying or graph traversal."],
    ],
    ex: [
      "Why is `new WeakHashMap<String, Data>()` with keys like `\"user-1\"` a poor cache?",
      "String literals are interned and stay strongly reachable as long as the class is loaded, so their entries never expire; and computed strings may expire unexpectedly early. Use a real cache with size or time-based eviction.",
    ],
  }),

  lesson("Iterator, ListIterator and Enumeration", {
    intro:
      "Java has three ways to step through a collection: the legacy `Enumeration`, the standard `Iterator`, and `ListIterator`, which adds bidirectional movement and modification for lists. Two comparison questions come from them: Iterator vs ListIterator and Iterator vs Enumeration. This lesson covers all three.",
    topics: [
      [
        "Iterator",
        "Obtained from any collection with `iterator()`. Methods: `hasNext()`, `next()`, `remove()` (removes the last returned element; at most once per `next`) and `forEachRemaining(action)`. The enhanced for loop uses it behind the scenes. It moves forward only.",
      ],
      [
        "ListIterator",
        "Obtained from a List with `listIterator()` or `listIterator(index)`. Adds `hasPrevious()`, `previous()`, `nextIndex()`, `previousIndex()`, `set(e)` (replace the last returned element) and `add(e)` (insert at the cursor). It can move in both directions and start at any position.",
      ],
      [
        "Enumeration",
        "The Java 1.0 interface used by `Vector` and `Hashtable`: `hasMoreElements()` and `nextElement()`. It cannot remove elements. Since Java 9 `asIterator()` converts it. `Collections.enumeration(list)` and `Collections.list(enumeration)` convert between the two worlds.",
      ],
      [
        "Iterator vs ListIterator",
        "Iterator works on every Collection; ListIterator only on Lists. Iterator moves forward; ListIterator moves both ways. Iterator can only remove; ListIterator can also add and set. ListIterator knows indexes (`nextIndex`).",
      ],
      [
        "Iterator vs Enumeration",
        "Iterator has `remove()` and shorter method names; Enumeration has neither. Iterators of modern collections are fail-fast; Enumerations from Vector and Hashtable are not. Iterator is part of the Collections Framework (Java 1.2); Enumeration is legacy.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> tasks = new ArrayList<>(List.of("write", "test", "skip-me", "deploy", "skip-too"));

        Iterator<String> it = tasks.iterator();
        while (it.hasNext()) {
            if (it.next().startsWith("skip")) it.remove();          // safe removal
        }
        System.out.println("Iterator removed skips: " + tasks);
        try {
            Iterator<String> again = tasks.iterator();
            again.remove();                                          // remove before next()
        } catch (IllegalStateException e) {
            System.out.println("remove() before next() -> IllegalStateException");
        }

        ListIterator<String> li = tasks.listIterator();
        while (li.hasNext()) {
            int index = li.nextIndex();
            String task = li.next();
            li.set(task.toUpperCase());                              // replace
            if (task.equals("test")) li.add("REVIEW");               // insert at cursor
            System.out.print(index + ":" + task + " ");
        }
        System.out.println();
        System.out.print("ListIterator backwards: ");
        while (li.hasPrevious()) System.out.print(li.previous() + " ");
        System.out.println();

        Vector<String> legacy = new Vector<>(List.of("a", "b", "c"));
        Enumeration<String> en = legacy.elements();
        StringBuilder sb = new StringBuilder();
        while (en.hasMoreElements()) sb.append(en.nextElement());
        System.out.println("Enumeration over Vector: " + sb);

        Iterator<String> converted = legacy.elements().asIterator();
        converted.forEachRemaining(s -> System.out.print(s.toUpperCase()));
        System.out.println(" (Enumeration.asIterator)");
        System.out.println("Collections.list(enumeration): " + Collections.list(Collections.enumeration(tasks)));
    }
}`,
    walk:
      "The `Iterator` removes every task starting with \"skip\" safely while iterating; calling `remove()` before `next()` is illegal and throws `IllegalStateException`.\n\nThe `ListIterator` upper-cases each task with `set`, inserts \"REVIEW\" right after \"test\" with `add`, and reports indexes; the inserted element is not visited by the forward loop. Walking backwards with `previous()` shows the final list. The legacy `Enumeration` over a Vector can only read, can be converted with `asIterator()`, and `Collections.list` turns an enumeration back into a list.",
    anim: [
      "ListIterator cursor",
      [
        ["c0", "| WRITE", "cursor 0"],
        ["c1", "WRITE | TEST", "after next()"],
        ["add", "add(REVIEW)", "insert at cursor"],
        ["c3", "... REVIEW |", "cursor moves"],
        ["back", "previous()", "walk back"],
      ],
      [
        ["c0", "c1", "next()", "next() returns the element after the cursor and moves the cursor past it."],
        ["c1", "add", "set/add", "set replaces the element just returned; add inserts at the cursor position."],
        ["add", "c3", "advance", "After add, the cursor sits after the inserted element, so next() skips it."],
        ["c3", "back", "previous()", "previous() moves the cursor backwards: only ListIterator can do this."],
      ],
    ],
    mistakes: [
      "Calling `list.remove(x)` inside a for-each loop instead of `iterator.remove()`.",
      "Calling `iterator.remove()` twice without `next()` in between.",
    ],
    qa: [
      ["What is the difference between Iterator and ListIterator?", "Iterator works on any collection and moves forward with remove only; ListIterator works on lists, moves both ways and can add, set and report indexes."],
      ["What is the difference between Iterator and Enumeration?", "Iterator can remove elements and is fail-fast for modern collections; Enumeration is legacy, read-only, and not fail-fast."],
      ["How do you remove elements safely while iterating?", "Use Iterator.remove(), or Collection.removeIf(predicate)."],
    ],
    ex: [
      "Use a ListIterator to double every number in `List<Integer> nums = [1, 2, 3]` in place.",
      "`ListIterator<Integer> it = nums.listIterator(); while (it.hasNext()) it.set(it.next() * 2);` gives [2, 4, 6]. `nums.replaceAll(n -> n * 2)` does the same.",
    ],
  }),

  lesson("Fail-Fast, Fail-Safe and ConcurrentModificationException", {
    intro:
      "If a collection is modified while it is being iterated, ordinary collections throw `ConcurrentModificationException` (fail-fast), while concurrent collections let iteration continue over a snapshot or a weakly consistent view (fail-safe). This lesson explains how fail-fast iterators detect modification with `modCount`, the classic single-threaded cause of the exception, how to avoid it, and how fail-safe iterators behave.",
    topics: [
      [
        "ConcurrentModificationException",
        "Thrown when a collection is structurally modified (elements added or removed, not just values replaced) while an iterator over it is in use, by anything other than the iterator itself. Despite the name, it most often happens in a single thread: removing from a list inside a for-each loop.",
      ],
      [
        "How fail-fast iterators work",
        "Collections such as ArrayList and HashMap keep an internal `modCount` incremented on every structural change. An iterator records `expectedModCount` when created and checks it on each `next()`; a mismatch triggers the exception. It is best-effort: it detects bugs, but is not a guarantee in multithreaded code.",
      ],
      [
        "Avoiding the exception",
        "Use `iterator.remove()`, `removeIf(predicate)`, collect changes and apply them after the loop, iterate over a copy (`new ArrayList<>(list)`), or use a concurrent collection. For maps, use `entrySet().removeIf` or the iterator of the view.",
      ],
      [
        "Fail-safe iterators",
        "`CopyOnWriteArrayList` and `CopyOnWriteArraySet` iterate over a snapshot of the array taken when the iterator was created: modifications never affect it and never throw, but the iterator does not see them and does not support `remove`. `ConcurrentHashMap`, `ConcurrentLinkedQueue` and `ConcurrentSkipListMap` have weakly consistent iterators: no exception, and updates may or may not be seen.",
      ],
      [
        "A subtle case",
        "Removing the second-to-last element inside a for-each loop does not throw: after removal, `hasNext()` compares the cursor with the new size and returns false, so the loop silently ends early and skips the last element. Never rely on it.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        try {
            for (Integer n : numbers) {
                if (n % 2 == 0) numbers.remove(n);          // modifies behind the iterator's back
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("for-each + list.remove -> ConcurrentModificationException");
        }

        numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        numbers.removeIf(n -> n % 2 == 0);
        System.out.println("removeIf: " + numbers);

        List<String> sneaky = new ArrayList<>(List.of("a", "b", "c"));
        for (String s : sneaky) if (s.equals("b")) sneaky.remove(s);   // second-to-last: no exception
        System.out.println("removing second-to-last silently ends the loop: " + sneaky);

        Map<String, Integer> stock = new HashMap<>(Map.of("pen", 0, "ink", 5, "pad", 0));
        stock.entrySet().removeIf(e -> e.getValue() == 0);
        System.out.println("map entrySet().removeIf: " + stock);

        List<String> cow = new CopyOnWriteArrayList<>(List.of("x", "y"));
        for (String s : cow) {
            cow.add(s + "!");                              // iterator sees the old snapshot
        }
        System.out.println("CopyOnWriteArrayList fail-safe: " + cow);
        try {
            cow.iterator().remove();
        } catch (UnsupportedOperationException e) {
            System.out.println("snapshot iterator does not support remove()");
        }

        Map<Integer, String> chm = new ConcurrentHashMap<>(Map.of(1, "a", 2, "b"));
        for (Integer k : chm.keySet()) chm.remove(k);      // weakly consistent: no exception
        System.out.println("ConcurrentHashMap emptied during iteration: " + chm);
    }
}`,
    walk:
      "Removing from an ArrayList inside a for-each loop changes its `modCount`, so the hidden iterator's next `next()` call throws `ConcurrentModificationException`. `removeIf` does the same job safely.\n\nRemoving \"b\" (the second-to-last element) does not throw: the size shrinks to 2, `hasNext()` returns false and the loop silently skips \"c\". For maps, `entrySet().removeIf` is the clean way to delete entries. `CopyOnWriteArrayList` iterates over a snapshot, so adding during iteration is safe and the loop only sees the original two elements; its iterator cannot remove. `ConcurrentHashMap` lets you remove keys while iterating.",
    anim: [
      "How fail-fast detection works",
      [
        ["list", "ArrayList", "modCount = 6"],
        ["it", "iterator", "expected = 6"],
        ["rm", "list.remove(2)", "modCount = 7"],
        ["next", "it.next()", "6 != 7"],
        ["cme", "CME", "thrown"],
      ],
      [
        ["list", "it", "create", "The iterator copies the list's modCount when it is created."],
        ["rm", "list", "structural", "Removing through the list (not the iterator) increments modCount."],
        ["it", "next", "check", "On the next call to next(), the iterator compares the two counts."],
        ["next", "cme", "mismatch", "They differ, so it throws ConcurrentModificationException immediately."],
      ],
    ],
    mistakes: [
      "Catching ConcurrentModificationException instead of fixing the iteration.",
      "Using CopyOnWriteArrayList for write-heavy lists; every write copies the whole array.",
    ],
    qa: [
      ["What is the difference between fail-fast and fail-safe iterators?", "Fail-fast iterators throw ConcurrentModificationException if the collection is structurally modified during iteration; fail-safe iterators work on a snapshot or weakly consistent view and never throw."],
      ["How does ArrayList detect concurrent modification?", "With a modCount field compared against the iterator's expectedModCount on each next()."],
      ["How do you avoid ConcurrentModificationException?", "Use Iterator.remove or removeIf, iterate over a copy, or use a concurrent collection."],
    ],
    ex: [
      "Does `list.set(0, \"z\")` inside a for-each loop over an ArrayList throw ConcurrentModificationException? Why?",
      "No. `set` replaces a value without changing the structure, so `modCount` does not change.",
    ],
  }),

  lesson("Collection vs Collections", {
    intro:
      "`Collection` and `Collections` differ by one letter but are entirely different things. `Collection` is the root interface of the collection hierarchy; `Collections` is a utility class full of static methods that operate on collections. This lesson explains both and tours the most useful `Collections` methods.",
    topics: [
      [
        "Collection (interface)",
        "`java.util.Collection<E>` is the root interface implemented by List, Set and Queue implementations. It defines instance methods such as `add`, `remove`, `contains`, `size`, `iterator`, `stream` and `removeIf`.",
      ],
      [
        "Collections (utility class)",
        "`java.util.Collections` is a final class with a private constructor and only static methods. It provides algorithms (`sort`, `binarySearch`, `reverse`, `shuffle`, `swap`, `rotate`, `frequency`, `max`, `min`, `disjoint`, `nCopies`), wrappers (`unmodifiableList`, `synchronizedMap`, `checkedList`) and factory constants (`emptyList`, `singletonList`).",
      ],
      [
        "Wrappers: unmodifiable, synchronized, checked",
        "`unmodifiableList(list)` returns a read-only view; changes to the original are still visible through it. `synchronizedList(list)` returns a view that synchronizes every method. `checkedList(list, String.class)` checks element types at runtime, catching heap pollution from raw types.",
      ],
      [
        "Related utility classes",
        "`Arrays` plays the same role for arrays (`sort`, `asList`, `fill`, `copyOf`). Since Java 9, `List.of`, `Set.of` and `Map.of` create truly immutable collections directly.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        Collection<String> collection = new ArrayList<>(List.of("delta", "alpha", "charlie", "bravo", "alpha"));
        collection.add("echo");                                    // Collection interface method
        System.out.println("Collection (interface) size " + collection.size() + ", contains alpha: " + collection.contains("alpha"));

        List<String> list = new ArrayList<>(collection);
        Collections.sort(list);
        System.out.println("Collections.sort: " + list);
        System.out.println("binarySearch(charlie) = " + Collections.binarySearch(list, "charlie"));
        Collections.reverse(list);
        System.out.println("reverse: " + list);
        Collections.swap(list, 0, list.size() - 1);
        System.out.println("swap first/last: " + list);
        Collections.rotate(list, 2);
        System.out.println("rotate by 2: " + list);
        System.out.println("max " + Collections.max(list) + ", min " + Collections.min(list)
                + ", frequency(alpha) " + Collections.frequency(list, "alpha"));
        System.out.println("nCopies: " + Collections.nCopies(3, "ha") + ", disjoint with [x]: " + Collections.disjoint(list, List.of("x")));

        List<String> readOnly = Collections.unmodifiableList(list);
        list.add("zulu");                                          // original still changeable
        System.out.println("unmodifiable view sees change: " + readOnly.contains("zulu"));
        try { readOnly.add("y"); } catch (UnsupportedOperationException e) { System.out.println("view rejects add"); }

        @SuppressWarnings({"rawtypes", "unchecked"})
        List raw = Collections.checkedList(new ArrayList<String>(), String.class);
        try { raw.add(42); } catch (ClassCastException e) { System.out.println("checkedList caught a wrong type at runtime"); }

        System.out.println("emptyList " + Collections.emptyList() + ", singletonList " + Collections.singletonList("only"));
        System.out.println("Collections has a public constructor: " + (Collections.class.getConstructors().length > 0));
    }
}`,
    walk:
      "The first line uses `Collection` as an interface type: `add`, `size` and `contains` are instance methods. Everything else calls static methods on the `Collections` utility class: sorting, binary search on the sorted list, reversing, swapping, rotating, finding max, min and frequency, `nCopies` and `disjoint`.\n\n`unmodifiableList` is only a view, so a change to the original list shows through it while the view itself rejects changes. `checkedList` catches an `Integer` sneaking into a String list through a raw reference. The last line confirms `Collections` cannot be instantiated.",
    anim: [
      "Interface vs utility class",
      [
        ["coll", "Collection", "interface"],
        ["impl", "ArrayList", "implements it"],
        ["util", "Collections", "static helpers"],
        ["algo", "sort, reverse", "algorithms"],
        ["wrap", "unmodifiable..", "wrappers"],
      ],
      [
        ["coll", "impl", "implemented", "Collection is a type: ArrayList, HashSet and others implement it."],
        ["util", "impl", "operates", "Collections is a toolbox of static methods that take collections as arguments."],
        ["util", "algo", "provides", "It offers algorithms such as sort, binarySearch, reverse and shuffle."],
        ["util", "wrap", "provides", "And wrappers that add read-only, synchronized or type-checked behaviour."],
      ],
    ],
    mistakes: [
      "Thinking `Collections.unmodifiableList` makes an immutable copy; it is a live view of the original.",
      "Calling `binarySearch` on an unsorted list (undefined result).",
    ],
    qa: [
      ["What is the difference between Collection and Collections?", "Collection is the root interface of the collection hierarchy; Collections is a utility class with static methods for collections."],
      ["What does Collections.synchronizedList return?", "A wrapper whose methods synchronize on the wrapper, making single operations thread-safe; iteration still needs manual synchronization."],
      ["What is the difference between Collections.unmodifiableList and List.of?", "unmodifiableList is a read-only view of an existing, possibly changing list; List.of creates a new, truly immutable list (and rejects nulls)."],
    ],
    ex: [
      "Shuffle a deck of 52 numbered cards reproducibly so tests always see the same order.",
      "`List<Integer> deck = new ArrayList<>(); for (int i = 1; i <= 52; i++) deck.add(i); Collections.shuffle(deck, new Random(42));` uses a fixed seed, so the order is the same every run.",
    ],
  }),

  lesson("Comparable vs Comparator", {
    intro:
      "Sorting needs a rule for which object comes first. `Comparable` gives a class its single natural order, built into the class; `Comparator` defines any number of external orders. This lesson explains both interfaces, the `compareTo` contract, Java 8 comparator factory methods, and when to use which.",
    topics: [
      [
        "Comparable",
        "`java.lang.Comparable<T>` has one method, `int compareTo(T other)`: negative if this comes first, zero if equal in order, positive if it comes later. Implement it in the class itself to define the natural order (String, Integer, LocalDate already do). `Collections.sort(list)`, `TreeSet` and `TreeMap` use it by default.",
      ],
      [
        "Comparator",
        "`java.util.Comparator<T>` has `int compare(T a, T b)`. It lives outside the class, so you can sort the same objects many ways (by name, by salary, descending) and sort classes you cannot modify. Pass it to `list.sort(c)`, `Collections.sort(list, c)`, `new TreeSet<>(c)` or `stream.sorted(c)`.",
      ],
      [
        "Java 8 comparator helpers",
        "`Comparator.comparing(Employee::getName)`, `comparingInt`, `comparingDouble`, `.thenComparing(...)` for tie-breaks, `.reversed()`, `Comparator.reverseOrder()`, `naturalOrder()`, and `nullsFirst`/`nullsLast` for null handling.",
      ],
      [
        "The compareTo contract",
        "Sign-symmetric (`sgn(a.compareTo(b)) == -sgn(b.compareTo(a))`), transitive, and ideally consistent with equals (compareTo returns 0 exactly when equals is true), otherwise sorted sets and maps behave unexpectedly. Never compute `a - b` for ints that might overflow; use `Integer.compare(a, b)`.",
      ],
      [
        "Comparable vs Comparator",
        "Comparable: one natural order, implemented inside the class, method `compareTo`, package `java.lang`. Comparator: many orders, separate class or lambda, method `compare`, package `java.util`, composable with Java 8 helpers.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static class Employee implements Comparable<Employee> {
        final int id; final String name; final String dept; final double salary;
        Employee(int id, String name, String dept, double salary) { this.id = id; this.name = name; this.dept = dept; this.salary = salary; }
        String getName() { return name; }
        String getDept() { return dept; }
        double getSalary() { return salary; }
        @Override public int compareTo(Employee other) { return Integer.compare(id, other.id); }   // natural order: id
        public String toString() { return id + ":" + name; }
    }

    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(
                new Employee(3, "Ravi", "Ops", 70_000),
                new Employee(1, "Meera", "Dev", 95_000),
                new Employee(4, "Asha", "Dev", 95_000),
                new Employee(2, "Neel", "Ops", 60_000)));

        Collections.sort(staff);                                           // Comparable
        System.out.println("natural order (id):     " + staff);

        staff.sort(Comparator.comparing(Employee::getName));                // Comparator
        System.out.println("by name:                " + staff);

        staff.sort(Comparator.comparingDouble(Employee::getSalary).reversed().thenComparing(Employee::getName));
        System.out.println("salary desc, then name: " + staff);

        staff.sort(Comparator.comparing(Employee::getDept).thenComparing(Comparator.naturalOrder()));
        System.out.println("dept, then id:          " + staff);

        Comparator<Employee> anonymous = new Comparator<>() {              // pre-Java 8 style
            @Override public int compare(Employee a, Employee b) { return b.name.length() - a.name.length(); }
        };
        staff.sort(anonymous);
        System.out.println("name length desc:       " + staff);

        List<String> withNulls = new ArrayList<>(Arrays.asList("pear", null, "apple"));
        withNulls.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println("nullsFirst:             " + withNulls);

        System.out.println("overflow trap: (Integer.MIN_VALUE - 1) > 0 is " + ((Integer.MIN_VALUE - 1) > 0)
                + "; Integer.compare(MIN_VALUE, 1) = " + Integer.compare(Integer.MIN_VALUE, 1));
    }
}`,
    walk:
      "`Employee` implements `Comparable` with id as its natural order, so `Collections.sort(staff)` orders by id. The other sorts pass comparators built with the Java 8 helpers: by name; by salary descending with the name as a tie-break (Asha and Meera both earn 95,000); and by department and then the natural order.\n\nThe anonymous class shows the older way to write a comparator. `nullsFirst` sorts a list containing null safely. The last line shows why subtraction-based comparisons are dangerous: `MIN_VALUE - 1` overflows to a large positive number, while `Integer.compare` is always correct.",
    anim: [
      "One natural order, many comparators",
      [
        ["emp", "Employee", "objects"],
        ["comp", "Comparable", "compareTo: id"],
        ["c1", "Comparator", "by name"],
        ["c2", "Comparator", "salary desc"],
        ["sorted", "sorted list", "result"],
      ],
      [
        ["emp", "comp", "inside", "The class itself defines one natural order by implementing compareTo."],
        ["comp", "sorted", "sort(list)", "Collections.sort(list) uses that natural order."],
        ["c1", "sorted", "sort(list, c)", "A Comparator supplies a different order without changing the class."],
        ["c2", "sorted", "compose", "Comparators compose: reversed() and thenComparing() add tie-breaks."],
      ],
    ],
    mistakes: [
      "Comparing with subtraction (`a.age - b.age`) which can overflow; use `Integer.compare`.",
      "A compareTo inconsistent with equals used in a TreeSet, silently dropping \"duplicates\".",
      "Forgetting that `reversed()` applies to the whole chain built so far.",
    ],
    qa: [
      ["What is the difference between Comparable and Comparator?", "Comparable defines a class's single natural order through compareTo inside the class; Comparator defines external, multiple orders through compare and can be composed."],
      ["When should you use Comparator instead of Comparable?", "When you need several sort orders, when you cannot modify the class, or when the order depends on context."],
      ["What does compareTo return?", "A negative number, zero or a positive number when this object is less than, equal to or greater than the argument."],
    ],
    ex: [
      "Sort employees by department ascending, then salary descending, using one comparator expression.",
      "`Comparator.comparing(Employee::getDept).thenComparing(Comparator.comparingDouble(Employee::getSalary).reversed())`.",
    ],
  }),

  lesson("Sorting: Arrays.sort, Sorting a Set and Sorting a Map by Key and Value", {
    intro:
      "Sorting tasks come in several shapes: sorting arrays with custom comparators, sorting the elements of a Set, and sorting a Map either by its keys or by its values. This lesson shows each with the standard tools: `Arrays.sort`, `TreeSet`, `TreeMap`, and streams with `Map.Entry` comparators collected into a `LinkedHashMap`.",
    topics: [
      [
        "Arrays.sort with a Comparator",
        "`Arrays.sort(int[])` sorts primitives with a dual-pivot quicksort. `Arrays.sort(T[], comparator)` sorts objects with TimSort, which is stable (equal elements keep their order). Comparators cannot be used with primitive arrays; box them or sort and reverse. `Arrays.sort(a, from, to)` sorts a range and `Arrays.parallelSort` uses multiple threads.",
      ],
      [
        "Sorting a Set",
        "A Set has no index, so copy it into a sorted structure: `new TreeSet<>(set)` for natural order, `new TreeSet<>(comparator)` plus `addAll` for a custom order, or a sorted `List` via `new ArrayList<>(set)` and `sort`, or `set.stream().sorted().toList()`.",
      ],
      [
        "Sorting a Map by key",
        "`new TreeMap<>(map)` sorts by natural key order; `new TreeMap<>(comparator)` plus `putAll` for a custom order. With streams: `map.entrySet().stream().sorted(Map.Entry.comparingByKey())`.",
      ],
      [
        "Sorting a Map by value",
        "Maps are keyed by keys, so sort the entries: `map.entrySet().stream().sorted(Map.Entry.comparingByValue())` (or `.reversed()` via `Collections.reverseOrder(...)`), and collect into a `LinkedHashMap` to keep the sorted order: `Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new)`. Ties can be broken with `thenComparing(Map.Entry.comparingByKey())`.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {42, 7, 19, 3, 88};
        Arrays.sort(numbers);
        System.out.println("Arrays.sort int[]: " + Arrays.toString(numbers));

        Integer[] boxed = {42, 7, 19, 3, 88};
        Arrays.sort(boxed, Comparator.reverseOrder());
        System.out.println("Arrays.sort Integer[] descending: " + Arrays.toString(boxed));

        String[] names = {"Meera", "Ravi", "Asha", "Neel", "Zoya"};
        Arrays.sort(names, Comparator.comparing(String::length));          // stable: equal lengths keep order
        System.out.println("Arrays.sort by length (stable): " + Arrays.toString(names));
        Arrays.sort(names, 0, 3);                                           // sort a range only
        System.out.println("sort range [0,3) alphabetically: " + Arrays.toString(names));

        Set<String> tags = new HashSet<>(List.of("spring", "java", "kafka", "docker"));
        System.out.println("Set sorted with TreeSet: " + new TreeSet<>(tags));
        TreeSet<String> byLength = new TreeSet<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        byLength.addAll(tags);
        System.out.println("Set sorted by length: " + byLength);
        System.out.println("Set sorted via stream: " + tags.stream().sorted(Comparator.reverseOrder()).toList());

        Map<String, Integer> scores = new HashMap<>(Map.of("Ravi", 72, "Asha", 91, "Neel", 72, "Meera", 85));
        System.out.println("Map by key (TreeMap): " + new TreeMap<>(scores));

        Map<String, Integer> byValueDesc = scores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        System.out.println("Map by value desc, ties by key: " + byValueDesc);

        Map<String, Integer> byValueAsc = new LinkedHashMap<>();
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(scores.entrySet());
        entries.sort(Map.Entry.<String, Integer>comparingByValue().thenComparing(Map.Entry.comparingByKey()));
        for (Map.Entry<String, Integer> e : entries) byValueAsc.put(e.getKey(), e.getValue());
        System.out.println("Map by value asc (no streams): " + byValueAsc);
    }
}`,
    walk:
      "Primitive arrays are sorted ascending with `Arrays.sort`; for descending order the program uses a boxed `Integer[]` and `Comparator.reverseOrder()`. Sorting names by length is stable, so \"Ravi\", \"Asha\", \"Neel\" and \"Zoya\" keep their original relative order; `Arrays.sort(names, 0, 3)` then sorts only the first three names alphabetically and leaves the rest alone.\n\nThe set of tags is sorted three ways: natural order with a TreeSet, by length with a comparator, and in reverse with a stream. The map is sorted by key with a `TreeMap`, and by value (descending, ties broken by key) by sorting its entries and collecting into a `LinkedHashMap`. The last version does the same without streams.",
    anim: [
      "Sorting a map by value",
      [
        ["map", "HashMap", "unsorted"],
        ["entries", "entrySet()", "key=value pairs"],
        ["sort", "sorted(...)", "comparingByValue"],
        ["lhm", "LinkedHashMap", "keeps order"],
        ["out", "sorted result", "Asha=91 ..."],
      ],
      [
        ["map", "entries", "view", "A map cannot be sorted in place, so take its entry set."],
        ["entries", "sort", "stream", "Sort the entries with Map.Entry.comparingByValue(), reversed for descending."],
        ["sort", "lhm", "collect", "Collect into a LinkedHashMap, which remembers insertion order."],
        ["lhm", "out", "iterate", "Iterating the LinkedHashMap now yields entries in value order."],
      ],
    ],
    mistakes: [
      "Collecting sorted entries with `Collectors.toMap()` without `LinkedHashMap::new`, which loses the order.",
      "Trying to pass a Comparator to `Arrays.sort(int[])`; it only works for object arrays.",
    ],
    qa: [
      ["How do you sort a HashMap by values?", "Stream its entrySet, sort with Map.Entry.comparingByValue(), and collect into a LinkedHashMap."],
      ["How do you sort a HashSet?", "Copy it into a TreeSet, or into a List and sort it, or stream it with sorted()."],
      ["Which algorithm does Arrays.sort use?", "Dual-pivot quicksort for primitive arrays and TimSort (stable merge sort) for object arrays."],
    ],
    ex: [
      "Get the top 2 scorers from `scores` as a list of names.",
      "`scores.entrySet().stream().sorted(Map.Entry.<String,Integer>comparingByValue().reversed()).limit(2).map(Map.Entry::getKey).toList()` returns [Asha, Meera].",
    ],
  }),

  lesson("Converting Between Arrays, Lists and Sets", {
    intro:
      "Data constantly moves between arrays, lists and sets: an API returns an array, you need a list to filter it, then a set to remove duplicates. Each conversion has a correct idiom and some traps, such as the fixed-size list from `Arrays.asList` and primitive arrays. This lesson covers every direction: array to list, list to array, array to set, set to array, list to set and set to list.",
    topics: [
      [
        "Array to List",
        "`Arrays.asList(array)` returns a fixed-size list backed by the array: `set` writes through to the array, `add` and `remove` throw. For an independent, growable list use `new ArrayList<>(Arrays.asList(array))`. `List.of(array)` creates an immutable copy (no nulls). For primitive arrays, `Arrays.asList(int[])` gives a list with one element (the array itself); use `Arrays.stream(ints).boxed().toList()`.",
      ],
      [
        "List to array",
        "`list.toArray(new String[0])` (preferred) or `list.toArray(String[]::new)` (Java 11) returns a typed array; plain `toArray()` returns `Object[]`. For primitives, `list.stream().mapToInt(Integer::intValue).toArray()`.",
      ],
      [
        "Array to Set and Set to array",
        "`new HashSet<>(Arrays.asList(array))`, `Set.of(array)` (throws on duplicates) or `Arrays.stream(array).collect(Collectors.toSet())`. Back with `set.toArray(new String[0])`. Use `LinkedHashSet` to keep the array's order while removing duplicates.",
      ],
      [
        "List to Set and Set to List",
        "`new HashSet<>(list)` removes duplicates (`new LinkedHashSet<>(list)` keeps first-occurrence order; `new TreeSet<>(list)` sorts). `new ArrayList<>(set)` turns a set into a list, which can then be sorted or indexed. `List.copyOf` and `Set.copyOf` create immutable copies.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        String[] array = {"java", "kotlin", "java", "scala"};

        List<String> fixed = Arrays.asList(array);
        fixed.set(0, "JAVA");                                     // writes through to the array
        System.out.println("Arrays.asList backed by array: array[0] = " + array[0]);
        try { fixed.add("groovy"); } catch (UnsupportedOperationException e) { System.out.println("Arrays.asList is fixed-size: add rejected"); }
        array[0] = "java";                                        // restore for the rest of the demo

        List<String> growable = new ArrayList<>(Arrays.asList(array));
        growable.add("groovy");
        System.out.println("independent ArrayList: " + growable);

        int[] primitives = {3, 1, 2};
        System.out.println("Arrays.asList(int[]) size = " + Arrays.asList(primitives).size() + " (the whole array is one element)");
        List<Integer> boxed = Arrays.stream(primitives).boxed().toList();
        System.out.println("int[] to List<Integer>: " + boxed);

        String[] back = growable.toArray(new String[0]);
        String[] back2 = growable.toArray(String[]::new);
        int[] backToInts = boxed.stream().mapToInt(Integer::intValue).toArray();
        System.out.println("List to array: " + Arrays.toString(back) + ", same as generator version: " + Arrays.equals(back, back2)
                + ", to int[]: " + Arrays.toString(backToInts));

        Set<String> set = new LinkedHashSet<>(Arrays.asList(array));     // array to set, keeps order
        System.out.println("array to LinkedHashSet: " + set);
        try { Set.of(array); } catch (IllegalArgumentException e) { System.out.println("Set.of(array) rejects duplicates: " + e.getMessage()); }
        String[] fromSet = set.toArray(new String[0]);
        System.out.println("set to array: " + Arrays.toString(fromSet));

        List<String> withDupes = List.of("b", "a", "b", "c", "a");
        System.out.println("list to HashSet size " + new HashSet<>(withDupes).size()
                + ", LinkedHashSet " + new LinkedHashSet<>(withDupes) + ", TreeSet " + new TreeSet<>(withDupes));
        List<String> fromSetToList = new ArrayList<>(new TreeSet<>(withDupes));
        System.out.println("set to list (index access): get(0) = " + fromSetToList.get(0)
                + ", stream toSet size: " + withDupes.stream().collect(Collectors.toSet()).size());
    }
}`,
    walk:
      "`Arrays.asList` wraps the array: setting element 0 changes the array itself, and adding throws because the size is fixed. Wrapping it in `new ArrayList<>(...)` gives an independent list. `Arrays.asList` on an `int[]` produces a list with a single element (the array), so primitive arrays need `stream().boxed()`.\n\nLists go back to arrays with `toArray(new String[0])` or `toArray(String[]::new)`, and to `int[]` with `mapToInt`. A `LinkedHashSet` removes the duplicate \"java\" while keeping the array's order, whereas `Set.of` refuses duplicates. Lists convert to sets that remove duplicates (unordered, ordered or sorted), and back to lists for index access.",
    anim: [
      "Conversion paths",
      [
        ["arr", "String[]", "array"],
        ["list", "List", "ArrayList"],
        ["set", "Set", "no duplicates"],
        ["fixed", "Arrays.asList", "fixed-size view"],
      ],
      [
        ["arr", "fixed", "asList", "Arrays.asList wraps the array: same storage, fixed size."],
        ["fixed", "list", "copy", "new ArrayList<>(...) copies it into an independent, growable list."],
        ["list", "set", "new HashSet", "Copying a list into a set removes duplicates."],
        ["set", "arr", "toArray", "toArray(new String[0]) turns any collection back into a typed array."],
      ],
    ],
    mistakes: [
      "Adding to the list returned by `Arrays.asList`.",
      "Calling `Arrays.asList` on a primitive array and expecting a list of numbers.",
      "Using `toArray()` without arguments and casting the `Object[]` to `String[]` (ClassCastException).",
    ],
    qa: [
      ["How do you convert an array to an ArrayList?", "`new ArrayList<>(Arrays.asList(array))`, or `Arrays.stream(array).collect(Collectors.toList())`."],
      ["What is special about the list from Arrays.asList?", "It is fixed-size and backed by the array: set writes through, add and remove throw UnsupportedOperationException."],
      ["How do you remove duplicates from a list while keeping order?", "`new ArrayList<>(new LinkedHashSet<>(list))` or `list.stream().distinct().toList()`."],
    ],
    ex: [
      "Convert `int[] a = {5, 3, 5, 1}` into a sorted array of unique values.",
      "`int[] unique = Arrays.stream(a).distinct().sorted().toArray();` gives [1, 3, 5].",
    ],
  }),

  lesson("Making Lists Thread-Safe: synchronizedList and ArrayList in Multithreading", {
    intro:
      "`ArrayList` is not thread-safe. When several threads modify one, elements disappear, `size` lies and exceptions appear. This lesson shows the consequences of sharing an ArrayList between threads, how `Collections.synchronizedList` fixes single operations, why iteration and compound actions still need explicit locking, and which alternatives to use.",
    topics: [
      [
        "ArrayList in multithreading: consequences",
        "`add` reads `size`, writes the element and increments `size`, three steps that can interleave between threads. Results: lost updates (two threads write the same slot), null gaps, a `size` larger than the number of real elements, `ArrayIndexOutOfBoundsException` during concurrent growth, and `ConcurrentModificationException` when one thread iterates while another writes.",
      ],
      [
        "Collections.synchronizedList",
        "Wraps a list so every method synchronizes on a mutex (the wrapper itself by default). Single calls such as `add`, `get` and `remove` become atomic and visible across threads. The underlying list must no longer be used directly.",
      ],
      [
        "Iteration and compound actions",
        "Iterating calls `hasNext`/`next` many times, so another thread can modify the list in between. The Javadoc requires `synchronized (list) { for (...) ... }` around iteration. Check-then-act sequences such as `if (!list.contains(x)) list.add(x)` also need the same lock.",
      ],
      [
        "Alternatives",
        "`CopyOnWriteArrayList` for read-mostly lists with rare writes (snapshot iteration, no locking for readers). `Vector` (legacy, synchronized). Concurrent queues (`ConcurrentLinkedQueue`, `LinkedBlockingQueue`) for producer-consumer data. Or confine the list to one thread and hand off results.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    static int runAdds(List<Integer> list, int threads, int perThread) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        int[] errors = {0};
        for (int t = 0; t < threads; t++) {
            pool.submit(() -> {
                start.await();
                for (int i = 0; i < perThread; i++) {
                    try { list.add(i); } catch (RuntimeException e) { synchronized (errors) { errors[0]++; } }
                }
                return null;
            });
        }
        start.countDown();
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        return errors[0];
    }

    public static void main(String[] args) throws Exception {
        List<Integer> plain = new ArrayList<>();
        int errors = runAdds(plain, 4, 25_000);
        System.out.println("ArrayList: expected 100000, got " + (plain.size() == 100_000 ? "100000" : "fewer or corrupt")
                + (errors > 0 ? ", plus internal exceptions" : ""));

        List<Integer> synced = Collections.synchronizedList(new ArrayList<>());
        runAdds(synced, 4, 25_000);
        System.out.println("synchronizedList: size " + synced.size());

        long sum = 0;
        synchronized (synced) {                         // required for safe iteration
            for (int n : synced) sum += n;
        }
        System.out.println("iterated under the list's lock, sum " + sum);

        List<String> unique = Collections.synchronizedList(new ArrayList<>());
        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int t = 0; t < 4; t++) pool.submit(() -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (unique) {                 // check-then-act needs the same lock
                    if (!unique.contains("id-" + (i % 100))) unique.add("id-" + (i % 100));
                }
            }
        });
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("check-then-act under lock keeps uniqueness: " + unique.size() + " ids");

        List<Integer> cow = new CopyOnWriteArrayList<>();
        runAdds(cow, 4, 2_500);
        System.out.println("CopyOnWriteArrayList: size " + cow.size() + " (safe, but each add copies the array)");
    }
}`,
    varies: true,
    walk:
      "`runAdds` starts four threads at the same instant (behind a latch) and has each add 25,000 numbers. The plain `ArrayList` ends up with fewer elements than expected or even throws internally, because concurrent `add` calls race on the size field and the array.\n\nThe `synchronizedList` ends with exactly 100,000 elements. Iterating it requires holding its lock, as the program does when summing. The \"unique ids\" part shows a check-then-act sequence that is correct only because `contains` and `add` run inside one synchronized block. `CopyOnWriteArrayList` is also safe but copies its array on every write.",
    anim: [
      "Why ArrayList.add races",
      [
        ["t1", "Thread 1", "read size = 5"],
        ["t2", "Thread 2", "read size = 5"],
        ["slot", "elementData[5]", "same slot"],
        ["size", "size = 6", "should be 7"],
        ["lock", "synchronizedList", "one at a time"],
      ],
      [
        ["t1", "slot", "write", "Thread 1 reads size 5 and writes its element into slot 5."],
        ["t2", "slot", "overwrite", "Thread 2 also read size 5 and overwrites the same slot: one element is lost."],
        ["slot", "size", "size++", "Both increment size, but from the same old value, so it ends at 6 instead of 7."],
        ["lock", "slot", "fix", "With a synchronized wrapper the steps of one add finish before the next starts."],
      ],
    ],
    mistakes: [
      "Iterating a synchronizedList without holding its lock.",
      "Keeping a reference to the underlying ArrayList and using it alongside the wrapper.",
      "Using CopyOnWriteArrayList for lists with frequent writes.",
    ],
    qa: [
      ["How do you make an ArrayList thread-safe?", "Wrap it with Collections.synchronizedList, use CopyOnWriteArrayList for read-mostly data, or confine it to one thread."],
      ["Is iteration over a synchronizedList thread-safe?", "No. You must synchronize on the list manually for the whole iteration."],
      ["What happens if multiple threads add to an ArrayList?", "Lost updates, wrong size, null gaps, ArrayIndexOutOfBoundsException during resize, and ConcurrentModificationException for concurrent iteration."],
    ],
    ex: [
      "Replace the synchronized check-then-act on `unique` with a simpler thread-safe structure.",
      "Use `Set<String> unique = ConcurrentHashMap.newKeySet();` and call `unique.add(\"id-\" + (i % 100))`; add is atomic and duplicates are ignored without manual locking.",
    ],
  }),

  lesson("Concurrent vs Non-Concurrent Collections", {
    intro:
      "For each classic collection there is a concurrent counterpart designed for safe use by many threads. This lesson compares four pairs: ArrayList vs CopyOnWriteArrayList, HashSet vs CopyOnWriteArraySet, TreeSet vs ConcurrentSkipListSet, and TreeMap vs ConcurrentSkipListMap, explaining how each concurrent version works and when to use it.",
    topics: [
      [
        "ArrayList vs CopyOnWriteArrayList",
        "CopyOnWriteArrayList makes a fresh copy of its array on every write (under a lock), while reads use the current array without locking. Iterators work on the snapshot they started with: no ConcurrentModificationException, but no `remove` either. Excellent for read-mostly lists such as listener lists; terrible for write-heavy data.",
      ],
      [
        "HashSet vs CopyOnWriteArraySet",
        "CopyOnWriteArraySet is backed by a CopyOnWriteArrayList, so `add` and `contains` are O(n) (it checks duplicates by scanning). It is thread-safe with snapshot iteration and insertion order. Use it only for small sets that rarely change; for general concurrent sets use `ConcurrentHashMap.newKeySet()`.",
      ],
      [
        "TreeSet vs ConcurrentSkipListSet",
        "ConcurrentSkipListSet keeps elements sorted using a skip list (layers of linked lists that allow O(log n) search) with lock-free CAS updates. It supports the full NavigableSet API, weakly consistent iterators and no nulls. TreeSet is a red-black tree and not thread-safe.",
      ],
      [
        "TreeMap vs ConcurrentSkipListMap",
        "ConcurrentSkipListMap is the concurrent sorted map: O(log n) operations, lock-free, NavigableMap methods, atomic `putIfAbsent`, `compute` and `merge`, weakly consistent iteration. Use it when you need sorted keys and concurrency, for example an order book or time-indexed events.",
      ],
      [
        "General differences",
        "Non-concurrent collections are faster in single-threaded code, have fail-fast iterators and need external locking for sharing. Concurrent collections are thread-safe internally, have fail-safe or weakly consistent iterators, often provide atomic compound methods, and usually reject nulls.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    static int parallelAdd(Collection<Integer> target, int threads, int each) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(threads, r -> {   // daemon: a corrupted
            Thread t = new Thread(r);                                          // TreeSet can loop forever
            t.setDaemon(true);
            return t;
        });
        int[] failures = {0};
        for (int t = 0; t < threads; t++) {
            int base = t * each;
            pool.submit(() -> {
                for (int i = 0; i < each; i++) {
                    try { target.add(base + i); } catch (RuntimeException e) { synchronized (failures) { failures[0]++; } }
                }
            });
        }
        pool.shutdown();
        if (!pool.awaitTermination(3, TimeUnit.SECONDS)) return -1;            // threads stuck: corrupted structure
        return failures[0];
    }

    public static void main(String[] args) throws Exception {
        TreeSet<Integer> tree = new TreeSet<>();
        int treeErrors = parallelAdd(tree, 4, 5_000);
        ConcurrentSkipListSet<Integer> skip = new ConcurrentSkipListSet<>();
        parallelAdd(skip, 4, 5_000);
        System.out.println("TreeSet from 4 threads correct: " + (treeErrors == 0 && tree.size() == 20_000)
                + (treeErrors == -1 ? " (threads stuck in a corrupted tree)" : "")
                + "; ConcurrentSkipListSet size " + skip.size() + ", sorted: first " + skip.first() + " last " + skip.last());

        ConcurrentSkipListMap<Integer, String> orderBook = new ConcurrentSkipListMap<>();
        orderBook.put(101, "sell 5"); orderBook.put(99, "buy 3"); orderBook.put(100, "buy 7");
        System.out.println("ConcurrentSkipListMap sorted: " + orderBook + ", ceilingKey(100) " + orderBook.ceilingKey(100)
                + ", headMap(100) " + orderBook.headMap(100));
        orderBook.merge(100, " +2", String::concat);
        System.out.println("atomic merge: " + orderBook.get(100));

        List<String> listeners = new CopyOnWriteArrayList<>(List.of("logger", "metrics"));
        for (String l : listeners) listeners.add(l + "-copy");          // snapshot iteration
        System.out.println("CopyOnWriteArrayList after adding during iteration: " + listeners);

        Set<String> cowSet = new CopyOnWriteArraySet<>(List.of("b", "a", "b"));
        cowSet.add("a");
        System.out.println("CopyOnWriteArraySet keeps insertion order, no duplicates: " + cowSet);

        Set<Integer> chmSet = ConcurrentHashMap.newKeySet();
        parallelAdd(chmSet, 4, 5_000);
        System.out.println("ConcurrentHashMap.newKeySet() size " + chmSet.size() + " (O(1) concurrent set)");

        try { skip.add(null); } catch (NullPointerException e) { System.out.println("concurrent sorted set rejects null"); }
    }
}`,
    varies: true,
    walk:
      "Four threads add 5,000 distinct numbers each. The plain `TreeSet` usually ends up corrupted or short because tree rotations interleave; threads can even get stuck looping in the broken tree, which is why the program uses daemon threads and a time limit, while the `ConcurrentSkipListSet` holds exactly 20,000 sorted elements.\n\nThe `ConcurrentSkipListMap` acts as a small order book: keys stay sorted, navigation methods work, and `merge` updates a value atomically. The `CopyOnWriteArrayList` lets the loop add elements while iterating its snapshot. `CopyOnWriteArraySet` keeps insertion order without duplicates, and `ConcurrentHashMap.newKeySet()` is the scalable general-purpose concurrent set.",
    anim: [
      "Concurrent counterparts",
      [
        ["al", "ArrayList", "not safe"],
        ["cow", "CopyOnWrite...", "copy on write"],
        ["ts", "TreeSet/Map", "not safe"],
        ["skip", "ConcurrentSkip..", "lock-free sorted"],
        ["hs", "HashSet", "not safe"],
        ["kset", "newKeySet()", "CHM-backed"],
      ],
      [
        ["al", "cow", "read-mostly", "Replace a shared read-mostly ArrayList with CopyOnWriteArrayList."],
        ["ts", "skip", "sorted", "Replace TreeSet or TreeMap with ConcurrentSkipListSet or Map for sorted concurrency."],
        ["hs", "kset", "set", "Replace HashSet with ConcurrentHashMap.newKeySet() for a fast concurrent set."],
        ["cow", "skip", "trade-offs", "Each concurrent version trades some speed or memory for thread safety."],
      ],
    ],
    mistakes: [
      "Using CopyOnWriteArraySet for large sets (O(n) operations).",
      "Assuming concurrent collections make multi-step operations atomic; use their atomic methods.",
    ],
    qa: [
      ["What is the difference between ArrayList and CopyOnWriteArrayList?", "CopyOnWriteArrayList is thread-safe by copying the array on every write and gives snapshot iterators; ArrayList is unsynchronized with fail-fast iterators."],
      ["What is a skip list?", "A sorted linked structure with several levels of express lanes that gives O(log n) search, insert and delete; Java uses it for ConcurrentSkipListMap and Set."],
      ["What is the concurrent alternative to TreeMap?", "ConcurrentSkipListMap."],
    ],
    ex: [
      "An event bus has 5 listeners registered at startup and receives 10,000 events per second, each delivered to every listener. Which list type should hold the listeners?",
      "CopyOnWriteArrayList: reads (iterating listeners) vastly outnumber writes (registrations), iteration needs no locking and is safe even if a listener registers during delivery.",
    ],
  }),

  lesson("Collection Framework Interview Questions", {
    intro:
      "Collections are the most heavily tested topic in Java interviews. This lesson gathers the most frequently asked questions with concise answers, covering internals, comparisons, thread safety, and puzzles. The program verifies several of the trickier answers.",
    topics: [
      [
        "Internals questions",
        "How HashMap works (hash, buckets, equals, treeify at 8, resize at 0.75); why capacity is a power of two; how HashSet uses HashMap; how TreeMap orders keys (red-black tree); how ArrayList grows (1.5x) and Vector (2x); how LinkedHashMap keeps order (doubly linked entries); how ConcurrentHashMap achieves concurrency (segments before Java 8, CAS and bin locks after).",
      ],
      [
        "Comparison questions",
        "ArrayList vs LinkedList; ArrayList vs Vector; HashMap vs Hashtable; HashMap vs ConcurrentHashMap; HashMap vs LinkedHashMap vs TreeMap; HashSet vs LinkedHashSet vs TreeSet; Iterator vs ListIterator vs Enumeration; Comparable vs Comparator; Collection vs Collections; fail-fast vs fail-safe; List vs Set; Array vs ArrayList (fixed size, primitives, generics).",
      ],
      [
        "Puzzle questions",
        "What happens when you put a mutable key and change it; `remove(int)` vs `remove(Object)` on `List<Integer>`; what `Arrays.asList(...).add` does; whether `TreeSet` calls `equals`; whether `HashMap` allows null keys; what `Set.of` does with duplicates; why `List.of(...).contains(null)` throws.",
      ],
      [
        "Design questions",
        "Which collection for an LRU cache (LinkedHashMap with access order); for a leaderboard (TreeMap or PriorityQueue); for unique visitors (HashSet or a probabilistic structure); for a task queue between threads (BlockingQueue); for read-mostly listeners (CopyOnWriteArrayList); for counting words concurrently (ConcurrentHashMap with merge or LongAdder).",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
        list.remove(1);
        list.remove(Integer.valueOf(10));
        System.out.println("1) remove(int) vs remove(Object): " + list);

        TreeSet<String> set = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        set.add("Java"); set.add("JAVA");
        System.out.println("2) TreeSet uses compareTo, not equals: size " + set.size());

        try { List.of(1, 2).contains(null); } catch (NullPointerException e) { System.out.println("3) List.of(...).contains(null) throws NullPointerException"); }
        try { Set.of("a", "a"); } catch (IllegalArgumentException e) { System.out.println("4) Set.of with duplicates: IllegalArgumentException"); }

        Map<List<Integer>, String> map = new HashMap<>();
        List<Integer> key = new ArrayList<>(List.of(1));
        map.put(key, "one");
        key.add(2);
        System.out.println("5) mutated key lookup: " + map.get(key) + ", size still " + map.size());

        Map<String, Integer> nulls = new HashMap<>();
        nulls.put(null, 1);
        System.out.println("6) HashMap null key: " + nulls.get(null));

        Integer[] boxedArray = {3, 1, 2};
        List<Integer> view = Arrays.asList(boxedArray);
        Collections.sort(view);
        System.out.println("7) sorting Arrays.asList view sorts the array: " + Arrays.toString(boxedArray));

        PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 4, 2));
        StringBuilder order = new StringBuilder();
        while (!pq.isEmpty()) order.append(pq.poll()).append(' ');
        System.out.println("8) PriorityQueue polls in priority order: " + order.toString().trim());

        Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
            @Override protected boolean removeEldestEntry(Map.Entry<String, Integer> e) { return size() > 2; }
        };
        lru.put("a", 1); lru.put("b", 2); lru.get("a"); lru.put("c", 3);
        System.out.println("9) LRU cache keeps: " + lru.keySet());
    }
}`,
    walk:
      "Each numbered line verifies one interview answer. `remove(1)` removes by index and `remove(Integer.valueOf(10))` by value. A case-insensitive TreeSet keeps one of \"Java\"/\"JAVA\" because it relies on the comparator. Immutable `List.of` rejects even a `contains(null)` query, and `Set.of` rejects duplicate elements.\n\nMutating a key after insertion makes it unfindable. HashMap accepts a null key. Sorting the list view from `Arrays.asList` sorts the underlying array. A PriorityQueue releases elements in priority order, not insertion order, and a LinkedHashMap with access order and `removeEldestEntry` evicts the least recently used entry.",
    anim: [
      "Classic collection traps",
      [
        ["rm", "remove(1)", "index or value?"],
        ["tree", "TreeSet", "comparator dup"],
        ["mut", "mutable key", "lost entry"],
        ["asl", "Arrays.asList", "fixed view"],
        ["ans", "know the rules", "interview"],
      ],
      [
        ["rm", "ans", "overload", "remove(int) removes by index; box the value to remove by value."],
        ["tree", "ans", "compareTo", "Sorted sets decide duplicates with compareTo or the comparator."],
        ["mut", "ans", "hash", "Changing a key's hash after insertion strands the entry in the wrong bucket."],
        ["asl", "ans", "backed", "Arrays.asList is fixed-size and writes through to the array."],
      ],
    ],
    mistakes: [
      "Memorising answers without understanding internals; follow-up questions always dig into how it works.",
      "Forgetting Java version differences (Java 7 vs 8 HashMap and ConcurrentHashMap).",
    ],
    qa: [
      ["How does HashMap handle collisions?", "Entries in the same bucket form a linked list, converted to a red-black tree when the bucket has 8 or more nodes and the table has at least 64 buckets."],
      ["What is the difference between Array and ArrayList?", "Arrays are fixed-size, can hold primitives and have a length field; ArrayList is resizable, holds objects only, uses generics and offers rich methods."],
      ["How do you make a collection read-only?", "Collections.unmodifiableX (a view) or List.copyOf / List.of (immutable copies)."],
      ["What is the difference between poll() and remove() in Queue?", "Both remove the head; poll returns null when empty, remove throws NoSuchElementException."],
      ["What is the difference between peek() and element()?", "Both return the head without removing it; peek returns null when empty, element throws."],
      ["Why should you override equals and hashCode for HashMap keys?", "So that equal keys hash to the same bucket and are found by equals; otherwise lookups with new but equal keys fail."],
      ["Which collection would you use to implement a leaderboard?", "A TreeMap or TreeSet sorted by score (with a tie-break), or a PriorityQueue for top-k."],
    ],
    ex: [
      "What does `new ArrayList<>(List.of(1, 2, 3)).subList(0, 2).clear()` do to the original list?",
      "subList is a view, so clearing it removes elements 1 and 2 from the backing list, leaving [3].",
    ],
  }),
]);
