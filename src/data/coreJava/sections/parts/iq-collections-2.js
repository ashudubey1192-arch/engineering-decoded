import { lesson } from "../../schema.js";

export default [
  lesson("Collections Q29-Q37: Iterating and Sorting Lists, Sets, Maps and Arrays", {
    intro:
      "Questions 29 to 37 are practical:\n\n- all the ways to iterate a List, a Set and a Map (keys, values and entries)\n- sorting a List with Comparable and Comparator, and how `Collections.sort` works internally\n- sorting a HashMap by keys and by values\n- sorting a Set\n- sorting arrays, including one Comparator written for a superclass and used for subclasses\n\nThe program shows every technique side by side.",
    topics: [
      [
        "Q29. In how many ways can you iterate a List?",
        "There are seven common ways:\n\n1. A classic `for (int i = 0; i < list.size(); i++)` with `get(i)`. Fast for ArrayList, slow (O(n²)) for LinkedList.\n2. An enhanced for-each loop, which uses the Iterator.\n3. An explicit `Iterator`, which is needed for safe `remove()`.\n4. A `ListIterator`, forwards or backwards, with `set` and `add`.\n5. `list.forEach(lambda)` (Java 8).\n6. `list.stream()` (or `parallelStream()`), with `forEach` or other operations.\n7. The legacy `Enumeration`, via `Collections.enumeration(list)` or Vector's `elements()`.\n\nSince Java 21, `list.reversed()` gives a reverse-ordered view to loop over.",
      ],
      [
        "Q30. How do you iterate a Set?",
        "A Set has no index, so the options are:\n\n- a for-each loop\n- an `Iterator` (for removal during iteration)\n- `set.forEach(...)`\n- `set.stream()`\n- for NavigableSets, `descendingIterator()` or `descendingSet()` for reverse order\n\nThe order you see depends on the implementation: none for HashSet, insertion order for LinkedHashSet, sorted for TreeSet. Converting to an array (`toArray`) or a List also works when you need indexes.",
      ],
      [
        "Q31. How do you iterate a Map's keys, values and entries?",
        "- `for (K k : map.keySet())` gives the keys.\n- `for (V v : map.values())` gives the values.\n- `for (Map.Entry<K, V> e : map.entrySet())` gives both through `e.getKey()` and `e.getValue()`. This is the most efficient way when you need both, because it avoids a second lookup per key.\n- `map.forEach((k, v) -> ...)` (Java 8).\n- An Iterator over `entrySet()`, so you can call `it.remove()`.\n- `entrySet().stream()` for filtering and sorting.\n\nFor a TreeMap, `descendingMap()` iterates in reverse key order.",
      ],
      [
        "Q32. How do Comparable and Comparator sort a List?",
        "`Collections.sort(list)` or `list.sort(null)` uses each element's **Comparable** natural order (`compareTo`), and the elements must implement Comparable or a ClassCastException is thrown. `Collections.sort(list, comparator)` or `list.sort(comparator)` uses a **Comparator** instead. Comparators compose:\n\n- `Comparator.comparing(Employee::dept).thenComparing(Employee::salary, Comparator.reverseOrder())`\n- `Comparator.nullsFirst(...)`\n- `.reversed()`\n\nBoth sorts are **stable**: equal elements keep their relative order. That is why sorting by a secondary key first and the primary key second works.",
      ],
      [
        "Q33. How does Collections.sort work internally?",
        "Since Java 8, `Collections.sort(list, c)` simply calls `list.sort(c)`. For ArrayList this sorts the backing array in place. Other lists are copied to an array with `toArray()`, the array is sorted with `Arrays.sort(array, c)`, and the elements are written back through a ListIterator. For object arrays, Arrays.sort uses **TimSort**: a stable, adaptive merge sort (from Python) that finds existing ordered runs, uses binary insertion sort for small runs, and merges runs with galloping. It runs in O(n log n) worst case and O(n) on already-sorted data. Primitive arrays use dual-pivot quicksort instead, which is not stable, but stability does not matter for primitives.",
      ],
      [
        "Q34. How do you sort a HashMap by its keys?",
        "A HashMap has no order, so copy it into a sorted structure:\n\n- `new TreeMap<>(map)` sorts by natural key order. Pass a comparator for custom order: `new TreeMap<>(Comparator.reverseOrder())` and then `putAll(map)`.\n- With streams: `map.entrySet().stream().sorted(Map.Entry.comparingByKey()).collect(toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new))`. Collecting into a **LinkedHashMap** keeps the sorted order.\n\nCollecting into a plain HashMap would lose the order again.",
      ],
      [
        "Q35. How do you sort a HashMap by its values?",
        "A TreeMap cannot sort by value, because its comparator sees only keys, and a value comparator would also drop keys with equal values. Instead:\n\n1. Take `entrySet()` into a `List<Map.Entry<K, V>>`.\n2. Sort it with `Map.Entry.comparingByValue()`, or `comparingByValue(Comparator.reverseOrder())` for descending.\n3. Put the entries into a LinkedHashMap.\n\nWith streams the whole thing is one pipeline: `.sorted(Map.Entry.comparingByValue())`, collected with `toMap(..., LinkedHashMap::new)`. Add `.thenComparing(Map.Entry.comparingByKey())` to break ties deterministically.",
      ],
      [
        "Q36. How do you sort a Set?",
        "A HashSet cannot be sorted in place, because it has no order. The options:\n\n- **Copy into a TreeSet**: `new TreeSet<>(set)`, or with a comparator `new TreeSet<>(comparator)` and then `addAll`. Duplicates are already gone and the result stays sorted as you add.\n- **Copy into a List and sort it**: `List<E> list = new ArrayList<>(set); Collections.sort(list);`. Use this when you only need a sorted snapshot.\n- **Stream**: `set.stream().sorted().toList()`.\n\nA LinkedHashSet keeps insertion order, so adding already-sorted elements to it keeps them sorted.",
      ],
      [
        "Q37. How do you sort arrays, and can a superclass Comparator sort subclasses?",
        "Primitive arrays: `Arrays.sort(int[])`, or `Arrays.sort(a, from, to)` for a range, and `Arrays.parallelSort` for large arrays. Object arrays: `Arrays.sort(T[])` (natural order) or `Arrays.sort(T[], Comparator<? super T>)`.\n\nThat `? super T` is the answer to the second part: a `Comparator<Employee>` can sort a `Manager[]` or a `List<Manager>` when Manager extends Employee, because anything that can compare two Employees can compare two Managers. This is the PECS rule (producer extends, consumer super) at work: the comparator *consumes* T values. A descending sort of a primitive array needs boxing (`Integer[]` with `Collections.reverseOrder()`) or a manual reverse after sorting.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.stream.*;

public class Main {
    static class Employee {
        final String name; final int salary;
        Employee(String name, int salary) { this.name = name; this.salary = salary; }
        public String toString() { return getClass().getSimpleName() + "(" + name + "," + salary + ")"; }
    }
    static class Manager extends Employee {
        Manager(String name, int salary) { super(name, salary); }
    }

    record Student(String name, int grade) implements Comparable<Student> {
        public int compareTo(Student o) { return name.compareTo(o.name); }   // natural order: by name
    }

    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("red", "green", "blue"));

        // Q29: seven ways over one list.
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < list.size(); i++) out.append(list.get(i).charAt(0));        // 1 index loop
        for (String s : list) out.append(s.charAt(0));                                  // 2 for-each
        for (Iterator<String> it = list.iterator(); it.hasNext(); ) out.append(it.next().charAt(0)); // 3 Iterator
        for (ListIterator<String> it = list.listIterator(list.size()); it.hasPrevious(); ) out.append(it.previous().charAt(0)); // 4 backwards
        list.forEach(s -> out.append(s.charAt(0)));                                    // 5 forEach
        out.append(list.stream().map(s -> s.substring(0, 1)).collect(Collectors.joining())); // 6 stream
        for (Enumeration<String> e = Collections.enumeration(list); e.hasMoreElements(); ) out.append(e.nextElement().charAt(0)); // 7
        System.out.println("Q29 seven passes: " + out);

        // Q30: Set iteration orders.
        Set<Integer> tree = new TreeSet<>(List.of(5, 1, 3));
        StringBuilder down = new StringBuilder();
        ((TreeSet<Integer>) tree).descendingIterator().forEachRemaining(down::append);
        System.out.println("Q30 TreeSet ascending " + tree + ", descending " + down);

        // Q31: keys, values, entries, forEach and safe removal.
        Map<String, Integer> stock = new TreeMap<>(Map.of("apple", 3, "kiwi", 0, "mango", 7));
        StringBuilder entries = new StringBuilder();
        for (Map.Entry<String, Integer> e : stock.entrySet()) entries.append(e.getKey()).append('=').append(e.getValue()).append(' ');
        stock.entrySet().removeIf(e -> e.getValue() == 0);                            // remove while iterating safely
        System.out.println("Q31 keys " + stock.keySet() + ", values " + stock.values() + ", entries " + entries.toString().trim());

        // Q32: Comparable vs Comparator, and stability.
        List<Student> students = new ArrayList<>(List.of(new Student("Meera", 2), new Student("Arjun", 1), new Student("Dev", 2)));
        Collections.sort(students);
        System.out.println("Q32 natural (name): " + students);
        students.sort(Comparator.comparingInt(Student::grade));                        // stable: names stay sorted within a grade
        System.out.println("Q32 by grade, stable: " + students);

        // Q33: Collections.sort delegates to List.sort, which sorts an array with TimSort.
        List<Integer> linked = new LinkedList<>(List.of(9, 2, 7));
        Collections.sort(linked);
        System.out.println("Q33 LinkedList sorted via array copy: " + linked);

        // Q34 + Q35: sort a HashMap by key and by value.
        Map<String, Integer> scores = new HashMap<>(Map.of("zara", 70, "amit", 90, "bina", 70, "ravi", 85));
        System.out.println("Q34 by key " + new TreeMap<>(scores));
        Map<String, Integer> byValue = scores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))                      // tie-break on key
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        System.out.println("Q35 by value desc " + byValue);

        // Q36: sort a HashSet.
        Set<String> tags = new HashSet<>(List.of("java", "c", "go", "rust"));
        List<String> sortedTags = new ArrayList<>(tags);
        sortedTags.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        System.out.println("Q36 TreeSet " + new TreeSet<>(tags) + ", by length " + sortedTags);

        // Q37: arrays, descending primitives, and a superclass comparator for a subclass array.
        int[] numbers = {5, 3, 9, 1};
        Arrays.sort(numbers);
        Integer[] boxed = {5, 3, 9, 1};
        Arrays.sort(boxed, Collections.reverseOrder());
        Comparator<Employee> bySalary = Comparator.comparingInt(e -> e.salary);      // written for Employee
        Manager[] managers = {new Manager("Om", 300), new Manager("Ila", 100), new Manager("Raj", 200)};
        Arrays.sort(managers, bySalary);                                               // accepted: Comparator<? super Manager>
        System.out.println("Q37 " + Arrays.toString(numbers) + ", desc " + Arrays.toString(boxed) + ", managers " + Arrays.toString(managers));
    }
}`,
    walk:
      "Q29 walks the same list seven ways, appending each element's first letter. Every pass prints \"rgb\" except the ListIterator pass, which runs backwards and prints \"bgr\". Q30 prints a TreeSet both ways. Q31 collects the entries first, then removes the zero-stock entry with `removeIf`, the safe way to delete while iterating.\n\nQ32 sorts students by name (Comparable), then by grade (Comparator). Because the sort is stable, Dev stays before Meera inside grade 2. Q33 sorts a LinkedList, which is copied into an array, sorted and written back. Q34 sorts a HashMap by key with a TreeMap. Q35 sorts by value descending with a key tie-break, collected into a LinkedHashMap so the order survives. Q37 sorts primitives ascending, boxed Integers descending, and a Manager array with a Comparator written for Employee.",
    anim: [
      "Sorting a HashMap by value",
      [
        ["map", "HashMap", "no order"],
        ["entries", "entrySet()", "stream of entries"],
        ["cmp", "comparingByValue", "desc, then key"],
        ["lhm", "LinkedHashMap", "keeps the order"],
      ],
      [
        ["map", "entries", "entrySet", "Take the map's entries, the only place where keys and values travel together."],
        ["entries", "cmp", "sorted(...)", "Sort with comparingByValue(reverseOrder()), then comparingByKey for ties."],
        ["cmp", "lhm", "toMap(...)", "Collect into a LinkedHashMap supplier, so insertion order equals sorted order."],
        ["lhm", "map", "not HashMap!", "Collecting into a plain HashMap would scramble the order again."],
      ],
    ],
    mistakes: [
      "Using an index loop over a LinkedList. Each `get(i)` walks the nodes, so the whole loop is O(n²).",
      "Collecting a sorted stream into `Collectors.toMap(k, v)` with no map supplier. The default HashMap loses the order.",
      "Using a TreeMap with a value-based comparator to \"sort by value\". Equal values collapse into one entry.",
    ],
    qa: [
      [
        "Is Collections.sort stable?",
        "Yes. Sorting objects uses TimSort, which never reorders equal elements. Arrays.sort on primitives uses dual-pivot quicksort, which is not stable, but stability is meaningless for primitives.",
      ],
      [
        "How do you sort in descending order with a Comparator?",
        "Use `Comparator.reverseOrder()` for natural order, `comparator.reversed()` for a custom one, or `Collections.reverseOrder(cmp)`.",
      ],
      [
        "Which is faster for iterating a map, keySet with get or entrySet?",
        "entrySet. keySet plus `get(k)` performs one extra hash lookup for every key.",
      ],
    ],
    ex: [
      "Sort a `List<Employee>` by department ascending, then salary descending, then name ascending, using only Comparator methods.",
      "`list.sort(Comparator.comparing(Employee::dept).thenComparing(Employee::salary, Comparator.reverseOrder()).thenComparing(Employee::name));`",
    ],
  }),

  lesson("Collections Q38-Q53: Concurrent Collections and Choosing Collections for Multithreading", {
    intro:
      "Questions 38 to 53 complete the first collection set. They cover:\n\n- the concurrent versions of ArrayList, HashSet, TreeSet and TreeMap\n- null handling in TreeSet and TreeMap\n- how ConcurrentHashMap works\n- what goes wrong when ArrayList is shared between threads, and what Vector does better\n- a summary of the properties of all the collection classes\n- which List, Set and Map to pick for multithreaded code\n- a multi-user dictionary design\n- why WeakHashMap exists\n\nQuestion 42 is not present in the original list, so the numbering jumps from 41 to 43.",
    topics: [
      [
        "Q38. What is the difference between ArrayList and CopyOnWriteArrayList?",
        "CopyOnWriteArrayList is thread-safe. Writes lock, copy the whole array, modify the copy and publish it through a volatile reference. Reads and iteration take no lock and see an immutable snapshot, so iterators never throw ConcurrentModificationException and do not support `remove`. ArrayList is unsynchronized, has fail-fast iterators and is much cheaper to write to. Choose COWAL for read-mostly lists such as listener or configuration lists.",
      ],
      [
        "Q39. What is the difference between HashSet and CopyOnWriteArraySet?",
        "HashSet is a hash table with O(1) operations, no order and fail-fast iterators, and it is not thread-safe. CopyOnWriteArraySet is built on CopyOnWriteArrayList. It is thread-safe, keeps insertion order and has snapshot iterators, but `add` and `contains` are O(n) (a linear scan through `addIfAbsent`), and each write copies the array. It suits small sets that rarely change.",
      ],
      [
        "Q40. What is the difference between TreeSet and ConcurrentSkipListSet?",
        "Both are sorted NavigableSets with O(log n) operations that reject null. TreeSet is a red-black tree and not thread-safe, and its iterators are fail-fast. ConcurrentSkipListSet is a lock-free skip list. Many threads can insert and remove concurrently, and its iterators are weakly consistent. Note that its `size()` is O(n), because it has to traverse the list.",
      ],
      [
        "Q41. What is the difference between TreeMap and ConcurrentSkipListMap?",
        "TreeMap is a sorted red-black tree map for one thread. It allows a null key only with a comparator that handles null, and it is fail-fast. ConcurrentSkipListMap is a concurrent sorted map: lock-free reads and writes, atomic `putIfAbsent`, `replace` and `remove(k, v)`, weakly consistent iterators and views, and no null keys or values. Use it for shared sorted data such as a price ladder or a time index.",
      ],
      [
        "Q43. Can you add null to a TreeSet?",
        "Not with natural ordering. Since Java 7, the very first `add(null)` to an empty TreeSet throws NullPointerException, because `compareTo` must be called on the element. In Java 6 the first null was accepted and every later add then failed. With a null-tolerant comparator, `new TreeSet<>(Comparator.nullsFirst(Comparator.naturalOrder()))`, null is allowed and sorts first.",
      ],
      [
        "Q44. Can a TreeMap have a null key?",
        "Same rule: with natural ordering, `put(null, v)` throws NullPointerException, and so do `get(null)` and `containsKey(null)`. Null **values** are always allowed. A comparator such as `Comparator.nullsFirst(...)` makes null keys legal. HashMap and LinkedHashMap allow one null key without any comparator.",
      ],
      [
        "Q45. How does ConcurrentHashMap work?",
        "Since Java 8 it is a table of bins with volatile node fields:\n\n- `get` never locks.\n- `put` into an empty bin is a CAS.\n- `put` into an occupied bin synchronizes on the bin's head node, so it locks just that bin.\n- Long bins (8 or more entries, table of 64 or more) become red-black trees (TreeBins).\n- The size is tracked with CounterCells, similar to LongAdder.\n- Resizing moves bins in parallel, and threads that encounter a ForwardingNode help.\n- `computeIfAbsent`, `compute` and `merge` run atomically per key.\n\nJava 7 used 16 Segments (each a small locked hash table), which limited the parallelism to the concurrency level.",
      ],
      [
        "Q46. What happens when an ArrayList is used by several threads?",
        "Several things can go wrong:\n\n- **Lost updates**: two threads write to the same `size` slot, so the size ends up lower than the number of adds.\n- **Corrupted state**: an `ArrayIndexOutOfBoundsException` happens inside `add` during an unsynchronized resize, or a `null` lands in the middle of the list.\n- **ConcurrentModificationException**: one thread iterates while another adds.\n- **Visibility problems**: a reader may not see writes at all.\n\nThe program demonstrates this safely: it counts lost adds without failing the run.",
      ],
      [
        "Q47. What advantage does Vector have in multithreaded code?",
        "Each Vector method is synchronized on the Vector, so individual operations such as `add`, `get` and `remove` are atomic and visible across threads. Concurrent adds never lose elements or corrupt the array. The same program run on a Vector always ends with the exact count. **Compound** actions (check-then-add, iterate-while-others-modify) still need external locking on the Vector, and the global lock limits scalability. `Collections.synchronizedList` gives the same guarantee for any List.",
      ],
      [
        "Q48. What are the properties of the main collection classes?",
        "- **ArrayList**: ordered, allows duplicates and nulls, fast random access, not synchronized, fail-fast.\n- **LinkedList**: same as ArrayList but with O(1) operations at the ends, and it is a Deque.\n- **Vector and Stack**: synchronized legacy lists.\n- **HashSet**: unordered, unique, one null.\n- **LinkedHashSet**: insertion order.\n- **TreeSet**: sorted, no null.\n- **HashMap**: unordered, one null key.\n- **LinkedHashMap**: insertion or access order.\n- **TreeMap**: sorted keys, no null key.\n- **Hashtable**: synchronized, no nulls.\n- **ConcurrentHashMap**: concurrent, no nulls, weakly consistent.\n- **CopyOnWrite collections**: snapshot iteration.\n- **PriorityQueue**: a heap ordered by priority, no null.\n- **ArrayDeque**: a resizable circular array, no null.",
      ],
      [
        "Q49. Which List should you use in a multithreaded environment?",
        "Use **CopyOnWriteArrayList** when reads and iterations far outnumber writes (listeners, configuration). Use **`Collections.synchronizedList(new ArrayList<>())`** for a balanced mix, and lock it manually while iterating: `synchronized (list) { for (...) }`. If the list is really a work queue, use a **BlockingQueue** (LinkedBlockingQueue or ArrayBlockingQueue) or a **ConcurrentLinkedQueue** instead. Vector works but is legacy.",
      ],
      [
        "Q50. Which Set should you use in a multithreaded environment?",
        "- **`ConcurrentHashMap.newKeySet()`** (or `keySet(defaultValue)`): a scalable concurrent hash set and the usual answer.\n- **ConcurrentSkipListSet**: when the elements must be sorted.\n- **CopyOnWriteArraySet**: small, read-mostly sets.\n- **`Collections.synchronizedSet`**: a quick wrapper with one global lock.\n\nThere is no class named ConcurrentHashSet in the JDK.",
      ],
      [
        "Q51. Which Map should you use in a multithreaded environment?",
        "**ConcurrentHashMap** is the default concurrent map, with high read and write concurrency and atomic compute and merge methods. **ConcurrentSkipListMap** is the choice when keys must stay sorted or you need range queries. **`Collections.synchronizedMap`** wraps any map with one lock, so it is simple but contended. **Hashtable** is legacy and should be avoided. For caches with eviction, use a library such as Caffeine.",
      ],
      [
        "Q52. Design a dictionary where many users read and some edit. Which two classes would you use?",
        "Store the words in a **ConcurrentHashMap<String, String>**, so that lookups run lock-free in parallel and edits lock only one bin. Each edit is atomic with `put`, `merge` or `compute`. If you also need alphabetical browsing or prefix search, use a **ConcurrentSkipListMap** instead: `subMap(prefix, prefix + Character.MAX_VALUE)` returns every word with that prefix.\n\nAn alternative pairing is a `HashMap` guarded by a **ReentrantReadWriteLock**. Many readers can then hold the read lock at once, while a writer takes the exclusive write lock.",
      ],
      [
        "Q53. Why do we need WeakHashMap?",
        "To attach data to objects **without keeping those objects alive**. In a normal HashMap, a key stays strongly reachable for as long as the map exists, so cached metadata about short-lived objects is a memory leak. In a WeakHashMap, an entry disappears automatically once its key is no longer used anywhere else. Typical uses are caches keyed by objects (class metadata, canonical mappings) and registries of listeners or resources that should not prevent garbage collection. For values that should vanish under memory pressure, SoftReference-based caches are the related tool.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {

    // Q46 + Q47: add from 4 threads and count what survives.
    static int addConcurrently(List<Integer> list) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int t = 0; t < 4; t++) {
            threads[t] = new Thread(() -> {
                for (int i = 0; i < 10_000; i++) {
                    try { list.add(i); } catch (RuntimeException e) { /* AIOOBE during an unsafe resize */ }
                }
            });
            threads[t].start();
        }
        for (Thread t : threads) t.join();
        return list.size();
    }

    public static void main(String[] args) throws Exception {
        // Q38: COWAL snapshot iteration allows modification.
        List<String> listeners = new CopyOnWriteArrayList<>(List.of("log", "mail"));
        for (String l : listeners) listeners.remove(l);       // safe: iterating the snapshot
        System.out.println("Q38 CopyOnWriteArrayList emptied while iterating: " + listeners);

        // Q39: COWAS keeps insertion order.
        Set<String> cowSet = new CopyOnWriteArraySet<>(List.of("b", "a", "b"));
        System.out.println("Q39 CopyOnWriteArraySet " + cowSet);

        // Q40 + Q41: concurrent sorted structures.
        ConcurrentSkipListSet<Integer> ids = new ConcurrentSkipListSet<>(List.of(30, 10, 20));
        ConcurrentSkipListMap<Integer, String> ladder = new ConcurrentSkipListMap<>(Map.of(101, "ask", 99, "bid"));
        for (Integer id : ids) if (id < 100) ids.add(id + 100); // weakly consistent, no CME
        System.out.println("Q40 ConcurrentSkipListSet after adding during iteration: first " + ids.first() + ", last " + ids.last());
        System.out.println("Q41 ConcurrentSkipListMap putIfAbsent(99) -> " + ladder.putIfAbsent(99, "new") + ", " + ladder);

        // Q43 + Q44: null in sorted collections.
        try { new TreeSet<String>().add(null); } catch (NullPointerException e) { System.out.println("Q43 TreeSet.add(null) -> NullPointerException"); }
        TreeSet<String> nullable = new TreeSet<>(Comparator.nullsFirst(Comparator.naturalOrder()));
        nullable.addAll(Arrays.asList("b", null, "a"));
        TreeMap<String, Integer> tm = new TreeMap<>();
        tm.put("k", null);                                    // null value is fine
        String nullKey;
        try { tm.put(null, 1); nullKey = "allowed"; } catch (NullPointerException e) { nullKey = "NullPointerException"; }
        System.out.println("Q43 with nullsFirst comparator " + nullable + " | Q44 TreeMap null value ok " + tm + ", null key -> " + nullKey);

        // Q45: atomic per-key compute in ConcurrentHashMap.
        ConcurrentHashMap<String, Integer> wordCount = new ConcurrentHashMap<>();
        ExecutorService pool = Executors.newFixedThreadPool(4);
        List<Callable<Void>> jobs = new ArrayList<>();
        for (int t = 0; t < 4; t++) jobs.add(() -> { for (int i = 0; i < 1000; i++) wordCount.merge("java", 1, Integer::sum); return null; });
        pool.invokeAll(jobs);
        pool.shutdown();
        System.out.println("Q45 4 threads x 1000 merges = " + wordCount.get("java"));

        // Q46: unsafe ArrayList loses adds (or throws inside add); Q47: Vector never does.
        int unsafe = addConcurrently(new ArrayList<>());
        int vector = addConcurrently(new Vector<>());
        int synced = addConcurrently(Collections.synchronizedList(new ArrayList<>()));
        System.out.println("Q46 ArrayList kept at most 40000: " + (unsafe <= 40_000) + " | Q47 Vector " + vector + ", synchronizedList " + synced);

        // Q50: a concurrent Set from ConcurrentHashMap.
        Set<String> online = ConcurrentHashMap.newKeySet();
        online.add("u1"); online.add("u1"); online.add("u2");
        System.out.println("Q50 ConcurrentHashMap.newKeySet() size " + online.size());

        // Q52: dictionary with prefix lookup in a ConcurrentSkipListMap.
        ConcurrentSkipListMap<String, String> dictionary = new ConcurrentSkipListMap<>();
        dictionary.put("java", "a language"); dictionary.put("javac", "the compiler"); dictionary.put("jvm", "the virtual machine");
        String prefix = "jav";
        System.out.println("Q52 words starting with '" + prefix + "': " + dictionary.subMap(prefix, prefix + Character.MAX_VALUE).keySet());

        // Q48: a quick property table printed from the JDK classes themselves.
        System.out.println("Q48 RandomAccess: ArrayList " + (new ArrayList<>() instanceof RandomAccess)
                + ", LinkedList " + (new LinkedList<>() instanceof RandomAccess)
                + " | sorted: TreeSet " + (new TreeSet<>() instanceof SortedSet) + ", HashSet " + (new HashSet<>() instanceof SortedSet));
    }
}`,
    walk:
      "Q38 removes every element of a CopyOnWriteArrayList while iterating it. The loop sees the original snapshot, so the result is an empty list and no exception. In Q40, adding to the ConcurrentSkipListSet during iteration is allowed. Because its iterator is weakly consistent, it may also visit the new elements, so the program prints only the first and last values, which are deterministic. Q41's `putIfAbsent` returns the existing value \"bid\" and changes nothing.\n\nQ43 and Q44 show NullPointerException for null in a naturally ordered TreeSet and TreeMap, null allowed with a `nullsFirst` comparator, and null values allowed in TreeMap. Q45 merges 4,000 counts atomically. Q46 adds 40,000 numbers from four threads into an ArrayList; elements are usually lost, and some adds may throw inside the resize. The program prints only that at most 40,000 survived. Vector and the synchronized list always keep exactly 40,000 (Q47). Q52 finds every word with a prefix using a skip-list range view.",
    anim: [
      "Lost update in a shared ArrayList.add",
      [
        ["t1", "thread 1", "add(5)"],
        ["t2", "thread 2", "add(8)"],
        ["size", "size field", "value 10"],
        ["arr", "elementData", "slot 10"],
      ],
      [
        ["t1", "size", "read 10", "Thread 1 reads size = 10 to decide where the new element goes."],
        ["t2", "size", "read 10", "Before thread 1 writes, thread 2 also reads size = 10."],
        ["t1", "arr", "slot[10]=5", "Thread 1 stores 5 into slot 10 and sets size to 11."],
        ["t2", "arr", "slot[10]=8", "Thread 2 overwrites slot 10 with 8 and also sets size to 11: one add is lost."],
        ["size", "arr", "Vector locks", "With Vector each add holds the lock, so the read-store-increment cannot interleave."],
      ],
    ],
    varies: true,
    mistakes: [
      "Iterating a `Collections.synchronizedList` without holding its lock. The iterator itself is not synchronized.",
      "Assuming CopyOnWriteArraySet is fast like HashSet. Its contains and add are linear scans.",
      "Calling `size()` on a ConcurrentSkipListSet in a hot loop. It traverses the whole list.",
    ],
    qa: [
      [
        "Why is there no ConcurrentHashSet class?",
        "It is not needed: `ConcurrentHashMap.newKeySet()` returns a Set view backed by a ConcurrentHashMap with the same concurrency properties.",
      ],
      [
        "When is ReentrantReadWriteLock better than ConcurrentHashMap?",
        "When a read must see several entries consistently (a multi-key snapshot) or a write updates several entries atomically. ConcurrentHashMap gives atomicity only per key.",
      ],
      [
        "Does a weakly consistent iterator ever return an element twice?",
        "No. It returns each element at most once and reflects the state at some point since the iterator was created, possibly including later changes.",
      ],
    ],
    ex: [
      "Online users are added and removed constantly by many threads, and a dashboard thread lists them in alphabetical order every second. Choose the collection and justify it.",
      "Use `ConcurrentSkipListSet<String>`. Concurrent add and remove are lock-free. Iteration is weakly consistent and never throws, and it is already alphabetical, so the dashboard needs no copy-and-sort and takes no lock.",
    ],
  }),
];
