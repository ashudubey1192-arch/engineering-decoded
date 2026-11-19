// Builds and checks the Core Java course.
//
//   node scripts/build-core-java.mjs                 validate content, write outline.js,
//                                                    route stubs and real program outputs
//   node scripts/build-core-java.mjs --check         verify everything is up to date, every
//                                                    program still prints its stored output,
//                                                    and every route renders
//   --only <section-slug>   limit program runs to one section (fast iteration)
//   --no-run                skip compiling/running programs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { availableParallelism, tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const check = args.includes("--check");
const noRun = args.includes("--no-run");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const dataDir = "src/data/coreJava";
const sectionDir = `${dataDir}/sections`;
const outputDir = `${dataDir}/outputs`;
const componentDir = "src/components/backend/java";
const problems = [];

const files = readdirSync(sectionDir).filter((file) => file.endsWith(".js")).sort();
const sections = [];
for (const file of files) {
  const { default: section } = await import(pathToFileURL(path.resolve(sectionDir, file)).href);
  sections.push({ ...section, file });
}

// ---------- content validation ----------
const allSlugs = new Set();
const fail = (where, message) => problems.push(`${where}: ${message}`);
for (const section of sections) {
  if (!section.lessons.length) fail(section.slug, "no lessons");
  for (const lesson of section.lessons) {
    const where = lesson.slug;
    if (allSlugs.has(where)) fail(where, "duplicate slug");
    allSlugs.add(where);
    if (!(lesson.intro?.length > 150)) fail(where, "intro too short");
    if (!lesson.topics?.length) fail(where, "no topics");
    const titles = new Set();
    for (const [title, text] of lesson.topics ?? []) {
      if (titles.has(title)) fail(where, `duplicate topic ${title}`);
      titles.add(title);
      if (!(text?.length > 80)) fail(where, `thin topic "${title}"`);
    }
    if (!/public\s+(final\s+)?class\s+Main\b/.test(lesson.code ?? "")) fail(where, "code needs public class Main");
    if (!(lesson.walk?.length > 80)) fail(where, "walkthrough too short");
    if (!(lesson.mistakes?.length >= 2)) fail(where, "needs 2+ mistakes");
    if (!(lesson.qa?.length >= 3)) fail(where, "needs 3+ interview questions");
    if (lesson.ex?.length !== 2) fail(where, "ex must be [exercise, answer]");
    const mode = lesson.mode ?? "run";
    if (!["run", "compile", "show"].includes(mode)) fail(where, `bad mode ${mode}`);
    if (mode !== "run" && !lesson.sample) fail(where, "sample output required");
    const [animTitle, nodes = [], steps = []] = lesson.anim ?? [];
    if (!animTitle) fail(where, "animation title missing");
    if (nodes.length < 3 || nodes.length > 6) fail(where, "animation needs 3-6 nodes");
    if (steps.length < 4) fail(where, "animation needs 4+ steps");
    const ids = new Set(nodes.map(([id]) => id));
    if (ids.size !== nodes.length) fail(where, "duplicate node id");
    for (const [, label, sub] of nodes) {
      if (!label || label.length > 16) fail(where, `node label too long: ${label}`);
      if (sub && sub.length > 20) fail(where, `node sub too long: ${sub}`);
    }
    if (new Set(steps.map((step) => step[3])).size !== steps.length) fail(where, "repeated step note");
    for (const [from, to, token, note] of steps) {
      if (!ids.has(from) || !ids.has(to)) fail(where, `step uses unknown node ${from}->${to}`);
      if (!token || token.length > 18) fail(where, `step token too long: ${token}`);
      if (!(note?.length > 20)) fail(where, "step note too short");
    }
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

// ---------- outline + route stubs ----------
const words = (lesson) =>
  [lesson.intro, lesson.walk, ...lesson.topics.flat(), ...lesson.qa.flat()].join(" ").split(/\s+/).length;
const outline = sections.map((section) => ({
  slug: section.slug,
  title: section.title,
  lessons: section.lessons.map((lesson) => ({
    title: lesson.title,
    slug: lesson.slug,
    time: `${Math.max(8, Math.round(words(lesson) / 200 + lesson.code.split("\n").length / 12))} min`,
  })),
}));

function sync(file, content) {
  const current = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (current === content) return;
  if (check) problems.push(`${file} is out of date (run node scripts/build-core-java.mjs)`);
  else {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
}

sync(
  `${dataDir}/outline.js`,
  `// Generated by scripts/build-core-java.mjs from ./sections. Do not edit.\nexport default ${JSON.stringify(outline, null, 2)};\n`,
);
for (const section of sections) {
  for (const lesson of section.lessons) {
    sync(
      `${componentDir}/${section.slug}/articles/${lesson.slug}/jsx/Article.jsx`,
      `import CoreJavaLesson from "../../../../jsx/CoreJavaLesson";
import section from "../../../../../../../data/coreJava/sections/${section.file}";
import outputs from "../../../../../../../data/coreJava/outputs/${section.slug}.json";

export default function Article() {
  return <CoreJavaLesson section={section} slug="${lesson.slug}" output={outputs["${lesson.slug}"]} />;
}
`,
    );
  }
}

// ---------- compile and run every program ----------
function exec(command, commandArgs, { cwd, input, timeout = 60000 }) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, { cwd });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), timeout);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.stdin.end(input ?? "");
  });
}

