import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { databaseCourses } from "../src/data/databaseCourses.js";
import { databaseLessons, databaseProfiles } from "../src/data/databaseLessons.js";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
let rendered = 0;
try {
  const { getModule } = await server.ssrLoadModule("/src/data/catalog.js");
  const { getStructuredCourse } = await server.ssrLoadModule("/src/data/structuredCourses.js");
  const tracks = getModule("databases").groups.flatMap((group) => group.tracks);
  assert.deepEqual(tracks.map((track) => track.slug).sort(), Object.keys(databaseCourses).sort());
  assert.equal(tracks.length, 22);
  assert.deepEqual(Object.keys(databaseProfiles).sort(), Object.keys(databaseCourses).sort());
  const specificNotes = new Set();
  for (const [courseSlug, course] of Object.entries(databaseCourses)) {
    assert.equal(course.articles.length, 30, courseSlug);
    assert.equal(getStructuredCourse("databases", courseSlug).componentPath, course.componentPath);
    const lessons = databaseLessons[courseSlug];
    assert.deepEqual(
      Object.keys(lessons).sort(),
      course.articles.map((article) => article.slug).sort(),
    );
    for (const article of course.articles) {
      const lesson = lessons[article.slug];
      for (const field of [
        "concept",
        "detail",
        "context",
        "specific",
        "task",
        "answer",
        "mistake",
        "trace",
      ]) {
        assert.ok(
          typeof lesson[field] === "string" && lesson[field].length > 30,
          `${courseSlug}/${article.slug}: ${field}`,
        );
      }
      assert.ok(
        !specificNotes.has(lesson.specific),
        `Repeated course-specific explanation: ${courseSlug}/${article.slug}`,
      );
      specificNotes.add(lesson.specific);
      assert.ok(
        lesson.lab.code.length > 10 && lesson.lab.result.length > 40,
        `${courseSlug}/${article.slug}: incomplete lab`,
      );
      assert.equal(new URL(lesson.reference).protocol, "https:");
      for (const prerequisite of lesson.prerequisites) {
        const slug = prerequisite.href.split("/").at(-1);
        assert.ok(lessons[slug], `Broken prerequisite ${prerequisite.href}`);
      }
      const path = `/src/components/${course.componentPath}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
      const source = await readFile(new URL(`..${path}`, import.meta.url), "utf8");
      assert.ok(
        source.includes(`courseSlug="${courseSlug}"`) &&
          source.includes(`lessonSlug="${article.slug}"`),
      );
      const { default: Article } = await server.ssrLoadModule(path);
      const markup = renderToStaticMarkup(createElement(Article));
      for (const id of ["overview", "concepts", "example", "mistakes", "check"]) {
        assert.ok(markup.includes(`id="${id}"`), `${path}: missing ${id}`);
      }
      assert.ok(markup.includes("Reveal explanation and expected result"));
      assert.ok(markup.includes('aria-live="polite"') && markup.includes('aria-pressed="true"'));
      assert.ok(markup.includes("Official reference"));
      assert.ok(
        !/Replace this placeholder|Add a focused implementation|Explain the terminology|ready for your technical content/.test(
          markup,
        ),
      );
      rendered++;
    }
    for (const file of [
      "Introduction",
      "CoreConcepts",
      "Architecture",
      "PracticalGuide",
      "BestPractices",
      "InterviewQuestions",
    ]) {
      const { default: Article } = await server.ssrLoadModule(
        `/src/components/${course.componentPath}/jsx/${file}.jsx`,
      );
      const markup = renderToStaticMarkup(createElement(Article));
      assert.ok(
        markup.includes("Official reference") && !markup.includes("Replace this starter copy"),
      );
    }
  }
  assert.equal(rendered, 660);
  console.log(
    `Validated ${tracks.length} catalog courses, ${rendered} routed/rendered lessons, unique course explanations, lab prerequisites, references, and reader sections.`,
  );
} finally {
  await server.close();
}
