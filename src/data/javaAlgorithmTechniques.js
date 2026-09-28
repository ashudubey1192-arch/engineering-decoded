// Each example is a standalone Java program. Traces are authored walkthroughs,
// not Java execution in the browser; scripts/check-java-techniques.mjs verifies outputs.
const technique = (
  id,
  title,
  course,
  signal,
  invariant,
  complexity,
  project,
  pitfall,
  practice,
  steps,
  method,
  call,
  expected,
  checks,
) => ({
  id,
  title,
  course,
  signal,
  invariant,
  complexity,
  project,
  pitfall,
  practice,
  steps,
  method,
  call,
  expected,
  checks,
});

export const javaAlgorithmTechniques = [
  technique(
    "binary",
    "Binary search · first feasible boundary",
    "binary-search",
    "Sorted input or a false-to-true predicate. Start with a linear scan, then prove that half of the candidates can be discarded.",
    "Everything before lo is below the target; everything at or after hi is at least the target. Search [lo, hi).",
    "O(log n) time, O(1) extra space on a random-access array.",
    "Find the first timestamp at or after a request. For minimum server capacity, binary-search a bounded capacity only after proving feasibility is monotonic; multiply search cost by the feasibility scan.",
    "An insertion position can equal array length. Never dereference it without checking. Use lo + (hi - lo) / 2.",
    "Find first and last duplicate positions, then solve minimum shipping capacity. Explain why arbitrary unsorted predicates fail.",
    [
      [
        "[1  2  2  5  8]   target=2",
        "Begin lo=0, hi=5. The entire half-open interval is eligible.",
      ],
      ["lo=0   mid=2 → 2   hi=5", "2 is at least the target, so keep it by moving hi to 2."],
      [
        "lo=0   mid=1 → 2   hi=2",
        "Move hi to 1; compare index 0 next and move lo to 1. Return boundary 1.",
      ],
    ],
    `static int solve(int[] a, int target) {
    int lo = 0, hi = a.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
    "solve(new int[]{1,2,2,5,8}, 2)",
    "1",
    ["solve(new int[]{}, 2) == 0", "solve(new int[]{1,2}, 3) == 2"],
  ),
  technique(
    "pointers",
    "Two pointers · sorted pair sum",
    "binary-search",
    "A sorted array and a pair target. Replace O(n²) pair enumeration with inward-moving boundaries.",
    "If the sum is too small, no pair using the left value and a smaller right value can succeed; the symmetric rule discards right.",
    "O(n) time and O(1) space; sorting unsorted input first costs O(n log n) and changes index meaning.",
    "Match two sorted price lists against a budget. Preserve original IDs when sorting records; return a defined no-match result.",
    "This movement rule requires sorted values. Cast before addition to avoid int overflow, and do not reuse one index twice.",
    "Extend to unique 3-sum triples with sorting plus a fixed outer index. Explain duplicate skipping and O(n²) cost.",
    [
      ["[1  3  4  7]   target=8\n L        R", "1+7=8: the extreme pair already meets the target."],
      [
        "indices → [0, 3]",
        "Return distinct indices. For target 10 the first sum would be too small, so advance left.",
      ],
      [
        "target=10: [1  3  4  7]\n               L     R",
        "3+7=10. Each move eliminates a proven-impossible set of pairs.",
      ],
    ],
    `static int[] solve(int[] a, long target) {
    int l = 0, r = a.length - 1;
    while (l < r) {
        long sum = (long) a[l] + a[r];
        if (sum == target) return new int[]{l, r};
        if (sum < target) l++; else r--;
    }
    return new int[0];
}`,
    "Arrays.toString(solve(new int[]{1,3,4,7}, 8))",
    "[0, 3]",
    ["solve(new int[]{}, 4).length == 0", "solve(new int[]{4}, 8).length == 0"],
  ),
  technique(
    "window",
    "Sliding window · longest unique substring",
    "binary-search",
    "A contiguous range whose invalidity can be repaired by advancing left. Brute force rechecks every substring; retain the last seen position instead.",
    "The current window contains no repeated UTF-16 code unit; left never moves backward.",
    "O(n) expected time, O(min(n, 65536)) map entries for this Java char implementation.",
    "Track a bounded contiguous session with unique event labels. For a real rate limiter use timestamps, eviction, and concurrency rules; this example is not a distributed limiter.",
    "Java char is a UTF-16 code unit, not necessarily a full Unicode character. Use codePoints() and integer keys when the contract is Unicode code points. Sum windows need separate reasoning with negative values.",
    "Implement longest substring with at most k distinct code points. State when shrinking restores validity.",
    [
      ["a b c a b c b b\n[ a b c ]", "At right=2 the unique window has length 3."],
      ["a b c a\n  [ b c a ]", "The repeated a was at 0; move left to 1."],
      [
        "a b c a b c b b\n              [b]",
        "The last b forces left to 7. The best length remains 3.",
      ],
    ],
    `static int solve(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        Integer previous = last.put(s.charAt(right), right);
        if (previous != null) left = Math.max(left, previous + 1);
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
    'solve("abcabcbb")',
    "3",
    ['solve("") == 0', 'solve("abba") == 2'],
  ),
  technique(
    "prefix",
    "Prefix sums + hashing · subarray counts",
    "dynamic-programming",
    "Count contiguous ranges with an exact sum, including negative values. Transform range sum into the difference of two prefixes.",
    "Before storing the current prefix, the frequency map contains exactly all earlier prefixes, including the empty prefix 0.",
    "O(n) expected time and O(n) space. long protects int-array sums and pair counts for practical Java array sizes.",
    "Count daily revenue segments with a given net change. For repeated range-sum reads build a prefix array; for frequent point updates consider a Fenwick tree instead.",
    "Initialize frequency[0]=1, count before inserting, and store frequencies rather than just presence. Sliding-window sums do not generally work with negative numbers.",
    "Adapt to longest zero-sum range by storing the earliest prefix index. Compare frequency versus first-index contracts.",
    [
      [
        "values: [1, -1, 1]   k=1\nprefix: 0",
        "Seed {0:1}; an empty prefix allows ranges starting at index 0.",
      ],
      [
        "prefix=1 → need 0 → count=1\nprefix=0 → need -1 → count=1",
        "Insert each prefix only after counting earlier matches.",
      ],
      [
        "prefix=1 → need 0 (frequency 2)\ncount=3",
        "The last element and the whole array add two more valid ranges.",
      ],
    ],
    `static long solve(int[] a, long k) {
    Map<Long, Long> frequency = new HashMap<>();
    frequency.put(0L, 1L);
    long prefix = 0, count = 0;
    for (int x : a) {
        prefix += x;
        count += frequency.getOrDefault(prefix - k, 0L);
        frequency.merge(prefix, 1L, Long::sum);
    }
    return count;
}`,
    "solve(new int[]{1,-1,1}, 1)",
    "3",
    ["solve(new int[]{}, 0) == 0", "solve(new int[]{0,0}, 0) == 3"],
  ),
  technique(
    "merge",
    "Divide and conquer · merge sort",
    "sorting-algorithms",
    "Need predictable sorting with stable equal-key order. Split into smaller independent problems and merge their sorted answers.",
    "During merging, the output prefix contains the smallest consumed elements in sorted order; choose the left element on ties.",
    "O(n log n) time, O(n) buffer plus O(log n) recursion stack. This implementation mutates its input.",
    "Merge sorted event batches. For data larger than memory, sort chunks and merge external runs; account for disk I/O and stable tie-breakers.",
    "Do not allocate a fresh full-array buffer at every recursive call. In application code prefer the standard library unless a measured requirement warrants custom sorting.",
    "Count inversions during merge. Contrast quicksort's expected O(n log n), O(n²) worst case, and heap sort's O(n log n) worst case.",
    [
      [
        "[4 1 3 2]\n ↙     ↘\n[4 1] [3 2]",
        "Split until single elements form trivially sorted runs.",
      ],
      [
        "[4]+[1] → [1 4]\n[3]+[2] → [2 3]",
        "Merge each pair by selecting the smaller current head.",
      ],
      ["[1 4]+[2 3] → [1 2 3 4]", "Compare 1/2, then 4/2, then 4/3, and copy the remainder."],
    ],
    `static int[] solve(int[] a) {
    sort(a, new int[a.length], 0, a.length);
    return a;
}
static void sort(int[] a, int[] temp, int lo, int hi) {
    if (hi - lo < 2) return;
    int mid = lo + (hi - lo) / 2;
    sort(a, temp, lo, mid); sort(a, temp, mid, hi);
    int i = lo, j = mid;
    for (int k = lo; k < hi; k++) {
        if (j == hi || (i < mid && a[i] <= a[j])) temp[k] = a[i++];
        else temp[k] = a[j++];
    }
    System.arraycopy(temp, lo, a, lo, hi - lo);
}`,
    "Arrays.toString(solve(new int[]{4,1,3,2}))",
    "[1, 2, 3, 4]",
    ["solve(new int[]{}).length == 0", "Arrays.equals(solve(new int[]{2,1,2}), new int[]{1,2,2})"],
  ),
  technique(
    "select",
    "Partitioning · quickselect",
    "divide-and-conquer",
    "Find one order statistic without fully sorting. Partition around a pivot and recurse only into the side containing the requested rank.",
    "After partition, values before p are less than the pivot, p is in sorted rank position, and values after p are at least the pivot.",
    "Expected O(n) with random pivots on distinct values; O(n²) worst case, including all-equal input in this two-way version. O(1) extra space.",
    "Compute a batch percentile without sorting the full batch. Define percentile interpolation separately. Use three-way partitioning for many equal values or a library selection routine.",
    "Rank here is zero-based. The input is mutated. Random pivots do not guarantee worst-case linear time.",
    "Implement a three-way equal band; explain why it avoids repeated work on duplicates. Compare a heap for streaming top-k.",
    [
      ["[7 2 5 1]  k=2  pivot=1", "Illustrative pivot choice: partition places 1 at index 0."],
      ["[1 | 2 5 7]  k=2", "Discard index 0; the target rank is in the right interval."],
      [
        "[1 2 | 5 | 7] → 5",
        "Once the pivot lands at rank 2, return 5. Random runs may choose other pivots.",
      ],
    ],
    `static int solve(int[] a, int k) {
    if (k < 0 || k >= a.length) throw new IllegalArgumentException("rank");
    int lo = 0, hi = a.length - 1;
    Random random = new Random(7);
    while (lo <= hi) {
        int chosen = lo + random.nextInt(hi - lo + 1);
        swap(a, chosen, hi);
        int p = lo;
        for (int j = lo; j < hi; j++) if (a[j] < a[hi]) swap(a, p++, j);
        swap(a, p, hi);
        if (p == k) return a[p];
        if (p < k) lo = p + 1; else hi = p - 1;
    }
    throw new IllegalStateException();
}
static void swap(int[] a, int i, int j) {
    int t = a[i]; a[i] = a[j]; a[j] = t;
}`,
    "solve(new int[]{7,2,5,1}, 2)",
    "5",
    ["solve(new int[]{3,3,3}, 1) == 3", "solve(new int[]{9}, 0) == 9"],
  ),
  technique(
    "recursion",
    "Recursion · tree height",
    "recursion",
    "The input is recursively structured. Define the answer for an empty tree, then combine left and right subtree results.",
    "Each call returns the number of nodes on the longest downward path beginning at its node; null has height zero.",
    "O(n) time, O(h) call stack; h can be n in a skewed tree.",
    "Measure hierarchy depth in a category tree. Untrusted or deeply nested input needs a depth limit or an explicit stack. A graph with cycles needs visited-state tracking.",
    "Clarify whether height counts nodes or edges. Java does not guarantee tail-call elimination; deep recursion can overflow the stack.",
    "Return both height and balance status in one postorder pass, avoiding a repeated O(n²) height calculation.",
    [
      ["    1\n   / \\\n  2   3\n /\n4", "Descend to leaves; their null children return 0."],
      [
        "height(4)=1\nheight(2)=1+max(1,0)=2",
        "Combine child answers as calls return, not when nodes are first visited.",
      ],
      [
        "height(3)=1\nheight(1)=1+max(2,1)=3",
        "The root combines both subtree heights and returns 3.",
      ],
    ],
    `static class Node {
    Node left, right;
    Node(Node left, Node right) { this.left = left; this.right = right; }
}
static int solve(Node node) {
    if (node == null) return 0;
    return 1 + Math.max(solve(node.left), solve(node.right));
}`,
    "solve(new Node(new Node(new Node(null,null),null), new Node(null,null)))",
    "3",
    ["solve(null) == 0", "solve(new Node(null,null)) == 1"],
  ),
  technique(
    "backtrack",
    "Backtracking · enumerate subsets",
    "backtracking",
    "Need all valid combinations or assignments. Explore choices, prune invalid branches, and restore mutable state before trying siblings.",
    "At entry to index i, path contains exactly the chosen elements from indices below i. A recursive branch restores path before returning.",
    "O(n·2^n) time and stored output, O(n) auxiliary recursion/path space. Input elements are assumed distinct.",
    "Explore small feature configurations with constraint pruning. Put explicit bounds on search size and cancellation time; enumeration is not suitable for unbounded production input.",
    "Copy the path into results. Storing the mutable path itself makes all outputs alias one list. Duplicate input needs sorting and a duplicate policy.",
    "Add a sum constraint for positive values and prune sums above the target. Explain why that pruning fails with negative values.",
    [
      [
        "[]\n├─ exclude 1\n└─ include 1 → [1]",
        "Branch once for each decision about the first element.",
      ],
      [
        "exclude 1 → [], [2]\ninclude 1 → [1], [1,2]",
        "At the second element, branch again and copy every completed path.",
      ],
      [
        "after include: remove last\npath restored → []",
        "Undo restores sibling independence. The output has 2²=4 subsets.",
      ],
    ],
    `static List<List<Integer>> solve(int[] a) {
    List<List<Integer>> out = new ArrayList<>();
    visit(a, 0, new ArrayList<>(), out);
    return out;
}
static void visit(int[] a, int i, List<Integer> path, List<List<Integer>> out) {
    if (i == a.length) { out.add(new ArrayList<>(path)); return; }
    visit(a, i + 1, path, out);
    path.add(a[i]);
    visit(a, i + 1, path, out);
    path.remove(path.size() - 1);
}`,
    "solve(new int[]{1,2})",
    "[[], [2], [1], [1, 2]]",
    ["solve(new int[]{}).size() == 1", "solve(new int[]{1,2,3}).size() == 8"],
  ),
  technique(
    "coins",
    "Dynamic programming · unbounded coin change",
    "dynamic-programming",
    "An optimum depends on overlapping smaller amounts. Define dp[x] as the minimum coins to make exactly x, rather than guessing a greedy rule.",
    "When computing amount x, every dp[x-coin] is finalized because all coin values are positive.",
    "O(amount × number of coins) time, O(amount) space; pseudo-polynomial in numeric amount.",
    "Optimize a small integer quota allocation. Bound the amount before allocation; large monetary or multidimensional planning problems need different algorithms and explicit units.",
    "Largest-coin-first fails for coins [1,3,4], amount 6. Zero or negative denominations invalidate the recurrence. Use an unreachable sentinel safely.",
    "Add parent choices to reconstruct coins. Then distinguish counting combinations from counting ordered sequences by loop order.",
    [
      [
        "coins=[1,3,4]\ndp[0]=0; other states=∞",
        "Making zero requires no coins. Begin from this reachable base state.",
      ],
      [
        "x:  0 1 2 3 4 5\ndp: 0 1 2 1 1 2",
        "Each state tries a final coin and adds one to the best earlier reachable amount.",
      ],
      ["dp[6]=min(dp[5],dp[3],dp[2])+1=2", "Choose 3+3. Greedy's 4+1+1 uses three coins instead."],
    ],
    `static int solve(int[] coins, int amount) {
    if (amount < 0 || amount == Integer.MAX_VALUE) throw new IllegalArgumentException("amount");
    for (int c : coins) if (c <= 0) throw new IllegalArgumentException("coin");
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); dp[0] = 0;
    for (int x = 1; x <= amount; x++)
        for (int c : coins) if (c <= x && dp[x-c] <= amount)
            dp[x] = Math.min(dp[x], dp[x-c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    "solve(new int[]{1,3,4}, 6)",
    "2",
    ["solve(new int[]{2}, 3) == -1", "solve(new int[]{}, 0) == 0"],
  ),
  technique(
    "knapsack",
    "0/1 DP · capacity and dependency order",
    "dynamic-programming",
    "Each item can be selected at most once under a capacity constraint. Brute force explores 2^n subsets; DP merges equivalent item/capacity states.",
    "After each item, dp[c] is the best value using processed items within capacity c. Descending capacity prevents using this item twice.",
    "O(nC) time, O(C) space; C is integer capacity. Nonnegative weights and values, matching array lengths, and a manageable capacity are required.",
    "Select independent jobs under a small integer resource budget. Dependencies, multiple resource types, deadlines, or fractional resources require a richer model.",
    "Ascending capacity implements unbounded reuse, not 0/1 selection. Compressing the table loses straightforward path reconstruction.",
    "Convert to subset-sum reachability, then equal partition. Explain why memoization keys must include both item position and remaining capacity.",
    [
      [
        "weights=[2,3,4], values=[4,5,7], C=5\ndp=[0,0,0,0,0,0]",
        "Initialize the best value for choosing no items.",
      ],
      [
        "after weight 2: [0,0,4,4,4,4]\nafter weight 3: [0,0,4,5,5,9]",
        "At capacity 5, combine the current weight-3 item with the earlier weight-2 item.",
      ],
      [
        "after weight 4: [0,0,4,5,7,9]",
        "Value 7 cannot improve capacity 5's value 9; select the first two items.",
      ],
    ],
    `static long solve(int[] weights, int[] values, int capacity) {
    if (capacity < 0 || capacity == Integer.MAX_VALUE || weights.length != values.length)
        throw new IllegalArgumentException();
    long[] dp = new long[capacity + 1];
    for (int i = 0; i < weights.length; i++) {
        if (weights[i] < 0 || values[i] < 0) throw new IllegalArgumentException();
        for (int c = capacity; c >= weights[i]; c--)
            dp[c] = Math.max(dp[c], dp[c-weights[i]] + values[i]);
    }
    return dp[capacity];
}`,
    "solve(new int[]{2,3,4}, new int[]{4,5,7}, 5)",
    "9",
    ["solve(new int[]{2}, new int[]{4}, 4) == 4", "solve(new int[]{}, new int[]{}, 0) == 0"],
  ),
  technique(
    "greedy",
    "Greedy · interval scheduling",
    "greedy",
    "Maximize the number of non-overlapping unweighted intervals. Sort by earliest finish so each accepted interval leaves maximum room for future choices.",
    "An optimum can exchange its first interval for the earliest-finishing interval without losing any later compatible choice; repeat on the suffix.",
    "O(n log n) sorting plus O(n) scan; object-array sorting may use O(n) auxiliary space. The outer array is reordered.",
    "Choose the maximum number of equal-value bookings for one resource. Weighted revenue needs weighted interval DP; multiple rooms need a heap or sweep-line model.",
    "The example uses half-open [start,end) intervals, permits touching boundaries, and assumes start < end. Avoid subtraction-based comparators, which can overflow.",
    "Find the minimum intervals to remove. Give a counterexample to sorting by earliest start or shortest duration.",
    [
      ["A [1──3)  B [2────5)  C [3──4)  D [4──6)", "Sort by end: A, C, B, D."],
      [
        "take A → end=3\ntake C → end=4",
        "C starts exactly at 3, so it is compatible with A under half-open intervals.",
      ],
      [
        "skip B (2<4)\ntake D → [A,C,D]",
        "Three bookings fit. Local choices are justified by the exchange argument.",
      ],
    ],
    `static int solve(int[][] intervals) {
    for (int[] p : intervals) if (p.length != 2 || p[0] >= p[1]) throw new IllegalArgumentException();
    Arrays.sort(intervals, Comparator.comparingInt(p -> p[1]));
    long end = Long.MIN_VALUE;
    int count = 0;
    for (int[] p : intervals) if (p[0] >= end) { count++; end = p[1]; }
    return count;
}`,
    "solve(new int[][]{{1,3},{2,5},{3,4},{4,6}})",
    "3",
    ["solve(new int[][]{}) == 0", "solve(new int[][]{{-3,-1},{-1,2}}) == 2"],
  ),
  technique(
    "heap",
    "Heap · streaming top-k",
    "greedy",
    "Keep the k largest values while processing a stream. A min-heap exposes the weakest retained candidate for replacement.",
    "After each arrival, the heap holds the largest min(k, processed count) values, including duplicates.",
    "O(n log(k+1)) processing, O(k log k) final output sorting, O(k) space for k ≤ n.",
    "Maintain a bounded leaderboard or slowest-request sample. Define ties and expiry; this cumulative algorithm cannot remove expired events without additional bookkeeping.",
    "PriorityQueue iteration is not sorted. Poll or sort a copy for display. Reject k≤0 and clarify behavior when fewer than k values arrive.",
    "Merge k sorted streams with one heap entry per stream; compare this O(n log k) approach with sorting all values.",
    [
      [
        "stream=[5,1,9,3], k=2\nheap after 5,1 → [1,5]",
        "The root is the smallest value worth retaining so far.",
      ],
      ["insert 9 → remove 1\nheap → [5,9]", "Discard the minimum whenever size exceeds k."],
      [
        "insert 3 → remove 3\nresult sorted → [5,9]",
        "The stream is consumed once. Return a sorted copy only for presentation.",
      ],
    ],
    `static List<Integer> solve(int[] a, int k) {
    if (k <= 0) throw new IllegalArgumentException("k");
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : a) { heap.add(x); if (heap.size() > k) heap.remove(); }
    List<Integer> result = new ArrayList<>(heap);
    Collections.sort(result);
    return result;
}`,
    "solve(new int[]{5,1,9,3}, 2)",
    "[5, 9]",
    ["solve(new int[]{}, 2).isEmpty()", "solve(new int[]{2,2,1}, 2).equals(Arrays.asList(2,2))"],
  ),
  technique(
    "stack",
    "Monotonic stack · next greater element",
    "sorting-algorithms",
    "For each item, find the next larger item to its right. Keep unresolved indices instead of rescanning every suffix.",
    "The stack contains unresolved indices with non-increasing values. A new larger value resolves each smaller stack top exactly once.",
    "O(n) amortized time, O(n) space: every index is pushed once and popped at most once.",
    "Find the next higher sensor reading or next warmer day in a batch. The answer is an index, so absent results never collide with legitimate negative values.",
    "Use a strict comparison for strictly greater. Equal values must stay unresolved. ArrayDeque is a practical stack; it cannot store null.",
    "Solve daily temperatures by returning index differences. Extend to largest rectangle using previous/next smaller boundaries.",
    [
      ["values=[2,1,3]\nstack=[0,1] → values [2,1]", "Indices 0 and 1 await a greater value."],
      [
        "read 3 at index 2\npop 1 → answer[1]=2\npop 0 → answer[0]=2",
        "The current value resolves every smaller waiting top.",
      ],
      ["answer=[2,2,-1]", "No later value resolves index 2; retain the absence sentinel -1."],
    ],
    `static int[] solve(int[] a) {
    int[] next = new int[a.length]; Arrays.fill(next, -1);
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < a.length; i++) {
        while (!stack.isEmpty() && a[stack.peek()] < a[i]) next[stack.pop()] = i;
        stack.push(i);
    }
    return next;
}`,
    "Arrays.toString(solve(new int[]{2,1,3}))",
    "[2, 2, -1]",
    ["solve(new int[]{2,2})[0] == -1", "solve(new int[]{}).length == 0"],
  ),
  technique(
    "bfs",
    "BFS · unweighted shortest paths",
    "recursion",
    "Need the fewest edges in an unweighted graph. Process a FIFO frontier in distance layers instead of using depth-first discovery order.",
    "Every enqueued vertex is marked on discovery; distances leave the queue in nondecreasing order.",
    "O(V+E) time and O(V) auxiliary space for an adjacency list.",
    "Find minimum dependency hops or shortest grid moves of equal cost. Bound graph size and validate vertex IDs. Use DFS for reachability/postorder; use Dijkstra when costs differ and are nonnegative.",
    "Marking on dequeue permits duplicate queue entries. BFS is not a weighted shortest-path algorithm. Unreachable vertices retain -1.",
    "Store parent vertices to reconstruct a route. Extend to multi-source BFS by seeding all sources at distance zero.",
    [
      ["0 → 1 → 3\n└ → 2\nqueue=[0] dist=[0,-1,-1,-1]", "Seed the source and mark it discovered."],
      ["pop 0 → queue=[1,2]\ndist=[0,1,1,-1]", "Neighbors enter the same distance layer."],
      [
        "pop 1 → discover 3\ndist=[0,1,1,2]",
        "The first discovered path to 3 has the fewest edges.",
      ],
    ],
    `static int[] solve(int[][] graph, int source) {
    if (source < 0 || source >= graph.length) throw new IllegalArgumentException();
    int[] d = new int[graph.length]; Arrays.fill(d, -1);
    Deque<Integer> queue = new ArrayDeque<>();
    d[source] = 0; queue.add(source);
    while (!queue.isEmpty()) {
        int u = queue.remove();
        for (int v : graph[u]) if (d[v] == -1) {
            d[v] = d[u] + 1; queue.add(v);
        }
    }
    return d;
}`,
    "Arrays.toString(solve(new int[][]{{1,2},{3},{},{}}, 0))",
    "[0, 1, 1, 2]",
    ["solve(new int[][]{{0},{}}, 0)[1] == -1", "solve(new int[][]{{}}, 0)[0] == 0"],
  ),
  technique(
    "topological",
    "Topological sort · dependency scheduling",
    "recursion",
    "Order directed tasks so prerequisites appear first. Count unmet dependencies and repeatedly release tasks whose indegree becomes zero.",
    "The queue contains only unprocessed vertices with no unmet incoming edge. A complete order exists exactly when the directed graph is acyclic.",
    "O(V+E) time, O(V) auxiliary space.",
    "Plan build stages or data pipeline jobs. Edges here mean prerequisite → dependent. Completion, retries, resource limits, and failures still require a runtime scheduler.",
    "A partial order is not success: fewer than V outputs means a cycle. Multiple valid orders may exist; use a priority queue if deterministic smallest-ID choices are required.",
    "Return course feasibility and detect cycles. Compare Kahn's method with DFS using unvisited/active/finished states.",
    [
      ["0 → 2 ← 1\nindegree=[0,0,2]", "Both 0 and 1 are initially ready."],
      [
        "emit 0 → indegree[2]=1\nemit 1 → indegree[2]=0",
        "Each completed prerequisite removes one unmet edge.",
      ],
      [
        "emit 2 → order=[0,1,2]",
        "All three vertices were emitted, so no directed cycle blocks the schedule.",
      ],
    ],
    `static List<Integer> solve(int[][] graph) {
    int[] degree = new int[graph.length];
    for (int[] edges : graph) for (int v : edges) degree[v]++;
    Deque<Integer> ready = new ArrayDeque<>();
    for (int i = 0; i < degree.length; i++) if (degree[i] == 0) ready.add(i);
    List<Integer> order = new ArrayList<>();
    while (!ready.isEmpty()) {
        int u = ready.remove(); order.add(u);
        for (int v : graph[u]) if (--degree[v] == 0) ready.add(v);
    }
    if (order.size() != graph.length) throw new IllegalArgumentException("cycle");
    return order;
}`,
    "solve(new int[][]{{2},{2},{}})",
    "[0, 1, 2]",
    ["solve(new int[][]{}).isEmpty()", "solve(new int[][]{{1},{}}).equals(Arrays.asList(0,1))"],
  ),
  technique(
    "dijkstra",
    "Dijkstra · nonnegative weighted routes",
    "greedy",
    "Shortest paths with nonnegative edge weights. Replace BFS's FIFO queue with a min-priority queue of tentative distances.",
    "When a current (non-stale) minimum-distance entry is removed, no later path can improve it because edge weights are nonnegative.",
    "O((V+E) log(V+E)) time and O(V+E) space for lazy duplicate heap entries. Unreachable distances use Long.MAX_VALUE.",
    "Route over static nonnegative travel costs. Time-dependent costs require another model; negative edges need Bellman–Ford or a valid DAG method.",
    "Skip outdated heap entries. Reject negative weights and define arithmetic overflow handling. Each adjacency entry here is {destination, weight} with valid vertex IDs.",
    "Track predecessor edges and reconstruct the route. Explain why marking vertices final when first enqueued is incorrect.",
    [
      ["0 ──4──→ 1\n└─1→ 2 ──2→ 1\nd=[0,∞,∞]", "Begin with source distance 0."],
      [
        "pop 0 → d=[0,4,1]\npop 2 → d=[0,3,1]",
        "The route through 2 improves vertex 1 from 4 to 3.",
      ],
      [
        "pop (1,3); skip stale (1,4)\nresult=[0,3,1]",
        "Only the entry matching the latest distance expands outgoing edges.",
      ],
    ],
    `static long[] solve(int[][][] graph, int source) {
    if (source < 0 || source >= graph.length) throw new IllegalArgumentException();
    for (int[][] edges : graph) for (int[] e : edges)
        if (e[1] < 0) throw new IllegalArgumentException("negative edge");
    long[] d = new long[graph.length]; Arrays.fill(d, Long.MAX_VALUE);
    PriorityQueue<long[]> queue = new PriorityQueue<>(Comparator.comparingLong(p -> p[1]));
    d[source] = 0; queue.add(new long[]{source, 0});
    while (!queue.isEmpty()) {
        long[] entry = queue.remove(); int u = (int) entry[0];
        if (entry[1] != d[u]) continue;
        for (int[] e : graph[u]) {
            long candidate = Math.addExact(d[u], e[1]);
            if (candidate < d[e[0]]) {
                d[e[0]] = candidate; queue.add(new long[]{e[0], candidate});
            }
        }
    }
    return d;
}`,
    "Arrays.toString(solve(new int[][][]{{{1,4},{2,1}},{},{{1,2}}}, 0))",
    "[0, 3, 1]",
    [
      "solve(new int[][][]{{},{}}, 0)[1] == Long.MAX_VALUE",
      "solve(new int[][][]{{{0,0}}}, 0)[0] == 0",
    ],
  ),
  technique(
    "dsu",
    "Union-find · connectivity",
    "greedy",
    "Repeatedly join undirected components and query connectivity. Store a representative for each component instead of traversing the graph on every query.",
    "Each parent tree represents exactly one connected component. Join roots, attach the smaller tree under the larger, and compress find paths.",
    "O((V+E) α(V)) amortized time with size weighting and compression, O(V) space; α grows extremely slowly.",
    "Group accounts with explicit equivalence links or build Kruskal's minimum spanning forest by accepting sorted edges that join distinct components. Deletions need a different strategy.",
    "Union-find detects undirected connectivity, not directed cycles or shortest routes. Entity similarity alone does not necessarily define a safe transitive identity relation.",
    "Count connected components after each edge. Add sorted weighted edges to implement Kruskal and compare with Prim's heap approach.",
    [
      ["parents=[0,1,2,3]   components=4", "Every vertex starts as its own representative."],
      [
        "join(0,1) → {0,1}\njoin(2,3) → {2,3}",
        "Each successful merge reduces the component count by one.",
      ],
      [
        "join(1,2) → {0,1,2,3}\ncomponents=1",
        "Find roots before joining; a repeated edge would not reduce the count.",
      ],
    ],
    `static int solve(int n, int[][] edges) {
    int[] parent = new int[n], size = new int[n];
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    int components = n;
    for (int[] e : edges) {
        int a = find(parent, e[0]), b = find(parent, e[1]);
        if (a == b) continue;
        if (size[a] < size[b]) { int t = a; a = b; b = t; }
        parent[b] = a; size[a] += size[b]; components--;
    }
    return components;
}
static int find(int[] parent, int x) {
    while (x != parent[x]) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}`,
    "solve(4, new int[][]{{0,1},{2,3},{1,2}})",
    "1",
    ["solve(0, new int[][]{}) == 0", "solve(2, new int[][]{{0,1},{0,1}}) == 1"],
  ),
  technique(
    "bits",
    "Bit manipulation · XOR cancellation",
    "divide-and-conquer",
    "Exactly one value occurs once and every other value occurs twice. XOR cancels pairs without a frequency map.",
    "The accumulator is the XOR of the processed prefix; x XOR x = 0 and x XOR 0 = x, independent of order.",
    "O(n) time and O(1) space for fixed-width Java int values.",
    "Understand parity summaries and compact permission masks. XOR alone is neither a secure checksum nor a general duplicate detector; validate the problem contract separately.",
    "The answer is meaningless if pair-count assumptions fail. Java int shifts mask the shift distance to five bits; use long masks carefully for wider state sets.",
    "Find two unique values by splitting on a set bit of the combined XOR. Study subset-mask DP only when the number of independent flags is small.",
    [
      ["[4,1,4] → binary [100,001,100]", "Begin with accumulator 000."],
      [
        "000 XOR 100 = 100\n100 XOR 001 = 101",
        "The prefix summary includes both unpaired values so far.",
      ],
      ["101 XOR 100 = 001 → 1", "The two 4 values cancel, leaving the unique value 1."],
    ],
    `static int solve(int[] a) {
    if (a.length == 0) throw new IllegalArgumentException("nonempty input required");
    int result = 0;
    for (int x : a) result ^= x;
    return result;
}`,
    "solve(new int[]{4,1,4})",
    "1",
    ["solve(new int[]{-2,7,-2}) == 7", "solve(new int[]{0}) == 0"],
  ),
];

export function javaTechniqueSource(item, includeChecks = false) {
  const checks = includeChecks
    ? item.checks
        .map(
          (condition) =>
            `        if (!(${condition})) throw new AssertionError(${JSON.stringify(condition)});`,
        )
        .join("\n")
    : "";
  return `import java.util.*;\n\npublic class Main {\n${item.method
    .split("\n")
    .map((line) => "    " + line)
    .join(
      "\n",
    )}\n\n    public static void main(String[] args) {\n${checks}${checks ? "\n" : ""}        System.out.println(${item.call});\n    }\n}\n`;
}

export const javaTechniqueRoadmap = [
  [
    "1 · Establish the contract",
    "State input bounds, sortedness, duplicates, allowed mutation, overflow limits, and what counts as an answer. Solve a tiny example before coding.",
  ],
  [
    "2 · Derive the improvement",
    "Write the brute-force cost. Identify repeated work, monotonic order, overlapping states, or a safe local choice. Choose a technique using its proof conditions.",
  ],
  [
    "3 · Prove and trace",
    "State the invariant, base case, transition, and termination. Trace a normal case and an adversarial case by hand; label indices separately from values.",
  ],
  [
    "4 · Implement in Java",
    "Use arrays for indexed primitive data, HashMap for expected constant-time lookup, ArrayDeque for queues/stacks, and PriorityQueue for minimum-first retrieval. Use Integer.compare or comparingInt instead of subtraction.",
  ],
  [
    "5 · Validate and communicate",
    "Test empty/singleton input where permitted, duplicates, negatives, unreachable states, extreme values, and sorted/reversed cases. State preprocessing, output, stack, and auxiliary costs separately.",
  ],
  [
    "6 · Apply in a project",
    "Define a service contract and resource limits. Measure realistic workloads, compare with library implementations, and test concurrency, cancellation, invalid data, and persistence independently of the core algorithm.",
  ],
];
