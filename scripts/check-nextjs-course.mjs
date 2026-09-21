import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, transformWithOxc } from "vite";
import { nextJsArticles } from "../src/data/frontendCourses.js";
import { nextJsLessons } from "../src/data/nextJsLessons.js";

assert.equal(Object.keys(nextJsLessons).length, nextJsArticles.length);
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
let snippets = 0;
try {
  for (const article of nextJsArticles) {
    const content = nextJsLessons[article.slug];
    assert.ok(content, `Missing lesson: ${article.slug}`);
    for (const field of ["intro", "code", "walkthrough", "mistake", "exercise", "answer"]) {
      assert.ok(
        content[field]?.length > (field === "exercise" ? 15 : 30),
        `${article.slug}: incomplete ${field}`,
      );
    }
    assert.equal(content.concepts.length, 3);
    assert.equal(content.flow.length, 3);
    assert.ok(content.reference.startsWith("https://"));
    const path = `/src/components/frontend/next-js/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
    const { default: Article } = await server.ssrLoadModule(path);
    const markup = renderToStaticMarkup(createElement(Article));
    for (const id of ["overview", "concepts", "example", "mistakes", "check"]) {
      assert.ok(markup.includes(`id="${id}"`), `${article.slug}: missing ${id}`);
    }
    assert.ok(markup.includes("Visual model") && markup.includes("Reveal explanation"));
    assert.ok(!markup.includes("Replace this placeholder"));

    // Parse each authored file separately; examples may deliberately need an API,
    // asset, or adapter identified in their walkthrough before a framework build.
    const markers = [...content.code.matchAll(/^(?:\/\/|#) FILE: (.+)$/gm)];
    for (let index = 0; index < markers.length; index += 1) {
      const marker = markers[index];
      const filename = marker[1];
      if (!/\.[jt]sx?$/.test(filename)) continue;
      const code = content.code
        .slice(marker.index + marker[0].length, markers[index + 1]?.index)
        .trim();
      await transformWithOxc(code, filename, { lang: filename.endsWith("x") ? "tsx" : "ts" });
      snippets += 1;
    }
  }
  console.log(
    `PASS: ${nextJsArticles.length} Next.js lesson routes rendered with complete content; ${snippets} code files passed syntax checks.`,
  );
  console.log(
    "Syntax checks do not execute Next.js server APIs or replace a configured practice-project build.",
  );
} finally {
  await server.close();
}
