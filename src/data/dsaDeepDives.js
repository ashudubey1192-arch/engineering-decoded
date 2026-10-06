// Course companions: small, hand-worked examples complement the executable lesson labs.
const guide = (title, explanation, application, tradeoff, frames, question, answer) => ({
  title,
  explanation,
  application,
  tradeoff,
  frames,
  question,
  answer,
});
const step = (title, cells, detail) => ({ title, cells, detail });

export const dsaDeepDives = {
  "dsa-foundations": guide(
    "From a problem statement to a correct algorithm",
    "An algorithm is a sequence of decisions with a contract. Specify what inputs are allowed, what the output means, and what must remain true while work is in progress. A loop invariant describes processed work precisely enough that termination implies the requested answer. Complexity then counts how much work and extra storage the method needs as the input grows.",
    "For a sensor dashboard, find the smallest reading in a nonempty batch. Track one running minimum instead of sorting every reading. This makes a single pass and preserves the original order.",
    "A minimum scan costs O(n) time and O(1) auxiliary space. Sorting just to obtain the minimum does unnecessary work. Define an explicit error or optional result for an empty batch, because it has no minimum.",
    [
      step(
        "Initialize from real data",
        ["8 ← minimum", "3", "6", "2"],
        "Set minimum to 8, the first reading. Do not initialize to zero: all-positive inputs would incorrectly return zero.",
      ),
      step(
        "Preserve the invariant",
        ["8 ✓", "3 ← minimum", "6", "2"],
        "Compare 3 with 8. The minimum of the processed prefix [8, 3] is now 3.",
      ),
      step(
        "Keep the smaller value",
        ["8 ✓", "3 ← minimum", "6 ✓", "2"],
        "Compare 6 with 3 and keep 3. After each comparison, minimum summarizes exactly the readings visited so far.",
      ),
      step(
        "Connect termination to the result",
        ["8 ✓", "3 ✓", "6 ✓", "2 ← minimum"],
        "Compare 2 with 3 and update. All four readings are processed, so the prefix is the entire input and the answer is 2. There were three comparisons.",
      ),
    ],
    "What changes if the readings are [-4, -9, -2]?",
    "Initialize to -4, update to -9, and keep -9 after comparing -2. The same invariant works for negative values; no special negative-number branch is needed.",
  ),
  arrays: guide(
    "Build a reusable range-sum index",
    "A prefix-sum array stores a summary of every prefix. Define prefix[0] = 0 and prefix[i + 1] = prefix[i] + values[i]. For a half-open interval [left, right), subtract prefix[left] from prefix[right]. The shared prefix cancels, leaving exactly the requested elements. Using an extra leading zero makes intervals beginning at zero and empty intervals follow the same formula.",
    "A dashboard can preprocess daily order counts once and answer many date-range totals without scanning each range again.",
    "Building prefixes takes O(n) time and O(n) extra storage; each query is O(1). Changing one original value can require O(n) prefix repairs. For frequent updates, consider a Fenwick tree. In Java, choose long when sums can exceed int range.",
    [
      step(
        "Original counts",
        ["day 0: 2", "day 1: 4", "day 2: 1", "day 3: 3"],
        "Find the total for days 1 through 3 inclusive, expressed as the half-open interval [1, 4).",
      ),
      step(
        "Start with an empty prefix",
        ["prefix[0] = 0", "prefix[1] = 2", "prefix[2] = 6"],
        "The first two updates are 0 + 2 = 2 and 2 + 4 = 6. prefix[k] always includes exactly k original values.",
      ),
      step(
        "Finish preprocessing",
        ["0", "2", "6", "7", "10"],
        "Adding 1 and then 3 gives the complete prefix array. Its length is five for four input values.",
      ),
      step(
        "Subtract the excluded prefix",
        ["prefix[4] = 10", "− prefix[1] = 2", "sum = 8"],
        "The answer is 10 − 2 = 8, matching 4 + 1 + 3. No loop over the selected range is needed.",
      ),
    ],
    "What is the sum for [2, 2), and why is that a useful boundary check?",
    "prefix[2] − prefix[2] = 0. The interval is empty. This verifies that the query treats the right endpoint as exclusive rather than accidentally including one element.",
  ),
  "linked-lists": guide(
    "Reverse links without losing the remaining list",
    "A singly linked list reaches later nodes through next references. Reversal must redirect those references while preserving a route to the unprocessed suffix. Keep previous, current, and a temporary next node. Save current.next before overwriting it, then move both pointers forward. At each iteration, previous heads a reversed prefix and current heads the original-order remainder.",
    "Use pointer manipulation when a system already stores linked nodes and needs to reorganize their order without copying payloads.",
    "Iterative reversal takes O(n) time and O(1) extra space, but mutates the list. Other code holding node references sees changed links. A singly linked list cannot perform indexed access in constant time; reaching position k takes O(k) traversal.",
    [
      step(
        "Two disjoint regions",
        ["previous: null", "current: A → B → C → null"],
        "The reversed prefix starts empty. The unprocessed region contains all three nodes.",
      ),
      step(
        "Save before redirecting",
        ["saved next: B", "A → null", "B → C → null"],
        "Save B, set A.next to null, then assign previous = A and current = B. Without the saved pointer, B and C would become unreachable from A.",
      ),
      step(
        "Grow the reversed prefix",
        ["previous: B → A → null", "current: C → null"],
        "Save C before pointing B.next to A. Move previous to B and current to C.",
      ),
      step(
        "Return the new head",
        ["previous: C → B → A → null", "current: null"],
        "Redirect C.next to B. current is now null, so return previous. The old head A is the new tail.",
      ),
    ],
    "What should reversal return for an empty list and for one node?",
    "An empty list returns null because the loop never runs. A one-node list returns that same node with next = null. Both cases follow the normal loop without a separate traversal.",
  ),
  stacks: guide(
    "Use a stack to match nested brackets",
    "Nested syntax must close its most recent unmatched opening bracket first. Push opening brackets. For a closing bracket, require a nonempty stack and a matching top, then pop. The stack represents all currently open scopes in their nesting order. At the end it must be empty; matching every encountered closer alone does not prove that all openers were closed.",
    "This pattern appears in expression parsers and editor syntax checks. An undo history also follows last-in, first-out order, though real undo records must contain enough information to reverse an action.",
    "A bracket scan takes O(n) time and O(n) space in the worst case of all opening brackets. A counter can validate one bracket type, but cannot distinguish improperly nested mixed types such as ([)].",
    [
      step(
        "Read (",
        ["bottom: ( ← top"],
        "Push the first opener. The stack records the scope that must eventually close.",
      ),
      step(
        "Read [",
        ["bottom: (", "[ ← top"],
        "Push [. It must close before the earlier parenthesis.",
      ),
      step(
        "Read ]",
        ["bottom: ( ← top"],
        "The top is [, so ] matches it and pops it. One outer scope remains open.",
      ),
      step(
        "Read )",
        ["empty stack → valid"],
        "The final closer matches (. The input ([]) ends with an empty stack and is balanced.",
      ),
    ],
    "Why must ([)] be rejected even though the opener and closer counts match?",
    "When ) arrives, the top is [, which requires ]. Counts ignore nesting order; checking the top detects the mismatch immediately.",
  ),
  "queues-and-deques": guide(
    "Follow a circular queue through wraparound",
    "A circular queue reuses a fixed array by wrapping indices modulo capacity. Let head identify the next item to remove and size count occupied slots. Enqueue writes at (head + size) mod capacity; dequeue advances head by one modulo capacity. An explicit size distinguishes empty from full even when positions coincide.",
    "A bounded work buffer uses this representation to cap memory and preserve arrival order. A full buffer needs an explicit policy: reject, block, or overwrite only when data loss is acceptable.",
    "Enqueue and dequeue take O(1) time in a fixed-capacity ring. Removing the first element of a basic contiguous array by shifting costs O(n). A deque adds removal and insertion at both ends, which is useful for sliding-window algorithms.",
    [
      step(
        "Fill three slots",
        ["slot 0: A", "slot 1: B", "slot 2: C", "slot 3: empty"],
        "Capacity = 4, head = 0, size = 3. Logical order is A, B, C.",
      ),
      step(
        "Remove A and B",
        ["slot 0: empty", "slot 1: empty", "slot 2: C ← head", "slot 3: empty"],
        "After two dequeues, head = 2 and size = 1. The other items do not shift.",
      ),
      step(
        "Enqueue D",
        ["slot 0: empty", "slot 1: empty", "slot 2: C ← head", "slot 3: D"],
        "The insertion index is (2 + 1) mod 4 = 3. size becomes 2.",
      ),
      step(
        "Enqueue E with wraparound",
        ["slot 0: E", "slot 1: empty", "slot 2: C ← head", "slot 3: D"],
        "The insertion index is (2 + 2) mod 4 = 0. Physical order differs from logical order: dequeue still returns C, then D, then E.",
      ),
    ],
    "With head = 2 and size = 3, where does the next item go?",
    "It goes into slot (2 + 3) mod 4 = 1. The queue then has size 4 and is full; another enqueue must apply the documented full-buffer policy.",
  ),
  "hash-tables": guide(
    "Resolve collisions by comparing actual keys",
    "Hashing maps a large key space into a finite bucket array. Different keys can land in the same bucket, so a bucket index never proves key equality. With separate chaining, each bucket holds entries and lookup compares the requested key with entries in that chain. Updating an existing key changes its value rather than adding a second mapping.",
    "Use a hash map for frequency counts, lookup by ID, or remembering values seen earlier in a scan. It provides equality-based lookup rather than sorted range queries.",
    "With suitable hashing and controlled load factor, lookup is expected O(1). A long collision chain can make a lookup O(n). Resizing costs O(n) for that operation because entries must be redistributed to the new bucket array.",
    [
      step(
        "Choose a teaching hash",
        ["h(k) = k mod 5", "5 buckets: 0…4"],
        "This deliberately simple integer hash makes collisions visible. It is not a general-purpose hash for arbitrary keys.",
      ),
      step(
        "Insert key 12",
        ["bucket 2: (12, pear)"],
        "12 mod 5 = 2, so store its key and value in bucket 2.",
      ),
      step(
        "Insert key 7",
        ["bucket 2: (12, pear) → (7, plum)"],
        "7 mod 5 is also 2. Keep both entries; the shared bucket does not make their keys equal.",
      ),
      step(
        "Look up key 7",
        ["12 ≠ 7: continue", "7 = 7: return plum"],
        "Hash to bucket 2, then compare keys in the chain. Looking up absent key 17 scans the same chain and reports missing.",
      ),
    ],
    "What changes when inserting (12, peach) into this table?",
    "Find key 12 in bucket 2 and replace pear with peach. The table still contains two distinct keys. Appending another entry for 12 would violate ordinary map semantics.",
  ),
  trees: guide(
    "See why a search tree needs balance",
    "In a binary search tree with unique keys, every key in a node's left subtree is smaller and every key in its right subtree is larger. A comparison therefore discards an entire subtree. Operation cost depends on height, not merely the fact that each node has at most two children. Sorted insertion into an unbalanced tree can produce a chain.",
    "An ordered dictionary can support exact lookup, predecessor/successor, and sorted traversal. In-order traversal visits left subtree, node, then right subtree to produce increasing keys.",
    "Search costs O(h), where h is height: O(log n) for a balanced tree and O(n) for a chain. Balanced trees spend extra work maintaining shape. A hash table may be simpler when only exact equality lookup is required.",
    [
      step(
        "Start at the root",
        ["root: 8", "left: 3 (children 1, 6)", "right: 10"],
        "Search for 6. The BST rule applies to entire subtrees, not just immediate children.",
      ),
      step(
        "Compare 6 with 8",
        ["6 < 8", "follow left to 3", "discard subtree at 10"],
        "Any key in the right subtree is greater than 8, so it cannot be 6.",
      ),
      step(
        "Compare 6 with 3",
        ["6 > 3", "follow right to 6", "discard subtree at 1"],
        "The left subtree of 3 contains only smaller keys.",
      ),
      step(
        "Find the key",
        ["6 = 6", "three node comparisons"],
        "The search succeeds. If the chosen child had been null, the key would be absent. An in-order traversal of this tree is [1, 3, 6, 8, 10].",
      ),
    ],
    "What shape results from inserting 1, 2, 3, 4 into an ordinary empty BST?",
    "A rightward chain 1 → 2 → 3 → 4. Searching for 4 visits all four nodes. The BST ordering invariant holds, but balance does not follow from ordering alone.",
  ),
  "heaps-and-priority-queues": guide(
    "Extract the minimum and repair a heap",
    "A binary min-heap is a complete binary tree whose parent is no greater than either child. Store it in an array: children of index i are 2i + 1 and 2i + 2. The minimum is always at index zero, but siblings and distant nodes are not fully sorted. After removing the root, move the last value to the root and sift it down by swapping with the smaller child.",
    "A scheduler can select the next earliest deadline without sorting all pending jobs after every insertion. Add a sequence number if equal priorities must preserve arrival order.",
    "Peeking is O(1), insertion and extraction are O(log n), and bottom-up heap construction is O(n). Searching for an arbitrary value remains O(n) without an additional index.",
    [
      step(
        "A valid min-heap",
        ["1 (root)", "3", "2", "7", "5", "4"],
        "Array [1, 3, 2, 7, 5, 4] satisfies parent ≤ child. Notice that 3 appears before 2: a heap is not a sorted array.",
      ),
      step(
        "Remove the root",
        ["4 (root)", "3", "2", "7", "5"],
        "Return 1, then move the last value 4 into the vacant root. Only the path starting at the root needs repair.",
      ),
      step(
        "Choose the smaller child",
        ["4 > 2", "children: 3 and 2", "swap indices 0 and 2"],
        "Swapping with 3 would leave 2 below a larger root. Choose 2 to satisfy both child comparisons.",
      ),
      step(
        "Restored heap",
        ["2 (root)", "3", "4", "7", "5"],
        "The moved 4 is now at index 2 with no children. The next extraction will return 2.",
      ),
    ],
    "Does repeatedly removing the minimum produce sorted output?",
    "Yes. Each extraction returns the smallest remaining value. Extracting all n values takes O(n log n) time overall, even though one peek takes constant time.",
  ),
  graphs: guide(
    "Trace breadth-first search by distance layers",
    "BFS maintains a queue of discovered vertices. Mark a vertex as discovered when enqueuing it so that multiple incoming edges cannot queue it repeatedly. With equal edge costs, the first route that discovers a vertex uses the fewest edges. Store a predecessor at that moment to reconstruct an actual path, rather than only its distance.",
    "Model rooms and doors as an unweighted graph to find the route with the fewest doors. A graph can contain cycles, disconnected regions, or several routes to the same destination.",
    "BFS takes O(V + E) time with adjacency lists and O(V) extra state. Unequal travel times change the problem: the fewest edges may not give the smallest total weight. Dijkstra requires nonnegative weights.",
    [
      step(
        "Discover the source",
        ["edges: A—B, A—C, B—D, C—D", "queue: A", "distance[A] = 0"],
        "Use an undirected graph and visit B before C when scanning A's neighbors.",
      ),
      step(
        "Expand A",
        ["queue: B, C", "distance[B] = 1", "distance[C] = 1"],
        "Mark B and C when enqueuing them and set both predecessors to A.",
      ),
      step(
        "Expand B, then C",
        ["queue after B: C, D", "distance[D] = 2", "predecessor[D] = B"],
        "B discovers D. When C later sees D, it is already discovered, so do not enqueue D again.",
      ),
      step(
        "Reconstruct the route",
        ["D ← B ← A", "reverse → A → B → D", "2 edges"],
        "Follow predecessors from D to A, then reverse. A → C → D is also shortest; neighbor order determines which equal-length path is recorded.",
      ),
    ],
    "What distance should an unreachable vertex receive?",
    "Keep an explicit unvisited marker such as infinity or -1. Do not use zero, which already means the source's distance. BFS from one source does not reach disconnected components.",
  ),
  tries: guide(
    "Separate a complete word from a shared prefix",
    "A trie stores characters on paths from a root. Shared prefixes share nodes. Each node needs an end-of-word marker because reaching a path does not necessarily mean that path is a stored word. Prefix lookup follows a path; exact lookup additionally checks the terminal marker. These two operations answer different questions.",
    "An autocomplete index follows the typed prefix and then explores descendants. The number of suggestions and their total length affect the cost of enumeration.",
    "With constant-time child lookup, inserting or checking a word of length L costs O(L). Child arrays can use substantial memory for sparse alphabets; maps store only present branches. Define character normalization and case sensitivity before building the index.",
    [
      step(
        "Insert car",
        ["root → c → a → r*"],
        "The star marks a complete word at r. Nodes c and a are only prefixes.",
      ),
      step(
        "Insert cat",
        ["root → c → a", "a → r*", "a → t*"],
        "Reuse c and a; create only the t branch. Both terminal markers must remain.",
      ),
      step(
        "Query ca",
        ["prefix exists: yes", "complete word: no"],
        "The path exists but the a node has no terminal marker. An exact-word query returns false.",
      ),
      step(
        "Insert ca",
        ["root → c → a*", "a → r*", "a → t*"],
        "Set a's terminal marker. No new character nodes are required, and car and cat remain stored.",
      ),
    ],
    "If car is deleted, can the shared c and a nodes be deleted too?",
    "No. Clear r's terminal marker and prune only nodes with no children and no terminal marker. The paths for ca and cat must remain reachable.",
  ),
  "disjoint-sets": guide(
    "Merge components without storing every path",
    "Disjoint-set union represents a partition: each element belongs to exactly one component. find follows parent links to a representative root. union first finds both roots and then joins the roots, typically by size or rank. Path compression shortens future find operations by linking visited nodes closer to their root.",
    "Process newly added undirected edges and detect whether their endpoints are already connected. Kruskal's minimum-spanning-tree algorithm uses this check to skip edges that would form a cycle.",
    "Union by size/rank plus path compression gives amortized O(α(n)) operations over a sequence, where α grows very slowly. DSU does not return graph paths and ordinary DSU does not handle arbitrary edge deletions.",
    [
      step(
        "Every element starts alone",
        ["{A}", "{B}", "{C}", "{D}"],
        "There are four components, each with itself as its representative.",
      ),
      step(
        "Union A and B",
        ["{A, B}", "{C}", "{D}"],
        "Find the roots and attach one to the other. The component count decreases to three.",
      ),
      step(
        "Union C and D, then B and C",
        ["{A, B, C, D}"],
        "Two more successful root merges leave one component. B and C need not themselves be roots.",
      ),
      step(
        "Test edge A—D",
        ["find(A) = find(D)", "same component → cycle"],
        "The existing edges already connect A to D. Adding A—D creates a cycle in this undirected graph and does not change the component count.",
      ),
    ],
    "Should union on two already-connected vertices decrement the component count?",
    "No. Decrement only when two distinct roots are merged. Repeated edges and self-loops do not reduce the number of components.",
  ),
  "advanced-data-structures": guide(
    "Decompose a range with a segment tree",
    "A segment tree stores aggregates for nested intervals. Each parent combines its two children with an associative operation such as sum, minimum, or maximum. A query uses fully covered nodes directly, skips disjoint nodes, and descends only through partial overlaps. Half-open intervals make splitting at a midpoint unambiguous.",
    "Maintain live totals when individual measurements change and many range queries arrive between updates. For minimum queries use an identity of positive infinity; for sums use zero.",
    "A segment tree uses O(n) storage and build time, with O(log n) point updates and range queries. Prefix sums are simpler for static sums; a Fenwick tree is compact for point additions and prefix sums. Lazy range updates require a compatible update/combine contract.",
    [
      step(
        "Build leaf intervals",
        ["[0,1): 2", "[1,2): 4", "[2,3): 1", "[3,4): 3"],
        "The leaves hold [2, 4, 1, 3]. Each interval contains exactly one original value.",
      ),
      step(
        "Combine upward",
        ["[0,2): 6", "[2,4): 4", "[0,4): 10"],
        "Each parent stores the sum of its two disjoint child intervals.",
      ),
      step(
        "Query [1,4)",
        ["take [1,2): 4", "take [2,4): 4", "answer: 8"],
        "The left half is only partly covered, so descend. The right half is fully covered, so reuse its sum without visiting both leaves.",
      ),
      step(
        "Update index 2 to 5",
        ["[2,3): 5", "[2,4): 8", "[0,4): 14"],
        "Only the leaf and its ancestors change. The same [1,4) query now returns 4 + 8 = 12.",
      ),
    ],
    "Why can a tree of sums not answer range medians by simply combining two stored medians?",
    "Two medians do not retain the distribution or element counts needed to determine the combined median. The stored summary must support a correct associative combine operation; a single median does not.",
  ),
  "binary-search": guide(
    "Find the first valid position, including duplicates",
    "Lower bound returns the first index whose value is at least a target, or n if none exists. Maintain a half-open candidate interval [low, high), starting at [0, n). If values[mid] is too small, exclude mid and all earlier positions. Otherwise keep mid as a possible answer by moving high to mid. Each step reduces the interval until its two endpoints meet.",
    "Use lower bound to locate an insertion position or the first record at or after a timestamp in a sorted index. The same idea applies to a monotone false-then-true feasibility predicate.",
    "The search takes O(log n) time with constant-time indexed access and O(1) auxiliary space. Preparing sorted data costs extra. Lower bound is a position query: verify equality separately when asking whether the target actually exists.",
    [
      step(
        "Search for target 4",
        ["1", "4", "4", "4", "9"],
        "low = 0, high = 5. We want the first 4, not any matching occurrence.",
      ),
      step(
        "Keep the midpoint",
        ["low = 0", "mid = 2 → 4", "high = 2"],
        "values[2] ≥ 4, so index 2 could be the answer. Set high = 2, without returning immediately.",
      ),
      step(
        "Move further left",
        ["low = 0", "mid = 1 → 4", "high = 1"],
        "values[1] also qualifies. Keep searching for an earlier qualifying index.",
      ),
      step(
        "Exclude a too-small value",
        ["mid = 0 → 1", "low = 1 = high", "answer: index 1"],
        "1 < 4, so set low = mid + 1. The interval is empty and index 1 is the first qualifying position.",
      ),
    ],
    "For this same array, what are the lower bounds of 5 and 10?",
    "For 5, return 4 because values[4] = 9 is the first value ≥ 5. For 10, return 5, the array length. Neither result means the target is present.",
  ),
  "sorting-algorithms": guide(
    "Make stability visible with tagged records",
    "A stable sort preserves the original relative order of records with equal sort keys. Tag equal-valued records to see this property; bare numbers conceal it. During merge sort, choose the left record first on equal keys to preserve earlier input order across the two sorted halves.",
    "Stability matters when sorting transactions by date after they already have a meaningful order within a date. Alternatively, use an explicit composite comparator to specify all tie-breaking rules.",
    "Array merge sort takes O(n log n) time and normally O(n) auxiliary storage. Insertion sort is stable when it shifts only strictly larger keys and can work well on small or nearly sorted inputs. Sorting correctness, stability, and memory use are separate properties.",
    [
      step(
        "Keep identity tags",
        ["3a", "1x", "3b", "2y"],
        "Sort by number only. The letters identify distinct records; a must stay before b if the sort is stable.",
      ),
      step(
        "Sort each half",
        ["left: 1x, 3a", "right: 2y, 3b"],
        "Recursive sorting produces two sorted runs. Now merge their front elements.",
      ),
      step(
        "Take smaller fronts",
        ["output: 1x, 2y", "left front: 3a", "right front: 3b"],
        "Choose 1x before 2y, then compare the two equal keys 3.",
      ),
      step(
        "Resolve ties from the left",
        ["1x", "2y", "3a", "3b"],
        "Taking 3a first preserves the input order of equal keys. Choosing 3b would still sort numerically but would break stability.",
      ),
    ],
    "Is [1x, 2y, 3b, 3a] sorted, stable, both, or neither?",
    "It is sorted by numeric key but is not stable relative to the original input, because 3b moved before 3a. Check both properties independently.",
  ),
  recursion: guide(
    "Track work on the call stack",
    "Every recursive call needs a base case and a measure that moves toward it. The call stack stores each unfinished invocation, including local state and where execution should resume. Returning from a child does not restart its parent; it supplies the value needed to finish the parent's pending expression.",
    "Recursive functions naturally follow trees and nested data. For deeply nested or user-controlled structures, an explicit stack can avoid relying on a limited runtime call stack.",
    "The factorial example performs O(n) calls and uses O(n) stack space. Recursion is not automatically exponential: branching and repeated subproblems determine total work. Numeric overflow can occur long before recursion depth becomes the main issue.",
    [
      step(
        "Call factorial(4)",
        ["4 × factorial(3)"],
        "For nonnegative integers, define factorial(0) = 1 and factorial(n) = n × factorial(n − 1). The argument decreases each time.",
      ),
      step(
        "Reach the base case",
        ["4 × (3 × (2 × (1 × factorial(0))))", "factorial(0) = 1"],
        "Four multiplications are pending. The base case returns a concrete value without making another call.",
      ),
      step(
        "Unwind inner calls",
        ["factorial(1) = 1", "factorial(2) = 2", "factorial(3) = 6"],
        "Each parent multiplies its own saved n by the returned child result.",
      ),
      step(
        "Finish the original call",
        ["factorial(4) = 4 × 6 = 24"],
        "The last return completes the original invocation. The stack grows during descent and shrinks during returns.",
      ),
    ],
    "Why must this contract reject negative inputs?",
    "Subtracting one from a negative integer moves away from zero, so the given recursion never reaches its base case. Validate n ≥ 0, or define a different mathematical problem and algorithm.",
  ),
  "divide-and-conquer": guide(
    "Account for splitting and combining separately",
    "Divide-and-conquer solves smaller pieces and combines their results. For merge sort, splitting creates two roughly equal subarrays and merging costs linear time in their combined length. The recurrence T(n) = 2T(n/2) + O(n) separates recursive work from local work. There are about log₂ n levels and O(n) merging work across each level.",
    "Use merge sort when predictable comparison cost and stable ordering matter. Independent subproblems can sometimes run concurrently, but data copying and task overhead must be considered.",
    "The resulting time is O(n log n), not O(log n): reducing depth does not eliminate work across each level. Standard array merging uses O(n) auxiliary storage, with O(log n) recursive depth.",
    [
      step(
        "Divide the problem",
        ["[8, 3, 5, 1]", "→ [8, 3] and [5, 1]"],
        "The split only partitions work. Neither half is sorted yet.",
      ),
      step(
        "Reach single elements",
        ["[8]", "[3]", "[5]", "[1]"],
        "A single-element sequence is already sorted and provides the base case.",
      ),
      step(
        "Combine small solutions",
        ["[3, 8]", "[1, 5]"],
        "Merge each pair by repeatedly taking the smaller available front value.",
      ),
      step(
        "Combine the final solution",
        ["1", "3", "5", "8"],
        "Merge [3, 8] with [1, 5]. Each element enters the output once in this merge, so the combine step is linear.",
      ),
    ],
    "Why is binary search O(log n) while merge sort is O(n log n)?",
    "Binary search follows just one half and does constant work per step. Merge sort solves both halves and performs a linear merge at each level. Similar recursion depth does not imply similar total work.",
  ),
  "dynamic-programming": guide(
    "Define the state before writing the recurrence",
    "For minimum coin count with unlimited positive coin denominations, define dp[a] as the fewest coins needed to make exactly amount a. Set dp[0] = 0 and other entries to infinity. For each permitted coin c ≤ a, consider dp[a − c] + 1. Every optimal solution ends with some coin; removing that coin leaves a smaller subproblem of the same kind.",
    "This pattern models exact resource composition. The state must encode every choice that changes future options; bounded coin supplies require a different state or update strategy.",
    "For amount A and k denominations, tabulation costs O(Ak) time and O(A) space. This depends on the numeric amount, not just its digit count. To reconstruct coins, also store which choice improved each reachable state.",
    [
      step(
        "Initialize amount zero",
        ["coins: 1, 3, 4", "dp[0] = 0"],
        "We need amount 6. Zero coins make amount zero; it is the base case for all later transitions.",
      ),
      step(
        "Solve small amounts",
        ["dp[1] = 1", "dp[2] = 2", "dp[3] = 1"],
        "For amount 3, choosing coin 3 gives dp[0] + 1 = 1, better than three 1-coins.",
      ),
      step(
        "Reuse stored results",
        ["dp[4] = 1", "dp[5] = 2"],
        "Amount 4 uses coin 4. Amount 5 uses 4 + 1. Each candidate reads an already solved smaller amount.",
      ),
      step(
        "Compare final choices",
        ["coin 1: dp[5]+1 = 3", "coin 3: dp[3]+1 = 2", "coin 4: dp[2]+1 = 3"],
        "Choose the minimum, 2, corresponding to 3 + 3. Largest-coin-first would choose 4 + 1 + 1 and use three coins.",
      ),
    ],
    "With denominations [4, 6], what is the result for amount 5?",
    "Unreachable. Its candidate predecessor states never lead to a finite count. Keep infinity internally and translate it to an explicit no-solution result such as -1 at the API boundary.",
  ),
  greedy: guide(
    "Justify the earliest-finish scheduling rule",
    "To maximize the number of non-overlapping, unweighted intervals on one resource, sort by finish time and repeatedly select the next compatible interval. An exchange argument explains why this works: replacing an optimal schedule's first interval with the earliest-finishing interval cannot reduce the space left for later selections.",
    "Schedule the greatest number of equal-value appointments in a single room. Use half-open intervals [start, finish), so one meeting can begin exactly when another ends.",
    "Sorting costs O(n log n), followed by an O(n) scan. The proof depends on maximizing count with equal value. If meetings have different rewards, the same rule can fail and weighted interval scheduling needs a different method, commonly DP.",
    [
      step(
        "Sort by finish time",
        ["A: [1,3)", "B: [2,5)", "C: [3,4)", "D: [4,6)"],
        "The finish-time order is A, C, B, D. Input order does not determine selection order.",
      ),
      step(
        "Choose A, then C",
        ["A: 1 → 3", "C: 3 → 4"],
        "A finishes first. C starts at A's finish, so it is compatible under the half-open convention.",
      ),
      step(
        "Skip B",
        ["B starts at 2", "current finish = 4", "2 < 4 → conflict"],
        "B overlaps selected time. Skipping it preserves the schedule already built.",
      ),
      step(
        "Choose D",
        ["A → C → D", "3 appointments"],
        "D begins at 4, so it is compatible. The algorithm selects three non-overlapping appointments.",
      ),
    ],
    "Suppose B has reward 100 while A, C, and D each have reward 1. Does the chosen schedule maximize reward?",
    "No. A + C + D yields reward 3, while B alone yields 100. The greedy rule solves maximum count, not arbitrary maximum reward; changing the objective invalidates its proof.",
  ),
  backtracking: guide(
    "Choose, explore, and undo a decision",
    "Backtracking builds partial candidates and explores a decision tree. Choose an option, recurse, and restore the previous state before trying its sibling. Pruning discards a branch only when no completion can satisfy the contract. For subset sum with nonnegative values, exceeding the target is such a condition; with negative values, that pruning rule is invalid.",
    "Use backtracking for constraint puzzles, combinations, and searching small decision spaces. When recording a solution from a mutable path, save a copy so later undo operations cannot change earlier answers.",
    "Include/exclude enumeration has O(2ⁿ) decision-tree nodes in the worst case and O(n) recursion depth, excluding stored results. Copying all output subsets can add an O(n) factor. Pruning improves some inputs but does not generally remove exponential worst-case growth.",
    [
      step(
        "Find subsets summing to 5",
        ["values: 2, 3, 4", "path: []", "sum: 0"],
        "At each index, branch on including or excluding that value. Each position can be used at most once.",
      ),
      step(
        "Include 2, then 3",
        ["path: [2, 3]", "sum: 5 → save a copy"],
        "This path reaches the target. With these strictly positive remaining values, adding more cannot produce another completion of this path.",
      ),
      step(
        "Undo and try the sibling",
        ["remove 3 → [2]", "include 4 → [2, 4]", "sum: 6 → prune"],
        "Restore the parent state before exploring the alternate decision. Since all values are positive, a sum of 6 cannot return to 5.",
      ),
      step(
        "Explore branches without 2",
        ["[3, 4] → 7", "[3] → 3", "[4] → 4", "[] → 0"],
        "None reaches 5. The only solution for this input is [2, 3]. Decisions by index ensure each subset is considered once.",
      ),
    ],
    "Why would pruning a partial sum of 6 be unsafe if a remaining value were -1?",
    "Adding -1 could bring the total back to 5. A pruning rule is part of the correctness proof and must be justified by the input contract, not merely by examples where it worked.",
  ),
};

export function getDsaDeepDive(courseSlug, lessonSlug) {
  const topic =
    courseSlug === "dsa-foundations"
      ? Object.keys(dsaDeepDives).find(
          (key) => key !== "dsa-foundations" && lessonSlug.startsWith(`${key}-`),
        ) || courseSlug
      : courseSlug;
  return dsaDeepDives[topic];
}
