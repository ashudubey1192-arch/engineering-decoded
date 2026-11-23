import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

// Focused rendering avoids unrelated course generation during this regression check.
const server = await createServer({ configFile: false, plugins: [react()], logLevel: "error", optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: "custom" });
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
try {
  const { coreCsRoadmapLessons } = await server.ssrLoadModule("/src/data/coreCsCourses.js");
  const { default: InterviewLab } = await server.ssrLoadModule("/src/components/learning/InterviewLab.jsx");
  let rendered = 0;
  for (const [course, lessons] of Object.entries(coreCsRoadmapLessons)) for (const article of lessons) {
    const html = renderToStaticMarkup(createElement(InterviewLab, { article }));
    const name = `${course}/${article.slug}`;
    const concepts = html.slice(html.indexOf('id="concepts"'), html.indexOf('id="example"'));
    assert.ok(!concepts.includes('class="osMechanism"'), `${name}: example masquerades as subject model`);
    for (const { title, body } of article.lab.explanations || []) {
      assert.ok(html.includes(escape(title)), `${name}: missing heading ${title}`);
      assert.ok(html.includes(escape(body)), `${name}: missing explanation ${title}`);
    }
    for (const node of article.lab.model?.nodes || []) {
      assert.ok(concepts.includes(`data-model-node="${node.id}"`), `${name}: missing ${node.id}`);
      assert.ok(concepts.includes(escape(node.label)), `${name}: missing label ${node.label}`);
    }
    const timeline = html.slice(html.indexOf('aria-label="Walkthrough steps"'), html.indexOf('class="labControls"'));
    assert.equal((timeline.match(/<button /g) || []).length, article.lab.states.length, `${name}: incomplete playback controls`);
    if (article.lab.modelJourney) assert.ok(html.includes(`aria-pressed="true"`), `${name}: no active model part`);
    rendered++;
  }
  console.log(`Rendered ${rendered} OS/network roadmap entries; all authored sections, model nodes, comparison markup, and walkthrough controls checked. This is structural rendering verification, not proof of exhaustive subject knowledge.`);
} finally { await server.close(); }
