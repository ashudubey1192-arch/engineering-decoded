import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ logLevel: "error", server: { middlewareMode: true }, appType: "custom" });
try {
  const { modules } = await server.ssrLoadModule("/src/data/catalog.js");
  const { getStructuredCourse } = await server.ssrLoadModule("/src/data/structuredCourses.js");
  const { interviewLessons, newInterviewCourseKeys } = await server.ssrLoadModule("/src/data/interviewCourses.js");
  const { default: InterviewLab } = await server.ssrLoadModule("/src/components/learning/InterviewLab.jsx");
  const catalog = new Map(modules.flatMap(m => m.groups.flatMap(g => g.tracks.map(t => [`${m.id}/${t.slug}`, t]))));
  let labs = 0;
  for (const [key, lessons] of Object.entries(interviewLessons)) {
    assert.ok(catalog.has(key), `Unreachable course: ${key}`);
    const [moduleId, trackSlug] = key.split("/");
    const course = getStructuredCourse(moduleId, trackSlug);
    assert.equal(new Set(course.articles.map(a => a.slug)).size, course.articles.length);
    for (const article of lessons) {
      assert.ok(course.articles.includes(article), `Lab missing from outline: ${key}/${article.slug}`);
      assert.ok(article.lab.states.length >= 3);
      assert.ok(article.lab.states.every(s => s.length === 4 && s.every(v => typeof v === "string" && v.length)));
      for (const field of ["concept", "scenario", "code", "mistake", "question", "answer", "challenge"]) assert.ok(article.lab[field]?.trim().length > 20, `${key}: missing ${field}`);
      const html = renderToStaticMarkup(createElement(InterviewLab, { article }));
      for (const id of ["overview", "concepts", "example", "mistakes", "check"]) assert.equal(html.split(`id="${id}"`).length - 1, 1);
      assert.ok(html.includes("Read the complete walkthrough"));
      assert.ok(html.includes("Expected result"));
      labs++;
    }
  }
  const rows = [...catalog].map(([key, track]) => {
    const course = getStructuredCourse(...key.split("/"));
    assert.ok(course?.articles.length, `${key}: empty course`);
    return { key, name: track.name, lessons: course.articles.length, labs: interviewLessons[key]?.length || 0 };
  });
  const report = `# Course content audit\n\nReviewed 2026-10-17 against the public [AlgoMaster catalog](https://algomaster.io/courses). The dashboard redirects to login; authenticated and premium chapters were not inspected or copied.\n\n${rows.length} local courses have nonempty outlines. ${Object.keys(interviewLessons).length} reference-aligned course areas have ${labs} new original interview labs; ${newInterviewCourseKeys.size} are newly added course areas with introductory practical curricula. Existing lessons are retained. These introductory additions do not constitute full parity with every chapter of the reference site.\n\nEach lab has a mechanism explanation, worked example, controllable state walkthrough, trade-offs, self-review answer and hands-on extension. The queue lab additionally accepts workload inputs. Other animations replay authored states and do not execute code.\n\nA nonempty outline is a structural check, not proof of depth or accuracy for every existing lesson. Generic shared tutorials remain elsewhere in the catalog and need a separate subject-by-subject editorial review.\n\n| Local course | Total lessons | New interview labs |\n|---|---:|---:|\n${rows.map(r => `| ${r.key} | ${r.lessons} | ${r.labs} |`).join("\n")}\n\n## Technical references\n\n- [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html)\n- [Python default arguments](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values)\n- [Go channels](https://go.dev/tour/concurrency/2)\n- [C# asynchronous programming](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)\n- [Git revert](https://git-scm.com/docs/git-revert)\n- [Kafka design](https://kafka.apache.org/41/design/design/)\n`;
  writeFileSync("COURSE_CONTENT_AUDIT.md", report);
  console.log(`Verified ${labs} interview labs across ${Object.keys(interviewLessons).length} courses; audited ${rows.length} course outlines.`);
} finally { await server.close(); }
