import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { frontendSystemDesignArticles } from "../src/data/frontendSystemDesign.js";
import { frontendSystemDesignLessons } from "../src/data/fsdLessons.js";

// Every outline entry needs complete content, a valid animation, and a route that renders.
const slugs = frontendSystemDesignArticles.map((article) => article.slug);
assert.equal(new Set(slugs).size, slugs.length, "duplicate lesson slugs");
assert.deepEqual(
  Object.keys(frontendSystemDesignLessons).sort(),
  [...slugs].sort(),
  "lesson content and outline differ",
);

const server = await createServer({
  logLevel: "error",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
let steps = 0;
try {
  for (const article of frontendSystemDesignArticles) {
    const content = frontendSystemDesignLessons[article.slug];
    const where = article.slug;
    for (const field of ["intro", "code", "walkthrough", "mistake", "exercise", "answer"]) {
      assert.ok(content[field]?.length > (field === "exercise" ? 15 : 60), `${where}: thin ${field}`);
    }
    assert.ok(content.intro.length > 200, `${where}: intro too short`);
    assert.equal(content.concepts.length, 3, `${where}: needs 3 concepts`);
    assert.equal(content.flow.length, 3, `${where}: needs 3 flow steps`);
    assert.equal(content.reference, null, `${where}: no reference section`);
    assert.ok(content.deepDive.length >= 1, `${where}: needs a deep dive`);

    const { nodes, steps: motion } = content.animation ?? {};
    assert.ok(nodes?.length >= 3 && nodes.length <= 6, `${where}: animation needs 3-6 nodes`);
    assert.ok(motion?.length >= 4, `${where}: animation needs at least 4 steps`);
    const ids = new Set(nodes.map((node) => node.id));
    assert.equal(ids.size, nodes.length, `${where}: duplicate node id`);
    for (const node of nodes) assert.ok(node.label.length <= 16, `${where}: node label too long: ${node.label}`);
    for (const node of nodes) assert.ok(!node.sub || node.sub.length <= 20, `${where}: node sub too long: ${node.sub}`);
    assert.equal(new Set(motion.map((step) => step.note)).size, motion.length, `${where}: repeated step note`);
    for (const step of motion) {
      assert.ok(ids.has(step.from) && ids.has(step.to), `${where}: step uses unknown node`);
      assert.ok(step.note.length > 20, `${where}: step note too short`);
    }
    steps += motion.length;

    const path = `src/components/frontend/frontend-system-design/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
    assert.ok(existsSync(path), `${where}: missing ${path}`);
    assert.ok(readFileSync(path, "utf8").includes(`slug="${article.slug}"`), `${where}: wrong slug`);
    const { default: Article } = await server.ssrLoadModule(`/${path}`);
    const markup = renderToStaticMarkup(createElement(Article));
    for (const id of ["overview", "concepts", "example", "mistakes", "check"]) {
      assert.ok(markup.includes(`id="${id}"`), `${where}: missing ${id}`);
    }
    assert.ok(markup.includes("ANIMATED WALKTHROUGH"), `${where}: animation not rendered`);
    assert.ok(markup.includes("Reveal explanation"), `${where}: missing answer reveal`);
    assert.ok(!/\b(sources|references)\b/i.test(markup.match(/<h[23][^>]*>[^<]*<\/h[23]>/g)?.join(" ") ?? ""), `${where}: sources heading`);
  }
  console.log(
    `PASS: ${slugs.length} Frontend System Design lessons rendered with complete content and ${steps} animation steps.`,
  );
} finally {
  await server.close();
}
