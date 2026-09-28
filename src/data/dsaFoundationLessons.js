import { course as C, lesson as L } from "./dsaLessonSchema.js";

const opening = C(
  "DSA Foundations",
  "Start here",
  "Variables, loops, and functions in JavaScript.",
  [
    [
      "Getting started",
      [
        L(
          "Course roadmap, environment setup, and your first trace",
          "This course progresses from contracts and complexity through linear structures, trees, graphs, searching, sorting, and algorithm design. Finish with advanced structures and a route-planning project. You only need variables, loops, and functions; each lesson supplies a complete JavaScript implementation and an input you can change locally.",
          "Create a file named search.mjs, copy the implementation and sample invocation from this page, and run node search.mjs in a terminal with Node.js installed. A browser developer console also runs this example. Predict the output before running it, then compare the visual steps with the loop. Work through lessons in order, and revisit an earlier invariant whenever a later technique depends on it.",
          "Before each comparison, every earlier position has already been ruled out.",
          "linearSearch",
          { values: [14, 6, 21, 9], target: 21 },
          "O(n) worst-case comparisons; a match at the first position takes O(1).",
          "O(1) auxiliary space when trace recording is disabled.",
          "Copying only the function without invoking it produces no output. Array positions start at zero, so the third item has index 2.",
          "Run the example, then try target 99 and an empty values array. Explain each result without running it again.",
          "The original input returns 2. Both target 99 and searching an empty array return -1. Use the same predict, trace, explain, and test routine throughout the course.",
        ),
      ],
    ],
  ],
);

