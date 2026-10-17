import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { simulationModels } from "../src/data/learningSimulations.js";
import { interviewPractice } from "../src/data/interviewPractice.js";

const server = await createServer({ logLevel: "error", optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: "custom" });
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
      const outlined = course.articles.find(item => item.slug === article.slug);
      assert.ok(outlined, `Lab missing from outline: ${key}/${article.slug}`);
      assert.equal(outlined.title, article.title, `Lab title differs from outline: ${key}/${article.slug}`);
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
  const report = `# Course content audit\n\nUpdated 2026-10-18. Reference scope: the public [AlgoMaster catalog](https://algomaster.io/courses); authenticated and premium chapters were not inspected or copied.\n\n${rows.length} local courses contain ${rows.reduce((n,r)=>n+r.lessons,0)} navigable lessons. There are ${labs} authored interview labs across ${Object.keys(interviewLessons).length} course areas. The OS and networking courses include every entry in their public roadmaps (153 and 111 respectively), plus 12 retained workshops each. The other four new curricula retain 12 lessons each. Existing lesson URLs remain available.\n\n## Learning features\n\n- Every lesson offers a practice studio. Technical lessons expose ${Object.keys(simulationModels).length} calculated models and ${Object.keys(interviewPractice).length} executable JavaScript exercises with sample/boundary tests, reference solutions, and scored checks. Nontechnical lessons use a contextual reflection worksheet.\n- Models cover queues, LRU replacement, round-robin scheduling, HTTPS timing, fraud thresholds, token buckets, and two-sum. They recompute from input values and expose their assumptions.\n- Shared tutorials include a guided reading animation. This highlights authored text and is deliberately labeled separately from calculated simulations.\n- Interview labs retain their specific worked walkthroughs, trade-offs, explained answers, and hands-on extensions.\n\n## Verification and limitations\n\nRun npm run check:core-cs, npm run check:tutorials, npm run check:interview-courses, npm run check:lesson-depth, and npm run test:workshop. LESSON_DEPTH_AUDIT.json identifies the rendering/content path for every lesson. Topic matching is an automated coverage signal, not a claim that every chapter has received independent expert review. Shared mechanisms are reused where applicable; not every route has a unique simulation or executable exercise. The browser runner executes JavaScript only, while C++, C#, and other native examples remain reading/local implementation exercises. CORE_CS_ROADMAP_AUDIT.md maps every OS and networking roadmap entry to its local lesson. Other curricula do not claim chapter-for-chapter parity with the reference site.\n\n| Local course | Total lessons | Authored interview labs |\n|---|---:|---:|\n${rows.map(r => `| ${r.key} | ${r.lessons} | ${r.labs} |`).join("\n")}\n\n## Technical references\n\n- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)\n- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)\n- [C# asynchronous programming](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)\n- [HTTP caching specification](https://www.rfc-editor.org/rfc/rfc9111.html)\n- [Production ML systems](https://developers.google.com/machine-learning/crash-course/production-ml-systems)\n- [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html)\n- [Python default arguments](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values)\n- [Go channels](https://go.dev/tour/concurrency/2)\n- [Git revert](https://git-scm.com/docs/git-revert)\n- [Kafka design](https://kafka.apache.org/41/design/design/)\n`;
  writeFileSync("COURSE_CONTENT_AUDIT.md", report);
  console.log(`Verified ${labs} interview labs across ${Object.keys(interviewLessons).length} courses; audited ${rows.length} course outlines.`);
} finally { await server.close(); }
