import { lesson } from "../../schema.js";

export default [
  lesson("Collections Output Questions Q76-Q87: Identity, Nulls, Binary Search, EnumSet and Comparators", {
    intro:
      "Questions 76 to 87 continue the output round:\n\n- HashMap vs IdentityHashMap with `new String` keys\n- null in a TreeMap\n- binary search on a reverse-sorted array\n- EnumSet ranges and ordinals\n- LinkedHashSet with \"1\" and 1\n- sorting employees by name with Comparable, descending with a Comparator, and through a static nested comparator class\n- sorting Integer arrays in descending order\n- a TreeSet whose anonymous comparator has a misspelt method name\n- building a TreeSet from a HashSet\n\nEvery question that compiles runs in the program.",
    topics: [
      [
        "Q76 (output). What does a HashMap print for two new String(\"a\") keys?",
        "`new String(\"a\")` creates two distinct objects, but String overrides `equals` and `hashCode` by content. They hash to the same bucket and are equal, so the second put **replaces** the first: **size 1**, and the value is the second one. It makes no difference that the references differ.",
        "Map<String, Integer> m = new HashMap<>();\nm.put(new String(\"a\"), 1); m.put(new String(\"a\"), 2);\nSystem.out.println(m);   // {a=2}",
      ],
      [
        "Q77 (output). What does an IdentityHashMap print for the same two keys?",
        "IdentityHashMap compares keys with `==` and hashes them with `System.identityHashCode`, so two different String objects are two keys: **size 2**, printed as `{a=1, a=2}` in some order. Using the **literal** `\"a\"` twice would give one key, because literals are pooled and are the same object.",
        "Map<String, Integer> m = new IdentityHashMap<>();\nm.put(new String(\"a\"), 1); m.put(new String(\"a\"), 2);\nm.size();   // 2",
      ],
      [
        "Q78 (output). Can a TreeMap hold a null key or a null value?",
        "With natural ordering, `put(null, v)` throws **NullPointerException**, because the key must be compared. A **null value** is fine: `put(\"k\", null)` works, and `get(\"k\")` returns null. Even on an empty TreeMap, since Java 7, the null key is rejected immediately, because `put` calls `compare(key, key)` as a type and null check.",
        "TreeMap<String, String> t = new TreeMap<>();\nt.put(\"k\", null);   // OK\nt.put(null, \"v\");   // NullPointerException",
      ],
      [
        "Q79 (output). What happens with Arrays.binarySearch on a reverse-sorted array?",
        "Binary search requires the array to be sorted in **ascending** order (the same order the search uses). On `{50, 40, 30, 20, 10}`, searching for 40 checks the middle element 30, decides 40 must be to the right, and ends up returning a **negative** \"not found\" value, although 40 is present. The result is **undefined** for unsorted input. To search a descending array, use `Arrays.binarySearch(boxed, key, Collections.reverseOrder())` on an Integer[]. When a key is missing, the return value is `-(insertionPoint) - 1`.",
        "int[] desc = {50, 40, 30, 20, 10};\nArrays.binarySearch(desc, 40);   // negative: wrong order\nInteger[] boxed = {50, 40, 30, 20, 10};\nArrays.binarySearch(boxed, 40, Collections.reverseOrder());   // 1",
      ],
      [
        "Q80 (output). What do EnumSet.range and ordinal() print?",
        "`EnumSet.range(from, to)` includes **both** ends, in declaration order. For `enum Day { MON, TUE, WED, THU, FRI }`, `range(TUE, THU)` is `[TUE, WED, THU]`. `ordinal()` is the zero-based declaration position, so `WED.ordinal()` is 2. `range(THU, TUE)`, with from after to, throws IllegalArgumentException. Never persist ordinals, because reordering the constants changes them.",
        "EnumSet.range(Day.TUE, Day.THU);   // [TUE, WED, THU]\nDay.WED.ordinal();                 // 2",
      ],
      [
        "Q81 (output). What does a LinkedHashSet hold after adding \"1\" and 1?",
        "The String \"1\" and the Integer 1 are different objects of different classes, and `\"1\".equals(1)` is false, so both are kept: **size 2**, printed in insertion order as `[1, 1]`. The two look identical when printed. It is a classic trick, so check `getClass()` when output looks odd.",
        "Set<Object> s = new LinkedHashSet<>();\ns.add(\"1\"); s.add(1);\nSystem.out.println(s + \" \" + s.size());   // [1, 1] 2",
      ],
      [
        "Q82 (output). How do you sort Employees by name with Comparable?",
        "Implement `Comparable<Employee>` with `compareTo` returning `name.compareTo(other.name)`, then call `Collections.sort(list)` or `list.sort(null)`. Strings compare lexicographically by UTF-16 code units, so uppercase letters sort before lowercase (\"Zed\" comes before \"amy\"). Use `String.CASE_INSENSITIVE_ORDER` or a `Collator` for human ordering. Without Comparable, `Collections.sort(list)` does not compile for a `List<Employee>`, because of the bound `T extends Comparable<? super T>`.",
        "class Employee implements Comparable<Employee> {\n    public int compareTo(Employee o) { return name.compareTo(o.name); }\n}\nCollections.sort(list);",
      ],
      [
        "Q83 (output). How do you sort with a descending Comparator?",
        "Pass a comparator that reverses the order: `list.sort(Comparator.comparing(Employee::getName).reversed())`, or `(a, b) -> b.getName().compareTo(a.getName())`. Do not negate the result of an int subtraction. `(a, b) -> b.salary - a.salary` overflows for large values; use `Integer.compare(b.salary, a.salary)` or `Comparator.comparingInt(...).reversed()`.",
        "list.sort(Comparator.comparing(Employee::getName).reversed());",
      ],
      [
        "Q84 (output). How do you sort with a static nested Comparator class?",
        "A comparator can be a named **static nested class**, `static class SalaryComparator implements Comparator<Employee>`, which you instantiate with `new Employee.SalaryComparator()`. Making it static means it needs no outer instance. A singleton instance (`static final Comparator<Employee> BY_SALARY = ...`) is the modern equivalent. The output is the list in the comparator's order. Ties keep their original relative order, because the sort is stable.",
        "static class SalaryComparator implements Comparator<Employee> {\n    public int compare(Employee a, Employee b) { return Integer.compare(a.salary, b.salary); }\n}\nlist.sort(new SalaryComparator());",
      ],
      [
        "Q85 (output). How do you sort an Integer array in descending order?",
        "`Arrays.sort(Integer[] a, Collections.reverseOrder())` sorts boxed values descending. The same call on an `int[]` does **not compile**, because there is no `Arrays.sort(int[], Comparator)` overload: comparators work only on objects. For primitives, sort ascending and reverse in place, or use `IntStream.of(a).boxed().sorted(Comparator.reverseOrder()).mapToInt(Integer::intValue).toArray()`.",
        "Integer[] a = {3, 9, 1};\nArrays.sort(a, Collections.reverseOrder());   // [9, 3, 1]\n// Arrays.sort(new int[]{3, 9, 1}, Collections.reverseOrder()); // compile error",
      ],
      [
        "Q86 (output). A TreeSet's anonymous Comparator has a misspelt method name.",
        "If the anonymous class writes `public int comapre(String a, String b)` instead of `compare`, it does **not implement** Comparator's abstract method. The anonymous class is then not concrete, and the code **fails to compile** (\"is not abstract and does not override abstract method compare\"). If the misspelt method is in a class that also has a correct `compare`, the typo is just an unused extra method. Adding `@Override` turns such typos into clear compile errors, and a lambda avoids the problem entirely.",
        "new TreeSet<String>(new Comparator<String>() {\n    public int comapre(String a, String b) { return b.compareTo(a); }  // typo\n});   // compile error: compare(T, T) not implemented",
      ],
      [
        "Q87 (output). What happens when you build a TreeSet from a HashSet?",
        "`new TreeSet<>(hashSet)` copies every element and sorts it by natural order, so the output is sorted no matter what order the HashSet had. Duplicates cannot exist, since the source was a set. The elements must be mutually Comparable, otherwise ClassCastException is thrown, and must not include null, otherwise NullPointerException. To keep a custom order, create `new TreeSet<>(comparator)` and then call `addAll(hashSet)`.",
        "Set<String> hs = new HashSet<>(List.of(\"pear\", \"apple\", \"fig\"));\nSystem.out.println(new TreeSet<>(hs));   // [apple, fig, pear]",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    enum Day { MON, TUE, WED, THU, FRI }

    static class Employee implements Comparable<Employee> {
        final String name; final int salary;
        Employee(String name, int salary) { this.name = name; this.salary = salary; }
        String getName() { return name; }
        @Override public int compareTo(Employee o) { return name.compareTo(o.name); }   // Q82
        @Override public String toString() { return name + ":" + salary; }

        // Q84: a named static nested comparator.
        static class SalaryComparator implements Comparator<Employee> {
            @Override public int compare(Employee a, Employee b) { return Integer.compare(a.salary, b.salary); }
        }
    }

    public static void main(String[] args) {
        // Q76 + Q77
        Map<String, Integer> hash = new HashMap<>(), identity = new IdentityHashMap<>();
        hash.put(new String("a"), 1); hash.put(new String("a"), 2);
        identity.put(new String("a"), 1); identity.put(new String("a"), 2);
        System.out.println("Q76 HashMap " + hash + " | Q77 IdentityHashMap size " + identity.size());

        // Q78
        TreeMap<String, String> tree = new TreeMap<>();
        tree.put("k", null);
        try { tree.put(null, "v"); } catch (NullPointerException e) { System.out.println("Q78 TreeMap null value ok " + tree + ", null key -> NullPointerException"); }

        // Q79
        int[] desc = {50, 40, 30, 20, 10};
        Integer[] boxed = {50, 40, 30, 20, 10};
        System.out.println("Q79 binarySearch on descending int[] for 40 -> " + Arrays.binarySearch(desc, 40)
                + ", with reverseOrder on Integer[] -> " + Arrays.binarySearch(boxed, 40, Collections.reverseOrder()));

        // Q80
        System.out.println("Q80 range(TUE, THU) " + EnumSet.range(Day.TUE, Day.THU) + ", WED.ordinal() " + Day.WED.ordinal());

        // Q81
        Set<Object> linked = new LinkedHashSet<>();
        linked.add("1"); linked.add(1);
        StringJoiner kinds = new StringJoiner(", ");
        for (Object o : linked) kinds.add(o.getClass().getSimpleName());
        System.out.println("Q81 " + linked + " size " + linked.size() + " (" + kinds + ")");

        // Q82, Q83, Q84
        List<Employee> staff = new ArrayList<>(List.of(new Employee("Zed", 500), new Employee("amy", 300), new Employee("Bob", 300)));
        Collections.sort(staff);
        System.out.println("Q82 by name (uppercase first) " + staff);
        staff.sort(Comparator.comparing(Employee::getName, String.CASE_INSENSITIVE_ORDER).reversed());
        System.out.println("Q83 by name descending, ignoring case " + staff);
        staff.sort(new Employee.SalaryComparator());
        System.out.println("Q84 SalaryComparator (stable ties) " + staff);

        // Q85
        Integer[] values = {3, 9, 1};
        Arrays.sort(values, Collections.reverseOrder());
        System.out.println("Q85 Integer[] descending " + Arrays.toString(values));

        // Q86: the corrected anonymous comparator (the misspelt version does not compile).
        TreeSet<String> reversed = new TreeSet<>(new Comparator<String>() {
            @Override public int compare(String a, String b) { return b.compareTo(a); }
        });
        reversed.addAll(List.of("a", "c", "b"));
        System.out.println("Q86 with compare spelt correctly " + reversed);

        // Q87
        Set<String> hashSet = new HashSet<>(List.of("pear", "apple", "fig"));
        System.out.println("Q87 TreeSet from HashSet " + new TreeSet<>(hashSet));
    }
}`,
    walk:
      "Q76 and Q77 put two equal but distinct String objects into each map. HashMap merges them into one key, while IdentityHashMap keeps two. Q78 shows that TreeMap accepts a null value but rejects a null key. In Q79, binary search on a descending array misses 40 and returns a negative number, while searching the boxed copy with `reverseOrder()` finds it at index 1.\n\nQ81 prints `[1, 1]` and confirms that one element is a String and the other an Integer. Q82 sorts by name with Comparable, and uppercase \"Bob\" and \"Zed\" come before lowercase \"amy\". Q83 sorts descending, ignoring case. Q84 sorts by salary with the static nested comparator. amy and Bob tie at 300 and keep their previous relative order, because the sort is stable. Q86 shows the corrected anonymous comparator. The misspelt version is explained in the topic, because it does not compile.",
    anim: [
      "Binary search on a descending array",
      [
        ["arr", "array", "50 40 30 20 10"],
        ["mid", "middle", "index 2 = 30"],
        ["cmp", "compare", "40 > 30 ?"],
        ["right", "right half", "20, 10"],
        ["res", "result", "negative"],
      ],
      [
        ["arr", "mid", "low 0, high 4", "binarySearch assumes ascending order and starts at the middle index 2."],
        ["mid", "cmp", "40 vs 30", "The key 40 is greater than 30, so ascending logic says look to the right."],
        ["cmp", "right", "go right", "The right half holds 20 and 10, where 40 can never be found."],
        ["right", "res", "not found", "The search ends with -(insertion point) - 1, a negative number."],
        ["arr", "res", "fix: reverseOrder", "Searching an Integer[] with Collections.reverseOrder() finds 40 at index 1."],
      ],
    ],
    mistakes: [
      "Running binarySearch on unsorted or reverse-sorted data and trusting the result.",
      "Trying `Arrays.sort(int[], Comparator)`. Comparators need object arrays.",
      "Forgetting that natural String order is case-sensitive (uppercase before lowercase).",
    ],
    qa: [
      [
        "What does binarySearch return for a missing key?",
        "`-(insertionPoint) - 1`, where the insertion point is the index of the first element greater than the key. The value is always negative, even when the insertion point is 0.",
      ],
      [
        "Why prefer `@Override` in anonymous classes?",
        "It makes the compiler verify that you really override a supertype method, so a misspelt name becomes an error instead of a silent extra method.",
      ],
      [
        "Is EnumSet.range inclusive?",
        "Yes, both endpoints are included. `EnumSet.range(MON, MON)` is the single-element set `[MON]`.",
      ],
    ],
    ex: [
      "Predict: `Set<Object> s = new TreeSet<>(); s.add(\"1\"); s.add(1);`. What happens, and why does it differ from the LinkedHashSet version?",
      "The second add throws ClassCastException. A TreeSet must compare the String \"1\" with the Integer 1, which are not mutually comparable. LinkedHashSet only needs equals and hashCode, so it keeps both elements.",
    ],
  }),

  lesson("Collections Output Questions Q88-Q98: Nulls in TreeSet, Sorted Maps, Wildcards and PriorityQueue", {
    intro:
      "The last collection output questions, 88 to 98, cover:\n\n- adding a collection containing null to a TreeSet\n- a TreeMap with a descending comparator\n- sorting HashMap entries by value in descending order\n- sorting LinkedHashMap entries by key in descending order\n- the wildcard rules: what you can add to `List<? super Double>` and `List<? extends Number>`, assigning `List<Integer>` to those types or to `List<Number>`, and a generic method that prints any array\n- PriorityQueue's poll, offer, remove and peek\n\nQuestions 99 and 100 are empty in the source list, so this lesson ends at Q98.",
    topics: [
      [
        "Q88 (output). What happens when addAll puts a null into a TreeSet?",
        "`treeSet.addAll(Arrays.asList(\"b\", null, \"a\"))` inserts the elements one by one. \"b\" goes in, then the comparison for null throws **NullPointerException**, which leaves the set **partially filled** with just `[b]`. `addAll` is not atomic. With `Comparator.nullsFirst(...)`, all three are accepted and null sorts first. Note that `List.of` cannot even hold null, so such examples use `Arrays.asList`.",
        "TreeSet<String> t = new TreeSet<>();\ntry { t.addAll(Arrays.asList(\"b\", null, \"a\")); }\ncatch (NullPointerException e) { System.out.println(t); }   // [b]",
      ],
      [
        "Q89 (output). What does a TreeMap with a descending comparator print?",
        "`new TreeMap<>(Comparator.reverseOrder())` keeps its keys in descending order, so printing the map or iterating `keySet()` shows the largest key first. `firstKey()` returns the largest key and `lastKey()` the smallest. The navigation methods follow the comparator: `headMap(k)` holds the keys **before** k in comparator order, which means the keys greater than k. Alternatively, `treeMap.descendingMap()` gives a reversed view of an ascending map.",
        "TreeMap<Integer, String> t = new TreeMap<>(Comparator.reverseOrder());\nt.putAll(Map.of(1, \"a\", 3, \"c\", 2, \"b\"));\nSystem.out.println(t + \" first=\" + t.firstKey());   // {3=c, 2=b, 1=a} first=3",
      ],
      [
        "Q90 (output). How do you sort HashMap entries by value in descending order?",
        "Copy `entrySet()` into a List and sort it with `Map.Entry.comparingByValue(Comparator.reverseOrder())`, or with the lambda `(a, b) -> b.getValue().compareTo(a.getValue())`. Then iterate the list, or put the entries into a LinkedHashMap. The output lists entries from the highest value to the lowest. With equal values, the order depends on HashMap's iteration order unless you add `thenComparing(Map.Entry.comparingByKey())`.",
        "List<Map.Entry<String, Integer>> e = new ArrayList<>(map.entrySet());\ne.sort(Map.Entry.comparingByValue(Comparator.reverseOrder()));",
      ],
      [
        "Q91 (output). How do you sort LinkedHashMap entries by key in descending order?",
        "A LinkedHashMap keeps insertion order. To reorder it, sort its entries by `Map.Entry.comparingByKey(Comparator.reverseOrder())`, then **clear and re-insert** them (or build a new LinkedHashMap). The map then iterates in descending key order. Re-putting an existing key without removing it first does **not** move it, because insertion order is set by the first insertion only.",
        "List<Map.Entry<String, Integer>> e = new ArrayList<>(lhm.entrySet());\ne.sort(Map.Entry.comparingByKey(Comparator.reverseOrder()));\nlhm.clear(); e.forEach(x -> lhm.put(x.getKey(), x.getValue()));",
      ],
      [
        "Q92 (output). Can a List<Number> be assigned to List<? super Double>, and what can you add to it?",
        "Yes. `List<? super Double>` means \"a list of Double or of some **supertype** of Double\", and Number is a supertype. You may **add** Doubles (and null), because whatever the real element type is, it can hold a Double. You can **read** only as `Object`, because the compiler does not know whether it is a `List<Number>` or a `List<Object>`. This is the consumer side of **PECS**: `super` for collections you write into.",
        "List<Number> numbers = new ArrayList<>();\nList<? super Double> sink = numbers;   // OK\nsink.add(3.5);                          // OK\nObject o = sink.get(0);                 // only Object when reading",
      ],
      [
        "Q93 (output). Can a List<Integer> be assigned to List<? super Double>?",
        "No, it is a **compile error**. Integer is not a supertype of Double; both are subclasses of Number. If it were allowed, you could add a Double into a list of Integers. The only legal targets for `List<? super Double>` are `List<Double>`, `List<Number>`, `List<Object>` and lists of Double's other supertypes, such as `List<Comparable<Double>>`.",
        "List<Integer> ints = new ArrayList<>();\nList<? super Double> sink = ints;   // compile error",
      ],
      [
        "Q94 (output). How does a generic method print Integer and Double arrays?",
        "Declare a type parameter on the method: `static <T> void print(T[] array) { for (T t : array) System.out.print(t + \" \"); }`. The compiler infers `T = Integer` for `print(new Integer[]{1, 2})` and `T = Double` for a Double[]. It will not accept an `int[]`, because T must be a reference type and `int[]` is not a `T[]`. A bounded version, `<T extends Number>`, can also call `t.doubleValue()`.",
        "static <T> void print(T[] array) { for (T t : array) System.out.print(t + \" \"); }\nprint(new Integer[]{1, 2});   // 1 2\nprint(new Double[]{1.5});     // 1.5",
      ],
      [
        "Q95 (output). How do you sum the elements of a List<? extends Number>?",
        "Read each element as Number and call `doubleValue()`: `double sum = 0; for (Number n : list) sum += n.doubleValue();`. A method with the parameter `List<? extends Number>` accepts `List<Integer>`, `List<Double>`, `List<Long>` and so on. This is the producer side of PECS: `extends` for collections you read from. Summing Integers 1, 2, 3 prints 6.0, because the result is a double.",
        "static double sum(List<? extends Number> list) {\n    double s = 0; for (Number n : list) s += n.doubleValue(); return s;\n}\nsum(List.of(1, 2, 3));   // 6.0",
      ],
      [
        "Q96 (output). Can a List<Integer> be assigned to List<Number>?",
        "No, it is a **compile error** (incompatible types), because generics are invariant. A `List<Number>` reference would let you add a Double into what is really a List<Integer>. Use `List<? extends Number>` for read-only access, or copy the elements: `new ArrayList<Number>(ints)`. Arrays behave differently: `Number[] n = new Integer[2]` compiles, and storing a Double fails at runtime with ArrayStoreException.",
        "List<Integer> ints = List.of(1);\nList<Number> nums = ints;         // compile error\nNumber[] arr = new Integer[1];\narr[0] = 1.5;                     // ArrayStoreException at runtime",
      ],
      [
        "Q97 (output). Can you add to a List<? extends Number>?",
        "No, except null. The compiler only knows the elements are *some* subtype of Number. The list might really be a `List<Double>`, so adding an Integer (or anything else) is a **compile error**. You can read elements as Number, remove them, and add null. The PECS summary: `? extends T` is read-only (a producer), and `? super T` is write-friendly (a consumer).",
        "List<? extends Number> source = new ArrayList<Integer>();\nsource.add(1);      // compile error\nsource.add(null);   // allowed",
      ],
      [
        "Q98 (output). What do PriorityQueue's poll, offer, remove and peek print?",
        "PriorityQueue is a binary **min-heap** by default. Its methods:\n\n- `offer` or `add` inserts in O(log n).\n- `peek` returns the smallest element without removing it (null if empty).\n- `poll` removes and returns the smallest (null if empty).\n- `remove()` does the same but throws NoSuchElementException when empty.\n- `remove(Object)` deletes one specific element in O(n).\n\n**Printing the queue** (its `toString`) shows the internal heap array order, **not** sorted order, so `[1, 3, 2, 8, 5]` is normal. Only repeated `poll()` returns the elements in sorted order. Use `new PriorityQueue<>(Comparator.reverseOrder())` for a max-heap. Nulls are not allowed.",
        "PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 8, 3, 2));\npq.peek();   // 1\npq.poll();   // 1, then 2, 3, 5, 8 on later polls",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    // Q94: one generic method for any reference-type array.
    static <T> String print(T[] array) {
        StringJoiner out = new StringJoiner(" ");
        for (T t : array) out.add(String.valueOf(t));
        return out.toString();
    }

    // Q95: read from a producer with ? extends.
    static double sum(List<? extends Number> list) {
        double total = 0;
        for (Number n : list) total += n.doubleValue();
        return total;
    }

    // Q92: write into a consumer with ? super.
    static void fill(List<? super Double> sink) { sink.add(1.5); sink.add(2.5); }

    public static void main(String[] args) {
        // Q88: addAll stops at the null and leaves a partial result.
        TreeSet<String> partial = new TreeSet<>();
        try { partial.addAll(Arrays.asList("b", null, "a")); }
        catch (NullPointerException e) { System.out.println("Q88 NullPointerException after adding " + partial); }

        // Q89
        TreeMap<Integer, String> descending = new TreeMap<>(Comparator.reverseOrder());
        descending.putAll(Map.of(1, "a", 3, "c", 2, "b"));
        System.out.println("Q89 " + descending + ", firstKey " + descending.firstKey() + ", headMap(2) " + descending.headMap(2));

        // Q90
        Map<String, Integer> marks = new HashMap<>(Map.of("asha", 82, "ben", 95, "chen", 67));
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(marks.entrySet());
        entries.sort(Map.Entry.comparingByValue(Comparator.reverseOrder()));
        System.out.println("Q90 by value desc " + entries);

        // Q91: re-insert to change a LinkedHashMap's order.
        Map<String, Integer> lhm = new LinkedHashMap<>();
        lhm.put("b", 2); lhm.put("d", 4); lhm.put("a", 1); lhm.put("c", 3);
        List<Map.Entry<String, Integer>> byKey = new ArrayList<>(lhm.entrySet());
        byKey.sort(Map.Entry.comparingByKey(Comparator.reverseOrder()));
        Map<String, Integer> reordered = new LinkedHashMap<>();
        byKey.forEach(e -> reordered.put(e.getKey(), e.getValue()));
        System.out.println("Q91 LinkedHashMap by key desc " + reordered);

        // Q92 + Q93
        List<Number> numbers = new ArrayList<>();
        fill(numbers);                                   // List<Number> is a List<? super Double>
        List<? super Double> sink = numbers;
        Object first = sink.get(0);                      // reading gives only Object
        System.out.println("Q92 List<Number> filled through ? super Double: " + numbers + ", read as Object: " + first);
        System.out.println("Q93 List<Integer> -> List<? super Double> does not compile (Integer is not a supertype of Double)");

        // Q94
        System.out.println("Q94 " + print(new Integer[] {1, 2, 3}) + " | " + print(new Double[] {1.5, 2.5}));

        // Q95
        System.out.println("Q95 sum(List<Integer>) = " + sum(List.of(1, 2, 3)) + ", sum(List<Double>) = " + sum(List.of(0.5, 0.25)));

        // Q96: arrays are covariant and fail at runtime instead.
        Number[] array = new Integer[1];
        try { array[0] = 1.5; } catch (ArrayStoreException e) { System.out.println("Q96 List<Number> = List<Integer> is a compile error; the array version -> ArrayStoreException"); }

        // Q97
        List<? extends Number> source = new ArrayList<>(List.of(4, 5));
        // source.add(6);                                // compile error
        source.remove(0);                                // removing is allowed
        System.out.println("Q97 ? extends list after remove: " + source + ", element read as Number: " + source.get(0).intValue());

        // Q98
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int n : new int[] {5, 1, 8, 3, 2}) pq.offer(n);
        System.out.print("Q98 heap toString " + pq + ", peek " + pq.peek() + ", polls:");
        pq.remove(8);                                    // remove(Object) deletes one element
        while (!pq.isEmpty()) System.out.print(" " + pq.poll());
        System.out.println(", poll on empty " + pq.poll());
        try { pq.remove(); } catch (NoSuchElementException e) { System.out.println("Q98 remove() on empty -> NoSuchElementException"); }
    }
}`,
    walk:
      "Q88 shows that `addAll` is not atomic: \"b\" is inserted, the null then throws, and \"a\" is never reached. Q89's reverse-ordered TreeMap reports 3 as its first key, and its `headMap(2)` holds only key 3, the keys before 2 in descending order. Q90 sorts the entries by value with the highest first. Q91 rebuilds a LinkedHashMap from entries sorted by key in descending order, because simply re-putting keys would not move them.\n\nQ92 fills a `List<Number>` through a `? super Double` parameter and reads it back only as Object. Q94's generic method prints both boxed arrays. Q95 sums any list of Numbers. Q96 contrasts the compile-time invariance of generics with the runtime ArrayStoreException of covariant arrays. Q97 removes from, and reads from, a `? extends` list but cannot add to it. Q98 prints the heap's internal order, removes 8, then polls the rest in ascending order: 1, 2, 3, 5. Polling an empty queue returns null, while `remove()` throws.",
    anim: [
      "PECS: producer extends, consumer super",
      [
        ["src", "List<Integer>", "producer"],
        ["ext", "? extends Number", "read as Number"],
        ["sup", "? super Double", "add Doubles"],
        ["dst", "List<Number>", "consumer"],
      ],
      [
        ["src", "ext", "assign", "A List<Integer> can be viewed as List<? extends Number> because Integer is a Number."],
        ["ext", "ext", "read only", "You may read elements as Number, but adding (except null) does not compile."],
        ["dst", "sup", "assign", "A List<Number> can be viewed as List<? super Double>, since Number is above Double."],
        ["sup", "dst", "add 1.5", "Adding a Double is safe: whatever the real type, it can hold a Double."],
        ["src", "sup", "rejected", "List<Integer> is not a List<? super Double>; the compiler stops it."],
      ],
    ],
    mistakes: [
      "Printing a PriorityQueue and expecting sorted output. Only `poll()` gives sorted order.",
      "Expecting `addAll` to be all-or-nothing. It stops at the first failure and keeps what it already added.",
      "Trying to add to a `List<? extends T>`. Use `? super T` for parameters you write into.",
    ],
    qa: [
      [
        "What is the difference between `poll()` and `remove()` on a queue?",
        "Both remove the head. On an empty queue, `poll()` returns null, while `remove()` throws NoSuchElementException. The same split exists between `peek()`/`element()` and `offer()`/`add()` (for capacity-bounded queues).",
      ],
      [
        "What does PECS stand for?",
        "Producer Extends, Consumer Super. Use `? extends T` when the structure gives you T values, and `? super T` when you put T values into it, as in `Collections.copy(List<? super T> dest, List<? extends T> src)`.",
      ],
      [
        "Why is `List<?>` different from `List<Object>`?",
        "`List<?>` means a list of some unknown type. Any list can be assigned to it, but you cannot add anything except null. `List<Object>` accepts only actual `List<Object>` instances, but you can add anything to it.",
      ],
    ],
    ex: [
      "Write `static <T> void copyAll(List<? super T> dest, List<? extends T> src)` and show a call that copies a `List<Integer>` into a `List<Number>`.",
      "`for (T t : src) dest.add(t);`. The call `copyAll(numbers, ints)` infers T = Integer: `List<Number>` matches `? super Integer`, and `List<Integer>` matches `? extends Integer`.",
    ],
  }),
];
