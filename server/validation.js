export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function requireValue(condition, message = "Invalid request") {
  if (!condition) throw new HttpError(400, message);
}
export function validateEntries(entries, now = Date.now()) {
  requireValue(Array.isArray(entries) && entries.length <= 100);
  const categories = new Set([
    "drafts",
    "solved",
    "quizzes",
    "lessons",
    "reviews",
    "interviews",
    "preferences",
  ]);
  let size = 0;
  for (const e of entries) {
    requireValue(e && categories.has(e.category));
    requireValue(
      typeof e.entryKey === "string" &&
        e.entryKey.length > 0 &&
        e.entryKey.length <= 240 &&
        !["__proto__", "constructor", "prototype"].includes(e.entryKey),
    );
    requireValue(typeof e.value === "string" && e.value.length <= 24000);
    try {
      JSON.parse(e.value);
    } catch {
      throw new HttpError(400, "Invalid progress JSON");
    }
    requireValue(
      Number.isSafeInteger(e.updatedAt) && e.updatedAt > 0 && e.updatedAt <= now + 300000,
      "Invalid progress timestamp",
    );
    size += e.value.length;
  }
  if (size > 500000) throw new HttpError(413, "Progress batch is too large");
  requireValue(
    new Set(entries.map((e) => `${e.category}:${e.entryKey}`)).size === entries.length,
    "Duplicate progress entries",
  );
  return entries;
}
export function validateArticle(b) {
  for (const key of ["moduleSlug", "courseSlug", "sectionSlug", "articleSlug"])
    requireValue(typeof b[key] === "string" && b[key].trim().length > 0 && b[key].length <= 240);
  requireValue(
    Number.isInteger(b.progressPercent) && b.progressPercent >= 0 && b.progressPercent <= 100,
  );
  requireValue(
    Number.isInteger(b.lastPosition) && b.lastPosition >= 0 && b.lastPosition <= 2147483647,
  );
  requireValue(typeof b.completed === "boolean");
  return b;
}
