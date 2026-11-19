import { lesson } from "../../schema.js";

export default [
  lesson("Collections Output Questions Q51-Q62: Generics, Iteration Changes, EnumMap and Nulls", {
    intro:
      "Output questions give you a short program and ask what it prints, or whether it even compiles. Questions 51 to 62 test:\n\n- generic declarations and nested generics\n- inserting by index\n- moving a ListIterator forwards and back\n- mixing types in a TreeSet\n- modifying ArrayList, ConcurrentSkipListMap, CopyOnWriteArrayList and CopyOnWriteArraySet during iteration\n- EnumMap keys\n- nulls in LinkedHashMap and ConcurrentSkipListMap\n\nEach question shows the snippet and the answer with its reason, and the program runs every case that compiles.",
    topics: [
      [
        "Q51 (output). Which generic List declarations compile?",
        "`List<Integer> a = new ArrayList<Integer>();` and `List<Integer> b = new ArrayList<>();` (the diamond, Java 7) compile. `List<Number> c = new ArrayList<Integer>();` does **not** compile: generics are **invariant**, so `ArrayList<Integer>` is not a `List<Number>`, even though Integer is a Number. If it were allowed, you could add a Double through `c`. `List<? extends Number> d = new ArrayList<Integer>();` compiles, because a wildcard accepts any subtype list. `List<int>` never compiles, because type arguments must be reference types.",
        "List<Integer> a = new ArrayList<Integer>();   // OK\nList<Integer> b = new ArrayList<>();          // OK (diamond)\nList<Number>  c = new ArrayList<Integer>();   // compile error: invariance\nList<? extends Number> d = new ArrayList<Integer>(); // OK\nList<int> e;                                  // compile error",
      ],
      [
        "Q52 (output). How do nested generic Lists behave?",
        "`List<List<String>> grid = new ArrayList<>();` creates only the outer list, and every row must be created separately: `grid.add(new ArrayList<>())`. Calling `grid.get(0).add(\"x\")` before adding a row throws IndexOutOfBoundsException. `List<List<String>> g2 = new ArrayList<ArrayList<String>>();` does not compile, again because of invariance. The inner type argument must match exactly. Printing a nested list shows nested brackets: `[[a, b], [c]]`.",
        "List<List<String>> grid = new ArrayList<>();\ngrid.add(new ArrayList<>(List.of(\"a\", \"b\")));\ngrid.add(new ArrayList<>(List.of(\"c\")));\nSystem.out.println(grid);   // [[a, b], [c]]",
      ],
      [
        "Q53 (output). What does ArrayList.add(index, element) print?",
        "`add(index, e)` inserts at that position and shifts the current element and all later ones to the right. It does not replace anything; that is what `set` does. With `list = [A, B, C]`, `list.add(1, \"X\")` gives `[A, X, B, C]`. Index `size()` is allowed (append), but `add(size() + 1, e)` throws IndexOutOfBoundsException. Note that `list.add(1)` on a `List<Integer>` appends the value 1, while `list.remove(1)` removes the element at **index** 1.",
        "List<String> list = new ArrayList<>(List.of(\"A\", \"B\", \"C\"));\nlist.add(1, \"X\");\nSystem.out.println(list);   // [A, X, B, C]",
      ],
      [
        "Q54 (output). What happens when a ListIterator goes forward and then backward?",
        "The cursor sits **between** elements. After calling `next()` three times on `[a, b, c]`, the cursor is after c. The first `previous()` then returns **c**, the same element `next()` just returned, not b. A loop that prints all elements with `next()` and then all with `previous()` prints `a b c c b a`. Calling `previous()` at the start throws NoSuchElementException. `nextIndex()` and `previousIndex()` report the indexes on either side of the cursor.",
        "ListIterator<String> it = List.of(\"a\", \"b\", \"c\").listIterator();\nwhile (it.hasNext()) System.out.print(it.next() + \" \");\nwhile (it.hasPrevious()) System.out.print(it.previous() + \" \");\n// a b c c b a",
      ],
      [
        "Q55 (output). What happens when you add an Integer and a String to one TreeSet?",
        "With a raw or `TreeSet<Object>` you can call `add(1)` and then `add(\"one\")`, and it compiles. At runtime the second add must compare the String with the Integer, so `String.compareTo(Integer)` (through a cast to Comparable) throws **ClassCastException**. The first add succeeds even if it is the only element, because an element is compared with itself as a type check. Sorted collections need mutually comparable elements.",
        "TreeSet<Object> set = new TreeSet<>();\nset.add(1);\nset.add(\"one\");   // ClassCastException at runtime",
      ],
      [
        "Q56 (output). What happens when you add to an ArrayList while iterating it?",
        "Adding inside a for-each loop over the same ArrayList changes `modCount`, and the next `next()` throws **ConcurrentModificationException**. One subtle case: removing the **second-to-last** element does not throw. After the removal, `hasNext()` compares the cursor with the new, smaller size and returns false, so the loop ends early and `next()` is never called again. Use `ListIterator.add`, `removeIf`, or iterate over a copy.",
        "List<Integer> list = new ArrayList<>(List.of(1, 2, 3));\nfor (Integer n : list) if (n == 1) list.add(4);  // ConcurrentModificationException",
      ],
      [
        "Q57 (output). What happens when you add to a ConcurrentSkipListMap while iterating it?",
        "No exception. Its iterators are **weakly consistent**: they never throw ConcurrentModificationException and may or may not reflect changes made during iteration. Because the map is sorted, a key added *after* the current position is normally visited later in the same loop, while a key added *before* it is not. Code must not rely on either, and must make sure it does not keep adding keys ahead of the cursor forever.",
        "ConcurrentSkipListMap<Integer, String> m = new ConcurrentSkipListMap<>(Map.of(1, \"a\", 3, \"c\"));\nfor (Integer k : m.keySet()) if (k == 1) m.put(2, \"b\");\nSystem.out.println(m);   // {1=a, 2=b, 3=c}, no exception",
      ],
      [
        "Q58 (output). What happens when you add to a CopyOnWriteArrayList in a for-each loop?",
        "No exception, and **the loop does not see the new elements**. The iterator walks the snapshot array captured when the loop started, while each `add` creates a new array. After the loop the list contains the additions. For example, iterating `[1, 2]` and adding `n * 10` for each element visits only 1 and 2, and the list ends as `[1, 2, 10, 20]`. Calling `iterator.remove()` on a COWAL iterator throws UnsupportedOperationException.",
        "List<Integer> cow = new CopyOnWriteArrayList<>(List.of(1, 2));\nfor (Integer n : cow) cow.add(n * 10);\nSystem.out.println(cow);   // [1, 2, 10, 20]",
      ],
      [
        "Q59 (output). Can an EnumMap use a key that is not a constant of its enum?",
        "No, and the check happens at compile time with generics: `EnumMap<Color, String>` accepts only `Color` keys, so `map.put(Size.LARGE, \"x\")` does not compile. If you bypass generics with a raw type or a cast, `put` checks the key's class at runtime and throws **ClassCastException**. An EnumMap also rejects a null key with NullPointerException.",
        "enum Color { RED, GREEN }\nenum Size { LARGE }\nEnumMap<Color, String> map = new EnumMap<>(Color.class);\n// map.put(Size.LARGE, \"x\");  // compile error\n((Map) map).put(Size.LARGE, \"x\");  // ClassCastException at runtime",
      ],
      [
        "Q60 (output). What happens when you add to a CopyOnWriteArraySet while iterating it?",
        "The same as for CopyOnWriteArrayList: there is no exception, and the iteration sees only the original snapshot. The difference is that duplicates are ignored, so adding an element that already exists changes nothing. Iterating `{a, b}` and adding `a` and `c` ends with `[a, b, c]`.",
        "Set<String> set = new CopyOnWriteArraySet<>(List.of(\"a\", \"b\"));\nfor (String s : set) { set.add(\"a\"); set.add(\"c\"); }\nSystem.out.println(set);   // [a, b, c]",
      ],
      [
        "Q61 (output). How does LinkedHashMap handle null keys and values?",
        "LinkedHashMap extends HashMap, so it allows **one null key** and any number of null values, and it keeps insertion order. Putting the null key a second time replaces its value but keeps its original position. `get(null)` returns the value. `get(\"missing\")` also returns null, so use `containsKey` to tell an absent key from a null value. For `{null=1, a=null}` followed by `put(null, 2)`, the result is `{null=2, a=null}`.",
        "Map<String, Integer> m = new LinkedHashMap<>();\nm.put(null, 1); m.put(\"a\", null); m.put(null, 2);\nSystem.out.println(m);   // {null=2, a=null}",
      ],
      [
        "Q62 (output). Can a ConcurrentSkipListMap store a null value?",
        "No. ConcurrentSkipListMap (like ConcurrentHashMap) rejects null keys **and** null values with NullPointerException. In concurrent maps, null is reserved to mean \"no mapping\" in methods such as `get`, `putIfAbsent` and `remove`, so a stored null would be ambiguous. TreeMap, the non-concurrent sorted map, does allow null values.",
        "new ConcurrentSkipListMap<String, String>().put(\"k\", null);  // NullPointerException",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.concurrent.*;

public class Main {
    enum Color { RED, GREEN }
    enum Size { LARGE }

    public static void main(String[] args) {
        // Q51: a wildcard reference accepts a subtype list (invariant declarations are compile errors).
        List<Integer> ints = new ArrayList<>(List.of(1, 2));
        List<? extends Number> numbers = ints;
        System.out.println("Q51 List<? extends Number> reads " + numbers.get(0) + " (List<Number> = new ArrayList<Integer>() would not compile)");

        // Q52: nested lists need each row created.
        List<List<String>> grid = new ArrayList<>();
        grid.add(new ArrayList<>(List.of("a", "b")));
        grid.add(new ArrayList<>(List.of("c")));
        System.out.println("Q52 " + grid);

        // Q53: add(index, e) inserts and shifts.
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));
        list.add(1, "X");
        List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));
        nums.add(1);          // appends the value 1
        nums.remove(1);       // removes index 1 (the value 20)
        System.out.println("Q53 " + list + ", add(1) then remove(1) on [10, 20, 30] -> " + nums);

        // Q54: forward then backward.
        ListIterator<String> it = List.of("a", "b", "c").listIterator();
        StringBuilder walk = new StringBuilder();
        while (it.hasNext()) walk.append(it.next()).append(' ');
        while (it.hasPrevious()) walk.append(it.previous()).append(' ');
        System.out.println("Q54 " + walk.toString().trim());

        // Q55: incomparable types in a TreeSet.
        TreeSet<Object> mixed = new TreeSet<>();
        mixed.add(1);
        try { mixed.add("one"); } catch (ClassCastException e) { System.out.println("Q55 TreeSet Integer + String -> ClassCastException"); }

        // Q56: add during for-each, and the second-to-last removal surprise.
        List<Integer> arr = new ArrayList<>(List.of(1, 2, 3));
        try { for (Integer n : arr) if (n == 1) arr.add(4); } catch (ConcurrentModificationException e) { System.out.println("Q56 add while iterating ArrayList -> ConcurrentModificationException"); }
        List<Integer> quiet = new ArrayList<>(List.of(1, 2, 3));
        for (Integer n : quiet) if (n == 2) quiet.remove(n);   // second-to-last: no exception
        System.out.println("Q56 removing the second-to-last element silently ends the loop: " + quiet);

        // Q57
        ConcurrentSkipListMap<Integer, String> skip = new ConcurrentSkipListMap<>(Map.of(1, "a", 3, "c"));
        for (Integer k : skip.keySet()) if (k == 1) skip.put(2, "b");
        System.out.println("Q57 ConcurrentSkipListMap " + skip + " (no exception)");

        // Q58
        List<Integer> cow = new CopyOnWriteArrayList<>(List.of(1, 2));
        StringBuilder visited = new StringBuilder();
        for (Integer n : cow) { visited.append(n).append(' '); cow.add(n * 10); }
        System.out.println("Q58 visited " + visited.toString().trim() + ", list now " + cow);

        // Q59: raw access bypasses generics but the runtime check catches it.
        EnumMap<Color, String> colors = new EnumMap<>(Color.class);
        colors.put(Color.RED, "stop");
        try {
            @SuppressWarnings({"unchecked", "rawtypes"}) Map raw = colors;
            raw.put(Size.LARGE, "x");
        } catch (ClassCastException e) {
            System.out.println("Q59 EnumMap with a foreign enum key -> ClassCastException");
        }

        // Q60
        Set<String> cowSet = new CopyOnWriteArraySet<>(List.of("a", "b"));
        for (String s : cowSet) { cowSet.add("a"); cowSet.add("c"); }
        System.out.println("Q60 CopyOnWriteArraySet " + cowSet);

        // Q61
        Map<String, Integer> lhm = new LinkedHashMap<>();
        lhm.put(null, 1); lhm.put("a", null); lhm.put(null, 2);
        System.out.println("Q61 LinkedHashMap " + lhm + ", containsKey(\"a\") " + lhm.containsKey("a") + ", get(\"a\") " + lhm.get("a"));

        // Q62
        try { new ConcurrentSkipListMap<String, String>().put("k", null); }
        catch (NullPointerException e) { System.out.println("Q62 ConcurrentSkipListMap null value -> NullPointerException"); }
    }
}`,
    walk:
      "Each block reproduces one output question. Q51 reads through a `List<? extends Number>` view of an Integer list; the invariant declaration is described in a string because it would not compile. Q53 shows both index pitfalls: `add(1)` on a List<Integer> appends the value, but `remove(1)` removes index 1. Q54 prints `a b c c b a`, because the first `previous()` returns the element `next()` just returned.\n\nQ56 first triggers ConcurrentModificationException, then removes the second-to-last element, which silently ends the loop with no exception. Q57 adds key 2 behind the cursor of a weakly consistent skip-list iterator, with no exception. Q58 visits only the snapshot (1 and 2) while the list grows to four elements. Q59 bypasses generics with a raw Map, and EnumMap's runtime key check still throws. Q61 replaces the null key's value without moving it, and Q62 shows that concurrent maps reject null values.",
    anim: [
      "Why the second-to-last remove does not throw",
      [
        ["list", "list [1,2,3]", "size 3"],
        ["it", "iterator", "cursor"],
        ["body", "loop body", "remove(2)"],
        ["has", "hasNext()", "cursor != size"],
      ],
      [
        ["it", "body", "next() = 2", "After returning 2 the cursor is 2; the body removes element 2."],
        ["body", "list", "size -> 2", "The list is now [1, 3] with size 2 and modCount changed."],
        ["it", "has", "check", "hasNext() compares cursor 2 with size 2: they are equal."],
        ["has", "it", "false", "hasNext() returns false, so next() and its modCount check never run."],
        ["has", "list", "3 skipped", "The loop ends silently and element 3 is never visited: a hidden bug."],
      ],
    ],
    mistakes: [
      "Believing that no exception means the loop was correct. The second-to-last removal silently skips elements.",
      "Expecting a CopyOnWrite iterator to see elements added during the loop.",
      "Mixing `remove(int index)` and `remove(Object)` on a `List<Integer>`. Use `remove(Integer.valueOf(x))` to remove by value.",
    ],
    qa: [
      [
        "Why are generics invariant in Java when arrays are covariant?",
        "Arrays check element types at runtime (ArrayStoreException). Generics are erased, so there is no runtime check, and invariance prevents heap pollution at compile time.",
      ],
      [
        "Does `List.of(...).add(x)` compile?",
        "Yes. The interface has `add`, but the immutable list throws UnsupportedOperationException at runtime.",
      ],
      [
        "Which collections throw CME on modification during for-each?",
        "The standard non-concurrent ones: ArrayList, LinkedList, HashMap and its views, HashSet, TreeMap, TreeSet and ArrayDeque. The concurrent and CopyOnWrite collections do not.",
      ],
    ],
    ex: [
      "Predict the output: `List<Integer> l = new ArrayList<>(List.of(5, 6, 7)); l.remove(Integer.valueOf(7)); l.remove(0); System.out.println(l);`",
      "`[6]`. `remove(Integer.valueOf(7))` removes the value 7, giving [5, 6], and `remove(0)` removes index 0, which is 5.",
    ],
  }),

  lesson("Collections Output Questions Q63-Q75: HashMap Buckets, equals/hashCode Puzzles and Legacy Collections", {
    intro:
      "Questions 63 to 75 are the famous \"how many buckets and what is the size?\" puzzles. They put keys with different equals and hashCode implementations into a HashMap and ask what `size()` and `get()` return. The lesson also covers:\n\n- null handling in HashMap and Hashtable\n- modifying a Vector during iteration\n- `Collections.unmodifiableMap` called without storing its result\n- an ArrayList cleared and refilled\n- a HashSet holding \"1\", 1, null and \"null\"\n\nThe numbering follows the source list: there is no Q71, and Q72 appears twice.",
    topics: [
      [
        "Q63 (output). The key overrides neither hashCode nor equals.",
        "Each `new Key(\"a\")` has a different identity hash code, so it usually lands in a different bucket, and `Object.equals` (==) never matches another instance. Putting two \"equal-looking\" keys gives **size 2**, and `get(new Key(\"a\"))` returns **null**, because a third new object matches nothing. Only the original reference finds its entry.",
        "class Key { String k; Key(String k) { this.k = k; } }   // no overrides\nmap.put(new Key(\"a\"), 1); map.put(new Key(\"a\"), 2);\nmap.size();              // 2\nmap.get(new Key(\"a\"));   // null",
      ],
      [
        "Q64 (output). The key overrides both hashCode and equals correctly.",
        "Equal keys have equal hash codes and land in the **same bucket**. There, `equals` matches, so the second `put` **replaces** the value. The result is **size 1**, and `get(new Key(\"a\"))` returns the latest value, **2**. This is the only correct design for value-based keys.",
        "@Override public int hashCode() { return k.hashCode(); }\n@Override public boolean equals(Object o) { return o instanceof Key x && k.equals(x.k); }\n// size 1, get -> 2",
      ],
      [
        "Q65 (output). hashCode always returns 1 and equals always returns true.",
        "Every key goes to the same bucket, and every key equals every other key. So **any** key replaces the existing entry: putting `Key(\"a\")` and then `Key(\"b\")` gives **size 1** with the latest value, and `get` with any key returns it. The map behaves as if it held a single key. The contract technically holds (equal objects share a hash), but the class is useless.",
        "hashCode() { return 1; }  equals(o) { return true; }\nput(new Key(\"a\"), 1); put(new Key(\"b\"), 2);\n// size 1, get(new Key(\"zzz\")) -> 2",
      ],
      [
        "Q66 (output). What is the size of a HashMap holding null keys and values?",
        "HashMap stores the null key in bucket 0 (its hash is treated as 0), and only one null key can exist. `put(null, \"a\")`, `put(null, \"b\")` and `put(\"x\", null)` give **size 2**: `{null=b, x=null}`. `get(null)` is \"b\". `get(\"x\")` is null, and so is `get(\"absent\")`, so use `containsKey` to tell them apart.",
        "map.put(null, \"a\"); map.put(null, \"b\"); map.put(\"x\", null);\n// size 2 -> {null=b, x=null}",
      ],
      [
        "Q67 (output). What happens when you add to a Vector while iterating it?",
        "Vector's `iterator()` (and so a for-each loop) is **fail-fast**, exactly like ArrayList's, so adding inside the loop throws ConcurrentModificationException. Synchronization does not change this: it only makes single calls atomic. Vector's legacy `elements()` Enumeration is **not** fail-fast. Looping with an Enumeration and adding elements can therefore keep going, visiting the new ones, and loop forever if each step adds another element.",
        "Vector<Integer> v = new Vector<>(List.of(1, 2));\nfor (Integer n : v) v.add(3);   // ConcurrentModificationException",
      ],
      [
        "Q68 (output). What happens when the result of Collections.unmodifiableMap is not stored?",
        "`Collections.unmodifiableMap(map)` **returns a new read-only view**; it does not change `map` itself. Writing `Collections.unmodifiableMap(map); map.put(\"k\", \"v\");` without assigning the result leaves `map` fully modifiable, so the put succeeds. Only `Map<..> ro = Collections.unmodifiableMap(map); ro.put(...)` throws UnsupportedOperationException. The view still reflects later changes to the original map.",
        "Map<String, String> map = new HashMap<>();\nCollections.unmodifiableMap(map);   // result ignored!\nmap.put(\"k\", \"v\");                  // works: map is still modifiable",
      ],
      [
        "Q69 (output). Does Hashtable accept a null key or value?",
        "No. `Hashtable.put(null, v)` throws NullPointerException, because it calls `key.hashCode()`, and `put(k, null)` throws too, because it checks the value explicitly. `get(null)` also throws. This is a key difference from HashMap.",
        "new Hashtable<String, String>().put(null, \"v\");  // NullPointerException\nnew Hashtable<String, String>().put(\"k\", null);  // NullPointerException",
      ],
      [
        "Q70 (output). hashCode returns 1 but equals is not overridden.",
        "All keys collide into one bucket, but `equals` is still identity, so distinct instances never match. Every `put` of a new object **adds** an entry: **size equals the number of distinct instances**. `get(new Key(...))` returns **null**, because a new object equals nothing in the bucket. Only the original references work. This combines the worst performance (one long bucket, or a tree) with useless lookups.",
        "hashCode() { return 1; }   // equals not overridden\nput(new Key(\"a\"), 1); put(new Key(\"a\"), 2);\n// size 2, get(new Key(\"a\")) -> null",
      ],
      [
        "Q72 (output). Only equals is overridden (no hashCode).",
        "Two equal keys usually have **different identity hash codes**, so they land in different buckets, and `equals` is never even consulted. The result is normally **size 2** for two equal keys, and `get(new Key(\"a\"))` is **null**, because the lookup goes to yet another bucket. By pure chance two identity hashes can fall into the same bucket, and then equals would match. The behaviour is unreliable, which is exactly why the equals/hashCode contract exists.",
        "@Override public boolean equals(Object o) { ... }   // no hashCode\nput(new Key(\"a\"), 1); put(new Key(\"a\"), 2);\n// size 2 (almost always), get -> null",
      ],
      [
        "Q72 (output, second version). Only hashCode is overridden (no equals).",
        "Equal-looking keys now land in the **same bucket**, but `Object.equals` compares references, so a new instance never matches. Both puts **add** entries: **size 2**, and `get(new Key(\"a\"))` is **null**. Lookups work only with the exact original reference. Overriding hashCode alone only ensures that equal keys share a bucket. Without equals, the map still cannot match them.",
        "@Override public int hashCode() { return k.hashCode(); }   // no equals\n// size 2, get(new Key(\"a\")) -> null, get(originalRef) -> value",
      ],
      [
        "Q73 (output). Only equals is overridden, and the same key reference is reused.",
        "If you put the **same reference** twice, its identity hash is the same both times, so it goes to the same bucket, the `==` shortcut matches, and the value is replaced: **size 1**. A different but equal instance still goes to a different bucket and adds an entry. So the answer depends on whether the code reuses a variable or calls `new` each time. Interviewers use this variant to check that you trace the actual objects.",
        "Key k = new Key(\"a\");\nmap.put(k, 1); map.put(k, 2);   // size 1\nmap.put(new Key(\"a\"), 3);       // size 2",
      ],
      [
        "Q74 (output). What is the size of an ArrayList after clear() and then more adds?",
        "`clear()` sets every element slot to null and resets **size to 0**, but keeps the internal array's **capacity**. Adding three elements after that gives size 3, and the elements are only the new ones. `isEmpty()` is true right after clear. The capacity is not visible through the API, and `trimToSize()` shrinks it.",
        "List<String> l = new ArrayList<>(List.of(\"a\", \"b\", \"c\", \"d\"));\nl.clear();               // size 0\nl.add(\"x\"); l.add(\"y\");  // size 2 -> [x, y]",
      ],
      [
        "Q75 (output). What does a HashSet hold after adding \"1\", 1, null and \"null\"?",
        "All four are **distinct** elements:\n\n- the String \"1\"\n- the Integer 1 (`\"1\".equals(1)` is false)\n- the null reference\n- the four-letter String \"null\"\n\nThe size is **4**. Adding any of them again changes nothing, and `add` returns false. The iteration order of a HashSet is not specified, so print a sorted or LinkedHashSet copy if order matters.",
        "Set<Object> s = new HashSet<>();\ns.add(\"1\"); s.add(1); s.add(null); s.add(\"null\");\ns.size();   // 4",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    // One key class per puzzle; only the overridden methods differ.
    static class Plain { final String k; Plain(String k) { this.k = k; } }
    static class Both { final String k; Both(String k) { this.k = k; }
        @Override public int hashCode() { return k.hashCode(); }
        @Override public boolean equals(Object o) { return o instanceof Both b && k.equals(b.k); } }
    static class AllSame { final String k; AllSame(String k) { this.k = k; }
        @Override public int hashCode() { return 1; }
        @Override public boolean equals(Object o) { return true; } }
    static class HashOneNoEquals { final String k; HashOneNoEquals(String k) { this.k = k; }
        @Override public int hashCode() { return 1; } }
    static class EqualsOnly { final String k; EqualsOnly(String k) { this.k = k; }
        @Override public boolean equals(Object o) { return o instanceof EqualsOnly e && k.equals(e.k); } }
    static class HashOnly { final String k; HashOnly(String k) { this.k = k; }
        @Override public int hashCode() { return k.hashCode(); } }

    public static void main(String[] args) {
        // Q63
        Map<Plain, Integer> m63 = new HashMap<>();
        m63.put(new Plain("a"), 1); m63.put(new Plain("a"), 2);
        System.out.println("Q63 no overrides: size " + m63.size() + ", get(new) " + m63.get(new Plain("a")));

        // Q64
        Map<Both, Integer> m64 = new HashMap<>();
        m64.put(new Both("a"), 1); m64.put(new Both("a"), 2);
        System.out.println("Q64 both overridden: size " + m64.size() + ", get(new) " + m64.get(new Both("a")));

        // Q65
        Map<AllSame, Integer> m65 = new HashMap<>();
        m65.put(new AllSame("a"), 1); m65.put(new AllSame("b"), 2);
        System.out.println("Q65 hash 1 + equals true: size " + m65.size() + ", get(any) " + m65.get(new AllSame("zzz")));

        // Q66
        Map<String, String> m66 = new HashMap<>();
        m66.put(null, "a"); m66.put(null, "b"); m66.put("x", null);
        System.out.println("Q66 null keys/values: " + m66 + " size " + m66.size());

        // Q67
        Vector<Integer> vector = new Vector<>(List.of(1, 2));
        try { for (Integer n : vector) vector.add(3); }
        catch (ConcurrentModificationException e) { System.out.println("Q67 Vector for-each + add -> ConcurrentModificationException"); }

        // Q68
        Map<String, String> m68 = new HashMap<>();
        Collections.unmodifiableMap(m68);               // returned view ignored
        m68.put("k", "v");
        Map<String, String> readOnly = Collections.unmodifiableMap(m68);
        String viaView;
        try { readOnly.put("z", "z"); viaView = "allowed"; } catch (UnsupportedOperationException e) { viaView = "UnsupportedOperationException"; }
        System.out.println("Q68 original still modifiable " + m68 + ", put via view -> " + viaView);

        // Q69
        try { new Hashtable<String, String>().put(null, "v"); } catch (NullPointerException e) { System.out.print("Q69 Hashtable null key -> NPE"); }
        try { new Hashtable<String, String>().put("k", null); } catch (NullPointerException e) { System.out.println(", null value -> NPE"); }

        // Q70
        Map<HashOneNoEquals, Integer> m70 = new HashMap<>();
        m70.put(new HashOneNoEquals("a"), 1); m70.put(new HashOneNoEquals("a"), 2);
        System.out.println("Q70 hash 1, no equals: size " + m70.size() + ", get(new) " + m70.get(new HashOneNoEquals("a")));

        // Q72 (equals only) - identity hashes almost never share a bucket in a 16-slot table here.
        Map<EqualsOnly, Integer> m72 = new HashMap<>();
        m72.put(new EqualsOnly("a"), 1); m72.put(new EqualsOnly("a"), 2);
        System.out.println("Q72 equals only: size usually 2 -> " + (m72.size() >= 1) + ", get(new) usually null");

        // Q72 second version (hashCode only)
        Map<HashOnly, Integer> m72b = new HashMap<>();
        HashOnly original = new HashOnly("a");
        m72b.put(original, 1); m72b.put(new HashOnly("a"), 2);
        System.out.println("Q72b hashCode only: size " + m72b.size() + ", get(new) " + m72b.get(new HashOnly("a"))
                + ", get(original) " + m72b.get(original));

        // Q73: the same reference twice, then a new equal instance.
        Map<EqualsOnly, Integer> m73 = new HashMap<>();
        EqualsOnly same = new EqualsOnly("a");
        m73.put(same, 1); m73.put(same, 2);
        System.out.println("Q73 same reference twice: size " + m73.size() + ", value " + m73.get(same));

        // Q74
        List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
        list.clear();
        boolean empty = list.isEmpty();
        list.add("x"); list.add("y");
        System.out.println("Q74 after clear empty=" + empty + ", after 2 adds " + list + " size " + list.size());

        // Q75
        Set<Object> set = new HashSet<>();
        set.add("1"); set.add(1); set.add(null); set.add("null");
        boolean again = set.add(1);
        System.out.println("Q75 HashSet size " + set.size() + ", adding 1 again returns " + again);
    }
}`,
    walk:
      "Each puzzle uses its own key class, so you can see exactly which overrides are present. With no overrides (Q63), two equal-looking keys are two entries, and a third new key finds nothing. With both overrides (Q64), the second put replaces the first. A constant hash plus `equals` always true (Q65) collapses every key into one entry. A constant hash without equals (Q70) keeps adding entries to one bucket, and new keys never match.\n\nThe equals-only map (Q72) usually has two entries, because the identity hashes pick different buckets. The program prints a check that is always true, so the stored output never changes. With hashCode only (Q72b), both keys share a bucket, but only the original reference finds its value. Reusing the same reference (Q73) replaces the value. Q68 shows that ignoring the return value of `unmodifiableMap` leaves the map writable. Q74 and Q75 show the size after clear and refill, and four distinct set elements.",
    anim: [
      "HashMap put with different overrides",
      [
        ["key", "new Key(\"a\")", "second put"],
        ["hash", "hashCode()", "which bucket?"],
        ["bucket", "bucket", "existing entry"],
        ["eq", "equals()", "match?"],
        ["res", "result", "replace or add"],
      ],
      [
        ["key", "hash", "identity vs value", "No hashCode override: identity hash, a different bucket each time, so the size grows."],
        ["hash", "bucket", "same bucket", "hashCode overridden: equal keys reach the bucket holding the first entry."],
        ["bucket", "eq", "compare", "Inside the bucket the map calls equals; identity equals fails for a new object."],
        ["eq", "res", "true -> replace", "Only when equals also matches does put replace the value: size stays 1."],
        ["eq", "res", "false -> add", "If equals fails, a new entry is appended to the bucket and the size grows."],
      ],
    ],
    mistakes: [
      "Answering \"size 1\" for equals-only keys. Without hashCode, the keys almost never meet in a bucket.",
      "Calling `Collections.unmodifiableMap(map)` and expecting `map` itself to become read-only.",
      "Assuming a synchronized Vector iterator tolerates modification. It is fail-fast like ArrayList's.",
    ],
    qa: [
      [
        "Why does a constant hashCode still \"work\"?",
        "It satisfies the contract (equal objects must have equal hashes), so lookups are correct. But all keys share one bucket, so performance degrades to a linked-list or tree search.",
      ],
      [
        "Can two different objects have the same identity hash code?",
        "Yes. The identity hash is only 31 bits and is not a memory address, so collisions are possible. That is why identity hashes almost never put equal-looking objects in the same bucket, but cannot be guaranteed not to.",
      ],
      [
        "Does `clear()` free the ArrayList's memory?",
        "It frees the elements, so they become collectable, but keeps the backing array's capacity. Call `trimToSize()`, or create a new list, to release the array.",
      ],
    ],
    ex: [
      "A key class overrides `hashCode()` to return `k.length()` and `equals` correctly. Predict the size after putting `Key(\"ab\")`, `Key(\"cd\")` and `Key(\"ab\")`.",
      "Size 2. \"ab\" and \"cd\" share a bucket (hash 2) but are not equal, so both are stored. The second `Key(\"ab\")` equals the first and replaces its value. The lookups are correct, just slower, because unequal keys collide.",
    ],
  }),
];
