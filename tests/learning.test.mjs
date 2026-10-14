import test from "node:test";
import assert from "node:assert/strict";
import { learningCalendar } from "../server/learning.js";
test("UTC week boundary, duplicate days and yesterday grace", () => {
  const result = learningCalendar(
    ["2026-10-11", "2026-10-12", "2026-10-12", "2026-10-13"].map((day) => ({ day })),
    new Date("2026-10-14T00:01:00Z"),
  );
  assert.equal(result.weeklyDays, 2);
  assert.equal(result.streak, 3);
  assert.equal(result.activity.length, 42);
  assert.equal(result.activity.at(-1).active, false);
  assert.equal(learningCalendar([{ day: "2026-10-11" }], new Date("2026-10-14")).streak, 0);
  assert.equal(learningCalendar([], new Date("2026-10-14")).weeklyDays, 0);
});
