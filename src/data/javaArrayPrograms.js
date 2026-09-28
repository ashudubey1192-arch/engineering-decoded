// Each program supplies its own methods and test invocations; no hidden Java dependencies.
export const javaArrayPrograms = {
  lowerBound: {
    method: `  static int solve(int[] a, int target) {
    int low = 0, high = a.length;
    while (low < high) {
      int mid = low + (high - low) / 2;
      emit("Compare midpoint " + mid + "; candidate boundary is in [" + low + "," + high + "].", a, mid);
      if (a[mid] < target) low = mid + 1; else high = mid;
    }
    return low;
  }`,
    cases: [
      ["solve(new int[] {1, 2, 2, 2, 5}, 2)", 1],
      ["solve(new int[] {}, 2)", 0],
      ["solve(new int[] {1, 3}, 4)", 2],
    ],
  },
  merge: {
    method: `  static int[] solve(int[] a, int m, int[] b) {
    if (m < 0 || m > a.length || a.length - m != b.length) throw new IllegalArgumentException("Invalid capacity");
    int i = m - 1, j = b.length - 1, write = a.length - 1;
    while (j >= 0) {
      if (i >= 0 && a[i] > b[j]) a[write] = a[i--]; else a[write] = b[j--];
      emit("Place the largest remaining value at the back.", a, write--);
    }
    return a;
  }`,
    cases: [
      ["solve(new int[] {1, 3, 5, 0, 0, 0}, 3, new int[] {2, 4, 6})", [1, 2, 3, 4, 5, 6]],
      ["solve(new int[] {0}, 0, new int[] {7})", [7]],
      ["solve(new int[] {1}, 1, new int[] {})", [1]],
    ],
  },
  threeSum: {
    method: `  static List<List<Integer>> solve(int[] input) {
    int[] a = input.clone();
    Arrays.sort(a);
    List<List<Integer>> result = new ArrayList<>();
    for (int i = 0; i < a.length - 2; i++) {
      if (i > 0 && a[i] == a[i - 1]) continue;
      int left = i + 1, right = a.length - 1;
      while (left < right) {
        long sum = (long) a[i] + a[left] + a[right];
        emit("Fix index " + i + "; three-value sum is " + sum + ".", a, i, left, right);
        if (sum < 0) left++;
        else if (sum > 0) right--;
        else {
          result.add(List.of(a[i], a[left], a[right]));
          int l = a[left], r = a[right];
          while (left < right && a[left] == l) left++;
          while (left < right && a[right] == r) right--;
        }
      }
    }
    return result;
  }`,
    cases: [
      [
        "solve(new int[] {-1, 0, 1, 2, -1, -4})",
        [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
      ],
      ["solve(new int[] {0, 0, 0, 0})", [[0, 0, 0]]],
      ["solve(new int[] {})", []],
    ],
  },
  stock: {
    method: `  static long solve(int[] prices) {
    if (prices.length == 0) return 0;
    int minimum = prices[0];
    long best = 0;
    for (int i = 1; i < prices.length; i++) {
      best = Math.max(best, (long) prices[i] - minimum);
      minimum = Math.min(minimum, prices[i]);
      emit("Best earlier buy price " + minimum + "; best one-transaction gain " + best + ".", prices, i);
    }
    return best;
  }`,
    cases: [
      ["solve(new int[] {7, 1, 5, 3, 6, 4})", 5],
      ["solve(new int[] {7, 4, 1})", 0],
      ["solve(new int[] {})", 0],
    ],
  },
  majority: {
    method: `  static Integer solve(int[] a) {
    int candidate = 0, balance = 0;
    for (int i = 0; i < a.length; i++) {
      if (balance == 0) candidate = a[i];
      balance += a[i] == candidate ? 1 : -1;
      emit("Candidate " + candidate + "; cancellation balance " + balance + ".", a, i);
    }
    int count = 0;
    for (int value : a) if (value == candidate) count++;
    return count > a.length / 2 ? candidate : null;
  }`,
    cases: [
      ["solve(new int[] {2, 2, 1, 1, 1, 2, 2})", 2],
      ["solve(new int[] {1, 2, 3})", null],
      ["solve(new int[] {})", null],
    ],
  },
  difference: {
    method: `  static long[] solve(int length, int[][] updates) {
    if (length < 0) throw new IllegalArgumentException("Negative length");
    long[] diff = new long[length + 1];
    for (int[] update : updates) {
      if (update.length != 3 || update[0] < 0 || update[0] > update[1] || update[1] > length)
        throw new IllegalArgumentException("Use [left,right,delta] with a half-open range");
      diff[update[0]] += update[2]; diff[update[1]] -= update[2];
      emit("Record start and stop markers for this half-open update.", update);
    }
    long[] result = new long[length];
    long active = 0;
    for (int i = 0; i < length; i++) {
      active += diff[i]; result[i] = active;
      emit("Materialize index " + i + " with accumulated delta " + active + ".", new int[] {i});
    }
    return result;
  }`,
    cases: [
      ["solve(5, new int[][] {{1, 4, 3}, {2, 5, 2}})", [0, 3, 5, 5, 2]],
      ["solve(0, new int[][] {})", []],
      ["solve(2, new int[][] {{0, 2, -1}, {1, 1, 9}})", [-1, -1]],
    ],
  },
  basics: {
    method: `  static int[] solve(int size) {
    int[] a = new int[size];
    emit("Allocation initializes every int element to zero.", a);
    for (int i = 0; i < a.length; i++) {
      a[i] = (i + 1) * 10;
      emit("Assign index " + i + "; valid indices end at length minus one.", a, i);
    }
    return a;
  }`,
    cases: [
      ["solve(4)", [10, 20, 30, 40]],
      ["solve(0)", []],
    ],
  },
  references: {
    method: `  static int[][] solve() {
    int[] original = {4, 7, 9};
    int[] alias = original;
    int[] copy = original.clone();
    alias[1] = 70;
    emit("The alias changes the original array because both references point to it.", original, 1);
    emit("The cloned primitive array retains its independent values.", copy, 1);
    return new int[][] { original, copy };
  }`,
    cases: [
      [
        "solve()",
        [
          [4, 70, 9],
          [4, 7, 9],
        ],
      ],
    ],
  },
  collections: {
    method: `  static int[] solve() {
    int[] raw = {3, 6, 9};
    List<int[]> oneItem = Arrays.asList(raw);
    emit("A primitive array passed to asList becomes one list element.", new int[] {oneItem.size()});
    List<Integer> growable = new ArrayList<>();
    for (int value : raw) growable.add(value);
    growable.add(12);
    int[] result = new int[growable.size()];
    for (int i = 0; i < result.length; i++) {
      result[i] = growable.get(i);
      emit("Unbox the list element into an independent primitive result.", result, i);
    }
    return result;
  }`,
    cases: [["solve()", [3, 6, 9, 12]]],
  },
  utilities: {
    method: `  static int[] solve(int[] input, int target) {
    int[] sorted = Arrays.copyOf(input, input.length);
    Arrays.sort(sorted);
    emit("Sort a copy so callers retain their original order.", sorted);
    int position = Arrays.binarySearch(sorted, target);
    int insertionPoint = position >= 0 ? position : -position - 1;
    emit("Search result " + position + "; decoded insertion point " + insertionPoint + ".", sorted);
    return new int[] {position, insertionPoint};
  }`,
    cases: [
      ["solve(new int[] {9, 1, 5}, 6)", [-3, 2]],
      ["solve(new int[] {}, 4)", [-1, 0]],
      ["solve(new int[] {2, 4, 6}, 4)", [1, 1]],
    ],
  },
  numeric: {
    method: `  static long solve(int[] a) {
    long total = 0;
    for (int i = 0; i < a.length; i++) {
      total += a[i];
      emit("Accumulate into long; total is now " + total + ".", a, i);
    }
    return total;
  }`,
    cases: [
      ["solve(new int[] {2000000000, 2000000000})", 4000000000],
      ["solve(new int[] {})", 0],
      ["solve(new int[] {-3, 2})", -1],
    ],
  },
  scan: {
    method: `  static int solve(int[] a, int target) {
    Objects.requireNonNull(a, "a");
    for (int i = 0; i < a.length; i++) {
      emit("Compare index " + i + " with target " + target + ".", a, i);
      if (a[i] == target) return i;
    }
    return -1;
  }`,
    cases: [
      ["solve(new int[] {11, 7, 19, 5}, 19)", 2],
      ["solve(new int[] {}, 1)", -1],
      ["solve(new int[] {2, 2}, 2)", 0],
    ],
  },
  insert: {
    method: `  static int[] solve(int[] input, int index, int value) {
    if (index < 0 || index > input.length) throw new IndexOutOfBoundsException(index);
    int[] a = Arrays.copyOf(input, input.length + 1);
    for (int i = input.length; i > index; i--) {
      a[i] = a[i - 1];
      emit("Shift right from the end so unread values survive.", a, i - 1, i);
    }
    a[index] = value;
    emit("Fill the gap at index " + index + ".", a, index);
    return a;
  }`,
    cases: [
      ["solve(new int[] {3, 8, 12, 20}, 2, 10)", [3, 8, 10, 12, 20]],
      ["solve(new int[] {}, 0, 7)", [7]],
      ["solve(new int[] {1}, 1, 2)", [1, 2]],
    ],
  },
  prefix: {
    method: `  static long solve(int[] a, int left, int right) {
    if (left < 0 || left > right || right > a.length) throw new IndexOutOfBoundsException();
    long[] prefix = new long[a.length + 1];
    for (int i = 0; i < a.length; i++) {
      prefix[i + 1] = prefix[i] + a[i];
      emit("Extend the prefix: prefix[" + (i + 1) + "] = " + prefix[i + 1] + ".", a, i);
    }
    return prefix[right] - prefix[left];
  }`,
    cases: [
      ["solve(new int[] {4, 2, 7, 1, 3}, 1, 4)", 10],
      ["solve(new int[] {}, 0, 0)", 0],
      ["solve(new int[] {2000000000, 2000000000}, 0, 2)", 4000000000],
    ],
  },
  pair: {
    method: `  static int[] solve(int[] sorted, long target) {
    int left = 0, right = sorted.length - 1;
    while (left < right) {
      long sum = (long) sorted[left] + sorted[right];
      emit("Pair sum " + sum + "; compare with " + target + ".", sorted, left, right);
      if (sum == target) return new int[] {left, right};
      if (sum < target) left++; else right--;
    }
    return new int[] {-1, -1};
  }`,
    cases: [
      ["solve(new int[] {1, 3, 4, 6, 9}, 10)", [0, 4]],
      ["solve(new int[] {2}, 4)", [-1, -1]],
      ["solve(new int[] {2, 2}, 4)", [0, 1]],
    ],
  },
  transpose: {
    method: `  static int[][] solve(int[][] a) {
    int rows = a.length, cols = rows == 0 ? 0 : a[0].length;
    for (int[] row : a) if (row == null || row.length != cols)
      throw new IllegalArgumentException("Rectangular matrix required");
    int[][] out = new int[cols][rows];
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
      out[c][r] = a[r][c];
      emit("Copy input [" + r + "][" + c + "] to output [" + c + "][" + r + "]. Output row:", out[c], r);
    }
    return out;
  }`,
    cases: [
      [
        "solve(new int[][] {{1, 2, 3}, {4, 5, 6}})",
        [
          [1, 4],
          [2, 5],
          [3, 6],
        ],
      ],
      ["solve(new int[][] {})", []],
    ],
  },
  twoSum: {
    method: `  static int[] solve(int[] a, long target) {
    Map<Long, Integer> seen = new HashMap<>();
    for (int i = 0; i < a.length; i++) {
      long need = target - a[i];
      emit("Look for complement " + need + " among earlier indices.", a, i);
      if (seen.containsKey(need)) return new int[] {seen.get(need), i};
      seen.putIfAbsent((long) a[i], i);
    }
    return new int[] {-1, -1};
  }`,
    cases: [
      ["solve(new int[] {3, 2, 4}, 6)", [1, 2]],
      ["solve(new int[] {3, 3}, 6)", [0, 1]],
      ["solve(new int[] {3}, 6)", [-1, -1]],
    ],
  },
  compact: {
    method: `  static int[] solve(int[] a) {
    int write = 0;
    for (int read = 0; read < a.length; read++) {
      if (a[read] != 0) a[write++] = a[read];
      emit("Read index " + read + "; kept prefix length is " + write + ".", a, read);
    }
    Arrays.fill(a, write, a.length, 0);
    emit("Fill only the unused suffix with zeros.", a);
    return a;
  }`,
    cases: [
      ["solve(new int[] {0, 1, 0, 3, 12})", [1, 3, 12, 0, 0]],
      ["solve(new int[] {})", []],
      ["solve(new int[] {0, 0})", [0, 0]],
    ],
  },
  rotate: {
    method: `  static void reverse(int[] a, int l, int r) {
    while (l < r) {
      int t = a[l]; a[l] = a[r]; a[r] = t;
      emit("Swap symmetric positions inside the current reversal.", a, l, r);
      l++; r--;
    }
  }
  static int[] solve(int[] a, int k) {
    if (a.length == 0) return a;
    k = Math.floorMod(k, a.length);
    reverse(a, 0, a.length - 1);
    reverse(a, 0, k - 1);
    reverse(a, k, a.length - 1);
    return a;
  }`,
    cases: [
      ["solve(new int[] {1, 2, 3, 4, 5}, 2)", [4, 5, 1, 2, 3]],
      ["solve(new int[] {}, 7)", []],
      ["solve(new int[] {1, 2, 3}, -1)", [2, 3, 1]],
    ],
  },
  kadane: {
    method: `  static long solve(int[] a) {
    if (a.length == 0) throw new IllegalArgumentException("Nonempty array required");
    long ending = a[0], best = a[0];
    emit("Initialize from the first element, including negative values.", a, 0);
    for (int i = 1; i < a.length; i++) {
      ending = Math.max(a[i], ending + a[i]);
      best = Math.max(best, ending);
      emit("Best ending here = " + ending + "; global best = " + best + ".", a, i);
    }
    return best;
  }`,
    cases: [
      ["solve(new int[] {-2, 1, -3, 4, -1, 2, 1, -5, 4})", 6],
      ["solve(new int[] {-4, -2, -8})", -2],
      ["solve(new int[] {7})", 7],
    ],
  },
  product: {
    method: `  static long[] solve(int[] a) {
    long[] out = new long[a.length];
    long product = 1;
    for (int i = 0; i < a.length; i++) {
      out[i] = product;
      product = Math.multiplyExact(product, a[i]);
      emit("Store product of elements strictly before index " + i + ": " + out[i] + ".", a, i);
    }
    product = 1;
    for (int i = a.length - 1; i >= 0; i--) {
      out[i] = Math.multiplyExact(out[i], product);
      product = Math.multiplyExact(product, a[i]);
      emit("Multiply by the strict suffix; output here is " + out[i] + ".", a, i);
    }
    return out;
  }`,
    cases: [
      ["solve(new int[] {1, 2, 3, 4})", [24, 12, 8, 6]],
      ["solve(new int[] {0, 2, 3})", [6, 0, 0]],
      ["solve(new int[] {0, 0})", [0, 0]],
      ["solve(new int[] {})", []],
    ],
  },
  subarray: {
    method: `  static long solve(int[] a, long target) {
    Map<Long, Long> count = new HashMap<>();
    count.put(0L, 1L);
    long prefix = 0, answer = 0;
    for (int i = 0; i < a.length; i++) {
      prefix += a[i];
      answer += count.getOrDefault(prefix - target, 0L);
      count.merge(prefix, 1L, Long::sum);
      emit("Prefix " + prefix + "; matching subarrays so far = " + answer + ".", a, i);
    }
    return answer;
  }`,
    cases: [
      ["solve(new int[] {1, -1, 1}, 1)", 3],
      ["solve(new int[] {0, 0, 0}, 0)", 6],
      ["solve(new int[] {}, 0)", 0],
    ],
  },
  window: {
    method: `  static int solve(int[] a, long target) {
    if (target <= 0) throw new IllegalArgumentException("Positive target required");
    for (int v : a) if (v < 0) throw new IllegalArgumentException("Nonnegative values required");
    long sum = 0;
    int left = 0, best = Integer.MAX_VALUE;
    for (int right = 0; right < a.length; right++) {
      sum += a[right];
      emit("Expand right; window sum becomes " + sum + ".", a, left, right);
      while (sum >= target) {
        best = Math.min(best, right - left + 1);
        sum -= a[left++];
        emit("Record a valid window, then shrink; best length is " + best + ".", a, right);
      }
    }
    return best == Integer.MAX_VALUE ? 0 : best;
  }`,
    cases: [
      ["solve(new int[] {2, 3, 1, 2, 4, 3}, 7)", 2],
      ["solve(new int[] {}, 1)", 0],
      ["solve(new int[] {0, 0, 4}, 4)", 1],
    ],
  },
  colors: {
    method: `  static int[] solve(int[] a) {
    for (int v : a) if (v < 0 || v > 2) throw new IllegalArgumentException("Only 0, 1, 2");
    int low = 0, mid = 0, high = a.length - 1;
    while (mid <= high) {
      if (a[mid] == 0) { int t = a[low]; a[low++] = a[mid]; a[mid++] = t; }
      else if (a[mid] == 1) mid++;
      else { int t = a[high]; a[high--] = a[mid]; a[mid] = t; }
      emit("Partition boundaries: low=" + low + ", mid=" + mid + ", high=" + high + ".", a);
    }
    return a;
  }`,
    cases: [
      ["solve(new int[] {2, 0, 2, 1, 1, 0})", [0, 0, 1, 1, 2, 2]],
      ["solve(new int[] {})", []],
      ["solve(new int[] {2, 2, 0})", [0, 2, 2]],
    ],
  },
  intervals: {
    method: `  static int[][] solve(int[][] input) {
    int[][] a = new int[input.length][];
    for (int i = 0; i < a.length; i++) {
      if (input[i].length != 2 || input[i][0] > input[i][1]) throw new IllegalArgumentException();
      a[i] = input[i].clone();
    }
    Arrays.sort(a, Comparator.comparingInt(row -> row[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : a) {
      if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) merged.add(interval);
      else {
        int[] last = merged.get(merged.size() - 1);
        last[1] = Math.max(last[1], interval[1]);
      }
      emit("After interval " + Arrays.toString(interval) + ", current merged interval:", merged.get(merged.size() - 1));
    }
    return merged.toArray(int[][]::new);
  }`,
    cases: [
      [
        "solve(new int[][] {{1, 3}, {2, 6}, {8, 10}, {10, 12}})",
        [
          [1, 6],
          [8, 12],
        ],
      ],
      ["solve(new int[][] {})", []],
      ["solve(new int[][] {{1, 10}, {2, 3}})", [[1, 10]]],
    ],
  },
  rotated: {
    method: `  static int solve(int[] a, int target) {
    int low = 0, high = a.length - 1;
    while (low <= high) {
      int mid = low + (high - low) / 2;
      emit("At least one half is sorted when all keys are distinct.", a, low, mid, high);
      if (a[mid] == target) return mid;
      if (a[low] <= a[mid]) {
        if (a[low] <= target && target < a[mid]) high = mid - 1; else low = mid + 1;
      } else {
        if (a[mid] < target && target <= a[high]) low = mid + 1; else high = mid - 1;
      }
    }
    return -1;
  }`,
    cases: [
      ["solve(new int[] {4, 5, 6, 7, 0, 1, 2}, 0)", 4],
      ["solve(new int[] {}, 0)", -1],
      ["solve(new int[] {1}, 1)", 0],
    ],
  },
  select: {
    method: `  static int solve(int[] a, int k) {
    if (k < 1 || k > a.length) throw new IllegalArgumentException("k is one-based");
    int low = 0, high = a.length - 1, wanted = k - 1;
    while (true) {
      int pivot = a[high], store = low;
      for (int i = low; i < high; i++) if (a[i] < pivot) {
        int t = a[store]; a[store++] = a[i]; a[i] = t;
      }
      a[high] = a[store]; a[store] = pivot;
      emit("Pivot reaches final sorted position " + store + ".", a, store);
      if (store == wanted) return a[store];
      if (store < wanted) low = store + 1; else high = store - 1;
    }
  }`,
    cases: [
      ["solve(new int[] {7, 2, 9, 4, 1}, 3)", 4],
      ["solve(new int[] {2, 2, 2}, 2)", 2],
      ["solve(new int[] {8}, 1)", 8],
    ],
  },
  rain: {
    method: `  static long solve(int[] height) {
    for (int h : height) if (h < 0) throw new IllegalArgumentException("Negative height");
    int left = 0, right = height.length - 1, leftMax = 0, rightMax = 0;
    long water = 0;
    while (left <= right) {
      if (leftMax <= rightMax) {
        leftMax = Math.max(leftMax, height[left]);
        water += leftMax - height[left];
        emit("Settle the left position; water so far = " + water + ".", height, left++);
      } else {
        rightMax = Math.max(rightMax, height[right]);
        water += rightMax - height[right];
        emit("Settle the right position; water so far = " + water + ".", height, right--);
      }
    }
    return water;
  }`,
    cases: [
      ["solve(new int[] {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1})", 6],
      ["solve(new int[] {})", 0],
      ["solve(new int[] {3, 0, 3})", 3],
    ],
  },
  permutation: {
    method: `  static int[] solve(int[] a) {
    int i = a.length - 2;
    while (i >= 0 && a[i] >= a[i + 1]) i--;
    if (i >= 0) {
      int j = a.length - 1;
      while (a[j] <= a[i]) j--;
      int t = a[i]; a[i] = a[j]; a[j] = t;
      emit("Increase the rightmost pivot by the smallest available amount.", a, i, j);
    }
    for (int l = i + 1, r = a.length - 1; l < r; l++, r--) {
      int t = a[l]; a[l] = a[r]; a[r] = t;
      emit("Reverse the suffix to obtain its smallest ordering.", a, l, r);
    }
    return a;
  }`,
    cases: [
      ["solve(new int[] {1, 3, 2})", [2, 1, 3]],
      ["solve(new int[] {3, 2, 1})", [1, 2, 3]],
      ["solve(new int[] {1, 1, 5})", [1, 5, 1]],
      ["solve(new int[] {})", []],
    ],
  },
  zeroMatrix: {
    method: `  static int[][] solve(int[][] a) {
    if (a.length == 0) return a;
    int rows = a.length, cols = a[0].length;
    for (int[] row : a) if (row.length != cols) throw new IllegalArgumentException("Rectangular matrix required");
    boolean[] zeroRow = new boolean[rows], zeroCol = new boolean[cols];
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (a[r][c] == 0) {
      zeroRow[r] = true; zeroCol[c] = true;
      emit("Record original zero at row " + r + ", column " + c + ".", a[r], c);
    }
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) if (zeroRow[r] || zeroCol[c]) a[r][c] = 0;
      emit("Apply recorded row and column markers to row " + r + ".", a[r]);
    }
    return a;
  }`,
    cases: [
      [
        "solve(new int[][] {{1, 2, 3}, {4, 0, 6}, {7, 8, 9}})",
        [
          [1, 0, 3],
          [0, 0, 0],
          [7, 0, 9],
        ],
      ],
      ["solve(new int[][] {})", []],
      ["solve(new int[][] {{0, 1}})", [[0, 0]]],
    ],
  },
  deque: {
    method: `  static int[] solve(int[] a, int k) {
    if (k <= 0 || k > a.length) throw new IllegalArgumentException("Invalid window size");
    Deque<Integer> q = new ArrayDeque<>();
    int[] out = new int[a.length - k + 1];
    for (int i = 0; i < a.length; i++) {
      while (!q.isEmpty() && q.peekFirst() <= i - k) q.removeFirst();
      while (!q.isEmpty() && a[q.peekLast()] <= a[i]) q.removeLast();
      q.addLast(i);
      if (i >= k - 1) out[i - k + 1] = a[q.peekFirst()];
      emit("Candidate indices " + q + "; front is the current maximum.", a, q.peekFirst(), i);
    }
    return out;
  }`,
    cases: [
      ["solve(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3)", [3, 3, 5, 5, 6, 7]],
      ["solve(new int[] {2, 2}, 1)", [2, 2]],
      ["solve(new int[] {2, 1}, 2)", [2]],
    ],
  },
  missing: {
    method: `  static int solve(int[] a) {
    for (int i = 0; i < a.length; i++) {
      while (a[i] >= 1 && a[i] <= a.length && a[a[i] - 1] != a[i]) {
        int destination = a[i] - 1;
        int t = a[destination]; a[destination] = a[i]; a[i] = t;
        emit("Place a relevant value at value minus one.", a, i, destination);
      }
    }
    for (int i = 0; i < a.length; i++) {
      emit("Check whether this slot contains index plus one.", a, i);
      if (a[i] != i + 1) return i + 1;
    }
    return a.length + 1;
  }`,
    cases: [
      ["solve(new int[] {3, 4, -1, 1})", 2],
      ["solve(new int[] {1, 1})", 2],
      ["solve(new int[] {})", 1],
      ["solve(new int[] {1, 2, 3})", 4],
    ],
  },
  buffer: {
    method: `  static int[] solve(int[] events, int capacity) {
    if (capacity <= 0) throw new IllegalArgumentException("Positive capacity required");
    int[] buffer = new int[capacity];
    int next = 0, size = 0;
    for (int event : events) {
      buffer[next] = event;
      emit("Write event " + event + " at physical slot " + next + ".", buffer, next);
      next = (next + 1) % capacity;
      size = Math.min(size + 1, capacity);
    }
    int[] ordered = new int[size];
    int oldest = size == capacity ? next : 0;
    for (int i = 0; i < size; i++) ordered[i] = buffer[(oldest + i) % capacity];
    return ordered;
  }`,
    cases: [
      ["solve(new int[] {10, 20, 30, 40, 50}, 3)", [30, 40, 50]],
      ["solve(new int[] {}, 3)", []],
      ["solve(new int[] {7, 8}, 1)", [8]],
    ],
  },
  analytics: {
    method: `  static double[] solve(int[] readings, int k) {
    if (k <= 0 || k > readings.length) throw new IllegalArgumentException("Invalid window size");
    double[] averages = new double[readings.length - k + 1];
    long sum = 0;
    for (int i = 0; i < readings.length; i++) {
      sum += readings[i];
      if (i >= k) sum -= readings[i - k];
      if (i >= k - 1) averages[i - k + 1] = (double) sum / k;
      emit("Rolling total " + sum + "; emit only after " + k + " readings.", readings, i);
    }
    return averages;
  }`,
    cases: [
      ["solve(new int[] {10, 20, 30, 40, 50}, 3)", [20, 30, 40]],
      ["solve(new int[] {1, 2}, 2)", [1.5]],
      ["solve(new int[] {2000000000, 2000000000}, 2)", [2000000000]],
    ],
  },
  defensive: {
    method: `  static final class Snapshot {
    private final int[] samples;
    Snapshot(int[] input) { samples = Objects.requireNonNull(input).clone(); }
    int[] values() { return samples.clone(); }
  }
  static int[] solve() {
    int[] incoming = {12, 18, 24};
    Snapshot snapshot = new Snapshot(incoming);
    incoming[0] = -1;
    emit("Caller changes its input; the stored snapshot is independent.", snapshot.values());
    int[] returned = snapshot.values();
    returned[1] = -1;
    emit("Caller changes the getter result; storage remains protected.", snapshot.values());
    return snapshot.values();
  }`,
    cases: [["solve()", [12, 18, 24]]],
  },
  testing: {
    method: `  static int[] solve(int[] input) {
    int[] sorted = input.clone();
    Arrays.sort(sorted);
    for (int i = 1; i < sorted.length; i++)
      if (sorted[i - 1] > sorted[i]) throw new AssertionError("Not sorted");
    Map<Integer, Integer> counts = new HashMap<>();
    for (int v : input) counts.merge(v, 1, Integer::sum);
    for (int v : sorted) counts.merge(v, -1, Integer::sum);
    for (int count : counts.values()) if (count != 0) throw new AssertionError("Lost a value");
    emit("Check both sorted order and preservation of the input multiset.", sorted);
    return sorted;
  }`,
    cases: [
      ["solve(new int[] {3, -1, 3, 0})", [-1, 0, 3, 3]],
      ["solve(new int[] {})", []],
      ["solve(new int[] {-2147483648, 2147483647})", [-2147483648, 2147483647]],
    ],
  },
};
