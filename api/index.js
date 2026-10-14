import { neon } from "@neondatabase/serverless";
import { learningCalendar } from "../server/learning.js";
import { authenticate } from "../server/auth.js";
import { runner } from "../server/runner.js";
import { HttpError, requireValue, validateEntries, validateArticle } from "../server/validation.js";
export function createHandler({ verify = authenticate, connect = neon } = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      const url = new URL(req.url, "https://local.invalid");
      const route = req.query?.route || url.searchParams.get("route");
      const path = (route ? `/api/${route}` : url.pathname).replace(/\/$/, "");
      if (path === "/api/health" && req.method === "GET")
        return res.status(200).json({ status: "ok" });
      const identity = await verify(req);
      if (!process.env.DATABASE_URL) throw new HttpError(503, "Database is not configured");
      const sql = connect(process.env.DATABASE_URL),
        id = identity.sub;
      await sql`INSERT INTO app.users(id) SELECT id::text FROM neon_auth."user" WHERE id::text=${id} ON CONFLICT DO NOTHING`;
      const [account] = await sql`SELECT id, role, active FROM app.users WHERE id = ${id}`;
      if (!account?.active) throw new HttpError(403, "Account disabled");
      const body = req.body || {};
      if (path === "/api/dsa/java/status" && req.method === "GET")
        return res.status(200).json(await runner("status", body));
      if (path === "/api/dsa/java/run" && req.method === "POST")
        return res.status(200).json(await runner("run", body));
      if (path === "/api/auth/me" && req.method === "GET") {
        const [profile] =
          await sql`SELECT name AS "displayName", email, "emailVerified" FROM neon_auth."user" WHERE id = ${id}`;
        return res.status(200).json({ ...profile, ...account });
      }
      const listArticles = () =>
        sql`SELECT id, module_slug AS "moduleSlug", course_slug AS "courseSlug", section_slug AS "sectionSlug", article_slug AS "articleSlug", progress_percent AS "progressPercent", last_position AS "lastPosition", completed, updated_at AS "updatedAt" FROM app.article_progress WHERE user_id = ${id} ORDER BY updated_at DESC`;
      if (path === "/api/progress" && req.method === "GET")
        return res.status(200).json(await listArticles());
      if (path === "/api/progress" && req.method === "PUT") {
        const b = validateArticle(body);
        await sql`INSERT INTO app.article_progress(user_id,module_slug,course_slug,section_slug,article_slug,progress_percent,last_position,completed) VALUES (${id},${b.moduleSlug},${b.courseSlug},${b.sectionSlug},${b.articleSlug},${b.progressPercent},${b.lastPosition},${b.completed}) ON CONFLICT(user_id,module_slug,course_slug,article_slug) DO UPDATE SET section_slug=EXCLUDED.section_slug,progress_percent=EXCLUDED.progress_percent,last_position=EXCLUDED.last_position,completed=EXCLUDED.completed,updated_at=now()`;
        return res
          .status(200)
          .json(
            (await listArticles()).find(
              (p) =>
                p.moduleSlug === b.moduleSlug &&
                p.courseSlug === b.courseSlug &&
                p.articleSlug === b.articleSlug,
            ),
          );
      }
      if (/^\/api\/progress\/\d+$/.test(path) && req.method === "DELETE") {
        await sql`DELETE FROM app.article_progress WHERE id=${path.split("/").pop()} AND user_id=${id}`;
        return res.status(204).end();
      }
      if (path === "/api/progress/summary" && req.method === "GET") {
        const [summary] =
          await sql`SELECT count(*)::int AS "trackedArticles", count(*) FILTER (WHERE completed)::int AS "completedArticles" FROM app.article_progress WHERE user_id=${id}`;
        const courses =
          await sql`SELECT module_slug AS "moduleSlug",course_slug AS "courseSlug",completed_at AS "completedAt" FROM app.course_progress WHERE user_id=${id}`;
        const days =
          await sql`SELECT day::text FROM app.learning_days WHERE user_id=${id} ORDER BY day DESC`;
        const articles = await listArticles();
        return res
          .status(200)
          .json({
            ...summary,
            completedCourses: courses.length,
            courses,
            recentArticle: articles[0] || null,
            ...learningCalendar(days),
          });
      }
      if (path === "/api/progress/courses" && ["GET", "PUT"].includes(req.method)) {
        if (req.method === "PUT") {
          requireValue(
            [body.moduleSlug, body.courseSlug].every(
              (s) => typeof s === "string" && /^[a-z0-9][a-z0-9-]{0,239}$/.test(s),
            ),
            "Invalid course",
          );
          await sql`INSERT INTO app.course_progress(user_id,module_slug,course_slug) VALUES (${id},${body.moduleSlug},${body.courseSlug}) ON CONFLICT DO NOTHING`;
        }
        return res
          .status(200)
          .json(
            await sql`SELECT module_slug AS "moduleSlug",course_slug AS "courseSlug",completed_at AS "completedAt" FROM app.course_progress WHERE user_id=${id}`,
          );
      }
      if (path === "/api/dsa/progress" && ["GET", "PUT"].includes(req.method)) {
        if (req.method === "PUT")
          await sql`SELECT app.save_dsa(${id}, ${JSON.stringify(validateEntries(body.entries))}::jsonb)`;
        return res
          .status(200)
          .json(
            await sql`SELECT category,entry_key AS "entryKey",value,updated_at::float8 AS "updatedAt" FROM app.dsa_progress WHERE user_id=${id}`,
          );
      }
      if (path.startsWith("/api/admin/")) {
        if (account.role !== "ADMIN") throw new HttpError(403, "Administrator access required");
        if (path === "/api/admin/users" && req.method === "GET") {
          const content =
            await sql`SELECT a.id,a.role,a.active,n.name AS "displayName",n.email FROM app.users a LEFT JOIN neon_auth."user" n ON n.id::text=a.id ORDER BY a.created_at DESC LIMIT 50`;
          return res.status(200).json({ content });
        }
        if (path.startsWith("/api/admin/users/") && req.method === "PATCH") {
          const target = decodeURIComponent(path.slice("/api/admin/users/".length));
          requireValue(target !== id, "Use another administrator to change your own access");
          requireValue(
            Object.keys(body).length > 0 &&
              Object.keys(body).every((k) => ["role", "active"].includes(k)),
          );
          requireValue(body.role === undefined || ["USER", "ADMIN"].includes(body.role));
          requireValue(body.active === undefined || typeof body.active === "boolean");
          const [updated] =
            await sql`UPDATE app.users SET role=coalesce(${body.role ?? null},role),active=coalesce(${body.active ?? null},active) WHERE id=${target} RETURNING id,role,active`;
          if (!updated) throw new HttpError(404, "User not found");
          const [profile] =
            await sql`SELECT name AS "displayName",email FROM neon_auth."user" WHERE id=${target}`;
          return res.status(200).json({ ...profile, ...updated });
        }
        if (path === "/api/admin/stats" && req.method === "GET") {
          const [stats] =
            await sql`SELECT (SELECT count(*)::int FROM app.users) AS users,(SELECT count(*)::int FROM app.users WHERE active) AS "activeUsers",count(*)::int AS "progressRecords",count(*) FILTER (WHERE completed)::int AS "completedArticles" FROM app.article_progress`;
          return res.status(200).json(stats);
        }
      }
      throw new HttpError(404, "API route not found");
    } catch (error) {
      const status = error.code === "P0001" ? 413 : error.status || 500;
      if (status >= 500) console.error("API request failed", error.code || error.name);
      return res.status(status).json({
        error: status >= 500 ? "Service unavailable. Check server configuration." : error.message,
      });
    }
  };
}
export default createHandler();
