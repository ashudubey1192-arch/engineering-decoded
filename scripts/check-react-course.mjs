import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, transformWithOxc } from "vite";
import { reactArticles } from "../src/data/react.js";
import { reactLessons } from "../src/data/reactLessons.js";

// Check content coverage and render each real route entry, not just the shared reader.
assert.equal(Object.keys(reactLessons).length, reactArticles.length);
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
let compiled = 0;
try {
  for (const article of reactArticles) {
    const content = reactLessons[article.slug];
    assert.ok(content, `Missing content: ${article.slug}`);
    for (const field of ["intro", "code", "walkthrough", "mistake", "exercise", "answer"]) {
      assert.ok(
        content[field]?.length > (field === "exercise" ? 15 : 30),
        `${article.slug}: incomplete ${field}`,
      );
    }
    assert.equal(content.concepts.length, 3, `${article.slug}: missing concepts`);
    assert.equal(content.flow.length, 3, `${article.slug}: missing visual`);
    assert.ok(content.reference.startsWith("https://"));
    const path = `/src/components/frontend/react/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
    const { default: Article } = await server.ssrLoadModule(path);
    const markup = renderToStaticMarkup(createElement(Article));
    for (const section of ["overview", "concepts", "example", "mistakes", "check"]) {
      assert.ok(markup.includes(`id="${section}"`), `${article.slug}: missing ${section}`);
    }
    assert.ok(!markup.includes("Replace this placeholder"));
    assert.ok(markup.includes("Visual model"));
    assert.ok(markup.includes("Reveal explanation"));

    // Standalone JSX examples must parse. Multi-file, shell and design excerpts
    // have explicit prerequisites and are checked separately by editorial review.
    const exportCount = (content.code.match(/export default/g) || []).length;
    if (
      exportCount === 1 &&
      !content.code.startsWith("#") &&
      !content.code.includes("playwright.config")
    ) {
      await transformWithOxc(content.code, `${article.slug}.jsx`, { lang: "jsx" });
      compiled += 1;
    }
  }
  console.log(
    `PASS: ${reactArticles.length} route entries rendered with complete content and visuals; ${compiled} standalone JSX examples parsed.`,
  );
} finally {
  await server.close();
}
