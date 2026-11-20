// Renders every Java lesson that has a visual (server-side) and checks the visual is in the
// HTML, and that the merged "Java Data Structures" section resolves every lesson's component.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ logLevel: "error", server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const { javaSections, javaArticles } = await server.ssrLoadModule("/src/data/java.js");
  const { JAVA_VISUALS } = await server.ssrLoadModule("/src/components/backend/java/visuals/JavaVisuals.jsx");
  const ds = javaSections.find((section) => section.slug === "java-data-structures");
  assert.ok(ds, "Java Data Structures section missing");
  for (const old of ["data-structures", "java-linked-lists", "java-stacks", "java-queues-deques", "java-hash-tables", "trees-in-java", "graph-networks-in-java"])
    assert.ok(!javaSections.some((section) => section.slug === old), `${old} should be merged`);
  assert.equal(new Set(javaArticles.map((a) => a.slug)).size, javaArticles.length, "duplicate slugs");
  console.log(`Java Data Structures: ${ds.lessons.length} lessons in groups ${ds.groups.join(", ")}`);
  let rendered = 0;
  for (const article of javaArticles) {
    const folder = article.folder || article.sectionSlug;
    const route = `/src/components/backend/java/${folder}/articles/${article.slug}/jsx/Article.jsx`;
    assert.ok(existsSync(`.${route}`), `missing component ${route}`);
    if (!JAVA_VISUALS[article.slug]) continue;
    const { default: Article } = await server.ssrLoadModule(route);
    const html = renderToStaticMarkup(createElement(Article));
    const count = (html.match(/<figure class="jv/g) || []).length;
    assert.equal(count, JAVA_VISUALS[article.slug].length, `${article.slug}: expected ${JAVA_VISUALS[article.slug].length} visuals, got ${count}`);
    rendered += 1;
  }
  for (const slug of Object.keys(JAVA_VISUALS)) assert.ok(javaArticles.some((a) => a.slug === slug), `visual mapped to unknown lesson ${slug}`);
  console.log(`PASS: ${rendered} lessons render their visuals; every lesson component resolves.`);
} finally {
  await server.close();
}
