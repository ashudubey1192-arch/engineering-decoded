import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { javaStructureLessons, javaStructureSections } from "../src/data/javaStructureLessons.js";
import { javaArticles } from "../src/data/java.js";

const temp = await mkdtemp(path.join(tmpdir(), "java-structures-"));
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  for (const section of javaStructureSections)
    for (const item of section.lessons) {
      const lesson = javaStructureLessons[item.slug];
      assert.ok(javaArticles.some((article) => article.slug === item.slug));
      const route = `/src/components/backend/java/${section.slug}/articles/${item.slug}/jsx/Article.jsx`;
      await readFile(path.join(process.cwd(), route));
      const { default: Article } = await server.ssrLoadModule(route);
      const html = renderToStaticMarkup(createElement(Article));
      for (const text of [
        "Runnable Java example",
        "Step 1 of",
        "Interview practice",
        "Apply it in a project",
      ]) {
        assert.ok(html.includes(text), `${item.slug}: missing ${text}`);
      }
      await writeFile(path.join(temp, "Main.java"), lesson.code);
      const compilerFlags =
        process.env.JAVA_STRUCTURE_SOURCE_CHECK === "1"
          ? ["--source", "21", "--target", "21"]
          : ["--release", "21"];
      execFileSync("javac", [...compilerFlags, "Main.java"], { cwd: temp, stdio: "pipe" });
      const output = execFileSync("java", ["-cp", temp, "Main"], {
        cwd: temp,
        encoding: "utf8",
        timeout: 10000,
      });
      assert.equal(output.replaceAll("\r", "").trim(), lesson.output.trim(), item.slug);
      console.log(`PASS ${item.slug}`);
    }
  console.log(
    `Validated ${Object.keys(javaStructureLessons).length} routes, rendered lessons, and Java example outputs.`,
  );
} finally {
  await server.close();
  await rm(temp, { recursive: true, force: true });
}
