const wrap = (method, main) =>
  `import java.util.*;\n\npublic class Main {\n${method}\n\n  public static void main(String[] args) {\n    Scanner in = new Scanner(System.in);\n${main}\n  }\n}\n`;
const exercise = (id, title, prompt, signature, body, main, tests) => ({
  id,
  title,
  prompt,
  starter: wrap(
    `  ${signature} {\n    throw new UnsupportedOperationException("Implement this method");\n  }`,
    main,
  ),
  solution: wrap(`  ${signature} {\n${body}\n  }`, main),
  tests: tests.map(([label, input, expected]) => ({ label, input, expected })),
});
export const dsaJavaPractice = [
  exercise(
    "java-min",
    "Minimum array value",
    "Read n followed by n integers. Print the minimum, or EMPTY for n = 0. Use a single O(n) scan.",
    "static String solve(int[] values)",
    '    if (values.length == 0) return "EMPTY";\n    int best = values[0];\n    for (int value : values) best = Math.min(best, value);\n    return Integer.toString(best);',
    "    int n = in.nextInt();\n    int[] values = new int[n];\n    for (int i = 0; i < n; i++) values[i] = in.nextInt();\n    System.out.println(solve(values));",
    [
      ["Ordinary", "4\n8 3 6 2\n", "2"],
      ["Negative", "3\n-4 -9 -2\n", "-9"],
      ["Empty", "0\n", "EMPTY"],
    ],
  ),
  exercise(
    "java-lower",
    "First qualifying index",
    "Read n, n sorted integers, then target. Return the first index with value ≥ target or n if none. Use O(log n) binary search.",
    "static int solve(int[] values, int target)",
    "    int low = 0, high = values.length;\n    while (low < high) {\n      int mid = low + (high - low) / 2;\n      if (values[mid] < target) low = mid + 1; else high = mid;\n    }\n    return low;",
    "    int n = in.nextInt();\n    int[] values = new int[n];\n    for (int i = 0; i < n; i++) values[i] = in.nextInt();\n    System.out.println(solve(values, in.nextInt()));",
    [
      ["Duplicates", "5\n1 4 4 4 9\n4\n", "1"],
      ["Beyond end", "2\n1 4\n10\n", "2"],
      ["Empty", "0\n3\n", "0"],
    ],
  ),
  exercise(
    "java-sort",
    "Insertion sort",
    "Read n followed by n integers. Return a sorted copy with insertion sort; main prints Java array notation. Target O(n²) worst-case time.",
    "static int[] solve(int[] values)",
    "    int[] a = values.clone();\n    for (int i = 1; i < a.length; i++) {\n      int value = a[i], j = i - 1;\n      while (j >= 0 && a[j] > value) { a[j + 1] = a[j]; j--; }\n      a[j + 1] = value;\n    }\n    return a;",
    "    int n = in.nextInt();\n    int[] values = new int[n];\n    for (int i = 0; i < n; i++) values[i] = in.nextInt();\n    System.out.println(Arrays.toString(solve(values)));",
    [
      ["Mixed", "4\n4 1 3 2\n", "[1, 2, 3, 4]"],
      ["Duplicates", "3\n2 1 2\n", "[1, 2, 2]"],
      ["Empty", "0\n", "[]"],
    ],
  ),
  exercise(
    "java-coins",
    "Minimum coin change",
    "Read coin count, the positive denominations, then a nonnegative amount (at most 10000). Print the minimum coin count or -1 if impossible. Each denomination can be reused.",
    "static int solve(int[] coins, int amount)",
    "    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1); dp[0] = 0;\n    for (int a = 1; a <= amount; a++)\n      for (int c : coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a-c] + 1);\n    return dp[amount] > amount ? -1 : dp[amount];",
    "    int n = in.nextInt();\n    int[] coins = new int[n];\n    for (int i = 0; i < n; i++) coins[i] = in.nextInt();\n    System.out.println(solve(coins, in.nextInt()));",
    [
      ["Greedy counterexample", "3\n1 3 4\n6\n", "2"],
      ["Impossible", "2\n4 6\n5\n", "-1"],
      ["Zero", "0\n0\n", "0"],
    ],
  ),
];
