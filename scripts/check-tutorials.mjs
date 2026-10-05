import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { authoredArticleFiles, starterCopy } from "./tutorial-articles-plugin.mjs";

const server = await createServer({ logLevel: "error", server: { middlewareMode: true }, appType: "custom" });
// Course outlines read this browser preference during their initial render.
globalThis.window = { sessionStorage: { getItem: () => null } };
const escapeHtml = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
try {
  const { modules } = await server.ssrLoadModule("/src/data/catalog.js");
  const { getStructuredCourse } = await server.ssrLoadModule("/src/data/structuredCourses.js");
  const { default: TutorialLesson } = await server.ssrLoadModule("/src/components/learning/TutorialLesson.jsx");
  const { default: CoursePage } = await server.ssrLoadModule("/src/components/learning/CoursePage.jsx");
  const { default: ArticlePage } = await server.ssrLoadModule("/src/components/learning/ArticlePage.jsx");
  const { getArticleComponent } = await server.ssrLoadModule("/src/components/articles/registry.js");
  const { courseFocus } = await server.ssrLoadModule("/src/data/tutorialProfiles.js");
  const { getTutorialLesson } = await server.ssrLoadModule("/src/data/tutorialLessons.js");
  // Overlapping words such as "resource" must not select a file-I/O lesson
  // for a cloud resource hierarchy, or a backup lesson for regional placement.
  for (const [title, expected] of [
    ["Regions, Zones, and Global Infrastructure", "Place resources in independent failure domains"],
    ["Accounts, Projects, and Resource Hierarchy", "Separate ownership, policy, and billing boundaries"],
  ]) {
    const lesson = getTutorialLesson({ id: "cloud" }, { slug: "aws", name: "AWS" }, { title });
    assert.equal(lesson.mechanism.title, expected);
  }
  const authored = new Set(authoredArticleFiles(process.cwd()));
  let courses = 0, lessons = 0, sharedLessons = 0, writtenLessons = 0;
  const routes = new Set();
  for (const module of modules) {
    for (const track of module.groups.flatMap((group) => group.tracks)) {
      const key = `${module.id}/${track.slug}`;
      const course = getStructuredCourse(module.id, track.slug);
      assert.ok(course?.articles.length, `${key}: no lessons`);
      assert.deepEqual(course.sections.flatMap((section) => section.lessons), course.articles, `${key}: outline mismatch`);
      const outline = renderToStaticMarkup(createElement(CoursePage, { module, track, navigate() {} }));
      assert.ok(!/Lessons and examples will be added later|planned sections/.test(outline), `${key}: outline is not navigable`);
      assert.ok(outline.includes(escapeHtml(course.articles[0].title)), `${key}: first lesson not visible`);
      const sectionSlugs = new Set();
      for (const section of course.sections) {
        assert.ok(!sectionSlugs.has(section.slug), `${key}: duplicate section`);
        sectionSlugs.add(section.slug);
      }
      for (const article of course.articles) {
        const route = `${key}/${article.slug}`;
        assert.ok(!routes.has(route), `${route}: duplicate route`);
        routes.add(route);
        assert.ok(sectionSlugs.has(article.sectionSlug), `${route}: orphan lesson`);
        assert.ok(getArticleComponent(module.id, track.slug, article.slug), `${route}: no renderer`);
        const path = `${course.componentPath}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
        if (authored.has(path)) {
          const file = resolve("src/components", path);
          assert.ok(existsSync(file));
          assert.ok(!starterCopy.test(readFileSync(file, "utf8")), `${route}: starter content`);
          const { default: Component } = await server.ssrLoadModule(`/src/components/${path}`);
          const html = renderToStaticMarkup(createElement(Component, { module, track, article }));
          assert.ok(html.length > 100, `${route}: empty written article`);
          writtenLessons++;
        } else {
          assert.ok(courseFocus[key], `${route}: missing course-specific context`);
          const html = renderToStaticMarkup(createElement(TutorialLesson, { module, track, article }));
          for (const id of ["overview", "concepts", "example", "mistakes", "check"]) {
            assert.equal(html.split(`id="${id}"`).length - 1, 1, `${route}: missing or repeated ${id}`);
          }
          assert.ok(html.includes("<details>"), `${route}: no answer reveal`);
          assert.ok(html.includes("Expected result"), `${route}: no verification criterion`);
          assert.ok(!starterCopy.test(html), `${route}: starter content`);
          assert.ok(html.length > 3000, `${route}: incomplete lesson`);
          sharedLessons++;
        }
        lessons++;
      }
      assert.equal(getArticleComponent(module.id, track.slug, "definitely-not-a-lesson"), null);
      const missing = renderToStaticMarkup(createElement(ArticlePage, { module, track, articleSlug: "definitely-not-a-lesson", navigate() {} }));
      assert.ok(missing.includes("Article not found"), `${key}: unknown route silently loads a lesson`);
      courses++;
    }
  }
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
  assert.ok(config.rewrites.some(({ source, destination }) => source === "/(.*)" && destination === "/index.html"));
  console.log(`Verified ${courses} courses and ${lessons} lesson routes: ${writtenLessons} written components, ${sharedLessons} shared tutorials. Outlines, unknown routes, content sections, exercises, and Vercel SPA configuration passed.`);
} finally {
  delete globalThis.window;
  await server.close();
}
