import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { vueArticles } from "../src/data/frontendCourses.js";
import { vueLessons } from "../src/data/vueLessons.js";

assert.deepEqual(Object.keys(vueLessons).sort(), vueArticles.map(({ slug }) => slug).sort());
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  for (const article of vueArticles) {
    const lesson = vueLessons[article.slug];
    for (const field of [
      "intro",
      "concepts",
      "code",
      "walkthrough",
      "mistake",
      "exercise",
      "answer",
    ]) {
      assert.ok(lesson[field]?.length > 30, `${article.slug}: incomplete ${field}`);
    }
    assert.ok(new URL(lesson.reference).protocol === "https:");
    const { default: Article } = await server.ssrLoadModule(
      `/src/components/frontend/vue/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`,
    );
    const html = renderToStaticMarkup(createElement(Article));
    for (const id of ["overview", "concepts", "example", "mistakes", "check"]) {
      assert.ok(html.includes(`id="${id}"`), `${article.slug}: missing ${id}`);
    }
    assert.ok(html.includes("Reveal explanation") && html.includes("<code>"));
    assert.ok(!/placeholder|Add a focused implementation|Explain the terminology/.test(html));
  }
  console.log(`PASS: all ${vueArticles.length} Vue lesson routes render complete content.`);
  console.log("Examples are instructional excerpts; this check does not execute Vue applications.");
} finally {
  await server.close();
}
