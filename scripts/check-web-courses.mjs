import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { runInNewContext } from "node:vm";
import { createServer, transformWithOxc } from "vite";
import * as catalog from "../src/data/frontendCourses.js";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
let rendered = 0;
let parsed = 0;
let executed = 0;
const expectedOutputs = {
  "foundations--values-and-types": [["string", "number", "boolean"], ["object"], [true], [false]],
  "foundations--variables": [["Keep going"], [2]],
  "foundations--operators": [["41"], [5], [10], [0], ["Guest"]],
  "foundations--control-flow": [["Goal reached"], [25]],
  "foundations--functions": [["3 lessons left"], [5]],
  "data--objects": [["Object identity"], [30], [true]],
  "data--arrays": [[["CSS", "JS"], 50]],
  "data--maps-and-sets": [["HTML"], [2], [false]],
  "data--immutability": [[false, true], [false], [true]],
  "language--scope-and-closures": [[1, 2, 1]],
  "language--this-keyword": [["Study desk"], ["Study desk"]],
  "language--prototypes": [["Lesson: Prototypes"], [false], [true]],
  "language--classes": [[15]],
  "patterns--functional-programming": [[15]],
  "patterns--composition": [["css-grid"]],
  "patterns--factory-pattern": [[["HTML", "CSS"]]],
  "patterns--pub-sub": [["Completed", 7]],
  "patterns--error-handling": [[15]],
  "quality--debugging": [[15]],
  "quality--documentation": [[2]],
  "advanced--proxy-and-reflect": [[20]],
};
const configExamples = new Set([
  "foundations--compiler-setup",
  "ecosystem--module-resolution",
  "ecosystem--project-references",
]);
try {
  for (const course of ["html", "css", "javascript", "typescript"]) {
    const { [course + "Lessons"]: lessons } = await import(`../src/data/${course}Lessons.js`);
    const articles = catalog[course + "Articles"];
    assert.deepEqual(Object.keys(lessons).sort(), articles.map(({ slug }) => slug).sort());
    for (const article of articles) {
      const lesson = lessons[article.slug];
      for (const field of ["intro", "code", "mistake", "exercise", "answer"]) {
        assert.ok(
          lesson[field]?.length > (field === "exercise" ? 15 : 40),
          `${course}/${article.slug}: incomplete ${field}`,
        );
      }
      assert.equal(lesson.concepts.length, 2);
      assert.equal(lesson.steps.length, 3);
      assert.equal(new Set(lesson.steps.map((step) => step.title)).size, 3);
      for (const concept of lesson.concepts) assert.ok(concept.length > 70);
      for (const step of lesson.steps) {
        assert.ok(step.explanation.length > 25, `${article.slug}: incomplete step`);
        assert.equal(step.nodes.length, 3);
        assert.ok(step.nodes.every((node) => typeof node === "string" && node.length > 0));
      }
      assert.equal(new URL(lesson.reference).protocol, "https:");
      const path = `/src/components/frontend/${course}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
      const { default: Article } = await server.ssrLoadModule(path);
      const markup = renderToStaticMarkup(createElement(Article));
      for (const id of ["overview", "concepts", "example", "mistakes", "check"]) {
        assert.ok(markup.includes(`id="${id}"`), `${path}: missing ${id}`);
      }
      assert.ok(markup.includes("Step-by-step visual walkthrough"));
      assert.ok(markup.includes('aria-pressed="true"'));
      assert.ok(markup.includes('aria-live="polite"'));
      assert.ok(markup.includes("Reveal explanation and expected result"));
      assert.ok(
        !/Replace this placeholder|Add a focused implementation|Explain the terminology/.test(
          markup,
        ),
      );
      rendered += 1;
      if (
        course === "javascript" ||
        (course === "typescript" && !configExamples.has(article.slug))
      ) {
        const lang = course === "typescript" ? "ts" : "js";
        // Parsing verifies source syntax, not runtime APIs or TypeScript semantics.
        await transformWithOxc(lesson.code, `${course}-${article.slug}.${lang}`, { lang });
        parsed += 1;
      }
      if (course === "javascript" && expectedOutputs[article.slug]) {
        const output = [];
        runInNewContext(
          lesson.code,
          { console: { log: (...args) => output.push(args) } },
          { timeout: 1000 },
        );
        assert.deepEqual(
          JSON.parse(JSON.stringify(output)),
          expectedOutputs[article.slug],
          `${article.slug}: incorrect example output`,
        );
        executed += 1;
      }
    }
    console.log(`PASS: ${course} — ${articles.length} complete lessons and 120 visual steps.`);
  }
  console.log(
    `PASS: ${rendered} lesson routes rendered; ${parsed} JavaScript/TypeScript examples parsed.`,
  );
  console.log(
    `PASS: ${executed} standalone JavaScript examples executed with the expected outputs.`,
  );
  console.log(
    "Examples with file markers or prerequisites must be placed in the described practice environment.",
  );
} finally {
  await server.close();
}
