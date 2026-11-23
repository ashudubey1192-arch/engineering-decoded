// Namaste JavaScript course: validate content, run every example, write outputs + routes.
//   node scripts/build-namaste-js.mjs          validate, run examples, write outputs.json + Article.jsx
//   node scripts/build-namaste-js.mjs --check  validate, re-run examples, compare, SSR-render every route
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { namasteJsArticles } from "../src/data/namasteJs/outline.js";
import { namasteJsLessons } from "../src/data/namasteJs/lessons.js";

const run = promisify(execFile);
const check = process.argv.includes("--check");
const outputsPath = "src/data/namasteJs/outputs.json";
const base = "src/components/frontend/javascript";
const preload = pathToFileURL(resolve("scripts/namaste-js-console.mjs")).href;

// ---------- content shape ----------
const slugs = namasteJsArticles.map((article) => article.slug);
assert.equal(new Set(slugs).size, slugs.length, "duplicate lesson slugs");
assert.deepEqual(Object.keys(namasteJsLessons).sort(), [...slugs].sort(), "lesson content and outline differ");

const rowLimit = { 2: 38, 3: 24, 4: 16 };
let animationSteps = 0;
for (const slug of slugs) {
  const c = namasteJsLessons[slug];
  const where = slug;
  assert.ok(c.intro?.length > 200, `${where}: intro too short`);
  for (const field of ["code", "walkthrough", "exercise", "answer"]) {
    assert.ok(c[field]?.length > (field === "exercise" ? 20 : 60), `${where}: thin ${field}`);
  }
  assert.equal(c.concepts.length, 3, `${where}: needs 3 concepts`);
  for (const concept of c.concepts) assert.ok(concept.length > 80, `${where}: thin concept`);
  assert.ok(c.deepDive.length >= 2, `${where}: needs at least 2 deep-dive sub-topics`);
  for (const part of c.deepDive) {
    assert.ok(part.heading && (part.paragraphs?.length || part.points?.length || part.code), `${where}: empty deep dive`);
  }
  assert.ok(c.mistakes.length >= 2, `${where}: needs at least 2 mistakes`);
  assert.ok(c.interview.length >= 3, `${where}: needs at least 3 interview questions`);
  for (const qa of c.interview) assert.ok(qa.answer.length > 40, `${where}: thin interview answer`);
  assert.ok(["node", "browser"].includes(c.mode), `${where}: bad mode`);
  if (c.mode === "browser") assert.ok(c.sample?.length > 0, `${where}: browser lesson needs sample output`);

  const panes = c.snapshot.panes;
  assert.ok(panes.length >= 2 && panes.length <= 4, `${where}: snapshot needs 2-4 panes`);
  assert.ok(c.snapshot.caption.length > 30, `${where}: snapshot caption too short`);
  for (const pane of panes) {
    assert.ok(pane.rows.length >= 1 && pane.rows.length <= 7, `${where}: pane ${pane.heading} needs 1-7 rows`);
    assert.ok(pane.heading.length <= rowLimit[panes.length], `${where}: pane heading too long: ${pane.heading}`);
    for (const row of pane.rows) {
      const text = row.replace(/^\*/, "");
      assert.ok(text.length <= rowLimit[panes.length], `${where}: snapshot row too long (${text.length}): ${text}`);
    }
  }

  const { nodes, steps } = c.animation;
  assert.ok(nodes.length >= 3 && nodes.length <= 6, `${where}: animation needs 3-6 nodes`);
  assert.ok(steps.length >= 4, `${where}: animation needs at least 4 steps`);
  const ids = new Set(nodes.map((node) => node.id));
  assert.equal(ids.size, nodes.length, `${where}: duplicate node id`);
  for (const node of nodes) {
    assert.ok(node.label.length <= 16, `${where}: node label too long: ${node.label}`);
    assert.ok(!node.sub || node.sub.length <= 20, `${where}: node sub too long: ${node.sub}`);
  }
  assert.equal(new Set(steps.map((step) => step.note)).size, steps.length, `${where}: repeated step note`);
  for (const step of steps) {
    assert.ok(ids.has(step.from) && ids.has(step.to), `${where}: step uses unknown node ${step.from}/${step.to}`);
    assert.ok(step.note.length > 20, `${where}: step note too short`);
    assert.ok(!step.label || step.label.length <= 18, `${where}: token too long: ${step.label}`);
  }
  animationSteps += steps.length;
}

// ---------- run every node example ----------
const dir = mkdtempSync(join(tmpdir(), "namaste-js-"));
const outputs = {};
try {
  const runnable = slugs.filter((slug) => namasteJsLessons[slug].mode === "node");
  for (let index = 0; index < runnable.length; index += 8) {
    await Promise.all(
      runnable.slice(index, index + 8).map(async (slug) => {
        const file = join(dir, `${slug}.cjs`);
        writeFileSync(file, namasteJsLessons[slug].code);
        try {
          const { stdout, stderr } = await run(process.execPath, ["--import", preload, file], { timeout: 15000 });
          assert.equal(stderr, "", `${slug}: wrote to stderr`);
          outputs[slug] = stdout.replace(/\n$/, "");
        } catch (error) {
          throw new Error(`${slug}: example failed\n${error.stderr || error.message}`);
        }
      }),
    );
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
const sorted = Object.fromEntries(Object.keys(outputs).sort().map((key) => [key, outputs[key]]));
for (const [slug, text] of Object.entries(sorted)) assert.ok(text.length > 0, `${slug}: example prints nothing`);

const articleSource = (slug) => `import NamasteJsLesson from "../../../../namaste/NamasteJsLesson";

export default function Article() {
  return <NamasteJsLesson slug="${slug}" />;
}
`;

if (!check) {
  writeFileSync(outputsPath, `${JSON.stringify(sorted, null, 2)}\n`);
  for (const article of namasteJsArticles) {
    const folder = `${base}/${article.sectionSlug}/articles/${article.slug}/jsx`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(`${folder}/Article.jsx`, articleSource(article.slug));
  }
  console.log(
    `Wrote ${namasteJsArticles.length} Namaste JavaScript routes and ${Object.keys(sorted).length} recorded outputs (${animationSteps} animation steps).`,
  );
} else {
  const recorded = JSON.parse(readFileSync(outputsPath, "utf8"));
  assert.deepEqual(recorded, sorted, "outputs.json is stale: run npm run generate:namaste-js");

  const { createServer } = await import("vite");
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const server = await createServer({
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    for (const article of namasteJsArticles) {
      const path = `${base}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
      assert.ok(existsSync(path), `${article.slug}: missing ${path}`);
      assert.equal(readFileSync(path, "utf8"), articleSource(article.slug), `${article.slug}: stale Article.jsx`);
      const { default: Article } = await server.ssrLoadModule(`/${path}`);
      const markup = renderToStaticMarkup(createElement(Article));
      for (const id of ["overview", "concepts", "visuals", "example", "deep-dive", "mistakes", "interview", "check"]) {
        assert.ok(markup.includes(`id="${id}"`), `${article.slug}: missing section ${id}`);
      }
      for (const marker of ["RUNTIME SNAPSHOT", "ANIMATED WALKTHROUGH", "Reveal explanation"]) {
        assert.ok(markup.includes(marker), `${article.slug}: missing ${marker}`);
      }
    }
  } finally {
    await server.close();
  }
  console.log(
    `PASS: ${namasteJsArticles.length} Namaste JavaScript lessons, ${Object.keys(sorted).length} examples re-run and matched, ${animationSteps} animation steps, every route rendered.`,
  );
}
