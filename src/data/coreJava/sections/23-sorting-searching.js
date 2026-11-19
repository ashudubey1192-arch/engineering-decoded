import { lesson, section } from "../schema.js";

export default section("sorting-and-searching", "Sorting and Searching", [
  lesson("Bubble Sort, Selection Sort and Insertion Sort", {
    intro:
      "The three elementary sorting algorithms are simple to write and reason about, which makes them the starting point for every algorithms course and a staple of interviews. All are O(n squared) in the worst case, but they differ in swaps, stability and behaviour on nearly sorted data. This lesson implements bubble, selection and insertion sort, traces them, and compares them.",
    topics: [
      [
        "Bubble sort",
        "Repeatedly walk the array, swapping adjacent elements that are out of order, so the largest remaining element \"bubbles\" to the end of each pass. With an early-exit flag (stop when a pass makes no swaps) it is O(n) on already sorted input; otherwise O(n squared) comparisons and swaps. Stable and in place.",
      ],
      [
        "Selection sort",
        "For each position i, find the minimum of the unsorted part and swap it into position i. Always O(n squared) comparisons but at most n - 1 swaps, useful when writes are expensive. Not stable in its basic form (a long-distance swap can reorder equal keys). In place.",
      ],
      [
        "Insertion sort",
        "Grow a sorted prefix: take the next element and shift larger elements right until its spot is found, like sorting playing cards in your hand. O(n squared) worst case, but O(n) for nearly sorted data and very fast for small arrays, which is why TimSort and quicksort implementations switch to it for small ranges. Stable and in place.",
      ],
      [
        "Comparison",
        "Best/average/worst: bubble O(n)/O(n^2)/O(n^2) with early exit; selection O(n^2) always; insertion O(n)/O(n^2)/O(n^2). Swaps: bubble many, selection at most n - 1, insertion shifts. Stable: bubble yes, selection no, insertion yes. All use O(1) extra space. In practice insertion sort is the best of the three.",
      ],
    ],
    code: String.raw`import java.util.Arrays;

public class Main {
    static int comparisons, swaps;

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; swaps++; }

    static void bubbleSort(int[] a) {
        for (int pass = 0; pass < a.length - 1; pass++) {
            boolean swapped = false;
            for (int i = 0; i < a.length - 1 - pass; i++) {
                comparisons++;
                if (a[i] > a[i + 1]) { swap(a, i, i + 1); swapped = true; }
            }
            if (!swapped) break;                                // already sorted: stop early
        }
    }

    static void selectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) { comparisons++; if (a[j] < a[min]) min = j; }
            if (min != i) swap(a, i, min);
        }
    }

    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i], j = i - 1;
            while (j >= 0) {
                comparisons++;
                if (a[j] <= key) break;
                a[j + 1] = a[j];                                // shift right
                swaps++;
                j--;
            }
            a[j + 1] = key;
        }
    }

    static String run(String name, java.util.function.Consumer<int[]> sorter, int[] input) {
        int[] a = input.clone();
        comparisons = 0; swaps = 0;
        sorter.accept(a);
        return String.format("%-10s %-24s comparisons %3d, swaps/shifts %3d", name, Arrays.toString(a), comparisons, swaps);
    }

    public static void main(String[] args) {
        int[] data = {29, 10, 14, 37, 13, 5, 88, 2};
        int[] nearlySorted = {1, 2, 3, 4, 6, 5, 7, 8};
        System.out.println("random input " + Arrays.toString(data));
        System.out.println(run("bubble", Main::bubbleSort, data));
        System.out.println(run("selection", Main::selectionSort, data));
        System.out.println(run("insertion", Main::insertionSort, data));
        System.out.println("nearly sorted input " + Arrays.toString(nearlySorted));
        System.out.println(run("bubble", Main::bubbleSort, nearlySorted));
        System.out.println(run("selection", Main::selectionSort, nearlySorted));
        System.out.println(run("insertion", Main::insertionSort, nearlySorted));

        int[] trace = {5, 1, 4, 2};
        System.out.println("bubble sort trace of " + Arrays.toString(trace) + ":");
        for (int pass = 0; pass < trace.length - 1; pass++) {
            for (int i = 0; i < trace.length - 1 - pass; i++) if (trace[i] > trace[i + 1]) { int t = trace[i]; trace[i] = trace[i + 1]; trace[i + 1] = t; }
            System.out.println("  after pass " + (pass + 1) + ": " + Arrays.toString(trace));
        }
    }
}`,
    walk:
      "The three sorts count their comparisons and swaps (shifts for insertion sort) on the same random array. All produce the same sorted result, but selection sort needs the fewest swaps while still doing every comparison.\n\nOn a nearly sorted array the differences become dramatic: bubble sort with early exit and insertion sort finish almost immediately with a single swap or shift, while selection sort still performs all 28 comparisons. The trace shows bubble sort moving the largest remaining value to the end on every pass.",
    anim: [
      "Insertion sort step",
      [
        ["sorted", "[10, 14, 29]", "sorted prefix"],
        ["key", "key = 13", "next element"],
        ["shift1", "shift 29", "right"],
        ["shift2", "shift 14", "right"],
        ["place", "[10, 13, 14, 29]", "inserted"],
      ],
      [
        ["sorted", "key", "take", "Insertion sort takes the next unsorted element, 13, as the key."],
        ["key", "shift1", "compare", "29 is larger than 13, so it shifts one place to the right."],
        ["shift1", "shift2", "compare", "14 is larger too, so it shifts right as well."],
        ["shift2", "place", "insert", "10 is smaller, so 13 drops into the gap: the prefix grows by one."],
      ],
    ],
    mistakes: [
      "Forgetting the early-exit flag in bubble sort, losing its O(n) best case.",
      "Using these O(n squared) sorts for large arrays; use Arrays.sort.",
      "Off-by-one errors in the inner loop bounds (`length - 1 - pass`).",
    ],
    qa: [
      ["Which of bubble, selection and insertion sort is stable?", "Bubble and insertion sort are stable; basic selection sort is not."],
      ["Which elementary sort is best for nearly sorted data?", "Insertion sort, which runs in about O(n) when few elements are out of place."],
      ["Which sort makes the fewest swaps?", "Selection sort, with at most n - 1 swaps."],
      ["What is the time complexity of bubble sort?", "O(n squared) average and worst case, O(n) best case with the early-exit optimisation."],
    ],
    ex: [
      "Show the array after each pass of selection sort on [64, 25, 12, 22, 11].",
      "Pass 1: [11, 25, 12, 22, 64]; pass 2: [11, 12, 25, 22, 64]; pass 3: [11, 12, 22, 25, 64]; pass 4: no change.",
    ],
  }),

  lesson("Sorting Objects", {
    intro:
      "Real data is rarely a plain int array: you sort employees by salary, orders by date or products by name and price. Sorting objects requires a comparison rule, supplied by `Comparable` or a `Comparator`. This lesson writes a generic sort that works on any objects, sorts by multiple fields, demonstrates stability, and compares with `Collections.sort` and `List.sort`.",
    topics: [
      [
        "Generic sorting with Comparator",
        "A sort method can take `T[]` or `List<T>` plus a `Comparator<? super T>` and use `comparator.compare(a, b)` wherever the int version used `<`. For natural ordering, use `<T extends Comparable<? super T>>` and `a.compareTo(b)`.",
      ],
      [
        "Multi-field sorting",
        "`Comparator.comparing(Employee::dept).thenComparing(Employee::salary, Comparator.reverseOrder()).thenComparing(Employee::name)` sorts by department, then salary descending, then name, in one pass.",
      ],
      [
        "Stability",
        "A stable sort keeps the original order of elements that compare as equal. That allows sorting in several passes (first by name, then stably by department) and keeps results predictable. `Collections.sort`, `List.sort` and `Arrays.sort` on objects (TimSort) are stable; quicksort-style implementations usually are not.",
      ],
      [
        "Library sorting",
        "`Collections.sort(list)` and `list.sort(comparator)` sort lists in place; `Arrays.sort(array, comparator)` sorts object arrays; `stream.sorted(comparator)` returns a new ordering. They are highly optimised; write your own only to learn or for special requirements.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    record Employee(String name, String dept, int salary) {
        public String toString() { return name + "(" + dept + "," + salary + ")"; }
    }

    static <T> void insertionSort(T[] a, Comparator<? super T> cmp) {   // works for any type
        for (int i = 1; i < a.length; i++) {
            T key = a[i];
            int j = i - 1;
            while (j >= 0 && cmp.compare(a[j], key) > 0) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }

    static <T extends Comparable<? super T>> void selectionSort(List<T> list) {   // natural order
        for (int i = 0; i < list.size() - 1; i++) {
            int min = i;
            for (int j = i + 1; j < list.size(); j++) if (list.get(j).compareTo(list.get(min)) < 0) min = j;
            Collections.swap(list, i, min);
        }
    }

    public static void main(String[] args) {
        Employee[] staff = {
            new Employee("Ravi", "Ops", 60), new Employee("Asha", "Dev", 95), new Employee("Neel", "Ops", 60),
            new Employee("Meera", "Dev", 120), new Employee("Zoya", "Dev", 95)};

        Employee[] bySalary = staff.clone();
        insertionSort(bySalary, Comparator.comparingInt(Employee::salary));
        System.out.println("custom generic sort by salary (stable): " + Arrays.toString(bySalary));

        Employee[] multi = staff.clone();
        insertionSort(multi, Comparator.comparing(Employee::dept)
                .thenComparing(Employee::salary, Comparator.reverseOrder())
                .thenComparing(Employee::name));
        System.out.println("dept, salary desc, name: " + Arrays.toString(multi));

        List<String> names = new ArrayList<>(List.of("pear", "Apple", "fig", "banana"));
        selectionSort(names);
        System.out.println("natural order (uppercase first): " + names);

        List<Employee> twoPass = new ArrayList<>(Arrays.asList(staff));
        twoPass.sort(Comparator.comparing(Employee::name));                  // pass 1
        twoPass.sort(Comparator.comparing(Employee::dept));                  // pass 2, stable
        System.out.println("stable two-pass (dept, then name kept): " + twoPass);

        System.out.println("Arrays.sort with comparator: " + Arrays.toString(sortedCopy(staff)));
        System.out.println("highest paid via stream: " + Arrays.stream(staff).sorted(Comparator.comparingInt(Employee::salary).reversed()).findFirst().orElseThrow());
    }

    static Employee[] sortedCopy(Employee[] a) {
        Employee[] copy = a.clone();
        Arrays.sort(copy, Comparator.comparing(Employee::name, String.CASE_INSENSITIVE_ORDER));
        return copy;
    }
}`,
    walk:
      "The generic `insertionSort` accepts any array and comparator. Sorting by salary keeps Ravi before Neel and Asha before Zoya, because their salaries tie and insertion sort is stable. A combined comparator sorts by department, then salary descending, then name, in a single sort.\n\nThe bounded generic `selectionSort` uses natural ordering, which for strings puts upper-case \"Apple\" before lower-case words. Sorting first by name and then, stably, by department gives departments with names still alphabetical inside each. The last lines use the library's `Arrays.sort` and a stream.",
    anim: [
      "Stable multi-pass sorting",
      [
        ["orig", "original", "Ravi, Asha, Neel.."],
        ["byName", "sort by name", "pass 1"],
        ["byDept", "sort by dept", "pass 2, stable"],
        ["ties", "equal depts", "keep name order"],
        ["res", "Dev: Asha..", "names in order"],
      ],
      [
        ["orig", "byName", "sort", "Pass 1 orders everyone alphabetically by name."],
        ["byName", "byDept", "sort", "Pass 2 orders by department using a stable sort."],
        ["byDept", "ties", "stable", "Employees in the same department keep their relative order from pass 1."],
        ["ties", "res", "result", "So each department's names stay alphabetical."],
      ],
    ],
    mistakes: [
      "Writing comparators with subtraction (`a.salary - b.salary`) that can overflow.",
      "Relying on stability with an unstable custom algorithm.",
      "Forgetting that String natural order is case-sensitive.",
    ],
    qa: [
      ["How do you sort a list of custom objects?", "Implement Comparable in the class or pass a Comparator to list.sort, Collections.sort or Arrays.sort."],
      ["What is a stable sort?", "One that preserves the relative order of elements that compare as equal."],
      ["Is Collections.sort stable?", "Yes, it uses TimSort, a stable merge-sort variant."],
    ],
    ex: [
      "Sort products by category ascending and price descending, with ties broken by name, in one comparator.",
      "`Comparator.comparing(Product::category).thenComparing(Product::price, Comparator.reverseOrder()).thenComparing(Product::name)`.",
    ],
  }),

  lesson("Linear Search and Binary Search (Iterative and Recursive)", {
    intro:
      "Searching finds where a value is stored, or proves it is absent. Linear search checks every element and works on any data; binary search halves a sorted range each step and finds anything among a billion elements in about 30 comparisons. This lesson implements linear search and iterative and recursive binary search, discusses the classic bugs, and uses the library methods.",
    topics: [
      [
        "Linear search",
        "Check elements one by one until a match is found; return its index or -1. O(n) time, works on unsorted data and linked structures, and is often fastest for very small arrays.",
      ],
      [
        "Binary search: iterative",
        "On a sorted array, keep `low` and `high` bounds; look at `mid`; if the target is smaller search the left half, if larger the right half; stop when found or when `low > high`. O(log n) time, O(1) space. Compute `mid = low + (high - low) / 2` (or `(low + high) >>> 1`) to avoid int overflow.",
      ],
      [
        "Binary search: recursive",
        "The same logic expressed recursively with `search(a, target, low, high)` calling itself on one half. O(log n) time and O(log n) call-stack space. Elegant, but the iterative version is usually preferred in production.",
      ],
      [
        "Variants and library support",
        "Finding the first or last occurrence of duplicates, the insertion point, or the boundary of a condition (\"first index where x >= target\") are small modifications. `Arrays.binarySearch` and `Collections.binarySearch` return the index, or `-(insertionPoint) - 1` when the key is absent. Binary search requires the data to be sorted with the same ordering.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static int steps;

    static int linearSearch(int[] a, int target) {
        for (int i = 0; i < a.length; i++) { steps++; if (a[i] == target) return i; }
        return -1;
    }

    static int binarySearch(int[] a, int target) {
        int low = 0, high = a.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;              // no overflow
            steps++;
            if (a[mid] == target) return mid;
            if (a[mid] < target) low = mid + 1; else high = mid - 1;
        }
        return -1;
    }

    static int binarySearchRecursive(int[] a, int target, int low, int high) {
        if (low > high) return -1;
        int mid = (low + high) >>> 1;
        steps++;
        if (a[mid] == target) return mid;
        return a[mid] < target ? binarySearchRecursive(a, target, mid + 1, high) : binarySearchRecursive(a, target, low, mid - 1);
    }

    static int firstOccurrence(int[] a, int target) {
        int low = 0, high = a.length - 1, result = -1;
        while (low <= high) {
            int mid = (low + high) >>> 1;
            if (a[mid] >= target) { if (a[mid] == target) result = mid; high = mid - 1; } else low = mid + 1;
        }
        return result;
    }

    public static void main(String[] args) {
        int[] sorted = new int[1_000_000];
        for (int i = 0; i < sorted.length; i++) sorted[i] = i * 2;          // 0, 2, 4, ...

        steps = 0;
        System.out.println("linear search for 1,999,998: index " + linearSearch(sorted, 1_999_998) + " in " + steps + " steps");
        steps = 0;
        System.out.println("binary search (iterative):    index " + binarySearch(sorted, 1_999_998) + " in " + steps + " steps");
        steps = 0;
        System.out.println("binary search (recursive):    index " + binarySearchRecursive(sorted, 1_999_998, 0, sorted.length - 1) + " in " + steps + " steps");
        steps = 0;
        System.out.println("absent value 7: " + binarySearch(sorted, 7) + " after " + steps + " steps");

        int[] unsorted = {42, 7, 19, 3};
        System.out.println("linear search works on unsorted data: index of 42 = " + linearSearch(unsorted, 42)
                + ", binary search on unsorted data misses it: " + binarySearch(unsorted, 42));

        int[] dupes = {1, 3, 3, 3, 5, 8};
        System.out.println("first occurrence of 3: " + firstOccurrence(dupes, 3) + ", plain binary search found index " + binarySearch(dupes, 3));

        System.out.println("Arrays.binarySearch(found): " + Arrays.binarySearch(dupes, 5) + ", missing 4 -> " + Arrays.binarySearch(dupes, 4)
                + " (insertion point " + (-Arrays.binarySearch(dupes, 4) - 1) + ")");
        List<String> names = List.of("Asha", "Meera", "Neel", "Ravi");
        System.out.println("Collections.binarySearch(\"Neel\"): " + Collections.binarySearch(names, "Neel"));
        int low = 2_000_000_000, high = 2_100_000_000;
        System.out.println("overflow trap: (low + high) / 2 = " + (low + high) / 2 + ", low + (high - low) / 2 = " + (low + (high - low) / 2));
    }
}`,
    walk:
      "In a sorted array of one million even numbers, linear search needs a million steps to find the last element, while both binary searches need 20, since 2^20 is just over a million. An absent value is rejected after about 20 steps too.\n\nLinear search works on unsorted data, but binary search on it reports -1 for 42 even though 42 is the first element, because it discards the half that contains it; that is why sorting is a precondition. With duplicates, a plain binary search returns any matching index, while `firstOccurrence` keeps searching left. `Arrays.binarySearch` encodes the insertion point for missing keys, and the last line shows the integer overflow that `low + (high - low) / 2` avoids.",
    anim: [
      "Binary search halving",
      [
        ["all", "0 .. 999,999", "1M candidates"],
        ["half", "500,000 ..", "500K left"],
        ["quarter", "750,000 ..", "250K left"],
        ["many", "... 20 steps", "halving"],
        ["found", "index 999,999", "found"],
      ],
      [
        ["all", "half", "mid", "Compare with the middle element; the target is larger, so drop the left half."],
        ["half", "quarter", "mid", "Each comparison halves the remaining range again."],
        ["quarter", "many", "repeat", "After k steps only n / 2^k candidates remain."],
        ["many", "found", "log2 n", "About log2(1,000,000) = 20 steps find the target."],
      ],
    ],
    mistakes: [
      "Binary searching unsorted data.",
      "Computing `(low + high) / 2` with ints that can overflow.",
      "Infinite loops from `low = mid` instead of `low = mid + 1`.",
    ],
    qa: [
      ["What is the time complexity of binary search?", "O(log n), with O(1) extra space iteratively and O(log n) stack space recursively."],
      ["What is the precondition for binary search?", "The data must be sorted by the same ordering used for comparison."],
      ["What does Arrays.binarySearch return when the key is missing?", "-(insertionPoint) - 1, a negative number encoding where the key would go."],
    ],
    ex: [
      "Use binary search to find the integer square root of 1,000,000,000 (the largest x with x * x <= n).",
      "Search x in [0, n] with long arithmetic: if mid * mid <= n move low up and remember mid, otherwise move high down. The answer is 31622.",
    ],
  }),

  lesson("Merge Sort, Quick Sort and Heap Sort", {
    intro:
      "The efficient comparison sorts run in O(n log n). Merge sort divides the array, sorts the halves and merges them; quick sort partitions around a pivot; heap sort builds a binary heap and repeatedly extracts the maximum. This lesson implements all three, explains their trade-offs (stability, extra memory, worst cases), and relates them to the algorithms Java uses.",
    topics: [
      [
        "Merge sort",
        "Split the array in half recursively until single elements remain, then merge sorted halves by repeatedly taking the smaller head element. Always O(n log n), stable, but needs O(n) extra memory for merging. Java's object sort (TimSort) is a merge-sort hybrid that exploits existing runs.",
      ],
      [
        "Quick sort",
        "Choose a pivot, partition so smaller elements go left and larger go right, then sort each side recursively. O(n log n) on average, in place (O(log n) stack), very fast in practice, but O(n squared) in the worst case with bad pivots (for example the first element of already sorted data); random or median-of-three pivots avoid it. Not stable. Java's primitive sort is a dual-pivot quicksort.",
      ],
      [
        "Heap sort",
        "Build a max-heap in the array (parent >= children), then swap the root (maximum) to the end, shrink the heap and sift the new root down; repeat. O(n log n) in all cases with O(1) extra memory, but not stable and slower in practice than quicksort due to poor cache locality.",
      ],
      [
        "Comparison",
        "Merge: stable, O(n) memory, guaranteed O(n log n). Quick: not stable, in place, fastest on average, O(n squared) worst case. Heap: not stable, in place, guaranteed O(n log n). Any comparison sort needs at least on the order of n log n comparisons in the worst case.",
      ],
    ],
    code: String.raw`import java.util.Arrays;
import java.util.Random;

public class Main {
    static long comparisons;

    static void mergeSort(int[] a, int[] tmp, int lo, int hi) {
        if (hi - lo < 1) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, tmp, lo, mid);
        mergeSort(a, tmp, mid + 1, hi);
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) { comparisons++; tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++]; }   // <= keeps it stable
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
    }

    static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[(lo + hi) >>> 1];                 // middle pivot
        int i = lo, j = hi;
        while (i <= j) {
            while (a[i] < pivot) { i++; comparisons++; }
            while (a[j] > pivot) { j--; comparisons++; }
            if (i <= j) { int t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }
        }
        quickSort(a, lo, j);
        quickSort(a, i, hi);
    }

    static void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);           // build max-heap
        for (int end = n - 1; end > 0; end--) {
            int t = a[0]; a[0] = a[end]; a[end] = t;                         // move max to the end
            siftDown(a, 0, end);
        }
    }

    static void siftDown(int[] a, int i, int size) {
        while (true) {
            int largest = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < size) { comparisons++; if (a[l] > a[largest]) largest = l; }
            if (r < size) { comparisons++; if (a[r] > a[largest]) largest = r; }
            if (largest == i) return;
            int t = a[i]; a[i] = a[largest]; a[largest] = t;
            i = largest;
        }
    }

    public static void main(String[] args) {
        int[] small = {38, 27, 43, 3, 9, 82, 10};
        int[] m = small.clone(), q = small.clone(), h = small.clone();
        mergeSort(m, new int[m.length], 0, m.length - 1);
        quickSort(q, 0, q.length - 1);
        heapSort(h);
        System.out.println("merge " + Arrays.toString(m) + "\nquick " + Arrays.toString(q) + "\nheap  " + Arrays.toString(h));

        int[] big = new Random(7).ints(200_000, 0, 1_000_000).toArray();
        int[] expected = big.clone();
        Arrays.sort(expected);
        for (String name : new String[] {"merge", "quick", "heap"}) {
            int[] copy = big.clone();
            comparisons = 0;
            if (name.equals("merge")) mergeSort(copy, new int[copy.length], 0, copy.length - 1);
            else if (name.equals("quick")) quickSort(copy, 0, copy.length - 1);
            else heapSort(copy);
            System.out.printf("%-5s on 200,000 random ints: correct %b, comparisons about %.1f million (n log2 n = %.1f million)%n",
                    name, Arrays.equals(copy, expected), comparisons / 1e6, 200_000 * (Math.log(200_000) / Math.log(2)) / 1e6);
        }
    }
}`,
    walk:
      "All three algorithms sort the small array to the same result. Merge sort recursively halves the range and merges with `<=` so equal elements keep their order. Quick sort partitions around the middle element and recurses on both sides. Heap sort first builds a max-heap with `siftDown`, then repeatedly swaps the maximum to the end and restores the heap.\n\nOn 200,000 random ints, each result is checked against `Arrays.sort` and the number of comparisons is printed. Quick sort (about 2.9 million) and merge sort (about 3.3 million) stay below n log2 n (about 3.5 million), while heap sort needs roughly twice as many comparisons (about 6.4 million), which is one reason it is slower in practice despite its guaranteed O(n log n).",
    anim: [
      "Merge sort: divide and merge",
      [
        ["full", "[38,27,43,3]", "unsorted"],
        ["split", "[38,27] [43,3]", "divide"],
        ["single", "[27,38] [3,43]", "sorted halves"],
        ["merge", "merge", "take smaller"],
        ["res", "[3,27,38,43]", "sorted"],
      ],
      [
        ["full", "split", "split", "The array is split in half recursively until pieces have one element."],
        ["split", "single", "sort", "Each tiny piece is trivially sorted, and pairs are merged into sorted halves."],
        ["single", "merge", "merge", "Merging compares the heads of both halves and takes the smaller each time."],
        ["merge", "res", "done", "The merged result is sorted; each level costs O(n) and there are log n levels."],
      ],
    ],
    mistakes: [
      "Choosing the first element as pivot on sorted data, triggering quicksort's O(n squared) worst case.",
      "Using `<` instead of `<=` in merge, making merge sort unstable.",
      "Allocating a new temp array in every merge call instead of once.",
    ],
    qa: [
      ["Which sorting algorithm does Java use?", "Dual-pivot quicksort for primitive arrays and TimSort (stable merge/insertion hybrid) for objects."],
      ["What is the worst case of quicksort and how do you avoid it?", "O(n squared) with consistently bad pivots; use random, median-of-three or middle pivots (and introsort-style fallbacks)."],
      ["Which O(n log n) sort is stable?", "Merge sort (and TimSort); quicksort and heap sort are not."],
      ["Which needs O(1) extra memory and guarantees O(n log n)?", "Heap sort."],
    ],
    ex: [
      "Write the partition step of quicksort using the last element as the pivot (Lomuto scheme).",
      "`int pivot = a[hi], i = lo; for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a, i++, j); swap(a, i, hi); return i;` Elements left of the returned index are smaller than the pivot.",
    ],
  }),

  lesson("Radix Sort, Shell Sort, Bucket Sort and Counting Sort", {
    intro:
      "Not every sort compares elements. Counting, radix and bucket sort exploit the structure of keys (small integer ranges, digits, uniform distribution) to beat the O(n log n) limit. Shell sort, by contrast, is a clever improvement of insertion sort. This lesson implements all four and explains when each applies.",
    topics: [
      [
        "Counting sort",
        "For integers in a small range [0, k], count occurrences of each value, turn the counts into starting positions (prefix sums), and place each element into its position. O(n + k) time and O(n + k) space; stable when you iterate from the end. Ideal for ages, grades, or as the inner step of radix sort.",
      ],
      [
        "Radix sort",
        "Sort numbers digit by digit, from the least significant digit to the most, using a stable sort (counting sort on base 10 or 256) for each digit. O(d * (n + b)) for d digits in base b, effectively linear for fixed-width keys like 32-bit ints, phone numbers or IDs.",
      ],
      [
        "Bucket sort",
        "Distribute values into buckets covering equal ranges, sort each bucket (often with insertion sort), and concatenate. Average O(n + k) when the input is uniformly distributed (for example random doubles in [0, 1)); degrades to the inner sort's worst case if everything lands in one bucket.",
      ],
      [
        "Shell sort",
        "Insertion sort on elements that are a gap apart, with the gap shrinking each round (for example n/2, n/4, ..., 1, or Knuth's 1, 4, 13, 40...). Early rounds move elements long distances cheaply, so the final gap-1 insertion sort has little work left. Roughly O(n^1.3) to O(n^1.5) in practice depending on the gap sequence, in place, not stable.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static int[] countingSort(int[] a, int max) {
        int[] count = new int[max + 1];
        for (int v : a) count[v]++;
        for (int i = 1; i <= max; i++) count[i] += count[i - 1];          // prefix sums = end positions
        int[] out = new int[a.length];
        for (int i = a.length - 1; i >= 0; i--) out[--count[a[i]]] = a[i];   // from the end: stable
        return out;
    }

    static void radixSort(int[] a) {                                     // non-negative ints, base 10
        int max = Arrays.stream(a).max().orElse(0);
        for (int exp = 1; max / exp > 0; exp *= 10) {
            int[] out = new int[a.length], count = new int[10];
            for (int v : a) count[(v / exp) % 10]++;
            for (int d = 1; d < 10; d++) count[d] += count[d - 1];
            for (int i = a.length - 1; i >= 0; i--) out[--count[(a[i] / exp) % 10]] = a[i];
            System.arraycopy(out, 0, a, 0, a.length);
            System.out.println("    after digit " + exp + ": " + Arrays.toString(a));
        }
    }

    static void bucketSort(double[] a) {                                  // values in [0, 1)
        List<List<Double>> buckets = new ArrayList<>();
        for (int i = 0; i < a.length; i++) buckets.add(new ArrayList<>());
        for (double v : a) buckets.get((int) (v * a.length)).add(v);
        int k = 0;
        for (List<Double> b : buckets) {
            Collections.sort(b);                                          // small buckets
            for (double v : b) a[k++] = v;
        }
    }

    static void shellSort(int[] a) {
        for (int gap = a.length / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < a.length; i++) {
                int key = a[i], j = i;
                while (j >= gap && a[j - gap] > key) { a[j] = a[j - gap]; j -= gap; }   // gapped insertion sort
                a[j] = key;
            }
            System.out.println("    gap " + gap + ": " + Arrays.toString(a));
        }
    }

    public static void main(String[] args) {
        int[] grades = {7, 3, 9, 3, 0, 10, 7, 3};
        System.out.println("counting sort of grades 0..10: " + Arrays.toString(countingSort(grades, 10)));

        int[] numbers = {170, 45, 75, 90, 802, 24, 2, 66};
        System.out.println("radix sort of " + Arrays.toString(numbers) + ":");
        radixSort(numbers);

        double[] fractions = {0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12};
        bucketSort(fractions);
        System.out.println("bucket sort of uniform fractions: " + Arrays.toString(fractions));

        int[] shell = {23, 12, 1, 8, 34, 54, 2, 3};
        System.out.println("shell sort of " + Arrays.toString(shell) + ":");
        shellSort(shell);

        int[] big = new Random(1).ints(1_000_000, 0, 1000).toArray();
        long start = System.nanoTime();
        int[] counted = countingSort(big, 999);
        long countingMs = (System.nanoTime() - start) / 1_000_000;
        int[] check = big.clone();
        Arrays.sort(check);
        System.out.println("counting sort of 1,000,000 values in 0..999 correct: " + Arrays.equals(counted, check)
                + " (linear time, no comparisons)" + (countingMs >= 0 ? "" : ""));
    }
}`,
    walk:
      "Counting sort counts each grade, converts counts into end positions with prefix sums and places elements from the end, which keeps equal keys in order. Radix sort applies the same counting step to the ones, tens and hundreds digits in turn; the trace shows the array becoming sorted only after the last (most significant) digit pass.\n\nBucket sort spreads eight fractions into eight buckets by value and sorts each small bucket. Shell sort performs insertion sort with gaps 4, 2 and 1; by the time the gap is 1, the array is nearly sorted. Finally counting sort orders a million values in a small range correctly without a single comparison.",
    anim: [
      "Radix sort by digits",
      [
        ["in", "170 45 75 802", "input"],
        ["ones", "ones digit", "stable pass"],
        ["tens", "tens digit", "stable pass"],
        ["hund", "hundreds digit", "stable pass"],
        ["out", "45 75 170 802", "sorted"],
      ],
      [
        ["in", "ones", "pass 1", "First, a stable counting sort orders the numbers by their last digit."],
        ["ones", "tens", "pass 2", "Then by the tens digit; ties keep the order from the previous pass."],
        ["tens", "hund", "pass 3", "Then by the hundreds digit, the most significant one."],
        ["hund", "out", "done", "Because every pass is stable, the result is fully sorted."],
      ],
    ],
    mistakes: [
      "Using counting sort when the key range k is much larger than n (huge count array).",
      "Using an unstable digit sort inside radix sort, which breaks correctness.",
      "Applying bucket sort to skewed data where most values fall into one bucket.",
    ],
    qa: [
      ["How can counting sort beat O(n log n)?", "It does not compare elements; it uses keys as array indexes, running in O(n + k) for a key range of size k."],
      ["Why must the digit sort in radix sort be stable?", "So that the ordering established by earlier (less significant) digits is preserved when later digits tie."],
      ["What is Shell sort?", "A generalisation of insertion sort that first sorts elements far apart using shrinking gaps, finishing with a normal insertion sort."],
      ["When does bucket sort perform well?", "When input values are spread uniformly across the range, so buckets stay small."],
    ],
    ex: [
      "Sort 10 million employee ages (0 to 120) as fast as possible. Which algorithm and why?",
      "Counting sort: the key range (121 values) is tiny compared with n, so it runs in O(n + 121) with one pass to count and one to output.",
    ],
  }),

  lesson("Pancake Sort and the Tower of Hanoi", {
    intro:
      "Two classic puzzles round out this section. Pancake sorting sorts an array when the only allowed operation is flipping a prefix, like a chef flipping a stack of pancakes with a spatula. The Tower of Hanoi moves n disks between three pegs and is the textbook example of recursion. This lesson implements both and analyses their move counts.",
    topics: [
      [
        "Pancake sort",
        "Repeatedly find the largest unsorted element, flip it to the top (front) with one prefix reversal, then flip it down into its final position with a second reversal, and shrink the unsorted part. At most 2n - 3 flips and O(n squared) comparisons. Interesting when reversal is the primitive operation (some hardware and genome rearrangement problems).",
      ],
      [
        "Tower of Hanoi rules",
        "Three pegs and n disks of different sizes on the source peg, largest at the bottom. Move all disks to the target peg, one disk at a time, never placing a larger disk on a smaller one.",
      ],
      [
        "Recursive solution",
        "To move n disks from A to C using B: move the top n - 1 disks from A to B, move the largest disk from A to C, then move the n - 1 disks from B to C. The base case is one disk. The total number of moves is 2^n - 1, which is also the minimum possible.",
      ],
      [
        "Complexity",
        "Hanoi is O(2^n): 3 disks take 7 moves, 10 disks 1,023 and 64 disks over 18 quintillion. Recursion depth is n. An iterative version exists (alternating moves of the smallest disk), but the recursive one directly mirrors the problem's structure.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static int flips = 0;

    static void flip(int[] a, int k) {                                  // reverse a[0..k]
        for (int i = 0, j = k; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; }
        flips++;
    }

    static void pancakeSort(int[] a) {
        for (int size = a.length; size > 1; size--) {
            int maxIdx = 0;
            for (int i = 1; i < size; i++) if (a[i] > a[maxIdx]) maxIdx = i;
            if (maxIdx == size - 1) continue;                            // already in place
            if (maxIdx > 0) { flip(a, maxIdx); System.out.println("    flip top " + (maxIdx + 1) + ": " + Arrays.toString(a)); }
            flip(a, size - 1);
            System.out.println("    flip top " + size + ": " + Arrays.toString(a));
        }
    }

    static List<String> moves = new ArrayList<>();

    static void hanoi(int n, char from, char via, char to) {
        if (n == 0) return;
        hanoi(n - 1, from, to, via);                                     // move n-1 out of the way
        moves.add("disk " + n + ": " + from + " -> " + to);              // move the largest
        hanoi(n - 1, via, from, to);                                     // put n-1 back on top
    }

    public static void main(String[] args) {
        int[] stack = {3, 6, 1, 9, 4, 2};
        System.out.println("pancake sort of " + Arrays.toString(stack) + ":");
        pancakeSort(stack);
        System.out.println("sorted with " + flips + " flips (upper bound 2n - 3 = " + (2 * stack.length - 3) + ")");

        hanoi(3, 'A', 'B', 'C');
        System.out.println("Tower of Hanoi with 3 disks (" + moves.size() + " moves):");
        moves.forEach(m -> System.out.println("    " + m));

        for (int n : new int[] {1, 5, 10, 20}) {
            moves.clear();
            hanoi(n, 'A', 'B', 'C');
            System.out.println("n = " + n + ": " + moves.size() + " moves = 2^" + n + " - 1 = " + ((1L << n) - 1));
        }
        System.out.println("n = 64 would need " + new java.math.BigInteger("2").pow(64).subtract(java.math.BigInteger.ONE) + " moves");
    }
}`,
    walk:
      "Pancake sort finds the largest unsorted value, flips it to the top of the stack and then flips it down to the bottom of the unsorted part; the trace shows each prefix reversal. Six elements are sorted in fewer flips than the 2n - 3 = 9 upper bound.\n\n`hanoi` moves n - 1 disks to the spare peg, the largest disk to the target, and the n - 1 disks back on top. For 3 disks it prints the optimal 7 moves. The move count always equals 2^n - 1, doubling with each extra disk, and 64 disks would need about 18.4 quintillion moves.",
    anim: [
      "Hanoi recursion for 3 disks",
      [
        ["a", "peg A", "disks 1,2,3"],
        ["b", "peg B", "spare"],
        ["c", "peg C", "target"],
        ["sub", "move 2 disks", "A -> B"],
        ["big", "move disk 3", "A -> C"],
      ],
      [
        ["a", "sub", "recurse", "First recursively move the top two disks from A to B, using C as the spare."],
        ["sub", "b", "3 moves", "That takes 3 moves and leaves disk 3 alone on A."],
        ["a", "big", "move", "Move the largest disk directly from A to C."],
        ["b", "c", "recurse", "Finally move the two disks from B onto C: 3 more moves, 7 in total."],
      ],
    ],
    mistakes: [
      "Forgetting the base case in recursive Hanoi, causing StackOverflowError.",
      "Running Hanoi for large n and expecting it to finish (exponential time).",
      "Flipping the wrong prefix length in pancake sort (off-by-one with indexes).",
    ],
    qa: [
      ["How many moves does the Tower of Hanoi need for n disks?", "2^n - 1, which is optimal."],
      ["What is the recursive idea behind Tower of Hanoi?", "Move n - 1 disks to the spare peg, move the largest disk to the target, then move the n - 1 disks onto it."],
      ["What is pancake sorting?", "Sorting using only prefix reversals (flips); it needs at most 2n - 3 flips with the simple algorithm."],
    ],
    ex: [
      "How many moves does disk 1 (the smallest) make in a 4-disk Tower of Hanoi solution?",
      "Disk k moves 2^(n - k) times, so disk 1 moves 2^3 = 8 times out of the 15 total moves.",
    ],
  }),
]);