const clean = (text) =>
  text
    .replaceAll("\r", "")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/^\n+/, "")
    .trimEnd();

async function runLesson(lesson) {
  const mode = lesson.mode ?? "run";
  if (mode === "show") return null;
  const temp = await mkdtemp(path.join(tmpdir(), "core-java-"));
  try {
    await writeFile(path.join(temp, "Main.java"), lesson.code);
    const compiled = await exec("javac", ["--release", "21", "-g", "-Xlint:none", "-nowarn", "Main.java"], { cwd: temp });
    if (compiled.code !== 0) throw new Error(`javac failed\n${compiled.stderr}${compiled.stdout}`);
    if (mode === "compile") return null;
    const result = await exec("java", ["-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", ...(lesson.jvm ?? []), "-cp", ".", "Main"], {
      cwd: temp,
      input: lesson.stdin,
    });
    if (result.code !== 0 && !lesson.exitCode)
      throw new Error(`exit ${result.code}\n${result.stderr}\n${result.stdout}`);
    return clean(result.stdout);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

if (!noRun) {
  const queue = sections
    .filter((section) => !only || section.slug === only)
    .flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
  const results = new Map();
  let ran = 0;
  async function worker() {
    while (queue.length) {
      const { section, lesson } = queue.shift();
      try {
        const output = await runLesson(lesson);
        results.set(lesson.slug, { section, lesson, output });
        ran += 1;
      } catch (error) {
        problems.push(`${lesson.slug}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(2, availableParallelism() - 1) }, worker));

  for (const section of sections) {
    if (only && section.slug !== only) continue;
    const file = `${outputDir}/${section.slug}.json`;
    const stored = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
    const next = {};
    for (const lesson of section.lessons) {
      const result = results.get(lesson.slug);
      if (!result || result.output === null) continue;
      if (check && !lesson.varies && stored[lesson.slug] !== result.output)
        problems.push(`${lesson.slug}: output changed\n--- stored\n${stored[lesson.slug]}\n--- actual\n${result.output}`);
      next[lesson.slug] = check ? (stored[lesson.slug] ?? result.output) : result.output;
    }
    if (!check) {
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
    } else if (JSON.stringify(Object.keys(next).sort()) !== JSON.stringify(Object.keys(stored).sort())) {
      problems.push(`${file}: lesson set changed (run node scripts/build-core-java.mjs)`);
    }
  }
  console.log(`Compiled and ran ${ran} programs.`);
}

// ---------- render every route (check mode) ----------
if (check && !problems.length) {
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
    for (const section of sections)
      for (const lesson of section.lessons) {
        const route = `/${componentDir}/${section.slug}/articles/${lesson.slug}/jsx/Article.jsx`;
        const { default: Article } = await server.ssrLoadModule(route);
        const html = renderToStaticMarkup(createElement(Article));
        for (const id of ["overview", "concepts", "example", "mistakes", "interview", "check"])
          if (!html.includes(`id="${id}"`)) problems.push(`${lesson.slug}: missing section ${id}`);
        if (!html.includes("ANIMATED WALKTHROUGH")) problems.push(`${lesson.slug}: animation not rendered`);
        if (html.includes("(no output)") && (lesson.mode ?? "run") === "run")
          problems.push(`${lesson.slug}: empty output`);
      }
  } finally {
    await server.close();
  }
}

if (problems.length) {
  console.error(problems.join("\n\n"));
  process.exit(1);
}
const lessonCount = sections.reduce((sum, section) => sum + section.lessons.length, 0);
console.log(`${check ? "PASS" : "Built"}: ${sections.length} Core Java sections, ${lessonCount} lessons.`);
