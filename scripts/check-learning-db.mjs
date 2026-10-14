import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { createHandler } from "../api/index.js";
const sql = neon(process.env.DATABASE_URL);
const id = `learning-test-${randomUUID()}`;
const other = `${id}-other`;
const handler = createHandler({ verify: async () => ({ sub: id }) });
async function request(url, method = "GET", body) {
  const res = {
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
  await handler({ url, method, body }, res);
  assert.equal(res.code, 200, JSON.stringify(res.body));
  return res.body;
}
try {
  await sql`INSERT INTO app.users(id) VALUES (${id}),(${other})`;
  await sql`INSERT INTO app.course_progress(user_id,module_slug,course_slug) VALUES (${other},'dsa','other-course')`;
  assert.equal((await request("/api/progress/summary")).completedCourses, 0);
  await request("/api/progress", "PUT", {
    moduleSlug: "dsa",
    courseSlug: "dsa-foundations",
    sectionSlug: "course",
    articleSlug: "intro",
    progressPercent: 100,
    lastPosition: 0,
    completed: true,
  });
  assert.equal((await request("/api/progress/summary")).completedCourses, 0);
  for (let i = 0; i < 2; i++)
    await request("/api/progress/courses", "PUT", {
      moduleSlug: "dsa",
      courseSlug: "dsa-foundations",
    });
  const summary = await request("/api/progress/summary");
  assert.equal(summary.completedCourses, 1);
  assert.equal(summary.completedArticles, 1);
  assert.equal(summary.weeklyDays, 1);
  assert.equal(summary.streak, 1);
  assert.equal(summary.activity.filter((day) => day.active).length, 1);
  assert.equal((await request("/api/progress/courses")).length, 1);
  const bookmarkBody = {moduleSlug: 'dsa', courseSlug: 'dsa-foundations'};
  await request('/api/progress/bookmarks', 'PUT', bookmarkBody);
  await request('/api/progress/bookmarks', 'PUT', bookmarkBody);
  assert.equal((await request('/api/progress/bookmarks')).length, 1);
  await request('/api/progress/bookmarks', 'DELETE', bookmarkBody);
  assert.equal((await request('/api/progress/bookmarks')).length, 0);
  console.log(
    "Live Neon checks passed: saved completion, reload, idempotency, activity, summary and account isolation.",
  );
} finally {
  await sql`DELETE FROM app.users WHERE id IN (${id},${other})`;
}
