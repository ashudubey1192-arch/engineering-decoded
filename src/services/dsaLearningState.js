export const progressFields = [
  "drafts",
  "solved",
  "quizzes",
  "lessons",
  "reviews",
  "interviews",
  "preferences",
];
export function freshProgress() {
  return {
    ...Object.fromEntries(progressFields.map((field) => [field, {}])),
    stamps: {},
    storageAvailable: true,
    owner: "guest",
    syncStatus: "Local only",
  };
}
export function mergeProgress(local, entries) {
  const merged = { ...local, stamps: { ...local.stamps } };
  for (const entry of entries) {
    if (
      !progressFields.includes(entry.category) ||
      typeof entry.entryKey !== "string" ||
      ["__proto__", "constructor", "prototype"].includes(entry.entryKey)
    )
      continue;
    const stamp = Number(entry.updatedAt),
      key = `${entry.category}:${entry.entryKey}`;
    if (!Number.isFinite(stamp) || stamp < (merged.stamps[key] || 0)) continue;
    try {
      merged[entry.category] = {
        ...merged[entry.category],
        [entry.entryKey]: JSON.parse(entry.value),
      };
      merged.stamps[key] = stamp;
    } catch {
      /* Keep local data if a remote entry is malformed. */
    }
  }
  return merged;
}
export function progressEntries(state) {
  return progressFields.flatMap((category) =>
    Object.entries(state[category] || {}).map(([entryKey, value]) => ({
      category,
      entryKey,
      value: JSON.stringify(value),
      updatedAt: state.stamps[`${category}:${entryKey}`] || 1,
    })),
  );
}
export function nextReview(previous, correct, now = Date.now()) {
  const streak = correct ? Math.min(5, (previous?.streak || 0) + 1) : 0;
  const days = correct ? [1, 1, 3, 7, 14, 30][streak] : 1;
  return { streak, dueAt: now + days * 86400000, lastReviewedAt: now, correct };
}
export function remainingSeconds(session, now = Date.now()) {
  return Math.max(0, Math.ceil((session.deadline - now) / 1000));
}
