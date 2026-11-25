// Validates the simulations, depth sections and guided lessons of the System Design courses.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { systemDesignFundamentalsArticles } from "../src/data/systemDesignFundamentals.js";
import { highLevelDesignArticles } from "../src/data/highLevelDesign.js";

const LABEL = 18;
const SUB = 20;
const TOKEN = 20;
const problems = [];
const expect = (ok, message) => ok || problems.push(message);
const text = (value, min, where) =>
  expect(typeof value === "string" && value.trim().length >= min, `${where}: needs at least ${min} characters`);
const pairs = (list, min, textMin, where) => {
  expect(Array.isArray(list) && list.length >= min, `${where}: needs at least ${min} entries`);
  for (const [head, body] of list || []) {
    text(head, 3, `${where} heading`);
    text(body, textMin, `${where} "${head}"`);
  }
  expect(new Set((list || []).map((item) => item[0])).size === (list || []).length, `${where}: repeated heading`);
};

function checkAnimation(anim, key) {
  const nodes = anim.columns.flat();
  const ids = new Set(nodes.map((node) => node.id));
  text(anim.title, 8, `${key} animation title`);
  expect(anim.columns.length >= 2 && anim.columns.length <= 5, `${key}: use 2-5 columns`);
  expect(anim.columns.every((column) => column.length <= 4), `${key}: at most 4 nodes per column`);
  expect(ids.size === nodes.length, `${key}: duplicate node id`);
  for (const node of nodes) {
    expect(node.id && node.label && node.label.length <= LABEL, `${key}: node label "${node.label}"`);
    expect(node.sub.length <= SUB, `${key}: node sub "${node.sub}"`);
  }
  expect(anim.steps.length >= 4 && anim.steps.length <= 9, `${key}: use 4-9 steps`);
  anim.steps.forEach((step, index) => {
    const where = `${key} step ${index + 1}`;
    for (const id of [step.from, ...step.to, ...Object.keys(step.changes)])
      expect(ids.has(id), `${where}: unknown node "${id}"`);
    expect(step.token.length > 0 && step.token.length <= TOKEN, `${where}: token "${step.token}"`);
    text(step.note, 20, `${where} note`);
    for (const { sub } of Object.values(step.changes))
      expect(sub.length > 0 && sub.length <= SUB, `${where}: state "${sub}"`);
  });
  const used = new Set(anim.steps.flatMap((step) => [step.from, ...step.to, ...Object.keys(step.changes)]));
  for (const id of ids) expect(used.has(id), `${key}: node "${id}" is never used`);
  expect(anim.steps.some((step) => Object.keys(step.changes).length), `${key}: no state changes`);
}

const tracks = {
  "system-design-fundamentals": systemDesignFundamentalsArticles,
  "high-level-design": highLevelDesignArticles,
};
const only = process.argv.slice(2);
const files = new Map();
async function load(kind, section) {
  const path = `../src/data/systemDesign/${kind}/${section}.js`;
  if (!files.has(path)) {
    const url = new URL(path, import.meta.url);
    files.set(path, existsSync(url) ? (await import(url)).default : null);
  }
  return files.get(path);
}

let deepCount = 0;
let guidedCount = 0;
const expected = new Map();
const guided = [];
for (const [track, articles] of Object.entries(tracks)) {
  for (const article of articles) {
    if (only.length && !only.includes(article.sectionSlug)) continue;
    if (!article.depth && !article.guided) continue;
    const kind = article.guided ? "lessons" : "deep";
    const data = await load(kind, article.sectionSlug);
    const path = `${kind}/${article.sectionSlug}`;
    expected.set(path, (expected.get(path) || new Set()).add(article.slug));
    const key = `${track}/${article.slug}`;
    const content = data?.[article.slug];
    if (!content) {
      problems.push(`${key}: missing in ${kind}/${article.sectionSlug}.js`);
      continue;
    }
    checkAnimation(content.anim, key);
    text(content.use, 25, `${key} use`);
    text(content.avoid, 25, `${key} avoid`);
    text(content.answer, 60, `${key} answer`);
    pairs(content.qa, 2, 60, `${key} interview`);
    if (kind === "deep") {
      deepCount += 1;
      pairs(content.more, 3, 60, `${key} subtopics`);
    } else {
      guidedCount += 1;
      guided.push([track, article]);
      text(content.intro, 80, `${key} intro`);
      text(content.scene, 100, `${key} scenario`);
      pairs(content.parts, 3, 60, `${key} concepts`);
      pairs(content.example, 4, 35, `${key} example`);
      pairs(content.mistakes, 3, 50, `${key} mistakes`);
      text(content.check, 40, `${key} check`);
      text(content.take, 45, `${key} takeaway`);
      if (content.table) {
        const [caption, head, rows] = content.table;
        expect(caption && rows.length >= 2 && rows.every((row) => row.length === head.length), `${key}: table shape`);
      }
    }
    const prose = JSON.stringify(content);
    expect(!/undefined|\bTODO\b|lorem/i.test(prose.replace(/`[^`]*`/g, "")), `${key}: unfinished text`);
    for (const value of prose.match(/"(?:[^"\\]|\\.)*"/g)) {
      expect((value.match(/`/g) || []).length % 2 === 0 || value.includes("\\n"), `${key}: unbalanced backtick in ${value.slice(0, 60)}`);
      expect((value.match(/\*\*/g) || []).length % 2 === 0, `${key}: unbalanced bold in ${value.slice(0, 60)}`);
    }
  }
}
for (const [path, slugs] of expected)
  for (const slug of Object.keys(files.get(`../src/data/systemDesign/${path}.js`) || {}))
    expect(slugs.has(slug), `${path}.js: "${slug}" is not in the outline`);

if (!problems.length && !only.length) {
  const server = await createServer({
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    for (const [track, article] of guided) {
      const path = `/src/components/system-design/${track}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
      const { default: Article } = await server.ssrLoadModule(path);
      const html = renderToStaticMarkup(createElement(Article));
      for (const id of ["overview", "concepts", "example", "mistakes", "check", "interview"])
        assert.ok(html.includes(`id="${id}"`), `${path}: section ${id}`);
    }
    const { DepthContent } = await server.ssrLoadModule("/src/components/system-design/SystemDesignDepth.jsx");
    const { default: Motion } = await server.ssrLoadModule("/src/components/system-design/SystemDesignMotion.jsx");
    for (const [path, data] of files) {
      if (!path.includes("/deep/")) continue;
      for (const depth of Object.values(data)) {
        renderToStaticMarkup(createElement(DepthContent, { depth }));
        renderToStaticMarkup(createElement(Motion, { animation: depth.anim }));
      }
    }
  } finally {
    await server.close();
  }
}
if (problems.length) {
  console.error(problems.slice(0, 80).join("\n"));
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`Verified ${deepCount} deepened lessons and ${guidedCount} guided lessons with step-by-step simulations.`);