const extensions = C(
  "DSA Foundations",
  "Start here",
  "Complete the preceding searching, sorting, graph, and dynamic-programming lessons.",
  [
    [
      "Further searching and sorting",
      [
        L(
          "Jump search and choosing a search strategy",
          "Sorted data supports several ways to reduce a search interval. Jump search probes the end of fixed-size blocks, then scans the first block that could contain the target. It demonstrates a useful trade-off between coarse navigation and local work, even though binary search uses fewer comparisons on random-access arrays.",
          "With block size b, there are at most about n/b block probes and b local comparisons. Balancing these terms gives b near the square root of n. Exponential search instead doubles a bound before binary searching it; interpolation search estimates a position from key values and needs distribution assumptions. Choose based on access costs and guarantees, not only an appealing average bound.",
          "Every skipped block ends below the target; the first possible match must occur later.",
          "jumpSearch",
          { values: [1, 3, 6, 9, 12, 15, 18, 21, 24], target: 15 },
          "O(sqrt(n)) worst-case comparisons using blocks of size floor(sqrt(n)).",
          "O(1) auxiliary storage.",
          "Applying jump search to unsorted data can skip the answer. A short final block must stop at the actual array length.",
          "For the input shown, which block contains 15? What changes if the target is 16?",
          "The first block [0,3) ends at 6 and is skipped; the second [3,6) ends at 15 and yields index 5. For 16, scan [6,9) after skipping the first two blocks and return -1.",
        ),
        L(
          "Shell sort and gap-based insertion",
          "Shell sort improves element movement by allowing long-distance shifts before a final insertion-sort pass. For a gap g, positions with the same remainder modulo g form a subsequence. Sorting each subsequence can move a small value toward the front much earlier than adjacent-only insertion would.",
          "The implementation starts with half the array length and repeatedly halves the gap until it reaches one. Each pass uses insertion sort within a gapped subsequence. The final gap-one pass establishes full ordering. Performance depends strongly on the chosen gaps: bounds for a different sequence cannot be attached to this implementation.",
          "After a gap pass, each subsequence separated by that gap is sorted.",
          "shellSort",
          { values: [29, 10, 14, 37, 13, 2, 8] },
          "O(n²) worst case for this halving-gap sequence.",
          "O(n) for the returned copy; O(1) working storage if the input is mutated.",
          "Shell sort is generally unstable: long jumps can reorder equal-key records. It is not guaranteed O(n log n) merely because there are logarithmically many gap passes.",
          "Why is a final gap of one necessary? Compare the result against numeric Array.sort on a copy.",
          "Sorted gapped subsequences do not imply global order. Gap one joins all positions into a single sorted subsequence. The final output is [2,8,10,13,14,29,37].",
        ),
      ],
    ],
    [
      "Graph connectivity and network flow",
      [
        L(
          "Strongly connected components and condensation graphs",
          "A strongly connected component of a directed graph is a maximal group in which every vertex can reach every other. Ordinary undirected connectivity is not enough: a one-way dependency may permit entry without return. Collapsing each strongly connected component produces a directed acyclic condensation graph.",
          "Kosaraju's algorithm first records DFS finishing order, then reverses all edges and processes vertices in decreasing finishing order. Each new reverse traversal identifies one component. The finishing order prevents that traversal from spilling into an unprocessed neighboring component. Recursive DFS keeps the implementation small, but explicit stacks are preferable for very deep graphs.",
          "Each reverse traversal collects exactly one previously unassigned strongly connected component.",
          "stronglyConnected",
          { adjacency: [[1], [2], [0, 3], [4], [3]] },
          "O(V + E): two traversals and one edge reversal.",
          "O(V + E) for the reverse adjacency lists, visitation state, and recursion stack.",
          "Using discovery order instead of finishing order breaks the argument. Strong connectivity applies to directed reachability; a bridge or articulation point is a different concept.",
          "Identify the components and the direction of the edge between them in the condensation graph.",
          "The components are {0,1,2} and {3,4}. The edge 2→3 becomes a one-way edge from the first component to the second. There is no return path, so they cannot be merged.",
        ),
        L(
          "Residual networks, augmenting paths, and max-flow min-cut",
          "A flow network assigns a nonnegative capacity to each directed edge and selects a source and sink. Intermediate vertices conserve flow, while each edge respects capacity. Maximum flow asks how much can reach the sink. A residual network records both unused forward capacity and the ability to undo an earlier decision through reverse edges.",
          "Edmonds-Karp repeatedly uses BFS to find a shortest augmenting path in the residual network. Send the smallest residual capacity on the path, decrease forward capacity, and increase reverse capacity. Once no path remains, source-reachable residual vertices define a cut whose capacity equals the flow. This implementation scans a capacity matrix rather than adjacency lists, so its traversal cost includes absent edges.",
          "Augmentation preserves conservation and nonnegative residual capacity; reverse edges allow earlier flow to be rerouted.",
          "maxFlow",
          {
            capacity: [
              [0, 3, 2, 0],
              [0, 0, 1, 2],
              [0, 0, 0, 3],
              [0, 0, 0, 0],
            ],
            source: 0,
            sink: 3,
          },
          "O(V³E) upper bound with matrix-scanning BFS and O(VE) augmentations; adjacency-list Edmonds-Karp achieves O(VE²).",
          "O(V²) for the residual matrix, plus O(V) BFS state.",
          "Omitting reverse residual edges can trap flow in a poor early path. Source and sink must differ, and capacities must be finite and nonnegative.",
          "Find the maximum flow and a cut with equal capacity. How would you model bipartite matching as flow?",
          "The maximum flow is 5, equal to the capacity of edges leaving source 0. For bipartite matching, connect the source to left vertices, allowed left-right pairs, and right vertices to the sink, all with capacity one. Integral flow selects pairs without reusing endpoints.",
        ),
      ],
    ],
    [
      "Optimization, approximation, and randomization",
      [
        L(
          "Matrix-chain multiplication and interval dynamic programming",
          "Matrix multiplication is associative, but the number of scalar multiplications depends on parenthesization. An a×b matrix times a b×c matrix costs abc scalar multiplications in the classical method. Matrix-chain optimization finds the cheapest grouping without changing the matrix order or performing the multiplications themselves.",
          "Let dp[i][j] be the smallest cost of multiplying matrices i through j. Try every split k between them, combine the optimal left and right costs, then add dimensions[i] × dimensions[k+1] × dimensions[j+1]. Fill intervals from short to long so every dependency already exists. A single matrix costs zero because no multiplication is needed.",
          "Before processing an interval length, every shorter interval already contains its optimal cost.",
          "matrixChain",
          { dimensions: [10, 30, 5, 60] },
          "O(n³) for n matrices: O(n²) intervals and O(n) splits per interval.",
          "O(n²) for the cost table.",
          "There are n+1 dimensions for n matrices. Sorting matrices by size is invalid because matrix multiplication is not commutative.",
          "Compare (AB)C with A(BC) for matrices 10×30, 30×5, and 5×60.",
          "(AB)C costs 10×30×5 + 10×5×60 = 4500. A(BC) costs 30×5×60 + 10×30×60 = 27000. The dynamic program returns 4500; a separate split table could reconstruct the parentheses.",
        ),
        L(
          "Approximation algorithms and a guaranteed vertex cover",
          "When exact optimization is too expensive, an approximation algorithm returns a feasible solution with a provable bound relative to the optimum. In an undirected unweighted graph, a vertex cover touches every edge. Selecting both endpoints of an uncovered edge repeatedly gives a simple two-approximation.",
          "Selected edges are disjoint because any edge sharing an already selected endpoint is skipped. They therefore form a matching. Every valid cover must select at least one endpoint of each of those disjoint edges, whereas our algorithm selects two. This proves the factor-two bound without knowing the optimal solution. A good-looking heuristic without such a proof is not a guaranteed approximation.",
          "Every processed edge has a selected endpoint, and the edges that trigger selections form a matching.",
          "vertexCover",
          {
            edges: [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 0],
              [0, 2],
            ],
          },
          "O(E) expected time with constant-time set membership.",
          "O(V) for selected vertices.",
          "The proof is for unweighted vertex cover. Picking the highest-degree vertex is a different algorithm and does not inherit this proof.",
          "What cover is returned here? Exhibit an optimal cover and compare their sizes.",
          "Edges (0,1) and (2,3) select all four vertices. {0,2} covers every edge with two vertices, so this example attains the factor-two bound. A nonempty matching lower-bounds the optimum but need not itself cover all edges.",
        ),
        L(
          "Fisher-Yates shuffle and reasoning about randomness",
          "Randomized algorithms use random choices to influence their execution. Fisher-Yates shuffles a sequence by choosing uniformly from the remaining prefix and fixing one final position at a time. Under independent uniform choices, every permutation has equal probability. A seeded generator is useful for repeatable demonstrations and debugging.",
          "At position i, choose j from zero through i, swap those positions, and never touch position i again. A particular permutation receives probability 1/n × 1/(n−1) × … × 1/2 = 1/n!. The sample uses a small deterministic pseudorandom generator to make traces reproducible; its finite state and scaling do not provide ideal independent uniform choices or cryptographic security.",
          "The suffix beyond i is fixed, and the prefix contains exactly the elements still available for placement.",
          "fisherYates",
          { values: [1, 2, 3, 4, 5], seed: 42 },
          "O(n), assuming constant-time random-number generation.",
          "O(n) for a copied array; O(1) working state for in-place shuffling.",
          "Swapping each element with a random index from the whole array is biased. Sorting with a random comparator is also invalid and does not implement a uniform shuffle.",
          "Why must j be allowed to equal i? Which properties should a shuffle test assert?",
          "An element must have a chance to stay in place; excluding i rules out valid permutations. Assert equal length and the same multiset, plus reproducibility for the same seed. Frequency checks can expose bias but do not prove uniformity.",
        ),
      ],
    ],
    [
      "Capstone and course assessment",
      [
        L(
          "Build and review a route-planning service",
          "Combine the course into a small route planner for a delivery network. Represent locations as vertices and travel times as nonnegative edge weights. Begin with a query from one source, then add name lookup, reachability checks, and repeated-query support. Treat data structures as decisions justified by workload and correctness contracts.",
          "Use a hash map for location names and an adjacency representation for routes. BFS answers minimum-hop questions; Dijkstra answers minimum-total-time questions when weights are nonnegative. Cache only with a policy for graph changes. Compare a small result against manual paths, then test isolated vertices, zero-weight edges, equal-cost routes, and invalid negative weights. Explain memory and update costs alongside query time.",
          "When Dijkstra settles a vertex under nonnegative weights, its recorded distance is the minimum possible distance from the source.",
          "dijkstra",
          {
            weights: [
              [null, 4, 1, null],
              [null, null, null, 1],
              [null, 2, null, 5],
              [null, null, null, null],
            ],
            start: 0,
          },
          "O(V²) for this matrix-based implementation; adjacency lists with a binary heap can achieve O((V+E) log V).",
          "O(V²) input matrix and O(V) algorithm state, excluding traces.",
          "Fewest edges does not mean shortest travel time. A changed edge can invalidate cached results, and negative weights invalidate Dijkstra's settling proof.",
          "Deliver a graph representation, a distance query, tests, and a short design review. What are the distances from vertex 0? How would you reconstruct a route and support negative edges?",
          "Distances are [0,3,1,4], with the last route 0→2→1→3. Store a predecessor whenever relaxing a distance to reconstruct paths. Use Bellman-Ford if negative edges are permitted and report reachable negative cycles. A complete review states contracts, proves the settling invariant, compares BFS and Dijkstra, accounts for storage, and documents boundary tests.",
        ),
      ],
    ],
  ],
);

// Reuse authored teaching material while giving every section a stable course-local
// identity. The four original foundation lesson URLs remain unchanged.
export function buildDsaFoundationCourse(courses) {
  const base = courses["dsa-foundations"];
  const order = [
    "arrays",
    "linked-lists",
    "stacks",
    "queues-and-deques",
    "hash-tables",
    "binary-search",
    "sorting-algorithms",
    "recursion",
    "trees",
    "heaps-and-priority-queues",
    "graphs",
    "disjoint-sets",
    "divide-and-conquer",
    "greedy",
    "dynamic-programming",
    "backtracking",
    "tries",
    "advanced-data-structures",
  ];
  return {
    ...base,
    sections: [
      ...opening.sections,
      ...base.sections,
      ...order.flatMap((key) =>
        courses[key].sections.map((section) => {
          const slug = `${key}-${section.slug}`;
          return {
            ...section,
            slug,
            title: `${courses[key].name}: ${section.title}`,
            lessons: section.lessons.map((item) => ({
              ...item,
              sectionSlug: slug,
              slug: `${key}-${item.slug}`,
            })),
          };
        }),
      ),
      ...extensions.sections,
    ],
  };
}
