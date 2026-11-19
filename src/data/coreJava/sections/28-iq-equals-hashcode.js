import { lesson, section } from "../schema.js";

// Interview Q&A: overriding equals and hashCode (16 questions).
export default section("interview-equals-hashcode", "Interview Q&A: equals and hashCode", [
  lesson("equals and hashCode Q1-Q9: The Contract, Employee Keys and How HashMap Uses Them", {
    intro:
      "Questions 1 to 9 on equals and hashCode cover:\n\n- why both methods must be overridden, and how to do it for an Employee key\n- which classes make good keys\n- three classic contract questions: do equal hash codes imply equality, do equal objects imply equal hash codes, and can unequal objects share a hash code\n- `instanceof` vs `getClass()` inside equals\n- how an Integer key is stored internally\n- a hand-written HashMap with put, get and remove for Employee keys\n\nThe program checks the contract and the symmetry trap of `instanceof` with subclasses.",
    topics: [
      [
        "Q1. Why do we override equals and hashCode?",
        "Object's defaults compare **identity**: `equals` is `==`, and `hashCode` is an identity-based number. For value objects (money, coordinates, ids), two instances with the same data should count as equal, so you override `equals` to compare fields. Hash-based collections (HashMap, HashSet, Hashtable, ConcurrentHashMap) use `hashCode` to choose a bucket **before** calling `equals`. So whenever you override equals you **must** override hashCode, or equal objects land in different buckets and the collection cannot find them.\n\nThe contract (from Object's Javadoc) has three parts:\n\n- equal objects must have equal hash codes\n- `hashCode` must be consistent while the fields used by equals do not change\n- equals must be reflexive, symmetric, transitive, consistent, and false for null",
      ],
      [
        "Q2. How do you override equals and hashCode for an Employee used as a HashMap key?",
        "1. Choose the fields that define identity, for example `id`. A stable business key is better than mutable data such as salary.\n2. In `equals`: return true when `this == o`; return false when `o` is null or of the wrong type; cast; compare primitives with `==` (use `Double.compare` for doubles) and objects with `Objects.equals`.\n3. In `hashCode`: return `Objects.hash(fields...)`, or compute `31 * h + field` manually for speed.\n4. Make those fields final, so the hash cannot change while the object sits in a map.\n\nAn IDE or a record (`record Employee(int id, String name)`) generates correct versions.",
        "@Override public boolean equals(Object o) {\n    if (this == o) return true;\n    if (o == null || getClass() != o.getClass()) return false;\n    Employee e = (Employee) o;\n    return id == e.id && Objects.equals(name, e.name);\n}\n@Override public int hashCode() { return 31 * Integer.hashCode(id) + Objects.hashCode(name); }",
      ],
      [
        "Q3. Which classes are preferred as HashMap keys?",
        "Immutable, final classes whose `equals` and `hashCode` are correct and fast. `String` is the most common: it is immutable, and its hash is cached after the first computation. Wrapper types (`Integer`, `Long`), enums, records with immutable components, and value classes such as `UUID` and `LocalDate` also qualify. The key must never change in a way that affects its hash while it is in the map. If it does, the entry is stranded in the old bucket.",
      ],
      [
        "Q4. If two objects have the same hashCode, are they always equal?",
        "**No.** Equal hash codes only put objects in the same bucket. A hash is an `int` (about 4.3 billion values) summarising unlimited possible states, so collisions are unavoidable. `\"Aa\".hashCode() == \"BB\".hashCode()` (both are 2112), yet the strings are not equal. That is why HashMap always confirms a match with `equals` after comparing hashes.",
      ],
      [
        "Q5. If equals returns true, must the hash codes be the same?",
        "**Yes**, that is the core of the contract: `a.equals(b)` implies `a.hashCode() == b.hashCode()`. A class that breaks this rule (overriding equals without hashCode) makes hash-based collections misbehave: duplicates appear in a HashSet, and `get` misses keys. The reverse does not hold, as Q4 shows.",
      ],
      [
        "Q6. Can two unequal objects have the same hashCode?",
        "**Yes**, and it is legal, because the contract does not require unequal objects to have different hashes. Collisions only cost performance: they make buckets longer. A good hashCode spreads values evenly to keep collisions rare. Returning a constant is legal but turns every lookup into a linear or tree search. Java 8's HashMap turns long buckets into trees to limit the damage when keys are Comparable.",
      ],
      [
        "Q7. Should equals use instanceof or getClass()?",
        "**instanceof** (`if (!(o instanceof Point p)) return false;`) lets subclass instances equal superclass instances. That is fine when the class is final, or when subclasses add no state that matters. If a subclass adds a field and overrides equals with its own instanceof check, **symmetry breaks**: `point.equals(colorPoint)` is true while `colorPoint.equals(point)` is false.\n\n**getClass()** (`if (o == null || getClass() != o.getClass()) return false;`) allows equality only between objects of exactly the same class. That keeps symmetry and transitivity, but violates the Liskov substitution principle: a harmless subclass, such as a Hibernate proxy, never equals its parent. The common guidance: make value classes final and use instanceof, or use getClass when subclasses are expected.",
      ],
      [
        "Q8. How is an Integer key stored internally in a HashMap?",
        "`map.put(10, \"x\")` autoboxes 10 with `Integer.valueOf(10)` (cached for -128 to 127). `Integer.hashCode()` returns the int value itself, 10. HashMap spreads the hash, `h ^ (h >>> 16)` (still 10 for small numbers), and picks the bucket `index = hash & (table.length - 1)`, which is 10 for the default table of 16. The entry is a `Node(hash, key, value, next)` stored in `table[10]`. Key 26 also maps to index 10 (26 & 15), so it chains in the same bucket and is distinguished by `equals`.",
      ],
      [
        "Q9. How do you write a custom HashMap with put, get and remove for Employee keys?",
        "Use an array of buckets, each a linked list of `Entry(key, value, next)`.\n\n- `put`: compute the index from `key.hashCode()`, walk the chain, replace the value if `equals` matches, otherwise add a new entry.\n- `get`: walk the same chain and return the value on an `equals` match.\n- `remove`: find the entry, unlink it by pointing the previous node, or the bucket head, at the next node, and decrement the size.\n\nThe program implements exactly this, with Employee keys whose equals and hashCode use the id.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {

    // Q2: a final Employee whose identity is its id.
    static final class Employee {
        private final int id;
        private final String name;
        Employee(int id, String name) { this.id = id; this.name = name; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;                              // reflexive and fast
            if (o == null || getClass() != o.getClass()) return false;
            return id == ((Employee) o).id;                          // identity = id
        }
        @Override public int hashCode() { return Integer.hashCode(id); } // same field as equals
        @Override public String toString() { return name + "#" + id; }
    }

    // Q7: the instanceof symmetry trap.
    static class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
        @Override public boolean equals(Object o) { return o instanceof Point p && x == p.x && y == p.y; }
        @Override public int hashCode() { return Objects.hash(x, y); }
    }
    static class ColorPoint extends Point {
        final String color;
        ColorPoint(int x, int y, String color) { super(x, y); this.color = color; }
        @Override public boolean equals(Object o) { return o instanceof ColorPoint c && super.equals(c) && color.equals(c.color); }
    }

    // Q9: a custom map for Employee keys.
    static class EmployeeMap<V> {
        private static class Entry<V> { final Employee key; V value; Entry<V> next;
            Entry(Employee key, V value, Entry<V> next) { this.key = key; this.value = value; this.next = next; } }
        @SuppressWarnings("unchecked") private final Entry<V>[] buckets = (Entry<V>[]) new Entry[8];
        private int size;

        private int index(Employee key) { return (key.hashCode() & 0x7fffffff) % buckets.length; }
        void put(Employee key, V value) {
            int i = index(key);
            for (Entry<V> e = buckets[i]; e != null; e = e.next)
                if (e.key.equals(key)) { e.value = value; return; }   // same employee: replace
            buckets[i] = new Entry<>(key, value, buckets[i]);
            size++;
        }
        V get(Employee key) {
            for (Entry<V> e = buckets[index(key)]; e != null; e = e.next) if (e.key.equals(key)) return e.value;
            return null;
        }
        boolean remove(Employee key) {
            int i = index(key);
            for (Entry<V> e = buckets[i], prev = null; e != null; prev = e, e = e.next) {
                if (!e.key.equals(key)) continue;
                if (prev == null) buckets[i] = e.next; else prev.next = e.next;   // unlink
                size--;
                return true;
            }
            return false;
        }
        int size() { return size; }
    }

    public static void main(String[] args) {
        // Q1 + Q5: equal objects, equal hashes; a HashSet treats them as one.
        Employee a = new Employee(7, "Asha"), b = new Employee(7, "Asha (renamed)");
        System.out.println("Q1  a.equals(b) " + a.equals(b) + ", same hash " + (a.hashCode() == b.hashCode())
                + ", HashSet size " + new HashSet<>(List.of(a, b, new Employee(8, "Om"))).size());

        // Q4 + Q6: same hash, not equal.
        System.out.println("Q4  \"Aa\" and \"BB\" hash " + "Aa".hashCode() + " and " + "BB".hashCode()
                + ", equal? " + "Aa".equals("BB"));

        // Q7: symmetry breaks with instanceof in a stateful subclass.
        Point p = new Point(1, 2);
        ColorPoint cp = new ColorPoint(1, 2, "red");
        System.out.println("Q7  p.equals(cp) " + p.equals(cp) + ", cp.equals(p) " + cp.equals(p) + "  <- not symmetric");

        // Q8: where an Integer key lands in a 16-slot table.
        for (int key : new int[] {10, 26, 127}) {
            int h = Integer.valueOf(key).hashCode();
            int spread = h ^ (h >>> 16);
            System.out.println("Q8  key " + key + " hash " + h + " -> bucket " + (spread & 15));
        }
        System.out.println("Q8  Integer.valueOf(127) cached: " + (Integer.valueOf(127) == Integer.valueOf(127))
                + ", 128 cached: " + (Integer.valueOf(128) == Integer.valueOf(128)));

        // Q9
        EmployeeMap<String> desks = new EmployeeMap<>();
        desks.put(new Employee(1, "Ravi"), "D1");
        desks.put(new Employee(9, "Neel"), "D9");                    // 9 % 8 == 1: same bucket as id 1
        desks.put(new Employee(1, "Ravi"), "D1-updated");            // replaces
        System.out.println("Q9  size " + desks.size() + ", get(1) " + desks.get(new Employee(1, "x"))
                + ", get(9) " + desks.get(new Employee(9, "y")));
        System.out.println("Q9  remove(1) " + desks.remove(new Employee(1, "z")) + ", size " + desks.size()
                + ", get(9) still " + desks.get(new Employee(9, "y")));
    }
}`,
    walk:
      "Two Employees with id 7 are equal and have equal hashes, so a HashSet of three employees has size 2 (Q1, Q5). The strings \"Aa\" and \"BB\" both hash to 2112 but are not equal, which is a legal collision (Q4, Q6). Q7 shows the instanceof trap: a plain Point says it equals a ColorPoint at the same coordinates, but the ColorPoint says it does not equal the Point.\n\nQ8 computes the bucket for three Integer keys in a 16-slot table. 10 and 26 share bucket 10, and 127 goes to bucket 15. The Integer cache makes `valueOf(127)` return the same object every time, but not 128. In Q9 the custom EmployeeMap puts ids 1 and 9 into the same bucket (both are 1 mod 8). Updating id 1 replaces its value, and removing id 1 unlinks it while leaving id 9 reachable in the same chain.",
    anim: [
      "put and get in a hash map",
      [
        ["key", "Employee(1)", "the key"],
        ["hash", "hashCode()", "returns 1"],
        ["bucket", "bucket 1", "chain: 9 -> 1"],
        ["eq", "equals()", "id == id?"],
        ["val", "value", "D1-updated"],
      ],
      [
        ["key", "hash", "hash", "get(new Employee(1)) first computes the key's hashCode, which is the id."],
        ["hash", "bucket", "index 1", "(1 & 0x7fffffff) % 8 = 1, so the search goes to bucket 1."],
        ["bucket", "eq", "Employee 9?", "The first entry is Employee 9: equals compares ids 9 and 1, false."],
        ["eq", "bucket", "next", "The map follows the chain to the next entry, Employee 1."],
        ["eq", "val", "match", "equals is true for id 1, so its value D1-updated is returned."],
      ],
    ],
    mistakes: [
      "Overriding `equals(Employee e)` instead of `equals(Object o)`. That is an overload, so collections never call it.",
      "Including mutable fields such as salary in hashCode. Changing them strands the entry in a map.",
      "Using instanceof in equals in a non-final class whose subclasses add state. This breaks symmetry.",
      "Comparing floating-point fields with `==` inside equals. Use `Double.compare` so that NaN and -0.0 behave consistently.",
    ],
    qa: [
      [
        "Why is 31 used in hash calculations?",
        "It is an odd prime, so multiplying by it does not lose information through overflow the way an even multiplier would, and it spreads small values well. The JIT can also compute `31 * i` as `(i << 5) - i`.",
      ],
      [
        "Do records follow the equals/hashCode contract?",
        "Yes. Their generated equals compares every component (using `==` for primitives through their wrapper's compare logic, and `Objects.equals` for references), and hashCode combines all components.",
      ],
      [
        "What happens if hashCode changes after the object is put into a HashSet?",
        "`contains` and `remove` look in the bucket for the new hash and miss the entry, which stays in its old bucket. The element becomes unreachable through the set but still occupies memory.",
      ],
    ],
    ex: [
      "Write equals and hashCode for `final class Money { final long paise; final String currency; }`, then predict `new HashSet<>(List.of(new Money(100, \"INR\"), new Money(100, \"INR\"), new Money(100, \"USD\"))).size()`.",
      "`equals`: `o instanceof Money m && paise == m.paise && currency.equals(m.currency)`. `hashCode`: `31 * Long.hashCode(paise) + currency.hashCode()`. The size is 2: the two INR amounts are equal, and USD is different.",
    ],
  }),

  lesson("equals and hashCode Q10-Q16: Buckets, Size and get() for Every Override Combination", {
    intro:
      "Questions 10 to 16 are the hands-on puzzles. The same scenario is repeated with every combination of overrides:\n\n- neither method overridden\n- both overridden\n- hashCode returning 1 with equals returning true\n- hashCode returning 1 with no equals\n- equals returning true with no hashCode\n- only hashCode overridden\n- only equals overridden\n\nIn each case three keys are inserted (two of them look equal), and you predict how many buckets are used, the size of the map, and what `get` returns. The program counts the real buckets through reflection-free bookkeeping, so the answers are verified.",
    topics: [
      [
        "Q10. Neither equals nor hashCode is overridden: buckets, size and get?",
        "Each key has an identity hash code, usually different, so the keys typically land in **three different buckets**, though by chance two can share one. Identity equals never matches a different object, so all three puts are stored: **size 3**. `get(new Key(\"a\"))` returns **null**, because a brand-new object equals nothing. Only the original references can retrieve their values.",
      ],
      [
        "Q11. Both equals and hashCode are overridden correctly: buckets, size and get?",
        "The two equal keys produce the same hash and share **one bucket**, and the third key goes to its own bucket (unless it collides), so **2 buckets** are used. The second equal key **replaces** the first one's value: **size 2**. `get(new Key(\"a\"))` returns the latest value. This is the behaviour you want for value-based keys.",
      ],
      [
        "Q12. hashCode returns 1 and equals returns true: buckets, size and get?",
        "Every key hashes to 1, so all of them reach **one bucket**, and every key equals every other key, so each put replaces the single existing entry: **size 1**. `get` with any key at all, even a different one, returns the **last value put**. The map can hold only one entry, so the class is broken even though it technically obeys the contract.",
      ],
      [
        "Q13. hashCode returns 1 and equals is not overridden: buckets, size and get?",
        "All keys share **one bucket**, but identity equals never matches a different object, so all three entries are chained there: **size 3**. `get(new Key(\"a\"))` returns **null** after comparing against every entry in the chain. This combines the worst performance (every operation scans the bucket) with lookups that only work through the original references.",
      ],
      [
        "Q14. equals returns true but hashCode is not overridden: buckets, size and get?",
        "The identity hashes differ, so the keys spread over (usually) **three buckets**. Equals is consulted only for keys that **already share a bucket**, so the always-true equals almost never gets a chance: normally **size 3**. `get(new Key(\"x\"))` goes to a random bucket and returns **null**, unless that bucket happens to hold an entry, in which case equals true returns that entry's value. The behaviour is unpredictable, and that is the point of this question.",
      ],
      [
        "Q15. Only hashCode is overridden (consistent with the fields): buckets, size and get?",
        "Equal-looking keys get the same hash and share a bucket, so **2 buckets** are used for keys a, a and b. Equality is still identity, so the second \"a\" does **not** replace the first; both entries sit in the same bucket: **size 3**. `get(new Key(\"a\"))` reaches the right bucket but finds no identical object, so it returns **null**.",
      ],
      [
        "Q16. Only equals is overridden (consistent with the fields): buckets, size and get?",
        "The identity hashes differ, so the two equal keys usually land in **different buckets**, normally **3 buckets** in total, and equals never compares them: **size 3**. `get(new Key(\"a\"))` usually returns **null**, because its own identity hash picks yet another bucket. This is the classic bug of overriding equals alone, and the reason every IDE and linter warns about it.",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.function.Function;

public class Main {
    // One key class per combination. Each prints nothing; the map bookkeeping is in check().
    static class Neither { final String k; Neither(String k) { this.k = k; } }
    static class Both { final String k; Both(String k) { this.k = k; }
        public int hashCode() { return k.hashCode(); }
        public boolean equals(Object o) { return o instanceof Both b && k.equals(b.k); } }
    static class OneAndTrue { final String k; OneAndTrue(String k) { this.k = k; }
        public int hashCode() { return 1; }
        public boolean equals(Object o) { return true; } }
    static class OneNoEquals { final String k; OneNoEquals(String k) { this.k = k; }
        public int hashCode() { return 1; } }
    static class TrueNoHash { final String k; TrueNoHash(String k) { this.k = k; }
        public boolean equals(Object o) { return true; } }
    static class HashOnly { final String k; HashOnly(String k) { this.k = k; }
        public int hashCode() { return k.hashCode(); } }
    static class EqualsOnly { final String k; EqualsOnly(String k) { this.k = k; }
        public boolean equals(Object o) { return o instanceof EqualsOnly e && k.equals(e.k); } }

    // Put keys a, a, b; report distinct buckets (16-slot table), size and get(new "a").
    static <K> void check(String question, Function<String, K> make, boolean identityBased) {
        Map<K, Integer> map = new HashMap<>();
        List<K> keys = List.of(make.apply("a"), make.apply("a"), make.apply("b"));
        Set<Integer> buckets = new TreeSet<>();
        for (int i = 0; i < keys.size(); i++) {
            int h = keys.get(i).hashCode();
            buckets.add((h ^ (h >>> 16)) & 15);
            map.put(keys.get(i), i + 1);
        }
        Integer found = map.get(make.apply("a"));
        String bucketText = identityBased ? "identity hashes (usually 3, may collide)" : String.valueOf(buckets.size());
        String sizeText = identityBased ? "usually 3 -> " + (map.size() >= 1) : String.valueOf(map.size());
        String getText = identityBased ? "usually null" : String.valueOf(found);
        System.out.println(question + " buckets " + bucketText + ", size " + sizeText + ", get(new a) " + getText);
    }

    public static void main(String[] args) {
        check("Q10 neither overridden:       ", Neither::new, true);
        check("Q11 both overridden:          ", Both::new, false);
        check("Q12 hash 1 + equals true:     ", OneAndTrue::new, false);
        check("Q13 hash 1, no equals:        ", OneNoEquals::new, false);
        check("Q14 equals true, no hashCode: ", TrueNoHash::new, true);
        check("Q15 hashCode only:            ", HashOnly::new, false);
        check("Q16 equals only:              ", EqualsOnly::new, true);

        // The original references always work, even for the broken classes.
        Map<EqualsOnly, Integer> map = new HashMap<>();
        EqualsOnly original = new EqualsOnly("a");
        map.put(original, 42);
        System.out.println("Q16 lookup with the original reference -> " + map.get(original));
    }
}`,
    walk:
      "`check` builds one HashMap per combination and inserts keys \"a\", \"a\" and \"b\" with values 1, 2 and 3. For deterministic classes (Q11, Q12, Q13, Q15) it computes the real bucket of each key in a 16-slot table and prints the exact number of distinct buckets, the size and the result of `get(new \"a\")`. Both overrides give 2 buckets, size 2 and value 2. hashCode 1 with equals true gives 1 bucket, size 1 and value 3 (the last put). hashCode 1 without equals gives 1 bucket, size 3 and null. hashCode only gives 2 buckets, size 3 and null.\n\nThe identity-based classes (Q10, Q14, Q16) depend on identity hash codes, which change from run to run. The program prints the typical answer in words instead of a number that might differ, so the stored output stays stable. The last line shows that the original reference always finds its own entry.",
    anim: [
      "Three keys, seven override combinations",
      [
        ["keys", "keys a, a, b", "three puts"],
        ["hash", "hashCode", "decides bucket"],
        ["eq", "equals", "decides replace"],
        ["size", "map.size()", "1, 2 or 3"],
        ["get", "get(new a)", "value or null"],
      ],
      [
        ["keys", "hash", "both a's", "With a field-based hashCode both a keys reach the same bucket; with identity they rarely do."],
        ["hash", "eq", "same bucket", "Only keys in the same bucket are compared with equals."],
        ["eq", "size", "replace?", "A field-based equals replaces the value (size 2); identity equals adds (size 3)."],
        ["eq", "size", "always true", "equals true plus hash 1 makes every key replace the single entry: size 1."],
        ["size", "get", "lookup", "get(new a) succeeds only when hashCode and equals both treat it as the stored key."],
      ],
    ],
    mistakes: [
      "Answering \"size 2\" for the equals-only case. Without matching hashes the keys never meet.",
      "Assuming an identity hashCode is unique. Collisions are rare but possible, so identity-based answers are \"usually\".",
      "Thinking `hashCode() { return 1; }` violates the contract. It is legal, just terrible for performance.",
    ],
    qa: [
      [
        "Which single rule explains all seven answers?",
        "HashMap compares a key with equals only when it reaches a bucket whose entry has the same hash. So hashCode decides whether two keys can meet, and equals decides whether a meeting is a match.",
      ],
      [
        "How many buckets does a new HashMap have?",
        "None until the first put. The table is created lazily with 16 slots (the default capacity) and doubles when the size exceeds 16 × 0.75 = 12.",
      ],
      [
        "Why can't a key with hashCode returning 1 be fixed by treeification?",
        "Treeification needs the keys to be Comparable to order them. Without Comparable, keys in a tree bin are ordered by class name and identity hash, so the search is still nearly linear.",
      ],
    ],
    ex: [
      "Predict the size and `get(new Key(\"b\"))` when hashCode returns `k.length()` and equals compares `k`, after putting keys \"ab\", \"cd\" and \"ab\" with values 1, 2 and 3.",
      "Size 2 (\"ab\" is replaced, and \"cd\" is a different key in the same bucket). `get(new Key(\"b\"))` checks bucket 1, the length of \"b\", which is empty, so it returns null.",
    ],
  }),
]);
