export function parseLabValues(text) {
  if (!text.trim()) return [];
  const parts = text.split(",");
  if (parts.length > 16)
    throw new Error("Use at most 16 values so each visual step stays readable.");
  return parts.map((part) => {
    if (!/^-?\d+$/.test(part.trim()))
      throw new Error("Enter whole numbers separated by commas, for example 3, -1, 4.");
    const value = Number(part);
    if (Math.abs(value) > 9999) throw new Error("Each value must be between -9999 and 9999.");
    return value;
  });
}

// Count value comparisons directly, not snapshots or wall-clock timing.
export function compareSearch(values, target) {
  let linear = 0,
    linearIndex = -1;
  for (let i = 0; i < values.length; i++) {
    linear++;
    if (values[i] === target) {
      linearIndex = i;
      break;
    }
  }
  let binary = 0,
    low = 0,
    high = values.length;
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    binary++;
    if (values[mid] < target) low = mid + 1;
    else high = mid;
  }
  let binaryIndex = -1;
  if (low < values.length) {
    binary++;
    if (values[low] === target) binaryIndex = low;
  }
  return [
    { name: "Linear search", comparisons: linear, result: linearIndex, cost: "O(n) worst case" },
    {
      name: "Binary search (first match)",
      comparisons: binary,
      result: binaryIndex,
      cost: "O(log n) worst case",
    },
  ];
}
export function compareSort(values) {
  const bubble = [...values],
    insertion = [...values];
  let b = 0,
    ins = 0;
  for (let end = bubble.length - 1; end > 0; end--) {
    let changed = false;
    for (let i = 0; i < end; i++) {
      b++;
      if (bubble[i] > bubble[i + 1]) {
        [bubble[i], bubble[i + 1]] = [bubble[i + 1], bubble[i]];
        changed = true;
      }
    }
    if (!changed) break;
  }
  for (let i = 1; i < insertion.length; i++) {
    const value = insertion[i];
    let j = i - 1;
    while (j >= 0) {
      ins++;
      if (insertion[j] <= value) break;
      insertion[j + 1] = insertion[j];
      j--;
    }
    insertion[j + 1] = value;
  }
  return [
    { name: "Bubble sort (early exit)", comparisons: b, result: bubble, cost: "O(n²) worst case" },
    { name: "Insertion sort", comparisons: ins, result: insertion, cost: "O(n²) worst case" },
  ];
}
