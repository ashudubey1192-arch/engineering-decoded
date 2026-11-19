import { lesson, section } from "../schema.js";

export default section("equals-and-hashcode", "equals() and hashCode()", [
  lesson("Overriding equals() and hashCode()", {
    intro:
      "Hash-based collections (`HashMap`, `HashSet`, `ConcurrentHashMap`) find objects in two steps: `hashCode()` picks a bucket and `equals()` finds the exact match inside it. If you override one method without the other, those collections silently break. This lesson explains the `equals` and `hashCode` contracts, how to implement them correctly, and what goes wrong otherwise.",
    topics: [
      [
        "The equals() contract",
        "Reflexive: `x.equals(x)` is true. Symmetric: `x.equals(y)` equals `y.equals(x)`. Transitive: if x equals y and y equals z, then x equals z. Consistent: repeated calls give the same result while the objects do not change. And `x.equals(null)` is false. The parameter must be `Object`, not your class.",
      ],
      [
        "The hashCode() contract",
        "Equal objects must have equal hash codes. Unequal objects may share a hash code (a collision), but fewer collisions mean faster maps. The value must stay the same while the fields used in `equals` do not change.",
      ],
      [
        "Writing them correctly",
        "In `equals`: return true for the same reference, false for null or a different class (use `getClass() != o.getClass()` for strict equality or a pattern `instanceof` for final classes), then compare the significant fields (`Objects.equals` for references, `==` for ints, `Double.compare` for doubles). In `hashCode`: combine the same fields, for example `Objects.hash(id, name)` or `31 * result + field`. Use exactly the same fields in both.",
      ],
      [
        "What happens if you override only one",
        "Only `equals`: two equal employees get different default (identity-based) hash codes, land in different buckets, and a `HashSet` stores both while `map.get(equalKey)` returns null. Only `hashCode`: equal-looking objects share a bucket but `equals` still compares identity, so lookups with a new but equal key still fail.",
      ],
      [
        "Mutable keys",
        "If a field used in `hashCode` changes after the object is put in a `HashMap`, the object sits in the wrong bucket and cannot be found or removed. Use immutable fields (an id) for equality, or never change keys while they are in a hash collection. Records implement both methods for you.",
      ],
    ],
    code: String.raw`import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public class Main {
    static class NoOverrides {
        final int id; final String name;
        NoOverrides(int id, String name) { this.id = id; this.name = name; }
    }

    static class EqualsOnly {
        final int id; final String name;
        EqualsOnly(int id, String name) { this.id = id; this.name = name; }
        @Override public boolean equals(Object o) {
            return o instanceof EqualsOnly e && id == e.id && Objects.equals(name, e.name);
        }
    }

    static final class Employee {
        private final int id;
        private final String name;
        Employee(int id, String name) { this.id = id; this.name = name; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;                            // reflexive, fast path
            if (o == null || getClass() != o.getClass()) return false;
            Employee other = (Employee) o;
            return id == other.id && Objects.equals(name, other.name);
        }
        @Override public int hashCode() { return Objects.hash(id, name); }   // same fields as equals
        public String toString() { return name + "#" + id; }
    }

    static class MutableKey {
        String code;
        MutableKey(String code) { this.code = code; }
        @Override public boolean equals(Object o) { return o instanceof MutableKey m && code.equals(m.code); }
        @Override public int hashCode() { return code.hashCode(); }
    }

    public static void main(String[] args) {
        Set<NoOverrides> a = new HashSet<>(java.util.List.of(new NoOverrides(1, "Asha"), new NoOverrides(1, "Asha")));
        Set<EqualsOnly> b = new HashSet<>(java.util.List.of(new EqualsOnly(1, "Asha"), new EqualsOnly(1, "Asha")));
        Set<Employee> c = new HashSet<>(java.util.List.of(new Employee(1, "Asha"), new Employee(1, "Asha")));
        System.out.println("no overrides  -> set size " + a.size());
        System.out.println("equals only   -> set size " + b.size() + " (duplicates slip in)");
        System.out.println("both methods  -> set size " + c.size());

        Map<Employee, String> desks = new HashMap<>();
        desks.put(new Employee(7, "Ravi"), "Desk 42");
        System.out.println("lookup with an equal new key: " + desks.get(new Employee(7, "Ravi")));

        Employee x = new Employee(3, "Meera"), y = new Employee(3, "Meera"), z = new Employee(3, "Meera");
        System.out.println("reflexive " + x.equals(x) + ", symmetric " + (x.equals(y) == y.equals(x))
                + ", transitive " + (x.equals(y) && y.equals(z) && x.equals(z)) + ", null " + x.equals(null)
                + ", equal hashes " + (x.hashCode() == y.hashCode()));

        Map<MutableKey, Integer> stock = new HashMap<>();
        MutableKey key = new MutableKey("PEN");
        stock.put(key, 10);
        key.code = "PENCIL";                                   // mutate a key inside the map
        System.out.println("after mutating key: get(original) = " + stock.get(new MutableKey("PEN"))
                + ", get(same object) = " + stock.get(key) + ", size = " + stock.size());
    }
}`,
    walk:
      "Two identical `NoOverrides` objects are different to a `HashSet`, which is expected without overrides. `EqualsOnly` is the dangerous case: `equals` says they are equal, but the default hash codes differ, so both are stored. `Employee` overrides both with the same fields, so the set keeps one, and a brand-new but equal key finds \"Desk 42\" in the map.\n\nThe contract checks all pass. Finally, a key is mutated after insertion: it now lives in the bucket for \"PEN\" but has the hash of \"PENCIL\", so neither the old value nor the same object can find the entry, even though the map still has one entry.",
    anim: [
      "HashMap lookup uses both methods",
      [
        ["key", "get(new Emp(7))", "lookup key"],
        ["hash", "hashCode()", "pick bucket"],
        ["bucket", "bucket 5", "candidates"],
        ["eq", "equals()", "compare"],
        ["val", "\"Desk 42\"", "found"],
      ],
      [
        ["key", "hash", "step 1", "The map calls hashCode() on the key to compute a bucket index."],
        ["hash", "bucket", "index", "Equal objects must produce the same hash, or the lookup goes to the wrong bucket."],
        ["bucket", "eq", "step 2", "Inside the bucket, equals() is called on each entry to find the exact key."],
        ["eq", "val", "match", "Only when both methods agree is the value returned."],
      ],
    ],
    mistakes: [
      "Overriding equals without hashCode (or using different fields in each).",
      "Writing `equals(Employee e)` instead of `equals(Object o)`.",
      "Using mutable fields in hashCode and changing them while the object is in a hash collection.",
    ],
    qa: [
      ["What is the contract between equals and hashCode?", "If two objects are equal according to equals, they must have the same hashCode. Equal hash codes do not imply equality."],
      ["What happens if you override equals but not hashCode?", "Equal objects get different hash codes, so HashMap and HashSet treat them as different keys: duplicates appear and lookups fail."],
      ["Why use 31 in hashCode calculations?", "It is an odd prime that spreads values well, and `31 * i` can be optimised to `(i << 5) - i`."],
    ],
    ex: [
      "Two employees should be equal when their ids match, regardless of name. Rewrite equals and hashCode.",
      "`equals`: same class and `id == other.id`. `hashCode`: `Integer.hashCode(id)`. Both must use only the id, otherwise equal objects could have different hashes.",
    ],
  }),

  lesson("Wrapper Classes and String as HashMap Keys", {
    intro:
      "`String`, `Integer`, `Long` and the other wrappers are the most common HashMap keys, and they work perfectly out of the box. This lesson explains why: they are immutable, they override `equals` and `hashCode` correctly, and their hash codes are cheap. It also shows exactly how an `Integer` key is hashed and placed into a bucket.",
    topics: [
      [
        "Why wrappers and String make ideal keys",
        "They are immutable, so their hash never changes after insertion. They override `equals` to compare values and `hashCode` consistently. They are final, so no subclass can break the contract. `String` additionally caches its hash code after the first computation.",
      ],
      [
        "How Integer works as a key",
        "`Integer.hashCode()` simply returns the int value itself. `HashMap` then spreads it with `hash = h ^ (h >>> 16)` and picks the bucket with `(capacity - 1) & hash`. For small keys in a 16-bucket map, key 5 goes to bucket 5, and key 21 also goes to bucket 5 (21 & 15 = 5), creating a collision that is resolved with `equals`.",
      ],
      [
        "How String hashes",
        "`String.hashCode()` computes `s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]` with int overflow. Different strings can collide; the famous pair is \"Aa\" and \"BB\", which both hash to 2112. `equals` then tells them apart.",
      ],
      [
        "Other wrappers",
        "`Long.hashCode()` is `(int) (value ^ (value >>> 32))`, `Boolean` uses 1231 and 1237, `Double` hashes its bit pattern (so `0.0` and `-0.0` are different keys and `NaN` equals `NaN` as a key), and `Character` returns its code.",
      ],
    ],
    code: String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    static int spread(int h) { return h ^ (h >>> 16); }          // what HashMap does
    static int bucket(Object key, int capacity) { return (capacity - 1) & spread(key.hashCode()); }

    public static void main(String[] args) {
        int capacity = 16;
        for (Integer key : new Integer[] {5, 21, 37, 100}) {
            System.out.println("Integer " + key + ": hashCode=" + key.hashCode() + " bucket=" + bucket(key, capacity));
        }

        System.out.println("\"Aa\".hashCode()=" + "Aa".hashCode() + ", \"BB\".hashCode()=" + "BB".hashCode()
                + ", equal? " + "Aa".equals("BB"));
        Map<String, Integer> collide = new HashMap<>();
        collide.put("Aa", 1);
        collide.put("BB", 2);
        System.out.println("colliding keys stored separately: " + collide.get("Aa") + ", " + collide.get("BB"));

        String s = "java";
        int manual = 0;
        for (char ch : s.toCharArray()) manual = 31 * manual + ch;
        System.out.println("manual hash of \"java\" = " + manual + ", String.hashCode() = " + s.hashCode());

        System.out.println("Long 5 hash=" + Long.valueOf(5).hashCode() + ", Boolean true/false=" + Boolean.TRUE.hashCode()
                + "/" + Boolean.FALSE.hashCode() + ", Character 'A'=" + Character.valueOf('A').hashCode());

        Map<Double, String> doubles = new HashMap<>();
        doubles.put(0.0, "positive zero");
        doubles.put(-0.0, "negative zero");
        doubles.put(Double.NaN, "not a number");
        System.out.println("0.0 and -0.0 are different keys: " + doubles.size() + " entries, NaN found: " + doubles.get(Double.NaN));

        Map<Integer, String> users = new HashMap<>();
        users.put(1001, "Asha");
        System.out.println("new Integer object finds entry: " + users.get(Integer.valueOf(1001)));
    }
}`,
    walk:
      "For `Integer` keys the hash code is the value itself; after spreading, the bucket is the low 4 bits for a 16-bucket table, so 5, 21 and 37 all land in bucket 5 and 100 lands in bucket 4. \"Aa\" and \"BB\" have the same hash 2112, yet the map keeps both because `equals` distinguishes them.\n\nThe manual loop reproduces `String.hashCode()` with the 31 multiplier. The other wrappers' hash codes and the `Double` special cases (+0.0 and -0.0 differ, NaN is findable) follow. Finally a different `Integer` object with the same value finds the entry, because lookups use `equals`, not identity.",
    anim: [
      "From Integer key to bucket",
      [
        ["key", "Integer 21", "key"],
        ["hc", "hashCode()", "= 21"],
        ["spread", "h ^ (h >>> 16)", "= 21"],
        ["mask", "& (16 - 1)", "21 & 15"],
        ["bucket", "bucket 5", "with key 5"],
      ],
      [
        ["key", "hc", "hash", "Integer.hashCode() returns the int value, 21."],
        ["hc", "spread", "mix", "HashMap mixes high bits into low bits; small values are unchanged."],
        ["spread", "mask", "index", "The bucket index keeps only the low 4 bits for 16 buckets."],
        ["mask", "bucket", "5", "21 & 15 is 5, the same bucket as key 5, so equals() separates them."],
      ],
    ],
    mistakes: [
      "Using `Double` keys computed by arithmetic, which may differ in the last bit and never match.",
      "Assuming different strings always have different hash codes.",
    ],
    qa: [
      ["Why is String a popular HashMap key?", "It is immutable, final, overrides equals and hashCode correctly, and caches its hash code."],
      ["What does Integer.hashCode() return?", "The int value itself."],
      ["Can two different strings have the same hashCode?", "Yes, for example \"Aa\" and \"BB\"; HashMap handles this collision with equals."],
    ],
    ex: [
      "Which bucket (capacity 16) does the key `Integer.valueOf(65536 + 3)` go to? Remember the spread step.",
      "h = 65539, h >>> 16 = 1, h ^ 1 = 65538, and 65538 & 15 = 2, so bucket 2. Without spreading it would have been bucket 3.",
    ],
  }),

  lesson("Employee as a Key in a Custom HashMap", {
    intro:
      "The best way to understand `HashMap` is to build one. This lesson implements a small hash map from scratch, with an array of buckets, linked entry chains, `put`, `get`, `remove` and resizing, and uses an `Employee` with proper `equals` and `hashCode` as the key. You will see exactly where each method of the key is called.",
    topics: [
      [
        "Structure",
        "An array of buckets, each the head of a singly linked list of entries. Each entry stores the key, value, cached hash and a `next` pointer. The bucket index is `hash & (capacity - 1)`, so capacity is kept a power of two. `null` keys go to bucket 0.",
      ],
      [
        "put(key, value)",
        "Compute the hash and bucket, walk the chain. If an entry has the same hash and `equals` the key, replace its value and return the old one. Otherwise add a new entry at the head of the chain, increase the size, and resize if size exceeds capacity times the load factor (0.75).",
      ],
      [
        "get(key) and remove(key)",
        "`get` walks the chain of the key's bucket and returns the value of the entry whose key `equals` the requested key, or null. `remove` does the same but unlinks the entry, keeping a pointer to the previous node.",
      ],
      [
        "Resizing (rehashing)",
        "When the table gets crowded, a new array of double the capacity is created and every entry is moved to its new bucket, because the index depends on the capacity. The real `HashMap` also converts long chains (8 or more entries) into red-black trees.",
      ],
    ],
    code: String.raw`import java.util.Objects;

public class Main {
    static final class Employee {
        final int id; final String name;
        Employee(int id, String name) { this.id = id; this.name = name; }
        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Employee e)) return false;
            return id == e.id && name.equals(e.name);
        }
        @Override public int hashCode() { return id % 4; }   // deliberately weak hash to force collisions
        public String toString() { return name + "#" + id; }
    }

    static class MyHashMap<K, V> {
        static class Entry<K, V> {
            final K key; V value; final int hash; Entry<K, V> next;
            Entry(K key, V value, int hash, Entry<K, V> next) { this.key = key; this.value = value; this.hash = hash; this.next = next; }
        }

        private Entry<K, V>[] table;
        private int size;

        @SuppressWarnings("unchecked")
        MyHashMap(int capacity) { table = (Entry<K, V>[]) new Entry[capacity]; }

        private static int hash(Object key) { return key == null ? 0 : key.hashCode(); }
        private int index(int hash, int length) { return hash & (length - 1); }

        V put(K key, V value) {
            int h = hash(key), i = index(h, table.length);
            for (Entry<K, V> e = table[i]; e != null; e = e.next) {
                if (e.hash == h && Objects.equals(e.key, key)) { V old = e.value; e.value = value; return old; }
            }
            table[i] = new Entry<>(key, value, h, table[i]);      // insert at head of chain
            if (++size > table.length * 3 / 4) resize();
            return null;
        }

        V get(K key) {
            int h = hash(key);
            for (Entry<K, V> e = table[index(h, table.length)]; e != null; e = e.next)
                if (e.hash == h && Objects.equals(e.key, key)) return e.value;
            return null;
        }

        V remove(K key) {
            int h = hash(key), i = index(h, table.length);
            Entry<K, V> prev = null;
            for (Entry<K, V> e = table[i]; e != null; prev = e, e = e.next) {
                if (e.hash == h && Objects.equals(e.key, key)) {
                    if (prev == null) table[i] = e.next; else prev.next = e.next;
                    size--;
                    return e.value;
                }
            }
            return null;
        }

        @SuppressWarnings("unchecked")
        private void resize() {
            Entry<K, V>[] old = table;
            table = (Entry<K, V>[]) new Entry[old.length * 2];
            for (Entry<K, V> head : old)
                for (Entry<K, V> e = head; e != null; ) {
                    Entry<K, V> next = e.next;
                    int i = index(e.hash, table.length);
                    e.next = table[i];
                    table[i] = e;
                    e = next;
                }
            System.out.println("  resized to " + table.length + " buckets");
        }

        int size() { return size; }

        void printBuckets() {
            for (int i = 0; i < table.length; i++) {
                StringBuilder sb = new StringBuilder("  bucket " + i + ":");
                for (Entry<K, V> e = table[i]; e != null; e = e.next) sb.append(" [").append(e.key).append("=").append(e.value).append("]");
                System.out.println(sb);
            }
        }
    }

    public static void main(String[] args) {
        MyHashMap<Employee, String> desks = new MyHashMap<>(4);
        desks.put(new Employee(1, "Asha"), "D1");
        desks.put(new Employee(5, "Ravi"), "D5");     // 5 % 4 = 1: same bucket as Asha
        System.out.println("buckets after two puts:");
        desks.printBuckets();

        System.out.println("replace value, old = " + desks.put(new Employee(1, "Asha"), "D1-window"));
        desks.put(new Employee(2, "Meera"), "D2");
        desks.put(new Employee(3, "Neel"), "D3");     // size 4 > 3: resize
        desks.put(null, "visitor desk");
        System.out.println("buckets after resize:");
        desks.printBuckets();

        System.out.println("get Ravi (new but equal key): " + desks.get(new Employee(5, "Ravi")));
        System.out.println("get unknown: " + desks.get(new Employee(9, "Zoya")));
        System.out.println("remove Asha: " + desks.remove(new Employee(1, "Asha")) + ", size now " + desks.size());
        System.out.println("get Asha after remove: " + desks.get(new Employee(1, "Asha")));
        System.out.println("get null key: " + desks.get(null));
    }
}`,
    walk:
      "The `Employee` hash is deliberately weak (`id % 4`) so collisions are easy to see: Asha (1) and Ravi (5) land in the same bucket and form a chain, with the newest entry at the head.\n\nPutting Asha again with a new value finds the existing entry through `hashCode` and `equals`, replaces the value and returns the old one. The fourth entry pushes the size past 3 (75% of 4) and triggers a resize to 8 buckets, moving every entry to its new bucket. Lookups, removal and the null key all work through the same chain walking.",
    anim: [
      "put() with a collision",
      [
        ["k", "Ravi#5", "new key"],
        ["h", "hashCode = 1", "5 % 4"],
        ["b1", "bucket 1", "has Asha#1"],
        ["eq", "equals Asha?", "no"],
        ["chain", "chain", "Ravi -> Asha"],
      ],
      [
        ["k", "h", "hash", "put computes the key's hash: 1."],
        ["h", "b1", "index", "1 & (4 - 1) = 1, a bucket that already holds Asha."],
        ["b1", "eq", "compare", "The chain is walked: same hash, but equals says Ravi is not Asha."],
        ["eq", "chain", "link", "No match, so a new entry is linked at the head of bucket 1's chain."],
      ],
    ],
    mistakes: [
      "A constant or very weak hashCode, which turns the map into a linked list and makes operations O(n).",
      "Forgetting to rehash every entry on resize; indexes depend on the table length.",
    ],
    qa: [
      ["How does HashMap work internally?", "It keeps an array of buckets; the key's hash selects a bucket and equals finds the entry in that bucket's chain (or tree). It resizes when size exceeds capacity * load factor."],
      ["What is a collision and how is it handled?", "Two keys mapping to the same bucket; Java chains them in a linked list, turning long chains into red-black trees since Java 8."],
      ["Why must capacity be a power of two in HashMap?", "So the index can be computed with a fast bit mask, `hash & (n - 1)`, instead of a modulo."],
    ],
    ex: [
      "Add a `containsKey(K key)` method to `MyHashMap`. Why can it not simply be `get(key) != null`?",
      "Because a key can map to a null value. Walk the chain and return true when an entry's key matches, regardless of its value.",
    ],
  }),

  lesson("Employee as a Key in a Custom LinkedHashMap", {
    intro:
      "`LinkedHashMap` is a `HashMap` that also remembers order, either insertion order or access order, by threading a doubly linked list through its entries. This lesson builds a custom linked hash map with an `Employee` key, showing how the extra `before` and `after` pointers keep iteration order predictable, and how access order turns it into an LRU cache.",
    topics: [
      [
        "Structure",
        "Each entry has the usual `next` pointer for its bucket chain plus `before` and `after` pointers for a separate doubly linked list that runs through all entries. The map keeps `head` and `tail` references to that list.",
      ],
      [
        "put, get and remove",
        "`put` of a new key adds the entry to its bucket and appends it at the tail of the linked list. Replacing a value keeps the position in insertion-order mode. `remove` unlinks the entry from both the bucket chain and the doubly linked list in O(1).",
      ],
      [
        "Iteration order",
        "Iteration follows the linked list from head to tail, not the bucket array, so it is predictable and proportional to the size, not the capacity. A plain `HashMap` iterates in bucket order, which looks random.",
      ],
      [
        "Access order and LRU caches",
        "With `new LinkedHashMap<>(16, 0.75f, true)`, every `get` moves the entry to the tail. Overriding `removeEldestEntry` to return true when the size exceeds a limit evicts the head, the least recently used entry, giving a simple LRU cache.",
      ],
    ],
    code: String.raw`import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public class Main {
    record Employee(int id, String name) { }                 // record: equals/hashCode generated

    static class MyLinkedHashMap<K, V> {
        static class Entry<K, V> {
            final K key; V value; final int hash;
            Entry<K, V> next;            // bucket chain
            Entry<K, V> before, after;   // insertion-order list
            Entry(K key, V value, int hash) { this.key = key; this.value = value; this.hash = hash; }
        }

        @SuppressWarnings("unchecked")
        private final Entry<K, V>[] table = (Entry<K, V>[]) new Entry[8];
        private Entry<K, V> head, tail;
        private int size;

        private int index(int h) { return (h ^ (h >>> 16)) & (table.length - 1); }

        void put(K key, V value) {
            int h = Objects.hashCode(key), i = index(h);
            for (Entry<K, V> e = table[i]; e != null; e = e.next)
                if (e.hash == h && Objects.equals(e.key, key)) { e.value = value; return; }   // keeps position
            Entry<K, V> entry = new Entry<>(key, value, h);
            entry.next = table[i];
            table[i] = entry;
            if (tail == null) head = tail = entry;               // link at the end of the order list
            else { tail.after = entry; entry.before = tail; tail = entry; }
            size++;
        }

        V get(K key) {
            int h = Objects.hashCode(key);
            for (Entry<K, V> e = table[index(h)]; e != null; e = e.next)
                if (e.hash == h && Objects.equals(e.key, key)) return e.value;
            return null;
        }

        V remove(K key) {
            int h = Objects.hashCode(key), i = index(h);
            Entry<K, V> prev = null;
            for (Entry<K, V> e = table[i]; e != null; prev = e, e = e.next) {
                if (e.hash == h && Objects.equals(e.key, key)) {
                    if (prev == null) table[i] = e.next; else prev.next = e.next;          // unlink from bucket
                    if (e.before == null) head = e.after; else e.before.after = e.after;   // unlink from order list
                    if (e.after == null) tail = e.before; else e.after.before = e.before;
                    size--;
                    return e.value;
                }
            }
            return null;
        }

        String inOrder() {
            StringBuilder sb = new StringBuilder("{");
            for (Entry<K, V> e = head; e != null; e = e.after) sb.append(e.key.toString().replace("Employee", "")).append("=").append(e.value).append(e.after != null ? ", " : "");
            return sb.append("}").toString();
        }
    }

    public static void main(String[] args) {
        MyLinkedHashMap<Employee, String> roles = new MyLinkedHashMap<>();
        roles.put(new Employee(30, "Neel"), "QA");
        roles.put(new Employee(10, "Asha"), "Dev");
        roles.put(new Employee(20, "Ravi"), "Ops");
        System.out.println("insertion order: " + roles.inOrder());

        roles.put(new Employee(10, "Asha"), "Lead");             // replace keeps order
        System.out.println("after replacing Asha's value: " + roles.inOrder());
        System.out.println("get Ravi: " + roles.get(new Employee(20, "Ravi")));
        System.out.println("remove Neel: " + roles.remove(new Employee(30, "Neel")) + " -> " + roles.inOrder());
        roles.put(new Employee(40, "Meera"), "PM");
        System.out.println("append Meera: " + roles.inOrder());

        Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
            @Override protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) { return size() > 3; }
        };
        lru.put("a", 1); lru.put("b", 2); lru.put("c", 3);
        lru.get("a");                                              // a becomes most recent
        lru.put("d", 4);                                           // evicts least recent: b
        System.out.println("LRU cache with JDK LinkedHashMap: " + lru.keySet());
    }
}`,
    walk:
      "The custom map stores entries in buckets like a hash map, but also links each new entry after the current tail. Iterating from `head` therefore prints Neel, Asha, Ravi in insertion order, whatever their buckets are.\n\nReplacing Asha's value finds the existing entry and keeps its position. Removing Neel unlinks him from both the bucket chain and the order list in constant time, and a new employee is appended at the end. The last part uses the JDK's `LinkedHashMap` in access order with `removeEldestEntry`, so reading \"a\" protects it and adding \"d\" evicts \"b\".",
    anim: [
      "Buckets plus an order list",
      [
        ["head", "head", "first in"],
        ["neel", "Neel = QA", "bucket ?"],
        ["asha", "Asha = Dev", "bucket ?"],
        ["ravi", "Ravi = Ops", "bucket ?"],
        ["tail", "tail", "last in"],
      ],
      [
        ["head", "neel", "after", "head points to the first inserted entry, wherever its bucket is."],
        ["neel", "asha", "after", "Each entry's after pointer leads to the next inserted entry."],
        ["asha", "ravi", "after", "Iteration follows these links, giving insertion order."],
        ["ravi", "tail", "append", "New entries are linked after tail, so put stays O(1)."],
      ],
    ],
    mistakes: [
      "Expecting a plain `HashMap` to iterate in insertion order.",
      "Forgetting that `get` changes the order in an access-ordered `LinkedHashMap`, even in read-only code.",
    ],
    qa: [
      ["How does LinkedHashMap maintain order?", "It links all entries in a doubly linked list (before/after pointers) in addition to the hash buckets."],
      ["What is access order in LinkedHashMap?", "With the accessOrder constructor flag set to true, each get or put moves the entry to the end, so iteration goes from least to most recently used."],
      ["How do you build an LRU cache in Java?", "Extend LinkedHashMap with accessOrder = true and override removeEldestEntry to return true when size exceeds the capacity."],
    ],
    ex: [
      "In the LRU example, which keys remain if you call `lru.get(\"c\")` and then `lru.put(\"e\", 5)` afterwards?",
      "After the first part the order is c, a, d. Reading c makes it a, d, c; adding e evicts a, leaving [d, c, e].",
    ],
  }),

  lesson("Employee in a Custom HashSet and LinkedHashSet", {
    intro:
      "A `HashSet` is really a `HashMap` in disguise: elements are stored as keys and every value is the same dummy object. `LinkedHashSet` is the same idea backed by a `LinkedHashMap`. This lesson builds both on top of map implementations and uses an `Employee` element, showing why `equals` and `hashCode` decide what counts as a duplicate.",
    topics: [
      [
        "HashSet is backed by HashMap",
        "The JDK's `HashSet` holds a private `HashMap<E, Object>` and a constant `PRESENT` object. `add(e)` calls `map.put(e, PRESENT)` and returns true if the previous value was null (the element was new). `contains`, `remove` and `size` delegate to the map.",
      ],
      [
        "How duplicates are detected",
        "An element is a duplicate when an existing element has the same hash code and `equals` returns true. Without proper overrides in `Employee`, two employees with the same data are not duplicates.",
      ],
      [
        "LinkedHashSet",
        "Backed by a `LinkedHashMap`, so it keeps insertion order with the same O(1) operations. Re-adding an existing element does not change its position.",
      ],
      [
        "Custom implementations",
        "Writing `MyHashSet` and `MyLinkedHashSet` takes only a few lines once you have the maps: the set API is a thin wrapper. Iteration returns the map's keys.",
      ],
    ],
    code: String.raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class Main {
    static final class Employee {
        final int id; final String name;
        Employee(int id, String name) { this.id = id; this.name = name; }
        @Override public boolean equals(Object o) { return o instanceof Employee e && id == e.id && name.equals(e.name); }
        @Override public int hashCode() { return Objects.hash(id, name); }
        public String toString() { return name + "#" + id; }
    }

    static class MyHashSet<E> {
        private static final Object PRESENT = new Object();
        protected final Map<E, Object> map;
        MyHashSet() { this(new HashMap<>()); }
        protected MyHashSet(Map<E, Object> map) { this.map = map; }
        boolean add(E e) { return map.put(e, PRESENT) == null; }
        boolean contains(E e) { return map.containsKey(e); }
        boolean remove(E e) { return map.remove(e) == PRESENT; }
        int size() { return map.size(); }
        List<E> elements() { return new ArrayList<>(map.keySet()); }
    }

    static class MyLinkedHashSet<E> extends MyHashSet<E> {
        MyLinkedHashSet() { super(new LinkedHashMap<>()); }   // only the backing map differs
    }

    public static void main(String[] args) {
        MyHashSet<Employee> team = new MyHashSet<>();
        System.out.println("add Asha: " + team.add(new Employee(1, "Asha")));
        System.out.println("add Ravi: " + team.add(new Employee(2, "Ravi")));
        System.out.println("add equal Asha again: " + team.add(new Employee(1, "Asha")));
        System.out.println("size: " + team.size() + ", contains Ravi: " + team.contains(new Employee(2, "Ravi")));
        System.out.println("remove Ravi: " + team.remove(new Employee(2, "Ravi")) + ", remove again: " + team.remove(new Employee(2, "Ravi")));

        MyLinkedHashSet<Employee> ordered = new MyLinkedHashSet<>();
        for (Employee e : List.of(new Employee(30, "Neel"), new Employee(10, "Meera"), new Employee(20, "Zoya"),
                new Employee(10, "Meera"))) {
            ordered.add(e);
        }
        System.out.println("linked set keeps insertion order, no duplicate: " + ordered.elements());

        java.util.Set<Employee> jdk = new java.util.LinkedHashSet<>(ordered.elements());
        System.out.println("JDK LinkedHashSet agrees: " + jdk);
    }
}`,
    walk:
      "`MyHashSet` stores each element as a key in a `HashMap` with the shared `PRESENT` value. Adding a second, equal Asha returns false because `put` finds an equal key and returns the previous `PRESENT` value. `contains` and `remove` work with new but equal objects thanks to `equals` and `hashCode`; removing Ravi a second time returns false.\n\n`MyLinkedHashSet` is the same class with a `LinkedHashMap` underneath, so it keeps insertion order (Neel, Meera, Zoya) and ignores the duplicate Meera. The JDK's `LinkedHashSet` produces the same result.",
    anim: [
      "HashSet.add delegates to HashMap.put",
      [
        ["add", "add(Asha#1)", "set call"],
        ["put", "map.put", "key, PRESENT"],
        ["find", "existing key?", "hash + equals"],
        ["new", "returns null", "added: true"],
        ["dup", "returns PRESENT", "added: false"],
      ],
      [
        ["add", "put", "delegate", "The set stores the element as a map key with a dummy PRESENT value."],
        ["put", "find", "lookup", "HashMap looks for an equal key using hashCode and equals."],
        ["find", "new", "absent", "No equal key: put returns null, so add returns true."],
        ["find", "dup", "present", "An equal key exists: put returns the old PRESENT, so add returns false."],
      ],
    ],
    mistakes: [
      "Adding objects without equals and hashCode to a set and expecting duplicates to be removed.",
      "Mutating an element after adding it, which hides it from `contains` and `remove`.",
    ],
    qa: [
      ["How does HashSet work internally?", "It uses a HashMap: elements are keys and a constant dummy object is the value."],
      ["How does HashSet detect duplicates?", "Through the backing map: an element with the same hashCode that is equal according to equals is a duplicate."],
      ["What is the difference between HashSet and LinkedHashSet?", "LinkedHashSet is backed by a LinkedHashMap, so it keeps insertion order; HashSet has no order guarantee."],
    ],
    ex: [
      "Write `MyTreeSet` in one line using the same pattern. What does Employee need for it to work?",
      "`class MyTreeSet<E> extends MyHashSet<E> { MyTreeSet(Comparator<E> c) { super(new TreeMap<>(c)); } }`. Employee then needs a Comparator (or to implement Comparable); TreeMap uses compareTo, not hashCode.",
    ],
  }),

  lesson("equals() and hashCode() Interview Questions", {
    intro:
      "Interviewers love equals and hashCode because the questions test real understanding of collections, contracts and object identity. This lesson collects the most frequently asked questions and answers in one place and backs the trickiest ones with a program you can run.",
    topics: [
      [
        "Default implementations",
        "`Object.equals` compares references (`this == obj`). `Object.hashCode` returns an identity-based number generated by the JVM (not a memory address on modern JVMs); `System.identityHashCode(obj)` returns it even when the class overrides hashCode.",
      ],
      [
        "Can two unequal objects have the same hashCode?",
        "Yes. That is a collision and is allowed by the contract; it only affects performance. A hashCode that returns a constant is legal but turns every hash map into a linked list.",
      ],
      [
        "Using getClass() or instanceof in equals",
        "`getClass() != o.getClass()` makes subclasses never equal to their parent, preserving symmetry when subclasses add fields. `instanceof` allows subclass instances to be equal, which is fine for final classes or when subclasses do not add state relevant to equality, but can break symmetry otherwise.",
      ],
      [
        "equals with inheritance and other questions",
        "Adding a field in a subclass and including it in equals breaks either symmetry or transitivity with instanceof-based equals; prefer composition. Records and `Objects.equals/hash` reduce boilerplate. `compareTo` should be consistent with equals for sorted sets and maps, or they will treat \"equal by compare\" objects as duplicates (for example `BigDecimal` 1.0 and 1.00).",
      ],
    ],
    code: String.raw`import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    static class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
        @Override public boolean equals(Object o) {
            return o instanceof Point p && x == p.x && y == p.y;   // instanceof: open to subclasses
        }
        @Override public int hashCode() { return Objects.hash(x, y); }
    }

    static class ColorPoint extends Point {
        final String color;
        ColorPoint(int x, int y, String color) { super(x, y); this.color = color; }
        @Override public boolean equals(Object o) {
            return o instanceof ColorPoint cp && super.equals(cp) && color.equals(cp.color);
        }
    }

    static class ConstantHash {
        final int v;
        ConstantHash(int v) { this.v = v; }
        @Override public boolean equals(Object o) { return o instanceof ConstantHash c && c.v == v; }
        @Override public int hashCode() { return 42; }               // legal but slow
    }

    public static void main(String[] args) {
        Object a = new Object(), b = new Object();
        System.out.println("Object.equals is identity: " + a.equals(b) + ", " + a.equals(a));
        String s = "hello";
        System.out.println("identityHashCode differs from String.hashCode: " + (System.identityHashCode(s) != s.hashCode()));

        Point p = new Point(1, 2);
        ColorPoint cp = new ColorPoint(1, 2, "red");
        System.out.println("p.equals(cp) = " + p.equals(cp) + ", cp.equals(p) = " + cp.equals(p) + "  <- symmetry broken");

        Set<ConstantHash> slow = new HashSet<>();
        for (int i = 0; i < 1000; i++) slow.add(new ConstantHash(i));
        System.out.println("constant hash still correct: size " + slow.size() + ", contains 999: " + slow.contains(new ConstantHash(999)));

        System.out.println("\"Aa\" and \"BB\" collide: " + ("Aa".hashCode() == "BB".hashCode()));

        BigDecimal one = new BigDecimal("1.0"), oneAgain = new BigDecimal("1.00");
        System.out.println("BigDecimal equals: " + one.equals(oneAgain) + ", compareTo: " + one.compareTo(oneAgain));
        System.out.println("HashSet size: " + new HashSet<>(java.util.List.of(one, oneAgain)).size()
                + ", TreeSet size: " + new TreeSet<>(java.util.List.of(one, oneAgain)).size());
    }
}`,
    walk:
      "Plain `Object`s are equal only to themselves. `System.identityHashCode` ignores the `String` override, so it differs from `\"hello\".hashCode()`.\n\n`Point` uses `instanceof`, and `ColorPoint` adds a colour: `p.equals(cp)` is true but `cp.equals(p)` is false, breaking symmetry. A constant hash code keeps the set correct but every element sits in one bucket. Finally `BigDecimal` 1.0 and 1.00 are not `equals` but compare as 0, so a `HashSet` keeps both and a `TreeSet` keeps one.",
    anim: [
      "Symmetry broken by inheritance",
      [
        ["p", "Point(1,2)", "parent"],
        ["cp", "ColorPoint", "(1,2,red)"],
        ["pe", "p.equals(cp)", "true"],
        ["ce", "cp.equals(p)", "false"],
        ["fix", "getClass()", "or composition"],
      ],
      [
        ["p", "pe", "compare", "Point's equals checks instanceof Point; a ColorPoint passes and x, y match."],
        ["cp", "ce", "compare", "ColorPoint's equals requires a ColorPoint; a plain Point fails."],
        ["pe", "ce", "conflict", "One direction says equal, the other says not: the symmetry rule is broken."],
        ["ce", "fix", "fix", "Use getClass() checks or composition instead of adding equality state in subclasses."],
      ],
    ],
    mistakes: [
      "Adding equality-relevant fields in subclasses of value classes.",
      "Assuming `hashCode` is a memory address.",
      "Using `BigDecimal` with mixed scales in a HashSet and expecting duplicates to be merged.",
    ],
    qa: [
      ["What is the default implementation of equals and hashCode?", "equals compares references; hashCode returns a JVM-generated identity hash."],
      ["If two objects have the same hashCode, are they equal?", "Not necessarily; different objects can collide."],
      ["Can we use a mutable object as a HashMap key?", "Only if the fields used by equals and hashCode never change while it is in the map; otherwise it gets lost."],
      ["Should equals use getClass or instanceof?", "getClass for strict equality in extensible classes; instanceof for final classes or when subclasses do not change equality."],
      ["Is it mandatory to override hashCode when overriding equals?", "The compiler does not force it, but the contract does: without it, hash-based collections break."],
      ["What does Objects.hash do?", "It combines the hash codes of its arguments with a 31-based formula (it allocates an array, so hand-written code is faster in hot paths)."],
    ],
    ex: [
      "Fix the symmetry problem between `Point` and `ColorPoint` without changing `ColorPoint`'s fields.",
      "Change `Point.equals` to use `o != null && getClass() == o.getClass()`, so a Point is never equal to a ColorPoint in either direction; or make ColorPoint contain a Point instead of extending it.",
    ],
  }),
]);
